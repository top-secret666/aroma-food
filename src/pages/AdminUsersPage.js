import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { userApi } from "../api/client"

const ROLE_OPTIONS = ["USER", "MANAGER", "ADMIN"]

export default function AdminUsersPage() {
  const token = useSelector((s) => s.auth.accessToken)
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
        const data = query.trim()
        ? await userApi.search(query.trim())
        : await userApi.listAll()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const filteredHint = useMemo(() => (query ? `Search: “${query}”` : "All accounts"), [query])

  const toggleRole = async (user, role) => {
    setMessage(null)
    setError(null)
    const current = (user.roles || []).map((r) => String(r).replace(/^ROLE_/, "").toUpperCase())
    const next = current.includes(role) ? current.filter((r) => r !== role) : [...current, role]
    if (next.length === 0) {
      setError("Each account needs at least one role")
      return
    }
    try {
      const updated = await userApi.updateRoles(user.id, next)
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)))
      setMessage(`Updated roles for ${updated.email}`)
    } catch (err) {
      setError(err.message || "Could not update roles")
    }
  }

  return (
    <section className="section">
      <div className="section__head">
        <div>
          <h1>Accounts</h1>
          <p className="muted">Admin only — grant manager or admin rights</p>
        </div>
        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
        >
          <input
            type="search"
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      <p className="muted">{filteredHint}</p>
      {loading && <p className="state">Loading users…</p>}
      {error && <div className="banner banner--error">{error}</div>}
      {message && <div className="banner banner--ok">{message}</div>}

      <ul className="admin-list">
        {users.map((user) => {
          const roles = (user.roles || []).map((r) => String(r).replace(/^ROLE_/, "").toUpperCase())
          return (
            <li key={user.id} className="admin-card">
              <div>
                <strong>{user.fullName || "Unnamed"}</strong>
                <p className="muted">{user.email}</p>
              </div>
              <div className="role-toggles">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className={`btn btn--sm ${roles.includes(role) ? "btn--primary" : "btn--ghost"}`}
                    onClick={() => toggleRole(user, role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
