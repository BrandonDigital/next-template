import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema";

// Database connection configuration
let db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!db) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please add your Neon database URL to your .env.local file."
      );
    }

    // Environment-specific database configuration
    const dbConfig = {
      development: {
        max: 5,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false, // Disable in development for compatibility
      },
      production: {
        max: parseInt(process.env.DB_POOL_SIZE || "100"),
        idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || "60"),
        connect_timeout: 10,
        prepare: true, // Enable prepared statements for performance
        ssl: { rejectUnauthorized: false },
        transform: {
          undefined: null, // Handle undefined values properly
        },
      },
    };

    const config =
      dbConfig[process.env.NODE_ENV as keyof typeof dbConfig] ||
      dbConfig.development;

    // Create postgres client with optimized configuration
    const client = postgres(connectionString, config);

    // Create drizzle database instance
    db = drizzle(client, { schema });
  }

  return db;
}

export { getDb };

// Export schema for use in other files
export { schema };

// Export types
export type Database = typeof db;
