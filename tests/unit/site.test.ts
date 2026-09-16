// Tests des règles des pages du site (T1.6) : saisons, filtres du catalogue,
// collections et conventions d'images. Aucun accès à la base.
import { describe, expect, it } from "vitest";
import { datePaques, saisonActive } from "../../lib/saisons";
import { lireFiltresCatalogue } from "../../lib/games/filtres-catalogue";
import { PAGES_COLLECTIONS, trouverPageCollection } from "../../lib/collections";
import { cheminVariante, srcSet } from "../../lib/games/images";
import { formaterDuree, formaterJoueurs, formaterPrix } from "../../lib/games/format";

// Midi à Paris, pour éviter toute ambiguïté de fuseau horaire.
const le = (iso: string) => new Date(`${iso}T12:00:00+02:00`);

describe("saisonActive", () => {
  it("calcule Pâques (dates connues)", () => {
    expect(datePaques(2026)).toEqual({ mois: 4, jour: 5 });
    expect(datePaques(2027)).toEqual({ mois: 3, jour: 28 });
    expect(datePaques(2025)).toEqual({ mois: 4, jour: 20 });
  });

  it("suit les fenêtres de dates", () => {
    expect(saisonActive(le("2026-08-31"), undefined)).toBeNull();
    expect(saisonActive(le("2026-09-01"), undefined)).toBe("halloween");
    expect(saisonActive(le("2026-10-31"), undefined)).toBe("halloween");
    expect(saisonActive(le("2026-11-01"), undefined)).toBe("noel");
    expect(saisonActive(le("2026-12-25"), undefined)).toBe("noel");
    expect(saisonActive(le("2026-12-26"), undefined)).toBeNull();
    expect(saisonActive(le("2027-01-02"), undefined)).toBe("saint-valentin");
    expect(saisonActive(le("2027-02-14"), undefined)).toBe("saint-valentin");
    expect(saisonActive(le("2027-02-15"), undefined)).toBe("paques");
  });

  it("termine Pâques le lundi de Pâques", () => {
    // Pâques 2027 : dimanche 28 mars, lundi 29 mars.
    expect(saisonActive(le("2027-03-29"), undefined)).toBe("paques");
    expect(saisonActive(le("2027-03-30"), undefined)).toBeNull();
    // Pâques 2026 : dimanche 5 avril, lundi 6 avril.
    expect(saisonActive(le("2026-04-06"), undefined)).toBe("paques");
    expect(saisonActive(le("2026-04-07"), undefined)).toBeNull();
  });

  it("utilise l'heure de Paris, pas celle du serveur", () => {
    // 31/08 à 23 h 30 UTC = 01/09 à 1 h 30 à Paris.
    expect(saisonActive(new Date("2026-08-31T23:30:00Z"), undefined)).toBe("halloween");
  });

  it("respecte le forçage SAISON_ACTIVE, et ignore une valeur inconnue", () => {
    expect(saisonActive(le("2026-09-15"), "noel")).toBe("noel");
    expect(saisonActive(le("2026-09-15"), "aucune")).toBeNull();
    expect(saisonActive(le("2026-09-15"), "carnaval")).toBe("halloween");
    expect(saisonActive(le("2026-09-15"), "")).toBe("halloween");
  });
});

describe("lireFiltresCatalogue", () => {
  it("lit les filtres valides", () => {
    expect(
      lireFiltresCatalogue({
        type: "escape-game",
        saison: "halloween",
        public: "enfants",
        age: "8",
        joueurs: "4",
        duree: "60",
      }),
    ).toEqual({
      types: ["escape-game"],
      collections: ["halloween"],
      publics: ["enfants"],
      age: 8,
      joueurs: 4,
      dureeMax: 60,
    });
  });

  it("ignore les valeurs vides, invalides ou absurdes au lieu d'échouer", () => {
    expect(
      lireFiltresCatalogue({
        type: "",
        saison: "carnaval",
        public: "robots",
        age: "-3",
        joueurs: "abc",
        duree: "1e9",
      }),
    ).toEqual({});
  });

  it("garde la première valeur si un paramètre est répété", () => {
    expect(lireFiltresCatalogue({ type: ["murder-party", "escape-game"] })).toEqual({
      types: ["murder-party"],
    });
  });
});

describe("pages collections (D17)", () => {
  it("a des slugs uniques, en kebab-case, sans collision avec les autres pages", () => {
    const slugs = PAGES_COLLECTIONS.map((page) => page.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const reserves = ["jeux", "comment-ca-marche", "faq", "a-propos", "contact", "blog"];
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(reserves).not.toContain(slug);
    }
  });

  it("rattache chaque page type à un hub existant", () => {
    for (const page of PAGES_COLLECTIONS.filter((p) => p.genre === "type")) {
      expect(page.parent, page.slug).toBeDefined();
      expect(trouverPageCollection(page.parent!)?.genre, page.slug).toBe("hub");
    }
  });

  it("contient la structure validée", () => {
    for (const slug of [
      "halloween",
      "escape-game-halloween",
      "chasse-au-tresor-halloween",
      "noel",
      "saint-valentin",
      "paques",
      "anniversaire-enfant",
      "anniversaire-ado",
      "soiree-adulte",
      "murder-party-a-imprimer",
      "evjf-evg",
    ]) {
      expect(trouverPageCollection(slug), slug).toBeDefined();
    }
    expect(trouverPageCollection("n-importe-quoi")).toBeUndefined();
  });
});

describe("images et formats", () => {
  it("dérive les variantes d'une image depuis le chemin stocké en base", () => {
    const largeurs = [480, 960, 1600];
    expect(cheminVariante("/games/a/cover.webp", 480, largeurs, "avif")).toBe(
      "/games/a/cover-480.avif",
    );
    expect(cheminVariante("/games/a/cover.webp", 1600, largeurs, "webp")).toBe(
      "/games/a/cover.webp",
    );
    expect(srcSet("/games/a/cover.webp", largeurs, "webp")).toBe(
      "/games/a/cover-480.webp 480w, /games/a/cover-960.webp 960w, /games/a/cover.webp 1600w",
    );
  });

  it("formate prix, durée et joueurs en français", () => {
    expect(formaterPrix(790).replace(/\s/g, " ")).toBe("7,90 €");
    expect(formaterDuree(45)).toBe("45 min");
    expect(formaterDuree(90)).toBe("1 h 30");
    expect(formaterDuree(120)).toBe("2 h");
    expect(formaterJoueurs(2, 6)).toBe("2 à 6 joueurs");
    expect(formaterJoueurs(4, 4)).toBe("4 joueurs");
  });
});
