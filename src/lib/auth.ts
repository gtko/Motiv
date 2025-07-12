import type { AstroCookies } from 'astro';

const SESSION_COOKIE_NAME = 'motiv-session';

// Logout user (côté client uniquement - la suppression de session se fait via l'API)
export async function logout(cookies: AstroCookies): Promise<void> {
  // Delete cookie
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}