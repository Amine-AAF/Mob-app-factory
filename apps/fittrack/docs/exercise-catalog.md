# FitTrack exercise catalog (v1)

Source of truth for exercise **ids** (stable forever: user history references them), English
names, equipment and tracking type. Full localized content lives in
`src/content/exercises/<category>.ts` (en / fr / es). Tests check that both stay in sync.

Tracking: `W` = weight_reps · `R` = reps · `T` = time · `D` = distance_time.
Equipment ids: bodyweight, dumbbells, barbell, resistance_bands, kettlebell, machine, cable, bench, other.

## chest (21)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| barbell-bench-press | Barbell Bench Press | barbell, bench | W |
| incline-barbell-bench-press | Incline Barbell Bench Press | barbell, bench | W |
| decline-barbell-bench-press | Decline Barbell Bench Press | barbell, bench | W |
| dumbbell-bench-press | Dumbbell Bench Press | dumbbells, bench | W |
| incline-dumbbell-press | Incline Dumbbell Press | dumbbells, bench | W |
| dumbbell-fly | Dumbbell Fly | dumbbells, bench | W |
| incline-dumbbell-fly | Incline Dumbbell Fly | dumbbells, bench | W |
| push-up | Push-Up | bodyweight | R |
| knee-push-up | Knee Push-Up | bodyweight | R |
| incline-push-up | Incline Push-Up | bodyweight, bench | R |
| decline-push-up | Decline Push-Up | bodyweight, bench | R |
| diamond-push-up | Diamond Push-Up | bodyweight | R |
| wide-push-up | Wide Push-Up | bodyweight | R |
| chest-dip | Chest Dip | bodyweight, other | R |
| cable-crossover | Cable Crossover | cable | W |
| low-to-high-cable-fly | Low-to-High Cable Fly | cable | W |
| machine-chest-press | Machine Chest Press | machine | W |
| pec-deck | Pec Deck Fly | machine | W |
| band-chest-press | Resistance Band Chest Press | resistance_bands | R |
| dumbbell-floor-press | Dumbbell Floor Press | dumbbells | W |
| plate-squeeze-press | Plate Squeeze Press | other | W |

## back (23)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| pull-up | Pull-Up | bodyweight, other | R |
| chin-up | Chin-Up | bodyweight, other | R |
| band-assisted-pull-up | Band-Assisted Pull-Up | resistance_bands, other | R |
| lat-pulldown | Lat Pulldown | cable, machine | W |
| close-grip-lat-pulldown | Close-Grip Lat Pulldown | cable | W |
| seated-cable-row | Seated Cable Row | cable | W |
| barbell-bent-over-row | Barbell Bent-Over Row | barbell | W |
| one-arm-dumbbell-row | One-Arm Dumbbell Row | dumbbells, bench | W |
| chest-supported-dumbbell-row | Chest-Supported Dumbbell Row | dumbbells, bench | W |
| t-bar-row | T-Bar Row | barbell, machine | W |
| inverted-row | Inverted Row | bodyweight, other | R |
| machine-row | Machine Row | machine | W |
| straight-arm-pulldown | Straight-Arm Pulldown | cable | W |
| band-pull-apart | Band Pull-Apart | resistance_bands | R |
| band-row | Resistance Band Row | resistance_bands | R |
| deadlift | Conventional Deadlift | barbell | W |
| rack-pull | Rack Pull | barbell | W |
| back-extension | Back Extension | machine, bodyweight | R |
| superman-hold | Superman Hold | bodyweight | T |
| kettlebell-row | Kettlebell Row | kettlebell | W |
| renegade-row | Renegade Row | dumbbells | W |
| barbell-shrug | Barbell Shrug | barbell | W |
| dumbbell-shrug | Dumbbell Shrug | dumbbells | W |

