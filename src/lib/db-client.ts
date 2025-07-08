import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';

// Configuration pour le client-side avec Neon serverless
const getDatabaseUrl = () => {
  // En mode développement, utiliser import.meta.env
  if (typeof window !== 'undefined') {
    // Côté client - utiliser une variable d'environnement publique
    return import.meta.env.PUBLIC_DATABASE_URL;
  }
  // Fallback pour le build-time
  return import.meta.env.DATABASE_URL;
};

const sql = neon(getDatabaseUrl()!);
export const db = drizzle(sql, { schema });

// Types exportés pour utilisation
export * from '../db/schema';