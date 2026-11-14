import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de RR. HH. y salario 021-040: cambio de carrera, periodos sin empleo, teletrabajo, preguntas que hacer. */
export const esB: TextTable<QuestionText> = {
  'hr-021': {
    question: "¿Cómo se trasladan a este puesto las competencias de tu carrera anterior?",
    intent: "El reclutador quiere que demuestres de forma concreta por qué tu trayectoria es una ventaja y no una carencia.",
    expectedAnswer:
      "En mis ocho años en dirección hotelera gestioné exactamente el tipo de situaciones que afronta un customer success manager: clientes insatisfechos, problemas urgentes que exigían coordinar a varios equipos y objetivos de satisfacción y fidelización. Por ejemplo, reduje las reseñas negativas en internet un 35 % en un año al implantar un proceso de seguimiento después de cada reclamación. También dirigí un equipo de doce personas, preparé informes mensuales de ocupación e ingresos y formé al personal en un nuevo sistema de reservas. En este puesto aplicaría esas mismas competencias con clientes de software, mientras sigo desarrollando mi conocimiento del producto, algo que ya he empezado con sus cursos de formación en línea.",
    explanation:
      "Traducir la experiencia anterior al lenguaje del nuevo puesto, con resultados concretos, disipa las dudas del reclutador. Reconocer lo que aún estás aprendiendo añade credibilidad.",
    tips: ["Relaciona directamente dos o tres competencias con la descripción del puesto.", "Usa ejemplos medibles de tu carrera anterior.", "Menciona lo que estás aprendiendo."],
    commonMistakes: ["Enumerar «habilidades blandas» genéricas sin ejemplos.", "Usar jerga de tu antiguo sector que el reclutador no entiende."],
    followUpQuestions: ["¿Qué competencia te costará más desarrollar?", "¿Cómo gestionarías tu primera incidencia técnica con un cliente?"],
  },
  'hr-022': {
    question: "No tienes experiencia directa en este campo. ¿Por qué deberíamos contratarte?",
    intent: "El reclutador pone a prueba tu seguridad y tu capacidad de defender tu potencial con pruebas.",
    expectedAnswer:
      "Es cierto que no tengo años de experiencia en este puesto exacto, así que he trabajado para cerrar esa brecha. En el último año obtuve una certificación en gestión de proyectos, he dirigido la migración de los sistemas de nuestra oficina como proyecto paralelo y me ofrecí como voluntario para coordinar la organización de un evento regional con un presupuesto de 40.000, entregado a tiempo. Lo que aporto y quizá otros no es una comprensión de quince años de cómo trabajan realmente los equipos de operaciones, algo útil para un project manager en sus productos de logística. Aprendo rápido y me encantaría acordar objetivos claros para mis tres primeros meses, para que puedan evaluar mi progreso.",
    explanation:
      "Reconocer la carencia con honestidad y luego mostrar preparación, resultados transferibles y una perspectiva propia convierte una debilidad en un argumento equilibrado.",
    tips: ["Reconoce la carencia sin disculparte.", "Muestra los pasos concretos que ya has dado.", "Destaca una perspectiva que solo tú aportas."],
    commonMistakes: ["Fingir una experiencia que no tienes.", "Sonar como si te disculparas o con inseguridad."],
    followUpQuestions: ["¿Qué necesitarías de nosotros para tener éxito?", "¿Cuánto tiempo tardarías en ser plenamente autónomo?"],
  },
  'hr-023': {
    question: "¿Aceptarías un nivel o un salario inferior para cambiar de carrera?",
    intent: "El reclutador quiere conocer tu flexibilidad, tu realismo económico y el riesgo de que te vayas pronto por más dinero.",
    expectedAnswer:
      "Lo pensé detenidamente antes de postularme. Entiendo que pasar a las pruebas de software implica empezar en un nivel junior, y estoy dispuesto a aceptar un salario acorde, dentro de un rango que cubra mis compromisos; para mí, eso es un mínimo de 38.000. A cambio, me gustaría entender cómo funciona la progresión aquí: qué competencias o resultados me permitirían pasar al siguiente nivel y con qué frecuencia se revisan los salarios. Lo veo como una inversión en una carrera a largo plazo, así que un plan de desarrollo claro me importa más que el salario inicial.",
    explanation:
      "Mostrar que aceptas un punto de partida realista mientras preguntas por la progresión demuestra compromiso y reduce el temor del reclutador a que te marches pronto.",
    tips: ["Conoce tu mínimo económico antes de la entrevista.", "Pregunta por la progresión y los ciclos de revisión salarial.", "Presenta la decisión como una inversión a largo plazo."],
    commonMistakes: ["Aceptar cualquier salario sin conocer tu mínimo.", "Esperar el mismo salario que en tu anterior puesto sénior."],
    followUpQuestions: ["¿Cuánto tiempo esperas permanecer en un nivel junior?", "¿Y si la progresión es más lenta de lo que esperas?"],
  },
  'hr-024': {
    question: "¿Por qué quieres pasar de un puesto técnico a la gestión, o al revés?",
    intent: "El reclutador comprueba que el cambio es una decisión meditada y que entiendes lo que implica el nuevo puesto.",
    expectedAnswer:
      "En los últimos dos años como desarrollador sénior, las partes de mi trabajo que más me satisfacían eran acompañar a los compañeros junior, organizar la planificación de nuestros sprints y ayudar a resolver desacuerdos en el equipo. Le pedí a mi responsable que me dejara liderar un pequeño proyecto de cuatro personas, y aprendí que la gestión es otro oficio: menos código y más escucha, planificación y conversaciones difíciles. Lo disfruté, y el proyecto se entregó a tiempo con buenos comentarios del equipo. Ahora busco un puesto de engineering manager en el que mi base técnica me ayude a tomar buenas decisiones con el equipo, asumiendo que programaré mucho menos.",
    explanation:
      "Un cambio convincente entre la vía técnica y la de gestión demuestra experiencia real con las nuevas responsabilidades y una idea clara de lo que se pierde y lo que se gana.",
    tips: ["Aporta pruebas de que ya has probado el nuevo rol.", "Demuestra que entiendes las contrapartidas."],
    commonMistakes: ["Querer gestionar solo por el título o el salario.", "Suponer que la gestión es solo liderazgo técnico."],
    followUpQuestions: ["¿Qué es lo que más echarás de menos de tu puesto anterior?", "¿Cómo gestionarías un conflicto entre dos miembros del equipo?"],
  },
  'hr-025': {
    question: "¿Cómo te has preparado para este cambio de carrera?",
    intent: "El reclutador quiere pruebas de compromiso y de una preparación realista.",
    expectedAnswer:
      "Empecé hablando con cinco personas que ya trabajaban como diseñadores UX para entender el día a día del oficio. Después completé un curso de UX de seis meses con un proyecto de portafolio y, como voluntario, rediseñé el proceso de reservas de un club deportivo local, lo que aumentó las reservas en línea un 20 %. Leo con regularidad sobre investigación de diseño y asisto cada mes a un encuentro local de diseñadores. También ajusté mis finanzas para poder aceptar un salario junior durante la transición.",
    explanation:
      "Una preparación concreta, con conversaciones, formación, proyectos reales y una planificación práctica, demuestra que el cambio es serio y está bien pensado.",
    tips: ["Menciona la formación, los proyectos y las conversaciones con profesionales.", "Muestra resultados prácticos."],
    commonMistakes: ["Enumerar solo cursos sin haberlos aplicado.", "No tener portafolio ni pruebas de práctica."],
    followUpQuestions: ["¿Qué fue lo más útil que aprendiste?", "¿Qué comentarios recibiste sobre tus proyectos?"],
  },
  'hr-026': {
    question: "¿Puedes explicar este vacío en tu CV?",
    intent: "El reclutador quiere una explicación serena y honesta, y la tranquilidad de que estás listo para trabajar ahora.",
    expectedAnswer:
      "Sí. De marzo a octubre del año pasado me tomé un tiempo para cuidar de un familiar enfermo. Esa situación ya está resuelta y tengo plena disponibilidad. Durante ese periodo mantuve mis competencias al día: obtuve una certificación en línea de software de contabilidad y seguí los cambios de la normativa fiscal relevantes para mi campo. Tengo muchas ganas de volver a trabajar, y este puesto encaja muy bien con mi experiencia.",
    explanation:
      "Los periodos sin empleo son habituales. Una explicación breve y honesta, sin detalles innecesarios, seguida de lo que hiciste para mantenerte al día y de tu disponibilidad actual, suele ser suficiente.",
    tips: ["Mantén la explicación breve y basada en hechos.", "Menciona lo que hiciste para mantenerte al día.", "Termina con tu disponibilidad y tu motivación."],
    commonMistakes: ["Ocultar el vacío con fechas falsas.", "Dar largos detalles personales.", "Sonar como si te disculparas."],
    followUpQuestions: ["¿Tienes plena disponibilidad ahora?", "¿Qué aprendiste durante ese periodo?"],
  },
  'hr-027': {
    question: "Te despidieron de tu último trabajo. ¿Qué pasó?",
    intent: "El reclutador quiere saber si la salida estuvo relacionada con tu desempeño y cómo hablas de situaciones difíciles.",
    expectedAnswer:
      "Mi empresa perdió a su principal cliente el año pasado y tuvo que reducir un 30 % de la plantilla, incluido todo el equipo de marketing al que pertenecía. Fue un despido por reestructuración, una decisión de negocio no relacionada con el desempeño individual; mi responsable me escribió una carta de recomendación que puedo compartir. Desde entonces he aprovechado el tiempo para obtener una certificación en analítica de marketing y trabajar en dos proyectos freelance para pequeñas empresas, lo que me mantuvo activo y amplió mi experiencia.",
    explanation:
      "Los despidos por reestructuración son habituales y no son un fracaso personal. Explicar el contexto empresarial, aportar pruebas si las tienes y mostrar lo que hiciste después es el enfoque profesional.",
    tips: ["Explica brevemente el contexto empresarial.", "Ofrece una referencia o una recomendación si la tienes.", "Muestra lo que has hecho desde entonces."],
    commonMistakes: ["Criticar a tu antiguo empleador.", "Presentar un despido por bajo desempeño como una reestructuración."],
    followUpQuestions: ["¿Podrías haber hecho algo para evitarlo?", "¿Qué aprendiste de la experiencia?"],
  },
  'hr-028': {
    question: "¿Cuánto deberías contar sobre un periodo sin empleo por motivos de salud o personales?",
    intent: "Esta situación pone a prueba tu capacidad de proteger tu privacidad sin dejar de ser honesto y tranquilizador.",
    expectedAnswer:
      "Puedes mantenerlo breve y privado: «Me tomé un año por motivos personales de salud. Eso ya está totalmente superado y estoy listo para comprometerme con un puesto a tiempo completo». No estás obligado a dar detalles médicos, y en muchos países los empleadores no pueden preguntar por tu salud. El objetivo es tranquilizar al reclutador sobre tu disponibilidad actual, no justificar el pasado con detalle. Si necesitas una adaptación concreta en el trabajo, puedes hablarlo cuando te sientas cómodo, a menudo después de la oferta.",
    explanation:
      "Ser honesto no significa contarlo todo. Una frase breve y segura, centrada en el presente, respeta tu privacidad y responde a la verdadera preocupación del reclutador.",
    tips: ["Prepara una o dos frases con las que te sientas cómodo.", "Céntrate en tu disponibilidad actual.", "Ten presente que puedes mantener en privado los detalles médicos."],
    commonMistakes: ["Compartir más detalles personales de los que te resultan cómodos.", "Inventar un empleo para tapar el vacío."],
    followUpQuestions: ["¿Hay algo que pueda afectar a tu disponibilidad?", "¿Cómo te mantuviste en contacto con tu campo?"],
  },
  'hr-029': {
    question: "Llevas más de un año sin trabajar. ¿Cómo te has mantenido al día?",
    intent: "Al reclutador le preocupa que tus competencias estén desactualizadas y quiere pruebas de aprendizaje continuo.",
    expectedAnswer:
      "Sabía que mis competencias podían quedarse desfasadas, así que establecí una rutina. Obtuve dos certificaciones, una en fundamentos de la nube y otra en análisis de datos con SQL, ambas mencionadas en su oferta. Contribuí a un proyecto de código abierto y desarrollé una pequeña aplicación que registra las horas de voluntariado de una asociación local, que ahora la usa cada semana. También asistí a conferencias en línea y mantuve el contacto con antiguos compañeros para seguir cómo evolucionaban las prácticas. Estoy listo para ser productivo rápidamente, y con gusto les enseño la aplicación.",
    explanation:
      "El aprendizaje concreto y los proyectos reales contrarrestan el temor a unas competencias desfasadas. Vincularlos con la descripción del puesto los hace directamente pertinentes.",
    tips: ["Muestra un aprendizaje vinculado a la descripción del puesto.", "Menciona proyectos concretos que puedas enseñar."],
    commonMistakes: ["Decir que esperabas la oportunidad adecuada sin hacer nada.", "Mencionar solo aprendizaje pasivo, como ver vídeos."],
    followUpQuestions: ["¿Qué ha cambiado más en tu campo durante ese tiempo?", "¿Puedes enseñarnos alguno de tus proyectos?"],
  },
  'hr-030': {
    question: "Has cambiado de trabajo varias veces en poco tiempo. ¿Por qué deberíamos esperar que te quedes?",
    intent: "El reclutador teme una permanencia corta y quiere entender los motivos y si se repetirán.",
    expectedAnswer:
      "Entiendo la preocupación. Mirando atrás, mis cambios tuvieron causas distintas: la primera empresa cerró a los ocho meses, el segundo puesto resultó ser sobre todo comercial, que no era lo que me habían descrito, y el tercero era un contrato temporal. He aprendido de ello: ahora investigo a las empresas con mucho más cuidado y hago preguntas detalladas sobre el puesto, por eso antes les pregunté por la hoja de ruta del equipo y por cómo se mide el éxito. Lo que me atrae aquí es un producto a largo plazo y un puesto en el que pueda crecer hacia un rol de liderazgo en los próximos años. Busco estabilidad, y con gusto pueden hablar con mis responsables anteriores.",
    explanation:
      "Explicar cada cambio con hechos, mostrar lo que aprendiste y vincularlo con la forma en que elegiste este puesto responde directamente al riesgo. Ofrecer referencias añade credibilidad.",
    tips: ["Da un motivo breve y objetivo para cada cambio.", "Muestra qué has cambiado en tu forma de elegir empleo.", "Ofrece referencias."],
    commonMistakes: ["Culpar a todos tus antiguos empleadores.", "Prometer quedarte para siempre, lo cual no es creíble."],
    followUpQuestions: ["¿Qué te haría dejar este puesto?", "¿Cómo evalúas una empresa antes de aceptar una oferta?"],
  },
  'hr-031': {
    question: "¿Prefieres el teletrabajo, la oficina o un modelo híbrido?",
    intent: "El reclutador comprueba si tus preferencias encajan con la política de la empresa y si puedes trabajar bien con ella.",
    expectedAnswer:
      "He trabajado en las tres modalidades y soy productivo en todas. Mi preferencia es el modelo híbrido: me gusta ir a la oficina para las sesiones de planificación, los talleres y conocer al equipo, y hago bien mi trabajo de concentración desde casa. Vi que su política es de tres días en la oficina, y eso me encaja. Lo más importante para mí es que el equipo tenga formas claras de comunicarse, trabaje cada uno donde trabaje.",
    explanation:
      "Expresar una preferencia con honestidad, mostrando a la vez adaptabilidad y conocimiento de la política de la empresa, evita desajustes más adelante.",
    tips: ["Consulta la política de la empresa antes de la entrevista.", "Demuestra que puedes trabajar bien en distintas modalidades."],
    commonMistakes: ["Decir que todo te parece bien cuando no es así.", "Exigir teletrabajo total sin consultar la política."],
    followUpQuestions: ["¿Cómo te mantienes conectado con tus compañeros cuando teletrabajas?", "¿Qué necesitas en la oficina para ser productivo?"],
  },
  'hr-032': {
    question: "¿Cómo te mantienes productivo y organizado cuando trabajas desde casa?",
    intent: "El reclutador quiere saber si puedes trabajar con autonomía sin supervisión.",
    expectedAnswer:
      "Mantengo una rutina: empiezo a la misma hora cada día, planifico mis prioridades por la mañana y reservo bloques en el calendario para el trabajo que exige concentración. Tengo un espacio de trabajo dedicado, lo que me ayuda a separar el trabajo de la vida personal. Al final de cada día comparto mis avances en un mensaje breve al equipo, para que todos sepan en qué punto están las cosas sin tener que preguntar. También me aseguro de terminar a una hora razonable y de hacer pausas cortas, lo que me ayuda a mantener la concentración a largo plazo.",
    explanation:
      "Unos hábitos concretos y una comunicación proactiva demuestran que eres fiable sin supervisión.",
    tips: ["Describe tu rutina real.", "Menciona cómo mantienes informado al equipo."],
    commonMistakes: ["Decir simplemente que en casa trabajas más.", "Descuidar la comunicación con el equipo."],
    followUpQuestions: ["¿Cómo gestionas las distracciones en casa?", "¿Cómo evitas trabajar demasiadas horas?"],
  },
  'hr-033': {
    question: "¿Cómo te comunicas y colaboras de forma eficaz en un equipo en remoto?",
    intent: "El reclutador evalúa tu capacidad de evitar malentendidos y aislamiento en el trabajo distribuido.",
    expectedAnswer:
      "Me apoyo sobre todo en una comunicación escrita clara: redacto mensajes que se entienden sin necesidad de reunión, con contexto, una pregunta clara y un plazo, y documento las decisiones en un espacio compartido para que no se pierdan en el chat. Reservo las reuniones para las conversaciones que realmente las necesitan, como decisiones complejas o comentarios difíciles, y en ellas enciendo la cámara. Hago visible mi disponibilidad y respondo dentro de los tiempos que acordamos como equipo. También me esfuerzo por mantener el contacto informal, por ejemplo una charla breve con compañeros cada semana, porque la confianza cuesta más de construir a distancia. Cuando percibo tensión o confusión en los intercambios escritos, propongo una llamada rápida.",
    explanation:
      "La colaboración en remoto depende de escribir bien, documentar, tener una disponibilidad clara y cuidar las relaciones de forma deliberada.",
    tips: ["Menciona la comunicación escrita y la documentación.", "Explica cuándo eliges una llamada en lugar de un mensaje."],
    commonMistakes: ["Depender de muchas reuniones en lugar de escribir con claridad.", "Descuidar el lado informal del trabajo en equipo."],
    followUpQuestions: ["¿Cómo gestionas los desacuerdos en mensajes escritos?", "¿Qué herramientas has usado para el teletrabajo?"],
  },
  'hr-034': {
    question: "El puesto es presencial, pero te gustaría tener algunos días de teletrabajo. ¿Cómo lo pides?",
    intent: "Esta situación pone a prueba tu capacidad de negociación y tu respeto por la política de la empresa.",
    expectedAnswer:
      "Lo pediría cuando ya tenga una oferta, o cuando el reclutador saque el tema de las condiciones de trabajo, no en la primera entrevista. Primero preguntaría por la política y si existen excepciones, y luego haría una petición concreta y razonable, vinculada al trabajo: «Me interesa mucho el puesto. ¿Sería posible teletrabajar los viernes? Ese día me resulta ideal para tareas de concentración, como los informes, y estoy dispuesto a ser totalmente flexible si el equipo me necesita en la oficina». También podría proponer un periodo de prueba, por ejemplo de tres meses, seguido de una revisión. Si la respuesta es no, decidiría si el puesto sigue siendo adecuado para mí en lugar de insistir una y otra vez.",
    explanation:
      "Una petición concreta y centrada en el trabajo, con flexibilidad y un periodo de prueba, es más fácil de aceptar que una exigencia general.",
    tips: ["Elige el momento adecuado del proceso.", "Haz una petición concreta con un motivo vinculado al trabajo.", "Ofrece un periodo de prueba."],
    commonMistakes: ["Plantearlo como condición en la primera entrevista.", "Justificarlo solo por comodidad personal."],
    followUpQuestions: ["¿Qué harías si la respuesta fuera no?", "¿Cómo demostrarías que los días de teletrabajo no afectan a tu trabajo?"],
  },
  'hr-035': {
    question: "Quieres teletrabajar al cien por cien para una empresa con sede en otro país. ¿Qué deberías aclarar?",
    intent: "El reclutador comprueba que entiendes los aspectos prácticos y legales del teletrabajo transfronterizo.",
    expectedAnswer:
      "Primero aclararía el tipo de contrato: si sería empleado a través de una entidad local o de un employer of record, o contratista independiente, porque eso cambia los impuestos, la seguridad social, los beneficios y la protección legal. Confirmaría si la empresa puede contratar legalmente a personas en mi país y quién se encarga de las retenciones y las cotizaciones. Después, los aspectos prácticos: el horario y cuánta coincidencia se espera con la zona horaria del equipo, las vacaciones, la moneda de pago y quién asume el riesgo cambiario, los costes de equipo e internet, y con qué frecuencia se esperan viajes a la oficina o a eventos del equipo y quién los paga. También comprobaría si el salario se ajusta a mi ubicación. Pediría todo esto por escrito y, en el caso de un acuerdo como contratista, quizá consultaría a un contable local.",
    explanation:
      "El teletrabajo transfronterizo plantea cuestiones legales, fiscales y prácticas que varían según el país. Plantearlas pronto evita sorpresas costosas.",
    tips: ["Aclara el tipo de contrato y quién gestiona los impuestos.", "Acuerda la coincidencia horaria y los viajes.", "Pregunta por la remuneración según la ubicación."],
    commonMistakes: ["Aceptar un puesto de contratista creyendo que tiene las mismas protecciones que un empleo.", "Ignorar tus obligaciones fiscales en tu país."],
    followUpQuestions: ["¿Qué es un employer of record?", "¿Cómo gestionarías una gran diferencia horaria?"],
  },
  'hr-036': {
    question: "¿Tienes alguna pregunta para nosotros?",
    intent: "El entrevistador evalúa tu interés, tu preparación y tu espíritu crítico; no tener preguntas puede indicar poca motivación.",
    expectedAnswer:
      "Sí, gracias. Primero, ¿cómo sería el éxito en este puesto al cabo de seis meses? Segundo, ¿cuáles son los mayores retos a los que se enfrenta el equipo ahora mismo? Y por último, ¿cómo apoyan el desarrollo de las personas del equipo, por ejemplo con formación o mentoría? También me interesaría saber qué es lo que más disfruta usted personalmente de trabajar aquí.",
    explanation:
      "Las buenas preguntas muestran un interés genuino y te ayudan a decidir si el puesto es adecuado para ti. Las preguntas sobre el éxito, los retos y el desarrollo son útiles en casi cualquier entrevista.",
    tips: ["Prepara cinco o seis preguntas y elige las mejores según la conversación.", "Pregunta por el puesto y el equipo, no solo por los beneficios."],
    commonMistakes: ["Decir «No, creo que todo está claro».", "Preguntar solo por las vacaciones y el salario en una primera entrevista.", "Hacer preguntas que ya responde el sitio web."],
    followUpQuestions: ["¿Qué pregunta crees que es la más importante para hacerle a un empleador?", "¿Qué te haría rechazar una oferta?"],
  },
  'hr-037': {
    question: "¿Qué preguntas harías para entender mejor el puesto y el equipo?",
    intent: "Esta situación te ayuda a preparar preguntas que revelan el contenido real del trabajo.",
    expectedAnswer:
      "Preguntaría: ¿cómo es una semana típica en este puesto? ¿Cuáles son las prioridades principales para los tres primeros meses? ¿Con quién trabajaría más de cerca y cómo está organizado el equipo? ¿Cómo se toman las decisiones, por ejemplo sobre las prioridades? ¿Qué herramientas y procesos usa el equipo? ¿Por qué está abierta esta vacante: es un puesto nuevo o una sustitución? Estas respuestas me ayudan a entender si el trabajo coincide con la descripción y dónde podría aportar rápidamente.",
    explanation:
      "Las preguntas sobre el día a día, las prioridades y la organización del equipo revelan el trabajo real detrás de la descripción y demuestran que ya te estás proyectando en él.",
    tips: ["Pregunta por el trabajo diario y las primeras prioridades.", "Pregunta por qué está abierta la vacante."],
    commonMistakes: ["Hacer preguntas vagas como «¿Cómo es la cultura?» sin profundizar después."],
    followUpQuestions: ["¿Qué harías si las respuestas contradijeran la descripción del puesto?", "¿Cuántas preguntas son demasiadas?"],
  },
  'hr-038': {
    question: "¿Qué preguntas te ayudan a detectar posibles señales de alerta sobre una empresa o un equipo?",
    intent: "Esta situación te entrena para evaluar a un empleador con espíritu crítico y profesionalidad.",
    expectedAnswer:
      "Haría preguntas abiertas y escucharía cómo se responden. Por ejemplo: ¿cuánto tiempo llevan en la empresa las personas del equipo y por qué se fue la última persona que ocupó este puesto? ¿Cómo gestiona el equipo el trabajo urgente o los plazos ajustados? ¿Puede contarme un desacuerdo reciente en el equipo y cómo se resolvió? ¿Cómo se evalúa el desempeño y con qué frecuencia se reciben comentarios? ¿Qué ha cambiado en el equipo en el último año? Las respuestas vagas, los indicios de una rotación muy alta, las horas extra constantes presentadas como algo normal o las contradicciones entre entrevistadores son señales que exploraría más a fondo, por ejemplo pidiendo hablar con un futuro compañero.",
    explanation:
      "Las entrevistas funcionan en ambos sentidos. Preguntar por la rotación, la carga de trabajo y la resolución de conflictos, y fijarte en las respuestas evasivas, te ayuda a evitar un mal encaje.",
    tips: ["Pregunta por la rotación, la carga de trabajo y los comentarios.", "Fíjate en cómo se responden las preguntas.", "Pide conocer a tus futuros compañeros."],
    commonMistakes: ["Hacer preguntas acusadoras.", "Ignorar las señales de alerta porque quieres el trabajo cuanto antes."],
    followUpQuestions: ["¿Qué harías si detectaras una señal de alerta al final del proceso?", "¿Cómo preguntarías por las horas extra sin parecer poco dispuesto a trabajar?"],
  },
  'hr-039': {
    question: "¿Cómo adaptarías tus preguntas al reclutador, al responsable de contratación o a un alto directivo?",
    intent: "El entrevistador valora tu capacidad de adaptar las preguntas a la perspectiva de cada persona y a su papel en la decisión.",
    expectedAnswer:
      "Al reclutador le preguntaría por el proceso y los aspectos prácticos: los próximos pasos y los plazos, la banda salarial y los beneficios, las condiciones de trabajo y lo que más valora el responsable de contratación. Con el responsable de contratación me centraría en el trabajo en sí: las prioridades y los retos del puesto, cómo se mide el éxito, la forma de trabajar del equipo y cómo le gusta dar feedback. Con un alto directivo preguntaría por la estrategia y el contexto: los principales objetivos de la empresa para los próximos dos años, cómo contribuye este equipo a ellos y los mayores riesgos u oportunidades que ve. Así demuestro que entiendo la perspectiva de cada persona, y la conversación resulta más valiosa para ambas partes.",
    explanation:
      "Cada entrevistador tiene información y prioridades distintas. Unas preguntas adaptadas demuestran visión de negocio y aprovechan mejor cada conversación.",
    tips: ["Prepara preguntas distintas para cada entrevistador.", "Reserva las preguntas estratégicas para los perfiles más sénior."],
    commonMistakes: ["Preguntarle al CEO por la política de vacaciones.", "Hacer las mismas preguntas a todo el mundo."],
    followUpQuestions: ["¿Qué le preguntarías a un futuro compañero de tu mismo nivel?", "¿Cómo haces seguimiento de las respuestas que recibiste?"],
  },
  'hr-040': {
    question: "¿Cómo cierras una entrevista y haces el seguimiento después?",
    intent: "El reclutador observa tu profesionalidad hasta el final del proceso.",
    expectedAnswer:
      "Al final de la entrevista, doy las gracias a los entrevistadores, confirmo brevemente mi interés y pregunto por los próximos pasos y los plazos: «¿Cuáles son los próximos pasos y cuándo puedo esperar noticias suyas?». En las veinticuatro horas siguientes, envío un breve correo de agradecimiento en el que menciono un punto concreto de nuestra conversación y reafirmo mi motivación. Si no he recibido noticias después de la fecha que indicaron, envío un recordatorio cortés unos días más tarde. Evito enviar mensajes repetidos.",
    explanation:
      "Un cierre claro y un seguimiento breve y personalizado dejan una última impresión profesional y te mantienen informado sobre el proceso.",
    tips: ["Pregunta por los próximos pasos antes de irte.", "Envía un mensaje de agradecimiento breve y personalizado."],
    commonMistakes: ["Hacer seguimiento todos los días.", "Enviar un agradecimiento genérico sin ningún detalle personal."],
    followUpQuestions: ["¿Qué deberías escribir en un mensaje de seguimiento?", "¿Cuánto tiempo deberías esperar antes de hacer seguimiento?"],
  },
};
