# Brief agent : site e-commerce de jeux à imprimer + SEO

> Fichier général. Relis-le au début de chaque session, puis lis le fichier de la **phase en cours**.

**Phase en cours : 1**  ← l'équipe met à jour cette ligne

---

## 0. Informations à compléter (par l'équipe)

### Tout de suite
- **Nom de la marque :** [À COMPLÉTER]
- **Domaine :** [À COMPLÉTER]. DNS géré chez : [OVH / Cloudflare / autre]
- **Email de contact public :** [À COMPLÉTER]
- **Dépôt Git distant :** [URL, ou « aucun, Git local »]
- **Contact pour les validations :** [prénom + canal : Discord, email…]

### Plus tard (phase 3 : ouverture des ventes)
N'attends pas ces informations pour avancer. En attendant, mets des **valeurs provisoires regroupées dans un seul fichier de configuration** (voir section 4).
- **Infos légales :** nom, statut (micro-entreprise / SAS), SIRET, adresse, régime de TVA
- **Médiateur de la consommation**
- **Clés Stripe live**

**Clés et secrets :** l'équipe les écrit elle-même dans le fichier `.env` du VPS. Ne demande jamais qu'on te les colle dans la conversation.

---

## 1. Contexte et rôles

Nous sommes une petite équipe française. Nous créons des **jeux à imprimer** : escape games, **chasses au trésor**, murder parties, jeux d'enquête et de rôle, et d'autres types de jeux à venir. Les clients les achètent en ligne et les téléchargent en PDF.

- **L'équipe** crée les jeux (scénarios, énigmes, mise en page, tests). Elle fournit les PDF, les visuels et les fiches descriptives.
- **Toi, l'agent,** tu prends en charge **le site e-commerce** : conception, développement, déploiement sur ce VPS et maintenance. Tu prends aussi en charge **le SEO**, technique et contenu.

**Le projet couvre plusieurs saisons :**
- Halloween (samedi 31/10/2026) ;
- Noël ;
- Saint-Valentin ;
- Pâques ;
- un catalogue permanent : anniversaires enfants et ados, soirées adultes, EVJF/EVG, puis une offre pro.

**Thème prioritaire pour l'instant : Halloween.** Les autres saisons viendront ensuite.

**Cible :** parents qui organisent des fêtes et groupes d'amis adultes, en France. Le trafic viendra surtout du **mobile** (Pinterest, TikTok, Instagram, Google).

---

## 2. Les phases

L'équipe a choisi de **tout construire d'abord** et de gérer l'administratif **en dernier** : création de l'entreprise, infos légales, paiement réel.

Conçois donc le site pour que **l'ouverture des ventes prenne moins de 48 h** une fois les infos administratives reçues.

Date de rédaction du brief : 15/09/2026.

| Phase | Objectif | Quand | Fichier |
|---|---|---|---|
| **1. Construction** | Tout le site développé et testé sur le staging, Stripe en mode test | 15/09 → 28/09 | `docs/phases/phase-1-construction.md` |
| **2. Vitrine publique** | Site en ligne sans vente : catalogue, blog, listes d'attente, SEO | vers le 30/09, puis en continu | `docs/phases/phase-2-vitrine.md` |
| **3. Ouverture des ventes** | Infos administratives intégrées, paiement réel activé | date fixée par l'équipe | `docs/phases/phase-3-ouverture-ventes.md` |
| **4. Évolutions** | Nouvelles fonctionnalités et routine saisonnière | après l'ouverture | `docs/phases/phase-4-evolutions.md` |

### Comment utiliser les fichiers de phase
- **Contenu de chaque fichier :**
  - objectif et prérequis ;
  - jalons ;
  - pistes parallèles ;
  - ce que l'équipe fournit ;
  - tâches numérotées (T1.1, T1.2…) avec leurs dépendances et un critère « Terminé quand » ;
  - checklist de fin de phase.
- **Travaille uniquement sur la phase en cours.** Ne commence pas une tâche d'une phase suivante sans demande explicite.
- **Respecte les dépendances** entre tâches.
- **Si plusieurs sessions ou sous-agents travaillent en même temps :**
  - suivez les pistes parallèles ;
  - une tâche n'est prise que par un seul agent à la fois ;
  - notez qui a pris quelle tâche dans `docs/PROGRESS.md`.
- **Une tâche est terminée quand :**
  - son critère « Terminé quand » est rempli ;
  - les tests passent ;
  - `docs/PROGRESS.md` est à jour ;
  - le travail est commité.
- Les tâches marquées **[VALIDATION ÉQUIPE]** s'arrêtent là : tu attends l'accord de l'équipe avant de continuer ce qui en dépend.
- **À la fin de chaque session**, résume : ce qui est fait, la prochaine tâche, ce qui bloque côté équipe.

---

## 3. Règles de fonctionnement

