import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { j } from "../jstack"
import { groupProtectedProcedure } from "./group.procedure"

export const groupRouter = j.router({
  createGroup: groupProtectedProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      type: z.enum(['building', 'family'])
    }))
    .post(async ({ c, ctx, input }) => {
      const { groupService, user } = ctx
      
      const result = await groupService.createGroup({
        ...input,
        createdBy: user.id
      })
      
      return c.superjson({
        success: true,
        group: result.group,
      })
    }),

  joinGroup: groupProtectedProcedure
    .input(z.object({
      inviteCode: z.string().length(10)
    }))
    .post(async ({ c, ctx, input }) => {
      const { groupService, user } = ctx
      console.log(input.inviteCode)
      const result = await groupService.joinGroup(user.id, input.inviteCode)

      if (!result.member || !result.group) {
        throw new HTTPException(400, { message: "Failed to join group" })
      }

      return c.superjson({
        success: true,
        group: result.group,
        role: result.member.role
      })
    }),

  getMyGroups: groupProtectedProcedure
    .get(async ({ c, ctx }) => {
      const { groupService, user } = ctx
      const groups = await groupService.getUserGroups(user.id)
      
      return c.superjson({ groups })
    }),

  getCurrentGroupMember: groupProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid()
    }))
    .get(async ({ c, ctx, input }) => {
      const { groupService, user } = ctx
      const member = await groupService.getCurrentGroupMember(user.id, input.groupId)
      return c.superjson(member)
    }),

  getGroupDetails: groupProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid()
    }))
    .post(async ({ c, ctx, input }) => {
      const { groupService, user } = ctx
      const groupWithRole = await groupService.getGroupWithUserRole(input.groupId, user.id)
      const members = await groupService.getGroupMembersWithDetails(input.groupId)
      
      if (!groupWithRole || !groupWithRole.group) {
        throw new HTTPException(404, { message: "Group not found" })
      }

      return c.superjson({
        group: groupWithRole.group,
        members,
        role: groupWithRole.userRole
      })
    }),

  updateGroup: groupProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      name: z.string().optional()
    }))
    .post(async ({ c, ctx, input }) => {
      const { groupService, user } = ctx
      const { groupId, ...updateData } = input
      // Check if user is admin of the group
      const isAdmin = await groupService.isUserAdmin(groupId, user.id)
      if (!isAdmin) {
        throw new HTTPException(403, { message: "User is not admin of the group" })
      }
      const updatedGroup = await groupService.updateGroup(groupId, updateData)
      
      return c.superjson({
        success: true,
        group: updatedGroup
      })
    }),

  updateGroupMemberDetails: groupProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid(),
      displayName: z.string().min(3).max(10).optional(),
      details: z.string().optional()
    }))
    .post(async ({ c, ctx, input }) => {
      const { groupService, user } = ctx
      const { groupId, displayName, details } = input
      const updatedGroupMember = await groupService.updateGroupMemberDetails(groupId, user.id, displayName, details)

      const displayNameFailed = displayName !== undefined && !updatedGroupMember.updatedUser
      const detailsFailed = details !== undefined && !updatedGroupMember.updatedGroupMember

      if (displayNameFailed || detailsFailed) {
        throw new HTTPException(400, { message: "Failed to update group member details" })
      }

      return c.superjson({
        success: true,
        groupMember: updatedGroupMember
      })
    }),

  deleteGroup: groupProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid()
    }))
    .post(async ({ c, ctx, input }) => {
      const { groupService, user } = ctx
      
      // Check if user is admin of the group
      const isAdmin = await groupService.isUserAdmin(input.groupId, user.id)
      if (!isAdmin) {
        throw new HTTPException(403, { message: "Only admins can delete groups" })
      }

      const deletedGroup = await groupService.deleteGroup(input.groupId)

      if (!deletedGroup) {
        throw new HTTPException(400, { message: "Failed to delete group" })
      }
      
      return c.superjson({
        success: true,
        deletedGroup
      })
    }),

  leaveGroup: groupProtectedProcedure
    .input(z.object({
      groupId: z.string().uuid()
    }))
    .post(async ({ c, ctx, input }) => {
      const { groupService, user } = ctx
      try {
        await groupService.leaveGroup(input.groupId, user.id)

        return c.superjson({
          success: true,
        })
      } catch (error) {
        console.error(error)
        throw new HTTPException(400, { message: "Failed to leave group" })
      }
    }),
})