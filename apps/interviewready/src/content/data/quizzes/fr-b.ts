import type { QuizText, TextTable } from '@/types/content';

/** Quiz items B (FR): bases de données, DevOps, IA & data, RH & salaire (75 items). */
export const frB: TextTable<QuizText> = {
  // Bases de données (20)
  'q-db-001': {
    prompt: "Quelle jointure renvoie tous les clients, y compris ceux qui n'ont passé aucune commande ?",
    options: ["INNER JOIN orders", "CROSS JOIN orders", "customers LEFT JOIN orders", "customers RIGHT JOIN customers"],
    explanation: "Un LEFT JOIN conserve toutes les lignes de la table de gauche et remplit les correspondances manquantes avec NULL : les clients sans commande apparaissent donc quand même.",
  },
  'q-db-002': {
    prompt: "Quelle clause filtre les groupes après GROUP BY à l'aide d'un agrégat comme COUNT(*) ?",
    options: ["HAVING", "WHERE", "ORDER BY", "LIMIT"],
    explanation: "WHERE filtre les lignes avant le regroupement et ne peut pas utiliser d'agrégats. HAVING filtre les groupes produits par GROUP BY.",
  },
  'q-db-003': {
    prompt: "COUNT(column) compte aussi bien les lignes où la colonne vaut NULL que les lignes non NULL.",
    explanation: "COUNT(column) ignore les valeurs NULL. COUNT(*) compte toutes les lignes du groupe.",
  },
  'q-db-004': {
    prompt: "En SQL, la condition NULL = NULL est évaluée à vrai.",
    explanation: "Les comparaisons avec NULL renvoient UNKNOWN, si bien que WHERE écarte la ligne. Utilisez IS NULL pour tester les valeurs manquantes.",
  },
  'q-db-005': {
    prompt: "Quelle fonction numérote les lignes au sein de chaque groupe, par exemple pour trouver la dernière commande de chaque client ?",
    options: ["SUM() OVER (...)", "COUNT(DISTINCT ...)", "COALESCE()", "ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)"],
    explanation: "ROW_NUMBER avec PARTITION BY recommence la numérotation pour chaque groupe : en gardant les lignes numérotées 1, on obtient la ligne la plus récente de chaque client.",
  },
  'q-db-006': {
    prompt: "Pourquoi NOT IN avec une sous-requête peut-il ne renvoyer aucune ligne ?",
    options: ["La sous-requête contient des doublons", "La sous-requête renvoie au moins un NULL", "La sous-requête est triée", "La table principale possède un index"],
    explanation: "Si la sous-requête contient NULL, NOT IN est évalué à UNKNOWN pour chaque ligne. NOT EXISTS évite ce piège.",
  },
  'q-db-007': {
    prompt: "Dans PostgreSQL, quel est le rôle principal de VACUUM ?",
    options: ["Compresser les sauvegardes", "Récupérer l'espace occupé par les versions de lignes mortes créées par MVCC", "Chiffrer les tables", "Créer des index"],
    explanation: "Les mises à jour et suppressions laissent d'anciennes versions de lignes. VACUUM rend leur espace réutilisable et évite le bouclage des identifiants de transaction (wraparound).",
  },
  'q-db-008': {
    prompt: "Dans PostgreSQL, les colonnes JSONB peuvent être indexées, par exemple avec des index GIN.",
    explanation: "Les index GIN prennent en charge les requêtes de contenance et de clés sur JSONB, et les index sur expression peuvent cibler des clés précises.",
  },
  'q-db-009': {
    prompt: "Dans MongoDB, quand vaut-il généralement mieux référencer des données liées plutôt que les imbriquer ?",
    options: ["Quand les données liées sont toujours lues avec le parent", "Quand les données liées croissent sans limite, comme tous les événements d'un utilisateur", "Quand les données liées sont petites et fixes", "Quand vous n'interrogez jamais les données liées"],
    explanation: "Les tableaux non bornés rendent les documents volumineux et lents, et un document est limité à 16 Mo : mieux vaut donc référencer les données qui grossissent.",
  },
  'q-db-010': {
    prompt: "Pourquoi une valeur monotone croissante, comme un horodatage, est-elle une mauvaise clé de sharding MongoDB à elle seule ?",
    options: ["Elle ne peut pas être indexée", "Elle envoie toutes les nouvelles écritures vers le même shard", "Elle est trop longue", "Elle empêche la réplication"],
    explanation: "Les nouvelles valeurs tombent toujours dans la plage la plus haute, ce qui crée un point chaud sur un seul shard. Les clés hachées ou composées répartissent les écritures.",
  },
  'q-db-011': {
    prompt: "Quel est le principal coût de l'ajout d'un index ?",
    options: ["Les lectures deviennent plus lentes", "Du stockage supplémentaire et des écritures plus lentes", "Les données sont dupliquées dans une autre base", "Les requêtes ne peuvent plus utiliser WHERE"],
    explanation: "Chaque insertion, mise à jour et suppression doit aussi maintenir l'index, et l'index occupe de l'espace disque.",
  },
  'q-db-012': {
    prompt: "Pour WHERE tenant_id = ? AND status = ? ORDER BY created_at, quel ordre d'index composite est le plus efficace ?",
    options: ["(created_at, status, tenant_id)", "(status, created_at)", "(tenant_id, status, created_at)", "(created_at)"],
    explanation: "Placez d'abord les colonnes d'égalité et en dernier la colonne de tri ou de plage : la base trouve ainsi les lignes et les renvoie déjà triées.",
  },
  'q-db-013': {
    prompt: "Un index B-tree sur name peut accélérer la condition name LIKE '%son'.",
    explanation: "Un joker en début de motif ne correspond pas à l'ordre trié d'un B-tree. Il faut un index trigramme ou une recherche plein texte.",
  },
  'q-db-014': {
    prompt: "Quel type d'index PostgreSQL convient à une très grande table en ajout seul dont les valeurs suivent l'ordre d'insertion, comme des horodatages ?",
    options: ["GiST", "Hash", "GIN", "BRIN"],
    explanation: "BRIN stocke des résumés de plages de blocs : il est minuscule et efficace quand les valeurs sont corrélées à l'ordre physique.",
  },
  'q-db-015': {
    prompt: "Dans ACID, que garantit l'atomicité ?",
    options: ["Les données sont stockées sur plusieurs serveurs", "Toutes les opérations d'une transaction réussissent, ou aucune", "Les transactions s'exécutent l'une après l'autre", "Les requêtes sont toujours rapides"],
    explanation: "L'atomicité signifie qu'un virement ne peut pas débiter un compte sans créditer l'autre : la transaction entière est validée ou annulée.",
  },
  'q-db-016': {
    prompt: "Quel est le niveau d'isolation des transactions par défaut dans PostgreSQL ?",
    options: ["Read Committed", "Read Uncommitted", "Repeatable Read", "Serializable"],
    explanation: "PostgreSQL utilise Read Committed par défaut : chaque instruction voit les données validées avant son démarrage. MySQL InnoDB utilise Repeatable Read par défaut.",
  },
  'q-db-017': {
    prompt: "Comment le verrouillage optimiste détecte-t-il une mise à jour concurrente ?",
    options: ["Il verrouille la ligne avec SELECT FOR UPDATE", "Il vérifie une colonne de version dans la condition de l'UPDATE", "Il redémarre la base de données", "Il utilise un mutex global"],
    explanation: "La mise à jour inclut WHERE version = ? ; si aucune ligne n'est modifiée, quelqu'un a changé les données entre-temps et l'application réessaie ou signale un conflit.",
  },
  'q-db-018': {
    prompt: "UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0 empêche la survente, même avec des acheteurs concurrents.",
    explanation: "La vérification et la décrémentation ont lieu dans une seule instruction atomique ; zéro ligne affectée signifie que l'article est épuisé.",
  },
  'q-db-019': {
    prompt: "Dans la sortie d'EXPLAIN ANALYZE, quel indice signale souvent des statistiques obsolètes ?",
    options: ["Un grand écart entre le nombre de lignes estimé et réel", "Le mot « Index » dans un nœud", "Un temps de planification court", "L'utilisation de LIMIT"],
    explanation: "Des estimations de lignes erronées conduisent le planificateur à de mauvais choix, comme des boucles imbriquées sur de nombreuses lignes. Lancer ANALYZE rafraîchit les statistiques.",
  },
  'q-db-020': {
    prompt: "Quelle est la manière la plus sûre de renommer une colonne d'une grande table de production sans interruption de service ?",
    options: ["ALTER TABLE ... RENAME COLUMN en pleine heure de pointe", "Expand and contract : ajouter la nouvelle colonne, écrire dans les deux, migrer les données par lots, basculer les lectures, puis supprimer l'ancienne colonne", "Recréer la table à partir d'une sauvegarde", "La renommer et redéployer tous les services à la même seconde"],
    explanation: "Le schéma expand and contract permet aux anciennes et nouvelles versions de l'application de fonctionner pendant la transition, avec de petites étapes réversibles.",
  },

  // Cloud & DevOps (20)
  'q-ops-001': {
    prompt: "Que partagent les conteneurs avec l'hôte, contrairement aux machines virtuelles ?",
    options: ["Uniquement le matériel", "Le noyau du système d'exploitation", "Absolument rien", "Le BIOS"],
    explanation: "Les conteneurs isolent les processus grâce aux namespaces et aux cgroups, mais partagent le noyau de l'hôte, ce qui les rend légers et rapides à démarrer.",
  },
  'q-ops-002': {
    prompt: "Copier les fichiers de dépendances et installer les dépendances avant de copier le code source améliore le cache de build Docker.",
    explanation: "Les couches sont mises en cache dans l'ordre. Si les dépendances changent rarement, une modification du code ne déclenche plus une réinstallation complète.",
  },
  'q-ops-003': {
    prompt: "Quel est le principal avantage d'un build Docker multi-stage ?",
    options: ["Il exécute plusieurs conteneurs à la fois", "L'image finale ne contient que les artefacts d'exécution, sans les outils de build", "Il remplace Kubernetes", "Il chiffre l'image"],
    explanation: "Les outils de build restent dans une étape antérieure ; l'étape finale ne copie que le nécessaire, ce qui donne des images plus petites et plus sûres.",
  },
  'q-ops-004': {
    prompt: "Un conteneur se termine avec le code 137 dans Kubernetes. Quelle en est la cause la plus probable ?",
    options: ["Une erreur de syntaxe dans le code", "Le processus a été tué, souvent pour avoir dépassé sa limite mémoire", "Le tag de l'image est manquant", "Le réseau est trop rapide"],
    explanation: "Le code de sortie 137 signifie que le processus a reçu SIGKILL ; kubectl describe pod affiche généralement OOMKilled lorsque la mémoire est en cause.",
  },
  'q-ops-005': {
    prompt: "Quel objet Kubernetes fournit un nom et une adresse IP stables devant des pods qui changent ?",
    options: ["Deployment", "Service", "ConfigMap", "Namespace"],
    explanation: "Les pods sont recréés avec de nouvelles IP. Un Service sélectionne les pods par labels et répartit le trafic entre eux.",
  },
  'q-ops-006': {
    prompt: "Une readiness probe en échec amène Kubernetes à redémarrer le conteneur.",
    explanation: "Une readiness probe en échec retire le pod des endpoints du Service. Les redémarrages sont déclenchés par les liveness probes en échec.",
  },
  'q-ops-007': {
    prompt: "Pourquoi est-il risqué de faire dépendre une liveness probe de la base de données ?",
    options: ["Les bases de données ne prennent pas en charge HTTP", "Une panne de la base ferait redémarrer tous les pods en boucle", "Cela ralentit légèrement les déploiements", "Les probes ne peuvent pas utiliser TCP"],
    explanation: "La liveness probe ne doit vérifier que le processus lui-même. Dépendre de systèmes externes transforme la panne d'une dépendance en cascade de redémarrages.",
  },
  'q-ops-008': {
    prompt: "Que se passe-t-il lorsqu'un conteneur dépasse sa limite CPU ?",
    options: ["Il est tué immédiatement", "Il est bridé (throttling) et s'exécute plus lentement", "Le nœud redémarre", "Kubernetes ajoute de la mémoire"],
    explanation: "Le CPU au-delà de la limite est bridé. Dépasser la limite mémoire, en revanche, entraîne l'arrêt du conteneur (OOMKilled).",
  },
  'q-ops-009': {
    prompt: "Qu'est-ce qui distingue le déploiement continu de la livraison continue ?",
    options: ["Le déploiement continu n'a pas de tests", "Chaque modification qui passe le pipeline part automatiquement en production", "La livraison continue saute les builds", "Ce sont exactement la même chose"],
    explanation: "La livraison continue garde chaque modification déployable, généralement avec une approbation manuelle ; le déploiement continu met en production automatiquement.",
  },
  'q-ops-010': {
    prompt: "Quelle stratégie de mise en production envoie d'abord une petite part du trafic vers la nouvelle version, puis l'augmente progressivement ?",
    options: ["Big bang", "Blue-green", "Canary", "Recreate"],
    explanation: "Un déploiement canary limite l'exposition aux bugs et compare les métriques entre versions avant un déploiement complet.",
  },
  'q-ops-011': {
    prompt: "Dans GitLab CI, le cache est le bon mécanisme pour transmettre de façon fiable les résultats de build d'un job au suivant.",
    explanation: "Les artifacts transmettent les fichiers entre jobs de façon fiable. Le cache est une optimisation de vitesse sans garantie, par exemple pour les dépendances.",
  },
  'q-ops-012': {
    prompt: "Quelle pratique évite de stocker des clés cloud à longue durée de vie dans un pipeline CI ?",
    options: ["Encoder les clés en Base64", "La fédération OIDC qui émet des identifiants de courte durée", "Mettre les clés dans le README du dépôt", "Partager une seule clé admin par équipe"],
    explanation: "Avec OIDC, le fournisseur cloud fait confiance à l'identité de la CI et émet des identifiants temporaires pour chaque job.",
  },
  'q-ops-013': {
    prompt: "Quelle affirmation sur git rebase est correcte ?",
    options: ["Il ne modifie jamais l'historique des commits", "Il réécrit les commits : il ne faut donc pas l'utiliser sur des branches partagées sans accord", "Il supprime le dépôt distant", "Il est identique à git merge"],
    explanation: "Rebase rejoue les commits sur une nouvelle base en créant de nouveaux commits. Réécrire un historique dont d'autres dépendent pose problème.",
  },
  'q-ops-014': {
    prompt: "Quelle commande annule sans risque un commit déjà présent sur la branche main partagée ?",
    options: ["git reset --hard", "git revert <commit>", "git push --force", "git clean -fd"],
    explanation: "git revert crée un nouveau commit qui annule les modifications tout en préservant l'historique, ce qui est sûr pour les branches partagées.",
  },
  'q-ops-015': {
    prompt: "Si un secret a été poussé sur Git, supprimer le fichier dans un nouveau commit suffit à éliminer le risque.",
    explanation: "Le secret reste dans l'historique et a peut-être déjà été copié. Révoquez-le et renouvelez-le d'abord, puis nettoyez l'historique si nécessaire.",
  },
  'q-ops-016': {
    prompt: "Dans quel modèle de service gérez-vous vous-même le système d'exploitation ?",
    options: ["SaaS", "PaaS", "IaaS", "Serverless"],
    explanation: "Avec l'IaaS, le fournisseur gère le matériel et la virtualisation, tandis que vous gérez l'OS, le runtime et l'application.",
  },
  'q-ops-017': {
    prompt: "Que mesure le RPO dans un plan de reprise après sinistre ?",
    options: ["La durée d'interruption maximale acceptable", "La perte de données maximale acceptable, mesurée en temps", "Le coût du système de sauvegarde", "Le nombre de régions utilisées"],
    explanation: "Le Recovery Point Objective indique la quantité de données que vous pouvez vous permettre de perdre ; le Recovery Time Objective indique combien de temps le service peut être indisponible.",
  },
  'q-ops-018': {
    prompt: "Lequel de ces éléments ne fait PAS partie des quatre signaux d'or (golden signals) ?",
    options: ["La latence", "Le trafic", "Les erreurs", "Le nombre de développeurs"],
    explanation: "Les signaux d'or sont la latence, le trafic, les erreurs et la saturation, tous centrés sur ce que vivent les utilisateurs.",
  },
  'q-ops-019': {
    prompt: "Avec un SLO de disponibilité de 99,9 % sur 30 jours, quelle durée d'indisponibilité totale le budget d'erreur autorise-t-il environ ?",
    options: ["Environ 4 minutes", "Environ 43 minutes", "Environ 7 heures", "Environ 3 jours"],
    explanation: "0,1 % de 30 jours représente environ 43 minutes. Le budget d'erreur aide à équilibrer nouvelles mises en production et travail de fiabilité.",
  },
  'q-ops-020': {
    prompt: "Les Secrets Kubernetes sont chiffrés par défaut, simplement parce qu'ils sont encodés en base64.",
    explanation: "Base64 est un encodage, pas un chiffrement. Activez le chiffrement au repos et restreignez les accès, ou utilisez un gestionnaire de secrets externe.",
  },

  // IA & data (20)
  'q-ai-001': {
    prompt: "Un modèle obtient 98 % sur les données d'entraînement mais 70 % sur les données de validation. Quel est le problème le plus probable ?",
    options: ["Sous-apprentissage (underfitting)", "Surapprentissage (overfitting)", "Dérive des données en production", "Un taux d'apprentissage trop faible"],
    explanation: "Un grand écart entre les performances d'entraînement et de validation signifie que le modèle a mémorisé les données d'entraînement au lieu de généraliser.",
  },
  'q-ai-002': {
    prompt: "Il est acceptable d'ajuster les hyperparamètres de manière répétée sur le jeu de test.",
    explanation: "Ajuster sur le jeu de test rend son score trop optimiste. Utilisez un jeu de validation ou la validation croisée pour l'ajustement et gardez le jeu de test pour la fin.",
  },
  'q-ai-003': {
    prompt: "Pour la détection de fraude, où rater une fraude coûte très cher, quelle métrique mérite le plus d'attention ?",
    options: ["L'exactitude (accuracy)", "Le rappel (recall)", "La perte d'entraînement", "Le nombre de variables"],
    explanation: "Le rappel mesure la part des fraudes réelles détectées. L'exactitude est trompeuse lorsque les fraudes sont rares.",
  },
  'q-ai-004': {
    prompt: "Quelle pratique est un exemple de fuite de données (data leakage) ?",
    options: ["Utiliser un jeu de test séparé", "Normaliser les variables avec des statistiques calculées sur tout le jeu de données avant la séparation", "Utiliser la validation croisée", "Supprimer les lignes en double avant la séparation"],
    explanation: "Des statistiques issues des données de validation ou de test fuient dans l'entraînement, ce qui rend l'évaluation meilleure que les performances réelles.",
  },
  'q-ai-005': {
    prompt: "Qu'est-ce que le training-serving skew ?",
    options: ["Entraîner un modèle sur plusieurs GPU", "Calculer les variables différemment à l'entraînement et en production", "Servir deux modèles à la fois", "Utiliser une taille de batch plus grande en production"],
    explanation: "Si les variables de production sont calculées différemment, le modèle reçoit des entrées différentes de celles sur lesquelles il a appris et ses performances baissent.",
  },
  'q-ai-006': {
    prompt: "Quelle étape calcule, pendant l'entraînement, la contribution de chaque poids à l'erreur ?",
    options: ["La tokenisation", "La rétropropagation (backpropagation)", "L'augmentation de données", "L'inférence"],
    explanation: "La rétropropagation applique la règle de dérivation en chaîne pour calculer les gradients, que l'optimiseur utilise ensuite pour mettre à jour les poids.",
  },
  'q-ai-007': {
    prompt: "Un taux d'apprentissage trop élevé peut faire diverger l'entraînement.",
    explanation: "Des pas trop grands dépassent le minimum : la perte oscille ou explose au lieu de diminuer.",
  },
  'q-ai-008': {
    prompt: "Dans la self-attention, comment le poids d'attention entre deux tokens est-il calculé ?",
    options: ["En comptant les lettres communes", "À partir du produit scalaire mis à l'échelle d'une requête et d'une clé, normalisé par softmax", "En faisant la moyenne de leurs positions", "À partir d'une table de correspondance fixe"],
    explanation: "La requête (query) de chaque token est comparée à chaque clé (key) ; softmax transforme les scores mis à l'échelle en poids servant à combiner les valeurs (values).",
  },
  'q-ai-009': {
    prompt: "Qu'apprend fondamentalement un grand modèle de langage pendant le pré-entraînement ?",
    options: ["Faire des recherches sur Internet", "Prédire le token suivant", "Traduire du code en SQL", "Stocker une base de faits"],
    explanation: "Le pré-entraînement apprend au modèle à prédire le token suivant à partir d'énormes volumes de texte ; l'instruction tuning vient ensuite.",
  },
  'q-ai-010': {
    prompt: "Un prompt bien rédigé peut éliminer complètement les hallucinations.",
    explanation: "Les hallucinations découlent de la façon dont les LLM génèrent du texte. L'ancrage dans des sources, la validation et une UX honnête les réduisent, sans pouvoir les supprimer entièrement.",
  },
  'q-ai-011': {
    prompt: "Quel réglage de température convient à une tâche d'extraction de données qui doit être cohérente ?",
    options: ["Une température basse, proche de 0", "Une température très élevée", "La température n'a aucun effet", "Alterner des valeurs hautes et basses"],
    explanation: "Une température basse rend les sorties plus déterministes, ce qui convient à l'extraction et à la classification.",
  },
  'q-ai-012': {
    prompt: "Le modèle doit répondre à des questions sur des documents internes qui changent chaque semaine. Quelle est généralement la meilleure approche ?",
    options: ["Fine-tuner le modèle chaque semaine", "La génération augmentée par récupération (RAG)", "Augmenter la température", "Entraîner un modèle à partir de zéro"],
    explanation: "Le RAG récupère des documents à jour au moment de la requête et peut citer ses sources, sans réentraîner le modèle.",
  },
  'q-ai-013': {
    prompt: "Un assistant RAG donne une mauvaise réponse. Que devez-vous vérifier en premier ?",
    options: ["La couleur de l'interface", "Si les passages pertinents ont bien été récupérés", "Uniquement la date d'entraînement du modèle", "La température du CPU du serveur"],
    explanation: "La plupart des échecs d'un RAG viennent de la récupération. Si le bon contexte manque, le modèle ne peut pas répondre correctement.",
  },
  'q-ai-014': {
    prompt: "Que fait un reranker dans un pipeline RAG ?",
    options: ["Il découpe les documents en chunks", "Il évalue plus précisément les candidats récupérés par rapport à la requête", "Il chiffre la base vectorielle", "Il génère la réponse finale"],
    explanation: "Un reranker de type cross-encoder lit la requête et le candidat ensemble : on récupère donc de nombreux candidats et on ne garde que les meilleurs.",
  },
  'q-ai-015': {
    prompt: "Les vecteurs produits par deux modèles d'embedding différents peuvent être mélangés dans le même index.",
    explanation: "Chaque modèle définit son propre espace vectoriel : changer de modèle impose de recalculer les embeddings de tous les documents dans un nouvel index.",
  },
  'q-ai-016': {
    prompt: "Pour des vecteurs d'embedding normalisés, quelles mesures donnent le même classement ?",
    options: ["Uniquement la similarité cosinus", "La similarité cosinus, le produit scalaire et la distance euclidienne", "Uniquement la distance euclidienne", "Aucune d'entre elles"],
    explanation: "Avec des vecteurs de norme 1, le produit scalaire est égal à la similarité cosinus et la distance euclidienne en est une fonction monotone.",
  },
  'q-ai-017': {
    prompt: "Qu'est-ce que HNSW ?",
    options: ["Un format de fichier pour les images", "Un index de plus proches voisins approximatifs fondé sur un graphe", "Un tokenizer", "Un type de jointure SQL"],
    explanation: "HNSW construit un graphe multicouche pour trouver rapidement des vecteurs proches, en sacrifiant un peu de précision et de mémoire au profit de la vitesse.",
  },
  'q-ai-018': {
    prompt: "Quelle mesure est la plus efficace contre l'injection de prompt indirecte dans un agent doté d'outils ?",
    options: ["Demander poliment au modèle d'ignorer les instructions injectées", "Limiter les permissions des outils et exiger la confirmation de l'utilisateur pour les actions sensibles", "Utiliser une température plus élevée", "Des prompts système plus longs"],
    explanation: "Les instructions dans le prompt ne sont pas une défense fiable. Le moindre privilège et la confirmation limitent ce qu'un attaquant peut obtenir.",
  },
  'q-ai-019': {
    prompt: "En ELT, où les transformations sont-elles effectuées ?",
    options: ["Avant l'extraction", "Dans l'entrepôt de données cible, après le chargement", "Uniquement dans la base source", "Dans l'interface utilisateur"],
    explanation: "L'ELT charge d'abord les données brutes, puis les transforme avec la puissance de calcul de l'entrepôt, souvent à l'aide d'outils SQL comme dbt.",
  },
  'q-ai-020': {
    prompt: "Un job de pipeline idempotent produit le même résultat lorsqu'il est exécuté deux fois pour la même période.",
    explanation: "L'idempotence, par exemple en écrasant une partition, rend les relances et les backfills sûrs, sans créer de doublons.",
  },

  // RH & salaire (15)
  'q-hr-001': {
    prompt: "Quelle est généralement la meilleure façon de répondre à « Quelles sont vos prétentions salariales ? »",
    options: ["« Ce qui vous semble juste. »", "Une fourchette étayée, liée au poste et au marché, en restant ouvert sur l'ensemble de la rémunération", "Le chiffre le plus élevé possible", "Refuser de répondre"],
    explanation: "Une fourchette étayée montre votre préparation et garde la discussion ouverte, à condition que le bas de la fourchette vous convienne.",
  },
  'q-hr-002': {
    prompt: "Dans certains pays et États, les employeurs n'ont pas le droit d'interroger les candidats sur leur historique salarial.",
    explanation: "Les règles varient selon le lieu : vérifiez celles qui s'appliquent à vous. Dans tous les cas, n'inventez jamais un salaire actuel plus élevé.",
  },
  'q-hr-003': {
    prompt: "Vous recevez une offre orale et l'on vous demande d'accepter immédiatement. Quelle est une réponse professionnelle ?",
    options: ["Accepter sur-le-champ", "Remercier, demander l'offre par écrit et proposer un délai court et précis", "Dire qu'il vous faut un mois", "Ignorer l'appel"],
    explanation: "Demander les détails par écrit et un délai raisonnable est normal et vous permet d'examiner l'offre et de négocier sereinement.",
  },
  'q-hr-004': {
    prompt: "Quel élément est souvent négociable même lorsque le salaire de base est fixe ?",
    options: ["La raison sociale de l'entreprise", "Des jours de télétravail ou un budget formation", "Le taux d'imposition", "Le salaire du PDG"],
    explanation: "Beaucoup d'entreprises ont plus de marge sur les avantages, la date d'arrivée, l'intitulé du poste ou les revues de salaire que sur le salaire de base.",
  },
  'q-hr-005': {
    prompt: "Inventer une offre concurrente est une tactique de négociation acceptable.",
    explanation: "Le bluff abîme la confiance et peut se retourner contre vous. Ne mentionnez que de vraies offres, honnêtement, et gardez leurs détails confidentiels.",
  },
  'q-hr-006': {
    prompt: "Lorsqu'on vous interroge sur votre préavis, que devez-vous faire ?",
    options: ["Le sous-estimer pour paraître plus attractif", "L'indiquer honnêtement après avoir vérifié votre contrat", "Promettre de partir dès demain", "Dire que c'est confidentiel"],
    explanation: "La durée du préavis dépend du pays et du contrat. L'honnêteté crée la confiance, et vous pouvez proposer d'étudier des options avec votre employeur.",
  },
  'q-hr-007': {
    prompt: "Pour quelle raison fréquente les contre-offres de l'employeur actuel échouent-elles avec le temps ?",
    options: ["Elles sont illégales", "Elles règlent rarement les raisons pour lesquelles la personne voulait partir", "Elles réduisent toujours le salaire", "Elles exigent un nouveau contrat"],
    explanation: "Si le départ était motivé par l'évolution, le poste ou la culture, plus d'argent ne règle souvent pas le problème de fond.",
  },
  'q-hr-008': {
    prompt: "Qu'est-ce qui rend un récit de reconversion convaincant ?",
    options: ["Critiquer votre ancien métier", "Un déclencheur clair, une préparation concrète et une expérience transférable", "Dire que c'était une impulsion soudaine", "Cacher votre carrière précédente"],
    explanation: "Les recruteurs veulent voir une décision réfléchie, appuyée par des formations, des projets et des compétences transférables au nouveau poste.",
  },
  'q-hr-009': {
    prompt: "Lors d'une reconversion, accepter un niveau plus junior peut être raisonnable si la progression est claire.",
    explanation: "Un point de départ réaliste avec un parcours d'évolution défini montre votre engagement et réduit les inquiétudes du recruteur.",
  },
  'q-hr-010': {
    prompt: "Comment expliquer une période d'inactivité dans votre CV ?",
    options: ["Modifier les dates pour la masquer", "Donner une explication courte et honnête, et montrer que vous êtes prêt aujourd'hui", "Raconter toute votre histoire personnelle", "Refuser d'en parler"],
    explanation: "Une explication brève et factuelle, complétée par ce que vous avez fait pour rester à jour et par votre disponibilité, suffit généralement.",
  },
  'q-hr-011': {
    prompt: "Vous devez fournir des informations médicales détaillées pour expliquer une interruption due à des raisons de santé.",
    explanation: "Vous pouvez garder vos informations de santé privées. Mettez l'accent sur votre disponibilité actuelle ; dans de nombreux pays, l'employeur n'a pas le droit de poser des questions sur la santé.",
  },
  'q-hr-012': {
    prompt: "Quelle habitude montre le mieux que vous savez bien travailler à distance ?",
    options: ["Être en ligne à toute heure", "Une routine claire et des points d'avancement proactifs avec l'équipe", "Éviter les appels vidéo", "Travailler uniquement la nuit"],
    explanation: "Une organisation structurée et une communication visible prouvent votre fiabilité sans supervision.",
  },
  'q-hr-013': {
    prompt: "Pour un poste en full remote dans une entreprise à l'étranger, que devez-vous clarifier en premier ?",
    options: ["La marque du café au bureau", "Si vous êtes salarié ou prestataire, et qui gère les impôts et la protection sociale", "La couleur du logo", "Les loisirs du PDG"],
    explanation: "Le type de contrat change la fiscalité, la protection et les avantages. Demandez-le par écrit et faites-vous conseiller localement si nécessaire.",
  },
  'q-hr-014': {
    prompt: "Quelle est la réponse la plus faible à « Avez-vous des questions pour nous ? »",
    options: ["« À quoi ressemblerait la réussite au bout de six mois ? »", "« Quels sont les plus grands défis de l'équipe en ce moment ? »", "« Non, tout est clair. »", "« Comment accompagnez-vous le développement de vos collaborateurs ? »"],
    explanation: "Ne poser aucune question peut traduire un faible intérêt. De bonnes questions montrent votre motivation et vous aident à évaluer le poste.",
  },
  'q-hr-015': {
    prompt: "Envoyer un court message de remerciement personnalisé dans la journée qui suit l'entretien est une bonne pratique.",
    explanation: "Un bref message reprenant un point de l'échange laisse une dernière impression professionnelle.",
  },
};
