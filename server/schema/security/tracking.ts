import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";

// Login attempts for security tracking
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    ipAddress: text("ip_address").notNull(),
    userAgent: text("user_agent"),
    success: boolean("success").notNull(),
    failureReason: text("failure_reason"), // 'invalid_credentials', 'account_locked', 'rate_limited', etc.
    attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("login_attempts_email_idx").on(table.email),
    ipAddressIdx: index("login_attempts_ip_address_idx").on(table.ipAddress),
    attemptedAtIdx: index("login_attempts_attempted_at_idx").on(
      table.attemptedAt
    ),
    successIdx: index("login_attempts_success_idx").on(table.success),
    emailIpIdx: index("login_attempts_email_ip_idx").on(
      table.email,
      table.ipAddress
    ),
    successAttemptedIdx: index("login_attempts_success_attempted_idx").on(
      table.success,
      table.attemptedAt
    ),
    emailSuccessIdx: index("login_attempts_email_success_idx").on(
      table.email,
      table.success
    ),
  })
);

// Rate limiting tracking
export const rateLimits = pgTable(
  "rate_limits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(), // IP address or email
    type: text("type").notNull(), // 'login', 'signup', 'password_reset', etc.
    attempts: integer("attempts").default(1).notNull(),
    firstAttemptAt: timestamp("first_attempt_at").defaultNow().notNull(),
    lastAttemptAt: timestamp("last_attempt_at").defaultNow().notNull(),
    blockedUntil: timestamp("blocked_until"),
  },
  (table) => ({
    identifierTypeIdx: index("rate_limits_identifier_type_idx").on(
      table.identifier,
      table.type
    ),
    blockedUntilIdx: index("rate_limits_blocked_until_idx").on(
      table.blockedUntil
    ),
  })
);
