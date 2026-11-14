import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas por puesto 031-060: ciberseguridad, finanzas, marketing, recursos humanos. */
export const esB: TextTable<QuestionText> = {
  'job-031': {
    question: "¿Qué es la tríada CIA en seguridad de la información?",
    intent: "El entrevistador comprueba que conoces el modelo fundamental que se usa para razonar sobre la seguridad.",
    expectedAnswer:
      "La tríada CIA (confidencialidad, integridad, disponibilidad) describe los tres objetivos de la seguridad de la información. La confidencialidad significa que solo las personas autorizadas pueden acceder a la información, y se protege con control de acceso, cifrado y clasificación de datos. La integridad significa que la información es exacta y no se modifica sin autorización, y se protege con permisos, sumas de verificación, firmas digitales y registros de auditoría. La disponibilidad significa que los sistemas y los datos están accesibles cuando se necesitan, y se protege con redundancia, copias de seguridad y protección contra ataques de denegación de servicio. Las decisiones de seguridad suelen equilibrar estos objetivos: por ejemplo, unos controles de acceso muy estrictos mejoran la confidencialidad, pero pueden reducir la disponibilidad para los usuarios legítimos.",
    explanation:
      "La tríada ofrece un vocabulario sencillo para clasificar amenazas y controles, y para explicar los compromisos entre ellos.",
    tips: ["Da un control para cada objetivo.", "Menciona que los objetivos pueden entrar en conflicto."],
    commonMistakes: ["Confundir la integridad con la disponibilidad."],
    followUpQuestions: ["¿Qué objetivo ataca el ransomware?", "¿Qué es el no repudio?"],
  },
  'job-032': {
    question: "¿Cuáles son los tipos de ciberataques más comunes a los que se enfrentan las organizaciones?",
    intent: "El entrevistador comprueba que conoces el panorama de amenazas actual.",
    expectedAnswer:
      "El phishing es el punto de entrada más habitual: correos o mensajes fraudulentos engañan a las personas para que entreguen sus credenciales o abran archivos maliciosos. El malware incluye virus, troyanos y programas espía instalados en los dispositivos. El ransomware cifra los datos y exige un pago, a menudo después de robar datos para amenazar con publicarlos. Los ataques de credenciales usan contraseñas filtradas o adivinadas, como el credential stuffing. Los ataques de denegación de servicio saturan un servicio con tráfico. La explotación de vulnerabilidades sin parchear en sistemas expuestos a internet es otra vía frecuente, al igual que los ataques a la cadena de suministro a través de un proveedor de confianza o de una actualización de software. La ingeniería social por teléfono, como las falsas llamadas del soporte informático, también es común. Las defensas combinan la concienciación de los usuarios, la autenticación multifactor (MFA), la aplicación de parches, las copias de seguridad y la monitorización.",
    explanation:
      "Conocer los ataques comunes ayuda a priorizar las defensas. La mayoría de los ataques exitosos explotan a las personas, credenciales débiles o parches que faltan.",
    tips: ["Describe brevemente cada ataque con una defensa.", "Menciona que el phishing es el punto de entrada más frecuente."],
    commonMistakes: ["Centrarte solo en ataques sofisticados e ignorar la higiene básica."],
    followUpQuestions: ["¿Cómo formarías a los empleados contra el phishing?", "¿Qué es el credential stuffing?"],
  },
  'job-033': {
    question: "¿Qué es un SIEM y cómo haces el triaje de las alertas de seguridad?",
    intent: "El entrevistador comprueba tus conocimientos prácticos de operaciones de seguridad.",
    expectedAnswer:
      "Un SIEM, sistema de gestión de información y eventos de seguridad, recopila registros de muchas fuentes, como cortafuegos, servidores, sistemas de identidad y equipos, los normaliza y aplica reglas de correlación para detectar actividad sospechosa, por ejemplo muchos inicios de sesión fallidos seguidos de uno exitoso desde un país inusual. Cuando llega una alerta, primero compruebo su gravedad y el activo afectado, y luego reúno contexto: ¿el usuario o el equipo son conocidos?, ¿la actividad es esperada, como un escaneo autorizado?, ¿hay eventos relacionados antes y después? Contrasto los indicadores, como direcciones IP o hashes de archivos, con la inteligencia de amenazas. Después lo clasifico como falso positivo, evento benigno o incidente real, escalo los incidentes reales según el plan de respuesta a incidentes y documento mi razonamiento. Los falsos positivos recurrentes deben servir para ajustar las reglas, porque la fatiga de alertas es un riesgo importante.",
    explanation:
      "El triaje se basa en el contexto y la evidencia, no en reaccionar ante cada alerta. Ajustar las reglas forma parte del trabajo.",
    tips: ["Describe cómo reúnes el contexto.", "Menciona la inteligencia de amenazas y la documentación.", "Habla del ajuste de los falsos positivos."],
    commonMistakes: ["Cerrar alertas sin documentar el motivo.", "Escalarlo todo sin análisis."],
    followUpQuestions: ["¿Qué es un indicador de compromiso?", "¿Cómo complementan las herramientas EDR a un SIEM?"],
  },
  'job-034': {
    question: "¿Cómo priorizas las vulnerabilidades que hay que parchear?",
    intent: "El entrevistador evalúa tu razonamiento basado en el riesgo en la gestión de vulnerabilidades.",
    expectedAnswer:
      "Siempre hay más vulnerabilidades que tiempo, así que priorizo por riesgo y no por cantidad. La puntuación CVSS da la gravedad técnica, pero también tengo en cuenta si la vulnerabilidad se está explotando activamente, con fuentes como el catálogo Known Exploited Vulnerabilities de CISA o puntuaciones de predicción de explotación como EPSS; si el sistema afectado está expuesto a internet; qué tan críticos son el activo y sus datos; y si existen controles compensatorios. Un fallo explotado activamente en un servidor expuesto a internet se parchea en pocos días, mientras que una puntuación CVSS alta en una máquina de pruebas interna y aislada puede esperar al ciclo habitual. Acuerdo los plazos de corrección con los responsables de los sistemas, les hago seguimiento y, cuando no es posible parchear, aplico mitigaciones como cambios de configuración o restricciones de red y documento el riesgo aceptado.",
    explanation:
      "Combinar gravedad, explotabilidad, exposición y valor del activo concentra el esfuerzo donde es más probable que los atacantes tengan éxito.",
    tips: ["Ve más allá del CVSS.", "Menciona las listas de vulnerabilidades explotadas conocidas.", "Explica qué hacer cuando no es posible parchear."],
    commonMistakes: ["Parchear estrictamente según la puntuación CVSS.", "Ignorar los activos que no tienen responsable."],
    followUpQuestions: ["¿Qué es EPSS?", "¿Cómo gestionas un sistema que no se puede parchear?"],
  },
  'job-035': {
    question: "¿Por qué es importante la autenticación multifactor y qué hace que unos métodos sean más sólidos que otros?",
    intent: "El entrevistador comprueba tus conocimientos de autenticación, uno de los controles de seguridad más eficaces.",
    expectedAnswer:
      "La autenticación multifactor (MFA) exige dos o más factores distintos: algo que sabes, como una contraseña; algo que tienes, como un teléfono o una llave de seguridad; y algo que eres, como una huella dactilar. Bloquea la mayoría de los ataques basados en contraseñas robadas o adivinadas, que son muy comunes. Los métodos difieren en solidez. Los códigos por SMS son mejor que nada, pero vulnerables al SIM swapping y a la interceptación. Los códigos de una aplicación de autenticación son más sólidos, y las notificaciones push son cómodas, pero pueden aprovecharse con ataques de « fatiga de MFA », que la coincidencia de números reduce. Los más sólidos son los métodos resistentes al phishing, como las llaves de seguridad FIDO2 y las passkeys, que están vinculados al sitio web real y no pueden reutilizarse en uno falso. Exigiría MFA en todas partes, sobre todo para los administradores y el acceso remoto, y pasaría a los usuarios con privilegios a métodos resistentes al phishing.",
    explanation:
      "La MFA es uno de los controles de mayor impacto. Saber que no todos los métodos resisten el phishing demuestra conocimientos actualizados.",
    tips: ["Nombra los tres tipos de factores.", "Compara SMS, aplicación, push y FIDO2.", "Menciona la fatiga de MFA."],
    commonMistakes: ["Considerar que todos los métodos de MFA son igual de sólidos.", "Eximir a los administradores por comodidad."],
    followUpQuestions: ["¿Qué son las passkeys?", "¿Cómo funciona un ataque de fatiga de MFA?"],
  },
  'job-036': {
    question: "Explícame cómo responderías a un incidente de ransomware.",
    intent: "El entrevistador evalúa tus competencias avanzadas de respuesta a incidentes y tu pensamiento estructurado bajo presión.",
    expectedAnswer:
      "Seguiría el plan de respuesta a incidentes, normalmente basado en el ciclo de vida del NIST: preparación, detección y análisis, contención, erradicación y recuperación, y lecciones aprendidas. Tras la detección, confirmaría el incidente, alertaría al equipo de respuesta a incidentes y a la dirección, y empezaría una cronología. La contención es lo primero: aislar de la red las máquinas infectadas, desactivar las cuentas comprometidas, bloquear las IP y los dominios maliciosos, y proteger las copias de seguridad desconectándolas si pudieran verse alcanzadas. Preservaría las evidencias, como imágenes de memoria y registros, antes de borrar nada. El análisis determina el punto de entrada, por ejemplo un correo de phishing o un servicio de acceso remoto expuesto, la familia de ransomware, qué sistemas están afectados y si se robaron datos. La erradicación elimina el acceso del atacante, incluidos los mecanismos de persistencia y las cuentas creadas, y cierra el punto de entrada. La recuperación restaura los sistemas a partir de copias de seguridad limpias y probadas, priorizadas según la criticidad para el negocio, con una vigilancia estrecha ante una posible reinfección. En paralelo, los equipos jurídico y de comunicación gestionan las notificaciones regulatorias, el contacto con las fuerzas de seguridad y la comunicación con las partes interesadas; la decisión de pagar un rescate corresponde a la dirección con asesoramiento jurídico, y en general se desaconseja. Por último, una revisión posterior al incidente mejora las defensas, como la MFA, los parches, la segmentación y las copias de seguridad inmutables.",
    explanation:
      "Un ciclo de vida estructurado, la contención antes de la recuperación, la preservación de evidencias y la coordinación con el área jurídica y la dirección son el núcleo de una respuesta sólida.",
    tips: ["Usa el ciclo de vida del NIST.", "Insiste en proteger las copias de seguridad y preservar las evidencias.", "Menciona los aspectos jurídicos y de comunicación."],
    commonMistakes: ["Restaurar las copias de seguridad antes de cerrar el punto de entrada.", "Borrar las máquinas antes de recopilar evidencias."],
    followUpQuestions: ["¿Cómo sabrías si se exfiltraron datos?", "¿Qué hace que una copia de seguridad resista al ransomware?"],
  },
  'job-037': {
    question: "¿Cómo harías el modelado de amenazas de una nueva aplicación web antes de su puesta en producción?",
    intent: "El entrevistador evalúa tus competencias de diseño de seguridad proactivo.",
    expectedAnswer:
      "Trabajaría con el equipo de desarrollo desde el principio, idealmente durante el diseño. Primero describimos el sistema con un diagrama de flujo de datos: usuarios, componentes, almacenes de datos, servicios externos y límites de confianza, como entre internet y la aplicación o entre la aplicación y el proveedor de pagos. Después identificamos las amenazas de cada elemento con un método como STRIDE: suplantación de identidad (spoofing), manipulación de datos (tampering), repudio, divulgación de información, denegación de servicio y elevación de privilegios. Por ejemplo, un atacante podría modificar el pedido de otro usuario cambiando un identificador en la petición, lo que es una amenaza de manipulación y de autorización. Para cada amenaza evaluamos la probabilidad y el impacto y decidimos las mitigaciones, como comprobaciones de autorización en el servidor, validación de entradas, cifrado, limitación de peticiones y registros de auditoría. Los resultados se convierten en requisitos de seguridad y casos de prueba, a los que se hace seguimiento en el backlog. El modelo se actualiza cuando la arquitectura cambia de forma significativa.",
    explanation:
      "El modelado de amenazas detecta fallos de diseño antes de que se programen. Un diagrama, un método estructurado como STRIDE y mitigaciones accionables son los elementos clave.",
    tips: ["Empieza con un diagrama de flujo de datos y los límites de confianza.", "Explica STRIDE con un ejemplo.", "Convierte las amenazas en requisitos y pruebas."],
    commonMistakes: ["Limitar la seguridad a una prueba de penetración antes del lanzamiento.", "Producir un modelo de amenazas que nunca da lugar a cambios."],
    followUpQuestions: ["¿Qué es un límite de confianza?", "¿Cómo mantienes actualizados los modelos de amenazas en equipos ágiles?"],
  },
  'job-038': {
    question: "Háblame de una ocasión en la que convenciste a personas ajenas al área de seguridad de adoptar una medida de seguridad.",
    intent: "El entrevistador evalúa tu comunicación y tu capacidad de influencia, esenciales para los profesionales de la seguridad.",
    expectedAnswer:
      "Situación: nuestro equipo comercial se resistía a la autenticación multifactor en el CRM porque temía que los ralentizara en las reuniones con clientes. Tarea: tenía que implantarla sin perjudicar la productividad ni provocar soluciones alternativas. Acción: me reuní con los responsables comerciales para entender sus preocupaciones y expliqué el riesgo con un ejemplo concreto de nuestro sector: un competidor que había perdido datos de clientes por una contraseña robada. Propuse notificaciones push de una aplicación de autenticación con coincidencia de números, que tardan unos segundos, y una opción de « recordar este dispositivo » en los portátiles de la empresa. Hice un piloto con cinco voluntarios y compartí sus comentarios. Resultado: todo el equipo adoptó la MFA en un mes, sin aumento de las solicitudes de soporte, y dos semanas después la MFA bloqueó un intento de inicio de sesión con la contraseña filtrada de un comercial.",
    explanation:
      "La adopción de la seguridad depende de entender las limitaciones de los usuarios, explicar el riesgo de forma concreta y hacer que la opción segura sea fácil.",
    tips: ["Demuestra que escuchaste las preocupaciones de los usuarios.", "Usa un ejemplo de riesgo concreto y pertinente.", "Haz que el camino seguro sea fácil."],
    commonMistakes: ["Imponer controles sin explicación.", "Recurrir al miedo y a la jerga en lugar de argumentos claros."],
    followUpQuestions: ["¿Qué haces cuando un responsable rechaza un control?", "¿Cómo mides la concienciación en seguridad?"],
  },
  'job-039': {
    question: "¿Cuáles son los tres estados financieros principales y cómo se relacionan?",
    intent: "El entrevistador comprueba tus conocimientos contables fundamentales para puestos de finanzas.",
    expectedAnswer:
      "El estado de resultados muestra los ingresos, los gastos y el beneficio de un periodo. El balance general muestra lo que la empresa posee, los activos; lo que debe, los pasivos; y el patrimonio neto en un momento dado. El estado de flujos de efectivo muestra el efectivo que entra y sale durante el periodo, dividido en actividades de operación, de inversión y de financiación. Están relacionados: el beneficio neto del estado de resultados pasa a las reservas (resultados acumulados) dentro del patrimonio neto del balance general, y es el punto de partida del estado de flujos de efectivo por el método indirecto, ajustado por partidas que no suponen salida de efectivo, como la amortización, y por las variaciones del capital de trabajo. El efectivo final del estado de flujos de efectivo coincide con el efectivo del balance general.",
    explanation:
      "Entender cómo se conectan los estados demuestra que sabes seguir el efecto de una transacción a través de las cuentas.",
    tips: ["Describe brevemente cada estado.", "Explica al menos dos vínculos entre ellos."],
    commonMistakes: ["Confundir beneficio con efectivo.", "Decir que el balance general cubre un periodo."],
    followUpQuestions: ["¿Cómo afecta la amortización a cada estado?", "¿Qué ocurre en los estados cuando una empresa compra equipos a crédito?"],
  },
  'job-040': {
    question: "¿Cómo evaluarías un proyecto de inversión? Explica el VAN y la TIR.",
    intent: "El entrevistador comprueba tus competencias de evaluación de inversiones, que se usan en el análisis financiero.",
    expectedAnswer:
      "Estimaría los flujos de caja esperados del proyecto a lo largo de su vida, incluida la inversión inicial, los flujos de caja operativos y el posible valor residual, y luego los descontaría a hoy con una tasa de descuento que refleje el coste de capital y el riesgo del proyecto. El valor actual neto, VAN (NPV), es la suma de esos flujos descontados: un VAN positivo significa que el proyecto crea valor por encima de la rentabilidad exigida. La tasa interna de retorno, TIR (IRR), es la tasa de descuento con la que el VAN es igual a cero; si es superior al coste de capital, el proyecto es atractivo. En general se prefiere el VAN para decidir, porque la TIR puede inducir a error en proyectos con flujos de caja atípicos o al comparar proyectos de distinto tamaño. Los complementaría con el periodo de recuperación, un análisis de sensibilidad de las hipótesis clave y los factores estratégicos que las cifras no recogen.",
    explanation:
      "El VAN y la TIR son herramientas estándar; conocer sus limitaciones y poner a prueba las hipótesis hace que el análisis sea creíble.",
    tips: ["Define ambos con claridad.", "Explica por qué suele preferirse el VAN.", "Menciona el análisis de sensibilidad."],
    commonMistakes: ["Ignorar el valor temporal del dinero.", "Elegir entre proyectos de distinto tamaño solo por la TIR."],
    followUpQuestions: ["¿Cómo eliges la tasa de descuento?", "¿Qué es el periodo de recuperación y cuál es su punto débil?"],
  },
  'job-041': {
    question: "¿Qué diferencia hay entre un presupuesto y una previsión, y cómo haces un análisis de desviaciones?",
    intent: "El entrevistador comprueba tus competencias de planificación y análisis financiero.",
    expectedAnswer:
      "El presupuesto es el plan financiero que se fija al inicio del año, normalmente aprobado por la dirección y usado como objetivo. La previsión (forecast) es una estimación actualizada de los resultados esperados, que se revisa con regularidad, por ejemplo cada mes o cada trimestre, a partir del desempeño real y de la nueva información. El análisis de desviaciones compara los resultados reales con el presupuesto o la previsión para explicar las diferencias. Empiezo por las desviaciones más grandes y las descompongo en sus factores: en los ingresos, los efectos volumen, precio y mix; en los costes, las diferencias de tarifa y de consumo, o de calendario. Por ejemplo, los ingresos pueden estar un 5% por debajo del presupuesto porque los volúmenes son menores en una región mientras que los precios son algo más altos. Después explico si la desviación es temporal o estructural y qué acciones o cambios en la previsión se necesitan, con un lenguaje que entiendan los responsables de negocio.",
    explanation:
      "El análisis de desviaciones convierte las cifras en explicaciones y acciones. Descomponer las desviaciones en factores es la competencia clave.",
    tips: ["Distingue con claridad el presupuesto de la previsión.", "Explica los efectos volumen, precio y mix.", "Termina con acciones."],
    commonMistakes: ["Informar de las desviaciones sin explicar sus causas.", "Tratar las diferencias de calendario como permanentes."],
    followUpQuestions: ["¿Qué es una previsión móvil (rolling forecast)?", "¿Cómo presentarías las desviaciones a un director comercial?"],
  },
  'job-042': {
    question: "¿Qué ratios financieros usarías para evaluar la salud de una empresa?",
    intent: "El entrevistador comprueba tu capacidad analítica y tu capacidad de interpretar los ratios en su contexto.",
    expectedAnswer:
      "Miraría varios grupos. Rentabilidad: el margen bruto, el margen operativo y la rentabilidad sobre el patrimonio o sobre el capital empleado muestran cómo convierte la empresa sus ingresos en beneficio. Liquidez: el ratio de liquidez corriente y la prueba ácida muestran si puede pagar sus obligaciones a corto plazo. Solvencia: la relación deuda/patrimonio y la cobertura de intereses muestran el riesgo financiero. Eficiencia: el periodo medio de cobro, la rotación de inventarios y el periodo medio de pago muestran lo bien que se gestiona el capital de trabajo. Efectivo: comparar el flujo de caja operativo con el beneficio neto muestra la calidad de los resultados. Los ratios deben compararse en el tiempo y con empresas del mismo sector, porque un nivel normal para un minorista es distinto del de una empresa de software. También leería las notas de las cuentas para detectar partidas extraordinarias que distorsionen la imagen.",
    explanation:
      "Los ratios solo tienen sentido en su contexto: tendencia, referencias del sector y detalles contables.",
    tips: ["Agrupa los ratios según su finalidad.", "Insiste en la comparación en el tiempo y con empresas similares."],
    commonMistakes: ["Interpretar un ratio sin el contexto del sector.", "Ignorar el flujo de caja cuando el beneficio parece bueno."],
    followUpQuestions: ["¿Qué sugiere una caída de la prueba ácida?", "¿Cómo puede quedarse sin efectivo una empresa rentable?"],
  },
  'job-043': {
    question: "Háblame de una ocasión en la que encontraste un error en un informe financiero o tuviste que presentar malas cifras.",
    intent: "El entrevistador evalúa tu integridad, tu rigor y tu comunicación en finanzas.",
    expectedAnswer:
      "Situación: dos días antes de la presentación de los resultados mensuales, me di cuenta de que una factura de proveedor se había registrado dos veces, lo que inflaba los costes en 120.000 y hacía que el mes pareciera peor de lo que era. Tarea: como analista que había preparado el informe, tenía que corregirlo rápidamente e informar a mi responsable. Acción: verifiqué el duplicado con el equipo de cuentas por pagar, corregí el asiento y actualicé el informe. Se lo comuniqué de inmediato a mi responsable, le expliqué la causa, la carga manual de un archivo que ya se había importado automáticamente, y propuse un control: una comprobación de duplicados por número de factura y proveedor antes de cada cierre. Resultado: la presentación usó las cifras correctas, el control se añadió a nuestra lista de verificación de cierre y desde entonces no se ha encontrado ningún duplicado.",
    explanation:
      "En finanzas, la exactitud y la transparencia son esenciales. Informar de los errores de inmediato y añadir un control demuestra fiabilidad.",
    tips: ["Explica cómo verificaste el error.", "Muestra una transparencia inmediata.", "Describe el control que añadiste."],
    commonMistakes: ["Corregir en silencio sin informar a nadie.", "Minimizar el impacto del error."],
    followUpQuestions: ["¿Qué otros controles usas en el cierre de mes?", "¿Cómo presentarías unos resultados por debajo del presupuesto?"],
  },
  'job-044': {
    question: "¿Cómo construirías un modelo financiero para respaldar una decisión de negocio?",
    intent: "El entrevistador evalúa tus competencias avanzadas de modelización, tu estructura y tu rigor.",
    expectedAnswer:
      "Parto de la decisión y de las preguntas que el modelo debe responder, por ejemplo si conviene abrir un nuevo centro, para no construir algo demasiado complejo. Estructuro el modelo con claridad: una hoja de datos de entrada e hipótesis, los cálculos y los resultados, con un formato coherente, sin cifras escritas directamente en las fórmulas y con etiquetas y unidades claras. Las hipótesis se documentan con sus fuentes, como datos de mercado, resultados históricos o estimaciones de la dirección. El modelo construye los ingresos a partir de sus factores, por ejemplo número de clientes multiplicado por el gasto medio, y los costes divididos en fijos y variables, y luego genera los tres estados financieros o al menos los flujos de caja, y métricas de valoración como el VAN. Pruebo el modelo con comprobaciones, como que el balance general cuadre o que los márgenes sean razonables, y pido que lo revisen. Después hago un análisis de sensibilidad de los factores clave y escenarios, base, optimista y pesimista, para mostrar qué hipótesis pesan más. Presento los resultados con el rango de desenlaces posibles y los principales riesgos, no con una sola cifra.",
    explanation:
      "Un buen modelo es transparente, se basa en factores, está verificado y se centra en la decisión. La sensibilidad y los escenarios comunican la incertidumbre.",
    tips: ["Separa datos de entrada, cálculos y resultados.", "Usa una lógica basada en factores.", "Incluye comprobaciones, sensibilidad y escenarios."],
    commonMistakes: ["Escribir cifras directamente en las fórmulas.", "Presentar una única cifra como si fuera segura."],
    followUpQuestions: ["¿Qué factores modelizarías para un negocio de suscripción?", "¿Cómo haces que un modelo sea fácil de revisar para otras personas?"],
  },
  'job-045': {
    question: "¿Cómo explicarías a responsables no financieros por qué una empresa rentable puede quedarse sin efectivo?",
    intent: "El entrevistador evalúa tu capacidad de explicar conceptos financieros con claridad a quienes toman decisiones.",
    expectedAnswer:
      "Usaría un ejemplo sencillo. Imagina que este mes vendemos 100.000 en productos con un margen del 20%, así que el estado de resultados muestra un beneficio de 20.000. Pero nuestros clientes pagan a 60 días, mientras que nosotros pagamos a proveedores y salarios este mismo mes. El beneficio se registra cuando vendemos, pero el efectivo solo entra cuando los clientes pagan. Si las ventas crecen rápido, gastamos más efectivo en existencias y producción antes de recibir los cobros, así que el crecimiento puede consumir efectivo. Esto es el capital de trabajo: el dinero inmovilizado en cuentas por cobrar y existencias, menos lo que debemos a los proveedores. Las inversiones en equipos también consumen efectivo de inmediato, mientras que su coste aparece poco a poco como amortización. Para proteger el efectivo, podemos acortar los plazos de pago, reclamar los pagos atrasados, gestionar el nivel de existencias y planificar la financiación con antelación. Mostraría un gráfico sencillo que compare el beneficio mensual y el saldo de efectivo para que la diferencia se vea.",
    explanation:
      "Traducir las finanzas en ejemplos concretos y elementos visuales ayuda a los responsables a tomar mejores decisiones. La diferencia entre beneficio y efectivo es una de las más importantes de explicar.",
    tips: ["Usa un ejemplo numérico sencillo.", "Explica el capital de trabajo con palabras sencillas.", "Termina con acciones que los responsables puedan tomar."],
    commonMistakes: ["Usar jerga contable con un público no financiero.", "Explicar el concepto sin acciones prácticas."],
    followUpQuestions: ["¿Cómo reducirías el periodo medio de cobro?", "¿Para qué sirve una previsión de tesorería?"],
  },
  'job-046': {
    question: "¿Por qué quieres trabajar en marketing y qué canales conoces mejor?",
    intent: "El entrevistador comprueba tu motivación y tu experiencia práctica con los canales de marketing.",
    expectedAnswer:
      "Me gusta que el marketing combine la comprensión de las personas con resultados medibles. Durante mis prácticas en una empresa de comercio electrónico, gestioné la newsletter y algunas campañas de pago en redes sociales. Disfrutaba probando distintos asuntos y audiencias y viendo qué mensajes funcionaban; una prueba con recomendaciones de productos aumentó la tasa de clics un 30%. Los canales que mejor conozco son el email marketing y las redes sociales de pago, sobre todo la segmentación de audiencias y los informes de campañas. Ahora estoy desarrollando mis competencias en SEO, que considero importante para su estrategia de contenidos.",
    explanation:
      "Vincular la motivación con experiencias y resultados concretos, y nombrar los canales que conoces de verdad, hace creíble la respuesta.",
    tips: ["Menciona campañas y resultados reales.", "Sé honesto sobre los canales que conoces menos."],
    commonMistakes: ["Decir que conoces todos los canales.", "Hablar de creatividad sin resultados."],
    followUpQuestions: ["Háblame de un resultado de campaña del que estés orgulloso.", "¿Cómo aprenderías rápidamente un canal nuevo?"],
  },
  'job-047': {
    question: "Explica el embudo de conversión y cómo lo usarías.",
    intent: "El entrevistador comprueba que conoces un marco básico de marketing y cómo lo aplicas.",
    expectedAnswer:
      "El embudo de conversión describe las etapas por las que pasa un cliente potencial: el reconocimiento, cuando descubre la marca; la consideración, cuando compara opciones; la conversión, cuando compra o se registra; y después la retención y la recomendación, cuando vuelve a comprar y recomienda la marca. Cada etapa necesita contenidos y canales distintos: por ejemplo, redes sociales o vídeo para el reconocimiento, guías comparativas y opiniones para la consideración, ofertas y un proceso de compra sencillo para la conversión, y email y programas de fidelización para la retención. Uso el embudo para ver dónde perdemos más personas, con métricas como el alcance, la tasa de clics, la tasa de conversión y la tasa de recompra, y para concentrar las mejoras en la etapa más débil.",
    explanation:
      "El embudo organiza las acciones y métricas de marketing según la etapa del cliente, lo que ayuda a encontrar dónde mejorar.",
    tips: ["Nombra cada etapa con un ejemplo de canal.", "Relaciona las etapas con métricas."],
    commonMistakes: ["Centrarte solo en la captación e ignorar la retención."],
    followUpQuestions: ["¿Qué métrica seguirías en cada etapa?", "¿En qué se diferencia el embudo en B2B?"],
  },
  'job-048': {
    question: "¿Qué KPI usarías para evaluar una campaña de marketing digital?",
    intent: "El entrevistador comprueba tu capacidad analítica y tu capacidad de relacionar el marketing con los resultados del negocio.",
    expectedAnswer:
      "Depende del objetivo de la campaña. Para el reconocimiento, miraría el alcance, las impresiones y el volumen de búsquedas de marca. Para la interacción, la tasa de clics y el tiempo en el sitio. Para el rendimiento, la tasa de conversión, el coste de adquisición, CAC, y el retorno de la inversión publicitaria, ROAS: los ingresos generados divididos entre el gasto publicitario. Para el impacto en el negocio, compararía el coste de adquisición con el valor de vida del cliente (LTV), porque un cliente caro de captar puede seguir siendo rentable si se queda durante años; un objetivo habitual es una relación LTV/CAC de al menos tres a uno. Defino los KPI y los objetivos antes del lanzamiento, compruebo que el seguimiento funciona y comparo los resultados con un grupo de control o con un periodo anterior para estimar el efecto real.",
    explanation:
      "Los buenos KPI dependen del objetivo y relacionan la inversión en marketing con el valor para el negocio, con el LTV y el CAC como vínculos clave.",
    tips: ["Adapta los KPI a los objetivos de la campaña.", "Explica el CAC, el ROAS y el LTV.", "Define los objetivos antes del lanzamiento."],
    commonMistakes: ["Informar solo de métricas de vanidad como los « me gusta ».", "Juzgar las campañas solo por el ROAS sin tener en cuenta los márgenes."],
    followUpQuestions: ["¿Cómo calcularías el LTV?", "¿Y si el ROAS es alto pero las ventas totales no aumentan?"],
  },
  'job-049': {
    question: "¿Cómo planificarías la campaña de marketing para el lanzamiento de un nuevo producto?",
    intent: "El entrevistador evalúa tu planificación, tu estructura y tu orientación al cliente.",
    expectedAnswer:
      "Empezaría por el objetivo y el público objetivo: para quién es el producto, cuáles son sus necesidades y dónde pasa su tiempo, a partir de estudios y de los datos de clientes existentes. Después definiría el posicionamiento y el mensaje clave: el beneficio principal y por qué se diferencia de las alternativas. Elegiría los canales según el público, por ejemplo email para los clientes actuales, redes sociales e influencers para el reconocimiento, anuncios en buscadores para quienes ya buscan una solución, y prensa o alianzas cuando sea pertinente. Construiría un calendario con fases de expectativa previa, lanzamiento y seguimiento, repartiría el presupuesto por canal y me coordinaría con ventas, producto y atención al cliente para que todos estén preparados. Los KPI y el seguimiento se definirían antes del lanzamiento, y revisaría los resultados cada semana para trasladar presupuesto a lo que funciona.",
    explanation:
      "Un plan de lanzamiento conecta público, mensaje, canales, calendario y medición, y alinea a los equipos internos.",
    tips: ["Empieza por el público y el posicionamiento.", "Explica las fases.", "Menciona la coordinación con otros equipos."],
    commonMistakes: ["Elegir los canales antes de entender al público.", "Olvidar preparar a los equipos de ventas y de soporte."],
    followUpQuestions: ["¿Cómo repartirías un presupuesto limitado?", "¿Qué harías si el lanzamiento rinde por debajo de lo esperado en la primera semana?"],
  },
  'job-050': {
    question: "Háblame de una campaña de marketing que no dio los resultados esperados. ¿Qué hiciste?",
    intent: "El entrevistador evalúa tu sentido de la responsabilidad, tu capacidad de análisis y tu adaptabilidad.",
    expectedAnswer:
      "Situación: dirigí una campaña de pago en redes sociales para promocionar un nuevo curso en línea, con el objetivo de 500 inscripciones en un mes. Al cabo de dos semanas teníamos 90. Tarea: tenía que entender por qué y mejorar los resultados con el presupuesto restante. Acción: analicé el embudo de conversión: la tasa de clics era buena, pero solo el 1% de los visitantes se inscribía. Al revisar la página de destino, vi que el precio aparecía antes que los beneficios y que el formulario tenía ocho campos. Creé una nueva versión con los testimonios al principio y un formulario de tres campos, y la probé frente a la original con la mitad del tráfico. También pausé las dos audiencias con el coste por inscripción más alto. Resultado: la tasa de conversión subió al 3,5%, terminamos el mes con 380 inscripciones, por debajo del objetivo pero con un coste por inscripción más bajo, y la nueva página de destino se convirtió en nuestra plantilla.",
    explanation:
      "Las respuestas sólidas muestran análisis del embudo, pruebas rápidas, reasignación del presupuesto y una comunicación honesta de los resultados.",
    tips: ["Identifica dónde se rompió el embudo.", "Describe las pruebas y los cambios de presupuesto.", "Sé honesto si no se alcanzó el objetivo."],
    commonMistakes: ["Culpar al algoritmo o al mercado.", "Cambiar muchas cosas a la vez sin medir."],
    followUpQuestions: ["¿Qué harías de otra forma antes del lanzamiento?", "¿Cómo decides cuándo detener una campaña?"],
  },
  'job-051': {
    question: "¿Qué diferencia hay entre el SEO y la búsqueda de pago, y cómo los usarías juntos?",
    intent: "El entrevistador comprueba tus conocimientos de estrategia de marketing en buscadores.",
    expectedAnswer:
      "El SEO, la optimización para motores de búsqueda, mejora la posición de un sitio web en los resultados orgánicos mediante contenido relevante, calidad técnica, como la velocidad y la usabilidad en móvil, y autoridad gracias a los enlaces de otros sitios. Tarda meses en dar resultados, pero el tráfico no se paga por clic y genera valor a largo plazo. La búsqueda de pago, a menudo llamada SEM/SEA o PPC, compra anuncios que se muestran para palabras clave elegidas, lo que da visibilidad inmediata y un control preciso del presupuesto y la segmentación, pero el tráfico se detiene cuando se deja de invertir. Usados juntos, la búsqueda de pago permite probar qué palabras clave y mensajes convierten antes de invertir en contenido SEO, cubrir palabras clave importantes mientras el SEO crece y apuntar a búsquedas comerciales con mucha competencia. Con el tiempo, el contenido SEO reduce la dependencia del tráfico de pago. Seguiría ambos en el mismo informe para no pagar por clics que habríamos recibido de forma orgánica.",
    explanation:
      "El SEO y la búsqueda de pago tienen horizontes temporales y costes distintos; combinarlos equilibra resultados rápidos y valor a largo plazo.",
    tips: ["Compara velocidad, coste y durabilidad.", "Da una forma concreta en que se apoyan mutuamente."],
    commonMistakes: ["Tratar el SEO como un proyecto puntual.", "Pujar por palabras clave de marca sin revisar los resultados orgánicos."],
    followUpQuestions: ["¿Cómo elegirías las palabras clave?", "¿Qué problemas de SEO técnico son los más comunes?"],
  },
  'job-052': {
    question: "¿Cómo mides la eficacia del marketing cuando el seguimiento está limitado por las normas de privacidad y las restricciones de cookies?",
    intent: "El entrevistador evalúa un razonamiento avanzado y actualizado sobre la medición.",
    expectedAnswer:
      "Los requisitos de consentimiento como el RGPD (GDPR), las restricciones de los navegadores a las cookies de terceros y los cambios de privacidad en móviles hacen que el seguimiento a nivel de usuario sea incompleto, por lo que la atribución al último clic es aún menos fiable. Combinaría varios enfoques. Primero, recopilar correctamente los datos propios (first-party), con un consentimiento claro y etiquetado del lado del servidor cuando proceda, respetando a los usuarios que lo rechazan. Segundo, usar las conversiones modelizadas que ofrecen las plataformas publicitarias, tratándolas como estimaciones. Tercero, realizar pruebas de incrementalidad, como exclusiones geográficas (geo holdouts) o estudios de conversion lift, en los que un grupo de control no ve los anuncios, para medir el efecto causal real de un canal. Cuarto, usar el marketing mix modelling, que analiza la inversión y las ventas agregadas a lo largo del tiempo, incluida la estacionalidad y otros factores, para estimar la contribución de cada canal sin seguir a las personas. Triangularía estos métodos, aceptaría cierto grado de incertidumbre y tomaría las decisiones de presupuesto a partir de tendencias coherentes y no de cifras precisas pero engañosas.",
    explanation:
      "La medición moderna se basa en datos propios consentidos, experimentos y modelos agregados en lugar del seguimiento individual.",
    tips: ["Explica por qué el seguimiento está limitado.", "Menciona las pruebas de incrementalidad y el marketing mix modelling.", "Respeta las decisiones de consentimiento."],
    commonMistakes: ["Fiarte solo de la atribución que informan las plataformas.", "Intentar eludir las decisiones de consentimiento."],
    followUpQuestions: ["¿Cómo diseñarías una prueba de exclusión geográfica?", "¿Qué datos necesita el marketing mix modelling?"],
  },
  'job-053': {
    question: "¿Cómo posicionarías un producto en un mercado saturado?",
    intent: "El entrevistador evalúa tus competencias de marketing estratégico: segmentación, diferenciación y mensajes.",
    expectedAnswer:
      "Empezaría con investigación: entrevistas con clientes, opiniones sobre los productos de la competencia y datos de ventas, para entender qué segmentos tienen necesidades no cubiertas y por qué los clientes nos eligen o nos abandonan. En lugar de dirigirme a todo el mundo, elegiría un segmento en el que podamos ganar, por ejemplo pequeñas asesorías contables que encuentran demasiado complejas las herramientas actuales. Después situaría a los competidores en las dimensiones que importan a ese segmento, como la sencillez, el precio y las integraciones, para encontrar una diferenciación creíble que realmente podamos cumplir. La declaración de posicionamiento definiría el público objetivo, su problema, nuestra categoría, nuestro beneficio principal y la prueba: « Para las pequeñas asesorías contables que pierden tiempo con software complejo, nuestra herramienta es la solución de gestión de despachos más sencilla, configurada en un día, como demuestran nuestros resultados de incorporación ». Los mensajes, los precios, las prioridades de producto y los materiales de venta se alinearían con ella. Probaría el mensaje con anuncios o páginas de destino y conversaciones con clientes, lo ajustaría y lo revisaría a medida que cambie el mercado.",
    explanation:
      "Posicionar significa elegir un segmento objetivo y una diferencia creíble, alinear después toda la empresa en torno a ella y validarla con clientes reales.",
    tips: ["Empieza con investigación y un segmento elegido.", "Redacta una declaración de posicionamiento con una prueba.", "Explica cómo la pondrías a prueba."],
    commonMistakes: ["Intentar atraer a todo el mundo.", "Prometer diferencias que el producto no puede cumplir."],
    followUpQuestions: ["¿Cómo sabrías que el posicionamiento funciona?", "¿Y si un competidor copia tu elemento diferenciador?"],
  },
  'job-054': {
    question: "¿Por qué quieres trabajar en recursos humanos?",
    intent: "El entrevistador comprueba tu motivación y tu comprensión del papel de RR. HH. más allá de « que te gusten las personas ».",
    expectedAnswer:
      "Me interesan los RR. HH. porque influyen en cómo viven las personas su trabajo cada día: cómo se las recluta, se las recibe, se las desarrolla y se las trata con equidad. Durante mis prácticas en una empresa de logística, ayudé a organizar la incorporación (onboarding) de los trabajadores de temporada y rediseñé el manual de bienvenida con sus comentarios; las salidas durante la primera semana disminuyeron la temporada siguiente. También aprendí que RR. HH. exige rigor: derecho laboral, confidencialidad y datos. Me gustaría desarrollarme en selección e incorporación, donde creo que puedo aportar rápidamente.",
    explanation:
      "Una respuesta sólida muestra que entiendes RR. HH. como una función centrada en las personas y, a la vez, rigurosa y orientada al negocio, ilustrada con experiencia.",
    tips: ["Da un ejemplo concreto de trabajo de RR. HH. que hayas hecho.", "Menciona la parte rigurosa de RR. HH."],
    commonMistakes: ["Decir solo « me gusta ayudar a la gente »."],
    followUpQuestions: ["¿Qué área de RR. HH. te interesa más?", "¿Cómo gestionarías la información confidencial?"],
  },
  'job-055': {
    question: "¿Cuáles son las etapas clave de un buen proceso de selección?",
    intent: "El entrevistador comprueba tus conocimientos prácticos de selección y tu atención a la equidad.",
    expectedAnswer:
      "Empieza por definir la necesidad con el responsable de la contratación: la finalidad del puesto, las responsabilidades clave y las competencias realmente imprescindibles frente a las deseables. Después, una descripción del puesto clara e inclusiva y la elección de los canales de búsqueda de candidatos. El cribado debe usar criterios coherentes. Las entrevistas deben ser estructuradas: las mismas preguntas para todos los candidatos, vinculadas a las competencias requeridas, con una guía de puntuación, lo que es más justo y predice mejor el desempeño que las conversaciones no estructuradas. Los ejercicios prácticos o casos pueden complementar las entrevistas. Luego vienen las referencias, la oferta y, por último, la preparación de la incorporación. Durante todo el proceso, los candidatos deben recibir noticias a tiempo, y los datos deben tratarse según las normas de privacidad. También seguiría métricas como el tiempo de contratación, la tasa de aceptación de ofertas y la retención de las nuevas incorporaciones para mejorar el proceso.",
    explanation:
      "Una selección estructurada y basada en criterios es más justa y más eficaz. La experiencia del candidato y las métricas completan el proceso.",
    tips: ["Menciona las entrevistas estructuradas y la puntuación.", "Incluye la comunicación con los candidatos y la protección de datos."],
    commonMistakes: ["Contratar por « intuición ».", "Dejar a los candidatos sin noticias durante semanas."],
    followUpQuestions: ["¿Cómo reduces los sesgos en las entrevistas?", "¿Cómo acortarías el tiempo de contratación?"],
  },
  'job-056': {
    question: "Háblame de una ocasión en la que gestionaste la queja de un empleado o un conflicto.",
    intent: "El entrevistador evalúa tu discreción, tu equidad y tu gestión de conflictos en un contexto de RR. HH.",
    expectedAnswer:
      "Situación: una empleada vino a decirme que un compañero hacía con frecuencia comentarios irrespetuosos sobre ella en las reuniones. Tarea: como asistente de RR. HH., tenía que gestionar la queja de forma justa, confidencial y conforme a nuestro procedimiento. Acción: la escuché con atención, tomé notas, le expliqué el proceso y los siguientes pasos, y la tranquilicé sobre la confidencialidad y la protección frente a represalias. Con mi responsable de RR. HH., nos reunimos con el compañero para escuchar su versión, hablamos con dos testigos y revisamos los mensajes pertinentes. Los hechos confirmaron un comportamiento inapropiado. Su responsable y RR. HH. se reunieron con él para fijar expectativas claras, se emitió una amonestación formal conforme a la política interna y organizamos una conversación con mediación, que la empleada aceptó. Resultado: el comportamiento cesó, hice un seguimiento con ella al cabo de uno y tres meses, y añadimos un módulo sobre comunicación respetuosa a la formación de los responsables.",
    explanation:
      "Un proceso justo, la confidencialidad, escuchar a ambas partes, documentar y hacer seguimiento son esenciales en la gestión de quejas.",
    tips: ["Muestra que escuchaste y explicaste el proceso.", "Escucha a ambas partes antes de concluir.", "Menciona el seguimiento."],
    commonMistakes: ["Tomar partido antes de investigar.", "Compartir detalles con más personas de las que necesitan saberlos."],
    followUpQuestions: ["¿Y si la queja fuera sobre un alto directivo?", "¿Cómo proteges a la persona que presenta la queja?"],
  },
  'job-057': {
    question: "¿Cómo reducirías la rotación temprana entre los nuevos empleados?",
    intent: "El entrevistador comprueba tu razonamiento analítico de RR. HH. y tus prácticas de incorporación.",
    expectedAnswer:
      "Primero analizaría los datos: cuándo se van las personas, en qué equipos o puestos y por qué, mediante entrevistas de salida y encuestas breves a los 30, 60 y 90 días. Las causas habituales son una diferencia entre el puesto descrito en la selección y el puesto real, una mala incorporación (onboarding), la falta de apoyo del responsable o unas expectativas poco claras. Según lo que se encuentre, las acciones podrían incluir descripciones de puesto más realistas y entrevistas que muestren la realidad del trabajo; un plan de incorporación estructurado con un compañero de referencia, un programa claro para la primera semana y objetivos para los tres primeros meses; formar a los responsables para que mantengan reuniones de seguimiento periódicas; y asegurarse de que el equipo y los accesos estén listos el primer día. Mediría el efecto siguiendo la retención a los tres y seis meses y las encuestas a las nuevas incorporaciones, y ajustaría el programa.",
    explanation:
      "Entender las causas con datos y, después, mejorar la precisión de la selección, la incorporación y el apoyo de los responsables reduce las salidas tempranas.",
    tips: ["Empieza con datos sobre cuándo y por qué se van las personas.", "Propón acciones concretas de incorporación.", "Mide los resultados."],
    commonMistakes: ["Suponer sin pruebas que la causa es el salario.", "Tratar la incorporación como un simple trámite administrativo."],
    followUpQuestions: ["¿Cómo sería una buena primera semana?", "¿Cómo obtienes comentarios sinceros en las entrevistas de salida?"],
  },
  'job-058': {
    question: "¿Cómo proteges los datos personales de los empleados en el trabajo de RR. HH.?",
    intent: "El entrevistador comprueba que conoces las obligaciones de protección de datos y que tienes hábitos prácticos.",
    expectedAnswer:
      "RR. HH. maneja datos personales sensibles, como documentos de identidad, salarios, información de salud y evaluaciones del desempeño, así que sigo los principios de protección de datos, como los del RGPD (GDPR) cuando se aplica: recopilar solo lo necesario para una finalidad clara, dar acceso solo a quienes lo necesitan, conservar los datos solo el tiempo requerido e informar a los empleados de cómo se usan sus datos. En la práctica, guardo los archivos en sistemas de RR. HH. seguros y no en carpetas personales ni en adjuntos de correo, uso cifrado o protección con contraseña al enviar documentos, evito hablar de casos personales en espacios abiertos y bloqueo la pantalla. Los datos de salud y otras categorías especiales necesitan una protección adicional. Si sospecho una violación de datos, como un archivo de nóminas enviado a la persona equivocada, lo comunico de inmediato al delegado de protección de datos, porque puede haber plazos legales de notificación.",
    explanation:
      "La protección de datos en RR. HH. combina principios legales con hábitos diarios. Saber cómo reaccionar ante una violación de datos es esencial.",
    tips: ["Menciona la minimización, el control de acceso y la conservación.", "Da ejemplos de hábitos diarios.", "Explica qué hacer en caso de violación de datos."],
    commonMistakes: ["Enviar archivos de nóminas por correo sin protección.", "Conservar indefinidamente los datos de los candidatos."],
    followUpQuestions: ["¿Cuánto tiempo deberías conservar los datos de los candidatos no seleccionados?", "¿Quién debería tener acceso a las evaluaciones del desempeño?"],
  },
  'job-059': {
    question: "Háblame de una ocasión en la que acompañaste a un responsable en una conversación difícil, como un despido o un problema de desempeño.",
    intent: "El entrevistador evalúa tus competencias avanzadas de socio de negocio de RR. HH.: preparación, equidad y humanidad en situaciones difíciles.",
    expectedAnswer:
      "Situación: un responsable de equipo quería despedir a un empleado cuyo desempeño había caído bruscamente durante seis meses, pero no había comentarios documentados. Tarea: como HR business partner, tenía que asegurarme de que el proceso fuera justo, jurídicamente sólido y humano. Acción: le expliqué al responsable que primero necesitábamos un proceso claro de mejora, con un plan de mejora del desempeño: expectativas documentadas, comentarios periódicos y apoyo. Le ayudé a preparar la primera conversación con hechos y ejemplos y lo animé a hacer preguntas abiertas. En esa reunión, el empleado mencionó una situación familiar difícil. Ajustamos temporalmente su horario y lo derivamos al programa de asistencia al empleado, manteniendo objetivos claros. Hicimos reuniones de seguimiento cada dos semanas, a las que asistí cuando fue necesario. Resultado: al cabo de tres meses su desempeño mejoró de forma notable y el despido dejó de ser necesario. Más tarde, el responsable me dijo que el proceso le había enseñado a abordar los problemas antes, y creamos una guía breve para los responsables sobre las conversaciones de desempeño.",
    explanation:
      "Un buen apoyo de RR. HH. equilibra la equidad, los requisitos legales y la empatía, y ayuda a los responsables a abordar los problemas pronto y con hechos.",
    tips: ["Muestra la preparación con hechos y un proceso.", "Equilibra la empatía con expectativas claras.", "Menciona lo que aprendió el responsable."],
    commonMistakes: ["Respaldar un despido sin documentación ni un proceso justo.", "Evitar la conversación difícil."],
    followUpQuestions: ["¿Y si el desempeño no hubiera mejorado?", "¿Cómo preparas a un responsable ante una reacción emocional?"],
  },
  'job-060': {
    question: "¿Cómo harías que el proceso de contratación de una empresa fuera más justo e inclusivo?",
    intent: "El entrevistador evalúa tus conocimientos avanzados sobre sesgos, equidad y mejora medible en RR. HH.",
    expectedAnswer:
      "Empezaría midiendo la situación actual: en cada etapa del proceso, desde las candidaturas hasta las ofertas, compararía las tasas de paso entre grupos cuando los datos puedan recogerse de forma legal y anónima, para ver dónde aparecen diferencias. Después actuaría sobre las etapas de mayor impacto. Descripciones de puesto: eliminar requisitos innecesarios, como un título cuando importan más las competencias, y usar un lenguaje inclusivo. Búsqueda de candidatos: ampliar los canales para llegar a perfiles más diversos. Cribado: usar criterios claros y, cuando sea posible, revisar las candidaturas sin nombres ni fotos. Entrevistas: entrevistas estructuradas, guías de puntuación, paneles de entrevistadores diversos y formación de los entrevistadores sobre los sesgos. Decisiones: comparar a los candidatos con los criterios en lugar de por su « encaje », y calibrar las puntuaciones entre entrevistadores. Accesibilidad: ofrecer ajustes a los candidatos con discapacidad. Revisaría con cuidado las herramientas de cribado automatizado, porque pueden reproducir sesgos históricos. Por último, seguiría las métricas en el tiempo, las compartiría con la dirección y haría ajustes, tratando la inclusión como parte de la calidad de la contratación y no como una iniciativa aparte.",
    explanation:
      "Una contratación justa se construye con medición, procesos estructurados y rendición de cuentas, no solo con buenas intenciones.",
    tips: ["Empieza con datos de cada etapa.", "Da cambios concretos en cada paso.", "Menciona los riesgos del cribado automatizado."],
    commonMistakes: ["Confiar solo en la formación sobre sesgos inconscientes.", "Recopilar datos de diversidad sin garantías legales y de privacidad."],
    followUpQuestions: ["¿Cómo evaluarías los sesgos de una herramienta de cribado basada en IA?", "¿Cómo defines el « encaje cultural » sin excluir a nadie?"],
  },
};
