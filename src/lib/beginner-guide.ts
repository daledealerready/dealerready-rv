import { answerCampingQuestion } from "@/lib/camping-topics";
import type { BuyerProfile } from "@/lib/profile";

export type GuideReply = {
  reply: string;
  suggestions: string[];
  rvTypes: string[];
  summary: string;
};

const COMPARE = [
  "Towable or motorized?",
  "How do the tanks work?",
  "What happens the first night?",
  "What can my truck pull?",
];

const AFTER_TOWABLE = [
  "What is a travel trailer?",
  "What is a fifth wheel?",
  "I want a travel trailer",
];
const AFTER_MOTOR = ["What is a Class C?", "What is a Class A?", "I want a Class C"];
const AFTER_CHASSIS = ["Towable or motorized?", "What is a Class C?", "What is a fifth wheel?"];
const AFTER_TOW = ["What is a travel trailer?", "What is a fifth wheel?", "Towable or motorized?"];

function includes(text: string, phrase: string) {
  return text.includes(phrase);
}

function reply(text: string, suggestions: string[], summary: string): GuideReply {
  return { reply: text, suggestions, rvTypes: [], summary };
}

function leaning(label: string): GuideReply {
  return {
    reply: `I saved ${label} as the RV type on your profile on this device. That is the only thing I added. Finish the profile with your budget, timeline, and how a dealer can reach you. Your name and phone stay hidden until a dealer buys the lead.`,
    suggestions: COMPARE,
    rvTypes: [label],
    summary: `Leaning toward a ${label}.`,
  };
}

function isAsking(text: string) {
  return (
    /^(what|whats|how|can|could|which|why|does|do|is|are|will|would|should|when|where|tell me)\b/.test(
      text,
    ) ||
    /\b(what|how much|how many|largest|biggest|smallest|pull|tow|towing|weigh|weight|payload|gvwr|tongue|pin weight|length|how long|cost|price|sleep|sleeps|slide|license|cdl)\b/.test(
      text,
    )
  );
}

function isPicking(text: string) {
  if (isAsking(text)) return false;
  if (
    /^(travel trailer|bumper pull|fifth wheel|5th wheel|fifthwheel|toy hauler|truck camper|pop up|popup|class b|camper van|class c|class a|class a gas|class a diesel|super c|diesel pusher)$/.test(
      text,
    )
  ) {
    return true;
  }
  return /\b(i want|i wanna|we want|leaning|looking for|go with|going with|i choose|i ll take|ill take|decided|prefer)\b/.test(
    text,
  );
}

function matchedType(text: string) {
  if (includes(text, "super c")) return "Super C";
  if (includes(text, "class b") || includes(text, "camper van")) return "Class B";
  if (includes(text, "class c")) return "Class C";
  if (includes(text, "diesel pusher")) return "Class A Diesel";
  if (includes(text, "class a") && includes(text, "diesel")) return "Class A Diesel";
  if (includes(text, "class a") && includes(text, "gas")) return "Class A Gas";
  if (includes(text, "class a")) return "Class A";
  if (includes(text, "fifth wheel") || includes(text, "5th wheel") || includes(text, "fifthwheel")) {
    return "Fifth Wheel";
  }
  if (includes(text, "toy hauler")) return "Toy Hauler";
  if (includes(text, "travel trailer") || includes(text, "bumper pull")) return "Travel Trailer";
  if (includes(text, "truck camper")) return "Truck Camper";
  if (includes(text, "pop up") || includes(text, "popup")) return "Pop-Up";
  return "";
}

