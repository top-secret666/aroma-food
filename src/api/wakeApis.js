import { config } from "./client"

/** Ping Render free-tier services so cold starts begin before login/catalog. */
export function wakeBackendApis() {
  const targets = [
    `${config.USER_API}/actuator/health`,
    `${config.RESTAURANT_API}/actuator/health`,
    `${config.ORDER_API}/actuator/health`,
  ]
  targets.forEach((url) => {
    fetch(url, { method: "GET", mode: "cors", cache: "no-store" }).catch(() => {})
  })
}
