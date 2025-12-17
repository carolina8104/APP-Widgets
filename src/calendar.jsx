const { useState } = React

function Calendar({ expanded, onToggleExpand }) {
  return (
    <div className="calendar-widget" style={{height: '100%'}}>
      <div className="calendar-header">
        <h2 className="calendar-title">Calendar</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color={'#fff'} />
      </div>
      <div style={{color: '#fff', opacity: 0.6, height: "86vh", marginTop: '0.5rem'}}>
        Calendar content placeholder
      </div>
    </div>
  )
}

window.Calendar = Calendar
