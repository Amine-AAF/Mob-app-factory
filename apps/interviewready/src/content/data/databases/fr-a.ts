import type { QuestionText, TextTable } from '@/types/content';

/** Questions bases de données 001-020 : SQL, PostgreSQL, MongoDB, index (partie). */
export const frA: TextTable<QuestionText> = {
  "db-001": {
    question: "Expliquez les différents types de jointures SQL.",
    intent: "Le recruteur vérifie une compétence SQL fondamentale, utilisée dans presque toutes les tâches liées aux données.",
    expectedAnswer:
      "Une INNER JOIN ne renvoie que les lignes qui ont une correspondance dans les deux tables, par exemple les commandes qui ont un client. Une LEFT JOIN renvoie toutes les lignes de la table de gauche et les lignes correspondantes de celle de droite, avec NULL lorsqu'il n'y a pas de correspondance : c'est ainsi que l'on trouve les clients sans commande, en faisant une LEFT JOIN sur orders et en gardant les lignes où l'identifiant de commande est NULL. Une RIGHT JOIN fait l'inverse et est rarement utilisée. Une FULL OUTER JOIN conserve les lignes des deux côtés, appariées lorsque c'est possible. Une CROSS JOIN renvoie toutes les combinaisons de lignes. Une auto-jointure (self join) joint une table à elle-même, par exemple les employés avec leurs managers.",
    explanation:
      "Le choix de la bonne jointure détermine quelles lignes apparaissent dans le résultat. Une LEFT JOIN suivie d'un test sur NULL est un pattern classique pour trouver les relations manquantes.",
    example: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;",
    tips: ["Donnez un exemple métier pour chaque jointure.", "Montrez le pattern des « lignes sans correspondance »."],
    commonMistakes: ["Placer une condition sur la table de droite dans le WHERE, ce qui transforme une LEFT JOIN en INNER JOIN.", "Oublier la condition de jointure et produire un produit cartésien."],
    followUpQuestions: ["Quelle est la différence entre filtrer dans le ON et dans le WHERE pour une LEFT JOIN ?", "Comment trouveriez-vous des lignes en double ?"],
  },
  "db-002": {
    question: "Quelle est la différence entre WHERE et HAVING ?",
    intent: "Le recruteur vérifie votre compréhension de l'ordre logique d'exécution d'une requête SQL.",
    expectedAnswer:
      "WHERE filtre les lignes individuelles avant le regroupement : il ne peut donc pas utiliser de fonctions d'agrégation. HAVING filtre les groupes après le GROUP BY : il peut donc utiliser des agrégats comme COUNT ou SUM. Par exemple, pour lister les clients ayant plus de cinq commandes payées : WHERE status = 'PAID' ne garde que les commandes payées, GROUP BY customer_id les regroupe et HAVING COUNT(*) > 5 conserve les groupes de plus de cinq. Filtrer le plus tôt possible avec WHERE est aussi plus efficace, car moins de lignes sont regroupées.",
    explanation:
      "Une requête SQL est évaluée dans un ordre logique : FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Cet ordre explique quelle clause peut utiliser quelles valeurs.",
    tips: ["Donnez un exemple combinant les deux clauses.", "Mentionnez l'ordre logique d'exécution."],
    commonMistakes: ["Utiliser HAVING pour des conditions qui relèvent du WHERE.", "Essayer d'utiliser un agrégat dans le WHERE."],
    followUpQuestions: ["Pourquoi ne peut-on pas utiliser un alias du SELECT dans le WHERE ?", "Que compte COUNT(*) par rapport à COUNT(colonne) ?"],
  },
  "db-003": {
    question: "Quelle est la différence entre COUNT(*), COUNT(colonne) et COUNT(DISTINCT colonne) ?",
    intent: "Le recruteur vérifie votre rigueur avec les agrégats et les valeurs NULL, une source fréquente de chiffres erronés dans les rapports.",
    expectedAnswer:
      "COUNT(*) compte toutes les lignes du groupe, y compris celles qui contiennent des valeurs NULL. COUNT(colonne) ne compte que les lignes où cette colonne n'est pas NULL. COUNT(DISTINCT colonne) compte le nombre de valeurs différentes non NULL. Par exemple, dans une table de commandes, COUNT(*) donne le nombre de commandes, COUNT(coupon_code) le nombre de commandes ayant utilisé un code promo, et COUNT(DISTINCT customer_id) le nombre de clients différents ayant commandé. Les autres agrégats comme SUM et AVG ignorent aussi les NULL, si bien que AVG peut différer de SUM divisé par COUNT(*).",
    explanation:
      "Les agrégats traitent NULL différemment des autres valeurs. Le savoir évite des indicateurs faux sans que personne ne s'en aperçoive.",
    tips: ["Utilisez une seule table pour illustrer les trois comptages.", "Mentionnez que AVG ignore les NULL."],
    commonMistakes: ["Utiliser COUNT(colonne) alors que vous vouliez le nombre de lignes.", "Supposer que AVG traite NULL comme zéro."],
    followUpQuestions: ["Comment compteriez-vous les commandes par statut en une seule requête ?", "Comment remplacer NULL par une valeur par défaut ?"],
  },
  "db-004": {
    question: "Quand utiliseriez-vous une sous-requête, une jointure ou EXISTS ?",
    intent: "Le recruteur vérifie votre jugement dans l'écriture de requêtes et votre connaissance des différences sémantiques.",
    expectedAnswer:
      "Une jointure est la meilleure option lorsque vous avez besoin de colonnes des deux tables dans le résultat. EXISTS vérifie qu'au moins une ligne liée existe, par exemple les clients ayant passé une commande, et renvoie chaque client une seule fois, sans les doublons qu'une jointure pourrait créer si un client a plusieurs commandes. Une sous-requête scalaire renvoie une seule valeur, par exemple pour comparer chaque produit au prix moyen. IN avec une sous-requête fonctionne comme EXISTS pour un simple test d'appartenance, mais NOT IN est dangereux : si la sous-requête renvoie le moindre NULL, NOT IN ne renvoie aucune ligne, donc NOT EXISTS est plus sûr. Les optimiseurs modernes réécrivent souvent ces formes en plans similaires : la lisibilité et l'exactitude comptent donc généralement plus que la micro-optimisation, mais le plan d'exécution doit le confirmer.",
    explanation:
      "Le choix dépend du besoin de données de l'autre table, de l'importance des doublons et du comportement des NULL. Le piège du NOT IN est un point classique en entretien.",
    tips: ["Mentionnez les doublons créés par les jointures.", "Expliquez le problème de NOT IN avec NULL."],
    commonMistakes: ["Utiliser DISTINCT pour masquer des doublons causés par une jointure.", "Utiliser NOT IN sur une colonne pouvant contenir NULL."],
    followUpQuestions: ["Qu'est-ce qu'une sous-requête corrélée ?", "Comment vérifieriez-vous quelle version s'exécute le plus vite ?"],
  },
  "db-005": {
    question: "Que sont les fonctions de fenêtrage, et quand les utilisez-vous ?",
    intent: "Le recruteur vérifie des compétences SQL de niveau intermédiaire, très utilisées en analyse et en reporting.",
    expectedAnswer:
      "Une fonction de fenêtrage (window function) calcule une valeur sur un ensemble de lignes liées à la ligne courante, sans les fusionner en une seule ligne comme le fait GROUP BY. Elle utilise OVER, avec un PARTITION BY facultatif pour définir les groupes et un ORDER BY pour définir l'ordre au sein de chaque groupe. Parmi les fonctions courantes : ROW_NUMBER, qui numérote les lignes ; RANK et DENSE_RANK, qui gèrent différemment les ex æquo ; LAG et LEAD, qui accèdent à la ligne précédente ou suivante, par exemple pour comparer ce mois-ci au mois dernier ; et les agrégats comme SUM() OVER (ORDER BY date) pour les cumuls. Un usage typique consiste à trouver la dernière commande de chaque client : ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC), en gardant les lignes numérotées 1.",
    explanation:
      "Les fonctions de fenêtrage résolvent élégamment les classements, les cumuls et les comparaisons entre lignes, en remplaçant des auto-jointures complexes.",
    example: "SELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS change FROM monthly_revenue;",
    tips: ["Expliquez PARTITION BY et ORDER BY dans OVER.", "Donnez un exemple de « dernière ligne par groupe »."],
    commonMistakes: ["Filtrer sur une fonction de fenêtrage dans le WHERE, ce qui est interdit ; utilisez une CTE ou une sous-requête.", "Confondre RANK et DENSE_RANK."],
    followUpQuestions: ["Qu'est-ce qu'un cadre de fenêtre (window frame), comme ROWS BETWEEN 6 PRECEDING AND CURRENT ROW ?", "Comment calculeriez-vous une moyenne mobile sur 7 jours ?"],
  },
  "db-006": {
    question: "Comment SQL gère-t-il NULL, et quels pièges cela crée-t-il ?",
    intent: "Le recruteur vérifie votre compréhension de la logique à trois valeurs, qui provoque des bugs subtils.",
    expectedAnswer:
      "NULL signifie inconnu ou absent, et non zéro ou chaîne vide. Toute comparaison avec NULL, même NULL = NULL, renvoie UNKNOWN plutôt que vrai ou faux, et WHERE ne conserve que les lignes pour lesquelles la condition est vraie. Il faut donc utiliser IS NULL ou IS NOT NULL. Parmi les pièges : column <> 'X' exclut les lignes où la colonne est NULL ; NOT IN avec une sous-requête contenant NULL ne renvoie rien ; les agrégats ignorent les NULL ; toute opération arithmétique avec NULL renvoie NULL ; et, dans la plupart des bases, les contraintes d'unicité autorisent plusieurs NULL. COALESCE remplace NULL par une valeur par défaut, et IS DISTINCT FROM, disponible en PostgreSQL et en SQL standard, compare des valeurs en considérant les NULL comme égaux.",
    explanation:
      "La logique à trois valeurs explique de nombreux bugs de « lignes manquantes ». Traiter NULL de façon explicite rend les requêtes correctes et lisibles.",
    tips: ["Mentionnez la logique à trois valeurs.", "Donnez les exemples de l'inégalité et de NOT IN."],
    commonMistakes: ["Écrire WHERE column = NULL.", "Oublier que les filtres d'inégalité écartent les lignes NULL."],
    followUpQuestions: ["Une colonne doit-elle accepter NULL ou avoir une valeur par défaut ?", "Comment les NULL se comportent-ils dans un ORDER BY ?"],
  },
  "db-007": {
    question: "Qu'est-ce qu'une CTE, et quand utiliseriez-vous une CTE récursive ?",
    intent: "Le recruteur vérifie votre capacité à structurer des requêtes lisibles et à traiter des données hiérarchiques.",
    expectedAnswer:
      "Une expression de table commune (common table expression), écrite WITH name AS (SELECT ...), définit un résultat temporaire nommé, utilisé dans la requête principale. Les CTE rendent les requêtes complexes lisibles en les découpant en étapes, par exemple calculer d'abord les totaux mensuels, puis comparer les mois. Depuis PostgreSQL 12, les CTE simples sont intégrées (inlined) par l'optimiseur, sauf si elles sont marquées MATERIALIZED : elles ne constituent donc plus, par défaut, une barrière d'optimisation. Une CTE récursive, WITH RECURSIVE, comporte une requête d'ancrage et une partie récursive qui fait référence à la CTE elle-même. Elle sert à parcourir des hiérarchies et des graphes : un organigramme, des catégories imbriquées ou une nomenclature. Elle nécessite une condition d'arrêt et, pour les graphes pouvant contenir des cycles, un moyen de les détecter, par exemple en suivant le chemin déjà parcouru.",
    explanation:
      "Les CTE améliorent la lisibilité ; les CTE récursives permettent d'interroger des arbres et des graphes en SQL standard.",
    example: "WITH RECURSIVE chain AS (\n  SELECT id, manager_id, name FROM employees WHERE id = 42\n  UNION ALL\n  SELECT e.id, e.manager_id, e.name FROM employees e JOIN chain c ON e.id = c.manager_id\n) SELECT * FROM chain;",
    tips: ["Montrez un usage pour la lisibilité et un usage récursif.", "Mentionnez la condition d'arrêt et les cycles."],
    commonMistakes: ["Écrire une CTE récursive sans condition d'arrêt.", "Supposer que les CTE sont toujours matérialisées."],
    followUpQuestions: ["Comment stockeriez-vous une hiérarchie interrogée très fréquemment ?", "Quelle est la différence entre UNION et UNION ALL ?"],
  },
  "db-008": {
    question: "Écrivez une requête qui trouve les trois produits au plus fort chiffre d'affaires dans chaque catégorie, et justifiez vos choix.",
    intent: "Le recruteur évalue votre résolution de problèmes SQL avancés, votre gestion des ex æquo et votre sensibilité aux performances.",
    expectedAnswer:
      "Je calculerais d'abord le chiffre d'affaires par produit, puis je classerais les produits au sein de chaque catégorie avec une fonction de fenêtrage, et je filtrerais dans une requête externe, car les fonctions de fenêtrage ne peuvent pas être utilisées dans le WHERE. En SQL : WITH revenue AS (SELECT p.category_id, p.id, p.name, SUM(oi.quantity * oi.unit_price) AS total FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category_id, p.id, p.name), ranked AS (SELECT *, DENSE_RANK() OVER (PARTITION BY category_id ORDER BY total DESC) AS rnk FROM revenue) SELECT * FROM ranked WHERE rnk <= 3. Le choix de la fonction de classement dépend des règles métier pour les ex æquo : ROW_NUMBER renvoie exactement trois lignes par catégorie en départageant arbitrairement les égalités, sauf si j'ajoute un critère de départage comme id ; RANK peut sauter des positions ; et DENSE_RANK peut renvoyer plus de trois produits en cas de valeurs égales. Je clarifierais aussi ce que recouvre le chiffre d'affaires, par exemple l'exclusion des commandes annulées ou des remboursements, ainsi que la période. Pour les performances sur de grandes tables, un index sur order_items(product_id) aide la jointure, et pour des tableaux de bord fréquents, je pré-agrégerais le chiffre d'affaires dans une vue matérialisée ou une table de synthèse. En PostgreSQL, une jointure LATERAL avec LIMIT 3 par catégorie est une alternative qui peut être plus rapide lorsque les catégories sont peu nombreuses et qu'un index adapté existe.",
    explanation:
      "Le pattern « top N par groupe » teste les fonctions de fenêtrage, la sémantique des ex æquo et la clarification des besoins. Les candidats avancés abordent aussi les alternatives côté performances.",
    tips: ["Clarifiez la définition du chiffre d'affaires et la période.", "Expliquez l'effet de chaque fonction de classement sur les ex æquo.", "Abordez les performances sur de grandes tables."],
    commonMistakes: ["Utiliser LIMIT 3 sur l'ensemble du résultat, ce qui renvoie trois produits au total.", "Ignorer les ex æquo."],
    followUpQuestions: ["Comment afficheriez-vous la part de chaque produit dans le chiffre d'affaires de sa catégorie ?", "Comment rendriez-vous cette requête rapide sur un milliard de lignes ?"],
  },
  "db-009": {
    question: "Pourquoi tant d'équipes choisissent-elles PostgreSQL ? Quelles sont ses principales fonctionnalités ?",
    intent: "Le recruteur vérifie votre familiarité avec l'une des bases de données relationnelles les plus utilisées.",
    expectedAnswer:
      "PostgreSQL est une base de données relationnelle open source réputée pour sa fiabilité, son respect des standards et son extensibilité. Ses principales fonctionnalités : des transactions entièrement ACID avec MVCC, qui permet aux lecteurs et aux écrivains de travailler sans se bloquer mutuellement ; des types de données riches comme JSONB, les tableaux, les intervalles (ranges) et les UUID ; une indexation avancée avec B-tree, GIN pour la recherche plein texte et le JSON, GiST pour les données géographiques, ainsi que les index partiels ; les fonctions de fenêtrage et les CTE ; des extensions comme PostGIS pour les données géospatiales, pg_stat_statements pour les statistiques de requêtes et pgvector pour les embeddings ; et un solide écosystème de services managés sur tous les grands clouds. Elle convient à la plupart des applications transactionnelles et à de nombreuses charges analytiques, jusqu'à des volumes importants.",
    explanation:
      "Le recruteur veut voir que vous savez pourquoi PostgreSQL est un choix par défaut courant et quelles fonctionnalités vous utiliseriez réellement.",
    tips: ["Mentionnez MVCC, JSONB et les extensions.", "Reliez les fonctionnalités à des cas d'usage réels."],
    commonMistakes: ["Énumérer des fonctionnalités sans exemple de situation où elles sont utiles."],
    followUpQuestions: ["Quand ne choisiriez-vous pas PostgreSQL ?", "À quoi sert pgvector ?"],
  },
  "db-010": {
    question: "Qu'est-ce que MVCC dans PostgreSQL, et pourquoi a-t-il besoin de VACUUM ?",
    intent: "Le recruteur vérifie votre compréhension du fonctionnement interne de PostgreSQL, qui influe sur les performances et la maintenance.",
    expectedAnswer:
      "Le Multi-Version Concurrency Control signifie que PostgreSQL n'écrase pas une ligne sur place. Un UPDATE crée une nouvelle version de la ligne et marque l'ancienne comme obsolète ; un DELETE marque la ligne comme supprimée. Chaque transaction voit un instantané (snapshot) des versions validées au moment où elle a commencé : les lecteurs ne bloquent donc pas les écrivains, et inversement. La contrepartie est l'accumulation d'anciennes versions de lignes, appelées dead tuples. VACUUM récupère leur espace pour le réutiliser, met à jour les informations de visibilité et empêche le rebouclage des identifiants de transaction (transaction ID wraparound), un problème grave si VACUUM ne s'exécute jamais. L'autovacuum s'en charge automatiquement, mais les tables très souvent mises à jour peuvent nécessiter des réglages adaptés ; sinon, tables et index gonflent (bloat) et les requêtes ralentissent. Les transactions longues empêchent aussi le nettoyage, car elles pourraient encore avoir besoin des anciennes versions.",
    explanation:
      "MVCC explique à la fois la bonne gestion de la concurrence de PostgreSQL et ses besoins de maintenance. Mentionner les transactions longues et le wraparound montre une connaissance approfondie.",
    tips: ["Expliquez les versions de lignes et les instantanés.", "Mentionnez l'autovacuum et l'effet des transactions longues."],
    commonMistakes: ["Désactiver l'autovacuum pour améliorer les performances.", "Laisser des transactions ouvertes pendant des heures dans le code applicatif."],
    followUpQuestions: ["Qu'est-ce que le bloat d'une table et comment le détecter ?", "Quelle est la différence entre VACUUM et VACUUM FULL ?"],
  },
  "db-011": {
    question: "Quand stockeriez-vous des données dans une colonne JSONB plutôt que dans des colonnes classiques ?",
    intent: "Le recruteur vérifie votre jugement de conception de schéma pour des données semi-structurées dans une base relationnelle.",
    expectedAnswer:
      "JSONB est utile pour des données dont la structure varie ou évolue souvent et qui sont surtout lues en bloc, comme des attributs produits qui diffèrent selon la catégorie, des préférences utilisateur, des payloads de webhooks tiers ou des détails d'audit. PostgreSQL stocke le JSONB dans un format binaire, fournit des opérateurs pour interroger l'intérieur des documents et permet de l'indexer avec des index GIN ou des index d'expression sur des clés précises. Les colonnes classiques conviennent mieux aux données fréquemment interrogées, filtrées, jointes ou agrégées, qui nécessitent des contraintes comme NOT NULL, des clés étrangères ou des types, ou qui sont au cœur du domaine, comme les prix et les statuts. Une approche courante est hybride : les champs essentiels en colonnes, les compléments flexibles dans une colonne JSONB. Abuser du JSONB fait perdre la sûreté de typage et les contraintes, et rend les requêtes et les migrations plus difficiles à maîtriser.",
    explanation:
      "La décision met en balance la flexibilité d'un côté, l'intégrité et les performances des requêtes de l'autre. Un modèle hybride est souvent la meilleure réponse.",
    tips: ["Donnez des exemples de bons et de mauvais usages du JSONB.", "Mentionnez les index GIN et les index d'expression."],
    commonMistakes: ["Tout stocker en JSONB pour éviter de concevoir un schéma.", "Placer des clés étrangères à l'intérieur de documents JSON."],
    followUpQuestions: ["Comment indexeriez-vous une clé fréquemment interrogée à l'intérieur d'un JSONB ?", "Comment validez-vous la structure d'une colonne JSONB ?"],
  },
  "db-012": {
    question: "Une base PostgreSQL est devenue lente en production. Comment menez-vous l'enquête ?",
    intent: "Le recruteur évalue une démarche de diagnostic de base de données avancée et méthodique.",
    expectedAnswer:
      "Je vérifierais d'abord si le problème est global ou limité à certaines requêtes, en consultant le monitoring du CPU, de la mémoire, des I/O disque, des connexions et du retard de réplication, et je ferais le lien avec les déploiements récents ou les variations de trafic. Pour trouver les requêtes coûteuses, pg_stat_statements les classe par temps total, temps moyen et nombre d'appels ; souvent, une nouvelle requête ou une requête dont le plan a changé explique l'essentiel de la charge. Je les examinerais avec EXPLAIN (ANALYZE, BUFFERS) sur une copie sans risque, ou avec prudence en production. pg_stat_activity montre ce qui s'exécute en ce moment, les transactions longues et les sessions en attente de verrous ; pg_locks et les colonnes wait_event permettent d'identifier les blocages. Je contrôlerais le bloat des tables et des index et vérifierais que l'autovacuum suit le rythme, à l'aide de pg_stat_user_tables pour les dead tuples et les dates des derniers VACUUM, ainsi que la fraîcheur des statistiques. Une saturation des connexions suggère le besoin d'un pooler comme PgBouncer. Les correctifs vont de l'ajout ou de l'ajustement d'un index, de la réécriture d'une requête ou de la mise à jour des statistiques, jusqu'au réglage de paramètres mémoire comme work_mem et shared_buffers, à l'arrêt d'une transaction incontrôlée ou à la montée en capacité. Après correction, j'ajouterais des alertes sur les requêtes lentes et les transactions longues.",
    explanation:
      "Une démarche structurée part des métriques globales pour aller vers les requêtes précises, les verrous et la maintenance. Connaître les vues système pertinentes montre une réelle expérience de PostgreSQL.",
    tips: ["Mentionnez pg_stat_statements et pg_stat_activity.", "Vérifiez les verrous, le bloat et l'autovacuum.", "Faites le lien avec les changements récents."],
    commonMistakes: ["Redémarrer la base sans collecter d'éléments.", "Lancer EXPLAIN ANALYZE sur une requête d'écriture lourde en production sans l'envelopper dans une transaction annulée par ROLLBACK."],
    followUpQuestions: ["Que feriez-vous si une migration détient un verrou qui bloque le trafic ?", "Comment choisissez-vous une valeur pour work_mem ?"],
  },
  "db-013": {
    question: "Comment feriez-vous évoluer une base PostgreSQL à mesure que l'application grandit ?",
    intent: "Le recruteur évalue une réflexion d'architecture avancée sur la capacité de la base de données et les compromis associés.",
    expectedAnswer:
      "Je procéderais par étapes, en commençant par les options les moins coûteuses. D'abord, optimiser : corriger les requêtes lentes, ajouter les bons index et réduire la charge inutile, comme les requêtes N+1. Ensuite, ajouter un pool de connexions avec PgBouncer, car PostgreSQL utilise un processus par connexion et trop de connexions gaspillent de la mémoire. Troisièmement, mettre en cache les données fréquemment lues, avec Redis ou des caches applicatifs. Quatrièmement, monter en puissance verticalement avec plus de CPU, de mémoire et un stockage plus rapide, ce qui est simple et suffit souvent longtemps. Cinquièmement, ajouter des réplicas en lecture pour les charges dominées par les lectures, en gardant à l'esprit le retard de réplication : les lectures qui doivent voir la dernière écriture de l'utilisateur doivent aller sur le primaire. Sixièmement, partitionner les très grandes tables, par exemple par date, pour que les requêtes et la maintenance portent sur des morceaux plus petits et que les anciennes données puissent être supprimées rapidement. Enfin, pour des volumes d'écriture qu'un seul primaire ne peut pas absorber, répartir les données sur plusieurs bases (sharding) selon une clé comme l'identifiant du tenant, soit dans l'application, soit avec une extension comme Citus ; cela ajoute une complexité importante pour les requêtes et les transactions inter-shards. Archiver les anciennes données et déplacer l'analytique vers un entrepôt de données séparé soulagent aussi la base principale.",
    explanation:
      "La montée en charge est une suite d'étapes de plus en plus complexes. Les candidats avancés épuisent d'abord les options simples et comprennent les implications des réplicas et du sharding sur la cohérence.",
    tips: ["Classez les options de la plus simple à la plus complexe.", "Mentionnez le retard de réplication et la lecture de ses propres écritures (read-your-writes).", "Expliquez le coût du sharding."],
    commonMistakes: ["Passer directement au sharding.", "Envoyer toutes les lectures vers les réplicas sans tenir compte du retard."],
    followUpQuestions: ["Comment choisiriez-vous une clé de sharding ?", "Quand déplaceriez-vous l'analytique vers un entrepôt de données ?"],
  },
  "db-014": {
    question: "Qu'est-ce qu'une base de données orientée documents comme MongoDB, et en quoi diffère-t-elle d'une base relationnelle ?",
    intent: "Le recruteur vérifie votre compréhension des modèles NoSQL orientés documents et de leurs compromis.",
    expectedAnswer:
      "MongoDB stocke les données sous forme de documents, des objets proches du JSON au format BSON, regroupés en collections. Les documents peuvent contenir des objets et des tableaux imbriqués, et les documents d'une même collection n'ont pas besoin d'avoir des champs identiques. Les données utilisées ensemble peuvent être stockées ensemble, par exemple une commande avec ses articles, ce qui évite des jointures pour les lectures courantes. Les bases relationnelles stockent les données dans des tables au schéma fixe, imposent les relations par des clés étrangères et excellent dans les requêtes complexes et les jointures. MongoDB offre des schémas flexibles, une montée en charge horizontale grâce au sharding et un puissant pipeline d'agrégation, et prend en charge les transactions multi-documents depuis la version 4.0 ; mais des données très relationnelles, avec de nombreuses jointures, restent généralement plus naturelles en SQL.",
    explanation:
      "La différence principale tient à la modélisation : des documents façonnés par les modes d'accès, face à des tables normalisées façonnées par les relations.",
    tips: ["Mentionnez le schéma flexible et les documents imbriqués.", "Donnez un cas d'usage adapté à chaque modèle."],
    commonMistakes: ["Affirmer que MongoDB n'a aucun schéma ; le schéma est implicite et doit être conçu.", "Affirmer que MongoDB ne prend pas en charge les transactions."],
    followUpQuestions: ["Comment validez-vous la structure des documents dans MongoDB ?", "Quand imbriqueriez-vous des données plutôt que de les référencer ?"],
  },
  "db-015": {
    question: "Dans MongoDB, comment choisissez-vous entre imbriquer et référencer des données liées ?",
    intent: "Le recruteur vérifie vos compétences pratiques en modélisation de documents.",
    expectedAnswer:
      "Je pars des modes d'accès : quelles données sont lues et écrites ensemble. L'imbrication (embedding) place les données liées à l'intérieur du document parent, comme les lignes d'une commande dans la commande ou les adresses dans le client. C'est un bon choix lorsque les données enfants appartiennent à un seul parent, sont lues avec lui la plupart du temps, ont une taille bornée et ne sont pas très souvent mises à jour indépendamment ; une seule lecture renvoie tout, et les mises à jour du document entier sont atomiques. Le référencement stocke un identifiant pointant vers un autre document, comme une clé étrangère. Il est préférable lorsque les données liées sont partagées par de nombreux documents, comme des produits référencés par des commandes ; lorsqu'elles croissent sans limite, comme des commentaires ou des événements, car les documents sont limités à 16 Mo et les grands tableaux nuisent aux performances ; ou lorsqu'elles sont mises à jour indépendamment. Un compromis courant consiste à imbriquer quelques champs souvent nécessaires, comme le nom et le prix d'un produit au moment de la commande, et à référencer le reste.",
    explanation:
      "La conception des documents suit les requêtes, et pas seulement les relations entre entités. Le caractère borné ou non de la croissance est un critère clé.",
    tips: ["Partez des modes d'accès.", "Mentionnez la limite de taille des documents et les tableaux non bornés.", "Proposez le compromis de la duplication partielle."],
    commonMistakes: ["Imbriquer des listes non bornées, comme tous les logs d'un utilisateur.", "Tout normaliser puis multiplier les lookups."],
    followUpQuestions: ["Comment maintenez-vous à jour les champs dupliqués ?", "Qu'est-ce que l'étape $lookup ?"],
  },
  "db-016": {
    question: "Qu'est-ce que le pipeline d'agrégation de MongoDB ?",
    intent: "Le recruteur vérifie votre capacité à traiter et analyser des données directement dans MongoDB.",
    expectedAnswer:
      "Le pipeline d'agrégation fait passer les documents par une suite d'étapes, chacune transformant les résultats de la précédente. Les étapes courantes sont $match pour filtrer, $group pour agréger avec des opérateurs comme $sum et $avg, $project ou $set pour remodeler les champs, $sort, $limit, $unwind pour transformer les éléments d'un tableau en documents distincts et $lookup pour joindre une autre collection. Par exemple, pour calculer le chiffre d'affaires par catégorie de produit sur les commandes payées : $match sur le statut, $unwind des articles, $group par catégorie avec un $sum du prix multiplié par la quantité, puis $sort. Pour les performances, $match et $sort doivent intervenir tôt afin de pouvoir utiliser les index et réduire le nombre de documents, et des résultats intermédiaires volumineux peuvent nécessiter allowDiskUse.",
    explanation:
      "Le pipeline est l'équivalent MongoDB du GROUP BY, des jointures et des transformations SQL. L'ordre des étapes influe fortement sur les performances.",
    example: "db.orders.aggregate([\n  { $match: { status: \"paid\" } },\n  { $unwind: \"$items\" },\n  { $group: { _id: \"$items.category\", revenue: { $sum: { $multiply: [\"$items.price\", \"$items.qty\"] } } } },\n  { $sort: { revenue: -1 } }\n])",
    tips: ["Citez les principales étapes.", "Expliquez pourquoi $match doit intervenir tôt."],
    commonMistakes: ["Placer $match après des étapes coûteuses.", "Utiliser massivement $lookup comme si la base était relationnelle."],
    followUpQuestions: ["Comment vérifieriez-vous qu'un pipeline utilise un index ?", "À quoi sert $facet ?"],
  },
  "db-017": {
    question: "Comment fonctionne le sharding dans MongoDB, et comment choisissez-vous une clé de sharding ?",
    intent: "Le recruteur évalue votre connaissance avancée de la montée en charge horizontale et de ses pièges.",
    expectedAnswer:
      "Le sharding répartit une collection sur plusieurs shards, chacun étant un replica set, de sorte que le volume de données et la charge d'écriture sont distribués sur de nombreuses machines. Un routeur, mongos, oriente les requêtes à l'aide de la clé de sharding : les documents sont regroupés en plages de valeurs de cette clé, appelées chunks, et un balancer déplace les chunks entre les shards pour les maintenir équilibrés. La clé de sharding est la décision critique et elle est difficile à changer ensuite, même si le resharding est possible depuis MongoDB 5.0. Une bonne clé a une forte cardinalité, répartit uniformément les écritures et correspond aux requêtes les plus fréquentes, afin qu'elles ciblent un seul shard au lieu d'être diffusées à tous. Une clé monotone croissante, comme un horodatage ou un ObjectId, envoie toutes les nouvelles écritures sur un seul shard et crée un point chaud ; le sharding haché les répartit, mais disperse les requêtes par plage. Une clé composée, comme l'identifiant du tenant associé à une composante hachée ou temporelle, offre souvent un bon équilibre entre isolation par client et répartition uniforme. J'analyserais les modes d'interrogation et la croissance des données avant de choisir, et je testerais avec des données réalistes.",
    explanation:
      "La clé de sharding détermine la répartition et l'efficacité des requêtes. Les candidats avancés connaissent les points chauds, les requêtes scatter-gather et le coût d'un changement de clé.",
    tips: ["Expliquez les chunks, mongos et le balancer.", "Énumérez les propriétés d'une bonne clé de sharding.", "Donnez un exemple de mauvaise clé."],
    commonMistakes: ["Choisir un horodatage comme seule clé de sharding.", "Sharder avant que ce soit nécessaire."],
    followUpQuestions: ["Qu'est-ce qu'un jumbo chunk ?", "Comment géreriez-vous un tenant très volumineux ?"],
  },
  "db-018": {
    question: "Pour un nouveau produit, comment choisiriez-vous entre PostgreSQL et MongoDB ?",
    intent: "Le recruteur évalue un choix technologique fondé sur les besoins plutôt que sur les préférences.",
    expectedAnswer:
      "Je partirais des données et des modes d'accès. Si le domaine comporte de nombreuses relations, exige une cohérence forte entre entités, des rapports complexes avec jointures et des contraintes comme les clés étrangères, comme dans la facturation, la gestion de stock ou les réservations, PostgreSQL est un choix par défaut naturel. Si les données ont naturellement une forme de documents, sont lues et écrites sous forme d'agrégats complets, ont une structure variable, par exemple pour la gestion de contenu, des catalogues produits aux attributs variés ou des données d'événements, et doivent monter en charge horizontalement en écriture dès le début, MongoDB peut être adapté. Je prendrais aussi en compte l'expérience de l'équipe, l'outillage d'exploitation et les services managés disponibles, le coût, ainsi que les besoins futurs comme l'analytique ou la recherche. L'écart entre les deux s'est réduit : PostgreSQL dispose du JSONB et MongoDB des transactions et de la validation de schéma, si bien que, pour beaucoup de produits, les deux conviennent et que les facteurs décisifs sont les modes d'accès principaux et l'équipe. Parfois, la réponse est d'utiliser les deux, chacun pour la partie du système qui lui convient, mais j'éviterais d'ajouter une seconde base sans raison claire, en raison du coût d'exploitation.",
    explanation:
      "Une réponse senior met en balance la forme des données, les besoins de cohérence, la montée en charge, les compétences de l'équipe et l'exploitation, et reconnaît que les deux bases ont convergé.",
    tips: ["Partez des modes d'accès et des besoins de cohérence.", "Intégrez les facteurs liés à l'équipe et à l'exploitation.", "Reconnaissez le recouvrement entre les deux."],
    commonMistakes: ["Choisir MongoDB uniquement parce que le schéma est « flexible ».", "Affirmer que les bases SQL ne peuvent pas monter en charge."],
    followUpQuestions: ["Comment migreriez-vous si le choix s'avérait mauvais ?", "Quel rôle jouerait un moteur de recherche comme Elasticsearch ?"],
  },
  "db-019": {
    question: "Qu'est-ce qu'un index de base de données, et quels sont ses compromis ?",
    intent: "Le recruteur vérifie un concept de performance fondamental.",
    expectedAnswer:
      "Un index est une structure de données supplémentaire, généralement un B-tree, qui stocke les valeurs d'une ou plusieurs colonnes dans un ordre trié, avec des pointeurs vers les lignes. Il permet à la base de trouver les lignes correspondantes sans parcourir toute la table, comme l'index d'un livre, ce qui accélère fortement les recherches, les jointures et les tris. Les compromis sont un espace disque supplémentaire et des écritures plus lentes, car chaque INSERT, UPDATE ou DELETE doit aussi mettre à jour les index. Les index sont rentables sur les colonnes souvent utilisées dans les clauses WHERE, JOIN et ORDER BY, mais indexer chaque colonne gaspille des ressources.",
    explanation:
      "Les index échangent un coût d'écriture et de stockage contre une vitesse de lecture. Les choisir en fonction des requêtes réelles est la compétence clé.",
    tips: ["Utilisez l'analogie de l'index d'un livre.", "Mentionnez le coût en écriture."],
    commonMistakes: ["Indexer chaque colonne.", "Penser que les index accélèrent toutes les requêtes."],
    followUpQuestions: ["Comment savez-vous si une requête utilise un index ?", "Qu'est-ce qu'un index unique ?"],
  },
  "db-020": {
    question: "Comment fonctionne un index B-tree, et quelles requêtes peuvent l'utiliser ?",
    intent: "Le recruteur vérifie une compréhension plus approfondie du type d'index le plus courant.",
    expectedAnswer:
      "Un B-tree est un arbre équilibré dont les pages feuilles contiennent les entrées d'index triées et chaînées entre elles, tandis que les niveaux supérieurs guident la recherche. Comme l'arbre reste peu profond, même avec des millions de lignes, une recherche ne lit que quelques pages, en O(log n). Les clés étant triées, un B-tree prend en charge l'égalité, les conditions de plage comme BETWEEN, >, <, les recherches par préfixe comme LIKE 'abc%', le ORDER BY sur les colonnes indexées ainsi que MIN ou MAX. Il n'aide pas pour les conditions qui ne correspondent pas à son ordre : un joker en tête comme LIKE '%abc', des fonctions appliquées à la colonne sauf s'il existe un index d'expression, ou, pour les index multicolonnes, des conditions qui ignorent la première colonne. Pour les colonnes peu sélectives, comme un booléen dont la plupart des lignes ont la même valeur, la base peut préférer un parcours complet de la table.",
    explanation:
      "Comprendre l'ordre trié explique quels prédicats bénéficient d'un index et pourquoi certaines requêtes l'ignorent.",
    tips: ["Expliquez les feuilles triées et la profondeur de l'arbre.", "Énumérez les types de requêtes pris en charge et non pris en charge."],
    commonMistakes: ["S'attendre à ce qu'un index aide une recherche avec un joker en tête.", "Appliquer une fonction à une colonne indexée dans le WHERE."],
    followUpQuestions: ["Comment prendriez-vous en charge une recherche d'e-mail insensible à la casse ?", "Quels autres types d'index PostgreSQL propose-t-il ?"],
  },
};
