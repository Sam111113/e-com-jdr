# Suivi d'avancement

## Tableau des tâches — Phase 1

| ID | Tâche | Statut | Agent |
|---|---|---|---|
| T1.1 | Audit du VPS (lecture seule) | Terminée | Agent (données fournies par l'équipe depuis l'hôte) |
| T1.2 | Plan technique **[VALIDATION ÉQUIPE]** | Terminée, **validée le 15/09 avec amendements** | Agent |
| T1.3 | Socle technique et staging | En attente de déploiement par l'équipe (code prêt, testé dans le conteneur de l'agent) | Agent (worktree `main`, port 3100) |
| T1.4 | Directions visuelles **[VALIDATION ÉQUIPE]** | À faire | — |
| T1.5 | Base de données et import des jeux | À faire | — |
| T1.6 | Pages du site | À faire | — |
| T1.7 | Interrupteur de vente et configuration légale | À faire | — |
| T1.8 | Achat et livraison (Stripe test) | À faire | — |
| T1.9 | Jeu gratuit, listes d'attente et newsletter | À faire | — |
| T1.10 | Admin minimale | À faire | — |
| T1.11 | Brouillons des pages légales | À faire | — |
| T1.12 | SEO technique | À faire | — |
| T1.13 | Mots-clés et calendrier éditorial | À faire | — |
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
