import { db } from './db-client';
import { users, projects, badges, userBadges, comments, votes } from '../db/schema';
import { eq, desc, sql, and, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import type { User } from './auth-client';

// Utilitaires pour les requêtes côté client
export class ApiClient {
  
  // Authentification
  static async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    try {
      const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (user.length === 0) {
        throw new Error('Utilisateur non trouvé');
      }

      const isValidPassword = await bcrypt.compare(password, user[0].passwordHash);
      if (!isValidPassword) {
        throw new Error('Mot de passe incorrect');
      }

      // Générer un token simple (en production, utiliser JWT)
      const token = btoa(`${user[0].id}:${Date.now()}`);
      
      return {
        user: {
          id: user[0].id,
          email: user[0].email,
          username: user[0].username,
          name: user[0].name || undefined,
          bio: user[0].bio || undefined,
          location: user[0].location || undefined,
          website: user[0].website || undefined,
          github: user[0].github || undefined,
          twitter: user[0].twitter || undefined,
          linkedin: user[0].linkedin || undefined,
          totalPoints: user[0].totalPoints,
          monthlyPoints: user[0].monthlyPoints,
          projectCount: user[0].projectCount,
          createdAt: user[0].createdAt
        },
        token
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return null;
    }
  }

  static async register(userData: {
    email: string;
    username: string;
    password: string;
    name?: string;
  }): Promise<{ user: User; token: string } | null> {
    try {
      // Vérifier si l'email ou username existe déjà
      const existingUser = await db.select()
        .from(users)
        .where(or(eq(users.email, userData.email), eq(users.username, userData.username)))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error('Email ou nom d\'utilisateur déjà utilisé');
      }

      // Hasher le mot de passe
      const passwordHash = await bcrypt.hash(userData.password, 10);

      // Créer l'utilisateur
      const newUser = await db.insert(users).values({
        email: userData.email,
        username: userData.username,
        passwordHash,
        name: userData.name,
        totalPoints: 0,
        monthlyPoints: 0,
        projectCount: 0
      }).returning();

      const token = btoa(`${newUser[0].id}:${Date.now()}`);
      
      return {
        user: {
          id: newUser[0].id,
          email: newUser[0].email,
          username: newUser[0].username,
          name: newUser[0].name || undefined,
          bio: newUser[0].bio || undefined,
          location: newUser[0].location || undefined,
          website: newUser[0].website || undefined,
          github: newUser[0].github || undefined,
          twitter: newUser[0].twitter || undefined,
          linkedin: newUser[0].linkedin || undefined,
          totalPoints: newUser[0].totalPoints,
          monthlyPoints: newUser[0].monthlyPoints,
          projectCount: newUser[0].projectCount,
          createdAt: newUser[0].createdAt
        },
        token
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return null;
    }
  }

  // Utilisateurs
  static async getUser(username: string) {
    try {
      const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
      return user[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  static async getUserBadges(userId: string) {
    try {
      const userBadgesList = await db.select({
        badge: badges,
        earnedAt: userBadges.earnedAt
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));

      return userBadgesList;
    } catch (error) {
      console.error('Erreur lors de la récupération des badges:', error);
      return [];
    }
  }

  // Projets
  static async getProjects(filters?: {
    type?: string;
    status?: string;
    search?: string;
    userId?: string;
  }) {
    try {
      let query = db.select({
        project: projects,
        author: {
          username: users.username,
          name: users.name,
          totalPoints: users.totalPoints
        }
      })
      .from(projects)
      .innerJoin(users, eq(projects.userId, users.id));

      // Appliquer les filtres si fournis
      if (filters) {
        const conditions = [];
        
        if (filters.type) {
          conditions.push(eq(projects.type, filters.type));
        }
        
        if (filters.status) {
          conditions.push(eq(projects.status, filters.status));
        }
        
        if (filters.userId) {
          conditions.push(eq(projects.userId, filters.userId));
        }
        
        if (filters.search) {
          conditions.push(
            or(
              sql`${projects.title} ILIKE ${`%${filters.search}%`}`,
              sql`${projects.description} ILIKE ${`%${filters.search}%`}`
            )
          );
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions));
        }
      }

      return await query.orderBy(desc(projects.createdAt));
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return [];
    }
  }

  static async getProject(id: string) {
    try {
      const project = await db.select({
        project: projects,
        author: {
          id: users.id,
          username: users.username,
          name: users.name,
          totalPoints: users.totalPoints,
          github: users.github,
          twitter: users.twitter,
          linkedin: users.linkedin
        }
      })
      .from(projects)
      .innerJoin(users, eq(projects.userId, users.id))
      .where(eq(projects.id, id))
      .limit(1);

      return project[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du projet:', error);
      return null;
    }
  }

  // Leaderboard
  static async getLeaderboard(period: 'total' | 'monthly' = 'total') {
    try {
      const orderField = period === 'total' ? users.totalPoints : users.monthlyPoints;
      
      const leaders = await db.select({
        id: users.id,
        username: users.username,
        name: users.name,
        points: orderField,
        projectCount: users.projectCount,
        location: users.location
      })
      .from(users)
      .orderBy(desc(orderField))
      .limit(100);

      return leaders;
    } catch (error) {
      console.error('Erreur lors de la récupération du leaderboard:', error);
      return [];
    }
  }

  // Commentaires
  static async getProjectComments(projectId: string) {
    try {
      const projectComments = await db.select({
        comment: comments,
        author: {
          username: users.username,
          name: users.name
        }
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.projectId, projectId))
      .orderBy(desc(comments.createdAt));

      return projectComments;
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      return [];
    }
  }

  // Votes
  static async getUserVote(userId: string, projectId: string) {
    try {
      const vote = await db.select()
        .from(votes)
        .where(and(eq(votes.userId, userId), eq(votes.projectId, projectId)))
        .limit(1);

      return vote[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du vote:', error);
      return null;
    }
  }
}