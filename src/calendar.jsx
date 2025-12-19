const { useState, useEffect } = React

function Calendar({ apiUrl, expanded, onToggleExpand }) {
  const [events, setEvents] = useState([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())

  useEffect(() => {

    const today = new Date()
    const currentWeekDates = getWeekDates(today)
    
    const mockEvents = [
      { title: 'Cinema', time: '22:30h - 00:00h', date: currentWeekDates[6].toISOString().split('T')[0], color: '#ffe066', userId: 'user2' }
    ]
    setEvents(mockEvents)
    
    // fetch(`${apiUrl}/api/calendar`)
    //   .then(res => res.json())
    //   .then(data => setEvents(data || []))
    //   .catch(err => console.error('Error fetching calendar events:', err))
  }, [apiUrl])

  const getWeekDates = (startDate) => {
    const dates = []
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates(currentWeekStart)
  const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const firstDate = weekDates[0]
  const lastDate = weekDates[6]
  const monthName = firstDate.toLocaleString('en-US', { month: 'long' })
  const weekTitle = `Week ${firstDate.getDate()} to ${lastDate.getDate()} of ${monthName}`

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  if (expanded) {
    return (
      <div className="calendar-expanded-container">
        <div className="calendar-main-widget">
          <div className="calendar-header">
            <h2 className="calendar-title">Week 24 to 30 of November</h2>
            <button className="calendar-nav-btn" onClick={goToPreviousWeek}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className="calendar-title">{weekTitle}</h2>
            <button className="calendar-nav-btn" onClick={goToNextWeek}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <ExpandArrow onClick={onToggleExpand} expanded={expanded} color={'#fff'} />
          </div>
          <div style={{color: '#fff', opacity: 0.6, marginTop: '1rem'}}>
            Main calendar with tasks placeholder
          </div>
        </div>

        <div className="calendar-add-task-widget">
          <h3 style={{color: 'var(--bg)', margin: 0, fontSize: '1rem', fontWeight: 600}}>Add new task</h3>
          <button className="calendar-add-task-btn">
            <span>+</span>
          </button>
        </div>

        <div className="calendar-mini-widget">
          <h3 className="calendar-mini-title">November 2025</h3>
          <div className="calendar-placeholder-text">
            Mini calendar placeholder
          </div>
        </div>

        <div className="calendar-sticker-widget">
          <h3 className="calendar-mini-title">Sticker collection</h3>
          <div className="calendar-placeholder-text">
            Sticker collection placeholder
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-compact-header">
        <button className="calendar-nav-btn-compact" onClick={goToPreviousWeek}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="calendar-title-compact">{weekTitle}</h2>
        <button className="calendar-nav-btn-compact" onClick={goToNextWeek}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color={'#fff'} />
      </div>
      <div style={{color: '#fff', opacity: 0.6, height: "79.5vh", marginTop: '0.5rem'}}>
        Calendar content placeholder

      <div className="calendar-week-grid-compact">
        {weekDates.map((date, index) => {
          const dayEvents = getEventsForDay(date)
          return (
            <div key={index} className="calendar-day-column-compact">
              <div className="calendar-day-header-compact">
                <div className="calendar-day-number-compact">{date.getDate()}</div>
                <div className="calendar-day-name-compact">{weekDayNames[index]}</div>
              </div>
              <div className="calendar-events-container-compact">
                {dayEvents.map((event, eventIndex) => (
                  <div 
                    key={eventIndex} 
                    className="calendar-event-compact"
                    style={{ backgroundColor: event.color || '#ffd600' }}
                  >
                    <div className="calendar-event-title-compact">{event.title}</div>
                    <div className="calendar-event-time-compact">{event.time}</div>
                    {event.userId && (
                      <div className="calendar-event-avatar-compact">
                        <div className="calendar-avatar-circle-compact"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

window.Calendar = Calendar
