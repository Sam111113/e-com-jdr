"use client";

import { useActionState } from "react";
import { connexion, type EtatConnexion } from "./actions";

const ETAT_INITIAL: EtatConnexion = { statut: "initial" };

export function FormulaireConnexion() {
  const [etat, action, enCours] = useActionState(connexion, ETAT_INITIAL);

  return (
    <form action={action} className="filtres" noValidate>
      <div className="champ">
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          maxLength={254}
        />
      </div>
      <div className="champ" style={{ marginTop: "0.9rem" }}>
        <label htmlFor="admin-mot-de-passe">Mot de passe</label>
        <input
          id="admin-mot-de-passe"
          name="motDePasse"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="filtres-actions">
        <button type="submit" className="btn btn-primaire" disabled={enCours}>
          {enCours ? "Connexion…" : "Se connecter"}
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
