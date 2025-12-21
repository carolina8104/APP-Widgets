const http = require('http')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const bcrypt = require('bcrypt')
const { connect } = require('./db')

const PORT = process.env.PORT || 3001

const sseClients = []

function broadcastSSE(eventType, data) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
  sseClients.forEach(client => {
    try {
      client.write(message)
    } catch (error) {
      console.error('Error sending SSE to client:', error)
    }
  })
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  })
  response.end(JSON.stringify(payload))
}

function parseBody(message) {
  return new Promise((resolve, reject) => {
    let body = ''
    message.on('data', chunk => body += chunk.toString())
    message.on('end', () => {
      if (!body) return resolve({})
      try { resolve(JSON.parse(body)) }
      catch (e) { reject(e) }
    })
  })
}

function serveStatic(url, response) {

  let safeUrl = url
  if (!safeUrl || safeUrl === '/') {
    safeUrl = '/index.html'
  }

  if (safeUrl.startsWith('/')) safeUrl = safeUrl.slice(1)


  const candidates = [
    path.join(__dirname, safeUrl),
    path.join(__dirname, '..', safeUrl)
  ]

  let tried = 0
  const tryNext = () => {
    if (tried >= candidates.length) {
      response.writeHead(404, { 'Content-Type': 'text/plain' })
      return response.end('File not found')
    }

    const filePath = candidates[tried++]
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) return tryNext()

      let contentType = 'text/html'
      if (filePath.endsWith('.js')) contentType = 'application/javascript'
      else if (filePath.endsWith('.css')) contentType = 'text/css'
      else if (filePath.endsWith('.json')) contentType = 'application/json'
      else if (filePath.endsWith('.jsx')) contentType = 'application/javascript'
      else if (filePath.endsWith('.png')) contentType = 'image/png'
      else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg'
      else if (filePath.endsWith('.gif')) contentType = 'image/gif'
      else if (filePath.endsWith('.webp')) contentType = 'image/webp'
      else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml'

      response.writeHead(200, { 'Content-Type': contentType })
      const stream = fs.createReadStream(filePath)
      stream.on('error', () => {
        response.writeHead(500, { 'Content-Type': 'text/plain' })
        response.end('Server error')
      })
      stream.pipe(response)
    })
  }

  tryNext()
}

const { getCollection } = require('./db')

async function hasReceivedXPToday(userId, reason) {
  const notificationsCol = getCollection('notifications')
  const today = new Date().toISOString().slice(0, 10)
  
  const existingNotification = await notificationsCol.findOne({
    userId,
    type: 'xp',
    reason,
    createdAt: { $gte: today }
  })
  
  return !!existingNotification
}

