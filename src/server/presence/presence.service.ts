import { Database } from "../jstack";
import { presenceStatus, presenceStatusEnum } from "../db/schema";
import { and, eq } from "drizzle-orm";

export class PresenceService {
    constructor(
        private db: Database
    ) {}

    async getGroupPresence(groupId: string) {
        const presence = await this.db.select().from(presenceStatus).where(eq(presenceStatus.groupId, groupId))
        return presence
    }

    async updatePresence(groupId: string, userId: string, status: (typeof presenceStatusEnum.enumValues)[number]) {
        console.log(groupId, userId, status)
        let [presence] = await this.db.update(presenceStatus).set({
            status: status,
            lastUpdated: new Date()
        }).where(and(eq(presenceStatus.groupId, groupId), eq(presenceStatus.userId, userId))).returning()

        if (!presence) {
            [presence] = await this.db.insert(presenceStatus).values({
                groupId: groupId,
                userId: userId,
                status: status,
                lastUpdated: new Date()
            }).returning()
        }
        return presence
    }
}