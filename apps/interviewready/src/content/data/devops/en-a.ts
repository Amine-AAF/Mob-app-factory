import type { QuestionText, TextTable } from '@/types/content';

/** DevOps questions 001-022: Docker, Kubernetes, CI/CD, Git (part). */
export const enA: TextTable<QuestionText> = {
  'ops-001': {
    question: 'What is the difference between a container and a virtual machine?',
    intent: 'The interviewer checks a fundamental concept behind modern deployment.',
    expectedAnswer:
      'A virtual machine emulates a full computer: it runs its own operating system kernel on top of a hypervisor, so it is strongly isolated but heavy, taking gigabytes and often minutes to start. A container packages an application with its dependencies but shares the host\'s kernel; isolation comes from kernel features such as namespaces, which separate processes, networks and file systems, and cgroups, which limit CPU and memory. Containers are therefore much lighter, start in seconds and many can run on one machine. The trade-off is weaker isolation than a VM, which is why some platforms run containers inside lightweight VMs for untrusted workloads.',
    explanation:
      'Sharing the kernel is what makes containers light and fast, and also what makes their isolation weaker than VMs.',
    tips: ['Mention the shared kernel, namespaces and cgroups.', 'Compare start-up time and resource use.'],
    commonMistakes: ['Saying containers are small virtual machines.', 'Claiming containers are as isolated as VMs.'],
    followUpQuestions: ['Can you run a Windows container on a Linux host?', 'What are cgroups used for?'],
  },
  'ops-002': {
    question: 'What is the difference between a Docker image and a container, and what is a Dockerfile?',
    intent: 'The interviewer checks basic Docker vocabulary and workflow.',
    expectedAnswer:
      'A Docker image is a read-only template made of layers: a base operating system, the runtime, dependencies and the application. A container is a running instance of an image, with its own writable layer, process and network; you can start many containers from the same image. A Dockerfile is the recipe used to build an image: instructions such as FROM to choose a base image, COPY to add files, RUN to execute commands at build time, EXPOSE to document ports and CMD or ENTRYPOINT to define the command run when the container starts. You build with docker build, then run with docker run, and push the image to a registry so other environments can use it.',
    explanation:
      'Images are built once and run anywhere; containers are disposable instances. This separation makes deployments reproducible.',
    example: 'FROM eclipse-temurin:21-jre\nCOPY target/app.jar /app/app.jar\nCMD ["java", "-jar", "/app/app.jar"]',
    tips: ['Use the class and instance analogy.', 'Name the main Dockerfile instructions.'],
    commonMistakes: ['Storing important data inside the container\'s writable layer.', 'Confusing RUN and CMD.'],
    followUpQuestions: ['What is a container registry?', 'Why are images built in layers?'],
  },
  'ops-003': {
    question: 'What are good practices for writing a Dockerfile?',
    intent: 'The interviewer checks whether you build images that are small, fast to build and secure.',
    expectedAnswer:
      'I order instructions to use the layer cache: copy dependency files, such as package.json or pom.xml, and install dependencies before copying the source code, so changing code does not reinstall everything. I use a small, official base image with a fixed version tag, such as a slim or distroless image, instead of latest. A .dockerignore file keeps unnecessary files, such as .git, node_modules or local secrets, out of the build context. I combine related RUN commands and clean package manager caches in the same layer. The process runs as a non-root user. Secrets are never copied into the image or passed as build arguments that remain in the history; build secrets are mounted with BuildKit when needed. I use multi-stage builds so build tools are not in the final image, and I add a HEALTHCHECK or rely on the orchestrator\'s probes.',
    explanation:
      'Good Dockerfiles produce small, reproducible and secure images, and rebuild quickly thanks to the cache.',
    tips: ['Explain cache-friendly ordering.', 'Mention pinned versions, non-root and .dockerignore.'],
    commonMistakes: ['Using the latest tag in production.', 'Copying the whole repository before installing dependencies.', 'Baking secrets into images.'],
    followUpQuestions: ['How would you scan an image for vulnerabilities?', 'What is a distroless image?'],
  },
  'ops-004': {
    question: 'What is a multi-stage Docker build, and why use one?',
    intent: 'The interviewer checks a key technique for producing lean production images.',
    expectedAnswer:
      'A multi-stage build uses several FROM instructions in one Dockerfile. An early stage has everything needed to build the application, such as a JDK, Maven or Node with development dependencies, and produces artefacts like a jar or compiled assets. The final stage starts from a minimal runtime image and copies only those artefacts with COPY --from=build. The result is a much smaller image with fewer packages, which means faster pulls, a smaller attack surface and fewer vulnerabilities reported by scanners. It also keeps the build reproducible inside Docker, without requiring tools on the CI machine.',
    explanation:
      'Separating build-time and run-time dependencies is the main reason images can shrink from gigabytes to tens of megabytes.',
    example: 'FROM node:22 AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM nginx:1.27-alpine\nCOPY --from=build /app/dist /usr/share/nginx/html',
    tips: ['Explain what goes in each stage.', 'Mention size and security benefits.'],
    commonMistakes: ['Shipping compilers and test dependencies in the production image.'],
    followUpQuestions: ['How do you cache dependencies between builds in CI?', 'Can you target a specific stage when building?'],
  },
  'ops-005': {
    question: 'How do containers communicate with each other and persist data? What is Docker Compose for?',
    intent: 'The interviewer checks practical knowledge of running multi-container applications locally.',
    expectedAnswer:
      'Containers on the same user-defined Docker network can reach each other by container or service name, thanks to Docker\'s internal DNS, so an API container connects to a database at db:5432 rather than an IP address. Ports are published to the host only when needed, with -p 8080:80. Containers are ephemeral, so data that must survive restarts goes into volumes, managed by Docker, or bind mounts, which map a host directory and are useful for development. Docker Compose describes a multi-container application in a YAML file: services, images or builds, environment variables, networks, volumes, dependencies and health checks. docker compose up starts the whole stack, which makes local development and integration tests reproducible. depends_on with a health condition helps wait until the database is ready.',
    explanation:
      'Networks provide service discovery, volumes provide persistence, and Compose ties everything together for local environments.',
    tips: ['Mention DNS by service name.', 'Distinguish volumes and bind mounts.', 'Explain readiness with health checks.'],
    commonMistakes: ['Storing database data without a volume.', 'Hard-coding container IP addresses.'],
    followUpQuestions: ['Why is depends_on alone not enough to wait for a database?', 'Would you use Compose in production?'],
  },
  'ops-006': {
    question: 'How do you secure containers and container images?',
    intent: 'The interviewer assesses advanced security practices across the container lifecycle.',
    expectedAnswer:
      'I think about security at build, distribution and run time. At build time: minimal base images such as distroless or Alpine-based ones, pinned versions or digests, multi-stage builds, no secrets in layers, and automated vulnerability scanning with tools such as Trivy or Grype in CI, failing the build on critical issues with a process to update base images regularly. For distribution: a private registry with access control, image signing with Sigstore cosign and verification at deployment, plus a software bill of materials to know what each image contains. At run time: run as a non-root user, use a read-only root file system, drop Linux capabilities, never use privileged mode, apply seccomp or AppArmor profiles, set resource limits to avoid denial of service, and restrict network traffic between workloads with network policies. In Kubernetes, Pod Security Standards and admission controllers such as Kyverno or OPA Gatekeeper enforce these rules automatically. Finally, runtime monitoring, for example with Falco, detects suspicious behaviour such as a shell spawning in a container.',
    explanation:
      'Container security is layered: reduce what is in the image, control where it comes from and restrict what it can do when running. Advanced candidates mention enforcement mechanisms, not just good intentions.',
    tips: ['Structure the answer by build, distribution and runtime.', 'Mention scanning, signing and SBOMs.', 'Name enforcement tools for Kubernetes.'],
    commonMistakes: ['Running containers as root with privileged mode.', 'Scanning images once and never updating base images.'],
    followUpQuestions: ['What is an SBOM?', 'How would you handle a critical vulnerability in a base image used by 50 services?'],
  },
  'ops-007': {
    question: 'A container works on your machine but keeps crashing in production. How do you investigate?',
    intent: 'The interviewer evaluates advanced troubleshooting of environment differences in containerised applications.',
    expectedAnswer:
      'I would first collect evidence: the container logs, its exit code and the orchestrator events, for example kubectl describe pod and kubectl logs --previous. The exit code is a strong clue: 137 usually means the process was killed, often OOMKilled because it exceeded its memory limit, while 1 usually means an application error. Common causes of differences include configuration and secrets missing or different in production; memory limits lower than on a laptop, especially for the JVM or Node if heap settings are not container-aware; a different CPU architecture, such as an image built for ARM on a laptop and run on x86 servers; network rules preventing access to a database or external API; file system differences, such as a read-only root file system or missing write permissions for a non-root user; and timing, such as a liveness probe killing a slow-starting application. Signal handling also matters: if the application runs as a child of a shell, it may not receive SIGTERM and gets killed abruptly. To reproduce, I would run the exact production image with the same environment variables, limits and user locally or in a staging environment. Then I would fix the root cause and add the missing check to the pipeline or the deployment configuration.',
    explanation:
      'Exit codes, events and environment differences guide the diagnosis. Advanced answers cover memory limits, architecture, permissions, probes and signals.',
    tips: ['Start with logs, exit code and events.', 'List the classic environment differences.', 'Reproduce with the exact production image and settings.'],
    commonMistakes: ['Rebuilding the image locally instead of testing the exact production image.', 'Increasing limits blindly without understanding the cause.'],
    followUpQuestions: ['What does exit code 137 mean?', 'How do you make sure an application shuts down gracefully in a container?'],
  },
  'ops-008': {
    question: 'What is Kubernetes, and what are pods, deployments and services?',
    intent: 'The interviewer checks the basic Kubernetes vocabulary needed to work with clusters.',
    expectedAnswer:
      'Kubernetes is a container orchestration platform: you describe the desired state of your application in YAML, and controllers continuously work to make the cluster match it, restarting failed containers, scheduling workloads on nodes and scaling. A pod is the smallest deployable unit: one or more containers that share a network address and storage and are scheduled together. Pods are ephemeral and get new IP addresses when recreated. A deployment manages a set of identical pods through a ReplicaSet, keeps the requested number running and handles rolling updates and rollbacks. A service gives a stable name and IP address in front of a changing set of pods selected by labels, and load-balances traffic between them.',
    explanation:
      'The declarative desired-state model and the separation between pods, deployments and services are the foundation of Kubernetes.',
    tips: ['Explain the desired-state model.', 'Say why services are needed when pods change.'],
    commonMistakes: ['Creating bare pods instead of deployments for applications.', 'Thinking a pod always has exactly one container.'],
    followUpQuestions: ['What is a namespace?', 'When would you use a StatefulSet?'],
  },
  'ops-009': {
    question: 'How does a rolling update work in Kubernetes, and how do you roll back?',
    intent: 'The interviewer checks safe deployment knowledge on Kubernetes.',
    expectedAnswer:
      'When you change a deployment\'s pod template, for example a new image tag, Kubernetes creates a new ReplicaSet and gradually replaces old pods with new ones. maxSurge controls how many extra pods may be created above the desired count, and maxUnavailable how many may be unavailable during the update. New pods receive traffic only once their readiness probe passes, so a broken version stops the rollout instead of replacing everything. You can follow progress with kubectl rollout status and roll back with kubectl rollout undo, which returns to the previous ReplicaSet. For a smooth update, the application must handle graceful shutdown on SIGTERM, the old and new versions must be compatible with the same database schema, and readiness probes must be meaningful.',
    explanation:
      'Rolling updates are safe only with good readiness probes, graceful shutdown and backward-compatible changes.',
    tips: ['Explain maxSurge and maxUnavailable.', 'Stress the role of readiness probes.', 'Mention rollback commands.'],
    commonMistakes: ['Using the same image tag for different versions, so Kubernetes does not detect a change.', 'Deploying a schema change incompatible with the old version.'],
    followUpQuestions: ['How would you implement a canary release on Kubernetes?', 'What happens to in-flight requests during an update?'],
  },
  'ops-010': {
    question: 'What are the types of Kubernetes services, and what is an Ingress?',
    intent: 'The interviewer checks how traffic reaches applications inside and outside the cluster.',
    expectedAnswer:
      'A ClusterIP service, the default, exposes pods on an internal IP reachable only inside the cluster; it is used for communication between services. A NodePort service opens a port on every node, mostly useful for testing. A LoadBalancer service asks the cloud provider to create an external load balancer pointing to the service. An ExternalName service maps a name to an external DNS name. An Ingress is a set of HTTP routing rules, such as routing api.example.com/orders to the orders service, handled by an ingress controller such as NGINX or a cloud load balancer; it also terminates TLS, so one external entry point can serve many services. The newer Gateway API is a more expressive successor to Ingress, with clearer roles for platform and application teams.',
    explanation:
      'Services provide stable access to pods; Ingress or Gateway API provides HTTP routing and TLS from outside the cluster.',
    tips: ['Describe each service type with a use case.', 'Explain the role of the ingress controller.'],
    commonMistakes: ['Creating a LoadBalancer service for every application, which multiplies cloud costs.'],
    followUpQuestions: ['How would you manage TLS certificates automatically?', 'What is the Gateway API?'],
  },
  'ops-011': {
    question: 'What is the difference between liveness, readiness and startup probes?',
    intent: 'The interviewer checks correct health-check configuration, a frequent cause of outages.',
    expectedAnswer:
      'A readiness probe tells Kubernetes whether a pod can receive traffic; if it fails, the pod is removed from service endpoints but not restarted, which is useful during start-up or when a dependency is temporarily unavailable. A liveness probe tells Kubernetes whether the container is healthy; if it fails repeatedly, the container is restarted, which helps recover from deadlocks. A startup probe protects slow-starting applications: liveness and readiness checks are disabled until it succeeds, so the application is not killed while still starting. A common mistake is making the liveness probe depend on external systems such as the database: if the database goes down, every pod restarts in a loop and the outage gets worse. Liveness should check only the process itself, while readiness can reflect whether the instance is able to serve.',
    explanation:
      'Probes have different consequences: removal from traffic versus restart. Misconfigured liveness probes can turn a small incident into a cascading failure.',
    tips: ['State what happens when each probe fails.', 'Warn about liveness probes depending on external systems.'],
    commonMistakes: ['Using the same endpoint and settings for liveness and readiness.', 'Setting liveness timeouts shorter than the application start time.'],
    followUpQuestions: ['What would a good readiness endpoint check?', 'How do probes interact with rolling updates?'],
  },
  'ops-012': {
    question: 'A pod is in CrashLoopBackOff. How do you troubleshoot it?',
    intent: 'The interviewer assesses advanced, hands-on Kubernetes troubleshooting.',
    expectedAnswer:
      'CrashLoopBackOff means the container starts, exits and is restarted with increasing delays. I would run kubectl describe pod to see events, the last state, the exit code and the reason, such as OOMKilled or Error, and kubectl logs --previous to read the output of the crashed container, since the current one may have no logs yet. Typical causes: the application fails at start-up because of missing configuration, a missing secret or ConfigMap key, or a dependency it cannot reach, such as a database host name; the memory limit is too low; the command or entrypoint is wrong; file permissions fail for a non-root user; or a liveness probe kills the container before it finishes starting. If the image exits too quickly to inspect, I can temporarily override the command to keep it running or use kubectl debug with an ephemeral container to investigate the environment, network and mounted files. I would also check whether the problem started with a new deployment and roll back if users are affected, then fix the root cause and add validation, for example checking required configuration at start-up with a clear error message.',
    explanation:
      'The method is: events and exit code, previous logs, then environment checks with debug tools. Mitigation by rollback comes before deep investigation if users are affected.',
    tips: ['Mention describe, logs --previous and exit codes.', 'List common start-up causes.', 'Use kubectl debug or a command override to inspect.'],
    commonMistakes: ['Reading only current logs, which are empty.', 'Deleting the pod repeatedly hoping it will work.'],
    followUpQuestions: ['What is an ephemeral container?', 'How do you validate configuration before deployment?'],
  },
  'ops-013': {
    question: 'How do resource requests, limits and autoscaling work in Kubernetes?',
    intent: 'The interviewer checks advanced capacity management and its effect on stability and cost.',
    expectedAnswer:
      'A request is the amount of CPU and memory a container is guaranteed; the scheduler uses requests to decide which node a pod fits on. A limit is the maximum the container can use. Exceeding the CPU limit causes throttling, which slows the application; exceeding the memory limit gets the container killed with OOMKilled. Pods whose requests equal their limits get the Guaranteed quality of service class and are evicted last under node pressure. Many teams set memory requests equal to limits for predictability and are careful with CPU limits, since throttling can hurt latency. The Horizontal Pod Autoscaler adds or removes pod replicas based on metrics such as CPU utilisation relative to requests, or custom metrics like queue length or requests per second; KEDA extends this to event sources and scaling to zero. The Vertical Pod Autoscaler recommends or adjusts requests. The Cluster Autoscaler or Karpenter adds nodes when pods cannot be scheduled. Requests should be based on observed usage: too low causes overcommitted nodes and instability, too high wastes money.',
    explanation:
      'Requests drive scheduling, limits drive enforcement, and autoscalers adjust replicas and nodes. Advanced candidates understand throttling, QoS and data-driven sizing.',
    tips: ['Distinguish requests and limits clearly.', 'Explain CPU throttling versus memory OOM.', 'Name the different autoscalers and their roles.'],
    commonMistakes: ['Setting no requests, so the scheduler overloads nodes.', 'Autoscaling on CPU for an I/O-bound service.'],
    followUpQuestions: ['Why can CPU limits increase latency?', 'Which metric would you scale a queue consumer on?'],
  },
  'ops-014': {
    question: 'How would you manage configuration, secrets and deployments across several Kubernetes environments?',
    intent: 'The interviewer evaluates advanced platform design: GitOps, secret handling and environment consistency.',
    expectedAnswer:
      'I would keep all manifests in Git as the single source of truth and use a GitOps tool such as Argo CD or Flux to apply them, so the cluster continuously converges to what is in the repository, every change is reviewed and auditable and rollback is a Git revert. To avoid duplicating YAML, I would use Helm charts or Kustomize overlays: a common base with small, explicit differences per environment, such as replica counts, resource sizes and endpoints. Non-sensitive configuration goes into ConfigMaps. Secrets must not be stored in plain text in Git; Kubernetes Secrets are only base64-encoded by default, so I would use an external secret store, such as a cloud secrets manager or Vault, synchronised with the External Secrets Operator, or encrypt secrets in Git with Sealed Secrets or SOPS. I would also enable encryption at rest for Secrets in the cluster and restrict access with RBAC. Promotion between environments would happen by updating image tags through pull requests, ideally automated from CI, with policy checks and, for production, approval gates. This makes environments reproducible and drift visible.',
    explanation:
      'GitOps provides auditability and rollback, templating keeps environments consistent, and external secret management avoids leaking credentials. These are core practices of mature platforms.',
    tips: ['Explain GitOps and its benefits.', 'Say why base64 Secrets are not encryption.', 'Describe promotion between environments.'],
    commonMistakes: ['Applying manifests manually with kubectl in production.', 'Committing secrets to the repository.'],
    followUpQuestions: ['How do you detect drift between Git and the cluster?', 'Helm or Kustomize: how would you choose?'],
  },
  'ops-015': {
    question: 'What is the difference between continuous integration, continuous delivery and continuous deployment?',
    intent: 'The interviewer checks a basic DevOps concept and its precise vocabulary.',
    expectedAnswer:
      'Continuous integration means developers merge small changes into the main branch frequently, and each change is automatically built and tested, so integration problems are found quickly. Continuous delivery extends this: every change that passes the pipeline produces a release-ready artefact that can be deployed to production at any time, usually with a manual approval step. Continuous deployment goes one step further: every change that passes all checks is deployed to production automatically, without manual approval. The goal of all three is small, frequent, low-risk changes and fast feedback.',
    explanation:
      'The difference between delivery and deployment is the manual approval before production.',
    tips: ['Explain the difference between delivery and deployment clearly.', 'Mention small, frequent changes.'],
    commonMistakes: ['Using continuous delivery and continuous deployment as synonyms.'],
    followUpQuestions: ['What prerequisites are needed for continuous deployment?', 'How do feature flags help?'],
  },
  'ops-016': {
    question: 'What stages would you include in a good CI/CD pipeline?',
    intent: 'The interviewer checks practical pipeline design and quality gates.',
    expectedAnswer:
      'A typical pipeline starts with fast checks so developers get feedback quickly: installation with cached dependencies, linting, formatting and type checking, then unit tests. Next come the build of the artefact or container image, integration tests, for example with a real database in a container, and security checks such as dependency and image vulnerability scanning and secret detection. The artefact is built once, versioned and stored in a registry, then promoted through environments rather than rebuilt for each one. Deployment to a test or staging environment is followed by smoke tests or end-to-end tests on critical paths. Production deployment uses a safe strategy, such as rolling or canary, with automatic rollback if health checks fail. Throughout, the pipeline should be defined as code, fast, reliable and give clear failure messages.',
    explanation:
      'Ordering checks from fast to slow, building once and promoting the same artefact are the key design principles.',
    tips: ['Order stages from fastest to slowest.', 'Mention building once and promoting.', 'Include security checks.'],
    commonMistakes: ['Rebuilding the artefact separately for each environment.', 'Putting slow end-to-end tests first.'],
    followUpQuestions: ['How would you keep a pipeline under ten minutes?', 'Where would you run database migrations?'],
  },
  'ops-017': {
    question: 'Compare rolling, blue-green and canary deployments.',
    intent: 'The interviewer checks knowledge of release strategies and their risk profiles.',
    expectedAnswer:
      'A rolling deployment replaces instances of the old version with the new one gradually; it needs no extra infrastructure, but both versions run at the same time and rollback means rolling again. Blue-green deployment runs two complete environments: the new version is deployed to the idle one, tested, and traffic is switched at once, typically at the load balancer; rollback is instant by switching back, but it doubles infrastructure during the release and requires database changes compatible with both versions. A canary deployment sends a small share of traffic, such as 5%, to the new version, monitors error rates and latency, then increases progressively; it limits the impact of bugs to a few users and gives real production feedback, but it needs good monitoring and traffic-splitting tools such as a service mesh or Argo Rollouts. Feature flags complement all three by separating deployment from release.',
    explanation:
      'Each strategy trades cost, speed of rollback and exposure to risk. Canary releases need strong observability to be useful.',
    tips: ['Give one advantage and one cost for each.', 'Mention database compatibility.', 'Mention feature flags.'],
    commonMistakes: ['Doing a canary release without monitoring the canary specifically.', 'Forgetting that both versions share the same database.'],
    followUpQuestions: ['How would you automate canary analysis?', 'How do feature flags differ from canary releases?'],
  },
  'ops-018': {
    question: 'Explain the main concepts of GitLab CI/CD.',
    intent: 'The interviewer checks hands-on knowledge of a widely used CI platform.',
    expectedAnswer:
      'A GitLab pipeline is defined in a .gitlab-ci.yml file at the root of the repository. It is made of jobs grouped into stages; jobs in the same stage run in parallel, and stages run in order, although needs lets a job start as soon as its dependencies finish, creating a faster directed graph. Each job runs on a runner, which can be shared, group-level or self-hosted, often inside a Docker image defined by image. Artifacts pass files produced by one job, such as a build output or test report, to later jobs and can be downloaded, while cache speeds up repeated work such as dependency downloads between pipelines. rules control when a job runs, for example only on merge requests, on the default branch or on tags. Variables, including protected and masked CI/CD variables for secrets, configure jobs. Environments track deployments, and manual jobs with protected environments provide approval gates. Templates and include let teams reuse pipeline definitions.',
    explanation:
      'Knowing stages, jobs, runners, artifacts versus cache and rules is enough to read and improve most GitLab pipelines.',
    example: 'test:\n  stage: test\n  image: node:22\n  cache: { key: { files: [pnpm-lock.yaml] }, paths: [.pnpm-store] }\n  script: [pnpm install --frozen-lockfile, pnpm test]\n  rules:\n    - if: $CI_PIPELINE_SOURCE == "merge_request_event"',
    tips: ['Distinguish artifacts from cache.', 'Mention rules and needs.', 'Explain how secrets are stored.'],
    commonMistakes: ['Using cache to pass build outputs between jobs.', 'Storing secrets directly in .gitlab-ci.yml.'],
    followUpQuestions: ['How do protected variables work?', 'How would you share a pipeline template between projects?'],
  },
  'ops-019': {
    question: 'Your CI pipeline takes 40 minutes. How would you speed it up?',
    intent: 'The interviewer checks practical problem solving on developer productivity.',
    expectedAnswer:
      'I would first measure where time goes by looking at job durations over recent pipelines, since a few jobs usually dominate. Then I would apply the relevant fixes. Cache dependencies by lockfile so they are not downloaded each time. Use Docker layer caching or a remote build cache. Run independent jobs in parallel and use dependency graphs, such as needs in GitLab, instead of strict stages. Split long test suites into parallel shards. Run only what is affected by a change, which tools such as Nx, Turborepo or Bazel support in monorepos, while keeping a full run on the main branch. Move slow end-to-end tests to a later stage or a scheduled run, and keep a small smoke suite on every merge request. Use faster runners or autoscaling runners if machines are the bottleneck. Remove flaky tests that cause retries. After each change, I would track the median and worst-case pipeline duration to confirm the improvement.',
    explanation:
      'Measuring first, then caching, parallelising and running only affected work are the main levers. Fast pipelines directly improve team productivity.',
    tips: ['Start with measurement.', 'Mention caching, parallelism and affected-only runs.', 'Track improvement over time.'],
    commonMistakes: ['Deleting tests to make the pipeline faster.', 'Optimising a job that is not on the critical path.'],
    followUpQuestions: ['How do you shard a test suite?', 'What is the risk of running only affected tests?'],
  },
  'ops-020': {
    question: 'How would you design CI/CD for a monorepo containing many services?',
    intent: 'The interviewer evaluates advanced pipeline architecture for scale and team autonomy.',
    expectedAnswer:
      'The main goals are speed, isolation between teams and safety. I would detect which projects are affected by a change, using the dependency graph of the monorepo, with tools such as Nx, Turborepo, Bazel or path-based rules, so a change to one service builds and tests only that service and the projects that depend on it, while shared library changes trigger their dependents. A full validation would still run on the main branch or on a schedule. Common steps, such as linting, testing and building images, would come from shared, versioned pipeline templates, and each service would keep its own deployment configuration, owners and approval rules, for example via CODEOWNERS. Each service would be versioned and deployed independently, with release tags that identify the service, such as orders-v1.4.0. Remote caching of build and test results speeds up work across developers and CI. I would also make sure shared root files, such as lockfiles and CI configuration, have clear ownership and a change process, because they affect every team. Observability on pipeline duration and failure rate per project helps detect problems.',
    explanation:
      'Monorepo CI succeeds when it builds only what changed, shares templates and keeps deployments independent. Advanced answers also address ownership of shared files.',
    tips: ['Explain affected-project detection.', 'Mention shared templates and independent deployments.', 'Address ownership of shared configuration.'],
    commonMistakes: ['Running every test of every project on every commit.', 'Deploying all services together on each merge.'],
    followUpQuestions: ['How do you handle a breaking change in a shared library?', 'What is remote caching?'],
  },
  'ops-021': {
    question: 'How do you secure a CI/CD pipeline and the software supply chain?',
    intent: 'The interviewer assesses advanced security awareness: pipelines are a high-value target for attackers.',
    expectedAnswer:
      'A compromised pipeline can push malicious code to production, so I would treat it as critical infrastructure. Secrets should be stored in the CI platform\'s protected, masked variables or an external vault, scoped to the jobs and branches that need them, ideally replaced by short-lived credentials through OIDC federation with the cloud provider instead of long-lived keys. Protected branches and tags, mandatory reviews and restricted permissions to modify pipeline definitions prevent unauthorised changes. Merge requests from forks should not have access to secrets. Runners for production deployments should be isolated and ephemeral. For dependencies, I would pin versions with lockfiles, use trusted registries or a proxy, and scan for known vulnerabilities and malicious packages. Builds should produce an SBOM, and artefacts and images should be signed, for example with cosign, with provenance attestations following SLSA guidelines, and deployments should verify signatures. Third-party CI actions or templates should be pinned to a specific version or commit. Finally, audit logs and alerts on unusual pipeline activity help detect compromise.',
    explanation:
      'Supply chain security covers secrets, code integrity, dependencies and artefact provenance. Advanced candidates mention short-lived credentials, signing and SLSA.',
    tips: ['Cover secrets, permissions, dependencies and artefacts.', 'Mention OIDC instead of long-lived keys.', 'Explain signing and provenance.'],
    commonMistakes: ['Giving every job access to production secrets.', 'Using third-party CI components without pinning versions.'],
    followUpQuestions: ['What is SLSA?', 'How does OIDC federation remove the need for stored cloud keys?'],
  },
  'ops-022': {
    question: 'What is the difference between git merge and git rebase?',
    intent: 'The interviewer checks a core Git skill and awareness of team conventions.',
    expectedAnswer:
      'Both integrate changes from one branch into another. git merge creates a merge commit that joins the two histories, keeping every commit exactly as it was; the history shows when branches were combined but can become cluttered. git rebase moves your branch\'s commits on top of the target branch, rewriting them as new commits, which produces a linear history that is easier to read. Because rebase rewrites history, you should not rebase commits that others have already based work on, such as a shared branch, unless the team agrees. A common practice is to rebase your own feature branch on main to stay up to date, then merge it, sometimes with a squash merge to keep one clean commit per change.',
    explanation:
      'Merge preserves history; rebase rewrites it for linearity. The golden rule is not to rewrite shared history.',
    tips: ['Explain the golden rule of rebasing.', 'Mention squash merges as a team option.'],
    commonMistakes: ['Force-pushing a rebased shared branch without warning colleagues.'],
    followUpQuestions: ['What does an interactive rebase let you do?', 'What is a fast-forward merge?'],
  },
};
