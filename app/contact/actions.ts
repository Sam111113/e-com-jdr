"use server";

import { headers } from "next/headers";
import { envoyerParBrevo } from "@/lib/contact/brevo";
import { creerLimiteur, traiterContact, type EtatContact } from "@/lib/contact/formulaire";

const autoriser = creerLimiteur();

export async function envoyerContact(_etat: EtatContact, donnees: FormData): Promise<EtatContact> {
  const entetes = await headers();
  // Derrière le proxy (Tailscale Serve en staging, Caddy en production).
  const ip =
    entetes.get("x-forwarded-for")?.split(",")[0]?.trim() || entetes.get("x-real-ip") || "inconnue";
  return traiterContact(donnees, { ip, autoriser, envoyer: envoyerParBrevo });
}
