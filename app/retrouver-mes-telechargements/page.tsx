import type { Metadata } from "next";
import { FilAriane } from "@/components/site/FilAriane";
import { metadonneesPage } from "@/lib/seo/meta";
import { FormulaireRetrouver } from "./FormulaireRetrouver";

export const metadata: Metadata = metadonneesPage({
  titre: "Retrouver mes téléchargements",
  description: "Vous avez perdu vos liens de téléchargement ? Recevez-en de nouveaux par email.",
  chemin: "/retrouver-mes-telechargements",
});

export default function RetrouverMesTelechargements() {
  return (
    <>
      <FilAriane
        etapes={[{ libelle: "Retrouver mes téléchargements" }]}
        cheminCourant="/retrouver-mes-telechargements"
      />
      <div className="conteneur-etroit en-tete-page">
        <h1>Retrouver mes téléchargements</h1>
        <p>
          Indiquez l&apos;adresse email utilisée lors de votre achat : si elle correspond à une
          commande, vous recevrez de nouveaux liens de téléchargement.
        </p>
      </div>
      <div className="conteneur-etroit">
        <FormulaireRetrouver />
      </div>
    </>
  );
}
