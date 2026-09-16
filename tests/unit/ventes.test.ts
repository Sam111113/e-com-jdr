// Interrupteur de vente et configuration légale (T1.7, décision D11).
// Ces tests couvrent les fonctions pures ; le garde-fou de build lui-même
// (scripts/check-legal-config.ts) est vérifié manuellement en lançant
// `SALES_ENABLED=true npm run build` sur une config incomplète (voir
// docs/PROGRESS.md, entrée T1.7).
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  valeursProvisoires,
  verifierConfigLegale,
  verifierCoherenceDemarrage,
} from "../../lib/ventes/verification-legale";
import { MARQUEUR_A_COMPLETER } from "../../config/entreprise";
import { afficherPrix } from "../../lib/ventes/sales-enabled";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("valeursProvisoires", () => {
  it("trouve les champs marqués, avec leur chemin complet", () => {
    const config = {
      raisonSociale: MARQUEUR_A_COMPLETER,
      adresse: "12 rue des Énigmes",
      mediateur: { nom: MARQUEUR_A_COMPLETER, siteWeb: "https://example.fr" },
    };
    expect(valeursProvisoires(config).sort()).toEqual(
      ["mediateur.nom", "raisonSociale"].sort(),
    );
  });

  it("ne trouve rien dans une configuration complète", () => {
    expect(
      valeursProvisoires({ a: "ok", b: { c: "ok aussi" }, d: 42, e: false }),
    ).toEqual([]);
  });

  it("ignore les valeurs non-chaînes (nombres, booléens)", () => {
    expect(valeursProvisoires({ assujetti: false, taux: 20 })).toEqual([]);
  });
});

describe("verifierConfigLegale", () => {
  const configIncomplete = { nom: MARQUEUR_A_COMPLETER };
  const configComplete = { nom: "Le Cabinet des Énigmes SAS" };

  it("est toujours ok quand les ventes sont fermées, même avec une config incomplète", () => {
    expect(verifierConfigLegale(false, configIncomplete)).toEqual({ ok: true, problemes: [] });
  });

  it("refuse quand les ventes sont ouvertes et la config incomplète", () => {
    const resultat = verifierConfigLegale(true, configIncomplete);
    expect(resultat.ok).toBe(false);
    expect(resultat.problemes).toEqual(["nom"]);
  });

  it("accepte quand les ventes sont ouvertes et la config complète", () => {
    expect(verifierConfigLegale(true, configComplete)).toEqual({ ok: true, problemes: [] });
  });
});

describe("verifierCoherenceDemarrage", () => {
  it("est ok quand le build et l'environnement s'accordent", () => {
    expect(verifierCoherenceDemarrage(true, true)).toEqual({ ok: true });
    expect(verifierCoherenceDemarrage(false, false)).toEqual({ ok: true });
  });

  it("refuse et explique la marche à suivre en cas d'écart", () => {
    const resultat = verifierCoherenceDemarrage(false, true);
    expect(resultat.ok).toBe(false);
    expect(resultat.message).toContain("SALES_ENABLED=true");
    expect(resultat.message).toContain("SALES_ENABLED=false");
    expect(resultat.message).toContain("reconstruire");
  });
});

describe("afficherPrix", () => {
  it("affiche les prix par défaut", () => {
    vi.stubEnv("AFFICHER_PRIX", "");
    expect(afficherPrix()).toBe(true);
  });

  it("masque les prix seulement si explicitement désactivé", () => {
    vi.stubEnv("AFFICHER_PRIX", "false");
    expect(afficherPrix()).toBe(false);
  });
});
