const { useState, useEffect } = React

function Notes({ userId }) {
  const [viewMode, setViewMode] = useState('list')
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  useEffect(() => {
    fetchNotes()
  }, [userId])

  function fetchNotes() {
    fetch('http://localhost:3001/api/notes')
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
        fetchNotes()
      })
      .catch(error => console.error('Error saving note:', error))
  }

  if (viewMode === 'create') {
    return (
      <div>
        <button onClick={() => setViewMode('list')}>
          🡧
        </button>
        <h2>Notes</h2>
        <div>
          <input
            type="text"
            placeholder="New note title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Write your note here..."
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
          />
          <div>
            <button onClick={handleSaveNote}>
              Save
            </button>
            <button onClick={() => setViewMode('list')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2>Notes</h2>
      <h3>Last Notes</h3>
      {loading && <p>Loading...</p>}
      {!loading && notes.length === 0 && <p>No notes. Create your first one!</p>}
      {!loading && notes.length > 0 && (
        <div>
          {notes.slice(0, 4).map((note) => (
            <div key={note._id}>
              <p>{note.title}</p>
              <p>{new Date(note.createdAt).toLocaleDateString('en-EN')}</p>
            </div>
          ))}
        </div>
      )}
      <div
        onClick={() => {
          setNewTitle('')
          setNewContent('')
          setViewMode('create')
        }}
      >
        <h3>Start a New Note 🡥</h3>
      </div>
    </div>
  )
}
