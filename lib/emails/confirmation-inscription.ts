// Email de confirmation d'inscription (double opt-in, T1.9), même modèle
// que lib/contact/brevo.ts et lib/emails/commande.ts.
const API_BREVO = "https://api.brevo.com/v3/smtp/email";

export interface EmailConfirmationInscription {
  email: string;
  urlConfirmation: string;
  urlDesinscription: string;
  /** Dit clairement ce que la personne recevra (brief T1.9). */
  texteConsentement: string;
}

export type EnvoyerConfirmationInscription = (
  donnees: EmailConfirmationInscription,
) => Promise<"envoye" | "non-configure">;

export const envoyerConfirmationInscriptionParBrevo: EnvoyerConfirmationInscription = async (
  donnees,
) => {
  const cle = process.env.BREVO_API_KEY;
  const expediteur = process.env.EMAIL_EXPEDITEUR;
  if (!cle || !expediteur) return "non-configure";

  const reponse = await fetch(API_BREVO, {
    method: "POST",
    headers: { "api-key": cle, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: expediteur },
      to: [{ email: donnees.email }],
      subject: "Confirmez votre inscription",
      textContent: [
        donnees.texteConsentement,
        "",
        `Confirmez votre inscription : ${donnees.urlConfirmation}`,
        "",
        "Vous n'êtes pas à l'origine de cette demande ? Ignorez cet email, ou " +
          `désinscrivez-vous directement : ${donnees.urlDesinscription}`,
      ].join("\n"),
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!reponse.ok) {
    throw new Error(`Brevo a répondu ${reponse.status}`);
  }
  return "envoye";
};
