import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de DevOps 001-022: Docker, Kubernetes, CI/CD, Git (parte). */
export const esA: TextTable<QuestionText> = {
  'ops-001': {
    question: "¿Cuál es la diferencia entre un contenedor y una máquina virtual?",
    intent: "El entrevistador comprueba un concepto fundamental en el que se basa el despliegue moderno.",
    expectedAnswer:
      "Una máquina virtual emula un ordenador completo: ejecuta su propio kernel de sistema operativo sobre un hipervisor, por lo que está muy aislada pero es pesada, ocupa gigabytes y a menudo tarda minutos en arrancar. Un contenedor empaqueta una aplicación con sus dependencias, pero comparte el kernel del host; el aislamiento proviene de funcionalidades del kernel como los namespaces, que separan procesos, redes y sistemas de archivos, y los cgroups, que limitan la CPU y la memoria. Por eso los contenedores son mucho más ligeros, arrancan en segundos y se pueden ejecutar muchos en una misma máquina. La contrapartida es un aislamiento más débil que el de una VM, razón por la que algunas plataformas ejecutan los contenedores dentro de VM ligeras para cargas de trabajo no confiables.",
    explanation:
      "Compartir el kernel es lo que hace que los contenedores sean ligeros y rápidos, y también lo que hace que su aislamiento sea más débil que el de las VM.",
    tips: ["Menciona el kernel compartido, los namespaces y los cgroups.", "Compara el tiempo de arranque y el consumo de recursos."],
    commonMistakes: ["Decir que los contenedores son pequeñas máquinas virtuales.", "Afirmar que los contenedores están tan aislados como las VM."],
    followUpQuestions: ["¿Se puede ejecutar un contenedor Windows en un host Linux?", "¿Para qué sirven los cgroups?"],
  },
  'ops-002': {
    question: "¿Cuál es la diferencia entre una imagen Docker y un contenedor, y qué es un Dockerfile?",
    intent: "El entrevistador comprueba el vocabulario y el flujo de trabajo básicos de Docker.",
    expectedAnswer:
      "Una imagen Docker es una plantilla de solo lectura formada por capas: un sistema operativo base, el runtime, las dependencias y la aplicación. Un contenedor es una instancia en ejecución de una imagen, con su propia capa escribible, su proceso y su red; puedes arrancar muchos contenedores a partir de la misma imagen. Un Dockerfile es la receta para construir una imagen: instrucciones como FROM para elegir una imagen base, COPY para añadir archivos, RUN para ejecutar comandos en tiempo de construcción, EXPOSE para documentar puertos y CMD o ENTRYPOINT para definir el comando que se ejecuta cuando arranca el contenedor. Construyes con docker build, ejecutas con docker run y subes la imagen a un registro para que otros entornos puedan usarla.",
    explanation:
      "Las imágenes se construyen una vez y se ejecutan en cualquier lugar; los contenedores son instancias desechables. Esta separación hace que los despliegues sean reproducibles.",
    example: "FROM eclipse-temurin:21-jre\nCOPY target/app.jar /app/app.jar\nCMD [\"java\", \"-jar\", \"/app/app.jar\"]",
    tips: ["Usa la analogía entre clase e instancia.", "Nombra las principales instrucciones del Dockerfile."],
    commonMistakes: ["Guardar datos importantes en la capa escribible del contenedor.", "Confundir RUN y CMD."],
    followUpQuestions: ["¿Qué es un registro de contenedores?", "¿Por qué las imágenes se construyen por capas?"],
  },
  'ops-003': {
    question: "¿Cuáles son las buenas prácticas para escribir un Dockerfile?",
    intent: "El entrevistador comprueba si construyes imágenes pequeñas, rápidas de construir y seguras.",
    expectedAnswer:
      "Ordeno las instrucciones para aprovechar la caché de capas: copio los archivos de dependencias, como package.json o pom.xml, e instalo las dependencias antes de copiar el código fuente, para que un cambio en el código no reinstale todo. Uso una imagen base pequeña y oficial con una etiqueta de versión fija, como una imagen slim o distroless, en lugar de latest. Un archivo .dockerignore mantiene fuera del contexto de construcción los archivos innecesarios, como .git, node_modules o secretos locales. Combino los comandos RUN relacionados y limpio las cachés del gestor de paquetes en la misma capa. El proceso se ejecuta con un usuario no root. Los secretos nunca se copian en la imagen ni se pasan como argumentos de construcción que queden en el historial; cuando hace falta, los secretos de construcción se montan con BuildKit. Uso builds multi-stage para que las herramientas de construcción no estén en la imagen final, y añado un HEALTHCHECK o me apoyo en las sondas (probes) del orquestador.",
    explanation:
      "Un buen Dockerfile produce imágenes pequeñas, reproducibles y seguras, y se reconstruye rápidamente gracias a la caché.",
    tips: ["Explica el orden que favorece la caché.", "Menciona las versiones fijadas, el usuario no root y .dockerignore."],
    commonMistakes: ["Usar la etiqueta latest en producción.", "Copiar todo el repositorio antes de instalar las dependencias.", "Incluir secretos dentro de las imágenes."],
    followUpQuestions: ["¿Cómo analizarías una imagen en busca de vulnerabilidades?", "¿Qué es una imagen distroless?"],
  },
  'ops-004': {
    question: "¿Qué es un build multi-stage de Docker y por qué usarlo?",
    intent: "El entrevistador comprueba una técnica clave para producir imágenes de producción ligeras.",
    expectedAnswer:
      "Un build multi-stage usa varias instrucciones FROM en un mismo Dockerfile. Una etapa inicial contiene todo lo necesario para construir la aplicación, como un JDK, Maven o Node con las dependencias de desarrollo, y produce artefactos como un jar o recursos compilados. La etapa final parte de una imagen de runtime mínima y copia solo esos artefactos con COPY --from=build. El resultado es una imagen mucho más pequeña y con menos paquetes, lo que significa descargas más rápidas, una superficie de ataque menor y menos vulnerabilidades reportadas por los escáneres. Además, mantiene la construcción reproducible dentro de Docker, sin necesitar herramientas instaladas en la máquina de CI.",
    explanation:
      "Separar las dependencias de construcción de las de ejecución es la razón principal por la que las imágenes pueden pasar de gigabytes a decenas de megabytes.",
    example: "FROM node:22 AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:1.27-alpine\nCOPY --from=build /app/dist /usr/share/nginx/html",
    tips: ["Explica qué va en cada etapa.", "Menciona los beneficios en tamaño y seguridad."],
    commonMistakes: ["Incluir compiladores y dependencias de test en la imagen de producción."],
    followUpQuestions: ["¿Cómo cacheas las dependencias entre builds en CI?", "¿Se puede construir solo una etapa concreta?"],
  },
  'ops-005': {
    question: "¿Cómo se comunican los contenedores entre sí y cómo persisten los datos? ¿Para qué sirve Docker Compose?",
    intent: "El entrevistador comprueba el conocimiento práctico para ejecutar aplicaciones multicontenedor en local.",
    expectedAnswer:
      "Los contenedores conectados a una misma red Docker definida por el usuario pueden comunicarse por nombre de contenedor o de servicio, gracias al DNS interno de Docker, de modo que un contenedor de API se conecta a una base de datos en db:5432 en lugar de usar una dirección IP. Los puertos se publican en el host solo cuando hace falta, con -p 8080:80. Los contenedores son efímeros, así que los datos que deben sobrevivir a los reinicios van en volúmenes, gestionados por Docker, o en bind mounts, que mapean un directorio del host y son útiles en desarrollo. Docker Compose describe una aplicación multicontenedor en un archivo YAML: servicios, imágenes o builds, variables de entorno, redes, volúmenes, dependencias y health checks. docker compose up arranca todo el stack, lo que hace reproducibles el desarrollo local y los tests de integración. depends_on con una condición de salud ayuda a esperar a que la base de datos esté lista.",
    explanation:
      "Las redes proporcionan el descubrimiento de servicios, los volúmenes la persistencia, y Compose lo une todo para los entornos locales.",
    tips: ["Menciona el DNS por nombre de servicio.", "Distingue entre volúmenes y bind mounts.", "Explica la disponibilidad con health checks."],
    commonMistakes: ["Guardar los datos de la base de datos sin un volumen.", "Escribir a mano las direcciones IP de los contenedores."],
    followUpQuestions: ["¿Por qué depends_on por sí solo no basta para esperar a una base de datos?", "¿Usarías Compose en producción?"],
  },
  'ops-006': {
    question: "¿Cómo aseguras los contenedores y las imágenes de contenedor?",
    intent: "El entrevistador evalúa prácticas de seguridad avanzadas a lo largo de todo el ciclo de vida de los contenedores.",
    expectedAnswer:
      "Pienso en la seguridad en tres momentos: construcción, distribución y ejecución. En la construcción: imágenes base mínimas como distroless o basadas en Alpine, versiones o digests fijados, builds multi-stage, ningún secreto en las capas y análisis automático de vulnerabilidades con herramientas como Trivy o Grype en CI, haciendo fallar el build ante problemas críticos y con un proceso para actualizar las imágenes base con regularidad. En la distribución: un registro privado con control de acceso, firma de imágenes con Sigstore cosign y verificación en el despliegue, además de una lista de materiales de software (SBOM) para saber qué contiene cada imagen. En la ejecución: ejecutar con un usuario no root, usar un sistema de archivos raíz de solo lectura, eliminar capabilities de Linux, no usar nunca el modo privilegiado, aplicar perfiles seccomp o AppArmor, fijar límites de recursos para evitar denegaciones de servicio y restringir el tráfico de red entre cargas de trabajo con network policies. En Kubernetes, los Pod Security Standards y los admission controllers como Kyverno u OPA Gatekeeper aplican estas reglas automáticamente. Por último, la monitorización en tiempo de ejecución, por ejemplo con Falco, detecta comportamientos sospechosos como la apertura de un shell dentro de un contenedor.",
    explanation:
      "La seguridad de los contenedores es por capas: reducir lo que hay en la imagen, controlar su procedencia y restringir lo que puede hacer en ejecución. Los candidatos avanzados mencionan mecanismos de aplicación, no solo buenas intenciones.",
    tips: ["Estructura la respuesta en construcción, distribución y ejecución.", "Menciona el análisis, la firma y los SBOM.", "Nombra herramientas de aplicación de políticas para Kubernetes."],
    commonMistakes: ["Ejecutar contenedores como root en modo privilegiado.", "Analizar las imágenes una sola vez y no actualizar nunca las imágenes base."],
    followUpQuestions: ["¿Qué es un SBOM?", "¿Cómo gestionarías una vulnerabilidad crítica en una imagen base usada por 50 servicios?"],
  },
  'ops-007': {
    question: "Un contenedor funciona en tu máquina pero se cae una y otra vez en producción. ¿Cómo lo investigas?",
    intent: "El entrevistador evalúa la resolución avanzada de problemas debidos a diferencias de entorno en aplicaciones en contenedores.",
    expectedAnswer:
      "Primero reuniría evidencias: los logs del contenedor, su código de salida y los eventos del orquestador, por ejemplo con kubectl describe pod y kubectl logs --previous. El código de salida es una pista importante: 137 suele indicar que el proceso fue terminado a la fuerza, a menudo OOMKilled por superar su límite de memoria, mientras que 1 suele indicar un error de la aplicación. Las causas habituales de diferencias son: configuración y secretos ausentes o distintos en producción; límites de memoria más bajos que en un portátil, sobre todo para la JVM o Node si los ajustes de heap no tienen en cuenta el contenedor; una arquitectura de CPU distinta, como una imagen construida para ARM en un portátil y ejecutada en servidores x86; reglas de red que impiden el acceso a una base de datos o a una API externa; diferencias en el sistema de archivos, como un sistema de archivos raíz de solo lectura o la falta de permisos de escritura para un usuario no root; y problemas de tiempos, como una sonda de liveness que mata una aplicación lenta en arrancar. El manejo de señales también importa: si la aplicación se ejecuta como hija de un shell, puede no recibir SIGTERM y acabar terminada de forma abrupta. Para reproducirlo, ejecutaría la imagen exacta de producción con las mismas variables de entorno, límites y usuario, en local o en un entorno de staging. Después corregiría la causa raíz y añadiría la comprobación que faltaba al pipeline o a la configuración de despliegue.",
    explanation:
      "Los códigos de salida, los eventos y las diferencias de entorno guían el diagnóstico. Las respuestas avanzadas abarcan los límites de memoria, la arquitectura, los permisos, las sondas y las señales.",
    tips: ["Empieza por los logs, el código de salida y los eventos.", "Enumera las diferencias de entorno clásicas.", "Reproduce con la imagen y los ajustes exactos de producción."],
    commonMistakes: ["Reconstruir la imagen en local en lugar de probar la imagen exacta de producción.", "Aumentar los límites a ciegas sin entender la causa."],
    followUpQuestions: ["¿Qué significa el código de salida 137?", "¿Cómo te aseguras de que una aplicación se detenga de forma ordenada en un contenedor?"],
  },
  'ops-008': {
    question: "¿Qué es Kubernetes y qué son los pods, los deployments y los services?",
    intent: "El entrevistador comprueba el vocabulario básico de Kubernetes necesario para trabajar con clústeres.",
    expectedAnswer:
      "Kubernetes es una plataforma de orquestación de contenedores: describes en YAML el estado deseado de tu aplicación, y los controladores trabajan continuamente para que el clúster coincida con él, reiniciando contenedores que fallan, planificando cargas de trabajo en los nodos y escalando. Un pod es la unidad desplegable más pequeña: uno o varios contenedores que comparten una dirección de red y almacenamiento y se planifican juntos. Los pods son efímeros y reciben nuevas direcciones IP cuando se recrean. Un deployment gestiona un conjunto de pods idénticos a través de un ReplicaSet, mantiene en ejecución el número solicitado y se encarga de las actualizaciones progresivas (rolling updates) y los rollbacks. Un service ofrece un nombre y una dirección IP estables delante de un conjunto cambiante de pods seleccionados por etiquetas (labels), y reparte el tráfico entre ellos.",
    explanation:
      "El modelo declarativo de estado deseado y la separación entre pods, deployments y services son la base de Kubernetes.",
    tips: ["Explica el modelo de estado deseado.", "Di por qué hacen falta los services cuando los pods cambian."],
    commonMistakes: ["Crear pods sueltos en lugar de deployments para las aplicaciones.", "Pensar que un pod siempre tiene exactamente un contenedor."],
    followUpQuestions: ["¿Qué es un namespace?", "¿Cuándo usarías un StatefulSet?"],
  },
  'ops-009': {
    question: "¿Cómo funciona un rolling update en Kubernetes y cómo se hace un rollback?",
    intent: "El entrevistador comprueba tus conocimientos sobre despliegues seguros en Kubernetes.",
    expectedAnswer:
      "Cuando cambias la plantilla de pod de un deployment, por ejemplo con una nueva etiqueta de imagen, Kubernetes crea un nuevo ReplicaSet y sustituye gradualmente los pods antiguos por los nuevos. maxSurge controla cuántos pods adicionales se pueden crear por encima del número deseado, y maxUnavailable cuántos pueden no estar disponibles durante la actualización. Los nuevos pods reciben tráfico solo cuando su sonda de readiness se supera, así que una versión defectuosa detiene el despliegue en lugar de reemplazarlo todo. Puedes seguir el progreso con kubectl rollout status y volver atrás con kubectl rollout undo, que regresa al ReplicaSet anterior. Para que la actualización sea fluida, la aplicación debe gestionar un apagado ordenado al recibir SIGTERM, las versiones antigua y nueva deben ser compatibles con el mismo esquema de base de datos y las sondas de readiness deben ser significativas.",
    explanation:
      "Los rolling updates solo son seguros con buenas sondas de readiness, un apagado ordenado y cambios compatibles hacia atrás.",
    tips: ["Explica maxSurge y maxUnavailable.", "Insiste en el papel de las sondas de readiness.", "Menciona los comandos de rollback."],
    commonMistakes: ["Usar la misma etiqueta de imagen para versiones distintas, de modo que Kubernetes no detecta el cambio.", "Desplegar un cambio de esquema incompatible con la versión antigua."],
    followUpQuestions: ["¿Cómo implementarías un despliegue canary en Kubernetes?", "¿Qué pasa con las peticiones en curso durante una actualización?"],
  },
  'ops-010': {
    question: "¿Qué tipos de services existen en Kubernetes y qué es un Ingress?",
    intent: "El entrevistador comprueba cómo llega el tráfico a las aplicaciones dentro y fuera del clúster.",
    expectedAnswer:
      "Un service ClusterIP, el tipo por defecto, expone los pods en una IP interna accesible solo desde dentro del clúster; se usa para la comunicación entre servicios. Un service NodePort abre un puerto en cada nodo y es útil sobre todo para pruebas. Un service LoadBalancer pide al proveedor cloud que cree un balanceador de carga externo que apunte al service. Un service ExternalName asocia un nombre a un nombre DNS externo. Un Ingress es un conjunto de reglas de enrutamiento HTTP, como enviar api.example.com/orders al service de pedidos, gestionado por un ingress controller como NGINX o un balanceador de carga cloud; además termina TLS, de modo que un único punto de entrada externo puede servir a muchos servicios. La Gateway API, más reciente, es un sucesor más expresivo de Ingress, con roles más claros para los equipos de plataforma y de aplicación.",
    explanation:
      "Los services proporcionan un acceso estable a los pods; Ingress o la Gateway API proporcionan el enrutamiento HTTP y TLS desde fuera del clúster.",
    tips: ["Describe cada tipo de service con un caso de uso.", "Explica el papel del ingress controller."],
    commonMistakes: ["Crear un service LoadBalancer para cada aplicación, lo que multiplica los costes cloud."],
    followUpQuestions: ["¿Cómo gestionarías automáticamente los certificados TLS?", "¿Qué es la Gateway API?"],
  },
  'ops-011': {
    question: "¿Cuál es la diferencia entre las sondas de liveness, readiness y startup?",
    intent: "El entrevistador comprueba la correcta configuración de los health checks, una causa frecuente de caídas del servicio.",
    expectedAnswer:
      "Una sonda de readiness indica a Kubernetes si un pod puede recibir tráfico; si falla, el pod se retira de los endpoints del service pero no se reinicia, lo que resulta útil durante el arranque o cuando una dependencia no está disponible temporalmente. Una sonda de liveness indica a Kubernetes si el contenedor está sano; si falla repetidamente, el contenedor se reinicia, lo que ayuda a recuperarse de interbloqueos (deadlocks). Una sonda de startup protege a las aplicaciones lentas en arrancar: las comprobaciones de liveness y readiness quedan desactivadas hasta que esta tiene éxito, para que la aplicación no se mate mientras todavía está arrancando. Un error habitual es hacer que la sonda de liveness dependa de sistemas externos como la base de datos: si la base de datos cae, todos los pods se reinician en bucle y la caída empeora. La liveness debe comprobar solo el propio proceso, mientras que la readiness puede reflejar si la instancia es capaz de atender peticiones.",
    explanation:
      "Las sondas tienen consecuencias distintas: retirar del tráfico frente a reiniciar. Unas sondas de liveness mal configuradas pueden convertir un pequeño incidente en un fallo en cascada.",
    tips: ["Explica qué ocurre cuando falla cada sonda.", "Advierte sobre las sondas de liveness que dependen de sistemas externos."],
    commonMistakes: ["Usar el mismo endpoint y los mismos ajustes para liveness y readiness.", "Configurar timeouts de liveness más cortos que el tiempo de arranque de la aplicación."],
    followUpQuestions: ["¿Qué debería comprobar un buen endpoint de readiness?", "¿Cómo interactúan las sondas con los rolling updates?"],
  },
  'ops-012': {
    question: "Un pod está en CrashLoopBackOff. ¿Cómo lo diagnosticas?",
    intent: "El entrevistador evalúa la resolución de problemas avanzada y práctica en Kubernetes.",
    expectedAnswer:
      "CrashLoopBackOff significa que el contenedor arranca, termina y se reinicia con esperas cada vez más largas. Ejecutaría kubectl describe pod para ver los eventos, el último estado, el código de salida y el motivo, como OOMKilled o Error, y kubectl logs --previous para leer la salida del contenedor que se cayó, ya que el actual puede no tener logs todavía. Causas típicas: la aplicación falla al arrancar por una configuración ausente, un Secret o una clave de ConfigMap que falta, o una dependencia inalcanzable, como el nombre de host de una base de datos; el límite de memoria es demasiado bajo; el comando o el entrypoint es incorrecto; fallan los permisos de archivos para un usuario no root; o una sonda de liveness mata el contenedor antes de que termine de arrancar. Si la imagen termina demasiado rápido para inspeccionarla, puedo sobrescribir temporalmente el comando para mantenerla en ejecución o usar kubectl debug con un contenedor efímero para investigar el entorno, la red y los archivos montados. También comprobaría si el problema empezó con un nuevo despliegue y haría rollback si los usuarios se ven afectados; después corregiría la causa raíz y añadiría validaciones, por ejemplo comprobar la configuración obligatoria al arrancar con un mensaje de error claro.",
    explanation:
      "El método es: eventos y código de salida, logs anteriores y luego comprobaciones del entorno con herramientas de depuración. Si los usuarios se ven afectados, mitigar con un rollback va antes que la investigación a fondo.",
    tips: ["Menciona describe, logs --previous y los códigos de salida.", "Enumera las causas habituales de fallo al arrancar.", "Usa kubectl debug o una sobrescritura del comando para inspeccionar."],
    commonMistakes: ["Leer solo los logs actuales, que están vacíos.", "Borrar el pod una y otra vez esperando que funcione."],
    followUpQuestions: ["¿Qué es un contenedor efímero?", "¿Cómo validas la configuración antes del despliegue?"],
  },
  'ops-013': {
    question: "¿Cómo funcionan los requests, los limits y el autoescalado de recursos en Kubernetes?",
    intent: "El entrevistador comprueba la gestión avanzada de la capacidad y su efecto en la estabilidad y el coste.",
    expectedAnswer:
      "Un request es la cantidad de CPU y memoria garantizada para un contenedor; el scheduler usa los requests para decidir en qué nodo cabe un pod. Un limit es el máximo que puede usar el contenedor. Superar el limit de CPU provoca throttling, que ralentiza la aplicación; superar el limit de memoria hace que el contenedor se mate con OOMKilled. Los pods cuyos requests son iguales a sus limits obtienen la clase de calidad de servicio Guaranteed y son los últimos en ser desalojados cuando el nodo está bajo presión. Muchos equipos fijan los requests de memoria iguales a los limits para ganar previsibilidad y son prudentes con los limits de CPU, porque el throttling puede perjudicar la latencia. El Horizontal Pod Autoscaler añade o elimina réplicas de pods según métricas como el uso de CPU relativo a los requests, o métricas personalizadas como la longitud de una cola o las peticiones por segundo; KEDA lo amplía a fuentes de eventos y al escalado a cero. El Vertical Pod Autoscaler recomienda o ajusta los requests. El Cluster Autoscaler o Karpenter añaden nodos cuando hay pods que no se pueden planificar. Los requests deben basarse en el uso observado: demasiado bajos sobrecargan los nodos y causan inestabilidad; demasiado altos desperdician dinero.",
    explanation:
      "Los requests determinan la planificación, los limits la aplicación de restricciones, y los autoescaladores ajustan réplicas y nodos. Los candidatos avanzados entienden el throttling, la QoS y el dimensionamiento basado en datos.",
    tips: ["Distingue claramente requests y limits.", "Explica el throttling de CPU frente al OOM de memoria.", "Nombra los distintos autoescaladores y sus funciones."],
    commonMistakes: ["No definir requests, de modo que el scheduler sobrecarga los nodos.", "Autoescalar por CPU un servicio limitado por E/S."],
    followUpQuestions: ["¿Por qué los limits de CPU pueden aumentar la latencia?", "¿Con qué métrica escalarías un consumidor de una cola?"],
  },
  'ops-014': {
    question: "¿Cómo gestionarías la configuración, los secretos y los despliegues en varios entornos de Kubernetes?",
    intent: "El entrevistador evalúa el diseño avanzado de plataformas: GitOps, gestión de secretos y coherencia entre entornos.",
    expectedAnswer:
      "Mantendría todos los manifiestos en Git como única fuente de verdad y usaría una herramienta GitOps como Argo CD o Flux para aplicarlos, de modo que el clúster converja continuamente hacia lo que hay en el repositorio, cada cambio se revise y sea auditable, y el rollback sea un git revert. Para no duplicar YAML, usaría charts de Helm u overlays de Kustomize: una base común con pequeñas diferencias explícitas por entorno, como el número de réplicas, el tamaño de los recursos y los endpoints. La configuración no sensible va en ConfigMaps. Los secretos no deben guardarse en texto plano en Git; por defecto, los Secrets de Kubernetes solo están codificados en base64, así que usaría un almacén de secretos externo, como el gestor de secretos de un proveedor cloud o Vault, sincronizado con el External Secrets Operator, o cifraría los secretos en Git con Sealed Secrets o SOPS. También activaría el cifrado en reposo de los Secrets en el clúster y restringiría el acceso con RBAC. La promoción entre entornos se haría actualizando las etiquetas de imagen mediante pull requests, idealmente automatizadas desde CI, con comprobaciones de políticas y, para producción, puntos de aprobación. Así los entornos son reproducibles y las desviaciones (drift) son visibles.",
    explanation:
      "GitOps aporta auditabilidad y rollback, las plantillas mantienen la coherencia entre entornos y la gestión externa de secretos evita filtrar credenciales. Son prácticas esenciales de las plataformas maduras.",
    tips: ["Explica GitOps y sus beneficios.", "Di por qué los Secrets en base64 no son cifrado.", "Describe la promoción entre entornos."],
    commonMistakes: ["Aplicar manifiestos a mano con kubectl en producción.", "Hacer commit de secretos en el repositorio."],
    followUpQuestions: ["¿Cómo detectas las desviaciones entre Git y el clúster?", "Helm o Kustomize: ¿cómo elegirías?"],
  },
  'ops-015': {
    question: "¿Cuál es la diferencia entre integración continua, entrega continua y despliegue continuo?",
    intent: "El entrevistador comprueba un concepto básico de DevOps y su vocabulario preciso.",
    expectedAnswer:
      "La integración continua significa que los desarrolladores fusionan cambios pequeños en la rama principal con frecuencia, y cada cambio se construye y se prueba automáticamente, de modo que los problemas de integración se detectan pronto. La entrega continua va más allá: cada cambio que supera el pipeline produce un artefacto listo para publicarse que puede desplegarse en producción en cualquier momento, normalmente con un paso de aprobación manual. El despliegue continuo da un paso más: cada cambio que supera todas las comprobaciones se despliega en producción automáticamente, sin aprobación manual. El objetivo de las tres es lograr cambios pequeños, frecuentes y de bajo riesgo, y un feedback rápido.",
    explanation:
      "La diferencia entre la entrega y el despliegue continuos es la aprobación manual antes de producción.",
    tips: ["Explica con claridad la diferencia entre entrega y despliegue.", "Menciona los cambios pequeños y frecuentes."],
    commonMistakes: ["Usar entrega continua y despliegue continuo como sinónimos."],
    followUpQuestions: ["¿Qué requisitos previos hacen falta para el despliegue continuo?", "¿Cómo ayudan los feature flags?"],
  },
  'ops-016': {
    question: "¿Qué etapas incluirías en un buen pipeline de CI/CD?",
    intent: "El entrevistador comprueba el diseño práctico de pipelines y de los controles de calidad.",
    expectedAnswer:
      "Un pipeline típico empieza con comprobaciones rápidas para que los desarrolladores reciban feedback pronto: instalación con dependencias en caché, linting, formato y comprobación de tipos, y después los tests unitarios. A continuación vienen la construcción del artefacto o de la imagen de contenedor, los tests de integración, por ejemplo con una base de datos real en un contenedor, y las comprobaciones de seguridad, como el análisis de vulnerabilidades de dependencias e imágenes y la detección de secretos. El artefacto se construye una sola vez, se versiona y se guarda en un registro, y luego se promueve entre entornos en lugar de reconstruirse para cada uno. Tras el despliegue en un entorno de pruebas o de staging se ejecutan smoke tests o tests end-to-end sobre los flujos críticos. El despliegue en producción usa una estrategia segura, como rolling o canary, con rollback automático si fallan los health checks. En todo momento, el pipeline debe estar definido como código, ser rápido y fiable, y dar mensajes de error claros.",
    explanation:
      "Ordenar las comprobaciones de la más rápida a la más lenta, construir una sola vez y promover el mismo artefacto son los principios de diseño clave.",
    tips: ["Ordena las etapas de la más rápida a la más lenta.", "Menciona construir una sola vez y promover.", "Incluye comprobaciones de seguridad."],
    commonMistakes: ["Reconstruir el artefacto por separado para cada entorno.", "Poner primero los tests end-to-end lentos."],
    followUpQuestions: ["¿Cómo mantendrías un pipeline por debajo de diez minutos?", "¿Dónde ejecutarías las migraciones de base de datos?"],
  },
  'ops-017': {
    question: "Compara los despliegues rolling, blue-green y canary.",
    intent: "El entrevistador comprueba tus conocimientos sobre estrategias de publicación y sus perfiles de riesgo.",
    expectedAnswer:
      "Un despliegue rolling sustituye gradualmente las instancias de la versión antigua por la nueva; no necesita infraestructura adicional, pero ambas versiones conviven al mismo tiempo y hacer rollback implica volver a desplegar de forma progresiva. El despliegue blue-green mantiene dos entornos completos: la nueva versión se despliega en el que está inactivo, se prueba y el tráfico se conmuta de una sola vez, normalmente en el balanceador de carga; el rollback es instantáneo volviendo a conmutar, pero duplica la infraestructura durante la publicación y exige cambios de base de datos compatibles con ambas versiones. Un despliegue canary envía una pequeña parte del tráfico, por ejemplo el 5 %, a la nueva versión, monitoriza las tasas de error y la latencia y luego aumenta progresivamente; limita el impacto de los bugs a unos pocos usuarios y aporta feedback real de producción, pero requiere una buena monitorización y herramientas de reparto de tráfico como un service mesh o Argo Rollouts. Los feature flags complementan las tres estrategias al separar el despliegue de la publicación.",
    explanation:
      "Cada estrategia equilibra coste, rapidez del rollback y exposición al riesgo. Los despliegues canary necesitan una observabilidad sólida para ser útiles.",
    tips: ["Da una ventaja y un coste de cada una.", "Menciona la compatibilidad de la base de datos.", "Menciona los feature flags."],
    commonMistakes: ["Hacer un despliegue canary sin monitorizar específicamente el canary.", "Olvidar que ambas versiones comparten la misma base de datos."],
    followUpQuestions: ["¿Cómo automatizarías el análisis de un canary?", "¿En qué se diferencian los feature flags de los despliegues canary?"],
  },
  'ops-018': {
    question: "Explica los conceptos principales de GitLab CI/CD.",
    intent: "El entrevistador comprueba el conocimiento práctico de una plataforma de CI muy utilizada.",
    expectedAnswer:
      "Un pipeline de GitLab se define en un archivo .gitlab-ci.yml en la raíz del repositorio. Está formado por jobs agrupados en stages; los jobs de un mismo stage se ejecutan en paralelo y los stages se ejecutan en orden, aunque needs permite que un job empiece en cuanto terminan sus dependencias, creando un grafo dirigido más rápido. Cada job se ejecuta en un runner, que puede ser compartido, de grupo o autoalojado, a menudo dentro de una imagen Docker definida con image. Los artifacts pasan a jobs posteriores los archivos producidos por un job, como el resultado de un build o un informe de tests, y se pueden descargar, mientras que cache acelera el trabajo repetido entre pipelines, como la descarga de dependencias. rules controla cuándo se ejecuta un job, por ejemplo solo en merge requests, en la rama por defecto o en tags. Las variables, incluidas las variables de CI/CD protegidas y enmascaradas para los secretos, configuran los jobs. Los environments registran los despliegues, y los jobs manuales con environments protegidos sirven como puntos de aprobación. Las plantillas e include permiten a los equipos reutilizar definiciones de pipeline.",
    explanation:
      "Conocer los stages, los jobs, los runners, la diferencia entre artifacts y cache, y rules basta para leer y mejorar la mayoría de los pipelines de GitLab.",
    example: "test:\n  stage: test\n  image: node:22\n  cache: { key: { files: [pnpm-lock.yaml] }, paths: [.pnpm-store] }\n  script: [pnpm install --frozen-lockfile, pnpm test]\n  rules:\n    - if: $CI_PIPELINE_SOURCE == \"merge_request_event\"",
    tips: ["Distingue los artifacts de la cache.", "Menciona rules y needs.", "Explica cómo se guardan los secretos."],
    commonMistakes: ["Usar cache para pasar resultados de build entre jobs.", "Guardar secretos directamente en .gitlab-ci.yml."],
    followUpQuestions: ["¿Cómo funcionan las variables protegidas?", "¿Cómo compartirías una plantilla de pipeline entre proyectos?"],
  },
  'ops-019': {
    question: "Tu pipeline de CI tarda 40 minutos. ¿Cómo lo acelerarías?",
    intent: "El entrevistador comprueba tu capacidad práctica para resolver problemas de productividad de los desarrolladores.",
    expectedAnswer:
      "Primero mediría en qué se va el tiempo revisando la duración de los jobs en los pipelines recientes, ya que unos pocos jobs suelen concentrar la mayor parte. Después aplicaría las mejoras pertinentes. Cachear las dependencias según el lockfile para no descargarlas cada vez. Usar la caché de capas de Docker o una caché de build remota. Ejecutar en paralelo los jobs independientes y usar grafos de dependencias, como needs en GitLab, en lugar de stages estrictos. Dividir los conjuntos de tests largos en shards paralelos. Ejecutar solo lo afectado por un cambio, algo que herramientas como Nx, Turborepo o Bazel permiten en monorepos, manteniendo una ejecución completa en la rama principal. Mover los tests end-to-end lentos a una etapa posterior o a una ejecución programada, y mantener un pequeño conjunto de smoke tests en cada merge request. Usar runners más rápidos o con autoescalado si las máquinas son el cuello de botella. Eliminar los tests inestables (flaky) que provocan reintentos. Tras cada cambio, seguiría la duración mediana y la del peor caso del pipeline para confirmar la mejora.",
    explanation:
      "Medir primero y luego cachear, paralelizar y ejecutar solo el trabajo afectado son las palancas principales. Los pipelines rápidos mejoran directamente la productividad del equipo.",
    tips: ["Empieza por medir.", "Menciona la caché, el paralelismo y la ejecución solo de lo afectado.", "Sigue la mejora a lo largo del tiempo."],
    commonMistakes: ["Borrar tests para que el pipeline sea más rápido.", "Optimizar un job que no está en la ruta crítica."],
    followUpQuestions: ["¿Cómo divides un conjunto de tests en shards?", "¿Qué riesgo tiene ejecutar solo los tests afectados?"],
  },
  'ops-020': {
    question: "¿Cómo diseñarías el CI/CD de un monorepo que contiene muchos servicios?",
    intent: "El entrevistador evalúa la arquitectura avanzada de pipelines a escala y la autonomía de los equipos.",
    expectedAnswer:
      "Los objetivos principales son la velocidad, el aislamiento entre equipos y la seguridad. Detectaría qué proyectos se ven afectados por un cambio usando el grafo de dependencias del monorepo, con herramientas como Nx, Turborepo, Bazel o reglas basadas en rutas, de modo que un cambio en un servicio construya y pruebe solo ese servicio y los proyectos que dependen de él, mientras que los cambios en librerías compartidas disparan sus dependientes. Aun así, se ejecutaría una validación completa en la rama principal o de forma programada. Los pasos comunes, como el linting, los tests y la construcción de imágenes, vendrían de plantillas de pipeline compartidas y versionadas, y cada servicio mantendría su propia configuración de despliegue, sus responsables y sus reglas de aprobación, por ejemplo mediante CODEOWNERS. Cada servicio se versionaría y desplegaría de forma independiente, con tags de release que identifiquen el servicio, como orders-v1.4.0. La caché remota de resultados de build y de tests acelera el trabajo de los desarrolladores y del CI. También me aseguraría de que los archivos raíz compartidos, como los lockfiles y la configuración de CI, tengan responsables claros y un proceso de cambio, porque afectan a todos los equipos. La observabilidad de la duración y la tasa de fallos de los pipelines por proyecto ayuda a detectar problemas.",
    explanation:
      "El CI de un monorepo funciona cuando construye solo lo que ha cambiado, comparte plantillas y mantiene despliegues independientes. Las respuestas avanzadas también abordan la propiedad de los archivos compartidos.",
    tips: ["Explica la detección de proyectos afectados.", "Menciona las plantillas compartidas y los despliegues independientes.", "Aborda la propiedad de la configuración compartida."],
    commonMistakes: ["Ejecutar todos los tests de todos los proyectos en cada commit.", "Desplegar todos los servicios a la vez en cada merge."],
    followUpQuestions: ["¿Cómo gestionas un cambio incompatible en una librería compartida?", "¿Qué es la caché remota?"],
  },
  'ops-021': {
    question: "¿Cómo aseguras un pipeline de CI/CD y la cadena de suministro de software?",
    intent: "El entrevistador evalúa una conciencia de seguridad avanzada: los pipelines son un objetivo muy valioso para los atacantes.",
    expectedAnswer:
      "Un pipeline comprometido puede llevar código malicioso a producción, así que lo trataría como infraestructura crítica. Los secretos deben guardarse en las variables protegidas y enmascaradas de la plataforma de CI o en un vault externo, limitados a los jobs y ramas que los necesitan, e idealmente sustituidos por credenciales de corta duración mediante federación OIDC con el proveedor cloud en lugar de claves de larga duración. Las ramas y tags protegidos, las revisiones obligatorias y los permisos restringidos para modificar las definiciones del pipeline evitan cambios no autorizados. Las merge requests procedentes de forks no deben tener acceso a los secretos. Los runners de los despliegues en producción deben estar aislados y ser efímeros. Para las dependencias, fijaría las versiones con lockfiles, usaría registros de confianza o un proxy, y analizaría vulnerabilidades conocidas y paquetes maliciosos. Los builds deben generar un SBOM, y los artefactos y las imágenes deben firmarse, por ejemplo con cosign, con atestaciones de procedencia según las directrices de SLSA, y los despliegues deben verificar las firmas. Las acciones o plantillas de CI de terceros deben fijarse a una versión o un commit concretos. Por último, los logs de auditoría y las alertas sobre actividad inusual en el pipeline ayudan a detectar un compromiso.",
    explanation:
      "La seguridad de la cadena de suministro abarca los secretos, la integridad del código, las dependencias y la procedencia de los artefactos. Los candidatos avanzados mencionan las credenciales de corta duración, la firma y SLSA.",
    tips: ["Cubre los secretos, los permisos, las dependencias y los artefactos.", "Menciona OIDC en lugar de claves de larga duración.", "Explica la firma y la procedencia."],
    commonMistakes: ["Dar a todos los jobs acceso a los secretos de producción.", "Usar componentes de CI de terceros sin fijar sus versiones."],
    followUpQuestions: ["¿Qué es SLSA?", "¿Cómo elimina la federación OIDC la necesidad de guardar claves cloud?"],
  },
  'ops-022': {
    question: "¿Cuál es la diferencia entre git merge y git rebase?",
    intent: "El entrevistador comprueba una habilidad esencial de Git y el conocimiento de las convenciones de equipo.",
    expectedAnswer:
      "Ambos integran los cambios de una rama en otra. git merge crea un commit de merge que une los dos historiales y conserva cada commit exactamente como era; el historial muestra cuándo se combinaron las ramas, pero puede volverse confuso. git rebase mueve los commits de tu rama encima de la rama de destino, reescribiéndolos como commits nuevos, lo que produce un historial lineal más fácil de leer. Como rebase reescribe el historial, no debes hacer rebase de commits sobre los que otras personas ya han basado su trabajo, como una rama compartida, salvo que el equipo esté de acuerdo. Una práctica habitual es hacer rebase de tu propia rama de funcionalidad sobre main para mantenerla al día y después fusionarla, a veces con un squash merge para conservar un único commit limpio por cambio.",
    explanation:
      "Merge conserva el historial; rebase lo reescribe para hacerlo lineal. La regla de oro es no reescribir el historial compartido.",
    tips: ["Explica la regla de oro del rebase.", "Menciona los squash merges como opción de equipo."],
    commonMistakes: ["Hacer force push de una rama compartida tras un rebase sin avisar a los compañeros."],
    followUpQuestions: ["¿Qué te permite hacer un rebase interactivo?", "¿Qué es un merge fast-forward?"],
  },
};
