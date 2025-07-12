#!/bin/bash

echo "🔐 Configuration des secrets Cloudflare pour Motiv"
echo "================================================="
echo ""
echo "Ce script vous aide à configurer les secrets nécessaires pour le déploiement."
echo ""

# Vérifier si wrangler est installé
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler n'est pas installé. Installez-le avec: npm install -g wrangler"
    exit 1
fi

# Demander le secret AUTH_SECRET
echo "📝 Configuration de AUTH_SECRET"
echo "Si vous n'avez pas de secret, générez-en un avec: openssl rand -hex 32"
echo ""
read -p "Entrez votre AUTH_SECRET: " auth_secret

# Configurer pour production
echo ""
echo "🚀 Configuration pour l'environnement de production..."
wrangler secret put AUTH_SECRET --env production <<< "$auth_secret"

# Demander si on configure aussi pour preview
echo ""
read -p "Voulez-vous aussi configurer pour l'environnement preview? (y/n): " setup_preview

if [[ $setup_preview == "y" || $setup_preview == "Y" ]]; then
    echo "🔧 Configuration pour l'environnement preview..."
    wrangler secret put AUTH_SECRET --env preview <<< "$auth_secret"
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Assurez-vous que ces secrets sont configurés dans GitHub:"
echo "   - CLOUDFLARE_API_TOKEN"
echo "   - CLOUDFLARE_ACCOUNT_ID"
echo "   - AUTH_SECRET (optionnel si vous voulez l'utiliser dans le workflow)"
echo "   - PRODUCTION_API_URL (optionnel, défaut: https://motiv-app.gtux-prog.workers.dev/api)"
echo ""
echo "2. Commitez et poussez vos changements:"
echo "   git add ."
echo "   git commit -m 'fix: resolve deployment issues'"
echo "   git push"