### Autonomie
Tu avances seul sur le code, le contenu et le staging. **Demande une validation explicite AVANT de :**
- modifier SSH, le pare-feu ou les utilisateurs système, ou arrêter/supprimer un service déjà présent sur le VPS ;
- supprimer des données (base, fichiers, sauvegardes) ;
- mettre le site en ligne publiquement sur le vrai domaine (phase 2) ;
- utiliser les clés Stripe **live** ou passer `SALES_ENABLED` à `true` en production ;
- envoyer des emails à de vrais clients, aux listes d'attente ou à la newsletter ;
- publier les **3 premiers articles** de blog (pour caler le ton) ;
- dépenser de l'argent ou créer un compte sur un service externe. C'est l'équipe qui crée les comptes.

### Fichiers de suivi (à mettre à jour à chaque session)
- `docs/PROGRESS.md` :
  - tableau de toutes les tâches (ID, statut : à faire / en cours / bloquée / terminée, agent qui la traite) ;
  - journal daté en dessous.
- `docs/A_FAIRE_EQUIPE.md` : ce que seule l'équipe peut faire. Pour chaque point : l'action exacte attendue, la phase et l'urgence.
- `docs/DECISIONS.md` : les choix techniques et leurs raisons.
- `docs/PLAN.md` : le plan technique (créé en T1.2).
- `README.md` : lancer le site en local, déployer, **ajouter un jeu**, **ouvrir les ventes**, restaurer une sauvegarde.

### Git
- Commits petits, avec des messages clairs qui citent l'ID de la tâche (ex. `T1.8 webhook Stripe idempotent`).
- **Aucun secret dans le dépôt** : `.env` est ignoré, fournis un `.env.example`.

### Interdits
- Faux avis, faux témoignages, fausses statistiques.
- Fausse urgence : faux compte à rebours, « plus que 3 exemplaires » sur un produit numérique.
- Prix barré sans prix de référence réel. Le prix de référence est le prix le plus bas des 30 derniers jours.
- Parler de « précommande » ou encaisser de l'argent avant la phase 3.
- **Inventer des caractéristiques d'un jeu** (nombre de joueurs, durée, âge, contenu). Seules les fiches de l'équipe font foi.
- Copier les textes ou images de concurrents. Utiliser des images, polices ou musiques sans licence commerciale.
- Produire du contenu SEO en masse sans valeur. Google pénalise ce type de contenu.

---

## 4. Stack technique

Tu peux proposer mieux dans `docs/PLAN.md`, en justifiant.

- **Site :** Next.js (App Router, TypeScript, rendu serveur ou statique pour le SEO) + Tailwind CSS.
- **Base de données :** PostgreSQL + Drizzle ORM.
- **Paiement :** Stripe Checkout (page de paiement hébergée par Stripe).
  - Les prix viennent de notre base via `price_data`, sans synchroniser le catalogue avec Stripe.
  - Codes promo Stripe activés.
  - Phases 1 et 2 : **clés de test uniquement**, sur le staging.
- **Interrupteur de vente :** variable d'environnement `SALES_ENABLED`, à `false` en production jusqu'à la phase 3.
- **Infos légales centralisées :** un seul fichier de configuration (par exemple `config/entreprise.ts`). Les mentions légales, CGV, factures et emails y lisent leurs valeurs.
- **Emails :** Brevo pour les listes d'attente, la newsletter et les emails de commande. Pas de serveur mail auto-hébergé.
- **Fichiers PDF :**
  - dossier privé sur le VPS, jamais servi en statique ;
  - accès via une interface `storage` pour pouvoir passer à S3 ou R2 plus tard ;
  - pdf-lib pour ajouter l'email de l'acheteur en filigrane.
- **Statistiques :** Umami auto-hébergé, sans cookies.
- **Déploiement :** Docker Compose (app, postgres, umami) + Caddy pour le HTTPS automatique.
- **Environnements :**
  - `staging.[DOMAINE]` : protégé par mot de passe, en `noindex`, Stripe en mode test, ventes activées pour tester ;
  - `[DOMAINE]` : production, en vitrine jusqu'à la phase 3.
- **Tests :** tests unitaires + tests E2E Playwright (Stripe CLI pour simuler les webhooks).

---

## 5. Principes de design

- **Mobile d'abord.**
- **Ambiance** ludique et mystérieuse, qui parle aux parents comme aux adultes.
- **Identité de marque stable**, avec des couleurs d'accent par saison en variables CSS (Halloween, Noël…).
- **Thème clair et thème sombre**, qui suit automatiquement le réglage de l'appareil du visiteur (`prefers-color-scheme`). Les contrastes et les couleurs d'accent saisonnières doivent être valides dans les deux thèmes.
- **Accessibilité de base :** contrastes, textes alternatifs, navigation au clavier, textes lisibles.
- **Performance :** score Lighthouse mobile ≥ 90 sur les pages principales, images AVIF ou WebP, aucun script tiers inutile.

---

## 6. Principes SEO

