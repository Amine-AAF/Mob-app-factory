import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas por puesto 001-030: gestión de proyectos, gestión de producto, análisis de negocio, soporte TI. */
export const esA: TextTable<QuestionText> = {
  'job-001': {
    question: "¿Cuál es la diferencia entre Agile y Waterfall, y cuándo usarías cada uno?",
    intent: "El entrevistador comprueba que conoces los principales enfoques de entrega y que sabes elegir uno según el contexto y no por costumbre.",
    expectedAnswer:
      "Waterfall (en cascada) planifica todo el proyecto desde el principio y avanza por fases secuenciales: requisitos, diseño, construcción, pruebas y despliegue. Funciona bien cuando los requisitos son estables y se entienden bien, cuando los cambios son caros, como en proyectos de construcción o regulados, o cuando los contratos exigen un alcance cerrado. Agile entrega en iteraciones cortas, normalmente de una a cuatro semanas, produce incrementos que funcionan y adapta el plan según el feedback; Scrum y Kanban son marcos habituales. Se adapta a proyectos con incertidumbre, como nuevos productos digitales, donde aprender de los usuarios es importante. Muchas organizaciones usan un modelo híbrido: un presupuesto global e hitos fijos, con entrega Agile en su interior.",
    explanation:
      "Los entrevistadores quieren ver que eliges un método en función de la incertidumbre, el riesgo y las restricciones, no por convicción.",
    tips: ["Da un ejemplo de proyecto para cada enfoque.", "Menciona los modelos híbridos que se usan en organizaciones reales."],
    commonMistakes: ["Describir Agile como «sin planificación».", "Afirmar que un método es siempre mejor."],
    followUpQuestions: ["¿Cuál es la diferencia entre Scrum y Kanban?", "¿Cómo llevarías un proyecto Agile con una fecha límite fija?"],
  },
  'job-002': {
    question: "¿Cómo defines el alcance de un proyecto y evitas la desviación del alcance (scope creep)?",
    intent: "El entrevistador comprueba una competencia básica de la gestión de proyectos que protege presupuestos y plazos.",
    expectedAnswer:
      "Defino el alcance con las partes interesadas al inicio en una breve declaración de alcance: objetivos, entregables, lo que queda explícitamente fuera del alcance, supuestos y criterios de aceptación. Dejar por escrito lo que queda fuera es tan importante como lo que entra. Después establezco un proceso de cambios sencillo: cada nueva solicitud se documenta, se evalúa su impacto en plazo, coste y riesgo, y el patrocinador decide si se añade, si se cambia por otra cosa o si se aplaza. Así los cambios son posibles, pero son decisiones visibles y no añadidos silenciosos.",
    explanation:
      "La desviación del alcance nace de pequeños cambios sin control. Una línea base clara y un proceso de cambios ligero mantienen la flexibilidad y protegen los compromisos.",
    tips: ["Menciona explícitamente lo que queda «fuera del alcance».", "Describe un proceso sencillo de solicitudes de cambio."],
    commonMistakes: ["Aceptar pequeñas peticiones de manera informal hasta que el proyecto se retrasa.", "Rechazar todos los cambios, lo que frustra a las partes interesadas."],
    followUpQuestions: ["¿Qué haces cuando una persona de alto nivel se salta el proceso de cambios?", "¿Cómo documentas los criterios de aceptación?"],
  },
  'job-003': {
    question: "¿Cómo elaboras un plan de proyecto y estimas cuánto tiempo llevará?",
    intent: "El entrevistador evalúa tu método de planificación y cómo gestionas la incertidumbre de las estimaciones.",
    expectedAnswer:
      "Empiezo descomponiendo el trabajo en entregables y tareas más pequeñas, una estructura de desglose del trabajo (EDT), hasta que cada tarea se pueda estimar y asignar. Pido a las personas que harán el trabajo que lo estimen, con rangos o estimaciones de tres puntos, optimista, probable y pesimista, en lugar de cifras únicas. Después identifico las dependencias para encontrar la ruta crítica, la secuencia de tareas que determina la fecha de fin, y compruebo la disponibilidad de recursos, incluidas vacaciones y otros proyectos. Añado una reserva de contingencia según el nivel de riesgo, a menudo del 10 al 20 %, y fijo hitos para seguir el avance. Presento el plan con sus supuestos y su nivel de confianza, y lo actualizo a medida que aprendemos más.",
    explanation:
      "Un plan creíble combina descomposición, estimaciones de quienes hacen el trabajo, dependencias, capacidad y una contingencia explícita.",
    tips: ["Menciona la estructura de desglose del trabajo y la ruta crítica.", "Involucra al equipo en las estimaciones.", "Comunica los supuestos."],
    commonMistakes: ["Estimar a solas sin el equipo.", "Planificar a cada persona al 100 % de su capacidad."],
    followUpQuestions: ["¿Qué harías si la fecha límite viene impuesta y es más corta que tu estimación?", "¿Cómo haces el seguimiento del avance respecto al plan?"],
  },
  'job-004': {
    question: "¿Cómo identificas y gestionas los riesgos de un proyecto?",
    intent: "El entrevistador comprueba que gestionas los riesgos de forma proactiva en lugar de reaccionar ante los problemas.",
    expectedAnswer:
      "Al inicio y a intervalos regulares, organizo breves talleres de riesgos con el equipo y las partes interesadas clave para enumerar lo que podría salir mal, como el retraso de un proveedor, la salida de una persona clave o requisitos poco claros. Anoto cada riesgo en un registro de riesgos con su probabilidad, su impacto, su responsable y su respuesta. Las respuestas incluyen evitar el riesgo, reducirlo, transferirlo, por ejemplo mediante una cláusula contractual, o aceptarlo con un plan de contingencia. Reviso los riesgos principales en cada reunión de seguimiento, porque los riesgos cambian con el tiempo, y escalo pronto cuando un riesgo requiere una decisión del patrocinador. Cuando un riesgo se materializa, se convierte en una incidencia y se gestiona en el registro de incidencias.",
    explanation:
      "La gestión de riesgos es un proceso continuo, con responsables y revisiones periódicas, no un documento que se crea una sola vez al inicio.",
    tips: ["Describe los campos del registro de riesgos.", "Nombra los cuatro tipos de respuesta.", "Menciona las revisiones periódicas."],
    commonMistakes: ["Redactar un registro de riesgos y no actualizarlo nunca.", "Confundir los riesgos con incidencias que ya han ocurrido."],
    followUpQuestions: ["Da un ejemplo de un riesgo que mitigaste con éxito.", "¿Cómo priorizas los riesgos?"],
  },
  'job-005': {
    question: "Háblame de un proyecto que iba con retraso. ¿Qué hiciste?",
    intent: "El entrevistador quiere ver cómo diagnosticas los retrasos, haces concesiones y comunicas bajo presión.",
    expectedAnswer:
      "Situación: dirigía la implantación de un nuevo CRM en tres oficinas comerciales y, a mitad de camino, llevábamos tres semanas de retraso porque la migración de datos era más compleja de lo previsto. Tarea: tenía que proteger la fecha de puesta en producción, ligada al inicio del año comercial. Acción: analicé el trabajo pendiente con el equipo y descubrí que la mayor parte del retraso venía de la limpieza de datos antiguos de clientes. Propuse tres opciones al patrocinador: retrasar la puesta en producción, incorporar temporalmente a un especialista en datos, o migrar primero solo los clientes activos y el resto un mes después. Elegimos la tercera opción y añadimos dos días de horas extra para las pruebas, con el acuerdo del equipo. Informé cada semana a las partes interesadas con un gráfico de avance sencillo. Resultado: el sistema entró en producción en la fecha prevista para todos los clientes activos, y el resto de los datos se migró cuatro semanas después sin interrupciones.",
    explanation:
      "Las buenas respuestas muestran el análisis de la causa, opciones con sus ventajas e inconvenientes presentadas a quien decide y una comunicación transparente.",
    tips: ["Explica la causa raíz del retraso.", "Presenta las opciones que consideraste.", "Muestra cómo comunicaste."],
    commonMistakes: ["Resolver los retrasos solo pidiendo horas extra al equipo.", "Ocultar el retraso hasta que es demasiado tarde."],
    followUpQuestions: ["¿Cómo reaccionó el equipo ante las horas extra?", "¿Qué harías de otra manera en la fase de planificación?"],
  },
  'job-006': {
    question: "Háblame de una ocasión en la que las partes interesadas tenían expectativas contradictorias sobre un proyecto.",
    intent: "El entrevistador evalúa tu capacidad para alinear a personas con prioridades diferentes.",
    expectedAnswer:
      "Situación: para una nueva intranet de empleados, el equipo de comunicación quería una página de inicio centrada en las noticias, mientras que RR. HH. quería un acceso rápido a formularios y políticas. Tarea: como jefe de proyecto, necesitaba un diseño que ambos apoyaran dentro del presupuesto existente. Acción: me reuní con cada grupo por separado para entender los objetivos de fondo: comunicación quería dar visibilidad a las noticias de la empresa y RR. HH. quería recibir menos consultas. Luego compartí los datos de una encuesta a empleados que mostraba que los principales motivos para visitar la intranet eran los formularios y las vacaciones. Organicé un taller conjunto en el que diseñamos una página de inicio con accesos rápidos arriba y una sección de noticias debajo, y acordamos revisar el uso al cabo de tres meses. Resultado: ambos equipos dieron su aprobación, las consultas a RR. HH. bajaron un 25 % y las noticias tuvieron más visitas que en la antigua intranet.",
    explanation:
      "Alinear a las partes interesadas significa descubrir los objetivos que hay detrás de cada postura, apoyarse en datos compartidos y diseñar una solución que sirva a ambos.",
    tips: ["Muestra que escuchaste a cada parte por separado.", "Usa datos para pasar de las opiniones a los hechos."],
    commonMistakes: ["Dejar que decida la persona de mayor rango sin debate.", "Describir a una de las partes de forma negativa."],
    followUpQuestions: ["¿Y si no se hubieran puesto de acuerdo?", "¿Cómo haces el mapa de partes interesadas al inicio de un proyecto?"],
  },
  'job-007': {
    question: "Háblame de un proyecto que fracasó o que hubo que detener. ¿Qué aprendiste?",
    intent: "El entrevistador evalúa tu sentido de la responsabilidad, tu honestidad y tu capacidad para aprender de un fracaso en un nivel sénior.",
    expectedAnswer:
      "Situación: dirigía un proyecto para crear una herramienta interna de gestión de contratos con proveedores. Tras cuatro meses y cerca del 60 % del presupuesto gastado, las pruebas con usuarios mostraron que el equipo de compras seguiría usando hojas de cálculo porque la herramienta no se ajustaba a su forma real de trabajar. Tarea: tenía que decidir si continuar, cambiar de rumbo o detenerlo. Acción: analicé la situación con honestidad junto con el equipo y el patrocinador. Habíamos recogido los requisitos de los responsables y no de las personas que hacían el trabajo, y habíamos probado con usuarios demasiado tarde. Recomendé detener el desarrollo y evaluar una solución comercial, que salía más barata que terminar y corregir nuestra herramienta. Presenté la recomendación al comité de dirección con las cifras y asumí la responsabilidad del fallo en la fase de descubrimiento. Resultado: el comité estuvo de acuerdo, se implantó una solución del mercado en dos meses y cambié mi enfoque: en los proyectos siguientes involucro a los usuarios finales desde la primera semana y pruebo prototipos antes de construir.",
    explanation:
      "Detener un proyecto que fracasa es señal de buen criterio. Asumir el error, explicar la causa y mostrar un cambio en tu práctica hacen que esta respuesta sea sólida.",
    tips: ["Elige un fracaso real con una lección clara.", "Explica cómo decidiste detenerlo.", "Describe cómo cambió tu práctica."],
    commonMistakes: ["Culpar al equipo o a los usuarios.", "Elegir un fracaso que en realidad fue un éxito."],
    followUpQuestions: ["¿Cómo reaccionó el equipo cuando se detuvo el proyecto?", "¿Cómo reconoces pronto que un proyecto está fracasando?"],
  },
  'job-008': {
    question: "¿Cómo informas del estado de un proyecto y mides su salud?",
    intent: "El entrevistador evalúa tu dominio avanzado del control de proyectos y de la comunicación con la dirección.",
    expectedAnswer:
      "Informo sobre unos pocos indicadores que muestran si el proyecto entregará el valor esperado a tiempo y dentro del presupuesto: avance respecto a los hitos, presupuesto gastado frente al previsto y previsión al finalizar, cambios de alcance, principales riesgos e incidencias, y capacidad del equipo. En proyectos más grandes ayuda la gestión del valor ganado (EVM): comparar el valor planificado, el valor ganado y el coste real da índices de rendimiento del cronograma y del coste, de modo que un índice de rendimiento del coste de 0,85 significa que obtenemos 85 céntimos de trabajo planificado por cada euro gastado. Uso un informe de estado de una página con un estado rojo, ámbar o verde para cada dimensión, una breve explicación y las decisiones necesarias, y adapto el nivel de detalle al público: detalle semanal para el equipo y un resumen mensual con decisiones para el comité de dirección. Un estado debe ser honesto: un ámbar o un rojo comunicado pronto, con un plan de recuperación, genera más confianza que un verde que de repente se vuelve rojo.",
    explanation:
      "Un buen informe combina indicadores objetivos, un resumen claro y alertas tempranas y honestas. El valor ganado aporta rigor en los proyectos más grandes.",
    tips: ["Enumera las dimensiones que sigues.", "Explica un indicador de valor ganado.", "Insiste en la honestidad del estado."],
    commonMistakes: ["Informar en «verde» hasta el último momento.", "Enviar informes largos sin decisiones ni acciones."],
    followUpQuestions: ["¿Qué es el índice de rendimiento del cronograma?", "¿Cómo gestionas a un patrocinador que solo quiere buenas noticias?"],
  },
  'job-009': {
    question: "¿Por qué quieres ser product manager y qué significa para ti el puesto?",
    intent: "El entrevistador comprueba que entiendes las responsabilidades de un product manager y que te motivan.",
    expectedAnswer:
      "Para mí, un product manager se encarga de que el equipo construya lo correcto: entender a los usuarios y el negocio, decidir qué problemas resolver y en qué orden, y medir si la solución ha funcionado. El puesto se basa en la influencia más que en la autoridad, ya que el PM trabaja con diseño, ingeniería, marketing y ventas sin dirigir a esas personas. Me atrae porque, en mi puesto actual de analista de negocio, los momentos que más disfruto son hablar con los usuarios, encontrar el problema real detrás de una petición y ver cómo una funcionalidad cambia la forma de trabajar de la gente. Quiero asumir la responsabilidad de los resultados, no solo de los requisitos.",
    explanation:
      "Una buena respuesta define el puesto con precisión, se centra en los resultados y lo relaciona con tu propia experiencia y motivación.",
    tips: ["Define el puesto en términos de problemas y resultados.", "Relaciónalo con experiencias concretas."],
    commonMistakes: ["Describir al PM como el «CEO del producto».", "Centrarte solo en gestionar tareas o el backlog."],
    followUpQuestions: ["¿Cuál es la diferencia entre un product manager y un jefe de proyecto?", "¿Qué producto admiras y por qué?"],
  },
  'job-010': {
    question: "¿Cómo priorizas un backlog de producto?",
    intent: "El entrevistador evalúa tu marco de decisión y cómo equilibras las distintas fuentes de información.",
    expectedAnswer:
      "Parto de los objetivos de producto del periodo, por ejemplo mejorar la activación o la retención, para evaluar cada elemento según lo que importa ahora. Después uso un marco sencillo y transparente. RICE puntúa los elementos por alcance (reach), impacto, confianza y esfuerzo; MoSCoW los clasifica en imprescindibles (must), deseables (should), opcionales (could) o descartados (won't) para una versión; y el modelo Kano distingue las expectativas básicas de las funcionalidades que entusiasman a los usuarios. Combino las puntuaciones con mi criterio: dependencias, deuda técnica que frena al equipo, compromisos con clientes y riesgos como el cumplimiento normativo. Comparto el razonamiento abiertamente con las partes interesadas para que entiendan por qué su petición no va primero, y reviso las prioridades con regularidad a medida que llegan nuevos datos.",
    explanation:
      "Los marcos hacen que la priorización sea explícita y se pueda debatir, pero apoyan el criterio en lugar de sustituirlo.",
    tips: ["Parte de los objetivos.", "Nombra uno o dos marcos.", "Explica cómo comunicas las decisiones."],
    commonMistakes: ["Priorizar según quién grita más.", "Aplicar un marco de puntuación de forma mecánica."],
    followUpQuestions: ["¿Cómo priorizas la deuda técnica frente a las funcionalidades?", "¿Cómo le dices que no a un cliente importante?"],
  },
  'job-011': {
    question: "¿Cómo defines las métricas de éxito de una nueva funcionalidad?",
    intent: "El entrevistador comprueba que piensas en resultados y que sabes medir.",
    expectedAnswer:
      "Parto del problema que debe resolver la funcionalidad y del cambio de comportamiento que esperamos. Por ejemplo, para un botón «guardar para más tarde» en una tienda online, el objetivo podría ser recuperar compras de usuarios que dudan. La métrica principal sería la tasa de conversión de los artículos guardados en compras en un plazo de 30 días. Añadiría la adopción, el porcentaje de usuarios que usan la funcionalidad, y métricas de control (guardrail) para asegurarnos de no perjudicar otra cosa, como la conversión global o la velocidad de la página. Defino los objetivos y el periodo de medición antes del lanzamiento, compruebo que el seguimiento está implementado y, si es posible, hago una prueba A/B para separar el efecto de la funcionalidad del de otros cambios.",
    explanation:
      "Las buenas métricas relacionan la funcionalidad con el comportamiento de los usuarios y el valor de negocio, incluyen métricas de control y se definen antes del lanzamiento.",
    tips: ["Relaciona las métricas con el problema.", "Añade métricas de adopción y de control.", "Define los objetivos antes del lanzamiento."],
    commonMistakes: ["Medir solo recuentos de uso.", "Elegir las métricas después de ver los resultados."],
    followUpQuestions: ["¿Qué es una métrica estrella polar (north star metric)?", "¿Y si la adopción es alta pero la métrica de negocio no se mueve?"],
  },
  'job-012': {
    question: "Háblame de una decisión de producto que tomaste a partir de una investigación con usuarios.",
    intent: "El entrevistador evalúa si te basas en evidencias de los usuarios y no en opiniones.",
    expectedAnswer:
      "Situación: nuestro equipo planeaba crear informes avanzados para una app de gestión de citas porque varios clientes grandes los habían pedido. Tarea: como product manager, quería confirmar que era la inversión más valiosa para el siguiente trimestre. Acción: entrevisté a doce clientes de distintos tamaños y analicé los tickets de soporte. Descubrí que solo los clientes grandes necesitaban informes avanzados, mientras que la mayoría de los clientes pequeños tenían dificultades con algo más sencillo: no entendían cómo configurar citas recurrentes, lo que provocaba muchas cancelaciones. Presenté los hallazgos al equipo y a las partes interesadas y propuse mejorar primero las citas recurrentes, con una función de exportación más ligera para los clientes grandes. Resultado: el nuevo flujo de citas recurrentes redujo un 40 % los tickets de soporte relacionados, y la retención de los clientes pequeños mejoró en el trimestre siguiente.",
    explanation:
      "Esta respuesta muestra métodos de investigación, un hallazgo que cambió el plan y resultados medibles, que es la esencia del trabajo de producto basado en evidencias.",
    tips: ["Describe el método de investigación.", "Muestra cómo el hallazgo cambió la decisión.", "Cuantifica el resultado."],
    commonMistakes: ["Usar la investigación solo para confirmar una decisión ya tomada.", "Basarte en un único cliente que hace mucho ruido."],
    followUpQuestions: ["¿Cómo elegiste a quién entrevistar?", "¿Cómo gestionaste a los clientes grandes que querían informes?"],
  },
  'job-013': {
    question: "¿Cómo abordarías la mejora del onboarding de una app móvil?",
    intent: "El entrevistador evalúa tu razonamiento de producto estructurado ante un problema abierto.",
    expectedAnswer:
      "Primero aclararía el objetivo: el onboarding funciona cuando los nuevos usuarios llegan al momento en que obtienen valor, por ejemplo al completar su primera reserva. Mediría el embudo desde la instalación hasta ese momento y buscaría dónde abandonan los usuarios, segmentando por canal y dispositivo. Después entendería el porqué, con grabaciones de sesiones, encuestas breves y algunas entrevistas con usuarios. Los problemas típicos son pedir demasiada información demasiado pronto, un valor poco claro o permisos solicitados sin contexto. Enumeraría hipótesis, por ejemplo «reducir el formulario de registro de siete campos a tres aumentará la tasa de finalización», las priorizaría según el impacto esperado y el esfuerzo, y probaría las más prometedoras con pruebas A/B. El éxito se mediría con la tasa de activación y la retención temprana, no solo con la finalización del registro.",
    explanation:
      "Un enfoque estructurado va del objetivo a los datos, de ahí a la comprensión de los usuarios y luego a las hipótesis y los experimentos, con la métrica de éxito adecuada.",
    tips: ["Define primero la activación.", "Combina investigación cuantitativa y cualitativa.", "Formula hipótesis que se puedan probar."],
    commonMistakes: ["Lanzarte directamente a rediseñar pantallas.", "Optimizar la finalización del registro mientras la activación sigue baja."],
    followUpQuestions: ["¿Qué es una métrica de activación?", "¿Cómo priorizarías tus hipótesis?"],
  },
  'job-014': {
    question: "Háblame de un producto o una funcionalidad que lanzaste y que no dio los resultados esperados.",
    intent: "El entrevistador evalúa tu sentido de la responsabilidad, tu aprendizaje y cómo reaccionas ante datos decepcionantes en un nivel sénior.",
    expectedAnswer:
      "Situación: lancé un programa de recomendación en una app de presupuestos personales, con la expectativa de que el 10 % de los nuevos registros vinieran de recomendaciones en tres meses. Tarea: al cabo de seis semanas, las recomendaciones solo representaban el 2 %. Tenía que decidir si mejorar, cambiar o detener el programa. Acción: analicé el embudo y vi que muchos usuarios abrían la pantalla de recomendación, pero muy pocos enviaban invitaciones. Las entrevistas revelaron que a la gente le incomodaba recomendar una app financiera porque lo sentía como compartir información privada, y que la recompensa, un mes prémium, no era lo bastante atractiva. Reconocí ante las partes interesadas que no había validado esta hipótesis antes del lanzamiento. Probamos dos cambios: un mensaje centrado en ahorrar en pareja y una recompensa para ambas personas. Resultado: las recomendaciones subieron al 6 %, por debajo del objetivo inicial, así que recomendé mantener el programa con un coste bajo e invertir el resto del presupuesto en otros canales. Desde entonces, valido las hipótesis clave con pruebas rápidas o entrevistas antes de construir.",
    explanation:
      "Las buenas respuestas combinan una responsabilidad honesta, un diagnóstico basado en datos, decisiones racionales sobre la inversión futura y un cambio duradero en la práctica.",
    tips: ["Indica los resultados esperados y los reales.", "Muestra el diagnóstico y la decisión.", "Explica qué cambiaste en tu proceso."],
    commonMistakes: ["Culpar a marketing o a ingeniería.", "Seguir invirtiendo sin evidencias."],
    followUpQuestions: ["¿Cómo decides cuándo dejar de invertir en una funcionalidad?", "¿Cómo validas las hipótesis antes de construir?"],
  },
  'job-015': {
    question: "¿Cómo diseñas e interpretas una prueba A/B?",
    intent: "El entrevistador evalúa competencias avanzadas de experimentación y tu conocimiento de la estadística.",
    expectedAnswer:
      "Parto de una hipótesis clara y una métrica principal, como «mostrar los gastos de envío en la página de producto aumentará la finalización de la compra», además de métricas de control. Estimo el tamaño de muestra necesario para detectar el efecto mínimo que importa, según la tasa de referencia, la potencia estadística deseada, normalmente del 80 %, y el nivel de significación, normalmente del 5 %; eso determina cuánto tiempo debe durar la prueba, idealmente semanas completas. Los usuarios se asignan al azar y permanecen en el mismo grupo. Evito detener la prueba en cuanto el resultado parece significativo, porque mirar los resultados repetidamente (peeking) aumenta los falsos positivos, salvo que usemos un método secuencial diseñado para ello. Al leer los resultados, miro el intervalo de confianza y no solo el p-valor, reviso las métricas de control y el desequilibrio en la proporción de la muestra (sample ratio mismatch), que indica un error en la asignación, y evito buscar resultados significativos en muchos segmentos. Un resultado no significativo sigue siendo información útil. Por último, tengo en cuenta la relevancia práctica: un aumento del 0,1 % estadísticamente significativo puede no justificar la complejidad.",
    explanation:
      "Una buena experimentación requiere hipótesis definidas de antemano, un tamaño de muestra adecuado, disciplina frente al peeking y una interpretación cuidadosa de los resultados.",
    tips: ["Menciona el tamaño de muestra y la potencia.", "Explica el problema del peeking.", "Distingue la significación estadística de la relevancia práctica."],
    commonMistakes: ["Detener la prueba en cuanto el resultado parece bueno.", "Probar muchas métricas e informar solo de la significativa."],
    followUpQuestions: ["¿Qué es el sample ratio mismatch?", "¿Qué harías si la prueba no muestra ninguna diferencia?"],
  },
  'job-016': {
    question: "¿Cómo construyes una hoja de ruta de producto alineada con la estrategia de la empresa?",
    intent: "El entrevistador evalúa tu pensamiento estratégico y tu capacidad para alinear a las partes interesadas en un nivel sénior.",
    expectedAnswer:
      "Parto de la estrategia y los objetivos de la empresa, por ejemplo crecer en las empresas medianas o mejorar la retención, y los traduzco en objetivos de producto para los próximos trimestres, a menudo como OKR con resultados clave medibles. Después identifico los problemas más importantes que nos separan de esos objetivos, a partir de datos, investigación con clientes, comentarios de ventas y soporte, y restricciones técnicas. La hoja de ruta se organiza por resultados y problemas y no como una larga lista de funcionalidades con fechas fijas: «Ahora» para el trabajo comprometido, «Siguiente» para las prioridades probables y «Más adelante» para las ideas en exploración. Reviso los borradores con ingeniería para la viabilidad, con ventas y marketing para el momento del mercado y con la dirección para el encaje estratégico, y hago explícitas las concesiones, incluido lo que no vamos a hacer. La comunico de manera distinta según el público y la reviso cada trimestre a medida que aprendemos. Los compromisos con fecha se reservan para los elementos con dependencias externas, como contratos o normativas.",
    explanation:
      "Una hoja de ruta basada en resultados relaciona la estrategia con los problemas y mantiene la flexibilidad, a la vez que deja claros las concesiones y los compromisos.",
    tips: ["Parte de la estrategia y los objetivos.", "Presenta una hoja de ruta basada en resultados.", "Explica cómo alineas a las partes interesadas."],
    commonMistakes: ["Prometer un año de funcionalidades con fechas fijas.", "Construir la hoja de ruta solo a partir de peticiones de clientes."],
    followUpQuestions: ["¿Cómo gestionas una petición de ventas que choca con la hoja de ruta?", "¿Cuál es la diferencia entre un resultado (outcome) y un entregable (output)?"],
  },
  'job-017': {
    question: "¿Qué hace un analista de negocio y qué valor aporta el puesto?",
    intent: "El entrevistador comprueba que entiendes el puesto y que sabes explicar su contribución a los proyectos.",
    expectedAnswer:
      "Un analista de negocio ayuda a una organización a entender sus necesidades y a definir soluciones que creen valor. En la práctica, trabajo con las partes interesadas para comprender los procesos y problemas actuales, hago el levantamiento de requisitos y los aclaro, modelo procesos y datos, escribo historias de usuario y criterios de aceptación, y ayudo al equipo de desarrollo o de implantación a construir lo correcto. También apoyo las pruebas y la adopción. El valor está en reducir los malentendidos entre los equipos de negocio y los técnicos, para que se construyan menos funcionalidades por motivos equivocados, y en tomar decisiones basadas en el análisis y no en suposiciones.",
    explanation:
      "El analista de negocio es un puente entre las necesidades del negocio y las soluciones. Explicar el valor en términos de menos retrabajo y mejores decisiones hace que la respuesta convenza.",
    tips: ["Describe actividades concretas.", "Explica el valor en términos de negocio."],
    commonMistakes: ["Describir el puesto como si solo consistiera en redactar documentos."],
    followUpQuestions: ["¿En qué se diferencia un analista de negocio de un product owner?", "¿Qué herramientas usas?"],
  },
  'job-018': {
    question: "¿Cómo haces el levantamiento de requisitos con las partes interesadas?",
    intent: "El entrevistador evalúa tus técnicas de levantamiento de requisitos y cómo descubres las necesidades reales.",
    expectedAnswer:
      "Uso varias técnicas según la situación. Las entrevistas con las partes interesadas clave me ayudan a entender los objetivos y los puntos de dolor; los talleres reúnen a las personas para acordar prioridades; observar a los usuarios mientras trabajan revela pasos y soluciones improvisadas que la gente olvida mencionar; y revisar documentos, informes y datos existentes aporta hechos. Hago preguntas abiertas y sigo preguntando «¿por qué?» para encontrar la necesidad que hay detrás de una solución solicitada; por ejemplo, la petición de «un nuevo informe» puede ser en realidad la necesidad de detectar antes los impagos. Documento los requisitos con claridad, los confirmo con las partes interesadas y llevo un registro de las preguntas abiertas.",
    explanation:
      "Combinar técnicas y buscar la necesidad que hay detrás de cada petición lleva a mejores soluciones que tomar las peticiones al pie de la letra.",
    tips: ["Nombra varias técnicas de levantamiento de requisitos.", "Muestra cómo encuentras la necesidad que hay detrás de una petición."],
    commonMistakes: ["Anotar las peticiones sin cuestionarlas.", "Hablar solo con los responsables y no con los usuarios finales."],
    followUpQuestions: ["¿Cómo gestionas a una parte interesada que no está disponible?", "¿Cómo validas los requisitos?"],
  },
  'job-019': {
    question: "¿Cómo escribes buenas historias de usuario y buenos criterios de aceptación?",
    intent: "El entrevistador comprueba competencias prácticas que se usan a diario en los equipos Agile.",
    expectedAnswer:
      "Una historia de usuario describe una necesidad desde el punto de vista del usuario: «Como responsable de almacén, quiero ver los pedidos con más de 24 horas de retraso para poder contactar con los clientes antes de que se quejen». Las buenas historias siguen los criterios INVEST: independientes, negociables, valiosas, estimables, pequeñas (small) y comprobables (testable). Los criterios de aceptación definen cuándo está terminada la historia, a menudo con el formato Dado-Cuando-Entonces: «Dado un pedido creado hace más de 24 horas y no enviado, cuando abro el panel, entonces el pedido aparece en la lista Retrasados con el contacto del cliente». Incluyo los casos límite y las necesidades no funcionales, como los permisos o el rendimiento, y comento las historias con el equipo antes del sprint para asegurarme de que todos las entienden de la misma manera.",
    explanation:
      "Las historias expresan valor; los criterios de aceptación las hacen comprobables. La conversación con el equipo importa tanto como el texto escrito.",
    example: "Dado un pedido de hace más de 24 horas que no se ha enviado\nCuando el responsable abre el panel\nEntonces el pedido aparece en «Retrasados» con el teléfono del cliente",
    tips: ["Incluye la parte «para poder» para expresar el valor.", "Escribe criterios de aceptación comprobables.", "Cubre los casos límite."],
    commonMistakes: ["Escribir tareas técnicas como historias de usuario.", "Dejar criterios de aceptación vagos, como «funciona correctamente»."],
    followUpQuestions: ["¿Cómo divides una historia demasiado grande?", "¿Quién escribe los criterios de aceptación en tu equipo?"],
  },
  'job-020': {
    question: "¿Cómo modelas y mejoras un proceso de negocio?",
    intent: "El entrevistador evalúa tus competencias de análisis de procesos y tu capacidad para encontrar mejoras.",
    expectedAnswer:
      "Empiezo documentando el proceso actual, el «as-is», con las personas que lo realizan, usando una notación clara como BPMN o un diagrama de calles (swimlane) sencillo que muestre quién hace qué, los pasos, las decisiones, los sistemas y los traspasos. Recojo datos de volúmenes, tiempos y errores para ver dónde se pierden tiempo y calidad. Los problemas habituales son la introducción de datos duplicada, las esperas de aprobaciones, las responsabilidades poco claras y las soluciones manuales improvisadas. Después diseño el proceso futuro, el «to-be», con las partes interesadas, eliminando pasos innecesarios, automatizando las tareas repetitivas y aclarando los responsables, y estimo las mejoras esperadas. Los cambios se prueban a pequeña escala antes del despliegue completo, y me aseguro de que las personas reciban formación y de que la documentación se actualice.",
    explanation:
      "La mejora de procesos combina el modelado visual, la medición y la participación de las personas que hacen el trabajo.",
    tips: ["Menciona los modelos as-is y to-be.", "Usa datos para encontrar los cuellos de botella.", "Involucra a quienes participan en el proceso."],
    commonMistakes: ["Diseñar el nuevo proceso sin entender el actual.", "Automatizar un mal proceso en lugar de simplificarlo."],
    followUpQuestions: ["¿Qué es un diagrama de calles (swimlane)?", "¿Cómo mides el éxito de un cambio de proceso?"],
  },
  'job-021': {
    question: "Háblame de una ocasión en la que dos departamentos no estaban de acuerdo sobre los requisitos.",
    intent: "El entrevistador evalúa tu capacidad de facilitación y de resolución de conflictos en un contexto de análisis de negocio.",
    expectedAnswer:
      "Situación: durante el rediseño de nuestro sistema de pedidos, ventas quería que los pedidos se confirmaran de inmediato a los clientes, mientras que finanzas exigía una comprobación de crédito antes de la confirmación. Tarea: como analista de negocio, tenía que definir un único proceso que ambos pudieran aceptar. Acción: hice el mapa del proceso actual con los dos equipos y reuní datos: el 85 % de los pedidos venía de clientes con un buen historial de crédito. Propuse una confirmación automática para los clientes dentro de su límite de crédito y una comprobación manual solo para el resto, con un tiempo máximo de respuesta de cuatro horas. Organicé un taller para revisar la propuesta, ajusté la regla del límite con finanzas y documenté el acuerdo con los dos responsables de departamento. Resultado: el 85 % de los pedidos se confirmó al instante, el riesgo de crédito siguió bajo control y ambos equipos aprobaron los requisitos sin escalado.",
    explanation:
      "Usar datos para encontrar una solución que responda a las preocupaciones reales de ambas partes es una competencia clave del analista de negocio.",
    tips: ["Explica las preocupaciones de ambas partes.", "Muestra los datos que ayudaron.", "Describe cómo se formalizó el acuerdo."],
    commonMistakes: ["Elegir la solución de una de las partes sin análisis.", "Escalar de inmediato a la dirección."],
    followUpQuestions: ["¿Qué habrías hecho si no hubiera sido posible ningún acuerdo?", "¿Cómo documentas las decisiones?"],
  },
  'job-022': {
    question: "¿Cómo usas los datos para respaldar una recomendación de negocio?",
    intent: "El entrevistador comprueba tus competencias analíticas y tu capacidad para convertir datos en decisiones.",
    expectedAnswer:
      "Parto de la pregunta de negocio, por ejemplo «¿por qué han aumentado las devoluciones de clientes?», y defino qué datos la responderían. Extraigo y limpio los datos, a menudo con SQL y una hoja de cálculo o una herramienta de BI, comprobando su calidad y sus limitaciones. Después los analizo: tendencias en el tiempo, segmentos como la categoría de producto o la región, y comparaciones con una referencia, buscando patrones con cuidado de no confundir correlación con causalidad. Por ejemplo, podría descubrir que las devoluciones aumentaron sobre todo en los productos de un proveedor tras un cambio de embalaje. Presento el resultado con un mensaje claro, unos pocos gráficos sencillos, el impacto estimado y una recomendación, junto con los supuestos y el nivel de confianza. Cuando es posible, propongo una prueba para confirmar la causa.",
    explanation:
      "Las buenas recomendaciones basadas en datos parten de una pregunta, respetan la calidad de los datos, comunican con claridad y proponen una validación.",
    tips: ["Parte de la pregunta de negocio.", "Menciona la calidad y las limitaciones de los datos.", "Termina con una recomendación y su impacto."],
    commonMistakes: ["Presentar muchos gráficos sin conclusión.", "Tratar una correlación como prueba de causalidad."],
    followUpQuestions: ["¿Qué consultas SQL escribes con más frecuencia?", "¿Cómo presentas los datos a la dirección?"],
  },
  'job-023': {
    question: "Háblame de una ocasión en la que descubriste, en una fase avanzada del proyecto, que un requisito se había malinterpretado.",
    intent: "El entrevistador evalúa tu sentido de la responsabilidad, tu capacidad de resolución de problemas y la mejora de procesos en un nivel avanzado.",
    expectedAnswer:
      "Situación: dos semanas antes de la puesta en producción de un nuevo módulo de facturación, las pruebas de aceptación de usuario mostraron que las facturas agrupaban las entregas por mes, mientras que el equipo de contabilidad necesitaba una factura por entrega para ciertos clientes. Tarea: yo había redactado el requisito, así que tenía que entender qué había fallado y encontrar una solución rápidamente. Acción: revisé la documentación y vi que había generalizado la regla a partir de entrevistas con el equipo de ventas sin validarla con contabilidad. Informé al jefe de proyecto y al patrocinador ese mismo día, con el impacto y las opciones. Con los desarrolladores, vimos que se podía añadir una opción de configuración por cliente en una semana. Validé la regla corregida con contabilidad mediante ejemplos concretos antes del desarrollo. Resultado: salimos a producción con una semana de retraso y con el comportamiento correcto. Desde entonces, valido las reglas de negocio con cada departamento afectado usando ejemplos reales y las incluyo en los criterios de aceptación.",
    explanation:
      "Asumir el error, comunicar rápidamente con opciones y cambiar tu práctica de validación es lo que buscan los entrevistadores.",
    tips: ["Explica cómo se produjo el malentendido.", "Muestra una comunicación rápida y con opciones.", "Describe el cambio de proceso."],
    commonMistakes: ["Culpar a las partes interesadas por explicaciones poco claras.", "Ocultar el problema hasta la puesta en producción."],
    followUpQuestions: ["¿Cómo validas los requisitos ahora?", "¿Cómo reaccionó el patrocinador?"],
  },
  'job-024': {
    question: "Un usuario dice que no puede conectarse a internet. ¿Cómo diagnosticas el problema?",
    intent: "El entrevistador comprueba que sigues un método de diagnóstico ordenado, la competencia central del soporte TI.",
    expectedAnswer:
      "Empiezo haciendo preguntas: si le pasa solo a este usuario o a varias personas, qué dispositivo, si es por cable o wifi, desde cuándo y si ha cambiado algo. Después compruebo de lo más sencillo a lo más complejo: si el wifi está activado o el cable conectado, si el dispositivo tiene una dirección IP con ipconfig o un comando similar, si llega a la puerta de enlace con ping y si la resolución de nombres funciona, haciendo ping a una dirección IP y luego a un nombre de dominio. Si solo falla el DNS, reviso la configuración DNS; si no hay dirección IP, miro el DHCP o el puerto de red. Reiniciar el adaptador de red o el dispositivo suele ayudar. Si hay varios usuarios afectados, compruebo el switch, el punto de acceso o la conexión a internet y escalo al equipo de redes. Documento los pasos y la solución en el ticket.",
    explanation:
      "Un enfoque por capas, desde el dispositivo del usuario hasta la red, encuentra el problema de forma eficiente y evita los arreglos al azar.",
    tips: ["Empieza con preguntas para delimitar el problema.", "Prueba paso a paso: enlace, IP, puerta de enlace, DNS.", "Documenta la resolución."],
    commonMistakes: ["Reiniciarlo todo sin entender la causa.", "No comprobar si hay otros usuarios afectados."],
    followUpQuestions: ["¿Qué indica una dirección IP que empieza por 169.254?", "¿Cuándo escalarías?"],
  },
  'job-025': {
    question: "Explica para qué sirven el DNS y el DHCP.",
    intent: "El entrevistador comprueba los conocimientos básicos de redes que se necesitan en los puestos de soporte.",
    expectedAnswer:
      "El DNS, Domain Name System o sistema de nombres de dominio, traduce los nombres que usan las personas, como www.example.com, en las direcciones IP que usan los ordenadores para conectarse. Cuando falla el DNS, los sitios web parecen inaccesibles aunque la red funcione, por eso un ping a una dirección IP puede seguir funcionando. El DHCP, Dynamic Host Configuration Protocol, asigna automáticamente a los dispositivos su configuración de red cuando se conectan: dirección IP, máscara de subred, puerta de enlace predeterminada y servidores DNS. Sin DHCP, habría que configurar cada dispositivo a mano. Un dispositivo que no consigue llegar a un servidor DHCP puede asignarse una dirección del rango 169.254, que no permite un acceso normal a la red.",
    explanation:
      "El DNS y el DHCP están detrás de muchos problemas de conexión cotidianos. Conocer su función ayuda a diagnosticar rápidamente.",
    tips: ["Usa analogías sencillas, como una guía telefónica para el DNS.", "Relaciona cada servicio con un síntoma típico."],
    commonMistakes: ["Confundir las funciones del DNS y del DHCP."],
    followUpQuestions: ["¿Cómo vaciarías la caché DNS de un ordenador?", "¿Qué es una concesión (lease) DHCP?"],
  },
  'job-026': {
    question: "Háblame de una ocasión en la que ayudaste a un usuario frustrado que no se sentía cómodo con la tecnología.",
    intent: "El entrevistador evalúa tu orientación al cliente, tu paciencia y tu comunicación con personas no técnicas.",
    expectedAnswer:
      "Situación: una contable llamó al servicio de asistencia muy nerviosa porque no podía acceder a una carpeta compartida una hora antes de una fecha límite. Tarea: tenía que resolver el problema rápidamente y tranquilizarla. Acción: la escuché, le aseguré que íbamos a encontrar una solución y evité la jerga técnica. Me conecté en remoto con su permiso y vi que su contraseña había caducado, lo que le había quitado el acceso a las unidades de red. La guie paso a paso para cambiar la contraseña, explicándole lo que hacía, y luego comprobé con ella que podía abrir sus archivos. También le mostré cómo ver el aviso de caducidad de la contraseña en el futuro. Resultado: cumplió su plazo, agradeció mi ayuda a mi responsable por correo electrónico y añadí una breve guía sobre la caducidad de contraseñas a nuestra base de conocimiento.",
    explanation:
      "Escuchar, usar un lenguaje claro, resolver el problema y evitar que se repita son los elementos clave de un buen soporte.",
    tips: ["Muestra empatía y un lenguaje sencillo.", "Explica cómo evitaste que se repitiera."],
    commonMistakes: ["Usar jerga técnica.", "Dar a entender que el usuario cometió un error «tonto»."],
    followUpQuestions: ["¿Cómo gestionas a un usuario que es grosero?", "¿Cómo escribes un buen artículo para la base de conocimiento?"],
  },
  'job-027': {
    question: "¿Cómo priorizas los tickets de soporte? Explica qué son los incidentes, los problemas y las solicitudes de servicio.",
    intent: "El entrevistador comprueba tus conocimientos de gestión de servicios al estilo ITIL y tu priorización en la práctica.",
    expectedAnswer:
      "En términos de ITIL, un incidente es una interrupción no planificada o una degradación de un servicio, como que el correo electrónico no funcione; el objetivo es restablecer el servicio rápidamente. Una solicitud de servicio es una petición estándar, como un nuevo portátil o el acceso a una aplicación. Un problema es la causa subyacente de uno o varios incidentes, que se investiga para evitar que vuelvan a ocurrir. Priorizo los tickets con una matriz de impacto y urgencia: el impacto es cuántas personas se ven afectadas o lo crítico que es el proceso de negocio, y la urgencia es la rapidez con la que hay que resolverlo. Un sistema financiero caído durante el cierre de mes tiene un impacto y una urgencia altos; el problema de impresora de un solo usuario, bajos. La prioridad determina los tiempos objetivo de respuesta y de resolución del acuerdo de nivel de servicio (SLA). Mantengo informados a los usuarios, escalo cuando los objetivos están en riesgo y vinculo los incidentes recurrentes a un registro de problema.",
    explanation:
      "Distinguir los tipos de ticket y usar el impacto y la urgencia hace que la priorización sea objetiva y esté alineada con las necesidades del negocio.",
    tips: ["Define con claridad los tres tipos.", "Explica la matriz de impacto y urgencia.", "Menciona los SLA."],
    commonMistakes: ["Atender los tickets solo por orden de llegada.", "Tratar los incidentes recurrentes uno a uno sin buscar la causa."],
    followUpQuestions: ["¿Qué es un incidente grave?", "¿Cómo reducirías el número de tickets recurrentes?"],
  },
  'job-028': {
    question: "Un usuario informa de un correo sospechoso y admite que hizo clic en el enlace. ¿Qué haces?",
    intent: "El entrevistador comprueba tu conciencia de la seguridad y la correcta gestión de un incidente en el primer nivel de soporte.",
    expectedAnswer:
      "Primero agradezco al usuario que lo haya notificado, porque informar rápido es justo lo que queremos, y mantengo la calma para que siga informando en el futuro. Le pregunto qué hizo exactamente: si introdujo una contraseña, descargó un archivo o abrió un adjunto. Si introdujo sus credenciales, restablezco la contraseña de inmediato, revoco las sesiones activas y compruebo que la autenticación multifactor esté activada. Si se descargó o abrió un archivo, desconecto el dispositivo de la red y sigo el procedimiento del equipo de seguridad, que puede incluir un análisis de malware o una reinstalación completa del equipo. Notifico el incidente al equipo de seguridad con el correo, preferiblemente como adjunto con sus cabeceras, para que puedan bloquear el remitente y los enlaces y comprobar si otros usuarios lo recibieron. Por último, lo documento todo en el ticket.",
    explanation:
      "La contención rápida, la protección de las credenciales, las pruebas para el equipo de seguridad y una actitud sin culpas son lo esencial.",
    tips: ["Agradece al usuario y evita culparlo.", "Distingue la introducción de credenciales de la ejecución de un archivo.", "Escala al equipo de seguridad con pruebas."],
    commonMistakes: ["Borrar el correo antes de que el equipo de seguridad lo analice.", "Reñir al usuario, lo que desanima futuras notificaciones."],
    followUpQuestions: ["¿Cómo reconoces un correo de phishing?", "¿Por qué son útiles las cabeceras de un correo?"],
  },
  'job-029': {
    question: "¿Cómo gestionas la creación y la eliminación de cuentas cuando los empleados entran o se van?",
    intent: "El entrevistador comprueba tus prácticas de gestión de accesos, que son fundamentales para la seguridad.",
    expectedAnswer:
      "Para las altas, trabajo a partir de una solicitud aprobada por el responsable o por RR. HH. y uso plantillas basadas en roles, de modo que las nuevas personas reciban exactamente los accesos que su puesto necesita, ni uno más. Las cuentas se crean antes del primer día, con una contraseña temporal que debe cambiarse y el registro en la autenticación multifactor. En los cambios de puesto, se retiran los accesos antiguos y no solo se añaden los nuevos, para evitar que se acumulen. Para las bajas, la notificación de RR. HH. activa una lista de comprobación: desactivar las cuentas a la hora exacta de salida, revocar sesiones y tokens, recuperar los dispositivos, transferir o archivar los datos según la política, retirar el acceso a los sistemas compartidos y a las herramientas de terceros, y cambiar las contraseñas compartidas que la persona conocía. Cuando es posible, esto se automatiza mediante un sistema de gestión de identidades conectado a los datos de RR. HH. Las revisiones periódicas de accesos con los responsables detectan permisos olvidados.",
    explanation:
      "Los procesos de altas, cambios y bajas con mínimo privilegio y una retirada a tiempo de los accesos evitan muchos incidentes de seguridad.",
    tips: ["Cubre las altas, los cambios y las bajas.", "Menciona el acceso basado en roles y las revisiones de accesos."],
    commonMistakes: ["Dejar cuentas activas tras las salidas.", "Copiar los accesos de un compañero para una nueva incorporación."],
    followUpQuestions: ["¿Qué harías con una cuenta compartida?", "¿Cómo gestionas los despidos urgentes?"],
  },
  'job-030': {
    question: "Una caída grave afecta a cientos de usuarios. ¿Cómo gestionas el soporte durante el incidente?",
    intent: "El entrevistador evalúa tus competencias avanzadas de coordinación y comunicación durante una crisis.",
    expectedAnswer:
      "Primero confirmaría rápidamente el alcance y declararía un incidente grave según nuestro proceso, para que participen los equipos adecuados y un responsable de incidentes. Del lado del soporte, crearía un ticket maestro y vincularía a él todas las notificaciones de los usuarios, para no gestionar cientos de duplicados. Publicaría un mensaje de estado lo antes posible, en el portal de servicio, por correo electrónico o con un mensaje telefónico automático, indicando qué está afectado, que los equipos están trabajando en ello y cuándo llegará la próxima actualización, y luego lo actualizaría con regularidad aunque no hubiera novedades. Daría al equipo de soporte un guion breve y las soluciones alternativas si las hay, y recogería información útil para los equipos técnicos, como ubicaciones o mensajes de error. Los usuarios críticos para el negocio, como un equipo con una fecha límite regulatoria, tendrían un contacto prioritario. Tras la resolución, confirmaría con los usuarios que el servicio se ha restablecido, cerraría los tickets vinculados con un mensaje claro y aportaría la visión del soporte a la revisión posterior al incidente, por ejemplo sobre los retrasos en la comunicación.",
    explanation:
      "Durante los incidentes graves, el soporte protege a los equipos técnicos del ruido, mantiene informados a los usuarios y recoge información útil.",
    tips: ["Menciona los tickets maestros y las notificaciones vinculadas.", "Describe una comunicación de estado periódica.", "Incluye la revisión posterior al incidente."],
    commonMistakes: ["Responder a cada llamada por separado sin un mensaje común.", "Comunicar solo cuando el problema está resuelto."],
    followUpQuestions: ["¿Qué debe contener un mensaje de estado?", "¿Cómo priorizas a los usuarios durante una caída?"],
  },
};
