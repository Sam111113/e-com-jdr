// Formulaire de contact (T1.6) : validation, anti-spam et envoi. La logique
// ne dépend ni de Next.js ni de Brevo, pour être testée directement.
import { z } from "zod";
import { creerLimiteurParIp } from "@/lib/securite/limiteur";

export interface EtatContact {
  statut: "initial" | "envoye" | "erreur";
  message?: string;
  erreurs?: Partial<Record<"nom" | "email" | "message", string>>;
  valeurs?: { nom: string; email: string; message: string };
}

export interface MessageContact {
  nom: string;
  email: string;
  message: string;
}

export type EnvoyerMessage = (message: MessageContact) => Promise<"envoye" | "non-configure">;

const schema = z.object({
  nom: z
    .string()
    .trim()
    .min(1, { message: "Indiquez votre nom." })
    .max(100, { message: "Le nom ne doit pas dépasser 100 caractères." })
    // Aucun retour à la ligne : le nom sert aussi d'en-tête « Répondre à ».
    .regex(/^[^\r\n]*$/, { message: "Le nom ne doit pas contenir de retour à la ligne." }),
  email: z
    .string()
    .trim()
    .max(254, { message: "Adresse email trop longue." })
    .pipe(z.email({ message: "Indiquez une adresse email valide." })),
  message: z
    .string()
    .trim()
    .min(10, { message: "Votre message doit faire au moins 10 caractères." })
    .max(5000, { message: "Votre message ne doit pas dépasser 5 000 caractères." }),
});

const LIMITE_ENVOIS = 5;
const FENETRE_MS = 15 * 60 * 1000;

/** Limiteur générique (T1.15, lib/securite/limiteur.ts), avec les valeurs
 * par défaut historiques du formulaire de contact. */
export function creerLimiteur(limite = LIMITE_ENVOIS, fenetreMs = FENETRE_MS) {
  return creerLimiteurParIp(limite, fenetreMs);
}

const texte = (valeur: FormDataEntryValue | null) => (typeof valeur === "string" ? valeur : "");

export async function traiterContact(
  donnees: FormData,
  options: { ip: string; autoriser: (ip: string) => boolean; envoyer: EnvoyerMessage },
): Promise<EtatContact> {
  const valeurs = {
    nom: texte(donnees.get("nom")),
    email: texte(donnees.get("email")),
    message: texte(donnees.get("message")),
  };

  // Champ piège invisible : rempli uniquement par les robots. On affiche un
  // succès pour ne pas leur apprendre à le contourner.
  if (texte(donnees.get("site_web")) !== "") {
    return { statut: "envoye", message: "Merci, votre message a bien été envoyé." };
  }

  const resultat = schema.safeParse(valeurs);
  if (!resultat.success) {
    const erreurs: EtatContact["erreurs"] = {};
    for (const probleme of resultat.error.issues) {
      const champ = probleme.path[0] as keyof NonNullable<EtatContact["erreurs"]>;
      erreurs[champ] ??= probleme.message;
    }
    return {
      statut: "erreur",
      message: "Certains champs sont à corriger.",
      erreurs,
      valeurs,
    };
  }

  if (!options.autoriser(options.ip)) {
    return {
      statut: "erreur",
      message: "Trop de messages envoyés en peu de temps. Réessayez dans quelques minutes.",
      valeurs,
    };
  }

  try {
    const envoi = await options.envoyer(resultat.data);
    if (envoi === "non-configure") {
      return {
        statut: "erreur",
        message:
          "L'envoi de messages n'est pas encore activé sur ce site. Réessayez prochainement.",
        valeurs,
      };
    }
  } catch (erreur) {
    console.error("Formulaire de contact : échec de l'envoi", erreur);
    return {
      statut: "erreur",
      message: "Votre message n'a pas pu être envoyé. Réessayez dans quelques instants.",
      valeurs,
    };
  }

  return { statut: "envoye", message: "Merci, votre message a bien été envoyé." };
}
