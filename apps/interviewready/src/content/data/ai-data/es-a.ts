import type { QuestionText, TextTable } from '@/types/content';

/** Preguntas de IA y datos 001-022: machine learning, deep learning, LLM, RAG (parte). */
export const esA: TextTable<QuestionText> = {
  'ai-001': {
    question: "¿Cuál es la diferencia entre el aprendizaje supervisado, el no supervisado y el aprendizaje por refuerzo?",
    intent: "El entrevistador comprueba que conoces las principales familias del machine learning y cuándo se aplica cada una.",
    expectedAnswer:
      "El aprendizaje supervisado entrena un modelo con ejemplos etiquetados, es decir, entradas cuya salida correcta se conoce, para predecir la salida de nuevas entradas: clasificación, como spam o no spam, o regresión, como predecir el precio de una vivienda. El aprendizaje no supervisado encuentra estructura en datos sin etiquetar: agrupar clientes en segmentos (clustering), reducir la dimensionalidad o detectar anomalías. El aprendizaje por refuerzo entrena un agente que actúa en un entorno y aprende a partir de recompensas y penalizaciones; se usa en juegos, robótica o estrategias de recomendación. También existe el aprendizaje autosupervisado, en el que las etiquetas provienen de los propios datos, como predecir la siguiente palabra, que es la forma en que se preentrenan los grandes modelos de lenguaje.",
    explanation:
      "La disponibilidad de etiquetas y el tipo de retroalimentación determinan la familia. El aprendizaje autosupervisado es el puente hacia los modelos fundacionales modernos.",
    tips: ["Da un ejemplo de negocio para cada familia.", "Menciona el aprendizaje autosupervisado en los LLM."],
    commonMistakes: ["Decir que el aprendizaje no supervisado no tiene ningún objetivo.", "Confundir la clasificación con el clustering."],
    followUpQuestions: ["¿Cómo segmentarías clientes sin etiquetas?", "¿Qué es el aprendizaje semisupervisado?"],
  },
  'ai-002': {
    question: "¿Qué son el sobreajuste (overfitting) y el subajuste (underfitting), y cómo los detectas?",
    intent: "El entrevistador comprueba el concepto más fundamental de la evaluación de modelos.",
    expectedAnswer:
      "El sobreajuste ocurre cuando un modelo aprende los datos de entrenamiento con demasiado detalle, incluido su ruido, de modo que rinde muy bien en ellos pero mal con datos nuevos. El subajuste ocurre cuando un modelo es demasiado simple para capturar el patrón subyacente, por lo que rinde mal en ambos casos. Se detectan comparando las puntuaciones de entrenamiento y de validación: una gran diferencia sugiere sobreajuste, y puntuaciones bajas en ambos sugieren subajuste. Es el compromiso sesgo-varianza: los modelos simples tienen un sesgo alto y los complejos, una varianza alta. Los remedios contra el sobreajuste incluyen más datos, regularización, modelos más simples, early stopping o dropout en redes neuronales; contra el subajuste, modelos más expresivos, mejores features o entrenar durante más tiempo.",
    explanation:
      "El objetivo es generalizar a datos no vistos. Comparar el rendimiento en entrenamiento y en validación es la herramienta de diagnóstico básica.",
    tips: ["Explica cómo comparar las puntuaciones de entrenamiento y de validación.", "Propón remedios para ambos problemas."],
    commonMistakes: ["Evaluar un modelo solo con los datos con los que se entrenó."],
    followUpQuestions: ["¿Qué es la regularización?", "¿Cómo ayudan las curvas de aprendizaje?"],
  },
  'ai-003': {
    question: "¿Por qué dividimos los datos en conjuntos de entrenamiento, validación y prueba? ¿Qué es la validación cruzada?",
    intent: "El entrevistador comprueba que aplicas una metodología de evaluación correcta.",
    expectedAnswer:
      "El conjunto de entrenamiento sirve para ajustar el modelo. El conjunto de validación sirve para comparar modelos y ajustar hiperparámetros, como la profundidad de un árbol o la tasa de aprendizaje. El conjunto de prueba se reserva hasta el final para estimar el rendimiento con datos realmente no vistos; si ajustas con él, la estimación se vuelve demasiado optimista. Una división típica puede ser 70/15/15, según el volumen de datos. La validación cruzada, por ejemplo k-fold, divide los datos en k partes, entrena k veces validando cada vez en una parte distinta y promedia los resultados. Ofrece una estimación más fiable cuando hay pocos datos. En series temporales, las divisiones deben respetar el orden temporal, entrenando con el pasado y validando con el futuro, para no usar información del futuro.",
    explanation:
      "Separar datos para el ajuste y para la evaluación final evita engañarte sobre el rendimiento real.",
    tips: ["Explica el papel de cada conjunto.", "Menciona las divisiones temporales en series temporales."],
    commonMistakes: ["Ajustar hiperparámetros con el conjunto de prueba.", "Mezclar aleatoriamente datos de series temporales antes de dividirlos."],
    followUpQuestions: ["¿Qué es el muestreo estratificado?", "¿Cómo dividirías datos en los que el mismo cliente aparece muchas veces?"],
  },
  'ai-004': {
    question: "¿Cómo eliges una métrica de evaluación para un problema de clasificación, sobre todo con clases desbalanceadas?",
    intent: "El entrevistador comprueba si relacionas las métricas con el impacto en el negocio en lugar de recurrir por defecto a la exactitud (accuracy).",
    expectedAnswer:
      "La exactitud (accuracy) es engañosa cuando las clases están desbalanceadas: un modelo de fraude que siempre predice «no fraude» puede tener un 99 % de exactitud y ser inútil. La precisión es la proporción de predicciones positivas que son correctas; la exhaustividad (recall) es la proporción de positivos reales que se detectan. El F1 equilibra ambas. La elección depende del coste de los errores: en la detección de fraude o el cribado médico, pasar por alto un positivo es caro, así que importa más el recall; en el filtrado de spam, marcar un correo legítimo es costoso, así que importa más la precisión. El ROC-AUC mide la calidad del ordenamiento en todos los umbrales, pero con un desbalance fuerte la curva precisión-recall y el PR-AUC son más informativos. El propio umbral de decisión debe elegirse con el negocio, según el coste relativo de los falsos positivos y los falsos negativos, y la matriz de confusión hace concretos esos compromisos.",
    explanation:
      "Las métricas reflejan las prioridades del negocio. Los entrevistadores quieren ver que razonas sobre el coste de cada tipo de error.",
    tips: ["Explica por qué la exactitud falla con datos desbalanceados.", "Relaciona la precisión y el recall con los costes del negocio.", "Menciona la elección del umbral."],
    commonMistakes: ["Reportar solo la exactitud.", "Usar un umbral por defecto de 0,5 sin pensarlo."],
    followUpQuestions: ["¿Cómo elegirías el umbral de un modelo de fraude?", "¿Qué muestra una matriz de confusión?"],
  },
  'ai-005': {
    question: "¿Qué es la fuga de datos (data leakage) y cómo la evitas?",
    intent: "El entrevistador comprueba que conoces un error sutil que hace que los modelos parezcan mucho mejores de lo que son.",
    expectedAnswer:
      "La fuga de datos ocurre cuando durante el entrenamiento se usa información que no estará disponible en el momento de la predicción, de modo que las puntuaciones de validación son irrealmente altas y el modelo falla en producción. Ejemplos: una feature calculada después del evento que se quiere predecir, como la «fecha de cierre de la cuenta» para predecir el abandono (churn); escalar o imputar valores con estadísticas de todo el dataset antes de dividirlo; que el mismo cliente o paciente aparezca tanto en el conjunto de entrenamiento como en el de prueba; o hacer divisiones aleatorias en series temporales, lo que permite al modelo aprender del futuro. Para evitarla, primero divido los datos y luego ajusto los pasos de preprocesamiento solo con los datos de entrenamiento, idealmente dentro de un pipeline; compruebo que cada feature se conocería en el momento de la predicción; divido por entidad o por tiempo cuando procede; y desconfío de los resultados que parecen demasiado buenos.",
    explanation:
      "La fuga de datos es una de las causas más frecuentes de modelos que fallan tras el despliegue. Pensar en «qué se sabe en el momento de la predicción» evita la mayoría de los casos.",
    tips: ["Da al menos dos ejemplos concretos de fuga de datos.", "Menciona que el preprocesamiento se ajusta solo con los datos de entrenamiento."],
    commonMistakes: ["Normalizar todo el dataset antes de dividirlo.", "Ignorar los duplicados entre conjuntos."],
    followUpQuestions: ["¿Cómo detectarías una fuga de datos a posteriori?", "¿Por qué los pipelines ayudan a evitar la fuga de datos?"],
  },
  'ai-006': {
    question: "¿Cómo tratarías un dataset muy desbalanceado?",
    intent: "El entrevistador comprueba que conoces técnicas prácticas más allá de entrenar un modelo directamente con los datos en bruto.",
    expectedAnswer:
      "Primero elegiría métricas adecuadas, como la precisión, el recall o el PR-AUC, y una división estratificada para que cada conjunto contenga suficientes ejemplos de la clase minoritaria. Después, varias técnicas pueden ayudar. A nivel de datos: submuestrear la clase mayoritaria, sobremuestrear la minoritaria o generar ejemplos sintéticos con métodos como SMOTE, siempre aplicados solo a los datos de entrenamiento. A nivel de algoritmo: pesos de clase que encarecen los errores en la clase minoritaria, que la mayoría de las bibliotecas admiten, o modelos como los árboles con gradient boosting, que suelen manejar bien el desbalance. A nivel de decisión: ajustar el umbral de clasificación según los costes del negocio en lugar de usar 0,5. Conseguir más ejemplos minoritarios, o mejores features que separen las clases, suele ayudar más que cualquier truco de remuestreo. En casos extremos, los enfoques de detección de anomalías pueden ser más adecuados que la clasificación.",
    explanation:
      "El desbalance se aborda combinando métricas, datos, algoritmos y umbrales. Remuestrear el conjunto de prueba daría resultados engañosos.",
    tips: ["Empieza por la métrica adecuada.", "Menciona los pesos de clase y el ajuste del umbral.", "Advierte contra remuestrear los datos de validación o de prueba."],
    commonMistakes: ["Sobremuestrear antes de dividir, lo que provoca fuga de datos.", "Juzgar el modelo por su exactitud."],
    followUpQuestions: ["¿Cuándo usarías detección de anomalías en su lugar?", "¿Cómo crea SMOTE ejemplos sintéticos?"],
  },
  'ai-007': {
    question: "¿Cómo despliegas y mantienes un modelo de machine learning en producción?",
    intent: "El entrevistador evalúa tu madurez en MLOps: reproducibilidad, monitorización y ciclo de vida del modelo.",
    expectedAnswer:
      "Un modelo en producción es un sistema de software que depende de datos, así que trataría el entrenamiento como un pipeline reproducible: código versionado, datasets o snapshots de datos versionados, experimentos e hiperparámetros registrados con una herramienta como MLflow, y modelos almacenados en un registro con sus métricas y su linaje. El servicio depende de la necesidad: scoring por lotes programado, una API en tiempo real con requisitos de latencia o modelos embebidos. Las features deben calcularse igual en el entrenamiento y en el servicio para evitar el training-serving skew, algo en lo que ayudan un feature store o un código de transformación compartido. Antes de un lanzamiento completo, compararía el nuevo modelo con el actual mediante un despliegue en sombra (shadow deployment) o un test A/B sobre métricas de negocio. En producción, monitorizo métricas técnicas, como la latencia y los errores, la deriva de datos (data drift), cuando cambian las distribuciones de entrada, la deriva de las predicciones y, cuando las etiquetas llegan más tarde, el rendimiento real. Las alertas por deriva o caída de rendimiento desencadenan una investigación y un reentrenamiento, que puede programarse o automatizarse con puertas de validación. Por último, documento el uso previsto del modelo y sus limitaciones, y mantengo la posibilidad de volver a la versión anterior (rollback).",
    explanation:
      "Los modelos se degradan a medida que el mundo cambia. Las respuestas avanzadas cubren reproducibilidad, skew, despliegue seguro, monitorización de la deriva y reentrenamiento.",
    tips: ["Cubre el ciclo de vida desde el entrenamiento hasta el reentrenamiento.", "Menciona el training-serving skew y la deriva.", "Explica métodos de despliegue seguro."],
    commonMistakes: ["Desplegar un notebook sin un entrenamiento reproducible.", "Monitorizar solo la latencia y no la calidad de las predicciones."],
    followUpQuestions: ["¿Cómo monitorizas un modelo cuando las etiquetas llegan semanas después?", "¿Qué es un feature store?"],
  },
  'ai-008': {
    question: "¿Cómo aprende una red neuronal?",
    intent: "El entrevistador comprueba que entiendes conceptualmente las redes neuronales.",
    expectedAnswer:
      "Una red neuronal está formada por capas de unidades, o neuronas. Cada unidad calcula una suma ponderada de sus entradas, añade un sesgo (bias) y aplica una función de activación no lineal como ReLU; apilar capas permite a la red representar funciones complejas. Aprender significa ajustar los pesos para reducir una función de pérdida que mide cuánto se equivocan las predicciones, por ejemplo la entropía cruzada en clasificación. En cada paso de entrenamiento, la red hace predicciones sobre un lote (batch) de ejemplos, calcula la pérdida; luego la retropropagación (backpropagation) calcula cuánto contribuyó cada peso al error mediante la regla de la cadena, y un optimizador como el descenso de gradiente actualiza ligeramente los pesos en la dirección que reduce la pérdida. Repetir esto durante muchos lotes y épocas mejora gradualmente el modelo.",
    explanation:
      "La pasada hacia delante, la pérdida, la retropropagación y la actualización de los pesos forman el bucle de entrenamiento en el que se basa todo el deep learning.",
    tips: ["Describe los cuatro pasos de una iteración de entrenamiento.", "Explica por qué importan las activaciones no lineales."],
    commonMistakes: ["Describir las redes neuronales como una copia del cerebro humano.", "Olvidar el papel de la función de pérdida."],
    followUpQuestions: ["¿Por qué necesitamos funciones de activación?", "¿Qué es una época?"],
  },
  'ai-009': {
    question: "Explica el descenso de gradiente y el papel de la tasa de aprendizaje.",
    intent: "El entrevistador comprueba que entiendes la optimización, que afecta a la estabilidad y la velocidad del entrenamiento.",
    expectedAnswer:
      "El descenso de gradiente minimiza una función de pérdida moviendo repetidamente los parámetros del modelo en la dirección opuesta al gradiente, que es la dirección de máximo crecimiento. La tasa de aprendizaje controla el tamaño de cada paso. Si es demasiado grande, el entrenamiento oscila o diverge; si es demasiado pequeña, el entrenamiento es muy lento y puede estancarse. El descenso de gradiente por lotes completos usa todos los datos en cada paso, lo que es costoso; el descenso de gradiente estocástico y por mini-lotes usa lotes pequeños, con pasos más ruidosos pero mucho más rápidos, lo que a menudo ayuda a generalizar. Optimizadores como momentum, RMSProp y Adam, o AdamW con weight decay desacoplado, adaptan el tamaño del paso para cada parámetro y aceleran la convergencia. Las planificaciones de la tasa de aprendizaje, como un calentamiento (warm-up) seguido de un decaimiento, son habituales, sobre todo en transformers.",
    explanation:
      "La tasa de aprendizaje suele ser el hiperparámetro más importante. Los optimizadores adaptativos y las planificaciones hacen el entrenamiento más robusto.",
    tips: ["Describe qué ocurre cuando la tasa de aprendizaje es demasiado alta o demasiado baja.", "Menciona los mini-lotes y Adam."],
    commonMistakes: ["Pensar que una tasa de aprendizaje mayor siempre entrena más rápido."],
    followUpQuestions: ["¿Qué es un warm-up de la tasa de aprendizaje?", "¿Por qué el ruido de los mini-lotes podría ayudar a generalizar?"],
  },
  'ai-010': {
    question: "¿Qué es el desvanecimiento del gradiente (vanishing gradients) y qué técnicas ayudan a entrenar redes profundas?",
    intent: "El entrevistador comprueba que conoces problemas prácticos del deep learning y sus soluciones.",
    expectedAnswer:
      "En las redes profundas, la retropropagación multiplica los gradientes a través de muchas capas. Con funciones de activación como la sigmoide, cuyas derivadas son pequeñas, los gradientes pueden reducirse exponencialmente y las primeras capas apenas aprenden: es el desvanecimiento del gradiente. Lo contrario, la explosión del gradiente, hace que el entrenamiento sea inestable. Las soluciones incluyen activaciones de la familia ReLU, que evitan que el gradiente se reduzca para entradas positivas; una inicialización cuidadosa de los pesos, como He o Xavier; capas de normalización, batch normalization en modelos de visión o layer normalization en transformers, que estabilizan las activaciones; conexiones residuales, usadas en ResNet y en los transformers, que dan al gradiente un camino directo a través de la red; y el recorte del gradiente (gradient clipping) contra las explosiones. La regularización, como dropout y weight decay, combate el sobreajuste y no el problema del gradiente, pero suele formar parte de la misma receta de entrenamiento.",
    explanation:
      "Las conexiones residuales y la normalización son las principales razones por las que se pueden entrenar de forma fiable redes muy profundas, incluidos los transformers.",
    tips: ["Explica por qué se desvanecen los gradientes.", "Enumera varias técnicas y qué resuelve cada una."],
    commonMistakes: ["Confundir dropout con una solución al desvanecimiento del gradiente."],
    followUpQuestions: ["¿Cómo funciona una conexión residual?", "¿Por qué los transformers usan layer normalization en lugar de batch normalization?"],
  },
  'ai-011': {
    question: "Explica cómo funcionan la arquitectura transformer y la autoatención (self-attention).",
    intent: "El entrevistador evalúa si entiendes a fondo la arquitectura en la que se basan los modelos de lenguaje modernos.",
    expectedAnswer:
      "Un transformer procesa una secuencia de tokens, cada uno representado por un embedding más información posicional, ya que la atención en sí no tiene noción del orden. El mecanismo central es la autoatención: para cada token, el modelo calcula un vector de consulta (query), uno de clave (key) y uno de valor (value) mediante proyecciones aprendidas. El peso de atención entre dos tokens es el producto escalar de la query de uno con la key del otro, escalado por la raíz cuadrada de la dimensión y normalizado con softmax; la salida de cada token es la suma ponderada de todos los values. Esto permite que cada token recoja información de cualquier otro directamente, capturando dependencias de largo alcance y permitiendo el cálculo en paralelo, a diferencia de las redes recurrentes. La atención multi-cabeza (multi-head attention) ejecuta varias operaciones de atención en paralelo para que el modelo pueda atender a distintos tipos de relaciones. Cada bloque combina la atención con una red feed-forward, conexiones residuales y layer normalization, y se apilan muchos bloques. Los modelos solo decodificador (decoder-only), como GPT, usan un enmascaramiento causal para que un token solo atienda a los anteriores, lo que permite predecir el siguiente token. El principal coste es que la atención es cuadrática respecto a la longitud de la secuencia, lo que motiva técnicas como kernels de atención eficientes y la caché de claves y valores (KV cache) durante la generación.",
    explanation:
      "Queries, keys y values, la atención multi-cabeza y el enmascaramiento causal son los conceptos esenciales. Mencionar el coste cuadrático y la KV cache demuestra profundidad práctica.",
    tips: ["Explica Q, K y V con claridad.", "Compáralo con las redes recurrentes.", "Menciona el enmascaramiento causal y el coste cuadrático."],
    commonMistakes: ["Describir la atención de forma vaga como «el modelo se fija en las palabras importantes» sin explicar el mecanismo."],
    followUpQuestions: ["¿Qué es una KV cache?", "¿Cuál es la diferencia entre los modelos solo codificador (encoder-only) y solo decodificador (decoder-only)?"],
  },
  'ai-012': {
    question: "¿Cuándo entrenarías un modelo desde cero, harías fine-tuning de un modelo preentrenado o usarías transfer learning?",
    intent: "El entrevistador evalúa tu toma de decisiones práctica en función de los datos, el coste y los objetivos.",
    expectedAnswer:
      "Entrenar desde cero requiere enormes cantidades de datos y de cómputo, y solo se justifica cuando no existe un modelo preentrenado adecuado, por ejemplo con tipos de datos poco comunes, o cuando eres una empresa que construye modelos fundacionales. El transfer learning reutiliza un modelo preentrenado con un gran dataset y lo adapta: puedes congelar la mayoría de las capas y entrenar solo una nueva cabeza, lo que funciona bien con datasets pequeños, por ejemplo para clasificar imágenes médicas con un modelo preentrenado con imágenes generales. El fine-tuning actualiza más pesos, o todos, con los datos específicos de tu tarea, y da mejor rendimiento cuando tienes más datos y el dominio difiere del preentrenamiento. Para los grandes modelos de lenguaje, métodos eficientes en parámetros como LoRA adaptan un modelo entrenando pequeñas matrices adicionales, lo que reduce el coste y la memoria. Antes de cualquier fine-tuning, comprobaría si basta con el prompting o con la generación aumentada por recuperación (RAG), ya que es más barato iterar con ellos. La decisión depende del volumen y la calidad de los datos, la distancia entre dominios, las restricciones de latencia y coste, y la frecuencia con que debe actualizarse el modelo.",
    explanation:
      "La reutilización es la opción por defecto en el machine learning moderno. Las respuestas avanzadas comparan las opciones según datos, coste y mantenimiento, y mencionan el fine-tuning eficiente en parámetros.",
    tips: ["Explica cuándo tiene sentido cada opción.", "Menciona LoRA para los modelos grandes.", "Considera el prompting y RAG antes del fine-tuning."],
    commonMistakes: ["Hacer fine-tuning de un LLM para añadir datos que cambian a menudo, algo que RAG resuelve mejor."],
    followUpQuestions: ["¿Cuántos datos necesitas para un fine-tuning eficaz?", "¿Qué es el olvido catastrófico?"],
  },
  'ai-013': {
    question: "¿Qué es un gran modelo de lenguaje (LLM) y cómo genera texto?",
    intent: "El entrevistador comprueba que tienes un modelo mental básico y correcto de los LLM.",
    expectedAnswer:
      "Un gran modelo de lenguaje es una red neuronal, normalmente un transformer solo decodificador, entrenada con cantidades enormes de texto para predecir el siguiente token, un fragmento de palabra. El texto se divide en tokens y, en cada paso, el modelo calcula una distribución de probabilidad sobre su vocabulario para el siguiente token, elige uno según la configuración de decodificación, lo añade y repite. Tras este preentrenamiento, los modelos suelen ajustarse con instrucciones (instruction tuning) y alinearse con retroalimentación humana para que sigan instrucciones y se comporten de forma útil y segura. Un LLM no busca datos en una base de datos; produce texto basándose en patrones aprendidos durante el entrenamiento, dentro de una ventana de contexto limitada que contiene el prompt y la conversación.",
    explanation:
      "Entender la predicción del siguiente token explica tanto las capacidades impresionantes como las limitaciones de los LLM, como las alucinaciones.",
    tips: ["Explica los tokens y la predicción del siguiente token.", "Menciona el instruction tuning y la ventana de contexto."],
    commonMistakes: ["Decir que el modelo «busca en internet» por defecto.", "Equiparar los tokens con las palabras."],
    followUpQuestions: ["¿Qué es una ventana de contexto?", "¿Por qué a los LLM les puede costar contar las letras de una palabra?"],
  },
  'ai-014': {
    question: "¿Qué son las alucinaciones de los LLM y cómo puedes reducirlas?",
    intent: "El entrevistador comprueba que conoces las limitaciones de los LLM y que diseñas de forma responsable.",
    expectedAnswer:
      "Una alucinación es una salida que suena plausible pero es falsa o no está respaldada, como citas inventadas o datos erróneos. Ocurre porque el modelo genera texto probable en lugar de verificar la verdad, y porque su conocimiento se limita a los datos de entrenamiento, con una fecha de corte. Para reducir las alucinaciones, fundamentaría las respuestas en fuentes fiables con generación aumentada por recuperación (RAG) y pediría al modelo que las cite; le indicaría que diga cuándo no sabe algo; reduciría la aleatoriedad en tareas factuales; usaría salidas estructuradas y validación para los datos críticos; y diseñaría la interfaz para que las personas puedan comprobar las fuentes. En usos de alto riesgo, la revisión humana sigue siendo necesaria. Ninguna técnica elimina por completo las alucinaciones, así que los productos deben ser honestos sobre esta limitación.",
    explanation:
      "Las alucinaciones son inherentes al funcionamiento de los LLM. La fundamentación en fuentes, las restricciones y una UX transparente reducen el riesgo.",
    tips: ["Explica por qué se producen las alucinaciones.", "Propón varias técnicas de mitigación.", "Menciona la honestidad con los usuarios."],
    commonMistakes: ["Afirmar que un prompt puede eliminar las alucinaciones.", "Usar la salida de un LLM para decisiones críticas sin verificarla."],
    followUpQuestions: ["¿Cómo medirías la tasa de alucinaciones de una aplicación?", "¿Cómo ayuda RAG?"],
  },
  'ai-015': {
    question: "¿Qué controlan la temperatura, el top-p y la ventana de contexto?",
    intent: "El entrevistador comprueba tu conocimiento práctico de los parámetros de los LLM que se usan en las aplicaciones.",
    expectedAnswer:
      "La temperatura escala la distribución de probabilidad del siguiente token: valores bajos, cercanos a 0, hacen la salida más determinista y enfocada, adecuada para extracción o clasificación; valores más altos la hacen más variada y creativa. El top-p, o nucleus sampling, restringe las opciones al conjunto más pequeño de tokens cuya probabilidad acumulada alcanza p, por ejemplo 0,9, descartando los tokens poco probables; normalmente se ajusta la temperatura o el top-p, no ambos de forma agresiva. La ventana de contexto es el número máximo de tokens que el modelo puede considerar a la vez, incluidos el prompt del sistema, el historial de la conversación, los documentos recuperados y la respuesta generada. Superarla obliga a truncar o resumir el historial. Los contextos más grandes permiten más información, pero aumentan el coste y la latencia, y los modelos pueden aprovechar con menos fiabilidad la información situada en el medio de contextos largos.",
    explanation:
      "Estos parámetros controlan la aleatoriedad y cuánta información ve el modelo. Elegirlos según la tarea forma parte de construir funcionalidades de LLM fiables.",
    tips: ["Adapta la temperatura a la tarea.", "Explica qué cuenta dentro de la ventana de contexto."],
    commonMistakes: ["Usar una temperatura alta en tareas factuales o estructuradas.", "Llenar la ventana de contexto con documentos irrelevantes."],
    followUpQuestions: ["¿Cómo gestionarías una conversación más larga que la ventana de contexto?", "¿Por qué un contexto largo aumenta el coste?"],
  },
  'ai-016': {
    question: "¿Cómo decides entre prompt engineering, RAG y fine-tuning para una aplicación con LLM?",
    intent: "El entrevistador comprueba tu capacidad para elegir el enfoque eficaz más sencillo.",
    expectedAnswer:
      "Empiezo por el prompt engineering, porque es lo más rápido y barato para iterar: instrucciones claras, ejemplos y formatos de salida resuelven muchas tareas. Si el modelo necesita conocimiento que no tiene, como documentos internos, información reciente o datos específicos de un cliente, añado generación aumentada por recuperación (RAG), que aporta el contexto relevante en el momento de la consulta, mantiene la información actualizada y permite citar las fuentes. El fine-tuning es útil para cambiar el comportamiento más que el conocimiento: un estilo o formato coherente, una tarea especializada que se repite muchas veces, o conseguir que un modelo más pequeño y barato alcance la calidad de uno más grande. Requiere un buen dataset etiquetado, evaluación y reentrenamiento cuando cambian las necesidades. Estos enfoques se combinan bien: un modelo con fine-tuning puede seguir usando RAG. La decisión debe guiarse por un conjunto de evaluación que mida la calidad con ejemplos reales.",
    explanation:
      "El prompting cambia las instrucciones, RAG añade conocimiento y el fine-tuning cambia el comportamiento. Empezar por lo simple y medir es el principio clave.",
    tips: ["Explica qué cambia cada enfoque.", "Menciona la combinación de enfoques.", "Insiste en la evaluación."],
    commonMistakes: ["Hacer fine-tuning para enseñar datos que cambian con frecuencia.", "Elegir un enfoque sin un conjunto de evaluación."],
    followUpQuestions: ["¿Qué tamaño debería tener un conjunto de evaluación?", "¿Qué te haría pasar de RAG a fine-tuning?"],
  },
  'ai-017': {
    question: "¿Cómo evaluarías la calidad de una funcionalidad basada en un LLM antes y después del lanzamiento?",
    intent: "El entrevistador evalúa prácticas avanzadas y basadas en evidencias para sistemas no deterministas.",
    expectedAnswer:
      "Primero definiría con el equipo de producto qué significa «bueno» para la funcionalidad: corrección, completitud, tono, formato, seguridad y latencia, y lo convertiría en criterios medibles. Luego construiría un conjunto de evaluación con entradas realistas, incluidos casos límite y ejemplos adversariales, con respuestas de referencia o rúbricas de calificación, idealmente a partir de datos reales de usuarios y con la privacidad bien gestionada. La evaluación combina varios métodos: comprobaciones exactas o programáticas cuando es posible, como un JSON válido o campos extraídos correctos; métricas basadas en referencias; LLM-as-a-judge con una rúbrica clara, calibrado frente a valoraciones humanas, porque los jueces tienen sesgos como favorecer las respuestas más largas; y revisión humana periódica de muestras. Cada cambio en el prompt, el modelo o el pipeline de recuperación se ejecuta contra esta batería, como si fueran tests de regresión, y los resultados se siguen en el tiempo. Tras el lanzamiento, monitorizaría señales de los usuarios, como pulgares arriba o abajo, ediciones, reintentos y abandonos, revisaría muestras de conversaciones, seguiría el coste y la latencia, e incorporaría los fallos al conjunto de evaluación. Los tests A/B comparan versiones según resultados de negocio.",
    explanation:
      "Las funcionalidades con LLM necesitan baterías de evaluación igual que el código necesita tests. Los candidatos avanzados combinan comprobaciones automáticas, jueces calibrados, revisión humana y feedback de producción.",
    tips: ["Define primero los criterios de calidad.", "Construye un conjunto de evaluación y ejecútalo en cada cambio.", "Explica los límites de LLM-as-a-judge."],
    commonMistakes: ["Juzgar la calidad probando unos pocos prompts a mano.", "Confiar en un juez LLM sin contrastarlo con personas."],
    followUpQuestions: ["¿Cómo evitas que tu conjunto de evaluación quede desactualizado?", "¿Qué sesgos tienen los jueces LLM?"],
  },
  'ai-018': {
    question: "¿Cómo elegirías entre una API de LLM alojada y un modelo de pesos abiertos (open-weights) autoalojado?",
    intent: "El entrevistador evalúa cómo equilibras calidad, coste, privacidad, control y operaciones.",
    expectedAnswer:
      "Compararía las opciones con criterios concretos usando nuestro propio conjunto de evaluación. Calidad: los modelos alojados más potentes suelen liderar en razonamiento complejo, mientras que los modelos de pesos abiertos pueden bastar para tareas más acotadas, sobre todo tras un fine-tuning. Coste: las API cobran por token, lo que es sencillo y barato con poco volumen, mientras que el autoalojamiento tiene costes fijos elevados en GPU e ingeniería, pero puede salir más barato con un volumen alto y estable. Latencia y throughput: el autoalojamiento da control, pero exige planificar la capacidad y optimizar, por ejemplo con cuantización y frameworks de servicio eficientes como vLLM. Privacidad y cumplimiento normativo: algunos datos no pueden salir de nuestra infraestructura o región, lo que favorece el autoalojamiento o proveedores con acuerdos de tratamiento de datos adecuados, alojamiento regional y sin entrenamiento con datos de clientes. Control: el autoalojamiento evita cambios repentinos o retiradas de modelos y permite personalizarlos. Operaciones: el autoalojamiento requiere un equipo que ejecute, monitorice y actualice los modelos. Muchas organizaciones usan ambos, con una capa de abstracción que permite cambiar de modelo, y enrutan las solicitudes sencillas a modelos más pequeños y baratos.",
    explanation:
      "La decisión es multidimensional. Las respuestas avanzadas se apoyan en datos de evaluación y tienen en cuenta el coste total, el cumplimiento normativo y la capacidad operativa.",
    tips: ["Compara según calidad, coste, latencia, privacidad, control y operaciones.", "Menciona una capa de abstracción y el enrutamiento de modelos."],
    commonMistakes: ["Suponer que el autoalojamiento siempre es más barato.", "Enviar datos sensibles a una API sin revisar las condiciones y la residencia de los datos."],
    followUpQuestions: ["¿Qué es la cuantización y cuánto cuesta en calidad?", "¿Cómo diseñarías un enrutador de modelos?"],
  },
  'ai-019': {
    question: "¿Qué es la generación aumentada por recuperación (RAG)?",
    intent: "El entrevistador comprueba que entiendes el patrón más habitual para construir aplicaciones con LLM sobre datos privados.",
    expectedAnswer:
      "RAG combina un paso de búsqueda con la generación de texto. Los documentos, como manuales de producto o políticas internas, se dividen en fragmentos (chunks), se convierten en embeddings y se almacenan en un índice vectorial. Cuando un usuario hace una pregunta, el sistema recupera los fragmentos más relevantes, a menudo por similitud semántica, y los inserta en el prompt con instrucciones para responder usando ese contexto. El modelo genera entonces una respuesta fundamentada en la información recuperada, idealmente con citas. RAG permite que un LLM use conocimiento actualizado y privado sin reentrenarlo, reduce las alucinaciones y hace que las respuestas sean trazables. Su calidad depende en gran medida del paso de recuperación: si no se recupera la información correcta, la respuesta no puede ser correcta.",
    explanation:
      "RAG separa el conocimiento, almacenado en los documentos, del razonamiento, que hace el modelo. La calidad de la recuperación es la palanca principal.",
    tips: ["Describe tanto la fase de indexación como la de consulta.", "Subraya la importancia de la calidad de la recuperación."],
    commonMistakes: ["Pensar que RAG reentrena el modelo.", "Ignorar el control de acceso a los documentos recuperados."],
    followUpQuestions: ["¿Cómo divides los documentos en fragmentos?", "¿Cómo respetarías los permisos de los documentos en RAG?"],
  },
  'ai-020': {
    question: "¿Cómo eliges una estrategia de chunking para un sistema RAG?",
    intent: "El entrevistador comprueba decisiones de diseño prácticas que influyen mucho en la calidad de la recuperación.",
    expectedAnswer:
      "Los fragmentos deben ser lo bastante pequeños para ser específicos y caber en el prompt, pero lo bastante grandes para conservar el sentido. El chunking de tamaño fijo, por ejemplo de 300 a 800 tokens con algo de solapamiento, es una base sencilla. El chunking que respeta la estructura suele ser mejor: dividir por títulos, secciones, párrafos o elementos de lista, manteniendo intactos las tablas y los bloques de código. Cada fragmento debe llevar metadatos, como el título del documento, el encabezado de la sección, la fecha y los permisos de acceso, que pueden añadirse al texto del fragmento para darle contexto y usarse para filtrar. En documentos en los que los fragmentos pequeños pierden contexto, ayudan técnicas como el parent-document retrieval, que recupera un fragmento pequeño pero pasa al modelo la sección más amplia que lo contiene. La estrategia adecuada depende de los documentos y de las preguntas, así que probaría varias configuraciones con un conjunto de evaluación que mida si se recuperan los pasajes correctos.",
    explanation:
      "El chunking determina qué se puede recuperar. Los fragmentos que respetan la estructura, con metadatos y un ajuste guiado por la evaluación, dan los mejores resultados.",
    tips: ["Explica el compromiso del tamaño.", "Menciona la división según la estructura y los metadatos.", "Ajusta con un conjunto de evaluación."],
    commonMistakes: ["Cortar en mitad de tablas o de frases.", "Elegir el tamaño de fragmento una sola vez sin medir."],
    followUpQuestions: ["¿Qué es el parent-document retrieval?", "¿Cómo tratarías PDF con maquetaciones complejas?"],
  },
  'ai-021': {
    question: "Un chatbot RAG da respuestas incorrectas. ¿Cómo averiguas por qué?",
    intent: "El entrevistador comprueba que aplicas un enfoque estructurado de depuración en sistemas de IA.",
    expectedAnswer:
      "Separaría el pipeline en etapas y comprobaría cada una con ejemplos que fallan. Primero, ¿la información está siquiera en la base de conocimiento y se ingirió correctamente, por ejemplo con el texto bien extraído de los PDF? Segundo, la recuperación: para la pregunta, ¿se recuperaron los fragmentos relevantes entre los primeros resultados? Si no, el problema puede ser el chunking, el modelo de embeddings, la formulación de la consulta o la falta de filtros, y las soluciones incluyen un mejor chunking, búsqueda híbrida con palabras clave, reescritura de consultas o reranking. Tercero, la generación: si se recuperó el contexto correcto pero la respuesta sigue siendo incorrecta, puede que el prompt no sea claro, que el contexto sea demasiado largo o contradictorio, o que el modelo lo ignore; ayudan unas instrucciones más claras, menos fragmentos pero mejores y pedir citas. Registraría en logs los fragmentos recuperados y los prompts de cada respuesta para hacer posible este análisis, y añadiría cada fallo al conjunto de evaluación para medir las mejoras.",
    explanation:
      "La mayoría de los fallos de RAG son fallos de recuperación. Inspeccionar cada etapa por separado evita cambiar el prompt cuando el problema real está antes.",
    tips: ["Comprueba por separado la ingesta, la recuperación y la generación.", "Registra el contexto recuperado.", "Añade los fallos al conjunto de evaluación."],
    commonMistakes: ["Retocar el prompt sin fin sin comprobar la recuperación.", "Probar solo con un puñado de ejemplos."],
    followUpQuestions: ["¿Qué es la búsqueda híbrida?", "¿Cómo medirías la calidad de la recuperación?"],
  },
  'ai-022': {
    question: "¿Qué técnicas avanzadas mejoran la calidad de la recuperación en RAG?",
    intent: "El entrevistador evalúa tu conocimiento avanzado de sistemas RAG en producción.",
    expectedAnswer:
      "La búsqueda híbrida combina la búsqueda vectorial semántica con la búsqueda por palabras clave, como BM25, y luego fusiona los resultados, por ejemplo con reciprocal rank fusion; resuelve términos exactos, como códigos de producto y nombres, que los embeddings pueden pasar por alto. Un reranker, normalmente un modelo cross-encoder, puntúa cada candidato recuperado frente a la consulta con más precisión que los embeddings, de modo que recuperas muchos candidatos y te quedas con los mejores. La transformación de consultas ayuda cuando las preguntas de los usuarios son vagas o conversacionales: reescribir la consulta usando el historial de la conversación, generar varias variantes de la consulta o descomponer una pregunta compleja en subpreguntas. El filtrado por metadatos restringe la búsqueda a los documentos relevantes, como la versión del producto del usuario o los documentos permitidos, lo que además aplica el control de acceso. El enriquecimiento contextual añade a cada fragmento el título del documento o un breve resumen generado antes de calcular su embedding. Para preguntas que abarcan muchos documentos, pueden ayudar enfoques como jerarquías de resúmenes o grafos de conocimiento. Cada técnica añade latencia y coste, así que las incorporaría de una en una y conservaría las que mejoran las métricas de recuperación medidas, como el recall at k y el mean reciprocal rank.",
    explanation:
      "Un RAG en producción suele combinar búsqueda híbrida, reranking, reescritura de consultas y filtrado. Los candidatos avanzados justifican cada incorporación con métricas.",
    tips: ["Explica la búsqueda híbrida y el reranking.", "Menciona la reescritura de consultas y el filtrado por metadatos.", "Mide cada cambio."],
    commonMistakes: ["Depender solo de la similitud vectorial para identificadores exactos.", "Añadir todas las técnicas a la vez sin medir."],
    followUpQuestions: ["¿Cómo funciona la reciprocal rank fusion?", "¿Cuál es el coste en latencia de un reranker?"],
  },
};
