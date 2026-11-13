import type { ActivityCategory } from '@/constants/domain';
import type { LocalTime } from '@/types/models';

/**
 * Itinerary templates: generic, editable outlines of a trip's rhythm. They contain
 * no real place, opening hour or schedule and are never presented as recommendations:
 * the times are neutral starting slots the user is expected to change.
 *
 * A template has a first day, a cycle of middle days and a last day, so it adapts to
 * any trip length (a 7-day template applied to a 5-day trip uses 3 middle days).
 */
export const ITINERARY_TEMPLATES = ['weekend', 'city3', 'vacation7', 'roadtrip10', 'family', 'business', 'beach'] as const;
export type ItineraryTemplateKey = (typeof ITINERARY_TEMPLATES)[number];

type Lang = 'en' | 'fr' | 'es';
type L10n = Record<Lang, string>;

export interface TemplateActivity {
  category: ActivityCategory;
  name: L10n;
  startTime: LocalTime | null;
}
export interface TemplateDay {
  title: L10n;
  activities: TemplateActivity[];
}
export interface ItineraryTemplate {
  key: ItineraryTemplateKey;
  /** Indicative length shown in the picker. */
  suggestedDays: number;
  first: TemplateDay;
  middle: TemplateDay[];
  last: TemplateDay;
}

const a = (category: ActivityCategory, startTime: LocalTime | null, en: string, fr: string, es: string): TemplateActivity => ({ category, startTime, name: { en, fr, es } });
const d = (en: string, fr: string, es: string, activities: TemplateActivity[]): TemplateDay => ({ title: { en, fr, es }, activities });

// Reusable building blocks -------------------------------------------------
const arrival = a('transport', '10:00', 'Arrival', 'Arrivée', 'Llegada');
const checkIn = a('accommodation', '14:00', 'Check-in at the accommodation', "Installation à l'hébergement", 'Check-in en el alojamiento');
const checkOut = a('accommodation', '10:00', 'Check-out', 'Départ de l’hébergement', 'Check-out');
const departure = a('transport', '15:00', 'Departure', 'Départ', 'Salida');
const firstWalk = a('sightseeing', '16:00', 'First walk around the neighbourhood', 'Première balade dans le quartier', 'Primer paseo por el barrio');
const dinner = a('restaurant', '20:00', 'Dinner', 'Dîner', 'Cena');
const lunch = a('restaurant', '13:00', 'Lunch', 'Déjeuner', 'Almuerzo');
const morningVisit = a('sightseeing', '09:30', 'Morning visit (to choose)', 'Visite du matin (à choisir)', 'Visita de la mañana (por elegir)');
const museum = a('museum', '15:00', 'Museum or exhibition (to choose)', 'Musée ou exposition (à choisir)', 'Museo o exposición (por elegir)');
const freeTime = a('other', null, 'Free time', 'Temps libre', 'Tiempo libre');
const souvenirs = a('shopping', '11:00', 'Last walk and souvenirs', 'Dernière balade et souvenirs', 'Último paseo y recuerdos');
const beach = a('beach', '10:00', 'Beach time', 'Plage', 'Playa');
const sunset = a('nature', '19:00', 'Sunset spot (to choose)', 'Coucher de soleil (lieu à choisir)', 'Atardecer (lugar por elegir)');
const nature = a('nature', '09:30', 'Nature outing (to choose)', 'Sortie nature (à choisir)', 'Salida a la naturaleza (por elegir)');
const drive = a('transport', '09:00', 'Drive to the next stop', "Route vers l'étape suivante", 'Ruta hasta la siguiente parada');
const roadStop = a('sightseeing', '12:30', 'Stop along the way (to choose)', 'Arrêt en chemin (à choisir)', 'Parada en el camino (por elegir)');
const kidsActivity = a('entertainment', '10:00', 'Activity for the kids (to choose)', 'Activité pour les enfants (à choisir)', 'Actividad para los niños (por elegir)');
const rest = a('accommodation', '14:30', 'Rest time', 'Pause / sieste', 'Descanso');
const meeting = a('other', '09:00', 'Meeting', 'Réunion', 'Reunión');
const workSession = a('other', '14:00', 'Work session', 'Session de travail', 'Sesión de trabajo');
const businessDinner = a('restaurant', '20:00', 'Business dinner', "Dîner d'affaires", 'Cena de negocios');

const cityDay = d('City exploration', 'Exploration de la ville', 'Explorar la ciudad', [morningVisit, lunch, museum, dinner]);
const relaxedDay = d('Relaxed day', 'Journée tranquille', 'Día tranquilo', [freeTime, lunch, firstWalk, dinner]);

