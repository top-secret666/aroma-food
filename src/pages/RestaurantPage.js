import { useEffect, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { restaurantApi } from "../api/client"
import { DEMO_DISHES, DEMO_RESTAURANTS } from "../api/demoData"
import DishCard from "../components/DishCard"
import { addItem } from "../store/cartSlice"
import { homePathForRoles, isAdmin, normalizeRoles } from "../utils/auth"
import { restaurantCover } from "../utils/format"

export default function RestaurantPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const accessToken = useSelector((s) => s.auth.accessToken)
  const user = useSelector((s) => s.auth.user)
  const roles = normalizeRoles(user, accessToken)
  const staff = isAdmin(roles) || roles.includes("MANAGER")
  const [restaurant, setRestaurant] = useState(null)
  const [dishes, setDishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setDemo(false)
      try {
        const [resto, menu] = await Promise.all([restaurantApi.get(id), restaurantApi.dishes(id)])
        if (!cancelled) {
          setRestaurant(resto)
          setDishes(Array.isArray(menu) ? menu : [])
        }
      } catch (err) {
        if (!cancelled) {
          const seed = DEMO_RESTAURANTS.find((r) => String(r.id) === String(id))
          if (seed) {
            setRestaurant(seed)
            setDishes(DEMO_DISHES[id] || [])
            setDemo(true)
            setError(err.message || "API offline")
          } else {
            setError(err.message || "Failed to load restaurant")
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (staff) {
    return <Navigate to={homePathForRoles(roles)} replace />
  }

  const handleAdd = (dish) => {
    dispatch(
      addItem({
        restaurantId: Number(id),
        restaurantName: restaurant?.name || "Restaurant",
        dish,
      })
    )
    setToast(`${dish.name} added`)
    window.setTimeout(() => setToast(null), 1600)
  }

  if (loading) return <p className="state section">Loading menu…</p>
  if (!restaurant) {
    return (
      <div className="section">
        <div className="banner banner--error">{error || "Restaurant not found"}</div>
        <Link to="/" className="btn btn--ghost">
          Back to catalog
        </Link>
      </div>
    )
  }

  return (
    <>
      <section
        className="resto-hero"
        style={{ backgroundImage: `url(${restaurantCover(restaurant)})` }}
      >
        <div className="resto-hero__veil" />
        <div className="resto-hero__content">
          <Link to="/" className="crumb">
            ← All restaurants
          </Link>
          <h1>{restaurant.name}</h1>
          <p>
            {restaurant.cuisine}
            {restaurant.address ? ` · ${restaurant.address}` : ""}
          </p>
        </div>
      </section>

      <section className="section">
        {demo && (
          <div className="banner banner--ok">Demo menu — connect restaurant-service on :8081 for live data.</div>
        )}
        <div className="section__head">
          <h2>Menu</h2>
          <Link to="/cart" className="btn btn--primary btn--sm">
            View cart
          </Link>
        </div>
        <div className="dish-grid">
          {dishes.map((dish) => (
            <DishCard key={dish.id} dish={dish} onAdd={handleAdd} />
          ))}
        </div>
        {dishes.length === 0 && <p className="state">No dishes yet.</p>}
      </section>

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
