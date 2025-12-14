const { useState, useEffect } = React

function Friends({ userId, expanded, onToggleExpand }) {
    return (
    <div className="friends-widget">
      <div className="fw-header">
        <h2 className="fw-title">Friends</h2>   

        <div className="fw-header-right">
          <label className="fw-search" aria-label="Search friend">
            <input 
              type="search" 
              placeholder="Search friend" 
            />
            <svg className="fw-search-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </label>
          
          <ExpandArrow onClick={onToggleExpand} expanded={expanded} color="var(--panel)" />
        </div>
      </div>
    </div>
  )
}