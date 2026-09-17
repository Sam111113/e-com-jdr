// Génération du PDF d'une facture ou d'un avoir (T1.8).
//
// Reste volontairement simple (texte brut, une page) : la mise en forme
// n'est pas l'enjeu, la conformité des mentions l'est. Les mentions
// viennent exclusivement de `legalSnapshot` (copie figée de
// config/entreprise.ts au moment de l'émission, jamais de la config
// courante — une facture déjà émise ne doit jamais changer).
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Entreprise } from "@/config/entreprise";
import { formaterPrix } from "@/lib/games/format";

export interface LigneFacture {
  titre: string;
  /** Prix unitaire en centimes d'euro (même convention que `games.prixEur`). */
  prixUnitaireCentimes: number;
  quantite: number;
}

export interface DonneesFacture {
  displayNumber: string;
  serie: "facture" | "avoir";
  /** Numéro d'affichage de la facture annulée, uniquement pour un avoir. */
  numeroFactureAnnulee?: string;
  emisLe: Date;
  clientEmail: string;
  lignes: LigneFacture[];
  /** Total en centimes d'euro, toujours positif : l'affichage en négatif
   * pour un avoir est géré par cette fonction, pas par l'appelant. */
  totalCentimes: number;
  legalSnapshot: Entreprise;
}

const formatDate = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export async function genererPdfFacture(donnees: DonneesFacture): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4 portrait, points PDF.
  const police = await doc.embedFont(StandardFonts.Helvetica);
  const policeGrasse = await doc.embedFont(StandardFonts.HelveticaBold);

  const { height } = page.getSize();
  const marge = 50;
  let y = height - marge;

  const ecrire = (
    texte: string,
    options: { taille?: number; gras?: boolean; couleur?: [number, number, number] } = {},
  ) => {
    page.drawText(texte, {
      x: marge,
      y,
      size: options.taille ?? 11,
      font: options.gras ? policeGrasse : police,
      color: rgb(...(options.couleur ?? [0, 0, 0])),
    });
    y -= (options.taille ?? 11) + 8;
  };

  const titreDocument = donnees.serie === "avoir" ? "AVOIR" : "FACTURE";
  ecrire(titreDocument, { taille: 20, gras: true });
  ecrire(`N° ${donnees.displayNumber}`, { gras: true });
  if (donnees.serie === "avoir" && donnees.numeroFactureAnnulee) {
    ecrire(`Annule et remplace la facture n° ${donnees.numeroFactureAnnulee}`);
  }
  ecrire(`Émise le ${formatDate.format(donnees.emisLe)}`);
  y -= 10;

  ecrire("Vendeur", { gras: true });
  const e = donnees.legalSnapshot;
  ecrire(e.raisonSociale);
  ecrire(e.formeJuridique);
  ecrire(e.adresse);
  ecrire(`SIRET : ${e.siret}`);
  ecrire(`Contact : ${e.emailContact}`);
  y -= 10;

  ecrire("Client", { gras: true });
  ecrire(donnees.clientEmail);
  y -= 20;

  ecrire("Désignation", { gras: true });
  y -= 4;
  const signe = donnees.serie === "avoir" ? -1 : 1;
  for (const ligne of donnees.lignes) {
    ecrire(
      `${ligne.titre} — ${ligne.quantite} x ${formaterPrix(signe * ligne.prixUnitaireCentimes)}`,
    );
  }
  y -= 10;

  ecrire(`Total TTC : ${formaterPrix(signe * Math.abs(donnees.totalCentimes))}`, {
    taille: 14,
    gras: true,
  });
  if (!e.regimeTva.assujetti) {
    ecrire(e.regimeTva.mentionFranchise, { taille: 9 });
  }
  y -= 10;

  ecrire(
    "Contenu numérique livré immédiatement, avec renonciation expresse du client à son droit de rétractation.",
    { taille: 9 },
  );
  if (donnees.legalSnapshot.mediateurConsommation.nom) {
    ecrire(`Médiateur de la consommation : ${donnees.legalSnapshot.mediateurConsommation.nom}`, {
      taille: 9,
    });
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
