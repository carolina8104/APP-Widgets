const { useState, useEffect } = React

function App() {
    const [expandedWidget, setExpandedWidget] = useState(null)
    const [hiddenWidgets, setHiddenWidgets] = useState([])

    const allWidgets = ['friends', 'timeTracker', 'notes', 'tasks', 'photo', 'progress', 'calendar']

     const toggleWidget = (widgetName) => {
        if (expandedWidget === widgetName) {
            setExpandedWidget(null)
            setHiddenWidgets([])
        } else {
            setExpandedWidget(widgetName)
            const widgetsToHide = allWidgets.filter(w => w !== widgetName)
            setHiddenWidgets(widgetsToHide)
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
        <div className="dashboard-grid">

            <div className={getWidgetClassName('friends')} 
                 style={{ display: isWidgetVisible('friends') ? 'block' : 'none' }}>
                <Widget color="var(--accent-neon)" content={""} />
            </div>

            <div className={getWidgetClassName('timeTracker')} 
                 style={{ display: isWidgetVisible('timeTracker') ? 'block' : 'none' }}>
                <Widget color="var(--panel)" content={
                    <TimeTracker 
                        userId="user123" 
                        expanded={expandedWidget === 'timeTracker'}
                        onToggleExpand={() => toggleWidget('timeTracker')}
                    />} 
                />
            </div>

            <div className={getWidgetClassName('notes')} 
                 style={{ display: isWidgetVisible('notes') ? 'block' : 'none' }}>
                <Widget color="var(--accent-yellow)" content={<Notes userId="user123" />} />
            </div>

            <div className={getWidgetClassName('tasks')} 
                 style={{ display: isWidgetVisible('tasks') ? 'block' : 'none' }}>
                <Widget color="var(--accent-neon)" content={""} />
            </div>

            <div className={getWidgetClassName('photo')} 
                 style={{ display: isWidgetVisible('photo') ? 'block' : 'none' }}>
                <Widget color="var(--accent-neon)" content={""} />
            </div>

            <div className={getWidgetClassName('progress')} 
                 style={{ display: isWidgetVisible('progress') ? 'block' : 'none' }}>
                <Widget color="var(--accent-neon)" content={""} />
            </div>

            <div className={getWidgetClassName('calendar')} 
                 style={{ display: isWidgetVisible('calendar') ? 'block' : 'none' }}>
                <Widget color="var(--accent-neon)" content={""} />
            </div>

        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
