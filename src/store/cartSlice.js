import { createSlice } from "@reduxjs/toolkit"

const CART_KEY = "zamok_cart"

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : { restaurantId: null, restaurantName: null, items: [] }
  } catch {
    return { restaurantId: null, restaurantName: null, items: [] }
  }
}

function persist(state) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify({
      restaurantId: state.restaurantId,
      restaurantName: state.restaurantName,
      items: state.items,
    })
  )
}

const cartSlice = createSlice({
  name: "cart",
  initialState: loadCart(),
  reducers: {
    addItem(state, action) {
      const { restaurantId, restaurantName, dish } = action.payload
      if (state.restaurantId && state.restaurantId !== restaurantId) {
        state.items = []
      }
      state.restaurantId = restaurantId
      state.restaurantName = restaurantName
      const existing = state.items.find((i) => i.dishId === dish.id)
      if (existing) {
        existing.quantity += 1
      } else {
        state.items.push({
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          imageUrl: dish.imageUrl || null,
        })
      }
      persist(state)
    },
    setQuantity(state, action) {
      const { dishId, quantity } = action.payload
      const item = state.items.find((i) => i.dishId === dishId)
      if (!item) return
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.dishId !== dishId)
      } else {
        item.quantity = quantity
      }
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = null
      }
      persist(state)
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.dishId !== action.payload)
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = null
      }
      persist(state)
    },
    clearCart(state) {
      state.restaurantId = null
      state.restaurantName = null
      state.items = []
      persist(state)
    },
  },
})

export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export default cartSlice.reducer
