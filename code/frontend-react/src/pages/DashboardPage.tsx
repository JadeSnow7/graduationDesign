import { Link } from 'react-router-dom'

const DashboardPage = () => {
  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>Dashboard</h1>
          <p>Keep track of teaching activity, AI sessions, and simulations.</p>
        </div>
        <div className="pill">Role-aware workspace</div>
      </div>
      <div className="card-grid">
        <div className="card">
          <h2>Courses</h2>
          <p>Browse your active classes, assignments, and resources.</p>
          <Link className="link" to="/courses">
            View courses
          </Link>
        </div>
        <div className="card">
          <h2>AI Assistant</h2>
          <p>Ask the tutor, grade submissions, or validate formulas.</p>
          <Link className="link" to="/ai">
            Start a session
          </Link>
        </div>
        <div className="card">
          <h2>Simulation Lab</h2>
          <p>Run Laplace, point charge, or wave propagation simulations.</p>
          <Link className="link" to="/simulation">
            Run a simulation
          </Link>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
