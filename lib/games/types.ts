// Types partagés pour l'import et la validation des fiches de jeu.
//
// D15 : `type` et `collections` sont des champs `text` libres en base.
// Les listes ci-dessous sont INDICATIVES uniquement — elles servent de
// référence / suggestions dans les messages d'erreur, mais la validation
// n'exige PAS qu'une valeur figure dans ces listes. Ajouter un nouveau
// type de jeu ne demande donc ni migration ni modification de schéma.

/** Types de jeu connus (indicatif). */
export const KNOWN_GAME_TYPES = [
  "escape-game",
  "chasse-au-tresor",
  "murder-party",
  "enquete",
] as const;

/** Collections (saisons) connues (indicatif). */
export const KNOWN_COLLECTIONS = [
  "halloween",
  "noel",
  "saint-valentin",
  "paques",
  "anniversaire",
] as const;