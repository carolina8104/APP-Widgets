const { useState, useEffect } = React

function Friends({ userId, expanded, onToggleExpand }) {
  const [friends, setFriends] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [viewMode, setViewMode] = useState('list')

  useEffect(() => {
    fetch(`http://localhost:3001/api/users/${userId}/friends`)
      .then(response => response.json())
      .then(data => {
        setFriends(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching friends:', err)
        setLoading(false)
      })
  }, [userId])

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (viewMode === 'progress' && selectedFriend) {
    const photoPathRaw = selectedFriend.photos && selectedFriend.photos.length > 0 ? selectedFriend.photos[0] : null
    let photoUrl = null
    if (photoPathRaw) {
      if (photoPathRaw.startsWith('http://') || photoPathRaw.startsWith('https://')) {
        photoUrl = photoPathRaw
      } else {
        const prefix = photoPathRaw.startsWith('/') ? '' : '/'
        photoUrl = `${window.location.origin}${prefix}${photoPathRaw}`
      }
    }
    
    return (
      <div className="friends-widget friends-progress-view" role="region" aria-label="Friend Progress">
        <div className="fw-header fw-progress-header">
          {photoUrl ? (
            <div className="fw-avatar fw-avatar-large">
              <img src={photoUrl} alt={`${selectedFriend.name} avatar`} />
            </div>
          ) : (
            <div className="fw-avatar fw-avatar-large" aria-hidden></div>
          )}
          <h2 className="fw-title">{selectedFriend.name}</h2>
          <ExpandArrow 
            onClick={() => { 
              setViewMode('list'); 
              setSelectedFriend(null); 
              onToggleExpand(); 
            }} 
            expanded={true} 
            color="var(--bg)" 
          />
        </div>
        <Progress userId={selectedFriend._id} expanded={true} onToggleExpand={() => {}} hideExpandArrow={true} />
      </div>
    )
  }

  return (
    <div className="friends-widget" role="region" aria-label="Friends">
      <div className="fw-header">
        <h2 className="fw-title">Friends</h2>   

        <div className="fw-header-right">
          <label className="fw-search" aria-label="Search friend">
            <input 
              type="search" 
              placeholder="Search friend" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="fw-search-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </label>  
        </div>
      </div>

      <div className="fw-list" role="list">
        {loading ? (
          <div className="fw-loading">Loading...</div>
        ) : filteredFriends.length > 0 ? (
          filteredFriends.map((f, i) => {
            const photoPathRaw = f.photos && f.photos.length > 0 ? f.photos[0] : null
            let photoUrl = null
            if (photoPathRaw) {
              if (photoPathRaw.startsWith('http://') || photoPathRaw.startsWith('https://')) {
                photoUrl = photoPathRaw
              } else {
                const prefix = photoPathRaw.startsWith('/') ? '' : '/'
                photoUrl = `${window.location.origin}${prefix}${photoPathRaw}`
              }
            }
            return (
              <div 
                className="fw-item" 
                key={f._id} 
                role="listitem" 
                tabIndex={0}
                onClick={() => {
                  if (!expanded) onToggleExpand();
                  setSelectedFriend(f);
                  setViewMode('progress');
                }}
                style={{ cursor: 'pointer' }}
              >
                {photoUrl ? (
                  <div className="fw-avatar">
                    <img src={photoUrl} alt={`${f.name} avatar`} />
                  </div>
                ) : (
                  <div className="fw-avatar" aria-hidden></div>
                )}
                <div className="fw-meta">
                  <div className="fw-name">{f.name}</div>
                </div>
                <div className="fw-level">lvl {f.level}</div>
              </div>
            )
          })
        ) : (
          <div className="fw-no-results">No friends found</div>
        )}
        <div className="blank-space"></div>
      </div>
    </div>
  )
}
