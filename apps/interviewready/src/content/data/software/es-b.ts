import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de software 026-050: algoritmos (parte), patrones de diseño, código limpio, pruebas, depuración. */
export const esB: TextTable<QuestionText> = {
  'sw-026': {
    question: "¿Qué es la programación dinámica? Da un ejemplo.",
    intent: "El entrevistador comprueba si reconoces problemas con subproblemas superpuestos y sabes optimizarlos.",
    expectedAnswer:
      "La programación dinámica resuelve un problema dividiéndolo en subproblemas superpuestos, resolviendo cada uno una sola vez y reutilizando los resultados almacenados. Se aplica cuando el problema tiene subestructura óptima, es decir, cuando una solución óptima se construye a partir de soluciones óptimas de los subproblemas. Hay dos estilos: descendente (top-down) con memoización, donde una función recursiva guarda en caché sus resultados, y ascendente (bottom-up), donde se rellena una tabla a partir de los casos más pequeños. Un ejemplo sencillo es Fibonacci: la recursión ingenua es exponencial porque recalcula los mismos valores, mientras que almacenar los resultados la deja en O(n). Ejemplos reales son calcular el número mínimo de monedas para una cantidad, la distancia de edición entre dos cadenas o la subsecuencia común más larga.",
    explanation:
      "La habilidad clave es detectar subproblemas repetidos en una solución recursiva. Una vez que los ves, la caché convierte un tiempo exponencial en un tiempo polinómico.",
    example: "coins(amount) = 1 + min(coins(amount - c) for c in denominations), con los resultados almacenados en un array de 0 a amount.",
    tips: ["Parte de una formulación recursiva y luego añade memoización.", "Menciona la complejidad temporal y espacial de la versión optimizada."],
    commonMistakes: ["Confundir la programación dinámica con la recursión simple.", "Usarla cuando los subproblemas no se superponen."],
    followUpQuestions: ["¿Puedes reducir la memoria que usa tu tabla?", "¿Cuál es la diferencia entre los algoritmos voraces y la programación dinámica?"],
  },
  'sw-027': {
    question: "¿Cómo encontrarías el camino más corto en un grafo ponderado y cuáles son los límites de tu enfoque?",
    intent: "El entrevistador evalúa tu conocimiento avanzado de algoritmos y tu atención a las precondiciones, como los pesos negativos.",
    expectedAnswer:
      "Con pesos no negativos usaría el algoritmo de Dijkstra. Mantiene una cola de prioridad de nodos ordenados por su mejor distancia actual desde el origen. Extrae repetidamente el nodo más cercano y, para cada vecino, comprueba si pasar por ese nodo da un camino más corto; si es así, actualiza la distancia e inserta el vecino en la cola. Con un montículo binario se ejecuta en O((V + E) log V). Falla con aristas de peso negativo, porque da por definitivo un nodo extraído de la cola. Para pesos negativos usaría Bellman-Ford, que relaja todas las aristas V - 1 veces en O(V × E) y además puede detectar ciclos negativos. Cuando existe una buena heurística, como la distancia geográfica en un mapa, A* explora menos nodos que Dijkstra porque prioriza los nodos que parecen más cercanos al destino. Para redes de carreteras muy grandes, los sistemas precalculan estructuras como las contraction hierarchies.",
    explanation:
      "Las respuestas avanzadas indican el algoritmo, su complejidad y, sobre todo, sus supuestos. Saber cuándo Dijkstra es incorrecto y qué alternativa usar demuestra una comprensión real.",
    tips: ["Indica explícitamente el supuesto de pesos no negativos.", "Menciona la complejidad junto con la estructura de datos usada.", "Demuestra que conoces A* u otras optimizaciones."],
    commonMistakes: ["Usar BFS en un grafo ponderado.", "Aplicar Dijkstra con pesos negativos."],
    followUpQuestions: ["¿Cómo reconstruyes el camino y no solo su longitud?", "¿Cómo gestionarías un grafo que cambia con frecuencia?"],
  },
  'sw-028': {
    question: "¿Cómo procesarías un conjunto de datos demasiado grande para caber en memoria, por ejemplo para encontrar los elementos más frecuentes?",
    intent: "El entrevistador comprueba si sabes adaptar los algoritmos a restricciones reales: memoria, disco y distribución.",
    expectedAnswer:
      "Primero evitaría cargarlo todo: procesaría los datos en streaming y conservaría solo lo necesario. Para conteos exactos con muchos elementos distintos, particionaría los datos aplicando un hash a cada elemento para asignarlo a uno de varios ficheros, de modo que un mismo elemento siempre vaya al mismo fichero. Cada fichero es entonces lo bastante pequeño para contarlo en memoria con un hash map, y me quedo con los k primeros de cada uno mediante un min-heap de tamaño k, para después fusionarlos. Si se aceptan respuestas aproximadas, un algoritmo de streaming como Count-Min Sketch combinado con un heap, o el algoritmo de Misra-Gries, encuentra los elementos frecuentes con memoria fija. A mayor escala, esa misma idea de particionado es lo que hacen MapReduce o Spark entre máquinas: asignar elementos a claves, redistribuir (shuffle) por clave y reducir los conteos. También preguntaría si el resultado debe ser exacto y con qué frecuencia hay que calcularlo, porque eso cambia el mejor diseño.",
    explanation:
      "Esta pregunta pone a prueba tu capacidad de combinar hashing, heaps y streaming con una visión de sistema. Preguntar por la exactitud y la frecuencia demuestra que diseñas en función de los requisitos.",
    tips: ["Menciona el particionado por hash para que las claves iguales queden juntas.", "Propón tanto un enfoque exacto como uno aproximado.", "Haz preguntas aclaratorias sobre los requisitos."],
    commonMistakes: ["Sugerir simplemente comprar más memoria.", "Ordenar todo el conjunto de datos sin considerar el coste de la ordenación externa."],
    followUpQuestions: ["¿Cómo funciona un Count-Min Sketch?", "¿Cómo gestionarías una clave muy sesgada que hace que una partición sea demasiado grande?"],
  },
  'sw-029': {
    question: "¿Qué es un patrón de diseño? Nombra algunos que hayas usado.",
    intent: "El entrevistador comprueba que entiendes los patrones como soluciones reutilizables y que sabes vincularlos a código real.",
    expectedAnswer:
      "Un patrón de diseño es una solución conocida y reutilizable a un problema de diseño recurrente, descrita de forma independiente de un lenguaje concreto. Los patrones dan a los desarrolladores un vocabulario común. Entre los más habituales están Factory, que centraliza la creación de objetos; Strategy, que permite intercambiar algoritmos detrás de una interfaz, por ejemplo distintos métodos de pago; Observer, donde los objetos se suscriben a eventos, usado en los event listeners; Adapter, que envuelve una clase existente para ajustarla a una interfaz esperada; y Decorator, que añade comportamiento envolviendo un objeto, por ejemplo para añadir logging alrededor de un servicio.",
    explanation:
      "A los entrevistadores les importan menos los nombres que saber cuándo un patrón resuelve un problema real. Vincular cada patrón con algo que hayas construido hace que la respuesta sea creíble.",
    tips: ["Elige patrones que hayas usado de verdad.", "Explica el problema que resolvió cada uno."],
    commonMistakes: ["Enumerar muchos patrones sin ejemplos.", "Usar patrones donde bastaría con código sencillo."],
    followUpQuestions: ["¿Qué patrón usan mucho frameworks como Spring?", "¿Cuándo un patrón es sobreingeniería?"],
  },
  'sw-030': {
    question: "Explica el patrón Strategy y cuándo lo usarías.",
    intent: "El entrevistador quiere una comprensión concreta de un patrón de comportamiento muy común.",
    expectedAnswer:
      "El patrón Strategy define una familia de algoritmos intercambiables detrás de una interfaz común y permite al cliente elegir uno en tiempo de ejecución. Por ejemplo, un servicio de checkout puede usar una interfaz ShippingCostStrategy con implementaciones para envío estándar, exprés y recogida en tienda. El servicio llama a strategy.calculate(order) sin saber cuál tiene. Esto sustituye largas cadenas de if/else o switch sobre un tipo, facilita añadir una opción nueva sin modificar el código existente y permite probar cada estrategia por separado. En lenguajes con funciones de primera clase, una estrategia puede ser simplemente una función pasada como parámetro.",
    explanation:
      "Strategy es una aplicación directa del polimorfismo y del principio abierto/cerrado. Reconocer que una lambda puede cumplir el mismo papel demuestra una comprensión moderna.",
    example: "interface DiscountStrategy { Money apply(Order o); } — new NoDiscount(), new PercentageDiscount(10), new BuyTwoGetOne() se eligen por configuración.",
    tips: ["Parte del problema: condicionales que no paran de crecer.", "Menciona que las funciones pueden sustituir a pequeñas clases de estrategia."],
    commonMistakes: ["Crear una interfaz de estrategia para una única implementación que nunca va a cambiar."],
    followUpQuestions: ["¿Cómo elegirías la estrategia en tiempo de ejecución?", "¿En qué se diferencia Strategy de State?"],
  },
  'sw-031': {
    question: "¿Qué es el patrón Observer? ¿Qué problemas puede causar?",
    intent: "El entrevistador comprueba que entiendes el diseño orientado a eventos y sus trampas.",
    expectedAnswer:
      "En el patrón Observer, un sujeto mantiene una lista de observadores y los notifica cuando cambia su estado. Los observadores se registran y se dan de baja por sí mismos, de modo que el sujeto no necesita conocer sus tipos concretos. Es la base de los event listeners en las interfaces de usuario, de los streams reactivos y de los eventos de dominio. Entre sus problemas están las fugas de memoria cuando los observadores olvidan darse de baja y siguen referenciados, el orden impredecible de las notificaciones, las cascadas de actualizaciones difíciles de depurar y las excepciones de un observador que afectan a los demás. La notificación síncrona también puede ralentizar al sujeto, por eso muchos sistemas despachan los eventos de forma asíncrona mediante una cola o un bus de eventos.",
    explanation:
      "Observer desacopla productores y consumidores, pero ese desacoplamiento hace que los flujos sean más difíciles de rastrear. Conocer sus trampas demuestra experiencia real con código orientado a eventos.",
    tips: ["Da un caso de uso real, como listeners de interfaz o eventos de dominio.", "Menciona la baja de suscripciones y las fugas."],
    commonMistakes: ["Ignorar la gestión de errores entre observadores.", "Olvidar eliminar los listeners, por ejemplo en los efectos de React."],
    followUpQuestions: ["¿Qué relación tiene con la mensajería publish/subscribe?", "¿Cómo limpias los listeners en el ciclo de vida de un componente?"],
  },
  'sw-032': {
    question: "¿Por qué el patrón Singleton se considera a menudo un antipatrón?",
    intent: "El entrevistador quiere ver pensamiento crítico sobre un patrón sencillo pero que se usa mal con frecuencia.",
    expectedAnswer:
      "Un Singleton garantiza que una clase tenga una sola instancia y ofrece acceso global a ella. El problema es el acceso global: cualquier código puede llegar a ella, lo que oculta dependencias, crea acoplamiento implícito y dificulta las pruebas, porque no es fácil sustituirla por un fake. Los singletons con estado mutable también provocan problemas de concurrencia y comportamientos que dependen del orden entre pruebas. Normalmente es mejor tener una única instancia gestionada por un contenedor de inyección de dependencias, como los beans de Spring, que por defecto son singletons, e inyectarla explícitamente. Así conservas «una sola instancia» sin el acceso global y puedes sustituirla en las pruebas.",
    explanation:
      "La clave está en distinguir entre tener una sola instancia y acceder a ella globalmente. La inyección de dependencias conserva la ventaja y elimina la mayoría de los inconvenientes.",
    tips: ["Separa la idea de instancia única de la de acceso global.", "Propón la inyección de dependencias como alternativa."],
    commonMistakes: ["Decir que los singletons nunca deberían existir.", "Olvidar la seguridad entre hilos en la inicialización perezosa."],
    followUpQuestions: ["¿Cómo harías thread-safe un singleton perezoso en Java?", "¿Cuál es el scope por defecto de un bean de Spring?"],
  },
  'sw-033': {
    question: "¿Cómo decides si introducir un patrón de diseño o una abstracción en tu código?",
    intent: "El entrevistador evalúa tu criterio de ingeniería: evitar tanto el código rígido como la sobreingeniería.",
    expectedAnswer:
      "Parto de la presión de cambio real, no del patrón. Si un fragmento de código tiene una sola implementación y ninguna variación previsible, lo mantengo concreto y sencillo. Introduzco una abstracción cuando veo una necesidad real: va a llegar una segunda implementación, hay que sustituir una dependencia en las pruebas o un condicional crece con cada caso nuevo. Una regla útil es esperar a la segunda o tercera aparición antes de generalizar, para que la abstracción se base en ejemplos reales y no en suposiciones. También pienso en quién mantendrá el código: una abstracción debe facilitar el siguiente cambio al equipo, y su nombre debe expresar el dominio, no el patrón. Cuando introduzco una, prefiero la forma más simple, por ejemplo un parámetro de tipo función antes que una jerarquía Strategy completa, y documento por qué existe.",
    explanation:
      "Los ingenieros avanzados equilibran flexibilidad y simplicidad. Justificar las abstracciones con evidencias de cambio, como casos repetidos o necesidades de prueba, evita la complejidad especulativa.",
    tips: ["Menciona la «regla de tres» o esperar a que haya variación real.", "Habla del coste de la abstracción para quien lee el código.", "Da un ejemplo de tu experiencia."],
    commonMistakes: ["Añadir interfaces para todo «por si acaso».", "Rechazar cualquier abstracción y duplicar lógica por todas partes."],
    followUpQuestions: ["Háblame de una abstracción de la que te arrepentiste.", "¿Cómo eliminas una abstracción que ya no es útil?"],
  },
  'sw-034': {
    question: "Explica la arquitectura hexagonal (puertos y adaptadores). ¿Qué problema resuelve?",
    intent: "El entrevistador comprueba tus conocimientos de arquitectura y si entiendes la dirección de las dependencias en aplicaciones reales.",
    expectedAnswer:
      "La arquitectura hexagonal sitúa la lógica de negocio en el centro y la aísla de los detalles técnicos. El núcleo define puertos: interfaces que describen lo que necesita, como OrderRepository o PaymentGateway, y lo que ofrece, como un caso de uso PlaceOrder. Los adaptadores implementan esos puertos para tecnologías concretas: un repositorio JPA, un cliente HTTP para el proveedor de pagos, un controlador REST o un listener de mensajes que llama al caso de uso. Las dependencias apuntan hacia dentro, de modo que el núcleo no importa frameworks ni código de base de datos. Esto permite probar las reglas de negocio sin infraestructura, sustituir una base de datos o un proveedor con un impacto limitado y mantener las actualizaciones de frameworks lejos del dominio. Los costes son más interfaces y más código de mapeo, algo que compensa en dominios complejos pero que suele ser excesivo para servicios CRUD sencillos.",
    explanation:
      "La esencia es la inversión de dependencias a escala de arquitectura. Los entrevistadores valoran a los candidatos que también dicen cuándo el enfoque no compensa su sobrecoste.",
    tips: ["Explica los puertos y adaptadores con nombres concretos.", "Insiste en la dirección de las dependencias.", "Comenta cuándo resulta excesivo."],
    commonMistakes: ["Confundirla con simplemente tener capas.", "Dejar que las anotaciones del framework se filtren al modelo de dominio."],
    followUpQuestions: ["¿Qué relación tiene con la clean architecture?", "¿Cómo probarías un caso de uso en esta arquitectura?"],
  },
  'sw-035': {
    question: "¿Qué hace que un código sea «limpio», en tu opinión?",
    intent: "El entrevistador quiere conocer tus estándares de calidad y si están al servicio de la legibilidad y el mantenimiento.",
    expectedAnswer:
      "Para mí, código limpio es código que otro desarrollador puede entender y modificar con seguridad. Eso implica nombres claros que expresen la intención, funciones pequeñas que hagan una sola cosa, un formato coherente y ninguna lógica duplicada. También implica gestionar los errores de forma explícita, mantener visibles los efectos secundarios y tener pruebas que documenten el comportamiento. Los comentarios explican por qué se hace algo, no qué hace el código. Por último, el código limpio sigue las convenciones del equipo y del código base, aunque yo personalmente eligiera otra cosa.",
    explanation:
      "Los entrevistadores buscan criterios prácticos centrados en quien lee el código y en el cambio seguro, no en el estilo personal ni en dogmas.",
    tips: ["Céntrate en la legibilidad y el cambio seguro.", "Menciona las convenciones del equipo."],
    commonMistakes: ["Equiparar código limpio con código corto.", "Ser dogmático con un libro o una regla."],
    followUpQuestions: ["¿Cómo se le pone un buen nombre a una función?", "¿Cuándo son necesarios los comentarios?"],
  },
  'sw-036': {
    question: "¿Cómo das y recibes feedback en las revisiones de código?",
    intent: "El entrevistador comprueba tus habilidades de colaboración y si en tus equipos las revisiones mejoran el código sin dañar las relaciones.",
    expectedAnswer:
      "Al revisar, primero intento entender el objetivo del cambio y luego me centro en la corrección, los riesgos, la legibilidad y las pruebas, más que en el estilo personal, que deberían gestionar los linters y formateadores. Formulo los comentarios como preguntas o sugerencias con sus razones, por ejemplo «¿Podría ser null cuando el usuario no ha iniciado sesión?», y marco los detalles menores como opcionales para que el autor sepa qué importa de verdad. También menciono lo que está bien hecho. Cuando recibo revisiones, presupongo buena intención, pido aclaraciones cuando no estoy de acuerdo y explico mi razonamiento. Si una discusión se alarga, propongo una llamada corta en lugar de un largo hilo de comentarios. También procuro que las pull requests sean pequeñas para que las revisiones sean más rápidas y útiles.",
    explanation:
      "Una buena cultura de revisión de código combina rigor técnico y respeto. Separar los comentarios bloqueantes de los opcionales y mantener los cambios pequeños son señales de experiencia.",
    tips: ["Menciona qué revisas primero.", "Muestra cómo formulas los comentarios.", "Habla del tamaño de las pull requests."],
    commonMistakes: ["Centrarse en problemas de estilo que podría detectar una herramienta.", "Escribir comentarios que juzgan a la persona en lugar del código."],
    followUpQuestions: ["¿Qué haces cuando no estás nada de acuerdo con un revisor?", "¿Cuánto debería durar una revisión?"],
  },
  'sw-037': {
    question: "¿Qué es la deuda técnica y cómo la gestionas?",
    intent: "El entrevistador quiere ver si entiendes la deuda como un compromiso y sabes gestionarla con pragmatismo.",
    expectedAnswer:
      "La deuda técnica es el coste futuro que se genera al elegir ahora una solución más rápida o más sencilla, o por código que ya no encaja con el sistema tal como ha evolucionado. Como la deuda financiera, puede ser una decisión razonable si se asume deliberadamente, pero sus «intereses» aparecen en forma de cambios más lentos, más bugs y una incorporación más difícil de nuevas personas. Para gestionarla, la hago visible registrando los elementos de deuda con su impacto, corrijo los problemas pequeños cuando toco el código, siguiendo la idea de «dejarlo mejor de lo que lo encontraste», y priorizo los elementos más grandes según cuánto frenan el trabajo que realmente tenemos planificado. Explico la deuda a los product managers en términos de velocidad de entrega y riesgo, para que pueda planificarse junto a las funcionalidades.",
    explanation:
      "Los entrevistadores valoran a los candidatos que ven la deuda como un compromiso de negocio y la vinculan a costes concretos, en lugar de tratar todo el código antiguo como malo.",
    tips: ["Distingue la deuda deliberada de la accidental.", "Explica cómo la priorizas.", "Muestra cómo la comunicas a personas que no son desarrolladoras."],
    commonMistakes: ["Proponer una gran reescritura como solución.", "Ignorar la deuda hasta que una crisis obliga a actuar."],
    followUpQuestions: ["¿Cómo convences a un product manager de planificar trabajo sobre la deuda?", "¿Cuándo está justificada una reescritura?"],
  },
  'sw-038': {
    question: "¿Cómo abordarías la refactorización de un módulo legacy grande sin pruebas?",
    intent: "El entrevistador evalúa una práctica de ingeniería avanzada y consciente del riesgo sobre código real.",
    expectedAnswer:
      "Empezaría por entender por qué hay que cambiar el módulo y limitaría el alcance a la zona en la que realmente necesitamos trabajar, en lugar de refactorizarlo todo. Después protegería el comportamiento actual con pruebas de caracterización: pruebas que capturan lo que el código hace hoy, incluidos los comportamientos extraños, a menudo a alto nivel, como una API o un escenario end-to-end, usando entradas y salidas reales de los logs de producción cuando sea posible. Para hacer el código testeable, aplicaría refactorizaciones pequeñas y seguras, como extraer métodos o introducir seams para sustituir dependencias, idealmente con las refactorizaciones automáticas del IDE. Luego mejoraría el diseño en pasos pequeños, cada uno publicable y revisado, quizá con el enfoque strangler fig: código nuevo que reemplaza gradualmente las rutas antiguas detrás de la misma interfaz, con feature flags y monitorización para comparar resultados. Durante todo el proceso mantendría informados al equipo y al product owner sobre los riesgos y el avance.",
    explanation:
      "Refactorizar código legacy con seguridad se basa en pruebas de caracterización, pasos pequeños y reversibles y una sustitución incremental. Las respuestas avanzadas destacan la gestión del riesgo y la comunicación, no solo las técnicas de código.",
    tips: ["Menciona las pruebas de caracterización.", "Insiste en pasos pequeños y publicables.", "Explica cómo monitorizarías el comportamiento tras los cambios."],
    commonMistakes: ["Proponer de entrada una reescritura completa.", "Refactorizar y cambiar el comportamiento en el mismo paso."],
    followUpQuestions: ["¿Qué es un seam en código legacy?", "¿Cómo convencerías a tu manager de dedicar tiempo a esto?"],
  },
  'sw-039': {
    question: "¿Cómo eliges buenos nombres para variables, funciones y clases?",
    intent: "El entrevistador comprueba tu atención a la legibilidad, una de las habilidades cotidianas con más impacto.",
    expectedAnswer:
      "Un buen nombre le dice al lector qué representa o qué hace algo sin necesidad de leer su implementación. Nombro las variables según su significado en el dominio, por ejemplo overdueInvoices en lugar de list2, e incluyo las unidades cuando procede, como timeoutSeconds. Las funciones llevan verbos que describen su efecto, como sendReminderEmail, y los nombres booleanos se leen como preguntas, como isExpired. Las clases son sustantivos del dominio de negocio. Evito las abreviaturas que el equipo no comparte y mantengo los nombres coherentes: si el código base dice customer, no introduzco client para el mismo concepto. Si cuesta ponerle nombre a una función, a menudo es porque hace demasiado y debería dividirse.",
    explanation:
      "Poner nombres es una actividad de diseño: la dificultad para nombrar algo suele revelar responsabilidades poco claras. La coherencia con el vocabulario del dominio ayuda a todo el equipo.",
    tips: ["Da ejemplos de buenos y malos nombres.", "Menciona la coherencia con el vocabulario del dominio."],
    commonMistakes: ["Usar nombres genéricos como data, manager o handle por todas partes.", "Codificar tipos en los nombres en lugar del significado."],
    followUpQuestions: ["¿Cómo renombras algo que se usa en todo un código base grande?", "¿Qué es el lenguaje ubicuo?"],
  },
  'sw-040': {
    question: "¿Cuál es la diferencia entre pruebas unitarias, de integración y end-to-end?",
    intent: "El entrevistador comprueba que entiendes la pirámide de pruebas y para qué sirve cada nivel.",
    expectedAnswer:
      "Una prueba unitaria verifica una pieza pequeña de código, como una función o una clase, de forma aislada, normalmente con sus dependencias sustituidas por fakes; es rápida y señala con precisión dónde está el fallo. Una prueba de integración verifica que varias partes funcionan juntas de verdad, por ejemplo un repositorio con una base de datos real o un servicio que llama a otro servicio. Una prueba end-to-end ejecuta un escenario completo de usuario a través de todo el sistema, como registrarse desde la interfaz de usuario. Las pruebas unitarias son numerosas y baratas, las end-to-end son pocas, más lentas y más frágiles, y las de integración quedan en medio. Una buena estrategia combina las tres.",
    explanation:
      "La pirámide de pruebas equilibra velocidad, confianza y coste de mantenimiento. Cada nivel detecta tipos de bugs diferentes.",
    tips: ["Da un ejemplo de cada nivel.", "Menciona los compromisos entre velocidad y fiabilidad."],
    commonMistakes: ["Depender solo de pruebas end-to-end.", "Llamar prueba unitaria a cualquier prueba automatizada."],
    followUpQuestions: ["¿Qué hace que una prueba end-to-end sea inestable (flaky)?", "¿Qué probarías en cada nivel para una funcionalidad de inicio de sesión?"],
  },
  'sw-041': {
    question: "¿Qué es un mock y cuándo deberías usarlo?",
    intent: "El entrevistador comprueba que entiendes los dobles de prueba y sus riesgos.",
    expectedAnswer:
      "Un mock es un doble de prueba que sustituye a una dependencia real y permite comprobar cómo interactúa tu código con ella, por ejemplo verificar que se llamó una vez a un servicio de e-mail con la dirección correcta. Otros dobles relacionados son los stubs, que devuelven respuestas preparadas, y los fakes, que son implementaciones sencillas que funcionan, como un repositorio en memoria. Los mocks son útiles para dependencias lentas, poco fiables o con efectos secundarios, como los proveedores de pago. Abusar de ellos es arriesgado: las pruebas quedan atadas a detalles de implementación y pueden pasar aunque la integración real esté rota.",
    explanation:
      "Los dobles de prueba hacen que las pruebas unitarias sean rápidas y focalizadas. Conocer la diferencia entre mocks, stubs y fakes, y el coste del exceso de mocks, demuestra madurez.",
    tips: ["Distingue entre mocks, stubs y fakes.", "Menciona el riesgo de abusar de los mocks."],
    commonMistakes: ["Hacer un mock de la propia clase bajo prueba.", "Hacer mocks de objetos de valor sencillos."],
    followUpQuestions: ["¿Por qué un fake en memoria podría ser mejor que un mock?", "¿Cómo pruebas código que depende de la hora actual?"],
  },
  'sw-042': {
    question: "¿Qué es el desarrollo guiado por pruebas (TDD) y cuáles son sus ventajas y límites?",
    intent: "El entrevistador quiere ver si entiendes TDD como una práctica de diseño y no solo como una forma de probar.",
    expectedAnswer:
      "El desarrollo guiado por pruebas es un ciclo: escribir una pequeña prueba que falla y describe el siguiente fragmento de comportamiento, escribir el código más simple que la haga pasar y luego refactorizar manteniendo las pruebas en verde. Sus ventajas son un ciclo de feedback rápido, una alta cobertura de pruebas como efecto secundario y un código diseñado para ser testeable, con unidades pequeñas y dependencias explícitas. También ayuda a aclarar los requisitos antes de programar. Sus límites: es más difícil en trabajo exploratorio, interfaces de usuario o requisitos poco claros, puede dar lugar a pruebas demasiado ligadas a la implementación si se aplica de forma mecánica y exige disciplina y práctica. Muchos equipos lo aplican de forma selectiva, para la lógica de negocio y la corrección de bugs.",
    explanation:
      "Una respuesta matizada sobre TDD demuestra que conoces la práctica y sus compromisos, en lugar de repetir dogmas a favor o en contra.",
    tips: ["Describe el ciclo red-green-refactor.", "Da una visión equilibrada de cuándo ayuda."],
    commonMistakes: ["Describir TDD como «escribir las pruebas después del código».", "Presentarlo como siempre o nunca adecuado."],
    followUpQuestions: ["¿Cómo usas TDD para corregir un bug?", "¿Cuál es la diferencia entre TDD y BDD?"],
  },
  'sw-043': {
    question: "¿Cómo decides qué probar y cuánta cobertura es suficiente?",
    intent: "El entrevistador comprueba un enfoque de pruebas basado en el riesgo, en lugar de perseguir métricas.",
    expectedAnswer:
      "Concentro las pruebas donde los fallos serían costosos o probables: reglas de negocio, cálculos con dinero, controles de seguridad, condiciones complejas y código que ya ha tenido bugs. Pruebo casos límite como entradas vacías, valores extremos y datos no válidos, no solo el camino feliz. El porcentaje de cobertura es una señal útil para encontrar zonas sin probar, pero un número alto no demuestra que las aserciones tengan sentido. Prefiero un 70 % de cobertura con pruebas sólidas sobre la lógica crítica que un 95 % con pruebas que solo ejecutan código. Además, cada corrección de bug lleva primero una prueba que lo reproduce.",
    explanation:
      "Los entrevistadores valoran las estrategias de prueba basadas en el riesgo y entender que la cobertura mide la ejecución, no la corrección.",
    tips: ["Explica cómo priorizas según el riesgo.", "Menciona las pruebas de regresión para los bugs."],
    commonMistakes: ["Fijar el 100 % de cobertura como objetivo.", "Probar getters triviales e ignorar la lógica compleja."],
    followUpQuestions: ["¿Qué es el mutation testing?", "¿Cómo pruebas la gestión de errores?"],
  },
  'sw-044': {
    question: "¿Cómo diseñarías una estrategia de pruebas para un sistema formado por varios microservicios?",
    intent: "El entrevistador evalúa un diseño de pruebas avanzado entre fronteras de servicios, equilibrando confianza y velocidad.",
    expectedAnswer:
      "Dentro de cada servicio mantendría una base sólida de pruebas unitarias rápidas para la lógica de dominio y pruebas de integración contra las dependencias reales que el servicio posee, como su base de datos, usando contenedores con herramientas como Testcontainers. Entre servicios, el riesgo principal son los contratos incompatibles, así que usaría pruebas de contrato guiadas por el consumidor, por ejemplo con Pact: cada consumidor publica sus expectativas y el proveedor las verifica en su pipeline, lo que detecta los cambios incompatibles antes del despliegue sin ejecutar todo el sistema. Por encima, mantendría un número reducido de pruebas end-to-end que cubran los recorridos de negocio más críticos, como hacer y pagar un pedido, en un entorno compartido. Como no todo se puede probar antes de producción, añadiría despliegues canary o progresivos, feature flags y una buena monitorización con comprobaciones sintéticas sobre los flujos clave, para detectar los problemas y revertirlos rápidamente. La gestión de los datos de prueba y la reproducibilidad de los entornos también forman parte de la estrategia.",
    explanation:
      "En los sistemas distribuidos, las pruebas end-to-end completas no escalan. Las pruebas de contrato y las redes de seguridad en producción sustituyen buena parte de ellas, una idea clave a nivel avanzado.",
    tips: ["Menciona explícitamente las pruebas de contrato.", "Mantén pocas pruebas end-to-end y solo las críticas.", "Incluye prácticas de pruebas en producción."],
    commonMistakes: ["Depender de una suite end-to-end grande y lenta para cada cambio.", "Hacer mocks de los demás servicios en todas partes sin verificar los contratos reales."],
    followUpQuestions: ["¿Cómo encajan las pruebas de contrato en un pipeline de CI?", "¿Cómo gestionas los datos de prueba entre servicios?"],
  },
  'sw-045': {
    question: "Una suite de pruebas se ha vuelto lenta e inestable. ¿Cómo la arreglarías?",
    intent: "El entrevistador comprueba tu experiencia práctica avanzada con la fiabilidad de las pruebas y la productividad de los desarrolladores.",
    expectedAnswer:
      "Primero mediría: identificaría las pruebas más lentas y las que fallan de forma intermitente usando el historial de CI y los informes de pruebas. Para las pruebas inestables (flaky), buscaría las causas habituales: dependencia de tiempos con esperas fijas, estado compartido entre pruebas, orden de ejecución, llamadas de red reales, la fecha actual o datos aleatorios sin semilla fija. Las soluciones incluyen esperar condiciones explícitas en lugar de dormir el hilo, aislar los datos de cada prueba, controlar el tiempo y la aleatoriedad, y sustituir las llamadas externas por fakes o contenedores locales. Pondría en cuarentena las pruebas que no se puedan arreglar de inmediato, con un responsable y una fecha límite, en lugar de dejar que el equipo ignore las builds en rojo. Para la velocidad, movería las comprobaciones al nivel más bajo adecuado de la pirámide, ejecutaría las pruebas en paralelo, reutilizaría la preparación costosa, como los contenedores, y ejecutaría solo las pruebas afectadas en las pull requests, con la suite completa en la rama principal. Haría seguimiento de la inestabilidad y la duración a lo largo del tiempo para que la mejora perdure.",
    explanation:
      "Las pruebas inestables destruyen la confianza en la CI. Un enfoque sistemático y basado en datos, que corrige las causas raíz y protege la rama principal, demuestra una responsabilidad propia de un perfil sénior.",
    tips: ["Empieza por medir.", "Enumera las causas clásicas de inestabilidad.", "Explica cómo evitarías regresiones en el futuro."],
    commonMistakes: ["Añadir reintentos automáticos por todas partes y ocultar el problema.", "Borrar pruebas sin entender qué cubrían."],
    followUpQuestions: ["¿Cómo pruebas código asíncrono sin usar sleeps?", "¿Qué debería pasar cuando una prueba inestable bloquea una release?"],
  },
  'sw-046': {
    question: "¿Cómo abordas la depuración de un problema que todavía no entiendes?",
    intent: "El entrevistador quiere ver un enfoque metódico en lugar de cambios al azar.",
    expectedAnswer:
      "Empiezo por reproducir el problema de forma fiable y anotar los pasos, las entradas y el entorno exactos. Después leo con atención el mensaje de error y la stack trace, y reviso los logs en torno al momento del fallo. Formulo una hipótesis sobre la causa y la pongo a prueba, por ejemplo añadiendo logs, usando un depurador con breakpoints o simplificando la entrada hasta que el problema desaparece. Si el problema apareció hace poco, comparo con una versión que funciona, a veces usando git bisect para encontrar el cambio que lo introdujo. Una vez corregido, añado una prueba que reproduce el bug para que no vuelva.",
    explanation:
      "Depurar es un proceso científico: reproducir, observar, formular hipótesis y comprobarlas. Los entrevistadores quieren ver que acotas la búsqueda de forma sistemática.",
    tips: ["Menciona primero la reproducción.", "Describe las herramientas: logs, depurador, bisect.", "Termina con una prueba de regresión."],
    commonMistakes: ["Cambiar el código al azar hasta que funcione.", "Ignorar el mensaje de error."],
    followUpQuestions: ["¿Qué haces si no consigues reproducir el bug?", "¿Cómo funciona git bisect?"],
  },
  'sw-047': {
    question: "¿Cómo depurarías un problema que solo ocurre en producción?",
    intent: "El entrevistador comprueba tu experiencia práctica con la observabilidad y la investigación segura en sistemas en vivo.",
    expectedAnswer:
      "Primero evaluaría el impacto y, si hace falta, lo mitigaría, por ejemplo haciendo rollback o desactivando un feature flag, antes de investigar a fondo. Después reuniría evidencias sin molestar a los usuarios: logs filtrados por identificadores de petición o de correlación, métricas que muestren cuándo empezó el problema, trazas que indiquen dónde se va el tiempo y los cambios recientes, como despliegues o actualizaciones de configuración. Compararía producción con los entornos de prueba para encontrar diferencias: volumen de datos, configuración, versiones o patrones de tráfico. Si fuera necesario, añadiría logs específicos o reproduciría el problema con datos de producción anonimizados en un entorno seguro. Tras la corrección, redactaría una breve revisión del incidente y mejoraría la monitorización para detectar el problema antes la próxima vez.",
    explanation:
      "Depurar en producción se basa en la observabilidad y en encontrar lo que difiere de los demás entornos. Primero mitigar, luego investigar y por último prevenir es el orden profesional.",
    tips: ["Menciona la mitigación antes que la investigación.", "Explica cómo usas logs, métricas y trazas.", "Habla de las diferencias entre entornos."],
    commonMistakes: ["Depurar directamente en los servidores de producción sin precaución.", "Ignorar los despliegues recientes como causa probable."],
    followUpQuestions: ["¿Qué es un correlation ID?", "¿Cómo depuras cuando hay datos sensibles en producción?"],
  },
  'sw-048': {
    question: "¿Cómo encuentras y corriges una fuga de memoria?",
    intent: "El entrevistador comprueba tu experiencia con problemas de recursos y herramientas de profiling.",
    expectedAnswer:
      "La primera señal suele ser una memoria que crece de forma constante con el tiempo y nunca se libera, que a veces termina en errores de falta de memoria (out of memory) o en pausas largas del recolector de basura. La confirmaría con la monitorización y luego tomaría snapshots del heap en distintos momentos para compararlos y ver qué objetos no paran de crecer, con herramientas como un analizador de heap dumps para la JVM o la pestaña de memoria de las herramientas de desarrollo del navegador. Después seguiría las referencias que retienen esos objetos. Las causas habituales son cachés sin límite de tamaño, listeners o suscripciones que nunca se eliminan, colecciones estáticas, recursos sin cerrar y closures que capturan objetos grandes. Tras corregirla, ejecutaría una prueba de carga para comprobar que la memoria se estabiliza.",
    explanation:
      "En los lenguajes gestionados, las fugas provienen de referencias que se conservan sin querer. Comparar snapshots y seguir las rutas de retención es el método estándar.",
    tips: ["Explica cómo confirmas la fuga con datos.", "Enumera las causas típicas.", "Verifica la corrección bajo carga."],
    commonMistakes: ["Limitarse a aumentar los límites de memoria.", "Suponer que el recolector de basura hace imposibles las fugas."],
    followUpQuestions: ["¿Qué es una ruta de retención (retaining path)?", "¿Cómo limitarías una caché de forma segura?"],
  },
  'sw-049': {
    question: "¿Cómo investigarías un bug que aparece de forma aleatoria, como una posible condición de carrera?",
    intent: "El entrevistador evalúa tu capacidad avanzada para depurar problemas de concurrencia y de tiempos, que son muy difíciles de reproducir.",
    expectedAnswer:
      "Primero recopilaría todo el contexto posible de cada aparición: marcas de tiempo, identificadores de hilo o de petición, entradas y qué más se ejecutaba al mismo tiempo, para buscar patrones como una carga alta o peticiones simultáneas sobre los mismos datos. Una condición de carrera suele manifestarse como actualizaciones perdidas, duplicados o estados incoherentes. Para reproducirla, aumentaría la probabilidad: ejecutaría el escenario muchas veces en paralelo, añadiría retardos artificiales en los puntos sospechosos o usaría herramientas de pruebas de estrés. La revisión de código es esencial: buscaría estado mutable compartido, secuencias check-then-act sin bloqueos, operaciones de lectura-modificación-escritura no atómicas y suposiciones sobre el orden. Las soluciones dependen del caso: hacer las operaciones atómicas, usar restricciones de base de datos o bloqueo optimista con una columna de versión, una sincronización adecuada o rediseñar para evitar el estado compartido, por ejemplo con datos inmutables o un único escritor. Escribiría una prueba concurrente que fallara antes de la corrección y pasara de forma consistente después, y seguiría monitorizando, porque estos bugs pueden quedar ocultos.",
    explanation:
      "Los bugs de concurrencia requieren una reproducción probabilística, un razonamiento cuidadoso sobre el código y soluciones que aborden la atomicidad, no solo los tiempos. Las respuestas avanzadas combinan las tres cosas.",
    tips: ["Explica cómo haces que el bug aparezca con más probabilidad.", "Nombra los patrones de concurrencia típicos que causan bugs.", "Propón soluciones tanto a nivel de base de datos como de código."],
    commonMistakes: ["Añadir sleeps o reintentos para ocultar el síntoma.", "Sincronizarlo todo y provocar deadlocks o cuellos de botella."],
    followUpQuestions: ["¿Cuál es la diferencia entre bloqueo optimista y pesimista?", "¿Cómo detectarías un deadlock?"],
  },
  'sw-050': {
    question: "Explícame cómo diriges la respuesta a un incidente grave en producción.",
    intent: "El entrevistador quiere ver responsabilidad de nivel sénior: coordinación, comunicación, mitigación y aprendizaje bajo presión.",
    expectedAnswer:
      "Primero me aseguro de que el incidente esté declarado y de que los roles estén claros: una persona coordina, otras investigan y alguien se encarga de la comunicación con soporte y con los stakeholders para que los ingenieros puedan concentrarse. Evalúo el impacto, qué usuarios, qué funcionalidades y desde cuándo, y asigno un nivel de severidad. La prioridad es restablecer el servicio, no encontrar la corrección perfecta: reviso los cambios recientes y aplico la mitigación segura más rápida, como un rollback, un feature flag, escalar o un failover. Mantenemos una cronología compartida de observaciones y acciones, lo que evita trabajo duplicado y ayuda en la revisión. Los stakeholders reciben actualizaciones breves y periódicas con lo que sabemos, lo que estamos haciendo y la hora de la siguiente actualización. Cuando el servicio está estable, lo confirmamos con métricas y luego corregimos la causa raíz como es debido. Después organizo una revisión post-incidente sin culpables (blameless) que identifica los factores que contribuyeron, como alertas ausentes o prácticas de despliegue arriesgadas, y produce unas pocas acciones concretas con responsables y plazos, a las que luego damos seguimiento hasta completarlas.",
    explanation:
      "Liderar un incidente combina criterio técnico con coordinación y comunicación. Mitigar antes de buscar la causa raíz, tener roles claros y aprender sin buscar culpables son las prácticas centrales de los equipos maduros.",
    tips: ["Separa los roles: coordinación, investigación y comunicación.", "Prioriza la mitigación sobre una corrección perfecta.", "Describe la revisión sin culpables y las acciones de seguimiento."],
    commonMistakes: ["Dejar que todos investiguen sin coordinación.", "Terminar la historia cuando el servicio vuelve, sin aprender nada."],
    followUpQuestions: ["¿Cómo decides entre hacer rollback y corregir hacia delante (fix forward)?", "¿Qué hace que una revisión post-incidente sea blameless?"],
  },
};
