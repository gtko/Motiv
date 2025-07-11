#!/bin/bash

# Script pour configurer les secrets GitHub pour Cloudflare
# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Configuration des Secrets GitHub 🔐   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Vérifier si gh est installé
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI n'est pas installée.${NC}"
    echo ""
    echo "Pour l'installer:"
    echo "  - macOS: brew install gh"
    echo "  - Linux: https://github.com/cli/cli#installation"
    echo "  - Windows: winget install --id GitHub.cli"
    exit 1
fi

# Vérifier la connexion GitHub
gh auth status &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}📝 Connexion à GitHub requise...${NC}"
    gh auth login
fi

# Obtenir le repo
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null)
if [ -z "$REPO" ]; then
    echo -e "${YELLOW}⚠️  Impossible de détecter le repository.${NC}"
    read -p "Entrez le nom du repo (format: owner/repo): " REPO
fi

echo -e "${GREEN}✅ Repository: $REPO${NC}"
echo ""

# Fonction pour vérifier si un secret existe
secret_exists() {
    gh secret list -R "$REPO" | grep -q "^$1"
}

# Cloudflare Account ID
echo -e "${YELLOW}1. Cloudflare Account ID${NC}"
if secret_exists "CLOUDFLARE_ACCOUNT_ID"; then
    echo -e "${GREEN}   ✓ Déjà configuré${NC}"
    read -p "   Voulez-vous le mettre à jour ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        SKIP_ACCOUNT_ID=true
    fi
fi

if [ -z "$SKIP_ACCOUNT_ID" ]; then
    # Essayer de récupérer depuis wrangler
    if command -v wrangler &> /dev/null && [ -z "$($WRANGLER whoami 2>/dev/null | grep 'Account ID')" ]; then
        ACCOUNT_ID=$(wrangler whoami 2>/dev/null | grep 'Account ID' | awk '{print $3}')
        if [ ! -z "$ACCOUNT_ID" ]; then
            echo -e "${GREEN}   Account ID trouvé: $ACCOUNT_ID${NC}"
            read -p "   Utiliser cette valeur ? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                ACCOUNT_ID=""
            fi
        fi
    fi
    
    if [ -z "$ACCOUNT_ID" ]; then
        echo "   Trouvez votre Account ID sur: https://dash.cloudflare.com/"
        read -p "   Entrez votre Cloudflare Account ID: " ACCOUNT_ID
    fi
    
    gh secret set CLOUDFLARE_ACCOUNT_ID -b "$ACCOUNT_ID" -R "$REPO"
    echo -e "${GREEN}   ✓ CLOUDFLARE_ACCOUNT_ID configuré${NC}"
fi
echo ""

# Cloudflare API Token
echo -e "${YELLOW}2. Cloudflare API Token${NC}"
if secret_exists "CLOUDFLARE_API_TOKEN"; then
    echo -e "${GREEN}   ✓ Déjà configuré${NC}"
    read -p "   Voulez-vous le mettre à jour ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        SKIP_API_TOKEN=true
    fi
fi

if [ -z "$SKIP_API_TOKEN" ]; then
    echo "   Créez un token sur: https://dash.cloudflare.com/profile/api-tokens"
    echo "   Permissions requises:"
    echo "     • Account: Cloudflare Workers Scripts:Edit"
    echo "     • Account: Cloudflare Pages:Edit"
    echo "     • Zone: Zone:Read"
    echo ""
    read -s -p "   Collez votre API Token: " CF_API_TOKEN
    echo ""
    
    gh secret set CLOUDFLARE_API_TOKEN -b "$CF_API_TOKEN" -R "$REPO"
    echo -e "${GREEN}   ✓ CLOUDFLARE_API_TOKEN configuré${NC}"
fi
echo ""

# Auth Secret
echo -e "${YELLOW}3. Auth Secret${NC}"
if secret_exists "AUTH_SECRET"; then
    echo -e "${GREEN}   ✓ Déjà configuré${NC}"
    read -p "   Voulez-vous générer un nouveau secret ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        SKIP_AUTH_SECRET=true
    fi
fi