function explainType(label: string): GuideReply {
  const explanations: Record<string, string> = {
    "Travel Trailer":
      "A travel trailer, also called a bumper pull, hitches to the back of a truck or SUV. It has no engine. At the campground you unhitch and drive the truck by itself. It is the usual first towable. The truck still has to be rated for that trailer's weight, and the hitch weight has to fit in the truck's payload.",
    "Fifth Wheel":
      "A fifth wheel is a towable that hitches in the bed of a pickup, over the rear axle, instead of on the bumper. The front is raised, and that upstairs area is often a bedroom or a loft. It is usually roomier than a travel trailer and steadier on the highway. The pin weight is often about 15 to 25 percent of the trailer, so the truck needs an open bed and enough payload. A large one usually wants a 2500 or 3500, not a half-ton.",
    "Toy Hauler":
      "A toy hauler is a trailer or motorhome with a garage in the back for a motorcycle, UTV, or other gear. The ramp door is the giveaway. That garage is heavy, so the tow vehicle or the chassis has to be rated for the extra weight.",
    "Truck Camper":
      "A truck camper sits in the bed of a pickup. You do not pull it. The camper's weight, including water and gear, has to fit the truck's payload. It comes off the truck when you want the pickup empty.",
    "Pop-Up":
      "A pop-up is a small, light towable that folds down for the road and opens up at camp. It is easier for a smaller SUV to pull. The tradeoff is canvas or tent ends and less room than a hard-sided trailer.",
    "Class B":
      "A Class B is a camper van. You drive it like a van, and the living area is inside that van. It is the easiest motorhome to park. It has the least room.",
    "Class C":
      "A Class C is a motorhome built on a van or medium-truck cab, usually with a bed over the cab. You drive it. There is no trailer to hitch. It is the usual first motorhome. The cab and chassis come from the truck maker. The house is built on top.",
    "Class A Gas":
      "A gas Class A is the big motorhome with a gasoline engine. It usually costs less to buy than a diesel and is a common choice for shorter trips. You drive the whole house. I will not guess the chassis under one floorplan.",
    "Class A Diesel":
      "A diesel Class A is the big motorhome with a diesel engine, often called a diesel pusher when the engine is in the back. It usually rides heavier, tows more, and costs more to buy and to fuel than a gas Class A. I will not guess the chassis under one floorplan.",
    "Super C":
      "A Super C is a motorhome on a heavier truck chassis than a normal Class C. The cab looks like a medium or heavy truck, and the house is behind it. It is built for people who want a stronger chassis than a van-based Class C.",
    "Class A":
      "A Class A is the big motorhome. Gas models usually cost less and are fine for shorter trips. Diesel models usually ride heavier, tow more, and cost more to buy and to fuel. Tell me gas or diesel if you want that saved. I will not guess which chassis is under a floorplan.",
  };
  const suggestions =
    label === "Class A"
      ? ["Class A gas", "Class A diesel", "What is a chassis?"]
      : COMPARE;
  const closing =
    label === "Class A"
      ? "I did not add a type to your list. Tell me gas or diesel if you want one saved."
      : `I did not add ${label} to your list. Say you want a ${label} if you want it saved on your profile.`;
  return reply(`${explanations[label]}\n\n${closing}`, suggestions, `Asked what a ${label} is.`);
}

function chevy1500Answer(text: string): GuideReply | null {
  const chevy =
    includes(text, "chevy") || includes(text, "chevrolet") || includes(text, "silverado");
  if (!chevy || !includes(text, "1500")) return null;
  const otherYear = /\b20\d{2}\b/.exec(text);
  const yearNote =
    otherYear && otherYear[0] !== "2026"
      ? `You named a ${otherYear[0]}. Tow charts change by year, so do not use the 2026 numbers for that truck. Use the label on its door.`
      : "Those figures are from Chevrolet's 2026 Silverado 1500 chart. Another year can be different. The label on the driver's door of the truck in the driveway is the number that counts.";

  return reply(
    `A Chevy 1500 is a half-ton pickup, the Silverado 1500. There is no single “largest travel trailer” for it. Length is not the limit. Weight is.\n\nChevrolet lists the 2026 Silverado 1500 from about 8,700 pounds of towing up to 13,300 pounds. The 13,300-pound number is one specific truck: Duramax diesel, double cab, standard bed, two-wheel drive, the Max Trailering Package, and 20-inch wheels. A different 1500 can be thousands of pounds less. ${yearNote}\n\nPeople and cargo in the truck reduce what is left for the trailer. A travel trailer usually puts about 10 to 15 percent of its weight on the hitch, and that hitch weight has to fit the truck's payload. A half-ton often runs out of payload before it runs out of the tow number, so a lighter travel trailer is the usual match. A large fifth wheel usually needs a 2500 or 3500.\n\nI did not add a type to your list from this question.`,
    AFTER_TOW,
    "Asked what a Chevy 1500 can pull.",
  );
}

