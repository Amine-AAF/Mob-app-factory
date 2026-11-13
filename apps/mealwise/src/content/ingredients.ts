import type { GroceryCategory, LocalizedText } from '@/domain/types';

/**
 * Ingredient catalog: the shared vocabulary of bundled recipes, the grocery list
 * and the pantry. Keys are stable ids (never rename a shipped key).
 *
 * Nutrition values are generic per-100 g reference averages for the raw/plain
 * product (rounded, in the range of public food-composition tables). They are
 * only used to compute clearly labelled ESTIMATES; they are not product data.
 *
 * - `pieceGrams`: typical weight of one piece/clove/slice/can/bunch (for estimates only).
 * - `density`: grams per millilitre (to estimate the weight of spoon/cup measures).
 * - `negligible`: contributes ~nothing nutritionally (spices, herbs, water) and is
 *   excluded from the nutrition coverage ratio.
 * - `staple`: usually at home (salt, pepper, oil); not counted as "missing" for a recipe.
 * - `noShopping`: never added to grocery lists (tap water).
 */
export interface CatalogIngredient {
  key: string;
  name: LocalizedText;
  category: GroceryCategory;
  per100g?: { kcal: number; protein: number; carbs: number; fat: number };
  pieceGrams?: number;
  density?: number;
  negligible?: boolean;
  staple?: boolean;
  noShopping?: boolean;
}

type N = [kcal: number, protein: number, carbs: number, fat: number];
type Extra = Omit<CatalogIngredient, 'key' | 'name' | 'category' | 'per100g'>;

function i(key: string, category: GroceryCategory, en: string, fr: string, es: string, n?: N, extra: Extra = {}): CatalogIngredient {
  return {
    key,
    category,
    name: { en, fr, es },
    ...(n ? { per100g: { kcal: n[0], protein: n[1], carbs: n[2], fat: n[3] } } : {}),
    ...extra,
  };
}

const V: GroceryCategory = 'vegetables';
const F: GroceryCategory = 'fruits';
const M: GroceryCategory = 'meat_fish';
const D: GroceryCategory = 'dairy_eggs';
const B: GroceryCategory = 'bakery';
const P: GroceryCategory = 'pantry';
const S: GroceryCategory = 'spices_condiments';
const Z: GroceryCategory = 'frozen';
const BV: GroceryCategory = 'beverages';

