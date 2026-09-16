// Pages collections (D17) : hubs par saison ou public, et pages par type.
// Toute adresse absente de lib/collections.ts renvoie une 404.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GrilleJeux } from "@/components/jeux/GrilleJeux";
import { FilAriane } from "@/components/site/FilAriane";
import { pagesTypeDuHub, trouverPageCollection } from "@/lib/collections";
import { listerJeux } from "@/lib/games/queries";

export async function generateMetadata({
  params,
}: PageProps<"/[collection]">): Promise<Metadata> {
  const page = trouverPageCollection((await params).collection);
  if (!page) return {};
  return { title: { absolute: page.titreSeo }, description: page.description };
}

export default async function PageCollection({ params }: PageProps<"/[collection]">) {
  const page = trouverPageCollection((await params).collection);
  if (!page) notFound();

  const parent = page.parent ? trouverPageCollection(page.parent) : undefined;
  const sousPages = pagesTypeDuHub(page.slug);
  const jeux = await listerJeux(page.filtre);

  return (
    <>
      <FilAriane
        etapes={[
          ...(parent ? [{ libelle: parent.titre, href: `/${parent.slug}` }] : []),
          { libelle: page.titre },
        ]}
      />
      <div className="conteneur en-tete-page">
        <h1>{page.titre}</h1>
        <p>{page.intro}</p>
      </div>

      <div className="conteneur">
        {sousPages.length > 0 && (
          <nav aria-label={`Types de jeux : ${page.titre}`}>
            <ul className="liens-collections">
              {sousPages.map((sousPage) => (
                <li key={sousPage.slug}>
                  <Link href={`/${sousPage.slug}`} className="lien-pastille">
                    {sousPage.titre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <GrilleJeux
          jeux={jeux}
          niveauTitre="h2"
          premiereSection
          vide={
            <>
              <p>Les premiers jeux de cette collection sont en préparation.</p>
              <p>
                En attendant, <Link href="/jeux">découvrez tout le catalogue</Link>
                {parent && (
                  <>
                    {" "}
                    ou la page <Link href={`/${parent.slug}`}>{parent.titre}</Link>
                  </>
                )}
                .
              </p>
            </>
          }
        />
      </div>
    </>
  );
}
