const { useState, useEffect } = React

function Task({ userId, apiUrl, expanded, onToggleExpand }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  return (
    <div className="task-container">
      <div className="task-header">
        <h2>Tasks</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} />
      </div>

      <form className="task-input-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="task-input"
        />
        <button type="submit" className="task-add-btn">
          +
        </button>
      </form>
    </div>
  )
}
