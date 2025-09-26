import { eq, and, gte, desc, count, lt, isNotNull } from "drizzle-orm";
import { getDb } from "../drizzle";
import { loginAttempts, rateLimits } from "../schema";

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
}

export interface RateLimitCheck {
  allowed: boolean;
  attempts: number;
  resetTime?: Date;
  message?: string;
}

export class SecurityDAL {
  /**
   * Record a login attempt
   */
  static async recordLoginAttempt(attempt: LoginAttempt): Promise<void> {
    try {
      await getDb().insert(loginAttempts).values({
        email: attempt.email.toLowerCase(),
        ipAddress: attempt.ipAddress,
        userAgent: attempt.userAgent as string,
        success: attempt.success,
        failureReason: attempt.failureReason,
      });
    } catch (error) {
      console.error("Error recording login attempt:", error);
      // Don't throw error to avoid breaking the login flow
    }
  }

  /**
   * Check rate limit for identifier (IP or email)
   */
  static async checkRateLimit(
    identifier: string,
    type: string,
    maxAttempts: number = 5,
    windowMinutes: number = 15
  ): Promise<RateLimitCheck> {
    try {
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - windowMinutes);

      // Get current rate limit record
      const existing = await getDb()
        .select()
        .from(rateLimits)
        .where(
          and(eq(rateLimits.identifier, identifier), eq(rateLimits.type, type))
        )
        .limit(1);

      if (!existing[0]) {
        // No existing record, allow and create new one
        await getDb().insert(rateLimits).values({
          identifier,
          type,
          attempts: 1,
        });
        return { allowed: true, attempts: 1 };
      }

      const record = existing[0];

      // Check if blocked
      if (record.blockedUntil && record.blockedUntil > new Date()) {
        return {
          allowed: false,
          attempts: record.attempts,
          resetTime: record.blockedUntil,
          message: `Too many attempts. Try again after ${record.blockedUntil.toLocaleTimeString()}`,
        };
      }

      // Check if window has reset
      if (record.firstAttemptAt < windowStart) {
        // Reset the window
        await getDb()
          .update(rateLimits)
          .set({
            attempts: 1,
            firstAttemptAt: new Date(),
            lastAttemptAt: new Date(),
            blockedUntil: null,
          })
          .where(eq(rateLimits.id, record.id));

        return { allowed: true, attempts: 1 };
      }

      // Increment attempts
      const newAttempts = record.attempts + 1;
      const updateData: { attempts: number; lastAttemptAt: Date; blockedUntil?: Date } = {
        attempts: newAttempts,
        lastAttemptAt: new Date()
      };

      // Check if should be blocked
      if (newAttempts >= maxAttempts) {
        const blockUntil = new Date();
        blockUntil.setMinutes(blockUntil.getMinutes() + windowMinutes * 2); // Double the window for blocking
        updateData.blockedUntil = blockUntil as Date;
      }

      await getDb()
        .update(rateLimits)
        .set(updateData)
        .where(eq(rateLimits.id, record.id));

      if (newAttempts >= maxAttempts) {
        return {
          allowed: false,
          attempts: newAttempts,
          resetTime: updateData.blockedUntil as Date,
          message: `Too many attempts. Try again after ${updateData.blockedUntil?.toLocaleTimeString()}`,
        };
      }

      return {
        allowed: true,
        attempts: newAttempts,
      };
    } catch (error) {
      console.error("Error checking rate limit:", error);
      // On error, allow the request but log it
      return { allowed: true, attempts: 0 };
    }
  }

  /**
   * Reset rate limit for successful login
   */
  static async resetRateLimit(identifier: string, type: string): Promise<void> {
    try {
      await getDb()
        .delete(rateLimits)
        .where(
          and(eq(rateLimits.identifier, identifier), eq(rateLimits.type, type))
        );
    } catch (error) {
      console.error("Error resetting rate limit:", error);
    }
  }

  /**
   * Get failed login attempts for monitoring
   */
  static async getFailedAttempts(
    hours: number = 24,
    limit: number = 100
  ): Promise<LoginAttempt[]> {
    try {
      const since = new Date();
      since.setHours(since.getHours() - hours);

      const result = await getDb()
        .select()
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.success, false),
            gte(loginAttempts.attemptedAt, since)
          )
        )
        .orderBy(desc(loginAttempts.attemptedAt))
        .limit(limit);

      return result as LoginAttempt[];
    } catch (error) {
      console.error("Error getting failed attempts:", error);
      return [];
    }
  }

  /**
   * Get security statistics for admin dashboard
   */
  static async getSecurityStats(hours: number = 24): Promise<{
    totalAttempts: number;
    failedAttempts: number;
    successfulAttempts: number;
    uniqueIPs: number;
    blockedIPs: number;
  }> {
    try {
      const since = new Date();
      since.setHours(since.getHours() - hours);

      // Get total attempts
      const totalResult = await getDb()
        .select({ count: count() })
        .from(loginAttempts)
        .where(gte(loginAttempts.attemptedAt, since));

      // Get failed attempts
      const failedResult = await getDb()
        .select({ count: count() })
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.success, false),
            gte(loginAttempts.attemptedAt, since)
          )
        );

      // Get successful attempts
      const successResult = await getDb()
        .select({ count: count() })
        .from(loginAttempts)
        .where(
          and(
            eq(loginAttempts.success, true),
            gte(loginAttempts.attemptedAt, since)
          )
        );

      // Get blocked IPs
      const blockedResult = await getDb()
        .select({ count: count() })
        .from(rateLimits)
        .where(
          and(
            eq(rateLimits.type, "login"),
            gte(rateLimits.blockedUntil, new Date())
          )
        );

      return {
        totalAttempts: totalResult[0]?.count || 0,
        failedAttempts: failedResult[0]?.count || 0,
        successfulAttempts: successResult[0]?.count || 0,
        uniqueIPs: 0, // TODO: Implement unique IP count
        blockedIPs: blockedResult[0]?.count || 0,
      };
    } catch (error) {
      console.error("Error getting security stats:", error);
      return {
        totalAttempts: 0,
        failedAttempts: 0,
        successfulAttempts: 0,
        uniqueIPs: 0,
        blockedIPs: 0,
      };
    }
  }

  /**
   * Clean up old login attempts
   */
  static async cleanupOldAttempts(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await getDb()
        .delete(loginAttempts)
        .where(lt(loginAttempts.attemptedAt, cutoffDate))
        .returning({ id: loginAttempts.id });

      return result.length;
    } catch (error) {
      console.error("Error cleaning up old attempts:", error);
      return 0;
    }
  }

  /**
   * Clean up expired rate limits
   */
  static async cleanupExpiredRateLimits(): Promise<number> {
    try {
      const result = await getDb()
        .delete(rateLimits)
        .where(
          and(
            isNotNull(rateLimits.blockedUntil),
            lt(rateLimits.blockedUntil, new Date())
          )
        )
        .returning({ id: rateLimits.id });

      return result.length;
    } catch (error) {
      console.error("Error cleaning up expired rate limits:", error);
      return 0;
    }
  }
}
