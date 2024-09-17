import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: isProduction
      ? process.env.PRODUCTION_DATABASE_URL!
      : process.env.LOCAL_DATABASE_URL!,
  },
});
