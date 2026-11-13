import type { QuizQuestion } from '../types';

/**
 * Logic & Reasoning question bank (100 original questions).
 * Covers sequences, syllogisms, propositional logic, conditionals, fallacies,
 * analogies, ordering puzzles, sets, knights-and-knaves and simple probability.
 */
export const logicQuestions: QuizQuestion[] = [
  // ---------------------------------------------------------------------------
  // Single choice: sequences
  // ---------------------------------------------------------------------------
  {
    id: 'lg-001', type: 'single', difficulty: 1,
    prompt: 'What number comes next? 2, 5, 8, 11, ?',
    options: ['13', '15', '14', '12'], correct: 2,
    explanation: 'Each term is 3 more than the previous one, so 11 + 3 = 14.',
    tags: ['sequences'],
  },
  {
    id: 'lg-002', type: 'single', difficulty: 1,
    prompt: 'What number comes next? 3, 6, 12, 24, ?',
    options: ['48', '36', '30', '42'], correct: 0,
    explanation: 'Each term is double the previous one, so 24 × 2 = 48.',
    tags: ['sequences'],
  },
  {
    id: 'lg-003', type: 'single', difficulty: 1,
    prompt: 'What letter comes next? A, C, E, G, ?',
    options: ['H', 'J', 'K', 'I'], correct: 3,
    explanation: 'The sequence skips one letter each time (A, skip B, C, skip D...). After G, skip H to reach I.',
    tags: ['sequences', 'letters'],
  },
  {
    id: 'lg-004', type: 'single', difficulty: 2,
    prompt: 'What number comes next? 1, 4, 9, 16, 25, ?',
    options: ['30', '36', '49', '35'], correct: 1,
    explanation: 'These are the perfect squares 1², 2², 3², 4², 5². The next is 6² = 36.',
    tags: ['sequences'],
  },
  {
    id: 'lg-005', type: 'single', difficulty: 2,
    prompt: 'What number comes next? 2, 3, 5, 8, 12, 17, ?',
    options: ['21', '22', '23', '24'], correct: 2,
    explanation: 'The differences grow by one each time: +1, +2, +3, +4, +5. The next difference is +6, so 17 + 6 = 23.',
    tags: ['sequences'],
  },
  {
    id: 'lg-006', type: 'single', difficulty: 2,
    prompt: 'Each term is the sum of the two terms before it. What comes next? 2, 2, 4, 6, 10, 16, ?',
    options: ['26', '24', '22', '32'], correct: 0,
    explanation: 'Adding the two previous terms gives 10 + 16 = 26.',
    tags: ['sequences'],
  },
  {
    id: 'lg-007', type: 'single', difficulty: 3,
    prompt: 'What number comes next? 1, 2, 6, 24, 120, ?',
    options: ['240', '600', '840', '720'], correct: 3,
    explanation: 'Each term is multiplied by the next whole number: ×2, ×3, ×4, ×5. The next step is ×6, so 120 × 6 = 720.',
    tags: ['sequences'],
  },
  {
    id: 'lg-008', type: 'single', difficulty: 2,
    prompt: 'What letter comes next? Z, X, V, T, ?',
    options: ['S', 'R', 'Q', 'P'], correct: 1,
    explanation: 'The sequence moves backwards through the alphabet, skipping one letter each time. After T, skip S to reach R.',
    tags: ['sequences', 'letters'],
  },
  {
    id: 'lg-009', type: 'single', difficulty: 2,
    prompt: 'What number comes next? 100, 81, 64, 49, ?',
    options: ['40', '25', '36', '42'], correct: 2,
    explanation: 'These are descending perfect squares: 10², 9², 8², 7². The next is 6² = 36.',
    tags: ['sequences'],
  },
  {
    id: 'lg-010', type: 'single', difficulty: 1,
    prompt: 'What number comes next? 50, 45, 40, 35, ?',
    options: ['30', '25', '32', '28'], correct: 0,
    explanation: 'Each term is 5 less than the previous one, so 35 − 5 = 30.',
    tags: ['sequences'],
  },
  {
    id: 'lg-011', type: 'single', difficulty: 2,
    prompt: 'What comes next? AB, DE, GH, JK, ?',
    options: ['LM', 'NO', 'KL', 'MN'], correct: 3,
    explanation: 'Each pair is two consecutive letters, and one letter is skipped between pairs (C, F, I, L). After JK, skip L to get MN.',
    tags: ['sequences', 'letters'],
  },
  {
    id: 'lg-012', type: 'single', difficulty: 3,
    prompt: 'What number comes next? 2, 6, 7, 21, 22, 66, ?',
    options: ['198', '67', '68', '132'], correct: 1,
    explanation: 'The steps alternate between ×3 and +1: 2×3=6, 6+1=7, 7×3=21, 21+1=22, 22×3=66. The next step is +1, giving 67.',
    tags: ['sequences'],
  },

  // ---------------------------------------------------------------------------
  // Single choice: syllogisms and deduction
  // ---------------------------------------------------------------------------
  {
    id: 'lg-013', type: 'single', difficulty: 1,
    prompt: 'All roses are flowers. All flowers need water. Which conclusion follows?',
    options: ['All plants are roses', 'Some roses do not need water', 'All roses need water', 'Nothing follows'], correct: 2,
    explanation: 'Roses are inside the group of flowers, and every flower needs water, so every rose needs water.',
    tags: ['syllogisms'],
  },
  {
    id: 'lg-014', type: 'single', difficulty: 2,
    prompt: 'All cats are mammals. Some mammals are black. Which conclusion necessarily follows?',
    options: ['None of these necessarily follows', 'Some cats are black', 'All black things are cats', 'No cats are black'], correct: 0,
    explanation: 'The black mammals could all be non-cats (for example, black bears), so nothing about the colour of cats is guaranteed.',
    tags: ['syllogisms'],
  },
  {
    id: 'lg-015', type: 'single', difficulty: 1,
    prompt: 'No fish are birds. A salmon is a fish. Which conclusion follows?',
    options: ['A salmon may be a bird', 'Some birds are salmon', 'All fish are salmon', 'A salmon is not a bird'], correct: 3,
    explanation: 'A salmon belongs to the group of fish, and no fish is a bird, so a salmon is not a bird.',
    tags: ['syllogisms'],
  },
  {
    id: 'lg-016', type: 'single', difficulty: 2,
    prompt: 'Every engineer in the club plays chess. Mia does not play chess. What can you conclude?',
    options: ['Mia is an engineer in the club', 'Mia is not an engineer in the club', 'Mia plays checkers', 'Nothing can be concluded about Mia'], correct: 1,
    explanation: 'If Mia were an engineer in the club she would play chess. Since she does not, she cannot be one.',
    tags: ['syllogisms', 'deduction'],
  },
  {
    id: 'lg-017', type: 'single', difficulty: 2,
    prompt: 'Some teachers are runners. All runners are early risers. Which conclusion follows?',
    options: ['All teachers are early risers', 'No teachers are early risers', 'Some teachers are early risers', 'All early risers are teachers'], correct: 2,
    explanation: 'The teachers who are runners must be early risers, so at least some teachers are early risers.',
    tags: ['syllogisms'],
  },
  {
    id: 'lg-018', type: 'single', difficulty: 3,
    prompt: 'No A are B. All C are B. Which conclusion follows?',
    options: ['No C are A', 'Some C are A', 'All A are C', 'Some A are B'], correct: 0,
    explanation: 'Every C is inside B, and B shares nothing with A. So no C can be an A.',
    tags: ['syllogisms'],
  },

  // ---------------------------------------------------------------------------
  // Single choice: propositional logic and conditionals
  // ---------------------------------------------------------------------------
  {
    id: 'lg-019', type: 'single', difficulty: 1,
    prompt: 'If it rains, the ground gets wet. It is raining. What follows?',
    options: ['The ground is dry', 'It did not rain', 'Nothing follows', 'The ground gets wet'], correct: 3,
    explanation: 'This is modus ponens: from "if P then Q" and P, we conclude Q.',
    tags: ['conditionals'],
  },
  {
    id: 'lg-020', type: 'single', difficulty: 2,
    prompt: 'What is the contrapositive of "If a shape is a square, then it has four sides"?',
    options: ['If it has four sides, it is a square', 'If it does not have four sides, it is not a square', 'If it is not a square, it does not have four sides', 'If it is a square, it does not have four sides'], correct: 1,
    explanation: 'The contrapositive of "if P then Q" is "if not Q then not P": swap the parts and negate both.',
    tags: ['conditionals'],
  },
  {
    id: 'lg-021', type: 'single', difficulty: 2,
    prompt: 'What is the converse of "If P, then Q"?',
    options: ['If not P, then not Q', 'If not Q, then not P', 'If Q, then P', 'P and Q'], correct: 2,
    explanation: 'The converse simply swaps the condition and the result: "if Q then P".',
    tags: ['conditionals'],
  },
  {
    id: 'lg-022', type: 'single', difficulty: 2,
    prompt: 'What is the inverse of "If P, then Q"?',
    options: ['If not P, then not Q', 'If Q, then P', 'If not Q, then not P', 'If P, then not Q'], correct: 0,
    explanation: 'The inverse negates both parts without swapping them: "if not P then not Q".',
    tags: ['conditionals'],
  },
  {
    id: 'lg-023', type: 'single', difficulty: 1,
    prompt: 'When is the statement "P and Q" true?',
    options: ['When at least one of them is true', 'When P is false', 'When exactly one of them is true', 'Only when both P and Q are true'], correct: 3,
    explanation: 'A conjunction ("and") is true only if every part is true.',
    tags: ['propositional'],
  },
  {
    id: 'lg-024', type: 'single', difficulty: 1,
    prompt: 'When is the inclusive statement "P or Q" false?',
    options: ['When exactly one of them is false', 'Only when both are false', 'When both are true', 'Never'], correct: 1,
    explanation: 'An inclusive "or" is true if at least one part is true, so it is false only when both parts are false.',
    tags: ['propositional'],
  },
  {
    id: 'lg-025', type: 'single', difficulty: 3,
    prompt: 'What is the correct negation of "All students passed"?',
    options: ['No students passed', 'All students failed', 'At least one student did not pass', 'Some students passed'], correct: 2,
    explanation: 'To make "all passed" false, you only need one counterexample: at least one student who did not pass.',
    tags: ['propositional', 'negation'],
  },
  {
    id: 'lg-026', type: 'single', difficulty: 3,
    prompt: 'The statement "If P, then Q" is false in exactly which case?',
    options: ['P is true and Q is false', 'P is false and Q is true', 'P and Q are both false', 'P and Q are both true'], correct: 0,
    explanation: 'A conditional only breaks its promise when the condition holds (P true) but the result does not (Q false).',
    tags: ['conditionals'],
  },
  {
    id: 'lg-027', type: 'single', difficulty: 3,
    prompt: 'Which statement is the negation of "It is cold and windy"?',
    options: ['It is not cold and not windy', 'It is cold or windy', 'It is warm and calm', 'It is not cold or it is not windy'], correct: 3,
    explanation: 'By De Morgan\'s law, not (P and Q) equals (not P) or (not Q). It is enough for one of the two to fail.',
    tags: ['propositional', 'negation'],
  },
  {
    id: 'lg-028', type: 'single', difficulty: 2,
    prompt: 'If the alarm sounds, Lea wakes up. Lea did not wake up. What follows?',
    options: ['The alarm sounded', 'The alarm did not sound', 'Lea was sick', 'Nothing follows'], correct: 1,
    explanation: 'This is modus tollens: from "if P then Q" and not Q, we conclude not P.',
    tags: ['conditionals'],
  },
  {
    id: 'lg-029', type: 'single', difficulty: 3,
    prompt: 'If the store is open, its lights are on. The lights are on. What follows?',
    options: ['The store is open', 'The store is closed', 'Nothing follows about whether the store is open', 'The lights are off'], correct: 2,
    explanation: 'The lights could be on for another reason (cleaning, security). Concluding the store is open would be affirming the consequent.',
    tags: ['conditionals', 'fallacies'],
  },

  // ---------------------------------------------------------------------------
  // Single choice: logical fallacies
  // ---------------------------------------------------------------------------
  {
    id: 'lg-030', type: 'single', difficulty: 1,
    prompt: '"You can\'t trust Sam\'s argument about taxes; he failed math in school." Which fallacy is this?',
    options: ['Ad hominem', 'Straw man', 'False dilemma', 'Slippery slope'], correct: 0,
    explanation: 'It attacks Sam personally instead of addressing his argument, which is an ad hominem.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-031', type: 'single', difficulty: 1,
    prompt: '"Either you support this plan, or you want the city to fail." Which fallacy is this?',
    options: ['Red herring', 'Circular reasoning', 'Ad hominem', 'False dilemma'], correct: 3,
    explanation: 'It presents only two options when many others exist, which is a false dilemma.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-032', type: 'single', difficulty: 1,
    prompt: '"If we allow phones in class, soon students will stop coming to school at all." Which fallacy is this?',
    options: ['Appeal to authority', 'Slippery slope', 'Hasty generalization', 'Tu quoque'], correct: 1,
    explanation: 'It claims a small step will inevitably lead to an extreme outcome without evidence, which is a slippery slope.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-033', type: 'single', difficulty: 2,
    prompt: '"I met two rude tourists from that town, so everyone from there is rude." Which fallacy is this?',
    options: ['Straw man', 'Begging the question', 'Hasty generalization', 'False cause'], correct: 2,
    explanation: 'It draws a conclusion about a whole population from a tiny sample, which is a hasty generalization.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-034', type: 'single', difficulty: 2,
    prompt: '"I wore my lucky socks and our team won, so the socks caused the win." Which fallacy is this?',
    options: ['Post hoc (false cause)', 'Bandwagon', 'Ad hominem', 'Equivocation'], correct: 0,
    explanation: 'It assumes that because one event came before another, it caused it. That is the post hoc fallacy.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-035', type: 'single', difficulty: 1,
    prompt: '"Millions of people buy this brand, so it must be the best." Which fallacy is this?',
    options: ['Straw man', 'Slippery slope', 'Red herring', 'Appeal to popularity (bandwagon)'], correct: 3,
    explanation: 'Popularity alone does not prove quality; arguing that it does is the bandwagon fallacy.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-036', type: 'single', difficulty: 3,
    prompt: '"This guidebook is reliable because the guidebook itself says it is reliable." Which fallacy is this?',
    options: ['False dilemma', 'Circular reasoning', 'Appeal to pity', 'Composition'], correct: 1,
    explanation: 'The conclusion is used as its own evidence, so the argument goes in a circle.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-037', type: 'single', difficulty: 2,
    prompt: 'Alex: "Kids should have less screen time." Jo: "So you want to ban all technology?" Which fallacy does Jo commit?',
    options: ['Ad hominem', 'Bandwagon', 'Straw man', 'Post hoc'], correct: 2,
    explanation: 'Jo distorts Alex\'s position into a more extreme one that is easier to attack, which is a straw man.',
    tags: ['fallacies'],
  },

  // ---------------------------------------------------------------------------
  // Single choice: analogies
  // ---------------------------------------------------------------------------
  {
    id: 'lg-038', type: 'single', difficulty: 1,
    prompt: 'Bird is to nest as bee is to ___.',
    options: ['hive', 'honey', 'flower', 'sting'], correct: 0,
    explanation: 'The relationship is animal to its home: a bird lives in a nest and a bee lives in a hive.',
    tags: ['analogies'],
  },
  {
    id: 'lg-039', type: 'single', difficulty: 1,
    prompt: 'Hot is to cold as tall is to ___.',
    options: ['high', 'big', 'long', 'short'], correct: 3,
    explanation: 'The relationship is opposites: the opposite of hot is cold, and the opposite of tall is short.',
    tags: ['analogies'],
  },
  {
    id: 'lg-040', type: 'single', difficulty: 1,
    prompt: 'Author is to book as composer is to ___.',
    options: ['piano', 'symphony', 'orchestra', 'concert hall'], correct: 1,
    explanation: 'The relationship is creator to creation: an author writes a book and a composer writes a symphony.',
    tags: ['analogies'],
  },
  {
    id: 'lg-041', type: 'single', difficulty: 2,
    prompt: 'Finger is to hand as toe is to ___.',
    options: ['leg', 'shoe', 'foot', 'nail'], correct: 2,
    explanation: 'The relationship is part to whole: a finger is part of a hand and a toe is part of a foot.',
    tags: ['analogies'],
  },
  {
    id: 'lg-042', type: 'single', difficulty: 2,
    prompt: 'Thermometer is to temperature as scale is to ___.',
    options: ['weight', 'kitchen', 'balance', 'size'], correct: 0,
    explanation: 'The relationship is instrument to what it measures: a thermometer measures temperature and a scale measures weight.',
    tags: ['analogies'],
  },
  {
    id: 'lg-043', type: 'single', difficulty: 1,
    prompt: 'Puppy is to dog as kitten is to ___.',
    options: ['mouse', 'litter', 'fur', 'cat'], correct: 3,
    explanation: 'The relationship is young animal to adult: a puppy grows into a dog and a kitten grows into a cat.',
    tags: ['analogies'],
  },

  // ---------------------------------------------------------------------------
  // Single choice: ordering and seating puzzles
  // ---------------------------------------------------------------------------
  {
    id: 'lg-044', type: 'single', difficulty: 1,
    prompt: 'Ana is taller than Ben. Ben is taller than Cy. Who is the shortest?',
    options: ['Ana', 'Cy', 'Ben', 'It cannot be determined'], correct: 1,
    explanation: 'The order from tallest to shortest is Ana, Ben, Cy, so Cy is the shortest.',
    tags: ['ordering'],
  },
  {
    id: 'lg-045', type: 'single', difficulty: 2,
    prompt: 'Four runners finish a race with no ties. Dana finished ahead of Eli but behind Finn. Gus finished last. Who finished second?',
    options: ['Finn', 'Eli', 'Dana', 'Gus'], correct: 2,
    explanation: 'Gus is 4th, and Finn is ahead of Dana who is ahead of Eli, so the order is Finn, Dana, Eli, Gus. Dana is second.',
    tags: ['ordering'],
  },
  {
    id: 'lg-046', type: 'single', difficulty: 2,
    prompt: 'Five books stand in a row: red, blue, green, yellow, white. Red is in the middle, blue is just left of red, green is at the far right, and yellow is not at the far left. Where is white?',
    options: ['Far left', 'Second from the left', 'Second from the right', 'Far right'], correct: 0,
    explanation: 'Red is 3rd, blue 2nd and green 5th, leaving positions 1 and 4. Yellow cannot be 1st, so yellow is 4th and white is at the far left.',
    tags: ['ordering'],
  },
  {
    id: 'lg-047', type: 'single', difficulty: 3,
    prompt: 'Kim, Leo, Max and Nia sit in a row of four seats. Kim sits at one end, Leo sits next to Kim, and Max does not sit next to Leo. Who sits next to Nia?',
    options: ['Kim and Leo', 'Kim and Max', 'Leo only', 'Leo and Max'], correct: 3,
    explanation: 'With Kim in seat 1 and Leo in seat 2, Max cannot take seat 3, so Max is in seat 4 and Nia in seat 3. Nia sits between Leo and Max (the mirror arrangement gives the same result).',
    tags: ['ordering', 'seating'],
  },
  {
    id: 'lg-048', type: 'single', difficulty: 1,
    prompt: 'Paul is older than Rita, Rita is older than Sara, and Tom is older than Paul. Who is the second oldest?',
    options: ['Tom', 'Paul', 'Rita', 'Sara'], correct: 1,
    explanation: 'From oldest to youngest the order is Tom, Paul, Rita, Sara, so Paul is second oldest.',
    tags: ['ordering'],
  },
  {
    id: 'lg-049', type: 'single', difficulty: 3,
    prompt: 'Five houses in a row are numbered 1 to 5. Red is house 1 and white is house 4. Green is immediately left of blue, and yellow is not next to red. Which house is blue?',
    options: ['House 2', 'House 5', 'House 3', 'House 4'], correct: 2,
    explanation: 'Houses 2, 3 and 5 remain. The only two adjacent free houses are 2 and 3, so green is 2 and blue is 3, leaving yellow in house 5 (not next to red).',
    tags: ['ordering'],
  },

  // ---------------------------------------------------------------------------
  // Single choice: set reasoning
  // ---------------------------------------------------------------------------
  {
    id: 'lg-050', type: 'single', difficulty: 1,
    prompt: 'In a class of 30, 18 students play soccer and 15 play tennis. Every student plays at least one of them. How many play both?',
    options: ['3', '33', '12', '15'], correct: 0,
    explanation: 'Adding 18 + 15 = 33 counts the students who play both twice. Since there are only 30 students, 33 − 30 = 3 play both.',
    tags: ['sets'],
  },
  {
    id: 'lg-051', type: 'single', difficulty: 2,
    prompt: 'Of 40 people, 25 like tea, 20 like coffee and 10 like both. How many like neither?',
    options: ['15', '0', '10', '5'], correct: 3,
    explanation: 'People who like at least one drink: 25 + 20 − 10 = 35. So 40 − 35 = 5 like neither.',
    tags: ['sets'],
  },
  {
    id: 'lg-052', type: 'single', difficulty: 2,
    prompt: 'A = {1, 2, 3, 4} and B = {3, 4, 5}. What is the intersection of A and B (the elements in both)?',
    options: ['{1, 2, 3, 4, 5}', '{3, 4}', '{1, 2}', '{5}'], correct: 1,
    explanation: 'Only 3 and 4 appear in both sets, so the intersection is {3, 4}.',
    tags: ['sets'],
  },
  {
    id: 'lg-053', type: 'single', difficulty: 1,
    prompt: 'A = {a, b, c} and B = {b, c, d, e}. How many distinct elements are in the union of A and B?',
    options: ['7', '4', '5', '2'], correct: 2,
    explanation: 'The union is {a, b, c, d, e}. Shared elements b and c are counted only once, giving 5.',
    tags: ['sets'],
  },

  // ---------------------------------------------------------------------------
  // Single choice: truth-tellers and liars
  // ---------------------------------------------------------------------------
  {
    id: 'lg-054', type: 'single', difficulty: 3,
    prompt: 'Knights always tell the truth; knaves always lie. Ari says, "Bo is a knave." Bo says, "Ari and I are the same type." What are they?',
    options: ['Ari is a knight, Bo is a knave', 'Both are knights', 'Both are knaves', 'Ari is a knave, Bo is a knight'], correct: 0,
    explanation: 'If Ari were a knave, Bo would be a knight telling the truth, making them the same type, which is a contradiction. So Ari is a knight, Bo is a knave, and Bo\'s claim is indeed false.',
    tags: ['knights', 'deduction'],
  },
  {
    id: 'lg-055', type: 'single', difficulty: 3,
    prompt: 'Knights always tell the truth; knaves always lie. Cal says, "At least one of Dee and me is a knave." What are Cal and Dee?',
    options: ['Both are knights', 'Both are knaves', 'Cal is a knave, Dee is a knight', 'Cal is a knight, Dee is a knave'], correct: 3,
    explanation: 'If Cal were a knave, his statement would be true (he is a knave), which is impossible. So Cal is a knight, his statement is true, and Dee must be the knave.',
    tags: ['knights', 'deduction'],
  },
  {
    id: 'lg-056', type: 'single', difficulty: 2,
    prompt: 'Knights always tell the truth; knaves always lie. If you ask any islander, "Are you a knight?", what will they answer?',
    options: ['No', 'Yes', 'It depends on the person', 'They cannot answer'], correct: 1,
    explanation: 'A knight truthfully says yes, and a knave lies and also says yes. So everyone answers yes.',
    tags: ['knights'],
  },

  // ---------------------------------------------------------------------------
  // Single choice: probability reasoning
  // ---------------------------------------------------------------------------
  {
    id: 'lg-057', type: 'single', difficulty: 1,
    prompt: 'A fair coin is flipped twice. What is the probability that both flips are heads?',
    options: ['1/2', '1/3', '1/4', '3/4'], correct: 2,
    explanation: 'There are four equally likely outcomes (HH, HT, TH, TT) and only one is HH, so the probability is 1/4.',
    tags: ['probability'],
  },
  {
    id: 'lg-058', type: 'single', difficulty: 1,
    prompt: 'A fair six-sided die is rolled once. What is the probability of rolling a number greater than 4?',
    options: ['1/3', '1/2', '2/3', '1/6'], correct: 0,
    explanation: 'Only 5 and 6 are greater than 4, which is 2 out of 6 outcomes, or 1/3.',
    tags: ['probability'],
  },
  {
    id: 'lg-059', type: 'single', difficulty: 2,
    prompt: 'A bag holds 3 red marbles and 2 blue marbles. One marble is drawn at random. What is the probability it is blue?',
    options: ['2/3', '1/2', '3/5', '2/5'], correct: 3,
    explanation: 'There are 5 marbles in total and 2 are blue, so the probability is 2/5.',
    tags: ['probability'],
  },
  {
    id: 'lg-060', type: 'single', difficulty: 2,
    prompt: 'A fair coin has just landed heads 5 times in a row. What is the probability that the next flip is heads?',
    options: ['Less than 1/2', '1/2', 'More than 1/2', '1/32'], correct: 1,
    explanation: 'Each flip of a fair coin is independent, so past results do not change the next one: it is still 1/2. Believing otherwise is the gambler\'s fallacy.',
    tags: ['probability', 'fallacies'],
  },

  // ---------------------------------------------------------------------------
  // Multiple choice (select all that apply)
  // ---------------------------------------------------------------------------
  {
    id: 'lg-061', type: 'multiple', difficulty: 1,
    prompt: 'Which of these numbers are prime? Select all that apply.',
    options: ['2', '9', '11', '15', '17'], correct: [0, 2, 4],
    explanation: '2, 11 and 17 have no divisors other than 1 and themselves. 9 = 3 × 3 and 15 = 3 × 5 are not prime.',
    tags: ['numbers'],
  },
  {
    id: 'lg-062', type: 'multiple', difficulty: 3,
    prompt: 'Which statements are logically equivalent to "If it is a dog, then it is an animal"? Select all that apply.',
    options: ['If it is not an animal, then it is not a dog', 'If it is an animal, then it is a dog', 'It is not a dog, or it is an animal', 'If it is not a dog, then it is not an animal'], correct: [0, 2],
    explanation: 'A conditional is equivalent to its contrapositive and to "not P or Q". The converse and inverse are not equivalent to it.',
    tags: ['conditionals'],
  },
  {
    id: 'lg-063', type: 'multiple', difficulty: 1,
    prompt: 'Which of these are logical fallacies? Select all that apply.',
    options: ['Ad hominem', 'Modus ponens', 'Straw man', 'Slippery slope', 'Modus tollens'], correct: [0, 2, 3],
    explanation: 'Ad hominem, straw man and slippery slope are flawed arguments. Modus ponens and modus tollens are valid rules of inference.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-064', type: 'multiple', difficulty: 2,
    prompt: 'All squares are rectangles, and all rectangles are quadrilaterals. Which statements must be true? Select all that apply.',
    options: ['All squares are quadrilaterals', 'Some quadrilaterals are squares', 'All quadrilaterals are rectangles', 'Some rectangles are not quadrilaterals'], correct: [0, 1],
    explanation: 'Squares sit inside rectangles, which sit inside quadrilaterals, so every square is a quadrilateral and some quadrilaterals are squares. The other two reverse or contradict the premises.',
    tags: ['syllogisms'],
  },
  {
    id: 'lg-065', type: 'multiple', difficulty: 2,
    prompt: 'Which numbers are multiples of 4 that are greater than 10? Select all that apply.',
    options: ['8', '12', '16', '18', '20'], correct: [1, 2, 4],
    explanation: 'Both conditions must hold. 12, 16 and 20 qualify; 8 is not greater than 10 and 18 is not a multiple of 4.',
    tags: ['sets', 'numbers'],
  },
  {
    id: 'lg-066', type: 'multiple', difficulty: 1,
    prompt: 'A = {2, 4, 6, 8, 10, 12} and B = {3, 6, 9, 12}. Which numbers belong to both A and B? Select all that apply.',
    options: ['3', '6', '8', '12', '9'], correct: [1, 3],
    explanation: 'Only 6 and 12 appear in both lists, so they form the intersection.',
    tags: ['sets'],
  },
  {
    id: 'lg-067', type: 'multiple', difficulty: 2,
    prompt: 'In a club, every musician is a singer, and no singer is shy. Which statements must be true for this club? Select all that apply.',
    options: ['No musician is shy', 'Every singer is a musician', 'No shy person is a musician', 'Some shy people are singers'], correct: [0, 2],
    explanation: 'Musicians are all singers and singers are never shy, so no musician is shy, which also means no shy person is a musician. The other two do not follow or contradict the premises.',
    tags: ['syllogisms'],
  },
  {
    id: 'lg-068', type: 'multiple', difficulty: 2,
    prompt: 'A fair six-sided die is rolled once. Which events have a probability of exactly 1/2? Select all that apply.',
    options: ['Rolling an even number', 'Rolling a number less than 4', 'Rolling a 6', 'Rolling a prime number', 'Rolling a number greater than 4'], correct: [0, 1, 3],
    explanation: 'Even (2, 4, 6), less than 4 (1, 2, 3) and prime (2, 3, 5) each cover 3 of 6 outcomes. Rolling a 6 is 1/6 and greater than 4 is 2/6.',
    tags: ['probability'],
  },
  {
    id: 'lg-069', type: 'multiple', difficulty: 3,
    prompt: 'Suppose P is true and Q is false. Which statements are true? Select all that apply.',
    options: ['P or Q', 'P and Q', 'If P, then Q', 'If Q, then P', 'Not Q'], correct: [0, 3, 4],
    explanation: '"P or Q" is true because P is true. "If Q then P" is true because its condition Q is false. "Not Q" is true. "P and Q" and "If P then Q" are false.',
    tags: ['propositional'],
  },
  {
    id: 'lg-070', type: 'multiple', difficulty: 1,
    prompt: 'Which pairs of words are opposites? Select all that apply.',
    options: ['Up : Down', 'Fast : Slow', 'Bright : Shiny', 'Early : Late'], correct: [0, 1, 3],
    explanation: 'Up/down, fast/slow and early/late are antonyms. Bright and shiny have similar meanings.',
    tags: ['analogies'],
  },

  // ---------------------------------------------------------------------------
  // True / false
  // ---------------------------------------------------------------------------
  {
    id: 'lg-071', type: 'true_false', difficulty: 1,
    prompt: 'The contrapositive of a true conditional statement is always true.',
    correct: true,
    explanation: '"If P then Q" and "if not Q then not P" are logically equivalent, so they are always true or false together.',
    tags: ['conditionals'],
  },
  {
    id: 'lg-072', type: 'true_false', difficulty: 1,
    prompt: 'If "All A are B" is true, then "All B are A" must also be true.',
    correct: false,
    explanation: 'All dogs are animals, but not all animals are dogs. Reversing an "all" statement is not valid.',
    tags: ['syllogisms'],
  },
  {
    id: 'lg-073', type: 'true_false', difficulty: 1,
    prompt: 'In the sequence 5, 10, 20, 40, where each term doubles, the next term is 80.',
    correct: true,
    explanation: 'Doubling 40 gives 80.',
    tags: ['sequences'],
  },
  {
    id: 'lg-074', type: 'true_false', difficulty: 2,
    prompt: 'The inclusive statement "P or Q" is true when both P and Q are true.',
    correct: true,
    explanation: 'An inclusive "or" only requires at least one part to be true, so it is also true when both are.',
    tags: ['propositional'],
  },
  {
    id: 'lg-075', type: 'true_false', difficulty: 2,
    prompt: 'If "All birds have feathers" is true, then "Anything without feathers is not a bird" is also true.',
    correct: true,
    explanation: 'The second statement is the contrapositive of the first ("if bird then feathers" becomes "if no feathers then not a bird"), so it is equivalent.',
    tags: ['conditionals'],
  },
  {
    id: 'lg-076', type: 'true_false', difficulty: 1,
    prompt: 'Attacking the person who makes an argument, instead of the argument itself, is called a straw man fallacy.',
    correct: false,
    explanation: 'That is an ad hominem. A straw man misrepresents the opponent\'s argument to make it easier to attack.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-077', type: 'true_false', difficulty: 2,
    prompt: 'The negation of "Every door is locked" is "No door is locked".',
    correct: false,
    explanation: 'The negation is "At least one door is not locked". "No door is locked" is a much stronger claim.',
    tags: ['negation'],
  },
  {
    id: 'lg-078', type: 'true_false', difficulty: 3,
    prompt: 'If "If P, then Q" is true and P is false, then Q must be false.',
    correct: false,
    explanation: 'When the condition P is false, the conditional says nothing about Q; Q may be true or false. Assuming otherwise is denying the antecedent.',
    tags: ['conditionals'],
  },
  {
    id: 'lg-079', type: 'true_false', difficulty: 2,
    prompt: 'All the coins in a jar are silver. This coin is silver. Therefore, this coin must have come from the jar.',
    correct: false,
    explanation: 'Silver coins can exist outside the jar too. Being silver is necessary for jar coins, not proof of coming from the jar.',
    tags: ['deduction', 'fallacies'],
  },
  {
    id: 'lg-080', type: 'true_false', difficulty: 1,
    prompt: 'If Amy is older than Ben and Ben is older than Carl, then Amy is older than Carl.',
    correct: true,
    explanation: '"Older than" is transitive: Amy > Ben > Carl means Amy > Carl.',
    tags: ['ordering'],
  },
  {
    id: 'lg-081', type: 'true_false', difficulty: 2,
    prompt: 'On an island where knights always tell the truth and knaves always lie, no islander can ever say "I am a knave".',
    correct: true,
    explanation: 'A knight saying it would be lying, and a knave saying it would be telling the truth. Both are impossible.',
    tags: ['knights'],
  },
  {
    id: 'lg-082', type: 'true_false', difficulty: 3,
    prompt: '"Not (P and Q)" is logically equivalent to "Not P and not Q".',
    correct: false,
    explanation: 'By De Morgan\'s law, "not (P and Q)" equals "not P OR not Q". If P is true and Q is false, the first is true but "not P and not Q" is false.',
    tags: ['propositional'],
  },
  {
    id: 'lg-083', type: 'true_false', difficulty: 1,
    prompt: 'If two things are correlated, that alone proves that one causes the other.',
    correct: false,
    explanation: 'Correlation does not prove causation; both could be caused by a third factor or linked by coincidence.',
    tags: ['critical', 'thinking'],
  },
  {
    id: 'lg-084', type: 'true_false', difficulty: 2,
    prompt: 'If no reptiles are mammals and all snakes are reptiles, then no snakes are mammals.',
    correct: true,
    explanation: 'Every snake is a reptile, and reptiles share no members with mammals, so no snake can be a mammal.',
    tags: ['syllogisms'],
  },
  {
    id: 'lg-085', type: 'true_false', difficulty: 3,
    prompt: 'When two fair six-sided dice are rolled, a total of 7 is more likely than a total of 2.',
    correct: true,
    explanation: 'Six of the 36 outcomes give 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1), but only one (1+1) gives 2.',
    tags: ['probability'],
  },

  // ---------------------------------------------------------------------------
  // Short answer
  // ---------------------------------------------------------------------------
  {
    id: 'lg-086', type: 'short_answer', difficulty: 1,
    prompt: 'What number comes next? 7, 14, 21, 28, ?',
    accepted: ['35'],
    explanation: 'Each term adds 7 (multiples of 7), so 28 + 7 = 35.',
    tags: ['sequences'],
  },
  {
    id: 'lg-087', type: 'short_answer', difficulty: 1,
    prompt: 'What letter comes next? B, D, F, H, ?',
    accepted: ['J'],
    explanation: 'The sequence skips one letter each time (B, skip C, D, skip E...). After H, skip I to reach J.',
    tags: ['sequences', 'letters'],
  },
  {
    id: 'lg-088', type: 'short_answer', difficulty: 2,
    prompt: 'What number comes next? 1, 3, 7, 15, 31, ?',
    accepted: ['63'],
    explanation: 'Each term is double the previous one plus 1: 31 × 2 + 1 = 63.',
    tags: ['sequences'],
  },
  {
    id: 'lg-089', type: 'short_answer', difficulty: 1,
    prompt: 'What number comes next? 81, 27, 9, 3, ?',
    accepted: ['1'],
    explanation: 'Each term is divided by 3, so 3 ÷ 3 = 1.',
    tags: ['sequences'],
  },
  {
    id: 'lg-090', type: 'short_answer', difficulty: 2,
    prompt: 'What letter comes next? A, D, H, M, ?',
    accepted: ['S'],
    explanation: 'The gaps grow by one: A +3 = D, D +4 = H, H +5 = M. Next is M +6 = S.',
    tags: ['sequences', 'letters'],
  },
  {
    id: 'lg-091', type: 'short_answer', difficulty: 2,
    prompt: 'These are consecutive prime numbers. What comes next? 2, 3, 5, 7, 11, 13, ?',
    accepted: ['17'],
    explanation: 'The next prime after 13 is 17 (14, 15 and 16 are not prime).',
    tags: ['sequences'],
  },
  {
    id: 'lg-092', type: 'short_answer', difficulty: 2,
    prompt: 'In a group of 25, 14 like art, 12 like music and 4 like neither. How many like both art and music?',
    accepted: ['5', 'five'],
    explanation: 'People who like at least one: 25 − 4 = 21. Then 14 + 12 − 21 = 5 like both.',
    tags: ['sets'],
  },
  {
    id: 'lg-093', type: 'short_answer', difficulty: 3,
    prompt: 'Knights always tell the truth; knaves always lie. Each of three islanders says, "Exactly one of us three is a knight." How many of them are knights?',
    accepted: ['0', 'zero', 'none'],
    explanation: 'If exactly one were a knight, the two knaves would be telling the truth, which is impossible; two or three knights would make the knights lie. With zero knights all three lie, which is consistent.',
    tags: ['knights', 'deduction'],
  },
  {
    id: 'lg-094', type: 'short_answer', difficulty: 1,
    prompt: 'If today is Wednesday, what day of the week will it be 10 days from now?',
    accepted: ['Saturday', 'Sat'],
    explanation: 'Ten days is one full week plus 3 days. Three days after Wednesday is Saturday.',
    tags: ['reasoning'],
  },
  {
    id: 'lg-095', type: 'short_answer', difficulty: 3,
    prompt: 'What number comes next? 2, 6, 12, 20, 30, ?',
    accepted: ['42'],
    explanation: 'The differences are +4, +6, +8, +10, increasing by 2, so the next is +12: 30 + 12 = 42. (Each term is n × (n + 1).)',
    tags: ['sequences'],
  },

  // ---------------------------------------------------------------------------
  // Matching
  // ---------------------------------------------------------------------------
  {
    id: 'lg-096', type: 'matching', difficulty: 1,
    prompt: 'Match each fallacy with its example.',
    pairs: [
      { left: 'Ad hominem', right: '"Ignore his plan; he has never been good at anything."' },
      { left: 'False dilemma', right: '"We either cut all funding or go bankrupt."' },
      { left: 'Slippery slope', right: '"One late homework will lead to dropping out."' },
      { left: 'Bandwagon', right: '"Everyone is buying it, so it must be good."' },
    ],
    explanation: 'Ad hominem attacks the person, a false dilemma offers only two options, a slippery slope predicts an extreme chain of events, and bandwagon appeals to popularity.',
    tags: ['fallacies'],
  },
  {
    id: 'lg-097', type: 'matching', difficulty: 2,
    prompt: 'For the statement "If P, then Q", match each name with its form.',
    pairs: [
      { left: 'Converse', right: 'If Q, then P' },
      { left: 'Inverse', right: 'If not P, then not Q' },
      { left: 'Contrapositive', right: 'If not Q, then not P' },
    ],
    explanation: 'The converse swaps the parts, the inverse negates both, and the contrapositive does both. Only the contrapositive is equivalent to the original.',
    tags: ['conditionals'],
  },
  {
    id: 'lg-098', type: 'matching', difficulty: 1,
    prompt: 'Match each sequence with its next term.',
    pairs: [
      { left: '2, 4, 6, 8', right: '10' },
      { left: '1, 2, 4, 8', right: '16' },
      { left: '1, 4, 9, 16', right: '25' },
      { left: '10, 7, 4, 1', right: '-2' },
    ],
    explanation: 'The rules are: add 2; double; perfect squares (5² = 25); subtract 3 (1 − 3 = −2).',
    tags: ['sequences'],
  },
  {
    id: 'lg-099', type: 'matching', difficulty: 2,
    prompt: 'Match each logical connective with its meaning.',
    pairs: [
      { left: 'Conjunction', right: 'P and Q' },
      { left: 'Disjunction', right: 'P or Q' },
      { left: 'Negation', right: 'Not P' },
      { left: 'Implication', right: 'If P, then Q' },
    ],
    explanation: 'Conjunction joins with "and", disjunction with "or", negation reverses a truth value, and implication expresses "if... then".',
    tags: ['propositional'],
  },
  {
    id: 'lg-100', type: 'matching', difficulty: 3,
    prompt: 'Match each argument form with its name.',
    pairs: [
      { left: 'If P then Q; P; so Q', right: 'Modus ponens' },
      { left: 'If P then Q; not Q; so not P', right: 'Modus tollens' },
      { left: 'If P then Q; Q; so P', right: 'Affirming the consequent' },
      { left: 'If P then Q; not P; so not Q', right: 'Denying the antecedent' },
    ],
    explanation: 'Modus ponens and modus tollens are valid. Affirming the consequent and denying the antecedent are invalid forms that look similar.',
    tags: ['conditionals', 'fallacies'],
  },
];
