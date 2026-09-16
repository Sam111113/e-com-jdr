# e-com-jdr

Site e-commerce de jeux à imprimer (escape games, chasses au trésor, murder
parties, jeux d'enquête). Voir `AGENTS.md` et `docs/PLAN.md` pour le contexte complet, les
phases et les décisions d'architecture.

**Statut actuel :** socle technique (T1.3), base de données et import des jeux
(T1.5). Le catalogue, le paiement et les autres fonctionnalités arrivent dans
les tâches suivantes (voir `docs/PROGRESS.md`). Les sections « Ouvrir les
ventes » et « Restaurer une sauvegarde » seront complétées par T1.7/T3.9 et
T1.15.

## Stack

- Next.js (App Router, TypeScript) + Tailwind CSS.
- PostgreSQL 18 + Drizzle ORM (schéma dans `db/schema.ts`, migrations
  versionnées dans `db/migrations/`).
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

Base de données de développement (`DEV_DATABASE_URL`) :

```bash
npm run db:migrate      # applique les migrations
npm run import-games    # importe les jeux de content/games/
```

## Ajouter un jeu

Le créateur du jeu fournit un dossier `content/games/<slug>/` :
- `fiche.md`, rempli à partir du modèle `content/_modele/fiche.md` ;
- `cover.jpg`, `apercu-1.jpg`, `apercu-2.jpg`… ;
- `kit.pdf`, le produit vendu.

1. **En développement**, importer le jeu :

   ```bash
   npm run import-games <slug>
   ```

   Une fiche incomplète produit une erreur qui nomme le champ en cause. L'import
   génère les images optimisées (AVIF et WebP) dans `public/games/<slug>/`, puis
   déplace `kit.pdf` dans le stockage privé.

2. **Commiter** `fiche.md`, les images sources et `public/games/<slug>/`.
   **Jamais `kit.pdf`** : c'est le produit vendu, il est ignoré par Git.

3. **Sur le staging**, transmettre le kit hors de Git, puis importer :
   - copier `kit.pdf` dans `/root/apps/e-com-jdr-staging/content/games/<slug>/` ;
   - suivre « Mettre à jour le staging », puis « Base de données : migrations et
     import » ci-dessous.

**Renommer un jeu** (redirection 301 enregistrée automatiquement) :

```bash
npm run rename-game <ancien-slug> <nouveau-slug>
npm run import-games <nouveau-slug>   # régénère les images sous le nouveau slug
```

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

## Vérifier les pages du site (T1.6)

Pour voir le jeu factice dans le catalogue (statut `brouillon`) : appliquer
les migrations et lancer l'import (voir « Base de données » ci-dessous),
puis démarrer le serveur standalone comme ci-dessus en ajoutant
`AFFICHER_BROUILLONS=true` et une `DATABASE_URL` valide :

```bash
DATABASE_URL="$DEV_DATABASE_URL" AFFICHER_BROUILLONS=true \
PORT=3100 HOSTNAME=127.0.0.1 \
STAGING_BASIC_AUTH_USER=equipe STAGING_BASIC_AUTH_PASSWORD=changez-moi \
node .next/standalone/server.js
```

```bash
PORT=3100 STAGING_BASIC_AUTH_USER=equipe STAGING_BASIC_AUTH_PASSWORD=changez-moi \
npx playwright test tests/e2e/pages.spec.ts
```

Ce test (`tests/e2e/pages.spec.ts`) capture chaque page en mobile et
ordinateur, en thème clair et sombre, dans `test-results/captures/` — utile
pour une revue visuelle rapide sans rouvrir chaque page à la main.

## Interrupteur de vente et ouverture des ventes (T1.7)

`SALES_ENABLED` pilote le bouton (« Me prévenir de la sortie » ou
« Acheter »), et sera étendu par T1.8/T1.9 aux routes de paiement et de
téléchargement. **Sa valeur est figée au build**, pas seulement lue au
runtime (décision D11) : changer `.env` et redémarrer le conteneur SANS
reconstruire l'image ne rouvre jamais les ventes, ça ne fait que bloquer le
démarrage du serveur (garde-fou volontaire). Ouvrir les ventes demande donc,
une fois `config/entreprise.ts` complété (plus aucune valeur
`"À COMPLÉTER"`) :

```bash
docker compose -f docker/docker-compose.yml --env-file .env build app
docker compose -f docker/docker-compose.yml --env-file .env up -d app
```

Si `config/entreprise.ts` contient encore une valeur provisoire, l'étape
`build` échoue avant même de lancer `next build`, en listant chaque champ
fautif (`scripts/check-legal-config.ts`, exécuté automatiquement en
`prebuild`).

Pour vérifier le garde-fou sans rien casser (safe, ne modifie aucun
déploiement) :

```bash
# Doit échouer et lister les champs de config/entreprise.ts encore à compléter :
SALES_ENABLED=true npm run prebuild
```

`AFFICHER_PRIX` (affichage des prix) est un réglage cosmétique séparé, sans
lien avec `SALES_ENABLED` : celui-là peut changer sans reconstruire.

## Déploiement du staging (exécuté par l'équipe sur l'hôte du VPS)

L'agent écrit les fichiers et les commandes ; **l'équipe les exécute** (voir
`docs/A_FAIRE_EQUIPE.md`).

Le staging tourne depuis un **clone dédié**, `/root/apps/e-com-jdr-staging`,
et non depuis le dossier de travail des agents (`/root/workspace/e-com-jdr`) :
- son `.env` (mots de passe) reste hors de portée des agents, dont le
  conteneur ne voit que `/root/workspace` ;
- le staging ne change que lorsque l'équipe tire volontairement un commit.

> **Toutes les commandes `docker compose` se lancent depuis la racine du clone
> avec `--env-file .env`.** Sans cette option, Compose cherche le `.env` dans
> `docker/` pour interpoler les variables, et échoue.

1. **Première fois seulement** — cloner le dépôt local et préparer `.env` :

   ```bash
   # Sur ce VPS de développement, on clone le dépôt local des agents : l'hôte
   # n'a pas d'identifiants GitHub (dépôt privé). Sur le futur VPS de
   # production, on clonera depuis GitHub avec une clé de déploiement.
   git clone /root/workspace/e-com-jdr /root/apps/e-com-jdr-staging
   cd /root/apps/e-com-jdr-staging
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
   cd /root/apps/e-com-jdr-staging
   docker compose -f docker/docker-compose.yml --env-file .env build
   docker compose -f docker/docker-compose.yml --env-file .env up -d
   docker compose -f docker/docker-compose.yml --env-file .env ps
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
   cd /root/apps/e-com-jdr-staging
   git pull            # tire la branche main du dépôt local des agents
   docker compose -f docker/docker-compose.yml --env-file .env build
   docker compose -f docker/docker-compose.yml --env-file .env up -d
   ```

6. **Logs et arrêt :**

   ```bash
   cd /root/apps/e-com-jdr-staging
   docker compose -f docker/docker-compose.yml --env-file .env logs -f app
   docker compose -f docker/docker-compose.yml --env-file .env down   # les volumes nommés (données) sont conservés
   ```

   **Ne jamais utiliser `down -v`, `docker volume prune` ni `docker system prune`**
   sur ce VPS : ils supprimeraient des données, y compris potentiellement
   celles d'autres services hébergés (n8n).

### Base de données : migrations et import

Les migrations et l'import passent par le service `tools` (profil Compose
« tools ») : il est lancé à la demande et jamais démarré en continu.

