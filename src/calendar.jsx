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

const TabbedEvents = ({ events, apiUrl, eventStickers, availableStickers, removeStickerFromEvent, setSelectedEventInfo, handleEventDrop, handleEventDragOver, isCompact = false }) => {
  if (events.length === 0) return null
  
  const first = events[0]
  const numEvents = events.length
  
  if (numEvents === 1) {
    const event = first
    const classNames = isCompact 
      ? `calendar-event-compact ${event.heightClass}`
      : `calendar-event ${event.heightClass}`
    
    return (
      <div
        className={classNames}
        onClick={() => setSelectedEventInfo(event)}
        onDrop={isCompact ? undefined : (e) => handleEventDrop(e, event._id)}
        onDragOver={isCompact ? undefined : handleEventDragOver}
        style={{
          backgroundColor: event.color || 'var(--graph-4)',
          top: `${event.topPercent}%`,
          height: `${event.heightPercent}%`,
          ...(isCompact ? {} : {
            left: `${event.leftPercent}%`,
            width: `${event.widthPercent}%`
          })
        }}
      >
        <div className={isCompact ? "calendar-event-title-compact" : "calendar-event-title"}>{event.title}</div>
        {(() => {
          const parts = event.time && event.time.includes('-') ? event.time.split('-').map(p => p.trim()) : [event.time]
          return (
            <div className={isCompact ? "calendar-event-time-compact" : "calendar-event-time"}>
              <span className={isCompact ? "calendar-event-time-compact-line" : "calendar-event-time-line"}>{parts[0]}{parts[1] ? ' -' : ''}</span>
              {parts[1] && <span className={isCompact ? "calendar-event-time-compact-line" : "calendar-event-time-line"}>{parts[1]}</span>}
            </div>
          )
        })()}
        <ParticipantsList participants={event.participantPhotos} apiUrl={apiUrl} />
        {!isCompact && (
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
                  dangerouslySetInnerHTML={{ __html: sticker.svg }}
                />
              ) : null
            })()}
          </div>
        )}
      </div>
    )
  }
  
  let firstEventWidth
  let otherEventWidth
  if (numEvents === 2) {
    firstEventWidth = 56
    otherEventWidth = 44
  } else {
    firstEventWidth = 40
    otherEventWidth = (100 - firstEventWidth) / (numEvents - 1)
  }
  
  return (
    <div
      className={`simultaneous-events-container ${events.length > 1 ? 'multiple' : ''}`}
      style={{
        position: 'absolute',
        top: `${first.topPercent}%`,
        height: `${first.heightPercent}%`,
        ...(isCompact ? { width: '100%' } : { left: `0%`, width: `100%` })
      }}
    >
      {events.map((event, idx) => {
        const isFirst = idx === 0
        const width = isFirst ? firstEventWidth : otherEventWidth
        const left = isFirst ? 0 : firstEventWidth + (idx - 1) * otherEventWidth
        
        const classNames = isCompact 
          ? `calendar-event-compact ${event.heightClass} ${!isFirst ? 'no-time' : ''}`
          : `calendar-event ${event.heightClass} ${!isFirst ? 'no-time' : ''}`
        
        return (
          <div
            key={event._id}
            className={classNames}
            onClick={() => setSelectedEventInfo(event)}
            onDrop={isCompact ? undefined : (e) => handleEventDrop(e, event._id)}
            onDragOver={isCompact ? undefined : handleEventDragOver}
            style={{
              backgroundColor: event.color || 'var(--graph-4)',
              position: 'absolute',
              top: 0,
              left: `${left}%`,
              width: `${width}%`,
              height: '100%'
            }}
          >
            <div className={isCompact ? "calendar-event-title-compact" : "calendar-event-title"}>{event.title}</div>
            {isFirst && (() => {
              const parts = event.time && event.time.includes('-') ? event.time.split('-').map(p => p.trim()) : [event.time]
              return (
                <div className={isCompact ? "calendar-event-time-compact" : "calendar-event-time"}>
                  <span className={isCompact ? "calendar-event-time-compact-line" : "calendar-event-time-line"}>{parts[0]}{parts[1] ? ' -' : ''}</span>
                  {parts[1] && <span className={isCompact ? "calendar-event-time-compact-line" : "calendar-event-time-line"}>{parts[1]}</span>}
                </div>
              )
            })()}
            <ParticipantsList participants={event.participantPhotos} apiUrl={apiUrl} />
            {!isCompact && (
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
                      dangerouslySetInnerHTML={{ __html: sticker.svg }}
                    />
                  ) : null
                })()}
              </div>
            )}
          </div>
        )
      })}
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
  const [userLevel, setUserLevel] = useState(1)

  const deleteEvent = async (eventId) => {
    try {
      const response = await fetch(`${apiUrl}/api/tasks/${eventId}?userId=${userId}`, {
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

  const fetchUserLevel = () => {
    if (userId) {
      fetch(`${apiUrl}/api/users/${userId}`)
        .then(res => res.json())
        .then(data => setUserLevel(data?.level || 1))
        .catch(() => setUserLevel(1))
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
      fetchUserLevel()
      const eventSource = new EventSource(`${apiUrl}/api/events`)
      const updateCalendar = (data) => {
        if (data.userId === userId || (data.participants && data.participants.includes(userId))) {
          fetchEvents()
        }
      }
      eventSource.addEventListener('calendar-created', (event) => updateCalendar(JSON.parse(event.data)))
      eventSource.addEventListener('calendar-deleted', (event) => updateCalendar(JSON.parse(event.data)))
      eventSource.addEventListener('notification', (event) => {
        const data = JSON.parse(event.data)
        if (data.userId === userId && data.notification?.type === 'level-up') {
          setUserLevel(data.notification.level)
        }
      })
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
    { id:'check', name:'Done', svg: '<svg viewBox="0 0 24 24" fill="none" stroke="#4DCF31"><path d="M5 12.5L10.1538 20L20 2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'},
    { id: 'star', name: 'Star', svg: '<svg viewBox="0 0 24 24" fill="#FFCC00"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
    { id: 'cutlery', name: 'Cutlery', svg: '<svg viewBox="0 0 24 24" fill="rgba(0, 0, 0, 1)"><path xmlns="http://www.w3.org/2000/svg" d="M8 10.0005L8.5 3.00049H9V8.50049H9.5V3.00049H10V8.50049H10.5V3.00049H11L11.5 10.0005L10.5 11.0005V15.0005L11 22.0005H10H8.5L9 15.0005V11.0005L8 10.0005Z"/><path xmlns="http://www.w3.org/2000/svg" d="M15.9992 22.0002C15.9992 22.0002 15.5 4.00049 15.4992 3.4874C15.4985 2.97431 14.4992 3.00022 14.4992 3.00022C14.4992 3.00022 13.2731 5.90025 12.9992 7.87201C12.7636 9.56803 12.9992 12.2566 12.9992 12.2566C12.9992 12.2566 14.4985 12.4618 14.4992 13.231C14.5 14.0002 13.4992 22.0002 13.4992 22.0002H15.9992Z"/></svg>' },
    { id:'heart1', name:'Heart1', svg: '<svg viewBox="0 0 24 24"><path fill="#FE3A2A" xmlns="http://www.w3.org/2000/svg" d="M12.0011 22L2.66824 12.2258C1.92379 11.4462 1.42748 10.5397 1.17933 9.50654C0.937234 8.47334 0.94026 7.44648 1.18841 6.42596C1.43656 5.3991 1.92984 4.50535 2.66824 3.74471C3.4248 2.96506 4.28728 2.44846 5.25567 2.19491C6.23012 1.93503 7.20154 1.93503 8.16994 2.19491C9.14438 2.4548 10.0099 2.9714 10.7664 3.74471L12.0011 4.99976L13.2359 3.74471C13.9985 2.9714 14.864 2.4548 15.8324 2.19491C16.8008 1.93503 17.7692 1.93503 18.7376 2.19491C19.712 2.44846 20.5775 2.96506 21.3341 3.74471C22.0725 4.50535 22.5657 5.3991 22.8139 6.42596C23.062 7.44648 23.062 8.47334 22.8139 9.50654C22.5718 10.5397 22.0785 11.4462 21.3341 12.2258L12.0011 22Z"/></svg>'},
    { id:'heart2', name:'Heart2', svg: '<svg viewBox="0 0 24 24"><path fill="#EF2A9C" xmlns="http://www.w3.org/2000/svg" d="M12.0011 22L2.66824 12.2258C1.92379 11.4462 1.42748 10.5397 1.17933 9.50654C0.937234 8.47334 0.94026 7.44648 1.18841 6.42596C1.43656 5.3991 1.92984 4.50535 2.66824 3.74471C3.4248 2.96506 4.28728 2.44846 5.25567 2.19491C6.23012 1.93503 7.20154 1.93503 8.16994 2.19491C9.14438 2.4548 10.0099 2.9714 10.7664 3.74471L12.0011 4.99976L13.2359 3.74471C13.9985 2.9714 14.864 2.4548 15.8324 2.19491C16.8008 1.93503 17.7692 1.93503 18.7376 2.19491C19.712 2.44846 20.5775 2.96506 21.3341 3.74471C22.0725 4.50535 22.5657 5.3991 22.8139 6.42596C23.062 7.44648 23.062 8.47334 22.8139 9.50654C22.5718 10.5397 22.0785 11.4462 21.3341 12.2258L12.0011 22Z"/></svg>'},
    { id:'heart3', name:'Heart3', svg: '<svg viewBox="0 0 24 24"><path fill="#FFCC00" xmlns="http://www.w3.org/2000/svg" d="M12.0011 22L2.66824 12.2258C1.92379 11.4462 1.42748 10.5397 1.17933 9.50654C0.937234 8.47334 0.94026 7.44648 1.18841 6.42596C1.43656 5.3991 1.92984 4.50535 2.66824 3.74471C3.4248 2.96506 4.28728 2.44846 5.25567 2.19491C6.23012 1.93503 7.20154 1.93503 8.16994 2.19491C9.14438 2.4548 10.0099 2.9714 10.7664 3.74471L12.0011 4.99976L13.2359 3.74471C13.9985 2.9714 14.864 2.4548 15.8324 2.19491C16.8008 1.93503 17.7692 1.93503 18.7376 2.19491C19.712 2.44846 20.5775 2.96506 21.3341 3.74471C22.0725 4.50535 22.5657 5.3991 22.8139 6.42596C23.062 7.44648 23.062 8.47334 22.8139 9.50654C22.5718 10.5397 22.0785 11.4462 21.3341 12.2258L12.0011 22Z"/></svg>'},    
    { id:'heart4', name:'Heart4', svg: '<svg viewBox="0 0 24 24"><path fill="#8eb4ffff" xmlns="http://www.w3.org/2000/svg" d="M12.0011 22L2.66824 12.2258C1.92379 11.4462 1.42748 10.5397 1.17933 9.50654C0.937234 8.47334 0.94026 7.44648 1.18841 6.42596C1.43656 5.3991 1.92984 4.50535 2.66824 3.74471C3.4248 2.96506 4.28728 2.44846 5.25567 2.19491C6.23012 1.93503 7.20154 1.93503 8.16994 2.19491C9.14438 2.4548 10.0099 2.9714 10.7664 3.74471L12.0011 4.99976L13.2359 3.74471C13.9985 2.9714 14.864 2.4548 15.8324 2.19491C16.8008 1.93503 17.7692 1.93503 18.7376 2.19491C19.712 2.44846 20.5775 2.96506 21.3341 3.74471C22.0725 4.50535 22.5657 5.3991 22.8139 6.42596C23.062 7.44648 23.062 8.47334 22.8139 9.50654C22.5718 10.5397 22.0785 11.4462 21.3341 12.2258L12.0011 22Z"/></svg>'},    
    { id:'heart5', name:'Heart5', svg: '<svg viewBox="0 0 24 24"><path fill="#4DCF31" xmlns="http://www.w3.org/2000/svg" d="M12.0011 22L2.66824 12.2258C1.92379 11.4462 1.42748 10.5397 1.17933 9.50654C0.937234 8.47334 0.94026 7.44648 1.18841 6.42596C1.43656 5.3991 1.92984 4.50535 2.66824 3.74471C3.4248 2.96506 4.28728 2.44846 5.25567 2.19491C6.23012 1.93503 7.20154 1.93503 8.16994 2.19491C9.14438 2.4548 10.0099 2.9714 10.7664 3.74471L12.0011 4.99976L13.2359 3.74471C13.9985 2.9714 14.864 2.4548 15.8324 2.19491C16.8008 1.93503 17.7692 1.93503 18.7376 2.19491C19.712 2.44846 20.5775 2.96506 21.3341 3.74471C22.0725 4.50535 22.5657 5.3991 22.8139 6.42596C23.062 7.44648 23.062 8.47334 22.8139 9.50654C22.5718 10.5397 22.0785 11.4462 21.3341 12.2258L12.0011 22Z"/></svg>'},    
    { id: 'music', name: 'Music', svg: '<svg viewBox="0 0 24 24" fill="#000000ff"><path d="M12 3V14.55A4 4 0 1014 17V7h4V3h-6z"/></svg>'},
    { id: 'bolt', name: 'Lightning', svg: '<svg viewBox="0 0 24 24" fill="#FFCC00"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>'},
    { id: 'sun', name: 'Sun', svg: '<svg viewBox="0 0 24 24" fill="#FFCC00"><path xmlns="http://www.w3.org/2000/svg" d="M12 15.946C11.2783 15.946 10.6177 15.7685 10.0183 15.4135C9.41879 15.0585 8.94154 14.5812 8.58651 13.9817C8.23149 13.3823 8.05397 12.7217 8.05397 12C8.05397 11.2725 8.23149 10.6119 8.58651 10.0183C8.94154 9.41878 9.41879 8.94153 10.0183 8.58651C10.6177 8.23148 11.2783 8.05397 12 8.05397C12.7275 8.05397 13.3881 8.23148 13.9817 8.58651C14.5812 8.94153 15.0585 9.41878 15.4135 10.0183C15.7685 10.6119 15.946 11.2725 15.946 12C15.946 12.7217 15.7685 13.3823 15.4135 13.9817C15.0585 14.5812 14.5812 15.0585 13.9817 15.4135C13.3881 15.7685 12.7275 15.946 12 15.946ZM11.1619 6.30794V1H12.8381V6.30794H11.1619ZM16.6095 8.57778L15.4222 7.39047L19.1937 3.61905L20.381 4.80635L16.6095 8.57778ZM17.6921 12.8381V11.1619H23V12.8381H17.6921ZM19.1937 20.3809L15.4222 16.6095L16.6095 15.4222L20.381 19.1937L19.1937 20.3809ZM11.1619 23V17.6921H12.8381V23H11.1619ZM4.80635 20.3809L3.61905 19.1937L7.39048 15.4222L8.57778 16.6095L4.80635 20.3809ZM1 12.8381V11.1619H6.30794V12.8381H1ZM7.39048 8.57778L3.61905 4.80635L4.80635 3.61905L8.57778 7.39047L7.39048 8.57778Z"/></svg>' },
    { id: 'airplane', name: 'Airplane', svg: '<svg viewBox="0 0 24 24" fill="rgba(0, 0, 0, 1)" xmlns="http://www.w3.org/2000/svg"><path d="M9.25 22L14.75 12.8571H21.9C21.9 12.8571 23 12.3455 23 11.7143C23 11.0831 21.9 10.5714 21.9 10.5714H14.2L9.8 2H7.6L9.8 10.5714H4.85L3.75 8.85714H1L2.65 11.7143L1 14.5714H3.2L4.85 12.8571H9.8L7.05 22H9.25Z" fill="black"/></svg>' },
    { id: 'fire', name: 'Fire', svg: '<svg viewBox="0 0 24 24" fill="#FF4500"><path d="M13.5 0c-1.25 2.5-.75 5.5 0 7.5-2.5-1.5-3.5-3.5-3.5-6C6.5 3.5 4 7 4 10.5c0 4.14 3.36 7.5 7.5 7.5s7.5-3.36 7.5-7.5c0-2.5-1-5-3.5-7 .75 2 1.25 5 0 7.5.5-2.5-.5-5.5-2-7.5z"/></svg>' },
    { id: 'sparkle', name: 'sparkle', svg: '<svg viewBox="0 0 24 24" fill="#FFCC00" xmlns="http://www.w3.org/2000/svg"><path d="M12.1094 22C11.9661 20.8715 11.5885 19.6563 10.9766 18.3542C10.3646 17.0347 9.49219 15.8108 8.35937 14.6823C7.23958 13.5538 6.11979 12.8333 5 12.5208V11.4271C6.10677 11.0799 7.16797 10.4375 8.18359 9.5C9.21224 8.54514 10.0716 7.3993 10.7617 6.0625C11.4648 4.69097 11.9141 3.3368 12.1094 2H12.9297C13.0469 2.86805 13.2812 3.76215 13.6328 4.68229C13.9844 5.58507 14.4336 6.45312 14.9805 7.28646C15.5404 8.10243 16.1654 8.84028 16.8555 9.5C17.8841 10.4722 18.9323 11.1146 20 11.4271V12.5208C19.2839 12.7118 18.5417 13.1024 17.7734 13.6927C17.0182 14.283 16.3151 14.9861 15.6641 15.8021C15.013 16.6007 14.4792 17.4427 14.0625 18.3281C13.4505 19.6302 13.0729 20.8542 12.9297 22H12.1094Z"/></svg>' },
    { id: 'weight', name: 'weight', svg: '<svg viewBox="0 0 24 24" fill="rgba(0, 0, 0, 1)" xmlns="http://www.w3.org/2000/svg"><rect x="15.7676" y="8" width="5.12329" height="7.23288"/><rect x="20.8906" y="9.20557" width="2.10959" height="5.12329"/><rect width="5.12329" height="7.23288" transform="matrix(-1 0 0 1 8.23242 8)"/><rect width="2.10959" height="5.12329" transform="matrix(-1 0 0 1 3.10938 9.20557)"/><rect x="6.42578" y="11.0137" width="12.0548" height="1.20548"/></svg>'},
    { id: 'coffee', name: 'Coffee', svg: '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.6832 6H5C5 6 5 15.0594 5.90594 17.7772C6.81188 20.495 15.2334 20.604 16.4583 18.7376C17.6832 16.8713 17.6832 7.81188 17.6832 7.81188V6Z" fill="black"/><path d="M17.6832 8.71782V6H5C5 6 5 15.0594 5.90594 17.7772C6.81188 20.495 15.2334 20.604 16.4583 18.7376C17.6832 16.8713 17.6832 7.81188 17.6832 7.81188" stroke="black"/><path d="M21.2424 12.4657C20.9345 10.029 16.6569 9.02991 16.6569 9.02991L16.2943 16.3948C16.2943 16.3948 21.5949 15.2563 21.2424 12.4657Z" fill="none" stroke="black" stroke-width="2"/></svg></svg>'},
    { id: 'flower', name: 'Flower', svg: '<svg viewBox="0 0 24 24" fill="#EF2A9C" xmlns="http://www.w3.org/2000/svg"><path d="M7.66576 22C6.94837 22 6.2808 21.8142 5.66304 21.4427C5.06522 21.0908 4.57699 20.6117 4.19837 20.0056C3.83967 19.3994 3.66033 18.7346 3.66033 18.0112C3.66033 16.9553 4.05888 16.0559 4.85598 15.3129C5.67301 14.5698 6.68931 14.1397 7.90489 14.0223L7.60598 13.0838C7.20743 13.2989 6.74909 13.4846 6.23098 13.6411C5.73279 13.7975 5.25453 13.8757 4.7962 13.8757C4.0788 13.8757 3.43116 13.6997 2.85326 13.3478C2.29529 12.9763 1.84692 12.4972 1.50815 11.9106C1.16938 11.3045 1 10.6592 1 9.97486C1 9.23184 1.17935 8.56704 1.53804 7.98045C1.91667 7.3743 2.40489 6.89525 3.00272 6.5433C3.60054 6.19134 4.25815 6.01536 4.97554 6.01536C5.79257 6.01536 6.57971 6.29888 7.33696 6.86592C8.0942 7.43296 8.64221 8.11732 8.98098 8.91899L9.75815 8.3324C9.22011 7.84358 8.7817 7.30587 8.44294 6.71927C8.12409 6.11313 7.96467 5.53631 7.96467 4.98883C7.96467 4.24581 8.14402 3.58101 8.50272 2.99441C8.86141 2.38827 9.33967 1.90922 9.9375 1.55726C10.5553 1.18575 11.2328 1 11.9701 1C12.7074 1 13.385 1.18575 14.0027 1.55726C14.6205 1.90922 15.1087 2.38827 15.4674 2.99441C15.846 3.60056 16.0353 4.26536 16.0353 4.98883C16.0353 5.53631 15.8659 6.12291 15.5272 6.7486C15.1884 7.35475 14.76 7.88268 14.2418 8.3324L15.019 8.91899C15.3578 8.09777 15.8958 7.41341 16.6332 6.86592C17.3904 6.29888 18.1875 6.01536 19.0245 6.01536C19.7418 6.01536 20.3995 6.19134 20.9973 6.5433C21.615 6.89525 22.1033 7.3743 22.462 7.98045C22.8207 8.56704 23 9.23184 23 9.97486C23 10.6592 22.8207 11.3045 22.462 11.9106C22.1232 12.4972 21.6649 12.9763 21.087 13.3478C20.529 13.6997 19.9112 13.8757 19.2337 13.8757C18.337 13.8757 17.3904 13.6117 16.394 13.0838L16.0951 14.0223C16.8922 14.1006 17.6096 14.3254 18.2473 14.6969C18.885 15.0489 19.3931 15.5182 19.7717 16.1047C20.1504 16.6718 20.3397 17.3073 20.3397 18.0112C20.3397 18.7151 20.1504 19.3701 19.7717 19.9763C19.413 20.5824 18.9348 21.0712 18.337 21.4427C17.7391 21.8142 17.0716 22 16.3342 22C15.1984 22 14.2518 21.6187 13.4946 20.8561C12.7373 20.074 12.3587 19.0768 12.3587 17.8645C12.3587 17.4148 12.4085 16.9944 12.5082 16.6034H11.4918C11.5317 16.7989 11.5616 17.0042 11.5815 17.2193C11.6214 17.4344 11.6413 17.6494 11.6413 17.8645C11.6413 19.0573 11.2627 20.0447 10.5054 20.8268C9.74819 21.6089 8.80163 22 7.66576 22ZM11.9701 15.8408C12.6476 15.8408 13.2654 15.6746 13.8234 15.3422C14.3813 15.0098 14.8297 14.5698 15.1685 14.0223C15.5072 13.4749 15.6766 12.8687 15.6766 12.2039C15.6766 11.5391 15.5072 10.933 15.1685 10.3855C14.8297 9.83799 14.3813 9.39805 13.8234 9.06564C13.2654 8.73324 12.6476 8.56704 11.9701 8.56704C11.2926 8.56704 10.6748 8.73324 10.1168 9.06564C9.5788 9.39805 9.1404 9.83799 8.80163 10.3855C8.48279 10.933 8.32337 11.5391 8.32337 12.2039C8.32337 12.8687 8.48279 13.4846 8.80163 14.0517C9.1404 14.5992 9.58877 15.0391 10.1467 15.3715C10.7047 15.6844 11.3125 15.8408 11.9701 15.8408Z"/></svg>'},
    { id: 'drink', name: 'Drink', svg: '<svg viewBox="0 0 24 24" fill="#000000ff" xmlns="http://www.w3.org/2000/svg"><path d="M18.5 4H5L10.5 11C10.5 11 10.9144 11.5719 11 12C11.5 14.5 11 18.5 11 18.5C9.5 19 7 20 7 20C7 20 6 20.5 11.5 20.5C17 20.5 16 20 16 20L12 18.5C12 18.5 11.6041 14.1651 12.5 12C12.6669 11.5966 13 11 13 11L18.5 4Z" fill="black"/><rect x="15.9395" y="1" width="1" height="6" transform="rotate(34.9855 15.9395 1)" fill="black"/></svg>'},
    { id: 'cloud', name: 'Cloud', svg: '<svg viewBox="0 0 24 24" fill="#8eb4ffff"><path d="M19 18H6C3.79 18 2 16.21 2 14C2 11.79 3.79 10 6 10H7V9C7 6.79 8.79 5 11 5C13.21 5 15 6.79 15 9V10H16C18.21 10 20 11.79 20 14C20 15.66 18.66 17 17 17H19Z"/></svg>'},
    { id: 'arrowUP', name: 'ArrowUP', svg: '<svg viewBox="0 0 24 24" fill="#4DCF31"><path d="M12 2L8 8H10V18H14V8H16L12 2Z"/></svg>'},
    { id: 'arrowDown', name: 'Arrow Down', svg: '<svg viewBox="0 0 24 24" fill="#4DCF31"><path d="M12 22L16 16H14V6H10V16H8L12 22Z"/></svg>'},
    { id: 'arrowLeft', name: 'Arrow Left', svg: '<svg viewBox="0 0 24 24" fill="#4DCF31"><path d="M2 12L8 16V14H18V10H8V8L2 12Z"/></svg>'},
    { id: 'arrowRight', name: 'Arrow Right', svg: '<svg viewBox="0 0 24 24" fill="#4DCF31"><path d="M22 12L16 8V10H6V14H16V16L22 12Z"/></svg>'},
    { id: 'house', name: 'House', svg: '<svg viewBox="0 0 24 24" fill="black"><path d="M12 3L2 12H5V20H10V14H14V20H19V12H22L12 3Z"/></svg>'},
    { id: 'smile', name: 'Smile', svg: '<svg viewBox="0 0 24 24" fill="#FFCC00"><circle cx="12" cy="12" r="10"/><path d="M8 14C9.333 15.333 10.667 15.333 12 14C13.333 15.333 14.667 15.333 16 14" stroke="black" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="10" r="1" fill="black"/><circle cx="15" cy="10" r="1" fill="black"/></svg>'},
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

    try {
      console.debug('layoutEventsInColumn - initial:', items.map(it => ({ _id: it._id, time: it.time, topPercent: it.topPercent, heightPercent: it.heightPercent })))
    } catch (e) {
      console.debug('layoutEventsInColumn debug initial error', e)
    }

    const overlaps = (a, b) => {
      if (!(a.time && b.time && a.time === b.time)) return false
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

    try {
      console.debug('layoutEventsInColumn - before return:', items.map(it => ({ _id: it._id, leftPercent: it.leftPercent, widthPercent: it.widthPercent, topPercent: it.topPercent, heightPercent: it.heightPercent })))
    } catch (e) {
      console.debug('layoutEventsInColumn debug before return error', e)
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

  const getStartTimeFromTimeString = (timeString) => {
    if (!timeString) return null
    const parts = timeString.split('-')
    return parts[0] ? parts[0].trim() : null
  }

  const getColorByType = (type) => {
    const colors = {
      study: 'var(--color-primary-1)',
      work: 'var(--color-primary-2)',
      personal: 'var(--color-primary-3)',
      exercise: 'var(--color-neutral-1)',
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

                      return groups.map((group, gi) => (
                        <TabbedEvents
                          key={`g-${gi}-${group[0]._id}`}
                          events={group}
                          apiUrl={apiUrl}
                          eventStickers={eventStickers}
                          availableStickers={availableStickers}
                          removeStickerFromEvent={removeStickerFromEvent}
                          setSelectedEventInfo={setSelectedEventInfo}
                          handleEventDrop={handleEventDrop}
                          handleEventDragOver={handleEventDragOver}
                          isCompact={false}
                        />
                      ))
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

        <div className="calendar-sticker-widget">
          <h3 className="calendar-mini-title">Sticker collection</h3>
          <div className="sticker-grid">
            {availableStickers.map((sticker, idx) => {
              const isUnlocked = idx < 1 + Math.floor((userLevel - 1) / 3)
              return (
                <div 
                  key={sticker.id}
                  className={`sticker-item ${!isUnlocked ? 'sticker-locked' : ''}`}
                  draggable={isUnlocked}
                  onDragStart={isUnlocked ? () => handleStickerDragStart(sticker.id) : undefined}
                  style={{ opacity: isUnlocked ? 1 : 0.3, cursor: isUnlocked ? 'grab' : 'not-allowed' }}
                >
                  <div 
                    className="sticker-svg"
                    dangerouslySetInnerHTML={{ __html: sticker.svg }}
                  />
                  {!isUnlocked && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="11" width="14" height="10" rx="2" stroke="var(--text-default)" strokeWidth="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="var(--text-default)" strokeWidth="2"/>
                      </svg>
                    </div>
                  )}
                </div>
              )
            })}
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

                  return groups.map((group, gi) => (
                    <TabbedEvents
                      key={`cg-${gi}-${group[0]._id}`}
                      events={group}
                      apiUrl={apiUrl}
                      eventStickers={eventStickers}
                      availableStickers={availableStickers}
                      removeStickerFromEvent={removeStickerFromEvent}
                      setSelectedEventInfo={setSelectedEventInfo}
                      handleEventDrop={handleEventDrop}
                      handleEventDragOver={handleEventDragOver}
                      isCompact={true}
                    />
                  ))
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
