import { buildings, presenceStatus, residents } from "@/server/db/schema"
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
      residents: buildingResidents,
      currentUserId: user.id
    })
  }),
  togglePresence: protectedProcedure.post(async ({ c, ctx }) => {
    const { db, user } = ctx

    const resident = await db.select().from(residents)
      .where(eq(residents.id, user.id))
      .limit(1)

    if (!resident[0]) {
      throw new HTTPException(404, { message: "Resident not found" })
    }

    const currentPresence = await db.select().from(presenceStatus)
      .where(eq(presenceStatus.residentId, user.id))
      .limit(1)

    if (!currentPresence[0]) {
      throw new HTTPException(404, { message: "Presence status not found" })
    }

    await db.update(presenceStatus)
      .set({ 
        isPresent: !currentPresence[0].isPresent,
        lastUpdated: new Date()
      })
      .where(eq(presenceStatus.residentId, user.id))

    return c.superjson({
      message: "Presence status updated"
    })
  }),
  checkPresence: protectedProcedure.get(async ({ c, ctx }) => {
    const { db, user } = ctx

    const resident = await db.select().from(residents)
      .where(eq(residents.id, user.id))
      .limit(1)

    if (!resident[0]) {
      throw new HTTPException(404, { message: "Resident not found" })
    }

    const presence = await db.select({
      residentId: presenceStatus.residentId,
      isPresent: presenceStatus.isPresent,
      lastUpdated: presenceStatus.lastUpdated
    })
    .from(presenceStatus)
    .where(eq(presenceStatus.buildingId, resident[0].buildingId))

    return c.superjson(presence)
  })
})
