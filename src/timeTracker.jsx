function TimeTracker({ userId}) {

    const h = "01"
    const m = "02"
    const s = "53"

    return (
        <div className="tt-container">
            <div className="tt-grid">
                <div className="tt-title">Time tracker</div>
                <div className="tt-blocks">
                    <div className="tt-block"><span>{h}</span><label>H</label></div>
                    <div className="tt-block"><span>{m}</span><label>M</label></div>
                    <div className="tt-block"><span>{s}</span><label>S</label></div>
                </div>

                <div className="tt-btn-row">
                    <button className="tt-circle">
                            <svg width="14" height="14" viewBox="0 0 24 24">
                                <rect x="6" y="5" width="4" height="14" rx="1" fill="var(--panel)" />
                                <rect x="14" y="5" width="4" height="14" rx="1" fill="var(--panel)" />
                            </svg>
                    </button>

                    <button className="tt-circle">
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