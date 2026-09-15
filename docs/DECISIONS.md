# Décisions techniques

> Choix effectués et leurs raisons. À compléter à chaque décision structurante.

---

## D1 — Stack conforme à AGENTS.md section 4
**Décision :** Next.js (App Router, TypeScript) + Tailwind CSS, PostgreSQL + Drizzle ORM, Stripe Checkout, Brevo, pdf-lib, Umami, Docker Compose.
**Raison :** stack imposée par le brief (section 4). Pas de justification à apporter tant qu'aucun blocage technique ne l'exige.

## D2 — Postgres jamais exposé sur Internet
**Décision :** Postgres tourne sur le réseau Docker interne `ecomjdr_default` uniquement, aucun port publié sur l'hôte.
**Raison :** exigence explicite d'AGENTS.md section 7.

## D3 — Interface `storage` avec implémentation locale d'abord
**Décision :** dossier privé sur le VPS (hors webroot) pour les PDF en phase 1-2, derrière une interface `storage` (`put`, `get`, `delete`, `getPrivateUrl`), remplaçable par S3/R2 sans changer le code appelant.
**Raison :** demandé par AGENTS.md section 4 ; évite une dépendance/compte externe payant avant que ce soit nécessaire.

## D4 — Configuration légale centralisée avec garde-fou de build
**Décision :** toutes les infos légales dans `config/entreprise.ts`, valeurs provisoires marquées par un sentinel détectable (`"À COMPLÉTER"`). Un script `scripts/check-legal-config.ts` en `prebuild` fait échouer le build de production si `SALES_ENABLED=true` et qu'une valeur provisoire subsiste.
**Raison :** demandé par AGENTS.md section 4 et T1.7 ; garantit qu'on ne peut pas ouvrir les ventes par erreur avec des mentions légales incomplètes.

## D5 — Table `subscriptions` unique pour newsletter / liste d'attente / jeu gratuit
**Décision :** une seule table `subscriptions` avec un champ `type` (`newsletter` / `liste_attente` / `jeu_gratuit`) et `game_id` nullable, plutôt que trois tables séparées.
**Raison :** simplifie le schéma ; les trois flux partagent la même logique (email, consentement, double opt-in, désinscription) et ne se distinguent que par le type et le jeu concerné.

## D6 — HTTPS et environnements : staging via Tailscale, production sur un VPS dédié
*Décidé par l'équipe le 15/09/2026.*
**Décision :**
- Le VPS actuel sert **uniquement au développement et au staging**. La production aura son propre VPS, provisionné plus tard avec le domaine définitif.
- **Staging :** exposé uniquement sur le tailnet via Tailscale Serve (`https://srv1214588.taild2e4d0.ts.net:8444` → `127.0.0.1:3000`). Aucun port public, aucun DNS nécessaire.
- **Production :** Caddy sur 80/443 du VPS dédié, conformément à la section 4 d'`AGENTS.md`.
- **Aucun conteneur du projet ne rejoint `n8n_default`.**

**Raison :** l'option « Traefik partagé » aurait relié un site public au réseau Docker de n8n, lui donnant un accès direct au port interne de n8n. Sur un VPS de développement, un staging privé via Tailscale ne touche à rien d'existant et ne demande aucun domaine. Les options Cloudflare Tunnel et libération des ports 80/443 sont écartées pour les mêmes raisons.

