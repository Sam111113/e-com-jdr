# Plan technique

> Créé pour T1.2. Section « Audit » créée pour T1.1.
>
> **Validé par l'équipe le 15/09/2026, avec amendements** : ce VPS sert au développement et au staging uniquement (la production aura son propre VPS), staging accessible via Tailscale, numérotation des factures sans rupture, base Postgres et Playwright disponibles dans le conteneur de l'agent. Voir `docs/DECISIONS.md` (D6, D8 à D10).

---

## Audit (T1.1)

**Réalisé par :** l'équipe, depuis l'hôte, le 15/09/2026 (l'agent ne peut pas auditer le VPS depuis son conteneur OpenCode — voir AGENTS.md section 8). **Lecture seule, rien n'a été modifié.**

### Système
| Élément | Valeur |
|---|---|
| OS | Ubuntu 24.04.3 LTS |
| CPU | 2 vCPU |
| RAM | 7,8 Go (6,5 Go disponibles) |
| Disque | 96 Go (89 Go libres) |
| Docker | 29.1.3 |
| Docker Compose | 5.0.0 |

### Conteneurs déjà en place
| Conteneur | Port(s) publiés | Rôle |
|---|---|---|
| `n8n-n8n-1` | `127.0.0.1:5678` | n8n (automatisations), local uniquement |
| `n8n-traefik-1` | `0.0.0.0:80`, `0.0.0.0:443` | Reverse proxy pour n8n, occupe les deux ports HTTP(S) standards |
| `opencode` | `127.0.0.1:4096` | Cet agent, local uniquement |

### Traefik (à ne jamais reconfigurer sans validation)
- Provider Docker, `exposedByDefault=false` : un conteneur n'est routé que s'il porte les labels Traefik adéquats.
- Redirection HTTP → HTTPS automatique.
- Résolveur de certificats `mytlschallenge` (TLS-ALPN-01, pas besoin d'exposer un port 80 séparé pour le challenge).
- Réseau Docker `n8n_default`.
- **Nos conteneurs ne passent pas par Traefik** et ne rejoignent jamais `n8n_default` (décision D6) : partager ce réseau donnerait à un site public un accès direct au port interne de n8n.

### Ports déjà pris sur l'hôte
22 (SSH), 80, 443, 5678 (n8n), 4096 (OpenCode), 8443 (Tailscale → OpenCode). **Réservés au staging :** 3000 (app), 3001 (Umami), 8444 (Tailscale → app). Disponibilité de 3000, 3001 et 8444 vérifiée le 15/09/2026.

### DNS
Non nécessaire en phase 1 : le staging est servi par Tailscale. Le domaine et le DNS définitifs seront configurés avec le VPS de production.

### Conséquences pour l'architecture
- Notre Postgres, notre app et Umami tourneront dans **notre propre** `docker compose`, sur un réseau dédié, **sans jamais publier de port Postgres sur l'hôte**.
- Sur ce VPS, les ports 80 et 443 appartiennent à Traefik/n8n. Le staging est donc exposé **uniquement sur le tailnet** via Tailscale Serve, sans port public.
- La production sera déployée sur un **VPS dédié**, où Caddy pourra occuper 80/443 comme prévu en section 4 d'`AGENTS.md`.

---

## Architecture (T1.2)

### Vue d'ensemble — staging (ce VPS de développement)
```
Appareils de l'équipe (tailnet Tailscale uniquement, aucune exposition publique)
   │
   ▼
Tailscale Serve (hôte) : https://srv1214588.taild2e4d0.ts.net:8444
   │
   ▼
App Next.js (conteneur "app", publié sur 127.0.0.1:3000 de l'hôte uniquement)
   │
   ├──▶ Postgres 18 (conteneur "postgres", réseau interne "ecomjdr" uniquement, aucun port publié)
   ├──▶ Umami (conteneur "umami", publié sur 127.0.0.1:3001, base dédiée sur le même serveur Postgres)
   ├──▶ Stockage privé (volume Docker monté dans "app", jamais servi en statique)
   └──▶ APIs externes : Stripe (mode test), Brevo (sortant uniquement)
```

### Vue d'ensemble — production (VPS dédié, provisionné plus tard par l'équipe)
```
Internet ──▶ Caddy (80/443, HTTPS automatique) ──▶ App Next.js ──▶ Postgres 18 / Umami / stockage privé
```
Même `docker compose` que le staging, avec Caddy en plus. Le choix de l'hébergeur et du domaine est à faire par l'équipe avant la phase 2.

### Réseaux Docker
- `ecomjdr_default` (créé par notre `docker-compose.yml`) : app, postgres, umami. Réseau interne, pas de port publié pour postgres.
- **Aucune connexion au réseau `n8n_default`**, ni à aucun autre réseau existant sur ce VPS.

### Environnements
- **Staging** (ce VPS) : `https://srv1214588.taild2e4d0.ts.net:8444`, accessible uniquement depuis le tailnet. `SALES_ENABLED=true` pour tester tout le parcours, Stripe en mode test. On garde le mot de passe HTTP (middleware Next.js) et le `noindex` exigés par le brief, en plus de la restriction Tailscale.
  - **Webhooks Stripe :** Stripe ne peut pas joindre une URL du tailnet. On utilise Stripe CLI (`stripe listen --forward-to http://127.0.0.1:3000/api/webhooks/stripe`), déjà prévue pour les tests.
  - **Liens d'emails Brevo** (double opt-in, téléchargements) : ils pointent vers l'URL du staging et ne s'ouvrent que depuis un appareil du tailnet. C'est attendu en staging.
- **Production** (VPS dédié, à venir) : `[DOMAINE]`, `SALES_ENABLED=false` jusqu'à la phase 3, pas de clé Stripe, en vitrine à partir de la phase 2 seulement.
- **Développement et tests** (conteneur de l'agent) : voir la section dédiée ci-dessous.

### HTTPS — **décidé par l'équipe le 15/09/2026**
- **Staging :** Tailscale Serve, certificat `ts.net` fourni par Tailscale. Commande exécutée par l'équipe sur l'hôte : `tailscale serve --bg --https=8444 http://127.0.0.1:3000`.
- **Production :** Caddy sur le VPS dédié.
- **Écartés :** Traefik partagé (relierait un site public au réseau de n8n), Cloudflare Tunnel (inutile sans domaine, sur un VPS de développement), libération des ports 80/443 (toucherait n8n).

### Développement et tests (conteneur de l'agent)
- **PostgreSQL 18** tourne dans le conteneur de l'agent, écoute sur `127.0.0.1` uniquement, jamais publié :
  - `DEV_DATABASE_URL` → base `ecomjdr_dev` ;
  - `TEST_DATABASE_URL` → base `ecomjdr_test`, que les tests peuvent vider librement.
  - Staging et production utilisent aussi **PostgreSQL 18** (image `postgres:18`), pour rester sur la même version majeure.
- **Playwright** fonctionne dans le conteneur avec le Chromium du système (vérifié le 15/09/2026 : Playwright 1.63, Chromium 152, test E2E mobile passé). Configuration : `launchOptions: { executablePath: process.env.CHROMIUM_PATH }`. Le téléchargement des navigateurs est désactivé (`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`).
- **Stripe CLI** n'est pas encore installée dans le conteneur : à ajouter avant T1.8 (voir `docs/A_FAIRE_EQUIPE.md`).

### Arborescence du dépôt (proposée)
```
e-com-jdr/
├── app/                        # Next.js App Router
│   ├── (site)/                 # pages publiques : accueil, /jeux, /jeux/[slug], collections, blog...
│   ├── (admin)/                # espace admin protégé
│   └── api/                    # routes API (checkout, webhook Stripe, téléchargement, contact...)
├── components/
├── config/
│   └── entreprise.ts           # infos légales centralisées, valeurs provisoires marquées
├── content/
│   ├── games/<slug>/           # fiche.md, kit.pdf (déplacé en storage privé après import), cover.jpg...
│   ├── blog/<slug>.md
│   └── _modele/fiche.md
├── db/
│   ├── schema.ts                # schéma Drizzle
│   └── migrations/
├── lib/
│   ├── storage/                 # interface storage + implémentation locale (puis S3/R2)
│   ├── stripe/
│   ├── email/                   # client Brevo
│   ├── pdf/                     # filigrane (pdf-lib), génération factures
│   └── sales-enabled.ts         # helper + garde-fou de build
├── scripts/
│   ├── import-games.ts
│   └── check-legal-config.ts     # garde-fou build prod
├── docker/
│   ├── docker-compose.yml       # app, postgres 18, umami (commun staging / prod)
│   ├── docker-compose.prod.yml  # ajoute Caddy (VPS de production uniquement)
│   └── Caddyfile                # production uniquement
├── tests/
│   ├── unit/
│   └── e2e/
├── docs/
├── public/
├── .env.example
└── package.json
```

### Schéma de base de données (Drizzle / Postgres)
| Table | Champs clés | Rôle |
|---|---|---|
| `games` | id, slug (unique), title, status (brouillon/publie), collections (text[]), public, age_min, joueurs_min, joueurs_max, duree_minutes, difficulte, prix_eur (int, centimes), pitch, histoire, contenu_kit, preparation, deroule, faq, cover_path, apercu_paths (json), kit_pdf_key (clé storage privée), created_at, updated_at | Catalogue des jeux, alimenté par `import-games` |
| `orders` | id, stripe_session_id (unique), customer_email, status (pending/paid/refunded), amount_total, currency, consent_at, consent_text, created_at | Une commande = une session Stripe Checkout |
| `order_items` | id, order_id (FK), game_id (FK), unit_price, quantity | Lignes de commande (plusieurs jeux possibles par commande) |
| `download_tokens` | id, order_item_id (FK), token_hash, expires_at, max_downloads, download_count, revoked_at | Droits de téléchargement : token ≥32 octets, expiration 7j, 5 téléchargements (réglables) |
| `invoice_counters` | series (PK : `facture` / `avoir`), last_number (int, non nul) | Compteur transactionnel qui garantit une numérotation sans trou (voir ci-dessous) |
| `invoices` | id, order_id (FK), series (`facture` / `avoir`), number (int), display_number (ex. `F-000001`), credited_invoice_id (FK nullable : facture annulée par cet avoir), pdf_key (nullable tant que le PDF n'est pas généré), legal_snapshot (json, copie de `config/entreprise.ts` au moment de l'émission), issued_at — **unicité `(series, number)`** | Factures, jamais supprimées ni renumérotées ; un remboursement crée un avoir |
| `subscriptions` | id, email, type (newsletter / liste_attente / jeu_gratuit), game_id (FK, nullable = liste générale), consent_text, confirmed_at (double opt-in), unsubscribed_at, created_at | Table unique pour newsletter, listes d'attente et jeu gratuit, différenciée par `type` + `game_id` |
| `admin_users` | id, email, password_hash, created_at | Accès à l'admin minimale (T1.10) |

Interface `storage` (dans `lib/storage`) : `put(key, buffer)`, `get(key)`, `delete(key)`, `getPrivateUrl(key, ttl)` — implémentation `LocalDiskStorage` (dossier hors du webroot, ex. `/data/private`) en phase 1-2, remplaçable par une implémentation S3/R2 sans changer le code appelant.

### Numérotation des factures — **sans rupture (exigence légale, décision D8)**
La numérotation doit être chronologique et continue, **sans aucun trou**.

**Interdit :** toute séquence Postgres (`serial`, `identity`, `nextval`). Un numéro tiré par une transaction qui échoue ensuite est perdu définitivement, ce qui crée un trou dans la numérotation.

**Mécanisme imposé :**
1. `invoice_counters` contient une ligne par série (`facture`, `avoir`), initialisée à 0 par une migration.
2. Dans **la même transaction** que l'insertion de la facture :
   `UPDATE invoice_counters SET last_number = last_number + 1 WHERE series = $1 RETURNING last_number`.
   - Le verrou de ligne pris par cet `UPDATE` sérialise les émissions concurrentes : l'ordre des numéros suit l'ordre d'émission.
   - Si la transaction échoue, l'incrément est annulé avec elle : aucun numéro n'est perdu.
3. `issued_at` est fixé dans cette même transaction.
4. **Le PDF est généré après la validation de la transaction**, à partir de `legal_snapshot`. S'il échoue, on le régénère plus tard : le numéro est déjà attribué et n'est jamais réattribué.
5. Une facture n'est jamais supprimée ni modifiée. Un remboursement crée un avoir (série `avoir`) qui référence la facture d'origine via `credited_invoice_id`.

**Tests obligatoires (T1.16) :**
- plusieurs émissions simultanées → numéros consécutifs, sans doublon ni trou ;
- transaction annulée après l'incrément → le numéro suivant n'est pas sauté ;
- échec de la génération du PDF → la facture et son numéro existent, le PDF peut être régénéré ;
- émission d'un avoir → la facture d'origine reste inchangée.

**Format proposé :** `F-000001` pour les factures et `A-000001` pour les avoirs, sans remise à zéro annuelle. **Format à faire valider par l'équipe ou son comptable** (voir `docs/A_FAIRE_EQUIPE.md`).

### `SALES_ENABLED` et configuration légale centralisée
- `config/entreprise.ts` exporte un objet unique avec toutes les infos légales (nom, statut, SIRET, adresse, régime TVA, médiateur…). Les valeurs provisoires utilisent un marqueur détectable, par ex. `"À COMPLÉTER"`.
- `lib/sales-enabled.ts` lit `process.env.SALES_ENABLED` (`NEXT_PUBLIC_SALES_ENABLED` côté client pour l'affichage du bouton) : `false` → bouton « Me prévenir de la sortie », routes `/api/checkout`, `/api/webhooks/stripe`, `/api/download/*` renvoient 404.
- **Garde-fou de build :** `scripts/check-legal-config.ts`, exécuté en `prebuild` (npm script), lève une erreur (exit code ≠ 0) si `SALES_ENABLED=true` **et** qu'au moins une valeur de `config/entreprise.ts` contient encore le marqueur provisoire. Le build de production échoue alors volontairement.

### Estimation des tâches (en jours-agent, indicatif)
| Tâche | Estimation | Dépend de |
|---|---|---|
| T1.1 | 0,5 j (fait) | — |
| T1.2 | 0,5 j (fait, validé le 15/09 avec amendements) | T1.1 |
| T1.3 | 1 j | T1.2 validée (fait) |
| T1.4 | 1 j | T1.2 |
| T1.5 | 1,5 j | T1.3 |
| T1.6 | 3 j | T1.4, T1.5 |
| T1.7 | 1 j | T1.6 |
| T1.8 | 3 j | T1.7 |
| T1.9 | 1,5 j | T1.7 |
| T1.10 | 1,5 j | T1.8, T1.9 |
| T1.11 | 1 j | T1.2, T1.7 |
| T1.12 | 1 j | T1.6 |
| T1.13 | 1 j | T1.2 |
| T1.14 | 0,5 j | T1.3 |
| T1.15 | 1,5 j | T1.3 |
| T1.16 | 2 j | T1.8, T1.9 |
| **Total** | **~21 j-agent** | |

### Risques par rapport aux dates
- **Fenêtre courte (15/09 → 28/09, soit 13 jours calendaires) face à ~21 jours-agent estimés.** Les pistes parallèles (A à E) et la délégation aux workers réduisent le risque, mais un dépassement est probable si tout doit être 100 % terminé au 28/09. À suivre de près, avec priorisation possible (parcours d'achat T1.7-T1.8 avant le confort du SEO T1.12-T1.13 si le temps manque).
- **VPS de production et domaine pas encore provisionnés :** ne bloquent pas la phase 1 (staging via Tailscale), mais **bloquent la phase 2** (vitrine publique prévue vers le 30/09). À anticiper par l'équipe.
- **Clés Stripe test et Brevo à fournir par l'équipe :** nécessaires pour T1.8 et T1.9 ; le code peut être écrit avant, mais pas testé en conditions réelles.
- **Déploiement du staging exécuté par l'équipe :** l'agent n'a pas Docker. Chaque déploiement demande une intervention sur l'hôte, ce qui peut ralentir les jalons.
- ~~Playwright sur Alpine~~ : **résolu le 15/09/2026**, Playwright fonctionne dans le conteneur de l'agent avec le Chromium du système (voir « Développement et tests »).
- **Budget API limité :** délégation aux workers pour les tâches non critiques ; risque de perte de contexte sur les tâches déléguées si le cadrage n'est pas assez précis — l'agent gardera un cadrage écrit clair pour chaque délégation.

### Qui traite chaque tâche
| Tâche | Qui | Raison |
|---|---|---|
| T1.1 | Agent (déjà fait, données fournies par l'équipe) | Lecture seule |
| T1.2 | Agent | Décisions d'architecture |
| T1.3 | Agent | Infra, sécurité (Postgres non exposé, secrets) |
| T1.4 | Agent (peut déléguer la génération de variantes CSS à `worker-code`) | Choix de direction, validation équipe ensuite |
| T1.5 | `worker-code` (schéma + script d'import), relecture `worker-review` | Code cadré, pas critique paiement |
| T1.6 | `worker-code` (pages), relecture `worker-review`, agent pour l'intégration finale | Code cadré |
| T1.7 | Agent | Sensible : interrupteur de vente + garde-fou légal |
| T1.8 | Agent | Critique : paiement, webhook, factures (section 8) |
| T1.9 | `worker-code`, supervision agent sur le consentement RGPD | Code cadré, mais RGPD sensible |
| T1.10 | `worker-code` (UI admin), agent (authentification) | Auth = sensible |
| T1.11 | Agent, `worker-web` en appui pour la structure type des CGV (jamais de copie) | Textes légaux |
| T1.12 | `worker-code`, relecture `worker-review` | Implémentation technique cadrée |
| T1.13 | `worker-web` (recherche mots-clés), agent (rédaction finale des articles) | Recherche web déléguée, contenu fiable gardé par l'agent |
| T1.14 | `worker-code`, relecture rapide agent | Intégration Umami |
| T1.15 | Agent (sécurité, sauvegardes), `worker-code` pour les scripts sous supervision | Critique sécurité |
| T1.16 | `worker-code` (écriture des tests), agent (relecture des tests de paiement) | Tests critiques relus par l'agent |

### Questions ouvertes
1. ~~HTTPS~~ : **décidé le 15/09/2026** (Tailscale Serve pour le staging, Caddy sur le VPS de production).
2. **Section 0 d'AGENTS.md** (nom de marque, domaine, email de contact, contact de validation) : laissée vide volontairement par l'équipe pour l'instant. Utiliser des valeurs provisoires ; **non bloquant pour T1.3**. Dépôt Git distant confirmé : `github.com/Sam111113/e-com-jdr`.
3. **Stockage hors-site des sauvegardes (T1.15) :** quel service ? (ex. Backblaze B2, autre VPS, disque de l'équipe) — un compte externe doit être créé par l'équipe.
4. **Authentification admin (T1.10) :** un compte partagé simple (email + mot de passe unique) suffit-il pour la phase 1, ou faut-il des comptes nominatifs dès le départ ?
5. ~~Domaine dédié pour Umami~~ : **sans objet en phase 1**, Umami est servi sur `127.0.0.1:3001` et reste accessible via le tailnet si besoin. À trancher pour la production.
