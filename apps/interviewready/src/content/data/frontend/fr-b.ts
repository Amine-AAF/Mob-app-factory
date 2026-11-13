import type { QuestionText, TextTable } from '@/types/content';

/** Questions frontend 026-050 : React Native, HTML et CSS, gestion d'état, performance. */
export const frB: TextTable<QuestionText> = {
  "fe-026": {
    question: "Qu'est-ce que React Native, et en quoi est-ce différent de la création d'un site web avec React ?",
    intent: "Le recruteur vérifie que vous comprenez ce que React Native affiche réellement et ce qui change par rapport au web.",
    expectedAnswer:
      "React Native reprend le même modèle que React, avec les composants, les props, le state et les hooks, mais affiche de véritables vues natives au lieu d'éléments HTML. On utilise des composants comme View, Text, Image et ScrollView, et les styles sont des objets JavaScript reprenant un sous-ensemble de CSS, mis en page avec Flexbox par défaut en direction colonne. Il n'y a ni DOM ni cascade CSS. Les fonctionnalités de la plateforme, comme l'appareil photo ou les notifications, sont accessibles via des modules natifs. Une seule base de code peut cibler Android et iOS, avec du code spécifique à chaque plateforme si nécessaire grâce à Platform.OS ou aux fichiers .android.js / .ios.js. Des outils comme Expo simplifient la compilation, les mises à jour et l'accès aux API de l'appareil.",
    explanation:
      "Les connaissances React sont transférables, mais la cible de rendu, le style et l'intégration avec la plateforme diffèrent. Connaître ces différences évite d'importer des réflexes du web dans du code mobile.",
    tips: ["Mentionnez les vues natives et l'absence de DOM.", "Expliquez comment les différences entre plateformes sont gérées."],
    commonMistakes: ["Présenter React Native comme un framework basé sur une WebView.", "S'attendre à des fonctionnalités CSS comme la cascade ou les mises en page en grille."],
    followUpQuestions: ["Comment partageriez-vous du code entre une application web React et une application React Native ?", "Qu'apporte Expo ?"],
  },
  "fe-027": {
    question: "Que change la « nouvelle architecture » de React Native ?",
    intent: "Le recruteur vérifie que vos connaissances du fonctionnement interne de React Native sont à jour, ainsi que leur impact sur la performance.",
    expectedAnswer:
      "L'ancienne architecture faisait communiquer JavaScript et le code natif via un bridge asynchrone qui sérialisait les messages en JSON, ce qui ajoutait de la latence et rendait les appels synchrones impossibles. La nouvelle architecture, activée par défaut depuis React Native 0.76, le remplace par JSI, la JavaScript Interface, qui permet à JavaScript de détenir des références directes vers des objets C++ et d'appeler des méthodes natives de façon synchrone. Au-dessus de JSI, les TurboModules chargent les modules natifs à la demande, avec des interfaces typées générées par Codegen, et Fabric est le nouveau moteur de rendu, compatible avec les fonctionnalités concurrentes de React et offrant une mise en page plus cohérente. Résultat : un démarrage plus rapide, des interactions plus fluides et moins de coûts de sérialisation. En revanche, les bibliothèques doivent être compatibles, ce qui compte lors des montées de version.",
    explanation:
      "La suppression du bridge JSON est le changement central. Le connaître explique les gains de performance et l'importance de la compatibilité des bibliothèques lors des mises à jour.",
    tips: ["Expliquez d'abord le problème du bridge.", "Citez JSI, TurboModules, Fabric et Codegen."],
    commonMistakes: ["Décrire le bridge comme le principal mécanisme de communication dans les versions récentes."],
    followUpQuestions: ["Comment vérifieriez-vous la compatibilité d'une bibliothèque avec la nouvelle architecture ?", "Qu'est-ce que Hermes ?"],
  },
  "fe-028": {
    question: "Comment affichez-vous efficacement de longues listes dans React Native ?",
    intent: "Le recruteur vérifie vos compétences pratiques en performance mobile, où les longues listes sont fréquentes.",
    expectedAnswer:
      "J'utiliserais FlatList ou SectionList, ou une alternative plus rapide comme FlashList, plutôt que de faire un map des éléments dans une ScrollView, car ces composants virtualisent : ils n'affichent que les éléments proches de la zone visible et recyclent ou démontent les autres. Les bonnes pratiques consistent à fournir un keyExtractor stable, à garder renderItem léger en enveloppant les composants d'élément dans React.memo, à passer des callbacks stables et à utiliser getItemLayout quand les éléments ont une hauteur fixe, pour que la liste évite les mesures. Des props comme initialNumToRender, windowSize et maxToRenderPerBatch ajustent le compromis entre la mémoire et les zones vides lors d'un défilement rapide. Les images doivent être correctement dimensionnées et mises en cache. Je mesurerais avec le moniteur de performance et le profilage pour savoir si c'est le thread JavaScript ou le thread UI qui perd des images.",
    explanation:
      "La virtualisation est l'idée clé. Le reste consiste à réduire le coût de chaque élément et à éviter les re-renders inutiles.",
    tips: ["Expliquez la virtualisation.", "Mentionnez les éléments mémoïsés et getItemLayout.", "Citez FlashList comme option."],
    commonMistakes: ["Afficher des centaines d'éléments dans une ScrollView.", "Créer de nouvelles fonctions et de nouveaux objets en ligne pour chaque élément à chaque rendu."],
    followUpQuestions: ["Qu'est-ce qui provoque des zones vides lors d'un défilement rapide ?", "Comment mettriez-vous en place un chargement infini ?"],
  },
  "fe-029": {
    question: "Comment gérez-vous la navigation et les deep links dans une application React Native ?",
    intent: "Le recruteur vérifie votre connaissance des modèles de navigation mobile et de l'intégration avec le système d'exploitation.",
    expectedAnswer:
      "La plupart des applications utilisent React Navigation, ou Expo Router, qui s'appuie dessus avec un routage basé sur les fichiers. On combine plusieurs navigateurs : un stack navigator pour les écrans de détail, des onglets pour les sections principales et parfois un drawer. Chaque écran reçoit des paramètres de route typés, et un état comme l'authentification détermine quel groupe d'écrans est affiché. Les deep links ouvrent un écran précis à partir d'une URL, soit avec un schéma personnalisé comme myapp://order/42, soit avec un domaine web vérifié via les Android App Links et les Universal Links d'iOS. La bibliothèque de navigation associe les chemins d'URL aux écrans ; avec Expo Router, la structure des fichiers définit automatiquement cette correspondance. Je gérerais aussi les liens qui arrivent quand l'application est fermée ou que l'utilisateur n'est pas connecté, par exemple en mémorisant la destination et en y naviguant après la connexion.",
    explanation:
      "La structure de navigation et les deep links influencent l'expérience utilisateur et les campagnes marketing. Les cas limites, comme les démarrages à froid et l'authentification, sont là où les bugs apparaissent le plus souvent.",
    tips: ["Mentionnez les stack navigators et les tab navigators.", "Distinguez les schémas personnalisés des liens vérifiés.", "Gérez le cas de l'utilisateur déconnecté."],
    commonMistakes: ["Passer de gros objets en paramètres de navigation au lieu d'identifiants.", "Ignorer les deep links reçus lors d'un démarrage à froid."],
    followUpQuestions: ["Comment vérifiez-vous les Android App Links ?", "Comment typeriez-vous les paramètres de navigation ?"],
  },
  "fe-030": {
    question: "Quelles options de stockage local utiliseriez-vous dans une application mobile, et pour quelles données ?",
    intent: "Le recruteur vérifie votre approche de la conception offline-first et votre sensibilité à la sécurité sur mobile.",
    expectedAnswer:
      "Pour de petites préférences clé-valeur, comme le thème ou l'état de l'onboarding, AsyncStorage est simple et asynchrone, tandis que MMKV est beaucoup plus rapide et synchrone. Pour des données structurées qui nécessitent des requêtes, des relations ou de gros volumes, comme du contenu hors ligne ou un historique, SQLite, via expo-sqlite ou une bibliothèque comme WatermelonDB ou Drizzle, est le bon choix, avec des migrations pour faire évoluer le schéma. Les données sensibles comme les jetons d'authentification doivent aller dans un stockage sécurisé adossé à l'Android Keystore ou au Keychain d'iOS, par exemple expo-secure-store, jamais dans un simple AsyncStorage. Les fichiers volumineux ont leur place dans le système de fichiers, seul leur chemin étant stocké en base. Je penserais aussi aux sauvegardes, à la suppression des données lors de la déconnexion et à ce qui se passe quand une migration échoue.",
    explanation:
      "Choisir le stockage selon le type, le volume et la sensibilité des données est la clé. Mentionner le stockage sécurisé pour les jetons est indispensable.",
    tips: ["Séparez préférences, données structurées, secrets et fichiers.", "Mentionnez les migrations pour SQLite.", "Insistez sur le stockage sécurisé des jetons."],
    commonMistakes: ["Stocker les jetons dans AsyncStorage.", "Stocker de gros blobs JSON dans un stockage clé-valeur et les parser à chaque démarrage."],
    followUpQuestions: ["Comment synchroniseriez-vous les données locales avec un serveur ?", "Comment testez-vous les migrations de base de données ?"],
  },
  "fe-031": {
    question: "Un écran React Native saccade pendant les animations et le défilement. Comment enquêtez-vous et comment corrigez-vous le problème ?",
    intent: "Le recruteur évalue votre capacité à diagnostiquer des problèmes de performance mobile avancés et votre connaissance des threads de React Native.",
    expectedAnswer:
      "React Native dispose d'un thread JavaScript, où s'exécutent React et la logique métier, et d'un thread UI, où sont dessinées les vues natives ; des images sont perdues dès que l'un des deux dépasse environ 16 millisecondes à 60 images par seconde. J'ouvrirais d'abord le moniteur de performance pour voir quelle fréquence d'images chute, puis je profilerais avec le React DevTools Profiler, le profilage Hermes, les outils qui remplacent Flipper ou les profileurs natifs d'Android Studio. Si le thread JavaScript est saturé, les causes possibles sont des re-renders coûteux, de grosses mises à jour d'état pendant le défilement, un parsing JSON synchrone ou des calculs lourds ; les corrections sont la mémoïsation, le rapprochement de l'état de l'endroit où il est utilisé, InteractionManager ou le report du travail, et le découpage des grosses mises à jour. Pour les animations, j'utiliserais React Native Reanimated, dont les worklets exécutent les animations sur le thread UI, et Gesture Handler pour les gestes, afin que les animations restent fluides même quand JavaScript est occupé ; l'API Animated intégrée avec useNativeDriver aide aussi pour les propriétés prises en charge. Côté thread UI, les causes incluent l'overdraw, les grandes images, les ombres et un trop grand nombre de vues ; on corrige en aplatissant la hiérarchie de vues, en redimensionnant les images et en les mettant en cache. Je testerais toujours sur un appareil Android d'entrée de gamme avec un build de release, car les builds de développement sont beaucoup plus lents.",
    explanation:
      "Identifier le thread surchargé détermine la correction. Les candidats de niveau avancé connaissent les worklets de Reanimated et insistent sur les builds de release testés sur de vrais appareils d'entrée de gamme.",
    tips: ["Expliquez les deux threads et le budget par image.", "Mentionnez Reanimated et les animations via le native driver.", "Testez en mode release sur des appareils d'entrée de gamme."],
    commonMistakes: ["Mesurer la performance en mode développement.", "Exécuter les animations avec setState sur le thread JavaScript."],
    followUpQuestions: ["Qu'est-ce qu'un worklet ?", "Comment réduiriez-vous le temps de démarrage de l'application ?"],
  },
  "fe-032": {
    question: "Comment mettriez-vous en place le processus de build et de publication d'une application React Native ?",
    intent: "Le recruteur évalue votre maîtrise, à un niveau senior, de la livraison mobile : environnements, signature, mises à jour et gestion des risques.",
    expectedAnswer:
      "J'utiliserais Expo avec EAS Build, ou un pipeline de CI avec Fastlane pour les projets bare, afin que les builds soient reproductibles et que les clés de signature soient stockées de façon sécurisée plutôt que sur l'ordinateur d'un développeur. Je définirais des profils de build pour le développement, la preview et la production, avec des identifiants d'application, une configuration et des endpoints d'API distincts, injectés via des variables d'environnement, sans jamais coder de secrets en dur dans le bundle. Chaque merge déclencherait la vérification des types, les tests et un build du bundle JavaScript ; les versions seraient taguées et numérotées, avec des version codes incrémentés automatiquement. Pour la distribution, les pistes de test interne et les déploiements progressifs sur Google Play, ainsi que TestFlight sur iOS, permettent de publier auprès d'un pourcentage d'utilisateurs et de surveiller le taux de crash avec des outils comme Sentry ou Crashlytics avant d'aller plus loin. Les mises à jour over-the-air, comme EAS Update, permettent de livrer des correctifs JavaScript sans revue du store, mais uniquement pour un code natif compatible : je versionnerais donc soigneusement les runtimes, en gardant à l'esprit les règles des stores. Je prévoirais aussi une stratégie de rollback et une version minimale supportée de l'application en cas de changements incompatibles de l'API.",
    explanation:
      "Une publication mobile ne peut pas être annulée instantanément : les déploiements progressifs, le monitoring et un usage prudent des mises à jour OTA sont donc essentiels. Cette réponse montre une réflexion de bout en bout sur la livraison.",
    tips: ["Couvrez environnements, signature, CI, distribution et monitoring.", "Expliquez les limites des mises à jour over-the-air.", "Mentionnez les déploiements progressifs."],
    commonMistakes: ["Stocker les clés de signature ou les secrets d'API dans le dépôt.", "Utiliser les mises à jour OTA pour modifier le comportement natif."],
    followUpQuestions: ["Comment obligez-vous les utilisateurs à mettre à jour quand une API casse la compatibilité ?", "Que mettriez-vous dans une checklist de publication ?"],
  },
  "fe-033": {
    question: "Qu'est-ce que le HTML sémantique, et pourquoi est-ce important ?",
    intent: "Le recruteur vérifie vos bases du web, qui influencent l'accessibilité, le SEO et la maintenabilité.",
    expectedAnswer:
      "Le HTML sémantique consiste à utiliser des éléments qui décrivent le sens du contenu, comme header, nav, main, article, section, button, h1 à h6 et label, au lieu de div et span génériques partout. Les lecteurs d'écran s'appuient sur ces éléments pour annoncer la structure et permettre de naviguer par titres ou par repères. Un vrai button peut recevoir le focus et fonctionne au clavier par défaut, contrairement à une div cliquable. Les moteurs de recherche comprennent mieux la page, et les autres développeurs lisent la structure plus facilement.",
    explanation:
      "La sémantique apporte gratuitement du sens et des comportements intégrés. Beaucoup de problèmes d'accessibilité viennent de la reconstruction d'éléments natifs avec des div.",
    tips: ["Donnez l'exemple du button face à une div cliquable.", "Mentionnez les lecteurs d'écran et la navigation au clavier."],
    commonMistakes: ["Utiliser les titres pour leur taille plutôt que pour la structure.", "Construire des boutons et des liens avec des div."],
    followUpQuestions: ["Quand faut-il utiliser un lien plutôt qu'un bouton ?", "Que sont les landmarks ARIA ?"],
  },
  "fe-034": {
    question: "Quelles bases de l'accessibilité web appliquez-vous dans chaque projet ?",
    intent: "Le recruteur vérifie que vous concevez des interfaces utilisables par tous et que vous connaissez les principales recommandations.",
    expectedAnswer:
      "Je commence par du HTML sémantique et une hiérarchie de titres correcte. Chaque image a un texte alternatif, vide si elle est décorative. Chaque champ de formulaire a un libellé visible, et les erreurs sont décrites par du texte, pas seulement par la couleur. Les textes et les contrôles respectent les ratios de contraste des WCAG, au moins 4,5:1 pour du texte normal. Tout fonctionne au clavier, avec un indicateur de focus visible et un ordre de tabulation logique, et le focus est géré dans les boîtes de dialogue. Les zones tactiles sont suffisamment grandes. J'utilise les attributs ARIA uniquement quand les éléments natifs ne suffisent pas, et je teste avec un lecteur d'écran et des outils automatisés comme axe ou Lighthouse.",
    explanation:
      "L'accessibilité fait partie de la qualité et constitue, dans de nombreux pays, une obligation légale. La plupart des problèmes s'évitent avec quelques habitudes appliquées systématiquement.",
    tips: ["Mentionnez les WCAG et le contraste.", "Couvrez le clavier, les libellés, les textes alternatifs et les tests."],
    commonMistakes: ["Supprimer le contour de focus sans le remplacer.", "Utiliser ARIA pour rafistoler des éléments qui devraient simplement être natifs."],
    followUpQuestions: ["Comment rendez-vous une boîte de dialogue modale accessible ?", "Quelle est la première règle d'ARIA ?"],
  },
  "fe-035": {
    question: "Expliquez le modèle de boîte CSS et box-sizing.",
    intent: "Le recruteur vérifie une base de la mise en page qui explique de nombreuses surprises de dimensionnement.",
    expectedAnswer:
      "Chaque élément est une boîte composée du contenu, du padding, de la bordure et de la marge. Avec la valeur par défaut box-sizing: content-box, la largeur définie ne s'applique qu'au contenu : ajouter du padding ou une bordure rend donc l'élément plus large que prévu. Une boîte de 200px avec 20px de padding fait ainsi 240px de large. Avec box-sizing: border-box, la largeur inclut le padding et la bordure, ce qui est plus simple à raisonner, et beaucoup de projets l'appliquent globalement. Les marges sont à l'extérieur de la boîte, et les marges verticales entre blocs peuvent fusionner en une seule.",
    explanation:
      "Comprendre quelles parties comptent dans la largeur explique les mises en page qui débordent, et c'est pourquoi border-box est une réinitialisation courante.",
    tips: ["Donnez un exemple chiffré.", "Mentionnez la fusion des marges."],
    commonMistakes: ["Oublier le padding dans le calcul des largeurs.", "Confondre padding et margin."],
    followUpQuestions: ["Quand les marges fusionnent-elles ?", "Quelle est la différence entre display block et inline-block ?"],
  },
  "fe-036": {
    question: "Quand utiliseriez-vous Flexbox et quand utiliseriez-vous CSS Grid ?",
    intent: "Le recruteur vérifie vos compétences en mise en page et votre capacité à choisir le bon outil.",
    expectedAnswer:
      "Flexbox est unidimensionnel : il dispose les éléments le long d'une ligne ou d'une colonne et répartit l'espace entre eux, ce qui est idéal pour les barres de navigation, les barres d'outils, le centrage de contenu ou l'alignement d'éléments dans une carte. Grid est bidimensionnel : il définit les lignes et les colonnes ensemble, ce qui permet de placer les éléments dans les deux directions et convient aux mises en page de pages, aux tableaux de bord et aux galeries. Des fonctionnalités de Grid comme grid-template-areas, les unités fr et repeat(auto-fill, minmax(200px, 1fr)) créent des mises en page responsives avec très peu de code. Les deux se combinent bien : Grid pour la structure générale et Flexbox à l'intérieur des composants. La propriété gap fonctionne dans les deux.",
    explanation:
      "La distinction entre unidimensionnel et bidimensionnel est la façon la plus claire de choisir.",
    example: ".gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }",
    tips: ["Énoncez la règle unidimensionnel contre bidimensionnel.", "Montrez un exemple de Grid responsive."],
    commonMistakes: ["Imbriquer des conteneurs flex pour simuler une grille.", "Utiliser des floats pour la mise en page dans du nouveau code."],
    followUpQuestions: ["Comment centreriez-vous un élément horizontalement et verticalement ?", "Qu'est-ce que subgrid ?"],
  },
  "fe-037": {
    question: "Comment construisez-vous une interface responsive ?",
    intent: "Le recruteur vérifie vos techniques concrètes pour prendre en charge différentes tailles d'écran et les préférences des utilisateurs.",
    expectedAnswer:
      "Je conçois en mobile-first : des styles de base pour les petits écrans, puis des media queries en min-width pour s'adapter aux plus grands. J'utilise des mises en page fluides avec Flexbox et Grid, des unités relatives comme rem, % et les unités de viewport, ainsi que des fonctions comme clamp() pour une typographie qui s'adapte progressivement. Les container queries permettent à un composant de s'adapter à l'espace dont il dispose réellement plutôt qu'à tout l'écran, ce qui est préférable pour les composants réutilisables. Les images utilisent des sources responsives avec srcset et sizes, pour que les petits écrans téléchargent des fichiers plus légers. Je respecte les préférences de l'utilisateur comme la taille de police, prefers-reduced-motion et prefers-color-scheme, et je teste sur de vrais appareils et dans différentes orientations, pas seulement en redimensionnant le navigateur.",
    explanation:
      "Le responsive design repose sur des mises en page fluides, des composants adaptés à leur contexte et le respect des réglages de l'utilisateur, pas seulement sur quelques breakpoints.",
    tips: ["Mentionnez le mobile-first et les container queries.", "Incluez les images responsives et les préférences utilisateur."],
    commonMistakes: ["Utiliser des largeurs fixes en pixels partout.", "Ignorer la taille de police choisie par l'utilisateur en utilisant des px pour le texte."],
    followUpQuestions: ["Quelle est la différence entre rem et em ?", "Comment fonctionnent les container queries ?"],
  },
  "fe-038": {
    question: "Comment organiseriez-vous le CSS d'une grande application sur laquelle travaillent plusieurs équipes ?",
    intent: "Le recruteur évalue votre maîtrise de l'architecture frontend avancée : contrôle de la spécificité, design tokens et cohérence à grande échelle.",
    expectedAnswer:
      "À grande échelle, les principaux risques sont les styles globaux qui entrent en conflit, les guerres de spécificité et l'incohérence du design. Je commencerais par des design tokens, des variables nommées pour les couleurs, les espacements, la typographie et les arrondis, définies une seule fois, par exemple sous forme de propriétés personnalisées CSS, et utilisées partout, ce qui facilite aussi les thèmes comme le mode sombre. Les styles des composants doivent être isolés, avec CSS Modules, une approche utility-first comme Tailwind ou une solution CSS-in-JS sans coût à l'exécution, pour qu'ils ne puissent pas fuir d'un composant à l'autre. Je garderais une spécificité faible et uniforme, j'éviterais !important et les ID dans les sélecteurs, et j'utiliserais les cascade layers pour contrôler l'ordre entre reset, base, composants et utilitaires. Une bibliothèque de composants partagée dans Storybook documenterait leurs usages et leurs états. Le linting avec Stylelint et les tests de régression visuelle détectent les problèmes tôt. Le choix de l'outil compte moins que l'adoption d'une approche cohérente, validée et appliquée par toutes les équipes.",
    explanation:
      "Un CSS qui passe à l'échelle repose sur les tokens, l'isolation, une spécificité maîtrisée et des composants partagés. Les candidats de niveau avancé connaissent des outils modernes comme les cascade layers.",
    tips: ["Partez des problèmes : fuites, spécificité, incohérence.", "Mentionnez les design tokens et les cascade layers.", "Incluez l'outillage et les tests visuels."],
    commonMistakes: ["Mélanger plusieurs approches de style sans règles.", "Résoudre les conflits en ajoutant !important."],
    followUpQuestions: ["Que sont les cascade layers ?", "Comment mettriez-vous en place un mode sombre avec des tokens ?"],
  },
  "fe-039": {
    question: "Comment décidez-vous si un état doit être local ou global ?",
    intent: "Le recruteur vérifie un jugement de base, mais important, en gestion d'état.",
    expectedAnswer:
      "Je garde l'état aussi local que possible : si un seul composant utilise une valeur, comme l'ouverture d'un menu déroulant, elle appartient à ce composant. Si quelques composants proches en ont besoin, je la remonte vers leur parent commun le plus proche. L'état global est réservé aux données réellement nécessaires dans de nombreuses parties éloignées de l'application, comme l'utilisateur authentifié, le thème ou un panier. Les données provenant du serveur sont généralement mieux gérées par une bibliothèque de récupération et de mise en cache que par un store global. Garder l'état local rend les composants plus faciles à comprendre et évite des re-renders inutiles.",
    explanation:
      "L'abus d'état global est une cause fréquente de complexité. Commencer en local et ne remonter l'état qu'en cas de besoin garde une conception simple.",
    tips: ["Donnez un exemple de chaque cas.", "Mentionnez l'état serveur comme une catégorie à part."],
    commonMistakes: ["Mettre chaque valeur dans un store global.", "Dupliquer les données serveur dans l'état global."],
    followUpQuestions: ["Qu'est-ce que le prop drilling, et comment l'éviter ?", "Où stockeriez-vous l'état d'un formulaire ?"],
  },
  "fe-040": {
    question: "À quoi sert l'API Context de React, et quelles sont ses limites ?",
    intent: "Le recruteur vérifie que vous voyez Context comme un mécanisme d'injection de dépendances plutôt que comme un gestionnaire d'état complet.",
    expectedAnswer:
      "Context transmet une valeur à travers l'arbre de composants sans prop drilling, ce qui est idéal pour des valeurs lues à de nombreux endroits et qui changent rarement, comme le thème, l'utilisateur courant, la locale ou des instances de services. Sa limite est la performance : chaque composant qui consomme un contexte se re-rend quand sa valeur change, même s'il n'en utilise qu'une partie, et passer un nouvel objet comme value à chaque rendu re-rend tous les consommateurs. Pour limiter cela, on découpe les contextes par responsabilité, on mémoïse la valeur et on sépare l'état et le dispatch dans deux contextes. Pour un état complexe ou qui change souvent, une bibliothèque dédiée comme Zustand, Redux Toolkit ou Jotai est généralement préférable, car les consommateurs peuvent s'abonner à des portions précises.",
    explanation:
      "Context résout le prop drilling, pas les problèmes de performance de la gestion d'état. Savoir quand passer à un store montre une expérience concrète.",
    tips: ["Citez de bons cas d'usage.", "Expliquez le problème des re-renders et les solutions."],
    commonMistakes: ["Placer un gros objet qui change souvent dans un contexte unique.", "Créer l'objet value en ligne sans mémoïsation."],
    followUpQuestions: ["Comment les sélecteurs de Zustand ou de Redux évitent-ils les re-renders ?", "Comment testeriez-vous un composant qui utilise un contexte ?"],
  },
  "fe-041": {
    question: "Comment choisiriez-vous entre Redux Toolkit, Zustand et d'autres bibliothèques de gestion d'état ?",
    intent: "Le recruteur vérifie votre capacité à évaluer des outils selon les besoins du projet plutôt que par habitude.",
    expectedAnswer:
      "Je commencerais par lister les besoins de l'application : la quantité d'état client partagé, le nombre de développeurs, la nécessité de conventions strictes, d'outils de débogage, de middleware ou de persistance. Redux Toolkit convient bien aux grandes applications et aux grandes équipes : il offre une structure prévisible avec des slices et des reducers, d'excellentes DevTools avec le débogage time-travel, et RTK Query pour les données serveur, au prix de davantage de concepts. Zustand est léger et simple : un store est un hook, les composants ne sélectionnent que les portions dont ils ont besoin et il y a peu de boilerplate, ce qui convient aux petites et moyennes applications. Les bibliothèques atomiques comme Jotai conviennent à un état composé de nombreux éléments indépendants. Dans beaucoup d'applications, une bibliothèque d'état serveur associée à de l'état local supprime la majeure partie du besoin d'un store global. Je tiendrais aussi compte des connaissances existantes de l'équipe et de la maintenance à long terme de la bibliothèque.",
    explanation:
      "Il n'existe pas de bibliothèque universellement meilleure. Les recruteurs attendent des choix fondés sur des critères et la conscience que l'état serveur change la donne.",
    tips: ["Partez des besoins.", "Donnez un cas d'usage adapté à chaque bibliothèque.", "Mentionnez les bibliothèques d'état serveur."],
    commonMistakes: ["Choisir une bibliothèque parce qu'elle est populaire.", "Ajouter un store global à une petite application qui n'en a pas besoin."],
    followUpQuestions: ["Comment persistez-vous une partie de l'état ?", "Comment migreriez-vous d'une bibliothèque à une autre ?"],
  },
  "fe-042": {
    question: "Quelle est la différence entre l'état serveur et l'état client, et comment gérez-vous l'état serveur ?",
    intent: "Le recruteur vérifie que vous connaissez les pratiques modernes de récupération de données et les enjeux de mise en cache.",
    expectedAnswer:
      "L'état client appartient à l'interface et n'existe que dans l'application, comme une modale ouverte ou un onglet sélectionné. L'état serveur est une copie en cache de données dont le serveur est propriétaire : elle peut devenir obsolète, d'autres utilisateurs peuvent la modifier, et il faut la récupérer, la mettre en cache, la rafraîchir et l'invalider. La gérer manuellement avec useEffect et des stores globaux entraîne des requêtes dupliquées, des race conditions et des données périmées. Des bibliothèques comme TanStack Query, SWR ou RTK Query gèrent la mise en cache par clé de requête, la déduplication des requêtes simultanées, le rafraîchissement en arrière-plan, les nouvelles tentatives, la pagination et l'invalidation après les mutations. Par exemple, après la création d'un commentaire, invalider la requête des commentaires déclenche un nouveau chargement, et la liste reste à jour.",
    explanation:
      "Séparer les deux types d'état simplifie considérablement le code. Les bibliothèques d'état serveur résolvent des problèmes que la plupart des équipes réimplémentent sinon de façon approximative.",
    tips: ["Définissez clairement les deux types.", "Listez ce que gère une bibliothèque d'état serveur.", "Donnez un exemple d'invalidation."],
    commonMistakes: ["Copier les données récupérées dans un store global et les synchroniser à la main.", "Récupérer les mêmes données dans plusieurs composants sans mise en cache."],
    followUpQuestions: ["Qu'est-ce que stale-while-revalidate ?", "Comment géreriez-vous la pagination avec une bibliothèque de requêtes ?"],
  },
  "fe-043": {
    question: "Comment mettez-vous en œuvre des mises à jour optimistes, et comment gérez-vous les échecs ?",
    intent: "Le recruteur évalue votre maîtrise avancée de l'expérience utilisateur et de la cohérence des données côté client.",
    expectedAnswer:
      "Une mise à jour optimiste affiche immédiatement le résultat attendu, avant la confirmation du serveur, pour donner une impression d'instantanéité, par exemple en marquant une tâche comme terminée ou en ajoutant un « j'aime ». Les étapes sont les suivantes : annuler les requêtes en cours sur les mêmes données pour qu'elles n'écrasent pas la modification, enregistrer un instantané de l'état actuel, appliquer la modification localement, envoyer la requête et, en cas d'erreur, restaurer l'instantané et afficher un message clair ; en cas de succès ou à la fin de la requête, recharger les données ou les réconcilier avec la réponse du serveur, pour remplacer les données temporaires comme un identifiant généré côté client. Avec TanStack Query, cela correspond à onMutate, onError et onSettled ; React 19 propose useOptimistic pour des flux similaires. Cette approche convient quand le taux de succès est élevé et que l'action est facile à annuler. Pour des actions critiques comme les paiements, j'afficherais plutôt un état en attente. Je gérerais aussi les modifications concurrentes, par exemple avec des numéros de version, et je rendrais l'opération idempotente pour que les nouvelles tentatives soient sans risque.",
    explanation:
      "Une interface optimiste exige un plan de rollback, une réconciliation et un choix réfléchi des cas d'usage. Les réponses avancées abordent la concurrence et l'idempotence.",
    tips: ["Décrivez l'instantané, l'application, le rollback et la réconciliation.", "Dites quand ne pas utiliser les mises à jour optimistes.", "Mentionnez la concurrence et l'idempotence."],
    commonMistakes: ["Ne pas revenir en arrière en cas d'échec.", "Utiliser des mises à jour optimistes pour des actions irréversibles ou à haut risque."],
    followUpQuestions: ["Comment géreriez-vous une mise à jour optimiste hors ligne ?", "Que se passe-t-il si deux mises à jour optimistes se chevauchent ?"],
  },
  "fe-044": {
    question: "Comment concevriez-vous l'état et la synchronisation d'une application mobile offline-first ?",
    intent: "Le recruteur évalue vos compétences avancées en architecture pour des applications qui doivent fonctionner sans connexion.",
    expectedAnswer:
      "Je ferais de la base de données locale, par exemple SQLite, la source de vérité de l'interface : chaque écran lit les données locales et fonctionne de la même façon en ligne et hors ligne. Les actions de l'utilisateur écrivent immédiatement dans la base locale et ajoutent une entrée décrivant la modification dans une file outbox. Un moteur de synchronisation envoie les modifications en file au retour de la connexion, dans l'ordre, avec des nouvelles tentatives et un backoff, et chaque modification porte un identifiant unique pour que le serveur la traite de façon idempotente. Pour recevoir les mises à jour, l'application récupère les changements depuis son dernier curseur ou horodatage de synchronisation. Les conflits nécessitent une stratégie explicite, choisie par type de données : last-write-wins avec des horodatages serveur pour les champs simples, fusion champ par champ, ou présentation du conflit à l'utilisateur pour les contenus importants ; des numéros de version permettent de détecter les modifications concurrentes. J'afficherais aussi l'état de synchronisation dans l'interface, je gérerais les migrations de schéma des deux côtés, je limiterais la taille des données locales et je testerais des scénarios comme le mode avion, l'arrêt forcé de l'application pendant une synchronisation et les écarts d'horloge entre appareils. Des bibliothèques comme WatermelonDB ou PowerSync peuvent fournir une partie de ces briques.",
    explanation:
      "Offline-first signifie lectures locales, écritures mises en file, synchronisation idempotente et résolution explicite des conflits. Les candidats de niveau avancé parlent du test des scénarios de panne.",
    tips: ["Faites de la base locale la source de vérité.", "Décrivez la file outbox et la synchronisation idempotente.", "Expliquez les stratégies de résolution des conflits."],
    commonMistakes: ["Traiter le mode hors ligne comme un simple écran d'erreur.", "Se fier aux horloges des appareils pour ordonner les modifications."],
    followUpQuestions: ["Comment synchroniseriez-vous les suppressions ?", "Qu'afficheriez-vous aux utilisateurs pendant qu'une synchronisation est en attente ?"],
  },
  "fe-045": {
    question: "Quelles sont les causes les plus fréquentes de lenteur d'une page web ?",
    intent: "Le recruteur vérifie votre sensibilité de base à la performance et une première checklist raisonnable.",
    expectedAnswer:
      "Les causes les plus fréquentes sont des images volumineuses et non optimisées ; trop de JavaScript, qui doit être téléchargé, parsé et exécuté avant que la page devienne interactive ; du CSS ou des scripts bloquant le rendu dans le head ; trop de requêtes réseau ou des réponses serveur lentes ; des polices web chargées tardivement qui décalent le contenu ; et des scripts tiers comme les trackers ou les widgets de chat. Parmi les gains rapides : compresser et redimensionner les images dans des formats modernes comme WebP ou AVIF, charger en différé les images situées sous la ligne de flottaison, découper le JavaScript par route, différer les scripts non critiques, mettre en cache les ressources statiques et utiliser un CDN. Je mesurerais d'abord avec Lighthouse ou les DevTools du navigateur pour cibler le véritable goulot d'étranglement.",
    explanation:
      "La plupart des problèmes de performance viennent du fait d'envoyer trop de ressources ou de les charger dans le mauvais ordre. Mesurer d'abord évite de travailler à l'aveugle.",
    tips: ["Listez les causes par catégorie.", "Mentionnez la mesure avec Lighthouse ou les DevTools."],
    commonMistakes: ["Micro-optimiser le code alors que les images pèsent plusieurs mégaoctets."],
    followUpQuestions: ["Que signifie « bloquant le rendu » (render-blocking) ?", "Comment chargeriez-vous les polices efficacement ?"],
  },
  "fe-046": {
    question: "Que sont les Core Web Vitals, et comment les amélioreriez-vous ?",
    intent: "Le recruteur vérifie votre connaissance des métriques de performance centrées sur l'utilisateur, utilisées par Google et de nombreuses équipes.",
    expectedAnswer:
      "Les Core Web Vitals sont trois métriques mesurées sur de vrais utilisateurs. Le Largest Contentful Paint, LCP, mesure le chargement : le moment où le plus grand élément visible apparaît ; une bonne valeur est inférieure à 2,5 secondes. L'Interaction to Next Paint, INP, qui a remplacé le First Input Delay en 2024, mesure la réactivité : le délai entre une interaction et la mise à jour visuelle suivante ; une bonne valeur est inférieure à 200 millisecondes. Le Cumulative Layout Shift, CLS, mesure la stabilité visuelle ; une bonne valeur est inférieure à 0,1. Pour améliorer le LCP : optimiser et précharger l'image principale, réduire le temps de réponse du serveur et éviter les ressources qui bloquent le rendu. Pour améliorer l'INP : réduire les tâches JavaScript longues, découper le travail, éviter les re-renders coûteux et déplacer les calculs hors du thread principal. Pour améliorer le CLS : réserver l'espace des images et des publicités avec width et height ou aspect-ratio, et éviter d'insérer du contenu au-dessus du contenu existant. Les données terrain issues de vrais utilisateurs, par exemple du Chrome UX Report ou d'un outil de RUM, comptent davantage que les scores de laboratoire.",
    explanation:
      "Chaque métrique correspond à une expérience utilisateur : chargement, réactivité, stabilité. Savoir que l'INP a remplacé le FID montre des connaissances à jour.",
    tips: ["Donnez chaque métrique avec son seuil.", "Proposez une amélioration par métrique.", "Distinguez données terrain et données de laboratoire."],
    commonMistakes: ["Citer le First Input Delay comme un Core Web Vital actuel.", "Optimiser uniquement pour le score Lighthouse."],
    followUpQuestions: ["Qu'est-ce qu'une long task ?", "Comment identifieriez-vous l'interaction qui a un mauvais INP ?"],
  },
  "fe-047": {
    question: "Comment fonctionnent le debouncing et le throttling, et quand utiliseriez-vous chacun d'eux ?",
    intent: "Le recruteur vérifie vos techniques concrètes pour gérer des événements à haute fréquence.",
    expectedAnswer:
      "Le debouncing retarde l'exécution d'une fonction jusqu'à ce que les événements cessent pendant une durée donnée : chaque nouvel événement relance le minuteur. Il convient à la recherche pendant la saisie, où l'on veut une seule requête quand l'utilisateur fait une pause, par exemple de 300 millisecondes, plutôt qu'une requête par frappe. Le throttling exécute une fonction au plus une fois par intervalle de temps, quel que soit le nombre d'événements. Il convient aux événements continus comme le défilement, le redimensionnement ou le suivi d'un glisser-déposer, où l'on veut des mises à jour régulières sans saturer le thread principal. En React, les fonctions debouncées doivent conserver une identité stable entre les rendus, grâce à useMemo, useRef ou un hook comme useDebounce, et les minuteurs doivent être nettoyés au démontage. Pour les mises à jour visuelles, requestAnimationFrame est souvent un meilleur throttle, car il s'aligne sur le rafraîchissement de l'écran.",
    explanation:
      "Les deux techniques limitent le travail, mais le debouncing attend le calme tandis que le throttling garantit un rythme régulier.",
    tips: ["Donnez un cas d'usage pour chacun.", "Mentionnez l'identité stable en React et le nettoyage."],
    commonMistakes: ["Créer une nouvelle fonction debouncée à chaque rendu, ce qui casse le délai.", "Appliquer un debounce à des gestionnaires de défilement qui ont besoin d'un retour continu."],
    followUpQuestions: ["Comment annuleriez-vous une requête de recherche en cours quand l'utilisateur tape à nouveau ?", "Comment implémenteriez-vous vous-même un debounce ?"],
  },
  "fe-048": {
    question: "Qu'est-ce que le code splitting, et comment l'appliqueriez-vous ?",
    intent: "Le recruteur vérifie vos connaissances en optimisation du bundle pour accélérer le chargement initial.",
    expectedAnswer:
      "Le code splitting découpe le bundle JavaScript en chunks plus petits, chargés uniquement quand ils sont nécessaires, pour que la première page télécharge moins de code. Le découpage le plus efficace se fait par route : chaque page est un chunk séparé, chargé avec un import() dynamique ; en React, React.lazy avec Suspense affiche un fallback pendant le chargement du chunk, et des frameworks comme Next.js découpent automatiquement par route. Les composants lourds utilisés seulement de temps en temps, comme une bibliothèque de graphiques, un éditeur de texte riche ou un panneau d'administration, peuvent aussi être chargés à la demande. J'analyserais le bundle avec un outil comme un bundle analyzer pour repérer les dépendances volumineuses, je préchargerais les chunks dont l'utilisateur aura probablement besoin ensuite, et j'éviterais de multiplier les tout petits chunks au point que le coût des requêtes dépasse le bénéfice.",
    explanation:
      "Le découpage réduit le coût du premier chargement. Mesurer le bundle montre où le découpage a le plus d'effet.",
    tips: ["Mentionnez le découpage par route et React.lazy.", "Parlez de l'analyse du bundle et du prefetching."],
    commonMistakes: ["Charger en lazy des composants nécessaires immédiatement sur le premier écran.", "Ignorer les bibliothèques tierces volumineuses."],
    followUpQuestions: ["Comment gérez-vous un chunk qui ne se charge plus après un nouveau déploiement ?", "Qu'est-ce que le tree shaking ?"],
  },
  "fe-049": {
    question: "Des utilisateurs signalent qu'une interaction de votre application web semble lente. Comment trouvez-vous et corrigez-vous la cause ?",
    intent: "Le recruteur évalue votre capacité à déboguer la performance dans le navigateur de façon avancée et en vous appuyant sur des mesures.",
    expectedAnswer:
      "D'abord, je reproduirais le problème dans des conditions réalistes : build de production, appareil de milieu de gamme ou throttling du CPU dans les DevTools, et volumes de données réels. Le monitoring des utilisateurs réels avec l'attribution de l'INP peut indiquer quelle interaction et quelle page sont concernées. J'enregistrerais ensuite l'interaction dans le panneau Performance et j'examinerais le thread principal : les long tasks de plus de 50 millisecondes, leur contenu, comme l'exécution de scripts, le recalcul des styles ou le layout, et la présence de layout thrashing, quand le code alterne lectures et écritures de propriétés de mise en page. Si React est en cause, le React DevTools Profiler montre quels composants se sont rendus, pourquoi et combien de temps cela a pris. Les corrections typiques consistent à éviter les re-renders inutiles, virtualiser les longues listes, appliquer un debounce aux gestionnaires coûteux, utiliser startTransition ou useDeferredValue pour garder la saisie réactive pendant le rendu d'une mise à jour lourde, regrouper les lectures et écritures du DOM, simplifier les sélecteurs CSS ou les animations qui déclenchent un layout, et déplacer les calculs lourds dans un Web Worker. Après la correction, je comparerais les mesures avant et après, et j'ajouterais un budget de performance ou du monitoring pour éviter les régressions.",
    explanation:
      "La méthode consiste à reproduire, mesurer, identifier le type de travail sur le thread principal, corriger et vérifier. Les candidats de niveau avancé connaissent les outils au niveau du navigateur comme du framework.",
    tips: ["Insistez sur des conditions réalistes.", "Expliquez ce que vous cherchez dans une trace de performance.", "Mentionnez les fonctionnalités concurrentes de React."],
    commonMistakes: ["Tester uniquement sur un ordinateur de développeur rapide.", "Appliquer de la mémoïsation partout sans profilage."],
    followUpQuestions: ["Qu'est-ce que le layout thrashing ?", "Comment startTransition garde-t-il l'interface réactive ?"],
  },
  "fe-050": {
    question: "Comment concevriez-vous la stratégie de mise en cache d'une application web ?",
    intent: "Le recruteur évalue votre compréhension avancée du cache HTTP, des CDN et des service workers, ainsi que de leurs compromis en matière de cohérence.",
    expectedAnswer:
      "Je séparerais les ressources selon leur façon d'évoluer. Les ressources statiques comme le JavaScript, le CSS et les images reçoivent des noms de fichiers contenant un hash de leur contenu, par exemple app.3f9a2.js, et sont servies avec Cache-Control: public, max-age=31536000, immutable : navigateurs et CDN les conservent longtemps, et un nouveau déploiement référence simplement de nouveaux noms. Le document HTML ne doit pas être mis en cache longtemps, généralement avec no-cache, qui autorise sa réutilisation après revalidation via ETag, pour que les utilisateurs obtiennent toujours les références vers les dernières ressources. Les réponses d'API dépendent des données : les données privées d'un utilisateur utilisent private ou no-store, tandis que des données publiques qui changent rarement peuvent utiliser de courtes valeurs de max-age avec stale-while-revalidate au niveau du CDN, pour répondre rapidement tout en rafraîchissant en arrière-plan. Un CDN placé en amont réduit la latence et la charge du serveur, avec une purge explicite ou une invalidation par tags pour les contenus qui doivent être mis à jour immédiatement. Un service worker peut ajouter le support hors ligne et précharger l'app shell, mais il lui faut une stratégie de mise à jour claire pour que les utilisateurs ne restent pas bloqués sur une ancienne version. Côté client, une bibliothèque de récupération de données met en cache les résultats d'API en mémoire. Je documenterais les règles et vérifierais les en-têtes en production, car un cache mal configuré peut soit servir des données périmées ou privées, soit annuler tous les bénéfices de la mise en cache.",
    explanation:
      "Une bonne mise en cache combine des ressources immuables à longue durée de vie, un HTML revalidé, des règles d'API adaptées aux données et l'invalidation du CDN. Les réponses avancées abordent aussi les mises à jour des service workers et les risques pour la confidentialité.",
    tips: ["Classez les ressources selon leur façon d'évoluer.", "Expliquez le hash de contenu et la mise en cache immutable.", "Mentionnez les risques liés à la mise en cache de données privées et aux mises à jour des service workers."],
    commonMistakes: ["Mettre index.html en cache longtemps, si bien que les utilisateurs n'obtiennent jamais la nouvelle version.", "Laisser un CDN mettre en cache des réponses personnalisées."],
    followUpQuestions: ["Quelle est la différence entre no-cache et no-store ?", "Comment forceriez-vous les clients à mettre à jour un service worker ?"],
  },
};
