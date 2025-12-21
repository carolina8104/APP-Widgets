const { useState, useEffect, useRef } = React


const API_URL = 'http://localhost:80' //10.17.0.27:80; //localhost:80

function App() {
    const [currentUser, setCurrentUser] = useState(null)
    const [expandedWidget, setExpandedWidget] = useState(null)
    const [hiddenWidgets, setHiddenWidgets] = useState([])
    const onFriendAcceptedRef = useRef(null)

    const allWidgets = ['friends', 'timeTracker', 'notes', 'tasks', 'photo', 'progress', 'calendar']

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser')
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser)
                setCurrentUser(user)
                
                fetch(`${API_URL}/api/users/${user.userId}`)
                    .then(res => res.json())
                    .then(data => {
                        const savedTheme = data?.settings?.Theme || 'theme1'
                        applyTheme(savedTheme)
                    })
                    .catch(err => console.error('Error loading theme:', err))
                
                fetch(`${API_URL}/api/users/${user.userId}/settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isOnline: true })
                })
            } catch (e) {
                localStorage.removeItem('currentUser')
            }
        }

        const handleBeforeUnload = () => {
            const user = localStorage.getItem('currentUser')
            if (user) {
                const { userId } = JSON.parse(user)
                fetch(`${API_URL}/api/users/${userId}/settings`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isOnline: false }),
                    keepalive: true
                })
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [])

    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData)
        localStorage.setItem('currentUser', JSON.stringify(userData))
        
        fetch(`${API_URL}/api/users/${userData.userId}`)
            .then(res => res.json())
            .then(data => {
                const savedTheme = data?.settings?.Theme || 'theme1'
                applyTheme(savedTheme)
            })
            .catch(err => console.error('Error loading theme:', err))
    }

    if (!currentUser) {
        return <Login apiUrl={API_URL} onLoginSuccess={handleLoginSuccess} />
    }

    function handleLogout() {
        if (currentUser) {
            fetch(`${API_URL}/api/users/${currentUser.userId}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isOnline: false })
            }).catch(() => {})
        }
        setCurrentUser(null)
        localStorage.removeItem('currentUser')
    }

    function handleProfileClick() {
        toggleWidget('profile')
    }

     const toggleWidget = (widgetName) => {
        if (expandedWidget === widgetName) {
            setExpandedWidget(null)
            setHiddenWidgets([])
        } else {
            setExpandedWidget(widgetName)
            if (widgetName === 'profile') {
                setHiddenWidgets(allWidgets)
            } else {
                const widgetsToHide = allWidgets.filter(w => w !== widgetName)
                setHiddenWidgets(widgetsToHide)
            }
        }
    }

    const getWidgetClassName = (widgetName) => {
        const classes = [widgetName]
        if (expandedWidget === widgetName) classes.push('widget-expanded')
        if (hiddenWidgets.includes(widgetName)) classes.push('widget-hiding')
        return classes.join(' ')
    }

    const isWidgetVisible = (widgetName) => {
        if (!expandedWidget) return true
        if (expandedWidget === widgetName) return true

        return false
    }

    return (
        <>
            <TopBar 
                apiUrl={API_URL}
                userId={currentUser.userId} 
                onProfileClick={handleProfileClick}
                onLogout={handleLogout}
                onFriendAcceptedRef={onFriendAcceptedRef}
            />
            <div 
                className="dashboard-grid"
                onClick={(e) => {
                    const clickedInsideWidget = e.target.closest('.widget')
                    if (expandedWidget && !clickedInsideWidget) {
                        toggleWidget(expandedWidget)
                    }
                }}
            >
            <div className={getWidgetClassName('friends')} 
                 style={{ display: isWidgetVisible('friends') ? 'block' : 'none' }}>
                <Widget color="var(  --color-primary-1)" content={
                    <Friends
                        userId={currentUser.userId} 
                        apiUrl={API_URL}
                        expanded={expandedWidget === 'friends'}
                        onToggleExpand={() => toggleWidget('friends')}
                        onFriendAccepted={onFriendAcceptedRef}
                    />
                } />
            </div>

            <div className={getWidgetClassName('timeTracker')} 
                 style={{ display: isWidgetVisible('timeTracker') ? 'block' : 'none' }}>
                <Widget color="var(--color-neutral-2)" content={
                    <TimeTracker 
                        userId={currentUser.userId} 
                        expanded={expandedWidget === 'timeTracker'}
                        onToggleExpand={() => toggleWidget('timeTracker')}
                    />} 
                />
            </div>

            <div className={getWidgetClassName('notes')} 
                 style={{ display: isWidgetVisible('notes') ? 'block' : 'none' }}>
                <Widget color="var(--color-primary-2)" content={
                    <Notes 
                        userId={currentUser.userId}
                        apiUrl={API_URL}
                        expanded={expandedWidget === 'notes'}
                        onToggleExpand={() => toggleWidget('notes')}
                    />
                } />
            </div>

            <div className={getWidgetClassName('tasks')} 
                 style={{ display: isWidgetVisible('tasks') ? 'block' : 'none' }}>
                <Widget color="var(--color-neutral-1)" content={
                    <Task
                        userId={currentUser.userId}
                        apiUrl={API_URL}
                        expanded={expandedWidget === 'tasks'}
                        onToggleExpand={() => toggleWidget('tasks')}
                    />
                } />
            </div>

            <div className={getWidgetClassName('photo')} 
                 style={{ display: isWidgetVisible('photo') ? 'block' : 'none' }}>
                <Widget color="var(--color-neutral-2)" content={
                    <Photos 
                        userId={currentUser.userId}
                        apiUrl={API_URL}
                        expanded={expandedWidget === 'photo'}
                        onToggleExpand={() => toggleWidget('photo')}
                    />
                } />
            </div>

            <div className={getWidgetClassName('progress')} 
                 style={{ display: isWidgetVisible('progress') ? 'block' : 'none' }}>
                <Widget color="var(--color-primary-3)" content={
                    <Progress 
                        userId={currentUser.userId}
                        apiUrl={API_URL}
                        expanded={expandedWidget === 'progress'}
                        onToggleExpand={() => toggleWidget('progress')}
                    />
                } />
            </div>

            <div className={getWidgetClassName('calendar')} 
                 style={{ display: isWidgetVisible('calendar') ? 'block' : 'none' }}>
                <Widget color="var(--color-neutral-2)" content={
                    <Calendar 
                        apiUrl={API_URL}
                        expanded={expandedWidget === 'calendar'}
                        onToggleExpand={() => toggleWidget('calendar')}
                    />
                } />
            </div>

            {expandedWidget === 'profile' && (
                <div className="profile widget-expanded" 
                     style={{ display: 'block', gridColumn: '1 / -1', gridRow: '1 / -1' }}>
                    <Widget color="var(--color-neutral-1)" content={
                        <Profile 
                            userId={currentUser.userId}
                            expanded={true}
                            onToggleExpand={() => toggleWidget('profile')}
                            onLogout={handleLogout}
                            apiUrl={API_URL}
                        />
                    } />
                </div>
            )}

            </div>
        </>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
