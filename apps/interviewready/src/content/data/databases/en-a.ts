import type { QuestionText, TextTable } from '@/types/content';

/** Database questions 001-020: SQL, PostgreSQL, MongoDB, indexes (part). */
export const enA: TextTable<QuestionText> = {
  'db-001': {
    question: 'Explain the different types of SQL joins.',
    intent: 'The interviewer checks a core SQL skill used in almost every data task.',
    expectedAnswer:
      'An INNER JOIN returns only rows that have a match in both tables, for example orders that have a customer. A LEFT JOIN returns all rows from the left table and matching rows from the right one, with NULL where there is no match, which is how you find customers without orders: LEFT JOIN orders and keep rows where the order ID is NULL. A RIGHT JOIN does the opposite and is rarely used. A FULL OUTER JOIN keeps rows from both sides, matched when possible. A CROSS JOIN returns every combination of rows. A self join joins a table to itself, for example employees with their managers.',
    explanation:
      'Choosing the right join determines which rows appear in the result. LEFT JOIN with a NULL check is a classic pattern to find missing relationships.',
    example: 'SELECT c.name FROM customers c LEFT JOIN orders o ON o.customer_id = c.id WHERE o.id IS NULL;',
    tips: ['Give a business example for each join.', 'Show the "rows without a match" pattern.'],
    commonMistakes: ['Putting a condition on the right table in WHERE, which turns a LEFT JOIN into an INNER JOIN.', 'Forgetting the join condition and producing a Cartesian product.'],
    followUpQuestions: ['What is the difference between filtering in ON and in WHERE for a LEFT JOIN?', 'How would you find duplicate rows?'],
  },
  'db-002': {
    question: 'What is the difference between WHERE and HAVING?',
    intent: 'The interviewer checks understanding of the logical order of SQL execution.',
    expectedAnswer:
      'WHERE filters individual rows before grouping, so it cannot use aggregate functions. HAVING filters groups after GROUP BY, so it can use aggregates such as COUNT or SUM. For example, to list customers with more than five paid orders: WHERE status = \'PAID\' keeps only paid orders, GROUP BY customer_id groups them and HAVING COUNT(*) > 5 keeps the groups with more than five. Filtering as early as possible with WHERE is also more efficient, because fewer rows are grouped.',
    explanation:
      'SQL is evaluated in a logical order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. This order explains which clause can use which values.',
    tips: ['Give a combined example with both clauses.', 'Mention the logical execution order.'],
    commonMistakes: ['Using HAVING for conditions that belong in WHERE.', 'Trying to use an aggregate in WHERE.'],
    followUpQuestions: ['Why can you not use a SELECT alias in WHERE?', 'What does COUNT(*) count compared with COUNT(column)?'],
  },
  'db-003': {
    question: 'What is the difference between COUNT(*), COUNT(column) and COUNT(DISTINCT column)?',
    intent: 'The interviewer checks precision with aggregates and NULL values, a common source of wrong numbers in reports.',
    expectedAnswer:
      'COUNT(*) counts all rows in the group, including rows with NULL values. COUNT(column) counts only rows where that column is not NULL. COUNT(DISTINCT column) counts the number of different non-NULL values. For example, in an orders table, COUNT(*) gives the number of orders, COUNT(coupon_code) gives the number of orders that used a coupon, and COUNT(DISTINCT customer_id) gives the number of different customers who ordered. Other aggregates such as SUM and AVG also ignore NULLs, so AVG can differ from SUM divided by COUNT(*).',
    explanation:
      'Aggregates treat NULL differently from other values. Knowing this avoids silently incorrect metrics.',
    tips: ['Use one table to illustrate all three counts.', 'Mention that AVG ignores NULLs.'],
    commonMistakes: ['Using COUNT(column) when you meant the number of rows.', 'Assuming AVG treats NULL as zero.'],
    followUpQuestions: ['How would you count orders per status in one query?', 'How do you replace NULL with a default value?'],
  },
  'db-004': {
    question: 'When would you use a subquery, a JOIN or EXISTS?',
    intent: 'The interviewer checks query-writing judgment and awareness of semantic differences.',
    expectedAnswer:
      'A JOIN is best when you need columns from both tables in the result. EXISTS checks whether at least one related row exists, such as customers who placed an order, and returns each customer once without duplicates, which a JOIN could create if a customer has several orders. A scalar subquery returns a single value, for example comparing each product with the average price. IN with a subquery works like EXISTS for simple membership, but NOT IN is dangerous: if the subquery returns any NULL, NOT IN returns no rows, so NOT EXISTS is safer. Modern optimisers often rewrite these forms into similar plans, so readability and correctness usually matter more than micro-optimisation, but the execution plan should confirm it.',
    explanation:
      'The choice depends on whether you need data from the other table, whether duplicates matter and how NULLs behave. The NOT IN trap is a classic interview point.',
    tips: ['Mention duplicates created by joins.', 'Explain the NOT IN and NULL problem.'],
    commonMistakes: ['Using DISTINCT to hide duplicates caused by a join.', 'Using NOT IN on a nullable column.'],
    followUpQuestions: ['What is a correlated subquery?', 'How would you check which version runs faster?'],
  },
  'db-005': {
    question: 'What are window functions, and when do you use them?',
    intent: 'The interviewer checks intermediate SQL skills used heavily in analytics and reporting.',
    expectedAnswer:
      'A window function computes a value across a set of rows related to the current row, without collapsing them into one row as GROUP BY does. It uses OVER, with optional PARTITION BY to define groups and ORDER BY to define order inside each group. Common functions include ROW_NUMBER, which numbers rows; RANK and DENSE_RANK, which handle ties differently; LAG and LEAD, which access previous or next rows, for example to compare this month with last month; and aggregates such as SUM() OVER (ORDER BY date) for running totals. A typical use is finding each customer\'s latest order: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) and keeping rows numbered 1.',
    explanation:
      'Window functions solve ranking, running totals and comparisons between rows elegantly, replacing complex self joins.',
    example: 'SELECT month, revenue, revenue - LAG(revenue) OVER (ORDER BY month) AS change FROM monthly_revenue;',
    tips: ['Explain PARTITION BY and ORDER BY in OVER.', 'Give a "latest row per group" example.'],
    commonMistakes: ['Filtering on a window function in WHERE, which is not allowed; use a CTE or subquery.', 'Confusing RANK and DENSE_RANK.'],
    followUpQuestions: ['What is a window frame, such as ROWS BETWEEN 6 PRECEDING AND CURRENT ROW?', 'How would you compute a 7-day moving average?'],
  },
  'db-006': {
    question: 'How does SQL handle NULL, and what pitfalls does it create?',
    intent: 'The interviewer checks understanding of three-valued logic, which causes subtle bugs.',
    expectedAnswer:
      'NULL means unknown or missing, not zero or an empty string. Any comparison with NULL, even NULL = NULL, returns UNKNOWN rather than true or false, and WHERE keeps only rows where the condition is true. So you must use IS NULL or IS NOT NULL. Pitfalls include: column <> \'X\' excludes rows where the column is NULL; NOT IN with a subquery containing NULL returns nothing; aggregates ignore NULLs; arithmetic with NULL returns NULL; and unique constraints in most databases allow several NULLs. COALESCE replaces NULL with a default, and IS DISTINCT FROM, in PostgreSQL and standard SQL, compares values treating NULLs as equal.',
    explanation:
      'Three-valued logic explains many "missing rows" bugs. Being explicit about NULL handling makes queries correct and readable.',
    tips: ['Mention three-valued logic.', 'Give the not-equal and NOT IN examples.'],
    commonMistakes: ['Writing WHERE column = NULL.', 'Forgetting that inequality filters drop NULL rows.'],
    followUpQuestions: ['Should a column be nullable or have a default value?', 'How do NULLs behave in ORDER BY?'],
  },
  'db-007': {
    question: 'What is a CTE, and when would you use a recursive CTE?',
    intent: 'The interviewer checks readable query structuring and handling of hierarchical data.',
    expectedAnswer:
      'A common table expression, written WITH name AS (SELECT ...), defines a named temporary result used in the main query. CTEs make complex queries readable by splitting them into steps, such as first computing monthly totals and then comparing months. In PostgreSQL 12 and later, simple CTEs are inlined by the optimiser unless marked MATERIALIZED, so they no longer act as optimisation barriers by default. A recursive CTE, WITH RECURSIVE, has an anchor query and a recursive part that references the CTE itself. It is used to traverse hierarchies and graphs: an organisation chart, nested categories or a bill of materials. It needs a termination condition, and for graphs with possible cycles, a way to detect them, for example by tracking the visited path.',
    explanation:
      'CTEs improve readability; recursive CTEs make tree and graph queries possible in plain SQL.',
    example: 'WITH RECURSIVE chain AS (\n  SELECT id, manager_id, name FROM employees WHERE id = 42\n  UNION ALL\n  SELECT e.id, e.manager_id, e.name FROM employees e JOIN chain c ON e.id = c.manager_id\n) SELECT * FROM chain;',
    tips: ['Show a readability use and a recursive use.', 'Mention termination and cycles.'],
    commonMistakes: ['Writing a recursive CTE without a stopping condition.', 'Assuming CTEs are always materialised.'],
    followUpQuestions: ['How would you store a hierarchy if you query it very often?', 'What is the difference between UNION and UNION ALL?'],
  },
  'db-008': {
    question: 'Write a query to find the top three products by revenue in each category, and explain your choices.',
    intent: 'The interviewer assesses advanced SQL problem solving, tie handling and performance awareness.',
    expectedAnswer:
      'I would compute revenue per product first, then rank within each category using a window function, and filter in an outer query because window functions cannot be used in WHERE. In SQL: WITH revenue AS (SELECT p.category_id, p.id, p.name, SUM(oi.quantity * oi.unit_price) AS total FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category_id, p.id, p.name), ranked AS (SELECT *, DENSE_RANK() OVER (PARTITION BY category_id ORDER BY total DESC) AS rnk FROM revenue) SELECT * FROM ranked WHERE rnk <= 3. The choice of ranking function depends on business rules for ties: ROW_NUMBER returns exactly three rows per category by breaking ties arbitrarily unless I add a tie-breaker such as id, RANK can skip positions and DENSE_RANK may return more than three products when values are equal. I would also clarify what revenue means, for example excluding cancelled orders or refunds, and the time period. For performance on large tables, an index on order_items(product_id) helps the join, and for frequent dashboards I would pre-aggregate revenue in a materialised view or summary table. In PostgreSQL, a LATERAL join with LIMIT 3 per category is an alternative that can be faster when categories are few and an appropriate index exists.',
    explanation:
      'The "top N per group" pattern tests window functions, tie semantics and clarifying requirements. Advanced candidates also discuss performance alternatives.',
    tips: ['Clarify the definition of revenue and the period.', 'Explain the effect of each ranking function on ties.', 'Discuss performance for large tables.'],
    commonMistakes: ['Using LIMIT 3 on the whole result, which returns three products overall.', 'Ignoring ties.'],
    followUpQuestions: ['How would you show each product\'s share of its category revenue?', 'How would you make this query fast on a billion rows?'],
  },
  'db-009': {
    question: 'Why do many teams choose PostgreSQL? What are its key features?',
    intent: 'The interviewer checks familiarity with one of the most used relational databases.',
    expectedAnswer:
      'PostgreSQL is an open-source relational database known for reliability, standards compliance and extensibility. Key features include full ACID transactions with MVCC, which lets readers and writers work without blocking each other; rich data types such as JSONB, arrays, ranges and UUIDs; advanced indexing such as B-tree, GIN for full-text search and JSON, GiST for geographic data and partial indexes; window functions and CTEs; extensions such as PostGIS for geospatial data, pg_stat_statements for query statistics and pgvector for embeddings; and a strong ecosystem of managed services on all major clouds. It suits most transactional applications and many analytical workloads up to large sizes.',
    explanation:
      'Interviewers want to see that you know why PostgreSQL is a common default choice and which features you would actually use.',
    tips: ['Mention MVCC, JSONB and extensions.', 'Link features to real use cases.'],
    commonMistakes: ['Listing features without examples of when they help.'],
    followUpQuestions: ['When would you not choose PostgreSQL?', 'What is pgvector used for?'],
  },
  'db-010': {
    question: 'What is MVCC in PostgreSQL, and why does it need VACUUM?',
    intent: 'The interviewer checks understanding of PostgreSQL internals that affect performance and maintenance.',
    expectedAnswer:
      'Multi-Version Concurrency Control means PostgreSQL does not overwrite a row in place. An UPDATE creates a new version of the row and marks the old one as obsolete; a DELETE marks the row as deleted. Each transaction sees a snapshot of the versions that were committed when it started, so readers do not block writers and writers do not block readers. The cost is that old row versions, called dead tuples, accumulate. VACUUM reclaims their space for reuse, updates visibility information and prevents transaction ID wraparound, a serious problem if VACUUM never runs. Autovacuum does this automatically, but tables with heavy updates may need tuned settings; otherwise tables and indexes become bloated and queries slow down. Long-running transactions also prevent cleanup because they still might need old versions.',
    explanation:
      'MVCC explains both PostgreSQL\'s good concurrency and its maintenance needs. Mentioning long transactions and wraparound shows deeper knowledge.',
    tips: ['Explain row versions and snapshots.', 'Mention autovacuum and the effect of long transactions.'],
    commonMistakes: ['Disabling autovacuum to improve performance.', 'Leaving transactions open for hours in application code.'],
    followUpQuestions: ['What is table bloat and how do you detect it?', 'What is the difference between VACUUM and VACUUM FULL?'],
  },
  'db-011': {
    question: 'When would you store data in a JSONB column instead of regular columns?',
    intent: 'The interviewer checks schema design judgment for semi-structured data in a relational database.',
    expectedAnswer:
      'JSONB is useful for data whose structure varies or evolves often and that is mostly read as a whole, such as product attributes that differ by category, user preferences, third-party webhook payloads or audit details. PostgreSQL stores JSONB in a binary format, supports operators to query inside documents and can index it with GIN indexes or expression indexes on specific keys. Regular columns are better for data that is queried, filtered, joined or aggregated frequently, needs constraints such as NOT NULL, foreign keys or types, or is central to the domain, such as prices and statuses. A common approach is hybrid: core fields as columns, flexible extras in a JSONB column. Overusing JSONB loses type safety and constraints and makes queries and migrations harder to reason about.',
    explanation:
      'The decision balances flexibility against integrity and query performance. A hybrid model is often the best answer.',
    tips: ['Give examples of good and bad JSONB use.', 'Mention GIN and expression indexes.'],
    commonMistakes: ['Storing everything in JSONB to avoid designing a schema.', 'Putting foreign keys inside JSON documents.'],
    followUpQuestions: ['How would you index a frequently queried key inside JSONB?', 'How do you validate the structure of a JSONB column?'],
  },
  'db-012': {
    question: 'A PostgreSQL database has become slow in production. How do you investigate?',
    intent: 'The interviewer assesses advanced, systematic database troubleshooting.',
    expectedAnswer:
      'I would first check whether the problem is global or limited to some queries, using monitoring for CPU, memory, disk I/O, connections and replication lag, and correlate with recent deployments or traffic changes. To find costly queries, pg_stat_statements ranks them by total time, mean time and calls; often one new query or a query whose plan changed explains most of the load. I would examine those with EXPLAIN (ANALYZE, BUFFERS) on a safe copy or carefully in production. pg_stat_activity shows what is running now, long transactions and sessions waiting on locks; pg_locks and the wait_event columns identify blocking. I would check table and index bloat and whether autovacuum keeps up, using pg_stat_user_tables for dead tuples and last vacuum times, and check that statistics are recent. Connection saturation suggests the need for a pooler such as PgBouncer. Fixes range from adding or adjusting an index, rewriting a query or updating statistics, to tuning memory settings such as work_mem and shared_buffers, killing a runaway transaction or scaling. After fixing, I would add alerts on slow queries and long transactions.',
    explanation:
      'A structured approach moves from global metrics to specific queries, locks and maintenance. Knowing the relevant system views shows real PostgreSQL experience.',
    tips: ['Mention pg_stat_statements and pg_stat_activity.', 'Check locks, bloat and autovacuum.', 'Correlate with recent changes.'],
    commonMistakes: ['Restarting the database without collecting evidence.', 'Running EXPLAIN ANALYZE on a heavy write query in production without wrapping it in a transaction that is rolled back.'],
    followUpQuestions: ['What would you do if a migration holds a lock that blocks traffic?', 'How do you choose a value for work_mem?'],
  },
  'db-013': {
    question: 'How would you scale a PostgreSQL database as an application grows?',
    intent: 'The interviewer evaluates advanced architectural thinking about database capacity and trade-offs.',
    expectedAnswer:
      'I would scale in steps, starting with the cheapest options. First, optimise: fix slow queries, add the right indexes, and reduce unnecessary load such as N+1 queries. Second, add connection pooling with PgBouncer, because PostgreSQL uses a process per connection and too many connections waste memory. Third, add caching for frequently read data, with Redis or application caches. Fourth, scale vertically with more CPU, memory and faster storage, which is simple and often enough for a long time. Fifth, add read replicas for read-heavy workloads, keeping in mind replication lag: reads that must see the user\'s latest write should go to the primary. Sixth, partition very large tables, for example by date, so queries and maintenance touch smaller pieces and old data can be dropped quickly. Finally, for write volumes a single primary cannot handle, shard data across several databases by a key such as tenant ID, either in the application or with an extension such as Citus; this adds significant complexity for cross-shard queries and transactions. Archiving old data and moving analytics to a separate warehouse also relieve the main database.',
    explanation:
      'Scaling is a sequence of increasingly complex steps. Advanced candidates exhaust simple options first and understand the consistency implications of replicas and sharding.',
    tips: ['Order options from simplest to most complex.', 'Mention replication lag and read-your-writes.', 'Explain the cost of sharding.'],
    commonMistakes: ['Jumping straight to sharding.', 'Sending every read to replicas without considering lag.'],
    followUpQuestions: ['How would you choose a shard key?', 'When would you move analytics to a data warehouse?'],
  },
  'db-014': {
    question: 'What is a document database like MongoDB, and how does it differ from a relational database?',
    intent: 'The interviewer checks understanding of NoSQL document models and their trade-offs.',
    expectedAnswer:
      'MongoDB stores data as documents, JSON-like objects in BSON format, grouped in collections. Documents can contain nested objects and arrays, and documents in the same collection do not need identical fields. Data that is used together can be stored together, for example an order with its items, which avoids joins for common reads. Relational databases store data in tables with a fixed schema, enforce relationships with foreign keys and are very strong for complex queries and joins. MongoDB offers flexible schemas, horizontal scaling through sharding and a powerful aggregation pipeline, and has supported multi-document transactions since version 4.0, but heavy relational data with many joins is usually more natural in SQL.',
    explanation:
      'The main difference is data modelling: documents shaped by access patterns versus normalised tables shaped by relationships.',
    tips: ['Mention flexible schema and nested documents.', 'Give a use case that suits each model.'],
    commonMistakes: ['Saying MongoDB has no schema at all; the schema is implicit and should be designed.', 'Saying MongoDB does not support transactions.'],
    followUpQuestions: ['How do you validate document structure in MongoDB?', 'When would you embed data versus reference it?'],
  },
  'db-015': {
    question: 'In MongoDB, how do you decide between embedding and referencing related data?',
    intent: 'The interviewer checks practical document modelling skills.',
    expectedAnswer:
      'I start from the access patterns: which data is read and written together. Embedding puts related data inside the parent document, such as order lines inside an order or addresses inside a customer. It is good when the child data belongs to one parent, is read with it most of the time, has a bounded size and is not updated independently very often; one read returns everything and updates of the whole document are atomic. Referencing stores an ID pointing to another document, like a foreign key. It is better when the related data is shared by many documents, such as products referenced by orders; when it grows without limit, such as comments or events, because documents have a 16 MB size limit and large arrays hurt performance; or when it is updated independently. A common compromise is to embed a few frequently needed fields, such as a product name and price at the time of order, and reference the rest.',
    explanation:
      'Document design follows queries, not entity relationships alone. Bounded versus unbounded growth is a key criterion.',
    tips: ['Start from access patterns.', 'Mention the document size limit and unbounded arrays.', 'Give the partial duplication compromise.'],
    commonMistakes: ['Embedding unbounded lists such as all logs of a user.', 'Normalising everything and then doing many lookups.'],
    followUpQuestions: ['How do you keep duplicated fields up to date?', 'What is the $lookup stage?'],
  },
  'db-016': {
    question: 'What is the MongoDB aggregation pipeline?',
    intent: 'The interviewer checks the ability to process and analyse data inside MongoDB.',
    expectedAnswer:
      'The aggregation pipeline processes documents through a sequence of stages, each transforming the results of the previous one. Common stages are $match to filter, $group to aggregate with operators such as $sum and $avg, $project or $set to reshape fields, $sort, $limit, $unwind to turn array elements into separate documents and $lookup to join another collection. For example, to compute revenue per product category for paid orders: $match on status, $unwind the items, $group by category with $sum of price times quantity, then $sort. For performance, $match and $sort should come early so they can use indexes and reduce the number of documents, and large intermediate results may need allowDiskUse.',
    explanation:
      'The pipeline is MongoDB\'s equivalent of SQL GROUP BY, joins and transformations. Stage order strongly affects performance.',
    example: 'db.orders.aggregate([\n  { $match: { status: "paid" } },\n  { $unwind: "$items" },\n  { $group: { _id: "$items.category", revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },\n  { $sort: { revenue: -1 } }\n])',
    tips: ['List the main stages.', 'Explain why $match should come early.'],
    commonMistakes: ['Putting $match after expensive stages.', 'Using $lookup heavily as if the database were relational.'],
    followUpQuestions: ['How would you check that a pipeline uses an index?', 'What is $facet used for?'],
  },
  'db-017': {
    question: 'How does sharding work in MongoDB, and how do you choose a shard key?',
    intent: 'The interviewer assesses advanced knowledge of horizontal scaling and its pitfalls.',
    expectedAnswer:
      'Sharding distributes a collection across several shards, each a replica set, so data volume and write load are spread over many machines. A router, mongos, directs queries using the shard key: documents are grouped into ranges of shard key values, called chunks, and a balancer moves chunks between shards to keep them even. The shard key is the critical decision and is difficult to change later, although resharding has been possible since MongoDB 5.0. A good shard key has high cardinality, distributes writes evenly and matches the most frequent queries so they target one shard instead of broadcasting to all. A monotonically increasing key such as a timestamp or ObjectId sends all new writes to one shard, creating a hot spot; hashed sharding spreads them but makes range queries scatter. A compound key, such as tenant ID plus a hashed or time component, often balances isolation per customer and even distribution. I would analyse query patterns and data growth before choosing, and test with realistic data.',
    explanation:
      'The shard key determines distribution and query efficiency. Advanced candidates know hot spots, scatter-gather queries and the cost of changing the key.',
    tips: ['Explain chunks, mongos and the balancer.', 'List the properties of a good shard key.', 'Give an example of a bad key.'],
    commonMistakes: ['Choosing a timestamp as the only shard key.', 'Sharding before it is needed.'],
    followUpQuestions: ['What is a jumbo chunk?', 'How would you handle one very large tenant?'],
  },
  'db-018': {
    question: 'For a new product, how would you decide between PostgreSQL and MongoDB?',
    intent: 'The interviewer evaluates technology choice based on requirements rather than preference.',
    expectedAnswer:
      'I would start from the data and the access patterns. If the domain has many relationships, needs strong consistency across entities, complex reporting with joins and constraints such as foreign keys, as in billing, inventory or bookings, PostgreSQL is a natural default. If the data is naturally document-shaped, read and written as whole aggregates, varies in structure, for example content management, product catalogues with varied attributes or event data, and needs to scale writes horizontally early, MongoDB can be a good fit. I would also consider the team\'s experience, operational tooling and managed services available, cost, and future needs such as analytics or search. The gap between them has narrowed: PostgreSQL has JSONB and MongoDB has transactions and schema validation, so for many products either works, and the deciding factors are the core access patterns and the team. Sometimes the answer is both, each for the part of the system it fits, but I would avoid adding a second database without a clear reason because of the operational cost.',
    explanation:
      'A senior answer weighs data shape, consistency needs, scaling, team skills and operations, and recognises that both databases have converged.',
    tips: ['Start from access patterns and consistency needs.', 'Include team and operational factors.', 'Acknowledge the overlap between the two.'],
    commonMistakes: ['Choosing MongoDB only because the schema is "flexible".', 'Saying SQL databases cannot scale.'],
    followUpQuestions: ['How would you migrate if the choice turned out wrong?', 'What role would a search engine such as Elasticsearch play?'],
  },
  'db-019': {
    question: 'What is a database index, and what are its trade-offs?',
    intent: 'The interviewer checks a fundamental performance concept.',
    expectedAnswer:
      'An index is an additional data structure, usually a B-tree, that stores the values of one or more columns in sorted order with pointers to the rows. It lets the database find matching rows without scanning the whole table, like a book index, which makes lookups, joins and sorting much faster. The trade-offs are extra disk space and slower writes, because every INSERT, UPDATE or DELETE must also update the indexes. Indexes are worth it on columns used often in WHERE, JOIN and ORDER BY clauses, but adding indexes on every column wastes resources.',
    explanation:
      'Indexes trade write cost and storage for read speed. Choosing them based on real queries is the key skill.',
    tips: ['Use the book index analogy.', 'Mention the write cost.'],
    commonMistakes: ['Indexing every column.', 'Thinking indexes speed up all queries.'],
    followUpQuestions: ['How do you know if a query uses an index?', 'What is a unique index?'],
  },
  'db-020': {
    question: 'How does a B-tree index work, and which queries can use it?',
    intent: 'The interviewer checks a deeper understanding of the most common index type.',
    expectedAnswer:
      'A B-tree is a balanced tree whose leaf pages hold index entries in sorted order, linked to each other, while upper levels guide the search. Because the tree stays shallow, even with millions of rows a lookup reads only a few pages, in O(log n). Since the keys are sorted, a B-tree supports equality, range conditions such as BETWEEN, >, <, prefix searches such as LIKE \'abc%\', ORDER BY on the indexed columns and MIN or MAX. It does not help with conditions that do not match its order: a leading wildcard such as LIKE \'%abc\', functions applied to the column unless there is an expression index, or, for multi-column indexes, conditions that skip the first column. For low-selectivity columns, such as a boolean where most rows have the same value, the database may prefer a full scan.',
    explanation:
      'Understanding sorted order explains which predicates benefit from an index and why some queries ignore it.',
    tips: ['Explain sorted leaves and tree depth.', 'List supported and unsupported query patterns.'],
    commonMistakes: ['Expecting an index to help a leading-wildcard search.', 'Applying a function to an indexed column in WHERE.'],
    followUpQuestions: ['How would you support a case-insensitive email lookup?', 'What other index types does PostgreSQL offer?'],
  },
};
