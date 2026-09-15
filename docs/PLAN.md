# Plan technique

> Créé pour T1.2. Section « Audit » créée pour T1.1. À relire par l'équipe avant de démarrer T1.3.

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
- **Conséquence :** un nouveau site peut obtenir un certificat HTTPS valide en se connectant à `n8n_default` et en portant les bons labels, **sans toucher à la configuration de Traefik**. C'est une option, pas une obligation — voir « Options pour le HTTPS » ci-dessous.

### Ports déjà pris sur l'hôte
22 (SSH), 80, 443, 5678 (n8n), 4096 (OpenCode), 8443 (Tailscale).

### DNS
Domaine pas encore choisi (section 0 d'AGENTS.md). Aucune vérification possible tant que le nom de domaine et le registrar/DNS ne sont pas connus.

### Conséquences pour l'architecture
- Notre Postgres, notre app et Umami tourneront dans **notre propre** `docker compose`, sur un réseau dédié, **sans jamais publier de port Postgres sur l'hôte**.
- Nous ne pouvons pas publier de conteneur sur `0.0.0.0:80` ou `:443` : ces ports appartiennent à Traefik/n8n. Le HTTPS de notre site doit donc soit passer par Traefik existant, soit par une autre solution qui ne réclame pas ces ports (voir plus bas).
- Le sous-domaine `staging.[DOMAINE]` n'existe pas encore : bloquant pour T1.3 tant que le domaine n'est pas choisi et le DNS pas configuré.

---

## Architecture (T1.2)

### Vue d'ensemble
```
Internet
   │
   ▼
Traefik (n8n-traefik-1, déjà en place, ports 80/443)
   │  (labels Docker, réseau n8n_default)
   ▼
App Next.js (conteneur "app", réseau interne "ecomjdr" + réseau "n8n_default")
   │
   ├──▶ Postgres (conteneur "postgres", réseau interne "ecomjdr" uniquement, aucun port publié)
   ├──▶ Umami (conteneur "umami", réseau interne "ecomjdr", exposé via Traefik sur un sous-domaine dédié si besoin de dashboard)
   ├──▶ Stockage privé (volume Docker monté dans "app", jamais servi en statique)
   └──▶ APIs externes : Stripe, Brevo (sortant uniquement)
```
Ce schéma suppose l'option « Traefik partagé » (voir question ouverte ci-dessous). Si l'équipe choisit une autre option HTTPS, seul le haut du schéma change (le reverse proxy), le reste est identique.

### Réseaux Docker
- `ecomjdr_default` (créé par notre `docker-compose.yml`) : app, postgres, umami. Réseau interne, pas de port publié pour postgres.
- Connexion additionnelle au réseau externe `n8n_default` **uniquement pour le conteneur qui doit être routé par Traefik** (l'app, et éventuellement Umami si on veut y accéder depuis l'extérieur). Postgres n'est jamais connecté à `n8n_default`.

### Environnements
- `staging.[DOMAINE]` : `SALES_ENABLED=true` (pour pouvoir tester tout le parcours), Stripe en mode test, protégé par mot de passe HTTP (Basic Auth via middleware Next.js ou label Traefik), `noindex` partout.
- `[DOMAINE]` (prod) : `SALES_ENABLED=false` jusqu'à la phase 3, pas de clé Stripe, en vitrine à partir de la phase 2 seulement.
- Un seul VPS pour les deux environnements en phase 1-2 : deux jeux de conteneurs (`ecomjdr-staging`, `ecomjdr-prod`), projets Docker Compose distincts, bases Postgres distinctes.

### Options pour le HTTPS — **question ouverte, décision de l'équipe**
| Option | Fonctionnement | Avantages | Risques |
|---|---|---|---|
| **A. Réutiliser Traefik existant** | Notre conteneur app rejoint `n8n_default`, porte des labels Traefik, profite du résolveur `mytlschallenge` déjà en place. Pas de Caddy. | Aucune reconfiguration de Traefik, pas de nouveau port à gérer, solution documentée par l'audit. | Couplage avec l'infra n8n : un incident sur Traefik ou n8n impacte notre site. Nos conteneurs rejoignent le réseau Docker de n8n (accessible entre conteneurs du même réseau, à contrôler par des règles applicatives). Si l'équipe modifie un jour Traefik pour n8n, ça peut casser notre routage. |
| **B. Cloudflare Tunnel (`cloudflared`)** | Un conteneur `cloudflared` établit une connexion sortante vers Cloudflare ; Cloudflare termine le TLS et route vers notre app sur un port interne. Aucun port entrant à ouvrir sur le VPS. | Isolation totale de n8n/Traefik. Pas de port 80/443 à libérer. Fonctionne même si le DNS n'est pas encore chez Cloudflare (il faudra y migrer la zone). | Nécessite que le DNS du domaine passe par Cloudflare (inconnu à ce jour, section 0). Nécessite la création d'un compte Cloudflare par l'équipe (interdiction pour l'agent de créer des comptes externes). Dépendance à un service tiers pour l'accès au site. |
| **C. Libérer les ports 80/443** | Déplacer Traefik/n8n sur d'autres ports, ajouter notre propre Caddy sur 80/443. | Architecture la plus simple, conforme à l'idée initiale (section 4). | **Interdit sans validation explicite** : nécessite de toucher à un service déjà en place (AGENTS.md section 3). Risque de casser n8n en production. **Non recommandé.** |

