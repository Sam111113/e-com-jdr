// Analyse et validation d'un fichier `fiche.md` (frontmatter YAML +
// sections markdown). Voir `content/_modele/fiche.md` pour le modèle.
import fs from "node:fs";
import matter from "gray-matter";
import { ficheFrontmatterSchema, type FicheFrontmatter } from "./fiche-schema";

// --- Erreur métier -------------------------------------------------------

/** Levée quand un `fiche.md` contient une ou plusieurs erreurs de
 * validation (frontmatter ou sections). */
export class FicheValidationError extends Error {
  public readonly issues: { field: string; message: string }[];

  constructor(issues: { field: string; message: string }[]) {
    super("Fiche invalide");
    this.name = "FicheValidationError";
    this.issues = issues;
  }
}

// --- Résultat structuré --------------------------------------------------

/** Résultat complet d'une fiche valide : frontmatter + slug + sections. */
export interface ParsedFiche {
  frontmatter: FicheFrontmatter;
  slug: string;
  histoire: string;
  contenu_kit: string;
  preparation: string;
  deroule: string;
  faq: string;
}

// --- Sections attendues ---------------------------------------------------

/** Titres des sections markdown obligatoires (normalisés, insensibles à la
 * casse et aux espaces superflus). L'ordre définit aussi la séquence de
 * découpage. */
const SECTION_HEADERS = [
  { normalized: "histoire", field: "histoire" as const },
  { normalized: "contenu du kit", field: "contenu_kit" as const },
  { normalized: "préparation", field: "preparation" as const },
  { normalized: "déroulé en bref", field: "deroule" as const },
  { normalized: "questions fréquentes", field: "faq" as const },
] as const;

/** Normalise une chaîne pour la comparaison de titres : minuscules,
 * espaces multiples réduits à un seul, accents conservés (on compare
 * avec les titres normalisés ci-dessus, eux-mêmes avec accents). */
function normalizeHeaderText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

// --- Champs obligatoires et leurs messages d'erreur -----------------------

/** Pour chaque champ obligatoire : message d'erreur français si le champ
 * est absent (`undefined` dans le frontmatter brut) et valeur de
 * remplacement qui passe la validation zod (pour éviter des erreurs
 * zod parasites quand le champ est déjà signalé manquant). */
const REQUIRED_FIELDS: {
  field: string;
  message: string;
  dummy: unknown;
}[] = [
  {
    field: "titre",
    message: "le champ 'titre' est obligatoire et ne peut pas être vide",
    dummy: "PLACEHOLDER",
  },
  {
    field: "slug",
    message: "le champ 'slug' est obligatoire et ne peut pas être vide",
    dummy: "placeholder",
  },
  {
    field: "statut",
    message: "le champ 'statut' est obligatoire (brouillon ou publie)",
    dummy: "brouillon",
  },
  {
    field: "type",
    message: "le champ 'type' est obligatoire et ne peut pas être vide",
    dummy: "chasse-au-tresor",
  },
  {
    field: "collections",
    message:
      "le champ 'collections' est obligatoire et doit contenir au moins " +
      "une collection",
    dummy: ["halloween"],
  },
  {
    field: "public",
    message:
      "le champ 'public' est obligatoire (enfants, ados, adultes ou famille)",
    dummy: "enfants",
  },
  {
    field: "age_min",
    message:
      "le champ 'age_min' est obligatoire et doit être un entier positif ou nul",
    dummy: 0,
  },
  {
    field: "joueurs_min",
    message:
      "le champ 'joueurs_min' est obligatoire et doit être un entier " +
      "supérieur ou égal à 1",
    dummy: 1,
  },
  {
    field: "joueurs_max",
    message:
      "le champ 'joueurs_max' est obligatoire et doit être un entier " +
      "supérieur ou égal à 1",
    dummy: 1,
  },
  {
    field: "duree_minutes",
    message:
      "le champ 'duree_minutes' est obligatoire et doit être un entier " +
      "supérieur ou égal à 1",
    dummy: 1,
  },
  {
    field: "difficulte",
    message: "le champ 'difficulte' est obligatoire (facile, moyen ou difficile)",
    dummy: "facile",
  },
  {
    field: "prix_eur",
    message:
      "le champ 'prix_eur' est obligatoire et doit être un nombre " +
      "strictement positif",
    dummy: 1,
  },
  {
    field: "pitch",
    message: "le champ 'pitch' est obligatoire et ne peut pas être vide",
    dummy: "PLACEHOLDER",
  },
];

// --- Parseur principal ---------------------------------------------------

