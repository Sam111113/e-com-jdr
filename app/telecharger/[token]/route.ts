// Téléchargement du kit PDF (T1.8, étape 6) : valide le jeton, appose le
// filigrane avec l'email de l'acheteur, puis sert le fichier. Jamais servi
// en statique : le kit vit dans le stockage privé (lib/storage), inaccessible
// autrement que par ce jeton à usage limité.
import { storage } from "@/lib/storage";
import { validerEtConsommerToken, type EchecTelechargement } from "@/lib/telechargements/tokens";
import { apposerFiligrane } from "@/lib/telechargements/filigrane";

const MESSAGES: Record<EchecTelechargement, string> = {
  invalide: "Ce lien de téléchargement n'existe pas.",
  expire: "Ce lien de téléchargement a expiré (7 jours). Demandez-en un nouveau.",
  revoque: "Ce lien de téléchargement a été désactivé.",
  "quota-atteint": "Ce lien a atteint son nombre maximal de téléchargements (5).",
};

export async function GET(
  _requete: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;
  // Import à la demande (voir lib/games/queries.ts, même raison : db/client.ts
  // exige une URL de base de données dès son chargement, absente au build Docker).
  const { db } = await import("@/db/client");
  const resultat = await validerEtConsommerToken(db, token);

  if (!resultat.ok || !resultat.jeu) {
    const message = MESSAGES[resultat.echec ?? "invalide"];
    return new Response(
      `<!doctype html><html lang="fr"><body><p>${message} ` +
        `<a href="/retrouver-mes-telechargements">Retrouver mes téléchargements</a>.</p></body></html>`,
      { status: 410, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  if (!resultat.jeu.kitPdfKey) {
    return new Response("Ce jeu n'a pas encore de kit disponible.", { status: 404 });
  }

  const kit = await storage.get(resultat.jeu.kitPdfKey);
  const kitAvecFiligrane = await apposerFiligrane(kit, resultat.emailAcheteur ?? "");

  return new Response(new Uint8Array(kitAvecFiligrane), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${resultat.jeu.slug}.pdf"`,
      "cache-control": "no-store",
    },
  });
}
