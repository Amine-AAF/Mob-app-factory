import type { QuestionText, TextTable } from '@/types/content';

/** Job-specific questions 001-030: project management, product management, business analysis, IT support. */
export const enA: TextTable<QuestionText> = {
  'job-001': {
    question: 'What is the difference between Agile and Waterfall, and when would you use each?',
    intent: 'The interviewer checks that you know the main delivery approaches and can choose one based on the context rather than habit.',
    expectedAnswer:
      'Waterfall plans the whole project upfront and moves through sequential phases: requirements, design, build, test and deployment. It works well when requirements are stable and well understood, when changes are expensive, such as construction or regulated projects, or when contracts require a fixed scope. Agile delivers in short iterations, usually one to four weeks, producing working increments and adapting the plan based on feedback; Scrum and Kanban are common frameworks. It suits projects with uncertainty, such as new digital products, where learning from users matters. Many organisations use a hybrid: a fixed overall budget and milestones, with Agile delivery inside.',
    explanation:
      'Interviewers want to see that you choose a method based on uncertainty, risk and constraints, not as a matter of belief.',
    tips: ['Give a project example for each approach.', 'Mention hybrid models used in real organisations.'],
    commonMistakes: ['Describing Agile as "no planning".', 'Claiming one method is always better.'],
    followUpQuestions: ['What is the difference between Scrum and Kanban?', 'How would you run an Agile project with a fixed deadline?'],
  },
  'job-002': {
    question: 'How do you define project scope and prevent scope creep?',
    intent: 'The interviewer checks a core project management skill that protects budgets and deadlines.',
    expectedAnswer:
      'I define scope with stakeholders at the start in a short scope statement: objectives, deliverables, what is explicitly out of scope, assumptions and acceptance criteria. Writing down what is out of scope is as important as what is in. Then I put a simple change process in place: every new request is documented, its impact on time, cost and risk is assessed, and the sponsor decides whether to add it, swap it for something else or postpone it. This way changes are possible, but they are visible decisions rather than silent additions.',
    explanation:
      'Scope creep comes from untracked small changes. A clear baseline and a lightweight change process keep flexibility while protecting commitments.',
    tips: ['Mention "out of scope" explicitly.', 'Describe a simple change request process.'],
    commonMistakes: ['Accepting small requests informally until the project is late.', 'Refusing all changes, which frustrates stakeholders.'],
    followUpQuestions: ['What do you do when a senior stakeholder bypasses the change process?', 'How do you document acceptance criteria?'],
  },
  'job-003': {
    question: 'How do you build a project plan and estimate how long it will take?',
    intent: 'The interviewer evaluates your planning method and how you handle uncertainty in estimates.',
    expectedAnswer:
      'I start by breaking the work into deliverables and smaller tasks, a work breakdown structure, until each task can be estimated and assigned. I ask the people who will do the work to estimate it, using ranges or three-point estimates, optimistic, likely and pessimistic, rather than single numbers. Then I identify dependencies to find the critical path, the sequence of tasks that determines the end date, and check resource availability, including holidays and other projects. I add contingency based on the level of risk, often 10 to 20%, and set milestones to track progress. I present the plan with its assumptions and confidence level, and I update it as we learn more.',
    explanation:
      'A credible plan combines decomposition, estimates from the people doing the work, dependencies, capacity and explicit contingency.',
    tips: ['Mention the work breakdown structure and the critical path.', 'Involve the team in estimates.', 'Communicate assumptions.'],
    commonMistakes: ['Estimating alone without the team.', 'Planning every person at 100% capacity.'],
    followUpQuestions: ['What would you do if the deadline is imposed and shorter than your estimate?', 'How do you track progress against the plan?'],
  },
  'job-004': {
    question: 'How do you identify and manage project risks?',
    intent: 'The interviewer checks proactive risk management rather than reacting to problems.',
    expectedAnswer:
      'At the start and at regular intervals, I run short risk workshops with the team and key stakeholders to list what could go wrong, such as a supplier delay, a key person leaving or unclear requirements. I record each risk in a risk register with its probability, impact, owner and response. Responses include avoiding the risk, reducing it, transferring it, for example through a contract clause, or accepting it with a contingency plan. I review the top risks in every status meeting, because risks change over time, and I escalate early when a risk needs a decision from the sponsor. When a risk materialises, it becomes an issue and is handled in the issue log.',
    explanation:
      'Risk management is a continuous process with owners and regular review, not a document created once at the start.',
    tips: ['Describe the risk register fields.', 'Name the four types of response.', 'Mention regular reviews.'],
    commonMistakes: ['Writing a risk register and never updating it.', 'Confusing risks with issues that have already happened.'],
    followUpQuestions: ['Give an example of a risk you mitigated successfully.', 'How do you prioritise risks?'],
  },
  'job-005': {
    question: 'Tell me about a project that was falling behind schedule. What did you do?',
    intent: 'The interviewer wants to see how you diagnose delays, make trade-offs and communicate under pressure.',
    expectedAnswer:
      'Situation: I was managing the roll-out of a new CRM to three sales offices, and halfway through we were three weeks behind because data migration was more complex than expected. Task: I had to protect the go-live date, which was tied to the start of the sales year. Action: I analysed the remaining work with the team and found that most delay came from cleaning old customer data. I proposed three options to the sponsor: delay go-live, add a temporary data specialist, or migrate only active customers first and the rest a month later. We chose the third option and added two days of overtime for testing, which the team agreed to. I updated stakeholders weekly with a simple progress chart. Result: the system went live on the planned date for all active customers, and the remaining data was migrated four weeks later without disruption.',
    explanation:
      'Strong answers show analysis of the cause, options with trade-offs presented to the decision-maker and transparent communication.',
    tips: ['Explain the root cause of the delay.', 'Present the options you considered.', 'Show how you communicated.'],
    commonMistakes: ['Solving delays only by asking the team to work overtime.', 'Hiding the delay until it is too late.'],
    followUpQuestions: ['How did the team react to the overtime?', 'What would you do differently in the planning phase?'],
  },
  'job-006': {
    question: 'Tell me about a time stakeholders had conflicting expectations for a project.',
    intent: 'The interviewer evaluates your ability to align people with different priorities.',
    expectedAnswer:
      "Situation: for a new employee intranet, the communications team wanted a news-focused homepage while HR wanted quick access to forms and policies. Task: as project manager, I needed one design both would support within the existing budget. Action: I met each group separately to understand the underlying goals: communications wanted visibility of company news, HR wanted fewer support requests. I then shared data from an employee survey showing that the top reasons for visiting the intranet were forms and holidays. I organised a joint workshop where we designed a homepage with quick links at the top and a news section below, and agreed to review usage after three months. Result: both teams signed off, HR requests dropped by 25% and news articles had more views than on the old intranet.",
    explanation:
      'Aligning stakeholders means uncovering goals behind positions, using shared data and designing a solution that serves both.',
    tips: ['Show that you listened to each side separately.', 'Use data to move from opinions to facts.'],
    commonMistakes: ['Letting the most senior stakeholder decide without discussion.', 'Describing one side negatively.'],
    followUpQuestions: ['What if they had not agreed?', 'How do you map stakeholders at the start of a project?'],
  },
  'job-007': {
    question: 'Tell me about a project that failed or had to be stopped. What did you learn?',
    intent: 'The interviewer assesses accountability, honesty and your ability to learn from failure at a senior level.',
    expectedAnswer:
      "Situation: I led a project to build an internal tool for managing supplier contracts. After four months and about 60% of the budget spent, user testing showed that the procurement team would continue using spreadsheets because the tool did not fit their actual workflow. Task: I had to decide whether to continue, change direction or stop. Action: I analysed the situation honestly with the team and the sponsor. We had gathered requirements from managers rather than the people doing the work, and we tested with users too late. I recommended stopping development and evaluating an off-the-shelf solution, which was cheaper than finishing and correcting our tool. I presented the recommendation to the steering committee with the numbers and took responsibility for the discovery gap. Result: the committee agreed, a market solution was implemented in two months, and I changed my approach: on later projects I involve end users from the first week and test prototypes before building.",
    explanation:
      'Stopping a failing project is a sign of good judgment. Owning the mistake, explaining the cause and showing changed practice make this a strong answer.',
    tips: ['Choose a real failure with a clear lesson.', 'Explain how you decided to stop.', 'Describe how your practice changed.'],
    commonMistakes: ['Blaming the team or users.', 'Choosing a failure that was really a success.'],
    followUpQuestions: ['How did the team react when the project was stopped?', 'How do you recognise early that a project is failing?'],
  },
  'job-008': {
    question: 'How do you report project status and measure the health of a project?',
    intent: 'The interviewer evaluates advanced project control and executive communication.',
    expectedAnswer:
      'I report on a few indicators that show whether the project will deliver the expected value on time and within budget: progress against milestones, budget spent versus planned and forecast at completion, scope changes, top risks and issues, and team capacity. For larger projects, earned value management helps: comparing planned value, earned value and actual cost gives schedule and cost performance indices, so a cost performance index of 0.85 means we get 85 cents of planned work per euro spent. I use a one-page status report with a red, amber or green status for each dimension, a short explanation and the decisions needed, and I adapt the level of detail to the audience: weekly details for the team, monthly summary with decisions for the steering committee. A status should be honest: an amber or red status raised early, with a recovery plan, builds more trust than a green status that suddenly turns red.',
    explanation:
      'Good reporting combines objective indicators, a clear summary and honest early warnings. Earned value adds rigour for larger projects.',
    tips: ['List the dimensions you track.', 'Explain one earned value indicator.', 'Insist on honest status.'],
    commonMistakes: ['Reporting "green" until the last moment.', 'Sending long reports without decisions or actions.'],
    followUpQuestions: ['What is the schedule performance index?', 'How do you handle a sponsor who wants only good news?'],
  },
  'job-009': {
    question: 'Why do you want to be a product manager, and what does the role mean to you?',
    intent: 'The interviewer checks that you understand the product manager\'s responsibilities and are motivated by them.',
    expectedAnswer:
      "For me, a product manager is responsible for making sure the team builds the right thing: understanding users and the business, deciding what problems to solve and in what order, and measuring whether the solution worked. The role is about influence rather than authority, since the PM works with designers, engineers, marketing and sales without managing them. I'm attracted to it because in my current role as a business analyst, the moments I enjoy most are talking to users, finding the real problem behind a request and seeing a feature change how people work. I want to take responsibility for outcomes, not only for requirements.",
    explanation:
      'A strong answer defines the role accurately, focuses on outcomes and links it to your own experience and motivation.',
    tips: ['Define the role in terms of problems and outcomes.', 'Link it to concrete experiences.'],
    commonMistakes: ['Describing the PM as the "CEO of the product".', 'Focusing only on managing tasks or the backlog.'],
    followUpQuestions: ['What is the difference between a product manager and a project manager?', 'Which product do you admire and why?'],
  },
  'job-010': {
    question: 'How do you prioritise a product backlog?',
    intent: 'The interviewer evaluates your decision framework and how you balance different inputs.',
    expectedAnswer:
      'I start from the product goals for the period, for example improving activation or retention, so every item is evaluated against what matters now. Then I use a simple, transparent framework. RICE scores items by reach, impact, confidence and effort; MoSCoW classifies them as must, should, could or won\'t for a release; and the Kano model distinguishes basic expectations from features that delight users. I combine scores with judgment: dependencies, technical debt that slows the team, commitments to customers and risks such as compliance. I share the reasoning openly with stakeholders so they understand why their request is not first, and I revisit priorities regularly as new data arrives.',
    explanation:
      'Frameworks make prioritisation explicit and discussable, but they support judgment rather than replace it.',
    tips: ['Start from goals.', 'Name one or two frameworks.', 'Explain how you communicate decisions.'],
    commonMistakes: ['Prioritising by who shouts loudest.', 'Applying a scoring framework mechanically.'],
    followUpQuestions: ['How do you prioritise technical debt against features?', 'How do you say no to a big customer?'],
  },
  'job-011': {
    question: 'How do you define success metrics for a new feature?',
    intent: 'The interviewer checks outcome-oriented thinking and measurement skills.',
    expectedAnswer:
      'I start from the problem the feature should solve and the behaviour change we expect. For example, for a "save for later" button in an online shop, the goal might be to recover purchases from users who hesitate. The primary metric would be the conversion rate of saved items into purchases within 30 days. I would add adoption, the share of users who use the feature, and guardrail metrics to make sure we do not harm something else, such as overall conversion or page speed. I define targets and the measurement period before launch, check that tracking is in place, and if possible run an A/B test to separate the feature\'s effect from other changes.',
    explanation:
      'Good metrics connect the feature to user behaviour and business value, include guardrails and are defined before launch.',
    tips: ['Link metrics to the problem.', 'Add adoption and guardrail metrics.', 'Define targets before launch.'],
    commonMistakes: ['Measuring only usage counts.', 'Choosing metrics after seeing the results.'],
    followUpQuestions: ['What is a north star metric?', 'What if adoption is high but the business metric does not move?'],
  },
  'job-012': {
    question: 'Tell me about a product decision you made based on user research.',
    intent: 'The interviewer evaluates whether you rely on evidence from users rather than opinions.',
    expectedAnswer:
      "Situation: our team planned to build advanced reporting for a scheduling app because several large clients had asked for it. Task: as product manager, I wanted to confirm it was the most valuable investment for the next quarter. Action: I interviewed twelve customers of different sizes and analysed support tickets. I found that only large clients needed advanced reports, while most small clients struggled with something simpler: they did not understand how to set up recurring appointments, which caused many cancellations. I presented the findings to the team and stakeholders and proposed to improve recurring appointments first, with a lighter export feature for large clients. Result: the redesigned recurring appointment flow reduced related support tickets by 40%, and retention of small clients improved in the following quarter.",
    explanation:
      'This answer shows research methods, an insight that changed the plan and measurable results, which is the essence of evidence-based product work.',
    tips: ['Describe the research method.', 'Show how the insight changed the decision.', 'Quantify the result.'],
    commonMistakes: ['Using research only to confirm an existing decision.', 'Relying on one loud customer.'],
    followUpQuestions: ['How did you choose who to interview?', 'How did you handle the large clients who wanted reports?'],
  },
  'job-013': {
    question: 'How would you approach improving the onboarding of a mobile app?',
    intent: 'The interviewer evaluates your structured product thinking on an open problem.',
    expectedAnswer:
      'First I would clarify the goal: onboarding succeeds when new users reach the moment where they get value, for example completing their first booking. I would measure the funnel from install to that moment and find where users drop off, segmenting by channel and device. Then I would understand why, through session recordings, short surveys and a few user interviews. Typical problems are asking for too much information too early, unclear value, or permissions requested without context. I would list hypotheses, for example "reducing the sign-up form from seven fields to three will increase completion", prioritise them by expected impact and effort, and test the most promising ones with A/B tests. Success would be measured by activation rate and early retention, not only by sign-up completion.',
    explanation:
      'A structured approach moves from goal to data, to user understanding, to hypotheses and experiments, with the right success metric.',
    tips: ['Define activation first.', 'Combine quantitative and qualitative research.', 'Formulate testable hypotheses.'],
    commonMistakes: ['Jumping straight to redesigning screens.', 'Optimising sign-up completion while activation stays low.'],
    followUpQuestions: ['What is an activation metric?', 'How would you prioritise your hypotheses?'],
  },
  'job-014': {
    question: 'Tell me about a product or feature you launched that did not perform as expected.',
    intent: 'The interviewer assesses accountability, learning and how you react to disappointing data at a senior level.',
    expectedAnswer:
      "Situation: I launched a referral programme in a budgeting app, expecting 10% of new sign-ups to come from referrals within three months. Task: after six weeks, referrals represented only 2%. I had to decide whether to improve, change or stop the programme. Action: I looked at the funnel and found that many users opened the referral screen but very few sent invitations. Interviews revealed that people were uncomfortable recommending a financial app because it felt like sharing private information, and the reward, a premium month, was not attractive enough. I acknowledged to stakeholders that I had not tested this assumption before launch. We tested two changes: a message focused on saving money together with a partner, and a reward for both people. Result: referrals rose to 6%, below the original target, so I recommended keeping the programme at low cost and investing the rest of the budget in other channels. Since then, I validate key assumptions with quick tests or interviews before building.",
    explanation:
      'Strong answers combine honest ownership, data-driven diagnosis, rational decisions about further investment and a lasting change in practice.',
    tips: ['State the expected and actual results.', 'Show the diagnosis and the decision.', 'Explain what you changed in your process.'],
    commonMistakes: ['Blaming marketing or engineering.', 'Continuing to invest without evidence.'],
    followUpQuestions: ['How do you decide when to stop investing in a feature?', 'How do you validate assumptions before building?'],
  },
  'job-015': {
    question: 'How do you design and interpret an A/B test?',
    intent: 'The interviewer evaluates advanced experimentation skills and statistical awareness.',
    expectedAnswer:
      'I start with a clear hypothesis and a primary metric, such as "showing delivery costs on the product page will increase checkout completion", plus guardrail metrics. I estimate the sample size needed to detect the minimum effect that matters, given the baseline rate, desired statistical power, usually 80%, and significance level, usually 5%; this determines how long the test must run, ideally covering full weekly cycles. Users are randomly assigned and stay in the same group. I avoid stopping the test as soon as the result looks significant, because repeated peeking increases false positives, unless we use a sequential method designed for it. When reading results, I look at the confidence interval, not only the p-value, check guardrails and sample ratio mismatch, which signals a bug in assignment, and avoid fishing for significant results in many segments. A non-significant result is still useful information. Finally, I consider practical significance: a statistically significant 0.1% increase may not justify the complexity.',
    explanation:
      'Good experimentation needs pre-defined hypotheses, adequate sample size, discipline against peeking and careful interpretation of results.',
    tips: ['Mention sample size and power.', 'Explain the peeking problem.', 'Distinguish statistical and practical significance.'],
    commonMistakes: ['Stopping the test as soon as the result looks good.', 'Testing many metrics and reporting only the significant one.'],
    followUpQuestions: ['What is sample ratio mismatch?', 'What would you do if the test shows no difference?'],
  },
  'job-016': {
    question: 'How do you build a product roadmap aligned with company strategy?',
    intent: 'The interviewer assesses strategic thinking and stakeholder alignment at a senior level.',
    expectedAnswer:
      'I start from the company strategy and objectives, for example growing in mid-sized businesses or improving retention, and translate them into product goals for the next few quarters, often as OKRs with measurable key results. Then I identify the most important problems that stand between us and those goals, using data, customer research, sales and support feedback and technical constraints. The roadmap is organised by outcomes and problems rather than a long list of features with fixed dates: "Now" for committed work, "Next" for likely priorities and "Later" for ideas under exploration. I review drafts with engineering for feasibility, with sales and marketing for market timing, and with leadership for strategic fit, and I make the trade-offs explicit, including what we will not do. I communicate it differently by audience and revisit it each quarter as we learn. Commitments with dates are reserved for items with external dependencies, such as contracts or regulations.',
    explanation:
      'An outcome-based roadmap links strategy to problems and keeps flexibility, while making trade-offs and commitments clear.',
    tips: ['Start from strategy and objectives.', 'Present an outcome-based roadmap.', 'Explain how you align stakeholders.'],
    commonMistakes: ['Promising a year of features with fixed dates.', 'Building the roadmap only from customer requests.'],
    followUpQuestions: ['How do you handle a sales request that conflicts with the roadmap?', 'What is the difference between an outcome and an output?'],
  },
  'job-017': {
    question: 'What does a business analyst do, and what value does the role bring?',
    intent: 'The interviewer checks that you understand the role and can explain its contribution to projects.',
    expectedAnswer:
      'A business analyst helps an organisation understand its needs and define solutions that create value. In practice, I work with stakeholders to understand current processes and problems, gather and clarify requirements, model processes and data, write user stories and acceptance criteria, and help the development or implementation team build the right thing. I also support testing and adoption. The value is reducing misunderstandings between business and technical teams, so fewer features are built for the wrong reasons, and making decisions based on analysis rather than assumptions.',
    explanation:
      'The business analyst is a bridge between business needs and solutions. Explaining the value in terms of reduced rework and better decisions makes the answer convincing.',
    tips: ['Describe concrete activities.', 'Explain the value in business terms.'],
    commonMistakes: ['Describing the role as only writing documents.'],
    followUpQuestions: ['How is a business analyst different from a product owner?', 'Which tools do you use?'],
  },
  'job-018': {
    question: 'How do you gather requirements from stakeholders?',
    intent: 'The interviewer evaluates your elicitation techniques and how you uncover real needs.',
    expectedAnswer:
      'I use several techniques depending on the situation. Interviews with key stakeholders help me understand goals and pain points; workshops bring people together to agree on priorities; observing users while they work reveals steps and workarounds people forget to mention; and reviewing existing documents, reports and data gives facts. I ask open questions and keep asking "why" to find the need behind a requested solution, for example a request for "a new report" may really be a need to detect late payments earlier. I document requirements clearly, confirm them with stakeholders and keep track of open questions.',
    explanation:
      'Combining techniques and looking for the need behind each request leads to better solutions than taking requests literally.',
    tips: ['Name several elicitation techniques.', 'Show how you find the need behind a request.'],
    commonMistakes: ['Writing down requests without questioning them.', 'Talking only to managers and not to end users.'],
    followUpQuestions: ['How do you handle a stakeholder who is not available?', 'How do you validate requirements?'],
  },
  'job-019': {
    question: 'How do you write good user stories and acceptance criteria?',
    intent: 'The interviewer checks practical skills used daily in Agile teams.',
    expectedAnswer:
      'A user story describes a need from the user\'s perspective: "As a warehouse manager, I want to see orders delayed by more than 24 hours, so that I can contact customers before they complain." Good stories follow the INVEST criteria: independent, negotiable, valuable, estimable, small and testable. Acceptance criteria define when the story is done, often in Given-When-Then format: "Given an order created more than 24 hours ago and not shipped, when I open the dashboard, then the order appears in the Delayed list with its customer contact." I include edge cases and non-functional needs, such as permissions or performance, and I discuss stories with the team before the sprint to make sure everyone understands them the same way.',
    explanation:
      'Stories express value; acceptance criteria make them testable. The conversation with the team matters as much as the written text.',
    example: 'Given an order older than 24 hours that has not shipped\nWhen the manager opens the dashboard\nThen the order appears in "Delayed" with the customer\'s phone number',
    tips: ['Include the "so that" part to express value.', 'Write testable acceptance criteria.', 'Cover edge cases.'],
    commonMistakes: ['Writing technical tasks as user stories.', 'Leaving acceptance criteria vague, such as "works correctly".'],
    followUpQuestions: ['How do you split a story that is too large?', 'Who writes acceptance criteria in your team?'],
  },
  'job-020': {
    question: 'How do you model and improve a business process?',
    intent: 'The interviewer evaluates process analysis skills and the ability to find improvements.',
    expectedAnswer:
      'I start by documenting the current, "as-is" process with the people who do it, using a clear notation such as BPMN or a simple swimlane diagram showing who does what, the steps, decisions, systems and handovers. I collect data on volumes, timings and errors to see where time and quality are lost. Common problems are duplicated data entry, waiting for approvals, unclear responsibilities and manual workarounds. Then I design the "to-be" process with stakeholders, removing unnecessary steps, automating repetitive tasks and clarifying ownership, and I estimate the expected gains. Changes are tested on a small scale before full roll-out, and I make sure people are trained and that the documentation is updated.',
    explanation:
      'Process improvement combines visual modelling, measurement and involvement of the people who do the work.',
    tips: ['Mention as-is and to-be models.', 'Use data to find bottlenecks.', 'Involve process participants.'],
    commonMistakes: ['Designing the new process without understanding the current one.', 'Automating a bad process instead of simplifying it.'],
    followUpQuestions: ['What is a swimlane diagram?', 'How do you measure the success of a process change?'],
  },
  'job-021': {
    question: 'Tell me about a time two departments disagreed on requirements.',
    intent: 'The interviewer evaluates facilitation and conflict resolution in a business analysis context.',
    expectedAnswer:
      "Situation: during the redesign of our order system, sales wanted orders confirmed immediately to customers, while finance required a credit check before confirmation. Task: as business analyst, I had to define a single process both could accept. Action: I mapped the current process with both teams and gathered data: 85% of orders came from customers with good credit history. I proposed automatic confirmation for customers within their credit limit and a manual check only for the rest, with a maximum response time of four hours. I organised a workshop to review the proposal, adjusted the limit rule with finance and documented the agreement with both department heads. Result: 85% of orders were confirmed instantly, credit risk stayed under control, and both teams approved the requirements without escalation.",
    explanation:
      'Using data to find a solution that addresses both sides\' real concerns is a key business analyst skill.',
    tips: ['Explain both sides\' concerns.', 'Show the data that helped.', 'Describe how the agreement was formalised.'],
    commonMistakes: ['Choosing one side\'s solution without analysis.', 'Escalating immediately to management.'],
    followUpQuestions: ['What would you have done if no compromise was possible?', 'How do you document decisions?'],
  },
  'job-022': {
    question: 'How do you use data to support a business recommendation?',
    intent: 'The interviewer checks analytical skills and the ability to turn data into decisions.',
    expectedAnswer:
      'I start with the business question, for example "why have customer returns increased?", and define what data would answer it. I extract and clean the data, often with SQL and a spreadsheet or BI tool, checking its quality and limitations. Then I analyse it: trends over time, segments such as product category or region, and comparisons with a baseline, looking for patterns while being careful not to confuse correlation with causation. For example, I might find that returns increased mainly for one supplier\'s products after a packaging change. I present the result with a clear message, a few simple charts, the estimated impact and a recommendation, along with assumptions and confidence. Where possible, I propose a test to confirm the cause.',
    explanation:
      'Good data-driven recommendations start from a question, respect data quality, communicate clearly and suggest validation.',
    tips: ['Start from the business question.', 'Mention data quality and limitations.', 'End with a recommendation and impact.'],
    commonMistakes: ['Presenting many charts without a conclusion.', 'Treating correlation as proof of cause.'],
    followUpQuestions: ['Which SQL queries do you write most often?', 'How do you present data to executives?'],
  },
  'job-023': {
    question: 'Tell me about a time you discovered late in a project that a requirement had been misunderstood.',
    intent: 'The interviewer assesses accountability, problem-solving and process improvement at an advanced level.',
    expectedAnswer:
      "Situation: two weeks before go-live of a new invoicing module, user acceptance testing showed that invoices grouped deliveries by month, while the accounting team needed one invoice per delivery for certain customers. Task: I had written the requirement, so I needed to understand what went wrong and find a solution quickly. Action: I reviewed the documentation and found that I had generalised the rule from interviews with the sales team without validating it with accounting. I informed the project manager and sponsor the same day with the impact and options. With the developers, we found that a configuration option per customer could be added in one week. I validated the corrected rule with accounting through concrete examples before development. Result: we went live one week late, with the correct behaviour. Since then, I validate business rules with every affected department using real examples, and I include them in acceptance criteria.",
    explanation:
      'Owning the mistake, communicating quickly with options and changing your validation practice are what interviewers look for.',
    tips: ['Explain how the misunderstanding happened.', 'Show quick communication and options.', 'Describe the process change.'],
    commonMistakes: ['Blaming the stakeholders for unclear explanations.', 'Hiding the issue until go-live.'],
    followUpQuestions: ['How do you validate requirements now?', 'How did the sponsor react?'],
  },
  'job-024': {
    question: 'A user says they cannot connect to the internet. How do you troubleshoot?',
    intent: 'The interviewer checks a methodical troubleshooting approach, the core skill of IT support.',
    expectedAnswer:
      'I start by asking questions: is it only this user or several people, which device, wired or Wi-Fi, since when, and has anything changed. Then I check from the simplest to the most complex: whether Wi-Fi is on or the cable is connected, whether the device has an IP address with ipconfig or similar, whether it can reach the gateway with ping, and whether name resolution works by pinging an IP address versus a domain name. If only DNS fails, I check DNS settings; if there is no IP address, I look at DHCP or the network port. Restarting the network adapter or the device often helps. If several users are affected, I check the switch, access point or internet connection and escalate to the network team. I document the steps and solution in the ticket.',
    explanation:
      'A layered approach, from the user\'s device to the network, finds the problem efficiently and avoids random fixes.',
    tips: ['Start with questions to scope the problem.', 'Test step by step: link, IP, gateway, DNS.', 'Document the resolution.'],
    commonMistakes: ['Restarting everything without understanding the cause.', 'Not checking whether other users are affected.'],
    followUpQuestions: ['What does an IP address starting with 169.254 indicate?', 'When would you escalate?'],
  },
  'job-025': {
    question: 'Explain what DNS and DHCP do.',
    intent: 'The interviewer checks basic networking knowledge needed for support roles.',
    expectedAnswer:
      'DNS, the Domain Name System, translates names that people use, such as www.example.com, into IP addresses that computers use to connect. When DNS fails, websites seem unreachable even though the network works, which is why pinging an IP address can still succeed. DHCP, the Dynamic Host Configuration Protocol, automatically gives devices their network settings when they connect: an IP address, subnet mask, default gateway and DNS servers. Without DHCP, each device would need manual configuration. A device that cannot reach a DHCP server may assign itself an address in the 169.254 range, which does not allow normal network access.',
    explanation:
      'DNS and DHCP are behind many everyday connection problems. Knowing their role helps diagnose issues quickly.',
    tips: ['Use simple analogies, such as a phone book for DNS.', 'Link each service to a typical symptom.'],
    commonMistakes: ['Confusing DNS and DHCP roles.'],
    followUpQuestions: ['How would you clear a DNS cache on a computer?', 'What is a DHCP lease?'],
  },
  'job-026': {
    question: 'Tell me about a time you helped a frustrated user who was not comfortable with technology.',
    intent: 'The interviewer evaluates customer service, patience and communication with non-technical people.',
    expectedAnswer:
      "Situation: an accountant called the helpdesk very upset because she could not access a shared folder an hour before a deadline. Task: I needed to solve the problem quickly and calm her down. Action: I listened, reassured her that we would find a solution and avoided technical jargon. I connected remotely with her permission and found that her password had expired, which removed her access to network drives. I guided her step by step to change the password, explaining what I was doing, then checked with her that she could open her files. I also showed her how to see the password expiry warning in the future. Result: she met her deadline, thanked my manager in an e-mail, and I added a short guide about password expiry to our knowledge base.",
    explanation:
      'Listening, clear language, solving the problem and preventing recurrence are the key elements of good support.',
    tips: ['Show empathy and simple language.', 'Explain how you prevented recurrence.'],
    commonMistakes: ['Using jargon.', 'Implying the user made a "stupid" mistake.'],
    followUpQuestions: ['How do you handle a user who is rude?', 'How do you write a good knowledge base article?'],
  },
  'job-027': {
    question: 'How do you prioritise support tickets? Explain incidents, problems and service requests.',
    intent: 'The interviewer checks ITIL-style service management knowledge and practical prioritisation.',
    expectedAnswer:
      'In ITIL terms, an incident is an unplanned interruption or degradation of a service, such as e-mail not working; the goal is to restore service quickly. A service request is a standard request, such as a new laptop or access to an application. A problem is the underlying cause of one or more incidents, investigated to prevent them from happening again. I prioritise tickets with an impact and urgency matrix: impact is how many people or how critical the business process is, urgency is how quickly it must be solved. A finance system down during month-end closing is high impact and high urgency; one user\'s printer issue is low. Priority determines the target response and resolution times in the service level agreement. I keep users informed, escalate when targets are at risk and link recurring incidents to a problem record.',
    explanation:
      'Distinguishing ticket types and using impact and urgency makes prioritisation objective and aligned with business needs.',
    tips: ['Define the three types clearly.', 'Explain the impact and urgency matrix.', 'Mention SLAs.'],
    commonMistakes: ['Handling tickets only in arrival order.', 'Treating recurring incidents individually without looking for the cause.'],
    followUpQuestions: ['What is a major incident?', 'How would you reduce the number of recurring tickets?'],
  },
  'job-028': {
    question: 'A user reports a suspicious e-mail and admits clicking the link. What do you do?',
    intent: 'The interviewer checks security awareness and correct incident handling at first-line level.',
    expectedAnswer:
      'First I thank the user for reporting it, because quick reporting is exactly what we want, and I stay calm so they keep reporting in future. I ask what they did exactly: did they enter a password, download a file or open an attachment. If they entered credentials, I reset the password immediately, revoke active sessions and check that multi-factor authentication is active. If a file was downloaded or opened, I disconnect the device from the network and follow the security team\'s procedure, which may include a malware scan or reimaging. I report the incident to the security team with the e-mail, preferably as an attachment with headers, so they can block the sender and links and check whether other users received it. Finally I document everything in the ticket.',
    explanation:
      'Fast containment, protection of credentials, evidence for the security team and a blame-free attitude are the essentials.',
    tips: ['Thank the user and avoid blame.', 'Distinguish credential entry from file execution.', 'Escalate to security with evidence.'],
    commonMistakes: ['Deleting the e-mail before the security team analyses it.', 'Scolding the user, which discourages future reports.'],
    followUpQuestions: ['How do you recognise a phishing e-mail?', 'Why are e-mail headers useful?'],
  },
  'job-029': {
    question: 'How do you manage account creation and removal when employees join or leave?',
    intent: 'The interviewer checks access management practices, which are critical for security.',
    expectedAnswer:
      'For onboarding, I work from a request approved by the manager or HR and use role-based templates, so new employees get exactly the access their role needs, no more. Accounts are created before the first day, with a temporary password that must be changed and multi-factor authentication enrolment. For changes of role, old access is removed, not only new access added, to avoid accumulation. For offboarding, the HR notification triggers a checklist: disable accounts at the exact end time, revoke sessions and tokens, recover devices, transfer or archive data according to policy, remove access to shared systems and third-party tools, and change shared passwords the person knew. Where possible, this is automated through an identity management system connected to HR data. Regular access reviews with managers detect forgotten permissions.',
    explanation:
      'Joiner-mover-leaver processes with least privilege and timely removal prevent many security incidents.',
    tips: ['Cover joiners, movers and leavers.', 'Mention role-based access and access reviews.'],
    commonMistakes: ['Leaving accounts active after departures.', 'Copying the access of a colleague for a new hire.'],
    followUpQuestions: ['What would you do with a shared account?', 'How do you handle urgent dismissals?'],
  },
  'job-030': {
    question: 'A major outage affects hundreds of users. How do you handle support during the incident?',
    intent: 'The interviewer assesses advanced coordination and communication skills during a crisis.',
    expectedAnswer:
      "First I would confirm the scope quickly and declare a major incident according to our process, so the right teams and an incident manager are involved. On the support side, I would create one master ticket and link all user reports to it, so we do not handle hundreds of duplicates. I would publish a status message as soon as possible, on the service portal, by e-mail or an automatic phone message, saying what is affected, that the teams are working on it and when the next update will come, then update it regularly even when there is no news. I would give the support team a short script and workarounds if any exist, and collect useful information for the technical teams, such as locations or error messages. Critical business users, such as a team with a regulatory deadline, would get priority contact. After resolution, I would confirm with users that service is restored, close linked tickets with a clear message and contribute support's view to the post-incident review, for example about communication delays.",
    explanation:
      'During major incidents, support protects the technical teams from noise, keeps users informed and gathers useful information.',
    tips: ['Mention master tickets and linked reports.', 'Describe regular status communication.', 'Include the post-incident review.'],
    commonMistakes: ['Answering each call individually without a common message.', 'Communicating only when the problem is solved.'],
    followUpQuestions: ['What should a status message contain?', 'How do you prioritise users during an outage?'],
  },
};
