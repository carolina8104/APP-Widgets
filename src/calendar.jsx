const { useState, useEffect } = React

const ParticipantAvatar = ({ photo, apiUrl, name }) => (
  <div className="calendar-avatar-circle">
    {photo ? (
      <img 
        src={photo.startsWith('/uploads/') ? `${apiUrl}${photo}` : photo} 
        alt={name || 'avatar'}
        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
      />
    ) : null}
    <svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" style={{ display: photo ? 'none' : 'block' }}>
      <circle cx="10" cy="10" r="10" fill="var(--color-primary-3)" />
      <circle cx="10" cy="8" r="4" fill="var(--background)" />
      <rect x="4" y="13" width="12" height="5" rx="2.5" fill="var(--background)" />
    </svg>
  </div>
)

const ParticipantsList = ({ participants, apiUrl, maxVisible = 2 }) => {
  if (!participants || participants.length === 0) return null
  
  const visible = participants.slice(0, maxVisible)
  const hasMore = participants.length > maxVisible
  
  return (
    <div className="calendar-event-avatar">
      {visible.map((participant, idx) => (
        <div key={participant.userId} style={{ marginLeft: idx > 0 ? '-8px' : '0' }}>
          <ParticipantAvatar photo={participant.photo} apiUrl={apiUrl} name={participant.name} />
        </div>
      ))}
      {hasMore && (
        <div className="calendar-avatar-more" style={{ marginLeft: '-8px' }}>...</div>
      )}
    </div>
  )
}

