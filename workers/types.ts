export interface Env {
  // D1 Database
  DB: D1Database;
  
  // KV Namespaces
  SESSIONS: KVNamespace;
  
  // R2 Buckets
  MEDIA: R2Bucket;
  
  // Environment variables
  AUTH_SECRET: string;
  FRONTEND_URL: string;
  ENVIRONMENT: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  isVerified: boolean;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}