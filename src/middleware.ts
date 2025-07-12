import { defineMiddleware } from 'astro:middleware';
import { getCurrentUser } from './lib/auth';

export const onRequest = defineMiddleware(async ({ locals, request, cookies, redirect }, next) => {
  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = ['/dashboard', '/projects/new', '/settings'];
  
  const url = new URL(request.url);
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const user = await getCurrentUser(cookies);
    
    if (!user) {
      // Rediriger vers la page de connexion si non authentifié
      return redirect('/login');
    }
    
    // Stocker l'utilisateur dans locals pour un accès facile dans les pages
    locals.user = user;
  }
  
  // Continuer avec la requête
  return next();
});