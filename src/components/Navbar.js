import { NavLink, Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logout } from "../store/authSlice"
import { selectCartCount } from "../store/cartSlice"
import { homePathForRoles, isAdmin, normalizeRoles } from "../utils/auth"

export default function Navbar() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const accessToken = useSelector((s) => s.auth.accessToken)
  const cartCount = useSelector(selectCartCount)
  const roles = normalizeRoles(user, accessToken)
  const admin = isAdmin(roles)
  const managerOnly = roles.includes("MANAGER") && !admin
  const customer = !admin && !managerOnly

  return (
    <header className="nav">
      <div className="nav__inner">
        <Link to={homePathForRoles(roles)} className="nav__brand" aria-label="Aroma home">
          <span className="nav__mark" aria-hidden="true" />
          <span className="nav__name">Aroma</span>
        </Link>

        <nav className="nav__links" aria-label="Main">
          {customer && (
            <>
              <NavLink to="/" end>
                Restaurants
              </NavLink>
              <NavLink to="/orders">My orders</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          )}
          {managerOnly && (
            <>
              <NavLink to="/manager/orders">Delivery desk</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          )}
          {admin && (
            <>
              <NavLink to="/admin/users">Accounts</NavLink>
              <NavLink to="/admin/restaurants">Catalog</NavLink>
              <NavLink to="/manager/orders">Orders</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </>
          )}
        </nav>

        <div className="nav__actions">
          {customer && (
            <Link to="/cart" className="nav__cart">
              Cart
              {cartCount > 0 && <span className="nav__badge">{cartCount}</span>}
            </Link>
          )}
          {user ? (
            <>
              <span className="nav__role muted">
                {admin ? "Admin" : managerOnly ? "Manager" : user.fullName || "Guest"}
              </span>
              <button type="button" className="btn btn--ghost" onClick={() => dispatch(logout())}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn--primary btn--sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
