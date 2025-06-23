import { DatabaseMiddlewareOutput, j } from "../jstack"
import { PresenceService } from "./presence.service"

export const presenceServicesMiddleware = j.middleware(async ({ ctx, next }) => {
  const { db } = ctx as DatabaseMiddlewareOutput

  const presenceService = new PresenceService(
    db,
  )
  
  return await next({ presenceService })
})