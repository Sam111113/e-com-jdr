// Formulaire de contact (T1.6) : validation, champ piège, limite d'envoi et
// comportement sans configuration Brevo. Aucun email réel n'est envoyé.
import { describe, expect, it, vi } from "vitest";
import { creerLimiteur, traiterContact, type EnvoyerMessage } from "../../lib/contact/formulaire";
import { envoyerParBrevo } from "../../lib/contact/brevo";

function formulaire(champs: Record<string, string>): FormData {
  const donnees = new FormData();
  for (const [cle, valeur] of Object.entries(champs)) donnees.set(cle, valeur);
  return donnees;
}

const VALIDE = { nom: "Camille", email: "camille@example.fr", message: "Bonjour, une question." };
const toujours = () => true;

describe("traiterContact", () => {
  it("envoie un message valide, espaces superflus retirés", async () => {
    const envoyer = vi.fn<EnvoyerMessage>().mockResolvedValue("envoye");
    const etat = await traiterContact(formulaire({ ...VALIDE, nom: "  Camille " }), {
      ip: "1.2.3.4",
      autoriser: toujours,
      envoyer,
    });
    expect(etat.statut).toBe("envoye");
    expect(envoyer).toHaveBeenCalledWith(VALIDE);
  });

  it("refuse les champs invalides sans rien envoyer, et garde la saisie", async () => {
    const envoyer = vi.fn<EnvoyerMessage>();
    const etat = await traiterContact(
      formulaire({ nom: "", email: "pas-un-email", message: "court" }),
      { ip: "1.2.3.4", autoriser: toujours, envoyer },
    );
    expect(etat.statut).toBe("erreur");
    expect(Object.keys(etat.erreurs ?? {}).sort()).toEqual(["email", "message", "nom"]);
    expect(etat.valeurs?.email).toBe("pas-un-email");
    expect(envoyer).not.toHaveBeenCalled();
  });

  it("refuse un nom contenant un retour à la ligne", async () => {
    const envoyer = vi.fn<EnvoyerMessage>();
    const etat = await traiterContact(formulaire({ ...VALIDE, nom: "Camille\nBcc: x@y.z" }), {
      ip: "1.2.3.4",
      autoriser: toujours,
      envoyer,
    });
    expect(etat.erreurs?.nom).toBeDefined();
    expect(envoyer).not.toHaveBeenCalled();
  });

  it("ignore silencieusement un robot qui remplit le champ piège", async () => {
    const envoyer = vi.fn<EnvoyerMessage>();
    const etat = await traiterContact(formulaire({ ...VALIDE, site_web: "http://spam" }), {
      ip: "1.2.3.4",
      autoriser: toujours,
      envoyer,
    });
    expect(etat.statut).toBe("envoye");
    expect(envoyer).not.toHaveBeenCalled();
  });

  it("n'annonce pas de succès si l'envoi n'est pas configuré ou échoue", async () => {
    const nonConfigure = await traiterContact(formulaire(VALIDE), {
      ip: "1.2.3.4",
      autoriser: toujours,
      envoyer: async () => "non-configure",
    });
    expect(nonConfigure.statut).toBe("erreur");

    const erreurSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const echec = await traiterContact(formulaire(VALIDE), {
      ip: "1.2.3.4",
      autoriser: toujours,
      envoyer: async () => {
        throw new Error("réseau");
      },
    });
    expect(echec.statut).toBe("erreur");
    erreurSpy.mockRestore();
  });

  it("applique la limite d'envoi par adresse IP", async () => {
    const autoriser = creerLimiteur(2, 60_000);
    const envoyer = vi.fn<EnvoyerMessage>().mockResolvedValue("envoye");
    const options = { ip: "5.6.7.8", autoriser, envoyer };
    expect((await traiterContact(formulaire(VALIDE), options)).statut).toBe("envoye");
    expect((await traiterContact(formulaire(VALIDE), options)).statut).toBe("envoye");
    expect((await traiterContact(formulaire(VALIDE), options)).statut).toBe("erreur");
    expect(
      (await traiterContact(formulaire(VALIDE), { ...options, ip: "9.9.9.9" })).statut,
    ).toBe("envoye");
    expect(envoyer).toHaveBeenCalledTimes(3);
  });
});

describe("creerLimiteur", () => {
  it("libère les envois une fois la fenêtre écoulée", () => {
    const autoriser = creerLimiteur(1, 1000);
    expect(autoriser("ip", 0)).toBe(true);
    expect(autoriser("ip", 500)).toBe(false);
    expect(autoriser("ip", 1001)).toBe(true);
  });
});

describe("envoyerParBrevo", () => {
  it("n'appelle pas Brevo sans configuration complète", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.stubEnv("BREVO_API_KEY", "");
    vi.stubEnv("EMAIL_EXPEDITEUR", "site@example.fr");
    vi.stubEnv("CONTACT_EMAIL_DESTINATAIRE", "equipe@example.fr");
    expect(await envoyerParBrevo(VALIDE)).toBe("non-configure");
    expect(fetchSpy).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
    fetchSpy.mockRestore();
  });
});
