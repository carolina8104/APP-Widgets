const { useState } = React

function Login({ apiUrl, onLoginSuccess }) {
    React.useEffect(() => {
        const prev = document.body.style.backgroundColor;
        document.body.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--background-login') || '#0F0F0F';
        return () => { document.body.style.backgroundColor = prev; };
    }, []);

    const [isRegister, setIsRegister] = useState(false)
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const endpoint = isRegister ? '/api/register' : '/api/login'
        const body = isRegister 
            ? { username, email, password }
            : { email, password }

        try {
            const response = await fetch(apiUrl + endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
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
        <div className="login-container">
            <h1>{isRegister ? 'Create Account' : 'Log In'}</h1>
            <form onSubmit={handleSubmit}>
                {isRegister && (
                    <div>
                        <label>Username:</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                )}
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
                {error && <p style={{color: 'white'}}>{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading 
                        ? (isRegister ? 'Creating account...' : 'Logging in...') 
                        : (isRegister ? 'Create Account' : 'Log In')
                    }
                </button>
            </form>
            <p>
                {isRegister ? 'Already have an account? ' : "Don't have an account yet? "}
                <button onClick={() => setIsRegister(!isRegister)}>
                    {isRegister ? 'Log in' : 'Create an account'}
                </button>
            </p>
        </div>
    )
}
