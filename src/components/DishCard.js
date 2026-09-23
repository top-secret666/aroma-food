import { dishImage, formatPrice } from "../utils/format"

export default function DishCard({ dish, onAdd }) {
  return (
    <article className="dish">
      <div className="dish__media">
        <img
          src={dishImage(dish)}
          alt={dish.name || "Dish"}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80"
          }}
        />
      </div>
      <div className="dish__body">
        <div className="dish__top">
          <h3>{dish.name}</h3>
          <span className="dish__price">{formatPrice(dish.price)}</span>
        </div>
        {dish.description && <p className="dish__desc">{dish.description}</p>}
        {onAdd && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onAdd(dish)}>
            Add to cart
          </button>
        )}
      </div>
    </article>
  )
}
