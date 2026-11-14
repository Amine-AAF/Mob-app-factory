import type { IconName } from '@factory/design-system';

import type { BudgetCategory, EventTypeId, TaskCategory, TaskPriority } from '@/domain/types';

/**
 * Bundled planning templates. Texts are i18n keys (`taskLibrary.<key>`,
 * `timelineLibrary.<key>`, `templates.<id>.*`): when a template is applied,
 * the strings are materialised in the user's language and become fully
 * editable records.
 */

export interface TaskSeed {
  category: TaskCategory;
  priority: TaskPriority;
  /** Due this many days before the event (negative = after). */
  daysBefore: number;
}

export const TASK_LIBRARY = {
  setBudget: { category: 'admin', priority: 'high', daysBefore: 200 },
  bookVenue: { category: 'venue', priority: 'high', daysBefore: 180 },
  guestList: { category: 'guests', priority: 'high', daysBefore: 170 },
  officiant: { category: 'program', priority: 'high', daysBefore: 150 },
  saveTheDate: { category: 'guests', priority: 'medium', daysBefore: 150 },
  chooseCaterer: { category: 'vendors', priority: 'high', daysBefore: 150 },
  bookPhotographer: { category: 'vendors', priority: 'medium', daysBefore: 140 },
  bookMusic: { category: 'vendors', priority: 'medium', daysBefore: 120 },
  giftRegistry: { category: 'guests', priority: 'low', daysBefore: 120 },
  honeymoon: { category: 'logistics', priority: 'low', daysBefore: 120 },
  sponsorOutreach: { category: 'admin', priority: 'medium', daysBefore: 120 },
  chooseFlorist: { category: 'vendors', priority: 'low', daysBefore: 100 },
  weddingRings: { category: 'other', priority: 'high', daysBefore: 90 },
  bookAccommodation: { category: 'logistics', priority: 'medium', daysBefore: 90 },
  bookSpeakers: { category: 'program', priority: 'high', daysBefore: 90 },
  permits: { category: 'admin', priority: 'medium', daysBefore: 60 },
  marriageLicense: { category: 'admin', priority: 'high', daysBefore: 60 },
  registration: { category: 'guests', priority: 'high', daysBefore: 60 },
  sendInvitations: { category: 'guests', priority: 'high', daysBefore: 60 },
  chooseOutfit: { category: 'other', priority: 'medium', daysBefore: 60 },
  agenda: { category: 'program', priority: 'high', daysBefore: 45 },
  orderCake: { category: 'food', priority: 'medium', daysBefore: 30 },
  planMenu: { category: 'food', priority: 'medium', daysBefore: 30 },
  arrangeTransport: { category: 'logistics', priority: 'low', daysBefore: 30 },
  avEquipment: { category: 'logistics', priority: 'high', daysBefore: 30 },
  pressKit: { category: 'admin', priority: 'medium', daysBefore: 30 },
  giftIdeas: { category: 'other', priority: 'low', daysBefore: 30 },
  themeDecor: { category: 'decoration', priority: 'low', daysBefore: 30 },
  photoBooth: { category: 'decoration', priority: 'low', daysBefore: 30 },
  followUpRsvp: { category: 'guests', priority: 'high', daysBefore: 21 },
  confirmVendors: { category: 'vendors', priority: 'high', daysBefore: 21 },
  prepareDecorations: { category: 'decoration', priority: 'medium', daysBefore: 14 },
  finalizeProgram: { category: 'program', priority: 'high', daysBefore: 14 },
  playlist: { category: 'program', priority: 'low', daysBefore: 14 },
  partyFavors: { category: 'decoration', priority: 'low', daysBefore: 14 },
  weatherPlan: { category: 'logistics', priority: 'medium', daysBefore: 14 },
  workshopMaterials: { category: 'logistics', priority: 'high', daysBefore: 14 },
  buySupplies: { category: 'logistics', priority: 'medium', daysBefore: 10 },
  seatingPlan: { category: 'guests', priority: 'medium', daysBefore: 10 },
  dietaryCheck: { category: 'food', priority: 'medium', daysBefore: 10 },
  checkGuestList: { category: 'guests', priority: 'high', daysBefore: 7 },
  confirmHeadcount: { category: 'food', priority: 'high', daysBefore: 7 },
  prepareSpeeches: { category: 'program', priority: 'low', daysBefore: 7 },
  badges: { category: 'logistics', priority: 'medium', daysBefore: 7 },
  finalPayments: { category: 'admin', priority: 'high', daysBefore: 5 },
  groceries: { category: 'food', priority: 'medium', daysBefore: 2 },
  cleanHome: { category: 'logistics', priority: 'low', daysBefore: 1 },
  feedbackSurvey: { category: 'admin', priority: 'low', daysBefore: -1 },
  thankYouNotes: { category: 'guests', priority: 'low', daysBefore: -7 },
} as const satisfies Record<string, TaskSeed>;

