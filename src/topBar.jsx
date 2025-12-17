const { useEffect, useState } = React

function TopBar({ userId, onLogout }) {
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
        <Notifications userId={userId} isMac={isMac} />
        <button className="top-bar-logout" onClick={onLogout}>Logout</button>
      </>,
      actionsContainer
    )

    return () => {
      ReactDOM.unmountComponentAtNode(actionsContainer)
    }
  }, [userId, onLogout, isMac])

  return null
}
