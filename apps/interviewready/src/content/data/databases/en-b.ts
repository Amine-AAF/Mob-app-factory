import type { QuestionText, TextTable } from '@/types/content';

/** Database questions 021-040: indexes (part), transactions, query optimisation, database design. */
export const enB: TextTable<QuestionText> = {
  'db-021': {
    question: 'How do you choose the column order in a composite index?',
    intent: 'The interviewer checks a practical indexing skill that strongly affects query performance.',
    expectedAnswer:
      'A composite B-tree index on (a, b, c) is sorted by a, then b within each a, then c. It can be used for conditions on a, on a and b, or on a, b and c, but generally not for a condition on b alone, the "leftmost prefix" rule. So I order columns according to the queries: columns compared with equality first, then the column used in a range or for sorting. For example, for WHERE tenant_id = ? AND status = ? ORDER BY created_at DESC, an index on (tenant_id, status, created_at) lets the database find the rows and return them already sorted. Putting the range column first, such as created_at, would prevent efficient use of the following columns. Selectivity matters too, but query shape matters more. One well-designed composite index can often replace several single-column ones.',
    explanation:
      'The leftmost-prefix rule and the "equality before range" guideline are the key ideas for designing composite indexes.',
    example: 'CREATE INDEX idx_orders_tenant_status_date ON orders (tenant_id, status, created_at DESC);',
    tips: ['Explain the leftmost-prefix rule.', 'Put equality columns before range or sort columns.'],
    commonMistakes: ['Creating separate single-column indexes and expecting them to act like a composite index.', 'Putting a range column first.'],
    followUpQuestions: ['Can the database use the index for ORDER BY in the opposite direction?', 'What is an index-only scan?'],
  },
  'db-022': {
    question: 'When should you not add an index?',
    intent: 'The interviewer checks that you understand the costs of indexes and do not add them blindly.',
    expectedAnswer:
      'I avoid an index when its cost exceeds its benefit. Tables with very heavy write traffic, such as event logs, pay for every index on each insert. Columns with low selectivity, for example a status with two values evenly distributed, rarely benefit because reading half the table through an index is slower than a sequential scan; a partial index on the rare value can be better. Small tables are scanned quickly anyway. Columns never used in filters, joins or sorting do not need indexes, and duplicate or overlapping indexes, such as (a) when (a, b) already exists, waste space. I check unused indexes with database statistics, such as pg_stat_user_indexes in PostgreSQL, and base decisions on real query plans rather than guesses.',
    explanation:
      'Good indexing is a balance. Removing unused indexes can improve write performance and reduce storage.',
    tips: ['Mention write-heavy tables and low selectivity.', 'Explain how to find unused indexes.'],
    commonMistakes: ['Adding an index for every new query without checking existing ones.'],
    followUpQuestions: ['What is a partial index?', 'How would you safely drop an index in production?'],
  },
  'db-023': {
    question: 'A query does not use an index you expected it to use. What are the possible reasons?',
    intent: 'The interviewer assesses advanced understanding of query planners and how query writing affects index usage.',
    expectedAnswer:
      'Several causes are common. The predicate may not match the index: a function or expression on the column, such as WHERE LOWER(email) = ? or WHERE DATE(created_at) = ?, prevents use of a plain index, so you need an expression index or a rewritten range condition. An implicit type conversion, for example comparing a text column with a number, has the same effect. A leading wildcard, LIKE \'%term\', cannot use a B-tree; a trigram GIN index or full-text search is needed. In a composite index, the query may skip the leading column. Conditions combined with OR across different columns may lead to a scan. The planner may also decide correctly that a sequential scan is cheaper because the condition matches a large fraction of rows, or because the table is small. Finally, outdated statistics can produce wrong row estimates; running ANALYZE fixes that. With prepared statements, PostgreSQL may switch to a generic plan that ignores the specific parameter value. I would compare estimated and actual rows in EXPLAIN ANALYZE to find which case applies, rather than forcing the index.',
    explanation:
      'Index usage depends on predicate shape, data distribution and statistics. Advanced candidates diagnose with EXPLAIN ANALYZE instead of assuming the planner is wrong.',
    tips: ['Group causes into query shape, data distribution and statistics.', 'Mention expression indexes.', 'Compare estimated and actual rows.'],
    commonMistakes: ['Forcing index usage with hints without understanding the plan.', 'Forgetting to run ANALYZE after large data loads.'],
    followUpQuestions: ['How would you index a case-insensitive search?', 'What is a generic plan in PostgreSQL?'],
  },
  'db-024': {
    question: 'Explain covering indexes, partial indexes and specialised index types in PostgreSQL.',
    intent: 'The interviewer checks advanced indexing tools for specific performance problems.',
    expectedAnswer:
      'A covering index contains all the columns a query needs, so the database can answer it with an index-only scan without reading the table. In PostgreSQL, INCLUDE adds non-key columns to an index for this purpose, for example CREATE INDEX ON orders (customer_id) INCLUDE (total, status). Index-only scans also depend on the visibility map being up to date, which VACUUM maintains. A partial index covers only rows that satisfy a condition, such as WHERE status = \'PENDING\', which keeps the index small and fast when queries target a small subset; it can also enforce uniqueness on a subset, such as one active subscription per user. Beyond B-tree, PostgreSQL offers GIN for values containing many elements, such as JSONB, arrays and full-text search; GiST for geometric, range and nearest-neighbour searches, used by PostGIS; BRIN, a tiny index for very large tables whose values correlate with physical order, such as append-only time series; and hash indexes for pure equality. Extensions add more, such as pg_trgm for similarity search and HNSW indexes from pgvector for embeddings.',
    explanation:
      'Choosing the right index type for the data and query shape can transform performance. Advanced candidates know when B-tree is not the right tool.',
    example: 'CREATE UNIQUE INDEX one_active_sub ON subscriptions (user_id) WHERE status = \'ACTIVE\';',
    tips: ['Give a concrete use case for each type.', 'Mention INCLUDE and the visibility map.', 'Show a partial unique index.'],
    commonMistakes: ['Using a B-tree for JSONB containment queries.', 'Creating large indexes when a partial index would suffice.'],
    followUpQuestions: ['When is BRIN a good choice?', 'How do you index a JSONB key used in filters?'],
  },
  'db-025': {
    question: 'What does ACID mean for database transactions?',
    intent: 'The interviewer checks a fundamental concept of reliable data storage.',
    expectedAnswer:
      'ACID describes four guarantees of transactions. Atomicity: all operations in a transaction succeed or none do; if a bank transfer debits one account, the credit to the other account happens too, or both are cancelled. Consistency: a transaction moves the database from one valid state to another, respecting constraints such as foreign keys and unique keys. Isolation: concurrent transactions do not see each other\'s uncommitted changes, to a degree defined by the isolation level. Durability: once committed, changes survive crashes, because they are written to a log on disk before being confirmed.',
    explanation:
      'ACID is what makes relational databases trustworthy for critical data such as payments and inventory.',
    tips: ['Use the bank transfer example.', 'Mention that isolation has levels.'],
    commonMistakes: ['Confusing database consistency with consistency in the CAP theorem.'],
    followUpQuestions: ['What are isolation levels?', 'How does a database guarantee durability?'],
  },
  'db-026': {
    question: 'What are transaction isolation levels, and which anomalies do they prevent?',
    intent: 'The interviewer checks understanding of concurrency trade-offs inside the database.',
    expectedAnswer:
      'The SQL standard defines four levels. Read Uncommitted allows dirty reads, seeing data from transactions not yet committed; PostgreSQL treats it as Read Committed. Read Committed, the default in PostgreSQL, sees only committed data, but each statement sees a new snapshot, so reading the same row twice can return different values, a non-repeatable read. Repeatable Read keeps one snapshot for the whole transaction; in PostgreSQL it also prevents phantom rows, but write skew remains possible, for example two doctors both going off call because each saw the other still on call. Serializable guarantees that the result is the same as running transactions one after another; PostgreSQL implements it with serializable snapshot isolation and aborts conflicting transactions, so the application must retry them. Higher levels give stronger guarantees at the cost of more conflicts and retries. MySQL InnoDB defaults to Repeatable Read, so behaviour differs between databases.',
    explanation:
      'Knowing which anomaly each level prevents, and that databases differ, helps choose the right level and handle retries.',
    tips: ['Name the anomalies: dirty read, non-repeatable read, phantom, write skew.', 'Mention defaults in PostgreSQL and MySQL.', 'Mention retries at Serializable.'],
    commonMistakes: ['Assuming the default level prevents all concurrency issues.', 'Using Serializable without retry logic.'],
    followUpQuestions: ['What is write skew?', 'How would you prevent double booking of a room?'],
  },
  'db-027': {
    question: 'How do deadlocks happen in a database, and how do you avoid them?',
    intent: 'The interviewer checks experience with locking problems in real applications.',
    expectedAnswer:
      'A deadlock occurs when two transactions each hold a lock the other needs: transaction A updates row 1 then wants row 2, while B updates row 2 then wants row 1. The database detects the cycle and aborts one transaction with an error, so the application must be ready to retry it. To reduce deadlocks, I access rows and tables in a consistent order, for example updating accounts sorted by ID; keep transactions short and avoid user interaction or remote calls inside them; lock what you need up front with SELECT ... FOR UPDATE when appropriate; and make sure updates use indexes so they lock fewer rows. Database logs show the queries involved in each deadlock, which helps find the conflicting code paths.',
    explanation:
      'Deadlocks are often caused by inconsistent ordering and long transactions. Consistent ordering plus retries is the standard approach.',
    tips: ['Give a two-transaction example.', 'Mention retry logic and consistent ordering.'],
    commonMistakes: ['Ignoring deadlock errors instead of retrying.', 'Making HTTP calls inside open transactions.'],
    followUpQuestions: ['How would you find which queries caused a deadlock?', 'What is a lock timeout?'],
  },
  'db-028': {
    question: 'What is the difference between optimistic and pessimistic locking?',
    intent: 'The interviewer checks the ability to handle concurrent updates correctly in applications.',
    expectedAnswer:
      'Pessimistic locking prevents conflicts by locking data before changing it, for example SELECT ... FOR UPDATE, so other transactions wait until the lock is released. It is safe when conflicts are frequent or the cost of a conflict is high, but it reduces concurrency and can cause waits or deadlocks. Optimistic locking assumes conflicts are rare: each row has a version number or timestamp, and an update includes it in the condition, UPDATE ... SET ..., version = version + 1 WHERE id = ? AND version = ?. If no row is updated, someone else changed it first, and the application reloads and retries or shows a conflict message to the user. JPA supports this with @Version. Optimistic locking suits web applications where users edit data for a long time without holding database locks.',
    explanation:
      'The choice depends on conflict frequency and how long a user or process works on the data.',
    tips: ['Show the versioned UPDATE condition.', 'Give a use case for each.'],
    commonMistakes: ['Holding a pessimistic lock while a user edits a form.', 'Ignoring the "zero rows updated" result in optimistic locking.'],
    followUpQuestions: ['What does SKIP LOCKED do?', 'How would you present a conflict to the user?'],
  },
  'db-029': {
    question: 'Two users buy the last item in stock at the same moment. How do you prevent overselling?',
    intent: 'The interviewer assesses advanced handling of race conditions at the database level.',
    expectedAnswer:
      'The bug comes from a read-then-write sequence: both requests read stock = 1, both see it is available and both write 0, or create two orders. The most robust fix is to make the check and the change one atomic operation: UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0, then check the number of affected rows; if it is zero, the item is sold out. A CHECK (stock >= 0) constraint adds a safety net. Alternatives are a pessimistic lock with SELECT ... FOR UPDATE inside a transaction before creating the order, or optimistic locking with a version column and retries. For flash sales with very high contention on one row, I would consider reservation models, such as a queue or a Redis atomic counter, with the database as the final source of truth. The order creation and stock update should be in the same transaction, and the purchase request should be idempotent so a client retry does not decrement twice.',
    explanation:
      'Atomic conditional updates and constraints remove the race instead of reducing its probability. Advanced answers cover high contention and idempotency.',
    example: 'UPDATE products SET stock = stock - 1 WHERE id = $1 AND stock > 0 RETURNING stock;',
    tips: ['Explain the read-then-write race.', 'Show the atomic conditional update.', 'Mention constraints and idempotency.'],
    commonMistakes: ['Checking stock in application code before updating without a lock.', 'Relying on a higher isolation level without handling serialization errors.'],
    followUpQuestions: ['How would this work with reservations that expire after 10 minutes?', 'What changes if stock is spread across warehouses?'],
  },
  'db-030': {
    question: 'How do replication and consistency interact? Explain read-your-writes and the CAP theorem in practice.',
    intent: 'The interviewer evaluates advanced understanding of distributed data trade-offs.',
    expectedAnswer:
      'With asynchronous replication, the primary confirms a write before replicas receive it, so replicas lag behind, usually by milliseconds but sometimes by seconds under load. If an application writes to the primary and immediately reads from a replica, the user may not see their own change, which breaks read-your-writes consistency. Solutions include routing a user\'s reads to the primary for a short time after they write, reading from replicas only for data where staleness is acceptable, using synchronous replication for critical data at the cost of write latency, or passing a log position so a replica waits until it has caught up. The CAP theorem says that during a network partition, a distributed system must choose between consistency, refusing or delaying some requests, and availability, answering with possibly stale data. Outside partitions, the PACELC extension describes the trade-off between latency and consistency. In practice, I choose per use case: account balances and inventory need strong consistency, while product catalogues or analytics can tolerate staleness.',
    explanation:
      'Replication lag is the everyday face of the CAP trade-off. Advanced candidates propose concrete techniques and choose consistency per use case.',
    tips: ['Explain replication lag with a user-facing example.', 'Give practical solutions.', 'Mention CAP and PACELC correctly.'],
    commonMistakes: ['Saying you can have consistency and availability during a partition.', 'Sending all reads to replicas without considering lag.'],
    followUpQuestions: ['What is the difference between synchronous and asynchronous replication?', 'How do you monitor replication lag?'],
  },
  'db-031': {
    question: 'How do you approach optimising a slow SQL query?',
    intent: 'The interviewer checks a structured performance method rather than guesswork.',
    expectedAnswer:
      'First I measure: how slow, how often it runs and whether it is slow every time or only with certain parameters. Then I look at the execution plan with EXPLAIN ANALYZE to see where time is spent: full table scans on large tables, nested loops over many rows, large sorts or estimated row counts far from reality. Typical fixes are adding or adjusting an index that matches the WHERE, JOIN and ORDER BY clauses, selecting only needed columns instead of SELECT *, avoiding functions on indexed columns, rewriting correlated subqueries, adding pagination or limits, and updating statistics. If the query is inherently heavy, such as a large report, I consider pre-aggregation or caching. After each change, I measure again with realistic data volumes.',
    explanation:
      'Measure, read the plan, change one thing, measure again: this is the core loop of query optimisation.',
    tips: ['Start with measurement and the execution plan.', 'List common fixes.', 'Test with realistic data volumes.'],
    commonMistakes: ['Adding indexes randomly.', 'Testing on a tiny development database.'],
    followUpQuestions: ['What does a sequential scan mean in a plan?', 'Why is SELECT * discouraged?'],
  },
  'db-032': {
    question: 'How do you read the output of EXPLAIN ANALYZE?',
    intent: 'The interviewer checks practical ability to interpret query plans.',
    expectedAnswer:
      'The plan is a tree of operations read from the most indented nodes, which run first, up to the root. Each node shows its type, such as Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan, Nested Loop, Hash Join, Merge Join or Sort, with the estimated cost and rows and, with ANALYZE, the actual time, actual rows and number of loops. I look for the nodes with the highest actual time, keeping in mind that time is cumulative and multiplied by loops. A large gap between estimated and actual rows suggests outdated or insufficient statistics and often explains a bad join choice, such as a nested loop over many thousands of rows. Sorts or hashes spilling to disk point to insufficient memory. Adding BUFFERS shows how many pages were read from cache or disk. Tools such as explain.depesz.com or pgMustard make large plans easier to read.',
    explanation:
      'Execution plans show what the database actually does. Comparing estimates with actual numbers is the most useful diagnostic habit.',
    tips: ['Explain how to read the tree.', 'Highlight estimated versus actual rows.', 'Mention BUFFERS.'],
    commonMistakes: ['Looking only at the total cost number.', 'Forgetting that EXPLAIN ANALYZE actually runs the query.'],
    followUpQuestions: ['When is a nested loop a good choice?', 'How would you fix bad row estimates on correlated columns?'],
  },
  'db-033': {
    question: 'How would you speed up heavy analytical queries on a large transactional database?',
    intent: 'The interviewer checks the ability to separate analytical and transactional workloads.',
    expectedAnswer:
      'Analytical queries that scan and aggregate millions of rows compete with transactional traffic. First, I would optimise the queries themselves and add suitable indexes. Then I would pre-compute results: materialised views refreshed on a schedule, with REFRESH MATERIALIZED VIEW CONCURRENTLY in PostgreSQL to avoid blocking readers, or summary tables updated incrementally, for example daily revenue per product. Partitioning large tables by date lets queries read only the relevant periods. Running reports on a read replica isolates them from the primary. For larger needs, I would move analytics to a columnar data warehouse such as BigQuery, Snowflake or ClickHouse, fed by an ETL or change data capture pipeline, because columnar storage reads only the needed columns and compresses well. The trade-off is data freshness: dashboards may be minutes or hours behind, which must be acceptable to users.',
    explanation:
      'Separating OLTP and OLAP workloads, through pre-aggregation, replicas or warehouses, protects application performance.',
    tips: ['Mention materialised views and summary tables.', 'Explain why columnar warehouses are faster for analytics.', 'Discuss freshness.'],
    commonMistakes: ['Running heavy reports on the primary during peak hours.', 'Refreshing a large materialised view every minute.'],
    followUpQuestions: ['What is the difference between OLTP and OLAP?', 'How would you build an incremental summary table?'],
  },
  'db-034': {
    question: 'A query is fast in staging but very slow in production. What could explain this?',
    intent: 'The interviewer assesses advanced diagnosis of environment-dependent performance issues.',
    expectedAnswer:
      'The most common cause is data: production has much more data and a different distribution, so the planner chooses a different plan, for example a nested loop that was fine with a hundred rows but disastrous with a million, or a common value that makes an index useless. Skewed data, such as one huge customer, can make the same query fast for most parameters and slow for some. Statistics may be outdated in production after a large import, or autovacuum may lag, causing bloat. Production also has concurrency: lock waits, contention on hot rows, a saturated connection pool or I/O shared with other workloads. Configuration can differ: memory settings such as work_mem, missing indexes that exist in staging, or a different database version. Plan caching with prepared statements can produce a generic plan that is bad for specific values. To investigate, I would capture the actual production plan with EXPLAIN ANALYZE or auto_explain, compare it with staging, check pg_stat_statements for variations by parameter and look at wait events. Long term, staging should use production-like data volumes, anonymised if needed.',
    explanation:
      'Performance depends on data volume, distribution, concurrency and configuration. Advanced candidates compare real plans rather than assuming.',
    tips: ['Start with data volume and distribution.', 'Include concurrency, configuration and plan caching.', 'Explain how to capture the production plan.'],
    commonMistakes: ['Assuming identical code means identical performance.', 'Testing only with tiny datasets.'],
    followUpQuestions: ['What does auto_explain do?', 'How would you create realistic but anonymised test data?'],
  },
  'db-035': {
    question: 'How would you add a cache in front of a database, and what problems must you handle?',
    intent: 'The interviewer evaluates advanced caching design and awareness of consistency issues.',
    expectedAnswer:
      'The most common pattern is cache-aside: the application reads from a cache such as Redis; on a miss it reads the database, stores the result with a time-to-live and returns it. On writes, it updates the database and then deletes the cache entry, rather than updating it, to reduce race conditions. Problems to handle: stale data, limited by the TTL and by invalidation on writes; the thundering herd or cache stampede, when a popular key expires and many requests hit the database at once, solved with request coalescing, a lock per key or early refresh with jitter; cache penetration, when requests for non-existent keys always miss, solved by caching negative results briefly; consistency when the database write succeeds but the cache deletion fails, handled with retries or change data capture-driven invalidation; and memory limits with an eviction policy such as LRU. I would cache only data that is read often and can tolerate brief staleness, never authorisation decisions without care, and monitor hit rate. The database must remain correct if the cache is empty or down.',
    explanation:
      'A cache is easy to add and hard to keep correct. Advanced answers cover invalidation, stampedes, negative caching and failure modes.',
    tips: ['Describe cache-aside clearly.', 'Explain stampede and invalidation problems.', 'Say what should not be cached.'],
    commonMistakes: ['Caching without a TTL or invalidation strategy.', 'Letting the application fail when the cache is unavailable.'],
    followUpQuestions: ['What is the difference between cache-aside and write-through?', 'How do you choose a TTL?'],
  },
  'db-036': {
    question: 'What are primary keys, foreign keys and normalisation?',
    intent: 'The interviewer checks relational design fundamentals.',
    expectedAnswer:
      'A primary key uniquely identifies each row of a table, such as customer_id, and cannot be NULL. A foreign key is a column that references the primary key of another table, such as orders.customer_id referencing customers.id; the database then rejects orders for non-existent customers, protecting data integrity. Normalisation organises data to avoid duplication: instead of repeating the customer\'s name and address in every order, you store them once in a customers table and reference them. This prevents inconsistencies, such as an address updated in one place but not another, and makes updates simpler.',
    explanation:
      'Keys and normalisation are the foundation of data integrity in relational databases.',
    tips: ['Use a customers and orders example.', 'Explain the problem normalisation solves.'],
    commonMistakes: ['Not declaring foreign keys and relying only on application code.'],
    followUpQuestions: ['What happens to orders when a customer is deleted?', 'What is a composite primary key?'],
  },
  'db-037': {
    question: 'Explain the first three normal forms, and when would you denormalise?',
    intent: 'The interviewer checks deeper design knowledge and pragmatic trade-offs.',
    expectedAnswer:
      'First normal form requires atomic values: no lists in a column, such as several phone numbers in one field, and no repeating groups of columns. Second normal form, relevant for composite keys, requires that every non-key column depends on the whole key, not part of it: in an order_items table keyed by order and product, the product name depends only on the product and belongs in the products table. Third normal form requires that non-key columns depend only on the key and not on other non-key columns: storing both a city and its country in a customers table, when country depends on city, creates redundancy. Denormalisation deliberately adds redundancy for performance or simplicity, for example storing the order total, copying the product price at the time of purchase, which is also a business requirement, or maintaining read models for reports. It must be controlled, with a clear source of truth and a way to keep copies in sync.',
    explanation:
      'Normal forms reduce anomalies. Denormalising intentionally, with a plan to keep data consistent, is a sign of mature design.',
    tips: ['Give an example violation for each form.', 'Name a case where denormalisation is correct, such as price at purchase time.'],
    commonMistakes: ['Denormalising early without a measured need.', 'Confusing historical data, such as price at purchase, with redundancy.'],
    followUpQuestions: ['How would you keep a denormalised total in sync?', 'What is BCNF?'],
  },
  'db-038': {
    question: 'Should you use auto-increment integers or UUIDs as primary keys?',
    intent: 'The interviewer checks practical design judgment about identifiers.',
    expectedAnswer:
      'Auto-increment integers, such as BIGINT identity columns, are compact, fast to index and easy to read, but they reveal information such as the number of orders, are guessable in URLs, and are generated by one database, which complicates merging data or generating IDs on clients. UUIDs can be generated anywhere without coordination, which helps distributed systems, offline clients and data imports, and they do not reveal counts. Random UUIDs, version 4, cause scattered inserts in B-tree indexes and larger indexes, which hurts write performance on big tables. Time-ordered UUIDs such as UUIDv7, standardised in 2024, keep the benefits while inserting in roughly sequential order. A common compromise is an internal integer key for joins and a separate public UUID or slug for external use. Whatever the choice, IDs should not be used as an authorisation mechanism.',
    explanation:
      'The decision balances performance, security, distribution and readability. Mentioning UUIDv7 shows current knowledge.',
    tips: ['Compare both on performance, security and distribution.', 'Mention UUIDv7.'],
    commonMistakes: ['Relying on unguessable IDs instead of access checks.', 'Using random UUIDs on very large write-heavy tables without considering index impact.'],
    followUpQuestions: ['What are the security risks of sequential IDs in URLs?', 'How do you generate IDs in an offline-first app?'],
  },
  'db-039': {
    question: 'How would you change the schema of a large production table without downtime?',
    intent: 'The interviewer assesses advanced, safe migration practices on live systems.',
    expectedAnswer:
      "I would use the expand and contract pattern so that old and new application versions work during the transition. To rename a column, for example: first add the new column, nullable and without a heavy default, which is fast; deploy code that writes to both columns; backfill existing rows in small batches with pauses, to avoid long locks, large transactions and replication lag; then switch reads to the new column; and only after all running code uses it, drop the old column in a later release. Specific operations need care: in PostgreSQL, create indexes with CREATE INDEX CONCURRENTLY, add foreign keys and check constraints as NOT VALID and validate them separately, and set a lock_timeout so a migration waiting for a lock does not block all traffic behind it. Adding a column with a constant default is fast since PostgreSQL 11, but changing a column type usually rewrites the table. Migrations are versioned with tools like Flyway or Liquibase, tested on a production-sized copy and monitored while running, with a rollback plan for each step.",
    explanation:
      'Zero-downtime migrations depend on backward-compatible steps, batched backfills and lock-aware DDL. Advanced candidates know which operations lock or rewrite tables.',
    tips: ['Explain expand and contract.', 'Mention batched backfills and lock_timeout.', 'Name concurrent index creation and NOT VALID constraints.'],
    commonMistakes: ['Renaming or dropping a column in the same release as the code change.', 'Running a single huge UPDATE on millions of rows.'],
    followUpQuestions: ['How would you change a column type from INT to BIGINT on a huge table?', 'How do you test a migration before running it in production?'],
  },
  'db-040': {
    question: 'How would you design the database for a multi-tenant SaaS application?',
    intent: 'The interviewer evaluates advanced architecture skills balancing isolation, cost and operations.',
    expectedAnswer:
      'There are three main models. A shared schema stores all tenants in the same tables with a tenant_id column: it is the cheapest and simplest to operate and migrate, but every query must filter by tenant, and one large tenant can affect others. In PostgreSQL, row-level security policies can enforce the tenant filter in the database as a safety net, and composite indexes should start with tenant_id. A schema per tenant gives stronger separation and easier per-tenant export or restore, but migrations must run on many schemas and the number of objects grows quickly. A database per tenant gives the strongest isolation, per-tenant tuning and data residency, which large or regulated customers may require, at the highest operational cost. Many products use a hybrid: shared schema for most tenants and dedicated databases for enterprise customers, with a routing layer that maps tenants to databases. I would also plan tenant-aware backups and deletion for privacy requests, noisy-neighbour protection such as per-tenant rate limits, and sharding by tenant if the shared database grows too large.',
    explanation:
      'Multi-tenancy is a trade-off between isolation and cost. Advanced answers include enforcement mechanisms such as row-level security and plan for growth and compliance.',
    tips: ['Compare the three models.', 'Mention row-level security and tenant-first indexes.', 'Cover compliance, deletion and noisy neighbours.'],
    commonMistakes: ['Relying only on application code to filter tenants.', 'Choosing database-per-tenant for thousands of small tenants.'],
    followUpQuestions: ['How would you move a tenant from the shared database to a dedicated one?', 'How do you run migrations across many tenant schemas?'],
  },
};
