const { useState, useEffect } = React

function Notes({ userId }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

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
              <p>{new Date(note.createdAt).toLocaleDateString('pt-PT')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
