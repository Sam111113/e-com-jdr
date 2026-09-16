// Saison mise en avant sur le site (accueil, couleurs d'accent, menu).
// Les fenêtres sont réglables ici ; `SAISON_ACTIVE` permet de forcer une saison
// (ou « aucune ») sur le staging pour tester l'affichage.

export type SaisonId = "halloween" | "noel" | "saint-valentin" | "paques";

export const SAISONS: Record<SaisonId, { nom: string; hub: string; jeux: string }> = {
  halloween: { nom: "Halloween", hub: "/halloween", jeux: "les jeux d'Halloween" },
  noel: { nom: "Noël", hub: "/noel", jeux: "les jeux de Noël" },
  "saint-valentin": {
    nom: "Saint-Valentin",
    hub: "/saint-valentin",
    jeux: "les jeux de la Saint-Valentin",
  },
  paques: { nom: "Pâques", hub: "/paques", jeux: "les jeux de Pâques" },
};

const IDS = Object.keys(SAISONS) as SaisonId[];

// Dates au format MMJJ (1er septembre = 901). Pâques se termine le lundi de
// Pâques, calculé chaque année.
export const FENETRES = {
  halloween: { debut: 901, fin: 1031 },
  noel: { debut: 1101, fin: 1225 },
  "saint-valentin": { debut: 102, fin: 214 },
  paques: { debut: 215 },
} as const;

/** Date de Pâques (calendrier grégorien, algorithme de Meeus/Jones/Butcher). */
export function datePaques(annee: number): { mois: number; jour: number } {
  const a = annee % 19;
  const b = Math.floor(annee / 100);
  const c = annee % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mois = Math.floor((h + l - 7 * m + 114) / 31);
  const jour = ((h + l - 7 * m + 114) % 31) + 1;
  return { mois, jour };
}

function partiesDateParis(date: Date): { annee: number; mois: number; jour: number } {
  const parties = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const valeur = (type: string) => Number(parties.find((p) => p.type === type)?.value);
  return { annee: valeur("year"), mois: valeur("month"), jour: valeur("day") };
}

function finPaques(annee: number): number {
  const { mois, jour } = datePaques(annee);
  const lundi = new Date(Date.UTC(annee, mois - 1, jour + 1));
  return (lundi.getUTCMonth() + 1) * 100 + lundi.getUTCDate();
}

export function saisonActive(
  date: Date = new Date(),
  forcee: string | undefined = process.env.SAISON_ACTIVE,
): SaisonId | null {
  if (forcee === "aucune") return null;
  if (forcee && (IDS as string[]).includes(forcee)) return forcee as SaisonId;

  const { annee, mois, jour } = partiesDateParis(date);
  const mmjj = mois * 100 + jour;

  if (mmjj >= FENETRES.halloween.debut && mmjj <= FENETRES.halloween.fin) return "halloween";
  if (mmjj >= FENETRES.noel.debut && mmjj <= FENETRES.noel.fin) return "noel";
  if (mmjj >= FENETRES["saint-valentin"].debut && mmjj <= FENETRES["saint-valentin"].fin) {
    return "saint-valentin";
  }
  if (mmjj >= FENETRES.paques.debut && mmjj <= finPaques(annee)) return "paques";
  return null;
}
