import type { QuestionText, TextTable } from '@/types/content';

export const es: TextTable<QuestionText> = {
  'gen-001': {
    question: "Háblame de ti.",
    intent: "El entrevistador quiere una visión breve y pertinente de quién eres profesionalmente y una primera impresión de la claridad con la que te comunicas.",
    expectedAnswer:
      "Soy desarrollador backend con cuatro años de experiencia; actualmente trabajo en una empresa mediana de comercio electrónico, en los servicios de pedidos y pagos. Durante el último año lideré la migración de nuestra API de checkout a una nueva arquitectura, lo que redujo los tiempos de respuesta en cerca de un tercio. Antes pasé dos años en una agencia digital, donde aprendí a entregar rápido para clientes muy distintos. Ahora busco una empresa de producto donde pueda profundizar en un dominio, y su trabajo en software logístico es exactamente eso.",
    explanation:
      "La estructura presente-pasado-futuro mantiene la respuesta por debajo de dos minutos: quién eres hoy, la experiencia que te trajo hasta aquí y por qué este puesto es el siguiente paso lógico. Convierte una pregunta abierta en una presentación que termina en el empleo al que te postulas.",
    tips: ["Apunta a una duración de 60 a 90 segundos.", "Elige uno o dos logros que coincidan con la descripción del puesto.", "Termina explicando por qué te interesa este puesto, para que la conversación avance con naturalidad."],
    commonMistakes: ["Recitar tu CV en orden cronológico desde la escuela.", "Compartir detalles personales que no tienen relación con el trabajo.", "Terminar sin vincular tu historia con el puesto."],
    followUpQuestions: ["¿Por qué buscas un nuevo puesto ahora?", "¿Cuál fue el mayor reto de esa migración?"],
  },
  'gen-002': {
    question: "Recórreme tu CV.",
    intent: "El entrevistador quiere entender la lógica de tu trayectoria: por qué diste cada paso y qué ganaste con él.",
    expectedAnswer:
      "Empecé como técnico de soporte, lo que me enseñó cómo viven realmente los usuarios el software. Luego hice cursos nocturnos de programación y pasé a un puesto de desarrollador junior en la misma empresa. Dos años después me uní a una start-up para trabajar en un producto más grande y aprender prácticas modernas como la revisión de código y las pruebas automatizadas. Cada paso me acercó a construir productos, y este puesto es el siguiente en esa dirección.",
    explanation:
      "Repasar el CV no es enumerar fechas. Los entrevistadores buscan un hilo conductor: la razón de cada cambio y la habilidad que te aportó. Explicar tus decisiones demuestra que tu carrera es intencional, incluso cuando no ha sido una línea recta.",
    tips: ["Dedica más tiempo a los puestos recientes y relevantes que a los antiguos.", "Para cada cambio, da una razón y algo que aprendiste.", "Prepara una frase serena y honesta para cualquier periodo sin empleo o trabajo breve."],
    commonMistakes: ["Leer el CV línea por línea.", "Criticar a antiguos empleadores para explicar una salida."],
    followUpQuestions: ["¿Qué puesto te enseñó más?", "¿Por qué solo estuviste un año en la start-up?"],
  },
  'gen-003': {
    question: "¿Cómo te describirías en tres palabras?",
    intent: "El entrevistador pone a prueba tu autoconocimiento y si eres capaz de respaldar los adjetivos con pruebas en lugar de tópicos.",
    expectedAnswer:
      "Curioso, fiable y sereno. Curioso porque me gusta entender cómo funcionan las cosas: en mi último trabajo aprendí por mi cuenta nuestras herramientas de monitorización y me convertí en la persona a la que el equipo consultaba sobre las alertas. Fiable porque, cuando me comprometo con un plazo, lo cumplo o aviso con antelación; mi responsable lo mencionó en mi última evaluación. Y sereno, porque durante los incidentes me centro en el siguiente paso útil en lugar de en la presión.",
    explanation:
      "Tres adjetivos sueltos se olvidan enseguida. Acompañar cada uno de una prueba breve los convierte en evidencias y demuestra que sabes cómo te perciben. Elegir cualidades ligadas al puesto hace que la respuesta sea pertinente.",
    example: "Estructura: palabra → prueba en una frase → (opcional) vínculo con el puesto. Repítelo tres veces, en menos de un minuto.",
    tips: ["Elige palabras que encajen con lo que exige el puesto.", "Evita palabras genéricas como «trabajador» salvo que puedas demostrarlas con precisión."],
    commonMistakes: ["Enumerar tres adjetivos sin ningún ejemplo.", "Elegir palabras que contradicen el puesto, como «perfeccionista» para un trabajo de ritmo rápido sin matizar."],
    followUpQuestions: ["¿Con cuál de esas tres palabras no estarían de acuerdo tus compañeros?", "¿Qué palabra te gustaría añadir dentro de dos años?"],
  },
  'gen-004': {
    question: "¿Cuál es tu mayor logro profesional?",
    intent: "El entrevistador quiere saber qué valoras, qué alcance puede tener tu impacto y cómo describes tu propia contribución.",
    expectedAnswer:
      "Situación: nuestro equipo de atención al cliente estaba desbordado por solicitudes de restablecimiento de contraseña, unas 300 incidencias por semana. Tarea: como desarrollador del equipo de cuentas, me pidieron reducir esa carga. Acción: analicé las incidencias, descubrí que la mayoría de los usuarios nunca recibía el correo de restablecimiento por un problema con el filtro de spam, corregí la configuración de envío y añadí un restablecimiento autónomo por SMS. También redacté un breve artículo de ayuda con el equipo de soporte. Resultado: las incidencias de restablecimiento bajaron un 70 % en un mes y el soporte pudo centrarse en los problemas reales de los clientes.",
    explanation:
      "Una buena respuesta sobre un logro muestra un problema real, tus acciones personales y un resultado medible. La estructura STAR (Situation, Task, Action, Result: situación, tarea, acción, resultado) evita las afirmaciones vagas y destaca lo que hiciste tú, no solo lo que hizo el equipo.",
    tips: ["Elige un logro relevante para el puesto que buscas.", "Cuantifica el resultado, aunque sea de forma aproximada.", "Di «yo» para tus acciones y reconoce a los demás cuando sea justo."],
    commonMistakes: ["Elegir un logro sin impacto medible.", "Describir el proyecto pero no tu propio papel en él."],
    followUpQuestions: ["¿Qué harías de otra manera hoy?", "¿Quién más contribuyó y cómo?"],
  },
  'gen-005': {
    question: "¿Cómo te describirían tus compañeros?",
    intent: "El entrevistador comprueba cómo trabajas con los demás y si la imagen que tienes de ti coincide con la que tienen los demás.",
    expectedAnswer:
      "Creo que dirían que soy la persona que aclara las cosas. Cuando un requisito es difuso, suelo ser quien anota las preguntas abiertas y organiza una llamada corta para resolverlas. En mi última ronda de feedback, dos compañeros comentaron que mis comentarios en las pull requests son directos pero cordiales. Otro también dijo que a veces asumo demasiado yo solo, algo en lo que estoy trabajando delegando más.",
    explanation:
      "Citar feedback real hace que la respuesta sea creíble. Añadir un punto de mejora pequeño y honesto demuestra madurez y hace más creíbles los aspectos positivos.",
    tips: ["Basa la respuesta en feedback real: evaluaciones, comentarios, mensajes.", "Menciona un comportamiento concreto en lugar de un rasgo de personalidad."],
    commonMistakes: ["Responder solo con adjetivos halagadores.", "Decir «No lo sé, tendrías que preguntárselo a ellos»."],
    followUpQuestions: ["¿Puedes darme un ejemplo de ese feedback?", "¿Cómo reaccionaste al comentario sobre asumir demasiado?"],
  },
  'gen-006': {
    question: "¿Qué te diferencia de los demás candidatos para este puesto?",
    intent: "El entrevistador quiere que identifiques tu valor específico para este puesto y que lo argumentes sin arrogancia.",
    expectedAnswer:
      "No puedo hablar por los demás candidatos, pero sí puedo contarte la combinación que aporto. Tengo cinco años de desarrollo backend y, durante los dos últimos, también he sido el enlace entre nuestro equipo de ingeniería y el departamento financiero, traduciendo reglas contables en requisitos del sistema. La oferta menciona desarrollar funcionalidades de facturación con interlocutores de finanzas, que es exactamente la intersección en la que he trabajado. Por ejemplo, lideré el rediseño de nuestro módulo de facturación, lo que eliminó la mayoría de las correcciones manuales a fin de mes. Muchos desarrolladores dominan bien la parte del código; menos han dedicado tiempo a entender también la parte de negocio.",
    explanation:
      "La respuesta más sólida no te compara con personas que nunca has conocido. Identifica la intersección de habilidades que es poco común y que el puesto necesita, y luego la demuestra con un ejemplo. Empezar con humildad mantiene un tono seguro en lugar de presuntuoso.",
    tips: ["Busca la intersección entre dos de tus habilidades y la descripción del puesto.", "Respalda la afirmación con un resultado.", "Mantén un tono respetuoso hacia los demás candidatos."],
    commonMistakes: ["Afirmar que eres «el mejor» sin pruebas.", "Enumerar cualidades genéricas que cualquiera podría alegar, como la motivación o la pasión."],
    followUpQuestions: ["¿Qué tendrías que aprender rápidamente en este puesto?", "¿Cómo adquiriste esos conocimientos de finanzas?"],
  },
  'gen-007': {
    question: "¿Cuáles son tus mayores fortalezas?",
    intent: "El entrevistador quiere ver si tus principales fortalezas encajan con el puesto y si eres capaz de demostrarlas.",
    expectedAnswer:
      "Mi principal fortaleza es descomponer problemas complejos. En mi último proyecto, nuestro proceso de generación de informes tardaba seis horas y fallaba a menudo. Lo dividí en pasos más pequeños, medí cada uno y descubrí que una sola consulta era responsable de la mayor parte del tiempo. Tras reescribirla y añadir un índice, el proceso se ejecutaba en cuarenta minutos. Una segunda fortaleza es explicar temas técnicos de forma sencilla: presento con regularidad nuestros cambios al equipo de producto, y ahora acuden primero a mí cuando necesitan una opinión técnica.",
    explanation:
      "Dos fortalezas, cada una demostrada con una historia breve, convencen más que una larga lista. Elegir fortalezas que aparecen en la descripción del puesto demuestra que has reflexionado sobre lo que necesita el puesto.",
    tips: ["Prepara dos o tres fortalezas y elige las que menciona la descripción del puesto.", "Usa un ejemplo breve por cada fortaleza."],
    commonMistakes: ["Enumerar muchas fortalezas sin pruebas.", "Elegir fortalezas que no tienen relación con el puesto."],
    followUpQuestions: ["¿En qué fortaleza te apoyas más bajo presión?", "¿Puede esa fortaleza convertirse en una debilidad?"],
  },
  'gen-008': {
    question: "¿Cuál es tu mayor debilidad?",
    intent: "El entrevistador pone a prueba tu autoconocimiento, tu honestidad y tu capacidad de mejorar; no busca un motivo para descartarte.",
    expectedAnswer:
      "Durante mucho tiempo me sentía incómodo hablando en reuniones grandes, así que mis ideas se quedaban en mis notas. Se convirtió en un problema real cuando un diseño que había propuesto por escrito se descartó porque no lo defendí en la revisión. Desde entonces he trabajado en ello de forma deliberada: me ofrezco a presentar la demo del sprint una vez al mes y preparo dos o tres puntos clave antes de cada reunión. Sigue sin ser mi ejercicio favorito, pero el trimestre pasado dirigí nuestra revisión de arquitectura y la propuesta fue aprobada.",
    explanation:
      "Una buena respuesta nombra una debilidad real pero no crítica, muestra su impacto y luego se centra en las acciones concretas que has tomado y en el progreso logrado. El plan de mejora importa más que la propia debilidad.",
    tips: ["Elige una debilidad genuina que no sea esencial para el puesto.", "Dedica la mayor parte de la respuesta a lo que estás haciendo al respecto.", "Muestra un progreso medible."],
    commonMistakes: ["Disfrazar una fortaleza de debilidad («Soy demasiado perfeccionista»).", "Nombrar una debilidad que es crítica para el puesto.", "Decir que no tienes debilidades."],
    followUpQuestions: ["¿En qué otra debilidad estás trabajando?", "¿Cómo obtienes feedback sobre tu progreso?"],
  },
  'gen-009': {
    question: "¿Qué aportas a un equipo?",
    intent: "El entrevistador quiere entender tu papel dentro de un grupo y cómo haces que los demás sean más eficaces.",
    expectedAnswer:
      "Aporto estructura y seguimiento. En mi equipo actual noté que a menudo salíamos de las reuniones sin responsables claros, así que empecé a publicar después de cada una un breve resumen con las decisiones y los nombres. Me llevaba cinco minutos y el equipo lo adoptó como hábito. También me gusta ayudar a los compañeros nuevos: trabajé en pareja con las dos últimas incorporaciones durante sus primeras semanas, y ambas estaban contribuyendo a producción en menos de un mes.",
    explanation:
      "Los entrevistadores quieren saber cómo cambia el equipo porque tú formas parte de él. Los hábitos concretos y su efecto en los demás responden mejor a eso que las afirmaciones generales sobre ser «buen compañero de equipo».",
    tips: ["Describe un comportamiento, no una etiqueta.", "Muestra el efecto en el equipo, no solo en tu propio trabajo."],
    commonMistakes: ["Decir «Sé trabajar en equipo» sin dar un ejemplo.", "Hablar solo de tus tareas individuales."],
    followUpQuestions: ["¿Qué papel sueles asumir en un equipo nuevo?", "¿Con qué tipo de compañero te resulta difícil trabajar?"],
  },
  'gen-010': {
    question: "¿Qué habilidad estás trabajando actualmente?",
    intent: "El entrevistador evalúa tus hábitos de aprendizaje y si asumes la responsabilidad de tu propio desarrollo.",
    expectedAnswer:
      "Estoy trabajando mis habilidades de análisis de datos. En mi puesto a menudo tengo que justificar decisiones con cifras, y dependía de mis compañeros para que me extrajeran los datos. Hace tres meses empecé un curso de SQL en línea y practico con nuestra base de datos real de informes media hora dos veces por semana. Ahora puedo elaborar la mayoría de mis propios informes, y el mes pasado los usé para demostrar que una funcionalidad que teníamos prevista apenas se usaba, lo que nos ahorró un sprint de trabajo.",
    explanation:
      "Esta pregunta comprueba si aprendes de forma activa. Una buena respuesta nombra una habilidad concreta, explica por qué importa para tu trabajo, describe tu método y comparte los primeros resultados. Lo ideal es que esté relacionada con el puesto al que te postulas.",
    tips: ["Elige una habilidad útil para el puesto al que aspiras.", "Menciona tu método y con qué frecuencia practicas.", "Comparte un primer resultado para demostrar tu progreso."],
    commonMistakes: ["Nombrar una habilidad sin ningún plan detrás.", "Elegir algo sin relación con el trabajo sin explicar por qué."],
    followUpQuestions: ["¿Cómo decides qué aprender a continuación?", "¿Qué aprendiste el año pasado que usas a diario?"],
  },
  'gen-011': {
    question: "Háblame de una ocasión en la que estuviste fuera de tu zona de confort.",
    intent: "El entrevistador quiere ver cómo te comportas cuando te falta experiencia: si te bloqueas, te tiras un farol o aprendes rápido.",
    expectedAnswer:
      "Situación: mi jefe de equipo se marchó de repente dos semanas antes de una demo con un cliente. Tarea: yo era el desarrollador con más experiencia que quedaba, así que me pidieron dirigir la demo y la relación con el cliente, algo que nunca había hecho. Acción: pedí a mi responsable una breve sesión informativa sobre las prioridades del cliente, ensayé la demo dos veces con compañeros y preparé respuestas a las preguntas que más temía. Durante la demo, cuando no sabía una respuesta, lo dije y prometí enviar una respuesta por escrito al día siguiente. Resultado: el cliente aprobó la siguiente fase y seguí siendo su contacto principal durante seis meses.",
    explanation:
      "La clave es cómo afrontas lo desconocido: buscar información, prepararte de forma deliberada y ser honesto sobre lo que no sabes. Son señales de que sabrás asumir nuevas responsabilidades.",
    tips: ["Elige una situación que realmente te exigiera ir más allá.", "Destaca cómo te preparaste y a quién pediste ayuda."],
    commonMistakes: ["Elegir un ejemplo trivial.", "Ocultar las dificultades y presentarte como alguien cómodo desde el primer momento."],
    followUpQuestions: ["¿Qué harías de otra manera?", "¿Quisiste conservar esa responsabilidad después?"],
  },
  'gen-012': {
    question: "Háblame de una debilidad que realmente te haya costado algo en el trabajo.",
    intent: "Esta versión más profunda de la pregunta sobre debilidades evalúa si puedes asumir una consecuencia real sin ponerte a la defensiva.",
    expectedAnswer:
      "Tiendo a subestimar el tiempo que requiere el trabajo de integración. Hace dos años me comprometí a entregar una integración con un socio en tres semanas; tardé siete porque la documentación de la API del socio estaba desactualizada y lo descubrí tarde. La consecuencia fue real: nuestro equipo comercial tuvo que retrasar un lanzamiento con un cliente y yo tuve que explicar el retraso. Desde entonces hago las estimaciones de otra manera. Dedico los dos primeros días a una prueba técnica contra el sistema real, doy un rango en lugar de una fecha única y comparto los riesgos por escrito. En las tres últimas integraciones, mis estimaciones se desviaron menos de un 20 % del tiempo real.",
    explanation:
      "En un nivel avanzado, los entrevistadores esperan una debilidad con un coste real, que la asumas por completo y un proceso modificado respaldado por resultados. La respuesta demuestra que aprendes de las consecuencias y no de la teoría.",
    tips: ["Elige una debilidad cuyo coste puedas describir con hechos.", "Describe el proceso que cambiaste, no solo buenas intenciones.", "Termina con pruebas de que el cambio funciona."],
    commonMistakes: ["Minimizar el impacto o culpar a otros.", "Elegir un ejemplo catastrófico que haga dudar de tu criterio."],
    followUpQuestions: ["¿Cómo reaccionó tu responsable en ese momento?", "¿Cómo gestionas un plazo que sabes que no es realista?"],
  },
  'gen-013': {
    question: "Si llamáramos a tu último responsable, ¿qué diría que podrías hacer mejor?",
    intent: "El entrevistador comprueba si conoces tus áreas de mejora y si tu respuesta coincidiría con una verificación real de referencias.",
    expectedAnswer:
      "Probablemente diría que debería expresar antes mi desacuerdo. En las reuniones de planificación a veces aceptaba un alcance que me parecía demasiado grande y solo planteaba mis dudas cuando el trabajo ya estaba en marcha. Mi responsable me dijo directamente en mi última evaluación que un desacuerdo temprano es más útil que un aviso tardío. Desde entonces anoto mis dudas antes de la planificación y las planteo en la reunión, aunque resulte incómodo. En el último sprint, eso nos llevó a reducir una funcionalidad a la mitad antes de empezarla.",
    explanation:
      "Responder como si la llamada de referencia fuera real te obliga a elegir un feedback honesto y concreto. Demostrar que lo escuchaste y actuaste en consecuencia refleja que sabes dejarte orientar, algo que los responsables valoran mucho.",
    tips: ["Usa feedback que hayas recibido de verdad.", "Muestra qué cambiaste después de escucharlo."],
    commonMistakes: ["Inventar un feedback que suena a elogio.", "Contradecir lo que diría realmente una referencia."],
    followUpQuestions: ["¿Qué era lo que más valoraba de tu trabajo?", "¿Cómo sueles pedir feedback?"],
  },
  'gen-014': {
    question: "¿Por qué quieres trabajar aquí?",
    intent: "El entrevistador quiere pruebas de que has investigado la empresa y de que tus motivos van más allá de «necesito un trabajo».",
    expectedAnswer:
      "Me atrajeron tres cosas. Primero, su producto: llevo un año usando su app de presupuestos y me gusta que explique los gastos en lugar de limitarse a enumerarlos. Segundo, el artículo de su blog de ingeniería sobre el paso a equipos más pequeños e independientes encaja con mi forma de trabajar. Tercero, el propio puesto: están desarrollando las funcionalidades de datos de la app, y es justo en lo que me he centrado los dos últimos años. Veo un lugar claro en el que puedo contribuir desde el principio.",
    explanation:
      "Una respuesta concreta demuestra interés real y preparación. Vincular la empresa (producto, valores, forma de trabajar) con tu propia experiencia prueba que el encaje es real y no genérico.",
    tips: ["Menciona algo concreto: un producto, un artículo, un valor, un proyecto reciente.", "Relaciona lo que encontraste con tus propias habilidades u objetivos."],
    commonMistakes: ["Dar respuestas que valdrían para cualquier empresa («Son líderes en su mercado»).", "Hablar solo del salario o de la ubicación."],
    followUpQuestions: ["¿Qué crees que podríamos mejorar en nuestro producto?", "¿Con qué otras empresas estás en conversaciones?"],
  },
  'gen-015': {
    question: "¿Por qué quieres este puesto?",
    intent: "El entrevistador quiere entender qué te atrae del puesto en sí y si comprendes lo que implica.",
    expectedAnswer:
      "Este puesto combina las dos partes de mi trabajo que más disfruto: desarrollar funcionalidades y trabajar directamente con los usuarios. En mi empleo actual paso la mayor parte del tiempo en herramientas internas, y los momentos que me resultan más gratificantes son cuando puedo hablar con las personas que las usan. La oferta menciona participar en entrevistas con clientes y convertir su feedback en cambios de producto, que es exactamente el tipo de ciclo del que quiero formar parte.",
    explanation:
      "Esta pregunta trata del puesto, no de la empresa. Los entrevistadores quieren ver que has leído la descripción del puesto, que sabes cómo es el trabajo diario y que encaja con lo que te motiva.",
    tips: ["Cita dos o tres responsabilidades de la descripción del puesto.", "Relaciónalas con lo que disfrutas y haces bien."],
    commonMistakes: ["Hablar de la empresa en lugar del puesto.", "Dar la impresión de que te valdría cualquier trabajo."],
    followUpQuestions: ["¿Qué parte de este puesto te resultaría más difícil?", "¿Cómo sería un primer mes excelente?"],
  },
  'gen-016': {
    question: "¿Por qué quieres dejar tu trabajo actual?",
    intent: "El entrevistador comprueba que tus motivos son profesionales y que los mismos problemas no aparecerán en este puesto.",
    expectedAnswer:
      "He aprendido mucho en mi empresa actual, sobre todo a construir servicios fiables. Pero el producto se ha vuelto muy estable y la mayor parte de mi trabajo ahora es mantenimiento. Quiero trabajar en un producto que siga creciendo, donde pueda ayudar a diseñar nuevas funcionalidades. Lo hablé con mi responsable y no hay ningún proyecto de ese tipo previsto para el próximo año, así que lo estoy buscando en otro lugar.",
    explanation:
      "Las mejores respuestas se centran en hacia dónde vas, no en aquello de lo que huyes. Mantener una actitud positiva hacia tu empleador actual demuestra profesionalidad y tranquiliza al entrevistador sobre que no te irás por frustraciones menores.",
    tips: ["Plantea el cambio en términos de crecimiento o de encaje.", "Mantente objetivo y positivo respecto a tu empleador actual.", "Si te despidieron, dilo de forma breve y serena, y pasa a lo que aprendiste."],
    commonMistakes: ["Criticar a tu responsable o a tus compañeros.", "Dar un motivo que el nuevo puesto también tiene."],
    followUpQuestions: ["¿Qué haría que te quedaras en tu empresa actual?", "¿Lo has hablado con tu responsable?"],
  },
  'gen-017': {
    question: "¿Qué te motiva?",
    intent: "El entrevistador quiere saber qué te mantiene implicado y si el puesto puede ofrecértelo.",
    expectedAnswer:
      "Me motiva ver el efecto de mi trabajo en personas reales. En mi último puesto desarrollé una pequeña herramienta que permitía al personal del almacén imprimir las etiquetas de envío con un clic en lugar de cinco. Una semana después, el jefe de equipo me dijo que les ahorraba casi una hora al día. Ese tipo de momentos me impulsan mucho más que la tecnología en sí. Es una de las razones por las que me interesa este puesto, ya que sus equipos trabajan cerca de los usuarios finales.",
    explanation:
      "Una motivación resulta creíble cuando se ilustra con un momento real. Vincularla con el puesto demuestra al entrevistador que el trabajo te mantendrá implicado a lo largo del tiempo.",
    tips: ["Elige una motivación que el puesto pueda satisfacer de verdad.", "Ilústrala con un momento breve y real."],
    commonMistakes: ["Mencionar solo el dinero o la estabilidad laboral.", "Dar una respuesta abstracta sin ningún ejemplo."],
    followUpQuestions: ["¿Qué te desmotiva?", "¿Cómo te mantienes motivado en tareas repetitivas?"],
  },
  'gen-018': {
    question: "¿Por qué deberíamos contratarte?",
    intent: "El entrevistador te invita a resumir tu encaje con el puesto de forma segura y estructurada.",
    expectedAnswer:
      "Buscan a alguien que pueda mantener su app móvil y mejorar su rendimiento trabajando de cerca con los diseñadores. Llevo tres años haciendo exactamente eso: mantuve una app con 200.000 usuarios y reduje su tiempo de arranque a la mitad. También trabajo bien con equipos de diseño; en mi empleo actual organicé una sesión semanal con nuestros diseñadores para revisar las nuevas pantallas antes del desarrollo. Por último, me interesa de verdad su sector, ya que uso apps como la suya todos los días.",
    explanation:
      "Este es tu alegato final. Recuerda las principales necesidades del puesto y relaciona cada una con una prueba de tu experiencia. Terminar con un interés genuino añade motivación a la competencia.",
    tips: ["Parte de las necesidades de la descripción del puesto, no de tu CV.", "Da dos o tres coincidencias, cada una con pruebas.", "Que dure menos de un minuto."],
    commonMistakes: ["Repetir tu CV.", "Ser impreciso («Soy trabajador y estoy motivado»).", "Sonar arrogante."],
    followUpQuestions: ["¿Qué necesitarías de nosotros para tener éxito?", "¿Qué le falta a tu perfil para este puesto?"],
  },
  'gen-019': {
    question: "¿Qué te gustaría lograr en tus primeros 90 días?",
    intent: "El entrevistador quiere ver si sabes planificar tu incorporación de forma realista y centrarte en lo que importa para el negocio.",
    expectedAnswer:
      "Durante el primer mes me centraría en aprender: conocer a las personas con las que voy a trabajar, entender el producto, las métricas principales y los mayores puntos de dolor, y entregar algunas correcciones pequeñas para familiarizarme con el código y el proceso de publicación. En el segundo mes asumiría la responsabilidad de un trabajo significativo, idealmente algo que el equipo ya haya identificado como prioritario, y lo entregaría de principio a fin. Para el tercer mes me gustaría proponer una mejora basada en lo que haya observado, por ejemplo en pruebas o despliegue, y acordar con mi responsable los objetivos para los seis meses siguientes. También haría un seguimiento cada pocas semanas para asegurarme de que vemos mi progreso de la misma manera.",
    explanation:
      "Un plan de 90 días creíble equilibra aprender, entregar y mejorar. Demuestra humildad (escuchar primero), ambición (asumir algo real) y alineación (acordar objetivos con el responsable). Mencionar los seguimientos demuestra que buscas feedback en lugar de dar las cosas por supuestas.",
    tips: ["Estructura la respuesta por meses o por fases.", "Menciona que aprenderás antes de cambiar las cosas.", "Pregunta al entrevistador cómo sería el éxito para ellos."],
    commonMistakes: ["Prometer grandes cambios antes de entender el contexto.", "Describir solo un aprendizaje pasivo sin ninguna entrega."],
    followUpQuestions: ["¿Qué harías si tu responsable tuviera otra prioridad?", "¿Cómo te ganarías la confianza del equipo?"],
  },
  'gen-020': {
    question: "Háblame de una ocasión en la que perdiste la motivación en el trabajo. ¿Qué hiciste?",
    intent: "El entrevistador quiere saber si eres capaz de reconocer un bajón de motivación y gestionarlo con responsabilidad.",
    expectedAnswer:
      "Situación: tras una reorganización, a mi equipo le asignaron la migración de un antiguo sistema de informes, un trabajo sin usuarios visibles. Tarea: aun así tenía que entregarlo dentro del trimestre, y me di cuenta de que lo estaba posponiendo. Acción: hablé con mi responsable, que me explicó que la migración estaba bloqueando una actualización de seguridad para toda la empresa. También dividí el trabajo en hitos semanales y automaticé los pasos de conversión más repetitivos, lo que lo hizo más interesante. Resultado: terminamos dos semanas antes de lo previsto y otros dos equipos reutilizaron el script que escribí.",
    explanation:
      "Todo el mundo pierde la motivación alguna vez. Los entrevistadores valoran a las personas que lo detectan, buscan el propósito del trabajo y actúan para cambiar la situación en lugar de dejar que su trabajo se resienta.",
    tips: ["Sé honesto sobre el bajón; hace que la historia sea creíble.", "Céntrate en las acciones que tomaste para recuperarte."],
    commonMistakes: ["Afirmar que siempre estás motivado.", "Culpar a la empresa sin describir tus propias acciones."],
    followUpQuestions: ["¿Qué señales te indican que estás perdiendo la motivación?", "¿Cómo te mantienes motivado durante proyectos largos?"],
  },
  'gen-021': {
    question: "¿Dónde te ves dentro de cinco años?",
    intent: "El entrevistador quiere saber si tus ambiciones son realistas y compatibles con el puesto y la empresa.",
    expectedAnswer:
      "Dentro de cinco años me gustaría ser un ingeniero sénior reconocido por mi experiencia en aplicaciones con un uso intensivo de datos, alguien en quien el equipo confíe para las decisiones de diseño. También me gustaría haber sido mentor de algunos desarrolladores junior, porque disfruto con esa parte del trabajo. Veo este puesto como un paso sólido en esa dirección, ya que me daría experiencia con volúmenes de datos mucho mayores de los que manejo hoy.",
    explanation:
      "El entrevistador no te pide una predicción precisa. Quiere ver una dirección que encaje con el puesto y que sugiera que te quedarás y crecerás. Centrarte en habilidades e impacto en lugar de en cargos mantiene la respuesta creíble.",
    tips: ["Describe una dirección en términos de habilidades e impacto.", "Relaciónala con lo que este puesto puede ofrecerte."],
    commonMistakes: ["Decir que quieres el puesto del entrevistador.", "Describir objetivos que la empresa no puede ofrecer, como montar tu propio negocio el año que viene.", "Responder «No tengo ni idea»."],
    followUpQuestions: ["¿Cómo piensas llegar hasta ahí?", "¿Qué te haría dejar un trabajo antes de ese plazo?"],
  },
  'gen-022': {
    question: "¿Cómo encaja este puesto en tu plan de carrera?",
    intent: "El entrevistador quiere ver que esta candidatura es una elección meditada y no algo al azar.",
    expectedAnswer:
      "Mi plan es convertirme en un ingeniero con visión de producto, capaz de llevar una funcionalidad desde la idea hasta un resultado medible. Hasta ahora he construido unas bases técnicas sólidas, pero siempre he trabajado lejos de las decisiones de producto. En este puesto, los ingenieros participan en la fase de descubrimiento con los product managers, que es la pieza que me falta. A cambio, aporto una experiencia sólida en pruebas y automatización de publicaciones, algo que vi que están intentando mejorar.",
    explanation:
      "Esta respuesta muestra lo que el puesto te aporta a ti y lo que tú aportas al puesto. Ese intercambio hace que el encaje resulte equilibrado y creíble.",
    tips: ["Expón tu plan en una sola frase.", "Nombra la carencia que cubre este puesto y lo que aportas a cambio."],
    commonMistakes: ["Presentar el puesto como un trampolín temporal.", "Hablar solo de lo que vas a ganar tú."],
    followUpQuestions: ["¿Qué haría que este puesto fuera un error para ti?", "¿Qué habilidad esperas desarrollar primero?"],
  },
  'gen-023': {
    question: "¿Te interesa pasar a un puesto de gestión de personas?",
    intent: "El entrevistador quiere saber si tus aspiraciones encajan con las trayectorias profesionales que ofrece la empresa y si entiendes lo que implica gestionar.",
    expectedAnswer:
      "Me interesa, pero no de inmediato. Durante el último año he empezado a asumir algunas tareas de liderazgo: coordino nuestra planificación de sprint y soy mentor de dos desarrolladores junior, y disfruto ayudando a las personas a progresar. Pero también sé que la gestión es otro trabajo, con menos trabajo práctico. Así que en los próximos dos años me gustaría crecer como líder técnico y luego decidir, con experiencia real, si me encaja mejor la gestión de personas o una trayectoria técnica sénior.",
    explanation:
      "Lo mejor es una respuesta honesta y matizada. Demostrar que entiendes la diferencia entre el liderazgo técnico y la gestión de personas, y que ya lo has probado a pequeña escala, hace que tu respuesta sea reflexiva y no una simple búsqueda de un cargo.",
    tips: ["Pregunta qué trayectorias profesionales ofrece la empresa, antes o después de responder.", "Da señales concretas de experiencia en liderazgo, si las tienes."],
    commonMistakes: ["Decir que sí solo porque suena ambicioso.", "Descartar por completo la gestión en un puesto que puede llevar a ella."],
    followUpQuestions: ["¿Qué te resultaría más difícil de gestionar personas?", "Según tu experiencia, ¿qué hace a un buen responsable?"],
  },
  'gen-024': {
    question: "¿Cómo han cambiado tus planes de carrera con el tiempo y por qué?",
    intent: "El entrevistador quiere ver cómo tomas decisiones profesionales y si aprendes de la experiencia.",
    expectedAnswer:
      "Situación: estudié marketing y empecé mi carrera como coordinador de campañas. Tarea: parte de mi trabajo consistía en elaborar informes semanales de rendimiento, y me di cuenta de que disfrutaba más con ese trabajo que con las propias campañas. Acción: hice un curso nocturno de análisis de datos, automaticé nuestros informes con SQL y me ofrecí a ayudar a otros equipos con los suyos. Resultado: al cabo de un año mi empresa me pasó a un puesto de analista junior, y ahora quiero seguir creciendo como analista de datos, que es la razón por la que me postulo aquí.",
    explanation:
      "Los cambios de carrera son normales. Lo que buscan los entrevistadores es reflexión: darte cuenta de lo que disfrutas, ponerlo a prueba y actuar en consecuencia. Un «por qué» claro convierte un camino sinuoso en una historia coherente.",
    tips: ["Explica qué desencadenó cada cambio.", "Muestra los pasos concretos que diste, no solo la decisión."],
    commonMistakes: ["Presentar los cambios como fruto del azar o impuestos.", "Disculparte por no haber seguido un camino recto."],
    followUpQuestions: ["¿Echas de menos algo de tu primer trabajo?", "¿Qué te haría cambiar de rumbo otra vez?"],
  },
  'gen-025': {
    question: "¿Cómo mides tu propio crecimiento profesional?",
    intent: "El entrevistador evalúa tu autonomía y si haces seguimiento de tu progreso con pruebas y no con sensaciones.",
    expectedAnswer:
      "Uso tres tipos de señales. La primera es el alcance: el tamaño y la ambigüedad de los problemas que me confían. Hace dos años me asignaban tickets bien definidos; ahora me piden que dé forma a los problemas antes de que se conviertan en tickets. La segunda es el impacto: mantengo un documento sencillo con los resultados de mis principales proyectos, como ahorros de costes, tiempo ahorrado o incidentes evitados, que reviso cada trimestre. La tercera es el feedback: dos veces al año pido a dos o tres compañeros una cosa que debería seguir haciendo y una que debería cambiar. Cuando las tres avanzan en la buena dirección, sé que estoy creciendo; cuando una se estanca, lo hablo con mi responsable y ajusto mis objetivos.",
    explanation:
      "De los candidatos de nivel avanzado se espera que se hagan cargo de su propio desarrollo. Combinar responsabilidad, impacto medible y feedback estructurado demuestra un enfoque maduro y basado en pruebas que además ayuda a los responsables a apoyarte.",
    tips: ["Menciona al menos un hábito concreto de seguimiento.", "Muestra cómo actúas cuando tu progreso se estanca."],
    commonMistakes: ["Medir el crecimiento solo por cargos o salario.", "No tener ningún método."],
    followUpQuestions: ["¿Qué te dijo tu última ronda de feedback?", "¿Cómo podríamos apoyar ese crecimiento aquí?"],
  },
  'gen-026': {
    question: "Háblame de una habilidad que aprendiste por tu cuenta para avanzar en tu carrera.",
    intent: "El entrevistador quiere pruebas de tu iniciativa y de tu capacidad de aprender sin que nadie te lo pida.",
    expectedAnswer:
      "Situación: en mi puesto de soporte pasaba horas cada semana copiando datos entre dos sistemas. Tarea: nadie tenía tiempo para automatizarlo, así que decidí aprender lo suficiente de scripting para hacerlo yo mismo. Acción: seguí un curso gratuito de Python durante seis semanas, practiqué con pequeñas copias de nuestros archivos y pedí a un desarrollador que revisara mi script antes de usarlo con datos reales. Resultado: la tarea semanal pasó de cuatro horas a quince minutos, me pidieron automatizar otros dos procesos y esa experiencia me ayudó a pasar a mi puesto actual de desarrollador junior.",
    explanation:
      "Las historias de aprendizaje autónomo revelan curiosidad, disciplina y sentido de la responsabilidad. A los entrevistadores les gustan especialmente las historias en las que el aprendizaje resolvió un problema real y abrió nuevas oportunidades.",
    tips: ["Explica por qué decidiste aprenderla.", "Menciona cómo comprobaste que tu trabajo era correcto.", "Muestra el impacto en tu carrera."],
    commonMistakes: ["Enumerar cursos en línea sin mostrar cómo usaste la habilidad.", "Elegir una habilidad sin relación con el trabajo sin explicar su valor."],
    followUpQuestions: ["¿Qué estás aprendiendo en este momento?", "¿Cómo te mantienes al día en tu campo?"],
  },
  'gen-027': {
    question: "¿Qué sabes de nuestra empresa?",
    intent: "El entrevistador pone a prueba tu preparación y si tu interés es genuino.",
    expectedAnswer:
      "Desarrollan software de gestión de citas para clínicas, sobre todo en Europa, y han crecido rápidamente en los dos últimos años, incluido el lanzamiento de recordatorios por SMS para pacientes. Leí que ahora se están expandiendo hacia los hospitales, lo que implica requisitos más estrictos de fiabilidad y protección de datos. También vi en su página de empleo que los equipos se organizan por área de producto y con mucha autonomía. Eso es lo que me interesa: el impacto de su producto en la atención sanitaria del día a día y su forma de organizar el trabajo.",
    explanation:
      "Los entrevistadores esperan que conozcas lo básico (qué vende la empresa, a quién, noticias recientes) y que muestres por qué te importa. Terminar con tu interés personal convierte la investigación en motivación.",
    tips: ["Consulta la web, las noticias recientes, las opiniones sobre el producto y la descripción del puesto.", "Menciona una novedad reciente y por qué te interesa."],
    commonMistakes: ["Recitar la historia de la empresa sacada de su web.", "No saber nada más allá del nombre del puesto."],
    followUpQuestions: ["¿Cuál crees que es nuestro mayor reto?", "¿Has usado nuestro producto?"],
  },
  'gen-028': {
    question: "¿Quiénes crees que son nuestros principales competidores y cómo nos comparamos con ellos?",
    intent: "El entrevistador quiere ver si entiendes el mercado de la empresa y si puedes pensar como alguien que trabaja en ella.",
    expectedAnswer:
      "Por lo que he visto, sus principales competidores son, por un lado, las grandes plataformas de RR. HH. todo en uno y, por otro, algunas start-ups especializadas en nóminas. Las grandes plataformas ganan en amplitud, pero sus opiniones mencionan a menudo una configuración complicada. Las start-ups son más baratas, pero más débiles en el cumplimiento normativo entre países. Ustedes parecen estar en medio: más sencillos que las grandes plataformas y más sólidos en cumplimiento normativo multipaís. El riesgo que veo es que los grandes actores están mejorando su proceso de incorporación, así que la facilidad de uso por sí sola quizá no baste durante mucho tiempo. Me interesaría saber cómo lo ven ustedes.",
    explanation:
      "No se espera que seas analista, pero una visión estructurada del mercado demuestra sentido de negocio. Terminar con una pregunta convierte la respuesta en una conversación y demuestra humildad.",
    tips: ["Agrupa a los competidores por tipos en lugar de enumerar nombres.", "Menciona una fortaleza y un riesgo.", "Invita al entrevistador a dar su punto de vista."],
    commonMistakes: ["Criticar duramente a los competidores.", "Hacer suposiciones sin haber investigado nada."],
    followUpQuestions: ["¿Qué harías para mantenernos por delante?", "¿Qué producto de la competencia has probado?"],
  },
  'gen-029': {
    question: "¿Qué tipo de entorno de trabajo prefieres?",
    intent: "El entrevistador comprueba si te sentirás cómodo y serás eficaz en el entorno real de la empresa.",
    expectedAnswer:
      "Trabajo mejor en un entorno en el que los objetivos son claros pero las personas tienen libertad sobre cómo alcanzarlos. Me gusta una comunicación regular e informal, por ejemplo conversaciones rápidas cuando algo no está claro, en lugar de esperar a una reunión semanal. También he aprendido a trabajar bien en remoto. Por lo que me has contado de sus equipos, con objetivos trimestrales claros y mucha autonomía, me parece que encajaría bien.",
    explanation:
      "La mejor respuesta es honesta y está conectada con lo que sabes de la empresa. Describir tus preferencias en términos de cómo trabajas mejor, y no de lo que te disgusta, mantiene un tono positivo.",
    tips: ["Investiga la cultura de la empresa antes de la entrevista.", "Describe lo que te ayuda a rendir, no solo lo que te gusta."],
    commonMistakes: ["Describir un entorno opuesto al de la empresa.", "Decir que te adaptas a todo sin expresar ninguna preferencia."],
    followUpQuestions: ["¿Cómo trabajas cuando los objetivos no están claros?", "¿Qué entorno te resultó difícil?"],
  },
  'gen-030': {
    question: "Describe el mejor equipo en el que has trabajado. ¿Qué hizo que funcionara?",
    intent: "El entrevistador quiere entender qué prácticas de equipo valoras y si contribuyes a crearlas.",
    expectedAnswer:
      "Situación: mi mejor equipo era un grupo de cinco personas que desarrollaba una nueva funcionalidad de pagos con un plazo ajustado. Tarea: teníamos que entregar en tres meses mientras integrábamos con un banco con el que nunca habíamos trabajado. Acción: lo que hizo que funcionara fue una asignación de responsabilidades muy clara, una breve reunión diaria en la que la gente decía abiertamente cuándo estaba bloqueada y la costumbre de revisar el trabajo de los demás el mismo día. Mi contribución fue montar un entorno de pruebas compartido con el banco para que todos pudieran probar sin esperar. Resultado: lanzamos a tiempo y sin errores críticos, y mantuvimos esos hábitos en los proyectos siguientes.",
    explanation:
      "Esta pregunta revela tu idea de un equipo sano. Nombrar prácticas concretas, y tu contribución a ellas, demuestra que entiendes qué hace eficaces a los equipos y que participas en construirlo.",
    tips: ["Nombra dos o tres prácticas concretas.", "Explica tu propia contribución al éxito del equipo."],
    commonMistakes: ["Decir solo que «todos nos llevábamos bien».", "Describir el equipo sin tu papel en él."],
    followUpQuestions: ["¿Qué traerías de ese equipo al nuestro?", "Háblame de un equipo que no funcionó."],
  },
  'gen-031': {
    question: "Si te incorporaras, ¿qué cambiarías de nuestro producto?",
    intent: "El entrevistador quiere ver tu pensamiento crítico, tu preparación y la diplomacia con la que formulas una crítica.",
    expectedAnswer:
      "Tendría cuidado de no cambiar nada antes de entender sus datos y sus limitaciones, así que tómalo como una primera impresión. Me registré en la prueba gratuita y el proceso de incorporación me llevó unos quince minutos antes de poder crear mi primer proyecto; varias opiniones mencionan lo mismo. Me gustaría analizar en qué punto abandonan los usuarios durante el registro y probar un camino más corto, por ejemplo creando automáticamente un proyecto de muestra. También noté que la app móvil no funciona sin conexión, lo que podría ser importante para sus clientes de servicios de campo. Me interesaría saber si esas observaciones coinciden con lo que ve su equipo.",
    explanation:
      "En un nivel avanzado, los entrevistadores esperan sugerencias concretas y bien argumentadas, basadas en un uso real y en datos, y planteadas con humildad. Proponer cómo verificar tu idea demuestra un enfoque orientado al producto y basado en pruebas.",
    tips: ["Usa de verdad el producto antes de la entrevista.", "Plantea las sugerencias como hipótesis que hay que comprobar.", "Pregunta si tus observaciones coinciden con las suyas."],
    commonMistakes: ["Decir que todo es perfecto.", "Criticar con dureza sin entender las limitaciones."],
    followUpQuestions: ["¿Cómo medirías si ese cambio funciona?", "¿Qué priorizarías primero?"],
  },
  'gen-032': {
    question: "¿Qué buscas en un responsable?",
    intent: "El entrevistador evalúa cómo te gusta que te dirijan y si eso encaja con el estilo de gestión del equipo.",
    expectedAnswer:
      "Valoro a un responsable que fije expectativas claras y luego me deje margen para trabajar, sin dejar de estar disponible cuando me atasco. El feedback regular y honesto es muy importante para mí; mi mejor responsable hacía una reunión individual breve cada dos semanas y me decía directamente qué podía mejorar, lo que me ayudó a crecer rápido. También valoro a un responsable que explique las razones de las prioridades, para que yo pueda tomar buenas decisiones por mi cuenta.",
    explanation:
      "Los entrevistadores suelen hacer esta pregunta para comprobar el encaje con el futuro responsable. Una buena respuesta se centra en los comportamientos que te ayudan a rendir, ilustrados con un ejemplo real, sin describir un ideal imposible.",
    tips: ["Describe comportamientos, no rasgos de personalidad.", "Pon un ejemplo de un responsable que te ayudó."],
    commonMistakes: ["Describir solo lo que te disgustaba de antiguos responsables.", "Pedir que no haya ninguna supervisión."],
    followUpQuestions: ["¿Cómo prefieres recibir feedback?", "Háblame de un responsable con el que te resultó difícil trabajar."],
  },
  'gen-033': {
    question: "¿Cuál crees que será el mayor reto de este puesto?",
    intent: "El entrevistador quiere ver si entiendes el puesto en profundidad y si tienes un plan realista para afrontar sus dificultades.",
    expectedAnswer:
      "Según la descripción del puesto y nuestra conversación, creo que el mayor reto será equilibrar las nuevas funcionalidades con la fiabilidad de una plataforma que ha crecido muy rápido. Mencionaste que los incidentes han aumentado mientras el equipo se ha duplicado, y eso suele significar que el conocimiento compartido no ha seguido el ritmo. Lo abordaría entendiendo primero de dónde vienen los incidentes y proponiendo después mejoras pequeñas y regulares, como mejores alertas o runbooks, junto al trabajo en funcionalidades, en lugar de un gran proyecto aparte. Ya he hecho algo parecido, cuando ayudé a reducir a la mitad los incidentes semanales en dos trimestres. Me gustaría acordar ese equilibrio con mi responsable desde el principio.",
    explanation:
      "Esta pregunta premia a los candidatos que han escuchado durante la entrevista y saben relacionar la situación de la empresa con un plan realista. Mostrar una experiencia previa relevante demuestra que puedes afrontar el reto.",
    tips: ["Usa información de la propia entrevista.", "Propón un enfoque, no solo un diagnóstico.", "Respáldalo con una experiencia previa similar."],
    commonMistakes: ["Nombrar un reto genérico como «aprender las herramientas».", "Nombrar un reto sin ningún plan."],
    followUpQuestions: ["¿Qué necesitarías del equipo para abordarlo?", "¿Cuánto tiempo haría falta para ver resultados?"],
  },
  'gen-034': {
    question: "¿Cómo organizas tu jornada de trabajo?",
    intent: "El entrevistador quiere entender tus hábitos de planificación y cómo equilibras el trabajo concentrado con las interrupciones.",
    expectedAnswer:
      "Empiezo revisando mis tareas y eligiendo la una o dos que más importan ese día. Reservo las mañanas para el trabajo concentrado, porque es cuando mejor me concentro, y agrupo las reuniones y los mensajes por la tarde siempre que puedo. Tengo una lista corta de tareas pequeñas para los huecos entre reuniones. Al final del día dedico cinco minutos a anotar lo que queda pendiente, para poder arrancar rápido a la mañana siguiente. Cuando surge algo urgente, compruebo si de verdad no puede esperar y, si no puede, aviso a los demás de qué se va a retrasar.",
    explanation:
      "Los entrevistadores buscan un método deliberado, no la perfección. Mostrar cómo proteges tu concentración, gestionas las interrupciones y comunicas los cambios demuestra fiabilidad.",
    tips: ["Describe una rutina real, incluida la forma en que gestionas las peticiones urgentes.", "Menciona una herramienta o un hábito que uses de verdad."],
    commonMistakes: ["Decir que simplemente «te dejas llevar».", "Describir una rutina rígida que ignora el trabajo en equipo."],
    followUpQuestions: ["¿Qué haces cuando llegan dos peticiones urgentes a la vez?", "¿Cómo gestionas las interrupciones constantes?"],
  },
  'gen-035': {
    question: "¿Cómo gestionas el estrés y la presión?",
    intent: "El entrevistador quiere saber si sigues siendo eficaz bajo presión y si tienes formas saludables de afrontarla.",
    expectedAnswer:
      "Intento convertir la presión en un plan. Cuando tuvimos que corregir un problema de datos antes del cierre mensual de un cliente, enumeré lo que había que hacer sí o sí, acordé las prioridades con mi responsable y envié al cliente actualizaciones breves dos veces al día para que nadie tuviera que perseguirnos. Descomponer el problema me ayuda a mantener la calma. Fuera del trabajo, hacer deporte con regularidad me ayuda a recuperarme. También he aprendido a avisar pronto cuando la presión se debe a un plan poco realista, en lugar de quedarme trabajando hasta tarde cada noche en silencio.",
    explanation:
      "Una buena respuesta muestra un método (priorizar, comunicar) y unos límites saludables. Los entrevistadores desconfían de los candidatos que afirman no sentir nunca estrés, o que solo lo afrontan trabajando más horas.",
    tips: ["Ilústralo con un ejemplo real y breve.", "Muestra tanto cómo actúas en el momento como la forma en que previenes el agotamiento."],
    commonMistakes: ["Afirmar que nunca sientes estrés.", "Describir las jornadas largas como tu única solución."],
    followUpQuestions: ["Háblame de una ocasión en la que el estrés afectó a tu trabajo.", "¿Cómo ayudas a tus compañeros cuando están bajo presión?"],
  },
  'gen-036': {
    question: "¿Prefieres trabajar solo o en equipo?",
    intent: "El entrevistador quiere ver si sabes hacer ambas cosas y cómo decides qué modo requiere cada tarea.",
    expectedAnswer:
      "Disfruto de ambos, y creo que un buen trabajo necesita los dos. Me gusta trabajar solo en tareas que requieren una concentración profunda, como depurar un problema complejo o redactar un documento de diseño. Pero prefiero comentar el enfoque con el equipo antes y recibir feedback después, porque así se detectan los errores pronto. En mi empleo actual, por ejemplo, escribo una propuesta breve, la comparto para recibir comentarios, trabajo en ella solo durante unos días y luego pido una revisión.",
    explanation:
      "Rara vez es una pregunta trampa: la mayoría de los puestos requieren ambas cosas. La respuesta más sólida demuestra que sabes elegir el modo adecuado para cada tarea y que la colaboración forma parte de tu forma habitual de trabajar.",
    tips: ["Evita las respuestas extremas.", "Describe cómo combinas ambos modos en la práctica."],
    commonMistakes: ["Decir que no te gusta trabajar en equipo.", "Decir que no puedes trabajar sin apoyo constante."],
    followUpQuestions: ["¿Cómo te mantienes en contacto con el equipo cuando trabajas solo?", "¿Qué haces cuando el equipo no está de acuerdo con tu enfoque?"],
  },
  'gen-037': {
    question: "¿Cómo gestionas las críticas a tu trabajo?",
    intent: "El entrevistador comprueba si eres capaz de recibir feedback sin ponerte a la defensiva y si lo usas para mejorar.",
    expectedAnswer:
      "Intento tratar las críticas como información. Mi primera reacción es asegurarme de entenderlas, así que pido un ejemplo concreto. Por ejemplo, una vez un compañero sénior me dijo que mis revisiones de código eran demasiado lentas. Le pregunté qué significaba «demasiado lentas» para el equipo y descubrí que la gente esperaba dos días a que revisara su código. Empecé a reservar treinta minutos cada mañana para las revisiones y, en una semana, la espera media bajó a menos de un día. Si no estoy de acuerdo con un feedback, lo digo con calma y explico mis motivos, pero siempre lo considero primero.",
    explanation:
      "Los entrevistadores buscan personas abiertas al feedback, pero no pasivas. Pedir detalles concretos, actuar en consecuencia y saber discrepar con respeto demuestra madurez.",
    tips: ["Da un ejemplo real en el que el feedback cambió tu comportamiento.", "Demuestra que también sabes discrepar de forma constructiva."],
    commonMistakes: ["Decir que nunca recibes críticas.", "Describir solo feedback de tu responsable, nunca de tus compañeros."],
    followUpQuestions: ["Háblame de un feedback con el que no estuviste de acuerdo.", "¿Cómo das feedback crítico a los demás?"],
  },
  'gen-038': {
    question: "¿Cómo abordas una tarea que nunca has hecho antes?",
    intent: "El entrevistador quiere ver tu proceso de aprendizaje y cómo gestionas el riesgo cuando te falta experiencia.",
    expectedAnswer:
      "Primero aclaro el objetivo y qué significa «terminado», para no aprender cosas que no necesito. Luego busco el conocimiento que ya existe: documentación, un compañero que haya hecho algo parecido o un ejemplo previo en nuestro código. Construyo un pequeño prototipo para comprobar que lo he entendido antes de comprometerme con el trabajo real, y comparto pronto mi plan con alguien con experiencia. Por ejemplo, la primera vez que tuve que configurar un proveedor de pagos, construí una integración de prueba en un día, se la enseñé a nuestro líder técnico y detectamos un error de seguridad antes de que se acercara siquiera a producción.",
    explanation:
      "Esta pregunta evalúa tu agilidad de aprendizaje. Un enfoque estructurado (aclarar, investigar, prototipar, obtener feedback temprano) demuestra que puedes asumir nuevas tareas de forma segura y rápida.",
    tips: ["Describe un método repetible y luego da un ejemplo.", "Menciona en qué momento pides ayuda."],
    commonMistakes: ["Decir que lo resolverías tú solo sin preguntar a nadie.", "Esperar a recibir una formación completa antes de empezar."],
    followUpQuestions: ["¿Cómo sabes cuándo deberías pedir ayuda?", "Háblame de una tarea nueva que salió mal."],
  },
  'gen-039': {
    question: "¿Cómo mantienes informadas y alineadas a las partes interesadas en un proyecto largo?",
    intent: "El entrevistador evalúa tu comunicación con personas de nivel directivo o no técnicas y tu capacidad para evitar sorpresas.",
    expectedAnswer:
      "Acuerdo desde el principio qué necesita saber cada grupo y con qué frecuencia. En mi último proyecto, una migración de seis meses, el patrocinador ejecutivo quería un breve resumen mensual centrado en riesgos y fechas, mientras que el equipo de operaciones necesitaba detalles semanales sobre lo que iba a cambiar para ellos. Preparé un informe de estado de una página con una vista sencilla tipo semáforo y me impuse la regla de compartir las malas noticias en cuanto las conociera, junto con una propuesta de solución. Cuando el retraso de un proveedor nos hizo perder tres semanas, el patrocinador lo supo por mí ese mismo día, con dos opciones para recuperarlas. Gracias a ello, el retraso no supuso una pérdida de confianza y el proyecto terminó con el alcance original.",
    explanation:
      "En un nivel avanzado, comunicar consiste en adaptar la información a cada público y gestionar las expectativas, sobre todo cuando las cosas van mal. Compartir pronto las malas noticias, con opciones, es lo que genera credibilidad.",
    tips: ["Explica cómo adaptas el formato a cada público.", "Muestra cómo gestionas las malas noticias."],
    commonMistakes: ["Enviar el mismo informe detallado a todo el mundo.", "Ocultar los problemas hasta que se convierten en crisis."],
    followUpQuestions: ["¿Qué haces cuando una parte interesada ignora tus actualizaciones?", "¿Cómo gestionas prioridades contradictorias entre las partes interesadas?"],
  },
  'gen-040': {
    question: "¿Qué haces fuera del trabajo?",
    intent: "El entrevistador quiere conocerte como persona y puede buscar cualidades que revelen tus intereses.",
    expectedAnswer:
      "Juego en un equipo de fútbol amateur dos veces por semana, lo que me mantiene en forma y me recuerda lo mucho que depende un equipo de la comunicación. También hago voluntariado una vez al mes en una asociación de mi barrio, ayudando a personas mayores a usar sus smartphones. Es una buena lección de paciencia y de cómo explicar la tecnología de forma sencilla. Y me gusta cocinar, sobre todo probar recetas de los países a los que he viajado.",
    explanation:
      "No existe una afición correcta. Los entrevistadores buscan autenticidad y, a veces, cualidades transferibles. Basta con una respuesta breve y sincera con un ligero vínculo con el trabajo.",
    tips: ["Sé auténtico; los entrevistadores notan cuando una respuesta es inventada.", "Que sea breve y positiva.", "Comparte solo lo que te resulte cómodo compartir."],
    commonMistakes: ["Decir que no tienes tiempo para nada fuera del trabajo.", "Mencionar actividades que puedan generar dudas sobre tu disponibilidad."],
    followUpQuestions: ["¿Qué has aprendido de esa actividad?", "¿Cómo lo compaginas con el trabajo?"],
  },
};
