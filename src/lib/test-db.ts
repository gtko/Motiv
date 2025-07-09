import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, projects, badges } from '../db/schema';
import bcrypt from 'bcryptjs';

// Utiliser directement la variable d'environnement
const sql = neon(process.env.DATABASE_URL || process.env.PUBLIC_DATABASE_URL || 'postgresql://placeholder');
const db = drizzle(sql);

// Fonction pour tester la connexion et créer des utilisateurs
export async function testConnection() {
  try {
    console.log('🔍 Test de connexion à la base de données...');
    
    // Test simple
    const testUser = await db.select().from(users).limit(1);
    console.log('✅ Connexion réussie !');
    
    // Créer un utilisateur de test s'il n'existe pas
    const marie = await db.select().from(users).where(users.username === 'marie_dubois').limit(1);
    
    if (marie.length === 0) {
      const passwordHash = await bcrypt.hash('password123', 10);
      
      await db.insert(users).values({
        username: 'marie_dubois',
        email: 'marie@example.com',
        name: 'Marie Dubois',
        bio: 'Développeuse passionnée par la création d\'applications innovantes. Spécialisée en React, Node.js et IA.',
        location: 'Paris, France',
        website: 'https://mariedubois.dev',
        github: 'mariedubois',
        twitter: 'marie_dev',
        linkedin: 'mariedubois',
        passwordHash,
        totalPoints: 12850,
        monthlyPoints: 2340,
        projectCount: 15
      });
      
      console.log('✅ Utilisateur marie_dubois créé !');
    } else {
      console.log('ℹ️ Utilisateur marie_dubois existe déjà');
    }
    
    // Lister tous les utilisateurs
    const allUsers = await db.select().from(users);
    console.log(`📊 Nombre d'utilisateurs : ${allUsers.length}`);
    
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.name}) - ${user.totalPoints} pts`);
    });
    
  } catch (error) {
    console.error('❌ Erreur :', error);
  }
}

testConnection();