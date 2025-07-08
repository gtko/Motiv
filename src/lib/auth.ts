import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, sessions } from '../db/schema';
import { eq } from 'drizzle-orm';
import type { AstroCookies } from 'astro';

const JWT_SECRET = import.meta.env.AUTH_SECRET || 'your-secret-key-here';
const SESSION_COOKIE_NAME = 'motiv-session';

export interface UserSession {
  userId: string;
  email: string;
  username: string;
  name: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create JWT token
export function createToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

// Create user session
export async function createSession(userId: string, cookies: AstroCookies): Promise<void> {
  const token = createToken(userId);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  // Save session to database
  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  // Set cookie
  cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Get current user from session
export async function getCurrentUser(cookies: AstroCookies): Promise<UserSession | null> {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  // Verify session exists in database
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session || session.expiresAt < new Date()) {
    // Session expired or doesn't exist
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return null;
  }

  // Get user data
  const [user] = await db
    .select({
      userId: users.id,
      email: users.email,
      username: users.username,
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, decoded.userId))
    .limit(1);

  if (!user) {
    cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
    return null;
  }

  return user;
}

// Logout user
export async function logout(cookies: AstroCookies): Promise<void> {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    // Delete session from database
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  
  // Delete cookie
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}

// Register new user
export async function register(
  email: string,
  username: string,
  password: string,
  name: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: 'Un utilisateur avec cet email existe déjà' };
    }

    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      return { success: false, error: 'Ce nom d\'utilisateur est déjà pris' };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        passwordHash,
        name,
      })
      .returning({ id: users.id });

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Erreur lors de l\'inscription' };
  }
}

// Login user
export async function login(
  emailOrUsername: string,
  password: string
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Find user by email or username
    const [user] = await db
      .select()
      .from(users)
      .where(
        emailOrUsername.includes('@')
          ? eq(users.email, emailOrUsername)
          : eq(users.username, emailOrUsername)
      )
      .limit(1);

    if (!user) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Email ou mot de passe incorrect' };
    }

    // Update last active
    await db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, user.id));

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Erreur lors de la connexion' };
  }
}