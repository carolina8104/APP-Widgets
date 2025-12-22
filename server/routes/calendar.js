const { getCollection } = require('../db')
const { sendJson, parseBody } = require('../utils/helpers')
const { broadcastSSE } = require('../utils/sse')
const { hasReceivedXPToday, giveXP } = require('../utils/xp')

async function handleGetCalendarTypes(url, response) {
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

async function handleGetTasks(url, response) {
  const tasksCol = getCollection('calendar')
  const usersCol = getCollection('users')
  const userId = url.searchParams.get('userId')
  const filter = userId ? {
    $or: [
      { userId },
      { participants: userId }
    ]
  } : {}
  const tasks = await tasksCol.find(filter).toArray()
  
  const enrichedTasks = await Promise.all(tasks.map(async (task) => {
    if (task.participants && task.participants.length > 0) {
      const participantUsers = await usersCol.find({
        _id: { $in: task.participants }
      }).toArray()
      task.participantPhotos = participantUsers.map(u => ({
        userId: u._id,
        name: u.name || u.username || u._id,
        photo: u.settings && u.settings.profilePhoto ? u.settings.profilePhoto : null
      }))
    }
    return task
  }))
  
  return sendJson(response, 200, enrichedTasks)
}

async function handleCreateTask(message, response) {
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
      participants: body.participants || [],
      createdAt: new Date().toISOString()
    }
    
    await tasksCol.insertOne(newTask)
    if (body.userId) {
      const taskCount = await tasksCol.countDocuments({ userId: body.userId })
      if (taskCount === 1) {
        await giveXP(body.userId, 5, 'You just added your first calendar event!')
      }
      if (taskCount % 20 === 0) {
        const rewardReason = 'Added 20+ calendar events!'
        const alreadyRewarded = await hasReceivedXPToday(body.userId, rewardReason)
        if (!alreadyRewarded) {
          await giveXP(body.userId, 15, rewardReason)
        }
      }
      if (body.calendarDate) {
        const tasksToday = await tasksCol.countDocuments({ userId: body.userId, calendarDate: body.calendarDate })
        if (tasksToday >= 10) {
          const rewardReason = 'Added 10+ events in one day!'
          const alreadyRewarded = await hasReceivedXPToday(body.userId, rewardReason)
          if (!alreadyRewarded) {
            await giveXP(body.userId, 10, rewardReason)
          }
        }
      }
    }
    broadcastSSE('calendar-created', { userId: newTask.userId, task: newTask, participants: newTask.participants })
    if (newTask.participants && newTask.participants.length > 0) {
      const usersCol = getCollection('users')
      const notificationsCol = getCollection('notifications')
      const creator = await usersCol.findOne({ _id: newTask.userId })
      const creatorName = creator ? (creator.username || creator.name || newTask.userId) : newTask.userId
      
      newTask.participants.forEach(async participantId => {
        broadcastSSE('calendar-created', { userId: participantId, task: newTask, participants: newTask.participants })
        
        const notification = {
          _id: `notif${Date.now()}${Math.random()}`,
          userId: participantId,
          type: 'task-added',
          message: `${creatorName} added you to "${newTask.title}"`,
          read: false,
          createdAt: new Date().toISOString(),
          taskId: newTask._id,
          taskTitle: newTask.title,
          taskDate: newTask.calendarDate
        }
        await notificationsCol.insertOne(notification)
        broadcastSSE('notification', { userId: participantId, notification })
      })
    }
    return sendJson(response, 201, newTask)
  } catch (err) {
    return sendJson(response, 500, { error: err.message })
  }
}

async function handleDeleteTask(taskId, message, response) {
  const requestUserId = new URL(message.url, `http://${message.headers.host}`).searchParams.get('userId')
  
  const tasksCol = getCollection('calendar')
  const task = await tasksCol.findOne({ _id: taskId })
  
  if (!task) {
    return sendJson(response, 404, { error: 'Task not found' })
  }
  
  if (task.userId === requestUserId) {
    if (task.participants && task.participants.length > 0) {
      const newOwner = task.participants[0]
      const remainingParticipants = task.participants.slice(1)
      
      await tasksCol.updateOne(
        { _id: taskId },
        { $set: { userId: newOwner, participants: remainingParticipants } }
      )
      
      broadcastSSE('calendar-deleted', { userId: requestUserId, taskId })
      
      broadcastSSE('calendar-created', { userId: newOwner, task: { ...task, userId: newOwner, participants: remainingParticipants } })
      remainingParticipants.forEach(participantId => {
        broadcastSSE('calendar-created', { userId: participantId, task: { ...task, userId: newOwner, participants: remainingParticipants } })
      })
      
      const usersCol = getCollection('users')
      const notificationsCol = getCollection('notifications')
      const leavingUser = await usersCol.findOne({ _id: requestUserId })
      const leavingUserName = leavingUser ? (leavingUser.username || leavingUser.name || requestUserId) : requestUserId
      
      const allParticipants = [newOwner, ...remainingParticipants]
      allParticipants.forEach(async participantId => {
        const notification = {
          _id: `notif${Date.now()}${Math.random()}`,
          userId: participantId,
          type: 'task-left',
          message: `${leavingUserName} left the task "${task.title}"`,
          read: false,
          createdAt: new Date().toISOString(),
          taskId: task._id,
          taskTitle: task.title,
          taskDate: task.calendarDate
        }
        await notificationsCol.insertOne(notification)
        broadcastSSE('notification', { userId: participantId, notification })
      })
      
      return sendJson(response, 200, { deleted: false, removedFromEvent: true })
    } else {
      await tasksCol.deleteOne({ _id: taskId })
      broadcastSSE('calendar-deleted', { userId: task.userId, taskId })
      return sendJson(response, 200, { deleted: true })
    }
  } else {
    if (task.participants && task.participants.includes(requestUserId)) {
      const updatedParticipants = task.participants.filter(p => p !== requestUserId)
      
      await tasksCol.updateOne(
        { _id: taskId },
        { $set: { participants: updatedParticipants } }
      )
      
      broadcastSSE('calendar-deleted', { userId: requestUserId, taskId })
      broadcastSSE('calendar-created', { userId: task.userId, task: { ...task, participants: updatedParticipants } })
      updatedParticipants.forEach(participantId => {
        broadcastSSE('calendar-created', { userId: participantId, task: { ...task, participants: updatedParticipants } })
      })
      
      const usersCol = getCollection('users')
      const notificationsCol = getCollection('notifications')
      const leavingUser = await usersCol.findOne({ _id: requestUserId })
      const leavingUserName = leavingUser ? (leavingUser.username || leavingUser.name || requestUserId) : requestUserId
      
      const allToNotify = [task.userId, ...updatedParticipants]
      allToNotify.forEach(async participantId => {
        const notification = {
          _id: `notif${Date.now()}${Math.random()}`,
          userId: participantId,
          type: 'task-left',
          message: `${leavingUserName} left the task "${task.title}"`,
          read: false,
          createdAt: new Date().toISOString(),
          taskId: task._id,
          taskTitle: task.title,
          taskDate: task.calendarDate
        }
        await notificationsCol.insertOne(notification)
        broadcastSSE('notification', { userId: participantId, notification })
      })
      
      return sendJson(response, 200, { deleted: false, removedFromEvent: true })
    } else {
      return sendJson(response, 403, { error: 'Not authorized to delete this event' })
    }
  }
}

module.exports = {
  handleGetCalendarTypes,
  handleGetTasks,
  handleCreateTask,
  handleDeleteTask
}