## shoulders (20)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| overhead-press | Barbell Overhead Press | barbell | W |
| seated-dumbbell-press | Seated Dumbbell Shoulder Press | dumbbells, bench | W |
| arnold-press | Arnold Press | dumbbells | W |
| dumbbell-lateral-raise | Dumbbell Lateral Raise | dumbbells | W |
| cable-lateral-raise | Cable Lateral Raise | cable | W |
| front-raise | Dumbbell Front Raise | dumbbells | W |
| rear-delt-fly | Bent-Over Rear Delt Fly | dumbbells | W |
| reverse-pec-deck | Reverse Pec Deck | machine | W |
| face-pull | Cable Face Pull | cable | W |
| upright-row | Wide-Grip Upright Row | barbell | W |
| machine-shoulder-press | Machine Shoulder Press | machine | W |
| landmine-press | Landmine Press | barbell | W |
| pike-push-up | Pike Push-Up | bodyweight | R |
| band-lateral-raise | Band Lateral Raise | resistance_bands | R |
| band-face-pull | Band Face Pull | resistance_bands | R |
| kettlebell-press | Kettlebell Overhead Press | kettlebell | W |
| push-press | Push Press | barbell | W |
| prone-y-raise | Prone Y Raise | bodyweight, bench | R |
| wall-slide | Wall Slide | bodyweight | R |
| plate-front-raise | Plate Front Raise | other | W |

## arms (24)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| barbell-curl | Barbell Curl | barbell | W |
| dumbbell-curl | Dumbbell Biceps Curl | dumbbells | W |
| hammer-curl | Hammer Curl | dumbbells | W |
| incline-dumbbell-curl | Incline Dumbbell Curl | dumbbells, bench | W |
| concentration-curl | Concentration Curl | dumbbells, bench | W |
| preacher-curl | Preacher Curl | barbell, bench | W |
| cable-curl | Cable Curl | cable | W |
| band-curl | Resistance Band Curl | resistance_bands | R |
| reverse-curl | Reverse-Grip Curl | barbell | W |
| zottman-curl | Zottman Curl | dumbbells | W |
| machine-biceps-curl | Machine Biceps Curl | machine | W |
| close-grip-bench-press | Close-Grip Bench Press | barbell, bench | W |
| lying-triceps-extension | Lying Triceps Extension | barbell, bench | W |
| overhead-dumbbell-extension | Overhead Dumbbell Triceps Extension | dumbbells | W |
| triceps-pushdown | Cable Triceps Pushdown | cable | W |
| rope-pushdown | Rope Triceps Pushdown | cable | W |
| overhead-cable-extension | Overhead Cable Triceps Extension | cable | W |
| dumbbell-kickback | Dumbbell Triceps Kickback | dumbbells, bench | W |
| bench-dip | Bench Dip | bodyweight, bench | R |
| triceps-dip | Parallel Bar Triceps Dip | bodyweight, other | R |
| band-triceps-extension | Band Triceps Extension | resistance_bands | R |
| machine-triceps-extension | Machine Triceps Extension | machine | W |
| wrist-curl | Wrist Curl | dumbbells, bench | W |
| reverse-wrist-curl | Reverse Wrist Curl | dumbbells, bench | W |

## legs (25)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| back-squat | Barbell Back Squat | barbell | W |
| front-squat | Barbell Front Squat | barbell | W |
| goblet-squat | Goblet Squat | dumbbells, kettlebell | W |
| bodyweight-squat | Bodyweight Squat | bodyweight | R |
| chair-squat | Chair Squat | bodyweight, other | R |
| leg-press | Leg Press | machine | W |
| hack-squat | Hack Squat | machine | W |
| leg-extension | Leg Extension | machine | W |
| lying-leg-curl | Lying Leg Curl | machine | W |
| seated-leg-curl | Seated Leg Curl | machine | W |
| romanian-deadlift | Romanian Deadlift | barbell | W |
| dumbbell-romanian-deadlift | Dumbbell Romanian Deadlift | dumbbells | W |
| walking-lunge | Walking Lunge | bodyweight | R |
| dumbbell-reverse-lunge | Dumbbell Reverse Lunge | dumbbells | W |
| bulgarian-split-squat | Bulgarian Split Squat | dumbbells, bench | W |
| step-up | Step-Up | bench, dumbbells | W |
| standing-calf-raise | Standing Calf Raise | machine, bodyweight | W |
| seated-calf-raise | Seated Calf Raise | machine | W |
| single-leg-calf-raise | Single-Leg Calf Raise | bodyweight | R |
| wall-sit | Wall Sit | bodyweight | T |
| sumo-squat | Dumbbell Sumo Squat | dumbbells | W |
| nordic-curl | Nordic Hamstring Curl | bodyweight, other | R |
| lateral-lunge | Lateral Lunge | bodyweight | R |
| banded-squat | Resistance Band Squat | resistance_bands | R |
| assisted-single-leg-squat | Assisted Single-Leg Squat | bodyweight, other | R |