- **Sois réaliste :** un domaine neuf met plusieurs mois à se positionner. C'est pour ça que le site passe en vitrine publique dès la phase 2, avant l'administratif. Le SEO vise surtout **Noël 2026** et **Halloween 2027**.
- **URLs permanentes** pour les pages saisonnières. On les met à jour chaque année, jamais de `/halloween-2026`.
- **Qualité plutôt que quantité :** 2 à 3 articles utiles par semaine, jamais de contenu creux.
- **Contenu fiable :** aucune information de jeu inventée, aucune donnée structurée mensongère (disponibilité, avis).
- **Staging jamais indexable :** `noindex` **et** mot de passe.

---

## 7. Sécurité et RGPD

- **Base et secrets :**
  - Postgres **jamais exposé** sur Internet ;
  - secrets dans `.env` avec les droits 600.
- **Protection du site :**
  - en-têtes de sécurité (CSP, HSTS…) ;
  - dépendances à jour ;
  - limitation du nombre de requêtes sur les routes sensibles ;
  - logs sans données sensibles.
- **Sauvegardes quotidiennes** avec copie hors du VPS, et restauration testée.
- **RGPD :**
  - données minimales ;
  - consentements séparés et désinscription possible ;
  - aucun traceur publicitaire (pixels Meta ou TikTok) sans bandeau de consentement conforme CNIL.
- **Tu n'es pas juriste :** tout texte légal est un brouillon à faire valider par l'équipe.

---

## 8. Contraintes de l'infrastructure réelle

> Section ajoutée après audit du VPS, mise à jour le 15/09/2026 après validation du plan. En cas de conflit, elle prime sur la section 4.

- **Ce VPS sert au développement et au staging uniquement.** La production aura son propre VPS, provisionné plus tard par l'équipe avec le domaine définitif. Le domaine et le DNS ne bloquent pas la phase 1.
- **Tu tournes dans un conteneur OpenCode (Alpine Linux), pas directement sur le VPS.**
  - Tu n'as ni Docker ni accès au système hôte : `uname`, `df` ou `ps` décrivent ton conteneur, pas le VPS.
  - Ton dépôt est dans `/root/workspace/e-com-jdr`, partagé avec l'hôte. Tu disposes de git, Node 24, npm, Python 3 et curl.
- **Base de données de développement et de test**, dans ton conteneur, jamais exposée : **PostgreSQL 18**.
  - `DEV_DATABASE_URL` → base `ecomjdr_dev` ;
  - `TEST_DATABASE_URL` → base `ecomjdr_test`, que les tests peuvent vider librement.
  - Utilise aussi PostgreSQL 18 (image `postgres:18`) dans les Docker Compose de staging et de production.
- **Tests E2E :** Playwright fonctionne dans ton conteneur avec le Chromium du système. Passe `launchOptions: { executablePath: process.env.CHROMIUM_PATH }`. Le téléchargement des navigateurs Playwright est désactivé (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`).
- **Staging, accessible uniquement via Tailscale** (réseau privé de l'équipe, aucune exposition publique) :
  - l'app est publiée sur `127.0.0.1:3000` de l'hôte et servie en HTTPS sur `https://srv1214588.taild2e4d0.ts.net:8444` ;
  - Umami est publié sur `127.0.0.1:3001` ;
  - garde quand même le mot de passe et le `noindex` exigés par la section 4 ;
  - **webhooks Stripe :** Stripe ne peut pas joindre le staging, utilise Stripe CLI (`stripe listen --forward-to`) ;
  - les liens envoyés par Brevo (double opt-in, téléchargements) ne s'ouvrent que depuis un appareil du tailnet : c'est normal en staging.
- **Déploiement :** tu écris les fichiers (Docker Compose, configuration, scripts de sauvegarde) et les commandes exactes dans le README. **L'équipe les exécute sur l'hôte.** Ajoute chaque action à lancer dans `docs/A_FAIRE_EQUIPE.md`. Ne marque pas une tâche terminée tant que l'équipe n'a pas confirmé le résultat.
- **Services à ne jamais toucher sur ce VPS : n8n et son reverse proxy Traefik** (ports 80 et 443). **Ne relie jamais tes conteneurs au réseau `n8n_default`.** En production, sur son propre VPS, Caddy occupera 80/443 comme prévu en section 4.
- **Ports déjà pris sur l'hôte :** 22, 80, 443, 5678 (n8n), 4096 (OpenCode), 8443 (Tailscale → OpenCode). **Réservés au staging :** 3000, 3001, 8444.
- **Git :** tu pousses uniquement sur `github.com/Sam111113/e-com-jdr`. Chaque `git push` demande une approbation dans l'interface.
- **Budget API limité.** Délègue aux workers :
  - `worker-explore` : l'exploration du code ;
  - `worker-web` : la recherche web et la collecte SEO ;
  - `worker-review` : la relecture ;
  - `worker-code` : le code simple et bien cadré uniquement.

  Garde pour toi les décisions et le code critique : paiement, webhooks, factures, sécurité.
