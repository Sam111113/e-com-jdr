"use server";

// Connexion admin (T1.10). Message d'erreur générique (email ou mot de
// passe) : ne jamais révéler si l'email existe. Limiteur dédié, plus
// strict qu'un formulaire public : ces tentatives visent un mot de passe.
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminUsers } from "@/db/schema";
import { verifierMotDePasse } from "@/lib/admin/mots-de-passe";
import { COOKIE_SESSION_ADMIN, creerJetonSession } from "@/lib/admin/session";
import { creerLimiteurParIp } from "@/lib/securite/limiteur";

export interface EtatConnexion {
  statut: "initial" | "erreur";
  message?: string;
}

const MESSAGE_GENERIQUE = "Email ou mot de passe incorrect.";
const autoriser = creerLimiteurParIp(10, 15 * 60 * 1000);

const schema = z.object({
  email: z.string().trim().max(254).pipe(z.email()),
  motDePasse: z.string().min(1),
});

async function adresseIp(): Promise<string> {
  const entetes = await headers();
  return (
    entetes.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    entetes.get("x-real-ip") ||
    "inconnue"
  );
}

export async function connexion(
  _etat: EtatConnexion,
  donnees: FormData,
): Promise<EtatConnexion> {
  if (!autoriser(await adresseIp())) {
    return { statut: "erreur", message: "Trop de tentatives. Réessayez dans quelques minutes." };
  }

  const analyse = schema.safeParse({
    email: donnees.get("email"),
    motDePasse: donnees.get("motDePasse"),
  });
  if (!analyse.success) {
    return { statut: "erreur", message: MESSAGE_GENERIQUE };
  }

  const { db } = await import("@/db/client");
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, analyse.data.email))
    .limit(1);

  if (!admin || !(await verifierMotDePasse(analyse.data.motDePasse, admin.passwordHash))) {
    return { statut: "erreur", message: MESSAGE_GENERIQUE };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_SESSION_ADMIN, creerJetonSession(admin.id), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: 7 * 24 * 60 * 60,
  });

  redirect("/admin");
}

export async function deconnexion(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_SESSION_ADMIN);
  redirect("/admin/connexion");
}
