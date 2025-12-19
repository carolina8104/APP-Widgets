const { useState, useEffect } = React

function Task({ userId, apiUrl, expanded, onToggleExpand }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [userId])

  async function fetchTasks() {
    try {
      const response = await fetch(`${apiUrl}/api/todo?userId=${userId}`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return

    try {
      const response = await fetch(`${apiUrl}/api/todo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          content: newTask,
          completed: 'false',
          createdAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        const task = await response.json()
        setTasks([task, ...tasks])
        setNewTask('')
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const incompleteTasks = tasks.filter(t => t.completed !== 'true')
  const completedTasks = tasks.filter(t => t.completed === 'true')

  return (
    <div className="task-container">
      <div className="task-header">
        <h2>Tasks</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} />
      </div>

      <form onSubmit={addTask} className="task-input-form">
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

      <div className="task-list">
        {incompleteTasks.map(task => (
          <div key={task._id} className="task-item">
            <span className="task-content">{task.content}</span>
          </div>
        ))}

        {completedTasks.length > 0 && completedTasks.map(task => (
          <div key={task._id} className="task-item task-completed">
            <span className="task-content">{task.content}</span>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="task-empty">
            <p>No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
