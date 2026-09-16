// Lecture du catalogue pour les pages du site.
//
// `connection()` rend chaque page dynamique : le build Docker n'a pas accès à
// la base. Le client est importé à la demande pour la même raison, car
// db/client.ts exige une URL de base de données dès son chargement.
import { connection } from "next/server";
import { and, arrayOverlaps, desc, eq, gte, inArray, lte, ne, or, type SQL } from "drizzle-orm";
import { games } from "@/db/schema";

export type Jeu = typeof games.$inferSelect;
export type Apercu = { webp: string; avif: string };

const PUBLICS = ["enfants", "ados", "adultes", "famille"] as const;
type Public = (typeof PUBLICS)[number];

export interface FiltresJeux {
  types?: string[];
  collections?: string[];
  publics?: string[];
  /** Âge du plus jeune joueur : garde les jeux dont l'âge minimum ne le dépasse pas. */
  age?: number;
  /** Nombre de joueurs : garde les jeux qui l'acceptent. */
  joueurs?: number;
  dureeMax?: number;
  exclureSlug?: string;
  limite?: number;
}

/** Sur le staging uniquement : montre les jeux en brouillon (jeu factice compris). */
export function afficherBrouillons(): boolean {
  return process.env.AFFICHER_BROUILLONS === "true";
}

async function ouvrirBase() {
  await connection();
  const { db } = await import("@/db/client");
  return db;
}

function conditionsFiltres(filtres: FiltresJeux): SQL[] {
  const conditions: SQL[] = [];
  if (!afficherBrouillons()) conditions.push(eq(games.status, "publie"));
  if (filtres.types?.length) conditions.push(inArray(games.type, filtres.types));
  if (filtres.collections?.length) {
    conditions.push(arrayOverlaps(games.collections, filtres.collections));
  }
  const publics = filtres.publics?.filter((p): p is Public =>
    (PUBLICS as readonly string[]).includes(p),
  );
  if (publics?.length) conditions.push(inArray(games.public, publics));
  if (filtres.age !== undefined) conditions.push(lte(games.ageMin, filtres.age));
  if (filtres.joueurs !== undefined) {
    conditions.push(lte(games.joueursMin, filtres.joueurs), gte(games.joueursMax, filtres.joueurs));
  }
  if (filtres.dureeMax !== undefined) conditions.push(lte(games.dureeMinutes, filtres.dureeMax));
  if (filtres.exclureSlug) conditions.push(ne(games.slug, filtres.exclureSlug));
  return conditions;
}

export async function listerJeux(filtres: FiltresJeux = {}): Promise<Jeu[]> {
  const db = await ouvrirBase();
  const conditions = conditionsFiltres(filtres);
  const requete = db
    .select()
    .from(games)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(games.createdAt))
    .$dynamic();
  return filtres.limite ? requete.limit(filtres.limite) : requete;
}

export async function trouverJeu(slug: string): Promise<Jeu | null> {
  const db = await ouvrirBase();
  const conditions: SQL[] = [eq(games.slug, slug)];
  if (!afficherBrouillons()) conditions.push(eq(games.status, "publie"));
  const [jeu] = await db.select().from(games).where(and(...conditions)).limit(1);
  return jeu ?? null;
}

export async function jeuxSimilaires(jeu: Jeu, limite = 3): Promise<Jeu[]> {
  const db = await ouvrirBase();
  const proximite = jeu.collections.length
    ? or(eq(games.type, jeu.type), arrayOverlaps(games.collections, jeu.collections))
    : eq(games.type, jeu.type);
  const conditions = [...conditionsFiltres({ exclureSlug: jeu.slug })];
  if (proximite) conditions.push(proximite);
  return db
    .select()
    .from(games)
    .where(and(...conditions))
    .orderBy(desc(games.createdAt))
    .limit(limite);
}

export function apercusDuJeu(jeu: Jeu): Apercu[] {
  return Array.isArray(jeu.apercuPaths) ? (jeu.apercuPaths as Apercu[]) : [];
}

/**
 * Pour le sitemap (T1.12) : toujours les seuls jeux publiés, même sur le
 * staging avec `AFFICHER_BROUILLONS=true` (le sitemap ne doit jamais
 * proposer un jeu factice ou en brouillon à l'indexation).
 */
export async function listerJeuxPublies(): Promise<Pick<Jeu, "slug" | "updatedAt">[]> {
  const db = await ouvrirBase();
  return db
    .select({ slug: games.slug, updatedAt: games.updatedAt })
    .from(games)
    .where(eq(games.status, "publie"));
}
