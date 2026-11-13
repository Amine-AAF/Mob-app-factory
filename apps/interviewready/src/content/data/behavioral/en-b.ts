import type { QuestionText, TextTable } from '@/types/content';

/** Behavioral questions 041-080: adaptability, time management, decision making, accountability, critical thinking. */
export const enB: TextTable<QuestionText> = {
  'beh-041': {
    question: 'Tell me about a time your priorities changed suddenly.',
    intent: 'The interviewer wants to see whether you can re-plan quickly and communicate the impact of a change.',
    expectedAnswer:
      "Situation: I was halfway through preparing a training programme for new sales staff when my manager asked me to focus on a client audit starting the next week. Task: I had to switch to the audit without losing the work already done on the training. Action: I spent an hour writing down where I was on the training and what remained, so I could restart quickly later. I told the people waiting for the training about the new date. Then I met the audit lead to understand what she needed from me and organised my week around it. Result: the audit went smoothly, and I resumed the training two weeks later and delivered it only one week behind the original plan.",
    explanation:
      'Adaptability is not just accepting change; it is managing its consequences. Saving your progress, informing the people affected and organising quickly around the new priority show professionalism.',
    tips: ['Show how you protected the work you had to pause.', 'Mention who you informed about the change.'],
    commonMistakes: ['Complaining about the change.', 'Dropping the first task without telling anyone.'],
    followUpQuestions: ['How do you react when priorities change very often?', 'How do you decide what to drop?'],
  },
  'beh-042': {
    question: 'Tell me about a time you had to learn a new tool or technology quickly.',
    intent: 'The interviewer is assessing your learning speed and method when a new tool is needed for the job.',
    expectedAnswer:
      "Situation: my company switched to a new customer relationship management tool with only one week of notice. Task: as team assistant, I had to be able to train my colleagues in that tool in two weeks. Action: I followed the official tutorials in the evenings, created a test account to practise the most common tasks and wrote a two-page cheat sheet with screenshots. I also joined the tool's user community to find answers to specific questions. Result: I trained my eight colleagues in two short sessions, and the team was fully using the tool by the end of the month.",
    explanation:
      'Interviewers want a concrete learning method: official resources, hands-on practice and a way to share knowledge. Teaching others is strong proof that you mastered the tool.',
    tips: ['Describe your learning method.', 'Show how you applied or shared what you learned.'],
    commonMistakes: ['Saying you learn fast without proof.', 'Describing only passive learning such as watching videos.'],
    followUpQuestions: ['What was hardest about that tool?', 'How do you keep learning once you are productive?'],
  },
  'beh-043': {
    question: 'Tell me about a time you adapted to a new manager or a reorganisation.',
    intent: 'The interviewer wants to know whether you stay effective and positive when your work environment changes.',
    expectedAnswer:
      "Situation: after a reorganisation, my team merged with another one and I got a new manager with a very different style: she preferred written plans, while my previous manager liked quick discussions. Task: I wanted to keep delivering and build a good relationship with her quickly. Action: I asked her in our first one-to-one how she liked to receive updates and what she expected in the first three months. I started sending a short weekly written summary and prepared one-page plans before proposing new initiatives. Result: within a few weeks she told me my updates helped her understand the merged team's work, and she gave me responsibility for coordinating our two former teams.",
    explanation:
      'Adapting to a new manager means understanding their expectations and adjusting your communication. Asking directly is simple and effective, and shows you take responsibility for the relationship.',
    tips: ['Explain what was different and how you adapted.', 'Show the result for the relationship.'],
    commonMistakes: ['Comparing the new manager negatively with the old one.', 'Waiting for the manager to adapt to you.'],
    followUpQuestions: ['What do you do if you disagree with a new manager\'s approach?', 'How did your colleagues react to the reorganisation?'],
  },
  'beh-044': {
    question: 'Tell me about a time you had to work with very unclear instructions.',
    intent: 'The interviewer is checking how you handle ambiguity: whether you clarify, make reasonable assumptions and move forward.',
    expectedAnswer:
      "Situation: our director asked me to 'improve the customer onboarding experience' without more details or a deadline. Task: I needed to turn this vague request into something concrete and useful. Action: I asked her two questions: what problem she had noticed, and how she would know it had improved. She mentioned complaints about the first week. I then reviewed support tickets from new customers, interviewed five of them and wrote a one-page proposal with three improvements, a timeline and a success measure. I sent it to her for validation before starting. Result: she approved two of the three improvements, and complaints from new customers fell by about a third over the next quarter.",
    explanation:
      'Ambiguity is common in real jobs. The strongest approach is to ask a few targeted questions, gather facts, propose a concrete plan and validate it before investing time.',
    tips: ['Show the questions you asked to clarify.', 'Validate your interpretation before doing the work.'],
    commonMistakes: ['Doing nothing until instructions became clear.', 'Starting a big project based on assumptions without checking.'],
    followUpQuestions: ['What if she had not been available to answer?', 'How do you document assumptions?'],
  },
  'beh-045': {
    question: 'Tell me about a time you adapted your communication style to someone.',
    intent: 'The interviewer wants to see whether you notice how others prefer to communicate and adjust to be effective.',
    expectedAnswer:
      "Situation: I worked with a supplier contact who rarely answered my detailed e-mails, which delayed our orders. Task: I needed faster answers without damaging the relationship. Action: during a call, I asked how he preferred to work. He explained that he managed dozens of clients from his phone and found long e-mails hard to read. I started sending very short messages with one clear question and the deadline in the first line, and I called him for anything complex. Result: his response time went from several days to a few hours, and our orders were no longer delayed.",
    explanation:
      'Good communicators adapt to the other person rather than expecting the opposite. Asking about preferences and changing the format is a simple and powerful demonstration of this skill.',
    tips: ['Explain how you discovered the person\'s preference.', 'Describe exactly what you changed.'],
    commonMistakes: ['Blaming the other person for not communicating well.', 'Describing a change without any result.'],
    followUpQuestions: ['How do you adapt when presenting to a large group with different preferences?', 'What is your natural communication style?'],
  },
  'beh-046': {
    question: 'Tell me about a time a plan failed and you had to improvise.',
    intent: 'The interviewer is assessing your composure and ability to find alternatives when things go wrong at the last minute.',
    expectedAnswer:
      "Situation: I organised a product training day for thirty retail staff, and the morning of the event, the shipment of demonstration products was blocked at customs. Task: the training had to happen that day because the staff came from different cities. Action: I quickly reorganised the agenda to start with the theory and sales techniques sessions, which didn't need the products. Meanwhile, I contacted a nearby store and borrowed five display units for the afternoon. I split the group into small teams so everyone could handle the products in rotation. Result: the training finished on schedule, the feedback score was 4.5 out of 5, and I added a 'products delivered three days in advance' rule to our event checklist.",
    explanation:
      'Improvising well means protecting the main goal, using available resources creatively and keeping people informed. Turning the incident into a preventive rule shows learning.',
    tips: ['Show how you protected the main objective.', 'Explain what you changed for next time.'],
    commonMistakes: ['Telling a story where luck solved the problem.', 'Forgetting the people affected by the change.'],
    followUpQuestions: ['What was your back-up if the store had said no?', 'How do you stay calm in those moments?'],
  },
  'beh-047': {
    question: 'Tell me about a time you had to adapt to a very different culture, team or country.',
    intent: 'The interviewer wants evidence of cultural awareness and your ability to adjust without losing effectiveness.',
    expectedAnswer:
      "Situation: I moved from a small, informal start-up to a large bank where decisions required formal approval and written documentation. Task: I needed to deliver a new reporting tool in six months in an environment where my usual way of working, quick decisions in chat, didn't fit. Action: I asked an experienced colleague to explain how decisions were really made, including who needed to be consulted informally before a committee. I started preparing short written proposals and booked time with key reviewers before each formal meeting. I also kept some of my start-up habits, like showing early prototypes, but presented them in the format people expected. Result: the tool was approved at the first committee, delivered on time, and my approach of showing prototypes early was adopted by two other teams.",
    explanation:
      'Cultural adaptation at an advanced level means understanding unwritten rules, adjusting your behaviour and still bringing your own strengths in a way the new culture accepts. This balance is what interviewers look for.',
    tips: ['Explain the specific cultural differences.', 'Show what you adapted and what you kept.', 'Mention who helped you understand the culture.'],
    commonMistakes: ['Describing one culture as better than the other.', 'Adapting so much that you brought nothing new.'],
    followUpQuestions: ['What was the hardest habit to change?', 'How would you help a newcomer adapt to our culture?'],
  },
  'beh-048': {
    question: 'Tell me about a time you took on a role or task far outside your expertise.',
    intent: 'The interviewer is assessing courage, learning ability and whether you manage the risks of working outside your comfort zone.',
    expectedAnswer:
      "Situation: our company's only HR person left suddenly, and as office manager I was asked to handle recruitment for three open positions until a replacement was hired. Task: I had never recruited anyone, and the hiring managers needed candidates within two months. Action: I asked a recruiter in my network for an hour of advice, reused job descriptions from similar companies and agreed with each hiring manager on three must-have criteria. I created a simple scoring sheet so interviews were consistent and fair, and I checked legal requirements for job ads with our external lawyer. I was clear with managers that I was learning and asked for their feedback after each step. Result: we hired two of the three roles within seven weeks, both new hires passed their probation period and my scoring sheet was kept by the new HR manager.",
    explanation:
      'Taking on unfamiliar work responsibly means getting expert advice, creating structure, checking risks such as legal rules and being transparent about your learning. The interviewer wants to see both boldness and good judgment.',
    tips: ['Show how you managed the risks of inexperience.', 'Mention the experts you consulted.', 'Be transparent about what you did not achieve.'],
    commonMistakes: ['Pretending you became an expert overnight.', 'Ignoring the risks of making mistakes.'],
    followUpQuestions: ['What would you do differently with more experience?', 'Would you want to do that kind of work again?'],
  },
  'beh-049': {
    question: 'Tell me about a time you had several deadlines at the same time.',
    intent: 'The interviewer wants to see how you plan, prioritise and communicate when workload peaks.',
    expectedAnswer:
      "Situation: at the end of a semester, I had two exams, a group project and my part-time job in the same week. Task: I needed to deliver everything without lowering the quality of the project my group depended on. Action: I listed every deadline and estimated the time each task needed. I agreed with my manager to swap one shift for the following week and told my group in advance which days I would work on the project. I studied in short, fixed blocks each morning and kept evenings for the project. Result: I submitted my part of the project a day early, passed both exams and didn't miss any work hours overall.",
    explanation:
      'Interviewers look for a method: list tasks, estimate effort, negotiate what can move and plan specific blocks. Communicating early with the people involved is a key part of time management.',
    tips: ['Show how you planned the week.', 'Mention what you negotiated or moved.'],
    commonMistakes: ['Saying you simply worked all night.', 'Forgetting to mention how you protected quality.'],
    followUpQuestions: ['How do you estimate how long tasks take?', 'What happens when your plan doesn\'t work?'],
  },
  'beh-050': {
    question: 'Tell me about a time you missed a deadline.',
    intent: 'The interviewer is checking honesty, accountability and what you learned from the experience.',
    expectedAnswer:
      "Situation: I was responsible for delivering a monthly sales report to our regional managers by the fifth working day. Task: one month, data from a new region arrived in a different format and I underestimated the time needed to clean it. Action: when I realised on the fourth day that I would be late, I informed the managers immediately, sent them a partial report with the regions that were ready and gave a precise new date. I then created a template for the new region and agreed with its team on a standard format. Result: I delivered the full report one day late, and since then the report has always been on time, including for two more regions that joined later.",
    explanation:
      'Everyone misses deadlines sometimes. Interviewers want to see that you warned people early, limited the impact and fixed the cause so it would not happen again.',
    tips: ['Choose a real example with limited consequences.', 'Show that you warned people before the deadline.', 'Explain the change that prevented repetition.'],
    commonMistakes: ['Saying you have never missed a deadline.', 'Blaming others for the delay.'],
    followUpQuestions: ['When do you decide to warn people about a delay?', 'How did the managers react?'],
  },
  'beh-051': {
    question: 'Tell me about a time everything seemed urgent. How did you prioritise?',
    intent: 'The interviewer wants to see the criteria you use to prioritise and how you handle competing demands.',
    expectedAnswer:
      "Situation: on a Monday morning as IT support, I had a broken printer in the finance department, a new employee without access to her accounts and a manager asking for a software installation. Task: all three people said their request was urgent. Action: I quickly assessed the impact of each: the new employee couldn't work at all, finance had a second printer on another floor and the installation could wait until the afternoon. I created the employee's accounts first, sent a message to finance pointing them to the other printer and told the manager when I would come. Result: the new employee was working within thirty minutes, the printer was fixed before noon and the installation was done that afternoon with no complaints.",
    explanation:
      'Good prioritisation uses explicit criteria such as business impact, number of people affected and available alternatives. Telling everyone when they will be helped manages expectations and reduces pressure.',
    tips: ['State the criteria you used.', 'Show how you communicated with the people who had to wait.'],
    commonMistakes: ['Handling requests in arrival order without thinking.', 'Prioritising the person who shouted the loudest.'],
    followUpQuestions: ['What if two senior managers asked at the same time?', 'Do you use any tool to manage priorities?'],
  },
  'beh-052': {
    question: 'Tell me about a time you improved the way you or your team worked.',
    intent: 'The interviewer is looking for initiative and continuous improvement: spotting waste and fixing it.',
    expectedAnswer:
      "Situation: in our accounting team, every invoice required approval by e-mail, and we spent hours each week chasing replies. Task: I wanted to reduce that time without changing who approved what. Action: I measured how long approvals took over a month: on average four days. I proposed using the approval feature already included in our accounting software and tested it with one department. I wrote a one-page guide and showed managers how to approve from their phones. Result: the average approval time dropped to one day, and the team saved around five hours a week of follow-up e-mails.",
    explanation:
      'Improvement stories are stronger with a baseline measurement, a small test and a measured result. Using existing tools also shows good judgment about cost and adoption.',
    tips: ['Measure the situation before and after.', 'Start with a small test.'],
    commonMistakes: ['Describing an improvement nobody adopted.', 'Changing processes without involving the people affected.'],
    followUpQuestions: ['How did you convince the managers?', 'What other improvements would you like to make?'],
  },
  'beh-053': {
    question: 'Tell me about a long project you managed. How did you keep it on track?',
    intent: 'The interviewer wants to assess planning, milestone tracking and how you handle drift over many months.',
    expectedAnswer:
      "Situation: I coordinated the move of our company's 120 employees to a new office, a nine-month project involving the landlord, IT, furniture suppliers and every department. Task: the move had to happen during a single weekend to avoid stopping operations. Action: I worked backwards from the move date to define monthly milestones and owners, with a simple shared plan reviewed every two weeks with each supplier. I tracked a short list of top risks, such as delays in network installation, and agreed on a decision deadline for each one. When the network installer announced a three-week delay in month six, our plan already had a buffer, and I negotiated weekend work in exchange for moving their payment date earlier. Result: the move happened on the planned weekend, all employees could work on Monday morning and the project finished 4% under budget.",
    explanation:
      'Long projects need milestones, clear owners, regular reviews and active risk management. Planning buffers and decision deadlines in advance is what keeps delays from becoming failures.',
    tips: ['Describe the planning method and review rhythm.', 'Show a real issue and how your plan absorbed it.', 'Finish with results on time, budget and quality.'],
    commonMistakes: ['Listing tasks without explaining how you tracked progress.', 'Claiming nothing went wrong.'],
    followUpQuestions: ['How did you keep stakeholders engaged over nine months?', 'What would you plan differently?'],
  },
  'beh-054': {
    question: 'Tell me about a time constant interruptions threatened your work. What did you do?',
    intent: 'The interviewer wants to see how you protect focused work while staying available to others.',
    expectedAnswer:
      "Situation: as the only person in my team who knew our reporting tool, colleagues asked me questions all day, and I was falling behind on my own analysis. Task: I needed time to concentrate without leaving colleagues stuck. Action: I noted the questions I received for a week and found that most of them were the same five. I wrote a short FAQ and shared it with the team, then set two 'question slots' per day, at 11 a.m. and 4 p.m., except for real emergencies. Result: interruptions dropped by more than half, I delivered my analysis on time and two colleagues started answering simple questions themselves using the FAQ.",
    explanation:
      'This answer shows analysis of the problem, a solution that reduces demand and clear rules that stay helpful to others. Interviewers appreciate solutions that improve the team, not just your own comfort.',
    tips: ['Explain how you understood the source of interruptions.', 'Show that colleagues were still supported.'],
    commonMistakes: ['Simply ignoring messages.', 'Complaining about colleagues.'],
    followUpQuestions: ['How do you handle urgent requests during focused time?', 'How did colleagues react to the new rule?'],
  },
  'beh-055': {
    question: 'Tell me about a time you negotiated a deadline.',
    intent: 'The interviewer is checking whether you can push back on unrealistic timelines with evidence and alternatives.',
    expectedAnswer:
      "Situation: a client asked our agency to deliver a full website redesign in three weeks for a trade fair. Task: as project manager, I knew our team needed at least six weeks for the complete site. Action: instead of saying no, I asked what they absolutely needed for the fair. The answer was a new home page, a product catalogue and a contact form. I showed the client a breakdown of the work and proposed delivering those three elements in three weeks, then the rest of the site three weeks after the fair. Result: the client agreed, the essential pages were live a day before the fair and the full site was delivered on the second date.",
    explanation:
      'Negotiating a deadline works best when you understand the real need, show the work involved and offer a phased solution. It turns a refusal into a partnership.',
    tips: ['Show the evidence you used.', 'Offer what can be delivered on time.'],
    commonMistakes: ['Accepting an impossible deadline and failing.', 'Refusing without offering an alternative.'],
    followUpQuestions: ['What if the client had refused the phased approach?', 'How do you build estimates you can defend?'],
  },
  'beh-056': {
    question: 'Tell me about a time you had to balance speed and quality.',
    intent: 'The interviewer wants to see your judgment about acceptable trade-offs and how you limit the risks of going faster.',
    expectedAnswer:
      "Situation: a competitor launched a feature similar to ours, and leadership wanted our new version released two weeks earlier than planned. Task: as the lead on the project, I had to decide what we could cut without putting customers at risk. Action: I classified the remaining work into three groups: what affected data or payments, what affected the main user journey and what was cosmetic. We kept full testing for the first group, reduced testing to the main scenarios for the second and postponed most of the cosmetic work. I documented the postponed items as a list with owners and dates, explained the remaining risks to leadership in writing and added extra monitoring for the first week. Result: we released ten days early with no critical incidents, two minor display bugs were fixed the following week and all postponed items were completed within a month.",
    explanation:
      'Advanced candidates do not choose between speed and quality in the abstract. They separate risks by severity, protect what must not fail, document compromises and monitor closely. Making trade-offs explicit and reversible is the key.',
    tips: ['Explain how you classified risks.', 'Show how you documented and later repaid the compromises.', 'Mention monitoring after release.'],
    commonMistakes: ['Cutting quality everywhere to meet the date.', 'Refusing any compromise when the business need is real.'],
    followUpQuestions: ['What would you never cut, even under pressure?', 'How did you make sure the postponed work really happened?'],
  },
  'beh-057': {
    question: 'Tell me about a difficult decision you had to make.',
    intent: 'The interviewer wants to see how you weigh options and take responsibility for a choice.',
    expectedAnswer:
      "Situation: I was offered a full-time position at the company where I did my internship, but I had also been accepted into a one-year master's programme abroad. Task: I had to choose within two weeks. Action: I listed what each option would give me in skills, network and long-term goals. I talked to two people who had followed each path and asked my internship manager whether a later return would be possible. She said the door would stay open. I chose the master's because it matched my goal of working in international projects. Result: I completed the master's, and the skills I gained, especially working in multicultural teams, are directly relevant to the role I'm applying for today.",
    explanation:
      'Interviewers look for a thoughtful process: clear criteria, advice from others, consideration of risks and ownership of the final choice. Personal career decisions are acceptable examples for early-career candidates.',
    tips: ['Explain your criteria.', 'Show who you consulted.', 'Link the decision to the present.'],
    commonMistakes: ['Choosing a decision with no real dilemma.', 'Letting someone else decide for you.'],
    followUpQuestions: ['Do you regret anything about that choice?', 'How do you make decisions when your criteria conflict?'],
  },
  'beh-058': {
    question: 'Tell me about a time you made a decision without having all the information.',
    intent: 'The interviewer is assessing judgment under uncertainty and how you limit the consequences of a possible mistake.',
    expectedAnswer:
      "Situation: during a regional power cut, our call centre manager was unreachable and I was the most senior agent on duty. Task: I had to decide quickly whether to redirect calls to our other office, which would cost money and disrupt their schedule. Action: I checked what I could: the power company estimated at least three hours of outage, and our queue was growing fast. I decided to redirect calls for two hours only, informed the other office and left a written message for my manager explaining my reasoning. I checked the situation every thirty minutes. Result: power returned after two and a half hours, customers waited on average less than five minutes and my manager confirmed she would have made the same decision.",
    explanation:
      'When information is missing, strong candidates gather what they can quickly, choose a reversible or time-limited option, document their reasoning and keep checking. This shows judgment and accountability.',
    tips: ['Explain what you knew and what you didn\'t.', 'Show how you limited the risk of being wrong.'],
    commonMistakes: ['Waiting until it was too late to decide.', 'Taking a big, irreversible decision without checking anything.'],
    followUpQuestions: ['What would you have done if your decision had been wrong?', 'How did you document your reasoning?'],
  },
  'beh-059': {
    question: 'Tell me about a time you used data to make a decision.',
    intent: 'The interviewer wants to see whether you base decisions on evidence and can interpret data correctly.',
    expectedAnswer:
      "Situation: our e-commerce team wanted to offer free delivery on all orders to increase sales. Task: I was asked to evaluate the idea before the decision. Action: I analysed six months of orders and found that 70% were already above a 40-euro value, and that most abandoned carts were between 25 and 40 euros. I proposed free delivery above 40 euros instead, and we tested it on half of our visitors for three weeks. Result: the test group had 12% more orders and a higher average basket, while delivery costs grew much less than with free delivery for everyone. The team adopted the threshold permanently.",
    explanation:
      'Good data-driven decisions involve the right question, careful analysis and ideally a test before full roll-out. Proposing a refined alternative shows that data informed the decision instead of simply confirming an initial idea.',
    tips: ['Explain what data you used and why.', 'Mention how you validated the conclusion.'],
    commonMistakes: ['Presenting data that only confirmed what you already wanted.', 'Ignoring the limits of the data.'],
    followUpQuestions: ['What would have made you doubt the data?', 'How do you present data to people who are not analysts?'],
  },
  'beh-060': {
    question: 'Tell me about a decision you made that turned out to be wrong.',
    intent: 'The interviewer is checking whether you recognise mistakes quickly and correct course without excuses.',
    expectedAnswer:
      "Situation: I chose a new, cheaper supplier for our office supplies after comparing prices. Task: I was responsible for keeping costs down without disrupting the office. Action: after two months, deliveries were often late and some products were missing. I looked at what I had missed: I had compared only prices and not delivery reliability or references. I informed my manager, negotiated an exit from the contract at the end of the quarter and returned to the previous supplier with a slightly better rate based on volume. Result: deliveries became reliable again, we still saved 5% compared with the original contract, and I now include delivery performance and references in every supplier comparison.",
    explanation:
      'Interviewers value people who own their mistakes, analyse why their decision process failed and improve it. The lesson learned is the most important part of the answer.',
    tips: ['Explain what was wrong in your decision process.', 'Show the corrective action and what you changed for the future.'],
    commonMistakes: ['Choosing a mistake that was really someone else\'s fault.', 'Not explaining what you learned.'],
    followUpQuestions: ['How long did it take you to realise it was a mistake?', 'How did your manager react?'],
  },
  'beh-061': {
    question: 'Tell me about a time you had to make a quick decision under pressure.',
    intent: 'The interviewer wants to see whether you can act quickly and sensibly without panicking.',
    expectedAnswer:
      "Situation: while I was working as a shift leader in a restaurant, the dishwasher broke during a busy Saturday evening. Task: I had to keep service running without enough clean dishes. Action: I decided within a few minutes to assign one waiter to wash dishes by hand, temporarily removed two dishes that required many plates from the menu and informed the kitchen and the team. I also called the repair service for the next morning. Result: we served every table that evening with only small delays, and the manager kept my temporary menu as a back-up plan for future equipment problems.",
    explanation:
      'Quick decisions are about protecting the main goal, using the resources you have and communicating clearly. Showing that you also handled the follow-up demonstrates responsibility.',
    tips: ['Explain your reasoning in a few words.', 'Show how you communicated the decision.'],
    commonMistakes: ['Describing a decision taken without thinking at all.', 'Forgetting the follow-up actions.'],
    followUpQuestions: ['How do you stay calm when you have to decide fast?', 'Would you decide differently with more time?'],
  },
  'beh-062': {
    question: 'Tell me about a time you faced an ethical dilemma at work.',
    intent: 'The interviewer is assessing integrity, judgment and courage when the right thing is not the easy thing.',
    expectedAnswer:
      "Situation: while preparing quarterly results for a client presentation, I noticed that a colleague had used a calculation method that made our campaign results look about 20% better than they were. Task: the presentation was the next morning, and correcting it would make our team look less successful. Action: I first checked my understanding by recalculating the figures with the method we had agreed with the client. Then I spoke privately to my colleague, explained what I had found and suggested we correct the figures together. He was reluctant, so I informed our manager the same evening, presenting it as a methodology issue rather than an accusation. Result: we presented the correct figures with a clear explanation of what had worked and what had not. The client appreciated the transparency and renewed the contract, and our team adopted a peer check on all client figures.",
    explanation:
      'Ethical dilemmas test whether you verify facts, raise concerns with the right people and act even when it is uncomfortable, while treating colleagues fairly. The process matters as much as the outcome.',
    tips: ['Show that you checked the facts before acting.', 'Explain how you treated the people involved fairly.', 'Describe the outcome and what changed.'],
    commonMistakes: ['Ignoring the issue to avoid conflict.', 'Accusing someone publicly without checking.'],
    followUpQuestions: ['What if your manager had asked you to keep the original figures?', 'Where do you draw the line between a mistake and misconduct?'],
  },
  'beh-063': {
    question: 'Tell me about a time you had to choose between two good options.',
    intent: 'The interviewer wants to see how you compare trade-offs and make a decision others can understand and support.',
    expectedAnswer:
      "Situation: our product team had budget for one major project in the next half-year: a mobile app requested by many customers or a reporting module requested by our largest clients. Task: as product manager, I had to recommend one to leadership. Action: I compared both options on four criteria agreed with leadership in advance: expected revenue, customer retention risk, development cost and strategic fit. I interviewed eight customers from each group and worked with finance on revenue estimates. The reporting module had a smaller audience but protected contracts representing 35% of our revenue, two of which mentioned it in renewal discussions. I recommended it, with a lightweight mobile web version as an interim solution for the other customers. Result: leadership approved the plan, both at-risk clients renewed and the mobile web version reduced app requests enough to postpone the native app by a year without losing customers.",
    explanation:
      'When both options are good, the decision depends on explicit criteria agreed in advance and on evidence. Offering a partial solution for the option not chosen shows strategic thinking and reduces the cost of the trade-off.',
    tips: ['Agree on decision criteria before comparing.', 'Use evidence for each criterion.', 'Show how you reduced the downside of the option not chosen.'],
    commonMistakes: ['Deciding on intuition alone.', 'Presenting the decision as obvious.'],
    followUpQuestions: ['How did you communicate the decision to customers who wanted the app?', 'What would have made you choose the other option?'],
  },
  'beh-064': {
    question: 'Tell me about a decision you made that others disagreed with.',
    intent: 'The interviewer wants to see whether you can stand by a reasoned decision while listening and keeping relationships intact.',
    expectedAnswer:
      "Situation: as organiser of our department's annual conference, I decided to reduce the number of presentations from twelve to eight to leave more time for workshops. Task: several speakers who were used to presenting every year disagreed and complained to our director. Action: I explained my reasons with feedback from the previous year's survey, where participants asked for more interaction. I listened to the speakers' concerns and offered those not presenting a workshop slot or a short video shared before the event. I kept the decision but adapted how it was implemented. Result: participant satisfaction rose from 3.6 to 4.4 out of 5, and two of the speakers who had complained led the most popular workshops.",
    explanation:
      'Standing by a decision is easier with clear data and when you listen to objections and adapt the implementation. This shows conviction without rigidity.',
    tips: ['Show the evidence behind your decision.', 'Explain how you addressed others\' concerns.'],
    commonMistakes: ['Ignoring the objections.', 'Changing your decision just to avoid conflict.'],
    followUpQuestions: ['When would you have changed your decision?', 'How did the director react?'],
  },
  'beh-065': {
    question: 'Tell me about a mistake you made at work.',
    intent: 'The interviewer is testing honesty and accountability: whether you admit mistakes, fix them and learn.',
    expectedAnswer:
      "Situation: in my first month as an administrative assistant, I sent a meeting invitation with the wrong date to twenty external partners. Task: the meeting was important and several partners had already accepted. Action: as soon as I noticed the mistake, I told my manager, sent a short correction with an apology to all partners and called the three who had already booked travel. I then started using a checklist for every external invitation, including a second check of dates and time zones. Result: all partners attended on the correct date, and I haven't made that kind of mistake since.",
    explanation:
      'Interviewers want to see that you react quickly, take responsibility, limit the impact and put a safeguard in place. A small, honest mistake with a clear lesson works well.',
    tips: ['Choose a real but manageable mistake.', 'Show the speed of your reaction.', 'End with the safeguard you created.'],
    commonMistakes: ['Saying you never make mistakes.', 'Choosing a mistake that suggests serious carelessness.'],
    followUpQuestions: ['How did your manager react?', 'What mistake are you most afraid of making?'],
  },
  'beh-066': {
    question: 'Tell me about a time you took ownership of a problem that was not yours.',
    intent: 'The interviewer wants to see initiative and ownership beyond your official responsibilities.',
    expectedAnswer:
      "Situation: customers kept calling our sales team about invoices with errors, even though invoicing belonged to another department. Task: as a sales representative, I could have redirected them, but customers were getting frustrated and some threatened to leave. Action: I collected ten examples of incorrect invoices and noticed that all of them involved discounts negotiated after the order. I shared the examples with the billing manager and suggested a simple form for sales to send discount changes directly to billing. I volunteered to test it with my own clients for a month. Result: invoice errors in my accounts dropped to zero, the form was rolled out to the whole sales team and complaints about invoices fell significantly.",
    explanation:
      'Ownership means acting on a problem that affects the customer or the company, even if it is not formally yours, while respecting the other team\'s role. Bringing evidence and a proposal makes it easy for them to accept help.',
    tips: ['Explain why you decided to act.', 'Show how you worked with the team that owned the problem.'],
    commonMistakes: ['Taking over another team\'s work without their agreement.', 'Simply passing the problem along.'],
    followUpQuestions: ['How did the billing team react at first?', 'How do you avoid overstepping?'],
  },
  'beh-067': {
    question: 'Tell me about a time you failed.',
    intent: 'The interviewer is assessing resilience and your ability to extract real lessons from failure.',
    expectedAnswer:
      "Situation: I applied to lead a new internal training programme and prepared a proposal for the selection committee. Task: I wanted to show I was ready for more responsibility. Action: I focused my proposal on content and teaching methods, which I knew well, but I gave very little detail on budget and how I would measure results. The committee chose another candidate. I asked for feedback, and they explained that my plan was strong on content but not convincing on management aspects. Over the next six months, I took a short course in project budgeting and volunteered to manage the budget of a smaller event. Result: the following year I was selected to lead a new mentoring programme, and my proposal was praised for its measurement plan.",
    explanation:
      'A good failure story includes a real disappointment, an honest analysis of what was missing, feedback you sought out and concrete steps that led to a later success.',
    tips: ['Choose a real failure, not a disguised success.', 'Show how you sought feedback.', 'Describe what changed afterwards.'],
    commonMistakes: ['Choosing a failure caused only by others.', 'Ending on the failure without a lesson.'],
    followUpQuestions: ['How did you feel at the time?', 'What is the most useful failure you have had?'],
  },
  'beh-068': {
    question: 'Tell me about a time you had to admit you were wrong.',
    intent: 'The interviewer wants to see humility and intellectual honesty, especially in front of others.',
    expectedAnswer:
      "Situation: in a team meeting, I insisted that a drop in our website visits was caused by a recent design change. Task: my colleague thought it was caused by a change in search engine rankings, and we had to decide what to fix. Action: I offered to check the data before deciding. When I looked at traffic sources, I saw that visits from search engines had fallen sharply while direct visits were stable, so my colleague was right. At the next meeting, I said clearly that I had been wrong and presented the data that supported her explanation. Result: we focused on the search ranking issue and recovered most of the traffic in six weeks. My colleague later told me she appreciated how I handled it.",
    explanation:
      'Admitting you were wrong, especially publicly, builds trust. Interviewers like answers where data settled the question and where you acknowledged the other person\'s contribution.',
    tips: ['Show how you discovered you were wrong.', 'Explain how you acknowledged it publicly.'],
    commonMistakes: ['Minimising your mistake.', 'Choosing an example where admitting it cost nothing.'],
    followUpQuestions: ['Is it hard for you to admit mistakes?', 'How do you react when others admit they were wrong?'],
  },
  'beh-069': {
    question: 'Tell me about a time you went beyond what was expected of you.',
    intent: 'The interviewer is looking for motivation and ownership: extra effort that created real value.',
    expectedAnswer:
      "Situation: as a hotel receptionist, I noticed that many foreign guests asked the same questions about public transport and local restaurants. Task: my job was to answer questions at the desk, nothing more. Action: on my own initiative, I created a one-page guide in three languages with transport tips, a simple map and recommended restaurants nearby. I asked my manager for approval and printed it for each room. Result: the number of questions at the desk dropped noticeably during busy hours, several guests mentioned the guide in positive online reviews and the hotel group shared it with two other locations.",
    explanation:
      'Going beyond expectations is most convincing when the extra effort solves a real problem and benefits customers or the company, not when it is just extra hours.',
    tips: ['Show the problem you noticed.', 'Explain the value created for others.'],
    commonMistakes: ['Equating "going beyond" with working overtime.', 'Doing something nobody needed.'],
    followUpQuestions: ['Why did you decide to do it?', 'How do you balance extra initiatives with your main job?'],
  },
  'beh-070': {
    question: 'Tell me about a time you kept high standards even when nobody would have noticed.',
    intent: 'The interviewer wants to see intrinsic accountability and attention to quality without external control.',
    expectedAnswer:
      "Situation: I was preparing a data export for a partner, and the deadline was that evening. Task: the partner only checked that the file opened correctly, so a quick export would have been accepted. Action: before sending it, I ran a few simple checks: number of records compared with our database, empty fields and duplicate entries. I found that about 3% of the records were duplicated because of a recent system change. I fixed the export, documented the issue for our team and sent the file two hours later than planned, informing the partner in advance. Result: the partner's monthly billing, which was based on our file, was correct, and the duplicate issue was fixed at the source before it affected other reports.",
    explanation:
      'Interviewers look for people who check their own work because they care about the result, not because they fear being caught. Discovering and fixing a hidden problem is strong evidence of this.',
    tips: ['Describe the checks you did.', 'Show the consequence you avoided.'],
    commonMistakes: ['Sounding like a perfectionist who misses deadlines.', 'Not explaining why the issue mattered.'],
    followUpQuestions: ['How do you decide how much checking is enough?', 'Have you ever delivered something you were not proud of?'],
  },
  'beh-071': {
    question: 'Tell me about a time you had to hold a colleague or team member accountable.',
    intent: 'The interviewer is assessing whether you can address performance or commitment issues directly, fairly and constructively.',
    expectedAnswer:
      "Situation: in my team of six analysts, one experienced colleague had missed three weekly report deadlines in a row, and others had started covering for him. Task: as team lead, I needed to address it before it damaged trust in the team. Action: I met him privately and described the facts without judgment: the three dates, the impact on the regional managers and on his colleagues. I asked what was happening. He explained that he had been assigned to an urgent project by another director and didn't feel he could refuse. We agreed on two things: I would clarify his priorities with the other director, and he would warn me as soon as a deadline was at risk. I confirmed the agreement in writing and followed up weekly for a month. Result: his reports were on time from the next week, colleagues stopped covering for him and he later thanked me for addressing it early rather than letting it build up.",
    explanation:
      'Holding someone accountable means stating facts and impact, listening for causes, agreeing on clear commitments and following up. Addressing it early and privately protects both the person and the team.',
    tips: ['Describe facts and impact, not personality.', 'Show that you looked for the cause.', 'Mention the follow-up.'],
    commonMistakes: ['Avoiding the conversation for weeks.', 'Escalating to HR before speaking to the person.'],
    followUpQuestions: ['What would you have done if nothing had changed?', 'How do you give difficult feedback to someone more senior?'],
  },
  'beh-072': {
    question: 'Tell me about a time you had to explain a failure publicly or to senior management.',
    intent: 'The interviewer wants to see how you own a failure in front of others, communicate its causes and restore confidence.',
    expectedAnswer:
      "Situation: a marketing campaign I led sent a promotional e-mail with an incorrect discount code to 50,000 customers, which caused complaints and several hundred unusable orders. Task: I had to explain what happened to our sales director and propose a response the same day. Action: within an hour, my team sent a correction e-mail with a working code and a small apology bonus. I then wrote a one-page incident summary: what happened, how many customers were affected, the estimated cost and the root cause, which was a last-minute code change that skipped our usual test. I presented it to the director without blaming the person who made the change, because the real problem was that our process allowed it. I proposed a mandatory test send for any change after final approval. Result: most affected customers used the new code, and the director approved the new rule. In the following year we sent more than eighty campaigns without a similar incident.",
    explanation:
      'At an advanced level, accountability includes leading the response, giving a clear, factual account and focusing on process rather than individuals. Proposing systemic improvements helps restore confidence.',
    tips: ['Start with how you limited the damage.', 'Present facts, impact and root cause clearly.', 'Focus on process changes, not blame.'],
    commonMistakes: ['Blaming the colleague who made the change.', 'Minimising the impact in front of management.'],
    followUpQuestions: ['How did you support the colleague who made the change?', 'How do you decide what to tell customers?'],
  },
  'beh-073': {
    question: 'Tell me about a time you questioned an assumption everyone else accepted.',
    intent: 'The interviewer wants to see independent thinking and whether you check facts instead of following the group.',
    expectedAnswer:
      "Situation: our team believed that customers cancelled their subscriptions mainly because of price, and we were planning a discount campaign. Task: I was asked to prepare the campaign, but I had doubts because few cancellation messages mentioned price. Action: I asked to review the data first. I analysed six months of cancellation surveys and support tickets, and found that the most common reason was difficulty using a key feature, mentioned twice as often as price. I presented the results with examples to the team and suggested testing a short guided tutorial before launching discounts. Result: the tutorial reduced cancellations by 15% in two months, more than the discount had achieved in a previous test, and at a much lower cost.",
    explanation:
      'Critical thinking means checking shared beliefs against evidence, then presenting the results constructively. Proposing a test rather than simply contradicting the team makes the challenge useful.',
    tips: ['Explain what made you doubt the assumption.', 'Show the evidence you gathered.', 'Present your challenge as a proposal.'],
    commonMistakes: ['Challenging for the sake of it.', 'Being right but presenting it in a way that embarrasses the team.'],
    followUpQuestions: ['How did the team react?', 'What if the data had confirmed the assumption?'],
  },
  'beh-074': {
    question: 'Tell me about a time you identified a flaw in a plan.',
    intent: 'The interviewer is checking whether you spot weaknesses early and raise them in a constructive way.',
    expectedAnswer:
      "Situation: my manager presented a plan to open customer support on Saturdays by asking each agent to work one Saturday per month. Task: I was asked for feedback before the plan was announced. Action: I looked at the schedule and saw that, with holidays and part-time contracts, some Saturdays would have only one agent, which was not enough for the expected call volume. I prepared a simple calendar showing the problem dates and suggested two options: hiring a weekend part-timer or reducing Saturday hours to the busiest period. Result: my manager chose reduced Saturday hours, the service launched without understaffed days and customer waiting times stayed within our target.",
    explanation:
      'Spotting a flaw is valuable only if you raise it early, show evidence and suggest alternatives. This turns criticism into help for the decision-maker.',
    tips: ['Show concrete evidence of the flaw.', 'Offer at least one alternative.'],
    commonMistakes: ['Criticising the plan without a solution.', 'Waiting until the plan fails to say something.'],
    followUpQuestions: ['How do you give this kind of feedback to a manager?', 'What if your manager had ignored your concern?'],
  },
  'beh-075': {
    question: 'Tell me about a time you had to evaluate conflicting information.',
    intent: 'The interviewer wants to see how you judge sources, reconcile contradictions and reach a reliable conclusion.',
    expectedAnswer:
      "Situation: for a market study, I received two reports on the size of the same market: one estimated 200 million euros, the other 450 million. Task: I needed a reliable figure for our business plan. Action: I compared how each report was built. The first counted only professional customers; the second also included private buyers and used older data. I checked the original sources, contacted a trade association for recent figures and built my own estimate for professional customers only, since that was our target. Result: my estimate was 230 million euros, close to the first report, and I documented the method in the business plan so investors could see how the figure was obtained. They specifically mentioned that transparency during their review.",
    explanation:
      'Conflicting information often comes from different definitions or methods. Comparing methodologies, checking primary sources and documenting your reasoning are the hallmarks of critical thinking.',
    tips: ['Explain why the sources disagreed.', 'Show how you chose or built the final figure.', 'Mention how you documented it.'],
    commonMistakes: ['Choosing the figure that suited you best.', 'Averaging the two numbers without understanding them.'],
    followUpQuestions: ['How do you judge whether a source is reliable?', 'What would you do if you could not resolve the conflict?'],
  },
  'beh-076': {
    question: 'Tell me about a time you analysed information to reach a conclusion.',
    intent: 'The interviewer is checking your analytical approach, even on a simple problem.',
    expectedAnswer:
      "Situation: in my part-time job at a bookshop, the manager wondered why sales on Saturdays had dropped over three months. Task: she asked me to look into it. Action: I compared sales by hour for the last six months and saw that the drop happened only between 2 and 4 p.m. I then checked what had changed: a nearby car park had started charging for parking in the afternoon. I suggested offering one free hour of parking for purchases over a certain amount, in partnership with the car park. Result: after the offer started, Saturday afternoon sales returned to their previous level within a month.",
    explanation:
      'This answer shows a simple but clear analytical method: break the data down, locate the change, look for an external cause and test a solution.',
    tips: ['Explain how you broke the problem down.', 'Show how you checked your conclusion.'],
    commonMistakes: ['Giving a conclusion without explaining the analysis.', 'Confusing correlation with cause without checking.'],
    followUpQuestions: ['How did you know the car park was the real cause?', 'What tools did you use for the analysis?'],
  },
  'beh-077': {
    question: 'Tell me about a time you challenged a decision made by senior leadership.',
    intent: 'The interviewer is assessing courage, judgment about when and how to challenge, and respect for the final outcome.',
    expectedAnswer:
      "Situation: leadership decided to stop supporting an older version of our software within three months to reduce maintenance costs. Task: as head of customer support, I saw that about 15% of our customers, including several public-sector clients, could not upgrade that quickly because of their procurement rules. Action: I gathered the data: number of affected customers, their revenue and the contractual notice periods in their agreements. I requested a meeting with the operations director, acknowledged the cost problem and proposed an alternative: a twelve-month timeline for public-sector clients with a paid extended support option, and the original timeline for everyone else. Result: leadership adopted a nine-month timeline with paid extended support. We kept all but two of the affected customers, the extended support covered most of the maintenance cost and we avoided at least one potential legal dispute related to notice periods.",
    explanation:
      'Challenging leadership effectively requires solid data, recognition of their goals and a realistic alternative. Accepting a final compromise that differs from your proposal shows that you serve the company, not your own position.',
    tips: ['Acknowledge leadership\'s objective before challenging.', 'Bring data on the impact and an alternative.', 'Accept the final decision gracefully.'],
    commonMistakes: ['Challenging publicly in a way that undermines leaders.', 'Complaining without proposing an alternative.'],
    followUpQuestions: ['What if leadership had refused any change?', 'When do you decide a decision is worth challenging?'],
  },
  'beh-078': {
    question: 'Tell me about a time you had to balance short-term results with long-term consequences.',
    intent: 'The interviewer wants to see strategic thinking: whether you understand the hidden costs of quick wins.',
    expectedAnswer:
      "Situation: our sales team was struggling to reach its quarterly target, and a manager suggested offering large discounts to existing customers in exchange for early renewal. Task: as the finance analyst supporting sales, I was asked to evaluate the idea. Action: I modelled the impact. The discounts would help us reach the quarterly target, but they would reduce annual revenue from those customers by about 8% for the next two years, and customers would probably expect similar discounts in the future. I proposed a different approach: smaller discounts tied to multi-year commitments, focused only on customers at risk of leaving according to our usage data. I presented both scenarios with their two-year impact to the sales director. Result: the director chose the targeted approach, we reached 97% of the quarterly target and the multi-year contracts increased the following year's secured revenue by 12%.",
    explanation:
      'Advanced critical thinking includes modelling consequences beyond the immediate goal and presenting alternatives that balance both horizons. Quantifying long-term effects makes the trade-off visible to decision-makers.',
    tips: ['Quantify both short-term and long-term effects.', 'Offer an alternative that serves both horizons.', 'Let the decision-maker compare scenarios.'],
    commonMistakes: ['Ignoring the short-term pressure completely.', 'Presenting the long term only as a vague risk.'],
    followUpQuestions: ['How did the sales team react to reaching 97% instead of 100%?', 'How do you explain long-term risks to people under short-term pressure?'],
  },
  'beh-079': {
    question: 'Tell me about a time you noticed a risk that others had missed.',
    intent: 'The interviewer is checking attention to detail and whether you speak up about risks.',
    expectedAnswer:
      "Situation: our team was about to sign a contract with a new cloud storage provider for customer documents. Task: I was asked to review the technical part of the contract, while the legal team reviewed the rest. Action: while reading the appendix, I noticed that the provider could store backups in any country, while some of our customers required their data to stay in the European Union. I checked our customer contracts and found eleven with this requirement. I informed the project lead and legal team with the exact clauses involved. Result: the provider agreed to add a data location clause before signature, and we avoided breaking our commitments to those customers.",
    explanation:
      'This answer shows careful reading, verification of the impact and clear communication to the right people. Interviewers appreciate candidates who look beyond their narrow task when the stakes are high.',
    tips: ['Explain how you spotted the risk.', 'Show how you checked its real impact before raising it.'],
    commonMistakes: ['Raising alarms without evidence.', 'Noticing a risk but not telling anyone.'],
    followUpQuestions: ['Why do you think others missed it?', 'How do you decide which risks are worth raising?'],
  },
  'beh-080': {
    question: 'Tell me about a time you evaluated a new idea or tool before adopting it.',
    intent: 'The interviewer wants to see whether you assess new things objectively rather than adopting or rejecting them by instinct.',
    expectedAnswer:
      "Situation: my team wanted to adopt a new project management tool after a colleague saw it at a conference. Task: I was asked to check whether it was really better than our current tool. Action: I listed what we needed most: task tracking, file sharing and integration with our calendar. I tested the new tool with two colleagues on a real small project for two weeks and compared it with our current tool on each point, including cost. Result: the new tool was better for task tracking but did not integrate with our calendar, which we used every day. We decided to keep our current tool and to use its task board feature, which most of the team had never tried. That solved the main problem at no extra cost.",
    explanation:
      'Evaluating an idea means defining criteria first, testing in real conditions and comparing fairly. Concluding not to adopt the tool is a perfectly good outcome when the evaluation supports it.',
    tips: ['Define your criteria before testing.', 'Test in real conditions with real users.'],
    commonMistakes: ['Deciding based on enthusiasm or habit alone.', 'Comparing tools without clear criteria.'],
    followUpQuestions: ['How did the colleague who proposed the tool react?', 'How do you stay open to new ideas?'],
  },
};
