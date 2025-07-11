// Drizzle config for Cloudflare D1
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema-d1.ts',
  out: './drizzle',
  driver: 'd1',
  dbCredentials: {
    wranglerConfigPath: './wrangler.toml',
    dbName: 'motiv-db',
  },
} satisfies Config;