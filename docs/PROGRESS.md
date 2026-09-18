# Suivi d'avancement

## Tableau des tâches — Phase 1

| ID | Tâche | Statut | Agent |
|---|---|---|---|
| T1.1 | Audit du VPS (lecture seule) | Terminée | Agent (données fournies par l'équipe depuis l'hôte) |
| T1.2 | Plan technique **[VALIDATION ÉQUIPE]** | Terminée, **validée le 15/09 avec amendements** | Agent |
| T1.3 | Socle technique et staging | **Terminée — déployée et vérifiée par l'équipe le 15/09** (`https://srv1214588.taild2e4d0.ts.net:8444`, tailnet uniquement) | Agent (worktree `main`, port 3100) |
| T1.4 | Directions visuelles **[VALIDATION ÉQUIPE]** | **Terminée — direction B choisie le 15/09, avec thème sombre automatique en plus (D14)** | Agent (branche `t1.4-design`, fusionnée) |
| T1.5 | Base de données et import des jeux | **Terminée — migrations et import vérifiés sur le staging le 15/09** | Agent, terminée par l'équipe (session interrompue pour budget) |
| T1.6 | Pages du site | **Terminée le 16/09** | Agent, en direct |
| T1.7 | Interrupteur de vente et configuration légale | **Terminée le 16/09** | Agent, en direct |
| T1.8 | Achat et livraison (Stripe test) | **Code terminé le 17/09, déployé sur le staging (ventes toujours fermées) ; achat réel non vérifié — bloqué sur `config/entreprise.ts` (voir A_FAIRE_EQUIPE.md)** | Agent, en direct |
| T1.9 | Jeu gratuit, listes d'attente et newsletter | **Terminée le 17/09** — déployée et vérifiée sur le staging | Agent, en direct |
| T1.10 | Admin minimale | **Terminée le 17/09** — toutes les pages construites | Agent, en direct |
| T1.11 | Brouillons des pages légales | À faire | — |
| T1.12 | SEO technique | **Terminée le 16/09** | Agent, en direct |
| T1.13 | Mots-clés et calendrier éditorial | **Structure validée le 15/09 (D17) ; 3 articles réécrits par l'équipe, en attente du feu vert final avant publication** | Agent, articles réécrits par l'équipe |
| T1.14 | Statistiques de visite | **Terminée le 16/09** | Agent, en direct |
| T1.15 | Sécurité, sauvegardes, surveillance | **Terminée le 17/09** — compte Uptime Kuma créé et mot de passe Umami changé (équipe), copie des sauvegardes vers Backblaze B2 codée (agent), clés B2 restent à renseigner | Agent, en direct |
| T1.16 | Tests automatisés | À faire — T1.8 et T1.9 terminées, débloquée (couverture unitaire déjà en place, reste l'E2E d'achat via Stripe CLI) | — |

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

### 15/09/2026 — T1.5 (agent, puis équipe)
- **Agent** : schéma Drizzle complet (D8 compteur de factures, D12 `redirects`, D15 `type` libre validé en application), migrations `0000_init` et `0001_seed_invoice_counters`, stockage privé (`lib/storage`), validation des fiches, `npm run import-games`, `npm run rename-game` (redirection 301 sans chaîne), jeu factice « chasse au trésor » Halloween, tests unitaires.
- **Session interrompue par l'équipe à 5,78 $** (budget API dépassé), en phase de vérification finale. L'équipe a terminé la tâche.
- **Revue de l'équipe : 3 défauts corrigés**, chacun avec un test qui échouait sur l'ancien code :
  1. `import-games` retirait le `kit.pdf` avant d'écrire en base : une image corrompue bloquait définitivement le jeu. Le kit n'est plus retiré qu'en fin de traitement, et un kit déjà stocké est rattaché.
  2. `createDefaultStorage` utilisait `??` : avec `STORAGE_PRIVATE_DIR=` vide (valeur de `.env.example`), les fichiers privés partaient dans le dossier courant.
  3. `.gitignore` n'excluait pas les `kit.pdf`, qui sont les produits vendus.
- **Ajouts de l'équipe** : service Compose `tools` (migrations et import sur le staging, cité par `db/migrate.ts` mais inexistant), propriétaire du volume privé donné à l'utilisateur de l'app (sinon aucune écriture possible, bloquant pour T1.8), `design/` exclu du lint, procédure « Ajouter un jeu » et « Base de données » dans le README.
- **Vérifié sur le staging** : 9 tables créées, compteurs de factures à 0, jeu factice importé, kit lisible par l'app et **non servi publiquement** (404), images servies, migrations et import relançables sans doublon. 42 tests unitaires, lint, TypeScript et build au vert.
- **T1.5 terminée.** Débloque T1.6.

