# Phase 1 : construction

> Lis d'abord `AGENTS.md`. Ce fichier détaille les tâches de la phase 1.

## Objectif
Développer et tester **tout le site** sur le staging (`staging.[DOMAINE]`), avec Stripe en mode test. Rien n'est public et rien n'est vendu.

## Prérequis
- Section 0 « Tout de suite » d'`AGENTS.md` complétée.
- Accès au VPS.

## Jalons
| Date | Jalon | Tâches |
|---|---|---|
| 16/09 | Audit et plan **validés** | T1.1, T1.2 |
| 18/09 | Direction visuelle **choisie** | T1.4 |
| 25/09 | Staging complet avec un jeu factice | T1.3, T1.5 → T1.10 |
| 28/09 | Légal, SEO technique, statistiques, sécurité, tests | T1.11 → T1.16 |

## Pistes parallèles
| Piste | Tâches (dans l'ordre) | Peut démarrer |
|---|---|---|
| **A. Développement** | T1.3 → T1.5 → T1.6 → T1.7 → T1.8 → T1.9 → T1.10 | après T1.2 |
| **B. Design** | T1.4 | après T1.2 (nécessaire pour T1.6) |
| **C. Contenu (sans code)** | T1.13, puis T1.11 | après T1.2 |
| **D. Exploitation** | T1.14, T1.15 | après T1.3 |
| **E. Qualité** | T1.12, T1.16 | après T1.6 et T1.8 |

## Ce que l'équipe fournit
- **DNS :** accès, ou ajout des enregistrements que tu indiques (sous-domaine staging).
- **Clés API**, écrites par l'équipe dans `.env` :
  - Stripe **test** (un compte Stripe non activé suffit pour le mode test) ;
  - Brevo.
- **Destination des sauvegardes** hors du VPS.
- **Validations :** plan (T1.2) et direction visuelle (T1.4).
- **Premier vrai jeu** vers le 01/10. En attendant, utilise un jeu factice clairement marqué comme tel.

---

## Tâches

### T1.1 Audit du VPS (lecture seule)
- **Dépend de :** rien.
- **À faire :**
  - relever le système, le CPU, la RAM et le disque ;
  - vérifier si Docker est installé ;
  - lister les services et ports déjà utilisés ;
  - vérifier l'état du DNS du domaine.
  - **Ne rien modifier.**
- **Terminé quand :** les résultats sont résumés dans `docs/PLAN.md` (section « Audit »).

### T1.2 Plan technique **[VALIDATION ÉQUIPE]**
- **Dépend de :** T1.1.
- **À faire :**
  - `docs/PLAN.md`, organisé selon les 4 phases :
    - architecture ;
    - arborescence du dépôt ;
    - schéma de la base de données ;
    - fonctionnement de `SALES_ENABLED` et de la configuration légale centralisée ;
    - estimation de chaque tâche de ce fichier ;
    - risques par rapport aux dates ;
    - questions ouvertes.
  - `docs/PROGRESS.md` avec le tableau de toutes les tâches de la phase 1.
  - `docs/A_FAIRE_EQUIPE.md`, classé par phase et par urgence.
  - `docs/DECISIONS.md`.
- **Terminé quand :** les fichiers sont créés. **Arrête-toi et attends la validation de l'équipe.**

### T1.3 Socle technique et staging
- **Dépend de :** T1.2 validée, DNS du staging configuré.
- **À faire :**
  - dépôt Git, `.gitignore`, `.env.example`, README de base ;
  - Next.js (App Router, TypeScript) + Tailwind CSS ;
  - Docker Compose (app, postgres, umami) + Caddy (HTTPS automatique) ;
  - `staging.[DOMAINE]` protégé par mot de passe et en `noindex` ;
  - Postgres non exposé sur Internet, `.env` avec les droits 600.
- **Terminé quand :** une page provisoire s'affiche en HTTPS sur le staging, derrière le mot de passe, et la procédure de déploiement est dans le README.

### T1.4 Directions visuelles **[VALIDATION ÉQUIPE]**
- **Dépend de :** T1.2.
- **À faire :** proposer 2 directions visuelles (captures ou pages de démo) qui respectent la section 5 d'`AGENTS.md` : accueil et fiche jeu, sur mobile et ordinateur.
- **Terminé quand :** l'équipe a choisi une direction. Note le choix dans `docs/DECISIONS.md`.

### T1.5 Base de données et import des jeux
- **Dépend de :** T1.3.
- **À faire :**
  - schéma de la base : jeux, fichiers, commandes, lignes de commande, droits de téléchargement, factures, listes d'attente ;
  - interface `storage` : dossier privé sur le VPS, jamais servi en statique, remplaçable par S3 ou R2 ;
  - modèle `content/_modele/fiche.md` (ci-dessous) ;
  - commande `npm run import-games` qui :
    - valide la fiche, avec des erreurs claires si un champ manque ;
    - optimise les images (AVIF/WebP) ;
    - déplace `kit.pdf` dans le stockage privé ;
    - met à jour la base ;
  - un jeu factice clairement marqué comme tel ;
  - procédure « Ajouter un jeu » dans le README.
- **Structure d'un dossier de jeu** `content/games/<slug>/` :
  - `fiche.md` ;
  - `kit.pdf` (privé) ;
  - `cover.jpg`, `apercu-1.jpg`, `apercu-2.jpg`… ;
  - éventuellement `photos/` (vraies parties).
- **Modèle de fiche :**

```md
---
titre:
slug:
statut: brouillon        # brouillon | publie
collections: [halloween] # halloween, noel, anniversaire, saint-valentin, paques…
public: enfants          # enfants | ados | adultes | famille
age_min:
joueurs_min:
joueurs_max:
duree_minutes:
difficulte: moyen        # facile | moyen | difficile
prix_eur:
pitch:                   # 1 à 2 phrases
---

## Histoire

## Contenu du kit

## Préparation
(temps de préparation, matériel à prévoir : imprimante, ciseaux, cadenas…)

## Déroulé en bref

## Questions fréquentes
```

- **Terminé quand :** le jeu factice s'importe en une seule commande, et une fiche incomplète produit une erreur claire.

### T1.6 Pages du site
- **Dépend de :** T1.4, T1.5.
- **À faire :**
  - **Accueil :**
    - saison active mise en avant (réglable par dates) ;
    - jeux phares ;
    - bloc « comment ça marche » ;
    - inscription email.
  - **Catalogue `/jeux`**, filtrable par saison, public, âge, nombre de joueurs et durée.
  - **Fiche jeu `/jeux/[slug]` :**
    - pitch, histoire, contenu du kit ;
    - aperçus de pages floutés ou filigranés ;
    - joueurs, durée, âge, difficulté ;
    - temps de préparation et matériel nécessaire ;
    - FAQ ;
    - prix TTC et bouton d'action (voir T1.7).
  - **Pages collections permanentes :** `/escape-game-halloween`, `/escape-game-noel`, `/escape-game-anniversaire`… Les slugs définitifs viennent de T1.13.
  - **Autres pages :** comment ça marche, FAQ, à propos (contenu provisoire en attendant l'équipe), contact (formulaire envoyé par email), page 404.
- **Terminé quand :** toutes les pages s'affichent correctement sur le staging avec le jeu factice, sur mobile et ordinateur, avec un score Lighthouse mobile ≥ 90.

### T1.7 Interrupteur de vente et configuration légale
- **Dépend de :** T1.6.
- **À faire :**
  - `config/entreprise.ts` : toutes les infos légales, avec des valeurs provisoires faciles à repérer ;
  - `SALES_ENABLED=false` (mode vitrine) :
    - le bouton devient **« Me prévenir de la sortie »** (liste d'attente par jeu ou générale) ;
    - les pages de paiement, le webhook et les pages de téléchargement renvoient une 404 ;
    - aucune formulation ne laisse croire qu'on peut déjà commander ;
  - `SALES_ENABLED=true` : bouton « Acheter » ;
  - réglage pour afficher ou masquer les prix ;
  - **garde-fou :** le build de production échoue si `SALES_ENABLED=true` alors qu'une valeur provisoire reste dans la configuration légale.
- **Terminé quand :** les deux modes fonctionnent sur le staging et le garde-fou bloque bien le build.

### T1.8 Achat et livraison (Stripe en mode test)
- **Dépend de :** T1.7.
- **À faire :**
  1. **Clic sur « Acheter » :** le serveur crée une session Stripe Checkout.
  2. **Consentement obligatoire :** le client accepte l'accès immédiat au contenu numérique et renonce à son droit de rétractation.
     - Via `consent_collection` + `custom_text` de Stripe, ou une case sur notre site.
     - La date et l'heure du consentement sont **enregistrées** dans la commande.
  3. **Webhook `checkout.session.completed` :**
     - vérification de la signature ;
     - **traitement idempotent** (un même événement ne crée jamais deux commandes) ;
     - création de la commande et des droits de téléchargement.
  4. **Email de confirmation (Brevo) :** liens de téléchargement, rappel écrit de la renonciation au droit de rétractation, lien vers les CGV.
  5. **Page de confirmation :** affiche aussi les liens.
  6. **Liens de téléchargement :**
     - token aléatoire d'au moins 32 octets ;
     - expiration après 7 jours et 5 téléchargements maximum (réglables) ;
     - email de l'acheteur en filigrane dans le PDF (pdf-lib).
  7. **Page « Retrouver mes téléchargements » :**
     - le client saisit son email et reçoit de nouveaux liens ;
     - le message affiché est le même, que l'email existe ou non ;
     - limitation du nombre de demandes.
  8. **Factures PDF :**
     - numérotation chronologique continue ;
     - mentions tirées de `config/entreprise.ts` ;
     - « TVA non applicable, art. 293 B du CGI » en cas de franchise de TVA (réglable) ;
     - **facture d'avoir** en cas de remboursement (on ne supprime jamais une facture).
- **Terminé quand :** un achat test complet fonctionne sur le staging : paiement → webhook → email → téléchargement avec filigrane → facture.

### T1.9 Jeu gratuit, listes d'attente et newsletter
- **Dépend de :** T1.7.
- **À faire :**
  - **Page `/jeu-gratuit`** et encarts sur le site. Le visiteur donne son email, confirme son inscription (double opt-in Brevo), puis reçoit le lien vers le mini-jeu gratuit.
  - **Listes d'attente** par jeu et générale, reliées au bouton « Me prévenir de la sortie ».
  - **Pages « bientôt disponible »** pour les jeux et saisons à venir. Elles sont indexables.
  - **Inscription à la newsletter** par une case non pré-cochée, séparée de l'achat.
  - **Lien de désinscription** dans chaque email.
  - **Texte de consentement** qui dit clairement ce que la personne recevra.
- **Terminé quand :** le parcours inscription → email de confirmation → accès au mini-jeu fonctionne avec un mini-jeu factice, et la désinscription fonctionne.

### T1.10 Admin minimale
- **Dépend de :** T1.8, T1.9.
- **À faire :**
  - accès protégé par authentification ;
  - liste des commandes ;
  - renvoi manuel des liens ;
  - désactivation d'un lien de téléchargement ;
  - inscrits aux listes d'attente, par jeu ;
  - statistiques simples (ventes par jeu).
- **Terminé quand :** l'équipe peut se connecter et voir les commandes de test et les inscrits.

### T1.11 Brouillons des pages légales
- **Dépend de :** T1.2 pour la rédaction, T1.7 pour le branchement sur la configuration.
- **À faire :** rédiger tous les brouillons, alimentés par `config/entreprise.ts` et marqués « À VALIDER PAR L'ÉQUIPE ».
  - **Pour la phase 2 (vitrine) :**
    - politique de confidentialité : collecte d'emails, Brevo, Umami, hébergeur, durées de conservation, droits des personnes ;
    - mentions légales de pré-lancement : responsable de la publication, hébergeur. Indique dans `docs/A_FAIRE_EQUIPE.md` ce qu'il faut y mettre tant que l'entreprise n'existe pas.
  - **Pour la phase 3 (ventes) :**
    - mentions légales complètes (SIRET, etc.) ;
    - CGV adaptées au contenu numérique : renonciation au droit de rétractation, licence d'usage privé, interdiction de revente et de partage, médiateur de la consommation, garantie légale de conformité des contenus numériques ;
    - politique de confidentialité complétée : Stripe, conservation des pièces comptables pendant 10 ans.
  - Note les points incertains dans `docs/A_FAIRE_EQUIPE.md`.
- **Terminé quand :** tous les brouillons sont visibles sur le staging.

### T1.12 SEO technique
- **Dépend de :** T1.6.
- **À faire :**
  - **Base de chaque page :**
    - `lang="fr"` ;
    - `title` et meta description uniques ;
    - URLs courtes en français ;
    - balise canonical.
  - **Partage :** Open Graph et Twitter Cards, avec une image par jeu (utile pour Pinterest).
  - **Indexation :** `sitemap.xml` dynamique et `robots.txt`.
  - **Données structurées JSON-LD :**
    - `Organization` et `WebSite` ;
    - `BreadcrumbList` ;
    - `Product` + `Offer` sur les fiches jeux. La disponibilité suit `SALES_ENABLED` : pas `InStock` tant que les ventes sont fermées ;
    - `BlogPosting` sur les articles.
  - **Navigation et liens :**
    - fil d'Ariane ;
    - liens internes entre collections, jeux et articles ;
    - bloc « jeux similaires ».
  - **Maintenance :** redirection 301 automatique quand un slug change.
- **Terminé quand :**
  - les données structurées sont valides dans l'outil de test des résultats enrichis de Google (en mode « code », puisque le staging est protégé) ;
  - le sitemap est généré ;
  - le `noindex` du staging est vérifié.

### T1.13 Mots-clés et calendrier éditorial
- **Dépend de :** T1.2 (aucun code nécessaire).
- **À faire :**
  - **Recherche de mots-clés en français.** Si tu as accès au web, utilise l'autocomplétion Google, « Autres questions posées », Google Trends et les pages concurrentes.
    - Livrable : `docs/seo/mots-cles.md`. Pour chaque page cible : requête principale, requêtes secondaires, intention de recherche, saisonnalité.
    - Exemples de familles : « escape game à imprimer », « escape game halloween enfant », « murder party halloween à télécharger », « jeu d'enquête anniversaire enfant », « escape game noël famille », « organiser un escape game à la maison ».
  - **Rôle de chaque type de page :**
    - pages collections : requêtes principales ;
    - fiches jeux : requêtes longues et précises ;
    - blog : questions pratiques.
  - **Slugs définitifs** des pages collections (pour T1.6).
  - **Calendrier éditorial** `docs/seo/calendrier.md`, avec 6 à 8 semaines d'avance sur chaque saison :

    | Quand | Sujet |
    |---|---|
    | Dès maintenant | Halloween, anniversaires (toute l'année) |
    | Avant le 20/10 | Noël, réveillon |
    | Début décembre | Saint-Valentin |
    | Fin janvier | Pâques |

  - **3 premiers articles** en brouillon dans `content/blog/<slug>.md`. Frontmatter : titre, description, date, statut, mots-clés.
- **Terminé quand :** les deux fichiers SEO existent, les slugs sont proposés et les 3 articles attendent la validation de l'équipe.

### T1.14 Statistiques de visite
- **Dépend de :** T1.3.
- **À faire :**
  - Umami auto-hébergé, sans cookies ;
  - événements suivis : clics sur « Me prévenir », inscriptions, et plus tard les achats.
- **Terminé quand :** les visites et les événements du staging apparaissent dans Umami.

### T1.15 Sécurité, sauvegardes, surveillance
- **Dépend de :** T1.3.
- **À faire :**
  - **Sécurité :** en-têtes de sécurité (CSP, HSTS…), limitation du nombre de requêtes sur les routes sensibles (téléchargement, renvoi de liens, contact, listes d'attente, newsletter), logs sans données sensibles.
  - **Sauvegardes quotidiennes :** dump Postgres + fichiers privés, conservation 14 jours, copie hors du VPS.
  - **Surveillance :** alerte si le site tombe. Idéalement via un service externe (compte créé par l'équipe), sinon Uptime Kuma.
- **Terminé quand :** une restauration complète a été testée et documentée dans le README, et une alerte de test a bien été reçue.

### T1.16 Tests automatisés
- **Dépend de :** T1.8, T1.9.
- **À faire :**
  - **Tests unitaires :** création de commande, tokens, expiration, quotas, idempotence du webhook, numérotation des factures.
  - **Test E2E Playwright** du parcours d'achat en mode test, avec Stripe CLI pour les webhooks.
  - **Test E2E du mode vitrine :** impossible d'acheter quand `SALES_ENABLED=false`.
- **Terminé quand :** tous les tests passent et la commande pour les lancer est dans le README.

---

## Checklist de fin de phase 1 **[VALIDATION ÉQUIPE]**
- [ ] Tâches T1.1 à T1.16 terminées dans `docs/PROGRESS.md`.
- [ ] Achat test complet sur le staging : paiement → webhook → email → téléchargement → filigrane → facture.
- [ ] Un webhook renvoyé une deuxième fois ne crée pas de commande en double.
- [ ] Liens expirés, quotas dépassés et tokens invalides correctement gérés, renvoi des liens fonctionnel.
- [ ] Mode vitrine vérifié : impossible d'acheter.
- [ ] Jeu gratuit, listes d'attente et désinscription fonctionnels.
- [ ] Brouillons légaux prêts à être relus.
- [ ] Lighthouse mobile ≥ 90 sur l'accueil, le catalogue et une fiche jeu.
- [ ] Sauvegarde et restauration testées, surveillance active.

**Ensuite :** résume la phase dans `docs/PROGRESS.md`. Demande à l'équipe de valider, puis de passer « Phase en cours » à 2 dans `AGENTS.md`.
