// Hachage des mots de passe admin (T1.10). `scrypt` (Node natif, aucune
// dépendance ajoutée) plutôt que bcrypt/argon2 : suffisant pour un compte
// admin unique, et le projet évite les dépendances superflues (brief).
import crypto from "node:crypto";

const OCTETS_SEL = 16;
const LONGUEUR_CLE = 64;

function derivate(motDePasse: string, sel: string, longueur: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(motDePasse, sel, longueur, (erreur, derivee) => {
      if (erreur) reject(erreur);
      else resolve(derivee);
    });
  });
}

/** Format stocké : "sel:clé", tous deux en hexadécimal. */
export async function hasherMotDePasse(motDePasse: string): Promise<string> {
  const sel = crypto.randomBytes(OCTETS_SEL).toString("hex");
  const cle = await derivate(motDePasse, sel, LONGUEUR_CLE);
  return `${sel}:${cle.toString("hex")}`;
}

export async function verifierMotDePasse(motDePasse: string, hash: string): Promise<boolean> {
  const [sel, cleHex] = hash.split(":");
  if (!sel || !cleHex) return false;
  const cleAttendue = Buffer.from(cleHex, "hex");
  const cle = await derivate(motDePasse, sel, cleAttendue.length);
  return cle.length === cleAttendue.length && crypto.timingSafeEqual(cle, cleAttendue);
}
