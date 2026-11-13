import type { QuestionText, TextTable } from '@/types/content';

export const fr: TextTable<QuestionText> = {
  'gen-001': {
    question: "Parlez-moi de vous.",
    intent: "Le recruteur attend un aperçu court et pertinent de votre profil professionnel, et une première idée de la clarté avec laquelle vous communiquez.",
    expectedAnswer:
      "Je suis développeur backend avec quatre ans d'expérience, actuellement dans une entreprise d'e-commerce de taille moyenne où je travaille sur les services de commande et de paiement. L'an dernier, j'ai piloté la migration de notre API de paiement vers une nouvelle architecture, ce qui a réduit les temps de réponse d'environ un tiers. Auparavant, j'ai passé deux ans dans une agence digitale, où j'ai appris à livrer rapidement pour des clients très différents. Je cherche aujourd'hui une entreprise produit où je pourrai approfondir un domaine, et votre travail sur les logiciels logistiques correspond exactement à cela.",
    explanation:
      "La structure présent-passé-futur permet de tenir en moins de deux minutes : qui vous êtes aujourd'hui, le parcours qui vous a mené ici, et pourquoi ce poste est l'étape logique suivante. Elle transforme une question ouverte en un pitch qui se conclut sur le poste visé.",
    tips: ["Visez 60 à 90 secondes.", "Choisissez une ou deux réalisations en lien avec l'offre d'emploi.", "Terminez par ce qui vous attire dans ce poste, pour que l'échange se poursuive naturellement."],
    commonMistakes: ["Réciter votre CV dans l'ordre chronologique depuis vos études.", "Partager des détails personnels sans rapport avec le poste.", "Conclure sans relier votre parcours au poste."],
    followUpQuestions: ["Pourquoi cherchez-vous un nouveau poste maintenant ?", "Quel a été le plus grand défi de cette migration ?"],
  },
  'gen-002': {
    question: "Présentez-moi votre parcours à partir de votre CV.",
    intent: "Le recruteur veut comprendre la logique de votre parcours : pourquoi vous avez fait chaque choix et ce que chacun vous a apporté.",
    expectedAnswer:
      "J'ai commencé comme technicien support, ce qui m'a appris comment les utilisateurs vivent réellement un logiciel. J'ai ensuite suivi des cours du soir en programmation et j'ai évolué vers un poste de développeur junior dans la même entreprise. Deux ans plus tard, j'ai rejoint une start-up pour travailler sur un produit plus ambitieux et découvrir des pratiques modernes comme la revue de code et les tests automatisés. Chaque étape m'a rapproché de la conception de produits, et ce poste est la suivante dans cette direction.",
    explanation:
      "Présenter son CV, ce n'est pas énumérer des dates. Les recruteurs cherchent un fil conducteur : la raison de chaque changement et la compétence qu'il a apportée. Expliquer vos choix montre que votre parcours est réfléchi, même s'il n'a pas été linéaire.",
    tips: ["Consacrez plus de temps aux postes récents et pertinents qu'aux plus anciens.", "Pour chaque changement, donnez une raison et un apprentissage.", "Préparez une phrase calme et honnête pour toute période d'inactivité ou expérience courte."],
    commonMistakes: ["Lire le CV ligne par ligne.", "Critiquer d'anciens employeurs pour expliquer un départ."],
    followUpQuestions: ["Quel poste vous a le plus appris ?", "Pourquoi n'êtes-vous resté qu'un an dans la start-up ?"],
  },
  'gen-003': {
    question: "Comment vous décririez-vous en trois mots ?",
    intent: "Le recruteur évalue votre connaissance de vous-même et votre capacité à appuyer des adjectifs par des preuves plutôt que par des clichés.",
    expectedAnswer:
      "Curieux, fiable et calme. Curieux, parce que j'aime comprendre comment les choses fonctionnent : dans mon dernier poste, j'ai appris seul nos outils de supervision et je suis devenu la personne que l'équipe sollicitait au sujet des alertes. Fiable, parce que lorsque je m'engage sur une échéance, soit je la respecte, soit je préviens tôt ; mon manager l'a souligné lors de mon dernier entretien annuel. Et calme, parce que pendant les incidents je me concentre sur la prochaine action utile plutôt que sur la pression.",
    explanation:
      "Trois adjectifs seuls s'oublient vite. Associer une courte preuve à chacun les transforme en éléments concrets et montre que vous savez comment vous êtes perçu. Choisir des qualités liées au poste rend la réponse pertinente.",
    example: "Structure : mot → preuve en une phrase → (facultatif) lien avec le poste. À répéter trois fois, en moins d'une minute.",
    tips: ["Choisissez des mots qui correspondent aux exigences du poste.", "Évitez les mots génériques comme « travailleur », sauf si vous pouvez les prouver précisément."],
    commonMistakes: ["Énumérer trois adjectifs sans aucun exemple.", "Choisir des mots qui contredisent le poste, comme « perfectionniste » pour un poste au rythme soutenu, sans nuance."],
    followUpQuestions: ["Lequel de ces trois mots vos collègues contesteraient-ils ?", "Quel mot aimeriez-vous ajouter d'ici deux ans ?"],
  },
  'gen-004': {
    question: "Quelle est votre plus grande réussite professionnelle ?",
    intent: "Le recruteur veut savoir ce qui compte pour vous, l'ampleur de l'impact que vous pouvez avoir et la manière dont vous décrivez votre propre contribution.",
    expectedAnswer:
      "Situation : notre service client était submergé par les demandes de réinitialisation de mot de passe, environ 300 tickets par semaine. Tâche : en tant que développeur de l'équipe Comptes, on m'a demandé de réduire cette charge. Action : j'ai analysé les tickets et découvert que la plupart des utilisateurs ne recevaient jamais l'e-mail de réinitialisation à cause d'un problème de filtre anti-spam ; j'ai corrigé la configuration d'envoi et ajouté une réinitialisation en libre-service par SMS. J'ai aussi rédigé un court article d'aide avec l'équipe support. Résultat : les tickets de réinitialisation ont baissé de 70 % en un mois, et le support a pu se concentrer sur les vrais problèmes des clients.",
    explanation:
      "Une bonne réponse sur une réussite présente un vrai problème, vos actions personnelles et un résultat mesurable. La méthode STAR (Situation, Task, Action, Result : situation, tâche, action, résultat) évite les affirmations vagues et met en avant ce que vous avez fait, pas seulement ce qu'a fait l'équipe.",
    tips: ["Choisissez une réussite en lien avec le poste visé.", "Chiffrez le résultat, même approximativement.", "Dites « je » pour vos actions et reconnaissez le mérite des autres lorsque c'est justifié."],
    commonMistakes: ["Choisir une réussite sans impact mesurable.", "Décrire le projet sans préciser votre propre rôle."],
    followUpQuestions: ["Que feriez-vous différemment aujourd'hui ?", "Qui d'autre a contribué, et de quelle manière ?"],
  },
  'gen-005': {
    question: "Comment vos collègues vous décriraient-ils ?",
    intent: "Le recruteur vérifie comment vous travaillez avec les autres et si l'image que vous avez de vous correspond à celle qu'ont les autres.",
    expectedAnswer:
      "Je pense qu'ils diraient que je suis la personne qui clarifie les choses. Quand un besoin est flou, c'est généralement moi qui note les questions ouvertes et organise un court appel pour les trancher. Lors de mon dernier cycle de feedback, deux collègues ont mentionné que mes commentaires sur les pull requests sont directs mais bienveillants. L'un d'eux a aussi dit que j'ai parfois tendance à trop prendre sur moi, ce sur quoi je travaille en déléguant davantage.",
    explanation:
      "Citer de vrais retours rend la réponse crédible. Ajouter un petit axe d'amélioration honnête montre de la maturité et rend les points positifs plus convaincants.",
    tips: ["Appuyez-vous sur de vrais retours : entretiens d'évaluation, commentaires, messages.", "Mentionnez un comportement concret plutôt qu'un trait de personnalité."],
    commonMistakes: ["Répondre uniquement par des adjectifs flatteurs.", "Dire « Je ne sais pas, il faudrait leur demander »."],
    followUpQuestions: ["Pouvez-vous donner un exemple de ce retour ?", "Comment avez-vous réagi à la remarque sur le fait de trop prendre sur vous ?"],
  },
  'gen-006': {
    question: "Qu'est-ce qui vous distingue des autres candidats pour ce poste ?",
    intent: "Le recruteur veut que vous identifiiez votre valeur spécifique pour ce poste et que vous la défendiez sans arrogance.",
    expectedAnswer:
      "Je ne peux pas parler pour les autres candidats, mais je peux vous présenter la combinaison que j'apporte. J'ai cinq ans d'expérience en développement backend et, depuis deux ans, je fais aussi le lien entre notre équipe technique et la direction financière, en traduisant des règles comptables en exigences pour le système. Votre offre mentionne le développement de fonctionnalités de facturation avec des interlocuteurs de la finance : c'est exactement à cette intersection que j'ai travaillé. Par exemple, j'ai piloté la refonte de notre module de facturation, ce qui a supprimé la plupart des corrections manuelles en fin de mois. Beaucoup de développeurs maîtrisent bien le code ; moins nombreux sont ceux qui ont aussi pris le temps de comprendre le métier.",
    explanation:
      "La meilleure réponse ne vous compare pas à des personnes que vous n'avez jamais rencontrées. Elle identifie une combinaison de compétences rare dont le poste a besoin, puis la prouve par un exemple. Commencer avec humilité permet de garder un ton assuré plutôt que vantard.",
    tips: ["Cherchez l'intersection entre deux de vos compétences et l'offre d'emploi.", "Appuyez votre argument par un résultat.", "Gardez un ton respectueux envers les autres candidats."],
    commonMistakes: ["Affirmer que vous êtes « le meilleur » sans preuve.", "Énumérer des qualités génériques que tout le monde pourrait revendiquer, comme la motivation ou la passion."],
    followUpQuestions: ["Que devriez-vous apprendre rapidement dans ce poste ?", "Comment avez-vous acquis ces connaissances en finance ?"],
  },
  'gen-007': {
    question: "Quelles sont vos principales qualités ?",
    intent: "Le recruteur veut voir si vos principales qualités correspondent au poste et si vous êtes capable de les prouver.",
    expectedAnswer:
      "Ma principale qualité est de savoir décomposer des problèmes complexes. Sur mon dernier projet, notre traitement de reporting prenait six heures et échouait souvent. Je l'ai découpé en étapes plus petites, j'ai mesuré chacune d'elles et j'ai découvert qu'une seule requête représentait l'essentiel du temps. Après l'avoir réécrite et ajouté un index, le traitement s'exécutait en quarante minutes. Ma deuxième qualité est d'expliquer simplement des sujets techniques : je présente régulièrement nos évolutions à l'équipe produit, et elle vient désormais me voir en premier lorsqu'elle a besoin d'un avis technique.",
    explanation:
      "Deux qualités, chacune prouvée par une courte histoire, sont plus convaincantes qu'une longue liste. Choisir des qualités mentionnées dans l'offre montre que vous avez réfléchi aux besoins du poste.",
    tips: ["Préparez deux ou trois qualités et retenez celles que mentionne l'offre d'emploi.", "Donnez un court exemple par qualité."],
    commonMistakes: ["Énumérer de nombreuses qualités sans preuve.", "Choisir des qualités sans rapport avec le poste."],
    followUpQuestions: ["Sur quelle qualité vous appuyez-vous le plus sous pression ?", "Cette qualité peut-elle devenir un défaut ?"],
  },
  'gen-008': {
    question: "Quel est votre principal défaut ?",
    intent: "Le recruteur évalue votre lucidité, votre honnêteté et votre capacité à progresser ; il ne cherche pas une raison de vous écarter.",
    expectedAnswer:
      "Pendant longtemps, j'ai été mal à l'aise pour prendre la parole en grande réunion, si bien que mes idées restaient dans mes notes. C'est devenu un vrai problème le jour où une conception que j'avais proposée par écrit a été abandonnée parce que je ne l'avais pas défendue en revue. Depuis, j'y travaille délibérément : je me porte volontaire pour présenter notre démo de sprint une fois par mois et je prépare deux ou trois points clés avant chaque réunion. Ce n'est toujours pas mon exercice préféré, mais le trimestre dernier j'ai animé notre revue d'architecture et la proposition a été adoptée.",
    explanation:
      "Une bonne réponse nomme un défaut réel mais non rédhibitoire, montre son impact, puis se concentre sur les actions concrètes menées et les progrès obtenus. Le plan d'amélioration compte davantage que le défaut lui-même.",
    tips: ["Choisissez un vrai défaut qui n'est pas essentiel pour le poste.", "Consacrez l'essentiel de la réponse à ce que vous faites pour y remédier.", "Montrez des progrès mesurables."],
    commonMistakes: ["Déguiser une qualité en défaut (« Je suis trop perfectionniste »).", "Citer un défaut critique pour le poste.", "Affirmer que vous n'avez aucun défaut."],
    followUpQuestions: ["Sur quel autre défaut travaillez-vous ?", "Comment obtenez-vous des retours sur vos progrès ?"],
  },
  'gen-009': {
    question: "Qu'apportez-vous à une équipe ?",
    intent: "Le recruteur veut comprendre votre rôle au sein d'un groupe et la façon dont vous rendez les autres plus efficaces.",
    expectedAnswer:
      "J'apporte de la structure et du suivi. Dans mon équipe actuelle, j'ai remarqué que nous sortions souvent des réunions sans responsables clairement désignés ; j'ai donc commencé à publier après chacune un court compte rendu avec les décisions et les noms. Cela prenait cinq minutes, et l'équipe en a fait une habitude. J'aime aussi aider les nouveaux collègues : j'ai travaillé en binôme avec nos deux dernières recrues pendant leurs premières semaines, et toutes deux contribuaient à la production en moins d'un mois.",
    explanation:
      "Les recruteurs veulent savoir ce qui change dans l'équipe grâce à votre présence. Des habitudes concrètes et leur effet sur les autres répondent mieux à cette question que des affirmations générales sur votre « esprit d'équipe ».",
    tips: ["Décrivez un comportement, pas une étiquette.", "Montrez l'effet sur l'équipe, pas seulement sur votre propre travail."],
    commonMistakes: ["Dire « J'ai l'esprit d'équipe » sans exemple.", "Parler uniquement de vos tâches individuelles."],
    followUpQuestions: ["Quel rôle prenez-vous généralement dans une nouvelle équipe ?", "Avec quel type de coéquipier avez-vous du mal à travailler ?"],
  },
  'gen-010': {
    question: "Quelle compétence êtes-vous en train de développer ?",
    intent: "Le recruteur évalue vos habitudes d'apprentissage et votre capacité à prendre en main votre propre développement.",
    expectedAnswer:
      "Je travaille mes compétences en analyse de données. Dans mon poste, je dois souvent justifier des décisions avec des chiffres, et je dépendais de collègues pour extraire les données. Il y a trois mois, j'ai commencé une formation SQL en ligne et je m'entraîne sur notre vraie base de reporting une demi-heure, deux fois par semaine. Je peux désormais construire la plupart de mes rapports moi-même, et le mois dernier je m'en suis servi pour montrer qu'une fonctionnalité prévue était très peu utilisée, ce qui nous a fait économiser un sprint de travail.",
    explanation:
      "Cette question vérifie si vous apprenez de manière active. Une bonne réponse nomme une compétence précise, la raison pour laquelle elle compte dans votre travail, votre méthode et les premiers résultats. Idéalement, elle est liée au poste visé.",
    tips: ["Choisissez une compétence utile pour le poste visé.", "Mentionnez votre méthode et la fréquence de votre pratique.", "Partagez un premier résultat pour montrer vos progrès."],
    commonMistakes: ["Citer une compétence sans aucun plan derrière.", "Choisir un sujet sans lien avec le travail sans expliquer pourquoi."],
    followUpQuestions: ["Comment décidez-vous de ce que vous allez apprendre ensuite ?", "Qu'avez-vous appris l'an dernier que vous utilisez tous les jours ?"],
  },
  'gen-011': {
    question: "Parlez-moi d'une situation où vous êtes sorti de votre zone de confort.",
    intent: "Le recruteur veut voir comment vous réagissez quand l'expérience vous manque : si vous vous bloquez, si vous bluffez ou si vous apprenez vite.",
    expectedAnswer:
      "Situation : mon responsable d'équipe est parti brusquement deux semaines avant une démo client. Tâche : j'étais le développeur le plus expérimenté restant, on m'a donc demandé d'animer la démo et de gérer la relation client, ce que je n'avais jamais fait. Action : j'ai demandé à mon manager un court briefing sur les priorités du client, j'ai répété la démo deux fois avec des collègues et j'ai préparé des réponses aux questions que je redoutais le plus. Pendant la démo, quand je ne connaissais pas une réponse, je l'ai dit et j'ai promis une réponse écrite le lendemain. Résultat : le client a validé la phase suivante, et je suis resté son interlocuteur principal pendant six mois.",
    explanation:
      "L'essentiel est votre façon d'aborder l'inconnu : chercher l'information, vous préparer délibérément et être honnête sur ce que vous ne savez pas. Ce sont des signes que vous saurez faire face à de nouvelles responsabilités.",
    tips: ["Choisissez une situation qui vous a réellement mis au défi.", "Mettez en avant votre préparation et les personnes à qui vous avez demandé de l'aide."],
    commonMistakes: ["Choisir un exemple anodin.", "Masquer les difficultés et vous présenter comme immédiatement à l'aise."],
    followUpQuestions: ["Que feriez-vous différemment ?", "Avez-vous souhaité conserver cette responsabilité par la suite ?"],
  },
  'gen-012': {
    question: "Parlez-moi d'un défaut qui vous a réellement coûté quelque chose au travail.",
    intent: "Cette version approfondie de la question sur les défauts vérifie si vous savez assumer une conséquence réelle sans vous mettre sur la défensive.",
    expectedAnswer:
      "J'ai tendance à sous-estimer le temps que demande un travail d'intégration. Il y a deux ans, je me suis engagé à livrer une intégration avec un partenaire en trois semaines ; il en a fallu sept, car la documentation de son API était obsolète et je l'ai découvert tardivement. La conséquence a été réelle : notre équipe commerciale a dû repousser un lancement avec un client, et j'ai dû expliquer ce retard. Depuis, je construis mes estimations autrement. Je consacre les deux premiers jours à une exploration technique sur le système réel, je donne une fourchette plutôt qu'une date unique et je partage les risques par écrit. Sur les trois dernières intégrations, mes estimations étaient à moins de 20 % du temps réel.",
    explanation:
      "À un niveau avancé, les recruteurs attendent un défaut au coût réel, pleinement assumé, et un processus modifié dont les résultats le confirment. La réponse montre que vous apprenez des conséquences plutôt que de la théorie.",
    tips: ["Choisissez un défaut dont vous pouvez décrire le coût de manière factuelle.", "Décrivez le processus que vous avez changé, pas seulement de bonnes intentions.", "Terminez par une preuve que le changement fonctionne."],
    commonMistakes: ["Minimiser l'impact ou rejeter la faute sur les autres.", "Choisir un exemple catastrophique qui fait douter de votre jugement."],
    followUpQuestions: ["Comment votre manager a-t-il réagi à l'époque ?", "Comment gérez-vous une échéance que vous savez irréaliste ?"],
  },
  'gen-013': {
    question: "Si nous appelions votre dernier manager, que dirait-il que vous pourriez améliorer ?",
    intent: "Le recruteur vérifie si vous connaissez vos axes de progrès et si votre réponse correspondrait à une véritable prise de références.",
    expectedAnswer:
      "Il dirait probablement que je devrais exprimer mon désaccord plus tôt. En réunion de planification, il m'est arrivé d'accepter un périmètre que je jugeais trop large et de ne soulever mes inquiétudes qu'une fois le travail lancé. Mon manager me l'a dit clairement lors de mon dernier entretien annuel : un désaccord exprimé tôt est plus utile qu'une alerte tardive. Depuis, je note mes réserves avant la planification et je les exprime en réunion, même si c'est inconfortable. Au dernier sprint, cela nous a conduits à réduire de moitié une fonctionnalité avant même de la commencer.",
    explanation:
      "Répondre comme si l'appel de référence allait réellement avoir lieu vous pousse à choisir un retour honnête et précis. Montrer que vous l'avez entendu et que vous avez agi prouve votre capacité à progresser, une qualité que les managers apprécient beaucoup.",
    tips: ["Utilisez un retour que vous avez réellement reçu.", "Montrez ce que vous avez changé après l'avoir entendu."],
    commonMistakes: ["Inventer un retour qui ressemble à un compliment.", "Contredire ce qu'une référence dirait réellement."],
    followUpQuestions: ["Qu'appréciait-il le plus dans votre travail ?", "Comment sollicitez-vous habituellement des retours ?"],
  },
  'gen-014': {
    question: "Pourquoi voulez-vous travailler chez nous ?",
    intent: "Le recruteur veut la preuve que vous vous êtes renseigné sur l'entreprise et que vos raisons vont au-delà de « j'ai besoin d'un emploi ».",
    expectedAnswer:
      "Trois choses m'ont attiré. D'abord votre produit : j'utilise votre application de gestion de budget depuis un an et j'apprécie qu'elle explique les dépenses au lieu de simplement les lister. Ensuite, l'article de votre blog technique sur le passage à des équipes plus petites et autonomes correspond à ma façon de travailler. Enfin, le poste lui-même : vous développez les fonctionnalités data de l'application, et c'est précisément sur ce sujet que je me suis concentré ces deux dernières années. Je vois clairement où je peux contribuer dès le départ.",
    explanation:
      "Une réponse précise montre un intérêt sincère et une vraie préparation. Relier l'entreprise (produit, valeurs, organisation du travail) à votre propre expérience prouve que l'adéquation est réelle et non générique.",
    tips: ["Mentionnez un élément concret : un produit, un article, une valeur, un projet récent.", "Reliez ce que vous avez découvert à vos compétences ou à vos objectifs."],
    commonMistakes: ["Donner une réponse valable pour n'importe quelle entreprise (« Vous êtes leader sur votre marché »).", "Parler uniquement du salaire ou de la localisation."],
    followUpQuestions: ["Que pourrions-nous améliorer dans notre produit selon vous ?", "Avec quelles autres entreprises êtes-vous en discussion ?"],
  },
  'gen-015': {
    question: "Pourquoi voulez-vous ce poste ?",
    intent: "Le recruteur veut comprendre ce qui vous attire dans le poste lui-même et vérifier que vous savez ce qu'il implique.",
    expectedAnswer:
      "Ce poste réunit les deux aspects de mon travail que j'apprécie le plus : développer des fonctionnalités et travailler directement avec les utilisateurs. Dans mon poste actuel, je passe l'essentiel de mon temps sur des outils internes, et les moments les plus gratifiants sont ceux où je peux échanger avec les personnes qui les utilisent. Votre offre mentionne la participation aux entretiens clients et la transformation des retours en évolutions du produit : c'est exactement ce type de boucle dont je veux faire partie.",
    explanation:
      "Cette question porte sur le poste, pas sur l'entreprise. Les recruteurs veulent voir que vous avez lu l'offre, que vous savez à quoi ressemble le travail au quotidien et que cela correspond à ce qui vous motive.",
    tips: ["Citez deux ou trois responsabilités figurant dans l'offre d'emploi.", "Reliez-les à ce que vous aimez faire et faites bien."],
    commonMistakes: ["Parler de l'entreprise au lieu du poste.", "Donner l'impression que n'importe quel poste ferait l'affaire."],
    followUpQuestions: ["Quelle partie de ce poste serait la plus difficile pour vous ?", "À quoi ressemblerait un excellent premier mois ?"],
  },
  'gen-016': {
    question: "Pourquoi souhaitez-vous quitter votre poste actuel ?",
    intent: "Le recruteur vérifie que vos raisons sont professionnelles et que les mêmes problèmes ne se poseront pas dans ce poste.",
    expectedAnswer:
      "J'ai beaucoup appris dans mon entreprise actuelle, en particulier sur la conception de services fiables. Mais le produit est devenu très stable, et l'essentiel de mon travail relève désormais de la maintenance. Je souhaite travailler sur un produit encore en croissance, où je pourrai participer à la conception de nouvelles fonctionnalités. J'en ai parlé avec mon manager, et aucun projet de ce type n'est prévu pour l'année à venir ; je le cherche donc ailleurs.",
    explanation:
      "Les meilleures réponses mettent l'accent sur ce vers quoi vous allez, pas sur ce que vous fuyez. Rester positif à l'égard de votre employeur actuel montre votre professionnalisme et rassure le recruteur : vous ne partirez pas pour des frustrations mineures.",
    tips: ["Présentez ce changement sous l'angle de l'évolution ou de l'adéquation.", "Restez factuel et positif à l'égard de votre employeur actuel.", "Si vous avez été licencié, dites-le brièvement et calmement, puis enchaînez sur ce que vous en avez appris."],
    commonMistakes: ["Critiquer votre manager ou vos collègues.", "Avancer une raison que le nouveau poste présente aussi."],
    followUpQuestions: ["Qu'est-ce qui vous ferait rester dans votre entreprise actuelle ?", "En avez-vous parlé avec votre manager ?"],
  },
  'gen-017': {
    question: "Qu'est-ce qui vous motive ?",
    intent: "Le recruteur veut savoir ce qui entretient votre engagement et si le poste peut vous l'apporter.",
    expectedAnswer:
      "Ce qui me motive, c'est de voir l'effet de mon travail sur des personnes réelles. Dans mon dernier poste, j'ai développé un petit outil qui permettait aux équipes de l'entrepôt d'imprimer les étiquettes d'expédition en un clic au lieu de cinq. Une semaine plus tard, le chef d'équipe m'a dit que cela leur faisait gagner presque une heure par jour. Ce genre de moment me porte bien plus que la technologie elle-même. C'est l'une des raisons pour lesquelles ce poste m'intéresse, puisque vos équipes travaillent au plus près des utilisateurs finaux.",
    explanation:
      "Une motivation est crédible lorsqu'elle est illustrée par un moment réel. La relier au poste montre au recruteur que celui-ci vous maintiendra engagé dans la durée.",
    tips: ["Choisissez une motivation que le poste peut réellement satisfaire.", "Illustrez-la par un moment court et réel."],
    commonMistakes: ["Citer uniquement l'argent ou la sécurité de l'emploi.", "Donner une réponse abstraite sans exemple."],
    followUpQuestions: ["Qu'est-ce qui vous démotive ?", "Comment restez-vous motivé sur des tâches répétitives ?"],
  },
  'gen-018': {
    question: "Pourquoi devrions-nous vous embaucher ?",
    intent: "Le recruteur vous invite à résumer votre adéquation au poste de manière assurée et structurée.",
    expectedAnswer:
      "Vous cherchez une personne capable de maintenir votre application mobile et d'en améliorer les performances, en travaillant étroitement avec les designers. C'est exactement ce que je fais depuis trois ans : j'ai maintenu une application de 200 000 utilisateurs et réduit de moitié son temps de démarrage. Je travaille aussi bien avec les équipes design ; dans mon poste actuel, j'ai mis en place une séance hebdomadaire avec nos designers pour revoir les nouveaux écrans avant le développement. Enfin, votre domaine m'intéresse sincèrement, car j'utilise tous les jours des applications comme la vôtre.",
    explanation:
      "C'est votre plaidoirie finale. Reprenez les principaux besoins du poste, puis associez à chacun une preuve tirée de votre expérience. Terminer par un intérêt sincère ajoute la motivation à la compétence.",
    tips: ["Partez des besoins exprimés dans l'offre, pas de votre CV.", "Donnez deux ou trois correspondances, chacune appuyée par une preuve.", "Restez sous la minute."],
    commonMistakes: ["Répéter votre CV.", "Rester vague (« Je suis travailleur et motivé »).", "Paraître arrogant."],
    followUpQuestions: ["De quoi auriez-vous besoin de notre part pour réussir ?", "Que manque-t-il à votre profil pour ce poste ?"],
  },
  'gen-019': {
    question: "Que voudriez-vous accomplir au cours de vos 90 premiers jours ?",
    intent: "Le recruteur veut voir si vous savez planifier votre intégration de façon réaliste et vous concentrer sur ce qui compte pour l'entreprise.",
    expectedAnswer:
      "Le premier mois, je me concentrerais sur l'apprentissage : rencontrer les personnes avec qui je vais travailler, comprendre le produit, les principaux indicateurs et les plus gros points de friction, et livrer quelques petites corrections pour découvrir le code et le processus de mise en production. Le deuxième mois, je prendrais en charge un chantier significatif, idéalement un sujet que votre équipe a déjà identifié comme prioritaire, et je le mènerais de bout en bout. D'ici le troisième mois, j'aimerais proposer une amélioration fondée sur mes observations, par exemple sur les tests ou le déploiement, et convenir avec mon manager des objectifs des six mois suivants. Je ferais aussi un point toutes les quelques semaines pour m'assurer que nous avons la même lecture de mes progrès.",
    explanation:
      "Un plan à 90 jours crédible équilibre apprentissage, livraison et amélioration. Il montre de l'humilité (écouter d'abord), de l'ambition (prendre en charge quelque chose de concret) et de l'alignement (fixer les objectifs avec le manager). Mentionner des points réguliers montre que vous recherchez des retours au lieu de faire des suppositions.",
    tips: ["Structurez la réponse par mois ou par phase.", "Mentionnez l'apprentissage avant tout changement.", "Demandez au recruteur à quoi ressemblerait la réussite selon lui."],
    commonMistakes: ["Promettre de grands changements avant de comprendre le contexte.", "Décrire uniquement un apprentissage passif, sans aucune livraison."],
    followUpQuestions: ["Que feriez-vous si votre manager avait une autre priorité ?", "Comment gagneriez-vous la confiance de l'équipe ?"],
  },
  'gen-020': {
    question: "Parlez-moi d'une période où vous avez perdu votre motivation au travail. Qu'avez-vous fait ?",
    intent: "Le recruteur veut savoir si vous savez reconnaître une baisse de motivation et la gérer de façon responsable.",
    expectedAnswer:
      "Situation : après une réorganisation, mon équipe a été chargée de migrer un ancien système de reporting, un travail sans utilisateurs visibles. Tâche : je devais tout de même le livrer dans le trimestre, et je me suis rendu compte que je le repoussais sans cesse. Action : j'en ai parlé à mon manager, qui m'a expliqué que cette migration bloquait une mise à jour de sécurité pour toute l'entreprise. J'ai aussi découpé le travail en jalons hebdomadaires et automatisé les étapes de conversion les plus répétitives, ce qui l'a rendu plus intéressant. Résultat : nous avons terminé avec deux semaines d'avance, et le script que j'avais écrit a été réutilisé par deux autres équipes.",
    explanation:
      "Tout le monde perd sa motivation à un moment ou à un autre. Les recruteurs apprécient les personnes qui le remarquent, cherchent le sens du travail et agissent pour changer la situation au lieu de laisser leur travail en pâtir.",
    tips: ["Soyez honnête sur cette baisse de régime ; cela rend l'histoire crédible.", "Concentrez-vous sur les actions menées pour rebondir."],
    commonMistakes: ["Affirmer que vous êtes toujours motivé.", "Accuser l'entreprise sans décrire vos propres actions."],
    followUpQuestions: ["Quels signaux vous indiquent que vous perdez votre motivation ?", "Comment restez-vous motivé sur des projets longs ?"],
  },
  'gen-021': {
    question: "Où vous voyez-vous dans cinq ans ?",
    intent: "Le recruteur veut savoir si vos ambitions sont réalistes et compatibles avec le poste et l'entreprise.",
    expectedAnswer:
      "Dans cinq ans, j'aimerais être un ingénieur senior reconnu pour son expertise sur les applications à fort volume de données, quelqu'un sur qui l'équipe s'appuie pour les choix de conception. J'aimerais aussi avoir accompagné quelques développeurs juniors, car j'apprécie cette partie du métier. Je vois ce poste comme une étape importante dans cette direction, puisqu'il me permettrait de travailler sur des volumes de données bien plus importants qu'aujourd'hui.",
    explanation:
      "Le recruteur ne vous demande pas une prédiction précise. Il veut voir une direction cohérente avec le poste, qui laisse penser que vous resterez et progresserez. Mettre l'accent sur les compétences et l'impact plutôt que sur les titres rend la réponse crédible.",
    tips: ["Décrivez une direction en termes de compétences et d'impact.", "Reliez-la à ce que ce poste peut vous offrir."],
    commonMistakes: ["Dire que vous voulez le poste de votre interlocuteur.", "Décrire des objectifs que l'entreprise ne peut pas offrir, comme créer votre propre entreprise l'an prochain.", "Répondre « Je n'en ai aucune idée »."],
    followUpQuestions: ["Comment comptez-vous y parvenir ?", "Qu'est-ce qui vous ferait quitter un poste avant cela ?"],
  },
  'gen-022': {
    question: "Comment ce poste s'inscrit-il dans votre projet professionnel ?",
    intent: "Le recruteur veut voir que cette candidature est un choix réfléchi et non le fruit du hasard.",
    expectedAnswer:
      "Mon projet est de devenir un ingénieur à l'esprit produit, capable de mener une fonctionnalité de l'idée jusqu'à un résultat mesurable. Jusqu'ici, j'ai construit de solides bases techniques, mais j'ai toujours travaillé loin des décisions produit. Dans ce poste, les ingénieurs participent à la phase de découverte avec les product managers : c'est la pièce qui me manque. En retour, j'apporte une solide expérience des tests et de l'automatisation des mises en production, un domaine que vous cherchez à améliorer, d'après ce que j'ai vu.",
    explanation:
      "Cette réponse montre ce que le poste vous apporte et ce que vous apportez au poste. Cet échange rend l'adéquation équilibrée et crédible.",
    tips: ["Énoncez votre projet en une phrase.", "Nommez le manque que ce poste comble et ce que vous apportez en retour."],
    commonMistakes: ["Présenter le poste comme un simple tremplin temporaire.", "Parler uniquement de ce que vous allez y gagner."],
    followUpQuestions: ["Qu'est-ce qui ferait de ce poste une erreur pour vous ?", "Quelle compétence pensez-vous développer en premier ?"],
  },
  'gen-023': {
    question: "Êtes-vous intéressé par une évolution vers le management ?",
    intent: "Le recruteur veut savoir si vos aspirations correspondent aux parcours que propose l'entreprise, et si vous comprenez ce qu'implique le management.",
    expectedAnswer:
      "Oui, mais pas tout de suite. Depuis un an, j'ai commencé à assumer certaines responsabilités d'encadrement : je coordonne nos planifications de sprint et j'accompagne deux développeurs juniors, et j'aime aider les gens à progresser. Mais je sais aussi que le management est un autre métier, avec moins de travail opérationnel. Au cours des deux prochaines années, j'aimerais donc évoluer comme référent technique, puis décider, avec une vraie expérience, si le management d'équipe ou une filière d'expertise technique me convient le mieux.",
    explanation:
      "Une réponse honnête et nuancée est la meilleure. Montrer que vous comprenez la différence entre leadership technique et management d'équipe, et que vous l'avez déjà expérimentée à petite échelle, rend votre réponse réfléchie plutôt que motivée par un titre.",
    tips: ["Demandez quels parcours d'évolution l'entreprise propose, avant ou après votre réponse.", "Donnez des signes concrets d'expérience en leadership, s'il y en a."],
    commonMistakes: ["Répondre oui uniquement parce que cela paraît ambitieux.", "Écarter totalement le management pour un poste qui pourrait y mener."],
    followUpQuestions: ["Qu'est-ce qui vous semblerait le plus difficile dans le management d'une équipe ?", "Selon votre expérience, qu'est-ce qui fait un bon manager ?"],
  },
  'gen-024': {
    question: "Comment votre projet professionnel a-t-il évolué au fil du temps, et pourquoi ?",
    intent: "Le recruteur veut voir comment vous prenez vos décisions de carrière et si vous tirez des leçons de l'expérience.",
    expectedAnswer:
      "Situation : j'ai étudié le marketing et commencé ma carrière comme coordinateur de campagnes. Tâche : une partie de mon travail consistait à produire des rapports de performance hebdomadaires, et je me suis rendu compte que ce travail me plaisait davantage que les campagnes elles-mêmes. Action : j'ai suivi une formation en analyse de données en cours du soir, automatisé nos rapports avec SQL et proposé mon aide à d'autres équipes pour les leurs. Résultat : au bout d'un an, mon entreprise m'a confié un poste d'analyste junior, et je souhaite désormais continuer à progresser comme analyste de données, c'est pourquoi je postule ici.",
    explanation:
      "Les changements de cap sont normaux. Ce que les recruteurs recherchent, c'est la réflexion : remarquer ce qui vous plaît, le tester, puis agir. Un « pourquoi » clair transforme un parcours sinueux en une histoire cohérente.",
    tips: ["Expliquez l'élément déclencheur de chaque changement.", "Montrez les étapes concrètes que vous avez franchies, pas seulement la décision."],
    commonMistakes: ["Présenter vos changements comme aléatoires ou subis.", "Vous excuser de ne pas avoir eu un parcours linéaire."],
    followUpQuestions: ["Votre premier métier vous manque-t-il en quoi que ce soit ?", "Qu'est-ce qui vous ferait changer de direction à nouveau ?"],
  },
  'gen-025': {
    question: "Comment mesurez-vous votre propre évolution professionnelle ?",
    intent: "Le recruteur évalue votre autonomie et vérifie si vous suivez vos progrès à partir de preuves plutôt que de ressentis.",
    expectedAnswer:
      "J'utilise trois types de signaux. Le premier est le périmètre : la taille et le degré d'ambiguïté des problèmes qu'on me confie. Il y a deux ans, on me donnait des tickets bien définis ; aujourd'hui, on me demande de cadrer les problèmes avant qu'ils ne deviennent des tickets. Le deuxième est l'impact : je tiens un document simple avec les résultats de mes principaux projets, comme les économies réalisées, le temps gagné ou les incidents évités, que je relis chaque trimestre. Le troisième est le feedback : deux fois par an, je demande à deux ou trois collègues une chose que je devrais continuer à faire et une chose que je devrais changer. Quand les trois signaux vont dans le bon sens, je sais que je progresse ; quand l'un stagne, j'en parle avec mon manager et j'ajuste mes objectifs.",
    explanation:
      "On attend des candidats expérimentés qu'ils prennent en main leur développement. Combiner niveau de responsabilité, impact mesurable et feedback structuré montre une approche mature, fondée sur des preuves, qui aide aussi les managers à vous accompagner.",
    tips: ["Mentionnez au moins une habitude concrète de suivi.", "Montrez comment vous réagissez lorsque vos progrès stagnent."],
    commonMistakes: ["Mesurer votre évolution uniquement par les intitulés de poste ou le salaire.", "N'avoir aucune méthode."],
    followUpQuestions: ["Que vous a appris votre dernier cycle de feedback ?", "Comment pourrions-nous accompagner cette évolution ici ?"],
  },
  'gen-026': {
    question: "Parlez-moi d'une compétence que vous avez apprise seul pour faire avancer votre carrière.",
    intent: "Le recruteur veut des preuves de votre esprit d'initiative et de votre capacité à apprendre sans qu'on vous le demande.",
    expectedAnswer:
      "Situation : dans mon poste au support, je passais des heures chaque semaine à recopier des données d'un système à l'autre. Tâche : personne n'avait le temps de l'automatiser, j'ai donc décidé d'apprendre suffisamment de scripting pour le faire moi-même. Action : j'ai suivi un cours gratuit de Python pendant six semaines, je me suis entraîné sur de petites copies de nos fichiers et j'ai demandé à un développeur de relire mon script avant de l'utiliser sur des données réelles. Résultat : la tâche hebdomadaire est passée de quatre heures à quinze minutes, on m'a demandé d'automatiser deux autres processus, et cette expérience m'a aidé à évoluer vers mon poste actuel de développeur junior.",
    explanation:
      "Les histoires d'autoformation révèlent la curiosité, la discipline et le sens des responsabilités. Les recruteurs apprécient particulièrement celles où l'apprentissage a résolu un vrai problème et ouvert de nouvelles opportunités.",
    tips: ["Expliquez pourquoi vous avez choisi de l'apprendre.", "Mentionnez comment vous avez vérifié que votre travail était correct.", "Montrez l'impact sur votre carrière."],
    commonMistakes: ["Énumérer des formations en ligne sans montrer comment vous avez utilisé la compétence.", "Choisir une compétence sans lien avec le travail sans expliquer son intérêt."],
    followUpQuestions: ["Qu'êtes-vous en train d'apprendre en ce moment ?", "Comment restez-vous à jour dans votre domaine ?"],
  },
  'gen-027': {
    question: "Que savez-vous de notre entreprise ?",
    intent: "Le recruteur évalue votre préparation et vérifie si votre intérêt est sincère.",
    expectedAnswer:
      "Vous développez un logiciel de prise de rendez-vous pour les cliniques, principalement en Europe, et vous avez connu une forte croissance ces deux dernières années, avec notamment le lancement des rappels patients par SMS. J'ai lu que vous vous étendez désormais aux hôpitaux, ce qui implique des exigences plus strictes en matière de fiabilité et de protection des données. J'ai aussi vu sur votre page carrières que les équipes sont organisées par domaine produit, avec beaucoup d'autonomie. C'est ce qui m'intéresse : l'impact de votre produit sur la santé au quotidien et votre manière d'organiser le travail.",
    explanation:
      "Les recruteurs attendent que vous connaissiez l'essentiel (ce que vend l'entreprise, à qui, son actualité récente) et que vous montriez pourquoi cela compte pour vous. Terminer par votre intérêt personnel transforme vos recherches en motivation.",
    tips: ["Consultez le site, l'actualité récente, les avis sur le produit et l'offre d'emploi.", "Mentionnez une évolution récente et ce qui vous y intéresse."],
    commonMistakes: ["Réciter l'historique de l'entreprise tel qu'il figure sur le site.", "Ne rien savoir au-delà de l'intitulé du poste."],
    followUpQuestions: ["Selon vous, quel est notre plus grand défi ?", "Avez-vous utilisé notre produit ?"],
  },
  'gen-028': {
    question: "Selon vous, quels sont nos principaux concurrents, et comment nous situons-nous par rapport à eux ?",
    intent: "Le recruteur veut voir si vous comprenez le marché de l'entreprise et si vous savez raisonner comme quelqu'un qui y travaille.",
    expectedAnswer:
      "D'après ce que j'ai vu, vos principaux concurrents sont, d'un côté, les grandes plateformes RH tout-en-un et, de l'autre, quelques start-ups spécialisées dans la paie. Les grandes plateformes l'emportent sur l'étendue fonctionnelle, mais leurs avis évoquent souvent une mise en place complexe. Les start-ups sont moins chères, mais plus faibles sur la conformité dans plusieurs pays. Vous semblez positionnés entre les deux : plus simples que les grandes plateformes et plus solides sur la conformité multi-pays. Le risque que je vois, c'est que les grands acteurs améliorent leur onboarding, si bien que la simplicité d'utilisation seule pourrait ne pas suffire longtemps. Je serais curieux de connaître votre point de vue.",
    explanation:
      "On n'attend pas de vous une analyse d'expert, mais une vision structurée du marché témoigne d'un sens des affaires. Conclure par une question transforme la réponse en conversation et montre de l'humilité.",
    tips: ["Regroupez les concurrents par type au lieu de citer des noms.", "Mentionnez une force et un risque.", "Invitez le recruteur à donner son point de vue."],
    commonMistakes: ["Critiquer durement les concurrents.", "Faire des suppositions sans aucune recherche."],
    followUpQuestions: ["Que feriez-vous pour garder une longueur d'avance ?", "Quel produit concurrent avez-vous essayé ?"],
  },
  'gen-029': {
    question: "Dans quel type d'environnement de travail préférez-vous évoluer ?",
    intent: "Le recruteur vérifie si vous serez à l'aise et efficace dans l'environnement réel de l'entreprise.",
    expectedAnswer:
      "Je donne le meilleur de moi-même dans un environnement où les objectifs sont clairs, mais où chacun est libre de choisir comment les atteindre. J'apprécie une communication régulière et informelle, par exemple de courts échanges dès qu'un point est flou, plutôt que d'attendre une réunion hebdomadaire. J'ai aussi appris à bien travailler à distance. D'après ce que vous m'avez décrit de vos équipes, avec des objectifs trimestriels clairs et beaucoup d'autonomie, cela me semble me correspondre.",
    explanation:
      "La meilleure réponse est honnête et reliée à ce que vous savez de l'entreprise. Décrire vos préférences en termes de conditions qui vous permettent de bien travailler, plutôt que de ce qui vous déplaît, garde un ton positif.",
    tips: ["Renseignez-vous sur la culture de l'entreprise avant l'entretien.", "Décrivez ce qui vous aide à être performant, pas seulement ce que vous aimez."],
    commonMistakes: ["Décrire un environnement à l'opposé de celui de l'entreprise.", "Dire que vous pouvez vous adapter à tout sans exprimer la moindre préférence."],
    followUpQuestions: ["Comment travaillez-vous lorsque les objectifs ne sont pas clairs ?", "Quel environnement avez-vous trouvé difficile ?"],
  },
  'gen-030': {
    question: "Décrivez la meilleure équipe dans laquelle vous avez travaillé. Qu'est-ce qui la faisait fonctionner ?",
    intent: "Le recruteur veut comprendre quelles pratiques d'équipe vous valorisez et si vous contribuez à les mettre en place.",
    expectedAnswer:
      "Situation : ma meilleure équipe était un groupe de cinq personnes qui développait une nouvelle fonctionnalité de paiement avec un délai serré. Tâche : nous devions livrer en trois mois tout en nous intégrant avec une banque avec laquelle nous n'avions jamais travaillé. Action : ce qui a fait la différence, c'était une répartition très claire des responsabilités, un court point quotidien où chacun disait ouvertement lorsqu'il était bloqué, et l'habitude de relire le travail des autres le jour même. Ma propre contribution a été de mettre en place un environnement de test partagé avec la banque pour que chacun puisse tester sans attendre. Résultat : nous avons lancé dans les temps, sans bug critique, et nous avons conservé ces habitudes sur les projets suivants.",
    explanation:
      "Cette question révèle votre vision d'une équipe saine. Nommer des pratiques précises, et votre contribution à celles-ci, montre que vous comprenez ce qui rend une équipe efficace et que vous participez à le construire.",
    tips: ["Nommez deux ou trois pratiques précises.", "Expliquez votre propre contribution à la réussite de l'équipe."],
    commonMistakes: ["Dire seulement que « tout le monde s'entendait bien ».", "Décrire l'équipe sans préciser votre rôle."],
    followUpQuestions: ["Qu'apporteriez-vous de cette équipe à la nôtre ?", "Parlez-moi d'une équipe qui ne fonctionnait pas."],
  },
  'gen-031': {
    question: "Si vous nous rejoigniez, que changeriez-vous dans notre produit ?",
    intent: "Le recruteur veut évaluer votre esprit critique, votre préparation et le tact avec lequel vous formulez une critique.",
    expectedAnswer:
      "Je me garderais de changer quoi que ce soit avant de comprendre vos données et vos contraintes, donc prenez ceci comme une première impression. Je me suis inscrit à l'essai gratuit, et l'onboarding m'a pris une quinzaine de minutes avant de pouvoir créer mon premier projet ; plusieurs avis mentionnent la même chose. J'aimerais regarder à quelle étape les utilisateurs abandonnent pendant l'inscription et tester un parcours plus court, par exemple en créant automatiquement un projet d'exemple. J'ai aussi remarqué que l'application mobile ne propose pas de mode hors ligne, ce qui pourrait compter pour vos clients qui interviennent sur le terrain. Je serais curieux de savoir si ces points correspondent à ce que constate votre équipe.",
    explanation:
      "À un niveau avancé, les recruteurs attendent des suggestions concrètes et argumentées, fondées sur un usage réel et sur des données, formulées avec humilité. Proposer une façon de vérifier votre idée montre une approche orientée produit et fondée sur les faits.",
    tips: ["Utilisez réellement le produit avant l'entretien.", "Présentez vos suggestions comme des hypothèses à tester.", "Demandez si vos observations rejoignent les leurs."],
    commonMistakes: ["Dire que tout est parfait.", "Critiquer durement sans comprendre les contraintes."],
    followUpQuestions: ["Comment mesureriez-vous l'efficacité de ce changement ?", "Que prioriseriez-vous en premier ?"],
  },
  'gen-032': {
    question: "Qu'attendez-vous d'un manager ?",
    intent: "Le recruteur évalue la façon dont vous aimez être managé et si elle correspond au style de management de l'équipe.",
    expectedAnswer:
      "J'apprécie un manager qui fixe des attentes claires puis me laisse de l'autonomie, tout en restant disponible quand je suis bloqué. Des retours réguliers et honnêtes comptent beaucoup pour moi ; mon meilleur manager organisait un court point individuel toutes les deux semaines et me disait directement ce que je pouvais améliorer, ce qui m'a permis de progresser rapidement. J'apprécie aussi un manager qui explique les raisons derrière les priorités, pour que je puisse prendre de bonnes décisions par moi-même.",
    explanation:
      "Les recruteurs posent souvent cette question pour vérifier l'adéquation avec le futur manager. Une bonne réponse se concentre sur les comportements qui vous aident à être performant, illustrés par un exemple réel, sans décrire un idéal impossible.",
    tips: ["Décrivez des comportements, pas une personnalité.", "Donnez l'exemple d'un manager qui vous a aidé."],
    commonMistakes: ["Décrire uniquement ce qui vous déplaisait chez d'anciens managers.", "Demander à ne pas être encadré du tout."],
    followUpQuestions: ["Comment préférez-vous recevoir du feedback ?", "Parlez-moi d'un manager avec qui vous avez eu des difficultés."],
  },
  'gen-033': {
    question: "Selon vous, quel sera le plus grand défi de ce poste ?",
    intent: "Le recruteur veut voir si vous comprenez le poste en profondeur et si vous avez un plan réaliste pour en surmonter les difficultés.",
    expectedAnswer:
      "D'après l'offre et notre échange, je pense que le plus grand défi sera de concilier les nouvelles fonctionnalités avec la fiabilité d'une plateforme qui a grandi très vite. Vous avez mentionné que les incidents ont augmenté alors que l'équipe a doublé, ce qui signifie généralement que le partage des connaissances n'a pas suivi le rythme. Je commencerais par comprendre d'où viennent les incidents, puis je proposerais des améliorations petites et régulières, comme de meilleures alertes ou des procédures d'exploitation, en parallèle du travail sur les fonctionnalités, plutôt qu'un grand projet séparé. J'ai déjà fait quelque chose de similaire, lorsque j'ai contribué à réduire de moitié les incidents hebdomadaires en deux trimestres. Je voudrais convenir de cet équilibre avec mon manager dès le début.",
    explanation:
      "Cette question récompense les candidats qui ont écouté pendant l'entretien et savent relier la situation de l'entreprise à un plan réaliste. Mentionner une expérience passée pertinente prouve que vous êtes capable de relever ce défi.",
    tips: ["Utilisez des informations recueillies pendant l'entretien lui-même.", "Proposez une approche, pas seulement un diagnostic.", "Appuyez-la par une expérience passée similaire."],
    commonMistakes: ["Citer un défi générique comme « prendre en main les outils ».", "Citer un défi sans aucun plan."],
    followUpQuestions: ["De quoi auriez-vous besoin de la part de l'équipe pour y répondre ?", "Combien de temps faudrait-il pour voir des résultats ?"],
  },
  'gen-034': {
    question: "Comment organisez-vous votre journée de travail ?",
    intent: "Le recruteur veut comprendre vos habitudes de planification et la façon dont vous conciliez travail concentré et interruptions.",
    expectedAnswer:
      "Je commence par passer en revue mes tâches et choisir la ou les deux qui comptent le plus pour la journée. Je réserve mes matinées au travail de concentration, car c'est le moment où je suis le plus efficace, et je regroupe autant que possible les réunions et les messages l'après-midi. Je garde une courte liste de petites tâches pour les créneaux entre deux réunions. En fin de journée, je prends cinq minutes pour noter ce qui reste à faire, afin de redémarrer rapidement le lendemain matin. Quand une urgence survient, je vérifie si elle ne peut vraiment pas attendre et, si c'est le cas, je préviens les personnes concernées de ce qui sera décalé.",
    explanation:
      "Les recruteurs recherchent une méthode réfléchie, pas la perfection. Montrer comment vous protégez votre concentration, gérez les interruptions et communiquez sur les changements prouve votre fiabilité.",
    tips: ["Décrivez une routine réelle, y compris votre façon de gérer les demandes urgentes.", "Mentionnez un outil ou une habitude que vous utilisez vraiment."],
    commonMistakes: ["Dire que vous vous laissez simplement « porter par le courant ».", "Décrire une routine rigide qui ignore le travail d'équipe."],
    followUpQuestions: ["Que faites-vous lorsque deux demandes urgentes arrivent en même temps ?", "Comment gérez-vous des interruptions constantes ?"],
  },
  'gen-035': {
    question: "Comment gérez-vous le stress et la pression ?",
    intent: "Le recruteur veut savoir si vous restez efficace sous pression et si vous avez des moyens sains d'y faire face.",
    expectedAnswer:
      "J'essaie de transformer la pression en plan d'action. Lorsque nous avons dû corriger un problème de données avant la clôture mensuelle d'un client, j'ai listé ce qui devait absolument être fait, j'ai validé les priorités avec mon responsable et j'ai envoyé au client de courts points d'avancement deux fois par jour pour que personne n'ait à nous relancer. Décomposer le problème m'aide à rester calme. En dehors du travail, une pratique sportive régulière m'aide à récupérer. J'ai aussi appris à signaler tôt lorsque la pression vient d'un planning irréaliste, plutôt que de travailler tard tous les soirs sans rien dire.",
    explanation:
      "Une bonne réponse montre une méthode (prioriser, communiquer) et des limites saines. Les recruteurs se méfient des candidats qui prétendent ne jamais ressentir de stress, ou qui n'y font face qu'en travaillant plus longtemps.",
    tips: ["Illustrez votre réponse par un court exemple réel.", "Montrez à la fois comment vous agissez sur le moment et comment vous prévenez l'épuisement."],
    commonMistakes: ["Prétendre ne jamais ressentir de stress.", "Présenter les longues heures de travail comme votre seule solution."],
    followUpQuestions: ["Parlez-moi d'une fois où le stress a affecté votre travail.", "Comment aidez-vous vos collègues sous pression ?"],
  },
  'gen-036': {
    question: "Préférez-vous travailler seul ou en équipe ?",
    intent: "Le recruteur veut voir si vous êtes à l'aise dans les deux cas, et comment vous choisissez le mode adapté à chaque tâche.",
    expectedAnswer:
      "J'apprécie les deux, et je pense qu'un bon travail a besoin des deux. J'aime travailler seul sur les tâches qui demandent une concentration profonde, comme le débogage d'un problème complexe ou la rédaction d'un document de conception. Mais je préfère discuter de l'approche avec l'équipe en amont et recueillir des retours ensuite, car cela permet de repérer les erreurs tôt. Dans mon poste actuel, par exemple, je rédige une courte proposition, je la partage pour recueillir des commentaires, j'y travaille seul quelques jours, puis je demande une relecture.",
    explanation:
      "C'est rarement une question piège : la plupart des postes demandent les deux. La meilleure réponse montre que vous savez choisir le bon mode selon la tâche et que la collaboration fait partie de votre façon habituelle de travailler.",
    tips: ["Évitez les réponses extrêmes.", "Décrivez comment vous combinez les deux en pratique."],
    commonMistakes: ["Dire que vous n'aimez pas le travail en équipe.", "Dire que vous ne pouvez pas travailler sans soutien constant."],
    followUpQuestions: ["Comment restez-vous en lien avec l'équipe lorsque vous travaillez seul ?", "Que faites-vous lorsque l'équipe n'est pas d'accord avec votre approche ?"],
  },
  'gen-037': {
    question: "Comment réagissez-vous aux critiques sur votre travail ?",
    intent: "Le recruteur vérifie si vous savez recevoir du feedback sans vous mettre sur la défensive et si vous vous en servez pour progresser.",
    expectedAnswer:
      "J'essaie de considérer une critique comme une information. Ma première réaction est de m'assurer que je la comprends, donc je demande un exemple concret. Un jour, par exemple, un collègue senior m'a dit que mes revues de code étaient trop lentes. Je lui ai demandé ce que « trop lentes » signifiait pour l'équipe, et j'ai appris que les gens attendaient deux jours mes relectures. J'ai commencé à réserver trente minutes chaque matin aux revues, et en une semaine le délai moyen est passé sous la journée. Si je ne suis pas d'accord avec un retour, je le dis calmement en donnant mes raisons, mais je le prends toujours en considération d'abord.",
    explanation:
      "Les recruteurs recherchent des personnes ouvertes au feedback, mais pas passives. Demander des précisions, agir en conséquence et savoir exprimer un désaccord avec respect montre de la maturité.",
    tips: ["Donnez un exemple réel où un retour a changé votre comportement.", "Montrez que vous savez aussi exprimer un désaccord de façon constructive."],
    commonMistakes: ["Dire que vous ne recevez jamais de critiques.", "Décrire uniquement des retours de votre manager, jamais de vos pairs."],
    followUpQuestions: ["Parlez-moi d'un retour avec lequel vous n'étiez pas d'accord.", "Comment formulez-vous un feedback critique à d'autres personnes ?"],
  },
  'gen-038': {
    question: "Comment abordez-vous une tâche que vous n'avez jamais réalisée ?",
    intent: "Le recruteur veut découvrir votre façon d'apprendre et la manière dont vous gérez les risques lorsque l'expérience vous manque.",
    expectedAnswer:
      "Je commence par clarifier l'objectif et ce que signifie « terminé », pour ne pas apprendre des choses inutiles. Ensuite, je cherche les connaissances existantes : la documentation, un collègue qui a fait quelque chose de similaire ou un exemple dans notre code. Je construis un petit prototype pour vérifier ma compréhension avant de m'engager dans le vrai travail, et je partage tôt mon plan avec une personne expérimentée. Par exemple, la première fois que j'ai dû intégrer un prestataire de paiement, j'ai construit une intégration de test en une journée, je l'ai montrée à notre tech lead et nous avons repéré une erreur de sécurité bien avant qu'elle n'approche la production.",
    explanation:
      "Cette question évalue votre agilité d'apprentissage. Une approche structurée (clarifier, se documenter, prototyper, obtenir des retours tôt) montre que vous pouvez prendre en charge de nouvelles tâches rapidement et en toute sécurité.",
    tips: ["Décrivez une méthode reproductible, puis donnez un exemple.", "Précisez à quel moment vous demandez de l'aide."],
    commonMistakes: ["Dire que vous vous débrouilleriez seul sans demander à personne.", "Attendre une formation complète avant de commencer."],
    followUpQuestions: ["Comment savez-vous qu'il est temps de demander de l'aide ?", "Parlez-moi d'une nouvelle tâche qui s'est mal passée."],
  },
  'gen-039': {
    question: "Comment tenez-vous les parties prenantes informées et alignées sur un projet long ?",
    intent: "Le recruteur évalue votre communication avec des interlocuteurs de haut niveau ou non techniques, et votre capacité à éviter les mauvaises surprises.",
    expectedAnswer:
      "Je définis tôt ce que chaque groupe a besoin de savoir, et à quelle fréquence. Sur mon dernier projet, une migration de six mois, le sponsor côté direction voulait une courte synthèse mensuelle centrée sur les risques et les dates, tandis que l'équipe des opérations avait besoin chaque semaine du détail de ce qui allait changer pour elle. J'ai mis en place un point d'avancement d'une page avec un code couleur simple, et je me suis fixé une règle : annoncer les mauvaises nouvelles dès que je les connais, avec une solution proposée. Lorsqu'un retard fournisseur nous a fait perdre trois semaines, le sponsor l'a appris par moi le jour même, avec deux options pour rattraper le retard. Grâce à cela, ce retard n'a pas entamé la confiance, et le projet s'est terminé avec le périmètre initial.",
    explanation:
      "À un niveau avancé, communiquer consiste à adapter l'information à chaque public et à gérer les attentes, en particulier quand les choses tournent mal. Annoncer tôt les mauvaises nouvelles, accompagnées d'options, est ce qui construit la crédibilité.",
    tips: ["Expliquez comment vous adaptez le format à chaque public.", "Montrez comment vous gérez les mauvaises nouvelles."],
    commonMistakes: ["Envoyer le même rapport détaillé à tout le monde.", "Cacher les problèmes jusqu'à ce qu'ils deviennent des crises."],
    followUpQuestions: ["Que faites-vous lorsqu'une partie prenante ignore vos points d'avancement ?", "Comment gérez-vous des priorités contradictoires entre parties prenantes ?"],
  },
  'gen-040': {
    question: "Que faites-vous en dehors du travail ?",
    intent: "Le recruteur veut apprendre à vous connaître en tant que personne et peut chercher les qualités que révèlent vos centres d'intérêt.",
    expectedAnswer:
      "Je joue dans une équipe de football amateur deux fois par semaine, ce qui me garde en forme et me rappelle à quel point une équipe dépend de la communication. Je suis aussi bénévole une fois par mois dans une association locale, où j'aide des personnes âgées à utiliser leur smartphone. C'est une bonne leçon de patience et d'explication simple de la technologie. Et j'aime cuisiner, en particulier essayer des recettes des pays où j'ai voyagé.",
    explanation:
      "Il n'existe pas de bon loisir. Les recruteurs recherchent l'authenticité, et parfois des qualités transférables. Une réponse courte et sincère, avec un léger lien avec le travail, suffit.",
    tips: ["Soyez sincère ; les recruteurs sentent quand une réponse est inventée.", "Restez bref et positif.", "Ne partagez que ce que vous êtes à l'aise de partager."],
    commonMistakes: ["Dire que vous n'avez le temps de rien faire en dehors du travail.", "Mentionner des activités qui pourraient faire douter de votre disponibilité."],
    followUpQuestions: ["Qu'avez-vous appris de cette activité ?", "Comment la conciliez-vous avec votre travail ?"],
  },
};
