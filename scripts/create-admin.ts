// Commande `npm run create-admin` (T1.10) : crée ou met à jour le compte
// admin unique (compte nominatif, décision de l'équipe le 17/09/2026— voir
// docs/DECISIONS.md). Ne choisit jamais le mot de passe : lu depuis
// l'environnement au moment de l'exécution, jamais écrit dans le dépôt ni
// affiché en sortie. Rejouable (met à jour le mot de passe si l'email existe
// déjà), pour changer le mot de passe plus tard sans script séparé.
import { eq } from "drizzle-orm";
import { adminUsers } from "@/db/schema";
import type { Database } from "@/db/client";
import { hasherMotDePasse } from "@/lib/admin/mots-de-passe";

export async function creerOuMettreAJourAdmin(
  db: Database,
  email: string,
  motDePasseHash: string,
): Promise<{ id: number; misAJour: boolean }> {
  const [existant] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  if (existant) {
    await db
      .update(adminUsers)
      .set({ passwordHash: motDePasseHash })
      .where(eq(adminUsers.id, existant.id));
    return { id: existant.id, misAJour: true };
  }

  const [cree] = await db
    .insert(adminUsers)
    .values({ email, passwordHash: motDePasseHash })
    .returning({ id: adminUsers.id });
  return { id: cree.id, misAJour: false };
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const motDePasse = process.env.ADMIN_PASSWORD;
  if (!email || !motDePasse) {
    console.error(
      "ADMIN_EMAIL et ADMIN_PASSWORD doivent être définies dans l'environnement " +
        "(voir README, section « Admin »). Rien n'a été créé.",
    );
    process.exitCode = 1;
    return;
  }
  if (motDePasse.length < 12) {
    console.error("ADMIN_PASSWORD doit faire au moins 12 caractères. Rien n'a été créé.");
    process.exitCode = 1;
    return;
  }

  const { db, queryClient } = await import("@/db/client");
  try {
    const motDePasseHash = await hasherMotDePasse(motDePasse);
    const resultat = await creerOuMettreAJourAdmin(db, email, motDePasseHash);
    console.log(
      resultat.misAJour
        ? `Mot de passe mis à jour pour ${email} (id ${resultat.id}).`
        : `Compte admin créé pour ${email} (id ${resultat.id}).`,
    );
  } finally {
    await queryClient.end();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((erreur) => {
    console.error("Échec de la création du compte admin :", erreur);
    process.exitCode = 1;
  });
}
