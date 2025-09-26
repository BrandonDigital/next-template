import { z } from "zod";

// User schema for validation
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  password: z.string().min(6),
  emailVerified: z.boolean().default(false),
  profileImage: z.string().nullable(),
  // 2FA fields
  twoFactorEnabled: z.boolean().default(false),
  twoFactorSecret: z.string().nullable(),
  twoFactorBackupCodes: z.array(z.string()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImage: z.string().nullable().optional(),
  twoFactorSecret: z.string().nullable().optional(),
  twoFactorBackupCodes: z.array(z.string()).nullable().optional(),
});

export const UpdateUserSchema = UserSchema.partial().omit({ id: true });

// Inferred types from schemas
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;

// Profile update schema for server actions
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
});
