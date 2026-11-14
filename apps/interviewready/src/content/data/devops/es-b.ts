import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de DevOps 023-045: Git (parte), nube, monitorización, seguridad. */
export const esB: TextTable<QuestionText> = {
  'ops-023': {
    question: "Compara GitFlow y el trunk-based development.",
    intent: "El entrevistador comprueba que conoces las estrategias de ramificación y cómo influyen en la velocidad de entrega y en el trabajo en equipo.",
    expectedAnswer:
      "GitFlow usa ramas de larga duración: main para el código publicado, develop para la integración, además de ramas feature, release y hotfix. Encaja con productos de lanzamientos planificados y varias versiones mantenidas, pero las ramas viven mucho tiempo, los merges son más grandes y los problemas de integración aparecen tarde. El trunk-based development mantiene una única rama principal; los desarrolladores integran cambios pequeños al menos una vez al día, con ramas de vida corta y pull requests o haciendo commit directamente, y las funcionalidades incompletas se ocultan tras feature flags. Permite la integración y la entrega continuas, revisiones más pequeñas y menos conflictos de merge, pero exige buenas pruebas automatizadas y disciplina. La mayoría de los equipos que practican la entrega continua prefieren el trunk-based development, a veces con ramas de release cuando deben mantener versiones antiguas.",
    explanation:
      "La diferencia clave es la vida de las ramas. Ramas de vida corta significan una integración más temprana y menos merges dolorosos.",
    tips: ["Describe las ramas de cada modelo.", "Relaciona el trunk-based development con los feature flags y la CI."],
    commonMistakes: ["Mantener ramas feature abiertas durante semanas y llamarlo integración continua."],
    followUpQuestions: ["¿Cómo apoyan los feature flags al trunk-based development?", "¿Cuándo seguiría teniendo sentido GitFlow?"],
  },
  'ops-024': {
    question: "¿Cómo gestionas los conflictos de merge y cómo escribes buenos commits?",
    intent: "El entrevistador comprueba tus hábitos cotidianos de colaboración con Git.",
    expectedAnswer:
      "Para reducir los conflictos, mantengo ramas de vida corta, hago pull o rebase desde main con regularidad y evito cambios grandes sin relación, como un reformateo masivo mezclado con funcionalidades. Cuando surge un conflicto, leo ambos lados para entender la intención de cada cambio, no me limito a elegir uno, lo resuelvo, ejecuto las pruebas y, si el conflicto está en código que no conozco bien, pregunto al otro autor. En cuanto a los commits, hago commits pequeños y enfocados, cada uno con un único propósito y sin romper el build, con un mensaje claro: un resumen breve en modo imperativo, como «Fix rounding in invoice totals», y un cuerpo que explique el porqué cuando no es evidente. Muchos equipos siguen Conventional Commits, como feat: o fix:, lo que además permite generar changelogs y versiones automáticamente.",
    explanation:
      "Un buen historial facilita las revisiones, la depuración con git bisect y la reversión segura de cambios. Entender ambos lados de un conflicto evita perder trabajo.",
    tips: ["Explica cómo resuelves los conflictos de forma segura.", "Da un ejemplo de buen mensaje de commit."],
    commonMistakes: ["Resolver los conflictos eligiendo siempre «ours» sin leer el otro cambio.", "Mensajes de commit como «fix» o «wip» en ramas compartidas."],
    followUpQuestions: ["¿Qué son los Conventional Commits?", "¿Cómo divides un cambio grande en commits fáciles de revisar?"],
  },
  'ops-025': {
    question: "¿Cómo deshaces cambios en Git? Explica revert, reset y reflog.",
    intent: "El entrevistador comprueba tu capacidad para recuperarte de errores de forma segura.",
    expectedAnswer:
      "git revert crea un nuevo commit que deshace los cambios de un commit anterior; el historial se conserva, por lo que es la opción segura en ramas compartidas como main. git reset mueve el puntero de la rama actual a otro commit: con --soft los cambios deshechos quedan en el staging, con --mixed, la opción por defecto, quedan en el directorio de trabajo, y con --hard se descartan. Reset reescribe el historial y solo debe usarse en ramas locales o privadas. git restore descarta los cambios no confirmados en los archivos. git reflog registra a dónde apuntaban HEAD y las ramas recientemente, incluso después de resets o rebases, así que permite encontrar un commit «perdido» y recuperarlo con git reset o git branch. Los commits rara vez se pierden de verdad hasta que el garbage collection elimina los objetos inalcanzables, normalmente al cabo de semanas.",
    explanation:
      "Revert para el historial compartido, reset para el historial local y reflog para recuperar. Este conocimiento convierte los errores con Git en incidentes menores.",
    tips: ["Contrasta revert y reset según su efecto en el historial compartido.", "Menciona reflog para la recuperación."],
    commonMistakes: ["Usar git reset --hard en una rama compartida y hacer force-push.", "Pensar que un commit eliminado con reset se ha perdido para siempre."],
    followUpQuestions: ["¿Cómo desharías un commit de merge?", "¿Contra qué protege git push --force-with-lease?"],
  },
  'ops-026': {
    question: "¿Cuáles son las ventajas y desventajas de un monorepo frente a varios repositorios?",
    intent: "El entrevistador comprueba tu criterio arquitectónico sobre la organización del código a escala de equipo.",
    expectedAnswer:
      "Un monorepo contiene muchos proyectos en un solo repositorio. Ventajas: el código y las herramientas compartidas son fáciles de reutilizar, un cambio que afecta a varios proyectos puede hacerse de forma atómica en un solo pull request, las versiones de las dependencias pueden mantenerse coherentes y la refactorización entre límites es más sencilla. Desventajas: el repositorio puede volverse grande y lento sin las herramientas adecuadas, la CI debe ser lo bastante inteligente para compilar solo lo que cambió, el control de acceso es menos granular y los archivos compartidos, como los lockfiles o las configuraciones raíz, se convierten en puntos de fricción entre equipos. Varios repositorios, o polyrepo, ofrecen un aislamiento fuerte, permisos independientes y una CI sencilla por repositorio, pero compartir código exige publicar paquetes, los cambios coordinados entre repositorios son más difíciles y las versiones divergen. La elección depende del tamaño del equipo, de lo acoplados que estén los proyectos y de las herramientas que la organización pueda mantener, como Nx, Turborepo o Bazel para monorepos.",
    explanation:
      "Ningún enfoque es mejor en todos los casos; el compromiso está entre la facilidad de coordinación y el aislamiento, y depende mucho de las herramientas.",
    tips: ["Da ventajas y desventajas de ambos.", "Menciona las herramientas y la propiedad de los archivos compartidos."],
    commonMistakes: ["Elegir un monorepo sin herramientas para compilar solo lo afectado.", "Dividir código muy acoplado en muchos repositorios."],
    followUpQuestions: ["¿Cómo mantienes rápida la CI en un monorepo?", "¿Cómo gestionas la propiedad del código en un monorepo?"],
  },
  'ops-027': {
    question: "Alguien hizo commit de un secreto, como una clave de API, y lo subió a un repositorio compartido. ¿Qué haces?",
    intent: "El entrevistador evalúa a nivel avanzado tu respuesta ante incidentes, tu conocimiento del historial de Git y tus prioridades de seguridad.",
    expectedAnswer:
      "La primera prioridad es considerar el secreto comprometido, porque puede que ya lo hayan copiado bots que escanean los repositorios públicos en cuestión de minutos, o cualquier persona con acceso. Revocaría o rotaría de inmediato la credencial en el proveedor y la reemplazaría en los sistemas que la usan, y luego revisaría los logs del proveedor en busca de usos no autorizados durante el periodo de exposición. Eliminar el secreto del último commit no basta, porque sigue en el historial. Si es necesario, por ejemplo en un repositorio público, reescribiría el historial con git filter-repo o BFG para eliminarlo, haría force-push en coordinación con el equipo, pediría a todos que vuelvan a clonar o hagan reset, y pediría a la plataforma de alojamiento que limpie las vistas en caché y las referencias de los pull requests. Documentaría el incidente y su impacto. Para evitar que se repita, añadiría escaneo de secretos en hooks de pre-commit y en la CI, como gitleaks o la push protection de la plataforma, movería los secretos a un vault o a variables de CI, y añadiría patrones al .gitignore para los archivos de configuración locales.",
    explanation:
      "La rotación va primero; limpiar el historial es secundario. Los candidatos avanzados saben que borrar un commit no elimina la exposición y añaden controles preventivos.",
    tips: ["Empieza por revocar y rotar el secreto.", "Explica por qué borrar el archivo no basta.", "Añade medidas de prevención."],
    commonMistakes: ["Limitarse a borrar el archivo en un nuevo commit.", "Reescribir el historial antes de rotar la credencial."],
    followUpQuestions: ["¿Cómo funciona la push protection para secretos?", "¿Cómo comprobarías si un atacante usó la clave?"],
  },
  'ops-028': {
    question: "¿Qué son IaaS, PaaS, SaaS y serverless?",
    intent: "El entrevistador comprueba que conoces los modelos básicos de servicio en la nube y sus responsabilidades.",
    expectedAnswer:
      "Describen cuánto gestiona el proveedor. Con Infrastructure as a Service, como las máquinas virtuales de AWS EC2 o Azure VMs, el proveedor gestiona el hardware y la virtualización, y tú gestionas el sistema operativo, el runtime y la aplicación. Con Platform as a Service, como Heroku, Google App Engine o las bases de datos gestionadas, despliegas código o usas un servicio y el proveedor gestiona los servidores, los parches y el escalado. Con Software as a Service, como Gmail o Salesforce, simplemente usas una aplicación terminada. Serverless, como AWS Lambda o Cloud Functions, ejecuta tu código en respuesta a eventos, escala automáticamente, incluso hasta cero, y factura por ejecución. Cuanto más gestiona el proveedor, menos control tienes, pero menos trabajo operativo haces. La seguridad sigue un modelo de responsabilidad compartida.",
    explanation:
      "Cada modelo reparte de otra forma las responsabilidades entre tú y el proveedor. Entenderlo ayuda a elegir servicios y a asignar las tareas de seguridad.",
    tips: ["Da un ejemplo por modelo.", "Menciona el modelo de responsabilidad compartida."],
    commonMistakes: ["Pensar que el proveedor de nube es responsable de toda la seguridad."],
    followUpQuestions: ["¿Cuáles son los inconvenientes de las funciones serverless?", "¿Qué es un cold start?"],
  },
  'ops-029': {
    question: "¿Qué son las regiones y las zonas de disponibilidad, y cómo diseñas para la alta disponibilidad?",
    intent: "El entrevistador comprueba los conceptos fundamentales de resiliencia en la nube.",
    expectedAnswer:
      "Una región es un área geográfica, como Fráncfort o Virginia, que contiene varias zonas de disponibilidad. Una zona de disponibilidad es uno o varios centros de datos con alimentación eléctrica, refrigeración y red independientes, lo bastante cercanos para tener baja latencia entre zonas. Para que una aplicación sea de alta disponibilidad, ejecutaría varias instancias repartidas en al menos dos o tres zonas detrás de un balanceador de carga, usaría bases de datos gestionadas con una réplica en espera en otra zona y failover automático, y guardaría los archivos en servicios que replican entre zonas, como el almacenamiento de objetos. La aplicación debe ser stateless y guardar las sesiones en un almacén compartido, para que cualquier instancia pueda atender cualquier petición. Desplegar en varias regiones protege frente a la caída completa de una región, pero es mucho más complejo y costoso, así que se reserva para sistemas críticos.",
    explanation:
      "Repartir los recursos entre zonas protege frente a fallos de un centro de datos con un coste moderado. El multirregión es una inversión mayor que deben justificar las necesidades del negocio.",
    tips: ["Explica la diferencia entre regiones y zonas.", "Menciona los balanceadores de carga, las instancias stateless y el failover de la base de datos."],
    commonMistakes: ["Ejecutar todas las instancias en una sola zona.", "Guardar las sesiones de usuario en la memoria de un único servidor."],
    followUpQuestions: ["¿Cuál es la diferencia entre alta disponibilidad y recuperación ante desastres?", "¿Cómo funciona el failover de una base de datos?"],
  },
  'ops-030': {
    question: "¿Cómo diseñarías una aplicación web escalable en una plataforma en la nube?",
    intent: "El entrevistador comprueba tu diseño de sistemas con los bloques habituales de la nube.",
    expectedAnswer:
      "Pondría una CDN delante para servir los recursos estáticos y cachear contenido cerca de los usuarios, luego un balanceador de carga que reparta el tráfico entre instancias de aplicación stateless, en contenedores o en una plataforma gestionada, ejecutándose en varias zonas de disponibilidad con autoescalado según la carga. Los datos estarían en una base de datos relacional gestionada con una réplica en espera y réplicas de lectura, además de una caché como Redis para las lecturas frecuentes y las sesiones. Los archivos irían a un almacenamiento de objetos como S3. El trabajo lento o con picos, como enviar correos electrónicos o generar informes, se procesaría de forma asíncrona mediante una cola con instancias worker. Los secretos vendrían de un gestor de secretos, la infraestructura se definiría como código, y los logs, las métricas y las trazas se centralizarían con alertas. Empezaría de forma sencilla y añadiría componentes como colas o réplicas solo cuando el tráfico o los requisitos lo justifiquen, y estimaría los costes desde el principio.",
    explanation:
      "Cómputo stateless, servicios de datos gestionados, caché, colas y observabilidad son los bloques estándar de las arquitecturas escalables en la nube.",
    tips: ["Describe el recorrido de una petición desde el usuario hasta la base de datos.", "Menciona el procesamiento asíncrono.", "Muestra moderación con la complejidad."],
    commonMistakes: ["Diseñar para una escala masiva desde el primer día sin necesidad.", "Mantener estado en los servidores de aplicación."],
    followUpQuestions: ["¿Cómo gestionarías un pico repentino de tráfico diez veces superior al normal?", "¿Dónde pondrías el rate limiting?"],
  },
  'ops-031': {
    question: "¿Qué es Infrastructure as Code y cómo funciona Terraform?",
    intent: "El entrevistador comprueba que conoces las prácticas modernas de infraestructura y sus herramientas.",
    expectedAnswer:
      "Infrastructure as Code consiste en definir servidores, redes, bases de datos y permisos en archivos versionados en lugar de crearlos a mano en una consola. Los cambios se revisan en pull requests, son reproducibles entre entornos y el propio código los documenta. Terraform es una herramienta declarativa: describes los recursos deseados en HCL, terraform plan los compara con el estado actual y muestra qué se creará, cambiará o destruirá, y terraform apply aplica los cambios mediante las APIs de los providers. Terraform mantiene un archivo de estado que vincula tu configuración con los recursos reales; en equipo, debe guardarse en remoto, por ejemplo en un bucket de S3 o en Terraform Cloud, con bloqueo para evitar cambios concurrentes, y puede contener valores sensibles. Los módulos empaquetan infraestructura reutilizable, y un estado separado por entorno limita el impacto de los errores. OpenTofu es un fork de código abierto con el mismo modelo.",
    explanation:
      "La IaC lleva las prácticas del software a la infraestructura. Entender plan, apply y la gestión del estado es esencial para usar Terraform con seguridad.",
    tips: ["Explica plan y apply.", "Insiste en el estado remoto con bloqueo.", "Menciona los módulos y la separación de entornos."],
    commonMistakes: ["Hacer commit del archivo de estado en Git.", "Hacer cambios manuales en la consola que se desvían del código."],
    followUpQuestions: ["¿Cómo gestionas el drift entre Terraform y la realidad?", "¿Cómo importarías un recurso existente?"],
  },
  'ops-032': {
    question: "¿Cómo reducirías los costes en la nube de un sistema sin perjudicar su fiabilidad?",
    intent: "El entrevistador evalúa a nivel avanzado tu conciencia de los costes, una responsabilidad clave en los entornos en la nube.",
    expectedAnswer:
      "Empezaría por la visibilidad: etiquetar los recursos por equipo, servicio y entorno para poder atribuir los costes, y revisar las partidas más grandes, que suelen representar la mayor parte de la factura. Ahorros habituales: ajustar el tamaño de las instancias y de los requests de los contenedores según el uso real; apagar o reducir los entornos que no son de producción fuera del horario laboral; eliminar recursos sin uso, como balanceadores de carga inactivos, discos huérfanos, snapshots antiguos y entornos de prueba olvidados; usar autoescalado para que la capacidad siga a la demanda; comprometer el uso base estable con reserved instances o savings plans, y usar instancias spot o preemptible para cargas tolerantes a fallos, como trabajos batch o runners de CI; mover los datos poco consultados a niveles de almacenamiento más baratos con políticas de ciclo de vida; reducir los costes de transferencia de datos, que a menudo se pasan por alto, manteniendo el tráfico dentro de una zona o región y usando una CDN; y revisar la retención de logs y monitorización, que puede resultar sorprendentemente cara. Definiría presupuestos y alertas de anomalías, y convertiría el coste en una métrica visible para los equipos, siguiendo las prácticas de FinOps. Cada cambio debe contrastarse con los objetivos de fiabilidad: por ejemplo, no eliminaría la redundancia entre zonas de una base de datos crítica para ahorrar dinero.",
    explanation:
      "La optimización de costes es continua y se basa en datos. Los candidatos avanzados conocen los factores de coste menos evidentes, como la transferencia de datos y la observabilidad, y equilibran el ahorro con la fiabilidad.",
    tips: ["Empieza por el etiquetado y la visibilidad.", "Enumera varias palancas concretas.", "Explica cómo proteges la fiabilidad."],
    commonMistakes: ["Recortar la redundancia de sistemas críticos para ahorrar dinero.", "Optimizar partidas pequeñas ignorando los costes más grandes."],
    followUpQuestions: ["¿Qué es FinOps?", "¿Cuándo son una mala idea las instancias spot?"],
  },
  'ops-033': {
    question: "¿Cómo diseñarías la recuperación ante desastres de una aplicación crítica? Explica RPO y RTO.",
    intent: "El entrevistador evalúa a nivel avanzado tu planificación de la resiliencia y su relación con los requisitos del negocio.",
    expectedAnswer:
      "El Recovery Point Objective, RPO, es la pérdida máxima de datos aceptable medida en tiempo, por ejemplo 5 minutos de transacciones. El Recovery Time Objective, RTO, es el tiempo máximo aceptable para restablecer el servicio, por ejemplo una hora. Ambos los define el negocio, según el coste de la indisponibilidad y de la pérdida de datos, y determinan el diseño. Las estrategias van de la más barata a la más cara: backup and restore, con copias de seguridad periódicas copiadas a otra región, ofrece un RPO de horas y un RTO de horas; pilot light mantiene una copia mínima de la infraestructura y los datos replicados en una segunda región, lista para escalar; warm standby ejecuta una copia más pequeña pero operativa; y active-active ejecuta la capacidad completa en varias regiones con un RPO y un RTO casi nulos, con un coste y una complejidad elevados, sobre todo para la consistencia de los datos. Sea cual sea la estrategia, las copias de seguridad deben estar automatizadas, cifradas, almacenadas por separado y ser inmutables para resistir el ransomware o el borrado accidental, y la infraestructura debe poder reproducirse con Infrastructure as Code. Lo más importante es probar el plan con regularidad mediante pruebas de restauración y ejercicios de failover, porque una copia de seguridad no probada no es una copia de seguridad. Los runbooks, una autoridad clara para declarar un desastre y los procedimientos de failover de DNS o de tráfico completan el plan.",
    explanation:
      "El RPO y el RTO traducen las necesidades del negocio en decisiones técnicas. Los candidatos avanzados insisten en las pruebas periódicas y en las copias de seguridad inmutables.",
    tips: ["Define el RPO y el RTO con ejemplos.", "Compara las estrategias de recuperación ante desastres según su coste.", "Insiste en probar las restauraciones."],
    commonMistakes: ["Tener copias de seguridad que nunca se restauraron en una prueba.", "Guardar las copias de seguridad en la misma cuenta y región que producción."],
    followUpQuestions: ["¿Con qué frecuencia probarías el failover?", "¿Cómo gestionas la consistencia de los datos en una configuración active-active?"],
  },
  'ops-034': {
    question: "¿Cuál es la diferencia entre logs, métricas y trazas?",
    intent: "El entrevistador comprueba los conceptos básicos de observabilidad.",
    expectedAnswer:
      "Los logs son registros de eventos con marca de tiempo, como un error con su stack trace o el inicio de sesión de un usuario; aportan mucho detalle sobre eventos individuales. Las métricas son medidas numéricas agregadas en el tiempo, como las peticiones por segundo, la tasa de errores, los percentiles de latencia o el uso de memoria; son baratas de almacenar e ideales para dashboards y alertas. Las trazas siguen una única petición a medida que atraviesa varios servicios, mostrando cada paso, llamado span, y cuánto duró, lo que ayuda a encontrar dónde se va el tiempo o dónde empezó un error en un sistema distribuido. Juntos son los tres pilares de la observabilidad: las métricas te dicen que algo va mal, las trazas muestran dónde y los logs explican por qué.",
    explanation:
      "Cada señal responde a una pregunta distinta. Usarlas juntas acelera el diagnóstico.",
    tips: ["Da un ejemplo de cada señal.", "Explica cómo se complementan."],
    commonMistakes: ["Depender solo de los logs para todo.", "Usar promedios en lugar de percentiles para la latencia."],
    followUpQuestions: ["¿Por qué usar la latencia p95 o p99 en lugar de promedios?", "¿Qué es OpenTelemetry?"],
  },
  'ops-035': {
    question: "¿Qué monitorizarías en un servicio web? Explica las golden signals.",
    intent: "El entrevistador comprueba tu capacidad para elegir métricas significativas en lugar de recopilarlo todo.",
    expectedAnswer:
      "Empezaría por las cuatro golden signals de las prácticas de Site Reliability Engineering de Google. Latencia: cuánto tardan las peticiones, medida con percentiles como p50, p95 y p99, separando las peticiones correctas de las fallidas. Tráfico: la demanda sobre el sistema, como las peticiones por segundo. Errores: la tasa de peticiones fallidas, incluidos los HTTP 5xx y las respuestas técnicamente correctas pero erróneas. Saturación: cuán lleno está el sistema, como la CPU, la memoria, los pools de conexiones, la longitud de las colas o el disco. El método RED, rate, errors y duration, aplica la misma idea a cada servicio, y el método USE, utilisation, saturation y errors, la aplica a los recursos. Además, seguiría métricas de negocio, como los pedidos por minuto o los registros, que a menudo revelan problemas que las métricas técnicas no detectan, y las dependencias, como la latencia de la base de datos y de las APIs externas.",
    explanation:
      "Un pequeño conjunto de métricas centradas en el usuario detecta la mayoría de los problemas. Las métricas de negocio cierran la brecha entre la salud técnica y el impacto real.",
    tips: ["Nombra las cuatro golden signals.", "Menciona RED y USE.", "Añade métricas de negocio."],
    commonMistakes: ["Monitorizar solo la CPU y la memoria.", "Usar la latencia media, que oculta las peticiones lentas."],
    followUpQuestions: ["¿Sobre cuáles de estas señales pondrías alertas?", "¿Cómo monitorizarías un trabajo en segundo plano?"],
  },
  'ops-036': {
    question: "¿Qué son el registro estructurado y los correlation IDs, y por qué son importantes?",
    intent: "El entrevistador comprueba las prácticas que hacen útiles los logs en sistemas distribuidos.",
    expectedAnswer:
      'El registro estructurado escribe los logs como datos clave-valor, normalmente en JSON, en lugar de texto libre: por ejemplo {"level":"error","event":"payment_failed","orderId":"42","provider":"stripe","durationMs":830}. Así, las plataformas de logs pueden filtrar, agregar y alertar sobre los campos de forma fiable. Un correlation ID o trace ID es un identificador único que se asigna cuando una petición entra en el sistema y que se propaga por cada servicio, mensaje y línea de log que toca, normalmente mediante cabeceras HTTP como la cabecera traceparent del W3C. Cuando un usuario informa de un problema, puedes buscar un solo ID y ver todo el recorrido entre servicios. OpenTelemetry estandariza esta propagación y vincula logs, trazas y métricas. Los logs deben usar nombres de campo coherentes, niveles adecuados y no contener nunca secretos ni datos personales innecesarios.',
    explanation:
      "La estructura hace que los logs se puedan consultar; los correlation IDs permiten seguirlos entre servicios. Ambos son esenciales en cuanto hay más de una aplicación.",
    example: "logger.info(\"order_created\", { orderId, customerId, totalCents, traceId });",
    tips: ["Muestra un ejemplo de log estructurado.", "Explica la propagación del ID entre servicios.", "Menciona la privacidad en los logs."],
    commonMistakes: ["Registrar contraseñas, tokens o números de tarjeta completos.", "Construir mensajes de log por concatenación de cadenas que no se pueden filtrar."],
    followUpQuestions: ["¿Cómo propagas un trace ID a través de una cola de mensajes?", "¿Cómo controlas los costes de logging?"],
  },
  'ops-037': {
    question: "¿Qué hace que una alerta sea buena y cómo evitas la fatiga de alertas?",
    intent: "El entrevistador comprueba tu madurez operativa y tu empatía hacia los ingenieros de guardia.",
    expectedAnswer:
      "Una buena alerta es accionable: señala un impacto real o inminente sobre los usuarios y requiere que alguien haga algo ya. Debe alertar sobre síntomas, como una tasa de errores o una latencia elevadas en un endpoint clave, más que sobre cada causa posible, como una CPU al 80 %, que puede ser inofensiva. Cada alerta debe incluir contexto: qué servicio, el valor actual y el umbral, un enlace a un dashboard y un runbook que explique los primeros pasos. Los niveles de severidad separan los avisos urgentes, que despiertan a alguien, de los tickets que pueden esperar al horario laboral. Para evitar la fatiga, reviso las alertas con regularidad, elimino o ajusto las que saltan sin que se haga nada, agrupo las alertas relacionadas, exijo que una condición dure unos minutos antes de disparar para evitar el ruido de picos breves y hago seguimiento de la frecuencia con la que salta cada alerta. Después de los incidentes, compruebo si las alertas detectaron el problema con suficiente antelación.",
    explanation:
      "Las alertas compiten por la atención humana. Las alertas accionables, basadas en síntomas y con runbooks, protegen tanto la fiabilidad como al equipo de guardia.",
    tips: ["Distingue los síntomas de las causas.", "Menciona los runbooks y los niveles de severidad.", "Explica cómo revisas las alertas ruidosas."],
    commonMistakes: ["Avisar a la gente por problemas que no son urgentes.", "Tener alertas sin ninguna respuesta documentada."],
    followUpQuestions: ["¿Qué pondrías en un runbook?", "¿Cómo organizarías una rotación de guardias de forma justa?"],
  },
  'ops-038': {
    question: "Explica los SLI, los SLO y los presupuestos de errores, y cómo orientan las decisiones.",
    intent: "El entrevistador evalúa a nivel avanzado tu ingeniería de fiabilidad y su relación con las decisiones de producto.",
    expectedAnswer:
      "Un Service Level Indicator es una medida de la experiencia del usuario, como el porcentaje de peticiones que tienen éxito y responden en menos de 300 milisegundos. Un Service Level Objective es un objetivo para ese indicador durante un periodo, por ejemplo un 99,9 % de peticiones correctas en 30 días. Un Service Level Agreement es un compromiso contractual, normalmente menos exigente que el SLO, con penalizaciones. El presupuesto de errores es lo que el SLO permite que falle: el 0,1 % de las peticiones, o unos 43 minutos de indisponibilidad total en 30 días. El presupuesto convierte la fiabilidad en una herramienta de decisión compartida: mientras queda presupuesto, los equipos pueden publicar más rápido y asumir riesgos; cuando se consume rápidamente o se agota, la política acordada es frenar los lanzamientos y priorizar el trabajo de fiabilidad. Las alertas pueden basarse en el burn rate, la velocidad a la que se consume el presupuesto, lo que detecta rápidamente los problemas graves y la degradación lenta a lo largo del tiempo con menos falsas alarmas. Los SLO deben elegirse con los responsables de producto según lo que los usuarios necesitan de verdad, porque el 100 % ni es alcanzable ni compensa su coste.",
    explanation:
      "Los SLO hacen que la fiabilidad sea medible y negociable. Los presupuestos de errores equilibran la velocidad de desarrollo y la estabilidad con datos en lugar de opiniones.",
    tips: ["Da definiciones precisas con cifras.", "Explica la política del presupuesto de errores.", "Menciona las alertas por burn rate."],
    commonMistakes: ["Fijar el 100 % como objetivo.", "Definir los SLO sobre métricas de infraestructura en lugar de la experiencia del usuario."],
    followUpQuestions: ["¿Cómo elegirías el SLO adecuado para un servicio nuevo?", "¿Qué ocurre cuando se agota el presupuesto de errores?"],
  },
  'ops-039': {
    question: "¿Qué retos aparecen al operar la observabilidad a gran escala y cómo los gestionas?",
    intent: "El entrevistador evalúa a nivel avanzado tu comprensión de los costes y compromisos de la observabilidad.",
    expectedAnswer:
      "El primer reto es el volumen y el coste: los logs, las métricas y las trazas de cientos de servicios pueden costar tanto como la propia infraestructura. Definiría la retención por tipo de dato, conservaría los logs de depuración solo poco tiempo, muestrearía las trazas, por ejemplo conservando todos los errores y las peticiones lentas pero solo un pequeño porcentaje de las normales con tail-based sampling, y convertiría los logs verbosos en métricas cuando sea posible. El segundo es la cardinalidad de las métricas: las etiquetas con muchos valores únicos, como los IDs de usuario o las URLs completas, crean millones de series temporales y sobrecargan sistemas como Prometheus, así que las etiquetas deben estar acotadas y revisarse. El tercero es la coherencia: si cada equipo nombra las cosas de forma distinta, la correlación se complica, así que estandarizaría con OpenTelemetry y convenciones semánticas compartidas, dashboards comunes y metadatos de propiedad de los servicios. El cuarto es la señal frente al ruido: demasiados dashboards y alertas que nadie usa, algo que se resuelve con alertas basadas en SLO y limpiezas periódicas. Por último, la privacidad: los logs y las trazas no deben contener datos personales ni secretos, lo que exige depurarlos en el momento de la recogida. A menudo, un equipo de plataforma interno proporciona estos estándares y pipelines para que los equipos de producto tengan buena observabilidad por defecto.",
    explanation:
      "A gran escala, la observabilidad necesita gobernanza: muestreo, control de la cardinalidad, estándares y filtrado de datos privados. Los candidatos avanzados la tratan como un producto con costes.",
    tips: ["Habla del coste y del muestreo.", "Explica el problema de la cardinalidad.", "Menciona los estándares y la privacidad."],
    commonMistakes: ["Usar IDs de usuario como etiquetas de métricas.", "Conservar todas las trazas y los logs para siempre."],
    followUpQuestions: ["¿Qué es el tail-based sampling?", "¿Cómo averiguarías qué servicio genera el mayor coste de logging?"],
  },
  'ops-040': {
    question: "¿Qué es el principio de mínimo privilegio y cómo lo aplicas?",
    intent: "El entrevistador comprueba un principio de seguridad fundamental.",
    expectedAnswer:
      "El principio de mínimo privilegio significa que cada usuario, aplicación o servicio recibe solo los permisos que necesita para hacer su trabajo, y solo durante el tiempo que los necesita. Por ejemplo, un servicio que lee archivos de un bucket de almacenamiento debe tener acceso de lectura solo a ese bucket, no derechos de administrador sobre la cuenta; el usuario de base de datos de una herramienta de informes debe ser de solo lectura. En la práctica, uso roles en lugar de compartir cuentas personales, separo las cuentas o proyectos de producción, doy a los administradores acceso elevado temporal cuando lo necesitan, reviso los permisos con regularidad y retiro los accesos cuando las personas cambian de puesto o se van. Esto limita el daño si una cuenta o una credencial se ve comprometida.",
    explanation:
      "El mínimo privilegio reduce el radio de impacto de los errores y los ataques. Es una expectativa básica en las revisiones de seguridad y las auditorías.",
    tips: ["Da ejemplos concretos para usuarios y servicios.", "Menciona las revisiones periódicas de accesos."],
    commonMistakes: ["Dar derechos de administrador para que algo funcione rápido.", "Compartir una única cuenta entre todo el equipo."],
    followUpQuestions: ["¿Qué es el control de acceso basado en roles?", "¿Cómo concederías acceso temporal a producción?"],
  },
  'ops-041': {
    question: "¿Cómo deben gestionar los secretos las aplicaciones y los equipos?",
    intent: "El entrevistador comprueba tu manejo práctico de las credenciales, una fuente frecuente de brechas de seguridad.",
    expectedAnswer:
      "Los secretos, como las contraseñas, las claves de API y los certificados, nunca deben guardarse en el código fuente ni subirse a Git, ni siquiera en repositorios privados. Deben estar en un gestor de secretos dedicado, como HashiCorp Vault, AWS Secrets Manager, Azure Key Vault o Google Secret Manager, que los cifra, controla el acceso por servicio y registra quién accedió a qué. Las aplicaciones reciben los secretos en tiempo de ejecución, mediante variables de entorno inyectadas por la plataforma, archivos montados o llamadas directas a la API, y los pipelines de CI/CD usan variables protegidas. Siempre que sea posible, prefiero credenciales de corta duración emitidas automáticamente, como las workload identities de la nube o las credenciales dinámicas de base de datos, frente a claves de larga duración. Los secretos deben rotarse con regularidad e inmediatamente después de cualquier sospecha de exposición, y el escaneo de secretos en repositorios y pipelines detecta los errores pronto.",
    explanation:
      "Un almacenamiento de secretos centralizado y auditado y las credenciales de corta duración reducen tanto la probabilidad como el impacto de las filtraciones.",
    tips: ["Nombra un gestor de secretos.", "Prefiere las credenciales de corta duración.", "Menciona la rotación y el escaneo."],
    commonMistakes: ["Escribir los secretos directamente en archivos de configuración.", "Mostrar secretos en los logs o en los mensajes de error."],
    followUpQuestions: ["¿Cómo rotas la contraseña de una base de datos sin indisponibilidad?", "¿Qué es una workload identity?"],
  },
  'ops-042': {
    question: "¿Contra qué vulnerabilidades web comunes debería protegerse todo equipo?",
    intent: "El entrevistador comprueba que conoces el OWASP Top 10 y las mitigaciones básicas.",
    expectedAnswer:
      "El OWASP Top 10 enumera los riesgos más críticos. El control de acceso roto, como que un usuario lea el pedido de otro cambiando un ID en la URL, se evita comprobando la autorización en el servidor en cada petición. La inyección, incluida la inyección SQL, se evita con consultas parametrizadas y validación de las entradas. El cross-site scripting se evita codificando la salida, usando frameworks que escapan por defecto y una Content Security Policy. Los fallos criptográficos se evitan usando HTTPS en todas partes, un hash robusto como bcrypt o Argon2 para las contraseñas y cifrando los datos sensibles en reposo. La configuración de seguridad incorrecta, como las credenciales por defecto o los mensajes de error demasiado detallados, se evita con valores por defecto endurecidos y revisiones. Los componentes vulnerables y obsoletos se gestionan con escaneo de dependencias y actualizaciones periódicas. Otros riesgos importantes son los fallos de autenticación, el server-side request forgery y un registro y una monitorización insuficientes. Las pruebas de seguridad en la CI y las revisiones de código ayudan a detectarlos pronto.",
    explanation:
      "La mayoría de las brechas explotan debilidades bien conocidas. Se espera que cualquier desarrollador o ingeniero DevOps conozca las categorías principales y sus mitigaciones estándar.",
    tips: ["Da un ejemplo concreto y una mitigación para cada riesgo.", "Menciona el control de acceso roto como el riesgo principal."],
    commonMistakes: ["Confiar en ocultar los IDs en lugar de comprobar los permisos.", "Construir consultas SQL por concatenación de cadenas."],
    followUpQuestions: ["¿Qué es el server-side request forgery?", "¿Cómo funciona una Content Security Policy?"],
  },
  'ops-043': {
    question: "¿Cómo funciona HTTPS y qué es el TLS mutuo?",
    intent: "El entrevistador comprueba que entiendes el cifrado en tránsito y la gestión de certificados.",
    expectedAnswer:
      "HTTPS es HTTP sobre TLS. Durante el handshake de TLS, el servidor presenta un certificado firmado por una autoridad de certificación de confianza, que demuestra que posee el dominio; el cliente verifica la cadena de certificados y el nombre de dominio. Después, cliente y servidor acuerdan claves de sesión mediante un intercambio de claves, de modo que el tráfico queda cifrado y protegido contra la manipulación. TLS 1.3 es la versión actual y las versiones antiguas, como TLS 1.0 y 1.1, deben desactivarse. Los certificados caducan, así que la renovación debe automatizarse, por ejemplo con Let's Encrypt y cert-manager en Kubernetes. El TLS mutuo añade la autenticación del cliente: el cliente también presenta un certificado que el servidor verifica. Se usa para la comunicación entre servicios en redes zero trust, a menudo gestionado automáticamente por un service mesh como Istio o Linkerd, y para la autenticación robusta de socios o dispositivos.",
    explanation:
      "TLS proporciona confidencialidad, integridad y autenticación del servidor; mTLS añade la autenticación del cliente. Automatizar la renovación de certificados evita una causa frecuente de caídas.",
    tips: ["Describe el handshake a alto nivel.", "Menciona la automatización de la renovación de certificados.", "Da un caso de uso de mTLS."],
    commonMistakes: ["Desactivar la verificación de certificados en los clientes para corregir errores.", "Gestionar manualmente la renovación de certificados."],
    followUpQuestions: ["¿Qué ocurre cuando caduca un certificado en producción?", "¿Cómo implementa mTLS un service mesh?"],
  },
  'ops-044': {
    question: "¿Qué significa un enfoque zero trust para la infraestructura en la nube y cómo lo implementarías?",
    intent: "El entrevistador evalúa a nivel avanzado tu arquitectura de seguridad más allá de las defensas perimetrales.",
    expectedAnswer:
      "Zero trust significa que ningún usuario, dispositivo o servicio es de confianza por su ubicación en la red; cada petición se autentica, se autoriza y se cifra, y el acceso se evalúa de forma continua. El modelo tradicional de una red interna de confianza detrás de un firewall falla en cuanto un atacante entra, porque puede moverse lateralmente. Para implementarlo, empezaría por una identidad sólida: single sign-on con autenticación multifactor para las personas, y workload identities, como los roles de IAM de la nube o las identidades SPIFFE, para los servicios en lugar de claves compartidas. El acceso se concede por recurso con mínimo privilegio y, para los administradores, mediante una elevación just-in-time y limitada en el tiempo con logs de auditoría. El tráfico entre servicios usa TLS mutuo con políticas de autorización, a menudo a través de un service mesh, y la segmentación de red limita qué cargas de trabajo pueden comunicarse entre sí, por ejemplo con network policies de Kubernetes que deniegan el tráfico por defecto. Las aplicaciones internas se exponen a través de un identity-aware proxy en lugar de una VPN que da un acceso amplio a la red. El estado del dispositivo puede formar parte de la decisión. Todos los accesos se registran de forma centralizada y se monitorizan en busca de anomalías. Es un camino progresivo: empezaría por los sistemas y las identidades más sensibles.",
    explanation:
      "Zero trust sustituye la ubicación en la red por la identidad y la verificación continua. Las respuestas avanzadas cubren personas, servicios, segmentación de red y monitorización, y plantean la adopción de forma incremental.",
    tips: ["Contrástalo con la seguridad perimetral.", "Cubre las identidades de personas y de cargas de trabajo.", "Menciona mTLS, la segmentación y los identity-aware proxies."],
    commonMistakes: ["Equiparar zero trust con comprar un único producto.", "Dejar redes internas planas en las que cualquier servicio puede llegar a cualquier otro."],
    followUpQuestions: ["¿Cómo migrarías de una VPN a un identity-aware proxy?", "¿Qué es SPIFFE?"],
  },
  'ops-045': {
    question: "Descubres que se han filtrado las credenciales de tu cuenta de nube de producción. Explícame paso a paso tu respuesta.",
    intent: "El entrevistador evalúa a nivel avanzado tu respuesta ante incidentes: contención, investigación, comunicación y prevención.",
    expectedAnswer:
      "Lo trataría como un incidente de seguridad y seguiría el proceso de respuesta de la organización, implicando de inmediato al equipo de seguridad. La contención va primero: desactivar o rotar las credenciales filtradas, revocar las sesiones activas y los tokens emitidos con ellas y, si hay riesgo de abuso continuado, restringir aún más las cuentas afectadas. Preservaría las evidencias en lugar de borrar cosas por pánico: conservar los logs de auditoría, como CloudTrail o su equivalente, y snapshots de los recursos sospechosos. Después investigaría el periodo de exposición: a qué podían acceder las credenciales, qué acciones se realizaron con ellas, como nuevos usuarios, claves de acceso, instancias inusuales para minería de criptomonedas, cambios en los security groups o descargas de datos del almacenamiento, y si el atacante creó persistencia, como nuevos usuarios o roles de IAM, que también hay que eliminar. Según lo encontrado, restauraría los sistemas afectados desde fuentes de confianza. La comunicación se hace en paralelo: actualizaciones periódicas a las partes interesadas y, si se pudo acceder a datos personales, los equipos legal y de privacidad deben evaluar las obligaciones de notificación, que en algunas jurisdicciones tienen plazos estrictos, como 72 horas según el RGPD (GDPR). Después, una revisión post-incidente sin culpables lleva a medidas preventivas: sustituir las claves de larga duración por credenciales federadas de corta duración, autenticación multifactor, escaneo de secretos, revisiones de mínimo privilegio y alertas ante actividad inusual en la cuenta.",
    explanation:
      "Una respuesta sólida sigue la contención, la preservación de evidencias, la investigación, la erradicación, la recuperación y las lecciones aprendidas, sin perder de vista la comunicación y las obligaciones legales.",
    tips: ["Empieza por la contención e implica al equipo de seguridad.", "Explica qué buscas en los logs de auditoría, incluida la persistencia.", "Menciona la comunicación y las obligaciones legales."],
    commonMistakes: ["Limitarse a rotar la clave sin comprobar qué hizo el atacante.", "Borrar logs o recursos antes de investigar."],
    followUpQuestions: ["¿Cómo detectas la persistencia de un atacante en una cuenta de nube?", "¿Quién decide si hay que notificar a los clientes?"],
  },
};
