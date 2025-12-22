const { getCollection } = require('../db')
const { broadcastSSE } = require('./sse')

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
    
    const oldStickerCount = 1 + Math.floor((oldLevel - 1) / 3)
    const newStickerCount = 1 + Math.floor((newLevel - 1) / 3)
    const unlockedSticker = newStickerCount > oldStickerCount ? true : false
    
    const levelNotification = {
      _id: `notif${Date.now() + 1}`,
      userId,
      type: 'level-up',
      level: newLevel,
      reason: `Congratulations! You leveled up to level ${newLevel}!`,
      unlockedTheme: unlockedTheme || null,
      unlockedSticker: unlockedSticker,
      read: false,
      createdAt: new Date().toISOString()
    }
    
    await notificationsCol.insertOne(levelNotification)
    broadcastSSE('notification', { userId, notification: levelNotification })
  }
  
  return notification
}

module.exports = { hasReceivedXPToday, giveXP }
