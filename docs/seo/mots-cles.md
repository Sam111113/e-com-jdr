# Mots-clés et pages cibles (T1.13)

> Réalisé pour T1.13, dépend de T1.2 (validée). Aucun code dans cette tâche.
>
> **Méthode et limites (honnêteté, AGENTS.md section 6/8) :**
> - Recherche déléguée à `worker-web` : autocomplétion (Google bloqué par captcha au moment de la collecte le 15/09/2026 ; contournement via l'autocomplétion et les résultats **DuckDuckGo**, plus **Bing** pour quelques requêtes), et repérage de pages concurrentes déjà positionnées.
> - **Aucun outil payant utilisé** (pas de Search Console historique, pas de Semrush/Ahrefs/Google Trends chiffré) → **aucun volume de recherche fiable**. Quand un ordre de grandeur est donné, il est marqué **« estimation qualitative »** et justifié par un faisceau d'indices (nombre de variantes d'autocomplétion, nombre et qualité des concurrents déjà positionnés, présence ou non de résultats pertinents).
> - Pour chaque requête retenue, la source exacte (moteur + URL) est indiquée. Aucun texte de concurrent n'a été recopié : seuls les titres de page et les thèmes traités sont notés, jamais leur rédaction.
> - Les familles de requêtes suivantes ont été explorées par les workers : « escape game à imprimer », « escape game halloween enfant », « jeu d'enquête anniversaire enfant », « escape game anniversaire ado / murder party ado », « organiser un escape game à la maison », « kit escape game à imprimer gratuit », « escape game noël famille », « murder party à imprimer », « escape game EVJF à imprimer », « escape game saint valentin couple », « escape game pâques enfant ».
> - Les familles « soirée jeu de rôle entre amis à imprimer » et la distinction fine anniversaire enfant / ado n'ont **pas** pu être creusées avec des données de recherche (budget de collecte limité) : elles restent en **estimation qualitative**, par analogie avec les familles voisines déjà documentées.

---

## 1. Slugs définitifs des pages collections (pour T1.6)

