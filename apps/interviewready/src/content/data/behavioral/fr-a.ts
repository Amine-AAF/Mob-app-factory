import type { QuestionText, TextTable } from '@/types/content';

/** Questions comportementales 001-040 : leadership, travail d'équipe, communication, résolution de problèmes, conflits. */
export const frA: TextTable<QuestionText> = {
  'beh-001': {
    question: "Parlez-moi d'une fois où vous avez mené un groupe sans avoir d'autorité hiérarchique.",
    intent: "Le recruteur veut voir si vous savez influencer et coordonner des personnes grâce à votre crédibilité et à votre communication plutôt qu'à la hiérarchie.",
    expectedAnswer:
      "Situation : trois équipes développaient chacune une partie d'un nouveau portail client, et personne ne pilotait le lancement dans son ensemble. Tâche : en tant que développeur dans l'une de ces équipes, j'ai vu que nos briques ne s'assembleraient pas à temps, alors j'ai proposé de coordonner l'intégration. Action : j'ai mis en place une liste partagée des dépendances, animé chaque semaine un point de quinze minutes avec un représentant de chaque équipe et publié ensuite un court compte rendu. Quand deux équipes se sont opposées sur le format d'une API, j'ai organisé une séance où chacune a présenté ses contraintes, et nous avons trouvé un compromis. Résultat : nous avons lancé à la date prévue, et mon manager m'a demandé de coordonner officiellement le projet transverse suivant.",
    explanation:
      "Le leadership sans autorité repose sur l'initiative, la clarté et la confiance. Les meilleures histoires montrent que vous avez comblé un vide, créé une organisation simple et résolu les désaccords en réunissant les personnes plutôt qu'en imposant une décision.",
    tips: ["Expliquez pourquoi vous êtes intervenu.", "Montrez les outils simples que vous avez utilisés pour coordonner.", "Mentionnez comment vous avez géré au moins un désaccord."],
    commonMistakes: ["Vous présenter comme le chef alors que vous ne l'étiez pas.", "Omettre la réaction des autres face à votre initiative."],
    followUpQuestions: ["Qu'avez-vous fait quand quelqu'un ne tenait pas ses engagements ?", "Comment votre propre manager a-t-il réagi ?"],
  },
  'beh-002': {
    question: "Décrivez une situation où vous avez aidé un collègue en difficulté à reprendre pied.",
    intent: "Le recruteur veut savoir si vous remarquez quand les autres sont en difficulté et si vous les soutenez avec empathie et de manière concrète.",
    expectedAnswer:
      "Situation : une nouvelle collègue de notre équipe service client prenait du retard sur ses tickets et semblait en retrait pendant les réunions. Tâche : en tant que personne la plus expérimentée de l'équipe, je voulais l'aider sans qu'elle se sente jugée. Action : je l'ai invitée à prendre un café et je lui ai demandé comment elle se sentait. Elle m'a expliqué qu'elle trouvait nos outils internes déroutants et qu'elle n'osait plus poser de questions. Je lui ai proposé deux courtes sessions de travail en binôme par semaine et j'ai rédigé un guide d'une page sur les outils qui lui posaient le plus de difficultés. Résultat : en un mois, son stock de tickets était revenu à la normale, et elle a ensuite enrichi le guide pour les nouveaux arrivants.",
    explanation:
      "Soutenir les autres commence par comprendre la cause réelle. Poser des questions ouvertes, puis proposer une aide concrète et respectueuse, témoigne d'intelligence émotionnelle et d'un potentiel de leadership.",
    tips: ["Commencez par expliquer comment vous avez repéré le problème.", "Montrez que vous avez écouté avant de proposer une solution."],
    commonMistakes: ["Décrire le collègue de façon négative.", "Faire son travail à sa place au lieu de l'aider à progresser."],
    followUpQuestions: ["Qu'auriez-vous fait si la situation ne s'était pas améliorée ?", "Avez-vous impliqué votre manager ?"],
  },
  'beh-003': {
    question: "Parlez-moi d'une fois où vous avez dû prendre les commandes de manière inattendue.",
    intent: "Le recruteur veut voir si vous savez prendre le relais avec calme quand les circonstances l'exigent.",
    expectedAnswer:
      "Situation : pendant mon stage, ma tutrice est tombée malade le jour d'un atelier important avec un client. Tâche : j'étais la seule autre personne à avoir préparé les supports, je devais donc animer la séance. Action : j'ai appelé le client pour lui expliquer la situation et confirmer qu'il souhaitait maintenir l'atelier, j'ai revu le déroulé pendant vingt minutes avec un collègue et je me suis concentré sur les parties que je maîtrisais le mieux. Pour les questions auxquelles je ne pouvais pas répondre, je les ai notées et j'ai promis une réponse sous deux jours. Résultat : l'atelier s'est bien passé, le client a envoyé un retour positif, et ma tutrice m'a ensuite confié davantage de contacts clients.",
    explanation:
      "Cette question évalue votre sang-froid et votre esprit d'initiative. Être transparent avec les autres, se préparer rapidement et reconnaître honnêtement ses limites sont des signes de maturité, même en début de carrière.",
    tips: ["Expliquez comment vous vous êtes préparé en peu de temps.", "Montrez comment vous avez géré ce que vous ne saviez pas."],
    commonMistakes: ["Prétendre n'avoir eu aucun doute.", "Oublier de décrire le résultat."],
    followUpQuestions: ["Quel a été le moment le plus difficile de cette journée ?", "Feriez-vous quelque chose différemment ?"],
  },
  'beh-004': {
    question: "Décrivez une fois où vous avez délégué une tâche importante. Comment vous êtes-vous assuré de sa réussite ?",
    intent: "Le recruteur évalue votre capacité à faire confiance, à donner des consignes claires et à assurer un suivi sans tomber dans le micromanagement.",
    expectedAnswer:
      "Situation : je pilotais la préparation de notre événement client annuel tout en gérant le lancement d'un produit. Tâche : je ne pouvais pas mener les deux de front, je devais donc déléguer la logistique de l'événement à une collègue junior. Action : je lui ai expliqué l'objectif et le budget, je lui ai transmis la checklist de l'année précédente et nous avons défini les décisions qu'elle pouvait prendre seule et celles qu'elle devait me soumettre. Nous avons prévu deux courts points par semaine. Quand elle a proposé un lieu que je n'aurais pas choisi, je lui ai demandé son raisonnement et je l'ai accepté, car il respectait les critères. Résultat : l'événement s'est déroulé sans accroc avec 20 % de participants en plus que l'année précédente, et elle a organisé seule l'édition suivante.",
    explanation:
      "Bien déléguer, c'est fixer des objectifs clairs, définir le périmètre de décision et assurer un suivi régulier mais léger. Accepter des choix différents des vôtres, tant qu'ils servent l'objectif, est ce qui fait grandir les personnes.",
    tips: ["Expliquez comment vous avez choisi la personne.", "Décrivez comment vous avez équilibré soutien et autonomie."],
    commonMistakes: ["Ne déléguer que les tâches dont personne ne voulait.", "Décrire un contrôle permanent qui ressemble à du micromanagement."],
    followUpQuestions: ["Que faites-vous quand une tâche déléguée tourne mal ?", "Qu'est-ce qui vous est difficile à déléguer ?"],
  },
  'beh-005': {
    question: "Parlez-moi d'une fois où vous avez dû prendre une décision impopulaire en tant que manager.",
    intent: "Le recruteur veut voir si vous savez trancher dans des situations difficiles, expliquer vos choix et conserver la confiance de l'équipe.",
    expectedAnswer:
      "Situation : en tant que lead d'équipe, j'avais promis à mon équipe deux semaines dédiées au nettoyage de notre code le plus ancien après un long cycle de livraison. Tâche : une semaine avant le début, un client majeur a signalé des problèmes de performance qui menaçaient le renouvellement de son contrat, et je devais décider si je maintenais le plan. Action : j'ai analysé les données avec le product manager et conclu que le problème du client devait passer en premier. Je l'ai annoncé à l'équipe en personne, j'ai expliqué les raisons et le risque pour l'entreprise, et j'ai reconnu que je revenais sur une promesse. J'ai ensuite obtenu une date ferme pour le nettoyage au trimestre suivant et je l'ai protégée dans la feuille de route. Résultat : nous avons corrigé le problème de performance en huit jours et conservé le client. L'équipe était déçue, mais la confiance a tenu, car le nettoyage a bien eu lieu à la nouvelle date, et deux personnes m'ont dit avoir apprécié ma transparence.",
    explanation:
      "À un niveau avancé, le leadership consiste aussi à décevoir les gens pour de bonnes raisons. L'essentiel est d'être transparent sur l'arbitrage, de reconnaître le coût pour l'équipe et de tenir ensuite ce que vous promettez.",
    tips: ["Expliquez les données qui ont fondé la décision.", "Montrez comment vous l'avez communiquée et comment vous avez géré les émotions.", "Prouvez que vous avez tenu vos engagements ensuite."],
    commonMistakes: ["Présenter la décision comme facile.", "Ignorer l'impact sur l'équipe.", "Rejeter la faute sur la direction pour éviter d'assumer."],
    followUpQuestions: ["Comment avez-vous su que la confiance était préservée ?", "Qu'auriez-vous fait si l'équipe s'y était fortement opposée ?"],
  },
  'beh-006': {
    question: "Parlez-moi d'une fois où vous avez accompagné ou coaché quelqu'un.",
    intent: "Le recruteur veut voir comment vous aidez les autres à progresser et si vous adaptez votre approche à la personne.",
    expectedAnswer:
      "Situation : un jeune diplômé a rejoint notre équipe finance et devait produire des reportings mensuels, mais il n'avait jamais travaillé sur de gros tableurs. Tâche : ma manager m'a demandé de l'aider à devenir autonome en trois mois. Action : au lieu de lui donner les réponses, je lui demandais d'abord d'essayer chaque reporting seul, puis nous le relisions ensemble et je lui expliquais pourquoi certaines formules étaient risquées. Nous nous retrouvions trente minutes deux fois par semaine, et j'ai réduit progressivement mon implication à mesure qu'il progressait. Je l'ai aussi encouragé à présenter lui-même un reporting à l'équipe. Résultat : dès le troisième mois, il produisait les reportings seul avec très peu de corrections, et il forme aujourd'hui les nouveaux arrivants sur ce même processus.",
    explanation:
      "Un accompagnement efficace développe l'autonomie. Laisser la personne essayer d'abord, expliquer plutôt que donner la réponse et réduire le soutien au fil du temps témoigne d'une approche de coaching réfléchie.",
    tips: ["Montrez comment vous avez adapté votre soutien au fil des progrès de la personne.", "Mesurez la réussite à son autonomie."],
    commonMistakes: ["Décrire l'accompagnement comme le fait de travailler à sa place.", "Ne donner aucune preuve des progrès de la personne."],
    followUpQuestions: ["Comment accompagnez-vous quelqu'un qui ne demande pas d'aide ?", "Qu'avez-vous appris en accompagnant cette personne ?"],
  },
  'beh-007': {
    question: "Parlez-moi d'une fois où vous avez fixé le cap d'un projet ou d'une équipe.",
    intent: "Le recruteur veut voir si vous savez transformer une situation floue en un objectif clair et partagé qui guide les décisions.",
    expectedAnswer:
      "Situation : notre équipe analytics recevait des demandes de tous les services et traitait en priorité celles qui faisaient le plus de bruit, si bien que personne ne voyait la valeur de notre travail. Tâche : en prenant la tête de l'équipe, je voulais lui donner une direction claire, soutenue par le métier. Action : j'ai interrogé les responsables de cinq services sur leurs décisions les plus importantes de l'année, puis j'ai proposé un recentrage : trois tableaux de bord clés liés au chiffre d'affaires et à la fidélisation client, toutes les autres demandes passant par un tri hebdomadaire léger. J'ai présenté le plan à la direction avec l'impact attendu et obtenu son accord, puis je l'ai partagé avec l'équipe pour que chacun comprenne pourquoi nous dirions non plus souvent. Résultat : en six mois, le tableau de bord de fidélisation était utilisé dans chaque revue mensuelle de la direction, le volume de demandes est devenu gérable et le score de satisfaction de l'équipe a nettement progressé dans l'enquête annuelle.",
    explanation:
      "Fixer un cap, c'est choisir ce qu'on ne fera pas et obtenir l'adhésion. Les bonnes réponses montrent une écoute des parties prenantes, une priorité claire liée à la valeur métier et une communication qui permet à l'équipe de décider par elle-même.",
    tips: ["Montrez comment vous avez recueilli des avis avant de décider.", "Expliquez comment ce cap a changé les décisions du quotidien.", "Incluez un résultat pour l'entreprise et un résultat pour l'équipe."],
    commonMistakes: ["Décrire une vision sans expliquer comment elle a été adoptée.", "Ignorer les personnes dont les demandes ont perdu en priorité."],
    followUpQuestions: ["Comment avez-vous géré les services dont les demandes ont été dépriorisées ?", "Comment avez-vous mesuré la réussite ?"],
  },
  'beh-008': {
    question: "Parlez-moi d'une fois où vous avez mené un changement qui rencontrait des résistances.",
    intent: "Le recruteur évalue votre conduite du changement : comprendre les résistances, impliquer les personnes et ancrer durablement le changement.",
    expectedAnswer:
      "Situation : notre équipe support utilisait l'e-mail pour tout, et l'on m'a demandé de mettre en place un outil de ticketing. Tâche : la plupart des agents y voyaient une contrainte bureaucratique supplémentaire, et certains refusaient ouvertement de l'utiliser. Action : plutôt que d'insister davantage, j'ai rencontré les agents les plus sceptiques pour comprendre leurs craintes. Ils redoutaient que l'outil serve à les surveiller et qu'il les ralentisse. J'en ai associé deux au paramétrage de l'outil, j'ai supprimé les champs sans valeur ajoutée et j'ai obtenu de la direction que les indicateurs individuels ne servent pas à l'évaluation pendant les six premiers mois. Nous avons mené un pilote de deux semaines avec des volontaires, puis partagé les résultats : moins de demandes perdues et des réponses plus rapides. Résultat : toute l'équipe a adopté l'outil en deux mois, le temps de réponse moyen a baissé de 35 % et l'un des premiers sceptiques est devenu notre formateur interne.",
    explanation:
      "La résistance cache généralement des inquiétudes légitimes. Écouter les sceptiques, les associer à la conception, répondre explicitement à leurs craintes et prouver la valeur par un pilote sont les techniques clés de la conduite du changement.",
    tips: ["Décrivez les raisons de la résistance.", "Montrez comment vous avez impliqué les personnes concernées.", "Prouvez l'adoption avec des chiffres."],
    commonMistakes: ["Présenter les personnes réticentes comme le problème.", "Imposer le changement et parler de réussite."],
    followUpQuestions: ["Qu'auriez-vous fait si le pilote avait échoué ?", "Comment gérez-vous quelqu'un qui refuse encore ?"],
  },
  'beh-009': {
    question: "Décrivez un projet d'équipe réussi et le rôle que vous y avez joué.",
    intent: "Le recruteur veut comprendre comment vous contribuez au travail collectif et si vous savez décrire votre rôle avec précision.",
    expectedAnswer:
      "Situation : en dernière année d'université, nous étions cinq à devoir développer en dix semaines une application mobile pour une association locale. Tâche : j'étais responsable de la base de données et de la coordination de notre planning hebdomadaire. Action : j'ai conçu le modèle de données, mis en place un tableau de tâches partagé et organisé chaque lundi une courte réunion pour fixer les objectifs de la semaine. Quand notre designer a pris du retard, je l'ai aidé en préparant des maquettes d'écrans simples pour que les développeurs puissent commencer. Résultat : nous avons livré une application fonctionnelle que l'association utilise encore pour gérer ses bénévoles, et notre projet a obtenu la meilleure note de la promotion.",
    explanation:
      "Les recruteurs veulent entendre à la fois le résultat collectif et votre contribution personnelle. Nommer vos responsabilités et un moment où vous êtes allé au-delà donne une image complète.",
    tips: ["Précisez votre rôle dès le début.", "Mentionnez un moment où vous avez aidé l'équipe au-delà de votre propre tâche."],
    commonMistakes: ["Dire « nous » pour tout, au point que votre rôle disparaît.", "Vous attribuer le mérite de tout le projet."],
    followUpQuestions: ["Quelle a été la partie la plus difficile du travail en commun ?", "Que changeriez-vous dans l'organisation de l'équipe ?"],
  },
  'beh-010': {
    question: "Parlez-moi d'une fois où vous avez aidé un collègue alors que cela ne relevait pas de vos responsabilités.",
    intent: "Le recruteur recherche l'esprit de collaboration et le sens de la réussite collective, au-delà de votre fiche de poste.",
    expectedAnswer:
      "Situation : une collègue de la comptabilité devait remettre un important état de notes de frais avant la date limite d'un audit, mais l'export depuis notre système échouait sans cesse. Tâche : ce n'était pas mon domaine, mais j'avais déjà utilisé cet export et j'avais un après-midi plus calme. Action : je lui ai proposé mon aide, j'ai découvert que quelques saisies contenaient des caractères spéciaux qui corrompaient le fichier et je lui ai montré comment les nettoyer. Nous avons documenté la solution ensemble pour le reste de l'équipe. Résultat : elle a remis l'état à temps, et la documentation a fait gagner plusieurs heures à l'équipe le trimestre suivant.",
    explanation:
      "Cette réponse montre de l'initiative et un esprit d'équipe. Les meilleures réponses montrent aussi du discernement : vous avez aidé quand vous en aviez la capacité, et vous avez partagé la solution pour que le problème ne se reproduise pas.",
    tips: ["Expliquez pourquoi vous pouviez aider sans pénaliser votre propre travail.", "Montrez un bénéfice durable, comme une documentation."],
    commonMistakes: ["Laisser entendre que vous avez négligé votre propre travail.", "Faire passer le collègue pour incompétent."],
    followUpQuestions: ["Comment décidez-vous quand aider les autres ?", "Et si aider signifiait manquer votre propre échéance ?"],
  },
  'beh-011': {
    question: "Décrivez une fois où votre équipe n'a pas atteint un objectif. Qu'avez-vous fait ?",
    intent: "Le recruteur veut voir comment vous réagissez face à un échec collectif : recherche de coupables, repli ou apprentissage.",
    expectedAnswer:
      "Situation : notre équipe marketing visait 1 000 leads qualifiés en un trimestre pour un nouveau produit, et nous n'en avons obtenu que 600. Tâche : en tant que responsable de l'analyse de la campagne, je devais comprendre ce qui n'avait pas fonctionné et aider l'équipe à s'améliorer. Action : j'ai proposé un court bilan sans recherche de coupables. Nous avons constaté que notre message ciblait les mauvais intitulés de poste et que nous avions lancé les publicités payantes avant d'avoir testé la page d'atterrissage. J'ai suggéré deux changements : tester d'abord la page d'atterrissage avec un petit budget et valider notre cible avec l'équipe commerciale. Résultat : le trimestre suivant, nous avons atteint 1 150 leads avec le même budget, et le test avant lancement est devenu une étape standard.",
    explanation:
      "Les recruteurs veulent voir une responsabilité assumée à l'échelle de l'équipe : analyser honnêtement les causes, éviter de chercher des coupables et transformer les enseignements en changements de processus qui améliorent les résultats.",
    tips: ["Soyez factuel sur l'écart.", "Concentrez-vous sur les causes et les changements de processus, pas sur les personnes.", "Montrez le résultat des changements."],
    commonMistakes: ["Rejeter la faute sur une autre équipe ou un collègue.", "Choisir un échec qui n'en était pas vraiment un."],
    followUpQuestions: ["Quelle était votre part personnelle dans cet échec ?", "Comment avez-vous maintenu la motivation de l'équipe ?"],
  },
  'beh-012': {
    question: "Parlez-moi d'une fois où vous avez travaillé avec des personnes d'un autre service ou d'un autre horizon.",
    intent: "Le recruteur vérifie si vous savez collaborer au-delà des différences de métier, de vocabulaire et de priorités.",
    expectedAnswer:
      "Situation : j'étais data analyst sur un projet avec l'équipe juridique visant à classer des milliers de contrats. Tâche : je devais créer un outil pour les aider, mais nous n'avions pas du tout le même vocabulaire et ils trouvaient mon premier prototype confus. Action : j'ai passé une demi-journée aux côtés de deux juristes pour observer comment ils examinaient réellement les contrats. J'ai appris leurs termes clés, reconstruit l'interface autour de leurs étapes de relecture et mis en place un point de retour hebdomadaire de trente minutes. Résultat : l'outil a réduit le temps de classement d'un contrat d'environ vingt minutes à sept, et l'équipe juridique m'implique désormais dès le début de ses projets.",
    explanation:
      "Le travail transverse exige de comprendre les objectifs et le langage de l'autre équipe. Observer son travail et ajuster votre approche témoigne d'empathie et rend la collaboration efficace.",
    tips: ["Expliquez la différence de point de vue ou de vocabulaire.", "Montrez ce que vous avez fait pour comprendre l'autre partie."],
    commonMistakes: ["Présenter l'autre service comme difficile.", "Ne décrire que votre travail technique."],
    followUpQuestions: ["Qu'est-ce que cette équipe vous a appris ?", "Comment gérez-vous des priorités contradictoires entre services ?"],
  },
  'beh-013': {
    question: "Parlez-moi d'une fois où vous dépendiez d'autres personnes pour mener à bien votre travail.",
    intent: "Le recruteur veut voir comment vous gérez les dépendances : communication, anticipation et réaction lorsque les autres sont en retard.",
    expectedAnswer:
      "Situation : je préparais une proposition tarifaire pour un grand client et j'avais besoin des données de coûts de l'équipe achats. Tâche : la proposition devait être remise sous dix jours et l'équipe achats était très sollicitée. Action : dès le premier jour, j'ai expliqué précisément de quelles données j'avais besoin, pourquoi et pour quand, et j'ai demandé si une première version partielle les aiderait. J'ai programmé un rappel pour faire le point au bout de trois jours et j'ai préparé le reste de la proposition à partir d'estimations clairement signalées. Quand les données sont arrivées avec deux jours de retard, je n'ai eu qu'à remplacer les estimations. Résultat : nous avons envoyé la proposition à temps et remporté le contrat. L'équipe achats m'a ensuite dit que la clarté de ma demande l'avait aidée à la prioriser.",
    explanation:
      "Gérer les dépendances, c'est formuler des demandes claires, relancer tôt et prévoir un plan de secours. Montrer que vous avez facilité la tâche à ceux qui devaient vous aider révèle de solides compétences de collaboration.",
    tips: ["Expliquez comment vous avez rendu votre demande claire.", "Montrez votre plan de secours."],
    commonMistakes: ["Vous plaindre de l'autre équipe.", "Attendre passivement jusqu'au dernier moment."],
    followUpQuestions: ["Qu'auriez-vous fait si les données n'étaient jamais arrivées ?", "Comment relancez-vous sans être insistant ?"],
  },
  'beh-014': {
    question: "Parlez-moi d'une fois où vous avez fait passer la réussite de l'équipe avant votre propre reconnaissance.",
    intent: "Le recruteur cherche de l'humilité et un esprit d'équipe : savoir si le résultat compte plus pour vous que le mérite.",
    expectedAnswer:
      "Situation : j'avais conçu un nouveau processus d'intégration que notre équipe devait présenter à la direction. Tâche : la présentation était une occasion de me faire remarquer, mais une collègue arrivée récemment avait réalisé l'essentiel des tests avec de vrais clients. Action : je lui ai proposé de présenter elle-même la partie consacrée aux résultats, je l'ai préparée avec elle et je me suis assuré que son nom figurait sur les slides. Pendant la réunion, j'ai souligné sa contribution lorsque les dirigeants ont posé des questions. Résultat : le processus a été validé, elle a été invitée à piloter son déploiement dans une autre région, et notre manager a cité cette culture du partage du mérite dans son retour à toute l'équipe.",
    explanation:
      "Les recruteurs apprécient les personnes qui font réussir les autres. Montrer que vous avez partagé la visibilité de façon délibérée, tout en obtenant un bon résultat, démontre de la maturité et du leadership.",
    tips: ["Expliquez à quoi vous avez renoncé et pourquoi.", "Montrez le bénéfice pour l'équipe et pour la personne."],
    commonMistakes: ["Paraître amer de ne pas avoir été reconnu.", "Exagérer votre propre sacrifice."],
    followUpQuestions: ["Comment vous assurez-vous que votre propre travail reste visible ?", "Quelqu'un a-t-il déjà fait la même chose pour vous ?"],
  },
  'beh-015': {
    question: "Parlez-moi d'une fois où vous avez dû vous intégrer rapidement dans une nouvelle équipe.",
    intent: "Le recruteur veut savoir à quelle vitesse et avec quelle aisance vous devenez opérationnel dans un nouvel environnement.",
    expectedAnswer:
      "Situation : j'ai rejoint une entreprise de logistique en pleine haute saison. Tâche : je devais devenir utile rapidement sans ralentir l'équipe avec trop de questions. Action : dès la première semaine, j'ai demandé à mon manager qui étaient les personnes clés et j'ai réservé quinze minutes avec chacune d'elles. Je tenais une liste de questions que je posais par lots, je lisais la documentation de l'équipe le soir et je me portais volontaire pour de petites tâches afin d'apprendre les outils. J'ai aussi proposé de mettre à jour la documentation là où elle était obsolète. Résultat : dès la troisième semaine, je gérais les livraisons de manière autonome, et mon guide mis à jour a été intégré au parcours d'accueil des nouveaux arrivants.",
    explanation:
      "L'intégration repose sur les relations et l'apprentissage. Rencontrer les personnes clés, poser ses questions efficacement et contribuer tôt par de petites tâches montrent que vous êtes proactif et respectueux du temps des autres.",
    tips: ["Décrivez votre méthode pour les premières semaines.", "Montrez une contribution rapide."],
    commonMistakes: ["Dire que vous avez attendu d'être formé.", "Vouloir tout changer dès la première semaine."],
    followUpQuestions: ["Qu'est-ce qui a été le plus difficile en rejoignant cette équipe ?", "Comment aborderiez-vous votre première semaine chez nous ?"],
  },
  'beh-016': {
    question: "Parlez-moi d'une fois où vous avez travaillé efficacement dans une équipe répartie sur plusieurs sites ou fuseaux horaires.",
    intent: "Le recruteur veut voir si vous savez collaborer de manière asynchrone et prévenir les malentendus que crée la distance.",
    expectedAnswer:
      "Situation : je travaillais dans une équipe produit répartie entre l'Europe et l'Asie, avec seulement deux heures de chevauchement par jour. Tâche : les décisions étaient souvent retardées d'une journée entière, car les questions arrivaient quand l'autre côté était déconnecté. Action : j'ai proposé quelques pratiques. Chacun publiait en fin de journée un court point écrit, avec les blocages clairement signalés. Nous réservions les heures communes aux décisions, et non aux points d'avancement, et nous enregistrions de courtes vidéos pour expliquer les conceptions complexes. J'ai aussi fait tourner l'horaire de la réunion une fois par mois pour que ce ne soient pas toujours les mêmes personnes qui se connectent tard. Résultat : le délai moyen de résolution d'un blocage est passé d'environ deux jours à moins d'un, et nos objectifs de sprint sont devenus plus prévisibles au trimestre suivant.",
    explanation:
      "Les équipes distribuées reposent sur une bonne communication écrite, un usage réfléchi du temps synchrone et un traitement équitable de chacun. Les réponses avancées présentent des pratiques concrètes et leur effet mesurable sur la livraison.",
    tips: ["Nommez les pratiques précises que vous avez introduites ou suivies.", "Montrez votre attention à l'équité entre les sites.", "Donnez un effet mesurable."],
    commonMistakes: ["Ne décrire que des outils, pas des pratiques.", "Ignorer l'équité culturelle ou liée aux fuseaux horaires."],
    followUpQuestions: ["Comment instaurez-vous la confiance avec des collègues que vous ne rencontrez jamais en personne ?", "Qu'est-ce qui fonctionne mal en asynchrone ?"],
  },
  'beh-017': {
    question: "Parlez-moi d'une fois où vous avez expliqué quelque chose de complexe à une personne qui n'avait pas votre expertise.",
    intent: "Le recruteur teste votre capacité à adapter votre langage à votre interlocuteur et à vérifier qu'il a bien compris.",
    expectedAnswer:
      "Situation : notre directrice commerciale m'a demandé pourquoi une nouvelle fonctionnalité demanderait six semaines alors qu'elle paraissait simple vue de l'extérieur. Tâche : je devais expliquer le travail technique sans jargon pour qu'elle puisse gérer les attentes d'un client. Action : j'ai comparé la fonctionnalité à l'ajout d'une pièce dans une maison : la pièce elle-même se construit vite, mais la plomberie et l'électricité doivent être raccordées au bâtiment existant. J'ai ensuite listé en termes simples les trois parties cachées du travail et je lui ai demandé de me les reformuler pour m'assurer que c'était clair. Résultat : elle a expliqué le calendrier au client avec assurance, le client l'a accepté, et elle me fait désormais participer tôt à ce type d'échanges.",
    explanation:
      "Simplifier, c'est choisir la bonne comparaison, supprimer le jargon et vérifier la compréhension. Demander à la personne de reformuler montre clairement que vous tenez à une compréhension réelle.",
    tips: ["Utilisez une analogie adaptée à la personne.", "Expliquez comment vous avez vérifié qu'elle avait compris."],
    commonMistakes: ["Utiliser malgré tout des termes techniques.", "Adopter un ton condescendant."],
    followUpQuestions: ["Que faites-vous quand votre analogie ne fonctionne pas ?", "Comment expliquez-vous l'incertitude d'une estimation ?"],
  },
  'beh-018': {
    question: "Parlez-moi d'une fois où vous avez dû annoncer une mauvaise nouvelle.",
    intent: "Le recruteur veut voir à quel point vous êtes honnête, réactif et constructif quand le message est désagréable.",
    expectedAnswer:
      "Situation : deux semaines avant un lancement prévu, nos tests ont révélé des erreurs de données graves sur une fonctionnalité clé. Tâche : en tant que coordinateur du projet, je devais annoncer au client que nous allions manquer la date de lancement. Action : j'ai demandé un appel le jour même au lieu d'attendre la réunion hebdomadaire. J'ai expliqué le problème simplement, j'ai assumé la responsabilité de ne pas l'avoir détecté plus tôt et j'ai présenté deux options : lancer à temps sans la fonctionnalité ou décaler de dix jours avec tout en état de marche. J'ai ensuite confirmé les détails par écrit. Résultat : le client a choisi le report, a apprécié d'être prévenu tôt et a renouvelé son contrat plus tard dans l'année.",
    explanation:
      "Une mauvaise nouvelle s'annonce de préférence tôt, directement et avec des options. Assumer sa responsabilité et proposer des solutions préserve la confiance, même quand le message déçoit.",
    tips: ["Montrez que vous n'avez pas retardé l'annonce.", "Apportez des options, pas seulement le problème.", "Faites un suivi par écrit."],
    commonMistakes: ["Adoucir le message au point qu'il devienne flou.", "Accuser d'autres personnes devant le client."],
    followUpQuestions: ["Comment le client a-t-il réagi sur le moment ?", "Qu'est-ce qui a changé dans votre processus ensuite ?"],
  },
  'beh-019': {
    question: "Parlez-moi d'une fois où un malentendu a causé un problème. Comment l'avez-vous résolu ?",
    intent: "Le recruteur vérifie si vous assumez vos erreurs de communication et si vous améliorez vos habitudes.",
    expectedAnswer:
      "Situation : j'ai demandé à notre designer de préparer « la nouvelle bannière » d'une campagne, et elle a réalisé une bannière pour le site web alors que j'en avais besoin d'une pour les réseaux sociaux. Tâche : nous avions perdu deux jours et la campagne démarrait trois jours plus tard. Action : j'ai reconnu que ma demande avait été vague, et nous avons défini le format ensemble lors d'un court appel. Elle a adapté le visuel et je me suis chargé des déclinaisons de texte pour gagner du temps. Ensuite, j'ai créé un modèle de demande simple précisant le format, la taille, l'échéance et l'objectif. Résultat : la campagne a été lancée à temps, et le modèle est désormais utilisé par toute l'équipe marketing, ce qui a réduit les allers-retours sur les demandes de design.",
    explanation:
      "Assumer votre part dans un malentendu et corriger le processus qui l'a provoqué montre votre sens des responsabilités et votre goût de l'amélioration continue, deux qualités que les recruteurs apprécient.",
    tips: ["Assumez votre part de responsabilité.", "Décrivez le changement de processus qui évite que cela se reproduise."],
    commonMistakes: ["Rejeter toute la faute sur l'autre personne.", "Arrêter l'histoire à la solution de dépannage."],
    followUpQuestions: ["Comment vous assurez-vous aujourd'hui que vos consignes sont comprises ?", "Que faites-vous quand c'est quelqu'un d'autre qui manque de clarté ?"],
  },
  'beh-020': {
    question: "Parlez-moi d'une fois où vous avez convaincu quelqu'un de changer d'avis.",
    intent: "Le recruteur veut voir comment vous influencez les autres : par des faits et de l'empathie, ou par la pression.",
    expectedAnswer:
      "Situation : mon manager voulait lancer une enquête client de quarante questions. Tâche : j'étais convaincu que le taux de réponse serait très faible et je voulais le persuader de la raccourcir. Action : plutôt que de simplement exprimer mon désaccord, j'ai rassemblé les données de nos deux enquêtes précédentes, qui montraient que le taux de complétion chutait fortement après dix questions. J'ai aussi compris sa préoccupation : il devait obtenir des réponses pour trois services différents. J'ai proposé une enquête principale de dix questions, complétée par de courtes enquêtes de suivi pour chaque service. Résultat : il a accepté, le taux de réponse a atteint 38 % contre 12 % l'année précédente, et chaque service a tout de même obtenu les données dont il avait besoin.",
    explanation:
      "Une persuasion efficace associe des faits à la compréhension de l'objectif de l'autre. Proposer une alternative qui répond à son besoin lui permet de changer d'avis facilement.",
    tips: ["Comprenez l'objectif de l'autre avant d'argumenter.", "Appuyez-vous sur des données ou des exemples.", "Proposez une alternative, pas seulement une objection."],
    commonMistakes: ["Gagner le débat mais abîmer la relation.", "Ne vous appuyer que sur votre opinion."],
    followUpQuestions: ["Et s'il était resté en désaccord ?", "Parlez-moi d'une fois où vous n'avez pas réussi à convaincre quelqu'un."],
  },
  'beh-021': {
    question: "Parlez-moi d'une fois où vous avez fait une présentation devant la direction.",
    intent: "Le recruteur évalue votre communication avec les dirigeants : être concis, se concentrer sur les décisions et gérer les questions difficiles.",
    expectedAnswer:
      "Situation : on m'a demandé de présenter au comité de direction la proposition de mon équipe visant à remplacer une base de données clients vieillissante, avec quinze minutes à l'ordre du jour. Tâche : je devais obtenir une décision sur un budget important de la part de personnes disposant de très peu de temps et ayant des priorités différentes. Action : j'ai préparé un message principal : le système actuel crée un risque de panne en haute saison et bloque deux initiatives génératrices de revenus. J'ai commencé par la décision attendue, puis j'ai présenté le coût, les risques de l'inaction et le calendrier, en gardant les détails en annexe. J'ai rencontré la directrice financière en amont pour comprendre ses préoccupations, afin que les chiffres correspondent à ses attentes. Quand le directeur général a remis en question le calendrier, j'ai expliqué quelle partie était certaine et laquelle dépendait d'un fournisseur. Résultat : le comité a validé le budget en séance, et la directrice financière m'a demandé d'utiliser le même format pour les points d'étape suivants.",
    explanation:
      "Les dirigeants veulent la conclusion d'abord, des arbitrages clairs et de l'honnêteté sur l'incertitude. Préparer les parties prenantes clés avant la réunion évite les surprises et témoigne d'une communication de haut niveau.",
    tips: ["Commencez par la décision dont vous avez besoin.", "Rencontrez les parties prenantes clés en amont.", "Distinguez ce qui est certain de ce qui ne l'est pas."],
    commonMistakes: ["Raconter l'histoire dans l'ordre chronologique avant d'en venir à l'essentiel.", "Cacher l'incertitude pour paraître sûr de vous."],
    followUpQuestions: ["Quelle a été la question la plus difficile qu'on vous a posée ?", "Comment préparez-vous une présentation qui risque d'être écourtée ?"],
  },
  'beh-022': {
    question: "Parlez-moi d'un écrit professionnel important que vous avez rédigé.",
    intent: "Le recruteur veut voir si vous savez écrire clairement et adapter vos documents à leur objectif et à leurs lecteurs.",
    expectedAnswer:
      "Situation : après un incident de données qui avait touché plusieurs centaines de clients, ma manager m'a demandé de rédiger le rapport interne et le message aux clients. Tâche : les deux documents devaient être exacts, clairs et publiés sous vingt-quatre heures. Action : pour le rapport interne, j'ai utilisé une structure simple : ce qui s'est passé, l'impact, la cause, les mesures prises et les prochaines étapes, avec une chronologie. Pour les clients, j'ai rédigé un message court, en langage simple, expliquant ce qui s'était passé, ce que cela signifiait pour eux et ce que nous faisions, sans jargon technique. J'ai demandé à un collègue du support de le lire comme le ferait un client, puis j'ai reformulé deux phrases confuses. Résultat : les deux documents ont été validés avec des modifications mineures, le support a reçu très peu de questions complémentaires et la structure du rapport est devenue notre modèle standard pour les incidents.",
    explanation:
      "Un bon écrit dépend de son objectif et de son public. Une structure claire, un langage simple et un lecteur test sont des techniques concrètes que les recruteurs reconnaissent comme professionnelles.",
    tips: ["Expliquez comment vous avez adapté l'écrit à chaque public.", "Mentionnez comment vous avez vérifié la clarté."],
    commonMistakes: ["Choisir un e-mail banal comme exemple.", "Parler de l'incident plutôt que de l'écrit."],
    followUpQuestions: ["Combien de temps la rédaction vous a-t-elle pris ?", "Selon vous, qu'est-ce qui rend un document facile à lire ?"],
  },
  'beh-023': {
    question: "Parlez-moi d'une fois où une écoute attentive vous a aidé à résoudre un problème.",
    intent: "Le recruteur vérifie si vous écoutez pour comprendre, et pas seulement pour répondre, notamment avec des clients ou des utilisateurs.",
    expectedAnswer:
      "Situation : un client appelait notre helpdesk pour la troisième fois à propos de la lenteur des factures dans notre logiciel. Tâche : les agents précédents avaient redémarré sa session à chaque fois, et il était exaspéré. Action : au lieu d'appliquer la solution habituelle, je lui ai demandé de décrire précisément ce qu'il faisait avant l'apparition de la lenteur. Pendant qu'il parlait, j'ai remarqué qu'il exportait toujours ses factures vers un dossier réseau partagé. J'ai reproduit les mêmes étapes et découvert que c'était l'export qui était lent, et non le logiciel. Résultat : je l'ai aidé à changer l'emplacement d'export, le problème a disparu et j'ai partagé ma découverte avec l'équipe, ce qui a permis de résoudre des tickets similaires pour d'autres clients.",
    explanation:
      "L'écoute active consiste à poser des questions ouvertes et à prêter attention aux détails que d'autres ont manqués. Cette réponse montre que l'écoute peut être un véritable outil de résolution de problèmes, et pas seulement une compétence relationnelle.",
    tips: ["Montrez les questions précises que vous avez posées.", "Mettez en avant le détail que vous avez repéré grâce à l'écoute."],
    commonMistakes: ["Décrire l'écoute en termes généraux.", "Oublier le résultat pour le client."],
    followUpQuestions: ["Comment restez-vous patient avec des personnes exaspérées ?", "Comment montrez-vous à quelqu'un que vous l'écoutez ?"],
  },
  'beh-024': {
    question: "Parlez-moi d'une fois où vous avez dû dire non à une partie prenante importante.",
    intent: "Le recruteur veut voir si vous savez protéger les priorités et la qualité tout en préservant de bonnes relations.",
    expectedAnswer:
      "Situation : deux semaines avant la fin du trimestre, le directeur commercial a demandé à mon équipe d'ajouter un rapport sur mesure pour un prospect, en assurant que cela aiderait à conclure une grosse affaire. Tâche : nous étions engagés sur une échéance de conformité, et ajouter ce rapport l'aurait mise en péril. Action : je l'ai rencontré le jour même pour comprendre ce dont le prospect avait réellement besoin. Il s'est avéré qu'il voulait la preuve que certaines données pouvaient être exportées, et non un rapport complet. J'ai expliqué notre contrainte et le coût d'un retard sur la conformité, puis j'ai proposé une alternative : un exemple d'export d'une page que nous pouvions produire en une journée, et le rapport complet planifié pour le mois suivant. J'ai confirmé l'accord par écrit en mettant nos managers en copie. Résultat : nous avons respecté l'échéance de conformité, le prospect a signé grâce à l'exemple d'export, et le directeur commercial nous associe désormais plus tôt à ses affaires.",
    explanation:
      "Bien dire non, c'est comprendre le besoin réel, expliquer ouvertement l'arbitrage et proposer une alternative. À un niveau avancé, vous protégez vos engagements sans abîmer des relations importantes.",
    tips: ["Identifiez le besoin derrière la demande.", "Expliquez l'arbitrage en termes business.", "Proposez une alternative et confirmez-la par écrit."],
    commonMistakes: ["Dire oui et manquer l'autre engagement.", "Refuser sans rien proposer."],
    followUpQuestions: ["Et s'il en avait référé à votre manager ?", "Comment décidez-vous quand accepter une demande urgente ?"],
  },
  'beh-025': {
    question: "Décrivez un problème difficile que vous avez résolu.",
    intent: "Le recruteur veut voir votre démarche de résolution de problèmes : comment vous analysez, testez et vérifiez une solution.",
    expectedAnswer:
      "Situation : dans mon emploi à temps partiel pour une boutique en ligne, des clients recevaient parfois un produit dans la mauvaise taille. Tâche : mon manager m'a demandé d'en trouver la raison. Action : j'ai rassemblé les trente dernières commandes erronées et je les ai comparées. Toutes avaient été modifiées par le client après le paiement. J'ai testé le processus et découvert que les modifications faites après paiement n'étaient pas transmises au système de l'entrepôt. J'ai signalé le problème au développeur avec mes exemples et, en attendant, nous avons ajouté une vérification manuelle des commandes modifiées. Résultat : le développeur a corrigé la synchronisation, les erreurs de taille sont tombées quasiment à zéro et les réclamations clients dans cette catégorie ont disparu.",
    explanation:
      "Les recruteurs recherchent une démarche structurée : collecter des données, repérer une tendance, tester votre hypothèse, appliquer une solution temporaire puis une solution définitive. C'est utile quels que soient le poste et le niveau.",
    tips: ["Décrivez votre méthode étape par étape.", "Mentionnez comment vous avez confirmé la cause."],
    commonMistakes: ["Passer directement à la solution sans expliquer l'analyse.", "Choisir un problème sans réelle difficulté."],
    followUpQuestions: ["Qu'auriez-vous fait si vous n'aviez trouvé aucune tendance ?", "Comment avez-vous priorisé ce problème par rapport à vos autres tâches ?"],
  },
  'beh-026': {
    question: "Parlez-moi d'une fois où vous avez dû résoudre un problème avec des informations incomplètes.",
    intent: "Le recruteur évalue votre façon d'agir dans l'incertitude : hypothèses, gestion du risque et moment de la décision.",
    expectedAnswer:
      "Situation : un fournisseur nous a informés qu'un composant clé serait livré en retard, sans pouvoir dire de combien. Tâche : en tant que coordinateur de la planification, je devais décider comment maintenir la production pendant le mois suivant. Action : j'ai listé ce que nous savions et ce que nous ignorions, puis j'ai construit trois scénarios : un retard d'une semaine, de trois semaines et de six semaines. Pour chacun, j'ai calculé l'impact et le coût d'un passage à un fournisseur alternatif. J'ai recommandé de commander immédiatement une petite quantité auprès du fournisseur alternatif, ce qui nous protégeait dans les deux scénarios les plus longs pour un coût limité, et nous avons convenu de refaire le point chaque vendredi. Résultat : le retard a duré quatre semaines, la production ne s'est jamais arrêtée et le surcoût a été bien inférieur à ce qu'aurait coûté un arrêt de production.",
    explanation:
      "Avec des informations incomplètes, la meilleure approche consiste à expliciter les hypothèses, comparer des scénarios et choisir une action qui limite les pires risques, avec des points réguliers pour ajuster.",
    tips: ["Distinguez ce que vous saviez de ce que vous supposiez.", "Expliquez comment vous avez limité le risque.", "Montrez comment vous avez réexaminé la décision au fil des nouvelles informations."],
    commonMistakes: ["Attendre d'avoir des informations parfaites.", "Présenter un coup de chance comme une stratégie."],
    followUpQuestions: ["Qu'est-ce qui vous aurait fait changer de décision ?", "Comment avez-vous expliqué l'incertitude à votre manager ?"],
  },
  'beh-027': {
    question: "Parlez-moi d'une fois où vous avez trouvé la cause profonde d'un problème récurrent.",
    intent: "Le recruteur veut voir si vous allez au-delà des solutions rapides pour traiter les causes sous-jacentes.",
    expectedAnswer:
      "Situation : chaque lundi matin, notre système de commandes ralentissait, et l'équipe redémarrait le serveur pour régler le problème. Tâche : on m'a demandé d'empêcher que cela se reproduise plutôt que de redémarrer chaque semaine. Action : j'ai analysé les logs et les métriques des six semaines précédentes et j'ai remarqué qu'une tâche de nettoyage hebdomadaire s'exécutait le dimanche soir en laissant des milliers de connexions à la base de données ouvertes. J'ai reproduit le problème dans notre environnement de test, confirmé la cause et corrigé la tâche pour qu'elle ferme correctement ses connexions. J'ai aussi ajouté une alerte au cas où le nombre de connexions augmenterait de nouveau. Résultat : le ralentissement du lundi n'est jamais revenu, et l'équipe a récupéré le temps passé en redémarrages et en réclamations clients.",
    explanation:
      "L'analyse des causes profondes consiste à chercher des tendances dans le temps, à reproduire le problème et à confirmer la cause avant de le corriger. Ajouter une supervision montre que vous pensez prévention, et pas seulement réparation.",
    tips: ["Expliquez comment vous avez identifié la tendance.", "Montrez comment vous avez confirmé la cause avant de corriger.", "Mentionnez la prévention."],
    commonMistakes: ["Vous arrêter à la première explication plausible.", "Décrire une correction sans prouver qu'elle a fonctionné."],
    followUpQuestions: ["Quels outils avez-vous utilisés pour enquêter ?", "Pourquoi personne ne l'avait-il corrigé auparavant ?"],
  },
  'beh-028': {
    question: "Parlez-moi d'une fois où vous avez trouvé une solution créative à un problème.",
    intent: "Le recruteur vérifie si vous savez sortir des options évidentes quand l'approche habituelle ne fonctionne pas.",
    expectedAnswer:
      "Situation : notre petite association devait traduire ses supports de formation en quatre langues, mais nous n'avions aucun budget pour des traducteurs professionnels. Tâche : en tant que coordinateur de programme, je devais trouver un moyen de livrer les supports en deux mois. Action : j'ai remarqué que beaucoup de nos bénévoles étaient bilingues, alors j'ai organisé un « week-end de traduction » où les bénévoles travaillaient en binôme : l'un traduisait, l'autre relisait. J'ai préparé un glossaire des termes clés pour garder un vocabulaire cohérent et j'ai demandé à une traductrice professionnelle, qui soutenait notre cause, de relire gratuitement uniquement les pages les plus importantes. Résultat : tous les supports ont été traduits en cinq semaines pour un coût quasi nul, et les bénévoles ont dit que ce week-end avait été l'un de leurs événements préférés de l'année.",
    explanation:
      "En entretien, la créativité consiste à combiner autrement les ressources disponibles face à de vraies contraintes, tout en maîtrisant la qualité. Le glossaire et l'étape de relecture montrent que l'idée créative a aussi été bien exécutée.",
    tips: ["Décrivez la contrainte qui rendait la solution habituelle impossible.", "Montrez comment vous avez garanti la qualité."],
    commonMistakes: ["Décrire une idée qui n'a jamais été mise en œuvre.", "Ignorer les risques de l'approche créative."],
    followUpQuestions: ["Quels risques voyiez-vous dans cette approche ?", "Comment encouragez-vous les idées créatives au sein d'une équipe ?"],
  },
  'beh-029': {
    question: "Parlez-moi d'une fois où vous avez résolu un problème sous pression.",
    intent: "Le recruteur veut voir si vous restez méthodique quand le temps presse.",
    expectedAnswer:
      "Situation : une heure avant un webinaire comptant trois cents inscrits, notre plateforme de présentation a cessé de fonctionner. Tâche : en tant qu'organisateur de l'événement, je devais m'assurer que le webinaire ait lieu à l'heure. Action : j'ai demandé à un collègue de contacter le support de la plateforme pendant que je créais une réunion de secours sur un autre outil que nous utilisions déjà. J'ai préparé un court message avec le nouveau lien et je l'ai envoyé aux participants par e-mail et sur nos réseaux sociaux trente minutes avant le début. J'ai aussi demandé à l'intervenant de tester le nouvel outil avec moi. Résultat : le webinaire a commencé avec cinq minutes de retard et plus de 250 participants, et nous avons ajouté un plan de secours à notre checklist événementielle.",
    explanation:
      "Sous pression, les personnes efficaces répartissent les tâches, cherchent en parallèle une correction et une solution de secours, et communiquent tôt. Transformer l'expérience en checklist montre une capacité d'apprentissage.",
    tips: ["Montrez comment vous avez organisé la réponse rapidement.", "Mentionnez la communication avec les personnes concernées."],
    commonMistakes: ["Décrire une panique sans méthode.", "Oublier ce que vous avez changé ensuite."],
    followUpQuestions: ["Qu'auriez-vous fait si l'outil de secours avait lui aussi échoué ?", "Comment vous préparez-vous aujourd'hui à ce type de situation ?"],
  },
  'beh-030': {
    question: "Parlez-moi d'une fois où votre première solution n'a pas fonctionné.",
    intent: "Le recruteur évalue votre persévérance et votre capacité à tirer les leçons d'une tentative ratée au lieu de la répéter.",
    expectedAnswer:
      "Situation : la page de paiement de notre site avait un taux d'abandon élevé. Tâche : on m'a demandé d'améliorer le taux de conversion. Action : ma première idée a été de simplifier le design, et nous avons donc supprimé plusieurs champs. Au bout de deux semaines, les résultats n'avaient pas bougé. Au lieu de tenter une autre modification de design, j'ai analysé des enregistrements de sessions et les retours clients, et j'ai découvert que beaucoup d'utilisateurs partaient en voyant les frais de livraison à la dernière étape. J'ai proposé d'afficher les frais de livraison dès la page produit. Résultat : l'abandon a baissé de 18 % le mois suivant. J'ai appris à mieux comprendre la cause avant de tester une solution.",
    explanation:
      "Il est normal qu'une première tentative échoue. Ce qui compte, c'est de reconnaître rapidement qu'elle n'a pas marché, d'approfondir l'analyse et d'ajuster votre méthode, plutôt que d'essayer des alternatives au hasard.",
    tips: ["Soyez honnête sur la tentative ratée.", "Montrez ce que vous avez appris sur votre propre méthode."],
    commonMistakes: ["Cacher l'échec.", "Changer beaucoup de choses à la fois sans comprendre pourquoi."],
    followUpQuestions: ["Combien de temps vous a-t-il fallu pour comprendre que cela ne fonctionnait pas ?", "Comment décidez-vous d'abandonner une approche ?"],
  },
  'beh-031': {
    question: "Parlez-moi d'une fois où vous avez évité un problème avant qu'il ne survienne.",
    intent: "Le recruteur veut voir votre capacité d'anticipation : repérer les risques tôt, convaincre les autres et agir avant que les dégâts n'arrivent.",
    expectedAnswer:
      "Situation : notre entreprise prévoyait de migrer toutes les données clients vers un nouveau fournisseur cloud en un seul week-end. Tâche : en tant que membre de l'équipe opérations, j'ai relu le plan et constaté qu'il n'existait aucun moyen testé de revenir en arrière en cas d'échec de la migration. Action : j'ai rédigé une courte note de risque expliquant ce qui pouvait mal tourner, l'impact probable sur les clients et le coût d'une journée complète d'interruption. J'ai proposé une répétition sur une copie des données et une procédure de retour arrière claire. La direction a accepté de décaler d'une semaine. Pendant la répétition, nous avons découvert qu'une grande table prenait six heures de plus que prévu à copier. Résultat : nous avons ajusté le plan, la vraie migration s'est terminée dans le créneau prévu et les clients n'ont subi aucune interruption. L'étape de répétition est devenue obligatoire pour les migrations suivantes.",
    explanation:
      "La prévention est invisible quand elle fonctionne : les bonnes réponses expliquent donc le risque, les éléments qui ont convaincu les autres et ce que la répétition ou la vérification a réellement révélé. Cela démontre anticipation et influence.",
    tips: ["Quantifiez le risque que vous avez identifié.", "Expliquez comment vous avez convaincu les autres d'agir.", "Montrez ce que la prévention a réellement mis au jour."],
    commonMistakes: ["Décrire un risque qui n'aurait jamais eu de réelles conséquences.", "Vous attribuer tout le mérite d'un effort collectif."],
    followUpQuestions: ["Comment avez-vous géré la pression pour maintenir la date initiale ?", "Comment repérez-vous les risques dans les plans des autres ?"],
  },
  'beh-032': {
    question: "Parlez-moi d'une fois où vous avez résolu un problème avec des ressources très limitées.",
    intent: "Le recruteur vérifie votre débrouillardise, votre sens des priorités et votre capacité à créer de la valeur sous contrainte.",
    expectedAnswer:
      "Situation : notre équipe service client a perdu deux de ses six agents pendant un gel des recrutements, juste avant la haute saison. Tâche : en tant que responsable d'équipe, je devais maintenir des délais de réponse acceptables sans nouvelles embauches ni budget supplémentaire. Action : j'ai analysé les demandes de l'année précédente et constaté que 40 % concernaient le suivi de commande. Avec un collègue, j'ai rédigé des réponses claires aux dix questions les plus fréquentes et j'ai demandé à l'équipe web d'ajouter un lien de suivi dans chaque e-mail de confirmation. J'ai aussi réorganisé les plannings pour que nos agents les plus solides couvrent les heures les plus chargées. Résultat : les demandes entrantes ont baissé de 30 % pendant le pic et notre délai de réponse moyen est resté sous quatre heures, contre six l'année précédente avec une équipe au complet.",
    explanation:
      "Avec des ressources limitées, l'approche la plus efficace consiste à réduire la demande et à concentrer les efforts là où ils comptent le plus. Une priorisation fondée sur les données et de petits changements peu coûteux sont souvent plus efficaces que travailler davantage.",
    tips: ["Commencez par les données qui ont guidé vos choix.", "Montrez à la fois la réduction de la demande et les gains d'efficacité.", "Comparez les résultats à une référence."],
    commonMistakes: ["Résoudre le problème uniquement en demandant des heures supplémentaires.", "Ne donner aucun résultat mesurable."],
    followUpQuestions: ["Qu'avez-vous décidé de ne pas faire ?", "Comment l'équipe a-t-elle vécu cette période ?"],
  },
  'beh-033': {
    question: "Parlez-moi d'un désaccord que vous avez eu avec un collègue.",
    intent: "Le recruteur veut voir si vous savez exprimer un désaccord avec respect, rester centré sur le sujet et aboutir à une solution.",
    expectedAnswer:
      "Situation : un collègue et moi préparions une proposition commerciale, et nous n'étions pas d'accord sur la tarification : il voulait une offre unique, je voulais trois options. Tâche : nous devions envoyer sous deux jours une proposition que nous pouvions tous les deux défendre. Action : j'ai suggéré que chacun écrive ses arguments. Il craignait que plusieurs options embrouillent le client ; je craignais qu'un prix unique dépasse son budget. Nous avons convenu de demander à la responsable du compte ce qu'elle savait du processus de décision du client. Elle nous a dit que le client comparait les offres avec soin, alors nous avons proposé deux options claires avec un tableau comparatif simple. Résultat : le client a choisi l'option la plus élevée, et mon collègue et moi avons continué à bien travailler ensemble sur les propositions suivantes.",
    explanation:
      "Les recruteurs recherchent un désaccord respectueux : comprendre le point de vue de l'autre, s'appuyer sur des faits ou une source neutre et prendre une décision qui sert l'objectif. Préserver la relation fait partie du résultat.",
    tips: ["Présentez le point de vue de l'autre de manière juste.", "Montrez comment vous êtes parvenus à une décision commune."],
    commonMistakes: ["Choisir une histoire où vous aviez simplement raison et l'autre tort.", "Décrire une tension personnelle plutôt qu'un désaccord professionnel."],
    followUpQuestions: ["Qu'auriez-vous fait si vous n'étiez pas parvenus à un accord ?", "Comment réagissez-vous habituellement quand quelqu'un n'est pas d'accord avec vous ?"],
  },
  'beh-034': {
    question: "Parlez-moi d'une fois où vous n'étiez pas d'accord avec votre manager.",
    intent: "Le recruteur vérifie si vous savez contredire votre hiérarchie avec respect et accepter une décision finale de manière professionnelle.",
    expectedAnswer:
      "Situation : mon manager voulait lancer une nouvelle fonctionnalité auprès de tous les utilisateurs en même temps. Tâche : j'estimais qu'un déploiement progressif était plus sûr, car la fonctionnalité modifiait le calcul des paiements. Action : j'ai demandé un court entretien et j'ai expliqué ma préoccupation, données à l'appui, en citant une mise en production précédente qui avait généré des tickets de support. J'ai proposé de commencer par 10 % des utilisateurs pendant une semaine. Mon manager m'a expliqué que le marketing avait déjà annoncé la date ; nous avons donc trouvé un compromis : lancer pour tout le monde le jour prévu, mais avec un interrupteur permettant de désactiver rapidement la fonctionnalité et une supervision renforcée. Résultat : nous avons détecté un petit problème d'arrondi dès le premier jour, désactivé la fonctionnalité pendant une heure pour le corriger et évité un problème plus large. Mon manager m'a ensuite demandé de l'aider à définir nos règles de mise en production.",
    explanation:
      "Une bonne réponse montre que vous avez exprimé votre désaccord en privé, avec des éléments concrets, puis accepté la décision finale tout en réduisant le risque. Elle démontre à la fois du courage et de la loyauté.",
    tips: ["Exprimez votre désaccord en privé et avec des faits.", "Montrez que vous avez respecté la décision finale."],
    commonMistakes: ["Décrire votre manager de façon négative.", "Raconter une histoire où vous avez ignoré la décision."],
    followUpQuestions: ["Et si votre manager avait refusé tout compromis ?", "Quand vaut-il la peine de faire remonter un désaccord ?"],
  },
  'beh-035': {
    question: "Parlez-moi d'une fois où vous avez dû gérer un client difficile.",
    intent: "Le recruteur veut voir si vous restez calme, comprenez le vrai problème et protégez à la fois la relation et l'entreprise.",
    expectedAnswer:
      "Situation : un client m'a appelé, très en colère, car une commande destinée à l'ouverture de sa boutique était arrivée incomplète. Tâche : en tant que chargé de compte, je devais apaiser la situation et trouver une solution avant son ouverture, deux jours plus tard. Action : je l'ai laissé s'exprimer sans l'interrompre, puis j'ai résumé son problème pour lui montrer que j'avais compris. Je me suis excusé pour le désagrément et j'ai vérifié le stock pendant qu'il était au téléphone. J'ai organisé une livraison express des articles manquants à nos frais et je l'ai rappelé le lendemain matin pour lui confirmer le numéro de suivi. Résultat : les articles sont arrivés la veille de l'ouverture, le client nous a remerciés et il a passé une commande plus importante le mois suivant.",
    explanation:
      "Gérer un client difficile commence par l'écoute et la reconnaissance de sa frustration, suivies d'une action rapide et concrète. Un suivi proactif transforme une expérience négative en expérience positive.",
    tips: ["Montrez comment vous avez fait retomber la tension.", "Décrivez la solution concrète et le suivi."],
    commonMistakes: ["Critiquer le client.", "Promettre quelque chose que vous ne pouviez pas tenir."],
    followUpQuestions: ["Que faites-vous quand la demande d'un client est déraisonnable ?", "Comment vous protégez-vous du stress lors de ces appels ?"],
  },
  'beh-036': {
    question: "Parlez-moi d'une fois où vous avez aidé à résoudre un conflit entre deux collègues.",
    intent: "Le recruteur évalue vos compétences de médiation : neutralité, compréhension des deux parties et recherche d'une solution durable.",
    expectedAnswer:
      "Situation : deux membres expérimentés de mon équipe étaient en conflit ouvert sur la gestion des escalades clients : l'un voulait répondre immédiatement, l'autre voulait d'abord analyser chaque cas. Les réunions étaient devenues tendues et les autres évitaient de travailler avec eux. Tâche : en tant que responsable d'équipe, je devais régler la situation avant qu'elle n'affecte la qualité du service. Action : j'ai rencontré chacun séparément pour l'écouter sans juger. Tous deux avaient des préoccupations légitimes : la rapidité pour les clients et la qualité des réponses. Je les ai ensuite réunis, j'ai rappelé leur objectif commun et je leur ai demandé de concevoir le processus ensemble. Ils se sont mis d'accord sur une approche en deux temps : un accusé de réception rapide sous une heure et une réponse complète sous une journée. J'ai documenté le processus et j'ai refait le point avec eux un mois plus tard. Résultat : les délais de réponse aux escalades se sont améliorés, la tension a disparu et tous deux ont présenté ensemble le processus à une autre équipe.",
    explanation:
      "Une bonne médiation consiste à rencontrer chaque partie en privé, à identifier les intérêts légitimes et à les rendre co-auteurs de la solution. Un suivi ultérieur permet de vérifier que la solution tient dans la durée.",
    tips: ["Restez neutre dans votre façon de décrire les deux personnes.", "Montrez qu'elles ont construit la solution elles-mêmes.", "Mentionnez le suivi."],
    commonMistakes: ["Prendre parti dans votre récit.", "Régler le conflit en imposant une règle sans écouter."],
    followUpQuestions: ["Qu'auriez-vous fait si l'un d'eux avait refusé de coopérer ?", "Quand un manager doit-il intervenir dans un conflit ?"],
  },
  'beh-037': {
    question: "Parlez-moi d'une fois où quelqu'un s'est attribué le mérite de votre travail.",
    intent: "Le recruteur veut voir si vous gérez les situations injustes avec calme et de façon constructive, sans drame.",
    expectedAnswer:
      "Situation : j'avais préparé une étude de marché qu'un collègue a présentée à notre directeur comme s'il l'avait réalisée seul. Tâche : je voulais que ma contribution soit reconnue sans créer de conflit. Action : j'en ai d'abord parlé à mon collègue en privé et calmement. Il m'a dit qu'il avait simplement oublié de me citer. Je lui ai demandé de corriger cela dans son e-mail de suivi au directeur, ce qu'il a fait. J'ai aussi commencé à partager mon travail sur un canal d'équipe avant les réunions, pour que les contributions de chacun soient visibles. Résultat : le directeur m'a remercié pour l'étude, ma relation avec mon collègue est restée bonne et mon travail est devenu plus visible en général.",
    explanation:
      "Cette question teste votre maîtrise émotionnelle et votre professionnalisme. Aborder le problème directement et en privé, présumer d'abord la bonne foi et améliorer votre visibilité pour l'avenir est une approche mature.",
    tips: ["Parlez des faits, pas de ce que vous ressentez envers la personne.", "Montrez comment vous avez évité que cela se reproduise."],
    commonMistakes: ["Vous plaindre publiquement ou aller directement voir le manager.", "Ne rien faire et garder de la rancœur."],
    followUpQuestions: ["Et si cela s'était reproduit ?", "Comment rendez-vous votre travail visible sans paraître vantard ?"],
  },
  'beh-038': {
    question: "Parlez-moi d'une fois où vous avez reçu une critique que vous jugiez injuste.",
    intent: "Le recruteur vérifie comment vous réagissez quand vous n'êtes pas d'accord avec un retour : défensive, repli ou dialogue constructif.",
    expectedAnswer:
      "Situation : lors de mon entretien annuel, ma manager m'a dit que je n'étais pas assez proactif en réunion. Tâche : je trouvais cela injuste, car je contribuais beaucoup par écrit, et je voulais comprendre son point de vue plutôt que le rejeter d'emblée. Action : je lui ai demandé des exemples précis. Elle a cité deux réunions de planification où j'étais resté silencieux avant de partager mes idées par e-mail, une fois les décisions déjà prises. Je lui ai expliqué que j'aime réfléchir avant de parler, et nous avons convenu que j'enverrais mes commentaires avant les réunions plutôt qu'après. Résultat : mes idées ont commencé à peser plus tôt sur les décisions, et lors de l'entretien suivant, elle a souligné mes contributions à la planification. J'ai compris que la critique était en partie fondée, même si sa formulation m'avait surpris.",
    explanation:
      "Les meilleures réponses montrent que vous avez cherché à comprendre le retour avant de le juger, identifié la part qui était fondée et convenu d'un changement. Reconnaître que la critique était en partie juste témoigne d'une bonne connaissance de soi.",
    tips: ["Demandez des exemples avant de réagir.", "Montrez quelle part du retour était fondée."],
    commonMistakes: ["Expliquer pourquoi la manager avait tort.", "Prétendre avoir accepté la critique sans aucune discussion."],
    followUpQuestions: ["Comment réagissez-vous sur le moment quand vous entendez une critique ?", "Vous est-il déjà arrivé de contester un retour et de maintenir votre position ?"],
  },
  'beh-039': {
    question: "Parlez-moi d'une fois où deux équipes avaient des priorités contradictoires et où vous avez dû trancher.",
    intent: "Le recruteur veut voir si vous savez résoudre un conflit organisationnel en vous concentrant sur les objectifs communs et en escaladant à bon escient.",
    expectedAnswer:
      "Situation : l'équipe marketing avait besoin que notre équipe data construise des rapports pour une campagne, tandis que l'équipe finance avait besoin que nous automatisions le reporting de clôture mensuelle, le tout sur les trois mêmes semaines. Tâche : en tant que responsable de l'équipe data, je ne pouvais pas tout faire complètement, et les deux managers insistaient sur l'urgence de leur demande. Action : j'ai demandé à chaque équipe quelle décision leur demande servait et ce qui se passerait si elle arrivait deux semaines plus tard. Le marketing n'avait besoin que de deux chiffres clés avant le lancement ; la finance faisait face à une véritable échéance d'audit. J'ai proposé de livrer en trois jours une version manuelle simple des deux chiffres pour le marketing, puis de me concentrer sur la finance, et de terminer les rapports marketing complets après la clôture. Comme les deux managers avaient validé les critères, je leur ai présenté le plan ensemble et j'ai demandé à notre directeur de le confirmer. Résultat : la finance a respecté son échéance d'audit, le marketing a lancé sa campagne à temps avec les chiffres nécessaires et les deux équipes ont adopté le processus de planification trimestrielle que j'avais proposé.",
    explanation:
      "La résolution de conflits à un niveau avancé s'appuie sur des critères objectifs (impact, échéances, alternatives), des solutions partielles créatives et une escalade transparente si nécessaire. Elle montre que vous agissez dans l'intérêt de l'entreprise plutôt que d'une seule équipe.",
    tips: ["Expliquez les critères utilisés pour décider.", "Cherchez une solution partielle qui répond au besoin le plus urgent.", "Montrez comment vous avez escaladé en toute transparence."],
    commonMistakes: ["Donner la priorité à l'équipe dont le manager est le plus haut placé.", "Vouloir tout faire et décevoir les deux équipes."],
    followUpQuestions: ["Comment avez-vous communiqué la décision à votre propre équipe ?", "Que feriez-vous si le directeur n'avait pas été d'accord ?"],
  },
  'beh-040': {
    question: "Parlez-moi d'une fois où vous avez travaillé avec quelqu'un avec qui vous ne vous entendiez pas.",
    intent: "Le recruteur veut savoir si les différences personnelles affectent votre travail et comment vous construisez une relation de travail fonctionnelle.",
    expectedAnswer:
      "Situation : lors d'un projet de groupe à l'université, un coéquipier était très direct et rejetait souvent les idées rapidement, ce qui m'agaçait. Tâche : nous devions réaliser ensemble une étude de marché sur deux mois, je devais donc établir une relation de travail. Action : je lui ai proposé un café pour parler de nos façons de travailler. J'ai appris qu'il était sous pression à cause d'un emploi à temps partiel et qu'il voulait des réunions courtes. Nous nous sommes mis d'accord sur un ordre du jour clair pour chaque réunion et sur le partage des idées par écrit avant d'en discuter. Résultat : nos réunions sont devenues plus courtes et plus sereines, le projet a obtenu une bonne note et j'ai compris que connaître les contraintes de quelqu'un change le regard qu'on porte sur son comportement.",
    explanation:
      "Les recruteurs recherchent des professionnels capables de travailler avec tout le monde. Comprendre la situation de l'autre et convenir de règles de travail simples sont des approches matures et concrètes.",
    tips: ["Décrivez la personne de façon neutre.", "Montrez ce que vous avez fait pour améliorer la relation."],
    commonMistakes: ["Critiquer l'autre personne.", "Dire que vous vous entendez avec tout le monde."],
    followUpQuestions: ["Quel type de personnalité trouvez-vous le plus difficile à côtoyer au travail ?", "Qu'avez-vous changé dans votre propre comportement ?"],
  },
};
