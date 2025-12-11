const { useState, useEffect } = React

function App() {

    return (
      <div className="notes">
        <Widget color="var(--accent-yellow)" content={<Notes userId="user123" />} />
      </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
