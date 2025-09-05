import { useEffect, useState } from 'react'
import './App.css'

type Role = 'admin' | 'subadmin'

function App() {
  const [token, setToken] = useState<string | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('changeme123')
  const [userUrl, setUserUrl] = useState('https://your-site.com/user.jpg')
  const [garmentUrl, setGarmentUrl] = useState('https://your-site.com/item.jpg')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('jwt')
    const savedRole = localStorage.getItem('role') as Role | null
    if (saved) setToken(saved)
    if (savedRole) setRole(savedRole)
  }, [])

  const login = async () => {
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      setToken(data.token)
      setRole(data.role)
      localStorage.setItem('jwt', data.token)
      localStorage.setItem('role', data.role)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const tryOn = async () => {
    if (!token) return
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/glam/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mask_media_type: 'overall',
          user: { url: userUrl },
          garment: { url: garmentUrl },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Try-on failed')
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const logout = () => {
    setToken(null)
    setRole(null)
    localStorage.removeItem('jwt')
    localStorage.removeItem('role')
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h2>Glam.AI Admin Panel</h2>
      {!token ? (
        <div>
          <h3>Login</h3>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={login}>Login</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      ) : (
        <div>
          <p>
            Logged in as {role} <button onClick={logout}>Logout</button>
          </p>
          <h3>Virtual Try-On</h3>
          <input placeholder="User Image URL" value={userUrl} onChange={(e) => setUserUrl(e.target.value)} />
          <input placeholder="Garment Image URL" value={garmentUrl} onChange={(e) => setGarmentUrl(e.target.value)} />
          <button onClick={tryOn}>Run Try-On</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {result && (
            <pre style={{ background: '#111', color: '#0f0', padding: 12, overflow: 'auto' }}>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  )
}

export default App
