import type { QuestionText, TextTable } from '@/types/content';

/** Frontend questions 001-025: JavaScript, TypeScript, React. */
export const enA: TextTable<QuestionText> = {
  'fe-001': {
    question: 'What is the difference between var, let and const in JavaScript?',
    intent: 'The interviewer checks basic knowledge of scoping and why modern code avoids var.',
    expectedAnswer:
      'var is function-scoped and hoisted: it is available in the whole function and initialised to undefined before its declaration, which causes surprising bugs, for example in loops with callbacks. let and const are block-scoped, so they exist only inside the nearest { } block, and accessing them before their declaration throws an error because of the temporal dead zone. const prevents reassignment of the variable, but it does not make the value immutable: you can still push into a const array. Modern code uses const by default and let when reassignment is needed.',
    explanation:
      'Block scoping makes variable lifetimes predictable. Knowing that const is about the binding, not the value, avoids a frequent misconception.',
    example: 'const items = [];\nitems.push(1); // allowed\nitems = [2];   // TypeError: assignment to constant variable',
    tips: ['Mention block scope and the temporal dead zone.', 'Say that const does not freeze objects.'],
    commonMistakes: ['Saying const values are immutable.', 'Using var in new code.'],
    followUpQuestions: ['What is hoisting?', 'How would you make an object truly immutable?'],
  },
  'fe-002': {
    question: 'What is the difference between == and === in JavaScript?',
    intent: 'The interviewer checks understanding of type coercion, a common source of bugs.',
    expectedAnswer:
      '=== is strict equality: it returns true only if both values have the same type and value, without conversion. == is loose equality: it converts operands to a common type before comparing, which gives surprising results such as 0 == "" being true, "1" == 1 being true and null == undefined being true. Most style guides recommend always using ===. A common exception is value == null, which checks for both null and undefined in one expression. For objects, both operators compare references, not contents.',
    explanation:
      'Implicit coercion rules are complex, so strict equality makes code more predictable and easier to read.',
    tips: ['Give one or two surprising coercion examples.', 'Mention that objects are compared by reference.'],
    commonMistakes: ['Thinking === compares object contents.', 'Using == by habit.'],
    followUpQuestions: ['How would you compare two objects by value?', 'What does Object.is() do differently from ===?'],
  },
  'fe-003': {
    question: 'What is the difference between null and undefined, and what are falsy values?',
    intent: 'The interviewer checks fundamentals that affect conditions and default values in everyday code.',
    expectedAnswer:
      'undefined means a value has not been assigned: an uninitialised variable, a missing property or a function without a return. null is an explicit "no value" set by the developer. The falsy values are false, 0, -0, 0n, "", null, undefined and NaN; everything else, including "0", [] and {}, is truthy. This matters for defaults: count || 10 replaces 0 with 10, which may be wrong, while count ?? 10 only replaces null or undefined. Optional chaining, user?.address?.city, avoids errors when a property in the chain is null or undefined.',
    explanation:
      'Understanding falsy values explains why || can silently override valid values like 0 or an empty string, and why ?? exists.',
    tips: ['List the falsy values.', 'Contrast || and ??.'],
    commonMistakes: ['Using || for defaults when 0 or "" are valid values.', 'Thinking an empty array is falsy.'],
    followUpQuestions: ['What does typeof null return?', 'How does optional chaining work with function calls?'],
  },
  'fe-004': {
    question: 'What is a closure, and where are closures used in practice?',
    intent: 'The interviewer checks understanding of a core JavaScript concept that explains many behaviours, including React hooks.',
    expectedAnswer:
      'A closure is a function together with the variables from the scope where it was created. The inner function keeps access to those variables even after the outer function has returned. Closures are used to keep private state, as in a counter factory where count is not accessible from outside; in callbacks and event handlers that remember values from their creation context; in function factories and partial application; and in React, where every render creates new handler functions that capture that render\'s props and state. A classic pitfall was var in a loop with setTimeout: all callbacks shared the same variable, which let solves by creating a new binding per iteration.',
    explanation:
      'Closures are how JavaScript functions carry context. They explain stale values in React effects as well as private state patterns.',
    example: 'function makeCounter() { let count = 0; return () => ++count; }\nconst next = makeCounter(); next(); next(); // 2',
    tips: ['Give a simple code example.', 'Connect closures to React hooks or callbacks.'],
    commonMistakes: ['Defining closures as "functions inside functions" without mentioning captured variables.'],
    followUpQuestions: ['What is a stale closure in React?', 'Can closures cause memory leaks?'],
  },
  'fe-005': {
    question: 'How is the value of this determined in JavaScript?',
    intent: 'The interviewer checks understanding of a confusing area that affects callbacks and class methods.',
    expectedAnswer:
      'For regular functions, this depends on how the function is called, not where it is defined. Called as a method, obj.method(), this is obj. Called as a plain function, this is undefined in strict mode and in modules. With new, this is the newly created object. call, apply and bind set this explicitly. Arrow functions have no own this: they use the this of the surrounding scope at creation time. That is why passing a class method as a callback, such as button.addEventListener("click", this.handle), loses this unless you bind it or define the method as an arrow function property.',
    explanation:
      'The call-site rule explains most "this is undefined" errors. Arrow functions are the usual modern solution for callbacks.',
    tips: ['State that the call site determines this.', 'Explain why arrow functions behave differently.'],
    commonMistakes: ['Using an arrow function as an object method that needs its own this.', 'Thinking this refers to the function itself.'],
    followUpQuestions: ['What does bind return?', 'Why did React class components need binding?'],
  },
  'fe-006': {
    question: 'Explain the JavaScript event loop, including microtasks and macrotasks.',
    intent: 'The interviewer checks whether you understand how asynchronous code is scheduled, which explains ordering bugs.',
    expectedAnswer:
      'JavaScript runs on a single main thread with a call stack. When the stack is empty, the event loop picks work from queues. Macrotasks, also called tasks, include timers from setTimeout, I/O and user events. Microtasks include promise callbacks, await continuations and queueMicrotask. After each macrotask, the engine runs all pending microtasks before rendering and before the next macrotask. So in console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); console.log(4); the output is 1, 4, 3, 2. Long synchronous work blocks everything, including rendering and user input, which is why heavy computation should be split up or moved to a Web Worker.',
    explanation:
      'Knowing that microtasks run before the next task explains execution order and why a flood of microtasks can freeze the page.',
    tips: ['Use a short ordering example.', 'Mention that blocking the stack freezes the UI.'],
    commonMistakes: ['Thinking setTimeout(fn, 0) runs immediately.', 'Believing promises run on another thread.'],
    followUpQuestions: ['Where does requestAnimationFrame fit?', 'How does the Node.js event loop differ?'],
  },
  'fe-007': {
    question: 'How do you handle errors with promises and async/await?',
    intent: 'The interviewer checks robust asynchronous code, including concurrent operations and unhandled rejections.',
    expectedAnswer:
      'With async/await, I wrap awaited calls in try/catch, and use finally for clean-up such as hiding a loader. With promise chains, a .catch() at the end handles errors from any previous step. An unhandled rejection is a bug: it may be logged or crash a Node process, so every promise should be awaited or have a catch. For several independent operations, Promise.all runs them concurrently but rejects as soon as one fails, while Promise.allSettled waits for all and reports each result, which suits partial failures. Promise.race and Promise.any help with timeouts and fallbacks. For network calls, I also handle non-2xx responses explicitly, because fetch only rejects on network errors, not on HTTP 404 or 500.',
    explanation:
      'Good async error handling covers both individual calls and groups of calls, and knows the fetch-specific trap about HTTP errors.',
    example: 'const res = await fetch(url);\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst data = await res.json();',
    tips: ['Contrast Promise.all and Promise.allSettled.', 'Mention that fetch does not reject on HTTP errors.'],
    commonMistakes: ['Forgetting to await a promise inside try/catch.', 'Awaiting independent calls one after another when they could run concurrently.'],
    followUpQuestions: ['How would you add a timeout to fetch?', 'How do you cancel a request with AbortController?'],
  },
  'fe-008': {
    question: 'How does prototypal inheritance work, and how do ES classes relate to it?',
    intent: 'The interviewer assesses deep understanding of the JavaScript object model behind modern syntax.',
    expectedAnswer:
      'Every object has an internal link to another object, its prototype. When you read a property that the object does not have, JavaScript looks it up along the prototype chain until it finds it or reaches null. Methods defined on a constructor\'s prototype are shared by all instances, which saves memory. ES2015 classes are mostly syntax over this mechanism: class Dog extends Animal sets Dog.prototype to inherit from Animal.prototype, methods go on the prototype, and super calls the parent implementation. Classes add real differences, though: they always run in strict mode, cannot be called without new, and support private fields with # that are truly inaccessible from outside, unlike conventions with underscores. Object.create(proto) creates an object with a chosen prototype directly. Understanding this explains why instanceof checks the prototype chain and why modifying a built-in prototype affects every object, which is a bad practice.',
    explanation:
      'Classes did not replace prototypes; they made them easier to use. Advanced candidates know both the mechanism and the class-specific additions.',
    tips: ['Explain property lookup along the chain.', 'Show what class syntax adds beyond sugar.', 'Mention private fields.'],
    commonMistakes: ['Saying JavaScript classes work like Java classes.', 'Extending built-in prototypes in application code.'],
    followUpQuestions: ['What does Object.getPrototypeOf return for a class instance?', 'How do private fields differ from closures for privacy?'],
  },
  'fe-009': {
    question: 'What is the difference between ES modules and CommonJS, and why does it matter for bundling?',
    intent: 'The interviewer checks modern tooling knowledge: module systems, tree shaking and interoperability.',
    expectedAnswer:
      'CommonJS, the historical Node.js system, uses require() and module.exports. It is dynamic: require can run anywhere, even conditionally, and exports are resolved at runtime, loaded synchronously. ES modules use import and export. Their structure is static: imports are declared at the top level and analysed before execution, bindings are live, and loading can be asynchronous; dynamic import() returns a promise for code splitting. Because the import graph is known statically, bundlers such as Vite, webpack or esbuild can perform tree shaking, removing exports that are never used, which is much harder with CommonJS. That is why libraries publish ES module builds and mark themselves side-effect free in package.json. Interoperability can be tricky: importing CommonJS from ESM gives a default export, and dual packages must avoid loading two copies of the same library, which can break singletons or instanceof checks.',
    explanation:
      'The static nature of ES modules enables tree shaking and better tooling. Advanced candidates also know the interoperability pitfalls.',
    tips: ['Contrast static and dynamic resolution.', 'Explain tree shaking and the sideEffects flag.', 'Mention dynamic import for code splitting.'],
    commonMistakes: ['Thinking tree shaking works automatically with any import style.', 'Importing a whole utility library for one function.'],
    followUpQuestions: ['What does "type": "module" change in Node.js?', 'How do you split a large bundle by route?'],
  },
  'fe-010': {
    question: 'What does TypeScript add to JavaScript, and what is the difference between any and unknown?',
    intent: 'The interviewer checks basic TypeScript understanding and type safety habits.',
    expectedAnswer:
      'TypeScript adds a static type system on top of JavaScript: types are checked at compile time and erased at runtime, so the output is plain JavaScript. It catches errors such as typos, missing properties or wrong arguments before the code runs, and improves editor autocompletion and refactoring. any disables type checking for a value: you can do anything with it, which defeats the purpose. unknown also accepts any value, but you must narrow it, for example with typeof or a validation function, before using it. unknown is the safe choice for data from external sources such as JSON.parse or API responses.',
    explanation:
      'Types exist only at compile time. Choosing unknown over any keeps type safety where data is not yet trusted.',
    tips: ['Mention that types are erased at runtime.', 'Explain why unknown is safer than any.'],
    commonMistakes: ['Using any to silence errors.', 'Believing TypeScript validates data at runtime.'],
    followUpQuestions: ['What is the never type used for?', 'How do you validate API data at runtime?'],
  },
  'fe-011': {
    question: 'What is the difference between an interface and a type alias in TypeScript?',
    intent: 'The interviewer checks practical knowledge of TypeScript declarations and team conventions.',
    expectedAnswer:
      'Both can describe object shapes and are mostly interchangeable for that. Interfaces can be extended with extends and can be merged: declaring the same interface twice adds properties, which is useful to augment library types. Type aliases are more flexible: they can name unions such as "small" | "large", tuples, primitives, function types, and they work with mapped and conditional types. A common convention is to use interfaces for public object shapes and types for unions and computed types, but consistency within a codebase matters more than the choice.',
    explanation:
      'The real differences are declaration merging and the expressive power of type aliases. Teams usually pick a convention.',
    tips: ['Mention declaration merging and unions.', 'Say consistency matters more than the choice.'],
    commonMistakes: ['Claiming one is always better.'],
    followUpQuestions: ['When is declaration merging useful?', 'How do you extend a type alias?'],
  },
  'fe-012': {
    question: 'What are generics in TypeScript? Give an example.',
    intent: 'The interviewer checks whether you can write reusable, type-safe functions and components.',
    expectedAnswer:
      'Generics let you write code that works with many types while preserving the relationship between them. Instead of returning any, a function like function first<T>(items: T[]): T | undefined returns the same type as the elements of the array: first([1, 2]) is a number, first(["a"]) is a string. Constraints limit what types are accepted, for example <T extends { id: string }> ensures T has an id. Generics are used in collections, API helpers such as fetchJson<T>(url): Promise<T>, React components such as a List<T> with a renderItem prop, and utility types.',
    explanation:
      'Generics give reusability without losing type information. Constraints make them safe when the code needs certain properties.',
    example: 'function byId<T extends { id: string }>(items: T[]): Map<string, T> {\n  return new Map(items.map((i) => [i.id, i]));\n}',
    tips: ['Show a function with a constraint.', 'Mention a generic React component or API helper.'],
    commonMistakes: ['Using any instead of a type parameter.', 'Adding generics that are used only once and add no safety.'],
    followUpQuestions: ['What is a default type parameter?', 'Why is fetchJson<T>() not really type-safe without validation?'],
  },
  'fe-013': {
    question: 'What are discriminated unions and type narrowing in TypeScript?',
    intent: 'The interviewer checks modelling skills that prevent invalid states in frontend code.',
    expectedAnswer:
      'A discriminated union is a union of object types that share a literal property, the discriminant. For example, type RequestState = { status: "loading" } | { status: "success"; data: User[] } | { status: "error"; message: string }. Narrowing means TypeScript refines the type after a check: inside if (state.status === "success"), it knows state.data exists. Narrowing also works with typeof, instanceof, the in operator and custom type guards. With a switch on the discriminant and a default branch assigning the value to never, the compiler warns if a new case is added and not handled. This avoids impossible combinations such as having both data and an error.',
    explanation:
      'Discriminated unions model states explicitly and let the compiler enforce correct handling, which is especially useful for UI state.',
    example: 'switch (state.status) {\n  case "loading": return <Spinner />;\n  case "error": return <Error msg={state.message} />;\n  case "success": return <UserList users={state.data} />;\n}',
    tips: ['Model a loading/success/error state.', 'Mention exhaustiveness with never.'],
    commonMistakes: ['Using several optional booleans such as isLoading and hasError that can contradict each other.'],
    followUpQuestions: ['How do you write a custom type guard?', 'What does the satisfies operator do?'],
  },
  'fe-014': {
    question: 'Which TypeScript utility types do you use most, and why?',
    intent: 'The interviewer checks practical fluency with built-in type tools that reduce duplication.',
    expectedAnswer:
      'Partial<T> makes all properties optional, useful for update payloads. Required<T> does the opposite. Pick<T, K> and Omit<T, K> create types with a subset of properties, for example Omit<User, "password"> for a public profile. Readonly<T> prevents reassignment of properties. Record<K, V> types dictionaries such as Record<Locale, string>. ReturnType<typeof fn> and Parameters<typeof fn> extract types from functions, and Awaited<T> unwraps promises. NonNullable<T> removes null and undefined. They let you derive types from a single source of truth instead of duplicating definitions that can drift apart.',
    explanation:
      'Utility types keep related types consistent. Deriving types reduces maintenance and errors when models change.',
    tips: ['Give a concrete use for each type you mention.', 'Emphasise single source of truth.'],
    commonMistakes: ['Copying interfaces manually instead of deriving them.', 'Using Partial where only some fields should be optional.'],
    followUpQuestions: ['How is Pick implemented with mapped types?', 'How would you make nested properties readonly?'],
  },
  'fe-015': {
    question: 'Explain mapped types, conditional types and the infer keyword.',
    intent: 'The interviewer assesses advanced TypeScript knowledge used in libraries and shared utilities.',
    expectedAnswer:
      'A mapped type creates a new type by iterating over the keys of another: { [K in keyof T]?: T[K] } is how Partial works. Modifiers like readonly and ? can be added or removed with + and -, and key remapping with as can rename keys, for example producing getter names like getName from name. A conditional type chooses a type based on a condition: T extends string ? "text" : "other". Conditional types distribute over unions, so applying one to A | B applies it to each member, which is how Exclude and Extract work. infer declares a type variable inside a conditional type to capture part of a type: type ElementType<T> = T extends (infer U)[] ? U : never extracts the element type of an array, and ReturnType uses infer to capture a function\'s return type. These tools let you write types that follow your data automatically, but they should be used with restraint because complex types slow down compilation and are hard for teammates to read.',
    explanation:
      'Mapped and conditional types are the building blocks of the standard utility types. Advanced candidates also know about distribution and readability costs.',
    example: 'type Getters<T> = { [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K] };',
    tips: ['Show how a standard utility type is built.', 'Mention distributive conditional types.', 'Warn about complexity.'],
    commonMistakes: ['Writing clever types nobody else can maintain.', 'Being surprised by distribution over unions.'],
    followUpQuestions: ['How do you prevent a conditional type from distributing?', 'How would you type a deep partial?'],
  },
  'fe-016': {
    question: 'How do you keep types safe at the boundaries of a frontend application, such as API responses?',
    intent: 'The interviewer checks advanced understanding of the gap between compile-time types and runtime data.',
    expectedAnswer:
      'TypeScript types disappear at runtime, so declaring const user: User = await res.json() is only a promise to the compiler: if the API changes or returns an error object, the code will crash somewhere far from the cause. At boundaries such as API responses, local storage, URL parameters and form input, I validate data at runtime with a schema library such as zod or valibot, and derive the static type from the schema with z.infer, so there is one source of truth. Invalid data is handled at the boundary with a clear error and logging. When I control the back end, I prefer generating types and clients from an OpenAPI specification, or sharing schemas in a monorepo, and I still validate critical inputs. I also keep the domain model separate from transport types, mapping API DTOs to UI models in one place, so backend changes do not ripple through every component.',
    explanation:
      'Runtime validation at boundaries turns silent corruption into explicit, local errors. Deriving types from schemas or contracts avoids drift.',
    example: 'const User = z.object({ id: z.string(), email: z.string().email() });\ntype User = z.infer<typeof User>;\nconst user = User.parse(await res.json());',
    tips: ['Explain type erasure clearly.', 'Mention schema-derived types.', 'Talk about generated clients from OpenAPI.'],
    commonMistakes: ['Casting API responses with as.', 'Validating everywhere instead of once at the boundary.'],
    followUpQuestions: ['What is the cost of runtime validation on large payloads?', 'How do you handle API versions in the client?'],
  },
  'fe-017': {
    question: 'In React, what is the difference between props and state?',
    intent: 'The interviewer checks the most basic React mental model.',
    expectedAnswer:
      'Props are inputs passed to a component by its parent; the component must treat them as read-only. State is data owned and managed by the component itself, created with useState or useReducer, and updating it with the setter causes the component to re-render. When several components need the same data, the state is lifted up to their closest common parent and passed down as props, along with callbacks to change it. The UI is a function of props and state: you do not modify the DOM directly, you update state and React updates the screen.',
    explanation:
      'Understanding ownership of data, who can change it and how changes flow down, is the foundation of every React design.',
    tips: ['Mention lifting state up.', 'Stress that props are read-only.'],
    commonMistakes: ['Mutating props or state objects directly.', 'Copying props into state without a reason.'],
    followUpQuestions: ['When would you use useReducer instead of useState?', 'What is derived state?'],
  },
  'fe-018': {
    question: 'Why does React need a key when rendering lists?',
    intent: 'The interviewer checks understanding of reconciliation in a common situation that causes real bugs.',
    expectedAnswer:
      'When a list re-renders, React uses keys to match items from the previous render with items in the new one. With stable, unique keys, such as an id from the data, React can move, add or remove the right elements and keep each item\'s state and DOM nodes. If you use the array index as a key and the list is reordered, filtered or has items inserted, React matches items by position: state such as the text in an input or a checkbox can end up on the wrong row, and rendering is less efficient. Index keys are acceptable only for static lists that never change order.',
    explanation:
      'Keys give items an identity across renders. Wrong keys cause subtle state bugs, not just warnings.',
    tips: ['Explain what goes wrong with index keys.', 'Use a stable ID from the data.'],
    commonMistakes: ['Using Math.random() as a key, which remounts items on every render.'],
    followUpQuestions: ['How can you use a key to reset a component\'s state?', 'What is reconciliation?'],
  },
  'fe-019': {
    question: 'How does useEffect work, and when do you need a cleanup function?',
    intent: 'The interviewer checks correct use of effects, one of the most misused React APIs.',
    expectedAnswer:
      'useEffect runs a function after React has committed the render to the screen. The dependency array controls when it runs again: after every render without an array, once after mount with an empty array, or when one of the listed values changes. Every value from the component used inside the effect should be in the dependencies, which the eslint hooks rule checks. The cleanup function, returned from the effect, runs before the effect runs again and when the component unmounts. It is needed to remove event listeners, clear timers, close subscriptions or cancel requests with AbortController, so that outdated effects do not update state. In development, Strict Mode runs effects twice to reveal missing cleanups. Effects are for synchronising with external systems; computing values from props or state should happen during rendering instead.',
    explanation:
      'Thinking of effects as synchronisation with external systems, not as lifecycle methods, avoids most misuse.',
    example: 'useEffect(() => {\n  const controller = new AbortController();\n  load(id, controller.signal).then(setData);\n  return () => controller.abort();\n}, [id]);',
    tips: ['Explain the dependency array options.', 'Give a cleanup example.', 'Mention that derived values do not need effects.'],
    commonMistakes: ['Omitting dependencies to avoid re-runs.', 'Using effects to compute derived state.'],
    followUpQuestions: ['Why does Strict Mode run effects twice?', 'What is a race condition in data fetching effects?'],
  },
  'fe-020': {
    question: 'Why does a state value sometimes appear not to update right after calling setState?',
    intent: 'The interviewer checks understanding of render snapshots, batching and stale closures.',
    expectedAnswer:
      'Calling the setter does not change the variable in the current render; it schedules a re-render, and the new value is available in the next render. Each render has its own snapshot of props and state, captured by the functions created during that render. So setCount(count + 1) called twice in the same handler only increments by one, because both calls read the same snapshot. Using the updater form, setCount(c => c + 1), uses the latest pending value. React 18 also batches updates from event handlers, timeouts and promises into a single render. Stale closures happen when an effect or interval keeps an old function that captured old state; fixes are the updater form, correct dependencies or a ref for values that should not trigger renders.',
    explanation:
      'The snapshot model explains many confusing behaviours. The updater form is the standard fix when new state depends on previous state.',
    example: 'setCount(c => c + 1);\nsetCount(c => c + 1); // +2 as expected',
    tips: ['Explain render snapshots.', 'Use the updater function example.', 'Mention batching in React 18.'],
    commonMistakes: ['Reading state right after setting it and expecting the new value.'],
    followUpQuestions: ['When would you use useRef instead of state?', 'What is automatic batching?'],
  },
  'fe-021': {
    question: 'What is the difference between controlled and uncontrolled components in forms?',
    intent: 'The interviewer checks knowledge of form handling patterns and their trade-offs.',
    expectedAnswer:
      'In a controlled component, the input value comes from React state and changes go through onChange: value={name} onChange={e => setName(e.target.value)}. React is the single source of truth, which makes validation, formatting and conditional logic easy, but every keystroke re-renders the component. In an uncontrolled component, the DOM keeps the value and you read it when needed with a ref or from the form data on submit, using defaultValue for the initial value. It is simpler and can perform better for large forms. Libraries such as React Hook Form mostly use uncontrolled inputs with refs for performance while still offering validation.',
    explanation:
      'Both approaches are valid. The choice depends on how much the UI needs to react to each change.',
    tips: ['Show both patterns briefly.', 'Mention form libraries and performance.'],
    commonMistakes: ['Switching an input between controlled and uncontrolled, which triggers a warning.', 'Setting value without onChange.'],
    followUpQuestions: ['How would you validate a form with many fields?', 'How do React 19 form actions change form handling?'],
  },
  'fe-022': {
    question: 'What is a custom hook, and when should you create one?',
    intent: 'The interviewer checks reuse of stateful logic and clean component design.',
    expectedAnswer:
      'A custom hook is a function whose name starts with use and that calls other hooks. It lets you extract stateful logic from components and reuse it, for example useDebounce(value, delay), useOnlineStatus() or useFetch(url). Each component that calls the hook gets its own independent state; hooks share logic, not data. I create one when the same combination of state and effects appears in several components, or when a component becomes hard to read because of logic unrelated to rendering. Custom hooks follow the rules of hooks: call them at the top level, not in conditions or loops. They can also be tested in isolation with renderHook.',
    explanation:
      'Custom hooks separate behaviour from presentation, making components smaller and logic reusable and testable.',
    example: 'function useDebounce<T>(value: T, ms = 300) {\n  const [v, setV] = useState(value);\n  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);\n  return v;\n}',
    tips: ['Explain that each call has its own state.', 'Give a realistic example.'],
    commonMistakes: ['Thinking a custom hook shares state between components.', 'Calling hooks conditionally.'],
    followUpQuestions: ['How would you share state between components instead?', 'How do you test a custom hook?'],
  },
  'fe-023': {
    question: 'When does a React component re-render, and how do memo, useMemo and useCallback help?',
    intent: 'The interviewer assesses advanced understanding of rendering performance and when optimisation is worth it.',
    expectedAnswer:
      'A component re-renders when its state changes, when its parent re-renders, or when a context it consumes changes. Re-rendering a component is usually cheap; React then compares the result and updates only what changed in the DOM. Problems appear when expensive components re-render often. React.memo wraps a component so it skips rendering if its props are shallowly equal to the previous ones. Because objects and functions created during a parent render are new each time, memo only works if those props keep the same identity, which is what useMemo, for computed values, and useCallback, for functions, provide. useMemo is also useful for genuinely expensive calculations. These tools add complexity and memory use, so I first measure with the React DevTools Profiler, and I often fix the root cause instead: moving state down closer to where it is used, passing children as props, or splitting contexts. The React Compiler, introduced with React 19, can apply this memoisation automatically.',
    explanation:
      'Memoisation is about preserving identity to skip work. Advanced answers emphasise measuring first and structural fixes, and mention the React Compiler.',
    tips: ['List the three causes of re-render.', 'Explain referential identity.', 'Insist on profiling before optimising.'],
    commonMistakes: ['Wrapping everything in useMemo and useCallback by default.', 'Using memo on a component that receives a new object prop every render.'],
    followUpQuestions: ['How does context cause unnecessary re-renders?', 'What does the React Compiler change?'],
  },
  'fe-024': {
    question: 'Explain server-side rendering, static generation and React Server Components.',
    intent: 'The interviewer checks advanced knowledge of modern React rendering strategies and their trade-offs.',
    expectedAnswer:
      'With client-side rendering, the browser downloads JavaScript and builds the page, which can be slow for the first view and weak for SEO. Server-side rendering generates HTML on the server for each request, so content appears quickly, then hydration attaches React to that HTML to make it interactive. Static generation renders pages at build time, ideal for content that changes rarely; incremental regeneration refreshes them periodically. React Server Components go further: some components run only on the server, can access databases or APIs directly and send a serialised result rather than their code, so they add no JavaScript to the client bundle. Client components, marked with "use client", handle interactivity and state. Frameworks such as Next.js App Router combine these with streaming and Suspense so parts of the page arrive progressively. Trade-offs include server costs and complexity, careful separation of server and client code, hydration mismatches and caching behaviour that must be understood. The choice depends on SEO needs, data freshness and how interactive the page is.',
    explanation:
      'Each strategy balances first-load speed, interactivity, freshness and cost. Advanced candidates explain hydration and what Server Components remove from the bundle.',
    tips: ['Compare strategies by when HTML is generated.', 'Explain hydration.', 'Explain what Server Components send to the client.'],
    commonMistakes: ['Thinking SSR removes the need for client JavaScript.', 'Importing server-only code into client components.'],
    followUpQuestions: ['What causes a hydration mismatch?', 'How would you choose a strategy for an e-commerce product page?'],
  },
  'fe-025': {
    question: 'How would you structure a large React codebase so that it stays maintainable?',
    intent: 'The interviewer assesses architectural judgment for frontend applications developed by several teams.',
    expectedAnswer:
      'I would organise code by feature rather than by technical type: a features/checkout folder containing its components, hooks, API calls and tests, with a public index that other features import from, instead of global components, hooks and services folders that grow without limit. Shared, generic UI goes into a design system with documented components, ideally in Storybook. I would separate server state, handled by a data-fetching library such as TanStack Query, from local UI state and from the little truly global client state. Components would follow a clear split: presentational components receive data through props, while container components or hooks handle data and side effects. I would enforce boundaries with lint rules, for example forbidding imports from another feature\'s internals, use TypeScript in strict mode and a consistent folder convention. Testing would focus on user behaviour with Testing Library rather than implementation details. As the app grows, route-level code splitting keeps bundles small, and if teams need independent releases, a monorepo with packages or, in rare cases, micro-frontends can help.',
    explanation:
      'Maintainability comes from clear boundaries, a shared design system, explicit state categories and enforced conventions. Advanced answers mention tooling that enforces structure.',
    tips: ['Describe feature-based organisation.', 'Distinguish server state from client state.', 'Mention how boundaries are enforced.'],
    commonMistakes: ['Putting everything in a global store.', 'Jumping to micro-frontends without an organisational reason.'],
    followUpQuestions: ['When are micro-frontends justified?', 'How do you prevent the design system from becoming a bottleneck?'],
  },
};
