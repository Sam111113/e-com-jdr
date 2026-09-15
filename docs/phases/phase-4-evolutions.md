# Phase 4 : évolutions

> Lis d'abord `AGENTS.md`. Ce fichier détaille les tâches de la phase 4.

## Objectif
Faire grandir le site après l'ouverture des ventes, et gérer la routine des saisons.

**C'est l'équipe qui choisit l'ordre des tâches V2 et V3.** Si elle te le demande, propose une priorisation dans `docs/PLAN.md`, en t'appuyant sur les ventes et les listes d'attente.

## Prérequis
- Phase 3 terminée.

---

## Routine (en continu)

### T4.R1 Calendrier des saisons
- **À faire :**
  - régler les dates de la saison active mise en avant sur l'accueil ;
  - mettre à jour les pages saisonnières **sur la même URL** chaque année ;
  - publier les articles et les pages « bientôt disponible » 6 à 8 semaines avant chaque saison ;
  - tenir `docs/seo/calendrier.md` à jour.

### T4.R2 Suivi mensuel
- **À faire :** rapport mensuel `docs/seo/rapports/AAAA-MM.md` :
  - SEO ;
  - ventes par jeu ;
  - taux de conversion des listes d'attente en achats ;
  - actions prévues le mois suivant.

### T4.R3 Maintenance
- **À faire :**
  - mettre à jour les dépendances ;
  - vérifier les sauvegardes, avec un test de restauration **chaque trimestre** ;
  - vérifier le score Lighthouse ;
  - relire les logs d'erreurs.

---

## V2

### T4.1 Avis vérifiés
- **À faire :**
  - lien envoyé par email après l'achat, **aux acheteurs uniquement** ;
  - avis affichés avec la mention « avis vérifiés : acheteurs uniquement » ;
  - modération dans l'admin ;
  - note dans les données structurées **uniquement avec de vrais avis**.
- **Terminé quand :** un acheteur de test peut laisser un avis, qui s'affiche après modération.

### T4.2 Packs et licence pro
- **À faire :**
  - packs de plusieurs jeux à prix réduit ;
  - licence pro (animateurs, écoles, centres de loisirs) : prix différent, conditions d'usage ajoutées aux CGV **après validation de l'équipe**.
- **Terminé quand :** on peut acheter un pack et une licence pro, et les téléchargements et factures sont corrects.

### T4.3 Générateur d'invitations personnalisées
- **À faire :** formulaire (prénom, date, lieu) qui génère un PDF d'invitation aux couleurs du jeu.
- **Terminé quand :** le PDF généré est correct sur mobile et à l'impression.

### T4.4 Images Pinterest automatiques
- **À faire :** générer pour chaque jeu une image verticale 1000×1500, à partir de la couverture et du titre.
- **Terminé quand :** chaque jeu publié a son image, accessible depuis la fiche.

### T4.5 Compte client par lien magique
- **À faire :** connexion sans mot de passe par email, historique des achats, re-téléchargement.
- **Terminé quand :** un client retrouve tous ses achats sans contacter l'équipe.

### T4.6 Pixels publicitaires avec consentement
- **À faire :**
  - bandeau de consentement conforme CNIL ;
  - pixels Meta et TikTok chargés **uniquement après accord** du visiteur ;
  - politique de confidentialité mise à jour, avec validation de l'équipe.
- **Terminé quand :** aucun pixel ne se charge sans consentement (vérifié dans le navigateur).

---

## V3

### T4.7 « Compagnon de jeu » en ligne
- **À faire :**
  - minuteur ;
  - indices débloqués par QR code imprimé dans le kit ;
  - ambiance sonore ;
  - accès réservé aux acheteurs.
- **Terminé quand :** une partie complète peut se jouer avec le compagnon sur mobile.

### T4.8 Kits personnalisés
- **À faire :** génération du kit avec des éléments personnalisés (par exemple le prénom de l'enfant dans l'histoire), vendu plus cher.
- **Terminé quand :** un kit personnalisé est généré et livré automatiquement après l'achat.
