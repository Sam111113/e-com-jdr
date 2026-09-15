# Suivi d'avancement

## Tableau des tâches — Phase 1

| ID | Tâche | Statut | Agent |
|---|---|---|---|
| T1.1 | Audit du VPS (lecture seule) | Terminée | Agent (données fournies par l'équipe depuis l'hôte) |
| T1.2 | Plan technique **[VALIDATION ÉQUIPE]** | Terminée, **validée le 15/09 avec amendements** | Agent |
| T1.3 | Socle technique et staging | **Terminée — déployée et vérifiée par l'équipe le 15/09** (`https://srv1214588.taild2e4d0.ts.net:8444`, tailnet uniquement) | Agent (worktree `main`, port 3100) |
| T1.4 | Directions visuelles **[VALIDATION ÉQUIPE]** | **Terminée — direction B choisie le 15/09, avec thème sombre automatique en plus (D14)** | Agent (branche `t1.4-design`, fusionnée) |
| T1.5 | Base de données et import des jeux | À faire | — |
| T1.6 | Pages du site | À faire | — |
| T1.7 | Interrupteur de vente et configuration légale | À faire | — |
| T1.8 | Achat et livraison (Stripe test) | À faire | — |
| T1.9 | Jeu gratuit, listes d'attente et newsletter | À faire | — |
| T1.10 | Admin minimale | À faire | — |
| T1.11 | Brouillons des pages légales | À faire | — |
| T1.12 | SEO technique | À faire | — |
| T1.13 | Mots-clés et calendrier éditorial | Livrée sur la branche `t1.13-seo`, **non fusionnée** : 3 articles en attente de validation de l'équipe, et recherche à compléter pour les chasses au trésor (D15) | Agent (branche `t1.13-seo`) |
| T1.14 | Statistiques de visite | À faire | — |
| T1.15 | Sécurité, sauvegardes, surveillance | À faire | — |
| T1.16 | Tests automatisés | À faire | — |

---

## Journal

