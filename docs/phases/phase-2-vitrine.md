# Phase 2 : vitrine publique

> Lis d'abord `AGENTS.md`. Ce fichier détaille les tâches de la phase 2.

## Objectif
Mettre le site en ligne sur le vrai domaine **sans aucune vente** (`SALES_ENABLED=false`). Deux buts :
- que Google découvre et indexe le site le plus tôt possible ;
- collecter des emails avant l'ouverture des ventes.

La phase dure **jusqu'à ce que l'équipe déclenche la phase 3**.

## Prérequis
- Phase 1 validée par l'équipe.

## Jalons
| Date | Jalon | Tâches |
|---|---|---|
| ~30/09 | Vitrine en ligne | T2.1 → T2.4 |
| ~01/10 | Premier vrai jeu en ligne | T2.5 |
| Avant le 20/10 | Page Noël publiée | T2.7 |
| Fin octobre | Premier rapport de suivi | T2.8 |
| En continu | Nouveaux jeux, articles, suivi | T2.5, T2.6, T2.8 |

## Pistes parallèles
| Piste | Tâches (dans l'ordre) | Peut démarrer |
|---|---|---|
| **A. Mise en ligne** | T2.1 → T2.2 → T2.3 → T2.4 | dès le début de la phase |
| **B. Contenu** | T2.5, T2.6, T2.7 | T2.5 après T2.1, les autres après T2.4 |
| **C. Suivi et préparation** | T2.8, T2.9 | après T2.4 |

## Ce que l'équipe fournit
- **Validations :**
  - pages légales de pré-lancement ;
  - mise en ligne publique ;
  - 3 premiers articles.
- **Contenu :** textes et photos pour la page « à propos ».
- **Accès :** Google Search Console, ou ajout de l'enregistrement DNS de vérification.
- **Emails :** enregistrements DNS SPF, DKIM et DMARC, si tu n'as pas accès au DNS.
- **Jeux :** vrais dossiers `content/games/<slug>/`, au fil de l'eau.

---

## Tâches

### T2.1 Environnement de production
- **Dépend de :** phase 1 validée.
- **À faire :**
  - déployer la production sur `[DOMAINE]`, **encore protégée par mot de passe** ;
  - `SALES_ENABLED=false` et **aucune clé Stripe** en production ;
  - Brevo configuré, avec SPF, DKIM et DMARC ;
  - sauvegardes et surveillance identiques au staging.
- **Terminé quand :** le site tourne sur le vrai domaine, derrière le mot de passe, et les emails de test arrivent en boîte de réception.

### T2.2 Pages légales de pré-lancement **[VALIDATION ÉQUIPE]**
- **Dépend de :** T1.11.
- **À faire :** finaliser la politique de confidentialité et les mentions légales de pré-lancement, puis les soumettre à l'équipe.
- **Terminé quand :** l'équipe a validé les deux pages.

### T2.3 Checklist de mise en ligne **[VALIDATION ÉQUIPE]**
- **Dépend de :** T2.1, T2.2.
- **À faire :** vérifier chaque point et noter le résultat dans `docs/PROGRESS.md`.
  - [ ] Mode vitrine vérifié en production : impossible d'acheter, pages de paiement et de téléchargement inaccessibles.
  - [ ] **Jeu factice retiré** de la production.
  - [ ] Listes d'attente et jeu gratuit fonctionnels (double opt-in, désinscription).
  - [ ] Politique de confidentialité et mentions légales de pré-lancement validées.
  - [ ] Emails reçus en boîte de réception (pas en spam) sur Gmail et Outlook.
  - [ ] Lighthouse mobile ≥ 90, sitemap et robots corrects.
  - [ ] Staging toujours protégé et non indexable.
  - [ ] Sauvegarde et restauration testées, surveillance active.
- **Terminé quand :** tous les points sont cochés. **Demande la validation de l'équipe pour ouvrir le site au public.**

### T2.4 Mise en ligne publique
- **Dépend de :** T2.3 validée.
- **À faire :**
  - retirer le mot de passe de la production ;
  - vérifier que la production est indexable, et le staging toujours non ;
  - vérifier le domaine dans Google Search Console et Bing Webmaster Tools ;
  - soumettre le sitemap ;
  - vérifier que Umami compte bien les visites de production.
- **Terminé quand :** le site est public, le sitemap est soumis et le staging reste protégé.

### T2.5 Import des vrais jeux (en continu)
- **Dépend de :** T2.1.
- **À faire, à chaque dossier déposé par l'équipe :**
  - lancer `npm run import-games` ;
  - si une information manque, l'ajouter à `docs/A_FAIRE_EQUIPE.md`. **Ne jamais l'inventer** ;
  - activer la liste d'attente du jeu ;
  - mettre à jour les liens internes (collections, jeux similaires, articles).
- **Terminé quand (pour chaque jeu) :** la fiche publique est complète, la liste d'attente est active et le jeu est dans le sitemap.

### T2.6 Articles de blog (en continu)
- **Dépend de :** T1.13, T2.4.
- **À faire :**
  - publier les **3 premiers articles uniquement après validation** de l'équipe ;
  - ensuite, 2 à 3 articles par semaine selon `docs/seo/calendrier.md` ;
  - chaque article contient :
    - un plan clair ;
    - des conseils concrets ;
    - des liens vers les jeux pertinents ;
    - une image ;
    - une FAQ si elle est utile.
- **Terminé quand (pour chaque article) :** il est publié, présent dans le sitemap et lié depuis au moins une autre page.

### T2.7 Pages des saisons à venir
- **Dépend de :** T2.4.
- **À faire :**
  - page **Noël** « bientôt disponible », avec liste d'attente, **avant le 20/10** ;
  - puis Saint-Valentin (début décembre) et Pâques (fin janvier), selon le calendrier ;
  - URLs permanentes, indexables.
- **Terminé quand :** la page Noël est en ligne avant le 20/10.

### T2.8 Suivi
- **Dépend de :** T2.4.
- **À faire :**
  - **Rapport mensuel** `docs/seo/rapports/AAAA-MM.md` :
    - pages indexées ;
    - requêtes et positions (Search Console) ;
    - pages les plus visitées (Umami) ;
    - inscrits aux listes d'attente par jeu ;
    - actions prévues le mois suivant.
  - **Lighthouse** vérifié après chaque changement important.
  - **Dépendances** mises à jour et **sauvegardes** vérifiées.
- **Terminé quand :** le premier rapport est écrit fin octobre, puis un rapport chaque mois.

### T2.9 Préparer l'ouverture des ventes
- **Dépend de :** T2.4.
- **À faire :**
  - écrire la section « Ouvrir les ventes » du README, étape par étape ;
  - faire une répétition de la checklist de la phase 3 sur le staging, avec les valeurs provisoires ;
  - rédiger le brouillon de l'email d'annonce aux listes d'attente. **Il n'est pas envoyé** ;
  - lister dans `docs/A_FAIRE_EQUIPE.md` exactement ce que l'équipe doit fournir pour la phase 3.
- **Terminé quand :** l'équipe sait exactement quoi fournir, et l'ouverture peut se faire en moins de 48 h.

---

## Fin de phase 2
Cette phase ne se termine pas d'elle-même. Continue les tâches T2.5 à T2.8 jusqu'à ce que l'équipe :
1. complète la section 0 « Plus tard » d'`AGENTS.md` ;
2. écrive les clés Stripe live dans le `.env` de production ;
3. passe « Phase en cours » à 3.
