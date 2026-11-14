import type { Priority } from '@/constants/domain';

/**
 * Suggested pre-departure tasks (original content). They are reminders to check things
 * with the relevant providers and authorities: none of them states an official rule.
 * `daysBefore` proposes a due date relative to departure; the user can change it.
 */
type Lang = 'en' | 'fr' | 'es';
export interface SuggestedTask {
  id: string;
  title: Record<Lang, string>;
  priority: Priority;
  daysBefore: number;
  /** Only suggested for trips that cross a border (international). */
  international?: boolean;
}

const task = (id: string, en: string, fr: string, es: string, priority: Priority, daysBefore: number, international = false): SuggestedTask => ({
  id,
  title: { en, fr, es },
  priority,
  daysBefore,
  ...(international ? { international } : {}),
});

export const DEPARTURE_TASKS: SuggestedTask[] = [
  task('passport-validity', 'Check passport or ID validity', "Vérifier la validité du passeport ou de la carte d'identité", 'Comprobar la validez del pasaporte o DNI', 'high', 60, true),
  task('visa', 'Check visa and entry requirements with official sources', "Vérifier visa et conditions d'entrée auprès des sources officielles", 'Comprobar visado y requisitos de entrada en fuentes oficiales', 'high', 45, true),
  task('accommodation', 'Book accommodation', "Réserver l'hébergement", 'Reservar el alojamiento', 'high', 30),
  task('transport', 'Confirm transportation', 'Confirmer les transports', 'Confirmar el transporte', 'high', 14),
  task('insurance', 'Arrange travel insurance', "Souscrire une assurance voyage", 'Contratar un seguro de viaje', 'medium', 21),
  task('documents', 'Prepare travel documents (offline copies)', 'Préparer les documents de voyage (copies hors ligne)', 'Preparar los documentos de viaje (copias sin conexión)', 'medium', 7),
  task('health', 'Check health advice and vaccinations with a professional', 'Vérifier les conseils santé et vaccins auprès d’un professionnel', 'Consultar recomendaciones de salud y vacunas con un profesional', 'medium', 45, true),
  task('bank', 'Tell your bank about the trip and check card fees abroad', 'Prévenir sa banque et vérifier les frais de carte à l’étranger', 'Avisar al banco y revisar las comisiones de la tarjeta en el extranjero', 'low', 10, true),
  task('phone', 'Check your phone plan abroad (roaming or local SIM)', 'Vérifier son forfait à l’étranger (itinérance ou carte SIM locale)', 'Revisar la tarifa móvil en el extranjero (roaming o SIM local)', 'low', 7, true),
  task('luggage', 'Check luggage size and weight allowance', 'Vérifier les dimensions et le poids autorisés des bagages', 'Comprobar tamaño y peso permitidos del equipaje', 'medium', 3),
  task('airport-transfer', 'Arrange the airport or station transfer', "Organiser le trajet vers l'aéroport ou la gare", 'Organizar el traslado al aeropuerto o la estación', 'medium', 3),
  task('weather', 'Check the weather forecast', 'Consulter la météo', 'Consultar la previsión del tiempo', 'low', 2),
  task('check-in', 'Do online check-in if available', "Faire l'enregistrement en ligne si possible", 'Hacer el check-in en línea si es posible', 'medium', 1),
  task('home', 'Prepare home: plants, mail, appliances', 'Préparer la maison : plantes, courrier, appareils', 'Preparar la casa: plantas, correo, electrodomésticos', 'low', 1),
];

export function taskTitle(t: SuggestedTask, lang: string): string {
  return t.title[(['en', 'fr', 'es'] as const).find((l) => l === lang) ?? 'en'];
}
