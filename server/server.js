const http = require('http')
const { URL } = require('url')
const { connect, getCollection } = require('./db')

const { sendJson } = require('./utils/helpers')
const { addSSEClient, removeSSEClient, isUserConnected, broadcastSSE } = require('./utils/sse')
const { serveStatic } = require('./utils/static')

const { handleRegister, handleLogin } = require('./routes/auth')
const { handleGetNotes, handleCreateNote, handleGetNoteById, handleUpdateNote, handleDeleteNote } = require('./routes/notes')
const { handleGetAllTodos, handleGetTodos, handleCreateTodo, handleUpdateTodo, handleDeleteTodo } = require('./routes/todo')
const { handleSearchUser, handleGetUser, handleUpdateUserSettings, handleGetStats, handleGetUserNotifications, handleDeleteNotification, handleUploadProfilePhoto, handleDeleteUserPhoto, handleUploadUserPhotos } = require('./routes/users')
const { handleGetFriendships, handleGetUserFriends, handleGetFriendRequests, handleCreateFriendRequest, handleAcceptFriendRequest, handleRejectFriendRequest } = require('./routes/friends')
const { handleGetCalendarTypes, handleGetTasks, handleCreateTask, handleDeleteTask } = require('./routes/calendar')
const { handleGetEventStickers, handleCreateEventSticker, handleBulkCreateEventStickers, handleDeleteEventSticker } = require('./routes/stickers')

const PORT = process.env.PORT || 80

