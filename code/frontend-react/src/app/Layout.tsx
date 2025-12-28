import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearAccessToken } from '../shared/auth/tokenStorage'

const Layout = () => {
  const navigate = useNavigate()

  const handleSignOut = () => {
    clearAccessToken()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">EMF Studio</div>
        <nav className="sidebar__nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/ai">AI Assistant</NavLink>
          <NavLink to="/simulation">Simulation</NavLink>
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <button type="button" className="button button--ghost" onClick={handleSignOut}>
          Sign out
        </button>
      </aside>
      <div className="content">
        <header className="topbar">
          <div>
            <div className="topbar__eyebrow">Electromagnetics Teaching Platform</div>
            <div className="topbar__title">AI + Simulation Workspace</div>
          </div>
          <div className="topbar__actions">
            <NavLink to="/profile" className="button button--quiet">
              View profile
            </NavLink>
          </div>
        </header>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
