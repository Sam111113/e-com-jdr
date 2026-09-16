import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FilAriane } from "@/components/site/FilAriane";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description:
    "Format des jeux, impression, nombre de joueurs, disponibilité : les réponses aux questions les plus courantes sur nos jeux à imprimer.",
};

// Uniquement des réponses déjà établies par le projet. Les points qui
// dépendent des CGV (T1.11) ou du parcours d'achat (T1.8) seront ajoutés avec
// ces tâches, sans rien promettre avant.
const QUESTIONS: { question: string; reponse: ReactNode }[] = [
  {
    question: "Sous quelle forme se présentent les jeux ?",
    reponse: (
      <p>
        Chaque jeu est un kit au format PDF, à télécharger puis à imprimer chez vous. Il
        n&apos;y a aucun envoi postal.
      </p>
    ),
  },
  {
    question: "Quels types de jeux proposez-vous ?",
    reponse: (
      <p>
        Des escape games, des chasses au trésor et des murder parties, pour les enfants, les
        ados, les familles et les soirées entre adultes. Voir{" "}
        <Link href="/comment-ca-marche">comment choisir</Link>.
      </p>
    ),
  },
  {
    question: "Comment savoir si un jeu convient à mes invités ?",
    reponse: (
      <p>
        Chaque fiche indique le nombre de joueurs, l&apos;âge conseillé, la durée, la
        difficulté, le contenu du kit ainsi que la préparation et le matériel à prévoir. Le{" "}
        <Link href="/jeux">catalogue</Link> se filtre aussi selon ces critères.
      </p>
    ),
  },
  {
    question: "Peut-on déjà acheter les jeux ?",
    reponse: (
      <p>
        Pas encore : les ventes ouvriront prochainement. D&apos;ici là, vous pouvez découvrir
        les fiches des jeux et nous <Link href="/contact">écrire</Link> pour toute question.
      </p>
    ),
  },
  {
    question: "Une question qui ne figure pas ici ?",
    reponse: (
      <p>
        Écrivez-nous depuis la <Link href="/contact">page contact</Link>, nous vous répondrons
        par email.
      </p>
    ),
  },
];

export default function Faq() {
  return (
    <>
      <FilAriane etapes={[{ libelle: "Questions fréquentes" }]} />
      <div className="conteneur-etroit en-tete-page">
        <h1>Questions fréquentes</h1>
        <p>Les réponses aux questions que l&apos;on nous pose le plus souvent.</p>
      </div>
      <div className="conteneur-etroit faq">
        {QUESTIONS.map(({ question, reponse }) => (
          <details key={question}>
            <summary>{question}</summary>
            <div>{reponse}</div>
          </details>
        ))}
      </div>
    </>
  );
}
