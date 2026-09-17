"use client";

import { useActionState } from "react";
import { inscrireJeuGratuit, type EtatInscription } from "@/app/actions/inscriptions";

const ETAT_INITIAL: EtatInscription = { statut: "initial" };

export function FormulaireJeuGratuit() {
  const [etat, action, enCours] = useActionState(inscrireJeuGratuit, ETAT_INITIAL);

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
        <label htmlFor="jeu-gratuit-email">Votre adresse email</label>
        <input
          id="jeu-gratuit-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
        />
      </div>

      {/* Case non pré-cochée, séparée de l'inscription au jeu gratuit (brief T1.9). */}
      <div className="champ champ-case" style={{ marginTop: "0.9rem" }}>
        <label>
          <input type="checkbox" name="newsletter" />
          <span>
            Je souhaite aussi recevoir la newsletter (nouveaux jeux, offres) — désinscription
            possible à tout moment.
          </span>
        </label>
      </div>

      <div className="filtres-actions">
        <button type="submit" className="btn btn-primaire" disabled={enCours}>
          {enCours ? "Envoi en cours…" : "Recevoir le mini-jeu gratuit"}
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
