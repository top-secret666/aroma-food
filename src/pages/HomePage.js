import { useEffect, useMemo, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { restaurantApi } from "../api/client"
import { DEMO_RESTAURANTS } from "../api/demoData"
import RestaurantCard from "../components/RestaurantCard"
import { homePathForRoles, isAdmin, normalizeRoles } from "../utils/auth"

export default function HomePage() {
  const accessToken = useSelector((s) => s.auth.accessToken)
  const user = useSelector((s) => s.auth.user)
  const roles = normalizeRoles(user, accessToken)
  const [restaurants, setRestaurants] = useState([])
  const [query, setQuery] = useState("")
  const [cuisine, setCuisine] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [demo, setDemo] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setDemo(false)
      try {
        const data = await restaurantApi.list()
        if (!cancelled) setRestaurants(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) {
          setRestaurants(DEMO_RESTAURANTS)
          setDemo(true)
          setError(err.message || "Failed to load restaurants")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const cuisines = useMemo(() => {
    const set = new Set(restaurants.map((r) => r.cuisine).filter(Boolean))
    return ["All", ...Array.from(set)]
  }, [restaurants])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return restaurants.filter((r) => {
      const cuisineOk = cuisine === "All" || r.cuisine === cuisine
      const textOk =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.cuisine?.toLowerCase().includes(q) ||
        r.address?.toLowerCase().includes(q)
      return cuisineOk && textOk
    })
  }, [restaurants, query, cuisine])

  if (accessToken && (isAdmin(roles) || roles.includes("MANAGER"))) {
    return <Navigate to={homePathForRoles(roles)} replace />
  }

  return (
    <>
      <section className="hero">
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__brand">Aroma Food</p>
          <h1 className="hero__title">ВОЗЬМИТЕ НА РАБОТУ Я ОЧЕНЬ  СТАРАЛЬСЯ АААААААА</h1>
          <p className="hero__lead">позязя пж  пожлуйстааааааа</p>
          <div className="hero__cta">
            <a href="#catalog" className="btn btn--primary">
              Browse restaurants
            </a>
            <Link to="/orders" className="btn btn--ghost">
              Track orders
            </Link>
          </div>
        </div>
      </section>

      <section id="catalog" className="section">
        <div className="section__head">
          <div>
            <h2>Near you</h2>
            <p className="muted">Live catalog from restaurant-service</p>
          </div>
          <label className="search">
            <span className="sr-only">Search restaurants</span>
            <input
              type="search"
              placeholder="Search dishes, cuisine, place"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>

        <div className="chips" role="tablist" aria-label="Cuisines">
          {cuisines.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip ${cuisine === c ? "chip--on" : ""}`}
              onClick={() => setCuisine(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <p className="state">Loading restaurants…</p>}
        {demo && (
          <div className="banner banner--ok">
            Showing demo catalog — restaurant-service is offline ({error}).
          </div>
        )}
        {!loading && filtered.length === 0 && <p className="state">No restaurants match your filters.</p>}

        <div className="resto-grid">
          {filtered.map((restaurant, index) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
          ))}
        </div>
      </section>
    </>
  )
}
