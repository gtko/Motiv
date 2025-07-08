#!/bin/bash

echo "=== Configuration des secrets GitHub pour Motiv ==="
echo ""
echo "Ce script va vous aider à configurer les secrets et variables nécessaires pour le déploiement."
echo ""
echo "Vous aurez besoin des informations suivantes :"
echo "1. DATABASE_URL - Votre string de connexion Neon Database"
echo "2. PUBLIC_DATABASE_URL - Même valeur (pour le client-side)"
echo "3. AUTH_SECRET - Clé secrète pour l'authentification"
echo "4. BUNNY_STORAGE_ZONE - Nom de votre Storage Zone BunnyCDN"
echo "5. BUNNY_STORAGE_PASSWORD - Mot de passe FTP/API"
echo "6. BUNNY_STORAGE_ENDPOINT - Endpoint de votre région"
echo "7. BUNNY_API_KEY - Clé API BunnyCDN"
echo "8. BUNNY_PULL_ZONE_ID - ID de votre Pull Zone"
echo ""
echo "Appuyez sur Entrée pour continuer..."
read

# Database Configuration
echo ""
echo "=== Configuration Database (Neon) ==="
echo ""
echo "1. DATABASE_URL"
echo "Entrez votre string de connexion Neon Database :"
echo "Format: postgresql://user:password@host.neon.tech/dbname?sslmode=require"
read -s -p "> " DATABASE_URL
echo ""
if [ -n "$DATABASE_URL" ]; then
    gh secret set DATABASE_URL --body "$DATABASE_URL"
    echo "✓ DATABASE_URL configuré"
fi

echo ""
echo "2. PUBLIC_DATABASE_URL"
echo "Utiliser la même valeur pour PUBLIC_DATABASE_URL ? (o/N)"
read -p "> " USE_SAME_DB
if [[ "$USE_SAME_DB" =~ ^[Oo]$ ]]; then
    gh variable set PUBLIC_DATABASE_URL --body "$DATABASE_URL"
    echo "✓ PUBLIC_DATABASE_URL configuré (même valeur)"
else
    echo "Entrez la valeur pour PUBLIC_DATABASE_URL :"
    read -s -p "> " PUBLIC_DATABASE_URL
    echo ""
    if [ -n "$PUBLIC_DATABASE_URL" ]; then
        gh variable set PUBLIC_DATABASE_URL --body "$PUBLIC_DATABASE_URL"
        echo "✓ PUBLIC_DATABASE_URL configuré"
    fi
fi

echo ""
echo "3. AUTH_SECRET"
echo "Entrez votre clé secrète pour l'authentification :"
echo "(Génération aléatoire recommandée - ex: openssl rand -hex 32)"
read -s -p "> " AUTH_SECRET
echo ""
if [ -n "$AUTH_SECRET" ]; then
    gh secret set AUTH_SECRET --body "$AUTH_SECRET"
    echo "✓ AUTH_SECRET configuré"
fi

echo ""
echo "=== Configuration BunnyCDN ==="

# Storage Zone
echo ""
echo "4. BUNNY_STORAGE_ZONE"
echo "Entrez le nom de votre Storage Zone BunnyCDN :"
read -p "> " STORAGE_ZONE
if [ -n "$STORAGE_ZONE" ]; then
    gh secret set BUNNY_STORAGE_ZONE --body "$STORAGE_ZONE"
    echo "✓ BUNNY_STORAGE_ZONE configuré"
fi

# Storage Password
echo ""
echo "5. BUNNY_STORAGE_PASSWORD"
echo "Entrez le mot de passe FTP/API de votre Storage Zone :"
echo "(Le mot de passe ne sera pas affiché pour des raisons de sécurité)"
read -s -p "> " STORAGE_PASSWORD
echo ""
if [ -n "$STORAGE_PASSWORD" ]; then
    gh secret set BUNNY_STORAGE_PASSWORD --body "$STORAGE_PASSWORD"
    echo "✓ BUNNY_STORAGE_PASSWORD configuré"
fi

# Storage Endpoint
echo ""
echo "6. BUNNY_STORAGE_ENDPOINT"
echo "Sélectionnez votre région :"
echo "  1) Europe (Falkenstein) - storage"
echo "  2) New York - ny.storage"
echo "  3) Los Angeles - la.storage"
echo "  4) Singapore - sg.storage"
echo "  5) Sydney - syd.storage"
read -p "Votre choix (1-5) : " REGION_CHOICE

case $REGION_CHOICE in
    1) ENDPOINT="storage" ;;
    2) ENDPOINT="ny.storage" ;;
    3) ENDPOINT="la.storage" ;;
    4) ENDPOINT="sg.storage" ;;
    5) ENDPOINT="syd.storage" ;;
    *) ENDPOINT="storage" ;;
esac

gh secret set BUNNY_STORAGE_ENDPOINT --body "$ENDPOINT"
echo "✓ BUNNY_STORAGE_ENDPOINT configuré : $ENDPOINT"

# API Key
echo ""
echo "7. BUNNY_API_KEY"
echo "Entrez votre clé API BunnyCDN principale :"
echo "(Trouvable dans Account Settings → API → API Key)"
read -s -p "> " API_KEY
echo ""
if [ -n "$API_KEY" ]; then
    gh secret set BUNNY_API_KEY --body "$API_KEY"
    echo "✓ BUNNY_API_KEY configuré"
fi

# Pull Zone ID
echo ""
echo "8. BUNNY_PULL_ZONE_ID"
echo "Entrez l'ID de votre Pull Zone :"
echo "(Trouvable dans CDN → Votre Pull Zone → URL ou détails)"
read -p "> " PULL_ZONE_ID
if [ -n "$PULL_ZONE_ID" ]; then
    gh secret set BUNNY_PULL_ZONE_ID --body "$PULL_ZONE_ID"
    echo "✓ BUNNY_PULL_ZONE_ID configuré"
fi

echo ""
echo "=== Configuration terminée ! ==="
echo ""
echo "Secrets configurés :"
gh secret list
echo ""
echo "Variables configurées :"
gh variable list
echo ""
echo "Vous pouvez maintenant :"
echo "1. Faire un push pour déclencher le déploiement automatique"
echo "2. Ou déclencher manuellement : gh workflow run deploy-bunnycdn.yml"
echo "3. Tester localement avec vos variables d'environnement"
echo ""