-- D8 : initialise les deux compteurs de numérotation des factures à 0.
-- Sans cette ligne, le premier `UPDATE invoice_counters SET last_number =
-- last_number + 1 WHERE series = 'facture' RETURNING last_number` (voir
-- docs/PLAN.md, section « Numérotation des factures ») ne trouverait aucune
-- ligne à mettre à jour et renverrait 0 ligne, sans erreur visible.
--
-- `ON CONFLICT DO NOTHING` rend cette migration rejouable sans effet de
-- bord si elle était appliquée une seconde fois par erreur.
INSERT INTO "invoice_counters" ("series", "last_number")
VALUES ('facture', 0), ('avoir', 0)
ON CONFLICT ("series") DO NOTHING;
--> statement-breakpoint
