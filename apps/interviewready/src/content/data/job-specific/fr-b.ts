import type { QuestionText, TextTable } from '@/types/content';

/** Questions métier 031-060 : cybersécurité, finance, marketing, ressources humaines. */
export const frB: TextTable<QuestionText> = {
  'job-031': {
    question: "Qu'est-ce que la triade CIA (DIC) en sécurité de l'information ?",
    intent: "Le recruteur vérifie que vous maîtrisez le modèle de base utilisé pour raisonner sur la sécurité.",
    expectedAnswer:
      "La triade CIA, ou DIC en français (disponibilité, intégrité, confidentialité), décrit trois objectifs de la sécurité de l'information. La confidentialité signifie que seules les personnes autorisées accèdent à l'information, grâce au contrôle d'accès, au chiffrement et à la classification des données. L'intégrité signifie que l'information est exacte et n'est pas modifiée sans autorisation, grâce aux droits d'accès, aux sommes de contrôle, aux signatures numériques et aux journaux d'audit. La disponibilité signifie que les systèmes et les données sont accessibles quand on en a besoin, grâce à la redondance, aux sauvegardes et à la protection contre les attaques par déni de service. Les décisions de sécurité arbitrent souvent entre ces objectifs : par exemple, des contrôles d'accès très stricts renforcent la confidentialité mais peuvent réduire la disponibilité pour les utilisateurs légitimes.",
    explanation:
      "La triade offre un vocabulaire simple pour classer les menaces et les mesures de protection, et pour expliquer les arbitrages.",
    tips: ["Donnez une mesure de protection pour chaque objectif.", "Précisez que les objectifs peuvent entrer en conflit."],
    commonMistakes: ["Confondre intégrité et disponibilité."],
    followUpQuestions: ["Quel objectif un rançongiciel attaque-t-il ?", "Qu'est-ce que la non-répudiation ?"],
  },
  'job-032': {
    question: "Quels sont les types de cyberattaques les plus courants auxquels les organisations font face ?",
    intent: "Le recruteur vérifie que vous connaissez le paysage des menaces.",
    expectedAnswer:
      "L'hameçonnage est le point d'entrée le plus fréquent : des e-mails ou messages frauduleux poussent les personnes à donner leurs identifiants ou à ouvrir des fichiers malveillants. Les logiciels malveillants regroupent virus, chevaux de Troie et logiciels espions installés sur les postes. Le rançongiciel chiffre les données et exige une rançon, souvent après avoir volé des données pour menacer de les publier. Les attaques sur les identifiants exploitent des mots de passe divulgués ou devinés, comme le credential stuffing. Les attaques par déni de service saturent un service de trafic. L'exploitation de vulnérabilités non corrigées sur des systèmes exposés à Internet est une autre voie fréquente, tout comme les attaques sur la chaîne d'approvisionnement via un fournisseur ou une mise à jour logicielle de confiance. L'ingénierie sociale par téléphone, comme les faux appels du support informatique, est aussi courante. La défense combine sensibilisation des utilisateurs, authentification multifacteur, correctifs, sauvegardes et supervision.",
    explanation:
      "Connaître les attaques courantes aide à prioriser les défenses. La plupart des attaques réussies exploitent les personnes, des identifiants faibles ou des correctifs manquants.",
    tips: ["Décrivez brièvement chaque attaque avec une défense.", "Précisez que l'hameçonnage est le point d'entrée le plus fréquent."],
    commonMistakes: ["Se concentrer sur les attaques sophistiquées en oubliant l'hygiène de base."],
    followUpQuestions: ["Comment formeriez-vous les employés contre l'hameçonnage ?", "Qu'est-ce que le credential stuffing ?"],
  },
  'job-033': {
    question: "Qu'est-ce qu'un SIEM, et comment triez-vous les alertes de sécurité ?",
    intent: "Le recruteur vérifie vos connaissances pratiques des opérations de sécurité.",
    expectedAnswer:
      "Un SIEM (security information and event management) collecte les journaux de nombreuses sources, comme les pare-feu, les serveurs, les systèmes d'identité et les postes de travail, les normalise et applique des règles de corrélation pour détecter une activité suspecte, par exemple de nombreux échecs de connexion suivis d'une réussite depuis un pays inhabituel. Quand une alerte arrive, je vérifie d'abord sa sévérité et l'actif concerné, puis je rassemble le contexte : l'utilisateur ou la machine sont-ils connus, l'activité est-elle attendue, comme un scan autorisé, et y a-t-il des événements liés avant et après ? Je compare les indicateurs, comme les adresses IP ou les empreintes de fichiers, avec la threat intelligence. Ensuite, je classe l'alerte en faux positif, événement bénin ou incident réel, j'escalade les incidents réels selon le plan de réponse à incident et je documente mon raisonnement. Les faux positifs récurrents doivent servir à ajuster les règles, car la fatigue d'alerte est un risque majeur.",
    explanation:
      "Le tri repose sur le contexte et les preuves, pas sur une réaction à chaque alerte. Ajuster les règles fait partie du métier.",
    tips: ["Décrivez comment vous rassemblez le contexte.", "Mentionnez la threat intelligence et la documentation.", "Parlez de l'ajustement des faux positifs."],
    commonMistakes: ["Clôturer des alertes sans documenter pourquoi.", "Tout escalader sans analyse."],
    followUpQuestions: ["Qu'est-ce qu'un indicateur de compromission ?", "Comment les outils EDR complètent-ils un SIEM ?"],
  },
  'job-034': {
    question: "Comment priorisez-vous les vulnérabilités à corriger ?",
    intent: "Le recruteur évalue votre approche fondée sur le risque en gestion des vulnérabilités.",
    expectedAnswer:
      "Il y a toujours plus de vulnérabilités que de temps disponible, donc je priorise selon le risque plutôt que selon le nombre. Le score CVSS donne la sévérité technique, mais je regarde aussi si la vulnérabilité est activement exploitée, à l'aide de sources comme le catalogue Known Exploited Vulnerabilities de la CISA ou de scores de prédiction d'exploitation comme EPSS ; si le système concerné est exposé à Internet ; à quel point l'actif et ses données sont critiques ; et s'il existe des mesures compensatoires. Une faille activement exploitée sur un serveur exposé à Internet est corrigée en quelques jours, alors qu'un score CVSS élevé sur une machine de test interne isolée peut attendre le cycle habituel. Je fixe les délais de remédiation avec les propriétaires des systèmes, je les suis et, quand la correction est impossible, j'applique des mesures d'atténuation, comme des changements de configuration ou des restrictions réseau, et je documente le risque accepté.",
    explanation:
      "Combiner sévérité, exploitabilité, exposition et valeur de l'actif concentre l'effort là où les attaquants ont le plus de chances de réussir.",
    tips: ["Allez au-delà du CVSS.", "Mentionnez les listes de vulnérabilités connues comme exploitées.", "Expliquez quoi faire quand la correction est impossible."],
    commonMistakes: ["Corriger strictement selon le score CVSS.", "Ignorer les actifs qui n'ont pas de propriétaire."],
    followUpQuestions: ["Qu'est-ce qu'EPSS ?", "Comment gérez-vous un système qui ne peut pas être corrigé ?"],
  },
  'job-035': {
    question: "Pourquoi l'authentification multifacteur est-elle importante, et qu'est-ce qui rend certaines méthodes plus robustes que d'autres ?",
    intent: "Le recruteur vérifie vos connaissances en authentification, l'une des mesures de sécurité les plus efficaces.",
    expectedAnswer:
      "L'authentification multifacteur (MFA) exige au moins deux facteurs de nature différente : ce que vous savez, comme un mot de passe, ce que vous possédez, comme un téléphone ou une clé de sécurité, et ce que vous êtes, comme une empreinte digitale. Elle bloque la plupart des attaques fondées sur des mots de passe volés ou devinés, qui sont très fréquentes. Les méthodes n'ont pas toutes la même robustesse. Les codes par SMS valent mieux que rien mais sont vulnérables au SIM swapping et à l'interception. Les codes d'une application d'authentification sont plus robustes, et les notifications push sont pratiques mais peuvent être détournées par des attaques de « MFA fatigue », que la saisie d'un numéro de correspondance réduit. Les plus robustes sont les méthodes résistantes à l'hameçonnage, comme les clés de sécurité FIDO2 et les passkeys, liées au vrai site et impossibles à rejouer sur un faux. J'exigerais la MFA partout, en particulier pour les administrateurs et l'accès à distance, et je ferais passer les utilisateurs à privilèges sur des méthodes résistantes à l'hameçonnage.",
    explanation:
      "La MFA est l'une des mesures au plus fort impact. Savoir que toutes les méthodes ne résistent pas à l'hameçonnage montre des connaissances à jour.",
    tips: ["Citez les trois types de facteurs.", "Comparez SMS, application, push et FIDO2.", "Mentionnez la MFA fatigue."],
    commonMistakes: ["Considérer toutes les méthodes MFA comme également robustes.", "Exempter les administrateurs par commodité."],
    followUpQuestions: ["Que sont les passkeys ?", "Comment fonctionne une attaque de MFA fatigue ?"],
  },
  'job-036': {
    question: "Décrivez-moi comment vous répondriez à un incident de rançongiciel.",
    intent: "Le recruteur évalue des compétences avancées en réponse à incident et votre capacité à raisonner de façon structurée sous pression.",
    expectedAnswer:
      "Je suivrais le plan de réponse à incident, généralement fondé sur le cycle du NIST : préparation, détection et analyse, confinement, éradication et reprise, puis retour d'expérience. Dès la détection, je confirmerais l'incident, j'alerterais l'équipe de réponse à incident et la direction, et je commencerais une chronologie. Le confinement passe en premier : isoler du réseau les machines infectées, désactiver les comptes compromis, bloquer les adresses IP et domaines malveillants, et protéger les sauvegardes en les déconnectant si elles risquent d'être atteintes. Je préserverais les preuves, comme les images mémoire et les journaux, avant d'effacer quoi que ce soit. L'analyse détermine le point d'entrée, par exemple un e-mail d'hameçonnage ou un service d'accès à distance exposé, la famille de rançongiciel, les systèmes touchés et l'éventuelle exfiltration de données. L'éradication supprime les accès de l'attaquant, y compris les mécanismes de persistance et les comptes créés, et ferme le point d'entrée. La reprise restaure les systèmes à partir de sauvegardes saines et testées, par ordre de criticité métier, avec une surveillance étroite pour détecter une réinfection. En parallèle, les équipes juridique et communication gèrent les notifications réglementaires, les relations avec les forces de l'ordre et la communication aux parties prenantes ; la décision de payer une rançon revient à la direction, avec un avis juridique, et elle est généralement déconseillée. Enfin, une revue post-incident renforce les défenses : MFA, correctifs, segmentation et sauvegardes immuables.",
    explanation:
      "Un cycle structuré, le confinement avant la reprise, la préservation des preuves et la coordination avec le juridique et la direction sont au cœur d'une bonne réponse.",
    tips: ["Appuyez-vous sur le cycle du NIST.", "Insistez sur la protection des sauvegardes et la préservation des preuves.", "Mentionnez les aspects juridiques et de communication."],
    commonMistakes: ["Restaurer les sauvegardes avant d'avoir fermé le point d'entrée.", "Effacer les machines avant d'avoir collecté les preuves."],
    followUpQuestions: ["Comment sauriez-vous si des données ont été exfiltrées ?", "Qu'est-ce qui rend une sauvegarde résistante aux rançongiciels ?"],
  },
  'job-037': {
    question: "Comment feriez-vous la modélisation des menaces d'une nouvelle application web avant sa mise en production ?",
    intent: "Le recruteur évalue votre capacité à intégrer la sécurité dès la conception, de manière proactive.",
    expectedAnswer:
      "Je travaillerais tôt avec l'équipe de développement, idéalement pendant la conception. D'abord, nous décrivons le système avec un diagramme de flux de données : utilisateurs, composants, stockages de données, services externes et frontières de confiance, par exemple entre Internet et l'application ou entre l'application et le prestataire de paiement. Ensuite, nous identifions les menaces pour chaque élément avec une méthode comme STRIDE : usurpation d'identité (spoofing), altération des données (tampering), répudiation, divulgation d'informations, déni de service et élévation de privilèges. Par exemple, un attaquant pourrait modifier la commande d'un autre utilisateur en changeant un identifiant dans la requête, ce qui relève de l'altération et de l'autorisation. Pour chaque menace, nous évaluons la probabilité et l'impact et décidons des mesures : contrôles d'autorisation côté serveur, validation des entrées, chiffrement, limitation de débit et journaux d'audit. Les résultats deviennent des exigences de sécurité et des cas de test, suivis dans le backlog. Le modèle est mis à jour quand l'architecture change de façon importante.",
    explanation:
      "La modélisation des menaces détecte les défauts de conception avant qu'ils ne soient codés. Un diagramme, une méthode structurée comme STRIDE et des mesures concrètes en sont les éléments clés.",
    tips: ["Commencez par un diagramme de flux de données et les frontières de confiance.", "Expliquez STRIDE avec un exemple.", "Transformez les menaces en exigences et en tests."],
    commonMistakes: ["Limiter la sécurité à un test d'intrusion juste avant le lancement.", "Produire un modèle de menaces qui n'entraîne aucun changement."],
    followUpQuestions: ["Qu'est-ce qu'une frontière de confiance ?", "Comment tenez-vous les modèles de menaces à jour dans des équipes Agile ?"],
  },
  'job-038': {
    question: "Parlez-moi d'une fois où vous avez convaincu des personnes extérieures à la sécurité d'adopter une mesure de sécurité.",
    intent: "Le recruteur évalue votre communication et votre capacité d'influence, essentielles pour un professionnel de la sécurité.",
    expectedAnswer:
      "Situation : notre équipe commerciale résistait à l'authentification multifacteur sur le CRM, de peur qu'elle la ralentisse en rendez-vous client. Tâche : je devais la déployer sans nuire à la productivité ni provoquer de contournements. Action : j'ai rencontré les responsables commerciaux pour comprendre leurs inquiétudes et j'ai expliqué le risque avec un exemple concret de notre secteur, un concurrent qui avait perdu des données clients à cause d'un mot de passe volé. J'ai proposé des notifications push via une application d'authentification avec saisie d'un numéro de correspondance, qui prennent quelques secondes, et une option « se souvenir de cet appareil » sur les ordinateurs de l'entreprise. J'ai mené un pilote avec cinq volontaires et partagé leurs retours. Résultat : toute l'équipe a adopté la MFA en un mois, sans hausse des demandes au support, et deux semaines plus tard, la MFA a bloqué une tentative de connexion avec le mot de passe divulgué d'un commercial.",
    explanation:
      "L'adoption de la sécurité dépend de la compréhension des contraintes des utilisateurs, d'une explication concrète du risque et d'une option sécurisée facile à utiliser.",
    tips: ["Montrez que vous avez écouté les inquiétudes des utilisateurs.", "Utilisez un exemple de risque concret et pertinent.", "Rendez le chemin sécurisé facile."],
    commonMistakes: ["Imposer des mesures sans explication.", "Jouer sur la peur et le jargon plutôt que sur des arguments clairs."],
    followUpQuestions: ["Que faites-vous quand un manager refuse une mesure ?", "Comment mesurez-vous la sensibilisation à la sécurité ?"],
  },
  'job-039': {
    question: "Quels sont les trois principaux états financiers, et comment sont-ils liés ?",
    intent: "Le recruteur vérifie vos connaissances comptables fondamentales pour un poste en finance.",
    expectedAnswer:
      "Le compte de résultat présente le chiffre d'affaires, les charges et le résultat sur une période. Le bilan présente ce que l'entreprise possède, l'actif, ce qu'elle doit, le passif, et les capitaux propres à une date donnée. Le tableau des flux de trésorerie présente les entrées et sorties de trésorerie sur la période, réparties entre activités opérationnelles, d'investissement et de financement. Ils sont liés : le résultat net du compte de résultat alimente les réserves dans les capitaux propres du bilan, et il constitue le point de départ du tableau des flux de trésorerie selon la méthode indirecte, ajusté des éléments non monétaires comme les amortissements et de la variation du besoin en fonds de roulement. La trésorerie de clôture du tableau des flux est égale à la trésorerie inscrite au bilan.",
    explanation:
      "Comprendre comment les états sont reliés montre que vous savez suivre l'effet d'une opération dans les comptes.",
    tips: ["Décrivez brièvement chaque état.", "Expliquez au moins deux liens entre eux."],
    commonMistakes: ["Confondre résultat et trésorerie.", "Dire que le bilan couvre une période."],
    followUpQuestions: ["Comment l'amortissement affecte-t-il chaque état ?", "Que se passe-t-il dans les états quand l'entreprise achète un équipement à crédit ?"],
  },
  'job-040': {
    question: "Comment évalueriez-vous un projet d'investissement ? Expliquez la VAN et le TRI.",
    intent: "Le recruteur vérifie vos compétences en choix d'investissement, utilisées en analyse financière.",
    expectedAnswer:
      "J'estimerais les flux de trésorerie attendus du projet sur sa durée de vie, y compris l'investissement initial, les flux d'exploitation et une éventuelle valeur résiduelle, puis je les actualiserais à aujourd'hui avec un taux qui reflète le coût du capital et le risque du projet. La valeur actuelle nette, VAN (NPV), est la somme de ces flux actualisés : une VAN positive signifie que le projet crée de la valeur au-delà de la rentabilité exigée. Le taux de rendement interne, TRI (IRR), est le taux d'actualisation pour lequel la VAN est nulle ; s'il dépasse le coût du capital, le projet est intéressant. La VAN est généralement préférée pour décider, car le TRI peut induire en erreur pour des projets aux flux atypiques ou pour comparer des projets de tailles différentes. Je les compléterais par le délai de récupération, une analyse de sensibilité sur les hypothèses clés et les facteurs stratégiques que les chiffres ne capturent pas.",
    explanation:
      "La VAN et le TRI sont des outils standards ; connaître leurs limites et tester les hypothèses rend l'analyse crédible.",
    tips: ["Définissez clairement les deux.", "Expliquez pourquoi la VAN est souvent préférée.", "Mentionnez l'analyse de sensibilité."],
    commonMistakes: ["Ignorer la valeur temps de l'argent.", "Choisir entre des projets de tailles différentes sur le seul TRI."],
    followUpQuestions: ["Comment choisissez-vous le taux d'actualisation ?", "Qu'est-ce que le délai de récupération et quelle est sa faiblesse ?"],
  },
  'job-041': {
    question: "Quelle est la différence entre un budget et une prévision (forecast), et comment réalisez-vous une analyse des écarts ?",
    intent: "Le recruteur vérifie vos compétences en planification et en contrôle de gestion.",
    expectedAnswer:
      "Le budget est le plan financier établi en début d'année, généralement validé par la direction et utilisé comme objectif. La prévision (forecast) est une estimation actualisée des résultats attendus, révisée régulièrement, par exemple chaque mois ou chaque trimestre, à partir des réalisations et des nouvelles informations. L'analyse des écarts compare le réel au budget ou à la prévision pour expliquer les différences. Je regarde d'abord les écarts les plus importants et je les décompose par facteurs : pour le chiffre d'affaires, effets volume, prix et mix ; pour les coûts, écarts de taux et de consommation, ou décalages dans le temps. Par exemple, le chiffre d'affaires peut être 5 % sous le budget parce que les volumes sont plus faibles dans une région alors que les prix sont légèrement plus élevés. J'explique ensuite si l'écart est temporaire ou structurel et quelles actions ou révisions de prévision sont nécessaires, dans un langage que les managers opérationnels comprennent.",
    explanation:
      "L'analyse des écarts transforme des chiffres en explications et en actions. Décomposer les écarts par facteurs est la compétence clé.",
    tips: ["Distinguez clairement budget et prévision.", "Expliquez les effets volume, prix et mix.", "Terminez par des actions."],
    commonMistakes: ["Présenter des écarts sans en expliquer les causes.", "Traiter des décalages temporels comme permanents."],
    followUpQuestions: ["Qu'est-ce qu'une prévision glissante (rolling forecast) ?", "Comment présenteriez-vous les écarts à un directeur commercial ?"],
  },
  'job-042': {
    question: "Quels ratios financiers utiliseriez-vous pour évaluer la santé d'une entreprise ?",
    intent: "Le recruteur vérifie vos capacités d'analyse et votre aptitude à interpréter des ratios en contexte.",
    expectedAnswer:
      "J'examinerais plusieurs familles. Rentabilité : la marge brute, la marge opérationnelle et la rentabilité des capitaux propres ou des capitaux employés montrent comment l'entreprise transforme son chiffre d'affaires en résultat. Liquidité : les ratios de liquidité générale et de liquidité réduite montrent si elle peut honorer ses dettes à court terme. Solvabilité : le ratio d'endettement et la couverture des intérêts montrent le risque financier. Efficacité : le délai de paiement clients (DSO), la rotation des stocks et le délai de paiement fournisseurs montrent la qualité de gestion du besoin en fonds de roulement. Trésorerie : comparer les flux de trésorerie d'exploitation au résultat net renseigne sur la qualité des bénéfices. Les ratios doivent être comparés dans le temps et avec des entreprises du même secteur, car le niveau normal d'un distributeur diffère de celui d'un éditeur de logiciels. Je lirais aussi l'annexe des comptes pour repérer les éléments exceptionnels qui faussent l'image.",
    explanation:
      "Les ratios n'ont de sens qu'en contexte : tendance, références sectorielles et détails comptables.",
    tips: ["Regroupez les ratios par objectif.", "Insistez sur la comparaison dans le temps et avec les concurrents."],
    commonMistakes: ["Interpréter un ratio sans contexte sectoriel.", "Ignorer la trésorerie quand le résultat semble bon."],
    followUpQuestions: ["Que suggère une baisse du ratio de liquidité réduite ?", "Comment une entreprise rentable peut-elle manquer de trésorerie ?"],
  },
  'job-043': {
    question: "Parlez-moi d'une fois où vous avez trouvé une erreur dans un reporting financier ou dû présenter de mauvais chiffres.",
    intent: "Le recruteur évalue votre intégrité, votre rigueur et votre communication en finance.",
    expectedAnswer:
      "Situation : deux jours avant la présentation des résultats mensuels, j'ai remarqué qu'une facture fournisseur avait été comptabilisée deux fois, ce qui surévaluait les charges de 120 000 et faisait paraître le mois plus mauvais qu'il ne l'était. Tâche : en tant qu'analyste ayant préparé le reporting, je devais corriger rapidement et en informer mon manager. Action : j'ai vérifié le doublon avec l'équipe comptabilité fournisseurs, corrigé l'écriture et mis à jour le reporting. J'ai prévenu mon manager immédiatement, expliqué la cause, l'import manuel d'un fichier déjà intégré automatiquement, et proposé un contrôle : une détection des doublons sur le numéro de facture et le fournisseur avant chaque clôture. Résultat : la présentation s'est appuyée sur les bons chiffres, le contrôle a été ajouté à notre checklist de clôture et aucun doublon n'a été trouvé depuis.",
    explanation:
      "En finance, l'exactitude et la transparence sont essentielles. Signaler immédiatement une erreur et ajouter un contrôle démontre votre fiabilité.",
    tips: ["Expliquez comment vous avez vérifié l'erreur.", "Montrez une transparence immédiate.", "Décrivez le contrôle que vous avez ajouté."],
    commonMistakes: ["Corriger en silence sans prévenir personne.", "Minimiser l'impact de l'erreur."],
    followUpQuestions: ["Quels autres contrôles utilisez-vous à la clôture mensuelle ?", "Comment présenteriez-vous des résultats inférieurs au budget ?"],
  },
  'job-044': {
    question: "Comment construiriez-vous un modèle financier pour appuyer une décision ?",
    intent: "Le recruteur évalue des compétences avancées de modélisation, votre sens de la structure et votre rigueur.",
    expectedAnswer:
      "Je pars de la décision et des questions auxquelles le modèle doit répondre, par exemple faut-il ouvrir un nouveau site, pour éviter de construire quelque chose de trop complexe. Je structure clairement le modèle : un onglet d'hypothèses et de données d'entrée, les calculs et les résultats, avec une mise en forme cohérente, aucun chiffre saisi en dur dans les formules, des libellés et des unités clairs. Les hypothèses sont documentées avec leurs sources : données de marché, historique ou estimations de la direction. Le modèle construit le chiffre d'affaires à partir d'inducteurs, par exemple nombre de clients multiplié par panier moyen, et des coûts répartis entre fixes et variables, puis produit les trois états financiers ou au moins les flux de trésorerie, ainsi que des indicateurs de valorisation comme la VAN. Je teste le modèle avec des contrôles, comme l'équilibre du bilan et la vraisemblance des marges, et je le fais relire. Ensuite, je mène une analyse de sensibilité sur les inducteurs clés et des scénarios, central, optimiste et pessimiste, pour montrer quelles hypothèses pèsent le plus. Je présente les résultats avec la fourchette des issues possibles et les principaux risques, pas un chiffre unique.",
    explanation:
      "Un bon modèle est transparent, fondé sur des inducteurs, contrôlé et centré sur la décision. Sensibilités et scénarios permettent de communiquer l'incertitude.",
    tips: ["Séparez données d'entrée, calculs et résultats.", "Utilisez une logique fondée sur des inducteurs.", "Intégrez contrôles, sensibilités et scénarios."],
    commonMistakes: ["Saisir des chiffres en dur dans les formules.", "Présenter un chiffre unique comme certain."],
    followUpQuestions: ["Quels inducteurs modéliseriez-vous pour une activité par abonnement ?", "Comment rendez-vous un modèle facile à relire pour les autres ?"],
  },
  'job-045': {
    question: "Comment expliqueriez-vous à des managers non financiers qu'une entreprise rentable peut manquer de trésorerie ?",
    intent: "Le recruteur évalue votre capacité à expliquer clairement des notions financières aux décideurs.",
    expectedAnswer:
      "J'utiliserais un exemple simple. Imaginons que nous vendions 100 000 de produits ce mois-ci avec une marge de 20 % : le compte de résultat affiche un bénéfice de 20 000. Mais nos clients paient à 60 jours, alors que nous payons nos fournisseurs et les salaires ce mois-ci. Le bénéfice est enregistré au moment de la vente, mais l'argent n'arrive que lorsque les clients paient. Si les ventes augmentent vite, nous dépensons davantage en stock et en production avant d'être payés : la croissance peut donc consommer de la trésorerie. C'est le besoin en fonds de roulement : l'argent immobilisé dans les créances clients et les stocks, moins ce que nous devons aux fournisseurs. Les investissements en équipement consomment aussi de la trésorerie immédiatement, alors que leur coût n'apparaît que progressivement sous forme d'amortissement. Pour protéger la trésorerie, nous pouvons raccourcir les délais de paiement, relancer les retards, piloter les niveaux de stock et anticiper les financements. Je montrerais un graphique simple comparant le résultat mensuel et le solde de trésorerie pour rendre la différence visible.",
    explanation:
      "Traduire la finance en exemples concrets et en visuels aide les managers à mieux décider. La distinction entre résultat et trésorerie est l'une des plus importantes à expliquer.",
    tips: ["Utilisez un exemple chiffré simple.", "Expliquez le besoin en fonds de roulement avec des mots simples.", "Terminez par des actions à la portée des managers."],
    commonMistakes: ["Utiliser le jargon comptable avec un public non financier.", "Expliquer la notion sans proposer d'actions concrètes."],
    followUpQuestions: ["Comment réduiriez-vous le délai de paiement clients ?", "À quoi sert un prévisionnel de trésorerie ?"],
  },
  'job-046': {
    question: "Pourquoi voulez-vous travailler dans le marketing, et quels canaux connaissez-vous le mieux ?",
    intent: "Le recruteur vérifie votre motivation et votre expérience concrète des canaux marketing.",
    expectedAnswer:
      "J'aime que le marketing associe la compréhension des personnes et des résultats mesurables. Pendant mon stage dans une entreprise d'e-commerce, je gérais la newsletter et quelques campagnes payantes sur les réseaux sociaux. J'appréciais de tester différents objets d'e-mail et différentes audiences, et de voir quels messages fonctionnaient ; un test sur les recommandations de produits a augmenté le taux de clic de 30 %. Les canaux que je connais le mieux sont l'e-mailing et les réseaux sociaux payants, en particulier le ciblage d'audience et le reporting de campagne. Je développe actuellement mes compétences en SEO, que je considère comme important pour votre stratégie de contenu.",
    explanation:
      "Relier sa motivation à une expérience et des résultats concrets, et citer des canaux réellement maîtrisés, rend la réponse crédible.",
    tips: ["Mentionnez de vraies campagnes et leurs résultats.", "Soyez honnête sur les canaux que vous connaissez moins."],
    commonMistakes: ["Prétendre connaître tous les canaux.", "Parler de créativité sans parler de résultats."],
    followUpQuestions: ["Parlez-moi d'un résultat de campagne dont vous êtes fier.", "Comment apprendriez-vous rapidement un nouveau canal ?"],
  },
  'job-047': {
    question: "Expliquez le tunnel de conversion et comment vous l'utiliseriez.",
    intent: "Le recruteur vérifie que vous connaissez un cadre marketing de base et savez l'appliquer.",
    expectedAnswer:
      "Le tunnel de conversion décrit les étapes que traverse un client potentiel : la notoriété, quand il découvre la marque ; la considération, quand il compare les options ; la conversion, quand il achète ou s'inscrit ; puis la fidélisation et la recommandation, quand il rachète et recommande la marque. Chaque étape demande des contenus et des canaux différents : par exemple les réseaux sociaux ou la vidéo pour la notoriété, des comparatifs et des avis pour la considération, des offres et un paiement simple pour la conversion, et l'e-mail et les programmes de fidélité pour la fidélisation. J'utilise le tunnel pour voir où nous perdons le plus de monde, à l'aide d'indicateurs comme la portée, le taux de clic, le taux de conversion et le taux de réachat, et pour concentrer les améliorations sur l'étape la plus faible.",
    explanation:
      "Le tunnel organise les actions et les indicateurs marketing selon l'étape du parcours client, ce qui aide à repérer où progresser.",
    tips: ["Nommez chaque étape avec un exemple de canal.", "Reliez les étapes à des indicateurs."],
    commonMistakes: ["Se concentrer uniquement sur l'acquisition en oubliant la fidélisation."],
    followUpQuestions: ["Quel indicateur suivriez-vous à chaque étape ?", "En quoi le tunnel diffère-t-il en B2B ?"],
  },
  'job-048': {
    question: "Quels KPI utiliseriez-vous pour évaluer une campagne de marketing digital ?",
    intent: "Le recruteur vérifie vos capacités d'analyse et votre aptitude à relier le marketing aux résultats de l'entreprise.",
    expectedAnswer:
      "Cela dépend de l'objectif de la campagne. Pour la notoriété, je regarderais la portée, les impressions et le volume de recherches sur la marque. Pour l'engagement, le taux de clic et le temps passé sur le site. Pour la performance, le taux de conversion, le coût d'acquisition client, CAC, et le retour sur dépenses publicitaires, ROAS : le chiffre d'affaires généré divisé par les dépenses publicitaires. Pour l'impact business, je comparerais le coût d'acquisition à la valeur vie client, LTV, car un client coûteux à acquérir peut rester rentable s'il reste plusieurs années ; un objectif courant est un ratio LTV / CAC d'au moins trois pour un. Je définis les KPI et les objectifs avant le lancement, je vérifie que le suivi fonctionne et je compare les résultats à un groupe témoin ou à une période précédente pour estimer l'effet réel.",
    explanation:
      "Les bons KPI dépendent de l'objectif et relient les dépenses marketing à la valeur créée, la LTV et le CAC étant les liens clés.",
    tips: ["Adaptez les KPI aux objectifs de la campagne.", "Expliquez le CAC, le ROAS et la LTV.", "Fixez les objectifs avant le lancement."],
    commonMistakes: ["Ne présenter que des indicateurs de vanité comme les likes.", "Juger les campagnes sur le seul ROAS sans tenir compte des marges."],
    followUpQuestions: ["Comment calculeriez-vous la LTV ?", "Et si le ROAS est élevé mais que les ventes totales n'augmentent pas ?"],
  },
  'job-049': {
    question: "Comment prépareriez-vous la campagne marketing du lancement d'un nouveau produit ?",
    intent: "Le recruteur évalue votre sens de la planification, de la structure et votre orientation client.",
    expectedAnswer:
      "Je commencerais par l'objectif et la cible : à qui s'adresse le produit, quels sont ses besoins et où passe-t-elle son temps, à partir d'études et des données clients existantes. Ensuite, je définirais le positionnement et le message clé : le bénéfice principal et ce qui distingue le produit des alternatives. Je choisirais les canaux en fonction de la cible, par exemple l'e-mail pour les clients existants, les réseaux sociaux et les influenceurs pour la notoriété, le SEA pour les personnes qui cherchent déjà une solution, et la presse ou des partenariats si c'est pertinent. Je construirais un calendrier avec des phases de teasing avant le lancement, de lancement et de suivi, je répartirais le budget par canal et je me coordonnerais avec les équipes commerciales, produit et support client pour que tout le monde soit prêt. Les KPI et le suivi seraient en place avant le lancement, et j'analyserais les résultats chaque semaine pour réaffecter le budget vers ce qui fonctionne.",
    explanation:
      "Un plan de lancement relie cible, message, canaux, calendrier et mesure, et aligne les équipes internes.",
    tips: ["Commencez par la cible et le positionnement.", "Expliquez les différentes phases.", "Mentionnez la coordination avec les autres équipes."],
    commonMistakes: ["Choisir les canaux avant de comprendre la cible.", "Oublier de préparer les équipes commerciales et le support."],
    followUpQuestions: ["Comment répartiriez-vous un budget limité ?", "Que feriez-vous si le lancement déçoit la première semaine ?"],
  },
  'job-050': {
    question: "Parlez-moi d'une campagne marketing qui n'a pas atteint ses objectifs. Qu'avez-vous fait ?",
    intent: "Le recruteur évalue votre sens des responsabilités, votre capacité d'analyse et votre adaptabilité.",
    expectedAnswer:
      "Situation : je pilotais une campagne payante sur les réseaux sociaux pour promouvoir une nouvelle formation en ligne, avec un objectif de 500 inscriptions en un mois. Au bout de deux semaines, nous en avions 90. Tâche : je devais comprendre pourquoi et améliorer les résultats avec le budget restant. Action : j'ai analysé le tunnel de conversion : le taux de clic était bon, mais seulement 1 % des visiteurs s'inscrivaient. En examinant la page d'atterrissage, j'ai vu que le prix apparaissait avant les bénéfices et que le formulaire comptait huit champs. J'ai créé une nouvelle version avec les témoignages en premier et un formulaire à trois champs, et je l'ai testée contre l'originale sur la moitié du trafic. J'ai aussi mis en pause les deux audiences au coût par inscription le plus élevé. Résultat : le taux de conversion est passé à 3,5 %, nous avons terminé le mois avec 380 inscriptions, en dessous de l'objectif mais avec un coût par inscription plus faible, et la nouvelle page d'atterrissage est devenue notre modèle.",
    explanation:
      "Les bonnes réponses montrent une analyse du tunnel, des tests rapides, une réaffectation du budget et une présentation honnête des résultats.",
    tips: ["Identifiez où le tunnel a décroché.", "Décrivez les tests et les ajustements de budget.", "Soyez honnête si l'objectif n'a pas été atteint."],
    commonMistakes: ["Rejeter la faute sur l'algorithme ou le marché.", "Changer beaucoup de choses à la fois sans mesurer."],
    followUpQuestions: ["Que feriez-vous différemment avant le lancement ?", "Comment décidez-vous d'arrêter une campagne ?"],
  },
  'job-051': {
    question: "Quelle est la différence entre le SEO et le SEA, et comment les utiliseriez-vous ensemble ?",
    intent: "Le recruteur vérifie vos connaissances en stratégie de marketing sur les moteurs de recherche.",
    expectedAnswer:
      "Le SEO, ou référencement naturel, améliore la position d'un site dans les résultats de recherche organiques grâce à des contenus pertinents, à la qualité technique, comme la vitesse et l'adaptation au mobile, et à l'autorité apportée par les liens d'autres sites. Les résultats prennent des mois à apparaître, mais le trafic n'est pas payé au clic et construit une valeur durable. Le SEA, ou référencement payant (souvent appelé PPC), achète des annonces affichées sur des mots-clés choisis : il donne une visibilité immédiate et un contrôle précis du budget et du ciblage, mais le trafic s'arrête quand les dépenses s'arrêtent. Ensemble, le SEA permet de tester quels mots-clés et messages convertissent avant d'investir dans du contenu SEO, de couvrir des mots-clés importants pendant que le SEO progresse et de cibler les recherches commerciales très concurrentielles. Les contenus SEO réduisent ensuite la dépendance au trafic payant. Je suivrais les deux dans le même reporting pour éviter de payer des clics que nous aurions obtenus en organique.",
    explanation:
      "Le SEO et le SEA ont des horizons de temps et des coûts différents ; les combiner équilibre résultats rapides et valeur à long terme.",
    tips: ["Comparez rapidité, coût et durabilité.", "Donnez une manière concrète dont ils se renforcent."],
    commonMistakes: ["Traiter le SEO comme un projet ponctuel.", "Enchérir sur les mots-clés de marque sans vérifier les résultats organiques."],
    followUpQuestions: ["Comment choisiriez-vous les mots-clés ?", "Quels problèmes de SEO technique sont les plus fréquents ?"],
  },
  'job-052': {
    question: "Comment mesurez-vous l'efficacité du marketing quand le suivi est limité par la réglementation sur la vie privée et les restrictions sur les cookies ?",
    intent: "Le recruteur évalue une réflexion avancée et à jour sur la mesure de la performance.",
    expectedAnswer:
      "Les exigences de consentement comme celles du RGPD (GDPR), les restrictions des navigateurs sur les cookies tiers et les évolutions de confidentialité sur mobile rendent le suivi individuel incomplet, si bien que l'attribution au dernier clic devient encore moins fiable. Je combinerais plusieurs approches. D'abord, collecter correctement des données first-party, avec un consentement clair et un tagging côté serveur quand c'est pertinent, en respectant les utilisateurs qui refusent. Ensuite, utiliser les conversions modélisées fournies par les plateformes publicitaires, en les traitant comme des estimations. Troisièmement, mener des tests d'incrémentalité, comme des tests de holdout géographique ou des études de conversion lift, où un groupe témoin ne voit pas les publicités, pour mesurer l'effet causal réel d'un canal. Quatrièmement, utiliser le marketing mix modelling, qui analyse les dépenses et les ventes agrégées dans le temps, en tenant compte de la saisonnalité et d'autres facteurs, pour estimer la contribution de chaque canal sans suivre les individus. Je croiserais ces méthodes, j'accepterais une part d'incertitude et je prendrais les décisions budgétaires sur des tendances cohérentes plutôt que sur des chiffres précis mais trompeurs.",
    explanation:
      "La mesure moderne repose sur des données first-party consenties, des expérimentations et des modèles agrégés plutôt que sur le suivi individuel.",
    tips: ["Expliquez pourquoi le suivi est limité.", "Mentionnez les tests d'incrémentalité et le marketing mix modelling.", "Respectez les choix de consentement."],
    commonMistakes: ["S'appuyer uniquement sur l'attribution déclarée par les plateformes.", "Chercher à contourner les choix de consentement."],
    followUpQuestions: ["Comment concevriez-vous un test de holdout géographique ?", "De quelles données le marketing mix modelling a-t-il besoin ?"],
  },
  'job-053': {
    question: "Comment positionneriez-vous un produit sur un marché saturé ?",
    intent: "Le recruteur évalue vos compétences en marketing stratégique : segmentation, différenciation et message.",
    expectedAnswer:
      "Je commencerais par des études : entretiens clients, analyse des avis sur les produits concurrents et données commerciales, pour comprendre quels segments ont des besoins non satisfaits et pourquoi les clients choisissent ou partent. Plutôt que de viser tout le monde, je choisirais un segment où nous pouvons gagner, par exemple les petits cabinets comptables qui trouvent les outils existants trop complexes. Ensuite, je cartographierais les concurrents selon les critères qui comptent pour ce segment, comme la simplicité, le prix et les intégrations, pour trouver une différenciation crédible que nous pouvons réellement tenir. La déclaration de positionnement définirait la cible, son problème, notre catégorie, notre bénéfice principal et la preuve : « Pour les petits cabinets comptables qui perdent du temps avec des logiciels complexes, notre outil est la solution de gestion de cabinet la plus simple, opérationnelle en une journée, comme le montrent nos résultats d'onboarding. » Le message, le prix, les priorités produit et les supports commerciaux en découleraient. Je testerais le message avec des annonces ou des pages d'atterrissage et des échanges avec des clients, puis je l'affinerais, et je le réexaminerais à mesure que le marché évolue.",
    explanation:
      "Se positionner, c'est choisir un segment cible et une différence crédible, puis aligner toute l'entreprise autour d'eux et les valider auprès de vrais clients.",
    tips: ["Commencez par des études et un segment choisi.", "Rédigez une déclaration de positionnement avec une preuve.", "Expliquez comment vous la testeriez."],
    commonMistakes: ["Chercher à plaire à tout le monde.", "Revendiquer des différences que le produit ne peut pas tenir."],
    followUpQuestions: ["Comment sauriez-vous que le positionnement fonctionne ?", "Et si un concurrent copie votre élément différenciant ?"],
  },
  'job-054': {
    question: "Pourquoi voulez-vous travailler dans les ressources humaines ?",
    intent: "Le recruteur vérifie votre motivation et votre compréhension du rôle RH au-delà du simple « j'aime les gens ».",
    expectedAnswer:
      "Les RH m'intéressent parce qu'elles influencent la façon dont les personnes vivent leur travail au quotidien : comment elles sont recrutées, accueillies, accompagnées et traitées équitablement. Pendant mon stage dans une entreprise de logistique, j'ai aidé à organiser l'intégration des saisonniers et j'ai refait le livret d'accueil à partir de leurs retours ; les départs dès la première semaine ont diminué la saison suivante. J'ai aussi appris que les RH demandent de la rigueur : droit du travail, confidentialité et données. J'aimerais évoluer dans le recrutement et l'intégration (onboarding), où je pense pouvoir contribuer rapidement.",
    explanation:
      "Une bonne réponse montre que vous voyez les RH comme une fonction à la fois humaine, rigoureuse et tournée vers l'entreprise, illustrée par une expérience.",
    tips: ["Donnez un exemple concret de mission RH que vous avez menée.", "Mentionnez la dimension rigoureuse des RH."],
    commonMistakes: ["Se contenter de dire « j'aime aider les gens »."],
    followUpQuestions: ["Quel domaine des RH vous intéresse le plus ?", "Comment géreriez-vous des informations confidentielles ?"],
  },
  'job-055': {
    question: "Quelles sont les étapes clés d'un bon processus de recrutement ?",
    intent: "Le recruteur vérifie vos connaissances pratiques en recrutement et votre attention à l'équité.",
    expectedAnswer:
      "Tout commence par la définition du besoin avec le manager recruteur : la raison d'être du poste, les responsabilités clés et les compétences réellement requises par rapport à celles qui sont simplement souhaitables. Viennent ensuite une offre d'emploi claire et inclusive, et le choix des canaux de sourcing. La présélection doit reposer sur des critères homogènes. Les entretiens doivent être structurés : les mêmes questions pour chaque candidat, liées aux compétences requises, avec une grille d'évaluation, ce qui est plus équitable et prédit mieux la performance que des conversations libres. Des mises en situation ou des études de cas peuvent compléter les entretiens. Puis viennent les références, l'offre et enfin la préparation de l'intégration. Tout au long du processus, les candidats doivent être informés dans des délais raisonnables, et les données doivent être traitées conformément aux règles de protection de la vie privée. Je suivrais aussi des indicateurs comme le délai de recrutement, le taux d'acceptation des offres et la rétention des nouvelles recrues pour améliorer le processus.",
    explanation:
      "Un recrutement structuré et fondé sur des critères est plus équitable et plus efficace. L'expérience candidat et les indicateurs complètent le processus.",
    tips: ["Mentionnez les entretiens structurés et la grille d'évaluation.", "Abordez la communication avec les candidats et la protection des données."],
    commonMistakes: ["Recruter « au feeling ».", "Laisser les candidats sans nouvelles pendant des semaines."],
    followUpQuestions: ["Comment réduisez-vous les biais en entretien ?", "Comment raccourciriez-vous le délai de recrutement ?"],
  },
  'job-056': {
    question: "Parlez-moi d'une fois où vous avez traité une plainte ou un conflit impliquant un salarié.",
    intent: "Le recruteur évalue votre discrétion, votre équité et votre gestion des conflits dans un contexte RH.",
    expectedAnswer:
      "Situation : une salariée est venue me voir en expliquant qu'un collègue faisait régulièrement des remarques irrespectueuses à son sujet en réunion. Tâche : en tant qu'assistant RH, je devais traiter la plainte de manière équitable, confidentielle et conforme à notre procédure. Action : je l'ai écoutée attentivement, j'ai pris des notes, je lui ai expliqué le processus et les prochaines étapes, et je l'ai rassurée sur la confidentialité et la protection contre les représailles. Avec ma responsable RH, nous avons rencontré le collègue pour entendre sa version, échangé avec deux témoins et examiné les messages pertinents. Les faits ont confirmé un comportement inapproprié. Le manager et les RH ont reçu le collègue pour fixer des attentes claires, un avertissement formel a été notifié conformément à la politique interne, et nous avons organisé un échange accompagné par un médiateur, que la salariée a accepté. Résultat : le comportement a cessé, j'ai fait un point avec elle un mois puis trois mois plus tard, et nous avons ajouté un module sur la communication respectueuse à la formation des managers.",
    explanation:
      "Un processus équitable, la confidentialité, l'écoute des deux parties, la documentation et le suivi sont essentiels dans le traitement des plaintes.",
    tips: ["Montrez que vous avez écouté et expliqué le processus.", "Entendez les deux parties avant de conclure.", "Mentionnez le suivi."],
    commonMistakes: ["Prendre parti avant d'enquêter.", "Partager des détails au-delà des personnes qui ont besoin de les connaître."],
    followUpQuestions: ["Et si la plainte concernait un cadre dirigeant ?", "Comment protégez-vous la personne qui se plaint ?"],
  },
  'job-057': {
    question: "Comment réduiriez-vous le turnover précoce des nouveaux salariés ?",
    intent: "Le recruteur vérifie votre approche analytique des RH et vos pratiques d'intégration.",
    expectedAnswer:
      "J'analyserais d'abord les données : quand les personnes partent, dans quelles équipes ou quels postes, et pourquoi, à l'aide d'entretiens de départ et de courts questionnaires à 30, 60 et 90 jours. Les causes fréquentes sont un écart entre le poste décrit au recrutement et le poste réel, une intégration (onboarding) insuffisante, un manque de soutien du manager ou des attentes floues. Selon les constats, les actions pourraient inclure des offres d'emploi plus réalistes et des entretiens qui montrent la réalité du poste ; un parcours d'intégration structuré avec un parrain ou une marraine, un programme clair pour la première semaine et des objectifs pour les trois premiers mois ; la formation des managers à des points réguliers ; et la garantie que le matériel et les accès sont prêts dès le premier jour. Je mesurerais l'effet en suivant la rétention à trois et six mois et les questionnaires des nouvelles recrues, puis j'ajusterais le programme.",
    explanation:
      "Comprendre les causes grâce aux données, puis améliorer la justesse du recrutement, l'intégration et le soutien des managers réduit les départs précoces.",
    tips: ["Commencez par les données sur le moment et les raisons des départs.", "Proposez des actions d'intégration concrètes.", "Mesurez les résultats."],
    commonMistakes: ["Supposer sans preuve que la cause est le salaire.", "Réduire l'intégration à des formalités administratives."],
    followUpQuestions: ["À quoi ressemblerait une bonne première semaine ?", "Comment obtenez-vous des retours sincères lors des entretiens de départ ?"],
  },
  'job-058': {
    question: "Comment protégez-vous les données personnelles des salariés dans votre travail RH ?",
    intent: "Le recruteur vérifie que vous connaissez les obligations de protection des données et que vous avez de bons réflexes au quotidien.",
    expectedAnswer:
      "Les RH traitent des données personnelles sensibles, comme les pièces d'identité, les salaires, les informations de santé et les évaluations, donc j'applique les principes de protection des données, comme ceux du RGPD (GDPR) lorsqu'il s'applique : ne collecter que ce qui est nécessaire à une finalité claire, ne donner accès qu'aux personnes qui en ont besoin, ne conserver les données que le temps requis et informer les salariés de l'usage qui en est fait. Concrètement, je range les fichiers dans des outils RH sécurisés plutôt que dans des dossiers personnels ou des pièces jointes, j'utilise le chiffrement ou une protection par mot de passe pour envoyer des documents, j'évite d'évoquer des situations individuelles dans des espaces ouverts et je verrouille mon écran. Les données de santé et les autres catégories particulières exigent une protection renforcée. Si je soupçonne une violation de données, comme un fichier de paie envoyé à la mauvaise personne, je la signale immédiatement au délégué à la protection des données (DPO), car il peut exister des délais légaux de notification.",
    explanation:
      "La protection des données en RH associe des principes juridiques et des réflexes quotidiens. Savoir réagir à une violation est essentiel.",
    tips: ["Mentionnez la minimisation, le contrôle des accès et la durée de conservation.", "Donnez des réflexes du quotidien.", "Expliquez quoi faire en cas de violation de données."],
    commonMistakes: ["Envoyer des fichiers de paie par e-mail sans protection.", "Conserver indéfiniment les données des candidats."],
    followUpQuestions: ["Combien de temps conserver les données des candidats non retenus ?", "Qui doit avoir accès aux évaluations de performance ?"],
  },
  'job-059': {
    question: "Parlez-moi d'une fois où vous avez accompagné un manager dans une conversation difficile, comme un licenciement ou un problème de performance.",
    intent: "Le recruteur évalue des compétences avancées de HR business partner : préparation, équité et humanité dans les situations difficiles.",
    expectedAnswer:
      "Situation : un manager d'équipe voulait licencier un collaborateur dont la performance avait fortement baissé depuis six mois, mais aucun retour n'avait été documenté. Tâche : en tant que HR business partner, je devais m'assurer que le processus soit équitable, juridiquement solide et humain. Action : j'ai expliqué au manager qu'il fallait d'abord un plan d'amélioration de la performance clair : attentes documentées, retours réguliers et accompagnement. Je l'ai aidé à préparer le premier entretien avec des faits et des exemples, et je l'ai encouragé à poser des questions ouvertes. Pendant cet entretien, le collaborateur a évoqué une situation familiale difficile. Nous avons temporairement adapté ses horaires et l'avons orienté vers le programme d'aide aux salariés, tout en maintenant des objectifs clairs. Nous avons fait des points toutes les deux semaines, auxquels j'assistais si nécessaire. Résultat : au bout de trois mois, sa performance s'était nettement améliorée et le licenciement n'était plus nécessaire. Le manager a ensuite reconnu que la démarche lui avait appris à traiter les problèmes plus tôt, et nous avons créé un court guide pour les managers sur les entretiens de performance.",
    explanation:
      "Un bon accompagnement RH équilibre équité, exigences légales et empathie, et aide les managers à traiter les problèmes tôt, en s'appuyant sur des faits.",
    tips: ["Montrez une préparation fondée sur des faits et un processus.", "Équilibrez empathie et attentes claires.", "Mentionnez ce que le manager a appris."],
    commonMistakes: ["Soutenir un licenciement sans documentation ni processus équitable.", "Éviter la conversation difficile."],
    followUpQuestions: ["Et si la performance ne s'était pas améliorée ?", "Comment préparez-vous un manager à une réaction émotionnelle ?"],
  },
  'job-060': {
    question: "Comment rendriez-vous le processus de recrutement d'une entreprise plus équitable et plus inclusif ?",
    intent: "Le recruteur évalue des connaissances avancées sur les biais, l'équité et l'amélioration mesurable en RH.",
    expectedAnswer:
      "Je commencerais par mesurer la situation actuelle : à chaque étape du processus, des candidatures aux offres, comparer les taux de passage entre groupes lorsque les données peuvent être collectées légalement et de façon anonyme, pour voir où les écarts apparaissent. J'agirais ensuite sur les étapes à plus fort impact. Offres d'emploi : supprimer les exigences inutiles, comme un diplôme quand les compétences comptent davantage, et utiliser un langage inclusif. Sourcing : élargir les canaux pour toucher des candidats plus divers. Présélection : utiliser des critères clairs et, si possible, examiner les candidatures sans nom ni photo. Entretiens : questions structurées, grilles d'évaluation, jurys diversifiés et formation des recruteurs aux biais. Décisions : discuter des candidats au regard des critères plutôt que du « fit », et harmoniser les notes entre recruteurs. Accessibilité : proposer des aménagements aux candidats en situation de handicap. J'examinerais attentivement les outils de présélection automatisée, car ils peuvent reproduire des biais historiques. Enfin, je suivrais les indicateurs dans le temps, je les partagerais avec la direction et j'ajusterais, en traitant l'inclusion comme une composante de la qualité du recrutement plutôt que comme une initiative à part.",
    explanation:
      "Un recrutement équitable se construit par la mesure, des processus structurés et la responsabilisation, pas seulement par de bonnes intentions.",
    tips: ["Commencez par les données de chaque étape.", "Proposez des changements concrets à chaque étape.", "Mentionnez les risques de la présélection automatisée."],
    commonMistakes: ["S'appuyer uniquement sur une formation aux biais inconscients.", "Collecter des données sur la diversité sans garanties juridiques et de confidentialité."],
    followUpQuestions: ["Comment évalueriez-vous les biais d'un outil de présélection par IA ?", "Comment définissez-vous le « culture fit » sans exclure des personnes ?"],
  },
};