**Première fois seulement**, donner le volume privé à l'utilisateur de
l'application, sans quoi elle ne pourra pas y écrire :

```bash
cd /root/apps/e-com-jdr-staging
docker compose -f docker/docker-compose.yml --env-file .env --profile tools run --rm --no-deps tools chown 1001:1001 /data/private
```

**Après chaque mise à jour du schéma ou des jeux :**

```bash
cd /root/apps/e-com-jdr-staging
docker compose -f docker/docker-compose.yml --env-file .env --profile tools build tools
docker compose -f docker/docker-compose.yml --env-file .env --profile tools run --rm tools npm run db:migrate
docker compose -f docker/docker-compose.yml --env-file .env --profile tools run --rm tools npm run import-games
```

Migrations et import se relancent sans risque : ils ne créent rien en double.

L'import retire chaque `kit.pdf` de `content/` pour le ranger dans le volume
privé. Le kit du jeu factice étant versionné, le restaurer ensuite :

```bash
git checkout -- content/games/jeu-factice-chasse-au-tresor-halloween/kit.pdf
```

## Tests

```bash
npm run lint
npm run build
npm run test:unit  # utilise TEST_DATABASE_URL, base vidée à chaque exécution
npm run test:e2e   # voir « Vérifier le socle technique » ci-dessus pour le lancer correctement
```
