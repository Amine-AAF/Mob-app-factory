import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de Java 026-050: concurrencia (parte), JVM, Spring Boot, APIs REST, inyección de dependencias, microservicios. */
export const esB: TextTable<QuestionText> = {
  'java-026': {
    question: "¿Qué es el Java Memory Model y qué significa «happens-before»?",
    intent: "El entrevistador evalúa si entiendes a fondo por qué el código concurrente puede comportarse de forma inesperada sin una sincronización adecuada.",
    expectedAnswer:
      "El Java Memory Model define cuándo se garantiza que una escritura realizada por un hilo sea visible para una lectura de otro hilo. Sin reglas, los compiladores y las CPU pueden reordenar instrucciones y mantener valores en cachés o registros, de modo que un hilo puede ver datos obsoletos o actualizados a medias. El modelo define relaciones happens-before: si la acción A ocurre antes (happens-before) que la acción B, entonces B ve los efectos de A. Reglas clave: liberar un lock ocurre antes que una adquisición posterior del mismo lock; una escritura en una variable volatile ocurre antes que sus lecturas posteriores; Thread.start() ocurre antes que las acciones del hilo iniciado; todas las acciones de un hilo ocurren antes de que otro hilo regrese de join() sobre él; y las escrituras en campos final dentro de un constructor son visibles una vez que el objeto se publica de forma segura. El código sin una relación de este tipo tiene una data race. Una consecuencia clásica es el patrón double-checked locking roto, que necesita un campo volatile para ser correcto.",
    explanation:
      "Happens-before es la base formal de las garantías de visibilidad. Entenderlo explica por qué volatile, los locks y la publicación segura son necesarios, y no simples buenas costumbres.",
    tips: ["Explica la reordenación y las cachés como la razón de ser del modelo.", "Enumera las principales reglas happens-before.", "Da un ejemplo concreto de código roto."],
    commonMistakes: ["Pensar que una escritura es visible de inmediato para los demás hilos.", "Creer que solo las escrituras necesitan sincronización y no las lecturas."],
    followUpQuestions: ["¿Qué es la publicación segura (safe publication)?", "¿Por qué el double-checked locking requiere volatile?"],
  },
  'java-027': {
    question: "¿Cuál es la diferencia entre el JDK, el JRE y la JVM?",
    intent: "El entrevistador comprueba que conoces los componentes básicos de la plataforma Java.",
    expectedAnswer:
      "La JVM, Java Virtual Machine, ejecuta bytecode: carga las clases, las verifica, interpreta y compila con JIT el código y gestiona la memoria con el garbage collector. El JRE, Java Runtime Environment, agrupaba históricamente la JVM con las bibliotecas estándar necesarias para ejecutar aplicaciones. El JDK, Java Development Kit, incluye todo lo del JRE más las herramientas de desarrollo, como el compilador javac, jar, jshell y herramientas de diagnóstico como jcmd. Desde Java 11, Oracle ya no distribuye un JRE por separado; se usa el JDK o se construye un runtime mínimo con jlink.",
    explanation:
      "Conocer estas capas ayuda a configurar servidores de build, imágenes Docker o a diagnosticar problemas en tiempo de ejecución.",
    tips: ["Describe lo que contiene cada uno.", "Menciona jlink y la ausencia de un JRE separado en el Java moderno."],
    commonMistakes: ["Decir que la JVM compila el código fuente Java; eso lo hace javac."],
    followUpQuestions: ["¿Qué es el bytecode?", "¿Cómo construirías una imagen Docker pequeña para un servicio Java?"],
  },
  'java-028': {
    question: "Describe las principales áreas de memoria de la JVM.",
    intent: "El entrevistador comprueba tu modelo mental de la memoria de la JVM, útil para el ajuste y la resolución de problemas.",
    expectedAnswer:
      "El heap almacena objetos y arrays y lo comparten todos los hilos; lo gestiona el garbage collector y suele dividirse en generación joven y generación vieja. Cada hilo tiene su propia pila (stack), que contiene frames con las variables locales y los resultados parciales de cada llamada a un método; una recursión demasiado profunda provoca StackOverflowError. Metaspace, que sustituyó a PermGen en Java 8, almacena los metadatos de las clases en memoria nativa. También está la code cache, donde se guarda el código nativo compilado por el JIT, y otra memoria nativa usada por los hilos, los direct buffers y la propia JVM. -Xmx limita el heap, pero la memoria total del proceso es mayor, lo que importa al fijar los límites de memoria de un contenedor.",
    explanation:
      "Entender estas áreas ayuda a interpretar los mensajes de OutOfMemoryError, que indican el área que se agotó, y a dimensionar correctamente los contenedores.",
    tips: ["Distingue el heap compartido de las pilas por hilo.", "Menciona que la memoria total supera el tamaño del heap."],
    commonMistakes: ["Fijar el límite de memoria del contenedor igual a -Xmx.", "Seguir hablando de PermGen en Java moderno."],
    followUpQuestions: ["¿Qué provoca «OutOfMemoryError: Metaspace»?", "¿Cómo detecta la JVM los límites de memoria del contenedor?"],
  },
  'java-029': {
    question: "¿Cómo investigarías un uso elevado de CPU en una aplicación Java en ejecución?",
    intent: "El entrevistador comprueba tus habilidades prácticas de resolución de problemas en la JVM.",
    expectedAnswer:
      "Primero comprobaría si la CPU la consume el código de la aplicación o el garbage collector, mediante los logs o las métricas de GC: recolecciones frecuentes apuntan a presión de memoria más que a un problema de código. Para encontrar el código caliente, tomaría varios thread dumps con unos segundos de diferencia con jcmd <pid> Thread.print o jstack, y buscaría hilos en estado RUNNABLE con la misma pila cada vez, por ejemplo un bucle cerrado, una regex costosa o la serialización. En Linux, top -H muestra los IDs de los hilos nativos más activos, que se pueden relacionar con el thread dump tras convertirlos a hexadecimal. Un profiler como async-profiler o Java Flight Recorder ofrece un flame graph con mucha más precisión y bajo overhead. Después lo correlacionaría con despliegues recientes o cambios de tráfico.",
    explanation:
      "El método consiste en separar la CPU del GC de la de la aplicación y luego usar thread dumps o profiling para encontrar las pilas calientes. Correlacionar con los cambios acelera el análisis de la causa raíz.",
    tips: ["Menciona primero el GC como posible causa.", "Explica cómo varios thread dumps revelan los puntos calientes.", "Nombra un profiler de bajo overhead."],
    commonMistakes: ["Reiniciar el servicio sin recopilar evidencias.", "Tomar un único thread dump y sacar conclusiones."],
    followUpQuestions: ["¿Qué es Java Flight Recorder?", "¿Cómo se lee un flame graph?"],
  },
  'java-030': {
    question: "¿Cómo eliges y ajustas un garbage collector para un servicio Java?",
    intent: "El entrevistador evalúa conocimientos avanzados de rendimiento de la JVM y un enfoque de ajuste basado en evidencias.",
    expectedAnswer:
      "Parto de los objetivos del servicio: las APIs sensibles a la latencia se preocupan por los tiempos de pausa, los procesos batch por el throughput y los contenedores pequeños por el consumo de memoria. G1 es el predeterminado y un buen equilibrio para la mayoría de los servicios con heaps desde unos cientos de megabytes hasta decenas de gigabytes; su principal parámetro es un objetivo de tiempo de pausa, MaxGCPauseMillis. Para latencias muy bajas con heaps grandes, ZGC, generacional desde Java 21, mantiene las pausas normalmente por debajo de un milisegundo a cambio de algo más de CPU y memoria. Parallel GC maximiza el throughput para el procesamiento batch. Serial GC se adapta a contenedores muy pequeños con una sola CPU. Antes de ajustar, activo los logs de GC con -Xlog:gc*, mido con una carga realista y observo los tiempos de pausa, la frecuencia y la tasa de asignación. A menudo la mejor solución es reducir las asignaciones o dimensionar bien el heap en lugar de retocar flags. En contenedores, fijo el tamaño del heap en relación con el límite del contenedor, por ejemplo con MaxRAMPercentage, y dejo margen para la memoria fuera del heap.",
    explanation:
      "La elección del GC depende de los objetivos, y el ajuste debe guiarse por mediciones. Los ingenieros con experiencia suelen corregir los patrones de asignación antes de tocar los flags.",
    tips: ["Relaciona cada collector con un objetivo.", "Insiste en los logs de GC y las pruebas de carga.", "Menciona el dimensionamiento en contenedores."],
    commonMistakes: ["Copiar flags de la JVM de internet sin medir.", "Configurar un heap enorme que alarga las pausas."],
    followUpQuestions: ["¿Qué te indica la tasa de asignación?", "¿Cómo reducirías las asignaciones en una ruta de código crítica?"],
  },
  'java-031': {
    question: "¿Cómo reducirías el tiempo de arranque y el consumo de memoria de un microservicio Java?",
    intent: "El entrevistador comprueba tus conocimientos de despliegue moderno en entornos cloud y serverless.",
    expectedAnswer:
      "Primero mediría en qué se va el tiempo: carga de clases, inicialización del contexto de Spring, establecimiento de conexiones a la base de datos o cachés cargadas de forma anticipada. Las mejoras habituales a nivel de framework incluyen la inicialización lazy de los beans cuando es seguro, eliminar auto-configuraciones y starters que no se usan, y evitar trabajo pesado en constructores o en @PostConstruct. A nivel de JVM, Class Data Sharing, sobre todo los archivos AppCDS, reduce el tiempo de carga de clases, y elegir el GC y el tamaño de heap adecuados limita el consumo. Para ganancias mayores, Spring Boot 3 admite imágenes nativas de GraalVM mediante el procesamiento AOT: el arranque baja a decenas de milisegundos y el consumo de memoria es mucho menor, pero los builds son más lentos, la reflexión debe declararse, algunas bibliotecas son incompatibles y el throughput máximo puede ser inferior al del JIT. Otra opción es CRaC, que restaura una instantánea de una JVM ya calentada, cuando la plataforma lo admite. La elección depende de si el servicio escala a cero, de la frecuencia con la que arranca y de la importancia del rendimiento máximo.",
    explanation:
      "Optimizar el arranque es un compromiso entre complejidad del build, compatibilidad y rendimiento en ejecución. Los candidatos avanzados presentan las opciones con sus costes.",
    tips: ["Empieza por medir.", "Compara las opciones a nivel de JVM con las imágenes nativas.", "Explica los compromisos de las imágenes nativas."],
    commonMistakes: ["Recomendar imágenes nativas para todos los servicios.", "Ignorar el efecto del calentamiento (warm-up) en el rendimiento máximo."],
    followUpQuestions: ["¿Qué es el procesamiento AOT en Spring Boot 3?", "¿Por qué las imágenes nativas pueden tener un throughput máximo inferior?"],
  },
  'java-032': {
    question: "¿Qué es Spring Boot y en qué se diferencia de Spring Framework?",
    intent: "El entrevistador comprueba que entiendes lo básico del ecosistema Java más utilizado para el desarrollo back-end.",
    expectedAnswer:
      "Spring Framework proporciona las funcionalidades principales: inyección de dependencias, gestión de transacciones, web MVC, acceso a datos y más, pero históricamente requería mucha configuración. Spring Boot se apoya en Spring para que las aplicaciones arranquen rápido: los starters agrupan dependencias compatibles, la auto-configuración crea beans según las bibliotecas presentes en el classpath y tus propiedades, un servidor embebido como Tomcat permite ejecutar la aplicación como un simple jar, y Actuator ofrece health checks y métricas. El principio de convención sobre configuración hace que solo configures lo que difiere de los valores por defecto.",
    explanation:
      "Spring Boot no sustituye a Spring; lo empaqueta y lo configura con valores por defecto razonables para que los equipos se centren en el código de negocio.",
    tips: ["Menciona los starters, la auto-configuración y el servidor embebido.", "Di que Boot está construido sobre Spring."],
    commonMistakes: ["Describir Spring Boot como un framework distinto de Spring."],
    followUpQuestions: ["¿Cómo decide la auto-configuración qué crear?", "¿Qué ofrece Spring Boot Actuator?"],
  },
  'java-033': {
    question: "¿Cómo funciona la auto-configuración de Spring Boot?",
    intent: "El entrevistador quiere ver que entiendes el mecanismo que hay detrás de la «magia» de Spring Boot y que sabes depurarlo.",
    expectedAnswer:
      "Spring Boot incluye clases de auto-configuración, listadas en META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports en Spring Boot 3. Cuando la aplicación arranca con @SpringBootApplication, que incluye @EnableAutoConfiguration, se evalúan estas clases. Cada una está protegida por condiciones: @ConditionalOnClass crea beans solo si una biblioteca está en el classpath, @ConditionalOnMissingBean se retira si has definido tu propio bean, y @ConditionalOnProperty depende de valores de configuración. Por eso basta con añadir spring-boot-starter-data-jpa y una URL de datasource para obtener un DataSource y un EntityManager configurados. Para ver qué configuraciones se aplicaron o no, puedes arrancar con --debug o usar el endpoint conditions de Actuator. Para sustituir un valor por defecto, define tu propio bean o usa las propiedades documentadas.",
    explanation:
      "La configuración condicional explica cómo Boot se adapta al classpath y por qué tus propios beans tienen prioridad. Saber consultar el informe de condiciones es una habilidad práctica de depuración.",
    tips: ["Nombra las principales anotaciones condicionales.", "Explica cómo ver el informe de condiciones."],
    commonMistakes: ["Excluir auto-configuraciones a ciegas en lugar de entender los conflictos."],
    followUpQuestions: ["¿Cómo escribirías tu propio starter?", "¿Por qué dos beans DataSource podrían provocar un fallo en el arranque?"],
  },
  'java-034': {
    question: "¿Cómo gestionas la configuración y los perfiles en una aplicación Spring Boot?",
    intent: "El entrevistador comprueba tus buenas prácticas en configuración específica de cada entorno y en la gestión de secretos.",
    expectedAnswer:
      "La configuración vive en application.yml o application.properties, con archivos específicos de perfil como application-prod.yml que se activan mediante spring.profiles.active. Spring Boot resuelve las propiedades a partir de muchas fuentes en un orden definido, y las variables de entorno y los argumentos de línea de comandos tienen prioridad sobre los archivos, lo que encaja con los contenedores y las aplicaciones twelve-factor. Vinculo las propiedades relacionadas a clases tipadas con @ConfigurationProperties, a menudo como records con validación, en lugar de dispersar anotaciones @Value. Los secretos, como las contraseñas, no deben subirse al repositorio; vienen de variables de entorno, de un vault o de un gestor de secretos en la nube. Los perfiles deben cambiar la configuración, no el comportamiento de negocio, para mantener los entornos lo más parecidos posible.",
    explanation:
      "La configuración tipada y externalizada, con los secretos fuera del código, es la práctica estándar para servicios desplegables.",
    example: "@ConfigurationProperties(\"payment\")\nrecord PaymentProperties(@NotBlank String apiUrl, Duration timeout) {}",
    tips: ["Prefiere @ConfigurationProperties a muchos campos con @Value.", "Explica de dónde deben venir los secretos."],
    commonMistakes: ["Subir contraseñas al repositorio en application.yml.", "Usar perfiles para activar lógica de negocio distinta en producción."],
    followUpQuestions: ["¿Cuál es el orden de las fuentes de propiedades?", "¿Cómo recargarías la configuración sin reiniciar?"],
  },
  'java-035': {
    question: "¿Cómo funciona @Transactional en Spring y cuáles son sus trampas habituales?",
    intent: "El entrevistador comprueba que entiendes las transacciones basadas en proxies, una fuente frecuente de bugs sutiles.",
    expectedAnswer:
      "Spring implementa @Transactional con un proxy alrededor del bean. Cuando se llama a un método a través del proxy, este inicia una transacción o se une a una existente, y luego hace commit cuando el método termina o rollback ante excepciones. Las trampas se derivan de este diseño. Autoinvocación: llamar a un método @Transactional desde otro método de la misma clase evita el proxy, así que no se aplica ninguna transacción. Los métodos privados no se interceptan. Por defecto, el rollback solo ocurre con excepciones unchecked y errores, no con excepciones checked, salvo que configures rollbackFor. La propagación importa: REQUIRED se une a la transacción existente, mientras que REQUIRES_NEW la suspende e inicia una nueva. Las transacciones largas que mantienen locks en la base de datos mientras llaman a servicios remotos perjudican el rendimiento. Y readOnly = true es una pista que puede habilitar optimizaciones, no una garantía de seguridad.",
    explanation:
      "Entender que las transacciones las aplica un proxy explica la mayoría de las sorpresas. Conocer las reglas de rollback y la propagación evita bugs de consistencia de datos.",
    tips: ["Explica el mecanismo del proxy.", "Menciona la autoinvocación y el rollback con excepciones checked.", "Habla de la duración de las transacciones."],
    commonMistakes: ["Poner @Transactional en métodos privados.", "Llamar a APIs externas dentro de una transacción larga."],
    followUpQuestions: ["¿Cuándo usarías REQUIRES_NEW?", "¿Cómo pruebas el comportamiento transaccional?"],
  },
  'java-036': {
    question: "¿Cómo diagnosticarías y resolverías el problema de las consultas N+1 en una aplicación con Spring Data JPA?",
    intent: "El entrevistador evalúa conocimientos avanzados sobre el rendimiento de los ORM, un problema muy habitual en producción.",
    expectedAnswer:
      "El problema N+1 aparece cuando cargar una lista de N entidades provoca una consulta para la lista y luego una consulta adicional por cada entidad para cargar una asociación lazy, por ejemplo cargar pedidos y luego su cliente uno a uno. Lo detectaría activando el log de SQL o las estadísticas en un test, usando herramientas como Hibernate statistics o datasource-proxy para contar las consultas, o detectando muchas consultas similares en las trazas del APM. Las soluciones dependen del caso de uso: un JOIN FETCH en una consulta JPQL o un @EntityGraph para cargar la asociación en la misma consulta; el batch fetching con @BatchSize o hibernate.default_batch_fetch_size para que las cargas lazy se agrupen con cláusulas IN; o, para pantallas de solo lectura, una proyección DTO que seleccione exactamente las columnas necesarias. Tendría cuidado al cargar varias colecciones a la vez, lo que provoca productos cartesianos o MultipleBagFetchException, y con la paginación combinada con fetch joins de colecciones, que Hibernate aplica en memoria. Añadiría un test que verifique el número de consultas para que el problema no vuelva.",
    explanation:
      "Los candidatos avanzados conocen varias soluciones y sus compromisos, y evitan las regresiones con tests que cuentan las consultas.",
    tips: ["Explica cómo detectarlo con logs o conteo de consultas.", "Propón varias soluciones y cuándo encaja cada una.", "Menciona las trampas de la paginación y de las colecciones múltiples."],
    commonMistakes: ["Pasar todo a carga EAGER.", "Ignorar el problema porque no se nota con los pequeños conjuntos de datos de prueba."],
    followUpQuestions: ["¿Por qué la carga EAGER suele ser una mala opción por defecto?", "¿Qué es el ajuste open-session-in-view y por qué es controvertido?"],
  },
  'java-037': {
    question: "¿Cómo prepararías un servicio Spring Boot para producción?",
    intent: "El entrevistador evalúa tu madurez operativa: observabilidad, resiliencia, seguridad y prácticas de despliegue.",
    expectedAnswer:
      "Para la observabilidad, expondría probes de health, readiness y liveness con Actuator, exportaría métricas con Micrometer a Prometheus o a la plataforma que se use, usaría logs JSON estructurados con un ID de correlación o de traza, y añadiría trazas distribuidas con OpenTelemetry. Para la resiliencia, toda llamada saliente necesita un timeout; añadiría reintentos con backoff solo para operaciones idempotentes, además de circuit breakers con Resilience4j para las dependencias inestables. Los pools de conexiones a la base de datos y los pools de hilos estarían dimensionados y monitorizados. Para la seguridad, Spring Security con una autenticación adecuada, validación de entradas, secretos procedentes de un vault o del entorno, análisis de vulnerabilidades de las dependencias y endpoints de Actuator restringidos. Para el despliegue, un apagado ordenado (graceful shutdown) para que terminen las peticiones en curso, migraciones de base de datos con Flyway o Liquibase, configuración externalizada y ajustes de memoria adaptados a contenedores. Por último, definiría objetivos de nivel de servicio (SLO) y alertas sobre los síntomas que perciben los usuarios, como la tasa de errores y la latencia.",
    explanation:
      "Estar listo para producción abarca observabilidad, resiliencia, seguridad y despliegue. Una respuesta estructurada que cubra cada área demuestra experiencia operativa de nivel senior.",
    tips: ["Organiza la respuesta por áreas.", "Menciona los timeouts como algo innegociable.", "Incluye el graceful shutdown y las migraciones."],
    commonMistakes: ["Exponer públicamente todos los endpoints de Actuator.", "Añadir reintentos a operaciones no idempotentes."],
    followUpQuestions: ["¿Cuál es la diferencia entre los probes de liveness y de readiness?", "¿Cómo desplegarías una migración de base de datos incompatible con la versión anterior?"],
  },
  'java-038': {
    question: "¿Cuáles son los principales métodos HTTP de una API REST y qué significa cada uno?",
    intent: "El entrevistador comprueba tus conocimientos básicos de REST y el uso correcto de la semántica HTTP.",
    expectedAnswer:
      "GET lee un recurso y no debe modificar el estado. POST crea un recurso o desencadena una acción de procesamiento; no es idempotente, así que enviarlo dos veces puede crear dos recursos. PUT reemplaza por completo un recurso en una URL conocida y es idempotente. PATCH actualiza parcialmente un recurso. DELETE elimina un recurso y es idempotente: borrar dos veces deja el mismo estado. Por ejemplo, GET /orders/42 lee un pedido, POST /orders crea uno y PATCH /orders/42 actualiza su estado.",
    explanation:
      "Usar correctamente los métodos HTTP hace que las APIs sean predecibles y permite que cachés, proxies y clientes se comporten correctamente, por ejemplo reintentando con seguridad las peticiones idempotentes.",
    tips: ["Menciona los conceptos de método seguro e idempotencia.", "Da ejemplos de URL."],
    commonMistakes: ["Usar GET para modificar datos.", "Usar POST para todo."],
    followUpQuestions: ["¿Qué significa idempotente?", "¿Cuándo usarías PUT en lugar de PATCH?"],
  },
  'java-039': {
    question: "¿Qué códigos de estado HTTP debería devolver una API REST en las situaciones habituales?",
    intent: "El entrevistador comprueba que diseñas APIs que comunican los resultados con claridad a los clientes.",
    expectedAnswer:
      "Para el éxito: 200 OK para una lectura o actualización correcta con cuerpo, 201 Created tras crear un recurso, idealmente con una cabecera Location, y 204 No Content cuando no hay cuerpo, por ejemplo tras un borrado. Para los errores del cliente: 400 Bad Request para una entrada no válida, 401 Unauthorized cuando la autenticación falta o no es válida, 403 Forbidden cuando el usuario está autenticado pero no tiene permiso, 404 Not Found, 409 Conflict para un estado en conflicto, como un duplicado, 422 Unprocessable Entity para errores de validación de negocio en muchas APIs, y 429 Too Many Requests para la limitación de tasa. Para los errores del servidor: 500 Internal Server Error, y 503 Service Unavailable cuando está sobrecargado temporalmente. Los errores deben ir acompañados de un cuerpo coherente, por ejemplo con el formato Problem Details.",
    explanation:
      "Los códigos de estado correctos permiten a los clientes tratar los resultados automáticamente. Un formato de error coherente facilita la depuración a quienes consumen la API.",
    tips: ["Distingue 401 de 403.", "Menciona un formato estándar para el cuerpo de los errores."],
    commonMistakes: ["Devolver 200 con un mensaje de error en el cuerpo.", "Devolver 500 ante una entrada no válida del usuario."],
    followUpQuestions: ["¿Qué es RFC 9457 Problem Details?", "¿Cómo devolverías errores de validación de varios campos?"],
  },
  'java-040': {
    question: "¿Cómo versionas una API REST y gestionas los cambios incompatibles?",
    intent: "El entrevistador comprueba tu madurez en diseño de APIs y tu respeto por la compatibilidad con los clientes.",
    expectedAnswer:
      "Lo mejor es evitar los cambios incompatibles el mayor tiempo posible: añadir campos opcionales o nuevos endpoints es retrocompatible, y los clientes deberían ignorar los campos desconocidos. Cuando un cambio incompatible es necesario, como eliminar un campo o cambiar su significado, introduciría una nueva versión. Las estrategias habituales son una versión en la ruta de la URL, como /v2/orders, que es sencilla y visible, o una versión en una cabecera o en el media type, que mantiene las URL estables pero es menos fácil de descubrir. Ejecutaría ambas versiones en paralelo, comunicaría un calendario de deprecación, marcaría los endpoints obsoletos con las cabeceras Deprecation y Sunset y monitorizaría el uso de la versión antigua antes de retirarla. Los tests de contrato ayudan a garantizar que los clientes existentes no se rompan por accidente.",
    explanation:
      "Versionar consiste en gestionar el cambio para consumidores que no controlas. Monitorizar el uso y comunicar la deprecación es tan importante como el mecanismo técnico.",
    tips: ["Explica qué se considera un cambio incompatible.", "Menciona un proceso de deprecación."],
    commonMistakes: ["Crear una nueva versión por cada pequeño cambio.", "Retirar una versión antigua sin comprobar quién la sigue usando."],
    followUpQuestions: ["¿Cómo documentas una API, por ejemplo con OpenAPI?", "¿Cómo migrarías apps móviles que se actualizan lentamente?"],
  },
  'java-041': {
    question: "¿Cómo implementarías la paginación, el filtrado y la ordenación en una API REST?",
    intent: "El entrevistador comprueba tu diseño práctico de APIs para grandes volúmenes de datos.",
    expectedAnswer:
      "Para filtrar y ordenar usaría parámetros de consulta, como /orders?status=PAID&sort=createdAt,desc, validando los campos permitidos para que los clientes no puedan ordenar por columnas sin índice o sensibles. Para la paginación hay dos enfoques principales. La paginación por offset, con page y size, es sencilla y permite saltar a una página concreta, pero se vuelve lenta con offsets grandes porque la base de datos sigue recorriendo las filas omitidas, y los resultados pueden desplazarse si los datos cambian entre peticiones. La paginación por cursor o keyset devuelve un cursor basado en el último elemento, por ejemplo su fecha de creación y su ID, y la siguiente consulta usa WHERE (created_at, id) < (?, ?); es rápida y estable con datos grandes o cambiantes, pero no permite saltar a una página arbitraria. Siempre impondría un tamaño máximo de página y devolvería metadatos o enlaces a la página siguiente.",
    explanation:
      "La elección entre paginación por offset y por keyset depende del volumen de datos y de las necesidades de los usuarios. Validar los campos de ordenación y limitar el tamaño de página protege la base de datos.",
    tips: ["Compara la paginación por offset y por keyset.", "Menciona un tamaño máximo de página y la validación."],
    commonMistakes: ["Devolver listas sin límite.", "Permitir ordenar por cualquier columna sin índices."],
    followUpQuestions: ["¿Cómo admite Spring Data la paginación?", "¿Cómo implementarías un scroll infinito en móvil?"],
  },
  'java-042': {
    question: "¿Cómo haces que un endpoint POST se pueda reintentar con seguridad, por ejemplo para pagos?",
    intent: "El entrevistador evalúa tu diseño avanzado de APIs para la fiabilidad en sistemas distribuidos.",
    expectedAnswer:
      "Los fallos de red hacen que un cliente no siempre pueda saber si una petición se procesó, así que puede reintentarla y provocar duplicados, como cobrar dos veces a un cliente. Usaría una clave de idempotencia: el cliente genera una clave única, como un UUID, para cada operación lógica y la envía en una cabecera como Idempotency-Key. El servidor almacena la clave con la huella de la petición y el resultado en la misma transacción que la operación de negocio, protegida por una restricción de unicidad. Si llega una petición con una clave conocida, el servidor devuelve la respuesta almacenada en lugar de procesarla de nuevo; si una petición con la misma clave sigue en curso, devuelve un conflicto o espera; si la misma clave llega con un payload distinto, la rechaza. Las claves caducan tras un periodo definido. En el lado del cliente, los reintentos usan backoff exponencial con jitter. Este patrón, usado por los proveedores de pagos, ofrece en la práctica un procesamiento exactly-once sobre una entrega at-least-once.",
    explanation:
      "Las claves de idempotencia convierten operaciones inseguras en operaciones que se pueden reintentar sin riesgo. Almacenar la clave de forma atómica con la operación es el detalle crítico.",
    tips: ["Explica por qué se producen los reintentos.", "Describe el almacenamiento de la clave de forma atómica con el resultado.", "Gestiona los duplicados concurrentes y los payloads que no coinciden."],
    commonMistakes: ["Comprobar los duplicados sin una restricción de unicidad, lo que deja una condición de carrera.", "Usar una marca de tiempo como clave."],
    followUpQuestions: ["¿Cuánto tiempo conservarías las claves de idempotencia?", "¿Qué relación tiene esto con el patrón outbox?"],
  },
  'java-043': {
    question: "¿Qué es la inyección de dependencias y por qué es útil?",
    intent: "El entrevistador comprueba que entiendes un principio de diseño fundamental usado por Spring y por la mayoría de los frameworks modernos.",
    expectedAnswer:
      "La inyección de dependencias significa que una clase recibe desde fuera los objetos de los que depende en lugar de crearlos ella misma. Por ejemplo, un OrderService recibe un PaymentGateway en su constructor en lugar de llamar a new StripeGateway(). Esto reduce el acoplamiento, porque el servicio depende de una interfaz, facilita las pruebas, porque puedes pasar un gateway falso, y permite que un contenedor como Spring cree y conecte los objetos según la configuración. Se prefiere la inyección por constructor porque las dependencias son explícitas, pueden ser final y el objeto siempre está completamente inicializado.",
    explanation:
      "La DI es la aplicación práctica de la inversión de dependencias. Su principal beneficio en el día a día es la facilidad para hacer pruebas.",
    example: "class OrderService {\n  private final PaymentGateway gateway;\n  OrderService(PaymentGateway gateway) { this.gateway = gateway; }\n}",
    tips: ["Compárala con crear las dependencias usando new.", "Recomienda la inyección por constructor."],
    commonMistakes: ["Confundir la inyección de dependencias con el simple uso de Spring.", "Usar inyección por campo en todas partes."],
    followUpQuestions: ["¿Por qué se desaconseja la inyección por campo?", "¿Qué es un contenedor IoC?"],
  },
  'java-044': {
    question: "¿Qué son los scopes de los beans en Spring y qué problema puede causar mezclarlos?",
    intent: "El entrevistador comprueba que entiendes el ciclo de vida de los beans y una trampa clásica de la inyección.",
    expectedAnswer:
      "El scope por defecto es singleton: una única instancia por contexto de aplicación, compartida por todos los usuarios, por lo que debe ser stateless o thread-safe. Prototype crea una nueva instancia cada vez que se solicita el bean al contenedor. Las aplicaciones web tienen además los scopes request y session. La trampa clásica es inyectar un bean prototype o de scope request en un singleton: la inyección solo ocurre una vez, al crear el singleton, así que este conserva la misma instancia para siempre. Las soluciones son inyectar un ObjectProvider y llamar a getObject() cuando se necesite, usar un scoped proxy con proxyMode o usar la inyección por método con @Lookup.",
    explanation:
      "Los scopes definen el ciclo de vida y la forma de compartir. La mayoría de los bugs vienen de guardar estado específico de una petición en singletons o de que la inyección solo ocurre una vez.",
    tips: ["Recalca que los singletons se comparten entre peticiones concurrentes.", "Explica la trampa del prototype dentro de un singleton y una solución."],
    commonMistakes: ["Guardar datos de usuario en un campo de un servicio singleton."],
    followUpQuestions: ["¿Cómo funciona un scoped proxy?", "¿Cuándo usarías el scope prototype?"],
  },
  'java-045': {
    question: "¿Cómo resuelves una situación en la que Spring encuentra dos beans del mismo tipo?",
    intent: "El entrevistador comprueba tu capacidad práctica para resolver problemas en Spring y tus decisiones de configuración.",
    expectedAnswer:
      "Spring falla con NoUniqueBeanDefinitionException cuando un punto de inyección coincide con varios beans. Opciones: marcar un bean como predeterminado con @Primary; seleccionar un bean concreto en el punto de inyección con @Qualifier y un nombre; inyectarlos todos como List<PaymentGateway> o Map<String, PaymentGateway> cuando el código debe elegir dinámicamente, por ejemplo según el tipo de pago; o usar condiciones como @ConditionalOnProperty o perfiles para que solo se cree uno en cada entorno. La opción correcta depende de la intención: un valor por defecto con excepciones puntuales encaja con @Primary, mientras que una estrategia elegida en tiempo de ejecución encaja con inyectar un map.",
    explanation:
      "Esta pregunta muestra si sabes asociar un mecanismo de configuración a la intención de diseño en lugar de aplicar anotaciones por ensayo y error.",
    tips: ["Enumera las opciones.", "Explica qué opción encaja con cada intención."],
    commonMistakes: ["Renombrar beans al azar hasta que desaparezca el error."],
    followUpQuestions: ["¿Cómo implementarías un registro de estrategias con Spring?", "¿Cuál es el nombre de un bean por defecto?"],
  },
  'java-046': {
    question: "¿Qué es una dependencia circular en Spring y cómo deberías resolverla correctamente?",
    intent: "El entrevistador evalúa tu criterio de diseño: tratar las dependencias circulares como un síntoma de mal diseño y no como un problema de configuración.",
    expectedAnswer:
      "Una dependencia circular se produce cuando el bean A necesita a B y B necesita a A, directamente o a través de una cadena más larga. Con la inyección por constructor, Spring no puede crear ninguno de los dos beans, y desde Spring Boot 2.6 las referencias circulares están prohibidas por defecto incluso con inyección por campo. Existen soluciones técnicas, como @Lazy en uno de los puntos de inyección o la inyección por setter, pero ocultan el problema real: dos clases están demasiado acopladas o una clase tiene demasiadas responsabilidades. Las soluciones adecuadas son extraer la lógica compartida a un tercer bean del que ambos puedan depender, dividir un servicio grande por responsabilidades, invertir una de las dependencias mediante una interfaz que pertenezca al módulo de más bajo nivel, o sustituir una llamada directa por un evento de aplicación cuando un lado solo necesita notificar al otro. Tras la corrección, el grafo de dependencias debe ser acíclico, lo que además facilita probar los módulos y separarlos más adelante.",
    explanation:
      "Las dependencias circulares señalan problemas de diseño. Los candidatos avanzados corrigen el diseño en lugar de depender de proxies lazy, y entienden el comportamiento por defecto de Spring Boot.",
    tips: ["Explica por qué falla la inyección por constructor.", "Menciona el comportamiento por defecto desde Spring Boot 2.6.", "Propón soluciones de diseño, no solo @Lazy."],
    commonMistakes: ["Activar spring.main.allow-circular-references como solución permanente.", "Pasar a la inyección por campo para ocultar el ciclo."],
    followUpQuestions: ["¿Cómo reducen el acoplamiento los eventos de aplicación?", "¿Cómo detectarías automáticamente ciclos entre paquetes?"],
  },
  'java-047': {
    question: "¿Cuáles son las ventajas y desventajas de los microservicios frente a un monolito?",
    intent: "El entrevistador comprueba que tienes un criterio arquitectónico equilibrado y no solo entusiasmo por una moda.",
    expectedAnswer:
      "Los microservicios dividen una aplicación en servicios pequeños desplegados de forma independiente, cada uno dueño de sus datos. Ventajas: los equipos pueden desplegar y escalar los servicios de forma independiente, los fallos pueden aislarse y cada servicio puede usar la tecnología que mejor le encaje. Desventajas: las llamadas de red añaden latencia y nuevos modos de fallo, la consistencia de los datos entre servicios se complica, las pruebas y la depuración requieren trazas distribuidas, y la operación necesita CI/CD, monitorización e infraestructura maduras. Un monolito modular bien estructurado suele ser un mejor punto de partida para un equipo pequeño, extrayendo servicios cuando hay una necesidad clara, como el escalado independiente o la autonomía de los equipos.",
    explanation:
      "Los entrevistadores valoran a los candidatos que ven los microservicios como un compromiso guiado por necesidades organizativas y de escalado.",
    tips: ["Presenta ambos lados.", "Menciona el monolito modular como alternativa."],
    commonMistakes: ["Presentar los microservicios como siempre mejores.", "Dividir los servicios por capa técnica en lugar de por capacidad de negocio."],
    followUpQuestions: ["¿Cómo decidirías los límites de los servicios?", "¿Cómo se comunican los servicios?"],
  },
  'java-048': {
    question: "Compara las llamadas REST síncronas y la mensajería asíncrona entre microservicios.",
    intent: "El entrevistador comprueba que entiendes los patrones de comunicación y su impacto en el acoplamiento y la fiabilidad.",
    expectedAnswer:
      "Las llamadas síncronas con REST o gRPC son sencillas y dan una respuesta inmediata, lo que encaja con consultas como comprobar un precio. Pero crean acoplamiento temporal: si el servicio llamado es lento o está caído, el llamante se ve afectado, y las cadenas largas de llamadas multiplican la latencia y el riesgo de fallo. Los timeouts, los reintentos y los circuit breakers son imprescindibles. La mensajería asíncrona con un broker como Kafka o RabbitMQ desacopla los servicios en el tiempo: el productor publica un evento como OrderPlaced y continúa, y los consumidores lo procesan cuando pueden. Mejora la resiliencia y permite que se suscriban nuevos consumidores sin cambiar el productor, pero conlleva consistencia eventual, una depuración más difícil, mensajes duplicados que exigen consumidores idempotentes y la necesidad de gestionar el orden de los mensajes y los esquemas. Muchos sistemas usan llamadas síncronas para las consultas y eventos para los cambios de estado.",
    explanation:
      "La elección afecta al acoplamiento, a la consistencia y al comportamiento ante fallos. Una respuesta equilibrada da un caso de uso para cada opción.",
    tips: ["Menciona el acoplamiento temporal.", "Explica la consistencia eventual y los consumidores idempotentes."],
    commonMistakes: ["Construir cadenas largas de llamadas síncronas.", "Suponer que los mensajes se entregan exactamente una vez."],
    followUpQuestions: ["¿Cómo gestionarías un mensaje que falla siempre?", "¿Qué es una dead-letter queue?"],
  },
  'java-049': {
    question: "¿Cómo mantienes la consistencia de los datos entre microservicios sin transacciones distribuidas?",
    intent: "El entrevistador evalúa tu diseño avanzado de sistemas distribuidos: sagas, outbox e idempotencia.",
    expectedAnswer:
      "El two-phase commit entre servicios es frágil y los brokers modernos rara vez lo admiten, así que aceptaría la consistencia eventual y diseñaría en función de ella. Una saga divide un proceso de negocio en transacciones locales, cada una en un servicio, con acciones de compensación ante fallos. Por ejemplo, al realizar un pedido se reserva el stock, se cobra el pago y se confirma el pedido; si el pago falla, se cancela la reserva de stock. Las sagas pueden ser coreografiadas, con cada servicio reaccionando a eventos, u orquestadas por un coordinador que sigue el estado, lo que resulta más fácil de entender en flujos complejos. Para publicar eventos de forma fiable, usaría el patrón transactional outbox: el servicio escribe el cambio de negocio y el evento en una tabla outbox dentro de la misma transacción local, y un relay o una herramienta de change data capture como Debezium lo publica en el broker. Los consumidores deben ser idempotentes, por ejemplo registrando los IDs de los mensajes procesados, porque la entrega es at-least-once. También diseñaría estados visibles para los usuarios, como «pago pendiente», y monitorizaría las sagas bloqueadas.",
    explanation:
      "Las sagas, el outbox y los consumidores idempotentes son las herramientas estándar. Las respuestas avanzadas también tienen en cuenta los estados intermedios visibles para el usuario y la monitorización.",
    tips: ["Explica por qué se evitan las transacciones distribuidas.", "Describe la saga con compensación y el patrón outbox.", "Menciona la idempotencia y la monitorización."],
    commonMistakes: ["Publicar un evento después del commit sin outbox, con el riesgo de perder eventos.", "Olvidar que las compensaciones también pueden fallar."],
    followUpQuestions: ["Coreografía u orquestación: ¿cuál elegirías y por qué?", "¿Cómo gestionas una compensación que falla?"],
  },
  'java-050': {
    question: "¿Cómo dividirías un monolito en microservicios?",
    intent: "El entrevistador evalúa tus habilidades de arquitectura estratégica y tu gestión del riesgo durante una migración.",
    expectedAnswer:
      "Empezaría cuestionando el objetivo: despliegues independientes más rápidos, escalar un punto caliente o la autonomía de los equipos, porque el objetivo determina qué extraer primero. Después identificaría los límites a partir de las capacidades de negocio, usando ideas de domain-driven design como los bounded contexts, y analizaría el acoplamiento del código y de los datos, por ejemplo qué tablas se comparten. Antes de extraer nada, a menudo modularizaría el monolito internamente, imponiendo límites entre módulos para que las dependencias se vuelvan explícitas. Extraería primero un servicio con un valor claro y un acoplamiento limitado, usando el patrón strangler fig: enrutar las llamadas de esa capacidad al nuevo servicio a través de una fachada o un gateway, mantener el monolito como respaldo durante la transición y migrar sus datos, con un periodo de sincronización si hace falta. Cada paso debe poder publicarse y revertirse. Mientras tanto, invertiría en los requisitos previos: CI/CD por servicio, observabilidad con trazas y tests de contrato. Mediría si cada extracción ha cumplido realmente el objetivo antes de continuar, y aceptaría que algunas partes se queden en un monolito bien estructurado.",
    explanation:
      "Las migraciones exitosas son incrementales, guiadas por un objetivo y reversibles. Mencionar primero la modularización y la separación de los datos demuestra experiencia real.",
    tips: ["Parte del objetivo de negocio.", "Menciona la modularización antes de la extracción.", "Explica el patrón strangler fig y la migración de los datos."],
    commonMistakes: ["Proponer una reescritura completa de golpe (big-bang).", "Extraer servicios que siguen compartiendo las mismas tablas de la base de datos."],
    followUpQuestions: ["¿Cómo divides una base de datos compartida?", "¿Qué te haría detener la migración?"],
  },
};