async function giveXP(userId, amount, reason) {
  const usersCol = getCollection('users')
  const notificationsCol = getCollection('notifications')
  
  const userBefore = await usersCol.findOne({ _id: userId })
  const oldLevel = userBefore?.level || 1
  const oldXP = userBefore?.xp || 0
  const newXP = oldXP + amount
  const newLevel = Math.floor(newXP / 100) + 1
  
  await usersCol.updateOne(
    { _id: userId },
    { 
      $inc: { xp: amount },
      $set: { level: newLevel }
    }
  )
  
  const notification = {
    _id: `notif${Date.now()}`,
    userId,
    type: 'xp',
    amount,
    reason,
    read: false,
    createdAt: new Date().toISOString()
  }
  
  await notificationsCol.insertOne(notification)
  broadcastSSE('notification', { userId, notification })
  
  if (newLevel > oldLevel) {
    const themeUnlocks = {
      5: 'theme3',
      10: 'theme4',
      18: 'theme5',
      26: 'theme6'
    }
    
    const unlockedTheme = themeUnlocks[newLevel]
    
    const levelNotification = {
      _id: `notif${Date.now() + 1}`,
      userId,
      type: 'level-up',
      level: newLevel,
      reason: `Congratulations! You leveled up to level ${newLevel}!`,
      unlockedTheme: unlockedTheme || null,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    await notificationsCol.insertOne(levelNotification)
    broadcastSSE('notification', { userId, notification: levelNotification })
  }
  
  return notification
}

async function handleApi(message, response) {
  const url = new URL(message.url, `http://${message.headers.host}`)

  if (message.method === 'OPTIONS') {
    response.writeHead(204, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    return response.end()
  }

  if (url.pathname === '/api/events' && message.method === 'GET') {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    })

    response.write('data: {"type":"connected"}\n\n')

    sseClients.push(response)

    message.on('close', () => {
      const index = sseClients.indexOf(response)
      if (index !== -1) {
        sseClients.splice(index, 1)
      }
    })

    return
  }

  if (url.pathname === '/api/register' && message.method === 'POST') {
    const body = await parseBody(message)
    const usersCol = getCollection('users')
    
    const existingEmail = await usersCol.findOne({ email: body.email })
    if (existingEmail) {
      return sendJson(response, 400, { error: 'Email already registered' })
    }
    
    const existingUsername = await usersCol.findOne({ username: body.username })
    if (existingUsername) {
      return sendJson(response, 400, { error: 'Username already exists' })
    }
    
    const passwordHash = await bcrypt.hash(body.password, 10)
    
    const newUser = {
      _id: 'user' + Date.now(),
      username: body.username,
      email: body.email,
      passwordHash: passwordHash,
      level: 1,
      xp: 0,
      stickersUnlocked: [],
      themesUnlocked: [],
      photos: [],
      settings: {},
      createdAt: new Date().toISOString()
    }
    
    await usersCol.insertOne(newUser)
    
    return sendJson(response, 201, { 
      userId: newUser._id,
      email: newUser.email,
      name: newUser.username 
    })
  }

  if (url.pathname === '/api/login' && message.method === 'POST') {
    const body = await parseBody(message)
    const usersCol = getCollection('users')
    
    const user = await usersCol.findOne({ email: body.email })
    
    if (!user) {
      return sendJson(response, 401, { error: 'Email not found' })
    }
    
    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash)
    
    if (!isPasswordValid) {
      return sendJson(response, 401, { error: 'Incorrect password' })
    }
    
    return sendJson(response, 200, { 
      userId: user._id,
      email: user.email,
      name: user.username || user.name 
    })
  }

  if (url.pathname === '/api/notes' && message.method === 'GET') {
    const notesCol = getCollection('notes')
    const userId = url.searchParams.get('userId')
    const filter = userId ? { userId } : {}
    const notes = await notesCol.find(filter).toArray()
    return sendJson(response, 200, notes)
  }

  if (url.pathname === '/api/notes' && message.method === 'POST') {
    const body = await parseBody(message)
    const notesCol = getCollection('notes')
    body.createdAt = new Date()
    body.lastModified = new Date()
    const result = await notesCol.insertOne(body)
    
    if (body.userId) {
      const noteCount = await notesCol.countDocuments({ userId: body.userId })
      
      if (noteCount === 1) {
        await giveXP(body.userId, 5, 'You just created your first note!')
      }
      
      if (noteCount % 10 === 0) {
        const rewardReason = `Already ${noteCount} notes created!`;
        const alreadyRewarded = await hasReceivedXPToday(body.userId, rewardReason);
        if (!alreadyRewarded) {
          await giveXP(body.userId, 15, rewardReason);
        }
      }
      
      if (body.content && body.content.length > 2000) {
        const alreadyRewardedLong = await hasReceivedXPToday(body.userId, 'You just created a long note! Keep it up!')
        if (!alreadyRewardedLong) {
          await giveXP(body.userId, 10, 'You just created a long note! Keep it up!')
        }
      }
    }
    
    return sendJson(response, 201, { insertedId: result.insertedId, ...body })
  }

  const notesIdMatch = url.pathname.match(/^\/api\/notes\/([a-zA-Z0-9\-_]+)$/)
  if (notesIdMatch) {
    const id = notesIdMatch[1]
    const notesCol = getCollection('notes')

    if (message.method === 'GET') {
      const note = await notesCol.findOne({ _id: id })
      return sendJson(response, 200, note || {})
    }

    if (message.method === 'PUT') {
      const body = await parseBody(message)
      body.lastModified = new Date()
      const note = await notesCol.findOne({ _id: id })
      
      await notesCol.updateOne({ _id: id }, { $set: body })
      
      if (note && note.userId && note.createdAt) {
        const noteAge = Date.now() - new Date(note.createdAt).getTime()
        const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000
        if (noteAge > fiveDaysInMs) {
          const alreadyRewarded = await hasReceivedXPToday(note.userId, 'Its always good to revise old work!')
          if (!alreadyRewarded) {
            await giveXP(note.userId, 5, 'Its always good to revise old work!')
          }
        }
      }
      
      return sendJson(response, 200, { updated: true })
    }

    if (message.method === 'DELETE') {
      const result = await notesCol.deleteOne({ _id: id })
      if (result.deletedCount === 0) {
        return sendJson(response, 404, { error: 'Note not found' })
      }
      return sendJson(response, 200, { deleted: true })
    }
  }

  if (url.pathname === '/api/friendship' && message.method === 'GET') {
      const friendshipCol = getCollection('friendship')
      const friendships = await friendshipCol.find({}).toArray()
      return sendJson(response, 200, friendships)
    }

    const friendsMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/friends$/)
    if (friendsMatch && message.method === 'GET') {
      const userId = friendsMatch[1]
      const friendshipCol = getCollection('friendship')
      const usersCol = getCollection('users')
      
      const friendships = await friendshipCol.find({
        $or: [
          { user1: userId, status: 'accepted' },
          { user2: userId, status: 'accepted' }
        ]
      }).toArray()
      
      const friendIds = friendships.map(f => 
        f.user1 === userId ? f.user2 : f.user1
      )
      
      const friends = await usersCol.find({
        _id: { $in: friendIds }
      }).toArray()
      
      const friendsData = friends.map(friend => ({
        _id: friend._id,
        name: friend.username,
        level: friend.level,
        email: friend.email,
        xp: friend.xp,
        photos: friend.photos || [],
        settings: friend.settings || {}
      }))
      
      return sendJson(response, 200, friendsData)
    }

  if (url.pathname === '/api/todo/all' && message.method === 'GET') {
    const todosCol = getCollection('todo')
    const userId = url.searchParams.get('userId')
    const filter = userId ? { userId: userId } : {}
    const todos = await todosCol.find(filter).toArray()
    return sendJson(response, 200, todos)
  }

  if (url.pathname === '/api/todo' && message.method === 'GET') {
    const todosCol = getCollection('todo')
    const userId = url.searchParams.get('userId')
    const filter = userId ? { userId: userId, deleted: { $ne: true } } : { deleted: { $ne: true } }
    const todos = await todosCol.find(filter).toArray()
    return sendJson(response, 200, todos)
  }

  if (url.pathname === '/api/todo' && message.method === 'POST') {
    const body = await parseBody(message)
    const todosCol = getCollection('todo')
    
    const newTodo = {
      _id: `todo${Date.now()}`,
      userId: body.userId,
      content: body.content,
      completed: body.completed || 'false',
      createdAt: body.createdAt || new Date().toISOString()
    }
    
    await todosCol.insertOne(newTodo)
    
    if (body.userId) {
      const taskCount = await todosCol.countDocuments({ userId: body.userId })
      if (taskCount === 1) {
        await giveXP(body.userId, 5, 'You just created your first task!')
      }
    }
    
    broadcastSSE('todo-created', { userId: body.userId, todo: newTodo })
    
    return sendJson(response, 201, newTodo)
  }

  const todoMatch = url.pathname.match(/^\/api\/todo\/([a-zA-Z0-9\-_]+)$/)
  if (todoMatch && message.method === 'PUT') {
    const todoId = todoMatch[1]
    const body = await parseBody(message)
    const todosCol = getCollection('todo')
    
    const updateData = {}
    if (body.completed !== undefined) {
      updateData.completed = body.completed
      if (body.completed === 'true' || body.completed === true) {
        updateData.completedAt = new Date().toISOString()
      } else {
        updateData.completedAt = null
      }
    }
    if (body.content !== undefined) updateData.content = body.content
    
    const todo = await todosCol.findOne({ _id: todoId })
    
    await todosCol.updateOne(
      { _id: todoId },
      { $set: updateData }
    )
    
    if (todo && todo.userId && (body.completed === 'true' || body.completed === true)) {
      const today = new Date().toISOString().slice(0, 10)
      const completedTodayCount = await todosCol.countDocuments({
        userId: todo.userId,
        completed: 'true',
        completedAt: { $gte: today }
      })
      
      if (completedTodayCount % 10 === 0) {
        const rewardReason = `Completed ${completedTodayCount} tasks today!`
        const alreadyRewarded = await hasReceivedXPToday(todo.userId, rewardReason)
        if (!alreadyRewarded) {
          await giveXP(todo.userId, 10, rewardReason)
        }
      }
      
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const weekStart = oneWeekAgo.toISOString()
      
      const completedThisWeekCount = await todosCol.countDocuments({
        userId: todo.userId,
        completed: 'true',
        completedAt: { $gte: weekStart }
      })
      
      if (completedThisWeekCount >= 150) {
        const alreadyRewardedWeek = await hasReceivedXPToday(todo.userId, 'Completed 150+ tasks this week!')
        if (!alreadyRewardedWeek) {
          await giveXP(todo.userId, 20, 'Completed 150+ tasks this week!')
        }
      }
      
      let streak = 0
      let hasStreak = true
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date()
        checkDate.setDate(checkDate.getDate() - i)
        const dayStart = checkDate.toISOString().slice(0, 10)
        
        const completedThatDay = await todosCol.countDocuments({
          userId: todo.userId,
          completed: 'true',
          completedAt: { $gte: dayStart, $lt: dayStart + 'T23:59:59' }
        })
        
        if (completedThatDay >= 7) {
          streak++
        } else {
          hasStreak = false
          break
        }
      }
      
      if (streak >= 7 && hasStreak) {
        const alreadyRewardedStreak = await hasReceivedXPToday(todo.userId, '7-day streak: 7+ tasks daily!')
        if (!alreadyRewardedStreak) {
          await giveXP(todo.userId, 25, '7-day streak: 7+ tasks daily!')
        }
      }
    }
    
    if (todo) {
      broadcastSSE('todo-updated', { userId: todo.userId, todoId, updates: updateData })
    }
    
    return sendJson(response, 200, { success: true, ...updateData })
  }

  if (todoMatch && message.method === 'DELETE') {
    const todoId = todoMatch[1]
    const todosCol = getCollection('todo')
    
    const todo = await todosCol.findOne({ _id: todoId })
    
    await todosCol.updateOne(
      { _id: todoId },
      { $set: { deleted: true } }
    )
    
    if (todo) {
      broadcastSSE('todo-deleted', { userId: todo.userId, todoId })
    }
    
    return sendJson(response, 200, { success: true })
  }

  if (url.pathname === '/api/users/search' && message.method === 'GET') {
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

  const userMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)$/)
  if (userMatch && message.method === 'GET') {
    const userId = userMatch[1]
    const usersCol = getCollection('users')
    const user = await usersCol.findOne({ _id: userId })
    if (!user) return sendJson(response, 404, { error: 'User not found' })

    const User = {
      _id: user._id,
      username: user.username,
      email: user.email,
      level: user.level,
      xp: user.xp,
      stickersUnlocked: user.stickersUnlocked || [],
      photos: user.photos || [],
      settings: user.settings || {},
      createdAt: user.createdAt
    }

    return sendJson(response, 200, User)
  }

  const userSettingsMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/settings$/)
  if (userSettingsMatch && message.method === 'PUT') {
    const userId = userSettingsMatch[1]
    const body = await parseBody(message)
    const usersCol = getCollection('users')
    
    const updateFields = {}
    if (body.Theme !== undefined) updateFields['settings.Theme'] = body.Theme
    if (body.appearOnline !== undefined) {
      updateFields['settings.appearOnline'] = body.appearOnline
      updateFields.isOnline = body.appearOnline
      broadcastSSE('status-change', { userId, isOnline: body.appearOnline })
    }
    if (body.isOnline !== undefined) {
      updateFields.isOnline = body.isOnline
      broadcastSSE('status-change', { userId, isOnline: body.isOnline })
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

  if (url.pathname === '/api/stats' && message.method === 'GET') {
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

  if (url.pathname === '/api/calendar/types' && message.method === 'GET') {
    const userId = url.searchParams.get('userId')
    if (!userId) {
      return sendJson(response, 400, { error: 'userId required' })
    }

    const calendarCol = getCollection('calendar')
    const events = await calendarCol.find({ userId }).toArray()
    
    const typeCounts = {}
    events.forEach(event => {
      const type = event.type || 'other'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })

    return sendJson(response, 200, typeCounts)
  }

  const friendRequestsMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/friend-requests$/)
  if (friendRequestsMatch && message.method === 'GET') {
    const userId = friendRequestsMatch[1]
    const friendshipCol = getCollection('friendship')
    const usersCol = getCollection('users')

    const pendingRequests = await friendshipCol.find({
      user2: userId,
      status: 'pending'
    }).toArray()

    const requestsWithUserData = await Promise.all(
      pendingRequests.map(async (request) => {
        const fromUser = await usersCol.findOne({ _id: request.user1 })
        if (!fromUser) return null
        return {
          _id: request._id,
          fromUser: {
            _id: fromUser._id,
            username: fromUser.username,
            level: fromUser.level,
            photos: fromUser.photos || [],
            settings: fromUser.settings || {}
          },
          createdAt: request.createdAt
        }
      })
    )

    const validRequests = requestsWithUserData.filter(r => r !== null)

    return sendJson(response, 200, validRequests)
  }

  if (url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/notifications$/) && message.method === 'GET') {
    const match = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/notifications$/)
    const userId = match[1]
    const notificationsCol = getCollection('notifications')
    
    const notifications = await notificationsCol.find({ 
      userId,
      read: false
    }).sort({ createdAt: -1 }).toArray()
    
    return sendJson(response, 200, notifications)
  }

  const notificationMatch = url.pathname.match(/^\/api\/notifications\/([a-zA-Z0-9\-_]+)$/)
  if (notificationMatch && message.method === 'DELETE') {
    const notificationId = notificationMatch[1]
    const notificationsCol = getCollection('notifications')
    
    await notificationsCol.updateOne(
      { _id: notificationId },
      { $set: { read: true } }
    )
    
    return sendJson(response, 200, { success: true })
  }

  if (url.pathname === '/api/friend-requests' && message.method === 'POST') {
    const body = await parseBody(message)
    const { fromUserId, toUserId } = body
    
    if (!fromUserId || !toUserId) {
      return sendJson(response, 400, { error: 'Both fromUserId and toUserId are required' })
    }
    
    if (fromUserId === toUserId) {
      return sendJson(response, 400, { error: 'Cannot send friend request to yourself' })
    }
    
    const friendshipCol = getCollection('friendship')
    const usersCol = getCollection('users')
    
    const toUser = await usersCol.findOne({ _id: toUserId })
    if (!toUser) {
      return sendJson(response, 404, { error: 'User not found' })
    }
    
    const existingFriendship = await friendshipCol.findOne({
      $or: [
        { user1: fromUserId, user2: toUserId },
        { user1: toUserId, user2: fromUserId }
      ]
    })
    
    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return sendJson(response, 400, { error: 'Already friends' })
      } else {
        return sendJson(response, 400, { error: 'Friend request already exists' })
      }
    }
    
    const newRequest = {
      _id: 'req' + Date.now(),
      user1: fromUserId,
      user2: toUserId,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    await friendshipCol.insertOne(newRequest)
    
    return sendJson(response, 201, { 
      success: true,
      requestId: newRequest._id
    })
  }

  const acceptMatch = url.pathname.match(/^\/api\/friend-requests\/([a-zA-Z0-9\-_]+)\/accept$/)
  if (acceptMatch && message.method === 'PUT') {
    const requestId = acceptMatch[1]
    const friendshipCol = getCollection('friendship')

    const friendship = await friendshipCol.findOne({ _id: requestId })

    await friendshipCol.updateOne(
      { _id: requestId },
      { $set: { status: 'accepted' } }
    )
    
    if (friendship) {
      if (friendship.user1) {
        await giveXP(friendship.user1, 10, 'Added a new friend!')
      }
      if (friendship.user2) {
        await giveXP(friendship.user2, 10, 'Added a new friend!')
      }
    }

    return sendJson(response, 200, { success: true })
  }

  const rejectMatch = url.pathname.match(/^\/api\/friend-requests\/([a-zA-Z0-9\-_]+)\/reject$/)
  if (rejectMatch && message.method === 'DELETE') {
    const requestId = rejectMatch[1]
    const friendshipCol = getCollection('friendship')

    await friendshipCol.deleteOne({ _id: requestId })

    return sendJson(response, 200, { success: true })
  }

  const photoMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/photo$/)
  if (photoMatch && message.method === 'POST') {
    const userId = photoMatch[1]
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

          const uploadsBaseDir = path.join(__dirname, '..', 'uploads')
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

  const photosMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/photos$/)
  if (photosMatch && message.method === 'POST') {
    const userId = photosMatch[1]
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

          const uploadsBaseDir = path.join(__dirname, '..', 'uploads')
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

  if (url.pathname === '/api/tasks' && message.method === 'GET') {
    const tasksCol = getCollection('calendar')
    const tasks = await tasksCol.find().toArray()
    return sendJson(response, 200, tasks)
  }

  if (url.pathname === '/api/tasks' && message.method === 'POST') {
    try {
      const body = await parseBody(message)
      const tasksCol = getCollection('calendar')
      
      const newTask = {
        _id: `task${Date.now()}`,
        userId: body.userId || 'user123',
        title: body.title,
        description: body.description || '',
        type: body.type || 'study',
        difficulty: body.difficulty || 'medium',
        startTime: body.startTime,
        endTime: body.endTime,
        duration: body.duration || 3600,
        completed: body.completed || false,
        calendarDate: body.calendarDate,
        xpEarned: 0,
        createdAt: new Date().toISOString()
      }
      
      await tasksCol.insertOne(newTask)
      return sendJson(response, 201, newTask)
    } catch (err) {
      return sendJson(response, 500, { error: err.message })
    }
  }

  sendJson(response, 404, { error: 'Not found' })

}

async function main() {
  await connect()

  const server = http.createServer(async (message, response) => {
    if (message.url.startsWith('/api/')) {
      await handleApi(message, response)
    } else {
      serveStatic(message.url, response)
    }
  })

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

main()