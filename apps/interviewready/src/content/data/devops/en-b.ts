import type { QuestionText, TextTable } from '@/types/content';

/** DevOps questions 023-045: Git (part), cloud, monitoring, security. */
export const enB: TextTable<QuestionText> = {
  'ops-023': {
    question: 'Compare GitFlow and trunk-based development.',
    intent: 'The interviewer checks knowledge of branching strategies and how they affect delivery speed and teamwork.',
    expectedAnswer:
      'GitFlow uses long-lived branches: main for released code, develop for integration, plus feature, release and hotfix branches. It suits products with scheduled releases and several supported versions, but branches live for a long time, merges are larger and integration problems appear late. Trunk-based development keeps one main branch; developers merge small changes at least daily, using short-lived branches and pull requests or committing directly, and incomplete features are hidden behind feature flags. It enables continuous integration and delivery, smaller reviews and fewer merge conflicts, but requires good automated tests and discipline. Most teams practising continuous delivery prefer trunk-based development, sometimes with release branches when they must support older versions.',
    explanation:
      'The key difference is branch lifetime. Short-lived branches mean earlier integration and fewer painful merges.',
    tips: ['Describe the branches of each model.', 'Link trunk-based development to feature flags and CI.'],
    commonMistakes: ['Keeping feature branches open for weeks and calling it continuous integration.'],
    followUpQuestions: ['How do feature flags support trunk-based development?', 'When would GitFlow still make sense?'],
  },
  'ops-024': {
    question: 'How do you handle merge conflicts and write good commits?',
    intent: 'The interviewer checks everyday collaboration habits with Git.',
    expectedAnswer:
      'To reduce conflicts, I keep branches short-lived, pull or rebase from main regularly and avoid large unrelated changes such as mass reformatting mixed with features. When a conflict happens, I read both sides to understand the intent of each change, not just pick one, resolve it, run the tests and, if the conflict is in code I do not know well, ask the other author. For commits, I make small, focused commits that each do one thing and keep the build working, with a clear message: a short summary in the imperative mood, such as "Fix rounding in invoice totals", and a body explaining why when it is not obvious. Many teams follow Conventional Commits, such as feat: or fix:, which also enables automatic changelogs and versioning.',
    explanation:
      'Good history helps reviews, debugging with git bisect and reverting changes safely. Understanding both sides of a conflict prevents lost work.',
    tips: ['Explain how you resolve conflicts safely.', 'Give an example of a good commit message.'],
    commonMistakes: ['Resolving conflicts by always choosing "ours" without reading the other change.', 'Commit messages such as "fix" or "wip" on shared branches.'],
    followUpQuestions: ['What are Conventional Commits?', 'How do you split a large change into reviewable commits?'],
  },
  'ops-025': {
    question: 'How do you undo changes in Git? Explain revert, reset and reflog.',
    intent: 'The interviewer checks the ability to recover from mistakes safely.',
    expectedAnswer:
      'git revert creates a new commit that undoes the changes of a previous commit; history is preserved, so it is the safe choice on shared branches such as main. git reset moves the current branch pointer to another commit: with --soft the undone changes stay staged, with --mixed, the default, they stay in the working directory, and with --hard they are discarded. Reset rewrites history and should be used only on local or private branches. git restore discards uncommitted changes in files. git reflog records where HEAD and branches pointed recently, even after resets or rebases, so you can find a "lost" commit and recover it with git reset or git branch. Commits are rarely truly lost until garbage collection removes unreachable objects, usually after weeks.',
    explanation:
      'Revert for shared history, reset for local history, reflog to recover. This knowledge turns Git mistakes into minor incidents.',
    tips: ['Contrast revert and reset by their effect on shared history.', 'Mention reflog for recovery.'],
    commonMistakes: ['Using git reset --hard on a shared branch and force-pushing.', 'Thinking a reset commit is lost forever.'],
    followUpQuestions: ['How would you undo a merge commit?', 'What does git push --force-with-lease protect against?'],
  },
  'ops-026': {
    question: 'What are the pros and cons of a monorepo compared with multiple repositories?',
    intent: 'The interviewer checks architectural judgment about code organisation at team scale.',
    expectedAnswer:
      'A monorepo holds many projects in one repository. Advantages: shared code and tooling are easy to reuse, a change across several projects can be made atomically in one pull request, dependency versions can be kept consistent and refactoring across boundaries is simpler. Disadvantages: the repository can become large and slow without suitable tools, CI must be smart enough to build only what changed, access control is coarser, and shared files such as lockfiles or root configurations become points of contention between teams. Multiple repositories, or polyrepo, give strong isolation, independent permissions and simple CI per repository, but sharing code requires publishing packages, coordinated changes across repositories are harder and versions drift. The choice depends on team size, how tightly the projects are coupled and the tooling the organisation can support, such as Nx, Turborepo or Bazel for monorepos.',
    explanation:
      'Neither approach is universally better; the trade-off is coordination ease versus isolation, and it depends heavily on tooling.',
    tips: ['Give advantages and disadvantages of both.', 'Mention tooling and shared file ownership.'],
    commonMistakes: ['Choosing a monorepo without tooling for affected builds.', 'Splitting tightly coupled code into many repositories.'],
    followUpQuestions: ['How do you keep CI fast in a monorepo?', 'How do you manage ownership of code in a monorepo?'],
  },
  'ops-027': {
    question: 'Someone committed a secret, such as an API key, and pushed it to a shared repository. What do you do?',
    intent: 'The interviewer assesses advanced incident response, Git history knowledge and security priorities.',
    expectedAnswer:
      'The first priority is to treat the secret as compromised, because it may already have been copied by bots that scan public repositories within minutes, or by anyone with access. I would immediately revoke or rotate the credential at the provider and replace it in the systems that use it, then check the provider\'s logs for unauthorised use during the exposure window. Removing the secret from the latest commit is not enough, since it remains in history. If needed, for example for a public repository, I would rewrite history with git filter-repo or BFG to remove it, force-push in coordination with the team, ask everyone to re-clone or reset, and ask the hosting platform to clear cached views and pull request references. I would document the incident and its impact. To prevent recurrence, I would add secret scanning in pre-commit hooks and CI, such as gitleaks or the platform\'s push protection, move secrets to a vault or CI variables, and add patterns to .gitignore for local configuration files.',
    explanation:
      'Rotation comes first; history cleaning is secondary. Advanced candidates know that a deleted commit does not remove exposure and add preventive controls.',
    tips: ['Start with revoking and rotating the secret.', 'Explain why deleting the file is not enough.', 'Add prevention measures.'],
    commonMistakes: ['Only deleting the file in a new commit.', 'Rewriting history before rotating the credential.'],
    followUpQuestions: ['How does push protection for secrets work?', 'How would you check whether the key was used by an attacker?'],
  },
  'ops-028': {
    question: 'What are IaaS, PaaS, SaaS and serverless?',
    intent: 'The interviewer checks basic cloud service models and responsibilities.',
    expectedAnswer:
      'They describe how much the provider manages. With Infrastructure as a Service, such as virtual machines on AWS EC2 or Azure VMs, the provider manages hardware and virtualisation, and you manage the operating system, runtime and application. With Platform as a Service, such as Heroku, Google App Engine or managed databases, you deploy code or use a service and the provider manages servers, patching and scaling. With Software as a Service, such as Gmail or Salesforce, you simply use a finished application. Serverless, such as AWS Lambda or Cloud Functions, runs your code in response to events, scales automatically, including to zero, and bills per execution. The more the provider manages, the less control you have but the less operational work you do. Security follows a shared responsibility model.',
    explanation:
      'Each model shifts responsibilities between you and the provider. Understanding this helps choose services and assign security duties.',
    tips: ['Give one example per model.', 'Mention the shared responsibility model.'],
    commonMistakes: ['Thinking the cloud provider is responsible for all security.'],
    followUpQuestions: ['What are the drawbacks of serverless functions?', 'What is a cold start?'],
  },
  'ops-029': {
    question: 'What are regions and availability zones, and how do you design for high availability?',
    intent: 'The interviewer checks fundamental cloud resilience concepts.',
    expectedAnswer:
      'A region is a geographic area, such as Frankfurt or Virginia, containing several availability zones. An availability zone is one or more data centres with independent power, cooling and network, close enough for low latency between zones. To make an application highly available, I would run several instances spread across at least two or three zones behind a load balancer, use managed databases with a standby replica in another zone and automatic failover, and store files in services that replicate across zones, such as object storage. The application should be stateless, keeping sessions in a shared store, so any instance can serve any request. Deploying across regions protects against a full regional outage but is much more complex and costly, so it is reserved for critical systems.',
    explanation:
      'Spreading resources across zones protects against data-centre failures at modest cost. Multi-region is a bigger investment justified by business needs.',
    tips: ['Explain regions versus zones.', 'Mention load balancers, stateless instances and database failover.'],
    commonMistakes: ['Running all instances in a single zone.', 'Keeping user sessions in the memory of one server.'],
    followUpQuestions: ['What is the difference between high availability and disaster recovery?', 'How does database failover work?'],
  },
  'ops-030': {
    question: 'How would you design a scalable web application on a cloud platform?',
    intent: 'The interviewer checks system design using common cloud building blocks.',
    expectedAnswer:
      'I would put a CDN in front to serve static assets and cache content close to users, then a load balancer distributing traffic to stateless application instances, in containers or on a managed platform, running in several availability zones with autoscaling based on load. Data would live in a managed relational database with a standby and read replicas, plus a cache such as Redis for frequent reads and sessions. Files would go to object storage such as S3. Slow or bursty work, such as sending e-mails or generating reports, would be processed asynchronously through a queue with worker instances. Secrets would come from a secrets manager, infrastructure would be defined as code, and logs, metrics and traces would be centralised with alerts. I would start simple and add components such as queues or replicas only when traffic or requirements justify them, and estimate costs early.',
    explanation:
      'Stateless compute, managed data services, caching, queues and observability are the standard building blocks of scalable cloud architectures.',
    tips: ['Describe the request path from user to database.', 'Mention asynchronous processing.', 'Show restraint about complexity.'],
    commonMistakes: ['Designing for massive scale on day one without need.', 'Keeping state on application servers.'],
    followUpQuestions: ['How would you handle a sudden traffic spike ten times normal?', 'Where would you put rate limiting?'],
  },
  'ops-031': {
    question: 'What is Infrastructure as Code, and how does Terraform work?',
    intent: 'The interviewer checks modern infrastructure practices and tool knowledge.',
    expectedAnswer:
      'Infrastructure as Code means defining servers, networks, databases and permissions in versioned files instead of creating them manually in a console. Changes are reviewed in pull requests, reproducible across environments and documented by the code itself. Terraform is a declarative tool: you describe the desired resources in HCL, terraform plan compares them with the current state and shows what will be created, changed or destroyed, and terraform apply makes the changes through provider APIs. Terraform keeps a state file mapping your configuration to real resources; in a team, it must be stored remotely, for example in an S3 bucket or Terraform Cloud, with locking to prevent concurrent changes, and it may contain sensitive values. Modules package reusable infrastructure, and separate state per environment limits the impact of mistakes. OpenTofu is an open-source fork with the same model.',
    explanation:
      'IaC brings software practices to infrastructure. Understanding plan, apply and state management is essential to use Terraform safely.',
    tips: ['Explain plan and apply.', 'Insist on remote state with locking.', 'Mention modules and environment separation.'],
    commonMistakes: ['Committing the state file to Git.', 'Making manual console changes that drift from the code.'],
    followUpQuestions: ['How do you handle drift between Terraform and reality?', 'How would you import an existing resource?'],
  },
  'ops-032': {
    question: 'How would you reduce the cloud costs of a system without hurting reliability?',
    intent: 'The interviewer evaluates advanced cost awareness, a key responsibility in cloud environments.',
    expectedAnswer:
      'I would start with visibility: tag resources by team, service and environment so costs can be attributed, and review the biggest items, which usually account for most of the bill. Common savings: right-size instances and container requests based on actual usage; turn off or scale down non-production environments outside working hours; delete unused resources such as idle load balancers, orphaned disks, old snapshots and forgotten test environments; use autoscaling so capacity follows demand; commit to steady baseline usage with reserved instances or savings plans, and use spot or preemptible instances for fault-tolerant workloads such as batch jobs or CI runners; move rarely accessed data to cheaper storage tiers with lifecycle policies; reduce data transfer costs, which are often overlooked, by keeping traffic within a zone or region and using a CDN; and review logging and monitoring retention, which can be surprisingly expensive. I would set budgets and anomaly alerts, and make cost a metric that teams see, following FinOps practices. Every change should be checked against reliability goals: for example, I would not remove cross-zone redundancy from a critical database to save money.',
    explanation:
      'Cost optimisation is continuous and data-driven. Advanced candidates know the less obvious cost drivers, such as data transfer and observability, and balance savings against reliability.',
    tips: ['Start with tagging and visibility.', 'List several concrete levers.', 'Explain how you protect reliability.'],
    commonMistakes: ['Cutting redundancy on critical systems to save money.', 'Optimising small items while ignoring the largest costs.'],
    followUpQuestions: ['What is FinOps?', 'When are spot instances a bad idea?'],
  },
  'ops-033': {
    question: 'How would you design disaster recovery for a critical application? Explain RPO and RTO.',
    intent: 'The interviewer assesses advanced resilience planning and its link to business requirements.',
    expectedAnswer:
      'Recovery Point Objective, RPO, is the maximum acceptable data loss measured in time, for example 5 minutes of transactions. Recovery Time Objective, RTO, is the maximum acceptable time to restore service, for example one hour. Both come from the business, based on the cost of downtime and data loss, and drive the design. Strategies range from cheapest to most expensive: backup and restore, with regular backups copied to another region, gives an RPO of hours and an RTO of hours; pilot light keeps a minimal copy of the infrastructure and replicated data in a second region, ready to scale up; warm standby runs a smaller but working copy; and active-active runs full capacity in several regions with near-zero RPO and RTO, at high cost and complexity, especially for data consistency. Whatever the strategy, backups must be automated, encrypted, stored separately and immutable to resist ransomware or accidental deletion, and the infrastructure must be reproducible with Infrastructure as Code. Most importantly, the plan must be tested regularly with restore tests and failover exercises, because an untested backup is not a backup. Runbooks, clear decision authority for declaring a disaster and DNS or traffic failover procedures complete the plan.',
    explanation:
      'RPO and RTO translate business needs into technical choices. Advanced candidates insist on regular testing and immutable backups.',
    tips: ['Define RPO and RTO with examples.', 'Compare DR strategies by cost.', 'Insist on testing restores.'],
    commonMistakes: ['Having backups that were never restored in a test.', 'Storing backups in the same account and region as production.'],
    followUpQuestions: ['How often would you test failover?', 'How do you handle data consistency in an active-active setup?'],
  },
  'ops-034': {
    question: 'What is the difference between logs, metrics and traces?',
    intent: 'The interviewer checks basic observability concepts.',
    expectedAnswer:
      'Logs are timestamped records of events, such as an error with a stack trace or a user login; they give rich detail about individual events. Metrics are numeric measurements aggregated over time, such as requests per second, error rate, latency percentiles or memory use; they are cheap to store and ideal for dashboards and alerts. Traces follow a single request as it travels through several services, showing each step, called a span, and how long it took, which helps find where time is spent or where an error started in a distributed system. Together they are the three pillars of observability: metrics tell you something is wrong, traces show where, and logs explain why.',
    explanation:
      'Each signal answers a different question. Using them together speeds up diagnosis.',
    tips: ['Give an example of each signal.', 'Explain how they complement each other.'],
    commonMistakes: ['Relying only on logs for everything.', 'Using averages instead of percentiles for latency.'],
    followUpQuestions: ['Why use p95 or p99 latency rather than averages?', 'What is OpenTelemetry?'],
  },
  'ops-035': {
    question: 'What would you monitor for a web service? Explain the golden signals.',
    intent: 'The interviewer checks the ability to choose meaningful metrics rather than collecting everything.',
    expectedAnswer:
      'I would start with the four golden signals from Google\'s Site Reliability Engineering practices. Latency: how long requests take, measured with percentiles such as p50, p95 and p99, separating successful and failed requests. Traffic: demand on the system, such as requests per second. Errors: the rate of failed requests, including HTTP 5xx and responses that succeed technically but are wrong. Saturation: how full the system is, such as CPU, memory, connection pools, queue lengths or disk. The RED method, rate, errors and duration, applies the same idea to each service, and the USE method, utilisation, saturation and errors, applies it to resources. On top, I would track business metrics, such as orders per minute or sign-ups, which often reveal problems that technical metrics miss, and dependencies such as database and external API latency.',
    explanation:
      'A small set of user-centred metrics detects most problems. Business metrics close the gap between technical health and real impact.',
    tips: ['Name the four golden signals.', 'Mention RED and USE.', 'Add business metrics.'],
    commonMistakes: ['Monitoring only CPU and memory.', 'Using average latency, which hides slow requests.'],
    followUpQuestions: ['Which of these would you alert on?', 'How would you monitor a background job?'],
  },
  'ops-036': {
    question: 'What are structured logging and correlation IDs, and why do they matter?',
    intent: 'The interviewer checks practices that make logs useful in distributed systems.',
    expectedAnswer:
      'Structured logging writes logs as key-value data, usually JSON, instead of free text: for example {"level":"error","event":"payment_failed","orderId":"42","provider":"stripe","durationMs":830}. Log platforms can then filter, aggregate and alert on fields reliably. A correlation or trace ID is a unique identifier assigned when a request enters the system and propagated through every service, message and log line it touches, usually through HTTP headers such as the W3C traceparent header. When a user reports a problem, you can search one ID and see the whole journey across services. OpenTelemetry standardises this propagation and links logs, traces and metrics. Logs should use consistent field names, appropriate levels and never contain secrets or unnecessary personal data.',
    explanation:
      'Structure makes logs queryable; correlation IDs make them followable across services. Both are essential beyond a single application.',
    example: 'logger.info("order_created", { orderId, customerId, totalCents, traceId });',
    tips: ['Show a structured log example.', 'Explain propagation of the ID across services.', 'Mention privacy in logs.'],
    commonMistakes: ['Logging passwords, tokens or full card numbers.', 'Building log messages by string concatenation that cannot be filtered.'],
    followUpQuestions: ['How do you propagate a trace ID through a message queue?', 'How do you control logging costs?'],
  },
  'ops-037': {
    question: 'What makes a good alert, and how do you avoid alert fatigue?',
    intent: 'The interviewer checks operational maturity and empathy for on-call engineers.',
    expectedAnswer:
      'A good alert is actionable: it signals a real or imminent impact on users and requires someone to do something now. It should alert on symptoms, such as a high error rate or latency on a key endpoint, rather than on every possible cause, such as CPU at 80%, which may be harmless. Each alert should include context: which service, the current value and threshold, a link to a dashboard and a runbook explaining first steps. Severity levels separate urgent pages, which wake someone up, from tickets that can wait until working hours. To avoid fatigue, I review alerts regularly, delete or tune those that fire without action, group related alerts, require a condition to last a few minutes before firing to avoid noise from brief spikes, and track how often each alert fires. After incidents, I check whether the alerts detected the problem early enough.',
    explanation:
      'Alerts compete for human attention. Symptom-based, actionable alerts with runbooks protect both reliability and the on-call team.',
    tips: ['Distinguish symptoms from causes.', 'Mention runbooks and severity levels.', 'Explain how you review noisy alerts.'],
    commonMistakes: ['Paging people for non-urgent issues.', 'Having alerts without any documented response.'],
    followUpQuestions: ['What would you put in a runbook?', 'How would you organise an on-call rotation fairly?'],
  },
  'ops-038': {
    question: 'Explain SLIs, SLOs and error budgets, and how they guide decisions.',
    intent: 'The interviewer assesses advanced reliability engineering and its link to product decisions.',
    expectedAnswer:
      'A Service Level Indicator is a measurement of user experience, such as the percentage of requests that succeed and return in under 300 milliseconds. A Service Level Objective is a target for that indicator over a period, for example 99.9% of requests good over 30 days. A Service Level Agreement is a contractual commitment, usually looser than the SLO, with penalties. The error budget is what the SLO allows to fail: 0.1% of requests, or about 43 minutes of full downtime in 30 days. The budget turns reliability into a shared decision tool: while budget remains, teams can ship faster and take risks; when it is being consumed quickly or is exhausted, the agreed policy is to slow down releases and prioritise reliability work. Alerts can be based on burn rate, how fast the budget is being consumed, which detects serious problems quickly and slow degradation over time with fewer false alarms. SLOs should be chosen with product owners based on what users actually need, because 100% is neither achievable nor worth its cost.',
    explanation:
      'SLOs make reliability measurable and negotiable. Error budgets balance feature velocity and stability with data instead of opinions.',
    tips: ['Give precise definitions with numbers.', 'Explain the error budget policy.', 'Mention burn-rate alerting.'],
    commonMistakes: ['Setting 100% as an objective.', 'Defining SLOs on infrastructure metrics instead of user experience.'],
    followUpQuestions: ['How would you choose the right SLO for a new service?', 'What happens when the error budget is exhausted?'],
  },
  'ops-039': {
    question: 'What challenges appear when running observability at large scale, and how do you handle them?',
    intent: 'The interviewer evaluates advanced understanding of observability costs and trade-offs.',
    expectedAnswer:
      'The first challenge is volume and cost: logs, metrics and traces from hundreds of services can cost as much as the infrastructure itself. I would set retention per data type, keep debug logs only briefly, sample traces, for example keeping all errors and slow requests but a small percentage of normal ones with tail-based sampling, and turn verbose logs into metrics where possible. The second is metric cardinality: labels with many unique values, such as user IDs or full URLs, create millions of time series and overload systems like Prometheus, so labels must be bounded and reviewed. The third is consistency: different teams naming things differently makes correlation hard, so I would standardise on OpenTelemetry with shared semantic conventions, common dashboards and service ownership metadata. The fourth is signal versus noise: too many dashboards and alerts that nobody uses, solved by SLO-based alerting and regular clean-ups. Finally, privacy: logs and traces must not contain personal data or secrets, which requires scrubbing at collection time. An internal platform team often provides these standards and pipelines so product teams get good observability by default.',
    explanation:
      'At scale, observability needs governance: sampling, cardinality control, standards and privacy filtering. Advanced candidates treat it as a product with costs.',
    tips: ['Discuss cost and sampling.', 'Explain the cardinality problem.', 'Mention standards and privacy.'],
    commonMistakes: ['Using user IDs as metric labels.', 'Keeping all traces and logs forever.'],
    followUpQuestions: ['What is tail-based sampling?', 'How would you find which service generates the most logging cost?'],
  },
  'ops-040': {
    question: 'What is the principle of least privilege, and how do you apply it?',
    intent: 'The interviewer checks a foundational security principle.',
    expectedAnswer:
      'The principle of least privilege means each user, application or service gets only the permissions it needs to do its job, for only as long as it needs them. For example, a service that reads files from one storage bucket should have read access to that bucket only, not administrator rights on the account; a database user for a reporting tool should be read-only. In practice, I use roles instead of sharing personal accounts, separate accounts or projects for production, give administrators temporary elevated access when needed, review permissions regularly and remove access when people change roles or leave. This limits the damage if an account or credential is compromised.',
    explanation:
      'Least privilege reduces the blast radius of mistakes and attacks. It is a basic expectation in security reviews and audits.',
    tips: ['Give concrete examples for users and services.', 'Mention regular access reviews.'],
    commonMistakes: ['Giving administrator rights to make something work quickly.', 'Sharing a single account among the whole team.'],
    followUpQuestions: ['What is role-based access control?', 'How would you grant temporary access to production?'],
  },
  'ops-041': {
    question: 'How should applications and teams manage secrets?',
    intent: 'The interviewer checks practical handling of credentials, a frequent source of breaches.',
    expectedAnswer:
      'Secrets such as passwords, API keys and certificates must never be stored in source code or committed to Git, even in private repositories. They should live in a dedicated secrets manager, such as HashiCorp Vault, AWS Secrets Manager, Azure Key Vault or Google Secret Manager, which encrypts them, controls access per service and logs who accessed what. Applications receive secrets at runtime, through environment variables injected by the platform, mounted files or direct API calls, and CI/CD pipelines use protected variables. Where possible, I prefer short-lived, automatically issued credentials, such as cloud workload identities or dynamic database credentials, over long-lived keys. Secrets should be rotated regularly and immediately after any suspected exposure, and secret scanning in repositories and pipelines catches mistakes early.',
    explanation:
      'Centralised, audited secret storage and short-lived credentials reduce both the chance and the impact of leaks.',
    tips: ['Name a secrets manager.', 'Prefer short-lived credentials.', 'Mention rotation and scanning.'],
    commonMistakes: ['Hard-coding secrets in configuration files.', 'Printing secrets in logs or error messages.'],
    followUpQuestions: ['How do you rotate a database password without downtime?', 'What is a workload identity?'],
  },
  'ops-042': {
    question: 'Which common web vulnerabilities should every team protect against?',
    intent: 'The interviewer checks awareness of the OWASP Top 10 and basic mitigations.',
    expectedAnswer:
      'The OWASP Top 10 lists the most critical risks. Broken access control, such as a user reading another user\'s order by changing an ID in the URL, is prevented by checking authorisation on the server for every request. Injection, including SQL injection, is prevented with parameterised queries and input validation. Cross-site scripting is prevented by encoding output, using frameworks that escape by default and a Content Security Policy. Cryptographic failures are avoided by using HTTPS everywhere, strong hashing such as bcrypt or Argon2 for passwords and encrypting sensitive data at rest. Security misconfiguration, such as default credentials or verbose error messages, is avoided with hardened defaults and reviews. Vulnerable and outdated components are managed with dependency scanning and regular updates. Other important risks include authentication failures, server-side request forgery and insufficient logging and monitoring. Security testing in CI and code reviews help catch these early.',
    explanation:
      'Most breaches exploit well-known weaknesses. Knowing the main categories and their standard mitigations is expected from any developer or DevOps engineer.',
    tips: ['Give a concrete example and mitigation for each risk.', 'Mention broken access control as the top risk.'],
    commonMistakes: ['Relying on hiding IDs instead of checking permissions.', 'Building SQL queries with string concatenation.'],
    followUpQuestions: ['What is server-side request forgery?', 'How does a Content Security Policy work?'],
  },
  'ops-043': {
    question: 'How does HTTPS work, and what is mutual TLS?',
    intent: 'The interviewer checks understanding of encryption in transit and certificate management.',
    expectedAnswer:
      'HTTPS is HTTP over TLS. During the TLS handshake, the server presents a certificate signed by a trusted certificate authority, proving it owns the domain; the client verifies the certificate chain and the domain name. Client and server then agree on session keys using key exchange, so traffic is encrypted and protected against tampering. TLS 1.3 is the current version and older versions such as TLS 1.0 and 1.1 should be disabled. Certificates expire, so renewal should be automated, for example with Let\'s Encrypt and cert-manager in Kubernetes. Mutual TLS adds client authentication: the client also presents a certificate that the server verifies. It is used for service-to-service communication in zero-trust networks, often handled automatically by a service mesh such as Istio or Linkerd, and for strong authentication of partners or devices.',
    explanation:
      'TLS provides confidentiality, integrity and server authentication; mTLS adds client authentication. Automating certificate renewal prevents a common cause of outages.',
    tips: ['Describe the handshake at a high level.', 'Mention certificate renewal automation.', 'Give a use case for mTLS.'],
    commonMistakes: ['Disabling certificate verification in clients to fix errors.', 'Managing certificate renewals manually.'],
    followUpQuestions: ['What happens when a certificate expires in production?', 'How does a service mesh implement mTLS?'],
  },
  'ops-044': {
    question: 'What does a zero-trust approach mean for cloud infrastructure, and how would you implement it?',
    intent: 'The interviewer assesses advanced security architecture beyond perimeter defences.',
    expectedAnswer:
      'Zero trust means no user, device or service is trusted because of its network location; every request is authenticated, authorised and encrypted, and access is continuously evaluated. The traditional model of a trusted internal network behind a firewall fails once an attacker gets inside, so they can move laterally. To implement it, I would start with strong identity: single sign-on with multi-factor authentication for people, and workload identities, such as cloud IAM roles or SPIFFE identities, for services instead of shared keys. Access is granted per resource with least privilege, and for administrators through just-in-time, time-limited elevation with audit logs. Service-to-service traffic uses mutual TLS with authorisation policies, often through a service mesh, and network segmentation limits which workloads can talk to each other, for example Kubernetes network policies denying traffic by default. Internal applications are exposed through an identity-aware proxy rather than a VPN that grants broad network access. Device posture can be part of the decision. All access is logged centrally and monitored for anomalies. This is a progressive journey: I would start with the most sensitive systems and identities.',
    explanation:
      'Zero trust replaces network location with identity and continuous verification. Advanced answers cover people, services, network segmentation and monitoring, and treat adoption as incremental.',
    tips: ['Contrast with perimeter security.', 'Cover identities for people and workloads.', 'Mention mTLS, segmentation and identity-aware proxies.'],
    commonMistakes: ['Equating zero trust with buying a single product.', 'Leaving flat internal networks where every service can reach every other.'],
    followUpQuestions: ['How would you migrate from a VPN to an identity-aware proxy?', 'What is SPIFFE?'],
  },
  'ops-045': {
    question: 'You discover that credentials for your production cloud account have been leaked. Walk me through your response.',
    intent: 'The interviewer evaluates advanced incident response: containment, investigation, communication and prevention.',
    expectedAnswer:
      'I would treat it as a security incident and follow the organisation\'s response process, involving the security team immediately. Containment comes first: disable or rotate the leaked credentials, revoke active sessions and tokens issued with them, and if there is a risk of ongoing abuse, restrict the affected accounts further. I would preserve evidence rather than delete things in a panic: keep the audit logs, such as CloudTrail or the equivalent, and snapshots of suspicious resources. Then I would investigate the exposure window: what the credentials could access, what actions were performed with them, such as new users, access keys, unusual instances for crypto-mining, changes to security groups or data downloads from storage, and whether the attacker created persistence, such as new IAM users or roles, which must also be removed. Depending on findings, I would restore affected systems from trusted sources. Communication runs in parallel: regular updates to stakeholders, and if personal data may have been accessed, legal and privacy teams must assess notification obligations, which in some jurisdictions have strict deadlines, such as 72 hours under the GDPR. Afterwards, a blameless post-incident review leads to preventive measures: replacing long-lived keys with short-lived federated credentials, multi-factor authentication, secret scanning, least-privilege reviews and alerts on unusual account activity.',
    explanation:
      'A strong answer follows containment, evidence preservation, investigation, eradication, recovery and lessons learned, with communication and legal obligations in mind.',
    tips: ['Start with containment and involve the security team.', 'Explain what you look for in audit logs, including persistence.', 'Mention communication and legal obligations.'],
    commonMistakes: ['Only rotating the key without checking what the attacker did.', 'Deleting logs or resources before investigating.'],
    followUpQuestions: ['How do you detect attacker persistence in a cloud account?', 'Who decides whether customers must be notified?'],
  },
};
