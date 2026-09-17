// Encart d'inscription email (T1.9, liste d'attente générale). Reste un
// composant serveur : seul FormulaireEncartEmail est un client component,
// pour garder le reste de la page sans JavaScript inutile.
import { FormulaireEncartEmail } from "./FormulaireEncartEmail";

export function EncartEmail({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="encart">
      <h2 className="section-titre">{titre}</h2>
      <p>{texte}</p>
      <FormulaireEncartEmail />
    </div>
  );
}
