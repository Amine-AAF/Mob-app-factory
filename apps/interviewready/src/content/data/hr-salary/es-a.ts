import type { QuestionText, TextTable } from '@/types/content';

/**
 * Preguntas de RR. HH. y salario 001-020. Las normas salariales y los plazos de preaviso varían según el país
 * y el contrato: las respuestas son generales e invitan a consultar las normas locales.
 */
export const esA: TextTable<QuestionText> = {
  'hr-001': {
    question: "¿Cuáles son tus expectativas salariales?",
    intent: "El reclutador quiere saber si tus expectativas encajan con el presupuesto del puesto y si tienes una visión realista del mercado.",
    expectedAnswer:
      "Según lo que he investigado sobre puestos similares en esta ciudad y mis cuatro años de experiencia, busco un salario fijo de entre 52.000 y 58.000 al año. Dicho esto, soy flexible en función del paquete de compensación completo, como bonos, teletrabajo y presupuesto de formación, y del alcance del puesto. ¿Podría compartir conmigo el rango que tienen previsto para esta posición?",
    explanation:
      "Dar un rango basado en datos demuestra preparación y profesionalidad, y mencionar el paquete completo y preguntar por su rango mantiene la conversación abierta. Las cifras son solo ilustrativas: usa datos de tu propio mercado.",
    tips: ["Investiga los salarios del mismo puesto, nivel y ubicación antes de la entrevista.", "Da un rango cuyo mínimo aceptarías de verdad.", "Pregunta por el rango presupuestado cuando sea oportuno."],
    commonMistakes: ["Responder « no lo sé » o « lo que ustedes consideren justo ».", "Dar un rango muy por encima del mercado sin justificarlo.", "Empezar el rango por debajo de lo que realmente necesitas."],
    followUpQuestions: ["¿Ese rango es flexible?", "¿Qué parte del paquete es la más importante para ti?"],
  },
  'hr-002': {
    question: "¿Cuál es tu salario actual?",
    intent: "El reclutador busca un punto de referencia para la oferta, lo que puede anclar la negociación en tu sueldo pasado y no en el valor del nuevo puesto.",
    expectedAnswer:
      "Preferiría centrarme en el valor de este puesto más que en mi paquete actual, porque las responsabilidades son bastante distintas. Teniendo en cuenta el alcance que me ha descrito y los datos del mercado, aspiro a un rango de 52.000 a 58.000. Si le sirve de referencia, puedo decirle que mi paquete actual incluye un bono y un presupuesto de formación, que también tendría en cuenta al comparar ofertas.",
    explanation:
      "En algunos países y regiones, las empresas no pueden preguntar por el historial salarial, así que consulta las normas de tu lugar de residencia. Redirigir con cortesía hacia tus expectativas mantiene la conversación en el valor del nuevo puesto. Si decides compartir tu salario, sé honesto y menciona el paquete completo.",
    tips: ["Comprueba si las preguntas sobre historial salarial están permitidas en tu zona.", "Redirige con cortesía hacia tu rango esperado.", "Nunca inventes un salario actual más alto."],
    commonMistakes: ["Mentir sobre tu salario actual.", "Negarte a responder en tono defensivo."],
    followUpQuestions: ["¿Por qué pides más de lo que ganas hoy?", "¿Qué beneficios tienes actualmente?"],
  },
  'hr-003': {
    question: "Un formulario de candidatura en línea exige tu salario esperado antes de cualquier entrevista. ¿Qué pones?",
    intent: "Esta situación evalúa si sabes gestionar las preguntas salariales tempranas sin quedarte fuera del proceso ni infravalorarte.",
    expectedAnswer:
      "Primero investigaría la tarifa de mercado para el puesto y luego pondría un rango realista o, si el formulario solo admite un número, una cifra en la parte media-alta de lo que aceptaría. Si hay un campo de texto libre, escribiría algo como « Abierto a conversar según el paquete completo; el rango de mercado para este puesto es de 50.000 a 58.000 ». Evito poner cero o una cifra poco realista, porque los filtros automáticos podrían descartar mi candidatura.",
    explanation:
      "Los campos salariales tempranos suelen usarse para filtrar candidatos. Un valor realista y fundamentado te mantiene en el proceso y deja margen para negociar más adelante.",
    tips: ["Usa datos salariales de varias fuentes para la ubicación y el nivel concretos.", "Aprovecha los campos de texto libre para mostrar flexibilidad."],
    commonMistakes: ["Poner una cifra muy baja para evitar el filtro.", "Poner 0 o 999999 para saltarte el campo."],
    followUpQuestions: ["¿Puedes negociar por encima de la cifra que indicaste?", "¿Y si la oferta de empleo ya muestra un rango?"],
  },
  'hr-004': {
    question: "¿Cómo has definido tus expectativas salariales?",
    intent: "El reclutador quiere comprobar que tus expectativas se basan en datos y no en deseos.",
    expectedAnswer:
      "Consulté varias fuentes: estudios salariales de agencias de selección de mi sector, rangos publicados en ofertas de empleo para puestos similares en esta ciudad y datos de sitios de comparación salarial. También hablé con dos personas en puestos parecidos. Después ajusté según mi experiencia, cinco años, dos de ellos liderando un equipo pequeño, y según las responsabilidades de su descripción del puesto, como la gestión de la plataforma de datos. Así llegué a un rango de 60.000 a 66.000 de salario fijo.",
    explanation:
      "Explicar tu método hace que tu cifra sea creíble y más difícil de descartar. Combinar datos externos con el alcance concreto del puesto demuestra visión de negocio.",
    tips: ["Cita tipos de fuentes en lugar de un solo sitio web.", "Vincula tu rango con las responsabilidades del puesto."],
    commonMistakes: ["Basar tus expectativas solo en lo que ganan tus amigos.", "Usar datos de otro país o de otro nivel sin ajustarlos."],
    followUpQuestions: ["¿Cómo valoras los beneficios frente al salario fijo?", "¿Qué te haría aceptar la parte baja de tu rango?"],
  },
  'hr-005': {
    question: "Nuestro presupuesto para este puesto es inferior a tus expectativas. ¿Cómo reaccionas?",
    intent: "El reclutador pone a prueba tu flexibilidad, tus prioridades y tu capacidad para negociar de forma constructiva.",
    expectedAnswer:
      "Gracias por su transparencia. El puesto me interesa de verdad, así que me gustaría saber si hay flexibilidad en otras partes del paquete. Por ejemplo, una evaluación de desempeño con ajuste salarial a los seis meses, un bono de incorporación, días adicionales de teletrabajo o un presupuesto de formación podrían cubrir parte de la diferencia. Si el salario fijo realmente no puede moverse, ¿podría indicarme el rango completo del puesto y qué haría falta para llegar a la parte alta? Eso me ayudaría a tomar una decisión.",
    explanation:
      "Mantener una actitud positiva mientras exploras alternativas preserva la relación y a menudo permite encontrar soluciones. Conocer de antemano tu mínimo te permite decidir con calma.",
    tips: ["Ten claro tu punto de retirada antes de la conversación.", "Explora elementos no salariales y revisiones futuras.", "Pide que los compromisos queden por escrito."],
    commonMistakes: ["Aceptar de inmediato por miedo a perder la oferta.", "Reaccionar con frustración."],
    followUpQuestions: ["¿Cuál es el mínimo que aceptarías?", "¿Qué beneficio es el más importante para ti?"],
  },
  'hr-006': {
    question: "Te mudas a otro país por este puesto. ¿Cómo defines tus expectativas salariales?",
    intent: "El reclutador quiere ver si entiendes que la compensación depende del mercado local, el coste de vida, los impuestos y los beneficios.",
    expectedAnswer:
      "No me limito a convertir mi salario actual, porque los mercados, los impuestos y los beneficios son muy diferentes. Investigué el mercado local para este puesto y nivel con estudios salariales y ofertas de empleo de la ciudad, y comparé el salario neto, después de impuestos y cotizaciones sociales, con mi situación actual. También tuve en cuenta el coste de vida, sobre todo el alquiler, y los beneficios habituales aquí, como el seguro médico o las aportaciones a la pensión, que pueden estar incluidos o no. Con todo eso, busco entre 70.000 y 76.000 al año en el mercado local. También me gustaría hablar del apoyo a la reubicación, como los gastos de mudanza, un alojamiento temporal y la ayuda con el visado, algo muy importante en un traslado así.",
    explanation:
      "Una mudanza internacional exige comparar el valor total después de impuestos y coste de vida, no las cifras brutas. El apoyo a la reubicación es una parte legítima y a menudo negociable del paquete.",
    tips: ["Compara el ingreso neto y el coste de vida, no solo el salario bruto.", "Comprueba qué beneficios son habituales en el país.", "Pregunta por el apoyo a la reubicación."],
    commonMistakes: ["Convertir tu salario actual con el tipo de cambio.", "Olvidar los costes de visado, mudanza y vivienda."],
    followUpQuestions: ["¿Aceptarías un contrato local en lugar de un paquete de expatriado?", "¿Cuánto tiempo puedes esperar un visado?"],
  },
  'hr-007': {
    question: "La oferta incluye un bono variable y participación accionarial. ¿Cómo la evalúas?",
    intent: "El reclutador quiere ver si entiendes una compensación compleja y sabes hacer las preguntas adecuadas.",
    expectedAnswer:
      "Separaría lo garantizado de lo condicionado. Sobre el bono, preguntaría cómo se calcula, si depende de objetivos personales, del equipo o de la empresa, y cuánto se pagó realmente en los últimos dos o tres años frente al objetivo. Sobre la participación accionarial, preguntaría de qué tipo es, por ejemplo stock options o acciones restringidas, el número y el porcentaje que representa de la empresa, el calendario de consolidación (vesting) y el cliff, qué ocurre si me voy y, en el caso de las opciones, el precio de ejercicio y sus condiciones. En una start-up privada consideraría la participación como incierta y la valoraría con prudencia, de modo que el salario fijo debe cubrir igualmente mis necesidades. También revisaría el tratamiento fiscal en mi país. Después compararía el total esperado a tres o cuatro años con otras ofertas.",
    explanation:
      "La retribución variable y la participación accionarial pueden ser valiosas, pero también arriesgadas. Hacer preguntas precisas y valorar con prudencia los componentes inciertos lleva a mejores decisiones.",
    tips: ["Pide el histórico de bonos pagados, no solo los objetivos.", "Aclara el vesting, el cliff y las condiciones de salida.", "Revisa el tratamiento fiscal local."],
    commonMistakes: ["Valorar la participación en una start-up como si fuera dinero en efectivo.", "Aceptar un salario fijo bajo por un objetivo de bono elevado."],
    followUpQuestions: ["¿Qué es un cliff de vesting?", "¿Cómo compararías esta oferta con otra que paga más en efectivo?"],
  },
  'hr-008': {
    question: "Nos gustaría hacerte una oferta. ¿Puedes aceptarla hoy?",
    intent: "El reclutador puede estar midiendo tu entusiasmo o intentando cerrar rápido; quiere una respuesta clara y profesional.",
    expectedAnswer:
      "Muchas gracias, me alegra mucho y tengo un gran interés en unirme al equipo. Antes de darle una respuesta definitiva, me gustaría recibir la oferta por escrito para revisar los detalles, incluidos el salario, los beneficios y la fecha de incorporación. ¿Sería posible darle mi respuesta el jueves? Si me surge alguna duda mientras tanto, me pondré en contacto con usted directamente.",
    explanation:
      "Pedir la oferta por escrito y un plazo breve y concreto es normal y se respeta. Te permite revisar los detalles y negociar si hace falta sin parecer indeciso.",
    tips: ["Muestra primero tu entusiasmo.", "Pide la oferta por escrito.", "Propón un plazo preciso y razonable."],
    commonMistakes: ["Aceptar verbalmente antes de ver los detalles.", "Pedir un plazo indefinido."],
    followUpQuestions: ["¿Qué necesitarías para aceptar?", "¿Estás esperando otras ofertas?"],
  },
  'hr-009': {
    question: "¿Cómo negociarías una oferta de trabajo de forma profesional?",
    intent: "Esta pregunta comprueba si sabes defender tus intereses manteniendo una relación positiva con tu futuro empleador.",
    expectedAnswer:
      "Empiezo dando las gracias y confirmando mi interés, para que quede claro que la negociación trata de detalles y no de dudas. Después hago una única petición clara y respaldada por datos: por ejemplo, « Según los datos del mercado para este puesto y mi experiencia con sistemas de pago, que ustedes mencionaron como prioridad, esperaba un salario fijo de 62.000 en lugar de 57.000 ». Me quedo en silencio y dejo que respondan. Si el salario no puede moverse, hablo de alternativas como un bono de incorporación, una revisión salarial anticipada o un presupuesto de formación adicional. Evito hacer muchas peticiones pequeñas en varias rondas y pido el acuerdo final por escrito antes de renunciar a mi trabajo actual.",
    explanation:
      "Una negociación eficaz es cortés, concreta y se basa en el valor y en los datos. Hacer una petición clara y escuchar funciona mejor que las justificaciones largas o los ultimátums.",
    tips: ["Confirma tu interés antes de negociar.", "Haz una petición concreta con una razón.", "Consigue el acuerdo final por escrito."],
    commonMistakes: ["Negociar con pequeñas peticiones repetidas durante varios días.", "Recurrir a amenazas o ultimátums.", "Renunciar antes de recibir la oferta por escrito."],
    followUpQuestions: ["¿Y si se niegan a negociar?", "¿Cuánto por encima de la oferta es razonable pedir?"],
  },
  'hr-010': {
    question: "Además del salario, ¿qué elementos de una oferta negociarías?",
    intent: "El reclutador quiere ver que entiendes el valor total de un paquete y tus propias prioridades.",
    expectedAnswer:
      "El salario importa, pero también el resto del paquete. Según la empresa, me fijaría en la estructura del bono, un bono de incorporación, los días de vacaciones, el teletrabajo o el modelo híbrido, la flexibilidad horaria, un presupuesto para formación y certificaciones, el título del puesto, la fecha de la primera revisión salarial, el equipo de trabajo, el seguro médico y las aportaciones a la pensión, y la fecha de incorporación. En mi caso, un presupuesto de formación claro y dos días de teletrabajo a la semana valen mucho, así que los priorizaría si el rango salarial es fijo.",
    explanation:
      "Muchas empresas tienen más flexibilidad en los beneficios que en el salario fijo. Conocer tus prioridades te permite negociar con eficacia.",
    tips: ["Haz una lista de tus prioridades antes de negociar.", "Pregunta qué es negociable en esta empresa."],
    commonMistakes: ["Negociar únicamente el salario fijo.", "Pedirlo todo a la vez sin prioridades."],
    followUpQuestions: ["¿Qué beneficio es el más importante para ti y por qué?", "¿Aceptarías un salario más bajo a cambio de teletrabajo completo?"],
  },
  'hr-011': {
    question: "Tienes otra oferta. ¿Cómo la mencionas sin que parezca un farol?",
    intent: "El reclutador espera honestidad y profesionalidad cuando existen ofertas competidoras.",
    expectedAnswer:
      "La mencionaría con honestidad y solo si es real: « Quiero ser transparente: he recibido otra oferta con fecha límite el viernes. Su empresa es mi primera opción por el producto y el equipo, pero la otra oferta es aproximadamente un 10% superior en salario fijo. ¿Hay alguna flexibilidad que me ayude a decidirme por ustedes? ». No revelaría detalles confidenciales de la otra empresa ni exageraría las cifras. Si no pueden igualarla, tomaría mi decisión según el encaje global, no solo por el dinero.",
    explanation:
      "Una oferta competidora real es información legítima. Presentarla con transparencia y una preferencia clara anima al empleador a responder sin sentirse manipulado.",
    tips: ["Menciona solo ofertas que existan de verdad.", "Indica tu preferencia y la fecha límite.", "Mantén la confidencialidad de los detalles de la otra empresa."],
    commonMistakes: ["Inventarte una oferta competidora.", "Provocar una subasta entre empresas."],
    followUpQuestions: ["¿Qué harías si igualaran la otra oferta?", "¿Qué te importa más que el salario?"],
  },
  'hr-012': {
    question: "El empleador dice que es su oferta final. ¿Qué haces?",
    intent: "El reclutador quiere ver si eres capaz de tomar una decisión con calma y profesionalidad.",
    expectedAnswer:
      "Lo tomaría al pie de la letra y evaluaría la oferta tal como está frente a mis prioridades y mi mínimo. Si cubre mis necesidades, aceptaría con agradecimiento y quizá haría una pequeña pregunta no salarial, como confirmar la fecha de la primera evaluación de desempeño. Si no las cubre, les daría las gracias y la rechazaría con cortesía, explicando que el paquete no se ajusta a mis requisitos en este momento, y dejaría la puerta abierta: « He disfrutado mucho conociendo al equipo y me encantaría seguir en contacto ». No seguiría insistiendo después de una respuesta final clara, porque eso daña la relación.",
    explanation:
      "Respetar una oferta final demuestra madurez. Decidir en función de un mínimo definido de antemano evita las decisiones emocionales.",
    tips: ["Define tu mínimo antes de negociar.", "Acepta o rechaza con claridad y cortesía."],
    commonMistakes: ["Seguir negociando después de una oferta final.", "Aceptar una oferta que luego te generará resentimiento."],
    followUpQuestions: ["¿Qué te haría rechazar una oferta que te gusta?", "¿Cómo rechazas una oferta sin cerrar puertas?"],
  },
  'hr-013': {
    question: "¿Cómo le pedirías un aumento a tu empleador actual?",
    intent: "El entrevistador evalúa tu capacidad para construir un argumento de negocio y negociar con un responsable con el que seguirás trabajando.",
    expectedAnswer:
      "Prepararía un argumento basado en el valor aportado y en los datos del mercado, no en necesidades personales. Primero, haría una lista de mis resultados del último año con cifras, por ejemplo haber liderado la migración que redujo los costes de infraestructura un 20%, y de las nuevas responsabilidades que asumí, como ser mentor de dos nuevas incorporaciones. Segundo, investigaría la tarifa de mercado para mi puesto y responsabilidades. Después pediría a mi responsable una reunión específica, idealmente antes de que se decidan los presupuestos, en lugar de sacar el tema en un pasillo. En la reunión presentaría mis resultados y los datos del mercado, y haría una petición concreta: « Me gustaría que mi salario pasara a 64.000 para reflejar mi alcance actual ». Si la respuesta es que no por ahora, preguntaría qué resultados lo justificarían, acordaríamos una fecha para revisarlo y confirmaría ese plan por escrito. Evitaría amenazar con irme a menos que esté realmente dispuesto a hacerlo.",
    explanation:
      "Pedir un aumento es presentar un argumento de negocio. El momento adecuado, las pruebas y un camino claro si la respuesta es negativa aumentan las probabilidades de éxito y preservan la relación.",
    tips: ["Prepara resultados cuantificados y datos del mercado.", "Haz la petición en función de los ciclos de presupuesto.", "Acuerda los próximos pasos si la respuesta es no."],
    commonMistakes: ["Pedirlo por gastos personales en lugar de por el valor aportado.", "Usar una oferta competidora como amenaza sin estar dispuesto a irte."],
    followUpQuestions: ["¿Y si tu responsable dice que no hay presupuesto?", "¿Con qué frecuencia es razonable pedir un aumento?"],
  },
  'hr-014': {
    question: "¿Cómo aceptas o rechazas una oferta de trabajo de forma profesional?",
    intent: "El reclutador quiere ver una comunicación profesional al final del proceso, algo que influye en tu reputación.",
    expectedAnswer:
      "Para aceptar, respondería rápido, daría las gracias, confirmaría las condiciones clave como el salario, el título y la fecha de incorporación, y preguntaría por los siguientes pasos, como el contrato y la incorporación. Esperaría a tener el contrato firmado antes de renunciar a mi trabajo actual. Para rechazar, llamaría o escribiría poco después de decidirlo, agradecería al reclutador y al equipo su tiempo, daría un motivo breve y honesto sin críticas, por ejemplo que he aceptado un puesto más alineado con mis objetivos a largo plazo, y diría que me encantaría seguir en contacto. Los reclutadores recuerdan a los candidatos que rechazan con elegancia.",
    explanation:
      "Una comunicación clara, rápida y cortés protege tu reputación en un mundo profesional pequeño y mantiene abiertas futuras oportunidades.",
    tips: ["Confirma por escrito las condiciones clave al aceptar.", "Rechaza con rapidez y con un motivo breve."],
    commonMistakes: ["Ignorar al reclutador en lugar de rechazar la oferta.", "Renunciar antes de firmar el contrato."],
    followUpQuestions: ["¿Qué harías si recibieras una oferta mejor después de aceptar?", "¿Cuánto tiempo deberías tardar en responder a una oferta?"],
  },
  'hr-015': {
    question: "¿Cuál es tu plazo de preaviso?",
    intent: "El reclutador necesita planificar tu fecha de incorporación y comprobar que encaja con las necesidades del equipo.",
    expectedAnswer:
      "Mi contrato establece un preaviso de dos meses. Quiero dejar a mi equipo actual en buena situación, así que aprovecharía ese tiempo para traspasar bien mis proyectos. Si para ustedes es importante una incorporación anticipada, puedo preguntar a mi empleador si es posible acortar parte del preaviso, pero no puedo prometerlo, ya que depende de él.",
    explanation:
      "Ser claro y honesto sobre tu preaviso genera confianza. Los plazos de preaviso dependen del país, del contrato y a veces de la antigüedad, así que revisa tu propio contrato antes de la entrevista.",
    tips: ["Revisa tu contrato y las normas locales antes de la entrevista.", "Demuestra que harás un traspaso responsable de tu trabajo."],
    commonMistakes: ["Reducir tu preaviso para parecer más atractivo.", "Prometer que te irás de inmediato sin revisar tu contrato."],
    followUpQuestions: ["¿Podrías empezar antes?", "¿Tienes vacaciones planificadas?"],
  },
  'hr-016': {
    question: "¿Cuándo podrías empezar?",
    intent: "El reclutador quiere una fecha de incorporación realista para planificar tu integración.",
    expectedAnswer:
      "Si recibo el contrato firmado antes de que termine este mes, podría empezar el uno de marzo, después de mi mes de preaviso. También tengo una semana de vacaciones en abril que reservé con antelación; me gustaría mantenerla, pero estoy dispuesto a hablarlo si supone un problema para el equipo.",
    explanation:
      "Una fecha de incorporación precisa con sus condiciones, junto con transparencia sobre las ausencias previstas, evita malentendidos más adelante.",
    tips: ["Calcula la fecha a partir de tu plazo de preaviso.", "Menciona pronto las vacaciones planificadas."],
    commonMistakes: ["Dar una respuesta vaga como « pronto ».", "Ocultar las vacaciones planificadas hasta después de firmar."],
    followUpQuestions: ["¿Esa fecha es flexible?", "¿Estarías disponible para una breve llamada de bienvenida antes de empezar?"],
  },
  'hr-017': {
    question: "Necesitamos que empieces antes de que termine tu preaviso. ¿Es posible?",
    intent: "El reclutador pone a prueba tu profesionalidad y tu integridad bajo presión.",
    expectedAnswer:
      "Entiendo que los plazos son importantes para ustedes. Me comprometo a respetar mi contrato y a dejar a mi equipo actual en buenas condiciones, así que no puedo irme antes sin más. Lo que sí puedo hacer es preguntar a mi empleador si aceptaría acortar el preaviso una vez completado el traspaso, y podría usar al final algunos días de vacaciones pendientes. Les comunicaré su respuesta en unos días. Mientras tanto, si les resulta útil, con gusto leería documentación o asistiría a una sesión de presentación fuera del horario laboral.",
    explanation:
      "Las empresas valoran a los candidatos que respetan sus compromisos, porque harán lo mismo con ellas. Proponer opciones legítimas demuestra buena voluntad.",
    tips: ["Explica que respetas tu contrato.", "Ofrece alternativas legítimas, como negociar con tu empleador."],
    commonMistakes: ["Aceptar incumplir tu contrato.", "Negarte sin ofrecer ninguna solución."],
    followUpQuestions: ["¿Y si tu empleador se niega?", "¿Te incorporarías a tiempo parcial antes de tu inicio oficial?"],
  },
  'hr-018': {
    question: "¿Qué harías si tu empleador actual te hiciera una contraoferta?",
    intent: "El reclutador quiere saber hasta qué punto estás comprometido y si podrías retirarte después de aceptar.",
    expectedAnswer:
      "La consideraría con atención, pero mi decisión de cambiar no tiene que ver principalmente con el dinero. Me presento a este puesto porque quiero trabajar en desarrollo de producto, algo que mi puesto actual no me ofrece. Por eso, a menos que una contraoferta cambiara el propio puesto, lo más probable es que la rechazara. También sería honesto con ustedes: si acepto su oferta, pienso cumplir mi palabra y le diría claramente a mi empleador actual que mi decisión es definitiva.",
    explanation:
      "Las contraofertas a menudo no resuelven los motivos por los que alguien quiere irse. Explicar tu motivación más allá del dinero tranquiliza al reclutador.",
    tips: ["Explica los verdaderos motivos de tu cambio.", "Demuestra que cumples tus compromisos."],
    commonMistakes: ["Usar una nueva oferta solo para conseguir un aumento de tu empleador actual.", "Prometer que nunca considerarías una contraoferta, lo que puede sonar poco sincero."],
    followUpQuestions: ["¿Qué tendría que cambiar tu empleador actual para que te quedaras?", "¿Has hablado de tus objetivos profesionales con tu responsable?"],
  },
  'hr-019': {
    question: "¿Estás disponible para viajar, hacer guardias o trabajar horas extra de forma ocasional?",
    intent: "El reclutador comprueba que entiendes las exigencias prácticas del puesto y que puedes comprometerte con honestidad.",
    expectedAnswer:
      "Sí, dentro de unos límites razonables. Entiendo que el puesto incluye una semana de guardia al mes, algo que ya hago en mi trabajo actual, y me parece bien siempre que la rotación sea justa y haya apoyo ante incidencias. Puedo viajar varias veces por trimestre para reuniones con clientes. En cuanto a las horas extra, estoy dispuesto a hacer un esfuerzo adicional durante lanzamientos o incidencias; solo quiero asegurarme de que sea algo excepcional y no la forma habitual de trabajar. ¿Podría decirme con qué frecuencia se producen incidencias durante las guardias y cómo organiza el equipo el tiempo de descanso?",
    explanation:
      "Responder con honestidad sobre tu disponibilidad evita malas sorpresas para ambas partes. Preguntar por la frecuencia y la compensación demuestra profesionalidad, no reticencia.",
    tips: ["Sé honesto sobre tus límites.", "Pregunta con qué frecuencia ocurre realmente y cómo se compensa."],
    commonMistakes: ["Aceptarlo todo y arrepentirte después.", "Rechazar cualquier flexibilidad en un puesto que claramente la exige."],
    followUpQuestions: ["¿Cómo se compensan aquí las guardias?", "¿Cuál es el viaje más largo que podrías hacer?"],
  },
  'hr-020': {
    question: "¿Por qué quieres hacer un cambio de carrera?",
    intent: "El reclutador quiere entender si tu cambio de carrera es meditado y duradero, y no una huida de tu trabajo actual.",
    expectedAnswer:
      "Trabajé seis años como profesor de matemáticas en secundaria, y lo que más disfrutaba era crear herramientas de datos para que mi departamento hiciera seguimiento del progreso de los alumnos. Con el tiempo me di cuenta de que quería dedicarme a eso a tiempo completo. Durante el último año completé un programa de análisis de datos, desarrollé tres proyectos con datos educativos públicos y ahora me presento a puestos de analista junior en los que pueda combinar mis habilidades analíticas con mi experiencia explicando cifras a personas que no son expertas.",
    explanation:
      "Una historia de cambio de carrera convincente es positiva, muestra un detonante claro, una preparación concreta y cómo tu experiencia previa es una ventaja en el nuevo campo.",
    tips: ["Céntrate en lo que te atrae, no en aquello de lo que huyes.", "Muestra una preparación concreta: formación, proyectos, práctica.", "Conecta tu experiencia anterior con el nuevo puesto."],
    commonMistakes: ["Criticar tu profesión anterior.", "Presentar el cambio como un impulso repentino."],
    followUpQuestions: ["¿Qué echas de menos de tu carrera anterior?", "¿Qué ha sido lo más difícil de la transición?"],
  },
};
