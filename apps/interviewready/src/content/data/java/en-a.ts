import type { QuestionText, TextTable } from '@/types/content';

/** Java questions 001-025: fundamentals, collections, streams, concurrency (part). */
export const enA: TextTable<QuestionText> = {
  'java-001': {
    question: 'What is the difference between == and equals() in Java?',
    intent: 'The interviewer checks a fundamental distinction that causes many real bugs, especially with strings and wrapper types.',
    expectedAnswer:
      'For objects, == compares references: it is true only if both variables point to the same object in memory. equals() compares logical equality as defined by the class. String overrides equals() to compare characters, so new String("a") == new String("a") is false while equals() is true. For primitives such as int, == compares values directly. If a class does not override equals(), it inherits Object.equals(), which behaves like ==.',
    explanation:
      'Using == on strings may seem to work because of the string pool, which reuses literal strings, but it fails with strings built at runtime. The same trap exists with Integer values outside the small cached range.',
    example: 'Integer a = 1000, b = 1000; a == b  // false: different objects\na.equals(b)  // true',
    tips: ['Mention the string pool as the reason == sometimes appears to work.', 'Use Objects.equals(a, b) to avoid NullPointerException.'],
    commonMistakes: ['Comparing strings with ==.', 'Forgetting that wrapper types such as Integer are objects.'],
    followUpQuestions: ['What is the contract between equals() and hashCode()?', 'What is the Integer cache?'],
  },
  'java-002': {
    question: 'What is the contract between equals() and hashCode(), and why does it matter?',
    intent: 'The interviewer wants to see that you understand how hash-based collections rely on these two methods.',
    expectedAnswer:
      'If two objects are equal according to equals(), they must return the same hashCode(). The reverse is not required: different objects may share a hash code. HashMap and HashSet first use hashCode() to find the bucket, then equals() to find the exact entry. If you override equals() without hashCode(), two equal objects can land in different buckets, so a set may contain duplicates and map lookups fail. Both methods should use the same fields, and those fields should not change while the object is a key.',
    explanation:
      'This contract is what makes hash collections work. Records and IDE generators produce consistent implementations, which avoids most mistakes.',
    tips: ['Always override both methods together.', 'Mention that records generate them automatically.'],
    commonMistakes: ['Overriding only equals().', 'Using mutable fields in hashCode() for objects stored as keys.'],
    followUpQuestions: ['What happens if a key changes after being put in a HashMap?', 'How would you implement equals() for a class with inheritance?'],
  },
  'java-003': {
    question: 'Why is String immutable in Java, and when should you use StringBuilder?',
    intent: 'The interviewer checks your understanding of immutability and its performance consequences.',
    expectedAnswer:
      'A String cannot be changed after creation; methods such as concat() or replace() return a new String. Immutability makes strings safe to share between threads, allows the JVM to reuse literals in the string pool, makes them reliable as HashMap keys and protects values such as file paths or class names from being changed after checks. The downside is that building a string by repeated concatenation in a loop creates many temporary objects. StringBuilder is a mutable buffer for that case: you append in the loop and call toString() once.',
    explanation:
      'The compiler already optimises simple concatenations in one expression, so StringBuilder matters mainly in loops or when building large strings step by step.',
    example: 'StringBuilder sb = new StringBuilder();\nfor (String line : lines) sb.append(line).append(\'\\n\');\nString text = sb.toString();',
    tips: ['Give at least two reasons for immutability.', 'Say when StringBuilder actually matters.'],
    commonMistakes: ['Using StringBuilder everywhere, even for one simple concatenation.', 'Confusing StringBuilder with the synchronised StringBuffer.'],
    followUpQuestions: ['What is the string pool?', 'What is the difference between StringBuilder and StringBuffer?'],
  },
  'java-004': {
    question: 'What is the difference between checked and unchecked exceptions? How do you choose?',
    intent: 'The interviewer wants to see whether you understand Java exception design and can apply it sensibly in an API.',
    expectedAnswer:
      'Checked exceptions extend Exception but not RuntimeException; the compiler forces callers to catch them or declare them with throws. Examples are IOException and SQLException. Unchecked exceptions extend RuntimeException, such as IllegalArgumentException or NullPointerException, and the compiler does not force handling. A common guideline is to use checked exceptions for recoverable conditions the caller can reasonably handle, and unchecked exceptions for programming errors or situations the caller cannot fix. In practice, many modern frameworks such as Spring prefer unchecked exceptions, because checked exceptions spread through signatures and are often caught and ignored. Whatever the choice, exceptions should carry a clear message and the original cause.',
    explanation:
      'The debate about checked exceptions is about forcing handling versus keeping APIs simple. Knowing the guideline and how frameworks behave shows practical judgment.',
    tips: ['Give examples of each type.', 'Explain the guideline and how Spring handles database exceptions.', 'Mention preserving the cause when wrapping.'],
    commonMistakes: ['Catching Exception and doing nothing.', 'Wrapping an exception without passing the original cause.'],
    followUpQuestions: ['What is try-with-resources?', 'How would you design error handling for a REST API?'],
  },
  'java-005': {
    question: 'Explain the keywords final, finally and the finalize() method.',
    intent: 'The interviewer checks precise knowledge of three similar-sounding but unrelated features, including a deprecated one.',
    expectedAnswer:
      'final is a modifier: a final variable cannot be reassigned, a final method cannot be overridden and a final class cannot be extended, like String. Note that a final reference to a mutable object does not make the object immutable. finally is a block after try/catch that runs whether or not an exception occurs, used for clean-up, although try-with-resources is now the preferred way to close resources. finalize() was a method called by the garbage collector before reclaiming an object; it is unreliable and slow, deprecated since Java 9 and marked for removal since Java 18. Cleaner or try-with-resources should be used instead.',
    explanation:
      'This classic question tests precision. Mentioning that finalize() is deprecated and that final does not imply immutability shows up-to-date, careful knowledge.',
    tips: ['Point out that final references can still point to mutable objects.', 'Say that finalize() is deprecated.'],
    commonMistakes: ['Relying on finalize() to release resources.', 'Thinking a final list cannot be modified.'],
    followUpQuestions: ['Does finally run if the try block returns?', 'How does try-with-resources work?'],
  },
  'java-006': {
    question: 'What are Java records and when would you use them?',
    intent: 'The interviewer checks knowledge of modern Java (16+) and of modelling immutable data.',
    expectedAnswer:
      'A record is a concise way to declare an immutable data carrier. From a declaration like record Point(int x, int y) {}, the compiler generates private final fields, a canonical constructor, accessors x() and y(), and equals(), hashCode() and toString() based on all components. Records are ideal for DTOs, API responses, value objects and keys in maps. You can add validation in a compact constructor, static factory methods and additional methods. Limits: records cannot extend another class, their fields cannot be reassigned, and they are shallowly immutable, so a record containing a List can still have its list modified unless you copy it defensively.',
    explanation:
      'Records remove boilerplate and make intent clear: this type is data. Mentioning shallow immutability and compact constructors shows hands-on experience.',
    example: 'record Money(BigDecimal amount, String currency) {\n  Money { if (amount.signum() < 0) throw new IllegalArgumentException("negative"); }\n}',
    tips: ['List what the compiler generates.', 'Mention validation in a compact constructor.', 'Explain shallow immutability.'],
    commonMistakes: ['Using records as JPA entities, which need mutability and a no-argument constructor.', 'Assuming nested collections are immutable.'],
    followUpQuestions: ['Can a record implement an interface?', 'How do records work with Jackson serialisation?'],
  },
  'java-007': {
    question: 'How do sealed classes and pattern matching for switch work together in modern Java?',
    intent: 'The interviewer assesses up-to-date Java 21 knowledge and modelling of closed type hierarchies.',
    expectedAnswer:
      'A sealed class or interface lists exactly which classes may extend it, with the permits clause, for example sealed interface Payment permits Card, Transfer, Wallet. Since Java 21, switch supports pattern matching on types, with record deconstruction and guards using when. When you switch over a sealed type, the compiler knows all possible subtypes, so it can check exhaustiveness: if you handle every permitted type, no default branch is needed, and if a new subtype is added later, every non-exhaustive switch fails to compile. This gives algebraic data types similar to those in functional languages: you model a closed set of cases and the compiler ensures they are all handled. It replaces visitor patterns and chains of instanceof checks in many cases.',
    explanation:
      'Exhaustiveness checking is the key benefit: adding a case becomes a compile-time to-do list instead of a runtime bug. Advanced candidates connect this to domain modelling.',
    example: 'String describe(Payment p) {\n  return switch (p) {\n    case Card c when c.amount() > 1000 -> "large card payment";\n    case Card c -> "card";\n    case Transfer t -> "transfer to " + t.iban();\n    case Wallet w -> "wallet";\n  };\n}',
    tips: ['Explain exhaustiveness checking.', 'Mention record patterns and guards.', 'Compare with the visitor pattern or instanceof chains.'],
    commonMistakes: ['Adding a default branch that hides missing cases.', 'Confusing sealed with final.'],
    followUpQuestions: ['What does non-sealed mean?', 'How would you model order states with sealed types?'],
  },
  'java-008': {
    question: 'What is the difference between List, Set and Map in Java?',
    intent: 'The interviewer checks that you can choose the right collection type for a task.',
    expectedAnswer:
      'A List is an ordered collection that allows duplicates and access by index, typically ArrayList. A Set holds unique elements: HashSet has no guaranteed order, LinkedHashSet keeps insertion order and TreeSet keeps elements sorted. A Map stores key-value pairs with unique keys: HashMap for fast lookup, LinkedHashMap for insertion order and TreeMap for sorted keys. Map is not a subtype of Collection. Choose a List for sequences, a Set when uniqueness matters and a Map when you look up values by a key.',
    explanation:
      'Choosing the right interface communicates intent and gives the right guarantees and performance for the use case.',
    tips: ['Mention the main implementations and their ordering.', 'Give a use case for each.'],
    commonMistakes: ['Using a List and checking contains() repeatedly where a Set would be faster.'],
    followUpQuestions: ['When would you use a TreeMap?', 'How does HashSet check uniqueness?'],
  },
  'java-009': {
    question: 'How does HashMap work internally?',
    intent: 'The interviewer wants a deeper understanding of one of the most used classes and its performance behaviour.',
    expectedAnswer:
      'HashMap stores entries in an array of buckets. When you put a key, it calls hashCode(), spreads the bits and uses them to compute a bucket index. If the bucket is empty, the entry is stored there; if not, there is a collision and the entry is added to that bucket, which is a linked list. Since Java 8, when a bucket has more than eight entries and the table is large enough, the list becomes a balanced tree, improving the worst case from O(n) to O(log n). On get, HashMap finds the bucket and uses equals() to find the matching key. When the number of entries exceeds capacity times the load factor, 0.75 by default, the table doubles in size and entries are redistributed. HashMap allows one null key and is not thread-safe.',
    explanation:
      'Knowing buckets, collisions, treeification and resizing explains average O(1) performance, why good hash codes matter and why resizing can be costly.',
    tips: ['Explain hashing, collisions and equals().', 'Mention the load factor and resizing.', 'Mention treeification since Java 8.'],
    commonMistakes: ['Saying HashMap keeps insertion order.', 'Using it concurrently without synchronisation.'],
    followUpQuestions: ['Why might you set an initial capacity?', 'Why is HashMap unsafe with concurrent writes?'],
  },
  'java-010': {
    question: 'What is the difference between Comparable and Comparator?',
    intent: 'The interviewer checks how you define ordering for objects and write clean sorting code.',
    expectedAnswer:
      'Comparable is implemented by the class itself, through compareTo(), to define its natural order, for example String sorts alphabetically. A class can have only one natural order. Comparator is a separate object that defines an ordering, so you can have many: by price, by date, descending. Since Java 8, Comparator has factory and combination methods, such as Comparator.comparing(Product::price).thenComparing(Product::name).reversed(), which make sorting code readable. The natural order should be consistent with equals() when the objects are used in sorted sets or maps.',
    explanation:
      'Comparable is for the single obvious order of a type; Comparator is for all other orders. Modern Comparator methods avoid error-prone manual comparisons.',
    example: 'products.sort(Comparator.comparing(Product::category).thenComparing(Product::price, Comparator.reverseOrder()));',
    tips: ['Show the modern Comparator.comparing style.', 'Mention consistency with equals() for TreeSet and TreeMap.'],
    commonMistakes: ['Implementing compare with subtraction, which can overflow.', 'Forcing a natural order on a class that has no obvious one.'],
    followUpQuestions: ['What happens in a TreeSet if compareTo is inconsistent with equals?', 'How do you handle null values when sorting?'],
  },
  'java-011': {
    question: 'What is a ConcurrentModificationException and how do you avoid it?',
    intent: 'The interviewer checks practical knowledge of iterator behaviour and safe collection modification.',
    expectedAnswer:
      'Most standard collections such as ArrayList and HashMap have fail-fast iterators: if the collection is structurally modified during iteration by anything other than the iterator itself, the next call throws ConcurrentModificationException. It happens even in a single thread, for example when removing elements inside a for-each loop. To avoid it, use iterator.remove(), use removeIf() such as list.removeIf(o -> o.isCancelled()), collect changes and apply them after the loop, or build a new filtered collection with streams. In multithreaded code, use concurrent collections such as ConcurrentHashMap or CopyOnWriteArrayList, whose iterators do not throw this exception.',
    explanation:
      'The exception is a best-effort detection of a programming error, not a concurrency guarantee. The fix is to modify collections in a controlled way.',
    tips: ['Mention that it happens in single-threaded code too.', 'Give removeIf() as the simplest fix.'],
    commonMistakes: ['Catching the exception instead of fixing the loop.', 'Thinking fail-fast iterators make code thread-safe.'],
    followUpQuestions: ['How does CopyOnWriteArrayList work and when is it a bad choice?', 'Why is the detection described as best-effort?'],
  },
  'java-012': {
    question: 'Compare HashMap, Collections.synchronizedMap and ConcurrentHashMap for concurrent use.',
    intent: 'The interviewer assesses advanced concurrency knowledge and the ability to avoid subtle race conditions.',
    expectedAnswer:
      'HashMap is not thread-safe: concurrent writes can lose updates or corrupt its internal state. Collections.synchronizedMap wraps a map with a single lock on every method, so each call is safe, but all threads contend for the same lock and you must still synchronise manually when iterating or doing compound actions. ConcurrentHashMap is designed for concurrency: reads are mostly lock-free and writes lock only the affected bin, so throughput is much better. It does not allow null keys or values, its iterators are weakly consistent and never throw ConcurrentModificationException, and it provides atomic compound operations such as putIfAbsent, computeIfAbsent and merge. The key trap is check-then-act: if (!map.containsKey(k)) map.put(k, v) is not atomic even on a ConcurrentHashMap, so you must use computeIfAbsent or merge instead.',
    explanation:
      'Thread-safe individual methods do not make sequences of calls atomic. Advanced candidates know that compound operations must use the atomic APIs.',
    example: 'counts.merge(word, 1, Integer::sum); // atomic increment in a ConcurrentHashMap',
    tips: ['Explain lock granularity.', 'Highlight the check-then-act problem and atomic methods.', 'Mention the null restriction.'],
    commonMistakes: ['Using containsKey followed by put on a concurrent map.', 'Running long or blocking work inside computeIfAbsent.'],
    followUpQuestions: ['Why does ConcurrentHashMap reject null values?', 'What does weakly consistent iteration mean?'],
  },
  'java-013': {
    question: 'What is the difference between List.of(), Arrays.asList() and Collections.unmodifiableList()?',
    intent: 'The interviewer checks precise knowledge of immutability guarantees, which often surprise developers in production.',
    expectedAnswer:
      'List.of(), available since Java 9, creates a truly immutable list: any add, remove or set throws UnsupportedOperationException, and it rejects null elements. Arrays.asList() returns a fixed-size list backed by the original array: you cannot add or remove, but set() works and writes through to the array, and changes to the array are visible in the list; it accepts nulls. Collections.unmodifiableList() returns a read-only view of another list: you cannot modify it through the view, but if the underlying list changes, the view shows the changes, so it is not immutable. To return a safe copy from a method, use List.copyOf(), which creates an immutable copy, or wrap a defensive copy.',
    explanation:
      'The difference between a copy and a view is the core concept. Bugs appear when code assumes an unmodifiable view cannot change.',
    tips: ['Distinguish immutable copies from read-only views.', 'Mention null handling.', 'Suggest List.copyOf() for defensive copies.'],
    commonMistakes: ['Returning an internal list wrapped only in unmodifiableList and assuming callers see a frozen snapshot.', 'Calling add() on Arrays.asList().'],
    followUpQuestions: ['How would you expose a collection field safely from a class?', 'Is a record containing List.of() fully immutable?'],
  },
  'java-014': {
    question: 'What is a Stream in Java, and what is the difference between intermediate and terminal operations?',
    intent: 'The interviewer checks basic understanding of the Streams API and its lazy evaluation.',
    expectedAnswer:
      'A Stream is a sequence of elements that supports declarative operations such as filtering, mapping and reducing, without storing data itself. Intermediate operations such as filter, map and sorted return a new stream and are lazy: nothing happens until a terminal operation is called. Terminal operations such as collect, forEach, count or findFirst trigger processing and produce a result. A stream can be consumed only once. For example, orders.stream().filter(o -> o.isPaid()).map(Order::total).reduce(BigDecimal.ZERO, BigDecimal::add) computes the total of paid orders.',
    explanation:
      'Laziness lets the stream combine operations efficiently and stop early, for example with findFirst or limit.',
    tips: ['Give a short pipeline example.', 'Mention that streams can be used only once.'],
    commonMistakes: ['Expecting a pipeline without a terminal operation to do something.', 'Reusing a consumed stream.'],
    followUpQuestions: ['What does short-circuiting mean in streams?', 'When would you prefer a simple loop?'],
  },
  'java-015': {
    question: 'What is the difference between map() and flatMap() in streams?',
    intent: 'The interviewer checks understanding of stream transformations and nested data.',
    expectedAnswer:
      'map() transforms each element into exactly one new element, so a Stream<Order> mapped with Order::customer gives a Stream<Customer>. flatMap() transforms each element into a stream of elements and flattens all those streams into one. If each Order has a List<Item>, orders.stream().map(Order::items) gives a Stream<List<Item>>, while orders.stream().flatMap(o -> o.items().stream()) gives a Stream<Item> of all items. The same idea exists on Optional: map wraps the result, flatMap avoids an Optional of Optional when the function already returns an Optional.',
    explanation:
      'flatMap is used whenever one element produces zero, one or many results and you want a single flat sequence.',
    tips: ['Use a nested-list example.', 'Mention Optional.flatMap too.'],
    commonMistakes: ['Ending up with Stream<List<T>> and iterating twice.', 'Using flatMap when map is enough.'],
    followUpQuestions: ['What does mapMulti do?', 'How would you get the distinct product names across all orders?'],
  },
  'java-016': {
    question: 'How should Optional be used, and how should it not be used?',
    intent: 'The interviewer checks good API design and awareness of common misuses of Optional.',
    expectedAnswer:
      'Optional is meant as a return type for methods that may not have a result, such as findById(), so callers are forced to handle the empty case explicitly. Good usage includes map, filter, orElse, orElseGet for expensive defaults and orElseThrow to fail with a clear exception. It should not be used for fields, method parameters or collections: an empty collection already expresses "no results", and Optional fields add overhead and are not serialisable. Calling get() without checking defeats the purpose; use orElseThrow() instead. Also, an Optional variable should never itself be null.',
    explanation:
      'Optional documents absence in the method signature. Its value comes from fluent handling of the empty case, not from wrapping every nullable value.',
    example: 'String city = repo.findById(id).map(User::address).map(Address::city).orElse("unknown");',
    tips: ['State the intended use as a return type.', 'Contrast orElse with orElseGet.'],
    commonMistakes: ['Using Optional as a field or parameter.', 'Calling get() directly.', 'Returning Optional<List<T>> instead of an empty list.'],
    followUpQuestions: ['Why does orElse evaluate its argument even when a value is present?', 'How would you handle absence in a REST controller?'],
  },
  'java-017': {
    question: 'How would you group and aggregate data with Collectors?',
    intent: 'The interviewer checks practical use of collectors for common reporting tasks.',
    expectedAnswer:
      'Collectors.groupingBy groups elements by a key and returns a Map. With a downstream collector you can aggregate each group: counting(), summingInt(), averagingDouble(), mapping() or toSet(). For example, orders.stream().collect(Collectors.groupingBy(Order::customerId, Collectors.summingInt(Order::quantity))) gives total quantity per customer. partitioningBy splits into a Map<Boolean, List<T>> using a predicate. toMap builds a map directly but throws an exception on duplicate keys unless you provide a merge function. If ordering matters, you can pass a map factory such as TreeMap::new.',
    explanation:
      'Collectors replace many manual loops with maps. Knowing downstream collectors and the duplicate-key behaviour of toMap avoids common bugs.',
    example: 'Map<Status, Long> countByStatus = tickets.stream().collect(Collectors.groupingBy(Ticket::status, Collectors.counting()));',
    tips: ['Show groupingBy with a downstream collector.', 'Mention the toMap merge function.'],
    commonMistakes: ['Using toMap without handling duplicate keys.', 'Writing nested loops where a collector is clearer.'],
    followUpQuestions: ['How would you get the top product per category?', 'What is Collectors.teeing?'],
  },
  'java-018': {
    question: 'When should you use parallel streams, and what are the risks?',
    intent: 'The interviewer assesses advanced judgment about parallelism in the JVM and its hidden costs.',
    expectedAnswer:
      'A parallel stream splits its source and processes parts on the common ForkJoinPool, then combines the results. It can help for CPU-intensive work on large datasets with sources that split well, such as ArrayList or arrays, when operations are stateless and independent. It often does not help, or makes things slower, for small collections, sources that split poorly such as LinkedList or I/O-based streams, operations with ordering constraints such as findFirst or sorted, or when combining results is expensive. Risks include shared mutable state, which causes race conditions, and blocking I/O inside the pipeline, which starves the common pool used by the whole JVM, including other libraries and CompletableFuture default tasks. In a server that already handles many requests in parallel, parallel streams rarely improve throughput. The rule is to measure with a realistic benchmark, for example with JMH, before using them.',
    explanation:
      'Parallel streams are an optimisation, not a default. Advanced answers mention the common pool, data source characteristics and the need for measurement.',
    tips: ['List conditions where they help and where they hurt.', 'Mention the shared common ForkJoinPool.', 'Insist on measuring.'],
    commonMistakes: ['Adding .parallel() to speed up database or HTTP calls.', 'Modifying a shared list inside forEach on a parallel stream.'],
    followUpQuestions: ['How would you run a parallel stream on a custom pool?', 'Why does sorted() reduce the benefit of parallelism?'],
  },
  'java-019': {
    question: 'What are common pitfalls when writing stream pipelines in production code?',
    intent: 'The interviewer evaluates whether you use streams for readability and correctness, not as a style fashion.',
    expectedAnswer:
      'The first pitfall is side effects: modifying external state inside map or forEach makes pipelines hard to reason about and unsafe in parallel; results should be produced with collect or reduce. The second is relying on laziness incorrectly, for example peek() used for logic or operations that are skipped because of short-circuiting. Third, checked exceptions do not fit in lambdas, which leads to awkward wrapping; sometimes a loop is clearer. Fourth, performance traps: sorting or collecting large intermediate lists, boxing with Stream<Integer> instead of IntStream, or calling a database inside a map, which creates N+1 queries. Fifth, readability: very long pipelines with nested lambdas are harder to debug than a loop with well-named helper methods. Finally, toMap without a merge function or groupingBy on null keys throw at runtime. I use streams for clear transformations and keep complex control flow in loops or extracted methods.',
    explanation:
      'Streams are a tool for expressing transformations clearly. Senior developers know when they hurt readability, performance or error handling.',
    tips: ['Group pitfalls by correctness, performance and readability.', 'Mention primitive streams to avoid boxing.', 'Show that you still use loops when they are clearer.'],
    commonMistakes: ['Using peek() for business logic.', 'Building huge one-line pipelines nobody can debug.'],
    followUpQuestions: ['How do you debug a stream pipeline?', 'How do you handle checked exceptions in lambdas?'],
  },
  'java-020': {
    question: 'How do you create and run a task on another thread in modern Java?',
    intent: 'The interviewer checks basic concurrency knowledge and whether you use modern abstractions instead of raw threads.',
    expectedAnswer:
      'The low-level way is to create a Thread with a Runnable and call start(), not run(), which would execute on the current thread. In modern code, you usually submit tasks to an ExecutorService, which manages a pool of threads: executor.submit(() -> doWork()) returns a Future you can use to get the result or cancel the task. Executors reuse threads, limit concurrency and make shutdown explicit. Callable is like Runnable but returns a value and can throw checked exceptions. Since Java 21, virtual threads make it cheap to create one thread per task, for example with Executors.newVirtualThreadPerTaskExecutor().',
    explanation:
      'Creating raw threads for every task is expensive and hard to manage. Executors and, more recently, virtual threads are the standard tools.',
    tips: ['Mention start() versus run().', 'Prefer ExecutorService and show shutdown.'],
    commonMistakes: ['Calling run() instead of start().', 'Forgetting to shut down an executor.'],
    followUpQuestions: ['What is the difference between Runnable and Callable?', 'What happens if a task throws an exception in an executor?'],
  },
  'java-021': {
    question: 'What do synchronized and volatile do?',
    intent: 'The interviewer checks understanding of visibility and atomicity in Java concurrency.',
    expectedAnswer:
      'synchronized ensures mutual exclusion: only one thread at a time can execute a synchronized block on the same monitor object. It also guarantees visibility: changes made inside the block are visible to the next thread that acquires the same lock. volatile only guarantees visibility and ordering for a single variable: every read sees the latest write, but it does not make compound operations atomic. So a volatile boolean is fine as a stop flag, but count++ on a volatile int is still a race condition because it is a read, an increment and a write. For atomic counters, use AtomicInteger or LongAdder, or protect the operation with a lock.',
    explanation:
      'The key distinction is visibility versus atomicity. Many concurrency bugs come from assuming volatile makes operations atomic.',
    tips: ['Separate visibility from atomicity.', 'Give a correct use of volatile and an incorrect one.'],
    commonMistakes: ['Using volatile for a counter.', 'Synchronising on different objects and believing the code is protected.'],
    followUpQuestions: ['What is the difference between synchronized and ReentrantLock?', 'How does AtomicInteger work?'],
  },
  'java-022': {
    question: 'What is a deadlock, and how can you prevent it?',
    intent: 'The interviewer checks whether you can recognise and avoid a classic concurrency failure.',
    expectedAnswer:
      'A deadlock happens when two or more threads each hold a lock and wait for a lock held by another, so none can continue. A typical example: thread A locks account 1 then waits for account 2, while thread B locks account 2 then waits for account 1. Prevention strategies include always acquiring locks in the same global order, for example by account ID; holding locks for the shortest time and never calling unknown code while holding one; using tryLock with a timeout from ReentrantLock so a thread can back off; and reducing shared locks by using higher-level structures such as concurrent collections or message queues. Thread dumps, from jstack or monitoring tools, show deadlocked threads and the locks involved.',
    explanation:
      'Deadlocks need circular waiting. Breaking the cycle, usually through consistent lock ordering, is the most reliable prevention.',
    tips: ['Give the two-account example.', 'Name lock ordering as the main fix.', 'Mention how to detect a deadlock.'],
    commonMistakes: ['Adding more locks to fix a race condition without thinking about ordering.'],
    followUpQuestions: ['What is a livelock?', 'How would you detect a deadlock in production?'],
  },
  'java-023': {
    question: 'How do thread pools work, and how do you size one?',
    intent: 'The interviewer checks practical knowledge of executors and resource management.',
    expectedAnswer:
      'A thread pool keeps a set of worker threads that take tasks from a queue, which avoids the cost of creating a thread per task and limits how much runs at once. ThreadPoolExecutor is configured with a core size, a maximum size, a queue and a rejection policy for when both are full. Sizing depends on the work: for CPU-bound tasks, about the number of cores is enough, since more threads only add context switching; for I/O-bound tasks, threads spend time waiting, so more threads are useful, roughly cores multiplied by one plus the ratio of wait time to compute time. Unbounded queues, used by Executors.newFixedThreadPool, can hide overload until memory runs out, so production code often uses a bounded queue and an explicit rejection policy, and monitors queue size.',
    explanation:
      'Pool configuration is a capacity-planning decision. Mentioning bounded queues and rejection policies shows production experience.',
    tips: ['Distinguish CPU-bound and I/O-bound work.', 'Mention the risk of unbounded queues.'],
    commonMistakes: ['Creating a new pool per request.', 'Using a huge pool for CPU-bound work.'],
    followUpQuestions: ['What rejection policies exist?', 'How do virtual threads change pool sizing?'],
  },
  'java-024': {
    question: 'How would you combine several asynchronous calls with CompletableFuture?',
    intent: 'The interviewer assesses advanced asynchronous programming skills, including error handling and executors.',
    expectedAnswer:
      'I would start each independent call with supplyAsync, passing a dedicated executor rather than relying on the common ForkJoinPool, especially for blocking I/O. For calls that depend on a previous result, I use thenCompose, which chains asynchronous steps without nesting futures; thenApply is for synchronous transformations. For independent calls, thenCombine merges two results, and allOf waits for many; after allOf, I collect the results with join(), which no longer blocks at that point. Error handling uses exceptionally or handle to provide a fallback, and orTimeout or completeOnTimeout, since Java 9, to avoid waiting forever. I also make sure exceptions are logged with context, because an unobserved failed future can silently disappear. For example, to build a product page I would fetch product, price and stock in parallel, combine them, and fall back to "stock unknown" if the stock service times out.',
    explanation:
      'The essential points are composition (thenCompose versus thenApply), parallel fan-out (allOf, thenCombine), explicit executors and robust timeouts and fallbacks.',
    example: 'var price = supplyAsync(() -> pricing.get(id), ioPool);\nvar stock = supplyAsync(() -> inventory.get(id), ioPool).completeOnTimeout(Stock.UNKNOWN, 300, MILLISECONDS);\nreturn price.thenCombine(stock, ProductView::new);',
    tips: ['Contrast thenApply and thenCompose.', 'Always mention timeouts and a dedicated executor.', 'Show error handling.'],
    commonMistakes: ['Calling get() immediately after supplyAsync, making the code synchronous.', 'Running blocking calls on the common pool.'],
    followUpQuestions: ['How would virtual threads simplify this code?', 'How do you propagate a request context such as a trace ID?'],
  },
  'java-025': {
    question: 'What are virtual threads in Java 21, and when do they help?',
    intent: 'The interviewer checks up-to-date knowledge of Project Loom and its practical implications for servers.',
    expectedAnswer:
      'Virtual threads are lightweight threads managed by the JVM rather than the operating system. Many virtual threads run on a small pool of carrier platform threads. When a virtual thread performs a blocking operation such as a socket read, the JVM unmounts it from its carrier, which can run another virtual thread. This makes it practical to create millions of threads and use a simple thread-per-request, blocking style while achieving throughput similar to asynchronous code. They help for I/O-bound workloads such as web services calling databases and APIs. They do not make CPU-bound work faster. Points of attention: pooling virtual threads is pointless; ThreadLocal caches become expensive with many threads; long synchronized blocks around blocking calls could pin the carrier thread, a limitation that JDK 24 largely removed; and downstream resources such as database connection pools still limit real concurrency, so you may need semaphores. Spring Boot 3.2+ can enable them with spring.threads.virtual.enabled=true.',
    explanation:
      'Virtual threads change the cost model of threads, not the speed of computation. Advanced candidates also know the pitfalls such as pinning, ThreadLocal use and downstream limits.',
    tips: ['Explain mounting and unmounting on carrier threads.', 'Say clearly what they do not speed up.', 'Mention practical pitfalls and Spring Boot support.'],
    commonMistakes: ['Putting virtual threads in a fixed-size pool.', 'Expecting faster CPU-bound processing.'],
    followUpQuestions: ['What is pinning?', 'How do virtual threads compare with reactive programming?'],
  },
};
