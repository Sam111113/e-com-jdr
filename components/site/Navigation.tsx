"use client";

// Navigation principale : en ligne sur ordinateur, menu déroulant sur mobile.
// Le menu mobile est un <details> natif (utilisable sans JavaScript) ; ce
// composant le referme seulement après un changement de page.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export interface LienNavigation {
  href: string;
  libelle: string;
  saison?: boolean;
}

function Liens({ liens, pathname }: { liens: LienNavigation[]; pathname: string }) {
  return (
    <ul>
      {liens.map((lien) => {
        const actif = pathname === lien.href || pathname.startsWith(`${lien.href}/`);
        return (
          <li key={lien.href}>
            <Link
              href={lien.href}
              className={lien.saison ? "nav-lien nav-lien-saison" : "nav-lien"}
              aria-current={actif ? "page" : undefined}
            >
              {lien.libelle}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Navigation({ liens }: { liens: LienNavigation[] }) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [pathname]);

  return (
    <>
      <nav className="nav-principale" aria-label="Navigation principale">
        <Liens liens={liens} pathname={pathname} />
      </nav>
      <details className="menu-mobile" ref={menu}>
        <summary>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          Menu
        </summary>
        <nav className="menu-mobile-panneau" aria-label="Navigation principale (mobile)">
          <Liens liens={liens} pathname={pathname} />
        </nav>
      </details>
    </>
  );
}
