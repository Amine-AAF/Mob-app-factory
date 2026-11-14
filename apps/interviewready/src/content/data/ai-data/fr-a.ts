import type { QuestionText, TextTable } from '@/types/content';

/** Questions IA & Data 001-022 : machine learning, deep learning, LLM, RAG (partie). */
export const frA: TextTable<QuestionText> = {
  "ai-001": {
    question: "Quelle est la différence entre l'apprentissage supervisé, l'apprentissage non supervisé et l'apprentissage par renforcement ?",
    intent: "Le recruteur vérifie que vous connaissez les grandes familles du machine learning et les cas où chacune s'applique.",
    expectedAnswer:
      "L'apprentissage supervisé entraîne un modèle sur des exemples étiquetés, c'est-à-dire des entrées dont la sortie correcte est connue, afin de prédire la sortie pour de nouvelles entrées : classification, par exemple spam ou non spam, ou régression, par exemple prédire le prix d'un logement. L'apprentissage non supervisé trouve une structure dans des données non étiquetées : regrouper des clients en segments (clustering), réduire la dimension ou détecter des anomalies. L'apprentissage par renforcement entraîne un agent qui agit dans un environnement et apprend à partir de récompenses et de pénalités ; on l'utilise pour les jeux, la robotique ou les stratégies de recommandation. Il existe aussi l'apprentissage auto-supervisé, où les étiquettes proviennent des données elles-mêmes, comme prédire le mot suivant : c'est ainsi que les grands modèles de langage sont pré-entraînés.",
    explanation:
      "La disponibilité des étiquettes et le type de retour d'information déterminent la famille. L'apprentissage auto-supervisé fait le lien avec les modèles de fondation modernes.",
    tips: ["Donnez un exemple métier pour chaque famille.", "Mentionnez l'apprentissage auto-supervisé pour les LLM."],
    commonMistakes: ["Affirmer que l'apprentissage non supervisé n'a aucun objectif.", "Confondre classification et clustering."],
    followUpQuestions: ["Comment segmenteriez-vous des clients sans étiquettes ?", "Qu'est-ce que l'apprentissage semi-supervisé ?"],
  },
  "ai-002": {
    question: "Que sont le surapprentissage et le sous-apprentissage, et comment les détecter ?",
    intent: "Le recruteur vérifie votre maîtrise du concept le plus fondamental de l'évaluation des modèles.",
    expectedAnswer:
      "Le surapprentissage (overfitting) se produit lorsqu'un modèle apprend les données d'entraînement de trop près, y compris leur bruit : il obtient d'excellents résultats sur les données d'entraînement mais de mauvais résultats sur de nouvelles données. Le sous-apprentissage (underfitting) se produit lorsqu'un modèle est trop simple pour capturer la structure sous-jacente : il est mauvais dans les deux cas. On les détecte en comparant les scores d'entraînement et de validation : un écart important suggère du surapprentissage, des scores faibles des deux côtés suggèrent du sous-apprentissage. C'est le compromis biais-variance : les modèles simples ont un biais élevé, les modèles complexes une variance élevée. Contre le surapprentissage : plus de données, la régularisation, des modèles plus simples, l'arrêt précoce (early stopping) ou le dropout pour les réseaux de neurones ; contre le sous-apprentissage : des modèles plus expressifs, de meilleures variables (features) ou un entraînement plus long.",
    explanation:
      "L'objectif est la généralisation à des données jamais vues. Comparer les performances en entraînement et en validation est l'outil de diagnostic de base.",
    tips: ["Expliquez comment comparer les scores d'entraînement et de validation.", "Proposez des remèdes pour les deux problèmes."],
    commonMistakes: ["Évaluer un modèle uniquement sur les données qui ont servi à l'entraîner."],
    followUpQuestions: ["Qu'est-ce que la régularisation ?", "En quoi les courbes d'apprentissage sont-elles utiles ?"],
  },
  "ai-003": {
    question: "Pourquoi découpe-t-on les données en jeux d'entraînement, de validation et de test ? Qu'est-ce que la validation croisée ?",
    intent: "Le recruteur vérifie que vous appliquez une méthodologie d'évaluation correcte.",
    expectedAnswer:
      "Le jeu d'entraînement sert à ajuster le modèle. Le jeu de validation sert à comparer des modèles et à régler les hyperparamètres, comme la profondeur d'un arbre ou le taux d'apprentissage. Le jeu de test est mis de côté jusqu'à la fin pour estimer la performance sur des données réellement inédites ; si l'on effectue des réglages dessus, l'estimation devient trop optimiste. Un découpage typique peut être 70/15/15, selon le volume de données. La validation croisée, par exemple en k plis (k-fold), découpe les données en k parties, entraîne k fois en validant à chaque fois sur une partie différente, puis fait la moyenne des résultats. Elle donne une estimation plus fiable lorsque les données sont limitées. Pour les séries temporelles, le découpage doit respecter l'ordre chronologique, en entraînant sur le passé et en validant sur le futur, pour éviter d'utiliser des informations futures.",
    explanation:
      "Séparer les données utilisées pour le réglage de celles réservées à l'évaluation finale évite de se faire des illusions sur la performance réelle.",
    tips: ["Expliquez le rôle de chaque jeu de données.", "Mentionnez le découpage chronologique pour les séries temporelles."],
    commonMistakes: ["Régler les hyperparamètres sur le jeu de test.", "Mélanger aléatoirement des séries temporelles avant le découpage."],
    followUpQuestions: ["Qu'est-ce que l'échantillonnage stratifié ?", "Comment découperiez-vous des données où le même client apparaît de nombreuses fois ?"],
  },
  "ai-004": {
    question: "Comment choisissez-vous une métrique d'évaluation pour un problème de classification, en particulier avec des classes déséquilibrées ?",
    intent: "Le recruteur vérifie que vous reliez les métriques à l'impact métier au lieu de vous contenter de l'accuracy.",
    expectedAnswer:
      "L'accuracy (taux de bonnes prédictions) est trompeuse lorsque les classes sont déséquilibrées : un modèle de détection de fraude qui prédit toujours « pas de fraude » peut atteindre 99 % d'accuracy tout en étant inutile. La précision est la part des prédictions positives qui sont correctes ; le rappel est la part des vrais positifs effectivement détectés. Le score F1 équilibre les deux. Le choix dépend du coût des erreurs : pour la détection de fraude ou le dépistage médical, manquer un positif coûte cher, donc le rappel compte davantage ; pour le filtrage de spam, signaler un e-mail légitime est coûteux, donc la précision compte davantage. Le ROC-AUC mesure la qualité du classement sur l'ensemble des seuils, mais en cas de fort déséquilibre, la courbe précision-rappel et le PR-AUC sont plus informatifs. Le seuil de décision lui-même doit être choisi avec le métier, en fonction des coûts relatifs des faux positifs et des faux négatifs, et la matrice de confusion rend ces compromis concrets.",
    explanation:
      "Les métriques traduisent des priorités métier. Les recruteurs veulent voir que vous raisonnez sur le coût de chaque type d'erreur.",
    tips: ["Expliquez pourquoi l'accuracy échoue sur des données déséquilibrées.", "Reliez la précision et le rappel aux coûts métier.", "Mentionnez le choix du seuil de décision."],
    commonMistakes: ["Ne présenter que l'accuracy.", "Utiliser par défaut un seuil de 0,5 sans réflexion."],
    followUpQuestions: ["Comment choisiriez-vous le seuil d'un modèle de détection de fraude ?", "Que montre une matrice de confusion ?"],
  },
  "ai-005": {
    question: "Qu'est-ce que la fuite de données (data leakage), et comment l'éviter ?",
    intent: "Le recruteur vérifie que vous connaissez une erreur subtile qui fait paraître les modèles bien meilleurs qu'ils ne le sont.",
    expectedAnswer:
      "La fuite de données (data leakage) se produit lorsque des informations qui ne seront pas disponibles au moment de la prédiction sont utilisées pendant l'entraînement : les scores de validation sont alors irréalistes et le modèle échoue en production. Exemples : une variable calculée après l'événement à prédire, comme la « date de clôture du compte » pour prédire l'attrition (churn) ; une normalisation ou une imputation de valeurs calculée à partir des statistiques de tout le jeu de données avant le découpage ; le même client ou patient présent à la fois dans les jeux d'entraînement et de test ; ou un découpage aléatoire de séries temporelles, qui permet au modèle d'apprendre à partir du futur. Pour l'éviter, je découpe d'abord les données, puis j'ajuste les étapes de prétraitement uniquement sur les données d'entraînement, idéalement dans un pipeline ; je vérifie que chaque variable serait connue au moment de la prédiction ; je découpe par entité ou dans le temps lorsque c'est pertinent ; et je me méfie des résultats qui paraissent trop beaux.",
    explanation:
      "La fuite de données est l'une des causes les plus fréquentes de modèles qui échouent après le déploiement. Se demander « qu'est-ce qui est connu au moment de la prédiction ? » évite la plupart des cas.",
    tips: ["Donnez au moins deux exemples concrets de fuite de données.", "Mentionnez l'ajustement du prétraitement sur les seules données d'entraînement."],
    commonMistakes: ["Normaliser l'ensemble du jeu de données avant le découpage.", "Ignorer les doublons entre les différents jeux."],
    followUpQuestions: ["Comment détecteriez-vous une fuite de données a posteriori ?", "Pourquoi les pipelines aident-ils à éviter les fuites de données ?"],
  },
  "ai-006": {
    question: "Comment traiteriez-vous un jeu de données fortement déséquilibré ?",
    intent: "Le recruteur vérifie que vous connaissez des techniques concrètes qui vont au-delà de l'entraînement d'un modèle sur les données brutes.",
    expectedAnswer:
      "Je commencerais par choisir des métriques adaptées, comme la précision, le rappel ou le PR-AUC, et un découpage stratifié pour que chaque jeu contienne suffisamment d'exemples de la classe minoritaire. Ensuite, plusieurs techniques peuvent aider. Au niveau des données : sous-échantillonner la classe majoritaire, suréchantillonner la classe minoritaire ou générer des exemples synthétiques avec des méthodes comme SMOTE, toujours appliquées uniquement aux données d'entraînement. Au niveau de l'algorithme : des poids de classe qui rendent les erreurs sur la classe minoritaire plus coûteuses, ce que la plupart des bibliothèques permettent, ou des modèles comme les arbres de gradient boosting, qui gèrent souvent bien le déséquilibre. Au niveau de la décision : ajuster le seuil de classification en fonction des coûts métier plutôt que d'utiliser 0,5. Collecter davantage d'exemples minoritaires, ou de meilleures variables qui séparent les classes, aide souvent plus que n'importe quelle astuce de rééchantillonnage. Dans les cas extrêmes, les approches de détection d'anomalies peuvent être plus appropriées que la classification.",
    explanation:
      "Le déséquilibre se traite à la fois par les métriques, les données, les algorithmes et les seuils. Rééchantillonner le jeu de test donnerait des résultats trompeurs.",
    tips: ["Commencez par la bonne métrique.", "Mentionnez les poids de classe et l'ajustement du seuil.", "Mettez en garde contre le rééchantillonnage des jeux de validation ou de test."],
    commonMistakes: ["Suréchantillonner avant le découpage, ce qui provoque une fuite de données.", "Juger le modèle à l'aide de l'accuracy."],
    followUpQuestions: ["Quand utiliseriez-vous plutôt la détection d'anomalies ?", "Comment SMOTE crée-t-il des exemples synthétiques ?"],
  },
  "ai-007": {
    question: "Comment déployez-vous et maintenez-vous un modèle de machine learning en production ?",
    intent: "Le recruteur évalue votre maturité en MLOps : reproductibilité, monitoring et cycle de vie du modèle.",
    expectedAnswer:
      "Un modèle en production est un système logiciel qui dépend des données ; je traiterais donc l'entraînement comme un pipeline reproductible : code versionné, jeux de données ou instantanés de données versionnés, expériences et hyperparamètres suivis avec un outil comme MLflow, et modèles stockés dans un registre avec leurs métriques et leur traçabilité (lineage). Le mode de service dépend du besoin : scoring par lots planifié, API temps réel avec des exigences de latence, ou modèles embarqués. Les variables doivent être calculées de la même façon à l'entraînement et en service pour éviter l'écart entraînement-service (training-serving skew), ce à quoi aident un feature store ou un code de transformation partagé. Avant une mise en production complète, je comparerais le nouveau modèle au modèle actuel par un déploiement en mode shadow ou un test A/B sur des métriques métier. En production, je surveille les métriques techniques, comme la latence et les erreurs, la dérive des données (data drift) lorsque les distributions d'entrée changent, la dérive des prédictions et, lorsque les étiquettes arrivent plus tard, la performance réelle. Des alertes sur la dérive ou sur une baisse de performance déclenchent une investigation et un réentraînement, qui peut être planifié ou automatisé avec des étapes de validation. Enfin, je documente l'usage prévu du modèle et ses limites, et je garde la possibilité de revenir à la version précédente.",
    explanation:
      "Les modèles se dégradent à mesure que le monde change. Les réponses avancées couvrent la reproductibilité, l'écart entraînement-service, le déploiement progressif sécurisé, le suivi de la dérive et le réentraînement.",
    tips: ["Couvrez le cycle de vie, de l'entraînement au réentraînement.", "Mentionnez l'écart entraînement-service et la dérive.", "Expliquez des méthodes de déploiement sécurisé."],
    commonMistakes: ["Déployer un notebook sans entraînement reproductible.", "Ne surveiller que la latence, et pas la qualité des prédictions."],
    followUpQuestions: ["Comment surveillez-vous un modèle lorsque les étiquettes arrivent des semaines plus tard ?", "Qu'est-ce qu'un feature store ?"],
  },
  "ai-008": {
    question: "Comment un réseau de neurones apprend-il ?",
    intent: "Le recruteur vérifie votre compréhension conceptuelle des réseaux de neurones.",
    expectedAnswer:
      "Un réseau de neurones est composé de couches d'unités, ou neurones. Chaque unité calcule une somme pondérée de ses entrées, ajoute un biais et applique une fonction d'activation non linéaire comme ReLU ; empiler des couches permet au réseau de représenter des fonctions complexes. Apprendre consiste à ajuster les poids pour réduire une fonction de perte qui mesure l'erreur des prédictions, par exemple l'entropie croisée pour la classification. À chaque étape d'entraînement, le réseau fait des prédictions sur un lot (batch) d'exemples, calcule la perte, puis la rétropropagation (backpropagation) calcule la contribution de chaque poids à l'erreur grâce à la règle de dérivation en chaîne, et un optimiseur comme la descente de gradient met légèrement à jour les poids dans la direction qui réduit la perte. Répéter ce processus sur de nombreux lots et de nombreuses époques améliore progressivement le modèle.",
    explanation:
      "La propagation avant, le calcul de la perte, la rétropropagation et la mise à jour des poids forment la boucle d'entraînement qui sous-tend tout le deep learning.",
    tips: ["Décrivez les quatre étapes d'une itération d'entraînement.", "Expliquez pourquoi les activations non linéaires sont importantes."],
    commonMistakes: ["Décrire les réseaux de neurones comme une copie du cerveau humain.", "Oublier le rôle de la fonction de perte."],
    followUpQuestions: ["Pourquoi a-t-on besoin de fonctions d'activation ?", "Qu'est-ce qu'une époque ?"],
  },
  "ai-009": {
    question: "Expliquez la descente de gradient et le rôle du taux d'apprentissage.",
    intent: "Le recruteur vérifie votre compréhension de l'optimisation, qui influe sur la stabilité et la vitesse de l'entraînement.",
    expectedAnswer:
      "La descente de gradient minimise une fonction de perte en déplaçant de façon répétée les paramètres du modèle dans la direction opposée au gradient, qui indique la direction de plus forte augmentation. Le taux d'apprentissage contrôle la taille de chaque pas. S'il est trop grand, l'entraînement oscille ou diverge ; s'il est trop petit, l'entraînement est très lent et peut rester bloqué. La descente de gradient sur le lot complet (full-batch) utilise toutes les données à chaque pas, ce qui est coûteux ; les descentes de gradient stochastique et par mini-lots utilisent de petits lots, ce qui rend les pas plus bruités mais beaucoup plus rapides et aide souvent la généralisation. Des optimiseurs comme le momentum, RMSProp et Adam, ou AdamW avec une décroissance des poids (weight decay) découplée, adaptent la taille des pas pour chaque paramètre et accélèrent la convergence. Les plannings de taux d'apprentissage, comme une phase de warm-up suivie d'une décroissance, sont courants, en particulier pour les transformers.",
    explanation:
      "Le taux d'apprentissage est souvent l'hyperparamètre le plus important. Les optimiseurs adaptatifs et les plannings rendent l'entraînement plus robuste.",
    tips: ["Décrivez ce qui se passe lorsque le taux d'apprentissage est trop élevé ou trop faible.", "Mentionnez les mini-lots et Adam."],
    commonMistakes: ["Penser qu'un taux d'apprentissage plus élevé entraîne toujours plus vite."],
    followUpQuestions: ["Qu'est-ce qu'un warm-up du taux d'apprentissage ?", "Pourquoi le bruit des mini-lots peut-il aider la généralisation ?"],
  },
  "ai-010": {
    question: "Qu'est-ce que la disparition du gradient (vanishing gradients), et quelles techniques aident à entraîner des réseaux profonds ?",
    intent: "Le recruteur vérifie votre connaissance des problèmes pratiques du deep learning et de leurs solutions.",
    expectedAnswer:
      "Dans les réseaux profonds, la rétropropagation multiplie les gradients à travers de nombreuses couches. Avec des fonctions d'activation comme la sigmoïde, dont les dérivées sont petites, les gradients peuvent diminuer de façon exponentielle, si bien que les premières couches n'apprennent presque plus : c'est la disparition du gradient. Le phénomène inverse, l'explosion du gradient, rend l'entraînement instable. Les solutions incluent les activations de la famille ReLU, qui empêchent les gradients de diminuer pour les entrées positives ; une initialisation soignée des poids, comme He ou Xavier ; les couches de normalisation, la batch normalization dans les modèles de vision ou la layer normalization dans les transformers, qui stabilisent les activations ; les connexions résiduelles, utilisées dans les ResNets et les transformers, qui offrent aux gradients un chemin direct à travers le réseau ; et l'écrêtage du gradient (gradient clipping) contre les explosions. La régularisation, comme le dropout et la décroissance des poids, traite le surapprentissage plutôt que les gradients, mais fait généralement partie de la même recette d'entraînement.",
    explanation:
      "Les connexions résiduelles et la normalisation sont les principales raisons pour lesquelles on peut entraîner de façon fiable des réseaux très profonds, y compris les transformers.",
    tips: ["Expliquez pourquoi les gradients disparaissent.", "Citez plusieurs techniques et ce que chacune résout."],
    commonMistakes: ["Présenter le dropout comme une solution à la disparition du gradient."],
    followUpQuestions: ["Comment fonctionne une connexion résiduelle ?", "Pourquoi les transformers utilisent-ils la layer normalization plutôt que la batch normalization ?"],
  },
  "ai-011": {
    question: "Expliquez le fonctionnement de l'architecture transformer et de l'auto-attention (self-attention).",
    intent: "Le recruteur évalue votre compréhension approfondie de l'architecture qui sous-tend les modèles de langage modernes.",
    expectedAnswer:
      "Un transformer traite une séquence de tokens, chacun représenté par un plongement (embedding) auquel s'ajoute une information de position, car l'attention elle-même n'a aucune notion d'ordre. Le mécanisme central est l'auto-attention : pour chaque token, le modèle calcule un vecteur requête (query), un vecteur clé (key) et un vecteur valeur (value) par des projections apprises. Le poids d'attention entre deux tokens est le produit scalaire de la requête de l'un avec la clé de l'autre, divisé par la racine carrée de la dimension et normalisé par softmax ; la sortie de chaque token est la somme pondérée de toutes les valeurs. Chaque token peut ainsi récupérer directement de l'information de n'importe quel autre token, ce qui capture les dépendances à longue distance et permet un calcul parallèle, contrairement aux réseaux récurrents. L'attention multi-têtes (multi-head attention) exécute plusieurs opérations d'attention en parallèle pour que le modèle puisse s'intéresser à différents types de relations. Chaque bloc combine l'attention avec un réseau feed-forward, des connexions résiduelles et une layer normalization, et de nombreux blocs sont empilés. Les modèles decoder-only comme GPT utilisent un masquage causal pour qu'un token ne prête attention qu'aux tokens précédents, ce qui permet la prédiction du token suivant. Le principal coût est que l'attention est quadratique en fonction de la longueur de la séquence, ce qui motive des techniques comme les noyaux d'attention optimisés et la mise en cache des clés et valeurs (KV cache) pendant la génération.",
    explanation:
      "Les requêtes, clés et valeurs, l'attention multi-têtes et le masquage causal sont les concepts essentiels. Mentionner le coût quadratique et le KV cache montre une maîtrise pratique.",
    tips: ["Expliquez clairement Q, K et V.", "Faites le contraste avec les réseaux récurrents.", "Mentionnez le masquage causal et le coût quadratique."],
    commonMistakes: ["Décrire vaguement l'attention comme « le modèle se concentre sur les mots importants » sans expliquer le mécanisme."],
    followUpQuestions: ["Qu'est-ce qu'un KV cache ?", "Quelle est la différence entre les modèles encoder-only et decoder-only ?"],
  },
  "ai-012": {
    question: "Quand entraîneriez-vous un modèle de zéro, feriez-vous le fine-tuning d'un modèle pré-entraîné ou utiliseriez-vous l'apprentissage par transfert ?",
    intent: "Le recruteur évalue votre capacité à prendre des décisions pragmatiques en fonction des données, des coûts et des objectifs.",
    expectedAnswer:
      "Entraîner un modèle de zéro exige d'énormes volumes de données et de calcul, et ne se justifie que lorsqu'aucun modèle pré-entraîné adapté n'existe, par exemple pour des types de données inhabituels, ou lorsque l'on est une entreprise qui construit des modèles de fondation. L'apprentissage par transfert (transfer learning) réutilise un modèle pré-entraîné sur un grand jeu de données et l'adapte : on peut geler la plupart des couches et n'entraîner qu'une nouvelle tête, ce qui fonctionne bien avec de petits jeux de données, par exemple pour classer des images médicales à l'aide d'un modèle pré-entraîné sur des images généralistes. Le fine-tuning met à jour une plus grande partie, voire la totalité, des poids sur des données propres à la tâche, ce qui donne de meilleures performances lorsque l'on dispose de plus de données et que le domaine diffère de celui du pré-entraînement. Pour les grands modèles de langage, des méthodes économes en paramètres comme LoRA adaptent un modèle en entraînant de petites matrices supplémentaires, ce qui réduit le coût et la mémoire. Avant tout fine-tuning, je vérifierais si le prompting ou la génération augmentée par récupération (RAG) suffit, car ils sont moins coûteux à itérer. La décision dépend du volume et de la qualité des données, de l'écart de domaine, des contraintes de latence et de coût, et de la fréquence à laquelle le modèle doit être mis à jour.",
    explanation:
      "La réutilisation est la norme dans le machine learning moderne. Les réponses avancées comparent les options selon les données, le coût et la maintenance, et mentionnent le fine-tuning économe en paramètres.",
    tips: ["Expliquez dans quels cas chaque option est pertinente.", "Mentionnez LoRA pour les grands modèles.", "Envisagez le prompting et le RAG avant le fine-tuning."],
    commonMistakes: ["Faire le fine-tuning d'un LLM pour lui ajouter des faits qui changent souvent, ce que le RAG gère mieux."],
    followUpQuestions: ["De combien de données avez-vous besoin pour un fine-tuning efficace ?", "Qu'est-ce que l'oubli catastrophique ?"],
  },
  "ai-013": {
    question: "Qu'est-ce qu'un grand modèle de langage (LLM), et comment génère-t-il du texte ?",
    intent: "Le recruteur vérifie que vous avez une représentation de base correcte du fonctionnement des LLM.",
    expectedAnswer:
      "Un grand modèle de langage est un réseau de neurones, généralement un transformer decoder-only, entraîné sur de très grandes quantités de texte pour prédire le token suivant, un token étant un fragment de mot. Le texte est découpé en tokens et, à chaque étape, le modèle calcule une distribution de probabilité sur son vocabulaire pour le token suivant, en choisit un selon les paramètres de décodage, l'ajoute à la séquence et recommence. Après ce pré-entraînement, les modèles subissent généralement un instruction tuning et un alignement fondé sur des retours humains, afin de suivre les instructions et de se comporter de manière utile et sûre. Un LLM ne consulte pas de faits dans une base de données : il produit du texte à partir de régularités apprises pendant l'entraînement, dans une fenêtre de contexte limitée qui contient le prompt et la conversation.",
    explanation:
      "Comprendre la prédiction du token suivant explique à la fois les capacités impressionnantes des LLM et leurs limites, comme les hallucinations.",
    tips: ["Expliquez les tokens et la prédiction du token suivant.", "Mentionnez l'instruction tuning et la fenêtre de contexte."],
    commonMistakes: ["Affirmer que le modèle « cherche sur Internet » par défaut.", "Assimiler les tokens à des mots."],
    followUpQuestions: ["Qu'est-ce qu'une fenêtre de contexte ?", "Pourquoi les LLM ont-ils parfois du mal à compter les lettres d'un mot ?"],
  },
  "ai-014": {
    question: "Que sont les hallucinations des LLM, et comment les réduire ?",
    intent: "Le recruteur vérifie que vous connaissez les limites des LLM et que vous concevez de manière responsable.",
    expectedAnswer:
      "Une hallucination est une sortie qui semble plausible mais qui est fausse ou non étayée, comme des citations inventées ou des faits erronés. Elle survient parce que le modèle génère un texte probable au lieu de vérifier la vérité, et parce que ses connaissances se limitent aux données d'entraînement, avec une date de coupure. Pour réduire les hallucinations, j'ancrerais les réponses dans des sources fiables grâce à la génération augmentée par récupération (RAG) et je demanderais au modèle de les citer ; je lui indiquerais de dire quand il ne sait pas ; je réduirais l'aléa pour les tâches factuelles ; j'utiliserais des sorties structurées et une validation pour les données critiques ; et je concevrais l'interface pour que les utilisateurs puissent vérifier les sources. Pour les usages à fort enjeu, une relecture humaine reste nécessaire. Aucune technique ne supprime complètement les hallucinations ; les produits doivent donc être transparents sur cette limite.",
    explanation:
      "Les hallucinations sont inhérentes au fonctionnement des LLM. L'ancrage dans des sources, les contraintes et une UX transparente réduisent le risque.",
    tips: ["Expliquez pourquoi les hallucinations se produisent.", "Proposez plusieurs techniques d'atténuation.", "Mentionnez la transparence envers les utilisateurs."],
    commonMistakes: ["Affirmer qu'un prompt peut éliminer les hallucinations.", "Utiliser la sortie d'un LLM pour des décisions critiques sans vérification."],
    followUpQuestions: ["Comment mesureriez-vous le taux d'hallucination d'une application ?", "En quoi le RAG aide-t-il ?"],
  },
  "ai-015": {
    question: "Que contrôlent la température, le top-p et la fenêtre de contexte ?",
    intent: "Le recruteur vérifie votre connaissance pratique des paramètres des LLM utilisés dans les applications.",
    expectedAnswer:
      "La température modifie l'échelle de la distribution de probabilité sur le token suivant : des valeurs basses, proches de 0, rendent la sortie plus déterministe et ciblée, ce qui convient à l'extraction ou à la classification ; des valeurs plus élevées la rendent plus variée et créative. Le top-p, ou échantillonnage par noyau (nucleus sampling), restreint les choix au plus petit ensemble de tokens dont la probabilité cumulée atteint p, par exemple 0,9, en éliminant les tokens improbables ; en général, on ajuste soit la température, soit le top-p, mais pas les deux de façon agressive. La fenêtre de contexte est le nombre maximal de tokens que le modèle peut prendre en compte en même temps, y compris le prompt système, l'historique de la conversation, les documents récupérés et la réponse générée. La dépasser oblige à tronquer ou à résumer l'historique. Des contextes plus larges permettent d'apporter plus d'informations, mais augmentent le coût et la latence, et les modèles peuvent exploiter moins fiablement les informations situées au milieu de longs contextes.",
    explanation:
      "Ces paramètres contrôlent l'aléa et la quantité d'information que voit le modèle. Les choisir selon la tâche fait partie de la conception de fonctionnalités LLM fiables.",
    tips: ["Adaptez la température à la tâche.", "Expliquez ce qui est comptabilisé dans la fenêtre de contexte."],
    commonMistakes: ["Utiliser une température élevée pour des tâches factuelles ou structurées.", "Remplir la fenêtre de contexte de documents non pertinents."],
    followUpQuestions: ["Comment géreriez-vous une conversation plus longue que la fenêtre de contexte ?", "Pourquoi un long contexte augmente-t-il le coût ?"],
  },
  "ai-016": {
    question: "Comment choisissez-vous entre le prompt engineering, le RAG et le fine-tuning pour une application LLM ?",
    intent: "Le recruteur vérifie votre capacité à choisir l'approche efficace la plus simple.",
    expectedAnswer:
      "Je commence par le prompt engineering, car c'est l'approche la plus rapide et la moins coûteuse à itérer : des instructions claires, des exemples et des formats de sortie suffisent pour de nombreuses tâches. Si le modèle a besoin de connaissances qu'il ne possède pas, comme des documents internes, des informations récentes ou des données propres à un client, j'ajoute la génération augmentée par récupération (RAG), qui fournit le contexte pertinent au moment de la requête, maintient l'information à jour et permet de citer les sources. Le fine-tuning est utile pour modifier le comportement plutôt que les connaissances : un style ou un format cohérent, une tâche spécialisée exécutée de nombreuses fois, ou permettre à un modèle plus petit et moins cher d'atteindre la qualité d'un plus grand. Il exige un bon jeu de données étiqueté, une évaluation et un réentraînement lorsque les besoins changent. Ces approches se combinent bien : un modèle fine-tuné peut tout à fait utiliser le RAG. La décision doit s'appuyer sur un jeu d'évaluation qui mesure la qualité sur des exemples réels.",
    explanation:
      "Le prompting modifie les instructions, le RAG ajoute des connaissances, le fine-tuning modifie le comportement. Commencer simple et mesurer est le principe clé.",
    tips: ["Expliquez ce que chaque approche modifie.", "Mentionnez la combinaison des approches.", "Insistez sur l'évaluation."],
    commonMistakes: ["Faire du fine-tuning pour enseigner des faits qui changent fréquemment.", "Choisir une approche sans jeu d'évaluation."],
    followUpQuestions: ["Quelle taille doit avoir un jeu d'évaluation ?", "Qu'est-ce qui vous ferait passer du RAG au fine-tuning ?"],
  },
  "ai-017": {
    question: "Comment évalueriez-vous la qualité d'une fonctionnalité basée sur un LLM avant et après son lancement ?",
    intent: "Le recruteur évalue des pratiques avancées, fondées sur des données probantes, pour des systèmes non déterministes.",
    expectedAnswer:
      "Je commencerais par définir avec l'équipe produit ce que signifie une « bonne » réponse pour cette fonctionnalité : exactitude, exhaustivité, ton, format, sécurité et latence, puis je traduirais cela en critères mesurables. Ensuite, je constituerais un jeu d'évaluation d'entrées réalistes, incluant des cas limites et des exemples adverses, avec des réponses de référence ou des grilles de notation, idéalement à partir de données réelles d'utilisateurs, en respectant la confidentialité. L'évaluation combine plusieurs méthodes : des vérifications exactes ou programmatiques lorsque c'est possible, comme un JSON valide ou des champs extraits corrects ; des métriques fondées sur des références ; un LLM-as-a-judge avec une grille claire, calibré par rapport à des notations humaines, car les juges ont des biais, comme favoriser les réponses plus longues ; et une relecture humaine régulière d'échantillons. Chaque modification du prompt, du modèle ou du pipeline de récupération est testée sur cette suite, comme des tests de non-régression, et les résultats sont suivis dans le temps. Après le lancement, je surveillerais les signaux utilisateurs, comme les pouces levés ou baissés, les modifications, les nouvelles tentatives et les abandons, j'examinerais des échantillons de conversations, je suivrais le coût et la latence, et je réinjecterais les échecs dans le jeu d'évaluation. Des tests A/B comparent les versions sur des résultats métier.",
    explanation:
      "Les fonctionnalités LLM ont besoin de suites d'évaluation comme le code a besoin de tests. Les candidats avancés combinent vérifications automatisées, juges calibrés, relecture humaine et retours de production.",
    tips: ["Définissez d'abord les critères de qualité.", "Constituez un jeu d'évaluation et exécutez-le à chaque modification.", "Expliquez les limites du LLM-as-a-judge."],
    commonMistakes: ["Juger la qualité en essayant manuellement quelques prompts.", "Faire confiance à un juge LLM sans le comparer à des évaluations humaines."],
    followUpQuestions: ["Comment évitez-vous que votre jeu d'évaluation devienne obsolète ?", "Quels biais les juges LLM présentent-ils ?"],
  },
  "ai-018": {
    question: "Comment choisiriez-vous entre une API de LLM hébergée et un modèle open-weights auto-hébergé ?",
    intent: "Le recruteur évalue votre capacité à arbitrer entre qualité, coût, confidentialité, maîtrise et exploitation.",
    expectedAnswer:
      "Je comparerais les options sur des critères concrets à l'aide de notre propre jeu d'évaluation. Qualité : les modèles hébergés les plus performants sont souvent en tête pour le raisonnement complexe, tandis que les modèles open-weights peuvent suffire pour des tâches plus ciblées, surtout après fine-tuning. Coût : les API facturent au token, ce qui est simple et peu coûteux à faible volume, alors que l'auto-hébergement implique des coûts fixes élevés en GPU et en ingénierie, mais peut revenir moins cher à volume important et régulier. Latence et débit : l'auto-hébergement donne la maîtrise, mais exige une planification de capacité et des optimisations, comme la quantification et des frameworks de service efficaces tels que vLLM. Confidentialité et conformité : certaines données ne peuvent pas quitter notre infrastructure ou notre région, ce qui favorise l'auto-hébergement ou des fournisseurs proposant des accords de traitement des données adaptés, un hébergement régional et l'absence d'entraînement sur les données clients. Maîtrise : l'auto-hébergement évite les changements de modèle ou les dépréciations soudaines et permet la personnalisation. Exploitation : l'auto-hébergement exige une équipe pour faire tourner, surveiller et mettre à jour les modèles. De nombreuses organisations utilisent les deux, avec une couche d'abstraction permettant de changer de modèle, et routent les requêtes simples vers des modèles plus petits et moins chers.",
    explanation:
      "La décision est multidimensionnelle. Les réponses avancées s'appuient sur des données d'évaluation et prennent en compte le coût total, la conformité et la capacité opérationnelle.",
    tips: ["Comparez sur la qualité, le coût, la latence, la confidentialité, la maîtrise et l'exploitation.", "Mentionnez une couche d'abstraction et le routage entre modèles."],
    commonMistakes: ["Supposer que l'auto-hébergement est toujours moins cher.", "Envoyer des données sensibles à une API sans vérifier les conditions d'utilisation et la localisation des données."],
    followUpQuestions: ["Qu'est-ce que la quantification, et que coûte-t-elle en qualité ?", "Comment concevriez-vous un routeur de modèles ?"],
  },
  "ai-019": {
    question: "Qu'est-ce que la génération augmentée par récupération (RAG) ?",
    intent: "Le recruteur vérifie votre compréhension du pattern le plus courant pour construire des applications LLM sur des données privées.",
    expectedAnswer:
      "Le RAG combine une étape de recherche avec la génération de texte. Les documents, comme des manuels produit ou des politiques internes, sont découpés en fragments (chunks), convertis en plongements (embeddings) et stockés dans un index vectoriel. Lorsqu'un utilisateur pose une question, le système récupère les fragments les plus pertinents, souvent par similarité sémantique, et les insère dans le prompt avec la consigne de répondre à partir de ce contexte. Le modèle génère alors une réponse ancrée dans les informations récupérées, idéalement avec des citations. Le RAG permet à un LLM d'utiliser des connaissances à jour et privées sans réentraînement, réduit les hallucinations et rend les réponses traçables. Sa qualité dépend fortement de l'étape de récupération : si la bonne information n'est pas récupérée, la réponse ne peut pas être correcte.",
    explanation:
      "Le RAG sépare les connaissances, stockées dans les documents, du raisonnement, effectué par le modèle. La qualité de la récupération est le principal levier.",
    tips: ["Décrivez à la fois la phase d'indexation et la phase de requête.", "Insistez sur l'importance de la qualité de la récupération."],
    commonMistakes: ["Penser que le RAG réentraîne le modèle.", "Ignorer le contrôle d'accès sur les documents récupérés."],
    followUpQuestions: ["Comment découpez-vous les documents en chunks ?", "Comment respecteriez-vous les droits d'accès aux documents dans un système RAG ?"],
  },
  "ai-020": {
    question: "Comment choisissez-vous une stratégie de découpage (chunking) pour un système RAG ?",
    intent: "Le recruteur vérifie vos choix de conception concrets, qui influent fortement sur la qualité de la récupération.",
    expectedAnswer:
      "Les chunks doivent être assez petits pour être spécifiques et tenir dans le prompt, mais assez grands pour conserver leur sens. Le découpage à taille fixe, par exemple de 300 à 800 tokens avec un certain chevauchement, constitue une base simple. Un découpage qui tient compte de la structure est généralement meilleur : découper par titres, sections, paragraphes ou éléments de liste, en gardant intacts les tableaux et les blocs de code. Chaque chunk doit porter des métadonnées, comme le titre du document, le titre de section, la date et les droits d'accès, qui peuvent être ajoutées au texte du chunk pour lui donner du contexte et servir au filtrage. Pour les documents où de petits chunks perdent leur contexte, des techniques comme le parent-document retrieval, qui récupère un petit chunk mais transmet au modèle la section plus large qui le contient, sont utiles. La bonne stratégie dépend des documents et des questions ; je testerais donc plusieurs réglages sur un jeu d'évaluation qui mesure si les bons passages sont récupérés.",
    explanation:
      "Le découpage détermine ce qui peut être récupéré. Des chunks qui respectent la structure, enrichis de métadonnées et réglés à partir d'une évaluation, donnent les meilleurs résultats.",
    tips: ["Expliquez le compromis sur la taille.", "Mentionnez le découpage selon la structure et les métadonnées.", "Réglez à l'aide d'un jeu d'évaluation."],
    commonMistakes: ["Couper au milieu de tableaux ou de phrases.", "Choisir une taille de chunk une fois pour toutes sans mesurer."],
    followUpQuestions: ["Qu'est-ce que le parent-document retrieval ?", "Comment traiteriez-vous des PDF à la mise en page complexe ?"],
  },
  "ai-021": {
    question: "Un chatbot RAG donne de mauvaises réponses. Comment en trouvez-vous la cause ?",
    intent: "Le recruteur vérifie que vous avez une démarche de débogage structurée pour les systèmes d'IA.",
    expectedAnswer:
      "Je décomposerais le pipeline en étapes et je vérifierais chacune avec des exemples en échec. D'abord, l'information est-elle bien présente dans la base de connaissances, et a-t-elle été ingérée correctement, par exemple le texte a-t-il été bien extrait des PDF ? Ensuite, la récupération : pour la question posée, les chunks pertinents figuraient-ils parmi les premiers résultats ? Sinon, le problème peut venir du découpage, du modèle d'embeddings, de la formulation de la requête ou de filtres manquants, et les correctifs incluent un meilleur découpage, une recherche hybride avec mots-clés, la reformulation de la requête ou le reranking. Enfin, la génération : si le bon contexte a été récupéré mais que la réponse reste fausse, le prompt est peut-être ambigu, le contexte trop long ou contradictoire, ou le modèle l'ignore ; des instructions plus claires, des chunks moins nombreux mais meilleurs et la demande de citations aident. J'enregistrerais dans les logs les chunks récupérés et les prompts de chaque réponse pour rendre cette analyse possible, et j'ajouterais chaque échec au jeu d'évaluation pour mesurer les améliorations.",
    explanation:
      "La plupart des échecs d'un RAG sont des échecs de récupération. Examiner chaque étape séparément évite de modifier le prompt quand le vrai problème se situe en amont.",
    tips: ["Vérifiez séparément l'ingestion, la récupération et la génération.", "Enregistrez le contexte récupéré dans les logs.", "Ajoutez les échecs au jeu d'évaluation."],
    commonMistakes: ["Retoucher le prompt indéfiniment sans vérifier la récupération.", "Ne tester qu'avec une poignée d'exemples."],
    followUpQuestions: ["Qu'est-ce que la recherche hybride ?", "Comment mesureriez-vous la qualité de la récupération ?"],
  },
  "ai-022": {
    question: "Quelles techniques avancées améliorent la qualité de la récupération dans un système RAG ?",
    intent: "Le recruteur évalue vos connaissances avancées des systèmes RAG en production.",
    expectedAnswer:
      "La recherche hybride combine la recherche vectorielle sémantique avec une recherche par mots-clés comme BM25, puis fusionne les résultats, par exemple avec la reciprocal rank fusion ; elle gère les termes exacts, comme les références produit et les noms propres, que les embeddings peuvent manquer. Un reranker, généralement un modèle cross-encoder, note chaque candidat récupéré par rapport à la requête plus précisément que les embeddings : on récupère donc de nombreux candidats et l'on ne garde que les meilleurs. La transformation de requête aide lorsque les questions des utilisateurs sont vagues ou conversationnelles : reformuler la requête à partir de l'historique de la conversation, générer plusieurs variantes de la requête ou décomposer une question complexe en sous-questions. Le filtrage par métadonnées restreint la recherche aux documents pertinents, comme ceux correspondant à la version du produit de l'utilisateur ou aux documents qu'il est autorisé à consulter, ce qui applique aussi le contrôle d'accès. L'enrichissement contextuel ajoute à chaque chunk le titre du document ou un court résumé généré avant le calcul de l'embedding. Pour les questions qui portent sur de nombreux documents, des approches comme les hiérarchies de résumés ou les graphes de connaissances peuvent aider. Chaque technique ajoute de la latence et du coût ; je les ajouterais donc une par une et ne garderais que celles qui améliorent les métriques de récupération mesurées, comme le recall at k et le mean reciprocal rank.",
    explanation:
      "Un RAG en production combine généralement recherche hybride, reranking, reformulation de requête et filtrage. Les candidats avancés justifient chaque ajout par des métriques.",
    tips: ["Expliquez la recherche hybride et le reranking.", "Mentionnez la reformulation de requête et le filtrage par métadonnées.", "Mesurez l'effet de chaque modification."],
    commonMistakes: ["S'appuyer uniquement sur la similarité vectorielle pour des identifiants exacts.", "Ajouter toutes les techniques à la fois sans mesurer."],
    followUpQuestions: ["Comment fonctionne la reciprocal rank fusion ?", "Quel est le coût en latence d'un reranker ?"],
  },
};
