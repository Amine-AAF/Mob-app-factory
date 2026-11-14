/**
 * Built-in workout templates shipped with FitTrack.
 *
 * Every template is a general example routine, not a medical or personalized
 * prescription. Exercise ids must exist in the exercise library
 * (see docs/exercise-catalog.md) and targets must match each exercise's
 * tracking type: reps for weight_reps / reps, durationSec for time and
 * distance_time (distanceM optional).
 *
 * Template ids are stable: never rename a shipped id.
 */
import type { TemplateDay, TemplateExercise, TemplateSeed } from '../types';

/** Rep-based target (weight_reps or reps tracking). */
const reps = (exerciseId: string, sets: number, repsMin: number, repsMax: number, restSec: number): TemplateExercise => ({
  exerciseId,
  sets,
  repsMin,
  repsMax,
  restSec,
});

/** Duration-based target (time tracking). */
const timed = (exerciseId: string, sets: number, durationSec: number, restSec: number): TemplateExercise => ({
  exerciseId,
  sets,
  durationSec,
  restSec,
});

/** Cardio target (distance_time tracking), with an optional distance in meters. */
const cardio = (exerciseId: string, sets: number, durationSec: number, restSec: number, distanceM?: number): TemplateExercise =>
  distanceM === undefined ? { exerciseId, sets, durationSec, restSec } : { exerciseId, sets, durationSec, distanceM, restSec };

const day = (en: string, fr: string, es: string, exercises: TemplateExercise[]): TemplateDay => ({
  name: { en, fr, es },
  exercises,
});

