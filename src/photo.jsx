const { useState, useEffect, useRef } = React

function Photos({ userId, apiUrl, expanded, onToggleExpand }) {
  const [photos, setPhotos] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const transitionTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)

    useEffect(() => {
        if (!userId) return
        
        fetch(`${apiUrl}/api/users/${userId}`)
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
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
            return photoPath
        }
        if (!photoPath.startsWith('/uploads/')) {
            const cleanPath = photoPath.startsWith('/') ? photoPath.substring(1) : photoPath
            return `${apiUrl}/uploads/${cleanPath}`
        }
        return `${apiUrl}${photoPath}`
    }

    const handleUploadClick = () => {
    }
    const handleFileSelect = async (event) => {
    }

    if (!photos || photos.length === 0) {
        return (
        <div className="photo-empty">
            Sem fotos disponíveis
            <button 
                className="photo-upload-btn-large" 
                aria-label="Upload photo"
            >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>
            <input 
                type="file" 
                accept="image/*"
                style={{ display: 'none' }}
            />
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

      <button 
        className="photo-upload-btn-small" 
        aria-label="Upload photo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      <input 
        type="file" 
        accept="image/*"
        style={{ display: 'none' }}
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

        <div className="photo-upload-overlay">
          <div className="photo-upload-spinner"></div>
        </div>
    </div>
  )
}