if [ -z "$SKIP_AUTH_SECRET" ]; then
    AUTH_SECRET=$(openssl rand -base64 32)
    gh secret set AUTH_SECRET -b "$AUTH_SECRET" -R "$REPO"
    echo -e "${GREEN}   ✓ AUTH_SECRET généré et configuré${NC}"
    
    # Proposer de mettre à jour wrangler.toml
    if [ -f "wrangler.toml" ]; then
        echo ""
        read -p "   Mettre à jour AUTH_SECRET dans wrangler.toml ? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Créer un backup
            cp wrangler.toml wrangler.toml.bak
            # Mettre à jour le secret
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/AUTH_SECRET = \".*\"/AUTH_SECRET = \"$AUTH_SECRET\"/" wrangler.toml
            else
                sed -i "s/AUTH_SECRET = \".*\"/AUTH_SECRET = \"$AUTH_SECRET\"/" wrangler.toml
            fi
            echo -e "${GREEN}   ✓ wrangler.toml mis à jour${NC}"
        fi
    fi
fi
echo ""

# Production API URL
echo -e "${YELLOW}4. Production API URL${NC}"
if secret_exists "PRODUCTION_API_URL"; then
    echo -e "${GREEN}   ✓ Déjà configuré${NC}"
    read -p "   Voulez-vous le mettre à jour ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        SKIP_PROD_URL=true
    fi
fi

if [ -z "$SKIP_PROD_URL" ]; then
    if [ ! -z "$ACCOUNT_ID" ]; then
        # Essayer de récupérer le subdomain depuis wrangler.toml
        SUBDOMAIN=$(grep -oP '(?<=workers_dev = ")[^"]*' wrangler.toml 2>/dev/null || echo "gtux-prog")
        SUGGESTED_URL="https://motiv-app.${SUBDOMAIN}.workers.dev/api"
        echo "   URL suggérée: $SUGGESTED_URL"
        read -p "   Utiliser cette URL ? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            PROD_URL=$SUGGESTED_URL
        else
            read -p "   Entrez l'URL de production: " PROD_URL
        fi
    else
        read -p "   Entrez l'URL de l'API de production: " PROD_URL
    fi
    
    gh secret set PRODUCTION_API_URL -b "$PROD_URL" -R "$REPO"
    echo -e "${GREEN}   ✓ PRODUCTION_API_URL configuré${NC}"
fi
echo ""

# Database URL (optionnel)
echo -e "${YELLOW}5. Database URL (optionnel)${NC}"
if secret_exists "DATABASE_URL"; then
    echo -e "${GREEN}   ✓ Déjà configuré${NC}"
else
    if [ -f ".env" ] && grep -q "DATABASE_URL" .env; then
        echo "   DATABASE_URL trouvé dans .env"
        read -p "   Voulez-vous l'utiliser ? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            DB_URL=$(grep "DATABASE_URL" .env | cut -d '=' -f2-)
            gh secret set DATABASE_URL -b "$DB_URL" -R "$REPO"
            echo -e "${GREEN}   ✓ DATABASE_URL configuré${NC}"
        fi
    else
        read -p "   Voulez-vous configurer DATABASE_URL ? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "   Entrez l'URL de la base de données: " DB_URL
            gh secret set DATABASE_URL -b "$DB_URL" -R "$REPO"
            echo -e "${GREEN}   ✓ DATABASE_URL configuré${NC}"
        fi
    fi
fi

# Résumé
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}         Configuration terminée! 🎉      ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Lister les secrets configurés
echo -e "${YELLOW}Secrets configurés:${NC}"
gh secret list -R "$REPO" | grep -E "CLOUDFLARE_|AUTH_SECRET|DATABASE_URL|PRODUCTION_" | while read -r line; do
    echo -e "  ${GREEN}✓${NC} $line"
done

echo ""
echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo "1. Créez une Pull Request pour tester le déploiement preview"
echo "2. Vérifiez que les workflows GitHub Actions fonctionnent"
echo "3. Mergez sur master/main pour déployer en production"
echo ""

# Proposer de voir les workflows
if [ -d ".github/workflows" ]; then
    echo -e "${BLUE}Workflows disponibles:${NC}"
    ls -1 .github/workflows/*.yml | while read -r workflow; do
        echo "  • $(basename $workflow)"
    done
fi