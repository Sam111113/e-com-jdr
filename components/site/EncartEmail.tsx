// Encart d'inscription email. L'inscription réelle (double opt-in Brevo,
// consentement RGPD) arrive avec T1.9 : d'ici là le formulaire est affiché
// désactivé, avec une mention claire, pour ne rien promettre de faux.
export function EncartEmail({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="encart">
      <h2 className="section-titre">{titre}</h2>
      <p>{texte}</p>
      <form className="formulaire-ligne" aria-describedby="encart-email-note">
        <label htmlFor="encart-email" className="sr-only">
          Adresse email
        </label>
        <input
          id="encart-email"
          type="email"
          name="email"
          placeholder="votre@email.fr"
          autoComplete="email"
          disabled
        />
        <button type="submit" className="btn btn-primaire" disabled>
          Me prévenir
        </button>
      </form>
      <p className="note" id="encart-email-note">
        Les inscriptions ouvriront très prochainement.
      </p>
    </div>
  );
}
