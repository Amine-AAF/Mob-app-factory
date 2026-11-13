import { isCustomKey, keyForName } from './ingredients';
import { parseQuantity } from './quantity';
import type { RecipeIngredient, RecipeStep, UnitId } from './types';

/**
 * Manual recipe import: turns pasted text (from notes, a message, a family
 * recipe card typed by the user…) into an editable draft. Nothing is fetched
 * from the internet. The draft always goes through the editor before saving.
 */

/** Unit words in en / fr / es → unit id (and a multiplier for cl / dl). */
const UNIT_ALIASES: [RegExp, UnitId, number][] = [
  [/^(kg|kgs|kilo|kilos|kilogram|kilograms|kilogramme|kilogrammes|kilogramo|kilogramos)$/, 'kg', 1],
  [/^(g|gr|grs|gram|grams|gramme|grammes|gramo|gramos)$/, 'g', 1],
  [/^(mg)$/, 'g', 0.001],
  [/^(oz|ounce|ounces|onza|onzas)$/, 'oz', 1],
  [/^(lb|lbs|pound|pounds|libra|libras)$/, 'lb', 1],
  [/^(ml|millilitre|millilitres|milliliter|milliliters|mililitro|mililitros)$/, 'ml', 1],
  [/^(cl|centilitre|centilitres|centilitro|centilitros)$/, 'ml', 10],
  [/^(dl|decilitre|decilitres|decilitro|decilitros)$/, 'ml', 100],
  [/^(l|litre|litres|liter|liters|litro|litros)$/, 'l', 1],
  [/^(tsp|tsps|teaspoon|teaspoons|cc|cac|c\.?a\.?c\.?|cdta|cdtas|cucharadita|cucharaditas)$/, 'tsp', 1],
  [/^(tbsp|tbsps|tbs|tablespoon|tablespoons|cs|cas|c\.?a\.?s\.?|cda|cdas|cucharada|cucharadas)$/, 'tbsp', 1],
  [/^(cup|cups|tasse|tasses|taza|tazas)$/, 'cup', 1],
  [/^(fl\.? ?oz)$/, 'fl_oz', 1],
  [/^(clove|cloves|gousse|gousses|diente|dientes)$/, 'clove', 1],
  [/^(slice|slices|tranche|tranches|rebanada|rebanadas|loncha|lonchas)$/, 'slice', 1],
  [/^(can|cans|tin|tins|boite|boites|lata|latas)$/, 'can', 1],
  [/^(bunch|bunches|botte|bottes|bouquet|manojo|manojos|ramillete)$/, 'bunch', 1],
  [/^(pinch|pinches|pincee|pincees|pizca|pizcas)$/, 'pinch', 1],
  [/^(pack|packs|package|packages|paquet|paquets|sachet|sachets|paquete|paquetes|sobre|sobres)$/, 'pack', 1],
  [/^(pc|pcs|piece|pieces|pieza|piezas|unit|units|unite|unites|unidad|unidades)$/, 'pc', 1],
];

/** Multi-word French/Spanish spoon expressions normalised before tokenising. */
const PHRASES: [RegExp, string][] = [
  [/cuill?[eè]res?\s+[àa]\s+caf[eé]/gi, 'tsp'],
  [/cuill?[eè]res?\s+[àa]\s+soupe/gi, 'tbsp'],
  [/c\.\s*[àa]\s*c\.?/gi, 'tsp'],
  [/c\.\s*[àa]\s*s\.?/gi, 'tbsp'],
  [/fl\.?\s+oz/gi, 'floz'],
];

const TO_TASTE = /\b(to taste|as needed|au go[uû]t|selon le go[uû]t|a gusto|al gusto|c\.?s\.?p\.?|quantit[eé] suffisante)\b/i;
const OPTIONAL = /\((optional|facultatif|opcional)\)|\b(optional|facultatif|opcional)\b/i;
/** Leading "of" / "de" / "d’" / "del" between the unit and the ingredient name ("2 gousses d’ail"). */
const CONNECTORS = /^(of\s+|de la\s+|del\s+|de\s+|d['’]\s*)/i;

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function unitFor(token: string): [UnitId, number] | null {
  const t = stripAccents(token.toLowerCase()).replace(/\.$/, '');
  if (t === 'floz') return ['fl_oz', 1];
  for (const [re, unit, mult] of UNIT_ALIASES) if (re.test(t)) return [unit, mult];
  return null;
}

/** Parses one ingredient line ("1 1/2 cups flour, sifted", "2 gousses d'ail", "Sel au goût"). */
export function parseIngredientLine(raw: string): RecipeIngredient | null {
  let line = raw.replace(/^\s*([-*•·]|\d+[.)])\s+/, '').trim();
  if (!line) return null;
  for (const [re, rep] of PHRASES) line = line.replace(re, rep);
  const optional = OPTIONAL.test(line);
  line = line.replace(OPTIONAL, ' ').trim();
  const toTaste = TO_TASTE.test(line);
  line = line.replace(TO_TASTE, ' ').replace(/\s+/g, ' ').trim();

  // Quantity: leading number / fraction / range.
  const qty = /^((\d+\s+\d+\/\d+)|(\d+[.,]?\d*\s*[¼½¾⅓⅔⅛]?)|([¼½¾⅓⅔⅛])|(\d+\/\d+))(\s*[-–]\s*\d+([.,]\d+)?)?/.exec(line);
  let quantity: number | null = null;
  if (qty) {
    quantity = parseQuantity(qty[0]);
    line = line.slice(qty[0].length).trim();
  }
  // Attached unit ("200g", "1.5kg").
  let unit: UnitId = 'pc';
  let mult = 1;
  const first = /^([^\s,]+)\s*(.*)$/.exec(line);
  if (first) {
    const u = unitFor(first[1] ?? '');
    if (u && quantity !== null) {
      [unit, mult] = u;
      line = (first[2] ?? '').trim();
    }
  }
  // Parenthesised size info like "(400 g)" after a can is kept as a note.
  let note: string | undefined;
  const paren = /\(([^)]*)\)/.exec(line);
  if (paren) {
    note = paren[1]?.trim() || undefined;
    line = line.replace(paren[0], ' ').trim();
  }
  // Trailing preparation after a comma becomes a note ("onion, finely chopped").
  const comma = line.indexOf(',');
  if (comma > 0) {
    const prep = line.slice(comma + 1).trim();
    note = [note, prep].filter(Boolean).join(', ') || undefined;
    line = line.slice(0, comma).trim();
  }
  line = line.replace(CONNECTORS, '').replace(/\s+/g, ' ').trim();
  if (!line) return null;

  const name = line.charAt(0).toUpperCase() + line.slice(1);
  const key = keyForName(name);
  const finalQty = quantity !== null ? quantity * mult : null;
  const ingredient: RecipeIngredient = {
    key,
    quantity: toTaste || finalQty === null ? null : finalQty,
    unit: toTaste || finalQty === null ? 'to_taste' : unit,
  };
  if (isCustomKey(key)) ingredient.name = name;
  if (note) ingredient.note = note;
  if (optional) ingredient.optional = true;
  return ingredient;
}

