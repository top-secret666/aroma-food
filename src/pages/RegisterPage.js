import { useState } from "react"
import { Link } from "react-router-dom"
import { authApi } from "../api/client"

export default function RegisterPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await authApi.register({ email, password, fullName })
      setDone(true)
    } catch (err) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth">
      <div className="auth__panel">
        <Link to="/" className="auth__brand">
          Aroma
        </Link>
        <h1>Join Aroma</h1>
        <p className="muted">Create an account and start ordering.</p>

        {done ? (
            <div className="banner banner--ok">
              <p>
                Account created. You can <Link to="/login">sign in</Link> right away in local mode.
                (With Keycloak email verification, check Mailhog at http://localhost:8025.)
              </p>
            </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth__form">
            <label>
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={3}
              />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </label>
            {error && <div className="banner banner--error">{error}</div>}
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? "Creating…" : "Register"}
            </button>
          </form>
        )}

        <p className="auth__switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  )
}
