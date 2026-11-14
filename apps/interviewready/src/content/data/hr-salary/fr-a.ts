import type { QuestionText, TextTable } from '@/types/content';

/**
 * Questions RH et salaire 001-020. Les règles de rémunération et les préavis varient selon le pays et le contrat :
 * les réponses restent générales et invitent à vérifier les règles locales.
 */
export const frA: TextTable<QuestionText> = {
  'hr-001': {
    question: "Quelles sont vos prétentions salariales ?",
    intent: "Le recruteur veut savoir si vos attentes correspondent au budget prévu pour le poste et si vous avez une vision réaliste du marché.",
    expectedAnswer:
      "D'après mes recherches sur des postes similaires dans cette ville et compte tenu de mes quatre ans d'expérience, je vise une rémunération fixe de 52 000 à 58 000 € par an. Cela dit, je reste ouvert selon l'ensemble du package, par exemple le variable, le télétravail ou le budget formation, et selon le périmètre du poste. Pourriez-vous me dire quelle fourchette vous avez prévue pour ce poste ?",
    explanation:
      "Donner une fourchette étayée montre que vous êtes préparé et professionnel, tandis que le fait d'évoquer le package global et de demander leur fourchette garde la discussion ouverte. Les chiffres ne sont ici qu'une illustration : utilisez ceux de votre propre marché.",
    tips: ["Renseignez-vous sur les salaires pour le même poste, le même niveau et la même zone géographique avant l'entretien.", "Donnez une fourchette dont vous accepteriez réellement le bas.", "Demandez la fourchette budgétée quand le moment s'y prête."],
    commonMistakes: ["Répondre « je ne sais pas » ou « ce que vous jugerez juste ».", "Annoncer une fourchette très au-dessus du marché sans la justifier.", "Placer le bas de la fourchette en dessous de ce dont vous avez réellement besoin."],
    followUpQuestions: ["Cette fourchette est-elle négociable ?", "Quel est l'élément du package le plus important pour vous ?"],
  },
  'hr-002': {
    question: "Quel est votre salaire actuel ?",
    intent: "Le recruteur cherche un point de référence pour son offre, ce qui peut ancrer la négociation sur votre rémunération passée plutôt que sur la valeur du nouveau poste.",
    expectedAnswer:
      "Je préférerais me concentrer sur la valeur de ce poste plutôt que sur ma rémunération actuelle, car les responsabilités sont assez différentes. Au vu du périmètre que vous avez décrit et des données du marché, je vise une fourchette de 52 000 à 58 000 €. Si cela peut vous aider, je peux préciser que mon package actuel comprend une prime et un budget formation, que je prendrai aussi en compte pour comparer les offres.",
    explanation:
      "Dans certains pays ou certaines régions, les employeurs n'ont pas le droit de demander l'historique de rémunération : vérifiez les règles applicables chez vous. Recentrer poliment la discussion sur vos prétentions la maintient sur la valeur du nouveau poste. Si vous choisissez de communiquer votre salaire, soyez honnête et mentionnez l'ensemble du package.",
    tips: ["Vérifiez si les questions sur le salaire passé sont autorisées là où vous vivez.", "Ramenez poliment la discussion vers la fourchette que vous visez.", "N'inventez jamais un salaire actuel plus élevé."],
    commonMistakes: ["Mentir sur votre salaire actuel.", "Refuser de répondre sur un ton défensif."],
    followUpQuestions: ["Pourquoi demandez-vous plus que ce que vous gagnez aujourd'hui ?", "De quels avantages bénéficiez-vous actuellement ?"],
  },
  'hr-003': {
    question: "Un formulaire de candidature en ligne exige vos prétentions salariales avant tout entretien. Que saisissez-vous ?",
    intent: "Cette situation teste votre capacité à gérer tôt la question du salaire sans vous exclure ni vous sous-évaluer.",
    expectedAnswer:
      "Je commencerais par me renseigner sur le salaire du marché pour ce poste, puis je saisirais une fourchette réaliste, ou un chiffre unique situé dans le haut-milieu de ce que j'accepterais si le formulaire n'autorise qu'une valeur. S'il y a un champ libre, j'écrirais par exemple : « Ouvert à la discussion selon le package global ; la fourchette du marché pour ce poste est de 50 000 à 58 000 €. » J'évite de saisir zéro ou un chiffre irréaliste, car des filtres automatiques pourraient écarter ma candidature.",
    explanation:
      "Les champs de salaire demandés tôt servent souvent au tri des candidatures. Une valeur réaliste et étayée vous maintient dans le processus tout en laissant de la marge pour négocier plus tard.",
    tips: ["Croisez plusieurs sources de données salariales pour la zone géographique et le niveau visés.", "Utilisez les champs libres pour montrer votre flexibilité."],
    commonMistakes: ["Saisir un chiffre très bas pour éviter d'être filtré.", "Saisir 0 ou 999999 pour contourner le champ."],
    followUpQuestions: ["Pouvez-vous négocier au-dessus du chiffre saisi ?", "Et si l'offre d'emploi indique déjà une fourchette ?"],
  },
  'hr-004': {
    question: "Comment avez-vous déterminé vos prétentions salariales ?",
    intent: "Le recruteur veut vérifier que vos attentes reposent sur des éléments concrets et non sur des souhaits.",
    expectedAnswer:
      "J'ai consulté plusieurs sources : les études de rémunération des cabinets de recrutement de mon secteur, les fourchettes publiées dans des offres pour des postes similaires dans cette ville et les données de sites de comparaison de salaires. J'ai aussi échangé avec deux personnes occupant des postes comparables. Ensuite, j'ai ajusté en fonction de mon expérience, cinq ans dont deux à encadrer une petite équipe, et des responsabilités décrites dans votre offre, comme la gestion de la plateforme de données. C'est ainsi que je suis arrivé à une fourchette de 60 000 à 66 000 € pour le fixe.",
    explanation:
      "Expliquer votre méthode rend votre chiffre crédible et plus difficile à écarter. Combiner des données externes avec le périmètre précis du poste montre un raisonnement orienté business.",
    tips: ["Citez des types de sources plutôt qu'un seul site web.", "Reliez votre fourchette aux responsabilités du poste."],
    commonMistakes: ["Fonder vos attentes uniquement sur ce que gagnent vos amis.", "Utiliser des données d'un autre pays ou d'un autre niveau sans les ajuster."],
    followUpQuestions: ["Comment valorisez-vous les avantages par rapport au salaire fixe ?", "Qu'est-ce qui vous ferait accepter le bas de votre fourchette ?"],
  },
  'hr-005': {
    question: "Notre budget pour ce poste est inférieur à vos attentes. Comment réagissez-vous ?",
    intent: "Le recruteur teste votre flexibilité, vos priorités et votre capacité à négocier de façon constructive.",
    expectedAnswer:
      "Merci pour votre transparence. Ce poste m'intéresse vraiment, j'aimerais donc comprendre s'il existe une marge de manœuvre sur d'autres éléments du package. Par exemple, un point de revue avec ajustement de salaire au bout de six mois, une prime à la signature, des jours de télétravail supplémentaires ou un budget formation pourraient combler une partie de l'écart. Si le fixe ne peut vraiment pas bouger, pourriez-vous m'indiquer la fourchette complète du poste et ce qu'il faudrait pour en atteindre le haut ? Cela m'aiderait à prendre ma décision.",
    explanation:
      "Rester positif tout en explorant des alternatives préserve la relation et permet souvent de trouver des solutions. Connaître votre seuil minimum à l'avance vous permet de décider sereinement.",
    tips: ["Fixez votre seuil de refus avant la discussion.", "Explorez les éléments non salariaux et les revues futures.", "Demandez que les engagements soient confirmés par écrit."],
    commonMistakes: ["Accepter immédiatement par peur de perdre l'offre.", "Réagir avec agacement."],
    followUpQuestions: ["Quel est le minimum que vous accepteriez ?", "Quel avantage compte le plus pour vous ?"],
  },
  'hr-006': {
    question: "Vous déménagez dans un autre pays pour ce poste. Comment fixez-vous vos prétentions salariales ?",
    intent: "Le recruteur veut voir si vous comprenez que la rémunération dépend du marché local, du coût de la vie, de la fiscalité et des avantages.",
    expectedAnswer:
      "Je ne me contente pas de convertir mon salaire actuel, car les marchés, la fiscalité et les avantages sont très différents. J'ai étudié le marché local pour ce poste et ce niveau grâce aux études de rémunération et aux offres d'emploi de la ville, et j'ai comparé le net après impôts et cotisations sociales avec ma situation actuelle. J'ai aussi pris en compte le coût de la vie, en particulier le logement, ainsi que les avantages habituels ici, comme l'assurance santé ou les cotisations retraite, qui peuvent être inclus ou non. Sur cette base, je vise 70 000 à 76 000 € par an en contrat local. J'aimerais aussi parler de l'aide à la mobilité, comme les frais de déménagement, un logement temporaire et l'accompagnement pour le visa, qui compte beaucoup pour un tel changement.",
    explanation:
      "Une mobilité internationale exige de comparer la valeur globale après impôts et coût de la vie, et non des montants bruts. L'aide à la mobilité est un élément légitime du package, souvent négociable.",
    tips: ["Comparez le revenu net et le coût de la vie, pas seulement le salaire brut.", "Vérifiez quels avantages sont standard localement.", "Renseignez-vous sur l'aide à la mobilité proposée."],
    commonMistakes: ["Convertir votre salaire actuel au taux de change.", "Oublier les frais de visa, de déménagement et de logement."],
    followUpQuestions: ["Accepteriez-vous un contrat local plutôt qu'un package d'expatrié ?", "Combien de temps pouvez-vous attendre l'obtention d'un visa ?"],
  },
  'hr-007': {
    question: "L'offre comprend une part variable et des actions. Comment l'évaluez-vous ?",
    intent: "Le recruteur veut voir si vous comprenez une rémunération complexe et savez poser les bonnes questions.",
    expectedAnswer:
      "Je distinguerais ce qui est garanti de ce qui est conditionnel. Pour le variable, je demanderais comment il est calculé, s'il dépend d'objectifs individuels, d'équipe ou de l'entreprise, et combien a réellement été versé ces deux ou trois dernières années par rapport à la cible. Pour les actions, je demanderais de quel type il s'agit, par exemple des stock-options ou des actions gratuites, leur nombre et le pourcentage du capital qu'elles représentent, le calendrier d'acquisition (vesting) et la période minimale (cliff), ce qui se passe si je pars et, pour les options, le prix d'exercice et les conditions d'exercice. Pour une start-up non cotée, je considérerais les actions comme incertaines et les valoriserais avec prudence : le fixe doit donc couvrir à lui seul mes besoins. Je vérifierais aussi le traitement fiscal dans mon pays. Ensuite, je comparerais le total attendu sur trois à quatre ans avec les autres offres.",
    explanation:
      "La rémunération variable et les actions peuvent avoir de la valeur, mais elles comportent des risques. Poser des questions précises et valoriser prudemment les éléments incertains permet de mieux décider.",
    tips: ["Demandez l'historique des primes réellement versées, pas seulement les cibles.", "Clarifiez le vesting, le cliff et les conditions en cas de départ.", "Vérifiez le traitement fiscal local."],
    commonMistakes: ["Valoriser les actions d'une start-up comme si c'était de l'argent liquide.", "Accepter un fixe faible à cause d'un objectif de prime élevé."],
    followUpQuestions: ["Qu'est-ce qu'un cliff dans un plan d'acquisition d'actions ?", "Comment compareriez-vous cette offre avec une autre mieux payée en fixe ?"],
  },
  'hr-008': {
    question: "Nous aimerions vous faire une offre. Pouvez-vous accepter aujourd'hui ?",
    intent: "Le recruteur teste peut-être votre enthousiasme ou cherche à conclure vite ; il attend une réponse claire et professionnelle.",
    expectedAnswer:
      "Merci beaucoup, j'en suis vraiment ravi et je suis très intéressé à l'idée de rejoindre l'équipe. Avant de vous donner une réponse définitive, j'aimerais recevoir l'offre par écrit pour en examiner les détails, notamment la rémunération, les avantages et la date de prise de poste. Serait-il possible de vous répondre d'ici jeudi ? Si j'ai des questions d'ici là, je vous contacterai directement.",
    explanation:
      "Demander l'offre écrite et un délai court et précis est normal et bien perçu. Cela vous permet d'en examiner les détails et de négocier si nécessaire, sans paraître hésitant.",
    tips: ["Montrez d'abord votre enthousiasme.", "Demandez l'offre par écrit.", "Proposez un délai précis et raisonnable."],
    commonMistakes: ["Accepter oralement avant d'avoir vu les détails.", "Demander un délai sans échéance."],
    followUpQuestions: ["De quoi auriez-vous besoin pour accepter ?", "Attendez-vous d'autres offres ?"],
  },
  'hr-009': {
    question: "Comment négocieriez-vous une offre d'emploi de façon professionnelle ?",
    intent: "Cette question vérifie que vous savez défendre vos intérêts tout en préservant une bonne relation avec votre futur employeur.",
    expectedAnswer:
      "Je commence par remercier et confirmer mon intérêt, pour qu'il soit clair que la négociation porte sur des détails et non sur des doutes. Ensuite, je formule une demande claire et argumentée, par exemple : « Au vu des données du marché pour ce poste et de mon expérience sur les systèmes de paiement, que vous avez citée comme une priorité, j'espérais un fixe de 62 000 € plutôt que 57 000 €. » Puis je me tais et je laisse mon interlocuteur répondre. Si le salaire ne peut pas bouger, j'aborde des alternatives comme une prime à la signature, une revue salariale anticipée ou un budget formation supplémentaire. J'évite de multiplier les petites demandes en plusieurs rounds, et je demande l'accord final par écrit avant de démissionner de mon poste actuel.",
    explanation:
      "Une négociation efficace est courtoise, précise et fondée sur la valeur et les données. Formuler une demande claire puis écouter fonctionne mieux que de longues justifications ou des ultimatums.",
    tips: ["Confirmez votre intérêt avant de négocier.", "Formulez une demande précise et justifiée.", "Obtenez l'accord final par écrit."],
    commonMistakes: ["Négocier par petites demandes répétées sur plusieurs jours.", "Recourir aux menaces ou aux ultimatums.", "Démissionner avant d'avoir reçu l'offre écrite."],
    followUpQuestions: ["Et s'ils refusent de négocier ?", "Quel écart au-dessus de l'offre est-il raisonnable de demander ?"],
  },
  'hr-010': {
    question: "En dehors du salaire, quels éléments d'une offre négocieriez-vous ?",
    intent: "Le recruteur veut voir que vous comprenez la valeur globale d'un package et que vous connaissez vos propres priorités.",
    expectedAnswer:
      "Le salaire compte, mais le reste du package aussi. Selon l'entreprise, je regarderais la structure du variable, une prime à la signature, le nombre de jours de congé, le télétravail ou le travail hybride, les horaires flexibles, un budget pour les formations et certifications, l'intitulé du poste, la date de la première revue salariale, l'équipement, la mutuelle et les cotisations retraite, ainsi que la date de prise de poste. Personnellement, un budget formation clair et deux jours de télétravail par semaine ont beaucoup de valeur pour moi : je les mettrais en priorité si la fourchette salariale est figée.",
    explanation:
      "Beaucoup d'entreprises ont plus de marge sur les avantages que sur le salaire fixe. Connaître vos priorités vous permet de faire des compromis efficaces.",
    tips: ["Listez vos priorités avant la négociation.", "Demandez ce qui est négociable dans cette entreprise."],
    commonMistakes: ["Négocier uniquement sur le salaire fixe.", "Tout demander en même temps sans hiérarchiser."],
    followUpQuestions: ["Quel avantage est le plus important pour vous, et pourquoi ?", "Accepteriez-vous un salaire plus bas pour un poste en télétravail complet ?"],
  },
  'hr-011': {
    question: "Vous avez une autre offre. Comment la mentionner sans donner l'impression de bluffer ?",
    intent: "Le recruteur attend de l'honnêteté et du professionnalisme lorsque des offres concurrentes existent.",
    expectedAnswer:
      "Je la mentionnerais honnêtement, et seulement si elle est réelle : « Je souhaite être transparent : j'ai reçu une autre offre avec une réponse attendue vendredi. Votre entreprise est mon premier choix pour le produit et l'équipe, mais l'autre offre est environ 10 % plus élevée sur le fixe. Existe-t-il une marge de manœuvre qui m'aiderait à prendre ma décision en votre faveur ? » Je ne dévoilerais pas d'informations confidentielles sur l'autre entreprise et je n'exagérerais pas les chiffres. Si elle ne peut pas s'aligner, je déciderais en fonction de l'adéquation globale, pas seulement de l'argent.",
    explanation:
      "Une offre concurrente réelle est une information légitime. La présenter avec transparence et une préférence claire incite l'employeur à réagir sans se sentir manipulé.",
    tips: ["Ne mentionnez que des offres qui existent vraiment.", "Indiquez votre préférence et l'échéance.", "Gardez confidentiels les détails de l'autre entreprise."],
    commonMistakes: ["Inventer une offre concurrente.", "Lancer une surenchère entre entreprises."],
    followUpQuestions: ["Que feriez-vous s'ils s'alignaient sur l'autre offre ?", "Qu'est-ce qui compte plus pour vous que le salaire ?"],
  },
  'hr-012': {
    question: "L'employeur affirme qu'il s'agit de son offre définitive. Que faites-vous ?",
    intent: "Le recruteur veut voir si vous êtes capable de prendre une décision avec calme et professionnalisme.",
    expectedAnswer:
      "Je la prendrais au pied de la lettre et j'évaluerais l'offre telle qu'elle est, au regard de mes priorités et de mon minimum. Si elle répond à mes besoins, j'accepterais de bonne grâce, en posant éventuellement une petite question non salariale, par exemple pour confirmer la date du premier entretien annuel. Sinon, je les remercierais et déclinerais poliment en expliquant que le package ne correspond pas à mes attentes pour le moment, tout en gardant la porte ouverte : « J'ai vraiment apprécié de rencontrer l'équipe, et je serais heureux de rester en contact. » Je ne continuerais pas à insister après une réponse définitive claire, car cela abîme la relation.",
    explanation:
      "Respecter une offre définitive est un signe de maturité. Décider par rapport à un minimum fixé à l'avance évite les décisions émotionnelles.",
    tips: ["Fixez votre minimum avant de négocier.", "Acceptez ou déclinez de façon claire et courtoise."],
    commonMistakes: ["Continuer à négocier après une offre définitive.", "Accepter une offre que vous regretterez."],
    followUpQuestions: ["Qu'est-ce qui vous ferait décliner une offre qui vous plaît ?", "Comment décliner sans couper les ponts ?"],
  },
  'hr-013': {
    question: "Comment demanderiez-vous une augmentation à votre employeur actuel ?",
    intent: "Le recruteur évalue votre capacité à construire un argumentaire business et à négocier avec un manager avec qui vous continuerez à travailler.",
    expectedAnswer:
      "Je préparerais un dossier fondé sur la valeur apportée et les données du marché, pas sur mes besoins personnels. D'abord, je listerais mes résultats de l'année écoulée, chiffres à l'appui, par exemple la migration que j'ai pilotée et qui a réduit les coûts d'infrastructure de 20 %, ainsi que les nouvelles responsabilités que j'ai prises, comme l'accompagnement de deux nouvelles recrues. Ensuite, je me renseignerais sur le salaire du marché pour mon poste et mes responsabilités. Puis je demanderais à mon manager un rendez-vous dédié, idéalement avant les arbitrages budgétaires, plutôt que d'aborder le sujet entre deux portes. Pendant l'entretien, je présenterais mes résultats et les données du marché, et je formulerais une demande précise : « J'aimerais que mon salaire passe à 64 000 € pour refléter mon périmètre actuel. » Si la réponse est non pour l'instant, je demanderais quels résultats la justifieraient, nous conviendrions d'une date pour en reparler et je confirmerais ce plan par écrit. J'éviterais de menacer de partir, sauf si j'y suis vraiment prêt.",
    explanation:
      "Une demande d'augmentation est un argumentaire business. Le bon timing, des preuves et une suite claire en cas de refus augmentent les chances de succès et préservent la relation.",
    tips: ["Préparez des résultats chiffrés et des données de marché.", "Calez votre demande sur le calendrier budgétaire.", "Convenez des prochaines étapes si la réponse est négative."],
    commonMistakes: ["Demander une augmentation pour vos dépenses personnelles plutôt que pour la valeur apportée.", "Brandir une offre concurrente comme une menace sans être prêt à partir."],
    followUpQuestions: ["Et si votre manager vous répond qu'il n'y a pas de budget ?", "À quelle fréquence est-il raisonnable de demander une augmentation ?"],
  },
  'hr-014': {
    question: "Comment acceptez-vous ou déclinez-vous une offre d'emploi de façon professionnelle ?",
    intent: "Le recruteur veut voir une communication professionnelle en fin de processus, car elle influence votre réputation.",
    expectedAnswer:
      "Pour accepter, je répondrais rapidement, je remercierais, je confirmerais les conditions clés comme le salaire, l'intitulé du poste et la date de prise de poste, et je demanderais quelles sont les prochaines étapes, comme le contrat et l'intégration. J'attendrais le contrat signé avant de démissionner de mon poste actuel. Pour décliner, j'appellerais ou j'écrirais peu après ma décision, je remercierais le recruteur et l'équipe pour leur temps, je donnerais une raison brève et honnête sans critique, par exemple que j'ai accepté un poste plus proche de mes objectifs à long terme, et je dirais que je serais ravi de rester en contact. Les recruteurs se souviennent des candidats qui déclinent avec élégance.",
    explanation:
      "Une communication claire, rapide et courtoise protège votre réputation dans un milieu professionnel où tout se sait, et laisse la porte ouverte à de futures opportunités.",
    tips: ["Confirmez les conditions clés par écrit lorsque vous acceptez.", "Déclinez rapidement en donnant une raison brève."],
    commonMistakes: ["Ignorer le recruteur au lieu de décliner.", "Démissionner avant que le contrat soit signé."],
    followUpQuestions: ["Que feriez-vous si vous receviez une meilleure offre après avoir accepté ?", "Combien de temps faut-il prendre pour répondre à une offre ?"],
  },
  'hr-015': {
    question: "Quelle est la durée de votre préavis ?",
    intent: "Le recruteur doit planifier votre date d'arrivée et vérifier qu'elle correspond aux besoins de l'équipe.",
    expectedAnswer:
      "Mon contrat prévoit un préavis de deux mois. Je tiens à laisser mon équipe actuelle dans de bonnes conditions, donc j'utiliserais ce temps pour transmettre correctement mes projets. Si une arrivée plus tôt est importante pour vous, je peux demander à mon employeur s'il accepte de réduire une partie du préavis, mais je ne peux pas vous le promettre, car cela dépend de lui.",
    explanation:
      "Être clair et honnête sur votre préavis crée la confiance. La durée du préavis dépend du pays, du contrat et parfois de votre ancienneté : vérifiez votre propre contrat avant l'entretien.",
    tips: ["Vérifiez votre contrat et les règles locales avant l'entretien.", "Montrez que vous assurerez une passation de vos dossiers responsable."],
    commonMistakes: ["Minimiser votre préavis pour paraître plus attractif.", "Promettre de partir immédiatement sans avoir vérifié votre contrat."],
    followUpQuestions: ["Pourriez-vous commencer plus tôt ?", "Avez-vous des congés déjà prévus ?"],
  },
  'hr-016': {
    question: "Quand pourriez-vous commencer ?",
    intent: "Le recruteur veut une date de prise de poste réaliste pour organiser votre intégration.",
    expectedAnswer:
      "Si je reçois le contrat signé d'ici la fin du mois, je pourrais commencer le 1er mars, à l'issue de mon préavis d'un mois. J'ai aussi une semaine de congés prévue en avril, réservée il y a un moment ; j'aimerais la conserver, mais je suis prêt à en discuter si cela pose un problème à l'équipe.",
    explanation:
      "Une date de prise de poste précise et conditionnée, accompagnée de transparence sur les absences prévues, évite les malentendus par la suite.",
    tips: ["Calculez la date à partir de votre préavis.", "Mentionnez tôt les congés déjà prévus."],
    commonMistakes: ["Donner une réponse vague comme « bientôt ».", "Cacher des congés prévus jusqu'après la signature."],
    followUpQuestions: ["Cette date est-elle flexible ?", "Seriez-vous disponible pour un court échange d'intégration avant votre arrivée ?"],
  },
  'hr-017': {
    question: "Nous avons besoin que vous commenciez avant la fin de votre préavis. Est-ce possible ?",
    intent: "Le recruteur teste votre professionnalisme et votre intégrité sous la pression.",
    expectedAnswer:
      "Je comprends que le calendrier soit important pour vous. Je tiens à respecter mon contrat et à laisser mon équipe actuelle dans de bonnes conditions, je ne peux donc pas simplement partir plus tôt. En revanche, je peux demander à mon employeur s'il accepterait de raccourcir le préavis une fois ma passation terminée, et je pourrais poser des jours de congé restants à la fin. Je vous transmettrai sa réponse d'ici quelques jours. En attendant, si cela peut aider, je serais ravi de lire de la documentation ou de participer à une session de présentation en dehors de mes heures de travail.",
    explanation:
      "Les employeurs apprécient les candidats qui respectent leurs engagements, car ils feront de même avec eux. Proposer des options légitimes montre votre bonne volonté.",
    tips: ["Expliquez que vous respectez votre contrat.", "Proposez des alternatives légitimes, comme une négociation avec votre employeur."],
    commonMistakes: ["Accepter de rompre votre contrat.", "Refuser sans proposer la moindre solution."],
    followUpQuestions: ["Et si votre employeur refuse ?", "Accepteriez-vous de commencer à temps partiel avant votre arrivée officielle ?"],
  },
  'hr-018': {
    question: "Que feriez-vous si votre employeur actuel vous faisait une contre-offre ?",
    intent: "Le recruteur veut mesurer votre engagement et savoir si vous risquez de vous rétracter après avoir accepté.",
    expectedAnswer:
      "Je l'examinerais avec attention, mais ma décision de partir n'est pas d'abord une question d'argent. Je postule parce que je veux travailler sur le développement produit, ce que mon poste actuel ne permet pas. Donc, à moins qu'une contre-offre ne change le poste lui-même, je la déclinerais très probablement. Je serais aussi honnête avec vous : si j'accepte votre offre, j'ai l'intention de tenir parole, et je dirais clairement à mon employeur actuel que ma décision est définitive.",
    explanation:
      "Les contre-offres règlent rarement les raisons pour lesquelles on souhaite partir. Expliquer votre motivation au-delà de l'argent rassure le recruteur.",
    tips: ["Expliquez les vraies raisons de votre changement.", "Montrez que vous tenez vos engagements."],
    commonMistakes: ["Utiliser une nouvelle offre uniquement pour obtenir une augmentation de votre employeur actuel.", "Promettre de ne jamais envisager une contre-offre, ce qui peut sembler peu sincère."],
    followUpQuestions: ["Que devrait changer votre employeur actuel pour que vous restiez ?", "Avez-vous parlé de vos objectifs de carrière avec votre manager ?"],
  },
  'hr-019': {
    question: "Êtes-vous disponible pour des déplacements, des astreintes ou des heures supplémentaires ponctuelles ?",
    intent: "Le recruteur vérifie que vous comprenez les contraintes concrètes du poste et que vous pouvez vous y engager honnêtement.",
    expectedAnswer:
      "Oui, dans des limites raisonnables. Je comprends que le poste comprend une semaine d'astreinte par mois, ce que je fais déjà dans mon poste actuel, et cela me convient tant que la rotation est équitable et qu'il y a un soutien en cas d'incident. Je peux me déplacer quelques fois par trimestre pour des rendez-vous clients. Pour les heures supplémentaires, je suis prêt à fournir un effort supplémentaire lors des lancements ou des incidents ; je veux simplement m'assurer que cela reste exceptionnel et non le mode de fonctionnement habituel. Pourriez-vous me dire à quelle fréquence surviennent les incidents d'astreinte et comment l'équipe organise les temps de récupération ?",
    explanation:
      "Des réponses honnêtes sur votre disponibilité évitent les mauvaises surprises des deux côtés. Poser des questions sur la fréquence et la compensation montre votre professionnalisme, pas une réticence.",
    tips: ["Soyez honnête sur vos limites.", "Demandez à quelle fréquence cela arrive réellement et comment c'est compensé."],
    commonMistakes: ["Tout accepter et le regretter ensuite.", "Refuser toute flexibilité pour un poste qui l'exige clairement."],
    followUpQuestions: ["Comment les astreintes sont-elles rémunérées ici ?", "Quel est le déplacement le plus long que vous pourriez faire ?"],
  },
  'hr-020': {
    question: "Pourquoi souhaitez-vous vous reconvertir ?",
    intent: "Le recruteur veut comprendre si votre reconversion est réfléchie et durable, et non une fuite de votre emploi actuel.",
    expectedAnswer:
      "J'ai été professeur de mathématiques en collège et lycée pendant six ans, et ce que je préférais, c'était concevoir des outils de données pour que mon équipe pédagogique suive la progression des élèves. Avec le temps, j'ai compris que je voulais en faire mon métier à plein temps. J'ai suivi une formation en analyse de données cette dernière année, réalisé trois projets à partir de données publiques sur l'éducation, et je postule maintenant à des postes d'analyste junior où je pourrai associer mes compétences analytiques à mon expérience : expliquer des chiffres à des personnes qui ne sont pas expertes.",
    explanation:
      "Un récit de reconversion convaincant est positif : il montre un déclic clair, une préparation concrète et la manière dont votre expérience passée devient un atout dans le nouveau domaine.",
    tips: ["Mettez en avant ce qui vous attire, pas ce que vous fuyez.", "Montrez une préparation concrète : formation, projets, pratique.", "Reliez votre expérience passée au nouveau poste."],
    commonMistakes: ["Critiquer votre ancien métier.", "Présenter le changement comme un coup de tête."],
    followUpQuestions: ["Qu'est-ce qui vous manque de votre ancien métier ?", "Quelle a été la partie la plus difficile de cette transition ?"],
  },
};
