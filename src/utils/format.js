/** Cuisine-based cover images (Unsplash) for seed restaurants without imageUrl */
const COVERS = {
  American: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=900&q=80",
  Italian: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=900&q=80",
  Japanese: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=900&q=80",
  Healthy: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=900&q=80",
  default: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
}

const FALLBACK_DISH =
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"

export function restaurantCover(restaurant) {
  if (!restaurant) return COVERS.default
  return COVERS[restaurant.cuisine] || COVERS.default
}

export function dishImage(dish) {
  if (dish?.imageUrl) return dish.imageUrl
  return FALLBACK_DISH
}

export function formatPrice(amount) {
  const value = Number(amount) || 0
  return `${value.toLocaleString("en-US")} ₽`
}

export function formatDate(value) {
  if (!value) return "—"
  const date = new Date(value)
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function statusLabel(status) {
  const map = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    COOKING: "Cooking",
    READY_FOR_DELIVERY: "Ready",
    DELIVERING: "On the way",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  }
  return map[status] || status
}
