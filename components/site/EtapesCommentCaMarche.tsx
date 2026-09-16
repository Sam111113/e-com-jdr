// Les trois étapes d'un achat, partagées par l'accueil et /comment-ca-marche.
// Formulées au futur proche tant que les ventes ne sont pas ouvertes (T1.7).
const ETAPES = [
  {
    titre: "Choisissez votre aventure",
    texte:
      "Escape game, chasse au trésor ou murder party : trouvez le jeu qui convient à vos invités, à leur âge et à l'ambiance souhaitée.",
  },
  {
    titre: "Recevez votre kit",
    texte:
      "Le jeu se présente sous forme de fichier PDF, à télécharger dès la commande validée, sans attendre de livraison.",
  },
  {
    titre: "Imprimez et jouez",
    texte:
      "Imprimez le kit chez vous, suivez le guide de préparation, puis laissez vos invités plonger dans le mystère.",
  },
];

export function EtapesCommentCaMarche({ niveauTitre = "h3" }: { niveauTitre?: "h2" | "h3" }) {
  const Titre = niveauTitre;
  return (
    <ol className="etapes">
      {ETAPES.map((etape, index) => (
        <li key={etape.titre} className="etape">
          <span className="etape-numero" aria-hidden="true">
            {index + 1}
          </span>
          <Titre>{etape.titre}</Titre>
          <p>{etape.texte}</p>
        </li>
      ))}
    </ol>
  );
}
