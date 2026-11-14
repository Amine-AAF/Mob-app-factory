import type { QuestionText, TextTable } from '@/types/content';

/** Questions RH et salaire 021-040 : reconversion, périodes d'inactivité, télétravail, questions à poser. */
export const frB: TextTable<QuestionText> = {
  'hr-021': {
    question: "En quoi les compétences de votre précédent métier sont-elles transférables à ce poste ?",
    intent: "Le recruteur veut que vous montriez concrètement pourquoi votre parcours est un atout plutôt qu'un manque.",
    expectedAnswer:
      "Pendant mes huit années en direction hôtelière, j'ai géré exactement le type de situations auxquelles fait face un customer success manager : des clients mécontents, des problèmes urgents qui demandaient une coordination entre plusieurs équipes, et des objectifs de satisfaction et de fidélisation. Par exemple, j'ai réduit de 35 % les avis négatifs en ligne en un an en mettant en place un suivi systématique après chaque réclamation. J'ai aussi encadré une équipe de douze personnes, préparé des reportings mensuels sur le taux d'occupation et le chiffre d'affaires, et formé le personnel à un nouveau logiciel de réservation. Dans ce poste, j'appliquerais ces mêmes compétences à des clients d'un éditeur de logiciels, tout en continuant à développer ma connaissance du produit, ce que j'ai déjà commencé avec vos formations en ligne.",
    explanation:
      "Traduire votre expérience passée dans le vocabulaire du nouveau métier, avec des résultats concrets, lève le doute du recruteur. Reconnaître ce que vous êtes encore en train d'apprendre renforce votre crédibilité.",
    tips: ["Reliez directement deux ou trois compétences à l'offre d'emploi.", "Appuyez-vous sur des exemples chiffrés de votre ancien métier.", "Mentionnez ce que vous êtes en train d'apprendre."],
    commonMistakes: ["Énumérer des « soft skills » génériques sans exemple.", "Employer le jargon de votre ancien secteur, que le recruteur ne comprend pas."],
    followUpQuestions: ["Quelle compétence sera la plus difficile à acquérir ?", "Comment géreriez-vous votre premier problème technique avec un client ?"],
  },
  'hr-022': {
    question: "Vous n'avez pas d'expérience directe dans ce domaine. Pourquoi devrions-nous vous recruter ?",
    intent: "Le recruteur teste votre assurance et votre capacité à défendre votre potentiel avec des preuves.",
    expectedAnswer:
      "Vous avez raison, je n'ai pas plusieurs années d'expérience sur ce poste précis, c'est pourquoi j'ai travaillé à combler cet écart. Au cours de l'année écoulée, j'ai obtenu une certification en gestion de projet, je pilote en parallèle la migration des systèmes informatiques de notre bureau, et je me suis porté volontaire pour coordonner l'organisation d'un événement régional doté d'un budget de 40 000 €, livré dans les délais. Ce que j'apporte et que d'autres n'ont peut-être pas, ce sont quinze ans de connaissance du fonctionnement réel des équipes opérationnelles, ce qui est précieux pour un chef de projet sur vos produits logistiques. J'apprends vite, et je serais ravi de convenir avec vous d'objectifs clairs pour mes trois premiers mois afin que vous puissiez évaluer ma progression.",
    explanation:
      "Reconnaître honnêtement le manque, puis montrer votre préparation, vos résultats transférables et un regard singulier, transforme une faiblesse en argumentaire équilibré.",
    tips: ["Reconnaissez le manque sans vous excuser.", "Montrez les démarches concrètes déjà engagées.", "Mettez en avant un regard que vous seul pouvez apporter."],
    commonMistakes: ["Prétendre avoir une expérience que vous n'avez pas.", "Paraître sur la défensive ou peu sûr de vous."],
    followUpQuestions: ["De quoi auriez-vous besoin de notre part pour réussir ?", "Combien de temps vous faudrait-il pour être pleinement autonome ?"],
  },
  'hr-023': {
    question: "Accepteriez-vous un niveau de poste ou un salaire inférieur pour vous reconvertir ?",
    intent: "Le recruteur veut comprendre votre flexibilité, votre réalisme financier et le risque que vous partiez rapidement pour un meilleur salaire.",
    expectedAnswer:
      "J'y ai bien réfléchi avant de postuler. Je comprends qu'une reconversion dans le test logiciel implique de commencer à un niveau junior, et je suis prêt à accepter un salaire qui en tienne compte, dans une fourchette qui couvre mes engagements ; pour moi, le minimum se situe à 38 000 €. En contrepartie, j'aimerais comprendre comment fonctionne l'évolution chez vous : quelles compétences ou quels résultats me permettraient de passer au niveau supérieur, et à quelle fréquence les salaires sont révisés. Je vois cette étape comme un investissement dans une carrière sur le long terme, donc un parcours d'évolution clair compte davantage pour moi que le salaire de départ.",
    explanation:
      "Montrer que vous acceptez un point de départ réaliste tout en vous intéressant à l'évolution prouve votre engagement et réduit la crainte du recruteur de vous voir partir rapidement.",
    tips: ["Connaissez votre minimum financier avant l'entretien.", "Renseignez-vous sur l'évolution et le rythme des révisions salariales.", "Présentez votre décision comme un investissement à long terme."],
    commonMistakes: ["Accepter n'importe quel salaire sans connaître votre minimum.", "Attendre le même salaire que dans votre précédent poste senior."],
    followUpQuestions: ["Combien de temps pensez-vous rester à un niveau junior ?", "Et si votre évolution est plus lente que prévu ?"],
  },
  'hr-024': {
    question: "Pourquoi voulez-vous passer d'un poste technique au management, ou l'inverse ?",
    intent: "Le recruteur vérifie que ce changement est un choix réfléchi et que vous comprenez ce qu'implique le nouveau rôle.",
    expectedAnswer:
      "Ces deux dernières années, en tant que développeur senior, les aspects de mon travail qui m'ont apporté le plus de satisfaction ont été d'accompagner des collègues juniors, d'organiser notre sprint planning et d'aider à résoudre les désaccords dans l'équipe. J'ai demandé à mon manager de me confier la conduite d'un petit projet de quatre personnes, et j'ai compris que le management est un autre métier : moins de code, davantage d'écoute, de planification et de conversations difficiles. J'y ai pris goût, et le projet a été livré dans les délais avec de bons retours de l'équipe. Je recherche désormais un poste d'engineering manager où mon bagage technique m'aidera à prendre de bonnes décisions avec l'équipe, tout en acceptant que je coderai beaucoup moins.",
    explanation:
      "Une transition convaincante entre filière technique et management repose sur une expérience réelle des nouvelles responsabilités et sur une compréhension claire de ce que l'on perd et de ce que l'on gagne.",
    tips: ["Apportez la preuve que vous avez déjà expérimenté le nouveau rôle.", "Montrez que vous comprenez les compromis."],
    commonMistakes: ["Viser le management uniquement pour le titre ou le salaire.", "Croire que le management se résume au leadership technique."],
    followUpQuestions: ["Qu'est-ce qui vous manquera le plus dans votre poste actuel ?", "Comment géreriez-vous un conflit entre deux membres de l'équipe ?"],
  },
  'hr-025': {
    question: "Comment vous êtes-vous préparé à cette reconversion ?",
    intent: "Le recruteur attend des preuves de votre engagement et d'une préparation réaliste.",
    expectedAnswer:
      "J'ai commencé par échanger avec cinq personnes qui exercent déjà le métier de UX designer, pour comprendre la réalité du quotidien. J'ai ensuite suivi une formation UX de six mois avec un projet de portfolio, et j'ai repensé bénévolement le parcours de réservation d'un club sportif local, ce qui a augmenté les réservations en ligne de 20 %. Je lis régulièrement sur la recherche utilisateur et je participe chaque mois à un meetup design près de chez moi. J'ai aussi réorganisé mes finances pour pouvoir accepter un salaire junior pendant la transition.",
    explanation:
      "Une préparation concrète, faite d'échanges, de formation, de projets réels et d'une organisation pratique, prouve que la reconversion est sérieuse et mûrement réfléchie.",
    tips: ["Mentionnez vos formations, vos projets et vos échanges avec des professionnels.", "Montrez des résultats concrets."],
    commonMistakes: ["Citer uniquement des formations sans les avoir mises en pratique.", "N'avoir ni portfolio ni preuve de pratique."],
    followUpQuestions: ["Qu'avez-vous appris de plus utile ?", "Quels retours avez-vous reçus sur vos projets ?"],
  },
  'hr-026': {
    question: "Pouvez-vous m'expliquer ce trou dans votre CV ?",
    intent: "Le recruteur attend une explication calme et honnête, et veut être rassuré sur le fait que vous êtes prêt à travailler dès maintenant.",
    expectedAnswer:
      "Oui. De mars à octobre l'an dernier, j'ai fait une pause pour m'occuper d'un proche malade. Cette situation est aujourd'hui réglée et je suis pleinement disponible. Pendant cette période, j'ai maintenu mes compétences à jour : j'ai obtenu une certification sur un logiciel de comptabilité en ligne et j'ai suivi les évolutions de la réglementation fiscale liées à mon domaine. Je suis très motivé à l'idée de reprendre une activité, et ce poste correspond bien à mon expérience.",
    explanation:
      "Les périodes d'inactivité sont fréquentes. Une explication courte et honnête, sans détails superflus, suivie de ce que vous avez fait pour rester à niveau et de votre disponibilité actuelle, suffit généralement.",
    tips: ["Restez bref et factuel.", "Mentionnez ce que vous avez fait pour rester à niveau.", "Terminez sur votre disponibilité et votre motivation."],
    commonMistakes: ["Masquer la période avec de fausses dates.", "Entrer dans de longs détails personnels.", "Adopter un ton d'excuse."],
    followUpQuestions: ["Êtes-vous pleinement disponible aujourd'hui ?", "Qu'avez-vous appris pendant cette période ?"],
  },
  'hr-027': {
    question: "Vous avez fait l'objet d'un licenciement économique dans votre dernier poste. Que s'est-il passé ?",
    intent: "Le recruteur veut savoir si ce départ était lié à votre performance et comment vous parlez d'événements difficiles.",
    expectedAnswer:
      "Mon entreprise a perdu son principal client l'an dernier et a dû réduire ses effectifs de 30 %, dont toute l'équipe marketing à laquelle j'appartenais. C'était une décision économique, sans lien avec la performance individuelle ; ma manager m'a d'ailleurs rédigé une lettre de recommandation que je peux vous transmettre. Depuis, j'ai mis ce temps à profit pour obtenir une certification en marketing analytique et mener deux missions en indépendant pour de petites entreprises, ce qui m'a permis de rester actif et d'élargir mon expérience.",
    explanation:
      "Un licenciement économique est fréquent et ne constitue pas un échec personnel. Expliquer le contexte de l'entreprise, fournir une preuve si vous en avez une et montrer ce que vous avez fait ensuite est l'approche la plus professionnelle.",
    tips: ["Expliquez brièvement le contexte économique.", "Proposez une référence ou une recommandation si vous en avez une.", "Montrez ce que vous avez accompli depuis."],
    commonMistakes: ["Critiquer votre ancien employeur.", "Présenter un licenciement pour insuffisance professionnelle comme un licenciement économique."],
    followUpQuestions: ["Auriez-vous pu faire quelque chose pour l'éviter ?", "Qu'avez-vous retenu de cette expérience ?"],
  },
  'hr-028': {
    question: "Que dire d'une période d'inactivité liée à la santé ou à des raisons personnelles ?",
    intent: "Cette mise en situation teste votre capacité à protéger votre vie privée tout en restant honnête et rassurant.",
    expectedAnswer:
      "Vous pouvez rester bref et discret : « J'ai pris une année de pause pour des raisons de santé personnelles. C'est aujourd'hui complètement derrière moi, et je suis prêt à m'engager sur un poste à temps plein. » Vous n'êtes pas tenu de donner des détails médicaux, et dans de nombreux pays l'employeur n'a pas le droit de vous interroger sur votre santé. L'objectif est de rassurer le recruteur sur votre disponibilité actuelle, pas de justifier le passé en détail. Si vous avez besoin d'un aménagement particulier au travail, vous pourrez en parler lorsque vous vous sentirez à l'aise, souvent après l'offre.",
    explanation:
      "Être honnête ne signifie pas tout révéler. Une phrase courte et assurée, centrée sur le présent, respecte votre vie privée et répond à la véritable préoccupation du recruteur.",
    tips: ["Préparez une ou deux phrases avec lesquelles vous êtes à l'aise.", "Mettez l'accent sur votre disponibilité actuelle.", "Sachez que vous pouvez garder vos informations médicales pour vous."],
    commonMistakes: ["Partager plus de détails personnels que vous ne le souhaitez.", "Inventer un emploi pour combler la période."],
    followUpQuestions: ["Y a-t-il quelque chose qui pourrait affecter votre disponibilité ?", "Comment êtes-vous resté en contact avec votre domaine ?"],
  },
  'hr-029': {
    question: "Vous êtes sans emploi depuis plus d'un an. Comment êtes-vous resté à jour ?",
    intent: "Le recruteur craint que vos compétences soient dépassées et attend des preuves d'un apprentissage continu.",
    expectedAnswer:
      "Je savais que mes compétences risquaient de devenir obsolètes, alors je me suis fixé une routine. J'ai obtenu deux certifications, l'une sur les fondamentaux du cloud et l'autre en analyse de données avec SQL, toutes deux citées dans votre offre. J'ai contribué à un projet open source et développé une petite application qui suit les heures de bénévolat d'une association locale, qu'elle utilise désormais chaque semaine. J'ai aussi suivi des conférences en ligne et gardé le contact avec d'anciens collègues pour suivre l'évolution des pratiques. Je suis prêt à être rapidement opérationnel, et je serais ravi de vous montrer l'application.",
    explanation:
      "Un apprentissage concret et des projets réels contrent la crainte de compétences dépassées. Les relier à l'offre d'emploi les rend directement pertinents.",
    tips: ["Mettez en avant des apprentissages liés à l'offre d'emploi.", "Mentionnez des projets concrets que vous pouvez montrer."],
    commonMistakes: ["Dire que vous attendiez la bonne opportunité sans rien faire.", "Citer uniquement un apprentissage passif, comme des vidéos."],
    followUpQuestions: ["Qu'est-ce qui a le plus changé dans votre domaine pendant cette période ?", "Pouvez-vous nous montrer l'un de vos projets ?"],
  },
  'hr-030': {
    question: "Vous avez changé plusieurs fois d'emploi en peu de temps. Pourquoi resteriez-vous chez nous ?",
    intent: "Le recruteur craint un passage de courte durée et veut comprendre les raisons de vos départs et si elles risquent de se répéter.",
    expectedAnswer:
      "Je comprends cette inquiétude. Avec du recul, mes départs ont eu des causes différentes : la première entreprise a fermé au bout de huit mois, le deuxième poste s'est révélé essentiellement commercial, ce qui ne correspondait pas à ce qui m'avait été décrit, et le troisième était un contrat à durée déterminée. J'en ai tiré des leçons : je me renseigne désormais beaucoup plus sérieusement sur les entreprises et je pose des questions précises sur le poste, c'est pourquoi je vous ai interrogé tout à l'heure sur la roadmap de l'équipe et sur la façon dont la réussite est mesurée. Ce qui m'attire ici, c'est un produit pensé sur le long terme et un poste où je pourrai évoluer vers un rôle de lead dans les prochaines années. Je recherche de la stabilité, et je serais heureux que vous échangiez avec mes anciens managers.",
    explanation:
      "Expliquer chaque départ de façon factuelle, montrer ce que vous en avez appris et le relier à la manière dont vous avez choisi ce poste répond directement au risque perçu. Proposer des références renforce votre crédibilité.",
    tips: ["Donnez une raison courte et factuelle pour chaque départ.", "Montrez ce que vous avez changé dans votre façon de choisir un poste.", "Proposez des références."],
    commonMistakes: ["Rejeter la faute sur chacun de vos anciens employeurs.", "Promettre de rester pour toujours, ce qui n'est pas crédible."],
    followUpQuestions: ["Qu'est-ce qui pourrait vous faire quitter ce poste ?", "Comment évaluez-vous une entreprise avant d'accepter une offre ?"],
  },
  'hr-031': {
    question: "Préférez-vous le télétravail, le travail au bureau ou le mode hybride ?",
    intent: "Le recruteur vérifie que vos préférences sont compatibles avec la politique de l'entreprise et que vous pouvez y travailler efficacement.",
    expectedAnswer:
      "J'ai travaillé dans ces trois configurations et je suis productif dans chacune. Ma préférence va au mode hybride : j'aime venir au bureau pour les réunions de planification, les ateliers et pour apprendre à connaître l'équipe, et je fais bien mon travail de concentration depuis chez moi. J'ai vu que votre politique prévoit trois jours sur site, ce qui me convient. Le plus important pour moi, c'est que l'équipe ait des modes de communication clairs, où que chacun travaille.",
    explanation:
      "Exprimer honnêtement une préférence tout en montrant votre capacité d'adaptation et votre connaissance de la politique de l'entreprise évite les malentendus par la suite.",
    tips: ["Renseignez-vous sur la politique de l'entreprise avant l'entretien.", "Montrez que vous savez travailler efficacement dans différentes configurations."],
    commonMistakes: ["Dire que tout vous convient alors que ce n'est pas le cas.", "Exiger le télétravail complet sans avoir vérifié la politique."],
    followUpQuestions: ["Comment restez-vous en lien avec vos collègues en télétravail ?", "De quoi avez-vous besoin au bureau pour être productif ?"],
  },
  'hr-032': {
    question: "Comment restez-vous productif et organisé en télétravail ?",
    intent: "Le recruteur veut savoir si vous êtes capable de travailler en autonomie, sans supervision.",
    expectedAnswer:
      "Je m'appuie sur une routine : je commence à la même heure chaque jour, je planifie mes priorités le matin et je bloque des créneaux dans mon agenda pour le travail de concentration. J'ai un espace de travail dédié, ce qui m'aide à séparer vie professionnelle et vie personnelle. En fin de journée, je partage un court point d'avancement avec l'équipe, pour que chacun sache où en sont les sujets sans avoir à demander. Je veille aussi à m'arrêter à une heure raisonnable et à faire de courtes pauses, ce qui m'aide à rester concentré dans la durée.",
    explanation:
      "Des habitudes concrètes et une communication proactive montrent que l'on peut compter sur vous sans supervision.",
    tips: ["Décrivez votre véritable routine.", "Expliquez comment vous tenez l'équipe informée."],
    commonMistakes: ["Dire simplement que vous travaillez davantage à la maison.", "Négliger la communication avec l'équipe."],
    followUpQuestions: ["Comment gérez-vous les distractions à la maison ?", "Comment évitez-vous de travailler trop d'heures ?"],
  },
  'hr-033': {
    question: "Comment communiquez-vous et collaborez-vous efficacement au sein d'une équipe à distance ?",
    intent: "Le recruteur évalue votre capacité à éviter les malentendus et l'isolement dans un travail à distance.",
    expectedAnswer:
      "Je m'appuie surtout sur une communication écrite claire : je rédige des messages compréhensibles sans réunion, avec le contexte, une question précise et une échéance, et je consigne les décisions dans un espace partagé pour qu'elles ne se perdent pas dans la messagerie. Je réserve les réunions aux échanges qui en ont vraiment besoin, comme les décisions complexes ou les retours délicats, et j'active ma caméra dans ces cas-là. Je rends ma disponibilité visible et je réponds dans les délais convenus avec l'équipe. Je fais aussi l'effort de garder des échanges informels, par exemple un court moment avec des collègues chaque semaine, car la confiance est plus difficile à construire à distance. Lorsque je perçois une tension ou une confusion dans des échanges écrits, je propose un appel rapide.",
    explanation:
      "La collaboration à distance repose sur une bonne rédaction, une documentation rigoureuse, une disponibilité claire et un effort délibéré pour entretenir les relations.",
    tips: ["Mentionnez la communication écrite et la documentation.", "Expliquez quand vous préférez un appel à un message."],
    commonMistakes: ["Multiplier les réunions au lieu d'écrire clairement.", "Négliger la dimension informelle du travail en équipe."],
    followUpQuestions: ["Comment gérez-vous les désaccords dans les échanges écrits ?", "Quels outils avez-vous utilisés pour travailler à distance ?"],
  },
  'hr-034': {
    question: "Le poste est prévu sur site, mais vous aimeriez quelques jours de télétravail. Comment le demandez-vous ?",
    intent: "Cette mise en situation teste votre sens de la négociation et votre respect de la politique de l'entreprise.",
    expectedAnswer:
      "Je poserais la question une fois l'offre reçue, ou lorsque le recruteur aborde les conditions de travail, et non lors du premier entretien. Je me renseignerais d'abord sur la politique en place et sur l'existence d'exceptions, puis je formulerais une demande précise et raisonnable, liée au travail : « Le poste m'intéresse beaucoup. Serait-il possible de télétravailler le vendredi ? C'est pour moi le jour idéal pour les tâches qui demandent de la concentration, comme le reporting, et je reste entièrement flexible si l'équipe a besoin de moi au bureau. » Je pourrais aussi proposer une période d'essai, par exemple trois mois, suivie d'un bilan. Si la réponse est non, je déciderais si le poste me convient toujours plutôt que d'insister à plusieurs reprises.",
    explanation:
      "Une demande précise, centrée sur le travail, accompagnée de flexibilité et d'une période d'essai, est plus facile à accepter qu'une exigence générale.",
    tips: ["Choisissez le bon moment dans le processus.", "Formulez une demande précise avec une raison liée au travail.", "Proposez une période d'essai."],
    commonMistakes: ["En faire une condition dès le premier entretien.", "La justifier uniquement par votre confort personnel."],
    followUpQuestions: ["Que feriez-vous si la réponse était non ?", "Comment montreriez-vous que le télétravail n'affecte pas votre travail ?"],
  },
  'hr-035': {
    question: "Vous souhaitez travailler en full remote pour une entreprise basée dans un autre pays. Que devez-vous clarifier ?",
    intent: "Le recruteur vérifie que vous comprenez les aspects pratiques et juridiques du télétravail transfrontalier.",
    expectedAnswer:
      "Je clarifierais d'abord le type de contrat : serais-je salarié via une entité locale ou un « employer of record » (un organisme tiers qui emploie la personne pour le compte de l'entreprise), ou prestataire indépendant ? Cela change la fiscalité, la protection sociale, les avantages et la protection juridique. Je vérifierais que l'entreprise peut légalement employer des personnes dans mon pays et qui gère les charges sociales et le prélèvement des impôts. Viendraient ensuite les points pratiques : les horaires et le chevauchement attendu avec le fuseau horaire de l'équipe, les congés, la devise de paiement et qui supporte le risque de change, les frais d'équipement et de connexion, ainsi que la fréquence des déplacements au bureau ou aux événements d'équipe et leur prise en charge. Je demanderais aussi si le salaire est ajusté selon mon lieu de résidence. Je demanderais que tout cela soit confirmé par écrit et, dans le cas d'un statut d'indépendant, je consulterais éventuellement un expert-comptable local.",
    explanation:
      "Le télétravail transfrontalier soulève des questions juridiques, fiscales et pratiques qui varient d'un pays à l'autre. Les poser tôt évite des surprises coûteuses.",
    tips: ["Clarifiez le type de contrat et qui gère la fiscalité.", "Mettez-vous d'accord sur le chevauchement horaire et les déplacements.", "Renseignez-vous sur un éventuel ajustement du salaire selon le lieu de résidence."],
    commonMistakes: ["Accepter un statut de prestataire en pensant bénéficier des mêmes protections qu'un salarié.", "Ignorer vos obligations fiscales dans votre pays."],
    followUpQuestions: ["Qu'est-ce qu'un employer of record ?", "Comment géreriez-vous un décalage horaire important ?"],
  },
  'hr-036': {
    question: "Avez-vous des questions à nous poser ?",
    intent: "Le recruteur évalue votre intérêt, votre préparation et votre esprit critique ; ne poser aucune question peut traduire une faible motivation.",
    expectedAnswer:
      "Oui, merci. D'abord, à quoi ressemblerait la réussite sur ce poste au bout de six mois ? Ensuite, quels sont les principaux défis auxquels l'équipe fait face en ce moment ? Et enfin, comment accompagnez-vous le développement des membres de l'équipe, par exemple par la formation ou le mentorat ? J'aimerais aussi savoir ce que vous appréciez le plus, personnellement, dans le fait de travailler ici.",
    explanation:
      "De bonnes questions montrent un intérêt sincère et vous aident à décider si le poste vous convient. Les questions sur la réussite, les défis et le développement sont utiles dans presque tous les entretiens.",
    tips: ["Préparez cinq ou six questions et choisissez les meilleures selon le déroulé de l'échange.", "Interrogez sur le poste et l'équipe, pas seulement sur les avantages."],
    commonMistakes: ["Répondre « Non, je pense que tout est clair ».", "Ne parler que de congés et de salaire dès le premier entretien.", "Poser des questions dont la réponse figure déjà sur le site web."],
    followUpQuestions: ["Selon vous, quelle est la question la plus importante à poser à un employeur ?", "Qu'est-ce qui vous ferait refuser une offre ?"],
  },
  'hr-037': {
    question: "Quelles questions poseriez-vous pour mieux comprendre le poste et l'équipe ?",
    intent: "Cette mise en situation vous aide à préparer des questions qui révèlent le contenu réel du poste.",
    expectedAnswer:
      "Je demanderais : à quoi ressemble une semaine type sur ce poste ? Quelles sont les principales priorités pour les trois premiers mois ? Avec qui travaillerais-je le plus étroitement, et comment l'équipe est-elle organisée ? Comment les décisions sont-elles prises, par exemple sur les priorités ? Quels outils et quels processus l'équipe utilise-t-elle ? Pourquoi ce poste est-il ouvert : s'agit-il d'une création ou d'un remplacement ? Ces réponses m'aident à comprendre si le poste correspond à la description et où je pourrais rapidement apporter de la valeur.",
    explanation:
      "Les questions sur le quotidien, les priorités et l'organisation de l'équipe révèlent le véritable poste derrière l'annonce et montrent que vous vous y projetez déjà.",
    tips: ["Interrogez sur le travail au quotidien et les premières priorités.", "Demandez pourquoi le poste est ouvert."],
    commonMistakes: ["Poser des questions vagues comme « Quelle est la culture de l'entreprise ? » sans approfondir."],
    followUpQuestions: ["Que feriez-vous si les réponses contredisaient l'offre d'emploi ?", "À partir de combien de questions est-ce trop ?"],
  },
  'hr-038': {
    question: "Quelles questions vous aident à repérer des signaux d'alerte sur une entreprise ou une équipe ?",
    intent: "Cette mise en situation vous entraîne à évaluer un employeur de façon critique et professionnelle.",
    expectedAnswer:
      "Je poserais des questions ouvertes et j'écouterais la manière dont on y répond. Par exemple : depuis combien de temps les membres de l'équipe sont-ils là, et pourquoi la personne précédente a-t-elle quitté ce poste ? Comment l'équipe gère-t-elle les urgences ou les délais serrés ? Pouvez-vous me parler d'un désaccord récent dans l'équipe et de la façon dont il a été résolu ? Comment la performance est-elle évaluée et à quelle fréquence les collaborateurs reçoivent-ils des retours ? Qu'est-ce qui a changé dans l'équipe au cours de l'année écoulée ? Des réponses floues, des signes de turnover très élevé, des heures supplémentaires constantes présentées comme normales ou des contradictions entre interlocuteurs sont des signaux que j'approfondirais, par exemple en demandant à échanger avec un futur collègue.",
    explanation:
      "Un entretien fonctionne dans les deux sens. Poser des questions sur le turnover, la charge de travail et la résolution des conflits, et repérer les réponses évasives, vous aide à éviter un mauvais choix.",
    tips: ["Interrogez sur le turnover, la charge de travail et les retours.", "Soyez attentif à la manière dont on vous répond.", "Demandez à rencontrer vos futurs collègues."],
    commonMistakes: ["Poser des questions sur un ton accusateur.", "Ignorer les signaux d'alerte parce que vous voulez un poste rapidement."],
    followUpQuestions: ["Que feriez-vous si vous repériez un signal d'alerte tard dans le processus ?", "Comment poser une question sur les heures supplémentaires sans paraître peu investi ?"],
  },
  'hr-039': {
    question: "Comment adapteriez-vous vos questions selon que vous parlez au recruteur, au manager ou à un dirigeant ?",
    intent: "Le recruteur évalue votre capacité à adapter vos questions au point de vue de chaque interlocuteur et à son rôle dans la décision.",
    expectedAnswer:
      "Avec le recruteur, je poserais des questions sur le processus et les aspects pratiques : les prochaines étapes et le calendrier, la fourchette de salaire et les avantages, l'organisation du travail et ce que le manager valorise le plus. Avec le manager, je me concentrerais sur le travail lui-même : les priorités et les défis du poste, la façon dont la réussite est mesurée, le fonctionnement de l'équipe et sa manière de faire des retours. Avec un dirigeant, j'aborderais la stratégie et le contexte : les grands objectifs de l'entreprise pour les deux prochaines années, la contribution de cette équipe à ces objectifs et les principaux risques ou opportunités qu'il identifie. Cela montre que je comprends le point de vue de chacun et rend l'échange plus riche pour les deux parties.",
    explanation:
      "Chaque interlocuteur dispose d'informations et de priorités différentes. Des questions adaptées montrent votre compréhension des enjeux de l'entreprise et permettent de tirer le meilleur parti de chaque échange.",
    tips: ["Préparez des questions différentes pour chaque interlocuteur.", "Réservez les questions stratégiques aux dirigeants."],
    commonMistakes: ["Interroger le PDG sur la politique de congés.", "Poser les mêmes questions à tout le monde."],
    followUpQuestions: ["Que demanderiez-vous à un futur collègue de même niveau ?", "Comment donnez-vous suite aux réponses obtenues ?"],
  },
  'hr-040': {
    question: "Comment concluez-vous un entretien et comment assurez-vous le suivi ensuite ?",
    intent: "Le recruteur observe votre professionnalisme jusqu'à la fin du processus.",
    expectedAnswer:
      "À la fin de l'entretien, je remercie mes interlocuteurs, je confirme brièvement mon intérêt et je demande quelles sont les prochaines étapes et le calendrier : « Quelles sont les prochaines étapes, et quand puis-je espérer avoir de vos nouvelles ? » Dans les vingt-quatre heures, j'envoie un court e-mail de remerciement qui reprend un point précis de notre échange et réaffirme ma motivation. Si je n'ai pas de nouvelles après la date annoncée, j'envoie une relance polie quelques jours plus tard. J'évite d'envoyer des messages à répétition.",
    explanation:
      "Une conclusion claire et un suivi court et personnalisé laissent une dernière impression professionnelle et vous permettent de rester informé de l'avancement du processus.",
    tips: ["Demandez quelles sont les prochaines étapes avant de partir.", "Envoyez un court message de remerciement personnalisé."],
    commonMistakes: ["Relancer tous les jours.", "Envoyer un remerciement générique, sans aucun détail personnel."],
    followUpQuestions: ["Que faut-il écrire dans un message de relance ?", "Combien de temps faut-il attendre avant de relancer ?"],
  },
};
