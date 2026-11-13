import type { QuestionText, TextTable } from '@/types/content';

/** Java questions 026-050: concurrency (part), JVM, Spring Boot, REST APIs, dependency injection, microservices. */
export const enB: TextTable<QuestionText> = {
  'java-026': {
    question: 'What is the Java Memory Model, and what does "happens-before" mean?',
    intent: 'The interviewer assesses deep understanding of why concurrent code can behave unexpectedly without proper synchronisation.',
    expectedAnswer:
      'The Java Memory Model defines when a write by one thread is guaranteed to be visible to a read by another. Without rules, compilers and CPUs may reorder instructions and keep values in caches or registers, so a thread may see stale or partially updated data. The model defines happens-before relationships: if action A happens-before action B, then B sees the effects of A. Key rules: releasing a lock happens-before a later acquisition of the same lock; a write to a volatile variable happens-before later reads of it; Thread.start() happens-before actions in the started thread; all actions in a thread happen-before another thread returns from join() on it; and writes to final fields in a constructor are visible once the object is safely published. Code without such a relationship has a data race. A classic consequence is the broken double-checked locking pattern, which needs a volatile field to be correct.',
    explanation:
      'Happens-before is the formal basis for visibility guarantees. Understanding it explains why volatile, locks and safe publication are necessary, not just good habits.',
    tips: ['Explain reordering and caching as the reason the model exists.', 'List the main happens-before rules.', 'Give a concrete broken example.'],
    commonMistakes: ['Thinking that a write is visible to other threads immediately.', 'Believing that only writes need synchronisation, not reads.'],
    followUpQuestions: ['What is safe publication?', 'Why does double-checked locking require volatile?'],
  },
  'java-027': {
    question: 'What is the difference between the JDK, the JRE and the JVM?',
    intent: 'The interviewer checks that you know the basic components of the Java platform.',
    expectedAnswer:
      'The JVM, Java Virtual Machine, executes bytecode: it loads classes, verifies them, interprets and JIT-compiles the code and manages memory with garbage collection. The JRE, Java Runtime Environment, historically bundled the JVM with the standard libraries needed to run applications. The JDK, Java Development Kit, includes everything in the JRE plus development tools such as the javac compiler, jar, jshell and diagnostic tools like jcmd. Since Java 11, a separate JRE is no longer distributed by Oracle; you use the JDK or build a minimal runtime with jlink.',
    explanation:
      'Knowing these layers helps when configuring build servers, Docker images or diagnosing runtime issues.',
    tips: ['Describe what each one contains.', 'Mention jlink and the absence of a separate JRE in modern Java.'],
    commonMistakes: ['Saying the JVM compiles Java source code; javac does.'],
    followUpQuestions: ['What is bytecode?', 'How would you build a small Docker image for a Java service?'],
  },
  'java-028': {
    question: 'Describe the main memory areas of the JVM.',
    intent: 'The interviewer checks your mental model of JVM memory, useful for tuning and troubleshooting.',
    expectedAnswer:
      'The heap stores objects and arrays and is shared by all threads; it is managed by the garbage collector and usually divided into young and old generations. Each thread has its own stack, holding frames with local variables and partial results for each method call; a too-deep recursion causes StackOverflowError. Metaspace, which replaced PermGen in Java 8, stores class metadata in native memory. There is also the code cache, where JIT-compiled native code is stored, and other native memory used by threads, direct buffers and the JVM itself. -Xmx limits the heap, but the total process memory is larger, which matters when setting container memory limits.',
    explanation:
      'Understanding these areas helps interpret OutOfMemoryError messages, which name the area that was exhausted, and size containers correctly.',
    tips: ['Distinguish shared heap from per-thread stacks.', 'Mention that total memory exceeds the heap size.'],
    commonMistakes: ['Setting the container memory limit equal to -Xmx.', 'Still talking about PermGen for modern Java.'],
    followUpQuestions: ['What causes "OutOfMemoryError: Metaspace"?', 'How does the JVM detect container memory limits?'],
  },
  'java-029': {
    question: 'How would you investigate high CPU usage in a running Java application?',
    intent: 'The interviewer checks practical troubleshooting skills on the JVM.',
    expectedAnswer:
      'First I would check whether the CPU is used by application code or by the garbage collector, using GC logs or metrics: frequent collections suggest memory pressure rather than a code problem. To find hot code, I would take several thread dumps a few seconds apart with jcmd <pid> Thread.print or jstack, and look for threads that are RUNNABLE in the same stack each time, for example a tight loop, heavy regex or serialisation. On Linux, top -H shows the busiest native thread IDs, which can be matched to the thread dump after converting to hexadecimal. A profiler such as async-profiler or Java Flight Recorder gives a flame graph with much better precision and low overhead. Then I would correlate with recent deployments or traffic changes.',
    explanation:
      'The method is to separate GC from application CPU, then use thread dumps or profiling to find hot stacks. Correlating with changes speeds up root-cause analysis.',
    tips: ['Mention GC as a possible cause first.', 'Explain how repeated thread dumps reveal hot spots.', 'Name a low-overhead profiler.'],
    commonMistakes: ['Restarting the service without collecting evidence.', 'Taking a single thread dump and drawing conclusions.'],
    followUpQuestions: ['What is Java Flight Recorder?', 'How do you read a flame graph?'],
  },
  'java-030': {
    question: 'How do you choose and tune a garbage collector for a Java service?',
    intent: 'The interviewer assesses advanced JVM performance knowledge and an evidence-based approach to tuning.',
    expectedAnswer:
      'I start from the service goals: latency-sensitive APIs care about pause times, batch jobs care about throughput, and small containers care about memory footprint. G1 is the default and a good balance for most services with heaps from a few hundred megabytes to tens of gigabytes; its main knob is a pause-time goal, MaxGCPauseMillis. For very low latency with large heaps, ZGC, generational since Java 21, keeps pauses typically below a millisecond at the cost of some CPU and memory overhead. Parallel GC maximises throughput for batch processing. Serial GC suits very small containers with one CPU. Before tuning, I enable GC logging with -Xlog:gc*, measure under realistic load and look at pause times, frequency and allocation rate. Often the best fix is reducing allocation or right-sizing the heap rather than tweaking flags. In containers, I set heap size relative to the container limit, for example with MaxRAMPercentage, and leave room for non-heap memory.',
    explanation:
      'GC choice depends on goals, and tuning must be driven by measurements. Experienced engineers often fix allocation patterns before touching flags.',
    tips: ['Link each collector to a goal.', 'Insist on GC logs and load testing.', 'Mention container sizing.'],
    commonMistakes: ['Copying JVM flags from the internet without measuring.', 'Setting a huge heap that makes pauses longer.'],
    followUpQuestions: ['What does allocation rate tell you?', 'How would you reduce allocation in a hot code path?'],
  },
  'java-031': {
    question: 'How would you reduce the start-up time and memory footprint of a Java microservice?',
    intent: 'The interviewer checks modern deployment knowledge for cloud and serverless environments.',
    expectedAnswer:
      'First I would measure where time goes: class loading, Spring context initialisation, database connection set-up or eager caches. Common improvements at the framework level include lazy initialisation of beans where safe, removing unused auto-configurations and starters, and avoiding heavy work in constructors or @PostConstruct. At the JVM level, Class Data Sharing, especially AppCDS archives, reduces class loading time, and choosing the right GC and heap size limits footprint. For larger gains, Spring Boot 3 supports GraalVM native images through AOT processing: start-up drops to tens of milliseconds and memory use is much lower, but builds are slower, reflection must be declared, some libraries are incompatible and peak throughput can be lower than with the JIT. Another option is CRaC, which restores a snapshot of a warmed-up JVM, where the platform supports it. The choice depends on whether the service scales to zero, how often it starts and how much peak performance matters.',
    explanation:
      'Start-up optimisation is a trade-off between build complexity, compatibility and runtime performance. Advanced candidates present options with their costs.',
    tips: ['Start with measurement.', 'Compare JVM-level options with native images.', 'Explain the trade-offs of native images.'],
    commonMistakes: ['Recommending native images for every service.', 'Ignoring warm-up effects on peak performance.'],
    followUpQuestions: ['What is AOT processing in Spring Boot 3?', 'Why can native images have lower peak throughput?'],
  },
  'java-032': {
    question: 'What is Spring Boot, and how does it differ from the Spring Framework?',
    intent: 'The interviewer checks basic understanding of the most widely used Java ecosystem for back-end development.',
    expectedAnswer:
      'The Spring Framework provides the core features: dependency injection, transaction management, web MVC, data access and more, but it historically required a lot of configuration. Spring Boot builds on Spring to make applications quick to start: starters group compatible dependencies, auto-configuration sets up beans based on the libraries on the classpath and your properties, an embedded server such as Tomcat lets you run the application as a simple jar, and Actuator provides health checks and metrics. Convention over configuration means you only configure what differs from the defaults.',
    explanation:
      'Spring Boot does not replace Spring; it packages and configures it with sensible defaults so teams focus on business code.',
    tips: ['Mention starters, auto-configuration and the embedded server.', 'Say that Boot is built on top of Spring.'],
    commonMistakes: ['Describing Spring Boot as a different framework from Spring.'],
    followUpQuestions: ['How does auto-configuration decide what to create?', 'What does Spring Boot Actuator provide?'],
  },
  'java-033': {
    question: 'How does Spring Boot auto-configuration work?',
    intent: 'The interviewer wants to see that you understand the mechanism behind Spring Boot\'s "magic" and can debug it.',
    expectedAnswer:
      'Spring Boot ships auto-configuration classes, listed in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports in Spring Boot 3. When the application starts with @SpringBootApplication, which includes @EnableAutoConfiguration, these classes are evaluated. Each is guarded by conditions: @ConditionalOnClass creates beans only if a library is on the classpath, @ConditionalOnMissingBean backs off if you defined your own bean, and @ConditionalOnProperty depends on configuration values. That is why adding spring-boot-starter-data-jpa and a datasource URL is enough to get a configured DataSource and EntityManager. To see which configurations applied or not, you can start with --debug or use the Actuator conditions endpoint. To override a default, define your own bean or set the documented properties.',
    explanation:
      'Conditional configuration explains how Boot adapts to the classpath and why your own beans take precedence. Knowing how to inspect the conditions report is a practical debugging skill.',
    tips: ['Name the main conditional annotations.', 'Explain how to see the conditions report.'],
    commonMistakes: ['Excluding auto-configurations blindly instead of understanding conflicts.'],
    followUpQuestions: ['How would you write your own starter?', 'Why might two DataSource beans cause a start-up failure?'],
  },
  'java-034': {
    question: 'How do you manage configuration and profiles in a Spring Boot application?',
    intent: 'The interviewer checks good practices for environment-specific configuration and secrets.',
    expectedAnswer:
      'Configuration lives in application.yml or application.properties, with profile-specific files such as application-prod.yml activated through spring.profiles.active. Spring Boot resolves properties from many sources in a defined order, and environment variables and command-line arguments override files, which suits containers and twelve-factor applications. I bind related properties to typed classes with @ConfigurationProperties, often as records with validation, rather than scattering @Value annotations. Secrets such as passwords should not be committed; they come from environment variables, a vault or a cloud secrets manager. Profiles should change configuration, not business behaviour, to keep environments as similar as possible.',
    explanation:
      'Typed, externalised configuration with secrets outside the code is the standard practice for deployable services.',
    example: '@ConfigurationProperties("payment")\nrecord PaymentProperties(@NotBlank String apiUrl, Duration timeout) {}',
    tips: ['Prefer @ConfigurationProperties over many @Value fields.', 'Explain where secrets should come from.'],
    commonMistakes: ['Committing passwords in application.yml.', 'Using profiles to enable different business logic in production.'],
    followUpQuestions: ['What is the order of property sources?', 'How would you reload configuration without restarting?'],
  },
  'java-035': {
    question: 'How does @Transactional work in Spring, and what are its common pitfalls?',
    intent: 'The interviewer checks that you understand proxy-based transactions, a frequent source of subtle bugs.',
    expectedAnswer:
      "Spring implements @Transactional with a proxy around the bean. When a method is called through the proxy, it starts or joins a transaction, then commits when the method returns or rolls back on exceptions. The pitfalls follow from this design. Self-invocation: calling a @Transactional method from another method in the same class bypasses the proxy, so no transaction is applied. Private methods are not intercepted. By default, rollback happens only for unchecked exceptions and errors, not checked exceptions, unless you set rollbackFor. Propagation matters: REQUIRED joins the existing transaction, while REQUIRES_NEW suspends it and starts a new one. Long transactions holding database locks while calling remote services hurt performance. And readOnly = true is a hint that can enable optimisations, not a security guarantee.",
    explanation:
      'Understanding that transactions are applied by a proxy explains most surprises. Knowing rollback rules and propagation prevents data consistency bugs.',
    tips: ['Explain the proxy mechanism.', 'Mention self-invocation and checked exception rollback.', 'Discuss transaction length.'],
    commonMistakes: ['Putting @Transactional on private methods.', 'Calling external APIs inside a long transaction.'],
    followUpQuestions: ['When would you use REQUIRES_NEW?', 'How do you test transactional behaviour?'],
  },
  'java-036': {
    question: 'How would you diagnose and fix the N+1 query problem in a Spring Data JPA application?',
    intent: 'The interviewer assesses advanced knowledge of ORM performance, a very common production issue.',
    expectedAnswer:
      'The N+1 problem occurs when loading a list of N entities triggers one query for the list and then one additional query per entity to load a lazy association, for example loading orders and then their customer one by one. I would detect it by enabling SQL logging or statistics in a test, using tools such as Hibernate statistics or datasource-proxy to count queries, or by spotting many similar queries in APM traces. Fixes depend on the use case: a JOIN FETCH in a JPQL query or an @EntityGraph to load the association in the same query; batch fetching with @BatchSize or hibernate.default_batch_fetch_size so lazy loads are grouped with IN clauses; or, for read-only screens, a DTO projection that selects exactly the needed columns. I would be careful with fetching several collections at once, which causes Cartesian products or MultipleBagFetchException, and with pagination combined with collection fetch joins, which Hibernate applies in memory. I would add a test that asserts the number of queries so the problem does not return.',
    explanation:
      'Advanced candidates know several fixes and their trade-offs, and they prevent regressions with query-count tests.',
    tips: ['Explain how to detect it with logs or query counts.', 'Offer several fixes and when each fits.', 'Mention pagination and multiple collection pitfalls.'],
    commonMistakes: ['Switching everything to EAGER loading.', 'Ignoring the problem because it is invisible in small test datasets.'],
    followUpQuestions: ['Why is EAGER fetching usually a bad default?', 'What is the open-session-in-view setting and why is it controversial?'],
  },
  'java-037': {
    question: 'How would you make a Spring Boot service production-ready?',
    intent: 'The interviewer assesses operational maturity: observability, resilience, security and deployment practices.',
    expectedAnswer:
      'For observability, I would expose health, readiness and liveness probes with Actuator, export metrics through Micrometer to Prometheus or the platform in use, use structured JSON logs with a correlation or trace ID, and add distributed tracing with OpenTelemetry. For resilience, every outgoing call needs a timeout, and I would add retries with backoff only for idempotent operations, plus circuit breakers with Resilience4j for unstable dependencies. Database connection pools and thread pools would be sized and monitored. For security, Spring Security with proper authentication, input validation, secrets from a vault or environment, dependency vulnerability scanning and restricted Actuator endpoints. For deployment, graceful shutdown so in-flight requests finish, database migrations with Flyway or Liquibase, externalised configuration and container-aware memory settings. Finally, I would define service-level objectives and alerts on symptoms users feel, such as error rate and latency.',
    explanation:
      'Production readiness spans observability, resilience, security and deployment. A structured answer covering each area shows senior operational experience.',
    tips: ['Organise the answer by area.', 'Mention timeouts as non-negotiable.', 'Include graceful shutdown and migrations.'],
    commonMistakes: ['Exposing all Actuator endpoints publicly.', 'Adding retries on non-idempotent operations.'],
    followUpQuestions: ['What is the difference between liveness and readiness probes?', 'How would you roll out a breaking database migration?'],
  },
  'java-038': {
    question: 'What are the main HTTP methods used in a REST API, and what does each one mean?',
    intent: 'The interviewer checks basic REST knowledge and correct use of HTTP semantics.',
    expectedAnswer:
      'GET reads a resource and must not change state. POST creates a resource or triggers a processing action; it is not idempotent, so sending it twice may create two resources. PUT replaces a resource entirely at a known URL and is idempotent. PATCH partially updates a resource. DELETE removes a resource and is idempotent: deleting twice leaves the same state. For example, GET /orders/42 reads an order, POST /orders creates one and PATCH /orders/42 updates its status.',
    explanation:
      'Using HTTP methods correctly makes APIs predictable and lets caches, proxies and clients behave correctly, for example by retrying idempotent requests safely.',
    tips: ['Mention safety and idempotency.', 'Give URL examples.'],
    commonMistakes: ['Using GET to change data.', 'Using POST for everything.'],
    followUpQuestions: ['What does idempotent mean?', 'When would you use PUT instead of PATCH?'],
  },
  'java-039': {
    question: 'Which HTTP status codes should a REST API return in common situations?',
    intent: 'The interviewer checks that you design APIs that communicate results clearly to clients.',
    expectedAnswer:
      'For success: 200 OK for a successful read or update with a body, 201 Created after creating a resource, ideally with a Location header, and 204 No Content when there is no body, for example after a delete. For client errors: 400 Bad Request for invalid input, 401 Unauthorized when authentication is missing or invalid, 403 Forbidden when the user is authenticated but not allowed, 404 Not Found, 409 Conflict for conflicting state such as a duplicate, 422 Unprocessable Entity for business validation errors in many APIs, and 429 Too Many Requests for rate limiting. For server errors: 500 Internal Server Error, and 503 Service Unavailable when temporarily overloaded. Errors should come with a consistent body, for example the Problem Details format.',
    explanation:
      'Correct status codes let clients handle results automatically. A consistent error format makes debugging easier for API consumers.',
    tips: ['Distinguish 401 from 403.', 'Mention a standard error body format.'],
    commonMistakes: ['Returning 200 with an error message in the body.', 'Returning 500 for invalid user input.'],
    followUpQuestions: ['What is RFC 9457 Problem Details?', 'How would you return validation errors for several fields?'],
  },
  'java-040': {
    question: 'How do you version a REST API and handle breaking changes?',
    intent: 'The interviewer checks API design maturity and respect for client compatibility.',
    expectedAnswer:
      'The best approach is to avoid breaking changes as long as possible: adding optional fields or new endpoints is backward compatible, and clients should ignore unknown fields. When a breaking change is necessary, such as removing a field or changing its meaning, I would introduce a new version. Common strategies are a version in the URL path, such as /v2/orders, which is simple and visible; a header or media type version, which keeps URLs stable but is less discoverable. I would run both versions in parallel, communicate a deprecation timeline, mark deprecated endpoints with Deprecation and Sunset headers and monitor usage of the old version before removing it. Contract tests help ensure existing clients are not broken by accident.',
    explanation:
      'Versioning is about managing change for consumers you do not control. Monitoring usage and communicating deprecation are as important as the technical mechanism.',
    tips: ['Explain what counts as a breaking change.', 'Mention a deprecation process.'],
    commonMistakes: ['Creating a new version for every small change.', 'Removing an old version without checking who still uses it.'],
    followUpQuestions: ['How do you document an API, for example with OpenAPI?', 'How would you migrate mobile apps that update slowly?'],
  },
  'java-041': {
    question: 'How would you implement pagination, filtering and sorting in a REST API?',
    intent: 'The interviewer checks practical API design for large datasets.',
    expectedAnswer:
      'For filtering and sorting I would use query parameters, such as /orders?status=PAID&sort=createdAt,desc, validating allowed fields so clients cannot sort on unindexed or sensitive columns. For pagination there are two main approaches. Offset pagination, with page and size, is simple and lets users jump to a page, but it gets slow on large offsets because the database still scans skipped rows, and results can shift if data changes between requests. Cursor or keyset pagination returns a cursor based on the last item, for example its creation date and ID, and the next query uses WHERE (created_at, id) < (?, ?); it is fast and stable for large or changing data, but does not allow jumping to an arbitrary page. I would always enforce a maximum page size and return metadata or links to the next page.',
    explanation:
      'The choice between offset and keyset pagination depends on data size and user needs. Validating sort fields and capping page size protect the database.',
    tips: ['Compare offset and keyset pagination.', 'Mention a maximum page size and validation.'],
    commonMistakes: ['Returning unbounded lists.', 'Allowing sorting on any column without indexes.'],
    followUpQuestions: ['How does Spring Data support pagination?', 'How would you implement infinite scroll on mobile?'],
  },
  'java-042': {
    question: 'How do you make a POST endpoint safe to retry, for example for payments?',
    intent: 'The interviewer assesses advanced API design for reliability in distributed systems.',
    expectedAnswer:
      'Network failures mean a client cannot always know whether a request was processed, so it may retry and cause duplicates, such as charging a customer twice. I would use an idempotency key: the client generates a unique key, such as a UUID, for each logical operation and sends it in a header like Idempotency-Key. The server stores the key with the request fingerprint and the result in the same transaction as the business operation, protected by a unique constraint. If a request arrives with a known key, the server returns the stored response instead of processing it again; if a request with the same key is still in progress, it returns a conflict or waits; if the same key arrives with a different payload, it rejects it. Keys expire after a defined period. On the client side, retries use exponential backoff with jitter. This pattern, used by payment providers, gives effectively exactly-once processing on top of at-least-once delivery.',
    explanation:
      'Idempotency keys turn unsafe operations into safely retryable ones. Storing the key atomically with the operation is the critical detail.',
    tips: ['Explain why retries happen.', 'Describe storage of the key atomically with the result.', 'Handle concurrent duplicates and payload mismatches.'],
    commonMistakes: ['Checking for duplicates without a unique constraint, leaving a race condition.', 'Using a timestamp as the key.'],
    followUpQuestions: ['How long would you keep idempotency keys?', 'How does this relate to the outbox pattern?'],
  },
  'java-043': {
    question: 'What is dependency injection, and why is it useful?',
    intent: 'The interviewer checks understanding of a core design principle used by Spring and most modern frameworks.',
    expectedAnswer:
      'Dependency injection means a class receives the objects it depends on from outside instead of creating them itself. For example, an OrderService receives a PaymentGateway in its constructor rather than calling new StripeGateway(). This reduces coupling, because the service depends on an interface, makes testing easy, because you can pass a fake gateway, and lets a container such as Spring create and wire objects according to configuration. Constructor injection is preferred because dependencies are explicit, can be final and the object is always fully initialised.',
    explanation:
      'DI is the practical application of dependency inversion. Its main everyday benefit is testability.',
    example: 'class OrderService {\n  private final PaymentGateway gateway;\n  OrderService(PaymentGateway gateway) { this.gateway = gateway; }\n}',
    tips: ['Contrast with creating dependencies using new.', 'Recommend constructor injection.'],
    commonMistakes: ['Confusing dependency injection with simply using Spring.', 'Using field injection everywhere.'],
    followUpQuestions: ['Why is field injection discouraged?', 'What is an IoC container?'],
  },
  'java-044': {
    question: 'What are bean scopes in Spring, and what problem can mixing them cause?',
    intent: 'The interviewer checks understanding of bean lifecycles and a classic injection pitfall.',
    expectedAnswer:
      'The default scope is singleton: one instance per application context, shared by all users, so it must be stateless or thread-safe. Prototype creates a new instance every time the bean is requested from the container. Web applications also have request and session scopes. The classic pitfall is injecting a prototype or request-scoped bean into a singleton: injection happens only once when the singleton is created, so the singleton keeps the same instance forever. Solutions are to inject an ObjectProvider and call getObject() when needed, use a scoped proxy with proxyMode, or use method injection with @Lookup.',
    explanation:
      'Scopes define lifecycle and sharing. Most bugs come from storing request-specific state in singletons or from injection happening only once.',
    tips: ['Stress that singletons are shared between concurrent requests.', 'Explain the prototype-in-singleton pitfall and a fix.'],
    commonMistakes: ['Storing user data in a field of a singleton service.'],
    followUpQuestions: ['How does a scoped proxy work?', 'When would you use prototype scope?'],
  },
  'java-045': {
    question: 'How do you resolve a situation where Spring finds two beans of the same type?',
    intent: 'The interviewer checks practical Spring troubleshooting and configuration choices.',
    expectedAnswer:
      'Spring fails with NoUniqueBeanDefinitionException when an injection point matches several beans. Options: mark one bean as the default with @Primary; select a specific bean at the injection point with @Qualifier and a name; inject all of them as a List<PaymentGateway> or a Map<String, PaymentGateway> when the code should choose dynamically, for example by payment type; or use conditions such as @ConditionalOnProperty or profiles so only one is created in each environment. The right choice depends on intent: a default with occasional overrides fits @Primary, while a strategy chosen at runtime fits injecting a map.',
    explanation:
      'This question shows whether you can match a configuration mechanism to the design intent instead of applying annotations by trial and error.',
    tips: ['List the options.', 'Explain which one fits which intent.'],
    commonMistakes: ['Renaming beans randomly until the error disappears.'],
    followUpQuestions: ['How would you implement a strategy registry with Spring?', 'What is the bean name by default?'],
  },
  'java-046': {
    question: 'What is a circular dependency in Spring, and how should you fix it properly?',
    intent: 'The interviewer assesses design judgment: treating circular dependencies as a design smell rather than a configuration issue.',
    expectedAnswer:
      'A circular dependency happens when bean A needs B and B needs A, directly or through a longer chain. With constructor injection Spring cannot create either bean, and since Spring Boot 2.6 circular references are forbidden by default even with field injection. Technical workarounds exist, such as @Lazy on one injection point or setter injection, but they hide the real issue: two classes are too tightly coupled or one class has too many responsibilities. Proper fixes are to extract the shared logic into a third bean both can depend on, to split a large service by responsibility, to invert one dependency through an interface owned by the lower-level module, or to replace a direct call with an application event when one side only needs to notify the other. After the fix, the dependency graph should be acyclic, which also makes modules easier to test and to separate later.',
    explanation:
      'Circular dependencies signal design problems. Advanced candidates fix the design rather than relying on lazy proxies, and they understand Spring Boot\'s default behaviour.',
    tips: ['Explain why constructor injection fails.', 'Mention the Spring Boot 2.6 default.', 'Propose design fixes, not just @Lazy.'],
    commonMistakes: ['Enabling spring.main.allow-circular-references as a permanent fix.', 'Switching to field injection to hide the cycle.'],
    followUpQuestions: ['How do application events reduce coupling?', 'How would you detect cycles between packages automatically?'],
  },
  'java-047': {
    question: 'What are the advantages and disadvantages of microservices compared with a monolith?',
    intent: 'The interviewer checks balanced architectural judgment rather than enthusiasm for a trend.',
    expectedAnswer:
      'Microservices split an application into small services deployed independently, each owning its data. Advantages: teams can deploy and scale services independently, failures can be isolated, and each service can use the technology that fits. Disadvantages: network calls add latency and failure modes, data consistency across services becomes harder, testing and debugging require distributed tracing, and operations need mature CI/CD, monitoring and infrastructure. A well-structured modular monolith is often a better starting point for a small team, with services extracted when there is a clear need, such as independent scaling or team autonomy.',
    explanation:
      'Interviewers value candidates who see microservices as a trade-off driven by organisational and scaling needs.',
    tips: ['Give both sides.', 'Mention the modular monolith as an alternative.'],
    commonMistakes: ['Presenting microservices as always better.', 'Splitting services by technical layer instead of business capability.'],
    followUpQuestions: ['How would you decide service boundaries?', 'How do services communicate?'],
  },
  'java-048': {
    question: 'Compare synchronous REST calls and asynchronous messaging between microservices.',
    intent: 'The interviewer checks understanding of communication patterns and their impact on coupling and reliability.',
    expectedAnswer:
      'Synchronous calls with REST or gRPC are simple and give an immediate answer, which suits queries such as checking a price. But they create temporal coupling: if the called service is slow or down, the caller is affected, and long chains of calls multiply latency and failure risk. Timeouts, retries and circuit breakers are required. Asynchronous messaging with a broker such as Kafka or RabbitMQ decouples services in time: the producer publishes an event like OrderPlaced and continues, and consumers process it when they can. It improves resilience and lets new consumers subscribe without changing the producer, but it brings eventual consistency, harder debugging, duplicate messages that require idempotent consumers and the need to manage message ordering and schemas. Many systems use synchronous calls for queries and events for state changes.',
    explanation:
      'The choice affects coupling, consistency and failure behaviour. A balanced answer gives a use case for each.',
    tips: ['Mention temporal coupling.', 'Explain eventual consistency and idempotent consumers.'],
    commonMistakes: ['Building long synchronous call chains.', 'Assuming messages are delivered exactly once.'],
    followUpQuestions: ['How would you handle a message that always fails?', 'What is a dead-letter queue?'],
  },
  'java-049': {
    question: 'How do you keep data consistent across microservices without distributed transactions?',
    intent: 'The interviewer assesses advanced distributed-systems design: sagas, outbox and idempotency.',
    expectedAnswer:
      'Two-phase commit across services is fragile and rarely supported by modern brokers, so I would accept eventual consistency and design for it. A saga splits a business process into local transactions, each in one service, with compensating actions for failures. For example, placing an order reserves stock, charges the payment and confirms the order; if the payment fails, the stock reservation is cancelled. Sagas can be choreographed, with each service reacting to events, or orchestrated by a coordinator that tracks the state, which is easier to understand for complex flows. To publish events reliably, I would use the transactional outbox pattern: the service writes the business change and the event to an outbox table in the same local transaction, and a relay or change data capture tool such as Debezium publishes it to the broker. Consumers must be idempotent, for example by recording processed message IDs, because delivery is at least once. I would also design states visible to users, such as "payment pending", and monitor stuck sagas.',
    explanation:
      'Sagas, outbox and idempotent consumers are the standard toolkit. Advanced answers also consider user-visible intermediate states and monitoring.',
    tips: ['Explain why distributed transactions are avoided.', 'Describe saga with compensation and the outbox pattern.', 'Mention idempotency and monitoring.'],
    commonMistakes: ['Publishing an event after committing without an outbox, risking lost events.', 'Forgetting that compensations can fail too.'],
    followUpQuestions: ['Choreography or orchestration: which would you choose and why?', 'How do you handle a compensation that fails?'],
  },
  'java-050': {
    question: 'How would you split a monolith into microservices?',
    intent: 'The interviewer evaluates strategic architecture skills and risk management during a migration.',
    expectedAnswer:
      "I would start by questioning the goal: faster independent deployments, scaling a hotspot or team autonomy, because the goal determines what to extract first. Then I would identify boundaries based on business capabilities, using domain-driven design ideas such as bounded contexts, and look at the code and data coupling, for example which tables are shared. Before extracting anything, I would often modularise the monolith internally, enforcing module boundaries so dependencies become explicit. I would extract one service with clear value and limited coupling first, using the strangler fig pattern: route calls for that capability to the new service through a facade or gateway, keep the monolith as a fallback during transition and migrate its data, with a period of synchronisation if needed. Each step must be releasable and reversible. Meanwhile, I would invest in prerequisites: CI/CD per service, observability with tracing, and contract tests. I would measure whether each extraction actually achieved the goal before continuing, and accept that some parts may stay in a well-structured monolith.",
    explanation:
      'Successful migrations are incremental, goal-driven and reversible. Mentioning modularisation first and data separation shows real-world experience.',
    tips: ['Start from the business goal.', 'Mention modularising before extracting.', 'Explain the strangler fig pattern and data migration.'],
    commonMistakes: ['Proposing a big-bang rewrite.', 'Extracting services that still share the same database tables.'],
    followUpQuestions: ['How do you split a shared database?', 'What would make you stop the migration?'],
  },
};
