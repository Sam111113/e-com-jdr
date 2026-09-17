// Accès au mini-jeu gratuit (T1.9). Mini-jeu factice pour l'instant, comme
// le jeu factice du catalogue (T1.5) — clairement annoncé comme tel, jamais
// présenté comme le contenu final (brief, interdits : ne rien inventer).
import type { Metadata } from "next";
import { metadonneesPage } from "@/lib/seo/meta";

export const metadata: Metadata = metadonneesPage({
  titre: "Votre mini-jeu gratuit",
  description: "Accédez à votre mini-jeu gratuit PartyHunter.",
  chemin: "/jeu-gratuit/acces",
});

export default function AccesJeuGratuit() {
  return (
    <main className="conteneur-etroit en-tete-page">
      <h1>Votre mini-jeu gratuit</h1>
      <p className="note">
        Mini-jeu factice — cette page sera remplacée par le vrai mini-jeu gratuit une fois fourni
        par l&apos;équipe.
      </p>
      <p>
        Merci de votre confiance ! En attendant le vrai mini-jeu, voici un avant-goût : une petite
        énigme pour se mettre dans l&apos;ambiance d&apos;une soirée PartyHunter.
      </p>
    </main>
  );
}
