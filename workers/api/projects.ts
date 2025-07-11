import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { Env } from '../types';
import { getDb, schema } from '../lib/db';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const projects = new Hono<{ Bindings: Env }>();

// Schemas de validation
const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  techStack: z.array(z.string()).optional(),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

// Récupérer tous les projets
projects.get('/', optionalAuthMiddleware, async (c) => {
  try {
    const { category, search, limit = '20', offset = '0' } = c.req.query();
    
    const db = getDb(c.env);
    let query = db
      .select({
        project: schema.projects,
        user: {
          id: schema.users.id,
          username: schema.users.username,
          name: schema.users.name,
          avatarUrl: schema.users.avatarUrl,
        },
      })
      .from(schema.projects)
      .innerJoin(schema.users, eq(schema.projects.userId, schema.users.id))
      .where(eq(schema.projects.status, 'active'))
      .orderBy(desc(schema.projects.createdAt))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Filtrer par catégorie si spécifiée
    if (category) {
      query = query.where(
        and(
          eq(schema.projects.status, 'active'),
          eq(schema.projects.category, category)
        )
      );
    }

    // Recherche si spécifiée
    if (search) {
      query = query.where(
        and(
          eq(schema.projects.status, 'active'),
          or(
            like(schema.projects.title, `%${search}%`),
            like(schema.projects.description, `%${search}%`)
          )
        )
      );
    }

    const results = await query;

    // Formater les résultats
    const formattedProjects = results.map(({ project, user }) => ({
      ...project,
      techStack: project.techStack ? JSON.parse(project.techStack) : [],
      user,
    }));

    return c.json({ projects: formattedProjects });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    return c.json({ error: 'Erreur lors de la récupération des projets' }, 500);
  }
});

// Récupérer un projet par ID
projects.get('/:id', optionalAuthMiddleware, async (c) => {
  try {
    const projectId = c.req.param('id');
    const db = getDb(c.env);

    const [result] = await db
      .select({
        project: schema.projects,
        user: {
          id: schema.users.id,
          username: schema.users.username,
          name: schema.users.name,
          avatarUrl: schema.users.avatarUrl,
        },
      })
      .from(schema.projects)
      .innerJoin(schema.users, eq(schema.projects.userId, schema.users.id))
      .where(eq(schema.projects.id, projectId))
      .limit(1);

    if (!result) {
      return c.json({ error: 'Projet non trouvé' }, 404);
    }

    // Incrémenter les vues
    await db
      .update(schema.projects)
      .set({ views: result.project.views + 1 })
      .where(eq(schema.projects.id, projectId));

    // Formater le projet
    const formattedProject = {
      ...result.project,
      techStack: result.project.techStack ? JSON.parse(result.project.techStack) : [],
      user: result.user,
    };

    return c.json({ project: formattedProject });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    return c.json({ error: 'Erreur lors de la récupération du projet' }, 500);
  }
});

// Créer un nouveau projet
projects.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createProjectSchema.parse(body);
    const user = c.get('user');
    const db = getDb(c.env);

    const [newProject] = await db
      .insert(schema.projects)
      .values({
        ...validatedData,
        userId: user.id,
        techStack: validatedData.techStack ? JSON.stringify(validatedData.techStack) : null,
      })
      .returning();

    // Ajouter des points pour la création de projet
    await db
      .update(schema.users)
      .set({ points: user.points + 50 })
      .where(eq(schema.users.id, user.id));

    // Enregistrer dans l'historique des points
    await db.insert(schema.pointsHistory).values({
      userId: user.id,
      points: 50,
      reason: 'Création de projet',
      referenceId: newProject.id,
      referenceType: 'project',
    });

    return c.json({ project: newProject }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    console.error('Erreur lors de la création du projet:', error);
    return c.json({ error: 'Erreur lors de la création du projet' }, 500);
  }
});

// Mettre à jour un projet
projects.put('/:id', authMiddleware, async (c) => {
  try {
    const projectId = c.req.param('id');
    const body = await c.req.json();
    const validatedData = updateProjectSchema.parse(body);
    const user = c.get('user');
    const db = getDb(c.env);

    // Vérifier que l'utilisateur est le propriétaire
    const [existingProject] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .limit(1);

    if (!existingProject) {
      return c.json({ error: 'Projet non trouvé' }, 404);
    }

    if (existingProject.userId !== user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    // Mettre à jour le projet
    const updateData: any = {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    if (validatedData.techStack) {
      updateData.techStack = JSON.stringify(validatedData.techStack);
    }

    const [updatedProject] = await db
      .update(schema.projects)
      .set(updateData)
      .where(eq(schema.projects.id, projectId))
      .returning();

    return c.json({ project: updatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Données invalides', details: error.errors }, 400);
    }
    console.error('Erreur lors de la mise à jour du projet:', error);
    return c.json({ error: 'Erreur lors de la mise à jour du projet' }, 500);
  }
});

// Supprimer un projet
projects.delete('/:id', authMiddleware, async (c) => {
  try {
    const projectId = c.req.param('id');
    const user = c.get('user');
    const db = getDb(c.env);

    // Vérifier que l'utilisateur est le propriétaire
    const [existingProject] = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .limit(1);

    if (!existingProject) {
      return c.json({ error: 'Projet non trouvé' }, 404);
    }

    if (existingProject.userId !== user.id) {
      return c.json({ error: 'Non autorisé' }, 403);
    }

    // Marquer comme supprimé au lieu de supprimer physiquement
    await db
      .update(schema.projects)
      .set({ status: 'deleted' })
      .where(eq(schema.projects.id, projectId));

    return c.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    return c.json({ error: 'Erreur lors de la suppression du projet' }, 500);
  }
});

// Voter pour un projet
projects.post('/:id/vote', authMiddleware, async (c) => {
  try {
    const projectId = c.req.param('id');
    const { voteType } = await c.req.json();
    const user = c.get('user');
    const db = getDb(c.env);

    if (!['up', 'down'].includes(voteType)) {
      return c.json({ error: 'Type de vote invalide' }, 400);
    }

    // Vérifier si l'utilisateur a déjà voté
    const [existingVote] = await db
      .select()
      .from(schema.votes)
      .where(
        and(
          eq(schema.votes.projectId, projectId),
          eq(schema.votes.userId, user.id)
        )
      )
      .limit(1);

    if (existingVote) {
      // Mettre à jour le vote existant
      await db
        .update(schema.votes)
        .set({ voteType })
        .where(eq(schema.votes.id, existingVote.id));
    } else {
      // Créer un nouveau vote
      await db.insert(schema.votes).values({
        projectId,
        userId: user.id,
        voteType,
      });
    }

    // Recalculer les likes du projet
    const upVotes = await db
      .select()
      .from(schema.votes)
      .where(
        and(
          eq(schema.votes.projectId, projectId),
          eq(schema.votes.voteType, 'up')
        )
      );

    await db
      .update(schema.projects)
      .set({ likes: upVotes.length })
      .where(eq(schema.projects.id, projectId));

    return c.json({ message: 'Vote enregistré' });
  } catch (error) {
    console.error('Erreur lors du vote:', error);
    return c.json({ error: 'Erreur lors du vote' }, 500);
  }
});

export default projects;