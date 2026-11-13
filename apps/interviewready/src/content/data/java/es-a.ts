import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de Java 001-025: fundamentos, colecciones, streams, concurrencia (parte). */
export const esA: TextTable<QuestionText> = {
  'java-001': {
    question: "¿Cuál es la diferencia entre == y equals() en Java?",
    intent: "El entrevistador comprueba una distinción fundamental que provoca muchos errores reales, sobre todo con strings y tipos wrapper.",
    expectedAnswer:
      "Con objetos, == compara referencias: solo es true si ambas variables apuntan al mismo objeto en memoria. equals() compara la igualdad lógica tal como la define la clase. String sobrescribe equals() para comparar caracteres, así que new String(\"a\") == new String(\"a\") es false mientras que equals() devuelve true. Con primitivos como int, == compara directamente los valores. Si una clase no sobrescribe equals(), hereda Object.equals(), que se comporta como ==.",
    explanation:
      "Usar == con strings puede parecer que funciona gracias al string pool, que reutiliza los literales, pero falla con strings construidos en tiempo de ejecución. La misma trampa existe con valores Integer fuera del pequeño rango cacheado.",
    example: "Integer a = 1000, b = 1000; a == b  // false: objetos distintos\na.equals(b)  // true",
    tips: ["Menciona el string pool como la razón por la que == a veces parece funcionar.", "Usa Objects.equals(a, b) para evitar NullPointerException."],
    commonMistakes: ["Comparar strings con ==.", "Olvidar que los tipos wrapper como Integer son objetos."],
    followUpQuestions: ["¿Cuál es el contrato entre equals() y hashCode()?", "¿Qué es la caché de Integer?"],
  },
  'java-002': {
    question: "¿Cuál es el contrato entre equals() y hashCode(), y por qué es importante?",
    intent: "El entrevistador quiere comprobar que entiendes cómo las colecciones basadas en hash dependen de estos dos métodos.",
    expectedAnswer:
      "Si dos objetos son iguales según equals(), deben devolver el mismo hashCode(). Lo contrario no es obligatorio: objetos distintos pueden compartir código hash. HashMap y HashSet usan primero hashCode() para encontrar el bucket y después equals() para encontrar la entrada exacta. Si sobrescribes equals() sin hashCode(), dos objetos iguales pueden acabar en buckets distintos, de modo que un set puede contener duplicados y las búsquedas en un map fallan. Ambos métodos deben usar los mismos campos, y esos campos no deben cambiar mientras el objeto se use como clave.",
    explanation:
      "Este contrato es lo que hace funcionar las colecciones hash. Los records y los generadores del IDE producen implementaciones coherentes, lo que evita la mayoría de los errores.",
    tips: ["Sobrescribe siempre ambos métodos a la vez.", "Menciona que los records los generan automáticamente."],
    commonMistakes: ["Sobrescribir solo equals().", "Usar campos mutables en hashCode() para objetos almacenados como claves."],
    followUpQuestions: ["¿Qué ocurre si una clave cambia después de insertarla en un HashMap?", "¿Cómo implementarías equals() en una clase con herencia?"],
  },
  'java-003': {
    question: "¿Por qué String es inmutable en Java y cuándo deberías usar StringBuilder?",
    intent: "El entrevistador comprueba que entiendes la inmutabilidad y sus consecuencias en el rendimiento.",
    expectedAnswer:
      "Un String no se puede modificar después de crearse; métodos como concat() o replace() devuelven un String nuevo. La inmutabilidad hace que los strings se puedan compartir de forma segura entre hilos, permite a la JVM reutilizar literales en el string pool, los hace fiables como claves de HashMap y protege valores como rutas de archivo o nombres de clase frente a cambios después de haberlos validado. El inconveniente es que construir un string concatenando repetidamente en un bucle crea muchos objetos temporales. StringBuilder es un buffer mutable pensado para ese caso: haces append dentro del bucle y llamas a toString() una sola vez.",
    explanation:
      "El compilador ya optimiza las concatenaciones simples dentro de una misma expresión, así que StringBuilder importa sobre todo en bucles o cuando construyes strings grandes paso a paso.",
    example: "StringBuilder sb = new StringBuilder();\nfor (String line : lines) sb.append(line).append('\\n');\nString text = sb.toString();",
    tips: ["Da al menos dos razones de la inmutabilidad.", "Explica cuándo StringBuilder marca realmente la diferencia."],
    commonMistakes: ["Usar StringBuilder en todas partes, incluso para una concatenación simple.", "Confundir StringBuilder con StringBuffer, que está sincronizado."],
    followUpQuestions: ["¿Qué es el string pool?", "¿Cuál es la diferencia entre StringBuilder y StringBuffer?"],
  },
  'java-004': {
    question: "¿Cuál es la diferencia entre excepciones checked y unchecked? ¿Cómo eliges entre ellas?",
    intent: "El entrevistador quiere ver si entiendes el diseño de excepciones de Java y si sabes aplicarlo con criterio en una API.",
    expectedAnswer:
      "Las excepciones checked extienden Exception pero no RuntimeException; el compilador obliga a quien llama a capturarlas o a declararlas con throws. Ejemplos: IOException y SQLException. Las excepciones unchecked extienden RuntimeException, como IllegalArgumentException o NullPointerException, y el compilador no obliga a gestionarlas. Una pauta habitual es usar checked para situaciones recuperables que quien llama puede gestionar razonablemente, y unchecked para errores de programación o situaciones que quien llama no puede corregir. En la práctica, muchos frameworks modernos como Spring prefieren las unchecked, porque las checked se propagan por todas las firmas y a menudo se capturan y se ignoran. Elijas lo que elijas, las excepciones deben llevar un mensaje claro y la causa original.",
    explanation:
      "El debate sobre las excepciones checked enfrenta obligar a gestionar los errores con mantener las APIs simples. Conocer la pauta y cómo se comportan los frameworks demuestra criterio práctico.",
    tips: ["Da ejemplos de cada tipo.", "Explica la pauta y cómo gestiona Spring las excepciones de base de datos.", "Menciona que hay que conservar la causa al envolver una excepción."],
    commonMistakes: ["Capturar Exception y no hacer nada.", "Envolver una excepción sin pasar la causa original."],
    followUpQuestions: ["¿Qué es try-with-resources?", "¿Cómo diseñarías la gestión de errores de una API REST?"],
  },
  'java-005': {
    question: "Explica las palabras clave final y finally, y el método finalize().",
    intent: "El entrevistador comprueba un conocimiento preciso de tres elementos de nombre parecido pero sin relación entre sí, uno de ellos obsoleto.",
    expectedAnswer:
      "final es un modificador: una variable final no se puede reasignar, un método final no se puede sobrescribir y una clase final no se puede extender, como String. Ojo: una referencia final a un objeto mutable no hace que el objeto sea inmutable. finally es un bloque después de try/catch que se ejecuta haya o no excepción y se usa para tareas de limpieza, aunque hoy try-with-resources es la forma preferida de cerrar recursos. finalize() era un método que el recolector de basura llamaba antes de liberar un objeto; es poco fiable, lento y está obsoleto desde Java 9 y marcado para eliminación desde Java 18. En su lugar se deben usar Cleaner o try-with-resources.",
    explanation:
      "Esta pregunta clásica pone a prueba la precisión. Mencionar que finalize() está obsoleto y que final no implica inmutabilidad demuestra un conocimiento actualizado y cuidadoso.",
    tips: ["Señala que una referencia final puede seguir apuntando a un objeto mutable.", "Di que finalize() está obsoleto."],
    commonMistakes: ["Confiar en finalize() para liberar recursos.", "Pensar que una lista final no se puede modificar."],
    followUpQuestions: ["¿Se ejecuta finally si el bloque try hace return?", "¿Cómo funciona try-with-resources?"],
  },
  'java-006': {
    question: "¿Qué son los records de Java y cuándo los usarías?",
    intent: "El entrevistador comprueba que conoces Java moderno (16+) y el modelado de datos inmutables.",
    expectedAnswer:
      "Un record es una forma concisa de declarar un portador de datos inmutable. A partir de una declaración como record Point(int x, int y) {}, el compilador genera campos private final, un constructor canónico, los accesores x() e y(), y equals(), hashCode() y toString() basados en todos los componentes. Los records son ideales para DTOs, respuestas de API, value objects y claves de maps. Puedes añadir validación en un constructor compacto, métodos factory estáticos y otros métodos. Límites: un record no puede extender otra clase, sus campos no se pueden reasignar y su inmutabilidad es superficial, así que si contiene una List esa lista se puede modificar salvo que hagas una copia defensiva.",
    explanation:
      "Los records eliminan código repetitivo y dejan clara la intención: este tipo es solo datos. Mencionar la inmutabilidad superficial y los constructores compactos demuestra experiencia práctica.",
    example: "record Money(BigDecimal amount, String currency) {\n  Money { if (amount.signum() < 0) throw new IllegalArgumentException(\"negative\"); }\n}",
    tips: ["Enumera lo que genera el compilador.", "Menciona la validación en un constructor compacto.", "Explica la inmutabilidad superficial."],
    commonMistakes: ["Usar records como entidades JPA, que necesitan mutabilidad y un constructor sin argumentos.", "Suponer que las colecciones anidadas son inmutables."],
    followUpQuestions: ["¿Puede un record implementar una interfaz?", "¿Cómo funcionan los records con la serialización de Jackson?"],
  },
  'java-007': {
    question: "¿Cómo funcionan juntas las sealed classes y el pattern matching en switch en Java moderno?",
    intent: "El entrevistador evalúa si conoces Java 21 y sabes modelar jerarquías de tipos cerradas.",
    expectedAnswer:
      "Una clase o interfaz sealed indica exactamente qué clases pueden extenderla mediante la cláusula permits, por ejemplo sealed interface Payment permits Card, Transfer, Wallet. Desde Java 21, switch admite pattern matching sobre tipos, con deconstrucción de records y guardas mediante when. Cuando haces switch sobre un tipo sealed, el compilador conoce todos los subtipos posibles y puede comprobar la exhaustividad: si tratas todos los tipos permitidos, no hace falta una rama default, y si más adelante se añade un subtipo, todo switch que no sea exhaustivo deja de compilar. Esto ofrece tipos algebraicos de datos similares a los de los lenguajes funcionales: modelas un conjunto cerrado de casos y el compilador garantiza que se tratan todos. En muchos casos sustituye al patrón visitor y a las cadenas de comprobaciones instanceof.",
    explanation:
      "La comprobación de exhaustividad es la ventaja clave: añadir un caso se convierte en una lista de tareas en tiempo de compilación en lugar de un error en tiempo de ejecución. Los candidatos avanzados lo relacionan con el modelado del dominio.",
    example: "String describe(Payment p) {\n  return switch (p) {\n    case Card c when c.amount() > 1000 -> \"large card payment\";\n    case Card c -> \"card\";\n    case Transfer t -> \"transfer to \" + t.iban();\n    case Wallet w -> \"wallet\";\n  };\n}",
    tips: ["Explica la comprobación de exhaustividad.", "Menciona los record patterns y las guardas.", "Compáralo con el patrón visitor o con las cadenas de instanceof."],
    commonMistakes: ["Añadir una rama default que oculta los casos que faltan.", "Confundir sealed con final."],
    followUpQuestions: ["¿Qué significa non-sealed?", "¿Cómo modelarías los estados de un pedido con tipos sealed?"],
  },
  'java-008': {
    question: "¿Cuál es la diferencia entre List, Set y Map en Java?",
    intent: "El entrevistador comprueba que sabes elegir el tipo de colección adecuado para cada tarea.",
    expectedAnswer:
      "Una List es una colección ordenada que admite duplicados y acceso por índice, normalmente ArrayList. Un Set contiene elementos únicos: HashSet no garantiza ningún orden, LinkedHashSet conserva el orden de inserción y TreeSet mantiene los elementos ordenados. Un Map guarda pares clave-valor con claves únicas: HashMap para búsquedas rápidas, LinkedHashMap para el orden de inserción y TreeMap para claves ordenadas. Map no es un subtipo de Collection. Elige una List para secuencias, un Set cuando importa la unicidad y un Map cuando buscas valores por clave.",
    explanation:
      "Elegir la interfaz adecuada comunica la intención y ofrece las garantías y el rendimiento apropiados para el caso de uso.",
    tips: ["Menciona las implementaciones principales y su orden.", "Da un caso de uso para cada una."],
    commonMistakes: ["Usar una List y llamar a contains() repetidamente cuando un Set sería más rápido."],
    followUpQuestions: ["¿Cuándo usarías un TreeMap?", "¿Cómo comprueba HashSet la unicidad?"],
  },
  'java-009': {
    question: "¿Cómo funciona HashMap internamente?",
    intent: "El entrevistador busca una comprensión más profunda de una de las clases más usadas y de su comportamiento en rendimiento.",
    expectedAnswer:
      "HashMap guarda las entradas en un array de buckets. Al insertar una clave, llama a hashCode(), dispersa los bits y los usa para calcular el índice del bucket. Si el bucket está vacío, la entrada se guarda ahí; si no, hay una colisión y la entrada se añade a ese bucket, que es una lista enlazada. Desde Java 8, cuando un bucket tiene más de ocho entradas y la tabla es lo bastante grande, la lista se convierte en un árbol balanceado, lo que mejora el peor caso de O(n) a O(log n). En get, HashMap localiza el bucket y usa equals() para encontrar la clave correspondiente. Cuando el número de entradas supera la capacidad multiplicada por el factor de carga, 0,75 por defecto, la tabla duplica su tamaño y las entradas se redistribuyen. HashMap admite una clave null y no es thread-safe.",
    explanation:
      "Conocer los buckets, las colisiones, la conversión a árbol (treeification) y el redimensionamiento explica el rendimiento medio O(1), por qué importan los buenos códigos hash y por qué redimensionar puede ser costoso.",
    tips: ["Explica el hashing, las colisiones y equals().", "Menciona el factor de carga y el redimensionamiento.", "Menciona la conversión a árbol desde Java 8."],
    commonMistakes: ["Decir que HashMap conserva el orden de inserción.", "Usarlo de forma concurrente sin sincronización."],
    followUpQuestions: ["¿Por qué podrías fijar una capacidad inicial?", "¿Por qué HashMap no es seguro con escrituras concurrentes?"],
  },
  'java-010': {
    question: "¿Cuál es la diferencia entre Comparable y Comparator?",
    intent: "El entrevistador comprueba cómo defines el orden de los objetos y si escribes código de ordenación limpio.",
    expectedAnswer:
      "Comparable lo implementa la propia clase, mediante compareTo(), para definir su orden natural; por ejemplo, String se ordena alfabéticamente. Una clase solo puede tener un orden natural. Comparator es un objeto independiente que define un orden, así que puedes tener muchos: por precio, por fecha, descendente. Desde Java 8, Comparator ofrece métodos factory y de combinación, como Comparator.comparing(Product::price).thenComparing(Product::name).reversed(), que hacen legible el código de ordenación. El orden natural debe ser coherente con equals() cuando los objetos se usan en sets o maps ordenados.",
    explanation:
      "Comparable sirve para el único orden evidente de un tipo; Comparator, para todos los demás. Los métodos modernos de Comparator evitan comparaciones manuales propensas a errores.",
    example: "products.sort(Comparator.comparing(Product::category).thenComparing(Product::price, Comparator.reverseOrder()));",
    tips: ["Muestra el estilo moderno con Comparator.comparing.", "Menciona la coherencia con equals() en TreeSet y TreeMap."],
    commonMistakes: ["Implementar compare con una resta, que puede desbordarse.", "Imponer un orden natural a una clase que no tiene uno evidente."],
    followUpQuestions: ["¿Qué ocurre en un TreeSet si compareTo no es coherente con equals?", "¿Cómo gestionas los valores null al ordenar?"],
  },
  'java-011': {
    question: "¿Qué es una ConcurrentModificationException y cómo la evitas?",
    intent: "El entrevistador comprueba tu conocimiento práctico del comportamiento de los iteradores y de cómo modificar colecciones de forma segura.",
    expectedAnswer:
      "La mayoría de las colecciones estándar, como ArrayList y HashMap, tienen iteradores fail-fast: si la colección se modifica estructuralmente durante la iteración por algo que no sea el propio iterador, la siguiente llamada lanza ConcurrentModificationException. Ocurre incluso con un solo hilo, por ejemplo al eliminar elementos dentro de un bucle for-each. Para evitarlo, usa iterator.remove(), usa removeIf(), como list.removeIf(o -> o.isCancelled()), acumula los cambios y aplícalos después del bucle, o construye una nueva colección filtrada con streams. En código multihilo, usa colecciones concurrentes como ConcurrentHashMap o CopyOnWriteArrayList, cuyos iteradores no lanzan esta excepción.",
    explanation:
      "La excepción es una detección best-effort de un error de programación, no una garantía de concurrencia. La solución es modificar las colecciones de forma controlada.",
    tips: ["Menciona que también ocurre en código de un solo hilo.", "Propón removeIf() como la solución más sencilla."],
    commonMistakes: ["Capturar la excepción en lugar de corregir el bucle.", "Pensar que los iteradores fail-fast hacen que el código sea thread-safe."],
    followUpQuestions: ["¿Cómo funciona CopyOnWriteArrayList y cuándo es una mala elección?", "¿Por qué se dice que la detección es best-effort?"],
  },
  'java-012': {
    question: "Compara HashMap, Collections.synchronizedMap y ConcurrentHashMap para uso concurrente.",
    intent: "El entrevistador evalúa conocimientos avanzados de concurrencia y tu capacidad para evitar condiciones de carrera sutiles.",
    expectedAnswer:
      "HashMap no es thread-safe: las escrituras concurrentes pueden perder actualizaciones o corromper su estado interno. Collections.synchronizedMap envuelve un map con un único lock en cada método, así que cada llamada es segura, pero todos los hilos compiten por el mismo lock y sigues teniendo que sincronizar manualmente al iterar o al hacer acciones compuestas. ConcurrentHashMap está diseñado para la concurrencia: las lecturas son en su mayoría sin lock y las escrituras bloquean solo el bin afectado, así que el throughput es mucho mejor. No admite claves ni valores null, sus iteradores son débilmente consistentes y nunca lanzan ConcurrentModificationException, y ofrece operaciones compuestas atómicas como putIfAbsent, computeIfAbsent y merge. La trampa clave es check-then-act: if (!map.containsKey(k)) map.put(k, v) no es atómico ni siquiera en un ConcurrentHashMap, así que debes usar computeIfAbsent o merge.",
    explanation:
      "Que cada método sea thread-safe no hace atómica una secuencia de llamadas. Los candidatos avanzados saben que las operaciones compuestas deben usar las APIs atómicas.",
    example: "counts.merge(word, 1, Integer::sum); // incremento atómico en un ConcurrentHashMap",
    tips: ["Explica la granularidad del lock.", "Destaca el problema check-then-act y los métodos atómicos.", "Menciona la restricción sobre null."],
    commonMistakes: ["Usar containsKey seguido de put en un map concurrente.", "Ejecutar trabajo largo o bloqueante dentro de computeIfAbsent."],
    followUpQuestions: ["¿Por qué ConcurrentHashMap rechaza los valores null?", "¿Qué significa una iteración débilmente consistente?"],
  },
  'java-013': {
    question: "¿Cuál es la diferencia entre List.of(), Arrays.asList() y Collections.unmodifiableList()?",
    intent: "El entrevistador comprueba un conocimiento preciso de las garantías de inmutabilidad, que a menudo sorprenden a los desarrolladores en producción.",
    expectedAnswer:
      "List.of(), disponible desde Java 9, crea una lista realmente inmutable: cualquier add, remove o set lanza UnsupportedOperationException, y rechaza los elementos null. Arrays.asList() devuelve una lista de tamaño fijo respaldada por el array original: no puedes añadir ni eliminar, pero set() funciona y escribe en el array, y los cambios en el array se ven en la lista; admite null. Collections.unmodifiableList() devuelve una vista de solo lectura de otra lista: no puedes modificarla a través de la vista, pero si la lista subyacente cambia, la vista refleja los cambios, así que no es inmutable. Para devolver una copia segura desde un método, usa List.copyOf(), que crea una copia inmutable, o envuelve una copia defensiva.",
    explanation:
      "La diferencia entre una copia y una vista es el concepto central. Los errores aparecen cuando el código supone que una vista no modificable no puede cambiar.",
    tips: ["Distingue las copias inmutables de las vistas de solo lectura.", "Menciona cómo trata cada una los null.", "Propón List.copyOf() para las copias defensivas."],
    commonMistakes: ["Devolver una lista interna envuelta solo en unmodifiableList y suponer que quien llama ve una instantánea congelada.", "Llamar a add() sobre Arrays.asList()."],
    followUpQuestions: ["¿Cómo expondrías de forma segura un campo de tipo colección de una clase?", "¿Es totalmente inmutable un record que contiene List.of()?"],
  },
  'java-014': {
    question: "¿Qué es un Stream en Java y cuál es la diferencia entre operaciones intermedias y terminales?",
    intent: "El entrevistador comprueba que entiendes lo básico de la API de Streams y su evaluación perezosa.",
    expectedAnswer:
      "Un Stream es una secuencia de elementos que admite operaciones declarativas como filtrar, transformar y reducir, sin almacenar datos por sí mismo. Las operaciones intermedias como filter, map y sorted devuelven un nuevo stream y son perezosas: no ocurre nada hasta que se llama a una operación terminal. Las operaciones terminales como collect, forEach, count o findFirst desencadenan el procesamiento y producen un resultado. Un stream solo se puede consumir una vez. Por ejemplo, orders.stream().filter(o -> o.isPaid()).map(Order::total).reduce(BigDecimal.ZERO, BigDecimal::add) calcula el total de los pedidos pagados.",
    explanation:
      "La evaluación perezosa permite al stream combinar operaciones de forma eficiente y detenerse antes, por ejemplo con findFirst o limit.",
    tips: ["Da un ejemplo corto de pipeline.", "Menciona que un stream solo se puede usar una vez."],
    commonMistakes: ["Esperar que un pipeline sin operación terminal haga algo.", "Reutilizar un stream ya consumido."],
    followUpQuestions: ["¿Qué significa short-circuiting en los streams?", "¿Cuándo preferirías un bucle simple?"],
  },
  'java-015': {
    question: "¿Cuál es la diferencia entre map() y flatMap() en los streams?",
    intent: "El entrevistador comprueba que entiendes las transformaciones de streams y el manejo de datos anidados.",
    expectedAnswer:
      "map() transforma cada elemento en exactamente un elemento nuevo, así que un Stream<Order> transformado con Order::customer da un Stream<Customer>. flatMap() transforma cada elemento en un stream de elementos y aplana todos esos streams en uno solo. Si cada Order tiene una List<Item>, orders.stream().map(Order::items) da un Stream<List<Item>>, mientras que orders.stream().flatMap(o -> o.items().stream()) da un Stream<Item> con todos los items. La misma idea existe en Optional: map envuelve el resultado y flatMap evita un Optional de Optional cuando la función ya devuelve un Optional.",
    explanation:
      "flatMap se usa siempre que un elemento produce cero, uno o varios resultados y quieres una única secuencia plana.",
    tips: ["Usa un ejemplo con listas anidadas.", "Menciona también Optional.flatMap."],
    commonMistakes: ["Acabar con un Stream<List<T>> y tener que iterar dos veces.", "Usar flatMap cuando basta con map."],
    followUpQuestions: ["¿Qué hace mapMulti?", "¿Cómo obtendrías los nombres de producto distintos de todos los pedidos?"],
  },
  'java-016': {
    question: "¿Cómo se debe usar Optional y cómo no se debe usar?",
    intent: "El entrevistador comprueba tu criterio de diseño de APIs y si conoces los malos usos habituales de Optional.",
    expectedAnswer:
      "Optional está pensado como tipo de retorno de métodos que pueden no tener resultado, como findById(), para que quien llama esté obligado a tratar explícitamente el caso vacío. Un buen uso incluye map, filter, orElse, orElseGet para valores por defecto costosos y orElseThrow para fallar con una excepción clara. No se debe usar en campos, parámetros de métodos ni colecciones: una colección vacía ya expresa «sin resultados», y los campos Optional añaden sobrecarga y no son serializables. Llamar a get() sin comprobar desvirtúa su propósito; usa orElseThrow() en su lugar. Además, una variable Optional nunca debería ser null.",
    explanation:
      "Optional documenta la ausencia de valor en la firma del método. Su utilidad está en tratar el caso vacío de forma fluida, no en envolver cada valor que pueda ser null.",
    example: "String city = repo.findById(id).map(User::address).map(Address::city).orElse(\"unknown\");",
    tips: ["Indica que su uso previsto es como tipo de retorno.", "Contrasta orElse con orElseGet."],
    commonMistakes: ["Usar Optional como campo o parámetro.", "Llamar directamente a get().", "Devolver Optional<List<T>> en lugar de una lista vacía."],
    followUpQuestions: ["¿Por qué orElse evalúa su argumento incluso cuando hay un valor?", "¿Cómo tratarías la ausencia de valor en un controlador REST?"],
  },
  'java-017': {
    question: "¿Cómo agruparías y agregarías datos con Collectors?",
    intent: "El entrevistador comprueba el uso práctico de los collectors en tareas habituales de generación de informes.",
    expectedAnswer:
      "Collectors.groupingBy agrupa los elementos por una clave y devuelve un Map. Con un collector downstream puedes agregar cada grupo: counting(), summingInt(), averagingDouble(), mapping() o toSet(). Por ejemplo, orders.stream().collect(Collectors.groupingBy(Order::customerId, Collectors.summingInt(Order::quantity))) da la cantidad total por cliente. partitioningBy divide en un Map<Boolean, List<T>> según un predicado. toMap construye un map directamente, pero lanza una excepción con claves duplicadas salvo que proporciones una función de merge. Si el orden importa, puedes pasar una factory de map como TreeMap::new.",
    explanation:
      "Los collectors sustituyen muchos bucles manuales con maps. Conocer los collectors downstream y el comportamiento de toMap con claves duplicadas evita errores comunes.",
    example: "Map<Status, Long> countByStatus = tickets.stream().collect(Collectors.groupingBy(Ticket::status, Collectors.counting()));",
    tips: ["Muestra groupingBy con un collector downstream.", "Menciona la función de merge de toMap."],
    commonMistakes: ["Usar toMap sin gestionar las claves duplicadas.", "Escribir bucles anidados donde un collector sería más claro."],
    followUpQuestions: ["¿Cómo obtendrías el producto más vendido de cada categoría?", "¿Qué es Collectors.teeing?"],
  },
  'java-018': {
    question: "¿Cuándo deberías usar parallel streams y cuáles son sus riesgos?",
    intent: "El entrevistador evalúa tu criterio avanzado sobre el paralelismo en la JVM y sus costes ocultos.",
    expectedAnswer:
      "Un parallel stream divide su fuente, procesa las partes en el ForkJoinPool común y luego combina los resultados. Puede ayudar en trabajo intensivo en CPU sobre grandes volúmenes de datos con fuentes que se dividen bien, como ArrayList o arrays, cuando las operaciones no tienen estado y son independientes. A menudo no ayuda, o incluso ralentiza, con colecciones pequeñas, fuentes que se dividen mal como LinkedList o streams basados en I/O, operaciones con restricciones de orden como findFirst o sorted, o cuando combinar los resultados es costoso. Los riesgos incluyen el estado mutable compartido, que provoca condiciones de carrera, y la I/O bloqueante dentro del pipeline, que agota el pool común que usa toda la JVM, incluidas otras librerías y las tareas por defecto de CompletableFuture. En un servidor que ya atiende muchas peticiones en paralelo, los parallel streams rara vez mejoran el throughput. La regla es medir con un benchmark realista, por ejemplo con JMH, antes de usarlos.",
    explanation:
      "Los parallel streams son una optimización, no una opción por defecto. Las respuestas avanzadas mencionan el pool común, las características de la fuente de datos y la necesidad de medir.",
    tips: ["Enumera las condiciones en las que ayudan y en las que perjudican.", "Menciona el ForkJoinPool común compartido.", "Insiste en la importancia de medir."],
    commonMistakes: ["Añadir .parallel() para acelerar llamadas a base de datos o HTTP.", "Modificar una lista compartida dentro de forEach en un parallel stream."],
    followUpQuestions: ["¿Cómo ejecutarías un parallel stream en un pool personalizado?", "¿Por qué sorted() reduce el beneficio del paralelismo?"],
  },
  'java-019': {
    question: "¿Cuáles son los errores habituales al escribir pipelines de streams en código de producción?",
    intent: "El entrevistador evalúa si usas los streams por legibilidad y corrección, y no como una moda de estilo.",
    expectedAnswer:
      "El primer error son los efectos secundarios: modificar estado externo dentro de map o forEach hace que los pipelines sean difíciles de razonar e inseguros en paralelo; los resultados deben producirse con collect o reduce. El segundo es apoyarse mal en la evaluación perezosa, por ejemplo usar peek() para lógica u operaciones que se omiten por el short-circuiting. Tercero, las excepciones checked no encajan en las lambdas, lo que obliga a envoltorios incómodos; a veces un bucle es más claro. Cuarto, trampas de rendimiento: ordenar o recolectar grandes listas intermedias, el boxing con Stream<Integer> en lugar de IntStream, o llamar a la base de datos dentro de un map, lo que genera consultas N+1. Quinto, la legibilidad: los pipelines muy largos con lambdas anidadas son más difíciles de depurar que un bucle con métodos auxiliares bien nombrados. Por último, toMap sin función de merge o groupingBy con claves null lanzan excepciones en tiempo de ejecución. Uso streams para transformaciones claras y dejo el flujo de control complejo en bucles o métodos extraídos.",
    explanation:
      "Los streams son una herramienta para expresar transformaciones con claridad. Los desarrolladores senior saben cuándo perjudican la legibilidad, el rendimiento o la gestión de errores.",
    tips: ["Agrupa los errores por corrección, rendimiento y legibilidad.", "Menciona los streams de primitivos para evitar el boxing.", "Demuestra que sigues usando bucles cuando son más claros."],
    commonMistakes: ["Usar peek() para lógica de negocio.", "Construir enormes pipelines de una sola línea que nadie puede depurar."],
    followUpQuestions: ["¿Cómo depuras un pipeline de streams?", "¿Cómo gestionas las excepciones checked en las lambdas?"],
  },
  'java-020': {
    question: "¿Cómo creas y ejecutas una tarea en otro hilo en Java moderno?",
    intent: "El entrevistador comprueba tus conocimientos básicos de concurrencia y si usas abstracciones modernas en lugar de hilos en bruto.",
    expectedAnswer:
      "La forma de bajo nivel es crear un Thread con un Runnable y llamar a start(), no a run(), que se ejecutaría en el hilo actual. En código moderno, lo habitual es enviar las tareas a un ExecutorService, que gestiona un pool de hilos: executor.submit(() -> doWork()) devuelve un Future que puedes usar para obtener el resultado o cancelar la tarea. Los executors reutilizan hilos, limitan la concurrencia y hacen explícito el cierre. Callable es como Runnable, pero devuelve un valor y puede lanzar excepciones checked. Desde Java 21, los virtual threads hacen que sea barato crear un hilo por tarea, por ejemplo con Executors.newVirtualThreadPerTaskExecutor().",
    explanation:
      "Crear hilos en bruto para cada tarea es costoso y difícil de gestionar. Los executors y, más recientemente, los virtual threads son las herramientas estándar.",
    tips: ["Menciona la diferencia entre start() y run().", "Prefiere ExecutorService y muestra cómo cerrarlo con shutdown."],
    commonMistakes: ["Llamar a run() en lugar de start().", "Olvidar cerrar un executor."],
    followUpQuestions: ["¿Cuál es la diferencia entre Runnable y Callable?", "¿Qué ocurre si una tarea lanza una excepción dentro de un executor?"],
  },
  'java-021': {
    question: "¿Qué hacen synchronized y volatile?",
    intent: "El entrevistador comprueba que entiendes la visibilidad y la atomicidad en la concurrencia de Java.",
    expectedAnswer:
      "synchronized garantiza la exclusión mutua: solo un hilo a la vez puede ejecutar un bloque synchronized sobre el mismo objeto monitor. También garantiza la visibilidad: los cambios hechos dentro del bloque son visibles para el siguiente hilo que adquiera el mismo lock. volatile solo garantiza la visibilidad y el orden para una única variable: cada lectura ve la última escritura, pero no hace atómicas las operaciones compuestas. Así, un volatile boolean sirve como flag de parada, pero count++ sobre un volatile int sigue siendo una condición de carrera, porque es una lectura, un incremento y una escritura. Para contadores atómicos, usa AtomicInteger o LongAdder, o protege la operación con un lock.",
    explanation:
      "La distinción clave es visibilidad frente a atomicidad. Muchos errores de concurrencia vienen de suponer que volatile hace atómicas las operaciones.",
    tips: ["Separa la visibilidad de la atomicidad.", "Da un uso correcto de volatile y uno incorrecto."],
    commonMistakes: ["Usar volatile para un contador.", "Sincronizar sobre objetos distintos y creer que el código está protegido."],
    followUpQuestions: ["¿Cuál es la diferencia entre synchronized y ReentrantLock?", "¿Cómo funciona AtomicInteger?"],
  },
  'java-022': {
    question: "¿Qué es un deadlock y cómo puedes prevenirlo?",
    intent: "El entrevistador comprueba si sabes reconocer y evitar un fallo clásico de concurrencia.",
    expectedAnswer:
      "Un deadlock se produce cuando dos o más hilos tienen cada uno un lock y esperan un lock que tiene otro, de modo que ninguno puede continuar. Un ejemplo típico: el hilo A bloquea la cuenta 1 y espera la cuenta 2, mientras el hilo B bloquea la cuenta 2 y espera la cuenta 1. Las estrategias de prevención incluyen adquirir siempre los locks en el mismo orden global, por ejemplo por ID de cuenta; mantener los locks el menor tiempo posible y no llamar nunca a código desconocido mientras se tiene uno; usar tryLock con timeout de ReentrantLock para que un hilo pueda retirarse; y reducir los locks compartidos usando estructuras de más alto nivel, como colecciones concurrentes o colas de mensajes. Los thread dumps, obtenidos con jstack o con herramientas de monitorización, muestran los hilos en deadlock y los locks implicados.",
    explanation:
      "Un deadlock requiere una espera circular. Romper el ciclo, normalmente con un orden coherente de adquisición de locks, es la prevención más fiable.",
    tips: ["Pon el ejemplo de las dos cuentas.", "Señala el orden de los locks como la solución principal.", "Menciona cómo detectar un deadlock."],
    commonMistakes: ["Añadir más locks para corregir una condición de carrera sin pensar en el orden."],
    followUpQuestions: ["¿Qué es un livelock?", "¿Cómo detectarías un deadlock en producción?"],
  },
  'java-023': {
    question: "¿Cómo funcionan los thread pools y cómo los dimensionas?",
    intent: "El entrevistador comprueba tu conocimiento práctico de los executors y de la gestión de recursos.",
    expectedAnswer:
      "Un thread pool mantiene un conjunto de hilos trabajadores que toman tareas de una cola, lo que evita el coste de crear un hilo por tarea y limita cuánto se ejecuta a la vez. ThreadPoolExecutor se configura con un tamaño core, un tamaño máximo, una cola y una política de rechazo para cuando ambos están llenos. El dimensionamiento depende del trabajo: para tareas CPU-bound, basta con un número cercano al de núcleos, ya que más hilos solo añaden cambios de contexto; para tareas I/O-bound, los hilos pasan tiempo esperando, así que conviene tener más, aproximadamente núcleos multiplicados por uno más la relación entre tiempo de espera y tiempo de cálculo. Las colas sin límite, que usa Executors.newFixedThreadPool, pueden ocultar una sobrecarga hasta que se agota la memoria, por lo que en producción se suele usar una cola acotada y una política de rechazo explícita, y se monitoriza el tamaño de la cola.",
    explanation:
      "Configurar un pool es una decisión de planificación de capacidad. Mencionar las colas acotadas y las políticas de rechazo demuestra experiencia en producción.",
    tips: ["Distingue el trabajo CPU-bound del I/O-bound.", "Menciona el riesgo de las colas sin límite."],
    commonMistakes: ["Crear un pool nuevo por cada petición.", "Usar un pool enorme para trabajo CPU-bound."],
    followUpQuestions: ["¿Qué políticas de rechazo existen?", "¿Cómo cambian los virtual threads el dimensionamiento de los pools?"],
  },
  'java-024': {
    question: "¿Cómo combinarías varias llamadas asíncronas con CompletableFuture?",
    intent: "El entrevistador evalúa tus habilidades avanzadas de programación asíncrona, incluida la gestión de errores y de executors.",
    expectedAnswer:
      "Lanzaría cada llamada independiente con supplyAsync, pasando un executor dedicado en lugar de depender del ForkJoinPool común, sobre todo para I/O bloqueante. Para las llamadas que dependen de un resultado anterior, uso thenCompose, que encadena pasos asíncronos sin anidar futures; thenApply es para transformaciones síncronas. Para llamadas independientes, thenCombine fusiona dos resultados y allOf espera a muchas; después de allOf, recojo los resultados con join(), que en ese punto ya no bloquea. La gestión de errores usa exceptionally o handle para ofrecer un fallback, y orTimeout o completeOnTimeout, disponibles desde Java 9, para no esperar indefinidamente. También me aseguro de registrar las excepciones con contexto, porque un future fallido que nadie observa puede desaparecer en silencio. Por ejemplo, para construir la página de un producto obtendría en paralelo el producto, el precio y el stock, los combinaría y usaría «stock desconocido» como fallback si el servicio de stock supera el timeout.",
    explanation:
      "Los puntos esenciales son la composición (thenCompose frente a thenApply), el fan-out en paralelo (allOf, thenCombine), los executors explícitos y unos timeouts y fallbacks robustos.",
    example: "var price = supplyAsync(() -> pricing.get(id), ioPool);\nvar stock = supplyAsync(() -> inventory.get(id), ioPool).completeOnTimeout(Stock.UNKNOWN, 300, MILLISECONDS);\nreturn price.thenCombine(stock, ProductView::new);",
    tips: ["Contrasta thenApply con thenCompose.", "Menciona siempre los timeouts y un executor dedicado.", "Muestra cómo gestionas los errores."],
    commonMistakes: ["Llamar a get() justo después de supplyAsync, lo que vuelve el código síncrono.", "Ejecutar llamadas bloqueantes en el pool común."],
    followUpQuestions: ["¿Cómo simplificarían este código los virtual threads?", "¿Cómo propagas un contexto de petición, como un trace ID?"],
  },
  'java-025': {
    question: "¿Qué son los virtual threads de Java 21 y cuándo ayudan?",
    intent: "El entrevistador comprueba que conoces Project Loom y sus implicaciones prácticas en servidores.",
    expectedAnswer:
      "Los virtual threads son hilos ligeros gestionados por la JVM en lugar del sistema operativo. Muchos virtual threads se ejecutan sobre un pequeño pool de platform threads portadores (carrier threads). Cuando un virtual thread realiza una operación bloqueante, como leer de un socket, la JVM lo desmonta de su carrier, que puede ejecutar otro virtual thread. Esto hace viable crear millones de hilos y usar un estilo simple de un hilo por petición, con código bloqueante, y aun así lograr un throughput similar al del código asíncrono. Ayudan en cargas I/O-bound, como servicios web que llaman a bases de datos y APIs. No aceleran el trabajo CPU-bound. Puntos de atención: no tiene sentido usar pools de virtual threads; las cachés en ThreadLocal se encarecen con muchos hilos; los bloques synchronized largos alrededor de llamadas bloqueantes podían fijar (pinning) el carrier thread, una limitación que JDK 24 eliminó en gran parte; y los recursos posteriores, como los pools de conexiones a base de datos, siguen limitando la concurrencia real, así que puede que necesites semáforos. Spring Boot 3.2+ permite activarlos con spring.threads.virtual.enabled=true.",
    explanation:
      "Los virtual threads cambian el modelo de coste de los hilos, no la velocidad de cálculo. Los candidatos avanzados también conocen trampas como el pinning, el uso de ThreadLocal y los límites de los sistemas posteriores.",
    tips: ["Explica el montaje y desmontaje sobre los carrier threads.", "Di claramente lo que no aceleran.", "Menciona las trampas prácticas y el soporte en Spring Boot."],
    commonMistakes: ["Meter virtual threads en un pool de tamaño fijo.", "Esperar un procesamiento CPU-bound más rápido."],
    followUpQuestions: ["¿Qué es el pinning?", "¿Cómo se comparan los virtual threads con la programación reactiva?"],
  },
};
