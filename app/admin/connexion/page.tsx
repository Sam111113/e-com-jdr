import type { Metadata } from "next";
import { FormulaireConnexion } from "./FormulaireConnexion";

// Jamais indexée, y compris une fois le site public (T2.4) : contrairement
// aux autres pages, ce réglage ne doit pas dépendre de SITE_PUBLIC.
export const metadata: Metadata = {
  title: "Connexion admin",
  robots: { index: false, follow: false },
};

export default function ConnexionAdmin() {
  return (
    <div className="conteneur-etroit en-tete-page">
      <h1>Connexion admin</h1>
      <FormulaireConnexion />
    </div>
  );
}
