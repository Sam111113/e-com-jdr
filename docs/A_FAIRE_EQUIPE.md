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
- [x] **Statistiques Umami branchées** (T1.14) : visites et événement de contact remontent déjà. **Reste à faire par vous :** changer le mot de passe administrateur d'Umami, resté aux identifiants par défaut (`admin` / `umami`) — l'agent n'a pas le droit de modifier un mot de passe lui-même. Accessible en SSH sur le VPS via `http://127.0.0.1:3001` (ou en tunnel SSH depuis votre poste).

## Pour chaque nouveau jeu (créateur des jeux)

- Fournir le dossier du jeu (`fiche.md` d'après `content/_modele/fiche.md`, `cover.jpg`, `apercu-*.jpg`, `kit.pdf`).
- **Transmettre `kit.pdf` hors de Git** (c'est le produit vendu) : il est copié à la main dans le dossier du jeu sur le staging, puis rangé dans le stockage privé par l'import.
- Durées, préparation, nombre de joueurs, âge et matériel : fixés par le créateur du jeu dans la fiche, jamais par le site.

## Phase 1 — Urgent (bloque des tâches)

- [ ] **Créer un compte Stripe** (même non activé, le mode test suffit) et écrire les clés **test** dans le `.env` du VPS. *Nécessaire pour T1.8.*
- [ ] **Installer Stripe CLI dans le conteneur de l'agent** (image `opencode-local`) avant T1.8 : le staging n'étant pas joignable par Stripe, les webhooks passent par `stripe listen --forward-to`.
- [ ] **Créer un compte Brevo** et écrire la clé API dans le `.env` du VPS. *Nécessaire pour T1.9.*
- [ ] **Choisir la destination des sauvegardes hors du VPS** (T1.15) : service externe (ex. Backblaze B2, autre serveur) — création de compte par l'équipe si besoin.

## Phase 1 — Non bloquant

- [ ] **Compléter la section 0 « Tout de suite » d'`AGENTS.md`** : nom de la marque, email de contact public, contact pour les validations. *Laissée vide volontairement pour l'instant ; l'agent utilise des valeurs provisoires clairement marquées.*
- [ ] **Faire valider le format des numéros de facture** (`F-000001` / `A-000001`, sans remise à zéro annuelle) par l'équipe ou son comptable. Le mécanisme sans rupture est déjà imposé (D8), seul le format est à confirmer.

## Phase 1 — Important (à fournir avant les jalons correspondants)

- [ ] **Valider la structure des pages collections** que l'agent proposera en révisant T1.13 pour couvrir plusieurs types de jeu (D15). *Nécessaire avant T1.6.*
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

- [ ] **Compléter `config/entreprise.ts`** (raison sociale, forme juridique, SIRET, adresse, email de contact, médiateur de la consommation, hébergeur, directeur de publication) : chaque champ encore marqué `"À COMPLÉTER"` bloque le build dès que `SALES_ENABLED=true` (T1.7).
- [ ] Clés Stripe **live**, écrites directement dans le `.env` de production par l'équipe (jamais transmises dans la conversation).
- [ ] Validation des mentions légales et CGV définitives.
- [ ] Réaliser un vrai achat de test en production, puis son remboursement (T3.7).
- [ ] Validation de l'email d'annonce avant envoi (T3.8).

---

## Rappel
- L'agent ne demande jamais que des clés ou secrets soient collés dans la conversation : ils vont directement dans le `.env` du VPS (droits 600).
- L'agent ne crée aucun compte sur un service externe (Stripe, Brevo, Cloudflare, hébergeur de sauvegardes…) : c'est à l'équipe de le faire.
