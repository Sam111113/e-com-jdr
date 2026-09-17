// Configuration légale centralisée (T1.7, décision D4, D11).
//
// Toutes les mentions légales et informations d'entreprise vivent ici, et
// nulle part ailleurs (factures, CGV, mentions légales en liront la même
// source). Les valeurs pas encore fournies par l'équipe portent le marqueur
// `MARQUEUR_A_COMPLETER`, détecté par lib/ventes/verification-legale.ts.
//
// IMPORTANT : quand SALES_ENABLED=true, le build échoue (et le serveur
// refuse de démarrer) tant qu'un champ contient encore ce marqueur — voir
// scripts/check-legal-config.ts et instrumentation.ts.

export const MARQUEUR_A_COMPLETER = "À COMPLÉTER";

export const entreprise = {
  // Renseigné depuis AGENTS.md section 0 (17/09/2026) : nom exact à
  // reconfirmer par l'équipe au moment du dépôt réel (micro-entreprise :
  // la raison sociale légale est en général le nom propre du déclarant,
  // "lpenterprise" n'en est peut-être que le nom commercial).
  /** Raison sociale exacte (peut différer du nom commercial de config/site.ts). */
  raisonSociale: "lpenterprise",
  /** Ex. "Micro-entreprise", "SASU", "SAS". */
  formeJuridique: "Micro-entreprise",
  siret: MARQUEUR_A_COMPLETER,
  adresse: MARQUEUR_A_COMPLETER,
  /** Email de contact affiché dans les mentions légales et les factures. */
  emailContact: "teampartyhunter@partyhunter.shop",

  regimeTva: {
    // Hypothèse par défaut (micro-entreprise, franchise en base) : à
    // confirmer par l'équipe une fois le statut définitif connu.
    assujetti: false,
    mentionFranchise: "TVA non applicable, art. 293 B du CGI",
  },

  mediateurConsommation: {
    nom: MARQUEUR_A_COMPLETER,
    siteWeb: MARQUEUR_A_COMPLETER,
  },

  hebergeur: {
    // Sera celui du VPS de production (D6) ; le VPS actuel n'est qu'un
    // environnement de développement/staging, jamais mentionné ici.
    nom: MARQUEUR_A_COMPLETER,
    adresse: MARQUEUR_A_COMPLETER,
  },

  /** Personne ou entité responsable de la publication (mentions légales). */
  directeurPublication: MARQUEUR_A_COMPLETER,
} as const;

export type Entreprise = typeof entreprise;
