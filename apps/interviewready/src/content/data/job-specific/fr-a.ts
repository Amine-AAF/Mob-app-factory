import type { QuestionText, TextTable } from '@/types/content';

/** Questions métier 001-030 : gestion de projet, product management, analyse métier, support informatique. */
export const frA: TextTable<QuestionText> = {
  'job-001': {
    question: "Quelle est la différence entre Agile et le modèle en cascade (Waterfall), et quand utiliseriez-vous chacun ?",
    intent: "Le recruteur vérifie que vous connaissez les principales approches de pilotage et que vous savez en choisir une selon le contexte plutôt que par habitude.",
    expectedAnswer:
      "L'approche Waterfall planifie tout le projet dès le départ et enchaîne des phases séquentielles : expression des besoins, conception, réalisation, tests et déploiement. Elle convient lorsque les besoins sont stables et bien compris, lorsque les changements coûtent cher, comme dans la construction ou les projets réglementés, ou lorsque le contrat impose un périmètre fixe. Agile livre par courtes itérations, généralement d'une à quatre semaines, en produisant des incréments fonctionnels et en adaptant le plan selon les retours ; Scrum et Kanban sont les cadres les plus courants. Elle convient aux projets incertains, comme les nouveaux produits numériques, où apprendre des utilisateurs est essentiel. Beaucoup d'organisations adoptent un modèle hybride : un budget global et des jalons fixes, avec une réalisation Agile à l'intérieur.",
    explanation:
      "Le recruteur veut voir que vous choisissez une méthode en fonction de l'incertitude, des risques et des contraintes, et non par conviction.",
    tips: ["Donnez un exemple de projet pour chaque approche.", "Mentionnez les modèles hybrides utilisés dans les organisations réelles."],
    commonMistakes: ["Présenter Agile comme une absence de planification.", "Affirmer qu'une méthode est toujours meilleure que l'autre."],
    followUpQuestions: ["Quelle est la différence entre Scrum et Kanban ?", "Comment mèneriez-vous un projet Agile avec une échéance fixe ?"],
  },
  'job-002': {
    question: "Comment définissez-vous le périmètre d'un projet et comment évitez-vous la dérive du périmètre (scope creep) ?",
    intent: "Le recruteur vérifie une compétence fondamentale de la gestion de projet, qui protège le budget et les délais.",
    expectedAnswer:
      "Je définis le périmètre avec les parties prenantes dès le lancement, dans une courte note de cadrage : objectifs, livrables, ce qui est explicitement hors périmètre, hypothèses et critères d'acceptation. Écrire ce qui est hors périmètre est aussi important que ce qui en fait partie. Ensuite, je mets en place un processus simple de gestion des changements : chaque nouvelle demande est documentée, son impact sur les délais, les coûts et les risques est évalué, et le sponsor décide de l'ajouter, de la substituer à autre chose ou de la reporter. Ainsi, les changements restent possibles, mais ce sont des décisions visibles plutôt que des ajouts silencieux.",
    explanation:
      "La dérive du périmètre vient de petits changements non suivis. Une référence claire et un processus de changement léger préservent la souplesse tout en protégeant les engagements.",
    tips: ["Mentionnez explicitement le « hors périmètre ».", "Décrivez un processus simple de demande de changement."],
    commonMistakes: ["Accepter de petites demandes de façon informelle jusqu'à ce que le projet prenne du retard.", "Refuser tout changement, ce qui frustre les parties prenantes."],
    followUpQuestions: ["Que faites-vous lorsqu'un dirigeant contourne le processus de changement ?", "Comment documentez-vous les critères d'acceptation ?"],
  },
  'job-003': {
    question: "Comment construisez-vous un planning de projet et estimez-vous sa durée ?",
    intent: "Le recruteur évalue votre méthode de planification et la façon dont vous gérez l'incertitude des estimations.",
    expectedAnswer:
      "Je commence par découper le travail en livrables puis en tâches plus petites, selon un organigramme des tâches (WBS), jusqu'à ce que chaque tâche puisse être estimée et attribuée. Je demande aux personnes qui réaliseront le travail de l'estimer, avec des fourchettes ou une estimation à trois points, optimiste, probable et pessimiste, plutôt qu'un chiffre unique. J'identifie ensuite les dépendances pour trouver le chemin critique, c'est-à-dire l'enchaînement de tâches qui détermine la date de fin, et je vérifie la disponibilité des ressources, congés et autres projets compris. J'ajoute une marge selon le niveau de risque, souvent de 10 à 20 %, et je fixe des jalons pour suivre l'avancement. Je présente le planning avec ses hypothèses et son niveau de confiance, et je le mets à jour au fil de ce que nous apprenons.",
    explanation:
      "Un planning crédible combine découpage, estimations des personnes qui font le travail, dépendances, capacité et marge explicite.",
    tips: ["Mentionnez l'organigramme des tâches et le chemin critique.", "Impliquez l'équipe dans les estimations.", "Communiquez vos hypothèses."],
    commonMistakes: ["Estimer seul, sans l'équipe.", "Planifier chaque personne à 100 % de sa capacité."],
    followUpQuestions: ["Que feriez-vous si l'échéance était imposée et plus courte que votre estimation ?", "Comment suivez-vous l'avancement par rapport au planning ?"],
  },
  'job-004': {
    question: "Comment identifiez-vous et gérez-vous les risques d'un projet ?",
    intent: "Le recruteur vérifie que vous gérez les risques de manière proactive plutôt que de réagir aux problèmes.",
    expectedAnswer:
      "Au lancement puis à intervalles réguliers, j'organise de courts ateliers de risques avec l'équipe et les principales parties prenantes pour lister ce qui pourrait mal tourner : retard d'un fournisseur, départ d'une personne clé ou besoins flous, par exemple. J'inscris chaque risque dans un registre des risques avec sa probabilité, son impact, son responsable et la réponse prévue. Les réponses possibles sont d'éviter le risque, de le réduire, de le transférer, par exemple via une clause contractuelle, ou de l'accepter avec un plan de contingence. Je passe en revue les principaux risques à chaque point d'avancement, car ils évoluent dans le temps, et j'escalade tôt lorsqu'un risque nécessite une décision du sponsor. Quand un risque se réalise, il devient un problème avéré et est traité dans le registre des problèmes.",
    explanation:
      "La gestion des risques est un processus continu, avec des responsables et des revues régulières, et non un document rédigé une fois au lancement.",
    tips: ["Décrivez les champs du registre des risques.", "Citez les quatre types de réponse.", "Mentionnez les revues régulières."],
    commonMistakes: ["Rédiger un registre des risques sans jamais le mettre à jour.", "Confondre les risques avec des problèmes déjà survenus."],
    followUpQuestions: ["Donnez un exemple de risque que vous avez réussi à atténuer.", "Comment priorisez-vous les risques ?"],
  },
  'job-005': {
    question: "Parlez-moi d'un projet qui prenait du retard. Qu'avez-vous fait ?",
    intent: "Le recruteur veut voir comment vous diagnostiquez un retard, faites des arbitrages et communiquez sous pression.",
    expectedAnswer:
      "Situation : je pilotais le déploiement d'un nouveau CRM dans trois agences commerciales et, à mi-parcours, nous avions trois semaines de retard parce que la migration des données était plus complexe que prévu. Tâche : je devais tenir la date de mise en service, liée au début de l'exercice commercial. Action : j'ai analysé le reste à faire avec l'équipe et constaté que l'essentiel du retard venait du nettoyage des anciennes données clients. J'ai proposé trois options au sponsor : décaler la mise en service, renforcer l'équipe avec un spécialiste des données temporaire, ou migrer d'abord les seuls clients actifs et le reste un mois plus tard. Nous avons retenu la troisième option et ajouté deux jours d'heures supplémentaires pour les tests, avec l'accord de l'équipe. J'ai informé les parties prenantes chaque semaine avec un graphique d'avancement simple. Résultat : le système a été mis en service à la date prévue pour tous les clients actifs, et les données restantes ont été migrées quatre semaines plus tard sans perturbation.",
    explanation:
      "Les meilleures réponses montrent une analyse de la cause, des options avec leurs compromis présentées au décideur et une communication transparente.",
    tips: ["Expliquez la cause profonde du retard.", "Présentez les options que vous avez envisagées.", "Montrez comment vous avez communiqué."],
    commonMistakes: ["Résoudre les retards uniquement en demandant des heures supplémentaires à l'équipe.", "Cacher le retard jusqu'à ce qu'il soit trop tard."],
    followUpQuestions: ["Comment l'équipe a-t-elle réagi aux heures supplémentaires ?", "Que feriez-vous différemment lors de la phase de planification ?"],
  },
  'job-006': {
    question: "Parlez-moi d'une situation où les parties prenantes avaient des attentes contradictoires sur un projet.",
    intent: "Le recruteur évalue votre capacité à aligner des personnes aux priorités différentes.",
    expectedAnswer:
      "Situation : pour un nouvel intranet destiné aux salariés, l'équipe communication voulait une page d'accueil centrée sur les actualités, tandis que les RH voulaient un accès rapide aux formulaires et aux procédures. Tâche : en tant que chef de projet, je devais aboutir à une conception soutenue par les deux équipes, dans le budget existant. Action : j'ai rencontré chaque groupe séparément pour comprendre les objectifs sous-jacents : la communication voulait donner de la visibilité aux actualités de l'entreprise, les RH voulaient réduire les demandes d'assistance. J'ai ensuite partagé les résultats d'une enquête interne montrant que les salariés venaient surtout sur l'intranet pour les formulaires et les congés. J'ai animé un atelier commun où nous avons conçu une page d'accueil avec des liens rapides en haut et une rubrique actualités en dessous, et nous avons convenu d'analyser l'usage au bout de trois mois. Résultat : les deux équipes ont validé la solution, les demandes adressées aux RH ont baissé de 25 % et les actualités ont été plus consultées que sur l'ancien intranet.",
    explanation:
      "Aligner les parties prenantes consiste à découvrir les objectifs derrière les positions, à s'appuyer sur des données partagées et à concevoir une solution qui serve chacun.",
    tips: ["Montrez que vous avez écouté chaque partie séparément.", "Utilisez des données pour passer des opinions aux faits."],
    commonMistakes: ["Laisser la partie prenante la plus haut placée décider sans discussion.", "Décrire l'une des parties de manière négative."],
    followUpQuestions: ["Et s'ils n'étaient pas tombés d'accord ?", "Comment cartographiez-vous les parties prenantes au début d'un projet ?"],
  },
  'job-007': {
    question: "Parlez-moi d'un projet qui a échoué ou qui a dû être arrêté. Qu'en avez-vous retiré ?",
    intent: "Le recruteur évalue votre sens des responsabilités, votre honnêteté et votre capacité à tirer des leçons d'un échec à un niveau senior.",
    expectedAnswer:
      "Situation : je pilotais le développement d'un outil interne de gestion des contrats fournisseurs. Au bout de quatre mois, avec environ 60 % du budget consommé, les tests utilisateurs ont montré que l'équipe achats continuerait d'utiliser ses tableurs, car l'outil ne correspondait pas à sa façon réelle de travailler. Tâche : je devais décider de poursuivre, de réorienter ou d'arrêter le projet. Action : j'ai analysé la situation en toute honnêteté avec l'équipe et le sponsor. Nous avions recueilli les besoins auprès des managers plutôt que des personnes qui faisaient le travail, et nous avions testé trop tard avec les utilisateurs. J'ai recommandé d'arrêter le développement et d'évaluer une solution du marché, moins coûteuse que de terminer et corriger notre outil. J'ai présenté cette recommandation au comité de pilotage, chiffres à l'appui, et j'ai assumé la responsabilité des lacunes de la phase de découverte. Résultat : le comité a validé, une solution du marché a été déployée en deux mois, et j'ai changé ma pratique : sur les projets suivants, j'implique les utilisateurs finaux dès la première semaine et je teste des prototypes avant de développer.",
    explanation:
      "Arrêter un projet qui échoue est une preuve de discernement. Assumer l'erreur, en expliquer la cause et montrer une pratique modifiée rendent cette réponse convaincante.",
    tips: ["Choisissez un véritable échec avec une leçon claire.", "Expliquez comment vous avez décidé d'arrêter.", "Décrivez comment votre pratique a changé."],
    commonMistakes: ["Rejeter la faute sur l'équipe ou les utilisateurs.", "Choisir un « échec » qui était en réalité un succès."],
    followUpQuestions: ["Comment l'équipe a-t-elle réagi à l'arrêt du projet ?", "Comment repérez-vous tôt qu'un projet est en train d'échouer ?"],
  },
  'job-008': {
    question: "Comment rendez-vous compte de l'avancement d'un projet et mesurez-vous sa santé ?",
    intent: "Le recruteur évalue votre maîtrise avancée du pilotage de projet et de la communication avec la direction.",
    expectedAnswer:
      "Je m'appuie sur quelques indicateurs qui montrent si le projet apportera la valeur attendue dans les délais et le budget : avancement par rapport aux jalons, budget consommé par rapport au prévu et estimation à terminaison, changements de périmètre, principaux risques et problèmes, et capacité de l'équipe. Pour les projets plus importants, la méthode de la valeur acquise (EVM) est utile : comparer la valeur planifiée, la valeur acquise et le coût réel donne des indices de performance des délais et des coûts ; un indice de performance des coûts de 0,85 signifie que nous obtenons 0,85 euro de travail prévu pour chaque euro dépensé. J'utilise un rapport d'une page avec un statut rouge, orange ou vert pour chaque dimension, une courte explication et les décisions attendues, et j'adapte le niveau de détail au public : détail hebdomadaire pour l'équipe, synthèse mensuelle avec décisions pour le comité de pilotage. Un statut doit être honnête : un orange ou un rouge signalé tôt, avec un plan de redressement, inspire plus confiance qu'un vert qui vire soudainement au rouge.",
    explanation:
      "Un bon reporting combine des indicateurs objectifs, une synthèse claire et des alertes honnêtes et précoces. La valeur acquise apporte de la rigueur sur les projets importants.",
    tips: ["Listez les dimensions que vous suivez.", "Expliquez un indicateur de valeur acquise.", "Insistez sur l'honnêteté du statut."],
    commonMistakes: ["Afficher « vert » jusqu'au dernier moment.", "Envoyer de longs rapports sans décisions ni actions."],
    followUpQuestions: ["Qu'est-ce que l'indice de performance des délais (SPI) ?", "Comment gérez-vous un sponsor qui ne veut entendre que de bonnes nouvelles ?"],
  },
  'job-009': {
    question: "Pourquoi voulez-vous devenir product manager, et que représente ce rôle pour vous ?",
    intent: "Le recruteur vérifie que vous comprenez les responsabilités d'un product manager et qu'elles vous motivent réellement.",
    expectedAnswer:
      "Pour moi, le product manager est responsable de s'assurer que l'équipe construit la bonne chose : comprendre les utilisateurs et l'activité, décider quels problèmes résoudre et dans quel ordre, puis mesurer si la solution a fonctionné. C'est un rôle d'influence plutôt que d'autorité, puisque le PM travaille avec les designers, les développeurs, le marketing et les ventes sans les encadrer. Ce rôle m'attire parce que, dans mon poste actuel d'analyste métier, les moments que je préfère sont les échanges avec les utilisateurs, la découverte du vrai problème derrière une demande et le fait de voir une fonctionnalité changer leur manière de travailler. Je veux être responsable des résultats, et pas seulement des besoins.",
    explanation:
      "Une bonne réponse définit le rôle avec justesse, met l'accent sur les résultats et le relie à votre propre expérience et à votre motivation.",
    tips: ["Définissez le rôle en termes de problèmes et de résultats.", "Reliez-le à des expériences concrètes."],
    commonMistakes: ["Présenter le PM comme le « PDG du produit ».", "Se concentrer uniquement sur la gestion des tâches ou du backlog."],
    followUpQuestions: ["Quelle est la différence entre un product manager et un chef de projet ?", "Quel produit admirez-vous, et pourquoi ?"],
  },
  'job-010': {
    question: "Comment priorisez-vous un backlog produit ?",
    intent: "Le recruteur évalue votre cadre de décision et la façon dont vous équilibrez des sources différentes.",
    expectedAnswer:
      "Je pars des objectifs produit de la période, par exemple améliorer l'activation ou la rétention, afin d'évaluer chaque élément au regard de ce qui compte maintenant. J'utilise ensuite un cadre simple et transparent. RICE note les éléments selon la portée (reach), l'impact, la confiance et l'effort ; MoSCoW les classe en must, should, could ou won't pour une version ; et le modèle de Kano distingue les attentes de base des fonctionnalités qui enchantent les utilisateurs. Je combine ces scores avec mon jugement : dépendances, dette technique qui ralentit l'équipe, engagements pris auprès des clients et risques comme la conformité. Je partage ouvertement le raisonnement avec les parties prenantes pour qu'elles comprennent pourquoi leur demande n'est pas en tête, et je revois la priorisation régulièrement à mesure que de nouvelles données arrivent.",
    explanation:
      "Les cadres rendent la priorisation explicite et discutable, mais ils soutiennent le jugement au lieu de le remplacer.",
    tips: ["Partez des objectifs.", "Citez un ou deux cadres de priorisation.", "Expliquez comment vous communiquez vos décisions."],
    commonMistakes: ["Prioriser selon celui qui crie le plus fort.", "Appliquer mécaniquement une grille de notation."],
    followUpQuestions: ["Comment arbitrez-vous entre dette technique et nouvelles fonctionnalités ?", "Comment dites-vous non à un gros client ?"],
  },
  'job-011': {
    question: "Comment définissez-vous les indicateurs de succès d'une nouvelle fonctionnalité ?",
    intent: "Le recruteur vérifie que vous raisonnez en termes de résultats et que vous savez mesurer.",
    expectedAnswer:
      "Je pars du problème que la fonctionnalité doit résoudre et du changement de comportement attendu. Par exemple, pour un bouton « mettre de côté » dans une boutique en ligne, l'objectif pourrait être de récupérer les achats des utilisateurs qui hésitent. L'indicateur principal serait le taux de conversion des articles mis de côté en achats sous 30 jours. J'ajouterais l'adoption, c'est-à-dire la part d'utilisateurs qui se servent de la fonctionnalité, ainsi que des indicateurs garde-fous pour vérifier que nous ne dégradons rien d'autre, comme la conversion globale ou la vitesse des pages. Je fixe les cibles et la période de mesure avant le lancement, je vérifie que le tracking est en place et, si possible, je lance un test A/B pour isoler l'effet de la fonctionnalité des autres changements.",
    explanation:
      "De bons indicateurs relient la fonctionnalité au comportement des utilisateurs et à la valeur pour l'entreprise, incluent des garde-fous et sont définis avant le lancement.",
    tips: ["Reliez les indicateurs au problème.", "Ajoutez des indicateurs d'adoption et des garde-fous.", "Fixez les cibles avant le lancement."],
    commonMistakes: ["Mesurer uniquement des volumes d'utilisation.", "Choisir les indicateurs après avoir vu les résultats."],
    followUpQuestions: ["Qu'est-ce qu'une north star metric ?", "Que faire si l'adoption est élevée mais que l'indicateur métier ne bouge pas ?"],
  },
  'job-012': {
    question: "Parlez-moi d'une décision produit que vous avez prise à partir de recherches utilisateurs.",
    intent: "Le recruteur évalue si vous vous appuyez sur des éléments concrets venant des utilisateurs plutôt que sur des opinions.",
    expectedAnswer:
      "Situation : notre équipe prévoyait de développer un reporting avancé pour une application de prise de rendez-vous, car plusieurs grands clients l'avaient demandé. Tâche : en tant que product manager, je voulais confirmer que c'était l'investissement le plus utile pour le trimestre suivant. Action : j'ai interrogé douze clients de tailles différentes et analysé les tickets de support. J'ai constaté que seuls les grands clients avaient besoin de rapports avancés, alors que la plupart des petits clients butaient sur quelque chose de plus simple : ils ne comprenaient pas comment créer des rendez-vous récurrents, ce qui provoquait de nombreuses annulations. J'ai présenté ces résultats à l'équipe et aux parties prenantes et proposé d'améliorer d'abord les rendez-vous récurrents, avec une fonction d'export plus légère pour les grands clients. Résultat : le parcours repensé a réduit de 40 % les tickets de support liés aux rendez-vous récurrents, et la rétention des petits clients s'est améliorée le trimestre suivant.",
    explanation:
      "Cette réponse montre des méthodes de recherche, un enseignement qui a changé le plan et des résultats mesurables, ce qui est l'essence d'un travail produit fondé sur les faits.",
    tips: ["Décrivez la méthode de recherche.", "Montrez comment l'enseignement a changé la décision.", "Chiffrez le résultat."],
    commonMistakes: ["Utiliser la recherche uniquement pour confirmer une décision déjà prise.", "S'appuyer sur un seul client très insistant."],
    followUpQuestions: ["Comment avez-vous choisi les personnes à interroger ?", "Comment avez-vous géré les grands clients qui voulaient des rapports ?"],
  },
  'job-013': {
    question: "Comment aborderiez-vous l'amélioration de l'onboarding d'une application mobile ?",
    intent: "Le recruteur évalue la structure de votre réflexion produit face à un problème ouvert.",
    expectedAnswer:
      "Je commencerais par clarifier l'objectif : l'onboarding réussit lorsque les nouveaux utilisateurs atteignent le moment où ils obtiennent de la valeur, par exemple leur première réservation. Je mesurerais l'entonnoir entre l'installation et ce moment pour repérer où les utilisateurs décrochent, en segmentant par canal et par appareil. Je chercherais ensuite à comprendre pourquoi, grâce à des enregistrements de sessions, de courts questionnaires et quelques entretiens utilisateurs. Les problèmes typiques sont trop d'informations demandées trop tôt, une valeur peu claire ou des autorisations demandées sans contexte. Je listerais des hypothèses, par exemple « réduire le formulaire d'inscription de sept champs à trois augmentera le taux de complétion », je les prioriserais selon l'impact attendu et l'effort, et je testerais les plus prometteuses par des tests A/B. Le succès se mesurerait au taux d'activation et à la rétention des premiers jours, pas seulement au taux d'inscription.",
    explanation:
      "Une approche structurée va de l'objectif aux données, puis à la compréhension des utilisateurs, aux hypothèses et aux expérimentations, avec le bon indicateur de succès.",
    tips: ["Définissez d'abord l'activation.", "Combinez recherche quantitative et qualitative.", "Formulez des hypothèses testables."],
    commonMistakes: ["Se lancer directement dans la refonte des écrans.", "Optimiser le taux d'inscription alors que l'activation reste faible."],
    followUpQuestions: ["Qu'est-ce qu'un indicateur d'activation ?", "Comment prioriseriez-vous vos hypothèses ?"],
  },
  'job-014': {
    question: "Parlez-moi d'un produit ou d'une fonctionnalité que vous avez lancé et qui n'a pas donné les résultats attendus.",
    intent: "Le recruteur évalue votre sens des responsabilités, votre capacité d'apprentissage et votre réaction face à des données décevantes, à un niveau senior.",
    expectedAnswer:
      "Situation : j'ai lancé un programme de parrainage dans une application de gestion de budget, en visant 10 % des nouvelles inscriptions issues du parrainage sous trois mois. Tâche : au bout de six semaines, le parrainage ne représentait que 2 %. Je devais décider d'améliorer, de modifier ou d'arrêter le programme. Action : j'ai analysé l'entonnoir et constaté que beaucoup d'utilisateurs ouvraient l'écran de parrainage, mais que très peu envoyaient des invitations. Les entretiens ont révélé que les gens étaient mal à l'aise à l'idée de recommander une application financière, qui leur donnait l'impression de partager des informations privées, et que la récompense, un mois premium, n'était pas assez attractive. J'ai reconnu auprès des parties prenantes que je n'avais pas testé cette hypothèse avant le lancement. Nous avons testé deux changements : un message centré sur l'épargne à deux avec un partenaire, et une récompense pour les deux personnes. Résultat : le parrainage est monté à 6 %, en dessous de l'objectif initial ; j'ai donc recommandé de maintenir le programme à faible coût et d'investir le reste du budget dans d'autres canaux. Depuis, je valide les hypothèses clés par des tests rapides ou des entretiens avant de développer.",
    explanation:
      "Les meilleures réponses combinent une responsabilité assumée honnêtement, un diagnostic fondé sur les données, des décisions rationnelles sur la suite des investissements et un changement durable de pratique.",
    tips: ["Indiquez les résultats attendus et obtenus.", "Montrez le diagnostic et la décision.", "Expliquez ce que vous avez changé dans votre méthode."],
    commonMistakes: ["Rejeter la faute sur le marketing ou les développeurs.", "Continuer à investir sans éléments probants."],
    followUpQuestions: ["Comment décidez-vous d'arrêter d'investir dans une fonctionnalité ?", "Comment validez-vous vos hypothèses avant de développer ?"],
  },
  'job-015': {
    question: "Comment concevez-vous et interprétez-vous un test A/B ?",
    intent: "Le recruteur évalue des compétences avancées en expérimentation et votre culture statistique.",
    expectedAnswer:
      "Je pars d'une hypothèse claire et d'un indicateur principal, par exemple « afficher les frais de livraison sur la fiche produit augmentera le taux de finalisation de commande », accompagnés d'indicateurs garde-fous. J'estime la taille d'échantillon nécessaire pour détecter le plus petit effet qui compte, en fonction du taux de base, de la puissance statistique souhaitée, généralement 80 %, et du seuil de significativité, généralement 5 % ; cela détermine la durée du test, qui doit idéalement couvrir des semaines complètes. Les utilisateurs sont affectés aléatoirement et restent dans le même groupe. J'évite d'arrêter le test dès que le résultat semble significatif, car les consultations répétées (peeking) augmentent les faux positifs, sauf si nous utilisons une méthode séquentielle prévue pour cela. À la lecture des résultats, je regarde l'intervalle de confiance et pas seulement la p-valeur, je vérifie les garde-fous et l'absence de déséquilibre de répartition (sample ratio mismatch), qui signale un bug d'affectation, et j'évite de chercher des résultats significatifs dans de multiples segments. Un résultat non significatif reste une information utile. Enfin, je tiens compte de la significativité pratique : une hausse statistiquement significative de 0,1 % ne justifie pas forcément la complexité ajoutée.",
    explanation:
      "Une bonne expérimentation exige des hypothèses définies à l'avance, une taille d'échantillon suffisante, la discipline de ne pas consulter les résultats en cours de route et une interprétation rigoureuse.",
    tips: ["Mentionnez la taille d'échantillon et la puissance.", "Expliquez le problème du peeking.", "Distinguez significativité statistique et significativité pratique."],
    commonMistakes: ["Arrêter le test dès que le résultat paraît favorable.", "Tester de nombreux indicateurs et ne rapporter que celui qui est significatif."],
    followUpQuestions: ["Qu'est-ce qu'un sample ratio mismatch ?", "Que feriez-vous si le test ne montre aucune différence ?"],
  },
  'job-016': {
    question: "Comment construisez-vous une feuille de route produit alignée sur la stratégie de l'entreprise ?",
    intent: "Le recruteur évalue votre réflexion stratégique et votre capacité à aligner les parties prenantes, à un niveau senior.",
    expectedAnswer:
      "Je pars de la stratégie et des objectifs de l'entreprise, par exemple se développer auprès des entreprises de taille intermédiaire ou améliorer la rétention, et je les traduis en objectifs produit pour les prochains trimestres, souvent sous forme d'OKR avec des résultats clés mesurables. J'identifie ensuite les principaux problèmes qui nous séparent de ces objectifs, à partir des données, de la recherche client, des retours des équipes commerciales et du support et des contraintes techniques. La feuille de route est organisée par résultats et par problèmes plutôt que par une longue liste de fonctionnalités à dates fixes : « Maintenant » pour le travail engagé, « Ensuite » pour les priorités probables et « Plus tard » pour les idées à explorer. Je relis les versions de travail avec les développeurs pour la faisabilité, avec les ventes et le marketing pour le calendrier du marché, et avec la direction pour l'adéquation stratégique, et je rends les arbitrages explicites, y compris ce que nous ne ferons pas. Je la présente différemment selon le public et je la revois chaque trimestre à mesure que nous apprenons. Les engagements datés sont réservés aux éléments soumis à des dépendances externes, comme des contrats ou des réglementations.",
    explanation:
      "Une feuille de route orientée résultats relie la stratégie aux problèmes et préserve la souplesse, tout en clarifiant les arbitrages et les engagements.",
    tips: ["Partez de la stratégie et des objectifs.", "Présentez une feuille de route orientée résultats.", "Expliquez comment vous alignez les parties prenantes."],
    commonMistakes: ["Promettre une année de fonctionnalités à dates fixes.", "Construire la feuille de route uniquement à partir des demandes clients."],
    followUpQuestions: ["Comment gérez-vous une demande commerciale qui entre en conflit avec la feuille de route ?", "Quelle est la différence entre un résultat (outcome) et un livrable (output) ?"],
  },
  'job-017': {
    question: "Que fait un analyste métier (business analyst), et quelle valeur ce rôle apporte-t-il ?",
    intent: "Le recruteur vérifie que vous comprenez le rôle et que vous savez expliquer sa contribution aux projets.",
    expectedAnswer:
      "Un analyste métier aide une organisation à comprendre ses besoins et à définir des solutions qui créent de la valeur. Concrètement, je travaille avec les parties prenantes pour comprendre les processus actuels et les problèmes, je recueille et clarifie les besoins, je modélise les processus et les données, je rédige des user stories et des critères d'acceptation, et j'aide l'équipe de développement ou de déploiement à construire la bonne solution. J'accompagne aussi les tests et l'adoption. La valeur du rôle est de réduire les malentendus entre les équipes métier et techniques, pour que moins de fonctionnalités soient développées pour de mauvaises raisons, et de fonder les décisions sur l'analyse plutôt que sur des suppositions.",
    explanation:
      "L'analyste métier fait le pont entre les besoins métier et les solutions. Expliquer sa valeur en termes de reprises évitées et de meilleures décisions rend la réponse convaincante.",
    tips: ["Décrivez des activités concrètes.", "Expliquez la valeur en termes métier."],
    commonMistakes: ["Réduire le rôle à la rédaction de documents."],
    followUpQuestions: ["En quoi un analyste métier diffère-t-il d'un product owner ?", "Quels outils utilisez-vous ?"],
  },
  'job-018': {
    question: "Comment recueillez-vous les besoins auprès des parties prenantes ?",
    intent: "Le recruteur évalue vos techniques de recueil des besoins et votre capacité à faire émerger les besoins réels.",
    expectedAnswer:
      "J'utilise plusieurs techniques selon la situation. Les entretiens avec les parties prenantes clés m'aident à comprendre les objectifs et les irritants ; les ateliers réunissent les personnes pour s'accorder sur les priorités ; l'observation des utilisateurs en situation de travail révèle des étapes et des contournements qu'ils oublient de mentionner ; et l'analyse des documents, rapports et données existants apporte des faits. Je pose des questions ouvertes et je continue à demander « pourquoi » pour trouver le besoin derrière la solution demandée : par exemple, la demande d'« un nouveau rapport » peut en réalité traduire le besoin de détecter plus tôt les retards de paiement. Je documente clairement les besoins, je les fais valider par les parties prenantes et je suis les questions ouvertes.",
    explanation:
      "Combiner plusieurs techniques et chercher le besoin derrière chaque demande mène à de meilleures solutions que de prendre les demandes au pied de la lettre.",
    tips: ["Citez plusieurs techniques de recueil des besoins.", "Montrez comment vous trouvez le besoin derrière une demande."],
    commonMistakes: ["Noter les demandes sans les questionner.", "Ne parler qu'aux managers et pas aux utilisateurs finaux."],
    followUpQuestions: ["Comment faites-vous avec une partie prenante qui n'est pas disponible ?", "Comment validez-vous les besoins ?"],
  },
  'job-019': {
    question: "Comment rédigez-vous de bonnes user stories et de bons critères d'acceptation ?",
    intent: "Le recruteur vérifie des compétences pratiques utilisées au quotidien dans les équipes Agile.",
    expectedAnswer:
      "Une user story décrit un besoin du point de vue de l'utilisateur : « En tant que responsable d'entrepôt, je veux voir les commandes en retard de plus de 24 heures, afin de contacter les clients avant qu'ils ne se plaignent. » Une bonne story respecte les critères INVEST : indépendante, négociable, porteuse de valeur, estimable, de petite taille (small) et testable. Les critères d'acceptation définissent quand la story est terminée, souvent au format Étant donné / Quand / Alors (Given-When-Then) : « Étant donné une commande créée il y a plus de 24 heures et non expédiée, quand j'ouvre le tableau de bord, alors la commande apparaît dans la liste En retard avec les coordonnées du client. » J'y inclus les cas limites et les exigences non fonctionnelles, comme les droits d'accès ou la performance, et je discute des stories avec l'équipe avant le sprint pour m'assurer que tout le monde les comprend de la même façon.",
    explanation:
      "Les stories expriment la valeur ; les critères d'acceptation les rendent testables. La conversation avec l'équipe compte autant que le texte écrit.",
    example: "Étant donné une commande de plus de 24 heures qui n'a pas été expédiée\nQuand le responsable ouvre le tableau de bord\nAlors la commande apparaît dans « En retard » avec le numéro de téléphone du client",
    tips: ["Incluez la partie « afin de » pour exprimer la valeur.", "Rédigez des critères d'acceptation testables.", "Couvrez les cas limites."],
    commonMistakes: ["Rédiger des tâches techniques sous forme de user stories.", "Laisser des critères d'acceptation vagues, comme « fonctionne correctement »."],
    followUpQuestions: ["Comment découpez-vous une story trop grosse ?", "Qui rédige les critères d'acceptation dans votre équipe ?"],
  },
  'job-020': {
    question: "Comment modélisez-vous et améliorez-vous un processus métier ?",
    intent: "Le recruteur évalue vos compétences en analyse de processus et votre capacité à trouver des améliorations.",
    expectedAnswer:
      "Je commence par documenter le processus actuel, « as-is », avec les personnes qui le réalisent, à l'aide d'une notation claire comme BPMN ou d'un simple diagramme en couloirs (swimlanes) montrant qui fait quoi : étapes, décisions, systèmes et transmissions. Je collecte des données sur les volumes, les délais et les erreurs pour voir où se perdent le temps et la qualité. Les problèmes fréquents sont la double saisie, l'attente de validations, des responsabilités floues et des contournements manuels. Je conçois ensuite le processus cible, « to-be », avec les parties prenantes, en supprimant les étapes inutiles, en automatisant les tâches répétitives et en clarifiant les responsabilités, et j'estime les gains attendus. Les changements sont testés à petite échelle avant le déploiement complet, et je m'assure que les personnes sont formées et que la documentation est mise à jour.",
    explanation:
      "L'amélioration des processus combine modélisation visuelle, mesure et implication des personnes qui font le travail.",
    tips: ["Mentionnez les modèles as-is et to-be.", "Utilisez les données pour repérer les goulets d'étranglement.", "Impliquez les acteurs du processus."],
    commonMistakes: ["Concevoir le nouveau processus sans comprendre l'actuel.", "Automatiser un mauvais processus au lieu de le simplifier."],
    followUpQuestions: ["Qu'est-ce qu'un diagramme en couloirs ?", "Comment mesurez-vous le succès d'un changement de processus ?"],
  },
  'job-021': {
    question: "Parlez-moi d'une situation où deux services n'étaient pas d'accord sur les besoins.",
    intent: "Le recruteur évalue vos compétences de facilitation et de résolution de conflits dans un contexte d'analyse métier.",
    expectedAnswer:
      "Situation : lors de la refonte de notre système de commandes, le service commercial voulait que les commandes soient confirmées immédiatement aux clients, tandis que la finance exigeait une vérification de crédit avant toute confirmation. Tâche : en tant qu'analyste métier, je devais définir un processus unique acceptable par les deux services. Action : j'ai cartographié le processus actuel avec les deux équipes et rassemblé des données : 85 % des commandes provenaient de clients ayant un bon historique de crédit. J'ai proposé une confirmation automatique pour les clients dans leur limite de crédit et une vérification manuelle uniquement pour les autres, avec un délai de réponse maximal de quatre heures. J'ai animé un atelier pour examiner la proposition, ajusté la règle de plafond avec la finance et formalisé l'accord avec les deux responsables de service. Résultat : 85 % des commandes ont été confirmées instantanément, le risque de crédit est resté maîtrisé et les deux équipes ont validé les besoins sans escalade.",
    explanation:
      "S'appuyer sur les données pour trouver une solution qui réponde aux préoccupations réelles des deux parties est une compétence clé de l'analyste métier.",
    tips: ["Expliquez les préoccupations de chaque partie.", "Montrez les données qui ont aidé.", "Décrivez comment l'accord a été formalisé."],
    commonMistakes: ["Retenir la solution d'une partie sans analyse.", "Escalader immédiatement auprès de la direction."],
    followUpQuestions: ["Qu'auriez-vous fait si aucun compromis n'avait été possible ?", "Comment documentez-vous les décisions ?"],
  },
  'job-022': {
    question: "Comment utilisez-vous les données pour étayer une recommandation métier ?",
    intent: "Le recruteur vérifie vos compétences analytiques et votre capacité à transformer des données en décisions.",
    expectedAnswer:
      "Je pars de la question métier, par exemple « pourquoi les retours clients ont-ils augmenté ? », et je définis les données qui permettraient d'y répondre. J'extrais et je nettoie les données, souvent avec SQL et un tableur ou un outil de BI, en vérifiant leur qualité et leurs limites. Je les analyse ensuite : tendances dans le temps, segments comme la catégorie de produit ou la région, et comparaison avec une référence, en cherchant des tendances tout en veillant à ne pas confondre corrélation et causalité. Par exemple, je pourrais découvrir que les retours ont surtout augmenté pour les produits d'un fournisseur après un changement d'emballage. Je présente le résultat avec un message clair, quelques graphiques simples, l'impact estimé et une recommandation, en précisant les hypothèses et le niveau de confiance. Lorsque c'est possible, je propose un test pour confirmer la cause.",
    explanation:
      "Une bonne recommandation fondée sur les données part d'une question, respecte la qualité des données, communique clairement et propose une validation.",
    tips: ["Partez de la question métier.", "Mentionnez la qualité et les limites des données.", "Concluez par une recommandation et son impact."],
    commonMistakes: ["Présenter de nombreux graphiques sans conclusion.", "Considérer une corrélation comme une preuve de causalité."],
    followUpQuestions: ["Quelles requêtes SQL écrivez-vous le plus souvent ?", "Comment présentez-vous des données à la direction ?"],
  },
  'job-023': {
    question: "Parlez-moi d'une fois où vous avez découvert tard dans un projet qu'un besoin avait été mal compris.",
    intent: "Le recruteur évalue votre sens des responsabilités, votre capacité à résoudre les problèmes et à améliorer vos méthodes, à un niveau avancé.",
    expectedAnswer:
      "Situation : deux semaines avant la mise en service d'un nouveau module de facturation, la recette utilisateur a montré que les factures regroupaient les livraisons par mois, alors que la comptabilité avait besoin d'une facture par livraison pour certains clients. Tâche : c'est moi qui avais rédigé ce besoin, je devais donc comprendre ce qui s'était passé et trouver rapidement une solution. Action : j'ai relu la documentation et constaté que j'avais généralisé la règle à partir d'entretiens avec l'équipe commerciale, sans la faire valider par la comptabilité. J'ai informé le chef de projet et le sponsor le jour même, avec l'impact et les options possibles. Avec les développeurs, nous avons trouvé qu'une option de paramétrage par client pouvait être ajoutée en une semaine. J'ai validé la règle corrigée avec la comptabilité à l'aide d'exemples concrets avant le développement. Résultat : la mise en service a eu lieu avec une semaine de retard, avec le bon comportement. Depuis, je valide les règles métier avec chaque service concerné à partir d'exemples réels, et je les intègre aux critères d'acceptation.",
    explanation:
      "Assumer l'erreur, communiquer rapidement avec des options et faire évoluer votre façon de valider les besoins : c'est ce que recherchent les recruteurs.",
    tips: ["Expliquez comment le malentendu s'est produit.", "Montrez une communication rapide accompagnée d'options.", "Décrivez le changement de méthode."],
    commonMistakes: ["Reprocher aux parties prenantes des explications peu claires.", "Cacher le problème jusqu'à la mise en service."],
    followUpQuestions: ["Comment validez-vous les besoins aujourd'hui ?", "Comment le sponsor a-t-il réagi ?"],
  },
  'job-024': {
    question: "Un utilisateur indique qu'il ne parvient pas à se connecter à Internet. Comment procédez-vous au diagnostic ?",
    intent: "Le recruteur vérifie que vous avez une démarche de diagnostic méthodique, compétence centrale du support informatique.",
    expectedAnswer:
      "Je commence par poser des questions : est-ce seulement cet utilisateur ou plusieurs personnes, quel appareil, connexion filaire ou Wi-Fi, depuis quand, et quelque chose a-t-il changé. Je vérifie ensuite du plus simple au plus complexe : le Wi-Fi est-il activé ou le câble branché, l'appareil a-t-il une adresse IP avec ipconfig ou équivalent, peut-il joindre la passerelle avec ping, et la résolution de noms fonctionne-t-elle, en comparant un ping vers une adresse IP et vers un nom de domaine. Si seul le DNS échoue, je contrôle les paramètres DNS ; s'il n'y a pas d'adresse IP, je regarde du côté du DHCP ou de la prise réseau. Redémarrer la carte réseau ou l'appareil aide souvent. Si plusieurs utilisateurs sont touchés, je vérifie le commutateur, le point d'accès ou la connexion Internet et j'escalade à l'équipe réseau. Je documente les étapes et la solution dans le ticket.",
    explanation:
      "Une approche par couches, de l'appareil de l'utilisateur jusqu'au réseau, permet de trouver le problème efficacement et d'éviter les corrections au hasard.",
    tips: ["Commencez par des questions pour délimiter le problème.", "Testez étape par étape : lien, IP, passerelle, DNS.", "Documentez la résolution."],
    commonMistakes: ["Tout redémarrer sans comprendre la cause.", "Ne pas vérifier si d'autres utilisateurs sont touchés."],
    followUpQuestions: ["Qu'indique une adresse IP commençant par 169.254 ?", "Quand escaladeriez-vous ?"],
  },
  'job-025': {
    question: "Expliquez le rôle du DNS et du DHCP.",
    intent: "Le recruteur vérifie les connaissances réseau de base nécessaires aux postes de support.",
    expectedAnswer:
      "Le DNS, Domain Name System, traduit les noms utilisés par les personnes, comme www.example.com, en adresses IP que les ordinateurs utilisent pour se connecter. Quand le DNS tombe en panne, les sites semblent inaccessibles alors que le réseau fonctionne, ce qui explique qu'un ping vers une adresse IP puisse encore réussir. Le DHCP, Dynamic Host Configuration Protocol, attribue automatiquement aux appareils leurs paramètres réseau lorsqu'ils se connectent : adresse IP, masque de sous-réseau, passerelle par défaut et serveurs DNS. Sans DHCP, chaque appareil devrait être configuré manuellement. Un appareil qui ne parvient pas à joindre un serveur DHCP peut s'attribuer une adresse dans la plage 169.254, qui ne permet pas un accès normal au réseau.",
    explanation:
      "Le DNS et le DHCP sont à l'origine de nombreux problèmes de connexion courants. Connaître leur rôle aide à diagnostiquer rapidement.",
    tips: ["Utilisez des analogies simples, comme un annuaire pour le DNS.", "Associez chaque service à un symptôme typique."],
    commonMistakes: ["Confondre les rôles du DNS et du DHCP."],
    followUpQuestions: ["Comment videriez-vous le cache DNS d'un ordinateur ?", "Qu'est-ce qu'un bail DHCP ?"],
  },
  'job-026': {
    question: "Parlez-moi d'une fois où vous avez aidé un utilisateur frustré et peu à l'aise avec la technologie.",
    intent: "Le recruteur évalue votre sens du service, votre patience et votre communication avec des personnes non techniques.",
    expectedAnswer:
      "Situation : une comptable a appelé le support, très contrariée, parce qu'elle ne pouvait plus accéder à un dossier partagé une heure avant une échéance. Tâche : je devais résoudre le problème rapidement et l'aider à retrouver son calme. Action : je l'ai écoutée, je l'ai rassurée en lui disant que nous allions trouver une solution et j'ai évité le jargon technique. Je me suis connecté à distance avec son accord et j'ai constaté que son mot de passe avait expiré, ce qui lui avait retiré l'accès aux lecteurs réseau. Je l'ai guidée pas à pas pour changer son mot de passe, en expliquant ce que je faisais, puis j'ai vérifié avec elle qu'elle pouvait ouvrir ses fichiers. Je lui ai aussi montré où voir l'avertissement d'expiration du mot de passe à l'avenir. Résultat : elle a respecté son échéance, a remercié mon manager par e-mail, et j'ai ajouté un court guide sur l'expiration des mots de passe à notre base de connaissances.",
    explanation:
      "L'écoute, un langage clair, la résolution du problème et la prévention de sa récurrence sont les éléments clés d'un bon support.",
    tips: ["Montrez de l'empathie et un langage simple.", "Expliquez comment vous avez évité que le problème se reproduise."],
    commonMistakes: ["Employer du jargon.", "Laisser entendre que l'utilisateur a fait une erreur « bête »."],
    followUpQuestions: ["Comment gérez-vous un utilisateur impoli ?", "Comment rédigez-vous un bon article de base de connaissances ?"],
  },
  'job-027': {
    question: "Comment priorisez-vous les tickets de support ? Expliquez les incidents, les problèmes et les demandes de service.",
    intent: "Le recruteur vérifie vos connaissances en gestion des services de type ITIL et votre façon concrète de prioriser.",
    expectedAnswer:
      "Au sens ITIL, un incident est une interruption non planifiée ou une dégradation d'un service, comme une messagerie qui ne fonctionne plus ; l'objectif est de rétablir le service rapidement. Une demande de service est une demande standard, comme un nouvel ordinateur portable ou l'accès à une application. Un problème est la cause sous-jacente d'un ou de plusieurs incidents, analysée pour éviter qu'ils ne se reproduisent. Je priorise les tickets avec une matrice impact-urgence : l'impact correspond au nombre de personnes touchées ou à la criticité du processus métier, l'urgence au délai dans lequel il faut résoudre. Un système financier en panne pendant la clôture mensuelle a un impact et une urgence élevés ; le problème d'imprimante d'un seul utilisateur est faible. La priorité détermine les délais cibles de prise en charge et de résolution définis dans le SLA. Je tiens les utilisateurs informés, j'escalade lorsque les objectifs sont menacés et je rattache les incidents récurrents à un enregistrement de problème.",
    explanation:
      "Distinguer les types de tickets et utiliser l'impact et l'urgence rend la priorisation objective et alignée sur les besoins métier.",
    tips: ["Définissez clairement les trois types.", "Expliquez la matrice impact-urgence.", "Mentionnez les SLA."],
    commonMistakes: ["Traiter les tickets uniquement par ordre d'arrivée.", "Traiter les incidents récurrents un par un sans chercher la cause."],
    followUpQuestions: ["Qu'est-ce qu'un incident majeur ?", "Comment réduiriez-vous le nombre de tickets récurrents ?"],
  },
  'job-028': {
    question: "Un utilisateur signale un e-mail suspect et reconnaît avoir cliqué sur le lien. Que faites-vous ?",
    intent: "Le recruteur vérifie votre sensibilité à la sécurité et la bonne gestion d'un incident au niveau du support de premier niveau.",
    expectedAnswer:
      "Je commence par remercier l'utilisateur de son signalement, car un signalement rapide est exactement ce que nous attendons, et je reste calme pour qu'il continue à signaler à l'avenir. Je lui demande ce qu'il a fait exactement : a-t-il saisi un mot de passe, téléchargé un fichier ou ouvert une pièce jointe ? S'il a saisi ses identifiants, je réinitialise immédiatement le mot de passe, je révoque les sessions actives et je vérifie que l'authentification multifacteur est activée. Si un fichier a été téléchargé ou ouvert, je déconnecte l'appareil du réseau et je suis la procédure de l'équipe sécurité, qui peut inclure une analyse antivirus ou une réinstallation complète. Je signale l'incident à l'équipe sécurité avec l'e-mail d'hameçonnage (phishing), de préférence en pièce jointe avec ses en-têtes, afin qu'elle puisse bloquer l'expéditeur et les liens et vérifier si d'autres utilisateurs l'ont reçu. Enfin, je documente tout dans le ticket.",
    explanation:
      "Un confinement rapide, la protection des identifiants, des éléments de preuve pour l'équipe sécurité et une attitude non culpabilisante sont l'essentiel.",
    tips: ["Remerciez l'utilisateur et évitez de le culpabiliser.", "Distinguez la saisie d'identifiants de l'exécution d'un fichier.", "Escaladez à l'équipe sécurité avec des preuves."],
    commonMistakes: ["Supprimer l'e-mail avant que l'équipe sécurité ne l'analyse.", "Réprimander l'utilisateur, ce qui décourage les signalements futurs."],
    followUpQuestions: ["Comment reconnaissez-vous un e-mail d'hameçonnage ?", "Pourquoi les en-têtes d'un e-mail sont-ils utiles ?"],
  },
  'job-029': {
    question: "Comment gérez-vous la création et la suppression des comptes lors des arrivées et des départs de collaborateurs ?",
    intent: "Le recruteur vérifie vos pratiques de gestion des accès, essentielles pour la sécurité.",
    expectedAnswer:
      "Pour les arrivées, je travaille à partir d'une demande validée par le manager ou les RH et j'utilise des modèles par rôle, afin que les nouveaux collaborateurs obtiennent exactement les accès nécessaires à leur poste, pas davantage. Les comptes sont créés avant le premier jour, avec un mot de passe temporaire à changer et l'enrôlement à l'authentification multifacteur. Lors d'un changement de poste, les anciens accès sont retirés, et pas seulement complétés par de nouveaux, pour éviter leur accumulation. Pour les départs, la notification des RH déclenche une checklist : désactiver les comptes à l'heure exacte de fin, révoquer les sessions et les jetons, récupérer le matériel, transférer ou archiver les données selon la politique en vigueur, retirer les accès aux systèmes partagés et aux outils tiers, et changer les mots de passe partagés que la personne connaissait. Lorsque c'est possible, tout cela est automatisé via un système de gestion des identités connecté aux données RH. Des revues d'accès régulières avec les managers permettent de détecter les droits oubliés.",
    explanation:
      "Les processus d'arrivées, mobilités et départs, appliqués avec le principe du moindre privilège et un retrait des accès dans les temps, évitent de nombreux incidents de sécurité.",
    tips: ["Couvrez les arrivées, les mobilités et les départs.", "Mentionnez les accès par rôle et les revues d'accès."],
    commonMistakes: ["Laisser des comptes actifs après un départ.", "Copier les accès d'un collègue pour une nouvelle recrue."],
    followUpQuestions: ["Que feriez-vous d'un compte partagé ?", "Comment gérez-vous les licenciements urgents ?"],
  },
  'job-030': {
    question: "Une panne majeure touche des centaines d'utilisateurs. Comment gérez-vous le support pendant l'incident ?",
    intent: "Le recruteur évalue vos compétences avancées de coordination et de communication en situation de crise.",
    expectedAnswer:
      "Je commencerais par confirmer rapidement l'étendue de la panne et déclarer un incident majeur selon notre processus, afin d'impliquer les bonnes équipes et un responsable d'incident. Côté support, je créerais un ticket maître et j'y rattacherais tous les signalements des utilisateurs, pour ne pas traiter des centaines de doublons. Je publierais dès que possible un message d'état, sur le portail de services, par e-mail ou via un message téléphonique automatique, indiquant ce qui est touché, que les équipes y travaillent et quand aura lieu la prochaine mise à jour, puis je le mettrais à jour régulièrement, même sans nouvelle information. Je donnerais à l'équipe support un court script et les solutions de contournement éventuelles, et je collecterais les informations utiles aux équipes techniques, comme les sites concernés ou les messages d'erreur. Les utilisateurs métier critiques, comme une équipe soumise à une échéance réglementaire, bénéficieraient d'un contact prioritaire. Après la résolution, je confirmerais avec les utilisateurs que le service est rétabli, je clôturerais les tickets rattachés avec un message clair et j'apporterais le point de vue du support à la revue post-incident, par exemple sur les délais de communication.",
    explanation:
      "Pendant un incident majeur, le support protège les équipes techniques du bruit, tient les utilisateurs informés et rassemble des informations utiles.",
    tips: ["Mentionnez le ticket maître et les signalements rattachés.", "Décrivez une communication d'état régulière.", "Incluez la revue post-incident."],
    commonMistakes: ["Répondre à chaque appel individuellement sans message commun.", "Ne communiquer qu'une fois le problème résolu."],
    followUpQuestions: ["Que doit contenir un message d'état ?", "Comment priorisez-vous les utilisateurs pendant une panne ?"],
  },
};