function towAnswer(text: string): GuideReply | null {
  if (/\b(ride|riding|passenger|passengers|fast|speed|mph)\b/.test(text)) return null;
  if (/\b(car|dinghy|toad)\b/.test(text) && /\b(behind|tow|towing)\b/.test(text)) return null;
  const aboutTow =
    /\bpull\b/.test(text) ||
    /\btow\b/.test(text) ||
    /\btowing\b/.test(text) ||
    includes(text, "payload") ||
    includes(text, "tongue") ||
    includes(text, "gvwr") ||
    (includes(text, "largest") && includes(text, "trailer")) ||
    (includes(text, "biggest") && includes(text, "trailer")) ||
    includes(text, "what can my truck");
  if (!aboutTow) return null;

  const specific = chevy1500Answer(text);
  if (specific) return specific;

  return reply(
    "The trailer has to fit the truck, and the truck does not have one number for every cab and engine. The limit is on a label in the driver's door: tow rating and payload. People and gear in the truck come off that payload.\n\nA travel trailer usually puts about 10 to 15 percent of its weight on the hitch. A fifth wheel pin is often about 15 to 25 percent, sitting in the bed. That hitch or pin weight has to fit what the truck can carry.\n\nA half-ton, such as a 1500, is the usual match for a lighter travel trailer. A 2500 is the usual match for a larger fifth wheel. A 3500 is for the heaviest fifth wheels and toy haulers. I will not invent a pound rating for a truck unless I have that year's chart. A 2026 Chevy 1500 is one I can speak to.\n\nI did not add a type to your list from this question.",
    AFTER_TOW,
    "Asked what a truck can pull.",
  );
}

const COMPARE_REPLY = reply(
  "A towable is pulled by a truck or SUV. A motorized RV has its own engine, and you drive it.\n\nA towable usually costs less to buy. You can unhitch at the campsite and use your truck for dinner or groceries. You still take care of the truck, and it has to be rated for the trailer's weight.\n\nA motorhome is one vehicle. There is no hitch to hook up. When you go into town, the whole house comes along unless you tow a car behind it. You buy and maintain the engine and the house together.\n\nA travel trailer is the usual first towable. A Class C is the usual first motorhome. I will save a type only when you say you want that one.",
  [...AFTER_TOWABLE.slice(0, 2), ...AFTER_MOTOR.slice(0, 2)],
  "Asked how a towable compares with a motorhome.",
);

const TOWABLE_REPLY = reply(
  "A towable has no engine. Your truck or SUV pulls it. At the campground you can unhitch and drive the truck by itself. The trailer stays put.\n\nThe tradeoff is the tow vehicle. It needs enough tow rating and payload for that trailer, plus a hitch and trailer brakes. A travel trailer couples at the bumper. A fifth wheel couples in the truck bed and is usually roomier.\n\nAsk me what either one is, or say which one you want and I will save only that.",
  AFTER_TOWABLE,
  "Asked about a towable and has not chosen the type.",
);

const MOTOR_REPLY = reply(
  "A motorized RV is a house with an engine. You get in and drive. Nobody has to hitch a trailer.\n\nA Class B is a camper van. A Class C has a van or truck cab with a bed over the cab. A Class A is the full motorhome, gas or diesel. A Super C is a motorhome on a heavier truck chassis.\n\nThe tradeoff is errands. Unless you tow a car, the whole coach goes to the store. Ask me about a class, or tell me the one you want and I will save only that.",
  AFTER_MOTOR,
  "Asked about a motorhome and has not chosen the class.",
);

