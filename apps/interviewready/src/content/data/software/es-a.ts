import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de software 001-025: fundamentos, POO, estructuras de datos, algoritmos (parte). */
export const esA: TextTable<QuestionText> = {
  'sw-001': {
    question: "¿Cuál es la diferencia entre un lenguaje compilado y uno interpretado?",
    intent: "El entrevistador comprueba que entiendes cómo el código fuente se convierte en algo que una máquina ejecuta y que evitas etiquetas demasiado simplistas.",
    expectedAnswer:
      "Un lenguaje compilado se traduce de antemano a código máquina u otra forma de bajo nivel antes de ejecutarse, como ocurre con C o Go. Un lenguaje interpretado lo ejecuta un programa que lee y ejecuta el código fuente de forma más o menos directa, como los scripts de shell clásicos. En la práctica, la mayoría de los lenguajes modernos combinan ambos enfoques: Java y C# se compilan a bytecode que luego una máquina virtual interpreta y compila just in time, y los motores de JavaScript compilan el código más usado en tiempo de ejecución. Por eso, «compilado» e «interpretado» describen implementaciones más que lenguajes en sí.",
    explanation:
      "La compilación anticipada (AOT) detecta muchos errores pronto y suele ofrecer un arranque y una ejecución más rápidos, mientras que la interpretación aporta flexibilidad e iteración rápida. La compilación just-in-time (JIT) combina ambas optimizando el código que se ejecuta con más frecuencia.",
    example: "Java: javac Main.java → Main.class (bytecode) → la JVM lo interpreta y compila con JIT los métodos más usados a código nativo.",
    tips: ["Menciona que la distinción se refiere a implementaciones, no a lenguajes.", "Da un ejemplo mixto, como Java o JavaScript."],
    commonMistakes: ["Decir que los lenguajes interpretados siempre son lentos.", "Clasificar Java como puramente interpretado o puramente compilado."],
    followUpQuestions: ["¿Qué hace un compilador JIT?", "¿Por qué puede importar el tiempo de arranque en las funciones serverless?"],
  },
  'sw-002': {
    question: "¿Cuál es la diferencia entre un tipo por valor y un tipo por referencia?",
    intent: "El entrevistador quiere saber si entiendes cómo se copian y comparten los datos, algo que explica muchos errores cotidianos.",
    expectedAnswer:
      "Cuando asignas un tipo por valor, se copia el propio valor, así que modificar la copia no afecta al original. Con un tipo por referencia, la variable contiene una referencia a un objeto; al asignarla se copia la referencia, de modo que ambas variables apuntan al mismo objeto y un cambio hecho a través de una es visible desde la otra. En Java, los primitivos como int son valores y a los objetos se accede por referencia; en JavaScript, los números y los strings se comportan como valores, mientras que los objetos y los arrays se comparten por referencia.",
    explanation:
      "Esta distinción explica por qué modificar un array pasado a una función también lo cambia para quien la llama, y por qué comparar dos objetos con == puede comparar identidades en lugar de contenidos.",
    example: "const a = [1, 2]; const b = a; b.push(3); // a ahora es [1, 2, 3] porque a y b comparten el mismo array",
    tips: ["Usa un pequeño ejemplo de código para ilustrar el uso compartido.", "Menciona la igualdad: comparación de identidad frente a comparación de contenido."],
    commonMistakes: ["Decir que Java pasa los objetos por referencia; Java siempre pasa por valor, y en el caso de los objetos ese valor es una referencia."],
    followUpQuestions: ["¿Cómo copiarías un objeto sin compartir los datos anidados?", "¿Qué cambia aquí la inmutabilidad?"],
  },
  'sw-003': {
    question: "¿Cuál es la diferencia entre la pila (stack) y el montón (heap)?",
    intent: "El entrevistador comprueba tu modelo mental de la memoria: dónde viven los datos locales, cuánto tiempo viven y por qué importa.",
    expectedAnswer:
      "La pila almacena los marcos de las llamadas a funciones: variables locales, parámetros y direcciones de retorno. Crece y se reduce automáticamente a medida que las funciones se llaman y retornan, lo que hace que la asignación sea muy rápida, pero su tamaño es limitado y los datos desaparecen cuando la función termina. El montón almacena datos cuya vida útil no está ligada a una sola llamada, como los objetos creados con new. Es más grande y flexible, pero la asignación es más lenta y la memoria debe liberarse, ya sea manualmente como en C o mediante un recolector de basura como en Java o JavaScript.",
    explanation:
      "Entender estas dos regiones ayuda a explicar los errores de desbordamiento de pila (stack overflow) en recursiones profundas, las fugas de memoria en el montón y por qué devolver un puntero a una variable local es peligroso en lenguajes como C.",
    tips: ["Relaciona la pila con las llamadas a funciones y el montón con la vida útil de los objetos.", "Menciona un error típico de cada uno, como el stack overflow y las fugas de memoria."],
    commonMistakes: ["Decir que todos los objetos en Java están en la pila.", "Olvidar que cada hilo tiene su propia pila."],
    followUpQuestions: ["¿Qué provoca un stack overflow?", "¿Cómo decide el recolector de basura qué liberar?"],
  },
  'sw-004': {
    question: "Explica la diferencia entre la programación síncrona y la asíncrona.",
    intent: "El entrevistador quiere ver si entiendes el bloqueo, la concurrencia y cómo los programas siguen respondiendo mientras esperan operaciones de entrada o salida.",
    expectedAnswer:
      "En el código síncrono, cada operación espera a que termine la anterior. Si un paso espera una llamada de red o la lectura de un archivo, todo el hilo queda bloqueado durante ese tiempo. En el código asíncrono, se inicia una operación larga y el programa continúa; el resultado se gestiona más tarde mediante un callback, una promesa o un future, a menudo con la sintaxis async/await. Esto permite que un solo hilo atienda muchas peticiones mientras espera la entrada y salida, como en Node.js, o que una interfaz de usuario siga respondiendo. Asíncrono no significa automáticamente paralelo: el trabajo puede intercalarse en un solo hilo. Los inconvenientes son un manejo de errores más complejo, problemas de orden y una depuración más difícil.",
    explanation:
      "La mayoría de las aplicaciones pasan gran parte del tiempo esperando operaciones de E/S. Los modelos asíncronos aprovechan ese tiempo de espera para hacer otro trabajo, lo que mejora el rendimiento y la capacidad de respuesta, pero exigen gestionar con cuidado los errores y el estado compartido.",
    example: "async function load() { const res = await fetch(url); return res.json(); } // el hilo queda libre mientras la petición está pendiente",
    tips: ["Distingue lo asíncrono de lo paralelo.", "Menciona un runtime concreto, como Node.js o el hilo de UI de una app móvil."],
    commonMistakes: ["Pensar que el código asíncrono es más rápido por sí mismo.", "Olvidar gestionar las promesas rechazadas o las excepciones."],
    followUpQuestions: ["¿Qué es el event loop?", "¿Cómo ejecutas varias operaciones asíncronas a la vez y esperas a que terminen todas?"],
  },
  'sw-005': {
    question: "¿Cuál es la diferencia entre un proceso y un hilo?",
    intent: "El entrevistador comprueba que entiendes cómo los sistemas operativos ejecutan los programas y los compromisos de cada modelo de concurrencia.",
    expectedAnswer:
      "Un proceso es un programa en ejecución con su propio espacio de memoria aislado y sus propios recursos, como los descriptores de archivo. Un hilo es una unidad de ejecución dentro de un proceso; los hilos de un mismo proceso comparten su memoria, pero cada uno tiene su propia pila y sus registros. Crear hilos y cambiar entre ellos es más barato que con procesos, y compartir memoria facilita la comunicación, pero también genera riesgos como las condiciones de carrera, que requieren sincronización. Los procesos están mejor aislados: un fallo en uno normalmente no afecta a los demás, y por eso los navegadores ejecutan las pestañas en procesos separados.",
    explanation:
      "Elegir entre procesos e hilos equilibra el aislamiento y la seguridad frente al rendimiento y la facilidad de comunicación. Muchos sistemas combinan ambos, por ejemplo varios procesos worker, cada uno con un pool de hilos.",
    tips: ["Menciona la memoria compartida como la ventaja y a la vez el riesgo de los hilos.", "Da un ejemplo real, como las pestañas del navegador o los workers de un servidor web."],
    commonMistakes: ["Decir que los hilos tienen memoria separada.", "Ignorar el coste de la sincronización."],
    followUpQuestions: ["¿Qué es una condición de carrera?", "¿Qué son los hilos ligeros o las corrutinas?"],
  },
  'sw-006': {
    question: "¿Qué significa la inmutabilidad y por qué es útil?",
    intent: "El entrevistador quiere ver si entiendes cómo los datos inmutables reducen los errores y simplifican la concurrencia y la gestión del estado.",
    expectedAnswer:
      "Un objeto inmutable no puede cambiar después de crearse; para «modificarlo», creas un nuevo objeto con los nuevos valores. Esto hace que el código sea más fácil de razonar, porque un valor que recibes no puede cambiar a tus espaldas. También permite compartir datos entre hilos de forma segura sin locks, facilita una detección de cambios barata comparando referencias, como hace React con el estado, y evita las copias defensivas. Algunos ejemplos son String y los records de Java, o los objetos congelados y las copias con spread en JavaScript. El coste son asignaciones adicionales, que las estructuras de datos persistentes reducen compartiendo las partes que no cambian.",
    explanation:
      "Muchos errores provienen del estado mutable compartido. La inmutabilidad elimina toda una clase de problemas y es uno de los pilares de la programación funcional y de los frameworks de UI modernos.",
    example: "const next = { ...user, name: 'Ana' }; // user no cambia; next es un objeto nuevo",
    tips: ["Da un beneficio relacionado con la concurrencia y otro con la gestión del estado.", "Reconoce el coste en rendimiento y cómo se mitiga."],
    commonMistakes: ["Confundir una referencia constante (const, final) con un objeto inmutable.", "Pensar que la inmutabilidad siempre perjudica el rendimiento."],
    followUpQuestions: ["¿Es inmutable una List declarada como final en Java?", "¿Cómo funcionan las estructuras de datos persistentes?"],
  },
  'sw-007': {
    question: "¿Cómo funcionan los recolectores de basura y qué problemas pueden causar en producción?",
    intent: "El entrevistador evalúa un conocimiento más profundo del runtime y si eres capaz de diagnosticar problemas de memoria y de latencia.",
    expectedAnswer:
      "Un recolector de basura de rastreo (tracing) parte de las raíces, como las variables de la pila y los campos estáticos, y marca todos los objetos alcanzables desde ellas; los objetos inalcanzables se liberan. La mayoría de los recolectores son generacionales: suponen que la mayoría de los objetos mueren jóvenes, así que recolectan con frecuencia una generación joven pequeña y rara vez la generación vieja. Los recolectores modernos, como G1, ZGC o Shenandoah en la JVM, hacen la mayor parte del trabajo de forma concurrente para mantener las pausas cortas. Los problemas en producción incluyen pausas que aumentan la latencia, un uso elevado de CPU en la recolección cuando se asigna memoria en exceso y fugas de memoria cuando hay objetos que siguen siendo alcanzables por error, por ejemplo a través de cachés estáticas o listeners que nunca se eliminan. El diagnóstico se hace con los logs del GC, heap dumps y profiling de asignaciones, y las soluciones van desde reducir las asignaciones hasta ajustar el tamaño del heap o elegir un recolector de pausas bajas.",
    explanation:
      "El GC elimina la gestión manual de la memoria, pero no los problemas de memoria. Los candidatos avanzados saben que las fugas en los lenguajes gestionados se deben a referencias no intencionadas y que el comportamiento del GC afecta directamente a la latencia y al rendimiento.",
    tips: ["Explica la alcanzabilidad desde las raíces.", "Menciona la hipótesis generacional.", "Describe cómo investigarías una fuga o pausas largas."],
    commonMistakes: ["Decir que las fugas de memoria son imposibles con un recolector de basura.", "Recomendar System.gc() como solución."],
    followUpQuestions: ["¿Cómo analizarías un heap dump?", "¿Cuándo elegirías un recolector de pausas bajas?"],
  },
  'sw-008': {
    question: "¿Cuáles son los cuatro principios fundamentales de la programación orientada a objetos?",
    intent: "El entrevistador comprueba tus bases de POO y si sabes explicar cada principio con un ejemplo concreto.",
    expectedAnswer:
      "El encapsulamiento oculta el estado interno detrás de métodos, de modo que un objeto protege su propia coherencia. La abstracción expone solo lo necesario, por ejemplo una interfaz PaymentService sin los detalles de su implementación. La herencia permite que una clase reutilice y extienda otra, como SavingsAccount extendiendo Account. El polimorfismo permite que el código trabaje con un tipo general mientras cada tipo concreto aporta su propio comportamiento, por ejemplo al llamar a shape.area() sobre círculos y rectángulos.",
    explanation:
      "Estos principios buscan gestionar la complejidad: limitar lo que cada parte del código necesita saber, reutilizar comportamiento y permitir nuevos tipos sin modificar el código existente.",
    tips: ["Da un ejemplo breve por cada principio.", "Demuestra que sabes que la herencia no es la única forma de reutilizar código."],
    commonMistakes: ["Recitar definiciones sin ningún ejemplo.", "Confundir abstracción y encapsulamiento."],
    followUpQuestions: ["¿Cuál es la diferencia entre abstracción y encapsulamiento?", "¿Cuándo evitarías la herencia?"],
  },
  'sw-009': {
    question: "¿Cuál es la diferencia entre una clase abstracta y una interfaz?",
    intent: "El entrevistador quiere ver si sabes cuándo usar cada construcción y cómo las tratan los lenguajes.",
    expectedAnswer:
      "Una interfaz define un contrato: un conjunto de métodos que una clase se compromete a proporcionar. Una clase puede implementar varias interfaces. Una clase abstracta es una implementación parcial: puede tener campos, constructores y métodos implementados, pero no puede instanciarse, y en lenguajes como Java o C# una clase solo puede extender una. Usa una interfaz para describir una capacidad compartida por clases no relacionadas, como Comparable, y una clase abstracta cuando clases estrechamente relacionadas comparten estado y código. Desde Java 8, las interfaces también pueden tener métodos default, lo que reduce la diferencia, pero siguen sin poder contener estado de instancia.",
    explanation:
      "Elegir entre ambas es una cuestión de modelado: las relaciones del tipo «puede hacer» encajan con las interfaces, y las del tipo «es un tipo de, con implementación compartida» encajan con las clases abstractas.",
    tips: ["Menciona la implementación múltiple frente a la herencia simple.", "Da un ejemplo de cada una."],
    commonMistakes: ["Decir que en Java moderno las interfaces no pueden tener ningún cuerpo de método.", "Usar clases abstractas solo para compartir un único método auxiliar."],
    followUpQuestions: ["¿Para qué sirven los métodos default?", "¿Por qué muchos desarrolladores prefieren interfaces para las dependencias?"],
  },
  'sw-010': {
    question: "¿Qué es el polimorfismo y cómo funciona el despacho dinámico?",
    intent: "El entrevistador comprueba que entiendes el comportamiento en tiempo de ejecución del código orientado a objetos, no solo el vocabulario.",
    expectedAnswer:
      "El polimorfismo significa que el código escrito para un tipo general puede funcionar con muchos tipos concretos. Con el polimorfismo de subtipos, cuando llamas a un método a través de una referencia del tipo padre, el runtime selecciona la implementación de la clase real del objeto: esto es el despacho dinámico (dynamic dispatch). En Java, los métodos que no son static, final ni private se despachan así, normalmente mediante una tabla de métodos virtuales por clase. La sobrecarga es distinta: se resuelve en tiempo de compilación según los tipos declarados de los parámetros. El polimorfismo permite añadir nuevos tipos sin cambiar el código que los usa, lo que respalda el principio abierto/cerrado.",
    explanation:
      "Saber que la sobrescritura se resuelve en tiempo de ejecución y la sobrecarga en tiempo de compilación explica comportamientos sorprendentes y ayuda a diseñar código extensible.",
    example: "Notifier n = new SmsNotifier(); n.send(msg); // se ejecuta SmsNotifier.send aunque n esté declarado como Notifier",
    tips: ["Distingue la sobrescritura (en tiempo de ejecución) de la sobrecarga (en tiempo de compilación).", "Explica por qué el polimorfismo facilita la extensión."],
    commonMistakes: ["Pensar que los métodos estáticos se sobrescriben de forma polimórfica.", "Confundir sobrecarga y sobrescritura."],
    followUpQuestions: ["¿Qué otros tipos de polimorfismo existen, como los genéricos?", "¿Cómo sustituirías un switch largo sobre el tipo por polimorfismo?"],
  },
  'sw-011': {
    question: "¿Por qué muchos desarrolladores prefieren la composición a la herencia?",
    intent: "El entrevistador quiere ver madurez en el diseño: entender los costes de la herencia y la flexibilidad de la composición.",
    expectedAnswer:
      "La herencia crea un acoplamiento fuerte: una subclase depende de los detalles de implementación del padre, así que un cambio en el padre puede romper las subclases, y las jerarquías profundas se vuelven difíciles de entender. Además, queda fijada en tiempo de compilación. La composición construye el comportamiento combinando objetos: una clase tiene referencias a sus colaboradores y les delega el trabajo. Esto mantiene las clases pequeñas, permite cambiar el comportamiento en tiempo de ejecución o en los tests y evita forzar una relación «es un» donde realmente no existe. La herencia sigue siendo útil para verdaderas relaciones de subtipo con clases base estables, pero la composición suele ser la opción por defecto más segura.",
    explanation:
      "El problema de la clase base frágil y las jerarquías rígidas son fuentes habituales de problemas de diseño. La composición con interfaces ofrece la reutilización de la herencia con un acoplamiento más débil.",
    example: "En lugar de class LoggingRepository extends Repository, escribe class LoggingRepository implements Repository { private final Repository inner; ... } y delega las llamadas.",
    tips: ["Menciona por su nombre el problema de la clase base frágil.", "Muestra un ejemplo de delegación."],
    commonMistakes: ["Afirmar que nunca se debe usar la herencia.", "Construir jerarquías profundas para compartir pequeños fragmentos de código."],
    followUpQuestions: ["¿Qué patrones de diseño se basan en la composición?", "¿Cuándo es la herencia la elección correcta?"],
  },
  'sw-012': {
    question: "Explica los principios SOLID.",
    intent: "El entrevistador comprueba que conoces las pautas de diseño habituales y sabes relacionarlas con decisiones reales sobre el código.",
    expectedAnswer:
      "Responsabilidad única: una clase debe tener un solo motivo para cambiar. Abierto/cerrado: el código debe estar abierto a la extensión pero cerrado a la modificación, por ejemplo añadiendo una nueva implementación en lugar de editar un switch. Sustitución de Liskov: un subtipo debe poder usarse en cualquier lugar donde se espere su padre sin romper el comportamiento. Segregación de interfaces: es preferible tener varias interfaces pequeñas y específicas que una interfaz grande que obligue a las clases a implementar métodos que no necesitan. Inversión de dependencias: el código de alto nivel debe depender de abstracciones, no de detalles concretos de bajo nivel, que es lo que facilita la inyección de dependencias. Son pautas para reducir el acoplamiento, no reglas que aplicar mecánicamente.",
    explanation:
      "Los entrevistadores valoran los ejemplos concretos y los matices: SOLID ayuda a que el código siga siendo fácil de cambiar, pero aplicarlo en exceso puede crear abstracciones innecesarias.",
    tips: ["Da un ejemplo por principio si el tiempo lo permite.", "Demuestra que equilibras SOLID con la simplicidad."],
    commonMistakes: ["Recitar el acrónimo sin entenderlo.", "Confundir la inversión de dependencias con la inyección de dependencias."],
    followUpQuestions: ["Pon un ejemplo de violación del principio de Liskov.", "¿Cuándo aplicar SOLID se convierte en sobreingeniería?"],
  },
  'sw-013': {
    question: "Pon un ejemplo de violación del principio de sustitución de Liskov y explica cómo la corregirías.",
    intent: "El entrevistador evalúa un pensamiento de diseño avanzado: reconocer cuándo una relación de herencia es semánticamente incorrecta.",
    expectedAnswer:
      "Una violación clásica es que Square extienda Rectangle. Rectangle permite fijar el ancho y el alto de forma independiente; un Square debe mantenerlos iguales, así que su setWidth también cambia el alto. El código que trabaja con un Rectangle, por ejemplo fijando el ancho en 5 y el alto en 4 y esperando un área de 20, falla cuando recibe un Square. El subtipo ha debilitado una garantía que ofrecía el padre. Otro caso frecuente es una ReadOnlyList que lanza una excepción en add mientras hereda de una List mutable. Las soluciones incluyen no usar herencia para estos tipos, modelar las figuras como valores inmutables con una interfaz común Shape que solo exponga el área, o dividir las interfaces en capacidades de lectura y de escritura para que cada tipo solo prometa lo que puede cumplir.",
    explanation:
      "Liskov trata de contratos de comportamiento, no solo de firmas de métodos. Un subtipo debe aceptar al menos lo que acepta el padre y garantizar al menos lo que garantiza el padre.",
    tips: ["Explica la expectativa rota desde el punto de vista del código que llama.", "Propón una solución de diseño, no solo el diagnóstico."],
    commonMistakes: ["Pensar que si compila, el subtipo es sustituible.", "Resolver el problema con comprobaciones instanceof en el código que llama."],
    followUpQuestions: ["¿Qué relación tienen las precondiciones y las postcondiciones con Liskov?", "¿Es la lista no modificable de Java una violación?"],
  },
  'sw-014': {
    question: "¿Cómo diseñarías un modelo de dominio en el que sea imposible representar estados inválidos?",
    intent: "El entrevistador quiere ver habilidades avanzadas de modelado: usar los tipos y el encapsulamiento para hacer cumplir las reglas de negocio.",
    expectedAnswer:
      "Llevaría la validación a los propios tipos. En lugar de pasar strings y números sin más, crearía pequeños value objects como EmailAddress o Money que se validan al crearse y son inmutables, de modo que nunca pueda existir una instancia inválida. Las entidades expondrían métodos de comportamiento, como order.ship(), en lugar de setters públicos, y esos métodos comprobarían las transiciones: un pedido no puede enviarse antes de pagarse. Para estados con datos distintos, usaría un conjunto cerrado de tipos, por ejemplo sealed interfaces o uniones etiquetadas en las que un PaidOrder lleva una referencia de pago y un DraftOrder no. Las factorías o los constructores harían obligatorios los campos requeridos. El resultado es que la mayoría de las reglas se comprueban una sola vez, en la frontera, y el resto del código puede confiar en los objetos que recibe.",
    explanation:
      "Hacer que los estados ilegales no sean representables reduce las comprobaciones defensivas repartidas por el código y convierte muchos errores en tiempo de ejecución en errores de compilación. Combina encapsulamiento, inmutabilidad y tipos expresivos.",
    example: "sealed interface Order permits Draft, Paid, Shipped {} // Shipped tiene un trackingNumber; Draft no puede enviarse porque no tiene método ship().",
    tips: ["Menciona los value objects y las transiciones de estado controladas.", "Muestra cómo ayuda el sistema de tipos.", "Explica dónde se realiza la validación."],
    commonMistakes: ["Depender de setters públicos y de comprobaciones if dispersas.", "Crear tantos tipos que los cambios sencillos se vuelvan costosos."],
    followUpQuestions: ["¿Cómo gestionas los errores de validación de la entrada del usuario?", "¿Cómo encaja este enfoque con los ORM?"],
  },
  'sw-015': {
    question: "¿Cuál es la diferencia entre un array y una lista enlazada?",
    intent: "El entrevistador comprueba que entiendes la disposición en memoria y el coste de las operaciones habituales.",
    expectedAnswer:
      "Un array almacena los elementos de forma contigua en memoria, así que acceder a un elemento por índice lleva tiempo constante, O(1), y recorrerlo aprovecha bien la caché. Insertar o eliminar en medio es O(n) porque hay que desplazar elementos. Una lista enlazada almacena nodos que apuntan al siguiente nodo, así que insertar o eliminar en un nodo conocido es O(1), pero encontrar un elemento por índice es O(n) y los nodos están dispersos en memoria, lo que perjudica el rendimiento de la caché. En la práctica, los arrays dinámicos como ArrayList o los arrays de JavaScript son la opción por defecto adecuada para la mayoría de los usos.",
    explanation:
      "La notación Big O por sí sola no lo cuenta todo: la localidad de memoria suele hacer que los arrays sean más rápidos incluso en operaciones en las que las listas enlazadas parecen mejores sobre el papel.",
    tips: ["Compara el acceso, la inserción y el uso de memoria.", "Menciona que los arrays dinámicos son la opción por defecto habitual."],
    commonMistakes: ["Decir que las listas enlazadas siempre son más rápidas para insertar sin tener en cuenta la búsqueda necesaria para encontrar la posición."],
    followUpQuestions: ["¿Cómo crece un array dinámico?", "¿Cuándo usarías realmente una lista enlazada?"],
  },
  'sw-016': {
    question: "¿Qué es una tabla hash y cómo funciona?",
    intent: "El entrevistador quiere ver si entiendes una de las estructuras de datos más usadas y sus características de rendimiento.",
    expectedAnswer:
      "Una tabla hash almacena pares clave-valor. Una función hash convierte la clave en un número que determina un bucket dentro de un array interno. Para buscar una clave, la tabla calcula su hash y va directamente al bucket, así que la búsqueda, la inserción y el borrado son O(1) en promedio. Dos claves pueden caer en el mismo bucket, lo que se llama colisión, y se resuelve encadenando las entradas en una lista o buscando otra posición mediante sondeo (probing). Cuando la tabla se llena demasiado, se redimensiona y redistribuye las entradas. El rendimiento se degrada si muchas claves colisionan, por lo que una buena función hash y una igualdad correcta son esenciales.",
    explanation:
      "Las tablas hash son la base de mapas, conjuntos, cachés e índices. Entender las colisiones y el redimensionamiento explica su comportamiento en el caso promedio y en el peor caso.",
    tips: ["Explica el hashing, los buckets y las colisiones.", "Menciona el redimensionamiento y el factor de carga."],
    commonMistakes: ["Decir que las búsquedas siempre son O(1), sin excepciones.", "Olvidar que las claves deben tener un hash y una igualdad coherentes."],
    followUpQuestions: ["¿Qué ocurre si modificas una clave después de insertarla?", "¿Por qué los objetos iguales deben tener el mismo hash code?"],
  },
  'sw-017': {
    question: "¿Cuándo usarías una pila, una cola o una cola de prioridad?",
    intent: "El entrevistador comprueba que sabes elegir la estructura adecuada para un problema y explicar por qué.",
    expectedAnswer:
      "Una pila es LIFO (el último en entrar es el primero en salir): útil para el historial de deshacer, el análisis de expresiones anidadas, el recorrido en profundidad y el seguimiento de las llamadas a funciones. Una cola es FIFO (el primero en entrar es el primero en salir): útil para procesar tareas en orden de llegada, la búsqueda en anchura y el buffering de mensajes entre un productor y un consumidor. Una cola de prioridad siempre devuelve el elemento con mayor prioridad y suele implementarse con un montículo binario (binary heap) que ofrece inserción y extracción en O(log n): útil para planificar trabajos por urgencia, el algoritmo de camino más corto de Dijkstra o mantener los k elementos mayores de un flujo de datos.",
    explanation:
      "Elegir una estructura según el orden en que deben procesarse los elementos es una habilidad básica pero muy frecuente en las entrevistas.",
    tips: ["Da al menos un caso de uso real para cada una.", "Menciona el heap como la implementación habitual de la cola de prioridad."],
    commonMistakes: ["Implementar una cola de prioridad con una lista ordenada sin hablar de su coste."],
    followUpQuestions: ["¿Cómo implementarías una cola usando dos pilas?", "¿Cómo encuentras los k elementos mayores de un flujo de datos?"],
  },
  'sw-018': {
    question: "¿Qué es un árbol binario de búsqueda y por qué puede volverse lento?",
    intent: "El entrevistador quiere ver si entiendes las estructuras de árbol y la importancia del equilibrio.",
    expectedAnswer:
      "Un árbol binario de búsqueda es un árbol en el que cada nodo tiene como máximo dos hijos, con todos los valores del subárbol izquierdo menores que el nodo y todos los del subárbol derecho mayores. Este orden permite buscar, insertar y eliminar en O(log n) cuando el árbol está equilibrado, porque cada paso reduce a la mitad los nodos restantes. Pero si los valores se insertan en orden, el árbol degenera en una cadena y las operaciones pasan a ser O(n). Los árboles autoequilibrados, como los árboles rojo-negro o los AVL, lo resuelven rotando nodos para mantener una altura logarítmica; TreeMap de Java usa un árbol rojo-negro.",
    explanation:
      "La idea clave es que el rendimiento depende de la altura. El equilibrado garantiza una altura logarítmica y, por tanto, un rendimiento predecible.",
    tips: ["Explica la propiedad de orden.", "Menciona el peor caso de la inserción ordenada y los árboles equilibrados."],
    commonMistakes: ["Decir que las operaciones de un BST siempre son O(log n)."],
    followUpQuestions: ["¿Cómo recorres un BST en orden?", "¿Cuándo usarías un tree map en lugar de un hash map?"],
  },
  'sw-019': {
    question: "¿Qué es un grafo y cómo lo representarías en código?",
    intent: "El entrevistador comprueba que sabes modelar relaciones y elegir una representación en función de las operaciones necesarias.",
    expectedAnswer:
      "Un grafo es un conjunto de nodos conectados por aristas, que pueden ser dirigidas o no dirigidas y tener peso o no. Modela redes, dependencias, rutas o relaciones sociales. Las dos representaciones principales son la lista de adyacencia, en la que cada nodo guarda una lista de sus vecinos, y la matriz de adyacencia, un array bidimensional en el que la celda [i][j] indica si hay una arista. Las listas de adyacencia usan memoria proporcional a los nodos más las aristas y son adecuadas para grafos dispersos, que son la mayoría de los grafos reales. Las matrices usan O(n²) de memoria, pero responden a «¿hay una arista entre i y j?» en tiempo constante, lo que conviene para grafos pequeños o densos.",
    explanation:
      "La elección de la representación depende de la densidad del grafo y de las operaciones que más necesites, como recorrer los vecinos o comprobar aristas.",
    tips: ["Da un ejemplo real de grafo.", "Compara el coste en memoria y en operaciones de ambas representaciones."],
    commonMistakes: ["Usar una matriz para un grafo enorme y disperso."],
    followUpQuestions: ["¿Cómo detectas un ciclo en un grafo dirigido?", "¿Cómo encontrarías el camino más corto entre dos nodos?"],
  },
  'sw-020': {
    question: "¿Cómo diseñarías una caché LRU con operaciones get y put en O(1)?",
    intent: "El entrevistador evalúa tu capacidad para combinar estructuras de datos y cumplir requisitos de rendimiento precisos.",
    expectedAnswer:
      "Combinaría un hash map con una lista doblemente enlazada. El map guarda cada clave con un puntero a su nodo en la lista, lo que da búsquedas en O(1). La lista mantiene las entradas ordenadas por uso reciente: la usada más recientemente en la cabeza y la usada hace más tiempo en la cola. En get, encuentro el nodo a través del map, lo muevo a la cabeza y devuelvo el valor. En put, si la clave existe actualizo el valor y la muevo a la cabeza; si no, creo un nodo en la cabeza y lo añado al map, y si se supera la capacidad elimino el nodo de la cola y borro su clave del map. Todas las operaciones son O(1) porque mover o eliminar un nodo en una lista doblemente enlazada solo cambia unos pocos punteros. En Java, LinkedHashMap con orden de acceso y removeEldestEntry ofrece este comportamiento de serie. Para uso concurrente añadiría bloqueos o usaría una librería de caché específica.",
    explanation:
      "Esta pregunta clásica pone a prueba la composición de estructuras: el map aporta búsquedas rápidas y la lista, actualizaciones rápidas del orden. Mencionar las implementaciones existentes y la seguridad entre hilos demuestra conciencia de producción.",
    tips: ["Explica por qué se necesita cada estructura.", "Recorre get y put paso a paso.", "Menciona la seguridad entre hilos y las librerías existentes."],
    commonMistakes: ["Usar una lista simplemente enlazada, lo que hace que la eliminación sea O(n).", "Olvidar borrar la clave del map al desalojar una entrada."],
    followUpQuestions: ["¿Cómo la harías thread-safe?", "¿Cómo añadirías una expiración basada en el tiempo?"],
  },
  'sw-021': {
    question: "¿Qué son los tries y los filtros de Bloom, y cuándo los usarías?",
    intent: "El entrevistador comprueba un conocimiento avanzado de estructuras especializadas y de sus compromisos.",
    expectedAnswer:
      "Un trie es un árbol en el que cada arista representa un carácter, de modo que las palabras que comparten un prefijo comparten un camino. Buscar una palabra o listar todas las palabras con un prefijo dado lleva un tiempo proporcional a la longitud de la palabra, no al número de palabras, lo que hace que los tries sean útiles para el autocompletado, la corrección ortográfica y las tablas de enrutamiento. Su coste es la memoria, que los tries comprimidos reducen. Un filtro de Bloom es un conjunto probabilístico compacto: usa varias funciones hash para activar bits en un array de bits. Puede responder «seguro que no está» o «quizá está»; los falsos positivos son posibles pero los falsos negativos no, y normalmente no se pueden eliminar elementos. Es útil para evitar búsquedas costosas, por ejemplo comprobar si una clave podría existir antes de leer del disco, como hacen bases de datos como Cassandra, o filtrar las URL ya visitadas en un crawler.",
    explanation:
      "Ambas estructuras sacrifican generalidad a cambio de eficiencia en un caso de uso concreto: las consultas por prefijo en los tries y las pruebas de pertenencia con poca memoria en los filtros de Bloom.",
    tips: ["Explica con precisión la propiedad de los falsos positivos de los filtros de Bloom.", "Da un sistema real que use cada estructura."],
    commonMistakes: ["Decir que un filtro de Bloom puede producir falsos negativos.", "Ignorar el coste en memoria de los tries."],
    followUpQuestions: ["¿Cómo eliges el tamaño de un filtro de Bloom?", "¿Cómo implementarías un autocompletado ordenado por popularidad?"],
  },
  'sw-022': {
    question: "¿Qué describe la notación Big O?",
    intent: "El entrevistador comprueba que sabes razonar sobre cómo escalan los algoritmos con el tamaño de la entrada.",
    expectedAnswer:
      "Big O describe cómo crece el tiempo de ejecución o el uso de memoria de un algoritmo a medida que crece el tamaño de la entrada, centrándose en el término dominante e ignorando las constantes. O(1) significa tiempo constante, como acceder a un elemento de un array por índice. O(log n) crece muy despacio, como la búsqueda binaria. O(n) es lineal, como recorrer una lista una vez. O(n log n) es típico de las ordenaciones eficientes, y O(n²) aparece con bucles anidados sobre los mismos datos. Normalmente describe el peor caso, aunque también se habla del caso promedio, por ejemplo en las tablas hash.",
    explanation:
      "Big O ayuda a comparar enfoques antes de escribir código y explica por qué un algoritmo que funciona con cien elementos puede fallar con un millón.",
    example: "Buscar duplicados con dos bucles anidados es O(n²); añadir los elementos a un HashSet y comprobar la pertenencia es O(n) en promedio.",
    tips: ["Da un ejemplo de cada complejidad habitual.", "Menciona que en la práctica las constantes importan con entradas pequeñas."],
    commonMistakes: ["Pensar que Big O da el tiempo de ejecución exacto.", "Olvidar la complejidad espacial."],
    followUpQuestions: ["¿Cuál es la complejidad de la búsqueda binaria y por qué?", "¿Puede un algoritmo O(n²) ser más rápido que uno O(n log n)?"],
  },
  'sw-023': {
    question: "¿Cómo funciona la búsqueda binaria y qué requiere?",
    intent: "El entrevistador quiere ver una comprensión precisa de un algoritmo fundamental, incluidos sus casos límite.",
    expectedAnswer:
      "La búsqueda binaria encuentra un valor en una colección ordenada comparando repetidamente el objetivo con el elemento central. Si el objetivo es menor, la búsqueda continúa en la mitad izquierda; si es mayor, en la mitad derecha. Cada paso reduce a la mitad el espacio de búsqueda, así que se ejecuta en O(log n): unos 20 pasos para un millón de elementos. Requiere que los datos estén ordenados y admitan acceso aleatorio por índice. Los errores habituales son los errores de uno (off-by-one) en los límites del bucle y calcular el punto medio como (low + high) / 2, que puede desbordarse en algunos lenguajes; low + (high - low) / 2 lo evita.",
    explanation:
      "La búsqueda binaria es fácil de describir pero fácil de implementar mal. Mencionar los casos límite demuestra que realmente la has implementado.",
    example: "while (low <= high) { int mid = low + (high - low) / 2; if (a[mid] == t) return mid; if (a[mid] < t) low = mid + 1; else high = mid - 1; }",
    tips: ["Menciona primero el requisito de que los datos estén ordenados.", "Menciona un caso límite, como el desbordamiento o los arrays vacíos."],
    commonMistakes: ["Aplicar la búsqueda binaria a datos no ordenados.", "Bucles infinitos causados por actualizar mal los límites."],
    followUpQuestions: ["¿Cómo encontrarías la primera aparición de un valor duplicado?", "¿Se puede hacer una búsqueda binaria eficiente sobre una lista enlazada?"],
  },
  'sw-024': {
    question: "Compara quicksort y merge sort.",
    intent: "El entrevistador comprueba que entiendes los algoritmos de ordenación clásicos, su complejidad y sus compromisos prácticos.",
    expectedAnswer:
      "Ambos usan divide y vencerás y se ejecutan en O(n log n) en promedio. Merge sort divide el array por la mitad, ordena cada mitad de forma recursiva y las fusiona; siempre es O(n log n) y es estable, es decir, los elementos iguales conservan su orden, pero necesita O(n) de memoria adicional para los arrays. Quicksort elige un pivote, separa los elementos menores y mayores que el pivote y ordena cada lado; ordena in situ con poca memoria adicional y es muy rápido en la práctica gracias a la localidad de caché, pero su peor caso es O(n²) cuando los pivotes se eligen mal, algo que los pivotes aleatorios o la mediana de tres hacen poco probable. No es estable. Las librerías reales usan híbridos: Java ordena objetos con TimSort, un algoritmo estable basado en merge sort, y primitivos con un quicksort de doble pivote.",
    explanation:
      "La comparación muestra los compromisos entre rendimiento garantizado, estabilidad y memoria. Saber qué usan realmente las librerías estándar demuestra conocimiento práctico.",
    tips: ["Compara el peor caso, la memoria y la estabilidad.", "Menciona qué usa la librería estándar de tu lenguaje."],
    commonMistakes: ["Decir que quicksort siempre es O(n log n).", "Olvidar la estabilidad como criterio."],
    followUpQuestions: ["¿Por qué importa la estabilidad al ordenar por varios campos?", "¿Cómo ordenarías datos que no caben en memoria?"],
  },
  'sw-025': {
    question: "¿Cuál es la diferencia entre la búsqueda en anchura y la búsqueda en profundidad?",
    intent: "El entrevistador comprueba tus conocimientos de recorrido de grafos y cuándo elegir cada enfoque.",
    expectedAnswer:
      "La búsqueda en anchura (BFS) explora un grafo nivel por nivel desde el nodo de partida usando una cola: primero visita todos los vecinos directos, luego los vecinos de estos, y así sucesivamente. En un grafo sin pesos encuentra el camino más corto en número de aristas. La búsqueda en profundidad (DFS) avanza todo lo posible por una rama antes de retroceder, usando una pila o recursión. Es útil para detectar ciclos, hacer ordenación topológica y explorar todos los caminos posibles, como en los puzles. Ambas se ejecutan en tiempo O(V + E) con una lista de adyacencia. BFS puede usar más memoria en grafos anchos porque guarda un nivel entero, mientras que DFS puede alcanzar los límites de recursión en grafos muy profundos. Ambas necesitan un conjunto de visitados para evitar bucles infinitos en grafos con ciclos.",
    explanation:
      "Elegir entre BFS y DFS depende de lo que necesites: los caminos más cortos y los resultados más cercanos favorecen BFS, mientras que la exploración exhaustiva y el orden de dependencias favorecen DFS.",
    tips: ["Menciona la estructura de datos en la que se basa cada una.", "Da un caso de uso en el que cada una sea claramente mejor."],
    commonMistakes: ["Olvidar el conjunto de visitados.", "Usar BFS para caminos más cortos en grafos con pesos."],
    followUpQuestions: ["¿Cómo encontrarías el camino más corto en un grafo con pesos?", "¿Cómo implementas DFS sin recursión?"],
  },
};
