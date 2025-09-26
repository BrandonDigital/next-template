import { eq, and, lt, gt } from "drizzle-orm";
import { getDb } from "../drizzle";
import { verificationCodes } from "../schema";
// Use Node.js crypto for server-side random code generation
import { randomInt } from "crypto";
import { VerificationCode } from "@/types/verification";

const getRandomCode = (): string => {
  // Generate a secure 6-digit code
  return randomInt(100000, 999999).toString();
};

export type VerificationCodeType =
  | "email_verification"
  | "password_reset"
  | "2fa_setup";

export interface CreateVerificationCode {
  userId: string;
  email: string;
  type: VerificationCodeType;
  expiresInMinutes?: number;
}

export class VerificationDAL {
  /**
   * Create a new verification code
   */
  static async create({
    userId,
    email,
    type,
    expiresInMinutes = 15,
  }: CreateVerificationCode): Promise<string> {
    try {
      // Generate a 6-digit code
      const code = getRandomCode();

      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

      // Insert the verification code
      await getDb().insert(verificationCodes).values({
        userId,
        email: email.toLowerCase(),
        code,
        type,
        expiresAt,
      });

      return code;
    } catch (error) {
      console.error("Error creating verification code:", error);
      throw new Error(
        "Database error occurred while creating verification code"
      );
    }
  }

  /**
   * Verify a code and mark it as used
   */
  static async verify(
    email: string,
    code: string,
    type: VerificationCodeType
  ): Promise<{ success: boolean; userId?: string }> {
    try {
      // Find valid, unused, non-expired code
      const result = await getDb()
        .select()
        .from(verificationCodes)
        .where(
          and(
            eq(verificationCodes.email, email.toLowerCase()),
            eq(verificationCodes.code, code),
            eq(verificationCodes.type, type),
            eq(verificationCodes.used, false),
            gt(verificationCodes.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!result[0]) {
        return { success: false };
      }

      // Mark the code as used
      await getDb()
        .update(verificationCodes)
        .set({ used: true })
        .where(eq(verificationCodes.id, result[0].id));

      return {
        success: true,
        userId: result[0].userId,
      };
    } catch (error) {
      console.error("Error verifying code:", error);
      throw new Error("Database error occurred while verifying code");
    }
  }

  /**
   * Clean up expired codes
   */
  static async cleanupExpired(): Promise<number> {
    try {
      const result = await getDb()
        .delete(verificationCodes)
        .where(lt(verificationCodes.expiresAt, new Date()))
        .returning({ id: verificationCodes.id });

      return result.length;
    } catch (error) {
      console.error("Error cleaning up expired codes:", error);
      return 0;
    }
  }

  /**
   * Invalidate all codes for a user and type
   */
  static async invalidateUserCodes(
    userId: string,
    type: VerificationCodeType
  ): Promise<boolean> {
    try {
      await getDb()
        .update(verificationCodes)
        .set({ used: true })
        .where(
          and(
            eq(verificationCodes.userId, userId),
            eq(verificationCodes.type, type),
            eq(verificationCodes.used, false)
          )
        );

      return true;
    } catch (error) {
      console.error("Error invalidating user codes:", error);
      return false;
    }
  }

  /**
   * Get recent codes for admin monitoring
   */
  static async getRecentCodes(limit: number = 50): Promise<VerificationCode[]> {
    try {
      const result = await getDb()
        .select({
          id: verificationCodes.id,
          email: verificationCodes.email,
          type: verificationCodes.type,
          used: verificationCodes.used,
          expiresAt: verificationCodes.expiresAt,
          createdAt: verificationCodes.createdAt,
        })
        .from(verificationCodes)
        .orderBy(verificationCodes.createdAt)
        .limit(limit);

      return result as VerificationCode[];
    } catch (error) {
      console.error("Error getting recent codes:", error);
      return [];
    }
  }
}
