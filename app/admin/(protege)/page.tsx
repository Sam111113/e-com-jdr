// Tableau de bord admin (T1.10). Contenu (ventes par jeu) à compléter :
// voir app/admin/commandes et app/admin/listes-attente pour le détail.
import Link from "next/link";

export default function TableauDeBordAdmin() {
  return (
    <>
      <h1>Tableau de bord</h1>
      <p>
        Bienvenue. Consultez les <Link href="/admin/commandes">commandes</Link> ou les{" "}
        <Link href="/admin/listes-attente">listes d&apos;attente</Link>.
      </p>
    </>
  );
}
