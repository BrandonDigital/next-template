import { getDb } from "../drizzle";
import {
  notificationSubscriptions,
  notificationPreferences,
  notificationHistory,
} from "../schema/notifications/push";
import { eq, and } from "drizzle-orm";

export class NotificationDAL {
  // Subscription management
  static async createSubscription(data: {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    vapidPublicKey: string;
  }) {
    try {
      const result = await getDb()
        .insert(notificationSubscriptions)
        .values({
          userId: data.userId,
          endpoint: data.endpoint,
          p256dh: data.p256dh,
          auth: data.auth,
          vapidPublicKey: data.vapidPublicKey,
        })
        .returning();

      console.log("Created notification subscription", {
        userId: data.userId,
        subscriptionId: result[0]?.id,
      });

      return result[0];
    } catch (error) {
      console.error("Error creating notification subscription", error, {
        userId: data.userId,
      });
      throw new Error("Failed to create notification subscription");
    }
  }

  static async getSubscriptionByUserId(userId: string) {
    try {
      const result = await getDb()
        .select()
        .from(notificationSubscriptions)
        .where(
          and(
            eq(notificationSubscriptions.userId, userId),
            eq(notificationSubscriptions.isActive, true)
          )
        )
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error getting notification subscription", error, {
        userId,
      });
      throw new Error("Failed to get notification subscription");
    }
  }

  static async updateSubscription(
    subscriptionId: string,
    data: Partial<{
      endpoint: string;
      p256dh: string;
      auth: string;
      isActive: boolean;
    }>
  ) {
    try {
      const result = await getDb()
        .update(notificationSubscriptions)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(notificationSubscriptions.id, subscriptionId))
        .returning();

      console.log("Updated notification subscription", {
        subscriptionId,
        updates: data,
      });

      return result[0];
    } catch (error) {
      console.error("Error updating notification subscription", error, {
        subscriptionId,
      });
      throw new Error("Failed to update notification subscription");
    }
  }

  static async deactivateSubscription(subscriptionId: string) {
    return this.updateSubscription(subscriptionId, { isActive: false });
  }

  // Preferences management
  static async createPreferences(userId: string) {
    try {
      const result = await getDb()
        .insert(notificationPreferences)
        .values({
          userId,
          // Use defaults from schema
        })
        .returning();

      console.log("Created notification preferences", { userId });
      return result[0];
    } catch (error) {
      console.error("Error creating notification preferences", error, {
        userId,
      });
      throw new Error("Failed to create notification preferences");
    }
  }

  static async getPreferences(userId: string) {
    try {
      const result = await getDb()
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error("Error getting notification preferences", error, {
        userId,
      });
      throw new Error("Failed to get notification preferences");
    }
  }

  static async updatePreferences(
    userId: string,
    data: Partial<{
      emailNotifications: boolean;
      pushNotifications: boolean;
      marketingNotifications: boolean;
      securityNotifications: boolean;
    }>
  ) {
    try {
      const result = await getDb()
        .update(notificationPreferences)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, userId))
        .returning();

      console.log("Updated notification preferences", {
        userId,
        updates: data,
      });

      return result[0];
    } catch (error) {
      console.error("Error updating notification preferences", error, {
        userId,
      });
      throw new Error("Failed to update notification preferences");
    }
  }

  // History management
  static async createNotificationHistory(data: {
    userId: string;
    title: string;
    body: string;
    type: string;
    status: string;
    metadata?: string;
  }) {
    try {
      const result = await getDb()
        .insert(notificationHistory)
        .values(data)
        .returning();

      console.log("Created notification history entry", {
        userId: data.userId,
        type: data.type,
        status: data.status,
      });

      return result[0];
    } catch (error) {
      console.error("Error creating notification history", error, {
        userId: data.userId,
      });
      throw new Error("Failed to create notification history");
    }
  }

  static async getNotificationHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ) {
    try {
      const result = await getDb()
        .select()
        .from(notificationHistory)
        .where(eq(notificationHistory.userId, userId))
        .orderBy(notificationHistory.createdAt)
        .limit(limit)
        .offset(offset);

      return result;
    } catch (error) {
      console.error("Error getting notification history", error, {
        userId,
      });
      throw new Error("Failed to get notification history");
    }
  }

  static async markNotificationAsRead(notificationId: string) {
    try {
      const result = await getDb()
        .update(notificationHistory)
        .set({
          status: "read",
          readAt: new Date(),
        })
        .where(eq(notificationHistory.id, notificationId))
        .returning();

      console.log("Marked notification as read", { notificationId });
      return result[0];
    } catch (error) {
      console.error("Error marking notification as read", error, {
        notificationId,
      });
      throw new Error("Failed to mark notification as read");
    }
  }
}
