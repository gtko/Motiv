import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Env } from './types';
import { corsMiddleware } from './middleware/cors';
import authRoutes from './api/auth';
import projectRoutes from './api/projects';
import userRoutes from './api/users';
import mediaRoutes from './api/media';

const app = new Hono<{ Bindings: Env }>();

// Middleware global
app.use('*', logger());
app.use('*', corsMiddleware);

// Gestion explicite des requêtes OPTIONS pour toutes les routes
app.options('*', (c) => {
  const origin = c.req.header('Origin') || '';
  const isDevelopment = c.env.ENVIRONMENT === 'development' || !c.env.ENVIRONMENT;
  
  if (isDevelopment && origin.includes('localhost')) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    c.header('Access-Control-Allow-Credentials', 'true');
  }
  
  return new Response(null, { status: 204 });
});

// Routes API
app.route('/api/auth', authRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/users', userRoutes);
app.route('/api/media', mediaRoutes);

// Route de santé
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route racine
app.get('/', (c) => {
  return c.json({ 
    message: 'Motiv API - Cloudflare Workers',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      users: '/api/users',
      media: '/api/media',
      health: '/api/health'
    }
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route non trouvée' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ error: 'Erreur interne du serveur' }, 500);
});

export default app;