import { Hono } from 'hono';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { Env, AuthResponse } from '../types';
import { AuthService } from '../lib/auth';
import { getDb, schema } from '../lib/db';
import { authMiddleware } from '../middleware/auth';

const auth = new Hono<{ Bindings: Env }>();

// Schemas de validation
const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Route d'inscription
auth.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, username, password, name } = registerSchema.parse(body);
    
    const db = getDb(c.env);
    const authService = new AuthService(c.env);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return c.json({ error: 'Un utilisateur avec cet email existe déjà' }, 400);
    }

    // Vérifier si le username existe
    const existingUsername = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      return c.json({ error: 'Ce nom d\'utilisateur est déjà pris' }, 400);
    }

    // Hasher le mot de passe
    const hashedPassword = await authService.hashPassword(password);

    // Créer l'utilisateur
    const [newUser] = await db
      .insert(schema.users)
      .values({
        email,
        username,
        password: hashedPassword,
        name: name || username,
      })
      .returning();

    // Créer une session
    const sessionId = await authService.createSession(newUser.id);
    const token = authService.generateToken(sessionId);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = newUser;

    const response: AuthResponse = {
      user: userWithoutPassword as any,
      token,
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    console.error('Erreur lors de l\'inscription:', error);
    return c.json({ error: 'Erreur lors de l\'inscription' }, 500);
  }
});

// Route de connexion
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = loginSchema.parse(body);
    
    const db = getDb(c.env);
    const authService = new AuthService(c.env);

    // Chercher l'utilisateur
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Vérifier le mot de passe
    const isValid = await authService.verifyPassword(password, user.password);
    if (!isValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401);
    }

    // Créer une session
    const sessionId = await authService.createSession(user.id);
    const token = authService.generateToken(sessionId);

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      user: userWithoutPassword as any,
      token,
    };

    return c.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    console.error('Erreur lors de la connexion:', error);
    return c.json({ error: 'Erreur lors de la connexion' }, 500);
  }
});

// Route de déconnexion
auth.post('/logout', authMiddleware, async (c) => {
  try {
    const sessionId = c.get('sessionId');
    const authService = new AuthService(c.env);
    
    await authService.deleteSession(sessionId);
    
    return c.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    return c.json({ error: 'Erreur lors de la déconnexion' }, 500);
  }
});

// Route pour récupérer l'utilisateur actuel
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  const { password: _, ...userWithoutPassword } = user;
  return c.json({ user: userWithoutPassword });
});

export default auth;