## D7 — Répartition agent / workers
**Décision :** l'agent garde pour lui les décisions d'architecture et le code critique (paiement, webhook Stripe, factures, sécurité, authentification admin, configuration légale). Le reste (pages, scripts d'import, tests, SEO technique, recherche de mots-clés) est délégué à `worker-code`, `worker-web` et relu par `worker-review` selon le tableau de `docs/PLAN.md`.
**Raison :** exigence explicite d'AGENTS.md section 8 (budget API limité) et bonne pratique de séparation entre code sensible et code cadré.

## D8 — Numérotation des factures par compteur transactionnel
*Décidé par l'équipe le 15/09/2026.*
**Décision :** les numéros de facture et d'avoir sont attribués par un `UPDATE ... RETURNING` sur la table `invoice_counters`, dans la même transaction que l'insertion de la facture. Les séquences Postgres (`serial`, `identity`, `nextval`) sont **interdites** pour cet usage. Le PDF est généré après la validation de la transaction. Détail et tests obligatoires : `docs/PLAN.md`, section « Numérotation des factures ».
**Raison :** la loi impose une numérotation chronologique continue, sans rupture. Une séquence Postgres consomme un numéro même quand la transaction échoue, ce qui crée des trous. Le compteur transactionnel est annulé avec la transaction, et son verrou de ligne garantit l'ordre chronologique en cas d'émissions simultanées.

## D9 — Base de données et tests E2E dans le conteneur de l'agent
*Décidé par l'équipe le 15/09/2026.*
**Décision :**
- **PostgreSQL 18** installé dans le conteneur de l'agent, écoutant sur `127.0.0.1` uniquement : bases `ecomjdr_dev` (`DEV_DATABASE_URL`) et `ecomjdr_test` (`TEST_DATABASE_URL`).
- **Chromium** système (version 152) pour Playwright, via `CHROMIUM_PATH`.
- Staging et production utilisent aussi PostgreSQL 18.

**Raison :** l'agent n'a pas Docker. Sans base locale ni navigateur, il ne pourrait ni développer T1.5 ni exécuter T1.16 sans intervention de l'équipe à chaque test. Playwright a été vérifié avec un vrai test E2E le 15/09/2026. Même version majeure de Postgres partout, pour éviter les écarts de comportement entre dev et prod.

## D10 — Section 0 d'AGENTS.md laissée provisoire
*Décidé par l'équipe le 15/09/2026.*
**Décision :** la marque, le domaine, l'email de contact et le contact de validation restent à compléter plus tard. L'agent utilise des valeurs provisoires clairement marquées. Le dépôt Git distant est confirmé : `github.com/Sam111113/e-com-jdr`.
**Raison :** le staging ne dépend plus d'un domaine (D6) ; ces informations ne bloquent pas la phase 1.

## D11 — `SALES_ENABLED` : une seule variable, figée au build, revérifiée au démarrage et au paiement
*Décidé par l'équipe le 15/09/2026. Remplace la partie « garde-fou » de D4.*
**Décision :** une seule variable `SALES_ENABLED`, lue côté serveur, sans `NEXT_PUBLIC_*`. Sa valeur est figée au build et pilote le bouton, les routes et le JSON-LD. La configuration légale est vérifiée au build, au démarrage du serveur (qui refuse aussi de démarrer si l'environnement diffère de la valeur du build) et à chaque création de session Checkout. Détail et tests : `docs/PLAN.md`, section « `SALES_ENABLED` ».
**Raison :** avec un garde-fou au build seulement, changer `.env` et redémarrer suffisait à ouvrir les ventes sans vérification légale. Une valeur mixte (figée au build pour l'affichage, lue au runtime pour les routes) pouvait aussi afficher « Acheter » vers une 404. Ouvrir les ventes demandera un rebuild, ce qui reste compatible avec l'objectif de moins de 48 h.

## D12 — Table `redirects` prévue dès le schéma initial
*Décidé par l'équipe le 15/09/2026.*
**Décision :** table `redirects (from_path, to_path)` créée en T1.5, sans chaîne ni boucle de redirections. Le mécanisme de détection d'un changement de slug est proposé en T1.5, sans modifier le modèle de fiche de l'équipe sans sa validation.
**Raison :** T1.12 exige une redirection 301 automatique quand un slug change. La prévoir dès le schéma initial évite une migration plus tard et protège le référencement des pages déjà indexées.

## D13 — Protection du staging : `proxy.ts` (Basic Auth fail-closed) + Dockerfile standalone
*Décidé par l'agent le 15/09/2026 (T1.3).*
**Décision :**
- Le fichier de garde s'appelle `proxy.ts` (export `proxy`), pas `middleware.ts` : Next.js 16.3 a renommé cette convention (`middleware` génère un avertissement de dépréciation au build). Comportement inchangé (Basic Auth + en-tête `X-Robots-Tag`).
- Le mot de passe est vérifié en mode **fail-closed** : si `STAGING_BASIC_AUTH_USER` ou `STAGING_BASIC_AUTH_PASSWORD` sont absentes de l'environnement, tout accès est bloqué (401) plutôt qu'autorisé par défaut. `/robots.txt` seul reste accessible sans mot de passe, pour faciliter sa vérification (il n'apporte aucune information et interdit de toute façon tout crawl).
- `next.config.ts` utilise `output: "standalone"` et `docker/Dockerfile` fait un build multi-étapes qui copie manuellement `public/` et `.next/static/` à côté de `server.js`, comme l'exige cette sortie.
- La base Umami est créée par un script d'initialisation Postgres (`docker/postgres-init/01-create-umami-db.sh`), monté dans `/docker-entrypoint-initdb.d` : un seul conteneur Postgres 18 héberge la base applicative et celle d'Umami, comme prévu par `docs/PLAN.md`.
**Raison :** aligner le code sur la version de Next.js utilisée (16.3.5) sans avertissement au build ; éviter qu'une erreur de configuration du déploiement (variables de mot de passe oubliées) ouvre le staging sans protection ; réduire la taille de l'image Docker de production ; éviter un second conteneur Postgres seulement pour Umami.

## D14 — Direction visuelle B, avec thème sombre automatique
*Décidé par l'équipe le 15/09/2026 (clôture de T1.4).*
**Décision :**
- Le site suit la **direction B** (« Ludique pop » : `Baloo 2` + `Nunito`, formes et dégradés CSS, couleurs d'accent saisonnières en variables CSS). Les maquettes `design/direction-b/` sont la **référence visuelle** ; T1.6 les réimplémente en Next.js + Tailwind, sans reprendre le HTML statique tel quel.
- **En plus : un thème sombre**, qui suit automatiquement le réglage de l'appareil du visiteur (`prefers-color-scheme`). Il garde l'identité de la direction B (polices, formes, accents saisonniers), sur fond sombre.
- Contrastes vérifiés **dans les deux thèmes** (≥ 4,5:1 pour le texte courant), accents saisonniers compris.
- **Défaut à corriger à l'intégration (T1.6) :** sur ordinateur, la navigation des maquettes passe sous le logo et se colle au bord gauche de l'écran. Relire les pages avec des captures **à la taille de l'écran**, pas seulement en pleine page.

**Raison :** choix de l'équipe. Le trafic vient surtout du mobile, où le mode sombre est souvent activé ; suivre le réglage de l'appareil évite un écran blanc éblouissant, sans imposer de choix au visiteur.

## D15 — Types de jeu élargis, Halloween en priorité
*Décidé par l'équipe le 15/09/2026.*
**Décision :**
- Le catalogue n'est pas limité aux escape games : il comprend aussi des **chasses au trésor**, et d'autres types pourront s'ajouter (murder party, enquête…).
- **Thème prioritaire : Halloween.** Les autres saisons viendront ensuite.
- **Conséquences :**
  - **T1.5 :** nouveau champ `type` dans le modèle de fiche (`escape-game`, `chasse-au-tresor`…), dont la liste doit pouvoir s'étendre sans refonte du schéma ;
  - **T1.6 :** catalogue filtrable par type de jeu ;
  - **T1.13 :** la recherche de mots-clés, centrée sur les escape games et les murder parties, est à compléter pour les chasses au trésor. Les slugs de collections proposés (`/escape-game-halloween`…) enferment chaque saison dans un seul type de jeu : **l'agent propose une structure qui couvre plusieurs types** (par exemple une page Halloween qui regroupe tous les types, et des pages par type), **à valider par l'équipe**.

**Raison :** décision de l'équipe. L'intégrer avant T1.5 évite une migration du schéma et une refonte des URL déjà indexées plus tard.

## D16 — Maintenance du staging par un conteneur d'outils, kits hors de Git
*Décidé par l'équipe le 15/09/2026 (clôture de T1.5).*
**Décision :**
- Migrations et import des jeux passent par un service Compose `tools` (profil « tools », `run --rm`), construit sur une étape dédiée du Dockerfile, avec sources et dépendances de développement. L'image de production n'en contient rien.
- `STORAGE_PRIVATE_DIR` est fixé à `/data/private` dans le Compose pour l'app et `tools`, quel que soit le `.env`.
- `/data/private` appartient à l'utilisateur de l'app (uid 1001). Un volume déjà existant se corrige une seule fois avec `chown` (voir README).
- Les `kit.pdf` sont exclus de Git ; seul le kit du jeu factice est versionné. Sur le staging, les vrais kits sont copiés à la main dans le dossier du jeu avant l'import.
- `import-games` ne retire le kit local qu'une fois la base à jour.

**Raison :** l'agent n'avait prévu aucun moyen d'appliquer les migrations sur le staging. Les kits sont les produits vendus et ne doivent jamais se retrouver sur GitHub. Sans le bon propriétaire de volume, l'app ne pourrait pas écrire les factures (T1.8).
