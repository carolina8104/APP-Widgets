const { useState, useEffect } = React

function Progress({ userId, expanded, onToggleExpand }) {
  const [weeklyData, setWeeklyData] = useState([0, 0, 0, 0, 0, 0, 0])
  const [todayCount, setTodayCount] = useState(0)
  const [weekCount, setWeekCount] = useState(0)

  useEffect(() => {
    const mockData = [2, 3, 5, 1, 0, 0, 0]
    setWeeklyData(mockData)
    setTodayCount(mockData[2])
    setWeekCount(mockData.reduce((sum, val) => sum + val, 0))
  }, [userId])

  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const maxTasks = Math.max(...weeklyData, 1)

  return (
    <div className={`progress-container ${expanded ? "progress-expanded" : ""}`}>
      <div className="progress-grid">
        <h2>Progress</h2>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color="var(--bg)" />
        
        <div className="progress-content">
          <div className="progress-stats">
            <div className="progress-stat">
              <span className="progress-label">Today:</span>
              <span className="progress-value">{todayCount}</span>
            </div>
            <div className="progress-stat">
              <span className="progress-label">This week:</span>
              <span className="progress-value">{weekCount}</span>
            </div>
          </div>

          <svg className={`progress-chart ${expanded ? 'progress-chart-small' : ''}`} viewBox="0 0 160 78" preserveAspectRatio="xMidYMid meet">
            {dayLabels.map((day, i) => {
              const barHeight = (weeklyData[i] / maxTasks) * 55
              const x = i * 20 + 8
              const maxBarHeight = 55
              const backgroundY = 10
              const foregroundY = 10 + (maxBarHeight - barHeight)
              
              return (
                <g key={day}>
                  {}
                  <rect
                    x={x}
                    y={backgroundY}
                    width="10"
                    height={maxBarHeight}
                    rx="5"
                    fill="rgba(0, 0, 0, 0.15)"
                  />
                  {}
                  <rect
                    x={x}
                    y={foregroundY}
                    width="10"
                    height={barHeight}
                    rx="5"
                    fill="var(--bg)"
                  />
                  {}
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
      </div>
    </div>
  )
}
