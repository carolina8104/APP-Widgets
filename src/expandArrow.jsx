function ExpandArrow({ onClick, expanded, color}) {
    return (
        <button 
            className={`expand-arrow ${expanded ? 'expanded' : ''}`}
            onClick={onClick}
            aria-label={expanded ? "Collapse widget" : "Expand widget"}
            style={{ color: color }}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path 
                    d="M7 17L17 7M17 7H7M17 7V17" 
                    strokeWidth="2.5"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    )
}
