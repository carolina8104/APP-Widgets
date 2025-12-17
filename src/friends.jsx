const { useState, useEffect } = React

function Friends({ userId, expanded, onToggleExpand }) {
  const [friends, setFriends] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [addFriendUsername, setAddFriendUsername] = useState('')
  const [userValidation, setUserValidation] = useState(null)
  const [sendingRequest, setSendingRequest] = useState(false)

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

  useEffect(() => {
    if (!expanded) {
      setViewMode('list')
      setSelectedFriend(null)
      setAddFriendUsername('')
      setUserValidation(null)
      setSearchQuery('')
    }
  }, [expanded])

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const checkUsername = async (username) => {
    if (!username.trim()) {
      setUserValidation(null)
      return
    }
    
    try {
      const response = await fetch(`http://localhost:3001/api/users/search?username=${encodeURIComponent(username)}`)
      const data = await response.json()
      
      if (response.ok && data.userId) {
        if (data.userId === userId) {
          setUserValidation({ exists: false, message: "That's you!" })
        } else if (friends.some(f => f._id === data.userId)) {
          setUserValidation({ exists: false, message: 'Already friends' })
        } else {
          setUserValidation({ exists: true, userId: data.userId, username: data.username, photos: data.photos || [] })
        }
      } else {
        setUserValidation({ exists: false, message: 'User not found' })
      }
    } catch (err) {
      console.error('Error checking username:', err)
      setUserValidation({ exists: false, message: 'Error checking user' })
    }
  }

  const sendFriendRequest = async () => {
    if (!userValidation || !userValidation.exists) return
    
    setSendingRequest(true)
    try {
      const response = await fetch('http://localhost:3001/api/friend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: userId,
          toUserId: userValidation.userId
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setUserValidation({ exists: true, message: 'Request sent!', sent: true })
        setAddFriendUsername('')
        setTimeout(() => {
          setViewMode('list')
          setUserValidation(null)
        }, 1500)
      } else {
        setUserValidation({ exists: false, message: data.error || 'Failed to send request' })
      }
    } catch (err) {
      console.error('Error sending friend request:', err)
      setUserValidation({ exists: false, message: 'Error sending request' })
    } finally {
      setSendingRequest(false)
    }
  }

  if (viewMode === 'add-friend') {
    return (
      <div className="friends-widget friends-add-view" role="region" aria-label="Add Friend">
        <div className="fw-header">
          <h2 className="fw-title">Add Friend</h2>
          <ExpandArrow 
            onClick={() => { 
              setViewMode('list')
              setAddFriendUsername('')
              setUserValidation(null)
              onToggleExpand()
            }} 
            expanded={true} 
            color="var(--bg)" 
          />
        </div>
        
        <div className="fw-add-content">
          <p className="fw-add-description">Enter the username of the person you want to add as a friend</p>
          
          <div className="fw-add-input-container">
            <input 
              type="text" 
              className="fw-add-input"
              placeholder="Username" 
              value={addFriendUsername}
              onChange={(e) => {
                setAddFriendUsername(e.target.value)
                setUserValidation(null)
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && addFriendUsername.trim()) {
                  checkUsername(addFriendUsername)
                }
              }}
            />
            <button 
              className="fw-add-check-btn"
              onClick={() => checkUsername(addFriendUsername)}
              disabled={!addFriendUsername.trim()}
            >
              Check
            </button>
          </div>
          
          {userValidation && (
            <div className={`fw-validation ${userValidation.exists ? 'valid' : 'invalid'}`}>
              {userValidation.message || (userValidation.exists ? `Found: ${userValidation.username}` : 'User not found')}
            </div>
          )}
          
          {userValidation && userValidation.exists && !userValidation.sent && (
            <button 
              className="fw-add-send-btn"
              onClick={sendFriendRequest}
              disabled={sendingRequest}
            >
              {sendingRequest ? 'Sending...' : 'Send Friend Request'}
            </button>
          )}
        </div>
      </div>
    )
  }

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
          <h2 className="fw-title">{selectedFriend.name} <span className="fw-level-inline">lvl {selectedFriend.level}</span></h2>
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
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="fw-search-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </label>
          <button 
            className="fw-add-btn"
            onClick={() => {
              if (!expanded) onToggleExpand()
              setViewMode('add-friend')
            }}
            aria-label="Add friend"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
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
