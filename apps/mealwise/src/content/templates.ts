import type { MealSlot, TemplateEntry } from '@/domain/types';

/**
 * Built-in weekly meal templates (names and descriptions are in the i18n files
 * under `templates.builtin.<id>`). Applying one copies its meals into a week;
 * the user can then change anything. Free templates only use free recipes.
 */
export interface BuiltinTemplate {
  id: string;
  icon: string;
  premium: boolean;
  entries: TemplateEntry[];
}

/** Compact week builder: one row per day, [breakfast, lunch, dinner] (null = leave empty). */
function week(rows: [string | null, string | null, string | null][], snacks: Record<number, string> = {}): TemplateEntry[] {
  const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner'];
  const out: TemplateEntry[] = [];
  rows.forEach((row, dayOffset) => {
    row.forEach((recipeId, i) => {
      if (recipeId) out.push({ dayOffset, slot: slots[i] as MealSlot, recipeId });
    });
    const snack = snacks[dayOffset];
    if (snack) out.push({ dayOffset, slot: 'snack', recipeId: snack });
  });
  return out;
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: 'family',
    icon: 'people',
    premium: false,
    entries: week(
      [
        ['bf-banana-oat-pancakes', 'lu-black-bean-quesadillas', 'di-spaghetti-meatballs'],
        ['bf-overnight-oats', 'lu-ham-cheddar-toastie', 'di-chicken-pasta-bake'],
        [null, 'lu-veggie-egg-fried-rice', 'di-beef-tacos'],
        ['bf-cinnamon-french-toast', 'lu-chicken-noodle-soup', 'di-lemon-herb-chicken'],
        [null, 'lu-pesto-pasta-peas', 'di-classic-beef-burgers'],
        ['bf-banana-oat-pancakes', null, 'di-sausage-bean-casserole'],
        [null, 'lu-minestrone', 'di-chicken-coconut-curry'],
      ],
      { 2: 'sn-apple-nachos', 5: 'sn-peanut-energy-bites' },
    ),
  },
  {
    id: 'budget',
    icon: 'wallet',
    premium: false,
    entries: week([
      ['bf-overnight-oats', 'lu-red-lentil-soup', 'vg-red-lentil-dal'],
      [null, 'lu-red-lentil-soup', 'di-beef-bean-chili'],
      ['bf-overnight-oats', 'lu-smashed-chickpea-wrap', 'di-beef-bean-chili'],
      [null, 'lu-moroccan-couscous-salad', 'vg-chickpea-curry'],
      ['bf-overnight-oats', 'lu-moroccan-couscous-salad', 'di-sausage-bean-casserole'],
      [null, 'lu-veggie-egg-fried-rice', 'vg-veggie-chili'],
      ['bf-banana-oat-pancakes', 'lu-minestrone', 'vg-greek-baked-beans'],
    ]),
  },
  {
    id: 'quick',
    icon: 'flash',
    premium: false,
    entries: week([
      ['bf-smashed-avocado-toast', 'lu-greek-salad-pita', 'di-chicken-broccoli-stir-fry'],
      [null, 'lu-tuna-white-bean-salad', 'di-garlic-shrimp-spaghetti'],
      ['bf-green-smoothie', 'lu-herby-tabbouleh', 'di-beef-broccoli'],
      [null, 'lu-caprese-baguette', 'di-chicken-fajitas'],
      ['bf-spinach-feta-omelette', 'lu-peanut-noodle-salad', 'vg-broccoli-garlic-spaghetti'],
      [null, 'lu-black-bean-quesadillas', 'di-turkey-lettuce-wraps'],
      ['bf-tofu-scramble', 'lu-pesto-pasta-peas', 'vg-pesto-pea-pasta'],
    ]),
  },
  {
    id: 'vegetarian',
    icon: 'leaf',
    premium: false,
    entries: week(
      [
        ['bf-overnight-oats', 'lu-greek-salad-pita', 'vg-chickpea-curry'],
        ['bf-shakshuka', 'lu-red-lentil-soup', 'vg-red-lentil-dal'],
        [null, 'lu-smashed-chickpea-wrap', 'vg-cauliflower-gratin'],
        ['bf-tofu-scramble', 'lu-spinach-feta-frittata', 'vg-veggie-chili'],
        [null, 'lu-herby-tabbouleh', 'vg-tofu-stir-fry'],
        ['bf-banana-oat-pancakes', 'lu-minestrone', 'vg-black-bean-burgers'],
        [null, 'lu-warm-lentil-goat-cheese-salad', 'vg-shakshuka'],
      ],
      { 1: 'sn-hummus', 4: 'sn-roasted-chickpeas' },
    ),
  },
  {
    id: 'high_protein',
    icon: 'barbell',
    premium: true,
    entries: week([
      ['bf-spinach-feta-omelette', 'lu-tuna-white-bean-salad', 'di-chicken-souvlaki-pitas'],
      ['bf-ham-cheese-egg-muffins', 'lu-turkey-taco-bowl', 'di-salmon-asparagus-tray'],
      ['bf-tofu-scramble', 'lu-salmon-rice-bowl', 'di-beef-broccoli'],
      ['bf-spinach-feta-omelette', 'lu-chicken-caesar-wrap', 'di-turkey-meatballs-zucchini'],
      ['bf-ham-cheese-egg-muffins', 'lu-spiced-chickpea-pita', 'di-honey-soy-salmon'],
      ['bf-turkish-eggs', 'lu-shrimp-avocado-salad', 'di-lamb-kofta-yogurt'],
      ['bf-shakshuka', 'lu-sticky-tofu-broccoli-bowl', 'di-greek-chicken-feta-bake'],
    ]),
  },
  {
    id: 'student',
    icon: 'school',
    premium: false,
    entries: week([
      ['bf-overnight-oats', 'lu-smashed-chickpea-wrap', 'vg-pesto-pea-pasta'],
      [null, 'lu-pesto-pasta-peas', 'lu-veggie-egg-fried-rice'],
      ['bf-banana-oat-pancakes', 'lu-ham-cheddar-toastie', 'vg-red-lentil-dal'],
      [null, 'lu-black-bean-quesadillas', 'di-beef-bean-chili'],
      ['bf-overnight-oats', 'lu-red-lentil-soup', 'vg-broccoli-garlic-spaghetti'],
      [null, 'lu-moroccan-couscous-salad', 'di-sausage-bean-casserole'],
      [null, 'lu-red-lentil-soup', 'vg-chickpea-curry'],
    ]),
  },
  {
    id: 'mediterranean',
    icon: 'sunny',
    premium: true,
    entries: week(
      [
        ['bf-shakshuka', 'lu-greek-salad-pita', 'di-fish-parcels-tomato-olive'],
        [null, 'lu-herby-tabbouleh', 'di-greek-chicken-feta-bake'],
        ['bf-turkish-eggs', 'lu-tuna-white-bean-salad', 'vg-vegetable-tagine'],
        [null, 'lu-spiced-chickpea-pita', 'di-lamb-kofta-yogurt'],
        ['bf-overnight-oats', 'lu-caprese-baguette', 'di-salmon-asparagus-tray'],
        [null, 'lu-warm-lentil-goat-cheese-salad', 'vg-eggplant-bake'],
        [null, 'lu-zucchini-goat-cheese-tart', 'di-lamb-eggplant-moussaka'],
      ],
      { 0: 'sn-hummus', 3: 'sn-tzatziki', 5: 'sn-baba-ganoush' },
    ),
  },
  {
    id: 'busy',
    icon: 'briefcase',
    premium: true,
    entries: week([
      ['bf-overnight-oats', 'lu-roasted-veg-quinoa-bowl', 'di-beef-bean-chili'],
      ['bf-overnight-oats', 'lu-roasted-veg-quinoa-bowl', 'di-beef-bean-chili'],
      ['bf-green-smoothie', 'lu-turkey-taco-bowl', 'di-chicken-broccoli-stir-fry'],
      ['bf-overnight-oats', 'lu-turkey-taco-bowl', 'vg-red-lentil-dal'],
      ['bf-green-smoothie', 'lu-peanut-noodle-salad', 'vg-red-lentil-dal'],
      [null, 'lu-smashed-chickpea-wrap', 'di-salmon-asparagus-tray'],
      ['bf-banana-oat-pancakes', null, 'di-slow-beef-stew'],
    ]),
  },
];
