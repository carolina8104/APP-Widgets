const { useState, useEffect } = React

function Progress({ userId, apiUrl, expanded, onToggleExpand, hideExpandArrow = false }) {

  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0])
  const [weeklyCompleted, setWeeklyCompleted] = useState([0, 0, 0, 0, 0, 0, 0])
  const [todayCount, setTodayCount] = useState(0)
  const [weekCount, setWeekCount] = useState(0)
  const [totalStats, setTotalStats] = useState({ events: 0, tasks: 0, notes: 0, friends: 0 })
  const [yearData, setYearData] = useState({})

  useEffect(() => {
    fetchWeeklyProgress()
    fetchTotalStats()
    fetchYearData()
    
    const interval = setInterval(() => {
      fetchWeeklyProgress()
      fetchTotalStats()
      fetchYearData()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [userId])

  async function fetchTotalStats() {
    try {
      const response = await fetch(`${apiUrl}/api/stats?userId=${userId}`)
      const stats = await response.json()
      setTotalStats(stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  async function fetchYearData() {
    try {
      const response = await fetch(`${apiUrl}/api/calendar/types?userId=${userId}`)
      const data = await response.json()
      setYearData(data)
    } catch (error) {
      console.error('Error fetching year data:', error)
    }
  }

  async function fetchWeeklyProgress() {
    try {
      const response = await fetch(`${apiUrl}/api/todo?userId=${userId}`)
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


  const typeColors = {
    classes: 'var(--color-neutral-3)',
    fit: 'var(--accent-yellow)',
    meets: 'var(--accent-blue)',
    study: hideExpandArrow ? 'var(--color-primary-3)' : 'var(--color-primary-1)',
    personal: 'var(--color-neutral-2)',
    work: 'var(--white)',
    social: 'var(--accent-light-yellow)',
    health: 'var(--muted)',
    hobby: 'var(--accent-pink)',
    other: 'var(--accent-green)'
  }

  const colorPalette = [
    'var(--panel-2)',
    'var(--accent-yellow)',
    'var(--accent-blue)',
    'var(--color-primary-1)',
    'var(--color-neutral-2)',
    'var(--white)',
    'var(--accent-light-yellow)',
    'var(--muted)',
    'var(--accent-pink)',
    'var(--accent-green)'
  ]

  const totalYearEvents = Object.values(yearData).reduce((sum, val) => sum + val, 0)
  const yearSegments = totalYearEvents > 0 ? Object.entries(yearData).map(([type, count], index) => ({
    type,
    count,
    percentage: (count / totalYearEvents) * 100,
    color: typeColors[type] || colorPalette[index % colorPalette.length]
  })) : []

  const donutBaseColor = hideExpandArrow ? 'var(--color-primary-1)' : 'var(--color-primary-3)';

  return (
    <div 
      className={`progress-container ${expanded ? "progress-expanded" : ""}`}
      onClick={(e) => {
        if (!expanded && !hideExpandArrow && !e.target.closest('.expand-arrow')) {
          onToggleExpand()
        }
      }}
      style={{ cursor: !expanded && !hideExpandArrow ? 'pointer' : 'default' }}
    >
      <div className="progress-grid">
        <h2>Progress</h2>
        {!hideExpandArrow && <ExpandArrow onClick={onToggleExpand} expanded={expanded}/>}
        <div className="progress-content">
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
              {weekCount === 0 && todayCount === 0 ? (
                <div className="progress-no-data">
                  <p>No activity this week</p>
                </div>
              ) : (
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
                          fill="var(--text-accent-3)"
                        />
                        <text
                          x={x + 5}
                          y={74}
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="500"
                          fill="var(--text-accent-3)"
                        >
                          {day}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              )}
            </>
          )}
          {expanded && (
            <>
              <div className="progress-expanded-row">
                <div className="progress-main">
                  <h3 className="progress-subtitle">Week tasks</h3>
                  <div className="progress-main-row">
                    {weekCount === 0 && todayCount === 0 ? (
                      <div className="progress-no-data">
                        <p>No activity this week</p>
                      </div>
                    ) : (
                      <>
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
                                  fill="var(--text-accent-3)"
                                />
                                <text
                                  x={x + 5}
                                  y={74}
                                  textAnchor="middle"
                                  fontSize="8"
                                  fontWeight="500"
                                  fill="var(--text-accent-3)"
                                >
                                  {day}
                                </text>
                              </g>
                            )
                          })}
                        </svg>
                      </>
                    )}

                  </div>
                </div>
                <div className="progress-year">
                  <h3 className="progress-subtitle">Year overview</h3>
                  <div className="progress-year-content">
                    <svg className="progress-donut" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
                      {yearSegments.length > 0 ? (() => {
                        let currentAngle = -90
                        return yearSegments.map((segment, i) => {
                          const angle = (segment.percentage / 100) * 360
                          const startAngle = currentAngle
                          currentAngle += angle
                          
                          const startRad = (startAngle * Math.PI) / 180
                          const endRad = (currentAngle * Math.PI) / 180
                          
                          const outerRadius = 90
                          const innerRadius = 60
                          
                          const x1 = 100 + outerRadius * Math.cos(startRad)
                          const y1 = 100 + outerRadius * Math.sin(startRad)
                          const x2 = 100 + outerRadius * Math.cos(endRad)
                          const y2 = 100 + outerRadius * Math.sin(endRad)
                          const x3 = 100 + innerRadius * Math.cos(endRad)
                          const y3 = 100 + innerRadius * Math.sin(endRad)
                          const x4 = 100 + innerRadius * Math.cos(startRad)
                          const y4 = 100 + innerRadius * Math.sin(startRad)
                          
                          const largeArc = angle > 180 ? 1 : 0
                          
                          const pathData = [
                            `M ${x1} ${y1}`,
                            `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
                            `L ${x3} ${y3}`,
                            `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
                            'Z'
                          ].join(' ')
                          
                          return (
                            <path
                              key={segment.type}
                              d={pathData}
                              fill={segment.color}
                            />
                          )
                        })
                      })() : (
                        <>
                          <circle cx="100" cy="100" r="90" fill="rgba(15, 15, 15, 0.1)" />
                          <circle cx="100" cy="100" r="60" fill="var(--text-accent-3)" fillOpacity="0.05" />
                          <text x="100" y="110" textAnchor="middle" fontSize="0.95rem" fontWeight="500" fill="var(--text-accent-3)" opacity="0.7">
                            No calendar events
                          </text>
                        </>
                      )}
                    </svg>
                    <div className="progress-year-legend">
                      {yearSegments.map(segment => (
                        <div key={segment.type} className="progress-legend-item">
                          <span className="progress-legend-color" style={{ backgroundColor: segment.color }}></span>
                          <span className="progress-legend-label">{segment.type}</span>
                          <span className="progress-legend-percent">{Math.round(segment.percentage)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="progress-totals">
                <div className="progress-total-item">
                  <span className="progress-total-value">{totalStats.events}</span>
                  <span className="progress-total-label">Events</span>
                </div>
                <div className="progress-total-item">
                  <span className="progress-total-value">{totalStats.tasks}</span>
                  <span className="progress-total-label">Tasks</span>
                </div>
                <div className="progress-total-item">
                  <span className="progress-total-value">{totalStats.notes}</span>
                  <span className="progress-total-label">Notes</span>
                </div>
                <div className="progress-total-item">
                  <span className="progress-total-value">{totalStats.friends}</span>
                  <span className="progress-total-label">Friends</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
