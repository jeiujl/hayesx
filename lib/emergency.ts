/**
 * Flight Manual Chapter 3, Emergency Procedures.
 * Action steps only — the prose is deliberately dropped. Ground reference.
 */
export interface Procedure {
  section: string;
  title: string;
  indication?: string;
  steps: string[];
  followUp?: string[];
  noFurtherFlight?: boolean;
  warning?: string;
}

export const RESPONSE_PRIORITY = [
  "Maintain vehicle control",
  "Select safe landing area",
  "AUTO LAND",
  "RETURN TO HOME (RTH)",
  "Manual landing",
  "BRS deployment",
];

export const PROCEDURES: Procedure[] = [
  {
    section: "3.3",
    title: "Low battery warning",
    indication: "Audible alarm when battery is at or below 35%.",
    steps: [
      "Terminate the current task",
      "Prepare to land",
      "Reduce large scale manoeuvres",
      "Monitor power continuously",
    ],
  },
  {
    section: "3.4",
    title: "Emergency battery warning",
    indication: "Audible alarm when battery is at or below 30%.",
    steps: ["Find the nearest safe place to land", "Perform landing"],
    followUp: ["No further flight allowed"],
    noFurtherFlight: true,
  },
  {
    section: "3.5",
    title: "Single motor failure",
    indication: "A single motor stops working or provides abnormal thrust.",
    steps: [
      "Reduce flight speed",
      "Lower flight altitude",
      "Choose a safe landing area",
      "Land as soon as possible",
    ],
    followUp: ["End of flight", "Do not take off again"],
    noFurtherFlight: true,
  },
  {
    section: "3.6",
    title: "Multiple motor failure",
    indication: "Two or more motors fail.",
    steps: [
      "Determine whether the aircraft is controllable",
      "If under control, land immediately",
      "If it is or becomes uncontrollable, activate BRS immediately",
    ],
  },
  {
    section: "3.7",
    title: "Flight control system failure",
    steps: [
      "Manually operate the joystick to land",
      "Select the nearest safe landing area",
      "Perform the landing",
      "If the aircraft cannot be controlled by joystick, activate the BRS immediately",
    ],
  },
  {
    section: "3.8",
    title: "Control (joystick) stick failure",
    indication: "Aircraft will not respond to joystick controls.",
    steps: [
      "Confirm that the flight control system is normal",
      "Open the virtual PFD joystick interface",
      "Start Virtual Stick Mode",
      "Control the aircraft using the virtual joysticks",
      "Find a safe landing area",
      "Land as soon as possible",
    ],
    followUp: ["No further flight allowed"],
    noFurtherFlight: true,
  },
  {
    section: "3.9",
    title: "GPS signal loss",
    steps: ["Maintain visual flight", "Switch attitude mode"],
  },
  {
    section: "3.10",
    title: "Battery overheating",
    steps: [
      "Reduce power",
      "Terminate mission",
      "Land as soon as possible",
      "Shut down main power after landing",
    ],
  },
  {
    section: "3.11",
    title: "Battery thermal runaway",
    indication: "Smoke, abnormal smell, or a sharp rise in temperature.",
    steps: [
      "Land immediately",
      "Stay away from crowded areas",
      "Evacuate immediately after landing",
      "Do not restart the system",
    ],
  },
  {
    section: "3.12",
    title: "Automatic flight function failure",
    indication:
      "AUTO LAND not working, RTH failure, auto navigation exception, or auto flight interruption.",
    steps: [
      "Switch to manual mode",
      "Keep the aircraft stable",
      "Select the nearest safe area to land",
      "Manually land immediately",
    ],
    followUp: [
      "No further flight allowed",
      "Prohibited from taking off again",
      "Complete system check",
    ],
    noFurtherFlight: true,
    warning: "Do not continue flight missions after a flight function failure.",
  },
  {
    section: "3.13",
    title: "BRS parachute deployment",
    indication:
      "Flight control failure, multiple motor failure, structural damage, or aircraft out of control.",
    steps: [
      "Stop using joystick and/or digital flight controls",
      "Pull the red start parachute handle on the left",
      "Wait for parachute to fully deploy",
      "Brace for landing",
    ],
    followUp: ["Turn off main power", "Evacuate the aircraft"],
    warning: "Once activated, parachute deployment cannot be cancelled.",
  },
  {
    section: "3.14",
    title: "Ditching",
    indication: "The HayesX-250 is not approved for flight over water.",
    steps: [
      "Stay calm and in control",
      "Minimise the speed of descent",
      "Brace for impact with the water",
      "Turn off power immediately after contact with the water surface",
      "Unfasten your seat belt and evacuate",
    ],
  },
  {
    section: "3.15",
    title: "Pilot incapacitation",
    steps: [
      "Maintain a stable aircraft",
      "Assess your own status",
      "Press the PFD automatic landing button to AUTO LAND",
      "Or press the PFD return to home button for RTH",
      "If unable to operate either, activate the BRS",
    ],
  },
  {
    section: "3.16",
    title: "Post hard landing inspection",
    indication:
      "Landing gear damage, structural damage, capsize, blade grounded, parachute deployed, or battery shock.",
    steps: ["Ground the aircraft"],
    followUp: [
      "Flights may resume only after inspection and release by authorised HayesX personnel",
    ],
    noFurtherFlight: true,
  },
];
