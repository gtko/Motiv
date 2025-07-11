import { Context, Next } from 'hono';
import { Env } from '../types';

export async function corsMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const origin = c.req.header('Origin') || '';
  const allowedOrigins = [
    c.env.FRONTEND_URL,
    'http://localhost:4321',
    'http://localhost:8787',
    'http://localhost:8788',
  ];

  if (allowedOrigins.includes(origin) || c.env.ENVIRONMENT === 'development') {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Allow-Credentials', 'true');
  }

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  await next();
}