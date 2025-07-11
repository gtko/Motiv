import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../../src/db/schema-d1';
import { Env } from '../types';

export function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

export { schema };