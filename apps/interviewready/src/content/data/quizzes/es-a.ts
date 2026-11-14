import type { QuizText, TextTable } from '@/types/content';

/** Spanish quiz texts A: software, Java, frontend, general and behavioral (85 items). */
export const esA: TextTable<QuizText> = {
  // Desarrollo de software (25)
  'q-sw-001': {
    prompt: "¿Cuál es la complejidad temporal media de buscar una clave en una tabla hash?",
    options: ["O(log n)", "O(1)", "O(n)", "O(n log n)"],
    explanation: "Una función hash envía la clave directamente a un bucket, así que la búsqueda es de tiempo constante en promedio. Muchas colisiones pueden degradarla en el peor caso.",
  },
  'q-sw-002': {
    prompt: "¿Qué condición se requiere para usar la búsqueda binaria?",
    options: ["Los valores deben ser únicos", "Los datos deben almacenarse en una lista enlazada", "Los datos deben estar ordenados", "La colección debe contener menos de 1.000 elementos"],
    explanation: "La búsqueda binaria compara con el elemento central y descarta la mitad de los datos en cada paso, lo que solo funciona si los datos están ordenados.",
  },
  'q-sw-003': {
    prompt: "La notación Big O da el tiempo de ejecución exacto de un algoritmo en milisegundos.",
    explanation: "Big O describe cómo crecen el tiempo de ejecución o la memoria según el tamaño de la entrada, ignorando las constantes. No da una duración exacta.",
  },
  'q-sw-004': {
    prompt: "¿Qué estructura de datos sigue el principio «último en entrar, primero en salir»?",
    options: ["Pila (stack)", "Cola (queue)", "Cola de prioridad", "Mapa hash"],
    explanation: "Una pila devuelve primero el elemento añadido más recientemente, lo que resulta útil para el historial de deshacer y el recorrido en profundidad.",
  },
  'q-sw-005': {
    prompt: "¿Qué principio de la POO oculta el estado interno de un objeto detrás de métodos?",
    options: ["Herencia", "Polimorfismo", "Abstracción", "Encapsulamiento"],
    explanation: "El encapsulamiento mantiene los campos privados y expone el comportamiento mediante métodos, de modo que el objeto protege su propia coherencia.",
  },
  'q-sw-006': {
    prompt: "La sobrecarga de métodos se resuelve en tiempo de ejecución según el tipo real del objeto.",
    explanation: "La sobrecarga se resuelve en tiempo de compilación a partir de los tipos declarados de los parámetros. La sobrescritura (overriding) es la que se resuelve en tiempo de ejecución mediante despacho dinámico.",
  },
  'q-sw-007': {
    prompt: "¿Qué principio SOLID dice que un subtipo debe poder usarse en cualquier lugar donde se espere su tipo padre?",
    options: ["Responsabilidad única", "Sustitución de Liskov", "Segregación de interfaces", "Inversión de dependencias"],
    explanation: "El principio de sustitución de Liskov exige que los subtipos respeten el comportamiento prometido por su padre, no solo las firmas de sus métodos.",
  },
  'q-sw-008': {
    prompt: "¿Qué patrón de diseño permite intercambiar algoritmos equivalentes detrás de una interfaz común?",
    options: ["Observer", "Singleton", "Strategy", "Adapter"],
    explanation: "El patrón Strategy define una familia de algoritmos detrás de una sola interfaz, para que el cliente pueda elegir uno en tiempo de ejecución sin largas cadenas de condicionales.",
  },
  'q-sw-009': {
    prompt: "Una crítica habitual al patrón Singleton es que el acceso global oculta dependencias y dificulta las pruebas.",
    explanation: "El código puede acceder a un singleton desde cualquier parte, lo que crea un acoplamiento implícito. Inyectar una única instancia mediante inyección de dependencias evita este problema.",
  },
  'q-sw-010': {
    prompt: "¿Qué tipo de prueba verifica un escenario de usuario completo a través de todo el sistema?",
    options: ["Prueba unitaria", "Prueba de integración", "Prueba de contrato", "Prueba de extremo a extremo (end-to-end)"],
    explanation: "Las pruebas end-to-end ejecutan recorridos de usuario completos, como registrarse a través de la interfaz. Dan confianza, pero son más lentas y frágiles.",
  },
  'q-sw-011': {
    prompt: "En el desarrollo guiado por pruebas (TDD), ¿cuál es el primer paso del ciclo?",
    options: ["Escribir una pequeña prueba que falle", "Refactorizar el código existente", "Escribir la implementación completa", "Medir la cobertura de código"],
    explanation: "TDD sigue el ciclo rojo, verde, refactorizar: escribes una prueba que falla, la haces pasar con el código más simple y luego mejoras el diseño.",
  },
  'q-sw-012': {
    prompt: "Una batería de pruebas con un 100 % de cobertura de código demuestra que el código no tiene errores.",
    explanation: "La cobertura solo muestra qué líneas se ejecutaron. Las pruebas pueden ejecutar código sin aserciones significativas, y los escenarios que faltan quedan sin probar.",
  },
  'q-sw-013': {
    prompt: "¿Cuál suele ser tu primer paso al depurar un problema reportado?",
    options: ["Reescribir el módulo sospechoso", "Reproducir el problema de forma fiable", "Añadir más servidores", "Pedir a los usuarios que borren la caché"],
    explanation: "Reproducir el error con pasos y entradas conocidos te permite poner a prueba hipótesis y confirmar que tu corrección realmente funciona.",
  },
  'q-sw-014': {
    prompt: "¿Qué comando de Git ayuda a encontrar el commit que introdujo un error mediante una búsqueda binaria en el historial?",
    options: ["git blame", "git log", "git bisect", "git stash"],
    explanation: "git bisect revisa los commits entre una versión que se sabe buena y otra que se sabe mala, reduciendo el rango a la mitad cada vez hasta encontrar el commit defectuoso.",
  },
  'q-sw-015': {
    prompt: "Las fugas de memoria no pueden ocurrir en lenguajes con recolector de basura.",
    explanation: "Un recolector de basura solo libera los objetos inalcanzables. Los objetos retenidos por error, por ejemplo en cachés sin límite o en listeners, siguen provocando fugas de memoria.",
  },
  'q-sw-016': {
    prompt: "¿Dónde se almacenan normalmente las variables locales de una función?",
    options: ["En la pila (stack)", "Solo en el heap", "Solo en la caché de la CPU", "En el disco"],
    explanation: "Cada llamada a una función obtiene un marco de pila que contiene las variables locales y los parámetros, y que desaparece cuando la función retorna.",
  },
  'q-sw-017': {
    prompt: "¿Qué permite hacer el código asíncrono a un único hilo?",
    options: ["Ejecutar varias tareas intensivas en CPU realmente en paralelo", "Evitar todo manejo de errores", "Trabajar en otras tareas mientras espera la E/S", "Saltarse el event loop"],
    explanation: "Mientras una operación de red o de archivo está pendiente, el hilo puede atender otro trabajo. Asíncrono no significa automáticamente paralelo.",
  },
  'q-sw-018': {
    prompt: "Los hilos de un mismo proceso comparten el mismo espacio de memoria.",
    explanation: "Los hilos comparten la memoria del proceso, lo que facilita la comunicación pero exige sincronización para evitar condiciones de carrera.",
  },
  'q-sw-019': {
    prompt: "¿Qué nombre de función sigue mejor las buenas prácticas de nomenclatura de clean code?",
    options: ["doStuff()", "handle2()", "sendInvoiceReminder()", "mgr()"],
    explanation: "Un buen nombre de función es una frase verbal que describe su efecto, para que el lector la entienda sin abrir la implementación.",
  },
  'q-sw-020': {
    prompt: "¿Qué es la deuda técnica?",
    options: ["El dinero que se debe a los proveedores de software", "El coste futuro de elegir ahora una solución más rápida o más simple", "El número de errores abiertos en un gestor de incidencias", "Los servidores sin usar en la nube"],
    explanation: "Al igual que la deuda financiera, la deuda técnica puede ser una elección razonable, pero sus «intereses» aparecen en forma de cambios más lentos y más errores.",
  },
  'q-sw-021': {
    prompt: "¿Qué combinación ofrece operaciones get y put en O(1) para una caché LRU?",
    options: ["Un mapa hash y una lista doblemente enlazada", "Un array ordenado y búsqueda binaria", "Solo un árbol binario de búsqueda", "Una pila y una cola"],
    explanation: "El mapa ofrece búsquedas en tiempo constante y la lista doblemente enlazada mantiene las entradas ordenadas por uso reciente, con movimientos y eliminaciones en tiempo constante.",
  },
  'q-sw-022': {
    prompt: "Un filtro de Bloom puede devolver falsos negativos: puede decir que un elemento no está cuando sí se añadió.",
    explanation: "Los filtros de Bloom pueden devolver falsos positivos, pero nunca falsos negativos, lo que los hace útiles para evitar con seguridad búsquedas costosas.",
  },
  'q-sw-023': {
    prompt: "¿Por qué el algoritmo de Dijkstra no es adecuado para grafos con pesos de arista negativos?",
    options: ["Solo funciona con árboles", "No puede usar una cola de prioridad", "Considera definitivo un nodo en cuanto sale de la cola", "Se queda sin memoria"],
    explanation: "Dijkstra asume que la distancia más corta es definitiva en cuanto se extrae un nodo. Las aristas negativas pueden producir después un camino más corto, por eso se usa Bellman-Ford en su lugar.",
  },
  'q-sw-024': {
    prompt: "En un sistema de microservicios, ¿qué práctica detecta mejor los cambios de API incompatibles entre servicios antes del despliegue?",
    options: ["Más pruebas manuales", "Pruebas de contrato guiadas por el consumidor", "Solo baterías end-to-end más grandes", "Desactivar el versionado"],
    explanation: "Las pruebas de contrato permiten que cada consumidor publique sus expectativas para que el proveedor las verifique en su pipeline sin ejecutar todo el sistema.",
  },
  'q-sw-025': {
    prompt: "Durante un incidente grave, restablecer el servicio rápidamente suele ir antes que encontrar la corrección perfecta de la causa raíz.",
    explanation: "Una mitigación como un rollback o un feature flag limita primero el impacto en los usuarios. La causa raíz se corrige como es debido una vez que el servicio está estable.",
  },

  // Java y Spring Boot (25)
  'q-java-001': {
    prompt: "En Java, ¿qué compara == entre dos referencias a objetos?",
    options: ["Su contenido", "Sus códigos hash", "Sus referencias, es decir, si son el mismo objeto", "Sus representaciones en texto"],
    explanation: "Para objetos, == comprueba la identidad. equals() compara la igualdad lógica tal como la define la clase, por ejemplo el contenido de un String.",
  },
  'q-java-002': {
    prompt: "Si dos objetos son iguales según equals(), deben devolver el mismo hashCode().",
    explanation: "Las colecciones basadas en hash usan hashCode() para encontrar el bucket, así que objetos iguales con códigos hash distintos rompen HashMap y HashSet.",
  },
  'q-java-003': {
    prompt: "¿Cuándo resulta más útil StringBuilder?",
    options: ["Para comparar dos cadenas", "Para construir una cadena paso a paso dentro de un bucle", "Para almacenar contraseñas de forma segura", "Para convertir números a texto una sola vez"],
    explanation: "String es inmutable, así que la concatenación repetida en un bucle crea muchos objetos temporales. StringBuilder añade contenido a un búfer mutable.",
  },
  'q-java-004': {
    prompt: "¿Cuál de estas es una excepción comprobada (checked) en Java?",
    options: ["IOException", "NullPointerException", "IllegalArgumentException", "ArithmeticException"],
    explanation: "IOException extiende Exception pero no RuntimeException, así que el compilador obliga a quien la llama a capturarla o declararla.",
  },
  'q-java-005': {
    prompt: "Declarar una variable List como final hace que la propia lista sea inmutable.",
    explanation: "final solo impide reasignar la variable. La lista se puede seguir modificando, a menos que sea una lista inmutable como List.of().",
  },
  'q-java-006': {
    prompt: "¿Qué genera automáticamente el compilador para un record de Java?",
    options: ["Setters para cada campo", "Un constructor sin argumentos", "Accesores, equals(), hashCode() y toString()", "Una clase builder"],
    explanation: "Los records son contenedores de datos inmutables: el compilador genera campos private final, un constructor canónico, accesores y métodos basados en el valor.",
  },
  'q-java-007': {
    prompt: "¿Qué colección deberías elegir para almacenar elementos únicos en orden?",
    options: ["ArrayList", "HashSet", "LinkedList", "TreeSet"],
    explanation: "TreeSet mantiene ordenados los elementos únicos usando un árbol rojo-negro. HashSet garantiza la unicidad, pero no el orden.",
  },
  'q-java-008': {
    prompt: "Desde Java 8, un bucket de HashMap con muchas colisiones puede convertirse en un árbol balanceado.",
    explanation: "Cuando un bucket supera un umbral y la tabla es lo bastante grande, se convierte en árbol, lo que mejora el peor caso de O(n) a O(log n).",
  },
  'q-java-009': {
    prompt: "¿Cuál es la forma más sencilla y segura de eliminar de un ArrayList los elementos que cumplen una condición?",
    options: ["Llamar a remove() dentro de un bucle for-each", "Usar list.removeIf(condition)", "Asignar null a los elementos", "Capturar ConcurrentModificationException"],
    explanation: "removeIf modifica la lista de forma segura. Eliminar dentro de un bucle for-each provoca ConcurrentModificationException, incluso en código de un solo hilo.",
  },
  'q-java-010': {
    prompt: "En un ConcurrentHashMap, ¿qué enfoque incrementa un contador de forma atómica?",
    options: ["if (!map.containsKey(k)) map.put(k, 1)", "map.put(k, map.get(k) + 1)", "map.merge(k, 1, Integer::sum)", "synchronized sobre un nuevo Object cada vez"],
    explanation: "merge realiza la lectura y la actualización como una sola operación atómica. Las secuencias de comprobar y luego actuar no son atómicas, ni siquiera en un mapa concurrente.",
  },
  'q-java-011': {
    prompt: "Collections.unmodifiableList() devuelve una instantánea independiente que nunca cambia.",
    explanation: "Devuelve una vista de solo lectura. Los cambios en la lista subyacente siguen siendo visibles a través de ella. List.copyOf() crea una copia inmutable.",
  },
  'q-java-012': {
    prompt: "¿Cuándo procesa realmente sus elementos un pipeline de streams de Java?",
    options: ["Cuando se llama a filter()", "Cuando se crea el stream", "Cuando se llama a una operación terminal como collect()", "Inmediatamente después de cada map()"],
    explanation: "Las operaciones intermedias son perezosas (lazy). El procesamiento solo empieza cuando se invoca una operación terminal.",
  },
  'q-java-013': {
    prompt: "¿Qué operación convierte un Stream<Order> en un Stream<Item> cuando cada pedido tiene una lista de artículos?",
    options: ["map(Order::items)", "flatMap(o -> o.items().stream())", "filter(Order::items)", "reduce(Order::items)"],
    explanation: "flatMap transforma cada elemento en un stream y aplana los resultados. map daría un Stream<List<Item>>.",
  },
  'q-java-014': {
    prompt: "Optional está pensado principalmente como tipo de retorno, no para campos ni parámetros de métodos.",
    explanation: "Optional indica que un resultado puede estar ausente. Usarlo en campos o parámetros añade sobrecarga y complica las API.",
  },
  'q-java-015': {
    prompt: "¿Qué situación encaja mal con un stream paralelo?",
    options: ["Trabajo intensivo en CPU sobre un ArrayList grande", "Llamar a una API HTTP remota por cada elemento", "Sumar un array grande de primitivos", "Transformaciones sin estado de elementos independientes"],
    explanation: "La E/S bloqueante dentro de un stream paralelo acapara el ForkJoinPool compartido. Los streams paralelos ayudan sobre todo con trabajo limitado por CPU sobre fuentes divisibles.",
  },
  'q-java-016': {
    prompt: "¿Qué pasa si llamas a run() en lugar de start() en un Thread?",
    options: ["Se crea un nuevo hilo dos veces", "El código se ejecuta en el hilo actual", "Se lanza una excepción", "La JVM se detiene"],
    explanation: "start() crea un nuevo hilo que luego llama a run(). Llamar directamente a run() simplemente ejecuta el método en el hilo que lo invoca.",
  },
  'q-java-017': {
    prompt: "Declarar un contador int como volatile hace que count++ sea thread-safe.",
    explanation: "volatile garantiza la visibilidad, no la atomicidad. count++ es una lectura, un incremento y una escritura, así que usa AtomicInteger o un lock.",
  },
  'q-java-018': {
    prompt: "¿Cuál es la forma más fiable de evitar interbloqueos (deadlocks) entre dos locks?",
    options: ["Usar más hilos", "Adquirir siempre los locks en el mismo orden global", "Aumentar el tamaño del heap", "Llamar a System.gc() con regularidad"],
    explanation: "Los deadlocks necesitan un ciclo de espera. Adquirir los locks en un orden coherente rompe ese ciclo.",
  },
  'q-java-019': {
    prompt: "¿Para qué tipo de carga aportan más beneficio los hilos virtuales de Java 21?",
    options: ["Cálculos limitados por CPU", "Servicios limitados por E/S con muchas llamadas bloqueantes concurrentes", "Scripts batch de un solo hilo", "Cálculos en GPU"],
    explanation: "Los hilos virtuales se desmontan mientras se bloquean en E/S, así que muchas peticiones pueden esperar con un coste bajo. No aceleran el trabajo limitado por CPU.",
  },
  'q-java-020': {
    prompt: "¿Dónde almacena la JVM los metadatos de las clases desde Java 8?",
    options: ["PermGen", "La generación joven", "Metaspace", "La pila del hilo"],
    explanation: "Metaspace sustituyó a PermGen en Java 8 y almacena los metadatos de las clases en memoria nativa.",
  },
  'q-java-021': {
    prompt: "El límite de memoria de un contenedor debe fijarse igual al valor -Xmx de la JVM.",
    explanation: "La JVM también usa memoria fuera del heap, como metaspace, las pilas de los hilos y la caché de código, así que el contenedor necesita más que el tamaño del heap.",
  },
  'q-java-022': {
    prompt: "¿Por qué un método @Transactional llamado desde otro método de la misma clase suele ejecutarse sin transacción?",
    options: ["Spring ignora las anotaciones en los métodos públicos", "La llamada no pasa por el proxy de Spring", "Las transacciones solo funcionan con interfaces", "El método debe ser static"],
    explanation: "Spring aplica las transacciones mediante un proxy. La autoinvocación llama al método directamente sobre el objeto, así que el proxy no interviene.",
  },
  'q-java-023': {
    prompt: "¿Qué código de estado HTTP corresponde a una petición de un usuario autenticado que no tiene permiso?",
    options: ["401 Unauthorized", "403 Forbidden", "404 Not Found", "500 Internal Server Error"],
    explanation: "401 significa que la autenticación falta o no es válida; 403 significa que el usuario es conocido, pero no tiene permiso para realizar la acción.",
  },
  'q-java-024': {
    prompt: "En una API REST se espera que PUT y DELETE sean idempotentes.",
    explanation: "Repetir un PUT o un DELETE deja el recurso en el mismo estado, así que los clientes pueden reintentarlos con seguridad. POST no es idempotente.",
  },
  'q-java-025': {
    prompt: "¿Qué patrón publica eventos de forma fiable junto con un cambio en la base de datos en un microservicio?",
    options: ["Commit en dos fases entre todos los servicios", "Transactional outbox", "Base de datos compartida entre servicios", "Sondear la interfaz de usuario"],
    explanation: "El outbox guarda el evento en la misma transacción local que el cambio de negocio, y un relay lo publica, así que no se pierden eventos.",
  },

  // Frontend (25)
  'q-fe-001': {
    prompt: "¿Qué afirmación sobre const en JavaScript es correcta?",
    options: ["Un objeto const no se puede modificar", "Una variable const no se puede reasignar", "const tiene ámbito de función", "Las variables const se elevan (hoisting) y se inicializan a undefined"],
    explanation: "const impide reasignar el enlace, pero los objetos y arrays asignados a él se pueden seguir modificando.",
  },
  'q-fe-002': {
    prompt: 'En JavaScript, 0 == "" se evalúa como true.',
    explanation: "La igualdad laxa convierte ambos valores antes de compararlos, lo que da resultados sorprendentes. La igualdad estricta === evita este problema.",
  },
  'q-fe-003': {
    prompt: "¿Qué devuelve count ?? 10 cuando count vale 0?",
    options: ["10", "0", "undefined", "null"],
    explanation: "El operador de fusión de nulos (nullish coalescing) solo sustituye null o undefined. count || 10 devolvería 10 porque 0 es falsy.",
  },
  'q-fe-004': {
    prompt: '¿En qué orden se muestran estos mensajes? console.log("A"); setTimeout(() => console.log("B")); Promise.resolve().then(() => console.log("C")); console.log("D");',
    options: ["A, B, C, D", "A, D, B, C", "A, D, C, B", "A, C, D, B"],
    explanation: "Primero se ejecuta el código síncrono, luego las microtareas como los callbacks de las promesas y después las macrotareas como los temporizadores.",
  },
  'q-fe-005': {
    prompt: "fetch() rechaza su promesa cuando el servidor responde con HTTP 404.",
    explanation: "fetch solo rechaza ante fallos de red. Para los errores HTTP debes comprobar response.ok o el código de estado.",
  },
  'q-fe-006': {
    prompt: "¿Qué es un closure en JavaScript?",
    options: ["Una función que no se puede llamar dos veces", "Una función junto con las variables del ámbito donde se creó", "Una forma de cerrar pestañas del navegador", "Un método privado de clase"],
    explanation: "Los closures permiten que las funciones internas conserven el acceso a las variables externas después de que la función externa haya retornado.",
  },
  'q-fe-007': {
    prompt: "¿Por qué los módulos ES permiten un mejor tree shaking que CommonJS?",
    options: ["Se cargan más rápido por HTTP", "Sus imports y exports son estáticos y analizables antes de la ejecución", "Siempre son más pequeños", "No pueden importar otros módulos"],
    explanation: "Los bundlers pueden analizar grafos de imports estáticos y eliminar los exports no usados. Las llamadas require de CommonJS son dinámicas y se resuelven en tiempo de ejecución.",
  },
  'q-fe-008': {
    prompt: "¿Qué tipo de TypeScript conviene preferir para datos cuya forma aún no has validado?",
    options: ["any", "unknown", "never", "object"],
    explanation: "unknown acepta cualquier valor, pero te obliga a acotarlo antes de usarlo, lo que mantiene la seguridad de tipos. any desactiva por completo las comprobaciones.",
  },
  'q-fe-009': {
    prompt: "Los tipos de TypeScript se comprueban en tiempo de ejecución en el navegador.",
    explanation: "Los tipos se eliminan durante la compilación. Para los datos externos se necesita validación en tiempo de ejecución, por ejemplo con una librería de esquemas.",
  },
  'q-fe-010': {
    prompt: "¿Qué utility type crea un tipo sin la propiedad password de User?",
    options: ['Pick<User, "password">', "Partial<User>", 'Omit<User, "password">', "Required<User>"],
    explanation: "Omit elimina las claves indicadas. Pick conservaría solo la propiedad password.",
  },
  'q-fe-011': {
    prompt: "¿Qué hace que un tipo unión sea «discriminado»?",
    options: ["Usa la palabra clave class", "Todos los miembros comparten una propiedad literal, como status", "Solo contiene tipos primitivos", "Se declara con una interface"],
    explanation: "Una propiedad literal compartida permite a TypeScript acotar el tipo tras comprobarla y hace posibles los switch exhaustivos.",
  },
  'q-fe-012': {
    prompt: "En React, ¿qué afirmación sobre las props es correcta?",
    options: ["Un componente puede modificar sus propias props", "Las props son entradas de solo lectura que pasa el padre", "Las props se guardan en localStorage", "Las props sustituyen por completo al estado"],
    explanation: "Las props vienen del padre y deben tratarse como de solo lectura. El estado pertenece al propio componente, que es quien lo actualiza.",
  },
  'q-fe-013': {
    prompt: "Usar el índice del array como key siempre es seguro, incluso cuando los elementos de la lista se pueden reordenar.",
    explanation: "Con reordenaciones, inserciones o filtrados, las keys basadas en el índice hacen que React asocie los elementos equivocados, lo que puede mezclar su estado.",
  },
  'q-fe-014': {
    prompt: "¿Cuándo se ejecuta la función de limpieza de un useEffect?",
    options: ["Solo en el primer renderizado", "Antes de que el efecto vuelva a ejecutarse y cuando el componente se desmonta", "Solo cuando se recarga la página", "Nunca de forma automática"],
    explanation: "La limpieza elimina los listeners, temporizadores o suscripciones de la ejecución anterior, lo que evita fugas y actualizaciones obsoletas.",
  },
  'q-fe-015': {
    prompt: "¿Qué suele ocurrir al llamar dos veces a setCount(count + 1) en el mismo manejador de clic?",
    options: ["Incrementa en 2", "Incrementa en 1", "Lanza un error", "Reinicia el contador"],
    explanation: "Ambas llamadas leen la misma instantánea de count. Usa la forma con función actualizadora setCount(c => c + 1) para incrementar dos veces.",
  },
  'q-fe-016': {
    prompt: "Dos componentes que llaman al mismo custom hook comparten el mismo estado.",
    explanation: "Cada llamada a un hook crea un estado independiente. Los custom hooks comparten lógica, no datos.",
  },
  'q-fe-017': {
    prompt: "¿Por qué React.memo puede no evitar un nuevo renderizado?",
    options: ["memo solo funciona en componentes de clase", "El padre pasa una prop de tipo objeto o función nueva en cada renderizado", "El componente usa JSX", "El componente no tiene estado"],
    explanation: "memo compara las props de forma superficial. Las identidades nuevas de objetos o funciones hacen que las props parezcan distintas; useMemo y useCallback conservan la identidad.",
  },
  'q-fe-018': {
    prompt: "¿Cuál es una ventaja clave de los React Server Components?",
    options: ["Ejecutan las animaciones más rápido", "No añaden JavaScript de esos componentes al bundle del cliente", "Sustituyen a CSS", "Funcionan sin servidor"],
    explanation: "Los Server Components se ejecutan en el servidor y envían un resultado serializado, así que el navegador no necesita descargar su código.",
  },
  'q-fe-019': {
    prompt: "¿Qué renderiza React Native en el dispositivo?",
    options: ["HTML dentro de un WebView", "Vistas nativas de la plataforma", "Solo dibujos en canvas", "Documentos PDF"],
    explanation: "React Native usa componentes de React, pero renderiza vistas nativas reales, no una página web.",
  },
  'q-fe-020': {
    prompt: "FlatList renderiza solo los elementos cercanos a la zona visible en lugar de toda la lista.",
    explanation: "FlatList virtualiza la lista, lo que mantiene bajos los costes de memoria y de renderizado en listas largas.",
  },
  'q-fe-021': {
    prompt: "¿Dónde debe guardar una app móvil un token de autenticación?",
    options: ["AsyncStorage", "Una variable global", "Un almacenamiento seguro respaldado por Keystore o Keychain", "Dentro del bundle de la app"],
    explanation: "Los tokens son datos sensibles. Un almacenamiento seguro como expo-secure-store usa el Android Keystore o el iOS Keychain.",
  },
  'q-fe-022': {
    prompt: "Con box-sizing: border-box, ¿qué incluye la propiedad width?",
    options: ["Solo el contenido", "El contenido, el padding y el borde", "El contenido y el margin", "Solo el borde"],
    explanation: "border-box incluye el padding y el borde en el ancho, lo que hace que los tamaños sean más fáciles de razonar.",
  },
  'q-fe-023': {
    prompt: "¿Cuál es la relación de contraste mínima que recomienda WCAG para el texto normal (nivel AA)?",
    options: ["2:1", "3:1", "4,5:1", "10:1"],
    explanation: "WCAG AA exige al menos 4,5:1 para el texto normal y 3:1 para el texto grande, de modo que el texto siga siendo legible para más personas.",
  },
  'q-fe-024': {
    prompt: "¿Qué Core Web Vital mide la capacidad de respuesta a las interacciones del usuario?",
    options: ["LCP", "CLS", "INP", "TTFB"],
    explanation: "Interaction to Next Paint sustituyó a First Input Delay en 2024. LCP mide la carga y CLS mide la estabilidad visual.",
  },
  'q-fe-025': {
    prompt: "Los recursos estáticos con nombres de archivo que incluyen un hash del contenido se pueden cachear con seguridad durante mucho tiempo.",
    explanation: "Un nuevo despliegue cambia el nombre del archivo, así que los navegadores descargan la nueva versión mientras los archivos antiguos en caché siguen siendo válidos.",
  },

  // General (5)
  'q-gen-001': {
    prompt: "¿Qué estructura funciona bien para responder a «Háblame de ti»?",
    options: ["Toda tu historia de vida desde el colegio", "Presente, pasado, futuro", "Una lista de aficiones", "Tus expectativas salariales"],
    explanation: "Presenta tu puesto actual, la experiencia que te llevó hasta ahí y por qué este empleo es el siguiente paso, en uno o dos minutos aproximadamente.",
  },
  'q-gen-002': {
    prompt: "«Soy demasiado perfeccionista» se considera, en general, una respuesta sólida a la pregunta sobre tu debilidad.",
    explanation: "Los entrevistadores lo ven como una fortaleza disfrazada. Una debilidad real y no crítica, con acciones concretas de mejora, resulta más creíble.",
  },
  'q-gen-003': {
    prompt: "¿Cuál es la mejor forma de explicar por qué dejas tu empleo actual?",
    options: ["Criticar a tu jefe", "Centrarte en aquello hacia lo que te diriges", "Decir que te aburrías", "Evitar la pregunta"],
    explanation: "Las razones positivas y orientadas al crecimiento tranquilizan al entrevistador y muestran profesionalidad hacia tu empleador actual.",
  },
  'q-gen-004': {
    prompt: "¿Cómo deberías prepararte para «¿Qué sabes de nuestra empresa?»?",
    options: ["Memorizar la fecha de fundación", "Investigar el producto, los clientes y las noticias recientes, y relacionarlos con tu interés", "Leer solo el título del puesto", "Pedir al entrevistador que te lo explique"],
    explanation: "Los entrevistadores esperan que sepas a qué se dedica la empresa y por qué te interesa, no que recites su historia.",
  },
  'q-gen-005': {
    prompt: "Cuando te preguntan dónde te ves dentro de cinco años, es mejor describir una dirección en cuanto a habilidades e impacto que un puesto concreto.",
    explanation: "Una dirección realista y coherente con el puesto es más creíble que un título rígido o una ambición que la empresa no puede ofrecer.",
  },

  // Comportamiento (5)
  'q-beh-001': {
    prompt: "¿Qué significan las siglas del método STAR?",
    options: ["Strategy, Task, Analysis, Review (Estrategia, Tarea, Análisis, Revisión)", "Situation, Task, Action, Result (Situación, Tarea, Acción, Resultado)", "Skills, Talent, Ambition, Results (Habilidades, Talento, Ambición, Resultados)", "Situation, Team, Approach, Risk (Situación, Equipo, Enfoque, Riesgo)"],
    explanation: "El método STAR (Situación, Tarea, Acción, Resultado) estructura las respuestas de comportamiento: el contexto, tu responsabilidad, lo que hiciste y el resultado medible.",
  },
  'q-beh-002': {
    prompt: "En una respuesta STAR, ¿qué parte suele ser la más larga?",
    options: ["Situación (Situation)", "Tarea (Task)", "Acción (Action)", "Resultado (Result)"],
    explanation: "La Acción muestra lo que hiciste tú personalmente, que es lo que los entrevistadores quieren evaluar.",
  },
  'q-beh-003': {
    prompt: "En las respuestas de comportamiento, decir «nosotros» todo el tiempo es mejor que decir «yo», porque demuestra espíritu de equipo.",
    explanation: "Los entrevistadores necesitan conocer tu aportación. Describe tus acciones en primera persona («yo») y reconoce el mérito de los demás cuando sea justo.",
  },
  'q-beh-004': {
    prompt: "¿Qué hace que una respuesta sobre un error que cometiste sea sólida?",
    options: ["Elegir un error causado por un compañero", "Decir que nunca cometes errores", "Asumirlo, limitar el impacto y explicar la salvaguarda que añadiste", "Describir con detalle un error catastrófico"],
    explanation: "Los entrevistadores buscan honestidad, una reacción rápida y un aprendizaje que evite que el error se repita.",
  },
  'q-beh-005': {
    prompt: "Cuando no estás de acuerdo con tu jefe, plantearlo en privado con pruebas y después respetar la decisión final es un enfoque profesional.",
    explanation: "Demuestra a la vez el valor de cuestionar y la lealtad para apoyar la decisión, sin dejar de reducir los riesgos cuando sea posible.",
  },
};
