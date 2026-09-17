import type { Metadata } from "next";
import { FilAriane } from "@/components/site/FilAriane";
import { metadonneesPage } from "@/lib/seo/meta";
import { FormulaireJeuGratuit } from "./FormulaireJeuGratuit";

export const metadata: Metadata = metadonneesPage({
  titre: "Jeu gratuit",
  description:
    "Recevez gratuitement un mini-jeu PartyHunter par email, pour découvrir l'ambiance avant d'acheter.",
  chemin: "/jeu-gratuit",
});

export default function JeuGratuit() {
  return (
    <>
      <FilAriane etapes={[{ libelle: "Jeu gratuit" }]} cheminCourant="/jeu-gratuit" />
      <div className="conteneur-etroit en-tete-page">
        <h1>Un mini-jeu gratuit, tout de suite</h1>
        <p>
          Laissez votre email, confirmez votre inscription, et recevez l&apos;accès immédiat à un
          mini-jeu gratuit — de quoi découvrir l&apos;ambiance PartyHunter avant d&apos;acheter un
          jeu complet.
        </p>
      </div>
      <div className="conteneur-etroit">
        <FormulaireJeuGratuit />
      </div>
    </>
  );
}
