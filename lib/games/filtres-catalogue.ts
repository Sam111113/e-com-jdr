// Lecture des filtres du catalogue `/jeux` depuis l'URL. Une valeur invalide
// est ignorée plutôt que de provoquer une erreur : l'URL est saisie ou
// modifiée librement par le visiteur.
import { SAISONS } from "@/lib/saisons";
import type { FiltresJeux } from "./queries";
import { LIBELLES_PUBLICS } from "./format";

export type ParametresUrl = Record<string, string | string[] | undefined>;

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const DUREES_MAX = [30, 60, 90, 120, 180] as const;

function premiereValeur(valeur: string | string[] | undefined): string | undefined {
  const texte = Array.isArray(valeur) ? valeur[0] : valeur;
  return texte?.trim() || undefined;
}

function entier(valeur: string | undefined, min: number, max: number): number | undefined {
  if (!valeur || !/^\d{1,3}$/.test(valeur)) return undefined;
  const nombre = Number(valeur);
  return nombre >= min && nombre <= max ? nombre : undefined;
}

export function lireFiltresCatalogue(parametres: ParametresUrl): FiltresJeux {
  const filtres: FiltresJeux = {};

  const type = premiereValeur(parametres.type);
  if (type && KEBAB_CASE.test(type)) filtres.types = [type];

  const saison = premiereValeur(parametres.saison);
  if (saison && Object.hasOwn(SAISONS, saison)) filtres.collections = [saison];

  const publicVise = premiereValeur(parametres.public);
  if (publicVise && Object.hasOwn(LIBELLES_PUBLICS, publicVise)) filtres.publics = [publicVise];

  const age = entier(premiereValeur(parametres.age), 1, 120);
  if (age !== undefined) filtres.age = age;

  const joueurs = entier(premiereValeur(parametres.joueurs), 1, 100);
  if (joueurs !== undefined) filtres.joueurs = joueurs;

  const duree = entier(premiereValeur(parametres.duree), 1, 600);
  if (duree !== undefined) filtres.dureeMax = duree;

  return filtres;
}
