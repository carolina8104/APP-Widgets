const { getCollection } = require('../db')
const { sendJson, parseBody } = require('../utils/helpers')

async function handleGetEventStickers(url, response) {
  const eventStickersCol = getCollection('eventStickers')
  const userId = url.searchParams.get('userId')
  const filter = userId ? { userId } : {}
  const stickers = await eventStickersCol.find(filter).toArray()
  return sendJson(response, 200, stickers)
}

async function handleCreateEventSticker(message, response) {
  try {
    const body = await parseBody(message)
    const eventStickersCol = getCollection('eventStickers')
    
    await eventStickersCol.deleteOne({ eventId: body.eventId })
    
    const newSticker = {
      _id: `sticker${Date.now()}`,
      eventId: body.eventId,
      stickerId: body.stickerId,
      userId: body.userId,
      createdAt: new Date().toISOString()
    }
    
    await eventStickersCol.insertOne(newSticker)
    return sendJson(response, 201, newSticker)
  } catch (err) {
    return sendJson(response, 500, { error: err.message })
  }
}

async function handleBulkCreateEventStickers(message, response) {
  try {
    const body = await parseBody(message)
    const eventStickersCol = getCollection('eventStickers')
    const items = Array.isArray(body.stickers) ? body.stickers : []

    for (const it of items) {
      if (!it.eventId) continue
      await eventStickersCol.deleteOne({ eventId: it.eventId })
      const doc = {
        _id: `sticker${Date.now()}${Math.floor(Math.random()*1000)}`,
        eventId: it.eventId,
        stickerId: it.stickerId,
        userId: it.userId || null,
        createdAt: new Date().toISOString()
      }
      await eventStickersCol.insertOne(doc)
    }

    return sendJson(response, 200, { saved: items.length })
  } catch (err) {
    return sendJson(response, 500, { error: err.message })
  }
}

async function handleDeleteEventSticker(eventId, response) {
  const eventStickersCol = getCollection('eventStickers')
  const result = await eventStickersCol.deleteOne({ eventId: eventId })
  return sendJson(response, 200, { deleted: true })
}

module.exports = {
  handleGetEventStickers,
  handleCreateEventSticker,
  handleBulkCreateEventStickers,
  handleDeleteEventSticker
}
