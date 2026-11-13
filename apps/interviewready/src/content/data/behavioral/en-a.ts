import type { QuestionText, TextTable } from '@/types/content';

/** Behavioral questions 001-040: leadership, teamwork, communication, problem solving, conflict. */
export const enA: TextTable<QuestionText> = {
  'beh-001': {
    question: 'Tell me about a time you led a group without having formal authority.',
    intent: 'The interviewer wants to see whether you can influence and coordinate people through credibility and communication rather than hierarchy.',
    expectedAnswer:
      "Situation: three teams were each building part of a new customer portal, and nobody owned the overall launch. Task: as a developer on one of the teams, I saw that our pieces would not fit together in time, so I offered to coordinate the integration. Action: I set up a shared checklist of dependencies, ran a fifteen-minute weekly call with one person from each team and published a short summary afterwards. When two teams disagreed on an API format, I organised a session where each presented their constraints and we agreed on a compromise. Result: we launched on the planned date, and my manager asked me to coordinate the next cross-team project officially.",
    explanation:
      'Leadership without authority relies on initiative, clarity and trust. The strongest stories show you stepping in to fill a gap, creating simple structure and resolving disagreements by bringing people together rather than imposing a decision.',
    tips: ['Explain why you stepped in.', 'Show the simple tools you used to coordinate.', 'Mention how you handled at least one disagreement.'],
    commonMistakes: ['Describing yourself as the boss when you were not.', 'Leaving out how others reacted to your initiative.'],
    followUpQuestions: ['What did you do when someone did not follow through?', 'How did your own manager react?'],
  },
  'beh-002': {
    question: 'Describe a time you helped a struggling team member get back on track.',
    intent: 'The interviewer wants to know whether you notice when others struggle and whether you support them with empathy and practical help.',
    expectedAnswer:
      "Situation: a new colleague on our customer success team was falling behind on her tickets and seemed withdrawn in meetings. Task: as the most experienced person on the team, I wanted to help without making her feel judged. Action: I invited her for a coffee and asked how things were going. She explained that she found our internal tools confusing and was afraid to keep asking questions. I suggested two short pairing sessions per week and wrote a one-page guide to the tools she found hardest. Result: within a month her ticket backlog was back to normal, and she later improved the guide for the next newcomers.",
    explanation:
      'Supporting others starts with understanding the real cause. Asking open questions, then offering concrete and respectful help, shows emotional intelligence and leadership potential.',
    tips: ['Start with how you noticed the problem.', 'Show that you listened before proposing a solution.'],
    commonMistakes: ['Describing the colleague negatively.', 'Taking over their work instead of helping them improve.'],
    followUpQuestions: ['What would you have done if things had not improved?', 'Did you involve your manager?'],
  },
  'beh-003': {
    question: 'Tell me about a time you had to take the lead unexpectedly.',
    intent: 'The interviewer wants to see whether you can step up calmly when circumstances require it.',
    expectedAnswer:
      "Situation: during my internship, my supervisor fell ill on the day of an important workshop with a client. Task: I was the only other person who had prepared the materials, so I had to run the session. Action: I called the client to explain the situation and confirm they still wanted to go ahead, reviewed the agenda with a colleague for twenty minutes and focused on the parts I knew best. For questions I could not answer, I wrote them down and promised a reply within two days. Result: the workshop went well, the client sent positive feedback, and my supervisor gave me more client contact after that.",
    explanation:
      'This question looks for composure and initiative. Being transparent with others, preparing quickly and being honest about limits are signs of maturity, even early in a career.',
    tips: ['Explain how you prepared in a short time.', 'Show how you handled what you did not know.'],
    commonMistakes: ['Pretending you had no doubts at all.', 'Forgetting to describe the outcome.'],
    followUpQuestions: ['What was the hardest moment of that day?', 'Would you do anything differently?'],
  },
  'beh-004': {
    question: 'Describe a time you delegated an important task. How did you make sure it succeeded?',
    intent: 'The interviewer is assessing whether you can trust others, give clear instructions and follow up without micromanaging.',
    expectedAnswer:
      "Situation: I was leading the preparation of our annual customer event while also handling a product launch. Task: I could not manage both, so I needed to delegate the event logistics to a junior colleague. Action: I explained the goal and the budget, shared last year's checklist and agreed on what decisions she could make alone and which ones she should bring to me. We set two short check-ins per week. When she proposed a venue I would not have chosen, I asked for her reasoning and accepted it, because it met the criteria. Result: the event ran smoothly with 20% more attendees than the previous year, and she managed the whole event herself the following year.",
    explanation:
      'Good delegation means clear goals, defined decision rights and regular but light follow-up. Accepting choices that differ from yours, as long as they meet the goal, is what develops people.',
    tips: ['Explain how you chose the person.', 'Describe how you balanced support and autonomy.'],
    commonMistakes: ['Delegating only tasks nobody wanted.', 'Describing constant checking that sounds like micromanagement.'],
    followUpQuestions: ['What do you do when a delegated task goes wrong?', 'What do you find hard to delegate?'],
  },
  'beh-005': {
    question: 'Tell me about a time you had to make an unpopular decision as a leader.',
    intent: 'The interviewer wants to see whether you can make difficult calls, explain them and keep the team\'s trust.',
    expectedAnswer:
      "Situation: as team lead, I had promised my team two weeks dedicated to cleaning up our oldest code after a long release cycle. Task: a week before it started, a major client reported performance issues that threatened their contract renewal, and I had to decide whether to keep the plan. Action: I looked at the data with the product manager and concluded the client issue had to come first. I told the team in person, explained the reasons and the risk to the business, and acknowledged that I was breaking a promise. I then secured a firm date for the clean-up in the next quarter and protected it in the roadmap. Result: we fixed the performance problem in eight days and kept the client. The team was disappointed, but trust held because the clean-up did happen as rescheduled, and two people told me they appreciated the transparency.",
    explanation:
      'At an advanced level, leadership includes disappointing people for good reasons. The key is transparency about the trade-off, acknowledging the cost to the team and following through on what you promise next.',
    tips: ['Explain the data behind the decision.', 'Show how you communicated it and handled emotions.', 'Prove that you followed through afterwards.'],
    commonMistakes: ['Presenting the decision as easy.', 'Ignoring the impact on the team.', 'Blaming senior management to avoid responsibility.'],
    followUpQuestions: ['How did you know trust was preserved?', 'What would you have done if the team had pushed back strongly?'],
  },
  'beh-006': {
    question: 'Tell me about a time you mentored or coached someone.',
    intent: 'The interviewer wants to see how you help others grow and whether you adapt your approach to the person.',
    expectedAnswer:
      "Situation: a graduate joined our finance team and needed to produce monthly reports, but had never worked with large spreadsheets. Task: my manager asked me to help him become autonomous within three months. Action: instead of giving him answers, I asked him to try each report first and then reviewed it with him, explaining why some formulas were risky. We met for thirty minutes twice a week, and I gradually reduced my involvement as he improved. I also encouraged him to present one report to the team himself. Result: by the third month he produced the reports alone with very few corrections, and he now trains new team members on the same process.",
    explanation:
      'Effective mentoring builds autonomy. Letting the person try first, giving explanations instead of answers and reducing support over time shows a thoughtful coaching approach.',
    tips: ['Show how you adapted your support as the person progressed.', 'Measure success by their autonomy.'],
    commonMistakes: ['Describing mentoring as doing the work for them.', 'Giving no evidence of the person\'s progress.'],
    followUpQuestions: ['How do you mentor someone who does not ask for help?', 'What did you learn from mentoring?'],
  },
  'beh-007': {
    question: 'Tell me about a time you set the direction for a project or team.',
    intent: 'The interviewer wants to see whether you can turn an ambiguous situation into a clear, shared goal that guides decisions.',
    expectedAnswer:
      "Situation: our analytics team received requests from every department and worked on whatever was loudest, so nobody saw the value of our work. Task: when I became lead, I wanted to give the team a clear direction that the business would support. Action: I interviewed the heads of five departments about their biggest decisions for the year, then proposed a focus: three key dashboards tied to revenue and customer retention, with all other requests handled through a light weekly triage. I presented the plan to leadership with the expected impact and got their agreement, then shared it with the team so everyone understood why we would say no more often. Result: within six months, the retention dashboard was used in every monthly executive review, request volume became manageable and the team's satisfaction score rose noticeably in the annual survey.",
    explanation:
      'Setting direction means choosing what not to do and getting buy-in. Strong answers show research with stakeholders, a clear focus linked to business value and communication that helps the team make decisions on its own.',
    tips: ['Show how you gathered input before deciding.', 'Explain how the direction changed daily decisions.', 'Include a business result and a team result.'],
    commonMistakes: ['Describing a vision without explaining how it was adopted.', 'Ignoring the people who lost priority.'],
    followUpQuestions: ['How did you handle departments whose requests were deprioritised?', 'How did you measure success?'],
  },
  'beh-008': {
    question: 'Tell me about a time you led a change that people resisted.',
    intent: 'The interviewer is assessing change management: understanding resistance, involving people and making change stick.',
    expectedAnswer:
      "Situation: our support team used e-mail for everything, and I was asked to introduce a ticketing tool. Task: most agents saw it as extra bureaucracy and some openly refused to use it. Action: rather than pushing harder, I met the most sceptical agents to understand their fears. They worried the tool would be used to monitor them and would slow them down. I involved two of them in configuring the tool, removed fields that added no value and agreed with management that individual metrics would not be used for evaluation in the first six months. We ran a two-week pilot with volunteers, then shared the results: fewer lost requests and faster answers. Result: the full team adopted the tool within two months, average response time dropped by 35% and one of the initial sceptics became our internal trainer.",
    explanation:
      'Resistance usually hides legitimate concerns. Listening to sceptics, involving them in the design, addressing fears explicitly and proving value with a pilot are the core techniques of change leadership.',
    tips: ['Describe the reasons behind the resistance.', 'Show how you involved the people affected.', 'Prove adoption with numbers.'],
    commonMistakes: ['Describing resistant people as the problem.', 'Imposing the change and calling it success.'],
    followUpQuestions: ['What would you have done if the pilot had failed?', 'How do you handle someone who still refuses?'],
  },
  'beh-009': {
    question: 'Describe a successful team project and your role in it.',
    intent: 'The interviewer wants to understand how you contribute to collective work and whether you can describe your role precisely.',
    expectedAnswer:
      "Situation: in my final year at university, five of us had to build a mobile app for a local charity in ten weeks. Task: I was responsible for the database and for coordinating our weekly planning. Action: I designed the data model, set up a shared task board and organised a short meeting every Monday to agree on the week's goals. When our designer fell behind, I helped by preparing simple screen layouts so the developers could start. Result: we delivered a working app the charity still uses to manage volunteers, and our project received the highest grade in the class.",
    explanation:
      'Interviewers want to hear both the team result and your specific contribution. Naming your responsibilities and one moment where you helped beyond them gives a complete picture.',
    tips: ['Clarify your role at the start.', 'Mention one moment where you helped the team beyond your own task.'],
    commonMistakes: ['Saying "we" for everything so your role disappears.', 'Taking credit for the whole project.'],
    followUpQuestions: ['What was the hardest part of working together?', 'What would you change in how the team was organised?'],
  },
  'beh-010': {
    question: 'Tell me about a time you helped a colleague even though it was not your responsibility.',
    intent: 'The interviewer is looking for collaboration and a sense of shared success beyond your job description.',
    expectedAnswer:
      "Situation: a colleague in accounting had to submit a large expense report before an audit deadline, but the export from our system kept failing. Task: it was not my area, but I had used that export before and had an afternoon with lighter work. Action: I offered to help, found that a few entries contained special characters that broke the file and showed her how to clean them. We documented the fix together for the rest of the team. Result: she submitted the report on time, and the documentation saved the team several hours the following quarter.",
    explanation:
      'This shows initiative and team spirit. The best answers also show judgment: you helped when you had capacity, and you shared the solution so the problem would not repeat.',
    tips: ['Explain why you were able to help without hurting your own work.', 'Show a lasting benefit, such as documentation.'],
    commonMistakes: ['Suggesting you neglected your own work.', 'Making the colleague look incompetent.'],
    followUpQuestions: ['How do you decide when to help others?', 'What if helping meant missing your own deadline?'],
  },
  'beh-011': {
    question: 'Describe a time your team failed to reach a goal. What did you do?',
    intent: 'The interviewer wants to see how you react to collective failure: blame, withdrawal or learning.',
    expectedAnswer:
      "Situation: our marketing team aimed to generate 1,000 qualified leads in a quarter for a new product, and we reached only 600. Task: as the person in charge of the campaign analysis, I needed to understand what went wrong and help the team improve. Action: I proposed a short, blame-free review. We found that our message targeted the wrong job titles and that we had launched paid ads before the landing page was tested. I suggested two changes: testing the landing page with a small budget first and validating our target audience with the sales team. Result: the next quarter we reached 1,150 leads with the same budget, and the pre-launch test became a standard step.",
    explanation:
      'Interviewers want to see accountability at team level: analysing causes honestly, avoiding blame and turning lessons into process changes that improve results.',
    tips: ['Be factual about the gap.', 'Focus on causes and process changes, not people.', 'Show the result of the changes.'],
    commonMistakes: ['Blaming another team or a colleague.', 'Choosing a failure that was not really a failure.'],
    followUpQuestions: ['What was your personal share of the failure?', 'How did you keep the team motivated?'],
  },
  'beh-012': {
    question: 'Tell me about a time you worked with people from a different department or background.',
    intent: 'The interviewer is checking whether you can collaborate across functions, vocabulary and priorities.',
    expectedAnswer:
      "Situation: I worked as a data analyst on a project with the legal team to classify thousands of contracts. Task: I had to build a tool to help them, but we used very different vocabulary and they found my first prototype confusing. Action: I spent half a day sitting with two lawyers to watch how they actually reviewed contracts. I learned their key terms, rebuilt the interface around their review steps and set up a weekly thirty-minute feedback session. Result: the tool reduced the time to classify a contract from about twenty minutes to seven, and the legal team now involves me early in their projects.",
    explanation:
      'Cross-functional work requires understanding the other team\'s goals and language. Observing their work and adjusting your approach shows empathy and makes collaboration effective.',
    tips: ['Explain the difference in perspective or vocabulary.', 'Show what you did to understand the other side.'],
    commonMistakes: ['Presenting the other department as difficult.', 'Describing only your technical work.'],
    followUpQuestions: ['What did that team teach you?', 'How do you handle conflicting priorities between departments?'],
  },
  'beh-013': {
    question: 'Tell me about a time you depended on others to complete your work.',
    intent: 'The interviewer wants to see how you manage dependencies: communication, anticipation and what you do when others are late.',
    expectedAnswer:
      "Situation: I was preparing a pricing proposal for a large client, and I needed cost data from the procurement team. Task: the proposal was due in ten days and procurement was very busy. Action: on the first day, I explained exactly which data I needed, why and by when, and asked if a partial version first would help them. I set a reminder to check in after three days and prepared the rest of the proposal using estimates, clearly marked. When the data arrived two days late, I only had to replace the estimates. Result: we sent the proposal on time and won the contract. Procurement later told me my clear request made it easy to prioritise.",
    explanation:
      'Managing dependencies is about clear requests, early follow-up and contingency plans. Showing that you made it easy for others to help you reveals strong collaboration skills.',
    tips: ['Explain how you made your request clear.', 'Show your back-up plan.'],
    commonMistakes: ['Complaining about the other team.', 'Waiting passively until the last moment.'],
    followUpQuestions: ['What would you have done if the data had never arrived?', 'How do you follow up without being pushy?'],
  },
  'beh-014': {
    question: 'Tell me about a time you put the team\'s success ahead of your own recognition.',
    intent: 'The interviewer is looking for humility and team orientation: whether you care about the outcome more than the credit.',
    expectedAnswer:
      "Situation: I had designed a new onboarding process that our team presented to senior management. Task: the presentation was a chance to be noticed, but a colleague who had joined recently had done most of the testing with real customers. Action: I suggested she present the results section herself, prepared it with her and made sure her name was on the slides. During the meeting, I pointed out her contribution when executives asked questions. Result: the process was approved, she was invited to lead its roll-out in another region, and the team culture of sharing credit became something our manager mentioned in her feedback to the whole team.",
    explanation:
      'Interviewers value people who make others successful. Showing that you shared visibility deliberately, while the result remained strong, demonstrates maturity and leadership.',
    tips: ['Explain what you gave up and why.', 'Show the benefit for the team and the person.'],
    commonMistakes: ['Sounding bitter about not getting credit.', 'Overstating your own sacrifice.'],
    followUpQuestions: ['How do you make sure your own work is still visible?', 'Has someone done the same for you?'],
  },
  'beh-015': {
    question: 'Tell me about a time you had to integrate quickly into a new team.',
    intent: 'The interviewer wants to know how fast and how smoothly you become productive in a new environment.',
    expectedAnswer:
      "Situation: I joined a logistics company in the middle of its busiest season. Task: I had to become useful quickly without slowing the team down with too many questions. Action: in my first week, I asked my manager who the key people were and booked fifteen minutes with each of them. I kept a list of questions and asked them in batches, read the team's documentation in the evenings and volunteered for small tasks to learn the systems. I also offered to update the documentation where it was outdated. Result: by the third week I was handling deliveries on my own, and my updated guide became part of the onboarding for the next new joiners.",
    explanation:
      'Integration is about relationships and learning. Meeting key people, asking questions efficiently and contributing early with small tasks show that you are proactive and considerate of others\' time.',
    tips: ['Describe your method for the first weeks.', 'Show an early contribution.'],
    commonMistakes: ['Saying you waited for training.', 'Trying to change everything in the first week.'],
    followUpQuestions: ['What was hardest about joining that team?', 'How would you approach your first week here?'],
  },
  'beh-016': {
    question: 'Tell me about a time you worked effectively in a team spread across locations or time zones.',
    intent: 'The interviewer wants to see whether you can collaborate asynchronously and prevent the misunderstandings distance creates.',
    expectedAnswer:
      "Situation: I worked on a product team split between Europe and Asia, with only two hours of overlap per day. Task: decisions were often delayed by a full day because questions arrived when the other side was offline. Action: I proposed a few practices. Each person posted a short written update at the end of their day with blockers clearly marked. We used the overlap hours only for decisions, not status updates, and we recorded short videos to explain complex designs. I also rotated the meeting time once a month so the same people were not always joining late. Result: the average time to resolve a blocker fell from about two days to less than one, and our sprint goals became more predictable over the following quarter.",
    explanation:
      'Distributed teams depend on writing well, using synchronous time carefully and treating everyone fairly. Advanced answers show concrete practices and their measurable effect on delivery.',
    tips: ['Name the specific practices you introduced or followed.', 'Show attention to fairness between locations.', 'Give a measurable effect.'],
    commonMistakes: ['Describing only tools, not practices.', 'Ignoring cultural or time-zone fairness.'],
    followUpQuestions: ['How do you build trust with colleagues you never meet in person?', 'What doesn\'t work well asynchronously?'],
  },
  'beh-017': {
    question: 'Tell me about a time you explained something complex to someone without your expertise.',
    intent: 'The interviewer is testing whether you can adapt your language to your audience and check understanding.',
    expectedAnswer:
      "Situation: our sales director asked me why a new feature would take six weeks when it looked simple from the outside. Task: I needed to explain the technical work without jargon so she could set expectations with a client. Action: I compared the feature to adding a room to a house: the room itself is quick, but the plumbing and electricity have to connect to the existing building. I then listed the three hidden parts of the work in plain words and asked her to summarise them back to me to make sure it was clear. Result: she explained the timeline to the client confidently, the client accepted it, and she now asks me to join similar conversations early.",
    explanation:
      'Simplifying is about choosing the right comparison, removing jargon and checking understanding. Asking the person to rephrase is a strong sign that you care about real understanding.',
    tips: ['Use an analogy suited to the person.', 'Explain how you checked that they understood.'],
    commonMistakes: ['Using technical terms anyway.', 'Talking down to the other person.'],
    followUpQuestions: ['What do you do when your analogy does not work?', 'How do you explain uncertainty in estimates?'],
  },
  'beh-018': {
    question: 'Tell me about a time you had to deliver bad news.',
    intent: 'The interviewer wants to see how honest, timely and constructive you are when the message is unwelcome.',
    expectedAnswer:
      "Situation: two weeks before a planned launch, our testing showed that a key feature had serious data errors. Task: as project coordinator, I had to tell the client that we would miss the launch date. Action: I asked for a call the same day instead of waiting for the weekly meeting. I explained the problem in simple terms, took responsibility for not detecting it earlier and presented two options: launch on time without the feature or delay by ten days with everything working. I followed up in writing with the details. Result: the client chose the delay, appreciated hearing it early and renewed their contract later that year.",
    explanation:
      'Bad news is best delivered early, directly and with options. Taking responsibility and proposing solutions keeps trust even when the message is disappointing.',
    tips: ['Show that you did not delay the message.', 'Bring options, not just the problem.', 'Follow up in writing.'],
    commonMistakes: ['Softening the message so much that it becomes unclear.', 'Blaming others in front of the client.'],
    followUpQuestions: ['How did the client react in the moment?', 'What changed in your process afterwards?'],
  },
  'beh-019': {
    question: 'Tell me about a time a miscommunication caused a problem. How did you fix it?',
    intent: 'The interviewer is checking whether you take responsibility for communication failures and improve your habits.',
    expectedAnswer:
      "Situation: I asked our designer to prepare 'the new banner' for a campaign, and she produced a website banner while I needed one for social media. Task: we had lost two days and the campaign started in three. Action: I acknowledged that my request had been vague, and we agreed on the format together in a short call. She adapted the design and I handled the text variations to save time. Afterwards, I created a simple request template with format, size, deadline and purpose. Result: the campaign launched on time, and the template is now used by the whole marketing team, which has reduced back-and-forth on design requests.",
    explanation:
      'Owning your part in a miscommunication and fixing the process behind it shows accountability and continuous improvement, two qualities interviewers value.',
    tips: ['Take your share of responsibility.', 'Describe the process change that prevents a repeat.'],
    commonMistakes: ['Blaming the other person entirely.', 'Stopping the story at the quick fix.'],
    followUpQuestions: ['How do you make sure your instructions are understood now?', 'What do you do when someone else is unclear?'],
  },
  'beh-020': {
    question: 'Tell me about a time you persuaded someone to change their mind.',
    intent: 'The interviewer wants to see how you influence others: with evidence and empathy, or with pressure.',
    expectedAnswer:
      "Situation: my manager wanted to launch a customer survey with forty questions. Task: I believed response rates would be very low and wanted to convince him to shorten it. Action: rather than just disagreeing, I gathered data from our two previous surveys showing that completion dropped sharply after ten questions. I also understood his concern: he needed answers for three different departments. I proposed a ten-question core survey plus short follow-up surveys for each department. Result: he agreed, the response rate was 38% compared with 12% the previous year, and each department still received the data it needed.",
    explanation:
      'Effective persuasion combines evidence with understanding of the other person\'s goal. Offering an alternative that meets their need makes it easy for them to change their mind.',
    tips: ['Understand the other person\'s goal before arguing.', 'Use data or examples.', 'Propose an alternative, not just an objection.'],
    commonMistakes: ['Winning the argument but damaging the relationship.', 'Relying only on your opinion.'],
    followUpQuestions: ['What if he had still disagreed?', 'Tell me about a time you were not able to persuade someone.'],
  },
  'beh-021': {
    question: 'Tell me about a time you presented to senior leadership.',
    intent: 'The interviewer is assessing executive communication: being concise, focusing on decisions and handling tough questions.',
    expectedAnswer:
      "Situation: I was asked to present our team's proposal to replace an aging customer database to the executive committee, with fifteen minutes on the agenda. Task: I needed a decision on a significant budget from people with very little time and different priorities. Action: I prepared one main message: the current system creates a risk of outages during peak season and blocks two revenue initiatives. I opened with the decision I needed, followed by the cost, the risks of doing nothing and the timeline, keeping details in an appendix. I met the finance director beforehand to understand her concerns, so the numbers matched her expectations. When the CEO challenged the timeline, I explained which part was certain and which depended on a vendor. Result: the committee approved the budget in the meeting, and the finance director asked me to use the same format for later updates.",
    explanation:
      'Senior audiences want the conclusion first, clear trade-offs and honesty about uncertainty. Preparing key stakeholders before the meeting avoids surprises and is a sign of advanced communication skills.',
    tips: ['Start with the decision you need.', 'Pre-meet key stakeholders.', 'Separate what is certain from what is not.'],
    commonMistakes: ['Telling the story chronologically before reaching the point.', 'Hiding uncertainty to look confident.'],
    followUpQuestions: ['What was the hardest question you received?', 'How do you prepare for a presentation that might be cut short?'],
  },
  'beh-022': {
    question: 'Tell me about an important piece of written communication you produced.',
    intent: 'The interviewer wants to see whether you can write clearly and adapt documents to their purpose and readers.',
    expectedAnswer:
      "Situation: after a data incident affected several hundred customers, my manager asked me to write the internal report and the customer message. Task: both had to be accurate, clear and published within twenty-four hours. Action: for the internal report I used a simple structure: what happened, impact, cause, actions taken and next steps, with a timeline. For customers, I wrote a short message in plain language explaining what happened, what it meant for them and what we were doing, without technical jargon. I asked a colleague from support to read it as a customer would and adjusted two confusing sentences. Result: both documents were approved with minor changes, support received very few follow-up questions, and the report structure became our standard template for incidents.",
    explanation:
      'Good writing depends on purpose and audience. Using a clear structure, plain language and a test reader are practical techniques that interviewers recognise as professional.',
    tips: ['Explain how you adapted the writing to each audience.', 'Mention how you checked clarity.'],
    commonMistakes: ['Choosing a trivial e-mail as your example.', 'Focusing on the incident instead of the writing.'],
    followUpQuestions: ['How long did it take to write?', 'What makes a document easy to read in your opinion?'],
  },
  'beh-023': {
    question: 'Tell me about a time listening carefully helped you solve a problem.',
    intent: 'The interviewer is checking whether you listen to understand, not just to reply, especially with customers or users.',
    expectedAnswer:
      "Situation: a customer called our helpdesk for the third time about slow invoices in our software. Task: previous agents had restarted his session each time, and he was frustrated. Action: instead of applying the usual fix, I asked him to describe exactly what he did before the slowness started. While he talked, I noticed that he always exported invoices to a shared network folder. I tested the same steps and found that the export was the slow part, not the software. Result: I helped him change the export location, the problem disappeared and I shared the finding with the team, which solved similar tickets for other customers.",
    explanation:
      'Active listening means asking open questions and paying attention to details others missed. This answer shows that listening can be a problem-solving tool, not just a soft skill.',
    tips: ['Show the specific questions you asked.', 'Highlight the detail you noticed by listening.'],
    commonMistakes: ['Describing listening in general terms.', 'Forgetting the outcome for the customer.'],
    followUpQuestions: ['How do you stay patient with frustrated people?', 'How do you show someone you are listening?'],
  },
  'beh-024': {
    question: 'Tell me about a time you had to say no to an important stakeholder.',
    intent: 'The interviewer wants to see whether you can protect priorities and quality while keeping relationships strong.',
    expectedAnswer:
      "Situation: two weeks before the end of the quarter, the head of sales asked my team to add a custom report for a prospect, promising it would help close a large deal. Task: we were committed to a compliance deadline, and adding the report would have put that deadline at risk. Action: I met him the same day to understand what the prospect really needed. It turned out they wanted proof that certain data could be exported, not a full report. I explained our constraint and the cost of missing the compliance date, then proposed an alternative: a one-page export example we could produce in a day, and the full report scheduled for the next month. I confirmed the agreement in writing and copied our managers. Result: we met the compliance deadline, the prospect signed with the export example, and the head of sales now involves us earlier in his deals.",
    explanation:
      'Saying no well means understanding the real need, explaining the trade-off openly and offering an alternative. At an advanced level, you protect commitments without damaging important relationships.',
    tips: ['Find the need behind the request.', 'Explain the trade-off in business terms.', 'Offer an alternative and confirm it in writing.'],
    commonMistakes: ['Saying yes and missing the other commitment.', 'Refusing without offering anything.'],
    followUpQuestions: ['What if he had escalated to your manager?', 'How do you decide when to say yes to urgent requests?'],
  },
  'beh-025': {
    question: 'Describe a difficult problem you solved.',
    intent: 'The interviewer wants to see your problem-solving process: how you analyse, test and verify a solution.',
    expectedAnswer:
      "Situation: in my part-time job at an online shop, customers sometimes received the wrong product size. Task: my manager asked me to find out why. Action: I collected the last thirty mistaken orders and compared them. All of them had been modified by the customer after payment. I tested the process and discovered that changes made after payment were not sent to the warehouse system. I reported it to the developer with my examples, and in the meantime we added a manual check for modified orders. Result: the developer fixed the synchronisation, size errors dropped to almost zero and customer complaints in that category disappeared.",
    explanation:
      'Interviewers look for structure: gather data, find a pattern, test your hypothesis, apply a temporary solution and then a permanent one. This is useful whatever the job or level.',
    tips: ['Describe your method step by step.', 'Mention how you confirmed the cause.'],
    commonMistakes: ['Jumping straight to the solution without explaining the analysis.', 'Choosing a problem with no real difficulty.'],
    followUpQuestions: ['What would you have done if you had not found a pattern?', 'How did you prioritise this problem against your other work?'],
  },
  'beh-026': {
    question: 'Tell me about a time you had to solve a problem with incomplete information.',
    intent: 'The interviewer is assessing how you act under uncertainty: assumptions, risk and when to decide.',
    expectedAnswer:
      "Situation: a supplier informed us that a key component would be delayed, but couldn't say for how long. Task: as the planning coordinator, I had to decide how to keep production running for the next month. Action: I listed what we knew and what we didn't, then built three scenarios: a one-week, three-week and six-week delay. For each, I calculated the impact and the cost of switching to an alternative supplier. I recommended ordering a small quantity from the alternative supplier immediately, which protected us in the two longer scenarios at a limited cost, and we agreed to review the situation every Friday. Result: the delay lasted four weeks, production never stopped and the extra cost was much lower than a production stop would have been.",
    explanation:
      'With incomplete information, the best approach is to make assumptions explicit, compare scenarios and choose an action that limits the worst risks, with regular checkpoints to adjust.',
    tips: ['Separate what you knew from what you assumed.', 'Explain how you limited risk.', 'Show how you reviewed the decision as information arrived.'],
    commonMistakes: ['Waiting for perfect information.', 'Presenting a lucky guess as a strategy.'],
    followUpQuestions: ['What would have made you change your decision?', 'How did you explain the uncertainty to your manager?'],
  },
  'beh-027': {
    question: 'Tell me about a time you found the root cause of a recurring problem.',
    intent: 'The interviewer wants to see whether you go beyond quick fixes and address underlying causes.',
    expectedAnswer:
      "Situation: every Monday morning, our order system slowed down and the team restarted the server to fix it. Task: I was asked to stop it from happening rather than restarting every week. Action: I looked at the logs and metrics for the previous six weeks and noticed that a weekly cleanup job ran on Sunday night and left thousands of database connections open. I reproduced the problem in our test environment, confirmed the cause and fixed the job so it closed its connections properly. I also added an alert in case the number of connections grew again. Result: the Monday slowdown never came back, and the team saved the time spent on restarts and customer complaints.",
    explanation:
      'Root-cause analysis means looking for patterns over time, reproducing the problem and confirming the cause before fixing it. Adding monitoring shows that you think about prevention, not just repair.',
    tips: ['Explain how you identified the pattern.', 'Show how you confirmed the cause before fixing it.', 'Mention prevention.'],
    commonMistakes: ['Stopping at the first plausible explanation.', 'Describing a fix without proving it worked.'],
    followUpQuestions: ['What tools did you use to investigate?', 'Why had nobody fixed it before?'],
  },
  'beh-028': {
    question: 'Tell me about a time you came up with a creative solution to a problem.',
    intent: 'The interviewer is checking whether you can think beyond the obvious options when the usual approach does not work.',
    expectedAnswer:
      "Situation: our small nonprofit needed to translate training materials into four languages, but we had no budget for professional translators. Task: as programme coordinator, I had to find a way to deliver the materials in two months. Action: I noticed that many of our volunteers were bilingual, so I organised a 'translation weekend' where volunteers worked in pairs: one translated, the other reviewed. I prepared a glossary of key terms to keep the vocabulary consistent and asked a professional translator, who supported our cause, to review only the most important pages for free. Result: all materials were translated in five weeks at almost no cost, and volunteers said the weekend was one of their favourite events of the year.",
    explanation:
      'Creativity in interviews means combining available resources in a new way under real constraints, while still controlling quality. The glossary and review step show that the creative idea was also well executed.',
    tips: ['Describe the constraint that made the usual solution impossible.', 'Show how you ensured quality.'],
    commonMistakes: ['Describing an idea that was never implemented.', 'Ignoring risks of the creative approach.'],
    followUpQuestions: ['What risks did you see in that approach?', 'How do you encourage creative ideas in a team?'],
  },
  'beh-029': {
    question: 'Tell me about a time you solved a problem under time pressure.',
    intent: 'The interviewer wants to see whether you stay methodical when time is short.',
    expectedAnswer:
      "Situation: one hour before a webinar with three hundred registered participants, our presentation platform stopped working. Task: as the event organiser, I had to make sure the webinar happened on time. Action: I asked a colleague to contact the platform's support while I set up a back-up meeting on another tool we already used. I prepared a short message with the new link and sent it to participants by e-mail and on our social media thirty minutes before the start. I also asked the speaker to test the new tool with me. Result: the webinar started five minutes late with more than 250 participants, and we added a back-up plan to our event checklist.",
    explanation:
      'Under time pressure, effective people divide tasks, pursue a fix and a back-up in parallel, and communicate early. Turning the experience into a checklist shows learning.',
    tips: ['Show how you organised the response quickly.', 'Mention communication with the people affected.'],
    commonMistakes: ['Describing panic without method.', 'Forgetting what you changed afterwards.'],
    followUpQuestions: ['What would you have done if the back-up tool had failed too?', 'How do you prepare for this kind of situation now?'],
  },
  'beh-030': {
    question: 'Tell me about a time your first solution did not work.',
    intent: 'The interviewer is assessing persistence and your ability to learn from failed attempts instead of repeating them.',
    expectedAnswer:
      "Situation: our website's checkout page had a high abandonment rate. Task: I was asked to improve the conversion rate. Action: my first idea was to simplify the design, so we removed several fields. After two weeks the results hadn't changed. Instead of trying another design change, I looked at session recordings and customer feedback, and found that many users left when they saw the delivery costs at the last step. I proposed showing delivery costs on the product page instead. Result: abandonment dropped by 18% in the following month. I learned to understand the cause better before testing a solution.",
    explanation:
      'Failed first attempts are normal. What matters is recognising quickly that it did not work, investigating more deeply and adjusting your method, not just trying random alternatives.',
    tips: ['Be honest about the failed attempt.', 'Show what you learned about your own method.'],
    commonMistakes: ['Hiding the failure.', 'Changing many things at once without understanding why.'],
    followUpQuestions: ['How quickly did you realise it wasn\'t working?', 'How do you decide when to stop trying an approach?'],
  },
  'beh-031': {
    question: 'Tell me about a time you prevented a problem before it happened.',
    intent: 'The interviewer wants to see foresight: spotting risks early, convincing others and acting before damage occurs.',
    expectedAnswer:
      "Situation: our company planned to move all customer data to a new cloud provider over a single weekend. Task: as a member of the operations team, I reviewed the plan and saw that there was no tested way to go back if the migration failed. Action: I wrote a short risk note explaining what could go wrong, the likely impact on customers and the cost of a full day of downtime. I proposed a rehearsal on a copy of the data and a clear rollback procedure. Management agreed to postpone by one week. During the rehearsal we discovered that a large table took six hours longer to copy than expected. Result: we adjusted the plan, the real migration finished within the window and customers experienced no outage. The rehearsal step became mandatory for future migrations.",
    explanation:
      'Prevention is invisible when it works, so strong answers explain the risk, the evidence that convinced others and what the rehearsal or check actually revealed. This shows foresight and influence.',
    tips: ['Quantify the risk you identified.', 'Explain how you convinced others to act.', 'Show what the prevention actually uncovered.'],
    commonMistakes: ['Describing a risk that never had real consequences.', 'Taking all the credit for a team effort.'],
    followUpQuestions: ['How did you handle the pressure to keep the original date?', 'How do you spot risks in other people\'s plans?'],
  },
  'beh-032': {
    question: 'Tell me about a time you solved a problem with very limited resources.',
    intent: 'The interviewer is checking resourcefulness, prioritisation and your ability to deliver value under constraints.',
    expectedAnswer:
      "Situation: our customer service team lost two of its six agents during a hiring freeze, just before the peak season. Task: as team lead, I needed to keep response times acceptable without new hires or a bigger budget. Action: I analysed the previous year's requests and found that 40% were about order tracking. With a colleague, I wrote clear answers to the ten most common questions and asked the web team to add a tracking link to every confirmation e-mail. I also reorganised shifts so our strongest agents covered the busiest hours. Result: incoming requests dropped by 30% during the peak and our average response time stayed under four hours, compared with six the year before with a full team.",
    explanation:
      'With limited resources, the most effective approach is to reduce demand and focus effort where it matters most. Data-driven prioritisation and small, cheap changes often outperform working harder.',
    tips: ['Start with the data that guided your choices.', 'Show both demand reduction and efficiency gains.', 'Compare results to a baseline.'],
    commonMistakes: ['Solving the problem only by asking people to work overtime.', 'Giving no measurable outcome.'],
    followUpQuestions: ['What did you decide not to do?', 'How did the team feel during that period?'],
  },
  'beh-033': {
    question: 'Tell me about a disagreement you had with a colleague.',
    intent: 'The interviewer wants to see whether you can disagree respectfully, focus on the issue and reach a solution.',
    expectedAnswer:
      "Situation: a colleague and I were preparing a client proposal, and we disagreed on the pricing: he wanted a single package, I wanted three options. Task: we had to send a proposal both of us could stand behind within two days. Action: I suggested we each write down our reasons. His concern was that options would confuse the client; mine was that a single price might be too high for their budget. We agreed to ask the account manager what she knew about the client's decision process. She told us the client compared offers carefully, so we proposed two clear options with a simple comparison table. Result: the client chose the higher option, and my colleague and I kept working well together on later proposals.",
    explanation:
      'Interviewers look for respectful disagreement: understanding the other point of view, using facts or a neutral source and reaching a decision that serves the goal. Preserving the relationship is part of the result.',
    tips: ['Present the other person\'s view fairly.', 'Show how you reached a shared decision.'],
    commonMistakes: ['Choosing a story where you were simply right and the other person wrong.', 'Describing personal tension instead of a professional disagreement.'],
    followUpQuestions: ['What would you have done if you had not reached agreement?', 'How do you usually react when someone disagrees with you?'],
  },
  'beh-034': {
    question: 'Tell me about a time you disagreed with your manager.',
    intent: 'The interviewer is checking whether you can challenge upward respectfully and accept a final decision professionally.',
    expectedAnswer:
      "Situation: my manager wanted to launch a new feature to all users at once. Task: I believed a gradual release was safer, because the feature changed how payments were calculated. Action: I asked for a short meeting and explained my concern with data from a previous release that had caused support tickets. I proposed releasing to 10% of users first, for one week. My manager explained that marketing had already announced the date, so we agreed on a compromise: launch to everyone on the planned day, but with a feature switch to turn it off quickly and extra monitoring. Result: we found a small rounding issue on the first day, turned the feature off for an hour to fix it and avoided a wider problem. My manager later asked me to help define our release guidelines.",
    explanation:
      'A good answer shows you raised the disagreement privately, with evidence, and accepted the final decision while still reducing the risk. It demonstrates both courage and loyalty.',
    tips: ['Raise disagreement privately and with facts.', 'Show that you respected the final decision.'],
    commonMistakes: ['Describing your manager negatively.', 'Telling a story where you ignored the decision.'],
    followUpQuestions: ['What if the manager had refused any compromise?', 'When is it worth escalating a disagreement?'],
  },
  'beh-035': {
    question: 'Tell me about a time you dealt with a difficult customer or client.',
    intent: 'The interviewer wants to see whether you stay calm, understand the real issue and protect both the relationship and the company.',
    expectedAnswer:
      "Situation: a client called, very angry, because an order for their shop opening had arrived incomplete. Task: as the account manager, I needed to calm the situation and find a solution before their opening two days later. Action: I let him explain without interrupting, then summarised his problem to show I understood. I apologised for the inconvenience and checked the stock while he was on the phone. I arranged express delivery of the missing items at our cost and called him the next morning to confirm the tracking number. Result: the items arrived the day before the opening, the client thanked us and he placed a larger order the following month.",
    explanation:
      'Handling difficult customers starts with listening and acknowledging their frustration, followed by fast and concrete action. Following up proactively turns a negative experience into a positive one.',
    tips: ['Show how you de-escalated.', 'Describe the concrete solution and the follow-up.'],
    commonMistakes: ['Criticising the customer.', 'Promising something you could not deliver.'],
    followUpQuestions: ['What do you do when a customer\'s request is unreasonable?', 'How do you protect yourself from stress in those calls?'],
  },
  'beh-036': {
    question: 'Tell me about a time you helped resolve a conflict between two colleagues.',
    intent: 'The interviewer is assessing mediation skills: neutrality, understanding both sides and finding a lasting solution.',
    expectedAnswer:
      "Situation: two senior members of my team were in open conflict over how to handle customer escalations: one wanted to answer immediately, the other wanted to analyse each case first. Meetings had become tense and others avoided working with them. Task: as team lead, I needed to resolve it before it affected service quality. Action: I met each person separately to listen without judging. Both had valid concerns: speed for customers and quality of answers. I then brought them together, restated their shared goal and asked them to design the process together. They agreed on a two-step approach: a quick acknowledgement within an hour and a full answer within a day. I documented the process and checked in with both a month later. Result: escalation response times improved, the tension disappeared and the two of them co-presented the process to another team.",
    explanation:
      'Good mediation means meeting each party privately, identifying legitimate interests and making them co-own the solution. Following up later checks that the solution lasts.',
    tips: ['Stay neutral in the way you describe both people.', 'Show that they built the solution themselves.', 'Mention the follow-up.'],
    commonMistakes: ['Taking sides in your story.', 'Solving the conflict by imposing a rule without listening.'],
    followUpQuestions: ['What would you have done if one of them refused to cooperate?', 'When should a manager step in on a conflict?'],
  },
  'beh-037': {
    question: 'Tell me about a time someone took credit for your work.',
    intent: 'The interviewer wants to see whether you handle unfair situations calmly and constructively, without drama.',
    expectedAnswer:
      "Situation: I prepared a market analysis that a colleague presented to our director as if he had done it alone. Task: I wanted my contribution to be recognised without creating a conflict. Action: I first talked to my colleague privately and calmly. He said he had simply forgotten to mention me. I asked him to correct it in his follow-up e-mail to the director, which he did. I also started sharing my work in a team channel before meetings, so contributions were visible to everyone. Result: the director thanked me for the analysis, my relationship with my colleague stayed good and my work became more visible in general.",
    explanation:
      'This question tests emotional control and professionalism. Addressing the issue directly and privately, assuming good intent first and improving visibility in the future is a mature approach.',
    tips: ['Talk about the facts, not your feelings toward the person.', 'Show how you prevented it from happening again.'],
    commonMistakes: ['Complaining publicly or going straight to the manager.', 'Doing nothing and staying resentful.'],
    followUpQuestions: ['What if it had happened again?', 'How do you make your work visible without seeming boastful?'],
  },
  'beh-038': {
    question: 'Tell me about a time you received criticism you felt was unfair.',
    intent: 'The interviewer is checking how you react when you disagree with feedback: defensiveness, withdrawal or constructive dialogue.',
    expectedAnswer:
      "Situation: in my annual review, my manager said I was not proactive enough in meetings. Task: I felt it was unfair because I contributed a lot in writing, and I wanted to understand her view rather than simply reject it. Action: I asked for specific examples. She mentioned two planning meetings where I stayed silent and shared my ideas by e-mail afterwards, when decisions were already made. I explained that I prefer to think before speaking, and we agreed that I would send my comments before meetings instead of after. Result: my ideas started influencing decisions earlier, and at my next review she highlighted my contributions to planning. I realised the criticism was partly fair, even if the wording surprised me.",
    explanation:
      'The best answers show that you sought to understand the feedback before judging it, found the part that was valid and agreed on a change. Admitting the criticism was partly right shows self-awareness.',
    tips: ['Ask for examples before reacting.', 'Show what part of the feedback was valid.'],
    commonMistakes: ['Explaining why the manager was wrong.', 'Pretending you accepted the criticism without any discussion.'],
    followUpQuestions: ['How do you react in the moment when you hear criticism?', 'Have you ever disagreed with feedback and kept your position?'],
  },
  'beh-039': {
    question: 'Tell me about a time two teams had conflicting priorities and you had to resolve it.',
    intent: 'The interviewer wants to see whether you can resolve organisational conflict by focusing on shared goals and escalating appropriately.',
    expectedAnswer:
      "Situation: the marketing team needed our data team to build reports for a campaign, while the finance team needed us to automate month-end reporting, both within the same three weeks. Task: as the data team lead, I couldn't do both fully and both managers insisted their work was urgent. Action: I asked each team what decision their request supported and what would happen if it came two weeks later. Marketing needed only two key numbers before the launch; finance faced a real audit deadline. I proposed delivering a simple manual version of the two marketing numbers in three days, then focusing on finance, and finishing the full marketing reports after month-end. Because both managers had agreed to the criteria, I presented the plan to them together and asked our director to confirm it. Result: finance met the audit deadline, marketing launched on time with the numbers it needed and both teams accepted the next quarter's planning process I proposed.",
    explanation:
      'Advanced conflict resolution relies on objective criteria (impact, deadlines, alternatives), creative partial solutions and transparent escalation when needed. It shows you can act in the company\'s interest rather than one team\'s.',
    tips: ['Explain the criteria you used to decide.', 'Look for a partial solution that meets the most urgent need.', 'Show how you escalated transparently.'],
    commonMistakes: ['Choosing the team with the most senior manager.', 'Trying to do everything and failing both teams.'],
    followUpQuestions: ['How did you communicate the decision to your own team?', 'What would you do if the director had disagreed?'],
  },
  'beh-040': {
    question: 'Tell me about a time you worked with someone you did not get along with.',
    intent: 'The interviewer wants to know whether personal differences affect your work and how you build a functional relationship.',
    expectedAnswer:
      "Situation: in a group project at university, one teammate was very direct and often dismissed ideas quickly, which annoyed me. Task: we had to deliver a market study together over two months, so I needed a working relationship. Action: I asked him for a coffee to talk about how we liked to work. I learned that he was under pressure because of a part-time job and wanted meetings to be short. We agreed on a clear agenda for each meeting and on sharing ideas in writing before discussing them. Result: our meetings became shorter and calmer, the project got a good grade and I learned that understanding someone's constraints changes how you see their behaviour.",
    explanation:
      'Interviewers want professionals who can work with anyone. Understanding the other person\'s situation and agreeing on simple working rules are mature and practical approaches.',
    tips: ['Describe the person neutrally.', 'Show what you did to improve the relationship.'],
    commonMistakes: ['Criticising the other person.', 'Saying you get along with everyone.'],
    followUpQuestions: ['What type of personality do you find hardest to work with?', 'What did you change in your own behaviour?'],
  },
};
