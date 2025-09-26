import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getDb } from "../drizzle";
import { users } from "../schema";
import {
  User,
  CreateUser,
  UpdateUser,
  CreateUserSchema,
  UpdateUserSchema,
} from "@/types/user";

export class UserDAL {
  /**
   * Find a user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();

    try {
      // TODO: Re-implement caching when CacheService is available
      // Check cache first
      // const cached = CacheService.getUserByEmail<User>(normalizedEmail);
      // if (cached) {
      //   return cached;
      // }

      // Query database
      const result = await getDb()
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

      const user = result[0] || null;

      // Cache the result (including null results to prevent repeated queries)
      if (user) {
        // 5 min cache
      }

      return user;
    } catch (error) {
      console.error("Error finding user by email", error, {
        email: normalizedEmail,
      });
      throw new Error("Database error occurred while finding user");
    }
  }

  /**
   * Find a user by ID
   */
  static async findById(id: string): Promise<User | null> {
    try {
      const result = await getDb()
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw new Error("Database error occurred while finding user");
    }
  }

  /**
   * Create a new user with hashed password
   */
  static async create(userData: CreateUser): Promise<User> {
    try {
      // Validate input data
      console.log("UserDAL.create received data:", userData);
      const validatedData = CreateUserSchema.parse(userData);
      console.log("UserDAL.create validated data:", validatedData);

      // Hash the password
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      // Create user in database
      const result = await getDb()
        .insert(users)
        .values({
          ...validatedData,
          email: validatedData.email.toLowerCase(),
          password: hashedPassword,
          firstName: validatedData.firstName || null,
          lastName: validatedData.lastName || null,
          profileImage: validatedData.profileImage || null,
          twoFactorSecret: validatedData.twoFactorSecret || null,
          twoFactorBackupCodes: validatedData.twoFactorBackupCodes || null,
        })
        .returning();

      if (!result[0]) {
        throw new Error("Failed to create user");
      }

      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof Error && error.message.includes("unique")) {
        throw new Error("User with this email already exists");
      }
      throw new Error("Database error occurred while creating user");
    }
  }

  /**
   * Update user information
   */
  static async update(id: string, userData: UpdateUser): Promise<User | null> {
    try {
      // Validate input data
      const validatedData = UpdateUserSchema.parse(userData);

      // If password is being updated, hash it
      const updateData = { ...validatedData };
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 12);
      }

      // If email is being updated, normalize it
      if (updateData.email) {
        updateData.email = updateData.email.toLowerCase();
      }

      const result = await getDb()
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

      const updatedUser = result[0] || null;

      // Invalidate cache for this user
      if (updatedUser) {
        // Cache the updated user

        if (updatedUser.email) {
        }
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof Error && error.message.includes("unique")) {
        throw new Error("Email is already taken by another user");
      }
      throw new Error("Database error occurred while updating user");
    }
  }

  /**
   * Delete a user and all related data
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const result = await getDb()
        .delete(users)
        .where(eq(users.id, id))
        .returning({ id: users.id });

      return result.length > 0;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Database error occurred while deleting user");
    }
  }

  /**
   * List all users (admin function)
   */
  static async list(limit: number = 50, offset: number = 0): Promise<User[]> {
    try {
      const result = await getDb()
        .select()
        .from(users)
        .limit(limit)
        .offset(offset)
        .orderBy(users.createdAt);

      return result;
    } catch (error) {
      console.error("Error listing users:", error);
      throw new Error("Database error occurred while listing users");
    }
  }

  /**
   * Verify user password
   */
  static async verifyPassword(
    email: string,
    password: string
  ): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error verifying password:", error);
      throw new Error("Database error occurred while verifying password");
    }
  }

  /**
   * Update email verification status
   */
  static async verifyEmail(userId: string): Promise<boolean> {
    try {
      const result = await getDb()
        .update(users)
        .set({
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({ id: users.id });

      return result.length > 0;
    } catch (error) {
      console.error("Error verifying email:", error);
      throw new Error("Database error occurred while verifying email");
    }
  }

  /**
   * Enable/disable 2FA for user
   */
  static async update2FA(
    userId: string,
    enabled: boolean,
    secret?: string,
    backupCodes?: string[]
  ): Promise<boolean> {
    try {
      const result = await getDb()
        .update(users)
        .set({
          twoFactorEnabled: enabled,
          twoFactorSecret: secret || null,
          twoFactorBackupCodes: backupCodes || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning({ id: users.id });

      return result.length > 0;
    } catch (error) {
      console.error("Error updating 2FA:", error);
      throw new Error("Database error occurred while updating 2FA");
    }
  }

  /**
   * Get user count (for admin dashboard)
   */
  static async getUserCount(): Promise<number> {
    try {
      const result = await getDb().select({ count: users.id }).from(users);

      return result.length;
    } catch (error) {
      console.error("Error getting user count:", error);
      return 0;
    }
  }

  /**
   * Get recent users (for admin dashboard)
   */
  static async getRecentUsers(limit: number = 10): Promise<User[]> {
    try {
      const result = await getDb()
        .select()
        .from(users)
        .orderBy(users.createdAt)
        .limit(limit);

      return result;
    } catch (error) {
      console.error("Error getting recent users:", error);
      return [];
    }
  }
}
