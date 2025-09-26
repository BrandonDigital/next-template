import { z } from "zod";

// Verification code types
export type VerificationCodeType =
  | "email_verification"
  | "password_reset"
  | "2fa_setup";

// Verification code schema for validation
export const VerificationCodeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  email: z.string().email(),
  code: z.string(),
  type: z.enum(["email_verification", "password_reset", "2fa_setup"]),
  expiresAt: z.date(),
  used: z.boolean().default(false),
  createdAt: z.date(),
});

// Create verification code schema
export const CreateVerificationCodeSchema = VerificationCodeSchema.omit({
  id: true,
  used: true,
  createdAt: true,
}).extend({
  expiresInMinutes: z.number().min(1).max(60).default(15),
});

// Verify code schema
export const VerifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum(["email_verification", "password_reset", "2fa_setup"]),
});

// Inferred types from schemas
export type VerificationCode = z.infer<typeof VerificationCodeSchema>;
export type CreateVerificationCode = z.infer<
  typeof CreateVerificationCodeSchema
>;
export type VerifyCode = z.infer<typeof VerifyCodeSchema>;

// Verification result type
export interface VerificationResult {
  success: boolean;
  userId?: string;
  message?: string;
}

// Cleanup result type
export interface CleanupResult {
  deletedCount: number;
}
