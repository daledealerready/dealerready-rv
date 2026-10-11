export type CampingAnswer = {
  reply: string;
  suggestions: string[];
  summary: string;
};

const NEXT = [
  "How do the tanks work?",
  "What is a full hookup?",
  "What happens the first night?",
  "Towable or motorized?",
];

type Topic = {
  phrases: string[];
  words: string[];
  summary: string;
  suggestions?: string[];
  answer: string;
};

const TOPICS: Topic[] = [
  {
    phrases: [
      "fifth wheel and a travel",
      "fifth wheel or a travel",
      "travel trailer or a fifth",
      "travel trailer and a fifth",
      "difference between a fifth",
      "difference between a travel",
    ],
    words: [],
    summary: "Asked how a fifth wheel differs from a travel trailer.",
    answer:
      "Both are towable. A travel trailer hitches to the back bumper. You can tow one with a truck or, if the weights work, an SUV. A fifth wheel hitches in the bed of a pickup, over the rear axle. The front is raised, often into a bedroom or a loft, and it is usually roomier and steadier on the highway.\n\nA fifth wheel needs a pickup. A large one usually wants a 2500 or 3500 because of the pin weight. A travel trailer is the more common first towable.",
  },
  {
    phrases: ["tanks work", "holding tank", "three tank", "the tanks", "what is a tank"],
    words: ["tank", "tanks", "black", "gray", "grey", "fresh", "holding"],
    summary: "Asked how RV tanks work.",
    answer:
      "A camper carries three tanks. Fresh water is the clean water you drink, cook, and shower with. Gray water is what drains from the sinks and the shower. Black water is the toilet.\n\nOn a full hookup you can leave the city-water hose on and dump when you need to. With no sewer at the site, you hold gray and black until a dump station. Keep the black valve closed between dumps so the liquid does not run off and leave the solids behind.",
  },
  {
    phrases: ["black tank", "toilet paper", "rv toilet", "the toilet", "bathroom work", "go to the bathroom", "special toilet"],
    words: ["toilet", "black", "bathroom", "paper", "flush", "poop", "waste"],
    summary: "Asked about the RV toilet.",
    answer:
      "The toilet flushes into a black tank under the floor. It is a closed tank, not a hole in the ground. You empty it at a dump station or at a site that has a sewer connection.\n\nUse toilet paper made for RVs, or a paper that breaks up fast. Thick household paper and wipes are what clog the tank. Keep the black valve closed until you are actually dumping.",
  },
  {
    phrases: ["gray tank", "grey tank", "shower drain", "sink drain"],
    words: ["gray", "grey", "shower", "sink"],
    summary: "Asked about the gray tank.",
    answer:
      "The gray tank holds used water from the sinks and the shower. It fills faster than people expect if the showers are long. On a site with no sewer, short showers save a trip to the dump station.\n\nWhen you dump, empty the black tank first and the gray tank after it. The gray water helps rinse the hose.",
  },
  {
    phrases: ["fresh water", "city water", "fill the tank", "water pump", "water pressure", "pressure regulator", "drink the water"],
    words: ["fresh", "city", "pump", "regulator", "potable", "drinking"],
    summary: "Asked about fresh water.",
    answer:
      "Fresh water comes from the tank you filled, or from a city-water hose at the site. A pump pushes tank water through the faucets. On city water the pump stays off and the campground pressure feeds the coach.\n\nPut a pressure regulator on the city hose. Some campgrounds push harder than RV plumbing likes. If the water tastes off, use drinking water you brought until you know that park.",
  },
  {
    phrases: ["dump the", "dumping", "dump station", "empty the tank", "sewer hose", "black valve"],
    words: ["dump", "dumping", "sewer", "hose", "valve"],
    summary: "Asked how to dump the tanks.",
    answer:
      "Dumping means emptying the gray and black tanks through a sewer hose into a dump inlet. Wear gloves. Connect the hose so it slopes toward the inlet, open the black valve first, close it, then open the gray valve so that water rinses the hose.\n\nClose both valves when you are done, rinse the hose, and stow it apart from the fresh-water hose. Never leave the black valve open for the whole stay.",
  },
  {
    phrases: ["full hookup", "full hook up", "what is a hookup", "hookups", "electric only", "water and electric"],
    words: ["hookup", "hookups", "electric", "sewer", "pedestal"],
    summary: "Asked what a full hookup is.",
    answer:
      "A full hookup site gives you three things at the parking pad: electric, fresh water, and a sewer connection. You can run the air conditioner, stay on city water, and dump without driving to a dump station.\n\nElectric and water only means you still have to hold the tanks. A site with no hookups at all is dry camping. You live on the battery, the water you brought, and whatever you use for power.",
  },
  {
    phrases: ["30 amp", "50 amp", "shore power", "power pedestal", "the adapter", "amp service"],
    words: ["amp", "amps", "shore", "pedestal", "adapter", "electricity"],
    summary: "Asked about campground electric.",
    answer:
      "Campground electric is usually 30 amp or 50 amp. A 30-amp site is one circuit, about 3,600 watts. A 50-amp site is two circuits, about 12,000 watts, which is what larger motorhomes and many big fifth wheels expect.\n\nAn adapter lets the plug fit. It does not create more power. A 50-amp coach on a 30-amp pedestal has to run fewer things at once. The roof air conditioner is the thing that usually has to take turns.",
  },
  {
    phrases: ["generator", "quiet hours", "run the gen", "no electric", "boondock power"],
    words: ["generator", "genny", "quiet"],
    summary: "Asked about a generator.",
    answer:
      "A generator makes its own electric when the site has none, or when you need the air conditioner away from a pedestal. Many campgrounds limit the hours you may run one, often with quiet hours at night.\n\nPark it so the exhaust does not blow into a window, a slide, or a neighbor. Never run a generator in an enclosed space. Carbon monoxide from the exhaust is deadly. A carbon monoxide alarm in the coach is part of camping, not an extra.",
  },
  {
    phrases: ["battery", "batteries", "inverter", "solar", "12 volt", "house battery"],
    words: ["battery", "batteries", "inverter", "solar", "volt"],
    summary: "Asked about RV batteries.",
    answer:
      "The house battery runs the lights, the water pump, the furnace fan, and the detector alarms when you are not plugged in. The engine battery, on a motorhome, is a separate battery for starting.\n\nA typical roof air conditioner is too much for the house battery alone. Shore power, a generator, or a big solar-and-inverter setup is what runs the air. I will not guess the battery size under one floorplan.",
  },
  {
    phrases: ["propane", "the furnace", "heater", "water heater", "how do you heat", "stay warm", "the stove"],
    words: ["propane", "furnace", "heater", "heat", "stove", "warm"],
    summary: "Asked about propane and heat.",
    answer:
      "Propane runs the stove, and on most coaches it runs the furnace and can run the water heater. The furnace also uses a little battery power for its fan, so you can have heat without being plugged in.\n\nTurn the water heater on only after it has water. Running it dry burns the element. While you cook, crack a vent or a window. Turn the propane off at the tank when the campground or the fuel stop asks you to, and any time you are putting fuel in a motorhome or a tow vehicle.",
  },
  {
    phrases: ["air conditioner", "air conditioning", "the ac", "stay cool", "too hot"],
    words: ["conditioner", "cooling", "cool"],
    summary: "Asked about the air conditioner.",
    answer:
      "The roof air conditioner needs real electric, from the campground pedestal or a generator. On most coaches the house battery cannot run it.\n\nOn a 30-amp site, the air conditioner may be the only large appliance you run at one time. Start it, then see if the microwave or the water heater's electric element has to wait.",
  },
  {
    phrases: ["refrigerator", "the fridge", "absorption"],
    words: ["fridge", "refrigerator"],
    summary: "Asked about the RV fridge.",
    answer:
      "Many RV fridges are absorption fridges. They can run on propane or on electric, and they want the coach close to level while they run. A household-style compressor fridge is less fussy and usually wants electric or a strong battery bank.\n\nThe manual for that coach says which fridge it has. I will not guess from a floorplan. Cool the fridge before you load it with food.",
  },
  {
    phrases: ["first night", "arrive at", "when i get there", "setup", "set up", "what do i do when"],
    words: ["arrive", "arrival", "setup", "checklist", "first"],
    summary: "Asked about the first night.",
    answer:
      "On the first night, go slow. Check that the site is long enough before you pull in. Park, then chock the wheels before anyone unhitches.\n\nLevel the coach. Hook up electric, then water. Connect sewer only if the site has it and you need it. Look beside you before you run a slide out, so you clear the neighbor and the picnic table. Turn on the water heater only after it has water. Then sit down. The fine-tuning can wait until morning.",
  },
  {
    phrases: ["level the", "leveling", "stabilizer", "wheel chock", "chock the"],
    words: ["level", "leveling", "stabilizer", "chock", "chocks", "blocks"],
    summary: "Asked about leveling.",
    answer:
      "A coach wants to be close to level so you sleep well, the tanks read right, and an absorption fridge is happy. Boards under the tires, or the landing gear on a fifth wheel, are what get you level.\n\nChock the wheels first. Stabilizer jacks come last. On a travel trailer those jacks stop the bounce after you are parked. They are not what lifts the trailer off the ground.",
  },
  {
    phrases: ["landing gear", "kingpin", "king pin", "fifth wheel hitch", "hitch a fifth", "unhitch a fifth"],
    words: ["landing", "kingpin", "pin", "slider"],
    summary: "Asked how a fifth wheel hitches.",
    answer:
      "A fifth wheel hitches in the bed of a pickup, over the rear axle. The trailer nose has a kingpin. The hitch in the bed locks onto that pin. Landing gear is the pair of jacks at the front. They hold the nose up so the truck can drive out.\n\nChock the trailer wheels before you release the pin. On a short-bed truck the nose can swing toward the cab in a tight turn. Some of those trucks need a hitch that slides. A hitch shop measures that truck and that trailer. I will not call it a fit from here.",
  },
  {
    phrases: ["weight distribution", "sway", "bumper pull", "hitch the trailer", "safety chain", "breakaway", "brake controller", "7 pin", "7 way"],
    words: ["sway", "coupler", "chains", "breakaway", "controller"],
    summary: "Asked how a travel trailer hitches.",
    answer:
      "A travel trailer couples to a ball on the back of the truck. Safety chains cross under the coupler. A breakaway cable pulls the trailer brakes on if the trailer ever comes off the hitch. A brake controller in the truck is what makes those trailer brakes work with your pedal.\n\nMany mid-size travel trailers also want a weight-distribution hitch, which uses spring bars to keep the truck and trailer level and to calm sway. If the trailer starts to sway, ease off the speed. Do not stab the brakes. Chock the wheels before you lift the coupler off the ball.",
  },
  {
    phrases: ["slide out", "slides out", "the slide", "slideout", "put the slide"],
    words: ["slide", "slides", "slideout"],
    summary: "Asked about slide-outs.",
    answer:
      "A slide is a section of the room that pushes out when you are parked and comes back in for the road. It is how a coach feels bigger at camp than it looks on the highway.\n\nBring every slide in before you move. At the site, look for the neighbor, a tree, and the picnic table before you push one out. I will not guess how many slides a floorplan has.",
  },
  {
    phrases: ["awning", "the canopy", "rain on the"],
    words: ["awning"],
    summary: "Asked about the awning.",
    answer:
      "The awning is the fabric roof that rolls out from the side for shade. Put it out when the wind is calm. Roll it in before a storm, before you leave, and any time the campground warns of wind.\n\nDo not grill under it, and do not let a tree limb sit on it. A wet awning can mildew if it stays rolled up wet, so let it dry when you can.",
  },
  {
    phrases: ["boondock", "dry camping", "no hookup", "off grid", "without hookups"],
    words: ["boondock", "boondocking", "dry"],
    summary: "Asked about dry camping.",
    answer:
      "Dry camping, sometimes called boondocking, means the site has no electric, no water spigot, and no sewer. You use the fresh tank, the house battery, and the propane. A generator or solar is what recharges the battery and, if it is big enough, runs the air conditioner.\n\nThe limit is the water you brought and how long the battery lasts. Short showers and the furnace at night are the usual pattern. Dump and fill before you go out again.",
  },
  {
    phrases: ["campground", "campsite", "state park", "pull through", "back in site", "reservation", "how long can", "site length"],
    words: ["campground", "campsite", "park", "reservation", "site"],
    summary: "Asked about campgrounds.",
    answer:
      "A campground is a park with pads for coaches. A pull-through site lets you drive forward out. A back-in site means you back the trailer or the motorhome into the pad. Private parks often have fuller hookups. State and national parks are often prettier and often have fewer hookups, and the sites can be shorter.\n\nCall or read the listing for the maximum coach length before you book. A 40-foot coach does not fit a 25-foot pad. Quiet hours, check-in time, and whether they take pets are in that same listing.",
  },
  {
    phrases: ["what to pack", "what should i bring", "packing", "forgot", "what do i need to bring", "beginner pack"],
    words: ["pack", "bring", "forgot", "gloves"],
    summary: "Asked what to pack.",
    answer:
      "For a first trip, bring the sewer hose and gloves, a fresh-water hose, a pressure regulator, leveling blocks, wheel chocks, the power cord if it is not already in the coach, and drinking water. Add a flashlight, basic tools, and the manual.\n\nBring less clothing than you think and more paper towels than you think. A first night is easier if the tanks start empty and the fresh tank starts full.",
  },
  {
    phrases: ["ride in the", "kids ride", "passengers in", "people in the trailer", "sit in the trailer", "ride in a fifth"],
    words: ["passenger", "passengers", "ride", "riding"],
    summary: "Asked if people can ride in the trailer.",
    answer:
      "People do not ride in a travel trailer or a fifth wheel while it is being towed. Everyone rides in the truck, in a seat, with a belt.\n\nIn a motorhome, people ride in seats with belts. A dinette or a bed is not a seat while the coach is moving. Pets go in a crate or a restraint, not loose on the dash.",
  },
  {
    phrases: ["driver license", "drivers license", "cdl", "special license", "motorcycle license"],
    words: ["license", "cdl", "licence"],
    summary: "Asked about a driver license.",
    answer:
      "A regular driver license covers most personal trips in a motorhome or behind a trailer. A very heavy coach, air brakes, or a commercial use can add a rule, and states are not all the same.\n\nCheck the state you live in and the states you will drive through. I am not the license office, and I will not guess that a specific coach is under or over a line.",
  },
  {
    phrases: ["how tall", "bridge", "clearance", "drive through", "gas station canopy", "coach height"],
    words: ["tall", "height", "bridge", "clearance", "canopy"],
    summary: "Asked about height and bridges.",
    answer:
      "A motorhome and a fifth wheel are taller than a pickup. Know that coach's height before a bridge, a drive-through, or a gas-station canopy. The number is in the manual or on a sticker for that coach. I will not guess it.\n\nIf a sign says the clearance and you are not sure you fit, do not try it. Turn around while you still can.",
  },
  {
    phrases: ["tow a car", "dinghy", "toad", "flat tow", "behind the motorhome"],
    words: ["dinghy", "toad"],
    summary: "Asked about towing a car behind a motorhome.",
    answer:
      "A motorhome can tow a small car so you have a way into town. That only works if that car is approved by its maker to be towed with all four wheels down, or you bring a trailer or a dolly.\n\nThe motorhome has its own tow rating, and the car counts against it. I will not guess that a car is flat-towable. The car maker's guide is the source.",
  },
  {
    phrases: ["live in it", "full time", "full-time", "live full", "year round"],
    words: ["fulltime", "livable"],
    summary: "Asked about living in an RV.",
    answer:
      "People do live in motorhomes, fifth wheels, and travel trailers full time. The coach is a small house: tanks, propane, mail, and a place to dump become weekly chores, not vacation details.\n\nA weekend camper can ignore a lot of that. A full-timer usually wants more fresh water, more tank, and a floorplan they can stand up and cook in. I will not pick that floorplan for you from a model name.",
  },
  {
    phrases: ["winterize", "winterizing", "antifreeze", "freeze", "cold weather", "four season"],
    words: ["winter", "winterize", "freeze", "antifreeze"],
    summary: "Asked about winter and freezing.",
    answer:
      "Water left in the pipes can freeze and split them. Winterizing means draining the fresh tank and the water heater, blowing or pumping RV antifreeze through the lines, and draining the tanks. The pink antifreeze made for RV plumbing is the one used in the pipes. It is not drinking water, and it is not the antifreeze from a car.\n\nA four-season label means the builder added more insulation and often a heated underbelly. It does not mean every night below zero will be easy. The manual for that coach is the winterizing steps to follow.",
  },
  {
    phrases: ["tire age", "how old are the tires", "blowout", "tire pressure", "date code"],
    words: ["tire", "tires", "blowout", "psi"],
    summary: "Asked about RV tires.",
    answer:
      "RV tires age out even when the tread still looks fine. The sidewall has a date code for the week and year they were built. Many shops want trailer tires replaced around six or seven years even if they have not worn out.\n\nSet the pressure from the tire's sidewall and the coach maker's chart, checked cold, before a trip. A low trailer tire is a common reason for a bad day. I will not guess the pressure for a tire I cannot see.",
  },
  {
    phrases: ["carbon monoxide", "smoke alarm", "propane detector", "lp detector", "co alarm"],
    words: ["monoxide", "detector", "alarm"],
    summary: "Asked about safety alarms.",
    answer:
      "A coach should have a smoke alarm, a propane detector, and a carbon monoxide alarm. Test them before a trip. They run on battery or on the coach power, and a dead battery in an alarm is a reason to stop and replace it.\n\nCarbon monoxide comes from exhaust: a generator, a furnace, a vehicle, a grill. Never run those where the exhaust can sit under an awning or come in a window.",
  },
  {
    phrases: ["campfire", "fire ban", "fire pit", "bonfire"],
    words: ["campfire", "fire", "ban"],
    summary: "Asked about campfires.",
    answer:
      "Use the ring the campground gives you, and check for a fire ban before you light anything. Dry counties and summer parks often ban fires even when the evenings look fine.\n\nKeep the fire small, keep water or a hose close, and drown it until it is cold before you go inside. Do not light a fire under the awning or next to a slide.",
  },
  {
    phrases: ["pet", "dog", "dogs", "cat"],
    words: ["pet", "pets", "dog", "dogs", "leash"],
    summary: "Asked about camping with a pet.",
    answer:
      "Most private campgrounds allow a dog on a leash and expect you to pick up. Some state and national parks do not allow pets on trails or in buildings. Read that park's rule before you arrive.\n\nIn the coach, a crate gives the dog a place when you are at the office or when slides are moving. Do not leave a pet in a closed coach in the heat. The air conditioner only helps while the power is on.",
  },
  {
    phrases: ["bug", "mosquito", "screens"],
    words: ["bugs", "mosquito", "mosquitoes", "screen"],
    summary: "Asked about bugs.",
    answer:
      "Keep the screen door closed and fix a torn screen before a trip. A light left on over the picnic table is an invitation. Many people use a site that gets a little breeze, long sleeves at dusk, and a repellent they already know they can use.\n\nCheck the door sweep. A lot of mosquitoes come in under the door, not through the roof.",
  },
  {
    phrases: ["wifi", "wi fi", "internet", "cell signal", "hotspot", "netflix"],
    words: ["wifi", "internet", "cell", "signal", "hotspot"],
    summary: "Asked about internet at camp.",
    answer:
      "Campground Wi-Fi is often slow once every site is on it. A phone hotspot is the usual backup. A cell booster helps some people and does nothing in a dead valley.\n\nI will not promise a signal at a park. If you need to work, check coverage for that spot before you book, and have a plan for a day with none.",
  },
  {
    phrases: ["back up", "backing", "back the trailer", "reverse the trailer", "spotter"],
    words: ["backing", "spotter", "reverse"],
    summary: "Asked about backing a trailer.",
    answer:
      "Backing a trailer is a slow skill. Put a person outside, where you can see them, and agree on hand signals before you move. The bottom of the steering wheel is the easy cue: move the bottom of the wheel the way you want the trailer to go.\n\nGet out and look the first seasons. A cone or a camp chair at the corner you must not hit is cheaper than a neighbor's grill. A motorhome backs like a large van, still with a spotter when the site is tight.",
  },
  {
    phrases: ["how fast", "speed limit", "tow speed", "too fast"],
    words: ["speed", "mph", "highway"],
    summary: "Asked how fast to tow.",
    answer:
      "Tow at a speed where the trailer stays quiet and straight, which is often slower than you would drive the truck alone. Mountains, wind, and a short merge are reasons to leave a bigger gap.\n\nIf the trailer sways, come off the throttle and let it settle. Do not slam the brakes. The tire rating and the truck's tow rating still rule, and I will not invent a speed limit for a trailer I have not seen.",
  },
  {
    phrases: ["mountain", "downhill", "tow haul", "grade", "steep hill"],
    words: ["mountain", "downhill", "grade", "brake"],
    summary: "Asked about mountain driving.",
    answer:
      "On a long downgrade, use a lower gear so the engine holds the coach back. Riding the brakes is how they fade. Tow/haul mode, if the truck has it, is for this.\n\nStart the grade slower than you think. A motorhome and a fifth wheel are heavy, and the brakes are happier if you never let the speed build. Pull off if they smell hot.",
  },
  {
    phrases: ["shower", "take a shower", "how do you bathe"],
    words: ["shower", "bathe"],
    summary: "Asked about showers.",
    answer:
      "The shower uses fresh water from the tank or from the city hose. On city water you can shower more freely. On the tank, a short shower keeps you from filling the gray tank and emptying the fresh tank on night one.\n\nThe water heater has to be on, and it has to have water in it first. Campground bathhouses are there for the mornings you want to save the tanks.",
  },
  {
    phrases: ["cook", "cooking", "kitchen", "grill", "microwave"],
    words: ["cook", "cooking", "grill", "oven", "kitchen"],
    summary: "Asked about cooking.",
    answer:
      "Most coaches have a propane stove and a small sink. Open a vent while a burner is on. A microwave wants shore power or a generator.\n\nGrill outside, away from the awning, the slides, and the propane compartment. Never grill inside, and never under a closed awning. Let the coach air out after you cook.",
  },
  {
    phrases: ["insurance", "insured", "coverage"],
    words: ["insurance", "policy", "premium"],
    summary: "Asked about RV insurance.",
    answer:
      "A motorhome, a travel trailer, and a fifth wheel need their own insurance conversation. An auto policy does not always cover a trailer or the belongings inside a coach. Full-timers often need a policy written for people who live in the rig.\n\nI will not quote a premium. An agent who writes RV policies is the person who can bind that. Ask them about liability, the coach itself, and contents.",
  },
  {
    phrases: ["overnight parking", "walmart", "rest area", "sleep in a parking"],
    words: ["walmart", "parking", "rest"],
    summary: "Asked about overnight parking.",
    answer:
      "Some stores used to allow an overnight stay in the lot. Many do not anymore, and a sign at that store wins. Rest areas have their own time limits.\n\nA campground is the dependable plan if you want water, a legal night, and a place to dump in the morning. If you do stay in a lot that allows it, be gone in the morning and leave the space clean.",
  },
  {
    phrases: ["how many people", "sleep", "sleeps", "bunk room", "bunks", "loft"],
    words: ["sleep", "sleeps", "bunk", "bunks", "loft", "bedroom"],
    summary: "Asked about sleeping room.",
    answer:
      "Sleeping spots are the beds, sometimes a dinette that makes into a bed, and on some floorplans a bunk room or a loft. A fifth wheel often puts a bedroom in the raised front. A travel trailer often puts the bed in the back. A motorhome may put a bed over the cab.\n\nWhich one has bunks is a floorplan fact. I will not assign bunks, baths, or a length to a model from memory.",
  },
  {
    phrases: ["smell", "smells", "odor", "stink"],
    words: ["smell", "odor", "stink", "stinks"],
    summary: "Asked about smells.",
    answer:
      "A bad smell is usually the black tank or a dry water trap under a sink. Run a little water in each sink and the shower so the trap stays full. Tank treatment made for RVs, and dumping before the tank is packed solid, keeps the bathroom livable.\n\nIf you smell propane, turn the propane off at the tank, get everyone out, and do not flip switches. That one is not a normal camping smell.",
  },
  {
    phrases: ["rain", "leak", "roof"],
    words: ["rain", "leak", "roof", "wet"],
    summary: "Asked about rain.",
    answer:
      "Rain is normal camping. Close windows that face the storm, and watch the roof vents. Roll the awning in if the wind comes up with the rain.\n\nA leak is a maintenance job, usually a roof seal, a window, or a slide seal. I will not diagnose a leak on a coach I cannot see. If water is coming in on trip one, catch it with a pan and have a shop look at the roof before the next trip.",
  },
  {
    phrases: ["kids", "children", "family camping", "with kids"],
    words: ["kids", "children", "family"],
    summary: "Asked about camping with kids.",
    answer:
      "Families camp in travel trailers, fifth wheels, and motorhomes. Bunks are a floorplan choice, not something every coach has. A travel trailer lets you unhitch and use the truck for ice and groceries. A motorhome means the whole house goes to the store unless you towed a car.\n\nAt the site, agree on a meeting spot, keep kids clear when a slide is moving, and chock the wheels before anyone is climbing in and out.",
  },
  {
    phrases: ["is it hard", "camping hard", "hard to camp", "hard for a beginner", "first time", "never camped", "new to camping", "am i ready"],
    words: ["beginner", "first", "easy", "hard", "nervous"],
    summary: "Asked if camping is hard.",
    answer:
      "The first night feels like a lot because the hose, the cord, the level, and the tanks are all new. By the third trip it is a routine. Pick a full-hookup site close to home for night one so a forgotten hose is a short drive, not a ruined vacation.\n\nA travel trailer is the usual first towable. A Class C is the usual first motorhome. Either one can be a beginner coach. Say which way you are leaning if you want that saved.",
  },
  {
    phrases: ["do i need a truck", "need a truck", "without a truck", "no truck"],
    words: ["truck"],
    summary: "Asked if a truck is required.",
    answer:
      "A motorhome does not need a truck. You drive it. A travel trailer needs a tow vehicle rated for that trailer's weight. A fifth wheel needs a pickup with a hitch in the bed.\n\nIf you do not own a truck yet, a motorhome or a lighter travel trailer behind an SUV you already have are the two paths. The door sticker on that vehicle is what says whether the trailer fits. I did not pick a type for you.",
  },
  {
    phrases: ["etiquette", "quiet hours", "neighbor", "good neighbor"],
    words: ["etiquette", "neighbor", "neighbours", "quiet"],
    summary: "Asked about campground manners.",
    answer:
      "Quiet hours are real, often 10 at night until 7 or 8 in the morning. Generators, music, and a bright porch light are what draw a knock. Walk the dog on a leash and pick up.\n\nSay hello, then give the neighbor their site. Do not cut across a pad, and look before you run a slide out toward their picnic table.",
  },
  {
    phrases: ["maintenance", "take care of", "roof seal", "what breaks"],
    words: ["maintenance", "sealant", "caulk"],
    summary: "Asked about maintenance.",
    answer:
      "The regular jobs are the roof, the tires, the seals, the brakes, and the batteries. A roof wants a look a couple of times a year for cracked sealant. Tires age out on a calendar. Batteries want to stay charged between trips.\n\nI will not quote a service price or invent a repair for a coach I cannot see. A shop that works on that brand is the right next step when something leaks, smells like heat, or will not move.",
  },
  {
    phrases: ["water pump", "pump run", "pump keeps"],
    words: ["pump"],
    summary: "Asked about the water pump.",
    answer:
      "The water pump pushes water from the fresh tank to the faucets. Turn it on when you are using the tank. Turn it off when you are on city water, and any time you leave the coach for the day.\n\nIf the pump runs and never stops, a faucet is open, the tank is empty, or there is a leak. Do not let it run dry for long.",
  },
  {
    phrases: ["steps", "entry step", "stairs"],
    words: ["steps", "stair", "stairs"],
    summary: "Asked about the steps.",
    answer:
      "The entry steps fold in before you move. On a travel trailer or fifth wheel they are part of the door. On a motorhome they often slide out under the door, and some retract when you start the engine.\n\nLook down before you step out. A step left down in a tight site, or a step that did not come out, is a common first-trip bruise.",
  },
];

