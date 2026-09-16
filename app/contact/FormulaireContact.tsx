"use client";

import { useActionState, useEffect } from "react";
import type { EtatContact } from "@/lib/contact/formulaire";
import { suivreEvenement } from "@/lib/analytics/umami";
import { envoyerContact } from "./actions";

const ETAT_INITIAL: EtatContact = { statut: "initial" };

function Erreur({ id, texte }: { id: string; texte?: string }) {
  if (!texte) return null;
  return (
    <p id={id} className="champ-erreur">
      {texte}
    </p>
  );
}

export function FormulaireContact() {
  const [etat, action, enCours] = useActionState(envoyerContact, ETAT_INITIAL);

  useEffect(() => {
    if (etat.statut === "envoye") suivreEvenement("contact_envoye");
  }, [etat.statut]);

  if (etat.statut === "envoye") {
    return (
      <p className="message-formulaire" role="status">
        {etat.message}
      </p>
    );
  }

  const erreurs = etat.erreurs ?? {};

  return (
    <form action={action} className="filtres" noValidate>
      <div className="champ">
        <label htmlFor="contact-nom">Votre nom</label>
        <input
          id="contact-nom"
          name="nom"
          autoComplete="name"
          required
          maxLength={100}
          defaultValue={etat.valeurs?.nom}
          aria-invalid={erreurs.nom ? true : undefined}
          aria-describedby={erreurs.nom ? "erreur-nom" : undefined}
        />
        <Erreur id="erreur-nom" texte={erreurs.nom} />
      </div>

      <div className="champ" style={{ marginTop: "0.9rem" }}>
        <label htmlFor="contact-email">Votre adresse email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          defaultValue={etat.valeurs?.email}
          aria-invalid={erreurs.email ? true : undefined}
          aria-describedby={erreurs.email ? "erreur-email" : undefined}
        />
        <Erreur id="erreur-email" texte={erreurs.email} />
      </div>

      <div className="champ" style={{ marginTop: "0.9rem" }}>
        <label htmlFor="contact-message">Votre message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={7}
          required
          minLength={10}
          maxLength={5000}
          defaultValue={etat.valeurs?.message}
          aria-invalid={erreurs.message ? true : undefined}
          aria-describedby={erreurs.message ? "erreur-message" : undefined}
        />
        <Erreur id="erreur-message" texte={erreurs.message} />
      </div>

      {/* Champ piège pour les robots, invisible et ignoré par les lecteurs d'écran. */}
      <div className="piege" aria-hidden="true">
        <label htmlFor="contact-site">Ne pas remplir</label>
        <input id="contact-site" name="site_web" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="note">
        Vos coordonnées servent uniquement à vous répondre et ne sont transmises à personne.
      </p>

      <div className="filtres-actions">
        <button type="submit" className="btn btn-primaire" disabled={enCours}>
          {enCours ? "Envoi en cours…" : "Envoyer le message"}
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
