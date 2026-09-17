import Link from "next/link";
import { site } from "@/config/site";

// Les pages légales (mentions légales, CGV, confidentialité) arrivent avec
// T1.11 : pas de lien tant qu'elles n'existent pas.
const LIENS = [
  { href: "/jeux", libelle: "Tous les jeux" },
  { href: "/jeu-gratuit", libelle: "Jeu gratuit" },
  { href: "/comment-ca-marche", libelle: "Comment ça marche" },
  { href: "/faq", libelle: "FAQ" },
  { href: "/a-propos", libelle: "À propos" },
  { href: "/contact", libelle: "Contact" },
];

export function PiedDePage() {
  return (
    <footer className="site-footer">
      <div className="conteneur footer-inner">
        <p className="logo">
          {site.nom}
          {site.nomProvisoire && <span className="badge-provisoire">nom provisoire</span>}
        </p>
        <nav aria-label="Liens du pied de page">
          <ul className="footer-liens">
            {LIENS.map((lien) => (
              <li key={lien.href}>
                <Link href={lien.href}>{lien.libelle}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="footer-note">
          © {new Date().getFullYear()} {site.nom}
        </p>
      </div>
    </footer>
  );
}
