import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de frontend 026-050: React Native, HTML y CSS, gestión del estado, rendimiento. */
export const esB: TextTable<QuestionText> = {
  'fe-026': {
    question: "¿Qué es React Native y en qué se diferencia de crear un sitio web con React?",
    intent: "El entrevistador comprueba que entiendes qué renderiza React Native y qué cambia respecto a la web.",
    expectedAnswer:
      "React Native usa el mismo modelo de React, con componentes, props, estado y hooks, pero renderiza vistas nativas reales en lugar de elementos HTML. Se usan componentes como View, Text, Image y ScrollView, y los estilos son objetos JavaScript con un subconjunto de CSS, maquetados con Flexbox por defecto en dirección de columna. No hay DOM ni cascada de CSS. Las funciones de la plataforma, como la cámara o las notificaciones, se usan a través de módulos nativos. Un único código base puede apuntar a Android e iOS, con código específico de cada plataforma cuando hace falta mediante Platform.OS o archivos .android.js / .ios.js. Herramientas como Expo simplifican la compilación, las actualizaciones y el acceso a las API del dispositivo.",
    explanation:
      "Los conocimientos de React se transfieren, pero el destino del renderizado, los estilos y la integración con la plataforma son distintos. Conocer estas diferencias evita aplicar supuestos de la web al código móvil.",
    tips: ["Menciona las vistas nativas y la ausencia del DOM.", "Explica cómo se gestionan las diferencias entre plataformas."],
    commonMistakes: ["Describir React Native como un framework basado en WebView.", "Esperar funciones de CSS como la cascada o los diseños con grid."],
    followUpQuestions: ["¿Cómo compartirías código entre una aplicación web con React y una aplicación con React Native?", "¿Qué aporta Expo?"],
  },
  'fe-027': {
    question: "¿Qué cambia la «nueva arquitectura» de React Native?",
    intent: "El entrevistador comprueba si tus conocimientos sobre el funcionamiento interno de React Native están al día y si entiendes su impacto en el rendimiento.",
    expectedAnswer:
      "La arquitectura antigua comunicaba JavaScript y el código nativo mediante un puente (bridge) asíncrono que serializaba los mensajes en JSON, lo que añadía latencia e impedía las llamadas síncronas. La nueva arquitectura, activada por defecto desde React Native 0.76, lo sustituye por JSI, la JavaScript Interface, que permite a JavaScript mantener referencias directas a objetos C++ y llamar a métodos nativos de forma síncrona. Sobre JSI, los TurboModules cargan los módulos nativos de forma diferida y con interfaces tipadas generadas por Codegen, y Fabric es el nuevo renderizador, compatible con las funciones concurrentes de React y con un layout más coherente. El resultado es un mejor tiempo de arranque, interacciones más fluidas y menos costes de serialización, pero las librerías deben ser compatibles, lo cual importa al actualizar.",
    explanation:
      "La eliminación del puente JSON es el cambio central. Conocerlo explica las mejoras de rendimiento y por qué la compatibilidad de las librerías importa durante las actualizaciones.",
    tips: ["Explica primero el problema del puente.", "Nombra JSI, TurboModules, Fabric y Codegen."],
    commonMistakes: ["Presentar el puente como el principal mecanismo de comunicación en las versiones recientes."],
    followUpQuestions: ["¿Cómo comprobarías la compatibilidad de una librería con la nueva arquitectura?", "¿Qué es Hermes?"],
  },
  'fe-028': {
    question: "¿Cómo renderizas listas largas de forma eficiente en React Native?",
    intent: "El entrevistador comprueba tus habilidades prácticas de rendimiento en móvil, donde las listas largas son habituales.",
    expectedAnswer:
      "Usaría FlatList o SectionList, o una alternativa más rápida como FlashList, en lugar de recorrer los elementos con map dentro de un ScrollView, porque estos componentes virtualizan: solo renderizan los elementos cercanos a la zona visible y reciclan o desmontan los demás. Las buenas prácticas incluyen proporcionar un keyExtractor estable, mantener renderItem ligero y envolver los componentes de cada elemento en React.memo, pasar callbacks estables y usar getItemLayout cuando los elementos tienen una altura fija para que la lista pueda omitir la medición. Props como initialNumToRender, windowSize y maxToRenderPerBatch ajustan el equilibrio entre memoria y zonas en blanco durante un desplazamiento rápido. Las imágenes deben tener el tamaño correcto y almacenarse en caché. Mediría con el monitor de rendimiento y con profiling para ver si es el hilo de JavaScript o el hilo de UI el que pierde fotogramas.",
    explanation:
      "La virtualización es la idea clave. El resto consiste en reducir el coste de cada elemento y evitar re-renderizados innecesarios.",
    tips: ["Explica la virtualización.", "Menciona los elementos memoizados y getItemLayout.", "Nombra FlashList como opción."],
    commonMistakes: ["Renderizar cientos de elementos en un ScrollView.", "Crear nuevas funciones y objetos en línea para cada elemento en cada renderizado."],
    followUpQuestions: ["¿Qué provoca zonas en blanco al desplazarse rápido?", "¿Cómo implementarías una carga infinita?"],
  },
  'fe-029': {
    question: "¿Cómo gestionas la navegación y los deep links en una aplicación React Native?",
    intent: "El entrevistador comprueba tus conocimientos de los patrones de navegación móvil y de la integración con el sistema operativo.",
    expectedAnswer:
      "La mayoría de las aplicaciones usan React Navigation, o Expo Router, que se basa en ella con un enrutamiento basado en archivos. Los navegadores se combinan: un stack navigator para las pantallas de detalle, pestañas para las secciones principales y a veces un drawer. Cada pantalla recibe parámetros de ruta tipados, y un estado como la autenticación decide qué grupo de pantallas se muestra. Los deep links abren una pantalla concreta a partir de una URL, ya sea con un esquema personalizado como myapp://order/42 o con un dominio web verificado mediante Android App Links e iOS Universal Links. La librería de navegación asocia las rutas de la URL a las pantallas; con Expo Router, la estructura de archivos define esa asociación automáticamente. También gestionaría los enlaces que llegan cuando la aplicación está cerrada o el usuario no ha iniciado sesión, por ejemplo guardando el destino y navegando después del inicio de sesión.",
    explanation:
      "La estructura de navegación y los deep links afectan a la experiencia de usuario y a las campañas de marketing. Los casos límite, como los arranques en frío y la autenticación, son donde suelen aparecer los errores.",
    tips: ["Menciona los navegadores de tipo stack y de pestañas.", "Distingue los esquemas personalizados de los enlaces verificados.", "Gestiona el caso del usuario sin sesión iniciada."],
    commonMistakes: ["Pasar objetos grandes como parámetros de navegación en lugar de ID.", "Ignorar los deep links que llegan durante un arranque en frío."],
    followUpQuestions: ["¿Cómo verificas los Android App Links?", "¿Cómo tiparías los parámetros de navegación?"],
  },
  'fe-030': {
    question: "¿Qué opciones de almacenamiento local usarías en una aplicación móvil y para qué datos?",
    intent: "El entrevistador comprueba tu diseño offline-first y tu conciencia de la seguridad en móvil.",
    expectedAnswer:
      "Para preferencias pequeñas de tipo clave-valor, como el tema o el estado del onboarding, AsyncStorage es sencillo y asíncrono, mientras que MMKV es mucho más rápido y síncrono. Para datos estructurados que necesitan consultas, relaciones o grandes volúmenes, como contenido offline o un historial, la opción adecuada es SQLite, mediante expo-sqlite o una librería como WatermelonDB o Drizzle, con migraciones para hacer evolucionar el esquema. Los datos sensibles, como los tokens de autenticación, deben ir a un almacenamiento seguro respaldado por el Android Keystore o el iOS Keychain, por ejemplo expo-secure-store, nunca a AsyncStorage sin cifrar. Los archivos grandes van al sistema de archivos y en la base de datos solo se guardan sus rutas. También pensaría en las copias de seguridad, en el borrado de datos cuando el usuario cierra sesión y en qué ocurre si falla una migración.",
    explanation:
      "La clave es elegir el almacenamiento según el tipo, el volumen y la sensibilidad de los datos. Mencionar el almacenamiento seguro para los tokens es imprescindible.",
    tips: ["Separa preferencias, datos estructurados, secretos y archivos.", "Menciona las migraciones de SQLite.", "Insiste en el almacenamiento seguro para los tokens."],
    commonMistakes: ["Guardar tokens en AsyncStorage.", "Guardar grandes bloques JSON en un almacenamiento clave-valor y parsearlos en cada arranque."],
    followUpQuestions: ["¿Cómo sincronizarías los datos locales con un servidor?", "¿Cómo pruebas las migraciones de la base de datos?"],
  },
  'fe-031': {
    question: "Una pantalla de React Native da tirones durante las animaciones y el desplazamiento. ¿Cómo lo investigas y lo corriges?",
    intent: "El entrevistador evalúa tu capacidad avanzada para diagnosticar problemas de rendimiento en móvil y tu conocimiento de los hilos en React Native.",
    expectedAnswer:
      "React Native tiene un hilo de JavaScript, donde se ejecutan React y la lógica de negocio, y un hilo de UI, donde se dibujan las vistas nativas; se pierden fotogramas cuando cualquiera de los dos tarda más de unos 16 milisegundos a 60 fotogramas por segundo. Primero abriría el monitor de rendimiento para ver qué tasa de fotogramas cae y después haría profiling con el React DevTools Profiler, el profiling de Hermes o las herramientas que sustituyen a Flipper y los profilers nativos de Android Studio. Si el hilo de JavaScript está saturado, las causas incluyen re-renderizados pesados, grandes actualizaciones de estado durante el desplazamiento, parseo síncrono de JSON o cálculos costosos; las soluciones son la memoización, acercar el estado a donde se usa, InteractionManager o diferir el trabajo, y dividir las actualizaciones grandes. Para las animaciones usaría React Native Reanimated, cuyos worklets ejecutan las animaciones en el hilo de UI, y los gestos con Gesture Handler, para que las animaciones sigan fluidas aunque JavaScript esté ocupado; la API Animated integrada con useNativeDriver también ayuda con las propiedades compatibles. En el hilo de UI, las causas incluyen el overdraw, las imágenes grandes, las sombras y el exceso de vistas; las soluciones son aplanar las jerarquías de vistas, redimensionar las imágenes y almacenarlas en caché. Siempre probaría en un dispositivo Android de gama baja con una build de release, porque las builds de desarrollo son mucho más lentas.",
    explanation:
      "Identificar qué hilo está sobrecargado determina la solución. Los candidatos avanzados conocen los worklets de Reanimated e insisten en usar builds de release en dispositivos reales de gama baja.",
    tips: ["Explica los dos hilos y el presupuesto por fotograma.", "Menciona Reanimated y las animaciones con native driver.", "Prueba en modo release en dispositivos de gama baja."],
    commonMistakes: ["Medir el rendimiento en modo de desarrollo.", "Ejecutar animaciones con setState en el hilo de JavaScript."],
    followUpQuestions: ["¿Qué es un worklet?", "¿Cómo reducirías el tiempo de arranque de la aplicación?"],
  },
  'fe-032': {
    question: "¿Cómo configurarías el proceso de compilación y publicación de una aplicación React Native?",
    intent: "El entrevistador evalúa si asumes, con nivel senior, la responsabilidad de la entrega móvil: entornos, firma, actualizaciones y riesgos.",
    expectedAnswer:
      "Usaría Expo con EAS Build, o un pipeline de CI con Fastlane para proyectos bare, para que las builds sean reproducibles y las claves de firma se guarden de forma segura y no en el portátil de un desarrollador. Definiría perfiles de build para desarrollo, preview y producción con identificadores de aplicación, configuración y endpoints de API distintos, inyectados mediante variables de entorno, sin secretos escritos a fuego en el bundle. Cada merge ejecutaría la comprobación de tipos, las pruebas y una build del bundle de JavaScript; las versiones se etiquetarían y versionarían, con los version codes incrementados automáticamente. Para la distribución, los canales de pruebas internas y los despliegues escalonados en Google Play, y TestFlight en iOS, permiten publicar para un porcentaje de usuarios y vigilar la tasa de fallos con herramientas como Sentry o Crashlytics antes de ir más allá. Las actualizaciones over-the-air, como EAS Update, permiten enviar correcciones de JavaScript sin revisión de la tienda, pero solo para código nativo compatible, así que versionaría los runtimes con cuidado y tendría en cuenta las políticas de las tiendas. También planificaría una estrategia de rollback y una versión mínima soportada de la aplicación para los cambios incompatibles de la API.",
    explanation:
      "Las versiones móviles no se pueden revertir al instante, por lo que los despliegues escalonados, la monitorización y un uso prudente de las OTA son esenciales. Esta respuesta demuestra una visión de la entrega de principio a fin.",
    tips: ["Cubre entornos, firma, CI, distribución y monitorización.", "Explica los límites de las actualizaciones over-the-air.", "Menciona los despliegues escalonados."],
    commonMistakes: ["Guardar las claves de firma o los secretos de API en el repositorio.", "Usar actualizaciones OTA para cambiar el comportamiento nativo."],
    followUpQuestions: ["¿Cómo obligas a los usuarios a actualizar cuando una API deja de ser compatible?", "¿Qué incluirías en una checklist de publicación?"],
  },
  'fe-033': {
    question: "¿Qué es el HTML semántico y por qué es importante?",
    intent: "El entrevistador comprueba fundamentos web que afectan a la accesibilidad, al SEO y a la mantenibilidad.",
    expectedAnswer:
      "El HTML semántico consiste en usar elementos que describen el significado del contenido, como header, nav, main, article, section, button, de h1 a h6 y label, en lugar de div y span genéricos por todas partes. Los lectores de pantalla se apoyan en estos elementos para anunciar la estructura y permitir a los usuarios navegar por encabezados o landmarks. Un button real puede recibir el foco y funciona con el teclado por defecto, mientras que un div clicable no. Los motores de búsqueda entienden mejor la página y otros desarrolladores leen la estructura con más facilidad.",
    explanation:
      "La semántica aporta significado y comportamiento integrado sin coste. Muchos problemas de accesibilidad vienen de reconstruir elementos nativos con divs.",
    tips: ["Pon el ejemplo de un button frente a un div clicable.", "Menciona los lectores de pantalla y la navegación con teclado."],
    commonMistakes: ["Usar los encabezados por su tamaño en lugar de por su estructura.", "Construir botones y enlaces con divs."],
    followUpQuestions: ["¿Cuándo deberías usar un enlace en lugar de un botón?", "¿Qué son los landmarks de ARIA?"],
  },
  'fe-034': {
    question: "¿Qué fundamentos de accesibilidad web aplicas en todos tus proyectos?",
    intent: "El entrevistador comprueba si construyes interfaces que todo el mundo puede usar y si conoces las principales pautas.",
    expectedAnswer:
      "Empiezo por un HTML semántico y un orden correcto de los encabezados. Cada imagen tiene un texto alternativo, vacío si es decorativa. Cada campo de formulario tiene una etiqueta visible, y los errores se describen con texto, no solo con color. El texto y los controles cumplen las relaciones de contraste de color de WCAG, al menos 4,5:1 para el texto normal. Todo funciona con el teclado, con un indicador de foco visible y un orden de tabulación lógico, y el foco se gestiona en los diálogos. Las zonas táctiles son lo bastante grandes. Uso atributos ARIA solo cuando los elementos nativos no bastan, y pruebo con un lector de pantalla y con herramientas automáticas como axe o Lighthouse.",
    explanation:
      "La accesibilidad forma parte de la calidad y, en muchos países, es una obligación legal. La mayoría de los problemas se evitan con unos pocos hábitos constantes.",
    tips: ["Menciona WCAG y el contraste.", "Cubre el teclado, las etiquetas, el texto alternativo y las pruebas."],
    commonMistakes: ["Eliminar el contorno de foco sin sustituirlo.", "Usar ARIA para parchear elementos que deberían ser simplemente nativos."],
    followUpQuestions: ["¿Cómo haces accesible un diálogo modal?", "¿Cuál es la primera regla de ARIA?"],
  },
  'fe-035': {
    question: "Explica el modelo de caja de CSS y box-sizing.",
    intent: "El entrevistador comprueba una base del layout que explica muchas sorpresas con los tamaños.",
    expectedAnswer:
      "Cada elemento es una caja formada por el contenido, el padding, el borde y el margin. Con el valor por defecto box-sizing: content-box, el ancho que defines se aplica solo al contenido, así que añadir padding o un borde hace que el elemento sea más ancho de lo esperado: una caja de 200px con 20px de padding pasa a medir 240px de ancho. Con box-sizing: border-box, el ancho incluye el padding y el borde, lo que resulta más fácil de razonar, por eso muchos proyectos lo aplican de forma global. Los márgenes quedan fuera de la caja y los márgenes verticales entre bloques pueden colapsar en uno solo.",
    explanation:
      "Entender qué partes cuentan en el ancho explica los layouts que se desbordan y por qué border-box es un reset habitual.",
    tips: ["Da un ejemplo con números.", "Menciona el colapso de márgenes."],
    commonMistakes: ["Olvidar el padding al calcular los anchos.", "Confundir padding y margin."],
    followUpQuestions: ["¿Cuándo colapsan los márgenes?", "¿Cuál es la diferencia entre display block e inline-block?"],
  },
  'fe-036': {
    question: "¿Cuándo usarías Flexbox y cuándo CSS Grid?",
    intent: "El entrevistador comprueba tus habilidades de maquetación y tu capacidad para elegir la herramienta adecuada.",
    expectedAnswer:
      "Flexbox es unidimensional: organiza los elementos a lo largo de una fila o una columna y reparte el espacio entre ellos, lo que es ideal para barras de navegación, barras de herramientas, centrar contenido o alinear elementos en una tarjeta. Grid es bidimensional: define filas y columnas a la vez, de modo que los elementos se pueden colocar en ambas direcciones, lo que encaja con layouts de página, dashboards y galerías. Funciones de Grid como grid-template-areas, las unidades fr y repeat(auto-fill, minmax(200px, 1fr)) crean layouts responsive con muy poco código. Funcionan bien juntos: Grid para el layout general y Flexbox dentro de los componentes. La propiedad gap funciona en ambos.",
    explanation:
      "La distinción entre unidimensional y bidimensional es la forma más clara de elegir.",
    example: ".gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }",
    tips: ["Enuncia la regla de unidimensional frente a bidimensional.", "Muestra un ejemplo de Grid responsive."],
    commonMistakes: ["Anidar contenedores flex para simular una cuadrícula.", "Usar floats para maquetar en código nuevo."],
    followUpQuestions: ["¿Cómo centrarías un elemento horizontal y verticalmente?", "¿Qué es subgrid?"],
  },
  'fe-037': {
    question: "¿Cómo construyes una interfaz responsive?",
    intent: "El entrevistador comprueba técnicas prácticas para adaptarse a distintos tamaños de pantalla y a las preferencias del usuario.",
    expectedAnswer:
      "Diseño con enfoque mobile-first: estilos base para pantallas pequeñas y después media queries con min-width para adaptarlos a las más grandes. Uso layouts fluidos con Flexbox y Grid, unidades relativas como rem, % y las unidades de viewport, y funciones como clamp() para una tipografía que escala con suavidad. Las container queries permiten que un componente se adapte al espacio del que realmente dispone y no a toda la pantalla, lo que es mejor para los componentes reutilizables. Las imágenes usan fuentes responsive con srcset y sizes para que las pantallas pequeñas descarguen archivos más ligeros. Respeto las preferencias del usuario, como el tamaño de letra, prefers-reduced-motion y prefers-color-scheme, y pruebo en dispositivos reales y en distintas orientaciones, no solo redimensionando el navegador.",
    explanation:
      "El diseño responsive consiste en layouts fluidos, en adaptar los componentes a su contexto y en respetar las preferencias del usuario, no solo en unos cuantos breakpoints.",
    tips: ["Menciona el enfoque mobile-first y las container queries.", "Incluye las imágenes responsive y las preferencias del usuario."],
    commonMistakes: ["Usar anchos fijos en píxeles por todas partes.", "Ignorar el tamaño de letra configurado por el usuario al usar px para el texto."],
    followUpQuestions: ["¿Cuál es la diferencia entre rem y em?", "¿Cómo funcionan las container queries?"],
  },
  'fe-038': {
    question: "¿Cómo organizarías el CSS de una aplicación grande en la que trabajan varios equipos?",
    intent: "El entrevistador evalúa tu dominio avanzado de la arquitectura frontend: control de la especificidad, design tokens y coherencia a gran escala.",
    expectedAnswer:
      "Los principales riesgos a gran escala son los estilos globales que entran en conflicto, las guerras de especificidad y un diseño incoherente. Empezaría por los design tokens, variables con nombre para colores, espaciados, tipografía y radios, definidas una sola vez, por ejemplo como CSS custom properties, y usadas en todas partes, lo que además facilita temas como el modo oscuro. Los estilos de los componentes deberían estar acotados, con CSS Modules, un enfoque utility-first como Tailwind o una solución CSS-in-JS sin coste en tiempo de ejecución, para que los estilos no se filtren entre componentes. Mantendría una especificidad baja y plana, evitaría !important y los ID en los selectores, y usaría cascade layers para controlar el orden entre reset, base, componentes y utilidades. Una librería de componentes compartida en Storybook documentaría el uso y los estados. El linting con Stylelint y las pruebas de regresión visual detectan los problemas pronto. La herramienta elegida importa menos que tener un enfoque único y coherente que los equipos acuerden y hagan cumplir.",
    explanation:
      "Un CSS escalable se apoya en tokens, en estilos acotados, en una especificidad controlada y en componentes compartidos. Los candidatos avanzados conocen herramientas modernas como las cascade layers.",
    tips: ["Parte de los problemas: filtraciones, especificidad, incoherencia.", "Menciona los design tokens y las cascade layers.", "Incluye las herramientas y las pruebas visuales."],
    commonMistakes: ["Mezclar varios enfoques de estilos sin reglas.", "Resolver los conflictos añadiendo !important."],
    followUpQuestions: ["¿Qué son las cascade layers?", "¿Cómo implementarías el modo oscuro con tokens?"],
  },
  'fe-039': {
    question: "¿Cómo decides si un estado debe ser local o global?",
    intent: "El entrevistador comprueba un criterio básico pero importante de la gestión del estado.",
    expectedAnswer:
      "Mantengo el estado lo más local posible: si un solo componente usa un valor, como si un desplegable está abierto, ese valor pertenece a ese componente. Si lo necesitan unos pocos componentes cercanos, lo subo a su ancestro común más próximo. El estado global es para datos que realmente necesitan muchas partes alejadas de la aplicación, como el usuario autenticado, el tema o un carrito de compra. Los datos que vienen del servidor suelen gestionarse mejor con una librería de obtención de datos y caché que con un store global. Mantener el estado local hace que los componentes sean más fáciles de entender y evita re-renderizados innecesarios.",
    explanation:
      "Abusar del estado global es una causa frecuente de complejidad. Empezar en local y subir el estado solo cuando hace falta mantiene el diseño sencillo.",
    tips: ["Da un ejemplo de cada caso.", "Menciona el estado del servidor como una categoría aparte."],
    commonMistakes: ["Poner todos los valores en un store global.", "Duplicar los datos del servidor en el estado global."],
    followUpQuestions: ["¿Qué es el prop drilling y cómo lo evitas?", "¿Dónde guardarías el estado de un formulario?"],
  },
  'fe-040': {
    question: "¿Para qué sirve la Context API de React y cuáles son sus límites?",
    intent: "El entrevistador comprueba si entiendes Context como un mecanismo de inyección de dependencias más que como un gestor de estado completo.",
    expectedAnswer:
      "Context transmite un valor a través del árbol de componentes sin prop drilling, lo que es ideal para valores que se leen en muchos sitios y cambian poco, como el tema, el usuario actual, el idioma o instancias de servicios. Su límite es el rendimiento: todo componente que usa un contexto se vuelve a renderizar cuando su valor cambia, aunque solo use una parte, y pasar un objeto nuevo como value en cada renderizado provoca el re-renderizado de todos los consumidores. Las mitigaciones son dividir los contextos por responsabilidad, memoizar el valor y separar el estado y el dispatch en dos contextos. Para un estado complejo o que cambia con frecuencia, suele ser mejor una librería dedicada como Zustand, Redux Toolkit o Jotai, porque los consumidores pueden suscribirse a porciones concretas.",
    explanation:
      "Context resuelve el prop drilling, no el rendimiento de la gestión del estado. Saber cuándo pasar a un store demuestra experiencia práctica.",
    tips: ["Nombra buenos casos de uso.", "Explica el problema de los re-renderizados y sus mitigaciones."],
    commonMistakes: ["Meter un objeto grande que cambia con frecuencia en un único contexto.", "Crear el objeto value en línea sin memoización."],
    followUpQuestions: ["¿Cómo evitan los selectores de Zustand o Redux los re-renderizados?", "¿Cómo probarías un componente que usa un contexto?"],
  },
  'fe-041': {
    question: "¿Cómo elegirías entre Redux Toolkit, Zustand y otras librerías de estado?",
    intent: "El entrevistador comprueba tu capacidad para evaluar herramientas según las necesidades del proyecto y no por costumbre.",
    expectedAnswer:
      "Empezaría por enumerar lo que necesita la aplicación: cuánto estado de cliente compartido hay, cuántos desarrolladores trabajan en ella y si necesitamos patrones estrictos, herramientas de depuración, middleware o persistencia. Redux Toolkit encaja bien en aplicaciones y equipos grandes: ofrece una estructura predecible con slices y reducers, unas DevTools excelentes con depuración time-travel y RTK Query para los datos del servidor, a costa de más conceptos. Zustand es pequeño y sencillo: un store es un hook, los componentes seleccionan solo las porciones que necesitan y hay poco boilerplate, lo que conviene a aplicaciones pequeñas y medianas. Las librerías atómicas como Jotai encajan con un estado formado por muchas piezas independientes. En muchas aplicaciones, una librería de estado del servidor junto con el estado local elimina la mayor parte de la necesidad de un store global. También tendría en cuenta los conocimientos actuales del equipo y el mantenimiento a largo plazo de la librería.",
    explanation:
      "No existe una librería mejor en todos los casos. Los entrevistadores buscan decisiones basadas en criterios y la conciencia de que el estado del servidor cambia el panorama.",
    tips: ["Parte de los requisitos.", "Da un caso de uso adecuado para cada librería.", "Menciona las librerías de estado del servidor."],
    commonMistakes: ["Elegir una librería porque es popular.", "Añadir un store global a una aplicación pequeña que no lo necesita."],
    followUpQuestions: ["¿Cómo persistes una parte del estado?", "¿Cómo migrarías de una librería a otra?"],
  },
  'fe-042': {
    question: "¿Cuál es la diferencia entre el estado del servidor y el estado del cliente, y cómo gestionas el estado del servidor?",
    intent: "El entrevistador comprueba si conoces las prácticas modernas de obtención de datos y eres consciente de la caché.",
    expectedAnswer:
      "El estado del cliente pertenece a la UI y solo vive en la aplicación, como un modal abierto o una pestaña seleccionada. El estado del servidor es una copia en caché de datos que pertenecen al servidor: puede quedarse desactualizado, otros usuarios pueden cambiarlo y hay que obtenerlo, almacenarlo en caché, refrescarlo e invalidarlo. Gestionarlo a mano con useEffect y stores globales provoca peticiones duplicadas, condiciones de carrera y datos obsoletos. Librerías como TanStack Query, SWR o RTK Query se encargan de la caché por clave de consulta, de la deduplicación de peticiones simultáneas, del refetch en segundo plano, de los reintentos, de la paginación y de la invalidación tras las mutaciones. Por ejemplo, después de crear un comentario, invalidar la consulta de comentarios desencadena un refetch para que la lista siga siendo correcta.",
    explanation:
      "Separar los dos tipos de estado simplifica el código enormemente. Las librerías de estado del servidor resuelven problemas que, de otro modo, la mayoría de los equipos vuelven a implementar mal.",
    tips: ["Define claramente los dos tipos.", "Enumera lo que gestiona una librería de estado del servidor.", "Da un ejemplo de invalidación."],
    commonMistakes: ["Copiar los datos obtenidos en un store global y sincronizarlos a mano.", "Obtener los mismos datos en varios componentes sin caché."],
    followUpQuestions: ["¿Qué es stale-while-revalidate?", "¿Cómo gestionarías la paginación con una librería de consultas?"],
  },
  'fe-043': {
    question: "¿Cómo implementas las actualizaciones optimistas y cómo gestionas los fallos?",
    intent: "El entrevistador evalúa tu dominio avanzado de la UX y de la coherencia de los datos en el cliente.",
    expectedAnswer:
      "Una actualización optimista muestra el resultado esperado de inmediato, antes de que el servidor lo confirme, para que la aplicación parezca instantánea, por ejemplo al marcar una tarea como hecha o al añadir un «me gusta». Los pasos son: cancelar las consultas en curso sobre los mismos datos para que no sobrescriban el cambio, guardar una instantánea del estado actual, aplicar el cambio en local, enviar la petición y, en caso de error, restaurar la instantánea y mostrar un mensaje claro; en caso de éxito o al terminar, hacer un refetch o conciliar con la respuesta del servidor para sustituir los datos temporales, como un ID generado en el cliente. Con TanStack Query esto corresponde a onMutate, onError y onSettled; React 19 ofrece useOptimistic para flujos similares. Es adecuado cuando la tasa de éxito es alta y la acción es fácil de revertir. Para acciones críticas como los pagos, mostraría en su lugar un estado pendiente. También gestionaría las ediciones concurrentes, por ejemplo con números de versión, y haría la operación idempotente para que los reintentos sean seguros.",
    explanation:
      "La UI optimista necesita un plan de rollback, una conciliación y una elección cuidadosa de cuándo usarla. Las respuestas avanzadas cubren la concurrencia y la idempotencia.",
    tips: ["Describe la instantánea, la aplicación, el rollback y la conciliación.", "Di cuándo no usar actualizaciones optimistas.", "Menciona la concurrencia y la idempotencia."],
    commonMistakes: ["No revertir el cambio en caso de fallo.", "Usar actualizaciones optimistas para acciones irreversibles o de alto riesgo."],
    followUpQuestions: ["¿Cómo gestionarías una actualización optimista sin conexión?", "¿Qué ocurre si dos actualizaciones optimistas se solapan?"],
  },
  'fe-044': {
    question: "¿Cómo diseñarías el estado y la sincronización de una aplicación móvil offline-first?",
    intent: "El entrevistador evalúa tus habilidades avanzadas de arquitectura para aplicaciones que deben funcionar sin conexión.",
    expectedAnswer:
      "Haría que la base de datos local fuera la fuente de verdad de la UI, por ejemplo SQLite, para que cada pantalla lea datos locales y funcione igual con o sin conexión. Las acciones del usuario escriben de inmediato en la base de datos local y añaden una entrada a una cola outbox que describe el cambio. Un motor de sincronización envía los cambios en cola cuando vuelve la conexión, en orden, con reintentos y backoff, y cada cambio lleva un ID único para que el servidor pueda procesarlo de forma idempotente. Para recibir actualizaciones, la aplicación descarga los cambios desde su último cursor o marca de tiempo de sincronización. Los conflictos necesitan una estrategia explícita elegida según el tipo de dato: last-write-wins con marcas de tiempo del servidor para campos simples, fusión a nivel de campo o mostrar el conflicto al usuario para el contenido importante; los números de versión detectan las ediciones concurrentes. También mostraría el estado de sincronización en la UI, gestionaría las migraciones de esquema en ambos lados, limitaría el tamaño de los datos locales y probaría escenarios como el modo avión, el cierre forzado de la aplicación durante la sincronización y las diferencias de reloj entre dispositivos. Librerías como WatermelonDB o PowerSync pueden aportar parte de esto.",
    explanation:
      "Offline-first significa lecturas locales, escrituras en cola, sincronización idempotente y resolución explícita de conflictos. Los candidatos avanzados hablan de cómo probar los escenarios de fallo.",
    tips: ["Haz de la base de datos local la fuente de verdad.", "Describe la cola outbox y la sincronización idempotente.", "Explica las estrategias de resolución de conflictos."],
    commonMistakes: ["Tratar el modo sin conexión como una pantalla de error.", "Depender de los relojes de los dispositivos para ordenar los cambios."],
    followUpQuestions: ["¿Cómo sincronizarías las eliminaciones?", "¿Qué mostrarías a los usuarios mientras la sincronización está pendiente?"],
  },
  'fe-045': {
    question: "¿Cuáles son las causas más habituales de que una página web sea lenta?",
    intent: "El entrevistador comprueba tu conciencia básica del rendimiento y una primera checklist razonable.",
    expectedAnswer:
      "Las causas más habituales son las imágenes grandes y sin optimizar; el exceso de JavaScript, que hay que descargar, parsear y ejecutar antes de que la página sea interactiva; el CSS o los scripts que bloquean el renderizado en el head; demasiadas peticiones de red o respuestas lentas del servidor; las fuentes web que cargan tarde y desplazan el contenido; y los scripts de terceros, como los trackers o los widgets de chat. Entre las mejoras rápidas están comprimir y redimensionar las imágenes en formatos modernos como WebP o AVIF, cargar en diferido (lazy loading) las imágenes que quedan por debajo del pliegue, dividir el JavaScript por ruta, diferir los scripts no críticos, almacenar en caché los recursos estáticos y usar una CDN. Primero mediría con Lighthouse o con las DevTools del navegador para centrarme en el verdadero cuello de botella.",
    explanation:
      "La mayoría de los problemas de rendimiento vienen de enviar demasiado o de cargarlo en el orden equivocado. Medir primero evita las conjeturas.",
    tips: ["Enumera las causas por categorías.", "Menciona la medición con Lighthouse o las DevTools."],
    commonMistakes: ["Optimizar microdetalles del código mientras las imágenes pesan varios megabytes."],
    followUpQuestions: ["¿Qué significa «render-blocking»?", "¿Cómo cargarías las fuentes de forma eficiente?"],
  },
  'fe-046': {
    question: "¿Qué son las Core Web Vitals y cómo las mejorarías?",
    intent: "El entrevistador comprueba tus conocimientos de las métricas de rendimiento centradas en el usuario que usan Google y muchos equipos.",
    expectedAnswer:
      "Las Core Web Vitals son tres métricas medidas con usuarios reales. Largest Contentful Paint, LCP, mide la carga: el momento en que aparece el elemento visible más grande; un buen valor está por debajo de 2,5 segundos. Interaction to Next Paint, INP, que sustituyó a First Input Delay en 2024, mide la capacidad de respuesta: el retraso entre una interacción y la siguiente actualización visual; un buen valor está por debajo de 200 milisegundos. Cumulative Layout Shift, CLS, mide la estabilidad visual; un buen valor está por debajo de 0,1. Para mejorar el LCP: optimizar y precargar la imagen principal (hero), reducir el tiempo de respuesta del servidor y evitar los recursos que bloquean el renderizado. Para mejorar el INP: reducir las tareas largas de JavaScript, dividir el trabajo, evitar re-renderizados pesados y sacar los cálculos del hilo principal. Para mejorar el CLS: reservar espacio para imágenes y anuncios con width y height o aspect-ratio, y evitar insertar contenido por encima del contenido existente. Los datos de campo de usuarios reales, por ejemplo del Chrome UX Report o de una herramienta RUM, importan más que las puntuaciones de laboratorio.",
    explanation:
      "Cada métrica corresponde a una experiencia del usuario: carga, capacidad de respuesta y estabilidad. Saber que INP sustituyó a FID demuestra conocimientos actualizados.",
    tips: ["Da cada métrica con su umbral.", "Da una mejora para cada métrica.", "Distingue los datos de campo de los de laboratorio."],
    commonMistakes: ["Citar First Input Delay como una Core Web Vital actual.", "Optimizar solo para la puntuación de Lighthouse."],
    followUpQuestions: ["¿Qué es una tarea larga (long task)?", "¿Cómo encontrarías qué interacción tiene un INP deficiente?"],
  },
  'fe-047': {
    question: "¿Cómo funcionan el debouncing y el throttling, y cuándo usarías cada uno?",
    intent: "El entrevistador comprueba técnicas prácticas para gestionar eventos de alta frecuencia.",
    expectedAnswer:
      "El debouncing retrasa una función hasta que los eventos se detienen durante un tiempo determinado: cada nuevo evento reinicia el temporizador. Encaja con la búsqueda mientras se escribe, donde quieres una sola petición cuando el usuario hace una pausa, por ejemplo de 300 milisegundos, en lugar de una por cada pulsación. El throttling ejecuta una función como máximo una vez por intervalo de tiempo, sin importar cuántos eventos se produzcan. Encaja con eventos continuos como el desplazamiento, el redimensionado o el seguimiento de un arrastre, donde quieres actualizaciones regulares sin saturar el hilo principal. En React, las funciones con debounce deben mantener una identidad estable entre renderizados, usando useMemo, useRef o un hook como useDebounce, y los temporizadores deben limpiarse al desmontar. Para las actualizaciones visuales, requestAnimationFrame suele ser un mejor throttle porque se alinea con el refresco de la pantalla.",
    explanation:
      "Ambas técnicas limitan el trabajo, pero el debouncing espera a que haya calma mientras que el throttling garantiza un ritmo constante.",
    tips: ["Da un caso de uso para cada una.", "Menciona la identidad estable en React y la limpieza."],
    commonMistakes: ["Crear una nueva función con debounce en cada renderizado, lo que rompe el retraso.", "Aplicar debounce a manejadores de scroll que necesitan una respuesta continua."],
    followUpQuestions: ["¿Cómo cancelarías una petición de búsqueda pendiente cuando el usuario vuelve a escribir?", "¿Cómo implementarías debounce tú mismo?"],
  },
  'fe-048': {
    question: "¿Qué es el code splitting y cómo lo aplicarías?",
    intent: "El entrevistador comprueba tus conocimientos de optimización del bundle para acelerar la carga inicial.",
    expectedAnswer:
      "El code splitting divide el bundle de JavaScript en chunks más pequeños que solo se cargan cuando se necesitan, para que la primera página descargue menos código. La división más eficaz es por ruta: cada página es un chunk independiente, cargado con import() dinámico; en React, React.lazy con Suspense muestra un fallback mientras se carga el chunk, y frameworks como Next.js dividen por ruta automáticamente. Los componentes pesados que solo se usan a veces, como una librería de gráficos, un editor de texto enriquecido o un panel de administración, también pueden cargarse bajo demanda. Analizaría el bundle con una herramienta como un bundle analyzer para encontrar las dependencias grandes, haría prefetch de los chunks que el usuario probablemente necesitará después y evitaría dividir en tantos chunks diminutos que el coste de las peticiones supere el beneficio.",
    explanation:
      "La división reduce el coste de la primera carga. Medir el bundle muestra dónde la división tiene más efecto.",
    tips: ["Menciona la división por ruta y React.lazy.", "Habla del análisis del bundle y del prefetching."],
    commonMistakes: ["Cargar en diferido componentes que se necesitan de inmediato en la primera pantalla.", "Ignorar las librerías de terceros de gran tamaño."],
    followUpQuestions: ["¿Cómo gestionas un chunk que no se carga tras un nuevo despliegue?", "¿Qué es el tree shaking?"],
  },
  'fe-049': {
    question: "Los usuarios dicen que una interacción de tu aplicación web va lenta. ¿Cómo encuentras y corriges la causa?",
    intent: "El entrevistador evalúa tu capacidad avanzada para depurar el rendimiento en el navegador basándote en datos.",
    expectedAnswer:
      "Primero reproduciría el problema en condiciones realistas: build de producción, un dispositivo de gama media o la limitación de CPU de las DevTools, y volúmenes de datos reales. La monitorización de usuarios reales con atribución de INP puede mostrar qué interacción y qué página se ven afectadas. Después grabaría la interacción en el panel Performance y observaría el hilo principal: las tareas largas de más de 50 milisegundos, lo que contienen, como scripting, recálculo de estilos o layout, y si se produce layout thrashing, es decir, código que alterna lecturas y escrituras de propiedades de layout. Si React está implicado, el React DevTools Profiler muestra qué componentes se renderizaron, por qué y cuánto tardaron. Las soluciones típicas incluyen evitar re-renderizados innecesarios, virtualizar las listas largas, aplicar debounce a los manejadores costosos, usar startTransition o useDeferredValue para que la entrada siga respondiendo mientras se renderiza una actualización pesada, agrupar las lecturas y escrituras del DOM, simplificar los selectores CSS o las animaciones que provocan layout, y trasladar los cálculos pesados a un Web Worker. Después de la corrección, compararía las mediciones de antes y después y añadiría un presupuesto de rendimiento o monitorización para evitar regresiones.",
    explanation:
      "El método es reproducir, medir, identificar el tipo de trabajo en el hilo principal, corregir y verificar. Los candidatos avanzados conocen herramientas tanto a nivel del navegador como del framework.",
    tips: ["Insiste en las condiciones realistas.", "Explica qué buscas en una traza de rendimiento.", "Menciona las funciones concurrentes de React."],
    commonMistakes: ["Probar solo en un portátil de desarrollo potente.", "Aplicar memoización en todas partes sin hacer profiling."],
    followUpQuestions: ["¿Qué es el layout thrashing?", "¿Cómo mantiene startTransition la capacidad de respuesta de la UI?"],
  },
  'fe-050': {
    question: "¿Cómo diseñarías la estrategia de caché de una aplicación web?",
    intent: "El entrevistador evalúa tu comprensión avanzada de la caché HTTP, las CDN y los service workers, así como de sus compromisos de coherencia.",
    expectedAnswer:
      "Separaría los recursos según cómo cambian. Los recursos estáticos como JavaScript, CSS e imágenes reciben nombres de archivo con hash de contenido, por ejemplo app.3f9a2.js, y se sirven con Cache-Control: public, max-age=31536000, immutable, para que los navegadores y las CDN los conserven mucho tiempo y un nuevo despliegue simplemente haga referencia a nombres nuevos. El documento HTML no debe almacenarse en caché mucho tiempo, normalmente con no-cache, que permite reutilizarlo tras una revalidación con ETag, para que los usuarios reciban siempre las referencias a los recursos más recientes. Las respuestas de la API dependen de los datos: los datos privados del usuario usan private o no-store, mientras que los datos públicos que cambian poco pueden usar valores cortos de max-age con stale-while-revalidate en la CDN para servir rápido mientras se refrescan en segundo plano. Una CDN delante reduce la latencia y la carga del servidor, con purga explícita o invalidación por etiquetas para el contenido que debe actualizarse de inmediato. Un service worker puede añadir soporte offline y precachear el app shell, pero necesita una estrategia de actualización clara para que los usuarios no se queden atascados en una versión antigua. En el cliente, una librería de obtención de datos almacena en memoria los resultados de la API. Documentaría las reglas y verificaría las cabeceras en producción, porque una caché mal configurada puede servir datos obsoletos o privados, o bien anular todas las ventajas de la caché.",
    explanation:
      "Una buena caché combina recursos inmutables de larga duración, HTML revalidado, reglas de API específicas para cada tipo de dato e invalidación en la CDN. Las respuestas avanzadas también cubren las actualizaciones del service worker y los riesgos para la privacidad.",
    tips: ["Clasifica los recursos según cómo cambian.", "Explica el hash de contenido y la caché inmutable.", "Menciona los riesgos de almacenar en caché datos privados y las actualizaciones del service worker."],
    commonMistakes: ["Almacenar index.html en caché durante mucho tiempo, de modo que los usuarios nunca reciben la nueva versión.", "Dejar que una CDN almacene en caché respuestas personalizadas."],
    followUpQuestions: ["¿Cuál es la diferencia entre no-cache y no-store?", "¿Cómo obligarías a los clientes a actualizar un service worker?"],
  },
};
