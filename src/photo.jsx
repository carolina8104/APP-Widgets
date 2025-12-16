const { useState, useEffect, useRef } = React

function Photos({ userId, expanded, onToggleExpand }) {
  const [photos, setPhotos] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

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
