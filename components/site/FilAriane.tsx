import Link from "next/link";

export interface EtapeFilAriane {
  libelle: string;
  href?: string;
}

/** La dernière étape est la page courante (sans lien). */
export function FilAriane({ etapes }: { etapes: EtapeFilAriane[] }) {
  return (
    <nav className="conteneur fil-ariane" aria-label="Fil d'Ariane">
      <ol>
        <li>
          <Link href="/">Accueil</Link>
        </li>
        {etapes.map((etape, index) =>
          etape.href && index < etapes.length - 1 ? (
            <li key={etape.href}>
              <Link href={etape.href}>{etape.libelle}</Link>
            </li>
          ) : (
            <li key={etape.libelle} aria-current="page">
              {etape.libelle}
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
