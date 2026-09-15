// Tests unitaires du parseur de fiche (`parseFicheFile`). Les fixtures
// sont construites directement dans le test (chaînes de caractères), pas
// besoin de vrais fichiers sur disque.
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  parseFicheFile,
  FicheValidationError,
} from "../../lib/games/parse-fiche";

/** Écrit une fixture temporaire et retourne son chemin. */
function writeFixture(name: string, content: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ecomjdr-parse-test-"));
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

/** Fiche complète et valide (basée sur le modèle `_modele/fiche.md`). */
const VALID_FICHE = `---
titre: "La Chasse aux Friandises"
slug: la-chasse-aux-friandises
statut: brouillon
type: chasse-au-tresor
collections: [halloween]
public: enfants
age_min: 6
joueurs_min: 2
joueurs_max: 8
duree_minutes: 45
difficulte: facile
prix_eur: 7.90
pitch: >
  Une chasse palpitante dans le jardin…
---

## Histoire

Il était une fois…

## Contenu du kit

Des énigmes, un plan, des indices.

## Préparation

Imprimer les pages 2 à 7.

## Déroulé en bref

30 minutes d'aventure.

## Questions fréquentes

Peut-on jouer en intérieur ? Oui.`;

const EXPECTED_SLUG = "la-chasse-aux-friandises";

describe("parseFicheFile — fiche valide", () => {
  it("parse une fiche complète sans erreur", () => {
    const filePath = writeFixture("fiche.md", VALID_FICHE);
    const result = parseFicheFile(filePath, EXPECTED_SLUG);

    expect(result.slug).toBe(EXPECTED_SLUG);
    expect(result.frontmatter.titre).toBe("La Chasse aux Friandises");
    expect(result.frontmatter.age_min).toBe(6);
    expect(result.frontmatter.joueurs_min).toBe(2);
    expect(result.frontmatter.joueurs_max).toBe(8);
    expect(result.frontmatter.prix_eur).toBe(7.90);
    // Sections extraites correctement.
    expect(result.histoire).toContain("Il était une fois");
    expect(result.contenu_kit).toContain("Des énigmes");
    expect(result.preparation).toContain("Imprimer");
    expect(result.deroule).toContain("30 minutes");
    expect(result.faq).toContain("Peut-on jouer");
  });

  it("accepte un prix à 2 décimales exactes", () => {
    const fiche = VALID_FICHE.replace("prix_eur: 7.90", "prix_eur: 12.50");
    const filePath = writeFixture("fiche.md", fiche);
    const result = parseFicheFile(filePath, EXPECTED_SLUG);
    expect(result.frontmatter.prix_eur).toBe(12.50);
  });
});

describe("parseFicheFile — erreurs de validation", () => {
  it("champ age_min manquant → issue field='age_min'", () => {
    // Supprimer age_min du frontmatter.
    const fiche = VALID_FICHE.replace("age_min: 6\n", "");
    const filePath = writeFixture("fiche.md", fiche);

    expect(() => parseFicheFile(filePath, EXPECTED_SLUG)).toThrow(
      FicheValidationError,
    );
    try {
      parseFicheFile(filePath, EXPECTED_SLUG);
    } catch (err) {
      const e = err as FicheValidationError;
      const ageMinIssue = e.issues.find((i) => i.field === "age_min");
      expect(ageMinIssue).toBeDefined();
      expect(ageMinIssue!.message).toContain("obligatoire");
    }
  });

  it("joueurs_max < joueurs_min → issue correspondante", () => {
    const fiche = VALID_FICHE.replace("joueurs_max: 8", "joueurs_max: 1");
    const filePath = writeFixture("fiche.md", fiche);

    expect(() => parseFicheFile(filePath, EXPECTED_SLUG)).toThrow(
      FicheValidationError,
    );
    try {
      parseFicheFile(filePath, EXPECTED_SLUG);
    } catch (err) {
      const e = err as FicheValidationError;
      const issue = e.issues.find((i) => i.field === "joueurs_max");
      expect(issue).toBeDefined();
      expect(issue!.message).toContain("joueurs_max doit être supérieur");
    }
  });

  it("section Histoire vide → issue field='histoire'", () => {
    // Remplacer le contenu de ## Histoire par rien.
    const fiche = VALID_FICHE.replace(
      "## Histoire\n\nIl était une fois…",
      "## Histoire\n",
    );
    const filePath = writeFixture("fiche.md", fiche);

    expect(() => parseFicheFile(filePath, EXPECTED_SLUG)).toThrow(
      FicheValidationError,
    );
    try {
      parseFicheFile(filePath, EXPECTED_SLUG);
    } catch (err) {
      const e = err as FicheValidationError;
      const issue = e.issues.find((i) => i.field === "histoire");
      expect(issue).toBeDefined();
      expect(issue!.message).toContain("absente ou vide");
    }
  });

  it("slug du frontmatter ne correspond pas au dossier → issue field='slug'", () => {
    const filePath = writeFixture("fiche.md", VALID_FICHE);
    const wrongSlug = "autre-slug";

    expect(() => parseFicheFile(filePath, wrongSlug)).toThrow(
      FicheValidationError,
    );
    try {
      parseFicheFile(filePath, wrongSlug);
    } catch (err) {
      const e = err as FicheValidationError;
      const issue = e.issues.find((i) => i.field === "slug");
      expect(issue).toBeDefined();
      expect(issue!.message).toContain("ne correspond pas au nom du dossier");
      expect(issue!.message).toContain(wrongSlug);
    }
  });

  it("plusieurs erreurs → toutes les issues sont rassemblées", () => {
    // Supprimer age_min ET vider la section Histoire.
    let fiche = VALID_FICHE.replace("age_min: 6\n", "");
    fiche = fiche.replace(
      "## Histoire\n\nIl était une fois…",
      "## Histoire\n",
    );
    const filePath = writeFixture("fiche.md", fiche);

    try {
      parseFicheFile(filePath, EXPECTED_SLUG);
      expect.fail("Devrait lever une FicheValidationError");
    } catch (err) {
      const e = err as FicheValidationError;
      expect(e.issues.length).toBeGreaterThanOrEqual(2);
      const fields = e.issues.map((i) => i.field);
      expect(fields).toContain("age_min");
      expect(fields).toContain("histoire");
    }
  });
});

describe("parseFicheFile — cas d'insensibilité à la casse et aux espaces", () => {
  it("reconnaît les sections avec une casse différente", () => {
    const fiche = VALID_FICHE.replace(
      "## Histoire",
      "##  HISTOIRE  ",
    );
    const filePath = writeFixture("fiche.md", fiche);
    const result = parseFicheFile(filePath, EXPECTED_SLUG);
    expect(result.histoire).toContain("Il était une fois");
  });

  it("reconnaît les sections avec des espaces superflus", () => {
    const fiche = VALID_FICHE.replace(
      "## Contenu du kit",
      "##   Contenu   du   kit   ",
    );
    const filePath = writeFixture("fiche.md", fiche);
    const result = parseFicheFile(filePath, EXPECTED_SLUG);
    expect(result.contenu_kit).toContain("Des énigmes");
  });
});