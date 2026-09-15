import { NextRequest, NextResponse } from "next/server";

// Protection du staging (T1.3, AGENTS.md sections 4, 6 et 8).
//
// Défense en profondeur : le staging n'est de toute façon joignable que
// depuis le tailnet Tailscale (aucune exposition publique), mais on garde
// quand même ce mot de passe HTTP Basic Auth, comme l'exige le brief.
//
// Comportement « fail-closed » : si les variables d'environnement du mot de
// passe ne sont pas définies (mauvaise configuration du déploiement), on
// bloque tout accès plutôt que de laisser passer.
const REALM = "Staging prive";
const NOINDEX_HEADER = "noindex, nofollow, noarchive";

function isAuthorized(request: NextRequest): boolean {
  const expectedUser = process.env.STAGING_BASIC_AUTH_USER;
  const expectedPassword = process.env.STAGING_BASIC_AUTH_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return false;
  }

  let decoded: string;
  try {
    decoded = atob(authHeader.slice("Basic ".length));
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const providedUser = decoded.slice(0, separatorIndex);
  const providedPassword = decoded.slice(separatorIndex + 1);

  return providedUser === expectedUser && providedPassword === expectedPassword;
}

export function proxy(request: NextRequest) {
  // robots.txt reste accessible sans mot de passe : cela facilite la
  // vérification (il annonce de toute façon une interdiction totale), et un
  // moteur de recherche qui ne peut pas s'authentifier ne pourrait de toute
  // façon jamais explorer le reste du site.
  if (request.nextUrl.pathname === "/robots.txt") {
    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", NOINDEX_HEADER);
    return response;
  }

  if (!isAuthorized(request)) {
    return new NextResponse("Authentification requise.", {
      status: 401,
      headers: {
        "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
        "X-Robots-Tag": NOINDEX_HEADER,
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", NOINDEX_HEADER);
  return response;
}

export const config = {
  matcher: [
    // Toutes les routes sauf les fichiers statiques internes de Next.js.
    "/((?!_next/static|_next/image).*)",
  ],
};
