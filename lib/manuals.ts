/**
 * Manual structure. Chapter and section titles are transcribed from the
 * supplied documents; body text conversion is the E-0 content task in
 * docs/05-sprint-plan.md. Chapter 2 limits and Chapter 3 procedures are
 * already carried in full (lib/limits.ts, lib/emergency.ts).
 */
export interface Chapter {
  number: string;
  title: string;
  sections: string[];
}

export interface Manual {
  slug: string;
  title: string;
  documentNumber: string | null;
  revision: string | null;
  issueDate: string | null;
  languages: string;
  chapters: Chapter[];
}

export const FLIGHT_MANUAL: Manual = {
  slug: "flight",
  title: "Flight Manual",
  documentNumber: "HayesX-250-FM-001",
  revision: "A",
  issueDate: "2026",
  languages: "English",
  chapters: [
    {
      number: "1",
      title: "General Information",
      sections: [
        "1.1 Purpose",
        "1.2 Vehicle Identification",
        "1.3 Vehicle Description",
        "1.4 Regulatory Statement",
      ],
    },
    {
      number: "2",
      title: "Operating Limitations",
      sections: [
        "2.1 Airspeed Limitations",
        "2.2 Weight Limitations",
        "2.3 Load Factor Limits",
        "2.4 Attitude Limitations",
        "2.5 Battery Limitations",
        "2.6 Ballistic Recovery System",
        "2.7 Operating Area Limitations",
      ],
    },
    {
      number: "3",
      title: "Emergency Procedures",
      sections: [
        "3.1 General",
        "3.2 Emergency Response Principles",
        "3.3 Low Battery Warning",
        "3.4 Emergency Battery Warning",
        "3.5 Single Motor Failure",
        "3.6 Multiple Motor Failure",
        "3.7 Flight Control System Failure",
        "3.8 Control Stick Failure",
        "3.9 GPS Signal Loss",
        "3.10 Battery Overtemperature",
        "3.11 Battery Thermal Runaway",
        "3.12 Automatic Flight Function Failure",
        "3.13 Ballistic Recovery System Deployment",
        "3.14 Ditching Procedure",
        "3.15 Pilot Incapacitation",
        "3.16 Post Hard Landing Inspection",
      ],
    },
    {
      number: "4",
      title: "Normal Procedures",
      sections: [
        "4.1 General",
        "4.2 Preflight Preparation",
        "4.3 Preflight Inspection",
        "4.4 Power-Up Procedure",
        "4.5 System Initialization",
        "4.6 Propulsion System Check",
        "4.7 Boarding Procedure",
        "4.8 Shutdown Procedure",
      ],
    },
    {
      number: "5",
      title: "Aircraft Performance",
      sections: [
        "5.1 General",
        "5.2 Basic Performance Data",
        "5.3 Electrical System Performance",
        "5.4 Hover Performance",
        "5.5 Climb Performance",
        "5.6 Cruise Performance",
        "5.7 Battery Endurance",
        "5.8 Range Performance",
        "5.9 Wind Speed Limitations",
        "5.10 Temperature Envelope",
        "5.11 Altitude Range",
        "5.12 Load Factor Limits",
        "5.13 Performance Notes",
      ],
    },
  ],
};

export const MAINTENANCE_MANUAL: Manual = {
  slug: "maintenance",
  title: "Maintenance Manual",
  documentNumber: null,
  revision: null,
  issueDate: null,
  languages: "English / 中文",
  chapters: [
    { number: "1", title: "General", sections: ["Purpose", "Basic Maintenance Principles"] },
    { number: "2", title: "Maintenance Safety", sections: ["High-Voltage System Safety"] },
    { number: "3", title: "Pre-Flight Inspection", sections: ["Airframe Structure", "Carbon-Fiber Rotors"] },
    { number: "4", title: "Motor Maintenance", sections: ["Routine Inspection", "500-Hour Scheduled Inspection"] },
    { number: "5", title: "ECS Maintenance", sections: ["Routine Inspection", "500-Hour Scheduled Inspection"] },
    { number: "6", title: "Carbon-Fiber Rotor Maintenance", sections: ["Inspection Before Each Flight", "500-Hour Scheduled Inspection"] },
    {
      number: "7",
      title: "High-Voltage Propulsion Battery Maintenance",
      sections: [
        "Pre-Flight Inspection",
        "400-Cycle Scheduled Inspection",
        "800-Cycle Performance Inspection",
        "Battery Cycle Definition",
      ],
    },
    { number: "8", title: "Electrical Wiring Maintenance", sections: ["Signal Wiring", "Main Power Wiring"] },
    { number: "9", title: "Flight Control System Maintenance", sections: [] },
    { number: "10", title: "Whole-Aircraft Emergency Parachute Maintenance", sections: [] },
    { number: "11", title: "Seat and Occupant Protection System", sections: [] },
    { number: "12", title: "Scheduled Maintenance Program", sections: ["Per flight · 10 h · 50 h · 100 h · 400 cycles · 500 h · 800 cycles"] },
    {
      number: "13",
      title: "Life-Limited Parts and Mandatory Replacement Items",
      sections: [
        "GPS Mount Base — 2 years",
        "Differential GNSS Antenna Mount Base — 2 years",
        "GBS 10 Rescue Parachute System — approx. 7 activations",
        "GBS 10 Pyroactuator — 5 years or 100 flight hours",
        "GBS 10 Container — inspect each time",
      ],
    },
    { number: "14", title: "Long-Term Storage", sections: [] },
    { number: "15", title: "Maintenance Records", sections: [] },
    { number: "16", title: "Return to Service", sections: [] },
    { number: "A", title: "Appendix A — Principal Maintenance Intervals", sections: ["Rotors, motors and ECS — 500 flight hours"] },
    { number: "B", title: "Appendix B — Current Configuration Data", sections: [] },
  ],
};

export const MANUALS = [FLIGHT_MANUAL, MAINTENANCE_MANUAL];
