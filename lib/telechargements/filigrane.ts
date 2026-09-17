// Filigrane apposé sur chaque page d'un kit PDF au moment du téléchargement
// (T1.8, brief section 4 : « email de l'acheteur en filigrane dans le PDF
// (pdf-lib) »). Dissuade le partage sans bloquer la lecture.
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export async function apposerFiligrane(kitPdf: Buffer, emailAcheteur: string): Promise<Buffer> {
  const doc = await PDFDocument.load(kitPdf);
  const police = await doc.embedFont(StandardFonts.Helvetica);
  const texte = `Kit acheté par ${emailAcheteur} — usage privé uniquement, revente et partage interdits`;

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const taille = 9;
    const largeurTexte = police.widthOfTextAtSize(texte, taille);
    page.drawText(texte, {
      x: (width - largeurTexte) / 2,
      y: height / 2,
      size: taille,
      font: police,
      color: rgb(0.6, 0.6, 0.6),
      opacity: 0.35,
      rotate: degrees(45),
    });
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
