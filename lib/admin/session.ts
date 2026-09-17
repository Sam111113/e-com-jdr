// Session admin (T1.10) : jeton signé, sans état côté serveur (pas de
// table de sessions à créer pour un compte admin unique, D5-like). La
// signature HMAC empêche de forger ou de modifier un jeton sans connaître
// `ADMIN_SESSION_SECRET`.
import crypto from "node:crypto";

const DUREE_SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export const COOKIE_SESSION_ADMIN = "session_admin";

function secret(): string {
  const valeur = process.env.ADMIN_SESSION_SECRET;
  if (!valeur) throw new Error("ADMIN_SESSION_SECRET doit être définie.");
  return valeur;
}

function signer(charge: string): string {
  return crypto.createHmac("sha256", secret()).update(charge).digest("hex");
}

export function creerJetonSession(adminId: number): string {
  const expiration = Date.now() + DUREE_SESSION_MS;
  const charge = `${adminId}.${expiration}`;
  return `${charge}.${signer(charge)}`;
}

/** Retourne l'identifiant admin si le jeton est valide et non expiré, sinon `null`. */
export function verifierJetonSession(jeton: string | undefined | null): number | null {
  if (!jeton) return null;
  const parties = jeton.split(".");
  if (parties.length !== 3) return null;
  const [adminIdTexte, expirationTexte, signature] = parties;
  const charge = `${adminIdTexte}.${expirationTexte}`;
  const attendue = signer(charge);

  const signatureBuf = Buffer.from(signature, "hex");
  const attendueBuf = Buffer.from(attendue, "hex");
  if (signatureBuf.length !== attendueBuf.length || !crypto.timingSafeEqual(signatureBuf, attendueBuf)) {
    return null;
  }

  const expiration = Number(expirationTexte);
  if (!Number.isFinite(expiration) || expiration < Date.now()) return null;

  const adminId = Number(adminIdTexte);
  return Number.isInteger(adminId) ? adminId : null;
}