export const INGREDIENTS: CatalogIngredient[] = [
  // Vegetables & herbs
  i('onion', V, 'Onions', 'Oignons', 'Cebollas', [40, 1.1, 9.3, 0.1], { pieceGrams: 110 }),
  i('red_onion', V, 'Red onions', 'Oignons rouges', 'Cebollas moradas', [40, 1.1, 9.3, 0.1], { pieceGrams: 110 }),
  i('shallot', V, 'Shallots', 'Échalotes', 'Chalotas', [72, 2.5, 16.8, 0.1], { pieceGrams: 30 }),
  i('spring_onion', V, 'Spring onions', 'Oignons nouveaux', 'Cebolletas', [32, 1.8, 7.3, 0.2], { pieceGrams: 15 }),
  i('garlic', V, 'Garlic', 'Ail', 'Ajo', [149, 6.4, 33, 0.5], { pieceGrams: 5 }),
  i('ginger', V, 'Fresh ginger', 'Gingembre frais', 'Jengibre fresco', [80, 1.8, 18, 0.8], { pieceGrams: 20 }),
  i('carrot', V, 'Carrots', 'Carottes', 'Zanahorias', [41, 0.9, 9.6, 0.2], { pieceGrams: 60 }),
  i('celery', V, 'Celery', 'Céleri branche', 'Apio', [16, 0.7, 3, 0.2], { pieceGrams: 40 }),
  i('potato', V, 'Potatoes', 'Pommes de terre', 'Patatas', [77, 2, 17, 0.1], { pieceGrams: 170 }),
  i('sweet_potato', V, 'Sweet potatoes', 'Patates douces', 'Boniatos', [86, 1.6, 20, 0.1], { pieceGrams: 200 }),
  i('tomato', V, 'Tomatoes', 'Tomates', 'Tomates', [18, 0.9, 3.9, 0.2], { pieceGrams: 120 }),
  i('cherry_tomato', V, 'Cherry tomatoes', 'Tomates cerises', 'Tomates cherry', [18, 0.9, 3.9, 0.2], { pieceGrams: 15 }),
  i('cucumber', V, 'Cucumbers', 'Concombres', 'Pepinos', [15, 0.7, 3.6, 0.1], { pieceGrams: 300 }),
  i('zucchini', V, 'Zucchini', 'Courgettes', 'Calabacines', [17, 1.2, 3.1, 0.3], { pieceGrams: 200 }),
  i('eggplant', V, 'Eggplants', 'Aubergines', 'Berenjenas', [25, 1, 5.9, 0.2], { pieceGrams: 300 }),
  i('bell_pepper', V, 'Bell peppers', 'Poivrons', 'Pimientos', [26, 1, 6, 0.3], { pieceGrams: 150 }),
  i('chili_pepper', V, 'Fresh chilies', 'Piments frais', 'Guindillas frescas', [40, 1.9, 8.8, 0.4], { pieceGrams: 15 }),
  i('broccoli', V, 'Broccoli', 'Brocoli', 'Brócoli', [34, 2.8, 6.6, 0.4], { pieceGrams: 300 }),
  i('cauliflower', V, 'Cauliflower', 'Chou-fleur', 'Coliflor', [25, 1.9, 5, 0.3], { pieceGrams: 600 }),
  i('spinach', V, 'Fresh spinach', 'Épinards frais', 'Espinacas frescas', [23, 2.9, 3.6, 0.4], { pieceGrams: 200 }),
  i('kale', V, 'Kale', 'Chou kale', 'Col rizada', [49, 4.3, 8.8, 0.9]),
  i('lettuce', V, 'Lettuce', 'Laitue', 'Lechuga', [15, 1.4, 2.9, 0.2], { pieceGrams: 300 }),
  i('arugula', V, 'Arugula', 'Roquette', 'Rúcula', [25, 2.6, 3.7, 0.7], { pieceGrams: 100 }),
  i('cabbage', V, 'Cabbage', 'Chou', 'Repollo', [25, 1.3, 5.8, 0.1], { pieceGrams: 900 }),
  i('red_cabbage', V, 'Red cabbage', 'Chou rouge', 'Lombarda', [31, 1.4, 7.4, 0.2], { pieceGrams: 900 }),
  i('mushroom', V, 'Mushrooms', 'Champignons', 'Champiñones', [22, 3.1, 3.3, 0.3], { pieceGrams: 18 }),
  i('green_beans', V, 'Green beans', 'Haricots verts', 'Judías verdes', [31, 1.8, 7, 0.2]),
  i('leek', V, 'Leeks', 'Poireaux', 'Puerros', [61, 1.5, 14, 0.3], { pieceGrams: 200 }),
  i('asparagus', V, 'Asparagus', 'Asperges', 'Espárragos', [20, 2.2, 3.9, 0.1], { pieceGrams: 20 }),
  i('butternut_squash', V, 'Butternut squash', 'Courge butternut', 'Calabaza', [45, 1, 11.7, 0.1], { pieceGrams: 1000 }),
  i('beetroot', V, 'Beetroot', 'Betteraves', 'Remolachas', [43, 1.6, 9.6, 0.2], { pieceGrams: 120 }),
  i('avocado', V, 'Avocados', 'Avocats', 'Aguacates', [160, 2, 8.5, 14.7], { pieceGrams: 150 }),
  i('corn_cob', V, 'Corn on the cob', 'Épis de maïs', 'Mazorcas de maíz', [86, 3.3, 19, 1.4], { pieceGrams: 180 }),
  i('radish', V, 'Radishes', 'Radis', 'Rábanos', [16, 0.7, 3.4, 0.1], { pieceGrams: 10 }),
  i('basil', V, 'Fresh basil', 'Basilic frais', 'Albahaca fresca', undefined, { pieceGrams: 30, negligible: true }),
  i('parsley', V, 'Fresh parsley', 'Persil frais', 'Perejil fresco', undefined, { pieceGrams: 30, negligible: true }),
  i('cilantro', V, 'Fresh cilantro', 'Coriandre fraîche', 'Cilantro fresco', undefined, { pieceGrams: 30, negligible: true }),
  i('mint', V, 'Fresh mint', 'Menthe fraîche', 'Hierbabuena', undefined, { pieceGrams: 30, negligible: true }),
  i('dill', V, 'Fresh dill', 'Aneth frais', 'Eneldo fresco', undefined, { pieceGrams: 30, negligible: true }),
  i('rosemary', V, 'Fresh rosemary', 'Romarin frais', 'Romero fresco', undefined, { pieceGrams: 10, negligible: true }),

  // Fruits
  i('lemon', F, 'Lemons', 'Citrons', 'Limones', [29, 1.1, 9.3, 0.3], { pieceGrams: 100 }),
  i('lime', F, 'Limes', 'Citrons verts', 'Limas', [30, 0.7, 10.5, 0.2], { pieceGrams: 60 }),
  i('apple', F, 'Apples', 'Pommes', 'Manzanas', [52, 0.3, 13.8, 0.2], { pieceGrams: 180 }),
  i('pear', F, 'Pears', 'Poires', 'Peras', [57, 0.4, 15.2, 0.1], { pieceGrams: 170 }),
  i('banana', F, 'Bananas', 'Bananes', 'Plátanos', [89, 1.1, 22.8, 0.3], { pieceGrams: 120 }),
  i('orange', F, 'Oranges', 'Oranges', 'Naranjas', [47, 0.9, 11.8, 0.1], { pieceGrams: 150 }),
  i('strawberry', F, 'Strawberries', 'Fraises', 'Fresas', [32, 0.7, 7.7, 0.3], { pieceGrams: 12 }),
  i('blueberry', F, 'Blueberries', 'Myrtilles', 'Arándanos', [57, 0.7, 14.5, 0.3]),
  i('raspberry', F, 'Raspberries', 'Framboises', 'Frambuesas', [52, 1.2, 11.9, 0.7]),
  i('mango', F, 'Mangoes', 'Mangues', 'Mangos', [60, 0.8, 15, 0.4], { pieceGrams: 300 }),
  i('pineapple', F, 'Pineapple', 'Ananas', 'Piña', [50, 0.5, 13.1, 0.1], { pieceGrams: 900 }),
  i('peach', F, 'Peaches', 'Pêches', 'Melocotones', [39, 0.9, 9.5, 0.3], { pieceGrams: 150 }),
  i('grapes', F, 'Grapes', 'Raisin', 'Uvas', [69, 0.7, 18, 0.2]),
  i('kiwi', F, 'Kiwis', 'Kiwis', 'Kiwis', [61, 1.1, 14.7, 0.5], { pieceGrams: 75 }),
  i('watermelon', F, 'Watermelon', 'Pastèque', 'Sandía', [30, 0.6, 7.6, 0.2]),

  // Meat & fish
  i('chicken_breast', M, 'Chicken breasts', 'Blancs de poulet', 'Pechugas de pollo', [120, 22.5, 0, 2.6], { pieceGrams: 200 }),
  i('chicken_thigh', M, 'Chicken thighs', 'Hauts de cuisse de poulet', 'Contramuslos de pollo', [177, 18, 0, 11], { pieceGrams: 120 }),
  i('whole_chicken', M, 'Whole chicken', 'Poulet entier', 'Pollo entero', [215, 18.6, 0, 15], { pieceGrams: 1500 }),
  i('ground_beef', M, 'Ground beef', 'Bœuf haché', 'Carne picada de ternera', [250, 17, 0, 20]),
  i('beef_stew', M, 'Stewing beef', 'Bœuf à braiser', 'Ternera para guisar', [170, 21, 0, 9]),
  i('beef_steak', M, 'Beef steaks', 'Steaks de bœuf', 'Filetes de ternera', [190, 21, 0, 12], { pieceGrams: 200 }),
  i('ground_turkey', M, 'Ground turkey', 'Dinde hachée', 'Pavo picado', [150, 19, 0, 8]),
  i('pork_chop', M, 'Pork chops', 'Côtes de porc', 'Chuletas de cerdo', [196, 21, 0, 12], { pieceGrams: 200 }),
  i('pork_tenderloin', M, 'Pork tenderloin', 'Filet mignon de porc', 'Solomillo de cerdo', [143, 21, 0, 6], { pieceGrams: 450 }),
  i('bacon', M, 'Bacon', 'Lardons / bacon', 'Beicon', [417, 13, 1.4, 40], { pieceGrams: 15 }),
  i('ham', M, 'Cooked ham', 'Jambon cuit', 'Jamón cocido', [145, 21, 1.5, 6], { pieceGrams: 25 }),
  i('chorizo', M, 'Chorizo', 'Chorizo', 'Chorizo', [455, 24, 2, 38]),
  i('sausage', M, 'Sausages', 'Saucisses', 'Salchichas', [300, 12, 2, 27], { pieceGrams: 70 }),
  i('lamb_mince', M, 'Ground lamb', 'Agneau haché', 'Cordero picado', [282, 17, 0, 23]),
  i('salmon_fillet', M, 'Salmon fillets', 'Pavés de saumon', 'Lomos de salmón', [208, 20, 0, 13], { pieceGrams: 150 }),
  i('white_fish', M, 'White fish fillets', 'Filets de poisson blanc', 'Filetes de pescado blanco', [82, 18, 0, 0.7], { pieceGrams: 150 }),
  i('shrimp', M, 'Shrimp', 'Crevettes', 'Gambas', [99, 24, 0.2, 0.3]),

  // Dairy, eggs & chilled
  i('egg', D, 'Eggs', 'Œufs', 'Huevos', [143, 12.6, 0.7, 9.5], { pieceGrams: 50 }),
  i('milk', D, 'Milk', 'Lait', 'Leche', [61, 3.2, 4.8, 3.3], { density: 1.03 }),
  i('plant_milk', D, 'Plant-based milk', 'Boisson végétale', 'Bebida vegetal', [40, 1, 3, 2], { density: 1.03 }),
  i('butter', D, 'Butter', 'Beurre', 'Mantequilla', [717, 0.9, 0.1, 81], { density: 0.91 }),
  i('heavy_cream', D, 'Heavy cream', 'Crème liquide entière', 'Nata para cocinar', [340, 2.1, 2.8, 36], { density: 1 }),
  i('sour_cream', D, 'Sour cream', 'Crème fraîche', 'Crema agria', [198, 2.4, 4.6, 19], { density: 1 }),
  i('greek_yogurt', D, 'Greek yogurt', 'Yaourt grec', 'Yogur griego', [97, 9, 4, 5], { density: 1.05 }),
  i('plain_yogurt', D, 'Plain yogurt', 'Yaourt nature', 'Yogur natural', [61, 3.5, 4.7, 3.3], { density: 1.05, pieceGrams: 125 }),
  i('cheddar', D, 'Cheddar', 'Cheddar', 'Queso cheddar', [403, 25, 1.3, 33]),
  i('parmesan', D, 'Parmesan', 'Parmesan', 'Parmesano', [431, 38, 4, 29], { density: 0.4 }),
  i('mozzarella', D, 'Mozzarella', 'Mozzarella', 'Mozzarella', [280, 22, 2.2, 20], { pieceGrams: 125 }),
  i('feta', D, 'Feta', 'Feta', 'Queso feta', [264, 14, 4, 21]),
  i('cream_cheese', D, 'Cream cheese', 'Fromage frais', 'Queso crema', [342, 6, 4, 34], { density: 1 }),
  i('ricotta', D, 'Ricotta', 'Ricotta', 'Ricotta', [174, 11, 3, 13], { density: 1 }),
  i('goat_cheese', D, 'Goat cheese', 'Fromage de chèvre', 'Queso de cabra', [364, 22, 0.1, 30]),
  i('tofu', D, 'Firm tofu', 'Tofu ferme', 'Tofu firme', [144, 15.7, 3.5, 8.7], { pieceGrams: 400 }),

  // Bakery
  i('bread', B, 'Bread', 'Pain', 'Pan', [265, 9, 49, 3.2], { pieceGrams: 30 }),
  i('whole_wheat_bread', B, 'Whole wheat bread', 'Pain complet', 'Pan integral', [247, 13, 41, 3.4], { pieceGrams: 30 }),
  i('baguette', B, 'Baguette', 'Baguette', 'Barra de pan', [270, 9, 55, 1.5], { pieceGrams: 250 }),
  i('tortilla', B, 'Flour tortillas', 'Tortillas de blé', 'Tortillas de trigo', [310, 8, 52, 7.5], { pieceGrams: 45 }),
  i('pita', B, 'Pita breads', 'Pains pita', 'Panes de pita', [275, 9, 56, 1.2], { pieceGrams: 60 }),
  i('burger_bun', B, 'Burger buns', 'Pains à burger', 'Panes de hamburguesa', [280, 9, 50, 4.5], { pieceGrams: 60 }),

  // Pantry: grains, pasta, canned, baking, oils
  i('rice', P, 'Rice', 'Riz', 'Arroz', [360, 6.6, 79, 0.6], { density: 0.85 }),
  i('arborio_rice', P, 'Risotto rice', 'Riz à risotto', 'Arroz para risotto', [350, 6.5, 79, 0.6], { density: 0.85 }),
  i('pasta', P, 'Pasta', 'Pâtes', 'Pasta', [371, 13, 75, 1.5]),
  i('spaghetti', P, 'Spaghetti', 'Spaghettis', 'Espaguetis', [371, 13, 75, 1.5]),
  i('lasagna_sheets', P, 'Lasagna sheets', 'Feuilles de lasagne', 'Placas de lasaña', [371, 13, 75, 1.5]),
  i('rice_noodles', P, 'Rice noodles', 'Nouilles de riz', 'Fideos de arroz', [364, 6, 80, 0.6]),
  i('egg_noodles', P, 'Egg noodles', 'Nouilles aux œufs', 'Fideos de huevo', [384, 14, 71, 4.4]),
  i('rolled_oats', P, 'Rolled oats', 'Flocons d’avoine', 'Copos de avena', [379, 13, 68, 6.5], { density: 0.4 }),
  i('quinoa', P, 'Quinoa', 'Quinoa', 'Quinoa', [368, 14, 64, 6], { density: 0.75 }),
  i('couscous', P, 'Couscous', 'Semoule de couscous', 'Cuscús', [376, 13, 77, 0.6], { density: 0.75 }),
  i('bulgur', P, 'Bulgur', 'Boulgour', 'Bulgur', [342, 12, 76, 1.3], { density: 0.75 }),
  i('flour', P, 'Flour', 'Farine', 'Harina', [364, 10, 76, 1], { density: 0.53 }),
  i('cornstarch', P, 'Cornstarch', 'Fécule de maïs', 'Maicena', [381, 0.3, 91, 0.1], { density: 0.6 }),
  i('sugar', P, 'Sugar', 'Sucre', 'Azúcar', [387, 0, 100, 0], { density: 0.85 }),
  i('brown_sugar', P, 'Brown sugar', 'Sucre roux', 'Azúcar moreno', [380, 0.1, 98, 0], { density: 0.9 }),
  i('honey', P, 'Honey', 'Miel', 'Miel', [304, 0.3, 82, 0], { density: 1.42 }),
  i('maple_syrup', P, 'Maple syrup', 'Sirop d’érable', 'Sirope de arce', [260, 0, 67, 0.1], { density: 1.32 }),
  i('baking_powder', P, 'Baking powder', 'Levure chimique', 'Levadura química', undefined, { density: 0.9, negligible: true }),
  i('baking_soda', P, 'Baking soda', 'Bicarbonate', 'Bicarbonato', undefined, { density: 1.1, negligible: true }),
  i('vanilla_extract', P, 'Vanilla extract', 'Extrait de vanille', 'Extracto de vainilla', undefined, { density: 0.9, negligible: true }),
  i('cocoa_powder', P, 'Cocoa powder', 'Cacao en poudre', 'Cacao en polvo', [228, 20, 18, 14], { density: 0.45 }),
  i('dark_chocolate', P, 'Dark chocolate', 'Chocolat noir', 'Chocolate negro', [546, 4.9, 61, 31]),
  i('olive_oil', P, 'Olive oil', 'Huile d’olive', 'Aceite de oliva', [884, 0, 0, 100], { density: 0.91, staple: true }),
  i('vegetable_oil', P, 'Vegetable oil', 'Huile végétale', 'Aceite vegetal', [884, 0, 0, 100], { density: 0.92, staple: true }),
  i('sesame_oil', P, 'Sesame oil', 'Huile de sésame', 'Aceite de sésamo', [884, 0, 0, 100], { density: 0.92 }),
  i('canned_tomatoes', P, 'Canned chopped tomatoes', 'Tomates concassées en boîte', 'Tomate troceado en lata', [21, 1, 4, 0.2], { pieceGrams: 400 }),
  i('tomato_paste', P, 'Tomato paste', 'Concentré de tomate', 'Concentrado de tomate', [82, 4.3, 19, 0.5], { density: 1.1 }),
  i('passata', P, 'Tomato passata', 'Coulis de tomate', 'Tomate triturado', [30, 1.4, 5.5, 0.2], { density: 1.03 }),
  i('coconut_milk', P, 'Coconut milk', 'Lait de coco', 'Leche de coco', [197, 2, 2.8, 21], { density: 0.97, pieceGrams: 400 }),
  i('chickpeas_canned', P, 'Canned chickpeas', 'Pois chiches en boîte', 'Garbanzos cocidos', [139, 7, 22, 2.6], { pieceGrams: 240 }),
  i('black_beans_canned', P, 'Canned black beans', 'Haricots noirs en boîte', 'Alubias negras cocidas', [91, 6, 16, 0.3], { pieceGrams: 240 }),
  i('kidney_beans_canned', P, 'Canned kidney beans', 'Haricots rouges en boîte', 'Alubias rojas cocidas', [100, 7, 16, 0.5], { pieceGrams: 240 }),
  i('white_beans_canned', P, 'Canned white beans', 'Haricots blancs en boîte', 'Alubias blancas cocidas', [100, 7, 17, 0.4], { pieceGrams: 240 }),
  i('lentils', P, 'Green lentils (dry)', 'Lentilles vertes (sèches)', 'Lentejas pardinas (secas)', [352, 25, 63, 1.1], { density: 0.8 }),
  i('red_lentils', P, 'Red lentils (dry)', 'Lentilles corail (sèches)', 'Lentejas rojas (secas)', [358, 24, 63, 2.2], { density: 0.8 }),
  i('canned_corn', P, 'Canned sweetcorn', 'Maïs doux en boîte', 'Maíz dulce en lata', [81, 2.7, 17, 1.2], { pieceGrams: 285 }),
  i('tuna_canned', P, 'Canned tuna', 'Thon en boîte', 'Atún en lata', [116, 26, 0, 1], { pieceGrams: 140 }),
  i('vegetable_broth', P, 'Vegetable broth', 'Bouillon de légumes', 'Caldo de verduras', [6, 0.3, 1, 0.1], { density: 1 }),
  i('chicken_broth', P, 'Chicken broth', 'Bouillon de volaille', 'Caldo de pollo', [7, 1, 0.4, 0.2], { density: 1 }),
  i('soy_sauce', S, 'Soy sauce', 'Sauce soja', 'Salsa de soja', [53, 8, 4.9, 0.6], { density: 1.15 }),
  i('vinegar', S, 'Vinegar', 'Vinaigre', 'Vinagre', [18, 0, 0.04, 0], { density: 1.01, negligible: true }),
  i('balsamic_vinegar', S, 'Balsamic vinegar', 'Vinaigre balsamique', 'Vinagre balsámico', [88, 0.5, 17, 0], { density: 1.06 }),
  i('peanut_butter', P, 'Peanut butter', 'Beurre de cacahuète', 'Crema de cacahuete', [588, 25, 20, 50], { density: 1.08 }),
  i('tahini', P, 'Tahini', 'Tahini', 'Tahini', [595, 17, 21, 54], { density: 1.05 }),
  i('almonds', P, 'Almonds', 'Amandes', 'Almendras', [579, 21, 22, 50], { density: 0.6 }),
  i('walnuts', P, 'Walnuts', 'Noix', 'Nueces', [654, 15, 14, 65], { density: 0.5 }),
  i('peanuts', P, 'Peanuts', 'Cacahuètes', 'Cacahuetes', [567, 26, 16, 49], { density: 0.6 }),
  i('chia_seeds', P, 'Chia seeds', 'Graines de chia', 'Semillas de chía', [486, 17, 42, 31], { density: 0.65 }),
  i('sesame_seeds', P, 'Sesame seeds', 'Graines de sésame', 'Semillas de sésamo', [573, 18, 23, 50], { density: 0.6 }),
  i('raisins', P, 'Raisins', 'Raisins secs', 'Pasas', [299, 3.1, 79, 0.5], { density: 0.65 }),
  i('breadcrumbs', P, 'Breadcrumbs', 'Chapelure', 'Pan rallado', [395, 13, 72, 5.3], { density: 0.45 }),
  i('olives', P, 'Olives', 'Olives', 'Aceitunas', [145, 1, 3.8, 15], { pieceGrams: 4 }),
  i('pesto', P, 'Pesto', 'Pesto', 'Pesto', [450, 5, 6, 45], { density: 1 }),
  i('curry_paste', P, 'Curry paste', 'Pâte de curry', 'Pasta de curry', [120, 2, 13, 7], { density: 1.1 }),
  i('jam', P, 'Jam', 'Confiture', 'Mermelada', [250, 0.4, 62, 0.1], { density: 1.3 }),

  // Spices & condiments
  i('salt', S, 'Salt', 'Sel', 'Sal', undefined, { density: 1.2, negligible: true, staple: true }),
  i('black_pepper', S, 'Black pepper', 'Poivre noir', 'Pimienta negra', undefined, { density: 0.5, negligible: true, staple: true }),
  i('paprika', S, 'Paprika', 'Paprika', 'Pimentón dulce', undefined, { negligible: true }),
  i('smoked_paprika', S, 'Smoked paprika', 'Paprika fumé', 'Pimentón ahumado', undefined, { negligible: true }),
  i('cumin', S, 'Ground cumin', 'Cumin moulu', 'Comino molido', undefined, { negligible: true }),
  i('chili_flakes', S, 'Chili flakes', 'Piment en flocons', 'Copos de guindilla', undefined, { negligible: true }),
  i('chili_powder', S, 'Chili powder', 'Piment en poudre', 'Chile en polvo', undefined, { negligible: true }),
  i('cinnamon', S, 'Ground cinnamon', 'Cannelle moulue', 'Canela molida', undefined, { negligible: true }),
  i('curry_powder', S, 'Curry powder', 'Curry en poudre', 'Curry en polvo', undefined, { negligible: true }),
  i('turmeric', S, 'Ground turmeric', 'Curcuma', 'Cúrcuma', undefined, { negligible: true }),
  i('garam_masala', S, 'Garam masala', 'Garam masala', 'Garam masala', undefined, { negligible: true }),
  i('oregano', S, 'Dried oregano', 'Origan séché', 'Orégano seco', undefined, { negligible: true }),
  i('thyme', S, 'Dried thyme', 'Thym séché', 'Tomillo seco', undefined, { negligible: true }),
  i('mixed_herbs', S, 'Dried mixed herbs', 'Herbes de Provence', 'Hierbas provenzales', undefined, { negligible: true }),
  i('bay_leaf', S, 'Bay leaves', 'Feuilles de laurier', 'Hojas de laurel', undefined, { negligible: true }),
  i('ground_ginger', S, 'Ground ginger', 'Gingembre moulu', 'Jengibre molido', undefined, { negligible: true }),
  i('nutmeg', S, 'Ground nutmeg', 'Noix de muscade', 'Nuez moscada', undefined, { negligible: true }),
  i('mustard', S, 'Mustard', 'Moutarde', 'Mostaza', [66, 4, 5, 3.3], { density: 1.05 }),
  i('mayonnaise', S, 'Mayonnaise', 'Mayonnaise', 'Mayonesa', [680, 1, 0.6, 75], { density: 0.95 }),
  i('ketchup', S, 'Ketchup', 'Ketchup', 'Kétchup', [112, 1.7, 26, 0.1], { density: 1.15 }),
  i('hot_sauce', S, 'Hot sauce', 'Sauce piquante', 'Salsa picante', undefined, { density: 1.05, negligible: true }),
  i('salsa', S, 'Tomato salsa', 'Sauce salsa', 'Salsa de tomate picante', [36, 1.5, 7, 0.2], { density: 1.05 }),

  // Frozen
  i('frozen_peas', Z, 'Frozen peas', 'Petits pois surgelés', 'Guisantes congelados', [77, 5, 13, 0.4], { density: 0.6 }),
  i('frozen_berries', Z, 'Frozen berries', 'Fruits rouges surgelés', 'Frutos rojos congelados', [45, 0.8, 10, 0.3], { density: 0.6 }),
  i('frozen_spinach', Z, 'Frozen spinach', 'Épinards surgelés', 'Espinacas congeladas', [29, 3.6, 4.2, 0.6]),
  i('frozen_mixed_veg', Z, 'Frozen mixed vegetables', 'Mélange de légumes surgelés', 'Verduras variadas congeladas', [65, 3, 12, 0.5], { density: 0.6 }),
  i('puff_pastry', Z, 'Puff pastry', 'Pâte feuilletée', 'Hojaldre', [558, 7, 46, 38], { pieceGrams: 230 }),

  // Beverages
  i('water', BV, 'Water', 'Eau', 'Agua', undefined, { density: 1, negligible: true, staple: true, noShopping: true }),
  i('orange_juice', BV, 'Orange juice', 'Jus d’orange', 'Zumo de naranja', [45, 0.7, 10.4, 0.2], { density: 1.04 }),
  i('coffee', BV, 'Coffee', 'Café', 'Café', undefined, { negligible: true }),
  i('tea', BV, 'Tea', 'Thé', 'Té', undefined, { negligible: true }),
];

export const INGREDIENT_BY_KEY: ReadonlyMap<string, CatalogIngredient> = new Map(INGREDIENTS.map((x) => [x.key, x]));

export function catalogIngredient(key: string): CatalogIngredient | undefined {
  return INGREDIENT_BY_KEY.get(key);
}
