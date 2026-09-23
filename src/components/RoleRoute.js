import { Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { normalizeRoles } from "../utils/auth"

export default function RoleRoute({ allow = [], children }) {
  const accessToken = useSelector((s) => s.auth.accessToken)
  const user = useSelector((s) => s.auth.user)
  const location = useLocation()
  const roles = normalizeRoles(user, accessToken)

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  const ok = allow.some((role) => roles.includes(role.toUpperCase()))
  if (!ok) {
    return <Navigate to="/" replace />
  }

  return children
}
