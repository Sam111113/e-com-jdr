# Directions visuelles — T1.4 [VALIDATION ÉQUIPE]

> Deux maquettes HTML/CSS statiques et autonomes (aucun serveur, aucune dépendance au socle
> Next.js créé en parallèle par T1.3). Ouvrez-les directement dans un navigateur via `file://` :
>
> - `direction-a/index.html`, `direction-a/fiche-jeu.html`
> - `direction-b/index.html`, `direction-b/fiche-jeu.html`
>
> Contenu de démonstration : marque provisoire **« Le Cabinet des Énigmes (nom provisoire) »**
> (section 0 d'`AGENTS.md` encore vide) et jeu factice **« Le Manoir Hurlant »**, marqués comme
> tels partout où ils apparaissent (bandeau en haut de chaque page, badges, mention « (exemple) »
> sur chaque caractéristique). Aucune caractéristique de jeu réel n'est inventée.

**Ce que l'équipe doit faire :** ouvrir les 4 pages (ou regarder les captures ci-dessous),
choisir une direction (A, B, ou un mélange à préciser), puis nous le dire. Le choix sera noté
dans `docs/DECISIONS.md` et débloque T1.6 (pages du site).

---

## Captures d'écran

Générées avec Playwright + le Chromium système (`design/capture.js`), en ouvrant les pages en
`file://` (aucun serveur lancé). Mobile : 390×844. Ordinateur : 1440×900. Toutes les captures
sont dans `design/captures/` :

| Page | Direction A | Direction B |
|---|---|---|
| Accueil — mobile | `direction-a-accueil-mobile.png` | `direction-b-accueil-mobile.png` |
| Accueil — ordinateur | `direction-a-accueil-ordinateur.png` | `direction-b-accueil-ordinateur.png` |
| Fiche jeu — mobile | `direction-a-fiche-jeu-mobile.png` | `direction-b-fiche-jeu-mobile.png` |
| Fiche jeu — ordinateur | `direction-a-fiche-jeu-ordinateur.png` | `direction-b-fiche-jeu-ordinateur.png` |

Pour les régénérer après une modification du CSS/HTML :

```bash
cd design
npm install   # installe Playwright localement (non versionné, voir .gitignore)
CHROMIUM_PATH=/usr/bin/chromium node capture.js   # ou npm run capture
```

---

## Direction A — « Mystère chaleureux »

**Intention :** ambiance sombre et feutrée, façon manoir aux chandelles. Cible surtout
l'imaginaire « soirée mystère entre adultes / ado » tout en restant chaleureuse (pas glauque)
pour ne pas effrayer les parents qui cherchent aussi des jeux pour enfants. Détails : coins peu
arrondis, halo doré sur les éléments interactifs, titres en serif élégant.

- **Typographie :** titres en `Playfair Display` (700/900, serif à empattements marqués,
  ambiance « roman policier »), texte courant en `Inter` (400/500/600/700, très lisible en
  petite taille sur mobile). Polices Google Fonts, licence OFL (usage commercial libre),
  fichiers `.woff2` téléchargés une fois et servis localement (`direction-a/fonts/`) — aucune
  dépendance à un CDN au chargement de la page.
- **Palette (variables CSS, `direction-a/styles.css`) :**

  | Rôle | Variable | Valeur |
  |---|---|---|
  | Fond principal | `--color-bg` | `#1B1330` (violet nuit) |
  | Fond des cartes | `--color-bg-alt` | `#2A2049` |
  | Fond header/footer | `--color-bg-alt-2` | `#150D26` |
  | Texte courant | `--color-text` | `#F5EFE6` (blanc cassé chaud) |
  | Texte secondaire | `--color-text-muted` | `#C9BFE0` |
  | Accent (boutons, prix) | `--color-accent` | `#E8A33D` (ambre) |
  | Texte sur accent | `--color-accent-text` | `#241633` |

- **Couleurs de saison (`[data-season="…"]`, au moins Halloween et Noël exigés par la section 5
  d'AGENTS.md — Saint-Valentin et Pâques ajoutées en bonus pour couvrir les 4 saisons du
  catalogue permanent) :**

  | Saison | `--color-season` | `--color-season-text` |
  |---|---|---|
  | Halloween (actif sur les pages de démo) | `#FF7A29` | `#1B1330` |
  | Noël | `#C21F3A` | `#F5EFE6` |
  | Saint-Valentin | `#E85D75` | `#1B1330` |
  | Pâques | `#7FBF7F` | `#1B1330` |

  Une section « Système de couleurs saisonnières (démonstration) » sur l'accueil affiche les 4
  pastilles pour prouver que le système fonctionne, même si une seule saison est active à la
  fois sur le site réel (au choix via l'attribut `data-season` sur `<html>`, réglable par
  dates comme demandé en T1.6).

## Direction B — « Ludique pop »

**Intention :** ambiance lumineuse et enjouée, coins très arrondis, formes rondes décoratives en
dégradé CSS. Cible surtout l'imaginaire « fête d'anniversaire / EVJF-EVG entre amis », plus
immédiatement accessible et festive, tout en gardant un vernis mystère (mêmes jeux, mêmes
mécaniques d'énigmes).

- **Typographie :** titres en `Baloo 2` (600/700/800, sans-serif arrondie et ludique), texte
  courant en `Nunito` (400/600/700, arrondi mais très lisible). Mêmes conditions : Google Fonts
  (licence OFL), fichiers locaux dans `direction-b/fonts/`.
- **Palette (variables CSS, `direction-b/styles.css`) :**

  | Rôle | Variable | Valeur |
  |---|---|---|
  | Fond principal | `--color-bg` | `#FFFBF5` (blanc chaud) |
  | Fond des cartes (teinte) | `--color-bg-alt` | `#F1ECFF` (lavande très clair) |
  | Fond des cartes (neutre) | `--color-bg-alt-2` | `#FFFFFF` |
  | Texte courant | `--color-text` | `#241645` (indigo profond) |
  | Texte secondaire | `--color-text-muted` | `#4A3E73` |
  | Accent (boutons, prix) | `--color-accent` | `#6B3FE0` (violet vif) |
  | Texte sur accent | `--color-accent-text` | `#FFFFFF` |

- **Couleurs de saison :**

  | Saison | `--color-season` | `--color-season-text` |
  |---|---|---|
  | Halloween (actif sur les pages de démo) | `#FF7A29` | `#1F1200` |
  | Noël | `#C21F3A` | `#FFFFFF` |
  | Saint-Valentin | `#E85D75` | `#241645` |
  | Pâques | `#7FBF7F` | `#241645` |

---

## Contrastes vérifiés (accessibilité, section 5 d'AGENTS.md)

Toutes les paires texte/fond ci-dessous ont été calculées avec la formule de contraste WCAG 2.1
(luminance relative sRGB, seuil **≥ 4,5:1 exigé pour le texte courant**). Détail des paires
critiques :

| Paire | Direction | Ratio | Seuil |
|---|---|---|---|
| Texte courant sur fond principal | A (`#F5EFE6` / `#1B1330`) | **15,54:1** | ✅ ≥ 4,5 |
| Texte secondaire sur fond principal | A (`#C9BFE0` / `#1B1330`) | **10,16:1** | ✅ ≥ 4,5 |
| Texte courant sur carte | A (`#F5EFE6` / `#2A2049`) | **13,11:1** | ✅ ≥ 4,5 |
| Texte secondaire sur carte | A (`#C9BFE0` / `#2A2049`) | **8,57:1** | ✅ ≥ 4,5 |
| Texte sur bouton accent | A (`#241633` / `#E8A33D`) | **7,87:1** | ✅ ≥ 4,5 |
| Texte courant sur fond principal | B (`#241645` / `#FFFBF5`) | **15,97:1** | ✅ ≥ 4,5 |
| Texte secondaire sur fond principal | B (`#4A3E73` / `#FFFBF5`) | **9,14:1** | ✅ ≥ 4,5 |
| Texte courant sur carte | B (`#241645` / `#F1ECFF`) | **14,25:1** | ✅ ≥ 4,5 |
| Texte secondaire sur carte | B (`#4A3E73` / `#F1ECFF`) | **8,16:1** | ✅ ≥ 4,5 |
| Texte sur bouton accent | B (`#FFFFFF` / `#6B3FE0`) | **6,15:1** | ✅ ≥ 4,5 |
| Badge saison (texte/fond) — Halloween | A (`#1B1330` / `#FF7A29`) | **6,82:1** | ✅ ≥ 4,5 |
| Badge saison (texte/fond) — Noël | A (`#F5EFE6` / `#C21F3A`) | **5,17:1** | ✅ ≥ 4,5 |
| Badge saison (texte/fond) — Saint-Valentin | A (`#1B1330` / `#E85D75`) | **5,29:1** | ✅ ≥ 4,5 |
| Badge saison (texte/fond) — Pâques | A (`#1B1330` / `#7FBF7F`) | **8,17:1** | ✅ ≥ 4,5 |
| Badge saison (texte/fond) — Halloween | B (`#1F1200` / `#FF7A29`) | **7,05:1** | ✅ ≥ 4,5 |
| Badge saison (texte/fond) — Noël | B (`#FFFFFF` / `#C21F3A`) | **5,91:1** | ✅ ≥ 4,5 |
| Badge saison (texte/fond) — Saint-Valentin | B (`#241645` / `#E85D75`) | **4,90:1** | ✅ ≥ 4,5 |
| Badge saison (texte/fond) — Pâques | B (`#241645` / `#7FBF7F`) | **7,57:1** | ✅ ≥ 4,5 |
| Badge « JEU FACTICE » (texte blanc/rouge) | A et B (`#FFFFFF` / `#C21F3A`) | **5,91:1** | ✅ ≥ 4,5 |

**Point corrigé pendant la relecture :** le badge de saison du hero (« Saison Halloween ») posait
initialement son texte directement sur le dégradé de fond (couleur de saison → fond de page),
ce qui tombait à **2,52:1** en direction B (et aurait échoué avec Noël en direction A, 3,00:1).
Corrigé en donnant au badge son propre fond neutre (`--color-bg-alt-2`) avec bordure de couleur
de saison, et en ajoutant un voile semi-transparent (sombre en A, blanc en B) sur l'ensemble du
bloc hero pour garantir un contraste correct du titre et du sous-titre même sur la zone la plus
saturée du dégradé (vérifié : **6,70:1** en A et **6,09:1** en B sur le pire cas, contre 2,28:1
et 3,62:1 avant correction).

Les boutons **désactivés** (newsletter, « Me prévenir de la sortie » — non fonctionnels dans
cette maquette statique) ne sont pas comptés dans les seuils ci-dessus : la norme WCAG 2.1
(critère 1.4.3) exempte explicitlement les composants d'interface inactifs.

Méthode de calcul : script Node dans `/tmp/opencode/contrast.js` (formule officielle WCAG,
luminance relative sRGB) — non versionné, réutilisable si besoin pour vérifier d'autres teintes
avant de les ajouter aux tokens.

---

## Conformité aux règles du brief

- **Mobile d'abord :** mise en page de base sans media query (lisible dès ~360px), puis
  `@media (min-width: 768px / 1024px)` pour la version ordinateur (grilles multi-colonnes,
  navigation horizontale au lieu du burger).
- **Ambiance ludique et mystérieuse :** direction A penche vers le mystère, direction B vers le
  ludique — les deux gardent les deux ingrédients à des degrés différents, à trancher par
  l'équipe.
- **Couleurs de saison en variables CSS :** voir ci-dessus (`[data-season="halloween|noel|
  saint-valentin|paques"]`).
- **Accessibilité de base :** contrastes vérifiés ci-dessus, `:focus-visible` visible sur tous
  les liens/boutons, navigation clavier native (vrais `<a>`/`<button>`, aucun `<div onclick>`),
  menu mobile en CSS pur (case à cocher cachée, sans JavaScript).
- **Performance :** aucune image bitmap (tout en dégradés/formes CSS), polices auto-hébergées en
  `.woff2` (poids total ~250-280 Ko par direction), zéro script tiers, zéro dépendance CDN au
  chargement.
- **Contenu :** marque et jeu clairement provisoires/factices partout (bandeau permanent, badges,
  mentions « (exemple) »), aucune caractéristique de jeu réelle inventée, aucun faux avis, aucune
  fausse urgence, aucun prix barré, bouton « Me prévenir de la sortie » (pas « Acheter » — les
  ventes ne sont pas ouvertes en phase 1).
- **Ressources :** uniquement Google Fonts (licence OFL, usage commercial libre) auto-hébergées
  localement, et des formes/dégradés CSS. Aucune image ni texte de concurrent.

## Écarts par rapport au cadrage initial

- Les 4 saisons (Halloween, Noël, Saint-Valentin, Pâques) ont été implémentées dans les tokens
  CSS plutôt que les 2 minimums demandés, pour couvrir tout de suite le calendrier du catalogue
  permanent (section 1 d'AGENTS.md) sans travail supplémentaire pour l'équipe technique en T1.6.
- Le badge « 🎃 » initial a été retiré (remplacé par un texte simple « Saison Halloween ») : le
  Chromium système utilisé pour les captures n'a pas de police emoji installée et affichait un
  rectangle vide. Le vrai site pourra réintroduire des emojis si l'équipe le souhaite, à
  vérifier au rendu réel une fois le socle Next.js en place.
