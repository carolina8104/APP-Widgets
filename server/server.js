const http = require('http')
const fs = require('fs')
const path = require('path')
const { URL } = require('url')
const { connect } = require('./db')

const PORT = process.env.PORT || 3001

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
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
      catch (e) { reject(e); }
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

    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(data)
  })
}

async function handleApi(message, response) {
  const url = new URL(message.url, `http://${message.headers.host}`)

  if (message.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    return response.end()
  }

  sendJson(response, 404, { error: 'API route not found' })
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

  server.listen(PORT)
}

main()