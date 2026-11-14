import type { QuestionText, TextTable } from '@/types/content';

/**
 * HR & salary questions 001-020. Salary rules and notice periods vary by country and contract:
 * answers stay general and invite users to check local rules.
 */
export const enA: TextTable<QuestionText> = {
  'hr-001': {
    question: 'What are your salary expectations?',
    intent: 'The recruiter wants to know whether your expectations fit the budget for the role and whether you have a realistic view of the market.',
    expectedAnswer:
      "Based on my research for similar roles in this city and my four years of experience, I'm looking for a base salary in the range of 52,000 to 58,000 a year. That said, I'm flexible depending on the full package, such as bonuses, remote work and training budget, and on the scope of the role. Could you share the range you have in mind for this position?",
    explanation:
      'Giving a researched range shows preparation and professionalism, while mentioning the full package and asking for their range keeps the conversation open. The numbers here are only an illustration: use figures from your own market.',
    tips: ['Research salaries for the same role, level and location before the interview.', 'Give a range whose lower end you would genuinely accept.', 'Ask about the budgeted range when appropriate.'],
    commonMistakes: ['Answering "I don\'t know" or "whatever you think is fair".', 'Giving a range far above market without justification.', 'Starting the range below what you actually need.'],
    followUpQuestions: ['Is that range flexible?', 'What is the most important part of the package for you?'],
  },
  'hr-002': {
    question: 'What is your current salary?',
    intent: 'The recruiter wants a reference point for an offer, which can anchor the negotiation on your past pay rather than the value of the new role.',
    expectedAnswer:
      "I'd prefer to focus on the value of this role rather than my current package, because the responsibilities are quite different. Based on the scope you described and market data, I'm targeting a range of 52,000 to 58,000. If it helps, I can tell you that my current total package includes a bonus and a training budget, which I'd also consider when comparing offers.",
    explanation:
      'In some countries and states, employers are not allowed to ask about salary history, so check the rules where you live. Redirecting politely to your expectations keeps the discussion on the value of the new role. If you choose to share your salary, be honest and mention the full package.',
    tips: ['Check whether salary history questions are allowed in your location.', 'Redirect to your expected range politely.', 'Never invent a higher current salary.'],
    commonMistakes: ['Lying about your current salary.', 'Refusing to answer in a defensive tone.'],
    followUpQuestions: ['Why are you asking for more than you earn today?', 'What benefits do you currently have?'],
  },
  'hr-003': {
    question: 'An online application form requires your expected salary before any interview. What do you enter?',
    intent: 'This situation tests whether you can handle salary questions early without excluding yourself or underselling yourself.',
    expectedAnswer:
      'I would research the market rate for the role first, then enter a realistic range or a single figure near the upper-middle of what I would accept, if the form only allows one number. If there is a free-text field, I would write something like "Open to discussion depending on the full package; market range for this role is 50,000 to 58,000." I avoid entering zero or an unrealistic figure, because automated filters may screen out my application.',
    explanation:
      'Early salary fields are often used for screening. A researched, realistic value keeps you in the process while leaving room to negotiate later.',
    tips: ['Use salary data from several sources for the specific location and level.', 'Use free-text fields to show flexibility.'],
    commonMistakes: ['Entering a very low number to avoid being filtered out.', 'Entering 0 or 999999 to bypass the field.'],
    followUpQuestions: ['Can you negotiate above the figure you entered?', 'What if the job posting already shows a range?'],
  },
  'hr-004': {
    question: 'How did you determine your salary expectations?',
    intent: 'The recruiter wants to see that your expectations are based on evidence rather than wishes.',
    expectedAnswer:
      "I looked at several sources: salary surveys from recruitment agencies for my field, published ranges in job ads for similar roles in this city, and data from salary comparison sites. I also spoke to two people in similar positions. Then I adjusted for my experience, five years including two leading a small team, and for the responsibilities in your job description, such as managing the data platform. That's how I arrived at a range of 60,000 to 66,000 for the base salary.",
    explanation:
      'Explaining your method makes your figure credible and harder to dismiss. Combining external data with the specific scope of the role shows business thinking.',
    tips: ['Cite types of sources rather than one website.', 'Link your range to the responsibilities of the role.'],
    commonMistakes: ['Basing expectations only on what friends earn.', 'Using data from another country or level without adjusting.'],
    followUpQuestions: ['How do you value benefits compared with base salary?', 'What would make you accept the lower end of your range?'],
  },
  'hr-005': {
    question: 'Our budget for this role is lower than your expectations. How do you react?',
    intent: 'The recruiter tests your flexibility, your priorities and whether you can negotiate constructively.',
    expectedAnswer:
      "Thank you for being transparent. I'm genuinely interested in the role, so I'd like to understand whether there is flexibility in other parts of the package. For example, a performance review with a salary adjustment after six months, a signing bonus, extra remote days or a training budget could bridge part of the gap. If the base salary really cannot move, could you tell me the full range for the role and what would be needed to reach the upper end? That would help me make a decision.",
    explanation:
      'Staying positive while exploring alternatives keeps the relationship good and often finds solutions. Knowing your minimum in advance lets you decide calmly.',
    tips: ['Know your walk-away point before the conversation.', 'Explore non-salary elements and future reviews.', 'Ask for commitments in writing.'],
    commonMistakes: ['Accepting immediately out of fear of losing the offer.', 'Reacting with frustration.'],
    followUpQuestions: ['What is the minimum you would accept?', 'Which benefit matters most to you?'],
  },
  'hr-006': {
    question: 'You are relocating to another country for this role. How do you set your salary expectations?',
    intent: 'The recruiter wants to see whether you understand that compensation depends on the local market, cost of living, taxes and benefits.',
    expectedAnswer:
      "I don't simply convert my current salary, because markets, taxes and benefits are very different. I researched the local market for this role and level using salary surveys and job ads in the city, and compared take-home pay after tax and social contributions with my current situation. I also considered the cost of living, especially rent, and the benefits that are standard here, such as health insurance or pension contributions, which may be included or not. Based on that, I'm looking for 70,000 to 76,000 a year locally. I'd also like to discuss relocation support, such as moving costs, temporary housing and help with visas, which matters a lot for a move like this.",
    explanation:
      'International moves require comparing total value after taxes and cost of living, not gross figures. Relocation support is a legitimate and often negotiable part of the package.',
    tips: ['Compare net income and cost of living, not only gross salary.', 'Check which benefits are standard locally.', 'Ask about relocation support.'],
    commonMistakes: ['Converting your current salary with the exchange rate.', 'Forgetting visa, moving and housing costs.'],
    followUpQuestions: ['Would you accept a local contract rather than an expatriate package?', 'How long can you wait for a visa?'],
  },
  'hr-007': {
    question: 'The offer includes a variable bonus and equity. How do you evaluate it?',
    intent: 'The recruiter wants to see whether you understand complex compensation and can ask the right questions.',
    expectedAnswer:
      "I'd separate what is guaranteed from what is conditional. For the bonus, I'd ask how it is calculated, whether it depends on personal, team or company targets, and how much was actually paid in the last two or three years compared with the target. For equity, I'd ask what type it is, for example stock options or restricted shares, the number and its percentage of the company, the vesting schedule and cliff, what happens if I leave, and for options the strike price and exercise conditions. For a private start-up I'd treat equity as uncertain and value it cautiously, so the base salary must still cover my needs. I'd also check the tax treatment in my country. Then I'd compare the expected total over three to four years with other offers.",
    explanation:
      'Variable pay and equity can be valuable but risky. Asking precise questions and valuing uncertain components conservatively leads to better decisions.',
    tips: ['Ask for historical bonus payouts, not only targets.', 'Clarify vesting, cliff and leaving conditions.', 'Check the tax treatment locally.'],
    commonMistakes: ['Valuing start-up equity as if it were cash.', 'Accepting a low base salary because of a large bonus target.'],
    followUpQuestions: ['What is a vesting cliff?', 'How would you compare this offer with one paying more cash?'],
  },
  'hr-008': {
    question: 'We would like to make you an offer. Can you accept today?',
    intent: 'The recruiter may be testing your enthusiasm or trying to close quickly; they want a clear and professional answer.',
    expectedAnswer:
      "Thank you, I'm really pleased, and I'm very interested in joining the team. Before I give you a final answer, I'd like to receive the offer in writing so I can review the details, including salary, benefits and start date. Would it be possible to give you my answer by Thursday? If I have questions in the meantime, I'll contact you directly.",
    explanation:
      'Asking for the written offer and a short, specific delay is normal and respected. It lets you review the details and negotiate if needed without seeming hesitant.',
    tips: ['Show enthusiasm first.', 'Ask for the offer in writing.', 'Propose a precise and reasonable deadline.'],
    commonMistakes: ['Accepting verbally before seeing the details.', 'Asking for an open-ended delay.'],
    followUpQuestions: ['What would you need to accept?', 'Are you waiting for other offers?'],
  },
  'hr-009': {
    question: 'How would you negotiate a job offer professionally?',
    intent: 'This question checks whether you can advocate for yourself while keeping a positive relationship with your future employer.',
    expectedAnswer:
      "I start by thanking them and confirming my interest, so the negotiation is clearly about details, not doubts. Then I make one clear request backed by evidence: for example, \"Based on market data for this role and my experience with payment systems, which you mentioned as a priority, I was hoping for a base salary of 62,000 rather than 57,000.\" I stay quiet and let them answer. If the salary cannot move, I discuss alternatives such as a signing bonus, an earlier salary review or extra training budget. I avoid making many small demands in several rounds, and I ask for the final agreement in writing before resigning from my current job.",
    explanation:
      'Effective negotiation is polite, specific and based on value and data. Making a clear request and listening works better than long justifications or ultimatums.',
    tips: ['Confirm your interest before negotiating.', 'Make a specific request with a reason.', 'Get the final agreement in writing.'],
    commonMistakes: ['Negotiating by repeated small demands over several days.', 'Using threats or ultimatums.', 'Resigning before receiving the written offer.'],
    followUpQuestions: ['What if they refuse to negotiate?', 'How much above the offer is reasonable to ask?'],
  },
  'hr-010': {
    question: 'Apart from salary, what elements of an offer would you negotiate?',
    intent: 'The recruiter wants to see that you understand the full value of a package and your own priorities.',
    expectedAnswer:
      "Salary matters, but so does the rest of the package. Depending on the company, I would look at the bonus structure, a signing bonus, the number of days off, remote or hybrid work, flexible hours, a budget for training and certifications, the job title, the date of the first salary review, equipment, health insurance and pension contributions, and the start date. For me personally, a clear training budget and two remote days a week are worth a lot, so I would prioritise those if the salary range is fixed.",
    explanation:
      'Many companies have more flexibility on benefits than on base salary. Knowing your priorities lets you trade effectively.',
    tips: ['List your priorities before the negotiation.', 'Ask what is negotiable in this company.'],
    commonMistakes: ['Negotiating only on base salary.', 'Asking for everything at once without priorities.'],
    followUpQuestions: ['Which benefit is most important to you and why?', 'Would you accept a lower salary for full remote work?'],
  },
  'hr-011': {
    question: 'You have another offer. How do you mention it without seeming to bluff?',
    intent: 'The recruiter wants honesty and professionalism when competing offers exist.',
    expectedAnswer:
      "I would mention it honestly and only if it is real: \"I want to be transparent: I've received another offer with a deadline on Friday. Your company is my first choice because of the product and the team, but the other offer is about 10% higher on base salary. Is there any flexibility that would help me make a decision in your favour?\" I would not reveal confidential details of the other company, and I would not exaggerate the figures. If they cannot match, I would make my decision based on the overall fit, not only the money.",
    explanation:
      'A real competing offer is legitimate information. Presenting it with transparency and a clear preference encourages the employer to respond without feeling manipulated.',
    tips: ['Only mention offers that really exist.', 'State your preference and the deadline.', 'Keep the other company\'s details confidential.'],
    commonMistakes: ['Inventing a competing offer.', 'Starting a bidding war between companies.'],
    followUpQuestions: ['What would you do if they matched the other offer?', 'What matters to you more than salary?'],
  },
  'hr-012': {
    question: 'The employer says this is their final offer. What do you do?',
    intent: 'The recruiter wants to see whether you can make a decision calmly and professionally.',
    expectedAnswer:
      "I would take it at face value and evaluate the offer as it is against my priorities and my minimum. If it meets my needs, I would accept graciously and perhaps ask a small, non-salary question, such as confirming the date of the first performance review. If it does not, I would thank them and decline politely, explaining that the package doesn't meet my requirements at this time, and keep the door open: \"I really enjoyed meeting the team, and I'd be happy to stay in touch.\" I would not keep pushing after a clear final answer, because it damages the relationship.",
    explanation:
      'Respecting a final offer shows maturity. Deciding against your pre-defined minimum avoids emotional decisions.',
    tips: ['Decide your minimum before negotiating.', 'Accept or decline clearly and politely.'],
    commonMistakes: ['Continuing to negotiate after a final offer.', 'Accepting an offer you will resent.'],
    followUpQuestions: ['What would make you decline an offer you like?', 'How do you decline without burning bridges?'],
  },
  'hr-013': {
    question: 'How would you ask your current employer for a raise?',
    intent: 'The interviewer assesses your ability to build a business case and negotiate with a manager you will keep working with.',
    expectedAnswer:
      "I would prepare a case based on value and market data, not personal needs. First, I would list my results over the last year with numbers, for example leading the migration that reduced infrastructure costs by 20%, and new responsibilities I took on, such as mentoring two new hires. Second, I would research the market rate for my role and responsibilities. Then I would ask my manager for a dedicated meeting, ideally before budget decisions are made, rather than raising it in a corridor. In the meeting I would present my results and the market data, and make a specific request: \"I'd like my salary to move to 64,000 to reflect my current scope.\" If the answer is no for now, I would ask what results would justify it and agree on a date to review it, and confirm that plan in writing. I would avoid threatening to leave unless I am truly prepared to.",
    explanation:
      'A raise request is a business case. Timing, evidence and a clear path forward if the answer is negative make success more likely and preserve the relationship.',
    tips: ['Prepare quantified results and market data.', 'Time the request around budget cycles.', 'Agree on next steps if the answer is no.'],
    commonMistakes: ['Asking because of personal expenses rather than value.', 'Using a competing offer as a threat without being ready to leave.'],
    followUpQuestions: ['What if your manager says there is no budget?', 'How often is it reasonable to ask for a raise?'],
  },
  'hr-014': {
    question: 'How do you accept or decline a job offer professionally?',
    intent: 'The recruiter wants to see professional communication at the end of the process, which affects your reputation.',
    expectedAnswer:
      "To accept, I would reply quickly, thank them, confirm the key terms such as salary, title and start date, and ask about the next steps, such as the contract and onboarding. I would wait for the signed contract before resigning from my current job. To decline, I would call or write soon after deciding, thank the recruiter and the team for their time, give a brief honest reason without criticism, for example that I accepted a role closer to my long-term goals, and say I would be glad to stay in touch. Recruiters remember candidates who decline gracefully.",
    explanation:
      'Clear, prompt and polite communication protects your reputation in a small professional world and keeps future opportunities open.',
    tips: ['Confirm key terms in writing when accepting.', 'Decline promptly with a brief reason.'],
    commonMistakes: ['Ignoring the recruiter instead of declining.', 'Resigning before the contract is signed.'],
    followUpQuestions: ['What would you do if you received a better offer after accepting?', 'How long should you take to answer an offer?'],
  },
  'hr-015': {
    question: 'What is your notice period?',
    intent: 'The recruiter needs to plan your start date and check that it fits the team\'s needs.',
    expectedAnswer:
      "My contract has a notice period of two months. I want to leave my current team in a good position, so I would use that time to hand over my projects properly. If an earlier start matters for you, I can ask my employer whether part of the notice can be shortened, but I can't promise it, since it depends on them.",
    explanation:
      'Being clear and honest about your notice period builds trust. Notice periods depend on the country, the contract and sometimes your seniority, so check your own contract before the interview.',
    tips: ['Check your contract and local rules before the interview.', 'Show that you will hand over your work responsibly.'],
    commonMistakes: ['Underestimating your notice to seem more attractive.', 'Promising to leave immediately without checking your contract.'],
    followUpQuestions: ['Could you start earlier?', 'Do you have any holidays planned?'],
  },
  'hr-016': {
    question: 'When could you start?',
    intent: 'The recruiter wants a realistic start date to plan onboarding.',
    expectedAnswer:
      "If I receive the signed contract by the end of this month, I could start on the first of March, after my one-month notice period. I also have a week of holiday planned in April that was booked earlier; I'd like to keep it, but I'm happy to discuss it if it causes a problem for the team.",
    explanation:
      'A precise start date with conditions, plus transparency about planned absences, avoids misunderstandings later.',
    tips: ['Calculate the date from your notice period.', 'Mention planned holidays early.'],
    commonMistakes: ['Giving a vague answer such as "soon".', 'Hiding planned holidays until after signing.'],
    followUpQuestions: ['Is that date flexible?', 'Would you be available for a short onboarding call before your start?'],
  },
  'hr-017': {
    question: 'We need you to start before your notice period ends. Is that possible?',
    intent: 'The recruiter tests your professionalism and integrity under pressure.',
    expectedAnswer:
      "I understand the timing matters for you. I'm committed to respecting my contract and leaving my current team in good conditions, so I can't simply leave early. What I can do is ask my employer whether they would agree to shorten the notice once my handover is complete, and I could use some remaining holiday days at the end. I'll let you know their answer within a few days. In the meantime, if it helps, I'd be happy to read documentation or attend an introduction session outside working hours.",
    explanation:
      'Employers value candidates who respect commitments, because they will do the same with them. Proposing legitimate options shows goodwill.',
    tips: ['Explain that you respect your contract.', 'Offer legitimate alternatives, such as negotiating with your employer.'],
    commonMistakes: ['Agreeing to break your contract.', 'Refusing without offering any solution.'],
    followUpQuestions: ['What if your employer refuses?', 'Would you join part-time before your official start?'],
  },
  'hr-018': {
    question: 'What would you do if your current employer made you a counteroffer?',
    intent: 'The recruiter wants to know how committed you are and whether you might withdraw after accepting.',
    expectedAnswer:
      "I would consider it carefully, but my decision to move is not mainly about money. I'm applying because I want to work on product development, which my current role doesn't offer. So unless a counteroffer changed the role itself, I would most likely decline it. I would also be honest with you: if I accept your offer, I intend to keep my word, and I would tell my current employer clearly that my decision is final.",
    explanation:
      'Counteroffers often fail to solve the reasons people want to leave. Explaining your motivation beyond money reassures the recruiter.',
    tips: ['Explain the real reasons for your move.', 'Show that you keep your commitments.'],
    commonMistakes: ['Using a new offer only to get a raise from your current employer.', 'Promising never to consider a counteroffer, which can sound insincere.'],
    followUpQuestions: ['What would your current employer need to change for you to stay?', 'Have you discussed your career goals with your manager?'],
  },
  'hr-019': {
    question: 'Are you available for travel, on-call duty or occasional overtime?',
    intent: 'The recruiter checks that you understand the practical demands of the role and can commit to them honestly.',
    expectedAnswer:
      "Yes, within reasonable limits. I understand the role includes on-call duty one week per month, which I've done in my current job, and I'm comfortable with it as long as the rotation is fair and there is support for incidents. I can travel a few times a quarter for client meetings. For overtime, I'm happy to put in extra effort during launches or incidents; I just want to make sure it remains exceptional rather than the normal way of working. Could you tell me how often on-call incidents happen and how the team organises recovery time?",
    explanation:
      'Honest answers about availability prevent bad surprises on both sides. Asking about frequency and compensation shows professionalism, not reluctance.',
    tips: ['Be honest about your limits.', 'Ask how often it really happens and how it is compensated.'],
    commonMistakes: ['Accepting everything and regretting it later.', 'Refusing any flexibility for a role that clearly requires it.'],
    followUpQuestions: ['How is on-call work compensated here?', 'What is the longest trip you could take?'],
  },
  'hr-020': {
    question: 'Why do you want to change careers?',
    intent: 'The recruiter wants to understand whether your career change is thoughtful and lasting, not an escape from your current job.',
    expectedAnswer:
      "I worked for six years as a secondary school maths teacher, and the parts I enjoyed most were building data tools for my department to track student progress. Over time I realised I wanted to do that full time. I completed a data analysis programme over the last year, built three projects using public education data, and I'm now applying for junior analyst roles where I can combine analytical skills with my experience explaining numbers to people who are not experts.",
    explanation:
      'A convincing career change story is positive, shows a clear trigger, concrete preparation and how your previous experience is an asset in the new field.',
    tips: ['Focus on what attracts you, not what you are escaping.', 'Show concrete preparation: training, projects, practice.', 'Connect your past experience to the new role.'],
    commonMistakes: ['Criticising your previous profession.', 'Presenting the change as a sudden impulse.'],
    followUpQuestions: ['What do you miss from your previous career?', 'What has been the hardest part of the transition?'],
  },
};
