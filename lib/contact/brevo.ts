// Envoi du message de contact par l'API transactionnelle de Brevo.
// Sans configuration complète, rien n'est envoyé et le formulaire l'indique.
import type { EnvoyerMessage } from "./formulaire";

const API_BREVO = "https://api.brevo.com/v3/smtp/email";

export const envoyerParBrevo: EnvoyerMessage = async ({ nom, email, message }) => {
  const cle = process.env.BREVO_API_KEY;
  const expediteur = process.env.EMAIL_EXPEDITEUR;
  const destinataire = process.env.CONTACT_EMAIL_DESTINATAIRE;
  if (!cle || !expediteur || !destinataire) return "non-configure";

  const reponse = await fetch(API_BREVO, {
    method: "POST",
    headers: { "api-key": cle, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: expediteur },
      to: [{ email: destinataire }],
      replyTo: { email, name: nom },
      subject: `Formulaire de contact : message de ${nom}`,
      textContent: `Nom : ${nom}\nEmail : ${email}\n\n${message}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!reponse.ok) {
    throw new Error(`Brevo a répondu ${reponse.status}`);
  }
  return "envoye";
};
