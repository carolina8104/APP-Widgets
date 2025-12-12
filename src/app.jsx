const { useState, useEffect } = React

function App() {

    return (
        <div className="dashboard-grid">

            <div className="friends">
                <Widget color="var(--accent-neon)" content={""} />
            </div>

            <div className="timeTracker">
                <Widget color="var(--accent-neon)" content={<TimeTracker userId="user123" />} />
            </div>

             <div className="notes">
                <Widget color="var(--accent-yellow)" content={<Notes userId="user123" />} />
            </div>

            <div className="tasks">
                <Widget color="var(--accent-neon)" content={""} />
            </div>

            <div className="photo">
                <Widget color="var(--accent-neon)" content={""} />
            </div>

            <div className="progress">
                <Widget color="var(--accent-neon)" content={""} />
            </div>

            <div className="calendar">
                <Widget color="var(--accent-neon)" content={""} />
            </div>

        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
