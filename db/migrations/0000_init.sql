CREATE TYPE "public"."game_difficulty" AS ENUM('facile', 'moyen', 'difficile');--> statement-breakpoint
CREATE TYPE "public"."game_public" AS ENUM('enfants', 'ados', 'adultes', 'famille');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('brouillon', 'publie');--> statement-breakpoint
CREATE TYPE "public"."invoice_series" AS ENUM('facture', 'avoir');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."subscription_type" AS ENUM('newsletter', 'liste_attente', 'jeu_gratuit');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "download_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_item_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"max_downloads" integer DEFAULT 5 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"status" "game_status" DEFAULT 'brouillon' NOT NULL,
	"type" text NOT NULL,
	"collections" text[] DEFAULT '{}'::text[] NOT NULL,
	"public" "game_public" NOT NULL,
	"age_min" integer NOT NULL,
	"joueurs_min" integer NOT NULL,
	"joueurs_max" integer NOT NULL,
	"duree_minutes" integer NOT NULL,
	"difficulte" "game_difficulty" NOT NULL,
	"prix_eur" integer NOT NULL,
	"pitch" text NOT NULL,
	"histoire" text NOT NULL,
	"contenu_kit" text NOT NULL,
	"preparation" text NOT NULL,
	"deroule" text NOT NULL,
	"faq" text NOT NULL,
	"cover_path" text NOT NULL,
	"apercu_paths" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"kit_pdf_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_counters" (
	"series" "invoice_series" PRIMARY KEY NOT NULL,
	"last_number" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"series" "invoice_series" NOT NULL,
	"number" integer NOT NULL,
	"display_number" text NOT NULL,
	"credited_invoice_id" integer,
	"pdf_key" text,
	"legal_snapshot" jsonb NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"game_id" integer NOT NULL,
	"unit_price" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_session_id" text NOT NULL,
	"customer_email" text NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"amount_total" integer NOT NULL,
	"currency" text DEFAULT 'eur' NOT NULL,
	"consent_at" timestamp with time zone,
	"consent_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"from_path" text PRIMARY KEY NOT NULL,
	"to_path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redirects_no_self_loop" CHECK ("redirects"."from_path" <> "redirects"."to_path")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"type" "subscription_type" NOT NULL,
	"game_id" integer,
	"consent_text" text NOT NULL,
	"confirmed_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_email_type_game_unique" UNIQUE NULLS NOT DISTINCT("email","type","game_id")
);
--> statement-breakpoint
ALTER TABLE "download_tokens" ADD CONSTRAINT "download_tokens_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_credited_invoice_id_invoices_id_fk" FOREIGN KEY ("credited_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_unique" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "download_tokens_token_hash_unique" ON "download_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "games_slug_unique" ON "games" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_series_number_unique" ON "invoices" USING btree ("series","number");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_stripe_session_id_unique" ON "orders" USING btree ("stripe_session_id");