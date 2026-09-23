import { useEffect, useState } from "react"
import { Link, useParams, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import { orderApi } from "../api/client"
import { isAdmin, normalizeRoles } from "../utils/auth"
import { formatDate, formatPrice, statusLabel } from "../utils/format"

const MANAGER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "COOKING",
  "READY_FOR_DELIVERY",
  "DELIVERING",
  "COMPLETED",
  "CANCELLED",
]

const TRACK_STEPS = [
  { key: "PENDING", label: "Placed" },
  { key: "ACCEPTED", label: "Confirmed" },
  { key: "COOKING", label: "Cooking" },
  { key: "READY_FOR_DELIVERY", label: "Ready" },
  { key: "DELIVERING", label: "Out for delivery" },
  { key: "COMPLETED", label: "Delivered" },
]

function stepIndex(status) {
  if (status === "CANCELLED") return -1
  const idx = TRACK_STEPS.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const token = useSelector((s) => s.auth.accessToken)
  const user = useSelector((s) => s.auth.user)
  const roles = normalizeRoles(user, token)
  const canManageStatus = roles.includes("MANAGER") || isAdmin(roles)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await orderApi.get(id)
      setOrder(data)
    } catch (err) {
      setError(err.message || "Order not found")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(() => {
      if (!canManageStatus) {
        orderApi
          .get(id)
          .then(setOrder)
          .catch(() => {})
      }
    }, 4000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, canManageStatus])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const updated = await orderApi.cancel(id)
      setOrder(updated)
    } catch (err) {
      setError(err.message || "Could not cancel order")
    } finally {
      setCancelling(false)
    }
  }

  const handleStatus = async (status) => {
    setUpdating(true)
    setError(null)
    try {
      const updated = await orderApi.updateStatus(id, status)
      setOrder(updated)
    } catch (err) {
      setError(err.message || "Could not update status")
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <p className="state section">Loading order…</p>
  if (error && !order) {
    return (
      <section className="section narrow">
        <div className="banner banner--error">{error}</div>
        <Link to="/orders">Back to orders</Link>
      </section>
    )
  }

  const canCancel = order && !["COMPLETED", "CANCELLED", "DELIVERING"].includes(order.status)

  return (
    <section className="section narrow">
      {location.state?.justPlaced && (
        <div className="banner banner--ok">Order placed successfully.</div>
      )}
      <Link to="/orders" className="crumb">
        ← Orders
      </Link>
      <div className="section__head">
        <div>
          <h1>Order #{order.id}</h1>
          <p className="muted">{formatDate(order.orderDate)}</p>
        </div>
        <span className={`pill pill--${String(order.status).toLowerCase()}`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {!canManageStatus && order.status !== "CANCELLED" && (
        <div className="panel">
          <h2>Order tracking</h2>
          <p className="muted">Live updates every few seconds</p>
          <ol className="timeline">
            {TRACK_STEPS.map((step, index) => {
              const current = stepIndex(order.status)
              const done = index <= current
              const active = index === current
              return (
                <li key={step.key} className={`timeline__item ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}>
                  <span className="timeline__dot" />
                  <span>{step.label}</span>
                </li>
              )
            })}
          </ol>
        </div>
      )}

      {order.status === "CANCELLED" && !canManageStatus && (
        <div className="banner banner--error">This order was cancelled.</div>
      )}

      <div className="panel">
        <h2>Items</h2>
        <ul className="plain-list">
          {(order.items || []).map((item) => (
            <li key={item.id || item.dishId}>
              <span>
                Dish #{item.dishId} × {item.quantity}
              </span>
              <span>{formatPrice(item.price)}</span>
            </li>
          ))}
        </ul>
        <div className="cart-footer">
          <div>
            <p className="muted">Total</p>
            <p className="cart-total">{formatPrice(order.totalPrice)}</p>
          </div>
          {order.payment && (
            <p className="muted">
              {order.payment.method} · {order.payment.status}
            </p>
          )}
        </div>
      </div>

      {canManageStatus && (
        <div className="panel">
          <h2>Kitchen & delivery</h2>
          <p className="muted">Manager controls — update order progress</p>
          <div className="status-actions">
            {MANAGER_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className={`btn btn--sm ${order.status === status ? "btn--primary" : "btn--ghost"}`}
                disabled={updating || order.status === status}
                onClick={() => handleStatus(status)}
              >
                {statusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="banner banner--error">{error}</div>}

      {canCancel && (
        <button type="button" className="btn btn--ghost" onClick={handleCancel} disabled={cancelling}>
          {cancelling ? "Cancelling…" : "Cancel order"}
        </button>
      )}
    </section>
  )
}
