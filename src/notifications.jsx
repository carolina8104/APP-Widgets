const { useState, useEffect } = React

function Notifications({ userId, apiUrl, isMac = false, onFriendAcceptedRef }) {
  const [isOpen, setIsOpen] = useState(false)
  const [friendRequests, setFriendRequests] = useState([])
  const [xpNotifications, setXpNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    fetchNotifications()
    
    const eventSource = new EventSource(`${apiUrl}/api/events`)
    
    eventSource.addEventListener('notification', (e) => {
      const data = JSON.parse(e.data)
      if (data.userId === userId) {
        fetchNotifications()
      }
    })
    
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000)
    
    return () => {
      eventSource.close()
      clearInterval(interval)
    }
  }, [userId])

  const fetchNotifications = async () => {
    try {
      const [friendRes, xpRes] = await Promise.all([
        fetch(`${apiUrl}/api/users/${userId}/friend-requests`),
        fetch(`${apiUrl}/api/users/${userId}/notifications`)
      ])
      
      const friendData = await friendRes.json()
      const xpData = await xpRes.json()
      
      if (!friendData.error) setFriendRequests(friendData)
      if (!xpData.error) setXpNotifications(xpData)
    } catch (err) {
      console.error('Error fetching notifications:', err)
    }
  }

  const handleAccept = async (requestId, fromUserId) => {
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/friend-requests/${requestId}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (!data.error) {
        await fetchNotifications()
        if (onFriendAcceptedRef?.current) {
          onFriendAcceptedRef.current()
        }
      }
    } catch (err) {
      console.error('Error accepting request:', err)
    }
    setLoading(false)
  }

  const handleReject = async (requestId) => {
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/friend-requests/${requestId}/reject`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!data.error) {
        await fetchNotifications()
      }
    } catch (err) {
      console.error('Error rejecting request:', err)
    }
    setLoading(false)
  }

  const handleDismissXP = async (notificationId) => {
    try {
      await fetch(`${apiUrl}/api/notifications/${notificationId}`, {
        method: 'DELETE'
      })
      await fetchNotifications()
    } catch (err) {
      console.error('Error dismissing notification:', err)
    }
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const notificationCount = friendRequests.length + xpNotifications.length
  const allNotifications = [...xpNotifications, ...friendRequests]

  return (
    <div className={`notifications-container ${isMac ? 'mac' : 'windows'}`}>
      <button className="notifications-bell" onClick={toggleOpen} aria-label="Notifications">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/>
        </svg>
        {notificationCount > 0 && (
          <span className="notifications-badge">{notificationCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notifications-overlay" onClick={toggleOpen}></div>
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>Notifications</h3>
              {notificationCount > 0 && (
                <span className="notifications-count">{notificationCount}</span>
              )}
            </div>
            
            <div className="notifications-list">
              {allNotifications.length === 0 ? (
                <div className="notifications-empty">
                  No notifications
                </div>
              ) : (
                notifications.map(notif => (
                  <div key={notif._id} className="notification-item">
                    <div className="notification-content">
                      <div className="notification-avatar">
                        {notif.fromUser.settings?.profilePhoto ? (
                          <img 
                            src={notif.fromUser.settings.profilePhoto.startsWith('/') 
                              ? `${apiUrl}${notif.fromUser.settings.profilePhoto}` 
                              : notif.fromUser.settings.profilePhoto
                            }
                            alt={`${notif.fromUser.username} avatar`} 
                          />
                        ) : (
                          <span>{notif.fromUser.username.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="notification-text">
                        <strong>{notif.fromUser.username}</strong> sent a friends request
                      </div>
                    </div>
                    <div className="notification-actions">
                      <button 
                        className="notification-btn accept"
                        onClick={() => handleAccept(notif._id, notif.fromUser._id)}
                        disabled={loading}
                      >
                        Accept
                      </button>
                      <button 
                        className="notification-btn reject"
                        onClick={() => handleReject(notif._id)}
                        disabled={loading}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
