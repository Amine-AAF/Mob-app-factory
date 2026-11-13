import type { QuestionText, TextTable } from '@/types/content';

/** Software questions 001-025: fundamentals, OOP, data structures, algorithms (part). */
export const enA: TextTable<QuestionText> = {
  'sw-001': {
    question: 'What is the difference between a compiled and an interpreted language?',
    intent: 'The interviewer checks that you understand how source code becomes something a machine runs, and that you avoid oversimplified labels.',
    expectedAnswer:
      'A compiled language is translated ahead of time into machine code or another low-level form before it runs, as with C or Go. An interpreted language is executed by a program that reads and runs the source more or less directly, as with classic shell scripts. In practice most modern languages mix both: Java and C# compile to bytecode that a virtual machine then interprets and compiles just in time, and JavaScript engines compile hot code at runtime. So "compiled" and "interpreted" describe implementations rather than languages themselves.',
    explanation:
      'Ahead-of-time compilation catches many errors early and usually produces faster start-up and execution, while interpretation gives flexibility and quick iteration. Just-in-time compilation combines both by optimising the code that runs most often.',
    example: 'Java: javac Main.java → Main.class (bytecode) → the JVM interprets it and JIT-compiles hot methods to native code.',
    tips: ['Mention that the distinction is about implementations, not languages.', 'Give a mixed example such as Java or JavaScript.'],
    commonMistakes: ['Saying interpreted languages are always slow.', 'Classifying Java as purely interpreted or purely compiled.'],
    followUpQuestions: ['What does a JIT compiler do?', 'Why might start-up time matter for serverless functions?'],
  },
  'sw-002': {
    question: 'What is the difference between a value type and a reference type?',
    intent: 'The interviewer wants to know whether you understand how data is copied and shared, which explains many everyday bugs.',
    expectedAnswer:
      'When you assign a value type, the value itself is copied, so changing the copy does not affect the original. With a reference type, the variable holds a reference to an object; assigning it copies the reference, so both variables point to the same object and a change through one is visible through the other. In Java, primitives such as int are values and objects are accessed by reference; in JavaScript, numbers and strings behave as values while objects and arrays are shared by reference.',
    explanation:
      'This distinction explains why modifying an array passed to a function also changes it for the caller, and why comparing two objects with == may compare identities instead of contents.',
    example: 'const a = [1, 2]; const b = a; b.push(3); // a is now [1, 2, 3] because a and b share the same array',
    tips: ['Use a small code example to illustrate sharing.', 'Mention equality: identity versus content comparison.'],
    commonMistakes: ['Saying Java passes objects by reference; Java always passes by value, the value being a reference for objects.'],
    followUpQuestions: ['How would you copy an object without sharing nested data?', 'What does immutability change here?'],
  },
  'sw-003': {
    question: 'What is the difference between the stack and the heap?',
    intent: 'The interviewer checks your mental model of memory: where local data lives, how long it lives and why it matters.',
    expectedAnswer:
      'The stack stores function call frames: local variables, parameters and return addresses. It grows and shrinks automatically as functions are called and return, which makes allocation very fast, but its size is limited and data disappears when the function ends. The heap stores data whose lifetime is not tied to a single call, such as objects created with new. It is larger and more flexible, but allocation is slower and memory must be freed, either manually as in C or by a garbage collector as in Java or JavaScript.',
    explanation:
      'Understanding the two regions helps explain stack overflow errors in deep recursion, memory leaks on the heap and why returning a pointer to a local variable is dangerous in languages like C.',
    tips: ['Link the stack to function calls and the heap to object lifetime.', 'Mention one typical error for each, such as stack overflow and memory leaks.'],
    commonMistakes: ['Saying all objects in Java are on the stack.', 'Forgetting that each thread has its own stack.'],
    followUpQuestions: ['What causes a stack overflow?', 'How does garbage collection decide what to free?'],
  },
  'sw-004': {
    question: 'Explain the difference between synchronous and asynchronous programming.',
    intent: 'The interviewer wants to see whether you understand blocking, concurrency and how programs stay responsive while waiting for input or output.',
    expectedAnswer:
      'In synchronous code, each operation waits for the previous one to finish. If a step waits for a network call or a file read, the whole thread is blocked during that time. In asynchronous code, a long operation is started and the program continues; the result is handled later through a callback, a promise or a future, often with async/await syntax. This lets a single thread serve many requests while waiting for input and output, as in Node.js, or keeps a user interface responsive. Asynchronous does not automatically mean parallel: work can be interleaved on one thread. The trade-offs are more complex error handling, ordering issues and harder debugging.',
    explanation:
      'Most applications spend much of their time waiting for I/O. Asynchronous models use that waiting time to do other work, which improves throughput and responsiveness, but they require careful handling of errors and shared state.',
    example: "async function load() { const res = await fetch(url); return res.json(); } // the thread is free while the request is pending",
    tips: ['Distinguish asynchronous from parallel.', 'Mention a concrete runtime such as Node.js or a mobile UI thread.'],
    commonMistakes: ['Thinking async code runs faster by itself.', 'Forgetting to handle rejected promises or exceptions.'],
    followUpQuestions: ['What is the event loop?', 'How do you run several async operations at the same time and wait for all of them?'],
  },
  'sw-005': {
    question: 'What is the difference between a process and a thread?',
    intent: 'The interviewer checks your understanding of how operating systems run programs and the trade-offs of concurrency models.',
    expectedAnswer:
      'A process is a running program with its own isolated memory space and resources such as file handles. A thread is a unit of execution inside a process; threads of the same process share its memory but each has its own stack and registers. Creating and switching between threads is cheaper than for processes, and sharing memory makes communication easy, but it also creates risks such as race conditions that need synchronisation. Processes are better isolated: a crash in one usually does not affect others, which is why browsers run tabs in separate processes.',
    explanation:
      'The choice between processes and threads balances isolation and safety against performance and ease of communication. Many systems combine them, for example several worker processes, each with a thread pool.',
    tips: ['Mention shared memory as both the advantage and the risk of threads.', 'Give a real-world example such as browser tabs or web server workers.'],
    commonMistakes: ['Saying threads have separate memory.', 'Ignoring the cost of synchronisation.'],
    followUpQuestions: ['What is a race condition?', 'What are lightweight threads or coroutines?'],
  },
  'sw-006': {
    question: 'What does immutability mean and why is it useful?',
    intent: 'The interviewer wants to see whether you understand how immutable data reduces bugs and simplifies concurrency and state management.',
    expectedAnswer:
      'An immutable object cannot be changed after it is created; to "modify" it, you create a new object with the new values. This makes code easier to reason about, because a value you receive cannot change behind your back. It also makes data safe to share between threads without locks, enables cheap change detection by comparing references, as React does with state, and avoids defensive copies. Examples include Java String and records, or frozen objects and spread copies in JavaScript. The cost is extra allocations, which persistent data structures reduce by sharing unchanged parts.',
    explanation:
      'Many bugs come from shared mutable state. Immutability removes a whole class of problems and is a foundation of functional programming and modern UI frameworks.',
    example: "const next = { ...user, name: 'Ana' }; // user is unchanged; next is a new object",
    tips: ['Give one concurrency benefit and one state-management benefit.', 'Acknowledge the performance cost and how it is mitigated.'],
    commonMistakes: ['Confusing a constant reference (const, final) with an immutable object.', 'Thinking immutability always hurts performance.'],
    followUpQuestions: ['Is a final List in Java immutable?', 'How do persistent data structures work?'],
  },
  'sw-007': {
    question: 'How do garbage collectors work, and what problems can they cause in production?',
    intent: 'The interviewer evaluates deeper runtime knowledge and whether you can diagnose memory and latency issues.',
    expectedAnswer:
      'A tracing garbage collector starts from roots, such as stack variables and static fields, and marks every object reachable from them; unreachable objects are reclaimed. Most collectors are generational: they assume most objects die young, so they collect a small young generation frequently and an old generation rarely. Modern collectors, like G1, ZGC or Shenandoah on the JVM, do most work concurrently to keep pauses short. Production problems include pause times that increase latency, high CPU spent collecting when allocation is excessive, and memory leaks when objects remain reachable by mistake, for example through static caches or listeners never removed. Diagnosis uses GC logs, heap dumps and allocation profiling, and fixes range from reducing allocations to tuning heap size or choosing a low-pause collector.',
    explanation:
      'GC removes manual memory management but not memory problems. Advanced candidates know that leaks in managed languages are about unintended references, and that GC behaviour directly affects latency and throughput.',
    tips: ['Explain reachability from roots.', 'Mention the generational hypothesis.', 'Describe how you would investigate a leak or long pauses.'],
    commonMistakes: ['Saying memory leaks are impossible with a garbage collector.', 'Recommending System.gc() as a fix.'],
    followUpQuestions: ['How would you analyse a heap dump?', 'When would you choose a low-pause collector?'],
  },
  'sw-008': {
    question: 'What are the four main principles of object-oriented programming?',
    intent: 'The interviewer checks your OOP foundations and whether you can explain each principle with a concrete example.',
    expectedAnswer:
      'Encapsulation hides internal state behind methods, so an object protects its own consistency. Abstraction exposes only what is necessary, for example a PaymentService interface without its implementation details. Inheritance lets a class reuse and extend another class, such as SavingsAccount extending Account. Polymorphism lets code work with a general type while each concrete type provides its own behaviour, for example calling shape.area() on circles and rectangles.',
    explanation:
      'These principles aim to manage complexity: limit what each part of the code needs to know, reuse behaviour and allow new types without changing existing code.',
    tips: ['Give one short example per principle.', 'Show that you know inheritance is not the only way to reuse code.'],
    commonMistakes: ['Reciting definitions with no example.', 'Confusing abstraction and encapsulation.'],
    followUpQuestions: ['What is the difference between abstraction and encapsulation?', 'When would you avoid inheritance?'],
  },
  'sw-009': {
    question: 'What is the difference between an abstract class and an interface?',
    intent: 'The interviewer wants to see whether you know when to use each construct and how languages treat them.',
    expectedAnswer:
      'An interface defines a contract: a set of methods a class promises to provide. A class can implement several interfaces. An abstract class is a partial implementation: it can have fields, constructors and implemented methods, but cannot be instantiated, and a class can extend only one in languages like Java or C#. Use an interface to describe a capability shared by unrelated classes, such as Comparable, and an abstract class when closely related classes share state and code. Since Java 8, interfaces can also have default methods, which narrows the gap but they still cannot hold instance state.',
    explanation:
      'Choosing between them is about modelling: "can do" relationships fit interfaces, "is a kind of, with shared implementation" fits abstract classes.',
    tips: ['Mention multiple implementation versus single inheritance.', 'Give one example of each.'],
    commonMistakes: ['Saying interfaces cannot have any method body in modern Java.', 'Using abstract classes only to share a single helper method.'],
    followUpQuestions: ['What are default methods used for?', 'Why do many developers prefer interfaces for dependencies?'],
  },
  'sw-010': {
    question: 'What is polymorphism, and how does dynamic dispatch work?',
    intent: 'The interviewer checks that you understand runtime behaviour of OOP code, not only the vocabulary.',
    expectedAnswer:
      'Polymorphism means code written against a general type can work with many concrete types. With subtype polymorphism, when you call a method through a reference of the parent type, the runtime selects the implementation of the actual object\'s class: this is dynamic dispatch. In Java, non-static, non-final, non-private methods are dispatched this way, typically through a virtual method table per class. Overloading is different: it is resolved at compile time based on the declared parameter types. Polymorphism lets you add new types without changing the code that uses them, which supports the open/closed principle.',
    explanation:
      'Knowing that overriding is resolved at runtime and overloading at compile time explains surprising behaviours and helps design extensible code.',
    example: 'Notifier n = new SmsNotifier(); n.send(msg); // SmsNotifier.send runs even though n is declared as Notifier',
    tips: ['Distinguish overriding (runtime) from overloading (compile time).', 'Explain why polymorphism helps extension.'],
    commonMistakes: ['Thinking static methods are overridden polymorphically.', 'Mixing up overloading and overriding.'],
    followUpQuestions: ['What other kinds of polymorphism exist, such as generics?', 'How would you replace a long switch on type with polymorphism?'],
  },
  'sw-011': {
    question: 'Why do many developers prefer composition over inheritance?',
    intent: 'The interviewer wants to see design maturity: understanding the costs of inheritance and the flexibility of composition.',
    expectedAnswer:
      'Inheritance creates a strong coupling: a subclass depends on the parent\'s implementation details, so a change in the parent can break subclasses, and deep hierarchies become hard to understand. It is also fixed at compile time. Composition builds behaviour by combining objects: a class holds references to collaborators and delegates to them. This keeps classes small, lets you swap behaviour at runtime or in tests, and avoids forcing an "is-a" relationship where it does not really exist. Inheritance is still useful for true subtype relationships with stable base classes, but composition is usually the safer default.',
    explanation:
      'The fragile base class problem and rigid hierarchies are common sources of design pain. Composition with interfaces gives the reuse of inheritance with looser coupling.',
    example: 'Instead of class LoggingRepository extends Repository, write class LoggingRepository implements Repository { private final Repository inner; ... } and delegate calls.',
    tips: ['Name the fragile base class problem.', 'Show a delegation example.'],
    commonMistakes: ['Claiming inheritance should never be used.', 'Building deep hierarchies to share small pieces of code.'],
    followUpQuestions: ['Which design patterns rely on composition?', 'When is inheritance the right choice?'],
  },
  'sw-012': {
    question: 'Explain the SOLID principles.',
    intent: 'The interviewer checks that you know common design guidelines and can relate them to real code decisions.',
    expectedAnswer:
      'Single responsibility: a class should have one reason to change. Open/closed: code should be open to extension but closed to modification, for example by adding a new implementation instead of editing a switch. Liskov substitution: a subtype must be usable wherever its parent is expected without breaking behaviour. Interface segregation: prefer several small, focused interfaces to one large interface that forces classes to implement methods they do not need. Dependency inversion: high-level code should depend on abstractions, not on concrete low-level details, which is what dependency injection supports. These are guidelines to reduce coupling, not rules to apply mechanically.',
    explanation:
      'Interviewers appreciate concrete examples and nuance: SOLID helps keep code changeable, but over-applying it can create needless abstraction.',
    tips: ['Give one example per principle if time allows.', 'Show that you balance SOLID with simplicity.'],
    commonMistakes: ['Reciting the acronym without understanding.', 'Confusing dependency inversion with dependency injection.'],
    followUpQuestions: ['Give an example of a Liskov violation.', 'When is applying SOLID over-engineering?'],
  },
  'sw-013': {
    question: 'Give an example of a Liskov substitution violation and how you would fix it.',
    intent: 'The interviewer assesses advanced design thinking: recognising when an inheritance relationship is semantically wrong.',
    expectedAnswer:
      'A classic violation is Square extending Rectangle. Rectangle lets you set width and height independently; a Square must keep them equal, so its setWidth also changes the height. Code that works with a Rectangle, for example setting width to 5 and height to 4 and expecting an area of 20, breaks when it receives a Square. The subtype weakened a guarantee the parent made. Another frequent case is a ReadOnlyList that throws on add while inheriting from a mutable List. Fixes include not using inheritance for these types, modelling shapes as immutable values with a common Shape interface exposing only area, or splitting interfaces into readable and writable capabilities so each type promises only what it can honour.',
    explanation:
      'Liskov is about behavioural contracts, not just method signatures. A subtype must accept at least what the parent accepts and guarantee at least what the parent guarantees.',
    tips: ['Explain the broken expectation in terms of the caller\'s code.', 'Offer a design fix, not just the diagnosis.'],
    commonMistakes: ['Thinking compilation success means substitutability.', 'Fixing the problem with instanceof checks in calling code.'],
    followUpQuestions: ['How do preconditions and postconditions relate to Liskov?', 'Is Java\'s unmodifiable list a violation?'],
  },
  'sw-014': {
    question: 'How would you design a domain model so that invalid states are impossible to represent?',
    intent: 'The interviewer wants to see advanced modelling skills: using types and encapsulation to enforce business rules.',
    expectedAnswer:
      'I would push validation into the types themselves. Instead of passing raw strings and numbers, I would create small value objects such as EmailAddress or Money that validate on creation and are immutable, so an invalid instance can never exist. Entities would expose behaviour methods, such as order.ship(), rather than public setters, and these methods would check transitions: an order cannot be shipped before it is paid. For states with different data, I would use a closed set of types, for example sealed interfaces or tagged unions where a PaidOrder carries a payment reference and a DraftOrder does not. Factories or constructors would enforce required fields. The result is that most rules are checked once, at the boundary, and the rest of the code can trust the objects it receives.',
    explanation:
      'Making illegal states unrepresentable reduces defensive checks spread through the code and turns many runtime bugs into compile-time errors. It combines encapsulation, immutability and expressive types.',
    example: 'sealed interface Order permits Draft, Paid, Shipped {} // Shipped has a trackingNumber; Draft cannot be shipped because it has no ship() method.',
    tips: ['Mention value objects and controlled state transitions.', 'Show how the type system helps.', 'Explain where validation happens.'],
    commonMistakes: ['Relying on public setters and scattered if checks.', 'Creating so many types that simple changes become expensive.'],
    followUpQuestions: ['How do you handle validation errors from user input?', 'How does this approach interact with ORMs?'],
  },
  'sw-015': {
    question: 'What is the difference between an array and a linked list?',
    intent: 'The interviewer checks your understanding of memory layout and the cost of common operations.',
    expectedAnswer:
      'An array stores elements contiguously in memory, so accessing an element by index takes constant time, O(1), and iteration is cache-friendly. Inserting or removing in the middle is O(n) because elements must be shifted. A linked list stores nodes that point to the next node, so insertion or removal at a known node is O(1), but finding an element by index is O(n) and nodes are scattered in memory, which hurts cache performance. In practice, dynamic arrays such as ArrayList or JavaScript arrays are the right default for most uses.',
    explanation:
      'Big-O alone does not tell the whole story: memory locality often makes arrays faster even for operations where linked lists look better on paper.',
    tips: ['Compare access, insertion and memory use.', 'Mention that dynamic arrays are the common default.'],
    commonMistakes: ['Saying linked lists are always faster for insertion without considering the search to find the position.'],
    followUpQuestions: ['How does a dynamic array grow?', 'When would you really use a linked list?'],
  },
  'sw-016': {
    question: 'What is a hash table and how does it work?',
    intent: 'The interviewer wants to see whether you understand one of the most used data structures and its performance characteristics.',
    expectedAnswer:
      'A hash table stores key-value pairs. A hash function converts the key into a number that determines a bucket in an internal array. To look up a key, the table computes its hash and goes directly to the bucket, so average lookup, insertion and deletion are O(1). Two keys can land in the same bucket, a collision, which is handled by chaining entries in a list or by probing for another slot. When the table becomes too full, it resizes and redistributes entries. Performance degrades if many keys collide, so a good hash function and correct equality are essential.',
    explanation:
      'Hash tables power maps, sets, caches and indexes. Understanding collisions and resizing explains their average and worst-case behaviour.',
    tips: ['Explain hashing, buckets and collisions.', 'Mention resizing and the load factor.'],
    commonMistakes: ['Saying lookups are always O(1) with no exceptions.', 'Forgetting that keys must have consistent hash and equality.'],
    followUpQuestions: ['What happens if you mutate a key after inserting it?', 'Why must equal objects have equal hash codes?'],
  },
  'sw-017': {
    question: 'When would you use a stack, a queue or a priority queue?',
    intent: 'The interviewer checks that you can choose the right structure for a problem and explain why.',
    expectedAnswer:
      'A stack is last-in, first-out: useful for undo history, parsing nested expressions, depth-first traversal and tracking function calls. A queue is first-in, first-out: useful for processing tasks in arrival order, breadth-first search and buffering messages between a producer and a consumer. A priority queue always returns the element with the highest priority, usually implemented with a binary heap that gives O(log n) insertion and removal: useful for scheduling jobs by urgency, Dijkstra\'s shortest path algorithm or keeping the top k elements of a stream.',
    explanation:
      'Choosing a structure based on the order in which elements must be processed is a basic but very common interview skill.',
    tips: ['Give at least one real use case for each.', 'Mention the heap as the usual priority queue implementation.'],
    commonMistakes: ['Implementing a priority queue with a sorted list without discussing the cost.'],
    followUpQuestions: ['How would you implement a queue using two stacks?', 'How do you find the k largest elements in a stream?'],
  },
  'sw-018': {
    question: 'What is a binary search tree, and why can it become slow?',
    intent: 'The interviewer wants to see whether you understand tree structures and the importance of balance.',
    expectedAnswer:
      'A binary search tree is a tree where each node has at most two children, with all values in the left subtree smaller than the node and all values in the right subtree larger. This ordering allows search, insertion and deletion in O(log n) when the tree is balanced, because each step halves the remaining nodes. But if values are inserted in sorted order, the tree degenerates into a chain, and operations become O(n). Self-balancing trees such as red-black trees or AVL trees fix this by rotating nodes to keep the height logarithmic; Java\'s TreeMap uses a red-black tree.',
    explanation:
      'The key idea is that performance depends on height. Balancing guarantees logarithmic height and therefore predictable performance.',
    tips: ['Explain the ordering property.', 'Mention the sorted-insertion worst case and balanced trees.'],
    commonMistakes: ['Saying BST operations are always O(log n).'],
    followUpQuestions: ['How do you traverse a BST in sorted order?', 'When would you use a tree map instead of a hash map?'],
  },
  'sw-019': {
    question: 'What is a graph, and how would you represent one in code?',
    intent: 'The interviewer checks that you can model relationships and choose a representation based on the operations needed.',
    expectedAnswer:
      'A graph is a set of nodes connected by edges, which can be directed or undirected and weighted or not. It models networks, dependencies, routes or social connections. The two main representations are an adjacency list, where each node stores a list of its neighbours, and an adjacency matrix, a two-dimensional array where cell [i][j] indicates an edge. Adjacency lists use memory proportional to nodes plus edges and suit sparse graphs, which are most real graphs. Matrices use O(n²) memory but answer "is there an edge between i and j" in constant time, which suits small or dense graphs.',
    explanation:
      'Choosing the representation depends on graph density and on the operations you need most, such as iterating neighbours or checking edges.',
    tips: ['Give a real-world example of a graph.', 'Compare memory and operation costs of both representations.'],
    commonMistakes: ['Using a matrix for a huge sparse graph.'],
    followUpQuestions: ['How do you detect a cycle in a directed graph?', 'How would you find the shortest path between two nodes?'],
  },
  'sw-020': {
    question: 'How would you design an LRU cache with O(1) get and put operations?',
    intent: 'The interviewer evaluates your ability to combine data structures to meet precise performance requirements.',
    expectedAnswer:
      'I would combine a hash map with a doubly linked list. The map stores each key with a pointer to its node in the list, giving O(1) lookup. The list keeps entries ordered by recent use: the most recently used at the head, the least recently used at the tail. On get, I find the node through the map, move it to the head and return the value. On put, if the key exists I update the value and move it to the head; otherwise I create a node at the head and add it to the map, and if the capacity is exceeded I remove the tail node and delete its key from the map. All operations are O(1) because moving or removing a node in a doubly linked list only changes a few pointers. In Java, LinkedHashMap with access order and removeEldestEntry provides this behaviour out of the box. For concurrent use I would add locking or use a dedicated cache library.',
    explanation:
      'This classic question tests composition of structures: the map provides fast lookup, the list provides fast ordering updates. Mentioning existing implementations and thread safety shows production awareness.',
    tips: ['Explain why each structure is needed.', 'Walk through get and put step by step.', 'Mention thread safety and existing libraries.'],
    commonMistakes: ['Using a singly linked list, which makes removal O(n).', 'Forgetting to remove the key from the map on eviction.'],
    followUpQuestions: ['How would you make it thread-safe?', 'How would you add time-based expiration?'],
  },
  'sw-021': {
    question: 'What are tries and Bloom filters, and when would you use them?',
    intent: 'The interviewer checks advanced knowledge of specialised structures and their trade-offs.',
    expectedAnswer:
      'A trie is a tree where each edge represents a character, so words sharing a prefix share a path. Looking up a word or listing all words with a given prefix takes time proportional to the word length, not to the number of words, which makes tries useful for autocomplete, spell checking and routing tables. Their cost is memory, which compressed tries reduce. A Bloom filter is a compact probabilistic set: it uses several hash functions to set bits in a bit array. It can say "definitely not present" or "possibly present"; false positives are possible but false negatives are not, and elements cannot normally be removed. It is useful to avoid expensive lookups, for example checking whether a key might exist before reading from disk, as databases like Cassandra do, or filtering already seen URLs in a crawler.',
    explanation:
      'Both structures trade generality for efficiency in a specific use case: prefix queries for tries, memory-efficient membership tests for Bloom filters.',
    tips: ['Explain the false-positive property of Bloom filters precisely.', 'Give a real system that uses each structure.'],
    commonMistakes: ['Saying a Bloom filter can produce false negatives.', 'Ignoring the memory cost of tries.'],
    followUpQuestions: ['How do you choose the size of a Bloom filter?', 'How would you implement autocomplete ranked by popularity?'],
  },
  'sw-022': {
    question: 'What does Big O notation describe?',
    intent: 'The interviewer checks that you can reason about how algorithms scale with input size.',
    expectedAnswer:
      'Big O describes how the running time or memory use of an algorithm grows as the input size grows, focusing on the dominant term and ignoring constants. O(1) means constant time, such as accessing an array element by index. O(log n) grows very slowly, like binary search. O(n) is linear, like scanning a list once. O(n log n) is typical of efficient sorting, and O(n²) appears with nested loops over the same data. It usually describes the worst case, although we also talk about average case, for example for hash tables.',
    explanation:
      'Big O helps compare approaches before writing code and explains why an algorithm that works on a hundred items can fail on a million.',
    example: 'Checking for duplicates with two nested loops is O(n²); adding items to a HashSet and checking membership is O(n) on average.',
    tips: ['Give an example for each common complexity.', 'Mention that constants matter in practice for small inputs.'],
    commonMistakes: ['Thinking Big O gives the exact running time.', 'Forgetting space complexity.'],
    followUpQuestions: ['What is the complexity of binary search and why?', 'Can an O(n²) algorithm be faster than an O(n log n) one?'],
  },
  'sw-023': {
    question: 'How does binary search work, and what does it require?',
    intent: 'The interviewer wants to see a precise understanding of a fundamental algorithm, including its edge cases.',
    expectedAnswer:
      'Binary search finds a value in a sorted collection by repeatedly comparing the target with the middle element. If the target is smaller, the search continues in the left half; if larger, in the right half. Each step halves the search space, so it runs in O(log n): about 20 steps for a million elements. It requires the data to be sorted and to support random access by index. Common pitfalls are off-by-one errors in the loop bounds and computing the middle as (low + high) / 2, which can overflow in some languages; low + (high - low) / 2 avoids that.',
    explanation:
      'Binary search is simple to describe but easy to get wrong. Mentioning the edge cases shows that you have actually implemented it.',
    example: 'while (low <= high) { int mid = low + (high - low) / 2; if (a[mid] == t) return mid; if (a[mid] < t) low = mid + 1; else high = mid - 1; }',
    tips: ['State the sorted requirement first.', 'Mention one edge case such as overflow or empty arrays.'],
    commonMistakes: ['Applying binary search to unsorted data.', 'Infinite loops caused by wrong bounds updates.'],
    followUpQuestions: ['How would you find the first occurrence of a duplicate value?', 'Can you binary search on a linked list efficiently?'],
  },
  'sw-024': {
    question: 'Compare quicksort and merge sort.',
    intent: 'The interviewer checks your understanding of classic sorting algorithms, their complexity and practical trade-offs.',
    expectedAnswer:
      'Both use divide and conquer and run in O(n log n) on average. Merge sort splits the array in half, sorts each half recursively and merges them; it is always O(n log n), it is stable, meaning equal elements keep their order, but it needs O(n) extra memory for arrays. Quicksort picks a pivot, partitions elements smaller and larger than the pivot and sorts each side; it sorts in place with little extra memory and is very fast in practice thanks to cache locality, but its worst case is O(n²) when pivots are badly chosen, which randomised or median-of-three pivots make unlikely. It is not stable. Real libraries use hybrids: Java sorts objects with TimSort, a stable merge-based algorithm, and primitives with a dual-pivot quicksort.',
    explanation:
      'The comparison shows trade-offs between guaranteed performance, stability and memory. Knowing what standard libraries actually use demonstrates practical knowledge.',
    tips: ['Compare worst case, memory and stability.', 'Mention what your language\'s standard library uses.'],
    commonMistakes: ['Saying quicksort is always O(n log n).', 'Forgetting stability as a criterion.'],
    followUpQuestions: ['Why does stability matter when sorting by several fields?', 'How would you sort data that does not fit in memory?'],
  },
  'sw-025': {
    question: 'What is the difference between breadth-first search and depth-first search?',
    intent: 'The interviewer checks your graph traversal knowledge and when to choose each approach.',
    expectedAnswer:
      'Breadth-first search explores a graph level by level from the starting node, using a queue: it first visits all direct neighbours, then their neighbours, and so on. In an unweighted graph it finds the shortest path in number of edges. Depth-first search goes as deep as possible along one branch before backtracking, using a stack or recursion. It is useful for detecting cycles, topological sorting and exploring all possible paths, such as in puzzles. Both run in O(V + E) time with an adjacency list. BFS may use more memory on wide graphs because it stores a whole level, while DFS can hit recursion limits on very deep graphs. Both need a visited set to avoid infinite loops in graphs with cycles.',
    explanation:
      'Choosing between BFS and DFS depends on what you need: shortest paths and nearest results favour BFS, while exhaustive exploration and dependency ordering favour DFS.',
    tips: ['Mention the data structure behind each.', 'Give one use case where each is clearly better.'],
    commonMistakes: ['Forgetting the visited set.', 'Using BFS for shortest paths in weighted graphs.'],
    followUpQuestions: ['How would you find the shortest path in a weighted graph?', 'How do you implement DFS without recursion?'],
  },
};
