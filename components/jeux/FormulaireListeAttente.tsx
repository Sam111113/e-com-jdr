"use client";

// Liste d'attente d'un jeu (T1.9) : remplace le bouton « Me prévenir de la
// sortie » désactivé de BlocPrixAction (T1.7) une fois le jeu identifié.
import { useActionState, useEffect } from "react";
import { inscrireListeAttente, type EtatInscription } from "@/app/actions/inscriptions";
import { suivreEvenement } from "@/lib/analytics/umami";

const ETAT_INITIAL: EtatInscription = { statut: "initial" };

export function FormulaireListeAttente({ gameId, gameTitre }: { gameId: number; gameTitre: string }) {
  const inscrireAvecJeu = inscrireListeAttente.bind(null, gameId, gameTitre);
  const [etat, action, enCours] = useActionState(inscrireAvecJeu, ETAT_INITIAL);

  useEffect(() => {
    if (etat.statut === "envoye") suivreEvenement("liste_attente_inscrit");
  }, [etat.statut]);

  if (etat.statut === "envoye") {
    return (
      <p className="message-formulaire" role="status">
        {etat.message}
      </p>
    );
  }

  return (
    <form action={action} className="bloc-liste-attente">
      <label htmlFor={`liste-attente-email-${gameId}`} className="sr-only">
        Votre adresse email
      </label>
      <input
        id={`liste-attente-email-${gameId}`}
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        placeholder="Votre email"
      />
      <button type="submit" className="btn btn-saison btn-bloc" disabled={enCours}>
        {enCours ? "Envoi en cours…" : "Me prévenir de la sortie"}
      </button>
      {etat.statut === "erreur" && (
        <p className="message-formulaire message-erreur" role="alert">
          {etat.message}
        </p>
      )}
    </form>
  );
}
