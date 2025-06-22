// auth/auth.procedure.ts
import { protectedProcedure, publicProcedure } from "../jstack"
import { authServicesMiddleware } from "./auth.middleware"

export const authPublicProcedure = publicProcedure.use(authServicesMiddleware)
export const authProtectedProcedure = protectedProcedure.use(authServicesMiddleware)