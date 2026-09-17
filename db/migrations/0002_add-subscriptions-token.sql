ALTER TABLE "subscriptions" ADD COLUMN "token_hash" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_token_hash_unique" ON "subscriptions" USING btree ("token_hash");