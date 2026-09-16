import Link from "next/link";
import { JsonLd } from "@/components/site/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export interface EtapeFilAriane {
  libelle: string;
  href?: string;
}

interface Props {
  etapes: EtapeFilAriane[];
  /** Chemin de la page courante (dernière étape) : sert au JSON-LD BreadcrumbList,
   * qui exige une URL même pour l'élément final. */
  cheminCourant: string;
}

/** La dernière étape est la page courante (sans lien). */
export function FilAriane({ etapes, cheminCourant }: Props) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(
          [{ libelle: "Accueil", href: "/" }, ...etapes],
          cheminCourant,
        )}
      />
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
    </>
  );
}
