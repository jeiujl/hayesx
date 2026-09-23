/**
 * HayesX-250 Ultralight Aircraft Maintenance Manual. English text transcribed
 * from the bilingual source document for in-app reading.
 */

export const MAINTENANCE_MANUAL = {
  id: 'maintenance',
  title: 'Maintenance Manual',
  short: 'Maintenance Manual',
  docNo: 'HayesX-250 Maintenance Manual',
  revision: null,
  issued: '2026',
  preparedBy: 'HayesX',
  chapters: [
    {
      id: '1',
      title: 'General',
      sections: [
        {
          id: '1.1',
          title: 'Purpose',
          blocks: [
            {
              t: 'p',
              text: 'This manual specifies the requirements for daily inspection, pre-flight inspection, post-flight inspection, scheduled maintenance, troubleshooting, component replacement, and long-term storage of the HayesX-250 ultralight aircraft.',
            },
            { t: 'p', text: 'This manual is applicable to pilots, ground support personnel, and authorized maintenance personnel.' },
          ],
        },
        {
          id: '1.2',
          title: 'Basic Maintenance Principles',
          blocks: [
            {
              t: 'p',
              text: 'The HayesX-250 adopts a modular distributed electric propulsion system. The principal maintenance items include:',
            },
            {
              t: 'ul',
              items: [
                'Primary airframe structure',
                'Carbon-fiber rotors',
                'Motors',
                'ECS units',
                'High-voltage battery packs',
                'High-voltage power distribution system',
                'Flight control system',
                'Signal and power wiring',
                'Whole-aircraft emergency parachute system',
                'Seat and occupant protection system',
              ],
            },
            {
              t: 'p',
              text: 'All maintenance activities shall be performed in accordance with this manual, applicable component maintenance documentation, and approved technical change documentation.',
            },
          ],
        },
      ],
    },
    {
      id: '2',
      title: 'Maintenance Safety',
      sections: [
        {
          id: '2.1',
          title: 'High-Voltage System Safety',
          blocks: [
            { t: 'p', text: 'The HayesX-250 is equipped with a dual high-voltage propulsion battery system.' },
            { t: 'p', text: 'Before maintenance of the high-voltage system:' },
            {
              t: 'ol',
              items: [
                'Switch off the aircraft main power.',
                'Disconnect the high-voltage propulsion batteries.',
                'Verify that the high-voltage system has been discharged and electrically isolated.',
                'Verify the absence of hazardous voltage using appropriate test equipment.',
                'High-voltage system maintenance shall only be performed by authorized personnel.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: '3',
      title: 'Pre-Flight Inspection',
      sections: [
        {
          id: '3.1',
          title: 'Airframe Structure',
          blocks: [
            { t: 'p', text: 'Inspect the following:' },
            {
              t: 'ul',
              items: [
                'Check the primary fuselage structure for cracks.',
                'Check carbon-fiber structures for delamination, impact damage, or significant scratches.',
                'Check primary structural attachment points for looseness.',
                'Check rotor arms for deformation.',
                'Check the folding and locking mechanisms for proper operation.',
              ],
            },
            {
              t: 'img',
              src: '/img/torque-seal.webp',
              alt: 'Close-up of a structural joint with red torque-seal paint across the fastener',
              caption: 'Torque-seal paint marks on a structural joint',
              w: 900,
              h: 674,
            },
            { t: 'callout', tone: 'warning', title: 'No flight', text: 'If any condition affecting structural integrity is found, flight shall not be permitted.' },
          ],
        },
        {
          id: '3.2',
          title: 'Carbon-Fiber Rotors',
          blocks: [
            { t: 'p', text: 'Before every flight, inspect:' },
            {
              t: 'ul',
              items: ['Cracks', 'Nicks', 'Delamination', 'Deformation', 'Foreign-object impact marks', 'Installation looseness', 'Rotor-to-motor attachment condition'],
            },
            {
              t: 'callout',
              tone: 'warning',
              title: 'Do not use',
              text: 'A rotor shall not be used if cracks, significant delamination, structural damage, or deformation is detected.',
            },
          ],
        },
      ],
    },
    {
      id: '4',
      title: 'Motor Maintenance',
      sections: [
        {
          id: '4.1',
          title: 'Routine Inspection',
          blocks: [
            { t: 'p', text: 'Before flight, inspect each motor for:' },
            {
              t: 'ul',
              items: [
                'Loose mounting bolts',
                'Abnormal noise',
                'Abnormal vibration',
                'Abnormal rotational resistance',
                'Abnormal temperature',
                'Damage to power cables or connectors',
              ],
            },
          ],
        },
        {
          id: '4.2',
          title: '500-Hour Scheduled Inspection',
          blocks: [
            { t: 'callout', tone: 'note', title: 'Interval', text: 'Prescribed motor inspection interval: 500 flight hours.' },
            { t: 'p', text: 'At 500 flight hours, all motors shall undergo scheduled inspection. Inspection shall include:' },
            {
              t: 'ol',
              items: [
                'Visual inspection of motor housing and external condition.',
                'Inspection of motor shaft and bearing condition.',
                'Inspection of motor mounting interfaces.',
                'Check of rotational resistance.',
                'Check for abnormal vibration and noise.',
                'Inspection of electrical connections and insulation condition.',
                'Operational temperature-rise inspection.',
                'Review of motor operating parameters and recorded operating data.',
              ],
            },
            {
              t: 'p',
              text: 'If abnormal bearing condition, excessive vibration, overheating, insulation abnormality, or structural damage is detected, the motor shall be removed from service and maintained in accordance with the applicable maintenance procedure.',
            },
          ],
        },
      ],
    },
    {
      id: '5',
      title: 'ECS Maintenance',
      sections: [
        {
          id: '5.1',
          title: 'Routine Inspection',
          blocks: [
            { t: 'p', text: 'Inspect:' },
            {
              t: 'ul',
              items: [
                'ECS external condition',
                'Power connections',
                'Motor connections',
                'Control signal connections',
                'Cooling condition',
                'Evidence of overheating, burning, or abnormal odor',
                'Fault records',
              ],
            },
          ],
        },
        {
          id: '5.2',
          title: '500-Hour Scheduled Inspection',
          blocks: [
            { t: 'callout', tone: 'note', title: 'Interval', text: 'Prescribed ECS inspection interval: 500 flight hours.' },
            { t: 'p', text: 'The 500-hour inspection shall include:' },
            {
              t: 'ul',
              items: [
                'Visual and structural inspection',
                'Power connector inspection',
                'Signal connector inspection',
                'Wiring and terminal inspection',
                'Cooling system inspection',
                'Operating temperature and temperature-rise inspection',
                'Fault-log inspection',
                'Motor-control response inspection',
                'Electrical parameter inspection',
              ],
            },
            {
              t: 'p',
              text: 'If overheating, abnormal alarms, abnormal power output, connector burning, or other abnormalities are found, a detailed inspection shall be performed.',
            },
          ],
        },
      ],
    },
    {
      id: '6',
      title: 'Carbon-Fiber Rotor Maintenance',
      sections: [
        {
          id: '6.1',
          title: 'Inspection Before Each Flight',
          blocks: [
            { t: 'p', text: 'Each rotor shall receive a visual inspection. Particular attention shall be given to:' },
            {
              t: 'ul',
              items: ['Leading edge', 'Trailing edge', 'Blade tip', 'Blade root', 'Surface delamination', 'Cracks', 'Impact damage', 'Mounting holes and attachment areas'],
            },
          ],
        },
        {
          id: '6.2',
          title: '500-Hour Scheduled Inspection',
          blocks: [
            { t: 'callout', tone: 'note', title: 'Interval', text: 'Prescribed carbon-fiber rotor inspection interval: 500 flight hours.' },
            { t: 'p', text: 'The 500-hour inspection shall include:' },
            {
              t: 'ul',
              items: [
                'Overall visual inspection',
                'Blade crack inspection',
                'Carbon-fiber delamination inspection',
                'Blade-root attachment inspection',
                'Inspection of mounting holes and fasteners',
                'Rotor balance inspection',
                'Non-destructive inspection when required',
              ],
            },
            {
              t: 'p',
              text: 'Any defect affecting structural integrity or dynamic balance shall be handled in accordance with the applicable maintenance procedure.',
            },
          ],
        },
      ],
    },
    {
      id: '7',
      title: 'High-Voltage Propulsion Battery Maintenance',
      sections: [
        {
          id: '7.1',
          title: 'Propulsion Power Architecture',
          blocks: [
            {
              t: 'p',
              text: 'The HayesX-250 uses a dual high-voltage propulsion battery system. The two battery packs independently supply power to the upper and lower rotor propulsion systems.',
            },
            {
              t: 'table',
              head: ['Power path', 'Feeds'],
              rows: [
                ['Battery A → ECS', 'Upper rotors'],
                ['Battery B → ECS', 'Lower rotors'],
              ],
            },
            { t: 'p', text: 'The two propulsion battery packs have independent power supply paths and protection functions.' },
          ],
        },
        {
          id: '7.2',
          title: 'Pre-Flight Inspection',
          blocks: [
            { t: 'p', text: 'Before each flight, inspect:' },
            {
              t: 'ul',
              items: ['Battery enclosure', 'Battery connectors', 'Battery voltage', 'SOC (state of charge)', 'Battery temperature', 'Battery installation and locking condition'],
            },
            {
              t: 'callout',
              tone: 'warning',
              title: 'Do not use the battery if you observe',
              lines: [
                'Significant enclosure deformation',
                'Swelling',
                'Cracks or physical damage',
                'Electrolyte leakage',
                'Abnormal heating',
                'Significant capacity degradation',
              ],
            },
          ],
        },
        {
          id: '7.3',
          title: '400-Cycle Scheduled Inspection',
          blocks: [
            {
              t: 'callout',
              tone: 'note',
              title: 'Interval',
              text: 'Prescribed propulsion battery inspection interval: every 400 complete charge-discharge cycles.',
            },
            { t: 'p', text: 'Upon reaching 400 complete charge-discharge cycles, the propulsion battery shall undergo a scheduled inspection, including:' },
            {
              t: 'ul',
              items: [
                'Visual and structural integrity inspection',
                'Inspection of battery connectors and high-voltage interfaces',
                'BMS operational status and fault-log review',
                'Cell voltage consistency inspection',
                'Battery temperature and temperature consistency inspection',
                'Review of charge and discharge data',
                'Battery internal resistance or equivalent resistance assessment',
                'Battery capacity condition assessment',
              ],
            },
            { t: 'p', text: 'The inspection results shall be recorded in the propulsion battery maintenance records.' },
          ],
        },
        {
          id: '7.4',
          title: '800-Cycle Performance Inspection',
          blocks: [
            { t: 'callout', tone: 'note', title: 'Interval', text: 'A dedicated battery performance inspection shall be performed after 800 complete charge-discharge cycles.' },
            {
              t: 'p',
              text: 'The purpose of the 800-cycle performance inspection is to determine whether the propulsion battery continues to meet the required capacity, power output, and safety performance requirements for aircraft operation.',
            },
            { t: 'p', text: 'The performance inspection shall include:' },
            {
              t: 'ul',
              items: [
                'Actual capacity test',
                'Maximum continuous discharge capability',
                'Cell voltage consistency',
                'Internal resistance assessment',
                'Temperature-rise characteristics',
                'BMS protection-function check',
                'Charging-function check',
                'Discharge-function check',
                'Fault-history analysis',
              ],
            },
            { t: 'p', text: 'Based on the inspection results, the battery shall be classified as:' },
            {
              t: 'table',
              head: ['Category', 'Status', 'Criteria'],
              rows: [
                ['A', 'Continue in Service', 'Battery capacity, power output, resistance, temperature rise, and BMS condition meet the applicable design requirements.'],
                [
                  'B',
                  'Restricted Service',
                  'The battery remains serviceable but shows significant degradation. Its operating limitations or subsequent inspection interval shall be adjusted based on technical assessment.',
                ],
                ['C', 'Remove from Service', 'The battery presents a safety risk or no longer meets the requirements for aircraft operation.'],
              ],
            },
          ],
        },
        {
          id: '7.5',
          title: 'Battery Cycle Definition',
          blocks: [
            {
              t: 'callout',
              tone: 'note',
              title: 'Definition',
              text: 'A cumulative discharge equivalent to 100% of the rated battery capacity shall be counted as one complete cycle.',
            },
            {
              t: 'p',
              text: 'For example, using the battery from 100% SOC to 50% SOC and then recharging to 100% corresponds to approximately 0.5 cycle. Two such operating cycles correspond to approximately one complete cycle.',
            },
          ],
        },
      ],
    },
    {
      id: '8',
      title: 'Electrical Wiring Maintenance',
      sections: [
        {
          id: '8.1',
          title: 'Signal Wiring',
          blocks: [
            { t: 'p', text: 'HayesX-250 signal-control wiring uses PTFE-insulated, silver-plated, shielded aerospace wire.' },
            {
              t: 'kv',
              rows: [
                ['Conductors', '4 × 0.35 mm²'],
                ['Outer diameter', '4.1 mm'],
                ['Temperature range', '−90 °C to +260 °C'],
              ],
            },
            { t: 'p', text: 'Inspect:' },
            { t: 'ul', items: ['Insulation', 'Shielding', 'Connectors', 'Attachment points', 'Chafing and crushing damage'] },
          ],
        },
        {
          id: '8.2',
          title: 'Main Power Wiring',
          blocks: [
            { t: 'p', text: 'Main power wiring uses 8 AWG / approximately 6 mm² silicone-insulated cable.' },
            {
              t: 'kv',
              rows: [
                ['Continuous current rating', '50 A'],
                ['Temperature range', '−60 °C to +200 °C'],
              ],
            },
            { t: 'p', text: 'Particular attention shall be given to:' },
            {
              t: 'ul',
              items: ['Insulation burning or thermal damage', 'Cable abrasion', 'Terminals', 'Evidence of connector overheating', 'Wiring attachment condition'],
            },
          ],
        },
      ],
    },
    {
      id: '9',
      title: 'Flight Control System Maintenance',
      sections: [
        {
          id: '9.1',
          title: 'Software Configuration',
          blocks: [
            { t: 'kv', rows: [['Current flight-control software', 'V9 81.11.0']] },
            { t: 'p', text: 'The flight-control software version shall be controlled as part of the aircraft configuration management system.' },
            {
              t: 'callout',
              tone: 'caution',
              title: 'Configuration control',
              text: 'Maintenance personnel shall not modify flight-control parameters or install unapproved software versions without authorization.',
            },
          ],
        },
        {
          id: '9.2',
          title: 'After Major Maintenance',
          blocks: [
            { t: 'p', text: 'After major maintenance, the following shall be performed:' },
            {
              t: 'ul',
              items: ['Flight-control self-test', 'Sensor check', 'Motor-control check', 'Ground propulsion-system check', 'Functional flight verification when required'],
            },
          ],
        },
      ],
    },
    {
      id: '10',
      title: 'Whole-Aircraft Emergency Parachute Maintenance',
      sections: [
        {
          id: '10.1',
          title: 'Inspection',
          blocks: [
            { t: 'p', text: 'The whole-aircraft emergency parachute system is a critical safety system.' },
            { t: 'p', text: 'Maintenance shall also comply with the applicable parachute-system manufacturer’s maintenance documentation.' },
            { t: 'p', text: 'Inspect:' },
            {
              t: 'ul',
              items: ['Parachute system service life', 'Deployment/release mechanism', 'Activation handle', 'Suspension/attachment straps', 'Mounting structure', 'Safety/arming status'],
            },
            { t: 'callout', tone: 'warning', title: 'Prohibited', text: 'Unauthorized disassembly, repacking, or modification of the emergency parachute system is prohibited.' },
          ],
        },
      ],
    },
    {
      id: '11',
      title: 'Seat and Occupant Protection System',
      sections: [
        {
          id: '11.1',
          title: 'Seat',
          blocks: [
            {
              t: 'p',
              text: 'The HayesX-250 uses a T300/T700 all-carbon-fiber semi-enclosed seat. The seat is attached on both sides to the main fuselage structural side beams.',
            },
            { t: 'kv', rows: [['Maximum design occupant weight', '100 kg']] },
            { t: 'p', text: 'Before each flight, inspect:' },
            { t: 'ul', items: ['Seat structure', 'Seat attachment points', 'Fasteners', 'Restraint system'] },
            {
              t: 'callout',
              tone: 'caution',
              title: 'Remove from service',
              text: 'If carbon-fiber cracking, delamination, or abnormality at attachment areas is found, the seat shall be removed from service pending detailed inspection.',
            },
          ],
        },
      ],
    },
    {
      id: '12',
      title: 'Scheduled Maintenance Program',
      sections: [
        {
          id: '12.1',
          title: 'Program',
          blocks: [
            {
              t: 'table',
              head: ['Item', 'Each flight', '10 h', '50 h', '100 h', '400 cycles', '500 h', '800 cycles'],
              rows: [
                ['Airframe', '●', '●', '●', '●', '—', '●', '—'],
                ['CF Rotors', '●', '●', '●', '●', '—', 'Scheduled insp.', '—'],
                ['Motors', '●', '—', '●', '●', '—', 'Scheduled insp.', '—'],
                ['ECS', '●', '—', '●', '●', '—', 'Scheduled insp.', '—'],
                ['Propulsion Battery', '●', '●', '●', '●', 'Scheduled insp.', '—', 'Performance insp.'],
                ['Power Wiring', '●', '●', '●', '●', '—', '●', '—'],
                ['Signal Wiring', '●', '●', '●', '●', '—', '●', '—'],
                ['Flight Control', '●', '—', '●', '●', '—', '●', '—'],
                ['Seat', '●', '●', '●', '●', '—', '●', '—'],
                ['Emergency Parachute', 'Per manufacturer requirements', '', '', '', '', '', ''],
              ],
            },
            {
              t: 'callout',
              tone: 'note',
              title: 'Note',
              text: 'The 500-hour inspection interval is the current prescribed maintenance interval for the HayesX-250. If subsequent testing, life assessment, or manufacturer technical instructions require a shorter interval, the latest controlled documentation shall take precedence.',
            },
          ],
        },
      ],
    },
    {
      id: '13',
      title: 'Life-Limited Parts and Mandatory Replacement Items',
      sections: [
        {
          id: '13.1',
          title: 'General',
          blocks: [
            {
              t: 'p',
              text: 'Certain safety-critical components of the HayesX-250 are subject to defined service lives, activation limits, or maintenance intervals. Such components shall be inspected, replaced, or maintained in accordance with the manufacturer’s technical documentation, this Maintenance Manual, and the specified maintenance intervals.',
            },
            {
              t: 'p',
              text: 'Where a component is subject to multiple life limits, including calendar time, flight hours, or activation cycles, the applicable limit reached first shall apply.',
            },
          ],
        },
        {
          id: '13.2',
          title: 'Life-Limited Parts List',
          blocks: [
            {
              t: 'table',
              head: ['#', 'Component', 'Life or maintenance limit', 'Requirement'],
              rows: [
                ['1', 'GPS Mount Base', '2 years', 'Mandatory replacement'],
                ['2', 'Differential GNSS Antenna Mount Base', '2 years', 'Mandatory replacement'],
                ['3', 'GBS 10 Rescue Parachute System', 'Approximately 7 activations (design and test basis)', 'Maintain per manufacturer manual'],
                ['4', 'GBS 10 Pyroactuator', '5 years or 100 flight hours, whichever occurs first', 'Replace upon limit'],
                ['5', 'GBS 10 Container', 'Per system maintenance requirements', 'Inspect each time; do not use if deformed'],
              ],
            },
          ],
        },
        {
          id: '13.3',
          title: 'GBS 10 Rescue Parachute System',
          blocks: [
            { t: 'p', text: 'The HayesX-250 is equipped with the GBS 10 whole-aircraft rescue parachute system as an emergency safety device.' },
            { t: 'p', text: 'The GBS 10 system is designed and tested for approximately 7 activations.' },
            {
              t: 'p',
              text: 'This activation number represents the system design and test basis and shall not be interpreted, without confirmation from the manufacturer, as an automatic mandatory retirement of every system after the seventh activation.',
            },
            {
              t: 'p',
              text: 'The rescue parachute system shall be installed, inspected, maintained, and operated strictly in accordance with the manufacturer’s operating and maintenance manual.',
            },
          ],
        },
        {
          id: '13.4',
          title: 'GBS 10 Container Inspection',
          blocks: [
            {
              t: 'p',
              text: 'The GBS 10 container is a critical component of the rescue system. Correct installation of the container is essential for proper operation of the rescue system.',
            },
            { t: 'p', text: 'Maintenance personnel shall pay particular attention to:' },
            {
              t: 'ul',
              items: ['Container deformation', 'Cracks', 'Impact damage', 'Correct installation position', 'Loose attachment hardware', 'Interference between the container and surrounding structures'],
            },
            { t: 'callout', tone: 'caution', title: 'Special requirement', text: 'The GBS 10 container shall not exhibit deformation that could affect proper system operation.' },
            {
              t: 'p',
              text: 'If container deformation, significant impact damage, or any other structural condition that could affect rescue-system operation is detected, the rescue system shall be removed from service pending inspection and disposition by authorized personnel in accordance with the GBS 10 manufacturer’s maintenance documentation.',
            },
          ],
        },
        {
          id: '13.5',
          title: 'GBS 10 Pyroactuator',
          blocks: [
            {
              t: 'p',
              text: 'The GBS 10 Pyroactuator is used to initiate the rescue-system deployment sequence and is considered a safety-critical component.',
            },
            {
              t: 'p',
              text: 'According to the manufacturer’s information, the Pyroactuator generally has a long service life and may have a general lifespan of at least 15 years. It is qualified in accordance with applicable automotive specifications and test programs, including AKL-LV16 and USCAR-28.',
            },
            { t: 'kv', rows: [['Manufacturer warranty period for HayesX-250', '5 years or 100 flight hours, whichever occurs first']] },
            { t: 'p', text: 'Upon reaching either limit, the Pyroactuator shall be replaced in accordance with the manufacturer’s maintenance requirements.' },
            {
              t: 'callout',
              tone: 'note',
              title: 'Maintenance note',
              text: '“At least 15 years” is general lifespan information for the Pyroactuator and does not replace the 5-year limit used in actual HayesX-250 maintenance. For aircraft maintenance and release, use the limits explicitly specified by the manufacturer.',
            },
          ],
        },
        {
          id: '13.6',
          title: 'Post-Activation Maintenance',
          blocks: [
            {
              t: 'p',
              text: 'Following an actual activation of the GBS 10 system, the aircraft shall not be returned to flight without the required inspection. The following items shall be inspected:',
            },
            {
              t: 'ul',
              items: [
                'Rescue parachute',
                'Parachute attachment/suspension straps',
                'GBS 10 container',
                'Pyroactuator',
                'Deployment/release mechanism',
                'Aircraft mounting structure',
                'Associated electrical connections',
                'Aircraft structure for any effects resulting from activation',
              ],
            },
            {
              t: 'p',
              text: 'Reinstallation and return to service of the system shall be performed in accordance with the GBS 10 manufacturer’s maintenance manual.',
            },
          ],
        },
        {
          id: '13.7',
          title: 'Rescue System Maintenance Records',
          blocks: [
            { t: 'p', text: 'A separate maintenance and activation record shall be maintained for the GBS 10 system. Records shall include at least:' },
            {
              t: 'ul',
              items: [
                'System model (GBS 10)',
                'System serial number',
                'Installation date',
                'Pyroactuator serial number',
                'Pyroactuator installation date',
                'Current activation count',
                'Last inspection date',
                'Pyroactuator replacement date',
                'Container inspection result',
                'Parachute inspection result',
                'Maintenance personnel',
              ],
            },
            { t: 'p', text: 'Every actual activation shall be recorded and included in the cumulative activation count.' },
          ],
        },
        {
          id: '13.8',
          title: 'GPS Mount Base',
          blocks: [
            {
              t: 'p',
              text: 'The GPS mount base is a structural mounting component for the navigation system and is subject to flight vibration, temperature cycling, UV and environmental aging, and structural fatigue loads.',
            },
            { t: 'h', text: 'Before each flight' },
            { t: 'ul', items: ['Check mounting security', 'Check for cracks, looseness, or deformation', 'Check fastener condition'] },
            { t: 'h', text: 'Upon reaching two years of service' },
            { t: 'ul', items: ['Replace the GPS mount base', 'Verify installation accuracy', 'Perform navigation system functional verification'] },
          ],
        },
        {
          id: '13.9',
          title: 'Differential GNSS Antenna Mount Base',
          blocks: [
            {
              t: 'p',
              text: 'The differential GNSS antenna mount base maintains antenna position stability and directly affects navigation accuracy.',
            },
            { t: 'h', text: 'Before flight, inspect' },
            { t: 'ul', items: ['Antenna mount security', 'Antenna alignment', 'Cracks or deformation', 'Fasteners'] },
            { t: 'h', text: 'After two years of service' },
            { t: 'p', text: 'The differential GNSS antenna mount base shall be replaced. After replacement:' },
            { t: 'ul', items: ['Antenna installation inspection', 'GNSS positioning verification', 'Differential positioning accuracy verification'] },
          ],
        },
      ],
    },
    {
      id: '14',
      title: 'Long-Term Storage',
      sections: [
        {
          id: '14.1',
          title: 'Storage Procedure',
          blocks: [
            { t: 'p', text: 'When the aircraft will remain out of service for more than 30 days, the long-term storage procedure shall be performed.' },
            {
              t: 'ul',
              items: [
                'Store the high-voltage batteries at the specified storage SOC.',
                'Isolate the propulsion power system.',
                'Protect against rain and moisture.',
                'Protect carbon-fiber structures from prolonged exposure to adverse environments.',
                'Periodically inspect battery condition.',
                'Perform a complete maintenance inspection before returning the aircraft to service.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: '15',
      title: 'Maintenance Records',
      sections: [
        {
          id: '15.1',
          title: 'Record Requirements',
          blocks: [
            { t: 'p', text: 'Every maintenance activity shall be recorded:' },
            {
              t: 'ul',
              items: [
                'Aircraft serial number',
                'Flight hours',
                'Date',
                'Maintenance item',
                'Defect description',
                'Corrective action',
                'Replaced component',
                'Component serial number, when applicable',
                'Maintenance personnel',
                'Inspector, when applicable',
              ],
            },
            { t: 'p', text: 'The 500-hour inspections of motors, ECS units, and carbon-fiber rotors shall be separately documented.' },
            { t: 'callout', tone: 'note', title: 'In this app', text: 'Record maintenance from the Maintenance tracker. Each record captures these fields.', link: { href: '/manuals/maintenance-log', label: 'Open maintenance tracker' } },
          ],
        },
      ],
    },
    {
      id: '16',
      title: 'Return to Service',
      sections: [
        {
          id: '16.1',
          title: 'Functional Checks',
          blocks: [
            { t: 'p', text: 'After maintenance involving the following systems, the applicable functional checks shall be performed:' },
            {
              t: 'ul',
              items: ['Flight control system', 'Motors', 'ECS', 'High-voltage batteries', 'High-voltage power distribution', 'Rotors', 'Primary structure', 'Emergency parachute system'],
            },
            {
              t: 'callout',
              tone: 'warning',
              title: 'Return to flight',
              text: 'After maintenance of critical flight systems, the aircraft shall not be returned to flight until the required inspections and necessary verification have been completed.',
            },
          ],
        },
      ],
    },
    {
      id: 'A',
      title: 'Appendix A: Principal Maintenance Intervals',
      sections: [
        {
          id: 'A.1',
          title: 'Intervals',
          blocks: [
            {
              t: 'table',
              head: ['Component', 'Prescribed interval'],
              rows: [
                ['Carbon-Fiber Rotors', '500 flight hours'],
                ['Motors', '500 flight hours'],
                ['ECS', '500 flight hours'],
                ['HV Batteries', 'Condition-based and battery maintenance program'],
                ['Flight Control System', 'Flight-hour and condition monitoring'],
                ['Primary Airframe', 'Scheduled inspection program'],
                ['Emergency Parachute', 'Per manufacturer requirements'],
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'B',
      title: 'Appendix B: Current Configuration Data',
      sections: [
        {
          id: 'B.1',
          title: 'Configuration',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Flight control software version', 'V9 81.11.0'],
                ['PFD software version', '08.30'],
                ['Signal control cable', 'PTFE aerospace silver-plated shielded wire, 4 × 0.35 mm², OD 4.1 mm, −90 °C to +260 °C'],
                ['Main power cable', '10 AWG / 6 mm² silicone cable, 50 A continuous, −60 °C to +200 °C'],
                ['Maximum occupant weight', '100 kg'],
                ['Propulsion configuration', 'Four-axis, eight-rotor distributed electric propulsion'],
                ['Propulsion power architecture', 'Dual independent high-voltage propulsion battery systems: Battery A → ECS → upper rotors; Battery B → ECS → lower rotors'],
              ],
            },
            {
              t: 'img',
              src: '/img/pfd-display.webp',
              alt: 'Primary Flight Display showing battery 86%, ground speed, altitude, eight rotor gauges, and ARM / TAKEOFF / RTL / LAND / DISARM buttons',
              caption: 'Primary Flight Display (PFD)',
              w: 1400,
              h: 884,
            },
          ],
        },
      ],
    },
  ],
}
