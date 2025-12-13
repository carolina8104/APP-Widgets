const { useState } = React

function Login({ onLoginSuccess }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error)
                setLoading(false)
                return
            }

            onLoginSuccess(data)
        } catch (err) {
            setError('Network error. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div>
            <h1>Sign in</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{color: 'red'}}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </div>
    )
}
