import type { PackingCategory, Priority } from '@/constants/domain';

/**
 * Built-in packing catalogue (original content). Each item has a stable id, a
 * category, names in every UI language, a default priority, an optional default
 * quantity and the templates it belongs to. When added to a list, the item name is
 * copied in the user's language: from then on it is the user's own data.
 */
export const PACKING_TEMPLATES = ['weekend', 'business', 'beach', 'winter', 'family', 'international'] as const;
export type PackingTemplateKey = (typeof PACKING_TEMPLATES)[number];

type Lang = 'en' | 'fr' | 'es';
export interface CatalogItem {
  id: string;
  category: Exclude<PackingCategory, 'custom'>;
  name: Record<Lang, string>;
  priority: Priority;
  quantity?: number;
  templates: PackingTemplateKey[];
}

const ALL: PackingTemplateKey[] = [...PACKING_TEMPLATES];
const W = 'weekend';
const B = 'business';
const S = 'beach';
const C = 'winter';
const F = 'family';
const I = 'international';

const item = (id: string, category: CatalogItem['category'], en: string, fr: string, es: string, templates: PackingTemplateKey[], priority: Priority = 'medium', quantity?: number): CatalogItem => ({
  id,
  category,
  name: { en, fr, es },
  priority,
  templates,
  ...(quantity ? { quantity } : {}),
});

