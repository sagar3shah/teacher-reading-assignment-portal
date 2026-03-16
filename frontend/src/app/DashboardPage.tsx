import './App.css'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiUrl } from './apiUrl'

type MeResponse = {
  username: string
  roles: string[]
}

type Book = {
  id: number
  title: string
  author: string | null
  isbn: string | null
}

type AssignmentProgress = {
  studentUsername: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  minutesRead: number
}

type Assignment = {
  id: number
  assignedBy: string
  book: {
    id: number
    title: string
    author: string | null
    isbn: string | null
  }
  dueDate: string
  studentUsernames: string[]
  studentProgress: AssignmentProgress[]
}

type MyAssignment = {
  id: number
  assignedBy: string
  book: {
    id: number
    title: string
    author: string | null
    isbn: string | null
  }
  dueDate: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'
  minutesRead: number
}

function DashboardPage() {
  const navigate = useNavigate()
	const [activeNav, setActiveNav] = useState<'home' | 'assignments' | 'resources'>('home')
  const [loggingOut, setLoggingOut] = useState(false)

  const [me, setMe] = useState<MeResponse | null>(null)
  const [meLoaded, setMeLoaded] = useState(false)

  const [books, setBooks] = useState<Book[] | null>(null)
  const [booksLoading, setBooksLoading] = useState(false)
  const [booksError, setBooksError] = useState<string | null>(null)

  const [assignments, setAssignments] = useState<Assignment[] | null>(null)
  const [assignmentsLoading, setAssignmentsLoading] = useState(false)
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null)

  const [createBookId, setCreateBookId] = useState<number | ''>('')
  const [createDueDate, setCreateDueDate] = useState('')
  const [createStudents, setCreateStudents] = useState<string[]>(['student1', 'student2'])
  const [creatingAssignment, setCreatingAssignment] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [myAssignments, setMyAssignments] = useState<MyAssignment[] | null>(null)
  const [myAssignmentsLoading, setMyAssignmentsLoading] = useState(false)
  const [myAssignmentsError, setMyAssignmentsError] = useState<string | null>(null)
  const [mySavingId, setMySavingId] = useState<number | null>(null)
  const [mySaveErrorById, setMySaveErrorById] = useState<Record<number, string | null>>({})
  const [myDraftById, setMyDraftById] = useState<Record<number, { status: MyAssignment['status']; minutesReadText: string }>>({})
  const [mySaveNotice, setMySaveNotice] = useState<string | null>(null)
  const mySaveNoticeTimeoutRef = useRef<number | null>(null)

  const isTeacher = useMemo(() => {
    return !!me?.roles?.includes('ROLE_TEACHER')
  }, [me])

  useEffect(() => {
    return () => {
      if (mySaveNoticeTimeoutRef.current !== null) {
        window.clearTimeout(mySaveNoticeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadMe() {
      try {
        const response = await fetch(apiUrl('/api/me'), {
          method: 'GET',
          credentials: 'include',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })

        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as MeResponse
        if (!cancelled) setMe(data)
      } finally {
        if (!cancelled) setMeLoaded(true)
      }
    }

    loadMe()
    return () => {
      cancelled = true
    }
  }, [navigate])

  useEffect(() => {
    if (activeNav !== 'resources') return
    if (!meLoaded) return
    if (!isTeacher) return
    if (books) return

    const controller = new AbortController()
    setBooksError(null)
    setBooksLoading(true)

    async function loadBooks() {
      try {
        const response = await fetch(apiUrl('/api/books'), {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })

        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        if (response.status === 403) {
          setBooksError('Teachers only.')
          setBooks([])
          return
        }

        if (!response.ok) {
          setBooksError('Unable to load books.')
          setBooks([])
          return
        }

        try {
          const data = (await response.json()) as Book[]
          setBooks(data)
        } catch {
          setBooksError('Unable to load books.')
          setBooks([])
        }
      } catch (error) {
        if ((error as { name?: string } | null)?.name === 'AbortError') return
        setBooksError('Unable to load books.')
        setBooks([])
      } finally {
        setBooksLoading(false)
      }
    }

    loadBooks()
    return () => controller.abort()
  }, [activeNav, books, isTeacher, meLoaded, navigate])

  useEffect(() => {
    if (activeNav !== 'assignments') return
    if (!meLoaded) return
    if (!isTeacher) return
    if (books) return

    const controller = new AbortController()
    setBooksError(null)
    setBooksLoading(true)

    async function loadBooks() {
      try {
        const response = await fetch(apiUrl('/api/books'), {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })

        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        if (response.status === 403) {
          setBooksError('Teachers only.')
          setBooks([])
          return
        }

        if (!response.ok) {
          setBooksError('Unable to load books.')
          setBooks([])
          return
        }

        try {
          const data = (await response.json()) as Book[]
          setBooks(data)
        } catch {
          setBooksError('Unable to load books.')
          setBooks([])
        }
      } catch (error) {
        if ((error as { name?: string } | null)?.name === 'AbortError') return
        setBooksError('Unable to load books.')
        setBooks([])
      } finally {
        setBooksLoading(false)
      }
    }

    loadBooks()
    return () => controller.abort()
  }, [activeNav, books, isTeacher, meLoaded, navigate])

  useEffect(() => {
    if (activeNav !== 'assignments') return
    if (!meLoaded) return
    if (!isTeacher) return
    if (assignments) return

    const controller = new AbortController()
    setAssignmentsError(null)
    setAssignmentsLoading(true)

    async function loadAssignments() {
      try {
        const response = await fetch(apiUrl('/api/assignments'), {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })

        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        if (response.status === 403) {
          setAssignmentsError('Teachers only.')
          setAssignments([])
          return
        }

        if (!response.ok) {
          setAssignmentsError('Unable to load assignments.')
          setAssignments([])
          return
        }

        try {
          const data = (await response.json()) as Assignment[]
          setAssignments(data)
        } catch {
          setAssignmentsError('Unable to load assignments.')
          setAssignments([])
        }
      } catch (error) {
        if ((error as { name?: string } | null)?.name === 'AbortError') return
        setAssignmentsError('Unable to load assignments.')
        setAssignments([])
      } finally {
        setAssignmentsLoading(false)
      }
    }

    loadAssignments()
    return () => controller.abort()
  }, [activeNav, assignments, isTeacher, meLoaded, navigate])

  useEffect(() => {
    if (activeNav !== 'assignments') return
    if (!meLoaded) return
    if (!isTeacher) return
    if (createBookId !== '' || createDueDate) return
    if (!books || books.length === 0) return
    setCreateBookId(books[0].id)
  }, [activeNav, books, createBookId, createDueDate, isTeacher, meLoaded])

  function toggleStudent(username: string) {
    setCreateStudents((prev) => {
      if (prev.includes(username)) return prev.filter((s) => s !== username)
      return [...prev, username]
    })
  }

  function assignmentStatus(dueDateIso: string) {
    const due = new Date(`${dueDateIso}T00:00:00`)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (due.getTime() < now.getTime()) return { label: 'Overdue', tone: 'overdue' as const }
    return { label: 'Assigned', tone: 'assigned' as const }
  }

  function statusLabel(status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED') {
    if (status === 'NOT_STARTED') return 'Not Started'
    if (status === 'IN_PROGRESS') return 'In Progress'
    return 'Completed'
  }

  function findProgress(assignment: Assignment, studentUsername: string): AssignmentProgress | null {
    const list = assignment.studentProgress || []
    for (const p of list) {
      if (p.studentUsername === studentUsername) return p
    }
    return null
  }

  useEffect(() => {
    if (activeNav !== 'assignments') return
    if (!meLoaded) return
    if (isTeacher) return
    if (myAssignments) return

    const controller = new AbortController()
    setMyAssignmentsError(null)
    setMyAssignmentsLoading(true)

    async function loadMyAssignments() {
      try {
        const response = await fetch(apiUrl('/api/my/assignments'), {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })

        if (response.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        if (!response.ok) {
          setMyAssignmentsError('Unable to load assignments.')
          setMyAssignments([])
          return
        }

        try {
          const data = (await response.json()) as MyAssignment[]
          setMyAssignments(data)
        } catch {
          setMyAssignmentsError('Unable to load assignments.')
          setMyAssignments([])
        }
      } catch (error) {
        if ((error as { name?: string } | null)?.name === 'AbortError') return
        setMyAssignmentsError('Unable to load assignments.')
        setMyAssignments([])
      } finally {
        setMyAssignmentsLoading(false)
      }
    }

    loadMyAssignments()
    return () => controller.abort()
  }, [activeNav, isTeacher, meLoaded, myAssignments, navigate])

  useEffect(() => {
    if (!myAssignments) return
    setMyDraftById((prev) => {
      const next: Record<number, { status: MyAssignment['status']; minutesReadText: string }> = { ...prev }
      for (const a of myAssignments) {
        if (next[a.id]) continue
        next[a.id] = {
          status: a.status,
          minutesReadText: a.minutesRead === 0 ? '' : String(a.minutesRead),
        }
      }
      return next
    })
  }, [myAssignments])

  function parseMinutes(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return 0
    const value = Number(trimmed)
    if (!Number.isFinite(value)) return 0
    return Math.max(0, Math.floor(value))
  }

  async function onSaveMyProgress(assignmentId: number, status: MyAssignment['status'], minutesRead: number) {
    if (mySavingId !== null) return
    setMySavingId(assignmentId)
    setMySaveNotice(null)
    setMySaveErrorById((prev) => ({ ...prev, [assignmentId]: null }))
    try {
      const response = await fetch(apiUrl(`/api/my/assignments/${assignmentId}`), {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          status,
          minutesRead,
        }),
      })

      if (response.status === 401) {
        navigate('/login', { replace: true })
        return
      }

      if (!response.ok) {
        setMySaveErrorById((prev) => ({ ...prev, [assignmentId]: 'Unable to save progress.' }))
        return
      }

      const updated = (await response.json()) as MyAssignment
      setMyAssignments((prev) => {
        if (!prev) return [updated]
        return prev.map((a) => (a.id === assignmentId ? updated : a))
      })
      setMyDraftById((prev) => ({
        ...prev,
        [assignmentId]: {
          status: updated.status,
          minutesReadText: updated.minutesRead === 0 ? '' : String(updated.minutesRead),
        },
      }))

      if (mySaveNoticeTimeoutRef.current !== null) {
        window.clearTimeout(mySaveNoticeTimeoutRef.current)
      }
      setMySaveNotice('Saved successfully.')
      mySaveNoticeTimeoutRef.current = window.setTimeout(() => {
        setMySaveNotice(null)
      }, 2200)
    } catch {
      setMySaveErrorById((prev) => ({ ...prev, [assignmentId]: 'Unable to save progress.' }))
    } finally {
      setMySavingId(null)
    }
  }

  async function onCreateAssignment() {
    if (!isTeacher) return
    if (creatingAssignment) return

    setCreateError(null)
    if (createBookId === '') {
      setCreateError('Please choose a book.')
      return
    }
    if (!createDueDate) {
      setCreateError('Please choose a due date.')
      return
    }
    if (createStudents.length === 0) {
      setCreateError('Please select at least one student.')
      return
    }

    setCreatingAssignment(true)
    try {
      const response = await fetch(apiUrl('/api/assignments'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          bookId: createBookId,
          dueDate: createDueDate,
          studentUsernames: createStudents,
        }),
      })

      if (response.status === 401) {
        navigate('/login', { replace: true })
        return
      }

      if (response.status === 403) {
        setCreateError('Teachers only.')
        return
      }

      if (!response.ok) {
        setCreateError('Unable to create assignment.')
        return
      }

      const created = (await response.json()) as Assignment
      setAssignments((prev) => {
        if (!prev) return [created]
        return [created, ...prev]
      })
    } catch {
      setCreateError('Unable to create assignment.')
    } finally {
      setCreatingAssignment(false)
    }
  }

  async function onLogout() {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await fetch(apiUrl('/logout'), {
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
              onClick={() => {
                setActiveNav('assignments')
                setAssignments(null)
                setMyAssignments(null)
              }}
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
              className={activeNav === 'resources' ? 'sidebar-link sidebar-link-active' : 'sidebar-link'}
              onClick={() => setActiveNav('resources')}
            >
              <svg className="sidebar-link-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2z" />
                <path d="M8 6h8" />
              </svg>
              <span className="sidebar-link-text">Resources</span>
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

          <div className="dashboard-content">
            {activeNav === 'assignments' && (
              <section className="assignments-shell" aria-label="Assignments">
                {!meLoaded ? (
                  <p className="resources-muted">Loading…</p>
                ) : isTeacher ? (
                  <>
                    <header className="assignments-header">
                      <div>
                        <h2 className="assignments-title">Assignments</h2>
                        <p className="assignments-subtitle">Create and track reading assignments for your class.</p>
                      </div>
                    </header>

                    <div className="assignments-grid">
                      <section className="assignments-card" aria-label="Create assignment">
                        <div className="assignments-card-header">
                          <h3 className="assignments-card-title">Create assignment</h3>
                          <p className="assignments-card-subtitle">Choose a book, set a due date, and assign students.</p>
                        </div>

                        <div className="assignments-form">
                          <label className="assignments-field">
                            <span className="assignments-label">Book</span>
                            <select
                              className="assignments-select"
                              value={createBookId}
                              onChange={(e) => setCreateBookId(e.target.value ? Number(e.target.value) : '')}
                              disabled={booksLoading || !books || books.length === 0}
                            >
                              {(!books || books.length === 0) && <option value="">No books available</option>}
                              {books && books.length > 0 && books.map((book) => (
                                <option key={book.id} value={book.id}>
                                  {book.title}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="assignments-field">
                            <span className="assignments-label">Due date</span>
                            <input
                              className="assignments-input"
                              type="date"
                              value={createDueDate}
                              onChange={(e) => setCreateDueDate(e.target.value)}
                            />
                          </label>

                          <div className="assignments-field">
                            <div className="assignments-label">Assign to</div>
                            <div className="assignments-students">
                              <label className="assignments-student">
                                <input
                                  type="checkbox"
                                  checked={createStudents.includes('student1')}
                                  onChange={() => toggleStudent('student1')}
                                />
                                <span>student1</span>
                              </label>
                              <label className="assignments-student">
                                <input
                                  type="checkbox"
                                  checked={createStudents.includes('student2')}
                                  onChange={() => toggleStudent('student2')}
                                />
                                <span>student2</span>
                              </label>
                            </div>
                          </div>

                          {createError && <p className="assignments-error">{createError}</p>}

                          <button
                            type="button"
                            className="assignments-primary"
                            onClick={onCreateAssignment}
                            disabled={creatingAssignment}
                          >
                            {creatingAssignment ? 'Creating…' : 'Create assignment'}
                          </button>
                        </div>
                      </section>

                      <section className="assignments-card" aria-label="Existing assignments">
                        <div className="assignments-card-header">
                          <h3 className="assignments-card-title">Existing assignments</h3>
                          <p className="assignments-card-subtitle">Status and minutes read for each student.</p>
                        </div>

                        {assignmentsLoading && <p className="assignments-muted">Loading…</p>}
                        {assignmentsError && <p className="assignments-error">{assignmentsError}</p>}

                        {assignments && assignments.length === 0 && !assignmentsLoading && !assignmentsError && (
                          <p className="assignments-muted">No assignments yet.</p>
                        )}

                        {assignments && assignments.length > 0 && (
                          <div className="assignments-list">
                            {assignments.map((assignment) => {
                              const status = assignmentStatus(assignment.dueDate)
                              return (
                                <article key={assignment.id} className="assignment-item">
                                  <div className="assignment-top">
                                    <div className="assignment-book">
                                      <div className="assignment-book-title">{assignment.book.title}</div>
                                      <div className="assignment-book-meta">
                                        Due {assignment.dueDate}
                                        {assignment.studentUsernames.length ? ` • ${assignment.studentUsernames.length} student(s)` : ''}
                                      </div>
                                    </div>
                                    <span className={status.tone === 'overdue' ? 'assignment-pill assignment-pill-overdue' : 'assignment-pill'}>
                                      {status.label}
                                    </span>
                                  </div>

                                  <div className="assignment-table" role="table" aria-label="Student status">
                                    <div className="assignment-row assignment-row-head" role="row">
                                      <div className="assignment-cell" role="columnheader">Student</div>
                                      <div className="assignment-cell" role="columnheader">Status</div>
                                      <div className="assignment-cell assignment-cell-right" role="columnheader">Minutes</div>
                                    </div>

                                    {assignment.studentUsernames.map((student) => (
                                      <div key={student} className="assignment-row" role="row">
                                        <div className="assignment-cell" role="cell">{student}</div>
                                        <div className="assignment-cell" role="cell">
                                          {(() => {
                                            const p = findProgress(assignment, student)
                                            return p ? statusLabel(p.status) : 'Not Started'
                                          })()}
                                        </div>
                                        <div className="assignment-cell assignment-cell-right" role="cell">
                                          {(() => {
                                            const p = findProgress(assignment, student)
                                            return p ? p.minutesRead : 0
                                          })()}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </article>
                              )
                            })}
                          </div>
                        )}
                      </section>
                    </div>
                  </>
                ) : (
                  <>
                    <header className="assignments-header">
                      <div>
                        <h2 className="assignments-title">My Assignments</h2>
                        <p className="assignments-subtitle">Open your assigned reading, log minutes, and update status.</p>
                      </div>
                    </header>

                    <section className="assignments-card" aria-label="My assigned reading">
                      {myAssignmentsLoading && <p className="assignments-muted">Loading…</p>}
                      {myAssignmentsError && <p className="assignments-error">{myAssignmentsError}</p>}
                      {mySaveNotice && (
                        <div className="assignments-notice assignments-notice-success" role="status" aria-live="polite">
                          {mySaveNotice}
                        </div>
                      )}

                      {myAssignments && myAssignments.length === 0 && !myAssignmentsLoading && !myAssignmentsError && (
                        <p className="assignments-muted">No assignments yet.</p>
                      )}

                      {myAssignments && myAssignments.length > 0 && (
                        <div className="assignment-bars" role="table" aria-label="My assignments">
                          <div className="assignment-bar assignment-bar-head" role="row">
                            <div className="assignment-bar-cell" role="columnheader">Teacher</div>
                            <div className="assignment-bar-cell" role="columnheader">Reading</div>
                            <div className="assignment-bar-cell" role="columnheader">Due</div>
                            <div className="assignment-bar-cell" role="columnheader">Status</div>
                            <div className="assignment-bar-cell" role="columnheader">Minutes</div>
                            <div className="assignment-bar-cell assignment-bar-cell-right" role="columnheader">&nbsp;</div>
                          </div>

                          {myAssignments.map((a) => {
                            const draft = myDraftById[a.id]
                            const draftStatus = draft?.status ?? a.status
                            const minutesText = draft?.minutesReadText ?? (a.minutesRead === 0 ? '' : String(a.minutesRead))
                            return (
                              <div key={a.id} className="assignment-bar" role="row">
                                <div className="assignment-bar-cell" role="cell">{a.assignedBy}</div>
                                <div className="assignment-bar-cell" role="cell">
                                  <div className="assignment-bar-title">{a.book.title}</div>
                                  <div className="assignment-bar-meta">
                                    {a.book.author ? a.book.author : 'Unknown author'}
                                    {a.book.isbn ? ` • ${a.book.isbn}` : ''}
                                    <div>
                                      Book URL:{' '}
                                      <a
                                        className="assignment-bar-link"
                                        href={`https://example.com/books/${a.book.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        Open
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                <div className="assignment-bar-cell" role="cell">{a.dueDate}</div>
                                <div className="assignment-bar-cell" role="cell">
                                  <select
                                    className="assignment-bar-select"
                                    value={draftStatus}
                                    onChange={(e) => {
                                      const next = e.target.value as MyAssignment['status']
                                      setMyDraftById((prev) => ({
                                        ...prev,
                                        [a.id]: {
                                          status: next,
                                          minutesReadText: (prev[a.id]?.minutesReadText ?? minutesText),
                                        },
                                      }))
                                    }}
                                  >
                                    <option value="NOT_STARTED">Not Started</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                  </select>
                                </div>
                                <div className="assignment-bar-cell" role="cell">
                                  <input
                                    className="assignment-bar-input"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={minutesText}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onChange={(e) => {
                                      const nextText = e.target.value
                                      setMyDraftById((prev) => ({
                                        ...prev,
                                        [a.id]: {
                                          status: (prev[a.id]?.status ?? a.status),
                                          minutesReadText: nextText,
                                        },
                                      }))
                                    }}
                                  />
                                </div>
                                <div className="assignment-bar-cell assignment-bar-cell-right" role="cell">
                                  <button
                                    type="button"
                                    className="assignment-bar-btn"
                                    onClick={() => {
                                      const nextMinutes = parseMinutes(minutesText)
                                      onSaveMyProgress(a.id, draftStatus, nextMinutes)
                                    }}
                                    disabled={mySavingId === a.id}
                                  >
                                    {mySavingId === a.id ? 'Saving…' : 'Save'}
                                  </button>
                                  {mySaveErrorById[a.id] && <div className="assignment-bar-error">{mySaveErrorById[a.id]}</div>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </section>
                  </>
                )}
              </section>
            )}

            {activeNav === 'resources' && (
              <section className="resources-card" aria-label="Resources">
                {!meLoaded ? (
                  <p className="resources-muted">Loading…</p>
                ) : isTeacher ? (
                  <>
                    <div className="resources-header">
                      <div className="resources-header-row">
                        <div className="resources-header-titles">
                          <h2 className="resources-title">Books</h2>
                          <p className="resources-subtitle">Prepopulated books available to assign.</p>
                        </div>

                        <div className="resources-search" aria-label="Resources search">
                          <input
                            className="resources-search-input"
                            type="search"
                            placeholder="Search books"
                            aria-label="Search books"
                          />
                        </div>

                        <button type="button" className="resources-add-btn">
                          Add book
                        </button>
                      </div>
                    </div>

                    {booksLoading && <p className="resources-muted">Loading…</p>}
                    {booksError && <p className="resources-error">{booksError}</p>}

                    {books && books.length === 0 && !booksLoading && !booksError && (
                      <p className="resources-muted">No books found.</p>
                    )}

                    {books && books.length > 0 && (
                      <ul className="resources-list" aria-label="Books list">
                        {books.map((book) => (
                          <li key={book.id} className="resources-item">
                            <div className="resources-item-main">
                              <div className="resources-item-title">{book.title}</div>
                              <div className="resources-item-meta">
                                {book.author ? book.author : 'Unknown author'}
                                {book.isbn ? ` • ${book.isbn}` : ''}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <>
                    <div className="resources-header">
                      <div className="resources-header-row">
                        <div className="resources-header-titles">
                          <h2 className="resources-title">Student Resources</h2>
                          <p className="resources-subtitle">Resources for students will appear here.</p>
                        </div>

                        <div className="resources-search" aria-label="Resources search">
                          <input
                            className="resources-search-input"
                            type="search"
                            placeholder="Search resources"
                            aria-label="Search resources"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="resources-muted">Nothing to show yet.</p>
                  </>
                )}
              </section>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default DashboardPage
