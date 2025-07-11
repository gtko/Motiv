# Configuration des Déploiements GitHub Actions

## Secrets à configurer dans GitHub

Allez dans **Settings > Secrets and variables > Actions** et ajoutez les secrets suivants :

### 1. Secrets Cloudflare (Requis)

- **`CLOUDFLARE_API_TOKEN`** : Token API Cloudflare avec permissions pour Workers et Pages
  - Créez-le sur : https://dash.cloudflare.com/profile/api-tokens
  - Permissions nécessaires :
    - Account: Cloudflare Workers Scripts:Edit
    - Account: Cloudflare Pages:Edit
    - Zone: Zone:Read

- **`CLOUDFLARE_ACCOUNT_ID`** : Votre ID de compte Cloudflare
  - Trouvez-le dans le dashboard Cloudflare

### 2. Secrets d'Application

- **`AUTH_SECRET`** : Clé secrète pour l'authentification (générez une chaîne aléatoire sécurisée)
- **`DATABASE_URL`** : URL de connexion PostgreSQL (pour les migrations, optionnel)

### 3. URLs d'API

- **`PRODUCTION_API_URL`** : `https://motiv-app.gtux-prog.workers.dev/api`
- **Note** : Les URLs de preview sont générées automatiquement avec le format : `https://motiv-app-preview-{PR_NUMBER}.gtux-prog.workers.dev/api`

## Environnements GitHub

Créez un environnement "production" dans **Settings > Environments** :
- Ajoutez des règles de protection si nécessaire
- Configurez les reviewers requis

## Utilisation

### Déploiements automatiques

1. **Production** : Chaque push sur `master` ou `main` déclenche un déploiement production
2. **Preview** : Chaque PR ouvre automatiquement un environnement preview
3. **Nettoyage** : Les previews sont supprimés automatiquement à la fermeture de la PR

### Déploiement manuel

Allez dans **Actions > Deploy Production** et cliquez sur "Run workflow"

## URLs de production

- **Site principal** : https://motiv.pages.dev
- **API** : https://motiv-app.gtux-prog.workers.dev

## Personnalisation du domaine

1. Dans Cloudflare Pages, ajoutez votre domaine personnalisé
2. Mettez à jour `FRONTEND_URL` dans les workflows
3. Mettez à jour `site` dans `astro.config.mjs`