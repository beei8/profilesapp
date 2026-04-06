import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from './api'
import './App.css'

function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await apiPost('/api/login', { username, password })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        setIsLoggedIn(true)
        navigate('/home')
      } else {
        const errorData = await response.json()
        setError(errorData.message)
      }
    } catch (err) {
      setError('Network error')
    }
  }

  return (
    <section id="center">
      <div>
        <h1>Login</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '0.5rem' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.5rem' }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" style={{ padding: '0.5rem', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px' }}>
            Login
          </button>
        </form>
      </div>
    </section>
  )
}

export default Login