### 15/09/2026 — Agent (branche `t1.13-seo`, révision D15)
- **Aucun code.** Révision de T1.13 après D15 (types de jeu élargis, Halloween prioritaire), dans `docs/seo/mots-cles.md` et `docs/seo/calendrier.md`. Les 3 articles de `content/blog/` **non modifiés** (attendent toujours la validation de l'équipe).
- **Recherche de mots-clés « chasse au trésor » complétée**, priorité Halloween (`docs/seo/mots-cles.md`, section 2bis) :
  - une première collecte déléguée à `worker-web` a été **écartée** : son rapport contenait des noms de domaine visiblement corrompus/invérifiables (« momèspares », « jeuxEtCarre.fr »…), incompatibles avec l'exigence de sources vérifiables ;
  - l'agent a **refait la collecte lui-même** en interrogeant directement DuckDuckGo (autocomplétion + recherche HTML) : 7 familles de requêtes documentées, 14 concurrents réels identifiés (noms de domaine + thème observé, jamais de texte recopié), 3 domaines communs avec la recherche escape game déjà livrée ;
  - **aucun volume de recherche inventé** ; chaque observation cite sa source exacte ; les requêtes bloquées par un captcha ou infructueuses sur Bing sont signalées explicitement (limites en section 2bis.6), notamment pour « chasse au trésor anniversaire enfant » (donnée partielle, mise en « watch-list ») et pour Noël/Saint-Valentin/Pâques/anniversaire ado/EVJF-EVG (recherche chasse au trésor pas faite, hors périmètre de cette révision).
- **Nouvelle structure de pages collections proposée** (`docs/seo/mots-cles.md`, section 1bis), en réponse directe à D15 : principe hub (page saison/public qui regroupe tous les types) + pages type (créées seulement quand une requête dédiée et des concurrents réels le justifient). Concrètement : nouveau hub `/halloween` + nouvelle page type `/chasse-au-tresor-halloween` (données complètes) à côté de `/escape-game-halloween` (inchangée) ; renommage en hubs de `/escape-game-noel` → `/noel`, `/escape-game-saint-valentin` → `/saint-valentin`, `/escape-game-paques` → `/paques`, `/escape-game-anniversaire-enfant` → `/anniversaire-enfant`, `/escape-game-anniversaire-ado` → `/anniversaire-ado`, `/escape-game-evjf-evg` → `/evjf-evg` ; nouveau hub `/soiree-adulte` au-dessus de `/murder-party-a-imprimer` (conservé tel quel). Rien n'est supprimé, aucune redirection nécessaire (T1.6 n'a pas commencé). **La proposition initiale (section 1) est conservée pour mémoire, marquée remplacée.**
- **`docs/seo/calendrier.md` mis à jour :** Halloween reste prioritaire (7 lignes sur 15 dans le calendrier détaillé S1-S7, contre 6 sur 14 avant cette révision) ; ligne ajoutée en S2 pour un **futur article chasse au trésor Halloween, planifié mais non rédigé** (ne remplace ni ne modifie les 3 articles déjà livrés) ; date de Pâques 2027 mise à jour : **dimanche 28/03/2027, confirmée par l'équipe** (remplace la mention « à reconfirmer »).
- **Réalisme SEO rappelé explicitement** (AGENTS.md section 6) dans les deux fichiers : domaine neuf, vitrine publique vers le 30/09/2026 → les pages Halloween visent surtout **Halloween 2027**, pas 2026.
- **T1.13 marquée « révisée, en attente de validation équipe » dans le tableau ci-dessus** (structure des collections en section 1bis + les 3 articles, comme avant cette révision).
- **Ce qui bloque côté équipe :** valider (ou amender) la nouvelle structure de pages collections (section 1bis de `mots-cles.md`) avant que T1.6 ne l'implémente ; valider (ou amender) les 3 articles de blog (inchangés depuis la première livraison).
- **Ce qui reste, hors périmètre de cette révision :** recherche « chasse au trésor » pour Noël, Saint-Valentin, Pâques, anniversaire ado et EVJF/EVG ; confirmation de la page type `/chasse-au-tresor-anniversaire-enfant` (données partielles actuellement) ; vérification des concurrents sur les requêtes ombrelles des hubs.
- **Rappel :** session sans code, travail limité à ce worktree (`t1.13-seo`), aucune modification des autres dossiers/branches.

### 15/09/2026 — Équipe (validation de T1.13)
- **Structure des pages collections validée telle quelle** (D17), pages `/soiree-adulte` et `/murder-party-a-imprimer` comprises : la murder party est un type de jeu confirmé.
- **Concurrents vérifiés par l'équipe** : les 14 domaines cités dans la structure existent (DNS résolu, 13 répondent en HTTPS).
- **`worker-web` peu fiable pour la collecte factuelle** : sa première collecte contenait des noms de domaine inventés. L'agent l'a écartée et a refait la recherche lui-même, ce qui explique une partie du coût de la révision (1,78 $). Toute source rapportée par un worker doit être vérifiée avant usage.
- **Articles réécrits par l'équipe** après son retour sur le ton : ludique mais classe et professionnel, aucune durée ni matériel de jeu précis (ils relèvent du créateur des jeux), un seul renvoi à la fiche du jeu par article, aucune date dans le texte, liens vers les pages de la structure validée. Article 2 élargi aux chasses au trésor d'Halloween et renommé `organiser-escape-game-chasse-au-tresor-halloween.md` (jamais publié). Dates de publication prévues : 30/09, 02/10 et 07/10, sous réserve de l'ouverture de la vitrine.
- **Reste à faire :** feu vert final de l'équipe sur les 3 articles ; recherche « chasse au trésor » pour les autres saisons (non bloquant). **T1.6 peut démarrer.**

