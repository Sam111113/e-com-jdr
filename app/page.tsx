import Link from "next/link";
import { GrilleJeux } from "@/components/jeux/GrilleJeux";
import { EncartEmail } from "@/components/site/EncartEmail";
import { EtapesCommentCaMarche } from "@/components/site/EtapesCommentCaMarche";
import { listerJeux } from "@/lib/games/queries";
import { SAISONS, saisonActive } from "@/lib/saisons";

export default async function Accueil() {
  const saison = saisonActive();

  // Jeux phares : ceux de la saison en cours d'abord, sinon les plus récents.
  let jeux = saison ? await listerJeux({ collections: [saison], limite: 3 }) : [];
  if (jeux.length === 0) jeux = await listerJeux({ limite: 3 });

  return (
    <>
      <section className="hero" aria-labelledby="titre-accueil">
        {saison && (
          <Link href={SAISONS[saison].hub} className="hero-badge">
            Saison {SAISONS[saison].nom}
          </Link>
        )}
        <h1 id="titre-accueil">Des soirées à énigmes à imprimer, tout simplement</h1>
        <p className="hero-sous-titre">
          Escape games, chasses au trésor et murder parties à vivre à la maison, en famille ou
          entre amis. Imprimez, installez le décor, et que l&apos;aventure commence.
        </p>
        <div className="hero-actions">
          <Link href={saison ? SAISONS[saison].hub : "/jeux"} className="btn btn-primaire">
            {saison ? `Découvrir ${SAISONS[saison].jeux}` : "Découvrir les jeux"}
          </Link>
          <Link href="/comment-ca-marche" className="btn btn-secondaire">
            Comment ça marche ?
          </Link>
        </div>
      </section>

      <section className="section section-alt" aria-labelledby="titre-jeux-phares">
        <div className="conteneur">
          <h2 id="titre-jeux-phares" className="section-titre">
            Jeux phares
          </h2>
          <GrilleJeux
            premiereSection
            jeux={jeux}
            vide={
              <p>
                Les premiers jeux arrivent très bientôt. Revenez nous voir, ou découvrez en
                attendant <Link href="/comment-ca-marche">comment se déroule une partie</Link>.
              </p>
            }
          />
          {jeux.length > 0 && (
            <p className="note">
              <Link href="/jeux">Voir tout le catalogue</Link>
            </p>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="titre-comment">
        <div className="conteneur">
          <h2 id="titre-comment" className="section-titre">
            Comment ça marche
          </h2>
          <EtapesCommentCaMarche />
        </div>
      </section>

      <section className="section section-alt">
        <div className="conteneur">
          <EncartEmail
            titre="Soyez prévenu de chaque sortie"
            texte="Un nouveau jeu, une nouvelle saison : recevez un message dès qu'une aventure est prête à être jouée."
          />
        </div>
      </section>
    </>
  );
}
