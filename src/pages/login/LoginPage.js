import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { authApi, userApi } from "../../api/client"
import { wakeBackendApis } from "../../api/wakeApis"
import { setCredentials, setUser } from "../../store/authSlice"
import { homePathForRoles, normalizeRoles } from "../../utils/auth"

const GOOGLE_CLIENT_ID = (process.env.REACT_APP_GOOGLE_CLIENT_ID || "").trim()
const GSI_SCRIPT_ID = "google-gsi"

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const finish = () => {
      if (window.google?.accounts?.id) resolve()
      else reject(new Error("Google Identity script loaded without API"))
    }

    const existing = document.getElementById(GSI_SCRIPT_ID)
    if (existing) {
      existing.addEventListener("load", finish, { once: true })
      existing.addEventListener("error", () => reject(new Error("Google script failed")), { once: true })
      // Script may already be complete — poll briefly
      let n = 0
      const poll = window.setInterval(() => {
        if (window.google?.accounts?.id) {
          window.clearInterval(poll)
          resolve()
        } else if (++n > 40) {
          window.clearInterval(poll)
          reject(new Error("Google Sign-In timed out"))
        }
      }, 50)
      return
    }

    const script = document.createElement("script")
    script.id = GSI_SCRIPT_ID
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.onload = finish
    script.onerror = () => reject(new Error("Could not load Google Identity script"))
    document.body.appendChild(script)
  })
}

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useSelector((s) => s.auth.accessToken)
  const user = useSelector((s) => s.auth.user)
  const googleBtnRef = useRef(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [googleUnavailable, setGoogleUnavailable] = useState(false)
  const [loading, setLoading] = useState(false)

  const goAfterLogin = (me, token) => {
    const roles = normalizeRoles(me, token)
    const fallback = location.state?.from
    navigate(fallback || homePathForRoles(roles), { replace: true })
  }

  useEffect(() => {
    wakeBackendApis()
  }, [])

  useEffect(() => {
    if (accessToken && user) {
      goAfterLogin(user, accessToken)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, user])

  const finishLogin = async (tokens) => {
    const access = tokens.access_token
    const refresh = tokens.refresh_token
    dispatch(setCredentials({ accessToken: access, refreshToken: refresh }))
    const me = await userApi.me()
    dispatch(setUser(me))
    goAfterLogin(me, access)
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined
    let cancelled = false
    const timers = []

    const onGoogleCredential = async (response) => {
      if (!response?.credential) {
        setError("Google did not return a credential")
        return
      }
      setLoading(true)
      setError(null)
      try {
        const tokens = await authApi.google(response.credential)
        await finishLogin(tokens)
      } catch (err) {
        setError(err.message || "Google sign-in failed on the server")
      } finally {
        setLoading(false)
      }
    }

    const mountButton = async (attempt = 0) => {
      try {
        await loadGoogleScript()
        if (cancelled) return
        if (!googleBtnRef.current || !window.google?.accounts?.id) {
          if (attempt < 12) {
            timers.push(window.setTimeout(() => mountButton(attempt + 1), 80))
          } else {
            setGoogleUnavailable(true)
            setError("Google Sign-In failed to initialize")
          }
          return
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: onGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        })
        googleBtnRef.current.innerHTML = ""
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: 320,
        })
        setGoogleUnavailable(false)
      } catch (e) {
        if (!cancelled) {
          setGoogleUnavailable(true)
          setError(e.message || "Google Sign-In failed to initialize")
        }
      }
    }

    mountButton()
    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [GOOGLE_CLIENT_ID])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const tokens = await authApi.login({ email, password })
      await finishLogin(tokens)
    } catch (err) {
      setError(err.message || "Login failed")
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
        <h1>Welcome back</h1>
        <p className="muted">Sign in with email or Google.</p>

        <form onSubmit={handleSubmit} className="auth__form">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="current-password"
            />
          </label>
          {error && <div className="banner banner--error">{error}</div>}
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {GOOGLE_CLIENT_ID && !googleUnavailable && (
          <>
            <div className="auth__divider">
              <span>or</span>
            </div>
            <div className="auth__google" ref={googleBtnRef} />
          </>
        )}

        <p className="auth__switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  )
}
