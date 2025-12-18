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

        <button className="profile-logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}
