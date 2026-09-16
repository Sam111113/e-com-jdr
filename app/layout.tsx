import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { connection } from "next/server";
import { JsonLd } from "@/components/site/JsonLd";
import { EnTete } from "@/components/site/EnTete";
import { PiedDePage } from "@/components/site/PiedDePage";
import { site } from "@/config/site";
import { saisonActive } from "@/lib/saisons";
import { siteIndexable } from "@/lib/seo/indexation";
import { organisationEtSiteJsonLd } from "@/lib/seo/jsonld";
import { baseUrl } from "@/lib/seo/site-url";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

// Indexation pilotée par SITE_PUBLIC (T1.12, lib/seo/indexation.ts), tant
// qu'elle reste à false (tout le long de la phase 1) le site n'est de toute
// façon accessible que derrière le mot de passe de proxy.ts, qui impose en
// plus un en-tête X-Robots-Tag sur chaque réponse quel que soit ce réglage
// (D13) : retirer cette double protection est le rôle de T2.4 (mise en ligne
// publique), pas de T1.12.
const indexable = siteIndexable();

export const metadata: Metadata = {
  metadataBase: baseUrl(),
  title: {
    default: `${site.nom} : jeux à imprimer`,
    template: `%s | ${site.nom}`,
  },
  description: site.description,
  robots: indexable
    ? { index: true, follow: true }
    : {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
          index: false,
          follow: false,
        },
      },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffbf5" },
    { media: "(prefers-color-scheme: dark)", color: "#14102a" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // La saison dépend de la date du jour : rendu à chaque requête, jamais figé
  // au moment du build.
  await connection();
  const saison = saisonActive();
  const umamiId = process.env.UMAMI_WEBSITE_ID;

  return (
    <html
      lang="fr"
      data-saison={saison ?? undefined}
      className={`${baloo.variable} ${nunito.variable} antialiased`}
    >
      <body>
        {organisationEtSiteJsonLd().map((donnees) => (
          <JsonLd key={donnees["@type"]} data={donnees} />
        ))}
        <a href="#contenu" className="lien-evitement">
          Aller au contenu
        </a>
        <EnTete saison={saison} />
        <main id="contenu">{children}</main>
        <PiedDePage />
        {umamiId && (
          // Umami : sans cookies, sans donnée personnelle — pas de bannière
          // de consentement nécessaire (T1.14). Script et endpoint de
          // collecte sous /stats, même origine que le site (next.config.ts).
          <script defer src="/stats/script.js" data-website-id={umamiId} data-host-url="/stats" />
        )}
      </body>
    </html>
  );
}
