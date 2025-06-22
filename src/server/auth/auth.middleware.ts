import { env } from "hono/adapter"
import { Twilio } from "twilio"
import { GroupService } from "../group/group.service"
import { DatabaseMiddlewareOutput, j } from "../jstack"
import { AuthService } from "./auth.service"

export const authServicesMiddleware = j.middleware(async ({ c, ctx, next }) => {
  const envVars = env(c)
  const { db } = ctx as DatabaseMiddlewareOutput
  const twilio = new Twilio(envVars.TWILIO_ACCOUNT_SID, envVars.TWILIO_AUTH_TOKEN)

  const groupService = new GroupService(db)
  const authService = new AuthService(
    db,
    twilio,
    envVars.JWT_SECRET,
    envVars.JWT_EXPIRATION_TIME,
    envVars.TWILIO_VERIFY_SERVICE_SID
  )
  
  return await next({ authService, groupService })
})