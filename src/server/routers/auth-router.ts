import { generateSecureInviteCode, normalizePhoneNumber } from "@/lib/utils"
import { buildings, presenceStatus, residents } from "@/server/db/schema"
import { and, eq } from "drizzle-orm"
import { env } from "hono/adapter"
import { deleteCookie, setSignedCookie } from "hono/cookie"
import { HTTPException } from "hono/http-exception"
import { sign } from "hono/jwt"
import { z } from "zod"
import { j, publicProcedure } from "../jstack"


export const authRouter = j.router({
  // TODO: phone and code validation
  createOwner: publicProcedure
  .input(z.object({ phoneNumber: z.string().min(1), code: z.string().length(6), name: z.string().min(1).max(20), details: z.string().optional(), buildingName: z.string().min(1).max(20) }))
  .post(async ({ c, ctx, input }) => {
    const { TWILIO_VERIFY_SERVICE_SID, JWT_SECRET, NODE_ENV, JWT_EXPIRATION_TIME, DOMAIN } = env(c)
    const { db, twilio } = ctx
    const { phoneNumber, code, name } = input

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

    if (!normalizedPhoneNumber) {
      throw new HTTPException(400, { message: "Invalid phone number format" })
    }

    const verification = await twilio.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
      to: normalizedPhoneNumber,
      code: code
    })

    if (verification.status !== "approved") {
      throw new HTTPException(401, { message: "Invalid code or expired code" })
    }

    const resident = await db.select().from(residents)
      .where(eq(residents.phoneNumber, normalizedPhoneNumber))
      .limit(1)

    if (resident[0]) {
      throw new HTTPException(409, { message: "A user with this phone number already exists" })
    }

    const buildingResult = await db.insert(buildings).values({
      name: input.buildingName,
      inviteCode: generateSecureInviteCode()
    }).returning()

  if (!buildingResult[0]) {
    throw new HTTPException(500, { message: "Failed to create building" })
  }

    const newResident = await db.insert(residents).values({
      type: "owner",
      displayName: name,
      phoneNumber: normalizedPhoneNumber,
      phoneVerified: true,
      details: input.details,
      buildingId: buildingResult[0].id
    }).returning()

    if (!newResident[0]) {
      throw new HTTPException(500, { message: "Failed to create resident" })
    }
    
    const presence = await db.insert(presenceStatus).values({
      residentId: newResident[0].id,
      buildingId: buildingResult[0].id,
      isPresent: false,
      lastUpdated: new Date()
    }).returning()

    if (!presence[0]) {
      throw new HTTPException(500, { message: "Failed to create presence status" })
    }

    const token = await sign({
      id: newResident[0].id,
      role: "owner",
      exp: Math.floor((Date.now() + parseInt(JWT_EXPIRATION_TIME, 10)) / 1000),
      iat: Math.floor(Date.now() / 1000),
    }, JWT_SECRET)

    await setSignedCookie(c, "token", token, JWT_SECRET,
      {
        path: "/",
        domain: NODE_ENV === "production" ? DOMAIN : undefined,
        secure: NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax"
      }
    )

    return c.status(201)
  }),
  loginPhone: publicProcedure
  .input(z.object({ phoneNumber: z.string().min(1), code: z.string().length(6) }))
  .post(async ({ c, ctx, input }) => {
    const { TWILIO_VERIFY_SERVICE_SID, JWT_SECRET, NODE_ENV, JWT_EXPIRATION_TIME, DOMAIN } = env(c)
    const { db, twilio } = ctx
    const { phoneNumber, code } = input

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

    if (!normalizedPhoneNumber) {
      throw new HTTPException(400, { message: "Invalid phone number format" })
    }

    const verification = await twilio.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
      to: normalizedPhoneNumber,
      code: code
    })

    if (verification.status !== "approved") {
      throw new HTTPException(401, { message: "Invalid code or expired code" })
    }

    const resident = await db.select().from(residents)
      .where(eq(residents.phoneNumber, normalizedPhoneNumber))
      .limit(1)

    if (!resident[0]) {
      throw new HTTPException(404, { message: "User not found" })
    }

    const token = await sign({
      id: resident[0].id,
      role: resident[0].type,
      exp: Math.floor((Date.now() + parseInt(JWT_EXPIRATION_TIME, 10)) / 1000),
      iat: Math.floor(Date.now() / 1000),
    }, JWT_SECRET)
    

    await setSignedCookie(c, "token", token, JWT_SECRET,
      {
        path: "/",
        domain: NODE_ENV === "production" ? DOMAIN : undefined,
        secure: NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax"
      }
    )

    return c.status(201)
  }),
  createResident: publicProcedure
  .input(z.object({ phoneNumber: z.string().min(1).optional(), code: z.string().length(6).optional(), name: z.string().min(1).max(20), details: z.string().optional(), buildingInviteCode: z.string().min(1) }))
  .post(async ({ c, ctx, input }) => {
    const { db, twilio } = ctx
    const { TWILIO_VERIFY_SERVICE_SID, JWT_SECRET, NODE_ENV, JWT_EXPIRATION_TIME, DOMAIN } = env(c)
    const { phoneNumber, code, name, details, buildingInviteCode } = input

    const building = await db.select().from(buildings)
      .where(eq(buildings.inviteCode, buildingInviteCode))
      .limit(1)

    if (!building[0]) {
      throw new HTTPException(404, { message: "Building not found" })
    }

    if (phoneNumber && code) {
      const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

      if (!normalizedPhoneNumber) {
        throw new HTTPException(400, { message: "Invalid phone number format" })
      }

      const existingResident = await db.select().from(residents)
        .where(eq(residents.phoneNumber, normalizedPhoneNumber))
        .limit(1)

      if (existingResident[0]) {
        throw new HTTPException(409, { message: "A user with this phone number already exists" })
      }
      const verification = await twilio.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
        to: normalizedPhoneNumber,
        code: code
      })
  
      if (verification.status !== "approved") {
        throw new HTTPException(401, { message: "Invalid code or expired code" })
      }
    }

    const resident = await db.select().from(residents)
      .where(and(
        eq(residents.displayName, name),
        eq(residents.buildingId, building[0].id)
      ))
      .limit(1)

    if (resident[0]) {
      throw new HTTPException(409, { message: "A user with this name already exists in this building" })
    }

    // Create the resident
    const newResident = await db.insert(residents).values({
      type: "resident",
      displayName: name,
      phoneNumber: phoneNumber ?? null,
      phoneVerified: phoneNumber ? true : false,
      details: details,
      buildingId: building[0].id
    }).returning()

    if (!newResident[0]) {
      throw new HTTPException(500, { message: "Failed to create resident" })
    }

    const presence = await db.insert(presenceStatus).values({
      residentId: newResident[0].id,
      buildingId: building[0].id,
      isPresent: false,
      lastUpdated: new Date()
    }).returning()

    if (!presence[0]) {
      throw new HTTPException(500, { message: "Failed to create presence status" })
    }

    const token = await sign({
      id: newResident[0].id,
      role: "resident",
      exp: Math.floor((Date.now() + parseInt(JWT_EXPIRATION_TIME, 10)) / 1000),
      iat: Math.floor(Date.now() / 1000),
    }, JWT_SECRET)

    await setSignedCookie(c, "token", token, JWT_SECRET,
      {
        path: "/",
        domain: NODE_ENV === "production" ? DOMAIN : undefined,
        secure: NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax"
      }
    )

    return c.status(201)
  }),
  loginName: publicProcedure
  .input(z.object({ name: z.string().min(1).max(20), buildingInviteCode: z.string().min(1) }))
  .post(async ({ c, ctx, input }) => {
    const { db} = ctx
    const { JWT_SECRET, NODE_ENV, JWT_EXPIRATION_TIME, DOMAIN } = env(c)
    const { name, buildingInviteCode } = input

    const building = await db.select().from(buildings)
      .where(eq(buildings.inviteCode, buildingInviteCode))
      .limit(1)

    if (!building[0]) {
      throw new HTTPException(404, { message: "Building not found" })
    }

    const resident = await db.select().from(residents)
      .where(and(
        eq(residents.displayName, name),
        eq(residents.buildingId, building[0].id)
      ))
      .limit(1)

    if (!resident[0]) {
      throw new HTTPException(404, { message: "User not found in this building" })
    }

    if (resident[0].phoneVerified) {
      throw new HTTPException(400, { message: "Please log in with your phone number" })
    }
 
        const token = await sign({
        id: resident[0].id,
        role: resident[0].type,
        exp: Math.floor((Date.now() + parseInt(JWT_EXPIRATION_TIME, 10)) / 1000),
        iat: Math.floor(Date.now() / 1000),
      }, JWT_SECRET)


    await setSignedCookie(c, "token", token, JWT_SECRET,
      {
        path: "/",
        domain: NODE_ENV === "production" ? DOMAIN : undefined,
        secure: NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax"
      }
    )

    return c.status(201)
  }),
  sendSmsCode: publicProcedure
  .input(z.object({ phoneNumber: z.string().min(1) }))
  .post(async ({ c, ctx, input }) => {
    const { TWILIO_VERIFY_SERVICE_SID } = env(c)
    const { twilio } = ctx
    const { phoneNumber } = input

    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)

    if (!normalizedPhoneNumber) {
      throw new HTTPException(400, { message: "Invalid phone number format" })
    }

    try {
      const verification = await twilio.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verifications.create({
        to: normalizedPhoneNumber,
        channel: "sms",
        rateLimits: {
          "sms-code-limit": {
            quantity: 5,
            interval: 60,
          }
        }  
      })
      
      if (verification.status === "pending") {
        return c.json({ success: true, message: "Verification code sent" })
      }
      else {
        return c.json({ success: false, message: "Failed to send verification code" })
      }
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 60200) {
        throw new HTTPException(400, { message: "Invalid phone number format" })
      } else if ((error as { code?: number }).code === 60203) {
        throw new HTTPException(400, { message: "Too many verification attempts. Please try again later." })
      } else if ((error as { code?: number }).code === 60202) {
        throw new HTTPException(400, { message: "SMS delivery failed. Please check your phone number." })
      } else if ((error as { code?: number }).code === 60410) {
        throw new HTTPException(400, { message: "Phone number temporarily blocked. Please try a different number." })
      }
      
      throw new HTTPException(500, { message: "Failed to send verification code. Please try again." })
    }
  }),
  logout: publicProcedure
  .post(async ({ c }) => {
    deleteCookie(c, "token")
    return c.status(200)
  })
})