### 16/09/2026 — T1.6 (agent, en direct, budget API épuisé)
- **Contexte :** l'équipe a demandé à l'agent de prendre le relais directement (sans session OpenCode payante) après le dépassement du budget sur T1.5. Feu vert de l'équipe reçu sur les 3 articles (voir `docs/A_FAIRE_EQUIPE.md`).
- **Fondations :** `app/globals.css` réécrit à partir des tokens de la direction B (`design/direction-b/`), thème sombre automatique via `prefers-color-scheme` (contrastes WCAG recalculés et vérifiés ≥ 4,5:1, voile du hero ajusté de 0,55 à 0,62 pour rester au-dessus du seuil sur le rouge de Noël) ; polices Baloo 2 / Nunito via `next/font/google` ; en-tête corrigé (logo et navigation sur une seule ligne en desktop — la maquette les empilait, voir T1.4) avec menu mobile en `<details>` natif ; `lib/saisons.ts` (fenêtres de dates, calcul de Pâques par l'algorithme de Meeus/Jones/Butcher, `SAISON_ACTIVE` pour forcer une saison sur le staging) ; `lib/collections.ts` (structure D17 : hubs et pages type) ; `lib/games/queries.ts` (import différé de `db/client.ts` via `connection()` + `await import()`, pour ne jamais toucher la base au build) ; `lib/games/images.ts` (largeurs multiples des images, sigma de flou proportionnel).
- **Pages livrées :** accueil (saison active, jeux phares, comment ça marche, encart email désactivé), `/jeux` (catalogue filtrable par type/saison/public/âge/joueurs/durée, filtres repliés par défaut sur mobile), `/jeux/[slug]` (pitch, histoire, aperçus floutés, caractéristiques, contenu du kit, préparation, FAQ, prix, CTA désactivé « Me prévenir de la sortie », jeux similaires), pages collections `/[collection]` pilotées par `lib/collections.ts` (404 hors structure validée), comment-ca-marche, FAQ, à-propos (contenu marqué provisoire), contact (formulaire avec validation zod, anti-spam par champ piège + limite par IP, envoi Brevo si configuré sinon message honnête), 404 personnalisée.
- **Aperçus protégés :** `import-games` génère désormais chaque image en plusieurs largeurs (couverture 480/960/1600, aperçus 600/1200, WebP + AVIF) et floute les aperçus du kit avec un flou proportionnel à la largeur (`lib/games/images.ts`) ; test qui compare l'écart-type d'un damier très contrasté avant/après flou pour vérifier que ça fonctionne réellement, pas seulement que le code s'exécute.
- **Corrections trouvées en vérifiant sur le staging (pas en relisant le code) :**
  1. le formulaire de contact heurtait le `role="alert"` interne de Next.js (route announcer) dans le test E2E — corrigé en ciblant le message du formulaire par sa classe ;
  2. le premier serveur de test tournait encore avec l'ancien build après un redéploiement (`next build` régénère tout `.next/standalone`, l'ancien process gardait ses descripteurs de fichiers sur le dossier supprimé) — recherché par PID et port, pas par nom de commande.
- **Performance :** voir D18. Score Lighthouse mobile mesuré entre 74 et 94 selon la charge du VPS de dev (partagé), toutes les pages ayant un JavaScript identique et minimal. Un vrai correctif appliqué (image de couverture prioritaire au lieu de différée) a mesurablement supprimé son délai de chargement. Accessibilité et bonnes pratiques à 100 de façon stable.
- **Vérifié :** 64 tests unitaires (dont les nouveaux tests saisons/filtres/collections/contact/flou), 21 tests E2E (build de production, mobile et ordinateur, clair et sombre, 404, filtres, fiche jeu, menu mobile, en-tête, formulaire de contact), lint et TypeScript au vert, aucun défilement horizontal sur aucune page testée.
- **T1.6 terminée.** Débloque T1.7 (interrupteur de vente) et T1.12 (SEO technique).

### 16/09/2026 — T1.7 (agent, en direct)
- **`config/entreprise.ts`** : toutes les infos légales (raison sociale, forme juridique, SIRET, adresse, email de contact, régime de TVA, médiateur de la consommation, hébergeur, directeur de publication), valeurs provisoires marquées `"À COMPLÉTER"`.
- **`SALES_ENABLED` réellement figée au build** (D19, application stricte de D11), pas simplement lue au runtime : `scripts/check-legal-config.ts` (hook `prebuild`/`predev`) vérifie `config/entreprise.ts` puis génère `config/sales-enabled.generated.ts`, seul import autorisé pour piloter le bouton (`lib/ventes/sales-enabled.ts`) ; `docker-compose.yml` passe `SALES_ENABLED` en argument de build Docker ; `instrumentation.ts` refuse de démarrer le serveur si l'environnement diffère de la valeur du build.
- **Bouton d'action de la fiche jeu** (`components/jeux/BlocPrixAction.tsx`) : « Me prévenir de la sortie » (ventes fermées) ou « Acheter » (ventes ouvertes) — les deux restent désactivés pour l'instant, la liste d'attente (T1.9) et le paiement (T1.8) n'existant pas encore ; aucune formulation ne laisse croire qu'on peut déjà commander.
- **`AFFICHER_PRIX`** : réglage cosmétique séparé pour masquer les prix, sans lien avec `SALES_ENABLED`, changeable sans reconstruire.
- **Garde-fou vérifié en conditions réelles**, pas seulement en test unitaire :
  1. `SALES_ENABLED=true npm run prebuild` sur la configuration actuelle (incomplète) → échec, liste les 10 champs manquants ;
  2. build normal → réussit, `config/sales-enabled.generated.ts` généré avec `false` ;
  3. serveur démarré avec `SALES_ENABLED=true` dans l'environnement alors que le build a été fait avec `false` → refuse de démarrer, message explicite, sort en erreur.
