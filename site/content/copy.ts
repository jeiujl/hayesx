/**
 * Site copy.
 *
 * Sentences marked `source: "hayesx.net"` are the company's own words, recovered
 * from the live site. Everything else is written for this rebuild and is drawn
 * from the Flight Manual — no claim here is invented.
 */

export const SITE = {
  name: "HayesX",
  title: "eVTOL Ultralight Aircraft for Personal Aviation | HayesX",
  description:
    "The HayesX-250 is a premium ultralight eVTOL aircraft engineered for takeoff straight from your backyard. Eight electric motors, 25 minutes of flight, no runway. Built in the Mojave Desert near Las Vegas.",
  url: "https://hayesx.net",
  locality: "Las Vegas, Nevada",
} as const;

export const NAV = [
  { label: "The aircraft", href: "/#aircraft" },
  { label: "Part 103", href: "/#part103" },
  { label: "Transport", href: "/#transport" },
  { label: "Safety", href: "/#safety" },
  { label: "Tech specifications", href: "/tech-specifications" },
] as const;

export const HERO = {
  eyebrow: "Unveiled at SEMA 2026 · Las Vegas",
  headline: "Take off from your backyard.",
  /** hayesx.net */
  lede: "The HayesX-250 is a premium, best-in-class ultralight eVTOL aircraft engineered for takeoff straight from your backyard.",
  cta: "Reserve an allocation",
  ctaSub: "Limited orders open for 2026 holiday delivery",
  secondary: "Tech specifications",
} as const;

export const SECTIONS = {
  aircraft: {
    eyebrow: "The aircraft",
    heading: "No runway. No taxiway. No airstrip.",
    /** hayesx.net */
    body: "As an electric vertical takeoff and landing (eVTOL) vehicle, the HayesX-250 launches and lands straight up and down, meaning it doesn't need a runway, taxiway, or traditional airstrip.",
    body2:
      "Eight motors turn eight rotors across a four-arm carbon fibre chassis. Lift is distributed, so the aircraft stays controllable in situations that would end a single-engine flight — and an aeronautical aluminium airframe carries the loads a Formula 1 inspired roll cage is built around.",
  },
  part103: {
    eyebrow: "FAA Part 103",
    heading: "Built to the rule, not around it.",
    /** hayesx.net */
    body: "The HayesX-250 is purpose-built as an ultralight aircraft, engineered around the FAA Part 103 category that governs single-occupant recreational flight.",
    body2:
      "Part 103 is what makes personal flight reachable. Under it the HayesX-250 requires no vehicle certification, no airworthiness certificate, and no certification as a conventional aircraft.",
    points: [
      {
        title: "No vehicle certification required",
        body: "The aircraft is designed, built and operated in accordance with FAA Part 103 and CCAR-91-R4 requirements for ultralight vehicles.",
        src: "FM 1.4",
      },
      {
        title: "One seat, daytime, visual flight rules",
        body: "Part 103 governs single-occupant recreational flight. The HayesX-250 is approved for daytime operation under visual meteorological conditions.",
        src: "FM 2.7",
      },
      {
        title: "You still own the airspace rules",
        body: "The pilot complies with all applicable national and local airspace regulations, and obtains clearance before entering controlled airspace.",
        src: "FM 2.7",
      },
    ],
  },
  transport: {
    eyebrow: "Transport",
    heading: "Folds into the bed of a pickup.",
    /** hayesx.net */
    body: "A foldable four-arm chassis lets owners transport their aircraft in the bed of a pickup truck.",
    body2:
      "Folded, the aircraft narrows from 2,450 mm to 1,380 mm across — under four and a half feet. The length and height do not change, because the arms fold inward rather than back.",
  },
  safety: {
    eyebrow: "Safety",
    heading: "Redundancy you can point at.",
    body: "Every critical system on the HayesX-250 has a second answer. These are the ones a pilot can name before they leave the ground.",
    items: [
      {
        title: "Whole-aircraft parachute",
        body: "A GBS 10M ballistic recovery system recovers the entire aircraft, not the pilot alone. The handle sits on the pilot's left, and deployment is possible from as low as 10 m above ground.",
        src: "FM 2.6",
      },
      {
        title: "Two independent battery systems",
        body: "A dual 108 V DC architecture drives the upper and lower rotor sets from separate packs, so one pack cannot take all eight rotors with it.",
        src: "FM 4.4.1",
      },
      {
        title: "Eight rotors, distributed lift",
        body: "With a single motor failure the aircraft remains controllable: reduce speed, lower altitude, choose a landing area and land. There is no autorotation to get right.",
        src: "FM 3.5",
      },
      {
        title: "Roll cage and restraint",
        body: "A Formula 1 inspired roll cage surrounds the pilot, with a restraint harness fastened before every flight.",
        src: "FM 4.1",
      },
      {
        title: "Flight data recorder",
        body: "The flight control system, primary flight display and flight data recorder power up together and self-test before the aircraft is boarded.",
        src: "FM 4.5",
      },
      {
        title: "A preflight that is 57 items long",
        body: "Structure, propellers, motors, batteries, recovery system, high-voltage connectors, initialisation and boarding — performed in sequence, every flight.",
        src: "FM Ch. 4",
      },
    ],
  },
  company: {
    eyebrow: "The company",
    heading: "Built in the Mojave Desert.",
    /** hayesx.net */
    body: "HayesX was founded by aviation experts and lifelong enthusiasts and built in the Mojave Desert near Las Vegas.",
    /** hayesx.net */
    body2:
      "The HayesX-250 belongs to a growing category of eVTOL aircraft designed to bring vertical flight within reach of everyday enthusiasts, not just trained commercial pilots. An electric propulsion system with a battery-powered configuration replaces combustion engines with a quieter, electric powertrain.",
  },
  reserve: {
    eyebrow: "Availability",
    heading: "Limited orders, 2026 holiday delivery.",
    /** hayesx.net */
    body: "HayesX is now taking limited orders for 2026 holiday delivery.",
    cta: "Reserve an allocation",
  },
} as const;

/**
 * Contact routing for the reservation form.
 *
 * TODO(HayesX): replace with the real address before launch. It is the only
 * value on this site that could not be recovered from hayesx.net.
 */
export const CONTACT_EMAIL = "";
