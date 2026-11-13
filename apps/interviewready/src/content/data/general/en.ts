import type { QuestionText, TextTable } from '@/types/content';

export const en: TextTable<QuestionText> = {
  'gen-001': {
    question: 'Tell me about yourself.',
    intent: 'The interviewer wants a short, relevant overview of who you are professionally and a first sense of how clearly you communicate.',
    expectedAnswer:
      "I'm a backend developer with four years of experience, currently at a mid-sized e-commerce company where I work on the order and payment services. Over the last year I led the move of our checkout API to a new architecture, which cut response times by about a third. Before that I spent two years at a digital agency, where I learned to deliver quickly for very different clients. I'm now looking for a product company where I can go deeper on one domain, and your work on logistics software is exactly that.",
    explanation:
      'The present-past-future structure keeps the answer under two minutes: who you are today, the experience that got you here, and why this role is the logical next step. It turns an open question into a pitch that ends on the job you are applying for.',
    tips: ['Aim for 60 to 90 seconds.', 'Choose one or two achievements that match the job description.', 'Finish with why you are interested in this role, so the conversation moves forward naturally.'],
    commonMistakes: ['Reciting your CV in chronological order from school onwards.', 'Sharing personal details unrelated to the job.', 'Ending without linking your story to the position.'],
    followUpQuestions: ['Why are you looking for a new position now?', 'What was the biggest challenge in that migration?'],
  },
  'gen-002': {
    question: 'Walk me through your CV.',
    intent: 'The interviewer wants to understand the logic of your career path: why you made each move and what you gained from it.',
    expectedAnswer:
      'I started as a support technician, which taught me how users actually experience software. I then took evening courses in programming and moved into a junior developer role in the same company. Two years later I joined a start-up to work on a larger product and learn modern practices like code review and automated testing. Each step was about getting closer to building products, and this role is the next one in that direction.',
    explanation:
      'A CV walk-through is not a list of dates. Interviewers look for a thread: the reason behind each change and the skill it added. Explaining your choices shows that your career is intentional, even when it was not a straight line.',
    tips: ['Spend more time on recent and relevant roles than on old ones.', 'For each move, give one reason and one thing you learned.', 'Prepare a calm, honest sentence for any gap or short job.'],
    commonMistakes: ['Reading the CV line by line.', 'Criticising former employers to explain a departure.'],
    followUpQuestions: ['Which role taught you the most?', 'Why did you stay only one year at the start-up?'],
  },
  'gen-003': {
    question: 'How would you describe yourself in three words?',
    intent: 'The interviewer is testing your self-awareness and whether you can back up adjectives with evidence instead of clichés.',
    expectedAnswer:
      "Curious, reliable and calm. Curious because I like understanding how things work: in my last job I learned our monitoring tools on my own and became the person the team asked about alerts. Reliable because when I commit to a deadline I either meet it or warn early; my manager mentioned this in my last review. And calm, because during incidents I focus on the next useful step rather than on the pressure.",
    explanation:
      'Three adjectives alone are forgettable. Attaching a short proof to each turns them into evidence and shows you know how you are perceived. Choosing qualities linked to the role makes the answer relevant.',
    example: 'Structure: word → one-sentence proof → (optional) link to the role. Repeat three times, in under a minute.',
    tips: ['Pick words that match what the job requires.', 'Avoid generic words such as "hard-working" unless you can prove them precisely.'],
    commonMistakes: ['Listing three adjectives with no example.', 'Choosing words that contradict the role, such as "perfectionist" for a fast-paced job without nuance.'],
    followUpQuestions: ['Which of those three would your colleagues disagree with?', 'What word would you like to add in two years?'],
  },
  'gen-004': {
    question: 'What is your greatest professional achievement?',
    intent: 'The interviewer wants to know what you value, the scale of impact you can have and how you describe your own contribution.',
    expectedAnswer:
      "Situation: our customer support team was overwhelmed by password-reset requests, around 300 tickets a week. Task: as the developer on the account team, I was asked to reduce that load. Action: I analysed the tickets, found that most users never received the reset e-mail because of a spam filter issue, fixed the sending configuration and added a self-service reset by SMS. I also wrote a short help article with the support team. Result: reset tickets dropped by 70% in a month, and support could focus on real customer problems.",
    explanation:
      'A strong achievement answer shows a real problem, your personal actions and a measurable result. The STAR structure prevents vague claims and highlights what you did, not just what the team did.',
    tips: ['Choose an achievement relevant to the job you want.', 'Quantify the result, even approximately.', 'Say "I" for your actions and credit others where it is fair.'],
    commonMistakes: ['Choosing an achievement with no measurable impact.', 'Describing the project but not your own role in it.'],
    followUpQuestions: ['What would you do differently today?', 'Who else contributed and how?'],
  },
  'gen-005': {
    question: 'How would your colleagues describe you?',
    intent: 'The interviewer is checking how you work with others and whether your self-image matches how others see you.',
    expectedAnswer:
      "I think they would say I'm the person who makes things clear. When a requirement is fuzzy, I'm usually the one who writes down the open questions and organises a short call to settle them. In my last feedback round, two colleagues mentioned that my pull-request comments are direct but friendly. One also said I sometimes take on too much myself, which I'm working on by delegating more.",
    explanation:
      "Quoting real feedback makes the answer credible. Adding a small, honest improvement point shows maturity and makes the positive parts more believable.",
    tips: ['Base the answer on actual feedback: reviews, comments, messages.', 'Mention one concrete behaviour rather than a personality trait.'],
    commonMistakes: ['Answering only with flattering adjectives.', 'Saying "I don\'t know, you would have to ask them".'],
    followUpQuestions: ['Can you give an example of that feedback?', 'How did you react to the comment about taking on too much?'],
  },
  'gen-006': {
    question: 'What sets you apart from other candidates for this role?',
    intent: 'The interviewer wants you to identify your specific value for this job and to argue it without arrogance.',
    expectedAnswer:
      "I can't speak for the other candidates, but I can tell you the combination I bring. I have five years of backend development, and for the last two I've also been the link between our engineering team and the finance department, translating accounting rules into system requirements. Your job description mentions building billing features with finance stakeholders, which is exactly the overlap I've worked in. For example, I led the redesign of our invoicing module, which removed most manual corrections at month-end. Many developers know the code side well; fewer have spent time making sense of the business side as well.",
    explanation:
      'The strongest answer does not compare you to people you have never met. It identifies the intersection of skills that is rare and that the job needs, then proves it with one example. Opening with humility keeps the tone confident rather than boastful.',
    tips: ['Look for the intersection between two of your skills and the job description.', 'Back the claim with one result.', 'Keep a respectful tone toward other candidates.'],
    commonMistakes: ['Claiming you are "the best" without evidence.', 'Listing generic qualities everyone could claim, such as motivation or passion.'],
    followUpQuestions: ['What would you need to learn quickly in this role?', 'How did you build that finance knowledge?'],
  },
  'gen-007': {
    question: 'What are your greatest strengths?',
    intent: 'The interviewer wants to see whether your main strengths match the job and whether you can prove them.',
    expectedAnswer:
      "My main strength is breaking down complex problems. In my last project, our reporting job took six hours and often failed. I split it into smaller steps, measured each one and found that a single query was responsible for most of the time. After rewriting it and adding an index, the job ran in forty minutes. A second strength is explaining technical topics simply: I regularly present our changes to the product team, and they now come to me first when they need a technical opinion.",
    explanation:
      'Two strengths, each proved by a short story, are more convincing than a long list. Choosing strengths from the job description shows that you have thought about what the role needs.',
    tips: ['Prepare two or three strengths and pick the ones the job description mentions.', 'Use one short example per strength.'],
    commonMistakes: ['Listing many strengths without evidence.', 'Choosing strengths unrelated to the job.'],
    followUpQuestions: ['Which strength do you rely on most under pressure?', 'Can that strength become a weakness?'],
  },
  'gen-008': {
    question: 'What is your greatest weakness?',
    intent: 'The interviewer is testing self-awareness, honesty and your ability to improve, not looking for a reason to reject you.',
    expectedAnswer:
      "For a long time I was uncomfortable speaking in large meetings, so my ideas stayed in my notes. It became a real problem when a design I had proposed in writing was dropped because I didn't defend it in the review. Since then I've worked on it deliberately: I volunteer to present our sprint demo once a month and I prepare two or three key points before each meeting. It's still not my favourite exercise, but last quarter I led our architecture review and the proposal was adopted.",
    explanation:
      'A good answer names a real but non-critical weakness, shows its impact, then focuses on the concrete actions taken and the progress made. The improvement plan matters more than the weakness itself.',
    tips: ['Choose a genuine weakness that is not essential to the role.', 'Spend most of the answer on what you are doing about it.', 'Show measurable progress.'],
    commonMistakes: ['Disguising a strength as a weakness ("I am too much of a perfectionist").', 'Naming a weakness that is critical for the job.', 'Saying you have no weaknesses.'],
    followUpQuestions: ['What other weakness are you working on?', 'How do you get feedback on your progress?'],
  },
  'gen-009': {
    question: 'What do you bring to a team?',
    intent: 'The interviewer wants to understand your role in a group and how you make others more effective.',
    expectedAnswer:
      "I bring structure and follow-through. In my current team, I noticed we often left meetings without clear owners, so I started posting a short summary with decisions and names after each one. It took five minutes and the team adopted it as a habit. I'm also happy to help newer colleagues: I paired with our last two hires during their first weeks, and both were contributing to production within a month.",
    explanation:
      'Interviewers want to know how the team changes because you are in it. Concrete habits and their effect on others answer that better than general claims about being a "team player".',
    tips: ['Describe a behaviour, not a label.', 'Show the effect on the team, not just on your own work.'],
    commonMistakes: ['Saying "I am a team player" without an example.', 'Talking only about your individual tasks.'],
    followUpQuestions: ['What role do you usually take in a new team?', 'What kind of teammate do you find difficult to work with?'],
  },
  'gen-010': {
    question: 'What skill are you currently working on?',
    intent: 'The interviewer is assessing your learning habits and whether you take ownership of your development.',
    expectedAnswer:
      "I'm working on my data analysis skills. In my role I often need to justify decisions with numbers, and I was relying on colleagues to pull data for me. Three months ago I started an online SQL course and I practise on our real reporting database for half an hour twice a week. I can now build most of my own reports, and last month I used them to show that a feature we planned had very little usage, which saved us a sprint of work.",
    explanation:
      'This question checks whether you learn actively. A good answer names a specific skill, the reason it matters for your work, your method and early results. It ideally relates to the job you are applying for.',
    tips: ['Choose a skill useful for the target role.', 'Mention your method and how often you practise.', 'Share an early result to show progress.'],
    commonMistakes: ['Naming a skill with no plan behind it.', 'Choosing something unrelated to work without explaining why.'],
    followUpQuestions: ['How do you decide what to learn next?', 'What did you learn last year that you use every day?'],
  },
  'gen-011': {
    question: 'Tell me about a time you were outside your comfort zone.',
    intent: 'The interviewer wants to see how you behave when you lack experience: whether you freeze, bluff or learn quickly.',
    expectedAnswer:
      "Situation: my team lead left suddenly two weeks before a client demo. Task: I was the most senior developer left, so I was asked to run the demo and the client relationship, which I had never done. Action: I asked my manager for a short briefing on the client's priorities, rehearsed the demo twice with colleagues and prepared answers to the questions I feared most. During the demo, when I didn't know an answer, I said so and promised a written reply the next day. Result: the client approved the next phase, and I continued as their main contact for six months.",
    explanation:
      'The key is your approach to the unknown: seeking information, preparing deliberately and being honest about what you do not know. These are signs that you will cope with new responsibilities.',
    tips: ['Pick a situation that genuinely stretched you.', 'Highlight how you prepared and who you asked for help.'],
    commonMistakes: ['Choosing a trivial example.', 'Hiding the difficulties and presenting yourself as instantly comfortable.'],
    followUpQuestions: ['What would you do differently?', 'Did you want to keep that responsibility afterwards?'],
  },
  'gen-012': {
    question: 'Tell me about a weakness that has actually cost you something at work.',
    intent: 'This deeper version of the weakness question tests whether you can own a real consequence without being defensive.',
    expectedAnswer:
      "I tend to underestimate the time integration work takes. Two years ago I committed to delivering a partner integration in three weeks; it took seven because the partner's API documentation was outdated and I discovered it late. The consequence was real: our sales team had to delay a launch with a client, and I had to explain the slip. Since then I build estimates differently. I spend the first two days on a technical spike against the real system, I give a range instead of a single date, and I share risks in writing. On the last three integrations my estimates were within 20% of the actual time.",
    explanation:
      'At an advanced level, interviewers expect a weakness with a real cost, full ownership of it and a changed process backed by results. The answer shows that you learn from consequences rather than from theory.',
    tips: ['Choose a weakness whose cost you can describe factually.', 'Describe the process you changed, not only good intentions.', 'Finish with evidence that the change works.'],
    commonMistakes: ['Minimising the impact or blaming others.', 'Choosing a catastrophic example that raises doubts about your judgment.'],
    followUpQuestions: ['How did your manager react at the time?', 'How do you handle a deadline you know is unrealistic?'],
  },
  'gen-013': {
    question: 'If we called your last manager, what would they say you could do better?',
    intent: 'The interviewer is checking whether you know your development areas and whether your answer would match a real reference check.',
    expectedAnswer:
      "They would probably say I should speak up earlier when I disagree. In planning meetings I sometimes accepted a scope I thought was too large and only raised concerns once the work was under way. My manager told me directly in my last review that early disagreement is more useful than late warnings. Since then I write down my concerns before planning and raise them in the meeting, even if it is uncomfortable. Last sprint, that led us to cut a feature in half before starting it.",
    explanation:
      'Answering as if the reference call were real makes you choose honest, specific feedback. Showing you heard it and acted on it demonstrates coachability, which managers value highly.',
    tips: ['Use feedback you genuinely received.', 'Show what you changed after hearing it.'],
    commonMistakes: ['Inventing feedback that sounds like praise.', 'Contradicting what a reference would actually say.'],
    followUpQuestions: ['What did they appreciate most about your work?', 'How do you usually ask for feedback?'],
  },
  'gen-014': {
    question: 'Why do you want to work here?',
    intent: 'The interviewer wants proof that you researched the company and that your reasons go beyond "I need a job".',
    expectedAnswer:
      "Three things attracted me. First, your product: I've used your budgeting app for a year and I like that it explains spending instead of just listing it. Second, your engineering blog post about moving to smaller, independent teams matches the way I like to work. Third, the role itself: you're building the data features of the app, and that's where I've focused my last two years. I see a clear place where I can contribute from the start.",
    explanation:
      'A specific answer shows genuine interest and preparation. Linking the company (product, values, way of working) to your own experience proves that the match is real, not generic.',
    tips: ['Mention something concrete: a product, an article, a value, a recent project.', 'Connect what you found to your own skills or goals.'],
    commonMistakes: ['Giving answers that could apply to any company ("you are a leader in your market").', 'Talking only about salary or location.'],
    followUpQuestions: ['What do you think we could improve in our product?', 'What other companies are you talking to?'],
  },
  'gen-015': {
    question: 'Why do you want this job?',
    intent: 'The interviewer wants to understand what attracts you to the role itself and whether you understand what it involves.',
    expectedAnswer:
      "This role combines the two parts of my work I enjoy most: building features and working directly with users. In my current job I spend most of my time on internal tools, and the moments I find most rewarding are when I can talk to the people using them. Your job description mentions joining customer interviews and turning feedback into product changes, which is exactly the kind of loop I want to be part of.",
    explanation:
      'This question is about the role, not the company. Interviewers want to see that you have read the job description, that you know what the daily work looks like and that it matches what motivates you.',
    tips: ['Quote two or three responsibilities from the job description.', 'Connect them to what you enjoy and do well.'],
    commonMistakes: ['Answering about the company instead of the role.', 'Sounding as if any job would do.'],
    followUpQuestions: ['Which part of this role would be the hardest for you?', 'What would a great first month look like?'],
  },
  'gen-016': {
    question: 'Why are you leaving your current job?',
    intent: 'The interviewer is checking that your reasons are professional and that the same issues will not appear in this role.',
    expectedAnswer:
      "I've learned a lot in my current company, especially about building reliable services. But the product has become very stable and most of my work is now maintenance. I want to work on a product that is still growing, where I can help design new features. I discussed this with my manager, and there isn't such a project planned for the next year, so I'm looking for it elsewhere.",
    explanation:
      'The best answers focus on what you are moving toward, not on what you are running from. Staying positive about your current employer shows professionalism and reassures the interviewer that you will not leave for minor frustrations.',
    tips: ['Frame the move around growth or fit.', 'Stay factual and positive about your current employer.', 'If you were let go, say it briefly and calmly, then move on to what you learned.'],
    commonMistakes: ['Criticising your manager or colleagues.', 'Giving a reason the new job also has.'],
    followUpQuestions: ['What would make you stay at your current company?', 'Have you discussed this with your manager?'],
  },
  'gen-017': {
    question: 'What motivates you?',
    intent: 'The interviewer wants to know what keeps you engaged and whether the job can provide it.',
    expectedAnswer:
      "I'm motivated by seeing the effect of my work on real people. In my last role I built a small tool that let our warehouse staff print shipping labels in one click instead of five. A week later the team lead told me it saved them almost an hour a day. Moments like that keep me going far more than the technology itself. That's one reason I'm interested in this role, since your teams work close to the end users.",
    explanation:
      'A motivation is credible when it is illustrated by a real moment. Linking it to the job shows the interviewer that the role will keep you engaged over time.',
    tips: ['Choose a motivation the job can actually satisfy.', 'Illustrate it with a short, real moment.'],
    commonMistakes: ['Naming only money or job security.', 'Giving an abstract answer with no example.'],
    followUpQuestions: ['What demotivates you?', 'How do you stay motivated on repetitive tasks?'],
  },
  'gen-018': {
    question: 'Why should we hire you?',
    intent: 'The interviewer is inviting you to summarise your fit for the role in a confident, structured way.',
    expectedAnswer:
      "You're looking for someone who can maintain your mobile app and improve its performance while working closely with designers. I've spent three years doing exactly that: I maintained an app with 200,000 users and reduced its start-up time by half. I also work well with design teams; in my current job I set up a weekly session with our designers to review new screens before development. Finally, I'm genuinely interested in your field, since I use apps like yours every day.",
    explanation:
      'This is your closing argument. Restate the main needs of the role, then match each one with proof from your experience. Ending with genuine interest adds motivation to competence.',
    tips: ['Start from the needs in the job description, not from your CV.', 'Give two or three matches, each with evidence.', 'Keep it under one minute.'],
    commonMistakes: ['Repeating your CV.', 'Being vague ("I am hard-working and motivated").', 'Sounding arrogant.'],
    followUpQuestions: ['What would you need from us to succeed?', 'What is missing from your profile for this role?'],
  },
  'gen-019': {
    question: 'What would you want to accomplish in your first 90 days?',
    intent: 'The interviewer wants to see whether you can plan your integration realistically and focus on what matters to the business.',
    expectedAnswer:
      "In the first month I'd focus on learning: meeting the people I'll work with, understanding the product, the main metrics and the biggest pain points, and shipping a few small fixes to learn the codebase and the release process. In the second month I'd take ownership of one meaningful piece of work, ideally something your team has already identified as a priority, and deliver it end to end. By the third month I'd like to propose one improvement based on what I've observed, for example in testing or deployment, and agree with my manager on goals for the next six months. I'd also check in every few weeks to make sure we see my progress the same way.",
    explanation:
      'A credible 90-day plan balances learning, delivering and improving. It shows humility (listen first), ambition (own something real) and alignment (agree goals with the manager). Mentioning check-ins shows that you seek feedback instead of assuming.',
    tips: ['Structure the answer by month or by phase.', 'Mention learning before changing things.', 'Ask the interviewer what success would look like for them.'],
    commonMistakes: ['Promising big changes before understanding the context.', 'Describing only passive learning with no delivery.'],
    followUpQuestions: ['What would you do if your manager had a different priority?', 'How would you build trust with the team?'],
  },
  'gen-020': {
    question: 'Tell me about a time you lost motivation at work. What did you do?',
    intent: 'The interviewer wants to know whether you can recognise a dip in motivation and manage it responsibly.',
    expectedAnswer:
      "Situation: after a reorganisation, my team was assigned to migrate an old reporting system, work with no visible users. Task: I still had to deliver it within the quarter, and I noticed I was postponing it. Action: I talked to my manager, who explained that the migration was blocking a security upgrade for the whole company. I also broke the work into weekly milestones and automated the most repetitive conversion steps, which made it more interesting. Result: we finished two weeks early, and the script I wrote was reused by two other teams.",
    explanation:
      'Everyone loses motivation sometimes. Interviewers value people who notice it, look for the purpose behind the work and act to change the situation instead of letting their work suffer.',
    tips: ['Be honest about the dip; it makes the story credible.', 'Focus on the actions you took to recover.'],
    commonMistakes: ['Claiming you are always motivated.', 'Blaming the company without describing your own actions.'],
    followUpQuestions: ['What signals tell you that you are losing motivation?', 'How do you keep motivated during long projects?'],
  },
  'gen-021': {
    question: 'Where do you see yourself in five years?',
    intent: 'The interviewer wants to know whether your ambitions are realistic and compatible with the role and the company.',
    expectedAnswer:
      "In five years I'd like to be a senior engineer recognised for my expertise in data-heavy applications, someone the team relies on for design decisions. I'd also like to have mentored a few junior developers, because I enjoy that part of the job. I see this role as a strong step in that direction, since it would give me experience with much larger data volumes than I have today.",
    explanation:
      'The interviewer is not asking for a precise prediction. They want to see a direction that fits the job and suggests you will stay and grow. Focusing on skills and impact rather than titles keeps the answer credible.',
    tips: ['Describe a direction in terms of skills and impact.', 'Connect it to what this role can offer.'],
    commonMistakes: ['Saying you want the interviewer\'s job.', 'Describing goals the company cannot offer, such as starting your own business next year.', 'Answering "I have no idea".'],
    followUpQuestions: ['How do you plan to get there?', 'What would make you leave a job before that?'],
  },
  'gen-022': {
    question: 'How does this role fit into your career plan?',
    intent: 'The interviewer wants to see that this application is a deliberate choice and not a random one.',
    expectedAnswer:
      "My plan is to become a product-minded engineer who can take a feature from idea to measurable result. So far I've built strong technical foundations, but I've always worked far from the product decisions. In this role, engineers join discovery work with product managers, which is the missing piece for me. In return, I bring solid experience in testing and release automation, which I saw you're trying to improve.",
    explanation:
      'This answer shows what the role gives you and what you give the role. The exchange makes the fit feel balanced and credible.',
    tips: ['State your plan in one sentence.', 'Name the gap this role fills and what you bring in return.'],
    commonMistakes: ['Presenting the job as a temporary stepping stone.', 'Talking only about what you will gain.'],
    followUpQuestions: ['What would make this role a mistake for you?', 'Which skill do you expect to develop first?'],
  },
  'gen-023': {
    question: 'Are you interested in moving into management?',
    intent: 'The interviewer wants to know whether your aspirations match the career paths the company offers, and whether you understand what management involves.',
    expectedAnswer:
      "I'm interested, but not immediately. Over the past year I've started to take on some leadership tasks: I coordinate our sprint planning and mentor two junior developers, and I enjoy helping people progress. But I also know management is a different job, with less hands-on work. So in the next two years I'd like to grow as a technical lead, and then decide, with real experience, whether people management or a senior technical path suits me better.",
    explanation:
      'An honest, nuanced answer is best. Showing that you understand the difference between technical leadership and people management, and that you have tested it in small ways, makes your answer thoughtful rather than title-driven.',
    tips: ['Ask what career paths the company offers before or after answering.', 'Give concrete signs of leadership experience, if any.'],
    commonMistakes: ['Saying yes only because it sounds ambitious.', 'Dismissing management completely in a role that may lead there.'],
    followUpQuestions: ['What would you find hardest about managing people?', 'What makes a good manager in your experience?'],
  },
  'gen-024': {
    question: 'How have your career plans changed over time, and why?',
    intent: 'The interviewer wants to see how you make career decisions and whether you learn from experience.',
    expectedAnswer:
      "Situation: I studied marketing and started my career as a campaign coordinator. Task: part of my job was building weekly performance reports, and I realised I enjoyed that work more than the campaigns themselves. Action: I took a data analysis course in the evenings, automated our reports with SQL and offered to help other teams with theirs. Result: after a year my company moved me into a junior analyst role, and I now want to keep growing as a data analyst, which is why I'm applying here.",
    explanation:
      'Career changes are normal. What interviewers look for is reflection: noticing what you enjoy, testing it, and acting on it. A clear "why" turns a winding path into a coherent story.',
    tips: ['Explain the trigger for each change.', 'Show the concrete steps you took, not just the decision.'],
    commonMistakes: ['Presenting changes as random or forced on you.', 'Apologising for not having a straight path.'],
    followUpQuestions: ['Do you miss anything from your first job?', 'What would make you change direction again?'],
  },
  'gen-025': {
    question: 'How do you measure your own professional growth?',
    intent: 'The interviewer is assessing self-direction and whether you track progress with evidence rather than feelings.',
    expectedAnswer:
      "I use three kinds of signals. The first is scope: the size and ambiguity of the problems I'm trusted with. Two years ago I was given well-defined tickets; now I'm asked to frame problems before they become tickets. The second is impact: I keep a simple document with the results of my main projects, such as cost savings, time saved or incidents avoided, which I review every quarter. The third is feedback: I ask two or three colleagues for one thing I should keep doing and one thing I should change, twice a year. When all three move in the right direction I know I'm growing; when one stalls, I discuss it with my manager and adjust my goals.",
    explanation:
      'Advanced candidates are expected to own their development. Combining responsibility, measurable impact and structured feedback shows a mature, evidence-based approach that also helps managers support you.',
    tips: ['Mention at least one concrete tracking habit.', 'Show how you act when progress stalls.'],
    commonMistakes: ['Measuring growth only by job titles or salary.', 'Having no method at all.'],
    followUpQuestions: ['What did your last feedback round tell you?', 'How would we support that growth here?'],
  },
  'gen-026': {
    question: 'Tell me about a skill you learned on your own to advance your career.',
    intent: 'The interviewer wants evidence of initiative and of your ability to learn without being told to.',
    expectedAnswer:
      "Situation: in my support role, I spent hours every week copying data between two systems. Task: nobody had time to automate it, so I decided to learn enough scripting to do it myself. Action: I followed a free Python course for six weeks, practised on small copies of our files and asked a developer to review my script before using it on real data. Result: the weekly task went from four hours to fifteen minutes, I was asked to automate two other processes, and that experience helped me move into my current junior developer role.",
    explanation:
      'Self-learning stories reveal curiosity, discipline and ownership. Interviewers especially like stories where learning solved a real problem and created new opportunities.',
    tips: ['Explain why you chose to learn it.', 'Mention how you checked your work was right.', 'Show the career impact.'],
    commonMistakes: ['Listing online courses without showing how you used the skill.', 'Choosing a skill unrelated to work without explaining its value.'],
    followUpQuestions: ['What are you learning at the moment?', 'How do you stay up to date in your field?'],
  },
  'gen-027': {
    question: 'What do you know about our company?',
    intent: 'The interviewer is testing your preparation and whether your interest is genuine.',
    expectedAnswer:
      "You build scheduling software for clinics, mainly in Europe, and you've grown quickly in the last two years, including the launch of patient reminders by SMS. I read that you're now expanding to hospitals, which brings stricter requirements for reliability and data protection. I also saw on your careers page that teams are organised by product area with a lot of autonomy. That's what interests me: the impact of your product on everyday healthcare and the way you organise work.",
    explanation:
      'Interviewers expect you to know the basics (what the company sells, to whom, recent news) and to show why it matters to you. Ending with your personal interest turns research into motivation.',
    tips: ['Check the website, recent news, product reviews and the job description.', 'Mention one recent development and why it interests you.'],
    commonMistakes: ['Reciting the company history from the website.', 'Knowing nothing beyond the job title.'],
    followUpQuestions: ['What do you think is our biggest challenge?', 'Have you used our product?'],
  },
  'gen-028': {
    question: 'Who do you think are our main competitors, and how do we compare?',
    intent: 'The interviewer wants to see whether you understand the company\'s market and can think like someone who works there.',
    expectedAnswer:
      "From what I've seen, your main competitors are the large all-in-one HR platforms on one side and a few specialised payroll start-ups on the other. The big platforms win on breadth, but their reviews often mention complex set-up. The start-ups are cheaper but weaker on compliance across countries. You seem positioned in between: simpler than the big platforms and stronger on multi-country compliance. The risk I see is that the big players are improving their onboarding, so ease of use alone may not be enough for long. I'd be curious to hear how you see it.",
    explanation:
      'You are not expected to be an analyst, but a structured view of the market shows business acumen. Closing with a question turns the answer into a conversation and shows humility.',
    tips: ['Group competitors into types instead of listing names.', 'Mention one strength and one risk.', 'Invite the interviewer\'s view.'],
    commonMistakes: ['Criticising competitors harshly.', 'Guessing without any research.'],
    followUpQuestions: ['What would you do to stay ahead?', 'Which competitor product have you tried?'],
  },
  'gen-029': {
    question: 'What kind of work environment do you prefer?',
    intent: 'The interviewer is checking whether you will be comfortable and effective in their actual environment.',
    expectedAnswer:
      "I work best in an environment where goals are clear but people have freedom in how they reach them. I like regular, informal communication, for example quick discussions when something is unclear, rather than waiting for a weekly meeting. I've also learned to work well remotely. From what you've described about your teams, with clear quarterly objectives and a lot of autonomy, that sounds like a good fit for me.",
    explanation:
      'The best answer is honest and connected to what you know about the company. Describing preferences in terms of how you work best, not what you dislike, keeps the tone positive.',
    tips: ['Research the company culture before the interview.', 'Describe what helps you perform, not only what you like.'],
    commonMistakes: ['Describing an environment opposite to the company\'s.', 'Saying you can adapt to anything without giving any preference.'],
    followUpQuestions: ['How do you work when goals are unclear?', 'What environment did you find difficult?'],
  },
  'gen-030': {
    question: 'Describe the best team you have worked in. What made it work?',
    intent: 'The interviewer wants to understand which team practices you value and whether you help create them.',
    expectedAnswer:
      "Situation: my best team was a group of five building a new payment feature under a tight deadline. Task: we had to deliver in three months while integrating with a bank we had never worked with. Action: what made it work was very clear ownership, a short daily check-in where people said openly when they were stuck, and a habit of reviewing each other's work the same day. My own contribution was setting up a shared test environment with the bank so everyone could test without waiting. Result: we launched on time with no critical bugs, and we kept those habits on the next projects.",
    explanation:
      'This question reveals your idea of a healthy team. Naming specific practices, and your contribution to them, shows that you understand what makes teams effective and that you take part in building it.',
    tips: ['Name two or three specific practices.', 'Explain your own contribution to the team\'s success.'],
    commonMistakes: ['Saying only that "everyone got along".', 'Describing the team without your role in it.'],
    followUpQuestions: ['What would you bring from that team to ours?', 'Tell me about a team that did not work.'],
  },
  'gen-031': {
    question: 'If you joined us, what would you change about our product?',
    intent: 'The interviewer wants to see your critical thinking, your preparation and how diplomatically you deliver criticism.',
    expectedAnswer:
      "I'd be careful about changing anything before understanding your data and your constraints, so take this as a first impression. I signed up for the free trial, and the onboarding took me about fifteen minutes before I could create my first project; several reviews mention the same thing. I'd want to look at where users drop off during sign-up and test a shorter path, for example creating a sample project automatically. I also noticed the mobile app doesn't support offline mode, which could matter for your field-service customers. I'd be curious whether those points match what your team sees.",
    explanation:
      'At an advanced level, interviewers expect concrete, well-argued suggestions based on real usage and data, framed with humility. Proposing how to verify your idea shows a product-minded, evidence-based approach.',
    tips: ['Actually use the product before the interview.', 'Frame suggestions as hypotheses to test.', 'Ask whether your observations match theirs.'],
    commonMistakes: ['Saying everything is perfect.', 'Criticising harshly without understanding constraints.'],
    followUpQuestions: ['How would you measure whether that change works?', 'What would you prioritise first?'],
  },
  'gen-032': {
    question: 'What do you look for in a manager?',
    intent: 'The interviewer is assessing how you like to be managed and whether that matches the team\'s management style.',
    expectedAnswer:
      "I appreciate a manager who sets clear expectations and then gives me room to work, while being available when I'm stuck. Regular, honest feedback matters a lot to me; my best manager held a short one-to-one every two weeks and told me directly what I could improve, which helped me grow quickly. I also value a manager who explains the reasons behind priorities, so I can make good decisions on my own.",
    explanation:
      'Interviewers often ask this to check fit with the future manager. A good answer focuses on behaviours that help you perform, illustrated with a real example, without describing an impossible ideal.',
    tips: ['Describe behaviours, not personality.', 'Give an example from a manager who helped you.'],
    commonMistakes: ['Describing only what you dislike in former managers.', 'Asking for no supervision at all.'],
    followUpQuestions: ['How do you prefer to receive feedback?', 'Tell me about a manager you found difficult.'],
  },
  'gen-033': {
    question: 'What do you think will be the biggest challenge in this role?',
    intent: 'The interviewer wants to see whether you understand the role deeply and have a realistic plan to handle its difficulties.',
    expectedAnswer:
      "Based on the job description and our conversation, I think the biggest challenge will be balancing new features with the reliability of a platform that has grown quickly. You mentioned that incidents have increased while the team has doubled, and that usually means shared knowledge hasn't kept pace. I'd approach it by first understanding where incidents come from, then proposing small, regular improvements such as better alerts or runbooks alongside feature work, rather than a big separate project. I've done something similar before, when I helped reduce weekly incidents by half over two quarters. I'd want to agree on that balance with my manager early.",
    explanation:
      'This question rewards candidates who listened during the interview and can connect the company\'s situation to a realistic plan. Showing a relevant past experience proves you can handle the challenge.',
    tips: ['Use information from the interview itself.', 'Propose an approach, not just a diagnosis.', 'Back it with a similar past experience.'],
    commonMistakes: ['Naming a generic challenge such as "learning the tools".', 'Naming a challenge without any plan.'],
    followUpQuestions: ['What would you need from the team to address it?', 'How long would it take to see results?'],
  },
  'gen-034': {
    question: 'How do you organise your workday?',
    intent: 'The interviewer wants to understand your planning habits and how you balance focused work with interruptions.',
    expectedAnswer:
      "I start by reviewing my tasks and choosing the one or two that matter most for the day. I block my mornings for focused work, because that's when I concentrate best, and I group meetings and messages in the afternoon when possible. I keep a short list of small tasks for gaps between meetings. At the end of the day I spend five minutes noting what's left, so I can start quickly the next morning. When something urgent comes up, I check whether it really can't wait and, if it can't, I let people know what will move.",
    explanation:
      'Interviewers look for a deliberate method, not perfection. Showing how you protect focus, handle interruptions and communicate changes demonstrates reliability.',
    tips: ['Describe a real routine, including how you handle urgent requests.', 'Mention a tool or habit you actually use.'],
    commonMistakes: ['Saying you "just go with the flow".', 'Describing a rigid routine that ignores teamwork.'],
    followUpQuestions: ['What do you do when two urgent requests arrive at once?', 'How do you handle constant interruptions?'],
  },
  'gen-035': {
    question: 'How do you handle stress and pressure?',
    intent: 'The interviewer wants to know whether you stay effective under pressure and whether you have healthy ways of coping.',
    expectedAnswer:
      "I try to turn pressure into a plan. When we had to fix a data issue before a client's month-end closing, I listed what absolutely had to be done, agreed on priorities with my lead and gave the client short updates twice a day so nobody had to chase us. Breaking the problem down helps me stay calm. Outside work, regular sport helps me recover. I've also learned to say early when the pressure is caused by an unrealistic plan, rather than silently working late every night.",
    explanation:
      'A good answer shows a method (prioritise, communicate) and healthy limits. Interviewers are wary of candidates who claim never to feel stress, or who cope only by working longer hours.',
    tips: ['Illustrate with a short real example.', 'Show both how you act in the moment and how you prevent burnout.'],
    commonMistakes: ['Claiming you never feel stress.', 'Describing only long hours as your solution.'],
    followUpQuestions: ['Tell me about a time stress affected your work.', 'How do you help colleagues under pressure?'],
  },
  'gen-036': {
    question: 'Do you prefer working alone or in a team?',
    intent: 'The interviewer wants to see whether you can do both, and how you decide which mode a task needs.',
    expectedAnswer:
      "I enjoy both, and I think good work needs both. I like working alone on tasks that require deep concentration, such as debugging a complex problem or writing a design document. But I prefer to discuss the approach with the team before and to get feedback after, because it catches mistakes early. In my current job, for example, I write a short proposal, share it for comments, work on it alone for a few days and then ask for a review.",
    explanation:
      'This is rarely a trick question: most jobs require both. The strongest answer shows that you can choose the right mode for the task and that collaboration is part of your normal workflow.',
    tips: ['Avoid extreme answers.', 'Describe how you combine both in practice.'],
    commonMistakes: ['Saying you dislike teamwork.', 'Saying you cannot work without constant support.'],
    followUpQuestions: ['How do you stay in touch with the team when working alone?', 'What do you do when the team disagrees with your approach?'],
  },
  'gen-037': {
    question: 'How do you handle criticism of your work?',
    intent: 'The interviewer is checking whether you can receive feedback without becoming defensive and whether you use it to improve.',
    expectedAnswer:
      "I try to treat criticism as information. My first reaction is to make sure I understand it, so I ask for a concrete example. For instance, a senior colleague once told me my code reviews were too slow. I asked what 'too slow' meant for the team and learned that people were waiting two days for my reviews. I started reserving thirty minutes every morning for reviews, and within a week the average wait was under a day. If I disagree with feedback, I say so calmly with my reasons, but I always consider it first.",
    explanation:
      'Interviewers want people who are open to feedback but not passive. Asking for specifics, acting on it and being able to disagree respectfully shows maturity.',
    tips: ['Give a real example where feedback changed your behaviour.', 'Show that you can also disagree constructively.'],
    commonMistakes: ['Saying you never receive criticism.', 'Describing feedback only from your manager, never from peers.'],
    followUpQuestions: ['Tell me about feedback you disagreed with.', 'How do you give critical feedback to others?'],
  },
  'gen-038': {
    question: 'How do you approach a task you have never done before?',
    intent: 'The interviewer wants to see your learning process and how you manage risk when you lack experience.',
    expectedAnswer:
      "First I clarify the goal and what 'done' looks like, so I don't learn things I don't need. Then I look for existing knowledge: documentation, a colleague who has done something similar, or a previous example in our code. I build a small prototype to test my understanding before committing to the real work, and I share my plan early with someone experienced. For example, the first time I had to set up a payment provider, I built a test integration in a day, showed it to our tech lead and caught a security mistake before it went anywhere near production.",
    explanation:
      'This question tests learning agility. A structured approach (clarify, research, prototype, get early feedback) shows that you can take on new tasks safely and quickly.',
    tips: ['Describe a repeatable method, then give an example.', 'Mention when you ask for help.'],
    commonMistakes: ['Saying you would figure it out alone without asking anyone.', 'Waiting for complete training before starting.'],
    followUpQuestions: ['How do you know when you should ask for help?', 'Tell me about a new task that went badly.'],
  },
  'gen-039': {
    question: 'How do you keep stakeholders informed and aligned on a long project?',
    intent: 'The interviewer is assessing communication with senior or non-technical people and your ability to prevent surprises.',
    expectedAnswer:
      "I agree early on what each group needs to know and how often. On my last project, a six-month migration, the executive sponsor wanted a short monthly summary focused on risks and dates, while the operations team needed weekly details about what would change for them. I set up a one-page status update with a simple traffic-light view, and I made a rule to share bad news as soon as I knew it, with a proposed solution. When a vendor delay pushed us back three weeks, the sponsor learned it from me the same day, with two options to recover. Because of that, the delay did not cause a loss of trust, and the project finished with the original scope.",
    explanation:
      'At an advanced level, communication is about tailoring information to each audience and managing expectations, especially when things go wrong. Sharing bad news early with options is what builds credibility.',
    tips: ['Explain how you adapt the format to each audience.', 'Show how you handle bad news.'],
    commonMistakes: ['Sending the same detailed report to everyone.', 'Hiding problems until they become crises.'],
    followUpQuestions: ['What do you do when a stakeholder ignores your updates?', 'How do you handle conflicting stakeholder priorities?'],
  },
  'gen-040': {
    question: 'What do you do outside of work?',
    intent: 'The interviewer wants to know you as a person and may look for qualities your interests reveal.',
    expectedAnswer:
      "I play in an amateur football team twice a week, which keeps me fit and reminds me how much a team depends on communication. I also volunteer once a month at a local association, helping older people use their smartphones. It's a good lesson in patience and in explaining technology simply. And I like cooking, especially trying recipes from countries I've travelled to.",
    explanation:
      'There is no right hobby. Interviewers are looking for authenticity and sometimes for transferable qualities. A short, genuine answer with a light link to work is enough.',
    tips: ['Be genuine; interviewers can tell when an answer is invented.', 'Keep it short and positive.', 'Share only what you are comfortable sharing.'],
    commonMistakes: ['Saying you have no time for anything outside work.', 'Mentioning activities that could raise concerns about your availability.'],
    followUpQuestions: ['What have you learned from that activity?', 'How do you balance it with work?'],
  },
};
