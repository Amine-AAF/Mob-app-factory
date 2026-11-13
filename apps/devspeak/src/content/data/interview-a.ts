import type { Lesson } from '../types';

export const interviewA: Lesson[] = [
  // ---------------------------------------------------------------------------
  // iv-01 — Tell me about yourself
  // ---------------------------------------------------------------------------
  {
    id: 'iv-01',
    moduleId: 'interview',
    topic: 'junior',
    title: "Tell me about yourself",
    titleTranslation: {
      fr: "Parlez-moi de vous",
      es: "Háblame de ti",
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 8,
    roles: ['student', 'any'],
    objective: "Give a short, structured introduction that connects your background to the job.",
    objectiveTranslation: {
      fr: "Faire une présentation courte et structurée qui relie votre parcours au poste.",
      es: "Hacer una presentación breve y estructurada que relacione tu trayectoria con el puesto.",
    },
    situation: "Your first technical interview starts, and the interviewer asks you to introduce yourself.",
    situationTranslation: {
      fr: "Votre premier entretien technique commence et le recruteur vous demande de vous présenter.",
      es: "Empieza tu primera entrevista técnica y el entrevistador te pide que te presentes.",
    },
    vocabulary: [
      {
        term: "background",
        definition: "Your education, experience and skills so far.",
        translation: { fr: "parcours", es: "trayectoria / formación" },
      },
      {
        term: "internship",
        definition: "A short period of work in a company, usually during or after your studies.",
        translation: { fr: "stage", es: "prácticas" },
      },
      {
        term: "final project",
        definition: "A large project you complete at the end of a course or degree.",
        translation: { fr: "projet de fin d'études", es: "proyecto final" },
      },
      {
        term: "to be responsible for",
        definition: "To be the person in charge of a task or part of a project.",
        translation: { fr: "être responsable de", es: "ser responsable de" },
      },
      {
        term: "to contribute",
        definition: "To give your work or ideas to help a team or product succeed.",
        translation: { fr: "contribuer", es: "contribuir" },
      },
    ],
    expressions: [
      {
        phrase: "I recently finished a degree in…",
        usage: "Use it to start with your most recent education in one clear sentence.",
        translation: {
          fr: "J'ai récemment terminé un diplôme en…",
          es: "Hace poco terminé una carrera en…",
        },
      },
      {
        phrase: "I was responsible for…",
        usage: "Use it to say exactly which part of a team project was yours.",
        translation: { fr: "J'étais responsable de…", es: "Yo era responsable de…" },
      },
      {
        phrase: "What I enjoy most is…",
        usage: "Use it to show your motivation with a concrete example, not a cliché.",
        translation: { fr: "Ce que j'aime le plus, c'est…", es: "Lo que más me gusta es…" },
      },
      {
        phrase: "Right now I'm looking for a role where I can…",
        usage: "Use it to finish your introduction by linking it to the job.",
        translation: {
          fr: "En ce moment, je cherche un poste où je peux…",
          es: "Ahora mismo busco un puesto en el que pueda…",
        },
      },
      {
        phrase: "In short,…",
        usage: "Use it to summarize your profile in one sentence at the end.",
        translation: { fr: "En résumé,…", es: "En resumen,…" },
      },
    ],
    dialogue: {
      context: "A video interview for a junior developer position.",
      lines: [
        {
          speaker: "Interviewer",
          text: "Thanks for joining, Amara. To start, can you tell me a bit about yourself?",
          translation: {
            fr: "Merci d'être là, Amara. Pour commencer, pouvez-vous me parler un peu de vous ?",
            es: "Gracias por conectarte, Amara. Para empezar, ¿puedes hablarme un poco de ti?",
          },
        },
        {
          speaker: "Candidate",
          text: "Sure. I recently finished a software development program, where I focused on Java and React.",
          translation: {
            fr: "Bien sûr. J'ai récemment terminé une formation en développement logiciel, où je me suis concentrée sur Java et React.",
            es: "Claro. Hace poco terminé una formación en desarrollo de software, centrada en Java y React.",
          },
        },
        {
          speaker: "Candidate",
          text: "For my final project, I built the REST API for a booking app with three classmates.",
          translation: {
            fr: "Pour mon projet de fin d'études, j'ai développé l'API REST d'une application de réservation avec trois camarades.",
            es: "En mi proyecto final, desarrollé la API REST de una app de reservas con tres compañeros.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Nice. You mentioned an internship in your CV. What did you do there?",
          translation: {
            fr: "Très bien. Vous mentionnez un stage dans votre CV. Qu'est-ce que vous y faisiez ?",
            es: "Muy bien. Mencionas unas prácticas en tu CV. ¿Qué hacías allí?",
          },
        },
        {
          speaker: "Candidate",
          text: "Mostly bug fixes and unit tests. I also learned how a real team works with pull requests and code reviews.",
          translation: {
            fr: "Surtout des corrections de bugs et des tests unitaires. J'ai aussi appris comment une vraie équipe travaille avec les pull requests et les code reviews.",
            es: "Sobre todo corrección de bugs y tests unitarios. También aprendí cómo trabaja un equipo real con pull requests y code reviews.",
          },
        },
        {
          speaker: "Interviewer",
          text: "And why are you interested in this role?",
          translation: {
            fr: "Et pourquoi ce poste vous intéresse-t-il ?",
            es: "¿Y por qué te interesa este puesto?",
          },
        },
        {
          speaker: "Candidate",
          text: "I'm looking for a team where I can keep learning from experienced engineers and work on a real product.",
          translation: {
            fr: "Je cherche une équipe où je peux continuer à apprendre auprès d'ingénieurs expérimentés et travailler sur un vrai produit.",
            es: "Busco un equipo en el que pueda seguir aprendiendo de ingenieros con experiencia y trabajar en un producto real.",
          },
        },
        {
          speaker: "Interviewer",
          text: "That makes sense. Thanks, that's a clear overview.",
          translation: {
            fr: "C'est logique. Merci, c'est une présentation claire.",
            es: "Tiene sentido. Gracias, es un resumen muy claro.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-01-q1',
        type: 'choice',
        prompt: "What is the best structure for \"Tell me about yourself\"?",
        options: [
          "Your full life story, starting from childhood",
          "Present, relevant past experience, then why you want this role",
          "A list of every technology you have ever used",
          "Questions about the salary and holidays",
        ],
        correctIndex: 1,
        explanation: "A short present–past–future structure keeps the answer focused and links your profile to the job.",
      },
      {
        id: 'iv-01-q2',
        type: 'fill',
        prompt: "For my final project, I was ___ for the database design.",
        options: ["responsible", "charge", "owner", "in duty"],
        correctIndex: 0,
        explanation: "The natural expression is \"to be responsible for\" something.",
      },
      {
        id: 'iv-01-q3',
        type: 'choice',
        prompt: "Which sentence is the most natural way to end your introduction?",
        options: [
          "So, that's all, I think.",
          "I am the perfect candidate and you must hire me.",
          "Right now I'm looking for a role where I can keep learning and contribute to a real product.",
        ],
        correctIndex: 2,
        explanation: "It ends with a clear, honest goal that connects to the role, without overpromising.",
      },
    ],
    interview: {
      path: 'junior',
      question: "Tell me about yourself.",
      questionTranslation: {
        fr: "Parlez-moi de vous.",
        es: "Háblame de ti.",
      },
      explanation: "The interviewer is not asking for your life story. They want to see if you can communicate clearly, pick what is relevant to the job, and explain your motivation in about one or two minutes.",
      explanationTranslation: {
        fr: "Le recruteur ne vous demande pas votre biographie. Il veut voir si vous savez communiquer clairement, choisir ce qui est pertinent pour le poste et expliquer votre motivation en une ou deux minutes environ.",
        es: "El entrevistador no te pide tu biografía. Quiere ver si sabes comunicar con claridad, elegir lo que es relevante para el puesto y explicar tu motivación en uno o dos minutos aproximadamente.",
      },
      exampleAnswer: "Sure. I'm a junior developer, and I recently finished a two-year software development program. During my studies I focused mostly on web development, with Java on the back end and React on the front end. For my final project, I worked in a team of four to build a booking app for a local sports club, and I was responsible for the REST API and the database design. Before that, I did a three-month internship where I fixed bugs, wrote unit tests and learned how a real team uses pull requests and code reviews. What I enjoy most is turning a vague problem into something that works and is easy to maintain. Right now I'm looking for a team where I can keep learning from experienced engineers and contribute to a real product.",
      exampleAnswerTranslation: {
        fr: "Bien sûr. Je suis développeuse junior et j'ai récemment terminé une formation de deux ans en développement logiciel. Pendant mes études, je me suis surtout concentrée sur le développement web, avec Java côté back-end et React côté front-end. Pour mon projet de fin d'études, j'ai travaillé dans une équipe de quatre personnes sur une application de réservation pour un club de sport local, et j'étais responsable de l'API REST et de la conception de la base de données. Avant cela, j'ai fait un stage de trois mois où j'ai corrigé des bugs, écrit des tests unitaires et appris comment une vraie équipe utilise les pull requests et les code reviews. Ce que j'aime le plus, c'est transformer un problème flou en quelque chose qui fonctionne et qui est facile à maintenir. En ce moment, je cherche une équipe où je peux continuer à apprendre auprès d'ingénieurs expérimentés et contribuer à un vrai produit.",
        es: "Claro. Soy desarrolladora junior y hace poco terminé una formación de dos años en desarrollo de software. Durante mis estudios me centré sobre todo en el desarrollo web, con Java en el back-end y React en el front-end. En mi proyecto final trabajé en un equipo de cuatro personas en una app de reservas para un club deportivo local, y yo era responsable de la API REST y del diseño de la base de datos. Antes de eso, hice unas prácticas de tres meses en las que corregí bugs, escribí tests unitarios y aprendí cómo un equipo real usa los pull requests y las code reviews. Lo que más me gusta es convertir un problema poco definido en algo que funcione y sea fácil de mantener. Ahora mismo busco un equipo en el que pueda seguir aprendiendo de ingenieros con experiencia y contribuir a un producto real.",
      },
      alternatives: [
        "I've just graduated in computer science, and I specialized in…",
        "The part of the project I owned was…",
        "What motivates me most in this job is…",
        "I'd love to join a team where I can grow as a developer and…",
      ],
      practice: "Write your own introduction in four sentences: who you are now, one relevant project or experience, what you enjoy, and what you are looking for. Then say it out loud, record yourself, and keep it under 90 seconds.",
      selfAssessment: [
        "I started with who I am now, not with my childhood or school history.",
        "I gave at least one concrete project or experience with my specific role.",
        "I connected my introduction to the job I am applying for.",
        "My answer took between one and two minutes and did not sound memorized.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-02 — Describe a project you are proud of
  // ---------------------------------------------------------------------------
  {
    id: 'iv-02',
    moduleId: 'interview',
    topic: 'junior',
    title: "Describe a project you are proud of",
    titleTranslation: {
      fr: "Décrivez un projet dont vous êtes fier",
      es: "Describe un proyecto del que estés orgulloso",
    },
    level: 'beginner',
    premium: false,
    estimatedMinutes: 9,
    roles: ['student', 'any'],
    objective: "Present a project with a clear problem, your personal contribution and the result.",
    objectiveTranslation: {
      fr: "Présenter un projet avec un problème clair, votre contribution personnelle et le résultat.",
      es: "Presentar un proyecto con un problema claro, tu aportación personal y el resultado.",
    },
    situation: "The interviewer asks you to talk about a project that you are proud of.",
    situationTranslation: {
      fr: "Le recruteur vous demande de parler d'un projet dont vous êtes fier.",
      es: "El entrevistador te pide que hables de un proyecto del que te sientas orgulloso.",
    },
    vocabulary: [
      {
        term: "constraint",
        definition: "A limit or rule that a solution must respect.",
        translation: { fr: "contrainte", es: "restricción" },
      },
      {
        term: "to own (a feature)",
        definition: "To be the main person responsible for building and maintaining a feature.",
        translation: { fr: "être responsable (d'une fonctionnalité)", es: "encargarse (de una funcionalidad)" },
      },
      {
        term: "data loss",
        definition: "A situation where information is deleted or overwritten by mistake.",
        translation: { fr: "perte de données", es: "pérdida de datos" },
      },
      {
        term: "integration test",
        definition: "A test that checks that several parts of a system work correctly together.",
        translation: { fr: "test d'intégration", es: "test de integración" },
      },
      {
        term: "to redesign",
        definition: "To plan and build something again in a different, better way.",
        translation: { fr: "repenser / reconcevoir", es: "rediseñar" },
      },
    ],
    expressions: [
      {
        phrase: "The project I'm most proud of is…",
        usage: "Use it to introduce your project directly, in the first sentence.",
        translation: {
          fr: "Le projet dont je suis le plus fier, c'est…",
          es: "El proyecto del que estoy más orgulloso es…",
        },
      },
      {
        phrase: "The main challenge was…",
        usage: "Use it to explain the difficult part before you explain your solution.",
        translation: { fr: "Le principal défi, c'était…", es: "El principal reto era…" },
      },
      {
        phrase: "My part was…",
        usage: "Use it to make your personal contribution clear in a team project.",
        translation: { fr: "Ma partie, c'était…", es: "Mi parte era…" },
      },
      {
        phrase: "In the end, …",
        usage: "Use it to present the result of the project.",
        translation: { fr: "Au final, …", es: "Al final, …" },
      },
      {
        phrase: "If I did it again, I would…",
        usage: "Use it to show that you can reflect on your work and improve.",
        translation: { fr: "Si je devais le refaire, je…", es: "Si lo volviera a hacer, …" },
      },
    ],
    dialogue: {
      context: "An in-person interview for a junior full-stack position.",
      lines: [
        {
          speaker: "Interviewer",
          text: "Can you describe a project you're proud of?",
          translation: {
            fr: "Pouvez-vous décrire un projet dont vous êtes fier ?",
            es: "¿Puedes describir un proyecto del que estés orgulloso?",
          },
        },
        {
          speaker: "Candidate",
          text: "Sure. It's an expense-tracking app I built with two classmates. It had to work offline and sync later.",
          translation: {
            fr: "Bien sûr. C'est une application de suivi des dépenses que j'ai développée avec deux camarades. Elle devait fonctionner hors ligne et se synchroniser plus tard.",
            es: "Claro. Es una app para controlar gastos que hice con dos compañeros. Tenía que funcionar sin conexión y sincronizarse después.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Interesting. What was your part?",
          translation: {
            fr: "Intéressant. Quelle était votre partie ?",
            es: "Interesante. ¿Cuál era tu parte?",
          },
        },
        {
          speaker: "Candidate",
          text: "I owned the sync logic. My first version overwrote server data, and we lost some entries during testing.",
          translation: {
            fr: "J'étais responsable de la logique de synchronisation. Ma première version écrasait les données du serveur, et on a perdu des entrées pendant les tests.",
            es: "Yo me encargaba de la lógica de sincronización. Mi primera versión sobrescribía los datos del servidor y perdimos algunas entradas durante las pruebas.",
          },
        },
        {
          speaker: "Interviewer",
          text: "What did you do about that?",
          translation: {
            fr: "Qu'avez-vous fait pour régler ça ?",
            es: "¿Qué hiciste al respecto?",
          },
        },
        {
          speaker: "Candidate",
          text: "I redesigned it to send each change with a timestamp, and the server merged them. I also added integration tests.",
          translation: {
            fr: "Je l'ai repensée pour envoyer chaque modification avec un horodatage, et le serveur les fusionnait. J'ai aussi ajouté des tests d'intégration.",
            es: "La rediseñé para enviar cada cambio con una marca de tiempo, y el servidor los fusionaba. También añadí tests de integración.",
          },
        },
        {
          speaker: "Interviewer",
          text: "If you did it again, what would you change?",
          translation: {
            fr: "Si vous deviez le refaire, que changeriez-vous ?",
            es: "Si lo volvieras a hacer, ¿qué cambiarías?",
          },
        },
        {
          speaker: "Candidate",
          text: "I'd think about conflicts from day one, instead of discovering the problem during testing.",
          translation: {
            fr: "Je penserais aux conflits dès le premier jour, au lieu de découvrir le problème pendant les tests.",
            es: "Pensaría en los conflictos desde el primer día, en lugar de descubrir el problema durante las pruebas.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-02-q1',
        type: 'choice',
        prompt: "What should you make very clear when you describe a team project?",
        options: [
          "The names of all your teammates",
          "Your own contribution and decisions",
          "How long the project took to the exact day",
        ],
        correctIndex: 1,
        explanation: "Interviewers want to understand what you personally did, not only what the team achieved.",
      },
      {
        id: 'iv-02-q2',
        type: 'fill',
        prompt: "The main ___ was making the app work offline.",
        options: ["problem solve", "challenge", "difficult", "trouble making"],
        correctIndex: 1,
        explanation: "\"The main challenge was…\" is the natural way to introduce the hard part of a project.",
      },
      {
        id: 'iv-02-q3',
        type: 'choice',
        prompt: "Which answer to \"What would you change?\" sounds the most professional?",
        options: [
          "Nothing, it was perfect.",
          "I don't know, I don't remember.",
          "I'd blame the tester less.",
          "I'd think about data conflicts from the start.",
        ],
        correctIndex: 3,
        explanation: "It shows honest reflection and a concrete lesson learned.",
      },
    ],
    interview: {
      path: 'junior',
      question: "Describe a project you are proud of.",
      questionTranslation: {
        fr: "Décrivez un projet dont vous êtes fier.",
        es: "Describe un proyecto del que estés orgulloso.",
      },
      explanation: "The interviewer wants to see how you think about real problems: what the project was, what you personally did, how you handled a difficulty, and what you learned. Honesty about mistakes is a strength here.",
      explanationTranslation: {
        fr: "Le recruteur veut voir comment vous abordez des problèmes concrets : en quoi consistait le projet, ce que vous avez fait personnellement, comment vous avez géré une difficulté et ce que vous avez appris. Être honnête sur vos erreurs est un point fort ici.",
        es: "El entrevistador quiere ver cómo piensas ante problemas reales: en qué consistía el proyecto, qué hiciste tú personalmente, cómo resolviste una dificultad y qué aprendiste. Ser sincero sobre los errores es un punto a favor.",
      },
      exampleAnswer: "The project I'm most proud of is a small expense-tracking app I built with two classmates. The idea was simple, but we gave ourselves a real constraint: it had to work offline and sync when the connection came back. I owned the sync logic. My first version just overwrote the server data, and during testing we lost some entries. So I redesigned it: each change was saved locally with a timestamp, and the server merged the changes instead of replacing everything. It wasn't a perfect conflict strategy, but it fixed the data-loss problem. I also added integration tests for the sync flow, and they caught two bugs before our demo. What I'm proud of isn't only the result. It's that I found a weakness in my own design, explained it honestly to the team and fixed it.",
      exampleAnswerTranslation: {
        fr: "Le projet dont je suis le plus fier, c'est une petite application de suivi des dépenses que j'ai développée avec deux camarades. L'idée était simple, mais on s'était imposé une vraie contrainte : elle devait fonctionner hors ligne et se synchroniser au retour de la connexion. J'étais responsable de la logique de synchronisation. Ma première version écrasait simplement les données du serveur, et pendant les tests on a perdu des entrées. Je l'ai donc repensée : chaque modification était enregistrée localement avec un horodatage, et le serveur fusionnait les modifications au lieu de tout remplacer. Ce n'était pas une stratégie de gestion des conflits parfaite, mais ça a réglé le problème de perte de données. J'ai aussi ajouté des tests d'intégration pour le flux de synchronisation, et ils ont détecté deux bugs avant notre démo. Ce dont je suis fier, ce n'est pas seulement le résultat. C'est d'avoir trouvé une faiblesse dans ma propre conception, de l'avoir expliquée honnêtement à l'équipe et de l'avoir corrigée.",
        es: "El proyecto del que estoy más orgulloso es una pequeña app para controlar gastos que hice con dos compañeros. La idea era sencilla, pero nos pusimos una restricción real: tenía que funcionar sin conexión y sincronizarse cuando volviera la conexión. Yo me encargaba de la lógica de sincronización. Mi primera versión simplemente sobrescribía los datos del servidor, y durante las pruebas perdimos algunas entradas. Así que la rediseñé: cada cambio se guardaba localmente con una marca de tiempo y el servidor fusionaba los cambios en lugar de reemplazarlo todo. No era una estrategia de conflictos perfecta, pero resolvió la pérdida de datos. También añadí tests de integración para el flujo de sincronización, y detectaron dos bugs antes de nuestra demo. De lo que estoy orgulloso no es solo del resultado, sino de haber encontrado un punto débil en mi propio diseño, haberlo explicado con sinceridad al equipo y haberlo corregido.",
      },
      alternatives: [
        "One project I'm really happy with is…",
        "The tricky part was…",
        "I took ownership of…",
        "Looking back, I'd do things differently by…",
      ],
      practice: "Choose one project and write five short notes: the goal, the main challenge, your personal role, the result, and what you would change. Then tell the story out loud in under two minutes, using \"I\" for your own work.",
      selfAssessment: [
        "I explained what the project was in one or two simple sentences.",
        "I made my personal contribution clear by using \"I\", not only \"we\".",
        "I described a real difficulty and how I solved it.",
        "I mentioned a result or a lesson learned without exaggerating.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-03 — What do you do when you don't know the answer?
  // ---------------------------------------------------------------------------
  {
    id: 'iv-03',
    moduleId: 'interview',
    topic: 'junior',
    title: "What do you do when you don't know the answer?",
    titleTranslation: {
      fr: "Que faites-vous quand vous ne connaissez pas la réponse ?",
      es: "¿Qué haces cuando no sabes la respuesta?",
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 10,
    roles: ['student', 'any'],
    objective: "Admit gaps in your knowledge with confidence and explain how you find answers.",
    objectiveTranslation: {
      fr: "Reconnaître vos lacunes avec assurance et expliquer comment vous trouvez des réponses.",
      es: "Reconocer tus lagunas con seguridad y explicar cómo encuentras las respuestas.",
    },
    situation: "The interviewer wants to know how you behave when you are stuck or face something new.",
    situationTranslation: {
      fr: "Le recruteur veut savoir comment vous réagissez quand vous êtes bloqué ou face à quelque chose de nouveau.",
      es: "El entrevistador quiere saber cómo actúas cuando te bloqueas o te enfrentas a algo nuevo.",
    },
    vocabulary: [
      {
        term: "to reproduce (a bug)",
        definition: "To make a problem happen again on purpose so you can study it.",
        translation: { fr: "reproduire (un bug)", es: "reproducir (un bug)" },
      },
      {
        term: "to be stuck",
        definition: "To be unable to make progress on a task.",
        translation: { fr: "être bloqué", es: "estar atascado" },
      },
      {
        term: "to timebox",
        definition: "To decide in advance how much time you will spend on something.",
        translation: { fr: "limiter dans le temps", es: "limitar el tiempo" },
      },
      {
        term: "to escalate",
        definition: "To ask someone with more experience or authority for help with a problem.",
        translation: { fr: "faire remonter", es: "escalar" },
      },
      {
        term: "to reason out loud",
        definition: "To say your thinking process aloud while you solve a problem.",
        translation: { fr: "réfléchir à voix haute", es: "razonar en voz alta" },
      },
    ],
    expressions: [
      {
        phrase: "I'm not sure, but my best guess is…",
        usage: "Use it to give a reasoned answer while being honest about your uncertainty.",
        translation: {
          fr: "Je n'en suis pas sûr, mais je dirais que…",
          es: "No estoy seguro, pero diría que…",
        },
      },
      {
        phrase: "I haven't worked with that yet, but here's how I'd approach it.",
        usage: "Use it to turn a knowledge gap into a demonstration of your method.",
        translation: {
          fr: "Je n'ai pas encore travaillé avec ça, mais voici comment je m'y prendrais.",
          es: "Todavía no he trabajado con eso, pero así es como lo abordaría.",
        },
      },
      {
        phrase: "Let me think about that for a second.",
        usage: "Use it to take a short pause before answering instead of rushing.",
        translation: {
          fr: "Laissez-moi réfléchir une seconde.",
          es: "Déjame pensarlo un segundo.",
        },
      },
      {
        phrase: "Here's what I've tried so far.",
        usage: "Use it when you ask a colleague for help, so they can help you faster.",
        translation: {
          fr: "Voici ce que j'ai essayé jusqu'ici.",
          es: "Esto es lo que he probado hasta ahora.",
        },
      },
      {
        phrase: "I'd want to double-check that before relying on it.",
        usage: "Use it to show that you verify information instead of guessing.",
        translation: {
          fr: "Je voudrais vérifier ça avant de m'y fier.",
          es: "Querría comprobarlo antes de confiar en ello.",
        },
      },
    ],
    dialogue: {
      context: "A behavioral round in an interview for a junior back-end role.",
      lines: [
        {
          speaker: "Interviewer",
          text: "What do you usually do when you don't know the answer to a technical problem?",
          translation: {
            fr: "Que faites-vous en général quand vous ne connaissez pas la réponse à un problème technique ?",
            es: "¿Qué sueles hacer cuando no sabes la respuesta a un problema técnico?",
          },
        },
        {
          speaker: "Candidate",
          text: "First, I'm honest about it. Then I try to reproduce the problem and read the logs and the docs.",
          translation: {
            fr: "D'abord, je le dis honnêtement. Ensuite, j'essaie de reproduire le problème et je lis les logs et la documentation.",
            es: "Primero, lo digo con sinceridad. Luego intento reproducir el problema y leo los logs y la documentación.",
          },
        },
        {
          speaker: "Interviewer",
          text: "And if that doesn't work?",
          translation: {
            fr: "Et si ça ne marche pas ?",
            es: "¿Y si eso no funciona?",
          },
        },
        {
          speaker: "Candidate",
          text: "I timebox it. If I'm still stuck after about an hour, I ask a teammate and explain what I've tried so far.",
          translation: {
            fr: "Je me fixe une limite de temps. Si je suis encore bloqué au bout d'une heure environ, je demande à un collègue en expliquant ce que j'ai déjà essayé.",
            es: "Me pongo un límite de tiempo. Si sigo atascado después de una hora más o menos, pregunto a un compañero y le explico lo que he probado.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Okay. Let's try it now: how would you find out why an API call is slow?",
          translation: {
            fr: "D'accord. Essayons maintenant : comment trouveriez-vous pourquoi un appel d'API est lent ?",
            es: "Vale. Probemos ahora: ¿cómo averiguarías por qué una llamada a una API es lenta?",
          },
        },
        {
          speaker: "Candidate",
          text: "I haven't profiled an API in production yet, but here's how I'd approach it.",
          translation: {
            fr: "Je n'ai pas encore profilé d'API en production, mais voici comment je m'y prendrais.",
            es: "Todavía no he perfilado una API en producción, pero así es como lo abordaría.",
          },
        },
        {
          speaker: "Candidate",
          text: "I'd measure where the time goes: the network, the application code or the database. My best guess would be a slow query, so I'd check the query plan.",
          translation: {
            fr: "Je mesurerais où passe le temps : le réseau, le code applicatif ou la base de données. Je pencherais pour une requête lente, donc je regarderais le plan d'exécution.",
            es: "Mediría dónde se va el tiempo: la red, el código de la aplicación o la base de datos. Apostaría por una consulta lenta, así que revisaría el plan de ejecución.",
          },
        },
        {
          speaker: "Interviewer",
          text: "That's a sensible way to break it down.",
          translation: {
            fr: "C'est une façon logique de décomposer le problème.",
            es: "Es una forma sensata de desglosar el problema.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-03-q1',
        type: 'choice',
        prompt: "In an interview, you don't know the answer to a question. What is the best reaction?",
        options: [
          "Invent a confident answer so you don't look weak.",
          "Say you don't know, then explain how you would reason or find out.",
          "Stay silent until the interviewer changes the question.",
        ],
        correctIndex: 1,
        explanation: "Honesty plus a clear method shows maturity, which matters more than knowing every fact.",
      },
      {
        id: 'iv-03-q2',
        type: 'fill',
        prompt: "When I ask for help, I always explain what I've ___ so far.",
        options: ["try", "tried", "trying", "tries"],
        correctIndex: 1,
        explanation: "\"What I've tried\" uses the present perfect, so you need the past participle \"tried\".",
      },
      {
        id: 'iv-03-q3',
        type: 'choice',
        prompt: "What does \"to timebox\" a problem mean?",
        options: [
          "To give up on it immediately",
          "To give it to another team",
          "To decide in advance how long you will work on it before changing approach",
          "To work on it at night",
        ],
        correctIndex: 2,
        explanation: "Timeboxing sets a time limit, after which you ask for help or try something else.",
      },
    ],
    interview: {
      path: 'junior',
      question: "What do you do when you don't know the answer?",
      questionTranslation: {
        fr: "Que faites-vous quand vous ne connaissez pas la réponse ?",
        es: "¿Qué haces cuando no sabes la respuesta?",
      },
      explanation: "Nobody knows everything, and the interviewer knows it. They are checking whether you are honest, whether you have a method to investigate, and whether you ask for help at the right time, not too early and not too late.",
      explanationTranslation: {
        fr: "Personne ne sait tout, et le recruteur le sait. Il vérifie si vous êtes honnête, si vous avez une méthode pour enquêter et si vous demandez de l'aide au bon moment, ni trop tôt ni trop tard.",
        es: "Nadie lo sabe todo, y el entrevistador lo sabe. Comprueba si eres sincero, si tienes un método para investigar y si pides ayuda en el momento adecuado, ni demasiado pronto ni demasiado tarde.",
      },
      exampleAnswer: "First, I try not to guess and pretend. If I don't know something, I say so clearly, and then I explain how I'd find out. For example, during my internship I was asked to look into a memory issue in a service I'd never worked on. I didn't know where to start, so I reproduced the problem locally, read the logs and searched our internal docs. When I was still stuck after about an hour, I sent a short message to a senior developer explaining what I'd tried and what I suspected. That made it easy for her to point me in the right direction quickly. In an interview, I'd do something similar: share what I do know, reason out loud, and be clear about where my knowledge stops.",
      exampleAnswerTranslation: {
        fr: "D'abord, j'essaie de ne pas deviner en faisant semblant de savoir. Si je ne sais pas quelque chose, je le dis clairement, puis j'explique comment je trouverais la réponse. Par exemple, pendant mon stage, on m'a demandé d'étudier un problème de mémoire dans un service sur lequel je n'avais jamais travaillé. Je ne savais pas par où commencer, alors j'ai reproduit le problème en local, j'ai lu les logs et j'ai cherché dans notre documentation interne. Comme j'étais encore bloqué au bout d'une heure environ, j'ai envoyé un court message à une développeuse senior en expliquant ce que j'avais essayé et ce que je soupçonnais. Ça lui a permis de m'orienter rapidement dans la bonne direction. En entretien, je ferais à peu près la même chose : partager ce que je sais, réfléchir à voix haute et être clair sur les limites de mes connaissances.",
        es: "Primero, intento no adivinar ni fingir. Si no sé algo, lo digo claramente y luego explico cómo lo averiguaría. Por ejemplo, durante mis prácticas me pidieron que investigara un problema de memoria en un servicio en el que nunca había trabajado. No sabía por dónde empezar, así que reproduje el problema en local, leí los logs y busqué en nuestra documentación interna. Como seguía atascado después de una hora más o menos, envié un mensaje corto a una desarrolladora senior explicándole lo que había probado y lo que sospechaba. Eso le facilitó orientarme rápidamente en la dirección correcta. En una entrevista haría algo parecido: compartir lo que sí sé, razonar en voz alta y dejar claro hasta dónde llegan mis conocimientos.",
      },
      alternatives: [
        "I'd rather be upfront and say I don't know than give you a wrong answer.",
        "My first step would be to narrow down where the problem is.",
        "If I'm still blocked after a reasonable amount of time, I reach out to…",
        "I don't know the exact answer, but I can tell you how I'd reason about it.",
      ],
      practice: "Pick a technology you have never used, for example a message queue. Answer out loud: \"I haven't used it yet, but here's how I'd approach learning it,\" and describe at least three concrete steps, including when you would ask for help.",
      selfAssessment: [
        "I clearly admitted what I didn't know, without apologizing too much.",
        "I described concrete investigation steps (reproduce, logs, docs, tests).",
        "I explained when and how I would ask a teammate for help.",
        "I gave a real example from my studies, internship or projects.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-04 — Interface vs abstract class in Java
  // ---------------------------------------------------------------------------
  {
    id: 'iv-04',
    moduleId: 'interview',
    topic: 'java',
    title: "Interface vs abstract class in Java",
    titleTranslation: {
      fr: "Interface ou classe abstraite en Java",
      es: "Interfaz frente a clase abstracta en Java",
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 10,
    roles: ['java'],
    objective: "Explain the difference between interfaces and abstract classes and when to choose each.",
    objectiveTranslation: {
      fr: "Expliquer la différence entre interfaces et classes abstraites, et quand choisir l'une ou l'autre.",
      es: "Explicar la diferencia entre interfaces y clases abstractas, y cuándo elegir cada una.",
    },
    situation: "A Java interviewer asks a classic object-oriented design question.",
    situationTranslation: {
      fr: "Un recruteur Java pose une question classique de conception orientée objet.",
      es: "Un entrevistador de Java hace una pregunta clásica de diseño orientado a objetos.",
    },
    vocabulary: [
      {
        term: "contract",
        definition: "A set of methods that a type promises to provide, without saying how.",
        translation: { fr: "contrat", es: "contrato" },
      },
      {
        term: "default method",
        definition: "A method with a body declared in an interface, available since Java 8.",
        translation: { fr: "méthode par défaut", es: "método por defecto" },
      },
      {
        term: "instance state",
        definition: "The fields that hold data for each individual object.",
        translation: { fr: "état d'instance", es: "estado de instancia" },
      },
      {
        term: "multiple inheritance",
        definition: "The ability of a type to inherit from more than one parent type.",
        translation: { fr: "héritage multiple", es: "herencia múltiple" },
      },
      {
        term: "rule of thumb",
        definition: "A simple practical guideline based on experience rather than a strict rule.",
        translation: { fr: "règle empirique", es: "regla general" },
      },
    ],
    expressions: [
      {
        phrase: "The key difference is…",
        usage: "Use it to start a comparison with the most important point.",
        translation: { fr: "La différence principale, c'est…", es: "La diferencia clave es…" },
      },
      {
        phrase: "My rule of thumb is…",
        usage: "Use it to share a practical guideline from your own experience.",
        translation: { fr: "Ma règle empirique, c'est…", es: "Mi regla general es…" },
      },
      {
        phrase: "Since Java 8, …",
        usage: "Use it to show you know how the language has changed over versions.",
        translation: { fr: "Depuis Java 8, …", es: "Desde Java 8, …" },
      },
      {
        phrase: "It makes sense when…",
        usage: "Use it to describe the situation where a choice is appropriate.",
        translation: { fr: "C'est pertinent quand…", es: "Tiene sentido cuando…" },
      },
      {
        phrase: "In practice, I usually…",
        usage: "Use it to move from theory to what you really do in your code.",
        translation: { fr: "En pratique, je…en général", es: "En la práctica, normalmente…" },
      },
    ],
    dialogue: {
      context: "A technical interview for a Java back-end developer role.",
      lines: [
        {
          speaker: "Interviewer",
          text: "What's the difference between an interface and an abstract class in Java?",
          translation: {
            fr: "Quelle est la différence entre une interface et une classe abstraite en Java ?",
            es: "¿Cuál es la diferencia entre una interfaz y una clase abstracta en Java?",
          },
        },
        {
          speaker: "Candidate",
          text: "The key difference is that an interface defines a contract, while an abstract class is a partial implementation that can hold state.",
          translation: {
            fr: "La différence principale, c'est qu'une interface définit un contrat, alors qu'une classe abstraite est une implémentation partielle qui peut contenir un état.",
            es: "La diferencia clave es que una interfaz define un contrato, mientras que una clase abstracta es una implementación parcial que puede tener estado.",
          },
        },
        {
          speaker: "Candidate",
          text: "Also, a class can implement many interfaces but extend only one class.",
          translation: {
            fr: "Et puis, une classe peut implémenter plusieurs interfaces mais n'hériter que d'une seule classe.",
            es: "Además, una clase puede implementar varias interfaces pero solo extender una clase.",
          },
        },
        {
          speaker: "Interviewer",
          text: "But interfaces can have method bodies now, right? So what's left?",
          translation: {
            fr: "Mais les interfaces peuvent avoir des méthodes avec un corps maintenant, non ? Alors, qu'est-ce qui reste ?",
            es: "Pero ahora las interfaces pueden tener métodos con cuerpo, ¿no? Entonces, ¿qué diferencia queda?",
          },
        },
        {
          speaker: "Candidate",
          text: "Right, since Java 8 they can have default and static methods. But they still can't have instance fields or constructors.",
          translation: {
            fr: "Oui, depuis Java 8 elles peuvent avoir des méthodes default et static. Mais elles ne peuvent toujours pas avoir de champs d'instance ni de constructeurs.",
            es: "Sí, desde Java 8 pueden tener métodos default y static. Pero siguen sin poder tener campos de instancia ni constructores.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Okay. Give me an example of when you'd pick an abstract class.",
          translation: {
            fr: "D'accord. Donnez-moi un exemple où vous choisiriez une classe abstraite.",
            es: "Vale. Dame un ejemplo de cuándo elegirías una clase abstracta.",
          },
        },
        {
          speaker: "Candidate",
          text: "Say several report generators share the same fields and validation steps, and only the formatting changes. A base class with one abstract method fits well there.",
          translation: {
            fr: "Imaginons que plusieurs générateurs de rapports partagent les mêmes champs et étapes de validation, et que seul le formatage change. Une classe de base avec une méthode abstraite convient bien.",
            es: "Pongamos que varios generadores de informes comparten los mismos campos y pasos de validación, y solo cambia el formato. Ahí encaja bien una clase base con un método abstracto.",
          },
        },
        {
          speaker: "Interviewer",
          text: "That's the template method pattern. Good.",
          translation: {
            fr: "C'est le pattern template method. Très bien.",
            es: "Ese es el patrón template method. Bien.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-04-q1',
        type: 'choice',
        prompt: "Which statement about Java interfaces is correct?",
        options: [
          "An interface can declare instance fields that each object stores.",
          "An interface can have a constructor.",
          "Since Java 8, an interface can contain default and static methods.",
          "A class can implement only one interface.",
        ],
        correctIndex: 2,
        explanation: "Default and static methods were added in Java 8; interfaces still cannot hold instance state or constructors.",
      },
      {
        id: 'iv-04-q2',
        type: 'fill',
        prompt: "A class can ___ only one class, but it can implement several interfaces.",
        options: ["implement", "extend", "override", "import"],
        correctIndex: 1,
        explanation: "In Java, you \"extend\" a class and \"implement\" an interface; single class inheritance only.",
      },
      {
        id: 'iv-04-q3',
        type: 'choice',
        prompt: "Which phrase best introduces a practical guideline in your answer?",
        options: [
          "My rule of thumb is…",
          "The rule of my thumb is…",
          "As a thumb rule obligatory…",
        ],
        correctIndex: 0,
        explanation: "\"My rule of thumb is…\" is the natural idiom for a practical, experience-based guideline.",
      },
    ],
    interview: {
      path: 'java',
      question: "What is the difference between an interface and an abstract class in Java?",
      questionTranslation: {
        fr: "Quelle est la différence entre une interface et une classe abstraite en Java ?",
        es: "¿Cuál es la diferencia entre una interfaz y una clase abstracta en Java?",
      },
      explanation: "The interviewer checks that your knowledge is up to date (default methods since Java 8) and, more importantly, that you understand design: when a contract is better than shared implementation, and how each choice affects flexibility and testing.",
      explanationTranslation: {
        fr: "Le recruteur vérifie que vos connaissances sont à jour (méthodes default depuis Java 8) et surtout que vous comprenez la conception : quand un contrat vaut mieux qu'une implémentation partagée, et comment chaque choix influence la flexibilité et les tests.",
        es: "El entrevistador comprueba que tus conocimientos están actualizados (métodos default desde Java 8) y, sobre todo, que entiendes el diseño: cuándo es mejor un contrato que una implementación compartida y cómo afecta cada opción a la flexibilidad y a los tests.",
      },
      exampleAnswer: "An interface defines a contract: what a type can do. Since Java 8, it can also have default and static methods, but it can't hold instance state, only constants, and it has no constructors. A class can implement many interfaces. An abstract class is a partial implementation. It can have fields, constructors, and both abstract and concrete methods, but a class can extend only one. So my rule of thumb is: if I'm describing a capability that unrelated classes might share, like Comparable or a PaymentProcessor, I use an interface. If several closely related classes share state and common logic, an abstract class makes sense, for example a base class that handles validation and leaves one step to subclasses. In practice, I usually start with an interface, because it keeps the design flexible and easier to mock in tests.",
      exampleAnswerTranslation: {
        fr: "Une interface définit un contrat : ce qu'un type sait faire. Depuis Java 8, elle peut aussi avoir des méthodes default et static, mais elle ne peut pas contenir d'état d'instance, seulement des constantes, et elle n'a pas de constructeur. Une classe peut implémenter plusieurs interfaces. Une classe abstraite est une implémentation partielle. Elle peut avoir des champs, des constructeurs, et des méthodes abstraites comme concrètes, mais une classe ne peut en étendre qu'une seule. Ma règle empirique est donc la suivante : si je décris une capacité que des classes sans lien entre elles peuvent partager, comme Comparable ou un PaymentProcessor, j'utilise une interface. Si plusieurs classes très proches partagent un état et une logique commune, une classe abstraite est pertinente, par exemple une classe de base qui gère la validation et laisse une étape aux sous-classes. En pratique, je commence en général par une interface, parce que cela garde la conception flexible et plus facile à mocker dans les tests.",
        es: "Una interfaz define un contrato: lo que un tipo puede hacer. Desde Java 8 también puede tener métodos default y static, pero no puede tener estado de instancia, solo constantes, y no tiene constructores. Una clase puede implementar varias interfaces. Una clase abstracta es una implementación parcial. Puede tener campos, constructores y métodos tanto abstractos como concretos, pero una clase solo puede extender una. Así que mi regla general es: si describo una capacidad que pueden compartir clases sin relación entre sí, como Comparable o un PaymentProcessor, uso una interfaz. Si varias clases muy relacionadas comparten estado y lógica común, tiene sentido una clase abstracta, por ejemplo una clase base que se encarga de la validación y deja un paso a las subclases. En la práctica, suelo empezar con una interfaz, porque mantiene el diseño flexible y más fácil de mockear en los tests.",
      },
      alternatives: [
        "An interface says what a class can do; an abstract class shares how part of it is done.",
        "The main practical limit is that Java only allows single class inheritance.",
        "I'd go for an abstract class when the subclasses really share state.",
        "These days I tend to favor interfaces plus composition over deep class hierarchies.",
      ],
      practice: "Write a short answer comparing an interface and an abstract class using your own example from a project (for example notifications, payments or exporters). Include one sentence that starts with \"Since Java 8\" and one that starts with \"My rule of thumb is\".",
      selfAssessment: [
        "I mentioned multiple interface implementation versus single class inheritance.",
        "I explained that interfaces can have default and static methods but no instance state.",
        "I gave a concrete example of when to choose each one.",
        "I talked about design trade-offs, not only syntax differences.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-05 — How does garbage collection work in Java?
  // ---------------------------------------------------------------------------
  {
    id: 'iv-05',
    moduleId: 'interview',
    topic: 'java',
    title: "How does garbage collection work in Java?",
    titleTranslation: {
      fr: "Comment fonctionne le garbage collector en Java ?",
      es: "¿Cómo funciona la recolección de basura en Java?",
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 12,
    roles: ['java'],
    objective: "Explain reachability, generational collection and modern collectors with precise, measured language.",
    objectiveTranslation: {
      fr: "Expliquer l'accessibilité des objets, la collecte générationnelle et les collecteurs modernes avec un vocabulaire précis et nuancé.",
      es: "Explicar la alcanzabilidad, la recolección generacional y los recolectores modernos con un lenguaje preciso y matizado.",
    },
    situation: "A senior engineer asks you how the JVM manages memory and how you would handle GC problems in production.",
    situationTranslation: {
      fr: "Un ingénieur senior vous demande comment la JVM gère la mémoire et comment vous traiteriez des problèmes de GC en production.",
      es: "Un ingeniero senior te pregunta cómo gestiona la JVM la memoria y cómo abordarías problemas de GC en producción.",
    },
    vocabulary: [
      {
        term: "GC roots",
        definition: "Starting references, such as local variables on thread stacks and static fields, from which reachability is traced.",
        translation: { fr: "racines GC", es: "raíces del GC" },
      },
      {
        term: "reachable",
        definition: "Describes an object that can still be accessed through a chain of references from a GC root.",
        translation: { fr: "accessible / atteignable", es: "alcanzable" },
      },
      {
        term: "young generation",
        definition: "The heap area where new objects are allocated and collected frequently.",
        translation: { fr: "jeune génération", es: "generación joven" },
      },
      {
        term: "stop-the-world pause",
        definition: "A moment when the JVM pauses application threads so the collector can do its work.",
        translation: { fr: "pause stop-the-world", es: "pausa stop-the-world" },
      },
      {
        term: "memory leak",
        definition: "Memory that is never freed because objects stay referenced even though they are no longer needed.",
        translation: { fr: "fuite mémoire", es: "fuga de memoria" },
      },
    ],
    expressions: [
      {
        phrase: "At a high level, …",
        usage: "Use it to give the big picture before going into details.",
        translation: { fr: "Dans les grandes lignes, …", es: "A grandes rasgos, …" },
      },
      {
        phrase: "The underlying assumption is that…",
        usage: "Use it to explain the idea a design is based on.",
        translation: {
          fr: "L'hypothèse sous-jacente, c'est que…",
          es: "La premisa de fondo es que…",
        },
      },
      {
        phrase: "It depends on the workload, but…",
        usage: "Use it to show nuance before giving a reasonable default answer.",
        translation: {
          fr: "Ça dépend de la charge, mais…",
          es: "Depende de la carga de trabajo, pero…",
        },
      },
      {
        phrase: "Before tuning anything, I'd…",
        usage: "Use it to show you measure first instead of changing settings blindly.",
        translation: {
          fr: "Avant de régler quoi que ce soit, je…",
          es: "Antes de ajustar nada, yo…",
        },
      },
      {
        phrase: "That's a common misconception.",
        usage: "Use it politely to correct a widespread but wrong idea.",
        translation: {
          fr: "C'est une idée reçue assez répandue.",
          es: "Es un error bastante común.",
        },
      },
    ],
    dialogue: {
      context: "A senior-level Java interview focused on JVM internals.",
      lines: [
        {
          speaker: "Interviewer",
          text: "Can you walk me through how garbage collection works in Java?",
          translation: {
            fr: "Pouvez-vous m'expliquer comment fonctionne le garbage collection en Java ?",
            es: "¿Puedes explicarme cómo funciona la recolección de basura en Java?",
          },
        },
        {
          speaker: "Candidate",
          text: "At a high level, the GC frees objects that are no longer reachable from GC roots, like thread stacks and static fields.",
          translation: {
            fr: "Dans les grandes lignes, le GC libère les objets qui ne sont plus accessibles depuis les racines GC, comme les piles des threads et les champs statiques.",
            es: "A grandes rasgos, el GC libera los objetos que ya no son alcanzables desde las raíces del GC, como las pilas de los hilos y los campos estáticos.",
          },
        },
        {
          speaker: "Candidate",
          text: "Most collectors are generational. The underlying assumption is that most objects die young.",
          translation: {
            fr: "La plupart des collecteurs sont générationnels. L'hypothèse sous-jacente, c'est que la plupart des objets meurent jeunes.",
            es: "La mayoría de los recolectores son generacionales. La premisa de fondo es que la mayoría de los objetos mueren jóvenes.",
          },
        },
        {
          speaker: "Interviewer",
          text: "So does setting an object to null free the memory right away?",
          translation: {
            fr: "Donc, mettre un objet à null libère la mémoire immédiatement ?",
            es: "Entonces, ¿asignar null a un objeto libera la memoria de inmediato?",
          },
        },
        {
          speaker: "Candidate",
          text: "That's a common misconception. It only removes one reference. The memory is reclaimed later, whenever the collector runs.",
          translation: {
            fr: "C'est une idée reçue assez répandue. Ça supprime seulement une référence. La mémoire est récupérée plus tard, quand le collecteur passe.",
            es: "Es un error bastante común. Solo elimina una referencia. La memoria se recupera más tarde, cuando se ejecuta el recolector.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Okay. Our service has long GC pauses in production. What would you do?",
          translation: {
            fr: "D'accord. Notre service a de longues pauses GC en production. Que feriez-vous ?",
            es: "Vale. Nuestro servicio tiene pausas de GC largas en producción. ¿Qué harías?",
          },
        },
        {
          speaker: "Candidate",
          text: "Before tuning anything, I'd enable GC logs and check if the old generation keeps growing. If it does, it's probably a leak, not a tuning issue.",
          translation: {
            fr: "Avant de régler quoi que ce soit, j'activerais les logs GC et je vérifierais si la vieille génération ne cesse de grossir. Si c'est le cas, c'est probablement une fuite, pas un problème de réglage.",
            es: "Antes de ajustar nada, activaría los logs del GC y comprobaría si la generación vieja no para de crecer. Si es así, probablemente sea una fuga, no un problema de configuración.",
          },
        },
        {
          speaker: "Candidate",
          text: "If it's really about latency, I'd look at a pause-time goal with G1, or test ZGC.",
          translation: {
            fr: "Si c'est vraiment une question de latence, je regarderais un objectif de temps de pause avec G1, ou je testerais ZGC.",
            es: "Si realmente es un problema de latencia, revisaría un objetivo de tiempo de pausa con G1 o probaría ZGC.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Makes sense. Measure first, then change the collector.",
          translation: {
            fr: "Logique. D'abord mesurer, ensuite changer de collecteur.",
            es: "Tiene sentido. Primero medir y luego cambiar de recolector.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-05-q1',
        type: 'choice',
        prompt: "Which objects can the Java garbage collector reclaim?",
        options: [
          "Objects that have not been used for more than one minute",
          "Objects that are no longer reachable from any GC root",
          "Any object whose variable was set to null, immediately",
          "Only objects created with the \"new\" keyword inside loops",
        ],
        correctIndex: 1,
        explanation: "Java GC is based on reachability: unreachable objects are eligible for collection, whenever the collector runs.",
      },
      {
        id: 'iv-05-q2',
        type: 'fill',
        prompt: "Before ___ anything, I'd look at the GC logs and pause times.",
        options: ["tune", "tuned", "tuning", "to tune"],
        correctIndex: 2,
        explanation: "After the preposition \"before\", English uses the -ing form: \"before tuning\".",
      },
      {
        id: 'iv-05-q3',
        type: 'choice',
        prompt: "Why are most Java collectors generational?",
        options: [
          "Because old objects are always larger",
          "Because the JVM cannot track object age",
          "Because most objects become unreachable soon after they are created",
        ],
        correctIndex: 2,
        explanation: "The weak generational hypothesis says most objects die young, so collecting the young generation often is cheap and effective.",
      },
    ],
    interview: {
      path: 'java',
      question: "How does garbage collection work in Java?",
      questionTranslation: {
        fr: "Comment fonctionne le garbage collection en Java ?",
        es: "¿Cómo funciona la recolección de basura en Java?",
      },
      explanation: "The interviewer wants more than a definition. They check that you understand reachability and generations, know the main modern collectors, and, above all, that you would diagnose a real production problem with data before tuning flags.",
      explanationTranslation: {
        fr: "Le recruteur attend plus qu'une définition. Il vérifie que vous comprenez l'accessibilité des objets et les générations, que vous connaissez les principaux collecteurs modernes et surtout que vous diagnostiqueriez un vrai problème de production avec des données avant de modifier des options.",
        es: "El entrevistador quiere algo más que una definición. Comprueba que entiendes la alcanzabilidad y las generaciones, que conoces los principales recolectores modernos y, sobre todo, que diagnosticarías un problema real de producción con datos antes de tocar parámetros.",
      },
      exampleAnswer: "In Java, the garbage collector frees memory used by objects that are no longer reachable from GC roots, such as local variables on thread stacks and static fields. Most collectors are generational, because most objects die young. New objects are allocated in the young generation; when it fills up, a minor collection copies the survivors, and objects that survive several cycles are promoted to the old generation. The old generation is collected less often, and that's usually where longer pauses come from. Since Java 9, the default collector is G1, which splits the heap into regions and tries to meet a pause-time target. For very low latency, ZGC and Shenandoah do most of their work concurrently. In production, I'd check GC logs and pause times before tuning anything, and I'd rule out a memory leak first, because no tuning will free objects that are still referenced.",
      exampleAnswerTranslation: {
        fr: "En Java, le garbage collector libère la mémoire occupée par les objets qui ne sont plus accessibles depuis les racines GC, comme les variables locales sur les piles des threads et les champs statiques. La plupart des collecteurs sont générationnels, parce que la plupart des objets meurent jeunes. Les nouveaux objets sont alloués dans la jeune génération ; quand elle est pleine, une collecte mineure copie les survivants, et les objets qui survivent à plusieurs cycles sont promus dans la vieille génération. La vieille génération est collectée moins souvent, et c'est généralement de là que viennent les pauses les plus longues. Depuis Java 9, le collecteur par défaut est G1, qui découpe le heap en régions et essaie de respecter un objectif de temps de pause. Pour une très faible latence, ZGC et Shenandoah font l'essentiel de leur travail en concurrence. En production, je regarderais les logs GC et les temps de pause avant de régler quoi que ce soit, et j'écarterais d'abord une fuite mémoire, car aucun réglage ne libérera des objets encore référencés.",
        es: "En Java, el recolector de basura libera la memoria de los objetos que ya no son alcanzables desde las raíces del GC, como las variables locales en las pilas de los hilos y los campos estáticos. La mayoría de los recolectores son generacionales, porque la mayoría de los objetos mueren jóvenes. Los objetos nuevos se asignan en la generación joven; cuando se llena, una recolección menor copia los supervivientes, y los objetos que sobreviven a varios ciclos se promocionan a la generación vieja. La generación vieja se recolecta con menos frecuencia, y de ahí suelen venir las pausas más largas. Desde Java 9, el recolector por defecto es G1, que divide el heap en regiones e intenta cumplir un objetivo de tiempo de pausa. Para una latencia muy baja, ZGC y Shenandoah hacen la mayor parte de su trabajo de forma concurrente. En producción, revisaría los logs del GC y los tiempos de pausa antes de ajustar nada, y descartaría primero una fuga de memoria, porque ningún ajuste liberará objetos que siguen referenciados.",
      },
      alternatives: [
        "The GC doesn't track usage; it tracks whether an object can still be reached.",
        "Short-lived objects are cheap to collect; the expensive part is usually the old generation.",
        "I'd only switch collectors once the logs show that pause times are the real bottleneck.",
        "If the heap keeps growing after full collections, I'd take a heap dump and look for what's holding the references.",
      ],
      practice: "Explain garbage collection in under two minutes as if to a teammate, using the words \"reachable\", \"young generation\" and \"pause\". Then answer this follow-up out loud: \"Our service runs out of memory every few days. How would you investigate?\"",
      selfAssessment: [
        "I explained reachability from GC roots instead of saying objects are \"unused\".",
        "I described young and old generations and why the generational approach works.",
        "I named at least one modern collector (G1, ZGC or Shenandoah) accurately.",
        "I said I would measure (GC logs, heap dumps) before tuning, and mentioned memory leaks.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-06 — How does a HashMap work internally?
  // ---------------------------------------------------------------------------
  {
    id: 'iv-06',
    moduleId: 'interview',
    topic: 'java',
    title: "How does a HashMap work internally?",
    titleTranslation: {
      fr: "Comment fonctionne une HashMap en interne ?",
      es: "¿Cómo funciona un HashMap internamente?",
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 12,
    roles: ['java'],
    objective: "Describe hashing, buckets, collisions and resizing in HashMap, and the equals/hashCode contract.",
    objectiveTranslation: {
      fr: "Décrire le hachage, les buckets, les collisions et le redimensionnement d'une HashMap, ainsi que le contrat equals/hashCode.",
      es: "Describir el hashing, los buckets, las colisiones y el redimensionamiento de un HashMap, así como el contrato equals/hashCode.",
    },
    situation: "The interviewer asks you to explain what happens inside a HashMap when you call put and get.",
    situationTranslation: {
      fr: "Le recruteur vous demande d'expliquer ce qui se passe dans une HashMap quand on appelle put et get.",
      es: "El entrevistador te pide que expliques qué ocurre dentro de un HashMap al llamar a put y get.",
    },
    vocabulary: [
      {
        term: "bucket",
        definition: "One slot of the internal array where entries with the same index are stored.",
        translation: { fr: "bucket / compartiment", es: "bucket / cubeta" },
      },
      {
        term: "hash collision",
        definition: "A situation where two different keys end up in the same bucket.",
        translation: { fr: "collision de hachage", es: "colisión de hash" },
      },
      {
        term: "load factor",
        definition: "The ratio of entries to capacity at which the table is resized, 0.75 by default.",
        translation: { fr: "facteur de charge", es: "factor de carga" },
      },
      {
        term: "to rehash",
        definition: "To redistribute all entries into a new, larger table after a resize.",
        translation: { fr: "rehacher / redistribuer", es: "rehashear / redistribuir" },
      },
      {
        term: "to treeify",
        definition: "To convert a long chain of entries in a bucket into a balanced red-black tree.",
        translation: { fr: "transformer en arbre", es: "convertir en árbol" },
      },
    ],
    expressions: [
      {
        phrase: "Under the hood, …",
        usage: "Use it to introduce how something works internally.",
        translation: { fr: "En interne, …", es: "Por debajo, …" },
      },
      {
        phrase: "In the worst case, …",
        usage: "Use it to discuss performance when everything goes wrong.",
        translation: { fr: "Dans le pire des cas, …", es: "En el peor de los casos, …" },
      },
      {
        phrase: "That's why it's important that…",
        usage: "Use it to connect an internal detail to a practical rule.",
        translation: {
          fr: "C'est pour ça qu'il est important que…",
          es: "Por eso es importante que…",
        },
      },
      {
        phrase: "As far as I know, …",
        usage: "Use it to hedge slightly when you are quoting an implementation detail.",
        translation: { fr: "À ma connaissance, …", es: "Que yo sepa, …" },
      },
      {
        phrase: "One thing worth mentioning is…",
        usage: "Use it to add an important point the interviewer did not ask for directly.",
        translation: {
          fr: "Une chose qui mérite d'être mentionnée, c'est…",
          es: "Algo que vale la pena mencionar es…",
        },
      },
    ],
    dialogue: {
      context: "A live technical interview for a senior Java developer.",
      lines: [
        {
          speaker: "Interviewer",
          text: "Let's go a bit deeper. How does a HashMap work internally?",
          translation: {
            fr: "Allons un peu plus loin. Comment fonctionne une HashMap en interne ?",
            es: "Vamos a profundizar un poco. ¿Cómo funciona un HashMap internamente?",
          },
        },
        {
          speaker: "Candidate",
          text: "Under the hood, it's an array of buckets. The key's hashCode decides which bucket an entry goes into.",
          translation: {
            fr: "En interne, c'est un tableau de buckets. Le hashCode de la clé détermine dans quel bucket va l'entrée.",
            es: "Por debajo, es un array de buckets. El hashCode de la clave decide en qué bucket va cada entrada.",
          },
        },
        {
          speaker: "Interviewer",
          text: "What happens if two keys land in the same bucket?",
          translation: {
            fr: "Que se passe-t-il si deux clés tombent dans le même bucket ?",
            es: "¿Qué pasa si dos claves caen en el mismo bucket?",
          },
        },
        {
          speaker: "Candidate",
          text: "That's a collision. The entries are chained in a linked list, and since Java 8 a long chain can become a red-black tree.",
          translation: {
            fr: "C'est une collision. Les entrées sont chaînées dans une liste chaînée, et depuis Java 8 une longue chaîne peut devenir un arbre rouge-noir.",
            es: "Eso es una colisión. Las entradas se encadenan en una lista enlazada y, desde Java 8, una cadena larga puede convertirse en un árbol rojo-negro.",
          },
        },
        {
          speaker: "Candidate",
          text: "So in the worst case, lookups in that bucket go from O(n) to O(log n).",
          translation: {
            fr: "Donc, dans le pire des cas, les recherches dans ce bucket passent de O(n) à O(log n).",
            es: "Así que, en el peor de los casos, las búsquedas en ese bucket pasan de O(n) a O(log n).",
          },
        },
        {
          speaker: "Interviewer",
          text: "Good. What if I use a mutable object as a key and change it after inserting it?",
          translation: {
            fr: "Bien. Et si j'utilise un objet mutable comme clé et que je le modifie après l'avoir inséré ?",
            es: "Bien. ¿Y si uso un objeto mutable como clave y lo modifico después de insertarlo?",
          },
        },
        {
          speaker: "Candidate",
          text: "If the change affects hashCode, get will probably look in the wrong bucket and return null, even though the entry is still there.",
          translation: {
            fr: "Si la modification change le hashCode, get va probablement chercher dans le mauvais bucket et renvoyer null, alors que l'entrée est toujours là.",
            es: "Si el cambio afecta al hashCode, get probablemente buscará en el bucket equivocado y devolverá null, aunque la entrada siga ahí.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Exactly. That's a nasty bug to track down.",
          translation: {
            fr: "Exactement. C'est un bug pénible à traquer.",
            es: "Exacto. Es un bug muy difícil de localizar.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-06-q1',
        type: 'choice',
        prompt: "When does a default HashMap resize its internal table?",
        options: [
          "When the number of entries exceeds capacity × load factor (0.75)",
          "Every time a collision happens",
          "When a bucket contains two entries",
          "Never; its size is fixed at creation",
        ],
        correctIndex: 0,
        explanation: "The table doubles when size exceeds the threshold, which is capacity multiplied by the load factor (0.75 by default).",
      },
      {
        id: 'iv-06-q2',
        type: 'fill',
        prompt: "If two equal objects return different hash codes, the map may ___ to find an existing key.",
        options: ["fail", "fails", "failing", "failed"],
        correctIndex: 0,
        explanation: "After the modal verb \"may\", use the base form: \"may fail\".",
      },
      {
        id: 'iv-06-q3',
        type: 'choice',
        prompt: "Which is the safest choice for a HashMap shared by several threads that write to it?",
        options: [
          "A plain HashMap, because put is atomic",
          "A HashMap with a larger initial capacity",
          "A ConcurrentHashMap",
        ],
        correctIndex: 2,
        explanation: "HashMap is not thread-safe; ConcurrentHashMap is designed for concurrent reads and writes.",
      },
    ],
    interview: {
      path: 'java',
      question: "How does a HashMap work internally?",
      questionTranslation: {
        fr: "Comment fonctionne une HashMap en interne ?",
        es: "¿Cómo funciona un HashMap internamente?",
      },
      explanation: "The interviewer checks that you understand data structures beyond the API: hashing, collisions, resizing and complexity. They also want you to connect these details to real consequences, like the equals/hashCode contract, mutable keys and thread safety.",
      explanationTranslation: {
        fr: "Le recruteur vérifie que vous comprenez les structures de données au-delà de l'API : hachage, collisions, redimensionnement et complexité. Il veut aussi que vous reliiez ces détails à des conséquences concrètes, comme le contrat equals/hashCode, les clés mutables et la sécurité des threads.",
        es: "El entrevistador comprueba que entiendes las estructuras de datos más allá de la API: hashing, colisiones, redimensionamiento y complejidad. También quiere que relaciones esos detalles con consecuencias reales, como el contrato equals/hashCode, las claves mutables y la seguridad entre hilos.",
      },
      exampleAnswer: "A HashMap stores entries in an array of buckets. When you call put, it takes the key's hashCode, mixes the high bits into the low bits, and uses the result to pick a bucket index. If two keys land in the same bucket, that's a collision, and the entries are kept in a linked list. Since Java 8, if a bucket grows past eight entries and the table is large enough, the list becomes a red-black tree, so the worst case is O(log n) instead of O(n). To read a value, the map goes to the bucket and compares keys with equals. That's why equals and hashCode must be consistent, and why mutable keys are risky. When the size goes past capacity times the load factor, 0.75 by default, the table doubles and the entries are redistributed. One last point: HashMap isn't thread-safe, so for concurrent writes I'd use ConcurrentHashMap.",
      exampleAnswerTranslation: {
        fr: "Une HashMap stocke ses entrées dans un tableau de buckets. Quand on appelle put, elle prend le hashCode de la clé, mélange les bits de poids fort avec ceux de poids faible et utilise le résultat pour choisir l'index du bucket. Si deux clés tombent dans le même bucket, c'est une collision, et les entrées sont conservées dans une liste chaînée. Depuis Java 8, si un bucket dépasse huit entrées et que la table est assez grande, la liste devient un arbre rouge-noir, donc le pire cas est O(log n) au lieu de O(n). Pour lire une valeur, la map va dans le bucket et compare les clés avec equals. C'est pour ça qu'equals et hashCode doivent être cohérents, et que les clés mutables sont risquées. Quand la taille dépasse la capacité multipliée par le facteur de charge, 0,75 par défaut, la table double et les entrées sont redistribuées. Un dernier point : HashMap n'est pas thread-safe, donc pour des écritures concurrentes j'utiliserais ConcurrentHashMap.",
        es: "Un HashMap guarda las entradas en un array de buckets. Cuando llamas a put, toma el hashCode de la clave, mezcla los bits altos con los bajos y usa el resultado para elegir el índice del bucket. Si dos claves caen en el mismo bucket, hay una colisión, y las entradas se guardan en una lista enlazada. Desde Java 8, si un bucket supera las ocho entradas y la tabla es lo bastante grande, la lista se convierte en un árbol rojo-negro, de modo que el peor caso es O(log n) en lugar de O(n). Para leer un valor, el mapa va al bucket y compara las claves con equals. Por eso equals y hashCode tienen que ser coherentes, y por eso las claves mutables son arriesgadas. Cuando el tamaño supera la capacidad multiplicada por el factor de carga, 0,75 por defecto, la tabla se duplica y las entradas se redistribuyen. Un último detalle: HashMap no es thread-safe, así que para escrituras concurrentes usaría ConcurrentHashMap.",
      },
      alternatives: [
        "Lookups are O(1) on average, as long as the hash function spreads keys well.",
        "If two objects are equal, they must return the same hash code; the reverse isn't required.",
        "If you know roughly how many entries you'll have, setting an initial capacity avoids repeated resizing.",
        "I'd use immutable keys, like Strings or records, to avoid this kind of bug.",
      ],
      practice: "Draw a small HashMap with four buckets on paper and insert five keys, including one collision. Then explain out loud, step by step, what happens during put, get and a resize, using the words \"bucket\", \"collision\" and \"load factor\".",
      selfAssessment: [
        "I explained how hashCode is used to choose a bucket and equals to find the key.",
        "I described collisions and the Java 8 tree conversion with the correct complexity.",
        "I mentioned resizing and the default load factor of 0.75.",
        "I connected the internals to practical rules: equals/hashCode contract, mutable keys, thread safety.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-07 — What is dependency injection in Spring?
  // ---------------------------------------------------------------------------
  {
    id: 'iv-07',
    moduleId: 'interview',
    topic: 'spring',
    title: "What is dependency injection in Spring?",
    titleTranslation: {
      fr: "Qu'est-ce que l'injection de dépendances dans Spring ?",
      es: "¿Qué es la inyección de dependencias en Spring?",
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 10,
    roles: ['java'],
    objective: "Explain dependency injection, the Spring container and why constructor injection is preferred.",
    objectiveTranslation: {
      fr: "Expliquer l'injection de dépendances, le conteneur Spring et pourquoi l'injection par constructeur est préférable.",
      es: "Explicar la inyección de dependencias, el contenedor de Spring y por qué se prefiere la inyección por constructor.",
    },
    situation: "In a Spring Boot interview, you are asked to explain one of the framework's core ideas.",
    situationTranslation: {
      fr: "Lors d'un entretien Spring Boot, on vous demande d'expliquer l'un des concepts clés du framework.",
      es: "En una entrevista de Spring Boot, te piden que expliques una de las ideas centrales del framework.",
    },
    vocabulary: [
      {
        term: "bean",
        definition: "An object created and managed by the Spring container.",
        translation: { fr: "bean", es: "bean" },
      },
      {
        term: "IoC container",
        definition: "The part of Spring that creates objects, resolves their dependencies and manages their lifecycle.",
        translation: { fr: "conteneur IoC", es: "contenedor IoC" },
      },
      {
        term: "constructor injection",
        definition: "Providing a class's dependencies through its constructor parameters.",
        translation: { fr: "injection par constructeur", es: "inyección por constructor" },
      },
      {
        term: "loose coupling",
        definition: "A design where components depend on abstractions, so one can change without breaking the other.",
        translation: { fr: "couplage faible", es: "bajo acoplamiento" },
      },
      {
        term: "to wire",
        definition: "To connect objects together by giving each one the dependencies it needs.",
        translation: { fr: "câbler / relier", es: "conectar / cablear" },
      },
    ],
    expressions: [
      {
        phrase: "In a nutshell, …",
        usage: "Use it to give a one-sentence summary before explaining details.",
        translation: { fr: "En deux mots, …", es: "En pocas palabras, …" },
      },
      {
        phrase: "Instead of creating it with new, …",
        usage: "Use it to contrast dependency injection with manual object creation.",
        translation: {
          fr: "Au lieu de le créer avec new, …",
          es: "En lugar de crearlo con new, …",
        },
      },
      {
        phrase: "I prefer X over Y because…",
        usage: "Use it to justify a technical preference with a clear reason.",
        translation: {
          fr: "Je préfère X à Y parce que…",
          es: "Prefiero X a Y porque…",
        },
      },
      {
        phrase: "The main benefit is…",
        usage: "Use it to highlight the most important advantage.",
        translation: { fr: "Le principal avantage, c'est…", es: "La principal ventaja es…" },
      },
      {
        phrase: "To give you a concrete example, …",
        usage: "Use it to move from an abstract idea to real code.",
        translation: {
          fr: "Pour vous donner un exemple concret, …",
          es: "Para darte un ejemplo concreto, …",
        },
      },
    ],
    dialogue: {
      context: "A video interview for a Java/Spring Boot back-end developer.",
      lines: [
        {
          speaker: "Interviewer",
          text: "What is dependency injection, and how does Spring use it?",
          translation: {
            fr: "Qu'est-ce que l'injection de dépendances, et comment Spring l'utilise-t-il ?",
            es: "¿Qué es la inyección de dependencias y cómo la usa Spring?",
          },
        },
        {
          speaker: "Candidate",
          text: "In a nutshell, a class receives its dependencies instead of creating them. Spring's container creates the beans and wires them together.",
          translation: {
            fr: "En deux mots, une classe reçoit ses dépendances au lieu de les créer. Le conteneur de Spring crée les beans et les relie entre eux.",
            es: "En pocas palabras, una clase recibe sus dependencias en lugar de crearlas. El contenedor de Spring crea los beans y los conecta entre sí.",
          },
        },
        {
          speaker: "Interviewer",
          text: "There are several ways to inject. Which one do you use?",
          translation: {
            fr: "Il y a plusieurs façons d'injecter. Laquelle utilisez-vous ?",
            es: "Hay varias formas de inyectar. ¿Cuál usas tú?",
          },
        },
        {
          speaker: "Candidate",
          text: "I prefer constructor injection over field injection. The dependencies are explicit, the fields can be final, and I can unit test the class without Spring.",
          translation: {
            fr: "Je préfère l'injection par constructeur à l'injection par champ. Les dépendances sont explicites, les champs peuvent être final, et je peux tester la classe unitairement sans Spring.",
            es: "Prefiero la inyección por constructor a la inyección por campo. Las dependencias son explícitas, los campos pueden ser final y puedo hacer tests unitarios de la clase sin Spring.",
          },
        },
        {
          speaker: "Interviewer",
          text: "What happens if there are two beans of the same type?",
          translation: {
            fr: "Que se passe-t-il s'il y a deux beans du même type ?",
            es: "¿Qué pasa si hay dos beans del mismo tipo?",
          },
        },
        {
          speaker: "Candidate",
          text: "Spring can't decide, so startup fails with an error. I'd mark one with @Primary or pick one explicitly with @Qualifier.",
          translation: {
            fr: "Spring ne peut pas choisir, donc le démarrage échoue avec une erreur. Je marquerais l'un des deux avec @Primary ou j'en choisirais un explicitement avec @Qualifier.",
            es: "Spring no puede decidir, así que el arranque falla con un error. Marcaría uno con @Primary o elegiría uno explícitamente con @Qualifier.",
          },
        },
        {
          speaker: "Interviewer",
          text: "And do you need @Autowired on the constructor?",
          translation: {
            fr: "Et faut-il mettre @Autowired sur le constructeur ?",
            es: "¿Y hace falta poner @Autowired en el constructor?",
          },
        },
        {
          speaker: "Candidate",
          text: "Not if the class has only one constructor. Spring uses it automatically.",
          translation: {
            fr: "Pas si la classe n'a qu'un seul constructeur. Spring l'utilise automatiquement.",
            es: "No, si la clase tiene un solo constructor. Spring lo usa automáticamente.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-07-q1',
        type: 'choice',
        prompt: "Why is constructor injection usually preferred over field injection?",
        options: [
          "It makes the application start faster in all cases.",
          "It makes dependencies explicit, allows final fields and simplifies unit testing.",
          "It is the only type of injection Spring supports.",
          "It removes the need for any configuration.",
        ],
        correctIndex: 1,
        explanation: "Constructor injection shows clearly what a class needs and lets you pass mocks in tests without starting Spring.",
      },
      {
        id: 'iv-07-q2',
        type: 'fill',
        prompt: "If two beans have the same type, you can use @___ to choose which one to inject.",
        options: ["Override", "Qualifier", "Entity", "Value"],
        correctIndex: 1,
        explanation: "@Qualifier selects a specific bean by name when several candidates match.",
      },
      {
        id: 'iv-07-q3',
        type: 'choice',
        prompt: "Which phrase best introduces a short summary at the start of your answer?",
        options: [
          "In a nutshell, …",
          "In a shell nut, …",
          "Shortly said, …",
        ],
        correctIndex: 0,
        explanation: "\"In a nutshell\" is the natural idiom for a very short summary.",
      },
    ],
    interview: {
      path: 'spring',
      question: "What is dependency injection in Spring?",
      questionTranslation: {
        fr: "Qu'est-ce que l'injection de dépendances dans Spring ?",
        es: "¿Qué es la inyección de dependencias en Spring?",
      },
      explanation: "The interviewer checks that you understand the idea behind the framework, not just the annotations. They want to hear why DI matters (coupling, testability), how Spring resolves beans, and which injection style you choose and why.",
      explanationTranslation: {
        fr: "Le recruteur vérifie que vous comprenez l'idée derrière le framework, pas seulement les annotations. Il veut savoir pourquoi la DI est importante (couplage, testabilité), comment Spring résout les beans et quel style d'injection vous choisissez, et pourquoi.",
        es: "El entrevistador comprueba que entiendes la idea detrás del framework, no solo las anotaciones. Quiere oír por qué importa la DI (acoplamiento, testabilidad), cómo resuelve Spring los beans y qué estilo de inyección eliges y por qué.",
      },
      exampleAnswer: "Dependency injection means a class doesn't create its own dependencies; it receives them from outside. In Spring, the IoC container creates the beans, works out what each one needs and wires them together. For example, say an OrderService needs an OrderRepository and a PaymentClient. Instead of calling new inside the service, I declare them as constructor parameters, and Spring injects the matching beans. I prefer constructor injection over field injection, because the dependencies are explicit, the fields can be final and I can unit test the class with mocks without starting Spring at all. If there are two beans of the same type, I use @Qualifier or mark one as @Primary. The main benefit is loose coupling: I can swap an implementation, for example a real payment client in production and a fake one in tests, without touching the service code.",
      exampleAnswerTranslation: {
        fr: "L'injection de dépendances signifie qu'une classe ne crée pas ses propres dépendances : elle les reçoit de l'extérieur. Dans Spring, le conteneur IoC crée les beans, détermine ce dont chacun a besoin et les relie entre eux. Par exemple, imaginons qu'un OrderService ait besoin d'un OrderRepository et d'un PaymentClient. Au lieu d'appeler new dans le service, je les déclare comme paramètres du constructeur, et Spring injecte les beans correspondants. Je préfère l'injection par constructeur à l'injection par champ, parce que les dépendances sont explicites, les champs peuvent être final et je peux tester la classe unitairement avec des mocks sans démarrer Spring du tout. S'il y a deux beans du même type, j'utilise @Qualifier ou je marque l'un d'eux avec @Primary. Le principal avantage, c'est le couplage faible : je peux remplacer une implémentation, par exemple un vrai client de paiement en production et un faux dans les tests, sans toucher au code du service.",
        es: "La inyección de dependencias significa que una clase no crea sus propias dependencias, sino que las recibe desde fuera. En Spring, el contenedor IoC crea los beans, averigua lo que necesita cada uno y los conecta entre sí. Por ejemplo, pongamos que un OrderService necesita un OrderRepository y un PaymentClient. En lugar de llamar a new dentro del servicio, los declaro como parámetros del constructor y Spring inyecta los beans correspondientes. Prefiero la inyección por constructor a la inyección por campo, porque las dependencias son explícitas, los campos pueden ser final y puedo hacer tests unitarios de la clase con mocks sin arrancar Spring. Si hay dos beans del mismo tipo, uso @Qualifier o marco uno con @Primary. La principal ventaja es el bajo acoplamiento: puedo cambiar una implementación, por ejemplo un cliente de pagos real en producción y uno falso en los tests, sin tocar el código del servicio.",
      },
      alternatives: [
        "The class says what it needs, and the container decides how to provide it.",
        "This is an example of inversion of control: the framework, not my code, manages object creation.",
        "Field injection hides dependencies and makes the class harder to test outside Spring.",
        "If a constructor has too many parameters, that's usually a sign the class is doing too much.",
      ],
      practice: "Take a small service from one of your projects and explain out loud how you would refactor it from field injection (@Autowired on fields) to constructor injection. Mention at least two benefits and how you would write a unit test for it.",
      selfAssessment: [
        "I defined dependency injection in one simple sentence before giving details.",
        "I explained the role of the Spring container and beans.",
        "I justified constructor injection with concrete reasons (explicit, final fields, testability).",
        "I gave a realistic example and mentioned how to handle two beans of the same type.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-08 — How do you manage transactions in Spring Boot?
  // ---------------------------------------------------------------------------
  {
    id: 'iv-08',
    moduleId: 'interview',
    topic: 'spring',
    title: "How do you manage transactions in Spring Boot?",
    titleTranslation: {
      fr: "Comment gérez-vous les transactions dans Spring Boot ?",
      es: "¿Cómo gestionas las transacciones en Spring Boot?",
    },
    level: 'advanced',
    premium: true,
    estimatedMinutes: 12,
    roles: ['java'],
    objective: "Explain @Transactional, rollback rules, propagation and common proxy pitfalls with precise language.",
    objectiveTranslation: {
      fr: "Expliquer @Transactional, les règles de rollback, la propagation et les pièges courants liés aux proxys avec un vocabulaire précis.",
      es: "Explicar @Transactional, las reglas de rollback, la propagación y los errores habituales con los proxies usando un lenguaje preciso.",
    },
    situation: "A tech lead asks how you keep data consistent in a Spring Boot service.",
    situationTranslation: {
      fr: "Un tech lead vous demande comment vous garantissez la cohérence des données dans un service Spring Boot.",
      es: "Un tech lead te pregunta cómo mantienes la coherencia de los datos en un servicio de Spring Boot.",
    },
    vocabulary: [
      {
        term: "rollback",
        definition: "Cancelling all changes made in a transaction so the database returns to its previous state.",
        translation: { fr: "rollback / annulation", es: "rollback / reversión" },
      },
      {
        term: "propagation",
        definition: "The rule that decides whether a method joins an existing transaction or starts a new one.",
        translation: { fr: "propagation", es: "propagación" },
      },
      {
        term: "proxy",
        definition: "A wrapper object that Spring puts around a bean to add behavior such as transactions.",
        translation: { fr: "proxy", es: "proxy" },
      },
      {
        term: "self-invocation",
        definition: "When a method calls another method on the same object, bypassing the Spring proxy.",
        translation: { fr: "auto-invocation", es: "autoinvocación" },
      },
      {
        term: "checked exception",
        definition: "A Java exception that must be declared or caught, such as IOException.",
        translation: { fr: "exception vérifiée", es: "excepción comprobada" },
      },
    ],
    expressions: [
      {
        phrase: "By default, …",
        usage: "Use it to describe standard behavior before explaining exceptions to the rule.",
        translation: { fr: "Par défaut, …", es: "Por defecto, …" },
      },
      {
        phrase: "One trap I watch out for is…",
        usage: "Use it to show practical experience with a common mistake.",
        translation: {
          fr: "Un piège auquel je fais attention, c'est…",
          es: "Una trampa con la que tengo cuidado es…",
        },
      },
      {
        phrase: "As a rule, I'd keep… as short as possible.",
        usage: "Use it to share a design principle with a little flexibility.",
        translation: {
          fr: "En règle générale, je garderais… aussi court que possible.",
          es: "Por norma general, mantendría… lo más corto posible.",
        },
      },
      {
        phrase: "That's useful for cases like…",
        usage: "Use it to give a concrete use case for a technical option.",
        translation: {
          fr: "C'est utile dans des cas comme…",
          es: "Es útil en casos como…",
        },
      },
      {
        phrase: "It's worth noting that…",
        usage: "Use it to add a subtle but important detail.",
        translation: {
          fr: "Il faut noter que…",
          es: "Cabe señalar que…",
        },
      },
    ],
    dialogue: {
      context: "A system-design-style conversation in a senior Spring Boot interview.",
      lines: [
        {
          speaker: "Interviewer",
          text: "How do you manage transactions in a Spring Boot application?",
          translation: {
            fr: "Comment gérez-vous les transactions dans une application Spring Boot ?",
            es: "¿Cómo gestionas las transacciones en una aplicación Spring Boot?",
          },
        },
        {
          speaker: "Candidate",
          text: "Mostly with @Transactional on service methods. Spring wraps the bean in a proxy that commits or rolls back around the call.",
          translation: {
            fr: "Surtout avec @Transactional sur les méthodes de service. Spring enveloppe le bean dans un proxy qui fait le commit ou le rollback autour de l'appel.",
            es: "Sobre todo con @Transactional en los métodos de servicio. Spring envuelve el bean en un proxy que hace commit o rollback alrededor de la llamada.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Does it roll back on every exception?",
          translation: {
            fr: "Est-ce qu'il fait un rollback pour toutes les exceptions ?",
            es: "¿Hace rollback con cualquier excepción?",
          },
        },
        {
          speaker: "Candidate",
          text: "No. By default, only on runtime exceptions and errors. For checked exceptions, I'd add rollbackFor.",
          translation: {
            fr: "Non. Par défaut, seulement pour les exceptions runtime et les erreurs. Pour les exceptions vérifiées, j'ajouterais rollbackFor.",
            es: "No. Por defecto, solo con las excepciones de runtime y los errores. Para las excepciones comprobadas, añadiría rollbackFor.",
          },
        },
        {
          speaker: "Interviewer",
          text: "I once saw @Transactional being ignored completely. Any idea why?",
          translation: {
            fr: "J'ai déjà vu @Transactional être complètement ignoré. Une idée de la raison ?",
            es: "Una vez vi que @Transactional se ignoraba por completo. ¿Se te ocurre por qué?",
          },
        },
        {
          speaker: "Candidate",
          text: "Probably self-invocation. If a method calls another method in the same class, the call doesn't go through the proxy.",
          translation: {
            fr: "Probablement l'auto-invocation. Si une méthode appelle une autre méthode de la même classe, l'appel ne passe pas par le proxy.",
            es: "Probablemente por autoinvocación. Si un método llama a otro método de la misma clase, la llamada no pasa por el proxy.",
          },
        },
        {
          speaker: "Candidate",
          text: "It's also worth noting that, with the default proxies, the annotation has no effect on private methods.",
          translation: {
            fr: "Il faut aussi noter qu'avec les proxys par défaut, l'annotation n'a aucun effet sur les méthodes privées.",
            es: "También cabe señalar que, con los proxies por defecto, la anotación no tiene efecto en los métodos privados.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Right. That catches a lot of people.",
          translation: {
            fr: "Exactement. Beaucoup de gens se font avoir.",
            es: "Exacto. Mucha gente cae en eso.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-08-q1',
        type: 'choice',
        prompt: "By default, which exceptions cause a rollback in a Spring @Transactional method?",
        options: [
          "All exceptions, including checked ones",
          "Only checked exceptions",
          "Unchecked (runtime) exceptions and errors",
          "No exceptions; you must always roll back manually",
        ],
        correctIndex: 2,
        explanation: "Spring rolls back on RuntimeException and Error by default; checked exceptions need rollbackFor.",
      },
      {
        id: 'iv-08-q2',
        type: 'fill',
        prompt: "With REQUIRES_NEW, Spring ___ the current transaction and starts a new one.",
        options: ["joins", "suspends", "commits", "ignores"],
        correctIndex: 1,
        explanation: "REQUIRES_NEW suspends the existing transaction, runs in a new one, then resumes the original.",
      },
      {
        id: 'iv-08-q3',
        type: 'choice',
        prompt: "Why might @Transactional have no effect when methodA() calls methodB() in the same class?",
        options: [
          "Because the internal call bypasses the Spring proxy",
          "Because Spring only supports one transaction per class",
          "Because methodB() must be static",
        ],
        correctIndex: 0,
        explanation: "Transactions are applied by the proxy, and a self-invocation calls the target object directly.",
      },
    ],
    interview: {
      path: 'spring',
      question: "How do you manage transactions in Spring Boot?",
      questionTranslation: {
        fr: "Comment gérez-vous les transactions dans Spring Boot ?",
        es: "¿Cómo gestionas las transacciones en Spring Boot?",
      },
      explanation: "The interviewer wants to see real production experience: how declarative transactions work through proxies, the default rollback rules, propagation choices, and the classic pitfalls that cause silent data inconsistencies.",
      explanationTranslation: {
        fr: "Le recruteur veut voir une vraie expérience de production : comment les transactions déclaratives fonctionnent grâce aux proxys, les règles de rollback par défaut, les choix de propagation et les pièges classiques qui provoquent des incohérences de données silencieuses.",
        es: "El entrevistador quiere ver experiencia real en producción: cómo funcionan las transacciones declarativas mediante proxies, las reglas de rollback por defecto, las opciones de propagación y los errores clásicos que provocan incoherencias de datos silenciosas.",
      },
      exampleAnswer: "Mostly declaratively, with @Transactional on service methods. Spring wraps the bean in a proxy that starts a transaction before the method, commits when it returns and rolls back if a runtime exception is thrown. Checked exceptions don't trigger a rollback by default, so I add rollbackFor when I need it. I try to keep transactions short. For example, I wouldn't call an external API inside one, because it holds a database connection while waiting. There are two traps I watch out for. The first is self-invocation: if a method calls another @Transactional method in the same class, the call bypasses the proxy, so the annotation is ignored. The second is propagation: REQUIRED joins an existing transaction, while REQUIRES_NEW suspends it and starts a new one. That's useful for things like audit logs that must be saved even if the main operation fails.",
      exampleAnswerTranslation: {
        fr: "Surtout de manière déclarative, avec @Transactional sur les méthodes de service. Spring enveloppe le bean dans un proxy qui démarre une transaction avant la méthode, fait le commit quand elle se termine et un rollback si une exception runtime est levée. Par défaut, les exceptions vérifiées ne déclenchent pas de rollback, donc j'ajoute rollbackFor quand j'en ai besoin. J'essaie de garder les transactions courtes. Par exemple, je n'appellerais pas une API externe à l'intérieur d'une transaction, parce qu'elle garde une connexion à la base de données pendant l'attente. Il y a deux pièges auxquels je fais attention. Le premier, c'est l'auto-invocation : si une méthode appelle une autre méthode @Transactional de la même classe, l'appel contourne le proxy et l'annotation est ignorée. Le second, c'est la propagation : REQUIRED rejoint une transaction existante, alors que REQUIRES_NEW la suspend et en démarre une nouvelle. C'est utile pour des choses comme les logs d'audit, qui doivent être enregistrés même si l'opération principale échoue.",
        es: "Sobre todo de forma declarativa, con @Transactional en los métodos de servicio. Spring envuelve el bean en un proxy que inicia una transacción antes del método, hace commit cuando termina y rollback si se lanza una excepción de runtime. Por defecto, las excepciones comprobadas no provocan rollback, así que añado rollbackFor cuando lo necesito. Intento que las transacciones sean cortas. Por ejemplo, no llamaría a una API externa dentro de una, porque mantiene ocupada una conexión a la base de datos mientras espera. Hay dos trampas con las que tengo cuidado. La primera es la autoinvocación: si un método llama a otro método @Transactional de la misma clase, la llamada se salta el proxy y la anotación se ignora. La segunda es la propagación: REQUIRED se une a una transacción existente, mientras que REQUIRES_NEW la suspende e inicia una nueva. Es útil para cosas como los logs de auditoría, que deben guardarse aunque falle la operación principal.",
      },
      alternatives: [
        "I put transaction boundaries at the service layer, not in controllers or repositories.",
        "For read-only queries, I set readOnly = true, which can let the persistence layer skip some work.",
        "To avoid the self-invocation issue, I move the method to a separate bean.",
        "If I need finer control, I can use TransactionTemplate programmatically.",
      ],
      practice: "Describe out loud a money-transfer service method (debit one account, credit another). Explain where you would put @Transactional, what happens if the credit step throws an exception, and how you would make sure an audit record is saved even when the transfer fails.",
      selfAssessment: [
        "I explained that @Transactional works through a Spring proxy.",
        "I stated the default rollback rule and how to change it with rollbackFor.",
        "I described at least one pitfall, such as self-invocation or private methods.",
        "I explained a propagation choice (REQUIRED vs REQUIRES_NEW) with a realistic use case.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-09 — Explain the virtual DOM and reconciliation
  // ---------------------------------------------------------------------------
  {
    id: 'iv-09',
    moduleId: 'interview',
    topic: 'react',
    title: "Explain the virtual DOM and reconciliation",
    titleTranslation: {
      fr: "Expliquer le DOM virtuel et la réconciliation",
      es: "Explicar el DOM virtual y la reconciliación",
    },
    level: 'intermediate',
    premium: false,
    estimatedMinutes: 10,
    roles: ['react', 'fullstack'],
    objective: "Explain how React compares renders and why keys matter, using clear and accurate language.",
    objectiveTranslation: {
      fr: "Expliquer comment React compare les rendus et pourquoi les keys sont importantes, avec un langage clair et précis.",
      es: "Explicar cómo React compara los renderizados y por qué importan las keys, con un lenguaje claro y preciso.",
    },
    situation: "A front-end interviewer asks you what React does when state changes.",
    situationTranslation: {
      fr: "Un recruteur front-end vous demande ce que fait React quand le state change.",
      es: "Un entrevistador de front-end te pregunta qué hace React cuando cambia el estado.",
    },
    vocabulary: [
      {
        term: "virtual DOM",
        definition: "A lightweight tree of JavaScript objects that describes what the UI should look like.",
        translation: { fr: "DOM virtuel", es: "DOM virtual" },
      },
      {
        term: "reconciliation",
        definition: "The process React uses to compare the new element tree with the previous one and decide what to update.",
        translation: { fr: "réconciliation", es: "reconciliación" },
      },
      {
        term: "to re-render",
        definition: "To call a component again to produce a new description of its UI.",
        translation: { fr: "refaire un rendu", es: "volver a renderizar" },
      },
      {
        term: "key",
        definition: "A stable identifier that helps React match list items between renders.",
        translation: { fr: "key / clé", es: "key / clave" },
      },
      {
        term: "heuristic",
        definition: "A practical shortcut that gives a good result quickly, even if it is not perfect.",
        translation: { fr: "heuristique", es: "heurística" },
      },
    ],
    expressions: [
      {
        phrase: "The idea is that…",
        usage: "Use it to explain the main concept in simple terms.",
        translation: { fr: "L'idée, c'est que…", es: "La idea es que…" },
      },
      {
        phrase: "To put it simply, …",
        usage: "Use it to reformulate something technical in plainer words.",
        translation: { fr: "Pour faire simple, …", es: "Dicho de forma sencilla, …" },
      },
      {
        phrase: "This is why…",
        usage: "Use it to connect a mechanism to a best practice.",
        translation: { fr: "C'est pour ça que…", es: "Por eso…" },
      },
      {
        phrase: "A common mistake is to…",
        usage: "Use it to show you know what goes wrong in real code.",
        translation: {
          fr: "Une erreur fréquente, c'est de…",
          es: "Un error frecuente es…",
        },
      },
      {
        phrase: "I'd push back a little on the idea that…",
        usage: "Use it to politely disagree with a popular but inaccurate statement.",
        translation: {
          fr: "Je nuancerais un peu l'idée selon laquelle…",
          es: "Matizaría un poco la idea de que…",
        },
      },
    ],
    dialogue: {
      context: "A technical interview for a React front-end developer.",
      lines: [
        {
          speaker: "Interviewer",
          text: "Can you explain the virtual DOM and reconciliation?",
          translation: {
            fr: "Pouvez-vous expliquer le DOM virtuel et la réconciliation ?",
            es: "¿Puedes explicar el DOM virtual y la reconciliación?",
          },
        },
        {
          speaker: "Candidate",
          text: "Sure. When state changes, React calls the component again and gets a new tree of elements, which is the virtual DOM.",
          translation: {
            fr: "Bien sûr. Quand le state change, React rappelle le composant et obtient un nouvel arbre d'éléments, c'est le DOM virtuel.",
            es: "Claro. Cuando cambia el estado, React vuelve a llamar al componente y obtiene un nuevo árbol de elementos, que es el DOM virtual.",
          },
        },
        {
          speaker: "Candidate",
          text: "Reconciliation compares it with the previous tree and applies only the necessary changes to the real DOM.",
          translation: {
            fr: "La réconciliation le compare à l'arbre précédent et n'applique que les changements nécessaires au vrai DOM.",
            es: "La reconciliación lo compara con el árbol anterior y aplica solo los cambios necesarios al DOM real.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Why does React warn you when list items don't have a key?",
          translation: {
            fr: "Pourquoi React affiche-t-il un avertissement quand les éléments d'une liste n'ont pas de key ?",
            es: "¿Por qué React muestra un aviso cuando los elementos de una lista no tienen key?",
          },
        },
        {
          speaker: "Candidate",
          text: "Because keys tell React which item is which between renders. Without stable keys, it can reuse the wrong component and mix up its state.",
          translation: {
            fr: "Parce que les keys indiquent à React quel élément est lequel d'un rendu à l'autre. Sans keys stables, il peut réutiliser le mauvais composant et mélanger son state.",
            es: "Porque las keys le dicen a React qué elemento es cuál entre renderizados. Sin keys estables, puede reutilizar el componente equivocado y mezclar su estado.",
          },
        },
        {
          speaker: "Interviewer",
          text: "So is using the array index as a key a problem?",
          translation: {
            fr: "Donc, utiliser l'index du tableau comme key, c'est un problème ?",
            es: "Entonces, ¿usar el índice del array como key es un problema?",
          },
        },
        {
          speaker: "Candidate",
          text: "It's fine for a static list. But if items can be reordered, inserted or removed, I'd use a stable id from the data.",
          translation: {
            fr: "Ça va pour une liste statique. Mais si les éléments peuvent être réordonnés, insérés ou supprimés, j'utiliserais un id stable issu des données.",
            es: "Para una lista estática está bien. Pero si los elementos se pueden reordenar, insertar o eliminar, usaría un id estable de los datos.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Good. That's exactly the kind of bug we've seen in forms.",
          translation: {
            fr: "Bien. C'est exactement le genre de bug qu'on a eu dans des formulaires.",
            es: "Bien. Es justo el tipo de bug que hemos tenido en formularios.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-09-q1',
        type: 'choice',
        prompt: "What does React do if an element's type changes, for example from <div> to <section>?",
        options: [
          "It updates only the tag name and keeps the children's state",
          "It throws an error",
          "It ignores the change until the next page reload",
          "It removes the old subtree and builds a new one",
        ],
        correctIndex: 3,
        explanation: "When the type differs, React assumes the trees are different, unmounts the old subtree and mounts a new one.",
      },
      {
        id: 'iv-09-q2',
        type: 'fill',
        prompt: "Keys should be stable and ___ among siblings.",
        options: ["random", "unique", "numeric", "global"],
        correctIndex: 1,
        explanation: "Keys must be unique among siblings and stable between renders; random keys break matching.",
      },
      {
        id: 'iv-09-q3',
        type: 'choice',
        prompt: "Which statement about the virtual DOM is the most accurate?",
        options: [
          "It makes every React app faster than any manual DOM code.",
          "It lets you write declarative UI code while React works out the minimal DOM updates.",
          "It is a copy of the browser's DOM stored on the server.",
        ],
        correctIndex: 1,
        explanation: "Its main value is the declarative model; performance still depends on how components are written.",
      },
    ],
    interview: {
      path: 'react',
      question: "Can you explain the virtual DOM and reconciliation?",
      questionTranslation: {
        fr: "Pouvez-vous expliquer le DOM virtuel et la réconciliation ?",
        es: "¿Puedes explicar el DOM virtual y la reconciliación?",
      },
      explanation: "The interviewer checks that you understand what happens between a state change and a screen update, that you know the diffing heuristics (element type and keys), and that you don't repeat the myth that the virtual DOM automatically makes everything fast.",
      explanationTranslation: {
        fr: "Le recruteur vérifie que vous comprenez ce qui se passe entre un changement de state et la mise à jour de l'écran, que vous connaissez les heuristiques de comparaison (type d'élément et keys) et que vous ne répétez pas le mythe selon lequel le DOM virtuel rend tout rapide automatiquement.",
        es: "El entrevistador comprueba que entiendes qué ocurre entre un cambio de estado y la actualización de la pantalla, que conoces las heurísticas de comparación (tipo de elemento y keys) y que no repites el mito de que el DOM virtual lo hace todo rápido automáticamente.",
      },
      exampleAnswer: "The virtual DOM is a lightweight description of the UI made of plain JavaScript objects. When state or props change, React calls the component again and gets a new tree of elements. Reconciliation is the process of comparing that new tree with the previous one to work out what actually needs to change in the real DOM. A perfect tree diff would be too expensive, so React uses two main heuristics. If an element's type changes, for example a div becomes a section, React throws away that subtree and builds a new one. For lists, it uses keys to match items between renders, which is why keys should be stable and unique, not array indexes when the list can be reordered. I'd also push back a little on the idea that the virtual DOM is automatically fast. Its main benefit is declarative code, and we still need memoization when components re-render too often.",
      exampleAnswerTranslation: {
        fr: "Le DOM virtuel est une description légère de l'interface, faite de simples objets JavaScript. Quand le state ou les props changent, React rappelle le composant et obtient un nouvel arbre d'éléments. La réconciliation, c'est le processus qui compare ce nouvel arbre avec le précédent pour déterminer ce qui doit vraiment changer dans le vrai DOM. Une comparaison parfaite des arbres coûterait trop cher, donc React utilise deux heuristiques principales. Si le type d'un élément change, par exemple une div qui devient une section, React jette ce sous-arbre et en construit un nouveau. Pour les listes, il utilise les keys pour faire correspondre les éléments d'un rendu à l'autre ; c'est pour ça que les keys doivent être stables et uniques, et pas des index de tableau quand la liste peut être réordonnée. Je nuancerais aussi un peu l'idée que le DOM virtuel est rapide automatiquement. Son principal avantage, c'est le code déclaratif, et on a toujours besoin de mémoïsation quand des composants se re-rendent trop souvent.",
        es: "El DOM virtual es una descripción ligera de la interfaz hecha con objetos JavaScript simples. Cuando cambian el estado o las props, React vuelve a llamar al componente y obtiene un nuevo árbol de elementos. La reconciliación es el proceso de comparar ese nuevo árbol con el anterior para averiguar qué tiene que cambiar realmente en el DOM real. Una comparación perfecta de árboles sería demasiado costosa, así que React usa dos heurísticas principales. Si cambia el tipo de un elemento, por ejemplo un div que pasa a ser un section, React descarta ese subárbol y construye uno nuevo. En las listas, usa las keys para emparejar los elementos entre renderizados; por eso las keys deben ser estables y únicas, y no índices del array cuando la lista se puede reordenar. También matizaría un poco la idea de que el DOM virtual es rápido automáticamente. Su principal ventaja es el código declarativo, y seguimos necesitando memoización cuando los componentes se renderizan demasiado a menudo.",
      },
      alternatives: [
        "React describes the UI as a function of state, and reconciliation figures out the DOM operations.",
        "Instead of comparing every node with every other node, React compares level by level.",
        "Index keys cause subtle bugs, like input values staying in the wrong row after a delete.",
        "If a component re-renders too much, I'd profile it first, then consider React.memo or useMemo.",
      ],
      practice: "Explain reconciliation to a non-React developer in under 90 seconds. Then describe a concrete bug caused by using array indexes as keys in a list of editable inputs, and how you would fix it.",
      selfAssessment: [
        "I explained the virtual DOM as a description of the UI, not as a copy of the browser DOM.",
        "I described reconciliation as comparing the new and previous trees.",
        "I mentioned the element-type and key heuristics, with an example.",
        "I avoided saying the virtual DOM is always faster, and mentioned when optimization is needed.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // iv-10 — When do you use useEffect, and what are the common pitfalls?
  // ---------------------------------------------------------------------------
  {
    id: 'iv-10',
    moduleId: 'interview',
    topic: 'react',
    title: "When do you use useEffect, and what are the common pitfalls?",
    titleTranslation: {
      fr: "Quand utilisez-vous useEffect, et quels sont les pièges courants ?",
      es: "¿Cuándo usas useEffect y cuáles son los errores más comunes?",
    },
    level: 'intermediate',
    premium: true,
    estimatedMinutes: 11,
    roles: ['react', 'fullstack'],
    objective: "Explain what useEffect is for, when not to use it, and how to avoid dependency and cleanup bugs.",
    objectiveTranslation: {
      fr: "Expliquer à quoi sert useEffect, quand ne pas l'utiliser, et comment éviter les bugs liés aux dépendances et au nettoyage.",
      es: "Explicar para qué sirve useEffect, cuándo no usarlo y cómo evitar los bugs de dependencias y de limpieza.",
    },
    situation: "The interviewer asks a practical hooks question and then shows you a component with a bug.",
    situationTranslation: {
      fr: "Le recruteur pose une question pratique sur les hooks, puis vous montre un composant qui contient un bug.",
      es: "El entrevistador hace una pregunta práctica sobre hooks y luego te enseña un componente con un bug.",
    },
    vocabulary: [
      {
        term: "side effect",
        definition: "Work that reaches outside the component, such as a network request, a timer or a subscription.",
        translation: { fr: "effet de bord", es: "efecto secundario" },
      },
      {
        term: "dependency array",
        definition: "The list of values that tells React when an effect needs to run again.",
        translation: { fr: "tableau de dépendances", es: "array de dependencias" },
      },
      {
        term: "cleanup function",
        definition: "The function returned by an effect that undoes its work before it runs again or when the component unmounts.",
        translation: { fr: "fonction de nettoyage", es: "función de limpieza" },
      },
      {
        term: "stale closure",
        definition: "A function that keeps using an old value because it was created during an earlier render.",
        translation: { fr: "closure obsolète", es: "closure obsoleto" },
      },
      {
        term: "race condition",
        definition: "A bug where the result depends on which of several asynchronous operations finishes first.",
        translation: { fr: "situation de concurrence", es: "condición de carrera" },
      },
    ],
    expressions: [
      {
        phrase: "I reach for useEffect when…",
        usage: "Use it to describe when a tool is your natural choice.",
        translation: {
          fr: "J'utilise useEffect quand…",
          es: "Recurro a useEffect cuando…",
        },
      },
      {
        phrase: "You might not need an effect if…",
        usage: "Use it to show you know when not to use a tool.",
        translation: {
          fr: "On n'a peut-être pas besoin d'un effet si…",
          es: "Puede que no necesites un efecto si…",
        },
      },
      {
        phrase: "The classic pitfall is…",
        usage: "Use it to introduce a well-known mistake.",
        translation: { fr: "Le piège classique, c'est…", es: "El error clásico es…" },
      },
      {
        phrase: "What's happening here is that…",
        usage: "Use it when you explain a bug in code someone shows you.",
        translation: {
          fr: "Ce qui se passe ici, c'est que…",
          es: "Lo que está pasando aquí es que…",
        },
      },
      {
        phrase: "One way to fix it would be to…",
        usage: "Use it to propose a solution without sounding like it's the only option.",
        translation: {
          fr: "Une façon de corriger ça serait de…",
          es: "Una forma de arreglarlo sería…",
        },
      },
    ],
    dialogue: {
      context: "A pair-programming style interview for a React developer.",
      lines: [
        {
          speaker: "Interviewer",
          text: "When do you use useEffect, and what are the common pitfalls?",
          translation: {
            fr: "Quand utilisez-vous useEffect, et quels sont les pièges courants ?",
            es: "¿Cuándo usas useEffect y cuáles son los errores más comunes?",
          },
        },
        {
          speaker: "Candidate",
          text: "I reach for it when I need to sync with something outside React, like a WebSocket, a timer or a browser API.",
          translation: {
            fr: "Je l'utilise quand je dois me synchroniser avec quelque chose en dehors de React, comme un WebSocket, un timer ou une API du navigateur.",
            es: "Recurro a él cuando necesito sincronizarme con algo fuera de React, como un WebSocket, un temporizador o una API del navegador.",
          },
        },
        {
          speaker: "Candidate",
          text: "The classic pitfall is the dependency array: a missing value gives you stale data, and an object recreated on every render makes the effect run every time.",
          translation: {
            fr: "Le piège classique, c'est le tableau de dépendances : une valeur manquante donne des données obsolètes, et un objet recréé à chaque rendu fait tourner l'effet à chaque fois.",
            es: "El error clásico es el array de dependencias: si falta un valor obtienes datos obsoletos, y un objeto que se recrea en cada renderizado hace que el efecto se ejecute cada vez.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Okay, look at this component. It starts a setInterval in an effect, but the counter gets faster every time the user changes the filter.",
          translation: {
            fr: "D'accord, regardez ce composant. Il lance un setInterval dans un effet, mais le compteur accélère chaque fois que l'utilisateur change le filtre.",
            es: "Vale, mira este componente. Inicia un setInterval en un efecto, pero el contador va más rápido cada vez que el usuario cambia el filtro.",
          },
        },
        {
          speaker: "Candidate",
          text: "What's happening here is that the effect has no cleanup, so each run adds a new interval on top of the old ones.",
          translation: {
            fr: "Ce qui se passe ici, c'est que l'effet n'a pas de nettoyage, donc chaque exécution ajoute un nouvel interval par-dessus les anciens.",
            es: "Lo que está pasando aquí es que el efecto no tiene limpieza, así que cada ejecución añade un nuevo intervalo encima de los anteriores.",
          },
        },
        {
          speaker: "Candidate",
          text: "One way to fix it would be to return a function that calls clearInterval.",
          translation: {
            fr: "Une façon de corriger ça serait de renvoyer une fonction qui appelle clearInterval.",
            es: "Una forma de arreglarlo sería devolver una función que llame a clearInterval.",
          },
        },
        {
          speaker: "Interviewer",
          text: "Right. And why does the effect run twice in development?",
          translation: {
            fr: "Exactement. Et pourquoi l'effet s'exécute-t-il deux fois en développement ?",
            es: "Exacto. ¿Y por qué el efecto se ejecuta dos veces en desarrollo?",
          },
        },
        {
          speaker: "Candidate",
          text: "That's Strict Mode. React mounts, unmounts and remounts the component to check that the cleanup really works. It doesn't happen in production.",
          translation: {
            fr: "C'est le Strict Mode. React monte, démonte puis remonte le composant pour vérifier que le nettoyage fonctionne vraiment. Ça n'arrive pas en production.",
            es: "Es el Strict Mode. React monta, desmonta y vuelve a montar el componente para comprobar que la limpieza funciona de verdad. No ocurre en producción.",
          },
        },
      ],
    },
    quiz: [
      {
        id: 'iv-10-q1',
        type: 'choice',
        prompt: "Which case is a good use of useEffect?",
        options: [
          "Calculating a full name from firstName and lastName",
          "Subscribing to a WebSocket and closing it when the component unmounts",
          "Filtering a list that is already in props",
          "Updating state in response to a button click",
        ],
        correctIndex: 1,
        explanation: "Effects are for syncing with external systems; derived values and event handling don't need an effect.",
      },
      {
        id: 'iv-10-q2',
        type: 'fill',
        prompt: "If an effect starts a timer, it should return a ___ function that clears it.",
        options: ["render", "callback", "cleanup", "reducer"],
        correctIndex: 2,
        explanation: "The function returned from an effect is the cleanup, run before the next effect and on unmount.",
      },
      {
        id: 'iv-10-q3',
        type: 'choice',
        prompt: "Why might an effect run in an infinite loop?",
        options: [
          "It sets state that changes one of its own dependencies on every run.",
          "It has an empty dependency array.",
          "It returns a cleanup function.",
        ],
        correctIndex: 0,
        explanation: "If the effect updates a value it depends on, each update triggers a new render and a new run.",
      },
    ],
    interview: {
      path: 'react',
      question: "When do you use useEffect, and what are the common pitfalls?",
      questionTranslation: {
        fr: "Quand utilisez-vous useEffect, et quels sont les pièges courants ?",
        es: "¿Cuándo usas useEffect y cuáles son los errores más comunes?",
      },
      explanation: "The interviewer checks that you see useEffect as a way to synchronize with external systems, not as a general-purpose tool. They want to hear that you know when an effect is unnecessary and that you can spot dependency, cleanup and race-condition bugs.",
      explanationTranslation: {
        fr: "Le recruteur vérifie que vous voyez useEffect comme un moyen de se synchroniser avec des systèmes externes, et non comme un outil à tout faire. Il veut entendre que vous savez quand un effet est inutile et que vous savez repérer les bugs de dépendances, de nettoyage et de concurrence.",
        es: "El entrevistador comprueba que ves useEffect como una forma de sincronizarse con sistemas externos, no como una herramienta para todo. Quiere oír que sabes cuándo un efecto es innecesario y que sabes detectar bugs de dependencias, de limpieza y de condiciones de carrera.",
      },
      exampleAnswer: "I use useEffect to synchronize a component with something outside React, like a subscription, a timer, a WebSocket or a browser API. I try not to use it for things that can be calculated during render. For example, if I can derive a full name from the first and last name, I just compute it; putting it in state with an effect adds an extra render and can get out of sync. The most common pitfalls are around dependencies. If you leave a value out of the array, the effect works with a stale value. If you include an object or function that's recreated on every render, the effect runs every time, sometimes in a loop. The other big one is cleanup: if the effect subscribes or starts a timer, it should return a function that undoes it. And for data fetching, you have to handle race conditions, or use a library like TanStack Query.",
      exampleAnswerTranslation: {
        fr: "J'utilise useEffect pour synchroniser un composant avec quelque chose en dehors de React, comme un abonnement, un timer, un WebSocket ou une API du navigateur. J'essaie de ne pas l'utiliser pour ce qui peut être calculé pendant le rendu. Par exemple, si je peux déduire un nom complet du prénom et du nom, je le calcule directement ; le mettre dans le state avec un effet ajoute un rendu supplémentaire et peut créer des incohérences. Les pièges les plus courants concernent les dépendances. Si on oublie une valeur dans le tableau, l'effet travaille avec une valeur obsolète. Si on y met un objet ou une fonction recréés à chaque rendu, l'effet s'exécute à chaque fois, parfois en boucle. L'autre gros piège, c'est le nettoyage : si l'effet s'abonne à quelque chose ou lance un timer, il doit renvoyer une fonction qui l'annule. Et pour le chargement de données, il faut gérer les situations de concurrence, ou utiliser une bibliothèque comme TanStack Query.",
        es: "Uso useEffect para sincronizar un componente con algo fuera de React, como una suscripción, un temporizador, un WebSocket o una API del navegador. Intento no usarlo para cosas que se pueden calcular durante el renderizado. Por ejemplo, si puedo obtener el nombre completo a partir del nombre y el apellido, simplemente lo calculo; meterlo en el estado con un efecto añade un renderizado extra y puede desincronizarse. Los errores más comunes tienen que ver con las dependencias. Si te dejas un valor fuera del array, el efecto trabaja con un valor obsoleto. Si incluyes un objeto o una función que se recrea en cada renderizado, el efecto se ejecuta cada vez, a veces en bucle. El otro gran error es la limpieza: si el efecto se suscribe a algo o inicia un temporizador, debe devolver una función que lo deshaga. Y para la carga de datos, hay que gestionar las condiciones de carrera o usar una librería como TanStack Query.",
      },
      alternatives: [
        "An effect is an escape hatch for syncing with the outside world, not a place for regular logic.",
        "If something can be derived from props or state, I compute it during render instead.",
        "I keep the linter's exhaustive-deps rule on, because it catches most stale-value bugs.",
        "For fetching, I use an ignore flag or an AbortController so an old response can't overwrite a newer one.",
      ],
      practice: "Write down, from memory, a small component that fetches a user by userId inside useEffect. Then explain out loud three things that could go wrong (missing dependency, no cleanup, race condition when userId changes quickly) and how you would fix each one.",
      selfAssessment: [
        "I described useEffect as synchronization with external systems.",
        "I gave at least one example of when an effect is not needed.",
        "I explained dependency array problems (stale values, unnecessary re-runs or loops).",
        "I mentioned cleanup and race conditions, with a concrete fix for each.",
      ],
    },
  },
];
