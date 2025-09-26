import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    password: text("password").notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    profileImage: text("profile_image"),

    // 2FA fields
    twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
    twoFactorSecret: text("two_factor_secret"),
    twoFactorBackupCodes: jsonb("two_factor_backup_codes").$type<string[]>(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    emailVerifiedIdx: index("users_email_verified_idx").on(table.emailVerified),
    twoFactorEnabledIdx: index("users_2fa_enabled_idx").on(
      table.twoFactorEnabled
    ),
    createdAtIdx: index("users_created_at_idx").on(table.createdAt),
    emailVerifiedCreatedIdx: index("users_email_verified_created_idx").on(
      table.emailVerified,
      table.createdAt
    ),
  })
);

// User sessions for NextAuth
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    sessionToken: text("session_token").notNull().unique(),
    accessToken: text("access_token"),
    expires: timestamp("expires").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    sessionTokenIdx: index("sessions_session_token_idx").on(table.sessionToken),
    expiresIdx: index("sessions_expires_idx").on(table.expires),
  })
);

// Account linking for OAuth providers
export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    type: text("type").notNull(), // 'oauth', 'email', etc.
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    tokenType: text("token_type"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("accounts_user_id_idx").on(table.userId),
    providerIdx: index("accounts_provider_idx").on(
      table.provider,
      table.providerAccountId
    ),
  })
);

// Email verification codes
export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    email: text("email").notNull(),
    code: text("code").notNull(),
    type: text("type").notNull(), // 'email_verification', 'password_reset', '2fa_setup'
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("verification_codes_user_id_idx").on(table.userId),
    emailIdx: index("verification_codes_email_idx").on(table.email),
    codeIdx: index("verification_codes_code_idx").on(table.code),
    typeIdx: index("verification_codes_type_idx").on(table.type),
    expiresAtIdx: index("verification_codes_expires_at_idx").on(
      table.expiresAt
    ),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  verificationCodes: many(verificationCodes),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const verificationCodesRelations = relations(
  verificationCodes,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationCodes.userId],
      references: [users.id],
    }),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
