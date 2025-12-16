const { useState, useEffect } = React

function Progress({ userId, expanded, onToggleExpand }) {
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0])
  const [weeklyCompleted, setWeeklyCompleted] = useState([0, 0, 0, 0, 0, 0, 0])
  const [todayCount, setTodayCount] = useState(0)
  const [weekCount, setWeekCount] = useState(0)

  useEffect(() => {
    fetchWeeklyProgress()
    
    const interval = setInterval(() => {
      fetchWeeklyProgress()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [userId])

  async function fetchWeeklyProgress() {
    try {
      const response = await fetch(`http://localhost:3001/api/todo?userId=${userId}`)
      const todos = await response.json()
      
      if (!Array.isArray(todos)) {
        throw new Error('Invalid response from server')
      }
      
      const now = new Date()
      const currentDay = now.getDay() 
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
      const monday = new Date(now)
      monday.setDate(now.getDate() + mondayOffset)
      monday.setHours(0, 0, 0, 0)
      
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      sunday.setHours(23, 59, 59, 999)

      const created = [0, 0, 0, 0, 0, 0, 0]
      const completed = [0, 0, 0, 0, 0, 0, 0]
      
      todos.forEach(todo => {
        const createdDate = new Date(todo.createdAt)
        
        if (createdDate >= monday && createdDate <= sunday) {
          const dayIndex = createdDate.getDay()
          const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1
          
          created[adjustedIndex]++
          
          if (todo.completed === 'true' || todo.completed === true) {
            completed[adjustedIndex]++
          }
        }
      })
      
      setWeeklyData(created)
      setWeeklyCompleted(completed)
      
      const todayIndex = currentDay === 0 ? 6 : currentDay - 1
      setTodayCount(completed[todayIndex])
      setWeekCount(completed.reduce((sum, val) => sum + val, 0))
      
    } catch (error) {
      console.error('Error fetching todos:', error)
      const mockCreated = [4, 3, 5, 2, 1, 0, 0]
      const mockCompleted = [2, 2, 3, 1, 0, 0, 0]
      setWeeklyData(mockCreated)
      setWeeklyCompleted(mockCompleted)
      setTodayCount(mockCompleted[2])
      setWeekCount(mockCompleted.reduce((sum, val) => sum + val, 0))
    }
  }

  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const maxTasks = Math.max(...weeklyData, 1)
  const maxBarHeight = 55

  return (
    <div className={`progress-container ${expanded ? "progress-expanded" : ""}`}>
      <div className="progress-grid">
        <h2>Progress</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color="var(--bg)" />
        <div className="progress-content">
          {/* Modo fechado: layout original, stats horizontais abaixo do gráfico */}
          {!expanded && (
            <>
             <div className="progress-stats">
                <div className="progress-stat">
                  <span className="progress-label">Completed today:</span>
                  <span className="progress-value">{todayCount}</span>
                </div>
                <div className="progress-stat">
                  <span className="progress-label">Completed this week:</span>
                  <span className="progress-value">{weekCount}</span>
                </div>
              </div>
              <svg className="progress-chart" viewBox="0 0 160 78" preserveAspectRatio="xMidYMid meet">
                {dayLabels.map((day, i) => {
                  const x = i * 20 + 8
                  const createdCount = weeklyData[i]
                  const completedCount = weeklyCompleted[i]
                  const grayBarHeight = maxBarHeight
                  const maxPossible = Math.max(...weeklyData, 1)
                  const blackBarHeight = (completedCount / maxPossible) * maxBarHeight
                  return (
                    <g key={day}>
                      <rect
                        x={x}
                        y={10}
                        width="10"
                        height={grayBarHeight}
                        rx="5"
                        fill="rgba(0, 0, 0, 0.15)"
                      />
                      <rect
                        x={x}
                        y={10 + (grayBarHeight - blackBarHeight)}
                        width="10"
                        height={blackBarHeight}
                        rx="5"
                        fill="var(--bg)"
                      />
                      <text
                        x={x + 5}
                        y={74}
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="500"
                        fill="var(--bg)"
                      >
                        {day}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </>
          )}
          {/* Modo expandido: gráfico maior à esquerda, stats à direita, título */}
          {expanded && (
            <>
              <h3 className="progress-subtitle">Week tasks</h3>
              <div className="progress-main">
                <div className="progress-stats">
                  <div className="progress-stat">
                    <span className="progress-value">{todayCount}</span>
                    <span className="progress-label">Today</span>
                  </div>
                  <div className="progress-stat">
                    <span className="progress-value">{weekCount}</span>
                    <span className="progress-label">This week</span>
                  </div>
                </div>
                <svg className="progress-chart" viewBox="0 0 160 78" preserveAspectRatio="xMidYMid meet">
                  {dayLabels.map((day, i) => {
                    const x = i * 20 + 8
                    const createdCount = weeklyData[i]
                    const completedCount = weeklyCompleted[i]
                    const grayBarHeight = maxBarHeight
                    const maxPossible = Math.max(...weeklyData, 1)
                    const blackBarHeight = (completedCount / maxPossible) * maxBarHeight
                    return (
                      <g key={day}>
                        <rect
                          x={x}
                          y={10}
                          width="10"
                          height={grayBarHeight}
                          rx="5"
                          fill="rgba(0, 0, 0, 0.15)"
                        />
                        <rect
                          x={x}
                          y={10 + (grayBarHeight - blackBarHeight)}
                          width="10"
                          height={blackBarHeight}
                          rx="5"
                          fill="var(--bg)"
                        />
                        <text
                          x={x + 5}
                          y={74}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="500"
                          fill="var(--bg)"
                        >
                          {day}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
