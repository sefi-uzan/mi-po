import { eq } from "drizzle-orm";
import { Context } from "hono";
import { env } from "hono/adapter";
import { setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { Twilio } from "twilio";
import { users } from "../db/schema";
import { Database } from "../jstack";
import { AUTH_CONSTANTS } from "./auth.constants";



export class AuthService {
  constructor(
    private db: Database,
    private twilioClient: Twilio,
    public readonly jwtSecret: string,
    private jwtExpirationTime: string,
    private twilioVerifyServiceSid: string
  ) {}

  async sendVerificationCode(phone: string): Promise<{ success: boolean; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + AUTH_CONSTANTS.VERIFICATION_EXPIRY_MINUTES * 60 * 1000)
    
    try {
      await this.twilioClient.verify.v2
        .services(this.twilioVerifyServiceSid)
        .verifications.create({
          to: phone,
          channel: 'sms'
        })
      
      return { success: true, expiresAt }
    } catch (error) {
      console.error('Failed to send verification code:', error)
      return { success: false, expiresAt }
    }
  }

  async verifyCode(phone: string, code: string): Promise<{ success: boolean }> {
    try {
      const verification = await this.twilioClient.verify.v2
        .services(this.twilioVerifyServiceSid)
        .verificationChecks.create({ to: phone, code })

      if (verification.status !== 'approved') {
        return { success: false }
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to verify code:', error)
      return { success: false }
    }
  }

  async createUser(phone: string, displayName: string) {
    const [user] = await this.db.insert(users).values({
      phone: phone,
      displayName: displayName,
      isVerified: true,
    }).returning()

    if (!user) {
      throw new HTTPException(500, { message: "Failed to create user" })
    }
    
    return user
  }

  async generateJWT(userId: string): Promise<string> {
    const token = await sign(
        {
          id: userId,
          exp: Math.floor(
            (Date.now() + parseInt(this.jwtExpirationTime, 10)) / 1000
          ),
          iat: Math.floor(Date.now() / 1000),
        },
        this.jwtSecret
      );
    return token
  }

  async setCookie(c: Context, token: string) {
    const { NODE_ENV } = env(c)
    await setSignedCookie(c, 'token', token, this.jwtSecret, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    })
  }

  async findUserByPhone(phone: string) {
    const user = await this.db.select().from(users).where(eq(users.phone, phone)).limit(1)
    return user[0]
  }

  async findUserById(id: string) {
    const user = await this.db.select().from(users).where(eq(users.id, id)).limit(1)
    return user[0]
  }

  async updateUser(id: string, displayName: string) {
    const user = await this.db.update(users).set({ displayName: displayName }).where(eq(users.id, id)).returning()
    return user[0]
  }

  normalizePhoneNumber(phoneNumber: string): string | null {
    // Remove all non-digit characters except the leading +
    let normalized = phoneNumber.replace(/[^\d+]/g, '')
    
    // Handle Israeli phone numbers
    if (normalized.startsWith('0')) {
      // Convert local Israeli format (0XX-XXX-XXXX) to international (+972XX-XXX-XXXX)
      normalized = '+972' + normalized.substring(1)
    } else if (normalized.startsWith('972')) {
      // Add + if missing
      normalized = '+' + normalized
    } else if (!normalized.startsWith('+972')) {
      // Assume it's Israeli if no country code
      normalized = '+972' + normalized
    }
  
    const israelE164Regex = /^\+972[2-9]\d{7,8}$/
      
    return israelE164Regex.test(normalized) ? normalized : null
  }
}