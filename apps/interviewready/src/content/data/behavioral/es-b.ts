import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de comportamiento 041-080: adaptabilidad, gestión del tiempo, toma de decisiones, responsabilidad, pensamiento crítico. */
export const esB: TextTable<QuestionText> = {
  'beh-041': {
    question: "Háblame de una ocasión en la que tus prioridades cambiaron de repente.",
    intent: "El entrevistador quiere ver si sabes replanificar con rapidez y comunicar el impacto de un cambio.",
    expectedAnswer:
      "Situación: estaba a mitad de la preparación de un programa de formación para el nuevo personal de ventas cuando mi responsable me pidió centrarme en una auditoría de un cliente que empezaba la semana siguiente. Tarea: tenía que pasar a la auditoría sin perder el trabajo ya hecho en la formación. Acción: dediqué una hora a anotar en qué punto estaba la formación y qué faltaba, para poder retomarla rápidamente más adelante. Avisé a las personas que esperaban la formación de la nueva fecha. Después me reuní con la responsable de la auditoría para entender qué necesitaba de mí y organicé mi semana en función de eso. Resultado: la auditoría salió sin problemas, retomé la formación dos semanas después y la impartí con solo una semana de retraso respecto al plan original.",
    explanation:
      "La adaptabilidad no consiste solo en aceptar el cambio, sino en gestionar sus consecuencias. Guardar tu avance, informar a las personas afectadas y organizarte rápido en torno a la nueva prioridad demuestra profesionalidad.",
    tips: ["Muestra cómo protegiste el trabajo que tuviste que pausar.", "Menciona a quién informaste del cambio."],
    commonMistakes: ["Quejarte del cambio.", "Abandonar la primera tarea sin avisar a nadie."],
    followUpQuestions: ["¿Cómo reaccionas cuando las prioridades cambian muy a menudo?", "¿Cómo decides qué dejar de lado?"],
  },
  'beh-042': {
    question: "Háblame de una ocasión en la que tuviste que aprender rápidamente una herramienta o tecnología nueva.",
    intent: "El entrevistador evalúa tu velocidad de aprendizaje y tu método cuando el trabajo exige una herramienta nueva.",
    expectedAnswer:
      "Situación: mi empresa cambió a una nueva herramienta de gestión de relaciones con clientes con solo una semana de antelación. Tarea: como asistente del equipo, tenía que ser capaz de formar a mis compañeros en esa herramienta en dos semanas. Acción: seguí los tutoriales oficiales por las tardes, creé una cuenta de prueba para practicar las tareas más habituales y redacté una guía rápida de dos páginas con capturas de pantalla. También me uní a la comunidad de usuarios de la herramienta para encontrar respuestas a preguntas concretas. Resultado: formé a mis ocho compañeros en dos sesiones cortas y, a final de mes, todo el equipo usaba la herramienta con normalidad.",
    explanation:
      "Los entrevistadores buscan un método de aprendizaje concreto: recursos oficiales, práctica real y una forma de compartir el conocimiento. Enseñar a otras personas es una prueba sólida de que dominas la herramienta.",
    tips: ["Describe tu método de aprendizaje.", "Muestra cómo aplicaste o compartiste lo que aprendiste."],
    commonMistakes: ["Decir que aprendes rápido sin aportar pruebas.", "Describir solo un aprendizaje pasivo, como ver vídeos."],
    followUpQuestions: ["¿Qué fue lo más difícil de esa herramienta?", "¿Cómo sigues aprendiendo una vez que ya eres productivo?"],
  },
  'beh-043': {
    question: "Háblame de una ocasión en la que te adaptaste a un nuevo responsable o a una reorganización.",
    intent: "El entrevistador quiere saber si sigues siendo eficaz y mantienes una actitud positiva cuando cambia tu entorno de trabajo.",
    expectedAnswer:
      "Situación: tras una reorganización, mi equipo se fusionó con otro y pasé a tener una nueva responsable con un estilo muy distinto: ella prefería planes por escrito, mientras que mi responsable anterior prefería conversaciones rápidas. Tarea: quería seguir entregando resultados y construir pronto una buena relación con ella. Acción: en nuestra primera reunión individual le pregunté cómo prefería recibir las novedades y qué esperaba en los tres primeros meses. Empecé a enviarle un breve resumen semanal por escrito y a preparar planes de una página antes de proponer nuevas iniciativas. Resultado: en pocas semanas me dijo que mis resúmenes le ayudaban a entender el trabajo del equipo fusionado, y me encargó coordinar nuestros dos antiguos equipos.",
    explanation:
      "Adaptarse a un nuevo responsable significa entender sus expectativas y ajustar tu forma de comunicar. Preguntar directamente es sencillo y eficaz, y demuestra que asumes la responsabilidad de la relación.",
    tips: ["Explica qué era diferente y cómo te adaptaste.", "Muestra el resultado para la relación."],
    commonMistakes: ["Comparar negativamente al nuevo responsable con el anterior.", "Esperar a que sea el responsable quien se adapte a ti."],
    followUpQuestions: ["¿Qué haces si no estás de acuerdo con el enfoque de un nuevo responsable?", "¿Cómo reaccionaron tus compañeros a la reorganización?"],
  },
  'beh-044': {
    question: "Háblame de una ocasión en la que tuviste que trabajar con instrucciones muy poco claras.",
    intent: "El entrevistador comprueba cómo gestionas la ambigüedad: si aclaras, haces suposiciones razonables y sigues avanzando.",
    expectedAnswer:
      "Situación: nuestra directora me pidió «mejorar la experiencia de incorporación de clientes» sin más detalles ni plazo. Tarea: tenía que convertir esa petición tan vaga en algo concreto y útil. Acción: le hice dos preguntas: qué problema había detectado y cómo sabría que la situación había mejorado. Mencionó quejas sobre la primera semana. Entonces revisé los tickets de soporte de clientes nuevos, entrevisté a cinco de ellos y redacté una propuesta de una página con tres mejoras, un calendario y un indicador de éxito. Se la envié para que la validara antes de empezar. Resultado: aprobó dos de las tres mejoras y las quejas de clientes nuevos bajaron aproximadamente un tercio durante el trimestre siguiente.",
    explanation:
      "La ambigüedad es habitual en cualquier trabajo real. El mejor enfoque es hacer unas pocas preguntas concretas, reunir datos, proponer un plan concreto y validarlo antes de invertir tiempo.",
    tips: ["Muestra las preguntas que hiciste para aclarar la petición.", "Valida tu interpretación antes de hacer el trabajo."],
    commonMistakes: ["No hacer nada hasta que las instrucciones estén claras.", "Empezar un gran proyecto basado en suposiciones sin comprobarlas."],
    followUpQuestions: ["¿Y si ella no hubiera estado disponible para responder?", "¿Cómo documentas tus suposiciones?"],
  },
  'beh-045': {
    question: "Háblame de una ocasión en la que adaptaste tu estilo de comunicación a otra persona.",
    intent: "El entrevistador quiere ver si percibes cómo prefieren comunicarse los demás y te ajustas para ser eficaz.",
    expectedAnswer:
      "Situación: trabajaba con un contacto de un proveedor que casi nunca respondía a mis correos detallados, lo que retrasaba nuestros pedidos. Tarea: necesitaba respuestas más rápidas sin dañar la relación. Acción: durante una llamada, le pregunté cómo prefería trabajar. Me explicó que gestionaba decenas de clientes desde el móvil y que le costaba leer correos largos. Empecé a enviarle mensajes muy breves con una sola pregunta clara y el plazo en la primera línea, y lo llamaba para cualquier tema complejo. Resultado: su tiempo de respuesta pasó de varios días a unas pocas horas y nuestros pedidos dejaron de retrasarse.",
    explanation:
      "Quien comunica bien se adapta a la otra persona en lugar de esperar lo contrario. Preguntar por sus preferencias y cambiar el formato es una demostración sencilla y potente de esta habilidad.",
    tips: ["Explica cómo descubriste la preferencia de la otra persona.", "Describe exactamente qué cambiaste."],
    commonMistakes: ["Culpar a la otra persona de no comunicarse bien.", "Describir un cambio sin ningún resultado."],
    followUpQuestions: ["¿Cómo te adaptas cuando presentas ante un grupo grande con preferencias distintas?", "¿Cuál es tu estilo natural de comunicación?"],
  },
  'beh-046': {
    question: "Háblame de una ocasión en la que un plan falló y tuviste que improvisar.",
    intent: "El entrevistador evalúa tu serenidad y tu capacidad para encontrar alternativas cuando algo sale mal en el último momento.",
    expectedAnswer:
      "Situación: organicé una jornada de formación de producto para treinta empleados de tienda y, la misma mañana del evento, el envío de productos de demostración quedó retenido en la aduana. Tarea: la formación tenía que celebrarse ese día porque el personal venía de distintas ciudades. Acción: reorganicé rápidamente la agenda para empezar con las sesiones de teoría y técnicas de venta, que no necesitaban los productos. Mientras tanto, contacté con una tienda cercana y conseguí que nos prestaran cinco unidades de exposición para la tarde. Dividí al grupo en equipos pequeños para que todos pudieran manipular los productos por turnos. Resultado: la formación terminó a la hora prevista, la valoración fue de 4,5 sobre 5 y añadí a nuestra lista de control de eventos la regla de «productos entregados con tres días de antelación».",
    explanation:
      "Improvisar bien significa proteger el objetivo principal, usar con creatividad los recursos disponibles y mantener informadas a las personas. Convertir el incidente en una regla preventiva demuestra aprendizaje.",
    tips: ["Muestra cómo protegiste el objetivo principal.", "Explica qué cambiaste para la próxima vez."],
    commonMistakes: ["Contar una historia en la que la suerte resolvió el problema.", "Olvidarte de las personas afectadas por el cambio."],
    followUpQuestions: ["¿Cuál era tu plan B si la tienda te hubiera dicho que no?", "¿Cómo mantienes la calma en esos momentos?"],
  },
  'beh-047': {
    question: "Háblame de una ocasión en la que tuviste que adaptarte a una cultura, un equipo o un país muy diferente.",
    intent: "El entrevistador busca pruebas de sensibilidad cultural y de tu capacidad para adaptarte sin perder eficacia.",
    expectedAnswer:
      "Situación: pasé de una start-up pequeña e informal a un gran banco donde las decisiones requerían aprobación formal y documentación escrita. Tarea: tenía que entregar una nueva herramienta de reporting en seis meses en un entorno donde mi forma habitual de trabajar, con decisiones rápidas por chat, no encajaba. Acción: pedí a un compañero con experiencia que me explicara cómo se tomaban realmente las decisiones, incluido a quién había que consultar de manera informal antes de un comité. Empecé a preparar propuestas breves por escrito y a reservar tiempo con los revisores clave antes de cada reunión formal. También mantuve algunos hábitos de la start-up, como enseñar prototipos desde el principio, pero los presentaba en el formato que la gente esperaba. Resultado: la herramienta se aprobó en el primer comité, se entregó a tiempo y otros dos equipos adoptaron mi práctica de mostrar prototipos pronto.",
    explanation:
      "La adaptación cultural a nivel avanzado consiste en entender las reglas no escritas, ajustar tu comportamiento y seguir aportando tus propias fortalezas de una forma que la nueva cultura acepte. Ese equilibrio es lo que buscan los entrevistadores.",
    tips: ["Explica las diferencias culturales concretas.", "Muestra qué adaptaste y qué mantuviste.", "Menciona quién te ayudó a entender la cultura."],
    commonMistakes: ["Describir una cultura como mejor que la otra.", "Adaptarte tanto que no aportaste nada nuevo."],
    followUpQuestions: ["¿Qué hábito te costó más cambiar?", "¿Cómo ayudarías a una persona recién llegada a adaptarse a nuestra cultura?"],
  },
  'beh-048': {
    question: "Háblame de una ocasión en la que asumiste un rol o una tarea muy alejados de tu especialidad.",
    intent: "El entrevistador evalúa tu valentía, tu capacidad de aprendizaje y si gestionas los riesgos de trabajar fuera de tu zona de confort.",
    expectedAnswer:
      "Situación: la única persona de RR. HH. de nuestra empresa se marchó de repente y, como responsable de oficina, me pidieron encargarme de la selección para tres puestos vacantes hasta que se contratara a alguien. Tarea: nunca había seleccionado personal y los responsables de contratación necesitaban candidatos en dos meses. Acción: pedí una hora de asesoramiento a una reclutadora de mi red, reutilicé descripciones de puestos de empresas similares y acordé con cada responsable tres criterios imprescindibles. Creé una hoja de puntuación sencilla para que las entrevistas fueran coherentes y justas, y revisé con nuestro abogado externo los requisitos legales de las ofertas de empleo. Dejé claro a los responsables que estaba aprendiendo y les pedí su opinión después de cada etapa. Resultado: cubrimos dos de los tres puestos en siete semanas, ambas incorporaciones superaron el periodo de prueba y la nueva responsable de RR. HH. conservó mi hoja de puntuación.",
    explanation:
      "Asumir un trabajo desconocido con responsabilidad implica buscar asesoramiento experto, crear estructura, revisar riesgos como las normas legales y ser transparente sobre lo que estás aprendiendo. El entrevistador quiere ver tanto audacia como buen criterio.",
    tips: ["Muestra cómo gestionaste los riesgos de la falta de experiencia.", "Menciona a los expertos que consultaste.", "Sé transparente sobre lo que no lograste."],
    commonMistakes: ["Fingir que te convertiste en experto de la noche a la mañana.", "Ignorar el riesgo de cometer errores."],
    followUpQuestions: ["¿Qué harías de otra manera con más experiencia?", "¿Te gustaría volver a hacer ese tipo de trabajo?"],
  },
  'beh-049': {
    question: "Háblame de una ocasión en la que tuviste varios plazos de entrega al mismo tiempo.",
    intent: "El entrevistador quiere ver cómo planificas, priorizas y comunicas cuando la carga de trabajo llega a su punto máximo.",
    expectedAnswer:
      "Situación: a final de semestre tenía dos exámenes, un proyecto en grupo y mi trabajo a tiempo parcial en la misma semana. Tarea: debía cumplir con todo sin bajar la calidad del proyecto, del que dependía mi grupo. Acción: hice una lista de todos los plazos y estimé el tiempo que necesitaba cada tarea. Acordé con mi responsable cambiar un turno a la semana siguiente y avisé con antelación a mi grupo de qué días trabajaría en el proyecto. Estudié en bloques cortos y fijos cada mañana y reservé las tardes para el proyecto. Resultado: entregué mi parte del proyecto un día antes, aprobé los dos exámenes y, en conjunto, no perdí ninguna hora de trabajo.",
    explanation:
      "Los entrevistadores buscan un método: enumerar tareas, estimar el esfuerzo, negociar lo que se puede mover y planificar bloques concretos. Comunicarte pronto con las personas implicadas es una parte clave de la gestión del tiempo.",
    tips: ["Muestra cómo planificaste la semana.", "Menciona lo que negociaste o cambiaste de fecha."],
    commonMistakes: ["Decir simplemente que trabajaste toda la noche.", "Olvidar mencionar cómo protegiste la calidad."],
    followUpQuestions: ["¿Cómo estimas cuánto tiempo llevan las tareas?", "¿Qué pasa cuando tu plan no funciona?"],
  },
  'beh-050': {
    question: "Háblame de una ocasión en la que no cumpliste un plazo.",
    intent: "El entrevistador comprueba tu honestidad, tu sentido de la responsabilidad y lo que aprendiste de la experiencia.",
    expectedAnswer:
      "Situación: era responsable de entregar un informe mensual de ventas a nuestros responsables regionales antes del quinto día laborable. Tarea: un mes, los datos de una nueva región llegaron en otro formato y subestimé el tiempo necesario para limpiarlos. Acción: cuando el cuarto día me di cuenta de que iba a retrasarme, avisé de inmediato a los responsables, les envié un informe parcial con las regiones que ya estaban listas y les di una nueva fecha precisa. Después creé una plantilla para la nueva región y acordé con su equipo un formato estándar. Resultado: entregué el informe completo con un día de retraso y, desde entonces, el informe siempre ha llegado a tiempo, incluso con dos regiones más que se incorporaron después.",
    explanation:
      "Todo el mundo incumple algún plazo alguna vez. Los entrevistadores quieren ver que avisaste pronto, limitaste el impacto y corregiste la causa para que no volviera a ocurrir.",
    tips: ["Elige un ejemplo real con consecuencias limitadas.", "Muestra que avisaste antes de que venciera el plazo.", "Explica el cambio que evitó que se repitiera."],
    commonMistakes: ["Decir que nunca has incumplido un plazo.", "Culpar a otras personas del retraso."],
    followUpQuestions: ["¿En qué momento decides avisar de un retraso?", "¿Cómo reaccionaron los responsables?"],
  },
  'beh-051': {
    question: "Háblame de una ocasión en la que todo parecía urgente. ¿Cómo priorizaste?",
    intent: "El entrevistador quiere ver qué criterios usas para priorizar y cómo gestionas demandas que compiten entre sí.",
    expectedAnswer:
      "Situación: un lunes por la mañana, trabajando en soporte informático, tenía una impresora averiada en el departamento de finanzas, una nueva empleada sin acceso a sus cuentas y un responsable que pedía la instalación de un programa. Tarea: las tres personas decían que su petición era urgente. Acción: evalué rápidamente el impacto de cada una: la nueva empleada no podía trabajar en absoluto, finanzas tenía una segunda impresora en otra planta y la instalación podía esperar hasta la tarde. Primero creé las cuentas de la empleada, envié un mensaje a finanzas indicándoles la otra impresora y le dije al responsable cuándo pasaría. Resultado: la nueva empleada estaba trabajando en treinta minutos, la impresora quedó arreglada antes del mediodía y la instalación se hizo esa misma tarde sin ninguna queja.",
    explanation:
      "Una buena priorización se basa en criterios explícitos, como el impacto en el negocio, el número de personas afectadas y las alternativas disponibles. Decirle a cada persona cuándo la atenderás gestiona las expectativas y reduce la presión.",
    tips: ["Indica los criterios que utilizaste.", "Muestra cómo te comunicaste con quienes tuvieron que esperar."],
    commonMistakes: ["Atender las peticiones por orden de llegada sin pensar.", "Dar prioridad a quien más gritaba."],
    followUpQuestions: ["¿Y si dos directivos te lo hubieran pedido a la vez?", "¿Usas alguna herramienta para gestionar prioridades?"],
  },
  'beh-052': {
    question: "Háblame de una ocasión en la que mejoraste tu forma de trabajar o la de tu equipo.",
    intent: "El entrevistador busca iniciativa y mejora continua: detectar lo que se desperdicia y corregirlo.",
    expectedAnswer:
      "Situación: en nuestro equipo de contabilidad, cada factura requería una aprobación por correo electrónico y dedicábamos horas cada semana a perseguir respuestas. Tarea: quería reducir ese tiempo sin cambiar quién aprobaba qué. Acción: medí durante un mes cuánto tardaban las aprobaciones: cuatro días de media. Propuse usar la función de aprobación que ya incluía nuestro programa de contabilidad y la probé con un departamento. Redacté una guía de una página y enseñé a los responsables a aprobar desde el móvil. Resultado: el tiempo medio de aprobación bajó a un día y el equipo se ahorró unas cinco horas semanales de correos de seguimiento.",
    explanation:
      "Las historias de mejora son más sólidas con una medición de partida, una prueba pequeña y un resultado medido. Usar herramientas que ya existen también demuestra buen criterio sobre el coste y la adopción.",
    tips: ["Mide la situación antes y después.", "Empieza con una prueba pequeña."],
    commonMistakes: ["Describir una mejora que nadie adoptó.", "Cambiar procesos sin implicar a las personas afectadas."],
    followUpQuestions: ["¿Cómo convenciste a los responsables?", "¿Qué otras mejoras te gustaría introducir?"],
  },
  'beh-053': {
    question: "Háblame de un proyecto largo que gestionaste. ¿Cómo lograste que no se desviara?",
    intent: "El entrevistador quiere evaluar tu planificación, el seguimiento de hitos y cómo gestionas las desviaciones a lo largo de muchos meses.",
    expectedAnswer:
      "Situación: coordiné el traslado de los 120 empleados de nuestra empresa a una nueva oficina, un proyecto de nueve meses en el que participaban el propietario del edificio, el equipo de informática, los proveedores de mobiliario y todos los departamentos. Tarea: la mudanza tenía que hacerse en un solo fin de semana para no detener la actividad. Acción: planifiqué hacia atrás desde la fecha de la mudanza para definir hitos mensuales y responsables, con un plan compartido sencillo que revisaba cada dos semanas con cada proveedor. Hice seguimiento de una lista corta de riesgos principales, como retrasos en la instalación de la red, y acordé una fecha límite de decisión para cada uno. Cuando en el sexto mes el instalador de la red anunció un retraso de tres semanas, nuestro plan ya incluía un margen, y negocié trabajo en fin de semana a cambio de adelantar su fecha de pago. Resultado: la mudanza se hizo el fin de semana previsto, todo el personal pudo trabajar el lunes por la mañana y el proyecto terminó un 4 % por debajo del presupuesto.",
    explanation:
      "Los proyectos largos necesitan hitos, responsables claros, revisiones periódicas y una gestión activa de los riesgos. Prever márgenes y fechas límite de decisión con antelación es lo que evita que los retrasos se conviertan en fracasos.",
    tips: ["Describe el método de planificación y el ritmo de revisión.", "Muestra un problema real y cómo lo absorbió tu plan.", "Termina con resultados de plazo, presupuesto y calidad."],
    commonMistakes: ["Enumerar tareas sin explicar cómo seguiste el avance.", "Afirmar que no salió nada mal."],
    followUpQuestions: ["¿Cómo mantuviste implicadas a las partes interesadas durante nueve meses?", "¿Qué planificarías de otra manera?"],
  },
  'beh-054': {
    question: "Háblame de una ocasión en la que las interrupciones constantes ponían en riesgo tu trabajo. ¿Qué hiciste?",
    intent: "El entrevistador quiere ver cómo proteges el trabajo que exige concentración sin dejar de estar disponible para los demás.",
    expectedAnswer:
      "Situación: era la única persona de mi equipo que conocía nuestra herramienta de reporting, así que mis compañeros me hacían preguntas todo el día y me estaba retrasando con mi propio análisis. Tarea: necesitaba tiempo para concentrarme sin dejar bloqueados a mis compañeros. Acción: anoté durante una semana las preguntas que recibía y descubrí que la mayoría eran las mismas cinco. Redacté unas preguntas frecuentes breves y las compartí con el equipo; después fijé dos «franjas para preguntas» al día, a las 11:00 y a las 16:00, salvo emergencias reales. Resultado: las interrupciones se redujeron a menos de la mitad, entregué mi análisis a tiempo y dos compañeros empezaron a responder ellos mismos las preguntas sencillas con ayuda de las preguntas frecuentes.",
    explanation:
      "Esta respuesta muestra un análisis del problema, una solución que reduce la demanda y reglas claras que siguen siendo útiles para los demás. Los entrevistadores valoran las soluciones que mejoran al equipo, no solo tu comodidad.",
    tips: ["Explica cómo entendiste el origen de las interrupciones.", "Muestra que tus compañeros siguieron teniendo apoyo."],
    commonMistakes: ["Ignorar sin más los mensajes.", "Quejarte de tus compañeros."],
    followUpQuestions: ["¿Cómo gestionas las peticiones urgentes durante tu tiempo de concentración?", "¿Cómo reaccionaron tus compañeros a la nueva regla?"],
  },
  'beh-055': {
    question: "Háblame de una ocasión en la que negociaste un plazo.",
    intent: "El entrevistador comprueba si sabes rebatir plazos poco realistas con pruebas y alternativas.",
    expectedAnswer:
      "Situación: un cliente pidió a nuestra agencia rediseñar por completo su sitio web en tres semanas para una feria comercial. Tarea: como jefe de proyecto, sabía que nuestro equipo necesitaba al menos seis semanas para el sitio completo. Acción: en lugar de decir que no, pregunté qué necesitaban sí o sí para la feria. La respuesta fue una nueva página de inicio, un catálogo de productos y un formulario de contacto. Le mostré al cliente un desglose del trabajo y le propuse entregar esos tres elementos en tres semanas y el resto del sitio tres semanas después de la feria. Resultado: el cliente aceptó, las páginas esenciales estaban publicadas un día antes de la feria y el sitio completo se entregó en la segunda fecha.",
    explanation:
      "Negociar un plazo funciona mejor cuando entiendes la necesidad real, muestras el trabajo que implica y ofreces una solución por fases. Así una negativa se convierte en una colaboración.",
    tips: ["Muestra las pruebas que utilizaste.", "Ofrece lo que sí se puede entregar a tiempo."],
    commonMistakes: ["Aceptar un plazo imposible y no cumplirlo.", "Negarte sin ofrecer una alternativa."],
    followUpQuestions: ["¿Y si el cliente hubiera rechazado el enfoque por fases?", "¿Cómo elaboras estimaciones que puedas defender?"],
  },
  'beh-056': {
    question: "Háblame de una ocasión en la que tuviste que equilibrar rapidez y calidad.",
    intent: "El entrevistador quiere ver tu criterio sobre qué concesiones son aceptables y cómo limitas los riesgos de ir más rápido.",
    expectedAnswer:
      "Situación: un competidor lanzó una funcionalidad parecida a la nuestra y la dirección quería publicar nuestra nueva versión dos semanas antes de lo previsto. Tarea: como responsable del proyecto, tenía que decidir qué podíamos recortar sin poner en riesgo a los clientes. Acción: clasifiqué el trabajo pendiente en tres grupos: lo que afectaba a datos o pagos, lo que afectaba al recorrido principal del usuario y lo puramente estético. Mantuvimos las pruebas completas para el primer grupo, limitamos las pruebas a los escenarios principales en el segundo y aplazamos la mayor parte del trabajo estético. Documenté los elementos aplazados en una lista con responsables y fechas, expliqué por escrito a la dirección los riesgos restantes y añadí una monitorización reforzada durante la primera semana. Resultado: publicamos con diez días de adelanto sin incidentes críticos, dos errores menores de visualización se corrigieron la semana siguiente y todos los elementos aplazados se completaron en un mes.",
    explanation:
      "Los perfiles avanzados no eligen entre rapidez y calidad en abstracto. Separan los riesgos por gravedad, protegen lo que no puede fallar, documentan las concesiones y vigilan de cerca. La clave es que las concesiones sean explícitas y reversibles.",
    tips: ["Explica cómo clasificaste los riesgos.", "Muestra cómo documentaste las concesiones y cómo las saldaste después.", "Menciona la monitorización posterior al lanzamiento."],
    commonMistakes: ["Recortar calidad en todas partes para cumplir la fecha.", "Negarte a cualquier concesión cuando la necesidad del negocio es real."],
    followUpQuestions: ["¿Qué no recortarías nunca, ni siquiera bajo presión?", "¿Cómo te aseguraste de que el trabajo aplazado se hiciera de verdad?"],
  },
  'beh-057': {
    question: "Háblame de una decisión difícil que tuviste que tomar.",
    intent: "El entrevistador quiere ver cómo sopesas las opciones y asumes la responsabilidad de una elección.",
    expectedAnswer:
      "Situación: me ofrecieron un puesto a jornada completa en la empresa donde hice las prácticas, pero también me habían admitido en un máster de un año en el extranjero. Tarea: tenía que decidir en dos semanas. Acción: enumeré lo que me aportaría cada opción en competencias, red de contactos y objetivos a largo plazo. Hablé con dos personas que habían seguido cada camino y pregunté a mi responsable de prácticas si sería posible volver más adelante. Me dijo que la puerta seguiría abierta. Elegí el máster porque encajaba con mi objetivo de trabajar en proyectos internacionales. Resultado: terminé el máster y las competencias que adquirí, sobre todo trabajar en equipos multiculturales, son directamente útiles para el puesto al que me presento hoy.",
    explanation:
      "Los entrevistadores buscan un proceso reflexivo: criterios claros, consejo de otras personas, valoración de los riesgos y responsabilidad sobre la decisión final. Las decisiones profesionales personales son ejemplos válidos para perfiles al inicio de su carrera.",
    tips: ["Explica tus criterios.", "Muestra a quién consultaste.", "Relaciona la decisión con tu presente."],
    commonMistakes: ["Elegir una decisión sin un dilema real.", "Dejar que otra persona decida por ti."],
    followUpQuestions: ["¿Te arrepientes de algo de esa elección?", "¿Cómo tomas decisiones cuando tus criterios entran en conflicto?"],
  },
  'beh-058': {
    question: "Háblame de una ocasión en la que tomaste una decisión sin tener toda la información.",
    intent: "El entrevistador evalúa tu criterio en situaciones de incertidumbre y cómo limitas las consecuencias de un posible error.",
    expectedAnswer:
      "Situación: durante un corte de luz regional, la responsable de nuestro centro de llamadas no estaba localizable y yo era el agente con más antigüedad de turno. Tarea: tenía que decidir rápidamente si desviar las llamadas a nuestra otra oficina, lo que costaría dinero y alteraría su planificación. Acción: comprobé lo que pude: la compañía eléctrica calculaba al menos tres horas de corte y nuestra cola de llamadas crecía rápido. Decidí desviar las llamadas solo durante dos horas, avisé a la otra oficina y dejé a mi responsable un mensaje por escrito explicando mi razonamiento. Revisé la situación cada treinta minutos. Resultado: la luz volvió a las dos horas y media, los clientes esperaron de media menos de cinco minutos y mi responsable confirmó que habría tomado la misma decisión.",
    explanation:
      "Cuando falta información, los buenos perfiles reúnen rápido lo que pueden, eligen una opción reversible o limitada en el tiempo, documentan su razonamiento y siguen comprobando. Esto demuestra criterio y responsabilidad.",
    tips: ["Explica lo que sabías y lo que no.", "Muestra cómo limitaste el riesgo de equivocarte."],
    commonMistakes: ["Esperar hasta que fue demasiado tarde para decidir.", "Tomar una decisión importante e irreversible sin comprobar nada."],
    followUpQuestions: ["¿Qué habrías hecho si tu decisión hubiera sido errónea?", "¿Cómo documentaste tu razonamiento?"],
  },
  'beh-059': {
    question: "Háblame de una ocasión en la que usaste datos para tomar una decisión.",
    intent: "El entrevistador quiere ver si basas tus decisiones en pruebas y sabes interpretar correctamente los datos.",
    expectedAnswer:
      "Situación: nuestro equipo de comercio electrónico quería ofrecer envío gratuito en todos los pedidos para aumentar las ventas. Tarea: me pidieron evaluar la idea antes de tomar la decisión. Acción: analicé seis meses de pedidos y descubrí que el 70 % ya superaba los 40 euros y que la mayoría de los carritos abandonados estaban entre 25 y 40 euros. Propuse en su lugar el envío gratuito a partir de 40 euros y lo probamos con la mitad de nuestros visitantes durante tres semanas. Resultado: el grupo de prueba hizo un 12 % más de pedidos y tuvo una cesta media más alta, mientras que los costes de envío crecieron mucho menos que con el envío gratuito para todos. El equipo adoptó ese umbral de forma permanente.",
    explanation:
      "Una buena decisión basada en datos parte de la pregunta adecuada, un análisis riguroso e, idealmente, una prueba antes del despliegue completo. Proponer una alternativa más afinada demuestra que los datos guiaron la decisión en lugar de limitarse a confirmar la idea inicial.",
    tips: ["Explica qué datos utilizaste y por qué.", "Menciona cómo validaste la conclusión."],
    commonMistakes: ["Presentar datos que solo confirmaban lo que ya querías.", "Ignorar las limitaciones de los datos."],
    followUpQuestions: ["¿Qué te habría hecho dudar de los datos?", "¿Cómo presentas datos a personas que no son analistas?"],
  },
  'beh-060': {
    question: "Háblame de una decisión que tomaste y que resultó ser equivocada.",
    intent: "El entrevistador comprueba si reconoces rápido tus errores y rectificas sin poner excusas.",
    expectedAnswer:
      "Situación: elegí un proveedor nuevo y más barato para el material de oficina después de comparar precios. Tarea: era responsable de mantener los costes bajos sin alterar el funcionamiento de la oficina. Acción: al cabo de dos meses, las entregas llegaban a menudo tarde y faltaban algunos productos. Analicé qué se me había escapado: solo había comparado precios, no la fiabilidad de las entregas ni las referencias. Informé a mi responsable, negocié la salida del contrato al final del trimestre y volví al proveedor anterior con una tarifa algo mejor gracias al volumen. Resultado: las entregas volvieron a ser fiables, seguimos ahorrando un 5 % respecto al contrato original y ahora incluyo el rendimiento de las entregas y las referencias en cada comparación de proveedores.",
    explanation:
      "Los entrevistadores valoran a quienes asumen sus errores, analizan por qué falló su proceso de decisión y lo mejoran. La lección aprendida es la parte más importante de la respuesta.",
    tips: ["Explica qué falló en tu proceso de decisión.", "Muestra la acción correctiva y lo que cambiaste para el futuro."],
    commonMistakes: ["Elegir un error que en realidad fue culpa de otra persona.", "No explicar lo que aprendiste."],
    followUpQuestions: ["¿Cuánto tardaste en darte cuenta de que era un error?", "¿Cómo reaccionó tu responsable?"],
  },
  'beh-061': {
    question: "Háblame de una ocasión en la que tuviste que tomar una decisión rápida bajo presión.",
    intent: "El entrevistador quiere ver si eres capaz de actuar con rapidez y sensatez sin entrar en pánico.",
    expectedAnswer:
      "Situación: cuando trabajaba como encargado de turno en un restaurante, el lavavajillas se averió un sábado por la noche con mucha afluencia. Tarea: tenía que mantener el servicio sin suficientes platos limpios. Acción: en pocos minutos decidí asignar a un camarero a fregar a mano, retiré temporalmente de la carta dos platos que requerían mucha vajilla e informé a la cocina y al equipo. También llamé al servicio técnico para la mañana siguiente. Resultado: atendimos todas las mesas esa noche con solo pequeños retrasos, y el gerente conservó mi carta provisional como plan de contingencia para futuras averías.",
    explanation:
      "Las decisiones rápidas consisten en proteger el objetivo principal, usar los recursos disponibles y comunicar con claridad. Mostrar que también te ocupaste del seguimiento demuestra responsabilidad.",
    tips: ["Explica tu razonamiento en pocas palabras.", "Muestra cómo comunicaste la decisión."],
    commonMistakes: ["Describir una decisión tomada sin pensar en absoluto.", "Olvidar las acciones de seguimiento."],
    followUpQuestions: ["¿Cómo mantienes la calma cuando tienes que decidir rápido?", "¿Decidirías de otra manera con más tiempo?"],
  },
  'beh-062': {
    question: "Háblame de una ocasión en la que te enfrentaste a un dilema ético en el trabajo.",
    intent: "El entrevistador evalúa tu integridad, tu criterio y tu valentía cuando lo correcto no es lo más fácil.",
    expectedAnswer:
      "Situación: mientras preparaba los resultados trimestrales para una presentación a un cliente, me di cuenta de que un compañero había usado un método de cálculo que hacía que los resultados de nuestra campaña parecieran un 20 % mejores de lo que eran. Tarea: la presentación era a la mañana siguiente, y corregirlo haría que nuestro equipo pareciera menos exitoso. Acción: primero comprobé que lo había entendido bien recalculando las cifras con el método acordado con el cliente. Después hablé en privado con mi compañero, le expliqué lo que había encontrado y le propuse corregir juntos las cifras. Él se mostró reacio, así que esa misma tarde informé a nuestra responsable, planteándolo como un problema de metodología y no como una acusación. Resultado: presentamos las cifras correctas con una explicación clara de lo que había funcionado y lo que no. El cliente valoró la transparencia y renovó el contrato, y nuestro equipo adoptó una revisión cruzada de todas las cifras para clientes.",
    explanation:
      "Los dilemas éticos ponen a prueba si verificas los hechos, planteas tus preocupaciones a las personas adecuadas y actúas aunque resulte incómodo, sin dejar de tratar con justicia a tus compañeros. El proceso importa tanto como el resultado.",
    tips: ["Muestra que comprobaste los hechos antes de actuar.", "Explica cómo trataste con justicia a las personas implicadas.", "Describe el resultado y lo que cambió."],
    commonMistakes: ["Ignorar el problema para evitar conflictos.", "Acusar a alguien públicamente sin comprobarlo."],
    followUpQuestions: ["¿Y si tu responsable te hubiera pedido mantener las cifras originales?", "¿Dónde pones el límite entre un error y una mala conducta?"],
  },
  'beh-063': {
    question: "Háblame de una ocasión en la que tuviste que elegir entre dos buenas opciones.",
    intent: "El entrevistador quiere ver cómo comparas ventajas e inconvenientes y tomas una decisión que los demás puedan entender y apoyar.",
    expectedAnswer:
      "Situación: nuestro equipo de producto tenía presupuesto para un único gran proyecto en el semestre siguiente: una aplicación móvil que pedían muchos clientes o un módulo de informes que pedían nuestros clientes más grandes. Tarea: como product manager, tenía que recomendar uno a la dirección. Acción: comparé ambas opciones según cuatro criterios acordados de antemano con la dirección: ingresos esperados, riesgo de pérdida de clientes, coste de desarrollo y encaje estratégico. Entrevisté a ocho clientes de cada grupo y trabajé con finanzas en las estimaciones de ingresos. El módulo de informes tenía un público más reducido, pero protegía contratos que representaban el 35 % de nuestros ingresos, y dos de esos clientes lo habían mencionado en las negociaciones de renovación. Lo recomendé, junto con una versión web móvil ligera como solución provisional para el resto de clientes. Resultado: la dirección aprobó el plan, los dos clientes en riesgo renovaron y la versión web móvil redujo lo suficiente las peticiones de la aplicación como para aplazar la aplicación nativa un año sin perder clientes.",
    explanation:
      "Cuando las dos opciones son buenas, la decisión depende de criterios explícitos acordados de antemano y de las pruebas. Ofrecer una solución parcial para la opción descartada demuestra pensamiento estratégico y reduce el coste de la elección.",
    tips: ["Acuerda los criterios de decisión antes de comparar.", "Aporta pruebas para cada criterio.", "Muestra cómo redujiste el inconveniente de la opción descartada."],
    commonMistakes: ["Decidir solo por intuición.", "Presentar la decisión como algo obvio."],
    followUpQuestions: ["¿Cómo comunicaste la decisión a los clientes que querían la aplicación?", "¿Qué te habría llevado a elegir la otra opción?"],
  },
  'beh-064': {
    question: "Háblame de una decisión que tomaste y con la que otras personas no estaban de acuerdo.",
    intent: "El entrevistador quiere ver si sabes mantener una decisión razonada mientras escuchas a los demás y cuidas las relaciones.",
    expectedAnswer:
      "Situación: como organizador de la conferencia anual de nuestro departamento, decidí reducir el número de presentaciones de doce a ocho para dejar más tiempo a los talleres. Tarea: varios ponentes acostumbrados a presentar cada año no estaban de acuerdo y se quejaron a nuestra directora. Acción: expliqué mis motivos con los comentarios de la encuesta del año anterior, en la que los asistentes pedían más interacción. Escuché las preocupaciones de los ponentes y ofrecí a quienes no presentaban un espacio en un taller o un vídeo breve que se compartiría antes del evento. Mantuve la decisión, pero adapté la forma de aplicarla. Resultado: la satisfacción de los asistentes subió de 3,6 a 4,4 sobre 5, y dos de los ponentes que se habían quejado dirigieron los talleres más populares.",
    explanation:
      "Mantener una decisión es más fácil con datos claros y cuando escuchas las objeciones y adaptas su aplicación. Esto demuestra convicción sin rigidez.",
    tips: ["Muestra las pruebas en las que se basaba tu decisión.", "Explica cómo atendiste las preocupaciones de los demás."],
    commonMistakes: ["Ignorar las objeciones.", "Cambiar tu decisión solo para evitar el conflicto."],
    followUpQuestions: ["¿En qué caso habrías cambiado tu decisión?", "¿Cómo reaccionó la directora?"],
  },
  'beh-065': {
    question: "Háblame de un error que cometiste en el trabajo.",
    intent: "El entrevistador pone a prueba tu honestidad y responsabilidad: si admites los errores, los corriges y aprendes de ellos.",
    expectedAnswer:
      "Situación: en mi primer mes como asistente administrativo, envié a veinte socios externos una convocatoria de reunión con la fecha equivocada. Tarea: la reunión era importante y varios socios ya habían aceptado. Acción: en cuanto me di cuenta del error, se lo dije a mi responsable, envié a todos los socios una breve corrección con una disculpa y llamé a los tres que ya habían reservado el viaje. Después empecé a usar una lista de comprobación para cada convocatoria externa, que incluía una segunda revisión de fechas y husos horarios. Resultado: todos los socios asistieron en la fecha correcta y no he vuelto a cometer ese tipo de error.",
    explanation:
      "Los entrevistadores quieren ver que reaccionas rápido, asumes la responsabilidad, limitas el impacto y pones en marcha una salvaguarda. Un error pequeño y sincero con una lección clara funciona bien.",
    tips: ["Elige un error real pero manejable.", "Muestra la rapidez de tu reacción.", "Termina con la salvaguarda que pusiste en marcha."],
    commonMistakes: ["Decir que nunca cometes errores.", "Elegir un error que sugiera un descuido grave."],
    followUpQuestions: ["¿Cómo reaccionó tu responsable?", "¿Qué error te da más miedo cometer?"],
  },
  'beh-066': {
    question: "Háblame de una ocasión en la que te hiciste cargo de un problema que no era tuyo.",
    intent: "El entrevistador quiere ver iniciativa y sentido de la responsabilidad más allá de tus funciones oficiales.",
    expectedAnswer:
      "Situación: los clientes llamaban una y otra vez a nuestro equipo de ventas por facturas con errores, aunque la facturación dependía de otro departamento. Tarea: como comercial, podría haberlos redirigido, pero los clientes estaban cada vez más frustrados y algunos amenazaban con irse. Acción: reuní diez ejemplos de facturas incorrectas y vi que todos tenían que ver con descuentos negociados después del pedido. Compartí los ejemplos con la responsable de facturación y le sugerí un formulario sencillo para que ventas enviara los cambios de descuento directamente a facturación. Me ofrecí a probarlo con mis propios clientes durante un mes. Resultado: los errores de facturación en mis cuentas bajaron a cero, el formulario se extendió a todo el equipo de ventas y las quejas por facturas disminuyeron de forma notable.",
    explanation:
      "Responsabilizarse significa actuar ante un problema que afecta al cliente o a la empresa, aunque formalmente no sea tuyo, respetando el papel del otro equipo. Aportar pruebas y una propuesta les facilita aceptar tu ayuda.",
    tips: ["Explica por qué decidiste actuar.", "Muestra cómo trabajaste con el equipo responsable del problema."],
    commonMistakes: ["Asumir el trabajo de otro equipo sin su acuerdo.", "Limitarte a pasar el problema a otra persona."],
    followUpQuestions: ["¿Cómo reaccionó al principio el equipo de facturación?", "¿Cómo evitas extralimitarte?"],
  },
  'beh-067': {
    question: "Háblame de una ocasión en la que fracasaste.",
    intent: "El entrevistador evalúa tu resiliencia y tu capacidad para extraer lecciones reales de un fracaso.",
    expectedAnswer:
      "Situación: me presenté para dirigir un nuevo programa de formación interna y preparé una propuesta para el comité de selección. Tarea: quería demostrar que estaba preparado para asumir más responsabilidad. Acción: centré mi propuesta en los contenidos y los métodos pedagógicos, que conocía bien, pero di muy pocos detalles sobre el presupuesto y sobre cómo mediría los resultados. El comité eligió a otra persona. Pedí que me explicaran los motivos y me dijeron que mi plan era sólido en contenidos, pero poco convincente en los aspectos de gestión. Durante los seis meses siguientes hice un curso breve de presupuestación de proyectos y me ofrecí a gestionar el presupuesto de un evento más pequeño. Resultado: al año siguiente me eligieron para dirigir un nuevo programa de mentoría, y elogiaron mi propuesta por su plan de medición.",
    explanation:
      "Una buena historia de fracaso incluye una decepción real, un análisis sincero de lo que faltó, la opinión de otras personas que buscaste activamente y pasos concretos que condujeron a un éxito posterior.",
    tips: ["Elige un fracaso real, no un éxito disfrazado.", "Muestra cómo buscaste la opinión de los demás.", "Describe qué cambió después."],
    commonMistakes: ["Elegir un fracaso causado solo por otras personas.", "Terminar con el fracaso sin ninguna lección."],
    followUpQuestions: ["¿Cómo te sentiste en ese momento?", "¿Cuál ha sido el fracaso más útil que has tenido?"],
  },
  'beh-068': {
    question: "Háblame de una ocasión en la que tuviste que admitir que te habías equivocado.",
    intent: "El entrevistador quiere ver humildad y honestidad intelectual, sobre todo delante de otras personas.",
    expectedAnswer:
      "Situación: en una reunión de equipo, insistí en que la caída de visitas a nuestro sitio web se debía a un cambio de diseño reciente. Tarea: mi compañera pensaba que se debía a un cambio en el posicionamiento en los buscadores, y teníamos que decidir qué corregir. Acción: propuse revisar los datos antes de decidir. Al analizar las fuentes de tráfico, vi que las visitas desde buscadores habían caído bruscamente mientras que las visitas directas se mantenían estables, así que mi compañera tenía razón. En la siguiente reunión dije claramente que me había equivocado y presenté los datos que respaldaban su explicación. Resultado: nos centramos en el problema de posicionamiento y recuperamos la mayor parte del tráfico en seis semanas. Más tarde, mi compañera me dijo que había valorado cómo lo gestioné.",
    explanation:
      "Admitir que te has equivocado, sobre todo en público, genera confianza. A los entrevistadores les gustan las respuestas en las que los datos zanjaron la cuestión y en las que reconociste la aportación de la otra persona.",
    tips: ["Muestra cómo descubriste que te habías equivocado.", "Explica cómo lo reconociste públicamente."],
    commonMistakes: ["Minimizar tu error.", "Elegir un ejemplo en el que admitirlo no te costó nada."],
    followUpQuestions: ["¿Te cuesta admitir tus errores?", "¿Cómo reaccionas cuando otras personas admiten que se han equivocado?"],
  },
  'beh-069': {
    question: "Háblame de una ocasión en la que fuiste más allá de lo que se esperaba de ti.",
    intent: "El entrevistador busca motivación y sentido de la responsabilidad: un esfuerzo extra que aportó valor real.",
    expectedAnswer:
      "Situación: trabajando como recepcionista de hotel, me di cuenta de que muchos huéspedes extranjeros hacían las mismas preguntas sobre el transporte público y los restaurantes de la zona. Tarea: mi trabajo consistía en responder preguntas en el mostrador, nada más. Acción: por iniciativa propia, creé una guía de una página en tres idiomas con consejos de transporte, un mapa sencillo y restaurantes recomendados cerca del hotel. Pedí la aprobación de mi responsable y la imprimimos para cada habitación. Resultado: las preguntas en el mostrador bajaron de forma notable en las horas de más movimiento, varios huéspedes mencionaron la guía en reseñas positivas en internet y la cadena hotelera la compartió con otros dos establecimientos.",
    explanation:
      "Ir más allá de lo esperado convence más cuando el esfuerzo extra resuelve un problema real y beneficia a los clientes o a la empresa, no cuando se reduce a hacer más horas.",
    tips: ["Muestra el problema que detectaste.", "Explica el valor que generaste para los demás."],
    commonMistakes: ["Confundir «ir más allá» con hacer horas extra.", "Hacer algo que nadie necesitaba."],
    followUpQuestions: ["¿Por qué decidiste hacerlo?", "¿Cómo equilibras las iniciativas extra con tu trabajo principal?"],
  },
  'beh-070': {
    question: "Háblame de una ocasión en la que mantuviste un alto nivel de exigencia aunque nadie lo hubiera notado.",
    intent: "El entrevistador quiere ver un sentido de la responsabilidad propio y atención a la calidad sin control externo.",
    expectedAnswer:
      "Situación: estaba preparando una exportación de datos para un socio y el plazo vencía esa misma tarde. Tarea: el socio solo comprobaba que el archivo se abriera correctamente, así que una exportación rápida habría sido aceptada. Acción: antes de enviarla, hice algunas comprobaciones sencillas: número de registros comparado con nuestra base de datos, campos vacíos y entradas duplicadas. Descubrí que alrededor del 3 % de los registros estaban duplicados por un cambio reciente en el sistema. Corregí la exportación, documenté el problema para mi equipo y envié el archivo dos horas más tarde de lo previsto, avisando antes al socio. Resultado: la facturación mensual del socio, que se basaba en nuestro archivo, fue correcta, y el problema de duplicados se corrigió en origen antes de que afectara a otros informes.",
    explanation:
      "Los entrevistadores buscan personas que revisan su propio trabajo porque les importa el resultado, no por miedo a que las descubran. Detectar y corregir un problema oculto es una prueba sólida de ello.",
    tips: ["Describe las comprobaciones que hiciste.", "Muestra la consecuencia que evitaste."],
    commonMistakes: ["Dar la imagen de un perfeccionista que incumple plazos.", "No explicar por qué importaba el problema."],
    followUpQuestions: ["¿Cómo decides cuántas comprobaciones son suficientes?", "¿Alguna vez has entregado algo de lo que no te sentías orgulloso?"],
  },
  'beh-071': {
    question: "Háblame de una ocasión en la que tuviste que pedir cuentas a un compañero o a un miembro de tu equipo.",
    intent: "El entrevistador evalúa si sabes abordar problemas de rendimiento o de compromiso de forma directa, justa y constructiva.",
    expectedAnswer:
      "Situación: en mi equipo de seis analistas, un compañero con experiencia había incumplido tres semanas seguidas el plazo del informe semanal, y los demás habían empezado a cubrirle. Tarea: como responsable del equipo, tenía que abordarlo antes de que dañara la confianza dentro del equipo. Acción: me reuní con él en privado y describí los hechos sin juzgar: las tres fechas y el impacto en los responsables regionales y en sus compañeros. Le pregunté qué estaba pasando. Me explicó que otro director le había asignado un proyecto urgente y que no se sentía capaz de negarse. Acordamos dos cosas: yo aclararía sus prioridades con el otro director y él me avisaría en cuanto un plazo estuviera en riesgo. Confirmé el acuerdo por escrito y le hice un seguimiento semanal durante un mes. Resultado: sus informes llegaron a tiempo desde la semana siguiente, sus compañeros dejaron de cubrirle y más tarde me agradeció que lo hubiera abordado pronto en lugar de dejar que el problema creciera.",
    explanation:
      "Pedir cuentas a alguien significa exponer hechos e impacto, escuchar para entender las causas, acordar compromisos claros y hacer seguimiento. Abordarlo pronto y en privado protege tanto a la persona como al equipo.",
    tips: ["Describe hechos e impacto, no rasgos de personalidad.", "Muestra que buscaste la causa.", "Menciona el seguimiento."],
    commonMistakes: ["Evitar la conversación durante semanas.", "Recurrir a RR. HH. antes de hablar con la persona."],
    followUpQuestions: ["¿Qué habrías hecho si nada hubiera cambiado?", "¿Cómo das una crítica difícil a alguien con más antigüedad que tú?"],
  },
  'beh-072': {
    question: "Háblame de una ocasión en la que tuviste que explicar un fracaso en público o ante la alta dirección.",
    intent: "El entrevistador quiere ver cómo asumes un fracaso delante de otras personas, comunicas sus causas y recuperas la confianza.",
    expectedAnswer:
      "Situación: una campaña de marketing que yo dirigía envió a 50.000 clientes un correo promocional con un código de descuento incorrecto, lo que provocó quejas y varios cientos de pedidos que no se podían completar. Tarea: tenía que explicar lo ocurrido a nuestro director comercial y proponer una respuesta ese mismo día. Acción: en menos de una hora, mi equipo envió un correo de corrección con un código válido y una pequeña bonificación a modo de disculpa. Después redacté un resumen del incidente de una página: qué había pasado, cuántos clientes se habían visto afectados, el coste estimado y la causa raíz, que fue un cambio de código de última hora que se saltó nuestra prueba habitual. Se lo presenté al director sin culpar a la persona que hizo el cambio, porque el verdadero problema era que nuestro proceso lo permitía. Propuse un envío de prueba obligatorio para cualquier cambio posterior a la aprobación final. Resultado: la mayoría de los clientes afectados usaron el nuevo código y el director aprobó la nueva regla. Al año siguiente enviamos más de ochenta campañas sin ningún incidente similar.",
    explanation:
      "A nivel avanzado, la responsabilidad incluye liderar la respuesta, dar una explicación clara y basada en hechos y centrarse en el proceso en lugar de en las personas. Proponer mejoras sistémicas ayuda a recuperar la confianza.",
    tips: ["Empieza por cómo limitaste los daños.", "Presenta con claridad los hechos, el impacto y la causa raíz.", "Céntrate en cambios de proceso, no en buscar culpables."],
    commonMistakes: ["Culpar al compañero que hizo el cambio.", "Minimizar el impacto delante de la dirección."],
    followUpQuestions: ["¿Cómo apoyaste al compañero que hizo el cambio?", "¿Cómo decides qué contar a los clientes?"],
  },
  'beh-073': {
    question: "Háblame de una ocasión en la que cuestionaste una suposición que todos los demás daban por buena.",
    intent: "El entrevistador quiere ver pensamiento independiente y si compruebas los hechos en lugar de seguir al grupo.",
    expectedAnswer:
      "Situación: nuestro equipo creía que los clientes cancelaban sus suscripciones sobre todo por el precio, y estábamos planificando una campaña de descuentos. Tarea: me pidieron preparar la campaña, pero tenía dudas porque pocos mensajes de cancelación mencionaban el precio. Acción: pedí revisar antes los datos. Analicé seis meses de encuestas de cancelación y tickets de soporte, y descubrí que el motivo más frecuente era la dificultad para usar una funcionalidad clave, mencionada el doble de veces que el precio. Presenté los resultados al equipo con ejemplos y propuse probar un breve tutorial guiado antes de lanzar los descuentos. Resultado: el tutorial redujo las cancelaciones un 15 % en dos meses, más de lo que había logrado el descuento en una prueba anterior, y con un coste mucho menor.",
    explanation:
      "El pensamiento crítico consiste en contrastar las creencias compartidas con las pruebas y luego presentar los resultados de forma constructiva. Proponer una prueba en lugar de simplemente contradecir al equipo hace que el cuestionamiento sea útil.",
    tips: ["Explica qué te hizo dudar de la suposición.", "Muestra las pruebas que reuniste.", "Presenta tu cuestionamiento como una propuesta."],
    commonMistakes: ["Cuestionar por el simple hecho de cuestionar.", "Tener razón, pero presentarlo de una forma que deja en evidencia al equipo."],
    followUpQuestions: ["¿Cómo reaccionó el equipo?", "¿Y si los datos hubieran confirmado la suposición?"],
  },
  'beh-074': {
    question: "Háblame de una ocasión en la que detectaste un fallo en un plan.",
    intent: "El entrevistador comprueba si detectas las debilidades a tiempo y las planteas de forma constructiva.",
    expectedAnswer:
      "Situación: mi responsable presentó un plan para abrir la atención al cliente los sábados pidiendo a cada agente que trabajara un sábado al mes. Tarea: me pidió mi opinión antes de anunciar el plan. Acción: revisé el calendario y vi que, con las vacaciones y los contratos a tiempo parcial, algunos sábados solo habría un agente, lo que no bastaba para el volumen de llamadas previsto. Preparé un calendario sencillo que mostraba las fechas problemáticas y sugerí dos opciones: contratar a una persona a tiempo parcial para los fines de semana o reducir el horario del sábado a la franja de más actividad. Resultado: mi responsable eligió reducir el horario del sábado, el servicio se puso en marcha sin días con falta de personal y los tiempos de espera de los clientes se mantuvieron dentro de nuestro objetivo.",
    explanation:
      "Detectar un fallo solo aporta valor si lo planteas pronto, muestras pruebas y sugieres alternativas. Así la crítica se convierte en ayuda para quien toma la decisión.",
    tips: ["Muestra pruebas concretas del fallo.", "Ofrece al menos una alternativa."],
    commonMistakes: ["Criticar el plan sin aportar una solución.", "Esperar a que el plan fracase para decir algo."],
    followUpQuestions: ["¿Cómo das este tipo de opinión a un responsable?", "¿Y si tu responsable hubiera ignorado tu preocupación?"],
  },
  'beh-075': {
    question: "Háblame de una ocasión en la que tuviste que evaluar información contradictoria.",
    intent: "El entrevistador quiere ver cómo valoras las fuentes, concilias contradicciones y llegas a una conclusión fiable.",
    expectedAnswer:
      "Situación: para un estudio de mercado, recibí dos informes sobre el tamaño del mismo mercado: uno lo estimaba en 200 millones de euros y el otro en 450 millones. Tarea: necesitaba una cifra fiable para nuestro plan de negocio. Acción: comparé cómo se había elaborado cada informe. El primero contaba solo clientes profesionales; el segundo incluía también compradores particulares y usaba datos más antiguos. Revisé las fuentes originales, contacté con una asociación del sector para obtener cifras recientes y elaboré mi propia estimación solo para clientes profesionales, ya que ese era nuestro público objetivo. Resultado: mi estimación fue de 230 millones de euros, cercana al primer informe, y documenté el método en el plan de negocio para que los inversores vieran cómo se había obtenido la cifra. Durante su revisión mencionaron expresamente esa transparencia.",
    explanation:
      "La información contradictoria suele deberse a definiciones o métodos distintos. Comparar metodologías, revisar las fuentes primarias y documentar tu razonamiento son señas de identidad del pensamiento crítico.",
    tips: ["Explica por qué las fuentes no coincidían.", "Muestra cómo elegiste o elaboraste la cifra final.", "Menciona cómo lo documentaste."],
    commonMistakes: ["Elegir la cifra que más te convenía.", "Hacer la media de las dos cifras sin entenderlas."],
    followUpQuestions: ["¿Cómo valoras si una fuente es fiable?", "¿Qué harías si no pudieras resolver la contradicción?"],
  },
  'beh-076': {
    question: "Háblame de una ocasión en la que analizaste información para llegar a una conclusión.",
    intent: "El entrevistador comprueba tu enfoque analítico, incluso ante un problema sencillo.",
    expectedAnswer:
      "Situación: en mi trabajo a tiempo parcial en una librería, la encargada se preguntaba por qué las ventas de los sábados habían bajado durante tres meses. Tarea: me pidió que lo investigara. Acción: comparé las ventas por hora de los últimos seis meses y vi que la caída se producía solo entre las 14:00 y las 16:00. Después comprobé qué había cambiado: un aparcamiento cercano había empezado a cobrar por aparcar por la tarde. Propuse ofrecer una hora de aparcamiento gratuita por compras superiores a cierto importe, en colaboración con el aparcamiento. Resultado: después de lanzar la oferta, las ventas de los sábados por la tarde volvieron a su nivel anterior en un mes.",
    explanation:
      "Esta respuesta muestra un método analítico sencillo pero claro: desglosar los datos, localizar el cambio, buscar una causa externa y probar una solución.",
    tips: ["Explica cómo desglosaste el problema.", "Muestra cómo comprobaste tu conclusión."],
    commonMistakes: ["Dar una conclusión sin explicar el análisis.", "Confundir correlación con causa sin comprobarlo."],
    followUpQuestions: ["¿Cómo supiste que el aparcamiento era la causa real?", "¿Qué herramientas usaste para el análisis?"],
  },
  'beh-077': {
    question: "Háblame de una ocasión en la que cuestionaste una decisión de la alta dirección.",
    intent: "El entrevistador evalúa tu valentía, tu criterio sobre cuándo y cómo cuestionar, y tu respeto por el resultado final.",
    expectedAnswer:
      "Situación: la dirección decidió dejar de dar soporte a una versión antigua de nuestro software en un plazo de tres meses para reducir los costes de mantenimiento. Tarea: como responsable de atención al cliente, vi que alrededor del 15 % de nuestros clientes, entre ellos varios del sector público, no podían actualizar tan rápido por sus normas de contratación. Acción: reuní los datos: número de clientes afectados, sus ingresos y los plazos de preaviso de sus contratos. Pedí una reunión con el director de operaciones, reconocí el problema de costes y propuse una alternativa: un plazo de doce meses para los clientes del sector público con una opción de soporte ampliado de pago, y el plazo original para todos los demás. Resultado: la dirección adoptó un plazo de nueve meses con soporte ampliado de pago. Conservamos a todos los clientes afectados salvo dos, el soporte ampliado cubrió la mayor parte del coste de mantenimiento y evitamos al menos un posible litigio relacionado con los plazos de preaviso.",
    explanation:
      "Cuestionar eficazmente a la dirección exige datos sólidos, reconocer sus objetivos y una alternativa realista. Aceptar un acuerdo final distinto de tu propuesta demuestra que trabajas para la empresa y no para defender tu postura.",
    tips: ["Reconoce el objetivo de la dirección antes de cuestionarlo.", "Aporta datos sobre el impacto y una alternativa.", "Acepta la decisión final con elegancia."],
    commonMistakes: ["Cuestionar en público de una forma que socave a la dirección.", "Quejarte sin proponer una alternativa."],
    followUpQuestions: ["¿Y si la dirección se hubiera negado a cualquier cambio?", "¿Cómo decides que una decisión merece ser cuestionada?"],
  },
  'beh-078': {
    question: "Háblame de una ocasión en la que tuviste que equilibrar los resultados a corto plazo con las consecuencias a largo plazo.",
    intent: "El entrevistador quiere ver pensamiento estratégico: si entiendes los costes ocultos de las victorias rápidas.",
    expectedAnswer:
      "Situación: nuestro equipo de ventas tenía dificultades para alcanzar su objetivo trimestral y un responsable sugirió ofrecer grandes descuentos a los clientes actuales a cambio de una renovación anticipada. Tarea: como analista financiero de apoyo a ventas, me pidieron evaluar la idea. Acción: modelé el impacto. Los descuentos nos ayudarían a alcanzar el objetivo trimestral, pero reducirían los ingresos anuales de esos clientes en torno a un 8 % durante los dos años siguientes, y probablemente los clientes esperarían descuentos similares en el futuro. Propuse otro enfoque: descuentos más pequeños vinculados a compromisos plurianuales, dirigidos solo a los clientes con riesgo de baja según nuestros datos de uso. Presenté ambos escenarios al director comercial con su impacto a dos años. Resultado: el director eligió el enfoque selectivo, alcanzamos el 97 % del objetivo trimestral y los contratos plurianuales aumentaron un 12 % los ingresos asegurados del año siguiente.",
    explanation:
      "El pensamiento crítico avanzado incluye modelar las consecuencias más allá del objetivo inmediato y presentar alternativas que equilibren ambos horizontes. Cuantificar los efectos a largo plazo hace visible la disyuntiva para quienes deciden.",
    tips: ["Cuantifica los efectos a corto y a largo plazo.", "Ofrece una alternativa que sirva a ambos horizontes.", "Deja que quien decide compare los escenarios."],
    commonMistakes: ["Ignorar por completo la presión a corto plazo.", "Presentar el largo plazo solo como un riesgo difuso."],
    followUpQuestions: ["¿Cómo reaccionó el equipo de ventas al alcanzar el 97 % en lugar del 100 %?", "¿Cómo explicas los riesgos a largo plazo a personas presionadas por el corto plazo?"],
  },
  'beh-079': {
    question: "Háblame de una ocasión en la que detectaste un riesgo que a los demás se les había pasado.",
    intent: "El entrevistador comprueba tu atención al detalle y si te atreves a señalar los riesgos.",
    expectedAnswer:
      "Situación: nuestro equipo estaba a punto de firmar un contrato con un nuevo proveedor de almacenamiento en la nube para documentos de clientes. Tarea: me pidieron revisar la parte técnica del contrato, mientras el equipo jurídico revisaba el resto. Acción: al leer el anexo, me di cuenta de que el proveedor podía almacenar las copias de seguridad en cualquier país, mientras que algunos de nuestros clientes exigían que sus datos permanecieran en la Unión Europea. Revisé nuestros contratos con clientes y encontré once con ese requisito. Informé al responsable del proyecto y al equipo jurídico indicando las cláusulas exactas afectadas. Resultado: el proveedor aceptó añadir una cláusula sobre la ubicación de los datos antes de la firma y evitamos incumplir nuestros compromisos con esos clientes.",
    explanation:
      "Esta respuesta muestra una lectura atenta, la comprobación del impacto y una comunicación clara a las personas adecuadas. Los entrevistadores valoran a quienes miran más allá de su tarea concreta cuando hay mucho en juego.",
    tips: ["Explica cómo detectaste el riesgo.", "Muestra cómo comprobaste su impacto real antes de señalarlo."],
    commonMistakes: ["Dar la voz de alarma sin pruebas.", "Detectar un riesgo y no decírselo a nadie."],
    followUpQuestions: ["¿Por qué crees que a los demás se les pasó?", "¿Cómo decides qué riesgos merece la pena señalar?"],
  },
  'beh-080': {
    question: "Háblame de una ocasión en la que evaluaste una idea o herramienta nueva antes de adoptarla.",
    intent: "El entrevistador quiere ver si evalúas las novedades con objetividad en lugar de adoptarlas o rechazarlas por instinto.",
    expectedAnswer:
      "Situación: mi equipo quería adoptar una nueva herramienta de gestión de proyectos después de que una compañera la viera en una conferencia. Tarea: me pidieron comprobar si de verdad era mejor que nuestra herramienta actual. Acción: enumeré lo que más necesitábamos: seguimiento de tareas, intercambio de archivos e integración con nuestro calendario. Probé la nueva herramienta con dos compañeros en un proyecto pequeño real durante dos semanas y la comparé con la actual en cada punto, incluido el coste. Resultado: la nueva herramienta era mejor para el seguimiento de tareas, pero no se integraba con nuestro calendario, que usábamos a diario. Decidimos quedarnos con nuestra herramienta actual y empezar a usar su tablero de tareas, que la mayor parte del equipo nunca había probado. Eso resolvió el problema principal sin coste adicional.",
    explanation:
      "Evaluar una idea significa definir primero los criterios, probar en condiciones reales y comparar de forma justa. Concluir que no conviene adoptar la herramienta es un resultado perfectamente válido cuando la evaluación lo respalda.",
    tips: ["Define tus criterios antes de probar.", "Prueba en condiciones reales con usuarios reales."],
    commonMistakes: ["Decidir solo por entusiasmo o por costumbre.", "Comparar herramientas sin criterios claros."],
    followUpQuestions: ["¿Cómo reaccionó la compañera que propuso la herramienta?", "¿Cómo te mantienes abierto a nuevas ideas?"],
  },
};
