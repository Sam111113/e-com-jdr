# Suivi d'avancement

## Tableau des tâches — Phase 1

| ID | Tâche | Statut | Agent |
|---|---|---|---|
| T1.1 | Audit du VPS (lecture seule) | Terminée | Agent (données fournies par l'équipe depuis l'hôte) |
| T1.2 | Plan technique **[VALIDATION ÉQUIPE]** | Terminée, **validée le 15/09 avec amendements** | Agent |
| T1.3 | Socle technique et staging | À faire (débloquée ; la validation finale attendra le déploiement par l'équipe) | — |
| T1.4 | Directions visuelles **[VALIDATION ÉQUIPE]** | À faire | — |
| T1.5 | Base de données et import des jeux | À faire | — |
| T1.6 | Pages du site | À faire | — |
| T1.7 | Interrupteur de vente et configuration légale | À faire | — |
| T1.8 | Achat et livraison (Stripe test) | À faire | — |
| T1.9 | Jeu gratuit, listes d'attente et newsletter | À faire | — |
| T1.10 | Admin minimale | À faire | — |
| T1.11 | Brouillons des pages légales | À faire | — |
| T1.12 | SEO technique | À faire | — |
| T1.13 | Mots-clés et calendrier éditorial | En attente de validation équipe (3 articles) | Agent (branche `t1.13-seo`) |
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

### 15/09/2026 — Agent (branche `t1.13-seo`)
- **T1.13** : recherche de mots-clés déléguée à `worker-web` (autocomplétion DuckDuckGo et Bing — Google a renvoyé un captcha au moment de la collecte — et repérage de pages concurrentes, thèmes uniquement, jamais de texte recopié).
- Analyse et rédaction de `docs/seo/mots-cles.md` : requête principale, requêtes secondaires, intention et saisonnalité pour chaque page cible (accueil, catalogue, 8 collections, `/jeu-gratuit`, fiches jeux, blog), avec sources explicites et mentions « estimation qualitative » partout où aucune donnée de recherche fiable n'était disponible (aucun volume inventé).
- **Slugs définitifs proposés** pour les 8 pages collections (pour T1.6) : `/escape-game-halloween`, `/escape-game-noel`, `/escape-game-anniversaire-enfant`, `/escape-game-anniversaire-ado`, `/murder-party-a-imprimer`, `/escape-game-evjf-evg`, `/escape-game-saint-valentin`, `/escape-game-paques`.
- Rédaction de `docs/seo/calendrier.md` : calendrier détaillé semaine par semaine du 15/09 au 02/11/2026 (Halloween le 31/10), puis vue mensuelle jusqu'à Pâques 2027, avec 6 à 8 semaines d'avance par saison comme demandé.
- **3 articles de blog en brouillon** dans `content/blog/` (frontmatter titre/description/date/statut/mots_cles) : `organiser-escape-game-maison.md` (evergreen), `escape-game-halloween-checklist.md` (Halloween), `organiser-murder-party-entre-amis.md` (soirée adulte/murder party). Aucune caractéristique de jeu inventée : les articles restent génériques (conseils pratiques), aucun vrai jeu n'existe encore.
- **T1.13 terminée côté agent, en attente de validation équipe** sur les 3 premiers articles avant toute publication (AGENTS.md section 3). Statut mis à jour dans le tableau ci-dessus.
- **Ce qui bloque côté équipe :** valider (ou amender) les 3 articles et les slugs de collections avant que T1.6 ne les implémente ; confirmer la date de Pâques 2027 (28/03/2027, à vérifier) avant la rédaction des articles de cette saison.
- **Rappel :** cette session ne touche ni au code ni aux autres tâches (T1.3, T1.4 sont traitées dans d'autres worktrees/branches).
