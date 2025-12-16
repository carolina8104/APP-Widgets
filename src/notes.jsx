const { useState, useEffect } = React

function Notes({ userId, expanded, onToggleExpand }) {
  const [viewMode, setViewMode] = useState('list')
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [userId])

  function fetchNotes() {
    fetch('http://localhost:3001/api/notes?userId=' + encodeURIComponent(userId))
      .then(response => response.json())
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setNotes(sorted)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching notes:', error)
        setLoading(false)
      })
  }

  function handleSaveNote() {
    if (!newTitle.trim()) {
      alert('Title is required!')
      return
    }

    fetch('http://localhost:3001/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        _id: `note-${Date.now()}`,
        userId: userId,
        title: newTitle,
        content: newContent,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      })
    })
      .then(res => res.json())
      .then(() => {
        setNewTitle('')
        setNewContent('')
        setViewMode('list')
        onToggleExpand()
        fetchNotes()
      })
      .catch(error => console.error('Error saving note:', error))
  }

  function handleSaveEdit() {
    if (!editTitle.trim()) {
      alert('Title is required!')
      return
    }

    fetch(`http://localhost:3001/api/notes/${selectedNote._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
        lastModified: new Date().toISOString()
      })
    })
      .then(response => response.json())
      .then(() => {
        const updatedNotes = notes.map(note =>
          note._id === selectedNote._id
            ? { ...note, title: editTitle, content: editContent, lastModified: new Date().toISOString() }
            : note
        )
        setNotes(updatedNotes)
        setSelectedNote(null)
        setViewMode('list')
        onToggleExpand()
      })
      .catch(error => {
        console.error('Error updating note:', error)
        alert('Error saving: ' + error.message)
      })
  }

  function handleDeleteNote(noteId) {
    if (!confirm('Delete this note?')) return

    fetch(`http://localhost:3001/api/notes/${noteId}`, { method: 'DELETE' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)
        return response.json()
      })
      .then(() => {
        fetchNotes()
        if (viewMode === 'view') {
          setSelectedNote(null)
          setViewMode('list')
          onToggleExpand()
        }
      })
      .catch(error => {
        console.error('Error deleting note:', error)
        alert('Error deleting note: ' + error.message)
      })
  }

  if (viewMode === 'create') {
    return (
      <div className="notes-container notes-open-mode">
        <div className="notes-open-header" style={{ display: 'flex'}}>
          <h2>Notes</h2>
          <input
            type="text"
            placeholder="New note title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="note-name-input"
            style={{ marginLeft: '1vw', flex: 1 }}
          />
          <ExpandArrow onClick={() => { setViewMode('list'); onToggleExpand(); }} expanded={true} color="var(--bg)" />
        </div>
        <div>
          <textarea
            placeholder="Write your note here..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <div className="notes-open-actions-buttons">
            <button className="regular-button" onClick={handleSaveNote}>Save</button>
            <button className="regular-button" onClick={() => { setViewMode('list'); onToggleExpand(); }}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'view' && selectedNote) {
    return (
      <div className="notes-container notes-open-mode">
        <div className="notes-open-header">
          <h2>{selectedNote.title}</h2>
          <ExpandArrow onClick={() => { setViewMode('list'); onToggleExpand(); }} expanded={true} color="var(--bg)" />
        </div>
        <div>
          <small className="detail-date">
            {new Date(selectedNote.createdAt).toLocaleDateString('en-EN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </small>
          <p>{selectedNote.content}</p>
          <div className="detail-actions">
            <button className="regular-button" onClick={() => {
              setEditTitle(selectedNote.title)
              setEditContent(selectedNote.content)
              setViewMode('edit')
            }}>Edit</button>
            <button className="regular-button" onClick={() => handleDeleteNote(selectedNote._id)}>Delete</button>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'edit' && selectedNote) {
    return (
      <div className="notes-container notes-open-mode">
        <div className="notes-open-header">
          <h2>Edit Note</h2>
          <ExpandArrow onClick={() => { setViewMode('list'); onToggleExpand(); }} expanded={true} color="var(--bg)" />
        </div>
        <div>
          <h2>
            <input
              type="text"
              placeholder="Note title"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              className="note-name-input"
              style={{
                fontSize: 'inherit',
                fontWeight: 'inherit',
                width: '100%',
                padding: 0,
                margin: 0
              }}
            />
          </h2>
          <small className="detail-date">
            {new Date(selectedNote.createdAt).toLocaleDateString('en-EN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </small>
          <textarea
            placeholder="Write your note here..."
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
          <div>
            <button className="regular-button" onClick={handleSaveEdit}>Save</button>
            <button className="regular-button" onClick={() => { setViewMode('list'); onToggleExpand(); }}>Cancel</button>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'all') {
    return (
      <div className="notes-container notes-open-mode">
        <div className="notes-open-header">
          <h2 className="notes-title">All your Notes ({notes.length})</h2>
          <ExpandArrow onClick={() => { setViewMode('list'); onToggleExpand(); }} expanded={true} color="var(--bg)" />
        </div>
        {loading && <p className="loading-text">Loading...</p>}
        {!loading && notes.length === 0 && <p className="text-muted">No notes.</p>}
        {!loading && notes.length > 0 && (
          <div>
            {notes.map((note) => (
              <div
                key={note._id}
                onClick={() => {
                  setSelectedNote(note)
                  setViewMode('view')
                }}
              >
                <h2>{note.title}</h2>
                <small>{new Date(note.createdAt).toLocaleDateString('en-EN')}</small>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteNote(note._id)
                  }}
                >
                  🗑️
                </button>
                <p>
                  {note.content.length > 400
                    ? note.content.slice(0, 400) + '...'
                    : note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="notes-container">
      <h2>Notes</h2>
      <div className="notes-header-row">
        <h3>Last Notes</h3>
        {!loading && notes.length > 2 && (
          <button className="notes-plus-btn" onClick={() => { if (!expanded) onToggleExpand(); setViewMode('all'); }}>+</button>
        )}
      </div>
      {loading && <p>Loading...</p>}
      {!loading && notes.length === 0 && <p>No notes. Create your first one!</p>}
      <div className="last-notes-grid">
        {!loading && notes.slice(0, 2).map((note) => (
          <div className="last-note" key={note._id} onClick={() => {
            if (!expanded) onToggleExpand();
            setSelectedNote(note)
            setViewMode('view')
          }}>
            <p>{note.title.length > 23 ? note.title.slice(0, 23) + '...' : note.title}</p>
            <p>{new Date(note.createdAt).toLocaleDateString('en-EN')}</p>
          </div>
        ))}
      </div>
      <div
        className="note-card-new"
        onClick={() => {
          if (!expanded) onToggleExpand();
          setNewTitle('')
          setNewContent('')
          setViewMode('create')
        }}
      >
        <h3 className="note-card-new-text">Start a New Note 🡥</h3>
      </div>
    </div>
  )
}
