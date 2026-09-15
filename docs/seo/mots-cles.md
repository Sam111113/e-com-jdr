# Mots-clés et pages cibles (T1.13)

> Réalisé pour T1.13, dépend de T1.2 (validée). Aucun code dans cette tâche.
>
> **Révision du 15/09/2026 (décision D15) :** le catalogue accueille désormais aussi des **chasses au trésor** (thème prioritaire : Halloween). Cette révision **complète** le document initial (sections 1 à 4 ci-dessous, inchangées sauf mention contraire) sans rien supprimer :
> - **Section 1bis** : nouvelle **structure de pages collections** couvrant plusieurs types de jeu (remplace la proposition de slugs de la section 1, qui enfermait chaque saison dans le seul type « escape game ») — **en attente de validation de l'équipe**, comme le reste de cette révision.
> - **Section 2bis** : recherche de mots-clés complète pour les chasses au trésor, priorité Halloween, mêmes règles d'honnêteté que la recherche initiale.
> - **Les 3 premiers articles de blog (`content/blog/`) ne sont pas modifiés** : ils attendent toujours la validation de l'équipe (AGENTS.md section 3). `docs/seo/calendrier.md` prévoit un futur article Halloween/chasse au trésor, non rédigé.
> - **Rappel de réalisme SEO (AGENTS.md section 6) :** le domaine est neuf et la vitrine publique arrive vers le 30/09/2026. Un domaine neuf met plusieurs mois à se positionner sur Google. Les pages Halloween (escape game et chasse au trésor) visent donc surtout **Halloween 2027**, pas 2026 — Halloween 2026 (samedi 31/10) reste utile pour peupler le site de contenu réel et pour les réseaux sociaux (Pinterest/TikTok/Instagram, trafic direct), mais un classement Google notable d'ici le 31/10/2026 serait irréaliste vu l'âge du domaine.
>
> **Méthode et limites (honnêteté, AGENTS.md section 6/8) :**
> - Recherche déléguée à `worker-web` : autocomplétion (Google bloqué par captcha au moment de la collecte le 15/09/2026 ; contournement via l'autocomplétion et les résultats **DuckDuckGo**, plus **Bing** pour quelques requêtes), et repérage de pages concurrentes déjà positionnées.
> - **Aucun outil payant utilisé** (pas de Search Console historique, pas de Semrush/Ahrefs/Google Trends chiffré) → **aucun volume de recherche fiable**. Quand un ordre de grandeur est donné, il est marqué **« estimation qualitative »** et justifié par un faisceau d'indices (nombre de variantes d'autocomplétion, nombre et qualité des concurrents déjà positionnés, présence ou non de résultats pertinents).
> - Pour chaque requête retenue, la source exacte (moteur + URL) est indiquée. Aucun texte de concurrent n'a été recopié : seuls les titres de page et les thèmes traités sont notés, jamais leur rédaction.
> - Les familles de requêtes suivantes ont été explorées par les workers : « escape game à imprimer », « escape game halloween enfant », « jeu d'enquête anniversaire enfant », « escape game anniversaire ado / murder party ado », « organiser un escape game à la maison », « kit escape game à imprimer gratuit », « escape game noël famille », « murder party à imprimer », « escape game EVJF à imprimer », « escape game saint valentin couple », « escape game pâques enfant ».
> - Les familles « soirée jeu de rôle entre amis à imprimer » et la distinction fine anniversaire enfant / ado n'ont **pas** pu être creusées avec des données de recherche (budget de collecte limité) : elles restent en **estimation qualitative**, par analogie avec les familles voisines déjà documentées.

---

## 1. Slugs des pages collections — proposition initiale (T1.13 v1, 15/09/2026)

> **Remplacée par la section 1bis ci-dessous (révision D15).** Conservée telle quelle pour mémoire et pour la traçabilité de la décision : cette proposition initiale enfermait chaque saison dans le seul type « escape game », ce que D15 demande de corriger. Ne pas implémenter cette section en l'état ; se référer à la section 1bis.

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

## 1bis. Structure des pages collections — révisée (D15) — **[VALIDATION ÉQUIPE]**