function wordsIn(text: string) {
  return new Set(text.split(" ").filter((word) => word.length > 2));
}

function inDomain(text: string) {
  return /\b(camp|camps|camping|camper|campsite|campground|rv|rvs|motorhome|motorhomes|trailer|trailers|fifth|towable|hookup|hookups|tank|tanks|propane|generator|toilet|sewer|awning|slide|hitch|boondock|dump|battery|furnace|fridge|shower|pet|dog|kids|bunk|loft|tire|tires|winter|rain|fire|cook|license|bridge|sway|payload|bedroom|bathroom|electric|water|heater|solar|inverter|quiet|neighbor|site|reservation|first|beginner|night|setup|level|jack|hose|valve|paper|smell|wifi|internet|insurance|mountain|speed|passenger|grill|stove|leak|roof|freezer|freeze|antifreeze|chock|stabilizer|kingpin|landing|amp|amps|shore|battery|batteries)\b/.test(
    text,
  );
}

export function answerCampingQuestion(text: string): CampingAnswer | null {
  const seen = wordsIn(text);
  let best: Topic | null = null;
  let bestScore = 0;
  let secondScore = 0;

  for (const topic of TOPICS) {
    let score = 0;
    for (const phrase of topic.phrases) {
      if (text.includes(phrase)) score += 6;
    }
    let hits = 0;
    for (const word of topic.words) {
      if (seen.has(word)) {
        score += 2;
        hits += 1;
      }
    }
    if (hits >= 2) score += 2;
    if (score > bestScore) {
      secondScore = bestScore;
      best = topic;
      bestScore = score;
    } else if (score > secondScore) {
      secondScore = score;
    }
  }

  const confident = bestScore >= 6 || (bestScore >= 4 && inDomain(text) && bestScore > secondScore);
  if (!best || !confident) return null;

  return {
    reply: `${best.answer}\n\nI did not add a type to your list.`,
    suggestions: best.suggestions ?? NEXT,
    summary: best.summary,
  };
}
