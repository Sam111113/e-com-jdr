"use client";

import { useActionState } from "react";
import { demanderNouveauxLiens, type EtatRetrouver } from "./actions";

const ETAT_INITIAL: EtatRetrouver = { statut: "initial" };

export function FormulaireRetrouver() {
  const [etat, action, enCours] = useActionState(demanderNouveauxLiens, ETAT_INITIAL);

  if (etat.statut === "envoye") {
    return (
      <p className="message-formulaire" role="status">
        {etat.message}
      </p>
    );
  }

  return (
    <form action={action} className="filtres" noValidate>
      <div className="champ">
        <label htmlFor="retrouver-email">Votre adresse email</label>
        <input id="retrouver-email" name="email" type="email" autoComplete="email" required maxLength={254} />
      </div>

      <div className="filtres-actions">
        <button type="submit" className="btn btn-primaire" disabled={enCours}>
          {enCours ? "Envoi en cours…" : "Recevoir mes liens"}
        </button>
      </div>

      {etat.statut === "erreur" && (
        <p className="message-formulaire message-erreur" role="alert">
          {etat.message}
        </p>
      )}
    </form>
  );
}
