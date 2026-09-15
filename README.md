# e-com-jdr

Site e-commerce de jeux à imprimer (escape games, murder parties, jeux
d'enquête). Voir `AGENTS.md` et `docs/PLAN.md` pour le contexte complet, les
phases et les décisions d'architecture.

**Statut actuel :** socle technique (T1.3). Le catalogue, le paiement et les
autres fonctionnalités arrivent dans les tâches suivantes (voir
`docs/PROGRESS.md`). Les sections « Ajouter un jeu », « Ouvrir les ventes »
et « Restaurer une sauvegarde » seront complétées par T1.5, T1.7/T3.9 et
T1.15.

## Stack

- Next.js (App Router, TypeScript) + Tailwind CSS.
- PostgreSQL 18 (arrive avec T1.5 côté application ; le conteneur Postgres
  est déjà prêt dans `docker/docker-compose.yml`).
- Umami (statistiques, sans cookies) auto-hébergé.
- Déploiement : Docker Compose, staging exposé uniquement via Tailscale
  Serve (aucun port public).

## Lancer en local (développement, dans le conteneur de l'agent)

Prérequis déjà en place dans ce conteneur (voir `AGENTS.md` section 8) :
Node 24, npm, PostgreSQL 18 (bases `ecomjdr_dev` / `ecomjdr_test`, variables
`DEV_DATABASE_URL` / `TEST_DATABASE_URL` déjà exportées), Chromium
(`CHROMIUM_PATH`).

```bash
cp .env.example .env
# Éditer .env : au minimum STAGING_BASIC_AUTH_USER / STAGING_BASIC_AUTH_PASSWORD,
# sinon le proxy (middleware) bloque tout accès, y compris en local.

npm install
npm run dev
# → http://localhost:3000 (demande le mot de passe HTTP Basic Auth défini dans .env)
```

`DEV_DATABASE_URL` sera utilisée par Drizzle à partir de T1.5 ; aucune base
n'est encore nécessaire pour cette page provisoire.

## Vérifier le socle technique (T1.3) sans Docker

L'agent n'a pas Docker dans son conteneur (`AGENTS.md` section 8). Pour
vérifier que la page provisoire se comporte comme en production (mot de
passe, `noindex`), on reproduit le serveur standalone que `docker/Dockerfile`
construira :

```bash
npm run build
# Next.js avec `output: "standalone"` ne copie pas public/ et .next/static
# automatiquement à côté de server.js : on le fait ici manuellement, comme
# le fait docker/Dockerfile pour l'image de production.
cp -r public .next/standalone/public
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/static

PORT=3100 HOSTNAME=127.0.0.1 \
STAGING_BASIC_AUTH_USER=equipe STAGING_BASIC_AUTH_PASSWORD=changez-moi \
node .next/standalone/server.js
```

Puis, dans un autre terminal :

```bash
curl -o /dev/null -s -w "%{http_code}\n" http://127.0.0.1:3100/            # 401 attendu
curl -o /dev/null -s -w "%{http_code}\n" -u equipe:changez-moi http://127.0.0.1:3100/  # 200 attendu
curl -sI http://127.0.0.1:3100/robots.txt                                  # Disallow: /, X-Robots-Tag: noindex

PORT=3100 STAGING_BASIC_AUTH_USER=equipe STAGING_BASIC_AUTH_PASSWORD=changez-moi \
npm run test:e2e
```

Le test E2E (`tests/e2e/staging-protection.spec.ts`) vérifie : refus sans
mot de passe, affichage de la page une fois authentifié avec l'en-tête
`X-Robots-Tag: noindex` et la meta `robots` correspondante, et un
`robots.txt` qui interdit tout.

## Déploiement du staging (exécuté par l'équipe sur l'hôte du VPS)

L'agent écrit les fichiers et les commandes ; **l'équipe les exécute** (voir
`docs/A_FAIRE_EQUIPE.md`).

1. **Première fois seulement** — cloner le dépôt sur l'hôte et préparer `.env` :

   ```bash
   git clone https://github.com/Sam111113/e-com-jdr.git
   cd e-com-jdr
   cp .env.example .env
   chmod 600 .env
   # Éditer .env avec des valeurs réelles :
   #   - STAGING_BASIC_AUTH_USER / STAGING_BASIC_AUTH_PASSWORD (mot de passe du site)
   #   - POSTGRES_PASSWORD (ex. `openssl rand -hex 24`)
   #   - UMAMI_APP_SECRET (ex. `openssl rand -hex 32`)
   #   - DATABASE_URL / UMAMI_DATABASE_URL : reprendre le mot de passe choisi ci-dessus
   ```

2. **Construire et démarrer les conteneurs :**

   ```bash
   cd e-com-jdr
   docker compose -f docker/docker-compose.yml build
   docker compose -f docker/docker-compose.yml up -d
   docker compose -f docker/docker-compose.yml ps
   ```

3. **Vérifier en local sur l'hôte, avant d'exposer quoi que ce soit :**

   ```bash
   curl -o /dev/null -s -w "%{http_code}\n" http://127.0.0.1:3000/                 # 401 attendu
   curl -o /dev/null -s -w "%{http_code}\n" -u <user>:<password> http://127.0.0.1:3000/  # 200 attendu
   curl -o /dev/null -s -w "%{http_code}\n" http://127.0.0.1:3001/                 # Umami
   ```

4. **Exposer sur le tailnet (aucune exposition publique) :**

   ```bash
   tailscale serve --bg --https=8444 http://127.0.0.1:3000
   ```

   Le site est alors joignable, depuis un appareil du tailnet uniquement, sur
   `https://srv1214588.taild2e4d0.ts.net:8444` (mot de passe toujours requis).

5. **Mettre à jour le staging après un nouveau commit :**

   ```bash
   cd e-com-jdr
   git pull
   docker compose -f docker/docker-compose.yml build
   docker compose -f docker/docker-compose.yml up -d
   ```

6. **Logs et arrêt :**

   ```bash
   docker compose -f docker/docker-compose.yml logs -f app
   docker compose -f docker/docker-compose.yml down   # les volumes nommés (données) sont conservés
   ```

## Tests

```bash
npm run lint
npm run build
npm run test:e2e   # voir « Vérifier le socle technique » ci-dessus pour le lancer correctement
```
