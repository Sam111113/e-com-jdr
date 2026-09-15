# Phase 3 : ouverture des ventes

> Lis d'abord `AGENTS.md`. Ce fichier détaille les tâches de la phase 3.

## Objectif
Remplacer les valeurs provisoires par les vraies infos administratives, activer le paiement réel et annoncer l'ouverture.

**Cible : moins de 48 h** entre la réception des infos et l'ouverture des ventes.

## Déclenchement
La phase commence quand l'équipe a :
- créé l'entreprise et obtenu le SIRET ;
- complété la section 0 « Plus tard » d'`AGENTS.md` ;
- écrit les clés Stripe **live** dans le `.env` de production ;
- passé « Phase en cours » à 3.

## Pistes parallèles
| Piste | Tâches (dans l'ordre) | Peut démarrer |
|---|---|---|
| **A. Légal** | T3.1 → T3.2 | dès le début de la phase |
| **B. Paiement** | T3.3 → T3.4 | dès le début de la phase |
| **C. Ouverture** | T3.5 → T3.6 → T3.7 → T3.8 → T3.9 | quand les pistes A et B sont terminées |

## Ce que l'équipe fournit
- **Admin :** infos légales et médiateur de la consommation.
- **Paiement :** clés Stripe live, écrites dans `.env`.
- **Validations :**
  - pages légales définitives ;
  - ouverture des ventes ;
  - email d'annonce.
- **Test :** un vrai achat de petit montant en production.

---

## Tâches

### T3.1 Configuration légale définitive
- **Dépend de :** déclenchement de la phase.
- **À faire :**
  - remplacer toutes les valeurs provisoires de `config/entreprise.ts` ;
  - régler la mention de TVA selon le régime indiqué par l'équipe.
- **Terminé quand :** sur le staging, le build de production avec `SALES_ENABLED=true` passe le garde-fou.

### T3.2 Pages légales définitives **[VALIDATION ÉQUIPE]**
- **Dépend de :** T3.1.
- **À faire :** finaliser et soumettre à l'équipe :
  - **mentions légales complètes** (SIRET, etc.) ;
  - **CGV adaptées au contenu numérique :**
    - renonciation au droit de rétractation ;
    - licence d'usage privé, interdiction de revente et de partage ;
    - médiateur de la consommation ;
    - garantie légale de conformité des contenus numériques ;
  - **politique de confidentialité complétée :** Stripe, conservation des pièces comptables pendant 10 ans.
- **Terminé quand :** l'équipe a validé les trois pages.

### T3.3 Stripe en production
- **Dépend de :** déclenchement de la phase.
- **À faire :**
  - créer le webhook de production (mode live), avec son propre secret de signature ;
  - vérifier les réglages de Checkout : URL des CGV pour le consentement, codes promo ;
  - le staging reste en mode test.
- **Terminé quand :** le webhook live est actif dans Stripe et la configuration est vérifiée, sans aucun paiement réel pour l'instant.

### T3.4 Test complet sur le staging
- **Dépend de :** T3.1, T3.3.
- **À faire :** rejouer tout le parcours avec le code actuel :
  - paiement → webhook → email → téléchargement → filigrane → facture ;
  - un webhook renvoyé une deuxième fois ne crée pas de doublon ;
  - liens expirés, quotas dépassés et tokens invalides ;
  - renvoi des liens ;
  - remboursement → facture d'avoir.
- **Terminé quand :** tous les cas passent. Note les résultats dans `docs/PROGRESS.md`.

### T3.5 Checklist d'ouverture **[VALIDATION ÉQUIPE]**
- **Dépend de :** T3.2, T3.4.
- **À faire :**
  - [ ] Plus aucune valeur provisoire dans la configuration légale.
  - [ ] Mentions légales, CGV et politique de confidentialité définitives validées.
  - [ ] Parcours complet validé sur le staging (T3.4).
  - [ ] Au moins un vrai jeu en ligne.
  - [ ] Webhook Stripe live configuré, surveillance du webhook prête.
  - [ ] Email d'annonce prêt (brouillon de T2.9 mis à jour).
- **Terminé quand :** tous les points sont cochés. **Demande la validation de l'équipe pour ouvrir les ventes.**

### T3.6 Activation des ventes
- **Dépend de :** T3.5 validée.
- **À faire :**
  - passer `SALES_ENABLED=true` en production ;
  - vérifier que les boutons « Acheter » s'affichent et que la disponibilité dans les données structurées passe à `InStock` ;
  - activer la surveillance du webhook Stripe.
- **Terminé quand :** un visiteur peut acheter en production.

### T3.7 Vrai achat de test (fait par l'équipe)
- **Dépend de :** T3.6.
- **À faire :**
  - l'équipe achète un jeu avec une vraie carte ;
  - l'équipe vérifie l'email, le téléchargement et la facture ;
  - l'achat est ensuite remboursé ;
  - de ton côté, vérifie la commande dans l'admin, les logs, et la création de la facture d'avoir.
- **Terminé quand :** l'achat, le remboursement et l'avoir sont vérifiés.

### T3.8 Annonce de l'ouverture **[VALIDATION ÉQUIPE]**
- **Dépend de :** T3.7.
- **À faire :**
  - finaliser les emails pour les listes d'attente (par jeu et générale) ;
  - ajouter un bandeau d'ouverture sur l'accueil ;
  - envoyer via Brevo **uniquement après validation**.
- **Terminé quand :** les emails sont envoyés après validation.

### T3.9 Surveillance renforcée (72 h)
- **Dépend de :** T3.6.
- **À faire :**
  - surveiller les erreurs de webhook, les emails non délivrés, les téléchargements en échec, les paiements refusés et les pages 404 ;
  - corriger vite tout problème bloquant ;
  - noter tout incident dans `docs/PROGRESS.md`.
- **Terminé quand :** 72 h se sont écoulées sans incident bloquant, et un court bilan est écrit.

---

## Fin de phase 3
Résume la phase dans `docs/PROGRESS.md`. Demande à l'équipe de passer « Phase en cours » à 4.
