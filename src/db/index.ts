import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Configuration for Neon serverless HTTP driver
const getDatabaseUrl = () => {
  // In production, use PUBLIC_DATABASE_URL for client-side access
  if (typeof window !== 'undefined') {
    return import.meta.env.PUBLIC_DATABASE_URL;
  }
  
  // Build time - try multiple sources
  const buildTimeUrl = import.meta.env.DATABASE_URL || 
                      import.meta.env.PUBLIC_DATABASE_URL ||
                      process.env.DATABASE_URL ||
                      process.env.PUBLIC_DATABASE_URL;
  
  // If still no URL, use a valid placeholder that won't cause neon() to throw
  return buildTimeUrl || 'postgresql://build:placeholder@build-time/placeholder?sslmode=require';
};

const databaseUrl = getDatabaseUrl();

// Only warn in browser context when URL is not properly configured
if (typeof window !== 'undefined' && (!databaseUrl || databaseUrl.includes('placeholder'))) {
  console.warn('PUBLIC_DATABASE_URL not configured - database queries will fail');
}

// Create Neon HTTP client - optimal for serverless environments
// At build time, this might use placeholder URL but won't be used for actual queries
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });