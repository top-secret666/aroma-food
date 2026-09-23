import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { clearCart, removeItem, selectCartTotal, setQuantity } from "../store/cartSlice"
import { formatPrice } from "../utils/format"

export default function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.cart)
  const total = useSelector(selectCartTotal)
  const isAuthed = Boolean(useSelector((s) => s.auth.accessToken))

  if (cart.items.length === 0) {
    return (
      <section className="section narrow">
        <h1>Your cart is empty</h1>
        <p className="muted">Pick a restaurant and add a few dishes.</p>
        <Link to="/" className="btn btn--primary">
          Browse restaurants
        </Link>
      </section>
    )
  }

  return (
    <section className="section narrow">
      <div className="section__head">
        <div>
          <h1>Cart</h1>
          <p className="muted">From {cart.restaurantName}</p>
        </div>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => dispatch(clearCart())}>
          Clear
        </button>
      </div>

      <ul className="cart-list">
        {cart.items.map((item) => (
          <li key={item.dishId} className="cart-row">
            <div>
              <strong>{item.name}</strong>
              <p className="muted">{formatPrice(item.price)} each</p>
            </div>
            <div className="qty">
              <button
                type="button"
                onClick={() => dispatch(setQuantity({ dishId: item.dishId, quantity: item.quantity - 1 }))}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                onClick={() => dispatch(setQuantity({ dishId: item.dishId, quantity: item.quantity + 1 }))}
              >
                +
              </button>
            </div>
            <div className="cart-row__right">
              <span>{formatPrice(item.price * item.quantity)}</span>
              <button type="button" className="linkish" onClick={() => dispatch(removeItem(item.dishId))}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-footer">
        <div>
          <p className="muted">Total</p>
          <p className="cart-total">{formatPrice(total)}</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate(isAuthed ? "/checkout" : "/login", { state: { from: "/checkout" } })}
        >
          Checkout
        </button>
      </div>
    </section>
  )
}
