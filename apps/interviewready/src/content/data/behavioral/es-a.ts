import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas conductuales 001-040: liderazgo, trabajo en equipo, comunicación, resolución de problemas, conflictos. */
export const esA: TextTable<QuestionText> = {
  'beh-001': {
    question: "Háblame de una ocasión en la que dirigiste a un grupo sin tener autoridad formal.",
    intent: "El entrevistador quiere ver si sabes influir en las personas y coordinarlas gracias a tu credibilidad y tu comunicación, y no a la jerarquía.",
    expectedAnswer:
      "Situación: tres equipos desarrollaban cada uno una parte de un nuevo portal de clientes, y nadie se encargaba del lanzamiento en su conjunto. Tarea: como desarrollador en uno de los equipos, vi que nuestras piezas no iban a encajar a tiempo, así que me ofrecí a coordinar la integración. Acción: creé una lista compartida de dependencias, organicé una llamada semanal de quince minutos con una persona de cada equipo y publicaba un breve resumen después. Cuando dos equipos no se ponían de acuerdo sobre el formato de una API, organicé una sesión en la que cada uno expuso sus limitaciones y acordamos un punto intermedio. Resultado: lanzamos en la fecha prevista, y mi responsable me pidió que coordinara oficialmente el siguiente proyecto entre equipos.",
    explanation:
      "El liderazgo sin autoridad se basa en la iniciativa, la claridad y la confianza. Las mejores historias muestran que diste un paso al frente para cubrir un vacío, que creaste una estructura sencilla y que resolviste los desacuerdos reuniendo a las personas en lugar de imponer una decisión.",
    tips: ["Explica por qué decidiste intervenir.", "Muestra las herramientas sencillas que usaste para coordinar.", "Menciona cómo gestionaste al menos un desacuerdo."],
    commonMistakes: ["Presentarte como el jefe cuando no lo eras.", "Omitir cómo reaccionaron los demás ante tu iniciativa."],
    followUpQuestions: ["¿Qué hiciste cuando alguien no cumplía lo acordado?", "¿Cómo reaccionó tu propio responsable?"],
  },
  'beh-002': {
    question: "Describe una ocasión en la que ayudaste a un compañero de equipo con dificultades a recuperar el ritmo.",
    intent: "El entrevistador quiere saber si te das cuenta cuando alguien tiene dificultades y si lo apoyas con empatía y ayuda práctica.",
    expectedAnswer:
      "Situación: una nueva compañera de nuestro equipo de atención al cliente se estaba retrasando con sus tickets y parecía retraída en las reuniones. Tarea: como la persona con más experiencia del equipo, quería ayudarla sin que se sintiera juzgada. Acción: la invité a tomar un café y le pregunté cómo le iba. Me explicó que nuestras herramientas internas le resultaban confusas y que le daba miedo seguir haciendo preguntas. Le propuse dos sesiones cortas de trabajo en pareja por semana y redacté una guía de una página sobre las herramientas que más le costaban. Resultado: en un mes su acumulación de tickets volvió a la normalidad, y más adelante ella misma mejoró la guía para los siguientes recién llegados.",
    explanation:
      "Apoyar a los demás empieza por entender la causa real. Hacer preguntas abiertas y luego ofrecer una ayuda concreta y respetuosa demuestra inteligencia emocional y potencial de liderazgo.",
    tips: ["Empieza contando cómo detectaste el problema.", "Demuestra que escuchaste antes de proponer una solución."],
    commonMistakes: ["Describir a la compañera de forma negativa.", "Hacer su trabajo en lugar de ayudarla a mejorar."],
    followUpQuestions: ["¿Qué habrías hecho si la situación no hubiera mejorado?", "¿Involucraste a tu responsable?"],
  },
  'beh-003': {
    question: "Háblame de una ocasión en la que tuviste que tomar el mando de forma inesperada.",
    intent: "El entrevistador quiere ver si eres capaz de dar un paso al frente con calma cuando las circunstancias lo exigen.",
    expectedAnswer:
      "Situación: durante mis prácticas, mi supervisora se puso enferma el día de un taller importante con un cliente. Tarea: yo era la única otra persona que había preparado los materiales, así que tenía que dirigir la sesión. Acción: llamé al cliente para explicarle la situación y confirmar que seguía queriendo hacerla, repasé el orden del día con un compañero durante veinte minutos y me centré en las partes que mejor conocía. Las preguntas que no sabía responder las anoté y prometí una respuesta en un plazo de dos días. Resultado: el taller salió bien, el cliente nos envió comentarios positivos y, a partir de entonces, mi supervisora me dio más contacto con clientes.",
    explanation:
      "Esta pregunta busca serenidad e iniciativa. Ser transparente con los demás, prepararte rápido y reconocer con honestidad tus límites son señales de madurez, incluso al principio de una carrera.",
    tips: ["Explica cómo te preparaste en poco tiempo.", "Muestra cómo gestionaste lo que no sabías."],
    commonMistakes: ["Fingir que no tuviste ninguna duda.", "Olvidar describir el resultado."],
    followUpQuestions: ["¿Cuál fue el momento más difícil de ese día?", "¿Harías algo de otra manera?"],
  },
  'beh-004': {
    question: "Describe una ocasión en la que delegaste una tarea importante. ¿Cómo te aseguraste de que saliera bien?",
    intent: "El entrevistador evalúa si sabes confiar en los demás, dar instrucciones claras y hacer seguimiento sin caer en la microgestión.",
    expectedAnswer:
      "Situación: estaba dirigiendo la preparación de nuestro evento anual para clientes mientras también me ocupaba del lanzamiento de un producto. Tarea: no podía con ambas cosas, así que necesitaba delegar la logística del evento en una compañera junior. Acción: le expliqué el objetivo y el presupuesto, compartí con ella la lista de verificación del año anterior y acordamos qué decisiones podía tomar sola y cuáles debía consultarme. Fijamos dos revisiones breves por semana. Cuando propuso un lugar que yo no habría elegido, le pregunté su razonamiento y lo acepté, porque cumplía los criterios. Resultado: el evento salió sin contratiempos, con un 20% más de asistentes que el año anterior, y al año siguiente ella organizó el evento completo por su cuenta.",
    explanation:
      "Delegar bien implica objetivos claros, márgenes de decisión definidos y un seguimiento regular pero ligero. Aceptar decisiones distintas de las tuyas, siempre que cumplan el objetivo, es lo que hace crecer a las personas.",
    tips: ["Explica cómo elegiste a la persona.", "Describe cómo equilibraste el apoyo y la autonomía."],
    commonMistakes: ["Delegar solo las tareas que nadie quería.", "Describir controles constantes que suenan a microgestión."],
    followUpQuestions: ["¿Qué haces cuando una tarea delegada sale mal?", "¿Qué te cuesta delegar?"],
  },
  'beh-005': {
    question: "Háblame de una ocasión en la que, como líder, tuviste que tomar una decisión impopular.",
    intent: "El entrevistador quiere ver si eres capaz de tomar decisiones difíciles, explicarlas y conservar la confianza del equipo.",
    expectedAnswer:
      "Situación: como responsable de equipo, había prometido a mi equipo dos semanas dedicadas a limpiar nuestro código más antiguo después de un largo ciclo de entregas. Tarea: una semana antes de empezar, un cliente importante informó de problemas de rendimiento que ponían en riesgo la renovación de su contrato, y tuve que decidir si mantenía el plan. Acción: analicé los datos con el product manager y llegué a la conclusión de que el problema del cliente debía ir primero. Se lo comuniqué al equipo en persona, expliqué los motivos y el riesgo para el negocio, y reconocí que estaba rompiendo una promesa. Después conseguí una fecha firme para la limpieza en el siguiente trimestre y la protegí en la hoja de ruta. Resultado: resolvimos el problema de rendimiento en ocho días y conservamos al cliente. El equipo se llevó una decepción, pero la confianza se mantuvo porque la limpieza se hizo en la nueva fecha, y dos personas me dijeron que valoraban la transparencia.",
    explanation:
      "A un nivel avanzado, el liderazgo incluye decepcionar a las personas por buenas razones. La clave está en ser transparente sobre las ventajas y desventajas, reconocer el coste para el equipo y cumplir lo que prometes a continuación.",
    tips: ["Explica los datos en los que se basó la decisión.", "Muestra cómo la comunicaste y cómo gestionaste las emociones.", "Demuestra que cumpliste lo prometido después."],
    commonMistakes: ["Presentar la decisión como algo fácil.", "Ignorar el impacto en el equipo.", "Culpar a la dirección para eludir la responsabilidad."],
    followUpQuestions: ["¿Cómo supiste que la confianza se había mantenido?", "¿Qué habrías hecho si el equipo se hubiera opuesto con fuerza?"],
  },
  'beh-006': {
    question: "Háblame de una ocasión en la que hiciste de mentor o acompañaste a alguien en su desarrollo.",
    intent: "El entrevistador quiere ver cómo ayudas a otras personas a crecer y si adaptas tu enfoque a cada una.",
    expectedAnswer:
      "Situación: un recién titulado se incorporó a nuestro equipo de finanzas y tenía que elaborar informes mensuales, pero nunca había trabajado con hojas de cálculo grandes. Tarea: mi responsable me pidió que lo ayudara a ser autónomo en tres meses. Acción: en lugar de darle las respuestas, le pedía que intentara primero cada informe y luego lo revisábamos juntos, explicándole por qué algunas fórmulas eran arriesgadas. Nos reuníamos treinta minutos dos veces por semana, y fui reduciendo mi intervención a medida que mejoraba. También lo animé a presentar él mismo un informe al equipo. Resultado: al tercer mes elaboraba los informes solo y con muy pocas correcciones, y ahora es él quien forma a los nuevos miembros del equipo en ese mismo proceso.",
    explanation:
      "Una mentoría eficaz desarrolla la autonomía. Dejar que la persona lo intente primero, dar explicaciones en lugar de respuestas y reducir el apoyo con el tiempo demuestra un enfoque de acompañamiento bien pensado.",
    tips: ["Muestra cómo adaptaste tu apoyo a medida que la persona avanzaba.", "Mide el éxito por su autonomía."],
    commonMistakes: ["Describir la mentoría como hacer el trabajo por la otra persona.", "No aportar pruebas del progreso de la persona."],
    followUpQuestions: ["¿Cómo acompañas a alguien que no pide ayuda?", "¿Qué aprendiste siendo mentor?"],
  },
  'beh-007': {
    question: "Háblame de una ocasión en la que marcaste el rumbo de un proyecto o de un equipo.",
    intent: "El entrevistador quiere ver si sabes convertir una situación ambigua en un objetivo claro y compartido que oriente las decisiones.",
    expectedAnswer:
      "Situación: nuestro equipo de analítica recibía peticiones de todos los departamentos y trabajaba en lo que más ruido hacía, así que nadie veía el valor de nuestro trabajo. Tarea: cuando asumí la dirección del equipo, quise darle un rumbo claro que contara con el respaldo del negocio. Acción: entrevisté a los responsables de cinco departamentos sobre sus decisiones más importantes del año y luego propuse un enfoque: tres paneles clave vinculados a los ingresos y a la retención de clientes, y el resto de peticiones gestionadas mediante una priorización semanal ligera. Presenté el plan a la dirección con el impacto esperado y obtuve su aprobación; después lo compartí con el equipo para que todos entendieran por qué íbamos a decir que no más a menudo. Resultado: en seis meses, el panel de retención se usaba en todas las revisiones mensuales de la dirección, el volumen de peticiones se volvió manejable y la satisfacción del equipo subió de forma notable en la encuesta anual.",
    explanation:
      "Marcar el rumbo significa elegir qué no hacer y conseguir la adhesión de los demás. Las respuestas sólidas muestran una investigación con las partes interesadas, un enfoque claro ligado al valor de negocio y una comunicación que ayuda al equipo a tomar decisiones por sí mismo.",
    tips: ["Muestra cómo recogiste opiniones antes de decidir.", "Explica cómo el rumbo cambió las decisiones del día a día.", "Incluye un resultado de negocio y un resultado para el equipo."],
    commonMistakes: ["Describir una visión sin explicar cómo se adoptó.", "Ignorar a las personas que perdieron prioridad."],
    followUpQuestions: ["¿Cómo gestionaste a los departamentos cuyas peticiones perdieron prioridad?", "¿Cómo mediste el éxito?"],
  },
  'beh-008': {
    question: "Háblame de una ocasión en la que lideraste un cambio que generó resistencia.",
    intent: "El entrevistador evalúa tu gestión del cambio: entender la resistencia, implicar a las personas y conseguir que el cambio perdure.",
    expectedAnswer:
      "Situación: nuestro equipo de soporte lo gestionaba todo por correo electrónico, y me pidieron implantar una herramienta de tickets. Tarea: la mayoría de los agentes la veían como más burocracia y algunos se negaban abiertamente a usarla. Acción: en lugar de presionar más, me reuní con los agentes más escépticos para entender sus temores. Les preocupaba que la herramienta sirviera para vigilarlos y que los hiciera más lentos. Involucré a dos de ellos en la configuración de la herramienta, eliminé los campos que no aportaban valor y acordé con la dirección que las métricas individuales no se usarían para evaluar a nadie durante los primeros seis meses. Hicimos un piloto de dos semanas con voluntarios y luego compartimos los resultados: menos solicitudes perdidas y respuestas más rápidas. Resultado: todo el equipo adoptó la herramienta en dos meses, el tiempo medio de respuesta bajó un 35% y uno de los escépticos iniciales se convirtió en nuestro formador interno.",
    explanation:
      "La resistencia suele esconder preocupaciones legítimas. Escuchar a los escépticos, implicarlos en el diseño, abordar sus temores de forma explícita y demostrar el valor con un piloto son las técnicas esenciales para liderar un cambio.",
    tips: ["Describe los motivos de la resistencia.", "Muestra cómo implicaste a las personas afectadas.", "Demuestra la adopción con cifras."],
    commonMistakes: ["Presentar a las personas reticentes como el problema.", "Imponer el cambio y llamarlo éxito."],
    followUpQuestions: ["¿Qué habrías hecho si el piloto hubiera fracasado?", "¿Cómo gestionas a alguien que sigue negándose?"],
  },
  'beh-009': {
    question: "Describe un proyecto de equipo que salió bien y el papel que tuviste en él.",
    intent: "El entrevistador quiere entender cómo contribuyes al trabajo colectivo y si sabes describir tu papel con precisión.",
    expectedAnswer:
      "Situación: en mi último año de universidad, cinco compañeros y yo teníamos que desarrollar en diez semanas una aplicación móvil para una asociación benéfica local. Tarea: yo era responsable de la base de datos y de coordinar nuestra planificación semanal. Acción: diseñé el modelo de datos, creé un tablero de tareas compartido y organizaba una breve reunión cada lunes para acordar los objetivos de la semana. Cuando nuestra diseñadora se retrasó, la ayudé preparando bocetos sencillos de las pantallas para que los desarrolladores pudieran empezar. Resultado: entregamos una aplicación funcional que la asociación sigue usando para gestionar a sus voluntarios, y nuestro proyecto obtuvo la nota más alta de la clase.",
    explanation:
      "Los entrevistadores quieren oír tanto el resultado del equipo como tu aportación concreta. Nombrar tus responsabilidades y un momento en el que ayudaste más allá de ellas da una imagen completa.",
    tips: ["Aclara tu papel desde el principio.", "Menciona un momento en el que ayudaste al equipo más allá de tu propia tarea."],
    commonMistakes: ["Decir \"nosotros\" para todo, de modo que tu papel desaparece.", "Atribuirte el mérito de todo el proyecto."],
    followUpQuestions: ["¿Qué fue lo más difícil de trabajar juntos?", "¿Qué cambiarías en la forma en que se organizó el equipo?"],
  },
  'beh-010': {
    question: "Háblame de una ocasión en la que ayudaste a un compañero aunque no fuera tu responsabilidad.",
    intent: "El entrevistador busca colaboración y un sentido del éxito compartido que vaya más allá de tu descripción de puesto.",
    expectedAnswer:
      "Situación: una compañera de contabilidad tenía que presentar un informe de gastos voluminoso antes de la fecha límite de una auditoría, pero la exportación desde nuestro sistema fallaba una y otra vez. Tarea: no era mi área, pero yo ya había usado esa exportación y tenía una tarde con menos carga de trabajo. Acción: me ofrecí a ayudarla, descubrí que algunas entradas contenían caracteres especiales que rompían el archivo y le enseñé a limpiarlas. Documentamos juntas la solución para el resto del equipo. Resultado: presentó el informe a tiempo, y la documentación le ahorró al equipo varias horas el trimestre siguiente.",
    explanation:
      "Esto demuestra iniciativa y espíritu de equipo. Las mejores respuestas también muestran criterio: ayudaste cuando tenías margen y compartiste la solución para que el problema no se repitiera.",
    tips: ["Explica por qué pudiste ayudar sin perjudicar tu propio trabajo.", "Muestra un beneficio duradero, como la documentación."],
    commonMistakes: ["Dar a entender que descuidaste tu propio trabajo.", "Hacer que la compañera parezca incompetente."],
    followUpQuestions: ["¿Cómo decides cuándo ayudar a los demás?", "¿Y si ayudar hubiera significado no cumplir tu propio plazo?"],
  },
  'beh-011': {
    question: "Describe una ocasión en la que tu equipo no alcanzó un objetivo. ¿Qué hiciste?",
    intent: "El entrevistador quiere ver cómo reaccionas ante un fracaso colectivo: buscando culpables, desentendiéndote o aprendiendo.",
    expectedAnswer:
      "Situación: nuestro equipo de marketing tenía como objetivo generar 1.000 leads cualificados en un trimestre para un nuevo producto, y solo llegamos a 600. Tarea: como responsable del análisis de la campaña, tenía que entender qué había fallado y ayudar al equipo a mejorar. Acción: propuse una revisión breve y sin buscar culpables. Descubrimos que nuestro mensaje se dirigía a los puestos equivocados y que habíamos lanzado los anuncios de pago antes de probar la página de destino. Sugerí dos cambios: probar primero la página de destino con un presupuesto pequeño y validar nuestro público objetivo con el equipo de ventas. Resultado: el trimestre siguiente alcanzamos 1.150 leads con el mismo presupuesto, y la prueba previa al lanzamiento se convirtió en un paso estándar.",
    explanation:
      "Los entrevistadores quieren ver responsabilidad a nivel de equipo: analizar las causas con honestidad, evitar culpar a nadie y convertir lo aprendido en cambios de proceso que mejoren los resultados.",
    tips: ["Sé objetivo al describir la diferencia con el objetivo.", "Céntrate en las causas y en los cambios de proceso, no en las personas.", "Muestra el resultado de los cambios."],
    commonMistakes: ["Culpar a otro equipo o a un compañero.", "Elegir un fracaso que en realidad no lo fue."],
    followUpQuestions: ["¿Qué parte del fracaso te correspondía a ti?", "¿Cómo mantuviste la motivación del equipo?"],
  },
  'beh-012': {
    question: "Háblame de una ocasión en la que trabajaste con personas de otro departamento o de otro perfil.",
    intent: "El entrevistador comprueba si sabes colaborar entre áreas distintas, con vocabularios y prioridades diferentes.",
    expectedAnswer:
      "Situación: trabajaba como analista de datos en un proyecto con el equipo jurídico para clasificar miles de contratos. Tarea: tenía que crear una herramienta para ayudarles, pero usábamos vocabularios muy distintos y mi primer prototipo les resultó confuso. Acción: pasé medio día sentado junto a dos abogados para observar cómo revisaban realmente los contratos. Aprendí sus términos clave, rediseñé la interfaz en torno a sus pasos de revisión y organicé una sesión semanal de treinta minutos para recoger sus comentarios. Resultado: la herramienta redujo el tiempo de clasificación de un contrato de unos veinte minutos a siete, y ahora el equipo jurídico me involucra desde el principio en sus proyectos.",
    explanation:
      "El trabajo entre áreas exige entender los objetivos y el lenguaje del otro equipo. Observar cómo trabajan y adaptar tu enfoque demuestra empatía y hace que la colaboración sea eficaz.",
    tips: ["Explica la diferencia de perspectiva o de vocabulario.", "Muestra lo que hiciste para entender a la otra parte."],
    commonMistakes: ["Presentar al otro departamento como difícil.", "Describir solo tu trabajo técnico."],
    followUpQuestions: ["¿Qué te enseñó ese equipo?", "¿Cómo gestionas prioridades enfrentadas entre departamentos?"],
  },
  'beh-013': {
    question: "Háblame de una ocasión en la que dependías de otras personas para completar tu trabajo.",
    intent: "El entrevistador quiere ver cómo gestionas las dependencias: comunicación, anticipación y qué haces cuando los demás se retrasan.",
    expectedAnswer:
      "Situación: estaba preparando una propuesta de precios para un cliente importante y necesitaba datos de costes del equipo de compras. Tarea: la propuesta debía entregarse en diez días y el equipo de compras estaba muy ocupado. Acción: el primer día expliqué exactamente qué datos necesitaba, para qué y para cuándo, y pregunté si les facilitaría enviarme primero una versión parcial. Me puse un recordatorio para hacer seguimiento a los tres días y preparé el resto de la propuesta con estimaciones claramente señaladas. Cuando los datos llegaron con dos días de retraso, solo tuve que sustituir las estimaciones. Resultado: enviamos la propuesta a tiempo y ganamos el contrato. Más tarde, el equipo de compras me dijo que mi petición tan clara les había facilitado priorizarla.",
    explanation:
      "Gestionar dependencias consiste en hacer peticiones claras, hacer seguimiento pronto y tener planes de contingencia. Demostrar que facilitaste a los demás la tarea de ayudarte revela una gran capacidad de colaboración.",
    tips: ["Explica cómo hiciste que tu petición fuera clara.", "Muestra tu plan alternativo."],
    commonMistakes: ["Quejarte del otro equipo.", "Esperar pasivamente hasta el último momento."],
    followUpQuestions: ["¿Qué habrías hecho si los datos nunca hubieran llegado?", "¿Cómo haces seguimiento sin resultar insistente?"],
  },
  'beh-014': {
    question: "Háblame de una ocasión en la que antepusiste el éxito del equipo a tu propio reconocimiento.",
    intent: "El entrevistador busca humildad y orientación al equipo: si te importa más el resultado que el mérito.",
    expectedAnswer:
      "Situación: yo había diseñado un nuevo proceso de incorporación que nuestro equipo presentó a la alta dirección. Tarea: la presentación era una oportunidad para hacerme notar, pero una compañera que se había incorporado hacía poco había realizado la mayor parte de las pruebas con clientes reales. Acción: le propuse que presentara ella misma la sección de resultados, la preparé con ella y me aseguré de que su nombre apareciera en las diapositivas. Durante la reunión, destaqué su aportación cuando los directivos hicieron preguntas. Resultado: el proceso se aprobó, la invitaron a liderar su implantación en otra región, y la cultura de compartir el mérito se convirtió en algo que nuestra responsable mencionó en sus comentarios a todo el equipo.",
    explanation:
      "Los entrevistadores valoran a las personas que ayudan a otras a brillar. Demostrar que compartiste la visibilidad de forma deliberada, sin que el resultado se resintiera, refleja madurez y liderazgo.",
    tips: ["Explica a qué renunciaste y por qué.", "Muestra el beneficio para el equipo y para la persona."],
    commonMistakes: ["Sonar resentido por no recibir el mérito.", "Exagerar tu propio sacrificio."],
    followUpQuestions: ["¿Cómo te aseguras de que tu propio trabajo siga siendo visible?", "¿Alguien ha hecho lo mismo por ti?"],
  },
  'beh-015': {
    question: "Háblame de una ocasión en la que tuviste que integrarte rápidamente en un equipo nuevo.",
    intent: "El entrevistador quiere saber con qué rapidez y fluidez empiezas a ser productivo en un entorno nuevo.",
    expectedAnswer:
      "Situación: me incorporé a una empresa de logística en plena temporada alta. Tarea: tenía que ser útil rápidamente sin frenar al equipo con demasiadas preguntas. Acción: la primera semana pregunté a mi responsable quiénes eran las personas clave y reservé quince minutos con cada una. Llevaba una lista de preguntas y las planteaba agrupadas, leía la documentación del equipo por las tardes y me ofrecía para tareas pequeñas con las que aprender los sistemas. También me ofrecí a actualizar la documentación donde estaba desfasada. Resultado: a la tercera semana ya gestionaba las entregas por mi cuenta, y mi guía actualizada pasó a formar parte de la incorporación de los siguientes recién llegados.",
    explanation:
      "Integrarse tiene que ver con las relaciones y con el aprendizaje. Conocer a las personas clave, hacer preguntas de forma eficiente y contribuir pronto con tareas pequeñas demuestra que eres proactivo y que respetas el tiempo de los demás.",
    tips: ["Describe tu método para las primeras semanas.", "Muestra una contribución temprana."],
    commonMistakes: ["Decir que esperaste a recibir formación.", "Intentar cambiarlo todo la primera semana."],
    followUpQuestions: ["¿Qué fue lo más difícil al unirte a ese equipo?", "¿Cómo plantearías tu primera semana aquí?"],
  },
  'beh-016': {
    question: "Háblame de una ocasión en la que trabajaste con eficacia en un equipo repartido entre distintas ubicaciones o zonas horarias.",
    intent: "El entrevistador quiere ver si sabes colaborar de forma asíncrona y evitar los malentendidos que genera la distancia.",
    expectedAnswer:
      "Situación: trabajaba en un equipo de producto repartido entre Europa y Asia, con solo dos horas de solapamiento al día. Tarea: las decisiones se retrasaban a menudo un día entero porque las preguntas llegaban cuando la otra parte estaba desconectada. Acción: propuse algunas prácticas. Cada persona publicaba al final de su jornada una breve actualización por escrito, con los bloqueos claramente señalados. Usábamos las horas de solapamiento solo para tomar decisiones, no para informar del estado, y grabábamos vídeos cortos para explicar los diseños complejos. Además, rotaba la hora de la reunión una vez al mes para que no fueran siempre las mismas personas las que se conectaban tarde. Resultado: el tiempo medio para resolver un bloqueo pasó de unos dos días a menos de uno, y los objetivos de nuestros sprints se volvieron más previsibles durante el trimestre siguiente.",
    explanation:
      "Los equipos distribuidos dependen de escribir bien, usar con cuidado el tiempo sincrónico y tratar a todos con equidad. Las respuestas avanzadas muestran prácticas concretas y su efecto medible en la entrega.",
    tips: ["Nombra las prácticas concretas que introdujiste o seguiste.", "Muestra tu atención a la equidad entre ubicaciones.", "Aporta un efecto medible."],
    commonMistakes: ["Describir solo herramientas, no prácticas.", "Ignorar la equidad cultural o entre zonas horarias."],
    followUpQuestions: ["¿Cómo generas confianza con compañeros a los que nunca ves en persona?", "¿Qué es lo que no funciona bien de forma asíncrona?"],
  },
  'beh-017': {
    question: "Háblame de una ocasión en la que explicaste algo complejo a alguien que no tenía tus conocimientos.",
    intent: "El entrevistador comprueba si sabes adaptar tu lenguaje a tu público y verificar que te han entendido.",
    expectedAnswer:
      "Situación: nuestra directora comercial me preguntó por qué una nueva funcionalidad iba a llevar seis semanas cuando desde fuera parecía sencilla. Tarea: tenía que explicarle el trabajo técnico sin jerga para que pudiera ajustar las expectativas de un cliente. Acción: comparé la funcionalidad con añadir una habitación a una casa: la habitación en sí se construye rápido, pero la fontanería y la electricidad tienen que conectarse al edificio existente. Después enumeré con palabras sencillas las tres partes ocultas del trabajo y le pedí que me las resumiera para asegurarme de que había quedado claro. Resultado: explicó el calendario al cliente con seguridad, el cliente lo aceptó y ahora me pide que participe pronto en conversaciones similares.",
    explanation:
      "Simplificar consiste en elegir la comparación adecuada, eliminar la jerga y comprobar que te han entendido. Pedir a la otra persona que lo reformule es una señal clara de que te importa que lo entienda de verdad.",
    tips: ["Usa una analogía adaptada a la persona.", "Explica cómo comprobaste que lo había entendido."],
    commonMistakes: ["Usar términos técnicos de todos modos.", "Hablarle a la otra persona con condescendencia."],
    followUpQuestions: ["¿Qué haces cuando tu analogía no funciona?", "¿Cómo explicas la incertidumbre de una estimación?"],
  },
  'beh-018': {
    question: "Háblame de una ocasión en la que tuviste que dar una mala noticia.",
    intent: "El entrevistador quiere ver hasta qué punto eres honesto, oportuno y constructivo cuando el mensaje no es bien recibido.",
    expectedAnswer:
      "Situación: dos semanas antes de un lanzamiento previsto, nuestras pruebas revelaron que una funcionalidad clave tenía errores graves en los datos. Tarea: como coordinadora del proyecto, tenía que comunicar al cliente que no llegaríamos a la fecha de lanzamiento. Acción: pedí una llamada ese mismo día en lugar de esperar a la reunión semanal. Expliqué el problema con palabras sencillas, asumí la responsabilidad de no haberlo detectado antes y presenté dos opciones: lanzar a tiempo sin la funcionalidad o retrasarlo diez días con todo funcionando. Después envié los detalles por escrito. Resultado: el cliente eligió el retraso, agradeció saberlo con antelación y renovó su contrato ese mismo año.",
    explanation:
      "Las malas noticias se comunican mejor pronto, de forma directa y con opciones. Asumir la responsabilidad y proponer soluciones mantiene la confianza aunque el mensaje decepcione.",
    tips: ["Demuestra que no retrasaste el mensaje.", "Aporta opciones, no solo el problema.", "Haz seguimiento por escrito."],
    commonMistakes: ["Suavizar tanto el mensaje que deja de ser claro.", "Culpar a otros delante del cliente."],
    followUpQuestions: ["¿Cómo reaccionó el cliente en ese momento?", "¿Qué cambió en tu proceso después?"],
  },
  'beh-019': {
    question: "Háblame de una ocasión en la que un malentendido causó un problema. ¿Cómo lo solucionaste?",
    intent: "El entrevistador comprueba si asumes la responsabilidad de los fallos de comunicación y mejoras tus hábitos.",
    expectedAnswer:
      "Situación: le pedí a nuestra diseñadora que preparara \"el nuevo banner\" para una campaña, y ella hizo un banner para la web cuando yo lo necesitaba para redes sociales. Tarea: habíamos perdido dos días y la campaña empezaba en tres. Acción: reconocí que mi petición había sido imprecisa y acordamos juntos el formato en una llamada breve. Ella adaptó el diseño y yo me encargué de las variantes del texto para ganar tiempo. Después creé una plantilla sencilla de solicitud con formato, tamaño, plazo y finalidad. Resultado: la campaña se lanzó a tiempo, y ahora todo el equipo de marketing usa la plantilla, lo que ha reducido las idas y venidas en las peticiones de diseño.",
    explanation:
      "Asumir tu parte en un malentendido y corregir el proceso que lo originó demuestra responsabilidad y mejora continua, dos cualidades que los entrevistadores valoran.",
    tips: ["Asume tu parte de responsabilidad.", "Describe el cambio de proceso que evita que se repita."],
    commonMistakes: ["Culpar por completo a la otra persona.", "Terminar la historia en la solución rápida."],
    followUpQuestions: ["¿Cómo te aseguras ahora de que se entienden tus instrucciones?", "¿Qué haces cuando es otra persona la que no se explica con claridad?"],
  },
  'beh-020': {
    question: "Háblame de una ocasión en la que convenciste a alguien de que cambiara de opinión.",
    intent: "El entrevistador quiere ver cómo influyes en los demás: con datos y empatía, o con presión.",
    expectedAnswer:
      "Situación: mi responsable quería lanzar una encuesta a clientes con cuarenta preguntas. Tarea: yo creía que la tasa de respuesta sería muy baja y quería convencerlo de acortarla. Acción: en lugar de limitarme a discrepar, reuní datos de nuestras dos encuestas anteriores que mostraban que la tasa de finalización caía en picado a partir de la décima pregunta. También entendí su preocupación: necesitaba respuestas para tres departamentos distintos. Le propuse una encuesta principal de diez preguntas más encuestas breves de seguimiento para cada departamento. Resultado: aceptó, la tasa de respuesta fue del 38%, frente al 12% del año anterior, y cada departamento siguió recibiendo los datos que necesitaba.",
    explanation:
      "Persuadir con eficacia combina los datos con la comprensión del objetivo de la otra persona. Ofrecer una alternativa que responda a su necesidad le facilita cambiar de opinión.",
    tips: ["Entiende el objetivo de la otra persona antes de argumentar.", "Usa datos o ejemplos.", "Propón una alternativa, no solo una objeción."],
    commonMistakes: ["Ganar la discusión pero dañar la relación.", "Basarte únicamente en tu opinión."],
    followUpQuestions: ["¿Y si aun así no hubiera estado de acuerdo?", "Háblame de una ocasión en la que no conseguiste convencer a alguien."],
  },
  'beh-021': {
    question: "Háblame de una ocasión en la que hiciste una presentación ante la alta dirección.",
    intent: "El entrevistador evalúa tu comunicación con directivos: ser conciso, centrarte en las decisiones y gestionar preguntas difíciles.",
    expectedAnswer:
      "Situación: me pidieron presentar al comité de dirección la propuesta de nuestro equipo para sustituir una base de datos de clientes obsoleta, con quince minutos en el orden del día. Tarea: necesitaba que aprobaran un presupuesto importante personas con muy poco tiempo y prioridades distintas. Acción: preparé un mensaje principal: el sistema actual genera un riesgo de caídas durante la temporada alta y bloquea dos iniciativas de ingresos. Empecé por la decisión que necesitaba y seguí con el coste, los riesgos de no hacer nada y el calendario, dejando los detalles en un anexo. Me reuní antes con la directora financiera para entender sus dudas, de modo que las cifras coincidieran con lo que ella esperaba. Cuando el CEO cuestionó el calendario, expliqué qué parte era segura y cuál dependía de un proveedor. Resultado: el comité aprobó el presupuesto en la misma reunión, y la directora financiera me pidió que usara el mismo formato para las siguientes actualizaciones.",
    explanation:
      "El público directivo quiere la conclusión primero, ventajas e inconvenientes claros y honestidad sobre la incertidumbre. Preparar a las partes interesadas clave antes de la reunión evita sorpresas y es señal de una comunicación avanzada.",
    tips: ["Empieza por la decisión que necesitas.", "Reúnete antes con las partes interesadas clave.", "Separa lo que es seguro de lo que no lo es."],
    commonMistakes: ["Contar la historia en orden cronológico antes de ir al grano.", "Ocultar la incertidumbre para parecer seguro."],
    followUpQuestions: ["¿Cuál fue la pregunta más difícil que recibiste?", "¿Cómo te preparas para una presentación que podrían recortar?"],
  },
  'beh-022': {
    question: "Háblame de un documento escrito importante que hayas elaborado.",
    intent: "El entrevistador quiere ver si sabes escribir con claridad y adaptar los documentos a su finalidad y a sus lectores.",
    expectedAnswer:
      "Situación: después de un incidente de datos que afectó a varios cientos de clientes, mi responsable me pidió redactar el informe interno y el mensaje para los clientes. Tarea: ambos tenían que ser precisos, claros y publicarse en un plazo de veinticuatro horas. Acción: para el informe interno usé una estructura sencilla: qué ocurrió, impacto, causa, medidas adoptadas y próximos pasos, con una cronología. Para los clientes, escribí un mensaje breve en lenguaje sencillo que explicaba qué había pasado, qué significaba para ellos y qué estábamos haciendo, sin jerga técnica. Pedí a una compañera de soporte que lo leyera como lo haría un cliente y ajusté dos frases confusas. Resultado: ambos documentos se aprobaron con cambios menores, soporte recibió muy pocas preguntas adicionales y la estructura del informe se convirtió en nuestra plantilla estándar para incidentes.",
    explanation:
      "Escribir bien depende de la finalidad y del público. Usar una estructura clara, un lenguaje sencillo y un lector de prueba son técnicas prácticas que los entrevistadores reconocen como profesionales.",
    tips: ["Explica cómo adaptaste la redacción a cada público.", "Menciona cómo comprobaste la claridad."],
    commonMistakes: ["Elegir como ejemplo un correo electrónico trivial.", "Centrarte en el incidente en lugar de en la redacción."],
    followUpQuestions: ["¿Cuánto tiempo te llevó redactarlo?", "En tu opinión, ¿qué hace que un documento sea fácil de leer?"],
  },
  'beh-023': {
    question: "Háblame de una ocasión en la que escuchar con atención te ayudó a resolver un problema.",
    intent: "El entrevistador comprueba si escuchas para entender y no solo para responder, sobre todo con clientes o usuarios.",
    expectedAnswer:
      "Situación: un cliente llamó a nuestro servicio de asistencia por tercera vez porque las facturas iban lentas en nuestro software. Tarea: los agentes anteriores le habían reiniciado la sesión cada vez, y estaba frustrado. Acción: en lugar de aplicar la solución habitual, le pedí que me describiera exactamente lo que hacía antes de que empezara la lentitud. Mientras hablaba, me di cuenta de que siempre exportaba las facturas a una carpeta de red compartida. Reproduje los mismos pasos y descubrí que lo lento era la exportación, no el software. Resultado: lo ayudé a cambiar la ubicación de exportación, el problema desapareció y compartí el hallazgo con el equipo, lo que resolvió tickets similares de otros clientes.",
    explanation:
      "La escucha activa implica hacer preguntas abiertas y prestar atención a los detalles que otros pasaron por alto. Esta respuesta demuestra que escuchar puede ser una herramienta para resolver problemas, no solo una habilidad blanda.",
    tips: ["Muestra las preguntas concretas que hiciste.", "Destaca el detalle que detectaste gracias a la escucha."],
    commonMistakes: ["Hablar de la escucha en términos generales.", "Olvidar el resultado para el cliente."],
    followUpQuestions: ["¿Cómo mantienes la paciencia con personas frustradas?", "¿Cómo le demuestras a alguien que lo estás escuchando?"],
  },
  'beh-024': {
    question: "Háblame de una ocasión en la que tuviste que decir que no a una parte interesada importante.",
    intent: "El entrevistador quiere ver si sabes proteger las prioridades y la calidad sin deteriorar las relaciones.",
    expectedAnswer:
      "Situación: dos semanas antes del cierre del trimestre, el director de ventas pidió a mi equipo que añadiera un informe personalizado para un cliente potencial, asegurando que ayudaría a cerrar una gran operación. Tarea: estábamos comprometidos con una fecha límite de cumplimiento normativo, y añadir el informe la habría puesto en riesgo. Acción: me reuní con él ese mismo día para entender qué necesitaba realmente el cliente potencial. Resultó que querían una prueba de que se podían exportar ciertos datos, no un informe completo. Le expliqué nuestra limitación y el coste de no cumplir la fecha normativa, y le propuse una alternativa: un ejemplo de exportación de una página que podíamos preparar en un día, y el informe completo planificado para el mes siguiente. Confirmé el acuerdo por escrito con copia a nuestros responsables. Resultado: cumplimos la fecha normativa, el cliente potencial firmó con el ejemplo de exportación y ahora el director de ventas nos involucra antes en sus operaciones.",
    explanation:
      "Decir que no de forma adecuada implica entender la necesidad real, explicar abiertamente las ventajas e inconvenientes y ofrecer una alternativa. A un nivel avanzado, proteges los compromisos sin dañar relaciones importantes.",
    tips: ["Encuentra la necesidad que hay detrás de la petición.", "Explica las ventajas e inconvenientes en términos de negocio.", "Ofrece una alternativa y confírmala por escrito."],
    commonMistakes: ["Decir que sí e incumplir el otro compromiso.", "Negarte sin ofrecer nada a cambio."],
    followUpQuestions: ["¿Y si lo hubiera escalado a tu responsable?", "¿Cómo decides cuándo aceptar peticiones urgentes?"],
  },
  'beh-025': {
    question: "Describe un problema difícil que hayas resuelto.",
    intent: "El entrevistador quiere conocer tu proceso de resolución de problemas: cómo analizas, pruebas y verificas una solución.",
    expectedAnswer:
      "Situación: en mi trabajo a tiempo parcial en una tienda online, a veces los clientes recibían el producto en una talla equivocada. Tarea: mi responsable me pidió averiguar por qué. Acción: reuní los últimos treinta pedidos erróneos y los comparé. Todos habían sido modificados por el cliente después del pago. Probé el proceso y descubrí que los cambios realizados después del pago no se enviaban al sistema del almacén. Se lo comuniqué al desarrollador con mis ejemplos y, mientras tanto, añadimos una comprobación manual de los pedidos modificados. Resultado: el desarrollador corrigió la sincronización, los errores de talla bajaron casi a cero y desaparecieron las quejas de clientes de esa categoría.",
    explanation:
      "Los entrevistadores buscan estructura: recopilar datos, encontrar un patrón, comprobar tu hipótesis, aplicar una solución provisional y luego una definitiva. Esto es útil sea cual sea el puesto o el nivel.",
    tips: ["Describe tu método paso a paso.", "Menciona cómo confirmaste la causa."],
    commonMistakes: ["Saltar directamente a la solución sin explicar el análisis.", "Elegir un problema que no tenía ninguna dificultad real."],
    followUpQuestions: ["¿Qué habrías hecho si no hubieras encontrado un patrón?", "¿Cómo priorizaste este problema frente al resto de tu trabajo?"],
  },
  'beh-026': {
    question: "Háblame de una ocasión en la que tuviste que resolver un problema con información incompleta.",
    intent: "El entrevistador evalúa cómo actúas en situaciones de incertidumbre: supuestos, riesgos y cuándo decidir.",
    expectedAnswer:
      "Situación: un proveedor nos informó de que un componente clave llegaría con retraso, pero no podía decirnos cuánto. Tarea: como coordinador de planificación, tenía que decidir cómo mantener la producción durante el mes siguiente. Acción: hice una lista de lo que sabíamos y de lo que no, y luego elaboré tres escenarios: un retraso de una semana, de tres semanas y de seis semanas. Para cada uno calculé el impacto y el coste de cambiar a un proveedor alternativo. Recomendé pedir de inmediato una pequeña cantidad al proveedor alternativo, lo que nos protegía en los dos escenarios más largos con un coste limitado, y acordamos revisar la situación cada viernes. Resultado: el retraso duró cuatro semanas, la producción nunca se detuvo y el coste adicional fue muy inferior al que habría supuesto una parada de producción.",
    explanation:
      "Con información incompleta, lo mejor es hacer explícitos los supuestos, comparar escenarios y elegir una acción que limite los peores riesgos, con revisiones periódicas para ajustarla.",
    tips: ["Separa lo que sabías de lo que suponías.", "Explica cómo limitaste el riesgo.", "Muestra cómo revisaste la decisión a medida que llegaba información."],
    commonMistakes: ["Esperar a tener información perfecta.", "Presentar una corazonada afortunada como una estrategia."],
    followUpQuestions: ["¿Qué te habría hecho cambiar de decisión?", "¿Cómo le explicaste la incertidumbre a tu responsable?"],
  },
  'beh-027': {
    question: "Háblame de una ocasión en la que encontraste la causa raíz de un problema recurrente.",
    intent: "El entrevistador quiere ver si vas más allá de las soluciones rápidas y abordas las causas de fondo.",
    expectedAnswer:
      "Situación: todos los lunes por la mañana, nuestro sistema de pedidos se ralentizaba y el equipo reiniciaba el servidor para solucionarlo. Tarea: me pidieron evitar que ocurriera en lugar de reiniciar cada semana. Acción: revisé los logs y las métricas de las seis semanas anteriores y me di cuenta de que un proceso de limpieza semanal se ejecutaba el domingo por la noche y dejaba miles de conexiones a la base de datos abiertas. Reproduje el problema en nuestro entorno de pruebas, confirmé la causa y corregí el proceso para que cerrara correctamente sus conexiones. También añadí una alerta por si el número de conexiones volvía a crecer. Resultado: la ralentización de los lunes no volvió a producirse, y el equipo se ahorró el tiempo dedicado a los reinicios y a las quejas de los clientes.",
    explanation:
      "El análisis de causa raíz consiste en buscar patrones a lo largo del tiempo, reproducir el problema y confirmar la causa antes de corregirlo. Añadir monitorización demuestra que piensas en la prevención, no solo en la reparación.",
    tips: ["Explica cómo identificaste el patrón.", "Muestra cómo confirmaste la causa antes de corregirla.", "Menciona la prevención."],
    commonMistakes: ["Quedarte con la primera explicación plausible.", "Describir una corrección sin demostrar que funcionó."],
    followUpQuestions: ["¿Qué herramientas usaste para investigar?", "¿Por qué nadie lo había solucionado antes?"],
  },
  'beh-028': {
    question: "Háblame de una ocasión en la que encontraste una solución creativa a un problema.",
    intent: "El entrevistador comprueba si sabes pensar más allá de las opciones evidentes cuando el enfoque habitual no funciona.",
    expectedAnswer:
      "Situación: nuestra pequeña organización sin ánimo de lucro necesitaba traducir materiales de formación a cuatro idiomas, pero no teníamos presupuesto para traductores profesionales. Tarea: como coordinadora del programa, tenía que encontrar la forma de entregar los materiales en dos meses. Acción: me di cuenta de que muchos de nuestros voluntarios eran bilingües, así que organicé un \"fin de semana de traducción\" en el que los voluntarios trabajaban en parejas: uno traducía y el otro revisaba. Preparé un glosario de términos clave para mantener la coherencia del vocabulario y pedí a una traductora profesional que apoyaba nuestra causa que revisara gratuitamente solo las páginas más importantes. Resultado: todos los materiales se tradujeron en cinco semanas casi sin coste, y los voluntarios dijeron que aquel fin de semana fue uno de sus eventos favoritos del año.",
    explanation:
      "En una entrevista, la creatividad consiste en combinar los recursos disponibles de una forma nueva bajo limitaciones reales, sin dejar de controlar la calidad. El glosario y la revisión demuestran que la idea creativa también se ejecutó bien.",
    tips: ["Describe la limitación que hacía imposible la solución habitual.", "Muestra cómo garantizaste la calidad."],
    commonMistakes: ["Describir una idea que nunca se llevó a la práctica.", "Ignorar los riesgos del enfoque creativo."],
    followUpQuestions: ["¿Qué riesgos veías en ese enfoque?", "¿Cómo fomentas las ideas creativas en un equipo?"],
  },
  'beh-029': {
    question: "Háblame de una ocasión en la que resolviste un problema con mucha presión de tiempo.",
    intent: "El entrevistador quiere ver si mantienes el método cuando el tiempo apremia.",
    expectedAnswer:
      "Situación: una hora antes de un webinar con trescientos inscritos, nuestra plataforma de presentaciones dejó de funcionar. Tarea: como organizadora del evento, tenía que asegurarme de que el webinar se celebrara a tiempo. Acción: pedí a un compañero que contactara con el soporte de la plataforma mientras yo preparaba una reunión alternativa en otra herramienta que ya usábamos. Redacté un mensaje breve con el nuevo enlace y lo envié a los participantes por correo electrónico y por nuestras redes sociales treinta minutos antes del inicio. También pedí al ponente que probara conmigo la nueva herramienta. Resultado: el webinar empezó con cinco minutos de retraso y más de 250 participantes, y añadimos un plan alternativo a nuestra lista de verificación de eventos.",
    explanation:
      "Bajo presión de tiempo, las personas eficaces reparten las tareas, buscan en paralelo una solución y una alternativa, y comunican pronto. Convertir la experiencia en una lista de verificación demuestra aprendizaje.",
    tips: ["Muestra cómo organizaste la respuesta rápidamente.", "Menciona la comunicación con las personas afectadas."],
    commonMistakes: ["Describir pánico sin método.", "Olvidar lo que cambiaste después."],
    followUpQuestions: ["¿Qué habrías hecho si la herramienta alternativa también hubiera fallado?", "¿Cómo te preparas ahora para este tipo de situaciones?"],
  },
  'beh-030': {
    question: "Háblame de una ocasión en la que tu primera solución no funcionó.",
    intent: "El entrevistador evalúa tu perseverancia y tu capacidad de aprender de los intentos fallidos en lugar de repetirlos.",
    expectedAnswer:
      "Situación: la página de pago de nuestra web tenía una tasa de abandono alta. Tarea: me pidieron mejorar la tasa de conversión. Acción: mi primera idea fue simplificar el diseño, así que eliminamos varios campos. Al cabo de dos semanas, los resultados no habían cambiado. En lugar de probar otro cambio de diseño, revisé grabaciones de sesiones y comentarios de clientes, y descubrí que muchos usuarios se iban al ver los gastos de envío en el último paso. Propuse mostrar los gastos de envío en la página del producto. Resultado: el abandono bajó un 18% el mes siguiente. Aprendí a entender mejor la causa antes de probar una solución.",
    explanation:
      "Que el primer intento falle es normal. Lo que importa es reconocer rápido que no ha funcionado, investigar más a fondo y ajustar tu método, no limitarte a probar alternativas al azar.",
    tips: ["Sé honesto sobre el intento fallido.", "Muestra lo que aprendiste sobre tu propio método."],
    commonMistakes: ["Ocultar el fracaso.", "Cambiar muchas cosas a la vez sin entender por qué."],
    followUpQuestions: ["¿Cuánto tardaste en darte cuenta de que no funcionaba?", "¿Cómo decides cuándo dejar de insistir en un enfoque?"],
  },
  'beh-031': {
    question: "Háblame de una ocasión en la que evitaste un problema antes de que ocurriera.",
    intent: "El entrevistador quiere ver tu capacidad de anticipación: detectar riesgos pronto, convencer a los demás y actuar antes de que haya daños.",
    expectedAnswer:
      "Situación: nuestra empresa tenía previsto trasladar todos los datos de clientes a un nuevo proveedor cloud en un solo fin de semana. Tarea: como miembro del equipo de operaciones, revisé el plan y vi que no había ninguna forma probada de volver atrás si la migración fallaba. Acción: redacté una breve nota de riesgos que explicaba qué podía salir mal, el impacto probable en los clientes y el coste de un día entero de caída del servicio. Propuse un ensayo con una copia de los datos y un procedimiento claro de vuelta atrás. La dirección aceptó aplazarlo una semana. Durante el ensayo descubrimos que copiar una tabla grande llevaba seis horas más de lo previsto. Resultado: ajustamos el plan, la migración real terminó dentro del plazo y los clientes no sufrieron ninguna interrupción. El ensayo pasó a ser obligatorio en las migraciones futuras.",
    explanation:
      "La prevención es invisible cuando funciona, así que las respuestas sólidas explican el riesgo, las pruebas que convencieron a los demás y lo que el ensayo o la comprobación reveló realmente. Esto demuestra anticipación e influencia.",
    tips: ["Cuantifica el riesgo que identificaste.", "Explica cómo convenciste a los demás de actuar.", "Muestra lo que la prevención sacó realmente a la luz."],
    commonMistakes: ["Describir un riesgo que nunca tuvo consecuencias reales.", "Atribuirte todo el mérito de un esfuerzo de equipo."],
    followUpQuestions: ["¿Cómo gestionaste la presión para mantener la fecha original?", "¿Cómo detectas riesgos en los planes de otras personas?"],
  },
  'beh-032': {
    question: "Háblame de una ocasión en la que resolviste un problema con recursos muy limitados.",
    intent: "El entrevistador comprueba tu ingenio, tu capacidad de priorizar y de aportar valor dentro de unas limitaciones.",
    expectedAnswer:
      "Situación: nuestro equipo de atención al cliente perdió a dos de sus seis agentes durante una congelación de contrataciones, justo antes de la temporada alta. Tarea: como responsable del equipo, tenía que mantener unos tiempos de respuesta aceptables sin nuevas contrataciones ni más presupuesto. Acción: analicé las solicitudes del año anterior y vi que el 40% tenían que ver con el seguimiento de pedidos. Con una compañera, redacté respuestas claras a las diez preguntas más frecuentes y pedí al equipo web que añadiera un enlace de seguimiento a cada correo de confirmación. También reorganicé los turnos para que nuestros agentes más sólidos cubrieran las horas de mayor actividad. Resultado: las solicitudes entrantes bajaron un 30% durante el pico y nuestro tiempo medio de respuesta se mantuvo por debajo de cuatro horas, frente a las seis del año anterior con el equipo completo.",
    explanation:
      "Con recursos limitados, lo más eficaz es reducir la demanda y concentrar el esfuerzo donde más importa. Priorizar a partir de los datos y aplicar cambios pequeños y baratos suele dar mejores resultados que trabajar más.",
    tips: ["Empieza por los datos que guiaron tus decisiones.", "Muestra tanto la reducción de la demanda como las mejoras de eficiencia.", "Compara los resultados con una referencia."],
    commonMistakes: ["Resolver el problema solo pidiendo a la gente que hiciera horas extra.", "No aportar ningún resultado medible."],
    followUpQuestions: ["¿Qué decidiste no hacer?", "¿Cómo se sentía el equipo durante ese periodo?"],
  },
  'beh-033': {
    question: "Háblame de un desacuerdo que tuviste con un compañero.",
    intent: "El entrevistador quiere ver si sabes discrepar con respeto, centrarte en el problema y llegar a una solución.",
    expectedAnswer:
      "Situación: un compañero y yo estábamos preparando una propuesta para un cliente y no estábamos de acuerdo sobre el precio: él quería un único paquete y yo quería tres opciones. Tarea: en dos días teníamos que enviar una propuesta que ambos pudiéramos defender. Acción: le sugerí que cada uno pusiera por escrito sus razones. A él le preocupaba que las opciones confundieran al cliente; a mí, que un precio único resultara demasiado alto para su presupuesto. Acordamos preguntar a la responsable de la cuenta qué sabía del proceso de decisión del cliente. Nos dijo que el cliente comparaba las ofertas con detenimiento, así que propusimos dos opciones claras con una tabla comparativa sencilla. Resultado: el cliente eligió la opción más alta, y mi compañero y yo seguimos trabajando bien juntos en propuestas posteriores.",
    explanation:
      "Los entrevistadores buscan un desacuerdo respetuoso: entender el punto de vista del otro, recurrir a hechos o a una fuente neutral y llegar a una decisión que sirva al objetivo. Preservar la relación forma parte del resultado.",
    tips: ["Presenta con justicia el punto de vista de la otra persona.", "Muestra cómo llegasteis a una decisión compartida."],
    commonMistakes: ["Elegir una historia en la que simplemente tú tenías razón y la otra persona no.", "Describir una tensión personal en lugar de un desacuerdo profesional."],
    followUpQuestions: ["¿Qué habrías hecho si no hubierais llegado a un acuerdo?", "¿Cómo sueles reaccionar cuando alguien no está de acuerdo contigo?"],
  },
  'beh-034': {
    question: "Háblame de una ocasión en la que no estuviste de acuerdo con tu responsable.",
    intent: "El entrevistador comprueba si sabes cuestionar a tus superiores con respeto y aceptar una decisión final con profesionalidad.",
    expectedAnswer:
      "Situación: mi responsable quería lanzar una nueva funcionalidad para todos los usuarios a la vez. Tarea: yo creía que un despliegue gradual era más seguro, porque la funcionalidad cambiaba la forma de calcular los pagos. Acción: le pedí una reunión breve y le expliqué mi preocupación con datos de un lanzamiento anterior que había generado tickets de soporte. Propuse lanzarla primero al 10% de los usuarios durante una semana. Mi responsable me explicó que marketing ya había anunciado la fecha, así que acordamos un punto intermedio: lanzar para todos el día previsto, pero con un interruptor para desactivar la funcionalidad rápidamente y una monitorización reforzada. Resultado: el primer día detectamos un pequeño problema de redondeo, desactivamos la funcionalidad durante una hora para corregirlo y evitamos un problema mayor. Más tarde, mi responsable me pidió que ayudara a definir nuestras pautas de lanzamiento.",
    explanation:
      "Una buena respuesta muestra que planteaste el desacuerdo en privado, con datos, y que aceptaste la decisión final sin dejar de reducir el riesgo. Demuestra a la vez valentía y lealtad.",
    tips: ["Plantea el desacuerdo en privado y con hechos.", "Demuestra que respetaste la decisión final."],
    commonMistakes: ["Describir a tu responsable de forma negativa.", "Contar una historia en la que ignoraste la decisión."],
    followUpQuestions: ["¿Y si tu responsable hubiera rechazado cualquier punto intermedio?", "¿Cuándo merece la pena escalar un desacuerdo?"],
  },
  'beh-035': {
    question: "Háblame de una ocasión en la que trataste con un cliente difícil.",
    intent: "El entrevistador quiere ver si mantienes la calma, entiendes el problema real y proteges tanto la relación como a la empresa.",
    expectedAnswer:
      "Situación: un cliente llamó muy enfadado porque un pedido para la inauguración de su tienda había llegado incompleto. Tarea: como gestora de la cuenta, tenía que calmar la situación y encontrar una solución antes de la inauguración, que era dos días después. Acción: lo dejé explicarse sin interrumpirlo y luego resumí su problema para demostrarle que lo había entendido. Me disculpé por las molestias y comprobé el stock mientras seguía al teléfono. Organicé el envío urgente de los artículos que faltaban a nuestro cargo y lo llamé a la mañana siguiente para confirmarle el número de seguimiento. Resultado: los artículos llegaron el día antes de la inauguración, el cliente nos dio las gracias y al mes siguiente hizo un pedido más grande.",
    explanation:
      "Gestionar a clientes difíciles empieza por escuchar y reconocer su frustración, y sigue con una acción rápida y concreta. Hacer un seguimiento proactivo convierte una experiencia negativa en una positiva.",
    tips: ["Muestra cómo rebajaste la tensión.", "Describe la solución concreta y el seguimiento."],
    commonMistakes: ["Criticar al cliente.", "Prometer algo que no podías cumplir."],
    followUpQuestions: ["¿Qué haces cuando la petición de un cliente no es razonable?", "¿Cómo te proteges del estrés en ese tipo de llamadas?"],
  },
  'beh-036': {
    question: "Háblame de una ocasión en la que ayudaste a resolver un conflicto entre dos compañeros.",
    intent: "El entrevistador evalúa tu capacidad de mediación: neutralidad, comprensión de ambas partes y búsqueda de una solución duradera.",
    expectedAnswer:
      "Situación: dos miembros veteranos de mi equipo estaban en conflicto abierto sobre cómo gestionar las escalaciones de clientes: uno quería responder de inmediato y el otro quería analizar primero cada caso. Las reuniones se habían vuelto tensas y los demás evitaban trabajar con ellos. Tarea: como responsable del equipo, tenía que resolverlo antes de que afectara a la calidad del servicio. Acción: me reuní con cada uno por separado para escucharlos sin juzgar. Ambos tenían preocupaciones legítimas: la rapidez para los clientes y la calidad de las respuestas. Después los reuní, les recordé su objetivo común y les pedí que diseñaran juntos el proceso. Acordaron un enfoque en dos pasos: un acuse de recibo rápido en menos de una hora y una respuesta completa en un día. Documenté el proceso y hablé con ambos un mes después. Resultado: los tiempos de respuesta a las escalaciones mejoraron, la tensión desapareció y los dos presentaron juntos el proceso a otro equipo.",
    explanation:
      "Una buena mediación consiste en reunirse con cada parte en privado, identificar los intereses legítimos y hacer que ambas se sientan dueñas de la solución. El seguimiento posterior permite comprobar que la solución perdura.",
    tips: ["Mantén la neutralidad al describir a ambas personas.", "Muestra que construyeron ellos mismos la solución.", "Menciona el seguimiento."],
    commonMistakes: ["Tomar partido en tu relato.", "Resolver el conflicto imponiendo una norma sin escuchar."],
    followUpQuestions: ["¿Qué habrías hecho si uno de ellos se hubiera negado a cooperar?", "¿Cuándo debería intervenir un responsable en un conflicto?"],
  },
  'beh-037': {
    question: "Háblame de una ocasión en la que alguien se atribuyó el mérito de tu trabajo.",
    intent: "El entrevistador quiere ver si gestionas las situaciones injustas con calma y de forma constructiva, sin dramatismo.",
    expectedAnswer:
      "Situación: preparé un análisis de mercado que un compañero presentó a nuestra directora como si lo hubiera hecho él solo. Tarea: quería que se reconociera mi aportación sin generar un conflicto. Acción: primero hablé con mi compañero en privado y con calma. Me dijo que simplemente se le había olvidado mencionarme. Le pedí que lo corrigiera en el correo de seguimiento a la directora, y así lo hizo. Además, empecé a compartir mi trabajo en un canal del equipo antes de las reuniones, para que las aportaciones fueran visibles para todos. Resultado: la directora me agradeció el análisis, mi relación con mi compañero siguió siendo buena y mi trabajo ganó visibilidad en general.",
    explanation:
      "Esta pregunta pone a prueba tu control emocional y tu profesionalidad. Abordar el tema de forma directa y en privado, presuponer primero la buena fe y mejorar la visibilidad en el futuro es un enfoque maduro.",
    tips: ["Habla de los hechos, no de lo que sientes hacia la persona.", "Muestra cómo evitaste que volviera a ocurrir."],
    commonMistakes: ["Quejarte en público o acudir directamente a tu responsable.", "No hacer nada y quedarte con el resentimiento."],
    followUpQuestions: ["¿Y si hubiera vuelto a ocurrir?", "¿Cómo das visibilidad a tu trabajo sin parecer presuntuoso?"],
  },
  'beh-038': {
    question: "Háblame de una ocasión en la que recibiste una crítica que te pareció injusta.",
    intent: "El entrevistador comprueba cómo reaccionas cuando no estás de acuerdo con una valoración: a la defensiva, retrayéndote o con un diálogo constructivo.",
    expectedAnswer:
      "Situación: en mi evaluación anual, mi responsable me dijo que no era lo bastante proactivo en las reuniones. Tarea: me pareció injusto porque contribuía mucho por escrito, y quería entender su punto de vista en lugar de rechazarlo sin más. Acción: le pedí ejemplos concretos. Mencionó dos reuniones de planificación en las que me quedé callado y después compartí mis ideas por correo, cuando las decisiones ya estaban tomadas. Le expliqué que prefiero pensar antes de hablar, y acordamos que enviaría mis comentarios antes de las reuniones en lugar de después. Resultado: mis ideas empezaron a influir antes en las decisiones, y en mi siguiente evaluación destacó mis aportaciones a la planificación. Me di cuenta de que la crítica era en parte justa, aunque la forma de expresarla me hubiera sorprendido.",
    explanation:
      "Las mejores respuestas muestran que intentaste entender la crítica antes de juzgarla, encontraste la parte válida y acordaste un cambio. Admitir que la crítica tenía parte de razón demuestra autoconocimiento.",
    tips: ["Pide ejemplos antes de reaccionar.", "Muestra qué parte de la crítica era válida."],
    commonMistakes: ["Explicar por qué tu responsable estaba equivocado.", "Fingir que aceptaste la crítica sin ninguna conversación."],
    followUpQuestions: ["¿Cómo reaccionas en el momento cuando recibes una crítica?", "¿Alguna vez has discrepado de una valoración y has mantenido tu postura?"],
  },
  'beh-039': {
    question: "Háblame de una ocasión en la que dos equipos tenían prioridades enfrentadas y tuviste que resolverlo.",
    intent: "El entrevistador quiere ver si sabes resolver conflictos organizativos centrándote en los objetivos comunes y escalando cuando corresponde.",
    expectedAnswer:
      "Situación: el equipo de marketing necesitaba que nuestro equipo de datos creara informes para una campaña, mientras que el equipo de finanzas necesitaba que automatizáramos los informes de cierre de mes, ambos en las mismas tres semanas. Tarea: como responsable del equipo de datos, no podía hacer ambas cosas por completo y los dos responsables insistían en que su trabajo era urgente. Acción: pregunté a cada equipo qué decisión respaldaba su petición y qué pasaría si llegaba dos semanas más tarde. Marketing solo necesitaba dos cifras clave antes del lanzamiento; finanzas se enfrentaba a una fecha límite de auditoría real. Propuse entregar en tres días una versión manual sencilla de las dos cifras de marketing, centrarnos después en finanzas y terminar los informes completos de marketing tras el cierre de mes. Como ambos responsables habían aceptado los criterios, les presenté el plan juntos y pedí a nuestro director que lo confirmara. Resultado: finanzas cumplió la fecha de la auditoría, marketing lanzó a tiempo con las cifras que necesitaba y ambos equipos aceptaron el proceso de planificación trimestral que propuse.",
    explanation:
      "La resolución avanzada de conflictos se basa en criterios objetivos (impacto, plazos, alternativas), soluciones parciales creativas y una escalación transparente cuando hace falta. Demuestra que sabes actuar en interés de la empresa y no solo de un equipo.",
    tips: ["Explica los criterios que usaste para decidir.", "Busca una solución parcial que cubra la necesidad más urgente.", "Muestra cómo escalaste de forma transparente."],
    commonMistakes: ["Elegir al equipo con el responsable de mayor rango.", "Intentar hacerlo todo y fallar a ambos equipos."],
    followUpQuestions: ["¿Cómo comunicaste la decisión a tu propio equipo?", "¿Qué harías si el director no hubiera estado de acuerdo?"],
  },
  'beh-040': {
    question: "Háblame de una ocasión en la que trabajaste con alguien con quien no te llevabas bien.",
    intent: "El entrevistador quiere saber si las diferencias personales afectan a tu trabajo y cómo construyes una relación funcional.",
    expectedAnswer:
      "Situación: en un proyecto de grupo en la universidad, un compañero era muy directo y a menudo descartaba ideas con rapidez, lo que me molestaba. Tarea: teníamos que entregar juntos un estudio de mercado en dos meses, así que necesitaba una relación de trabajo que funcionara. Acción: lo invité a un café para hablar de cómo nos gustaba trabajar. Descubrí que estaba bajo presión por un trabajo a tiempo parcial y quería que las reuniones fueran cortas. Acordamos un orden del día claro para cada reunión y compartir las ideas por escrito antes de debatirlas. Resultado: nuestras reuniones se volvieron más cortas y tranquilas, el proyecto obtuvo una buena nota y aprendí que entender las limitaciones de alguien cambia la forma en que ves su comportamiento.",
    explanation:
      "Los entrevistadores buscan profesionales capaces de trabajar con cualquiera. Entender la situación de la otra persona y acordar normas de trabajo sencillas son enfoques maduros y prácticos.",
    tips: ["Describe a la persona de forma neutral.", "Muestra lo que hiciste para mejorar la relación."],
    commonMistakes: ["Criticar a la otra persona.", "Decir que te llevas bien con todo el mundo."],
    followUpQuestions: ["¿Con qué tipo de personalidad te cuesta más trabajar?", "¿Qué cambiaste en tu propio comportamiento?"],
  },
};
