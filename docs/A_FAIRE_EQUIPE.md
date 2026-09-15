# À faire par l'équipe

> Classé par phase, puis par urgence. L'agent ne peut pas réaliser ces points lui-même (accès aux comptes, décisions engageant l'équipe, ou hors de son périmètre technique).

---

## Phase 1 — Urgent (bloque le développement)

- [ ] **Compléter la section 0 « Tout de suite » d'`AGENTS.md`** : nom de la marque, domaine + registrar/DNS, email de contact public, dépôt Git distant (a priori `github.com/Sam111113/e-com-jdr`, à confirmer), contact pour les validations. *Sans ces infos, l'agent utilise des valeurs provisoires clairement marquées et ne peut pas configurer le sous-domaine `staging.[DOMAINE]`.*
- [ ] **Choisir l'option HTTPS** pour le staging et la prod — voir `docs/PLAN.md`, section « Options pour le HTTPS » (Traefik partagé recommandé par l'agent, Cloudflare Tunnel en alternative, ou autre proposition de l'équipe). *Bloque T1.3.*
- [ ] **Valider `docs/PLAN.md` (T1.2)** dans son ensemble. *Bloque le début du code (T1.3 et tout ce qui en dépend).*
- [ ] **Configurer le DNS du sous-domaine `staging.[DOMAINE]`** une fois le domaine choisi (enregistrement A vers l'IP du VPS, ou CNAME si Cloudflare Tunnel est retenu). L'agent indiquera l'enregistrement exact une fois l'option HTTPS choisie.
- [ ] **Créer un compte Stripe** (même non activé, le mode test suffit) et écrire les clés **test** dans le `.env` du VPS. *Nécessaire pour T1.8.*
- [ ] **Créer un compte Brevo** et écrire la clé API dans le `.env` du VPS. *Nécessaire pour T1.9.*
- [ ] **Choisir la destination des sauvegardes hors du VPS** (T1.15) : service externe (ex. Backblaze B2, autre serveur) — création de compte par l'équipe si besoin.

## Phase 1 — Important (à fournir avant les jalons correspondants)

- [ ] **Valider une direction visuelle** parmi les deux propositions de T1.4 (vers le 18/09 selon le jalon du fichier de phase).
- [ ] **Fournir le premier vrai jeu** (fiche + PDF + visuels) vers le 01/10. En attendant, l'agent utilise un jeu factice clairement marqué comme tel.
- [ ] **Décider du modèle d'authentification admin** (T1.10) : compte partagé simple ou comptes nominatifs dès la phase 1 ?

## Phase 1 — Plus tard mais à anticiper

- [ ] **Mentions légales de pré-lancement (phase 2, T1.11/T2.2)** : tant que l'entreprise n'existe pas, indiquer qui sera nommé comme responsable de la publication et quel hébergeur mentionner (le VPS est chez qui ?).

---

## Phase 2 — À préparer

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
