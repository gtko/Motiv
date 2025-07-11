#!/bin/bash

# Script d'installation interactif pour Cloudflare
# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    Setup Cloudflare pour Motiv 🚀     ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Fonction pour demander confirmation
confirm() {
    read -p "$1 (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Fonction pour afficher le statut
show_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# 1. Vérifier si Wrangler est installé
echo -e "${YELLOW}📦 Vérification de Wrangler...${NC}"
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}Wrangler n'est pas installé globalement.${NC}"
    if confirm "Voulez-vous l'installer globalement ?"; then
        npm install -g wrangler
        show_status $? "Installation de Wrangler"
    else
        echo "Utilisation de npx wrangler..."
        WRANGLER="npx wrangler"
    fi
else
    WRANGLER="wrangler"
    echo -e "${GREEN}✅ Wrangler est installé${NC}"
fi

# 2. Vérifier la connexion à Cloudflare
echo -e "\n${YELLOW}🔐 Vérification de la connexion Cloudflare...${NC}"
$WRANGLER whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${RED}Vous n'êtes pas connecté à Cloudflare.${NC}"
    if confirm "Voulez-vous vous connecter maintenant ?"; then
        $WRANGLER login
        show_status $? "Connexion à Cloudflare"
    else
        echo -e "${RED}⚠️  La connexion est requise pour continuer.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Connecté à Cloudflare${NC}"
fi

# 3. Créer ou vérifier la base D1
echo -e "\n${YELLOW}🗄️  Configuration de la base de données D1...${NC}"
echo "Vérification des bases existantes..."
$WRANGLER d1 list

if confirm "Voulez-vous créer une nouvelle base D1 'motiv-db' ?"; then
    $WRANGLER d1 create motiv-db
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Base D1 créée${NC}"
        echo -e "${YELLOW}⚠️  Copiez l'ID de la base et mettez-le dans wrangler.toml${NC}"
        read -p "Appuyez sur Entrée quand c'est fait..."
    fi
else
    echo "Utilisation de la base existante."
fi

# 4. Créer le namespace KV
echo -e "\n${YELLOW}🔑 Configuration du namespace KV pour les sessions...${NC}"
if confirm "Voulez-vous créer le namespace KV 'SESSIONS' ?"; then
    $WRANGLER kv namespace create SESSIONS
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Namespace KV créé${NC}"
        echo -e "${YELLOW}⚠️  Copiez l'ID du namespace et mettez-le dans wrangler.toml${NC}"
        read -p "Appuyez sur Entrée quand c'est fait..."
    fi
fi

# 5. Créer le bucket R2
echo -e "\n${YELLOW}📦 Configuration du bucket R2 pour les médias...${NC}"
echo -e "${YELLOW}⚠️  Note: R2 doit être activé dans votre dashboard Cloudflare${NC}"
if confirm "R2 est-il activé et voulez-vous créer le bucket 'motiv-media' ?"; then
    $WRANGLER r2 bucket create motiv-media
    show_status $? "Création du bucket R2"
fi

# 6. Créer le schéma D1
echo -e "\n${YELLOW}📋 Création du schéma de base de données...${NC}"
if confirm "Voulez-vous créer les tables dans D1 ?"; then
    echo "Application du schéma..."
    $WRANGLER d1 execute motiv-db --file=./src/db/schema-d1.sql --remote
    show_status $? "Création du schéma"
fi

# 7. Migration des données (optionnel)
echo -e "\n${YELLOW}🔄 Migration des données depuis PostgreSQL...${NC}"
if confirm "Avez-vous des données à migrer depuis PostgreSQL ?"; then
    if [ -f ".env" ]; then
        echo "Génération du fichier de migration..."
        npm run migrate-to-d1
        if [ $? -eq 0 ] && [ -f "migration-data.sql" ]; then
            echo -e "${GREEN}✅ Fichier de migration créé${NC}"
            if confirm "Voulez-vous importer les données maintenant ?"; then
                $WRANGLER d1 execute motiv-db --file=./migration-data.sql --remote
                show_status $? "Import des données"
            fi
        fi
    else
        echo -e "${RED}⚠️  Fichier .env non trouvé. Assurez-vous que DATABASE_URL est configuré.${NC}"
    fi
fi

# 8. Tester en local
echo -e "\n${YELLOW}🧪 Test en local...${NC}"
if confirm "Voulez-vous tester les Workers en local ?"; then
    echo -e "${BLUE}Lancement des Workers...${NC}"
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
    npm run workers:dev
fi

# 9. Déployer
echo -e "\n${YELLOW}🚀 Déploiement...${NC}"
if confirm "Voulez-vous déployer les Workers maintenant ?"; then
    $WRANGLER deploy
    show_status $? "Déploiement des Workers"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Workers déployés avec succès !${NC}"
        echo -e "${BLUE}URL de l'API : https://motiv-app.YOUR-SUBDOMAIN.workers.dev${NC}"
    fi
fi

# 10. Configuration Pages
echo -e "\n${YELLOW}📄 Configuration de Cloudflare Pages...${NC}"
if confirm "Voulez-vous déployer sur Cloudflare Pages ?"; then
    echo "Build du site..."
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build réussi${NC}"
        $WRANGLER pages deploy dist
        show_status $? "Déploiement sur Pages"
    fi
