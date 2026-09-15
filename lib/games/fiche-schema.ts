// Schéma Zod pour le frontmatter YAML des fiches de jeu (`fiche.md`).
// Tous les messages d'erreur sont en français et nomment le champ en cause.
//
// Note zod v4 : les paramètres `required_error` et `invalid_type_error`
// ne sont pas supportés. Les champs obligatoires manquants sont détectés
// AVANT ce schéma par `parseFicheFile` (voir le tableau `REQUIRED_FIELDS`),
// donc les cas « absent » produisent déjà un message français et ne
// passent jamais par ce schéma. Le schéma ne valide que les champs
// effectivement présents (ou remplacés par des valeurs factices valides).
//
// Voir `content/_modele/fiche.md` pour le modèle de référence.
import { z } from "zod";

/** Regex kebab-case : minuscules, chiffres, traits d'union, au moins un
 * segment. */
const KEBAB_CASE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Schéma du frontmatter YAML. */
export const ficheFrontmatterSchema = z
  .object({
    titre: z.string().nonempty(
      "le champ 'titre' est obligatoire et ne peut pas être vide",
    ),

    slug: z.string()
      .nonempty(
        "le champ 'slug' est obligatoire et ne peut pas être vide",
      )
      .regex(
        KEBAB_CASE_RE,
        {
          message:
            "le champ 'slug' doit être en kebab-case (minuscules, chiffres et " +
            "traits d'union uniquement, ex. 'chasse-au-tresor-halloween')",
        },
      ),

    statut: z.enum(["brouillon", "publie"], {
      message: "le champ 'statut' doit être 'brouillon' ou 'publie'",
    }),

    type: z.string()
      .nonempty(
        "le champ 'type' est obligatoire et ne peut pas être vide",
      )
      .regex(
        KEBAB_CASE_RE,
        {
          message:
            "le champ 'type' doit être en kebab-case (ex. 'escape-game', " +
            "'chasse-au-tresor', 'murder-party', 'enquete')",
        },
      ),

    collections: z
      .array(
        z.string().regex(
          KEBAB_CASE_RE,
          {
            message:
              "chaque collection doit être en kebab-case (ex. 'halloween', " +
              "'noel', 'anniversaire')",
          },
        ),
      )
      .nonempty(
        "le champ 'collections' est obligatoire et doit contenir au moins " +
          "une collection",
      ),

    public: z.enum(["enfants", "ados", "adultes", "famille"], {
      message:
        "le champ 'public' doit être 'enfants', 'ados', 'adultes' ou " +
        "'famille'",
    }),

    age_min: z.number()
      .int({ message: "le champ 'age_min' doit être un entier" })
      .gte(0, {
        message: "le champ 'age_min' doit être supérieur ou égal à 0",
      }),

    joueurs_min: z.number()
      .int({ message: "le champ 'joueurs_min' doit être un entier" })
      .gte(1, {
        message: "le champ 'joueurs_min' doit être supérieur ou égal à 1",
      }),

    joueurs_max: z.number()
      .int({ message: "le champ 'joueurs_max' doit être un entier" })
      .gte(1, {
        message: "le champ 'joueurs_max' doit être supérieur ou égal à 1",
      }),

    duree_minutes: z.number()
      .int({ message: "le champ 'duree_minutes' doit être un entier" })
      .gte(1, {
        message: "le champ 'duree_minutes' doit être supérieur ou égal à 1",
      }),

    difficulte: z.enum(["facile", "moyen", "difficile"], {
      message:
        "le champ 'difficulte' doit être 'facile', 'moyen' ou 'difficile'",
    }),

    prix_eur: z.number()
      .positive({
        message: "le champ 'prix_eur' doit être strictement positif",
      })
      .refine(
        (v) => Math.abs(Math.round(v * 100) - v * 100) < 1e-9,
        {
          message:
            "le champ 'prix_eur' doit avoir au plus 2 décimales " +
            "(ex. 7.90, 12.50)",
        },
      ),

    pitch: z.string().nonempty(
      "le champ 'pitch' est obligatoire et ne peut pas être vide",
    ),
  })
  .superRefine((data, ctx) => {
    // Validation croisée : joueurs_max doit être >= joueurs_min.
    if (data.joueurs_max < data.joueurs_min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "joueurs_max doit être supérieur ou égal à joueurs_min " +
          `(${data.joueurs_max} < ${data.joueurs_min})`,
        path: ["joueurs_max"],
      });
    }
  });

/** Type inféré du frontmatter validé. */
export type FicheFrontmatter = z.infer<typeof ficheFrontmatterSchema>;