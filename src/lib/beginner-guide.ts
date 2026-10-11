import type { BuyerProfile } from "@/lib/profile";

export type GuideReply = {
  reply: string;
  suggestions: string[];
  rvTypes: string[];
  summary: string;
};

const COMPARE = [
  "Towable or motorized?",
  "Benefits of each",
  "What is a chassis?",
];

const AFTER_TOWABLE = ["Travel trailer", "Fifth wheel", "Tell me about motorized"];
const AFTER_MOTOR = ["Class C", "Class A", "Super C", "Tell me about towable"];
const AFTER_CHASSIS = ["Towable or motorized?", "Class C", "Fifth wheel"];

function includes(text: string, phrase: string) {
  return text.includes(phrase);
}

function leaning(label: string): GuideReply {
  return {
    reply: `I saved ${label} on your profile on this device. Finish the profile with your budget, timeline, and how a dealer can reach you. That is what turns a newcomer into a lead a dealer can buy. Your name and phone stay hidden until a dealer buys the lead.`,
    suggestions: COMPARE,
    rvTypes: [label],
    summary: `Leaning toward a ${label}.`,
  };
}

export function answerBeginnerQuestion(raw: string): GuideReply {
  const text = raw.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  if (!text || /^(hi|hello|hey|help)$/.test(text)) {
    return {
      reply:
        "Ask me anything a newcomer would ask. I can explain a towable versus a motorhome, the benefit of each, and what a chassis is. When you pick a direction, I save it on your buyer profile.",
      suggestions: COMPARE,
      rvTypes: [],
      summary: "",
    };
  }

  if (
    includes(text, "chassis") ||
    includes(text, "frame") ||
    includes(text, "freightliner") ||
    includes(text, "spartan")
  ) {
    return {
      reply:
        "The chassis is the backbone under the coach. On a motorhome that means the frame, axles, suspension, brakes, and the engine. The living area is built on top of it. The house does not make the coach stop or handle. The chassis does.\n\nA Class C usually starts from a van or medium-truck cab. A Super C uses a heavier truck chassis. A large diesel Class A is often built on a heavy bus-style chassis. A towable has no engine of its own. Its chassis is the frame, axles, and brakes, and your truck is the engine.\n\nI can explain the type. I will not guess the chassis under one exact floorplan. That fact has to come from the builder.",
      suggestions: AFTER_CHASSIS,
      rvTypes: [],
      summary: "Asked what a chassis is.",
    };
  }

  if (includes(text, "super c")) return leaning("Super C");
  if (includes(text, "class b") || includes(text, "camper van")) return leaning("Class B");
  if (includes(text, "class c")) return leaning("Class C");
  if (includes(text, "class a") && includes(text, "diesel")) return leaning("Class A Diesel");
  if (includes(text, "class a") && includes(text, "gas")) return leaning("Class A Gas");
  if (includes(text, "diesel pusher")) return leaning("Class A Diesel");
  if (includes(text, "fifth wheel") || includes(text, "5th wheel") || includes(text, "fifthwheel")) {
    return leaning("Fifth Wheel");
  }
  if (includes(text, "toy hauler")) return leaning("Toy Hauler");
  if (includes(text, "travel trailer") || includes(text, "bumper pull")) return leaning("Travel Trailer");
  if (includes(text, "truck camper")) return leaning("Truck Camper");
  if (includes(text, "pop up") || includes(text, "popup")) return leaning("Pop-Up");

  if (includes(text, "class a")) {
    return {
      reply:
        "A Class A is the big motorhome. Gas models usually cost less and are fine for shorter trips. Diesel models usually ride heavier, tow more, and cost more to buy and to fuel. I will not guess which chassis is under a floorplan. Tell me gas or diesel and I will save that lean on your profile.",
      suggestions: ["Class A gas", "Class A diesel", "What is a chassis?"],
      rvTypes: [],
      summary: "Asked about a Class A and has not chosen gas or diesel.",
    };
  }

  const saysTotal =
    /\btotal\b/.test(text) &&
    !includes(text, "total cost") &&
    !includes(text, "total price") &&
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
    includes(text, "motor") ||
    includes(text, "drive it") ||
    includes(text, "drivable");

  if (wantsBenefits || (wantsTowable && wantsMotor) || includes(text, "undecided") || includes(text, "not sure") || includes(text, "unsure")) {
    return {
      reply:
        "A towable is pulled by a truck or SUV. A motorized RV has its own engine, and you drive it.\n\nA towable usually costs less to buy. You can unhitch at the campsite and use your truck for dinner or groceries. You still take care of the truck, and it has to be rated for the trailer's weight.\n\nA motorhome is one vehicle. There is no hitch to hook up. When you go into town, the whole house comes along unless you tow a car behind it. You buy and maintain the engine and the house together.\n\nA travel trailer is the usual first towable. A Class C is the usual first motorhome. Tell me which way you are leaning and I will save it on your profile.",
      suggestions: [...AFTER_TOWABLE.slice(0, 2), ...AFTER_MOTOR.slice(0, 2)],
      rvTypes: [],
      summary: "Asked how a towable compares with a motorhome.",
    };
  }

  if (wantsTowable) {
    return {
      reply:
        "A towable has no engine. Your truck or SUV pulls it. At the campground you can unhitch and drive the truck by itself. The trailer stays put.\n\nThe tradeoff is the tow vehicle. It needs enough power and payload for that trailer, plus a hitch and trailer brakes. A travel trailer couples at the bumper. A fifth wheel couples in the truck bed and is usually roomier.\n\nTell me travel trailer or fifth wheel and I will save it.",
      suggestions: AFTER_TOWABLE,
      rvTypes: [],
      summary: "Asked about a towable and has not chosen the type.",
    };
  }

  if (wantsMotor) {
    return {
      reply:
        "A motorized RV is a house with an engine. You get in and drive. Nobody has to hitch a trailer.\n\nA Class B is a camper van. A Class C has a van or truck cab with a bed over the cab. A Class A is the full motorhome, gas or diesel. A Super C is a motorhome on a heavier truck chassis.\n\nThe tradeoff is errands. Unless you tow a car, the whole coach goes to the store. Tell me the class you want and I will save it.",
      suggestions: AFTER_MOTOR,
      rvTypes: [],
      summary: "Asked about a motorhome and has not chosen the class.",
    };
  }

  if (includes(text, "lead") || includes(text, "dealer") || includes(text, "profile")) {
    return {
      reply:
        "The guide is free. When you choose a type, that choice is saved on your profile on this device. Finish the profile with budget, timeline, and contact information. Participating dealers can buy that lead. They see the RV type first. Your name and phone stay hidden until they buy it.",
      suggestions: COMPARE,
      rvTypes: [],
      summary: "",
    };
  }

  return {
    reply:
      "I can answer a beginner question: towable versus motorized, the benefit of each, or what a chassis is. Ask one of those, or tell me the type you are leaning toward.",
    suggestions: COMPARE,
    rvTypes: [],
    summary: "",
  };
}

export function applyGuideReply(profile: BuyerProfile, reply: GuideReply): BuyerProfile {
  const added = reply.rvTypes.filter((type) => !profile.rvTypes.includes(type));
  const rvTypes = added.length
    ? [...profile.rvTypes.filter((type) => type !== "Not sure"), ...added]
    : profile.rvTypes;
  const picked = reply.rvTypes.length > 0;
  let guideSummary = profile.guideSummary;
  if (reply.summary) {
    if (picked || !guideSummary.startsWith("Leaning")) {
      guideSummary = reply.summary;
    }
  }
  return { ...profile, rvTypes, guideSummary };
}