### 15/09/2026 — Agent
- Lecture d'`AGENTS.md` et de `docs/phases/phase-1-construction.md`.
- Premier commit : brief tel quel (`AGENTS.md`, `docs/phases/`, `opencode.json`).
- **T1.1** : audit consolidé dans `docs/PLAN.md` (section « Audit »), à partir des résultats fournis par l'équipe depuis l'hôte (l'agent n'a pas d'accès direct au VPS depuis son conteneur — AGENTS.md section 8). Rien n'a été modifié.
- **T1.2** : rédaction de `docs/PLAN.md` (architecture, arborescence, schéma de base de données, fonctionnement de `SALES_ENABLED` et de la configuration légale, estimation des tâches, répartition agent/workers, risques, questions ouvertes) ainsi que `docs/PROGRESS.md`, `docs/A_FAIRE_EQUIPE.md` et `docs/DECISIONS.md`.
- **Arrêt demandé par le brief** : T1.1 et T1.2 sont terminées. L'agent attend la validation de l'équipe sur `docs/PLAN.md` avant de commencer T1.3 (bloquée de toute façon par le domaine/DNS et la décision HTTPS — voir `docs/A_FAIRE_EQUIPE.md`).
- **Prochaine tâche** une fois validée : T1.3 (socle technique et staging), en parallèle T1.4 (design) et T1.13 (SEO, sans code).
- **Ce qui bloque côté équipe :** voir `docs/A_FAIRE_EQUIPE.md`, section « Urgent — phase 1 ».

### 15/09/2026 — Équipe
- **T1.2 validée, avec amendements** (détail dans `docs/DECISIONS.md`) :
  - **D6** : ce VPS sert au développement et au staging uniquement, la production aura son propre VPS. Staging via Tailscale Serve (`:8444`), aucun conteneur relié à `n8n_default`, pas de DNS en phase 1.
  - **D8** : numérotation des factures par compteur transactionnel, séquences Postgres interdites.
  - **D9** : PostgreSQL 18 et Chromium installés dans le conteneur de l'agent. Test E2E Playwright vérifié.
  - **D10** : section 0 d'`AGENTS.md` laissée provisoire, dépôt Git confirmé.
- `AGENTS.md` section 8 mise à jour en conséquence.
- **D11** : `SALES_ENABLED` figée au build et revérifiée au démarrage et à chaque paiement (le garde-fou au build seul était contournable).
- **D12** : table `redirects` prévue dès T1.5 pour les 301 de T1.12.
- **Lancement en parallèle** de T1.3 (branche `main`), T1.4 (branche `t1.4-design`) et T1.13 (branche `t1.13-seo`), chacune dans son propre worktree Git. L'équipe fusionnera les branches.
- **Prochaine tâche :** T1.3 (socle technique et staging), en parallèle T1.4 (design) et T1.13 (SEO, sans code).

### 15/09/2026 — Agent (T1.3, worktree `main`, port 3100)
- **Socle Next.js** : App Router + TypeScript + Tailwind CSS v4 (via `create-next-app`), `eslint` propre, `npm run build` et `npm run lint` passent.
- **Protection du staging** : `proxy.ts` (convention Next.js 16, remplace `middleware.ts` déprécié) — HTTP Basic Auth via `STAGING_BASIC_AUTH_USER` / `STAGING_BASIC_AUTH_PASSWORD`, **fail-closed** si absentes ; en-tête `X-Robots-Tag: noindex, nofollow, noarchive` sur toutes les réponses. Meta `robots` `noindex` dans `app/layout.tsx`. `public/robots.txt` interdit tout (`Disallow: /`).
- **`.env.example`** sans aucun secret réel ; respecte D11 (aucune variable `NEXT_PUBLIC_SALES_ENABLED`, `SALES_ENABLED` volontairement absente : elle arrivera avec T1.7).
- **Docker (non exécuté par l'agent, pas de Docker dans son conteneur — AGENTS.md section 8)** : `docker/docker-compose.yml` (app + `postgres:18` sans port publié + Umami), `docker/Dockerfile` (build standalone Next.js), `docker/postgres-init/01-create-umami-db.sh` (base Umami dédiée sur le même serveur Postgres). Réseau `ecomjdr_default` dédié, **aucun lien avec `n8n_default`**. `app` prévu sur `127.0.0.1:3000` de l'hôte, Umami sur `127.0.0.1:3001` (conformément à D6 et à `docs/PLAN.md`).
- **README** : lancement en local (avec `DEV_DATABASE_URL`), vérification du socle sans Docker (spécificité de l'agent), et procédure de déploiement du staging commande par commande jusqu'à `tailscale serve --bg --https=8444 http://127.0.0.1:3000`.
- **Vérification effectuée dans le conteneur de l'agent** (port 3100, jamais 3000/3001/8444 réservés au vrai staging) : `npm run build` puis serveur standalone démarré manuellement (`node .next/standalone/server.js`, avec copie de `public/` et `.next/static/` comme le fait `docker/Dockerfile`). Test E2E Playwright (`tests/e2e/staging-protection.spec.ts`, Chromium système via `CHROMIUM_PATH`) : **3/3 tests passent** — 401 sans authentification, 200 + `X-Robots-Tag: noindex` + meta `robots` noindex une fois authentifié, `robots.txt` accessible et interdisant tout. Serveur de test arrêté après vérification.
- **`docs/A_FAIRE_EQUIPE.md`** mis à jour : commandes exactes de déploiement du staging (section « Urgent »).
- **T1.3 marquée « en attente de déploiement par l'équipe »**, pas terminée : conformément à AGENTS.md section 8, l'agent ne peut pas exécuter `docker compose` ni `tailscale serve` lui-même. **Ce qui bloque :** l'équipe doit exécuter la procédure du README sur l'hôte, puis confirmer que `https://srv1214588.taild2e4d0.ts.net:8444` répond (401 sans mot de passe, 200 avec) depuis un appareil du tailnet.
- **Ce qui reste (autres tâches, hors périmètre T1.3)** : T1.5 (base de données, dépend de T1.3 — peut démarrer dès que le code est mergé, sans attendre le déploiement), T1.14 et T1.15 dépendent en revanche du **déploiement réel** du staging.
- **Rappel :** travail réalisé uniquement dans ce worktree (`main`, port 3100), sans toucher aux autres worktrees (T1.4, T1.13). Pas de push, pas de fusion.

### 15/09/2026 — Agent (branche `t1.4-design`, worktree `/root/workspace/e-com-jdr-t1.4`)
- **T1.4** : deux directions visuelles statiques et autonomes (HTML/CSS, sans dépendance au socle
  Next.js), accueil + fiche jeu, mobile et ordinateur.
  - `design/direction-a/` (« Mystère chaleureux » : thème sombre, `Playfair Display` + `Inter`)
    et `design/direction-b/` (« Ludique pop » : thème clair, `Baloo 2` + `Nunito`). Polices
    Google Fonts (licence OFL) téléchargées et servies localement, aucune image bitmap (formes et
    dégradés CSS uniquement).
  - Contenu de démonstration clairement marqué comme factice : marque provisoire « Le Cabinet des
    Énigmes (nom provisoire) » (section 0 d'AGENTS.md toujours vide) et jeu factice « Le Manoir
    Hurlant », avec bandeau permanent, badges « JEU FACTICE » et mention « (exemple) » sur chaque
    caractéristique. Bouton « Me prévenir de la sortie » (pas « Acheter »).
  - Couleurs d'accent saisonnières en variables CSS `[data-season="…"]` : Halloween et Noël
    (exigés par la section 5 d'AGENTS.md), Saint-Valentin et Pâques ajoutés en bonus pour couvrir
    tout le catalogue permanent (section 1).
  - Contrastes vérifiés (WCAG 2.1, ≥ 4,5:1 pour le texte courant) : un défaut réel a été détecté
    et corrigé pendant la relecture (badge de saison du hero à 2,52:1 en direction B) — détail
    complet dans `design/README.md`.
  - Captures Playwright (Chromium système, `file://`, aucun serveur lancé) : 8 PNG dans
    `design/captures/` (mobile 390×844 et ordinateur 1440×900 × 2 pages × 2 directions).
  - Écriture des maquettes déléguée à `worker-code` avec un cadrage détaillé (palette exacte,
    contenu obligatoire, tokens CSS), puis relue par l'agent (structure, contraste réel des
    couleurs, contenu factice bien marqué) — un correctif d'accessibilité et un ajustement de
    dégradé ont été apportés après la relecture.
  - Outillage de capture (`design/capture.js`, `design/package.json`, Playwright en
    dépendance non versionnée) scindé du futur `package.json` racine du socle Next.js (T1.3) pour
    éviter tout conflit de fusion entre les deux branches.
- **Arrêt demandé par le brief [VALIDATION ÉQUIPE]** : T1.4 est terminée côté agent. En attente
  du choix de l'équipe entre direction A et B (ou un mélange à préciser) avant de noter la
  décision dans `docs/DECISIONS.md` — ce qui débloquera T1.6 (pages du site).
- **Ce qui bloque côté équipe :** choisir une direction visuelle (voir `design/README.md` pour
  les captures et le détail des deux propositions).

### 15/09/2026 — Équipe (relecture des trois livrables)
- **T1.13** relue : conforme (aucun volume de recherche inventé, sources citées, slugs permanents, articles sans jeu ni statistique inventés). Branche `t1.13-seo` **non fusionnée** : les 3 articles attendent la validation de l'équipe, et la recherche doit être complétée pour les chasses au trésor (D15).
- **T1.4 validée : direction B** (« Ludique pop »), **avec un thème sombre automatique en plus** (D14). Branche `t1.4-design` fusionnée dans `main`. Défaut relevé sur les deux maquettes, à corriger lors de l'intégration en T1.6 : **sur ordinateur, la navigation passe sous le logo et se colle au bord gauche de l'écran**. L'agent ne l'a pas vu car il relisait des captures pleine page (2880 × 4700 px), illisibles une fois réduites : relire aussi des captures à la taille de l'écran.
- **D15 : types de jeu élargis** : escape games, **chasses au trésor**, et d'autres types possibles plus tard. **Thème prioritaire : Halloween.** Champ `type` ajouté au modèle de fiche (T1.5).
- **T1.3 relue et testée par l'équipe** : build, mot de passe, `noindex` et fail-closed confirmés. **Cinq défauts de déploiement** trouvés (l'agent n'a pas Docker) et corrigés dans le commit `a0a9635` :
  1. `postgres:18` refusait de démarrer (volume monté sur l'ancien chemin `/var/lib/postgresql/data`) ;
  2. commandes du README sans `--env-file .env` (échec d'interpolation) ;
  3. absence de `.dockerignore` (le `.env` réel partait dans le build) ;
  4. clonage depuis GitHub impossible sur l'hôte (dépôt privé, pas d'identifiants) : clone local vers `/root/apps/e-com-jdr-staging` ;
  5. nom de projet Compose implicite (« docker ») : `name: ecomjdr`.
- **Staging déployé par l'équipe** depuis `/root/apps/e-com-jdr-staging` (clone du dépôt local, `.env` en 600 hors de portée des agents). Vérifications :
  - image sans `.env`, exécutée en utilisateur non privilégié ;
  - Postgres 18 démarré, **données bien dans le volume nommé** `ecomjdr_postgres_data` ;
  - base Umami créée, migrations appliquées, heartbeat 200 ;
  - via le tailnet : 401 sans mot de passe, 200 avec, certificat HTTPS valide, `X-Robots-Tag: noindex`, `robots.txt` servi ;
  - OpenCode (`:8443`) et n8n intacts.
- **T1.3 terminée.** Débloque T1.5, T1.14 et T1.15.
- **Prochaines tâches possibles :** T1.5 (base de données et import, avec le champ `type` de D15), T1.6 (pages, direction B + thème sombre), révision de T1.13 pour les chasses au trésor.
