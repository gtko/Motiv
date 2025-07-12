import type { AstroCookies } from 'astro';

const SESSION_COOKIE_NAME = 'motiv-session';

export interface UserSession {
  userId: string;
  email: string;
  username: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  isVerified?: boolean;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Get current user from session
export async function getCurrentUser(cookies: AstroCookies): Promise<UserSession | null> {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }

  try {
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787/api';
    
    const response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json() as { user: User };

    if (data?.user) {
      const user = data.user;
      return {
        userId: user.id,
        email: user.email,
        username: user.username,
        name: user.name || user.username
      };
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }

  return null;
}

// Logout user (côté client uniquement - la suppression de session se fait via l'API)
export async function logout(cookies: AstroCookies): Promise<void> {
  // Delete cookie
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}