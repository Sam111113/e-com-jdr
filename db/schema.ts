// Schéma de base de données (Drizzle ORM / PostgreSQL 18).
//
// Rédigé et maintenu par l'agent (voir AGENTS.md section 8, docs/PLAN.md
// « Schéma de base de données », docs/DECISIONS.md D8, D12, D15). Toute
// modification de ce fichier doit passer par une migration versionnée
// (`npm run db:generate`, jamais d'édition manuelle de la base).
//
// Décisions structurantes appliquées ici :
// - D15 : `games.type` est une colonne `text` **libre**, pas un `pgEnum`
//   Postgres. La liste des types connus (escape-game, chasse-au-tresor…)
//   vit dans `lib/games/types.ts` et est validée à l'import (zod), pas en
//   base : ajouter un nouveau type de jeu ne demande donc aucune migration.
//   `collections` (saisons) suit le même principe, pour la même raison.
// - D8 : la numérotation des factures passe par `invoice_counters`
//   (compteur transactionnel, voir db/migrate.ts et lib/invoices). Aucune
//   colonne `serial`/`identity` n'est utilisée pour `invoices.number`.
// - D12 : table `redirects`, avec une contrainte CHECK qui interdit les
//   boucles triviales (from_path = to_path). La logique « pas de chaîne »
//   est appliquée côté application (scripts/rename-game.ts), une base ne
//   peut pas facilement l'exprimer en contrainte déclarative.

import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// --- Enums (listes réellement fixes, contrairement à `type` et
// `collections` — voir D15 ci-dessus) ---------------------------------

export const gameStatusEnum = pgEnum("game_status", ["brouillon", "publie"]);

export const gamePublicEnum = pgEnum("game_public", [
  "enfants",
  "ados",
  "adultes",
  "famille",
]);

export const gameDifficultyEnum = pgEnum("game_difficulty", [
  "facile",
  "moyen",
  "difficile",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "refunded",
]);

export const invoiceSeriesEnum = pgEnum("invoice_series", [
  "facture",
  "avoir",
]);

export const subscriptionTypeEnum = pgEnum("subscription_type", [
  "newsletter",
  "liste_attente",
  "jeu_gratuit",
]);

// --- Catalogue ----------------------------------------------------------

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  status: gameStatusEnum("status").notNull().default("brouillon"),
  // D15 : liste extensible sans migration, validée en app.
  type: text("type").notNull(),
  collections: text("collections")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  public: gamePublicEnum("public").notNull(),
  ageMin: integer("age_min").notNull(),
  joueursMin: integer("joueurs_min").notNull(),
  joueursMax: integer("joueurs_max").notNull(),
  dureeMinutes: integer("duree_minutes").notNull(),
  difficulte: gameDifficultyEnum("difficulte").notNull(),
  // Centimes d'euro (ex. 990 = 9,90 €), jamais de flottant pour un montant.
  prixEur: integer("prix_eur").notNull(),
  pitch: text("pitch").notNull(),
  histoire: text("histoire").notNull(),
  contenuKit: text("contenu_kit").notNull(),
  preparation: text("preparation").notNull(),
  deroule: text("deroule").notNull(),
  faq: text("faq").notNull(),
  coverPath: text("cover_path").notNull(),
  // Tableau de chemins publics (`{ webp, avif }` par aperçu), voir
  // lib/games/import-images.ts pour le format exact.
  apercuPaths: jsonb("apercu_paths").notNull().default(sql`'[]'::jsonb`),
  // Clé dans le stockage privé (lib/storage), nulle tant que `kit.pdf`
  // n'a pas encore été importé.
  kitPdfKey: text("kit_pdf_key"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("games_slug_unique").on(table.slug),
]);

