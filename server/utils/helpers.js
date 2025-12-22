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

module.exports = { sendJson, parseBody }
