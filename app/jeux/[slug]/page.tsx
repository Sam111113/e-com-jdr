import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { BadgesJeu } from "@/components/jeux/BadgesJeu";
import { BlocPrixAction } from "@/components/jeux/BlocPrixAction";
import { GrilleJeux } from "@/components/jeux/GrilleJeux";
import { ImageJeu } from "@/components/jeux/ImageJeu";
import { JsonLd } from "@/components/site/JsonLd";
import { FilAriane, type EtapeFilAriane } from "@/components/site/FilAriane";
import { TexteRiche } from "@/components/site/TexteRiche";
import { PAGES_COLLECTIONS } from "@/lib/collections";
import {
  formaterDuree,
  formaterJoueurs,
  LIBELLES_DIFFICULTES,
  LIBELLES_PUBLICS,
} from "@/lib/games/format";
import { LARGEURS_APERCU, LARGEURS_COUVERTURE } from "@/lib/games/images";
import { apercusDuJeu, jeuxSimilaires, trouverJeu } from "@/lib/games/queries";
import { trouverRedirection } from "@/lib/redirects";
import { produitJsonLd } from "@/lib/seo/jsonld";
import { metadonneesPage } from "@/lib/seo/meta";

// Une seule requête par affichage, partagée entre les métadonnées et la page.
const chargerJeu = cache(trouverJeu);

export async function generateMetadata({ params }: PageProps<"/jeux/[slug]">): Promise<Metadata> {
  const jeu = await chargerJeu((await params).slug);
  if (!jeu) return {};
  return metadonneesPage({
    titre: jeu.title,
    description: jeu.pitch,
    chemin: `/jeux/${jeu.slug}`,
    image: jeu.coverPath,
  });
}

function hubDuJeu(collections: string[]): EtapeFilAriane | undefined {
  const hub = PAGES_COLLECTIONS.find(
    (page) =>
      page.genre === "hub" &&
      page.filtre.collections?.length === 1 &&
      collections.includes(page.filtre.collections[0]),
  );
  return hub ? { libelle: hub.titre, href: `/${hub.slug}` } : undefined;
}

export default async function FicheJeu({ params }: PageProps<"/jeux/[slug]">) {
  const { slug } = await params;
  const jeu = await chargerJeu(slug);
  if (!jeu) {
    // Un ancien slug renommé (scripts/rename-game.ts, D12) redirige plutôt
    // que de renvoyer une 404 sur un lien peut-être déjà indexé.
    const cible = await trouverRedirection(`/jeux/${slug}`);
    if (cible) permanentRedirect(cible);
    notFound();
  }

  const apercus = apercusDuJeu(jeu);
  const similaires = await jeuxSimilaires(jeu);
  const hub = hubDuJeu(jeu.collections);

  return (
    <>
      <JsonLd data={produitJsonLd(jeu)} />
      <FilAriane
        etapes={[
          { libelle: "Tous les jeux", href: "/jeux" },
          ...(hub ? [hub] : []),
          { libelle: jeu.title },
        ]}
        cheminCourant={`/jeux/${jeu.slug}`}
      />

      <div className="conteneur">
        <header className="fiche-entete">
          <BadgesJeu jeu={jeu} />
          <h1>{jeu.title}</h1>
          <p className="fiche-pitch">{jeu.pitch}</p>
          <div className="fiche-couverture">
            <ImageJeu
              chemin={jeu.coverPath}
              largeurs={LARGEURS_COUVERTURE}
              alt={`Illustration du jeu ${jeu.title}`}
              sizes="(min-width: 800px) 760px, 100vw"
              prioritaire
            />
          </div>
        </header>

        <div className="fiche-grille">
          <div>
            <section aria-labelledby="titre-caracteristiques">
              <h2 id="titre-caracteristiques" className="sr-only">
                Caractéristiques
              </h2>
              <dl className="caracteristiques">
                <div className="caracteristique">
                  <dt>Joueurs</dt>
                  <dd>{formaterJoueurs(jeu.joueursMin, jeu.joueursMax)}</dd>
                </div>
                <div className="caracteristique">
                  <dt>Durée</dt>
                  <dd>{formaterDuree(jeu.dureeMinutes)}</dd>
                </div>
                <div className="caracteristique">
                  <dt>Âge</dt>
                  <dd>Dès {jeu.ageMin} ans</dd>
                </div>
                <div className="caracteristique">
                  <dt>Difficulté</dt>
                  <dd>{LIBELLES_DIFFICULTES[jeu.difficulte] ?? jeu.difficulte}</dd>
                </div>
              </dl>
              <p className="note">Public : {LIBELLES_PUBLICS[jeu.public] ?? jeu.public}</p>
            </section>

            <section className="fiche-section" aria-labelledby="titre-histoire">
              <h2 id="titre-histoire">L&apos;histoire</h2>
              <TexteRiche>{jeu.histoire}</TexteRiche>
            </section>

            {apercus.length > 0 && (
              <section className="fiche-section" aria-labelledby="titre-apercus">
                <h2 id="titre-apercus">Aperçu du kit</h2>
                <p className="note">
                  Pages volontairement floutées : le contenu complet se découvre en jouant.
                </p>
                <ul className="galerie">
                  {apercus.map((apercu, index) => (
                    <li key={apercu.webp}>
                      <figure className="galerie-item">
                        <ImageJeu
                          chemin={apercu.webp}
                          largeurs={LARGEURS_APERCU}
                          alt={`Aperçu flouté de la page ${index + 1} du kit`}
                          sizes="(min-width: 1024px) 260px, (min-width: 640px) 50vw, 100vw"
                        />
                        <figcaption>Aperçu {index + 1}</figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="fiche-section" aria-labelledby="titre-kit">
              <h2 id="titre-kit">Contenu du kit</h2>
              <TexteRiche>{jeu.contenuKit}</TexteRiche>
            </section>

            <section className="fiche-section" aria-labelledby="titre-preparation">
              <h2 id="titre-preparation">Préparation et matériel</h2>
              <TexteRiche>{jeu.preparation}</TexteRiche>
            </section>

            <section className="fiche-section" aria-labelledby="titre-deroule">
              <h2 id="titre-deroule">Déroulé en bref</h2>
              <TexteRiche>{jeu.deroule}</TexteRiche>
            </section>

            <section className="fiche-section" aria-labelledby="titre-faq">
              <h2 id="titre-faq">Questions fréquentes</h2>
              <TexteRiche>{jeu.faq}</TexteRiche>
            </section>
          </div>

          <BlocPrixAction prixEur={jeu.prixEur} slug={jeu.slug} gameId={jeu.id} titre={jeu.title} />
        </div>
      </div>

      {similaires.length > 0 && (
        <section className="section section-alt" aria-labelledby="titre-similaires">
          <div className="conteneur">
            <h2 id="titre-similaires" className="section-titre">
              Dans le même esprit
            </h2>
            <GrilleJeux jeux={similaires} vide={null} />
          </div>
        </section>
      )}
    </>
  );
}
