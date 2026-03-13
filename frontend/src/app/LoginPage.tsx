import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './App.css'

function LoginPage() {
	const navigate = useNavigate()

	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()

		const trimmedUsername = username.trim()
		if (!trimmedUsername || !password) {
			setSubmitError('Please enter your username and password.')
			return
		}

		setSubmitError(null)
		setSubmitting(true)
		try {
			const body = new URLSearchParams({
				username: trimmedUsername,
				password,
			})

			const response = await fetch('/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'X-Requested-With': 'XMLHttpRequest',
				},
				credentials: 'include',
				body: body.toString(),
			})

			if (!response.ok) {
				setSubmitError('Invalid username or password.')
				return
			}

			navigate('/dashboard/', { replace: true })
		} catch {
			setSubmitError('Unable to sign in right now. Please try again.')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="page-wrapper">
			<header className="site-header">
				<div className="site-header-left">
					<span className="site-logo">📚</span>
					<span className="site-name">Reading Portal</span>
				</div>
				<nav className="site-header-right">
					<svg
						className="header-icon header-globe"
						viewBox="0 0 24 24"
						aria-hidden="true"
						focusable="false"
					>
						<circle cx="12" cy="12" r="9" />
						<path d="M3 12h18" />
						<path d="M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9" />
						<path d="M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
					</svg>
					<a className="header-link" href="#" onClick={(e) => e.preventDefault()}>
						Sign Up
					</a>
					<a className="header-demo-btn" href="#" onClick={(e) => e.preventDefault()}>
						Request a Demo
					</a>
				</nav>
			</header>

			<main className="app-shell">
				<section className="status-card">
					<h1>Welcome back!</h1>
					<p className="intro">Enter your login to continue.</p>

					<form className="login-form" onSubmit={onSubmit}>
						<label className="field">
							<span className="label">Username</span>
							<input
								className="input"
								name="username"
								type="text"
								value={username}
								onChange={(event) => setUsername(event.target.value)}
								autoComplete="username"
								required
							/>
						</label>

						<label className="field">
							<span className="label">Password</span>
							<input
								className="input"
								name="password"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								autoComplete="current-password"
								required
							/>
						</label>

						{submitError && (
							<p className="error" role="alert">
								{submitError}
							</p>
						)}

						<a
							className="link link-small"
							href="#"
							onClick={(event) => event.preventDefault()}
						>
							Having trouble signing in?
						</a>

						<button className="primary" type="submit" disabled={submitting}>
							{submitting ? 'Signing in…' : 'Sign in'}
						</button>

						<a
							className="link link-create"
							href="#"
							onClick={(event) => event.preventDefault()}
						>
							Don't have an account? <strong>Create a new one</strong>
						</a>
					</form>
				</section>
			</main>
		</div>
	)
}

export default LoginPage
