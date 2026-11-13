import type { QuestionText, TextTable } from '@/types/content';

/** Questions comportementales 041-080 : adaptabilité, gestion du temps, prise de décision, responsabilité, esprit critique. */
export const frB: TextTable<QuestionText> = {
  'beh-041': {
    question: "Parlez-moi d'une fois où vos priorités ont changé brusquement.",
    intent: "Le recruteur veut voir si vous savez replanifier rapidement et communiquer l'impact d'un changement.",
    expectedAnswer:
      "Situation : j'étais à mi-parcours de la préparation d'un programme de formation pour de nouveaux commerciaux lorsque ma responsable m'a demandé de me consacrer à un audit client qui commençait la semaine suivante. Tâche : je devais basculer sur l'audit sans perdre le travail déjà réalisé sur la formation. Action : j'ai pris une heure pour noter où j'en étais sur la formation et ce qu'il restait à faire, afin de pouvoir reprendre rapidement plus tard. J'ai prévenu les personnes qui attendaient la formation de la nouvelle date. Puis j'ai rencontré la responsable de l'audit pour comprendre ce qu'elle attendait de moi et j'ai organisé ma semaine en conséquence. Résultat : l'audit s'est bien déroulé, j'ai repris la formation deux semaines plus tard et je l'ai livrée avec seulement une semaine de retard sur le planning initial.",
    explanation:
      "L'adaptabilité ne consiste pas seulement à accepter le changement, mais à en gérer les conséquences. Sauvegarder son avancement, informer les personnes concernées et s'organiser vite autour de la nouvelle priorité témoignent de professionnalisme.",
    tips: ["Montrez comment vous avez protégé le travail mis en pause.", "Précisez qui vous avez informé du changement."],
    commonMistakes: ["Se plaindre du changement.", "Abandonner la première tâche sans prévenir personne."],
    followUpQuestions: ["Comment réagissez-vous quand les priorités changent très souvent ?", "Comment décidez-vous de ce que vous laissez de côté ?"],
  },
  'beh-042': {
    question: "Parlez-moi d'une fois où vous avez dû apprendre rapidement un nouvel outil ou une nouvelle technologie.",
    intent: "Le recruteur évalue votre vitesse et votre méthode d'apprentissage lorsqu'un nouvel outil devient nécessaire pour le poste.",
    expectedAnswer:
      "Situation : mon entreprise est passée à un nouvel outil de gestion de la relation client avec seulement une semaine de préavis. Tâche : en tant qu'assistant d'équipe, je devais être capable de former mes collègues à cet outil en deux semaines. Action : j'ai suivi les tutoriels officiels le soir, créé un compte de test pour m'exercer sur les tâches les plus courantes et rédigé un aide-mémoire de deux pages avec des captures d'écran. J'ai aussi rejoint la communauté d'utilisateurs de l'outil pour trouver des réponses à des questions précises. Résultat : j'ai formé mes huit collègues en deux courtes sessions, et l'équipe utilisait pleinement l'outil à la fin du mois.",
    explanation:
      "Les recruteurs veulent une méthode d'apprentissage concrète : ressources officielles, pratique sur le terrain et moyen de partager ses connaissances. Former les autres est une preuve solide que vous maîtrisez l'outil.",
    tips: ["Décrivez votre méthode d'apprentissage.", "Montrez comment vous avez appliqué ou partagé ce que vous avez appris."],
    commonMistakes: ["Affirmer que vous apprenez vite sans le prouver.", "Ne décrire qu'un apprentissage passif, comme regarder des vidéos."],
    followUpQuestions: ["Qu'est-ce qui a été le plus difficile avec cet outil ?", "Comment continuez-vous à apprendre une fois opérationnel ?"],
  },
  'beh-043': {
    question: "Parlez-moi d'une fois où vous vous êtes adapté à un nouveau responsable ou à une réorganisation.",
    intent: "Le recruteur veut savoir si vous restez efficace et positif lorsque votre environnement de travail change.",
    expectedAnswer:
      "Situation : après une réorganisation, mon équipe a fusionné avec une autre et j'ai eu une nouvelle responsable au style très différent : elle préférait les plans écrits, alors que mon ancien responsable aimait les échanges rapides. Tâche : je voulais continuer à livrer et construire rapidement une bonne relation avec elle. Action : lors de notre premier entretien individuel, je lui ai demandé comment elle aimait recevoir les points d'avancement et ce qu'elle attendait de moi sur les trois premiers mois. J'ai commencé à lui envoyer un court résumé écrit chaque semaine et à préparer des plans d'une page avant de proposer de nouvelles initiatives. Résultat : au bout de quelques semaines, elle m'a dit que mes points l'aidaient à comprendre le travail de l'équipe fusionnée, et elle m'a confié la coordination de nos deux anciennes équipes.",
    explanation:
      "S'adapter à un nouveau responsable, c'est comprendre ses attentes et ajuster sa communication. Lui poser directement la question est simple et efficace, et montre que vous prenez la responsabilité de la relation.",
    tips: ["Expliquez ce qui était différent et comment vous vous êtes adapté.", "Montrez le résultat sur la relation."],
    commonMistakes: ["Comparer défavorablement le nouveau responsable à l'ancien.", "Attendre que le responsable s'adapte à vous."],
    followUpQuestions: ["Que faites-vous si vous n'êtes pas d'accord avec l'approche d'un nouveau responsable ?", "Comment vos collègues ont-ils réagi à la réorganisation ?"],
  },
  'beh-044': {
    question: "Parlez-moi d'une fois où vous avez dû travailler avec des consignes très floues.",
    intent: "Le recruteur vérifie comment vous gérez l'ambiguïté : si vous clarifiez, faites des hypothèses raisonnables et avancez.",
    expectedAnswer:
      "Situation : notre directrice m'a demandé d'« améliorer l'expérience d'intégration des clients », sans plus de détails ni d'échéance. Tâche : je devais transformer cette demande vague en quelque chose de concret et d'utile. Action : je lui ai posé deux questions : quel problème avait-elle constaté, et comment saurait-elle que la situation s'était améliorée ? Elle a évoqué des réclamations sur la première semaine. J'ai alors analysé les tickets de support des nouveaux clients, interrogé cinq d'entre eux et rédigé une proposition d'une page avec trois améliorations, un calendrier et un indicateur de réussite. Je la lui ai soumise pour validation avant de commencer. Résultat : elle a approuvé deux des trois améliorations, et les réclamations des nouveaux clients ont baissé d'environ un tiers au trimestre suivant.",
    explanation:
      "L'ambiguïté est fréquente dans la réalité du travail. La meilleure approche consiste à poser quelques questions ciblées, rassembler des faits, proposer un plan concret et le faire valider avant d'y consacrer du temps.",
    tips: ["Montrez les questions que vous avez posées pour clarifier.", "Faites valider votre interprétation avant de vous lancer."],
    commonMistakes: ["Ne rien faire tant que les consignes ne sont pas claires.", "Lancer un gros projet sur la base d'hypothèses non vérifiées."],
    followUpQuestions: ["Et si elle n'avait pas été disponible pour répondre ?", "Comment documentez-vous vos hypothèses ?"],
  },
  'beh-045': {
    question: "Parlez-moi d'une fois où vous avez adapté votre style de communication à quelqu'un.",
    intent: "Le recruteur veut voir si vous repérez la façon dont les autres préfèrent communiquer et si vous vous ajustez pour être efficace.",
    expectedAnswer:
      "Situation : je travaillais avec un interlocuteur chez un fournisseur qui répondait rarement à mes e-mails détaillés, ce qui retardait nos commandes. Tâche : je devais obtenir des réponses plus rapides sans abîmer la relation. Action : lors d'un appel, je lui ai demandé comment il préférait travailler. Il m'a expliqué qu'il gérait des dizaines de clients depuis son téléphone et qu'il avait du mal à lire les longs e-mails. J'ai commencé à envoyer des messages très courts, avec une seule question claire et l'échéance dès la première ligne, et je l'appelais pour tout sujet complexe. Résultat : son délai de réponse est passé de plusieurs jours à quelques heures, et nos commandes n'ont plus été retardées.",
    explanation:
      "Les bons communicants s'adaptent à leur interlocuteur plutôt que d'attendre l'inverse. Demander ses préférences et changer de format est une démonstration simple et puissante de cette compétence.",
    tips: ["Expliquez comment vous avez découvert la préférence de la personne.", "Décrivez précisément ce que vous avez changé."],
    commonMistakes: ["Reprocher à l'autre personne de mal communiquer.", "Décrire un changement sans aucun résultat."],
    followUpQuestions: ["Comment vous adaptez-vous lorsque vous présentez devant un grand groupe aux préférences variées ?", "Quel est votre style de communication naturel ?"],
  },
  'beh-046': {
    question: "Parlez-moi d'une fois où un plan a échoué et où vous avez dû improviser.",
    intent: "Le recruteur évalue votre sang-froid et votre capacité à trouver des solutions de rechange quand les choses tournent mal à la dernière minute.",
    expectedAnswer:
      "Situation : j'organisais une journée de formation produit pour trente vendeurs en magasin, et le matin même, la livraison des produits de démonstration a été bloquée en douane. Tâche : la formation devait avoir lieu ce jour-là, car les participants venaient de plusieurs villes. Action : j'ai rapidement réorganisé le programme pour commencer par les sessions sur la théorie et les techniques de vente, qui ne nécessitaient pas les produits. En parallèle, j'ai contacté un magasin voisin et emprunté cinq modèles d'exposition pour l'après-midi. J'ai réparti le groupe en petites équipes pour que chacun puisse manipuler les produits à tour de rôle. Résultat : la formation s'est terminée à l'heure, la note de satisfaction a été de 4,5 sur 5, et j'ai ajouté à notre checklist événementielle une règle « produits livrés trois jours à l'avance ».",
    explanation:
      "Bien improviser, c'est protéger l'objectif principal, utiliser de façon créative les ressources disponibles et tenir les gens informés. Transformer l'incident en règle préventive montre que vous en tirez des leçons.",
    tips: ["Montrez comment vous avez protégé l'objectif principal.", "Expliquez ce que vous avez changé pour la prochaine fois."],
    commonMistakes: ["Raconter une histoire où c'est la chance qui a résolu le problème.", "Oublier les personnes touchées par le changement."],
    followUpQuestions: ["Quel était votre plan B si le magasin avait refusé ?", "Comment restez-vous calme dans ces moments-là ?"],
  },
  'beh-047': {
    question: "Parlez-moi d'une fois où vous avez dû vous adapter à une culture, une équipe ou un pays très différent.",
    intent: "Le recruteur cherche des preuves de sensibilité culturelle et de votre capacité à vous ajuster sans perdre en efficacité.",
    expectedAnswer:
      "Situation : je suis passé d'une petite start-up informelle à une grande banque où les décisions exigeaient une validation formelle et une documentation écrite. Tâche : je devais livrer un nouvel outil de reporting en six mois dans un environnement où ma façon habituelle de travailler, avec des décisions rapides par messagerie, ne convenait pas. Action : j'ai demandé à un collègue expérimenté de m'expliquer comment les décisions se prenaient réellement, y compris qui devait être consulté de manière informelle avant un comité. J'ai commencé à préparer de courtes propositions écrites et à réserver du temps avec les principaux relecteurs avant chaque réunion formelle. J'ai aussi conservé certaines habitudes de start-up, comme montrer des prototypes très tôt, mais en les présentant dans le format attendu. Résultat : l'outil a été validé dès le premier comité, livré dans les délais, et ma pratique consistant à montrer des prototypes tôt a été adoptée par deux autres équipes.",
    explanation:
      "À un niveau avancé, l'adaptation culturelle consiste à comprendre les règles non écrites, à ajuster son comportement tout en apportant ses propres atouts sous une forme que la nouvelle culture accepte. C'est cet équilibre que recherchent les recruteurs.",
    tips: ["Expliquez les différences culturelles précises.", "Montrez ce que vous avez adapté et ce que vous avez conservé.", "Mentionnez qui vous a aidé à comprendre la culture."],
    commonMistakes: ["Présenter une culture comme meilleure que l'autre.", "S'adapter au point de ne rien apporter de nouveau."],
    followUpQuestions: ["Quelle habitude a été la plus difficile à changer ?", "Comment aideriez-vous un nouvel arrivant à s'adapter à notre culture ?"],
  },
  'beh-048': {
    question: "Parlez-moi d'une fois où vous avez pris en charge un rôle ou une tâche très éloignés de votre expertise.",
    intent: "Le recruteur évalue votre courage, votre capacité d'apprentissage et votre gestion des risques lorsque vous sortez de votre zone de confort.",
    expectedAnswer:
      "Situation : la seule personne RH de notre entreprise est partie du jour au lendemain, et en tant que responsable des services généraux, on m'a demandé de gérer le recrutement de trois postes ouverts en attendant l'arrivée d'un remplaçant. Tâche : je n'avais jamais recruté personne, et les managers concernés avaient besoin de candidats sous deux mois. Action : j'ai demandé une heure de conseils à une recruteuse de mon réseau, repris des fiches de poste d'entreprises similaires et convenu avec chaque manager de trois critères indispensables. J'ai créé une grille d'évaluation simple pour que les entretiens soient cohérents et équitables, et j'ai vérifié les obligations légales liées aux offres d'emploi avec notre avocat externe. J'ai dit clairement aux managers que j'étais en apprentissage et je leur ai demandé un retour après chaque étape. Résultat : nous avons pourvu deux des trois postes en sept semaines, les deux recrues ont validé leur période d'essai et ma grille d'évaluation a été conservée par la nouvelle responsable RH.",
    explanation:
      "Assumer un travail inconnu de manière responsable, c'est demander conseil à des experts, structurer sa démarche, vérifier les risques comme les règles juridiques et être transparent sur son apprentissage. Le recruteur veut voir à la fois de l'audace et du discernement.",
    tips: ["Montrez comment vous avez géré les risques liés à votre inexpérience.", "Mentionnez les experts que vous avez consultés.", "Soyez transparent sur ce que vous n'avez pas réussi."],
    commonMistakes: ["Prétendre être devenu expert du jour au lendemain.", "Ignorer les risques d'erreur."],
    followUpQuestions: ["Que feriez-vous différemment avec plus d'expérience ?", "Aimeriez-vous refaire ce type de travail ?"],
  },
  'beh-049': {
    question: "Parlez-moi d'une fois où vous aviez plusieurs échéances en même temps.",
    intent: "Le recruteur veut voir comment vous planifiez, priorisez et communiquez lors des pics de charge.",
    expectedAnswer:
      "Situation : en fin de semestre, j'avais deux examens, un projet de groupe et mon emploi à temps partiel la même semaine. Tâche : je devais tout rendre sans dégrader la qualité du projet dont dépendait mon groupe. Action : j'ai listé toutes les échéances et estimé le temps nécessaire pour chaque tâche. J'ai convenu avec mon responsable de décaler un créneau de travail à la semaine suivante et j'ai indiqué à l'avance à mon groupe les jours où je travaillerais sur le projet. J'ai révisé par blocs courts et fixes chaque matin et gardé les soirées pour le projet. Résultat : j'ai rendu ma partie du projet avec un jour d'avance, réussi les deux examens et n'ai manqué aucune heure de travail au total.",
    explanation:
      "Les recruteurs attendent une méthode : lister les tâches, estimer l'effort, négocier ce qui peut être décalé et planifier des créneaux précis. Communiquer tôt avec les personnes concernées fait partie intégrante de la gestion du temps.",
    tips: ["Montrez comment vous avez planifié la semaine.", "Mentionnez ce que vous avez négocié ou décalé."],
    commonMistakes: ["Dire que vous avez simplement travaillé toute la nuit.", "Oublier de préciser comment vous avez préservé la qualité."],
    followUpQuestions: ["Comment estimez-vous la durée de vos tâches ?", "Que se passe-t-il quand votre plan ne fonctionne pas ?"],
  },
  'beh-050': {
    question: "Parlez-moi d'une fois où vous n'avez pas respecté une échéance.",
    intent: "Le recruteur vérifie votre honnêteté, votre sens des responsabilités et ce que vous avez tiré de l'expérience.",
    expectedAnswer:
      "Situation : j'étais chargé de remettre un rapport mensuel des ventes à nos directeurs régionaux au plus tard le cinquième jour ouvré. Tâche : un mois, les données d'une nouvelle région sont arrivées dans un format différent et j'ai sous-estimé le temps nécessaire pour les nettoyer. Action : quand j'ai constaté le quatrième jour que j'allais être en retard, j'ai immédiatement prévenu les directeurs, je leur ai envoyé un rapport partiel avec les régions prêtes et je leur ai donné une nouvelle date précise. J'ai ensuite créé un modèle pour la nouvelle région et convenu d'un format standard avec son équipe. Résultat : j'ai livré le rapport complet avec un jour de retard, et depuis, le rapport a toujours été remis à temps, y compris pour deux autres régions arrivées plus tard.",
    explanation:
      "Tout le monde manque une échéance un jour ou l'autre. Les recruteurs veulent voir que vous avez prévenu tôt, limité l'impact et corrigé la cause pour que cela ne se reproduise pas.",
    tips: ["Choisissez un exemple réel aux conséquences limitées.", "Montrez que vous avez prévenu avant l'échéance.", "Expliquez le changement qui a évité que cela se reproduise."],
    commonMistakes: ["Dire que vous n'avez jamais manqué une échéance.", "Rejeter la responsabilité du retard sur les autres."],
    followUpQuestions: ["À quel moment décidez-vous de prévenir d'un retard ?", "Comment les directeurs ont-ils réagi ?"],
  },
  'beh-051': {
    question: "Parlez-moi d'une fois où tout semblait urgent. Comment avez-vous priorisé ?",
    intent: "Le recruteur veut connaître les critères que vous utilisez pour prioriser et la façon dont vous gérez des demandes concurrentes.",
    expectedAnswer:
      "Situation : un lundi matin, au support informatique, j'avais une imprimante en panne au service financier, une nouvelle salariée sans accès à ses comptes et un manager qui demandait l'installation d'un logiciel. Tâche : les trois personnes estimaient que leur demande était urgente. Action : j'ai rapidement évalué l'impact de chacune : la nouvelle salariée ne pouvait pas travailler du tout, le service financier disposait d'une seconde imprimante à un autre étage et l'installation pouvait attendre l'après-midi. J'ai d'abord créé les comptes de la salariée, envoyé un message au service financier pour l'orienter vers l'autre imprimante et indiqué au manager à quelle heure je passerais. Résultat : la nouvelle salariée travaillait en moins de trente minutes, l'imprimante était réparée avant midi et l'installation a été faite l'après-midi, sans aucune plainte.",
    explanation:
      "Une bonne priorisation repose sur des critères explicites comme l'impact métier, le nombre de personnes touchées et les solutions alternatives disponibles. Indiquer à chacun quand il sera aidé permet de gérer les attentes et de faire baisser la pression.",
    tips: ["Énoncez les critères que vous avez utilisés.", "Montrez comment vous avez communiqué avec les personnes qui devaient attendre."],
    commonMistakes: ["Traiter les demandes dans l'ordre d'arrivée sans réfléchir.", "Donner la priorité à celui qui crie le plus fort."],
    followUpQuestions: ["Et si deux directeurs vous avaient sollicité en même temps ?", "Utilisez-vous un outil pour gérer vos priorités ?"],
  },
  'beh-052': {
    question: "Parlez-moi d'une fois où vous avez amélioré votre façon de travailler ou celle de votre équipe.",
    intent: "Le recruteur recherche de l'initiative et un esprit d'amélioration continue : repérer le gaspillage et y remédier.",
    expectedAnswer:
      "Situation : dans notre équipe comptable, chaque facture devait être validée par e-mail, et nous passions des heures chaque semaine à relancer pour obtenir des réponses. Tâche : je voulais réduire ce temps sans changer qui validait quoi. Action : j'ai mesuré la durée des validations sur un mois : quatre jours en moyenne. J'ai proposé d'utiliser la fonction de validation déjà incluse dans notre logiciel de comptabilité et je l'ai testée avec un service. J'ai rédigé un guide d'une page et montré aux managers comment valider depuis leur téléphone. Résultat : le délai moyen de validation est tombé à un jour, et l'équipe a économisé environ cinq heures par semaine d'e-mails de relance.",
    explanation:
      "Les histoires d'amélioration sont plus convaincantes avec une mesure de départ, un test à petite échelle et un résultat mesuré. Utiliser des outils existants montre aussi un bon jugement en matière de coût et d'adoption.",
    tips: ["Mesurez la situation avant et après.", "Commencez par un test à petite échelle."],
    commonMistakes: ["Décrire une amélioration que personne n'a adoptée.", "Changer des processus sans impliquer les personnes concernées."],
    followUpQuestions: ["Comment avez-vous convaincu les managers ?", "Quelles autres améliorations aimeriez-vous apporter ?"],
  },
  'beh-053': {
    question: "Parlez-moi d'un projet long que vous avez géré. Comment l'avez-vous maintenu sur les rails ?",
    intent: "Le recruteur veut évaluer votre planification, votre suivi des jalons et votre gestion des dérives sur plusieurs mois.",
    expectedAnswer:
      "Situation : j'ai coordonné le déménagement des 120 salariés de notre entreprise dans de nouveaux bureaux, un projet de neuf mois impliquant le propriétaire, l'informatique, les fournisseurs de mobilier et tous les services. Tâche : le déménagement devait se faire en un seul week-end pour ne pas interrompre l'activité. Action : je suis parti de la date du déménagement pour définir à rebours des jalons mensuels et leurs responsables, avec un planning partagé simple, revu toutes les deux semaines avec chaque fournisseur. J'ai suivi une courte liste des principaux risques, comme des retards dans l'installation du réseau, et fixé une date limite de décision pour chacun. Lorsque l'installateur réseau a annoncé un retard de trois semaines au sixième mois, notre planning prévoyait déjà une marge, et j'ai négocié du travail le week-end en échange d'une date de paiement avancée. Résultat : le déménagement a eu lieu le week-end prévu, tous les salariés ont pu travailler dès le lundi matin et le projet s'est terminé 4 % sous le budget.",
    explanation:
      "Les projets longs exigent des jalons, des responsables clairement identifiés, des revues régulières et une gestion active des risques. Prévoir à l'avance des marges et des dates limites de décision, c'est ce qui empêche les retards de se transformer en échecs.",
    tips: ["Décrivez la méthode de planification et le rythme des revues.", "Montrez un vrai problème et comment votre planning l'a absorbé.", "Terminez par les résultats en matière de délai, de budget et de qualité."],
    commonMistakes: ["Énumérer des tâches sans expliquer comment vous suiviez l'avancement.", "Prétendre que rien ne s'est mal passé."],
    followUpQuestions: ["Comment avez-vous maintenu l'implication des parties prenantes pendant neuf mois ?", "Que planifieriez-vous différemment ?"],
  },
  'beh-054': {
    question: "Parlez-moi d'une fois où des interruptions constantes menaçaient votre travail. Qu'avez-vous fait ?",
    intent: "Le recruteur veut voir comment vous protégez votre travail de concentration tout en restant disponible pour les autres.",
    expectedAnswer:
      "Situation : j'étais la seule personne de mon équipe à connaître notre outil de reporting, mes collègues me posaient des questions toute la journée et je prenais du retard sur mes propres analyses. Tâche : j'avais besoin de temps pour me concentrer sans laisser mes collègues bloqués. Action : pendant une semaine, j'ai noté les questions reçues et constaté que la plupart revenaient à cinq mêmes sujets. J'ai rédigé une courte FAQ que j'ai partagée avec l'équipe, puis j'ai fixé deux « créneaux questions » par jour, à 11 h et à 16 h, sauf véritable urgence. Résultat : les interruptions ont diminué de plus de moitié, j'ai rendu mon analyse à temps et deux collègues ont commencé à répondre eux-mêmes aux questions simples grâce à la FAQ.",
    explanation:
      "Cette réponse montre une analyse du problème, une solution qui réduit la demande et des règles claires qui restent utiles aux autres. Les recruteurs apprécient les solutions qui améliorent l'équipe, et pas seulement votre propre confort.",
    tips: ["Expliquez comment vous avez identifié l'origine des interruptions.", "Montrez que vos collègues ont continué à être aidés."],
    commonMistakes: ["Ignorer purement et simplement les messages.", "Se plaindre de ses collègues."],
    followUpQuestions: ["Comment gérez-vous les demandes urgentes pendant vos plages de concentration ?", "Comment vos collègues ont-ils réagi à la nouvelle règle ?"],
  },
  'beh-055': {
    question: "Parlez-moi d'une fois où vous avez négocié une échéance.",
    intent: "Le recruteur vérifie si vous savez contester un délai irréaliste avec des éléments concrets et des alternatives.",
    expectedAnswer:
      "Situation : un client a demandé à notre agence de livrer la refonte complète de son site web en trois semaines, pour un salon professionnel. Tâche : en tant que chef de projet, je savais que notre équipe avait besoin d'au moins six semaines pour le site complet. Action : au lieu de refuser, j'ai demandé ce dont il avait absolument besoin pour le salon. La réponse : une nouvelle page d'accueil, un catalogue produits et un formulaire de contact. J'ai présenté au client le découpage du travail et proposé de livrer ces trois éléments en trois semaines, puis le reste du site trois semaines après le salon. Résultat : le client a accepté, les pages essentielles étaient en ligne la veille du salon et le site complet a été livré à la seconde date.",
    explanation:
      "Négocier une échéance fonctionne mieux lorsque vous comprenez le besoin réel, montrez le travail nécessaire et proposez une solution par étapes. Un refus se transforme ainsi en partenariat.",
    tips: ["Montrez les éléments concrets sur lesquels vous vous êtes appuyé.", "Proposez ce qui peut être livré dans les délais."],
    commonMistakes: ["Accepter une échéance impossible et échouer.", "Refuser sans proposer d'alternative."],
    followUpQuestions: ["Et si le client avait refusé l'approche par étapes ?", "Comment construisez-vous des estimations que vous pouvez défendre ?"],
  },
  'beh-056': {
    question: "Parlez-moi d'une fois où vous avez dû trouver l'équilibre entre rapidité et qualité.",
    intent: "Le recruteur veut voir votre jugement sur les compromis acceptables et la façon dont vous limitez les risques liés à l'accélération.",
    expectedAnswer:
      "Situation : un concurrent a lancé une fonctionnalité proche de la nôtre, et la direction voulait que notre nouvelle version sorte deux semaines plus tôt que prévu. Tâche : en tant que responsable du projet, je devais décider de ce que nous pouvions retirer sans mettre les clients en danger. Action : j'ai classé le travail restant en trois groupes : ce qui touchait aux données ou aux paiements, ce qui touchait au parcours utilisateur principal et ce qui relevait du cosmétique. Nous avons maintenu des tests complets pour le premier groupe, limité les tests aux scénarios principaux pour le deuxième et reporté l'essentiel du travail cosmétique. J'ai consigné les éléments reportés dans une liste avec responsables et dates, expliqué par écrit à la direction les risques restants et ajouté une surveillance renforcée pour la première semaine. Résultat : nous avons livré avec dix jours d'avance sans aucun incident critique, deux bugs d'affichage mineurs ont été corrigés la semaine suivante et tous les éléments reportés ont été terminés en un mois.",
    explanation:
      "Les candidats confirmés ne choisissent pas entre rapidité et qualité dans l'absolu. Ils classent les risques par gravité, protègent ce qui ne doit pas échouer, documentent les compromis et surveillent de près. La clé est de rendre les compromis explicites et réversibles.",
    tips: ["Expliquez comment vous avez classé les risques.", "Montrez comment vous avez documenté puis soldé les compromis.", "Mentionnez la surveillance après la mise en production."],
    commonMistakes: ["Sacrifier la qualité partout pour tenir la date.", "Refuser tout compromis alors que le besoin métier est réel."],
    followUpQuestions: ["Que ne sacrifieriez-vous jamais, même sous pression ?", "Comment vous êtes-vous assuré que le travail reporté était réellement fait ?"],
  },
  'beh-057': {
    question: "Parlez-moi d'une décision difficile que vous avez dû prendre.",
    intent: "Le recruteur veut voir comment vous pesez les options et assumez la responsabilité d'un choix.",
    expectedAnswer:
      "Situation : on m'a proposé un poste à temps plein dans l'entreprise où j'avais fait mon stage, mais j'avais aussi été admis dans un master d'un an à l'étranger. Tâche : je devais choisir sous deux semaines. Action : j'ai listé ce que chaque option m'apporterait en compétences, en réseau et au regard de mes objectifs à long terme. J'ai échangé avec deux personnes ayant suivi chacun de ces parcours et demandé à ma tutrice de stage si un retour ultérieur serait possible. Elle m'a répondu que la porte resterait ouverte. J'ai choisi le master, car il correspondait à mon objectif de travailler sur des projets internationaux. Résultat : j'ai obtenu le master, et les compétences acquises, notamment le travail en équipes multiculturelles, sont directement utiles pour le poste auquel je postule aujourd'hui.",
    explanation:
      "Les recruteurs recherchent une démarche réfléchie : des critères clairs, l'avis d'autres personnes, la prise en compte des risques et l'appropriation du choix final. Les décisions de carrière personnelles sont des exemples acceptables en début de parcours.",
    tips: ["Expliquez vos critères.", "Montrez qui vous avez consulté.", "Reliez cette décision à votre situation actuelle."],
    commonMistakes: ["Choisir une décision sans véritable dilemme.", "Laisser quelqu'un d'autre décider à votre place."],
    followUpQuestions: ["Regrettez-vous quelque chose dans ce choix ?", "Comment décidez-vous lorsque vos critères se contredisent ?"],
  },
  'beh-058': {
    question: "Parlez-moi d'une fois où vous avez pris une décision sans disposer de toutes les informations.",
    intent: "Le recruteur évalue votre jugement en situation d'incertitude et la façon dont vous limitez les conséquences d'une éventuelle erreur.",
    expectedAnswer:
      "Situation : lors d'une coupure de courant régionale, la responsable de notre centre d'appels était injoignable et j'étais le conseiller le plus expérimenté en poste. Tâche : je devais décider rapidement s'il fallait rediriger les appels vers notre autre site, ce qui coûterait de l'argent et perturberait leur planning. Action : j'ai vérifié ce que je pouvais : le fournisseur d'électricité estimait la coupure à au moins trois heures, et notre file d'attente augmentait vite. J'ai décidé de rediriger les appels pour deux heures seulement, prévenu l'autre site et laissé un message écrit à ma responsable pour lui expliquer mon raisonnement. J'ai refait le point toutes les trente minutes. Résultat : le courant est revenu au bout de deux heures et demie, les clients ont attendu en moyenne moins de cinq minutes et ma responsable m'a confirmé qu'elle aurait pris la même décision.",
    explanation:
      "Lorsque des informations manquent, les bons candidats rassemblent rapidement ce qu'ils peuvent, choisissent une option réversible ou limitée dans le temps, documentent leur raisonnement et continuent de vérifier. Cela démontre jugement et sens des responsabilités.",
    tips: ["Expliquez ce que vous saviez et ce que vous ignoriez.", "Montrez comment vous avez limité le risque de vous tromper."],
    commonMistakes: ["Attendre trop longtemps avant de décider.", "Prendre une décision lourde et irréversible sans rien vérifier."],
    followUpQuestions: ["Qu'auriez-vous fait si votre décision s'était révélée mauvaise ?", "Comment avez-vous documenté votre raisonnement ?"],
  },
  'beh-059': {
    question: "Parlez-moi d'une fois où vous vous êtes appuyé sur des données pour prendre une décision.",
    intent: "Le recruteur veut voir si vous fondez vos décisions sur des éléments factuels et si vous savez interpréter correctement les données.",
    expectedAnswer:
      "Situation : notre équipe e-commerce voulait offrir la livraison gratuite sur toutes les commandes pour augmenter les ventes. Tâche : on m'a demandé d'évaluer l'idée avant la décision. Action : j'ai analysé six mois de commandes et constaté que 70 % dépassaient déjà 40 euros, et que la plupart des paniers abandonnés se situaient entre 25 et 40 euros. J'ai proposé à la place la livraison gratuite à partir de 40 euros, et nous l'avons testée sur la moitié de nos visiteurs pendant trois semaines. Résultat : le groupe test a passé 12 % de commandes en plus avec un panier moyen plus élevé, tandis que les frais de livraison ont beaucoup moins augmenté qu'avec la gratuité pour tous. L'équipe a adopté ce seuil de façon permanente.",
    explanation:
      "Une bonne décision fondée sur les données suppose de poser la bonne question, de mener une analyse rigoureuse et, idéalement, de tester avant de généraliser. Proposer une alternative affinée montre que les données ont éclairé la décision au lieu de simplement confirmer une idée de départ.",
    tips: ["Expliquez quelles données vous avez utilisées et pourquoi.", "Précisez comment vous avez validé la conclusion."],
    commonMistakes: ["Présenter des données qui ne font que confirmer ce que vous vouliez déjà.", "Ignorer les limites des données."],
    followUpQuestions: ["Qu'est-ce qui vous aurait fait douter des données ?", "Comment présentez-vous des données à des personnes qui ne sont pas analystes ?"],
  },
  'beh-060': {
    question: "Parlez-moi d'une décision que vous avez prise et qui s'est révélée mauvaise.",
    intent: "Le recruteur vérifie si vous reconnaissez rapidement vos erreurs et corrigez le tir sans chercher d'excuses.",
    expectedAnswer:
      "Situation : après avoir comparé les prix, j'ai choisi un nouveau fournisseur, moins cher, pour nos fournitures de bureau. Tâche : j'étais chargé de maîtriser les coûts sans perturber le fonctionnement du bureau. Action : au bout de deux mois, les livraisons étaient souvent en retard et certains produits manquaient. J'ai cherché ce qui m'avait échappé : je n'avais comparé que les prix, sans tenir compte de la fiabilité des livraisons ni des références. J'en ai informé mon responsable, négocié une sortie du contrat à la fin du trimestre et je suis revenu à l'ancien fournisseur avec un tarif un peu plus avantageux grâce au volume. Résultat : les livraisons sont redevenues fiables, nous avons tout de même économisé 5 % par rapport au contrat initial, et j'intègre désormais la performance de livraison et les références dans chaque comparaison de fournisseurs.",
    explanation:
      "Les recruteurs apprécient les personnes qui assument leurs erreurs, analysent pourquoi leur processus de décision a échoué et l'améliorent. La leçon retenue est la partie la plus importante de la réponse.",
    tips: ["Expliquez ce qui n'allait pas dans votre processus de décision.", "Montrez l'action corrective et ce que vous avez changé pour l'avenir."],
    commonMistakes: ["Choisir une erreur qui était en réalité la faute de quelqu'un d'autre.", "Ne pas expliquer ce que vous avez appris."],
    followUpQuestions: ["Combien de temps vous a-t-il fallu pour comprendre que c'était une erreur ?", "Comment votre responsable a-t-il réagi ?"],
  },
  'beh-061': {
    question: "Parlez-moi d'une fois où vous avez dû prendre une décision rapide sous pression.",
    intent: "Le recruteur veut voir si vous savez agir vite et avec bon sens, sans céder à la panique.",
    expectedAnswer:
      "Situation : alors que j'étais chef d'équipe dans un restaurant, le lave-vaisselle est tombé en panne un samedi soir de forte affluence. Tâche : je devais assurer la continuité du service sans assez de vaisselle propre. Action : en quelques minutes, j'ai décidé d'affecter un serveur à la plonge à la main, retiré temporairement de la carte deux plats qui demandaient beaucoup d'assiettes et informé la cuisine et l'équipe. J'ai aussi appelé le service de réparation pour le lendemain matin. Résultat : nous avons servi toutes les tables ce soir-là avec seulement de légers retards, et le gérant a conservé ma carte temporaire comme plan de secours en cas de panne d'équipement.",
    explanation:
      "Une décision rapide consiste à protéger l'objectif principal, utiliser les ressources disponibles et communiquer clairement. Montrer que vous avez aussi géré la suite témoigne de votre sens des responsabilités.",
    tips: ["Expliquez votre raisonnement en quelques mots.", "Montrez comment vous avez communiqué la décision."],
    commonMistakes: ["Décrire une décision prise sans aucune réflexion.", "Oublier les actions de suivi."],
    followUpQuestions: ["Comment restez-vous calme quand vous devez décider vite ?", "Décideriez-vous autrement avec plus de temps ?"],
  },
  'beh-062': {
    question: "Parlez-moi d'une fois où vous avez été confronté à un dilemme éthique au travail.",
    intent: "Le recruteur évalue votre intégrité, votre jugement et votre courage lorsque la bonne décision n'est pas la plus facile.",
    expectedAnswer:
      "Situation : en préparant les résultats trimestriels pour une présentation client, j'ai remarqué qu'un collègue avait utilisé une méthode de calcul qui faisait paraître les résultats de notre campagne environ 20 % meilleurs qu'ils ne l'étaient. Tâche : la présentation avait lieu le lendemain matin, et corriger les chiffres rendrait notre équipe moins performante aux yeux du client. Action : j'ai d'abord vérifié ma compréhension en recalculant les chiffres avec la méthode convenue avec le client. Puis j'ai parlé en privé à mon collègue, je lui ai expliqué ce que j'avais trouvé et je lui ai proposé de corriger les chiffres ensemble. Comme il était réticent, j'ai informé notre responsable le soir même, en présentant le sujet comme une question de méthodologie plutôt que comme une accusation. Résultat : nous avons présenté les chiffres corrects, avec une explication claire de ce qui avait fonctionné et de ce qui n'avait pas fonctionné. Le client a apprécié cette transparence et a renouvelé le contrat, et notre équipe a mis en place une relecture croisée de tous les chiffres destinés aux clients.",
    explanation:
      "Les dilemmes éthiques testent votre capacité à vérifier les faits, à alerter les bonnes personnes et à agir même quand c'est inconfortable, tout en traitant vos collègues équitablement. La démarche compte autant que le résultat.",
    tips: ["Montrez que vous avez vérifié les faits avant d'agir.", "Expliquez comment vous avez traité équitablement les personnes concernées.", "Décrivez le résultat et ce qui a changé."],
    commonMistakes: ["Ignorer le problème pour éviter le conflit.", "Accuser quelqu'un publiquement sans vérifier."],
    followUpQuestions: ["Et si votre responsable vous avait demandé de garder les chiffres d'origine ?", "Où placez-vous la limite entre une erreur et une faute ?"],
  },
  'beh-063': {
    question: "Parlez-moi d'une fois où vous avez dû choisir entre deux bonnes options.",
    intent: "Le recruteur veut voir comment vous comparez les compromis et prenez une décision que les autres peuvent comprendre et soutenir.",
    expectedAnswer:
      "Situation : notre équipe produit disposait d'un budget pour un seul projet majeur au semestre suivant : une application mobile demandée par de nombreux clients, ou un module de reporting réclamé par nos plus gros clients. Tâche : en tant que product manager, je devais en recommander un à la direction. Action : j'ai comparé les deux options selon quatre critères convenus à l'avance avec la direction : chiffre d'affaires attendu, risque de perte de clients, coût de développement et cohérence stratégique. J'ai interrogé huit clients de chaque groupe et travaillé avec la finance sur les estimations de revenus. Le module de reporting concernait moins d'utilisateurs, mais protégeait des contrats représentant 35 % de notre chiffre d'affaires, dont deux l'avaient évoqué lors des discussions de renouvellement. Je l'ai recommandé, avec une version web mobile allégée comme solution transitoire pour les autres clients. Résultat : la direction a validé le plan, les deux clients à risque ont renouvelé et la version web mobile a suffisamment réduit les demandes d'application pour reporter l'application native d'un an sans perdre de clients.",
    explanation:
      "Lorsque les deux options sont bonnes, la décision repose sur des critères explicites définis à l'avance et sur des éléments factuels. Proposer une solution partielle pour l'option écartée témoigne d'une pensée stratégique et réduit le coût du compromis.",
    tips: ["Mettez-vous d'accord sur les critères de décision avant de comparer.", "Appuyez chaque critère sur des éléments factuels.", "Montrez comment vous avez limité les inconvénients de l'option écartée."],
    commonMistakes: ["Décider uniquement à l'intuition.", "Présenter la décision comme une évidence."],
    followUpQuestions: ["Comment avez-vous communiqué la décision aux clients qui voulaient l'application ?", "Qu'est-ce qui vous aurait fait choisir l'autre option ?"],
  },
  'beh-064': {
    question: "Parlez-moi d'une décision que vous avez prise et avec laquelle d'autres n'étaient pas d'accord.",
    intent: "Le recruteur veut voir si vous savez maintenir une décision réfléchie tout en écoutant les autres et en préservant les relations.",
    expectedAnswer:
      "Situation : en tant qu'organisateur de la conférence annuelle de notre département, j'ai décidé de réduire le nombre de présentations de douze à huit pour laisser plus de temps aux ateliers. Tâche : plusieurs intervenants habitués à présenter chaque année n'étaient pas d'accord et s'en sont plaints auprès de notre directeur. Action : j'ai expliqué mes raisons en m'appuyant sur l'enquête de l'année précédente, dans laquelle les participants demandaient plus d'interaction. J'ai écouté les inquiétudes des intervenants et proposé à ceux qui ne présentaient pas un créneau d'atelier ou une courte vidéo diffusée avant l'événement. J'ai maintenu la décision, mais adapté sa mise en œuvre. Résultat : la satisfaction des participants est passée de 3,6 à 4,4 sur 5, et deux des intervenants qui s'étaient plaints ont animé les ateliers les plus appréciés.",
    explanation:
      "Il est plus facile de maintenir une décision avec des données claires, en écoutant les objections et en adaptant la mise en œuvre. Cela montre de la conviction sans rigidité.",
    tips: ["Montrez les éléments factuels derrière votre décision.", "Expliquez comment vous avez répondu aux inquiétudes des autres."],
    commonMistakes: ["Ignorer les objections.", "Changer de décision uniquement pour éviter le conflit."],
    followUpQuestions: ["Dans quel cas auriez-vous changé votre décision ?", "Comment le directeur a-t-il réagi ?"],
  },
  'beh-065': {
    question: "Parlez-moi d'une erreur que vous avez commise au travail.",
    intent: "Le recruteur teste votre honnêteté et votre sens des responsabilités : si vous admettez vos erreurs, les corrigez et en tirez des leçons.",
    expectedAnswer:
      "Situation : lors de mon premier mois comme assistant administratif, j'ai envoyé une invitation à une réunion avec une mauvaise date à vingt partenaires externes. Tâche : la réunion était importante et plusieurs partenaires avaient déjà accepté. Action : dès que j'ai repéré l'erreur, j'ai prévenu mon responsable, envoyé à tous les partenaires un court rectificatif accompagné d'excuses et appelé les trois qui avaient déjà réservé leur déplacement. J'ai ensuite mis en place une checklist pour chaque invitation externe, avec une double vérification des dates et des fuseaux horaires. Résultat : tous les partenaires étaient présents à la bonne date, et je n'ai plus jamais commis ce type d'erreur depuis.",
    explanation:
      "Les recruteurs veulent voir que vous réagissez vite, assumez la responsabilité, limitez l'impact et mettez en place un garde-fou. Une petite erreur, racontée honnêtement et accompagnée d'une leçon claire, fonctionne bien.",
    tips: ["Choisissez une erreur réelle mais maîtrisable.", "Montrez la rapidité de votre réaction.", "Terminez par le garde-fou que vous avez mis en place."],
    commonMistakes: ["Dire que vous ne faites jamais d'erreurs.", "Choisir une erreur qui suggère une négligence grave."],
    followUpQuestions: ["Comment votre responsable a-t-il réagi ?", "Quelle erreur craignez-vous le plus de commettre ?"],
  },
  'beh-066': {
    question: "Parlez-moi d'une fois où vous avez pris en charge un problème qui n'était pas le vôtre.",
    intent: "Le recruteur veut voir de l'initiative et un sens des responsabilités qui va au-delà de votre périmètre officiel.",
    expectedAnswer:
      "Situation : des clients appelaient sans cesse notre équipe commerciale au sujet de factures erronées, alors que la facturation relevait d'un autre service. Tâche : en tant que commercial, j'aurais pu les rediriger, mais les clients s'agaçaient et certains menaçaient de partir. Action : j'ai rassemblé dix exemples de factures incorrectes et constaté qu'elles concernaient toutes des remises négociées après la commande. J'ai partagé ces exemples avec le responsable de la facturation et suggéré un formulaire simple permettant aux commerciaux d'envoyer directement les modifications de remise à la facturation. Je me suis porté volontaire pour le tester avec mes propres clients pendant un mois. Résultat : les erreurs de facturation sur mes comptes sont tombées à zéro, le formulaire a été déployé auprès de toute l'équipe commerciale et les réclamations sur les factures ont nettement diminué.",
    explanation:
      "Prendre ses responsabilités, c'est agir sur un problème qui touche le client ou l'entreprise, même s'il ne relève pas formellement de vous, tout en respectant le rôle de l'autre équipe. Apporter des éléments concrets et une proposition leur permet d'accepter facilement votre aide.",
    tips: ["Expliquez pourquoi vous avez décidé d'agir.", "Montrez comment vous avez travaillé avec l'équipe responsable du problème."],
    commonMistakes: ["Prendre en main le travail d'une autre équipe sans son accord.", "Se contenter de transmettre le problème."],
    followUpQuestions: ["Comment l'équipe de facturation a-t-elle réagi au départ ?", "Comment évitez-vous d'empiéter sur le rôle des autres ?"],
  },
  'beh-067': {
    question: "Parlez-moi d'un échec que vous avez connu.",
    intent: "Le recruteur évalue votre résilience et votre capacité à tirer de vraies leçons d'un échec.",
    expectedAnswer:
      "Situation : j'ai postulé pour piloter un nouveau programme de formation interne et préparé une proposition pour le comité de sélection. Tâche : je voulais montrer que j'étais prêt à assumer davantage de responsabilités. Action : j'ai centré ma proposition sur le contenu et les méthodes pédagogiques, que je maîtrisais bien, mais j'ai donné très peu de détails sur le budget et la manière de mesurer les résultats. Le comité a retenu un autre candidat. J'ai demandé un retour, et on m'a expliqué que mon plan était solide sur le fond, mais peu convaincant sur les aspects de gestion. Au cours des six mois suivants, j'ai suivi une courte formation en budgétisation de projet et je me suis porté volontaire pour gérer le budget d'un événement plus modeste. Résultat : l'année suivante, j'ai été choisi pour piloter un nouveau programme de mentorat, et ma proposition a été saluée pour son plan de mesure.",
    explanation:
      "Un bon récit d'échec comprend une vraie déception, une analyse honnête de ce qui manquait, un retour que vous êtes allé chercher et des actions concrètes qui ont mené à une réussite ultérieure.",
    tips: ["Choisissez un véritable échec, pas une réussite déguisée.", "Montrez comment vous avez sollicité des retours.", "Décrivez ce qui a changé ensuite."],
    commonMistakes: ["Choisir un échec causé uniquement par les autres.", "Terminer sur l'échec sans en tirer de leçon."],
    followUpQuestions: ["Comment l'avez-vous vécu sur le moment ?", "Quel est l'échec le plus utile que vous ayez connu ?"],
  },
  'beh-068': {
    question: "Parlez-moi d'une fois où vous avez dû reconnaître que vous aviez tort.",
    intent: "Le recruteur veut voir de l'humilité et de l'honnêteté intellectuelle, en particulier devant les autres.",
    expectedAnswer:
      "Situation : lors d'une réunion d'équipe, j'ai soutenu avec insistance que la baisse de fréquentation de notre site web était due à une récente modification du design. Tâche : ma collègue pensait qu'elle venait d'un changement de positionnement dans les moteurs de recherche, et nous devions décider quoi corriger. Action : j'ai proposé de vérifier les données avant de trancher. En examinant les sources de trafic, j'ai vu que les visites issues des moteurs de recherche avaient fortement chuté alors que les visites directes étaient stables : ma collègue avait raison. À la réunion suivante, j'ai dit clairement que je m'étais trompé et j'ai présenté les données qui confirmaient son explication. Résultat : nous nous sommes concentrés sur le problème de référencement et avons récupéré l'essentiel du trafic en six semaines. Ma collègue m'a dit plus tard qu'elle avait apprécié ma façon de gérer la situation.",
    explanation:
      "Reconnaître qu'on avait tort, surtout publiquement, renforce la confiance. Les recruteurs apprécient les réponses où les données ont tranché la question et où vous avez reconnu la contribution de l'autre personne.",
    tips: ["Montrez comment vous avez découvert que vous aviez tort.", "Expliquez comment vous l'avez reconnu publiquement."],
    commonMistakes: ["Minimiser votre erreur.", "Choisir un exemple où l'admettre ne vous coûtait rien."],
    followUpQuestions: ["Avez-vous du mal à reconnaître vos erreurs ?", "Comment réagissez-vous quand les autres reconnaissent qu'ils avaient tort ?"],
  },
  'beh-069': {
    question: "Parlez-moi d'une fois où vous êtes allé au-delà de ce que l'on attendait de vous.",
    intent: "Le recruteur recherche de la motivation et un sens des responsabilités : un effort supplémentaire qui a créé une vraie valeur.",
    expectedAnswer:
      "Situation : en tant que réceptionniste dans un hôtel, j'ai remarqué que de nombreux clients étrangers posaient les mêmes questions sur les transports en commun et les restaurants du quartier. Tâche : mon rôle consistait à répondre aux questions à l'accueil, rien de plus. Action : de ma propre initiative, j'ai créé un guide d'une page en trois langues avec des conseils de transport, un plan simple et des restaurants recommandés à proximité. J'ai demandé l'accord de mon responsable et l'ai fait imprimer pour chaque chambre. Résultat : le nombre de questions à l'accueil a nettement diminué aux heures d'affluence, plusieurs clients ont cité le guide dans des avis positifs en ligne et le groupe hôtelier l'a partagé avec deux autres établissements.",
    explanation:
      "Aller au-delà des attentes est plus convaincant lorsque l'effort supplémentaire résout un vrai problème et profite aux clients ou à l'entreprise, et non lorsqu'il se résume à des heures en plus.",
    tips: ["Montrez le problème que vous avez repéré.", "Expliquez la valeur créée pour les autres."],
    commonMistakes: ["Assimiler « aller au-delà » à faire des heures supplémentaires.", "Faire quelque chose dont personne n'avait besoin."],
    followUpQuestions: ["Pourquoi avez-vous décidé de le faire ?", "Comment conciliez-vous ces initiatives avec votre travail principal ?"],
  },
  'beh-070': {
    question: "Parlez-moi d'une fois où vous avez maintenu un haut niveau d'exigence alors que personne ne l'aurait remarqué.",
    intent: "Le recruteur veut voir un sens des responsabilités intrinsèque et une attention à la qualité sans contrôle extérieur.",
    expectedAnswer:
      "Situation : je préparais un export de données pour un partenaire, avec une échéance le soir même. Tâche : le partenaire vérifiait seulement que le fichier s'ouvrait correctement, donc un export rapide aurait été accepté. Action : avant de l'envoyer, j'ai effectué quelques contrôles simples : nombre d'enregistrements comparé à notre base de données, champs vides et doublons. J'ai constaté qu'environ 3 % des enregistrements étaient en double à cause d'une récente modification du système. J'ai corrigé l'export, documenté le problème pour notre équipe et envoyé le fichier avec deux heures de retard sur le planning, en prévenant le partenaire à l'avance. Résultat : la facturation mensuelle du partenaire, établie à partir de notre fichier, était correcte, et le problème de doublons a été corrigé à la source avant d'affecter d'autres rapports.",
    explanation:
      "Les recruteurs recherchent des personnes qui vérifient leur propre travail parce que le résultat leur importe, et non par peur d'être prises en défaut. Découvrir et corriger un problème caché en est une preuve solide.",
    tips: ["Décrivez les contrôles que vous avez effectués.", "Montrez la conséquence que vous avez évitée."],
    commonMistakes: ["Passer pour un perfectionniste qui rate ses échéances.", "Ne pas expliquer pourquoi le problème était important."],
    followUpQuestions: ["Comment décidez-vous du niveau de vérification suffisant ?", "Vous est-il déjà arrivé de livrer un travail dont vous n'étiez pas fier ?"],
  },
  'beh-071': {
    question: "Parlez-moi d'une fois où vous avez dû responsabiliser un collègue ou un membre de votre équipe.",
    intent: "Le recruteur évalue si vous savez aborder un problème de performance ou d'engagement de façon directe, équitable et constructive.",
    expectedAnswer:
      "Situation : dans mon équipe de six analystes, un collègue expérimenté avait manqué trois échéances consécutives de rapport hebdomadaire, et les autres avaient commencé à compenser pour lui. Tâche : en tant que chef d'équipe, je devais traiter le sujet avant qu'il n'entame la confiance au sein de l'équipe. Action : je l'ai rencontré en privé et j'ai exposé les faits sans jugement : les trois dates, l'impact sur les directeurs régionaux et sur ses collègues. Je lui ai demandé ce qui se passait. Il m'a expliqué qu'un autre directeur l'avait affecté à un projet urgent et qu'il ne se sentait pas en mesure de refuser. Nous nous sommes mis d'accord sur deux points : je clarifierais ses priorités avec l'autre directeur, et il me préviendrait dès qu'une échéance serait menacée. J'ai confirmé cet accord par écrit et fait un point chaque semaine pendant un mois. Résultat : ses rapports ont été rendus à temps dès la semaine suivante, ses collègues ont cessé de compenser et il m'a ensuite remercié d'avoir abordé le sujet tôt plutôt que de laisser la situation s'envenimer.",
    explanation:
      "Responsabiliser quelqu'un, c'est exposer les faits et leur impact, chercher à comprendre les causes, convenir d'engagements clairs et assurer un suivi. Aborder le sujet tôt et en privé protège à la fois la personne et l'équipe.",
    tips: ["Décrivez les faits et leur impact, pas la personnalité.", "Montrez que vous avez cherché la cause.", "Mentionnez le suivi."],
    commonMistakes: ["Repousser la conversation pendant des semaines.", "Remonter le problème aux RH avant d'en parler à la personne."],
    followUpQuestions: ["Qu'auriez-vous fait si rien n'avait changé ?", "Comment faites-vous un retour difficile à une personne plus expérimentée que vous ?"],
  },
  'beh-072': {
    question: "Parlez-moi d'une fois où vous avez dû expliquer un échec publiquement ou devant la direction.",
    intent: "Le recruteur veut voir comment vous assumez un échec devant les autres, en expliquez les causes et rétablissez la confiance.",
    expectedAnswer:
      "Situation : une campagne marketing que je pilotais a envoyé à 50 000 clients un e-mail promotionnel contenant un code de réduction erroné, ce qui a provoqué des réclamations et plusieurs centaines de commandes inutilisables. Tâche : je devais expliquer ce qui s'était passé à notre directeur commercial et proposer une réponse dans la journée. Action : en moins d'une heure, mon équipe a envoyé un e-mail rectificatif avec un code valide et un petit geste commercial en guise d'excuse. J'ai ensuite rédigé une synthèse d'incident d'une page : ce qui s'était passé, le nombre de clients touchés, le coût estimé et la cause racine, à savoir une modification du code de dernière minute qui avait contourné notre test habituel. Je l'ai présentée au directeur sans accuser la personne à l'origine de la modification, car le vrai problème était que notre processus l'avait permise. J'ai proposé un envoi test obligatoire pour toute modification après validation finale. Résultat : la plupart des clients concernés ont utilisé le nouveau code, et le directeur a approuvé la nouvelle règle. L'année suivante, nous avons envoyé plus de quatre-vingts campagnes sans incident similaire.",
    explanation:
      "À un niveau avancé, la responsabilité implique de piloter la réponse, de donner un compte rendu clair et factuel et de se concentrer sur le processus plutôt que sur les individus. Proposer des améliorations systémiques aide à rétablir la confiance.",
    tips: ["Commencez par la façon dont vous avez limité les dégâts.", "Présentez clairement les faits, l'impact et la cause racine.", "Mettez l'accent sur les changements de processus, pas sur les responsables."],
    commonMistakes: ["Accuser le collègue à l'origine de la modification.", "Minimiser l'impact devant la direction."],
    followUpQuestions: ["Comment avez-vous soutenu le collègue à l'origine de la modification ?", "Comment décidez-vous de ce que vous dites aux clients ?"],
  },
  'beh-073': {
    question: "Parlez-moi d'une fois où vous avez remis en question une hypothèse que tout le monde acceptait.",
    intent: "Le recruteur veut voir une pensée indépendante et si vous vérifiez les faits au lieu de suivre le groupe.",
    expectedAnswer:
      "Situation : notre équipe était convaincue que les clients résiliaient leur abonnement principalement à cause du prix, et nous préparions une campagne de remises. Tâche : on m'avait demandé de préparer la campagne, mais j'avais des doutes, car peu de messages de résiliation mentionnaient le prix. Action : j'ai demandé à examiner d'abord les données. J'ai analysé six mois d'enquêtes de résiliation et de tickets de support, et constaté que la raison la plus fréquente était la difficulté à utiliser une fonctionnalité clé, citée deux fois plus souvent que le prix. J'ai présenté les résultats à l'équipe, exemples à l'appui, et suggéré de tester un court tutoriel guidé avant de lancer les remises. Résultat : le tutoriel a réduit les résiliations de 15 % en deux mois, davantage que ce que la remise avait obtenu lors d'un test précédent, et pour un coût bien inférieur.",
    explanation:
      "L'esprit critique consiste à confronter les croyances partagées aux faits, puis à présenter les résultats de manière constructive. Proposer un test plutôt que de simplement contredire l'équipe rend la remise en question utile.",
    tips: ["Expliquez ce qui vous a fait douter de l'hypothèse.", "Montrez les éléments que vous avez rassemblés.", "Présentez votre remise en question comme une proposition."],
    commonMistakes: ["Contester pour le plaisir de contester.", "Avoir raison, mais le présenter d'une manière qui met l'équipe dans l'embarras."],
    followUpQuestions: ["Comment l'équipe a-t-elle réagi ?", "Et si les données avaient confirmé l'hypothèse ?"],
  },
  'beh-074': {
    question: "Parlez-moi d'une fois où vous avez repéré une faille dans un plan.",
    intent: "Le recruteur vérifie si vous repérez tôt les points faibles et si vous les signalez de manière constructive.",
    expectedAnswer:
      "Situation : ma responsable a présenté un plan pour ouvrir le service client le samedi en demandant à chaque conseiller de travailler un samedi par mois. Tâche : on m'a demandé mon avis avant l'annonce du plan. Action : j'ai examiné le planning et constaté qu'avec les congés et les contrats à temps partiel, certains samedis n'auraient qu'un seul conseiller, ce qui était insuffisant pour le volume d'appels prévu. J'ai préparé un calendrier simple mettant en évidence les dates problématiques et proposé deux options : recruter une personne à temps partiel pour le week-end ou réduire les horaires du samedi à la période la plus chargée. Résultat : ma responsable a choisi des horaires réduits le samedi, le service a démarré sans journée en sous-effectif et les temps d'attente des clients sont restés dans notre objectif.",
    explanation:
      "Repérer une faille n'a de valeur que si vous la signalez tôt, apportez des preuves et suggérez des alternatives. La critique devient alors une aide pour la personne qui décide.",
    tips: ["Montrez des preuves concrètes de la faille.", "Proposez au moins une alternative."],
    commonMistakes: ["Critiquer le plan sans proposer de solution.", "Attendre que le plan échoue pour dire quelque chose."],
    followUpQuestions: ["Comment faites-vous ce type de retour à un responsable ?", "Et si votre responsable avait ignoré votre remarque ?"],
  },
  'beh-075': {
    question: "Parlez-moi d'une fois où vous avez dû évaluer des informations contradictoires.",
    intent: "Le recruteur veut voir comment vous jugez les sources, conciliez les contradictions et parvenez à une conclusion fiable.",
    expectedAnswer:
      "Situation : pour une étude de marché, j'ai reçu deux rapports sur la taille d'un même marché : l'un l'estimait à 200 millions d'euros, l'autre à 450 millions. Tâche : j'avais besoin d'un chiffre fiable pour notre business plan. Action : j'ai comparé la façon dont chaque rapport avait été construit. Le premier ne comptait que les clients professionnels ; le second incluait aussi les particuliers et s'appuyait sur des données plus anciennes. J'ai vérifié les sources d'origine, contacté une fédération professionnelle pour obtenir des chiffres récents et construit ma propre estimation pour les seuls clients professionnels, puisque c'était notre cible. Résultat : mon estimation s'élevait à 230 millions d'euros, proche du premier rapport, et j'ai documenté la méthode dans le business plan pour que les investisseurs puissent voir comment le chiffre avait été obtenu. Ils ont d'ailleurs souligné cette transparence lors de leur examen.",
    explanation:
      "Les informations contradictoires proviennent souvent de définitions ou de méthodes différentes. Comparer les méthodologies, vérifier les sources primaires et documenter son raisonnement sont les marques de l'esprit critique.",
    tips: ["Expliquez pourquoi les sources divergeaient.", "Montrez comment vous avez choisi ou construit le chiffre final.", "Précisez comment vous l'avez documenté."],
    commonMistakes: ["Retenir le chiffre qui vous arrangeait le plus.", "Faire la moyenne des deux chiffres sans les comprendre."],
    followUpQuestions: ["Comment jugez-vous la fiabilité d'une source ?", "Que feriez-vous si vous ne pouviez pas résoudre la contradiction ?"],
  },
  'beh-076': {
    question: "Parlez-moi d'une fois où vous avez analysé des informations pour parvenir à une conclusion.",
    intent: "Le recruteur vérifie votre démarche analytique, même sur un problème simple.",
    expectedAnswer:
      "Situation : dans mon emploi à temps partiel en librairie, la gérante se demandait pourquoi les ventes du samedi avaient baissé depuis trois mois. Tâche : elle m'a demandé d'étudier la question. Action : j'ai comparé les ventes heure par heure sur les six derniers mois et constaté que la baisse ne concernait que la tranche de 14 h à 16 h. J'ai ensuite cherché ce qui avait changé : un parking voisin était devenu payant l'après-midi. J'ai suggéré d'offrir une heure de stationnement gratuite à partir d'un certain montant d'achat, en partenariat avec le parking. Résultat : après le lancement de l'offre, les ventes du samedi après-midi ont retrouvé leur niveau antérieur en un mois.",
    explanation:
      "Cette réponse montre une méthode analytique simple mais claire : décomposer les données, localiser le changement, chercher une cause externe et tester une solution.",
    tips: ["Expliquez comment vous avez décomposé le problème.", "Montrez comment vous avez vérifié votre conclusion."],
    commonMistakes: ["Donner une conclusion sans expliquer l'analyse.", "Confondre corrélation et causalité sans vérifier."],
    followUpQuestions: ["Comment saviez-vous que le parking était la vraie cause ?", "Quels outils avez-vous utilisés pour l'analyse ?"],
  },
  'beh-077': {
    question: "Parlez-moi d'une fois où vous avez contesté une décision prise par la direction.",
    intent: "Le recruteur évalue votre courage, votre discernement sur le moment et la manière de contester, ainsi que votre respect de la décision finale.",
    expectedAnswer:
      "Situation : la direction a décidé d'arrêter le support d'une ancienne version de notre logiciel sous trois mois afin de réduire les coûts de maintenance. Tâche : en tant que responsable du support client, je voyais qu'environ 15 % de nos clients, dont plusieurs clients du secteur public, ne pourraient pas migrer aussi vite en raison de leurs règles d'achat. Action : j'ai rassemblé les données : nombre de clients concernés, chiffre d'affaires associé et délais de préavis prévus dans leurs contrats. J'ai demandé un rendez-vous au directeur des opérations, reconnu le problème de coûts et proposé une alternative : un délai de douze mois pour les clients du secteur public avec une option payante de support étendu, et le calendrier initial pour tous les autres. Résultat : la direction a retenu un délai de neuf mois avec support étendu payant. Nous avons conservé tous les clients concernés sauf deux, le support étendu a couvert l'essentiel du coût de maintenance et nous avons évité au moins un litige potentiel lié aux délais de préavis.",
    explanation:
      "Contester efficacement la direction exige des données solides, la reconnaissance de ses objectifs et une alternative réaliste. Accepter un compromis final différent de votre proposition montre que vous servez l'entreprise, et non votre propre position.",
    tips: ["Reconnaissez l'objectif de la direction avant de contester.", "Apportez des données sur l'impact et une alternative.", "Acceptez la décision finale avec élégance."],
    commonMistakes: ["Contester publiquement d'une manière qui fragilise les dirigeants.", "Se plaindre sans proposer d'alternative."],
    followUpQuestions: ["Et si la direction avait refusé tout changement ?", "Comment décidez-vous qu'une décision mérite d'être contestée ?"],
  },
  'beh-078': {
    question: "Parlez-moi d'une fois où vous avez dû concilier résultats à court terme et conséquences à long terme.",
    intent: "Le recruteur veut voir votre pensée stratégique : si vous comprenez les coûts cachés des gains rapides.",
    expectedAnswer:
      "Situation : notre équipe commerciale peinait à atteindre son objectif trimestriel, et un manager a suggéré d'offrir de fortes remises aux clients existants en échange d'un renouvellement anticipé. Tâche : en tant qu'analyste financier en appui des ventes, on m'a demandé d'évaluer l'idée. Action : j'ai modélisé l'impact. Les remises nous aideraient à atteindre l'objectif du trimestre, mais elles réduiraient d'environ 8 % le chiffre d'affaires annuel de ces clients pendant les deux années suivantes, et les clients s'attendraient probablement à des remises similaires à l'avenir. J'ai proposé une autre approche : des remises plus modestes, liées à des engagements pluriannuels, ciblées uniquement sur les clients à risque de départ selon nos données d'utilisation. J'ai présenté les deux scénarios et leur impact sur deux ans au directeur commercial. Résultat : le directeur a choisi l'approche ciblée, nous avons atteint 97 % de l'objectif trimestriel et les contrats pluriannuels ont augmenté de 12 % le chiffre d'affaires sécurisé de l'année suivante.",
    explanation:
      "À un niveau avancé, l'esprit critique consiste à modéliser les conséquences au-delà de l'objectif immédiat et à proposer des alternatives qui équilibrent les deux horizons. Chiffrer les effets à long terme rend le compromis visible pour les décideurs.",
    tips: ["Chiffrez les effets à court terme comme à long terme.", "Proposez une alternative qui sert les deux horizons.", "Laissez le décideur comparer les scénarios."],
    commonMistakes: ["Ignorer complètement la pression du court terme.", "Présenter le long terme uniquement comme un risque vague."],
    followUpQuestions: ["Comment l'équipe commerciale a-t-elle réagi en atteignant 97 % au lieu de 100 % ?", "Comment expliquez-vous les risques à long terme à des personnes sous pression à court terme ?"],
  },
  'beh-079': {
    question: "Parlez-moi d'une fois où vous avez repéré un risque que les autres n'avaient pas vu.",
    intent: "Le recruteur vérifie votre souci du détail et si vous osez signaler les risques.",
    expectedAnswer:
      "Situation : notre équipe s'apprêtait à signer un contrat avec un nouveau fournisseur de stockage cloud pour les documents clients. Tâche : on m'avait demandé de relire la partie technique du contrat, pendant que l'équipe juridique examinait le reste. Action : en lisant l'annexe, j'ai remarqué que le fournisseur pouvait stocker les sauvegardes dans n'importe quel pays, alors que certains de nos clients exigeaient que leurs données restent dans l'Union européenne. J'ai vérifié nos contrats clients et en ai trouvé onze comportant cette exigence. J'ai informé le chef de projet et l'équipe juridique en citant précisément les clauses concernées. Résultat : le fournisseur a accepté d'ajouter une clause sur la localisation des données avant la signature, et nous avons évité de manquer à nos engagements envers ces clients.",
    explanation:
      "Cette réponse montre une lecture attentive, une vérification de l'impact et une communication claire aux bonnes personnes. Les recruteurs apprécient les candidats qui regardent au-delà de leur tâche immédiate quand les enjeux sont importants.",
    tips: ["Expliquez comment vous avez repéré le risque.", "Montrez comment vous avez vérifié son impact réel avant de le signaler."],
    commonMistakes: ["Tirer la sonnette d'alarme sans preuves.", "Repérer un risque sans en parler à personne."],
    followUpQuestions: ["Pourquoi pensez-vous que les autres ne l'avaient pas vu ?", "Comment décidez-vous quels risques méritent d'être signalés ?"],
  },
  'beh-080': {
    question: "Parlez-moi d'une fois où vous avez évalué une nouvelle idée ou un nouvel outil avant de l'adopter.",
    intent: "Le recruteur veut voir si vous évaluez les nouveautés de façon objective plutôt que de les adopter ou de les rejeter par instinct.",
    expectedAnswer:
      "Situation : mon équipe voulait adopter un nouvel outil de gestion de projet après qu'un collègue l'avait découvert lors d'une conférence. Tâche : on m'a demandé de vérifier s'il était vraiment meilleur que notre outil actuel. Action : j'ai listé nos besoins prioritaires : suivi des tâches, partage de fichiers et intégration avec notre agenda. J'ai testé le nouvel outil avec deux collègues sur un vrai petit projet pendant deux semaines et l'ai comparé à notre outil actuel sur chaque point, coût compris. Résultat : le nouvel outil était meilleur pour le suivi des tâches, mais ne s'intégrait pas à notre agenda, que nous utilisions tous les jours. Nous avons décidé de garder notre outil actuel et d'utiliser sa fonction de tableau de tâches, que la plupart de l'équipe n'avait jamais essayée. Cela a résolu le problème principal sans coût supplémentaire.",
    explanation:
      "Évaluer une idée, c'est d'abord définir des critères, tester en conditions réelles et comparer équitablement. Conclure qu'il ne faut pas adopter l'outil est un résultat tout à fait valable lorsque l'évaluation le justifie.",
    tips: ["Définissez vos critères avant de tester.", "Testez en conditions réelles avec de vrais utilisateurs."],
    commonMistakes: ["Décider uniquement par enthousiasme ou par habitude.", "Comparer des outils sans critères clairs."],
    followUpQuestions: ["Comment le collègue qui avait proposé l'outil a-t-il réagi ?", "Comment restez-vous ouvert aux nouvelles idées ?"],
  },
};
