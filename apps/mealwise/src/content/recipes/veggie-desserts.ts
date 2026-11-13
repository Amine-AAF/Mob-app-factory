import type { BuiltinRecipe } from '@/domain/types';

/**
 * Bundled vegetarian / vegan dinners (`vg-`) and home desserts (`de-`).
 * Original wording; no nutrition values (the app computes labelled estimates).
 */
export const veggieDessertsRecipes: BuiltinRecipe[] = [
  // ---------------------------------------------------------------------------
  // Vegetarian & vegan mains
  // ---------------------------------------------------------------------------
  {
    id: 'vg-chickpea-curry',
    title: { en: 'Chickpea & Spinach Coconut Curry', fr: 'Curry de pois chiches aux épinards et coco', es: 'Curry de garbanzos con espinacas y coco' },
    description: {
      en: 'Tender chickpeas simmered in a gently spiced tomato and coconut sauce, finished with a handful of fresh spinach.',
      fr: 'Des pois chiches fondants mijotés dans une sauce tomate-coco délicatement épicée, avec une poignée d’épinards frais à la fin.',
      es: 'Garbanzos tiernos cocinados a fuego lento en una salsa de tomate y coco suavemente especiada, con un puñado de espinacas frescas al final.',
    },
    emoji: '🍛',
    color: 'saffron',
    prepMinutes: 15,
    cookMinutes: 25,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'lunch', 'vegetarian', 'vegan', 'healthy'],
    tags: ['budget', 'one-pot', 'meal-prep'],
    ingredients: [
      { key: 'vegetable_oil', quantity: 1, unit: 'tbsp' },
      { key: 'onion', quantity: 1, unit: 'pc' },
      { key: 'garlic', quantity: 3, unit: 'clove' },
      { key: 'ginger', quantity: 15, unit: 'g' },
      { key: 'curry_powder', quantity: 2, unit: 'tbsp' },
      { key: 'canned_tomatoes', quantity: 1, unit: 'can' },
      { key: 'chickpeas_canned', quantity: 2, unit: 'can', note: { en: 'drained', fr: 'égouttés', es: 'escurridos' } },
      { key: 'coconut_milk', quantity: 1, unit: 'can' },
      { key: 'spinach', quantity: 100, unit: 'g' },
      { key: 'rice', quantity: 300, unit: 'g' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
      { key: 'cilantro', quantity: 0.5, unit: 'bunch', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oil in a large pot and cook the chopped onion over medium heat until soft and lightly golden.',
          fr: 'Faites chauffer l’huile dans une grande cocotte et faites revenir l’oignon émincé à feu moyen jusqu’à ce qu’il soit tendre et légèrement doré.',
          es: 'Calienta el aceite en una olla grande y sofríe la cebolla picada a fuego medio hasta que esté blanda y algo dorada.',
        },
        timerMinutes: 5,
      },
      {
        text: {
          en: 'Add the grated garlic and ginger with the curry powder and stir for one minute until fragrant.',
          fr: 'Ajoutez l’ail et le gingembre râpés ainsi que le curry, puis remuez une minute jusqu’à ce que ça embaume.',
          es: 'Añade el ajo y el jengibre rallados junto con el curry y remueve un minuto hasta que desprendan su aroma.',
        },
      },
      {
        text: {
          en: 'Pour in the tomatoes, chickpeas and coconut milk. Bring to a gentle boil, then simmer uncovered, stirring now and then.',
          fr: 'Versez les tomates, les pois chiches et le lait de coco. Portez à frémissement puis laissez mijoter à découvert en remuant de temps en temps.',
          es: 'Incorpora el tomate, los garbanzos y la leche de coco. Lleva a ebullición suave y deja cocer sin tapa, removiendo de vez en cuando.',
        },
        timerMinutes: 15,
      },
      {
        text: {
          en: 'Meanwhile, cook the rice according to the packet instructions.',
          fr: 'Pendant ce temps, faites cuire le riz selon les indications du paquet.',
          es: 'Mientras tanto, cuece el arroz según las indicaciones del paquete.',
        },
      },
      {
        text: {
          en: 'Stir the spinach into the curry until it wilts, season with salt and serve over the rice with cilantro if you like.',
          fr: 'Incorporez les épinards jusqu’à ce qu’ils tombent, salez et servez sur le riz, parsemé de coriandre si vous le souhaitez.',
          es: 'Mezcla las espinacas con el curry hasta que se ablanden, sala al gusto y sirve sobre el arroz con cilantro si te apetece.',
        },
      },
    ],
  },
  {
    id: 'vg-red-lentil-dal',
    title: { en: 'Everyday Red Lentil Dal', fr: 'Dal de lentilles corail du quotidien', es: 'Dal de lentejas rojas de diario' },
    description: {
      en: 'A silky, golden lentil stew topped with sizzling spiced onions and a squeeze of lemon. Cheap, cosy and ready for the week.',
      fr: 'Un ragoût de lentilles doré et onctueux, nappé d’oignons grésillants aux épices et d’un filet de citron. Économique, réconfortant et parfait pour la semaine.',
      es: 'Un guiso de lentejas dorado y sedoso, coronado con cebolla especiada recién frita y unas gotas de limón. Barato, reconfortante y listo para toda la semana.',
    },
    emoji: '🍲',
    color: 'saffron',
    prepMinutes: 10,
    cookMinutes: 30,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'lunch', 'vegetarian', 'vegan', 'healthy'],
    tags: ['budget', 'student', 'freezer-friendly'],
    ingredients: [
      { key: 'red_lentils', quantity: 250, unit: 'g', note: { en: 'rinsed', fr: 'rincées', es: 'enjuagadas' } },
      { key: 'water', quantity: 900, unit: 'ml' },
      { key: 'turmeric', quantity: 1, unit: 'tsp' },
      { key: 'tomato', quantity: 2, unit: 'pc' },
      { key: 'vegetable_oil', quantity: 2, unit: 'tbsp' },
      { key: 'onion', quantity: 1, unit: 'pc' },
      { key: 'garlic', quantity: 3, unit: 'clove' },
      { key: 'ginger', quantity: 10, unit: 'g' },
      { key: 'cumin', quantity: 1, unit: 'tsp' },
      { key: 'garam_masala', quantity: 1, unit: 'tsp' },
      { key: 'lemon', quantity: 0.5, unit: 'pc' },
      { key: 'rice', quantity: 300, unit: 'g' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Put the lentils, water, turmeric and chopped tomatoes in a pot. Bring to the boil, skim off any foam and simmer until the lentils collapse.',
          fr: 'Mettez les lentilles, l’eau, le curcuma et les tomates coupées dans une casserole. Portez à ébullition, écumez puis laissez mijoter jusqu’à ce que les lentilles se défassent.',
          es: 'Pon las lentejas, el agua, la cúrcuma y el tomate troceado en una olla. Lleva a ebullición, retira la espuma y cuece a fuego suave hasta que las lentejas se deshagan.',
        },
        timerMinutes: 20,
      },
      {
        text: {
          en: 'Cook the rice in a separate pan while the lentils simmer.',
          fr: 'Faites cuire le riz dans une autre casserole pendant que les lentilles mijotent.',
          es: 'Cuece el arroz en otro cazo mientras se hacen las lentejas.',
        },
      },
      {
        text: {
          en: 'In a small frying pan, heat the oil and fry the sliced onion until deep golden. Add the garlic, ginger, cumin and garam masala for the last minute.',
          fr: 'Dans une petite poêle, chauffez l’huile et faites dorer l’oignon émincé. Ajoutez l’ail, le gingembre, le cumin et le garam masala pendant la dernière minute.',
          es: 'En una sartén pequeña, calienta el aceite y fríe la cebolla en tiras hasta que esté bien dorada. Añade el ajo, el jengibre, el comino y el garam masala durante el último minuto.',
        },
        timerMinutes: 8,
      },
      {
        text: {
          en: 'Tip the spiced onions into the dal, stir, season with salt and lemon juice and serve with the rice.',
          fr: 'Versez les oignons épicés dans le dal, mélangez, assaisonnez de sel et de jus de citron, puis servez avec le riz.',
          es: 'Vierte la cebolla especiada sobre el dal, mezcla, sazona con sal y zumo de limón y sirve con el arroz.',
        },
      },
    ],
  },
  {
    id: 'vg-veggie-chili',
    title: { en: 'Three-Bean Veggie Chili', fr: 'Chili végétarien aux trois haricots', es: 'Chili vegetal de tres alubias' },
    description: {
      en: 'A thick, smoky chili packed with beans, peppers and sweetcorn. Even better the next day and it freezes beautifully.',
      fr: 'Un chili épais et fumé, généreux en haricots, poivrons et maïs. Encore meilleur le lendemain, et il se congèle à merveille.',
      es: 'Un chili espeso y ahumado, cargado de alubias, pimientos y maíz. Está aún más rico al día siguiente y se congela de maravilla.',
    },
    emoji: '🌶️',
    color: 'tomato',
    prepMinutes: 15,
    cookMinutes: 40,
    servings: 6,
    difficulty: 'easy',
    categories: ['dinner', 'lunch', 'vegetarian', 'vegan', 'healthy'],
    tags: ['one-pot', 'freezer-friendly', 'spicy'],
    ingredients: [
      { key: 'olive_oil', quantity: 2, unit: 'tbsp' },
      { key: 'onion', quantity: 1, unit: 'pc' },
      { key: 'garlic', quantity: 3, unit: 'clove' },
      { key: 'bell_pepper', quantity: 2, unit: 'pc' },
      { key: 'carrot', quantity: 1, unit: 'pc' },
      { key: 'chili_powder', quantity: 2, unit: 'tsp' },
      { key: 'cumin', quantity: 2, unit: 'tsp' },
      { key: 'smoked_paprika', quantity: 1, unit: 'tsp' },
      { key: 'canned_tomatoes', quantity: 2, unit: 'can' },
      { key: 'kidney_beans_canned', quantity: 1, unit: 'can', note: { en: 'drained', fr: 'égouttés', es: 'escurridas' } },
      { key: 'black_beans_canned', quantity: 1, unit: 'can', note: { en: 'drained', fr: 'égouttés', es: 'escurridas' } },
      { key: 'white_beans_canned', quantity: 1, unit: 'can', note: { en: 'drained', fr: 'égouttés', es: 'escurridas' } },
      { key: 'canned_corn', quantity: 1, unit: 'can' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
      { key: 'avocado', quantity: 1, unit: 'pc', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Warm the oil in a large pot and soften the diced onion, peppers and carrot for about 8 minutes.',
          fr: 'Chauffez l’huile dans une grande cocotte et faites fondre l’oignon, les poivrons et la carotte en dés pendant environ 8 minutes.',
          es: 'Calienta el aceite en una olla grande y rehoga la cebolla, los pimientos y la zanahoria en dados unos 8 minutos.',
        },
        timerMinutes: 8,
      },
      {
        text: {
          en: 'Stir in the garlic and all the spices and cook for one minute.',
          fr: 'Ajoutez l’ail et toutes les épices, puis laissez cuire une minute en remuant.',
          es: 'Incorpora el ajo y todas las especias y cocina un minuto sin dejar de remover.',
        },
      },
      {
        text: {
          en: 'Add the tomatoes, the drained beans and the corn with its liquid. Simmer gently, partly covered, until thick.',
          fr: 'Ajoutez les tomates, les haricots égouttés et le maïs avec son jus. Laissez mijoter doucement, à moitié couvert, jusqu’à ce que le chili épaississe.',
          es: 'Añade el tomate, las alubias escurridas y el maíz con su líquido. Cuece a fuego lento, medio tapado, hasta que espese.',
        },
        timerMinutes: 30,
      },
      {
        text: {
          en: 'Season with salt, adjust the heat to your taste and serve topped with diced avocado.',
          fr: 'Salez, ajustez le piquant à votre goût et servez avec des dés d’avocat.',
          es: 'Sala, ajusta el picante a tu gusto y sirve con dados de aguacate por encima.',
        },
      },
    ],
  },
  {
    id: 'vg-mushroom-risotto',
    title: { en: 'Creamy Mushroom Risotto', fr: 'Risotto crémeux aux champignons', es: 'Risotto cremoso de champiñones' },
    description: {
      en: 'Golden mushrooms and thyme folded into slow-stirred, creamy rice with a generous finish of parmesan.',
      fr: 'Des champignons dorés et du thym mêlés à un riz crémeux longuement remué, avec une belle touche de parmesan à la fin.',
      es: 'Champiñones dorados y tomillo mezclados con un arroz cremoso removido sin prisa y terminado con abundante parmesano.',
    },
    emoji: '🍄',
    color: 'cocoa',
    prepMinutes: 10,
    cookMinutes: 30,
    servings: 4,
    difficulty: 'medium',
    categories: ['dinner', 'vegetarian'],
    tags: ['comfort', 'mediterranean'],
    premium: true,
    ingredients: [
      { key: 'vegetable_broth', quantity: 1200, unit: 'ml' },
      { key: 'olive_oil', quantity: 2, unit: 'tbsp' },
      { key: 'mushroom', quantity: 400, unit: 'g' },
      { key: 'thyme', quantity: 1, unit: 'tsp' },
      { key: 'shallot', quantity: 2, unit: 'pc' },
      { key: 'garlic', quantity: 2, unit: 'clove' },
      { key: 'arborio_rice', quantity: 320, unit: 'g' },
      { key: 'butter', quantity: 30, unit: 'g' },
      { key: 'parmesan', quantity: 60, unit: 'g', note: { en: 'grated', fr: 'râpé', es: 'rallado' } },
      { key: 'parsley', quantity: 0.5, unit: 'bunch' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
      { key: 'black_pepper', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Keep the broth hot in a saucepan over low heat.',
          fr: 'Gardez le bouillon bien chaud dans une casserole à feu doux.',
          es: 'Mantén el caldo caliente en un cazo a fuego bajo.',
        },
      },
      {
        text: {
          en: 'In a wide pan, fry the sliced mushrooms in half the oil with the thyme until golden. Set them aside.',
          fr: 'Dans une grande sauteuse, faites dorer les champignons émincés dans la moitié de l’huile avec le thym. Réservez-les.',
          es: 'En una sartén amplia, dora los champiñones laminados con la mitad del aceite y el tomillo. Resérvalos.',
        },
        timerMinutes: 6,
      },
      {
        text: {
          en: 'Add the rest of the oil, soften the chopped shallots and garlic, then stir in the rice for one minute until the grains look glossy.',
          fr: 'Ajoutez le reste de l’huile, faites suer les échalotes et l’ail hachés, puis nacrez le riz une minute en remuant.',
          es: 'Añade el resto del aceite, pocha la chalota y el ajo picados y rehoga el arroz un minuto hasta que el grano brille.',
        },
      },
      {
        text: {
          en: 'Add the hot broth one ladle at a time, stirring often and waiting until each ladle is almost absorbed before adding the next.',
          fr: 'Versez le bouillon chaud louche par louche en remuant souvent, et attendez qu’il soit presque absorbé avant d’en ajouter.',
          es: 'Ve añadiendo el caldo caliente cucharón a cucharón, removiendo a menudo y esperando a que casi se absorba antes de añadir más.',
        },
        timerMinutes: 18,
      },
      {
        text: {
          en: 'When the rice is tender with a slight bite, return the mushrooms, then stir in the butter and parmesan off the heat.',
          fr: 'Quand le riz est tendre mais encore légèrement ferme, remettez les champignons, puis incorporez le beurre et le parmesan hors du feu.',
          es: 'Cuando el arroz esté tierno pero aún firme al morder, devuelve los champiñones y, fuera del fuego, incorpora la mantequilla y el parmesano.',
        },
      },
      {
        text: {
          en: 'Season with salt and pepper, scatter over chopped parsley and serve straight away.',
          fr: 'Salez, poivrez, parsemez de persil ciselé et servez aussitôt.',
          es: 'Salpimienta, espolvorea perejil picado y sirve enseguida.',
        },
      },
    ],
  },
  {
    id: 'vg-stuffed-peppers',
    title: { en: 'Quinoa & Black Bean Stuffed Peppers', fr: 'Poivrons farcis au quinoa et haricots noirs', es: 'Pimientos rellenos de quinoa y frijoles negros' },
    description: {
      en: 'Sweet roasted peppers filled with a cumin-scented mix of quinoa, black beans and corn, baked in tomato sauce.',
      fr: 'Des poivrons rôtis et fondants garnis d’un mélange de quinoa, haricots noirs et maïs parfumé au cumin, cuits dans une sauce tomate.',
      es: 'Pimientos asados y dulces rellenos de una mezcla de quinoa, frijoles negros y maíz con comino, horneados en salsa de tomate.',
    },
    emoji: '🫑',
    color: 'herb',
    prepMinutes: 20,
    cookMinutes: 40,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'vegetarian', 'vegan', 'healthy'],
    tags: ['family', 'meal-prep'],
    premium: true,
    ingredients: [
      { key: 'quinoa', quantity: 150, unit: 'g', note: { en: 'rinsed', fr: 'rincé', es: 'enjuagada' } },
      { key: 'bell_pepper', quantity: 4, unit: 'pc' },
      { key: 'olive_oil', quantity: 1, unit: 'tbsp' },
      { key: 'red_onion', quantity: 1, unit: 'pc' },
      { key: 'garlic', quantity: 2, unit: 'clove' },
      { key: 'cumin', quantity: 1, unit: 'tsp' },
      { key: 'smoked_paprika', quantity: 1, unit: 'tsp' },
      { key: 'black_beans_canned', quantity: 1, unit: 'can', note: { en: 'drained', fr: 'égouttés', es: 'escurridos' } },
      { key: 'canned_corn', quantity: 1, unit: 'can', note: { en: 'drained', fr: 'égoutté', es: 'escurrido' } },
      { key: 'passata', quantity: 300, unit: 'ml' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
      { key: 'cilantro', quantity: 0.5, unit: 'bunch', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 200 °C. Cook the quinoa in plenty of salted water until tender, then drain.',
          fr: 'Préchauffez le four à 200 °C. Faites cuire le quinoa dans un grand volume d’eau salée jusqu’à ce qu’il soit tendre, puis égouttez.',
          es: 'Precalienta el horno a 200 °C. Cuece la quinoa en abundante agua con sal hasta que esté tierna y escúrrela.',
        },
        timerMinutes: 12,
      },
      {
        text: {
          en: 'Meanwhile, soften the chopped onion in the oil, add the garlic, cumin and paprika, then stir in the beans, corn and quinoa. Season well.',
          fr: 'Pendant ce temps, faites fondre l’oignon haché dans l’huile, ajoutez l’ail, le cumin et le paprika, puis les haricots, le maïs et le quinoa. Assaisonnez bien.',
          es: 'Mientras tanto, pocha la cebolla picada en el aceite, añade el ajo, el comino y el pimentón y luego los frijoles, el maíz y la quinoa. Sazona bien.',
        },
      },
      {
        text: {
          en: 'Halve the peppers lengthwise and remove the seeds. Spread the passata in a baking dish and set the pepper halves on top.',
          fr: 'Coupez les poivrons en deux dans la longueur et épépinez-les. Étalez la passata dans un plat à four et posez les demi-poivrons dessus.',
          es: 'Corta los pimientos por la mitad a lo largo y quítales las semillas. Extiende la passata en una fuente de horno y coloca encima las mitades.',
        },
      },
      {
        text: {
          en: 'Fill the peppers generously, cover the dish with foil and bake, then uncover for the last 10 minutes so the tops colour.',
          fr: 'Garnissez généreusement les poivrons, couvrez le plat de papier aluminium et enfournez, puis retirez l’aluminium pour les 10 dernières minutes afin de colorer le dessus.',
          es: 'Rellena bien los pimientos, cubre la fuente con papel de aluminio y hornea; destapa durante los últimos 10 minutos para que se doren.',
        },
        timerMinutes: 30,
      },
      {
        text: {
          en: 'Serve with the tomato sauce from the dish and a little chopped cilantro.',
          fr: 'Servez nappé de la sauce tomate du plat, avec un peu de coriandre ciselée.',
          es: 'Sirve con la salsa de tomate de la fuente y un poco de cilantro picado.',
        },
      },
    ],
  },
  {
    id: 'vg-vegetable-lasagna',
    title: { en: 'Garden Vegetable Lasagna', fr: 'Lasagnes aux légumes du jardin', es: 'Lasaña de verduras de la huerta' },
    description: {
      en: 'Layers of roasted courgette, aubergine and pepper with tomato sauce, spinach-ricotta and a bubbling mozzarella top.',
      fr: 'Des couches de courgette, aubergine et poivron rôtis, de sauce tomate et de ricotta aux épinards, sous une mozzarella bien gratinée.',
      es: 'Capas de calabacín, berenjena y pimiento asados con salsa de tomate, ricotta con espinacas y una capa de mozzarella gratinada.',
    },
    emoji: '🧀',
    color: 'peach',
    prepMinutes: 30,
    cookMinutes: 45,
    servings: 6,
    difficulty: 'medium',
    categories: ['dinner', 'vegetarian'],
    tags: ['family', 'freezer-friendly', 'comfort'],
    premium: true,
    ingredients: [
      { key: 'zucchini', quantity: 2, unit: 'pc' },
      { key: 'eggplant', quantity: 1, unit: 'pc' },
      { key: 'bell_pepper', quantity: 1, unit: 'pc' },
      { key: 'olive_oil', quantity: 3, unit: 'tbsp' },
      { key: 'onion', quantity: 1, unit: 'pc' },
      { key: 'garlic', quantity: 2, unit: 'clove' },
      { key: 'passata', quantity: 700, unit: 'ml' },
      { key: 'oregano', quantity: 1, unit: 'tsp' },
      { key: 'spinach', quantity: 150, unit: 'g' },
      { key: 'ricotta', quantity: 250, unit: 'g' },
      { key: 'lasagna_sheets', quantity: 250, unit: 'g' },
      { key: 'mozzarella', quantity: 200, unit: 'g' },
      { key: 'parmesan', quantity: 40, unit: 'g' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 200 °C. Toss the diced courgette, aubergine and pepper with 2 tablespoons of oil and a pinch of salt, then roast on a tray.',
          fr: 'Préchauffez le four à 200 °C. Mélangez la courgette, l’aubergine et le poivron en dés avec 2 cuillères à soupe d’huile et une pincée de sel, puis faites-les rôtir sur une plaque.',
          es: 'Precalienta el horno a 200 °C. Mezcla el calabacín, la berenjena y el pimiento en dados con 2 cucharadas de aceite y una pizca de sal, y ásalos en una bandeja.',
        },
        timerMinutes: 20,
      },
      {
        text: {
          en: 'Meanwhile, soften the chopped onion and garlic in the remaining oil, add the passata and oregano and simmer for 10 minutes.',
          fr: 'Pendant ce temps, faites revenir l’oignon et l’ail hachés dans le reste d’huile, ajoutez la passata et l’origan, puis laissez mijoter 10 minutes.',
          es: 'Mientras tanto, sofríe la cebolla y el ajo picados con el resto del aceite, añade la passata y el orégano y deja cocer 10 minutos.',
        },
        timerMinutes: 10,
      },
      {
        text: {
          en: 'Wilt the spinach in a dry pan, squeeze out the water, chop it and mix it with the ricotta and a little salt.',
          fr: 'Faites tomber les épinards dans une poêle sèche, pressez-les pour retirer l’eau, hachez-les et mélangez-les à la ricotta avec un peu de sel.',
          es: 'Saltea las espinacas en una sartén sin aceite hasta que se ablanden, escúrrelas bien, pícalas y mézclalas con la ricotta y un poco de sal.',
        },
      },
      {
        text: {
          en: 'In a baking dish, layer sauce, lasagna sheets, roasted vegetables and spoonfuls of ricotta. Repeat, finishing with sheets and sauce.',
          fr: 'Dans un plat à four, alternez sauce, feuilles de lasagne, légumes rôtis et cuillerées de ricotta. Recommencez et terminez par des feuilles et de la sauce.',
          es: 'En una fuente de horno, alterna salsa, láminas de lasaña, verduras asadas y cucharadas de ricotta. Repite y termina con láminas y salsa.',
        },
      },
      {
        text: {
          en: 'Top with torn mozzarella and grated parmesan, then bake until golden and bubbling.',
          fr: 'Couvrez de mozzarella déchirée et de parmesan râpé, puis enfournez jusqu’à ce que ce soit doré et frémissant.',
          es: 'Cubre con mozzarella desmenuzada y parmesano rallado y hornea hasta que esté dorada y burbujeante.',
        },
        timerMinutes: 35,
      },
      {
        text: {
          en: 'Let the lasagna rest for 10 minutes before cutting so the layers hold together.',
          fr: 'Laissez reposer 10 minutes avant de découper pour que les couches se tiennent.',
          es: 'Deja reposar la lasaña 10 minutos antes de cortarla para que las capas no se deshagan.',
        },
        timerMinutes: 10,
      },
    ],
  },
  {
    id: 'vg-tofu-stir-fry',
    title: { en: 'Crispy Tofu & Broccoli Stir-Fry', fr: 'Tofu croustillant sauté au brocoli', es: 'Salteado de tofu crujiente con brócoli' },
    description: {
      en: 'Golden cubes of tofu and crunchy vegetables tossed in a glossy ginger, garlic and soy sauce, served over rice.',
      fr: 'Des cubes de tofu dorés et des légumes croquants enrobés d’une sauce brillante au gingembre, à l’ail et au soja, servis sur du riz.',
      es: 'Dados de tofu dorados y verduras crujientes envueltos en una salsa brillante de jengibre, ajo y soja, servidos sobre arroz.',
    },
    emoji: '🥢',
    color: 'ocean',
    prepMinutes: 10,
    cookMinutes: 15,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'vegetarian', 'vegan', 'quick', 'healthy'],
    tags: ['high-protein', 'student'],
    ingredients: [
      { key: 'rice', quantity: 300, unit: 'g' },
      { key: 'tofu', quantity: 400, unit: 'g', note: { en: 'firm, pressed and cubed', fr: 'ferme, pressé et coupé en dés', es: 'firme, prensado y en dados' } },
      { key: 'cornstarch', quantity: 1, unit: 'tbsp' },
      { key: 'vegetable_oil', quantity: 2, unit: 'tbsp' },
      { key: 'broccoli', quantity: 1, unit: 'pc' },
      { key: 'bell_pepper', quantity: 1, unit: 'pc' },
      { key: 'carrot', quantity: 1, unit: 'pc' },
      { key: 'garlic', quantity: 2, unit: 'clove' },
      { key: 'ginger', quantity: 10, unit: 'g' },
      { key: 'soy_sauce', quantity: 3, unit: 'tbsp' },
      { key: 'maple_syrup', quantity: 1, unit: 'tbsp' },
      { key: 'sesame_oil', quantity: 1, unit: 'tsp' },
      { key: 'sesame_seeds', quantity: 1, unit: 'tbsp', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Start cooking the rice. Mix the soy sauce, maple syrup, sesame oil and 3 tablespoons of water in a small bowl.',
          fr: 'Lancez la cuisson du riz. Dans un bol, mélangez la sauce soja, le sirop d’érable, l’huile de sésame et 3 cuillères à soupe d’eau.',
          es: 'Pon a cocer el arroz. En un cuenco, mezcla la salsa de soja, el sirope de arce, el aceite de sésamo y 3 cucharadas de agua.',
        },
      },
      {
        text: {
          en: 'Toss the tofu cubes in the cornstarch and fry them in the hot oil in a wok or large pan until crisp on all sides. Set aside.',
          fr: 'Enrobez les dés de tofu de fécule et faites-les frire dans l’huile chaude au wok ou dans une grande poêle jusqu’à ce qu’ils soient croustillants. Réservez.',
          es: 'Reboza los dados de tofu en la maicena y fríelos en el aceite caliente en un wok o sartén grande hasta que estén crujientes. Resérvalos.',
        },
        timerMinutes: 8,
      },
      {
        text: {
          en: 'In the same pan, stir-fry the broccoli florets, sliced pepper and carrot over high heat for 4–5 minutes, adding a splash of water if needed.',
          fr: 'Dans la même poêle, faites sauter à feu vif les fleurettes de brocoli, le poivron et la carotte émincés 4 à 5 minutes, avec un filet d’eau si besoin.',
          es: 'En la misma sartén, saltea a fuego fuerte los ramilletes de brócoli, el pimiento y la zanahoria en tiras durante 4–5 minutos, con un chorrito de agua si hace falta.',
        },
        timerMinutes: 5,
      },
      {
        text: {
          en: 'Add the grated garlic and ginger for 30 seconds, then pour in the sauce and return the tofu. Toss until everything is glazed.',
          fr: 'Ajoutez l’ail et le gingembre râpés 30 secondes, puis versez la sauce et remettez le tofu. Mélangez jusqu’à ce que tout soit bien laqué.',
          es: 'Añade el ajo y el jengibre rallados durante 30 segundos, vierte la salsa y devuelve el tofu. Mezcla hasta que todo quede bien glaseado.',
        },
      },
      {
        text: {
          en: 'Serve over the rice, sprinkled with sesame seeds.',
          fr: 'Servez sur le riz, parsemé de graines de sésame.',
          es: 'Sirve sobre el arroz y espolvorea con semillas de sésamo.',
        },
      },
    ],
  },
  {
    id: 'vg-black-bean-burgers',
    title: { en: 'Smoky Black Bean Burgers', fr: 'Burgers fumés aux haricots noirs', es: 'Hamburguesas ahumadas de frijoles negros' },
    description: {
      en: 'Hearty homemade bean patties with a crisp crust and a hint of smoked paprika, stacked in soft buns with all the fixings.',
      fr: 'De généreuses galettes de haricots maison, croustillantes et légèrement fumées au paprika, servies dans des pains moelleux avec leur garniture.',
      es: 'Contundentes hamburguesas caseras de frijoles, crujientes por fuera y con un toque de pimentón ahumado, servidas en panecillos tiernos con todos sus acompañamientos.',
    },
    emoji: '🍔',
    color: 'berry',
    prepMinutes: 20,
    cookMinutes: 15,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'vegetarian', 'vegan'],
    tags: ['kid-friendly', 'family', 'freezer-friendly'],
    ingredients: [
      { key: 'black_beans_canned', quantity: 2, unit: 'can', note: { en: 'drained and patted dry', fr: 'égouttés et séchés', es: 'escurridos y secados' } },
      { key: 'red_onion', quantity: 0.5, unit: 'pc' },
      { key: 'garlic', quantity: 1, unit: 'clove' },
      { key: 'cumin', quantity: 1, unit: 'tsp' },
      { key: 'smoked_paprika', quantity: 1, unit: 'tsp' },
      { key: 'breadcrumbs', quantity: 60, unit: 'g' },
      { key: 'flour', quantity: 2, unit: 'tbsp' },
      { key: 'vegetable_oil', quantity: 2, unit: 'tbsp' },
      { key: 'burger_bun', quantity: 4, unit: 'pc', note: { en: 'check the label for an egg- and dairy-free bun', fr: 'vérifiez l’étiquette pour un pain sans œuf ni lait', es: 'comprueba en la etiqueta que no lleve huevo ni lácteos' } },
      { key: 'tomato', quantity: 1, unit: 'pc' },
      { key: 'lettuce', quantity: 1, unit: 'pc', optional: true },
      { key: 'ketchup', quantity: null, unit: 'to_taste', optional: true },
      { key: 'salt', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Mash the beans roughly with a fork, leaving some whole for texture.',
          fr: 'Écrasez grossièrement les haricots à la fourchette en en laissant quelques-uns entiers pour la texture.',
          es: 'Aplasta los frijoles con un tenedor sin triturarlos del todo, dejando algunos enteros para que tengan textura.',
        },
      },
      {
        text: {
          en: 'Mix in the finely chopped onion and garlic, the spices, breadcrumbs, flour and a good pinch of salt until the mixture holds together.',
          fr: 'Incorporez l’oignon et l’ail finement hachés, les épices, la chapelure, la farine et une bonne pincée de sel jusqu’à obtenir un mélange qui se tient.',
          es: 'Añade la cebolla y el ajo muy picados, las especias, el pan rallado, la harina y una buena pizca de sal, y mezcla hasta que la masa se mantenga unida.',
        },
      },
      {
        text: {
          en: 'Shape into 4 patties with damp hands and chill them for 10 minutes if you have time.',
          fr: 'Façonnez 4 galettes avec les mains humides et placez-les 10 minutes au frais si vous avez le temps.',
          es: 'Forma 4 hamburguesas con las manos húmedas y refrigéralas 10 minutos si tienes tiempo.',
        },
        timerMinutes: 10,
      },
      {
        text: {
          en: 'Fry the patties in the oil over medium heat, turning once, until crisp and heated through.',
          fr: 'Faites cuire les galettes dans l’huile à feu moyen en les retournant une fois, jusqu’à ce qu’elles soient croustillantes et chaudes à cœur.',
          es: 'Fríe las hamburguesas en el aceite a fuego medio, dándoles la vuelta una vez, hasta que estén crujientes y calientes por dentro.',
        },
        timerMinutes: 10,
      },
      {
        text: {
          en: 'Toast the buns and build the burgers with lettuce, tomato slices and ketchup.',
          fr: 'Faites griller les pains et montez les burgers avec la salade, des rondelles de tomate et du ketchup.',
          es: 'Tuesta los panecillos y monta las hamburguesas con lechuga, rodajas de tomate y kétchup.',
        },
      },
    ],
  },
  {
    id: 'vg-cauliflower-gratin',
    title: { en: 'Cauliflower Cheese Gratin', fr: 'Gratin de chou-fleur au fromage', es: 'Gratinado de coliflor con queso' },
    description: {
      en: 'Tender cauliflower baked in a smooth, mustardy cheese sauce under a crunchy golden crumb.',
      fr: 'Du chou-fleur fondant cuit au four dans une béchamel au fromage relevée de moutarde, sous une chapelure dorée et croustillante.',
      es: 'Coliflor tierna horneada en una suave salsa de queso con un toque de mostaza, bajo una costra dorada y crujiente.',
    },
    emoji: '🥘',
    color: 'saffron',
    prepMinutes: 15,
    cookMinutes: 35,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'vegetarian'],
    tags: ['comfort', 'family'],
    ingredients: [
      { key: 'cauliflower', quantity: 1, unit: 'pc' },
      { key: 'butter', quantity: 30, unit: 'g' },
      { key: 'flour', quantity: 30, unit: 'g' },
      { key: 'milk', quantity: 500, unit: 'ml' },
      { key: 'cheddar', quantity: 120, unit: 'g', note: { en: 'grated', fr: 'râpé', es: 'rallado' } },
      { key: 'mustard', quantity: 1, unit: 'tsp' },
      { key: 'nutmeg', quantity: 1, unit: 'pinch' },
      { key: 'breadcrumbs', quantity: 2, unit: 'tbsp' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
      { key: 'black_pepper', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 200 °C. Cut the cauliflower into florets and cook them in salted boiling water until just tender. Drain well.',
          fr: 'Préchauffez le four à 200 °C. Détaillez le chou-fleur en bouquets et faites-les cuire dans l’eau bouillante salée jusqu’à ce qu’ils soient juste tendres. Égouttez bien.',
          es: 'Precalienta el horno a 200 °C. Separa la coliflor en ramilletes y cuécelos en agua hirviendo con sal hasta que estén justo tiernos. Escúrrelos bien.',
        },
        timerMinutes: 6,
      },
      {
        text: {
          en: 'Melt the butter in a saucepan, stir in the flour for a minute, then whisk in the milk little by little and simmer until thickened.',
          fr: 'Faites fondre le beurre dans une casserole, ajoutez la farine en remuant une minute, puis versez le lait petit à petit en fouettant et laissez épaissir.',
          es: 'Derrite la mantequilla en un cazo, añade la harina y remueve un minuto; incorpora la leche poco a poco sin dejar de batir y deja que espese.',
        },
        timerMinutes: 5,
      },
      {
        text: {
          en: 'Off the heat, stir in most of the cheddar, the mustard and nutmeg. Season with salt and pepper.',
          fr: 'Hors du feu, incorporez la majeure partie du cheddar, la moutarde et la muscade. Salez et poivrez.',
          es: 'Fuera del fuego, añade casi todo el cheddar, la mostaza y la nuez moscada. Salpimienta.',
        },
      },
      {
        text: {
          en: 'Arrange the cauliflower in a baking dish, pour over the sauce and sprinkle with the remaining cheese and the breadcrumbs.',
          fr: 'Disposez le chou-fleur dans un plat à gratin, nappez de sauce et parsemez du reste de fromage et de la chapelure.',
          es: 'Coloca la coliflor en una fuente de horno, cúbrela con la salsa y espolvorea el resto del queso y el pan rallado.',
        },
      },
      {
        text: {
          en: 'Bake until bubbling and deep golden on top.',
          fr: 'Enfournez jusqu’à ce que le gratin bouillonne et soit bien doré.',
          es: 'Hornea hasta que burbujee y la superficie esté bien dorada.',
        },
        timerMinutes: 25,
      },
    ],
  },
  {
    id: 'vg-shakshuka',
    title: { en: 'Shakshuka with Feta', fr: 'Chakchouka à la feta', es: 'Shakshuka con feta' },
    description: {
      en: 'Eggs gently poached in a rich, spiced pepper and tomato sauce, crumbled with feta and served with bread for dipping.',
      fr: 'Des œufs pochés doucement dans une sauce généreuse aux poivrons et tomates épicées, parsemés de feta et servis avec du pain à tremper.',
      es: 'Huevos escalfados lentamente en una sabrosa salsa especiada de pimiento y tomate, con feta desmenuzado y pan para mojar.',
    },
    emoji: '🍳',
    color: 'tomato',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'lunch', 'vegetarian', 'quick'],
    tags: ['mediterranean', 'one-pot'],
    ingredients: [
      { key: 'olive_oil', quantity: 2, unit: 'tbsp' },
      { key: 'onion', quantity: 1, unit: 'pc' },
      { key: 'bell_pepper', quantity: 2, unit: 'pc' },
      { key: 'garlic', quantity: 3, unit: 'clove' },
      { key: 'cumin', quantity: 1, unit: 'tsp' },
      { key: 'paprika', quantity: 1, unit: 'tsp' },
      { key: 'chili_flakes', quantity: 1, unit: 'pinch' },
      { key: 'canned_tomatoes', quantity: 2, unit: 'can' },
      { key: 'egg', quantity: 6, unit: 'pc' },
      { key: 'feta', quantity: 80, unit: 'g', optional: true },
      { key: 'parsley', quantity: 0.5, unit: 'bunch', optional: true },
      { key: 'baguette', quantity: 1, unit: 'pc' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oil in a large frying pan and cook the sliced onion and peppers until soft and sweet.',
          fr: 'Chauffez l’huile dans une grande poêle et faites fondre l’oignon et les poivrons émincés jusqu’à ce qu’ils soient tendres et sucrés.',
          es: 'Calienta el aceite en una sartén grande y pocha la cebolla y los pimientos en tiras hasta que estén blandos y dulces.',
        },
        timerMinutes: 7,
      },
      {
        text: {
          en: 'Add the garlic and spices for a minute, then the tomatoes. Simmer until the sauce has thickened slightly, and season with salt.',
          fr: 'Ajoutez l’ail et les épices une minute, puis les tomates. Laissez mijoter jusqu’à ce que la sauce épaississe un peu, et salez.',
          es: 'Añade el ajo y las especias durante un minuto y después el tomate. Deja cocer hasta que la salsa espese un poco y sala.',
        },
        timerMinutes: 6,
      },
      {
        text: {
          en: 'Make six hollows in the sauce and crack an egg into each one. Cover and cook over low heat until the whites are set but the yolks are still soft.',
          fr: 'Creusez six puits dans la sauce et cassez un œuf dans chacun. Couvrez et laissez cuire à feu doux jusqu’à ce que les blancs soient pris et les jaunes encore coulants.',
          es: 'Haz seis huecos en la salsa y casca un huevo en cada uno. Tapa y cocina a fuego bajo hasta que las claras cuajen y las yemas sigan tiernas.',
        },
        timerMinutes: 6,
      },
      {
        text: {
          en: 'Scatter with crumbled feta and parsley and bring the pan to the table with sliced baguette.',
          fr: 'Parsemez de feta émiettée et de persil, puis apportez la poêle à table avec la baguette tranchée.',
          es: 'Espolvorea con feta desmenuzado y perejil y lleva la sartén a la mesa con la baguette en rebanadas.',
        },
      },
    ],
  },
  {
    id: 'vg-vegetable-tagine',
    title: { en: 'Sweet Potato & Chickpea Tagine', fr: 'Tajine de patate douce et pois chiches', es: 'Tajín de boniato y garbanzos' },
    description: {
      en: 'A fragrant North African-style stew of sweet potato, carrots and chickpeas with warm spices and raisins, spooned over fluffy couscous.',
      fr: 'Un ragoût parfumé à la façon nord-africaine, avec patate douce, carottes, pois chiches, épices douces et raisins secs, servi sur une semoule légère.',
      es: 'Un guiso aromático al estilo norteafricano con boniato, zanahoria, garbanzos, especias cálidas y pasas, servido sobre un cuscús esponjoso.',
    },
    emoji: '🥕',
    color: 'peach',
    prepMinutes: 20,
    cookMinutes: 40,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'vegetarian', 'vegan', 'healthy'],
    tags: ['mediterranean', 'one-pot', 'meal-prep'],
    premium: true,
    ingredients: [
      { key: 'olive_oil', quantity: 2, unit: 'tbsp' },
      { key: 'onion', quantity: 1, unit: 'pc' },
      { key: 'garlic', quantity: 2, unit: 'clove' },
      { key: 'cumin', quantity: 1, unit: 'tsp' },
      { key: 'cinnamon', quantity: 1, unit: 'tsp' },
      { key: 'ground_ginger', quantity: 1, unit: 'tsp' },
      { key: 'turmeric', quantity: 0.5, unit: 'tsp' },
      { key: 'sweet_potato', quantity: 2, unit: 'pc' },
      { key: 'carrot', quantity: 2, unit: 'pc' },
      { key: 'zucchini', quantity: 1, unit: 'pc' },
      { key: 'chickpeas_canned', quantity: 1, unit: 'can', note: { en: 'drained', fr: 'égouttés', es: 'escurridos' } },
      { key: 'canned_tomatoes', quantity: 1, unit: 'can' },
      { key: 'vegetable_broth', quantity: 400, unit: 'ml' },
      { key: 'raisins', quantity: 40, unit: 'g' },
      { key: 'couscous', quantity: 250, unit: 'g' },
      { key: 'water', quantity: 300, unit: 'ml', note: { en: 'boiling, for the couscous', fr: 'bouillante, pour la semoule', es: 'hirviendo, para el cuscús' } },
      { key: 'almonds', quantity: 30, unit: 'g', optional: true },
      { key: 'cilantro', quantity: 0.5, unit: 'bunch', optional: true },
      { key: 'salt', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'In a heavy pot, soften the chopped onion in the oil. Add the garlic and all the spices and stir for one minute.',
          fr: 'Dans une cocotte en fonte, faites fondre l’oignon haché dans l’huile. Ajoutez l’ail et toutes les épices, et remuez une minute.',
          es: 'En una olla de fondo grueso, pocha la cebolla picada en el aceite. Añade el ajo y todas las especias y remueve un minuto.',
        },
        timerMinutes: 5,
      },
      {
        text: {
          en: 'Add the sweet potato and carrots in large chunks, the tomatoes, broth and raisins. Cover and simmer gently.',
          fr: 'Ajoutez la patate douce et les carottes en gros morceaux, les tomates, le bouillon et les raisins secs. Couvrez et laissez mijoter doucement.',
          es: 'Incorpora el boniato y la zanahoria en trozos grandes, el tomate, el caldo y las pasas. Tapa y deja cocer a fuego suave.',
        },
        timerMinutes: 20,
      },
      {
        text: {
          en: 'Stir in the courgette and chickpeas and cook uncovered until the vegetables are tender and the sauce has reduced. Season with salt.',
          fr: 'Ajoutez la courgette et les pois chiches et poursuivez la cuisson à découvert jusqu’à ce que les légumes soient tendres et la sauce réduite. Salez.',
          es: 'Añade el calabacín y los garbanzos y cocina sin tapa hasta que las verduras estén tiernas y la salsa se haya reducido. Sala.',
        },
        timerMinutes: 15,
      },
      {
        text: {
          en: 'Meanwhile, pour the boiling water over the couscous with a pinch of salt, cover for 5 minutes, then fluff with a fork.',
          fr: 'Pendant ce temps, versez l’eau bouillante sur la semoule avec une pincée de sel, couvrez 5 minutes, puis égrainez à la fourchette.',
          es: 'Mientras tanto, vierte el agua hirviendo sobre el cuscús con una pizca de sal, tapa 5 minutos y luego suéltalo con un tenedor.',
        },
        timerMinutes: 5,
      },
      {
        text: {
          en: 'Serve the tagine over the couscous, topped with toasted almonds and cilantro.',
          fr: 'Servez le tajine sur la semoule, garni d’amandes grillées et de coriandre.',
          es: 'Sirve el tajín sobre el cuscús con almendras tostadas y cilantro por encima.',
        },
      },
    ],
  },
  {
    id: 'vg-pesto-pea-pasta',
    title: { en: 'Pesto Pasta with Peas & Tomatoes', fr: 'Pâtes au pesto, petits pois et tomates', es: 'Pasta al pesto con guisantes y tomates' },
    description: {
      en: 'A bright, fifteen-minute bowl of pasta tossed with basil pesto, sweet peas and juicy cherry tomatoes.',
      fr: 'Un plat de pâtes lumineux prêt en un quart d’heure, avec du pesto au basilic, des petits pois tendres et des tomates cerises juteuses.',
      es: 'Un plato de pasta alegre en un cuarto de hora, con pesto de albahaca, guisantes dulces y tomates cherry jugosos.',
    },
    emoji: '🍝',
    color: 'herb',
    prepMinutes: 5,
    cookMinutes: 15,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'lunch', 'vegetarian', 'quick'],
    tags: ['student', 'budget'],
    ingredients: [
      { key: 'pasta', quantity: 400, unit: 'g' },
      { key: 'frozen_peas', quantity: 200, unit: 'g' },
      { key: 'pesto', quantity: 120, unit: 'g' },
      { key: 'cherry_tomato', quantity: 200, unit: 'g' },
      { key: 'parmesan', quantity: 30, unit: 'g' },
      { key: 'lemon', quantity: 0.5, unit: 'pc', optional: true },
      { key: 'salt', quantity: null, unit: 'to_taste' },
      { key: 'black_pepper', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Cook the pasta in plenty of salted boiling water. Add the frozen peas for the last 3 minutes.',
          fr: 'Faites cuire les pâtes dans un grand volume d’eau bouillante salée. Ajoutez les petits pois surgelés pour les 3 dernières minutes.',
          es: 'Cuece la pasta en abundante agua hirviendo con sal. Añade los guisantes congelados durante los últimos 3 minutos.',
        },
        timerMinutes: 11,
      },
      {
        text: {
          en: 'Meanwhile, halve the cherry tomatoes.',
          fr: 'Pendant ce temps, coupez les tomates cerises en deux.',
          es: 'Mientras tanto, corta los tomates cherry por la mitad.',
        },
      },
      {
        text: {
          en: 'Keep a small cup of the cooking water, then drain the pasta and peas and return them to the pot.',
          fr: 'Réservez un petit verre d’eau de cuisson, puis égouttez les pâtes et les petits pois et remettez-les dans la casserole.',
          es: 'Reserva un vaso pequeño del agua de cocción, escurre la pasta con los guisantes y devuélvelos a la olla.',
        },
      },
      {
        text: {
          en: 'Stir in the pesto with a splash of the cooking water until glossy, fold in the tomatoes, and finish with grated parmesan, pepper and a squeeze of lemon.',
          fr: 'Incorporez le pesto avec un peu d’eau de cuisson jusqu’à ce que ce soit nappant, ajoutez les tomates et terminez avec du parmesan râpé, du poivre et un filet de citron.',
          es: 'Mezcla el pesto con un chorrito del agua de cocción hasta que quede cremoso, añade los tomates y termina con parmesano rallado, pimienta y unas gotas de limón.',
        },
      },
    ],
  },
  {
    id: 'vg-broccoli-garlic-spaghetti',
    title: { en: 'Garlic & Chili Broccoli Spaghetti', fr: 'Spaghettis au brocoli, ail et piment', es: 'Espaguetis con brócoli, ajo y guindilla' },
    description: {
      en: 'Spaghetti tossed with soft broccoli, golden garlic, chili and lemon, topped with crunchy toasted breadcrumbs.',
      fr: 'Des spaghettis mêlés à du brocoli fondant, de l’ail doré, du piment et du citron, avec une chapelure grillée croustillante.',
      es: 'Espaguetis con brócoli tierno, ajo dorado, guindilla y limón, coronados con pan rallado tostado y crujiente.',
    },
    emoji: '🥦',
    color: 'olive',
    prepMinutes: 5,
    cookMinutes: 15,
    servings: 2,
    difficulty: 'easy',
    categories: ['dinner', 'vegetarian', 'vegan', 'quick'],
    tags: ['student', 'budget'],
    ingredients: [
      { key: 'spaghetti', quantity: 200, unit: 'g' },
      { key: 'broccoli', quantity: 1, unit: 'pc' },
      { key: 'olive_oil', quantity: 4, unit: 'tbsp' },
      { key: 'breadcrumbs', quantity: 3, unit: 'tbsp', optional: true },
      { key: 'garlic', quantity: 3, unit: 'clove' },
      { key: 'chili_flakes', quantity: 0.5, unit: 'tsp' },
      { key: 'lemon', quantity: 0.5, unit: 'pc' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Bring a large pot of salted water to the boil. Cook the spaghetti, adding the small broccoli florets for the last 4 minutes.',
          fr: 'Portez une grande casserole d’eau salée à ébullition. Faites cuire les spaghettis en ajoutant les petits bouquets de brocoli pour les 4 dernières minutes.',
          es: 'Lleva a ebullición una olla grande de agua con sal. Cuece los espaguetis y añade los ramilletes pequeños de brócoli durante los últimos 4 minutos.',
        },
        timerMinutes: 10,
      },
      {
        text: {
          en: 'Meanwhile, toast the breadcrumbs in 1 tablespoon of oil until golden and tip them onto a plate.',
          fr: 'Pendant ce temps, faites dorer la chapelure dans 1 cuillère à soupe d’huile, puis réservez-la dans une assiette.',
          es: 'Mientras tanto, tuesta el pan rallado con 1 cucharada de aceite hasta que se dore y pásalo a un plato.',
        },
      },
      {
        text: {
          en: 'Gently warm the rest of the oil with the sliced garlic and chili flakes until the garlic just turns pale gold.',
          fr: 'Faites chauffer doucement le reste de l’huile avec l’ail émincé et le piment jusqu’à ce que l’ail blondisse à peine.',
          es: 'Calienta a fuego suave el resto del aceite con el ajo laminado y la guindilla hasta que el ajo empiece a dorarse.',
        },
      },
      {
        text: {
          en: 'Drain the pasta and broccoli, keeping a little water, and toss everything in the garlic oil with lemon juice and salt, mashing some of the broccoli.',
          fr: 'Égouttez les pâtes et le brocoli en gardant un peu d’eau, puis mélangez le tout dans l’huile à l’ail avec le jus de citron et du sel, en écrasant une partie du brocoli.',
          es: 'Escurre la pasta y el brócoli reservando un poco de agua y mézclalo todo con el aceite de ajo, el zumo de limón y sal, aplastando parte del brócoli.',
        },
      },
      {
        text: {
          en: 'Serve topped with the crispy breadcrumbs.',
          fr: 'Servez parsemé de chapelure croustillante.',
          es: 'Sirve con el pan rallado crujiente por encima.',
        },
      },
    ],
  },
  {
    id: 'vg-sweet-potato-tacos',
    title: { en: 'Sweet Potato & Black Bean Tacos', fr: 'Tacos à la patate douce et aux haricots noirs', es: 'Tacos de boniato y frijoles negros' },
    description: {
      en: 'Warm tortillas loaded with smoky pan-roasted sweet potato, black beans, creamy avocado and a squeeze of lime.',
      fr: 'Des tortillas tièdes garnies de patate douce poêlée aux saveurs fumées, de haricots noirs, d’avocat crémeux et d’un trait de citron vert.',
      es: 'Tortillas calientes cargadas de boniato salteado con sabor ahumado, frijoles negros, aguacate cremoso y unas gotas de lima.',
    },
    emoji: '🌮',
    color: 'berry',
    prepMinutes: 10,
    cookMinutes: 20,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'vegetarian', 'vegan', 'quick'],
    tags: ['family', 'kid-friendly'],
    premium: true,
    ingredients: [
      { key: 'sweet_potato', quantity: 2, unit: 'pc' },
      { key: 'olive_oil', quantity: 2, unit: 'tbsp' },
      { key: 'smoked_paprika', quantity: 1, unit: 'tsp' },
      { key: 'cumin', quantity: 1, unit: 'tsp' },
      { key: 'black_beans_canned', quantity: 1, unit: 'can', note: { en: 'drained', fr: 'égouttés', es: 'escurridos' } },
      { key: 'tortilla', quantity: 8, unit: 'pc' },
      { key: 'avocado', quantity: 1, unit: 'pc' },
      { key: 'lime', quantity: 1, unit: 'pc' },
      { key: 'red_onion', quantity: 0.5, unit: 'pc' },
      { key: 'salsa', quantity: 120, unit: 'g' },
      { key: 'cilantro', quantity: 0.5, unit: 'bunch', optional: true },
      { key: 'salt', quantity: null, unit: 'to_taste' },
    ],
    steps: [
      {
        text: {
          en: 'Peel the sweet potatoes and cut them into small cubes. Cook them in the oil in a large covered frying pan, stirring often, until tender and browned.',
          fr: 'Épluchez les patates douces et coupez-les en petits dés. Faites-les cuire dans l’huile dans une grande poêle couverte, en remuant souvent, jusqu’à ce qu’elles soient tendres et dorées.',
          es: 'Pela los boniatos y córtalos en dados pequeños. Cocínalos con el aceite en una sartén grande tapada, removiendo a menudo, hasta que estén tiernos y dorados.',
        },
        timerMinutes: 15,
      },
      {
        text: {
          en: 'Sprinkle in the paprika, cumin and a pinch of salt, add the beans and warm through for 2–3 minutes.',
          fr: 'Ajoutez le paprika, le cumin et une pincée de sel, puis les haricots, et laissez chauffer 2 à 3 minutes.',
          es: 'Espolvorea el pimentón, el comino y una pizca de sal, añade los frijoles y calienta 2–3 minutos.',
        },
      },
      {
        text: {
          en: 'Meanwhile, finely chop the red onion and mash the avocado with half the lime juice and a little salt.',
          fr: 'Pendant ce temps, hachez finement l’oignon rouge et écrasez l’avocat avec la moitié du jus de citron vert et un peu de sel.',
          es: 'Mientras tanto, pica fina la cebolla morada y machaca el aguacate con la mitad del zumo de lima y un poco de sal.',
        },
      },
      {
        text: {
          en: 'Warm the tortillas in a dry pan for a few seconds on each side.',
          fr: 'Réchauffez les tortillas quelques secondes de chaque côté dans une poêle sèche.',
          es: 'Calienta las tortillas unos segundos por cada lado en una sartén sin aceite.',
        },
      },
      {
        text: {
          en: 'Fill each tortilla with avocado, the sweet potato mix, salsa, red onion and cilantro, and serve with lime wedges.',
          fr: 'Garnissez chaque tortilla d’avocat, de patate douce aux haricots, de salsa, d’oignon rouge et de coriandre, puis servez avec des quartiers de citron vert.',
          es: 'Rellena cada tortilla con aguacate, la mezcla de boniato, salsa, cebolla morada y cilantro, y sirve con gajos de lima.',
        },
      },
    ],
  },
  {
    id: 'vg-eggplant-bake',
    title: { en: 'Baked Aubergine with Tomato & Mozzarella', fr: 'Aubergines gratinées tomate-mozzarella', es: 'Berenjenas al horno con tomate y mozzarella' },
    description: {
      en: 'Roasted aubergine slices layered with garlicky tomato sauce, basil and melting mozzarella, baked until golden at the edges.',
      fr: 'Des tranches d’aubergine rôties superposées avec une sauce tomate à l’ail, du basilic et de la mozzarella fondante, gratinées jusqu’à ce que les bords dorent.',
      es: 'Rodajas de berenjena asadas en capas con salsa de tomate al ajo, albahaca y mozzarella fundida, horneadas hasta que se doren los bordes.',
    },
    emoji: '🍆',
    color: 'berry',
    prepMinutes: 20,
    cookMinutes: 45,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'vegetarian'],
    tags: ['mediterranean', 'comfort'],
    ingredients: [
      { key: 'eggplant', quantity: 2, unit: 'pc' },
      { key: 'olive_oil', quantity: 4, unit: 'tbsp' },
      { key: 'garlic', quantity: 2, unit: 'clove' },
      { key: 'passata', quantity: 500, unit: 'ml' },
      { key: 'oregano', quantity: 1, unit: 'tsp' },
      { key: 'basil', quantity: 0.5, unit: 'bunch' },
      { key: 'mozzarella', quantity: 250, unit: 'g' },
      { key: 'parmesan', quantity: 40, unit: 'g' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
      { key: 'baguette', quantity: 1, unit: 'pc', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 210 °C. Slice the aubergines into rounds about 1 cm thick, brush with 3 tablespoons of oil, season and roast on trays until soft and coloured.',
          fr: 'Préchauffez le four à 210 °C. Coupez les aubergines en rondelles d’environ 1 cm, badigeonnez-les de 3 cuillères à soupe d’huile, salez et faites-les rôtir sur des plaques jusqu’à ce qu’elles soient tendres et colorées.',
          es: 'Precalienta el horno a 210 °C. Corta las berenjenas en rodajas de 1 cm aproximadamente, píntalas con 3 cucharadas de aceite, sálalas y ásalas en bandejas hasta que estén tiernas y doradas.',
        },
        timerMinutes: 20,
      },
      {
        text: {
          en: 'Meanwhile, warm the sliced garlic in the remaining oil, add the passata and oregano and simmer for 10 minutes. Season with salt.',
          fr: 'Pendant ce temps, faites revenir l’ail émincé dans le reste d’huile, ajoutez la passata et l’origan et laissez mijoter 10 minutes. Salez.',
          es: 'Mientras tanto, sofríe el ajo laminado en el resto del aceite, añade la passata y el orégano y deja cocer 10 minutos. Sala.',
        },
        timerMinutes: 10,
      },
      {
        text: {
          en: 'In a baking dish, alternate layers of sauce, aubergine, basil leaves and torn mozzarella, ending with sauce and mozzarella.',
          fr: 'Dans un plat à four, alternez sauce, aubergines, feuilles de basilic et mozzarella déchirée, en terminant par de la sauce et de la mozzarella.',
          es: 'En una fuente de horno, alterna capas de salsa, berenjena, hojas de albahaca y mozzarella troceada, terminando con salsa y mozzarella.',
        },
      },
      {
        text: {
          en: 'Sprinkle with parmesan and bake until bubbling and golden.',
          fr: 'Parsemez de parmesan et enfournez jusqu’à ce que ce soit doré et frémissant.',
          es: 'Espolvorea con parmesano y hornea hasta que burbujee y se dore.',
        },
        timerMinutes: 25,
      },
      {
        text: {
          en: 'Rest for a few minutes, then serve with crusty bread.',
          fr: 'Laissez reposer quelques minutes, puis servez avec du pain croustillant.',
          es: 'Deja reposar unos minutos y sirve con pan crujiente.',
        },
      },
    ],
  },
  {
    id: 'vg-greek-baked-beans',
    title: { en: 'Greek-Style Baked White Beans', fr: 'Haricots blancs au four à la grecque', es: 'Alubias blancas al horno a la griega' },
    description: {
      en: 'Creamy white beans slowly baked in a herby tomato sauce with plenty of olive oil and fresh dill. Lovely with crusty bread.',
      fr: 'Des haricots blancs fondants cuits lentement au four dans une sauce tomate aux herbes, avec une bonne dose d’huile d’olive et d’aneth frais. Délicieux avec du pain croustillant.',
      es: 'Alubias blancas cremosas horneadas despacio en una salsa de tomate con hierbas, buen aceite de oliva y eneldo fresco. Riquísimas con pan crujiente.',
    },
    emoji: '🫘',
    color: 'olive',
    prepMinutes: 15,
    cookMinutes: 40,
    servings: 4,
    difficulty: 'easy',
    categories: ['dinner', 'lunch', 'vegetarian', 'vegan', 'healthy'],
    tags: ['mediterranean', 'budget', 'meal-prep'],
    ingredients: [
      { key: 'olive_oil', quantity: 3, unit: 'tbsp' },
      { key: 'onion', quantity: 1, unit: 'pc' },
      { key: 'carrot', quantity: 1, unit: 'pc' },
      { key: 'celery', quantity: 1, unit: 'pc', note: { en: 'stalk', fr: 'branche', es: 'rama' } },
      { key: 'garlic', quantity: 2, unit: 'clove' },
      { key: 'tomato_paste', quantity: 1, unit: 'tbsp' },
      { key: 'passata', quantity: 400, unit: 'ml' },
      { key: 'white_beans_canned', quantity: 2, unit: 'can', note: { en: 'drained', fr: 'égouttés', es: 'escurridas' } },
      { key: 'oregano', quantity: 1, unit: 'tsp' },
      { key: 'bay_leaf', quantity: 1, unit: 'pc' },
      { key: 'dill', quantity: 0.5, unit: 'bunch' },
      { key: 'salt', quantity: null, unit: 'to_taste' },
      { key: 'black_pepper', quantity: null, unit: 'to_taste' },
      { key: 'bread', quantity: 4, unit: 'slice', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 190 °C. In an ovenproof pan, soften the finely chopped onion, carrot and celery in the oil.',
          fr: 'Préchauffez le four à 190 °C. Dans une sauteuse allant au four, faites fondre l’oignon, la carotte et le céleri finement hachés dans l’huile.',
          es: 'Precalienta el horno a 190 °C. En una cazuela apta para horno, pocha en el aceite la cebolla, la zanahoria y el apio muy picados.',
        },
        timerMinutes: 8,
      },
      {
        text: {
          en: 'Stir in the garlic and tomato paste for a minute, then add the passata, 150 ml of water, the oregano and bay leaf.',
          fr: 'Ajoutez l’ail et le concentré de tomate une minute, puis la passata, 150 ml d’eau, l’origan et la feuille de laurier.',
          es: 'Añade el ajo y el concentrado de tomate durante un minuto y después la passata, 150 ml de agua, el orégano y la hoja de laurel.',
        },
      },
      {
        text: {
          en: 'Fold in the beans, season, and bake uncovered until the sauce is thick and the top lightly caramelised.',
          fr: 'Incorporez les haricots, assaisonnez et enfournez à découvert jusqu’à ce que la sauce soit épaisse et le dessus légèrement caramélisé.',
          es: 'Incorpora las alubias, salpimienta y hornea sin tapar hasta que la salsa espese y la superficie se caramelice ligeramente.',
        },
        timerMinutes: 30,
      },
      {
        text: {
          en: 'Scatter with chopped dill, add a final drizzle of olive oil and serve warm with bread.',
          fr: 'Parsemez d’aneth ciselé, ajoutez un dernier filet d’huile d’olive et servez tiède avec du pain.',
          es: 'Espolvorea eneldo picado, añade un último chorrito de aceite de oliva y sirve templado con pan.',
        },
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // Desserts
  // ---------------------------------------------------------------------------
  {
    id: 'de-apple-crumble',
    title: { en: 'Cinnamon Apple Crumble', fr: 'Crumble aux pommes et à la cannelle', es: 'Crumble de manzana y canela' },
    description: {
      en: 'Soft, cinnamon-scented apples under a buttery oat crumble that turns golden and crisp in the oven.',
      fr: 'Des pommes fondantes parfumées à la cannelle sous un crumble beurré aux flocons d’avoine, doré et croustillant à la sortie du four.',
      es: 'Manzanas tiernas con aroma a canela bajo un crumble de mantequilla y avena que sale del horno dorado y crujiente.',
    },
    emoji: '🍏',
    color: 'peach',
    prepMinutes: 20,
    cookMinutes: 35,
    servings: 6,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian'],
    tags: ['comfort', 'family'],
    ingredients: [
      { key: 'apple', quantity: 5, unit: 'pc' },
      { key: 'lemon', quantity: 0.5, unit: 'pc' },
      { key: 'sugar', quantity: 30, unit: 'g' },
      { key: 'cinnamon', quantity: 1, unit: 'tsp' },
      { key: 'flour', quantity: 120, unit: 'g' },
      { key: 'rolled_oats', quantity: 50, unit: 'g' },
      { key: 'brown_sugar', quantity: 80, unit: 'g' },
      { key: 'butter', quantity: 100, unit: 'g', note: { en: 'cold, diced', fr: 'froid, en dés', es: 'fría, en dados' } },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 190 °C. Peel, core and slice the apples, then toss them in a baking dish with the lemon juice, sugar and cinnamon.',
          fr: 'Préchauffez le four à 190 °C. Épluchez, épépinez et tranchez les pommes, puis mélangez-les dans un plat avec le jus de citron, le sucre et la cannelle.',
          es: 'Precalienta el horno a 190 °C. Pela, descorazona y corta las manzanas en láminas y mézclalas en una fuente con el zumo de limón, el azúcar y la canela.',
        },
      },
      {
        text: {
          en: 'In a bowl, rub the cold butter into the flour with your fingertips until it looks like coarse sand, then stir in the oats and brown sugar.',
          fr: 'Dans un saladier, sablez le beurre froid avec la farine du bout des doigts jusqu’à obtenir une texture de gros sable, puis ajoutez les flocons d’avoine et la cassonade.',
          es: 'En un bol, frota la mantequilla fría con la harina con la punta de los dedos hasta que parezca arena gruesa y luego añade la avena y el azúcar moreno.',
        },
      },
      {
        text: {
          en: 'Scatter the crumble evenly over the apples without pressing it down.',
          fr: 'Répartissez le crumble sur les pommes sans le tasser.',
          es: 'Reparte el crumble de manera uniforme sobre las manzanas sin apretarlo.',
        },
      },
      {
        text: {
          en: 'Bake until the top is golden and the fruit is bubbling at the edges. Let it cool for 10 minutes before serving.',
          fr: 'Enfournez jusqu’à ce que le dessus soit doré et que les fruits bouillonnent sur les bords. Laissez tiédir 10 minutes avant de servir.',
          es: 'Hornea hasta que la superficie esté dorada y la fruta burbujee por los bordes. Deja templar 10 minutos antes de servir.',
        },
        timerMinutes: 35,
      },
    ],
  },
  {
    id: 'de-chocolate-mousse',
    title: { en: 'Airy Dark Chocolate Mousse', fr: 'Mousse au chocolat noir aérienne', es: 'Mousse ligera de chocolate negro' },
    description: {
      en: 'A light, cloud-like mousse with deep dark chocolate flavour, made with just a handful of ingredients.',
      fr: 'Une mousse légère comme un nuage, au goût intense de chocolat noir, réalisée avec seulement quelques ingrédients.',
      es: 'Una mousse ligera como una nube, con un intenso sabor a chocolate negro y hecha con muy pocos ingredientes.',
    },
    emoji: '🍫',
    color: 'cocoa',
    prepMinutes: 20,
    cookMinutes: 5,
    servings: 6,
    difficulty: 'medium',
    categories: ['desserts', 'vegetarian'],
    tags: ['comfort'],
    premium: true,
    ingredients: [
      { key: 'dark_chocolate', quantity: 200, unit: 'g' },
      { key: 'egg', quantity: 6, unit: 'pc', note: { en: 'very fresh, separated', fr: 'très frais, blancs et jaunes séparés', es: 'muy frescos, con las claras separadas de las yemas' } },
      { key: 'salt', quantity: 1, unit: 'pinch' },
      { key: 'sugar', quantity: 30, unit: 'g' },
    ],
    steps: [
      {
        text: {
          en: 'Melt the chopped chocolate in a heatproof bowl over barely simmering water, then let it cool for a few minutes.',
          fr: 'Faites fondre le chocolat haché au bain-marie à feu très doux, puis laissez-le tiédir quelques minutes.',
          es: 'Derrite el chocolate troceado al baño maría a fuego muy suave y déjalo templar unos minutos.',
        },
        timerMinutes: 5,
      },
      {
        text: {
          en: 'Stir the egg yolks into the chocolate one at a time until smooth and shiny.',
          fr: 'Incorporez les jaunes d’œufs un à un au chocolat jusqu’à obtenir un mélange lisse et brillant.',
          es: 'Incorpora las yemas al chocolate de una en una hasta obtener una mezcla lisa y brillante.',
        },
      },
      {
        text: {
          en: 'Whisk the egg whites with the salt to soft peaks, then add the sugar and keep whisking until firm and glossy.',
          fr: 'Montez les blancs en neige avec le sel jusqu’à ce qu’ils forment des pics souples, puis ajoutez le sucre et fouettez jusqu’à ce qu’ils soient fermes et brillants.',
          es: 'Monta las claras con la sal a punto de nieve suave, añade el azúcar y sigue batiendo hasta que estén firmes y brillantes.',
        },
      },
      {
        text: {
          en: 'Fold a third of the whites into the chocolate to loosen it, then gently fold in the rest, lifting from the bottom so you keep the air.',
          fr: 'Mélangez un tiers des blancs au chocolat pour le détendre, puis incorporez délicatement le reste en soulevant la masse pour garder l’air.',
          es: 'Mezcla un tercio de las claras con el chocolate para aligerarlo y después incorpora el resto con movimientos envolventes para que no pierda el aire.',
        },
      },
      {
        text: {
          en: 'Spoon into glasses or a bowl and chill until set.',
          fr: 'Répartissez dans des verrines ou un saladier et placez au réfrigérateur jusqu’à ce que la mousse soit prise.',
          es: 'Reparte en vasitos o en un cuenco y refrigera hasta que cuaje.',
        },
        timerMinutes: 180,
      },
    ],
  },
  {
    id: 'de-rice-pudding',
    title: { en: 'Vanilla Rice Pudding', fr: 'Riz au lait à la vanille', es: 'Arroz con leche a la vainilla' },
    description: {
      en: 'Slow-simmered, creamy rice pudding with vanilla and a dusting of cinnamon. Lovely warm or chilled.',
      fr: 'Un riz au lait crémeux cuit doucement, parfumé à la vanille et saupoudré de cannelle. Délicieux tiède ou bien frais.',
      es: 'Un arroz con leche cremoso cocinado a fuego lento, con vainilla y un toque de canela. Está buenísimo templado o frío.',
    },
    emoji: '🍚',
    color: 'ocean',
    prepMinutes: 5,
    cookMinutes: 40,
    servings: 4,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian'],
    tags: ['comfort', 'budget'],
    ingredients: [
      { key: 'arborio_rice', quantity: 100, unit: 'g', note: { en: 'or any short-grain rice', fr: 'ou un autre riz rond', es: 'o cualquier arroz redondo' } },
      { key: 'milk', quantity: 900, unit: 'ml' },
      { key: 'sugar', quantity: 70, unit: 'g' },
      { key: 'vanilla_extract', quantity: 1, unit: 'tsp' },
      { key: 'lemon', quantity: 0.5, unit: 'pc', note: { en: 'zest only', fr: 'zeste uniquement', es: 'solo la piel' }, optional: true },
      { key: 'cinnamon', quantity: 0.5, unit: 'tsp' },
    ],
    steps: [
      {
        text: {
          en: 'Rinse the rice, then put it in a heavy saucepan with the milk and a strip of lemon zest.',
          fr: 'Rincez le riz, puis mettez-le dans une casserole à fond épais avec le lait et un zeste de citron.',
          es: 'Enjuaga el arroz y ponlo en un cazo de fondo grueso con la leche y una tira de piel de limón.',
        },
      },
      {
        text: {
          en: 'Bring slowly to a simmer, then cook over very low heat, stirring often so it does not catch, until the rice is soft and the milk has thickened.',
          fr: 'Portez doucement à frémissement, puis laissez cuire à feu très doux en remuant souvent pour que ça n’attache pas, jusqu’à ce que le riz soit tendre et le lait épaissi.',
          es: 'Lleva lentamente a ebullición suave y cocina a fuego muy bajo, removiendo a menudo para que no se pegue, hasta que el arroz esté tierno y la leche haya espesado.',
        },
        timerMinutes: 35,
      },
      {
        text: {
          en: 'Stir in the sugar and vanilla and cook for 5 more minutes. Remove the lemon zest.',
          fr: 'Ajoutez le sucre et la vanille et poursuivez la cuisson 5 minutes. Retirez le zeste de citron.',
          es: 'Añade el azúcar y la vainilla y cocina 5 minutos más. Retira la piel de limón.',
        },
        timerMinutes: 5,
      },
      {
        text: {
          en: 'Spoon into bowls and dust with cinnamon. It thickens further as it cools.',
          fr: 'Répartissez dans des bols et saupoudrez de cannelle. Il épaissit encore en refroidissant.',
          es: 'Sirve en cuencos y espolvorea con canela. Espesará aún más al enfriarse.',
        },
      },
    ],
  },
  {
    id: 'de-fudgy-brownies',
    title: { en: 'Fudgy Chocolate Brownies', fr: 'Brownies fondants au chocolat', es: 'Brownies de chocolate jugosos' },
    description: {
      en: 'Rich, gooey-centred brownies with a crackly top, studded with walnuts if you like.',
      fr: 'Des brownies riches au cœur fondant et à la croûte craquelée, avec des noix si vous le souhaitez.',
      es: 'Brownies intensos con el centro jugoso y la superficie crujiente, con nueces si te apetece.',
    },
    emoji: '🍰',
    color: 'cocoa',
    prepMinutes: 15,
    cookMinutes: 25,
    servings: 8,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian'],
    tags: ['kid-friendly', 'family'],
    ingredients: [
      { key: 'dark_chocolate', quantity: 200, unit: 'g' },
      { key: 'butter', quantity: 150, unit: 'g' },
      { key: 'sugar', quantity: 200, unit: 'g' },
      { key: 'egg', quantity: 3, unit: 'pc' },
      { key: 'flour', quantity: 80, unit: 'g' },
      { key: 'cocoa_powder', quantity: 20, unit: 'g' },
      { key: 'salt', quantity: 1, unit: 'pinch' },
      { key: 'walnuts', quantity: 60, unit: 'g', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 180 °C and line a 20 × 20 cm tin with baking paper.',
          fr: 'Préchauffez le four à 180 °C et chemisez un moule carré de 20 cm de papier cuisson.',
          es: 'Precalienta el horno a 180 °C y forra un molde cuadrado de 20 cm con papel de horno.',
        },
      },
      {
        text: {
          en: 'Melt the chocolate and butter together over low heat, then take off the heat and whisk in the sugar.',
          fr: 'Faites fondre le chocolat et le beurre ensemble à feu doux, puis retirez du feu et incorporez le sucre au fouet.',
          es: 'Derrite el chocolate con la mantequilla a fuego suave, retira del fuego y añade el azúcar batiendo.',
        },
      },
      {
        text: {
          en: 'Beat in the eggs one by one, then fold in the flour, cocoa, salt and chopped walnuts until just combined.',
          fr: 'Ajoutez les œufs un à un en battant, puis incorporez la farine, le cacao, le sel et les noix concassées sans trop mélanger.',
          es: 'Incorpora los huevos de uno en uno batiendo y después mezcla con cuidado la harina, el cacao, la sal y las nueces troceadas, solo hasta integrarlos.',
        },
      },
      {
        text: {
          en: 'Pour into the tin and bake until the edges are set but the centre still wobbles slightly.',
          fr: 'Versez dans le moule et enfournez jusqu’à ce que les bords soient pris et que le centre tremble encore un peu.',
          es: 'Vierte en el molde y hornea hasta que los bordes estén hechos pero el centro aún tiemble ligeramente.',
        },
        timerMinutes: 25,
      },
      {
        text: {
          en: 'Let cool completely in the tin before cutting into squares.',
          fr: 'Laissez refroidir complètement dans le moule avant de couper en carrés.',
          es: 'Deja enfriar por completo en el molde antes de cortar en cuadrados.',
        },
        timerMinutes: 60,
      },
    ],
  },
  {
    id: 'de-minty-fruit-salad',
    title: { en: 'Fresh Fruit Salad with Lime & Mint', fr: 'Salade de fruits frais citron vert et menthe', es: 'Macedonia de frutas con lima y menta' },
    description: {
      en: 'A colourful bowl of strawberries, kiwi, orange and mango brightened with lime juice and torn mint leaves.',
      fr: 'Un saladier coloré de fraises, kiwis, oranges et mangue, relevé de jus de citron vert et de feuilles de menthe.',
      es: 'Un bol lleno de color con fresas, kiwi, naranja y mango, avivado con zumo de lima y hojas de menta.',
    },
    emoji: '🍓',
    color: 'tomato',
    prepMinutes: 15,
    cookMinutes: 0,
    servings: 4,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian', 'vegan', 'quick', 'healthy'],
    tags: ['no-cook', 'light'],
    ingredients: [
      { key: 'strawberry', quantity: 250, unit: 'g' },
      { key: 'kiwi', quantity: 2, unit: 'pc' },
      { key: 'orange', quantity: 2, unit: 'pc' },
      { key: 'mango', quantity: 1, unit: 'pc' },
      { key: 'lime', quantity: 1, unit: 'pc' },
      { key: 'mint', quantity: 0.5, unit: 'bunch' },
      { key: 'maple_syrup', quantity: 1, unit: 'tbsp', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Hull and halve the strawberries, peel and slice the kiwis, and cut the mango into cubes.',
          fr: 'Équeutez et coupez les fraises en deux, épluchez et tranchez les kiwis, puis coupez la mangue en cubes.',
          es: 'Quita el rabito a las fresas y pártelas por la mitad, pela y corta los kiwis en rodajas y trocea el mango en dados.',
        },
      },
      {
        text: {
          en: 'Peel the oranges with a knife, removing the white pith, and cut out the segments over the bowl to catch the juice.',
          fr: 'Pelez les oranges à vif au couteau, puis prélevez les suprêmes au-dessus du saladier pour récupérer le jus.',
          es: 'Pela las naranjas a cuchillo quitando toda la parte blanca y saca los gajos sobre el bol para aprovechar el zumo.',
        },
      },
      {
        text: {
          en: 'Add the rest of the fruit, the lime juice and maple syrup, and toss gently.',
          fr: 'Ajoutez le reste des fruits, le jus de citron vert et le sirop d’érable, puis mélangez délicatement.',
          es: 'Añade el resto de la fruta, el zumo de lima y el sirope de arce, y mezcla con suavidad.',
        },
      },
      {
        text: {
          en: 'Scatter with torn mint leaves just before serving.',
          fr: 'Parsemez de feuilles de menthe déchirées juste avant de servir.',
          es: 'Esparce las hojas de menta troceadas justo antes de servir.',
        },
      },
    ],
  },
  {
    id: 'de-vegan-banana-bread',
    title: { en: 'Easy Vegan Banana Bread', fr: 'Banana bread vegan facile', es: 'Pan de plátano vegano fácil' },
    description: {
      en: 'A moist, warmly spiced loaf made with very ripe bananas and no eggs or dairy. Perfect sliced with a cup of tea.',
      fr: 'Un cake moelleux aux épices douces, préparé avec des bananes bien mûres, sans œufs ni produits laitiers. Parfait en tranches avec une tasse de thé.',
      es: 'Un bizcocho jugoso y ligeramente especiado, hecho con plátanos muy maduros y sin huevo ni lácteos. Ideal en rebanadas con un té.',
    },
    emoji: '🍌',
    color: 'saffron',
    prepMinutes: 15,
    cookMinutes: 55,
    servings: 8,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian', 'vegan'],
    tags: ['freezer-friendly', 'meal-prep'],
    ingredients: [
      { key: 'banana', quantity: 3, unit: 'pc', note: { en: 'very ripe', fr: 'très mûres', es: 'muy maduros' } },
      { key: 'brown_sugar', quantity: 100, unit: 'g' },
      { key: 'vegetable_oil', quantity: 80, unit: 'ml' },
      { key: 'plant_milk', quantity: 60, unit: 'ml' },
      { key: 'flour', quantity: 250, unit: 'g' },
      { key: 'baking_soda', quantity: 1, unit: 'tsp' },
      { key: 'baking_powder', quantity: 1, unit: 'tsp' },
      { key: 'cinnamon', quantity: 1, unit: 'tsp' },
      { key: 'salt', quantity: 1, unit: 'pinch' },
      { key: 'walnuts', quantity: 50, unit: 'g', optional: true },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 180 °C and line a loaf tin with baking paper.',
          fr: 'Préchauffez le four à 180 °C et chemisez un moule à cake de papier cuisson.',
          es: 'Precalienta el horno a 180 °C y forra un molde alargado con papel de horno.',
        },
      },
      {
        text: {
          en: 'Mash the bananas in a large bowl, then whisk in the brown sugar, oil and plant milk.',
          fr: 'Écrasez les bananes dans un grand saladier, puis ajoutez la cassonade, l’huile et la boisson végétale en fouettant.',
          es: 'Machaca los plátanos en un bol grande y añade el azúcar moreno, el aceite y la bebida vegetal sin dejar de batir.',
        },
      },
      {
        text: {
          en: 'Add the flour, baking soda, baking powder, cinnamon and salt and stir just until no dry flour remains. Fold in the chopped walnuts.',
          fr: 'Ajoutez la farine, le bicarbonate, la levure, la cannelle et le sel, et mélangez juste assez pour qu’il ne reste plus de farine sèche. Incorporez les noix concassées.',
          es: 'Añade la harina, el bicarbonato, la levadura, la canela y la sal y mezcla solo hasta que no quede harina seca. Incorpora las nueces troceadas.',
        },
      },
      {
        text: {
          en: 'Pour into the tin and bake until a skewer inserted in the centre comes out clean.',
          fr: 'Versez dans le moule et enfournez jusqu’à ce qu’une pique plantée au centre ressorte sèche.',
          es: 'Vierte en el molde y hornea hasta que al pinchar el centro con un palillo salga limpio.',
        },
        timerMinutes: 55,
      },
      {
        text: {
          en: 'Cool in the tin for 10 minutes, then on a rack before slicing.',
          fr: 'Laissez refroidir 10 minutes dans le moule, puis sur une grille avant de trancher.',
          es: 'Deja enfriar 10 minutos en el molde y después sobre una rejilla antes de cortarlo.',
        },
        timerMinutes: 10,
      },
    ],
  },
  {
    id: 'de-yogurt-berry-parfait',
    title: { en: 'Berry Yogurt Parfait', fr: 'Verrines de yaourt aux fruits rouges', es: 'Copas de yogur con frutos rojos' },
    description: {
      en: 'Layers of thick yogurt, juicy berries and honeyed oats with toasted almonds. Ready in ten minutes.',
      fr: 'Des couches de yaourt épais, de baies juteuses et de flocons d’avoine au miel, avec des amandes grillées. Prêtes en dix minutes.',
      es: 'Capas de yogur espeso, frutos rojos jugosos y avena con miel, con almendras tostadas. Listas en diez minutos.',
    },
    emoji: '🫐',
    color: 'berry',
    prepMinutes: 10,
    cookMinutes: 0,
    servings: 2,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian', 'quick'],
    tags: ['no-cook', 'kid-friendly'],
    ingredients: [
      { key: 'greek_yogurt', quantity: 300, unit: 'g' },
      { key: 'raspberry', quantity: 100, unit: 'g' },
      { key: 'blueberry', quantity: 100, unit: 'g' },
      { key: 'rolled_oats', quantity: 40, unit: 'g' },
      { key: 'honey', quantity: 2, unit: 'tbsp' },
      { key: 'almonds', quantity: 20, unit: 'g', note: { en: 'toasted and chopped', fr: 'grillées et concassées', es: 'tostadas y picadas' } },
    ],
    steps: [
      {
        text: {
          en: 'Mix the oats with half the honey so they clump slightly.',
          fr: 'Mélangez les flocons d’avoine avec la moitié du miel pour qu’ils s’agglomèrent un peu.',
          es: 'Mezcla la avena con la mitad de la miel para que se apelmace un poco.',
        },
      },
      {
        text: {
          en: 'Lightly crush a few raspberries with a fork to make a quick sauce, leaving the rest whole.',
          fr: 'Écrasez légèrement quelques framboises à la fourchette pour obtenir un coulis express, en gardant les autres entières.',
          es: 'Aplasta ligeramente algunas frambuesas con un tenedor para hacer una salsa rápida y deja el resto enteras.',
        },
      },
      {
        text: {
          en: 'In two glasses, layer yogurt, crushed raspberries, whole berries and oats, then repeat.',
          fr: 'Dans deux verres, alternez yaourt, framboises écrasées, baies entières et flocons, puis recommencez.',
          es: 'En dos vasos, alterna capas de yogur, frambuesas aplastadas, frutos enteros y avena, y repite.',
        },
      },
      {
        text: {
          en: 'Finish with the chopped almonds and a drizzle of the remaining honey.',
          fr: 'Terminez avec les amandes concassées et un filet du miel restant.',
          es: 'Termina con las almendras picadas y un hilo de la miel restante.',
        },
      },
    ],
  },
  {
    id: 'de-oat-chocolate-cookies',
    title: { en: 'Chewy Oat & Chocolate Chunk Cookies', fr: 'Cookies moelleux à l’avoine et pépites de chocolat', es: 'Galletas tiernas de avena y chocolate' },
    description: {
      en: 'Golden-edged, chewy-centred cookies full of oats and melting chunks of dark chocolate.',
      fr: 'Des cookies aux bords dorés et au cœur moelleux, garnis de flocons d’avoine et de morceaux de chocolat noir fondant.',
      es: 'Galletas con los bordes dorados y el centro tierno, llenas de avena y trozos de chocolate negro que se funden.',
    },
    emoji: '🍪',
    color: 'cocoa',
    prepMinutes: 15,
    cookMinutes: 12,
    servings: 8,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian', 'quick'],
    tags: ['kid-friendly', 'family'],
    ingredients: [
      { key: 'butter', quantity: 115, unit: 'g', note: { en: 'softened', fr: 'mou', es: 'blanda' } },
      { key: 'brown_sugar', quantity: 100, unit: 'g' },
      { key: 'egg', quantity: 1, unit: 'pc' },
      { key: 'vanilla_extract', quantity: 1, unit: 'tsp' },
      { key: 'flour', quantity: 120, unit: 'g' },
      { key: 'rolled_oats', quantity: 100, unit: 'g' },
      { key: 'baking_soda', quantity: 0.5, unit: 'tsp' },
      { key: 'salt', quantity: 1, unit: 'pinch' },
      { key: 'dark_chocolate', quantity: 100, unit: 'g', note: { en: 'roughly chopped', fr: 'grossièrement haché', es: 'troceado' } },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 180 °C and line two baking trays with baking paper.',
          fr: 'Préchauffez le four à 180 °C et recouvrez deux plaques de papier cuisson.',
          es: 'Precalienta el horno a 180 °C y cubre dos bandejas con papel de horno.',
        },
      },
      {
        text: {
          en: 'Beat the soft butter with the brown sugar until creamy, then beat in the egg and vanilla.',
          fr: 'Battez le beurre mou avec la cassonade jusqu’à ce que le mélange soit crémeux, puis ajoutez l’œuf et la vanille.',
          es: 'Bate la mantequilla blanda con el azúcar moreno hasta que quede cremosa y luego añade el huevo y la vainilla.',
        },
      },
      {
        text: {
          en: 'Stir in the flour, oats, baking soda and salt, then the chocolate chunks.',
          fr: 'Incorporez la farine, les flocons d’avoine, le bicarbonate et le sel, puis les morceaux de chocolat.',
          es: 'Añade la harina, la avena, el bicarbonato y la sal y, por último, los trozos de chocolate.',
        },
      },
      {
        text: {
          en: 'Drop heaped spoonfuls onto the trays, leaving space between them, and bake until golden at the edges but still soft in the middle.',
          fr: 'Déposez des cuillerées bombées sur les plaques en les espaçant, et enfournez jusqu’à ce que les bords soient dorés mais le centre encore tendre.',
          es: 'Coloca cucharadas colmadas en las bandejas dejando espacio entre ellas y hornea hasta que los bordes estén dorados y el centro siga blando.',
        },
        timerMinutes: 12,
      },
      {
        text: {
          en: 'Leave on the trays for 5 minutes to firm up, then move to a rack.',
          fr: 'Laissez-les 5 minutes sur les plaques pour qu’ils se raffermissent, puis transférez-les sur une grille.',
          es: 'Déjalas 5 minutos en las bandejas para que se asienten y pásalas a una rejilla.',
        },
        timerMinutes: 5,
      },
    ],
  },
  {
    id: 'de-spiced-poached-pears',
    title: { en: 'Spiced Orange Poached Pears', fr: 'Poires pochées à l’orange et aux épices', es: 'Peras escalfadas con naranja y especias' },
    description: {
      en: 'Whole pears gently poached in an orange, ginger and vanilla syrup until tender and glossy.',
      fr: 'Des poires entières pochées doucement dans un sirop à l’orange, au gingembre et à la vanille, jusqu’à ce qu’elles soient fondantes et brillantes.',
      es: 'Peras enteras escalfadas a fuego suave en un almíbar de naranja, jengibre y vainilla hasta quedar tiernas y brillantes.',
    },
    emoji: '🍐',
    color: 'olive',
    prepMinutes: 10,
    cookMinutes: 30,
    servings: 4,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian', 'vegan'],
    tags: ['light', 'family'],
    premium: true,
    ingredients: [
      { key: 'pear', quantity: 4, unit: 'pc', note: { en: 'firm', fr: 'fermes', es: 'firmes' } },
      { key: 'water', quantity: 600, unit: 'ml' },
      { key: 'orange_juice', quantity: 200, unit: 'ml' },
      { key: 'sugar', quantity: 80, unit: 'g' },
      { key: 'ginger', quantity: 15, unit: 'g', note: { en: 'sliced', fr: 'en lamelles', es: 'en láminas' } },
      { key: 'cinnamon', quantity: 1, unit: 'tsp' },
      { key: 'vanilla_extract', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      {
        text: {
          en: 'In a saucepan just big enough to hold the pears, bring the water, orange juice, sugar, ginger, cinnamon and vanilla to a simmer until the sugar dissolves.',
          fr: 'Dans une casserole juste assez grande pour les poires, portez à frémissement l’eau, le jus d’orange, le sucre, le gingembre, la cannelle et la vanille jusqu’à dissolution du sucre.',
          es: 'En un cazo en el que quepan justas las peras, calienta el agua, el zumo de naranja, el azúcar, el jengibre, la canela y la vainilla hasta que el azúcar se disuelva.',
        },
      },
      {
        text: {
          en: 'Peel the pears, keeping the stalks on, and slice a thin piece off the base so they can stand.',
          fr: 'Épluchez les poires en gardant la queue et coupez une fine tranche à la base pour qu’elles tiennent debout.',
          es: 'Pela las peras dejándoles el rabito y corta una lámina fina de la base para que se mantengan de pie.',
        },
      },
      {
        text: {
          en: 'Lower the pears into the syrup, cover with a circle of baking paper and poach gently, turning them now and then, until a knife slides in easily.',
          fr: 'Plongez les poires dans le sirop, couvrez d’un disque de papier cuisson et laissez pocher doucement en les tournant de temps en temps, jusqu’à ce qu’un couteau s’y enfonce facilement.',
          es: 'Introduce las peras en el almíbar, cúbrelas con un círculo de papel de horno y escálfalas a fuego suave girándolas de vez en cuando, hasta que un cuchillo entre con facilidad.',
        },
        timerMinutes: 20,
      },
      {
        text: {
          en: 'Lift out the pears, then boil the syrup until reduced by about half and slightly syrupy.',
          fr: 'Retirez les poires, puis faites bouillir le sirop jusqu’à ce qu’il réduise de moitié environ et devienne légèrement nappant.',
          es: 'Saca las peras y hierve el almíbar hasta que se reduzca a la mitad y quede algo espeso.',
        },
        timerMinutes: 10,
      },
      {
        text: {
          en: 'Serve the pears warm or chilled, with the syrup spooned over.',
          fr: 'Servez les poires tièdes ou froides, arrosées de sirop.',
          es: 'Sirve las peras templadas o frías, regadas con el almíbar.',
        },
      },
    ],
  },
  {
    id: 'de-chocolate-chia-pudding',
    title: { en: 'Chocolate Chia Pudding', fr: 'Pudding de chia au chocolat', es: 'Pudin de chía con chocolate' },
    description: {
      en: 'A silky, make-ahead chocolate pudding thickened with chia seeds and topped with fresh raspberries.',
      fr: 'Un pudding au chocolat onctueux à préparer à l’avance, épaissi aux graines de chia et garni de framboises fraîches.',
      es: 'Un pudin de chocolate sedoso que se prepara con antelación, espesado con semillas de chía y coronado con frambuesas frescas.',
    },
    emoji: '🥄',
    color: 'cocoa',
    prepMinutes: 10,
    cookMinutes: 0,
    servings: 4,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian', 'vegan'],
    tags: ['no-cook', 'meal-prep'],
    premium: true,
    ingredients: [
      { key: 'plant_milk', quantity: 500, unit: 'ml' },
      { key: 'cocoa_powder', quantity: 2, unit: 'tbsp' },
      { key: 'maple_syrup', quantity: 3, unit: 'tbsp' },
      { key: 'vanilla_extract', quantity: 1, unit: 'tsp' },
      { key: 'salt', quantity: 1, unit: 'pinch' },
      { key: 'chia_seeds', quantity: 60, unit: 'g' },
      { key: 'raspberry', quantity: 100, unit: 'g' },
    ],
    steps: [
      {
        text: {
          en: 'Whisk the plant milk, cocoa, maple syrup, vanilla and salt in a bowl until there are no lumps of cocoa.',
          fr: 'Fouettez la boisson végétale, le cacao, le sirop d’érable, la vanille et le sel dans un saladier jusqu’à ce qu’il n’y ait plus de grumeaux.',
          es: 'Bate la bebida vegetal, el cacao, el sirope de arce, la vainilla y la sal en un bol hasta que no queden grumos de cacao.',
        },
      },
      {
        text: {
          en: 'Stir in the chia seeds, wait 5 minutes, then stir again so they do not clump.',
          fr: 'Ajoutez les graines de chia, attendez 5 minutes, puis remuez à nouveau pour éviter les paquets.',
          es: 'Añade las semillas de chía, espera 5 minutos y vuelve a remover para que no se apelmacen.',
        },
        timerMinutes: 5,
      },
      {
        text: {
          en: 'Divide between four glasses or jars, cover and chill until thick and spoonable, or overnight.',
          fr: 'Répartissez dans quatre verres ou bocaux, couvrez et réfrigérez jusqu’à ce que le pudding soit bien épais, ou toute une nuit.',
          es: 'Reparte en cuatro vasos o tarros, tapa y refrigera hasta que espese y se pueda comer con cuchara, o toda la noche.',
        },
        timerMinutes: 120,
      },
      {
        text: {
          en: 'Top with fresh raspberries just before serving.',
          fr: 'Garnissez de framboises fraîches juste avant de servir.',
          es: 'Decora con frambuesas frescas justo antes de servir.',
        },
      },
    ],
  },
  {
    id: 'de-baked-apples',
    title: { en: 'Maple Baked Apples with Oats & Walnuts', fr: 'Pommes au four à l’érable, avoine et noix', es: 'Manzanas asadas con arce, avena y nueces' },
    description: {
      en: 'Whole apples stuffed with a cinnamon, oat, walnut and raisin filling and baked until soft and syrupy.',
      fr: 'Des pommes entières farcies d’un mélange d’avoine, de noix, de raisins secs et de cannelle, cuites au four jusqu’à ce qu’elles soient fondantes et caramélisées.',
      es: 'Manzanas enteras rellenas de avena, nueces, pasas y canela, asadas hasta quedar tiernas y almibaradas.',
    },
    emoji: '🍎',
    color: 'tomato',
    prepMinutes: 10,
    cookMinutes: 35,
    servings: 4,
    difficulty: 'easy',
    categories: ['desserts', 'vegetarian', 'vegan'],
    tags: ['budget', 'family'],
    ingredients: [
      { key: 'apple', quantity: 4, unit: 'pc' },
      { key: 'rolled_oats', quantity: 40, unit: 'g' },
      { key: 'walnuts', quantity: 40, unit: 'g', note: { en: 'chopped', fr: 'concassées', es: 'picadas' } },
      { key: 'raisins', quantity: 30, unit: 'g' },
      { key: 'cinnamon', quantity: 1, unit: 'tsp' },
      { key: 'maple_syrup', quantity: 3, unit: 'tbsp' },
      { key: 'water', quantity: 100, unit: 'ml' },
    ],
    steps: [
      {
        text: {
          en: 'Heat the oven to 180 °C. Core the apples, making the hole a little wider at the top, and score the skin around the middle so they do not burst.',
          fr: 'Préchauffez le four à 180 °C. Évidez les pommes en élargissant un peu le trou sur le dessus, et incisez la peau tout autour à mi-hauteur pour qu’elles n’éclatent pas.',
          es: 'Precalienta el horno a 180 °C. Descorazona las manzanas ensanchando un poco el hueco por arriba y haz un corte superficial en la piel alrededor del centro para que no revienten.',
        },
      },
      {
        text: {
          en: 'Mix the oats, walnuts, raisins, cinnamon and 2 tablespoons of maple syrup, then pack the mixture into the apples.',
          fr: 'Mélangez l’avoine, les noix, les raisins secs, la cannelle et 2 cuillères à soupe de sirop d’érable, puis farcissez-en les pommes en tassant.',
          es: 'Mezcla la avena, las nueces, las pasas, la canela y 2 cucharadas de sirope de arce y rellena las manzanas apretando bien.',
        },
      },
      {
        text: {
          en: 'Stand the apples in a small baking dish, pour the water around them and drizzle with the remaining syrup.',
          fr: 'Placez les pommes dans un petit plat à four, versez l’eau autour et arrosez du reste de sirop.',
          es: 'Coloca las manzanas en una fuente pequeña, vierte el agua alrededor y riégalas con el resto del sirope.',
        },
      },
      {
        text: {
          en: 'Bake, basting once or twice with the juices, until the apples are completely tender.',
          fr: 'Enfournez en les arrosant une ou deux fois de leur jus, jusqu’à ce que les pommes soient complètement tendres.',
          es: 'Hornea, regándolas una o dos veces con su jugo, hasta que las manzanas estén completamente tiernas.',
        },
        timerMinutes: 35,
      },
      {
        text: {
          en: 'Serve warm with the syrupy juices from the dish.',
          fr: 'Servez tiède avec le jus sirupeux du plat.',
          es: 'Sirve templadas con el jugo almibarado de la fuente.',
        },
      },
    ],
  },
];