export const TEMPLATES: TemplateSeed[] = [
  // ---------------------------------------------------------------- beginner essentials
  {
    id: 'beginner-full-body',
    type: 'full_body',
    goal: 'general_fitness',
    level: 'beginner',
    daysPerWeek: 3,
    estMinutes: 45,
    premium: false,
    i18n: {
      en: {
        name: 'Beginner Full Body',
        description: 'A simple example session for people new to the gym, covering every major muscle group with moderate reps. Repeat it up to three times a week with a rest day in between.',
      },
      fr: {
        name: 'Corps entier débutant',
        description: "Un exemple de séance simple pour celles et ceux qui découvrent la salle, avec tous les grands groupes musculaires en répétitions modérées. Vous pouvez la répéter jusqu'à trois fois par semaine avec un jour de repos entre deux.",
      },
      es: {
        name: 'Cuerpo completo para principiantes',
        description: 'Un ejemplo de sesión sencilla si eres nuevo en el gimnasio, con todos los grupos musculares principales y repeticiones moderadas. Puedes repetirla hasta tres veces por semana con un día de descanso entre medias.',
      },
    },
    days: [
      day('Full Body', 'Corps entier', 'Cuerpo completo', [
        reps('goblet-squat', 3, 10, 12, 90),
        reps('dumbbell-bench-press', 3, 10, 12, 90),
        reps('lat-pulldown', 3, 10, 12, 90),
        reps('dumbbell-romanian-deadlift', 3, 10, 12, 90),
        reps('seated-dumbbell-press', 2, 10, 12, 75),
        timed('plank', 3, 30, 45),
        reps('dead-bug', 2, 10, 10, 45),
      ]),
    ],
  },
  {
    id: 'three-day-gym-routine',
    type: 'full_body',
    goal: 'general_fitness',
    level: 'beginner',
    daysPerWeek: 3,
    estMinutes: 45,
    premium: false,
    i18n: {
      en: {
        name: '3-Day Gym Routine',
        description: 'Three different full-body gym days built around basic barbell, dumbbell and machine lifts. A general example for beginners who can train three times a week.',
      },
      fr: {
        name: 'Programme salle 3 jours',
        description: "Trois séances corps entier différentes, construites autour des mouvements de base à la barre, aux haltères et aux machines. Un exemple général pour débutants qui peuvent s'entraîner trois fois par semaine.",
      },
      es: {
        name: 'Rutina de gimnasio de 3 días',
        description: 'Tres días de cuerpo completo distintos, basados en ejercicios básicos con barra, mancuernas y máquinas. Un ejemplo general si eres principiante y puedes entrenar tres veces por semana.',
      },
    },
    days: [
      day('Day A', 'Jour A', 'Día A', [
        reps('back-squat', 3, 8, 10, 120),
        reps('barbell-bench-press', 3, 8, 10, 120),
        reps('seated-cable-row', 3, 10, 12, 90),
        reps('dumbbell-lateral-raise', 2, 12, 15, 60),
        timed('plank', 3, 30, 45),
      ]),
      day('Day B', 'Jour B', 'Día B', [
        reps('romanian-deadlift', 3, 8, 10, 120),
        reps('seated-dumbbell-press', 3, 8, 10, 90),
        reps('lat-pulldown', 3, 10, 12, 90),
        reps('walking-lunge', 2, 10, 10, 75),
        reps('dumbbell-curl', 2, 10, 12, 60),
        reps('dead-bug', 2, 10, 10, 45),
      ]),
      day('Day C', 'Jour C', 'Día C', [
        reps('leg-press', 3, 10, 12, 90),
        reps('incline-dumbbell-press', 3, 10, 12, 90),
        reps('one-arm-dumbbell-row', 3, 10, 12, 90),
        reps('glute-bridge', 3, 12, 15, 60),
        reps('triceps-pushdown', 2, 10, 12, 60),
        timed('side-plank', 2, 30, 30),
      ]),
    ],
  },
  {
    id: 'home-workout',
    type: 'home',
    goal: 'general_fitness',
    level: 'beginner',
    daysPerWeek: 3,
    estMinutes: 30,
    premium: false,
    i18n: {
      en: {
        name: 'Home Workout',
        description: 'A no-equipment session you can do in your living room, mixing light cardio, legs, push-ups and core. A general starting point for training at home.',
      },
      fr: {
        name: 'Séance à la maison',
        description: "Une séance sans matériel à faire dans votre salon, qui combine cardio léger, jambes, pompes et gainage. Un point de départ général pour s'entraîner chez soi.",
      },
      es: {
        name: 'Entrenamiento en casa',
        description: 'Una sesión sin material que puedes hacer en tu salón, con cardio suave, piernas, flexiones y core. Un punto de partida general para entrenar en casa.',
      },
    },
    days: [
      day('Home Circuit', 'Circuit maison', 'Circuito en casa', [
        timed('jumping-jack', 2, 45, 30),
        reps('bodyweight-squat', 3, 12, 15, 45),
        reps('knee-push-up', 3, 8, 12, 45),
        reps('glute-bridge', 3, 12, 15, 45),
        reps('walking-lunge', 2, 8, 10, 45),
        reps('bird-dog', 2, 8, 10, 30),
        timed('plank', 3, 30, 30),
        timed('childs-pose', 1, 45, 0),
      ]),
    ],
  },
  {
    id: 'bodyweight-training',
    type: 'bodyweight',
    goal: 'general_fitness',
    level: 'beginner',
    daysPerWeek: 2,
    estMinutes: 30,
    premium: false,
    i18n: {
      en: {
        name: 'Bodyweight Training',
        description: 'Two alternating sessions using only your body weight: squats, lunges, push-up variations and core holds. A general example for beginners who want to train anywhere.',
      },
      fr: {
        name: 'Entraînement au poids du corps',
        description: "Deux séances en alternance qui n'utilisent que le poids du corps : squats, fentes, variantes de pompes et gainage. Un exemple général pour débutants qui veulent s'entraîner partout.",
      },
      es: {
        name: 'Entrenamiento con peso corporal',
        description: 'Dos sesiones alternas usando solo tu peso corporal: sentadillas, zancadas, variantes de flexiones y ejercicios isométricos de core. Un ejemplo general si eres principiante y quieres entrenar en cualquier lugar.',
      },
    },
    days: [
      day('Day A', 'Jour A', 'Día A', [
        reps('bodyweight-squat', 3, 12, 15, 60),
        reps('push-up', 3, 6, 10, 60),
        reps('glute-bridge', 3, 12, 15, 45),
        timed('superman-hold', 3, 20, 30),
        timed('plank', 3, 30, 45),
        reps('dead-bug', 2, 8, 10, 30),
      ]),
      day('Day B', 'Jour B', 'Día B', [
        reps('walking-lunge', 3, 8, 10, 60),
        reps('knee-push-up', 3, 10, 12, 60),
        reps('lateral-lunge', 2, 8, 10, 45),
        timed('wall-sit', 3, 30, 45),
        reps('inchworm', 2, 5, 6, 45),
        reps('bird-dog', 3, 8, 10, 30),
        timed('side-plank', 2, 20, 30),
      ]),
    ],
  },
  {
    id: 'beginner-cardio',
    type: 'cardio',
    goal: 'endurance',
    level: 'beginner',
    daysPerWeek: 3,
    estMinutes: 35,
    premium: false,
    i18n: {
      en: {
        name: 'Beginner Cardio',
        description: 'A steady, comfortable-pace cardio session on common gym machines, ending with a few light stretches. A general example for building a regular cardio habit.',
      },
      fr: {
        name: 'Cardio débutant',
        description: "Une séance de cardio à allure régulière et confortable sur des machines courantes, terminée par quelques étirements légers. Un exemple général pour installer une habitude de cardio.",
      },
      es: {
        name: 'Cardio para principiantes',
        description: 'Una sesión de cardio a ritmo constante y cómodo en máquinas habituales del gimnasio, con unos estiramientos suaves al final. Un ejemplo general para crear el hábito del cardio.',
      },
    },
    days: [
      day('Steady Cardio', 'Cardio continu', 'Cardio continuo', [
        cardio('brisk-walk', 1, 300, 30),
        cardio('stationary-bike', 1, 900, 60),
        cardio('elliptical', 1, 600, 60),
        timed('wall-calf-stretch', 1, 30, 0),
        timed('standing-quad-stretch', 1, 30, 0),
        timed('standing-hamstring-stretch', 1, 30, 0),
      ]),
    ],
  },
  {
    id: 'mobility-routine',
    type: 'mobility',
    goal: 'mobility',
    level: 'beginner',
    daysPerWeek: 3,
    estMinutes: 20,
    premium: false,
    i18n: {
      en: {
        name: 'Mobility Routine',
        description: 'Gentle, controlled movements for the spine, shoulders, hips and ankles. A general example to use on rest days or as a longer warm-up.',
      },
      fr: {
        name: 'Routine de mobilité',
        description: "Des mouvements doux et contrôlés pour la colonne, les épaules, les hanches et les chevilles. Un exemple général à utiliser les jours de repos ou comme échauffement plus long.",
      },
      es: {
        name: 'Rutina de movilidad',
        description: 'Movimientos suaves y controlados para la columna, los hombros, las caderas y los tobillos. Un ejemplo general para tus días de descanso o como calentamiento más largo.',
      },
    },
    days: [
      day('Mobility', 'Mobilité', 'Movilidad', [
        reps('cat-cow', 2, 8, 10, 10),
        timed('arm-circle', 1, 30, 10),
        reps('standing-hip-circle', 2, 8, 10, 10),
        reps('leg-swing', 2, 10, 10, 10),
        reps('quadruped-thoracic-rotation', 2, 6, 8, 10),
        reps('spiderman-lunge', 2, 5, 6, 10),
        reps('knee-to-wall-ankle', 2, 8, 10, 10),
        reps('ninety-ninety-switch', 2, 6, 8, 10),
        timed('deep-squat-hold', 2, 30, 15),
        timed('childs-pose', 1, 45, 0),
      ]),
    ],
  },
  {
    id: 'return-to-training',
    type: 'full_body',
    goal: 'consistency',
    level: 'beginner',
    daysPerWeek: 2,
    estMinutes: 30,
    premium: false,
    i18n: {
      en: {
        name: 'Beginner Return to Training',
        description: 'A very gentle session for getting back into exercise after a long break: an easy walk, a few low-effort strength moves and relaxed mobility. Keep every set comfortable.',
      },
      fr: {
        name: "Reprise en douceur",
        description: "Une séance très douce pour reprendre l'activité après une longue pause : marche tranquille, quelques mouvements de renforcement peu intenses et mobilité détendue. Gardez chaque série confortable.",
      },
      es: {
        name: 'Vuelta suave al entrenamiento',
        description: 'Una sesión muy suave para retomar el ejercicio tras un largo parón: una caminata tranquila, algunos ejercicios de fuerza de bajo esfuerzo y movilidad relajada. Mantén cada serie cómoda.',
      },
    },
    days: [
      day('Easy Session', 'Séance douce', 'Sesión suave', [
        cardio('brisk-walk', 1, 600, 60),
        reps('chair-squat', 2, 8, 10, 60),
        reps('incline-push-up', 2, 8, 10, 60),
        reps('glute-bridge', 2, 10, 12, 60),
        reps('bird-dog', 2, 6, 8, 45),
        reps('dead-bug', 2, 6, 8, 45),
        reps('cat-cow', 1, 8, 8, 0),
        timed('childs-pose', 1, 45, 0),
      ]),
    ],
  },
  {
    id: 'machine-beginner-gym',
    type: 'full_body',
    goal: 'general_fitness',
    level: 'beginner',
    daysPerWeek: 2,
    estMinutes: 40,
    premium: false,
    i18n: {
      en: {
        name: 'Machine-Based Beginner Gym',
        description: 'Two full-body days using guided machines and cables, which are easy to set up and learn. A general example for your first weeks in a gym.',
      },
      fr: {
        name: 'Débutant en salle sur machines',
        description: "Deux séances corps entier sur machines guidées et poulies, faciles à régler et à apprendre. Un exemple général pour vos premières semaines en salle.",
      },
      es: {
        name: 'Gimnasio para principiantes con máquinas',
        description: 'Dos días de cuerpo completo con máquinas guiadas y poleas, fáciles de ajustar y aprender. Un ejemplo general para tus primeras semanas en el gimnasio.',
      },
    },
    days: [
      day('Day A', 'Jour A', 'Día A', [
        cardio('incline-treadmill-walk', 1, 300, 60),
        reps('leg-press', 3, 10, 12, 90),
        reps('machine-chest-press', 3, 10, 12, 90),
        reps('lat-pulldown', 3, 10, 12, 90),
        reps('seated-leg-curl', 2, 10, 12, 60),
        reps('machine-shoulder-press', 2, 10, 12, 75),
        timed('plank', 2, 30, 45),
      ]),
      day('Day B', 'Jour B', 'Día B', [
        cardio('stationary-bike', 1, 300, 60),
        reps('leg-extension', 3, 12, 15, 60),
        reps('machine-row', 3, 10, 12, 90),
        reps('pec-deck', 2, 12, 15, 60),
        reps('hip-abduction-machine', 2, 15, 15, 45),
        reps('triceps-pushdown', 2, 10, 12, 60),
        reps('machine-biceps-curl', 2, 10, 12, 60),
      ]),
    ],
  },
  {
    id: 'desk-break-mobility',
    type: 'mobility',
    goal: 'mobility',
    level: 'beginner',
    daysPerWeek: 5,
    estMinutes: 10,
    premium: false,
    i18n: {
      en: {
        name: 'Desk Break Mobility',
        description: 'A short standing routine for the neck, wrists, shoulders and hips, designed to fit into a work break. A general example for people who sit a lot during the day.',
      },
      fr: {
        name: 'Pause mobilité au bureau',
        description: "Une courte routine debout pour la nuque, les poignets, les épaules et les hanches, pensée pour une pause au travail. Un exemple général pour les personnes qui passent beaucoup de temps assises.",
      },
      es: {
        name: 'Movilidad para pausas en la oficina',
        description: 'Una rutina corta de pie para el cuello, las muñecas, los hombros y las caderas, pensada para una pausa en el trabajo. Un ejemplo general si pasas mucho tiempo sentado.',
      },
    },
    days: [
      day('Desk Break', 'Pause bureau', 'Pausa activa', [
        timed('neck-side-stretch', 2, 30, 0),
        timed('wrist-circle', 1, 30, 0),
        timed('arm-circle', 1, 30, 0),
        reps('wall-slide', 2, 8, 10, 10),
        timed('cross-body-shoulder-stretch', 2, 30, 0),
        reps('standing-hip-circle', 1, 8, 10, 0),
        timed('standing-quad-stretch', 2, 30, 0),
        timed('doorway-chest-stretch', 1, 30, 0),
      ]),
    ],
  },
  {
    id: 'post-workout-stretch',
    type: 'mobility',
    goal: 'mobility',
    level: 'beginner',
    daysPerWeek: 3,
    estMinutes: 15,
    premium: false,
    i18n: {
      en: {
        name: 'Post-Workout Stretch',
        description: 'A calm series of static stretches for the legs, hips, chest and upper back to finish a training session. Stretch to mild tension, never to pain.',
      },
      fr: {
        name: "Étirements après l'effort",
        description: "Une série calme d'étirements statiques pour les jambes, les hanches, la poitrine et le haut du dos, à faire en fin de séance. Étirez-vous jusqu'à une tension légère, jamais jusqu'à la douleur.",
      },
      es: {
        name: 'Estiramientos después de entrenar',
        description: 'Una serie tranquila de estiramientos estáticos para piernas, caderas, pecho y espalda alta al terminar tu sesión. Estira hasta notar una tensión ligera, nunca dolor.',
      },
    },
    days: [
      day('Stretch', 'Étirements', 'Estiramientos', [
        timed('standing-hamstring-stretch', 2, 30, 0),
        timed('standing-quad-stretch', 2, 30, 0),
        timed('kneeling-hip-flexor-stretch', 2, 30, 0),
        timed('figure-four-stretch', 2, 30, 0),
        timed('wall-calf-stretch', 2, 30, 0),
        timed('doorway-chest-stretch', 1, 30, 0),
        timed('kneeling-lat-stretch', 1, 30, 0),
        timed('overhead-triceps-stretch', 1, 30, 0),
        timed('childs-pose', 1, 45, 0),
      ]),
    ],
  },
  {
    id: 'morning-wake-up',
    type: 'mobility',
    goal: 'consistency',
    level: 'beginner',
    daysPerWeek: 5,
    estMinutes: 10,
    premium: false,
    i18n: {
      en: {
        name: 'Morning Wake-Up Routine',
        description: 'A ten-minute sequence of easy mobility and light movement to start the day. A general example of a short daily habit you can do before breakfast.',
      },
      fr: {
        name: 'Réveil musculaire du matin',
        description: "Une séquence de dix minutes de mobilité facile et de mouvements légers pour bien commencer la journée. Un exemple général de petite habitude quotidienne à faire avant le petit-déjeuner.",
      },
      es: {
        name: 'Rutina para despertar',
        description: 'Una secuencia de diez minutos de movilidad fácil y movimiento ligero para empezar el día. Un ejemplo general de un pequeño hábito diario que puedes hacer antes del desayuno.',
      },
    },
    days: [
      day('Wake-Up', 'Réveil', 'Despertar', [
        reps('cat-cow', 1, 8, 10, 0),
        timed('arm-circle', 1, 30, 0),
        reps('standing-hip-circle', 1, 8, 10, 0),
        reps('inchworm', 1, 5, 5, 10),
        reps('bodyweight-squat', 2, 10, 10, 15),
        reps('lunge-with-rotation', 1, 6, 6, 10),
        timed('jumping-jack', 1, 30, 15),
        timed('downward-dog', 1, 30, 0),
      ]),
    ],
  },
  {
    id: 'low-impact-home-cardio',
    type: 'home',
    goal: 'endurance',
    level: 'beginner',
    daysPerWeek: 3,
    estMinutes: 25,
    premium: false,
    i18n: {
      en: {
        name: 'Low-Impact Home Cardio',
        description: 'A no-jump, no-equipment session that keeps you moving with shadow boxing, squats and lunges. A general example for apartment-friendly cardio.',
      },
      fr: {
        name: 'Cardio doux à la maison',
        description: "Une séance sans sauts ni matériel qui vous garde en mouvement avec de la boxe dans le vide, des squats et des fentes. Un exemple général de cardio adapté à un appartement.",
      },
      es: {
        name: 'Cardio de bajo impacto en casa',
        description: 'Una sesión sin saltos ni material que te mantiene en movimiento con boxeo de sombra, sentadillas y zancadas. Un ejemplo general de cardio apto para un piso.',
      },
    },
    days: [
      day('Low-Impact Cardio', 'Cardio doux', 'Cardio suave', [
        timed('arm-circle', 1, 30, 10),
        timed('shadow-boxing', 3, 60, 30),
        reps('bodyweight-squat', 3, 12, 15, 30),
        reps('walking-lunge', 2, 10, 12, 30),
        reps('lateral-lunge', 2, 8, 10, 30),
        reps('glute-bridge', 2, 15, 15, 30),
        reps('bird-dog', 2, 8, 10, 30),
        timed('standing-hamstring-stretch', 1, 30, 0),
      ]),
    ],
  },

  // ---------------------------------------------------------------- intermediate
  {
    id: 'upper-lower-4-day',
    type: 'upper_lower',
    goal: 'muscle',
    level: 'intermediate',
    daysPerWeek: 4,
    estMinutes: 60,
    premium: false,
    i18n: {
      en: {
        name: '4-Day Upper / Lower',
        description: 'A classic split alternating upper-body and lower-body days, each worked twice a week. A general example for lifters comfortable with the main barbell movements.',
      },
      fr: {
        name: 'Haut / Bas du corps sur 4 jours',
        description: "Une répartition classique qui alterne haut et bas du corps, chacun travaillé deux fois par semaine. Un exemple général pour les pratiquants à l'aise avec les mouvements de base à la barre.",
      },
      es: {
        name: 'Torso / Pierna en 4 días',
        description: 'Una división clásica que alterna días de tren superior e inferior, cada uno dos veces por semana. Un ejemplo general si ya dominas los ejercicios básicos con barra.',
      },
    },
    days: [
      day('Upper A', 'Haut du corps A', 'Tren superior A', [
        reps('barbell-bench-press', 4, 6, 8, 150),
        reps('barbell-bent-over-row', 4, 6, 8, 150),
        reps('seated-dumbbell-press', 3, 8, 10, 90),
        reps('lat-pulldown', 3, 10, 12, 90),
        reps('dumbbell-curl', 2, 10, 12, 60),
        reps('triceps-pushdown', 2, 10, 12, 60),
      ]),
      day('Lower A', 'Bas du corps A', 'Tren inferior A', [
        reps('back-squat', 4, 6, 8, 150),
        reps('romanian-deadlift', 3, 8, 10, 120),
        reps('leg-press', 3, 10, 12, 90),
        reps('lying-leg-curl', 3, 10, 12, 60),
        reps('standing-calf-raise', 3, 12, 15, 60),
        timed('plank', 3, 40, 45),
      ]),
      day('Upper B', 'Haut du corps B', 'Tren superior B', [
        reps('overhead-press', 4, 6, 8, 150),
        reps('pull-up', 4, 6, 8, 120),
        reps('incline-dumbbell-press', 3, 8, 10, 90),
        reps('seated-cable-row', 3, 10, 12, 90),
        reps('dumbbell-lateral-raise', 3, 12, 15, 60),
        reps('hammer-curl', 2, 10, 12, 60),
      ]),
      day('Lower B', 'Bas du corps B', 'Tren inferior B', [
        reps('deadlift', 3, 5, 5, 180),
        reps('bulgarian-split-squat', 3, 8, 10, 90),
        reps('hip-thrust', 3, 10, 12, 90),
        reps('leg-extension', 3, 12, 15, 60),
        reps('seated-leg-curl', 3, 10, 12, 60),
        reps('hanging-knee-raise', 3, 10, 12, 45),
      ]),
    ],
  },
  {
    id: 'push-pull-legs-3-day',
    type: 'push_pull_legs',
    goal: 'muscle',
    level: 'intermediate',
    daysPerWeek: 3,
    estMinutes: 60,
    premium: false,
    i18n: {
      en: {
        name: 'Push Pull Legs (3 days)',
        description: 'One pushing day, one pulling day and one leg day per week, each muscle group trained once with solid volume. A general example for intermediate gym-goers.',
      },
      fr: {
        name: 'Push Pull Legs (3 jours)',
        description: "Une séance de poussée, une de tirage et une de jambes par semaine, chaque groupe musculaire étant travaillé une fois avec un bon volume. Un exemple général pour pratiquants intermédiaires.",
      },
      es: {
        name: 'Empuje, tirón, pierna (3 días)',
        description: 'Un día de empuje, uno de tirón y uno de pierna a la semana, trabajando cada grupo muscular una vez con buen volumen. Un ejemplo general si tienes un nivel intermedio.',
      },
    },
    days: [
      day('Push', 'Poussée', 'Empuje', [
        reps('barbell-bench-press', 4, 6, 8, 150),
        reps('seated-dumbbell-press', 3, 8, 10, 90),
        reps('incline-dumbbell-press', 3, 8, 10, 90),
        reps('dumbbell-lateral-raise', 3, 12, 15, 60),
        reps('triceps-pushdown', 3, 10, 12, 60),
        reps('overhead-dumbbell-extension', 2, 10, 12, 60),
      ]),
      day('Pull', 'Tirage', 'Tirón', [
        reps('barbell-bent-over-row', 4, 6, 8, 150),
        reps('lat-pulldown', 3, 8, 10, 90),
        reps('seated-cable-row', 3, 10, 12, 90),
        reps('face-pull', 3, 12, 15, 60),
        reps('dumbbell-curl', 3, 10, 12, 60),
        reps('hammer-curl', 2, 10, 12, 60),
      ]),
      day('Legs', 'Jambes', 'Pierna', [
        reps('back-squat', 4, 6, 8, 150),
        reps('romanian-deadlift', 3, 8, 10, 120),
        reps('leg-press', 3, 10, 12, 90),
        reps('lying-leg-curl', 3, 10, 12, 60),
        reps('standing-calf-raise', 3, 12, 15, 60),
        reps('hanging-knee-raise', 3, 10, 12, 45),
      ]),
    ],
  },
  {
    id: 'dumbbell-only',
    type: 'full_body',
    goal: 'muscle',
    level: 'intermediate',
    daysPerWeek: 3,
    estMinutes: 50,
    premium: false,
    i18n: {
      en: {
        name: 'Dumbbell Only',
        description: 'Three full-body days that need nothing more than a pair of dumbbells and a bench. A general example for home gyms or quiet corners of a busy gym.',
      },
      fr: {
        name: 'Haltères uniquement',
        description: "Trois séances corps entier qui ne demandent qu'une paire d'haltères et un banc. Un exemple général pour une salle à domicile ou un coin calme d'une salle fréquentée.",
      },
      es: {
        name: 'Solo mancuernas',
        description: 'Tres días de cuerpo completo para los que solo necesitas un par de mancuernas y un banco. Un ejemplo general para un gimnasio en casa o un rincón tranquilo del gimnasio.',
      },
    },
    days: [
      day('Day A', 'Jour A', 'Día A', [
        reps('goblet-squat', 4, 8, 12, 90),
        reps('dumbbell-bench-press', 4, 8, 10, 90),
        reps('one-arm-dumbbell-row', 3, 8, 12, 75),
        reps('dumbbell-lateral-raise', 3, 12, 15, 60),
        reps('dumbbell-curl', 2, 10, 12, 60),
        timed('plank', 3, 40, 45),
      ]),
      day('Day B', 'Jour B', 'Día B', [
        reps('dumbbell-romanian-deadlift', 4, 8, 10, 90),
        reps('seated-dumbbell-press', 3, 8, 10, 90),
        reps('chest-supported-dumbbell-row', 3, 10, 12, 75),
        reps('dumbbell-reverse-lunge', 3, 8, 10, 75),
        reps('overhead-dumbbell-extension', 2, 10, 12, 60),
        reps('russian-twist', 3, 12, 16, 45),
      ]),
      day('Day C', 'Jour C', 'Día C', [
        reps('bulgarian-split-squat', 3, 8, 10, 90),
        reps('incline-dumbbell-press', 3, 8, 10, 90),
        reps('renegade-row', 3, 6, 8, 75),
        reps('dumbbell-hip-thrust', 3, 10, 12, 75),
        reps('rear-delt-fly', 3, 12, 15, 60),
        reps('hammer-curl', 2, 10, 12, 60),
        reps('dead-bug', 2, 10, 12, 45),
      ]),
    ],
  },
  {
    id: 'core-training',
    type: 'core',
    goal: 'general_fitness',
    level: 'intermediate',
    daysPerWeek: 3,
    estMinutes: 30,
    premium: false,
    i18n: {
      en: {
        name: 'Core Training',
        description: 'A focused session of anti-extension, anti-rotation and flexion exercises for the abs and obliques. A general example to do on its own or after a workout.',
      },
      fr: {
        name: 'Renforcement de la sangle abdominale',
        description: "Une séance ciblée d'exercices de gainage, d'anti-rotation et de flexion pour les abdominaux et les obliques. Un exemple général à faire seul ou après une séance.",
      },
      es: {
        name: 'Entrenamiento de core',
        description: 'Una sesión centrada en ejercicios de antiextensión, antirrotación y flexión para abdominales y oblicuos. Un ejemplo general para hacer por separado o después de entrenar.',
      },
    },
    days: [
      day('Core', 'Gainage', 'Core', [
        reps('dead-bug', 3, 10, 12, 30),
        timed('plank', 3, 45, 45),
        timed('side-plank', 3, 30, 30),
        reps('reverse-crunch', 3, 10, 15, 45),
        reps('bicycle-crunch', 3, 16, 20, 45),
        timed('hollow-hold', 3, 20, 45),
        reps('bird-dog', 2, 10, 10, 30),
        timed('mountain-climber', 2, 30, 30),
      ]),
    ],
  },
  {
    id: 'resistance-band-workout',
    type: 'home',
    goal: 'general_fitness',
    level: 'intermediate',
    daysPerWeek: 2,
    estMinutes: 30,
    premium: false,
    i18n: {
      en: {
        name: 'Resistance Band Workout',
        description: 'An upper-body day and a lower-body day using only resistance bands and body weight. A general example for training at home or while travelling.',
      },
      fr: {
        name: 'Séance aux élastiques',
        description: "Une séance haut du corps et une séance bas du corps avec uniquement des bandes élastiques et le poids du corps. Un exemple général pour s'entraîner à la maison ou en déplacement.",
      },
      es: {
        name: 'Entrenamiento con bandas elásticas',
        description: 'Un día de tren superior y otro de tren inferior usando solo bandas elásticas y tu peso corporal. Un ejemplo general para entrenar en casa o de viaje.',
      },
    },
    days: [
      day('Upper Body', 'Haut du corps', 'Tren superior', [
        reps('band-pull-apart', 2, 15, 20, 30),
        reps('band-chest-press', 3, 12, 15, 45),
        reps('band-row', 3, 12, 15, 45),
        reps('band-lateral-raise', 3, 12, 15, 45),
        reps('band-face-pull', 2, 12, 15, 45),
        reps('band-curl', 2, 12, 15, 45),
        reps('band-triceps-extension', 2, 12, 15, 45),
      ]),
      day('Lower Body', 'Bas du corps', 'Tren inferior', [
        reps('banded-squat', 3, 12, 15, 60),
        reps('banded-glute-bridge', 3, 15, 15, 45),
        reps('walking-lunge', 2, 10, 10, 45),
        reps('banded-lateral-walk', 3, 10, 12, 45),
        reps('clamshell', 2, 15, 15, 30),
        reps('pallof-press', 2, 10, 12, 30),
        reps('dead-bug', 2, 10, 10, 30),
      ]),
    ],
  },
  {
    id: 'strength-basics-5x5',
    type: 'strength',
    goal: 'strength',
    level: 'intermediate',
    daysPerWeek: 2,
    estMinutes: 50,
    premium: true,
    i18n: {
      en: {
        name: 'Strength Basics 5x5',
        description: 'Two alternating days built on five sets of five reps of the squat, bench press, row, overhead press and deadlift. A general example for lifters who already know these movements well.',
      },
      fr: {
        name: 'Bases de la force 5x5',
        description: "Deux séances en alternance construites sur cinq séries de cinq répétitions au squat, au développé couché, au rowing, au développé militaire et au soulevé de terre. Un exemple général pour les pratiquants qui maîtrisent déjà ces mouvements.",
      },
      es: {
        name: 'Fuerza básica 5x5',
        description: 'Dos días alternos basados en cinco series de cinco repeticiones de sentadilla, press de banca, remo, press militar y peso muerto. Un ejemplo general si ya dominas bien estos ejercicios.',
      },
    },
    days: [
      day('Day A', 'Jour A', 'Día A', [
        reps('back-squat', 5, 5, 5, 180),
        reps('barbell-bench-press', 5, 5, 5, 180),
        reps('barbell-bent-over-row', 5, 5, 5, 150),
        timed('plank', 3, 40, 60),
      ]),
      day('Day B', 'Jour B', 'Día B', [
        reps('back-squat', 5, 5, 5, 180),
        reps('overhead-press', 5, 5, 5, 180),
        reps('deadlift', 1, 5, 5, 180),
        reps('back-extension', 2, 10, 12, 60),
        reps('dead-bug', 2, 10, 10, 45),
      ]),
    ],
  },
  {
    id: 'kettlebell-basics',
    type: 'full_body',
    goal: 'general_fitness',
    level: 'intermediate',
    daysPerWeek: 2,
    estMinutes: 40,
    premium: true,
    i18n: {
      en: {
        name: 'Kettlebell Basics',
        description: 'Two full-body sessions around the fundamental kettlebell moves: swing, goblet squat, press, row, clean and get-up. A general example for people who have learned the swing.',
      },
      fr: {
        name: 'Les bases du kettlebell',
        description: "Deux séances corps entier autour des mouvements fondamentaux du kettlebell : swing, goblet squat, développé, rowing, épaulé et relevé turc. Un exemple général pour les personnes qui ont déjà appris le swing.",
      },
      es: {
        name: 'Kettlebell básico',
        description: 'Dos sesiones de cuerpo completo con los movimientos fundamentales de kettlebell: swing, sentadilla goblet, press, remo, cargada y levantamiento turco. Un ejemplo general si ya has aprendido el swing.',
      },
    },
    days: [
      day('Day A', 'Jour A', 'Día A', [
        reps('kettlebell-swing', 4, 12, 15, 60),
        reps('goblet-squat', 3, 10, 12, 75),
        reps('kettlebell-press', 3, 6, 8, 75),
        reps('kettlebell-row', 3, 8, 10, 60),
        timed('farmers-carry', 3, 40, 60),
        timed('plank', 3, 40, 45),
      ]),
      day('Day B', 'Jour B', 'Día B', [
        reps('kettlebell-clean', 3, 6, 8, 75),
        reps('turkish-get-up', 3, 2, 3, 90),
        reps('kettlebell-swing', 3, 15, 15, 60),
        reps('goblet-squat', 3, 8, 10, 75),
        reps('push-up', 3, 8, 12, 60),
        reps('dead-bug', 2, 10, 10, 45),
      ]),
    ],
  },
  {
    id: 'express-20-minute',
    type: 'full_body',
    goal: 'consistency',
    level: 'intermediate',
    daysPerWeek: 3,
    estMinutes: 20,
    premium: false,
    i18n: {
      en: {
        name: '20-Minute Express',
        description: 'A short dumbbell and bodyweight circuit with brief rests, for days when time is limited. A general example to keep your routine going on busy weeks.',
      },
      fr: {
        name: 'Express 20 minutes',
        description: "Un circuit court aux haltères et au poids du corps avec des repos brefs, pour les jours où le temps manque. Un exemple général pour garder le rythme pendant les semaines chargées.",
      },
      es: {
        name: 'Exprés de 20 minutos',
        description: 'Un circuito corto con mancuernas y peso corporal y descansos breves, para los días en que vas justo de tiempo. Un ejemplo general para mantener tu rutina en semanas ajetreadas.',
      },
    },
    days: [
      day('Express Circuit', 'Circuit express', 'Circuito exprés', [
        reps('dumbbell-thruster', 3, 10, 12, 30),
        reps('renegade-row', 3, 8, 10, 30),
        reps('dumbbell-reverse-lunge', 3, 8, 10, 30),
        reps('push-up', 3, 10, 12, 30),
        timed('mountain-climber', 3, 30, 30),
      ]),
    ],
  },
  {
    id: 'back-and-posture',
    type: 'strength',
    goal: 'general_fitness',
    level: 'intermediate',
    daysPerWeek: 2,
    estMinutes: 40,
    premium: false,
    i18n: {
      en: {
        name: 'Back & Posture',
        description: 'A session for the upper back, rear shoulders and lower back, combining rows, pulldowns and scapular work with a chest opener at the end. A general example, not a treatment for back pain.',
      },
      fr: {
        name: 'Dos et posture',
        description: "Une séance pour le haut du dos, l'arrière des épaules et les lombaires, qui combine rowings, tirages et travail des omoplates, avec une ouverture de poitrine pour finir. Un exemple général, pas un traitement du mal de dos.",
      },
      es: {
        name: 'Espalda y postura',
        description: 'Una sesión para la espalda alta, la parte posterior de los hombros y la zona lumbar, con remos, jalones y trabajo escapular, y un estiramiento de pecho al final. Un ejemplo general, no un tratamiento para el dolor de espalda.',
      },
    },
    days: [
      day('Back & Posture', 'Dos et posture', 'Espalda y postura', [
        reps('band-pull-apart', 2, 15, 20, 30),
        reps('lat-pulldown', 3, 10, 12, 90),
        reps('chest-supported-dumbbell-row', 3, 10, 12, 75),
        reps('face-pull', 3, 12, 15, 60),
        reps('back-extension', 3, 10, 12, 60),
        reps('prone-y-raise', 2, 10, 12, 45),
        reps('bird-dog', 2, 8, 10, 30),
        timed('doorway-chest-stretch', 2, 30, 0),
      ]),
    ],
  },
  {
    id: 'legs-day',
    type: 'hypertrophy',
    goal: 'muscle',
    level: 'intermediate',
    daysPerWeek: 1,
    estMinutes: 60,
    premium: false,
    i18n: {
      en: {
        name: 'Legs Day',
        description: 'A complete lower-body session: a heavy squat, a hip hinge, lunges, then quad, hamstring and calf isolation. A general example to slot into any weekly split.',
      },
      fr: {
        name: 'Séance jambes',
        description: "Une séance complète pour le bas du corps : squat lourd, charnière de hanche, fentes, puis isolation des quadriceps, des ischios et des mollets. Un exemple général à intégrer dans n'importe quelle répartition hebdomadaire.",
      },
      es: {
        name: 'Día de pierna',
        description: 'Una sesión completa de tren inferior: sentadilla pesada, bisagra de cadera, zancadas y después aislamiento de cuádriceps, isquios y gemelos. Un ejemplo general para incluir en cualquier división semanal.',
      },
    },
    days: [
      day('Legs', 'Jambes', 'Pierna', [
        reps('back-squat', 4, 6, 8, 150),
        reps('romanian-deadlift', 3, 8, 10, 120),
        reps('walking-lunge', 3, 10, 12, 75),
        reps('leg-extension', 3, 12, 15, 60),
        reps('seated-leg-curl', 3, 10, 12, 60),
        reps('standing-calf-raise', 4, 12, 15, 45),
        timed('pigeon-stretch', 1, 45, 0),
      ]),
    ],
  },
  {
    id: 'full-body-dumbbell-circuit',
    type: 'full_body',
    goal: 'endurance',
    level: 'intermediate',
    daysPerWeek: 3,
    estMinutes: 35,
    premium: true,
    i18n: {
      en: {
        name: 'Full Body Dumbbell Circuit',
        description: 'Seven dumbbell moves performed back to back with short rests, repeated for four rounds. A general example for people who like keeping a steady pace through the whole session.',
      },
      fr: {
        name: 'Circuit corps entier aux haltères',
        description: "Sept mouvements aux haltères enchaînés avec des repos courts, répétés sur quatre tours. Un exemple général pour celles et ceux qui aiment garder un rythme soutenu tout au long de la séance.",
      },
      es: {
        name: 'Circuito de cuerpo completo con mancuernas',
        description: 'Siete ejercicios con mancuernas encadenados con descansos cortos, repetidos durante cuatro rondas. Un ejemplo general si te gusta mantener un ritmo constante durante toda la sesión.',
      },
    },
    days: [
      day('Circuit', 'Circuit', 'Circuito', [
        reps('goblet-squat', 4, 12, 12, 20),
        reps('dumbbell-clean-and-press', 4, 8, 10, 20),
        reps('one-arm-dumbbell-row', 4, 10, 12, 20),
        reps('dumbbell-reverse-lunge', 4, 10, 10, 20),
        reps('dumbbell-floor-press', 4, 10, 12, 20),
        reps('russian-twist', 4, 16, 20, 20),
        timed('farmers-carry', 4, 40, 30),
      ]),
    ],
  },
  {
    id: 'core-mobility-flow',
    type: 'core',
    goal: 'mobility',
    level: 'intermediate',
    daysPerWeek: 3,
    estMinutes: 25,
    premium: false,
    i18n: {
      en: {
        name: 'Core & Mobility Flow',
        description: 'Core stability exercises alternated with spine and hip mobility drills, finishing with two relaxing stretches. A general example for a lighter, controlled session.',
      },
      fr: {
        name: 'Gainage et mobilité',
        description: "Des exercices de stabilité du tronc en alternance avec des exercices de mobilité de la colonne et des hanches, terminés par deux étirements relaxants. Un exemple général pour une séance plus légère et contrôlée.",
      },
      es: {
        name: 'Flujo de core y movilidad',
        description: 'Ejercicios de estabilidad del core alternados con movilidad de columna y caderas, terminando con dos estiramientos relajantes. Un ejemplo general para una sesión más ligera y controlada.',
      },
    },
    days: [
      day('Flow', 'Enchaînement', 'Flujo', [
        reps('cat-cow', 1, 8, 10, 10),
        reps('dead-bug', 3, 10, 12, 30),
        reps('quadruped-thoracic-rotation', 2, 6, 8, 10),
        timed('side-plank', 3, 30, 30),
        reps('ninety-ninety-switch', 2, 6, 8, 10),
        reps('bird-dog', 3, 8, 10, 20),
        timed('hollow-hold', 3, 20, 30),
        timed('bear-plank', 3, 30, 30),
        timed('supine-spinal-twist', 1, 30, 0),
        timed('cobra-stretch', 1, 30, 0),
      ]),
    ],
  },
  {
    id: 'weekend-full-body',
    type: 'full_body',
    goal: 'general_fitness',
    level: 'intermediate',
    daysPerWeek: 2,
    estMinutes: 55,
    premium: false,
    i18n: {
      en: {
        name: 'Weekend Full Body',
        description: 'Two complementary full-body sessions for Saturday and Sunday, for people whose weekdays are too busy to train. A general example to cover all major muscles over the weekend.',
      },
      fr: {
        name: 'Corps entier du week-end',
        description: "Deux séances corps entier complémentaires pour le samedi et le dimanche, pour les personnes trop occupées en semaine. Un exemple général pour travailler tous les grands muscles pendant le week-end.",
      },
      es: {
        name: 'Cuerpo completo de fin de semana',
        description: 'Dos sesiones de cuerpo completo complementarias para el sábado y el domingo, si entre semana no tienes tiempo de entrenar. Un ejemplo general para trabajar los músculos principales durante el fin de semana.',
      },
    },
    days: [
      day('Saturday', 'Samedi', 'Sábado', [
        reps('back-squat', 4, 6, 8, 150),
        reps('dumbbell-bench-press', 3, 8, 10, 90),
        reps('seated-cable-row', 3, 10, 12, 90),
        reps('walking-lunge', 2, 10, 12, 60),
        reps('dumbbell-lateral-raise', 3, 12, 15, 45),
        timed('plank', 3, 40, 45),
      ]),
      day('Sunday', 'Dimanche', 'Domingo', [
        reps('romanian-deadlift', 4, 8, 10, 120),
        reps('overhead-press', 3, 6, 8, 120),
        reps('lat-pulldown', 3, 10, 12, 75),
        reps('goblet-squat', 3, 10, 12, 75),
        reps('hammer-curl', 2, 10, 12, 60),
        cardio('rowing-machine', 1, 600, 0),
      ]),
    ],
  },

  // ---------------------------------------------------------------- advanced
  {
    id: 'push-pull-legs-6-day',
    type: 'push_pull_legs',
    goal: 'muscle',
    level: 'advanced',
    daysPerWeek: 6,
    estMinutes: 70,
    premium: true,
    i18n: {
      en: {
        name: 'Push Pull Legs (6 days)',
        description: 'A high-frequency split that runs push, pull and legs twice a week with two different variations of each day. A general example for experienced lifters who recover well from frequent training.',
      },
      fr: {
        name: 'Push Pull Legs (6 jours)',
        description: "Une répartition à haute fréquence qui enchaîne poussée, tirage et jambes deux fois par semaine, avec deux variantes de chaque séance. Un exemple général pour les pratiquants expérimentés qui récupèrent bien d'un entraînement fréquent.",
      },
      es: {
        name: 'Empuje, tirón, pierna (6 días)',
        description: 'Una división de alta frecuencia que repite empuje, tirón y pierna dos veces por semana, con dos variantes de cada día. Un ejemplo general si tienes experiencia y te recuperas bien de entrenar a menudo.',
      },
    },
    days: [
      day('Push A', 'Poussée A', 'Empuje A', [
        reps('barbell-bench-press', 4, 5, 7, 150),
        reps('overhead-press', 3, 6, 8, 120),
        reps('incline-dumbbell-press', 3, 8, 10, 90),
        reps('cable-crossover', 3, 12, 15, 60),
        reps('dumbbell-lateral-raise', 4, 12, 15, 45),
        reps('rope-pushdown', 3, 10, 12, 60),
      ]),
      day('Pull A', 'Tirage A', 'Tirón A', [
        reps('deadlift', 3, 5, 5, 180),
        reps('pull-up', 4, 6, 8, 120),
        reps('barbell-bent-over-row', 3, 8, 10, 120),
        reps('face-pull', 3, 12, 15, 60),
        reps('barbell-curl', 3, 8, 10, 60),
        reps('hammer-curl', 2, 10, 12, 60),
      ]),
      day('Legs A', 'Jambes A', 'Pierna A', [
        reps('back-squat', 4, 5, 7, 180),
        reps('romanian-deadlift', 3, 8, 10, 120),
        reps('leg-press', 3, 10, 12, 90),
        reps('lying-leg-curl', 3, 10, 12, 60),
        reps('standing-calf-raise', 4, 10, 12, 60),
        reps('hanging-leg-raise', 3, 8, 12, 60),
      ]),
      day('Push B', 'Poussée B', 'Empuje B', [
        reps('overhead-press', 4, 6, 8, 150),
        reps('incline-barbell-bench-press', 3, 8, 10, 120),
        reps('chest-dip', 3, 8, 12, 90),
        reps('pec-deck', 3, 12, 15, 60),
        reps('cable-lateral-raise', 3, 12, 15, 45),
        reps('overhead-cable-extension', 3, 10, 12, 60),
      ]),
      day('Pull B', 'Tirage B', 'Tirón B', [
        reps('t-bar-row', 4, 8, 10, 120),
        reps('lat-pulldown', 3, 10, 12, 90),
        reps('chest-supported-dumbbell-row', 3, 10, 12, 90),
        reps('reverse-pec-deck', 3, 12, 15, 60),
        reps('incline-dumbbell-curl', 3, 10, 12, 60),
        reps('cable-curl', 2, 12, 15, 45),
      ]),
      day('Legs B', 'Jambes B', 'Pierna B', [
        reps('front-squat', 4, 6, 8, 150),
        reps('hip-thrust', 3, 8, 10, 120),
        reps('bulgarian-split-squat', 3, 8, 10, 90),
        reps('leg-extension', 3, 12, 15, 60),
        reps('seated-leg-curl', 3, 10, 12, 60),
        reps('seated-calf-raise', 3, 12, 15, 45),
        reps('cable-crunch', 3, 12, 15, 45),
      ]),
    ],
  },
  {
    id: 'hypertrophy-upper-lower',
    type: 'hypertrophy',
    goal: 'muscle',
    level: 'advanced',
    daysPerWeek: 4,
    estMinutes: 70,
    premium: true,
    i18n: {
      en: {
        name: 'Hypertrophy Upper / Lower',
        description: 'A higher-volume upper/lower split with moderate reps, extra isolation work and shorter rests. A general example for experienced lifters focused on muscle building.',
      },
      fr: {
        name: 'Hypertrophie haut / bas du corps',
        description: "Une répartition haut / bas du corps à volume élevé, avec des répétitions modérées, plus d'exercices d'isolation et des repos plus courts. Un exemple général pour les pratiquants expérimentés axés sur la prise de muscle.",
      },
      es: {
        name: 'Hipertrofia torso / pierna',
        description: 'Una división torso / pierna de mayor volumen, con repeticiones moderadas, más trabajo de aislamiento y descansos más cortos. Un ejemplo general si tienes experiencia y buscas ganar músculo.',
      },
    },
    days: [
      day('Upper A', 'Haut du corps A', 'Tren superior A', [
        reps('incline-barbell-bench-press', 4, 6, 10, 120),
        reps('chest-supported-dumbbell-row', 4, 8, 12, 90),
        reps('seated-dumbbell-press', 3, 8, 12, 90),
        reps('lat-pulldown', 3, 10, 12, 75),
        reps('cable-lateral-raise', 3, 12, 15, 45),
        reps('incline-dumbbell-curl', 3, 10, 12, 60),
        reps('rope-pushdown', 3, 10, 12, 60),
      ]),
      day('Lower A', 'Bas du corps A', 'Tren inferior A', [
        reps('hack-squat', 4, 8, 10, 120),
        reps('romanian-deadlift', 4, 8, 10, 120),
        reps('bulgarian-split-squat', 3, 10, 12, 90),
        reps('leg-extension', 3, 12, 15, 60),
        reps('lying-leg-curl', 3, 10, 12, 60),
        reps('standing-calf-raise', 4, 10, 15, 60),
      ]),
      day('Upper B', 'Haut du corps B', 'Tren superior B', [
        reps('dumbbell-bench-press', 4, 8, 12, 90),
        reps('pull-up', 4, 6, 10, 120),
        reps('machine-shoulder-press', 3, 10, 12, 75),
        reps('seated-cable-row', 3, 10, 12, 75),
        reps('cable-crossover', 3, 12, 15, 60),
        reps('reverse-pec-deck', 3, 12, 15, 45),
        reps('hammer-curl', 3, 10, 12, 60),
        reps('overhead-cable-extension', 3, 10, 12, 60),
      ]),
      day('Lower B', 'Bas du corps B', 'Tren inferior B', [
        reps('back-squat', 4, 6, 8, 150),
        reps('hip-thrust', 4, 8, 12, 90),
        reps('leg-press', 3, 12, 15, 90),
        reps('walking-lunge', 2, 10, 12, 75),
        reps('seated-leg-curl', 3, 10, 12, 60),
        reps('seated-calf-raise', 3, 12, 15, 45),
        reps('cable-crunch', 3, 12, 15, 45),
      ]),
    ],
  },
  {
    id: 'glute-focus',
    type: 'hypertrophy',
    goal: 'muscle',
    level: 'advanced',
    daysPerWeek: 2,
    estMinutes: 55,
    premium: true,
    i18n: {
      en: {
        name: 'Glute Focus',
        description: 'Two lower-body days that emphasize the glutes through hip thrusts, hinges, single-leg work and abduction. A general example for experienced lifters who want extra glute volume.',
      },
      fr: {
        name: 'Focus fessiers',
        description: "Deux séances bas du corps qui mettent l'accent sur les fessiers avec hip thrusts, charnières de hanche, travail unilatéral et abduction. Un exemple général pour les pratiquants expérimentés qui veulent plus de volume pour les fessiers.",
      },
      es: {
        name: 'Enfoque en glúteos',
        description: 'Dos días de tren inferior que ponen el foco en los glúteos con hip thrust, bisagras de cadera, trabajo a una pierna y abducción. Un ejemplo general si tienes experiencia y quieres más volumen de glúteo.',
      },
    },
    days: [
      day('Day A', 'Jour A', 'Día A', [
        reps('hip-thrust', 4, 8, 10, 120),
        reps('romanian-deadlift', 3, 8, 10, 120),
        reps('bulgarian-split-squat', 3, 8, 10, 90),
        reps('cable-kickback', 3, 12, 15, 45),
        reps('hip-abduction-machine', 3, 15, 20, 45),
        reps('banded-lateral-walk', 2, 12, 15, 30),
      ]),
      day('Day B', 'Jour B', 'Día B', [
        reps('sumo-deadlift', 4, 5, 6, 150),
        reps('cable-pull-through', 3, 12, 15, 60),
        reps('step-up', 3, 8, 10, 75),
        reps('single-leg-romanian-deadlift', 3, 8, 10, 75),
        reps('frog-pump', 3, 20, 25, 45),
        reps('single-leg-glute-bridge', 2, 12, 15, 45),
        reps('clamshell', 2, 15, 20, 30),
      ]),
    ],
  },
  {
    id: 'interval-cardio',
    type: 'cardio',
    goal: 'endurance',
    level: 'advanced',
    daysPerWeek: 2,
    estMinutes: 35,
    premium: true,
    i18n: {
      en: {
        name: 'Interval Cardio',
        description: 'Two interval sessions, one on cardio machines and one with bodyweight moves, alternating hard efforts with recovery. A general example for people already comfortable with regular cardio.',
      },
      fr: {
        name: 'Cardio fractionné',
        description: "Deux séances de fractionné, l'une sur machines de cardio et l'autre au poids du corps, qui alternent efforts intenses et récupération. Un exemple général pour les personnes déjà à l'aise avec le cardio régulier.",
      },
      es: {
        name: 'Cardio por intervalos',
        description: 'Dos sesiones de intervalos, una en máquinas de cardio y otra con ejercicios de peso corporal, alternando esfuerzos intensos y recuperación. Un ejemplo general si ya estás cómodo con el cardio habitual.',
      },
    },
    days: [
      day('Machine Intervals', 'Fractionné sur machines', 'Intervalos en máquina', [
        cardio('rowing-machine', 1, 300, 60),
        cardio('stationary-bike', 8, 30, 60),
        timed('stair-climber', 4, 60, 60),
        cardio('rowing-machine', 4, 60, 60, 250),
        timed('wall-calf-stretch', 1, 30, 0),
        timed('standing-quad-stretch', 1, 30, 0),
      ]),
      day('Bodyweight Intervals', 'Fractionné au poids du corps', 'Intervalos con peso corporal', [
        timed('jumping-jack', 2, 45, 15),
        timed('high-knees', 6, 30, 30),
        reps('burpee', 5, 8, 10, 45),
        reps('skater-jump', 4, 10, 12, 30),
        timed('mountain-climber', 4, 30, 30),
        reps('jump-squat', 4, 10, 12, 45),
        timed('childs-pose', 1, 45, 0),
      ]),
    ],
  },
  {
    id: 'arms-and-shoulders',
    type: 'hypertrophy',
    goal: 'muscle',
    level: 'advanced',
    daysPerWeek: 2,
    estMinutes: 60,
    premium: true,
    i18n: {
      en: {
        name: 'Arms & Shoulders',
        description: 'Two specialization days for the shoulders, biceps and triceps, starting with heavy presses and finishing with isolation work. A general example to add to an existing routine.',
      },
      fr: {
        name: 'Bras et épaules',
        description: "Deux séances de spécialisation pour les épaules, les biceps et les triceps, qui commencent par des développés lourds et finissent par de l'isolation. Un exemple général à ajouter à une routine existante.",
      },
      es: {
        name: 'Brazos y hombros',
        description: 'Dos días de especialización para hombros, bíceps y tríceps, empezando con presses pesados y terminando con aislamiento. Un ejemplo general para añadir a tu rutina actual.',
      },
    },
    days: [
      day('Day A', 'Jour A', 'Día A', [
        reps('overhead-press', 4, 6, 8, 150),
        reps('close-grip-bench-press', 3, 8, 10, 120),
        reps('barbell-curl', 3, 8, 10, 75),
        reps('dumbbell-lateral-raise', 4, 12, 15, 45),
        reps('lying-triceps-extension', 3, 10, 12, 60),
        reps('incline-dumbbell-curl', 3, 10, 12, 60),
        reps('face-pull', 3, 12, 15, 45),
      ]),
      day('Day B', 'Jour B', 'Día B', [
        reps('seated-dumbbell-press', 4, 8, 10, 90),
        reps('triceps-dip', 3, 8, 12, 90),
        reps('hammer-curl', 3, 10, 12, 60),
        reps('cable-lateral-raise', 3, 12, 15, 45),
        reps('rope-pushdown', 3, 12, 15, 45),
        reps('preacher-curl', 3, 10, 12, 60),
        reps('reverse-pec-deck', 3, 12, 15, 45),
        reps('zottman-curl', 2, 10, 12, 45),
      ]),
    ],
  },
  {
    id: 'advanced-strength',
    type: 'strength',
    goal: 'strength',
    level: 'advanced',
    daysPerWeek: 4,
    estMinutes: 65,
    premium: true,
    i18n: {
      en: {
        name: 'Advanced Strength',
        description: 'Four days each built around one main lift (squat, bench press, deadlift, overhead press) in low reps, followed by supporting exercises. A general example for experienced lifters with solid technique.',
      },
      fr: {
        name: 'Force avancée',
        description: "Quatre séances construites chacune autour d'un mouvement principal (squat, développé couché, soulevé de terre, développé militaire) en faibles répétitions, suivi d'exercices complémentaires. Un exemple général pour les pratiquants expérimentés à la technique solide.",
      },
      es: {
        name: 'Fuerza avanzada',
        description: 'Cuatro días construidos cada uno en torno a un ejercicio principal (sentadilla, press de banca, peso muerto, press militar) con pocas repeticiones, seguido de ejercicios de apoyo. Un ejemplo general si tienes experiencia y una técnica sólida.',
      },
    },
    days: [
      day('Squat Day', 'Jour squat', 'Día de sentadilla', [
        reps('back-squat', 5, 3, 5, 180),
        reps('front-squat', 3, 5, 6, 150),
        reps('romanian-deadlift', 3, 6, 8, 120),
        reps('bulgarian-split-squat', 3, 8, 10, 90),
        reps('ab-wheel-rollout', 3, 8, 10, 60),
      ]),
      day('Bench Day', 'Jour développé couché', 'Día de press de banca', [
        reps('barbell-bench-press', 5, 3, 5, 180),
        reps('close-grip-bench-press', 3, 5, 6, 150),
        reps('barbell-bent-over-row', 4, 6, 8, 120),
        reps('pull-up', 3, 6, 8, 120),
        reps('face-pull', 3, 12, 15, 60),
      ]),
      day('Deadlift Day', 'Jour soulevé de terre', 'Día de peso muerto', [
        reps('deadlift', 5, 3, 3, 180),
        reps('good-morning', 3, 6, 8, 120),
        reps('hip-thrust', 3, 6, 8, 120),
        reps('barbell-shrug', 3, 8, 10, 90),
        reps('hanging-leg-raise', 3, 8, 12, 60),
      ]),
      day('Overhead Day', 'Jour développé militaire', 'Día de press militar', [
        reps('overhead-press', 5, 3, 5, 180),
        reps('push-press', 3, 3, 5, 150),
        reps('incline-barbell-bench-press', 3, 6, 8, 120),
        reps('chin-up', 3, 6, 8, 120),
        reps('dumbbell-lateral-raise', 3, 10, 12, 60),
        timed('farmers-carry', 3, 40, 90),
      ]),
    ],
  },
  {
    id: 'upper-body-bodyweight',
    type: 'bodyweight',
    goal: 'muscle',
    level: 'advanced',
    daysPerWeek: 2,
    estMinutes: 50,
    premium: true,
    i18n: {
      en: {
        name: 'Upper Body Bodyweight',
        description: 'A demanding upper-body session with pull-ups, dips, pike push-ups and push-up variations, needing only a bar and parallel bars. A general example for people who can already do several strict pull-ups.',
      },
      fr: {
        name: 'Haut du corps au poids du corps',
        description: "Une séance exigeante pour le haut du corps avec tractions, dips, pompes piquées et variantes de pompes, qui ne demande qu'une barre et des barres parallèles. Un exemple général pour les personnes qui font déjà plusieurs tractions strictes.",
      },
      es: {
        name: 'Tren superior con peso corporal',
        description: 'Una sesión exigente de tren superior con dominadas, fondos, flexiones en pica y variantes de flexiones, para la que solo necesitas una barra y unas paralelas. Un ejemplo general si ya puedes hacer varias dominadas estrictas.',
      },
    },
    days: [
      day('Upper Body', 'Haut du corps', 'Tren superior', [
        reps('pull-up', 4, 6, 10, 120),
        reps('chest-dip', 4, 8, 12, 90),
        reps('pike-push-up', 3, 8, 10, 90),
        reps('inverted-row', 3, 8, 12, 75),
        reps('diamond-push-up', 3, 8, 12, 60),
        reps('wide-push-up', 3, 12, 15, 60),
        reps('plank-shoulder-tap', 2, 16, 20, 45),
      ]),
    ],
  },
];
