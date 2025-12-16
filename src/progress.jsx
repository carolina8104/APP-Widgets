const { useState, useEffect } = React

function Progress({ userId, expanded, onToggleExpand }) {
  return (
    <div className={`progress-container ${expanded ? "progress-expanded" : ""}`}>
      <div className="progress-grid">
        <h2>Progress</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color="var(--bg)" />
        
        <div className="progress-content">
          <p>Today: 1.2h</p>
          <p>This week: 12.3h</p>
        </div>
      </div>
    </div>
  )
}
