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
            </div>
        </div>
    )
}