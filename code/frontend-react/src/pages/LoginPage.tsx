import { useLocation, useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { login } from '../features/auth/authService'
import { setAccessToken, setUserRole } from '../shared/auth/tokenStorage'

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await login({ username, password })
      setAccessToken(result.access_token)
      setUserRole(result.role)

      const redirectTo =
        (location.state as { from?: { pathname: string } })?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__header">
          <h1>Welcome back</h1>
          <p>Sign in to access courses, AI tutoring, and simulations.</p>
        </div>
        <form className="auth__form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Username</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="admin"
              autoComplete="username"
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <div className="alert alert--error">{error}</div> : null}
          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="auth__hint">
          <span>Default accounts:</span>
          <code>admin / admin123</code>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
