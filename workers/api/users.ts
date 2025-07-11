import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';
import { Env } from '../types';
import { getDb, schema } from '../lib/db';
import { authMiddleware } from '../middleware/auth';

const users = new Hono<{ Bindings: Env }>();

// Schema de validation pour mise à jour du profil
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  coverUrl: z.string().url().optional(),
});

// Récupérer le profil d'un utilisateur
users.get('/:username', async (c) => {
  try {
    const username = c.req.param('username');
    const db = getDb(c.env);

    const [user] = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        bio: schema.users.bio,
        avatarUrl: schema.users.avatarUrl,
        coverUrl: schema.users.coverUrl,
        points: schema.users.points,
        isVerified: schema.users.isVerified,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404);
    }

    // Récupérer les projets de l'utilisateur
    const projects = await db
      .select()
      .from(schema.projects)
      .where(
        sql`${schema.projects.userId} = ${user.id} AND ${schema.projects.status} = 'active'`
      )
      .orderBy(desc(schema.projects.createdAt));

    // Récupérer les badges
    const userBadges = await db
      .select({
        badge: schema.badges,
        earnedAt: schema.userBadges.earnedAt,
      })
      .from(schema.userBadges)
      .innerJoin(schema.badges, eq(schema.userBadges.badgeId, schema.badges.id))
      .where(eq(schema.userBadges.userId, user.id));

    // Calculer les statistiques
    const stats = {
      totalProjects: projects.length,
      totalViews: projects.reduce((sum, p) => sum + p.views, 0),
      totalLikes: projects.reduce((sum, p) => sum + p.likes, 0),
    };

    return c.json({
      user,
      projects: projects.map(p => ({
        ...p,
        techStack: p.techStack ? JSON.parse(p.techStack) : [],
      })),
      badges: userBadges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
      stats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return c.json({ error: 'Erreur lors de la récupération du profil' }, 500);
  }
});

// Mettre à jour son propre profil
users.put('/profile', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = updateProfileSchema.parse(body);
    const user = c.get('user');
    const db = getDb(c.env);

    const [updatedUser] = await db
      .update(schema.users)
      .set({
        ...validatedData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, user.id))
      .returning({
        id: schema.users.id,
        username: schema.users.username,
        email: schema.users.email,
        name: schema.users.name,
        bio: schema.users.bio,
        avatarUrl: schema.users.avatarUrl,
        coverUrl: schema.users.coverUrl,
        points: schema.users.points,
        isVerified: schema.users.isVerified,
      });

    return c.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    console.error('Erreur lors de la mise à jour du profil:', error);
    return c.json({ error: 'Erreur lors de la mise à jour du profil' }, 500);
  }
});

// Récupérer le leaderboard
users.get('/leaderboard', async (c) => {
  try {
    const { limit = '10' } = c.req.query();
    const db = getDb(c.env);

    const topUsers = await db
      .select({
        id: schema.users.id,
        username: schema.users.username,
        name: schema.users.name,
        avatarUrl: schema.users.avatarUrl,
        points: schema.users.points,
        projectCount: sql<number>`COUNT(DISTINCT ${schema.projects.id})`,
      })
      .from(schema.users)
      .leftJoin(
        schema.projects,
        sql`${schema.projects.userId} = ${schema.users.id} AND ${schema.projects.status} = 'active'`
      )
      .groupBy(schema.users.id)
      .orderBy(desc(schema.users.points))
      .limit(parseInt(limit));

    return c.json({ users: topUsers });
  } catch (error) {
    console.error('Erreur lors de la récupération du leaderboard:', error);
    return c.json({ error: 'Erreur lors de la récupération du leaderboard' }, 500);
  }
});

// Récupérer les badges d'un utilisateur
users.get('/:userId/badges', async (c) => {
  try {
    const userId = c.req.param('userId');
    const db = getDb(c.env);

    const userBadges = await db
      .select({
        badge: schema.badges,
        earnedAt: schema.userBadges.earnedAt,
      })
      .from(schema.userBadges)
      .innerJoin(schema.badges, eq(schema.userBadges.badgeId, schema.badges.id))
      .where(eq(schema.userBadges.userId, userId))
      .orderBy(desc(schema.userBadges.earnedAt));

    return c.json({
      badges: userBadges.map(ub => ({
        ...ub.badge,
        earnedAt: ub.earnedAt,
      })),
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des badges:', error);
    return c.json({ error: 'Erreur lors de la récupération des badges' }, 500);
  }
});

export default users;