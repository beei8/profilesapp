import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet } from './api'
import './App.css'

function Profile({ setIsLoggedIn }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/')
        return
      }

      const response = await apiGet('/api/profile', token)

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token')
        setIsLoggedIn(false)
        navigate('/')
      } else {
        setError('Failed to load profile')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    navigate('/')
  }

  const handleBackToHome = () => {
    navigate('/home')
  }

  if (loading) {
    return (
      <section id="center">
        <div>Loading profile...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="center">
        <div>
          <h1>Error</h1>
          <p>{error}</p>
          <button
            onClick={handleBackToHome}
            style={{ padding: '0.5rem', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', marginRight: '0.5rem' }}
          >
            Back to Home
          </button>
        </div>
      </section>
    )
  }

  return (
    <section id="center">
      <div>
        <h1>User Profile</h1>
        {profile && (
          <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Username:</strong> {profile.username}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>User ID:</strong> {profile.id}
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Account Created:</strong> {new Date(profile.created_at).toLocaleString()}
            </div>
            {profile.last_login && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Last Login:</strong> {new Date(profile.last_login).toLocaleString()}
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={handleBackToHome}
            style={{ padding: '0.5rem', backgroundColor: '#646cff', color: 'white', border: 'none', borderRadius: '4px', marginRight: '0.5rem' }}
          >
            Back to Home
          </button>
          <button
            onClick={handleLogout}
            style={{ padding: '0.5rem', backgroundColor: '#ff6464', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Logout
          </button>
        </div>
      </div>
    </section>
  )
}

export default Profile