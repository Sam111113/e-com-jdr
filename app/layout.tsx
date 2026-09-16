import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { connection } from "next/server";
import { EnTete } from "@/components/site/EnTete";
import { PiedDePage } from "@/components/site/PiedDePage";
import { site } from "@/config/site";
import { saisonActive } from "@/lib/saisons";
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

// Staging privé (T1.3, AGENTS.md sections 6 et 8) : jamais indexable, en plus
// du mot de passe posé par proxy.ts et de l'en-tête X-Robots-Tag. Les réglages
// d'indexation de la production relèvent de T1.12.
export const metadata: Metadata = {
  title: {
    default: `${site.nom} : jeux à imprimer`,
    template: `%s | ${site.nom}`,
  },
  description: site.description,
  robots: {
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

  return (
    <html
      lang="fr"
      data-saison={saison ?? undefined}
      className={`${baloo.variable} ${nunito.variable} antialiased`}
    >
      <body>
        <a href="#contenu" className="lien-evitement">
          Aller au contenu
        </a>
        <EnTete saison={saison} />
        <main id="contenu">{children}</main>
        <PiedDePage />
      </body>
    </html>
  );
}
