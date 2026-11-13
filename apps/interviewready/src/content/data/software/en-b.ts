import type { QuestionText, TextTable } from '@/types/content';

/** Software questions 026-050: algorithms (part), design patterns, clean code, testing, debugging. */
export const enB: TextTable<QuestionText> = {
  'sw-026': {
    question: 'What is dynamic programming? Give an example.',
    intent: 'The interviewer checks whether you recognise problems with overlapping sub-problems and can optimise them.',
    expectedAnswer:
      'Dynamic programming solves a problem by breaking it into overlapping sub-problems, solving each one once and reusing the stored results. It applies when the problem has optimal substructure, meaning an optimal solution is built from optimal solutions of sub-problems. There are two styles: top-down with memoisation, where a recursive function caches its results, and bottom-up, where a table is filled from the smallest cases. A simple example is Fibonacci: the naive recursion is exponential because it recomputes the same values, while storing results makes it O(n). Real examples include computing the minimum number of coins for an amount, the edit distance between two strings or the longest common subsequence.',
    explanation:
      'The key skill is spotting repeated sub-problems in a recursive solution. Once you see them, caching turns exponential time into polynomial time.',
    example: 'coins(amount) = 1 + min(coins(amount - c) for c in denominations), with results stored in an array from 0 to amount.',
    tips: ['Start from a recursive formulation, then add memoisation.', 'Mention time and space complexity of the optimised version.'],
    commonMistakes: ['Confusing dynamic programming with simple recursion.', 'Using it when sub-problems do not overlap.'],
    followUpQuestions: ['Can you reduce the memory used by your table?', 'What is the difference between greedy algorithms and dynamic programming?'],
  },
  'sw-027': {
    question: 'How would you find the shortest path in a weighted graph, and what are the limits of your approach?',
    intent: 'The interviewer evaluates advanced algorithm knowledge and awareness of preconditions such as negative weights.',
    expectedAnswer:
      "For non-negative weights I would use Dijkstra's algorithm. It keeps a priority queue of nodes ordered by their current best distance from the source. It repeatedly removes the closest node, and for each neighbour checks whether going through this node gives a shorter path; if so, it updates the distance and pushes the neighbour into the queue. With a binary heap it runs in O((V + E) log V). It fails with negative edge weights, because a node removed from the queue is assumed final. For negative weights I would use Bellman-Ford, which relaxes all edges V - 1 times in O(V × E) and can also detect negative cycles. When a good heuristic exists, such as geographic distance on a map, A* explores fewer nodes than Dijkstra by prioritising nodes that seem closer to the target. For very large road networks, systems precompute structures such as contraction hierarchies.",
    explanation:
      'Advanced answers state the algorithm, its complexity and, crucially, its assumptions. Knowing when Dijkstra is wrong and which alternative to use shows real understanding.',
    tips: ['State the assumption of non-negative weights explicitly.', 'Mention complexity with the data structure used.', 'Show awareness of A* or other optimisations.'],
    commonMistakes: ['Using BFS on a weighted graph.', 'Applying Dijkstra to negative weights.'],
    followUpQuestions: ['How do you reconstruct the path, not only its length?', 'How would you handle a graph that changes frequently?'],
  },
  'sw-028': {
    question: 'How would you process a dataset too large to fit in memory, for example to find the most frequent items?',
    intent: 'The interviewer checks whether you can adapt algorithms to real constraints: memory, disk and distribution.',
    expectedAnswer:
      'First I would avoid loading everything: I would stream the data and keep only what I need. For exact counts with many distinct items, I would partition the data by hashing each item into one of several files, so the same item always goes to the same file. Each file is then small enough to count in memory with a hash map, and I keep the top k results from each with a min-heap of size k, then merge them. If approximate answers are acceptable, a streaming algorithm such as Count-Min Sketch combined with a heap, or the Misra-Gries algorithm, finds frequent items with fixed memory. At larger scale the same partitioning idea is what MapReduce or Spark do across machines: map items to keys, shuffle by key, reduce counts. I would also ask whether the result must be exact and how often it must be computed, because that changes the best design.',
    explanation:
      'This question tests the ability to combine hashing, heaps and streaming with system thinking. Asking about exactness and frequency shows you design for requirements.',
    tips: ['Mention partitioning by hash so equal keys stay together.', 'Offer both an exact and an approximate approach.', 'Ask clarifying questions about requirements.'],
    commonMistakes: ['Suggesting to simply buy more memory.', 'Sorting the whole dataset without considering external sorting costs.'],
    followUpQuestions: ['How does a Count-Min Sketch work?', 'How would you handle a heavily skewed key that makes one partition too large?'],
  },
  'sw-029': {
    question: 'What is a design pattern? Name a few you have used.',
    intent: 'The interviewer checks that you understand patterns as reusable solutions and can link them to real code.',
    expectedAnswer:
      'A design pattern is a well-known, reusable solution to a recurring design problem, described independently of a specific language. Patterns give developers a shared vocabulary. Common ones include the Factory, which centralises object creation; the Strategy, which lets you swap algorithms behind an interface, for example different payment methods; the Observer, where objects subscribe to events, used in event listeners; the Adapter, which wraps an existing class to fit an expected interface; and the Decorator, which adds behaviour by wrapping an object, such as adding logging around a service.',
    explanation:
      'Interviewers care less about the names than about knowing when a pattern solves a real problem. Linking each pattern to something you have built makes the answer credible.',
    tips: ['Choose patterns you have actually used.', 'Explain the problem each one solved.'],
    commonMistakes: ['Listing many patterns without examples.', 'Using patterns where simple code would do.'],
    followUpQuestions: ['Which pattern do frameworks like Spring use heavily?', 'When is a pattern over-engineering?'],
  },
  'sw-030': {
    question: 'Explain the Strategy pattern and when you would use it.',
    intent: 'The interviewer wants a concrete understanding of a very common behavioural pattern.',
    expectedAnswer:
      'The Strategy pattern defines a family of interchangeable algorithms behind a common interface, and lets the client choose one at runtime. For example, a checkout service can use a ShippingCostStrategy interface with implementations for standard, express and pickup delivery. The service calls strategy.calculate(order) without knowing which one it has. This replaces long if/else or switch statements on a type, makes it easy to add a new option without modifying existing code, and makes each strategy testable on its own. In languages with first-class functions, a strategy can simply be a function passed as a parameter.',
    explanation:
      'Strategy is a direct application of polymorphism and the open/closed principle. Recognising that a lambda can play the same role shows modern understanding.',
    example: 'interface DiscountStrategy { Money apply(Order o); } — new NoDiscount(), new PercentageDiscount(10), new BuyTwoGetOne() are chosen by configuration.',
    tips: ['Start from the problem: growing conditionals.', 'Mention that functions can replace small strategy classes.'],
    commonMistakes: ['Creating a strategy interface for a single implementation that will never change.'],
    followUpQuestions: ['How would you choose the strategy at runtime?', 'How does Strategy differ from State?'],
  },
  'sw-031': {
    question: 'What is the Observer pattern? What problems can it cause?',
    intent: 'The interviewer checks understanding of event-driven design and its pitfalls.',
    expectedAnswer:
      'In the Observer pattern, a subject keeps a list of observers and notifies them when its state changes. Observers register and unregister themselves, so the subject does not need to know their concrete types. It is the basis of event listeners in UIs, reactive streams and domain events. Problems include memory leaks when observers forget to unsubscribe and remain referenced, unpredictable order of notifications, cascades of updates that are hard to debug, and exceptions in one observer affecting others. Synchronous notification can also slow down the subject, which is why many systems dispatch events asynchronously through a queue or an event bus.',
    explanation:
      'Observer decouples producers from consumers, but that decoupling makes flows harder to trace. Knowing the pitfalls shows real experience with event-driven code.',
    tips: ['Give a real use case such as UI listeners or domain events.', 'Mention unsubscription and leaks.'],
    commonMistakes: ['Ignoring error handling between observers.', 'Forgetting to remove listeners, for example in React effects.'],
    followUpQuestions: ['How does this relate to publish/subscribe messaging?', 'How do you clean up listeners in a component lifecycle?'],
  },
  'sw-032': {
    question: 'Why is the Singleton pattern often considered an anti-pattern?',
    intent: 'The interviewer wants to see critical thinking about a pattern that is simple but frequently misused.',
    expectedAnswer:
      'A Singleton guarantees a class has only one instance and provides global access to it. The problem is the global access: any code can reach it, which hides dependencies, creates implicit coupling and makes testing hard because you cannot easily replace it with a fake. Singletons holding mutable state also create concurrency issues and order-dependent behaviour between tests. A better approach is usually to have a single instance managed by a dependency injection container, as Spring beans are singletons by default, and to inject it explicitly. Then you keep "one instance" without the global access and can substitute it in tests.',
    explanation:
      'The distinction between having one instance and accessing it globally is the key insight. Dependency injection keeps the benefit and removes most of the drawbacks.',
    tips: ['Separate the idea of a single instance from global access.', 'Propose dependency injection as an alternative.'],
    commonMistakes: ['Saying singletons should never exist.', 'Forgetting thread safety in lazy initialisation.'],
    followUpQuestions: ['How would you make a lazy singleton thread-safe in Java?', 'What is the scope of a Spring bean by default?'],
  },
  'sw-033': {
    question: 'How do you decide whether to introduce a design pattern or an abstraction in your code?',
    intent: 'The interviewer assesses engineering judgment: avoiding both rigid code and over-engineering.',
    expectedAnswer:
      "I start from the actual change pressure, not from the pattern. If a piece of code has one implementation and no foreseeable variation, I keep it concrete and simple. I introduce an abstraction when I see a real need: a second implementation is coming, a dependency must be replaced in tests, or a conditional keeps growing with every new case. A useful rule is to wait for the second or third occurrence before generalising, so the abstraction is based on real examples rather than guesses. I also consider who will maintain the code: an abstraction should make the next change easier for the team, and its name should express the domain, not the pattern. When I do introduce one, I prefer the simplest form, for example a function parameter before a full Strategy hierarchy, and I document why it exists.",
    explanation:
      'Advanced engineers balance flexibility and simplicity. Using evidence of change, such as repeated cases or testing needs, to justify abstractions avoids speculative complexity.',
    tips: ['Mention the "rule of three" or waiting for real variation.', 'Talk about the cost of abstraction for readers.', 'Give an example from your experience.'],
    commonMistakes: ['Adding interfaces for everything "just in case".', 'Refusing any abstraction and duplicating logic everywhere.'],
    followUpQuestions: ['Tell me about an abstraction you regretted.', 'How do you remove an abstraction that is no longer useful?'],
  },
  'sw-034': {
    question: 'Explain hexagonal architecture (ports and adapters). What problem does it solve?',
    intent: 'The interviewer checks architectural knowledge and whether you understand dependency direction in real applications.',
    expectedAnswer:
      'Hexagonal architecture places the business logic at the centre and isolates it from technical details. The core defines ports: interfaces describing what it needs, such as OrderRepository or PaymentGateway, and what it offers, such as a PlaceOrder use case. Adapters implement those ports for specific technologies: a JPA repository, an HTTP client for the payment provider, a REST controller or a message listener that calls the use case. Dependencies point inward, so the core does not import frameworks or database code. This makes business rules testable without infrastructure, lets you replace a database or provider with limited impact and keeps framework upgrades away from the domain. The costs are more interfaces and mapping code, which is worthwhile for complex domains but often excessive for simple CRUD services.',
    explanation:
      'The essence is dependency inversion at architectural scale. Interviewers appreciate candidates who also say when the approach is not worth its overhead.',
    tips: ['Explain ports and adapters with concrete names.', 'Emphasise the direction of dependencies.', 'Discuss when it is overkill.'],
    commonMistakes: ['Confusing it with simply having layers.', 'Letting framework annotations leak into the domain model.'],
    followUpQuestions: ['How does this relate to clean architecture?', 'How would you test a use case in this architecture?'],
  },
  'sw-035': {
    question: 'What makes code "clean" in your opinion?',
    intent: 'The interviewer wants to understand your quality standards and whether they serve readability and maintenance.',
    expectedAnswer:
      'For me clean code is code that another developer can understand and change safely. That means clear names that express intent, small functions that do one thing, consistent formatting and no duplicated logic. It also means handling errors explicitly, keeping side effects visible and having tests that document behaviour. Comments explain why something is done, not what the code does. Finally, clean code follows the conventions of the team and the codebase, even when I would personally choose differently.',
    explanation:
      'Interviewers look for practical criteria centred on the reader and on safe change, not on personal style or dogma.',
    tips: ['Focus on readability and safe change.', 'Mention team conventions.'],
    commonMistakes: ['Equating clean code with short code.', 'Being dogmatic about one book or rule.'],
    followUpQuestions: ['How do you name a function well?', 'When are comments necessary?'],
  },
  'sw-036': {
    question: 'How do you give and receive feedback in code reviews?',
    intent: 'The interviewer checks collaboration skills and whether reviews in your teams improve code without damaging relationships.',
    expectedAnswer:
      "When reviewing, I first try to understand the goal of the change, then focus on correctness, risks, readability and tests rather than personal style, which should be handled by linters and formatters. I phrase comments as questions or suggestions with reasons, for example 'Could this be null when the user is not logged in?', and I mark small points as optional so the author knows what really matters. I also mention what is done well. When receiving reviews, I assume good intent, ask for clarification when I disagree and explain my reasoning. If a discussion becomes long, I suggest a short call instead of a long comment thread. I also try to keep pull requests small so reviews are faster and more useful.",
    explanation:
      'Good code review culture combines technical rigour with respect. Separating blocking from optional comments and keeping changes small are signs of experience.',
    tips: ['Mention what you check first.', 'Show how you phrase comments.', 'Talk about pull request size.'],
    commonMistakes: ['Focusing on style issues a tool could catch.', 'Writing comments that judge the person instead of the code.'],
    followUpQuestions: ['What do you do when you strongly disagree with a reviewer?', 'How long should a review take?'],
  },
  'sw-037': {
    question: 'What is technical debt, and how do you manage it?',
    intent: 'The interviewer wants to see whether you understand debt as a trade-off and can manage it pragmatically.',
    expectedAnswer:
      'Technical debt is the future cost created by choosing a quicker or simpler solution now, or by code that no longer fits the system as it evolved. Like financial debt, it can be a reasonable choice if taken deliberately, but its "interest" appears as slower changes, more bugs and harder onboarding. To manage it, I make it visible by recording debt items with their impact, I fix small issues as I touch code, following the "leave it better than you found it" idea, and I prioritise larger items by how much they slow down work we actually plan to do. I explain debt to product managers in terms of delivery speed and risk, so it can be planned alongside features.',
    explanation:
      'Interviewers value candidates who see debt as a business trade-off and who connect it to concrete costs instead of treating all old code as bad.',
    tips: ['Distinguish deliberate debt from accidental debt.', 'Explain how you prioritise it.', 'Show how you communicate it to non-developers.'],
    commonMistakes: ['Proposing a big rewrite as the solution.', 'Ignoring debt until a crisis forces action.'],
    followUpQuestions: ['How do you convince a product manager to plan debt work?', 'When is a rewrite justified?'],
  },
  'sw-038': {
    question: 'How would you approach refactoring a large legacy module with no tests?',
    intent: 'The interviewer assesses advanced, risk-aware engineering practice on real-world code.',
    expectedAnswer:
      "I would start by understanding why the module needs to change and limit the scope to the area we actually need to work on, rather than refactoring everything. Next, I would protect current behaviour with characterisation tests: tests that capture what the code does today, including odd behaviour, often at a high level such as an API or end-to-end scenario, using real inputs and outputs from production logs where possible. To make the code testable, I would apply small, safe refactorings, such as extracting methods or introducing seams to replace dependencies, ideally with automated IDE refactorings. Then I would improve the design in small steps, each one releasable and reviewed, possibly using the strangler fig approach: new code gradually replacing old paths behind the same interface, with feature flags and monitoring to compare results. Throughout, I would keep the team and product owner informed about risks and progress.",
    explanation:
      'Safe legacy refactoring relies on characterisation tests, small reversible steps and incremental replacement. Advanced answers emphasise risk management and communication, not just code techniques.',
    tips: ['Mention characterisation tests.', 'Insist on small, releasable steps.', 'Explain how you would monitor behaviour after changes.'],
    commonMistakes: ['Proposing a full rewrite first.', 'Refactoring and changing behaviour in the same step.'],
    followUpQuestions: ['What is a seam in legacy code?', 'How would you convince your manager to allocate time for this?'],
  },
  'sw-039': {
    question: 'How do you choose good names for variables, functions and classes?',
    intent: 'The interviewer checks attention to readability, one of the most impactful everyday skills.',
    expectedAnswer:
      'A good name tells the reader what something represents or does without needing to read its implementation. I name variables after their meaning in the domain, for example overdueInvoices rather than list2, and include units when relevant, such as timeoutSeconds. Functions get verb phrases that describe their effect, such as sendReminderEmail, and boolean names read like questions, such as isExpired. Classes are nouns from the business domain. I avoid abbreviations the team does not share, and I keep names consistent: if the codebase says customer, I do not introduce client for the same concept. If a function is hard to name, it often does too much and should be split.',
    explanation:
      'Naming is a design activity: difficulty naming something often reveals unclear responsibilities. Consistency with domain vocabulary helps the whole team.',
    tips: ['Give examples of good and bad names.', 'Mention consistency with the domain vocabulary.'],
    commonMistakes: ['Using generic names such as data, manager or handle everywhere.', 'Encoding types in names instead of meaning.'],
    followUpQuestions: ['How do you rename something used across a large codebase?', 'What is ubiquitous language?'],
  },
  'sw-040': {
    question: 'What is the difference between unit, integration and end-to-end tests?',
    intent: 'The interviewer checks your understanding of the testing pyramid and what each level is good for.',
    expectedAnswer:
      'A unit test checks a small piece of code, such as a function or class, in isolation, usually with its dependencies replaced by fakes; it is fast and points precisely to the failure. An integration test checks that several parts work together for real, for example a repository with a real database or a service calling another service. An end-to-end test runs a complete user scenario through the whole system, such as signing up through the user interface. Unit tests are numerous and cheap, end-to-end tests are few, slower and more fragile, and integration tests sit in between. A good strategy combines all three.',
    explanation:
      'The testing pyramid balances speed, confidence and maintenance cost. Each level catches different kinds of bugs.',
    tips: ['Give one example of each level.', 'Mention speed and reliability trade-offs.'],
    commonMistakes: ['Relying only on end-to-end tests.', 'Calling every automated test a unit test.'],
    followUpQuestions: ['What makes an end-to-end test flaky?', 'What would you test at each level for a login feature?'],
  },
  'sw-041': {
    question: 'What is a mock, and when should you use one?',
    intent: 'The interviewer checks that you understand test doubles and their risks.',
    expectedAnswer:
      'A mock is a test double that replaces a real dependency and lets you check how your code interacts with it, for example verifying that an e-mail service was called once with the right address. Related doubles include stubs, which return prepared answers, and fakes, which are simple working implementations such as an in-memory repository. Mocks are useful for dependencies that are slow, unreliable or have side effects, like payment providers. Overusing them is risky: tests become tied to implementation details and may pass while the real integration is broken.',
    explanation:
      'Test doubles make unit tests fast and focused. Knowing the difference between mocks, stubs and fakes, and the cost of over-mocking, shows maturity.',
    tips: ['Distinguish mocks, stubs and fakes.', 'Mention the risk of over-mocking.'],
    commonMistakes: ['Mocking the class under test.', 'Mocking simple value objects.'],
    followUpQuestions: ['Why might an in-memory fake be better than a mock?', 'How do you test code that depends on the current time?'],
  },
  'sw-042': {
    question: 'What is test-driven development, and what are its benefits and limits?',
    intent: 'The interviewer wants to see whether you understand TDD as a design practice, not just as testing.',
    expectedAnswer:
      'Test-driven development is a cycle: write a small failing test that describes the next piece of behaviour, write the simplest code to make it pass, then refactor while keeping tests green. Its benefits are a fast feedback loop, high test coverage as a side effect and code designed to be testable, with small units and explicit dependencies. It also helps clarify requirements before coding. Its limits: it is harder for exploratory work, user interfaces or unclear requirements, it can lead to tests tied too closely to implementation if done mechanically, and it requires discipline and practice. Many teams apply it selectively, for business logic and bug fixes.',
    explanation:
      'A nuanced answer about TDD shows that you know the practice and its trade-offs rather than repeating dogma for or against it.',
    tips: ['Describe the red-green-refactor cycle.', 'Give a balanced view of when it helps.'],
    commonMistakes: ['Describing TDD as "writing tests after the code".', 'Presenting it as always or never appropriate.'],
    followUpQuestions: ['How do you use TDD to fix a bug?', 'What is the difference between TDD and BDD?'],
  },
  'sw-043': {
    question: 'How do you decide what to test and how much coverage is enough?',
    intent: 'The interviewer checks risk-based thinking about testing rather than chasing metrics.',
    expectedAnswer:
      'I focus tests where failures would be costly or likely: business rules, calculations involving money, security checks, complex conditions and code that has had bugs before. I test edge cases such as empty inputs, limits and invalid data, not just the happy path. Coverage percentage is a useful signal to find untested areas, but a high number does not prove that assertions are meaningful. I would rather have 70% coverage with strong tests on critical logic than 95% with tests that only execute code. Every bug fix also gets a test that reproduces it first.',
    explanation:
      'Interviewers value risk-based test strategies and an understanding that coverage measures execution, not correctness.',
    tips: ['Explain how you prioritise by risk.', 'Mention regression tests for bugs.'],
    commonMistakes: ['Setting 100% coverage as the goal.', 'Testing trivial getters while ignoring complex logic.'],
    followUpQuestions: ['What is mutation testing?', 'How do you test error handling?'],
  },
  'sw-044': {
    question: 'How would you design a testing strategy for a system made of several microservices?',
    intent: 'The interviewer evaluates advanced testing design across service boundaries, balancing confidence and speed.',
    expectedAnswer:
      'Within each service I would keep a strong base of fast unit tests for domain logic and integration tests against real dependencies the service owns, such as its database, using containers like Testcontainers. Between services, the main risk is incompatible contracts, so I would use consumer-driven contract tests, for example with Pact: each consumer publishes its expectations, and the provider verifies them in its pipeline, which catches breaking changes before deployment without running the whole system. On top, I would keep a small number of end-to-end tests covering the most critical business journeys, such as placing and paying for an order, in a shared environment. Because not everything can be tested before production, I would add canary or progressive releases, feature flags and good monitoring with synthetic checks on key flows, so problems are detected and rolled back quickly. Test data management and keeping environments reproducible are also part of the strategy.',
    explanation:
      'In distributed systems, full end-to-end testing does not scale. Contract tests and production safety nets replace much of it, which is a key insight at the advanced level.',
    tips: ['Mention contract testing explicitly.', 'Keep end-to-end tests few and critical.', 'Include testing in production practices.'],
    commonMistakes: ['Relying on a large, slow end-to-end suite for every change.', 'Mocking other services everywhere without checking real contracts.'],
    followUpQuestions: ['How do contract tests fit into a CI pipeline?', 'How do you handle test data across services?'],
  },
  'sw-045': {
    question: 'A test suite has become slow and flaky. How would you fix it?',
    intent: 'The interviewer checks advanced practical experience with test reliability and developer productivity.',
    expectedAnswer:
      'First I would measure: identify the slowest tests and the ones that fail intermittently, using CI history and test reports. For flaky tests, I would look for common causes: dependence on timing with fixed sleeps, shared state between tests, test order, real network calls, the current date or random data without a fixed seed. Fixes include waiting for explicit conditions instead of sleeping, isolating data per test, controlling time and randomness, and replacing external calls with fakes or local containers. I would quarantine tests that cannot be fixed immediately, with an owner and a deadline, rather than letting the team ignore red builds. For speed, I would move checks to the lowest suitable level of the pyramid, run tests in parallel, reuse expensive set-up such as containers, and run only affected tests on pull requests with the full suite on the main branch. I would track flakiness and duration over time so the improvement lasts.',
    explanation:
      'Flaky tests destroy trust in CI. A systematic, data-driven approach that fixes root causes and protects the main branch shows senior-level ownership.',
    tips: ['Start by measuring.', 'List the classic causes of flakiness.', 'Explain how you would prevent regressions in the future.'],
    commonMistakes: ['Adding automatic retries everywhere and hiding the problem.', 'Deleting tests without understanding what they covered.'],
    followUpQuestions: ['How do you test asynchronous code without sleeps?', 'What should happen when a flaky test blocks a release?'],
  },
  'sw-046': {
    question: 'How do you approach debugging a problem you do not understand yet?',
    intent: 'The interviewer wants to see a methodical approach instead of random changes.',
    expectedAnswer:
      'I start by reproducing the problem reliably and writing down the exact steps, inputs and environment. Then I read the error message and stack trace carefully, and check logs around the time of the failure. I form a hypothesis about the cause and test it, for example by adding logs, using a debugger with breakpoints or simplifying the input until the problem disappears. If the problem appeared recently, I compare with a working version, sometimes using git bisect to find the change that introduced it. Once fixed, I add a test that reproduces the bug so it cannot come back.',
    explanation:
      'Debugging is a scientific process: reproduce, observe, hypothesise, test. Interviewers want to see that you narrow the search systematically.',
    tips: ['Mention reproduction first.', 'Describe tools: logs, debugger, bisect.', 'End with a regression test.'],
    commonMistakes: ['Changing code randomly until it works.', 'Ignoring the error message.'],
    followUpQuestions: ['What do you do if you cannot reproduce the bug?', 'How does git bisect work?'],
  },
  'sw-047': {
    question: 'How would you debug a problem that happens only in production?',
    intent: 'The interviewer checks practical experience with observability and safe investigation on live systems.',
    expectedAnswer:
      'First I would assess the impact and, if needed, mitigate it, for example by rolling back or disabling a feature flag, before investigating in depth. Then I would gather evidence without disturbing users: logs filtered by request or correlation identifiers, metrics showing when the problem started, traces showing where time is spent, and recent changes such as deployments or configuration updates. I would compare production with test environments to find differences: data volume, configuration, versions or traffic patterns. If needed, I would add targeted logging or reproduce with anonymised production data in a safe environment. After the fix, I would write a short incident review and improve monitoring so the issue is detected earlier next time.',
    explanation:
      'Production debugging relies on observability and on finding what differs from other environments. Mitigation first, investigation second, prevention last is the professional order.',
    tips: ['Mention mitigation before investigation.', 'Explain how you use logs, metrics and traces.', 'Talk about environment differences.'],
    commonMistakes: ['Debugging directly on production servers without care.', 'Ignoring recent deployments as a likely cause.'],
    followUpQuestions: ['What is a correlation ID?', 'How do you debug with sensitive data in production?'],
  },
  'sw-048': {
    question: 'How do you find and fix a memory leak?',
    intent: 'The interviewer checks experience with resource problems and profiling tools.',
    expectedAnswer:
      'The first sign is usually memory that grows steadily over time and is never released, sometimes ending in out-of-memory errors or long garbage collection pauses. I would confirm it with monitoring, then take heap snapshots at different moments and compare them to see which objects keep growing, using tools such as a heap dump analyser for the JVM or the memory tab of browser developer tools. I would then follow the references holding those objects. Common causes are caches without size limits, listeners or subscriptions never removed, static collections, unclosed resources and closures capturing large objects. After fixing it, I would run a load test to check that memory stabilises.',
    explanation:
      'In managed languages, leaks come from references that are kept unintentionally. Comparing snapshots and tracing retaining paths is the standard method.',
    tips: ['Explain how you confirm the leak with data.', 'List typical causes.', 'Verify the fix under load.'],
    commonMistakes: ['Simply increasing memory limits.', 'Assuming garbage collection makes leaks impossible.'],
    followUpQuestions: ['What is a retaining path?', 'How would you limit a cache safely?'],
  },
  'sw-049': {
    question: 'How would you investigate a bug that occurs randomly, such as a suspected race condition?',
    intent: 'The interviewer evaluates advanced debugging of concurrency and timing issues, which are notoriously hard to reproduce.',
    expectedAnswer:
      'I would first collect as much context as possible from each occurrence: timestamps, thread or request identifiers, inputs and what else was running at the same time, to look for patterns such as high load or simultaneous requests on the same data. A race condition often shows up as lost updates, duplicates or inconsistent states. To reproduce it, I would increase the probability: run the scenario many times in parallel, add artificial delays at suspected points or use stress-testing tools. Code review is essential: I would look for shared mutable state, check-then-act sequences without locks, non-atomic read-modify-write operations and assumptions about ordering. Fixes depend on the case: making operations atomic, using database constraints or optimistic locking with a version column, proper synchronisation, or redesigning to avoid shared state, for example by using immutable data or a single writer. I would write a concurrent test that failed before the fix and passes consistently after, and keep monitoring because these bugs can hide.',
    explanation:
      'Concurrency bugs require probabilistic reproduction, careful code reasoning and fixes that address atomicity, not just timing. Advanced answers combine all three.',
    tips: ['Explain how you make the bug more likely to appear.', 'Name typical concurrency patterns that cause bugs.', 'Offer database-level as well as code-level fixes.'],
    commonMistakes: ['Adding sleeps or retries to hide the symptom.', 'Synchronising everything and creating deadlocks or bottlenecks.'],
    followUpQuestions: ['What is the difference between optimistic and pessimistic locking?', 'How would you detect a deadlock?'],
  },
  'sw-050': {
    question: 'Walk me through how you lead the response to a serious production incident.',
    intent: 'The interviewer wants to see senior ownership: coordination, communication, mitigation and learning under pressure.',
    expectedAnswer:
      "First I make sure the incident is declared and roles are clear: one person coordinates, others investigate, and someone handles communication with support and stakeholders so engineers can focus. I assess the impact, which users, which features and since when, and set a severity level. The priority is to restore service, not to find the perfect fix: I look at recent changes and use the fastest safe mitigation, such as a rollback, a feature flag, scaling or failover. We keep a shared timeline of observations and actions, which avoids duplicated work and helps the review. Stakeholders receive regular, short updates with what we know, what we are doing and the time of the next update. Once the service is stable, we confirm with metrics, then fix the root cause properly. Afterwards, I organise a blameless post-incident review that identifies contributing factors, such as missing alerts or risky deployment practices, and produces a few concrete actions with owners and deadlines, which we then track to completion.",
    explanation:
      'Incident leadership combines technical judgment with coordination and communication. Mitigation before root cause, clear roles and blameless learning are the core practices of mature teams.',
    tips: ['Separate roles: coordination, investigation, communication.', 'Prioritise mitigation over a perfect fix.', 'Describe the blameless review and follow-up actions.'],
    commonMistakes: ['Letting everyone investigate without coordination.', 'Ending the story when the service comes back, without learning.'],
    followUpQuestions: ['How do you decide between rolling back and fixing forward?', 'What makes a post-incident review blameless?'],
  },
};
