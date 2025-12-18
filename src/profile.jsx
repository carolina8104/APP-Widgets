const { useState, useEffect } = React

function Profile({ userId, expanded, onToggleExpand }) {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Profile</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color="var(--bg)" />
      </div>
    </div>
  )
}
