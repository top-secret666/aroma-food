import axios from "axios"
import { store } from "../store/store"
import { logout, setCredentials } from "../store/authSlice"

const USER_API = process.env.REACT_APP_USER_API || "http://localhost:8084"
const RESTAURANT_API = process.env.REACT_APP_RESTAURANT_API || "http://localhost:8081"
const ORDER_API = process.env.REACT_APP_ORDER_API || "http://localhost:8082"

function createClient(baseURL) {
  const instance = axios.create({
    baseURL,
    timeout: 8000,
    headers: { Accept: "application/json" },
  })

  instance.interceptors.request.use((config) => {
    const token = store.getState().auth.accessToken || localStorage.getItem("zamok_access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config
      const status = error.response?.status
      const refresh = store.getState().auth.refreshToken || localStorage.getItem("zamok_refresh_token")

      if (status === 401 && refresh && original && !original._retry && !String(original.url || "").includes("/api/auth/")) {
        original._retry = true
        try {
          const { data } = await axios.post(`${USER_API}/api/auth/refresh`, { refreshToken: refresh })
          store.dispatch(
            setCredentials({
              accessToken: data.access_token,
              refreshToken: data.refresh_token || refresh,
            })
          )
          original.headers.Authorization = `Bearer ${data.access_token}`
          return instance(original)
        } catch {
          store.dispatch(logout())
        }
      }

      const payload = error.response?.data
      const message =
        (payload && (payload.message || payload.error || payload.error_description)) ||
        error.message ||
        "Request failed"
      const err = new Error(typeof message === "string" ? message : "Request failed")
      err.status = status || 0
      err.data = payload
      throw err
    }
  )

  return instance
}

const userHttp = createClient(USER_API)
const restaurantHttp = createClient(RESTAURANT_API)
const orderHttp = createClient(ORDER_API)

export const authApi = {
  register: async (payload) => (await userHttp.post("/api/auth/register", payload)).data,
  login: async (payload) => (await userHttp.post("/api/auth/login", payload)).data,
  google: async (idToken) => (await userHttp.post("/api/auth/google", { idToken })).data,
  refresh: async (refreshToken) => (await userHttp.post("/api/auth/refresh", { refreshToken })).data,
  sync: async () => (await userHttp.post("/api/auth/sync")).data,
}

export const userApi = {
  me: async () => (await userHttp.get("/api/users/me")).data,
  updateMe: async (payload) => (await userHttp.put("/api/users/me", payload)).data,
  listAll: async () => (await userHttp.get("/api/users")).data,
  search: async (query) =>
    (await userHttp.get("/api/users/search", { params: { query } })).data,
  updateRoles: async (id, roles) => (await userHttp.put(`/api/users/${id}/roles`, { roles })).data,
  listAddresses: async () => (await userHttp.get("/api/users/me/addresses")).data,
  createAddress: async (payload) => (await userHttp.post("/api/users/me/addresses", payload)).data,
  updateAddress: async (id, payload) => (await userHttp.put(`/api/users/me/addresses/${id}`, payload)).data,
  deleteAddress: async (id) => {
    await userHttp.delete(`/api/users/me/addresses/${id}`)
  },
}

export const restaurantApi = {
  list: async () => (await restaurantHttp.get("/api/restaurants")).data,
  get: async (id) => (await restaurantHttp.get(`/api/restaurants/${id}`)).data,
  search: async (name) =>
    (await restaurantHttp.get("/api/restaurants/search", { params: { name } })).data,
  popular: async (limit = 5) =>
    (await restaurantHttp.get("/api/restaurants/popular", { params: { limit } })).data,
  create: async (payload) => (await restaurantHttp.post("/api/restaurants", payload)).data,
  update: async (id, payload) => (await restaurantHttp.put(`/api/restaurants/${id}`, payload)).data,
  remove: async (id) => {
    await restaurantHttp.delete(`/api/restaurants/${id}`)
  },
  dishes: async (restaurantId) =>
    (await restaurantHttp.get(`/api/restaurants/${restaurantId}/dishes`)).data,
  createDish: async (restaurantId, payload) =>
    (await restaurantHttp.post(`/api/restaurants/${restaurantId}/dishes`, {
      ...payload,
      restaurantId: Number(restaurantId),
    })).data,
  updateDish: async (restaurantId, dishId, payload) =>
    (await restaurantHttp.put(`/api/restaurants/${restaurantId}/dishes/${dishId}`, {
      ...payload,
      id: Number(dishId),
      restaurantId: Number(restaurantId),
    })).data,
  removeDish: async (restaurantId, dishId) => {
    await restaurantHttp.delete(`/api/restaurants/${restaurantId}/dishes/${dishId}`)
  },
  rating: async (id) => (await restaurantHttp.get(`/api/restaurants/${id}/rating`)).data,
  rate: async (id, score, comment) => {
    await restaurantHttp.post(`/api/restaurants/${id}/rating`, { score, comment })
  },
}

export const orderApi = {
  place: async (payload) => (await orderHttp.post("/api/orders", payload)).data,
  list: async () => (await orderHttp.get("/api/orders")).data,
  get: async (id) => (await orderHttp.get(`/api/orders/${id}`)).data,
  cancel: async (id) => (await orderHttp.patch(`/api/orders/${id}/cancel`)).data,
  updateStatus: async (id, status) =>
    (await orderHttp.put(`/api/orders/${id}/status`, { status })).data,
}

export const config = { USER_API, RESTAURANT_API, ORDER_API }
