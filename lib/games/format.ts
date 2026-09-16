// Libellés et mises en forme affichés sur le site.

export const TYPES_CONFIRMES = ["escape-game", "chasse-au-tresor", "murder-party"] as const;

const LIBELLES_TYPES: Record<string, string> = {
  "escape-game": "Escape game",
  "chasse-au-tresor": "Chasse au trésor",
  "murder-party": "Murder party",
  enquete: "Jeu d'enquête",
};

export const LIBELLES_COLLECTIONS: Record<string, string> = {
  halloween: "Halloween",
  noel: "Noël",
  "saint-valentin": "Saint-Valentin",
  paques: "Pâques",
  anniversaire: "Anniversaire",
  "evjf-evg": "EVJF / EVG",
};

export const LIBELLES_PUBLICS: Record<string, string> = {
  enfants: "Enfants",
  ados: "Ados",
  adultes: "Adultes",
  famille: "Famille",
};

export const LIBELLES_DIFFICULTES: Record<string, string> = {
  facile: "Facile",
  moyen: "Moyenne",
  difficile: "Difficile",
};

function libelleParDefaut(valeur: string): string {
  const texte = valeur.replace(/-/g, " ");
  return texte.charAt(0).toUpperCase() + texte.slice(1);
}

export function libelleType(type: string): string {
  return LIBELLES_TYPES[type] ?? libelleParDefaut(type);
}

export function libelleCollection(collection: string): string {
  return LIBELLES_COLLECTIONS[collection] ?? libelleParDefaut(collection);
}

const formatPrix = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

/** Prix stocké en centimes, affiché TTC. */
export function formaterPrix(centimes: number): string {
  return formatPrix.format(centimes / 100);
}

export function formaterDuree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste === 0 ? `${heures} h` : `${heures} h ${String(reste).padStart(2, "0")}`;
}

export function formaterJoueurs(min: number, max: number): string {
  return min === max ? `${min} joueurs` : `${min} à ${max} joueurs`;
}
