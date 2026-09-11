/**
 * Single source of truth for every number on this site.
 *
 * All figures are taken from HayesX-250 Flight Manual, document
 * HayesX-250-FM-001 Revision A (2026). Each carries its section so any claim on
 * the site can be traced back to the controlling document.
 */

export interface Spec {
  label: string;
  value: string;
  alt?: string;
  src: string;
}

export interface SpecGroup {
  id: string;
  title: string;
  note?: string;
  specs: Spec[];
}

export const AIRCRAFT = {
  model: "HayesX-250",
  manufacturer: "HayesX Inc.",
  location: "Las Vegas, Nevada, United States",
  category: "Single-seat electric vertical takeoff and landing aerial vehicle",
  configuration: "Quadrotor octocopter",
  document: "HayesX-250-FM-001",
  revision: "A",
} as const;

/** Headline figures, used in the hero strip. */
export const HEADLINE = [
  { value: "8", unit: "", label: "Electric motors", src: "FM 1.3" },
  { value: "25", unit: "min", label: "Maximum flight time", src: "FM 1.3" },
  { value: "100", unit: "km/h", label: "Maximum level speed", src: "FM 2.1" },
  { value: "0", unit: "m", label: "Runway required", src: "eVTOL" },
] as const;

export const SPEC_GROUPS: SpecGroup[] = [
  {
    id: "dimensions",
    title: "Dimensions",
    note: "The four-arm chassis folds for transport in a standard pickup bed.",
    specs: [
      { label: "Length", value: "2,650 mm", alt: "8 ft 8 in", src: "FM 1.3" },
      { label: "Width, unfolded", value: "2,450 mm", alt: "8 ft 0 in", src: "FM 1.3" },
      { label: "Width, folded", value: "1,380 mm", alt: "4 ft 6 in", src: "FM 1.3" },
      { label: "Height", value: "1,280 mm", alt: "4 ft 2 in", src: "FM 1.3" },
      { label: "Maximum width", value: "3,170 mm", alt: "10 ft 5 in", src: "FM 1.3" },
      { label: "Propeller diameter", value: "1,447 mm", alt: "57 in", src: "FM 1.3" },
    ],
  },
  {
    id: "weights",
    title: "Weights",
    specs: [
      { label: "Empty weight", value: "≤ 116 kg", alt: "256 lb, excluding rescue system", src: "FM 1.3" },
      { label: "Maximum takeoff weight", value: "216 kg", alt: "476 lb", src: "FM 2.2" },
      { label: "Maximum thrust", value: "380 kg", alt: "838 lbf", src: "FM 1.3" },
      { label: "Maximum pilot weight", value: "100 kg", alt: "220 lb", src: "FM 2.2" },
      { label: "Minimum pilot weight", value: "No restriction", src: "FM 2.2" },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    specs: [
      { label: "Maximum level speed", value: "100 km/h", alt: "62 mph, software limited", src: "FM 2.1" },
      { label: "Recommended cruise", value: "40 km/h", alt: "25 mph", src: "FM 2.1" },
      { label: "Maximum flight time", value: "25 min", src: "FM 1.3" },
      { label: "Hover time", value: "20 min", src: "FM 1.3" },
      { label: "Cruising range", value: "20 km", alt: "12 mi", src: "FM 1.3" },
      { label: "Maximum rate of climb", value: "5 m/s", alt: "984 ft/min", src: "FM 1.3" },
      { label: "Maximum descent rate", value: "4 m/s", alt: "787 ft/min", src: "FM 1.3" },
      { label: "Maximum altitude", value: "1,500 ft AGL", alt: "457 m above ground level", src: "FM 1.3" },
    ],
  },
  {
    id: "powerplant",
    title: "Propulsion & power",
    note: "Two independent high-voltage batteries drive separate rotor sets, so no single pack failure removes all lift.",
    specs: [
      { label: "Motors", value: "8", alt: "Four-axis, eight-rotor distributed electric propulsion", src: "FM 1.3" },
      { label: "Power source", value: "Electric lithium battery", src: "FM 1.3" },
      { label: "Electrical system", value: "Dual 108 V DC", src: "FM 4.4.1" },
      { label: "Power architecture", value: "Battery A → upper rotors, Battery B → lower rotors", src: "Maint. App. B" },
      { label: "Main power connectors", value: "QS12 high-voltage", src: "FM 4.4.1" },
      { label: "Minimum charge before takeoff", value: "95 %", src: "FM 2.5" },
      { label: "Minimum charge before landing", value: "35 %", src: "FM 2.5" },
    ],
  },
  {
    id: "limitations",
    title: "Operating limitations",
    specs: [
      { label: "Maximum roll angle", value: "30°", src: "FM 2.4" },
      { label: "Maximum pitch angle", value: "30°", src: "FM 2.4" },
      { label: "Positive limit load", value: "+2.0 G", src: "FM 2.3" },
      { label: "Negative limit load", value: "−2.0 G", src: "FM 2.3" },
      { label: "Operating temperature", value: "−10 °C to +40 °C", alt: "14 °F to 104 °F", src: "FM 1.3" },
      { label: "Wind resistance", value: "Level 4 – 6", src: "FM 1.3" },
      { label: "Flight rules", value: "VFR, daytime only", src: "FM 2.7" },
    ],
  },
  {
    id: "structure",
    title: "Structure & systems",
    specs: [
      { label: "Airframe", value: "Aeronautical aluminium", src: "FM 1.3" },
      { label: "Rotor arms", value: "Carbon fibre cantilever", src: "FM 1.3" },
      { label: "Occupants", value: "1 pilot", src: "FM 1.2" },
      { label: "Pilot protection", value: "Formula 1 inspired roll cage", src: "FM 4.1" },
      { label: "Recovery system", value: "GBS 10M whole-aircraft parachute", src: "FM 2.6" },
      { label: "Minimum deployment height", value: "10 m AGL", src: "FM 2.6" },
      { label: "Flight data", value: "Flight Data Recorder", src: "FM 4.5" },
      { label: "Display", value: "Primary Flight Display (PFD)", src: "FM 4.5" },
    ],
  },
  {
    id: "regulatory",
    title: "Regulatory",
    note: "Operated as an ultralight vehicle. The pilot remains responsible for compliance with all applicable airspace regulations.",
    specs: [
      { label: "Category", value: "Ultralight vehicle", src: "FM 1.4" },
      { label: "Governing rules", value: "FAA Part 103, CCAR-91-R4", src: "FM 1.4" },
      { label: "Vehicle certification", value: "Not required", src: "FM 1.4" },
      { label: "Airworthiness certificate", value: "Not required", src: "FM 1.4" },
      { label: "Conventional aircraft certification", value: "Not required", src: "FM 1.4" },
    ],
  },
];

/** Geometry for the scale drawings, in millimetres. */
export const GEOMETRY = {
  lengthMm: 2650,
  widthUnfoldedMm: 2450,
  widthFoldedMm: 1380,
  heightMm: 1280,
  propDiameterMm: 1447,
  /** A standard short pickup bed, for the folded-transport comparison. */
  truckBedLengthMm: 1700,
  truckBedWidthMm: 1500,
} as const;
