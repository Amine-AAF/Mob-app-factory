import type { Row } from './schema';

/**
 * Garden & balcony plants: flowers, herbs, vegetables, trees and shrubs.
 * Temperatures for hardy plants give the approximate lowest winter temperature tolerated
 * outdoors once established. Sources and review status: see ../CONTENT_SOURCES.md.
 */
// prettier-ignore
export const GARDEN: Row[] = [
  // Flowers
  ['rosa', 'Rosa spp.', 'Rosaceae', 'Rose', 'Rosier', 'Rosal', 'flower', 'O', 'S', 'M', 'loam', -15, 30, 'M', 'sp su au', 'M', 'N', 'cultivated', 1],
  ['pelargonium-hortorum', 'Pelargonium × hortorum', 'Geraniaceae', 'Zonal geranium', 'Géranium des fleuristes', 'Geranio', 'flower', 'B', 'S', 'M', 'uni', 5, 30, 'L', 'sp su au', 'E', 'T', 's_africa', 1],
  ['hydrangea-macrophylla', 'Hydrangea macrophylla', 'Hydrangeaceae', 'Bigleaf hydrangea', 'Hortensia', 'Hortensia', 'flower', 'O', 'M', 'H', 'rich acid', -15, 29, 'M', 'su', 'E', 'T', 'japan', 1],
  ['begonia-semperflorens', 'Begonia × semperflorens-cultorum', 'Begoniaceae', 'Wax begonia', 'Bégonia des jardins', 'Begonia de flor', 'flower', 'B', 'MB', 'M', 'uni', 10, 29, 'M', 'sp su au', 'E', 'T', 'cultivated', 0],
  ['chrysanthemum-morifolium', 'Chrysanthemum × morifolium', 'Asteraceae', 'Florist’s chrysanthemum', 'Chrysanthème', 'Crisantemo', 'flower', 'B', 'S', 'M', 'uni', 0, 27, 'M', 'au', 'E', 'T', 'china', 0],
  ['tulipa-gesneriana', 'Tulipa gesneriana', 'Liliaceae', 'Garden tulip', 'Tulipe', 'Tulipán', 'flower', 'O', 'S', 'M', 'wd', -20, 25, 'M', 'sp', 'E', 'T', 'c_asia', 0],
  ['narcissus-pseudonarcissus', 'Narcissus pseudonarcissus', 'Amaryllidaceae', 'Daffodil', 'Jonquille', 'Narciso', 'flower', 'O', 'MS', 'M', 'wd', -20, 25, 'M', 'sp', 'E', 'T', 'europe', 0],
  ['bougainvillea-glabra', 'Bougainvillea glabra', 'Nyctaginaceae', 'Bougainvillea', 'Bougainvillier', 'Buganvilla', 'flower', 'O', 'S', 'L', 'wd', 5, 35, 'L', 'sp su au', 'E', 'U', 's_america', 0],
  ['hibiscus-rosa-sinensis', 'Hibiscus rosa-sinensis', 'Malvaceae', 'Chinese hibiscus', 'Hibiscus de Chine', 'Hibisco', 'flower', 'B', 'BS', 'M', 'uni', 13, 32, 'M', 'su', 'M', 'N', 'cultivated', 1],
  ['hibiscus-syriacus', 'Hibiscus syriacus', 'Malvaceae', 'Rose of Sharon', 'Althéa', 'Rosa de Siria', 'flower', 'O', 'SM', 'M', 'loam', -20, 32, 'M', 'su au', 'E', 'U', 'china', 0],
  ['petunia-atkinsiana', 'Petunia × atkinsiana', 'Solanaceae', 'Petunia', 'Pétunia', 'Petunia', 'flower', 'O', 'S', 'M', 'uni', 5, 32, 'M', 'sp su au', 'E', 'N', 's_america', 1, 'Petunia × hybrida'],
  ['tagetes-patula', 'Tagetes patula', 'Asteraceae', 'French marigold', 'Œillet d’Inde', 'Clavel de moro', 'flower', 'O', 'S', 'M', 'uni', 5, 32, 'L', 'su au', 'E', 'U', 'mexico c_america', 0],
  ['calendula-officinalis', 'Calendula officinalis', 'Asteraceae', 'Pot marigold', 'Souci officinal', 'Caléndula', 'flower', 'O', 'S', 'M', 'uni', 0, 27, 'L', 'sp su au', 'E', 'N', 'mediterranean', 0],
  ['helianthus-annuus', 'Helianthus annuus', 'Asteraceae', 'Sunflower', 'Tournesol', 'Girasol', 'flower', 'O', 'S', 'M', 'loam', 10, 35, 'L', 'su', 'E', 'N', 'n_america', 1],
  ['dahlia', 'Dahlia spp.', 'Asteraceae', 'Dahlia', 'Dahlia', 'Dalia', 'flower', 'O', 'S', 'M', 'loam', 5, 30, 'M', 'su au', 'M', 'T', 'mexico', 0],
  ['lilium', 'Lilium spp.', 'Liliaceae', 'Lily', 'Lis', 'Lirio', 'flower', 'O', 'SM', 'M', 'wd', -20, 27, 'M', 'su', 'M', 'T', 'europe e_asia n_america', 0],
  ['paeonia-lactiflora', 'Paeonia lactiflora', 'Paeoniaceae', 'Chinese peony', 'Pivoine de Chine', 'Peonía', 'flower', 'O', 'S', 'M', 'loam', -30, 27, 'M', 'sp', 'M', 'T', 'china', 0],
  ['viola-wittrockiana', 'Viola × wittrockiana', 'Violaceae', 'Garden pansy', 'Pensée des jardins', 'Pensamiento', 'flower', 'O', 'SM', 'M', 'uni', -10, 22, 'M', 'wi sp', 'E', 'U', 'cultivated', 0],
  ['impatiens-walleriana', 'Impatiens walleriana', 'Balsaminaceae', 'Busy Lizzie', 'Impatiens', 'Alegría del hogar', 'flower', 'B', 'LM', 'M', 'uni', 10, 29, 'M', 'sp su au', 'E', 'N', 'e_africa', 0],
  ['primula-vulgaris', 'Primula vulgaris', 'Primulaceae', 'Primrose', 'Primevère', 'Prímula', 'flower', 'O', 'M', 'M', 'rich', -15, 20, 'M', 'sp', 'E', 'U', 'europe', 0],
  ['camellia-japonica', 'Camellia japonica', 'Theaceae', 'Camellia', 'Camélia', 'Camelia', 'flower', 'O', 'M', 'M', 'acid', -10, 27, 'M', 'wi sp', 'M', 'N', 'japan china', 0],
  ['rhododendron', 'Rhododendron spp.', 'Ericaceae', 'Rhododendron & azalea', 'Rhododendron et azalée', 'Rododendro y azalea', 'flower', 'O', 'M', 'M', 'acid', -15, 25, 'M', 'sp', 'M', 'T', 'e_asia n_america', 0],
  ['gerbera-jamesonii', 'Gerbera jamesonii', 'Asteraceae', 'Gerbera daisy', 'Gerbera', 'Gerbera', 'flower', 'B', 'BS', 'M', 'wd', 10, 27, 'M', 'sp su', 'M', 'N', 's_africa', 0],
  ['dianthus-caryophyllus', 'Dianthus caryophyllus', 'Caryophyllaceae', 'Carnation', 'Œillet', 'Clavel', 'flower', 'O', 'S', 'M', 'wd', -10, 27, 'L', 'su', 'E', 'T', 'mediterranean', 0],
  ['zinnia-elegans', 'Zinnia elegans', 'Asteraceae', 'Zinnia', 'Zinnia', 'Zinnia', 'flower', 'O', 'S', 'M', 'uni', 10, 35, 'L', 'su au', 'E', 'N', 'mexico', 0],
  ['cosmos-bipinnatus', 'Cosmos bipinnatus', 'Asteraceae', 'Garden cosmos', 'Cosmos', 'Cosmos', 'flower', 'O', 'S', 'L', 'uni', 10, 32, 'L', 'su au', 'E', 'U', 'mexico', 0],
  ['echinacea-purpurea', 'Echinacea purpurea', 'Asteraceae', 'Purple coneflower', 'Échinacée pourpre', 'Equinácea', 'flower', 'O', 'S', 'L', 'wd', -30, 32, 'M', 'su', 'E', 'U', 'n_america', 0],
  ['agapanthus-praecox', 'Agapanthus praecox', 'Amaryllidaceae', 'African lily', 'Agapanthe', 'Agapanto', 'flower', 'O', 'S', 'M', 'wd', -5, 30, 'M', 'su', 'E', 'U', 's_africa', 0],
  ['buddleja-davidii', 'Buddleja davidii', 'Scrophulariaceae', 'Butterfly bush', 'Arbre aux papillons', 'Budleya', 'flower', 'O', 'S', 'L', 'wd', -20, 32, 'M', 'su au', 'E', 'U', 'china', 0],
  ['wisteria-sinensis', 'Wisteria sinensis', 'Fabaceae', 'Chinese wisteria', 'Glycine de Chine', 'Glicinia', 'flower', 'O', 'S', 'M', 'loam', -20, 32, 'M', 'sp', 'M', 'T', 'china', 0],
  ['clematis', 'Clematis spp.', 'Ranunculaceae', 'Clematis', 'Clématite', 'Clemátide', 'flower', 'O', 'SM', 'M', 'loam', -25, 30, 'M', 'sp su', 'M', 'T', 'cultivated', 0],
  ['trachelospermum-jasminoides', 'Trachelospermum jasminoides', 'Apocynaceae', 'Star jasmine', 'Jasmin étoilé', 'Jazmín estrella', 'flower', 'O', 'SM', 'M', 'uni', -10, 32, 'M', 'su', 'E', 'U', 'e_asia', 0],
  ['nerium-oleander', 'Nerium oleander', 'Apocynaceae', 'Oleander', 'Laurier-rose', 'Adelfa', 'flower', 'O', 'S', 'L', 'wd', -5, 38, 'L', 'su', 'E', 'T', 'mediterranean w_asia', 0],
  ['hosta', 'Hosta spp.', 'Asparagaceae', 'Hosta', 'Hosta', 'Hosta', 'outdoor', 'O', 'LM', 'M', 'rich', -30, 27, 'M', 'su', 'E', 'T', 'japan e_asia', 0],
  ['buxus-sempervirens', 'Buxus sempervirens', 'Buxaceae', 'Common box', 'Buis', 'Boj', 'outdoor', 'O', 'SM', 'M', 'loam', -20, 30, 'M', '', 'E', 'T', 'europe', 0],

  // Herbs
  ['ocimum-basilicum', 'Ocimum basilicum', 'Lamiaceae', 'Basil', 'Basilic', 'Albahaca', 'herb', 'B', 'S', 'M', 'uni', 15, 30, 'M', 'su', 'E', 'N', 's_asia', 1],
  ['mentha-spicata', 'Mentha spicata', 'Lamiaceae', 'Spearmint', 'Menthe verte', 'Hierbabuena', 'herb', 'B', 'SM', 'H', 'rich', -20, 30, 'M', 'su', 'E', 'T', 'europe w_asia', 1],
  ['salvia-rosmarinus', 'Salvia rosmarinus', 'Lamiaceae', 'Rosemary', 'Romarin', 'Romero', 'herb', 'O', 'S', 'L', 'sand', -10, 35, 'L', 'wi sp', 'E', 'N', 'mediterranean', 1, 'Rosmarinus officinalis'],
  ['lavandula-angustifolia', 'Lavandula angustifolia', 'Lamiaceae', 'English lavender', 'Lavande vraie', 'Lavanda', 'herb', 'O', 'S', 'L', 'sand wd', -15, 35, 'L', 'su', 'E', 'T', 'mediterranean', 1],
  ['thymus-vulgaris', 'Thymus vulgaris', 'Lamiaceae', 'Thyme', 'Thym', 'Tomillo', 'herb', 'O', 'S', 'L', 'sand', -20, 35, 'L', 'sp su', 'E', 'U', 'mediterranean', 1],
  ['petroselinum-crispum', 'Petroselinum crispum', 'Apiaceae', 'Parsley', 'Persil', 'Perejil', 'herb', 'B', 'SM', 'M', 'rich', -5, 27, 'M', '', 'E', 'T', 'mediterranean', 1],
  ['coriandrum-sativum', 'Coriandrum sativum', 'Apiaceae', 'Coriander', 'Coriandre', 'Cilantro', 'herb', 'B', 'SM', 'M', 'uni', 5, 27, 'M', 'su', 'E', 'U', 'mediterranean w_asia', 0],
  ['allium-schoenoprasum', 'Allium schoenoprasum', 'Amaryllidaceae', 'Chives', 'Ciboulette', 'Cebollino', 'herb', 'B', 'SM', 'M', 'uni', -25, 27, 'M', 'sp su', 'E', 'T', 'europe c_asia', 1],
  ['origanum-vulgare', 'Origanum vulgare', 'Lamiaceae', 'Oregano', 'Origan', 'Orégano', 'herb', 'O', 'S', 'L', 'sand', -20, 32, 'L', 'su', 'E', 'T', 'mediterranean europe', 0],
  ['salvia-officinalis', 'Salvia officinalis', 'Lamiaceae', 'Common sage', 'Sauge officinale', 'Salvia', 'herb', 'O', 'S', 'L', 'sand', -15, 32, 'L', 'su', 'E', 'U', 'mediterranean', 0],
  ['laurus-nobilis', 'Laurus nobilis', 'Lauraceae', 'Bay laurel', 'Laurier-sauce', 'Laurel', 'herb', 'O', 'SM', 'M', 'wd', -5, 32, 'M', 'sp', 'E', 'T', 'mediterranean', 0],
  ['melissa-officinalis', 'Melissa officinalis', 'Lamiaceae', 'Lemon balm', 'Mélisse', 'Melisa', 'herb', 'O', 'SM', 'M', 'uni', -20, 30, 'M', 'su', 'E', 'T', 'mediterranean w_asia', 0],
  ['anethum-graveolens', 'Anethum graveolens', 'Apiaceae', 'Dill', 'Aneth', 'Eneldo', 'herb', 'O', 'S', 'M', 'uni', 5, 30, 'L', 'su', 'E', 'U', 'w_asia', 0],
  ['cymbopogon-citratus', 'Cymbopogon citratus', 'Poaceae', 'Lemongrass', 'Citronnelle', 'Hierba limón', 'herb', 'B', 'S', 'M', 'rich', 10, 35, 'M', '', 'E', 'T', 's_asia se_asia', 0],
  ['aloysia-citrodora', 'Aloysia citrodora', 'Verbenaceae', 'Lemon verbena', 'Verveine citronnelle', 'Hierba luisa', 'herb', 'O', 'S', 'M', 'wd', -5, 32, 'M', 'su', 'E', 'U', 's_america', 0],
  ['stevia-rebaudiana', 'Stevia rebaudiana', 'Asteraceae', 'Stevia', 'Stévia', 'Estevia', 'herb', 'B', 'S', 'M', 'wd', 5, 30, 'M', 'au', 'E', 'U', 's_america', 0],

  // Vegetables & fruit
  ['solanum-lycopersicum', 'Solanum lycopersicum', 'Solanaceae', 'Tomato', 'Tomate', 'Tomate', 'vegetable', 'O', 'S', 'H', 'loam', 10, 32, 'M', 'su', 'M', 'T', 's_america', 1],
  ['capsicum-annuum', 'Capsicum annuum', 'Solanaceae', 'Pepper & chilli', 'Poivron et piment', 'Pimiento y chile', 'vegetable', 'O', 'S', 'M', 'loam', 15, 32, 'M', 'su', 'M', 'U', 'mexico c_america s_america', 1],
  ['lactuca-sativa', 'Lactuca sativa', 'Asteraceae', 'Lettuce', 'Laitue', 'Lechuga', 'vegetable', 'O', 'SM', 'M', 'rich', 5, 24, 'M', '', 'E', 'U', 'mediterranean', 1],
  ['cucumis-sativus', 'Cucumis sativus', 'Cucurbitaceae', 'Cucumber', 'Concombre', 'Pepino', 'vegetable', 'O', 'S', 'H', 'rich', 15, 32, 'M', 'su', 'M', 'U', 's_asia', 0],
  ['fragaria-ananassa', 'Fragaria × ananassa', 'Rosaceae', 'Strawberry', 'Fraisier', 'Fresa', 'vegetable', 'O', 'S', 'M', 'rich', -15, 27, 'M', 'sp', 'E', 'U', 'cultivated', 1],
  ['cucurbita-pepo', 'Cucurbita pepo', 'Cucurbitaceae', 'Courgette (zucchini)', 'Courgette', 'Calabacín', 'vegetable', 'O', 'S', 'H', 'rich', 15, 32, 'M', 'su', 'E', 'U', 'mexico c_america', 0],
  ['phaseolus-vulgaris', 'Phaseolus vulgaris', 'Fabaceae', 'Green bean', 'Haricot vert', 'Judía verde', 'vegetable', 'O', 'S', 'M', 'loam', 15, 30, 'M', 'su', 'E', 'U', 'c_america s_america', 0],
  ['daucus-carota-sativus', 'Daucus carota subsp. sativus', 'Apiaceae', 'Carrot', 'Carotte', 'Zanahoria', 'vegetable', 'O', 'S', 'M', 'sand loam', 5, 27, 'M', '', 'E', 'U', 'c_asia', 0],
  ['raphanus-sativus', 'Raphanus sativus', 'Brassicaceae', 'Radish', 'Radis', 'Rábano', 'vegetable', 'O', 'S', 'M', 'loam', 5, 24, 'M', '', 'E', 'U', 'cultivated', 0],
  ['spinacia-oleracea', 'Spinacia oleracea', 'Amaranthaceae', 'Spinach', 'Épinard', 'Espinaca', 'vegetable', 'O', 'SM', 'M', 'rich', -5, 24, 'M', '', 'E', 'U', 'w_asia', 0],
  ['pisum-sativum', 'Pisum sativum', 'Fabaceae', 'Garden pea', 'Petit pois', 'Guisante', 'vegetable', 'O', 'S', 'M', 'loam', 5, 24, 'M', 'sp', 'E', 'U', 'mediterranean w_asia', 0],
  ['solanum-melongena', 'Solanum melongena', 'Solanaceae', 'Aubergine (eggplant)', 'Aubergine', 'Berenjena', 'vegetable', 'O', 'S', 'M', 'loam', 18, 32, 'M', 'su', 'M', 'U', 's_asia', 0],
  ['allium-sativum', 'Allium sativum', 'Amaryllidaceae', 'Garlic', 'Ail', 'Ajo', 'vegetable', 'O', 'S', 'L', 'wd', -20, 27, 'L', '', 'E', 'T', 'c_asia', 0],
  ['brassica-oleracea-sabellica', 'Brassica oleracea var. sabellica', 'Brassicaceae', 'Kale', 'Chou frisé (kale)', 'Col rizada', 'vegetable', 'O', 'SM', 'M', 'rich', -15, 27, 'M', '', 'E', 'U', 'mediterranean', 0],

  // Trees & shrubs
  ['citrus-limon', 'Citrus × limon', 'Rutaceae', 'Lemon tree', 'Citronnier', 'Limonero', 'tree', 'B', 'S', 'M', 'wd', 5, 32, 'M', 'sp', 'M', 'T', 'cultivated', 1],
  ['citrus-microcarpa', 'Citrus × microcarpa', 'Rutaceae', 'Calamondin', 'Calamondin', 'Calamondín', 'tree', 'B', 'BS', 'M', 'wd', 7, 32, 'M', 'sp su', 'M', 'U', 'se_asia', 0],
  ['olea-europaea', 'Olea europaea', 'Oleaceae', 'Olive tree', 'Olivier', 'Olivo', 'tree', 'O', 'S', 'L', 'wd', -8, 38, 'L', 'sp', 'E', 'N', 'mediterranean', 1],
  ['ficus-carica', 'Ficus carica', 'Moraceae', 'Common fig', 'Figuier', 'Higuera', 'tree', 'O', 'S', 'M', 'loam', -10, 35, 'L', '', 'E', 'T', 'w_asia mediterranean', 0],
  ['acer-palmatum', 'Acer palmatum', 'Sapindaceae', 'Japanese maple', 'Érable du Japon', 'Arce japonés', 'tree', 'O', 'M', 'M', 'rich acid', -25, 30, 'M', '', 'M', 'U', 'japan e_asia', 0],
  ['malus-domestica', 'Malus domestica', 'Rosaceae', 'Apple tree', 'Pommier', 'Manzano', 'tree', 'O', 'S', 'M', 'loam', -30, 30, 'M', 'sp', 'M', 'T', 'c_asia', 0],
];
