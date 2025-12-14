const http = require('http')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const bcrypt = require('bcrypt')
const { connect } = require('./db')

const PORT = process.env.PORT || 3001

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
  let filePath = path.join(__dirname, '..', url)

  if (url === '/') {
    filePath = path.join(__dirname, '..', 'index.html')
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      response.writeHead(404, { 'Content-Type': 'text/plain' })
      return response.end('File not found')
    }

    let contentType = 'text/html'
    if (filePath.endsWith('.js')) contentType = 'application/javascript'
    if (filePath.endsWith('.css')) contentType = 'text/css'
    if (filePath.endsWith('.json')) contentType = 'application/json'
    if (filePath.endsWith('.jsx')) contentType = 'application/javascript'

    response.writeHead(200, { 'Content-Type': contentType })
    response.end(data)
  })
}

const { getCollection } = require('./db')

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
      await notesCol.updateOne({ _id: id }, { $set: body })
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
        xp: friend.xp
      }))
      
      return sendJson(response, 200, friendsData)
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