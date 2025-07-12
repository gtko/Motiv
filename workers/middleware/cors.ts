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

  // En développement, on accepte toutes les origines localhost
  const isDevelopment = c.env.ENVIRONMENT === 'development' || !c.env.ENVIRONMENT;
  const isAllowedOrigin = allowedOrigins.includes(origin) || (isDevelopment && origin.includes('localhost'));

  // Toujours définir les headers CORS en développement
  if (isAllowedOrigin || isDevelopment) {
    c.header('Access-Control-Allow-Origin', origin || 'http://localhost:4321');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Allow-Credentials', 'true');
  }

  // Répondre immédiatement aux requêtes OPTIONS
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
}