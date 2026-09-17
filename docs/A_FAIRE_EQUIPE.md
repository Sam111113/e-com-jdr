# À faire par l'équipe

> Classé par phase, puis par urgence. L'agent ne peut pas réaliser ces points lui-même (accès aux comptes, décisions engageant l'équipe, ou hors de son périmètre technique).

---

## Phase 1 — Fait le 15/09/2026

- [x] **Plan (T1.2) validé**, avec amendements (voir `docs/DECISIONS.md`, D6 à D10).
- [x] **HTTPS décidé** : Tailscale Serve pour le staging, Caddy sur le futur VPS de production. Plus de DNS à configurer en phase 1.
- [x] **Dépôt Git distant confirmé** : `github.com/Sam111113/e-com-jdr`.
- [x] **PostgreSQL 18 et Chromium installés** dans le conteneur de l'agent (bases de dev et de test, tests E2E Playwright).
- [x] **Staging déployé et vérifié** (T1.3) : `https://srv1214588.taild2e4d0.ts.net:8444`, tailnet uniquement, depuis `/root/apps/e-com-jdr-staging`. Mise à jour : section « Déploiement du staging » du `README.md`, étape 5.
- [x] **Direction visuelle choisie** (T1.4) : direction B, avec thème sombre automatique en plus (D14).
- [x] **Types de jeu élargis** : escape games, chasses au trésor et autres ; thème prioritaire Halloween (D15).
- [x] **Structure des pages collections validée** (T1.13, D17), murder party comprise, et **ton éditorial validé** (les 3 articles ont été réécrits en conséquence).
- [x] **Base de données du staging en place** (T1.5) : migrations appliquées, jeu factice importé. Procédure : `README.md`, sections « Ajouter un jeu » et « Base de données : migrations et import ».

## Phase 1 — Fait le 16/09/2026

- [x] **Feu vert donné aux 3 articles réécrits** (`content/blog/`) : plus rien ne bloque leur publication le moment venu (reste soumise à l'ouverture de la vitrine, phase 2).
- [x] **Pages du site livrées** (T1.6) : accueil, catalogue filtrable, fiche jeu, pages collections (D17), pages annexes. Détail dans `docs/PROGRESS.md`.
- [x] **Interrupteur de vente en place** (T1.7) : `config/entreprise.ts` centralise désormais toutes les infos légales à compléter (voir ligne juste en dessous). Le bouton « Acheter » ne s'activera qu'une fois ces champs remplis **et** le site reconstruit (`SALES_ENABLED=true`) — un simple `.env` ne suffit pas (D11, D19), volontairement.
- [x] **SEO technique en place** (T1.12) : sitemap, robots.txt, canonical, Open Graph/Twitter Card, données structurées (JSON-LD), redirections automatiques quand un slug change. Rien à indexer avant `T2.4` (mise en ligne publique) : le staging reste protégé par mot de passe (D13, D20).
- [x] **Statistiques Umami branchées** (T1.14) : visites et événement de contact remontent déjà. **Mot de passe Umami changé le 17/09/2026.**
- [x] **Sécurité et sauvegardes en place** (T1.15) : en-têtes de sécurité, limiteur de requêtes, sauvegardes quotidiennes avec restauration réellement testée (voir `docs/PROGRESS.md`). **Compte admin Uptime Kuma créé le 17/09/2026.** Reste à confirmer que le moniteur + la notification + l'alerte de test sont bien en place (fait de votre côté, pas revérifié par l'agent qui n'a pas accès à l'interface Uptime Kuma).

## Pour chaque nouveau jeu (créateur des jeux)

