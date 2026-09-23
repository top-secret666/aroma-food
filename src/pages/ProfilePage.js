import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { userApi } from "../api/client"
import { setUser } from "../store/authSlice"

const emptyAddress = { street: "", city: "", zip: "", state: "", country: "" }

export default function ProfilePage() {
  const dispatch = useDispatch()
  const token = useSelector((s) => s.auth.accessToken)
  const user = useSelector((s) => s.auth.user)
  const [fullName, setFullName] = useState(user?.fullName || "")
  const [addresses, setAddresses] = useState([])
  const [form, setForm] = useState(emptyAddress)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const refreshAddresses = async () => {
    const list = await userApi.listAddresses()
    setAddresses(Array.isArray(list) ? list : [])
  }

  useEffect(() => {
    setFullName(user?.fullName || "")
  }, [user])

  useEffect(() => {
    refreshAddresses().catch((err) => setError(err.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const updated = await userApi.updateMe({ fullName })
      dispatch(setUser(updated))
      setMessage("Profile updated")
    } catch (err) {
      setError(err.message || "Update failed")
    } finally {
      setSaving(false)
    }
  }

  const addAddress = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await userApi.createAddress(form)
      setForm(emptyAddress)
      await refreshAddresses()
      setMessage("Address added")
    } catch (err) {
      setError(err.message || "Could not add address")
    }
  }

  const removeAddress = async (id) => {
    try {
      await userApi.deleteAddress(id)
      await refreshAddresses()
    } catch (err) {
      setError(err.message || "Could not delete address")
    }
  }

  return (
    <section className="section narrow">
      <h1>Profile</h1>
      <p className="muted">{user?.email}</p>

      <form className="panel" onSubmit={saveProfile}>
        <h2>Account</h2>
        <label>
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} minLength={3} required />
        </label>
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>

      <form className="panel" onSubmit={addAddress}>
        <h2>Delivery addresses</h2>
        <div className="grid-2">
          <label>
            Street
            <input
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              required
            />
          </label>
          <label>
            City
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </label>
          <label>
            ZIP
            <input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
          </label>
          <label>
            Country
            <input
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
          </label>
        </div>
        <button type="submit" className="btn btn--primary btn--sm">
          Add address
        </button>

        <ul className="address-list">
          {addresses.map((a) => (
            <li key={a.id}>
              <span>
                {a.street}, {a.city}
                {a.zip ? ` ${a.zip}` : ""}
                {a.country ? `, ${a.country}` : ""}
              </span>
              <button type="button" className="linkish" onClick={() => removeAddress(a.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </form>

      {message && <div className="banner banner--ok">{message}</div>}
      {error && <div className="banner banner--error">{error}</div>}
    </section>
  )
}
