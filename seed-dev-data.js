// Script pour initialiser les données de développement
import { seedDatabase } from './src/lib/seed-users.ts';

seedDatabase().catch(console.error);