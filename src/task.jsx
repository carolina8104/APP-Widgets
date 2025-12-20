const { useState, useEffect } = React

function Task({ userId, apiUrl, expanded, onToggleExpand }) {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')

  useEffect(() => {
    fetchTasks()
    
    const eventSource = new EventSource(`${apiUrl}/api/events`)
    
    eventSource.addEventListener('todo-created', (e) => {
      const data = JSON.parse(e.data)
      if (data.userId === userId) {
        setTasks(prev => [data.todo, ...prev])
      }
    })
    
    eventSource.addEventListener('todo-updated', (e) => {
      const data = JSON.parse(e.data)
      if (data.userId === userId) {
        setTasks(prev => prev.map(task => 
          task._id === data.todoId ? { ...task, ...data.updates } : task
        ))
      }
    })
    
    eventSource.addEventListener('todo-deleted', (e) => {
      const data = JSON.parse(e.data)
      if (data.userId === userId) {
        setTasks(prev => prev.filter(task => task._id !== data.todoId))
      }
    })
    
    eventSource.onerror = (error) => {
      console.error('SSE error in Task widget:', error)
    }
    
    return () => {
      eventSource.close()
    }
  }, [userId, apiUrl])

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
        setNewTask('')
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  async function toggleTask(taskId, currentStatus) {
    try {
      const newStatus = currentStatus === 'true' ? 'false' : 'true'
      const response = await fetch(`${apiUrl}/api/todo/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus })
      })

      if (response.ok) {
      }
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  async function deleteTask(taskId) {
    try {
      const response = await fetch(`${apiUrl}/api/todo/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
      }
    } catch (error) {
      console.error('Error deleting task:', error)
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
            <div className="task-actions">
              <button
                className="task-delete"
                onClick={() => deleteTask(task._id)}
              >
                ×
              </button>
              <button
                className="task-checkbox"
                onClick={() => toggleTask(task._id, task.completed)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
          </div>
        ))}

        {completedTasks.length > 0 && completedTasks.map(task => (
          <div key={task._id} className="task-item task-completed">
            <span className="task-content">{task.content}</span>
            <div className="task-actions">
              <button
                className="task-delete"
                onClick={() => deleteTask(task._id)}
              >
                ×
              </button>
              <button
                className="task-checkbox task-checkbox-checked"
                onClick={() => toggleTask(task._id, task.completed)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" fill="currentColor"/>
                  <path d="M5 8L7 10L11 6" stroke="var(--color-neutral-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
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
