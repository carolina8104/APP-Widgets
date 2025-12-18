const { useState, useEffect } = React


const API_URL = 'http://localhost:3001' //10.17.0.27; //localhost:3001

function App() {
    const [currentUser, setCurrentUser] = useState(null)
    const [expandedWidget, setExpandedWidget] = useState(null)
    const [hiddenWidgets, setHiddenWidgets] = useState([])

    const allWidgets = ['friends', 'timeTracker', 'notes', 'tasks', 'photo', 'progress', 'calendar']

    useEffect(() => {
        const savedUser = localStorage.getItem('currentUser')
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser))
            } catch (e) {
                localStorage.removeItem('currentUser')
            }
        }
    }, [])

    const handleLoginSuccess = (userData) => {
        setCurrentUser(userData)
        localStorage.setItem('currentUser', JSON.stringify(userData))
    }

    if (!currentUser) {
        return <Login apiUrl={API_URL} onLoginSuccess={handleLoginSuccess} />
    }

    function handleLogout() {
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
                <Widget color="var(--accent-neon)" content={
                    <Friends
                        userId={currentUser.userId} 
                        apiUrl={API_URL}
                        expanded={expandedWidget === 'friends'}
                        onToggleExpand={() => toggleWidget('friends')}
                    />
                } />
            </div>

            <div className={getWidgetClassName('timeTracker')} 
                 style={{ display: isWidgetVisible('timeTracker') ? 'block' : 'none' }}>
                <Widget color="var(--panel)" content={
                    <TimeTracker 
                        userId={currentUser.userId} 
                        expanded={expandedWidget === 'timeTracker'}
                        onToggleExpand={() => toggleWidget('timeTracker')}
                    />} 
                />
            </div>

            <div className={getWidgetClassName('notes')} 
                 style={{ display: isWidgetVisible('notes') ? 'block' : 'none' }}>
                <Widget color="var(--accent-yellow)" content={
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
                <Widget color="var(--white)" content={
                    <div className="widget-placeholder">
                        <h2 style={{color: 'var(--bg)', margin: 0, fontSize: '1.25rem'}}>Tasks</h2>
                        <p style={{color: 'var(--bg)', opacity: 0.6, fontSize: '0.9rem'}}>Today: 2/8 tasks</p>
                        <p style={{color: 'var(--bg)', height: '49vh', opacity: 0.6, fontSize: '0.9rem'}}>This week: 123 tasks</p>
                    </div>
                } />
            </div>

            <div className={getWidgetClassName('photo')} 
                 style={{ display: isWidgetVisible('photo') ? 'block' : 'none' }}>
                <Widget color="var(--panel)" content={
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
                <Widget color="var(--accent-orange)" content={
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
                <Widget color="var(--panel)" content={
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
                    <Widget color="var(--white)" content={
                        <Profile 
                            userId={currentUser.userId}
                            expanded={true}
                            onToggleExpand={() => toggleWidget('profile')}
                            onLogout={handleLogout}
                        />
                    } />
                </div>
            )}

            </div>
        </>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
