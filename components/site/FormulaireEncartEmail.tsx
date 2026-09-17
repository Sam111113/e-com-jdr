"use client";

// Formulaire de l'encart d'accueil « Soyez prévenu de chaque sortie »
// (T1.9) : liste d'attente générale, séparé du composant statique
// EncartEmail pour garder le reste de la page sans JavaScript.
import { useActionState } from "react";
import { inscrireListeAttenteGenerale, type EtatInscription } from "@/app/actions/inscriptions";

const ETAT_INITIAL: EtatInscription = { statut: "initial" };

export function FormulaireEncartEmail() {
  const [etat, action, enCours] = useActionState(inscrireListeAttenteGenerale, ETAT_INITIAL);

  if (etat.statut === "envoye") {
    return (
      <p className="message-formulaire" role="status">
        {etat.message}
      </p>
    );
  }

  return (
    <>
      <form action={action} className="formulaire-ligne">
        <label htmlFor="encart-email" className="sr-only">
          Adresse email
        </label>
        <input
          id="encart-email"
          type="email"
          name="email"
          placeholder="votre@email.fr"
          autoComplete="email"
          required
          maxLength={254}
        />
        <button type="submit" className="btn btn-primaire" disabled={enCours}>
          {enCours ? "Envoi…" : "Me prévenir"}
        </button>
      </form>
      {etat.statut === "erreur" && (
        <p className="message-formulaire message-erreur" role="alert">
          {etat.message}
        </p>
      )}
    </>
  );
}