// --- Commandes ------------------------------------------------------------

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  stripeSessionId: text("stripe_session_id").notNull(),
  customerEmail: text("customer_email").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  amountTotal: integer("amount_total").notNull(),
  currency: text("currency").notNull().default("eur"),
  // Consentement obligatoire (T1.8) : accès immédiat au contenu numérique
  // et renonciation au droit de rétractation.
  consentAt: timestamp("consent_at", { withTimezone: true }),
  consentText: text("consent_text"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("orders_stripe_session_id_unique").on(table.stripeSessionId),
]);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "restrict" }),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "restrict" }),
  unitPrice: integer("unit_price").notNull(),
  quantity: integer("quantity").notNull().default(1),
});

export const downloadTokens = pgTable("download_tokens", {
  id: serial("id").primaryKey(),
  orderItemId: integer("order_item_id")
    .notNull()
    .references(() => orderItems.id, { onDelete: "restrict" }),
  // Le token en clair n'est jamais stocké : seul son hash (SHA-256) l'est.
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  maxDownloads: integer("max_downloads").notNull().default(5),
  downloadCount: integer("download_count").notNull().default(0),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("download_tokens_token_hash_unique").on(table.tokenHash),
]);

// --- Factures (D8 — numérotation par compteur transactionnel) -------------

// Une ligne par série, initialisée à 0 par la migration
// `0001_seed_invoice_counters.sql`. Jamais de `serial`/`identity` ici :
// voir docs/PLAN.md section « Numérotation des factures » pour le
// mécanisme d'incrément transactionnel (`UPDATE ... RETURNING`).
export const invoiceCounters = pgTable("invoice_counters", {
  series: invoiceSeriesEnum("series").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "restrict" }),
  series: invoiceSeriesEnum("series").notNull(),
  number: integer("number").notNull(),
  // Ex. "F-000001" / "A-000001" — format à faire valider par l'équipe
  // (voir docs/A_FAIRE_EQUIPE.md).
  displayNumber: text("display_number").notNull(),
  // Facture annulée par cet avoir (série `avoir` uniquement).
  creditedInvoiceId: integer("credited_invoice_id").references(
    (): AnyPgColumn => invoices.id,
    { onDelete: "restrict" },
  ),
  pdfKey: text("pdf_key"),
  // Copie de config/entreprise.ts au moment de l'émission : une facture
  // déjà émise ne doit jamais changer si la configuration légale change
  // ensuite.
  legalSnapshot: jsonb("legal_snapshot").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  // Contrainte centrale de D8 : jamais deux factures avec le même numéro
  // dans la même série, quelle que soit la façon dont elles ont été créées.
  uniqueIndex("invoices_series_number_unique").on(table.series, table.number),
]);

// --- Newsletter, listes d'attente, jeu gratuit (D5) ------------------------

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  type: subscriptionTypeEnum("type").notNull(),
  // Nul = liste d'attente générale / newsletter (pas liée à un jeu).
  gameId: integer("game_id").references(() => games.id, {
    onDelete: "cascade",
  }),
  consentText: text("consent_text").notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  // Une même adresse ne s'inscrit qu'une fois par (type, jeu) — y compris
  // quand `game_id` est nul (`NULLS NOT DISTINCT`, disponible depuis
  // PostgreSQL 15), pour éviter les doublons sur la liste générale.
  unique("subscriptions_email_type_game_unique")
    .on(table.email, table.type, table.gameId)
    .nullsNotDistinct(),
]);

// --- Admin minimale (T1.10) ------------------------------------------------

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("admin_users_email_unique").on(table.email),
]);

// --- Redirections 301 (D12) -------------------------------------------

export const redirects = pgTable("redirects", {
  fromPath: text("from_path").primaryKey(),
  toPath: text("to_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  // Empêche au moins la boucle triviale au niveau base ; la règle complète
  // (jamais de redirection vers un chemin qui existe déjà, jamais de
  // chaîne) est appliquée par scripts/rename-game.ts, seul point d'entrée
  // qui écrit dans cette table.
  check("redirects_no_self_loop", sql`${table.fromPath} <> ${table.toPath}`),
]);
