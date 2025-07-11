import { Context, Next } from 'hono';
import { Env, User } from '../types';
import { AuthService } from '../lib/auth';
import { getDb, schema } from '../lib/db';
import { eq } from 'drizzle-orm';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  const authService = new AuthService(c.env);
  
  const sessionId = authService.parseToken(token);
  if (!sessionId) {
    return c.json({ error: 'Invalid token' }, 401);
  }

  const session = await authService.getSession(sessionId);
  if (!session) {
    return c.json({ error: 'Session expired' }, 401);
  }

  // Get user from database
  const db = getDb(c.env);
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1);

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  // Add user to context
  c.set('user', user);
  c.set('sessionId', sessionId);

  await next();
}

export async function optionalAuthMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const authService = new AuthService(c.env);
    
    const sessionId = authService.parseToken(token);
    if (sessionId) {
      const session = await authService.getSession(sessionId);
      if (session) {
        const db = getDb(c.env);
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, session.userId))
          .limit(1);

        if (user) {
          c.set('user', user);
          c.set('sessionId', sessionId);
        }
      }
    }
  }

  await next();
}