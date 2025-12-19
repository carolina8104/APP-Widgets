const { useState, useEffect } = React

function Task({ userId, apiUrl, expanded, onToggleExpand }) {
  const [tasks, setTasks] = useState([])

  return (
    <div className="task-container">
      <div className="task-header">
        <h2>Tasks</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} />
      </div>
    </div>
  )
}
