import type { IconName } from '@factory/design-system';

import type { Species } from '@/domain/types';
import type { InterfaceLanguage } from '@/i18n';

/**
 * Built-in care checklists. Informative, practical reminders only: no dosages, no
 * diagnosis, no vaccination schedule. Anything medical points back to the vet.
 * Order matters: the first FREE_LIMITS.freeTemplates entries are free.
 *
 * Each item is [English, Français, Español].
 */
export type TemplateCategory = 'essentials' | 'routine' | 'travel' | 'health' | 'seasonal' | 'life_events' | 'habitat';

export interface CareTemplate {
  id: string;
  category: TemplateCategory;
  icon: IconName;
  species?: Species[];
  title: [string, string, string];
  items: [string, string, string][];
}

export const TEMPLATES: CareTemplate[] = [
  {
    id: 'new_pet',
    category: 'essentials',
    icon: 'home-outline',
    title: ['New Pet Checklist', 'Checklist nouvel animal', 'Lista para una nueva mascota'],
    items: [
      ['Prepare a quiet resting place', 'Préparer un coin calme pour dormir', 'Preparar un lugar tranquilo para descansar'],
      ['Buy food and water bowls', 'Acheter gamelles et bol d’eau', 'Comprar comedero y bebedero'],
      ['Ask the previous owner or shelter which food the pet eats', 'Demander au refuge ou à l’ancien propriétaire quelle nourriture il mange', 'Preguntar al refugio o antiguo dueño qué comida toma'],
      ['Book a first check-up with a vet', 'Prendre un premier rendez-vous chez le vétérinaire', 'Reservar una primera revisión con el veterinario'],
      ['Collect existing health records and ID papers', 'Récupérer le carnet de santé et les papiers d’identification', 'Reunir la cartilla sanitaria y los documentos de identificación'],
      ['Add the pet’s profile and photo in PetCare', 'Créer le profil et ajouter une photo dans PetCare', 'Crear el perfil y añadir una foto en PetCare'],
      ['Check pet insurance options', 'Se renseigner sur l’assurance animale', 'Informarse sobre seguros para mascotas'],
    ],
  },
  {
    id: 'puppy',
    category: 'essentials',
    icon: 'paw-outline',
    species: ['dog'],
    title: ['Puppy Checklist', 'Checklist chiot', 'Lista para cachorro'],
    items: [
      ['Collar, harness and leash adapted to size', 'Collier, harnais et laisse adaptés à la taille', 'Collar, arnés y correa adecuados a su tamaño'],
      ['Crate or bed in a calm spot', 'Cage de transport ou panier dans un endroit calme', 'Transportín o cama en un lugar tranquilo'],
      ['Chew toys safe for puppies', 'Jouets à mâcher adaptés aux chiots', 'Juguetes para morder aptos para cachorros'],
      ['Ask the vet about vaccinations and deworming', 'Demander au vétérinaire le programme de vaccins et vermifuges', 'Preguntar al veterinario por vacunas y desparasitación'],
      ['Plan short, frequent potty breaks', 'Prévoir des sorties courtes et fréquentes pour la propreté', 'Planificar salidas cortas y frecuentes para hacer sus necesidades'],
      ['Start gentle socialisation with people and sounds', 'Commencer une socialisation douce (personnes, bruits)', 'Iniciar una socialización suave con personas y sonidos'],
      ['Puppy-proof cables and small objects', 'Mettre câbles et petits objets hors de portée', 'Proteger cables y objetos pequeños'],
    ],
  },
  {
    id: 'kitten',
    category: 'essentials',
    icon: 'paw-outline',
    species: ['cat'],
    title: ['Kitten Checklist', 'Checklist chaton', 'Lista para gatito'],
    items: [
      ['Litter box and litter in a quiet place', 'Litière dans un endroit tranquille', 'Arenero en un lugar tranquilo'],
      ['Scratching post', 'Griffoir', 'Rascador'],
      ['Food and water away from the litter box', 'Nourriture et eau loin de la litière', 'Comida y agua lejos del arenero'],
      ['Ask the vet about vaccinations, deworming and sterilisation', 'Demander au vétérinaire : vaccins, vermifuges, stérilisation', 'Preguntar al veterinario: vacunas, desparasitación y esterilización'],
      ['Secure windows and balconies', 'Sécuriser fenêtres et balcon', 'Asegurar ventanas y balcones'],
      ['Hiding places and high perches', 'Cachettes et perchoirs en hauteur', 'Escondites y lugares en altura'],
      ['Short daily play sessions', 'Petites séances de jeu chaque jour', 'Sesiones cortas de juego cada día'],
    ],
  },
  {
    id: 'travel',
    category: 'travel',
    icon: 'airplane-outline',
    title: ['Travel Preparation', 'Préparer un voyage', 'Preparar un viaje'],
    items: [
      ['Check entry rules for the destination with the authorities', 'Vérifier les règles d’entrée de la destination auprès des autorités', 'Consultar los requisitos de entrada del destino con las autoridades'],
      ['Ask the vet which certificates are required', 'Demander au vétérinaire les certificats nécessaires', 'Preguntar al veterinario qué certificados se necesitan'],
      ['Pack food for the whole trip plus extra', 'Emporter la nourriture pour tout le séjour, avec une marge', 'Llevar comida para todo el viaje y un poco más'],
      ['Bring current treatments as prescribed', 'Emporter les traitements en cours, tels que prescrits', 'Llevar los tratamientos en curso tal como se recetaron'],
      ['Copy of health records and ID in PetCare', 'Copie du carnet de santé et des papiers dans PetCare', 'Copia de la cartilla y documentos en PetCare'],
      ['Find a vet near the destination', 'Repérer un vétérinaire sur place', 'Localizar un veterinario en el destino'],
      ['Familiar blanket or toy', 'Couverture ou jouet familier', 'Manta o juguete conocido'],
    ],
  },
  {
    id: 'grooming_routine',
    category: 'routine',
    icon: 'cut-outline',
    title: ['Grooming Routine', 'Routine de toilettage', 'Rutina de aseo'],
    items: [
      ['Brush the coat', 'Brosser le pelage', 'Cepillar el pelo'],
      ['Check ears for dirt or smell', 'Regarder les oreilles (saleté, odeur)', 'Revisar las orejas (suciedad, olor)'],
      ['Check nails and paw pads', 'Vérifier griffes et coussinets', 'Revisar uñas y almohadillas'],
      ['Wipe around the eyes gently', 'Nettoyer doucement le contour des yeux', 'Limpiar suavemente alrededor de los ojos'],
      ['Note anything unusual to show the vet', 'Noter tout changement inhabituel pour en parler au vétérinaire', 'Anotar cualquier cambio inusual para comentarlo con el veterinario'],
      ['Reward with a treat', 'Récompenser avec une friandise', 'Premiar con una golosina'],
    ],
  },
  {
    id: 'weekly_dog',
    category: 'routine',
    icon: 'calendar-outline',
    species: ['dog'],
    title: ['Weekly Dog Care', 'Soins hebdomadaires du chien', 'Cuidado semanal del perro'],
    items: [
      ['Wash bowls and bedding', 'Laver gamelles et couchage', 'Lavar comederos y cama'],
      ['Full brushing session', 'Séance de brossage complète', 'Sesión completa de cepillado'],
      ['Check stock of food and treats', 'Vérifier le stock de nourriture et friandises', 'Revisar las existencias de comida y premios'],
      ['One longer walk or outing', 'Une promenade ou sortie plus longue', 'Un paseo o salida más largo'],
      ['Training refresher (5–10 min)', 'Petit rappel d’éducation (5–10 min)', 'Repaso de adiestramiento (5–10 min)'],
      ['Clean toys', 'Nettoyer les jouets', 'Limpiar los juguetes'],
      ['Log weight in PetCare', 'Noter le poids dans PetCare', 'Registrar el peso en PetCare'],
    ],
  },
  {
    id: 'cat_routine',
    category: 'routine',
    icon: 'repeat-outline',
    species: ['cat'],
    title: ['Cat Care Routine', 'Routine soins du chat', 'Rutina de cuidado del gato'],
    items: [
      ['Scoop the litter box', 'Nettoyer la litière', 'Limpiar el arenero'],
      ['Fresh water', 'Eau fraîche', 'Agua fresca'],
      ['Play session', 'Séance de jeu', 'Sesión de juego'],
      ['Brush (more often for long hair)', 'Brossage (plus souvent pour les poils longs)', 'Cepillado (más a menudo si tiene pelo largo)'],
      ['Weekly: full litter change', 'Chaque semaine : changer toute la litière', 'Cada semana: cambiar toda la arena'],
      ['Check scratching post condition', 'Vérifier l’état du griffoir', 'Revisar el estado del rascador'],
    ],
  },
  {
    id: 'vet_visit',
    category: 'health',
    icon: 'medkit-outline',
    title: ['Vet Visit Preparation', 'Préparer une visite chez le vétérinaire', 'Preparar la visita al veterinario'],
    items: [
      ['Write down your questions', 'Noter ses questions', 'Anotar tus preguntas'],
      ['Note what you observed and since when', 'Noter ce que vous avez observé et depuis quand', 'Anotar lo que has observado y desde cuándo'],
      ['Bring the health record or export the PetCare summary', 'Apporter le carnet ou exporter la fiche PetCare', 'Llevar la cartilla o exportar el resumen de PetCare'],
      ['List current food and treatments', 'Lister alimentation et traitements en cours', 'Enumerar alimentación y tratamientos actuales'],
      ['Carrier or leash ready', 'Caisse de transport ou laisse prête', 'Transportín o correa preparados'],
      ['After the visit: record notes and next dates', 'Après la visite : noter le compte-rendu et les prochaines dates', 'Después de la visita: registrar notas y próximas fechas'],
    ],
  },
  {
    id: 'daily_dog',
    category: 'routine',
    icon: 'sunny-outline',
    species: ['dog'],
    title: ['Daily Dog Care', 'Soins quotidiens du chien', 'Cuidado diario del perro'],
    items: [
      ['Morning walk', 'Promenade du matin', 'Paseo de la mañana'],
      ['Meals at the usual times', 'Repas aux heures habituelles', 'Comidas a la hora de siempre'],
      ['Fresh water', 'Eau fraîche', 'Agua fresca'],
      ['Play or sniffing game', 'Jeu ou jeu de flair', 'Juego o juego de olfato'],
      ['Evening walk', 'Promenade du soir', 'Paseo de la tarde'],
      ['Quick paw check after walks', 'Coup d’œil aux pattes après la balade', 'Revisar las patas tras el paseo'],
    ],
  },
  {
    id: 'daily_cat',
    category: 'routine',
    icon: 'moon-outline',
    species: ['cat'],
    title: ['Daily Cat Care', 'Soins quotidiens du chat', 'Cuidado diario del gato'],
    items: [
      ['Meals at the usual times', 'Repas aux heures habituelles', 'Comidas a la hora de siempre'],
      ['Fresh water (fountain or bowl)', 'Eau fraîche (fontaine ou bol)', 'Agua fresca (fuente o cuenco)'],
      ['Scoop the litter', 'Nettoyer la litière', 'Limpiar el arenero'],
      ['10 minutes of play', '10 minutes de jeu', '10 minutos de juego'],
      ['Cuddles if your cat enjoys them', 'Câlins si votre chat apprécie', 'Mimos si a tu gato le gustan'],
    ],
  },
  {
    id: 'pet_proofing',
    category: 'essentials',
    icon: 'shield-outline',
    title: ['Pet-proofing the Home', 'Sécuriser la maison', 'Hogar seguro para mascotas'],
    items: [
      ['Store cleaning products out of reach', 'Ranger les produits ménagers hors de portée', 'Guardar los productos de limpieza fuera de su alcance'],
      ['Check that houseplants are safe for pets (ask your vet)', 'Vérifier que les plantes ne sont pas toxiques (demander au vétérinaire)', 'Comprobar que las plantas no son tóxicas (consultar al veterinario)'],
      ['Hide or protect electric cables', 'Cacher ou protéger les câbles électriques', 'Ocultar o proteger los cables eléctricos'],
      ['Keep human medicines locked away', 'Mettre les médicaments humains sous clé', 'Guardar bajo llave los medicamentos humanos'],
      ['Close toilet lids and washing machine doors', 'Fermer abattants des WC et hublot du lave-linge', 'Cerrar tapas del inodoro y puerta de la lavadora'],
      ['Secure bins', 'Sécuriser les poubelles', 'Asegurar los cubos de basura'],
    ],
  },
  {
    id: 'emergency_kit',
    category: 'health',
    icon: 'alert-circle-outline',
    title: ['Pet Emergency Kit', 'Kit d’urgence pour animal', 'Kit de emergencia para mascotas'],
    items: [
      ['Vet and emergency clinic phone numbers', 'Numéros du vétérinaire et de la clinique d’urgence', 'Teléfonos del veterinario y de la clínica de urgencias'],
      ['Copy of health records', 'Copie du carnet de santé', 'Copia de la cartilla sanitaria'],
      ['3 days of food and water', '3 jours de nourriture et d’eau', 'Comida y agua para 3 días'],
      ['Spare leash, carrier, blanket', 'Laisse, caisse et couverture de rechange', 'Correa, transportín y manta de repuesto'],
      ['Current treatments, as prescribed', 'Traitements en cours, tels que prescrits', 'Tratamientos actuales, tal como se recetaron'],
      ['Recent photo of your pet', 'Photo récente de l’animal', 'Foto reciente de tu mascota'],
      ['Basic first-aid kit recommended by your vet', 'Trousse de premiers secours conseillée par le vétérinaire', 'Botiquín básico recomendado por tu veterinario'],
    ],
  },
  {
    id: 'senior_dog',
    category: 'health',
    icon: 'heart-outline',
    species: ['dog'],
    title: ['Senior Dog Comfort', 'Confort du chien âgé', 'Confort del perro mayor'],
    items: [
      ['Soft, supportive bed', 'Couchage moelleux et soutenant', 'Cama blanda y firme'],
      ['Non-slip rugs on smooth floors', 'Tapis antidérapants sur les sols lisses', 'Alfombras antideslizantes en suelos lisos'],
      ['Shorter, more frequent walks', 'Balades plus courtes et plus fréquentes', 'Paseos más cortos y frecuentes'],
      ['Ask the vet how often check-ups are advised', 'Demander au vétérinaire la fréquence de suivi conseillée', 'Preguntar al veterinario cada cuánto hacer revisiones'],
      ['Track weight monthly in PetCare', 'Suivre le poids chaque mois dans PetCare', 'Registrar el peso cada mes en PetCare'],
      ['Note changes in appetite or mobility for the vet', 'Noter les changements d’appétit ou de mobilité pour le vétérinaire', 'Anotar cambios de apetito o movilidad para el veterinario'],
    ],
  },
  {
    id: 'senior_cat',
    category: 'health',
    icon: 'heart-outline',
    species: ['cat'],
    title: ['Senior Cat Comfort', 'Confort du chat âgé', 'Confort del gato mayor'],
    items: [
      ['Litter box with a low entry', 'Litière à entrée basse', 'Arenero de entrada baja'],
      ['Steps or ramps to favourite spots', 'Marches ou rampes vers ses endroits préférés', 'Escalones o rampas a sus sitios favoritos'],
      ['Several water points', 'Plusieurs points d’eau', 'Varios puntos de agua'],
      ['Warm resting place', 'Coin de repos au chaud', 'Lugar de descanso cálido'],
      ['Ask the vet how often check-ups are advised', 'Demander au vétérinaire la fréquence de suivi conseillée', 'Preguntar al veterinario cada cuánto hacer revisiones'],
      ['Track weight in PetCare', 'Suivre le poids dans PetCare', 'Registrar el peso en PetCare'],
    ],
  },
  {
    id: 'rabbit_care',
    category: 'habitat',
    icon: 'leaf-outline',
    species: ['rabbit'],
    title: ['Rabbit Weekly Care', 'Soins hebdomadaires du lapin', 'Cuidado semanal del conejo'],
    items: [
      ['Unlimited fresh hay', 'Foin frais à volonté', 'Heno fresco a voluntad'],
      ['Clean the litter area', 'Nettoyer le coin litière', 'Limpiar la zona del arenero'],
      ['Daily time out of the enclosure', 'Sortie quotidienne hors de l’enclos', 'Tiempo diario fuera del recinto'],
      ['Check teeth and nails (ask your vet if unsure)', 'Vérifier dents et griffes (demander au vétérinaire en cas de doute)', 'Revisar dientes y uñas (consultar al veterinario si dudas)'],
      ['Wash water bottle or bowl', 'Laver biberon ou gamelle d’eau', 'Lavar bebedero o cuenco'],
      ['Brush during moulting', 'Brosser pendant la mue', 'Cepillar durante la muda'],
    ],
  },
  {
    id: 'bird_cage',
    category: 'habitat',
    icon: 'airplane-outline',
    species: ['bird'],
    title: ['Bird Cage Cleaning', 'Nettoyage de la cage', 'Limpieza de la jaula'],
    items: [
      ['Change the cage liner', 'Changer le fond de cage', 'Cambiar el fondo de la jaula'],
      ['Wash food and water dishes', 'Laver mangeoires et abreuvoirs', 'Lavar comederos y bebederos'],
      ['Clean perches and toys', 'Nettoyer perchoirs et jouets', 'Limpiar perchas y juguetes'],
      ['Rotate toys for variety', 'Varier les jouets', 'Rotar los juguetes'],
      ['Check the cage is away from drafts and kitchen fumes', 'Vérifier que la cage est loin des courants d’air et fumées de cuisine', 'Comprobar que la jaula está lejos de corrientes y humos de cocina'],
    ],
  },
  {
    id: 'aquarium',
    category: 'habitat',
    icon: 'fish-outline',
    species: ['fish'],
    title: ['Aquarium Maintenance', 'Entretien de l’aquarium', 'Mantenimiento del acuario'],
    items: [
      ['Partial water change as advised by your shop or vet', 'Changement d’eau partiel selon les conseils de votre spécialiste', 'Cambio parcial de agua según el consejo de tu especialista'],
      ['Test water and log results', 'Tester l’eau et noter les résultats', 'Analizar el agua y anotar los resultados'],
      ['Clean the glass', 'Nettoyer les vitres', 'Limpiar el cristal'],
      ['Check filter and heater', 'Vérifier filtre et chauffage', 'Revisar filtro y calentador'],
      ['Remove uneaten food', 'Retirer la nourriture non consommée', 'Retirar la comida sobrante'],
      ['Trim plants', 'Tailler les plantes', 'Podar las plantas'],
    ],
  },
  {
    id: 'reptile_habitat',
    category: 'habitat',
    icon: 'bug-outline',
    species: ['reptile'],
    title: ['Reptile Habitat Check', 'Contrôle du terrarium', 'Revisión del terrario'],
    items: [
      ['Check temperature in warm and cool zones', 'Vérifier la température des zones chaude et froide', 'Comprobar la temperatura de las zonas cálida y fría'],
      ['Check humidity level', 'Vérifier l’humidité', 'Comprobar la humedad'],
      ['Note UV lamp installation date', 'Noter la date de pose de la lampe UV', 'Anotar la fecha de instalación de la lámpara UV'],
      ['Spot-clean the substrate', 'Nettoyer ponctuellement le substrat', 'Limpiar el sustrato por zonas'],
      ['Fresh water', 'Eau fraîche', 'Agua fresca'],
      ['Ask a reptile vet about specific needs', 'Demander à un vétérinaire NAC les besoins spécifiques', 'Consultar a un veterinario de exóticos sus necesidades'],
    ],
  },
  {
    id: 'car_trip',
    category: 'travel',
    icon: 'car-outline',
    title: ['Car Trip with a Pet', 'Trajet en voiture', 'Viaje en coche'],
    items: [
      ['Secure carrier or car harness', 'Caisse ou harnais de voiture sécurisé', 'Transportín o arnés de coche seguro'],
      ['Water and bowl', 'Eau et gamelle', 'Agua y cuenco'],
      ['Plan breaks every few hours', 'Prévoir des pauses régulières', 'Planificar paradas cada pocas horas'],
      ['Never leave the pet alone in a parked car', 'Ne jamais laisser l’animal seul dans une voiture garée', 'Nunca dejar a la mascota sola en un coche aparcado'],
      ['Bags and wipes', 'Sacs et lingettes', 'Bolsas y toallitas'],
      ['Ask your vet if your pet gets travel sick', 'Demander conseil au vétérinaire en cas de mal des transports', 'Consultar al veterinario si se marea en los viajes'],
    ],
  },
  {
    id: 'flight',
    category: 'travel',
    icon: 'airplane-outline',
    title: ['Flying with a Pet', 'Voyager en avion', 'Viajar en avión'],
    items: [
      ['Check the airline’s pet policy and book early', 'Vérifier la politique de la compagnie et réserver tôt', 'Revisar la política de la aerolínea y reservar pronto'],
      ['Approved carrier with ID label', 'Caisse homologuée avec étiquette d’identification', 'Transportín homologado con etiqueta de identificación'],
      ['Required certificates from your vet', 'Certificats exigés, établis par le vétérinaire', 'Certificados exigidos por el veterinario'],
      ['Get your pet used to the carrier beforehand', 'Habituer l’animal à la caisse avant le départ', 'Acostumbrar a la mascota al transportín antes'],
      ['Absorbent pad and familiar item in the carrier', 'Tapis absorbant et objet familier dans la caisse', 'Empapador y objeto conocido en el transportín'],
    ],
  },
  {
    id: 'boarding',
    category: 'travel',
    icon: 'business-outline',
    title: ['Before Boarding or a Pet Sitter', 'Avant une pension ou un pet-sitter', 'Antes de la residencia o del cuidador'],
    items: [
      ['Visit the boarding place beforehand', 'Visiter la pension à l’avance', 'Visitar la residencia con antelación'],
      ['Check which vaccinations they require', 'Vérifier les vaccinations exigées', 'Comprobar qué vacunas exigen'],
      ['Write feeding instructions', 'Rédiger les consignes de repas', 'Escribir las instrucciones de alimentación'],
      ['Leave current treatments with the vet’s written instructions', 'Laisser les traitements en cours avec l’ordonnance', 'Dejar los tratamientos actuales con la receta del veterinario'],
      ['Leave your vet’s contact', 'Laisser les coordonnées du vétérinaire', 'Dejar el contacto del veterinario'],
      ['Pack a familiar blanket or toy', 'Prévoir une couverture ou un jouet familier', 'Llevar una manta o juguete conocido'],
    ],
  },
  {
    id: 'moving',
    category: 'life_events',
    icon: 'cube-outline',
    title: ['Moving House with a Pet', 'Déménager avec son animal', 'Mudarse con una mascota'],
    items: [
      ['Keep the pet in a quiet room on moving day', 'Isoler l’animal dans une pièce calme le jour J', 'Mantener a la mascota en una habitación tranquila el día de la mudanza'],
      ['Update address on the ID registration', 'Mettre à jour l’adresse de l’identification', 'Actualizar la dirección del registro de identificación'],
      ['Find a new vet if needed and transfer records', 'Trouver un nouveau vétérinaire et transférer le dossier', 'Buscar nuevo veterinario y transferir el historial'],
      ['Pet-proof the new home', 'Sécuriser le nouveau logement', 'Proteger el nuevo hogar'],
      ['Keep routines (meals, walks) as stable as possible', 'Garder les routines (repas, balades) aussi stables que possible', 'Mantener las rutinas (comidas, paseos) lo más estables posible'],
    ],
  },
  {
    id: 'summer_heat',
    category: 'seasonal',
    icon: 'sunny-outline',
    title: ['Hot Weather Care', 'Fortes chaleurs', 'Calor intenso'],
    items: [
      ['Fresh water available everywhere', 'Eau fraîche disponible partout', 'Agua fresca disponible en todo momento'],
      ['Walks early morning or late evening', 'Balades tôt le matin ou tard le soir', 'Paseos a primera hora o al anochecer'],
      ['Test pavement heat with your hand', 'Tester la chaleur du bitume avec la main', 'Comprobar con la mano el calor del asfalto'],
      ['Shaded, ventilated resting place', 'Coin repos ombragé et aéré', 'Lugar de descanso con sombra y ventilado'],
      ['Never leave the pet in a car', 'Ne jamais laisser l’animal dans une voiture', 'Nunca dejar a la mascota en el coche'],
      ['Know your vet’s emergency number', 'Avoir le numéro d’urgence du vétérinaire', 'Tener a mano el teléfono de urgencias del veterinario'],
    ],
  },
  {
    id: 'winter',
    category: 'seasonal',
    icon: 'snow-outline',
    title: ['Cold Weather Care', 'Temps froid', 'Tiempo frío'],
    items: [
      ['Warm bed away from drafts', 'Couchage chaud à l’abri des courants d’air', 'Cama cálida lejos de corrientes'],
      ['Wipe paws after walks (salt, ice)', 'Essuyer les pattes après la balade (sel, glace)', 'Limpiar las patas tras el paseo (sal, hielo)'],
      ['Shorter walks in freezing weather', 'Balades plus courtes par grand froid', 'Paseos más cortos con frío intenso'],
      ['Check outdoor water is not frozen', 'Vérifier que l’eau dehors n’a pas gelé', 'Comprobar que el agua exterior no está congelada'],
      ['Keep antifreeze out of reach', 'Ranger l’antigel hors de portée', 'Guardar el anticongelante fuera de su alcance'],
    ],
  },
  {
    id: 'holidays',
    category: 'seasonal',
    icon: 'gift-outline',
    title: ['Holiday Season Safety', 'Fêtes de fin d’année', 'Fiestas navideñas'],
    items: [
      ['Keep chocolate and rich food out of reach', 'Garder chocolat et plats riches hors de portée', 'Mantener el chocolate y la comida copiosa fuera de su alcance'],
      ['Secure the tree and decorations', 'Sécuriser le sapin et les décorations', 'Asegurar el árbol y los adornos'],
      ['Quiet retreat during gatherings', 'Coin calme pendant les réceptions', 'Rincón tranquilo durante las reuniones'],
      ['Ask guests not to feed the pet', 'Demander aux invités de ne pas nourrir l’animal', 'Pedir a los invitados que no le den comida'],
      ['Check your vet’s holiday opening hours', 'Vérifier les horaires du vétérinaire pendant les fêtes', 'Consultar el horario del veterinario en festivos'],
    ],
  },
  {
    id: 'fireworks',
    category: 'seasonal',
    icon: 'volume-high-outline',
    title: ['Fireworks & Loud Noises', 'Feux d’artifice et bruits forts', 'Fuegos artificiales y ruidos fuertes'],
    items: [
      ['Walk before dark', 'Promener avant la tombée de la nuit', 'Pasear antes de que anochezca'],
      ['Close windows and curtains', 'Fermer fenêtres et rideaux', 'Cerrar ventanas y cortinas'],
      ['Prepare a safe hiding place', 'Préparer une cachette rassurante', 'Preparar un escondite seguro'],
      ['Background music or TV', 'Musique ou télévision en fond', 'Música o televisión de fondo'],
      ['Check ID tag and microchip details are up to date', 'Vérifier que médaille et identification sont à jour', 'Comprobar que la placa y el microchip están actualizados'],
      ['Ask your vet in advance if your pet is very anxious', 'Consulter le vétérinaire à l’avance si l’animal est très anxieux', 'Consultar antes al veterinario si tu mascota es muy ansiosa'],
    ],
  },
  {
    id: 'new_baby',
    category: 'life_events',
    icon: 'happy-outline',
    title: ['Pet & New Baby', 'Animal et arrivée d’un bébé', 'Mascota y llegada de un bebé'],
    items: [
      ['Adjust routines gradually before the birth', 'Adapter progressivement les routines avant la naissance', 'Ajustar las rutinas poco a poco antes del nacimiento'],
      ['Let the pet smell baby items', 'Faire sentir les affaires du bébé', 'Dejar que huela las cosas del bebé'],
      ['Never leave the pet and baby unsupervised', 'Ne jamais laisser bébé et animal sans surveillance', 'Nunca dejar al bebé y la mascota sin supervisión'],
      ['Keep a pet-only quiet space', 'Garder un espace calme réservé à l’animal', 'Mantener un espacio tranquilo solo para la mascota'],
      ['Keep up one-to-one time with the pet', 'Garder des moments privilégiés avec l’animal', 'Mantener ratos a solas con la mascota'],
    ],
  },
  {
    id: 'second_pet',
    category: 'life_events',
    icon: 'people-outline',
    title: ['Introducing a Second Pet', 'Accueillir un deuxième animal', 'Presentar una segunda mascota'],
    items: [
      ['Separate spaces at first', 'Espaces séparés au début', 'Espacios separados al principio'],
      ['Swap blankets so they learn each other’s scent', 'Échanger les couvertures pour habituer aux odeurs', 'Intercambiar mantas para que se acostumbren al olor'],
      ['Short supervised meetings', 'Rencontres courtes et surveillées', 'Encuentros cortos y supervisados'],
      ['Separate bowls, beds and litter boxes', 'Gamelles, couchages et litières séparés', 'Comederos, camas y areneros separados'],
      ['Ask the vet for a check-up of the newcomer', 'Faire examiner le nouvel arrivant par le vétérinaire', 'Llevar al recién llegado a revisión veterinaria'],
    ],
  },
  {
    id: 'dental',
    category: 'health',
    icon: 'happy-outline',
    title: ['Dental Care Routine', 'Routine soins dentaires', 'Rutina de cuidado dental'],
    items: [
      ['Ask your vet which dental care suits your pet', 'Demander au vétérinaire les soins dentaires adaptés', 'Preguntar al veterinario qué cuidado dental le conviene'],
      ['Get your pet used to mouth handling', 'Habituer l’animal à la manipulation de la bouche', 'Acostumbrar a la mascota a que le toquen la boca'],
      ['Use only pet toothpaste', 'Utiliser uniquement un dentifrice pour animaux', 'Usar solo pasta de dientes para mascotas'],
      ['Note bad breath or difficulty eating for the vet', 'Noter mauvaise haleine ou difficulté à manger pour le vétérinaire', 'Anotar mal aliento o dificultad para comer para el veterinario'],
      ['Reward after each session', 'Récompenser après chaque séance', 'Premiar tras cada sesión'],
    ],
  },
  {
    id: 'after_surgery',
    category: 'health',
    icon: 'bandage-outline',
    title: ['Home Setup After a Vet Procedure', 'Retour à la maison après une intervention', 'Regreso a casa tras una intervención'],
    items: [
      ['Follow the vet’s discharge instructions exactly', 'Suivre exactement les consignes de sortie du vétérinaire', 'Seguir exactamente las indicaciones del veterinario'],
      ['Record the prescribed treatments in PetCare', 'Saisir les traitements prescrits dans PetCare', 'Registrar los tratamientos recetados en PetCare'],
      ['Quiet, comfortable resting area', 'Coin de repos calme et confortable', 'Zona de descanso tranquila y cómoda'],
      ['Book the follow-up appointment', 'Prendre le rendez-vous de contrôle', 'Reservar la cita de control'],
      ['Call the vet if something worries you', 'Appeler le vétérinaire en cas d’inquiétude', 'Llamar al veterinario si algo te preocupa'],
    ],
  },
  {
    id: 'training_basics',
    category: 'routine',
    icon: 'school-outline',
    title: ['Basic Training Sessions', 'Séances d’éducation de base', 'Sesiones básicas de adiestramiento'],
    items: [
      ['Short sessions (5–10 min)', 'Séances courtes (5–10 min)', 'Sesiones cortas (5–10 min)'],
      ['One skill at a time', 'Un seul exercice à la fois', 'Un ejercicio cada vez'],
      ['Reward the right behaviour immediately', 'Récompenser immédiatement le bon comportement', 'Premiar enseguida el comportamiento correcto'],
      ['End on a success', 'Terminer sur une réussite', 'Terminar con un éxito'],
      ['Log progress as an activity', 'Noter les progrès comme activité', 'Registrar el progreso como actividad'],
      ['Consider a professional trainer if needed', 'Faire appel à un éducateur si besoin', 'Recurrir a un adiestrador profesional si hace falta'],
    ],
  },
  {
    id: 'adoption_day',
    category: 'essentials',
    icon: 'heart-circle-outline',
    title: ['Adoption Day', 'Jour de l’adoption', 'Día de la adopción'],
    items: [
      ['Collect the adoption contract and records', 'Récupérer le contrat d’adoption et le dossier', 'Recoger el contrato de adopción y el historial'],
      ['Carrier or leash for the trip home', 'Caisse ou laisse pour le trajet', 'Transportín o correa para el viaje a casa'],
      ['Same food as at the shelter for the first days', 'Même nourriture qu’au refuge les premiers jours', 'La misma comida que en el refugio los primeros días'],
      ['Calm welcome, few visitors', 'Accueil calme, peu de visiteurs', 'Bienvenida tranquila, pocas visitas'],
      ['Save the adoption date in PetCare', 'Enregistrer la date d’adoption dans PetCare', 'Guardar la fecha de adopción en PetCare'],
    ],
  },
  {
    id: 'monthly_admin',
    category: 'routine',
    icon: 'folder-outline',
    title: ['Monthly Pet Admin', 'Suivi administratif mensuel', 'Gestión mensual de la mascota'],
    items: [
      ['Scan new invoices and documents', 'Numériser les nouvelles factures et documents', 'Digitalizar facturas y documentos nuevos'],
      ['Review this month’s expenses', 'Revoir les dépenses du mois', 'Revisar los gastos del mes'],
      ['Check upcoming vaccinations and appointments', 'Vérifier vaccinations et rendez-vous à venir', 'Revisar vacunas y citas próximas'],
      ['Check insurance renewal date', 'Vérifier la date de renouvellement de l’assurance', 'Comprobar la fecha de renovación del seguro'],
      ['Export a backup of PetCare data', 'Exporter une sauvegarde des données PetCare', 'Exportar una copia de seguridad de PetCare'],
    ],
  },
  {
    id: 'pet_sitter_info',
    category: 'travel',
    icon: 'person-outline',
    title: ['Information for a Pet Sitter', 'Informations pour le pet-sitter', 'Información para el cuidador'],
    items: [
      ['Feeding times and quantities you use', 'Horaires et quantités de repas habituels', 'Horarios y cantidades de comida habituales'],
      ['Walk routine and habits', 'Routine de promenade et habitudes', 'Rutina de paseos y costumbres'],
      ['Current treatments with the vet’s written instructions', 'Traitements en cours avec l’ordonnance', 'Tratamientos actuales con la receta'],
      ['Vet and emergency contacts', 'Contacts du vétérinaire et d’urgence', 'Contactos del veterinario y de urgencias'],
      ['Where supplies are stored', 'Où se trouvent les fournitures', 'Dónde están los suministros'],
      ['Your contact details while away', 'Vos coordonnées pendant l’absence', 'Tus datos de contacto durante la ausencia'],
    ],
  },
];

const INDEX: Record<InterfaceLanguage, 0 | 1 | 2> = { en: 0, fr: 1, es: 2 };

export function templateTitle(tpl: CareTemplate, lng: InterfaceLanguage): string {
  return tpl.title[INDEX[lng]];
}

export function templateItems(tpl: CareTemplate, lng: InterfaceLanguage): string[] {
  return tpl.items.map((i) => i[INDEX[lng]]);
}

export function findTemplate(id: string): CareTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
