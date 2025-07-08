import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Configuration for Neon serverless HTTP driver
const getDatabaseUrl = () => {
  // In production, use PUBLIC_DATABASE_URL for client-side access
  if (typeof window !== 'undefined') {
    return import.meta.env.PUBLIC_DATABASE_URL;
  }
  
  // Build time fallback - use placeholder to prevent build errors
  return import.meta.env.DATABASE_URL || 'postgresql://user:pass@placeholder/dbname';
};

const databaseUrl = getDatabaseUrl();

// Only warn in browser context when URL is not properly configured
if (typeof window !== 'undefined' && (!databaseUrl || databaseUrl.includes('placeholder'))) {
  console.warn('PUBLIC_DATABASE_URL not configured - database queries will fail');
}

// Create Neon HTTP client - optimal for serverless environments
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });