# À faire par l'équipe

> Classé par phase, puis par urgence. L'agent ne peut pas réaliser ces points lui-même (accès aux comptes, décisions engageant l'équipe, ou hors de son périmètre technique).

---

## Phase 1 — Fait le 15/09/2026

- [x] **Plan (T1.2) validé**, avec amendements (voir `docs/DECISIONS.md`, D6 à D10).
- [x] **HTTPS décidé** : Tailscale Serve pour le staging, Caddy sur le futur VPS de production. Plus de DNS à configurer en phase 1.
- [x] **Dépôt Git distant confirmé** : `github.com/Sam111113/e-com-jdr`.
- [x] **PostgreSQL 18 et Chromium installés** dans le conteneur de l'agent (bases de dev et de test, tests E2E Playwright).

## Phase 1 — Urgent (bloque des tâches)

- [ ] **Déployer le staging sur l'hôte (T1.3 prête, en attente de déploiement).** L'agent a préparé le socle technique (Next.js + Tailwind, `docker/docker-compose.yml`, page provisoire protégée par mot de passe et `noindex`, testée avec Playwright dans son conteneur). **Commandes exactes** : section « Déploiement du staging » du `README.md`. Résumé :
  1. `git clone` du dépôt sur l'hôte (branche `main`), `cp .env.example .env`, remplir les valeurs (mot de passe du site, mot de passe Postgres, secret Umami), `chmod 600 .env`.
  2. `docker compose -f docker/docker-compose.yml build && docker compose -f docker/docker-compose.yml up -d`.
  3. Vérifier en local sur l'hôte (`curl` sur `127.0.0.1:3000` et `127.0.0.1:3001`, voir README).
  4. `tailscale serve --bg --https=8444 http://127.0.0.1:3000`.
  5. Confirmer à l'agent que `https://srv1214588.taild2e4d0.ts.net:8444` répond bien (401 sans mot de passe, 200 avec) depuis un appareil du tailnet.
  *Bloque le passage de T1.3 à « terminée » dans `docs/PROGRESS.md`, et bloque T1.14/T1.15 (dépendent de T1.3 déployée).*
- [ ] **Créer un compte Stripe** (même non activé, le mode test suffit) et écrire les clés **test** dans le `.env` du VPS. *Nécessaire pour T1.8.*
- [ ] **Installer Stripe CLI dans le conteneur de l'agent** (image `opencode-local`) avant T1.8 : le staging n'étant pas joignable par Stripe, les webhooks passent par `stripe listen --forward-to`.
- [ ] **Créer un compte Brevo** et écrire la clé API dans le `.env` du VPS. *Nécessaire pour T1.9.*
- [ ] **Choisir la destination des sauvegardes hors du VPS** (T1.15) : service externe (ex. Backblaze B2, autre serveur) — création de compte par l'équipe si besoin.

## Phase 1 — Non bloquant

- [ ] **Compléter la section 0 « Tout de suite » d'`AGENTS.md`** : nom de la marque, email de contact public, contact pour les validations. *Laissée vide volontairement pour l'instant ; l'agent utilise des valeurs provisoires clairement marquées.*
- [ ] **Faire valider le format des numéros de facture** (`F-000001` / `A-000001`, sans remise à zéro annuelle) par l'équipe ou son comptable. Le mécanisme sans rupture est déjà imposé (D8), seul le format est à confirmer.

## Phase 1 — Important (à fournir avant les jalons correspondants)

- [ ] **Valider une direction visuelle** parmi les deux propositions de T1.4 (vers le 18/09 selon le jalon du fichier de phase).
- [ ] **Fournir le premier vrai jeu** (fiche + PDF + visuels) vers le 01/10. En attendant, l'agent utilise un jeu factice clairement marqué comme tel.
- [ ] **Décider du modèle d'authentification admin** (T1.10) : compte partagé simple ou comptes nominatifs dès la phase 1 ?

## Phase 1 — Plus tard mais à anticiper

- [ ] **Mentions légales de pré-lancement (phase 2, T1.11/T2.2)** : tant que l'entreprise n'existe pas, indiquer qui sera nommé comme responsable de la publication. L'hébergeur à mentionner sera celui du **futur VPS de production** (le VPS actuel, chez Hostinger, ne sert qu'au développement).

---

## Phase 2 — À préparer

- [ ] **Provisionner le VPS de production et acheter le domaine** avant la vitrine publique (jalon vers le 30/09). *Sans eux, la phase 2 ne peut pas démarrer.*
- [ ] Accès à Google Search Console (ou ajout d'un enregistrement DNS de vérification).
- [ ] Enregistrements DNS SPF, DKIM, DMARC pour Brevo (si l'agent n'a pas d'accès direct au DNS).
- [ ] Textes et photos pour la page « à propos ».
- [ ] Validation des pages légales de pré-lancement avant mise en ligne publique.
- [ ] Validation de la mise en ligne publique (T2.4) et des 3 premiers articles de blog.

---

## Phase 3 — Ouverture des ventes (ne pas attendre pour avancer, mais à préparer)

- [ ] Infos légales complètes : nom, statut (micro-entreprise / SAS), SIRET, adresse, régime de TVA.
- [ ] Coordonnées du médiateur de la consommation.
- [ ] Clés Stripe **live**, écrites directement dans le `.env` de production par l'équipe (jamais transmises dans la conversation).
- [ ] Validation des mentions légales et CGV définitives.
- [ ] Réaliser un vrai achat de test en production, puis son remboursement (T3.7).
- [ ] Validation de l'email d'annonce avant envoi (T3.8).

---

## Rappel
- L'agent ne demande jamais que des clés ou secrets soient collés dans la conversation : ils vont directement dans le `.env` du VPS (droits 600).
- L'agent ne crée aucun compte sur un service externe (Stripe, Brevo, Cloudflare, hébergeur de sauvegardes…) : c'est à l'équipe de le faire.
