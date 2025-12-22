const { getCollection } = require('../db')
const { sendJson, parseBody } = require('../utils/helpers')
const { broadcastSSE } = require('../utils/sse')
const { hasReceivedXPToday, giveXP } = require('../utils/xp')

async function handleGetAllTodos(url, response) {
  const todosCol = getCollection('todo')
  const userId = url.searchParams.get('userId')
  const filter = userId ? { userId: userId } : {}
  const todos = await todosCol.find(filter).toArray()
  return sendJson(response, 200, todos)
}

async function handleGetTodos(url, response) {
  const todosCol = getCollection('todo')
  const userId = url.searchParams.get('userId')
  const filter = userId ? { userId: userId, deleted: { $ne: true } } : { deleted: { $ne: true } }
  const todos = await todosCol.find(filter).toArray()
  return sendJson(response, 200, todos)
}

async function handleCreateTodo(message, response) {
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

async function handleUpdateTodo(todoId, message, response) {
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
      const rewardReason = 'Completed 10+ tasks today!'
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

async function handleDeleteTodo(todoId, response) {
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

module.exports = {
  handleGetAllTodos,
  handleGetTodos,
  handleCreateTodo,
  handleUpdateTodo,
  handleDeleteTodo
}
