const { useEffect, useState } = React


function TopBar({apiUrl, userId, onLogout, onProfileClick, onFriendAcceptedRef }) {

  const [isMac, setIsMac] = useState(false)

  useEffect(() => {

    const platform = navigator.platform || navigator.userAgentData?.platform || 'unknown'
    setIsMac(platform.toLowerCase().includes('mac'))
  }, [])

  useEffect(() => {

    const topBarElement = document.getElementById('top-bar')
    if (!topBarElement) return

    const container = document.createElement('div')
    container.className = `top-bar-content ${isMac ? 'mac' : 'windows'}`
    
    const titleDiv = document.createElement('div')
    titleDiv.className = 'top-bar-title'
    titleDiv.textContent = 'NaNo'

    const actionsContainer = document.createElement('div')
    actionsContainer.className = 'top-bar-actions'
    
    container.appendChild(titleDiv)
    container.appendChild(actionsContainer)
    topBarElement.innerHTML = ''
    topBarElement.appendChild(container)

    ReactDOM.render(
      <>
         <Notifications apiUrl={apiUrl} userId={userId} isMac={isMac} onFriendAcceptedRef={onFriendAcceptedRef} />
        <button 
          className="top-bar-profile" 
          onClick={onProfileClick}
          aria-label="Profile"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M6 21c0-3.866 2.686-7 6-7s6 3.134 6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

      </>,
      actionsContainer
    )

    return () => {
      ReactDOM.unmountComponentAtNode(actionsContainer)
    }
  }, [userId, onProfileClick, isMac])

  return null
}
