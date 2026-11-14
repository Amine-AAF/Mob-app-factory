import type { QuestionText, TextTable } from '@/types/content';

/** AI & Data questions 001-022: machine learning, deep learning, LLMs, RAG (part). */
export const enA: TextTable<QuestionText> = {
  'ai-001': {
    question: 'What is the difference between supervised, unsupervised and reinforcement learning?',
    intent: 'The interviewer checks that you know the main families of machine learning and when each applies.',
    expectedAnswer:
      'Supervised learning trains a model on labelled examples, inputs with known correct outputs, to predict the output for new inputs: classification, such as spam or not spam, or regression, such as predicting a house price. Unsupervised learning finds structure in unlabelled data: clustering customers into segments, reducing dimensions or detecting anomalies. Reinforcement learning trains an agent that acts in an environment and learns from rewards and penalties, used for games, robotics or recommendation strategies. There is also self-supervised learning, where labels come from the data itself, such as predicting the next word, which is how large language models are pre-trained.',
    explanation:
      'The availability of labels and the type of feedback determine the family. Self-supervised learning is the bridge to modern foundation models.',
    tips: ['Give a business example for each family.', 'Mention self-supervised learning for LLMs.'],
    commonMistakes: ['Saying unsupervised learning has no objective at all.', 'Confusing classification with clustering.'],
    followUpQuestions: ['How would you segment customers without labels?', 'What is semi-supervised learning?'],
  },
  'ai-002': {
    question: 'What are overfitting and underfitting, and how do you detect them?',
    intent: 'The interviewer checks the most fundamental concept in model evaluation.',
    expectedAnswer:
      'Overfitting happens when a model learns the training data too closely, including its noise, so it performs very well on training data but poorly on new data. Underfitting happens when a model is too simple to capture the underlying pattern, so it performs poorly on both. You detect them by comparing training and validation scores: a large gap suggests overfitting, low scores on both suggest underfitting. This is the bias-variance trade-off: simple models have high bias, complex models high variance. Remedies for overfitting include more data, regularisation, simpler models, early stopping or dropout for neural networks; remedies for underfitting include more expressive models, better features or training longer.',
    explanation:
      'The goal is generalisation to unseen data. Comparing training and validation performance is the basic diagnostic tool.',
    tips: ['Explain how to compare training and validation scores.', 'Give remedies for both problems.'],
    commonMistakes: ['Evaluating a model only on the data it was trained on.'],
    followUpQuestions: ['What is regularisation?', 'How do learning curves help?'],
  },
  'ai-003': {
    question: 'Why do we split data into training, validation and test sets? What is cross-validation?',
    intent: 'The interviewer checks correct evaluation methodology.',
    expectedAnswer:
      'The training set is used to fit the model. The validation set is used to compare models and tune hyperparameters, such as tree depth or learning rate. The test set is kept aside until the end to estimate performance on truly unseen data; if you tune on it, the estimate becomes too optimistic. A typical split might be 70/15/15, depending on data size. Cross-validation, for example k-fold, splits the data into k parts, trains k times, each time validating on a different part, and averages the results. It gives a more reliable estimate when data is limited. For time series, splits must respect time order, training on the past and validating on the future, to avoid using future information.',
    explanation:
      'Separating data for tuning and final evaluation prevents fooling yourself about real performance.',
    tips: ['Explain the role of each set.', 'Mention time-based splits for time series.'],
    commonMistakes: ['Tuning hyperparameters on the test set.', 'Shuffling time-series data before splitting.'],
    followUpQuestions: ['What is stratified sampling?', 'How would you split data from the same customer appearing many times?'],
  },
  'ai-004': {
    question: 'How do you choose an evaluation metric for a classification problem, especially with imbalanced classes?',
    intent: 'The interviewer checks whether you connect metrics to business impact rather than defaulting to accuracy.',
    expectedAnswer:
      'Accuracy is misleading when classes are imbalanced: a fraud model that always predicts "not fraud" can be 99% accurate and useless. Precision is the share of predicted positives that are correct; recall is the share of actual positives that are found. The F1 score balances both. The choice depends on the cost of errors: for fraud detection or medical screening, missing a positive is expensive, so recall matters more; for spam filtering, flagging a legitimate e-mail is costly, so precision matters more. ROC-AUC measures ranking quality across thresholds, but with strong imbalance the precision-recall curve and PR-AUC are more informative. The decision threshold itself should be chosen with the business, using the relative costs of false positives and false negatives, and the confusion matrix makes those trade-offs concrete.',
    explanation:
      'Metrics encode business priorities. Interviewers want to see that you reason about the cost of each type of error.',
    tips: ['Explain why accuracy fails on imbalanced data.', 'Link precision and recall to business costs.', 'Mention threshold selection.'],
    commonMistakes: ['Reporting only accuracy.', 'Using a default threshold of 0.5 without thinking.'],
    followUpQuestions: ['How would you choose the threshold for a fraud model?', 'What does a confusion matrix show?'],
  },
  'ai-005': {
    question: 'What is data leakage, and how do you prevent it?',
    intent: 'The interviewer checks awareness of a subtle error that makes models look much better than they are.',
    expectedAnswer:
      'Data leakage happens when information that will not be available at prediction time is used during training, so validation scores are unrealistically high and the model fails in production. Examples: a feature computed after the event you are predicting, such as "account closed date" to predict churn; scaling or imputing values using statistics from the whole dataset before splitting; the same customer or patient appearing in both training and test sets; or random splits on time-series data, letting the model learn from the future. To prevent it, I split data first, then fit preprocessing steps only on the training data, ideally inside a pipeline; I check that every feature would be known at prediction time; I split by entity or by time when relevant; and I am suspicious of results that look too good.',
    explanation:
      'Leakage is one of the most common causes of models that fail after deployment. Thinking about "what is known at prediction time" prevents most cases.',
    tips: ['Give at least two concrete leakage examples.', 'Mention fitting preprocessing only on training data.'],
    commonMistakes: ['Normalising the entire dataset before splitting.', 'Ignoring duplicates across splits.'],
    followUpQuestions: ['How would you detect leakage after the fact?', 'Why do pipelines help prevent leakage?'],
  },
  'ai-006': {
    question: 'How would you handle a heavily imbalanced dataset?',
    intent: 'The interviewer checks practical techniques beyond simply training a model on raw data.',
    expectedAnswer:
      'First I would choose appropriate metrics, such as precision, recall or PR-AUC, and a stratified split so each set contains enough minority examples. Then several techniques can help. At the data level: undersampling the majority class, oversampling the minority class or generating synthetic examples with methods such as SMOTE, always applied only to the training data. At the algorithm level: class weights that make errors on the minority class more costly, which most libraries support, or models such as gradient-boosted trees that often handle imbalance well. At the decision level: tuning the classification threshold based on business costs rather than using 0.5. Collecting more minority examples, or better features that separate the classes, often helps more than any resampling trick. For extreme cases, anomaly detection approaches can be more appropriate than classification.',
    explanation:
      'Imbalance is handled through metrics, data, algorithms and thresholds together. Resampling the test set would give misleading results.',
    tips: ['Start with the right metric.', 'Mention class weights and threshold tuning.', 'Warn against resampling validation or test data.'],
    commonMistakes: ['Oversampling before splitting, which causes leakage.', 'Judging the model with accuracy.'],
    followUpQuestions: ['When would you use anomaly detection instead?', 'How does SMOTE create synthetic examples?'],
  },
  'ai-007': {
    question: 'How do you deploy and maintain a machine learning model in production?',
    intent: 'The interviewer assesses MLOps maturity: reproducibility, monitoring and the model lifecycle.',
    expectedAnswer:
      'A model in production is a software system that depends on data, so I would treat training as a reproducible pipeline: versioned code, versioned datasets or data snapshots, tracked experiments and hyperparameters with a tool such as MLflow, and models stored in a registry with their metrics and lineage. Serving depends on the need: batch scoring on a schedule, a real-time API with latency requirements, or embedded models. Features must be computed the same way in training and serving to avoid training-serving skew, which a feature store or shared transformation code helps. Before full release, I would compare the new model with the current one through shadow deployment or an A/B test on business metrics. In production, I monitor technical metrics, such as latency and errors, data drift, when input distributions change, prediction drift and, when labels arrive later, actual performance. Alerts on drift or performance drops trigger investigation and retraining, which can be scheduled or automated with validation gates. Finally, I document the model\'s intended use and limitations and keep the ability to roll back to the previous version.',
    explanation:
      'Models degrade as the world changes. Advanced answers cover reproducibility, skew, safe rollout, drift monitoring and retraining.',
    tips: ['Cover the lifecycle from training to retraining.', 'Mention training-serving skew and drift.', 'Explain safe rollout methods.'],
    commonMistakes: ['Deploying a notebook without reproducible training.', 'Monitoring only latency, not prediction quality.'],
    followUpQuestions: ['How do you monitor a model when labels arrive weeks later?', 'What is a feature store?'],
  },
  'ai-008': {
    question: 'How does a neural network learn?',
    intent: 'The interviewer checks a conceptual understanding of neural networks.',
    expectedAnswer:
      'A neural network is made of layers of units, or neurons. Each unit computes a weighted sum of its inputs, adds a bias and applies a non-linear activation function such as ReLU; stacking layers lets the network represent complex functions. Learning means adjusting the weights to reduce a loss function that measures how wrong the predictions are, for example cross-entropy for classification. In each training step, the network makes predictions on a batch of examples, computes the loss, then backpropagation calculates how much each weight contributed to the error using the chain rule, and an optimiser such as gradient descent updates the weights a little in the direction that reduces the loss. Repeating this over many batches and epochs gradually improves the model.',
    explanation:
      'Forward pass, loss, backpropagation and weight update form the training loop behind all deep learning.',
    tips: ['Describe the four steps of a training iteration.', 'Explain why non-linear activations matter.'],
    commonMistakes: ['Describing neural networks as copying the human brain.', 'Forgetting the role of the loss function.'],
    followUpQuestions: ['Why do we need activation functions?', 'What is an epoch?'],
  },
  'ai-009': {
    question: 'Explain gradient descent and the role of the learning rate.',
    intent: 'The interviewer checks understanding of optimisation, which affects training stability and speed.',
    expectedAnswer:
      'Gradient descent minimises a loss function by repeatedly moving the model\'s parameters in the direction opposite to the gradient, the direction of steepest increase. The learning rate controls the size of each step. Too large, and training oscillates or diverges; too small, and training is very slow and may get stuck. Full-batch gradient descent uses all data per step, which is expensive; stochastic and mini-batch gradient descent use small batches, making steps noisier but much faster and often helping generalisation. Optimisers such as momentum, RMSProp and Adam, or AdamW with decoupled weight decay, adapt step sizes per parameter and accelerate convergence. Learning-rate schedules, such as warm-up followed by decay, are common, especially for transformers.',
    explanation:
      'The learning rate is often the most important hyperparameter. Adaptive optimisers and schedules make training more robust.',
    tips: ['Describe what happens when the learning rate is too high or too low.', 'Mention mini-batches and Adam.'],
    commonMistakes: ['Thinking a bigger learning rate always trains faster.'],
    followUpQuestions: ['What is a learning rate warm-up?', 'Why might mini-batch noise help generalisation?'],
  },
  'ai-010': {
    question: 'What are vanishing gradients, and which techniques help train deep networks?',
    intent: 'The interviewer checks knowledge of practical deep learning problems and their solutions.',
    expectedAnswer:
      'In deep networks, backpropagation multiplies gradients through many layers. With activation functions such as sigmoid, whose derivatives are small, gradients can shrink exponentially so early layers barely learn: vanishing gradients. The opposite, exploding gradients, makes training unstable. Solutions include ReLU-family activations, which keep gradients from shrinking for positive inputs; careful weight initialisation such as He or Xavier; normalisation layers, batch normalisation in vision models or layer normalisation in transformers, which stabilise activations; residual connections, used in ResNets and transformers, which give gradients a direct path through the network; and gradient clipping against explosions. Regularisation such as dropout and weight decay addresses overfitting rather than gradients, but is usually part of the same training recipe.',
    explanation:
      'Residual connections and normalisation are the main reasons very deep networks, including transformers, can be trained reliably.',
    tips: ['Explain why gradients vanish.', 'List several techniques and what each solves.'],
    commonMistakes: ['Confusing dropout with a fix for vanishing gradients.'],
    followUpQuestions: ['How does a residual connection work?', 'Why do transformers use layer normalisation rather than batch normalisation?'],
  },
  'ai-011': {
    question: 'Explain how the transformer architecture and self-attention work.',
    intent: 'The interviewer assesses deep understanding of the architecture behind modern language models.',
    expectedAnswer:
      'A transformer processes a sequence of tokens, each represented by an embedding plus positional information, since attention itself has no notion of order. The core mechanism is self-attention: for each token, the model computes a query, a key and a value vector through learned projections. The attention weight between two tokens is the dot product of one token\'s query with the other\'s key, scaled by the square root of the dimension and normalised with softmax; each token\'s output is the weighted sum of all values. This lets every token gather information from any other token directly, capturing long-range dependencies and allowing parallel computation, unlike recurrent networks. Multi-head attention runs several attention operations in parallel so the model can attend to different kinds of relationships. Each block combines attention with a feed-forward network, residual connections and layer normalisation, and many blocks are stacked. Decoder-only models such as GPT use causal masking so a token only attends to previous ones, which enables next-token prediction. The main cost is that attention is quadratic in sequence length, which motivates techniques such as efficient attention kernels and key-value caching during generation.',
    explanation:
      'Queries, keys and values, multi-head attention and causal masking are the essential concepts. Mentioning quadratic cost and KV caching shows practical depth.',
    tips: ['Explain Q, K and V clearly.', 'Contrast with recurrent networks.', 'Mention causal masking and the quadratic cost.'],
    commonMistakes: ['Describing attention vaguely as "the model focuses on important words" without the mechanism.'],
    followUpQuestions: ['What is a KV cache?', 'What is the difference between encoder-only and decoder-only models?'],
  },
  'ai-012': {
    question: 'When would you train a model from scratch, fine-tune a pre-trained model or use transfer learning?',
    intent: 'The interviewer evaluates practical decision-making based on data, cost and goals.',
    expectedAnswer:
      'Training from scratch requires very large amounts of data and compute and is justified only when no suitable pre-trained model exists, such as for unusual data types, or when you are a company building foundation models. Transfer learning reuses a model pre-trained on a large dataset and adapts it: you can freeze most layers and train only a new head, which works well with small datasets, for example classifying medical images using a model pre-trained on general images. Fine-tuning updates more or all of the weights on your task-specific data, giving better performance when you have more data and the domain differs from pre-training. For large language models, parameter-efficient methods such as LoRA adapt a model by training small additional matrices, reducing cost and memory. Before any fine-tuning, I would check whether prompting or retrieval-augmented generation is enough, since they are cheaper to iterate on. The decision depends on data volume and quality, domain gap, latency and cost constraints, and how often the model must be updated.',
    explanation:
      'Reuse is the default in modern machine learning. Advanced answers compare options by data, cost and maintenance, and mention parameter-efficient fine-tuning.',
    tips: ['Explain when each option makes sense.', 'Mention LoRA for large models.', 'Consider prompting and RAG before fine-tuning.'],
    commonMistakes: ['Fine-tuning an LLM to add facts that change often, which RAG handles better.'],
    followUpQuestions: ['How much data do you need to fine-tune effectively?', 'What is catastrophic forgetting?'],
  },
  'ai-013': {
    question: 'What is a large language model, and how does it generate text?',
    intent: 'The interviewer checks a correct basic mental model of LLMs.',
    expectedAnswer:
      'A large language model is a neural network, usually a decoder-only transformer, trained on very large amounts of text to predict the next token, a piece of a word. Text is split into tokens, and at each step the model computes a probability distribution over its vocabulary for the next token, chooses one according to the decoding settings, appends it and repeats. After this pre-training, models are usually instruction-tuned and aligned with human feedback so they follow instructions and behave helpfully and safely. An LLM does not look up facts in a database; it produces text based on patterns learned during training, within a limited context window that contains the prompt and conversation.',
    explanation:
      'Understanding next-token prediction explains both the impressive abilities and the limitations of LLMs, such as hallucinations.',
    tips: ['Explain tokens and next-token prediction.', 'Mention instruction tuning and the context window.'],
    commonMistakes: ['Saying the model "searches the internet" by default.', 'Equating tokens with words.'],
    followUpQuestions: ['What is a context window?', 'Why can LLMs struggle with counting letters in a word?'],
  },
  'ai-014': {
    question: 'What are hallucinations in LLMs, and how can you reduce them?',
    intent: 'The interviewer checks awareness of LLM limitations and responsible design.',
    expectedAnswer:
      'A hallucination is output that sounds plausible but is false or unsupported, such as invented citations or wrong facts. It happens because the model generates likely text rather than verifying truth, and because its knowledge is limited to training data with a cut-off date. To reduce hallucinations, I would ground answers in trusted sources with retrieval-augmented generation and ask the model to cite them; instruct it to say when it does not know; lower randomness for factual tasks; use structured outputs and validation for critical data; and design the user interface so people can check sources. For high-stakes uses, human review remains necessary. No technique removes hallucinations completely, so products should be honest about this limitation.',
    explanation:
      'Hallucinations are inherent to how LLMs work. Grounding, constraints and transparent UX reduce risk.',
    tips: ['Explain why hallucinations happen.', 'Give several mitigation techniques.', 'Mention honesty with users.'],
    commonMistakes: ['Claiming a prompt can eliminate hallucinations.', 'Using LLM output for critical decisions without verification.'],
    followUpQuestions: ['How would you measure the hallucination rate of an application?', 'How does RAG help?'],
  },
  'ai-015': {
    question: 'What do temperature, top-p and the context window control?',
    intent: 'The interviewer checks practical knowledge of LLM parameters used in applications.',
    expectedAnswer:
      'Temperature scales the probability distribution over the next token: low values, close to 0, make the output more deterministic and focused, suitable for extraction or classification; higher values make it more varied and creative. Top-p, or nucleus sampling, restricts choices to the smallest set of tokens whose cumulative probability reaches p, such as 0.9, cutting off unlikely tokens; usually you adjust either temperature or top-p, not both aggressively. The context window is the maximum number of tokens the model can consider at once, including the system prompt, conversation history, retrieved documents and the generated answer. Exceeding it requires truncating or summarising history. Larger contexts allow more information but increase cost and latency, and models may use information in the middle of long contexts less reliably.',
    explanation:
      'These settings control randomness and how much information the model sees. Choosing them by task is part of building reliable LLM features.',
    tips: ['Match temperature to the task.', 'Explain what counts toward the context window.'],
    commonMistakes: ['Using high temperature for factual or structured tasks.', 'Stuffing the context window with irrelevant documents.'],
    followUpQuestions: ['How would you handle a conversation longer than the context window?', 'Why does a long context increase cost?'],
  },
  'ai-016': {
    question: 'How do you decide between prompt engineering, RAG and fine-tuning for an LLM application?',
    intent: 'The interviewer checks the ability to choose the simplest effective approach.',
    expectedAnswer:
      'I start with prompt engineering, because it is the fastest and cheapest to iterate: clear instructions, examples and output formats solve many tasks. If the model needs knowledge it does not have, such as internal documents, recent information or customer-specific data, I add retrieval-augmented generation, which supplies relevant context at query time, keeps information up to date and allows citing sources. Fine-tuning is useful to change behaviour rather than knowledge: a consistent style or format, a specialised task performed many times, or making a smaller, cheaper model reach the quality of a larger one. It requires a good labelled dataset, evaluation and retraining when needs change. These approaches combine well: a fine-tuned model can still use RAG. The decision should be guided by an evaluation set measuring quality on real examples.',
    explanation:
      'Prompting changes instructions, RAG adds knowledge, fine-tuning changes behaviour. Starting simple and measuring is the key principle.',
    tips: ['Explain what each approach changes.', 'Mention combining approaches.', 'Insist on evaluation.'],
    commonMistakes: ['Fine-tuning to teach facts that change frequently.', 'Choosing an approach without an evaluation set.'],
    followUpQuestions: ['How large should an evaluation set be?', 'What would make you move from RAG to fine-tuning?'],
  },
  'ai-017': {
    question: 'How would you evaluate the quality of an LLM-based feature before and after launch?',
    intent: 'The interviewer assesses advanced, evidence-based practice for non-deterministic systems.',
    expectedAnswer:
      'I would first define what "good" means for the feature with the product team: correctness, completeness, tone, format, safety and latency, and turn it into measurable criteria. Then I would build an evaluation dataset of realistic inputs, including edge cases and adversarial examples, with reference answers or grading rubrics, ideally from real user data with privacy handled. Evaluation combines several methods: exact or programmatic checks where possible, such as valid JSON or correct extracted fields; reference-based metrics; LLM-as-a-judge with a clear rubric, calibrated against human ratings because judges have biases such as favouring longer answers; and regular human review of samples. Every change to the prompt, model or retrieval pipeline runs against this suite, like regression tests, with results tracked over time. After launch, I would monitor user signals such as thumbs up or down, edits, retries and abandonment, sample conversations for review, track cost and latency, and feed failures back into the evaluation set. A/B tests compare versions on business outcomes.',
    explanation:
      'LLM features need evaluation suites like code needs tests. Advanced candidates combine automated checks, calibrated judges, human review and production feedback.',
    tips: ['Define quality criteria first.', 'Build an evaluation set and run it on every change.', 'Explain the limits of LLM-as-a-judge.'],
    commonMistakes: ['Judging quality by trying a few prompts manually.', 'Trusting an LLM judge without checking it against humans.'],
    followUpQuestions: ['How do you prevent your evaluation set from becoming outdated?', 'What biases do LLM judges have?'],
  },
  'ai-018': {
    question: 'How would you choose between a hosted LLM API and a self-hosted open-weights model?',
    intent: 'The interviewer evaluates trade-offs between quality, cost, privacy, control and operations.',
    expectedAnswer:
      'I would compare options on concrete criteria using our own evaluation set. Quality: the strongest hosted models often lead on complex reasoning, while open-weights models can be sufficient for narrower tasks, especially after fine-tuning. Cost: APIs charge per token, which is simple and cheap at low volume, while self-hosting has high fixed costs for GPUs and engineering but can be cheaper at large, steady volume. Latency and throughput: self-hosting gives control but requires capacity planning and optimisation, such as quantisation and efficient serving frameworks like vLLM. Privacy and compliance: some data cannot leave our infrastructure or region, which favours self-hosting or providers with suitable data processing agreements, regional hosting and no training on customer data. Control: self-hosting avoids sudden model changes or deprecations and allows customisation. Operations: self-hosting requires a team to run, monitor and update models. Many organisations use both, with an abstraction layer so models can be switched, and route simple requests to smaller, cheaper models.',
    explanation:
      'The decision is multi-dimensional. Advanced answers rely on evaluation data and consider total cost, compliance and operational capability.',
    tips: ['Compare on quality, cost, latency, privacy, control and operations.', 'Mention an abstraction layer and model routing.'],
    commonMistakes: ['Assuming self-hosting is always cheaper.', 'Sending sensitive data to an API without checking terms and data residency.'],
    followUpQuestions: ['What is quantisation and what does it cost in quality?', 'How would you design a model router?'],
  },
  'ai-019': {
    question: 'What is retrieval-augmented generation (RAG)?',
    intent: 'The interviewer checks understanding of the most common pattern for building LLM applications on private data.',
    expectedAnswer:
      'RAG combines a search step with text generation. Documents, such as product manuals or internal policies, are split into chunks, converted into embeddings and stored in a vector index. When a user asks a question, the system retrieves the most relevant chunks, often by semantic similarity, and inserts them into the prompt with instructions to answer using that context. The model then generates an answer grounded in the retrieved information, ideally with citations. RAG lets an LLM use up-to-date and private knowledge without retraining, reduces hallucinations and makes answers traceable. Its quality depends heavily on the retrieval step: if the right information is not retrieved, the answer cannot be correct.',
    explanation:
      'RAG separates knowledge, stored in documents, from reasoning, done by the model. Retrieval quality is the main lever.',
    tips: ['Describe both the indexing and query phases.', 'Stress the importance of retrieval quality.'],
    commonMistakes: ['Thinking RAG retrains the model.', 'Ignoring access control on retrieved documents.'],
    followUpQuestions: ['How do you split documents into chunks?', 'How would you respect document permissions in RAG?'],
  },
  'ai-020': {
    question: 'How do you choose a chunking strategy for a RAG system?',
    intent: 'The interviewer checks practical design decisions that strongly affect retrieval quality.',
    expectedAnswer:
      'Chunks must be small enough to be specific and fit in the prompt, but large enough to keep meaning. Fixed-size chunking, for example 300 to 800 tokens with some overlap, is a simple baseline. Structure-aware chunking is usually better: splitting by headings, sections, paragraphs or list items, keeping tables and code blocks intact. Each chunk should carry metadata, such as document title, section heading, date and access permissions, which can be added to the chunk text to give context and used for filtering. For documents where small chunks lose context, techniques such as parent-document retrieval, which retrieves a small chunk but passes its larger section to the model, help. The right strategy depends on the documents and questions, so I would test several settings against an evaluation set measuring whether the correct passages are retrieved.',
    explanation:
      'Chunking determines what can be retrieved. Structure-aware chunks with metadata and evaluation-driven tuning give the best results.',
    tips: ['Explain the size trade-off.', 'Mention structure-aware splitting and metadata.', 'Tune with an evaluation set.'],
    commonMistakes: ['Splitting in the middle of tables or sentences.', 'Choosing chunk size once without measuring.'],
    followUpQuestions: ['What is parent-document retrieval?', 'How would you handle PDFs with complex layouts?'],
  },
  'ai-021': {
    question: 'A RAG chatbot gives wrong answers. How do you find out why?',
    intent: 'The interviewer checks a structured debugging approach for AI systems.',
    expectedAnswer:
      'I would separate the pipeline into steps and check each one with failing examples. First, is the information in the knowledge base at all, and was it ingested correctly, for example text extracted properly from PDFs? Second, retrieval: for the question, were the relevant chunks retrieved in the top results? If not, the problem may be chunking, the embedding model, the query wording or missing filters, and fixes include better chunking, hybrid search with keywords, query rewriting or reranking. Third, generation: if the right context was retrieved but the answer is still wrong, the prompt may be unclear, the context too long or contradictory, or the model may ignore it; clearer instructions, fewer but better chunks and asking for citations help. I would log the retrieved chunks and prompts for each answer to make this analysis possible, and add each failure to the evaluation set so improvements are measured.',
    explanation:
      'Most RAG failures are retrieval failures. Inspecting each stage separately avoids changing the prompt when the real problem is upstream.',
    tips: ['Check ingestion, retrieval and generation separately.', 'Log retrieved context.', 'Add failures to the evaluation set.'],
    commonMistakes: ['Tweaking the prompt endlessly without checking retrieval.', 'Testing with a handful of examples only.'],
    followUpQuestions: ['What is hybrid search?', 'How would you measure retrieval quality?'],
  },
  'ai-022': {
    question: 'Which advanced techniques improve RAG retrieval quality?',
    intent: 'The interviewer assesses advanced knowledge of production RAG systems.',
    expectedAnswer:
      'Hybrid search combines semantic vector search with keyword search such as BM25, then merges results, for example with reciprocal rank fusion; it handles exact terms like product codes and names that embeddings may miss. A reranker, usually a cross-encoder model, scores each retrieved candidate against the query more precisely than embeddings, so you retrieve many candidates and keep the best few. Query transformation helps when user questions are vague or conversational: rewriting the query using the conversation history, generating several query variants, or decomposing a complex question into sub-questions. Metadata filtering restricts search to relevant documents, such as the user\'s product version or permitted documents, which also enforces access control. Contextual enrichment adds document titles or a short generated summary to each chunk before embedding. For questions that span many documents, approaches such as summarised hierarchies or knowledge graphs can help. Each technique adds latency and cost, so I would add them one at a time and keep those that improve measured retrieval metrics, such as recall at k and mean reciprocal rank.',
    explanation:
      'Production RAG usually combines hybrid search, reranking, query rewriting and filtering. Advanced candidates justify each addition with metrics.',
    tips: ['Explain hybrid search and reranking.', 'Mention query rewriting and metadata filtering.', 'Measure each change.'],
    commonMistakes: ['Relying only on vector similarity for exact identifiers.', 'Adding every technique at once without measurement.'],
    followUpQuestions: ['How does reciprocal rank fusion work?', 'What is the latency cost of a reranker?'],
  },
};
