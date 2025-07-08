import { db } from '../src/db/index-node';
import { users, projects, badges, userBadges } from '../src/db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Démarrage du seeding...');

  try {
    // Créer quelques badges
    console.log('Création des badges...');
    const badgeData = [
      {
        name: 'Early Adopter',
        description: 'Parmi les premiers utilisateurs de Motiv',
        icon: '🌟',
        category: 'special',
        rarity: 'epic',
        pointsRequired: 0,
      },
      {
        name: 'Project Master',
        description: 'A publié 5 projets ou plus',
        icon: '🏆',
        category: 'projects',
        rarity: 'legendary',
        pointsRequired: 500,
      },
      {
        name: 'Speed Demon',
        description: 'A publié un projet en moins de 24h',
        icon: '⚡',
        category: 'projects',
        rarity: 'rare',
        pointsRequired: 100,
      },
      {
        name: 'Perfect Score',
        description: 'A obtenu 100% d\'upvotes sur un projet',
        icon: '🎯',
        category: 'projects',
        rarity: 'epic',
        pointsRequired: 200,
      },
      {
        name: 'Fire Streak',
        description: '7 jours d\'activité consécutive',
        icon: '🔥',
        category: 'daily',
        rarity: 'rare',
        pointsRequired: 50,
      }
    ];

    const createdBadges = await db.insert(badges).values(badgeData).returning();
    console.log(`✅ ${createdBadges.length} badges créés`);

    // Créer des utilisateurs de démonstration
    console.log('Création des utilisateurs...');
    const userData = [
      {
        email: 'marie@example.com',
        username: 'marie_dubois',
        passwordHash: await bcrypt.hash('motiv2025', 10),
        name: 'Marie Dubois',
        bio: 'Développeuse passionnée par la création d\'applications innovantes. Spécialisée en React, Node.js et IA.',
        location: 'Paris, France',
        website: 'https://mariedubois.dev',
        github: 'mariedubois',
        twitter: 'marie_dev',
        totalPoints: 12850,
        monthlyPoints: 2340,
        projectCount: 15,
      },
      {
        email: 'jean@example.com',
        username: 'jean_martin',
        passwordHash: await bcrypt.hash('motiv2025', 10),
        name: 'Jean Martin',
        bio: 'Expert en backend et architecture cloud. Passionné par les performances et la scalabilité.',
        location: 'Lyon, France',
        github: 'jeanmartin',
        totalPoints: 11340,
        monthlyPoints: 1890,
        projectCount: 12,
      },
      {
        email: 'sophie@example.com',
        username: 'sophie_bernard',
        passwordHash: await bcrypt.hash('motiv2025', 10),
        name: 'Sophie Bernard',
        bio: 'UI/UX Designer avec une passion pour les interfaces innovantes et l\'accessibilité.',
        location: 'Bordeaux, France',
        linkedin: 'sophiebernard',
        totalPoints: 10890,
        monthlyPoints: 3210,
        projectCount: 14,
      }
    ];

    const createdUsers = await db.insert(users).values(userData).returning();
    console.log(`✅ ${createdUsers.length} utilisateurs créés`);

    // Attribuer des badges aux utilisateurs
    console.log('Attribution des badges...');
    const userBadgeData = [
      { userId: createdUsers[0].id, badgeId: createdBadges[0].id }, // Marie - Early Adopter
      { userId: createdUsers[0].id, badgeId: createdBadges[1].id }, // Marie - Project Master
      { userId: createdUsers[0].id, badgeId: createdBadges[2].id }, // Marie - Speed Demon
      { userId: createdUsers[1].id, badgeId: createdBadges[0].id }, // Jean - Early Adopter
      { userId: createdUsers[1].id, badgeId: createdBadges[4].id }, // Jean - Fire Streak
      { userId: createdUsers[2].id, badgeId: createdBadges[0].id }, // Sophie - Early Adopter
      { userId: createdUsers[2].id, badgeId: createdBadges[3].id }, // Sophie - Perfect Score
    ];

    await db.insert(userBadges).values(userBadgeData);
    console.log(`✅ ${userBadgeData.length} badges attribués`);

    // Créer quelques projets
    console.log('Création des projets...');
    const projectData = [
      {
        userId: createdUsers[0].id,
        title: 'TaskFlow Pro',
        description: 'Application SaaS de gestion de tâches avec IA intégrée pour optimiser la productivité des équipes',
        type: 'saas',
        status: 'live',
        githubUrl: 'https://github.com/example/taskflow',
        liveUrl: 'https://taskflow.example.com',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Redis', 'TensorFlow'],
        tags: ['SaaS', 'Productivité', 'IA', 'Gestion de projet'],
        totalPoints: 850,
        githubStars: 45,
        uniqueVisitors: 1230,
        upvotes: 128,
        downvotes: 3,
        viewCount: 2456,
      },
      {
        userId: createdUsers[1].id,
        title: 'CodeSnippet Manager',
        description: 'Outil de gestion et partage de snippets de code avec synchronisation multi-plateforme',
        type: 'tool',
        status: 'live',
        githubUrl: 'https://github.com/example/snippets',
        liveUrl: 'https://snippets.example.com',
        technologies: ['Vue.js', 'Firebase', 'PWA'],
        tags: ['Développement', 'Outils', 'PWA'],
        totalPoints: 720,
        githubStars: 89,
        uniqueVisitors: 456,
        upvotes: 95,
        downvotes: 2,
        viewCount: 1834,
      },
      {
        userId: createdUsers[2].id,
        title: 'Design System Kit',
        description: 'Bibliothèque de composants UI réutilisables avec thèmes personnalisables',
        type: 'opensource',
        status: 'live',
        githubUrl: 'https://github.com/example/design-kit',
        liveUrl: 'https://designkit.example.com',
        technologies: ['React', 'Storybook', 'TypeScript', 'Tailwind CSS'],
        tags: ['Design System', 'UI/UX', 'Open Source'],
        totalPoints: 890,
        githubStars: 234,
        uniqueVisitors: 4560,
        upvotes: 156,
        downvotes: 1,
        viewCount: 8921,
      }
    ];

    const createdProjects = await db.insert(projects).values(projectData).returning();
    console.log(`✅ ${createdProjects.length} projets créés`);

    console.log('🎉 Seeding terminé avec succès !');
    console.log('\nComptes de test créés :');
    console.log('- marie@example.com / motiv2025');
    console.log('- jean@example.com / motiv2025');
    console.log('- sophie@example.com / motiv2025');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    process.exit(1);
  }
}

seed();