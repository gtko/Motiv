# Migration Cloudflare - Guide Complet

## 🚀 Architecture Cloudflare

Le projet Motiv a été migré vers une architecture 100% Cloudflare :

- **Cloudflare Pages** : Hébergement du site statique Astro
- **Cloudflare Workers** : API et logique serveur
- **Cloudflare D1** : Base de données SQLite (remplace PostgreSQL)
- **Cloudflare KV** : Stockage des sessions
- **Cloudflare R2** : Stockage des médias et images
- **Wrangler** : CLI pour gérer l'infrastructure

## 📁 Structure du Projet

```
motiv/
├── src/                    # Code source Astro
│   ├── components/         # Composants React
│   ├── layouts/           # Layouts Astro
│   ├── pages/             # Pages Astro
│   ├── lib/               # Bibliothèques
│   │   └── api-client-cf.ts  # Client API pour Workers
│   └── db/
│       ├── schema-d1.ts   # Schéma Drizzle pour D1
│       └── schema-d1.sql  # Schéma SQL pour D1
├── workers/               # Cloudflare Workers
│   ├── api/              # Routes API
│   │   ├── auth.ts       # Authentification
│   │   ├── projects.ts   # Gestion des projets
│   │   ├── users.ts      # Gestion des utilisateurs
│   │   └── media.ts      # Upload de médias
│   ├── lib/              # Utilitaires
│   ├── middleware/       # Middleware
│   └── index.ts          # Point d'entrée Workers
├── functions/            # Pages Functions
│   └── api/[[route]].ts  # Proxy vers Workers
└── wrangler.toml         # Configuration Cloudflare
```

## 🛠️ Installation et Configuration

### 1. Prérequis

```bash
# Installer les dépendances
npm install

# Se connecter à Cloudflare
npx wrangler login
```

### 2. Créer les ressources Cloudflare

```bash
# Créer la base de données D1
npm run d1:create

# Noter l'ID de la base de données et le mettre dans wrangler.toml
```

### 3. Créer les namespaces KV et buckets R2

```bash
# Créer le namespace KV pour les sessions
npx wrangler kv:namespace create SESSIONS

# Créer le bucket R2 pour les médias
npx wrangler r2 bucket create motiv-media
```

### 4. Configurer wrangler.toml

Mettre à jour les IDs dans `wrangler.toml` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "motiv-db"
database_id = "VOTRE_ID_D1"

[[kv_namespaces]]
binding = "SESSIONS"
id = "VOTRE_ID_KV"
```

### 5. Initialiser la base de données

```bash
# Créer les tables
npm run d1:schema

# Pour importer des données existantes, créez un fichier SQL et exécutez :
# npx wrangler d1 execute motiv-db --file=./your-data.sql --remote
```

## 🚀 Développement

### Lancer en local

```bash
# Terminal 1 : Lancer l'API Workers
npm run workers:dev

# Terminal 2 : Lancer le site Astro
npm run dev
```

### Variables d'environnement

Créer un fichier `.env` :

```env
PUBLIC_API_URL=http://localhost:8787/api
AUTH_SECRET=votre-secret-auth
```

## 📦 Déploiement

### 1. Déployer les Workers

```bash
npm run workers:deploy
```

### 2. Déployer sur Cloudflare Pages

```bash
npm run pages:deploy
```

### 3. Configuration Pages

Dans le dashboard Cloudflare Pages :

1. Aller dans Settings > Environment variables
2. Ajouter `PUBLIC_API_URL` avec l'URL de vos Workers
3. Configurer le domaine personnalisé si nécessaire

## 🔧 Scripts Utiles

```bash
# Développement
npm run dev              # Lancer Astro
npm run workers:dev      # Lancer Workers en local

# Base de données
npm run d1:create        # Créer la base D1
npm run d1:schema        # Créer les tables
npm run migrate-to-d1    # Générer le fichier de migration
npm run d1:migrate       # Importer les données

# Déploiement
npm run build            # Build Astro
npm run workers:deploy   # Déployer Workers
npm run pages:deploy     # Déployer sur Pages
```

## 🔐 Sécurité

1. **Sessions** : Stockées dans KV avec expiration automatique
2. **Authentification** : Token simple basé sur sessionId
3. **CORS** : Configuré pour accepter uniquement les origines autorisées
4. **Validation** : Utilisation de Zod pour valider toutes les entrées

## 🎯 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur actuel

### Projets
- `GET /api/projects` - Liste des projets
- `GET /api/projects/:id` - Détails d'un projet
- `POST /api/projects` - Créer un projet
- `PUT /api/projects/:id` - Modifier un projet
- `DELETE /api/projects/:id` - Supprimer un projet
- `POST /api/projects/:id/vote` - Voter pour un projet

### Utilisateurs
- `GET /api/users/:username` - Profil utilisateur
- `PUT /api/users/profile` - Modifier son profil
- `GET /api/users/leaderboard` - Classement
- `GET /api/users/:id/badges` - Badges d'un utilisateur

### Médias
- `POST /api/media/upload` - Upload d'image
- `GET /api/media/:key` - Récupérer une image
- `DELETE /api/media/:key` - Supprimer une image

## 📊 Monitoring

Utiliser le dashboard Cloudflare pour :
- Analytics des Workers
- Logs en temps réel
- Métriques de performance
- Utilisation de D1, KV et R2

## 🚨 Dépannage

### Erreur "D1_ERROR"
- Vérifier que la base est créée : `npx wrangler d1 list`
- Vérifier l'ID dans wrangler.toml

### Erreur CORS
- Vérifier PUBLIC_API_URL dans .env
- Vérifier les origines autorisées dans cors.ts

### Session expirée
- Les sessions durent 7 jours
- Vérifier dans KV : `npx wrangler kv:key list --namespace-id=VOTRE_ID`

## 🔄 Migration depuis l'ancienne architecture

1. Importer les données dans D1 (si vous avez un fichier SQL) : `npm run d1:migrate`
2. Mettre à jour les imports dans les composants :
   - Remplacer `api-client.ts` par `api-client-cf.ts`
3. Tester toutes les fonctionnalités

## 📈 Optimisations Futures

- [ ] Implémenter le cache edge pour les données statiques
- [ ] Optimiser les images avec Cloudflare Images
- [ ] Ajouter des Analytics custom
- [ ] Implémenter des Durable Objects pour le temps réel
- [ ] Ajouter des Workers Analytics