const http = require('http')
const fs = require('fs')
const path = require('path')
const { connect } = require('./db')

const PORT = process.env.PORT || 3001

function serveStatic(url, res) {
  let filePath = path.join(__dirname, '..', url)

  if (url === '/') {
    filePath = path.join(__dirname, '..', 'index.html')
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      return res.end('File not found')
    }

    let contentType = 'text/html'
    if (filePath.endsWith('.js')) contentType = 'application/javascript'
    if (filePath.endsWith('.css')) contentType = 'text/css'

    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  });
}

async function main() {
  await connect()

  const server = http.createServer((req, res) => {
    serveStatic(req.url, res)
  });

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

main()