> Répond à la demande explicite de D15 (`docs/DECISIONS.md`) : « l'agent propose une structure qui couvre plusieurs types (par exemple une page Halloween qui regroupe tous les types, et des pages par type), à valider par l'équipe ». Cette section **remplace** la proposition de la section 1. Elle **attend la validation de l'équipe**, comme toute décision de structure d'URL (AGENTS.md section 2 : les tâches marquées [VALIDATION ÉQUIPE] s'arrêtent là).

### Principe retenu

Deux niveaux de page, jamais un seul type figé dans l'URL d'une saison :

1. **Page « hub » par saison ou par public** (`/halloween`, `/noel`, `/anniversaire-enfant`…) : regroupe **tous les types de jeu** disponibles pour cette saison/public (escape game, chasse au trésor, et les types futurs — murder party, enquête…). Sert de page d'atterrissage généraliste pour les réseaux sociaux (Pinterest/TikTok/Instagram, AGENTS.md section 1) et de hub de maillage interne vers les pages type ci-dessous et vers les fiches jeux.
2. **Page « type » par saison ou par public** (`/escape-game-halloween`, `/chasse-au-tresor-halloween`, `/murder-party-a-imprimer`…) : créée **seulement si la recherche de mots-clés documente une requête principale dédiée, avec des concurrents réels et spécialisés sur cette combinaison type + saison/public**. Sinon, ce type reste accessible uniquement via le filtre du catalogue (`/jeux?type=…`), sans URL dédiée — évite de créer des pages sans requête ni concurrence documentée (AGENTS.md section 6 : qualité plutôt que quantité).

**Règle de décision appliquée ci-dessous :** une page type n'est proposée que si (a) une requête principale dédiée existe avec une autocomplétion riche (≥ 5 variantes) **et** (b) au moins 2 concurrents réels et spécialisés sur cette combinaison précise ont été identifiés. Sinon → la saison/public reste un hub seul, avec un statut « à surveiller » dans le tableau.

### Tableau des pages proposées

| Page | Type de page | Slug proposé | Requête principale | Intention | Raison / statut de la recherche |
|---|---|---|---|---|---|
| Halloween | **Hub**, tous types | `/halloween` | « activités halloween à imprimer » / « jeux halloween à imprimer » (requête ombrelle) | Découverte, navigation, réseaux sociaux | **Nouveau.** Requête ombrelle confirmée par autocomplétion DuckDuckGo (8 variantes : « activité enfant halloween à imprimer », « jeux pour halloween enfant », « activités halloween à imprimer gratuit »…, 15/09/2026). Vérification des concurrents sur cette requête précise bloquée par un captcha DuckDuckGo au moment de la collecte (voir section 2bis, limites) : à confirmer avant publication, mais l'intention et l'usage (hub de navigation) ne dépendent pas de ce point. |
| Escape game Halloween | Type (sous `/halloween`) | `/escape-game-halloween` | « escape game halloween enfant » | Transactionnelle | **Inchangé** depuis T1.13 v1 : requête dédiée forte (6 variantes DuckDuckGo), 7 concurrents identifiés (`petitmou.fr`, `mapetitefabriqueareves.fr`, `animadom.fr`, `petiteschassesautresor.com`, `escape-kit.com`…). |
| Chasse au trésor Halloween | Type (sous `/halloween`) | `/chasse-au-tresor-halloween` | « chasse au trésor halloween enfant » | Transactionnelle | **Nouveau (cette révision).** Requête dédiée forte (7 variantes d'autocomplétion), concurrents réels et spécialisés vérifiés par recherche HTML directe (`lesideesdusamedi.fr`, `jeuxetcompagnie.fr`, `chassemagique.com`, `unjourunjeu.fr`, `animyjob.com`…, 15 résultats organiques observés). Détail en section 2bis. |
| Noël | **Hub**, tous types | `/noel` (renommé) | « escape game noël famille » (seul type documenté à ce stade) | Transactionnelle | **Renommé** depuis `/escape-game-noel`. Un seul type documenté (escape game, T1.13 v1) ; recherche « chasse au trésor noël » **non faite dans cette révision** (hors périmètre : priorité Halloween demandée par D15 et par cette tâche). Pas de page type dédiée pour l'instant : le hub liste ce que contient le catalogue, filtrable par type. **À compléter avant l'implémentation (T1.6)** si le temps le permet. |
| Saint-Valentin | **Hub**, tous types | `/saint-valentin` (renommé) | « escape game saint valentin couple » (seul type documenté) | Transactionnelle | **Renommé** depuis `/escape-game-saint-valentin`. Même situation que Noël : recherche complémentaire non faite ici, à compléter plus tard. |
| Pâques | **Hub**, tous types | `/paques` (renommé) | « escape game pâques enfant » (seul type documenté) | Transactionnelle | **Renommé** depuis `/escape-game-paques`. Chasse au trésor et Pâques sont pourtant naturellement associés (chasse aux œufs) — recherche mots-clés dédiée **non faite ici** (hors périmètre, priorité Halloween) : forte probabilité qu'une page type `/chasse-au-tresor-paques` se justifie, à vérifier avant la campagne éditoriale de janvier 2027 (voir `docs/seo/calendrier.md`). |
| Anniversaire enfant | **Hub**, tous types | `/anniversaire-enfant` (renommé) | « jeu d'enquête anniversaire enfant » (escape game) et « chasse au trésor anniversaire enfant » (nouveau) | Transactionnelle, mêlée à des intentions génériques | **Renommé** depuis `/escape-game-anniversaire-enfant`. Escape game documenté en T1.13 v1 (concurrence faible et peu spécialisée). Chasse au trésor documenté **partiellement** dans cette révision : autocomplétion complète (8 variantes), mais vérification des concurrents dédiés bloquée par un captcha DuckDuckGo — seuls 2 concurrents repérés incidemment (`chasse-tresor.net`, page dédiée anniversaire ; `escape-kit.com`, générateur mentionnant l'anniversaire enfant). **Sous le seuil retenu** (2 concurrents confirmés sur requête générale, pas sur la combinaison précise « chasse au trésor anniversaire enfant ») → pas encore de page type `/chasse-au-tresor-anniversaire-enfant` proposée, mise en **watch-list** : à confirmer avec une recherche complémentaire avant l'implémentation T1.6. |
| Anniversaire ado | **Hub**, tous types | `/anniversaire-ado` (renommé) | « escape game anniversaire ado » (seul type documenté) | Transactionnelle | **Renommé** depuis `/escape-game-anniversaire-ado`. Marché de niche (T1.13 v1). Pas de recherche chasse au trésor faite pour ce public (peu probable comme requête dominante pour des ados, mais non vérifié — ne pas l'exclure sans donnée). |
| Soirée adulte | **Hub**, tous types | `/soiree-adulte` (nouveau) | requête ombrelle non vérifiée spécifiquement dans cette révision | Transactionnelle | **Nouveau hub.** Accueille murder party et, plus tard, d'éventuels escape games ou enquêtes pour adultes. Remplace le rôle de collection générale que jouait `/murder-party-a-imprimer` en T1.13 v1 ; ce dernier devient une page type sous ce hub (ligne suivante). Requête ombrelle non recherchée spécifiquement ici (hors périmètre) — **à vérifier avant implémentation**, sinon ce hub reste un simple sommaire de maillage interne sans ciblage mots-clés propre. |
| Murder party | Type (sous `/soiree-adulte`) | `/murder-party-a-imprimer` | « murder party à imprimer » | Mixte (transactionnelle + informationnelle) | **Inchangé** (slug conservé tel quel) : c'était déjà la famille avec la concurrence la plus qualifiée en T1.13 v1 (`nextanim.fr`, `murderlab.fr`, `murderquest.fr`, sites 100 % dédiés). Change seulement de rôle : sous-page type d'un hub, plus collection autonome. |
| EVJF/EVG | **Hub**, tous types | `/evjf-evg` (renommé) | « escape game evjf à imprimer » (seul type documenté) | Transactionnelle | **Renommé** depuis `/escape-game-evjf-evg`. Un seul type documenté (T1.13 v1). |

### Ce qui change par rapport à la proposition précédente (section 1)

- **Renommés** (deviennent des hubs multi-types, même contenu de départ tant qu'un seul type existe réellement) : `/escape-game-noel` → `/noel`, `/escape-game-saint-valentin` → `/saint-valentin`, `/escape-game-paques` → `/paques`, `/escape-game-anniversaire-enfant` → `/anniversaire-enfant`, `/escape-game-anniversaire-ado` → `/anniversaire-ado`, `/escape-game-evjf-evg` → `/evjf-evg`.
- **Conservés à l'identique**, mais reclassés comme « page type » plutôt que « collection » autonome : `/escape-game-halloween`, `/murder-party-a-imprimer`.
- **Ajoutés** : `/halloween` (hub), `/chasse-au-tresor-halloween` (type, données complètes), `/soiree-adulte` (hub, données incomplètes — voir tableau).
- **Rien n'est supprimé** : aucune URL de la proposition v1 ne disparaît sans remplacement ; chaque ancien slug devient soit un hub (même chemin conceptuel, contenu élargi), soit une page type conservée telle quelle.
- **Conséquence pour T1.5 (D15) :** le champ `collections` de la fiche (`halloween`, `noel`, `anniversaire`…) reste indépendant du champ `type` (`escape-game`, `chasse-au-tresor`…) — c'est justement le croisement des deux qui permet cette structure hub/type sans dupliquer les données. Aucun changement du modèle de fiche n'est nécessaire pour cette proposition.
- **Aucune page n'est encore implémentée** (T1.6 n'a pas commencé, voir `docs/PROGRESS.md`) : cette révision ne casse donc aucune URL déjà en ligne ; la table `redirects` (D12) n'a pas besoin d'être utilisée pour cette transition.

### Ce qui reste à compléter avant l'implémentation (T1.6)

- Recherche « chasse au trésor » pour Noël, Saint-Valentin, Pâques, anniversaire ado, EVJF/EVG (non faite dans cette révision, priorité donnée à Halloween par D15).
- Confirmation ou infirmation de la page type `/chasse-au-tresor-anniversaire-enfant` (actuellement en watch-list, données partielles).
- Vérification des concurrents sur la requête ombrelle du hub Halloween (`activités halloween à imprimer`) et sur un éventuel hub « soirée adulte » (bloquées par captcha au moment de cette collecte).

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

## 2bis. Mots-clés — chasses au trésor (complément D15, 15/09/2026)

> Recherche menée directement par l'agent (autocomplétion DuckDuckGo `kl=fr-fr` et recherche HTML DuckDuckGo), en priorité pour Halloween conformément à D15 et à cette tâche. **Aucun outil payant, aucun volume chiffré** : mêmes règles que la section 2 (« estimation qualitative » quand aucune donnée fiable n'est disponible, source exacte citée pour chaque observation).
>
> **Note de méthode :** une première collecte a été déléguée à `worker-web`, mais son rapport contenait des noms de domaine visiblement corrompus ou invérifiables (ex. « momèspares », « jeuxEtCarre.fr », « e-print.fr ») incompatibles avec l'exigence de sources vérifiables (AGENTS.md section 3 : aucune fausse donnée). L'agent a donc **refait la collecte lui-même**, en interrogeant directement DuckDuckGo ; les données ci-dessous ne viennent que de cette vérification directe, avec les résultats bruts consultables dans l'historique de la session.

### 2bis.1 Chasse au trésor Halloween enfant (page type `/chasse-au-tresor-halloween`)
- **Requête principale :** « chasse au trésor halloween enfant »
- **Requêtes secondaires :** « chasse au trésor halloween enfant pdf », « chasse au trésor halloween à imprimer », « chasse au trésor halloween à imprimer gratuit »
- **Intention :** transactionnelle (recherche d'un kit prêt à imprimer) et informationnelle en partie (« comment organiser »).
- **Saisonnalité :** pic attendu mi-septembre à fin octobre, comme pour l'escape game Halloween. Halloween 2026 : samedi 31/10.
- **Source :** autocomplétion DuckDuckGo, 7 variantes (« chasse au trésor halloween enfant pdf », « chasse au trésor halloween enfant à imprimer », « chasse au trésor enfant », « chasse au trésor enfant gratuit », « chasse au trésor enfant gratuite », « faire une chasse au trésor pour enfants »). Recherche HTML DuckDuckGo sur « chasse au trésor halloween enfant à imprimer » : **11 résultats organiques observés**, dont 9 concurrents directs et spécialisés — voir liste au 2bis.4.
- **Observation qualitative :** concurrence réelle et déjà bien fournie sur cette requête précise (plus dense que ce qui avait été trouvé pour « escape game anniversaire ado » en T1.13 v1, comparable à « escape game halloween enfant »).

### 2bis.2 Chasse au trésor à imprimer (générique, alimente aussi le catalogue `/jeux` et le hub `/halloween`)
- **Requête principale :** « chasse au trésor à imprimer »
- **Requêtes secondaires :** « chasse au trésor à imprimer gratuit », « chasse au trésor à imprimer 6/7/8/10 ans », « chasse au trésor à imprimer pdf gratuit »
- **Intention :** transactionnelle, avec une forte proportion de concurrents positionnés sur le **gratuit** (comme pour l'escape game générique, 2.2).
- **Saisonnalité :** aucune, permanente.
- **Source :** autocomplétion DuckDuckGo, 8 variantes. Recherche HTML DuckDuckGo sur « chasse au trésor à imprimer » : **11 résultats organiques observés**, dont 9 concurrents directs — voir liste au 2bis.4. Deux domaines apparaissent aussi dans la recherche « escape game » de T1.13 v1 : `mysterefeuilleciseaux.com` et `petiteschassesautresor.com` (ce dernier avait été repéré sous « escape game halloween enfant ») — ce sont des généralistes du jeu imprimable, pas des spécialistes d'un seul type.

### 2bis.3 Autres familles explorées
- **« chasse au trésor à imprimer gratuit » :** autocomplétion DuckDuckGo, 8 variantes (dont « chasse au trésor de pâques à imprimer gratuit » et « chasse au trésor pokemon gratuite à imprimer » — hors sujet mais confirment un usage large du gabarit « chasse au trésor à imprimer » au-delà d'Halloween). Recherche HTML non refaite séparément (résultats déjà couverts par 2bis.2).
- **« chasse au trésor anniversaire enfant » :** autocomplétion DuckDuckGo, 8 variantes (« chasse au trésor anniversaire enfant 5/4/7 ans », « chasse au trésor anniversaire 5/10/7 ans »…). **Recherche HTML bloquée par un captcha DuckDuckGo** à deux reprises (15/09/2026) : seuls 2 concurrents repérés incidemment via la recherche 2bis.2 (`chasse-tresor.net`, page dédiée `/chasse-au-tresor-anniversaire-gratuit` ; `escape-kit.com`, générateur mentionnant l'anniversaire enfant). **Donnée partielle** — voir statut « watch-list » en section 1bis.
- **« organiser une chasse au trésor » (à la maison) :** autocomplétion DuckDuckGo, 8 variantes (« organiser une chasse au trésor pour enfant », « … pirate », « … pour adulte », « … à la maison »…) confirmant une intention informationnelle (utile pour un futur article de blog, voir `docs/seo/calendrier.md`). **Recherche HTML bloquée par un captcha DuckDuckGo** à deux reprises ; tentative sur Bing infructueuse (Bing a interprété « chasse » comme « chasse au gibier » malgré les guillemets et l'expression complète, résultats hors sujet — Bing écarté comme source pour cette famille).
- **« énigmes chasse au trésor enfant » :** autocomplétion DuckDuckGo, 8 variantes (« idées énigmes chasse au trésor », « chasse au trésor idée énigmes », « énigme pour une chasse au trésor »…). Utile pour le contenu du kit et pour un futur article de blog. Recherche HTML non tentée séparément (budget de collecte, résultat déjà partiellement couvert par 2bis.1/2bis.2).
- **Requête ombrelle « jeux/activités halloween à imprimer » (pour le hub `/halloween`, section 1bis) :** autocomplétion DuckDuckGo, 8 variantes sur deux formulations (« jeux halloween enfant à imprimer » → « activité enfant halloween à imprimer », « jeux pour halloween enfant »… ; « activité halloween enfant » → variantes par âge). Confirme l'existence d'une recherche générique au-delà du seul escape game ou de la seule chasse au trésor. **Recherche HTML bloquée par un captcha** : concurrents non vérifiés pour cette requête précise.
- **Requêtes ombrelle « jeux anniversaire enfant à imprimer » et « jeux de noël à imprimer enfant »** (pour évaluer si les futurs hubs anniversaire/Noël ont une requête générique correspondante) : autocomplétion DuckDuckGo confirmée (8 variantes chacune : « idées jeux anniversaire enfant », « jeux de noël en famille à imprimer », « activités noël à imprimer »…), mais **aucune vérification de concurrents** faite (hors périmètre de cette révision, priorité Halloween).

### 2bis.4 Concurrents identifiés (chasse au trésor), noms de domaine et thème observé — jamais de texte recopié
| Domaine | Thème observé | Source |
|---|---|---|
| `lesideesdusamedi.fr` | Chasse au trésor Halloween (thème sorcière) + page sommaire « toutes mes chasses au trésor gratuites » | Recherche HTML DuckDuckGo, 2 pages distinctes observées |
| `jeuxetcompagnie.fr` | Chasse au trésor Halloween, 4 formats PDF | Recherche HTML DuckDuckGo |
| `animyjob.com` | Guide chasse au trésor Halloween + 16 kits PDF génériques | Recherche HTML DuckDuckGo, 2 pages distinctes |
| `jouerlegalite.fr` | Chasse au trésor Halloween gratuite PDF | Recherche HTML DuckDuckGo |
| `unjourunjeu.fr` | Chasse au trésor Halloween + chasses génériques (dinosaure, licorne, super-héros) | Recherche HTML DuckDuckGo, 2 pages distinctes |
| `chassemagique.com` | Collection Halloween dédiée (fantômes, citrouilles, 5-10 ans) | Recherche HTML DuckDuckGo |
| `momes.parents.fr` | Chasse au trésor Halloween | Recherche HTML DuckDuckGo |
| `mysterefeuilleciseaux.com` | Kit chasse au trésor générique par tranche d'âge (3-5, 6-8, 9-11 ans) — **déjà identifié en T1.13 v1** sous une requête escape game | Recherche HTML DuckDuckGo |
| `jeunesocentre.fr` | Guide chasse au trésor Halloween 3-10 ans | Recherche HTML DuckDuckGo |
| `escape-kit.com` | Chasse au trésor générique à imprimer + générateur (mentionne l'anniversaire enfant) — **déjà identifié en T1.13 v1** sous une requête escape game | Recherche HTML DuckDuckGo |
| `tidudi.fr` | Chasses au trésor prêtes à imprimer | Recherche HTML DuckDuckGo |
| `chasse-tresor.net` | Chasse au trésor générique + page anniversaire dédiée | Recherche HTML DuckDuckGo |
| `petiteschassesautresor.com` | 101 kits gratuits à imprimer — **déjà identifié en T1.13 v1** sous « escape game halloween enfant » | Recherche HTML DuckDuckGo |
| `assolaribambelle.fr` | Article blog sur la chasse au trésor à imprimer | Recherche HTML DuckDuckGo |

### 2bis.5 Comparaison qualitative avec les escape games (T1.13 v1)
- **Richesse de l'autocomplétion :** comparable pour Halloween (6-8 variantes des deux côtés) ; l'escape game générique (« escape game à imprimer ») avait montré une autocomplétion un peu plus large que « chasse au trésor à imprimer », mais l'écart est faible et **ne doit pas être présenté comme un volume chiffré** (aucune donnée de volume disponible).
- **Concurrence :** au moins **3 domaines apparaissent sur les deux recherches** (`mysterefeuilleciseaux.com`, `petiteschassesautresor.com`, `escape-kit.com`) : ce sont des sites généralistes du jeu imprimable, pas spécialisés sur un seul type. Les concurrents 100 % spécialisés « chasse au trésor » identifiés ici (`chassemagique.com`, `lesideesdusamedi.fr`, `chasse-tresor.net`, `tidudi.fr`) sont aussi nombreux que les spécialistes « escape game » ou « murder party » repérés en T1.13 v1 → **estimation qualitative : la chasse au trésor Halloween est un marché au moins aussi actif que l'escape game Halloween**, ce qui justifie une page type dédiée (section 1bis).
- **Positionnement gratuit :** comme pour les escape games, la quasi-totalité des concurrents chasse au trésor met en avant le **gratuit** (PDF gratuits à télécharger). Notre offre étant payante, le positionnement doit être clair dès le titre/la meta description de `/chasse-au-tresor-halloween`, comme déjà noté pour `/jeux` et `/escape-game-halloween`.

### 2bis.6 Limites de cette collecte (honnêteté)
- **Google** : non testé directement dans cette révision (déjà écarté en T1.13 v1 pour cause de captcha) ; pas de raison de penser que ça a changé.
- **Bing** : testé pour deux requêtes (« organiser une chasse au trésor à la maison », « chasse au trésor anniversaire enfant à imprimer ») — résultats **non pertinents** (Bing a interprété « chasse » comme la chasse au gibier, y compris avec guillemets et requête complète) : **écarté comme source pour la chasse au trésor**, contrairement à l'escape game où Bing avait été utile pour quelques requêtes en T1.13 v1.
- **DuckDuckGo HTML** : plusieurs requêtes bloquées par un captcha après quelques recherches successives (limite de fréquence, comportement normal d'un moteur qui protège son autocomplétion) — précisément indiqué requête par requête ci-dessus plutôt que masqué.
- **Aucun volume de recherche chiffré nulle part** dans cette section, conformément à AGENTS.md section 3 et à la méthode de la section 2.

---

## 3. Rôle de chaque type de page (rappel T1.13)
- **Pages hub saison/public** (section 1bis) : requête ombrelle, atterrissage généraliste pour les réseaux sociaux et le maillage interne vers les pages type.
- **Pages type** (2.3 à 2.10, et 2bis pour la chasse au trésor) : requêtes principales dédiées, volume le plus large par combinaison type + saison/public documentée.
- **Fiches jeux** (2.12) : requêtes longues et précises, alimentées uniquement par les vraies fiches (T1.5), désormais aussi pour le type `chasse-au-tresor` (D15).
- **Blog** (2.13) : questions pratiques, maillage interne, aucune promesse commerciale directe. Le futur article « organiser une chasse au trésor » (2bis.3) est planifié mais pas rédigé — voir `docs/seo/calendrier.md`.

## 4. Synthèse des limites (à ne pas perdre de vue)
- Aucune donnée de volume chiffrée n'a été utilisée nulle part dans ce document, y compris dans le complément chasse au trésor (section 2bis).
- Google Trends et l'autocomplétion Google n'étaient pas accessibles au moment de la collecte initiale (captcha) ; toutes les autocomplétions viennent de DuckDuckGo, un signal indicatif mais **pas strictement représentatif du comportement des internautes sur Google** (moteur dominant en France). Pour le complément chasse au trésor, Bing s'est en plus révélé inutilisable (résultats hors sujet, voir 2bis.6).
- **Recherche chasse au trésor incomplète pour Noël, Saint-Valentin, Pâques, anniversaire ado et EVJF/EVG** (priorité donnée à Halloween par D15, voir section 1bis « ce qui reste à compléter »).
- Avant de lancer une campagne payante ou de prioriser fortement une collection, une vérification avec un outil de mots-clés (Google Keyword Planner, ou équivalent) reste recommandée — hors périmètre de T1.13 (pas d'outil payant, pas de compte à créer sans l'équipe, AGENTS.md section 3).
