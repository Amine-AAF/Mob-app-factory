import type { Row } from './schema';

/** Succulents and cacti. Sources and review status: see ../CONTENT_SOURCES.md. */
// prettier-ignore
export const SUCCULENTS: Row[] = [
  ['aloe-vera', 'Aloe vera', 'Asphodelaceae', 'Aloe vera', 'Aloe vera', 'Sábila', 'succulent', 'B', 'BS', 'L', 'cac', 10, 32, 'L', 'wi sp', 'E', 'T', 'arabia', 1, 'Aloe barbadensis'],
  ['crassula-ovata', 'Crassula ovata', 'Crassulaceae', 'Jade plant', 'Arbre de jade', 'Árbol de jade', 'succulent', 'B', 'BS', 'L', 'cac', 10, 30, 'L', 'wi', 'E', 'T', 's_africa', 1],
  ['echeveria-elegans', 'Echeveria elegans', 'Crassulaceae', 'Mexican snowball', 'Échévéria', 'Echeveria', 'succulent', 'B', 'S', 'L', 'cac', 7, 30, 'L', 'sp su', 'E', 'U', 'mexico', 1],
  ['haworthiopsis-attenuata', 'Haworthiopsis attenuata', 'Asphodelaceae', 'Zebra haworthia', 'Haworthia zèbre', 'Haworthia cebra', 'succulent', 'I', 'MB', 'L', 'cac', 10, 30, 'L', '', 'E', 'N', 's_africa', 1, 'Haworthia attenuata'],
  ['sedum-morganianum', 'Sedum morganianum', 'Crassulaceae', 'Burro’s tail', 'Queue d’âne', 'Cola de burro', 'succulent', 'B', 'BS', 'L', 'cac', 10, 30, 'L', '', 'E', 'N', 'mexico', 0],
  ['curio-rowleyanus', 'Curio rowleyanus', 'Asteraceae', 'String of pearls', 'Plante chapelet', 'Rosario', 'succulent', 'I', 'B', 'L', 'cac', 10, 27, 'L', 'sp', 'M', 'U', 's_africa', 0, 'Senecio rowleyanus'],
  ['kalanchoe-blossfeldiana', 'Kalanchoe blossfeldiana', 'Crassulaceae', 'Flaming Katy', 'Kalanchoé', 'Calanchoe', 'succulent', 'B', 'BS', 'L', 'cac', 10, 29, 'L', 'wi sp', 'E', 'T', 'madagascar', 1],
  ['aeonium-arboreum', 'Aeonium arboreum', 'Crassulaceae', 'Tree aeonium', 'Aéonium', 'Bejeque arbóreo', 'succulent', 'O', 'BS', 'L', 'cac', 5, 27, 'L', 'wi sp', 'E', 'U', 'macaronesia', 0],
  ['agave-americana', 'Agave americana', 'Asparagaceae', 'Century plant', 'Agave d’Amérique', 'Pita', 'succulent', 'O', 'S', 'L', 'cac', -5, 35, 'L', '', 'E', 'U', 'mexico', 0],
  ['portulacaria-afra', 'Portulacaria afra', 'Didiereaceae', 'Elephant bush', 'Pourpier en arbre', 'Árbol de la abundancia', 'succulent', 'B', 'BS', 'L', 'cac', 7, 30, 'L', '', 'E', 'U', 's_africa', 0],
  ['sempervivum-tectorum', 'Sempervivum tectorum', 'Crassulaceae', 'Common houseleek', 'Joubarbe des toits', 'Siempreviva mayor', 'succulent', 'O', 'S', 'L', 'cac sand', -25, 30, 'L', 'su', 'E', 'U', 'europe', 0],
  ['lithops', 'Lithops spp.', 'Aizoaceae', 'Living stones', 'Plantes cailloux', 'Piedras vivas', 'succulent', 'I', 'BS', 'L', 'cac', 10, 30, 'L', 'au', 'D', 'U', 's_africa', 0],
  ['euphorbia-milii', 'Euphorbia milii', 'Euphorbiaceae', 'Crown of thorns', 'Épine du Christ', 'Corona de Cristo', 'succulent', 'B', 'BS', 'L', 'cac', 10, 32, 'L', 'all', 'E', 'T', 'madagascar', 0],
  ['euphorbia-trigona', 'Euphorbia trigona', 'Euphorbiaceae', 'African milk tree', 'Euphorbe trigone', 'Cardón africano', 'succulent', 'I', 'BS', 'L', 'cac', 10, 30, 'L', '', 'E', 'U', 'trop_africa', 0],
  ['schlumbergera-truncata', 'Schlumbergera truncata', 'Cactaceae', 'Holiday cactus', 'Cactus de Noël', 'Cactus de Navidad', 'cactus', 'I', 'MB', 'M', 'orc cac', 13, 27, 'M', 'au wi', 'E', 'N', 's_america', 1],
  ['schlumbergera-gaertneri', 'Schlumbergera gaertneri', 'Cactaceae', 'Easter cactus', 'Cactus de Pâques', 'Cactus de Pascua', 'cactus', 'I', 'MB', 'M', 'orc cac', 13, 27, 'M', 'sp', 'E', 'N', 's_america', 0, 'Hatiora gaertneri|Rhipsalidopsis gaertneri'],
  ['opuntia-microdasys', 'Opuntia microdasys', 'Cactaceae', 'Bunny ears cactus', 'Oreilles de lapin', 'Nopalillo cegador', 'cactus', 'B', 'S', 'L', 'cac', 7, 35, 'L', 'su', 'E', 'U', 'mexico', 0],
  ['mammillaria-elongata', 'Mammillaria elongata', 'Cactaceae', 'Ladyfinger cactus', 'Mammillaria elongata', 'Biznaga dedos de dama', 'cactus', 'B', 'S', 'L', 'cac', 7, 35, 'L', 'sp', 'E', 'U', 'mexico', 1],
  ['mammillaria-hahniana', 'Mammillaria hahniana', 'Cactaceae', 'Old lady cactus', 'Mammillaria hahniana', 'Biznaga cabeza de viejo', 'cactus', 'B', 'S', 'L', 'cac', 7, 35, 'L', 'sp', 'E', 'U', 'mexico', 0],
  ['kroenleinia-grusonii', 'Kroenleinia grusonii', 'Cactaceae', 'Golden barrel cactus', 'Coussin de belle-mère', 'Asiento de suegra', 'cactus', 'B', 'S', 'L', 'cac', 5, 35, 'L', 'su', 'E', 'U', 'mexico', 0, 'Echinocactus grusonii'],
  ['cereus-repandus', 'Cereus repandus', 'Cactaceae', 'Peruvian apple cactus', 'Cierge du Pérou', 'Cardón de dato', 'cactus', 'B', 'S', 'L', 'cac', 7, 35, 'L', 'su', 'E', 'U', 's_america caribbean', 0, 'Cereus peruvianus'],
  ['astrophytum-myriostigma', 'Astrophytum myriostigma', 'Cactaceae', 'Bishop’s cap', 'Mitre d’évêque', 'Birrete de obispo', 'cactus', 'B', 'S', 'L', 'cac', 7, 35, 'L', 'su', 'M', 'U', 'mexico', 0],
  ['gymnocalycium-mihanovichii', 'Gymnocalycium mihanovichii', 'Cactaceae', 'Moon cactus', 'Cactus lune', 'Cactus luna', 'cactus', 'I', 'B', 'L', 'cac', 10, 32, 'L', 'su', 'M', 'U', 's_america', 0],
  ['rhipsalis-baccifera', 'Rhipsalis baccifera', 'Cactaceae', 'Mistletoe cactus', 'Rhipsalis', 'Cactus muérdago', 'cactus', 'I', 'MB', 'M', 'orc', 13, 27, 'M', 'sp', 'E', 'N', 's_america c_america trop_africa', 0],
  ['epiphyllum-oxypetalum', 'Epiphyllum oxypetalum', 'Cactaceae', 'Queen of the night', 'Reine de la nuit', 'Dama de noche', 'cactus', 'B', 'B', 'M', 'orc', 10, 30, 'M', 'su', 'E', 'U', 'mexico c_america', 0],
  ['echinopsis', 'Echinopsis spp.', 'Cactaceae', 'Easter lily cactus', 'Échinopsis', 'Equinopsis', 'cactus', 'B', 'S', 'L', 'cac', 5, 35, 'L', 'sp su', 'E', 'U', 's_america', 0],
  ['cleistocactus-strausii', 'Cleistocactus strausii', 'Cactaceae', 'Silver torch cactus', 'Cierge argenté', 'Cactus antorcha plateada', 'cactus', 'B', 'S', 'L', 'cac', 0, 35, 'L', 'su', 'E', 'U', 's_america', 0],
];
