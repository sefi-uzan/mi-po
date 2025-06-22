import { DatabaseMiddlewareOutput, j } from "../jstack"
import { GroupService } from "./group.service"

export const groupServicesMiddleware = j.middleware(async ({ ctx, next }) => {
  const { db } = ctx as DatabaseMiddlewareOutput

  const groupService = new GroupService(
    db,
  )
  
  return await next({ groupService })
})