Cohérents avec le modèle de fiche (T1.5, champ `collections`) et avec les exemples déjà cités dans le brief (`/escape-game-halloween`, `/escape-game-noel`). Le champ `collections` du modèle de fiche devra donc accepter ces 8 valeurs (à confirmer avec l'équipe qui possède le modèle — voir `docs/A_FAIRE_EQUIPE.md`) :

| Collection | Slug définitif | Requête principale associée |
|---|---|---|
| Halloween | `/escape-game-halloween` | escape game halloween enfant |
| Noël | `/escape-game-noel` | escape game noël famille |
| Anniversaire enfant | `/escape-game-anniversaire-enfant` | jeu d'enquête anniversaire enfant |
| Anniversaire ado | `/escape-game-anniversaire-ado` | escape game anniversaire ado |
| Soirée adulte / murder party | `/murder-party-a-imprimer` | murder party à imprimer |
| EVJF / EVG | `/escape-game-evjf-evg` | escape game evjf à imprimer |
| Saint-Valentin | `/escape-game-saint-valentin` | escape game saint valentin couple |
| Pâques | `/escape-game-paques` | escape game pâques enfant |

**Remarque sur le choix `/murder-party-a-imprimer` (plutôt que `/escape-game-soiree-adulte`) :** la famille « murder party à imprimer » a une autocomplétion riche et cohérente (8 variantes, dont des intentions transactionnelles claires : *à imprimer*, *à télécharger*, *à acheter*) et des concurrents dédiés déjà positionnés (`murderlab.fr`, `murderquest.fr`, `nextanim.fr`). Ce nom de collection accueillera murder parties **et** escape games pour adultes ; si le besoin de séparer apparaît après import des premiers vrais jeux (T1.5), on ajoutera une collection sans casser l'URL existante (table `redirects`, décision D12).

**Toutes ces URLs sont permanentes** (AGENTS.md section 6) : jamais de suffixe d'année.

---

## 2. Mots-clés par page cible

### 2.1 Page d'accueil `/`
- **Rôle :** page de marque, pas de compétition frontale sur un mot-clé précis (marque encore provisoire — voir AGENTS.md section 0).
- **Requête principale :** nom de marque (à définir).
- **Requêtes secondaires :** « escape game à imprimer », « jeux à imprimer pour fêtes » (soutien, pas de ciblage direct).
- **Intention :** navigationnelle une fois la marque connue ; découverte pour les nouveaux visiteurs venus des réseaux (Pinterest/TikTok/Instagram).
- **Saisonnalité :** aucune ; met en avant la saison active (mécanisme prévu en T1.6).

### 2.2 Catalogue `/jeux`
- **Requête principale :** « escape game à imprimer »
- **Requêtes secondaires :** « escape game à imprimer pdf », « escape game à imprimer gratuit » *(trafic probablement capté en partie par `/jeu-gratuit`, voir 2.11)*, « escape game à imprimer adulte », « escape game à imprimer enfant »
- **Intention :** transactionnelle / commerciale (comparaison d'offres).
- **Saisonnalité :** aucune, page permanente.
- **Source :** autocomplétion DuckDuckGo pour `escape game à imprimer` (5 variantes) ; 7 concurrents identifiés (ex. `lescapeur.com`, `focus-famille.fr`, `enigmatheque.com`) qui positionnent presque tous leur offre sur le **gratuit**, ce qui confirme l'intérêt de bien distinguer notre offre payante dès le titre/la meta description.
- **Observation qualitative :** concurrence dense sur ce terme générique ; les fiches jeux (longue traîne, 2.9) et les collections (2.3 à 2.8) sont probablement plus accessibles à court terme pour un domaine neuf.

### 2.3 Collection Halloween `/escape-game-halloween`
- **Requête principale :** « escape game halloween enfant »
- **Requêtes secondaires :** « escape game halloween à imprimer », « escape game halloween maison », « escape game halloween gratuit »
- **Intention :** transactionnelle/commerciale, avec une forte part de « gratuit » chez les concurrents (à assumer : notre offre est payante, le positionnement doit être clair dès la page).
- **Saisonnalité :** pic attendu de mi-septembre à fin octobre. Halloween tombe le samedi 31/10/2026.
- **Source :** autocomplétion DuckDuckGo (6 variantes) ; 7 concurrents relevés (`petitmou.fr`, `mapetitefabriqueareves.fr` ×2, `mytribunews.com`, `animadom.fr`, `petiteschassesautresor.com`, `escape-kit.com`) — thèmes dominants : énigmes adaptées aux enfants, kits gratuits à imprimer, décor DIY.

### 2.4 Collection Noël `/escape-game-noel`
- **Requête principale :** « escape game noël famille »
- **Requêtes secondaires :** « escape game de noël », « escape game de noël gratuit », « escape game père noël »
- **Intention :** transactionnelle/commerciale ; fort volet familial (jeux collectifs de fin d'année) et volet scolaire (variantes « escape game cp noël », hors cible mais indique un usage éducatif du terme à ne pas confondre).
- **Saisonnalité :** pic attendu de novembre à la mi-décembre.
- **Source :** autocomplétion DuckDuckGo (8 variantes) ; concurrents relevés via une page de résultats DuckDuckGo (`nextanim.fr` entre autres).

### 2.5 Collection Anniversaire enfant `/escape-game-anniversaire-enfant`
- **Requête principale :** « jeu d'enquête anniversaire enfant »
- **Requêtes secondaires :** « escape game anniversaire enfant à imprimer », « idées jeux anniversaire enfant », « jeu pour anniversaire enfant »
- **Intention :** transactionnelle, mais mêlée à des intentions très génériques.
- **Saisonnalité :** aucune, permanente (les anniversaires ont lieu toute l'année).
- **Source et limite importante :** l'autocomplétion DuckDuckGo remonte surtout des variantes génériques (« idées jeux anniversaire enfant »…), et les résultats de recherche sont dominés par des **plateformes de jeux en ligne génériques** (`jeux.fr`, `poki.com`, `y8.com`) qui n'ont **aucun rapport** avec des kits imprimables. **Observation qualitative :** peu de concurrence directe et spécialisée trouvée sur ce terme précis → opportunité possible, mais aussi signe que le terme exact est peut-être moins cherché que des variantes voisines (« activité anniversaire enfant », « animation anniversaire enfant ») à creuser plus tard avec un outil de volumes.

### 2.6 Collection Anniversaire ado `/escape-game-anniversaire-ado`
- **Requête principale :** « escape game anniversaire ado »
- **Requêtes secondaires :** « murder party ado », « escape game pour ado », « escape game anniversaire 8 ans » *(indique que la frontière enfant/ado est floue dans les recherches, à surveiller)*
- **Intention :** transactionnelle.
- **Saisonnalité :** aucune, permanente.
- **Source :** autocomplétion DuckDuckGo (6 variantes, famille « escape game anniversaire ado / murder party ado ») ; peu de concurrents spécialisés « ado » identifiés distinctement des résultats génériques « anniversaire enfant » — **estimation qualitative : marché de niche, peu disputé, mais probablement à faible volume.**

### 2.7 Collection Soirée adulte / murder party `/murder-party-a-imprimer`
- **Requête principale :** « murder party à imprimer »
- **Requêtes secondaires :** « murder party à télécharger », « murder party pdf gratuit », « comment faire une murder party », « idée de murder party »
- **Intention :** mixte — transactionnelle (« à imprimer », « à télécharger », « à acheter ») et informationnelle (« comment faire une murder party », utile pour le blog, voir 2.12).
- **Saisonnalité :** faible saisonnalité propre, avec un pic possible autour d'Halloween (murder party à thème) et des fêtes de fin d'année.
- **Source :** autocomplétion DuckDuckGo (8 variantes) ; 3 concurrents directs et spécialisés identifiés (`nextanim.fr`, `murderlab.fr`, `murderquest.fr`) — c'est la famille avec la concurrence la plus **qualifiée** (sites 100 % dédiés à la murder party imprimable), à surveiller de près pour la différenciation (voir `docs/DECISIONS.md` si un choix de différenciation est arrêté).

### 2.8 Collection EVJF/EVG `/escape-game-evjf-evg`
- **Requête principale :** « escape game evjf à imprimer »
- **Requêtes secondaires :** « escape game evjf à télécharger », « jeu evjf à imprimer », « animation evg à imprimer »
- **Intention :** transactionnelle, achat cadeau/animation pour un événement précis (planifié à l'avance, forte intention).
- **Saisonnalité :** pic saisonnier printemps-été (saison des mariages), faible en hiver — **estimation qualitative**, aucune donnée chiffrée disponible.
- **Source :** autocomplétion DuckDuckGo (8 variantes) ; 3 concurrents dédiés (`escape-kit.com`, `instantescapegames.com`, `mariageparty.com`) dont un (`instantescapegames.com`) apparaît aussi sur la requête Noël, signe d'un acteur généraliste sur l'imprimable événementiel.

### 2.9 Collection Saint-Valentin `/escape-game-saint-valentin`
- **Requête principale :** « escape game saint valentin couple »
- **Requêtes secondaires :** « escape game saint valentin », « escape game saint valentin amis »
- **Intention :** transactionnelle, cadeau/activité de couple.
- **Saisonnalité :** pic début-mi février, autour du 14/02.
- **Source :** autocomplétion DuckDuckGo, seulement 3 variantes remontées (famille plus étroite que les autres) ; **aucune page concurrente vérifiée** (budget de collecte priorisé sur Noël/murder party/EVJF) → **estimation qualitative** sur le volume, à confirmer avant la campagne de contenu (décembre, voir calendrier).

### 2.10 Collection Pâques `/escape-game-paques`
- **Requête principale :** « escape game pâques enfant »
- **Requêtes secondaires :** « escape game pâques enfant gratuit », « escape game pâques enfant pdf »
- **Intention :** transactionnelle, activité familiale (souvent associée à la chasse aux œufs).
- **Saisonnalité :** pic mars-avril (Pâques 2027 : dimanche 28/03/2027 — à vérifier auprès d'un calendrier officiel au moment de la rédaction des articles).
- **Source :** autocomplétion DuckDuckGo, 3 variantes seulement ; **aucune page concurrente vérifiée** → **estimation qualitative**, famille la moins documentée de toutes (collecte priorisée sur les échéances plus proches).

### 2.11 Page `/jeu-gratuit`
- **Requête principale :** « escape game gratuit à imprimer »
- **Requêtes secondaires :** « kit escape game à imprimer gratuit », « escape game enfant à imprimer gratuit pdf », « jeu escape game gratuit à imprimer »
- **Intention :** informationnelle/transactionnelle à faible engagement (recherche de gratuit) — cohérent avec le rôle de cette page dans le tunnel (T1.9) : capter l'email contre le mini-jeu gratuit, pas une vente.
- **Saisonnalité :** aucune, permanente.
- **Source :** autocomplétion DuckDuckGo (8 variantes) ; concurrence très dense et unanimement positionnée sur le gratuit (`lescapeur.com`, `mysterefeuilleciseaux.com`, `focus-famille.fr`) — cohérent avec l'usage de cette page comme aimant à emails plutôt que comme vitrine commerciale.

### 2.12 Fiches jeux `/jeux/[slug]`
- **Rôle :** requêtes longues et précises, propres à chaque jeu réel une fois importé (T1.5). **Aucun jeu réel n'existe encore : pas de mots-clés inventés ici.**
- **Gabarit de requête longue traîne à instancier par jeu** (à combiner avec les vrais attributs de la fiche — jamais des caractéristiques inventées, AGENTS.md section 3) :
  `escape game [collection] à imprimer [tranche d'âge/public]`, ex. structure observée chez les concurrents : « escape game gratuit à imprimer, à partir de 9 ans » (mysterefeuilleciseaux.com, thème repéré, texte non copié).
- **Intention :** transactionnelle précise, utilisateur proche de l'achat.
- **Saisonnalité :** celle de la collection du jeu.

### 2.13 Blog (questions pratiques)
- **Rôle :** capter les intentions informationnelles en amont de l'achat, maillage interne vers les collections et fiches jeux (T1.12).
- **Requêtes identifiées (sources : autocomplétion DuckDuckGo) :**
  - « organiser un escape game à la maison », « comment organiser un escape game », « comment faire un escape game maison », « créer un escape game à la maison »
  - « comment faire une murder party », « comment créer un murder party », « idée de murder party »
- **Intention :** informationnelle, TOFU (haut de tunnel).
- **Saisonnalité :** dépend du sujet choisi (voir `docs/seo/calendrier.md`).

---

## 3. Rôle de chaque type de page (rappel T1.13)
- **Pages collections** (2.3 à 2.10) : requêtes principales, volume le plus large par thème, page d'atterrissage privilégiée pour les campagnes saisonnières et les réseaux sociaux.
- **Fiches jeux** (2.12) : requêtes longues et précises, alimentées uniquement par les vraies fiches (T1.5).
- **Blog** (2.13) : questions pratiques, maillage interne, aucune promesse commerciale directe.

## 4. Synthèse des limites (à ne pas perdre de vue)
- Aucune donnée de volume chiffrée n'a été utilisée nulle part dans ce document.
- Google Trends et l'autocomplétion Google n'étaient pas accessibles au moment de la collecte (captcha) ; toutes les autocomplétions viennent de DuckDuckGo, un signal indicatif mais **pas strictement représentatif du comportement des internautes sur Google** (moteur dominant en France).
- Avant de lancer une campagne payante ou de prioriser fortement une collection, une vérification avec un outil de mots-clés (Google Keyword Planner, ou équivalent) reste recommandée — hors périmètre de T1.13 (pas d'outil payant, pas de compte à créer sans l'équipe, AGENTS.md section 3).