## glutes (17)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| hip-thrust | Barbell Hip Thrust | barbell, bench | W |
| dumbbell-hip-thrust | Dumbbell Hip Thrust | dumbbells, bench | W |
| glute-bridge | Glute Bridge | bodyweight | R |
| single-leg-glute-bridge | Single-Leg Glute Bridge | bodyweight | R |
| banded-glute-bridge | Banded Glute Bridge | resistance_bands | R |
| frog-pump | Frog Pump | bodyweight | R |
| cable-kickback | Cable Glute Kickback | cable | W |
| donkey-kick | Donkey Kick | bodyweight | R |
| fire-hydrant | Fire Hydrant | bodyweight | R |
| banded-lateral-walk | Banded Lateral Walk | resistance_bands | R |
| clamshell | Clamshell | resistance_bands, bodyweight | R |
| hip-abduction-machine | Machine Hip Abduction | machine | W |
| cable-pull-through | Cable Pull-Through | cable | W |
| good-morning | Barbell Good Morning | barbell | W |
| curtsy-lunge | Curtsy Lunge | bodyweight, dumbbells | R |
| sumo-deadlift | Sumo Deadlift | barbell | W |
| single-leg-romanian-deadlift | Single-Leg Romanian Deadlift | dumbbells | W |

## abs (23)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| plank | Front Plank | bodyweight | T |
| side-plank | Side Plank | bodyweight | T |
| crunch | Crunch | bodyweight | R |
| bicycle-crunch | Bicycle Crunch | bodyweight | R |
| reverse-crunch | Reverse Crunch | bodyweight | R |
| dead-bug | Dead Bug | bodyweight | R |
| bird-dog | Bird Dog | bodyweight | R |
| hollow-hold | Hollow Body Hold | bodyweight | T |
| lying-leg-raise | Lying Leg Raise | bodyweight | R |
| hanging-knee-raise | Hanging Knee Raise | other | R |
| hanging-leg-raise | Hanging Leg Raise | other | R |
| russian-twist | Russian Twist | bodyweight, dumbbells | R |
| mountain-climber | Mountain Climber | bodyweight | T |
| cable-crunch | Kneeling Cable Crunch | cable | W |
| ab-wheel-rollout | Ab Wheel Rollout | other | R |
| pallof-press | Pallof Press | cable, resistance_bands | R |
| cable-woodchop | Cable Woodchop | cable | W |
| flutter-kick | Flutter Kicks | bodyweight | T |
| v-up | V-Up | bodyweight | R |
| heel-tap | Lying Heel Tap | bodyweight | R |
| plank-shoulder-tap | Plank Shoulder Tap | bodyweight | R |
| decline-sit-up | Decline Sit-Up | bench | R |
| bear-plank | Bear Plank Hold | bodyweight | T |

## full_body (17)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| burpee | Burpee | bodyweight | R |
| kettlebell-swing | Kettlebell Swing | kettlebell | W |
| dumbbell-thruster | Dumbbell Thruster | dumbbells | W |
| dumbbell-clean-and-press | Dumbbell Clean and Press | dumbbells | W |
| power-clean | Barbell Power Clean | barbell | W |
| farmers-carry | Farmer's Carry | dumbbells, kettlebell | T |
| turkish-get-up | Turkish Get-Up | kettlebell | W |
| kettlebell-clean | Kettlebell Clean | kettlebell | W |
| bear-crawl | Bear Crawl | bodyweight | T |
| inchworm | Inchworm | bodyweight | R |
| squat-thrust | Squat Thrust | bodyweight | R |
| ball-slam | Ball Slam | other | R |
| sled-push | Sled Push | other | D |
| battle-rope-waves | Battle Rope Waves | other | T |
| dumbbell-snatch | Single-Arm Dumbbell Snatch | dumbbells | W |
| wall-ball | Wall Ball Shot | other | R |
| plank-up-down | Plank Up-Down | bodyweight | R |

