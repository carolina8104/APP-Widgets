const { useState, useEffect } = React

function TimeTracker({ userId, expanded, onToggleExpand }) {
    const [seconds, setSeconds] = useState(0)
    const [running, setRunning] = useState(false)

    useEffect(() => {
        let id = null
        if (running) id = setInterval(() => setSeconds(s => s + 1), 1000)
        return () => clearInterval(id)
    }, [running])

    const h = String(Math.floor(seconds / 3600)).padStart(2, "0")
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
    const s = String(seconds % 60).padStart(2, "0")

    function reset() {
        setRunning(false)
        setSeconds(0)
    }

    return (
        <div className={`tt-container ${expanded ? "tt-expanded" : ""}`}>
            <div className="tt-grid">
                <div className="tt-title">Time tracker</div>
                <ExpandArrow onClick={onToggleExpand} expanded={expanded} color="var(--accent-neon)" />
                <div 
                    className="tt-blocks"
                    onClick={(e) => {
                        if (!expanded && !e.target.closest('.expand-arrow')) {
                            onToggleExpand()
                        }
                    }}
                    style={{ cursor: !expanded ? 'pointer' : 'default' }}
                >
                    <div className="tt-block"><span>{h}</span><label>H</label></div>
                    <div className="tt-block"><span>{m}</span><label>M</label></div>
                    <div className="tt-block"><span>{s}</span><label>S</label></div>
                </div>

                <div className="tt-btn-row">
                    <button className="tt-circle" onClick={() => setRunning(!running)}>
                        {running ? (
                            <svg width="14" height="14" viewBox="0 0 24 24">
                                <rect x="6" y="5" width="4" height="14" rx="1" fill="var(--panel)" />
                                <rect x="14" y="5" width="4" height="14" rx="1" fill="var(--panel)" />
                            </svg>
                        ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24">
                                <path d="M6 4l14 8-14 8V4z" fill="var(--panel)" />
                            </svg>
                        )}
                    </button>

                    <button className="tt-circle" onClick={reset}>
                        <svg width="14" height="14" viewBox="0 0 24 24">
                            <path d="M12 5v2a5 5 0 1 1-5 5" stroke="var(--panel)" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 2v3H9" stroke="var(--panel)" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}