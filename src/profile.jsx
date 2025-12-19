const { useState, useEffect, useRef } = React

function Profile({ userId, expanded, onToggleExpand, onLogout }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState('')
  const [appearOnline, setAppearOnline] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!userId) return
    
    fetch(`http://localhost:3001/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserData(data)
        const savedTheme = data?.settings?.Theme || 'theme1'
        setSelectedTheme(savedTheme)
        setAppearOnline(data?.settings?.appearOnline ?? true)
        applyTheme(savedTheme)
        setLoading(false)
      })
      .catch(err => {
        setLoading(false)
      })
  }, [userId])

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme)
    applyTheme(theme)
    fetch(`http://localhost:3001/api/users/${userId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Theme: theme })
    })
      .then(res => res.json())
      .catch(err => console.error('Error updating theme:', err))
  }

  const handleAppearOnlineToggle = () => {
    const newValue = !appearOnline
    setAppearOnline(newValue)
    fetch(`http://localhost:3001/api/users/${userId}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appearOnline: newValue })
    })
      .then(res => res.json())
      .catch(err => console.error('Error updating appear online:', err))
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}/photo`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()      
      if (response.ok) {
        setUserData(prev => ({
          ...prev,
          photos: data.photos
        }))
      } else {
        alert('Error uploading photo: ' + data.error)
      }
    } catch (err) {
      alert('Error uploading photo: ' + err.message)
    }
  }

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
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                style={{ display: 'none' }}
              />
              {photoUrl ? (
                <div 
                  className="profile-avatar profile-avatar-editable"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img src={photoUrl} alt={`${userData?.name} avatar`} />
                  <div className="profile-avatar-overlay">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              ) : (
                <div 
                  className="profile-avatar profile-avatar-placeholder profile-avatar-editable"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="var(--bg)" strokeWidth="2" />
                    <path d="M6 21c0-3.866 2.686-7 6-7s6 3.134 6 7" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <div className="profile-avatar-overlay">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </div>
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

        <div style={{ display: 'flex', gap: '2vh', alignItems: 'flex-start' }}>
        <div className="profile-section" style={{ flex: 1 }}>
          <h3 className="profile-section-title">Settings</h3>
          
          <div className="profile-settings-card">
            <div className="profile-setting-item">
              <div className="profile-setting-info">
                <span className="profile-setting-label">Appear Online</span>
                <span className="profile-setting-description">Show status to friends</span>
              </div>
              <label className="profile-toggle">
                <input 
                  type="checkbox" 
                  checked={appearOnline}
                  onChange={handleAppearOnlineToggle}
                />
                <span className="profile-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="profile-section" style={{ flex: 1 }}>
          <h3 className="profile-section-title">Theme</h3>
          <div className="profile-settings-card">
            <div className="profile-themes-row">
            {[
              { id: 'theme1', color1: '#FFE86D', color2: '#F9773B' },
              { id: 'theme2', color1: '#F4721E', color2: '#4D6080' },
              { id: 'theme3', color1: '#F2B5FA', color2: '#A3B665', locked: true },
              { id: 'theme4', color1: '#2801E8', color2: '#FFAED7', locked: true },
              { id: 'theme5', color1: '#D71A21', color2: '#3B393E', locked: true },
              { id: 'theme6', color1: '#FF6B9D', color2: '#C44569', locked: true }
            ].map((theme) => {
              const isUnlocked = userData?.themesUnlocked?.includes(theme.id)
              const isLocked = theme.locked && !isUnlocked
              const isActive = selectedTheme === theme.id
              
              return (
                <div 
                  key={theme.id}
                  className={`profile-theme-dot ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                  onClick={!isLocked ? () => handleThemeChange(theme.id) : undefined}
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.color1} 50%, ${theme.color2} 50%)`
                  }}
                  title={isLocked ? `${theme.id} (Locked)` : theme.id}
                >
                  {isActive && !isLocked && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {isLocked && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="white" strokeWidth="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2"/>
                    </svg>
                  )}
                </div>
              )
            })}
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
