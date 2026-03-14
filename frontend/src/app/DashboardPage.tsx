import './App.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function DashboardPage() {
  const navigate = useNavigate()
	const [activeNav, setActiveNav] = useState<'home' | 'assignments' | 'library'>('home')
  const [loggingOut, setLoggingOut] = useState(false)

  async function onLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
    } finally {
      setLoggingOut(false)
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="page-wrapper">
      <header className="site-header">
        <div className="site-header-left">
          <span className="site-logo">📚</span>
          <span className="site-name">Reading Portal</span>
        </div>
        <nav className="site-header-right" />
      </header>

      <main className="dashboard-shell">
        <aside className="dashboard-sidebar" aria-label="Sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Reading Portal</div>
            <div className="sidebar-subtitle">Dashboard</div>
          </div>

          <nav className="sidebar-nav" aria-label="Navigation">
            <button
              type="button"
              className={activeNav === 'home' ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
              onClick={() => setActiveNav('home')}
            >
              <svg className="sidebar-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M3 10.5l9-7 9 7V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
              </svg>
              <span className="sidebar-link-text">Home</span>
            </button>
            <button
              type="button"
              className={activeNav === 'assignments' ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
              onClick={() => setActiveNav('assignments')}
            >
              <svg className="sidebar-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 6h11" />
                <path d="M9 12h11" />
                <path d="M9 18h11" />
                <path d="M4 6h.01" />
                <path d="M4 12h.01" />
                <path d="M4 18h.01" />
              </svg>
              <span className="sidebar-link-text">Assignments</span>
            </button>
            <button
              type="button"
              className={activeNav === 'library' ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
              onClick={() => setActiveNav('library')}
            >
              <svg className="sidebar-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M8 6h8" />
              </svg>
              <span className="sidebar-link-text">Library</span>
            </button>
          </nav>

          <div className="sidebar-spacer" />

          <div className="sidebar-footer" aria-label="Sidebar actions">
            <button
              type="button"
              className="sidebar-logout"
              onClick={onLogout}
              disabled={loggingOut}
            >
              <svg className="sidebar-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M10 17l-1 1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2l1 1" />
                <path d="M15 12H3" />
                <path d="M15 12l-3-3" />
                <path d="M15 12l-3 3" />
              </svg>
              <span className="sidebar-link-text">{loggingOut ? 'Logging out…' : 'Log out'}</span>
            </button>
          </div>
        </aside>

        <section className="dashboard-main" aria-label="Dashboard content">
          <header className="dashboard-topbar" aria-label="Dashboard header">
            <div className="dashboard-search">
              <input
                className="dashboard-search-input"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
            </div>

            <div className="dashboard-actions" aria-label="Actions">
              <button className="dashboard-icon-btn" type="button" aria-label="Notifications">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </button>
              <button className="dashboard-icon-btn" type="button" aria-label="Mail">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M4 6h16v12H4z" />
                  <path d="M4 7l8 6 8-6" />
                </svg>
              </button>
            </div>
          </header>

          <div className="dashboard-content" />
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