export interface ImportedDraft {
  title: string;
  description: string;
  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  /** Lines that could not be understood (shown to the user). */
  skipped: string[];
}

const SECTION_INGREDIENTS = /^(ingredients?|ingr[eé]dients?|ingredientes?)\s*:?$/i;
const SECTION_STEPS = /^(instructions?|directions?|method|steps?|preparation|pr[eé]paration|[eé]tapes?|recette|elaboraci[oó]n|preparaci[oó]n|pasos?|instrucciones)\s*:?$/i;
const SERVINGS = /(serves|servings?|portions?|pour|personnes?|raciones|porciones|para)\s*:?\s*(\d+)/i;
const PREP = /(prep(aration)?( time)?|pr[eé]paration|preparaci[oó]n)\s*:?\s*(\d+)\s*(min|minutes?|minutos?)/i;
const COOK = /(cook(ing)?( time)?|cuisson|cocci[oó]n)\s*:?\s*(\d+)\s*(min|minutes?|minutos?)/i;
const TIMER_IN_STEP = /(\d+)\s*(?:-|–|to|à|a)?\s*(\d+)?\s*(min|minutes?|minutos?)\b/i;

export function stepTimer(text: string): number | undefined {
  const m = TIMER_IN_STEP.exec(text);
  if (!m) return undefined;
  const n = Number(m[2] ?? m[1]);
  return n > 0 && n <= 480 ? n : undefined;
}

/** Parses free text into a draft. Without headings, lines starting with a number+unit are ingredients. */
export function parseRecipeText(input: string): ImportedDraft {
  const lines = input.replace(/\r/g, '').split('\n').map((l) => l.trim());
  const draft: ImportedDraft = { title: '', description: '', servings: null, prepMinutes: null, cookMinutes: null, ingredients: [], steps: [], skipped: [] };
  let section: 'head' | 'ingredients' | 'steps' = 'head';
  const head: string[] = [];
  for (const line of lines) {
    if (!line) continue;
    if (SECTION_INGREDIENTS.test(line)) {
      section = 'ingredients';
      continue;
    }
    if (SECTION_STEPS.test(line)) {
      section = 'steps';
      continue;
    }
    const servings = SERVINGS.exec(line);
    if (servings && draft.servings === null && line.length < 40) {
      draft.servings = Math.min(50, Number(servings[2]));
      continue;
    }
    const prep = PREP.exec(line);
    const cook = COOK.exec(line);
    if ((prep || cook) && line.length < 60) {
      if (prep) draft.prepMinutes = Number(prep[4]);
      if (cook) draft.cookMinutes = Number(cook[4]);
      continue;
    }
    if (section === 'head') {
      const looksLikeIngredient = /^([-*•]\s*)?(\d|[¼½¾⅓⅔])/.test(line) && line.length < 80 && head.length > 0;
      if (looksLikeIngredient) {
        section = 'ingredients';
      } else {
        head.push(line);
        continue;
      }
    }
    if (section === 'ingredients') {
      const ing = parseIngredientLine(line);
      if (ing) draft.ingredients.push(ing);
      else draft.skipped.push(line);
      continue;
    }
    const text = line.replace(/^\s*(\d+[.)]|[-*•]|step\s*\d+\s*:?|[eé]tape\s*\d+\s*:?|paso\s*\d+\s*:?)\s*/i, '').trim();
    if (text) {
      const timerMinutes = stepTimer(text);
      draft.steps.push(timerMinutes ? { text, timerMinutes } : { text });
    }
  }
  draft.title = (head[0] ?? '').slice(0, 80);
  draft.description = head.slice(1).join(' ').slice(0, 300);
  return draft;
}
