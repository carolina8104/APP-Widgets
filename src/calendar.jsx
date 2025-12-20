const { useState, useEffect } = React

function Calendar({ apiUrl, expanded, onToggleExpand }) {
  const [events, setEvents] = useState([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'study',
    difficulty: 'medium',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00'
  })

      .then(res => {
        console.log('Response status:', res.status)
        return res.json()
      })
      .then(tasks => {
        console.log('Received tasks:', tasks)
        if (!Array.isArray(tasks)) {
          console.error('Tasks is not an array:', tasks)
          setEvents([])
          return
        }
        const formattedEvents = tasks.map(task => {
          console.log('Processing task:', task)
          return {
            _id: task._id,
            title: task.title || 'Untitled',
            time: formatTimeFromISO(task.startTime, task.endTime),
            date: task.calendarDate,
            color: getColorByType(task.type),
            userId: task.userId,
            type: task.type,
            completed: task.completed
          }
        })
        console.log('Formatted events:', formattedEvents)
        setEvents(formattedEvents)
      })
      .catch(err => {
        console.error('Error fetching tasks:', err)
        setEvents([])
      })

  useEffect(() => {
    fetchEvents()
  }, [apiUrl])

  const getWeekDates = (startDate) => {
    const dates = []
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)
    
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    
    Array.from({ length: 7 }).forEach((_, i) => {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    })
    return dates
  }

  const weekDates = getWeekDates(currentWeekStart)
  const weekDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const firstDate = weekDates[0]
  const lastDate = weekDates[6]
  const monthName = firstDate.toLocaleString('en-US', { month: 'long' })
  const weekTitle = `Week ${firstDate.getDate()} to ${lastDate.getDate()} of ${monthName}`

  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const getEventHeight = (duration) => {
    if (duration >= 2.5) return 'event-long' 
    if (duration >= 1) return 'event-medium' 
    return 'event-short' 
  }

  const layoutEventsInColumn = (events) => {
    if (events.length === 0) return []

    const sorted = [...events].sort((a, b) => {
      return getEventStartTime(a.time) - getEventStartTime(b.time)
    })

    const DAY_START = 6

    const items = sorted.map(event => {
      const duration = getEventDuration(event.time)
      const heightClass = getEventHeight(duration)
      let start = getEventStartTime(event.time)
      let end = start + duration
      if (end === 0) end = 24
      if (end > 24) end = 24

      const shift = (h) => ((h - DAY_START + 24) % 24)

      let startShifted = shift(start)
      let endShifted = shift(end)

      if (endShifted <= startShifted) {
        endShifted += 24
      }

      const topPercent = (startShifted / 24) * 100
      let heightPercent = ((endShifted - startShifted) / 24) * 100

      const minPercent = 2.0
      if (heightPercent < minPercent) heightPercent = minPercent

      if (topPercent + heightPercent > 100) heightPercent = 100 - topPercent

      return { ...event, heightClass, topPercent, heightPercent }
    })

    const gapPercent = 12

    items.forEach((cur, i) => {
      const next = items[i + 1]
      if (!next) return
      const minTopForNext = cur.topPercent + cur.heightPercent + gapPercent
      if (next.topPercent < minTopForNext) {
        next.topPercent = minTopForNext

        if (next.topPercent + next.heightPercent > 100) {
          next.heightPercent = Math.max(3.0, 100 - next.topPercent)
        }
      }
    })

    return items.map(it => ({ ...it }))
    }

    const getDaysInMonth = (date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      const startingDayOfWeek = (firstDay.getDay() + 6) % 7 
    
      const days = []
    
      const prevMonthLastDay = new Date(year, month, 0).getDate()

      Array.from({ length: startingDayOfWeek }).forEach((_, idx) => {
        const i = startingDayOfWeek - 1 - idx
        days.push({
          day: prevMonthLastDay - i,
          isCurrentMonth: false,
          date: new Date(year, month - 1, prevMonthLastDay - i)
        })
      })

      Array.from({ length: daysInMonth }).forEach((_, d) => {
        const day = d + 1
        days.push({
          day,
          isCurrentMonth: true,
          date: new Date(year, month, day)
        })
      })

      const remainingDays = 42 - days.length
      Array.from({ length: remainingDays }).forEach((_, d) => {
        const day = d + 1
        days.push({
          day,
          isCurrentMonth: false,
          date: new Date(year, month + 1, day)
        })
      })
    
      return days
    }

  const goToPreviousMonth = () => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setMiniCalendarDate(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 1))
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const getEventDuration = (timeString) => {
    if (!timeString.includes('-')) return 1 
    
    const [start, end] = timeString.split('-').map(t => t.trim())
    const parseTime = (t) => {
      const [hours, minutes] = t.replace('h', '').split(':').map(Number)
      return hours + (minutes || 0) / 60
    }
    
    const startTime = parseTime(start)
    let endTime = parseTime(end)
    
    if (endTime === 0) endTime = 24
    
    return Math.max(endTime - startTime, 0.5) 
  }

  const getEventStartTime = (timeString) => {
    const match = timeString.match(/(\d+):(\d+)h/)
    if (!match) return 0
    return parseInt(match[1]) + parseInt(match[2]) / 60
  }
  const handleCreateTask = async (e) => {
    e.preventDefault()
    const startDateTime = new Date(`${newTask.date}T${newTask.startTime}:00`)
    const endDateTime = new Date(`${newTask.date}T${newTask.endTime}:00`)
    const duration = (endDateTime - startDateTime) / 1000

    const taskData = {
      userId: 'user123',
      title: newTask.title,
      description: newTask.description,
      type: newTask.type,
      difficulty: newTask.difficulty,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: duration,
      calendarDate: newTask.date,
      completed: false
    }

    console.log('Creating task:', taskData)

    try {
      const response = await fetch(`${apiUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      console.log('Create response status:', response.status)
      const result = await response.json()
      console.log('Created task result:', result)
      
      if (response.ok) {
        setShowTaskModal(false)
        setNewTask({
          title: '',
          description: '',
          type: 'study',
          difficulty: 'medium',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00'
        })
        fetchEvents()
      } else {
        console.error('Failed to create task:', result)
      }
    } catch (err) {
      console.error('Error creating task:', err)
    }
  }
  

  if (expanded) {
    return (
      <div className="calendar-expanded-container">
        <div className="calendar-main-widget">
          <div className="calendar-header">
            <button className="calendar-nav-btn" onClick={goToPreviousWeek}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h2 className="calendar-title">{weekTitle}</h2>
            <button className="calendar-nav-btn" onClick={goToNextWeek}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <ExpandArrow onClick={onToggleExpand} expanded={expanded} color={'var(--background)'} />
          </div>

          <div className="calendar-week-grid">
            {weekDates.map((date, index) => {
              const dayEvents = getEventsForDay(date)
              const layoutedEvents = layoutEventsInColumn(dayEvents)
              return (
                <div key={index} className="calendar-day-column">
                  <div className="calendar-day-header">
                    <div className="calendar-day-number">{date.getDate()}</div>
                    <div className="calendar-day-name">{weekDayNames[index]}</div>
                  </div>
                  <div className="calendar-events-container">
                    {layoutedEvents.map((event, eventIndex) => (
                      <div 
                        key={eventIndex} 
                        className={`calendar-event ${event.heightClass}`}
                          style={{ 
                            backgroundColor: event.color || '#ffd600',
                            top: `${event.topPercent}%`,
                            height: `${event.heightPercent}%`
                          }}
                      >
                        <div className="calendar-event-title">{event.title}</div>
                            {(() => {
                              const parts = event.time && event.time.includes('-') ? event.time.split('-').map(p => p.trim()) : [event.time]
                              return (
                                <div className="calendar-event-time">
                                  <span className="calendar-event-time-line">{parts[0]}{parts[1] ? ' -' : ''}</span>
                                  {parts[1] && <span className="calendar-event-time-line">{parts[1]}</span>}
                                </div>
                              )
                            })()}
                        {event.userId && (
                          <div className="calendar-event-avatar">
                            <div className="calendar-avatar-circle"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="calendar-add-task-widget">
          <h3 style={{color: 'var(--text-default)', margin: 0, fontSize: '1rem', fontWeight: 600}}>Add new task</h3>
          <button className="calendar-add-task-btn" onClick={() => setShowTaskModal(true)}>
            <span>+</span>
          </button>
        </div>

        {showTaskModal && (
          <div className="task-modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="task-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className="task-form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    required
                  />
                </div>
                <div className="task-form-group">
                  <label>Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  />
                </div>
                <div className="task-form-row">
                  <div className="task-form-group">
                    <label>Type</label>
                    <select
                      value={newTask.type}
                      onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                    >
                      <option value="study">Study</option>
                      <option value="work">Work</option>
                      <option value="personal">Personal</option>
                      <option value="exercise">Exercise</option>
                      <option value="meeting">Meeting</option>
                    </select>
                  </div>
                  <div className="task-form-group">
                    <label>Difficulty</label>
                    <select
                      value={newTask.difficulty}
                      onChange={(e) => setNewTask({...newTask, difficulty: e.target.value})}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div className="task-form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newTask.date}
                    onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                    required
                  />
                </div>
                <div className="task-form-row">
                  <div className="task-form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={newTask.startTime}
                      onChange={(e) => setNewTask({...newTask, startTime: e.target.value})}
                      required
                    />
                  </div>
                  <div className="task-form-group">
                    <label>End Time</label>
                    <input
                      type="time"
                      value={newTask.endTime}
                      onChange={(e) => setNewTask({...newTask, endTime: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="task-form-actions">
                  <button type="button" className="task-btn-cancel" onClick={() => setShowTaskModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="task-btn-create">
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="calendar-mini-widget">
          <div className="mini-calendar-header">
            <button className="mini-calendar-nav" onClick={goToPreviousMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h3 className="mini-calendar-month">
              {miniCalendarDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="mini-calendar-nav" onClick={goToNextMonth}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className="mini-calendar-weekdays">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => (
              <div key={i} className="mini-calendar-weekday">{day}</div>
            ))}
          </div>
          
          <div className="mini-calendar-days">
            {getDaysInMonth(miniCalendarDate).map((dayObj, i) => (
              <div
                key={i}
                className={`mini-calendar-day ${
                  !dayObj.isCurrentMonth ? 'other-month' : ''
                } ${isToday(dayObj.date) ? 'today' : ''} ${
                  isSelected(dayObj.date) ? 'selected' : ''
                }`}
                onClick={() => setSelectedDate(dayObj.date)}
              >
                {dayObj.day}
              </div>
            ))}
          </div>
        </div>

        <div className="calendar-sticker-widget">
          <h3 className="calendar-mini-title">Sticker collection</h3>
          <div className="calendar-placeholder-text">
            Sticker collection placeholder
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-widget">
      <div className="calendar-compact-header">
        <button className="calendar-nav-btn-compact" onClick={goToPreviousWeek}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="calendar-title-compact">{weekTitle}</h2>
        <button className="calendar-nav-btn-compact" onClick={goToNextWeek}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} color={'var(--background)'} />
      </div>

      <div className="calendar-week-grid-compact">
        {weekDates.map((date, index) => {
          const dayEvents = getEventsForDay(date)
          const layoutedEvents = layoutEventsInColumn(dayEvents)
          return (
            <div key={index} className="calendar-day-column-compact">
              <div className="calendar-day-header-compact">
                <div className="calendar-day-number-compact">{date.getDate()}</div>
                <div className="calendar-day-name-compact">{weekDayNames[index]}</div>
              </div>
              <div className="calendar-events-container-compact">
                {layoutedEvents.map((event, eventIndex) => (
                  <div 
                    key={eventIndex} 
                    className={`calendar-event-compact ${event.heightClass}`}
                    style={{ 
                      backgroundColor: event.color || '#ffd600',
                      top: `${event.topPercent}%`,
                      height: `${event.heightPercent}%`
                    }}
                  >
                    <div className="calendar-event-title-compact">{event.title}</div>
                    {(() => {
                      const parts = event.time && event.time.includes('-') ? event.time.split('-').map(p => p.trim()) : [event.time]
                      return (
                        <div className="calendar-event-time-compact">
                          <span className="calendar-event-time-compact-line">{parts[0]}{parts[1] ? ' -' : ''}</span>
                          {parts[1] && <span className="calendar-event-time-compact-line">{parts[1]}</span>}
                        </div>
                      )
                    })()}
                    {event.userId && (
                      <div className="calendar-event-avatar-compact">
                        <div className="calendar-avatar-circle-compact"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

window.Calendar = Calendar