**Recommandation de l'agent :** option A (réutiliser Traefik), car elle ne touche à rien d'existant et l'audit confirme qu'elle est possible sans reconfiguration. Option B reste pertinente si l'équipe préfère une isolation complète et compte de toute façon héberger le DNS chez Cloudflare.

**Décision à prendre par l'équipe avant T1.3.**

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
│   ├── docker-compose.yml
│   └── (labels Traefik ou config Cloudflare Tunnel selon décision équipe)
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
| `invoices` | id, order_id (FK), number (séquence continue), type (facture/avoir), pdf_key, legal_snapshot (json, copie de `config/entreprise.ts` au moment de l'émission), issued_at | Factures, jamais supprimées ; un remboursement crée un avoir |
| `subscriptions` | id, email, type (newsletter / liste_attente / jeu_gratuit), game_id (FK, nullable = liste générale), consent_text, confirmed_at (double opt-in), unsubscribed_at, created_at | Table unique pour newsletter, listes d'attente et jeu gratuit, différenciée par `type` + `game_id` |
| `admin_users` | id, email, password_hash, created_at | Accès à l'admin minimale (T1.10) |

Interface `storage` (dans `lib/storage`) : `put(key, buffer)`, `get(key)`, `delete(key)`, `getPrivateUrl(key, ttl)` — implémentation `LocalDiskStorage` (dossier hors du webroot, ex. `/data/private`) en phase 1-2, remplaçable par une implémentation S3/R2 sans changer le code appelant.

### `SALES_ENABLED` et configuration légale centralisée
- `config/entreprise.ts` exporte un objet unique avec toutes les infos légales (nom, statut, SIRET, adresse, régime TVA, médiateur…). Les valeurs provisoires utilisent un marqueur détectable, par ex. `"À COMPLÉTER"`.
- `lib/sales-enabled.ts` lit `process.env.SALES_ENABLED` (`NEXT_PUBLIC_SALES_ENABLED` côté client pour l'affichage du bouton) : `false` → bouton « Me prévenir de la sortie », routes `/api/checkout`, `/api/webhooks/stripe`, `/api/download/*` renvoient 404.
- **Garde-fou de build :** `scripts/check-legal-config.ts`, exécuté en `prebuild` (npm script), lève une erreur (exit code ≠ 0) si `SALES_ENABLED=true` **et** qu'au moins une valeur de `config/entreprise.ts` contient encore le marqueur provisoire. Le build de production échoue alors volontairement.

### Estimation des tâches (en jours-agent, indicatif)
| Tâche | Estimation | Dépend de |
|---|---|---|
| T1.1 | 0,5 j (fait) | — |
| T1.2 | 0,5 j (fait, en attente de validation) | T1.1 |
| T1.3 | 1 j | T1.2 validée + DNS staging |
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
- **Domaine et DNS non choisis (section 0) :** bloque T1.3 (staging), donc bloque toute la piste A (développement) au-delà du code local. Urgent.
- **Décision HTTPS non prise :** bloque le déploiement réel de T1.3, même une fois le domaine connu.
- **Clés Stripe test et Brevo à fournir par l'équipe :** nécessaires pour T1.8 et T1.9 ; le code peut être écrit avant, mais pas testé en conditions réelles.
- **Playwright sur Alpine (conteneur agent) :** pas de support officiel. Solution prévue : lancer les tests E2E (T1.16) via une image Docker Playwright officielle (Node + Chromium inclus) dans le pipeline de test, plutôt que directement dans le conteneur OpenCode.
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
1. **HTTPS :** option A, B ou autre ? (voir tableau ci-dessus) — bloquant pour T1.3.
2. **Section 0 d'AGENTS.md** (nom de marque, domaine, DNS, email de contact, dépôt Git distant, contact de validation) : à compléter — voir `docs/A_FAIRE_EQUIPE.md`.
3. **Stockage hors-site des sauvegardes (T1.15) :** quel service ? (ex. Backblaze B2, autre VPS, disque de l'équipe) — un compte externe doit être créé par l'équipe.
4. **Authentification admin (T1.10) :** un compte partagé simple (email + mot de passe unique) suffit-il pour la phase 1, ou faut-il des comptes nominatifs dès le départ ?
5. **Domaine dédié pour Umami** (`stats.[DOMAINE]`) ou sous-chemin de l'app ? Impact sur les labels Traefik/Cloudflare.
