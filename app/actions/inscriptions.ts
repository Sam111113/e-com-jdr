"use server";

// Point d'entrée unique pour les trois formulaires d'inscription (jeu
// gratuit, liste d'attente par jeu, newsletter — T1.9) : même validation,
// même limiteur, même envoi de confirmation. Les textes de consentement
// disent explicitement ce que la personne recevra (brief T1.9).
import { headers } from "next/headers";
import { z } from "zod";
import { creerLimiteurParIp } from "@/lib/securite/limiteur";
import { inscrire, type TypeInscription } from "@/lib/inscriptions/inscrire";
import { envoyerConfirmationInscriptionParBrevo } from "@/lib/emails/confirmation-inscription";
import { baseUrl } from "@/lib/seo/site-url";

export interface EtatInscription {
  statut: "initial" | "envoye" | "erreur";
  message?: string;
}

const MESSAGE_ENVOYE = "Vérifiez votre boîte email pour confirmer votre inscription.";

const autoriser = creerLimiteurParIp(5, 15 * 60 * 1000);

const schemaEmail = z
  .string()
  .trim()
  .max(254)
  .pipe(z.email({ message: "Indiquez une adresse email valide." }));

async function adresseIp(): Promise<string> {
  const entetes = await headers();
  return (
    entetes.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    entetes.get("x-real-ip") ||
    "inconnue"
  );
}

async function inscrireEtEnvoyer(
  email: string,
  type: TypeInscription,
  gameId: number | null,
  consentText: string,
): Promise<void> {
  const { db } = await import("@/db/client");
  const inscription = await inscrire(db, { email, type, gameId, consentText });
  const site = baseUrl().toString().replace(/\/$/, "");
  await envoyerConfirmationInscriptionParBrevo({
    email,
    urlConfirmation: `${site}/confirmer/${inscription.token}`,
    urlDesinscription: `${site}/desinscription/${inscription.token}`,
    texteConsentement: consentText,
  });
}

export async function inscrireJeuGratuit(
  _etat: EtatInscription,
  donnees: FormData,
): Promise<EtatInscription> {
  if (!autoriser(await adresseIp())) {
    return { statut: "erreur", message: "Trop de demandes. Réessayez dans quelques minutes." };
  }
  const analyse = schemaEmail.safeParse(donnees.get("email"));
  if (!analyse.success) {
    return { statut: "erreur", message: analyse.error.issues[0]?.message ?? "Email invalide." };
  }
  const email = analyse.data;

  await inscrireEtEnvoyer(
    email,
    "jeu_gratuit",
    null,
    "Vous recevrez un email pour confirmer votre inscription, puis l'accès immédiat à un mini-jeu gratuit.",
  );

  if (donnees.get("newsletter") === "on") {
    await inscrireEtEnvoyer(
      email,
      "newsletter",
      null,
      "Vous recevrez occasionnellement des emails sur les nouveaux jeux et les offres PartyHunter. " +
        "Désinscription possible à tout moment.",
    );
  }

  return { statut: "envoye", message: MESSAGE_ENVOYE };
}

export async function inscrireNewsletter(
  _etat: EtatInscription,
  donnees: FormData,
): Promise<EtatInscription> {
  if (!autoriser(await adresseIp())) {
    return { statut: "erreur", message: "Trop de demandes. Réessayez dans quelques minutes." };
  }
  const analyse = schemaEmail.safeParse(donnees.get("email"));
  if (!analyse.success) {
    return { statut: "erreur", message: analyse.error.issues[0]?.message ?? "Email invalide." };
  }

  await inscrireEtEnvoyer(
    analyse.data,
    "newsletter",
    null,
    "Vous recevrez occasionnellement des emails sur les nouveaux jeux et les offres PartyHunter. " +
      "Désinscription possible à tout moment.",
  );

  return { statut: "envoye", message: MESSAGE_ENVOYE };
}

/** Liste d'attente générale (pas liée à un jeu précis), utilisée par
 * l'encart d'accueil « Soyez prévenu de chaque sortie ». */
export async function inscrireListeAttenteGenerale(
  _etat: EtatInscription,
  donnees: FormData,
): Promise<EtatInscription> {
  if (!autoriser(await adresseIp())) {
    return { statut: "erreur", message: "Trop de demandes. Réessayez dans quelques minutes." };
  }
  const analyse = schemaEmail.safeParse(donnees.get("email"));
  if (!analyse.success) {
    return { statut: "erreur", message: analyse.error.issues[0]?.message ?? "Email invalide." };
  }

  await inscrireEtEnvoyer(
    analyse.data,
    "liste_attente",
    null,
    "Vous recevrez un email pour confirmer votre inscription, puis un message à chaque nouveau jeu ou nouvelle saison.",
  );

  return { statut: "envoye", message: MESSAGE_ENVOYE };
}

export async function inscrireListeAttente(
  gameId: number,
  gameTitre: string,
  _etat: EtatInscription,
  donnees: FormData,
): Promise<EtatInscription> {
  if (!autoriser(await adresseIp())) {
    return { statut: "erreur", message: "Trop de demandes. Réessayez dans quelques minutes." };
  }
  const analyse = schemaEmail.safeParse(donnees.get("email"));
  if (!analyse.success) {
    return { statut: "erreur", message: analyse.error.issues[0]?.message ?? "Email invalide." };
  }

  await inscrireEtEnvoyer(
    analyse.data,
    "liste_attente",
    gameId,
    `Vous recevrez un email pour confirmer votre inscription, puis un email quand « ${gameTitre} » sera disponible à la vente.`,
  );

  return { statut: "envoye", message: MESSAGE_ENVOYE };
}
