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
