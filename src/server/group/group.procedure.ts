// auth/auth.procedure.ts
import { protectedProcedure, publicProcedure } from "../jstack"
import { groupServicesMiddleware } from "./group.middleware"

export const groupPublicProcedure = publicProcedure.use(groupServicesMiddleware)
export const groupProtectedProcedure = protectedProcedure.use(groupServicesMiddleware)