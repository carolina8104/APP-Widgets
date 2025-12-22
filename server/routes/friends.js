const { getCollection } = require('../db')
const { sendJson, parseBody } = require('../utils/helpers')
const { broadcastSSE } = require('../utils/sse')
const { giveXP } = require('../utils/xp')

async function handleGetFriendships(response) {
  const friendshipCol = getCollection('friendship')
  const friendships = await friendshipCol.find({}).toArray()
  return sendJson(response, 200, friendships)
}

async function handleGetUserFriends(userId, response) {
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
  
  const friendsData = friends.map(friend => {
    const appearOnline = friend.settings?.appearOnline ?? true
    const isOnline = appearOnline && (friend.isOnline === true)
    return {
      _id: friend._id,
      name: friend.username,
      level: friend.level,
      email: friend.email,
      xp: friend.xp,
      photos: friend.photos || [],
      profilePhoto: friend.settings && friend.settings.profilePhoto ? friend.settings.profilePhoto : null,
      settings: friend.settings || {},
      isOnline: isOnline
    }
  })
  
  return sendJson(response, 200, friendsData)
}

async function handleGetFriendRequests(userId, response) {
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

async function handleCreateFriendRequest(message, response) {
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

async function handleAcceptFriendRequest(requestId, response) {
  const friendshipCol = getCollection('friendship')
  const usersCol = getCollection('users')

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
    
    const user1 = await usersCol.findOne({ _id: friendship.user1 })
    const user2 = await usersCol.findOne({ _id: friendship.user2 })
    
    if (user1) {
      const friendData1 = {
        _id: user2._id,
        name: user2.username,
        level: user2.level,
        email: user2.email,
        xp: user2.xp,
        photos: user2.photos || [],
        profilePhoto: user2.settings && user2.settings.profilePhoto ? user2.settings.profilePhoto : null,
        settings: user2.settings || {}
      }
      broadcastSSE('friend-added', { userId: friendship.user1, friend: friendData1 })
    }
    
    if (user2) {
      const friendData2 = {
        _id: user1._id,
        name: user1.username,
        level: user1.level,
        email: user1.email,
        xp: user1.xp,
        photos: user1.photos || [],
        profilePhoto: user1.settings && user1.settings.profilePhoto ? user1.settings.profilePhoto : null,
        settings: user1.settings || {}
      }
      broadcastSSE('friend-added', { userId: friendship.user2, friend: friendData2 })
    }
  }

  return sendJson(response, 200, { success: true })
}

async function handleRejectFriendRequest(requestId, response) {
  const friendshipCol = getCollection('friendship')

  await friendshipCol.deleteOne({ _id: requestId })

  return sendJson(response, 200, { success: true })
}

module.exports = {
  handleGetFriendships,
  handleGetUserFriends,
  handleGetFriendRequests,
  handleCreateFriendRequest,
  handleAcceptFriendRequest,
  handleRejectFriendRequest
}
