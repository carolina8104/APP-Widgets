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

module.exports = { sseClients, broadcastSSE }
