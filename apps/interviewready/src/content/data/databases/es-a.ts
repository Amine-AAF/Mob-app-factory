import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de bases de datos 001-020: SQL, PostgreSQL, MongoDB, índices (parte). */
export const esA: TextTable<QuestionText> = {
  'db-001': {
    question: "Explica los distintos tipos de JOIN en SQL.",
    intent: "El entrevistador comprueba una habilidad básica de SQL que se usa en casi cualquier tarea con datos.",
    expectedAnswer:
      "Un INNER JOIN devuelve solo las filas que tienen coincidencia en ambas tablas, por ejemplo los pedidos que tienen un cliente. Un LEFT JOIN devuelve todas las filas de la tabla izquierda y las filas coincidentes de la derecha, con NULL donde no hay coincidencia; así se encuentran los clientes sin pedidos: se hace LEFT JOIN con orders y se conservan las filas en las que el ID del pedido es NULL. Un RIGHT JOIN hace lo contrario y se usa poco. Un FULL OUTER JOIN conserva las filas de ambos lados, emparejadas cuando es posible. Un CROSS JOIN devuelve todas las combinaciones de filas. Un self join une una tabla consigo misma, por ejemplo los empleados con sus responsables.",
    explanation:
      "Elegir el join adecuado determina qué filas aparecen en el resultado. LEFT JOIN con una comprobación de NULL es un patrón clásico para encontrar relaciones que faltan.",
    example: "SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;",
    tips: ["Da un ejemplo de negocio para cada tipo de join.", "Muestra el patrón de «filas sin coincidencia»."],
    commonMistakes: ["Poner una condición sobre la tabla derecha en el WHERE, lo que convierte un LEFT JOIN en un INNER JOIN.", "Olvidar la condición de unión y generar un producto cartesiano."],
    followUpQuestions: ["¿Qué diferencia hay entre filtrar en ON y en WHERE en un LEFT JOIN?", "¿Cómo encontrarías filas duplicadas?"],
  },
  'db-002': {
    question: "¿Cuál es la diferencia entre WHERE y HAVING?",
    intent: "El entrevistador comprueba que entiendes el orden lógico de ejecución de SQL.",
    expectedAnswer:
      "WHERE filtra filas individuales antes de la agrupación, por lo que no puede usar funciones de agregación. HAVING filtra grupos después de GROUP BY, así que sí puede usar agregados como COUNT o SUM. Por ejemplo, para listar los clientes con más de cinco pedidos pagados: WHERE status = 'PAID' conserva solo los pedidos pagados, GROUP BY customer_id los agrupa y HAVING COUNT(*) > 5 conserva los grupos con más de cinco. Filtrar lo antes posible con WHERE también es más eficiente, porque se agrupan menos filas.",
    explanation:
      "SQL se evalúa en un orden lógico: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Este orden explica qué valores puede usar cada cláusula.",
    tips: ["Da un ejemplo que combine ambas cláusulas.", "Menciona el orden lógico de ejecución."],
    commonMistakes: ["Usar HAVING para condiciones que corresponden al WHERE.", "Intentar usar un agregado en el WHERE."],
    followUpQuestions: ["¿Por qué no puedes usar un alias del SELECT en el WHERE?", "¿Qué cuenta COUNT(*) en comparación con COUNT(column)?"],
  },
  'db-003': {
    question: "¿Cuál es la diferencia entre COUNT(*), COUNT(column) y COUNT(DISTINCT column)?",
    intent: "El entrevistador comprueba tu precisión con los agregados y los valores NULL, una fuente habitual de cifras erróneas en los informes.",
    expectedAnswer:
      "COUNT(*) cuenta todas las filas del grupo, incluidas las que tienen valores NULL. COUNT(column) cuenta solo las filas en las que esa columna no es NULL. COUNT(DISTINCT column) cuenta el número de valores distintos no NULL. Por ejemplo, en una tabla de pedidos, COUNT(*) da el número de pedidos, COUNT(coupon_code) el número de pedidos que usaron un cupón y COUNT(DISTINCT customer_id) el número de clientes distintos que hicieron un pedido. Otros agregados como SUM y AVG también ignoran los NULL, así que AVG puede diferir de SUM dividido entre COUNT(*).",
    explanation:
      "Los agregados tratan NULL de forma distinta al resto de valores. Saberlo evita métricas incorrectas que pasan desapercibidas.",
    tips: ["Usa una sola tabla para ilustrar los tres conteos.", "Menciona que AVG ignora los NULL."],
    commonMistakes: ["Usar COUNT(column) cuando querías el número de filas.", "Suponer que AVG trata NULL como cero."],
    followUpQuestions: ["¿Cómo contarías los pedidos por estado en una sola consulta?", "¿Cómo reemplazas NULL por un valor por defecto?"],
  },
  'db-004': {
    question: "¿Cuándo usarías una subconsulta, un JOIN o EXISTS?",
    intent: "El entrevistador comprueba tu criterio al escribir consultas y tu conocimiento de las diferencias semánticas.",
    expectedAnswer:
      "Un JOIN es lo mejor cuando necesitas columnas de ambas tablas en el resultado. EXISTS comprueba si existe al menos una fila relacionada, como los clientes que han hecho un pedido, y devuelve cada cliente una sola vez sin duplicados, que un JOIN sí podría generar si un cliente tiene varios pedidos. Una subconsulta escalar devuelve un único valor, por ejemplo para comparar cada producto con el precio medio. IN con una subconsulta funciona como EXISTS para comprobar pertenencia simple, pero NOT IN es peligroso: si la subconsulta devuelve algún NULL, NOT IN no devuelve ninguna fila, por lo que NOT EXISTS es más seguro. Los optimizadores modernos suelen reescribir estas formas en planes similares, así que la legibilidad y la corrección suelen importar más que la microoptimización, aunque el plan de ejecución debe confirmarlo.",
    explanation:
      "La elección depende de si necesitas datos de la otra tabla, de si importan los duplicados y de cómo se comportan los NULL. La trampa de NOT IN es un punto clásico de entrevista.",
    tips: ["Menciona los duplicados que generan los joins.", "Explica el problema de NOT IN con NULL."],
    commonMistakes: ["Usar DISTINCT para ocultar duplicados causados por un join.", "Usar NOT IN sobre una columna que admite NULL."],
    followUpQuestions: ["¿Qué es una subconsulta correlacionada?", "¿Cómo comprobarías qué versión se ejecuta más rápido?"],
  },
  'db-005': {
    question: "¿Qué son las funciones de ventana y cuándo las usas?",
    intent: "El entrevistador comprueba habilidades de SQL de nivel intermedio muy usadas en analítica e informes.",
    expectedAnswer:
      "Una función de ventana calcula un valor sobre un conjunto de filas relacionadas con la fila actual, sin colapsarlas en una sola fila como hace GROUP BY. Usa OVER, con un PARTITION BY opcional para definir grupos y un ORDER BY para definir el orden dentro de cada grupo. Entre las funciones habituales están ROW_NUMBER, que numera las filas; RANK y DENSE_RANK, que tratan los empates de forma distinta; LAG y LEAD, que acceden a la fila anterior o siguiente, por ejemplo para comparar este mes con el anterior; y agregados como SUM() OVER (ORDER BY date) para totales acumulados. Un uso típico es encontrar el último pedido de cada cliente: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) y conservar las filas con el número 1.",
    explanation:
      "Las funciones de ventana resuelven con elegancia rankings, totales acumulados y comparaciones entre filas, y sustituyen a self joins complejos.",
    example: "SELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS change FROM monthly_revenue;",
    tips: ["Explica PARTITION BY y ORDER BY dentro de OVER.", "Da un ejemplo de «última fila por grupo»."],
    commonMistakes: ["Filtrar por una función de ventana en el WHERE, lo cual no está permitido; usa una CTE o una subconsulta.", "Confundir RANK y DENSE_RANK."],
    followUpQuestions: ["¿Qué es un marco de ventana, como ROWS BETWEEN 6 PRECEDING AND CURRENT ROW?", "¿Cómo calcularías una media móvil de 7 días?"],
  },
  'db-006': {
    question: "¿Cómo trata SQL los NULL y qué trampas generan?",
    intent: "El entrevistador comprueba que entiendes la lógica de tres valores, que provoca errores sutiles.",
    expectedAnswer:
      "NULL significa desconocido o ausente, no cero ni una cadena vacía. Cualquier comparación con NULL, incluso NULL = NULL, devuelve UNKNOWN en lugar de verdadero o falso, y WHERE solo conserva las filas en las que la condición es verdadera. Por eso hay que usar IS NULL o IS NOT NULL. Entre las trampas: column <> 'X' excluye las filas en las que la columna es NULL; NOT IN con una subconsulta que contiene NULL no devuelve nada; los agregados ignoran los NULL; la aritmética con NULL devuelve NULL; y las restricciones de unicidad en la mayoría de las bases de datos admiten varios NULL. COALESCE reemplaza NULL por un valor por defecto, e IS DISTINCT FROM, en PostgreSQL y en SQL estándar, compara valores tratando los NULL como iguales.",
    explanation:
      "La lógica de tres valores explica muchos errores de «filas que faltan». Ser explícito en el tratamiento de NULL hace que las consultas sean correctas y legibles.",
    tips: ["Menciona la lógica de tres valores.", "Da los ejemplos de la desigualdad y de NOT IN."],
    commonMistakes: ["Escribir WHERE column = NULL.", "Olvidar que los filtros de desigualdad descartan las filas con NULL."],
    followUpQuestions: ["¿Una columna debería admitir NULL o tener un valor por defecto?", "¿Cómo se comportan los NULL en ORDER BY?"],
  },
  'db-007': {
    question: "¿Qué es una CTE y cuándo usarías una CTE recursiva?",
    intent: "El entrevistador comprueba que sabes estructurar consultas legibles y manejar datos jerárquicos.",
    expectedAnswer:
      "Una common table expression, escrita WITH name AS (SELECT ...), define un resultado temporal con nombre que se usa en la consulta principal. Las CTE hacen legibles las consultas complejas al dividirlas en pasos, como calcular primero los totales mensuales y luego comparar los meses. En PostgreSQL 12 y posteriores, el optimizador integra (inline) las CTE simples salvo que se marquen como MATERIALIZED, así que ya no actúan por defecto como barreras de optimización. Una CTE recursiva, WITH RECURSIVE, tiene una consulta ancla y una parte recursiva que hace referencia a la propia CTE. Se usa para recorrer jerarquías y grafos: un organigrama, categorías anidadas o una lista de materiales. Necesita una condición de terminación y, en grafos que pueden tener ciclos, una forma de detectarlos, por ejemplo registrando el camino recorrido.",
    explanation:
      "Las CTE mejoran la legibilidad; las CTE recursivas permiten consultar árboles y grafos en SQL puro.",
    example: "WITH RECURSIVE chain AS (\n  SELECT id, manager_id, name FROM employees WHERE id = 42\n  UNION ALL\n  SELECT e.id, e.manager_id, e.name FROM employees e JOIN chain c ON e.id = c.manager_id\n) SELECT * FROM chain;",
    tips: ["Muestra un uso para legibilidad y otro recursivo.", "Menciona la terminación y los ciclos."],
    commonMistakes: ["Escribir una CTE recursiva sin condición de parada.", "Suponer que las CTE siempre se materializan."],
    followUpQuestions: ["¿Cómo almacenarías una jerarquía si la consultas con mucha frecuencia?", "¿Cuál es la diferencia entre UNION y UNION ALL?"],
  },
  'db-008': {
    question: "Escribe una consulta para encontrar los tres productos con más ingresos de cada categoría y explica tus decisiones.",
    intent: "El entrevistador evalúa tu capacidad avanzada de resolver problemas en SQL, el tratamiento de empates y tu atención al rendimiento.",
    expectedAnswer:
      "Primero calcularía los ingresos por producto, luego haría un ranking dentro de cada categoría con una función de ventana y filtraría en una consulta externa, porque las funciones de ventana no se pueden usar en el WHERE. En SQL: WITH revenue AS (SELECT p.category_id, p.id, p.name, SUM(oi.quantity * oi.unit_price) AS total FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category_id, p.id, p.name), ranked AS (SELECT *, DENSE_RANK() OVER (PARTITION BY category_id ORDER BY total DESC) AS rnk FROM revenue) SELECT * FROM ranked WHERE rnk <= 3. La función de ranking depende de las reglas de negocio para los empates: ROW_NUMBER devuelve exactamente tres filas por categoría, rompiendo los empates de forma arbitraria salvo que añada un criterio de desempate como id; RANK puede saltarse posiciones y DENSE_RANK puede devolver más de tres productos cuando los valores son iguales. También aclararía qué significa «ingresos», por ejemplo si se excluyen pedidos cancelados o reembolsos, y el periodo de tiempo. Para el rendimiento en tablas grandes, un índice en order_items(product_id) ayuda al join y, para dashboards frecuentes, preagregaría los ingresos en una vista materializada o una tabla resumen. En PostgreSQL, un LATERAL join con LIMIT 3 por categoría es una alternativa que puede ser más rápida cuando hay pocas categorías y existe un índice adecuado.",
    explanation:
      "El patrón «top N por grupo» pone a prueba las funciones de ventana, la semántica de los empates y la aclaración de requisitos. Los candidatos avanzados también comentan alternativas de rendimiento.",
    tips: ["Aclara la definición de ingresos y el periodo.", "Explica el efecto de cada función de ranking sobre los empates.", "Comenta el rendimiento en tablas grandes."],
    commonMistakes: ["Usar LIMIT 3 sobre todo el resultado, lo que devuelve tres productos en total.", "Ignorar los empates."],
    followUpQuestions: ["¿Cómo mostrarías la participación de cada producto en los ingresos de su categoría?", "¿Cómo harías que esta consulta fuera rápida con mil millones de filas?"],
  },
  'db-009': {
    question: "¿Por qué tantos equipos eligen PostgreSQL? ¿Cuáles son sus principales características?",
    intent: "El entrevistador comprueba que conoces una de las bases de datos relacionales más usadas.",
    expectedAnswer:
      "PostgreSQL es una base de datos relacional de código abierto conocida por su fiabilidad, su conformidad con los estándares y su extensibilidad. Entre sus características clave están las transacciones ACID completas con MVCC, que permite que lectores y escritores trabajen sin bloquearse entre sí; tipos de datos ricos como JSONB, arrays, rangos y UUID; indexación avanzada como B-tree, GIN para búsqueda de texto completo y JSON, GiST para datos geográficos e índices parciales; funciones de ventana y CTE; extensiones como PostGIS para datos geoespaciales, pg_stat_statements para estadísticas de consultas y pgvector para embeddings; y un sólido ecosistema de servicios gestionados en todas las grandes nubes. Se adapta a la mayoría de las aplicaciones transaccionales y a muchas cargas analíticas de gran tamaño.",
    explanation:
      "Los entrevistadores quieren ver que sabes por qué PostgreSQL es una opción por defecto habitual y qué características usarías realmente.",
    tips: ["Menciona MVCC, JSONB y las extensiones.", "Relaciona las características con casos de uso reales."],
    commonMistakes: ["Enumerar características sin ejemplos de cuándo resultan útiles."],
    followUpQuestions: ["¿Cuándo no elegirías PostgreSQL?", "¿Para qué se usa pgvector?"],
  },
  'db-010': {
    question: "¿Qué es MVCC en PostgreSQL y por qué necesita VACUUM?",
    intent: "El entrevistador comprueba que entiendes aspectos internos de PostgreSQL que afectan al rendimiento y al mantenimiento.",
    expectedAnswer:
      "Multi-Version Concurrency Control significa que PostgreSQL no sobrescribe una fila en su sitio. Un UPDATE crea una nueva versión de la fila y marca la antigua como obsoleta; un DELETE marca la fila como eliminada. Cada transacción ve una instantánea (snapshot) de las versiones confirmadas cuando empezó, así que los lectores no bloquean a los escritores y los escritores no bloquean a los lectores. El coste es que se acumulan versiones antiguas de filas, llamadas dead tuples. VACUUM recupera su espacio para reutilizarlo, actualiza la información de visibilidad y evita el transaction ID wraparound, un problema grave si VACUUM nunca se ejecuta. Autovacuum lo hace automáticamente, pero las tablas con muchas actualizaciones pueden necesitar ajustes específicos; si no, las tablas y los índices se inflan (bloat) y las consultas se ralentizan. Las transacciones de larga duración también impiden la limpieza, porque aún podrían necesitar versiones antiguas.",
    explanation:
      "MVCC explica tanto la buena concurrencia de PostgreSQL como sus necesidades de mantenimiento. Mencionar las transacciones largas y el wraparound demuestra un conocimiento más profundo.",
    tips: ["Explica las versiones de filas y las instantáneas.", "Menciona autovacuum y el efecto de las transacciones largas."],
    commonMistakes: ["Desactivar autovacuum para mejorar el rendimiento.", "Dejar transacciones abiertas durante horas en el código de la aplicación."],
    followUpQuestions: ["¿Qué es el table bloat y cómo lo detectas?", "¿Cuál es la diferencia entre VACUUM y VACUUM FULL?"],
  },
  'db-011': {
    question: "¿Cuándo guardarías datos en una columna JSONB en lugar de en columnas normales?",
    intent: "El entrevistador comprueba tu criterio de diseño de esquemas para datos semiestructurados en una base de datos relacional.",
    expectedAnswer:
      "JSONB es útil para datos cuya estructura varía o evoluciona con frecuencia y que se leen sobre todo de forma completa, como atributos de producto que cambian según la categoría, preferencias de usuario, payloads de webhooks de terceros o detalles de auditoría. PostgreSQL almacena JSONB en formato binario, ofrece operadores para consultar dentro de los documentos y permite indexarlo con índices GIN o con índices de expresión sobre claves concretas. Las columnas normales son mejores para datos que se consultan, filtran, unen o agregan con frecuencia, que necesitan restricciones como NOT NULL, claves foráneas o tipos, o que son centrales en el dominio, como precios y estados. Un enfoque habitual es híbrido: los campos principales como columnas y los extras flexibles en una columna JSONB. Abusar de JSONB hace perder la seguridad de tipos y las restricciones, y vuelve más difícil razonar sobre las consultas y las migraciones.",
    explanation:
      "La decisión equilibra flexibilidad frente a integridad y rendimiento de las consultas. Un modelo híbrido suele ser la mejor respuesta.",
    tips: ["Da ejemplos de buen y mal uso de JSONB.", "Menciona los índices GIN y los índices de expresión."],
    commonMistakes: ["Guardarlo todo en JSONB para no diseñar un esquema.", "Poner claves foráneas dentro de documentos JSON."],
    followUpQuestions: ["¿Cómo indexarías una clave de JSONB que se consulta con frecuencia?", "¿Cómo validas la estructura de una columna JSONB?"],
  },
  'db-012': {
    question: "Una base de datos PostgreSQL se ha vuelto lenta en producción. ¿Cómo lo investigas?",
    intent: "El entrevistador evalúa una resolución de problemas de bases de datos avanzada y sistemática.",
    expectedAnswer:
      "Primero comprobaría si el problema es global o se limita a algunas consultas, usando la monitorización de CPU, memoria, E/S de disco, conexiones y retraso de replicación, y lo correlacionaría con despliegues recientes o cambios de tráfico. Para encontrar las consultas costosas, pg_stat_statements las ordena por tiempo total, tiempo medio y número de llamadas; a menudo una consulta nueva o una consulta cuyo plan ha cambiado explica la mayor parte de la carga. Las examinaría con EXPLAIN (ANALYZE, BUFFERS) en una copia segura o con cuidado en producción. pg_stat_activity muestra lo que se está ejecutando en este momento, las transacciones largas y las sesiones que esperan locks; pg_locks y las columnas wait_event identifican los bloqueos. Revisaría el bloat de tablas e índices y si autovacuum da abasto, usando pg_stat_user_tables para ver los dead tuples y las fechas del último vacuum, y comprobaría que las estadísticas están actualizadas. La saturación de conexiones sugiere la necesidad de un pooler como PgBouncer. Las soluciones van desde añadir o ajustar un índice, reescribir una consulta o actualizar las estadísticas, hasta ajustar parámetros de memoria como work_mem y shared_buffers, terminar una transacción descontrolada o escalar. Tras corregirlo, añadiría alertas sobre consultas lentas y transacciones largas.",
    explanation:
      "Un enfoque estructurado va de las métricas globales a las consultas concretas, los locks y el mantenimiento. Conocer las vistas del sistema relevantes demuestra experiencia real con PostgreSQL.",
    tips: ["Menciona pg_stat_statements y pg_stat_activity.", "Revisa los locks, el bloat y autovacuum.", "Correlaciona con los cambios recientes."],
    commonMistakes: ["Reiniciar la base de datos sin recopilar evidencias.", "Ejecutar EXPLAIN ANALYZE sobre una consulta de escritura pesada en producción sin envolverla en una transacción con rollback."],
    followUpQuestions: ["¿Qué harías si una migración mantiene un lock que bloquea el tráfico?", "¿Cómo eliges un valor para work_mem?"],
  },
  'db-013': {
    question: "¿Cómo escalarías una base de datos PostgreSQL a medida que crece una aplicación?",
    intent: "El entrevistador evalúa tu pensamiento arquitectónico avanzado sobre la capacidad de la base de datos y sus compromisos.",
    expectedAnswer:
      "Escalaría por etapas, empezando por las opciones más baratas. Primero, optimizar: corregir las consultas lentas, añadir los índices adecuados y reducir la carga innecesaria, como las consultas N+1. Segundo, añadir connection pooling con PgBouncer, porque PostgreSQL usa un proceso por conexión y demasiadas conexiones desperdician memoria. Tercero, añadir caché para los datos que se leen con frecuencia, con Redis o cachés de aplicación. Cuarto, escalar verticalmente con más CPU, más memoria y almacenamiento más rápido, algo sencillo y que a menudo basta durante mucho tiempo. Quinto, añadir réplicas de lectura para cargas con muchas lecturas, teniendo en cuenta el retraso de replicación: las lecturas que deben ver la última escritura del usuario deben ir al primario. Sexto, particionar las tablas muy grandes, por ejemplo por fecha, para que las consultas y el mantenimiento afecten a fragmentos más pequeños y los datos antiguos puedan eliminarse rápidamente. Por último, para volúmenes de escritura que un único primario no puede soportar, distribuir los datos en varias bases de datos (sharding) según una clave como el ID del tenant, ya sea en la aplicación o con una extensión como Citus; esto añade una complejidad considerable a las consultas y transacciones entre shards. Archivar los datos antiguos y trasladar la analítica a un data warehouse separado también alivian la base de datos principal.",
    explanation:
      "Escalar es una secuencia de pasos cada vez más complejos. Los candidatos avanzados agotan primero las opciones sencillas y entienden las implicaciones de consistencia de las réplicas y del sharding.",
    tips: ["Ordena las opciones de la más sencilla a la más compleja.", "Menciona el retraso de replicación y read-your-writes.", "Explica el coste del sharding."],
    commonMistakes: ["Saltar directamente al sharding.", "Enviar todas las lecturas a las réplicas sin tener en cuenta el retraso."],
    followUpQuestions: ["¿Cómo elegirías una shard key?", "¿Cuándo trasladarías la analítica a un data warehouse?"],
  },
  'db-014': {
    question: "¿Qué es una base de datos documental como MongoDB y en qué se diferencia de una base de datos relacional?",
    intent: "El entrevistador comprueba que entiendes los modelos documentales NoSQL y sus compromisos.",
    expectedAnswer:
      "MongoDB almacena los datos como documentos, objetos similares a JSON en formato BSON, agrupados en colecciones. Los documentos pueden contener objetos y arrays anidados, y los documentos de una misma colección no necesitan tener los mismos campos. Los datos que se usan juntos pueden guardarse juntos, por ejemplo un pedido con sus artículos, lo que evita joins en las lecturas habituales. Las bases de datos relacionales almacenan los datos en tablas con un esquema fijo, garantizan las relaciones con claves foráneas y son muy potentes para consultas complejas y joins. MongoDB ofrece esquemas flexibles, escalado horizontal mediante sharding y un potente aggregation pipeline, y admite transacciones multidocumento desde la versión 4.0, pero los datos muy relacionales con muchos joins suelen ser más naturales en SQL.",
    explanation:
      "La diferencia principal está en el modelado de datos: documentos diseñados según los patrones de acceso frente a tablas normalizadas diseñadas según las relaciones.",
    tips: ["Menciona el esquema flexible y los documentos anidados.", "Da un caso de uso adecuado para cada modelo."],
    commonMistakes: ["Decir que MongoDB no tiene ningún esquema; el esquema es implícito y hay que diseñarlo.", "Decir que MongoDB no admite transacciones."],
    followUpQuestions: ["¿Cómo validas la estructura de los documentos en MongoDB?", "¿Cuándo incrustarías los datos y cuándo los referenciarías?"],
  },
  'db-015': {
    question: "En MongoDB, ¿cómo decides entre incrustar y referenciar datos relacionados?",
    intent: "El entrevistador comprueba tus habilidades prácticas de modelado documental.",
    expectedAnswer:
      "Parto de los patrones de acceso: qué datos se leen y se escriben juntos. Incrustar (embedding) coloca los datos relacionados dentro del documento padre, como las líneas de pedido dentro de un pedido o las direcciones dentro de un cliente. Conviene cuando los datos hijos pertenecen a un solo padre, se leen con él la mayoría de las veces, tienen un tamaño acotado y no se actualizan de forma independiente con mucha frecuencia; una sola lectura lo devuelve todo y las actualizaciones del documento completo son atómicas. Referenciar guarda un ID que apunta a otro documento, como una clave foránea. Es mejor cuando los datos relacionados los comparten muchos documentos, como los productos referenciados por los pedidos; cuando crecen sin límite, como comentarios o eventos, porque los documentos tienen un límite de 16 MB y los arrays grandes perjudican el rendimiento; o cuando se actualizan de forma independiente. Un compromiso habitual es incrustar algunos campos que se necesitan a menudo, como el nombre y el precio del producto en el momento del pedido, y referenciar el resto.",
    explanation:
      "El diseño documental sigue a las consultas, no solo a las relaciones entre entidades. El crecimiento acotado frente al ilimitado es un criterio clave.",
    tips: ["Parte de los patrones de acceso.", "Menciona el límite de tamaño de los documentos y los arrays ilimitados.", "Propón el compromiso de la duplicación parcial."],
    commonMistakes: ["Incrustar listas ilimitadas, como todos los logs de un usuario.", "Normalizarlo todo y después hacer muchos lookups."],
    followUpQuestions: ["¿Cómo mantienes actualizados los campos duplicados?", "¿Qué es la etapa $lookup?"],
  },
  'db-016': {
    question: "¿Qué es el aggregation pipeline de MongoDB?",
    intent: "El entrevistador comprueba tu capacidad para procesar y analizar datos dentro de MongoDB.",
    expectedAnswer:
      "El aggregation pipeline procesa los documentos a través de una secuencia de etapas, cada una de las cuales transforma los resultados de la anterior. Las etapas habituales son $match para filtrar, $group para agregar con operadores como $sum y $avg, $project o $set para remodelar los campos, $sort, $limit, $unwind para convertir los elementos de un array en documentos separados y $lookup para unir otra colección. Por ejemplo, para calcular los ingresos por categoría de producto de los pedidos pagados: $match sobre el estado, $unwind de los artículos, $group por categoría con $sum del precio por la cantidad y, por último, $sort. Para el rendimiento, $match y $sort deben ir al principio para poder usar índices y reducir el número de documentos, y los resultados intermedios grandes pueden requerir allowDiskUse.",
    explanation:
      "El pipeline es el equivalente en MongoDB del GROUP BY, los joins y las transformaciones de SQL. El orden de las etapas influye mucho en el rendimiento.",
    example: "db.orders.aggregate([\n  { $match: { status: \"paid\" } },\n  { $unwind: \"$items\" },\n  { $group: { _id: \"$items.category\", revenue: { $sum: { $multiply: [\"$items.price\", \"$items.qty\"] } } } },\n  { $sort: { revenue: -1 } }\n])",
    tips: ["Enumera las etapas principales.", "Explica por qué $match debe ir al principio."],
    commonMistakes: ["Poner $match después de etapas costosas.", "Usar $lookup de forma intensiva como si la base de datos fuera relacional."],
    followUpQuestions: ["¿Cómo comprobarías que un pipeline usa un índice?", "¿Para qué sirve $facet?"],
  },
  'db-017': {
    question: "¿Cómo funciona el sharding en MongoDB y cómo eliges una shard key?",
    intent: "El entrevistador evalúa tu conocimiento avanzado del escalado horizontal y sus trampas.",
    expectedAnswer:
      "El sharding distribuye una colección entre varios shards, cada uno de ellos un replica set, de modo que el volumen de datos y la carga de escritura se reparten entre muchas máquinas. Un router, mongos, dirige las consultas usando la shard key: los documentos se agrupan en rangos de valores de la shard key, llamados chunks, y un balancer mueve los chunks entre shards para mantenerlos equilibrados. La shard key es la decisión crítica y es difícil cambiarla después, aunque el resharding es posible desde MongoDB 5.0. Una buena shard key tiene alta cardinalidad, distribuye las escrituras de forma uniforme y coincide con las consultas más frecuentes, para que se dirijan a un solo shard en lugar de difundirse a todos. Una clave que crece de forma monótona, como un timestamp o un ObjectId, envía todas las escrituras nuevas al mismo shard y crea un punto caliente (hot spot); el hashed sharding las reparte, pero hace que las consultas por rango se dispersen. Una clave compuesta, como el ID del tenant más un componente hasheado o temporal, suele equilibrar el aislamiento por cliente y la distribución uniforme. Analizaría los patrones de consulta y el crecimiento de los datos antes de elegir, y haría pruebas con datos realistas.",
    explanation:
      "La shard key determina la distribución y la eficiencia de las consultas. Los candidatos avanzados conocen los hot spots, las consultas scatter-gather y el coste de cambiar la clave.",
    tips: ["Explica los chunks, mongos y el balancer.", "Enumera las propiedades de una buena shard key.", "Da un ejemplo de una mala clave."],
    commonMistakes: ["Elegir un timestamp como única shard key.", "Hacer sharding antes de que sea necesario."],
    followUpQuestions: ["¿Qué es un jumbo chunk?", "¿Cómo gestionarías un tenant muy grande?"],
  },
  'db-018': {
    question: "Para un producto nuevo, ¿cómo decidirías entre PostgreSQL y MongoDB?",
    intent: "El entrevistador evalúa si eliges la tecnología en función de los requisitos y no de tus preferencias.",
    expectedAnswer:
      "Partiría de los datos y de los patrones de acceso. Si el dominio tiene muchas relaciones y necesita consistencia fuerte entre entidades, informes complejos con joins y restricciones como claves foráneas, como en facturación, inventario o reservas, PostgreSQL es la opción natural por defecto. Si los datos tienen forma de documento de manera natural, se leen y escriben como agregados completos, varían en estructura, por ejemplo en gestión de contenidos, catálogos de productos con atributos variados o datos de eventos, y necesitan escalar las escrituras horizontalmente desde pronto, MongoDB puede encajar bien. También tendría en cuenta la experiencia del equipo, las herramientas operativas y los servicios gestionados disponibles, el coste y las necesidades futuras como analítica o búsqueda. La distancia entre ambas se ha reducido: PostgreSQL tiene JSONB y MongoDB tiene transacciones y validación de esquema, así que para muchos productos cualquiera de las dos sirve, y los factores decisivos son los patrones de acceso principales y el equipo. A veces la respuesta es usar ambas, cada una para la parte del sistema a la que mejor se adapta, pero evitaría añadir una segunda base de datos sin una razón clara por su coste operativo.",
    explanation:
      "Una respuesta sénior sopesa la forma de los datos, las necesidades de consistencia, el escalado, las habilidades del equipo y la operación, y reconoce que ambas bases de datos han convergido.",
    tips: ["Parte de los patrones de acceso y de las necesidades de consistencia.", "Incluye factores de equipo y operativos.", "Reconoce el solapamiento entre ambas."],
    commonMistakes: ["Elegir MongoDB solo porque el esquema es «flexible».", "Decir que las bases de datos SQL no pueden escalar."],
    followUpQuestions: ["¿Cómo migrarías si la elección resultara equivocada?", "¿Qué papel tendría un motor de búsqueda como Elasticsearch?"],
  },
  'db-019': {
    question: "¿Qué es un índice de base de datos y cuáles son sus ventajas e inconvenientes?",
    intent: "El entrevistador comprueba un concepto fundamental de rendimiento.",
    expectedAnswer:
      "Un índice es una estructura de datos adicional, normalmente un B-tree, que almacena los valores de una o varias columnas de forma ordenada con punteros a las filas. Permite a la base de datos encontrar las filas coincidentes sin recorrer toda la tabla, como el índice de un libro, lo que hace mucho más rápidas las búsquedas, los joins y las ordenaciones. Los inconvenientes son el espacio adicional en disco y unas escrituras más lentas, porque cada INSERT, UPDATE o DELETE también debe actualizar los índices. Los índices compensan en columnas que se usan a menudo en cláusulas WHERE, JOIN y ORDER BY, pero indexar todas las columnas desperdicia recursos.",
    explanation:
      "Los índices cambian coste de escritura y almacenamiento por velocidad de lectura. Elegirlos según las consultas reales es la habilidad clave.",
    tips: ["Usa la analogía del índice de un libro.", "Menciona el coste en las escrituras."],
    commonMistakes: ["Indexar todas las columnas.", "Pensar que los índices aceleran todas las consultas."],
    followUpQuestions: ["¿Cómo sabes si una consulta usa un índice?", "¿Qué es un índice único?"],
  },
  'db-020': {
    question: "¿Cómo funciona un índice B-tree y qué consultas pueden usarlo?",
    intent: "El entrevistador comprueba una comprensión más profunda del tipo de índice más común.",
    expectedAnswer:
      "Un B-tree es un árbol equilibrado cuyas páginas hoja contienen las entradas del índice ordenadas y enlazadas entre sí, mientras que los niveles superiores guían la búsqueda. Como el árbol se mantiene poco profundo, incluso con millones de filas una búsqueda lee solo unas pocas páginas, en O(log n). Como las claves están ordenadas, un B-tree admite igualdad, condiciones de rango como BETWEEN, >, <, búsquedas por prefijo como LIKE 'abc%', ORDER BY sobre las columnas indexadas y MIN o MAX. No ayuda con condiciones que no siguen su orden: un comodín inicial como LIKE '%abc', funciones aplicadas a la columna salvo que exista un índice de expresión o, en índices multicolumna, condiciones que omiten la primera columna. En columnas de baja selectividad, como un booleano en el que la mayoría de las filas tienen el mismo valor, la base de datos puede preferir un recorrido completo de la tabla.",
    explanation:
      "Entender el orden de las claves explica qué predicados se benefician de un índice y por qué algunas consultas lo ignoran.",
    tips: ["Explica las hojas ordenadas y la profundidad del árbol.", "Enumera los patrones de consulta admitidos y los no admitidos."],
    commonMistakes: ["Esperar que un índice ayude en una búsqueda con comodín inicial.", "Aplicar una función a una columna indexada en el WHERE."],
    followUpQuestions: ["¿Cómo darías soporte a una búsqueda de email sin distinguir mayúsculas y minúsculas?", "¿Qué otros tipos de índice ofrece PostgreSQL?"],
  },
};