/**
 * Lit et valide un fichier `fiche.md`.
 *
 * @param filePath Chemin absolu vers le fichier `fiche.md`.
 * @param expectedSlug Slug attendu (nom du dossier parent).
 * @returns La fiche parsée et validée.
 * @throws {FicheValidationError} Si des erreurs sont détectées (toutes les
 *   erreurs sont rassemblées dans l'exception).
 */
export function parseFicheFile(
  filePath: string,
  expectedSlug: string,
): ParsedFiche {
  const issues: { field: string; message: string }[] = [];

  // 1. Lire le fichier avec gray-matter.
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatterRaw, content } = matter(raw);

  // 2. Vérifier les champs obligatoires absents (undefined) AVANT zod.
  //    zod v4 ne distingue pas clé absente et valeur `undefined` : dans les
  //    deux cas il produit « Invalid input: expected X, received undefined ».
  //    On intercepte ces cas ici pour produire des messages en français.
  const cleaned: Record<string, unknown> = { ...frontmatterRaw };
  const missingFields = new Set<string>();
  for (const req of REQUIRED_FIELDS) {
    if (cleaned[req.field] === undefined) {
      issues.push({ field: req.field, message: req.message });
      cleaned[req.field] = req.dummy;
      missingFields.add(req.field);
    }
  }

  // 3. Valider le frontmatter (nettoyé des absents) avec zod.
  const parsed = ficheFrontmatterSchema.safeParse(cleaned);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      // Ignorer les erreurs zod portant sur des champs déjà signalés
      // manquants (elles seraient redondantes et moins claires).
      const zodField =
        issue.path.length > 0
          ? issue.path.map(String).join(".")
          : "(inconnu)";
      if (missingFields.has(zodField)) {
        continue;
      }
      issues.push({ field: zodField, message: issue.message });
    }
  }

  // 4. Vérifier que slug du frontmatter === expectedSlug.
  if (parsed.success && parsed.data.slug !== expectedSlug) {
    issues.push({
      field: "slug",
      message:
        `le champ 'slug' ('${parsed.data.slug}')` +
        ` ne correspond pas au nom du dossier ('${expectedSlug}')`,
    });
  }

  // 5. Découper le corps markdown en sections.
  // On parse le markdown pour trouver les titres `## `.
  const sectionContents: Record<string, string> = {};

  // Stratégie : on cherche chaque `## ` titre, on extrait ce qu'il y a
  // entre ce titre et le prochain `## ` (ou la fin du fichier).
  const headerRegex = /^##\s+(.+)$/gm;
  const matches: { index: number; rawTitle: string }[] = [];
  let match: RegExpExecArray | null;
  while ((match = headerRegex.exec(content)) !== null) {
    matches.push({ index: match.index, rawTitle: match[1] });
  }

  for (const sectionDef of SECTION_HEADERS) {
    // Chercher le titre de section (insensible à la casse, espaces normalisés).
    const sectionIndex = matches.findIndex(
      (m) => normalizeHeaderText(m.rawTitle) === sectionDef.normalized,
    );
    if (sectionIndex === -1) {
      sectionContents[sectionDef.field] = "";
      continue;
    }

    const startIdx = matches[sectionIndex].index;
    // Trouver le début du contenu (juste après la ligne du titre).
    const headerEndIdx = content.indexOf("\n", startIdx) + 1;
    // Trouver la fin (prochain `## ` ou fin du fichier).
    const nextMatch = matches[sectionIndex + 1];
    const endIdx = nextMatch ? nextMatch.index : content.length;

    const sectionText = content.slice(headerEndIdx, endIdx).trim();
    sectionContents[sectionDef.field] = sectionText;
  }

  // Vérifier que chaque section est présente ET non vide.
  for (const sectionDef of SECTION_HEADERS) {
    const text = sectionContents[sectionDef.field] ?? "";
    if (text.length === 0) {
      issues.push({
        field: sectionDef.field,
        message:
          `la section '${sectionDef.normalized}' est absente ou vide`,
      });
    }
  }

  // 6. S'il y a des issues, les lever toutes d'un coup.
  if (issues.length > 0) {
    throw new FicheValidationError(issues);
  }

  // 7. Retourner le résultat structuré.
  return {
    frontmatter: parsed.data!,
    slug: parsed.data!.slug,
    histoire: sectionContents.histoire!,
    contenu_kit: sectionContents.contenu_kit!,
    preparation: sectionContents.preparation!,
    deroule: sectionContents.deroule!,
    faq: sectionContents.faq!,
  };
}