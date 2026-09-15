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

## D6 — HTTPS : décision non prise, laissée à l'équipe
**Décision :** aucune option n'est retenue à ce stade (voir `docs/PLAN.md`, section « Options pour le HTTPS »). L'agent recommande l'option A (réutiliser Traefik existant via labels + réseau `n8n_default`) mais attend la validation explicite de l'équipe avant de coder le reverse proxy, car cela relie nos conteneurs au réseau de n8n (AGENTS.md section 8 : « c'est une décision de l'équipe »).
**Raison :** contrainte explicite d'AGENTS.md section 8.

## D7 — Répartition agent / workers
**Décision :** l'agent garde pour lui les décisions d'architecture et le code critique (paiement, webhook Stripe, factures, sécurité, authentification admin, configuration légale). Le reste (pages, scripts d'import, tests, SEO technique, recherche de mots-clés) est délégué à `worker-code`, `worker-web` et relu par `worker-review` selon le tableau de `docs/PLAN.md`.
**Raison :** exigence explicite d'AGENTS.md section 8 (budget API limité) et bonne pratique de séparation entre code sensible et code cadré.
