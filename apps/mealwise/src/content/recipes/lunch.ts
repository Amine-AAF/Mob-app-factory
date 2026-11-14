import type { BuiltinRecipe, LocalizedText, UnitId } from '@/domain/types';

/** Compact helpers for authoring localized text and ingredient lines. */
const t = (en: string, fr: string, es: string): LocalizedText => ({ en, fr, es });
const ing = (key: string, quantity: number | null, unit: UnitId, note?: LocalizedText, optional?: boolean) => ({
  key,
  quantity,
  unit,
  ...(note ? { note } : {}),
  ...(optional ? { optional } : {}),
});
const salt = ing('salt', null, 'to_taste');
const pepper = ing('black_pepper', null, 'to_taste');

export const lunchRecipes: BuiltinRecipe[] = [
  {
    id: 'lu-red-lentil-soup',
    title: t('Spiced Red Lentil Soup', 'Soupe épicée aux lentilles corail', 'Sopa especiada de lentejas rojas'),
    description: t(
      'A velvety, golden soup with cumin, carrot and a squeeze of lemon. It keeps beautifully for the week ahead.',
      'Une soupe veloutée et dorée au cumin et à la carotte, relevée d’un trait de citron. Elle se garde très bien toute la semaine.',
      'Una sopa suave y dorada con comino, zanahoria y un chorrito de limón. Aguanta perfectamente varios días en la nevera.',
    ),
    emoji: '🥣',
    color: 'saffron',
    prepMinutes: 10,
    cookMinutes: 25,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'vegan', 'healthy'],
    tags: ['budget', 'meal-prep', 'freezer-friendly'],
    ingredients: [
      ing('red_lentils', 250, 'g'),
      ing('onion', 1, 'pc'),
      ing('carrot', 2, 'pc'),
      ing('garlic', 2, 'clove'),
      ing('cumin', 2, 'tsp'),
      ing('turmeric', 1, 'tsp'),
      ing('vegetable_broth', 1200, 'ml'),
      ing('olive_oil', 2, 'tbsp'),
      ing('lemon', 1, 'pc'),
      salt,
    ],
    steps: [
      {
        text: t(
          'Chop the onion, grate the carrots and crush the garlic. Rinse the lentils until the water runs almost clear.',
          'Émincez l’oignon, râpez les carottes et écrasez l’ail. Rincez les lentilles jusqu’à ce que l’eau soit presque claire.',
          'Pica la cebolla, ralla las zanahorias y machaca el ajo. Enjuaga las lentejas hasta que el agua salga casi limpia.',
        ),
      },
      {
        text: t(
          'Warm the oil in a large pot and soften the onion and carrot for 5 minutes. Stir in the garlic, cumin and turmeric for 1 minute.',
          'Faites chauffer l’huile dans une grande casserole et faites revenir l’oignon et la carotte 5 minutes. Ajoutez l’ail, le cumin et le curcuma, et remuez 1 minute.',
          'Calienta el aceite en una olla grande y sofríe la cebolla y la zanahoria 5 minutos. Añade el ajo, el comino y la cúrcuma y remueve 1 minuto.',
        ),
        timerMinutes: 5,
      },
      {
        text: t(
          'Add the lentils and broth, bring to a boil, then simmer until the lentils fall apart.',
          'Versez les lentilles et le bouillon, portez à ébullition puis laissez mijoter jusqu’à ce que les lentilles se défassent.',
          'Incorpora las lentejas y el caldo, lleva a ebullición y cuece a fuego lento hasta que las lentejas se deshagan.',
        ),
        timerMinutes: 18,
      },
      {
        text: t(
          'Blend roughly or until smooth, as you prefer. Season with salt and the juice of the lemon.',
          'Mixez grossièrement ou finement, selon votre goût. Salez et ajoutez le jus du citron.',
          'Tritura un poco o hasta que quede fina, a tu gusto. Sazona con sal y el zumo del limón.',
        ),
      },
    ],
  },
  {
    id: 'lu-smashed-chickpea-wrap',
    title: t('Smashed Chickpea Wraps', 'Wraps aux pois chiches écrasés', 'Wraps de garbanzos chafados'),
    description: t(
      'Creamy chickpeas mashed with tahini and lemon, rolled up with crunchy veg. Ready before the kettle boils twice.',
      'Des pois chiches écrasés avec du tahini et du citron, roulés avec des légumes croquants. Prêts en un clin d’œil.',
      'Garbanzos cremosos chafados con tahini y limón, enrollados con verduras crujientes. Listos en un momento.',
    ),
    emoji: '🌯',
    color: 'herb',
    prepMinutes: 10,
    cookMinutes: 0,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'vegetarian', 'vegan', 'quick', 'healthy'],
    tags: ['no-cook', 'student', 'budget'],
    ingredients: [
      ing('chickpeas_canned', 1, 'can', t('drained', 'égouttés', 'escurridos')),
      ing('tahini', 2, 'tbsp'),
      ing('lemon', 1, 'pc'),
      ing('tortilla', 2, 'pc'),
      ing('carrot', 1, 'pc'),
      ing('cucumber', 0.5, 'pc'),
      ing('lettuce', 4, 'pc', t('leaves', 'feuilles', 'hojas')),
      ing('cumin', 0.5, 'tsp'),
      salt,
    ],
    steps: [
      {
        text: t(
          'Mash the chickpeas with a fork, leaving some texture. Stir in the tahini, cumin, half the lemon juice and a pinch of salt.',
          'Écrasez les pois chiches à la fourchette en gardant un peu de texture. Incorporez le tahini, le cumin, le jus d’un demi-citron et une pincée de sel.',
          'Chafa los garbanzos con un tenedor, dejando algo de textura. Mezcla con el tahini, el comino, el zumo de medio limón y una pizca de sal.',
        ),
      },
      {
        text: t(
          'Grate the carrot and cut the cucumber into thin sticks.',
          'Râpez la carotte et taillez le concombre en fins bâtonnets.',
          'Ralla la zanahoria y corta el pepino en bastones finos.',
        ),
      },
      {
        text: t(
          'Spread the chickpea mixture over the tortillas, top with lettuce, carrot and cucumber, and add more lemon if you like.',
          'Étalez la préparation sur les tortillas, garnissez de salade, de carotte et de concombre, puis ajoutez du citron à votre goût.',
          'Unta la mezcla sobre las tortillas, cubre con lechuga, zanahoria y pepino, y añade más limón si te apetece.',
        ),
      },
      {
        text: t(
          'Roll up tightly, folding in the sides, and cut in half.',
          'Roulez bien serré en rabattant les côtés, puis coupez en deux.',
          'Enrolla bien apretado doblando los lados y corta por la mitad.',
        ),
      },
    ],
  },
  {
    id: 'lu-greek-salad-pita',
    title: t('Greek Salad with Warm Pita', 'Salade grecque et pita tiède', 'Ensalada griega con pan pita caliente'),
    description: t(
      'Juicy tomatoes, cucumber, olives and a slab of feta, with warm pita to mop up the dressing.',
      'Tomates juteuses, concombre, olives et un beau morceau de feta, avec une pita tiède pour saucer.',
      'Tomates jugosos, pepino, aceitunas y un buen trozo de feta, con pita caliente para mojar en el aliño.',
    ),
    emoji: '🥗',
    color: 'olive',
    prepMinutes: 15,
    cookMinutes: 2,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'vegetarian', 'quick', 'healthy'],
    tags: ['mediterranean', 'light'],
    ingredients: [
      ing('tomato', 3, 'pc'),
      ing('cucumber', 1, 'pc'),
      ing('red_onion', 0.5, 'pc'),
      ing('bell_pepper', 1, 'pc', t('green', 'vert', 'verde')),
      ing('olives', 60, 'g'),
      ing('feta', 150, 'g'),
      ing('olive_oil', 3, 'tbsp'),
      ing('vinegar', 1, 'tbsp', t('red wine', 'de vin rouge', 'de vino tinto')),
      ing('oregano', 1, 'tsp'),
      ing('pita', 2, 'pc'),
      salt,
    ],
    steps: [
      {
        text: t(
          'Cut the tomatoes into wedges, the cucumber into thick half-moons and the pepper into strips. Slice the onion very thinly.',
          'Coupez les tomates en quartiers, le concombre en demi-rondelles épaisses et le poivron en lanières. Émincez finement l’oignon.',
          'Corta los tomates en gajos, el pepino en medias lunas gruesas y el pimiento en tiras. Corta la cebolla muy fina.',
        ),
      },
      {
        text: t(
          'Combine the vegetables and olives in a bowl with a little salt.',
          'Réunissez les légumes et les olives dans un saladier avec un peu de sel.',
          'Junta las verduras y las aceitunas en un bol con un poco de sal.',
        ),
      },
      {
        text: t(
          'Lay the feta on top, drizzle with oil and vinegar and sprinkle with oregano.',
          'Posez la feta par-dessus, arrosez d’huile et de vinaigre, puis parsemez d’origan.',
          'Coloca el feta encima, riega con aceite y vinagre y espolvorea orégano.',
        ),
      },
      {
        text: t(
          'Warm the pitas in a dry pan for about a minute per side and serve alongside.',
          'Réchauffez les pitas à sec dans une poêle environ une minute par face et servez à côté.',
          'Calienta las pitas en una sartén sin aceite un minuto por cada lado y sírvelas al lado.',
        ),
      },
    ],
  },
  {
    id: 'lu-chicken-caesar-wrap',
    title: t('Chicken Caesar Wraps', 'Wraps César au poulet', 'Wraps César de pollo'),
    description: t(
      'Golden chicken, crisp lettuce and a garlicky parmesan dressing, all wrapped up for an easy lunch on the go.',
      'Du poulet doré, de la laitue croquante et une sauce au parmesan bien aillée, le tout roulé pour un déjeuner à emporter.',
      'Pollo dorado, lechuga crujiente y una salsa de parmesano con ajo, todo enrollado para comer donde quieras.',
    ),
    emoji: '🌯',
    color: 'peach',
    prepMinutes: 10,
    cookMinutes: 12,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'quick'],
    tags: ['high-protein', 'kid-friendly'],
    premium: true,
    ingredients: [
      ing('chicken_breast', 300, 'g'),
      ing('lettuce', 1, 'pc', t('romaine', 'romaine', 'romana')),
      ing('tortilla', 2, 'pc'),
      ing('parmesan', 30, 'g'),
      ing('mayonnaise', 3, 'tbsp'),
      ing('lemon', 0.5, 'pc'),
      ing('garlic', 1, 'clove'),
      ing('mustard', 1, 'tsp'),
      ing('olive_oil', 1, 'tbsp'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Season the chicken with salt and pepper and cook it in the oil over medium heat, turning once, until cooked through.',
          'Salez et poivrez le poulet, puis faites-le cuire dans l’huile à feu moyen en le retournant une fois, jusqu’à cuisson complète.',
          'Salpimienta el pollo y cocínalo en el aceite a fuego medio, dándole la vuelta una vez, hasta que esté hecho por dentro.',
        ),
        timerMinutes: 10,
      },
      {
        text: t(
          'Meanwhile, grate the garlic and half the parmesan into the mayonnaise, then add the mustard and lemon juice.',
          'Pendant ce temps, râpez l’ail et la moitié du parmesan dans la mayonnaise, puis ajoutez la moutarde et le jus de citron.',
          'Mientras tanto, ralla el ajo y la mitad del parmesano sobre la mayonesa y añade la mostaza y el zumo de limón.',
        ),
      },
      {
        text: t(
          'Let the chicken rest for a few minutes, then slice it thinly. Shred the lettuce.',
          'Laissez reposer le poulet quelques minutes, puis tranchez-le finement. Ciselez la laitue.',
          'Deja reposar el pollo unos minutos y córtalo en tiras finas. Trocea la lechuga.',
        ),
        timerMinutes: 3,
      },
      {
        text: t(
          'Toss the lettuce with the dressing, pile onto the tortillas with the chicken and remaining parmesan, and roll up.',
          'Mélangez la laitue avec la sauce, répartissez-la sur les tortillas avec le poulet et le reste de parmesan, puis roulez.',
          'Mezcla la lechuga con la salsa, repártela en las tortillas con el pollo y el resto del parmesano, y enrolla.',
        ),
      },
    ],
  },
  {
    id: 'lu-tuna-white-bean-salad',
    title: t('Tuna and White Bean Salad', 'Salade de thon aux haricots blancs', 'Ensalada de atún y alubias blancas'),
    description: t(
      'A pantry-friendly Italian-style salad with tender beans, flaked tuna, red onion and lots of parsley.',
      'Une salade à l’italienne faite avec le placard : haricots fondants, thon émietté, oignon rouge et beaucoup de persil.',
      'Una ensalada de inspiración italiana hecha con la despensa: alubias tiernas, atún desmigado, cebolla morada y mucho perejil.',
    ),
    emoji: '🐟',
    color: 'ocean',
    prepMinutes: 10,
    cookMinutes: 0,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'quick', 'healthy'],
    tags: ['no-cook', 'high-protein', 'mediterranean'],
    ingredients: [
      ing('white_beans_canned', 1, 'can', t('drained', 'égouttés', 'escurridas')),
      ing('tuna_canned', 1, 'can', t('drained', 'égoutté', 'escurrido')),
      ing('red_onion', 0.5, 'pc'),
      ing('cherry_tomato', 150, 'g'),
      ing('parsley', 0.5, 'bunch'),
      ing('lemon', 1, 'pc'),
      ing('olive_oil', 2, 'tbsp'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Slice the onion very thinly and let it sit in the lemon juice with a pinch of salt while you prepare the rest.',
          'Émincez très finement l’oignon et laissez-le mariner dans le jus de citron avec une pincée de sel pendant que vous préparez le reste.',
          'Corta la cebolla muy fina y déjala en el zumo de limón con una pizca de sal mientras preparas lo demás.',
        ),
      },
      {
        text: t(
          'Rinse the beans, halve the tomatoes and roughly chop the parsley.',
          'Rincez les haricots, coupez les tomates en deux et hachez grossièrement le persil.',
          'Enjuaga las alubias, parte los tomates por la mitad y pica el perejil sin afinar demasiado.',
        ),
      },
      {
        text: t(
          'Combine everything in a bowl with the onion and its juice, then flake in the tuna.',
          'Réunissez le tout dans un saladier avec l’oignon et son jus, puis ajoutez le thon émietté.',
          'Mezcla todo en un bol con la cebolla y su jugo y añade el atún desmigado.',
        ),
      },
      {
        text: t(
          'Dress with the olive oil, season with pepper and toss gently so the tuna stays in chunks.',
          'Arrosez d’huile d’olive, poivrez et mélangez délicatement pour garder des morceaux de thon.',
          'Aliña con el aceite, añade pimienta y mezcla con cuidado para que el atún quede en trozos.',
        ),
      },
    ],
  },
  {
    id: 'lu-black-bean-quesadillas',
    title: t('Black Bean and Corn Quesadillas', 'Quesadillas aux haricots noirs et au maïs', 'Quesadillas de frijoles negros y maíz'),
    description: t(
      'Crispy tortillas filled with smoky beans, sweet corn and melted cheddar. Serve with salsa for dipping.',
      'Des tortillas croustillantes garnies de haricots fumés, de maïs doux et de cheddar fondu, à tremper dans la salsa.',
      'Tortillas crujientes rellenas de frijoles ahumados, maíz dulce y cheddar fundido. Acompáñalas con salsa para mojar.',
    ),
    emoji: '🫓',
    color: 'tomato',
    prepMinutes: 10,
    cookMinutes: 12,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'quick'],
    tags: ['kid-friendly', 'budget', 'student'],
    ingredients: [
      ing('black_beans_canned', 1, 'can', t('drained', 'égouttés', 'escurridos')),
      ing('canned_corn', 150, 'g'),
      ing('cheddar', 120, 'g', t('grated', 'râpé', 'rallado')),
      ing('tortilla', 4, 'pc'),
      ing('spring_onion', 2, 'pc'),
      ing('smoked_paprika', 1, 'tsp'),
      ing('cumin', 0.5, 'tsp'),
      ing('salsa', 4, 'tbsp'),
      ing('vegetable_oil', 1, 'tsp'),
    ],
    steps: [
      {
        text: t(
          'Roughly mash the beans with the paprika and cumin. Stir in the corn and sliced spring onions.',
          'Écrasez grossièrement les haricots avec le paprika et le cumin. Ajoutez le maïs et les oignons nouveaux émincés.',
          'Chafa un poco los frijoles con el pimentón y el comino. Añade el maíz y la cebolleta en rodajas.',
        ),
      },
      {
        text: t(
          'Spread the mixture over two tortillas, scatter with cheddar and cover with the remaining tortillas.',
          'Étalez la préparation sur deux tortillas, parsemez de cheddar et recouvrez avec les deux autres.',
          'Extiende la mezcla sobre dos tortillas, reparte el cheddar y tapa con las otras dos.',
        ),
      },
      {
        text: t(
          'Cook one at a time in a lightly oiled pan over medium heat, flipping carefully, until golden and the cheese has melted.',
          'Faites-les cuire une par une dans une poêle légèrement huilée à feu moyen, en les retournant avec soin, jusqu’à ce qu’elles soient dorées et le fromage fondu.',
          'Cocínalas de una en una en una sartén con un poco de aceite a fuego medio, dándoles la vuelta con cuidado, hasta que estén doradas y el queso fundido.',
        ),
        timerMinutes: 5,
      },
      {
        text: t(
          'Cut into wedges and serve with the salsa.',
          'Coupez en triangles et servez avec la salsa.',
          'Corta en triángulos y sirve con la salsa.',
        ),
      },
    ],
  },
  {
    id: 'lu-peanut-noodle-salad',
    title: t('Peanut Noodle Salad', 'Salade de nouilles à la cacahuète', 'Ensalada de fideos con cacahuete'),
    description: t(
      'Chilled rice noodles tossed with crunchy vegetables in a punchy peanut, lime and ginger sauce.',
      'Des nouilles de riz froides, des légumes croquants et une sauce cacahuète, citron vert et gingembre bien relevée.',
      'Fideos de arroz fríos con verduras crujientes en una salsa intensa de cacahuete, lima y jengibre.',
    ),
    emoji: '🍜',
    color: 'cocoa',
    prepMinutes: 15,
    cookMinutes: 5,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'vegetarian', 'vegan', 'quick', 'healthy'],
    tags: ['meal-prep', 'spicy'],
    ingredients: [
      ing('rice_noodles', 150, 'g'),
      ing('peanut_butter', 3, 'tbsp'),
      ing('soy_sauce', 2, 'tbsp'),
      ing('lime', 1, 'pc'),
      ing('maple_syrup', 1, 'tsp'),
      ing('ginger', 10, 'g'),
      ing('carrot', 1, 'pc'),
      ing('red_cabbage', 100, 'g'),
      ing('cucumber', 0.5, 'pc'),
      ing('cilantro', 0.5, 'bunch'),
      ing('peanuts', 30, 'g'),
      ing('chili_flakes', 1, 'pinch', undefined, true),
    ],
    steps: [
      {
        text: t(
          'Cook the noodles according to the packet, then rinse under cold water and drain well.',
          'Faites cuire les nouilles selon les indications du paquet, puis rincez-les à l’eau froide et égouttez-les bien.',
          'Cuece los fideos según el paquete, enjuágalos con agua fría y escúrrelos bien.',
        ),
        timerMinutes: 5,
      },
      {
        text: t(
          'Whisk the peanut butter with the soy sauce, lime juice, maple syrup, grated ginger and 2–3 tbsp warm water until smooth.',
          'Fouettez le beurre de cacahuète avec la sauce soja, le jus de citron vert, le sirop d’érable, le gingembre râpé et 2 à 3 c. à s. d’eau tiède.',
          'Bate la crema de cacahuete con la salsa de soja, el zumo de lima, el sirope de arce, el jengibre rallado y 2 o 3 cucharadas de agua tibia.',
        ),
      },
      {
        text: t(
          'Cut the carrot and cucumber into matchsticks and finely shred the cabbage.',
          'Taillez la carotte et le concombre en allumettes et émincez finement le chou.',
          'Corta la zanahoria y el pepino en bastoncitos y la col en tiras muy finas.',
        ),
      },
      {
        text: t(
          'Toss the noodles and vegetables with the sauce. Top with chopped peanuts, cilantro and chili flakes if you like heat.',
          'Mélangez les nouilles et les légumes avec la sauce. Parsemez de cacahuètes concassées, de coriandre et de piment si vous aimez.',
          'Mezcla los fideos y las verduras con la salsa. Termina con cacahuetes picados, cilantro y guindilla si te gusta el picante.',
        ),
      },
    ],
  },
  {
    id: 'lu-spinach-feta-frittata',
    title: t('Spinach and Feta Frittata', 'Frittata aux épinards et à la feta', 'Frittata de espinacas y feta'),
    description: t(
      'A thick, golden frittata studded with spinach and salty feta. Lovely warm or cold in a lunchbox.',
      'Une frittata épaisse et dorée, garnie d’épinards et de feta. Délicieuse chaude ou froide dans une boîte à lunch.',
      'Una frittata gruesa y dorada con espinacas y feta salado. Buenísima caliente o fría en el táper.',
    ),
    emoji: '🍳',
    color: 'herb',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'quick'],
    tags: ['high-protein', 'meal-prep'],
    ingredients: [
      ing('egg', 8, 'pc'),
      ing('spinach', 200, 'g'),
      ing('feta', 120, 'g'),
      ing('spring_onion', 3, 'pc'),
      ing('milk', 50, 'ml'),
      ing('olive_oil', 1, 'tbsp'),
      ing('dill', 0.5, 'bunch', undefined, true),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Heat the grill (broiler) of your oven. Beat the eggs with the milk, a little salt and plenty of pepper.',
          'Préchauffez le gril du four. Battez les œufs avec le lait, un peu de sel et une bonne dose de poivre.',
          'Precalienta el gratinador del horno. Bate los huevos con la leche, un poco de sal y bastante pimienta.',
        ),
      },
      {
        text: t(
          'In an ovenproof pan, soften the sliced spring onions in the oil, then add the spinach and stir until wilted.',
          'Dans une poêle allant au four, faites revenir les oignons nouveaux émincés dans l’huile, puis ajoutez les épinards et remuez jusqu’à ce qu’ils tombent.',
          'En una sartén apta para horno, sofríe la cebolleta en rodajas con el aceite, añade las espinacas y remueve hasta que se reduzcan.',
        ),
        timerMinutes: 3,
      },
      {
        text: t(
          'Pour in the eggs, crumble over the feta and chopped dill, and cook gently over low heat until the edges are set.',
          'Versez les œufs, émiettez la feta et l’aneth ciselé par-dessus, puis laissez cuire doucement à feu doux jusqu’à ce que les bords prennent.',
          'Vierte los huevos, desmenuza el feta y el eneldo picado por encima y cuaja a fuego suave hasta que los bordes estén firmes.',
        ),
        timerMinutes: 10,
      },
      {
        text: t(
          'Slide the pan under the grill until the top is puffed and golden.',
          'Passez la poêle sous le gril jusqu’à ce que le dessus soit gonflé et doré.',
          'Pon la sartén bajo el gratinador hasta que la superficie esté hinchada y dorada.',
        ),
        timerMinutes: 4,
      },
      {
        text: t(
          'Let it rest a few minutes before cutting into wedges.',
          'Laissez reposer quelques minutes avant de couper en parts.',
          'Déjala reposar unos minutos antes de cortarla en porciones.',
        ),
        timerMinutes: 3,
      },
    ],
  },
  {
    id: 'lu-roasted-veg-quinoa-bowl',
    title: t('Roasted Veg Quinoa Bowl', 'Bol de quinoa aux légumes rôtis', 'Bol de quinoa con verduras asadas'),
    description: t(
      'Caramelised sweet potato, peppers and chickpeas over fluffy quinoa, finished with a lemony tahini drizzle.',
      'Patate douce caramélisée, poivrons et pois chiches rôtis sur un lit de quinoa, nappés d’une sauce tahini citronnée.',
      'Boniato caramelizado, pimientos y garbanzos asados sobre quinoa suelta, con un hilo de salsa de tahini y limón.',
    ),
    emoji: '🥙',
    color: 'peach',
    prepMinutes: 15,
    cookMinutes: 30,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'vegan', 'healthy'],
    tags: ['meal-prep', 'high-protein'],
    premium: true,
    ingredients: [
      ing('quinoa', 200, 'g'),
      ing('sweet_potato', 2, 'pc'),
      ing('bell_pepper', 2, 'pc'),
      ing('red_onion', 1, 'pc'),
      ing('chickpeas_canned', 1, 'can', t('drained', 'égouttés', 'escurridos')),
      ing('olive_oil', 3, 'tbsp'),
      ing('smoked_paprika', 1, 'tsp'),
      ing('tahini', 3, 'tbsp'),
      ing('lemon', 1, 'pc'),
      ing('arugula', 60, 'g'),
      salt,
    ],
    steps: [
      {
        text: t(
          'Heat the oven to 210 °C. Cube the sweet potatoes, cut the peppers and onion into chunks.',
          'Préchauffez le four à 210 °C. Coupez les patates douces en cubes, les poivrons et l’oignon en morceaux.',
          'Precalienta el horno a 210 °C. Corta los boniatos en dados y los pimientos y la cebolla en trozos.',
        ),
      },
      {
        text: t(
          'Toss the vegetables and chickpeas with the oil, paprika and salt on a large tray and roast, stirring halfway.',
          'Mélangez les légumes et les pois chiches avec l’huile, le paprika et du sel sur une grande plaque, puis enfournez en remuant à mi-cuisson.',
          'Mezcla las verduras y los garbanzos con el aceite, el pimentón y sal en una bandeja grande y ásalos, removiendo a media cocción.',
        ),
        timerMinutes: 30,
      },
      {
        text: t(
          'Meanwhile, rinse the quinoa and simmer it in twice its volume of salted water until the water is absorbed.',
          'Pendant ce temps, rincez le quinoa et faites-le cuire dans deux fois son volume d’eau salée jusqu’à absorption.',
          'Mientras tanto, enjuaga la quinoa y cuécela en el doble de su volumen de agua con sal hasta que la absorba.',
        ),
        timerMinutes: 15,
      },
      {
        text: t(
          'Whisk the tahini with the lemon juice and enough water to make a pourable sauce. Season with salt.',
          'Fouettez le tahini avec le jus de citron et assez d’eau pour obtenir une sauce fluide. Salez.',
          'Bate el tahini con el zumo de limón y agua suficiente para que quede una salsa fluida. Sazona.',
        ),
      },
      {
        text: t(
          'Divide the quinoa and arugula between bowls, top with the roasted vegetables and drizzle with the sauce.',
          'Répartissez le quinoa et la roquette dans les bols, ajoutez les légumes rôtis et nappez de sauce.',
          'Reparte la quinoa y la rúcula en cuencos, añade las verduras asadas y riega con la salsa.',
        ),
      },
    ],
  },
  {
    id: 'lu-minestrone',
    title: t('Hearty Minestrone', 'Minestrone copieux', 'Minestrone contundente'),
    description: t(
      'A chunky Italian-style vegetable soup with beans and small pasta. Even better the next day.',
      'Une soupe de légumes à l’italienne, bien garnie de haricots et de petites pâtes. Encore meilleure le lendemain.',
      'Una sopa de verduras a la italiana, con alubias y pasta pequeña. Al día siguiente está aún mejor.',
    ),
    emoji: '🍲',
    color: 'tomato',
    prepMinutes: 15,
    cookMinutes: 35,
    servings: 6,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'vegan'],
    tags: ['one-pot', 'freezer-friendly', 'budget'],
    ingredients: [
      ing('onion', 1, 'pc'),
      ing('carrot', 2, 'pc'),
      ing('celery', 2, 'pc', t('stalks', 'branches', 'ramas')),
      ing('zucchini', 1, 'pc'),
      ing('garlic', 2, 'clove'),
      ing('canned_tomatoes', 1, 'can'),
      ing('white_beans_canned', 1, 'can', t('drained', 'égouttés', 'escurridas')),
      ing('vegetable_broth', 1500, 'ml'),
      ing('pasta', 100, 'g', t('small shapes', 'petites pâtes', 'pasta pequeña')),
      ing('kale', 100, 'g'),
      ing('olive_oil', 2, 'tbsp'),
      ing('mixed_herbs', 1, 'tsp'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Dice the onion, carrots, celery and zucchini into small, even pieces. Slice the garlic.',
          'Coupez l’oignon, les carottes, le céleri et la courgette en petits dés réguliers. Émincez l’ail.',
          'Corta la cebolla, las zanahorias, el apio y el calabacín en dados pequeños e iguales. Lamina el ajo.',
        ),
      },
      {
        text: t(
          'Cook the onion, carrot and celery in the oil over medium heat until softened, then add the garlic and herbs.',
          'Faites revenir l’oignon, la carotte et le céleri dans l’huile à feu moyen jusqu’à ce qu’ils soient tendres, puis ajoutez l’ail et les herbes.',
          'Pocha la cebolla, la zanahoria y el apio en el aceite a fuego medio hasta que estén tiernos y añade el ajo y las hierbas.',
        ),
        timerMinutes: 8,
      },
      {
        text: t(
          'Add the zucchini, tomatoes and broth. Bring to a boil and simmer gently.',
          'Ajoutez la courgette, les tomates et le bouillon. Portez à ébullition et laissez frémir.',
          'Incorpora el calabacín, el tomate y el caldo. Lleva a ebullición y deja hervir suavemente.',
        ),
        timerMinutes: 15,
      },
      {
        text: t(
          'Stir in the pasta and beans and cook until the pasta is tender, adding the shredded kale for the last 3 minutes.',
          'Ajoutez les pâtes et les haricots et faites cuire jusqu’à ce que les pâtes soient tendres, en incorporant le chou kale émincé pour les 3 dernières minutes.',
          'Añade la pasta y las alubias y cuece hasta que la pasta esté tierna; incorpora la col kale picada en los últimos 3 minutos.',
        ),
        timerMinutes: 10,
      },
      {
        text: t(
          'Season to taste and serve with a drizzle of olive oil.',
          'Rectifiez l’assaisonnement et servez avec un filet d’huile d’olive.',
          'Rectifica de sal y pimienta y sirve con un chorrito de aceite de oliva.',
        ),
      },
    ],
  },
  {
    id: 'lu-spiced-chickpea-pita',
    title: t('Crispy Spiced Chickpea Pitas', 'Pitas aux pois chiches croustillants et épicés', 'Pitas de garbanzos crujientes especiados'),
    description: t(
      'Oven-crisped chickpeas with warm spices, stuffed into pitas with a cool yogurt, mint and cucumber sauce.',
      'Des pois chiches croustillants aux épices douces, glissés dans des pitas avec une sauce fraîche au yaourt, à la menthe et au concombre.',
      'Garbanzos crujientes al horno con especias, dentro de pitas con una salsa fresca de yogur, menta y pepino.',
    ),
    emoji: '🥙',
    color: 'saffron',
    prepMinutes: 10,
    cookMinutes: 25,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian'],
    tags: ['budget', 'high-protein'],
    premium: true,
    ingredients: [
      ing('chickpeas_canned', 1, 'can', t('drained', 'égouttés', 'escurridos')),
      ing('olive_oil', 2, 'tbsp'),
      ing('cumin', 1, 'tsp'),
      ing('smoked_paprika', 1, 'tsp'),
      ing('cinnamon', 1, 'pinch'),
      ing('greek_yogurt', 150, 'g'),
      ing('cucumber', 0.5, 'pc'),
      ing('mint', 0.5, 'bunch'),
      ing('garlic', 1, 'clove'),
      ing('pita', 2, 'pc'),
      ing('tomato', 1, 'pc'),
      salt,
    ],
    steps: [
      {
        text: t(
          'Heat the oven to 220 °C. Pat the chickpeas very dry with a clean towel.',
          'Préchauffez le four à 220 °C. Séchez soigneusement les pois chiches dans un torchon propre.',
          'Precalienta el horno a 220 °C. Seca muy bien los garbanzos con un paño limpio.',
        ),
      },
      {
        text: t(
          'Toss them with the oil, cumin, paprika, cinnamon and salt, spread on a tray and roast until crisp, shaking once.',
          'Enrobez-les d’huile, de cumin, de paprika, de cannelle et de sel, étalez-les sur une plaque et rôtissez-les jusqu’à ce qu’ils croustillent, en secouant une fois.',
          'Mézclalos con el aceite, el comino, el pimentón, la canela y sal, extiéndelos en una bandeja y ásalos hasta que crujan, moviéndolos una vez.',
        ),
        timerMinutes: 22,
      },
      {
        text: t(
          'Grate the cucumber, squeeze out the excess water and mix it with the yogurt, chopped mint, grated garlic and a pinch of salt.',
          'Râpez le concombre, pressez-le pour retirer l’eau, puis mélangez-le au yaourt avec la menthe ciselée, l’ail râpé et une pincée de sel.',
          'Ralla el pepino, escúrrelo bien y mézclalo con el yogur, la menta picada, el ajo rallado y una pizca de sal.',
        ),
      },
      {
        text: t(
          'Warm the pitas for the last 3 minutes in the oven, then open them up.',
          'Réchauffez les pitas au four pendant les 3 dernières minutes, puis ouvrez-les.',
          'Calienta las pitas en el horno los últimos 3 minutos y ábrelas.',
        ),
        timerMinutes: 3,
      },
      {
        text: t(
          'Fill with sliced tomato, the chickpeas and a generous spoonful of the yogurt sauce.',
          'Garnissez de rondelles de tomate, de pois chiches et d’une bonne cuillerée de sauce au yaourt.',
          'Rellénalas con rodajas de tomate, los garbanzos y una buena cucharada de salsa de yogur.',
        ),
      },
    ],
  },
  {
    id: 'lu-herby-tabbouleh',
    title: t('Herby Bulgur Tabbouleh', 'Taboulé libanais aux herbes', 'Tabulé de bulgur con hierbas'),
    description: t(
      'Mostly parsley and mint with a little bulgur, tomato and lemon: bright, fresh and made for warm days.',
      'Surtout du persil et de la menthe, avec un peu de boulgour, de la tomate et du citron : vif, frais et parfait aux beaux jours.',
      'Sobre todo perejil y menta, con un poco de bulgur, tomate y limón: fresco, vivo y perfecto para días de calor.',
    ),
    emoji: '🌿',
    color: 'herb',
    prepMinutes: 25,
    cookMinutes: 0,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'vegetarian', 'vegan', 'quick', 'healthy'],
    tags: ['mediterranean', 'light', 'no-cook'],
    ingredients: [
      ing('bulgur', 80, 'g', t('fine', 'fin', 'fino')),
      ing('parsley', 2, 'bunch', t('flat-leaf', 'plat', 'liso')),
      ing('mint', 1, 'bunch'),
      ing('tomato', 3, 'pc'),
      ing('spring_onion', 3, 'pc'),
      ing('lemon', 2, 'pc'),
      ing('olive_oil', 4, 'tbsp'),
      ing('water', 120, 'ml', t('boiling', 'bouillante', 'hirviendo')),
      salt,
    ],
    steps: [
      {
        text: t(
          'Pour the boiling water over the bulgur, cover and leave to swell.',
          'Versez l’eau bouillante sur le boulgour, couvrez et laissez gonfler.',
          'Vierte el agua hirviendo sobre el bulgur, tapa y deja que se hinche.',
        ),
        timerMinutes: 15,
      },
      {
        text: t(
          'Meanwhile, pick the herb leaves and chop them finely with a sharp knife, without bruising them.',
          'Pendant ce temps, effeuillez les herbes et hachez-les finement au couteau bien aiguisé, sans les écraser.',
          'Mientras tanto, deshoja las hierbas y pícalas finas con un cuchillo bien afilado, sin machacarlas.',
        ),
      },
      {
        text: t(
          'Dice the tomatoes small and thinly slice the spring onions.',
          'Coupez les tomates en petits dés et émincez finement les oignons nouveaux.',
          'Corta los tomates en dados pequeños y la cebolleta en rodajas finas.',
        ),
      },
      {
        text: t(
          'Fluff the bulgur with a fork, combine with the herbs, tomatoes and onions, then dress with the lemon juice, oil and salt.',
          'Égrainez le boulgour à la fourchette, mélangez-le aux herbes, aux tomates et aux oignons, puis assaisonnez de jus de citron, d’huile et de sel.',
          'Suelta el bulgur con un tenedor, mézclalo con las hierbas, el tomate y la cebolleta y aliña con el zumo de limón, el aceite y sal.',
        ),
      },
    ],
  },
  {
    id: 'lu-pesto-pasta-peas',
    title: t('Pesto Pasta with Peas', 'Pâtes au pesto et petits pois', 'Pasta al pesto con guisantes'),
    description: t(
      'Bright green, ready in the time it takes to boil pasta, and just as good cold the next day.',
      'D’un vert éclatant, prêtes le temps de cuire les pâtes, et tout aussi bonnes froides le lendemain.',
      'De un verde intenso, lista en lo que tarda en cocerse la pasta, y igual de rica fría al día siguiente.',
    ),
    emoji: '🍝',
    color: 'herb',
    prepMinutes: 5,
    cookMinutes: 12,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'quick'],
    tags: ['student', 'kid-friendly', 'budget'],
    ingredients: [
      ing('pasta', 200, 'g'),
      ing('frozen_peas', 150, 'g'),
      ing('pesto', 4, 'tbsp'),
      ing('parmesan', 20, 'g'),
      ing('lemon', 0.5, 'pc'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Cook the pasta in plenty of salted boiling water.',
          'Faites cuire les pâtes dans une grande quantité d’eau bouillante salée.',
          'Cuece la pasta en abundante agua hirviendo con sal.',
        ),
        timerMinutes: 10,
      },
      {
        text: t(
          'Add the peas to the pot for the last 2 minutes of cooking.',
          'Ajoutez les petits pois dans la casserole pour les 2 dernières minutes de cuisson.',
          'Añade los guisantes a la olla en los últimos 2 minutos de cocción.',
        ),
        timerMinutes: 2,
      },
      {
        text: t(
          'Keep a small cup of the cooking water, then drain.',
          'Réservez une petite tasse d’eau de cuisson, puis égouttez.',
          'Reserva una tacita del agua de cocción y escurre.',
        ),
      },
      {
        text: t(
          'Toss with the pesto, a splash of the water, a little lemon zest and juice. Finish with grated parmesan and pepper.',
          'Mélangez avec le pesto, un peu d’eau de cuisson, un peu de zeste et de jus de citron. Terminez avec du parmesan râpé et du poivre.',
          'Mezcla con el pesto, un chorrito del agua, un poco de ralladura y zumo de limón. Termina con parmesano rallado y pimienta.',
        ),
      },
    ],
  },
  {
    id: 'lu-roasted-tomato-soup',
    title: t('Roasted Tomato and Pepper Soup', 'Velouté de tomates et poivrons rôtis', 'Crema de tomate y pimiento asados'),
    description: t(
      'Roasting the tomatoes, peppers and garlic first gives this soup a deep, slightly smoky sweetness.',
      'Rôtir d’abord les tomates, les poivrons et l’ail donne à ce velouté une douceur profonde et légèrement fumée.',
      'Asar primero los tomates, los pimientos y el ajo le da a esta crema un dulzor profundo y algo ahumado.',
    ),
    emoji: '🍅',
    color: 'tomato',
    prepMinutes: 10,
    cookMinutes: 45,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'vegan', 'healthy'],
    tags: ['freezer-friendly', 'comfort'],
    premium: true,
    ingredients: [
      ing('tomato', 1000, 'g'),
      ing('bell_pepper', 2, 'pc', t('red', 'rouges', 'rojos')),
      ing('onion', 1, 'pc'),
      ing('garlic', 4, 'clove'),
      ing('olive_oil', 3, 'tbsp'),
      ing('smoked_paprika', 1, 'tsp'),
      ing('vegetable_broth', 500, 'ml'),
      ing('basil', 0.5, 'bunch'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Heat the oven to 200 °C. Halve the tomatoes, cut the peppers and onion into large pieces and leave the garlic unpeeled.',
          'Préchauffez le four à 200 °C. Coupez les tomates en deux, les poivrons et l’oignon en gros morceaux, et laissez l’ail en chemise.',
          'Precalienta el horno a 200 °C. Parte los tomates por la mitad, corta los pimientos y la cebolla en trozos grandes y deja los ajos con piel.',
        ),
      },
      {
        text: t(
          'Spread everything on a tray, drizzle with oil, sprinkle with paprika and salt, and roast until soft and charred at the edges.',
          'Étalez le tout sur une plaque, arrosez d’huile, saupoudrez de paprika et de sel, puis rôtissez jusqu’à ce que ce soit fondant et légèrement grillé.',
          'Extiende todo en una bandeja, riega con aceite, espolvorea pimentón y sal y asa hasta que esté blando y algo tostado por los bordes.',
        ),
        timerMinutes: 35,
      },
      {
        text: t(
          'Squeeze the garlic out of its skins and tip everything into a pot with the broth. Simmer briefly.',
          'Pressez l’ail pour le sortir de sa peau et versez le tout dans une casserole avec le bouillon. Laissez frémir quelques minutes.',
          'Saca los ajos de su piel y pasa todo a una olla con el caldo. Deja hervir suavemente unos minutos.',
        ),
        timerMinutes: 8,
      },
      {
        text: t(
          'Blend until smooth with most of the basil, season, and serve topped with the remaining leaves.',
          'Mixez finement avec la majeure partie du basilic, assaisonnez et servez parsemé des feuilles restantes.',
          'Tritura hasta que quede fina con casi toda la albahaca, sazona y sirve con las hojas que queden por encima.',
        ),
      },
    ],
  },
  {
    id: 'lu-ham-cheddar-toastie',
    title: t('Ham and Cheddar Toastie', 'Croque au jambon et au cheddar', 'Sándwich caliente de jamón y cheddar'),
    description: t(
      'Crisp, buttery bread with melting cheddar, ham and a thin layer of mustard. Pure comfort in ten minutes.',
      'Du pain croustillant et beurré, du cheddar fondant, du jambon et un soupçon de moutarde. Le réconfort en dix minutes.',
      'Pan crujiente con mantequilla, cheddar fundido, jamón y una capa fina de mostaza. Puro consuelo en diez minutos.',
    ),
    emoji: '🥪',
    color: 'saffron',
    prepMinutes: 5,
    cookMinutes: 8,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'quick'],
    tags: ['kid-friendly', 'student', 'comfort'],
    ingredients: [
      ing('bread', 4, 'slice'),
      ing('ham', 4, 'slice'),
      ing('cheddar', 100, 'g', t('grated', 'râpé', 'rallado')),
      ing('butter', 20, 'g', t('softened', 'ramolli', 'blanda')),
      ing('mustard', 2, 'tsp'),
    ],
    steps: [
      {
        text: t(
          'Butter one side of each slice of bread.',
          'Beurrez une face de chaque tranche de pain.',
          'Unta con mantequilla una cara de cada rebanada.',
        ),
      },
      {
        text: t(
          'Turn two slices butter-side down, spread with mustard, then layer with half the cheddar, the ham and the rest of the cheese.',
          'Retournez deux tranches côté beurre en dessous, tartinez de moutarde, puis superposez la moitié du cheddar, le jambon et le reste du fromage.',
          'Pon dos rebanadas con la mantequilla hacia abajo, úntalas con mostaza y cubre con la mitad del cheddar, el jamón y el resto del queso.',
        ),
      },
      {
        text: t(
          'Close with the remaining slices, butter-side up.',
          'Refermez avec les tranches restantes, côté beurre vers le haut.',
          'Tapa con las otras rebanadas, con la mantequilla hacia arriba.',
        ),
      },
      {
        text: t(
          'Cook in a pan over medium-low heat, pressing gently, until both sides are golden and the cheese has melted.',
          'Faites cuire dans une poêle à feu moyen-doux en pressant légèrement, jusqu’à ce que les deux faces soient dorées et le fromage fondu.',
          'Cocina en una sartén a fuego medio-bajo, presionando un poco, hasta que ambos lados estén dorados y el queso fundido.',
        ),
        timerMinutes: 7,
      },
    ],
  },
  {
    id: 'lu-salmon-rice-bowl',
    title: t('Soy-Glazed Salmon Rice Bowl', 'Bol de riz au saumon laqué au soja', 'Bol de arroz con salmón glaseado con soja'),
    description: t(
      'Sticky soy and ginger salmon over warm rice with avocado, cucumber and sesame. A colourful bowl worth packing.',
      'Un saumon laqué au soja et au gingembre sur du riz chaud, avec avocat, concombre et sésame. Un bol coloré qui donne envie.',
      'Salmón glaseado con soja y jengibre sobre arroz caliente, con aguacate, pepino y sésamo. Un bol lleno de color.',
    ),
    emoji: '🍣',
    color: 'ocean',
    prepMinutes: 15,
    cookMinutes: 20,
    servings: 2,
    difficulty: 'medium',
    categories: ['lunch', 'dinner', 'healthy'],
    tags: ['high-protein'],
    premium: true,
    ingredients: [
      ing('salmon_fillet', 2, 'pc'),
      ing('rice', 150, 'g'),
      ing('soy_sauce', 3, 'tbsp'),
      ing('maple_syrup', 1, 'tbsp'),
      ing('ginger', 10, 'g'),
      ing('garlic', 1, 'clove'),
      ing('avocado', 1, 'pc'),
      ing('cucumber', 0.5, 'pc'),
      ing('spring_onion', 2, 'pc'),
      ing('sesame_seeds', 1, 'tbsp'),
      ing('vinegar', 1, 'tbsp', t('rice vinegar if possible', 'de riz si possible', 'de arroz si es posible')),
      ing('vegetable_oil', 1, 'tsp'),
    ],
    steps: [
      {
        text: t(
          'Rinse the rice and cook it with 1.5 times its volume of water, covered, over low heat. Let it stand off the heat for 5 minutes.',
          'Rincez le riz et faites-le cuire à couvert et à feu doux avec 1,5 fois son volume d’eau. Laissez reposer 5 minutes hors du feu.',
          'Enjuaga el arroz y cuécelo tapado a fuego bajo con 1,5 veces su volumen de agua. Déjalo reposar 5 minutos fuera del fuego.',
        ),
        timerMinutes: 15,
      },
      {
        text: t(
          'Mix the soy sauce, maple syrup, grated ginger and garlic. Thinly slice the cucumber and toss it with the vinegar.',
          'Mélangez la sauce soja, le sirop d’érable, le gingembre et l’ail râpés. Émincez finement le concombre et arrosez-le de vinaigre.',
          'Mezcla la soja, el sirope de arce, el jengibre y el ajo rallados. Corta el pepino en láminas finas y alíñalo con el vinagre.',
        ),
      },
      {
        text: t(
          'Sear the salmon skin-side down in the oil over medium-high heat, then turn and cook until just done.',
          'Saisissez le saumon côté peau dans l’huile à feu moyen-vif, puis retournez-le et terminez la cuisson en le gardant fondant.',
          'Marca el salmón con la piel hacia abajo en el aceite a fuego medio-alto, dale la vuelta y cocínalo hasta que esté justo hecho.',
        ),
        timerMinutes: 7,
      },
      {
        text: t(
          'Pour in the sauce and let it bubble for a minute, spooning it over the fish until glossy.',
          'Versez la sauce et laissez-la bouillonner une minute en arrosant le poisson jusqu’à ce qu’il soit bien laqué.',
          'Vierte la salsa y deja que burbujee un minuto, regando el pescado hasta que quede brillante.',
        ),
        timerMinutes: 1,
      },
      {
        text: t(
          'Fill bowls with rice, add the salmon, sliced avocado and cucumber, then scatter with spring onion and sesame.',
          'Garnissez les bols de riz, ajoutez le saumon, l’avocat en tranches et le concombre, puis parsemez d’oignon nouveau et de sésame.',
          'Sirve el arroz en cuencos, añade el salmón, el aguacate en láminas y el pepino, y espolvorea cebolleta y sésamo.',
        ),
      },
    ],
  },
  {
    id: 'lu-chicken-noodle-soup',
    title: t('Chicken Noodle Soup', 'Soupe de poulet aux nouilles', 'Sopa de pollo con fideos'),
    description: t(
      'A gently simmered broth with tender chicken, soft vegetables and egg noodles, the kind of bowl that warms you up.',
      'Un bouillon mijoté doucement avec du poulet tendre, des légumes fondants et des nouilles aux œufs, de quoi bien se réchauffer.',
      'Un caldo cocido a fuego lento con pollo tierno, verduras suaves y fideos al huevo, de los que reconfortan.',
    ),
    emoji: '🍜',
    color: 'saffron',
    prepMinutes: 15,
    cookMinutes: 30,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'dinner'],
    tags: ['comfort', 'family', 'one-pot'],
    ingredients: [
      ing('chicken_breast', 400, 'g'),
      ing('chicken_broth', 1500, 'ml'),
      ing('egg_noodles', 150, 'g'),
      ing('onion', 1, 'pc'),
      ing('carrot', 2, 'pc'),
      ing('celery', 2, 'pc', t('stalks', 'branches', 'ramas')),
      ing('garlic', 2, 'clove'),
      ing('thyme', 0.5, 'tsp'),
      ing('bay_leaf', 1, 'pc'),
      ing('olive_oil', 1, 'tbsp'),
      ing('parsley', 0.5, 'bunch'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Dice the onion, slice the carrots and celery, and mince the garlic.',
          'Émincez l’oignon, coupez les carottes et le céleri en rondelles, et hachez l’ail.',
          'Pica la cebolla, corta las zanahorias y el apio en rodajas y pica el ajo.',
        ),
      },
      {
        text: t(
          'Soften the vegetables in the oil in a large pot, then add the garlic, thyme and bay leaf.',
          'Faites revenir les légumes dans l’huile dans une grande casserole, puis ajoutez l’ail, le thym et le laurier.',
          'Pocha las verduras en el aceite en una olla grande y añade el ajo, el tomillo y el laurel.',
        ),
        timerMinutes: 6,
      },
      {
        text: t(
          'Pour in the broth, add the whole chicken breasts and simmer gently until cooked through.',
          'Versez le bouillon, ajoutez les blancs de poulet entiers et laissez frémir jusqu’à ce qu’ils soient bien cuits.',
          'Vierte el caldo, añade las pechugas enteras y deja hervir suavemente hasta que estén hechas.',
        ),
        timerMinutes: 15,
      },
      {
        text: t(
          'Lift out the chicken and shred it with two forks. Add the noodles to the pot and cook until tender.',
          'Retirez le poulet et effilochez-le avec deux fourchettes. Ajoutez les nouilles dans la casserole et faites-les cuire.',
          'Saca el pollo y desmenúzalo con dos tenedores. Echa los fideos a la olla y cuécelos hasta que estén tiernos.',
        ),
        timerMinutes: 6,
      },
      {
        text: t(
          'Return the chicken, remove the bay leaf, season and finish with chopped parsley.',
          'Remettez le poulet, retirez le laurier, assaisonnez et terminez avec du persil haché.',
          'Devuelve el pollo a la olla, retira el laurel, sazona y termina con perejil picado.',
        ),
      },
    ],
  },
  {
    id: 'lu-shrimp-avocado-salad',
    title: t('Shrimp, Avocado and Mango Salad', 'Salade de crevettes, avocat et mangue', 'Ensalada de gambas, aguacate y mango'),
    description: t(
      'Quickly seared garlic shrimp with creamy avocado, juicy mango and a zesty lime and chili dressing.',
      'Des crevettes saisies à l’ail, de l’avocat crémeux et de la mangue juteuse, avec une vinaigrette citron vert et piment.',
      'Gambas salteadas con ajo, aguacate cremoso y mango jugoso, con un aliño vivo de lima y guindilla.',
    ),
    emoji: '🦐',
    color: 'peach',
    prepMinutes: 15,
    cookMinutes: 5,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'quick', 'healthy'],
    tags: ['light', 'high-protein'],
    premium: true,
    ingredients: [
      ing('shrimp', 250, 'g', t('peeled', 'décortiquées', 'peladas')),
      ing('avocado', 1, 'pc'),
      ing('mango', 1, 'pc'),
      ing('lettuce', 1, 'pc', t('small head', 'petite', 'pequeña')),
      ing('red_onion', 0.25, 'pc'),
      ing('cilantro', 0.5, 'bunch'),
      ing('lime', 2, 'pc'),
      ing('chili_pepper', 0.5, 'pc'),
      ing('garlic', 1, 'clove'),
      ing('olive_oil', 3, 'tbsp'),
      salt,
    ],
    steps: [
      {
        text: t(
          'Peel and dice the mango and avocado. Slice the onion and chili very thinly.',
          'Pelez et coupez la mangue et l’avocat en dés. Émincez très finement l’oignon et le piment.',
          'Pela y corta en dados el mango y el aguacate. Corta la cebolla y la guindilla muy finas.',
        ),
      },
      {
        text: t(
          'Whisk the juice of the limes with 2 tbsp oil, the chili and a pinch of salt.',
          'Fouettez le jus des citrons verts avec 2 c. à s. d’huile, le piment et une pincée de sel.',
          'Bate el zumo de las limas con 2 cucharadas de aceite, la guindilla y una pizca de sal.',
        ),
      },
      {
        text: t(
          'Sear the shrimp in the remaining oil with the crushed garlic over high heat until pink.',
          'Saisissez les crevettes à feu vif dans le reste d’huile avec l’ail écrasé, jusqu’à ce qu’elles soient roses.',
          'Saltea las gambas a fuego fuerte en el resto del aceite con el ajo machacado hasta que estén rosadas.',
        ),
        timerMinutes: 3,
      },
      {
        text: t(
          'Arrange the lettuce, mango, avocado and onion on plates, add the warm shrimp, spoon over the dressing and scatter with cilantro.',
          'Disposez la salade, la mangue, l’avocat et l’oignon dans les assiettes, ajoutez les crevettes chaudes, arrosez de vinaigrette et parsemez de coriandre.',
          'Coloca la lechuga, el mango, el aguacate y la cebolla en los platos, añade las gambas calientes, riega con el aliño y termina con cilantro.',
        ),
      },
    ],
  },
  {
    id: 'lu-veggie-egg-fried-rice',
    title: t('Veggie Egg Fried Rice', 'Riz sauté aux œufs et aux légumes', 'Arroz frito con huevo y verduras'),
    description: t(
      'The best way to use up yesterday’s rice: smoky wok-style rice with egg, peas, carrot and spring onion.',
      'La meilleure façon d’utiliser le riz de la veille : un riz sauté façon wok avec œuf, petits pois, carotte et oignon nouveau.',
      'La mejor forma de aprovechar el arroz del día anterior: arroz salteado al estilo wok con huevo, guisantes, zanahoria y cebolleta.',
    ),
    emoji: '🍚',
    color: 'saffron',
    prepMinutes: 10,
    cookMinutes: 10,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'quick'],
    tags: ['budget', 'student', 'kid-friendly'],
    ingredients: [
      ing('rice', 400, 'g', t('cooked and cold', 'cuit et froid', 'cocido y frío')),
      ing('egg', 3, 'pc'),
      ing('frozen_peas', 100, 'g'),
      ing('carrot', 1, 'pc'),
      ing('spring_onion', 3, 'pc'),
      ing('garlic', 1, 'clove'),
      ing('soy_sauce', 2, 'tbsp'),
      ing('sesame_oil', 1, 'tsp'),
      ing('vegetable_oil', 2, 'tbsp'),
    ],
    steps: [
      {
        text: t(
          'Finely dice the carrot, slice the spring onions and mince the garlic. Break up any clumps in the rice.',
          'Coupez la carotte en petits dés, émincez les oignons nouveaux et hachez l’ail. Égrainez le riz avec les doigts.',
          'Corta la zanahoria en daditos, la cebolleta en rodajas y pica el ajo. Separa los grumos del arroz.',
        ),
      },
      {
        text: t(
          'Heat half the oil in a wok or large pan until very hot, scramble the beaten eggs briefly and set aside.',
          'Faites chauffer la moitié de l’huile dans un wok ou une grande poêle, brouillez rapidement les œufs battus et réservez.',
          'Calienta bien la mitad del aceite en un wok o sartén grande, revuelve rápido los huevos batidos y resérvalos.',
        ),
      },
      {
        text: t(
          'Add the rest of the oil and stir-fry the carrot, peas and garlic for 2 minutes.',
          'Ajoutez le reste d’huile et faites sauter la carotte, les petits pois et l’ail pendant 2 minutes.',
          'Añade el resto del aceite y saltea la zanahoria, los guisantes y el ajo 2 minutos.',
        ),
        timerMinutes: 2,
      },
      {
        text: t(
          'Add the rice and fry, tossing, until hot and slightly toasted. Stir in the soy sauce, eggs, spring onion and sesame oil.',
          'Ajoutez le riz et faites-le sauter jusqu’à ce qu’il soit bien chaud et légèrement grillé. Incorporez la sauce soja, les œufs, l’oignon nouveau et l’huile de sésame.',
          'Añade el arroz y saltea hasta que esté caliente y algo tostado. Incorpora la soja, el huevo, la cebolleta y el aceite de sésamo.',
        ),
        timerMinutes: 4,
      },
    ],
  },
  {
    id: 'lu-caprese-baguette',
    title: t('Caprese Baguette', 'Baguette caprese', 'Bocadillo caprese'),
    description: t(
      'Fresh mozzarella, ripe tomato and basil with a smear of pesto in a crusty baguette. Simple, and all about good ingredients.',
      'Mozzarella fraîche, tomate bien mûre et basilic avec un peu de pesto dans une baguette croustillante. Simple, tout repose sur de bons produits.',
      'Mozzarella fresca, tomate maduro y albahaca con un poco de pesto en una baguette crujiente. Sencillo y con buen producto.',
    ),
    emoji: '🥖',
    color: 'berry',
    prepMinutes: 10,
    cookMinutes: 0,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'vegetarian', 'quick'],
    tags: ['no-cook', 'mediterranean'],
    ingredients: [
      ing('baguette', 1, 'pc'),
      ing('mozzarella', 1, 'pc', t('125 g ball', 'boule de 125 g', 'bola de 125 g')),
      ing('tomato', 2, 'pc'),
      ing('basil', 0.5, 'bunch'),
      ing('pesto', 2, 'tbsp'),
      ing('balsamic_vinegar', 1, 'tsp', undefined, true),
      ing('olive_oil', 1, 'tbsp'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Slice the tomatoes and mozzarella and season the tomatoes with salt and pepper.',
          'Tranchez les tomates et la mozzarella, puis salez et poivrez les tomates.',
          'Corta en rodajas los tomates y la mozzarella y salpimienta el tomate.',
        ),
      },
      {
        text: t(
          'Cut the baguette in two and split each piece lengthways. Spread the inside with pesto.',
          'Coupez la baguette en deux puis ouvrez chaque morceau dans la longueur. Tartinez l’intérieur de pesto.',
          'Corta la baguette en dos y abre cada trozo a lo largo. Unta el interior con pesto.',
        ),
      },
      {
        text: t(
          'Layer the tomato, mozzarella and basil leaves, then drizzle with olive oil and a few drops of balsamic.',
          'Garnissez de tomate, de mozzarella et de feuilles de basilic, puis arrosez d’huile d’olive et de quelques gouttes de balsamique.',
          'Rellena con tomate, mozzarella y hojas de albahaca y riega con aceite de oliva y unas gotas de balsámico.',
        ),
      },
    ],
  },
  {
    id: 'lu-turkey-taco-bowl',
    title: t('Turkey Taco Rice Bowls', 'Bols de riz façon tacos à la dinde', 'Boles de arroz estilo taco con pavo'),
    description: t(
      'Spiced turkey, black beans and corn over rice, topped with salsa and avocado. Batch it for easy lunches all week.',
      'De la dinde épicée, des haricots noirs et du maïs sur du riz, avec salsa et avocat. À préparer en grande quantité pour la semaine.',
      'Pavo especiado, frijoles negros y maíz sobre arroz, con salsa y aguacate. Haz de más y tendrás comidas para toda la semana.',
    ),
    emoji: '🌮',
    color: 'tomato',
    prepMinutes: 10,
    cookMinutes: 25,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'dinner'],
    tags: ['meal-prep', 'high-protein', 'family'],
    ingredients: [
      ing('ground_turkey', 500, 'g'),
      ing('rice', 250, 'g'),
      ing('black_beans_canned', 1, 'can', t('drained', 'égouttés', 'escurridos')),
      ing('canned_corn', 150, 'g'),
      ing('onion', 1, 'pc'),
      ing('chili_powder', 2, 'tsp'),
      ing('cumin', 1, 'tsp'),
      ing('tomato_paste', 1, 'tbsp'),
      ing('salsa', 8, 'tbsp'),
      ing('avocado', 1, 'pc'),
      ing('lime', 1, 'pc'),
      ing('vegetable_oil', 1, 'tbsp'),
      salt,
    ],
    steps: [
      {
        text: t(
          'Cook the rice in salted water according to the packet.',
          'Faites cuire le riz dans de l’eau salée selon les indications du paquet.',
          'Cuece el arroz en agua con sal según el paquete.',
        ),
        timerMinutes: 15,
      },
      {
        text: t(
          'Meanwhile, soften the chopped onion in the oil, then add the turkey and brown it, breaking it up with a spoon.',
          'Pendant ce temps, faites revenir l’oignon haché dans l’huile, puis ajoutez la dinde et faites-la dorer en l’émiettant à la cuillère.',
          'Mientras tanto, sofríe la cebolla picada en el aceite, añade el pavo y dóralo deshaciéndolo con una cuchara.',
        ),
        timerMinutes: 8,
      },
      {
        text: t(
          'Stir in the spices, tomato paste and a splash of water, then the beans and corn. Simmer until thick.',
          'Ajoutez les épices, le concentré de tomate et un peu d’eau, puis les haricots et le maïs. Laissez mijoter jusqu’à ce que ce soit épais.',
          'Incorpora las especias, el tomate concentrado y un chorrito de agua, y luego los frijoles y el maíz. Cuece hasta que espese.',
        ),
        timerMinutes: 6,
      },
      {
        text: t(
          'Divide the rice and turkey mixture between bowls or containers. Top with salsa, sliced avocado and a squeeze of lime.',
          'Répartissez le riz et la préparation à la dinde dans des bols ou des boîtes. Ajoutez la salsa, l’avocat en tranches et un filet de citron vert.',
          'Reparte el arroz y el pavo en cuencos o tápers. Cubre con salsa, aguacate en láminas y un chorrito de lima.',
        ),
      },
    ],
  },
  {
    id: 'lu-moroccan-couscous-salad',
    title: t('Moroccan-Style Couscous Salad', 'Salade de couscous à la marocaine', 'Ensalada de cuscús a la marroquí'),
    description: t(
      'Fluffy couscous with chickpeas, raisins, warm spices and fresh mint. Sweet, savoury and perfect for packed lunches.',
      'Un couscous léger avec pois chiches, raisins secs, épices douces et menthe fraîche. Sucré-salé et idéal à emporter.',
      'Cuscús suelto con garbanzos, pasas, especias suaves y menta fresca. Dulce y salado, ideal para llevar.',
    ),
    emoji: '🥗',
    color: 'saffron',
    prepMinutes: 15,
    cookMinutes: 5,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'vegetarian', 'vegan', 'quick', 'healthy'],
    tags: ['meal-prep', 'budget'],
    ingredients: [
      ing('couscous', 200, 'g'),
      ing('vegetable_broth', 250, 'ml', t('hot', 'chaud', 'caliente')),
      ing('chickpeas_canned', 1, 'can', t('drained', 'égouttés', 'escurridos')),
      ing('raisins', 40, 'g'),
      ing('red_onion', 0.5, 'pc'),
      ing('bell_pepper', 1, 'pc'),
      ing('cucumber', 0.5, 'pc'),
      ing('mint', 0.5, 'bunch'),
      ing('cumin', 1, 'tsp'),
      ing('cinnamon', 0.5, 'tsp'),
      ing('lemon', 1, 'pc'),
      ing('olive_oil', 3, 'tbsp'),
      ing('almonds', 30, 'g', t('toasted', 'grillées', 'tostadas'), true),
      salt,
    ],
    steps: [
      {
        text: t(
          'Put the couscous, raisins, cumin and cinnamon in a bowl, pour over the hot broth, cover and leave to swell.',
          'Mettez le couscous, les raisins secs, le cumin et la cannelle dans un saladier, versez le bouillon chaud, couvrez et laissez gonfler.',
          'Pon el cuscús, las pasas, el comino y la canela en un bol, vierte el caldo caliente, tapa y deja que se hinche.',
        ),
        timerMinutes: 5,
      },
      {
        text: t(
          'Dice the pepper, cucumber and onion and chop the mint.',
          'Coupez le poivron, le concombre et l’oignon en dés et ciselez la menthe.',
          'Corta en dados el pimiento, el pepino y la cebolla y pica la menta.',
        ),
      },
      {
        text: t(
          'Fluff the couscous with a fork and drizzle in the olive oil and lemon juice.',
          'Égrainez le couscous à la fourchette, puis arrosez d’huile d’olive et de jus de citron.',
          'Suelta el cuscús con un tenedor y aliña con el aceite de oliva y el zumo de limón.',
        ),
      },
      {
        text: t(
          'Fold in the chickpeas, vegetables and mint, season with salt and top with chopped almonds if using.',
          'Incorporez les pois chiches, les légumes et la menthe, salez et parsemez d’amandes concassées si vous le souhaitez.',
          'Añade los garbanzos, las verduras y la menta, sala y espolvorea almendras picadas si quieres.',
        ),
      },
    ],
  },
  {
    id: 'lu-chorizo-potato-tortilla',
    title: t('Potato and Chorizo Tortilla', 'Tortilla espagnole au chorizo', 'Tortilla de patatas con chorizo'),
    description: t(
      'A thick Spanish-style omelette with slow-cooked potato, onion and smoky chorizo. Serve warm or at room temperature.',
      'Une omelette épaisse à l’espagnole avec pommes de terre fondantes, oignon et chorizo fumé. À servir tiède ou à température ambiante.',
      'Una tortilla gruesa con patata y cebolla pochadas y chorizo ahumado. Está rica templada o a temperatura ambiente.',
    ),
    emoji: '🥚',
    color: 'berry',
    prepMinutes: 15,
    cookMinutes: 35,
    servings: 4,
    difficulty: 'medium',
    categories: ['lunch', 'dinner'],
    tags: ['family', 'high-protein'],
    premium: true,
    ingredients: [
      ing('potato', 600, 'g'),
      ing('onion', 1, 'pc'),
      ing('chorizo', 100, 'g'),
      ing('egg', 6, 'pc'),
      ing('olive_oil', 6, 'tbsp'),
      ing('parsley', 0.25, 'bunch', undefined, true),
      salt,
    ],
    steps: [
      {
        text: t(
          'Peel the potatoes and slice them thinly. Slice the onion and dice the chorizo.',
          'Épluchez les pommes de terre et coupez-les en fines tranches. Émincez l’oignon et coupez le chorizo en dés.',
          'Pela las patatas y córtalas en láminas finas. Corta la cebolla en juliana y el chorizo en dados.',
        ),
      },
      {
        text: t(
          'Cook the potatoes and onion gently in the oil in a covered pan, stirring now and then, until very tender but not browned.',
          'Faites cuire doucement les pommes de terre et l’oignon dans l’huile, à couvert, en remuant de temps en temps, jusqu’à ce qu’ils soient très tendres sans dorer.',
          'Pocha las patatas y la cebolla a fuego suave en el aceite, tapadas y removiendo de vez en cuando, hasta que estén muy tiernas sin dorarse.',
        ),
        timerMinutes: 20,
      },
      {
        text: t(
          'Add the chorizo for the last 3 minutes, then drain off most of the oil and keep it.',
          'Ajoutez le chorizo pour les 3 dernières minutes, puis égouttez la majeure partie de l’huile et réservez-la.',
          'Añade el chorizo en los últimos 3 minutos y escurre casi todo el aceite, reservándolo.',
        ),
        timerMinutes: 3,
      },
      {
        text: t(
          'Beat the eggs with salt, stir in the warm potato mixture and leave to sit for a few minutes.',
          'Battez les œufs avec du sel, incorporez la préparation de pommes de terre encore chaude et laissez reposer quelques minutes.',
          'Bate los huevos con sal, mezcla con las patatas aún calientes y deja reposar unos minutos.',
        ),
        timerMinutes: 5,
      },
      {
        text: t(
          'Heat 1 tbsp of the reserved oil in a smaller pan, pour in the mixture and cook over low heat until almost set.',
          'Faites chauffer 1 c. à s. de l’huile réservée dans une poêle plus petite, versez la préparation et faites cuire à feu doux jusqu’à ce qu’elle soit presque prise.',
          'Calienta 1 cucharada del aceite reservado en una sartén más pequeña, vierte la mezcla y cuaja a fuego bajo hasta que esté casi hecha.',
        ),
        timerMinutes: 6,
      },
      {
        text: t(
          'Flip it onto a plate, slide it back into the pan and cook the other side for 2–3 minutes. Rest before slicing.',
          'Retournez-la sur une assiette, faites-la glisser à nouveau dans la poêle et faites cuire l’autre face 2 à 3 minutes. Laissez reposer avant de couper.',
          'Dale la vuelta con ayuda de un plato, vuelve a deslizarla en la sartén y cuaja el otro lado 2 o 3 minutos. Deja reposar antes de cortar.',
        ),
        timerMinutes: 3,
      },
    ],
  },
  {
    id: 'lu-zucchini-goat-cheese-tart',
    title: t('Zucchini and Goat Cheese Tart', 'Tarte fine courgette et chèvre', 'Tarta de calabacín y queso de cabra'),
    description: t(
      'Flaky puff pastry topped with ribbons of zucchini, creamy goat cheese and thyme. Lovely with a green salad.',
      'Une pâte feuilletée croustillante garnie de rubans de courgette, de chèvre fondant et de thym. Parfaite avec une salade verte.',
      'Hojaldre crujiente cubierto con láminas de calabacín, queso de cabra cremoso y tomillo. Ideal con una ensalada verde.',
    ),
    emoji: '🥧',
    color: 'olive',
    prepMinutes: 15,
    cookMinutes: 25,
    servings: 4,
    difficulty: 'medium',
    categories: ['lunch', 'dinner', 'vegetarian'],
    tags: ['family'],
    premium: true,
    ingredients: [
      ing('puff_pastry', 1, 'pack', t('ready-rolled sheet', 'pâte déroulée', 'lámina extendida')),
      ing('zucchini', 2, 'pc'),
      ing('goat_cheese', 150, 'g'),
      ing('cream_cheese', 100, 'g'),
      ing('garlic', 1, 'clove'),
      ing('thyme', 1, 'tsp'),
      ing('olive_oil', 1, 'tbsp'),
      ing('lemon', 0.5, 'pc'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Heat the oven to 200 °C. Unroll the pastry onto a lined tray and score a border 2 cm from the edge without cutting through.',
          'Préchauffez le four à 200 °C. Déroulez la pâte sur une plaque recouverte de papier cuisson et tracez une bordure à 2 cm du bord sans la percer.',
          'Precalienta el horno a 200 °C. Extiende el hojaldre en una bandeja con papel y marca un borde a 2 cm sin llegar a cortarlo.',
        ),
      },
      {
        text: t(
          'Mix the cream cheese with grated garlic, lemon zest, pepper and half the goat cheese. Spread inside the border.',
          'Mélangez le fromage frais avec l’ail râpé, le zeste de citron, du poivre et la moitié du chèvre. Étalez à l’intérieur de la bordure.',
          'Mezcla el queso crema con el ajo rallado, la ralladura de limón, pimienta y la mitad del queso de cabra. Extiéndelo dentro del borde.',
        ),
      },
      {
        text: t(
          'Shave the zucchini into thin ribbons with a peeler, toss with the oil and a pinch of salt and arrange on top.',
          'Taillez les courgettes en fins rubans à l’économe, mélangez-les avec l’huile et une pincée de sel, puis disposez-les sur la tarte.',
          'Corta los calabacines en tiras finas con un pelador, mézclalas con el aceite y una pizca de sal y colócalas encima.',
        ),
      },
      {
        text: t(
          'Crumble over the rest of the goat cheese and sprinkle with thyme.',
          'Émiettez le reste du chèvre par-dessus et parsemez de thym.',
          'Desmenuza el resto del queso de cabra por encima y espolvorea el tomillo.',
        ),
      },
      {
        text: t(
          'Bake until the pastry is puffed and deep golden. Let it cool for 5 minutes before cutting.',
          'Enfournez jusqu’à ce que la pâte soit bien gonflée et dorée. Laissez tiédir 5 minutes avant de découper.',
          'Hornea hasta que el hojaldre esté hinchado y bien dorado. Deja templar 5 minutos antes de cortar.',
        ),
        timerMinutes: 25,
      },
    ],
  },
  {
    id: 'lu-sticky-tofu-broccoli-bowl',
    title: t('Sticky Tofu and Broccoli Bowl', 'Bol de tofu laqué et brocoli', 'Bol de tofu glaseado con brócoli'),
    description: t(
      'Golden tofu cubes in a glossy soy, ginger and garlic glaze, with tender broccoli over rice.',
      'Des cubes de tofu dorés dans une sauce brillante au soja, gingembre et ail, avec du brocoli tendre sur du riz.',
      'Dados de tofu dorados en un glaseado brillante de soja, jengibre y ajo, con brócoli tierno sobre arroz.',
    ),
    emoji: '🥦',
    color: 'ocean',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 2,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'vegan', 'quick', 'healthy'],
    tags: ['high-protein', 'meal-prep'],
    ingredients: [
      ing('tofu', 400, 'g', t('firm', 'ferme', 'firme')),
      ing('broccoli', 1, 'pc'),
      ing('rice', 150, 'g'),
      ing('soy_sauce', 3, 'tbsp'),
      ing('maple_syrup', 1, 'tbsp'),
      ing('ginger', 15, 'g'),
      ing('garlic', 2, 'clove'),
      ing('cornstarch', 1, 'tbsp'),
      ing('vegetable_oil', 2, 'tbsp'),
      ing('sesame_seeds', 1, 'tbsp'),
    ],
    steps: [
      {
        text: t(
          'Start cooking the rice. Press the tofu between paper towels, cut it into cubes and toss with the cornstarch.',
          'Lancez la cuisson du riz. Pressez le tofu entre du papier absorbant, coupez-le en cubes et enrobez-le de fécule.',
          'Pon a cocer el arroz. Presiona el tofu entre papel de cocina, córtalo en dados y rebózalo con la maicena.',
        ),
        timerMinutes: 15,
      },
      {
        text: t(
          'Fry the tofu in the oil over medium-high heat, turning, until crisp and golden on all sides.',
          'Faites dorer le tofu dans l’huile à feu moyen-vif, en le retournant, jusqu’à ce qu’il soit croustillant de tous les côtés.',
          'Fríe el tofu en el aceite a fuego medio-alto, dándole vueltas, hasta que esté crujiente y dorado por todos lados.',
        ),
        timerMinutes: 8,
      },
      {
        text: t(
          'Meanwhile, cut the broccoli into florets and steam or boil until just tender.',
          'Pendant ce temps, détaillez le brocoli en fleurettes et faites-le cuire à la vapeur ou à l’eau en le gardant croquant.',
          'Mientras tanto, separa el brócoli en ramilletes y cuécelo al vapor o en agua hasta que esté tierno pero firme.',
        ),
        timerMinutes: 4,
      },
      {
        text: t(
          'Mix the soy sauce, maple syrup, grated ginger and garlic with 3 tbsp water. Pour into the pan and toss until the tofu is glazed.',
          'Mélangez la sauce soja, le sirop d’érable, le gingembre et l’ail râpés avec 3 c. à s. d’eau. Versez dans la poêle et remuez jusqu’à ce que le tofu soit laqué.',
          'Mezcla la soja, el sirope de arce, el jengibre y el ajo rallados con 3 cucharadas de agua. Viértelo en la sartén y remueve hasta que el tofu quede glaseado.',
        ),
      },
      {
        text: t(
          'Serve over the rice with the broccoli and a sprinkle of sesame seeds.',
          'Servez sur le riz avec le brocoli et parsemez de graines de sésame.',
          'Sirve sobre el arroz con el brócoli y espolvorea sésamo.',
        ),
      },
    ],
  },
  {
    id: 'lu-warm-lentil-goat-cheese-salad',
    title: t('Warm Lentil Salad with Goat Cheese', 'Salade tiède de lentilles au chèvre', 'Ensalada templada de lentejas con queso de cabra'),
    description: t(
      'Earthy lentils in a mustard vinaigrette with roasted beetroot, walnuts and creamy goat cheese.',
      'Des lentilles en vinaigrette moutardée avec de la betterave, des noix et du chèvre crémeux.',
      'Lentejas con vinagreta de mostaza, remolacha, nueces y queso de cabra cremoso.',
    ),
    emoji: '🥗',
    color: 'berry',
    prepMinutes: 10,
    cookMinutes: 25,
    servings: 4,
    difficulty: 'easy',
    categories: ['lunch', 'dinner', 'vegetarian', 'healthy'],
    tags: ['meal-prep', 'high-protein'],
    ingredients: [
      ing('lentils', 250, 'g', t('green or brown', 'vertes ou brunes', 'pardinas o verdes')),
      ing('beetroot', 2, 'pc', t('cooked', 'cuites', 'cocidas')),
      ing('goat_cheese', 120, 'g'),
      ing('walnuts', 40, 'g'),
      ing('arugula', 60, 'g'),
      ing('shallot', 1, 'pc'),
      ing('mustard', 1, 'tbsp'),
      ing('vinegar', 2, 'tbsp'),
      ing('olive_oil', 4, 'tbsp'),
      ing('bay_leaf', 1, 'pc'),
      salt,
      pepper,
    ],
    steps: [
      {
        text: t(
          'Rinse the lentils and simmer them with the bay leaf in plenty of unsalted water until tender but still holding their shape.',
          'Rincez les lentilles et faites-les cuire avec le laurier dans une grande quantité d’eau non salée, jusqu’à ce qu’elles soient tendres mais encore entières.',
          'Enjuaga las lentejas y cuécelas con el laurel en abundante agua sin sal hasta que estén tiernas pero enteras.',
        ),
        timerMinutes: 22,
      },
      {
        text: t(
          'Meanwhile, finely chop the shallot and whisk it with the mustard, vinegar, oil, salt and pepper.',
          'Pendant ce temps, hachez finement l’échalote et fouettez-la avec la moutarde, le vinaigre, l’huile, du sel et du poivre.',
          'Mientras tanto, pica fina la chalota y bátela con la mostaza, el vinagre, el aceite, sal y pimienta.',
        ),
      },
      {
        text: t(
          'Drain the lentils, discard the bay leaf and toss them with the dressing while still warm.',
          'Égouttez les lentilles, retirez le laurier et mélangez-les à la vinaigrette tant qu’elles sont chaudes.',
          'Escurre las lentejas, retira el laurel y mézclalas con la vinagreta mientras siguen calientes.',
        ),
      },
      {
        text: t(
          'Toast the walnuts in a dry pan and dice the beetroot.',
          'Faites griller les noix à sec dans une poêle et coupez la betterave en dés.',
          'Tuesta las nueces en una sartén sin aceite y corta la remolacha en dados.',
        ),
        timerMinutes: 3,
      },
      {
        text: t(
          'Fold in the arugula and beetroot, then top with crumbled goat cheese and walnuts.',
          'Ajoutez la roquette et la betterave, puis parsemez de chèvre émietté et de noix.',
          'Incorpora la rúcula y la remolacha y termina con el queso de cabra desmenuzado y las nueces.',
        ),
      },
    ],
  },
  {
    id: 'lu-banh-mi-pork-baguette',
    title: t('Banh Mi-Style Pork Baguette', 'Baguette au porc façon banh mi', 'Bocadillo de cerdo estilo banh mi'),
    description: t(
      'Garlicky glazed pork, quick-pickled carrot and cucumber, fresh cilantro and a spicy mayo in a crisp baguette.',
      'Du porc laqué à l’ail, des carottes et du concombre en pickles express, de la coriandre fraîche et une mayo pimentée dans une baguette croustillante.',
      'Cerdo glaseado con ajo, zanahoria y pepino encurtidos al momento, cilantro fresco y mayonesa picante en una baguette crujiente.',
    ),
    emoji: '🥖',
    color: 'cocoa',
    prepMinutes: 20,
    cookMinutes: 15,
    servings: 2,
    difficulty: 'medium',
    categories: ['lunch', 'dinner'],
    tags: ['spicy', 'high-protein'],
    premium: true,
    ingredients: [
      ing('pork_tenderloin', 300, 'g'),
      ing('baguette', 1, 'pc'),
      ing('carrot', 1, 'pc'),
      ing('cucumber', 0.5, 'pc'),
      ing('vinegar', 4, 'tbsp'),
      ing('sugar', 1, 'tbsp'),
      ing('soy_sauce', 2, 'tbsp'),
      ing('brown_sugar', 1, 'tbsp'),
      ing('garlic', 2, 'clove'),
      ing('mayonnaise', 3, 'tbsp'),
      ing('hot_sauce', 1, 'tsp'),
      ing('cilantro', 0.5, 'bunch'),
      ing('vegetable_oil', 1, 'tbsp'),
      salt,
    ],
    steps: [
      {
        text: t(
          'Cut the carrot and cucumber into fine matchsticks. Stir the vinegar, sugar and a pinch of salt until dissolved and pour over the vegetables.',
          'Taillez la carotte et le concombre en fines allumettes. Mélangez le vinaigre, le sucre et une pincée de sel jusqu’à dissolution, puis versez sur les légumes.',
          'Corta la zanahoria y el pepino en bastoncitos finos. Disuelve el azúcar y una pizca de sal en el vinagre y viértelo sobre las verduras.',
        ),
        timerMinutes: 15,
      },
      {
        text: t(
          'Slice the pork thinly and toss it with the soy sauce, brown sugar and crushed garlic.',
          'Coupez le porc en fines tranches et mélangez-le avec la sauce soja, la cassonade et l’ail écrasé.',
          'Corta el cerdo en filetes finos y mézclalo con la soja, el azúcar moreno y el ajo machacado.',
        ),
      },
      {
        text: t(
          'Fry the pork in the oil over high heat in a single layer until caramelised and cooked through.',
          'Faites saisir le porc dans l’huile à feu vif, en une seule couche, jusqu’à ce qu’il soit caramélisé et bien cuit.',
          'Saltea el cerdo en el aceite a fuego fuerte, en una sola capa, hasta que esté caramelizado y hecho.',
        ),
        timerMinutes: 6,
      },
      {
        text: t(
          'Mix the mayonnaise with the hot sauce. Warm the baguette briefly in the oven, then cut it in two and split each half.',
          'Mélangez la mayonnaise avec la sauce piquante. Réchauffez rapidement la baguette au four, coupez-la en deux et ouvrez chaque moitié.',
          'Mezcla la mayonesa con la salsa picante. Calienta un momento la baguette en el horno, córtala en dos y abre cada mitad.',
        ),
        timerMinutes: 4,
      },
      {
        text: t(
          'Spread with the spicy mayo, fill with pork, drained pickles and plenty of cilantro.',
          'Tartinez de mayo pimentée, garnissez de porc, de pickles égouttés et de beaucoup de coriandre.',
          'Unta con la mayonesa picante y rellena con el cerdo, los encurtidos escurridos y mucho cilantro.',
        ),
      },
    ],
  },
];
