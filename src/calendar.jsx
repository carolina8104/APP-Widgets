const { useState } = React

function Calendar({ apiUrl, expanded, onToggleExpand }) {
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
    <div className="calendar-widget" style={{height: '100%'}}>
      <div className="calendar-header">
        <h2 className="calendar-title">Calendar</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color={'#fff'} />
      </div>
      <div style={{color: '#fff', opacity: 0.6, height: "79.5vh", marginTop: '0.5rem'}}>
        Calendar content placeholder
      </div>
    </div>
  )
}

window.Calendar = Calendar
