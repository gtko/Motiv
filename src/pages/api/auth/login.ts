import type { APIRoute } from 'astro';
import { ApiClientCF } from '../../../lib/api-client-cf';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return new Response(JSON.stringify({ error: 'Email/username et mot de passe requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call the Cloudflare Workers API
    const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787/api';
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailOrUsername, password })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Set the session cookie server-side
    if (data.token) {
      cookies.set('motiv-session', data.token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Erreur lors de la connexion' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};