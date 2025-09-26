import type { Config } from "drizzle-kit";
import { config } from "dotenv";

// Load environment variables from .env.local at the root
config({ path: ".env.local" });

export default {
  schema: "./server/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
