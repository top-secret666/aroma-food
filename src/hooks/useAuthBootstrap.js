import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { authApi, userApi } from "../api/client"
import { logout, setAuthStatus, setCredentials, setUser } from "../store/authSlice"

export function useAuthBootstrap() {
  const dispatch = useDispatch()
  const accessToken = useSelector((s) => s.auth.accessToken)
  const refreshToken = useSelector((s) => s.auth.refreshToken)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!accessToken) {
        dispatch(setAuthStatus("idle"))
        return
      }
      dispatch(setAuthStatus("loading"))
      try {
        const me = await userApi.me()
        if (!cancelled) dispatch(setUser(me))
      } catch (err) {
        if (err.status === 401 && refreshToken) {
          try {
            const tokens = await authApi.refresh(refreshToken)
            dispatch(
              setCredentials({
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token || refreshToken,
              })
            )
            const me = await userApi.me()
            if (!cancelled) dispatch(setUser(me))
            return
          } catch {
            if (!cancelled) dispatch(logout())
            return
          }
        }
        if (!cancelled) dispatch(logout())
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [accessToken, refreshToken, dispatch])
}
