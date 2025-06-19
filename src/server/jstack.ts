import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { env } from "hono/adapter"
import { getSignedCookie } from "hono/cookie"
import { HTTPException } from "hono/http-exception"
import { verify } from "hono/jwt"
import type { JWTPayload } from "hono/utils/jwt/types"
import { jstack } from "jstack"
import { Twilio } from "twilio"

type ExtendedJWTPayload = JWTPayload & {
  id: string
  role: string
}

interface Env {
  Bindings: {
    DATABASE_URL: string,
    JWT_REFRESH_SECRET: string,
    JWT_SECRET: string,
    JWT_EXPIRATION_TIME: number,
    NODE_ENV: string,
    TWILIO_ACCOUNT_SID: string,
    TWILIO_AUTH_TOKEN: string,
    TWILIO_VERIFY_SERVICE_SID: string,
  }
}

export const j = jstack.init<Env>()

const databaseMiddleware = j.middleware(async ({ c, next }) => {
  const { DATABASE_URL, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = env(c)

  const sql = neon(DATABASE_URL)
  const db = drizzle(sql)
  const twilio = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

  return await next({ db, twilio })
})


const authMiddleware = j.middleware(async ({ c, next }) => {
  const { JWT_SECRET } = env(c)
  const token = await getSignedCookie(c, JWT_SECRET, "token")
  if (!token) {
    throw new HTTPException(401, { message: "Unauthorized" })
  }

  const decoded = await verify(token, JWT_SECRET) as ExtendedJWTPayload
  if (!decoded.id || !decoded.role) {
   throw new HTTPException(401, { message: "Unauthorized" })
  }

  return await next({user: {id: decoded.id, role: decoded.role}})
})


export const publicProcedure = j.procedure.use(databaseMiddleware)
export const protectedProcedure = publicProcedure.use(authMiddleware)
