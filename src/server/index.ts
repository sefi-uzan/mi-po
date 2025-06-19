import { j } from "./jstack"
import { buildingRouter } from "./routers/building-router"
import { authRouter } from "./routers/auth-router"

/**
 * This is your base API.
 * Here, you can handle errors, not-found responses, cors and more.
 *
 * @see https://jstack.app/docs/backend/app-router
 */
const api = j
  .router()
  .basePath("/")
  .use(j.defaults.cors)
  .onError(j.defaults.errorHandler)

/**
 * This is the main router for your server.
 * All routers in /server/routers should be added here manually.
 */
const appRouter = j.mergeRouters(api, {
  building: buildingRouter,
  auth: authRouter,
})

export type AppRouter = typeof appRouter

export default appRouter
