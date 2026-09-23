import { Link } from "react-router-dom"
import { restaurantCover } from "../utils/format"

export default function RestaurantCard({ restaurant, index = 0 }) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="resto"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="resto__media">
        <img
          src={restaurantCover(restaurant)}
          alt={restaurant.name || "Restaurant"}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80"
          }}
        />
      </div>
      <div className="resto__body">
        <h3 className="resto__title">{restaurant.name}</h3>
        <p className="resto__meta">
          {restaurant.cuisine || "Various"}
          {restaurant.address ? ` · ${restaurant.address}` : ""}
        </p>
      </div>
    </Link>
  )
}
