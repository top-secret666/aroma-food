import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useSelector } from "react-redux"
import { orderApi } from "../api/client"
import { isAdmin, normalizeRoles } from "../utils/auth"
import { formatDate, formatPrice, statusLabel } from "../utils/format"

export default function OrdersPage({ desk = false }) {
  const token = useSelector((s) => s.auth.accessToken)
  const user = useSelector((s) => s.auth.user)
  const roles = normalizeRoles(user, token)
  const staff = desk || roles.includes("MANAGER") || isAdmin(roles)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await orderApi.list()
        if (!cancelled) setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load orders")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <section className="section narrow">
      <h1>{staff ? "Delivery desk" : "Your orders"}</h1>
      <p className="muted">
        {staff ? "Manage kitchen status and delivery progress" : "Live data from order-service"}
      </p>

      {loading && <p className="state">Loading orders…</p>}
      {error && <div className="banner banner--error">{error}</div>}
      {!loading && !error && orders.length === 0 && (
        <div className="state">
          <p>{staff ? "No orders in the queue yet." : "No orders yet."}</p>
          {!staff && (
            <Link to="/" className="btn btn--primary">
              Order something
            </Link>
          )}
        </div>
      )}

      <ul className="order-list">
        {orders.map((order) => (
          <li key={order.id}>
            <Link to={`/orders/${order.id}`} className="order-card">
              <div>
                <strong>Order #{order.id}</strong>
                <p className="muted">
                  {formatDate(order.orderDate)}
                  {staff ? ` · user #${order.userId} · resto #${order.restaurantId}` : ""}
                </p>
              </div>
              <div className="order-card__right">
                <span className={`pill pill--${String(order.status).toLowerCase()}`}>
                  {statusLabel(order.status)}
                </span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
