"use client";

// Bouton d'achat (T1.8) : seul composant interactif de la fiche jeu, isolé
// du reste (BlocPrixAction, Server Component) pour garder le JavaScript
// envoyé au minimum tant que les ventes sont fermées (T1.6, performance).
import { useState } from "react";

export function BoutonAcheter({ slug }: { slug: string }) {
  const [consentement, setConsentement] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function acheter() {
    setErreur(null);
    setEnCours(true);
    try {
      const reponse = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, consentement }),
      });
      const donnees = (await reponse.json()) as { url?: string; erreur?: string };
      if (!reponse.ok || !donnees.url) {
        setErreur(donnees.erreur ?? "Le paiement n'a pas pu démarrer. Réessayez.");
        setEnCours(false);
        return;
      }
      window.location.href = donnees.url;
    } catch {
      setErreur("Le paiement n'a pas pu démarrer. Réessayez.");
      setEnCours(false);
    }
  }

  return (
    <div className="bloc-achat">
      <label className="champ-case">
        <input
          type="checkbox"
          checked={consentement}
          onChange={(evenement) => setConsentement(evenement.target.checked)}
        />
        <span>
          Je demande l&apos;accès immédiat au contenu numérique et je renonce à mon droit de
          rétractation de 14 jours.
        </span>
      </label>
      <button
        type="button"
        className="btn btn-primaire btn-bloc"
        disabled={!consentement || enCours}
        onClick={acheter}
      >
        {enCours ? "Redirection…" : "Acheter"}
      </button>
      {erreur && (
        <p className="message-formulaire message-erreur" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}
