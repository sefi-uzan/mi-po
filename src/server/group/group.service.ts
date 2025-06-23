import { and, eq } from "drizzle-orm"
import { groupMembers, groups, users } from "../db/schema"
import { Database } from "../jstack"
import { GROUP_CONSTANTS } from "./group.constants"
import { HTTPException } from "hono/http-exception"

interface CreateGroupData {
  name: string
  type: 'building' | 'family'
  createdBy: string
}

interface UpdateGroupData {
  name?: string
}

export class GroupService {
  constructor(
    private db: Database,
  ) {}

  async createGroup(data: CreateGroupData) {
    const inviteCode = this.generateInviteCode()
    
    const [group] = await this.db.insert(groups).values({
      name: data.name,
      type: data.type,
      inviteCode,
      createdBy: data.createdBy
    }).returning()

    if (!group) {
      throw new Error('Failed to create group')
    }

    // Add creator as admin
    await this.db.insert(groupMembers).values({
      userId: data.createdBy,
      groupId: group.id,
      role: 'admin'
    })

    return { group }
  }

  async joinGroup(userId: string, inviteCode: string) {
    const [group] = await this.db.select().from(groups)
      .where(eq(groups.inviteCode, inviteCode)).limit(1)

    if (!group) {
      throw new HTTPException(400, { message: "Invalid invite code" })
    }

    const existingMember = await this.db.select().from(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, group.id)))
      .limit(1)
    
    if (existingMember.length > 0) {
      throw new HTTPException(400, { message: "Already a member of this group" })
    }
    
    const [member] = await this.db.insert(groupMembers).values({
      userId,
      groupId: group.id,
      role: 'member'
    }).returning()

    return { group, member }
  }

  async getUserGroups(userId: string) {
    const userGroups = await this.db.select({
      group: groups,
      role: groupMembers.role
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))

    return userGroups
  }

  async getGroupMembersWithDetails(groupId: string) {
    const membersWithDetails = await this.db.select({
      id: groupMembers.id,
      userId: groupMembers.userId,
      groupId: groupMembers.groupId,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
      displayName: users.displayName,
      phone: users.phone,
      isVerified: users.isVerified,
      details: groupMembers.details
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(eq(groupMembers.groupId, groupId))
    
    return membersWithDetails
  }

  async getGroupMembers(groupId: string) {
    const members = await this.db.select().from(groupMembers)
      .where(eq(groupMembers.groupId, groupId))
    return members
  }

  async getGroupById(groupId: string) {
    const [group] = await this.db.select().from(groups)
      .where(eq(groups.id, groupId)).limit(1)
    return group
  }

  async getGroupWithUserRole(groupId: string, userId: string) {
    const group = await this.getGroupById(groupId)
    if (!group) return null

    const [membership] = await this.db.select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1)

    return {
      group,
      userRole: membership?.role || null
    }
  }

  async isUserAdmin(groupId: string, userId: string): Promise<boolean> {
    const [membership] = await this.db.select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1)
    
    return membership?.role === 'admin'
  }

  async updateGroup(groupId: string, data: UpdateGroupData) {
    const [updatedGroup] = await this.db.update(groups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groups.id, groupId))
      .returning()
    
    return updatedGroup
  }

  async updateGroupMemberDetails(groupId: string, userId: string, displayName?: string, details?: string) {
    let updatedUser
    let updatedGroupMember
    if (details) {
      updatedGroupMember = await this.db.update(groupMembers)
      .set({ details })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))).returning()
    }

    if (displayName) {
      updatedUser = await this.db.update(users)
      .set({ displayName })
      .where(eq(users.id, userId)).returning()
    }
   

    return { updatedGroupMember, updatedUser }
  }

  async getCurrentGroupMember(userId: string, groupId: string) {
    const [groupMember] = await this.db.select().from(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId))).limit(1)

    const [user] = await this.db.select().from(users)
      .where(eq(users.id, userId)).limit(1)
    const combined = { groupMember, user }
    return combined
  }

  async deleteGroup(groupId: string) {
    const [deletedGroup] = await this.db.delete(groups).where(eq(groups.id, groupId)).returning()

    return { deletedGroup }
  }

  async leaveGroup(groupId: string, userId: string) {
    const [deletedGroup] = await this.db.delete(groupMembers).where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))).returning()

    return { deletedGroup }
  }

  generateInviteCode(): string {

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = GROUP_CONSTANTS.INVITE_CODE_LENGTH;
  
  const randomBytes = new Uint8Array(codeLength);
  crypto.getRandomValues(randomBytes);
  
  return Array.from(randomBytes)
    .map(byte => chars[byte % chars.length])
    .join('');
  }
}