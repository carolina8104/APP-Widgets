const { MongoClient } = require('mongodb')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.MONGO_DB_NAME || 'productivity_app'

let client = null
let db = null

async function connect() {
  if (db) return db

  client = new MongoClient(MONGO_URI)
  await client.connect()
  db = client.db(DB_NAME)

  console.log(`Connected to MongoDB: ${DB_NAME}`)
  return db
}

function getCollection(name) {
  if (!db) throw new Error('MongoDB not connected')
  return db.collection(name)
}

module.exports = { connect, getCollection }
