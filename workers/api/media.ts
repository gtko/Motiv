import { Hono } from 'hono';
import { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const media = new Hono<{ Bindings: Env }>();

// Upload d'image
media.post('/upload', authMiddleware, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'Aucun fichier fourni' }, 400);
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Type de fichier non autorisé' }, 400);
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'Fichier trop volumineux (max 5MB)' }, 400);
    }

    const user = c.get('user');
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const key = `uploads/${user.id}/${timestamp}.${extension}`;

    // Upload vers R2
    await c.env.MEDIA.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Générer l'URL publique
    const url = `${c.env.FRONTEND_URL}/media/${key}`;

    return c.json({ url, key });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return c.json({ error: 'Erreur lors de l\'upload' }, 500);
  }
});

// Récupérer une image
media.get('/:key+', async (c) => {
  try {
    const key = c.req.param('key');
    
    // Récupérer depuis R2
    const object = await c.env.MEDIA.get(key);
    
    if (!object) {
      return c.json({ error: 'Fichier non trouvé' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000'); // Cache 1 an

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Erreur lors de la récupération:', error);
    return c.json({ error: 'Erreur lors de la récupération' }, 500);
  }
});

// Supprimer une image
media.delete('/:key+', authMiddleware, async (c) => {
  try {
    const key = c.req.param('key');
    const user = c.get('user');

    // Vérifier que l'utilisateur est propriétaire du fichier
    if (!key.includes(`uploads/${user.id}/`)) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    await c.env.MEDIA.delete(key);

    return c.json({ message: 'Fichier supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return c.json({ error: 'Erreur lors de la suppression' }, 500);
  }
});

export default media;