export const PACKING_CATALOG: CatalogItem[] = [
  // Documents ---------------------------------------------------------------
  item('doc-id-card', 'documents', 'ID card or passport', "Carte d'identité ou passeport", 'DNI o pasaporte', ALL, 'high'),
  item('doc-passport', 'documents', 'Passport (check expiry date)', "Passeport (vérifier la date d'expiration)", 'Pasaporte (revisa la caducidad)', [I], 'high'),
  item('doc-visa', 'documents', 'Visa or entry authorisation, if required', "Visa ou autorisation d'entrée, si nécessaire", 'Visado o autorización de entrada, si hace falta', [I], 'high'),
  item('doc-tickets', 'documents', 'Transport tickets (printed or offline)', 'Billets de transport (imprimés ou hors ligne)', 'Billetes de transporte (impresos o sin conexión)', ALL, 'high'),
  item('doc-booking-confirmations', 'documents', 'Accommodation confirmations', "Confirmations d'hébergement", 'Confirmaciones de alojamiento', ALL, 'medium'),
  item('doc-insurance', 'documents', 'Travel insurance details', "Coordonnées de l'assurance voyage", 'Datos del seguro de viaje', [I, F, C], 'high'),
  item('doc-health-card', 'documents', 'Health insurance card', "Carte d'assurance maladie", 'Tarjeta sanitaria', [I, F], 'medium'),
  item('doc-driving-licence', 'documents', 'Driving licence', 'Permis de conduire', 'Permiso de conducir', [W, B, F], 'medium'),
  item('doc-intl-licence', 'documents', 'International driving permit, if renting a car abroad', 'Permis international, si location de voiture', 'Permiso internacional, si alquilas coche', [I], 'low'),
  item('doc-emergency-contacts', 'documents', 'Emergency contacts on paper', "Contacts d'urgence sur papier", 'Contactos de emergencia en papel', [I, F], 'medium'),
  item('doc-copies', 'documents', 'Copies of key documents, stored separately', 'Copies des documents importants, rangées à part', 'Copias de documentos clave, guardadas aparte', [I], 'medium'),
  item('doc-business-cards', 'documents', 'Business cards', 'Cartes de visite', 'Tarjetas de visita', [B], 'low'),
  item('doc-meeting-notes', 'documents', 'Meeting agenda and notes', 'Ordre du jour et notes de réunion', 'Agenda y notas de reuniones', [B], 'medium'),
  item('doc-children-docs', 'documents', "Children's ID and travel consent if needed", "Pièces d'identité des enfants et autorisation de sortie si nécessaire", 'Documentación de los niños y permiso de viaje si hace falta', [F, I], 'high'),
  // Clothing ----------------------------------------------------------------
  item('clo-underwear', 'clothing', 'Underwear', 'Sous-vêtements', 'Ropa interior', ALL, 'high', 3),
  item('clo-socks', 'clothing', 'Socks', 'Chaussettes', 'Calcetines', ALL, 'high', 3),
  item('clo-tshirts', 'clothing', 'T-shirts or tops', 'T-shirts ou hauts', 'Camisetas o tops', [W, S, F, I], 'medium', 3),
  item('clo-trousers', 'clothing', 'Trousers or jeans', 'Pantalons ou jeans', 'Pantalones o vaqueros', [W, B, C, F, I], 'medium', 2),
  item('clo-sleepwear', 'clothing', 'Sleepwear', 'Pyjama', 'Pijama', ALL, 'medium'),
  item('clo-light-jacket', 'clothing', 'Light jacket or sweater', 'Veste légère ou pull', 'Chaqueta ligera o jersey', [W, B, S, F, I], 'medium'),
  item('clo-walking-shoes', 'clothing', 'Comfortable walking shoes', 'Chaussures confortables pour marcher', 'Calzado cómodo para caminar', [W, F, I, C], 'high'),
  item('clo-suit', 'clothing', 'Suit or business outfit', 'Costume ou tenue professionnelle', 'Traje o ropa de trabajo', [B], 'high'),
  item('clo-shirts', 'clothing', 'Dress shirts or blouses', 'Chemises ou chemisiers', 'Camisas o blusas', [B], 'medium', 2),
  item('clo-formal-shoes', 'clothing', 'Formal shoes', 'Chaussures habillées', 'Zapatos de vestir', [B], 'medium'),
  item('clo-belt', 'clothing', 'Belt', 'Ceinture', 'Cinturón', [B], 'low'),
  item('clo-swimsuit', 'clothing', 'Swimsuit', 'Maillot de bain', 'Bañador', [S, F], 'high', 2),
  item('clo-cover-up', 'clothing', 'Beach cover-up or sarong', 'Paréo ou tunique de plage', 'Pareo o vestido de playa', [S], 'low'),
  item('clo-sandals', 'clothing', 'Sandals or flip-flops', 'Sandales ou tongs', 'Sandalias o chanclas', [S, F], 'medium'),
  item('clo-shorts', 'clothing', 'Shorts', 'Shorts', 'Pantalones cortos', [S, F], 'medium', 2),
  item('clo-sun-hat', 'clothing', 'Sun hat or cap', 'Chapeau de soleil ou casquette', 'Sombrero o gorra', [S, F], 'medium'),
  item('clo-winter-coat', 'clothing', 'Warm winter coat', "Manteau chaud d'hiver", 'Abrigo de invierno', [C], 'high'),
  item('clo-thermal-layers', 'clothing', 'Thermal base layers', 'Sous-couches thermiques', 'Ropa térmica', [C], 'high', 2),
  item('clo-fleece', 'clothing', 'Fleece or wool mid-layer', 'Polaire ou pull en laine', 'Forro polar o jersey de lana', [C], 'medium'),
  item('clo-gloves', 'clothing', 'Gloves', 'Gants', 'Guantes', [C], 'high'),
  item('clo-beanie', 'clothing', 'Warm hat', 'Bonnet', 'Gorro', [C], 'high'),
  item('clo-scarf', 'clothing', 'Scarf or neck warmer', 'Écharpe ou tour de cou', 'Bufanda o braga', [C], 'medium'),
  item('clo-snow-boots', 'clothing', 'Waterproof boots', 'Bottes imperméables', 'Botas impermeables', [C], 'high'),
  item('clo-wool-socks', 'clothing', 'Wool socks', 'Chaussettes en laine', 'Calcetines de lana', [C], 'medium', 3),
  item('clo-rain-jacket', 'clothing', 'Rain jacket', 'Veste de pluie', 'Chubasquero', [I, F], 'medium'),
  item('clo-kids-spare-outfit', 'clothing', 'Spare outfit for each child', 'Tenue de rechange par enfant', 'Muda de repuesto por niño', [F], 'high'),
  item('clo-evening-outfit', 'clothing', 'One smarter outfit for evenings', 'Une tenue plus habillée pour le soir', 'Un conjunto más arreglado para la noche', [W, I], 'low'),
  // Toiletries --------------------------------------------------------------
  item('toi-toothbrush', 'toiletries', 'Toothbrush and toothpaste', 'Brosse à dents et dentifrice', 'Cepillo y pasta de dientes', ALL, 'high'),
  item('toi-deodorant', 'toiletries', 'Deodorant', 'Déodorant', 'Desodorante', ALL, 'medium'),
  item('toi-shampoo', 'toiletries', 'Travel-size shampoo and shower gel', 'Shampoing et gel douche format voyage', 'Champú y gel en formato viaje', ALL, 'medium'),
  item('toi-hairbrush', 'toiletries', 'Hairbrush or comb', 'Brosse ou peigne', 'Cepillo o peine', ALL, 'low'),
  item('toi-razor', 'toiletries', 'Razor', 'Rasoir', 'Maquinilla de afeitar', [W, B, I], 'low'),
  item('toi-sunscreen', 'toiletries', 'Sunscreen', 'Crème solaire', 'Protector solar', [S, F, C], 'high'),
  item('toi-after-sun', 'toiletries', 'After-sun lotion', 'Lait après-soleil', 'Loción para después del sol', [S], 'low'),
  item('toi-lip-balm', 'toiletries', 'Lip balm', 'Baume à lèvres', 'Bálsamo labial', [C, S], 'medium'),
  item('toi-moisturiser', 'toiletries', 'Moisturiser', 'Crème hydratante', 'Crema hidratante', [C, I], 'low'),
  item('toi-contact-lenses', 'toiletries', 'Contact lenses and solution', 'Lentilles et produit d’entretien', 'Lentillas y líquido', [W, B, I], 'medium'),
  item('toi-insect-repellent', 'toiletries', 'Insect repellent', 'Répulsif anti-moustiques', 'Repelente de insectos', [S, F, I], 'medium'),
  item('toi-wet-wipes', 'toiletries', 'Wet wipes', 'Lingettes', 'Toallitas húmedas', [F], 'medium'),
  item('toi-liquids-bag', 'toiletries', 'Clear bag for cabin liquids', 'Pochette transparente pour liquides en cabine', 'Bolsa transparente para líquidos de cabina', [I, B], 'medium'),
  item('toi-hand-sanitiser', 'toiletries', 'Hand sanitiser', 'Gel hydroalcoolique', 'Gel hidroalcohólico', [F, I], 'medium'),
  // Electronics -------------------------------------------------------------
  item('ele-phone-charger', 'electronics', 'Phone charger and cable', 'Chargeur et câble de téléphone', 'Cargador y cable del móvil', ALL, 'high'),
  item('ele-power-bank', 'electronics', 'Power bank (in cabin baggage)', 'Batterie externe (en bagage cabine)', 'Batería externa (en equipaje de mano)', ALL, 'medium'),
  item('ele-adapter', 'electronics', 'Plug adapter for the destination', 'Adaptateur de prise pour la destination', 'Adaptador de enchufe para el destino', [I], 'high'),
  item('ele-headphones', 'electronics', 'Headphones', 'Écouteurs ou casque', 'Auriculares', ALL, 'medium'),
  item('ele-laptop', 'electronics', 'Laptop and charger', 'Ordinateur portable et chargeur', 'Portátil y cargador', [B], 'high'),
  item('ele-presentation-clicker', 'electronics', 'Presentation remote and video adapter', 'Télécommande de présentation et adaptateur vidéo', 'Mando de presentaciones y adaptador de vídeo', [B], 'low'),
  item('ele-camera', 'electronics', 'Camera, battery and memory card', 'Appareil photo, batterie et carte mémoire', 'Cámara, batería y tarjeta de memoria', [S, F, I], 'low'),
  item('ele-ereader', 'electronics', 'E-reader or a book', 'Liseuse ou un livre', 'Lector electrónico o un libro', [W, S, I], 'low'),
  item('ele-multi-socket', 'electronics', 'Small multi-socket or USB hub', 'Petite multiprise ou hub USB', 'Regleta pequeña o hub USB', [B, F], 'low'),
  item('ele-offline-maps', 'electronics', 'Offline maps downloaded on your phone', 'Cartes hors ligne téléchargées sur le téléphone', 'Mapas sin conexión descargados en el móvil', [I, W], 'medium'),
  item('ele-tablet-kids', 'electronics', 'Tablet with downloaded content for the kids', 'Tablette avec contenus téléchargés pour les enfants', 'Tableta con contenido descargado para los niños', [F], 'low'),
  item('ele-waterproof-case', 'electronics', 'Waterproof phone pouch', 'Pochette étanche pour téléphone', 'Funda impermeable para el móvil', [S], 'low'),
  // Medication --------------------------------------------------------------
  item('med-prescriptions', 'medication', 'Prescription medicines (enough for the whole trip)', 'Médicaments sur ordonnance (pour tout le séjour)', 'Medicamentos con receta (para todo el viaje)', ALL, 'high'),
  item('med-prescription-copy', 'medication', 'Copy of prescriptions', 'Copie des ordonnances', 'Copia de las recetas', [I], 'medium'),
  item('med-painkillers', 'medication', 'Pain relief tablets', 'Antidouleurs', 'Analgésicos', ALL, 'medium'),
  item('med-plasters', 'medication', 'Plasters and blister care', 'Pansements et soin des ampoules', 'Tiritas y apósitos para ampollas', [W, F, I, C], 'medium'),
  item('med-motion-sickness', 'medication', 'Motion sickness remedy', 'Médicament contre le mal des transports', 'Remedio para el mareo', [F, S], 'low'),
  item('med-allergy', 'medication', 'Allergy medication', 'Médicaments contre les allergies', 'Medicación para alergias', [S, F, I], 'low'),
  item('med-digestive', 'medication', 'Digestive remedies', 'Médicaments pour la digestion', 'Remedios digestivos', [I, F], 'low'),
  item('med-thermometer', 'medication', 'Thermometer', 'Thermomètre', 'Termómetro', [F], 'low'),
  item('med-kids-medicine', 'medication', "Children's fever and pain medicine", 'Médicaments enfants contre fièvre et douleur', 'Medicamentos infantiles para fiebre y dolor', [F], 'high'),
  // Accessories -------------------------------------------------------------
  item('acc-sunglasses', 'accessories', 'Sunglasses', 'Lunettes de soleil', 'Gafas de sol', [S, F, C, W], 'medium'),
  item('acc-glasses', 'accessories', 'Glasses and case', 'Lunettes de vue et étui', 'Gafas graduadas y funda', ALL, 'medium'),
  item('acc-day-bag', 'accessories', 'Small day bag', 'Petit sac pour la journée', 'Mochila pequeña para el día', [W, S, F, I], 'medium'),
  item('acc-umbrella', 'accessories', 'Compact umbrella', 'Parapluie compact', 'Paraguas compacto', [W, B, I], 'low'),
  item('acc-beach-towel', 'accessories', 'Beach towel', 'Serviette de plage', 'Toalla de playa', [S, F], 'medium'),
  item('acc-beach-bag', 'accessories', 'Beach bag', 'Sac de plage', 'Bolsa de playa', [S], 'low'),
  item('acc-snorkel', 'accessories', 'Snorkel mask', 'Masque de snorkeling', 'Gafas de buceo', [S], 'low'),
  item('acc-hand-warmers', 'accessories', 'Hand warmers', 'Chauffe-mains', 'Calentadores de manos', [C], 'low'),
  item('acc-ski-goggles', 'accessories', 'Ski goggles', 'Masque de ski', 'Gafas de esquí', [C], 'low'),
  item('acc-laundry-bag', 'accessories', 'Laundry bag', 'Sac à linge', 'Bolsa para la ropa sucia', [F, I, B], 'low'),
  item('acc-travel-pillow', 'accessories', 'Travel pillow', 'Coussin de voyage', 'Almohada de viaje', [I], 'low'),
  item('acc-luggage-tags', 'accessories', 'Luggage tags', 'Étiquettes de bagages', 'Etiquetas para el equipaje', [I, F], 'low'),
  item('acc-toys', 'accessories', 'A few favourite toys and games', 'Quelques jouets et jeux préférés', 'Algunos juguetes y juegos favoritos', [F], 'medium'),
  item('acc-stroller', 'accessories', 'Stroller or baby carrier', 'Poussette ou porte-bébé', 'Carrito o mochila portabebés', [F], 'medium'),
  // Travel essentials -------------------------------------------------------
  item('ess-wallet', 'essentials', 'Wallet and bank cards', 'Portefeuille et cartes bancaires', 'Cartera y tarjetas', ALL, 'high'),
  item('ess-cash', 'essentials', 'Some local cash', 'Un peu d’argent local', 'Algo de efectivo local', [I, W], 'medium'),
  item('ess-keys', 'essentials', 'House keys', 'Clés de la maison', 'Llaves de casa', ALL, 'high'),
  item('ess-water-bottle', 'essentials', 'Reusable water bottle', 'Gourde réutilisable', 'Botella de agua reutilizable', [W, S, F, I], 'medium'),
  item('ess-snacks', 'essentials', 'Snacks for the journey', 'En-cas pour le trajet', 'Tentempiés para el trayecto', [F, W, I], 'low'),
  item('ess-pen', 'essentials', 'Pen (for arrival forms)', "Stylo (pour les formulaires d'arrivée)", 'Bolígrafo (para formularios de llegada)', [I, B], 'low'),
  item('ess-padlock', 'essentials', 'Small luggage lock', 'Petit cadenas pour bagage', 'Candado pequeño para la maleta', [I], 'low'),
  item('ess-reusable-bag', 'essentials', 'Foldable shopping bag', 'Sac de courses pliable', 'Bolsa plegable', [W, F, I], 'low'),
  item('ess-earplugs', 'essentials', 'Earplugs and eye mask', 'Bouchons d’oreilles et masque de nuit', 'Tapones y antifaz', [I, B], 'low'),
  item('ess-baby-food', 'essentials', 'Baby food, bottles and bibs', 'Petits pots, biberons et bavoirs', 'Comida de bebé, biberones y baberos', [F], 'high'),
  item('ess-nappies', 'essentials', 'Nappies and changing mat', 'Couches et tapis à langer', 'Pañales y cambiador', [F], 'high'),
];

/** Items of a built-in template, in catalogue order (category grouping is applied by the UI). */
export function templateItems(key: PackingTemplateKey): CatalogItem[] {
  return PACKING_CATALOG.filter((i) => i.templates.includes(key));
}

export function catalogName(item: CatalogItem, lang: string): string {
  return item.name[(['en', 'fr', 'es'] as const).find((l) => l === lang) ?? 'en'];
}
