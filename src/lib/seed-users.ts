import { db } from './db-client';
import { users, projects, badges, userBadges } from '../db/schema';
import bcrypt from 'bcryptjs';

// Fonction pour créer des utilisateurs de test
export async function seedUsers() {
  const testUsers = [
    {
      username: 'marie_dubois',
      email: 'marie@example.com',
      name: 'Marie Dubois',
      bio: 'Développeuse passionnée par la création d\'applications innovantes. Spécialisée en React, Node.js et IA.',
      location: 'Paris, France',
      website: 'https://mariedubois.dev',
      github: 'mariedubois',
      twitter: 'marie_dev',
      linkedin: 'mariedubois',
      totalPoints: 12850,
      monthlyPoints: 2340,
      projectCount: 15
    },
    {
      username: 'lucas_dev',
      email: 'lucas@example.com',
      name: 'Lucas Moreau',
      bio: 'Full-stack developer avec une passion pour les technologies web modernes et l\'open source.',
      location: 'Lyon, France',
      github: 'lucasmoreau',
      twitter: 'lucas_dev',
      totalPoints: 8750,
      monthlyPoints: 1890,
      projectCount: 12
    },
    {
      username: 'emma_r',
      email: 'emma@example.com',
      name: 'Emma Rousseau',
      bio: 'UI/UX Designer et développeuse frontend. J\'aime créer des interfaces utilisateur intuitives et modernes.',
      location: 'Marseille, France',
      website: 'https://emma-rousseau.com',
      linkedin: 'emma-rousseau',
      totalPoints: 6420,
      monthlyPoints: 1560,
      projectCount: 8
    },
    {
      username: 'antoine_tech',
      email: 'antoine@example.com',
      name: 'Antoine Lefebvre',
      bio: 'DevOps Engineer et passionné de cloud computing. Toujours à la recherche de nouvelles technologies.',
      location: 'Toulouse, France',
      github: 'antoine-tech',
      totalPoints: 9340,
      monthlyPoints: 2100,
      projectCount: 10
    }
  ];

  for (const userData of testUsers) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await db.select().from(users).where(users.username === userData.username).limit(1);
      
      if (existingUser.length === 0) {
        const passwordHash = await bcrypt.hash('password123', 10);
        
        await db.insert(users).values({
          ...userData,
          passwordHash
        });
        
        console.log(`✓ Utilisateur ${userData.username} créé`);
      } else {
        console.log(`- Utilisateur ${userData.username} existe déjà`);
      }
    } catch (error) {
      console.error(`Erreur lors de la création de ${userData.username}:`, error);
    }
  }
}

// Fonction pour créer des projets de test
export async function seedProjects() {
  const testProjects = [
    {
      title: 'TaskFlow Pro',
      description: 'Application SaaS de gestion de tâches avec IA intégrée pour optimiser la productivité des équipes',
      type: 'saas',
      status: 'live',
      totalPoints: 850,
      githubStars: 45,
      uniqueVisitors: 1230,
      uptime: 99.9,
      liveUrl: 'https://taskflow.example.com',
      githubUrl: 'https://github.com/example/taskflow',
      tags: ['React', 'Node.js', 'AI', 'SaaS'],
      username: 'marie_dubois'
    },
    {
      title: 'CodeSnippet Manager',
      description: 'Outil de gestion et partage de snippets de code avec synchronisation multi-plateforme',
      type: 'tool',
      status: 'live',
      totalPoints: 720,
      githubStars: 89,
      uniqueVisitors: 456,
      uptime: 100,
      liveUrl: 'https://snippets.example.com',
      githubUrl: 'https://github.com/example/snippets',
      tags: ['Vue.js', 'Firebase', 'PWA'],
      username: 'lucas_dev'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Tableau de bord temps réel pour visualiser les métriques business avec des graphiques interactifs',
      type: 'saas',
      status: 'live',
      totalPoints: 680,
      githubStars: 67,
      uniqueVisitors: 890,
      uptime: 99.5,
      liveUrl: 'https://analytics.example.com',
      githubUrl: 'https://github.com/example/analytics',
      tags: ['Next.js', 'D3.js', 'PostgreSQL'],
      username: 'emma_r'
    }
  ];

  for (const projectData of testProjects) {
    try {
      // Trouver l'utilisateur
      const user = await db.select().from(users).where(users.username === projectData.username).limit(1);
      
      if (user.length > 0) {
        // Vérifier si le projet existe déjà
        const existingProject = await db.select().from(projects).where(projects.title === projectData.title).limit(1);
        
        if (existingProject.length === 0) {
          const { username, ...projectWithoutUsername } = projectData;
          
          await db.insert(projects).values({
            ...projectWithoutUsername,
            userId: user[0].id
          });
          
          console.log(`✓ Projet ${projectData.title} créé`);
        } else {
          console.log(`- Projet ${projectData.title} existe déjà`);
        }
      }
    } catch (error) {
      console.error(`Erreur lors de la création du projet ${projectData.title}:`, error);
    }
  }
}

// Fonction pour créer des badges de test
export async function seedBadges() {
  const testBadges = [
    {
      name: 'Early Adopter',
      description: 'Parmi les premiers utilisateurs de la plateforme',
      icon: '🌟',
      rarity: 'epic',
      points: 500
    },
    {
      name: 'Project Master',
      description: 'A publié plus de 10 projets',
      icon: '🏆',
      rarity: 'legendary',
      points: 1000
    },
    {
      name: 'Speed Demon',
      description: 'A terminé un projet en moins de 24h',
      icon: '⚡',
      rarity: 'rare',
      points: 250
    },
    {
      name: 'Perfect Score',
      description: 'A obtenu un score parfait sur un projet',
      icon: '🎯',
      rarity: 'epic',
      points: 750
    }
  ];

  for (const badgeData of testBadges) {
    try {
      // Vérifier si le badge existe déjà
      const existingBadge = await db.select().from(badges).where(badges.name === badgeData.name).limit(1);
      
      if (existingBadge.length === 0) {
        await db.insert(badges).values(badgeData);
        console.log(`✓ Badge ${badgeData.name} créé`);
      } else {
        console.log(`- Badge ${badgeData.name} existe déjà`);
      }
    } catch (error) {
      console.error(`Erreur lors de la création du badge ${badgeData.name}:`, error);
    }
  }
}

// Fonction principale pour initialiser les données de test
export async function seedDatabase() {
  console.log('🌱 Initialisation des données de test...\n');
  
  await seedUsers();
  await seedProjects();
  await seedBadges();
  
  console.log('\n✅ Données de test initialisées avec succès !');
}