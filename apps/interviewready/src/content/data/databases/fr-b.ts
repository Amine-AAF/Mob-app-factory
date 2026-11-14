import type { QuestionText, TextTable } from '@/types/content';

/** Questions bases de données 021-040 : index (partie), transactions, optimisation des requêtes, conception de base de données. */
export const frB: TextTable<QuestionText> = {
  "db-021": {
    question: "Comment choisissez-vous l'ordre des colonnes dans un index composite ?",
    intent: "Le recruteur vérifie une compétence pratique d'indexation qui influence fortement les performances des requêtes.",
    expectedAnswer:
      "Un index B-tree composite sur (a, b, c) est trié par a, puis par b au sein de chaque a, puis par c. Il peut servir pour des conditions sur a, sur a et b, ou sur a, b et c, mais en général pas pour une condition sur b seul : c'est la règle du « préfixe le plus à gauche » (leftmost prefix). J'ordonne donc les colonnes en fonction des requêtes : d'abord les colonnes comparées par égalité, puis la colonne utilisée dans une plage ou pour le tri. Par exemple, pour WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC, un index sur (tenant_id, status, created_at) permet à la base de trouver les lignes et de les renvoyer déjà triées. Placer la colonne de plage en premier, comme created_at, empêcherait d'exploiter efficacement les colonnes suivantes. La sélectivité compte aussi, mais la forme des requêtes compte davantage. Un index composite bien conçu peut souvent remplacer plusieurs index sur une seule colonne.",
    explanation:
      "La règle du préfixe le plus à gauche et le principe « égalité avant plage » sont les idées clés pour concevoir des index composites.",
    example: "CREATE INDEX idx_orders_tenant_status_date ON orders (tenant_id, status, created_at DESC);",
    tips: ["Expliquez la règle du préfixe le plus à gauche.", "Placez les colonnes d'égalité avant les colonnes de plage ou de tri."],
    commonMistakes: ["Créer des index séparés sur une seule colonne en s'attendant à ce qu'ils se comportent comme un index composite.", "Placer une colonne de plage en premier."],
    followUpQuestions: ["La base peut-elle utiliser l'index pour un ORDER BY dans le sens inverse ?", "Qu'est-ce qu'un index-only scan ?"],
  },
  "db-022": {
    question: "Dans quels cas ne faut-il pas ajouter d'index ?",
    intent: "Le recruteur vérifie que vous comprenez le coût des index et que vous ne les ajoutez pas à l'aveugle.",
    expectedAnswer:
      "J'évite un index quand son coût dépasse son bénéfice. Les tables à très fort trafic d'écriture, comme des journaux d'événements, paient chaque index à chaque insertion. Les colonnes peu sélectives, par exemple un statut à deux valeurs réparties équitablement, en profitent rarement, car lire la moitié de la table via un index est plus lent qu'un parcours séquentiel ; un index partiel sur la valeur rare peut être préférable. Les petites tables sont de toute façon parcourues rapidement. Les colonnes jamais utilisées dans des filtres, des jointures ou des tris n'ont pas besoin d'index, et les index dupliqués ou redondants, comme (a) alors que (a, b) existe déjà, gaspillent de l'espace. Je repère les index inutilisés grâce aux statistiques de la base, comme pg_stat_user_indexes dans PostgreSQL, et je fonde mes décisions sur des plans d'exécution réels plutôt que sur des suppositions.",
    explanation:
      "Une bonne indexation est une question d'équilibre. Supprimer les index inutilisés peut améliorer les performances d'écriture et réduire le stockage.",
    tips: ["Mentionnez les tables à forte écriture et la faible sélectivité.", "Expliquez comment repérer les index inutilisés."],
    commonMistakes: ["Ajouter un index pour chaque nouvelle requête sans vérifier les index existants."],
    followUpQuestions: ["Qu'est-ce qu'un index partiel ?", "Comment supprimeriez-vous un index en production sans risque ?"],
  },
  "db-023": {
    question: "Une requête n'utilise pas l'index que vous attendiez. Quelles peuvent en être les raisons ?",
    intent: "Le recruteur évalue votre compréhension approfondie des planificateurs de requêtes et de l'effet de l'écriture des requêtes sur l'utilisation des index.",
    expectedAnswer:
      "Plusieurs causes sont fréquentes. Le prédicat peut ne pas correspondre à l'index : une fonction ou une expression sur la colonne, comme WHERE LOWER(email) = ? ou WHERE DATE(created_at) = ?, empêche l'utilisation d'un index simple ; il faut alors un index sur expression ou réécrire la condition sous forme de plage. Une conversion de type implicite, par exemple comparer une colonne texte à un nombre, a le même effet. Un joker en tête, LIKE '%term', ne peut pas utiliser un B-tree ; il faut un index GIN trigramme ou une recherche plein texte. Avec un index composite, la requête peut omettre la colonne de tête. Des conditions combinées par OR sur des colonnes différentes peuvent conduire à un parcours complet. Le planificateur peut aussi décider à juste titre qu'un parcours séquentiel est moins coûteux, parce que la condition correspond à une grande partie des lignes ou parce que la table est petite. Enfin, des statistiques obsolètes peuvent produire de mauvaises estimations du nombre de lignes ; lancer ANALYZE corrige ce problème. Avec des requêtes préparées, PostgreSQL peut basculer vers un plan générique qui ignore la valeur précise du paramètre. Je comparerais les lignes estimées et réelles dans EXPLAIN ANALYZE pour identifier le cas en cause, plutôt que de forcer l'index.",
    explanation:
      "L'utilisation d'un index dépend de la forme du prédicat, de la distribution des données et des statistiques. Les candidats expérimentés diagnostiquent avec EXPLAIN ANALYZE au lieu de supposer que le planificateur se trompe.",
    tips: ["Regroupez les causes en trois familles : forme de la requête, distribution des données et statistiques.", "Mentionnez les index sur expression.", "Comparez les lignes estimées et réelles."],
    commonMistakes: ["Forcer l'utilisation d'un index avec des hints sans comprendre le plan.", "Oublier de lancer ANALYZE après un chargement massif de données."],
    followUpQuestions: ["Comment indexeriez-vous une recherche insensible à la casse ?", "Qu'est-ce qu'un plan générique dans PostgreSQL ?"],
  },
  "db-024": {
    question: "Expliquez les index couvrants, les index partiels et les types d'index spécialisés de PostgreSQL.",
    intent: "Le recruteur vérifie votre maîtrise des outils d'indexation avancés adaptés à des problèmes de performance précis.",
    expectedAnswer:
      "Un index couvrant contient toutes les colonnes dont une requête a besoin, si bien que la base peut y répondre par un index-only scan sans lire la table. Dans PostgreSQL, INCLUDE ajoute des colonnes hors clé à un index dans ce but, par exemple CREATE INDEX ON orders (customer_id) INCLUDE (total, status). Les index-only scans dépendent aussi d'une visibility map à jour, que VACUUM entretient. Un index partiel ne couvre que les lignes qui satisfont une condition, comme WHERE status = 'PENDING', ce qui garde l'index petit et rapide quand les requêtes ciblent un petit sous-ensemble ; il peut aussi imposer l'unicité sur un sous-ensemble, par exemple un seul abonnement actif par utilisateur. Au-delà du B-tree, PostgreSQL propose GIN pour les valeurs contenant de nombreux éléments, comme JSONB, les tableaux et la recherche plein texte ; GiST pour les recherches géométriques, sur des plages et du plus proche voisin, utilisé par PostGIS ; BRIN, un index minuscule pour les très grandes tables dont les valeurs sont corrélées à l'ordre physique, comme des séries temporelles en ajout seul ; et les index hash pour l'égalité pure. Des extensions en ajoutent d'autres, comme pg_trgm pour la recherche par similarité et les index HNSW de pgvector pour les embeddings.",
    explanation:
      "Choisir le bon type d'index selon les données et la forme des requêtes peut transformer les performances. Les candidats expérimentés savent quand le B-tree n'est pas le bon outil.",
    example: "CREATE UNIQUE INDEX one_active_sub ON subscriptions (user_id) WHERE status = 'ACTIVE';",
    tips: ["Donnez un cas d'usage concret pour chaque type.", "Mentionnez INCLUDE et la visibility map.", "Montrez un index unique partiel."],
    commonMistakes: ["Utiliser un B-tree pour des requêtes d'inclusion sur du JSONB.", "Créer de gros index alors qu'un index partiel suffirait."],
    followUpQuestions: ["Quand BRIN est-il un bon choix ?", "Comment indexez-vous une clé JSONB utilisée dans des filtres ?"],
  },
  "db-025": {
    question: "Que signifie ACID pour les transactions d'une base de données ?",
    intent: "Le recruteur vérifie un concept fondamental du stockage fiable des données.",
    expectedAnswer:
      "ACID décrit quatre garanties des transactions. Atomicité (Atomicity) : toutes les opérations d'une transaction réussissent, ou aucune ; si un virement bancaire débite un compte, le crédit sur l'autre compte a lieu aussi, sinon les deux sont annulés. Cohérence (Consistency) : une transaction fait passer la base d'un état valide à un autre, en respectant les contraintes comme les clés étrangères et les clés uniques. Isolation : les transactions concurrentes ne voient pas les modifications non validées des autres, dans une mesure définie par le niveau d'isolation. Durabilité (Durability) : une fois validées, les modifications survivent aux pannes, car elles sont écrites dans un journal sur disque avant d'être confirmées.",
    explanation:
      "ACID est ce qui rend les bases relationnelles fiables pour des données critiques comme les paiements et les stocks.",
    tips: ["Utilisez l'exemple du virement bancaire.", "Précisez que l'isolation comporte plusieurs niveaux."],
    commonMistakes: ["Confondre la cohérence d'une base de données avec la cohérence du théorème CAP."],
    followUpQuestions: ["Quels sont les niveaux d'isolation ?", "Comment une base de données garantit-elle la durabilité ?"],
  },
  "db-026": {
    question: "Que sont les niveaux d'isolation des transactions, et quelles anomalies empêchent-ils ?",
    intent: "Le recruteur vérifie votre compréhension des compromis de concurrence au sein de la base de données.",
    expectedAnswer:
      "Le standard SQL définit quatre niveaux. Read Uncommitted autorise les lectures sales (dirty reads), c'est-à-dire voir les données de transactions pas encore validées ; PostgreSQL le traite comme Read Committed. Read Committed, le niveau par défaut de PostgreSQL, ne voit que les données validées, mais chaque instruction voit un nouvel instantané (snapshot) : lire deux fois la même ligne peut donc renvoyer des valeurs différentes, ce qu'on appelle une lecture non répétable. Repeatable Read conserve un seul instantané pour toute la transaction ; dans PostgreSQL, il empêche aussi les lignes fantômes, mais le write skew reste possible, par exemple deux médecins qui quittent tous deux l'astreinte parce que chacun a vu l'autre encore d'astreinte. Serializable garantit que le résultat est le même que si les transactions s'exécutaient l'une après l'autre ; PostgreSQL l'implémente avec la serializable snapshot isolation et annule les transactions en conflit, que l'application doit donc relancer. Les niveaux plus élevés offrent des garanties plus fortes au prix de davantage de conflits et de nouvelles tentatives. MySQL InnoDB utilise Repeatable Read par défaut : le comportement diffère donc d'une base à l'autre.",
    explanation:
      "Savoir quelle anomalie chaque niveau empêche, et que les bases de données diffèrent, aide à choisir le bon niveau et à gérer les nouvelles tentatives.",
    tips: ["Nommez les anomalies : lecture sale, lecture non répétable, ligne fantôme, write skew.", "Mentionnez les niveaux par défaut de PostgreSQL et de MySQL.", "Évoquez les nouvelles tentatives en Serializable."],
    commonMistakes: ["Supposer que le niveau par défaut empêche tous les problèmes de concurrence.", "Utiliser Serializable sans logique de nouvelle tentative."],
    followUpQuestions: ["Qu'est-ce que le write skew ?", "Comment empêcheriez-vous la double réservation d'une salle ?"],
  },
  "db-027": {
    question: "Comment les interblocages se produisent-ils dans une base de données, et comment les éviter ?",
    intent: "Le recruteur vérifie votre expérience des problèmes de verrouillage dans des applications réelles.",
    expectedAnswer:
      "Un interblocage (deadlock) survient quand deux transactions détiennent chacune un verrou dont l'autre a besoin : la transaction A met à jour la ligne 1 puis veut la ligne 2, tandis que B met à jour la ligne 2 puis veut la ligne 1. La base détecte le cycle et annule l'une des transactions avec une erreur ; l'application doit donc être prête à la relancer. Pour réduire les interblocages, j'accède aux lignes et aux tables dans un ordre cohérent, par exemple en mettant à jour les comptes triés par identifiant ; je garde les transactions courtes, sans interaction utilisateur ni appel distant à l'intérieur ; je verrouille d'emblée ce dont j'ai besoin avec SELECT ... FOR UPDATE quand c'est pertinent ; et je m'assure que les mises à jour utilisent des index afin de verrouiller moins de lignes. Les journaux de la base montrent les requêtes impliquées dans chaque interblocage, ce qui aide à retrouver les chemins de code en conflit.",
    explanation:
      "Les interblocages sont souvent causés par un ordre d'accès incohérent et des transactions longues. Un ordre cohérent associé à des nouvelles tentatives est l'approche standard.",
    tips: ["Donnez un exemple avec deux transactions.", "Mentionnez la logique de nouvelle tentative et l'ordre d'accès cohérent."],
    commonMistakes: ["Ignorer les erreurs d'interblocage au lieu de relancer la transaction.", "Faire des appels HTTP à l'intérieur de transactions ouvertes."],
    followUpQuestions: ["Comment trouveriez-vous les requêtes à l'origine d'un interblocage ?", "Qu'est-ce qu'un délai d'attente de verrou (lock timeout) ?"],
  },
  "db-028": {
    question: "Quelle est la différence entre le verrouillage optimiste et le verrouillage pessimiste ?",
    intent: "Le recruteur vérifie votre capacité à gérer correctement les mises à jour concurrentes dans les applications.",
    expectedAnswer:
      "Le verrouillage pessimiste empêche les conflits en verrouillant les données avant de les modifier, par exemple avec SELECT ... FOR UPDATE, si bien que les autres transactions attendent la libération du verrou. Il est sûr quand les conflits sont fréquents ou que leur coût est élevé, mais il réduit la concurrence et peut provoquer des attentes ou des interblocages. Le verrouillage optimiste part du principe que les conflits sont rares : chaque ligne porte un numéro de version ou un horodatage, et la mise à jour l'inclut dans sa condition, UPDATE ... SET ..., version = version + 1 WHERE id = ? AND version = ?. Si aucune ligne n'est mise à jour, quelqu'un d'autre l'a modifiée avant ; l'application recharge alors les données et réessaie, ou affiche un message de conflit à l'utilisateur. JPA le prend en charge avec @Version. Le verrouillage optimiste convient aux applications web où les utilisateurs modifient des données pendant longtemps sans détenir de verrou en base.",
    explanation:
      "Le choix dépend de la fréquence des conflits et de la durée pendant laquelle un utilisateur ou un processus travaille sur les données.",
    tips: ["Montrez la condition de l'UPDATE versionné.", "Donnez un cas d'usage pour chacun."],
    commonMistakes: ["Conserver un verrou pessimiste pendant qu'un utilisateur remplit un formulaire.", "Ignorer le résultat « zéro ligne mise à jour » en verrouillage optimiste."],
    followUpQuestions: ["Que fait SKIP LOCKED ?", "Comment présenteriez-vous un conflit à l'utilisateur ?"],
  },
  "db-029": {
    question: "Deux utilisateurs achètent le dernier article en stock au même moment. Comment évitez-vous la survente ?",
    intent: "Le recruteur évalue votre maîtrise avancée des situations de concurrence (race conditions) au niveau de la base de données.",
    expectedAnswer:
      "Le bug vient d'une séquence lecture puis écriture : les deux requêtes lisent stock = 1, constatent toutes deux que l'article est disponible et écrivent toutes deux 0, ou créent deux commandes. La correction la plus robuste consiste à faire de la vérification et de la modification une seule opération atomique : UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0, puis à vérifier le nombre de lignes affectées ; s'il est nul, l'article est épuisé. Une contrainte CHECK (stock >= 0) ajoute un filet de sécurité. Les alternatives sont un verrou pessimiste avec SELECT ... FOR UPDATE dans une transaction avant de créer la commande, ou un verrouillage optimiste avec une colonne de version et des nouvelles tentatives. Pour des ventes flash avec une très forte contention sur une seule ligne, j'envisagerais des modèles de réservation, comme une file d'attente ou un compteur atomique Redis, la base de données restant la source de vérité finale. La création de la commande et la mise à jour du stock doivent se faire dans la même transaction, et la requête d'achat doit être idempotente pour qu'une nouvelle tentative du client ne décrémente pas deux fois.",
    explanation:
      "Les mises à jour conditionnelles atomiques et les contraintes suppriment la situation de concurrence au lieu d'en réduire la probabilité. Les réponses avancées traitent aussi de la forte contention et de l'idempotence.",
    example: "UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock;",
    tips: ["Expliquez la situation de concurrence lecture puis écriture.", "Montrez la mise à jour conditionnelle atomique.", "Mentionnez les contraintes et l'idempotence."],
    commonMistakes: ["Vérifier le stock dans le code applicatif avant la mise à jour sans verrou.", "Compter sur un niveau d'isolation plus élevé sans gérer les erreurs de sérialisation."],
    followUpQuestions: ["Comment cela fonctionnerait-il avec des réservations qui expirent au bout de 10 minutes ?", "Qu'est-ce qui change si le stock est réparti entre plusieurs entrepôts ?"],
  },
  "db-030": {
    question: "Comment la réplication et la cohérence interagissent-elles ? Expliquez le read-your-writes et le théorème CAP en pratique.",
    intent: "Le recruteur évalue votre compréhension approfondie des compromis liés aux données distribuées.",
    expectedAnswer:
      "Avec une réplication asynchrone, le primaire confirme une écriture avant que les réplicas ne la reçoivent : les réplicas ont donc du retard, généralement quelques millisecondes, mais parfois plusieurs secondes sous charge. Si une application écrit sur le primaire puis lit immédiatement sur un réplica, l'utilisateur peut ne pas voir sa propre modification, ce qui rompt la cohérence read-your-writes. Parmi les solutions : diriger les lectures d'un utilisateur vers le primaire pendant un court moment après une écriture, ne lire sur les réplicas que les données pour lesquelles un léger décalage est acceptable, utiliser la réplication synchrone pour les données critiques au prix d'une latence d'écriture plus élevée, ou transmettre une position dans le journal pour qu'un réplica attende d'avoir rattrapé son retard. Le théorème CAP indique que, pendant une partition réseau, un système distribué doit choisir entre la cohérence, en refusant ou en retardant certaines requêtes, et la disponibilité, en répondant avec des données potentiellement obsolètes. En dehors des partitions, l'extension PACELC décrit le compromis entre latence et cohérence. En pratique, je choisis selon le cas d'usage : les soldes de comptes et les stocks exigent une cohérence forte, tandis que les catalogues produits ou l'analytique tolèrent des données légèrement obsolètes.",
    explanation:
      "Le retard de réplication est la manifestation quotidienne du compromis CAP. Les candidats expérimentés proposent des techniques concrètes et choisissent le niveau de cohérence selon le cas d'usage.",
    tips: ["Expliquez le retard de réplication avec un exemple visible par l'utilisateur.", "Proposez des solutions pratiques.", "Présentez correctement CAP et PACELC."],
    commonMistakes: ["Affirmer qu'on peut avoir à la fois cohérence et disponibilité pendant une partition.", "Envoyer toutes les lectures vers les réplicas sans tenir compte du retard."],
    followUpQuestions: ["Quelle est la différence entre réplication synchrone et asynchrone ?", "Comment surveillez-vous le retard de réplication ?"],
  },
  "db-031": {
    question: "Comment abordez-vous l'optimisation d'une requête SQL lente ?",
    intent: "Le recruteur vérifie que vous suivez une méthode structurée d'analyse des performances plutôt que des suppositions.",
    expectedAnswer:
      "Je commence par mesurer : à quel point elle est lente, à quelle fréquence elle s'exécute et si elle est lente à chaque fois ou seulement avec certains paramètres. Ensuite, j'examine le plan d'exécution avec EXPLAIN ANALYZE pour voir où le temps est passé : parcours complets de grandes tables, boucles imbriquées sur de nombreuses lignes, tris volumineux ou nombres de lignes estimés très éloignés de la réalité. Les corrections typiques consistent à ajouter ou ajuster un index qui correspond aux clauses WHERE, JOIN et ORDER BY, à ne sélectionner que les colonnes nécessaires au lieu de SELECT *, à éviter les fonctions sur les colonnes indexées, à réécrire les sous-requêtes corrélées, à ajouter de la pagination ou des limites, et à mettre à jour les statistiques. Si la requête est intrinsèquement lourde, comme un gros rapport, j'envisage la pré-agrégation ou la mise en cache. Après chaque modification, je mesure de nouveau avec des volumes de données réalistes.",
    explanation:
      "Mesurer, lire le plan, changer une seule chose, mesurer à nouveau : c'est la boucle centrale de l'optimisation des requêtes.",
    tips: ["Commencez par la mesure et le plan d'exécution.", "Énumérez les corrections courantes.", "Testez avec des volumes de données réalistes."],
    commonMistakes: ["Ajouter des index au hasard.", "Tester sur une base de développement minuscule."],
    followUpQuestions: ["Que signifie un parcours séquentiel (Seq Scan) dans un plan ?", "Pourquoi SELECT * est-il déconseillé ?"],
  },
  "db-032": {
    question: "Comment lisez-vous la sortie de EXPLAIN ANALYZE ?",
    intent: "Le recruteur vérifie votre capacité pratique à interpréter des plans d'exécution.",
    expectedAnswer:
      "Le plan est un arbre d'opérations qui se lit depuis les nœuds les plus indentés, exécutés en premier, jusqu'à la racine. Chaque nœud indique son type, comme Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan, Nested Loop, Hash Join, Merge Join ou Sort, avec le coût et le nombre de lignes estimés et, avec ANALYZE, le temps réel, le nombre réel de lignes et le nombre de boucles (loops). Je cherche les nœuds dont le temps réel est le plus élevé, en gardant à l'esprit que le temps est cumulatif et multiplié par le nombre de boucles. Un écart important entre lignes estimées et lignes réelles signale des statistiques obsolètes ou insuffisantes, et explique souvent un mauvais choix de jointure, comme un Nested Loop sur plusieurs milliers de lignes. Des tris ou des hachages qui débordent sur disque indiquent un manque de mémoire. Ajouter BUFFERS montre combien de pages ont été lues depuis le cache ou depuis le disque. Des outils comme explain.depesz.com ou pgMustard facilitent la lecture des plans volumineux.",
    explanation:
      "Les plans d'exécution montrent ce que la base fait réellement. Comparer les estimations aux valeurs réelles est le réflexe de diagnostic le plus utile.",
    tips: ["Expliquez comment lire l'arbre.", "Mettez en avant la comparaison entre lignes estimées et lignes réelles.", "Mentionnez BUFFERS."],
    commonMistakes: ["Ne regarder que le coût total.", "Oublier que EXPLAIN ANALYZE exécute réellement la requête."],
    followUpQuestions: ["Quand un Nested Loop est-il un bon choix ?", "Comment corrigeriez-vous de mauvaises estimations de lignes sur des colonnes corrélées ?"],
  },
  "db-033": {
    question: "Comment accéléreriez-vous des requêtes analytiques lourdes sur une grande base transactionnelle ?",
    intent: "Le recruteur vérifie votre capacité à séparer les charges de travail analytiques et transactionnelles.",
    expectedAnswer:
      "Les requêtes analytiques qui parcourent et agrègent des millions de lignes entrent en concurrence avec le trafic transactionnel. D'abord, j'optimiserais les requêtes elles-mêmes et j'ajouterais des index adaptés. Ensuite, je pré-calculerais les résultats : des vues matérialisées rafraîchies selon un planning, avec REFRESH MATERIALIZED VIEW CONCURRENTLY dans PostgreSQL pour ne pas bloquer les lectures, ou des tables de synthèse mises à jour de façon incrémentale, par exemple le chiffre d'affaires quotidien par produit. Partitionner les grandes tables par date permet aux requêtes de ne lire que les périodes concernées. Exécuter les rapports sur un réplica en lecture les isole du primaire. Pour des besoins plus importants, je déplacerais l'analytique vers un entrepôt de données en colonnes comme BigQuery, Snowflake ou ClickHouse, alimenté par un pipeline ETL ou de change data capture, car le stockage en colonnes ne lit que les colonnes nécessaires et se compresse bien. Le compromis porte sur la fraîcheur des données : les tableaux de bord peuvent avoir des minutes ou des heures de retard, ce qui doit être acceptable pour les utilisateurs.",
    explanation:
      "Séparer les charges OLTP et OLAP, par pré-agrégation, réplicas ou entrepôts de données, protège les performances de l'application.",
    tips: ["Mentionnez les vues matérialisées et les tables de synthèse.", "Expliquez pourquoi les entrepôts en colonnes sont plus rapides pour l'analytique.", "Abordez la fraîcheur des données."],
    commonMistakes: ["Exécuter des rapports lourds sur le primaire aux heures de pointe.", "Rafraîchir une grande vue matérialisée toutes les minutes."],
    followUpQuestions: ["Quelle est la différence entre OLTP et OLAP ?", "Comment construiriez-vous une table de synthèse incrémentale ?"],
  },
  "db-034": {
    question: "Une requête est rapide en préproduction mais très lente en production. Qu'est-ce qui pourrait l'expliquer ?",
    intent: "Le recruteur évalue votre capacité avancée à diagnostiquer des problèmes de performance qui dépendent de l'environnement.",
    expectedAnswer:
      "La cause la plus fréquente, ce sont les données : la production en contient beaucoup plus, avec une distribution différente, si bien que le planificateur choisit un autre plan, par exemple un Nested Loop acceptable avec cent lignes mais désastreux avec un million, ou une valeur très fréquente qui rend un index inutile. Des données asymétriques, comme un client gigantesque, peuvent rendre la même requête rapide pour la plupart des paramètres et lente pour certains. Les statistiques peuvent être obsolètes en production après un gros import, ou l'autovacuum peut prendre du retard et provoquer du bloat. La production subit aussi la concurrence : attentes de verrous, contention sur des lignes très sollicitées, pool de connexions saturé ou I/O partagées avec d'autres charges. La configuration peut différer : paramètres mémoire comme work_mem, index présents en préproduction mais absents en production, ou version différente de la base. La mise en cache des plans avec des requêtes préparées peut produire un plan générique mauvais pour certaines valeurs. Pour enquêter, je capturerais le plan réel de production avec EXPLAIN ANALYZE ou auto_explain, je le comparerais à celui de préproduction, je vérifierais dans pg_stat_statements les variations selon les paramètres et j'examinerais les wait events. À long terme, la préproduction devrait utiliser des volumes de données comparables à la production, anonymisés si nécessaire.",
    explanation:
      "Les performances dépendent du volume et de la distribution des données, de la concurrence et de la configuration. Les candidats expérimentés comparent les plans réels au lieu de faire des suppositions.",
    tips: ["Commencez par le volume et la distribution des données.", "Incluez la concurrence, la configuration et la mise en cache des plans.", "Expliquez comment capturer le plan de production."],
    commonMistakes: ["Supposer qu'un code identique implique des performances identiques.", "Ne tester qu'avec des jeux de données minuscules."],
    followUpQuestions: ["Que fait auto_explain ?", "Comment créeriez-vous des données de test réalistes mais anonymisées ?"],
  },
  "db-035": {
    question: "Comment ajouteriez-vous un cache devant une base de données, et quels problèmes devez-vous gérer ?",
    intent: "Le recruteur évalue votre maîtrise de la conception d'un cache et votre conscience des problèmes de cohérence.",
    expectedAnswer:
      "Le pattern le plus courant est le cache-aside : l'application lit dans un cache comme Redis ; en cas d'absence (miss), elle lit la base, stocke le résultat avec une durée de vie (TTL) et le renvoie. Lors des écritures, elle met à jour la base puis supprime l'entrée du cache, plutôt que de la mettre à jour, pour limiter les situations de concurrence. Problèmes à gérer : les données obsolètes, limitées par le TTL et par l'invalidation lors des écritures ; le thundering herd ou cache stampede, quand une clé populaire expire et que de nombreuses requêtes frappent la base en même temps, résolu par le regroupement des requêtes, un verrou par clé ou un rafraîchissement anticipé avec du jitter ; la cache penetration, quand des requêtes sur des clés inexistantes ratent toujours le cache, résolue en mettant brièvement en cache les résultats négatifs ; la cohérence quand l'écriture en base réussit mais que la suppression dans le cache échoue, gérée par des nouvelles tentatives ou une invalidation pilotée par change data capture ; et les limites de mémoire, avec une politique d'éviction comme LRU. Je ne mettrais en cache que des données lues souvent et qui tolèrent un bref décalage, jamais des décisions d'autorisation sans grande prudence, et je surveillerais le taux de succès (hit rate). La base doit rester correcte si le cache est vide ou indisponible.",
    explanation:
      "Un cache est facile à ajouter et difficile à garder correct. Les réponses avancées couvrent l'invalidation, les stampedes, la mise en cache négative et les modes de défaillance.",
    tips: ["Décrivez clairement le cache-aside.", "Expliquez les problèmes de stampede et d'invalidation.", "Précisez ce qui ne doit pas être mis en cache."],
    commonMistakes: ["Mettre en cache sans TTL ni stratégie d'invalidation.", "Laisser l'application tomber en panne quand le cache est indisponible."],
    followUpQuestions: ["Quelle est la différence entre cache-aside et write-through ?", "Comment choisissez-vous un TTL ?"],
  },
  "db-036": {
    question: "Que sont les clés primaires, les clés étrangères et la normalisation ?",
    intent: "Le recruteur vérifie les bases de la conception relationnelle.",
    expectedAnswer:
      "Une clé primaire identifie de façon unique chaque ligne d'une table, comme customer_id, et ne peut pas être NULL. Une clé étrangère est une colonne qui référence la clé primaire d'une autre table, comme orders.customer_id qui référence customers.id ; la base rejette alors les commandes de clients inexistants, ce qui protège l'intégrité des données. La normalisation organise les données pour éviter les doublons : au lieu de répéter le nom et l'adresse du client dans chaque commande, on les stocke une seule fois dans une table customers et on les référence. Cela évite les incohérences, comme une adresse mise à jour à un endroit mais pas à un autre, et simplifie les mises à jour.",
    explanation:
      "Les clés et la normalisation sont le fondement de l'intégrité des données dans les bases relationnelles.",
    tips: ["Utilisez un exemple avec des clients et des commandes.", "Expliquez le problème que résout la normalisation."],
    commonMistakes: ["Ne pas déclarer de clés étrangères et s'en remettre uniquement au code applicatif."],
    followUpQuestions: ["Qu'advient-il des commandes quand un client est supprimé ?", "Qu'est-ce qu'une clé primaire composite ?"],
  },
  "db-037": {
    question: "Expliquez les trois premières formes normales. Quand dénormaliseriez-vous ?",
    intent: "Le recruteur vérifie des connaissances de conception plus approfondies et votre sens des compromis pragmatiques.",
    expectedAnswer:
      "La première forme normale exige des valeurs atomiques : pas de listes dans une colonne, comme plusieurs numéros de téléphone dans un même champ, ni de groupes de colonnes répétés. La deuxième forme normale, pertinente pour les clés composites, exige que chaque colonne hors clé dépende de la clé entière et non d'une partie : dans une table order_items dont la clé est la commande et le produit, le nom du produit ne dépend que du produit et doit se trouver dans la table products. La troisième forme normale exige que les colonnes hors clé dépendent uniquement de la clé et non d'autres colonnes hors clé : stocker à la fois une ville et son pays dans une table customers, alors que le pays dépend de la ville, crée de la redondance. La dénormalisation ajoute délibérément de la redondance pour des raisons de performance ou de simplicité, par exemple stocker le total de la commande, copier le prix du produit au moment de l'achat, ce qui est aussi une exigence métier, ou maintenir des modèles de lecture pour les rapports. Elle doit être maîtrisée, avec une source de vérité claire et un moyen de garder les copies synchronisées.",
    explanation:
      "Les formes normales réduisent les anomalies. Dénormaliser intentionnellement, avec un plan pour garder les données cohérentes, est le signe d'une conception mature.",
    tips: ["Donnez un exemple de violation pour chaque forme.", "Citez un cas où la dénormalisation est justifiée, comme le prix au moment de l'achat."],
    commonMistakes: ["Dénormaliser trop tôt sans besoin mesuré.", "Confondre des données historiques, comme le prix au moment de l'achat, avec de la redondance."],
    followUpQuestions: ["Comment garderiez-vous un total dénormalisé synchronisé ?", "Qu'est-ce que la BCNF ?"],
  },
  "db-038": {
    question: "Faut-il utiliser des entiers auto-incrémentés ou des UUID comme clés primaires ?",
    intent: "Le recruteur vérifie votre jugement pratique en matière de conception des identifiants.",
    expectedAnswer:
      "Les entiers auto-incrémentés, comme les colonnes BIGINT identity, sont compacts, rapides à indexer et faciles à lire, mais ils révèlent des informations comme le nombre de commandes, sont devinables dans les URL et sont générés par une seule base, ce qui complique la fusion de données ou la génération d'identifiants côté client. Les UUID peuvent être générés n'importe où sans coordination, ce qui aide les systèmes distribués, les clients hors ligne et les imports de données, et ils ne révèlent pas de volumes. Les UUID aléatoires, version 4, provoquent des insertions dispersées dans les index B-tree et des index plus volumineux, ce qui pénalise les performances d'écriture sur les grandes tables. Les UUID ordonnés dans le temps comme UUIDv7, standardisé en 2024, conservent les avantages tout en s'insérant dans un ordre à peu près séquentiel. Un compromis courant consiste à utiliser une clé entière interne pour les jointures et un UUID ou un slug public distinct pour l'usage externe. Quel que soit le choix, les identifiants ne doivent pas servir de mécanisme d'autorisation.",
    explanation:
      "La décision met en balance performance, sécurité, distribution et lisibilité. Mentionner UUIDv7 montre que vos connaissances sont à jour.",
    tips: ["Comparez les deux options sur la performance, la sécurité et la distribution.", "Mentionnez UUIDv7."],
    commonMistakes: ["Compter sur des identifiants impossibles à deviner au lieu de contrôles d'accès.", "Utiliser des UUID aléatoires sur de très grandes tables à forte écriture sans tenir compte de l'impact sur les index."],
    followUpQuestions: ["Quels sont les risques de sécurité des identifiants séquentiels dans les URL ?", "Comment générez-vous des identifiants dans une application offline-first ?"],
  },
  "db-039": {
    question: "Comment modifieriez-vous le schéma d'une grande table de production sans interruption de service ?",
    intent: "Le recruteur évalue vos pratiques avancées de migration sûre sur des systèmes en production.",
    expectedAnswer:
      "J'utiliserais le pattern expand and contract pour que l'ancienne et la nouvelle version de l'application fonctionnent pendant la transition. Pour renommer une colonne, par exemple : d'abord ajouter la nouvelle colonne, nullable et sans valeur par défaut coûteuse, ce qui est rapide ; déployer du code qui écrit dans les deux colonnes ; remplir les lignes existantes (backfill) par petits lots avec des pauses, pour éviter les verrous longs, les grosses transactions et le retard de réplication ; puis basculer les lectures vers la nouvelle colonne ; et seulement quand tout le code en cours d'exécution l'utilise, supprimer l'ancienne colonne dans une version ultérieure. Certaines opérations demandent de la prudence : dans PostgreSQL, créer les index avec CREATE INDEX CONCURRENTLY, ajouter les clés étrangères et les contraintes CHECK en NOT VALID puis les valider séparément, et définir un lock_timeout pour qu'une migration en attente d'un verrou ne bloque pas tout le trafic derrière elle. Ajouter une colonne avec une valeur par défaut constante est rapide depuis PostgreSQL 11, mais changer le type d'une colonne réécrit généralement la table. Les migrations sont versionnées avec des outils comme Flyway ou Liquibase, testées sur une copie de taille comparable à la production et surveillées pendant leur exécution, avec un plan de retour arrière pour chaque étape.",
    explanation:
      "Les migrations sans interruption reposent sur des étapes rétrocompatibles, des backfills par lots et du DDL conscient des verrous. Les candidats expérimentés savent quelles opérations verrouillent ou réécrivent les tables.",
    tips: ["Expliquez le pattern expand and contract.", "Mentionnez les backfills par lots et lock_timeout.", "Citez la création d'index concurrente et les contraintes NOT VALID."],
    commonMistakes: ["Renommer ou supprimer une colonne dans la même version que la modification du code.", "Lancer un seul énorme UPDATE sur des millions de lignes."],
    followUpQuestions: ["Comment passeriez-vous une colonne de INT à BIGINT sur une table énorme ?", "Comment testez-vous une migration avant de l'exécuter en production ?"],
  },
  "db-040": {
    question: "Comment concevriez-vous la base de données d'une application SaaS multi-tenant ?",
    intent: "Le recruteur évalue vos compétences avancées en architecture, entre isolation, coût et exploitation.",
    expectedAnswer:
      "Il existe trois modèles principaux. Un schéma partagé stocke tous les tenants dans les mêmes tables avec une colonne tenant_id : c'est le modèle le moins coûteux et le plus simple à exploiter et à migrer, mais chaque requête doit filtrer par tenant, et un gros tenant peut affecter les autres. Dans PostgreSQL, des politiques de row-level security peuvent imposer le filtre par tenant dans la base comme filet de sécurité, et les index composites doivent commencer par tenant_id. Un schéma par tenant offre une meilleure séparation et facilite l'export ou la restauration par tenant, mais les migrations doivent s'exécuter sur de nombreux schémas et le nombre d'objets croît rapidement. Une base par tenant offre l'isolation la plus forte, un réglage par tenant et la maîtrise de la localisation des données (data residency), que les clients importants ou réglementés peuvent exiger, au coût d'exploitation le plus élevé. Beaucoup de produits adoptent un modèle hybride : schéma partagé pour la plupart des tenants et bases dédiées pour les clients grands comptes, avec une couche de routage qui associe chaque tenant à sa base. Je prévoirais aussi des sauvegardes et des suppressions par tenant pour les demandes liées à la vie privée, une protection contre les noisy neighbours comme des limites de débit par tenant, et un sharding par tenant si la base partagée devient trop volumineuse.",
    explanation:
      "Le multi-tenant est un compromis entre isolation et coût. Les réponses avancées incluent des mécanismes d'application comme la row-level security et anticipent la croissance et la conformité.",
    tips: ["Comparez les trois modèles.", "Mentionnez la row-level security et les index commençant par tenant_id.", "Abordez la conformité, la suppression des données et les noisy neighbours."],
    commonMistakes: ["S'en remettre uniquement au code applicatif pour filtrer les tenants.", "Choisir une base par tenant pour des milliers de petits tenants."],
    followUpQuestions: ["Comment déplaceriez-vous un tenant de la base partagée vers une base dédiée ?", "Comment exécutez-vous des migrations sur de nombreux schémas de tenants ?"],
  },
};