export type TaskKey = keyof typeof TASK_LIBRARY;

export const TIMELINE_LIBRARY = [
  'guestArrival',
  'welcomeDrinks',
  'ceremony',
  'photos',
  'cocktail',
  'dinner',
  'speeches',
  'firstDance',
  'entertainment',
  'cakeCutting',
  'dancing',
  'closing',
  'registration',
  'keynote',
  'coffeeBreak',
  'session',
  'lunch',
  'panel',
  'networking',
  'workshopIntro',
  'handsOn',
  'wrapUp',
  'games',
  'giftsOpening',
  'toast',
  'aperitif',
  'dessert',
  'demo',
] as const;

export type TimelineKey = (typeof TIMELINE_LIBRARY)[number];

/** [activity, start "HH:mm" (≥ 24:00 = next day), duration in minutes] */
export type TimelineSeed = [TimelineKey, string, number];

export interface EventTemplate {
  id: string;
  typeId: EventTypeId;
  icon: IconName;
  premium: boolean;
  expectedGuests: number;
  startTime: string;
  endTime: string;
  /** Share of the initial budget per category, in % (sums to 100). */
  budgetSplit: Partial<Record<BudgetCategory, number>>;
  tasks: TaskKey[];
  timeline: TimelineSeed[];
}

export const EVENT_TEMPLATES: readonly EventTemplate[] = [
  {
    id: 'wedding_planning', typeId: 'wedding', icon: 'heart', premium: false, expectedGuests: 120, startTime: '15:00', endTime: '02:00',
    budgetSplit: { venue: 30, catering: 28, photography: 10, music: 7, decoration: 6, flowers: 5, clothing: 7, invitations: 2, transportation: 2, other: 3 },
    tasks: ['setBudget', 'bookVenue', 'guestList', 'officiant', 'saveTheDate', 'chooseCaterer', 'bookPhotographer', 'bookMusic', 'giftRegistry', 'chooseFlorist', 'weddingRings', 'bookAccommodation', 'marriageLicense', 'sendInvitations', 'chooseOutfit', 'orderCake', 'arrangeTransport', 'followUpRsvp', 'confirmVendors', 'finalizeProgram', 'prepareDecorations', 'seatingPlan', 'dietaryCheck', 'checkGuestList', 'confirmHeadcount', 'prepareSpeeches', 'finalPayments', 'honeymoon', 'thankYouNotes'],
    timeline: [['guestArrival', '15:00', 30], ['ceremony', '15:30', 60], ['photos', '16:30', 60], ['cocktail', '17:30', 90], ['dinner', '19:30', 120], ['speeches', '21:30', 30], ['firstDance', '22:00', 15], ['cakeCutting', '22:30', 20], ['dancing', '22:50', 170], ['closing', '25:40', 20]],
  },
  {
    id: 'birthday_party', typeId: 'birthday', icon: 'gift', premium: false, expectedGuests: 30, startTime: '19:00', endTime: '23:30',
    budgetSplit: { venue: 25, catering: 40, decoration: 15, entertainment: 10, other: 10 },
    tasks: ['setBudget', 'guestList', 'bookVenue', 'sendInvitations', 'themeDecor', 'orderCake', 'planMenu', 'playlist', 'followUpRsvp', 'buySupplies', 'confirmHeadcount', 'prepareDecorations', 'thankYouNotes'],
    timeline: [['guestArrival', '19:00', 30], ['aperitif', '19:30', 60], ['dinner', '20:30', 60], ['cakeCutting', '21:30', 20], ['giftsOpening', '21:50', 30], ['dancing', '22:20', 60], ['closing', '23:20', 10]],
  },
  {
    id: 'kids_birthday', typeId: 'birthday', icon: 'balloon', premium: true, expectedGuests: 15, startTime: '14:00', endTime: '17:30',
    budgetSplit: { catering: 35, decoration: 20, entertainment: 30, gifts: 10, other: 5 },
    tasks: ['guestList', 'sendInvitations', 'themeDecor', 'orderCake', 'dietaryCheck', 'partyFavors', 'buySupplies', 'followUpRsvp', 'prepareDecorations', 'thankYouNotes'],
    timeline: [['guestArrival', '14:00', 30], ['games', '14:30', 60], ['entertainment', '15:30', 45], ['cakeCutting', '16:15', 30], ['giftsOpening', '16:45', 30], ['closing', '17:15', 15]],
  },
  {
    id: 'engagement_party', typeId: 'engagement', icon: 'diamond', premium: true, expectedGuests: 50, startTime: '19:00', endTime: '00:30',
    budgetSplit: { venue: 30, catering: 35, decoration: 10, photography: 10, flowers: 5, music: 5, other: 5 },
    tasks: ['setBudget', 'guestList', 'bookVenue', 'sendInvitations', 'chooseCaterer', 'bookPhotographer', 'chooseFlorist', 'playlist', 'followUpRsvp', 'prepareSpeeches', 'confirmHeadcount', 'prepareDecorations', 'thankYouNotes'],
    timeline: [['guestArrival', '19:00', 30], ['welcomeDrinks', '19:30', 60], ['toast', '20:30', 20], ['dinner', '20:50', 100], ['speeches', '22:30', 30], ['dancing', '23:00', 80], ['closing', '24:20', 10]],
  },
  {
    id: 'baby_shower', typeId: 'baby_shower', icon: 'balloon', premium: false, expectedGuests: 20, startTime: '15:00', endTime: '18:00',
    budgetSplit: { catering: 40, decoration: 30, gifts: 15, invitations: 5, other: 10 },
    tasks: ['guestList', 'giftRegistry', 'sendInvitations', 'themeDecor', 'planMenu', 'orderCake', 'followUpRsvp', 'buySupplies', 'partyFavors', 'prepareDecorations', 'thankYouNotes'],
    timeline: [['guestArrival', '15:00', 30], ['games', '15:30', 45], ['dessert', '16:15', 45], ['giftsOpening', '17:00', 45], ['closing', '17:45', 15]],
  },
  {
    id: 'graduation_party', typeId: 'graduation', icon: 'school', premium: true, expectedGuests: 40, startTime: '18:00', endTime: '23:00',
    budgetSplit: { venue: 25, catering: 40, decoration: 15, photography: 10, other: 10 },
    tasks: ['guestList', 'bookVenue', 'sendInvitations', 'planMenu', 'orderCake', 'photoBooth', 'playlist', 'followUpRsvp', 'prepareSpeeches', 'buySupplies', 'thankYouNotes'],
    timeline: [['guestArrival', '18:00', 30], ['welcomeDrinks', '18:30', 60], ['speeches', '19:30', 30], ['dinner', '20:00', 90], ['cakeCutting', '21:30', 20], ['dancing', '21:50', 60], ['closing', '22:50', 10]],
  },
  {
    id: 'corporate_conference', typeId: 'conference', icon: 'mic', premium: false, expectedGuests: 200, startTime: '08:30', endTime: '18:00',
    budgetSplit: { venue: 35, catering: 25, accommodation: 10, transportation: 5, invitations: 5, entertainment: 5, other: 15 },
    tasks: ['setBudget', 'bookVenue', 'bookSpeakers', 'sponsorOutreach', 'registration', 'agenda', 'chooseCaterer', 'avEquipment', 'bookAccommodation', 'pressKit', 'confirmVendors', 'badges', 'confirmHeadcount', 'finalPayments', 'feedbackSurvey'],
    timeline: [['registration', '08:30', 60], ['keynote', '09:30', 60], ['coffeeBreak', '10:30', 30], ['session', '11:00', 90], ['lunch', '12:30', 75], ['panel', '13:45', 75], ['coffeeBreak', '15:00', 30], ['session', '15:30', 90], ['networking', '17:00', 60]],
  },
  {
    id: 'business_workshop', typeId: 'workshop', icon: 'construct', premium: true, expectedGuests: 25, startTime: '09:00', endTime: '17:00',
    budgetSplit: { venue: 40, catering: 30, other: 30 },
    tasks: ['bookVenue', 'agenda', 'registration', 'workshopMaterials', 'avEquipment', 'dietaryCheck', 'confirmHeadcount', 'feedbackSurvey'],
    timeline: [['registration', '09:00', 30], ['workshopIntro', '09:30', 30], ['handsOn', '10:00', 120], ['lunch', '12:00', 60], ['handsOn', '13:00', 150], ['coffeeBreak', '15:30', 30], ['wrapUp', '16:00', 60]],
  },
  {
    id: 'family_dinner', typeId: 'dinner_party', icon: 'restaurant', premium: false, expectedGuests: 10, startTime: '19:30', endTime: '23:30',
    budgetSplit: { catering: 70, decoration: 15, other: 15 },
    tasks: ['guestList', 'planMenu', 'dietaryCheck', 'groceries', 'cleanHome', 'prepareDecorations'],
    timeline: [['guestArrival', '19:30', 30], ['aperitif', '20:00', 45], ['dinner', '20:45', 90], ['dessert', '22:15', 45], ['closing', '23:00', 30]],
  },
  {
    id: 'anniversary', typeId: 'anniversary', icon: 'wine', premium: true, expectedGuests: 40, startTime: '19:00', endTime: '00:00',
    budgetSplit: { venue: 30, catering: 40, decoration: 10, music: 10, photography: 5, other: 5 },
    tasks: ['guestList', 'bookVenue', 'sendInvitations', 'chooseCaterer', 'bookMusic', 'giftIdeas', 'followUpRsvp', 'prepareSpeeches', 'confirmHeadcount', 'thankYouNotes'],
    timeline: [['guestArrival', '19:00', 30], ['welcomeDrinks', '19:30', 60], ['dinner', '20:30', 90], ['speeches', '22:00', 30], ['dancing', '22:30', 80], ['closing', '23:50', 10]],
  },
  {
    id: 'garden_party', typeId: 'custom', icon: 'flower', premium: true, expectedGuests: 35, startTime: '13:00', endTime: '19:00',
    budgetSplit: { catering: 45, decoration: 20, music: 10, flowers: 10, other: 15 },
    tasks: ['guestList', 'sendInvitations', 'weatherPlan', 'planMenu', 'themeDecor', 'playlist', 'followUpRsvp', 'buySupplies', 'prepareDecorations', 'groceries'],
    timeline: [['guestArrival', '13:00', 30], ['welcomeDrinks', '13:30', 60], ['lunch', '14:30', 90], ['games', '16:00', 90], ['dessert', '17:30', 60], ['closing', '18:30', 30]],
  },
  {
    id: 'networking_event', typeId: 'corporate_event', icon: 'people-circle', premium: true, expectedGuests: 80, startTime: '18:30', endTime: '21:30',
    budgetSplit: { venue: 40, catering: 40, invitations: 5, other: 15 },
    tasks: ['bookVenue', 'registration', 'sendInvitations', 'chooseCaterer', 'badges', 'avEquipment', 'confirmHeadcount', 'feedbackSurvey'],
    timeline: [['registration', '18:30', 30], ['welcomeDrinks', '19:00', 30], ['keynote', '19:30', 20], ['networking', '19:50', 90], ['closing', '21:20', 10]],
  },
  {
    id: 'product_launch', typeId: 'corporate_event', icon: 'rocket', premium: true, expectedGuests: 150, startTime: '18:00', endTime: '22:00',
    budgetSplit: { venue: 30, catering: 25, entertainment: 15, photography: 10, decoration: 10, other: 10 },
    tasks: ['setBudget', 'bookVenue', 'registration', 'pressKit', 'sendInvitations', 'chooseCaterer', 'avEquipment', 'bookPhotographer', 'prepareDecorations', 'confirmVendors', 'finalizeProgram', 'confirmHeadcount', 'feedbackSurvey'],
    timeline: [['registration', '18:00', 30], ['welcomeDrinks', '18:30', 30], ['keynote', '19:00', 30], ['demo', '19:30', 45], ['networking', '20:15', 90], ['closing', '21:45', 15]],
  },
  {
    id: 'holiday_party', typeId: 'holiday_party', icon: 'snow', premium: true, expectedGuests: 40, startTime: '19:00', endTime: '01:00',
    budgetSplit: { venue: 25, catering: 40, decoration: 15, music: 10, gifts: 5, other: 5 },
    tasks: ['guestList', 'bookVenue', 'sendInvitations', 'themeDecor', 'planMenu', 'giftIdeas', 'playlist', 'followUpRsvp', 'buySupplies', 'prepareDecorations'],
    timeline: [['guestArrival', '19:00', 30], ['welcomeDrinks', '19:30', 60], ['dinner', '20:30', 90], ['giftsOpening', '22:00', 45], ['dancing', '22:45', 120], ['closing', '24:45', 15]],
  },
  {
    id: 'dinner_party', typeId: 'dinner_party', icon: 'wine', premium: true, expectedGuests: 8, startTime: '20:00', endTime: '00:00',
    budgetSplit: { catering: 75, decoration: 15, other: 10 },
    tasks: ['guestList', 'sendInvitations', 'planMenu', 'dietaryCheck', 'playlist', 'groceries', 'cleanHome'],
    timeline: [['guestArrival', '20:00', 30], ['aperitif', '20:30', 45], ['dinner', '21:15', 90], ['dessert', '22:45', 45], ['closing', '23:30', 30]],
  },
  {
    id: 'family_reunion', typeId: 'family_gathering', icon: 'people', premium: true, expectedGuests: 60, startTime: '12:00', endTime: '20:00',
    budgetSplit: { venue: 25, catering: 40, accommodation: 15, transportation: 10, other: 10 },
    tasks: ['guestList', 'bookVenue', 'saveTheDate', 'sendInvitations', 'bookAccommodation', 'arrangeTransport', 'planMenu', 'photoBooth', 'followUpRsvp', 'confirmHeadcount', 'thankYouNotes'],
    timeline: [['guestArrival', '12:00', 60], ['lunch', '13:00', 120], ['photos', '15:00', 45], ['games', '15:45', 120], ['dinner', '17:45', 120], ['closing', '19:45', 15]],
  },
  {
    id: 'business_meeting', typeId: 'business_meeting', icon: 'business', premium: true, expectedGuests: 12, startTime: '10:00', endTime: '12:30',
    budgetSplit: { venue: 50, catering: 50 },
    tasks: ['bookVenue', 'agenda', 'sendInvitations', 'avEquipment', 'confirmHeadcount'],
    timeline: [['guestArrival', '10:00', 15], ['session', '10:15', 60], ['coffeeBreak', '11:15', 15], ['session', '11:30', 45], ['wrapUp', '12:15', 15]],
  },
  {
    id: 'retirement_party', typeId: 'custom', icon: 'sunny', premium: true, expectedGuests: 50, startTime: '18:00', endTime: '22:30',
    budgetSplit: { venue: 30, catering: 40, decoration: 10, gifts: 15, other: 5 },
    tasks: ['guestList', 'bookVenue', 'sendInvitations', 'giftIdeas', 'planMenu', 'prepareSpeeches', 'photoBooth', 'followUpRsvp', 'confirmHeadcount', 'thankYouNotes'],
    timeline: [['guestArrival', '18:00', 30], ['welcomeDrinks', '18:30', 60], ['speeches', '19:30', 45], ['giftsOpening', '20:15', 30], ['dinner', '20:45', 90], ['closing', '22:15', 15]],
  },
  {
    id: 'team_offsite', typeId: 'corporate_event', icon: 'briefcase', premium: true, expectedGuests: 30, startTime: '09:00', endTime: '22:00',
    budgetSplit: { venue: 30, catering: 25, accommodation: 20, transportation: 15, entertainment: 10 },
    tasks: ['setBudget', 'bookVenue', 'bookAccommodation', 'arrangeTransport', 'agenda', 'registration', 'dietaryCheck', 'workshopMaterials', 'confirmHeadcount', 'finalPayments', 'feedbackSurvey'],
    timeline: [['registration', '09:00', 30], ['keynote', '09:30', 45], ['handsOn', '10:15', 105], ['lunch', '12:00', 75], ['games', '13:15', 165], ['wrapUp', '16:00', 60], ['dinner', '19:00', 150], ['closing', '21:30', 30]],
  },
  {
    id: 'custom_event', typeId: 'custom', icon: 'sparkles', premium: false, expectedGuests: 20, startTime: '18:00', endTime: '22:00',
    budgetSplit: { venue: 30, catering: 40, decoration: 10, other: 20 },
    tasks: ['setBudget', 'guestList', 'bookVenue', 'sendInvitations', 'followUpRsvp', 'confirmVendors', 'finalizeProgram', 'buySupplies', 'checkGuestList'],
    timeline: [['guestArrival', '18:00', 30], ['welcomeDrinks', '18:30', 60], ['dinner', '19:30', 90], ['entertainment', '21:00', 50], ['closing', '21:50', 10]],
  },
];

export function findTemplate(id: string | null | undefined): EventTemplate | null {
  return EVENT_TEMPLATES.find((t) => t.id === id) ?? null;
}
