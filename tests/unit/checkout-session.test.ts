// Construction des paramètres de la session Stripe Checkout (T1.8, étape
// 1). Fonction pure, sans appel réseau : voir lib/commandes/creer-session-checkout.ts.
import { describe, expect, it } from "vitest";
import { paramsSessionCheckout } from "../../lib/commandes/creer-session-checkout";

describe("paramsSessionCheckout", () => {
  const params = paramsSessionCheckout({
    jeu: { id: 7, slug: "le-manoir-hante", title: "Le Manoir Hanté", prixEur: 1490 },
    siteUrl: "https://exemple-test.invalid",
  });

  it("reprend le prix de la base en centimes, sans synchroniser de catalogue Stripe", () => {
    const ligne = params.line_items?.[0];
    expect(ligne?.price_data?.unit_amount).toBe(1490);
    expect(ligne?.price_data?.currency).toBe("eur");
    expect(ligne?.quantity).toBe(1);
  });

  it("porte l'identifiant du jeu en métadonnée, pour le retrouver au webhook", () => {
    expect(params.metadata).toEqual({ gameId: "7", gameSlug: "le-manoir-hante" });
  });

  it("exige le consentement CGV / rétractation avant paiement", () => {
    expect(params.consent_collection?.terms_of_service).toBe("required");
    const submit = params.custom_text?.submit;
    expect(typeof submit === "object" && submit?.message).toContain("rétractation");
  });

  it("renvoie vers la fiche du jeu en cas d'abandon, et la confirmation en cas de succès", () => {
    expect(params.cancel_url).toBe("https://exemple-test.invalid/jeux/le-manoir-hante");
    expect(params.success_url).toContain("/commande/confirmation?session_id=");
  });
});
