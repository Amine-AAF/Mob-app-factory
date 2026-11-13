import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de frontend 001-025: JavaScript, TypeScript, React. */
export const esA: TextTable<QuestionText> = {
  'fe-001': {
    question: "¿Cuál es la diferencia entre var, let y const en JavaScript?",
    intent: "El entrevistador comprueba que conoces lo básico sobre el ámbito (scope) de las variables y por qué el código moderno evita var.",
    expectedAnswer:
      "var tiene ámbito de función y sufre hoisting: está disponible en toda la función y se inicializa a undefined antes de su declaración, lo que provoca errores sorprendentes, por ejemplo en bucles con callbacks. let y const tienen ámbito de bloque, así que solo existen dentro del bloque { } más cercano, y acceder a ellas antes de su declaración lanza un error por la temporal dead zone (zona muerta temporal). const impide reasignar la variable, pero no hace inmutable el valor: todavía puedes hacer push en un array declarado con const. El código moderno usa const por defecto y let cuando hace falta reasignar.",
    explanation:
      "El ámbito de bloque hace predecible la vida de las variables. Saber que const se refiere al enlace (binding) y no al valor evita una confusión muy frecuente.",
    example: "const items = [];\nitems.push(1); // permitido\nitems = [2];   // TypeError: assignment to constant variable",
    tips: ["Menciona el ámbito de bloque y la temporal dead zone.", "Explica que const no congela los objetos."],
    commonMistakes: ["Decir que los valores declarados con const son inmutables.", "Usar var en código nuevo."],
    followUpQuestions: ["¿Qué es el hoisting?", "¿Cómo harías que un objeto fuera realmente inmutable?"],
  },
  'fe-002': {
    question: "¿Cuál es la diferencia entre == y === en JavaScript?",
    intent: "El entrevistador comprueba que entiendes la coerción de tipos, una fuente habitual de errores.",
    expectedAnswer:
      "=== es la igualdad estricta: devuelve true solo si ambos valores tienen el mismo tipo y el mismo valor, sin conversión. == es la igualdad débil: convierte los operandos a un tipo común antes de compararlos, lo que da resultados sorprendentes, como que 0 == \"\" sea true, que \"1\" == 1 sea true y que null == undefined sea true. La mayoría de las guías de estilo recomiendan usar siempre ===. Una excepción habitual es value == null, que comprueba null y undefined en una sola expresión. En el caso de los objetos, ambos operadores comparan referencias, no contenidos.",
    explanation:
      "Las reglas de coerción implícita son complejas, así que la igualdad estricta hace que el código sea más predecible y fácil de leer.",
    tips: ["Da uno o dos ejemplos sorprendentes de coerción.", "Menciona que los objetos se comparan por referencia."],
    commonMistakes: ["Pensar que === compara el contenido de los objetos.", "Usar == por costumbre."],
    followUpQuestions: ["¿Cómo compararías dos objetos por valor?", "¿Qué hace Object.is() de forma distinta a ===?"],
  },
  'fe-003': {
    question: "¿Cuál es la diferencia entre null y undefined, y qué son los valores falsy?",
    intent: "El entrevistador comprueba fundamentos que afectan a las condiciones y a los valores por defecto en el código de todos los días.",
    expectedAnswer:
      "undefined significa que no se ha asignado un valor: una variable sin inicializar, una propiedad que no existe o una función sin return. null es un «sin valor» explícito que asigna el desarrollador. Los valores falsy son false, 0, -0, 0n, \"\", null, undefined y NaN; todo lo demás, incluidos \"0\", [] y {}, es truthy. Esto importa para los valores por defecto: count || 10 sustituye 0 por 10, lo que puede ser incorrecto, mientras que count ?? 10 solo sustituye null o undefined. El optional chaining, user?.address?.city, evita errores cuando una propiedad de la cadena es null o undefined.",
    explanation:
      "Entender los valores falsy explica por qué || puede sobrescribir en silencio valores válidos como 0 o un string vacío, y por qué existe ??.",
    tips: ["Enumera los valores falsy.", "Compara || con ??."],
    commonMistakes: ["Usar || para valores por defecto cuando 0 o \"\" son valores válidos.", "Pensar que un array vacío es falsy."],
    followUpQuestions: ["¿Qué devuelve typeof null?", "¿Cómo funciona el optional chaining con llamadas a funciones?"],
  },
  'fe-004': {
    question: "¿Qué es una closure y dónde se usan las closures en la práctica?",
    intent: "El entrevistador comprueba que entiendes un concepto central de JavaScript que explica muchos comportamientos, incluidos los hooks de React.",
    expectedAnswer:
      "Una closure es una función junto con las variables del ámbito en el que se creó. La función interna conserva el acceso a esas variables incluso después de que la función externa haya terminado. Las closures se usan para mantener estado privado, como en una fábrica de contadores donde count no es accesible desde fuera; en callbacks y manejadores de eventos que recuerdan valores de su contexto de creación; en fábricas de funciones y aplicación parcial; y en React, donde cada renderizado crea nuevas funciones manejadoras que capturan las props y el estado de ese renderizado. Una trampa clásica era var en un bucle con setTimeout: todos los callbacks compartían la misma variable, algo que let resuelve creando un nuevo enlace en cada iteración.",
    explanation:
      "Las closures son la forma en que las funciones de JavaScript llevan consigo su contexto. Explican tanto los valores obsoletos en los efectos de React como los patrones de estado privado.",
    example: "function makeCounter() { let count = 0; return () => ++count; }\nconst next = makeCounter(); next(); next(); // 2",
    tips: ["Da un ejemplo de código sencillo.", "Relaciona las closures con los hooks de React o con los callbacks."],
    commonMistakes: ["Definir las closures como «funciones dentro de funciones» sin mencionar las variables capturadas."],
    followUpQuestions: ["¿Qué es una stale closure (closure obsoleta) en React?", "¿Pueden las closures provocar fugas de memoria?"],
  },
  'fe-005': {
    question: "¿Cómo se determina el valor de this en JavaScript?",
    intent: "El entrevistador comprueba que entiendes un tema confuso que afecta a los callbacks y a los métodos de clase.",
    expectedAnswer:
      "En las funciones normales, this depende de cómo se llama la función, no de dónde se define. Si se llama como método, obj.method(), this es obj. Si se llama como función simple, this es undefined en modo estricto y en los módulos. Con new, this es el objeto recién creado. call, apply y bind fijan this de forma explícita. Las arrow functions no tienen this propio: usan el this del ámbito que las rodea en el momento de su creación. Por eso, pasar un método de clase como callback, como en button.addEventListener(\"click\", this.handle), pierde this, salvo que lo enlaces con bind o definas el método como una propiedad con arrow function.",
    explanation:
      "La regla del punto de llamada (call site) explica la mayoría de los errores del tipo «this es undefined». Las arrow functions son la solución moderna habitual para los callbacks.",
    tips: ["Deja claro que el punto de llamada determina this.", "Explica por qué las arrow functions se comportan de otra forma."],
    commonMistakes: ["Usar una arrow function como método de un objeto que necesita su propio this.", "Pensar que this hace referencia a la propia función."],
    followUpQuestions: ["¿Qué devuelve bind?", "¿Por qué los componentes de clase de React necesitaban enlazar los métodos?"],
  },
  'fe-006': {
    question: "Explica el event loop de JavaScript, incluidas las microtareas y las macrotareas.",
    intent: "El entrevistador comprueba si entiendes cómo se planifica el código asíncrono, lo que explica los errores de orden de ejecución.",
    expectedAnswer:
      "JavaScript se ejecuta en un único hilo principal con una pila de llamadas (call stack). Cuando la pila está vacía, el event loop toma trabajo de las colas. Las macrotareas, también llamadas tareas, incluyen los temporizadores de setTimeout, la E/S y los eventos del usuario. Las microtareas incluyen los callbacks de las promesas, las continuaciones de await y queueMicrotask. Después de cada macrotarea, el motor ejecuta todas las microtareas pendientes antes de renderizar y antes de la siguiente macrotarea. Así, en console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); console.log(4); la salida es 1, 4, 3, 2. Un trabajo síncrono largo lo bloquea todo, incluidos el renderizado y la interacción del usuario, por eso los cálculos pesados deben dividirse o trasladarse a un Web Worker.",
    explanation:
      "Saber que las microtareas se ejecutan antes de la siguiente tarea explica el orden de ejecución y por qué una avalancha de microtareas puede congelar la página.",
    tips: ["Usa un ejemplo corto de orden de ejecución.", "Menciona que bloquear la pila congela la interfaz."],
    commonMistakes: ["Pensar que setTimeout(fn, 0) se ejecuta inmediatamente.", "Creer que las promesas se ejecutan en otro hilo."],
    followUpQuestions: ["¿Dónde encaja requestAnimationFrame?", "¿En qué se diferencia el event loop de Node.js?"],
  },
  'fe-007': {
    question: "¿Cómo gestionas los errores con promesas y async/await?",
    intent: "El entrevistador comprueba que escribes código asíncrono robusto, incluidas las operaciones concurrentes y los rechazos no gestionados.",
    expectedAnswer:
      "Con async/await, envuelvo las llamadas con await en try/catch y uso finally para la limpieza, como ocultar un indicador de carga. Con cadenas de promesas, un .catch() al final gestiona los errores de cualquier paso anterior. Un rechazo no gestionado es un error: puede quedar registrado en los logs o hacer caer un proceso de Node, así que toda promesa debe esperarse con await o tener un catch. Para varias operaciones independientes, Promise.all las ejecuta de forma concurrente pero se rechaza en cuanto una falla, mientras que Promise.allSettled espera a todas e informa del resultado de cada una, lo que encaja con los fallos parciales. Promise.race y Promise.any ayudan con los timeouts y las alternativas de respaldo. En las llamadas de red, también gestiono de forma explícita las respuestas que no son 2xx, porque fetch solo se rechaza ante errores de red, no ante un HTTP 404 o 500.",
    explanation:
      "Una buena gestión de errores asíncronos cubre tanto las llamadas individuales como los grupos de llamadas, y conoce la trampa específica de fetch con los errores HTTP.",
    example: "const res = await fetch(url);\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst data = await res.json();",
    tips: ["Compara Promise.all con Promise.allSettled.", "Menciona que fetch no se rechaza ante errores HTTP."],
    commonMistakes: ["Olvidar el await de una promesa dentro de try/catch.", "Esperar una tras otra llamadas independientes que podrían ejecutarse de forma concurrente."],
    followUpQuestions: ["¿Cómo añadirías un timeout a fetch?", "¿Cómo cancelas una petición con AbortController?"],
  },
  'fe-008': {
    question: "¿Cómo funciona la herencia prototípica y qué relación tiene con las clases de ES?",
    intent: "El entrevistador evalúa si entiendes a fondo el modelo de objetos de JavaScript que hay detrás de la sintaxis moderna.",
    expectedAnswer:
      "Todo objeto tiene un enlace interno a otro objeto, su prototipo. Cuando lees una propiedad que el objeto no tiene, JavaScript la busca a lo largo de la cadena de prototipos hasta encontrarla o llegar a null. Los métodos definidos en el prototype de un constructor los comparten todas las instancias, lo que ahorra memoria. Las clases de ES2015 son sobre todo una sintaxis sobre este mecanismo: class Dog extends Animal hace que Dog.prototype herede de Animal.prototype, los métodos se colocan en el prototipo y super llama a la implementación del padre. Aun así, las clases añaden diferencias reales: siempre se ejecutan en modo estricto, no pueden llamarse sin new y admiten campos privados con #, que son realmente inaccesibles desde fuera, a diferencia de las convenciones con guiones bajos. Object.create(proto) crea directamente un objeto con el prototipo elegido. Entender esto explica por qué instanceof recorre la cadena de prototipos y por qué modificar el prototipo de un objeto nativo afecta a todos los objetos, lo cual es una mala práctica.",
    explanation:
      "Las clases no sustituyeron a los prototipos; los hicieron más fáciles de usar. Los candidatos avanzados conocen tanto el mecanismo como lo que añaden específicamente las clases.",
    tips: ["Explica la búsqueda de propiedades a lo largo de la cadena.", "Muestra lo que la sintaxis de clases aporta más allá del azúcar sintáctico.", "Menciona los campos privados."],
    commonMistakes: ["Decir que las clases de JavaScript funcionan como las clases de Java.", "Extender los prototipos de los objetos nativos en el código de la aplicación."],
    followUpQuestions: ["¿Qué devuelve Object.getPrototypeOf para una instancia de una clase?", "¿En qué se diferencian los campos privados de las closures para lograr privacidad?"],
  },
  'fe-009': {
    question: "¿Cuál es la diferencia entre los módulos ES y CommonJS, y por qué importa para el bundling?",
    intent: "El entrevistador comprueba tu conocimiento de las herramientas modernas: sistemas de módulos, tree shaking e interoperabilidad.",
    expectedAnswer:
      "CommonJS, el sistema histórico de Node.js, usa require() y module.exports. Es dinámico: require puede ejecutarse en cualquier lugar, incluso de forma condicional, y las exportaciones se resuelven en tiempo de ejecución y se cargan de forma síncrona. Los módulos ES usan import y export. Su estructura es estática: las importaciones se declaran en el nivel superior y se analizan antes de la ejecución, los enlaces son vivos (live bindings) y la carga puede ser asíncrona; el import() dinámico devuelve una promesa y permite el code splitting. Como el grafo de importaciones se conoce de forma estática, bundlers como Vite, webpack o esbuild pueden aplicar tree shaking, es decir, eliminar las exportaciones que nunca se usan, algo mucho más difícil con CommonJS. Por eso las librerías publican builds en módulos ES y se declaran libres de efectos secundarios en package.json. La interoperabilidad puede ser delicada: importar CommonJS desde ESM da una exportación por defecto, y los paquetes duales deben evitar que se carguen dos copias de la misma librería, lo que puede romper singletons o comprobaciones con instanceof.",
    explanation:
      "La naturaleza estática de los módulos ES permite el tree shaking y unas herramientas mejores. Los candidatos avanzados también conocen las trampas de interoperabilidad.",
    tips: ["Compara la resolución estática con la dinámica.", "Explica el tree shaking y el flag sideEffects.", "Menciona el import dinámico para el code splitting."],
    commonMistakes: ["Pensar que el tree shaking funciona automáticamente con cualquier estilo de importación.", "Importar una librería de utilidades completa para usar una sola función."],
    followUpQuestions: ["¿Qué cambia \"type\": \"module\" en Node.js?", "¿Cómo dividirías un bundle grande por rutas?"],
  },
  'fe-010': {
    question: "¿Qué aporta TypeScript a JavaScript y cuál es la diferencia entre any y unknown?",
    intent: "El entrevistador comprueba que entiendes lo básico de TypeScript y que tienes buenos hábitos de seguridad de tipos.",
    expectedAnswer:
      "TypeScript añade un sistema de tipos estático sobre JavaScript: los tipos se comprueban en tiempo de compilación y se eliminan en tiempo de ejecución, así que el resultado es JavaScript normal. Detecta errores como erratas, propiedades que faltan o argumentos incorrectos antes de que el código se ejecute, y mejora el autocompletado y la refactorización en el editor. any desactiva la comprobación de tipos de un valor: puedes hacer cualquier cosa con él, lo que anula el propósito de TypeScript. unknown también acepta cualquier valor, pero tienes que acotarlo (narrowing), por ejemplo con typeof o con una función de validación, antes de usarlo. unknown es la opción segura para los datos de fuentes externas, como JSON.parse o las respuestas de una API.",
    explanation:
      "Los tipos solo existen en tiempo de compilación. Elegir unknown en lugar de any mantiene la seguridad de tipos allí donde los datos todavía no son de confianza.",
    tips: ["Menciona que los tipos se eliminan en tiempo de ejecución.", "Explica por qué unknown es más seguro que any."],
    commonMistakes: ["Usar any para silenciar errores.", "Creer que TypeScript valida los datos en tiempo de ejecución."],
    followUpQuestions: ["¿Para qué se usa el tipo never?", "¿Cómo validas los datos de una API en tiempo de ejecución?"],
  },
  'fe-011': {
    question: "¿Cuál es la diferencia entre una interface y un type alias en TypeScript?",
    intent: "El entrevistador comprueba tu conocimiento práctico de las declaraciones de TypeScript y de las convenciones de equipo.",
    expectedAnswer:
      "Ambos pueden describir la forma de un objeto y, para eso, son en gran medida intercambiables. Las interfaces pueden ampliarse con extends y pueden fusionarse: declarar dos veces la misma interface añade propiedades, lo que resulta útil para ampliar los tipos de una librería. Los type alias son más flexibles: pueden dar nombre a uniones como \"small\" | \"large\", tuplas, primitivos y tipos de función, y funcionan con los mapped types y los conditional types. Una convención habitual es usar interfaces para las formas de objetos públicas y types para las uniones y los tipos calculados, pero la coherencia dentro de un código importa más que la elección.",
    explanation:
      "Las diferencias reales son la fusión de declaraciones (declaration merging) y la expresividad de los type alias. Los equipos suelen elegir una convención.",
    tips: ["Menciona la fusión de declaraciones y las uniones.", "Di que la coherencia importa más que la elección."],
    commonMistakes: ["Afirmar que una opción es siempre mejor que la otra."],
    followUpQuestions: ["¿Cuándo es útil la fusión de declaraciones?", "¿Cómo amplías un type alias?"],
  },
  'fe-012': {
    question: "¿Qué son los genéricos en TypeScript? Pon un ejemplo.",
    intent: "El entrevistador comprueba si sabes escribir funciones y componentes reutilizables y con tipos seguros.",
    expectedAnswer:
      "Los genéricos permiten escribir código que funciona con muchos tipos conservando la relación entre ellos. En lugar de devolver any, una función como function first<T>(items: T[]): T | undefined devuelve el mismo tipo que los elementos del array: first([1, 2]) es un number y first([\"a\"]) es un string. Las restricciones limitan los tipos aceptados; por ejemplo, <T extends { id: string }> garantiza que T tiene un id. Los genéricos se usan en colecciones, en helpers de API como fetchJson<T>(url): Promise<T>, en componentes de React como un List<T> con una prop renderItem, y en los utility types.",
    explanation:
      "Los genéricos aportan reutilización sin perder información de tipos. Las restricciones los hacen seguros cuando el código necesita ciertas propiedades.",
    example: "function byId<T extends { id: string }>(items: T[]): Map<string, T> {\n  return new Map(items.map((i) => [i.id, i]));\n}",
    tips: ["Muestra una función con una restricción.", "Menciona un componente de React genérico o un helper de API."],
    commonMistakes: ["Usar any en lugar de un parámetro de tipo.", "Añadir genéricos que se usan una sola vez y no aportan seguridad."],
    followUpQuestions: ["¿Qué es un parámetro de tipo por defecto?", "¿Por qué fetchJson<T>() no es realmente seguro en cuanto a tipos sin validación?"],
  },
  'fe-013': {
    question: "¿Qué son las uniones discriminadas y el estrechamiento de tipos (narrowing) en TypeScript?",
    intent: "El entrevistador comprueba tu capacidad de modelado para evitar estados inválidos en el código frontend.",
    expectedAnswer:
      "Una unión discriminada es una unión de tipos de objeto que comparten una propiedad literal, el discriminante. Por ejemplo, type RequestState = { status: \"loading\" } | { status: \"success\"; data: User[] } | { status: \"error\"; message: string }. El narrowing significa que TypeScript afina el tipo después de una comprobación: dentro de if (state.status === \"success\"), sabe que state.data existe. El narrowing también funciona con typeof, instanceof, el operador in y los type guards personalizados. Con un switch sobre el discriminante y una rama default que asigna el valor a never, el compilador avisa si se añade un nuevo caso y no se gestiona. Así se evitan combinaciones imposibles, como tener a la vez datos y un error.",
    explanation:
      "Las uniones discriminadas modelan los estados de forma explícita y dejan que el compilador imponga una gestión correcta, algo especialmente útil para el estado de la interfaz.",
    example: "switch (state.status) {\n  case \"loading\": return <Spinner />;\n  case \"error\": return <Error msg={state.message} />;\n  case \"success\": return <UserList users={state.data} />;\n}",
    tips: ["Modela un estado loading/success/error.", "Menciona la exhaustividad con never."],
    commonMistakes: ["Usar varios booleanos opcionales, como isLoading y hasError, que pueden contradecirse."],
    followUpQuestions: ["¿Cómo escribes un type guard personalizado?", "¿Qué hace el operador satisfies?"],
  },
  'fe-014': {
    question: "¿Qué utility types de TypeScript usas más y por qué?",
    intent: "El entrevistador comprueba tu soltura práctica con las herramientas de tipos integradas que reducen la duplicación.",
    expectedAnswer:
      "Partial<T> hace opcionales todas las propiedades, útil para los payloads de actualización. Required<T> hace lo contrario. Pick<T, K> y Omit<T, K> crean tipos con un subconjunto de propiedades, por ejemplo Omit<User, \"password\"> para un perfil público. Readonly<T> impide reasignar las propiedades. Record<K, V> tipa diccionarios como Record<Locale, string>. ReturnType<typeof fn> y Parameters<typeof fn> extraen tipos de las funciones, y Awaited<T> desenvuelve las promesas. NonNullable<T> elimina null y undefined. Permiten derivar los tipos de una única fuente de verdad en lugar de duplicar definiciones que pueden acabar divergiendo.",
    explanation:
      "Los utility types mantienen coherentes los tipos relacionados. Derivar tipos reduce el mantenimiento y los errores cuando cambian los modelos.",
    tips: ["Da un uso concreto para cada tipo que menciones.", "Insiste en la idea de una única fuente de verdad."],
    commonMistakes: ["Copiar interfaces a mano en lugar de derivarlas.", "Usar Partial cuando solo algunos campos deberían ser opcionales."],
    followUpQuestions: ["¿Cómo se implementa Pick con mapped types?", "¿Cómo harías readonly las propiedades anidadas?"],
  },
  'fe-015': {
    question: "Explica los mapped types, los conditional types y la palabra clave infer.",
    intent: "El entrevistador evalúa conocimientos avanzados de TypeScript que se usan en librerías y utilidades compartidas.",
    expectedAnswer:
      "Un mapped type crea un nuevo tipo recorriendo las claves de otro: { [K in keyof T]?: T[K] } es la forma en que funciona Partial. Los modificadores como readonly y ? pueden añadirse o quitarse con + y -, y el remapeo de claves con as permite renombrarlas, por ejemplo para generar nombres de getters como getName a partir de name. Un conditional type elige un tipo según una condición: T extends string ? \"text\" : \"other\". Los conditional types se distribuyen sobre las uniones, así que aplicar uno a A | B lo aplica a cada miembro, que es como funcionan Exclude y Extract. infer declara una variable de tipo dentro de un conditional type para capturar una parte de un tipo: type ElementType<T> = T extends (infer U)[] ? U : never extrae el tipo de los elementos de un array, y ReturnType usa infer para capturar el tipo de retorno de una función. Estas herramientas permiten escribir tipos que siguen automáticamente a tus datos, pero deben usarse con moderación, porque los tipos complejos ralentizan la compilación y son difíciles de leer para el resto del equipo.",
    explanation:
      "Los mapped types y los conditional types son las piezas con las que se construyen los utility types estándar. Los candidatos avanzados también conocen la distribución y el coste en legibilidad.",
    example: "type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };",
    tips: ["Muestra cómo se construye un utility type estándar.", "Menciona los conditional types distributivos.", "Advierte sobre la complejidad."],
    commonMistakes: ["Escribir tipos ingeniosos que nadie más puede mantener.", "Sorprenderse por la distribución sobre las uniones."],
    followUpQuestions: ["¿Cómo evitas que un conditional type se distribuya?", "¿Cómo tiparías un deep partial?"],
  },
  'fe-016': {
    question: "¿Cómo mantienes la seguridad de tipos en los límites de una aplicación frontend, como las respuestas de una API?",
    intent: "El entrevistador comprueba que entiendes a fondo la distancia entre los tipos en tiempo de compilación y los datos en tiempo de ejecución.",
    expectedAnswer:
      "Los tipos de TypeScript desaparecen en tiempo de ejecución, así que declarar const user: User = await res.json() es solo una promesa hecha al compilador: si la API cambia o devuelve un objeto de error, el código fallará en algún punto alejado de la causa. En los límites, como las respuestas de una API, el local storage, los parámetros de la URL y los datos de los formularios, valido los datos en tiempo de ejecución con una librería de esquemas como zod o valibot, y derivo el tipo estático del esquema con z.infer, de modo que hay una única fuente de verdad. Los datos inválidos se gestionan en el límite con un error claro y registro en los logs. Cuando controlo el back end, prefiero generar los tipos y los clientes a partir de una especificación OpenAPI, o compartir los esquemas en un monorepo, y aun así valido las entradas críticas. También separo el modelo de dominio de los tipos de transporte, convirtiendo los DTO de la API en modelos de interfaz en un único lugar, para que los cambios del backend no se propaguen a todos los componentes.",
    explanation:
      "La validación en tiempo de ejecución en los límites convierte una corrupción silenciosa en errores explícitos y localizados. Derivar los tipos de esquemas o contratos evita que diverjan.",
    example: "const User = z.object({ id: z.string(), email: z.string().email() });\ntype User = z.infer<typeof User>;\nconst user = User.parse(await res.json());",
    tips: ["Explica con claridad el borrado de tipos (type erasure).", "Menciona los tipos derivados de esquemas.", "Habla de los clientes generados a partir de OpenAPI."],
    commonMistakes: ["Forzar el tipo de las respuestas de la API con as.", "Validar en todas partes en lugar de hacerlo una sola vez en el límite."],
    followUpQuestions: ["¿Qué coste tiene la validación en tiempo de ejecución con payloads grandes?", "¿Cómo gestionas las versiones de la API en el cliente?"],
  },
  'fe-017': {
    question: "En React, ¿cuál es la diferencia entre las props y el estado (state)?",
    intent: "El entrevistador comprueba el modelo mental más básico de React.",
    expectedAnswer:
      "Las props son entradas que el componente padre pasa a un componente; este debe tratarlas como de solo lectura. El estado son los datos que pertenecen al propio componente y que este gestiona, creados con useState o useReducer, y actualizarlo con el setter hace que el componente se vuelva a renderizar. Cuando varios componentes necesitan los mismos datos, el estado se eleva (lifting state up) a su padre común más cercano y se pasa hacia abajo como props, junto con callbacks para modificarlo. La interfaz es una función de las props y el estado: no modificas el DOM directamente, actualizas el estado y React actualiza la pantalla.",
    explanation:
      "Entender a quién pertenecen los datos, quién puede cambiarlos y cómo fluyen los cambios hacia abajo es la base de cualquier diseño en React.",
    tips: ["Menciona la elevación del estado.", "Insiste en que las props son de solo lectura."],
    commonMistakes: ["Mutar directamente los objetos de las props o del estado.", "Copiar las props en el estado sin motivo."],
    followUpQuestions: ["¿Cuándo usarías useReducer en lugar de useState?", "¿Qué es el estado derivado?"],
  },
  'fe-018': {
    question: "¿Por qué React necesita una key al renderizar listas?",
    intent: "El entrevistador comprueba que entiendes la reconciliación en una situación habitual que provoca errores reales.",
    expectedAnswer:
      "Cuando una lista se vuelve a renderizar, React usa las keys para emparejar los elementos del renderizado anterior con los del nuevo. Con keys estables y únicas, como un id procedente de los datos, React puede mover, añadir o eliminar los elementos correctos y conservar el estado y los nodos del DOM de cada uno. Si usas el índice del array como key y la lista se reordena, se filtra o se le insertan elementos, React empareja los elementos por posición: un estado como el texto de un input o una casilla marcada puede acabar en la fila equivocada, y el renderizado es menos eficiente. Las keys basadas en el índice solo son aceptables en listas estáticas que nunca cambian de orden.",
    explanation:
      "Las keys dan a los elementos una identidad entre renderizados. Unas keys incorrectas provocan errores sutiles de estado, no solo advertencias.",
    tips: ["Explica qué sale mal con las keys basadas en el índice.", "Usa un ID estable procedente de los datos."],
    commonMistakes: ["Usar Math.random() como key, lo que vuelve a montar los elementos en cada renderizado."],
    followUpQuestions: ["¿Cómo puedes usar una key para reiniciar el estado de un componente?", "¿Qué es la reconciliación?"],
  },
  'fe-019': {
    question: "¿Cómo funciona useEffect y cuándo necesitas una función de limpieza (cleanup)?",
    intent: "El entrevistador comprueba que usas correctamente los efectos, una de las API de React peor utilizadas.",
    expectedAnswer:
      "useEffect ejecuta una función después de que React haya aplicado (commit) el renderizado en la pantalla. El array de dependencias controla cuándo vuelve a ejecutarse: después de cada renderizado si no hay array, una sola vez tras el montaje con un array vacío, o cuando cambia alguno de los valores indicados. Todo valor del componente que se use dentro del efecto debería estar en las dependencias, algo que comprueba la regla de ESLint para hooks. La función de limpieza, que devuelve el efecto, se ejecuta antes de que el efecto vuelva a ejecutarse y cuando el componente se desmonta. Es necesaria para eliminar event listeners, borrar temporizadores, cerrar suscripciones o cancelar peticiones con AbortController, para que los efectos obsoletos no actualicen el estado. En desarrollo, Strict Mode ejecuta los efectos dos veces para revelar las limpiezas que faltan. Los efectos sirven para sincronizarse con sistemas externos; calcular valores a partir de las props o del estado debe hacerse durante el renderizado.",
    explanation:
      "Pensar en los efectos como una sincronización con sistemas externos, y no como métodos del ciclo de vida, evita la mayoría de los malos usos.",
    example: "useEffect(() => {\n  const controller = new AbortController();\n  load(id, controller.signal).then(setData);\n  return () => controller.abort();\n}, [id]);",
    tips: ["Explica las opciones del array de dependencias.", "Da un ejemplo de limpieza.", "Menciona que los valores derivados no necesitan efectos."],
    commonMistakes: ["Omitir dependencias para evitar que el efecto se vuelva a ejecutar.", "Usar efectos para calcular estado derivado."],
    followUpQuestions: ["¿Por qué Strict Mode ejecuta los efectos dos veces?", "¿Qué es una condición de carrera en los efectos que cargan datos?"],
  },
  'fe-020': {
    question: "¿Por qué a veces parece que un valor del estado no se actualiza justo después de llamar a setState?",
    intent: "El entrevistador comprueba que entiendes las instantáneas de renderizado, el batching y las stale closures.",
    expectedAnswer:
      "Llamar al setter no cambia la variable en el renderizado actual; programa un nuevo renderizado, y el nuevo valor está disponible en el siguiente. Cada renderizado tiene su propia instantánea (snapshot) de las props y el estado, que capturan las funciones creadas durante ese renderizado. Por eso, llamar dos veces a setCount(count + 1) en el mismo manejador solo incrementa en uno, porque ambas llamadas leen la misma instantánea. La forma con función actualizadora, setCount(c => c + 1), usa el último valor pendiente. React 18 también agrupa (batching) en un único renderizado las actualizaciones procedentes de manejadores de eventos, timeouts y promesas. Las stale closures aparecen cuando un efecto o un intervalo conserva una función antigua que capturó un estado antiguo; las soluciones son la forma actualizadora, unas dependencias correctas o un ref para los valores que no deben provocar renderizados.",
    explanation:
      "El modelo de instantáneas explica muchos comportamientos confusos. La forma actualizadora es la solución estándar cuando el nuevo estado depende del anterior.",
    example: "setCount(c => c + 1);\nsetCount(c => c + 1); // +2, como se esperaba",
    tips: ["Explica las instantáneas de renderizado.", "Usa el ejemplo de la función actualizadora.", "Menciona el batching de React 18."],
    commonMistakes: ["Leer el estado justo después de modificarlo y esperar el nuevo valor."],
    followUpQuestions: ["¿Cuándo usarías useRef en lugar del estado?", "¿Qué es el batching automático?"],
  },
  'fe-021': {
    question: "¿Cuál es la diferencia entre componentes controlados y no controlados en los formularios?",
    intent: "El entrevistador comprueba que conoces los patrones de gestión de formularios y sus ventajas e inconvenientes.",
    expectedAnswer:
      "En un componente controlado, el valor del input procede del estado de React y los cambios pasan por onChange: value={name} onChange={e => setName(e.target.value)}. React es la única fuente de verdad, lo que facilita la validación, el formateo y la lógica condicional, pero cada pulsación de tecla vuelve a renderizar el componente. En un componente no controlado, el DOM guarda el valor y lo lees cuando lo necesitas con un ref o a partir de los datos del formulario al enviarlo, usando defaultValue para el valor inicial. Es más sencillo y puede rendir mejor en formularios grandes. Librerías como React Hook Form usan sobre todo inputs no controlados con refs por rendimiento, sin dejar de ofrecer validación.",
    explanation:
      "Ambos enfoques son válidos. La elección depende de cuánto necesita reaccionar la interfaz a cada cambio.",
    tips: ["Muestra brevemente ambos patrones.", "Menciona las librerías de formularios y el rendimiento."],
    commonMistakes: ["Hacer que un input pase de controlado a no controlado, lo que genera una advertencia.", "Asignar value sin onChange."],
    followUpQuestions: ["¿Cómo validarías un formulario con muchos campos?", "¿Cómo cambian las form actions de React 19 la gestión de formularios?"],
  },
  'fe-022': {
    question: "¿Qué es un hook personalizado (custom hook) y cuándo deberías crear uno?",
    intent: "El entrevistador comprueba que sabes reutilizar lógica con estado y diseñar componentes limpios.",
    expectedAnswer:
      "Un hook personalizado es una función cuyo nombre empieza por use y que llama a otros hooks. Permite extraer de los componentes la lógica con estado y reutilizarla, por ejemplo useDebounce(value, delay), useOnlineStatus() o useFetch(url). Cada componente que llama al hook obtiene su propio estado independiente; los hooks comparten lógica, no datos. Creo uno cuando la misma combinación de estado y efectos aparece en varios componentes, o cuando un componente se vuelve difícil de leer por una lógica que no tiene que ver con el renderizado. Los hooks personalizados siguen las reglas de los hooks: se llaman en el nivel superior, no dentro de condiciones ni de bucles. También pueden probarse de forma aislada con renderHook.",
    explanation:
      "Los hooks personalizados separan el comportamiento de la presentación, lo que hace los componentes más pequeños y la lógica reutilizable y fácil de probar.",
    example: "function useDebounce<T>(value: T, ms = 300) {\n  const [v, setV] = useState(value);\n  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);\n  return v;\n}",
    tips: ["Explica que cada llamada tiene su propio estado.", "Da un ejemplo realista."],
    commonMistakes: ["Pensar que un hook personalizado comparte el estado entre componentes.", "Llamar a los hooks de forma condicional."],
    followUpQuestions: ["¿Cómo compartirías el estado entre componentes en su lugar?", "¿Cómo pruebas un hook personalizado?"],
  },
  'fe-023': {
    question: "¿Cuándo se vuelve a renderizar un componente de React y cómo ayudan memo, useMemo y useCallback?",
    intent: "El entrevistador evalúa si entiendes a fondo el rendimiento del renderizado y cuándo merece la pena optimizar.",
    expectedAnswer:
      "Un componente se vuelve a renderizar cuando cambia su estado, cuando su padre se vuelve a renderizar o cuando cambia un contexto que consume. Volver a renderizar un componente suele ser barato; después, React compara el resultado y solo actualiza en el DOM lo que ha cambiado. Los problemas aparecen cuando componentes costosos se renderizan a menudo. React.memo envuelve un componente para que omita el renderizado si sus props son superficialmente iguales (shallow equal) a las anteriores. Como los objetos y las funciones creados durante el renderizado del padre son nuevos cada vez, memo solo funciona si esas props conservan la misma identidad, que es lo que proporcionan useMemo, para valores calculados, y useCallback, para funciones. useMemo también es útil para cálculos realmente costosos. Estas herramientas añaden complejidad y consumo de memoria, así que primero mido con el Profiler de React DevTools y a menudo corrijo la causa de fondo: bajar el estado más cerca de donde se usa, pasar children como props o dividir los contextos. El React Compiler, presentado junto con React 19, puede aplicar esta memoización automáticamente.",
    explanation:
      "La memoización consiste en conservar la identidad para ahorrar trabajo. Las respuestas avanzadas insisten en medir primero y en las soluciones estructurales, y mencionan el React Compiler.",
    tips: ["Enumera las tres causas de un nuevo renderizado.", "Explica la identidad referencial.", "Insiste en perfilar antes de optimizar."],
    commonMistakes: ["Envolverlo todo en useMemo y useCallback por defecto.", "Usar memo en un componente que recibe una prop de objeto nueva en cada renderizado."],
    followUpQuestions: ["¿Cómo provoca el contexto renderizados innecesarios?", "¿Qué cambia el React Compiler?"],
  },
  'fe-024': {
    question: "Explica el renderizado en el servidor, la generación estática y los React Server Components.",
    intent: "El entrevistador comprueba conocimientos avanzados sobre las estrategias de renderizado modernas de React y sus ventajas e inconvenientes.",
    expectedAnswer:
      "Con el renderizado en el cliente, el navegador descarga el JavaScript y construye la página, lo que puede hacer lenta la primera visualización y es débil para el SEO. El renderizado en el servidor (SSR) genera el HTML en el servidor en cada petición, así que el contenido aparece rápido; después, la hidratación conecta React a ese HTML para hacerlo interactivo. La generación estática renderiza las páginas en tiempo de build, ideal para contenido que cambia poco; la regeneración incremental las actualiza periódicamente. Los React Server Components van más allá: algunos componentes se ejecutan solo en el servidor, pueden acceder directamente a bases de datos o API y envían un resultado serializado en lugar de su código, de modo que no añaden JavaScript al bundle del cliente. Los componentes de cliente, marcados con \"use client\", se encargan de la interactividad y el estado. Frameworks como el App Router de Next.js combinan todo esto con streaming y Suspense para que partes de la página lleguen de forma progresiva. Entre los inconvenientes están los costes y la complejidad del servidor, la necesidad de separar con cuidado el código de servidor y el de cliente, los errores de hidratación (hydration mismatch) y un comportamiento de caché que hay que entender. La elección depende de las necesidades de SEO, de la frescura de los datos y de lo interactiva que sea la página.",
    explanation:
      "Cada estrategia equilibra la velocidad de la primera carga, la interactividad, la frescura y el coste. Los candidatos avanzados explican la hidratación y lo que los Server Components eliminan del bundle.",
    tips: ["Compara las estrategias según cuándo se genera el HTML.", "Explica la hidratación.", "Explica lo que los Server Components envían al cliente."],
    commonMistakes: ["Pensar que el SSR elimina la necesidad de JavaScript en el cliente.", "Importar código exclusivo del servidor en componentes de cliente."],
    followUpQuestions: ["¿Qué provoca un error de hidratación?", "¿Cómo elegirías una estrategia para la página de producto de un e-commerce?"],
  },
  'fe-025': {
    question: "¿Cómo estructurarías un código React de gran tamaño para que siga siendo mantenible?",
    intent: "El entrevistador evalúa tu criterio de arquitectura para aplicaciones frontend desarrolladas por varios equipos.",
    expectedAnswer:
      "Organizaría el código por funcionalidad y no por tipo técnico: una carpeta features/checkout que contenga sus componentes, hooks, llamadas a la API y tests, con un index público desde el que importan las demás funcionalidades, en lugar de carpetas globales de components, hooks y services que crecen sin límite. La interfaz compartida y genérica va a un design system con componentes documentados, idealmente en Storybook. Separaría el estado del servidor, gestionado por una librería de carga de datos como TanStack Query, del estado local de la interfaz y del poco estado de cliente realmente global. Los componentes seguirían una división clara: los componentes de presentación reciben los datos a través de props, mientras que los componentes contenedores o los hooks se encargan de los datos y los efectos secundarios. Haría cumplir los límites con reglas de lint, por ejemplo prohibiendo importar elementos internos de otra funcionalidad, usaría TypeScript en modo strict y una convención de carpetas coherente. Los tests se centrarían en el comportamiento del usuario con Testing Library y no en los detalles de implementación. A medida que la aplicación crece, el code splitting por rutas mantiene los bundles pequeños y, si los equipos necesitan publicar de forma independiente, puede ayudar un monorepo con paquetes o, en casos poco frecuentes, los micro-frontends.",
    explanation:
      "La mantenibilidad nace de unos límites claros, un design system compartido, categorías de estado explícitas y convenciones que se hacen cumplir. Las respuestas avanzadas mencionan herramientas que imponen la estructura.",
    tips: ["Describe la organización por funcionalidades.", "Distingue el estado del servidor del estado del cliente.", "Menciona cómo se hacen cumplir los límites."],
    commonMistakes: ["Meterlo todo en un store global.", "Saltar a los micro-frontends sin una razón organizativa."],
    followUpQuestions: ["¿Cuándo están justificados los micro-frontends?", "¿Cómo evitas que el design system se convierta en un cuello de botella?"],
  },
};