## cardio (17)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| outdoor-run | Running | bodyweight | D |
| brisk-walk | Brisk Walking | bodyweight | D |
| treadmill-run | Treadmill Running | machine | D |
| incline-treadmill-walk | Incline Treadmill Walk | machine | D |
| stationary-bike | Stationary Bike | machine | D |
| outdoor-cycling | Outdoor Cycling | other | D |
| elliptical | Elliptical Trainer | machine | D |
| rowing-machine | Rowing Machine | machine | D |
| swimming | Swimming | other | D |
| stair-climber | Stair Climber | machine | T |
| jump-rope | Jump Rope | other | T |
| jumping-jack | Jumping Jacks | bodyweight | T |
| high-knees | High Knees | bodyweight | T |
| butt-kick | Butt Kicks | bodyweight | T |
| shadow-boxing | Shadow Boxing | bodyweight | T |
| skater-jump | Skater Jumps | bodyweight | R |
| jump-squat | Jump Squat | bodyweight | R |

## mobility (15)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| cat-cow | Cat-Cow | bodyweight | R |
| lunge-with-rotation | Lunge with Thoracic Rotation | bodyweight | R |
| standing-hip-circle | Standing Hip Circles | bodyweight | R |
| ninety-ninety-switch | 90/90 Hip Switch | bodyweight | R |
| quadruped-thoracic-rotation | Quadruped Thoracic Rotation | bodyweight | R |
| band-pass-through | Band Shoulder Pass-Through | resistance_bands | R |
| knee-to-wall-ankle | Knee-to-Wall Ankle Mobilization | bodyweight | R |
| deep-squat-hold | Deep Squat Hold | bodyweight | T |
| arm-circle | Arm Circles | bodyweight | T |
| leg-swing | Leg Swings | bodyweight | R |
| spiderman-lunge | Spiderman Lunge | bodyweight | R |
| scapular-push-up | Scapular Push-Up | bodyweight | R |
| wrist-circle | Wrist Mobility Circles | bodyweight | T |
| thread-the-needle | Thread the Needle | bodyweight | R |
| frog-rock | Frog Rock-Back | bodyweight | R |

## stretching (17)
| id | name | equipment | tracking |
| --- | --- | --- | --- |
| standing-hamstring-stretch | Standing Hamstring Stretch | bodyweight | T |
| standing-quad-stretch | Standing Quad Stretch | bodyweight | T |
| kneeling-hip-flexor-stretch | Kneeling Hip Flexor Stretch | bodyweight | T |
| pigeon-stretch | Pigeon Stretch | bodyweight | T |
| figure-four-stretch | Supine Figure-Four Stretch | bodyweight | T |
| butterfly-stretch | Butterfly Stretch | bodyweight | T |
| childs-pose | Child's Pose | bodyweight | T |
| cobra-stretch | Cobra Stretch | bodyweight | T |
| doorway-chest-stretch | Doorway Chest Stretch | other | T |
| cross-body-shoulder-stretch | Cross-Body Shoulder Stretch | bodyweight | T |
| overhead-triceps-stretch | Overhead Triceps Stretch | bodyweight | T |
| wall-calf-stretch | Wall Calf Stretch | bodyweight | T |
| seated-forward-fold | Seated Forward Fold | bodyweight | T |
| supine-spinal-twist | Supine Spinal Twist | bodyweight | T |
| neck-side-stretch | Neck Side Stretch | bodyweight | T |
| kneeling-lat-stretch | Kneeling Lat Stretch | bench, bodyweight | T |
| downward-dog | Downward Dog | bodyweight | T |

Total: 219 exercises.
