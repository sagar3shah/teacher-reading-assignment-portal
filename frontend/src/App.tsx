import { useEffect, useState } from 'react'
import './App.css'

type HealthResponse = {
  status: string
  service: string
  timestamp: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadHealth() {
      try {
        const response = await fetch('/api/health')

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = (await response.json()) as HealthResponse

        if (isActive) {
          setHealth(data)
        }
      } catch (requestError: unknown) {
        if (isActive) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to reach backend')
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadHealth()

    return () => {
      isActive = false
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="status-card">
        <p className="eyebrow">Teacher Reading Assignment Portal</p>
        <h1>Frontend and backend are wired together.</h1>
        <p className="intro">This page calls the Spring Boot API through the Vite dev proxy.</p>

        <div className="status-panel">
          <span className="label">Backend health</span>
          {loading && <p className="pending">Checking backend...</p>}
          {!loading && error && <p className="error">{error}</p>}
          {!loading && health && (
            <div className="health-details">
              <p>
                <strong>Status:</strong> {health.status}
              </p>
              <p>
                <strong>Service:</strong> {health.service}
              </p>
              <p>
                <strong>Timestamp:</strong> {health.timestamp}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default App