async function handleApi(message, response) {
  const url = new URL(message.url, `http://${message.headers.host}`)
  if (url.pathname.startsWith('/uploads/')) {
    return serveStatic(url.pathname, response);
  }

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
    const userId = url.searchParams.get('userId')
    
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    })

    response.write('data: {"type":"connected"}\n\n')

    addSSEClient(response, userId)

    message.on('close', async () => {
      const disconnectedUserId = removeSSEClient(response)
      
      if (disconnectedUserId && !isUserConnected(disconnectedUserId)) {
        try {
          const usersCol = getCollection('users')
          const user = await usersCol.findOne({ _id: disconnectedUserId })
          if (user) {
            await usersCol.updateOne(
              { _id: disconnectedUserId },
              { $set: { isOnline: false } }
            )
            broadcastSSE('status-change', { userId: disconnectedUserId, isOnline: false })
          }
        } catch (err) {
          console.error('Error updating user offline status:', err)
        }
      }
    })

    return
  }

  if (url.pathname === '/api/register' && message.method === 'POST') {
    return handleRegister(message, response)
  }

  if (url.pathname === '/api/login' && message.method === 'POST') {
    return handleLogin(message, response)
  }

  if (url.pathname === '/api/notes' && message.method === 'GET') {
    return handleGetNotes(url, response)
  }

  if (url.pathname === '/api/notes' && message.method === 'POST') {
    return handleCreateNote(message, response)
  }

  const notesIdMatch = url.pathname.match(/^\/api\/notes\/([a-zA-Z0-9\-_]+)$/)
  if (notesIdMatch) {
    const id = notesIdMatch[1]

    if (message.method === 'GET') {
      return handleGetNoteById(id, response)
    }

    if (message.method === 'PUT') {
      return handleUpdateNote(id, message, response)
    }

    if (message.method === 'DELETE') {
      return handleDeleteNote(id, response)
    }
  }

  if (url.pathname === '/api/friendship' && message.method === 'GET') {
      return handleGetFriendships(response)
    }

    const friendsMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/friends$/)
    if (friendsMatch && message.method === 'GET') {
      const userId = friendsMatch[1]
      return handleGetUserFriends(userId, response)
    }

  if (url.pathname === '/api/todo/all' && message.method === 'GET') {
    return handleGetAllTodos(url, response)
  }

  if (url.pathname === '/api/todo' && message.method === 'GET') {
    return handleGetTodos(url, response)
  }

  if (url.pathname === '/api/todo' && message.method === 'POST') {
    return handleCreateTodo(message, response)
  }

  const todoMatch = url.pathname.match(/^\/api\/todo\/([a-zA-Z0-9\-_]+)$/)
  if (todoMatch && message.method === 'PUT') {
    const todoId = todoMatch[1]
    return handleUpdateTodo(todoId, message, response)
  }

  if (todoMatch && message.method === 'DELETE') {
    const todoId = todoMatch[1]
    return handleDeleteTodo(todoId, response)
  }

  if (url.pathname === '/api/users/search' && message.method === 'GET') {
    return handleSearchUser(url, response)
  }

  const userMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)$/)
  if (userMatch && message.method === 'GET') {
    const userId = userMatch[1]
    return handleGetUser(userId, response)
  }

  const userSettingsMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/settings$/)
  if (userSettingsMatch && message.method === 'PUT') {
    const userId = userSettingsMatch[1]
    return handleUpdateUserSettings(userId, message, response)
  }

  if (url.pathname === '/api/stats' && message.method === 'GET') {
    return handleGetStats(url, response)
  }

  if (url.pathname === '/api/calendar/types' && message.method === 'GET') {
    return handleGetCalendarTypes(url, response)
  }

  const friendRequestsMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/friend-requests$/)
  if (friendRequestsMatch && message.method === 'GET') {
    const userId = friendRequestsMatch[1]
    return handleGetFriendRequests(userId, response)
  }

  if (url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/notifications$/) && message.method === 'GET') {
    const match = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/notifications$/)
    const userId = match[1]
    return handleGetUserNotifications(userId, response)
  }

  const notificationMatch = url.pathname.match(/^\/api\/notifications\/([a-zA-Z0-9\-_.]+)$/)
  if (notificationMatch && message.method === 'DELETE') {
    const notificationId = notificationMatch[1]
    return handleDeleteNotification(notificationId, response)
  }

  if (url.pathname === '/api/friend-requests' && message.method === 'POST') {
    return handleCreateFriendRequest(message, response)
  }

  const acceptMatch = url.pathname.match(/^\/api\/friend-requests\/([a-zA-Z0-9\-_]+)\/accept$/)
  if (acceptMatch && message.method === 'PUT') {
    const requestId = acceptMatch[1]
    return handleAcceptFriendRequest(requestId, response)
  }

  const rejectMatch = url.pathname.match(/^\/api\/friend-requests\/([a-zA-Z0-9\-_]+)\/reject$/)
  if (rejectMatch && message.method === 'DELETE') {
    const requestId = rejectMatch[1]
    return handleRejectFriendRequest(requestId, response)
  }

  const photoMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/photo$/)
  if (photoMatch && message.method === 'POST') {
    const userId = photoMatch[1]
    return handleUploadProfilePhoto(userId, message, response)
  }

  const photosMatch = url.pathname.match(/^\/api\/users\/([a-zA-Z0-9\-_]+)\/photos$/)
  if (photosMatch && message.method === 'DELETE') {
    const userId = photosMatch[1]
    return handleDeleteUserPhoto(userId, message, response)
  }
  
  if (photosMatch && message.method === 'POST') {
    const userId = photosMatch[1]
    return handleUploadUserPhotos(userId, message, response)
  }

  if (url.pathname === '/api/tasks' && message.method === 'GET') {
    return handleGetTasks(url, response)
  }

  if (url.pathname === '/api/tasks' && message.method === 'POST') {
    return handleCreateTask(message, response)
  }

  const taskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)$/)
  if (taskMatch && message.method === 'DELETE') {
    const taskId = taskMatch[1]
    return handleDeleteTask(taskId, message, response)
  }

  if (url.pathname === '/api/event-stickers' && message.method === 'GET') {
    return handleGetEventStickers(url, response)
  }

  if (url.pathname === '/api/event-stickers' && message.method === 'POST') {
    return handleCreateEventSticker(message, response)
  }

  if (url.pathname === '/api/event-stickers/bulk' && message.method === 'POST') {
    return handleBulkCreateEventStickers(message, response)
  }

  const stickerMatch = url.pathname.match(/^\/api\/event-stickers\/([^/]+)$/)
  if (stickerMatch && message.method === 'DELETE') {
    const eventId = stickerMatch[1]
    return handleDeleteEventSticker(eventId, response)
  }

  sendJson(response, 404, { error: 'Not found' })

}

async function main() {
  await connect()

  try {
    const usersCol = getCollection('users')
    await usersCol.updateMany(
      { isOnline: true },
      { $set: { isOnline: false } }
    )
    console.log('Cleaned up stale online statuses')
  } catch (err) {
    console.error('Error cleaning up online statuses:', err)
  }

  const server = http.createServer(async (message, response) => {
    if (message.url.startsWith('/api/')) {
      await handleApi(message, response)
    } else {
      serveStatic(message.url, response)
    }
  })

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`)
  })
}

main()