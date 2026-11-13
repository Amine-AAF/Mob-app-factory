/**
 * SafeVault passphrase word list (original, written for this app).
 * Short, common, lowercase English words, easy to type on a phone keyboard.
 * Duplicates are removed at load time; the entropy shown in the UI uses the real size.
 * Tests require at least 512 unique words (≥ 9 bits per word).
 */
const RAW = `
able acid acorn actor adapt admit adult agent agree ahead aim air alarm album alert alien alley allow alpha amber
ample anchor angle ankle apple april apron arch arena argue armor army arrow art ash aspen atlas atom attic audio
august aunt autumn avid awake award axis baby bacon badge bagel baker balance bamboo banana band banjo barn barrel
basil basket bath beach beacon bean bear beaver bed bee beetle bell belt bench berry bicycle bike bird birch biscuit
blade blank blast blaze blend bloom blossom blue board boat body bolt bone bonus book boost boot border bottle bounce
bowl box brain branch brass brave bread breeze brick bridge brief bright brisk broad bronze brook broom brush bubble
bucket buddy budget buffalo bugle build bulb bunch bundle bunny burst bus butter button cabin cable cactus cake calm
camel camera camp canal candle candy canoe canvas canyon cape captain carbon card cargo carpet carrot cart castle
cat cave cedar cell cello cement chair chalk champ chant chapel charm chart chase cheese chef cherry chess chest
chief chili chimney chip choice chord circle city clay clever cliff climb clock cloth cloud clover coach coast cobra
cocoa coconut code coffee coin comet comfort comic cookie copper coral corn corner cotton couch cougar country cover
coyote crab craft crane crater crayon cream creek crew cricket crisp crown crystal cube cup curtain curve cushion
cycle daisy dance dawn deck deer delta denim desert desk detail dial diamond diary diesel dinner dish dock dolphin
domain donkey door dove dozen dragon drama dream dress drift drink drum duck dune dust eagle earth easel echo eclipse
edge eel effort eight elbow elder elm ember emerald empire energy engine epic equal error essay estate evening exact
exit fabric falcon fame family fancy farm fashion feast feather fence ferry festival fiber field fig film finch
finger fire fish flag flame flash fleet flight flint flock flora flower flute foam focus fog folk forest fork fossil
fountain fox frame fresh frog frost fruit fuel galaxy game garage garden garlic gate gecko gem genius ghost giant
ginger giraffe glacier glass globe glove glow goat gold golf goose gorilla grain grape graph grass gravel gravity
green grid grill group guitar gull habit hammer hamster harbor harp harvest hawk hazel heart hedge helmet herb hero
heron hill hobby honey hood hope horizon horn horse hotel hour house humble hunter hurdle husky ice icon idea igloo
image index indigo inlet insect island ivory jacket jade jaguar jam jar jazz jelly jewel jigsaw joke journal joy
judge juice jumbo jungle kayak kernel kettle key kidney king kite kitten kiwi knee knife knight koala label ladder
lagoon lake lamp lantern laptop large laser lava lawn layer leaf lemon lens leopard letter level library lily lime
linen lion lizard llama lobster locket lodge logic lotus lunar lunch lynx machine magnet mango manor maple marble
market marsh mask meadow medal melody melon memory menu mercury metal meteor milk mill mint mirror mist mixer model
modem moment monkey moon moose morning mosaic moss motor mountain mouse mud muffin mule museum music mustard myth
nacho napkin narrow nature navy nectar needle nest net nickel night ninja noble noodle north notch novel number nut
oak oasis ocean octave olive omega onion opal open opera orange orbit orchard orchid organ otter outlet oval oven
owl oxygen oyster paddle page paint palace palm panda panel panther paper parade parcel park parrot pasta path peach
peanut pearl pebble pecan pedal pelican pencil penguin pepper piano pickle picnic pigeon pillow pilot pine pixel
pizza planet plank plaza plum pocket poem polar pond pony poppy portal potato powder prairie prism puddle pulse pump
puppy puzzle pyramid quartz queen quest quick quiet quill quilt rabbit raccoon radar radio raft rain raisin ranch
raven razor recipe reef relay remote rhino ribbon rice ridge ring ripple river road robin robot rocket rodeo roof
rose rover ruby rugby ruler saddle safari saffron sail salad salmon salt sand satin saturn sauce scale scarf school
scout screen sculpt seal season seed shadow shark shell sheriff shield ship shore shovel signal silk silver siren
sketch skate ski sky slate sled slope smile snack snail snake snow soap soccer sofa solar sonic soup south spark
sparrow spice spider spiral splash sponge spoon spring sprout spruce square squid stable stadium stamp star statue
steam steel stem stone storm story stove straw stream street studio sugar summer summit sun sunset surf swan sweater
swift table tablet taco tango tea teapot temple tennis tent thistle thunder ticket tide tiger timber toast tomato
tonic topaz torch tornado tortoise towel tower toy track tractor trail train treaty tree trend tribe trophy tropic
trout truck trumpet tulip tundra tunnel turkey turtle tuxedo twig ultra umbrella uncle union unit urban valley
vapor vault velvet venus verse vessel violet violin visor vivid voice volcano voyage wafer wagon walnut walrus wand
water wave wax weasel whale wheat wheel whistle willow window winter wizard wolf wombat wood wool world yacht yard
yeast yellow yoga yogurt zebra zero zigzag zinc zipper zone zoom
`;

export const WORDS: readonly string[] = [...new Set(RAW.split(/\s+/).filter((w) => /^[a-z]{2,10}$/.test(w)))];
