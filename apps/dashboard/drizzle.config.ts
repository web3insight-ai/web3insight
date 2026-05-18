import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

const databaseUrl = process.env.COPILOT_DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "COPILOT_DATABASE_URL is required. Add it to apps/dashboard/.env.local before running drizzle-kit.",
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema/copilot.ts",
  out: "./drizzle",
  schemaFilter: ["api"],
  introspect: { casing: "preserve" },
  dbCredentials: { url: databaseUrl },
});
