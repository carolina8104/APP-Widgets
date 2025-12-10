const { useState, useEffect } = React

function App() {

    return (
        <div>
            <div>
                <Widget
                    w = "200px"
                    h = "200px"
                    color="red"
                    content={<Notes />}
                />
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
