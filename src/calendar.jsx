const { useState, useEffect } = React

function Calendar({ apiUrl, expanded, onToggleExpand }) {
  const [events, setEvents] = useState([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {

    const today = new Date()
    const currentWeekDates = getWeekDates(today)
    
    const mockEvents = [
      { title: 'Visual class', time: '9:00h - 11:00h', date: currentWeekDates[0].toISOString().split('T')[0], color: '#ffffff', userId: 'user1' },
      { title: 'Meeting DW', time: '11:00h - 11:45h', date: currentWeekDates[0].toISOString().split('T')[0], color: '#c5ff41' },
      { title: 'DS Class', time: '9:00h - 11:00h', date: currentWeekDates[1].toISOString().split('T')[0], color: '#ffffff', userId: 'user1' },
      { title: 'Study session', time: '14:00h - 16:00h', date: currentWeekDates[1].toISOString().split('T')[0], color: '#ff7b54' },
      { title: 'Meeting LE', time: '11:00h - 11:45h', date: currentWeekDates[2].toISOString().split('T')[0], color: '#c5ff41' },
      { title: 'Cafe', time: '16:00h - 17:00h', date: currentWeekDates[2].toISOString().split('T')[0], color: '#ffe066', userId: 'user2' },
      { title: 'LE Class', time: '11:20h', date: currentWeekDates[3].toISOString().split('T')[0], color: '#ffffff' },
      { title: 'English class', time: '13:00h - 14:45h', date: currentWeekDates[4].toISOString().split('T')[0], color: '#ffffff' },
      { title: 'DS projeto', time: '15:00h - 18:30h', date: currentWeekDates[4].toISOString().split('T')[0], color: '#ff7b54' },
      { title: 'Morning run', time: '7:00h - 8:00h', date: currentWeekDates[4].toISOString().split('T')[0], color: '#c5ff41' },
      { title: 'Morning run', time: '7:00h - 8:00h', date: currentWeekDates[5].toISOString().split('T')[0], color: '#c5ff41' },
      { title: 'Meeting DW', time: '11:00h - 11:45h', date: currentWeekDates[5].toISOString().split('T')[0], color: '#c5ff41' },
      { title: 'Almoço família', time: '13:00h - 15:00h', date: currentWeekDates[5].toISOString().split('T')[0], color: '#c5ff41' },
      { title: 'VI projeto', time: '15:30h - 18:00h', date: currentWeekDates[5].toISOString().split('T')[0], color: '#ff7b54' },
      { title: 'DS Class', time: '9:00h - 11:00h', date: currentWeekDates[6].toISOString().split('T')[0], color: '#ffffff', userId: 'user1' },
      { title: 'Gym', time: '14:30h - 16:30h', date: currentWeekDates[6].toISOString().split('T')[0], color: '#ffe066', userId: 'user3' },
      { title: 'Afternoon run', time: '17:00h - 18:00h', date: currentWeekDates[6].toISOString().split('T')[0], color: '#ffe066' },
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

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7
    
    const days = []
    
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      })
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day)
      })
    }
    
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(year, month + 1, day)
      })
    }
    
    return days
  }
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  if (expanded) {
    return (
      <div className="calendar-expanded-container">
        <div className="calendar-main-widget">
          <div className="calendar-header">
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
            <ExpandArrow onClick={onToggleExpand} expanded={expanded} color={'var(--background)'} />
          </div>

          <div className="calendar-week-grid">
            {weekDates.map((date, index) => {
              const dayEvents = getEventsForDay(date)
              return (
                <div key={index} className="calendar-day-column">
                  <div className="calendar-day-header">
                    <div className="calendar-day-number">{date.getDate()}</div>
                    <div className="calendar-day-name">{weekDayNames[index]}</div>
                  </div>
                  <div className="calendar-events-container">
                    {dayEvents.map((event, eventIndex) => (
                      <div 
                        key={eventIndex} 
                        className="calendar-event"
                        style={{ backgroundColor: event.color || '#ffd600' }}
                      >
                        <div className="calendar-event-title">{event.title}</div>
                        <div className="calendar-event-time">{event.time}</div>
                        {event.userId && (
                          <div className="calendar-event-avatar">
                            <div className="calendar-avatar-circle"></div>
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

        <div className="calendar-add-task-widget">
          <h3 style={{color: 'var(--text-default)', margin: 0, fontSize: '1rem', fontWeight: 600}}>Add new task</h3>
          <button className="calendar-add-task-btn">
            <span>+</span>
          </button>
        </div>

        <div className="calendar-mini-widget">
          <div className="mini-calendar-header">
            <button className="mini-calendar-nav" onClick={goToPreviousMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h3 className="mini-calendar-month">
              {miniCalendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="mini-calendar-nav" onClick={goToNextMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="mini-calendar-weekdays">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => (
              <div key={i} className="mini-calendar-weekday">{day}</div>
            ))}
          </div>
          
          <div className="mini-calendar-days">
            {getDaysInMonth(miniCalendarDate).map((dayObj, i) => (
              <div
                key={i}
                className={`mini-calendar-day ${
                  !dayObj.isCurrentMonth ? 'other-month' : ''
                } ${isToday(dayObj.date) ? 'today' : ''} ${
                  isSelected(dayObj.date) ? 'selected' : ''
                }`}
                onClick={() => setSelectedDate(dayObj.date)}
              >
                {dayObj.day}
              </div>
            ))}
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
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color={'var(--background)'} />
      </div>

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
