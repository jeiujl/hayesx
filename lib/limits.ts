/**
 * Operating limits, read from the checklist data file rather than typed here,
 * so a manual revision changes them in one place. See docs/01 §1.4 principle 6.
 */
import raw from "@/data/preflight-checklist.json";

type Limit = { value: number; fmSection: string };
const L = raw.limitsReference as unknown as Record<string, Limit>;

export const LIMITS = {
  batteryBeforeTakeoff: L.batteryMinimumBeforeTakeoffPercent,
  batteryBeforeLanding: L.batteryMinimumBeforeLandingPercent,
  batteryEmergency: L.batteryEmergencyWarningPercent,
  vne: L.vneKmh,
  cruise: L.recommendedCruiseKmh,
  mtow: L.maximumTakeoffWeightKg,
  maxPilotWeight: L.maximumPilotWeightKg,
  maxRoll: L.maximumRollAngleDeg,
  maxPitch: L.maximumPitchAngleDeg,
  maxAltitudeFt: L.maximumAltitudeAglFt,
  maxFlightMinutes: L.maximumFlightTimeMinutes,
  brsMaxSpeed: L.brsMaxDeploymentSpeedKmh,
  brsMinHeight: L.brsMinDeploymentHeightAglM,
} as const;

/** Rows for the limits table in the Manuals tab. */
export const LIMIT_ROWS: Array<{ label: string; value: string; src: string }> = [
  { label: "Battery before takeoff", value: `≥ ${LIMITS.batteryBeforeTakeoff.value}%`, src: `FM ${LIMITS.batteryBeforeTakeoff.fmSection}` },
  { label: "Battery before landing", value: `≥ ${LIMITS.batteryBeforeLanding.value}%`, src: `FM ${LIMITS.batteryBeforeLanding.fmSection}` },
  { label: "Emergency battery warning", value: `${LIMITS.batteryEmergency.value}%`, src: `FM ${LIMITS.batteryEmergency.fmSection}` },
  { label: "Velocity never exceed", value: `${LIMITS.vne.value} km/h`, src: `FM ${LIMITS.vne.fmSection}` },
  { label: "Recommended cruise", value: `${LIMITS.cruise.value} km/h`, src: `FM ${LIMITS.cruise.fmSection}` },
  { label: "Max takeoff weight", value: `${LIMITS.mtow.value} kg`, src: `FM ${LIMITS.mtow.fmSection}` },
  { label: "Max pilot weight", value: `${LIMITS.maxPilotWeight.value} kg`, src: `FM ${LIMITS.maxPilotWeight.fmSection}` },
  { label: "Max roll angle", value: `${LIMITS.maxRoll.value}°`, src: `FM ${LIMITS.maxRoll.fmSection}` },
  { label: "Max pitch angle", value: `${LIMITS.maxPitch.value}°`, src: `FM ${LIMITS.maxPitch.fmSection}` },
  { label: "Max altitude", value: `${LIMITS.maxAltitudeFt.value.toLocaleString()} ft AGL`, src: `FM ${LIMITS.maxAltitudeFt.fmSection}` },
  { label: "Max flight time", value: `${LIMITS.maxFlightMinutes.value} min`, src: `FM ${LIMITS.maxFlightMinutes.fmSection}` },
  { label: "BRS max deploy speed", value: `${LIMITS.brsMaxSpeed.value} km/h`, src: `FM ${LIMITS.brsMaxSpeed.fmSection}` },
  { label: "BRS min deploy height", value: `${LIMITS.brsMinHeight.value} m AGL`, src: `FM ${LIMITS.brsMinHeight.fmSection}` },
];
