import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { restaurantApi } from "../api/client"
import { dishImage } from "../utils/format"

const emptyRestaurant = { name: "", cuisine: "", address: "" }
const emptyDish = { name: "", description: "", price: 0, imageUrl: "" }

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [dishes, setDishes] = useState([])
  const [restoForm, setRestoForm] = useState(emptyRestaurant)
  const [editingRestoId, setEditingRestoId] = useState(null)
  const [dishForm, setDishForm] = useState(emptyDish)
  const [editingDishId, setEditingDishId] = useState(null)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadRestaurants = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await restaurantApi.list()
      setRestaurants(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Failed to load restaurants")
    } finally {
      setLoading(false)
    }
  }

  const loadDishes = async (restaurantId) => {
    if (!restaurantId) {
      setDishes([])
      return
    }
    try {
      const data = await restaurantApi.dishes(restaurantId)
      setDishes(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || "Failed to load dishes")
    }
  }

  useEffect(() => {
    loadRestaurants()
  }, [])

  useEffect(() => {
    loadDishes(selectedId)
  }, [selectedId])

  const saveRestaurant = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    try {
      if (editingRestoId) {
        await restaurantApi.update(editingRestoId, restoForm)
        setMessage("Restaurant updated")
      } else {
        await restaurantApi.create(restoForm)
        setMessage("Restaurant created")
      }
      setRestoForm(emptyRestaurant)
      setEditingRestoId(null)
      await loadRestaurants()
    } catch (err) {
      setError(err.message || "Could not save restaurant")
    }
  }

  const editRestaurant = (r) => {
    setEditingRestoId(r.id)
    setRestoForm({ name: r.name || "", cuisine: r.cuisine || "", address: r.address || "" })
  }

  const removeRestaurant = async (id) => {
    if (!window.confirm("Delete this restaurant and its dishes?")) return
    try {
      await restaurantApi.remove(id)
      if (selectedId === id) setSelectedId(null)
      setMessage("Restaurant deleted")
      await loadRestaurants()
    } catch (err) {
      setError(err.message || "Could not delete restaurant")
    }
  }

  const saveDish = async (e) => {
    e.preventDefault()
    if (!selectedId) return
    setError(null)
    setMessage(null)
    const payload = {
      ...dishForm,
      price: Number(dishForm.price) || 0,
      restaurantId: Number(selectedId),
    }
    try {
      if (editingDishId) {
        await restaurantApi.updateDish(selectedId, editingDishId, payload)
        setMessage("Dish updated")
      } else {
        await restaurantApi.createDish(selectedId, payload)
        setMessage("Dish created")
      }
      setDishForm(emptyDish)
      setEditingDishId(null)
      await loadDishes(selectedId)
    } catch (err) {
      setError(err.message || "Could not save dish")
    }
  }

  const editDish = (d) => {
    setEditingDishId(d.id)
    setDishForm({
      name: d.name || "",
      description: d.description || "",
      price: d.price || 0,
      imageUrl: d.imageUrl || "",
    })
  }

  const removeDish = async (dishId) => {
    if (!window.confirm("Delete this dish?")) return
    try {
      await restaurantApi.removeDish(selectedId, dishId)
      setMessage("Dish deleted")
      await loadDishes(selectedId)
    } catch (err) {
      setError(err.message || "Could not delete dish")
    }
  }

  const selected = restaurants.find((r) => r.id === selectedId)

  return (
    <section className="section">
      <div className="section__head">
        <div>
          <h1>Catalog admin</h1>
          <p className="muted">Manage restaurants and dishes (ADMIN)</p>
        </div>
        <Link to="/admin/users" className="btn btn--ghost btn--sm">
          Accounts
        </Link>
      </div>

      {error && <div className="banner banner--error">{error}</div>}
      {message && <div className="banner banner--ok">{message}</div>}
      {loading && <p className="state">Loading…</p>}

      <div className="admin-grid">
        <div>
          <form className="panel" onSubmit={saveRestaurant}>
            <h2>{editingRestoId ? "Edit restaurant" : "Add restaurant"}</h2>
            <label>
              Name
              <input
                value={restoForm.name}
                onChange={(e) => setRestoForm({ ...restoForm, name: e.target.value })}
                required
              />
            </label>
            <label>
              Cuisine
              <input
                value={restoForm.cuisine}
                onChange={(e) => setRestoForm({ ...restoForm, cuisine: e.target.value })}
              />
            </label>
            <label>
              Address
              <input
                value={restoForm.address}
                onChange={(e) => setRestoForm({ ...restoForm, address: e.target.value })}
              />
            </label>
            <div className="status-actions">
              <button type="submit" className="btn btn--primary btn--sm">
                {editingRestoId ? "Save" : "Create"}
              </button>
              {editingRestoId && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    setEditingRestoId(null)
                    setRestoForm(emptyRestaurant)
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <ul className="admin-list">
            {restaurants.map((r) => (
              <li key={r.id} className={`admin-card ${selectedId === r.id ? "admin-card--on" : ""}`}>
                <button type="button" className="linkish admin-card__select" onClick={() => setSelectedId(r.id)}>
                  <strong>{r.name}</strong>
                  <p className="muted">
                    {r.cuisine || "—"} · {r.address || "no address"}
                  </p>
                </button>
                <div className="role-toggles">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => editRestaurant(r)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeRestaurant(r.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          {selected ? (
            <>
              <form className="panel" onSubmit={saveDish}>
                <h2>
                  {editingDishId ? "Edit dish" : "Add dish"} · {selected.name}
                </h2>
                <label>
                  Name
                  <input
                    value={dishForm.name}
                    onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Description
                  <input
                    value={dishForm.description}
                    onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                  />
                </label>
                <label>
                  Price
                  <input
                    type="number"
                    min="0"
                    value={dishForm.price}
                    onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Image URL
                  <input
                    value={dishForm.imageUrl}
                    onChange={(e) => setDishForm({ ...dishForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </label>
                {dishForm.imageUrl && (
                  <img className="dish-preview" src={dishForm.imageUrl} alt="" onError={(e) => { e.currentTarget.style.display = "none" }} />
                )}
                <div className="status-actions">
                  <button type="submit" className="btn btn--primary btn--sm">
                    {editingDishId ? "Save dish" : "Create dish"}
                  </button>
                  {editingDishId && (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => {
                        setEditingDishId(null)
                        setDishForm(emptyDish)
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <ul className="admin-list">
                {dishes.map((d) => (
                  <li key={d.id} className="admin-card admin-card--dish">
                    <img src={dishImage(d)} alt="" className="admin-dish-thumb" />
                    <div>
                      <strong>{d.name}</strong>
                      <p className="muted">
                        {d.price} ₽ · {d.description || "no description"}
                      </p>
                    </div>
                    <div className="role-toggles">
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => editDish(d)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeDish(d.id)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="state">Select a restaurant to manage its menu.</p>
          )}
        </div>
      </div>
    </section>
  )
}
