import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page introuvable",
};

export default function PageIntrouvable() {
  return (
    <div className="conteneur-etroit en-tete-page" style={{ textAlign: "center" }}>
      <p className="hero-badge">Erreur 404</p>
      <h1>Cette page s&apos;est volatilisée</h1>
      <p style={{ marginInline: "auto", marginBottom: "1.5rem" }}>
        Aucun indice ne mène ici : la page a peut-être changé d&apos;adresse, ou n&apos;a
        jamais existé.
      </p>
      <div className="hero-actions">
        <Link href="/jeux" className="btn btn-primaire">
          Voir tous les jeux
        </Link>
        <Link href="/" className="btn btn-secondaire">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
