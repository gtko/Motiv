import * as bcrypt from 'bcryptjs';
import { Env, Session } from '../types';

export class AuthService {
  constructor(private env: Env) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createSession(userId: string): Promise<string> {
    const sessionId = crypto.randomUUID();
    const session: Session = {
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
    };

    await this.env.SESSIONS.put(
      `session:${sessionId}`,
      JSON.stringify(session),
      {
        expirationTtl: 7 * 24 * 60 * 60, // 7 days in seconds
      }
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const sessionData = await this.env.SESSIONS.get(`session:${sessionId}`);
    if (!sessionData) return null;

    const session: Session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (session.expiresAt < Date.now()) {
      await this.deleteSession(sessionId);
      return null;
    }

    return session;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.env.SESSIONS.delete(`session:${sessionId}`);
  }

  generateToken(sessionId: string): string {
    // Simple token format: base64(sessionId:timestamp)
    const token = btoa(`${sessionId}:${Date.now()}`);
    return token;
  }

  parseToken(token: string): string | null {
    try {
      const decoded = atob(token);
      const [sessionId] = decoded.split(':');
      return sessionId;
    } catch {
      return null;
    }
  }
}