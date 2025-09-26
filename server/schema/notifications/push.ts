import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { users } from "../auth/users";

// Notification subscriptions table
export const notificationSubscriptions = pgTable(
  "notification_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    vapidPublicKey: text("vapid_public_key").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notification_subscriptions_user_id_idx").on(table.userId),
    endpointIdx: index("notification_subscriptions_endpoint_idx").on(
      table.endpoint
    ),
    activeIdx: index("notification_subscriptions_active_idx").on(
      table.isActive
    ),
  })
);

// Notification preferences table
export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    pushNotifications: boolean("push_notifications").default(true).notNull(),
    marketingNotifications: boolean("marketing_notifications")
      .default(false)
      .notNull(),
    securityNotifications: boolean("security_notifications")
      .default(true)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notification_preferences_user_id_idx").on(table.userId),
  })
);

// Notification history table
export const notificationHistory = pgTable(
  "notification_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    type: text("type").notNull(), // 'push', 'email', 'in_app'
    status: text("status").notNull(), // 'sent', 'delivered', 'failed', 'read'
    metadata: text("metadata"), // JSON string for additional data
    createdAt: timestamp("created_at").defaultNow().notNull(),
    readAt: timestamp("read_at"),
  },
  (table) => ({
    userIdIdx: index("notification_history_user_id_idx").on(table.userId),
    typeIdx: index("notification_history_type_idx").on(table.type),
    statusIdx: index("notification_history_status_idx").on(table.status),
    createdAtIdx: index("notification_history_created_at_idx").on(
      table.createdAt
    ),
  })
);
