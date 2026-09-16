import type { Metadata } from "next";
import Link from "next/link";
import { FilAriane } from "@/components/site/FilAriane";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "À propos",
  description: `Qui se cache derrière ${site.nom} : une petite équipe française qui crée des jeux à imprimer pour des soirées pleines de mystère.`,
};

// Contenu provisoire (T1.6) : à remplacer par le texte de l'équipe.
export default function APropos() {
  return (
    <>
      <FilAriane etapes={[{ libelle: "À propos" }]} />
      <div className="conteneur-etroit en-tete-page">
        <p className="provisoire">
          Contenu provisoire : cette page attend le texte de présentation de l&apos;équipe.
        </p>
        <h1>À propos</h1>
      </div>
      <div className="conteneur-etroit texte-riche">
        <p>
          Nous sommes une petite équipe française passionnée de jeux. Nous imaginons des
          aventures à imprimer : escape games, chasses au trésor et murder parties, pour réunir
          petits et grands autour d&apos;un mystère.
        </p>
        <p>
          Chaque jeu est écrit, mis en page et testé par nos soins, avec une idée en
          tête : que l&apos;organisateur puisse tout préparer simplement, et que les joueurs
          vivent une vraie soirée d&apos;aventure.
        </p>
        <p>
          Une question, une idée de thème ? <Link href="/contact">Écrivez-nous</Link>.
        </p>
      </div>
    </>
  );
}
