import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });
config({ path: '.env' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is required. Add it to apps/api/.env.local before running drizzle-kit.',
  );
}

// `drizzle-kit pull` writes the introspected schema to ./drizzle/.
// Review the diff against src/db/schema/*.ts and hand-port changes in.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/*.ts',
  out: './drizzle',
  schemaFilter: ['api', 'data'],
  introspect: { casing: 'preserve' },
  dbCredentials: { url: databaseUrl },
});
