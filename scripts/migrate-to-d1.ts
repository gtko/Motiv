import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/db/schema';
import { generateId } from '../src/db/schema-d1';

config();

// Fonction helper pour échapper les valeurs SQL
function escapeSqlValue(value: any): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }
  if (value instanceof Date) {
    return `'${value.toISOString()}'`;
  }
  return String(value);
}

// Script de migration des données de PostgreSQL vers D1
async function migrate() {
  console.log('🚀 Début de la migration vers Cloudflare D1...\n');

  // Connexion à la base PostgreSQL source
  const sql = neon(process.env.DATABASE_URL!);
  const pgDb = drizzle(sql);

  try {
    // 1. Exporter les utilisateurs
    console.log('📤 Export des utilisateurs...');
    const users = await pgDb.select().from(schema.users);
    console.log(`   ✓ ${users.length} utilisateurs trouvés`);

    // 2. Exporter les projets
    console.log('📤 Export des projets...');
    const projects = await pgDb.select().from(schema.projects);
    console.log(`   ✓ ${projects.length} projets trouvés`);

    // 3. Exporter les badges
    console.log('📤 Export des badges...');
    const badges = await pgDb.select().from(schema.badges);
    console.log(`   ✓ ${badges.length} badges trouvés`);

    // 4. Exporter les user_badges
    console.log('📤 Export des badges utilisateurs...');
    const userBadges = await pgDb.select().from(schema.userBadges);
    console.log(`   ✓ ${userBadges.length} attributions de badges trouvées`);

    // 5. Exporter les votes
    console.log('📤 Export des votes...');
    const votes = await pgDb.select().from(schema.votes);
    console.log(`   ✓ ${votes.length} votes trouvés`);

    // 6. Exporter les commentaires
    console.log('📤 Export des commentaires...');
    const comments = await pgDb.select().from(schema.comments);
    console.log(`   ✓ ${comments.length} commentaires trouvés`);

    // 7. Exporter l'historique des points
    console.log('📤 Export de l\'historique des points...');
    const pointsHistory = await pgDb.select().from(schema.pointsHistory);
    console.log(`   ✓ ${pointsHistory.length} entrées d\'historique trouvées`);

    // Créer le fichier SQL pour l'import dans D1
    console.log('\n📝 Génération du fichier SQL pour D1...');
    
    let sqlContent = '-- Migration des données vers Cloudflare D1\n\n';

    // Users
    sqlContent += '-- Users\n';
    for (const user of users) {
      // Si pas de mot de passe, en générer un par défaut (hash de "password123")
      const defaultPasswordHash = '$2a$10$XQb8kl8w8N.OB8z7Kyz8C.kxklH5VD4OqfYmmbt1XhU3EfWvPEFGy';
      
      const values = [
        escapeSqlValue(user.id),
        escapeSqlValue(user.email),
        escapeSqlValue(user.username),
        user.password ? escapeSqlValue(user.password) : escapeSqlValue(defaultPasswordHash),
        escapeSqlValue(user.name),
        escapeSqlValue(user.bio),
        escapeSqlValue(user.avatarUrl),
        escapeSqlValue(user.coverUrl),
        escapeSqlValue(user.isVerified),
        escapeSqlValue(user.points),
        escapeSqlValue(user.createdAt),
        escapeSqlValue(user.updatedAt)
      ].join(', ');
      
      sqlContent += `INSERT INTO users (id, email, username, password, name, bio, avatar_url, cover_url, is_verified, points, created_at, updated_at) VALUES (${values});\n`;
    }

    // Projects
    sqlContent += '\n-- Projects\n';
    for (const project of projects) {
      const techStack = project.techStack ? JSON.stringify(project.techStack) : null;
      const values = [
        escapeSqlValue(project.id),
        escapeSqlValue(project.userId),
        escapeSqlValue(project.title),
        escapeSqlValue(project.description),
        escapeSqlValue(project.content),
        escapeSqlValue(project.category),
        escapeSqlValue(project.difficulty),
        escapeSqlValue(techStack),
        escapeSqlValue(project.demoUrl),
        escapeSqlValue(project.githubUrl),
        escapeSqlValue(project.imageUrl),
        escapeSqlValue(project.status),
        escapeSqlValue(project.views),
        escapeSqlValue(project.likes),
        escapeSqlValue(project.isFeatured),
        escapeSqlValue(project.createdAt),
        escapeSqlValue(project.updatedAt)
      ].join(', ');
      
      sqlContent += `INSERT INTO projects (id, user_id, title, description, content, category, difficulty, tech_stack, demo_url, github_url, image_url, status, views, likes, is_featured, created_at, updated_at) VALUES (${values});\n`;
    }

    // Badges
    sqlContent += '\n-- Badges\n';
    for (const badge of badges) {
      const criteria = badge.criteria ? JSON.stringify(badge.criteria) : null;
      const values = [
        escapeSqlValue(badge.id),
        escapeSqlValue(badge.name),
        escapeSqlValue(badge.description),
        escapeSqlValue(badge.iconUrl),
        escapeSqlValue(badge.category),
        escapeSqlValue(badge.pointsRequired),
        escapeSqlValue(criteria),
        escapeSqlValue(badge.createdAt)
      ].join(', ');
      
      sqlContent += `INSERT INTO badges (id, name, description, icon_url, category, points_required, criteria, created_at) VALUES (${values});\n`;
    }

    // User Badges
    sqlContent += '\n-- User Badges\n';
    for (const ub of userBadges) {
      const values = [
        escapeSqlValue(ub.id),
        escapeSqlValue(ub.userId),
        escapeSqlValue(ub.badgeId),
        escapeSqlValue(ub.earnedAt)
      ].join(', ');
      
      sqlContent += `INSERT INTO user_badges (id, user_id, badge_id, earned_at) VALUES (${values});\n`;
    }

    // Votes
    sqlContent += '\n-- Votes\n';
    for (const vote of votes) {
      const values = [
        escapeSqlValue(vote.id),
        escapeSqlValue(vote.projectId),
        escapeSqlValue(vote.userId),
        escapeSqlValue(vote.voteType),
        escapeSqlValue(vote.createdAt)
      ].join(', ');
      
      sqlContent += `INSERT INTO votes (id, project_id, user_id, vote_type, created_at) VALUES (${values});\n`;
    }

    // Comments
    sqlContent += '\n-- Comments\n';
    for (const comment of comments) {
      const values = [
        escapeSqlValue(comment.id),
        escapeSqlValue(comment.projectId),
        escapeSqlValue(comment.userId),
        escapeSqlValue(comment.content),
        escapeSqlValue(comment.createdAt),
        escapeSqlValue(comment.updatedAt)
      ].join(', ');
      
      sqlContent += `INSERT INTO comments (id, project_id, user_id, content, created_at, updated_at) VALUES (${values});\n`;
    }

    // Points History
    sqlContent += '\n-- Points History\n';
    for (const ph of pointsHistory) {
      const values = [
        escapeSqlValue(ph.id),
        escapeSqlValue(ph.userId),
        escapeSqlValue(ph.points),
        escapeSqlValue(ph.reason),
        escapeSqlValue(ph.referenceId),
        escapeSqlValue(ph.referenceType),
        escapeSqlValue(ph.createdAt)
      ].join(', ');
      
      sqlContent += `INSERT INTO points_history (id, user_id, points, reason, reference_id, reference_type, created_at) VALUES (${values});\n`;
    }

    // Sauvegarder le fichier
    const fs = await import('fs/promises');
    await fs.writeFile('./migration-data.sql', sqlContent);
    
    console.log('\n✅ Migration terminée avec succès!');
    console.log('📄 Fichier de migration créé: migration-data.sql');
    console.log('\n🔧 Prochaines étapes:');
    console.log('1. Créer la base D1: wrangler d1 create motiv-db');
    console.log('2. Exécuter le schéma: wrangler d1 execute motiv-db --file=./src/db/schema-d1.sql');
    console.log('3. Importer les données: wrangler d1 execute motiv-db --file=./migration-data.sql');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrate();