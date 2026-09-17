// Jetons opaques à usage général (T1.8, T1.9) : le jeton en clair n'est
// jamais stocké, seul son hash SHA-256 l'est — que ce soit pour un
// téléchargement (`download_tokens`) ou une confirmation d'inscription /
// désinscription (`subscriptions`).
import crypto from "node:crypto";

const OCTETS_TOKEN = 32; // >= 32 octets.

export function genererToken(): string {
  return crypto.randomBytes(OCTETS_TOKEN).toString("hex");
}

export function hasherToken(tokenClair: string): string {
  return crypto.createHash("sha256").update(tokenClair).digest("hex");
}