function Calendar({ apiUrl, expanded, onToggleExpand, userId }) {
    const EVENT_TYPES = [
      { value: 'study', label: 'Study' },
      { value: 'work', label: 'Work' },
      { value: 'personal', label: 'Personal' },
      { value: 'exercise', label: 'Exercise' },
      { value: 'meeting', label: 'Meeting' },
      { value: 'social', label: 'Social' },
      { value: 'hobby', label: 'Hobby' },
      { value: 'other', label: 'Other' }
    ]
  const [events, setEvents] = useState([])
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedEventInfo, setSelectedEventInfo] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [friends, setFriends] = useState([])
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    type: 'study',
    difficulty: 'medium',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    participants: []
  })
  const [draggedSticker, setDraggedSticker] = useState(null)
  const [eventStickers, setEventStickers] = useState({})

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks/${eventId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setSelectedEventInfo(null)
        fetchEvents()
      } else {
        console.error('Failed to delete event')
      }
    } catch (err) {
      console.error('Error deleting event:', err)
    }
  }

  const fetchEvents = () => {
    const url = userId ? `${apiUrl}/api/tasks?userId=${userId}` : `${apiUrl}/api/tasks`
    console.log('Fetching tasks from:', url)
    fetch(url)
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
            description: task.description || '',
            time: formatTimeFromISO(task.startTime, task.endTime),
            date: task.calendarDate,
            color: getColorByType(task.type),
            userId: task.userId,
            type: task.type,
            completed: task.completed,
            participants: task.participants || [],
            participantPhotos: task.participantPhotos || []
          }
        })
        console.log('Formatted events:', formattedEvents)
        setEvents(formattedEvents)
      })
      .catch(err => {
        console.error('Error fetching tasks:', err)
        setEvents([])
      })
  }

  useEffect(() => {
    if (userId) {
      fetchEvents()
      fetchFriends()
      fetchEventStickers()
      const eventSource = new EventSource(`${apiUrl}/api/events`)
      const updateCalendar = (data) => {
        if (data.userId === userId || (data.participants && data.participants.includes(userId))) {
          fetchEvents()
        }
      }
      eventSource.addEventListener('calendar-created', (event) => updateCalendar(JSON.parse(event.data)))
      eventSource.addEventListener('calendar-deleted', (event) => updateCalendar(JSON.parse(event.data)))
      eventSource.onerror = (error) => {
        console.error('SSE error in Calendar widget:', error)
      }
      return () => {
        eventSource.close()
      }
    }
  }, [apiUrl, userId])

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveEventStickers({ keepalive: true })
    }

    const handleAppLogout = () => {
      saveEventStickers()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('app:logout', handleAppLogout)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('app:logout', handleAppLogout)
    }
  }, [eventStickers, userId])

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}/friends`)
      const data = await response.json()
      if (!data.error) {
        setFriends(data)
      }
    } catch (err) {
      console.error('Error fetching friends:', err)
    }
  }

  const fetchEventStickers = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/event-stickers?userId=${userId}`)
      if (response.ok) {
        const stickers = await response.json()
        console.log('Fetched event stickers:', stickers)
        const stickerMap = {}
        stickers.forEach(s => {
          stickerMap[s.eventId] = s.stickerId
        })
        console.log('Sticker map:', stickerMap)
        setEventStickers(stickerMap)
      }
    } catch (err) {
      console.error('Error fetching event stickers:', err)
    }
  }

  const saveEventStickers = async (opts = {}) => {
    try {
      const stickers = Object.keys(eventStickers).map(eventId => ({
        eventId,
        stickerId: eventStickers[eventId],
        userId
      }))
      if (stickers.length === 0) return
      await fetch(`${apiUrl}/api/event-stickers/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stickers }),
        keepalive: !!opts.keepalive
      })
      console.log('Saved event stickers (bulk):', stickers.length)
    } catch (err) {
      console.error('Error saving event stickers bulk:', err)
    }
  }

  const attachStickerToEvent = async (eventId, stickerId) => {
    try {
      console.log('Attaching sticker:', stickerId, 'to event:', eventId)
      const response = await fetch(`${apiUrl}/api/event-stickers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, stickerId, userId })
      })
      if (response.ok) {
        const result = await response.json()
        console.log('Sticker attached:', result)
        setEventStickers(prev => ({ ...prev, [eventId]: stickerId }))
      }
    } catch (err) {
      console.error('Error attaching sticker:', err)
    }
  }

  const removeStickerFromEvent = async (eventId) => {
    try {
      const response = await fetch(`${apiUrl}/api/event-stickers/${eventId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setEventStickers(prev => {
          const newMap = { ...prev }
          delete newMap[eventId]
          return newMap
        })
      }
    } catch (err) {
      console.error('Error removing sticker:', err)
    }
  }

  const handleStickerDragStart = (stickerId) => {
    setDraggedSticker(stickerId)
  }

  const handleEventDrop = (e, eventId) => {
    e.preventDefault()
    if (draggedSticker) {
      setEventStickers(prev => ({ ...prev, [eventId]: draggedSticker }))
      const stickerId = draggedSticker
      setDraggedSticker(null)
      attachStickerToEvent(eventId, stickerId)
    }
  }

  const handleEventDragOver = (e) => {
    e.preventDefault()
  }

  const availableStickers = [
    { id: 'star', name: 'Star', svg: '<svg viewBox="0 0 24 24" fill="#FFD700"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
    { id: 'heart', name: 'Heart', svg: '<svg viewBox="0 0 24 24" fill="#FF6B6B"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' },
    { id: 'trophy', name: 'Trophy', svg: '<svg viewBox="0 0 24 24" fill="#FFA500"><path d="M7 3v2H3v4c0 2.21 1.79 4 4 4v1c0 2.76 2.24 5 5 5s5-2.24 5-5v-1c2.21 0 4-1.79 4-4V5h-4V3H7zm10 6c1.1 0 2-.9 2-2V7h2v2c0 1.1-.9 2-2 2zm-4 8c-1.66 0-3-1.34-3-3v-1h6v1c0 1.66-1.34 3-3 3zM5 7h2v2c0 1.1.9 2 2 2V7h2v4c0 1.66-1.34 3-3 3s-3-1.34-3-3V7zm7 13h2v2h-2v-2z"/></svg>' },
    { id: 'fire', name: 'Fire', svg: '<svg viewBox="0 0 24 24" fill="#FF4500"><path d="M13.5 0c-1.25 2.5-.75 5.5 0 7.5-2.5-1.5-3.5-3.5-3.5-6C6.5 3.5 4 7 4 10.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-2.5-1-5-3.5-7 .75 2 1.25 5 0 7.5.5-2.5-.5-5.5-2-7.5z"/></svg>' },
    { id: 'check', name: 'Check', svg: '<svg viewBox="0 0 24 24" fill="#4CAF50"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>' },
    { id: 'bolt', name: 'Lightning', svg: '<svg viewBox="0 0 24 24" fill="#FFEB3B"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>' }
  ]

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


    const DAY_START = 0

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

    const overlaps = (a, b) => {
      const aStart = a.topPercent
      const aEnd = a.topPercent + a.heightPercent
      const bStart = b.topPercent
      const bEnd = b.topPercent + b.heightPercent
      return aStart < bEnd && bStart < aEnd
    }

    const n = items.length
    const adj = Array.from({ length: n }, () => [])

    for (const i of items.keys()) {
      for (const j of items.keys()) {
        if (j <= i) continue
        if (overlaps(items[i], items[j])) {
          adj[i].push(j)
          adj[j].push(i)
        }
      }
    }

    const visited = new Array(n).fill(false)

    for (const i of items.keys()) {
      if (visited[i]) continue
      const queue = [i]
      const comp = []
      visited[i] = true
      while (queue.length) {
        const u = queue.shift()
        comp.push(u)
        for (const v of adj[u]) {
          if (!visited[v]) {
            visited[v] = true
            queue.push(v)
          }
        }
      }

      const compItems = comp.map(idx => ({ idx, item: items[idx] }))
      compItems.sort((a, b) => a.item.topPercent - b.item.topPercent)

      const colEnd = []
      const colIndexFor = {}

      for (const entry of compItems) {
        const it = entry.item
        let placed = false
        for (const [c, end] of colEnd.entries()) {
          if (end <= it.topPercent) {
            colIndexFor[entry.idx] = c
            colEnd[c] = it.topPercent + it.heightPercent
            placed = true
            break
          }
        }
        if (!placed) {
          colIndexFor[entry.idx] = colEnd.length
          colEnd.push(it.topPercent + it.heightPercent)
        }
      }

      const cols = colEnd.length || 1
      const gutter = 1.5
      const totalGutters = Math.max(0, cols - 1) * gutter
      const colWidth = (100 - totalGutters) / cols

      for (const entry of compItems) {
        const idx = entry.idx
        const c = colIndexFor[idx]
        const leftPercent = c * (colWidth + gutter)
        items[idx].leftPercent = leftPercent
        items[idx].widthPercent = colWidth
      }
    }

    return items.map(it => ({
      ...it,
      leftPercent: it.leftPercent != null ? it.leftPercent : 0,
      widthPercent: it.widthPercent != null ? it.widthPercent : 100
    }))
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

  const formatTimeFromISO = (startISO, endISO) => {
    const startDate = new Date(startISO)
    const endDate = new Date(endISO)
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}h`
    }
    return `${formatTime(startDate)} - ${formatTime(endDate)}`
  }

  const getColorByType = (type) => {
    const colors = {
      study: 'var(--color-primary-1)',
      work: 'var(--color-primary-2)',
      personal: 'var(--color-primary-3)',
      exercise: 'var(--color-neutral-2)',
      meeting: 'var(--color-primary-4)',
      social: 'var(--graph-1)',
      hobby: 'var(--graph-3)',
      other: 'var(--graph-4)'
    }
    return colors[type] || 'var(--graph-4)'
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    const startDateTime = new Date(`${newTask.date}T${newTask.startTime}:00`)
    const endDateTime = new Date(`${newTask.date}T${newTask.endTime}:00`)
    const duration = (endDateTime - startDateTime) / 1000

    const taskData = {
      userId: userId,
      title: newTask.title,
      description: newTask.description,
      type: newTask.type,
      difficulty: newTask.difficulty,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      duration: duration,
      calendarDate: newTask.date,
      completed: false,
      participants: newTask.participants || []
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
          endTime: '10:00',
          participants: []
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
                    {(() => {
                      const groups = []
                      const used = new Array(layoutedEvents.length).fill(false)
                      for (const [i, a] of layoutedEvents.entries()) {
                        if (used[i]) continue
                        const group = [a]
                        used[i] = true
                        for (const [j, b] of layoutedEvents.entries()) {
                          if (j <= i) continue
                          if (used[j]) continue
                          if (a.time && b.time && a.time === b.time) {
                            group.push(b)
                            used[j] = true
                          }
                        }
                        groups.push(group)
                      }

                      return groups.map((group, gi) => {
                        const first = group[0]
                        if (group.length === 1) {
                          const event = first
                          return (
                            <div
                              key={`e-${event._id}`}
                              className={`calendar-event ${event.heightClass}`}
                              onClick={() => setSelectedEventInfo(event)}
                              onDrop={(e) => handleEventDrop(e, event._id)}
                              onDragOver={handleEventDragOver}
                              style={{
                                backgroundColor: event.color || 'var(--graph-4)',
                                top: `${event.topPercent}%`,
                                height: `${event.heightPercent}%`,
                                left: `${event.leftPercent}%`,
                                width: `${event.widthPercent}%`
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
                              <ParticipantsList participants={event.participantPhotos} apiUrl={apiUrl} />
                              <div className="event-sticker-anchor">
                                {(() => {
                                  const stickerId = eventStickers[event._id]
                                  const sticker = availableStickers.find(s => s.id === stickerId)
                                  return stickerId && sticker ? (
                                    <div
                                      className="event-sticker"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeStickerFromEvent(event._id)
                                      }}
                                      dangerouslySetInnerHTML={{
                                        __html: sticker.svg
                                      }}
                                    />
                                  ) : null
                                })()}
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={`g-${gi}-${first._id}`}
                            className={`calendar-event ${first.heightClass} grouped-expandable`}
                            style={{
                              backgroundColor: first.color || 'var(--graph-4)',
                              top: `${first.topPercent}%`,
                              height: `${first.heightPercent}%`,
                              left: `${first.leftPercent}%`,
                              width: `${first.widthPercent}%`
                            }}
                          >
                            <div className="calendar-event-title">{first.title}</div>
                            {(() => {
                              const parts = first.time && first.time.includes('-') ? first.time.split('-').map(p => p.trim()) : [first.time]
                              return (
                                <div className="calendar-event-time">
                                  <span className="calendar-event-time-line">{parts[0]}{parts[1] ? ' -' : ''}</span>
                                  {parts[1] && <span className="calendar-event-time-line">{parts[1]}</span>}
                                </div>
                              )
                            })()}
                            <div className="event-count-indicator">+{group.length - 1}</div>
                            
                            <div className="grouped-hover-expanded">
                              {group.map((event, idx) => (
                                <div
                                  key={event._id}
                                  className="grouped-event-item"
                                  onClick={(e) => { e.stopPropagation(); setSelectedEventInfo(event) }}
                                >
                                  <div className="grouped-event-bullet" style={{ backgroundColor: event.color || 'var(--graph-4)' }}></div>
                                  <div className="grouped-event-title">{event.title}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })
                    })()}
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
                      {EVENT_TYPES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
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
                <div className="task-form-row">
                  <div className="task-form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask({...newTask, date: e.target.value})}
                      required
                    />
                  </div>
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
                <div className="task-form-group">
                  <label>Share with Friends (Optional)</label>
                  <div className="task-participants-selector">
                    {friends.map(friend => {
                      const isSelected = newTask.participants.includes(friend._id)
                      const toggleSelection = () => {
                        setNewTask({
                          ...newTask,
                          participants: isSelected
                            ? newTask.participants.filter(p => p !== friend._id)
                            : [...newTask.participants, friend._id]
                        })
                      }
                      
                      return (
                        <div 
                          key={friend._id} 
                          className={`task-participant-option ${isSelected ? 'selected' : ''}`}
                          onClick={toggleSelection}
                        >
                          <div className="participant-avatar">
                            <ParticipantAvatar photo={friend.profilePhoto} apiUrl={apiUrl} name={friend.name} />
                          </div>
                          <span className="participant-name">{friend.name}</span>
                        </div>
                      )
                    })}
                    {friends.length === 0 && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>No friends to share with</p>
                    )}
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
                onClick={() => {
                  setSelectedDate(dayObj.date)
                  setCurrentWeekStart(dayObj.date)
                }}
              >
                {dayObj.day}
              </div>
            ))}
          </div>
        </div>

        {selectedEventInfo && (
          <div className="event-info-panel" onClick={(e) => e.stopPropagation()}>
            <button className="event-info-close" onClick={() => setSelectedEventInfo(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="event-info-header">
              <h4 className="event-info-title">{selectedEventInfo.title}</h4>
              <div className="event-info-badges">
                <span className="event-badge event-type" style={{backgroundColor: selectedEventInfo.color}}>
                  {selectedEventInfo.type}
                </span>
              </div>
            </div>
            <div className="event-info-time">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{selectedEventInfo.time}</span>
            </div>
            {selectedEventInfo.description && (
              <div className="event-info-section">
                <div className="event-info-label">Description</div>
                <div className="event-info-desc">{selectedEventInfo.description}</div>
              </div>
            )}
            <button 
              className="event-delete-btn" 
              onClick={() => deleteEvent(selectedEventInfo._id)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M10 11v6M14 11v6M4 7h16M6 7h12v11a2 2 0 01-2 2H8a2 2 0 01-2-2V7zM9 5a1 1 0 011-1h4a1 1 0 011 1v2H9V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Delete Event
            </button>
          </div>
        )}

        <div className="calendar-sticker-widget">
          <h3 className="calendar-mini-title">Sticker collection</h3>
          <div className="sticker-grid">
            {availableStickers.map(sticker => (
              <div 
                key={sticker.id}
                className="sticker-item"
                draggable
                onDragStart={() => handleStickerDragStart(sticker.id)}
              >
                <div 
                  className="sticker-svg"
                  dangerouslySetInnerHTML={{ __html: sticker.svg }}
                />
              </div>
            ))}
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
            <path d="M15 18l-6-6 6-6" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2 className="calendar-title-compact">{weekTitle}</h2>
        <button className="calendar-nav-btn-compact" onClick={goToNextWeek}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="var(--background)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <ExpandArrow onClick={onToggleExpand} expanded={expanded} />
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
                {(() => {
                  const groups = []
                  const used = new Array(layoutedEvents.length).fill(false)
                  for (const [i, a] of layoutedEvents.entries()) {
                    if (used[i]) continue
                    const group = [a]
                    used[i] = true
                    for (const [j, b] of layoutedEvents.entries()) {
                      if (j <= i) continue
                      if (used[j]) continue
                      if (a.time && b.time && a.time === b.time) {
                        group.push(b)
                        used[j] = true
                      }
                    }
                    groups.push(group)
                  }

                  return groups.map((group, gi) => {
                    const first = group[0]
                    if (group.length === 1) {
                      const event = first
                      return (
                        <div 
                          key={event._id} 
                          className={`calendar-event-compact ${event.heightClass}`}
                          onClick={() => setSelectedEventInfo(event)}
                          style={{ 
                            backgroundColor: event.color || 'var(--graph-4)',
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
                          <ParticipantsList participants={event.participantPhotos} apiUrl={apiUrl} />
                        </div>
                      )
                    }

                    return (
                      <div 
                        key={`cg-${gi}-${first._id}`} 
                        className={`calendar-event-compact grouped-compact ${first.heightClass}`}
                        onClick={() => setSelectedEventInfo(first)}
                        style={{ 
                          backgroundColor: first.color || 'var(--graph-4)',
                          top: `${first.topPercent}%`,
                          height: `${first.heightPercent}%`
                        }}
                      >
                        <div className="calendar-event-title-compact">{first.title}</div>
                        {(() => {
                          const parts = first.time && first.time.includes('-') ? first.time.split('-').map(p => p.trim()) : [first.time]
                          return (
                            <div className="calendar-event-time-compact">
                              <span className="calendar-event-time-compact-line">{parts[0]}{parts[1] ? ' -' : ''}</span>
                              {parts[1] && <span className="calendar-event-time-compact-line">{parts[1]}</span>}
                            </div>
                          )
                        })()}
                        <div className="event-count-badge-compact">{group.length}</div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          )
        })}
      </div>

      {selectedEventInfo && (
        <div className="event-info-panel compact" onClick={(e) => e.stopPropagation()}>
          <button className="event-info-close" onClick={() => setSelectedEventInfo(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="event-info-header">
            <h4 className="event-info-title">{selectedEventInfo.title}</h4>
            <div className="event-info-badges">
              <span className="event-badge event-type" style={{backgroundColor: selectedEventInfo.color}}>
                {selectedEventInfo.type}
              </span>
            </div>
          </div>
          <div className="event-info-time">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{selectedEventInfo.time}</span>
          </div>
          {selectedEventInfo.description && (
            <div className="event-info-section">
              <div className="event-info-label">Description</div>
              <div className="event-info-desc">{selectedEventInfo.description}</div>
            </div>
          )}
          {selectedEventInfo.participantPhotos && selectedEventInfo.participantPhotos.length > 0 && (
            <div className="event-info-section">
              <div className="event-info-label">Participants</div>
              <div className="event-info-participants-list">
                {selectedEventInfo.participantPhotos.map((participant) => (
                  <div key={participant.userId} className="event-info-participant-item">
                    <ParticipantAvatar photo={participant.photo} apiUrl={apiUrl} name={participant.name} />
                    <span>{participant.name || participant.userId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <button 
            className="event-delete-btn" 
            onClick={() => deleteEvent(selectedEventInfo._id)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10 11v6M14 11v6M4 7h16M6 7h12v11a2 2 0 01-2 2H8a2 2 0 01-2-2V7zM9 5a1 1 0 011-1h4a1 1 0 011 1v2H9V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Delete Event
          </button>
        </div>
      )}
    </div>
  )
}

window.Calendar = Calendar
