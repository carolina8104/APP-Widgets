const { useState, useEffect } = React

function Calendar({ apiUrl, expanded, onToggleExpand }) {
  const [events, setEvents] = useState([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const weekDates = getWeekDates(currentWeekStart)
  const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const firstDate = weekDates[0]
  const lastDate = weekDates[6]
  const monthName = firstDate.toLocaleString('en-US', { month: 'long' })
  const weekTitle = `Week ${firstDate.getDate()} to ${lastDate.getDate()} of ${monthName}`
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
      </div>
    </div>
  )
}

window.Calendar = Calendar
