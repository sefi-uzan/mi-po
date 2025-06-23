// auth/auth.procedure.ts
import { protectedProcedure, publicProcedure } from "../jstack"
import { presenceServicesMiddleware } from "./presence.middleware"

export const presencePublicProcedure = publicProcedure.use(presenceServicesMiddleware)
export const presenceProtectedProcedure = protectedProcedure.use(presenceServicesMiddleware)