export function answerBeginnerQuestion(raw: string): GuideReply {
  const text = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  if (!text || /^(hi|hello|hey|help)$/.test(text)) {
    return reply(
      "Ask me about camping in a motorhome, a fifth wheel, or a travel trailer. Tanks, hookups, the hitch, the campsite, and the first night are all fair. I will not quote a price, invent a floorplan, or guess the chassis under one coach. I save an RV type only when you say you want that one.",
      COMPARE,
      "",
    );
  }

  if (
    includes(text, "chassis") ||
    includes(text, "freightliner") ||
    includes(text, "spartan") ||
    (includes(text, "frame") && !includes(text, "bunk"))
  ) {
    return reply(
      "The chassis is the backbone under the coach. On a motorhome that means the frame, axles, suspension, brakes, and the engine. The living area is built on top of it. The house does not make the coach stop or handle. The chassis does.\n\nA Class C usually starts from a van or medium-truck cab. A Super C uses a heavier truck chassis. A large diesel Class A is often built on a heavy bus-style chassis. A towable has no engine of its own. Its chassis is the frame, axles, and brakes, and your truck is the engine.\n\nI can explain the type. I will not guess the chassis under one exact floorplan. That fact has to come from the builder. I did not add a type to your list.",
      AFTER_CHASSIS,
      "Asked what a chassis is.",
    );
  }

  const towing = towAnswer(text);
  if (towing) return towing;

  if (
    includes(text, "floorplan") ||
    includes(text, "floor plan") ||
    (/\b(20\d{2}|phaeton|tiffin|jayco|entegra|berkshire|discovery|sanibel|winnebago|newmar|airstream)\b/.test(
      text,
    ) &&
      /\b(bunks|floorplan|floor plan|how many slide|sleeps|two bath|2 bath)\b/.test(text))
  ) {
    return reply(
      "I will not invent a floorplan. Two coaches the same length can put the bedroom, the bunks, and the bath in different places. The builder's sheet for that exact model is the source.\n\nI can still explain what a bunk room, a loft, a slide, or a tank is. I did not add a type to your list.",
      ["How do the tanks work?", "What is a slide out?", "What happens the first night?"],
      "Asked for a floorplan.",
    );
  }

  if (
    includes(text, "price") ||
    includes(text, "cost") ||
    includes(text, "how much is") ||
    includes(text, "payment")
  ) {
    return reply(
      "I can't quote a price from here. The same coach changes with the year, the options, and whether it is new or used. A dealer is the one who prices it.\n\nI can explain camping, a towable versus a motorhome, or what a truck can pull. I did not add a type to your list.",
      COMPARE,
      "Asked about price.",
    );
  }

  const saysTotal =
    /\btotal\b/.test(text) &&
    !includes(text, "total cost") &&
    !includes(text, "total price") &&
    !includes(text, "total weight") &&
    !includes(text, "in total");
  const wantsBenefits =
    includes(text, "benefit") ||
    includes(text, "better") ||
    includes(text, "advantage") ||
    includes(text, "pros") ||
    includes(text, "versus") ||
    includes(text, " vs ") ||
    text.endsWith(" vs") ||
    includes(text, "difference") ||
    includes(text, "compare");
  const wantsTowable =
    includes(text, "towable") ||
    saysTotal ||
    includes(text, "trailer") ||
    includes(text, "pull behind") ||
    includes(text, "unhitch");
  const wantsMotor =
    includes(text, "motor") || includes(text, "drive it") || includes(text, "drivable");
  const type = matchedType(text);

  const camping = answerCampingQuestion(text);
  if (camping && !(isPicking(text) && type)) return reply(camping.reply, camping.suggestions, camping.summary);

  if (
    wantsBenefits ||
    (wantsTowable && wantsMotor) ||
    includes(text, "undecided") ||
    includes(text, "not sure") ||
    includes(text, "unsure")
  ) {
    return COMPARE_REPLY;
  }

  if (isAsking(text) && type) return explainType(type);
  if (isAsking(text) && wantsTowable) return TOWABLE_REPLY;
  if (isAsking(text) && wantsMotor) return MOTOR_REPLY;

  if (isPicking(text) && type === "Class A") {
    return reply(
      "A Class A is the big motorhome. Gas models usually cost less and are fine for shorter trips. Diesel models usually ride heavier, tow more, and cost more to buy and to fuel. Tell me gas or diesel and I will save that one. I did not add Class A by itself.",
      ["Class A gas", "Class A diesel", "What is a chassis?"],
      "Asked about a Class A and has not chosen gas or diesel.",
    );
  }
  if (isPicking(text) && type) return leaning(type);

  if (wantsTowable) return TOWABLE_REPLY;
  if (wantsMotor) return MOTOR_REPLY;

  if (includes(text, "lead") || includes(text, "dealer") || includes(text, "profile")) {
    return reply(
      "The guide is free. I save an RV type only when you choose one. Finish the profile with budget, timeline, and contact information. Participating dealers can buy that lead. They see the RV type first. Your name and phone stay hidden until they buy it.",
      COMPARE,
      "",
    );
  }

  return reply(
    "I did not add anything to your list. Ask me about camping in a motorhome, a fifth wheel, or a travel trailer: the tanks, the hookups, the hitch, the campsite, or the first night. I will not quote a price, invent a floorplan, or guess the chassis under one coach. If you already know the type you want, say you want a fifth wheel and I will save only that.",
    COMPARE,
    "",
  );
}

export function applyGuideReply(profile: BuyerProfile, reply: GuideReply): BuyerProfile {
  const picked = reply.rvTypes.length > 0;
  const rvTypes = picked ? reply.rvTypes : profile.rvTypes;
  let guideSummary = profile.guideSummary;
  if (reply.summary) {
    if (picked || !guideSummary.startsWith("Leaning")) {
      guideSummary = reply.summary;
    }
  }
  return { ...profile, rvTypes, guideSummary };
}
