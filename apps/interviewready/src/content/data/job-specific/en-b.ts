import type { QuestionText, TextTable } from '@/types/content';

/** Job-specific questions 031-060: cybersecurity, finance, marketing, human resources. */
export const enB: TextTable<QuestionText> = {
  'job-031': {
    question: 'What is the CIA triad in information security?',
    intent: 'The interviewer checks the foundational model used to reason about security.',
    expectedAnswer:
      'The CIA triad describes three goals of information security. Confidentiality means only authorised people can access information, protected by access control, encryption and data classification. Integrity means information is accurate and not modified without authorisation, protected by permissions, checksums, digital signatures and audit logs. Availability means systems and data are accessible when needed, protected by redundancy, backups and protection against denial-of-service attacks. Security decisions often balance these goals: for example, very strict access controls improve confidentiality but can reduce availability for legitimate users.',
    explanation:
      'The triad gives a simple vocabulary to classify threats and controls, and to explain trade-offs.',
    tips: ['Give one control for each goal.', 'Mention that goals can conflict.'],
    commonMistakes: ['Confusing integrity with availability.'],
    followUpQuestions: ['Which goal does ransomware attack?', 'What is non-repudiation?'],
  },
  'job-032': {
    question: 'What are the most common types of cyberattacks organisations face?',
    intent: 'The interviewer checks awareness of the threat landscape.',
    expectedAnswer:
      'Phishing is the most common entry point: fraudulent e-mails or messages trick people into giving credentials or opening malicious files. Malware includes viruses, trojans and spyware installed on devices. Ransomware encrypts data and demands payment, often after stealing data to threaten publication. Credential attacks use leaked or guessed passwords, such as credential stuffing. Denial-of-service attacks overwhelm a service with traffic. Exploitation of unpatched vulnerabilities in internet-facing systems is another frequent route, as are supply chain attacks through a trusted supplier or software update. Social engineering by phone, such as fake IT support calls, is also common. Defences combine user awareness, multi-factor authentication, patching, backups and monitoring.',
    explanation:
      'Knowing common attacks helps prioritise defences. Most successful attacks exploit people, weak credentials or missing patches.',
    tips: ['Describe each attack briefly with a defence.', 'Mention that phishing is the most frequent entry point.'],
    commonMistakes: ['Focusing only on sophisticated attacks and ignoring basic hygiene.'],
    followUpQuestions: ['How would you train employees against phishing?', 'What is credential stuffing?'],
  },
  'job-033': {
    question: 'What is a SIEM, and how do you triage security alerts?',
    intent: 'The interviewer checks practical security operations knowledge.',
    expectedAnswer:
      'A SIEM, security information and event management system, collects logs from many sources, such as firewalls, servers, identity systems and endpoints, normalises them and applies correlation rules to detect suspicious activity, for example many failed logins followed by a success from an unusual country. When an alert arrives, I first check its severity and the asset involved, then gather context: is the user or host known, is the activity expected, such as an authorised scan, and are there related events before and after. I check indicators such as IP addresses or file hashes against threat intelligence. Then I classify it as a false positive, a benign event or a real incident, escalate real incidents according to the response plan, and document my reasoning. Recurring false positives should be fed back to tune the rules, because alert fatigue is a major risk.',
    explanation:
      'Triage is about context and evidence, not reacting to every alert. Tuning rules is part of the job.',
    tips: ['Describe how you gather context.', 'Mention threat intelligence and documentation.', 'Talk about tuning false positives.'],
    commonMistakes: ['Closing alerts without documenting why.', 'Escalating everything without analysis.'],
    followUpQuestions: ['What is an indicator of compromise?', 'How do EDR tools complement a SIEM?'],
  },
  'job-034': {
    question: 'How do you prioritise vulnerabilities for patching?',
    intent: 'The interviewer evaluates risk-based thinking in vulnerability management.',
    expectedAnswer:
      'There are always more vulnerabilities than time, so I prioritise by risk rather than by count. The CVSS score gives technical severity, but I also consider whether the vulnerability is being actively exploited, using sources such as the CISA Known Exploited Vulnerabilities catalogue or exploit prediction scores like EPSS; whether the affected system is exposed to the internet; how critical the asset and its data are; and whether compensating controls exist. An actively exploited flaw on an internet-facing server gets patched within days, while a high CVSS score on an isolated internal test machine can wait for the regular cycle. I agree remediation deadlines with system owners, track them, and when patching is impossible, apply mitigations such as configuration changes or network restrictions and document the accepted risk.',
    explanation:
      'Combining severity, exploitability, exposure and asset value focuses effort where attackers are most likely to succeed.',
    tips: ['Go beyond CVSS.', 'Mention known exploited vulnerability lists.', 'Explain what to do when patching is impossible.'],
    commonMistakes: ['Patching strictly by CVSS score.', 'Ignoring assets nobody owns.'],
    followUpQuestions: ['What is EPSS?', 'How do you handle a system that cannot be patched?'],
  },
  'job-035': {
    question: 'Why is multi-factor authentication important, and what makes some methods stronger than others?',
    intent: 'The interviewer checks knowledge of authentication, one of the most effective security controls.',
    expectedAnswer:
      'Multi-factor authentication requires two or more different factors: something you know, such as a password, something you have, such as a phone or security key, and something you are, such as a fingerprint. It blocks most attacks based on stolen or guessed passwords, which are very common. Methods differ in strength. SMS codes are better than nothing but vulnerable to SIM swapping and interception. Authenticator app codes are stronger, and push notifications are convenient but can be abused with "MFA fatigue" attacks, which number matching reduces. The strongest are phishing-resistant methods such as FIDO2 security keys and passkeys, which are bound to the real website and cannot be replayed on a fake one. I would require MFA everywhere, especially for administrators and remote access, and move privileged users to phishing-resistant methods.',
    explanation:
      'MFA is one of the highest-impact controls. Knowing that not all methods resist phishing shows up-to-date knowledge.',
    tips: ['Name the three factor types.', 'Compare SMS, app, push and FIDO2.', 'Mention MFA fatigue.'],
    commonMistakes: ['Treating all MFA methods as equally strong.', 'Exempting administrators for convenience.'],
    followUpQuestions: ['What are passkeys?', 'How does an MFA fatigue attack work?'],
  },
  'job-036': {
    question: 'Walk me through how you would respond to a ransomware incident.',
    intent: 'The interviewer assesses advanced incident response skills and structured thinking under pressure.',
    expectedAnswer:
      "I would follow the incident response plan, typically based on the NIST lifecycle: preparation, detection and analysis, containment, eradication and recovery, and lessons learned. Upon detection, I would confirm the incident, alert the incident response team and management, and start a timeline. Containment comes first: isolate infected machines from the network, disable compromised accounts, block malicious IPs and domains, and protect backups by disconnecting them if they might be reached. I would preserve evidence such as memory images and logs before wiping anything. Analysis determines the entry point, for example a phishing e-mail or an exposed remote access service, the ransomware family, which systems are affected and whether data was stolen. Eradication removes the attacker's access, including persistence and created accounts, and closes the entry point. Recovery restores systems from clean, tested backups, prioritised by business criticality, with close monitoring for reinfection. In parallel, legal and communication teams handle regulatory notifications, law enforcement and stakeholder communication; the decision about paying a ransom belongs to leadership with legal advice, and it is generally discouraged. Finally, a post-incident review improves defences, such as MFA, patching, segmentation and immutable backups.",
    explanation:
      'A structured lifecycle, containment before recovery, evidence preservation and coordination with legal and leadership are the core of a strong answer.',
    tips: ['Use the NIST lifecycle.', 'Emphasise protecting backups and preserving evidence.', 'Mention legal and communication aspects.'],
    commonMistakes: ['Restoring backups before closing the entry point.', 'Wiping machines before collecting evidence.'],
    followUpQuestions: ['How would you know whether data was exfiltrated?', 'What makes a backup resistant to ransomware?'],
  },
  'job-037': {
    question: 'How would you threat-model a new web application before it goes live?',
    intent: 'The interviewer evaluates proactive security design skills.',
    expectedAnswer:
      'I would work with the development team early, ideally during design. First we describe the system with a data flow diagram: users, components, data stores, external services and trust boundaries, such as between the internet and the application or between the application and the payment provider. Then we identify threats for each element using a method such as STRIDE: spoofing identity, tampering with data, repudiation, information disclosure, denial of service and elevation of privilege. For example, an attacker could change another user\'s order by modifying an ID in the request, which is a tampering and authorisation threat. For each threat we evaluate likelihood and impact and decide on mitigations, such as server-side authorisation checks, input validation, encryption, rate limiting and audit logs. The results become security requirements and test cases, tracked in the backlog. The model is updated when the architecture changes significantly.',
    explanation:
      'Threat modelling finds design flaws before they are coded. A diagram, a structured method like STRIDE and actionable mitigations are the key elements.',
    tips: ['Start with a data flow diagram and trust boundaries.', 'Explain STRIDE with an example.', 'Turn threats into requirements and tests.'],
    commonMistakes: ['Doing security only through a penetration test before launch.', 'Producing a threat model that never leads to changes.'],
    followUpQuestions: ['What is a trust boundary?', 'How do you keep threat models up to date in Agile teams?'],
  },
  'job-038': {
    question: 'Tell me about a time you convinced people outside security to adopt a security measure.',
    intent: 'The interviewer evaluates communication and influence, which are essential for security professionals.',
    expectedAnswer:
      "Situation: our sales team resisted multi-factor authentication on the CRM because they feared it would slow them down when meeting clients. Task: I needed to roll it out without harming productivity or creating workarounds. Action: I met the sales managers to understand their concerns and explained the risk with a concrete example from our sector, a competitor that had lost client data through a stolen password. I proposed authenticator app push notifications with number matching, which take a few seconds, and a 'remember this device' option on company laptops. I ran a pilot with five volunteers and shared their feedback. Result: the whole team adopted MFA within a month, with no increase in support requests, and two weeks later MFA blocked a login attempt using a salesperson's leaked password.",
    explanation:
      'Security adoption depends on understanding users\' constraints, explaining risk concretely and making the secure option easy.',
    tips: ['Show that you listened to the users\' concerns.', 'Use a concrete, relevant example of risk.', 'Make the secure path easy.'],
    commonMistakes: ['Imposing controls without explanation.', 'Using fear and jargon instead of clear arguments.'],
    followUpQuestions: ['What do you do when a manager refuses a control?', 'How do you measure security awareness?'],
  },
  'job-039': {
    question: 'What are the three main financial statements, and how are they linked?',
    intent: 'The interviewer checks fundamental accounting knowledge for finance roles.',
    expectedAnswer:
      'The income statement shows revenue, expenses and profit over a period. The balance sheet shows what the company owns, assets, what it owes, liabilities, and equity at a point in time. The cash flow statement shows cash coming in and going out over the period, split into operating, investing and financing activities. They are linked: net profit from the income statement flows into retained earnings in the equity section of the balance sheet, and it is the starting point of the cash flow statement under the indirect method, adjusted for non-cash items such as depreciation and for changes in working capital. The ending cash on the cash flow statement equals the cash on the balance sheet.',
    explanation:
      'Understanding how the statements connect shows that you can follow the effect of a transaction through the accounts.',
    tips: ['Describe each statement briefly.', 'Explain at least two links between them.'],
    commonMistakes: ['Confusing profit with cash.', 'Saying the balance sheet covers a period.'],
    followUpQuestions: ['How does depreciation affect each statement?', 'What happens to the statements when a company buys equipment on credit?'],
  },
  'job-040': {
    question: 'How would you evaluate an investment project? Explain NPV and IRR.',
    intent: 'The interviewer checks capital budgeting skills used in financial analysis.',
    expectedAnswer:
      'I would estimate the project\'s expected cash flows over its life, including the initial investment, operating cash flows and any residual value, then discount them to today using a discount rate that reflects the cost of capital and the project\'s risk. Net present value is the sum of these discounted cash flows: a positive NPV means the project creates value above the required return. Internal rate of return is the discount rate at which NPV equals zero; if it is higher than the cost of capital, the project is attractive. NPV is generally preferred for decisions, because IRR can be misleading for projects with unusual cash flow patterns or when comparing projects of different sizes. I would complement them with payback period, sensitivity analysis on key assumptions and strategic factors that numbers do not capture.',
    explanation:
      'NPV and IRR are standard tools; knowing their limitations and testing assumptions makes the analysis credible.',
    tips: ['Define both clearly.', 'Explain why NPV is often preferred.', 'Mention sensitivity analysis.'],
    commonMistakes: ['Ignoring the time value of money.', 'Choosing between projects of different sizes by IRR alone.'],
    followUpQuestions: ['How do you choose the discount rate?', 'What is the payback period and its weakness?'],
  },
  'job-041': {
    question: 'What is the difference between a budget and a forecast, and how do you perform variance analysis?',
    intent: 'The interviewer checks financial planning and analysis skills.',
    expectedAnswer:
      'A budget is the financial plan set at the start of the year, usually approved by management and used as a target. A forecast is an updated estimate of expected results, revised regularly, for example monthly or quarterly, based on actual performance and new information. Variance analysis compares actual results with the budget or forecast to explain the differences. I look at the largest variances first and break them down into drivers: for revenue, volume, price and mix effects; for costs, rate and usage differences or timing. For example, revenue may be 5% below budget because volumes are lower in one region while prices are slightly higher. I then explain whether the variance is temporary or structural and what actions or forecast changes are needed, in language that business managers understand.',
    explanation:
      'Variance analysis turns numbers into explanations and actions. Breaking variances into drivers is the key skill.',
    tips: ['Distinguish budget and forecast clearly.', 'Explain volume, price and mix effects.', 'End with actions.'],
    commonMistakes: ['Reporting variances without explaining their causes.', 'Treating timing differences as permanent.'],
    followUpQuestions: ['What is a rolling forecast?', 'How would you present variances to a sales director?'],
  },
  'job-042': {
    question: 'Which financial ratios would you use to assess a company\'s health?',
    intent: 'The interviewer checks analytical skills and the ability to interpret ratios in context.',
    expectedAnswer:
      'I would look at several groups. Profitability: gross margin, operating margin and return on equity or capital employed show how well the company turns revenue into profit. Liquidity: the current ratio and quick ratio show whether it can pay short-term obligations. Solvency: debt-to-equity and interest coverage show financial risk. Efficiency: days sales outstanding, inventory turnover and days payable outstanding show how well working capital is managed. Cash: operating cash flow compared with net profit shows earnings quality. Ratios must be compared over time and with companies in the same industry, because a normal level for a retailer is different from a software company. I would also read the notes to the accounts for one-off items that distort the picture.',
    explanation:
      'Ratios are meaningful only in context: trend, industry benchmarks and accounting details.',
    tips: ['Group ratios by purpose.', 'Insist on comparison over time and with peers.'],
    commonMistakes: ['Interpreting a ratio without industry context.', 'Ignoring cash flow when profit looks good.'],
    followUpQuestions: ['What does a falling quick ratio suggest?', 'How can a profitable company run out of cash?'],
  },
  'job-043': {
    question: 'Tell me about a time you found an error in a financial report or had to present bad numbers.',
    intent: 'The interviewer evaluates integrity, accuracy and communication in finance.',
    expectedAnswer:
      "Situation: two days before the monthly results presentation, I noticed that a supplier invoice had been recorded twice, overstating costs by 120,000 and making the month look worse than it was. Task: as the analyst who prepared the report, I needed to correct it quickly and inform my manager. Action: I verified the duplicate with the accounts payable team, corrected the entry and updated the report. I told my manager immediately, explained the cause, a manual upload of a file that had already been imported automatically, and proposed a control: a duplicate check on invoice number and supplier before each closing. Result: the presentation used the correct figures, the control was added to our closing checklist and no duplicate has been found since.",
    explanation:
      'In finance, accuracy and transparency are essential. Reporting errors immediately and adding a control demonstrates reliability.',
    tips: ['Explain how you verified the error.', 'Show immediate transparency.', 'Describe the control you added.'],
    commonMistakes: ['Correcting silently without informing anyone.', 'Minimising the impact of the error.'],
    followUpQuestions: ['What other controls do you use at month-end?', 'How would you present results that miss the budget?'],
  },
  'job-044': {
    question: 'How would you build a financial model to support a business decision?',
    intent: 'The interviewer assesses advanced modelling skills, structure and rigour.',
    expectedAnswer:
      'I start from the decision and the questions the model must answer, for example whether to open a new site, to avoid building something too complex. I structure the model clearly: an inputs and assumptions sheet, calculations, and outputs, with consistent formatting, no hard-coded numbers in formulas and clear labels and units. Assumptions are documented with their sources, such as market data, historical performance or management estimates. The model builds revenue from drivers, for example customers multiplied by average spend, and costs split into fixed and variable, then produces the three statements or at least cash flows, and valuation metrics such as NPV. I test the model with checks, such as balance sheet balancing and reasonableness of margins, and have it reviewed. Then I run sensitivity analysis on the key drivers and scenarios, base, optimistic and pessimistic, to show which assumptions matter most. I present the results with the range of outcomes and the main risks, not just a single number.',
    explanation:
      'A good model is transparent, driver-based, checked and focused on the decision. Sensitivity and scenarios communicate uncertainty.',
    tips: ['Separate inputs, calculations and outputs.', 'Use driver-based logic.', 'Include checks, sensitivity and scenarios.'],
    commonMistakes: ['Hard-coding numbers in formulas.', 'Presenting a single figure as certain.'],
    followUpQuestions: ['Which drivers would you model for a subscription business?', 'How do you make a model easy for others to review?'],
  },
  'job-045': {
    question: 'How would you explain to non-financial managers why a profitable company can run short of cash?',
    intent: 'The interviewer evaluates your ability to explain financial concepts clearly to decision-makers.',
    expectedAnswer:
      "I would use a simple example. Imagine we sell 100,000 of products this month with a 20% margin, so the income statement shows a profit of 20,000. But our customers pay in 60 days, while we pay our suppliers and salaries this month. Profit is recorded when we sell, but cash comes in only when customers pay. If sales grow quickly, we spend more cash on stock and production before receiving payments, so growth can consume cash. This is working capital: money tied up in customer receivables and stock, minus what we owe suppliers. Investments in equipment also use cash immediately while their cost appears gradually as depreciation. To protect cash, we can shorten payment terms, follow up late payments, manage stock levels and plan financing in advance. I would show a simple chart comparing monthly profit and cash balance to make the difference visible.",
    explanation:
      'Translating finance into concrete examples and visuals helps managers make better decisions. The profit versus cash distinction is one of the most important to explain.',
    tips: ['Use a simple numeric example.', 'Explain working capital in plain words.', 'End with actions managers can take.'],
    commonMistakes: ['Using accounting jargon with non-financial audiences.', 'Explaining the concept without practical actions.'],
    followUpQuestions: ['How would you reduce days sales outstanding?', 'What is a cash flow forecast used for?'],
  },
  'job-046': {
    question: 'Why do you want to work in marketing, and which channels do you know best?',
    intent: 'The interviewer checks motivation and practical experience with marketing channels.',
    expectedAnswer:
      "I like that marketing combines understanding people with measurable results. During my internship at an e-commerce company, I managed the newsletter and some paid social campaigns. I enjoyed testing different subject lines and audiences and seeing which messages worked; one test on product recommendations increased click-through rate by 30%. The channels I know best are e-mail marketing and paid social media, especially audience targeting and campaign reporting. I'm now developing my skills in SEO, which I see as important for your content strategy.",
    explanation:
      'Linking motivation to concrete experience and results, and naming channels you really know, makes the answer credible.',
    tips: ['Mention real campaigns and results.', 'Be honest about channels you know less.'],
    commonMistakes: ['Saying you know every channel.', 'Talking about creativity without results.'],
    followUpQuestions: ['Tell me about a campaign result you are proud of.', 'How would you learn a new channel quickly?'],
  },
  'job-047': {
    question: 'Explain the marketing funnel and how you would use it.',
    intent: 'The interviewer checks a basic marketing framework and how you apply it.',
    expectedAnswer:
      'The funnel describes the stages a potential customer goes through: awareness, when they discover the brand; consideration, when they compare options; conversion, when they buy or sign up; and then retention and advocacy, when they buy again and recommend the brand. Each stage needs different content and channels: for example, social media or video for awareness, comparison guides and reviews for consideration, offers and simple checkout for conversion, and e-mail and loyalty programmes for retention. I use the funnel to see where we lose most people, using metrics such as reach, click-through rate, conversion rate and repeat purchase rate, and to focus improvements on the weakest stage.',
    explanation:
      'The funnel organises marketing actions and metrics by customer stage, which helps find where to improve.',
    tips: ['Name each stage with a channel example.', 'Link stages to metrics.'],
    commonMistakes: ['Focusing only on acquisition and ignoring retention.'],
    followUpQuestions: ['Which metric would you track at each stage?', 'How does the funnel differ for B2B?'],
  },
  'job-048': {
    question: 'Which KPIs would you use to evaluate a digital marketing campaign?',
    intent: 'The interviewer checks analytical skills and the ability to connect marketing to business results.',
    expectedAnswer:
      'It depends on the campaign goal. For awareness, I would look at reach, impressions and brand search volume. For engagement, click-through rate and time on site. For performance, conversion rate, cost per acquisition, CAC, and return on ad spend, ROAS: revenue generated divided by ad spend. For business impact, I would compare acquisition cost with customer lifetime value, LTV, because a customer that is expensive to acquire can still be profitable if they stay for years; a common target is an LTV to CAC ratio of at least three to one. I define KPIs and targets before launch, check that tracking works and compare results with a control or a previous period to estimate the real effect.',
    explanation:
      'Good KPIs depend on the goal and connect marketing spend to business value, with LTV and CAC as key links.',
    tips: ['Match KPIs to campaign goals.', 'Explain CAC, ROAS and LTV.', 'Define targets before launch.'],
    commonMistakes: ['Reporting only vanity metrics such as likes.', 'Judging campaigns on ROAS alone without margins.'],
    followUpQuestions: ['How would you calculate LTV?', 'What if ROAS is high but total sales do not increase?'],
  },
  'job-049': {
    question: 'How would you plan the marketing campaign for a new product launch?',
    intent: 'The interviewer evaluates planning, structure and customer focus.',
    expectedAnswer:
      'I would start with the objective and target audience: who the product is for, their needs and where they spend time, using research and existing customer data. Then I would define the positioning and key message: the main benefit and why it is different from alternatives. I would choose channels based on the audience, for example e-mail for existing customers, social media and influencers for awareness, search ads for people already looking for a solution, and press or partnerships when relevant. I would build a timeline with pre-launch teasing, launch and follow-up phases, allocate the budget by channel, and coordinate with sales, product and customer support so everyone is ready. KPIs and tracking would be set before launch, and I would review results weekly to shift budget to what works.',
    explanation:
      'A launch plan connects audience, message, channels, timing and measurement, and aligns internal teams.',
    tips: ['Start with audience and positioning.', 'Explain the phases.', 'Mention coordination with other teams.'],
    commonMistakes: ['Choosing channels before understanding the audience.', 'Forgetting to prepare sales and support teams.'],
    followUpQuestions: ['How would you allocate a limited budget?', 'What would you do if the launch underperforms in the first week?'],
  },
  'job-050': {
    question: 'Tell me about a marketing campaign that underperformed. What did you do?',
    intent: 'The interviewer evaluates accountability, analysis and adaptability.',
    expectedAnswer:
      "Situation: I ran a paid social campaign to promote a new online course, targeting 500 sign-ups in a month. After two weeks we had 90. Task: I needed to understand why and improve results with the remaining budget. Action: I analysed the funnel: the click-through rate was good, but only 1% of visitors signed up. Looking at the landing page, I saw that the price appeared before the benefits and the form had eight fields. I created a new version with testimonials first and a three-field form, and tested it against the original with half of the traffic. I also paused the two audiences with the highest cost per sign-up. Result: the conversion rate rose to 3.5%, we finished the month with 380 sign-ups, below target but at a lower cost per sign-up, and the new landing page became our template.",
    explanation:
      'Strong answers show funnel analysis, quick tests, budget reallocation and honest reporting of results.',
    tips: ['Identify where the funnel broke.', 'Describe tests and budget changes.', 'Be honest if the target was missed.'],
    commonMistakes: ['Blaming the algorithm or the market.', 'Changing many things at once without measuring.'],
    followUpQuestions: ['What would you do differently before launch?', 'How do you decide when to stop a campaign?'],
  },
  'job-051': {
    question: 'What is the difference between SEO and paid search, and how would you use them together?',
    intent: 'The interviewer checks knowledge of search marketing strategy.',
    expectedAnswer:
      'SEO, search engine optimisation, improves a website\'s position in organic search results through relevant content, technical quality such as speed and mobile usability, and authority from links from other sites. It takes months to show results, but traffic does not cost per click and builds long-term value. Paid search, often called SEA or PPC, buys ads shown for chosen keywords, giving immediate visibility and precise control over budget and targeting, but traffic stops when spending stops. Used together, paid search can test which keywords and messages convert before investing in SEO content, cover important keywords while SEO grows, and target commercial searches where competition is strong. SEO content then reduces dependence on paid traffic over time. I would track both in the same reporting to avoid paying for clicks we would have received organically.',
    explanation:
      'SEO and paid search have different time horizons and costs; combining them balances quick results and long-term value.',
    tips: ['Compare speed, cost and durability.', 'Give a concrete way they support each other.'],
    commonMistakes: ['Treating SEO as a one-time project.', 'Bidding on brand keywords without checking organic results.'],
    followUpQuestions: ['How would you choose keywords?', 'What technical SEO issues are most common?'],
  },
  'job-052': {
    question: 'How do you measure marketing effectiveness when tracking is limited by privacy rules and cookie restrictions?',
    intent: 'The interviewer evaluates advanced, up-to-date measurement thinking.',
    expectedAnswer:
      'Consent requirements such as the GDPR, browser restrictions on third-party cookies and mobile privacy changes mean that user-level tracking is incomplete, so last-click attribution becomes even less reliable. I would combine several approaches. First, collect first-party data properly, with clear consent and server-side tagging where appropriate, and respect users who decline. Second, use modelled conversions provided by advertising platforms, while treating them as estimates. Third, run incrementality tests, such as geographic holdouts or conversion lift studies, where a control group does not see ads, to measure the real causal effect of a channel. Fourth, use marketing mix modelling, which analyses aggregate spend and sales over time, including seasonality and other factors, to estimate each channel\'s contribution without tracking individuals. I would triangulate these methods, accept a degree of uncertainty and make budget decisions based on consistent trends rather than precise but misleading numbers.',
    explanation:
      'Modern measurement relies on consented first-party data, experiments and aggregate models rather than individual tracking.',
    tips: ['Explain why tracking is limited.', 'Mention incrementality tests and marketing mix modelling.', 'Respect consent choices.'],
    commonMistakes: ['Relying only on platform-reported attribution.', 'Trying to bypass consent choices.'],
    followUpQuestions: ['How would you design a geographic holdout test?', 'What data does marketing mix modelling need?'],
  },
  'job-053': {
    question: 'How would you position a product in a crowded market?',
    intent: 'The interviewer assesses strategic marketing skills: segmentation, differentiation and messaging.',
    expectedAnswer:
      'I would start with research: customer interviews, reviews of competitor products and sales data, to understand which segments have unmet needs and why customers choose or leave. Rather than targeting everyone, I would choose a segment where we can win, for example small accounting firms that find existing tools too complex. Then I would map competitors on the dimensions that matter to that segment, such as simplicity, price and integrations, to find a credible differentiation that we can actually deliver. The positioning statement would define the target, their problem, our category, our main benefit and the proof: "For small accounting firms that lose time with complex software, our tool is the simplest practice management solution, set up in one day, as shown by our onboarding results." Messaging, pricing, product priorities and sales materials would all follow it. I would test the message with ads or landing pages and customer conversations, then refine it, and review it as the market changes.',
    explanation:
      'Positioning means choosing a target segment and a credible difference, then aligning the whole company around it and validating it with real customers.',
    tips: ['Start with research and a chosen segment.', 'Write a positioning statement with proof.', 'Explain how you would test it.'],
    commonMistakes: ['Trying to appeal to everyone.', 'Claiming differences the product cannot deliver.'],
    followUpQuestions: ['How would you know the positioning is working?', 'What if a competitor copies your differentiator?'],
  },
  'job-054': {
    question: 'Why do you want to work in human resources?',
    intent: 'The interviewer checks motivation and understanding of the HR role beyond "liking people".',
    expectedAnswer:
      "I'm interested in HR because it affects how people experience their work every day: how they are recruited, welcomed, developed and treated fairly. During my internship in a logistics company, I helped organise the onboarding of seasonal workers and redesigned the welcome booklet with their feedback; early departures in the first week decreased the following season. I also learned that HR involves rigour: labour law, confidentiality and data. I'd like to develop in recruitment and onboarding, where I think I can contribute quickly.",
    explanation:
      'A strong answer shows an understanding of HR as both a people-focused and a rigorous, business-oriented function, illustrated with experience.',
    tips: ['Give a concrete example of HR work you did.', 'Mention the rigorous side of HR.'],
    commonMistakes: ['Saying only "I like helping people".'],
    followUpQuestions: ['Which HR area interests you most?', 'How would you handle confidential information?'],
  },
  'job-055': {
    question: 'What are the key steps of a good recruitment process?',
    intent: 'The interviewer checks practical recruitment knowledge and attention to fairness.',
    expectedAnswer:
      'It starts with defining the need with the hiring manager: the purpose of the role, key responsibilities and the skills that are really required versus nice to have. Then a clear, inclusive job description and the choice of sourcing channels. Screening should use consistent criteria. Interviews should be structured: the same questions for every candidate, linked to the required skills, with a scoring guide, which is fairer and better at predicting performance than unstructured conversations. Practical exercises or case studies can complement interviews. Then references, the offer and finally onboarding preparation. Throughout, candidates should receive timely communication, and data must be handled according to privacy rules. I would also track metrics such as time to hire, offer acceptance rate and new hire retention to improve the process.',
    explanation:
      'Structured, criteria-based recruitment is fairer and more effective. Candidate experience and metrics complete the process.',
    tips: ['Mention structured interviews and scoring.', 'Include candidate communication and data protection.'],
    commonMistakes: ['Hiring based on "gut feeling".', 'Leaving candidates without news for weeks.'],
    followUpQuestions: ['How do you reduce bias in interviews?', 'How would you shorten time to hire?'],
  },
  'job-056': {
    question: 'Tell me about a time you handled an employee complaint or conflict.',
    intent: 'The interviewer evaluates discretion, fairness and conflict management in an HR context.',
    expectedAnswer:
      "Situation: an employee came to me saying that a colleague regularly made disrespectful comments about her in meetings. Task: as HR assistant, I had to handle the complaint fairly, confidentially and according to our procedure. Action: I listened carefully, took notes, explained the process and what would happen next, and reassured her about confidentiality and protection against retaliation. With my HR manager, we met the colleague to hear his version, spoke with two witnesses and reviewed relevant messages. The facts confirmed inappropriate behaviour. The manager and HR met the colleague to set clear expectations, a formal warning was issued according to policy, and we organised a mediated conversation, which the employee accepted. Result: the behaviour stopped, I followed up with her one and three months later, and we added a module on respectful communication to the managers' training.",
    explanation:
      'Fair process, confidentiality, hearing both sides, documenting and following up are essential in handling complaints.',
    tips: ['Show you listened and explained the process.', 'Hear both sides before concluding.', 'Mention follow-up.'],
    commonMistakes: ['Taking sides before investigating.', 'Sharing details beyond those who need to know.'],
    followUpQuestions: ['What if the complaint was about a senior manager?', 'How do you protect the person who complains?'],
  },
  'job-057': {
    question: 'How would you reduce early turnover among new employees?',
    intent: 'The interviewer checks analytical HR thinking and onboarding practices.',
    expectedAnswer:
      'First I would analyse the data: when people leave, in which teams or roles, and why, using exit interviews and short surveys at 30, 60 and 90 days. Common causes are a gap between the job described in recruitment and the real job, poor onboarding, lack of manager support or unclear expectations. Depending on the findings, actions could include more realistic job descriptions and interviews that show the reality of the role; a structured onboarding plan with a buddy, a clear first-week schedule and objectives for the first three months; training managers to hold regular check-ins; and making sure equipment and access are ready on day one. I would measure the effect by tracking retention at three and six months and the new-hire surveys, and adjust the programme.',
    explanation:
      'Understanding causes with data, then improving recruitment accuracy, onboarding and manager support, reduces early departures.',
    tips: ['Start with data on when and why people leave.', 'Propose concrete onboarding actions.', 'Measure results.'],
    commonMistakes: ['Assuming the cause is salary without evidence.', 'Treating onboarding as only paperwork.'],
    followUpQuestions: ['What would a good first week look like?', 'How do you get honest feedback in exit interviews?'],
  },
  'job-058': {
    question: 'How do you protect employee personal data in HR work?',
    intent: 'The interviewer checks awareness of data protection obligations and practical habits.',
    expectedAnswer:
      'HR handles sensitive personal data, such as identity documents, salaries, health information and performance reviews, so I follow data protection principles such as those of the GDPR where it applies: collect only what is necessary for a clear purpose, give access only to people who need it, keep data only as long as required and inform employees about how their data is used. In practice, I store files in secure HR systems rather than personal folders or e-mail attachments, use encryption or password protection when sending documents, avoid discussing personal cases in open spaces, and lock my screen. Health data and other special categories need extra protection. If I suspect a data breach, such as a payroll file sent to the wrong person, I report it immediately to the data protection officer, because there may be legal deadlines for notification.',
    explanation:
      'Data protection in HR combines legal principles with daily habits. Knowing how to react to a breach is essential.',
    tips: ['Mention minimisation, access control and retention.', 'Give daily habits.', 'Explain what to do in case of a breach.'],
    commonMistakes: ['Sending payroll files by unprotected e-mail.', 'Keeping candidate data indefinitely.'],
    followUpQuestions: ['How long should you keep unsuccessful candidates\' data?', 'Who should have access to performance reviews?'],
  },
  'job-059': {
    question: 'Tell me about a time you supported a manager through a difficult conversation, such as a dismissal or a performance issue.',
    intent: 'The interviewer assesses advanced HR partnering skills: preparation, fairness and humanity in difficult situations.',
    expectedAnswer:
      "Situation: a team manager wanted to dismiss an employee whose performance had declined sharply over six months, but there was no documented feedback. Task: as HR business partner, I had to make sure the process was fair, legally sound and humane. Action: I explained to the manager that we first needed a clear performance improvement process: documented expectations, regular feedback and support. I helped him prepare the first conversation with facts and examples and encouraged him to ask open questions. During that meeting, the employee mentioned a difficult family situation. We adjusted his schedule temporarily and referred him to the employee assistance programme, while keeping clear objectives. We held check-ins every two weeks, which I attended when needed. Result: after three months his performance improved significantly and dismissal was no longer necessary. The manager later said the process taught him to address issues earlier, and we created a short guide for managers on performance conversations.",
    explanation:
      'Good HR support balances fairness, legal requirements and empathy, and helps managers address issues early with facts.',
    tips: ['Show preparation with facts and process.', 'Balance empathy with clear expectations.', 'Mention what the manager learned.'],
    commonMistakes: ['Supporting a dismissal without documentation or fair process.', 'Avoiding the difficult conversation.'],
    followUpQuestions: ['What if performance had not improved?', 'How do you prepare a manager for an emotional reaction?'],
  },
  'job-060': {
    question: 'How would you make a company\'s hiring process fairer and more inclusive?',
    intent: 'The interviewer evaluates advanced knowledge of bias, fairness and measurable improvement in HR.',
    expectedAnswer:
      'I would start by measuring the current situation: at each stage of the process, from applications to offers, compare pass-through rates across groups where data can be collected lawfully and anonymously, to see where differences appear. Then I would act on the steps with the most impact. Job descriptions: remove unnecessary requirements, such as a degree when skills matter more, and use inclusive language. Sourcing: widen channels to reach more diverse candidates. Screening: use clear criteria and, where possible, review applications without names or photos. Interviews: structured questions, scoring guides, diverse interview panels and interviewer training on bias. Decisions: discuss candidates against criteria rather than "fit", and calibrate scores between interviewers. Accessibility: offer adjustments for candidates with disabilities. I would review automated screening tools carefully, because they can reproduce historical bias. Finally, I would track the metrics over time, share them with leadership and adjust, treating inclusion as part of hiring quality rather than a separate initiative.',
    explanation:
      'Fair hiring is built through measurement, structured processes and accountability, not good intentions alone.',
    tips: ['Start with data on each stage.', 'Give concrete changes at each step.', 'Mention risks of automated screening.'],
    commonMistakes: ['Relying only on unconscious bias training.', 'Collecting diversity data without legal and privacy safeguards.'],
    followUpQuestions: ['How would you evaluate an AI screening tool for bias?', 'How do you define "culture fit" without excluding people?'],
  },
};
