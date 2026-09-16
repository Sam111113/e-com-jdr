import type { Metadata } from "next";
import { FilAriane } from "@/components/site/FilAriane";
import { FormulaireContact } from "./FormulaireContact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur un jeu ou une idée de thème ? Écrivez-nous, nous répondons par email.",
};

export default function Contact() {
  return (
    <>
      <FilAriane etapes={[{ libelle: "Contact" }]} />
      <div className="conteneur-etroit en-tete-page">
        <h1>Nous écrire</h1>
        <p>
          Une question sur un jeu, une idée de thème ou une remarque ? Laissez-nous un message,
          nous vous répondrons par email.
        </p>
      </div>
      <div className="conteneur-etroit">
        <FormulaireContact />
      </div>
    </>
  );
}
