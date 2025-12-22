const fs = require('fs')
const path = require('path')

const STATIC_DIR = process.env.STATIC_DIR || null

function serveStatic(url, response) {

  let safeUrl = url
  if (!safeUrl || safeUrl === '/') {
    safeUrl = '/index.html'
  }

  if (safeUrl.startsWith('/')) safeUrl = safeUrl.slice(1)


  const candidates = []
  if (STATIC_DIR) candidates.push(path.join(STATIC_DIR, safeUrl))
  candidates.push(path.join(__dirname, '..', safeUrl))
  candidates.push(path.join(__dirname, '..', '..', safeUrl))

  let tried = 0
  const tryNext = () => {
    if (tried >= candidates.length) {
      response.writeHead(404, { 'Content-Type': 'text/plain' })
      return response.end('File not found')
    }

    const filePath = candidates[tried++]
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) return tryNext()

      let contentType = 'text/html'
      if (filePath.endsWith('.js')) contentType = 'application/javascript'
      else if (filePath.endsWith('.css')) contentType = 'text/css'
      else if (filePath.endsWith('.json')) contentType = 'application/json'
      else if (filePath.endsWith('.jsx')) contentType = 'application/javascript'
      else if (filePath.endsWith('.png')) contentType = 'image/png'
      else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg'
      else if (filePath.endsWith('.gif')) contentType = 'image/gif'
      else if (filePath.endsWith('.webp')) contentType = 'image/webp'
      else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml'

      response.writeHead(200, { 'Content-Type': contentType })
      const stream = fs.createReadStream(filePath)
      stream.on('error', () => {
        response.writeHead(500, { 'Content-Type': 'text/plain' })
        response.end('Server error')
      })
      stream.pipe(response)
    })
  }

  tryNext()
}

module.exports = { serveStatic }
