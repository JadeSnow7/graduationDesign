import { useEffect, useState } from 'react'
import { getCurrentUser, type CurrentUser } from '../features/auth/authService'
import { getUserRole } from '../shared/auth/tokenStorage'

const ProfilePage = () => {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await getCurrentUser()
        if (isMounted) {
          setUser(data)
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : 'Unable to load profile'
          setError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>Profile</h1>
          <p>Account and permission overview.</p>
        </div>
      </div>
      {isLoading ? <div className="empty">Loading profile...</div> : null}
      {error ? <div className="alert alert--error">{error}</div> : null}
      {!isLoading && user ? (
        <div className="card">
          <h2>{user.name}</h2>
          <div className="list">
            <div className="list__row">
              <span>Username</span>
              <span>{user.username}</span>
            </div>
            <div className="list__row">
              <span>Email</span>
              <span>{user.email}</span>
            </div>
            <div className="list__row">
              <span>Role</span>
              <span>{user.role || getUserRole()}</span>
            </div>
            <div className="list__row">
              <span>Permissions</span>
              <span>{user.permissions.join(', ')}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default ProfilePage
