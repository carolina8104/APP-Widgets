const bcrypt = require('bcrypt')
const { getCollection } = require('../db')
const { sendJson, parseBody } = require('../utils/helpers')

async function handleRegister(message, response) {
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

async function handleLogin(message, response) {
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

module.exports = { handleRegister, handleLogin }
