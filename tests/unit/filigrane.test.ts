// Filigrane apposé sur le kit PDF au téléchargement (T1.8, brief section 4).
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { apposerFiligrane } from "../../lib/telechargements/filigrane";

async function creerPdfDeTest(nombrePages: number): Promise<Buffer> {
  const doc = await PDFDocument.create();
  for (let i = 0; i < nombrePages; i += 1) doc.addPage([200, 200]);
  return Buffer.from(await doc.save());
}

describe("apposerFiligrane", () => {
  it("garde le même nombre de pages et reste un PDF valide", async () => {
    const original = await creerPdfDeTest(3);
    const filigrane = await apposerFiligrane(original, "acheteur@example.com");

    const relu = await PDFDocument.load(filigrane);
    expect(relu.getPageCount()).toBe(3);
  });

  it("modifie réellement le contenu (le filigrane est bien dessiné)", async () => {
    const original = await creerPdfDeTest(1);
    const filigrane = await apposerFiligrane(original, "acheteur@example.com");
    expect(Buffer.compare(original, filigrane)).not.toBe(0);
  });
});
