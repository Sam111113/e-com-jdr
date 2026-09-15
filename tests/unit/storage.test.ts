// Tests unitaires de l'interface `Storage` et de son implémentation
// `LocalDiskStorage`. Voir docs/DECISIONS.md D3.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { LocalDiskStorage } from "../../lib/storage/local-disk";
import type { Storage } from "../../lib/storage/types";

let tempDir: string;
let storage: Storage;

beforeAll(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "ecomjdr-storage-test-"));
  storage = new LocalDiskStorage(tempDir);
});

afterAll(async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
});

describe("LocalDiskStorage", () => {
  it("put / get (aller-retour complet)", async () => {
    const key = "games/test/kit.pdf";
    const data = Buffer.from("contenu de test");

    await storage.put(key, data);
    const retrieved = await storage.get(key);

    expect(retrieved).toEqual(data);
  });

  it("exists : false avant, true après", async () => {
    const key = "games/test/exists-check.pdf";

    expect(await storage.exists(key)).toBe(false);

    await storage.put(key, Buffer.from("test"));
    expect(await storage.exists(key)).toBe(true);
  });

  it("delete supprime bien l'entrée", async () => {
    const key = "games/test/to-delete.pdf";
    await storage.put(key, Buffer.from("supprimer ceci"));

    expect(await storage.exists(key)).toBe(true);

    await storage.delete(key);
    expect(await storage.exists(key)).toBe(false);
  });

  it("rejette une tentative de traversée de répertoire (../..)", async () => {
    // Tenter de sortir de baseDir avec `..`.
    const key = "../../etc/passwd";

    await expect(storage.put(key, Buffer.from("hack"))).rejects.toThrow(
      /"\.\.\/\.\.\/etc\/passwd" contient "\.\."/,
    );
    await expect(storage.get(key)).rejects.toThrow(/contient "\.\."/);
    await expect(storage.exists(key)).rejects.toThrow(/contient "\.\."/);
    await expect(storage.delete(key)).rejects.toThrow(/contient "\.\."/);
  });

  it("rejette un chemin absolu", async () => {
    const key = "/etc/passwd";

    await expect(storage.put(key, Buffer.from("hack"))).rejects.toThrow(
      "est un chemin absolu",
    );
  });

  it("rejette une clé qui sort de baseDir après résolution", async () => {
    // Tenter d'utiliser un lien symbolique ou une ruse de path.resolve.
    // On utilise `..` après un segment valide : `games/../../etc/passwd`
    const key = "games/../../etc/passwd";

    await expect(storage.put(key, Buffer.from("hack"))).rejects.toThrow(
      /contient "\.\."/,
    );
  });

  it("getPrivateUrl retourne un placeholder (T1.8)", async () => {
    const url = await storage.getPrivateUrl("games/test/kit.pdf", 3600);
    expect(url).toMatch(/^local-storage:\/\/games%2Ftest%2Fkit\.pdf\?ttl=3600$/);
  });

  it("accepte une clé valide avec plusieurs segments", async () => {
    const key = "factures/2026/F-000001.pdf";
    await storage.put(key, Buffer.from("facture"));
    expect(await storage.exists(key)).toBe(true);
    expect(await storage.get(key)).toEqual(Buffer.from("facture"));
  });
});