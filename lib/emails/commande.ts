// Email de confirmation de commande, envoyé par l'API transactionnelle de
// Brevo (T1.8), sur le même modèle que lib/contact/brevo.ts. Sans
// configuration complète, l'email n'est pas envoyé (le webhook ne doit
// jamais planter pour autant : voir lib/commandes/traitement-webhook.ts).
const API_BREVO = "https://api.brevo.com/v3/smtp/email";

export interface LienEmail {
  jeuTitre: string;
  url: string;
}

export interface CommandeEmail {
  email: string;
  liens: LienEmail[];
  urlCgv: string;
}

export type EnvoyerEmailCommande = (commande: CommandeEmail) => Promise<"envoye" | "non-configure">;

function corpsTexte(commande: CommandeEmail): string {
  const lignesLiens = commande.liens
    .map((lien) => `- ${lien.jeuTitre} : ${lien.url}`)
    .join("\n");
  return [
    "Merci pour votre achat !",
    "",
    "Vos liens de téléchargement (valables 7 jours, 5 téléchargements maximum) :",
    lignesLiens,
    "",
    "En achetant, vous avez demandé l'accès immédiat au contenu numérique et " +
      "renoncé à votre droit de rétractation légal de 14 jours.",
    "",
    `Conditions générales de vente : ${commande.urlCgv}`,
  ].join("\n");
}

export const envoyerEmailCommandeParBrevo: EnvoyerEmailCommande = async (commande) => {
  const cle = process.env.BREVO_API_KEY;
  const expediteur = process.env.EMAIL_EXPEDITEUR;
  if (!cle || !expediteur) return "non-configure";

  const reponse = await fetch(API_BREVO, {
    method: "POST",
    headers: { "api-key": cle, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: expediteur },
      to: [{ email: commande.email }],
      subject: "Votre commande — liens de téléchargement",
      textContent: corpsTexte(commande),
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!reponse.ok) {
    throw new Error(`Brevo a répondu ${reponse.status}`);
  }
  return "envoye";
};
