import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de bases de datos 021-040: índices (parte), transacciones, optimización de consultas, diseño de bases de datos. */
export const esB: TextTable<QuestionText> = {
  'db-021': {
    question: "¿Cómo eliges el orden de las columnas en un índice compuesto?",
    intent: "El entrevistador comprueba una habilidad práctica de indexación que influye mucho en el rendimiento de las consultas.",
    expectedAnswer:
      "Un índice B-tree compuesto sobre (a, b, c) está ordenado por a, luego por b dentro de cada a y luego por c. Puede usarse para condiciones sobre a, sobre a y b, o sobre a, b y c, pero en general no para una condición solo sobre b: es la regla del «prefijo izquierdo» (leftmost prefix). Por eso ordeno las columnas según las consultas: primero las columnas comparadas por igualdad y después la columna usada en un rango o para ordenar. Por ejemplo, para WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC, un índice sobre (tenant_id, status, created_at) permite a la base de datos encontrar las filas y devolverlas ya ordenadas. Poner primero la columna de rango, como created_at, impediría usar eficientemente las columnas siguientes. La selectividad también importa, pero la forma de la consulta importa más. Un solo índice compuesto bien diseñado puede a menudo sustituir a varios índices de una sola columna.",
    explanation:
      "La regla del prefijo izquierdo y la pauta «igualdad antes que rango» son las ideas clave para diseñar índices compuestos.",
    example: "CREATE INDEX idx_orders_tenant_status_date ON orders (tenant_id, status, created_at DESC);",
    tips: ["Explica la regla del prefijo izquierdo.", "Coloca las columnas de igualdad antes que las de rango u ordenación."],
    commonMistakes: ["Crear índices separados de una sola columna y esperar que funcionen como un índice compuesto.", "Poner primero una columna de rango."],
    followUpQuestions: ["¿Puede la base de datos usar el índice para un ORDER BY en sentido inverso?", "¿Qué es un index-only scan?"],
  },
  'db-022': {
    question: "¿Cuándo no deberías añadir un índice?",
    intent: "El entrevistador comprueba que entiendes el coste de los índices y que no los añades a ciegas.",
    expectedAnswer:
      "Evito un índice cuando su coste supera su beneficio. Las tablas con muchísimo tráfico de escritura, como los registros de eventos, pagan cada índice en cada inserción. Las columnas de baja selectividad, por ejemplo un estado con dos valores repartidos por igual, rara vez se benefician, porque leer media tabla a través de un índice es más lento que un escaneo secuencial; un índice parcial sobre el valor poco frecuente puede ser mejor. Las tablas pequeñas se recorren rápido de todos modos. Las columnas que nunca se usan en filtros, joins u ordenaciones no necesitan índices, y los índices duplicados o solapados, como (a) cuando ya existe (a, b), desperdician espacio. Detecto los índices no utilizados con las estadísticas de la base de datos, como pg_stat_user_indexes en PostgreSQL, y baso las decisiones en planes de ejecución reales y no en suposiciones.",
    explanation:
      "Indexar bien es cuestión de equilibrio. Eliminar los índices no utilizados puede mejorar el rendimiento de escritura y reducir el almacenamiento.",
    tips: ["Menciona las tablas con mucha escritura y la baja selectividad.", "Explica cómo encontrar índices no utilizados."],
    commonMistakes: ["Añadir un índice para cada consulta nueva sin revisar los existentes."],
    followUpQuestions: ["¿Qué es un índice parcial?", "¿Cómo eliminarías un índice de forma segura en producción?"],
  },
  'db-023': {
    question: "Una consulta no usa el índice que esperabas. ¿Cuáles pueden ser las razones?",
    intent: "El entrevistador evalúa un conocimiento avanzado de los planificadores de consultas y de cómo la forma de escribir una consulta afecta al uso de índices.",
    expectedAnswer:
      "Hay varias causas habituales. El predicado puede no coincidir con el índice: una función o expresión sobre la columna, como WHERE LOWER(email) = ? o WHERE DATE(created_at) = ?, impide usar un índice simple, así que necesitas un índice de expresión o reescribir la condición como un rango. Una conversión de tipo implícita, por ejemplo comparar una columna de texto con un número, tiene el mismo efecto. Un comodín inicial, LIKE '%term', no puede usar un B-tree; hace falta un índice GIN de trigramas o búsqueda de texto completo. En un índice compuesto, la consulta puede omitir la columna inicial. Las condiciones combinadas con OR sobre columnas distintas pueden provocar un escaneo. El planificador también puede decidir, con razón, que un escaneo secuencial es más barato porque la condición coincide con una gran fracción de las filas o porque la tabla es pequeña. Por último, unas estadísticas desactualizadas pueden producir estimaciones de filas erróneas; ejecutar ANALYZE lo corrige. Con sentencias preparadas, PostgreSQL puede pasar a un plan genérico que ignora el valor concreto del parámetro. Compararía las filas estimadas y reales en EXPLAIN ANALYZE para saber qué caso aplica, en lugar de forzar el índice.",
    explanation:
      "El uso de un índice depende de la forma del predicado, de la distribución de los datos y de las estadísticas. Los candidatos avanzados diagnostican con EXPLAIN ANALYZE en lugar de dar por hecho que el planificador se equivoca.",
    tips: ["Agrupa las causas en forma de la consulta, distribución de los datos y estadísticas.", "Menciona los índices de expresión.", "Compara las filas estimadas con las reales."],
    commonMistakes: ["Forzar el uso del índice con hints sin entender el plan.", "Olvidar ejecutar ANALYZE después de cargas masivas de datos."],
    followUpQuestions: ["¿Cómo indexarías una búsqueda que no distingue mayúsculas y minúsculas?", "¿Qué es un plan genérico en PostgreSQL?"],
  },
  'db-024': {
    question: "Explica los índices de cobertura, los índices parciales y los tipos de índice especializados de PostgreSQL.",
    intent: "El entrevistador comprueba que conoces herramientas de indexación avanzadas para problemas de rendimiento concretos.",
    expectedAnswer:
      "Un índice de cobertura (covering index) contiene todas las columnas que necesita una consulta, de modo que la base de datos puede responderla con un index-only scan sin leer la tabla. En PostgreSQL, INCLUDE añade columnas que no forman parte de la clave del índice con este fin, por ejemplo CREATE INDEX ON orders (customer_id) INCLUDE (total, status). Los index-only scans también dependen de que el visibility map esté al día, algo que mantiene VACUUM. Un índice parcial solo cubre las filas que cumplen una condición, como WHERE status = 'PENDING', lo que mantiene el índice pequeño y rápido cuando las consultas apuntan a un subconjunto reducido; también puede imponer unicidad sobre un subconjunto, como una sola suscripción activa por usuario. Más allá del B-tree, PostgreSQL ofrece GIN para valores que contienen muchos elementos, como JSONB, arrays y búsqueda de texto completo; GiST para búsquedas geométricas, de rangos y de vecinos más cercanos, usado por PostGIS; BRIN, un índice diminuto para tablas muy grandes cuyos valores se correlacionan con el orden físico, como series temporales de solo inserción; e índices hash para igualdad pura. Las extensiones añaden más, como pg_trgm para búsquedas por similitud y los índices HNSW de pgvector para embeddings.",
    explanation:
      "Elegir el tipo de índice adecuado para los datos y la forma de la consulta puede transformar el rendimiento. Los candidatos avanzados saben cuándo el B-tree no es la herramienta correcta.",
    example: "CREATE UNIQUE INDEX one_active_sub ON subscriptions (user_id) WHERE status = 'ACTIVE';",
    tips: ["Da un caso de uso concreto para cada tipo.", "Menciona INCLUDE y el visibility map.", "Muestra un índice único parcial."],
    commonMistakes: ["Usar un B-tree para consultas de contención sobre JSONB.", "Crear índices grandes cuando bastaría con un índice parcial."],
    followUpQuestions: ["¿Cuándo es BRIN una buena opción?", "¿Cómo indexas una clave JSONB usada en filtros?"],
  },
  'db-025': {
    question: "¿Qué significa ACID en las transacciones de base de datos?",
    intent: "El entrevistador comprueba un concepto fundamental del almacenamiento fiable de datos.",
    expectedAnswer:
      "ACID describe cuatro garantías de las transacciones. Atomicidad: todas las operaciones de una transacción tienen éxito o ninguna lo tiene; si una transferencia bancaria debita una cuenta, el abono en la otra cuenta también se produce, o ambos se anulan. Consistencia: una transacción lleva la base de datos de un estado válido a otro, respetando restricciones como las claves foráneas y las claves únicas. Aislamiento: las transacciones concurrentes no ven los cambios no confirmados de las demás, en el grado que define el nivel de aislamiento. Durabilidad: una vez confirmados, los cambios sobreviven a las caídas, porque se escriben en un log en disco antes de confirmarse.",
    explanation:
      "ACID es lo que hace que las bases de datos relacionales sean fiables para datos críticos como pagos e inventario.",
    tips: ["Usa el ejemplo de la transferencia bancaria.", "Menciona que el aislamiento tiene niveles."],
    commonMistakes: ["Confundir la consistencia de la base de datos con la consistencia del teorema CAP."],
    followUpQuestions: ["¿Qué son los niveles de aislamiento?", "¿Cómo garantiza una base de datos la durabilidad?"],
  },
  'db-026': {
    question: "¿Qué son los niveles de aislamiento de las transacciones y qué anomalías evitan?",
    intent: "El entrevistador comprueba que entiendes los compromisos de concurrencia dentro de la base de datos.",
    expectedAnswer:
      "El estándar SQL define cuatro niveles. Read Uncommitted permite lecturas sucias (dirty reads), es decir, ver datos de transacciones aún no confirmadas; PostgreSQL lo trata como Read Committed. Read Committed, el nivel por defecto en PostgreSQL, solo ve datos confirmados, pero cada sentencia ve una nueva instantánea (snapshot), así que leer dos veces la misma fila puede devolver valores distintos: una lectura no repetible. Repeatable Read mantiene una única instantánea durante toda la transacción; en PostgreSQL también evita las filas fantasma, pero sigue siendo posible el write skew, por ejemplo dos médicos que dejan la guardia porque cada uno vio que el otro seguía de guardia. Serializable garantiza que el resultado es el mismo que si las transacciones se ejecutaran una tras otra; PostgreSQL lo implementa con serializable snapshot isolation y aborta las transacciones en conflicto, así que la aplicación debe reintentarlas. Los niveles más altos ofrecen garantías más fuertes a costa de más conflictos y reintentos. MySQL InnoDB usa Repeatable Read por defecto, así que el comportamiento varía entre bases de datos.",
    explanation:
      "Saber qué anomalía evita cada nivel, y que las bases de datos difieren, ayuda a elegir el nivel adecuado y a gestionar los reintentos.",
    tips: ["Nombra las anomalías: dirty read, lectura no repetible, fantasma, write skew.", "Menciona los niveles por defecto de PostgreSQL y MySQL.", "Menciona los reintentos en Serializable."],
    commonMistakes: ["Suponer que el nivel por defecto evita todos los problemas de concurrencia.", "Usar Serializable sin lógica de reintento."],
    followUpQuestions: ["¿Qué es el write skew?", "¿Cómo evitarías la doble reserva de una habitación?"],
  },
  'db-027': {
    question: "¿Cómo se producen los interbloqueos (deadlocks) en una base de datos y cómo los evitas?",
    intent: "El entrevistador comprueba tu experiencia con problemas de bloqueo en aplicaciones reales.",
    expectedAnswer:
      "Un interbloqueo ocurre cuando dos transacciones tienen cada una un bloqueo que la otra necesita: la transacción A actualiza la fila 1 y luego quiere la fila 2, mientras que B actualiza la fila 2 y luego quiere la fila 1. La base de datos detecta el ciclo y aborta una de las transacciones con un error, así que la aplicación debe estar preparada para reintentarla. Para reducir los interbloqueos, accedo a filas y tablas en un orden coherente, por ejemplo actualizando las cuentas ordenadas por ID; mantengo las transacciones cortas y evito interacciones con el usuario o llamadas remotas dentro de ellas; bloqueo de antemano lo que necesito con SELECT ... FOR UPDATE cuando conviene; y me aseguro de que las actualizaciones usen índices para que bloqueen menos filas. Los logs de la base de datos muestran las consultas implicadas en cada interbloqueo, lo que ayuda a encontrar los caminos de código en conflicto.",
    explanation:
      "Los interbloqueos suelen deberse a un orden incoherente y a transacciones largas. Un orden coherente más reintentos es el enfoque estándar.",
    tips: ["Da un ejemplo con dos transacciones.", "Menciona la lógica de reintento y el orden coherente."],
    commonMistakes: ["Ignorar los errores de interbloqueo en lugar de reintentar.", "Hacer llamadas HTTP dentro de transacciones abiertas."],
    followUpQuestions: ["¿Cómo averiguarías qué consultas causaron un interbloqueo?", "¿Qué es un lock timeout?"],
  },
  'db-028': {
    question: "¿Cuál es la diferencia entre el bloqueo optimista y el pesimista?",
    intent: "El entrevistador comprueba tu capacidad para gestionar correctamente las actualizaciones concurrentes en las aplicaciones.",
    expectedAnswer:
      "El bloqueo pesimista evita los conflictos bloqueando los datos antes de modificarlos, por ejemplo con SELECT ... FOR UPDATE, de modo que las demás transacciones esperan hasta que se libera el bloqueo. Es seguro cuando los conflictos son frecuentes o su coste es alto, pero reduce la concurrencia y puede provocar esperas o interbloqueos. El bloqueo optimista supone que los conflictos son raros: cada fila tiene un número de versión o una marca de tiempo, y la actualización lo incluye en la condición, UPDATE ... SET ..., version = version + 1 WHERE id = ? AND version = ?. Si no se actualiza ninguna fila, alguien la modificó antes, y la aplicación recarga y reintenta o muestra un mensaje de conflicto al usuario. JPA lo admite con @Version. El bloqueo optimista encaja con aplicaciones web en las que los usuarios editan datos durante mucho tiempo sin mantener bloqueos en la base de datos.",
    explanation:
      "La elección depende de la frecuencia de los conflictos y de cuánto tiempo trabaja un usuario o un proceso sobre los datos.",
    tips: ["Muestra la condición del UPDATE con versión.", "Da un caso de uso para cada uno."],
    commonMistakes: ["Mantener un bloqueo pesimista mientras un usuario rellena un formulario.", "Ignorar el resultado «cero filas actualizadas» en el bloqueo optimista."],
    followUpQuestions: ["¿Qué hace SKIP LOCKED?", "¿Cómo presentarías un conflicto al usuario?"],
  },
  'db-029': {
    question: "Dos usuarios compran el último artículo en stock en el mismo instante. ¿Cómo evitas vender de más?",
    intent: "El entrevistador evalúa un manejo avanzado de las condiciones de carrera a nivel de base de datos.",
    expectedAnswer:
      "El fallo viene de una secuencia de leer y luego escribir: ambas peticiones leen stock = 1, ambas ven que está disponible y ambas escriben 0, o crean dos pedidos. La solución más robusta es convertir la comprobación y el cambio en una única operación atómica: UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0, y luego comprobar el número de filas afectadas; si es cero, el artículo está agotado. Una restricción CHECK (stock >= 0) añade una red de seguridad. Las alternativas son un bloqueo pesimista con SELECT ... FOR UPDATE dentro de una transacción antes de crear el pedido, o un bloqueo optimista con una columna de versión y reintentos. Para ventas flash con muchísima contención sobre una sola fila, consideraría modelos de reserva, como una cola o un contador atómico en Redis, con la base de datos como fuente de verdad final. La creación del pedido y la actualización del stock deben estar en la misma transacción, y la petición de compra debe ser idempotente para que un reintento del cliente no descuente dos veces.",
    explanation:
      "Las actualizaciones condicionales atómicas y las restricciones eliminan la condición de carrera en lugar de reducir su probabilidad. Las respuestas avanzadas cubren la alta contención y la idempotencia.",
    example: "UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock;",
    tips: ["Explica la condición de carrera de leer y luego escribir.", "Muestra la actualización condicional atómica.", "Menciona las restricciones y la idempotencia."],
    commonMistakes: ["Comprobar el stock en el código de la aplicación antes de actualizar, sin bloqueo.", "Confiar en un nivel de aislamiento más alto sin gestionar los errores de serialización."],
    followUpQuestions: ["¿Cómo funcionaría esto con reservas que caducan a los 10 minutos?", "¿Qué cambia si el stock está repartido entre varios almacenes?"],
  },
  'db-030': {
    question: "¿Cómo se relacionan la replicación y la consistencia? Explica read-your-writes y el teorema CAP en la práctica.",
    intent: "El entrevistador evalúa un conocimiento avanzado de los compromisos de los datos distribuidos.",
    expectedAnswer:
      "Con replicación asíncrona, el primario confirma una escritura antes de que la reciban las réplicas, así que las réplicas van con retraso, normalmente de milisegundos, pero a veces de segundos bajo carga. Si una aplicación escribe en el primario y lee inmediatamente de una réplica, el usuario puede no ver su propio cambio, lo que rompe la consistencia read-your-writes (leer tus propias escrituras). Las soluciones incluyen enviar las lecturas de un usuario al primario durante un breve periodo después de que escriba, leer de las réplicas solo los datos en los que se acepta cierto desfase, usar replicación síncrona para los datos críticos a costa de la latencia de escritura, o pasar una posición del log para que la réplica espere hasta haberse puesto al día. El teorema CAP dice que, durante una partición de red, un sistema distribuido debe elegir entre consistencia, rechazando o retrasando algunas peticiones, y disponibilidad, respondiendo con datos posiblemente desactualizados. Fuera de las particiones, la extensión PACELC describe el compromiso entre latencia y consistencia. En la práctica, elijo según el caso de uso: los saldos de cuenta y el inventario necesitan consistencia fuerte, mientras que los catálogos de productos o la analítica pueden tolerar datos desactualizados.",
    explanation:
      "El retraso de replicación es la cara cotidiana del compromiso CAP. Los candidatos avanzados proponen técnicas concretas y eligen la consistencia según el caso de uso.",
    tips: ["Explica el retraso de replicación con un ejemplo visible para el usuario.", "Da soluciones prácticas.", "Menciona CAP y PACELC correctamente."],
    commonMistakes: ["Decir que puedes tener consistencia y disponibilidad durante una partición.", "Enviar todas las lecturas a las réplicas sin tener en cuenta el retraso."],
    followUpQuestions: ["¿Cuál es la diferencia entre replicación síncrona y asíncrona?", "¿Cómo monitorizas el retraso de replicación?"],
  },
  'db-031': {
    question: "¿Cómo abordas la optimización de una consulta SQL lenta?",
    intent: "El entrevistador comprueba que sigues un método de rendimiento estructurado y no te guías por intuiciones.",
    expectedAnswer:
      "Primero mido: cuánto tarda, con qué frecuencia se ejecuta y si es lenta siempre o solo con ciertos parámetros. Después miro el plan de ejecución con EXPLAIN ANALYZE para ver dónde se va el tiempo: escaneos completos de tablas grandes, nested loops sobre muchas filas, ordenaciones grandes o estimaciones de filas muy alejadas de la realidad. Las correcciones típicas son añadir o ajustar un índice que encaje con las cláusulas WHERE, JOIN y ORDER BY, seleccionar solo las columnas necesarias en lugar de SELECT *, evitar funciones sobre columnas indexadas, reescribir subconsultas correlacionadas, añadir paginación o límites y actualizar las estadísticas. Si la consulta es pesada por naturaleza, como un informe grande, considero la preagregación o una caché. Después de cada cambio, vuelvo a medir con volúmenes de datos realistas.",
    explanation:
      "Medir, leer el plan, cambiar una sola cosa y volver a medir: ese es el ciclo central de la optimización de consultas.",
    tips: ["Empieza por la medición y el plan de ejecución.", "Enumera las correcciones habituales.", "Prueba con volúmenes de datos realistas."],
    commonMistakes: ["Añadir índices al azar.", "Probar sobre una base de datos de desarrollo diminuta."],
    followUpQuestions: ["¿Qué significa un escaneo secuencial en un plan?", "¿Por qué se desaconseja SELECT *?"],
  },
  'db-032': {
    question: "¿Cómo lees la salida de EXPLAIN ANALYZE?",
    intent: "El entrevistador comprueba tu capacidad práctica para interpretar planes de ejecución.",
    expectedAnswer:
      "El plan es un árbol de operaciones que se lee desde los nodos más indentados, que se ejecutan primero, hasta la raíz. Cada nodo muestra su tipo, como Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan, Nested Loop, Hash Join, Merge Join o Sort, con el coste y las filas estimados y, con ANALYZE, el tiempo real, las filas reales y el número de bucles (loops). Busco los nodos con el mayor tiempo real, teniendo en cuenta que el tiempo es acumulativo y se multiplica por el número de loops. Una gran diferencia entre filas estimadas y reales indica estadísticas desactualizadas o insuficientes y a menudo explica una mala elección de join, como un nested loop sobre muchos miles de filas. Las ordenaciones o hashes que se vuelcan a disco apuntan a memoria insuficiente. Añadir BUFFERS muestra cuántas páginas se leyeron de la caché o del disco. Herramientas como explain.depesz.com o pgMustard facilitan la lectura de planes grandes.",
    explanation:
      "Los planes de ejecución muestran lo que la base de datos hace realmente. Comparar las estimaciones con las cifras reales es el hábito de diagnóstico más útil.",
    tips: ["Explica cómo leer el árbol.", "Destaca las filas estimadas frente a las reales.", "Menciona BUFFERS."],
    commonMistakes: ["Mirar solo la cifra del coste total.", "Olvidar que EXPLAIN ANALYZE ejecuta realmente la consulta."],
    followUpQuestions: ["¿Cuándo es un nested loop una buena elección?", "¿Cómo corregirías malas estimaciones de filas en columnas correlacionadas?"],
  },
  'db-033': {
    question: "¿Cómo acelerarías consultas analíticas pesadas sobre una base de datos transaccional grande?",
    intent: "El entrevistador comprueba tu capacidad para separar las cargas de trabajo analíticas y transaccionales.",
    expectedAnswer:
      "Las consultas analíticas que recorren y agregan millones de filas compiten con el tráfico transaccional. Primero optimizaría las propias consultas y añadiría índices adecuados. Después precalcularía resultados: vistas materializadas refrescadas de forma programada, con REFRESH MATERIALIZED VIEW CONCURRENTLY en PostgreSQL para no bloquear a los lectores, o tablas de resumen actualizadas de forma incremental, por ejemplo los ingresos diarios por producto. Particionar las tablas grandes por fecha permite que las consultas lean solo los periodos relevantes. Ejecutar los informes en una réplica de lectura los aísla del primario. Para necesidades mayores, llevaría la analítica a un data warehouse columnar como BigQuery, Snowflake o ClickHouse, alimentado por un pipeline ETL o de change data capture, porque el almacenamiento columnar lee solo las columnas necesarias y comprime bien. El compromiso es la frescura de los datos: los dashboards pueden ir minutos u horas por detrás, y eso debe ser aceptable para los usuarios.",
    explanation:
      "Separar las cargas OLTP y OLAP, mediante preagregación, réplicas o data warehouses, protege el rendimiento de la aplicación.",
    tips: ["Menciona las vistas materializadas y las tablas de resumen.", "Explica por qué los data warehouses columnares son más rápidos para la analítica.", "Habla de la frescura de los datos."],
    commonMistakes: ["Ejecutar informes pesados en el primario en horas punta.", "Refrescar una vista materializada grande cada minuto."],
    followUpQuestions: ["¿Cuál es la diferencia entre OLTP y OLAP?", "¿Cómo construirías una tabla de resumen incremental?"],
  },
  'db-034': {
    question: "Una consulta es rápida en staging pero muy lenta en producción. ¿Qué podría explicarlo?",
    intent: "El entrevistador evalúa un diagnóstico avanzado de problemas de rendimiento que dependen del entorno.",
    expectedAnswer:
      "La causa más común son los datos: producción tiene muchos más datos y una distribución distinta, así que el planificador elige otro plan, por ejemplo un nested loop que iba bien con cien filas pero es desastroso con un millón, o un valor muy frecuente que vuelve inútil un índice. Los datos sesgados, como un cliente enorme, pueden hacer que la misma consulta sea rápida para la mayoría de los parámetros y lenta para algunos. Las estadísticas pueden estar desactualizadas en producción tras una importación grande, o autovacuum puede ir con retraso y provocar bloat. Producción también tiene concurrencia: esperas de bloqueos, contención sobre filas muy solicitadas, un pool de conexiones saturado o E/S compartida con otras cargas de trabajo. La configuración puede diferir: parámetros de memoria como work_mem, índices que existen en staging pero faltan en producción, o una versión distinta de la base de datos. La caché de planes con sentencias preparadas puede producir un plan genérico malo para valores concretos. Para investigar, capturaría el plan real de producción con EXPLAIN ANALYZE o auto_explain, lo compararía con el de staging, revisaría pg_stat_statements en busca de variaciones según los parámetros y miraría los wait events. A largo plazo, staging debería usar volúmenes de datos similares a los de producción, anonimizados si hace falta.",
    explanation:
      "El rendimiento depende del volumen de datos, su distribución, la concurrencia y la configuración. Los candidatos avanzados comparan planes reales en lugar de hacer suposiciones.",
    tips: ["Empieza por el volumen y la distribución de los datos.", "Incluye la concurrencia, la configuración y la caché de planes.", "Explica cómo capturar el plan de producción."],
    commonMistakes: ["Suponer que el mismo código implica el mismo rendimiento.", "Probar solo con conjuntos de datos diminutos."],
    followUpQuestions: ["¿Qué hace auto_explain?", "¿Cómo crearías datos de prueba realistas pero anonimizados?"],
  },
  'db-035': {
    question: "¿Cómo añadirías una caché delante de una base de datos y qué problemas debes gestionar?",
    intent: "El entrevistador evalúa un diseño de caché avanzado y tu conciencia de los problemas de consistencia.",
    expectedAnswer:
      "El patrón más común es cache-aside: la aplicación lee de una caché como Redis; si no encuentra el dato (miss), lee la base de datos, guarda el resultado con un tiempo de vida (TTL) y lo devuelve. En las escrituras, actualiza la base de datos y después elimina la entrada de la caché, en lugar de actualizarla, para reducir las condiciones de carrera. Problemas que hay que gestionar: los datos desactualizados, limitados por el TTL y por la invalidación en las escrituras; el thundering herd o cache stampede, cuando una clave popular caduca y muchas peticiones golpean la base de datos a la vez, que se resuelve con agrupación de peticiones (request coalescing), un bloqueo por clave o un refresco anticipado con jitter; la cache penetration, cuando las peticiones de claves inexistentes fallan siempre, que se resuelve guardando brevemente los resultados negativos; la consistencia cuando la escritura en la base de datos tiene éxito pero falla el borrado en la caché, que se gestiona con reintentos o con invalidación basada en change data capture; y los límites de memoria, con una política de expulsión como LRU. Solo pondría en caché datos que se leen a menudo y toleran un breve desfase, nunca decisiones de autorización sin mucho cuidado, y monitorizaría la tasa de aciertos. La base de datos debe seguir siendo correcta si la caché está vacía o caída.",
    explanation:
      "Una caché es fácil de añadir y difícil de mantener correcta. Las respuestas avanzadas cubren la invalidación, las avalanchas de peticiones (stampedes), la caché de resultados negativos y los modos de fallo.",
    tips: ["Describe cache-aside con claridad.", "Explica los problemas de stampede e invalidación.", "Di qué no debería ponerse en caché."],
    commonMistakes: ["Usar una caché sin TTL ni estrategia de invalidación.", "Dejar que la aplicación falle cuando la caché no está disponible."],
    followUpQuestions: ["¿Cuál es la diferencia entre cache-aside y write-through?", "¿Cómo eliges un TTL?"],
  },
  'db-036': {
    question: "¿Qué son las claves primarias, las claves foráneas y la normalización?",
    intent: "El entrevistador comprueba los fundamentos del diseño relacional.",
    expectedAnswer:
      "Una clave primaria identifica de forma única cada fila de una tabla, como customer_id, y no puede ser NULL. Una clave foránea es una columna que hace referencia a la clave primaria de otra tabla, como orders.customer_id, que referencia customers.id; así la base de datos rechaza pedidos de clientes inexistentes y protege la integridad de los datos. La normalización organiza los datos para evitar duplicados: en lugar de repetir el nombre y la dirección del cliente en cada pedido, se guardan una sola vez en una tabla customers y se referencian. Esto evita incoherencias, como una dirección actualizada en un sitio pero no en otro, y simplifica las actualizaciones.",
    explanation:
      "Las claves y la normalización son la base de la integridad de los datos en las bases de datos relacionales.",
    tips: ["Usa un ejemplo con clientes y pedidos.", "Explica el problema que resuelve la normalización."],
    commonMistakes: ["No declarar las claves foráneas y confiar solo en el código de la aplicación."],
    followUpQuestions: ["¿Qué pasa con los pedidos cuando se elimina un cliente?", "¿Qué es una clave primaria compuesta?"],
  },
  'db-037': {
    question: "Explica las tres primeras formas normales. ¿Cuándo desnormalizarías?",
    intent: "El entrevistador comprueba un conocimiento de diseño más profundo y tu sentido práctico ante los compromisos.",
    expectedAnswer:
      "La primera forma normal exige valores atómicos: nada de listas en una columna, como varios números de teléfono en un mismo campo, ni grupos de columnas repetidos. La segunda forma normal, relevante para claves compuestas, exige que cada columna que no es clave dependa de la clave completa y no de una parte: en una tabla order_items con clave por pedido y producto, el nombre del producto depende solo del producto y debe estar en la tabla products. La tercera forma normal exige que las columnas que no son clave dependan solo de la clave y no de otras columnas no clave: guardar a la vez una ciudad y su país en una tabla customers, cuando el país depende de la ciudad, crea redundancia. Desnormalizar es añadir redundancia deliberadamente por rendimiento o sencillez, por ejemplo guardar el total del pedido, copiar el precio del producto en el momento de la compra, que además es un requisito de negocio, o mantener modelos de lectura para informes. Debe hacerse de forma controlada, con una fuente de verdad clara y un mecanismo para mantener las copias sincronizadas.",
    explanation:
      "Las formas normales reducen las anomalías. Desnormalizar de forma intencionada, con un plan para mantener los datos coherentes, es señal de un diseño maduro.",
    tips: ["Da un ejemplo de violación para cada forma.", "Nombra un caso en que desnormalizar es correcto, como el precio en el momento de la compra."],
    commonMistakes: ["Desnormalizar pronto sin una necesidad medida.", "Confundir los datos históricos, como el precio en el momento de la compra, con redundancia."],
    followUpQuestions: ["¿Cómo mantendrías sincronizado un total desnormalizado?", "¿Qué es la BCNF?"],
  },
  'db-038': {
    question: "¿Deberías usar enteros autoincrementales o UUID como claves primarias?",
    intent: "El entrevistador comprueba tu criterio práctico de diseño en materia de identificadores.",
    expectedAnswer:
      "Los enteros autoincrementales, como las columnas identity BIGINT, son compactos, rápidos de indexar y fáciles de leer, pero revelan información, como el número de pedidos, son adivinables en las URL y los genera una única base de datos, lo que complica fusionar datos o generar ID en los clientes. Los UUID pueden generarse en cualquier lugar sin coordinación, lo que ayuda en sistemas distribuidos, clientes sin conexión e importaciones de datos, y no revelan cantidades. Los UUID aleatorios, versión 4, provocan inserciones dispersas en los índices B-tree e índices más grandes, lo que perjudica el rendimiento de escritura en tablas grandes. Los UUID ordenados por tiempo, como UUIDv7, estandarizado en 2024, conservan las ventajas e insertan en un orden aproximadamente secuencial. Un compromiso habitual es una clave entera interna para los joins y un UUID o slug público independiente para el uso externo. Sea cual sea la elección, los ID no deben usarse como mecanismo de autorización.",
    explanation:
      "La decisión equilibra rendimiento, seguridad, distribución y legibilidad. Mencionar UUIDv7 demuestra conocimientos actualizados.",
    tips: ["Compara ambos en rendimiento, seguridad y distribución.", "Menciona UUIDv7."],
    commonMistakes: ["Confiar en ID imposibles de adivinar en lugar de controles de acceso.", "Usar UUID aleatorios en tablas muy grandes con mucha escritura sin considerar el impacto en los índices."],
    followUpQuestions: ["¿Qué riesgos de seguridad tienen los ID secuenciales en las URL?", "¿Cómo generas ID en una app offline-first?"],
  },
  'db-039': {
    question: "¿Cómo cambiarías el esquema de una tabla grande en producción sin tiempo de inactividad?",
    intent: "El entrevistador evalúa prácticas avanzadas y seguras de migración en sistemas en producción.",
    expectedAnswer:
      "Usaría el patrón expand and contract (expandir y contraer) para que las versiones antigua y nueva de la aplicación funcionen durante la transición. Para renombrar una columna, por ejemplo: primero añado la nueva columna, nullable y sin un valor por defecto costoso, lo cual es rápido; despliego código que escribe en ambas columnas; relleno las filas existentes (backfill) en lotes pequeños con pausas, para evitar bloqueos largos, transacciones enormes y retraso de replicación; después paso las lecturas a la nueva columna; y solo cuando todo el código en ejecución la usa, elimino la columna antigua en una versión posterior. Algunas operaciones requieren cuidado: en PostgreSQL, crear los índices con CREATE INDEX CONCURRENTLY, añadir las claves foráneas y las restricciones CHECK como NOT VALID y validarlas por separado, y fijar un lock_timeout para que una migración que espera un bloqueo no bloquee todo el tráfico detrás de ella. Añadir una columna con un valor por defecto constante es rápido desde PostgreSQL 11, pero cambiar el tipo de una columna normalmente reescribe la tabla. Las migraciones se versionan con herramientas como Flyway o Liquibase, se prueban en una copia de tamaño real de producción y se monitorizan durante su ejecución, con un plan de rollback para cada paso.",
    explanation:
      "Las migraciones sin tiempo de inactividad se basan en pasos compatibles hacia atrás, rellenos por lotes y DDL consciente de los bloqueos. Los candidatos avanzados saben qué operaciones bloquean o reescriben las tablas.",
    tips: ["Explica expand and contract.", "Menciona los rellenos por lotes y lock_timeout.", "Nombra la creación concurrente de índices y las restricciones NOT VALID."],
    commonMistakes: ["Renombrar o eliminar una columna en la misma versión que el cambio de código.", "Ejecutar un único UPDATE gigantesco sobre millones de filas."],
    followUpQuestions: ["¿Cómo cambiarías el tipo de una columna de INT a BIGINT en una tabla enorme?", "¿Cómo pruebas una migración antes de ejecutarla en producción?"],
  },
  'db-040': {
    question: "¿Cómo diseñarías la base de datos de una aplicación SaaS multi-tenant?",
    intent: "El entrevistador evalúa habilidades avanzadas de arquitectura para equilibrar aislamiento, coste y operación.",
    expectedAnswer:
      "Hay tres modelos principales. Un esquema compartido guarda todos los tenants en las mismas tablas con una columna tenant_id: es el más barato y el más sencillo de operar y migrar, pero cada consulta debe filtrar por tenant, y un tenant grande puede afectar a los demás. En PostgreSQL, las políticas de row-level security pueden imponer el filtro por tenant en la propia base de datos como red de seguridad, y los índices compuestos deberían empezar por tenant_id. Un esquema por tenant ofrece una separación más fuerte y facilita exportar o restaurar cada tenant, pero las migraciones deben ejecutarse en muchos esquemas y el número de objetos crece rápido. Una base de datos por tenant ofrece el aislamiento más fuerte, ajuste por tenant y residencia de datos, algo que pueden exigir los clientes grandes o regulados, con el mayor coste operativo. Muchos productos usan un modelo híbrido: esquema compartido para la mayoría de los tenants y bases de datos dedicadas para los clientes enterprise, con una capa de enrutamiento que asigna cada tenant a su base de datos. También planificaría copias de seguridad y borrados por tenant para las solicitudes de privacidad, protección frente a vecinos ruidosos (noisy neighbours), como límites de tasa por tenant, y sharding por tenant si la base de datos compartida crece demasiado.",
    explanation:
      "La multi-tenencia es un compromiso entre aislamiento y coste. Las respuestas avanzadas incluyen mecanismos de control como row-level security y planifican el crecimiento y el cumplimiento normativo.",
    tips: ["Compara los tres modelos.", "Menciona row-level security y los índices que empiezan por tenant.", "Cubre el cumplimiento normativo, el borrado y los vecinos ruidosos."],
    commonMistakes: ["Confiar solo en el código de la aplicación para filtrar por tenant.", "Elegir una base de datos por tenant para miles de tenants pequeños."],
    followUpQuestions: ["¿Cómo moverías un tenant de la base de datos compartida a una dedicada?", "¿Cómo ejecutas migraciones en muchos esquemas de tenants?"],
  },
};
