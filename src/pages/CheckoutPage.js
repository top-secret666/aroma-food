import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { orderApi } from "../api/client"
import { clearCart, selectCartTotal } from "../store/cartSlice"
import { formatPrice } from "../utils/format"

const METHODS = [
  { id: "CARD", label: "Card" },
  { id: "CASH", label: "Cash" },
]

export default function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.cart)
  const total = useSelector(selectCartTotal)
  const [method, setMethod] = useState("CARD")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (cart.items.length === 0) {
    return (
      <section className="section narrow">
        <h1>Nothing to checkout</h1>
        <Link to="/" className="btn btn--primary">
          Browse restaurants
        </Link>
      </section>
    )
  }

  const handlePlace = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const order = await orderApi.place({
        restaurantId: cart.restaurantId,
        paymentMethod: method,
        items: cart.items.map((item) => ({
          dishId: item.dishId,
          quantity: item.quantity,
        })),
      })
      dispatch(clearCart())
      navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } })
    } catch (err) {
      setError(err.message || "Could not place order")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section narrow">
      <h1>Checkout</h1>
      <p className="muted">
        {cart.restaurantName} · {cart.items.length} item(s) · {formatPrice(total)}
      </p>

      <form className="panel" onSubmit={handlePlace}>
        <fieldset className="pay-methods">
          <legend>Payment method</legend>
          {METHODS.map((m) => (
            <label key={m.id} className={`pay ${method === m.id ? "pay--on" : ""}`}>
              <input
                type="radio"
                name="payment"
                value={m.id}
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
              />
              {m.label}
            </label>
          ))}
        </fieldset>

        {error && <div className="banner banner--error">{error}</div>}

        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
        </button>
      </form>
    </section>
  )
}
