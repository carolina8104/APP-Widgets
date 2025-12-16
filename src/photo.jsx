const { useState, useEffect, useRef } = React

function Photos({ userId, expanded, onToggleExpand }) {
  const [photos, setPhotos] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const transitionTimeoutRef = useRef(null)

    useEffect(() => {
        if (!userId) return
        
        fetch(`http://localhost:3001/api/users/${userId}`)
        .then(res => res.json())
        .then(data => {
            if (data && !data.error && data.photos) {
            setPhotos(data.photos)
            }
        })
        .catch(err => console.error('Erro ao buscar fotos:', err))
    }, [userId])

    useEffect(() => {
        if (!photos || photos.length <= 1) return

        const interval = setInterval(() => {
        setCurrentIndex(prev => {
            const next = (prev + 1) % photos.length
            return next
        })
        }, 5000)

        return () => clearInterval(interval)
    }, [photos])

    useEffect(() => {
        return () => {
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
        }
    }, [])

    const getPhotoUrl = (photoPath) => {
        if (!photoPath) return ''
        if (photoPath.startsWith('/')) {
        return `http://localhost:3001${photoPath}`
        }
        return photoPath
    }

    if (!photos || photos.length === 0) {
        return (
        <div className="photo-empty">
            Sem fotos disponíveis
        </div>
        )
    }

  return (
    <div className="photo-container">
      <img 
        key={currentIndex}
        src={getPhotoUrl(photos[currentIndex])} 
        alt="Photo" 
        className="photo-image"
      />

      {photos.length > 1 && (
        <div className="photo-indicators">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`photo-indicator ${idx === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
