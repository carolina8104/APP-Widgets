const fs = require('fs')
const path = require('path')
const { getCollection } = require('../db')
const { sendJson, parseBody } = require('../utils/helpers')
const { broadcastSSE } = require('../utils/sse')
const { giveXP } = require('../utils/xp')

async function handleSearchUser(url, response) {
  const username = url.searchParams.get('username')
  if (!username) {
    return sendJson(response, 400, { error: 'Username required' })
  }
  
  const usersCol = getCollection('users')
  const user = await usersCol.findOne({ username: username })
  
  if (!user) {
    return sendJson(response, 404, { error: 'User not found' })
  }
  
  return sendJson(response, 200, {
    userId: user._id,
    username: user.username,
    level: user.level,
    photos: user.photos || [],
    settings: user.settings || {}
  })
}

async function handleGetUser(userId, response) {
  const usersCol = getCollection('users')
  const user = await usersCol.findOne({ _id: userId })
  if (!user) return sendJson(response, 404, { error: 'User not found' })

  const User = {
    _id: user._id,
    username: user.username,
    email: user.email,
    level: user.level,
    xp: user.xp,
    photos: user.photos || [],
    settings: user.settings || {},
    createdAt: user.createdAt
  }

  return sendJson(response, 200, User)
}

async function handleUpdateUserSettings(userId, message, response) {
  const body = await parseBody(message)
  const usersCol = getCollection('users')
  
  const user = await usersCol.findOne({ _id: userId })
  if (!user) {
    return sendJson(response, 404, { error: 'User not found' })
  }
  
  const updateFields = {}
  if (body.Theme !== undefined) updateFields['settings.Theme'] = body.Theme
  
  if (body.appearOnline !== undefined) {
    updateFields['settings.appearOnline'] = body.appearOnline
    updateFields.isOnline = body.appearOnline
    broadcastSSE('status-change', { userId, isOnline: body.appearOnline })
  }
  
  if (body.isOnline !== undefined) {
    const appearOnline = body.appearOnline ?? user.settings?.appearOnline ?? true
    const effectiveOnline = appearOnline && body.isOnline
    updateFields.isOnline = effectiveOnline
    broadcastSSE('status-change', { userId, isOnline: effectiveOnline })
  }
  
  const result = await usersCol.updateOne(
    { _id: userId },
    { $set: updateFields }
  )
  
  if (result.matchedCount === 0) {
    return sendJson(response, 404, { error: 'User not found' })
  }
  
  return sendJson(response, 200, { success: true, updated: updateFields })
}

async function handleGetStats(url, response) {
  const userId = url.searchParams.get('userId')
  if (!userId) {
    return sendJson(response, 400, { error: 'userId required' })
  }

  const calendarCol = getCollection('calendar')
  const todosCol = getCollection('todo')
  const notesCol = getCollection('notes')
  const friendshipCol = getCollection('friendship')

  const eventsCount = await calendarCol.countDocuments({ userId })
  const tasksCount = await todosCol.countDocuments({ userId })
  const notesCount = await notesCol.countDocuments({ userId })
  
  const friendships = await friendshipCol.find({
    $or: [
      { user1: userId, status: 'accepted' },
      { user2: userId, status: 'accepted' }
    ]
  }).toArray()
  const friendsCount = friendships.length

  return sendJson(response, 200, {
    events: eventsCount,
    tasks: tasksCount,
    notes: notesCount,
    friends: friendsCount
  })
}

async function handleGetUserNotifications(userId, response) {
  const notificationsCol = getCollection('notifications')
  
  const notifications = await notificationsCol.find({ 
    userId,
    read: false
  }).sort({ createdAt: -1 }).toArray()
  
  return sendJson(response, 200, notifications)
}

async function handleDeleteNotification(notificationId, response) {
  const notificationsCol = getCollection('notifications')
  
  await notificationsCol.updateOne(
    { _id: notificationId },
    { $set: { read: true } }
  )
  
  return sendJson(response, 200, { success: true })
}

