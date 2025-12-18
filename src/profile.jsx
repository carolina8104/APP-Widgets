const { useState, useEffect } = React

function Profile({ userId, expanded, onToggleExpand, onLogout }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    
    fetch(`http://localhost:3001/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching user data:', err)
        setLoading(false)
      })
  }, [userId])

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath
    }
    return `http://localhost:3001${photoPath.startsWith('/') ? '' : '/'}${photoPath}`
  }

  const photoUrl = userData?.photos && userData.photos.length > 0 
    ? getPhotoUrl(userData.photos[0]) 
    : null

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h2>Profile</h2>
          <ExpandArrow onClick={onToggleExpand} expanded={expanded} color="var(--bg)" />
        </div>
        <div className="profile-loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color="var(--bg)" />
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <h3 className="profile-section-title">Personal Information</h3>
          
          <div className="profile-info-card">
            <div className="profile-avatar-container">
              {photoUrl ? (
                <div className="profile-avatar">
                  <img src={photoUrl} alt={`${userData?.name} avatar`} />
                </div>
              ) : (
                <div className="profile-avatar profile-avatar-placeholder">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="var(--bg)" strokeWidth="2" />
                    <path d="M6 21c0-3.866 2.686-7 6-7s6 3.134 6 7" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="profile-info-details">
              <div className="profile-info-item">
                <span className="profile-info-label">Name</span>
                <span className="profile-info-value">{userData?.username || 'N/A'}</span>
              </div>
              
              <div className="profile-info-item">
                <span className="profile-info-label">Email</span>
                <span className="profile-info-value">{userData?.email || 'N/A'}</span>
              </div>
              
              <div className="profile-info-item">
                <span className="profile-info-label">Member since</span>
                <span className="profile-info-value">
                  {userData?.createdAt 
                    ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric' 
                      })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 15l-2 5l-1-5l-5-1l5-2l2-5l1 5l5 1l-5 2z" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--bg)" opacity="0.2"/>
              </svg>
            </div>
            <span className="profile-stat-value">{userData?.level || 1}</span>
            <span className="profile-stat-label">Level</span>
          </div>
          
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8l10-12h-9l1-8z" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="var(--bg)" opacity="0.2"/>
              </svg>
            </div>
            <span className="profile-stat-value">{userData?.xp || 0}</span>
            <span className="profile-stat-label">XP</span>
          </div>
          
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--bg)" strokeWidth="2" fill="var(--bg)" opacity="0.2"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="profile-stat-value">{userData?.stickersUnlocked?.length || 0}</span>
            <span className="profile-stat-label">Stickers</span>
          </div>
          
          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="var(--bg)" strokeWidth="2" fill="var(--bg)" opacity="0.2"/>
                <circle cx="8.5" cy="8.5" r="1.5" fill="var(--bg)"/>
                <circle cx="15.5" cy="8.5" r="1.5" fill="var(--bg)"/>
                <circle cx="8.5" cy="15.5" r="1.5" fill="var(--bg)"/>
                <circle cx="15.5" cy="15.5" r="1.5" fill="var(--bg)"/>
              </svg>
            </div>
            <span className="profile-stat-value">{userData?.themesUnlocked?.length || 0}</span>
            <span className="profile-stat-label">Themes</span>
          </div>
        </div>

        <button className="profile-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}
