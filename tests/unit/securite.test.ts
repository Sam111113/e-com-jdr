// Sécurité (T1.15) : en-têtes HTTP et limiteur de requêtes génériques.
// Le comportement détaillé du limiteur (fenêtre glissante, remise à zéro)
// est déjà couvert par tests/unit/contact.test.ts (son premier appelant) ;
// ici on vérifie surtout qu'il est bien réutilisable tel quel.
import { describe, expect, it } from "vitest";
import { creerLimiteurParIp } from "../../lib/securite/limiteur";
import { contentSecurityPolicy, entetesSecurite } from "../../lib/securite/entetes";

describe("creerLimiteurParIp", () => {
  it("limite chaque adresse IP indépendamment", () => {
    const autoriser = creerLimiteurParIp(2, 1000);
    expect(autoriser("1.1.1.1", 0)).toBe(true);
    expect(autoriser("1.1.1.1", 10)).toBe(true);
    expect(autoriser("1.1.1.1", 20)).toBe(false);
    // Une autre IP n'est pas affectée par la première.
    expect(autoriser("2.2.2.2", 20)).toBe(true);
  });
});

describe("entetesSecurite", () => {
  const entetes = entetesSecurite();
  const valeur = (cle: string) => entetes.find((e) => e.key === cle)?.value;

  it("pose une CSP qui interdit tout par défaut, sauf la même origine", () => {
    const csp = valeur("Content-Security-Policy");
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("pose HSTS avec une longue durée et les sous-domaines", () => {
    expect(valeur("Strict-Transport-Security")).toMatch(/max-age=\d{7,}/);
    expect(valeur("Strict-Transport-Security")).toContain("includeSubDomains");
  });

  it("interdit l'affichage du site dans une iframe (X-Frame-Options et CSP concordent)", () => {
    expect(valeur("X-Frame-Options")).toBe("DENY");
  });

  it("refuse le sniffing de type MIME", () => {
    expect(valeur("X-Content-Type-Options")).toBe("nosniff");
  });

  it("désactive les capteurs non utilisés par le site", () => {
    const permissions = valeur("Permissions-Policy") ?? "";
    for (const capteur of ["camera", "microphone", "geolocation"]) {
      expect(permissions, capteur).toContain(`${capteur}=()`);
    }
  });
});

describe("contentSecurityPolicy", () => {
  it("ne laisse jamais de virgule ou de point-virgule final invalide", () => {
    const csp = contentSecurityPolicy();
    expect(csp.endsWith(";")).toBe(false);
    expect(csp).not.toContain(",");
  });
});