fi

# 11. Configuration des secrets GitHub
echo -e "\n${YELLOW}🔐 Configuration des secrets GitHub...${NC}"
if command -v gh &> /dev/null; then
    echo -e "${GREEN}✅ GitHub CLI installée${NC}"
    
    # Vérifier la connexion GitHub
    gh auth status &> /dev/null
    if [ $? -ne 0 ]; then
        echo -e "${RED}Vous n'êtes pas connecté à GitHub.${NC}"
        if confirm "Voulez-vous vous connecter maintenant ?"; then
            gh auth login
        fi
    fi
    
    # Obtenir le repo
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
    if [ -z "$REPO" ]; then
        echo -e "${YELLOW}⚠️  Impossible de détecter le repository. Assurez-vous d'être dans un repo Git.${NC}"
        read -p "Entrez le nom du repo (format: owner/repo): " REPO
    fi
    
    if [ ! -z "$REPO" ]; then
        echo -e "${BLUE}Repository détecté: $REPO${NC}"
        
        if confirm "Voulez-vous configurer les secrets GitHub Actions ?"; then
            # Cloudflare Account ID
            if [ ! -z "$($WRANGLER whoami 2>/dev/null | grep 'Account ID')" ]; then
                ACCOUNT_ID=$($WRANGLER whoami 2>/dev/null | grep 'Account ID' | awk '{print $3}')
                echo -e "${GREEN}✅ Account ID trouvé: $ACCOUNT_ID${NC}"
            else
                read -p "Entrez votre Cloudflare Account ID: " ACCOUNT_ID
            fi
            
            # Cloudflare API Token
            echo -e "${YELLOW}📝 Créez un token API sur: https://dash.cloudflare.com/profile/api-tokens${NC}"
            echo "Permissions requises:"
            echo "  - Account: Cloudflare Workers Scripts:Edit"
            echo "  - Account: Cloudflare Pages:Edit"
            echo "  - Zone: Zone:Read"
            read -s -p "Collez votre Cloudflare API Token: " CF_API_TOKEN
            echo ""
            
            # Auth Secret
            AUTH_SECRET=$(openssl rand -base64 32)
            echo -e "${GREEN}✅ Auth secret généré${NC}"
            
            # Worker URL
            WORKER_URL="https://motiv-app.${ACCOUNT_ID}.workers.dev"
            
            # Créer les secrets
            echo -e "\n${BLUE}Création des secrets...${NC}"
            
            gh secret set CLOUDFLARE_ACCOUNT_ID -b "$ACCOUNT_ID" -R "$REPO"
            show_status $? "CLOUDFLARE_ACCOUNT_ID"
            
            gh secret set CLOUDFLARE_API_TOKEN -b "$CF_API_TOKEN" -R "$REPO"
            show_status $? "CLOUDFLARE_API_TOKEN"
            
            gh secret set AUTH_SECRET -b "$AUTH_SECRET" -R "$REPO"
            show_status $? "AUTH_SECRET"
            
            gh secret set PRODUCTION_API_URL -b "${WORKER_URL}/api" -R "$REPO"
            show_status $? "PRODUCTION_API_URL"
            
            # Database URL (optionnel)
            if [ -f ".env" ] && grep -q "DATABASE_URL" .env; then
                if confirm "Voulez-vous ajouter DATABASE_URL depuis .env ?"; then
                    DB_URL=$(grep "DATABASE_URL" .env | cut -d '=' -f2-)
                    gh secret set DATABASE_URL -b "$DB_URL" -R "$REPO"
                    show_status $? "DATABASE_URL"
                fi
            fi
            
            echo -e "\n${GREEN}✅ Secrets GitHub configurés !${NC}"
            
            # Mettre à jour wrangler.toml avec le bon auth secret
            if confirm "Voulez-vous mettre à jour AUTH_SECRET dans wrangler.toml ?"; then
                sed -i.bak "s/AUTH_SECRET = \".*\"/AUTH_SECRET = \"$AUTH_SECRET\"/" wrangler.toml
                echo -e "${GREEN}✅ wrangler.toml mis à jour${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI n'est pas installée.${NC}"
    echo "Pour l'installer: https://cli.github.com/"
    echo ""
    echo "Secrets à configurer manuellement dans GitHub:"
    echo "  - CLOUDFLARE_ACCOUNT_ID"
    echo "  - CLOUDFLARE_API_TOKEN"
    echo "  - AUTH_SECRET"
    echo "  - PRODUCTION_API_URL"
    echo "  - DATABASE_URL (optionnel)"
fi

# Résumé
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}            Configuration terminée!      ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo "1. Vérifiez que tous les IDs sont corrects dans wrangler.toml"
echo "2. Créez une Pull Request pour tester le déploiement preview"
echo "3. Mergez sur master/main pour déployer en production"
echo "4. Configurez un domaine personnalisé dans Cloudflare Pages"
echo ""
echo -e "${GREEN}🎉 Bonne chance avec votre projet Motiv sur Cloudflare !${NC}"