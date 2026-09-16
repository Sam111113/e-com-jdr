// Indexation publique (T1.12) : réglage volontairement distinct de
// SALES_ENABLED (D11/D19 ne s'appliquent qu'aux ventes) — se tromper ici est
// sans conséquence légale ou financière et se corrige sans reconstruire.
//
// Fail-closed comme le reste du projet (D13) : par défaut, ou en cas de
// variable absente/mal orthographiée, le site reste NON indexable.
//
// Filet de sécurité indépendant : même si cette variable passait par erreur
// à true sur le staging, `proxy.ts` impose de toute façon un mot de passe et
// l'en-tête `X-Robots-Tag: noindex` sur chaque réponse — voir D13.
export function siteIndexable(): boolean {
  return process.env.SITE_PUBLIC === "true";
}
