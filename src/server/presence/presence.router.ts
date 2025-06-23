import { HTTPException } from "hono/http-exception";
import { j } from "../jstack";
import { presenceProtectedProcedure } from "./presence.procedure";
import { z } from "zod";
import { presenceStatusEnum } from "../db/schema";

export const presenceRouter = j.router({
    getGroupPresence: presenceProtectedProcedure
        .input(z.object({
            groupId: z.string()
        }))
        .get(async ({ c, ctx, input }) => {
            const { presenceService } = ctx
            const presence = await presenceService.getGroupPresence(input.groupId)

            if (!presence) {
                throw new HTTPException(404, { message: "Presence not found" })
            }

            return c.superjson({ presence })
        }),

    updatePresence: presenceProtectedProcedure
        .input(z.object({
            groupId: z.string(),
            status: z.enum(presenceStatusEnum.enumValues)
        }))
        .post(async ({ c, ctx, input }) => {
            const { presenceService } = ctx
            const { groupId, status } = input
            const { user } = ctx
            const presence = await presenceService.updatePresence(groupId, user.id, status)

            if (!presence) {
                throw new HTTPException(404, { message: "Presence not updated" })
            }

            return c.superjson({ presence })
        })  
})