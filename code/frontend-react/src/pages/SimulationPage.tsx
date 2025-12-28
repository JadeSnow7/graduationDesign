import { useState, type ChangeEvent, type FormEvent } from 'react'
import { runLaplace2d, type LaplaceResponse } from '../features/simulation/simulationService'

const SimulationPage = () => {
  const [form, setForm] = useState({
    nx: 60,
    ny: 40,
    v_top: 1,
    v_bottom: 0,
    v_left: 0,
    v_right: 0,
    max_iterations: 1000,
    tolerance: 0.000001,
  })
  const [result, setResult] = useState<LaplaceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  const handleNumberChange =
    (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [key]: Number(event.target.value),
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsRunning(true)
    setError(null)

    try {
      const data = await runLaplace2d({
        ...form,
        visualization: {
          show_contour: true,
          show_field: true,
          colormap: 'viridis',
        },
      })
      setResult(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Simulation failed'
      setError(message)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>Simulation Lab</h1>
          <p>Run a Laplace 2D simulation and inspect the potential field.</p>
        </div>
      </div>
      <div className="grid-two">
        <form className="card form" onSubmit={handleSubmit}>
          <h2>Laplace 2D setup</h2>
          <div className="form__grid">
            <label className="field">
              <span className="field__label">Grid X</span>
              <input type="number" min={10} value={form.nx} onChange={handleNumberChange('nx')} />
            </label>
            <label className="field">
              <span className="field__label">Grid Y</span>
              <input type="number" min={10} value={form.ny} onChange={handleNumberChange('ny')} />
            </label>
            <label className="field">
              <span className="field__label">V top</span>
              <input type="number" step="0.1" value={form.v_top} onChange={handleNumberChange('v_top')} />
            </label>
            <label className="field">
              <span className="field__label">V bottom</span>
              <input
                type="number"
                step="0.1"
                value={form.v_bottom}
                onChange={handleNumberChange('v_bottom')}
              />
            </label>
            <label className="field">
              <span className="field__label">V left</span>
              <input type="number" step="0.1" value={form.v_left} onChange={handleNumberChange('v_left')} />
            </label>
            <label className="field">
              <span className="field__label">V right</span>
              <input type="number" step="0.1" value={form.v_right} onChange={handleNumberChange('v_right')} />
            </label>
            <label className="field">
              <span className="field__label">Max iterations</span>
              <input
                type="number"
                min={100}
                value={form.max_iterations}
                onChange={handleNumberChange('max_iterations')}
              />
            </label>
            <label className="field">
              <span className="field__label">Tolerance</span>
              <input
                type="number"
                step="0.000001"
                value={form.tolerance}
                onChange={handleNumberChange('tolerance')}
              />
            </label>
          </div>
          <button type="submit" className="button" disabled={isRunning}>
            {isRunning ? 'Running...' : 'Run simulation'}
          </button>
          {error ? <div className="alert alert--error">{error}</div> : null}
        </form>
        <div className="card">
          <h2>Result</h2>
          {result?.png_base64 ? (
            <div className="result">
              <img
                src={`data:image/png;base64,${result.png_base64}`}
                alt="Laplace 2D result"
              />
              <div className="result__meta">
                <span>Iterations: {result.metadata.iterations}</span>
                <span>Error: {result.metadata.convergence_error}</span>
                <span>Time: {result.metadata.computation_time}s</span>
              </div>
            </div>
          ) : (
            <div className="empty">Run the simulation to see the output.</div>
          )}
        </div>
      </div>
    </section>
  )
}

export default SimulationPage
