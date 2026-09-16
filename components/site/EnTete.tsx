import Link from "next/link";
import { site } from "@/config/site";
import { SAISONS, type SaisonId } from "@/lib/saisons";
import { Navigation, type LienNavigation } from "./Navigation";

export function EnTete({ saison }: { saison: SaisonId | null }) {
  const liens: LienNavigation[] = [
    { href: "/jeux", libelle: "Tous les jeux" },
    ...(saison
      ? [{ href: SAISONS[saison].hub, libelle: SAISONS[saison].nom, saison: true }]
      : []),
    { href: "/comment-ca-marche", libelle: "Comment ça marche" },
    { href: "/faq", libelle: "FAQ" },
    { href: "/contact", libelle: "Contact" },
  ];

  return (
    <header className="site-header">
      <div className="conteneur header-inner">
        <Link href="/" className="logo">
          {site.nom}
          {site.nomProvisoire && <span className="badge-provisoire">nom provisoire</span>}
        </Link>
        <Navigation liens={liens} />
      </div>
    </header>
  );
}