- **Correction en cours de route :** `process.exit` dans `instrumentation.ts` faisait échouer la compilation du bundle Edge de Next.js (avertissement Turbopack, l'API n'existe pas dans ce runtime) même derrière un `if` — déplacé dans `instrumentation-node.ts`, importé dynamiquement uniquement depuis la branche Node.
- **Vérifié :** 74 tests unitaires (10 nouveaux pour la vérification légale), 21 tests E2E toujours au vert (aucune régression sur T1.6), lint et TypeScript au vert.
- **T1.7 terminée.** Débloque T1.8 (paiement, bloqué côté équipe sur le compte Stripe test), T1.9 (jeu gratuit/listes d'attente, bloqué côté équipe sur le compte Brevo) et T1.11 (mentions légales/CGV).

### 16/09/2026 — T1.12 (agent, en direct)
- **`SITE_URL`/`SITE_PUBLIC`** (D20) : indexation pilotée séparément de `SALES_ENABLED`, volontairement plus simple (lue au runtime, pas figée au build) — se corrige sans reconstruire, contrairement à une vente ouverte par erreur.
- **`app/robots.ts` et `app/sitemap.ts`** remplacent l'ancien `public/robots.txt` statique (Next.js interdit que les deux coexistent) ; `robots.ts` marqué `export const dynamic = "force-dynamic"` après avoir constaté qu'il se prérendait sinon une bonne fois pour toutes au build, rendant `SITE_PUBLIC` inopérant à l'exécution — trouvé en inspectant le tableau des routes après build (`○ Static` au lieu de `ƒ Dynamic`), pas en le devinant.
- **Sitemap** : pages statiques, pages collections (D17) et jeux **publiés uniquement** (`listerJeuxPublies`, nouvelle fonction dans `lib/games/queries.ts`) — vérifié que le jeu factice (statut `brouillon`) n'y apparaît pas, même avec `AFFICHER_BROUILLONS=true`.
- **Canonical + Open Graph + Twitter Card** sur toutes les pages (`lib/seo/meta.ts`), avec l'image de couverture sur les fiches jeux (utile pour Pinterest). `metadataBase` posé dans `app/layout.tsx`.
- **JSON-LD** (`lib/seo/jsonld.ts`, `components/site/JsonLd.tsx`) : `Organization`/`WebSite` sur toutes les pages, `BreadcrumbList` intégré à `FilAriane` (qui exigeait déjà les mêmes données), `Product`/`Offer` sur les fiches jeux — disponibilité alignée sur `ventesActives()` (T1.7) : jamais `InStock` avant l'ouverture réelle des ventes.
- **Redirections 301/308 automatiques** (`lib/redirects.ts`) : la table `redirects` existait depuis T1.5 (D12) mais rien ne la consultait côté visiteur — un ancien lien indexé menait droit à la 404. Consultée depuis `app/jeux/[slug]/page.tsx` et `app/[collection]/page.tsx` juste avant `notFound()`, avec `permanentRedirect()` de Next.js (répond en 308, équivalent moderne du 301).
- **Vérifié en conditions réelles, pas seulement en test :**
  1. build → `/robots.txt` bien listé en `ƒ Dynamic` après le correctif ci-dessus ;
  2. serveur démarré → `robots.txt` répond `Disallow: /`, `sitemap.xml` liste les bonnes pages ;
  3. une ligne insérée à la main dans `redirects` (`/jeux/ancien-nom` et `/ancien-hub`) → les deux répondent bien **308** avec le bon en-tête `Location`, testé pour un jeu et pour une collection, puis nettoyé.
- **Vérifié :** 84 tests unitaires (10 nouveaux, dont l'échappement JSON-LD contre l'injection de script), 27 tests E2E (dont 6 nouveaux : sitemap, canonical, Open Graph, JSON-LD Organization/WebSite/BreadcrumbList/Product), lint et TypeScript au vert.
- **Hors périmètre, transmis à d'autres tâches :** `BlogPosting` (pas de route `/blog` encore construite, T1.13/phase 2) ; retrait du mot de passe du staging et bascule `SITE_PUBLIC=true` en production (T2.4, mise en ligne publique) ; validation visuelle dans l'outil de test des résultats enrichis de Google (nécessite un accès navigateur, le staging étant protégé).
- **T1.12 terminée.**

### 16/09/2026 — T1.14 (agent, en direct)
- **Site Umami créé via son API** (`e-com-jdr (staging)`, id `9bd6ebb2-f284-49d6-a1a2-c3506287678a`) : aucun site n'existait encore.
- **Script servi en même origine** (D21) : `next.config.ts` proxie `/stats/script.js` et `/stats/api/send` vers le service `umami` interne au réseau Docker — jamais de sous-domaine ni de port exposé au navigateur. `UMAMI_WEBSITE_ID` insère le script dans `app/layout.tsx` ; sans cette variable, rien n'est inséré.
- **Événement `contact_envoye`** suivi à la soumission réussie du formulaire de contact (`lib/analytics/umami.ts`, `suivreEvenement`) — le seul flux interactif réellement fonctionnel à ce stade. Les clics sur « Me prévenir de la sortie » et les inscriptions ne peuvent pas être suivis avant que ces boutons deviennent fonctionnels (T1.9) : un bouton `disabled` ne déclenche aucun `click`, un commentaire dans `BlocPrixAction.tsx` le rappelle pour plus tard.
- **Non fait, refusé par le mode automatique :** changer le mot de passe administrateur d'Umami, resté aux identifiants par défaut (`admin` / `umami`) — action classée « écriture dans un magasin de secrets », qui a besoin d'une confirmation explicite. Signalé à l'équipe dans `docs/A_FAIRE_EQUIPE.md` (à traiter avec T1.15, sécurité).
- **Vérifié en conditions réelles :** aucune régression (84 tests unitaires, 27 E2E) ; le proxy vers `umami:3000` n'existe que dans le réseau Docker Compose du staging, donc pas testable depuis le conteneur de l'agent (isolé, sans navigateur capable d'atteindre le tailnet). Après déploiement sur le staging, `GET /stats/script.js` renvoie bien le script avec le bon `data-website-id` dans la page ; deux requêtes envoyées directement à `POST /stats/api/send` (mêmes appels que ceux que fait le script dans un navigateur, une pour une page vue et une pour l'événement `contact_envoye`) ont traversé le proxy jusqu'à Umami — confirmé en les retrouvant via l'API d'Umami (`GET /api/websites/{id}/stats` : 1 vue ; `GET /api/websites/{id}/events` : les deux événements, avec le bon nom, la bonne page et le bon horodatage).
- **T1.14 terminée.**

### 16/09/2026 — T1.15 (agent, en direct)
- **En-têtes de sécurité** (`lib/securite/entetes.ts`, `next.config.ts`) : CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` sur toutes les routes. CSP pragmatique (`'unsafe-inline'` pour script/style, exigé par les données d'hydratation de l'App Router) plutôt que stricte par nonce (D22) — vérifié réellement : les 27 tests E2E passent CSP active, et un script Playwright dédié confirme zéro erreur de console sur 4 pages.
- **Limiteur de requêtes généralisé** (`lib/securite/limiteur.ts`), sorti de `lib/contact/formulaire.ts` (T1.6, seul appelant jusqu'ici) pour que T1.8 et T1.9 le réutilisent. Les autres routes sensibles du brief (téléchargement, renvoi de liens, listes d'attente, newsletter) n'existent pas encore.
- **Logs relus** : aucune donnée personnelle dans les `console.log`/`console.error` du dépôt.
- **Sauvegardes quotidiennes** (`docker/sauvegarde.sh`, `docker/restauration.sh`) : dump Postgres (`pg_dump -Fc`) + archive du stockage privé, purge à 14 jours, tâche cron installée sur l'hôte (3 h UTC).
- **Restauration testée pour de vrai, sans toucher à la production :** sauvegarde réelle produite sur le staging, restaurée dans une base séparée (`ecomjdr_restore_test`, supprimée ensuite) — les 9 tables et le jeu factice réapparaissent à l'identique ; l'archive des fichiers privés extraite et comparée (`diff -r`) au volume réel : identique. Procédure documentée dans le README.
- **Non fait, en attente de l'équipe :** la copie des sauvegardes hors du VPS (destination pas encore choisie, `docs/A_FAIRE_EQUIPE.md`) — sans elle, ces sauvegardes ne protègent pas contre la perte du VPS lui-même, seulement contre une erreur applicative.
- **Surveillance :** Uptime Kuma auto-hébergé déployé (`/root/apps/uptime-kuma/`, aucun compte externe créé par l'équipe pour l'instant), réseau et volume Docker dédiés, exposé uniquement sur le tailnet (`https://srv1214588.taild2e4d0.ts.net:8445`, nouveau port Tailscale Serve).
- **Non fait, refusé par le mode automatique (même catégorie qu'Umami, T1.14) :** créer le compte administrateur d'Uptime Kuma — son assistant de premier lancement exige de choisir un mot de passe. Ajouter un moniteur pour le staging et une notification restent donc à faire par l'équipe.
- **Critère « une alerte de test a bien été reçue » non vérifiable par l'agent** tant que le compte Uptime Kuma et une notification ne sont pas configurés — c'est le seul point de T1.15 qui reste réellement ouvert.
- **Vérifié :** 91 tests unitaires (7 nouveaux), 27 tests E2E toujours au vert avec les en-têtes de sécurité actifs, lint et TypeScript au vert.
- **T1.15 quasi terminée** — reste seulement la configuration du compte Uptime Kuma et de sa notification (équipe), et la destination des sauvegardes hors VPS (équipe).

### 17/09/2026 — T1.8 (agent, en direct, sur le VPS via accès root plutôt que le conteneur opencode)
- **Session Stripe Checkout** (`lib/commandes/creer-session-checkout.ts`, `app/api/checkout/route.ts`) : `price_data` depuis `games.prixEur` (aucune synchronisation de catalogue), consentement obligatoire via `consent_collection`/`custom_text` (accès immédiat + renonciation au droit de rétractation), route protégée par `ventesActives()` et un limiteur dédié.
- **Webhook** (`app/api/webhooks/stripe/route.ts`, `lib/commandes/traitement-webhook.ts`) : signature vérifiée avant tout traitement ; `checkout.session.completed` idempotent via `orders.stripe_session_id` unique (`onConflictDoNothing`) — un événement livré deux fois ne crée jamais deux commandes, deux factures ni deux emails (vérifié par test) ; `charge.refunded` retrouve la session via `stripe.checkout.sessions.list({payment_intent})` (aucune colonne supplémentaire nécessaire), émet un avoir et révoque les jetons de téléchargement de la commande.
- **Téléchargement** (`lib/telechargements/tokens.ts`, `app/telecharger/[token]/route.ts`) : jeton de 32 octets, seul son hash SHA-256 est stocké ; validation et incrément du compteur dans la même requête `UPDATE ... WHERE downloadCount < maxDownloads` pour rester correct sous course concurrente (vérifié par test : deux téléchargements simultanés sur le dernier essai, un seul passe). Filigrane (email de l'acheteur, pdf-lib) apposé à chaque téléchargement, jamais stocké sur le PDF d'origine.
- **Factures** (`lib/factures/`) : numérotation par compteur transactionnel déjà en place depuis T1.5 (D8), format `F-000001`/`A-000001` repris de l'exemple du schéma — **toujours à faire valider par le comptable** (`docs/A_FAIRE_EQUIPE.md`, déjà noté avant cette session). PDF minimal (pdf-lib) avec `legalSnapshot` figé à l'émission. Avoir jamais une suppression : nouvelle ligne qui référence `credited_invoice_id`.
- **Page de confirmation et « Retrouver mes téléchargements »** : les jetons en clair n'étant jamais stockés, chaque visite régénère de nouveaux liens plutôt que de retrouver les anciens (les anciens restent valables jusqu'à leur propre expiration/quota). Message identique que l'email existe ou non.
- **`.env.example` corrigé** : les variables Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) manquaient alors que `.env` les avait déjà — contraire à la règle « aucun secret sans `.env.example` ».
- **Bug trouvé en testant l'image Docker, pas en relisant le code :** `next build` échouait dans le Dockerfile (jamais vu avec `npm run build` en direct dans le conteneur de l'agent, où `DEV_DATABASE_URL` masquait le problème) — le webhook, la route de téléchargement et l'action « retrouver mes téléchargements » importaient `db/client.ts` en haut de fichier au lieu d'un import différé (même piège que celui déjà documenté dans `lib/games/queries.ts` pour T1.6). Corrigé, image Docker reconstruite avec succès.
- **`STRIPE_WEBHOOK_SECRET` invalide trouvé dans le `.env` du staging** (ne correspondait à aucun format Stripe reconnu) — corrigé avec la vraie valeur de `stripe listen --print-secret`, stable pour cet appareil (vérifié par deux appels).
- **Déployé sur le staging, ventes toujours fermées** (`SALES_ENABLED=false`) : build et démarrage vérifiés, fiche jeu affiche toujours honnêtement « Me prévenir de la sortie » (T1.9 pas encore fait), page `/retrouver-mes-telechargements` répond 200.
- **Non vérifié par un achat réel : bloqué sur `config/entreprise.ts`.** Le garde-fou D11 (T1.7, volontaire) refuse de construire l'image avec `SALES_ENABLED=true` tant qu'un champ de la configuration légale reste au marqueur `"À COMPLÉTER"` — et refuse aussi explicitement que l'agent le contourne avec de fausses valeurs, y compris pour un test staging non commité. C'est le comportement voulu (ne jamais fabriquer d'informations légales), mais ça veut dire que le critère « achat test complet sur le staging » du brief ne pourra être vérifié qu'une fois `config/entreprise.ts` rempli, même provisoirement (voir `docs/A_FAIRE_EQUIPE.md`).
- **Vérifié :** 112 tests unitaires (21 nouveaux : webhook/idempotence/remboursement, jetons de téléchargement dont la course concurrente, numérotation et émission des factures/avoirs, filigrane, paramètres de la session Checkout), lint et TypeScript au vert, `next build` réussi en local et dans l'image Docker.
- **Commité** (`a9d7f20`, `d194d3b`) sur le dépôt local des agents (`/root/workspace/e-com-jdr`), **pas encore poussé sur GitHub** — en attente de confirmation.
- **T1.8 : code terminé, testé unitairement et déployé sur le staging ; vérification par achat réel en attente de `config/entreprise.ts`.** Ne débloque pas encore T1.10 ni T1.16 tant que ce dernier point n'est pas vérifié.

### 17/09/2026 — Infos équipe (AGENTS.md, config/entreprise.ts)
- **AGENTS.md section 0 remplie par l'équipe** : marque **PartyHunter**, domaine `partyhunter.shop` (DNS Hostinger, déjà résolu), email de contact `teampartyhunter@partyhunter.shop`, validations par Telegram. Statut d'entreprise précisé : micro-entreprise, nom « lpenterprise » (raison sociale exacte à reconfirmer).
- **`config/entreprise.ts` mis à jour avec les champs désormais connus** (raison sociale, forme juridique, email de contact) — `SIRET`, adresse, médiateur et hébergeur restent `"À COMPLÉTER"` (dossier de micro-entreprise en cours), donc `SALES_ENABLED=true` reste bloqué par D11. Commité, poussé sur GitHub.

### 17/09/2026 — T1.9 (agent, en direct, sur le VPS via accès root)
- **`subscriptions.token_hash`** (migration `0002_add-subscriptions-token.sql`) : un seul jeton par inscription, seul son hash SHA-256 est stocké (même principe que `download_tokens`, T1.8), réutilisé pour la confirmation ET la désinscription. `lib/securite/token.ts` factorise la génération/hash, désormais partagée avec `lib/telechargements/tokens.ts` (T1.8).
- **Double opt-in générique** (`lib/inscriptions/`, `app/actions/inscriptions.ts`) : jeu gratuit, liste d'attente par jeu, liste d'attente générale, newsletter — un seul mécanisme pour les quatre. Réinscrire une adresse déjà connue régénère un jeton et redemande confirmation (`onConflictDoUpdate` sur la contrainte unique D5), y compris après une désinscription.
- **`/confirmer/[token]` et `/desinscription/[token]`** : le simple GET n'affiche qu'un bouton, seule l'action serveur du clic (un vrai POST) confirme ou désinscrit. Choix délibéré, au-delà du brief : un scanner de liens dans un client email (Microsoft Safe Links et équivalents) suit automatiquement chaque lien d'un email, ce qui aurait sinon confirmé ou désinscrit des gens à leur place.
- **`/jeu-gratuit`** : formulaire email + case newsletter non pré-cochée et séparée (brief, point 4). **`/jeu-gratuit/acces`** : mini-jeu factice, clairement annoncé comme tel (même principe que le jeu factice du catalogue, T1.5).
- **Listes d'attente branchées sur les placeholders déjà laissés par T1.6/T1.7** plutôt que de créer de nouvelles pages : le bouton « Me prévenir de la sortie » de `BlocPrixAction` (par jeu) et l'encart d'accueil « Soyez prévenu de chaque sortie » (liste générale) étaient déjà désactivés en attendant T1.9. Idem pour les pages collections vides (saison à venir, déjà indexables depuis T1.6) : la liste d'attente générale y a été ajoutée plutôt que de créer un nouveau type de page « bientôt disponible ».
- **Non fait, hors périmètre faute de contenu réel :** une page « bientôt disponible » par **jeu** précis annoncé à l'avance nécessiterait un état de catalogue qui n'existe pas encore (`games.status` n'a que `brouillon`/`publie`) — aucun jeu à venir n'étant fourni pour l'instant, cette infrastructure spéculative n'a pas été construite (voir `docs/A_FAIRE_EQUIPE.md`).
- **Oubli de T1.8 corrigé au passage :** `.bloc-achat` (bouton Acheter) n'avait pas de CSS ; ajouté avec `.bloc-liste-attente` et `.champ-case` (T1.9).
- **Vérifié en conditions réelles sur le staging**, pas seulement en test : migration appliquée (service `tools`), image reconstruite, ligne de test insérée directement en base (jeton généré et haché comme le fait l'application) puis retrouvée via `/confirmer/<jeton>` (texte de consentement affiché) et `/desinscription/<jeton>` — jeton inconnu correctement rejeté (« lien invalide ») ; ligne de test supprimée ensuite. Le clic du bouton de confirmation lui-même (action serveur Next.js) n'a pas pu être rejoué contre le staging (le conteneur de l'agent n'a pas accès réseau à ses conteneurs Docker) : mécanique déjà couverte par les tests unitaires, risque résiduel faible car géré par le framework, pas par du code métier.
- **Régression trouvée et corrigée** : le test E2E `tests/e2e/pages.spec.ts` attendait encore le bouton « Me prévenir de la sortie » désactivé (T1.7) — mis à jour pour attendre un bouton actif, sans achat possible pour autant.
- **Vérifié :** 120 tests unitaires (8 nouveaux), 27 tests E2E (build + serveur standalone, voir README), lint et TypeScript au vert.
- **Commité et poussé sur GitHub.**
- **T1.9 terminée.** Débloque T1.10 (avec T1.8) et T1.16 (avec T1.8).

### 17/09/2026 — Vérification réelle de T1.9 et correctif (agent, en direct)
- **Vrai test d'inscription rejoué sur le staging** (POST direct reproduisant le protocole des Server Actions Next.js, sans navigateur — le conteneur de l'agent ne peut pas atteindre les conteneurs Docker du staging) : `/jeu-gratuit` avec `teampartyhunter@partyhunter.shop` (adresse fournie par l'équipe, remplace l'adresse personnelle utilisée par erreur dans `EMAIL_EXPEDITEUR`).
- **Bug trouvé : `BREVO_API_KEY` répond `401`** — clé invalide. Noté dans `docs/A_FAIRE_EQUIPE.md`.
- **Deuxième bug trouvé par le même test, sans rapport avec le premier : une erreur Brevo non rattrapée faisait planter la requête (500)** au lieu d'afficher le message honnête déjà en place pour le formulaire de contact (T1.6). Corrigé : `app/actions/inscriptions.ts` rattrape l'échec d'envoi, l'inscription au jeu gratuit reste acquise même si la newsletter optionnelle échoue seule. Reproduit une seconde fois après correction : réponse 200 avec le message d'erreur honnête, plus de plantage.
- **`EMAIL_EXPEDITEUR` corrigé** dans le `.env` du staging (`teampartyhunter@partyhunter.shop`).
- **Sauvegardes hors du VPS : Backblaze B2 choisi par l'équipe.** `rclone` installé sur le VPS ; `docker/sauvegarde.sh` copie désormais vers B2 via `RCLONE_CONFIG_ECOMJDRB2_*` (pas de fichier de config séparé), sautée proprement tant que `B2_BUCKET`/`B2_KEY_ID`/`B2_APPLICATION_KEY` ne sont pas renseignées dans `.env` (à faire par l'équipe).
- **Uptime Kuma et Umami confirmés par l'équipe** : compte admin Kuma créé, mot de passe Umami changé.

### 17/09/2026 — T1.10, fondations (agent, en direct)
- **Décision de l'équipe** : compte admin unique et nominatif (micro-entreprise, un seul admin) — voir `docs/A_FAIRE_EQUIPE.md`.
- **Mot de passe haché avec `scrypt`** (Node natif, aucune dépendance ajoutée) — `lib/admin/mots-de-passe.ts`. **Session signée par HMAC** (`ADMIN_SESSION_SECRET`, générée par l'agent avec `openssl rand -hex 32` : un secret de signature, pas un mot de passe humain à retenir, donc pas soumis à la même règle) — `lib/admin/session.ts`, sans table de sessions séparée pour un compte unique.
- **`npm run create-admin`** (`scripts/create-admin.ts`) : lit `ADMIN_EMAIL`/`ADMIN_PASSWORD` dans l'environnement au moment de l'exécution, jamais choisis ni vus par l'agent. Rejouable (met à jour le mot de passe si l'email existe déjà).
- **`/admin/(protege)`** : groupe de routes protégé, redirige vers `/admin/connexion` si la session est absente/invalide/expirée. `/admin/connexion` volontairement hors de ce groupe (sinon boucle de redirection sur elle-même). `/admin/*` jamais indexé (`robots: noindex`), y compris une fois `SITE_PUBLIC=true` (T2.4) — réglage indépendant de l'indexation générale du site.
- **Vérifié en conditions réelles sur le staging**, pas seulement en test : compte de test jetable créé (`npm run create-admin` via le service `tools`), connexion rejouée avec le vrai protocole des Server Actions (même technique que la vérification Brevo ci-dessus) — cookie de session bien posé (`HttpOnly`, `Secure`, `SameSite=lax`, `Path=/admin`, expiration à 7 jours), accès au tableau de bord confirmé avec ce cookie, mauvais mot de passe correctement rejeté avec le message générique. Compte de test supprimé ensuite.
- **Non fait, volontairement laissé pour la suite :** le contenu des pages (tableau de bord avec ventes par jeu, liste des commandes avec renvoi de lien et désactivation d'un jeton de téléchargement, inscrits aux listes d'attente par jeu) — la structure protégée existe, le contenu reste à construire.
- **Vérifié :** 127 tests unitaires (7 nouveaux), lint, TypeScript et build au vert.
- **Commité et poussé sur GitHub.**
- **T1.10 fondations terminées.** Reste le contenu des pages avant de clore la tâche.

### 17/09/2026 — T1.10, pages admin (tableau de bord, commandes, listes d'attente)

- **`lib/telechargements/tokens.ts`** : ajout de `revoquerToken(db, downloadTokenId)` — pose `revoked_at = now()`, idempotent (retourne `false` si déjà révoqué ou inexistant). 3 tests unitaires : révocation d'un token actif confirmée par `validerEtConsommerToken` qui répond `"revoque"`, idempotence, et jeton inexistant.
- **`app/admin/(protege)/page.tsx`** (tableau de bord) : remplace le message de bienvenue par un tableau des ventes par jeu — jointure `order_items` + `games` + `orders` filtré `status = 'paid'`, groupé par jeu, avec total en centimes formaté par `formaterPrix`. Affiche le total général en haut.
- **`app/admin/(protege)/commandes/page.tsx`** : liste des commandes triées par date décroissante — email client, date, montant, statut, jeux achetés et actions. **Client component** `BoutonsCommande.tsx` pour les interactions : bouton **Renvoyer les liens** (appelle `creerLiensPourCommande` puis `envoyerEmailCommandeParBrevo`) et état des jetons (actif / expiré / révoqué / quota atteint) avec bouton **Révoquer** pour ceux encore actifs.
- **`app/admin/(protege)/commandes/actions.ts`** : Server Actions `renvoyerLiens(orderId)` et `revoquerJetonAdmin(downloadTokenId)`, toutes deux protégées par `verifierSession()` qui lit le cookie `session_admin` et utilise `verifierJetonSession` (même contrôle que le layout).
- **`app/admin/(protege)/listes-attente/page.tsx`** : inscriptions `liste_attente` groupées par jeu (`gameId`, null = liste générale) — email, date d'inscription, confirmée ou non, désinscrite ou non. Un tableau par groupe.
- **Respect des conventions :** import différé de `db/client`, `connection()` avant l'import, `formaterPrix` pour les montants, noms en français, pas de nouvelle dépendance.
- **Vérifié :** 130 tests unitaires (3 nouveaux pour `revoquerToken` + 127 existants), lint, TypeScript et build au vert. Aucun test existant cassé.
- **Non vérifié sur le staging :** le conteneur de l'agent n'a pas accès réseau aux conteneurs Docker du staging. Les actions serveur avec formulaires (renvoi de liens, révocation) n'ont pas été rejouées contre le staging, mais la mécanique est identique à celle déjà vérifiée de `connexion/actions.ts` (même `verifierSession`, même `useActionState`).
- **Commité localement** (pas poussé sur GitHub — une autre session s'en charge après relecture).
- **T1.10 terminée.**

### 17/09/2026 — T1.10, relecture avant déploiement (agent, en direct)
- **Bug trouvé en relisant le tableau de bord** (`app/admin/(protege)/page.tsx`) : sommait `orders.amount_total` (total de LA COMMANDE) une fois par ligne jointe avec `order_items` — juste tant qu'une commande ne contient qu'un jeu (le cas actuel), mais aurait doublé le total dès qu'une commande contiendrait plusieurs jeux. Corrigé pour sommer `order_items.unit_price * quantity`, la bonne granularité.
- **Vérifié en conditions réelles sur le staging** (pas seulement en test) : commande de test à deux lignes pour le même jeu insérée directement en base (`amount_total` 1000, deux lignes à 500) — le tableau de bord affichait bien 10,00 € et non 20,00 € (ce qu'aurait donné le bug). Connexion admin rejouée avec le même protocole que la vérification Brevo (compte jetable, supprimé ensuite). Page commandes vérifiée avec la même commande de test. Toutes les données de test supprimées après vérification.
- **Corrections mineures au passage :** commentaire de `revoquerToken()` qui annonçait `true` pour un jeton déjà révoqué (le code et son test retournent `false` — idempotente sur son effet, pas sur sa valeur de retour) ; classes CSS manquantes `.btn-petit` et `.table-admin .nb` ajoutées.
- **Vérifié :** 130 tests unitaires, lint, TypeScript et build au vert après correction.
- **Commité et poussé sur GitHub.**
