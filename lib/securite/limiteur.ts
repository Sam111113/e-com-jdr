// Limitation du nombre de requêtes sur les routes sensibles (T1.15).
// Sortie de lib/contact/formulaire.ts (T1.6, seul appelant jusqu'ici) pour
// que T1.8 (téléchargement, renvoi de liens) et T1.9 (liste d'attente,
// newsletter) le réutilisent sans le réécrire.
//
// Limite en mémoire, par adresse IP, valable pour un seul processus
// applicatif (pas de Redis partagé) : suffisant tant qu'il n'y a qu'une
// seule instance du serveur, ce qui est le cas ici (staging comme
// production prévue, D6).
export type Limiteur = (ip: string, maintenant?: number) => boolean;

export function creerLimiteurParIp(limite: number, fenetreMs: number): Limiteur {
  const envois = new Map<string, number[]>();
  return (ip: string, maintenant = Date.now()): boolean => {
    const recents = (envois.get(ip) ?? []).filter((date) => maintenant - date < fenetreMs);
    if (recents.length >= limite) {
      envois.set(ip, recents);
      return false;
    }
    recents.push(maintenant);
    envois.set(ip, recents);
    // Nettoyage occasionnel pour que la table ne grossisse pas indéfiniment.
    if (envois.size > 10_000) {
      for (const [cle, dates] of envois) {
        if (dates.every((date) => maintenant - date >= fenetreMs)) envois.delete(cle);
      }
    }
    return true;
  };
}
