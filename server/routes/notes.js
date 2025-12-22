const { getCollection } = require('../db')
const { sendJson, parseBody } = require('../utils/helpers')
const { hasReceivedXPToday, giveXP } = require('../utils/xp')

async function handleGetNotes(url, response) {
  const notesCol = getCollection('notes')
  const userId = url.searchParams.get('userId')
  const filter = userId ? { userId } : {}
  const notes = await notesCol.find(filter).toArray()
  return sendJson(response, 200, notes)
}

async function handleCreateNote(message, response) {
  const body = await parseBody(message)
  const notesCol = getCollection('notes')
  body.createdAt = new Date()
  body.lastModified = new Date()
  const result = await notesCol.insertOne(body)
  
  if (body.userId) {
    const noteCount = await notesCol.countDocuments({ userId: body.userId })
    
    if (noteCount === 1) {
      await giveXP(body.userId, 5, 'You just created your first note!')
    }
    
    if (noteCount % 10 === 0) {
      const rewardReason = 'Created 10+ notes!';
      const alreadyRewarded = await hasReceivedXPToday(body.userId, rewardReason);
      if (!alreadyRewarded) {
        await giveXP(body.userId, 15, rewardReason);
      }
    }
    
    if (body.content && body.content.length > 2000) {
      const alreadyRewardedLong = await hasReceivedXPToday(body.userId, 'You just created a long note! Keep it up!')
      if (!alreadyRewardedLong) {
        await giveXP(body.userId, 10, 'You just created a long note! Keep it up!')
      }
    }
  }
  
  return sendJson(response, 201, { insertedId: result.insertedId, ...body })
}

async function handleGetNoteById(id, response) {
  const notesCol = getCollection('notes')
  const note = await notesCol.findOne({ _id: id })
  return sendJson(response, 200, note || {})
}

async function handleUpdateNote(id, message, response) {
  const body = await parseBody(message)
  body.lastModified = new Date()
  const notesCol = getCollection('notes')
  const note = await notesCol.findOne({ _id: id })
  
  await notesCol.updateOne({ _id: id }, { $set: body })
  
  if (note && note.userId && note.createdAt) {
    const noteAge = Date.now() - new Date(note.createdAt).getTime()
    const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000
    if (noteAge > fiveDaysInMs) {
      const alreadyRewarded = await hasReceivedXPToday(note.userId, 'Its always good to revise old work!')
      if (!alreadyRewarded) {
        await giveXP(note.userId, 5, 'Its always good to revise old work!')
      }
    }
  }
  
  return sendJson(response, 200, { updated: true })
}

async function handleDeleteNote(id, response) {
  const notesCol = getCollection('notes')
  const result = await notesCol.deleteOne({ _id: id })
  if (result.deletedCount === 0) {
    return sendJson(response, 404, { error: 'Note not found' })
  }
  return sendJson(response, 200, { deleted: true })
}

module.exports = {
  handleGetNotes,
  handleCreateNote,
  handleGetNoteById,
  handleUpdateNote,
  handleDeleteNote
}