async function handleUploadProfilePhoto(userId, message, response) {
  const usersCol = getCollection('users')

  return new Promise((resolve) => {
    const chunks = []
    message.on('data', chunk => chunks.push(chunk))
    
    message.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks)          
        
        const contentType = message.headers['content-type']          
        const boundary = contentType?.split('boundary=')[1]
        if (!boundary) {
          sendJson(response, 400, { error: 'No boundary found' })
          return resolve()
        }

        const boundaryBuffer = Buffer.from(`--${boundary}`)
        const parts = []
        let start = 0
        
        while (start < buffer.length) {
          const boundaryIndex = buffer.indexOf(boundaryBuffer, start)
          if (boundaryIndex === -1) break
          
          const nextBoundaryIndex = buffer.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length)
          if (nextBoundaryIndex === -1) break
          
          parts.push(buffer.slice(boundaryIndex + boundaryBuffer.length, nextBoundaryIndex))
          start = nextBoundaryIndex
        }

        let imageData = null
        let filename = 'avatar.jpg'

        for (const part of parts) {
          const partStr = part.toString('utf8', 0, Math.min(500, part.length))
          
          if (partStr.includes('Content-Type: image')) {
            const filenameMatch = partStr.match(/filename="(.+?)"/)
            if (filenameMatch) {
              filename = filenameMatch[1]
            }
            
            const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'))
            if (headerEnd !== -1) {
              imageData = part.slice(headerEnd + 4, part.length - 2)
            }
            break
          }
        }

        if (!imageData || imageData.length === 0) {
          sendJson(response, 400, { error: 'No image data found' })
          return resolve()
        }

        const uploadsBaseDir = path.join(__dirname, '..', '..', 'uploads')
        const userUploadsDir = path.join(uploadsBaseDir, userId)
        const profileDir = path.join(userUploadsDir, 'profile')
                  
        if (!fs.existsSync(profileDir)) {
          fs.mkdirSync(profileDir, { recursive: true })
        }

        try {
          const existingFiles = fs.readdirSync(profileDir)
          existingFiles.forEach(file => {
            if (file.startsWith('profile.')) {
              const oldFilePath = path.join(profileDir, file)
              fs.unlinkSync(oldFilePath)
            }
          })
        } catch (err) {
        }

        const ext = path.extname(filename) || '.jpg'
        const profileFilename = `profile${ext}`
        const filepath = path.join(profileDir, profileFilename)

        fs.writeFileSync(filepath, imageData)

        const photoUrl = `/uploads/${userId}/profile/${profileFilename}`
        
        const userBefore = await usersCol.findOne({ _id: userId })
        const isFirstPhoto = !userBefore?.settings?.profilePhoto
        
        if (!userBefore?.settings || userBefore.settings === null) {
          await usersCol.updateOne(
            { _id: userId },
            { $set: { settings: {} } }
          )
        }
        
        const result = await usersCol.updateOne(
          { _id: userId },
          { $set: { 'settings.profilePhoto': photoUrl } }
        )
        
        if (isFirstPhoto) {
          await giveXP(userId, 5, 'Added first profile photo!')
        }
        
        sendJson(response, 200, { profilePhoto: photoUrl })
        resolve()
      } catch (err) {
        sendJson(response, 500, { error: err.message })
        resolve()
      }
    })
  })
}

async function handleDeleteUserPhoto(userId, message, response) {
  const body = await parseBody(message)
  const usersCol = getCollection('users')
  
  const photoUrl = body.photoUrl
  if (!photoUrl) {
    return sendJson(response, 400, { error: 'photoUrl is required' })
  }
  
  const result = await usersCol.updateOne(
    { _id: userId },
    { $pull: { photos: photoUrl } }
  )
  
  if (photoUrl.startsWith('/uploads/')) {
    const filepath = path.join(__dirname, '..', '..', photoUrl)
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
  }
  
  const user = await usersCol.findOne({ _id: userId })
  return sendJson(response, 200, { photos: user.photos || [] })
}

async function handleUploadUserPhotos(userId, message, response) {
  const usersCol = getCollection('users')

  return new Promise((resolve) => {
    const chunks = []
    message.on('data', chunk => chunks.push(chunk))
    
    message.on('end', async () => {
      try {
        const buffer = Buffer.concat(chunks)          
        
        const contentType = message.headers['content-type']          
        const boundary = contentType?.split('boundary=')[1]
        if (!boundary) {
          sendJson(response, 400, { error: 'No boundary found' })
          return resolve()
        }

        const boundaryBuffer = Buffer.from(`--${boundary}`)
        const parts = []
        let start = 0
        
        while (start < buffer.length) {
          const boundaryIndex = buffer.indexOf(boundaryBuffer, start)
          if (boundaryIndex === -1) break
          
          const nextBoundaryIndex = buffer.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length)
          if (nextBoundaryIndex === -1) break
          
          parts.push(buffer.slice(boundaryIndex + boundaryBuffer.length, nextBoundaryIndex))
          start = nextBoundaryIndex
        }

        let imageData = null
        let filename = 'photo.jpg'

        for (const part of parts) {
          const partStr = part.toString('utf8', 0, Math.min(500, part.length))
          
          if (partStr.includes('Content-Type: image')) {
            const filenameMatch = partStr.match(/filename="(.+?)"/)
            if (filenameMatch) {
              filename = filenameMatch[1]
            }
            
            const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'))
            if (headerEnd !== -1) {
              imageData = part.slice(headerEnd + 4, part.length - 2)
            }
            break
          }
        }

        if (!imageData || imageData.length === 0) {
          sendJson(response, 400, { error: 'No image data found' })
          return resolve()
        }

        const uploadsBaseDir = path.join(__dirname, '..', '..', 'uploads')
        const userUploadsDir = path.join(uploadsBaseDir, userId)
                  
        if (!fs.existsSync(userUploadsDir)) {
          fs.mkdirSync(userUploadsDir, { recursive: true })
        }

        const ext = path.extname(filename) || '.jpg'
        const photoFilename = `photo_${Date.now()}${ext}`
        const filepath = path.join(userUploadsDir, photoFilename)

        fs.writeFileSync(filepath, imageData)

        const photoUrl = `/uploads/${userId}/${photoFilename}`
        
        const result = await usersCol.updateOne(
          { _id: userId },
          { $push: { photos: photoUrl } }
        )
        
        const user = await usersCol.findOne({ _id: userId })
        
        sendJson(response, 200, { photos: user.photos || [] })
        resolve()
      } catch (err) {
        sendJson(response, 500, { error: err.message })
        resolve()
      }
    })
  })
}

module.exports = {
  handleSearchUser,
  handleGetUser,
  handleUpdateUserSettings,
  handleGetStats,
  handleGetUserNotifications,
  handleDeleteNotification,
  handleUploadProfilePhoto,
  handleDeleteUserPhoto,
  handleUploadUserPhotos
}
