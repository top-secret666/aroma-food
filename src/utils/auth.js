export function parseJwtRoles(accessToken) {
  if (!accessToken) return []
  try {
    const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    const roles = payload?.realm_access?.roles
    return Array.isArray(roles) ? roles.map((r) => String(r).toUpperCase()) : []
  } catch {
    return []
  }
}

export function normalizeRoles(user, accessToken) {
  const fromUser = Array.isArray(user?.roles)
    ? user.roles.map((r) => String(r).replace(/^ROLE_/, "").toUpperCase())
    : []
  const fromToken = parseJwtRoles(accessToken)
  return Array.from(new Set([...fromUser, ...fromToken]))
}

export function isAdmin(roles) {
  return roles.includes("ADMIN")
}

export function isManager(roles) {
  return roles.includes("MANAGER") || roles.includes("ADMIN")
}

export function isCustomer(roles) {
  return roles.includes("USER") || roles.length === 0
}

export function homePathForRoles(roles) {
  if (isAdmin(roles)) return "/admin/restaurants"
  if (roles.includes("MANAGER")) return "/manager/orders"
  return "/"
}

/** @deprecated use isAdmin(normalizeRoles(...)) */
export function isAdminToken(accessToken) {
  return isAdmin(parseJwtRoles(accessToken))
}
