import { createSlice } from "@reduxjs/toolkit"

const TOKEN_KEY = "zamok_access_token"
const REFRESH_KEY = "zamok_refresh_token"

const initialState = {
  accessToken: localStorage.getItem(TOKEN_KEY) || null,
  refreshToken: localStorage.getItem(REFRESH_KEY) || null,
  user: null,
  status: "idle",
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { accessToken, refreshToken } = action.payload
      state.accessToken = accessToken
      if (refreshToken) state.refreshToken = refreshToken
      state.error = null
      localStorage.setItem(TOKEN_KEY, accessToken)
      if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    },
    setUser(state, action) {
      state.user = action.payload
      state.status = "succeeded"
    },
    setAuthStatus(state, action) {
      state.status = action.payload
    },
    setAuthError(state, action) {
      state.error = action.payload
      state.status = "failed"
    },
    logout(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      state.status = "idle"
      state.error = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(REFRESH_KEY)
    },
  },
})

export const { setCredentials, setUser, setAuthStatus, setAuthError, logout } = authSlice.actions
export default authSlice.reducer
