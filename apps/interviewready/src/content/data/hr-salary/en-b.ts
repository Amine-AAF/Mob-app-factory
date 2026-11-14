import type { QuestionText, TextTable } from '@/types/content';

/** HR & salary questions 021-040: career change, employment gaps, remote work, questions to ask. */
export const enB: TextTable<QuestionText> = {
  'hr-021': {
    question: 'How do the skills from your previous career transfer to this role?',
    intent: 'The recruiter wants you to show concretely why your background is an asset rather than a gap.',
    expectedAnswer:
      "In my eight years in hotel management, I handled exactly the kind of situations a customer success manager faces: dissatisfied clients, urgent problems that needed coordination between teams, and targets for satisfaction and retention. For example, I reduced negative online reviews by 35% in one year by introducing a follow-up process after every complaint. I also managed a team of twelve, prepared monthly reports on occupancy and revenue, and trained staff on a new booking system. In this role, I would apply the same skills to software clients, while I continue to build my product knowledge, which I've started with your online training courses.",
    explanation:
      'Translating past experience into the language of the new role, with concrete results, removes the recruiter\'s doubt. Acknowledging what you are still learning adds credibility.',
    tips: ['Map two or three skills directly to the job description.', 'Use measurable examples from your previous career.', 'Mention what you are learning.'],
    commonMistakes: ['Listing generic "soft skills" without examples.', 'Using jargon from your old field that the recruiter does not understand.'],
    followUpQuestions: ['What will be the hardest skill to develop?', 'How would you handle your first technical client issue?'],
  },
  'hr-022': {
    question: 'You do not have direct experience in this field. Why should we hire you?',
    intent: 'The recruiter tests your confidence and your ability to argue your potential with evidence.',
    expectedAnswer:
      "You're right that I don't have years of experience in this exact role, so I've worked on closing the gap. In the last year I completed a certification in project management, I've been managing the migration of our office systems as a side project, and I volunteered to coordinate the planning of a regional event with a budget of 40,000, delivered on time. What I bring that others may not is fifteen years of understanding how operations teams actually work, which is useful for a project manager on your logistics products. I learn quickly and I'd be happy to agree on clear goals for my first three months so you can assess my progress.",
    explanation:
      'Acknowledging the gap honestly, then showing preparation, transferable results and a unique perspective, turns a weakness into a balanced argument.',
    tips: ['Acknowledge the gap without apologising.', 'Show concrete steps already taken.', 'Highlight a perspective only you bring.'],
    commonMistakes: ['Pretending you have experience you do not have.', 'Sounding apologetic or insecure.'],
    followUpQuestions: ['What would you need from us to succeed?', 'How long would it take you to be fully autonomous?'],
  },
  'hr-023': {
    question: 'Would you accept a lower level or salary to change careers?',
    intent: 'The recruiter wants to understand your flexibility, your financial realism and the risk that you leave quickly for more money.',
    expectedAnswer:
      "I've thought about this carefully before applying. I understand that moving into software testing means starting at a junior level, and I'm prepared to accept a salary that reflects that, within a range that covers my commitments; for me that's a minimum of 38,000. In return, I'd like to understand how progression works here: what skills or results would let me move to the next level, and how often salaries are reviewed. I see this as an investment in a long-term career, so a clear development path matters more to me than the starting salary.",
    explanation:
      'Showing that you accept a realistic starting point while asking about progression demonstrates commitment and reduces the recruiter\'s fear that you will leave quickly.',
    tips: ['Know your financial minimum before the interview.', 'Ask about progression and review cycles.', 'Frame the decision as a long-term investment.'],
    commonMistakes: ['Accepting any salary without knowing your minimum.', 'Expecting the same salary as in your previous senior role.'],
    followUpQuestions: ['How long do you expect to stay at a junior level?', 'What if progression is slower than you hope?'],
  },
  'hr-024': {
    question: 'Why do you want to move from a technical role into management, or the reverse?',
    intent: 'The recruiter checks that the change is a deliberate choice and that you understand what the new role involves.',
    expectedAnswer:
      "Over the last two years as a senior developer, the parts of my job that gave me the most satisfaction were mentoring junior colleagues, organising our sprint planning and helping resolve disagreements in the team. I asked my manager to let me lead a small project of four people, which taught me that management is a different job: less code, more listening, planning and difficult conversations. I enjoyed it, and the project was delivered on time with good feedback from the team. I'm now looking for an engineering manager role where my technical background helps me make good decisions with the team, while I accept that I will code much less.",
    explanation:
      'A convincing move between technical and management tracks shows real experience of the new responsibilities and a clear understanding of what will be lost and gained.',
    tips: ['Give evidence that you have tested the new role.', 'Show you understand the trade-offs.'],
    commonMistakes: ['Wanting management only for the title or salary.', 'Assuming management is just technical leadership.'],
    followUpQuestions: ['What will you miss most from your previous role?', 'How would you handle a conflict between two team members?'],
  },
  'hr-025': {
    question: 'How have you prepared for this career change?',
    intent: 'The recruiter wants evidence of commitment and realistic preparation.',
    expectedAnswer:
      "I started by talking to five people already working as UX designers to understand the daily reality of the job. Then I completed a six-month UX course with a portfolio project, and I redesigned the booking process of a local sports club as a volunteer, which increased online bookings by 20%. I read regularly about design research and attend a monthly local design meetup. I also adjusted my finances so I can accept a junior salary during the transition.",
    explanation:
      'Concrete preparation, such as conversations, training, real projects and practical planning, proves that the change is serious and well considered.',
    tips: ['Mention training, projects and conversations with professionals.', 'Show practical results.'],
    commonMistakes: ['Listing only courses without applying them.', 'Having no portfolio or proof of practice.'],
    followUpQuestions: ['What was the most useful thing you learned?', 'What feedback did you receive on your projects?'],
  },
  'hr-026': {
    question: 'Can you explain this gap in your CV?',
    intent: 'The recruiter wants a calm, honest explanation and reassurance that you are ready to work now.',
    expectedAnswer:
      "Yes. From March to October last year I took time off to care for a family member who was ill. That situation is now resolved and I'm fully available. During that period I kept my skills up to date: I completed an online accounting software certification and followed the changes in tax regulations relevant to my field. I'm very motivated to get back to work, and this role matches my experience well.",
    explanation:
      'Gaps are common. A short, honest explanation, without unnecessary detail, followed by what you did to stay current and your readiness now, is usually enough.',
    tips: ['Keep the explanation short and factual.', 'Mention what you did to stay current.', 'End on your readiness and motivation.'],
    commonMistakes: ['Hiding the gap with false dates.', 'Giving long personal details.', 'Sounding apologetic.'],
    followUpQuestions: ['Are you fully available now?', 'What did you learn during that period?'],
  },
  'hr-027': {
    question: 'You were laid off from your last job. What happened?',
    intent: 'The recruiter wants to know whether the departure was related to performance and how you talk about difficult events.',
    expectedAnswer:
      "My company lost its main client last year and had to cut 30% of its staff, including the whole marketing team I belonged to. It was a business decision, not related to individual performance; my manager wrote me a recommendation letter, which I can share. Since then I've used the time to complete a certification in marketing analytics and to work on two freelance projects for small businesses, which kept me active and broadened my experience.",
    explanation:
      'Layoffs are common and not a personal failure. Explaining the business context, providing evidence if available and showing what you did next is the professional approach.',
    tips: ['Explain the business context briefly.', 'Offer a reference or recommendation if you have one.', 'Show what you have done since.'],
    commonMistakes: ['Criticising the former employer.', 'Describing a dismissal for performance as a layoff.'],
    followUpQuestions: ['Could you have done anything to prevent it?', 'What did you learn from the experience?'],
  },
  'hr-028': {
    question: 'How much should you say about a gap caused by health or personal reasons?',
    intent: 'This situation tests your ability to protect your privacy while remaining honest and reassuring.',
    expectedAnswer:
      'You can keep it short and private: "I took a year off for personal health reasons. That is fully behind me now, and I\'m ready to commit to a full-time role." You are not required to give medical details, and in many countries employers are not allowed to ask about your health. The goal is to reassure the recruiter about your current availability, not to justify the past in detail. If you need a specific adjustment at work, you can discuss it when you feel comfortable, often after the offer.',
    explanation:
      'Honesty does not mean disclosing everything. A short, confident statement focused on the present respects your privacy and answers the recruiter\'s real concern.',
    tips: ['Prepare one or two sentences you are comfortable with.', 'Focus on your current readiness.', 'Know that you can keep medical details private.'],
    commonMistakes: ['Sharing more personal details than you are comfortable with.', 'Inventing a job to cover the gap.'],
    followUpQuestions: ['Is there anything that could affect your availability?', 'How did you stay connected to your field?'],
  },
  'hr-029': {
    question: 'You have been out of work for more than a year. How have you stayed up to date?',
    intent: 'The recruiter worries that your skills are outdated and wants evidence of continued learning.',
    expectedAnswer:
      "I knew my skills could become outdated, so I set a routine. I completed two certifications, one in cloud fundamentals and one in data analysis with SQL, which are both mentioned in your job description. I contributed to an open-source project and built a small application that tracks volunteer hours for a local association, which they now use every week. I also attended online conferences and kept in touch with former colleagues to follow how practices changed. I'm ready to be productive quickly, and I'd be happy to show you the application.",
    explanation:
      'Concrete learning and real projects counter the fear of outdated skills. Linking them to the job description makes them directly relevant.',
    tips: ['Show learning linked to the job description.', 'Mention concrete projects you can demonstrate.'],
    commonMistakes: ['Saying you were waiting for the right opportunity without doing anything.', 'Mentioning only passive learning such as videos.'],
    followUpQuestions: ['What has changed most in your field during that time?', 'Can you show us one of your projects?'],
  },
  'hr-030': {
    question: 'You have changed jobs several times in a short period. Why should we expect you to stay?',
    intent: 'The recruiter fears a short tenure and wants to understand the reasons and whether they will repeat.',
    expectedAnswer:
      "I understand the concern. Looking back, my moves had different causes: the first company closed after eight months, the second role turned out to be mainly sales, which wasn't what had been described, and the third was a fixed-term contract. I've learned from this: I now research companies much more carefully and ask detailed questions about the role, which is why I asked you earlier about the team's roadmap and how success is measured. What attracts me here is a long-term product and a role where I can grow into a lead position over the next few years. I'm looking for stability, and I'd be happy for you to speak with my previous managers.",
    explanation:
      'Explaining each move factually, showing what you learned and linking it to how you chose this role addresses the risk directly. Offering references adds credibility.',
    tips: ['Give a short factual reason for each move.', 'Show what you changed in how you choose jobs.', 'Offer references.'],
    commonMistakes: ['Blaming every former employer.', 'Promising to stay forever, which is not credible.'],
    followUpQuestions: ['What would make you leave this role?', 'How do you evaluate a company before accepting an offer?'],
  },
  'hr-031': {
    question: 'Do you prefer working remotely, in the office or in a hybrid model?',
    intent: 'The recruiter checks whether your preferences fit the company\'s policy and whether you can work well in it.',
    expectedAnswer:
      "I've worked in all three setups and I'm productive in each. My preference is hybrid: I like coming to the office for planning sessions, workshops and getting to know the team, and I do my focused work well from home. I saw that your policy is three days in the office, which works for me. The most important thing for me is that the team has clear ways of communicating, wherever people work.",
    explanation:
      'Stating a preference honestly while showing adaptability and knowledge of the company\'s policy avoids mismatches later.',
    tips: ['Check the company\'s policy before the interview.', 'Show you can work well in different setups.'],
    commonMistakes: ['Saying you are fine with anything when you are not.', 'Demanding full remote work without checking the policy.'],
    followUpQuestions: ['How do you stay connected with colleagues when remote?', 'What do you need in the office to be productive?'],
  },
  'hr-032': {
    question: 'How do you stay productive and organised when working from home?',
    intent: 'The recruiter wants to know whether you can work autonomously without supervision.',
    expectedAnswer:
      "I keep a routine: I start at the same time each day, plan my priorities in the morning and block time in my calendar for focused work. I have a dedicated workspace, which helps me separate work from home life. I share my progress in a short message to the team at the end of each day, so people know where things stand without needing to ask. I also make sure to stop at a reasonable time and take short breaks, which helps me stay focused over the long term.",
    explanation:
      'Concrete habits and proactive communication show that you are reliable without supervision.',
    tips: ['Describe your actual routine.', 'Mention how you keep the team informed.'],
    commonMistakes: ['Saying you just work harder at home.', 'Ignoring communication with the team.'],
    followUpQuestions: ['How do you handle distractions at home?', 'How do you avoid working too many hours?'],
  },
  'hr-033': {
    question: 'How do you communicate and collaborate effectively in a remote team?',
    intent: 'The recruiter evaluates your ability to avoid misunderstandings and isolation in distributed work.',
    expectedAnswer:
      "I rely mostly on clear written communication: I write messages that can be understood without a meeting, with context, a clear question and a deadline, and I document decisions in a shared place so they don't get lost in chat. I keep meetings for discussions that really need them, such as complex decisions or difficult feedback, and I turn my camera on for those. I make my availability visible and answer within the times we agreed as a team. I also make an effort to keep informal contact, for example a short chat with colleagues each week, because trust is harder to build at a distance. When I sense tension or confusion in written exchanges, I suggest a quick call.",
    explanation:
      'Remote collaboration depends on good writing, documentation, clear availability and deliberate relationship-building.',
    tips: ['Mention written communication and documentation.', 'Explain when you choose a call over a message.'],
    commonMistakes: ['Relying on many meetings instead of clear writing.', 'Ignoring the informal side of teamwork.'],
    followUpQuestions: ['How do you handle disagreements in written messages?', 'Which tools have you used for remote work?'],
  },
  'hr-034': {
    question: 'The role is office-based, but you would like some remote days. How do you ask?',
    intent: 'This situation tests negotiation skills and respect for company policy.',
    expectedAnswer:
      "I would ask once I have an offer, or when the recruiter brings up working conditions, not in the first interview. I would first ask about the policy and whether exceptions exist, then make a specific, reasonable request linked to the work: \"I'm very interested in the role. Would it be possible to work from home on Fridays? I find that day ideal for focused tasks such as reporting, and I'm happy to be fully flexible if the team needs me in the office.\" I could also suggest a trial period, for example three months, followed by a review. If the answer is no, I would decide whether the role is still right for me rather than pushing repeatedly.",
    explanation:
      'A specific, work-focused request with flexibility and a trial period is easier to accept than a general demand.',
    tips: ['Choose the right moment in the process.', 'Make a specific request with a reason linked to the work.', 'Offer a trial period.'],
    commonMistakes: ['Making it a condition in the first interview.', 'Justifying it only with personal convenience.'],
    followUpQuestions: ['What would you do if the answer was no?', 'How would you show that remote days do not affect your work?'],
  },
  'hr-035': {
    question: 'You want to work fully remotely for a company based in another country. What should you clarify?',
    intent: 'The recruiter checks that you understand the practical and legal aspects of cross-border remote work.',
    expectedAnswer:
      "I would clarify the type of contract first: whether I would be an employee through a local entity or an employer of record, or an independent contractor, because it changes taxes, social security, benefits and legal protection. I would confirm whether the company can legally employ people in my country and who handles payroll taxes and contributions. Then the practical points: working hours and how much overlap with the team's time zone is expected, holidays, the currency of payment and who bears exchange-rate risk, equipment and internet costs, and how often travel to the office or team events is expected and who pays. I would also check whether salary is adjusted to my location. I would ask for all of this in writing and, for a contractor arrangement, possibly get advice from a local accountant.",
    explanation:
      'Cross-border remote work involves legal, tax and practical questions that vary by country. Asking them early prevents costly surprises.',
    tips: ['Clarify the contract type and who handles taxes.', 'Agree on time-zone overlap and travel.', 'Ask about location-based pay.'],
    commonMistakes: ['Accepting a contractor role thinking it has the same protections as employment.', 'Ignoring tax obligations in your country.'],
    followUpQuestions: ['What is an employer of record?', 'How would you handle a large time-zone difference?'],
  },
  'hr-036': {
    question: 'Do you have any questions for us?',
    intent: 'The interviewer evaluates your interest, preparation and critical thinking; having no questions can signal low motivation.',
    expectedAnswer:
      "Yes, thank you. First, what would success look like for this role after six months? Second, what are the biggest challenges the team is facing right now? And finally, how do you support the development of people in the team, for example through training or mentoring? I'd also be interested to know what you personally enjoy most about working here.",
    explanation:
      'Good questions show genuine interest and help you decide whether the job is right for you. Questions about success, challenges and development are useful in almost every interview.',
    tips: ['Prepare five or six questions and choose the best ones based on the conversation.', 'Ask about the role and the team, not only benefits.'],
    commonMistakes: ['Saying "No, I think everything is clear".', 'Asking only about holidays and salary in a first interview.', 'Asking questions already answered on the website.'],
    followUpQuestions: ['Which question do you think is most important to ask an employer?', 'What would make you decline an offer?'],
  },
  'hr-037': {
    question: 'Which questions would you ask to understand the role and the team better?',
    intent: 'This situation helps you prepare questions that reveal the real content of the job.',
    expectedAnswer:
      "I would ask: What does a typical week look like in this role? What are the main priorities for the first three months? Who would I work with most closely, and how is the team organised? How are decisions made, for example on priorities? What tools and processes does the team use? Why is this position open: is it a new role or a replacement? These answers help me understand whether the job matches what is in the description and where I could contribute quickly.",
    explanation:
      'Questions about daily work, priorities and team organisation reveal the real job behind the description and show you are already projecting yourself into it.',
    tips: ['Ask about daily work and first priorities.', 'Ask why the position is open.'],
    commonMistakes: ['Asking vague questions such as "What is the culture like?" without follow-up.'],
    followUpQuestions: ['What would you do if the answers contradicted the job description?', 'How many questions is too many?'],
  },
  'hr-038': {
    question: 'Which questions help you detect potential red flags about a company or a team?',
    intent: 'This situation trains you to evaluate an employer critically and professionally.',
    expectedAnswer:
      "I would ask open questions and listen to how they are answered. For example: How long have people on the team been here, and why did the last person in this role leave? How does the team handle urgent work or tight deadlines? Can you tell me about a recent disagreement in the team and how it was resolved? How is performance evaluated and how often do people get feedback? What has changed in the team in the last year? Vague answers, signs of very high turnover, constant overtime presented as normal, or contradictions between interviewers are signals I would explore further, for example by asking to speak with a future colleague.",
    explanation:
      'Interviews work both ways. Asking about turnover, workload and conflict resolution, and noticing evasive answers, helps you avoid a bad fit.',
    tips: ['Ask about turnover, workload and feedback.', 'Pay attention to how questions are answered.', 'Ask to meet future colleagues.'],
    commonMistakes: ['Asking accusatory questions.', 'Ignoring warning signs because you want the job quickly.'],
    followUpQuestions: ['What would you do if you noticed a red flag late in the process?', 'How would you ask about overtime without seeming lazy?'],
  },
  'hr-039': {
    question: 'How would you adapt your questions to the recruiter, the hiring manager or a senior executive?',
    intent: 'The interviewer assesses your ability to tailor questions to each person\'s perspective and role in the decision.',
    expectedAnswer:
      "With the recruiter, I would ask about the process and practical aspects: the next steps and timeline, the salary range and benefits, the working arrangements and what the hiring manager values most. With the hiring manager, I would focus on the work itself: the priorities and challenges for the role, how success is measured, the team's way of working and how they like to give feedback. With a senior executive, I would ask about strategy and context: the company's main goals for the next two years, how this team contributes to them and the biggest risks or opportunities they see. This shows I understand each person's perspective and makes the conversation more valuable for both sides.",
    explanation:
      'Each interviewer has different information and priorities. Tailored questions show business awareness and make better use of each conversation.',
    tips: ['Prepare different questions for each interviewer.', 'Keep strategic questions for senior people.'],
    commonMistakes: ['Asking the CEO about holiday policies.', 'Asking the same questions to everyone.'],
    followUpQuestions: ['What would you ask a future peer?', 'How do you follow up on answers you received?'],
  },
  'hr-040': {
    question: 'How do you close an interview and follow up afterwards?',
    intent: 'The recruiter observes your professionalism until the end of the process.',
    expectedAnswer:
      "At the end of the interview, I thank the interviewers, briefly confirm my interest and ask about the next steps and timeline: \"What are the next steps, and when can I expect to hear from you?\" Within twenty-four hours, I send a short thank-you e-mail mentioning one specific point from our discussion and reaffirming my motivation. If I have not heard anything after the date they mentioned, I send a polite follow-up a few days later. I avoid sending repeated messages.",
    explanation:
      'A clear close and a short, personalised follow-up leave a professional last impression and keep you informed about the process.',
    tips: ['Ask about the next steps before leaving.', 'Send a short personalised thank-you message.'],
    commonMistakes: ['Following up every day.', 'Sending a generic thank-you message with no personal detail.'],
    followUpQuestions: ['What should you write in a follow-up message?', 'How long should you wait before following up?'],
  },
};
