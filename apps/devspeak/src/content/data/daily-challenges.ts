import type { DailyChallenge } from '../types';

export const dailyChallenges: DailyChallenge[] = [
  {
    id: "dc-01",
    objective: "Offer to explain your code changes step by step.",
    objectiveTranslation: {
      fr: "Proposer d'expliquer vos modifications de code étape par étape.",
      es: "Ofrecer explicar tus cambios de código paso a paso.",
    },
    expression: {
      phrase: "Let me walk you through it.",
      usage: "Use it when you offer to explain something in detail, in order, such as a change, a design or a process.",
      translation: {
        fr: "Je vais t'expliquer ça étape par étape.",
        es: "Déjame explicártelo paso a paso.",
      },
    },
    techWordId: "v-002",
    dialogue: {
      context: "Tom is confused by a large refactoring in a pull request from Priya.",
      lines: [
        {
          speaker: "Tom",
          text: "I'm a bit lost in this pull request. Why did so many files change?",
          translation: {
            fr: "Je suis un peu perdu dans cette pull request. Pourquoi autant de fichiers ont changé ?",
            es: "Estoy un poco perdido con esta pull request. ¿Por qué cambiaron tantos archivos?",
          },
        },
        {
          speaker: "Priya",
          text: "I refactored the order service into three smaller classes. Let me walk you through it.",
          translation: {
            fr: "J'ai refactorisé le service de commandes en trois classes plus petites. Je vais t'expliquer ça étape par étape.",
            es: "Refactoricé el servicio de pedidos en tres clases más pequeñas. Déjame explicártelo paso a paso.",
          },
        },
        {
          speaker: "Tom",
          text: "Great, thanks. Did the behavior change at all?",
          translation: {
            fr: "Super, merci. Est-ce que le comportement a changé ?",
            es: "Genial, gracias. ¿Cambió el comportamiento en algo?",
          },
        },
        {
          speaker: "Priya",
          text: "No, that's the point. Same behavior, and all the existing tests still pass.",
          translation: {
            fr: "Non, c'est justement l'idée. Même comportement, et tous les tests existants passent toujours.",
            es: "No, de eso se trata. Mismo comportamiento, y todos los tests existentes siguen pasando.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-01-q",
      type: "choice",
      prompt: "Your teammate refactored a module. What should NOT change after a pure refactoring?",
      options: [
        "The structure of the code",
        "The names of some methods",
        "The external behavior of the code",
        "The number of classes",
      ],
      correctIndex: 2,
      explanation: "Refactoring improves the internal structure of code without changing what it does from the outside.",
    },
  },
  {
    id: "dc-02",
    objective: "Ask a colleague politely to clarify a vague request.",
    objectiveTranslation: {
      fr: "Demander poliment à un collègue de clarifier une demande vague.",
      es: "Pedir educadamente a un compañero que aclare una petición poco clara.",
    },
    expression: {
      phrase: "Could you clarify what you mean by…?",
      usage: "Use it to ask for more precise information without sounding like you are criticizing the other person.",
      translation: {
        fr: "Tu pourrais préciser ce que tu entends par… ?",
        es: "¿Podrías aclarar qué quieres decir con…?",
      },
    },
    techWordId: "v-012",
    dialogue: {
      context: "Lucía, a frontend developer, asks Kenji about a bug report on the API.",
      lines: [
        {
          speaker: "Kenji",
          text: "The frontend is sending the wrong data to the profile endpoint.",
          translation: {
            fr: "Le frontend envoie les mauvaises données à l'endpoint du profil.",
            es: "El frontend está enviando datos incorrectos al endpoint del perfil.",
          },
        },
        {
          speaker: "Lucía",
          text: "Could you clarify what you mean by the wrong data? Is it a missing field?",
          translation: {
            fr: "Tu pourrais préciser ce que tu entends par mauvaises données ? Il manque un champ ?",
            es: "¿Podrías aclarar qué quieres decir con datos incorrectos? ¿Falta algún campo?",
          },
        },
        {
          speaker: "Kenji",
          text: "Yes, the payload has no birth date, but the backend expects one.",
          translation: {
            fr: "Oui, le payload n'a pas de date de naissance, alors que le backend en attend une.",
            es: "Sí, el payload no tiene fecha de nacimiento, pero el backend espera una.",
          },
        },
        {
          speaker: "Lucía",
          text: "Got it. I'll add it and send you a sample request to check.",
          translation: {
            fr: "Compris. Je l'ajoute et je t'envoie un exemple de requête pour vérifier.",
            es: "Entendido. Lo añado y te mando una petición de ejemplo para comprobarlo.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-02-q",
      type: "fill",
      prompt: "The API rejected the request because the JSON ___ was missing a required field.",
      options: ["payload", "endpoint", "status code", "header"],
      correctIndex: 0,
      explanation: "The payload is the data in the request body, so that is where a required field would be missing.",
    },
  },
  {
    id: "dc-03",
    objective: "Acknowledge a colleague's argument before adding your own view.",
    objectiveTranslation: {
      fr: "Reconnaître l'argument d'un collègue avant de donner votre propre avis.",
      es: "Reconocer el argumento de un compañero antes de dar tu propia opinión.",
    },
    expression: {
      phrase: "That's a fair point, but…",
      usage: "Use it in discussions to show you respect the other person's idea while introducing a different concern.",
      translation: {
        fr: "C'est un argument valable, mais…",
        es: "Es un buen punto, pero…",
      },
    },
    techWordId: "v-028",
    dialogue: {
      context: "Amara and Marco are designing a retry mechanism for a payment service.",
      lines: [
        {
          speaker: "Marco",
          text: "If the payment call times out, we can simply retry it three times.",
          translation: {
            fr: "Si l'appel de paiement expire, on peut simplement le relancer trois fois.",
            es: "Si la llamada de pago agota el tiempo de espera, podemos simplemente reintentarla tres veces.",
          },
        },
        {
          speaker: "Amara",
          text: "That's a fair point, but what if the first call actually succeeded?",
          translation: {
            fr: "C'est un argument valable, mais si le premier appel avait réellement réussi ?",
            es: "Es un buen punto, pero ¿y si la primera llamada realmente se completó?",
          },
        },
        {
          speaker: "Marco",
          text: "Hmm, then the customer could be charged twice.",
          translation: {
            fr: "Hmm, alors le client pourrait être débité deux fois.",
            es: "Mmm, entonces al cliente se le podría cobrar dos veces.",
          },
        },
        {
          speaker: "Amara",
          text: "Exactly. Let's make the endpoint idempotent with a unique request key first.",
          translation: {
            fr: "Exactement. Rendons d'abord l'endpoint idempotent avec une clé de requête unique.",
            es: "Exacto. Primero hagamos el endpoint idempotente con una clave de petición única.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-03-q",
      type: "choice",
      prompt: "Which operation is idempotent?",
      options: [
        "Adding 10 euros to an account balance",
        "Setting a user's email address to a given value",
        "Appending a line to a log file",
        "Creating a new order with an auto-generated ID",
      ],
      correctIndex: 1,
      explanation: "Setting a value to the same thing gives the same result no matter how many times you repeat it; the others change the state every time.",
    },
  },
  {
    id: "dc-04",
    objective: "Promise to share updates while a task is in progress.",
    objectiveTranslation: {
      fr: "Promettre de donner des nouvelles pendant qu'une tâche est en cours.",
      es: "Prometer dar novedades mientras una tarea está en curso.",
    },
    expression: {
      phrase: "I'll keep you posted.",
      usage: "Use it to promise that you will tell someone about progress or news as soon as you have it.",
      translation: {
        fr: "Je te tiens au courant.",
        es: "Te mantengo al tanto.",
      },
    },
    techWordId: "v-034",
    dialogue: {
      context: "Kenji is running a database change on staging and his team lead, Priya, checks in.",
      lines: [
        {
          speaker: "Priya",
          text: "How's the database migration going on staging?",
          translation: {
            fr: "Comment se passe la migration de la base de données sur staging ?",
            es: "¿Cómo va la migración de la base de datos en staging?",
          },
        },
        {
          speaker: "Kenji",
          text: "It's about halfway done. The big orders table is taking longer than expected.",
          translation: {
            fr: "Elle est à peu près à mi-chemin. La grosse table des commandes prend plus de temps que prévu.",
            es: "Va más o menos por la mitad. La tabla grande de pedidos está tardando más de lo previsto.",
          },
        },
        {
          speaker: "Priya",
          text: "Okay. We need it finished before tomorrow's demo.",
          translation: {
            fr: "D'accord. Il faut qu'elle soit terminée avant la démo de demain.",
            es: "Vale. Necesitamos que esté terminada antes de la demo de mañana.",
          },
        },
        {
          speaker: "Kenji",
          text: "Understood. I'll keep you posted.",
          translation: {
            fr: "Bien reçu. Je te tiens au courant.",
            es: "Entendido. Te mantengo al tanto.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-04-q",
      type: "fill",
      prompt: "The migration is still running, but I'll keep you ___.",
      options: ["post", "posted", "posting", "noticed"],
      correctIndex: 1,
      explanation: "The fixed expression uses the past participle: \"I'll keep you posted\" means you will share news as it comes.",
    },
  },
  {
    id: "dc-05",
    objective: "Suggest a cautious option when a release goes wrong.",
    objectiveTranslation: {
      fr: "Proposer une option prudente quand une mise en production se passe mal.",
      es: "Proponer una opción prudente cuando un despliegue sale mal.",
    },
    expression: {
      phrase: "Let's play it safe.",
      usage: "Use it to recommend the less risky option, especially when the situation is uncertain.",
      translation: {
        fr: "Jouons la prudence.",
        es: "Vayamos a lo seguro.",
      },
    },
    techWordId: "v-042",
    dialogue: {
      context: "Errors increased right after a release, and Marco and Lucía decide what to do.",
      lines: [
        {
          speaker: "Lucía",
          text: "Error rates doubled after the release. I think I can find the bug in an hour.",
          translation: {
            fr: "Le taux d'erreurs a doublé après la mise en prod. Je pense pouvoir trouver le bug en une heure.",
            es: "La tasa de errores se duplicó tras el despliegue. Creo que puedo encontrar el bug en una hora.",
          },
        },
        {
          speaker: "Marco",
          text: "Customers are affected right now. Let's play it safe and do a rollback first.",
          translation: {
            fr: "Les clients sont impactés en ce moment. Jouons la prudence et faisons d'abord un rollback.",
            es: "Los clientes están afectados ahora mismo. Vayamos a lo seguro y hagamos primero un rollback.",
          },
        },
        {
          speaker: "Lucía",
          text: "Fair enough. I'll investigate on staging once production is stable.",
          translation: {
            fr: "D'accord. J'enquêterai sur staging une fois la production stabilisée.",
            es: "Me parece bien. Investigaré en staging cuando producción esté estable.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-05-q",
      type: "choice",
      prompt: "What does a rollback do?",
      options: [
        "It deploys a new feature to a small group of users",
        "It restarts every server in production",
        "It deletes the latest commit from the repository",
        "It returns the system to its previous working version",
      ],
      correctIndex: 3,
      explanation: "A rollback restores the last known good version after a failed change; it does not rewrite the repository history.",
    },
  },
  {
    id: "dc-06",
    objective: "Tell people you are investigating a problem.",
    objectiveTranslation: {
      fr: "Dire que vous êtes en train d'analyser un problème.",
      es: "Decir que estás investigando un problema.",
    },
    expression: {
      phrase: "I'm looking into it.",
      usage: "Use it to say that you are actively investigating an issue, even if you don't have the answer yet.",
      translation: {
        fr: "Je suis en train de regarder.",
        es: "Lo estoy revisando.",
      },
    },
    techWordId: "v-053",
    dialogue: {
      context: "Amara, a product manager, messages Tom about a slow app.",
      lines: [
        {
          speaker: "Amara",
          text: "Users say the app feels really slow this morning. Any idea why?",
          translation: {
            fr: "Les utilisateurs disent que l'appli est très lente ce matin. Une idée de la raison ?",
            es: "Los usuarios dicen que la app va muy lenta esta mañana. ¿Alguna idea de por qué?",
          },
        },
        {
          speaker: "Tom",
          text: "I'm looking into it. Latency on the search API went from 100 to 900 milliseconds.",
          translation: {
            fr: "Je suis en train de regarder. La latence de l'API de recherche est passée de 100 à 900 millisecondes.",
            es: "Lo estoy revisando. La latencia de la API de búsqueda pasó de 100 a 900 milisegundos.",
          },
        },
        {
          speaker: "Amara",
          text: "Is there anything I should tell the support team?",
          translation: {
            fr: "Est-ce que je dois dire quelque chose à l'équipe support ?",
            es: "¿Hay algo que deba decirle al equipo de soporte?",
          },
        },
        {
          speaker: "Tom",
          text: "Just say we're aware of it. I'll send an update in thirty minutes.",
          translation: {
            fr: "Dis simplement qu'on est au courant. J'enverrai un point dans trente minutes.",
            es: "Diles solo que estamos al tanto. Enviaré una actualización en treinta minutos.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-06-q",
      type: "fill",
      prompt: "The response arrives, but only after a long delay: the API has high ___.",
      options: ["uptime", "coverage", "latency", "throughput"],
      correctIndex: 2,
      explanation: "Latency is the delay before a response starts to arrive; throughput is how much work is processed per unit of time.",
    },
  },
  {
    id: "dc-07",
    objective: "Describe an unreliable test without blaming anyone.",
    objectiveTranslation: {
      fr: "Décrire un test peu fiable sans accuser personne.",
      es: "Describir un test poco fiable sin culpar a nadie.",
    },
    expression: {
      phrase: "It works on my machine.",
      usage: "A common, often humorous phrase for code that passes locally but fails elsewhere; follow it with a plan to investigate.",
      translation: {
        fr: "Ça marche sur ma machine.",
        es: "En mi máquina funciona.",
      },
    },
    techWordId: "v-064",
    dialogue: {
      context: "Kenji's pipeline failed, and he talks to Priya about it.",
      lines: [
        {
          speaker: "Priya",
          text: "Your branch failed the pipeline again. The date-picker test is red.",
          translation: {
            fr: "Ta branche a encore fait échouer le pipeline. Le test du sélecteur de date est rouge.",
            es: "Tu rama volvió a fallar en el pipeline. El test del selector de fecha está en rojo.",
          },
        },
        {
          speaker: "Kenji",
          text: "Strange, it works on my machine. And I didn't touch that component.",
          translation: {
            fr: "Bizarre, ça marche sur ma machine. Et je n'ai pas touché à ce composant.",
            es: "Qué raro, en mi máquina funciona. Y no toqué ese componente.",
          },
        },
        {
          speaker: "Priya",
          text: "Then it's probably a flaky test. It may depend on the server's time zone.",
          translation: {
            fr: "Alors c'est sûrement un test instable. Il dépend peut-être du fuseau horaire du serveur.",
            es: "Entonces probablemente sea un test inestable. Puede que dependa de la zona horaria del servidor.",
          },
        },
        {
          speaker: "Kenji",
          text: "Good call. I'll fix the time zone in the test setup.",
          translation: {
            fr: "Bien vu. Je vais fixer le fuseau horaire dans la configuration du test.",
            es: "Buena observación. Fijaré la zona horaria en la configuración del test.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-07-q",
      type: "choice",
      prompt: "What is a flaky test?",
      options: [
        "A test that sometimes passes and sometimes fails with the same code",
        "A test that always fails",
        "A test that has not been written yet",
        "A test that runs very slowly",
      ],
      correctIndex: 0,
      explanation: "A flaky test gives inconsistent results without any code change, often because of timing, ordering or environment issues.",
    },
  },
  {
    id: "dc-08",
    objective: "Justify a cautious security decision.",
    objectiveTranslation: {
      fr: "Justifier une décision de sécurité prudente.",
      es: "Justificar una decisión de seguridad prudente.",
    },
    expression: {
      phrase: "Just to be on the safe side, …",
      usage: "Use it to introduce an extra precaution, even if the risk seems small.",
      translation: {
        fr: "Juste par précaution, …",
        es: "Solo por si acaso, …",
      },
    },
    techWordId: "v-077",
    dialogue: {
      context: "Marco asks Amara for database access for a new reporting service.",
      lines: [
        {
          speaker: "Marco",
          text: "Can you give the reporting service admin access to the database?",
          translation: {
            fr: "Tu peux donner un accès admin à la base de données au service de reporting ?",
            es: "¿Puedes darle acceso de administrador a la base de datos al servicio de informes?",
          },
        },
        {
          speaker: "Amara",
          text: "It only reads data, right? Just to be on the safe side, I'll give it read-only access.",
          translation: {
            fr: "Il ne fait que lire des données, non ? Juste par précaution, je vais lui donner un accès en lecture seule.",
            es: "Solo lee datos, ¿verdad? Solo por si acaso, le daré acceso de solo lectura.",
          },
        },
        {
          speaker: "Marco",
          text: "Makes sense. Least privilege, as always.",
          translation: {
            fr: "Logique. Le moindre privilège, comme toujours.",
            es: "Tiene sentido. Mínimo privilegio, como siempre.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-08-q",
      type: "fill",
      prompt: "Following the principle of least ___, the service only gets the permissions it needs.",
      options: ["access", "effort", "risk", "privilege"],
      correctIndex: 3,
      explanation: "The principle of least privilege means giving each user or service only the minimum permissions required.",
    },
  },
  {
    id: "dc-09",
    objective: "Ask what success looks like before starting a task.",
    objectiveTranslation: {
      fr: "Demander à quoi ressemble le résultat attendu avant de commencer une tâche.",
      es: "Preguntar cómo es el resultado esperado antes de empezar una tarea.",
    },
    expression: {
      phrase: "What does done look like for this?",
      usage: "Use it to clarify the expected result of a task so you and the requester agree on when it is finished.",
      translation: {
        fr: "Qu'est-ce qu'on considère comme terminé pour ce sujet ?",
        es: "¿Qué consideramos terminado para esto?",
      },
    },
    techWordId: "v-085",
    dialogue: {
      context: "During sprint planning, Lucía asks the product owner, Tom, about a new story.",
      lines: [
        {
          speaker: "Tom",
          text: "Next up: users should be able to upload a profile picture.",
          translation: {
            fr: "Suivant : les utilisateurs doivent pouvoir téléverser une photo de profil.",
            es: "Lo siguiente: los usuarios deben poder subir una foto de perfil.",
          },
        },
        {
          speaker: "Lucía",
          text: "What does done look like for this? Do we need cropping too?",
          translation: {
            fr: "Qu'est-ce qu'on considère comme terminé pour ce sujet ? Il faut aussi le recadrage ?",
            es: "¿Qué consideramos terminado para esto? ¿También hace falta recortar la imagen?",
          },
        },
        {
          speaker: "Tom",
          text: "No cropping for now. JPEG and PNG only, maximum five megabytes.",
          translation: {
            fr: "Pas de recadrage pour l'instant. Uniquement JPEG et PNG, cinq mégaoctets maximum.",
            es: "Sin recorte por ahora. Solo JPEG y PNG, cinco megas como máximo.",
          },
        },
        {
          speaker: "Lucía",
          text: "Perfect. Let's add that to the acceptance criteria so nobody guesses.",
          translation: {
            fr: "Parfait. Ajoutons ça aux critères d'acceptation pour que personne n'ait à deviner.",
            es: "Perfecto. Añadámoslo a los criterios de aceptación para que nadie tenga que adivinar.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-09-q",
      type: "choice",
      prompt: "What are acceptance criteria?",
      options: [
        "The list of people who must approve a pull request",
        "The specific conditions a user story must meet to be complete",
        "The performance targets of the production servers",
        "The rules for estimating story points",
      ],
      correctIndex: 1,
      explanation: "Acceptance criteria describe the precise conditions that make a specific user story acceptable as done.",
    },
  },
  {
    id: "dc-10",
    objective: "Answer a design question with nuance instead of a simple yes or no.",
    objectiveTranslation: {
      fr: "Répondre à une question de conception avec nuance plutôt que par oui ou non.",
      es: "Responder a una pregunta de diseño con matices en lugar de un simple sí o no.",
    },
    expression: {
      phrase: "It depends on what we're optimizing for.",
      usage: "Use it when the best solution depends on priorities, such as speed, cost or simplicity, and you want to discuss them.",
      translation: {
        fr: "Ça dépend de ce qu'on cherche à optimiser.",
        es: "Depende de qué queramos optimizar.",
      },
    },
    techWordId: "v-095",
    dialogue: {
      context: "Priya asks Marco, an architect, whether to add a cache to the product API.",
      lines: [
        {
          speaker: "Priya",
          text: "Should we put a cache in front of the product API?",
          translation: {
            fr: "On devrait mettre un cache devant l'API produits ?",
            es: "¿Deberíamos poner una caché delante de la API de productos?",
          },
        },
        {
          speaker: "Marco",
          text: "It depends on what we're optimizing for. Speed, or always-fresh prices?",
          translation: {
            fr: "Ça dépend de ce qu'on cherche à optimiser. La vitesse, ou des prix toujours à jour ?",
            es: "Depende de qué queramos optimizar. ¿La velocidad, o precios siempre actualizados?",
          },
        },
        {
          speaker: "Priya",
          text: "Mostly speed. Prices only change once a day.",
          translation: {
            fr: "Surtout la vitesse. Les prix ne changent qu'une fois par jour.",
            es: "Sobre todo la velocidad. Los precios solo cambian una vez al día.",
          },
        },
        {
          speaker: "Marco",
          text: "Then a one-hour cache is a good trade-off.",
          translation: {
            fr: "Alors un cache d'une heure est un bon compromis.",
            es: "Entonces una caché de una hora es un buen compromiso.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-10-q",
      type: "fill",
      prompt: "Caching makes pages faster, but the ___ is that users may see slightly old data.",
      options: ["trade-off", "blocker", "heads-up", "nitpick"],
      correctIndex: 0,
      explanation: "A trade-off is the cost you accept in exchange for a benefit, here older data in exchange for speed.",
    },
  },
  {
    id: "dc-11",
    objective: "Announce a change in how the team will work from now on.",
    objectiveTranslation: {
      fr: "Annoncer un changement dans la façon de travailler de l'équipe à partir de maintenant.",
      es: "Anunciar un cambio en la forma de trabajar del equipo a partir de ahora.",
    },
    expression: {
      phrase: "Going forward, …",
      usage: "Use it to introduce a new rule or habit that applies from now on, without dwelling on past mistakes.",
      translation: {
        fr: "Désormais, …",
        es: "De ahora en adelante, …",
      },
    },
    techWordId: "v-005",
    dialogue: {
      context: "In a team channel, Kenji explains a library upgrade to Lucía.",
      lines: [
        {
          speaker: "Lucía",
          text: "I'm getting lots of warnings about the old date library since the upgrade.",
          translation: {
            fr: "J'ai plein d'avertissements sur l'ancienne bibliothèque de dates depuis la mise à jour.",
            es: "Me salen muchas advertencias sobre la antigua librería de fechas desde la actualización.",
          },
        },
        {
          speaker: "Kenji",
          text: "Yes, those functions are deprecated and will be removed in the next major version.",
          translation: {
            fr: "Oui, ces fonctions sont obsolètes et seront supprimées dans la prochaine version majeure.",
            es: "Sí, esas funciones están obsoletas y se eliminarán en la próxima versión mayor.",
          },
        },
        {
          speaker: "Lucía",
          text: "Should I replace them everywhere right now?",
          translation: {
            fr: "Je dois les remplacer partout tout de suite ?",
            es: "¿Debería reemplazarlas en todas partes ahora mismo?",
          },
        },
        {
          speaker: "Kenji",
          text: "No rush. Going forward, just use the new API in any code you touch.",
          translation: {
            fr: "Pas d'urgence. Désormais, utilise simplement la nouvelle API dans tout le code que tu modifies.",
            es: "Sin prisa. De ahora en adelante, usa la nueva API en cualquier código que toques.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-11-q",
      type: "choice",
      prompt: "A function is marked as deprecated. What does that mean?",
      options: [
        "It no longer exists and the code will not compile",
        "It is brand new and still experimental",
        "It still works but is discouraged and may be removed later",
        "It is faster than the replacement function",
      ],
      correctIndex: 2,
      explanation: "Deprecated code is still available, but you should migrate away from it because a future version may remove it.",
    },
  },
  {
    id: "dc-12",
    objective: "Explain clearly what you are focusing on during an incident.",
    objectiveTranslation: {
      fr: "Expliquer clairement sur quoi vous vous concentrez pendant un incident.",
      es: "Explicar claramente en qué te estás centrando durante un incidente.",
    },
    expression: {
      phrase: "This is my top priority right now.",
      usage: "Use it to reassure people that an urgent issue has your full attention and other work can wait.",
      translation: {
        fr: "C'est ma priorité absolue en ce moment.",
        es: "Es mi máxima prioridad ahora mismo.",
      },
    },
    techWordId: "v-045",
    dialogue: {
      context: "Checkout is broken in production, and Amara asks Tom for news.",
      lines: [
        {
          speaker: "Amara",
          text: "Customers can't pay with Safari. Do we have an estimate?",
          translation: {
            fr: "Les clients ne peuvent pas payer avec Safari. On a une estimation ?",
            es: "Los clientes no pueden pagar con Safari. ¿Tenemos una estimación?",
          },
        },
        {
          speaker: "Tom",
          text: "This is my top priority right now. I've found the cause: a browser-specific date format.",
          translation: {
            fr: "C'est ma priorité absolue en ce moment. J'ai trouvé la cause : un format de date propre au navigateur.",
            es: "Es mi máxima prioridad ahora mismo. Ya encontré la causa: un formato de fecha específico del navegador.",
          },
        },
        {
          speaker: "Amara",
          text: "Will the fix wait for the regular release on Thursday?",
          translation: {
            fr: "Le correctif va attendre la mise en production habituelle de jeudi ?",
            es: "¿La corrección esperará al despliegue habitual del jueves?",
          },
        },
        {
          speaker: "Tom",
          text: "No, we'll ship a hotfix within the hour, once it passes review.",
          translation: {
            fr: "Non, on livrera un hotfix dans l'heure, une fois la revue validée.",
            es: "No, sacaremos un hotfix en la próxima hora, en cuanto pase la revisión.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-12-q",
      type: "fill",
      prompt: "Payments are failing in production, so we can't wait for Thursday: we need a ___ today.",
      options: ["backlog", "retrospective", "hotfix", "user story"],
      correctIndex: 2,
      explanation: "A hotfix is an urgent fix released outside the normal schedule to correct a critical production problem.",
    },
  },
  {
    id: "dc-13",
    objective: "Postpone a new idea politely to protect the current scope.",
    objectiveTranslation: {
      fr: "Reporter poliment une nouvelle idée pour protéger le périmètre actuel.",
      es: "Aplazar educadamente una idea nueva para proteger el alcance actual.",
    },
    expression: {
      phrase: "Let's park that for now.",
      usage: "Use it in meetings to put an idea aside for later so the discussion stays focused on the current goal.",
      translation: {
        fr: "Mettons ça de côté pour l'instant.",
        es: "Dejemos eso aparcado por ahora.",
      },
    },
    techWordId: "v-089",
    dialogue: {
      context: "During a feature meeting, Marco suggests extra work and Priya, the team lead, responds.",
      lines: [
        {
          speaker: "Marco",
          text: "While we're building the export page, we could also add PDF and Excel formats.",
          translation: {
            fr: "Pendant qu'on construit la page d'export, on pourrait aussi ajouter les formats PDF et Excel.",
            es: "Ya que estamos construyendo la página de exportación, podríamos añadir también los formatos PDF y Excel.",
          },
        },
        {
          speaker: "Priya",
          text: "Good idea, but that sounds like scope creep for this sprint. Let's park that for now.",
          translation: {
            fr: "Bonne idée, mais ça ressemble à une dérive du périmètre pour ce sprint. Mettons ça de côté pour l'instant.",
            es: "Buena idea, pero suena a scope creep para este sprint. Dejemos eso aparcado por ahora.",
          },
        },
        {
          speaker: "Marco",
          text: "Fine with me. Should I create a ticket so we don't forget?",
          translation: {
            fr: "Ça me va. Je crée un ticket pour qu'on n'oublie pas ?",
            es: "Por mí bien. ¿Creo un ticket para que no se nos olvide?",
          },
        },
        {
          speaker: "Priya",
          text: "Yes, please add it to the backlog and we'll discuss it at refinement.",
          translation: {
            fr: "Oui, ajoute-le au backlog et on en parlera au refinement.",
            es: "Sí, añádelo al backlog y lo hablamos en el refinement.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-13-q",
      type: "choice",
      prompt: "Which situation is an example of scope creep?",
      options: [
        "The team finishes all planned stories two days early",
        "A critical bug is fixed with a hotfix",
        "The team estimates a story at three points",
        "New features keep being added to a project after work has started",
      ],
      correctIndex: 3,
      explanation: "Scope creep is the uncontrolled growth of requirements after a project has begun, which puts deadlines and quality at risk.",
    },
  },
  {
    id: "dc-14",
    objective: "Disagree diplomatically with a decision from a senior colleague.",
    objectiveTranslation: {
      fr: "Exprimer un désaccord avec diplomatie face à la décision d'un collègue senior.",
      es: "Expresar desacuerdo con diplomacia ante la decisión de un compañero sénior.",
    },
    expression: {
      phrase: "I see where you're coming from, but…",
      usage: "Use it to show you understand someone's reasoning before you respectfully present a different opinion.",
      translation: {
        fr: "Je comprends ton point de vue, mais…",
        es: "Entiendo tu punto de vista, pero…",
      },
    },
    techWordId: "v-098",
    dialogue: {
      context: "Amara, the engineering manager, wants to release a feature on Friday, and Kenji has concerns.",
      lines: [
        {
          speaker: "Amara",
          text: "Marketing wants the new login flow live on Friday. Can we make it?",
          translation: {
            fr: "Le marketing veut le nouveau parcours de connexion en ligne vendredi. On peut y arriver ?",
            es: "Marketing quiere el nuevo flujo de inicio de sesión en producción el viernes. ¿Llegamos?",
          },
        },
        {
          speaker: "Kenji",
          text: "I see where you're coming from, but the security review isn't finished yet.",
          translation: {
            fr: "Je comprends ton point de vue, mais la revue de sécurité n'est pas encore terminée.",
            es: "Entiendo tu punto de vista, pero la revisión de seguridad aún no ha terminado.",
          },
        },
        {
          speaker: "Amara",
          text: "So you'd push back on the date?",
          translation: {
            fr: "Donc tu émettrais des réserves sur la date ?",
            es: "¿Entonces te opondrías a esa fecha?",
          },
        },
        {
          speaker: "Kenji",
          text: "Yes. I'd suggest next Tuesday, once the review is done and we've fixed any findings.",
          translation: {
            fr: "Oui. Je proposerais mardi prochain, une fois la revue terminée et les problèmes relevés corrigés.",
            es: "Sí. Propondría el martes que viene, cuando la revisión esté hecha y hayamos corregido lo que salga.",
          },
        },
      ],
    },
    quiz: {
      id: "dc-14-q",
      type: "fill",
      prompt: "The deadline isn't realistic, so I'm going to push ___ and propose a new date.",
      options: ["up", "back", "down", "over"],
      correctIndex: 1,
      explanation: "\"Push back\" means to politely resist or disagree with a request or deadline, usually with reasons.",
    },
  },
];