export const TEMPLATES: Record<ItineraryTemplateKey, ItineraryTemplate> = {
  weekend: {
    key: 'weekend',
    suggestedDays: 3,
    first: d('Arrival and first evening', 'Arrivée et première soirée', 'Llegada y primera noche', [arrival, checkIn, firstWalk, dinner]),
    middle: [cityDay],
    last: d('Last morning and return', 'Dernière matinée et retour', 'Última mañana y regreso', [checkOut, souvenirs, departure]),
  },
  city3: {
    key: 'city3',
    suggestedDays: 3,
    first: d('Arrival', 'Arrivée', 'Llegada', [arrival, checkIn, firstWalk, dinner]),
    middle: [cityDay],
    last: d('Highlights and departure', 'Incontournables et départ', 'Lo imprescindible y salida', [checkOut, morningVisit, lunch, departure]),
  },
  vacation7: {
    key: 'vacation7',
    suggestedDays: 7,
    first: d('Arrival and settling in', 'Arrivée et installation', 'Llegada e instalación', [arrival, checkIn, firstWalk, dinner]),
    middle: [cityDay, d('Day trip', 'Excursion à la journée', 'Excursión de un día', [nature, lunch, sunset]), relaxedDay],
    last: d('Return home', 'Retour', 'Regreso', [checkOut, departure]),
  },
  roadtrip10: {
    key: 'roadtrip10',
    suggestedDays: 10,
    first: d('Start of the road trip', 'Début du road trip', 'Comienzo del viaje por carretera', [a('transport', '10:00', 'Pick up the car', 'Récupérer la voiture', 'Recoger el coche'), checkIn, dinner]),
    middle: [
      d('On the road', 'Sur la route', 'En la carretera', [drive, roadStop, checkIn, dinner]),
      d('Stay and explore', 'Pause et découverte', 'Parada y descubrimiento', [nature, lunch, freeTime]),
    ],
    last: d('Return the car and go home', 'Restitution de la voiture et retour', 'Devolver el coche y regresar', [checkOut, a('transport', '12:00', 'Return the car', 'Rendre la voiture', 'Devolver el coche'), departure]),
  },
  family: {
    key: 'family',
    suggestedDays: 5,
    first: d('Arrival with the family', 'Arrivée en famille', 'Llegada en familia', [arrival, checkIn, rest, dinner]),
    middle: [d('Family day', 'Journée en famille', 'Día en familia', [kidsActivity, lunch, rest, a('nature', '16:30', 'Park or playground', 'Parc ou aire de jeux', 'Parque o zona de juegos')])],
    last: d('Going home', 'Retour à la maison', 'Vuelta a casa', [checkOut, departure]),
  },
  business: {
    key: 'business',
    suggestedDays: 3,
    first: d('Arrival', 'Arrivée', 'Llegada', [arrival, checkIn, a('other', '17:00', 'Prepare tomorrow’s meetings', 'Préparer les réunions du lendemain', 'Preparar las reuniones de mañana'), dinner]),
    middle: [d('Meetings', 'Réunions', 'Reuniones', [meeting, lunch, workSession, businessDinner])],
    last: d('Last meeting and return', 'Dernière réunion et retour', 'Última reunión y regreso', [checkOut, meeting, departure]),
  },
  beach: {
    key: 'beach',
    suggestedDays: 7,
    first: d('Arrival at the seaside', 'Arrivée au bord de la mer', 'Llegada a la costa', [arrival, checkIn, a('beach', '17:00', 'First swim', 'Première baignade', 'Primer baño'), dinner]),
    middle: [d('Beach day', 'Journée plage', 'Día de playa', [beach, lunch, rest, sunset]), d('Explore the area', 'Découverte des environs', 'Explorar los alrededores', [morningVisit, lunch, beach])],
    last: d('Last swim and departure', 'Dernière baignade et départ', 'Último baño y salida', [a('beach', '08:30', 'Last swim', 'Dernière baignade', 'Último baño'), checkOut, departure]),
  },
};

/** The template days for a trip of `dayCount` days (first, cycled middle days, last). */
export function planTemplateDays(template: ItineraryTemplate, dayCount: number): TemplateDay[] {
  if (dayCount <= 0) return [];
  if (dayCount === 1) return [{ title: template.first.title, activities: [...template.first.activities, ...template.last.activities.filter((x) => x.category === 'transport')] }];
  const middle = Array.from({ length: dayCount - 2 }, (_, i) => template.middle[i % template.middle.length]!);
  return [template.first, ...middle, template.last];
}

export function l10n(value: L10n, lang: string): string {
  return value[(['en', 'fr', 'es'] as const).find((l) => l === lang) ?? 'en'];
}
