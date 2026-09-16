// Point d'entrée appelé une seule fois par Next.js au démarrage du serveur
// (T1.7, décision D11, point 4). La logique elle-même vit dans
// instrumentation-node.ts, importé dynamiquement : voir ce fichier pour le
// détail (process.exit n'est pas disponible dans le runtime Edge).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { verifierAuDemarrage } = await import("./instrumentation-node");
    verifierAuDemarrage();
  }
}
