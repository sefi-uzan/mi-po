import { buildings, residents } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { j, protectedProcedure } from "../jstack"

export const buildingRouter = j.router({
  getBuilding: protectedProcedure.get(async ({ c, ctx }) => {
    const { db, user } = ctx

    const resident = await db.select().from(residents)
      .where(eq(residents.id, user.id))
      .limit(1)

    if (!resident[0]) {
      throw new HTTPException(404, { message: "Resident not found" })
    }

    const building = await db.select().from(buildings)
      .where(eq(buildings.id, resident[0].buildingId))
      .limit(1)

    if (!building[0]) {
      throw new HTTPException(404, { message: "Building not found" })
    }

    const buildingResidents = await db.select().from(residents)
      .where(eq(residents.buildingId, building[0].id))

    return c.superjson({
      ...building[0],
      residents: buildingResidents
    })
  }), 
})