- Fournir le dossier du jeu (`fiche.md` d'après `content/_modele/fiche.md`, `cover.jpg`, `apercu-*.jpg`, `kit.pdf`).
- **Transmettre `kit.pdf` hors de Git** (c'est le produit vendu) : il est copié à la main dans le dossier du jeu sur le staging, puis rangé dans le stockage privé par l'import.
- Durées, préparation, nombre de joueurs, âge et matériel : fixés par le créateur du jeu dans la fiche, jamais par le site.

## Phase 1 — Urgent (bloque des tâches)

- [x] **Créer un compte Stripe** (même non activé, le mode test suffit) et écrire les clés **test** dans le `.env` du VPS. *Fait — `STRIPE_SECRET_KEY`/`STRIPE_PUBLISHABLE_KEY` présentes et au bon format.*
- [x] **Installer Stripe CLI** sur le VPS (`stripe` v1.50.11 disponible). ⚠️ **`STRIPE_WEBHOOK_SECRET` dans le `.env` du staging était une valeur invalide** (ne correspondait à aucun format Stripe reconnu, `stripe listen --print-secret` donne une tout autre valeur) — corrigée par l'agent le 17/09/2026 ; à vérifier que c'est bien la bonne avant le premier vrai webhook.
- [ ] ⚠️ **`BREVO_API_KEY` invalide, confirmé par un vrai test le 17/09/2026** (inscription réelle sur `/jeu-gratuit`, réponse Brevo : `401`). Le double opt-in fonctionne bien de bout en bout côté site (l'inscription en base est créée), mais aucun email de confirmation ne peut réellement partir tant que cette clé n'est pas corrigée. Régénérer une clé API valide dans Brevo et la remplacer dans le `.env` du staging.
- [x] **Destination des sauvegardes hors du VPS choisie : Backblaze B2** (17/09/2026). `rclone` installé sur le VPS, `docker/sauvegarde.sh` sait déjà copier vers B2 — **reste à renseigner `B2_BUCKET`/`B2_KEY_ID`/`B2_APPLICATION_KEY` dans le `.env` du staging** (lignes déjà présentes, vides). Utilisez une "Application Key" B2 dédiée à ce bucket, jamais la clé maître du compte.
- [ ] **`config/entreprise.ts`** : raison sociale (`raisonSociale: "lpenterprise"`, à reconfirmer — pour une micro-entreprise la raison sociale légale est en général le nom propre du déclarant), forme juridique et email de contact déjà renseignés (17/09). **SIRET, adresse, médiateur et hébergeur restent à compléter** une fois le dossier de micro-entreprise abouti — c'est ce qui bloque encore `SALES_ENABLED=true` (D11) et donc la vérification d'un achat réel sur le staging (T1.8 reste vérifié uniquement par les 127 tests automatisés en attendant).

## Phase 1 — Non bloquant

- [x] **Compléter la section 0 « Tout de suite » d'`AGENTS.md`** : fait le 17/09 (marque PartyHunter, domaine, email de contact, Telegram).
- [ ] **Faire valider le format des numéros de facture** (`F-000001` / `A-000001`, sans remise à zéro annuelle) par l'équipe ou son comptable. Le mécanisme sans rupture est déjà imposé (D8), seul le format est à confirmer.
- [ ] **Nouveau (T1.9) : une page « bientôt disponible » par jeu précis** (pas seulement par saison) demanderait un nouvel état de catalogue (`games.status` n'a que `brouillon`/`publie`) — pas construit faute d'un jeu à venir réel pour le justifier. À revoir quand un deuxième jeu sera annoncé avant sa sortie.

## Phase 1 — Important (à fournir avant les jalons correspondants)

- [ ] **Valider la structure des pages collections** que l'agent proposera en révisant T1.13 pour couvrir plusieurs types de jeu (D15). *Nécessaire avant T1.6.*
- [ ] **Fournir le premier vrai jeu** (fiche + PDF + visuels) vers le 01/10. En attendant, l'agent utilise un jeu factice clairement marqué comme tel.
- [x] **Modèle d'authentification admin décidé** (T1.10, 17/09/2026) : compte unique et nominatif (micro-entreprise, un seul admin). Fondations codées et déployées (connexion, session, protection des pages). **Reste à faire par vous : créer votre compte** — voir `README.md`, section « Admin », commande `npm run create-admin` (l'agent ne choisit jamais votre mot de passe).

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

- [ ] **Compléter `config/entreprise.ts`** (raison sociale, forme juridique, SIRET, adresse, email de contact, médiateur de la consommation, hébergeur, directeur de publication) : chaque champ encore marqué `"À COMPLÉTER"` bloque le build dès que `SALES_ENABLED=true` (T1.7).
- [ ] Clés Stripe **live**, écrites directement dans le `.env` de production par l'équipe (jamais transmises dans la conversation).
- [ ] Validation des mentions légales et CGV définitives.
- [ ] Réaliser un vrai achat de test en production, puis son remboursement (T3.7).
- [ ] Validation de l'email d'annonce avant envoi (T3.8).

---

## Rappel
- L'agent ne demande jamais que des clés ou secrets soient collés dans la conversation : ils vont directement dans le `.env` du VPS (droits 600).
- L'agent ne crée aucun compte sur un service externe (Stripe, Brevo, Cloudflare, hébergeur de sauvegardes…) : c'est à l'équipe de le faire.
