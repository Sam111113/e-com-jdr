import type { Metadata } from "next";
import Link from "next/link";
import { EtapesCommentCaMarche } from "@/components/site/EtapesCommentCaMarche";
import { FilAriane } from "@/components/site/FilAriane";

export const metadata: Metadata = {
  title: "Comment ça marche",
  description:
    "Choisir son jeu, recevoir son kit PDF, l'imprimer et jouer : tout ce qu'il faut savoir avant d'organiser votre soirée à énigmes.",
};

export default function CommentCaMarche() {
  return (
    <>
      <FilAriane etapes={[{ libelle: "Comment ça marche" }]} />
      <div className="conteneur en-tete-page">
        <h1>Comment ça marche</h1>
        <p>
          Nos jeux se jouent à la maison, avec vos proches, à partir d&apos;un simple kit à
          imprimer. Voici comment se déroule une aventure, du choix du jeu jusqu&apos;à la
          révélation finale.
        </p>
      </div>

      <section className="section" aria-labelledby="titre-etapes">
        <div className="conteneur">
          <h2 id="titre-etapes" className="section-titre">
            En trois étapes
          </h2>
          <EtapesCommentCaMarche />
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="titre-types">
        <div className="conteneur-etroit texte-riche">
          <h2 id="titre-types">Quel type de jeu choisir ?</h2>
          <h3>L&apos;escape game</h3>
          <p>
            Vos invités font équipe pour résoudre une série d&apos;énigmes et percer un mystère.
            Idéal pour un groupe qui aime réfléchir ensemble.
          </p>
          <h3>La chasse au trésor</h3>
          <p>
            Les joueurs suivent une piste d&apos;indices d&apos;une cachette à l&apos;autre, dans
            la maison ou le jardin, jusqu&apos;au trésor final. Parfait pour les enfants qui ont
            besoin de bouger.
          </p>
          <h3>La murder party</h3>
          <p>
            Chaque invité incarne un personnage avec ses secrets. Au fil de la soirée, tous
            mènent l&apos;enquête pour démasquer le coupable. Pensée pour les soirées entre
            adultes.
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="titre-preparer">
        <div className="conteneur-etroit texte-riche">
          <h2 id="titre-preparer">Bien préparer sa soirée</h2>
          <p>
            Chaque fiche de jeu précise le nombre de joueurs, l&apos;âge conseillé, la durée, la
            difficulté, ainsi que le temps de préparation et le matériel à prévoir. Prenez le
            temps de la lire : elle vous dit exactement à quoi vous attendre.
          </p>
          <p>
            Les ventes ne sont pas encore ouvertes. Pour être prévenu de la sortie des premiers
            jeux, <Link href="/jeux">parcourez le catalogue</Link> ou{" "}
            <Link href="/contact">écrivez-nous</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
