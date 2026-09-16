// Pages collections validées par l'équipe (D17, docs/seo/mots-cles.md §1bis) :
// des hubs par saison ou public qui regroupent tous les types de jeu, et des
// pages par type là où la demande est documentée.
import type { SaisonId } from "./saisons";

export interface FiltreCollection {
  types?: string[];
  collections?: string[];
  publics?: string[];
}

export interface PageCollection {
  slug: string;
  genre: "hub" | "type";
  titre: string;
  titreSeo: string;
  description: string;
  intro: string;
  filtre: FiltreCollection;
  saison?: SaisonId;
  parent?: string;
}

export const PAGES_COLLECTIONS: PageCollection[] = [
  {
    slug: "halloween",
    genre: "hub",
    saison: "halloween",
    titre: "Jeux d'Halloween à imprimer",
    titreSeo: "Jeux d'Halloween à imprimer : escape games et chasses au trésor",
    description:
      "Escape games et chasses au trésor d'Halloween à imprimer, pour une soirée mystérieuse à la maison, en famille ou entre amis.",
    intro:
      "Citrouilles, lumière tamisée et mystères à percer : choisissez l'aventure qui fera frissonner vos invités, juste ce qu'il faut.",
    filtre: { collections: ["halloween"] },
  },
  {
    slug: "escape-game-halloween",
    genre: "type",
    saison: "halloween",
    parent: "halloween",
    titre: "Escape games d'Halloween",
    titreSeo: "Escape game d'Halloween à imprimer pour enfants et adultes",
    description:
      "Des escape games d'Halloween à imprimer : énigmes, indices et compte à rebours pour une soirée d'enquête à la maison.",
    intro:
      "Une équipe, des énigmes et un mystère à résoudre avant la fin du temps imparti : l'escape game transforme votre salon en manoir hanté.",
    filtre: { collections: ["halloween"], types: ["escape-game"] },
  },
  {
    slug: "chasse-au-tresor-halloween",
    genre: "type",
    saison: "halloween",
    parent: "halloween",
    titre: "Chasses au trésor d'Halloween",
    titreSeo: "Chasse au trésor d'Halloween à imprimer pour enfants",
    description:
      "Des chasses au trésor d'Halloween à imprimer : une piste d'indices à suivre dans la maison ou le jardin, jusqu'au trésor final.",
    intro:
      "D'indice en indice, vos aventuriers parcourent la maison à la recherche du trésor : idéal pour les enfants qui ont besoin de bouger.",
    filtre: { collections: ["halloween"], types: ["chasse-au-tresor"] },
  },
  {
    slug: "noel",
    genre: "hub",
    saison: "noel",
    titre: "Jeux de Noël à imprimer",
    titreSeo: "Jeux de Noël à imprimer pour toute la famille",
    description:
      "Des jeux de Noël à imprimer pour réunir petits et grands autour d'une aventure pendant les fêtes.",
    intro:
      "Entre le sapin et le réveillon, offrez à votre famille une aventure à vivre ensemble, le temps d'une soirée.",
    filtre: { collections: ["noel"] },
  },
  {
    slug: "saint-valentin",
    genre: "hub",
    saison: "saint-valentin",
    titre: "Jeux de Saint-Valentin à imprimer",
    titreSeo: "Jeux de Saint-Valentin à imprimer pour une soirée à deux",
    description:
      "Des jeux de Saint-Valentin à imprimer pour une soirée complice et pleine de surprises.",
    intro:
      "Une énigme à deux, un mystère à percer ensemble : une autre façon de célébrer la Saint-Valentin.",
    filtre: { collections: ["saint-valentin"] },
  },
  {
    slug: "paques",
    genre: "hub",
    saison: "paques",
    titre: "Jeux de Pâques à imprimer",
    titreSeo: "Jeux de Pâques à imprimer pour les enfants",
    description:
      "Des jeux de Pâques à imprimer pour prolonger la chasse aux œufs par une véritable aventure.",
    intro:
      "Et si la chasse aux œufs devenait une vraie aventure, avec des indices à déchiffrer à chaque étape ?",
    filtre: { collections: ["paques"] },
  },
  {
    slug: "anniversaire-enfant",
    genre: "hub",
    titre: "Jeux d'anniversaire pour enfants",
    titreSeo: "Jeux d'anniversaire à imprimer pour enfants",
    description:
      "Escape games, chasses au trésor et jeux d'enquête à imprimer pour un anniversaire d'enfant mémorable.",
    intro:
      "Un anniversaire dont on se souvient longtemps : des jeux pensés pour faire vivre une aventure à toute la bande d'invités.",
    filtre: { collections: ["anniversaire"], publics: ["enfants", "famille"] },
  },
  {
    slug: "anniversaire-ado",
    genre: "hub",
    titre: "Jeux d'anniversaire pour ados",
    titreSeo: "Jeux d'anniversaire à imprimer pour ados",
    description:
      "Des jeux à imprimer pour un anniversaire d'ado : du défi, des énigmes et une vraie ambiance d'enquête.",
    intro:
      "Du défi, du suspense et une énigme à la hauteur : de quoi embarquer même les ados les plus blasés.",
    filtre: { collections: ["anniversaire"], publics: ["ados"] },
  },
  {
    slug: "soiree-adulte",
    genre: "hub",
    titre: "Jeux pour soirées entre adultes",
    titreSeo: "Jeux à imprimer pour une soirée entre adultes",
    description:
      "Murder parties et jeux d'énigmes à imprimer pour une soirée entre amis adultes, pleine de suspense.",
    intro:
      "Un dîner entre amis, des secrets bien gardés et une enquête à mener : le grand frisson, version adulte.",
    filtre: { publics: ["adultes"] },
  },
  {
    slug: "murder-party-a-imprimer",
    genre: "type",
    parent: "soiree-adulte",
    titre: "Murder parties à imprimer",
    titreSeo: "Murder party à imprimer : scénarios pour une soirée enquête",
    description:
      "Des murder parties à imprimer : chaque invité incarne un suspect, et la soirée devient une enquête grandeur nature.",
    intro:
      "Chaque invité reçoit un personnage, ses secrets et ses alibis. L'un d'eux est coupable : à vous de le démasquer.",
    filtre: { types: ["murder-party"] },
  },
  {
    slug: "evjf-evg",
    genre: "hub",
    titre: "Jeux pour EVJF et EVG",
    titreSeo: "Jeux à imprimer pour un EVJF ou un EVG",
    description:
      "Des jeux à imprimer pour animer un enterrement de vie de jeune fille ou de garçon avec une aventure à partager.",
    intro:
      "Une aventure à partager avant le grand jour : de quoi souder la troupe et créer des souvenirs complices.",
    filtre: { collections: ["evjf-evg"] },
  },
];

export function trouverPageCollection(slug: string): PageCollection | undefined {
  return PAGES_COLLECTIONS.find((page) => page.slug === slug);
}

export function pagesTypeDuHub(slugHub: string): PageCollection[] {
  return PAGES_COLLECTIONS.filter((page) => page.parent === slugHub);
}
