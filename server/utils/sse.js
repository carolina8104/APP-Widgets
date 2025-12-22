const sseClients = []

function broadcastSSE(eventType, data) {
  const message = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`
  sseClients.forEach(clientInfo => {
    try {
      clientInfo.response.write(message)
    } catch (error) {
      console.error('Error sending SSE to client:', error)
    }
  })
}

function addSSEClient(response, userId) {
  sseClients.push({ response, userId })
}

function removeSSEClient(response) {
  const index = sseClients.findIndex(c => c.response === response)
  if (index !== -1) {
    const clientInfo = sseClients[index]
    sseClients.splice(index, 1)
    return clientInfo.userId
  }
  return null
}

function isUserConnected(userId) {
  return sseClients.some(c => c.userId === userId)
}

module.exports = { sseClients, broadcastSSE, addSSEClient, removeSSEClient, isUserConnected }
