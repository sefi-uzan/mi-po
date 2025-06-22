import { HTTPException } from "hono/http-exception"
import { z } from "zod"
import { GROUP_CONSTANTS } from "../group/group.constants"
import { j } from "../jstack"
import { AUTH_CONSTANTS } from "./auth.constants"
import { authProtectedProcedure, authPublicProcedure } from "./auth.procedure"

export const authRouter = j.router({
  sendVerificationCode: authPublicProcedure
    .input(z.object({ phone: z.string().min(10).max(15) }))
    .post(async ({ c, ctx, input }) => {
      const { authService } = ctx
      const normalizedPhone = authService.normalizePhoneNumber(input.phone)
      if (!normalizedPhone) {
        throw new HTTPException(400, { message: "Invalid phone number" })
      }
      const result = await authService.sendVerificationCode(normalizedPhone)
      
      if (!result.success) {
        throw new HTTPException(500, { message: "Failed to send verification code" })
      }
      
      return c.superjson({
        success: true,
        message: "Verification code sent",
        expiresAt: result.expiresAt
      })
    }),

  create: authPublicProcedure
    .input(z.object({
      phone: z.string().min(10).max(15),
      code: z.string().length(AUTH_CONSTANTS.VERIFICATION_CODE_LENGTH),
      displayName: z.string().min(3).max(10),
      inviteCode: z.string().length(GROUP_CONSTANTS.INVITE_CODE_LENGTH).optional()
    }))
    .post(async ({ c, ctx, input }) => {
      const { authService, groupService } = ctx
      const normalizedPhone = authService.normalizePhoneNumber(input.phone)
      if (!normalizedPhone) {
        throw new HTTPException(400, { message: "Invalid phone number" })
      }
      const result = await authService.verifyCode(normalizedPhone, input.code)
      
      if (!result.success) {
        throw new HTTPException(401, { message: "Invalid verification code" })
      }

      let user = await authService.findUserByPhone(normalizedPhone)
      if (!user) {
        user = await authService.createUser(normalizedPhone, input.displayName)
      }

      if (input.inviteCode) {
        const group = await groupService.joinGroup(user.id, input.inviteCode)
        if (!group) {
          throw new HTTPException(400, { message: "Failed to join group" })
        }
      }

      const token = await authService.generateJWT(user.id)

      await authService.setCookie(c, token)

      return c.superjson({
        success: true,
        user: user
      })
    }),
    login: authPublicProcedure
    .input(z.object({
      phone: z.string().min(10).max(15),
      code: z.string().length(6),
    }))
    .post(async ({ c, ctx, input }) => {
      const { authService } = ctx 

      const normalizedPhone = authService.normalizePhoneNumber(input.phone)
      if (!normalizedPhone) {
        throw new HTTPException(400, { message: "Invalid phone number" })
      }
      const result = await authService.verifyCode(normalizedPhone, input.code)
      
      if (!result.success) {
        throw new HTTPException(401, { message: "Invalid verification code" })
      }

      const user = await authService.findUserByPhone(normalizedPhone)

      if (!user) {
        throw new HTTPException(404, { message: "User not found" })
      }
      const token = await authService.generateJWT(user.id)

      await authService.setCookie(c, token)

      return c.superjson({
        success: true,
        user: user
      })
    }),

  getCurrentUser: authProtectedProcedure
    .get(async ({ c, ctx }) => {
      const { authService } = ctx
      const user = await authService.findUserById(ctx.user.id)

      if (!user) {
        throw new HTTPException(404, { message: "User not found" })
      }

      return c.superjson({ user })
    }),

  updateUser: authProtectedProcedure
    .input(z.object({
      displayName: z.string().min(3).max(10)
    }))
    .post(async ({ c, ctx, input }) => {
      const { authService } = ctx
      const user = await authService.findUserById(ctx.user.id)

      if (!user) {
        throw new HTTPException(404, { message: "User not found" })
      }

      await authService.updateUser(ctx.user.id, input.displayName)

      return c.superjson({
        success: true,
        message: "Profile updated"
      })
    })
})