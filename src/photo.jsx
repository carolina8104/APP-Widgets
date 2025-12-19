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
        fileInputRef.current?.click()
    }

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('photo', file)

            const response = await fetch(`${apiUrl}/api/users/${userId}/photos`, {
                method: 'POST',
                body: formData
            })

            const data = await response.json()
            if (response.ok) {
                if (data.photos) {
                    setPhotos(data.photos)
                    setCurrentIndex(data.photos.length - 1)
                }
            } else {
                alert('Error uploading photo: ' + data.error)
            }
        } catch (err) {
            alert('Error uploading photo: ' + err.message)
        } finally {
            setUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    if (!photos || photos.length === 0) {
        return (
        <div className="photo-empty">
            <button 
                className="photo-upload-btn-large" 
                onClick={handleUploadClick}
                disabled={uploading}
                aria-label="Upload photo"
            >
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {uploading && <div className="photo-upload-spinner"></div>}
            </button>
            <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleFileSelect}
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
        onClick={handleUploadClick}
        disabled={uploading}
        aria-label="Upload photo"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      <input 
        ref={fileInputRef}
        type="file" 
        accept="image/*"
        onChange={handleFileSelect}
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

      {uploading && (
        <div className="photo-upload-overlay">
          <div className="photo-upload-spinner"></div>
        </div>
      )}
    </div>
  )
}
