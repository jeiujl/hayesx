/**
 * HayesX-250 Flight Manual, Document No. HayesX-250-FM-001, Revision A (2026),
 * prepared by the HayesX Engineering Department. Transcribed for in-app reading.
 *
 * Block types: p, h, ul, ol, kv (label/value rows), table, callout, img.
 */

export const FLIGHT_MANUAL = {
  id: 'flight',
  title: 'Flight Manual',
  short: 'Product / Flight Manual',
  docNo: 'HayesX-250-FM-001',
  revision: 'A',
  issued: '2026',
  preparedBy: 'HayesX Engineering Department',
  revisions: [['A', '2026', 'Initial Release']],
  chapters: [
    {
      id: '1',
      title: 'General Information',
      sections: [
        {
          id: '1.1',
          title: 'Purpose',
          blocks: [
            {
              t: 'p',
              text: 'This Flight Manual provides operating limitations, normal procedures, emergency procedures, and technical information for the safe operation of the HayesX-250 electric Vertical TakeOff and Landing (eVTOL) aerial vehicle.',
            },
          ],
        },
        {
          id: '1.2',
          title: 'Vehicle Identification',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Manufacturer', 'HayesX Inc., Las Vegas, Nevada, US'],
                ['Model', 'HayesX-250'],
                ['Category', 'Single-Seat Electric Vertical Takeoff and Landing Aerial Vehicle'],
                ['Configuration', 'Quadrotor Octocopter'],
                ['Propulsion', 'Electric Propulsion'],
                ['Occupants', '1 Pilot'],
              ],
            },
          ],
        },
        {
          id: '1.3',
          title: 'Vehicle Description',
          blocks: [
            {
              t: 'p',
              text: 'The HayesX-250 is a single-seat electric vertical takeoff and landing aerial vehicle utilizing a quadrotor-octocopter configuration.',
            },
            { t: 'p', text: 'The primary systems include:' },
            {
              t: 'ul',
              items: [
                'Aeronautical Aluminum Airframe',
                'Carbon Fiber Cantilever Structures',
                'Electric Propulsion System',
                'Flight Control System',
                'Battery System',
                'Complete Aircraft Recovery System',
                'Flight Data Recording System',
              ],
            },
            { t: 'img', src: '/img/hx250-front.webp', alt: 'HayesX-250 front view drawing, 2.45 m wide', caption: 'Front view', w: 966, h: 439 },
            { t: 'img', src: '/img/hx250-side.webp', alt: 'HayesX-250 side view drawing, 2.65 m long and 1.28 m high', caption: 'Side view', w: 989, h: 474 },
            { t: 'img', src: '/img/hx250-top.webp', alt: 'HayesX-250 top view drawing showing four arms with coaxial rotors', caption: 'Top view', w: 900, h: 962 },
            {
              t: 'kv',
              rows: [
                ['Propeller diameter', '57″ (1.447 m)'],
                ['Maximum dimensions', '2.655 m (L) × 3.17 m (W) × 1.28 m (H)'],
              ],
            },
            { t: 'h', text: 'Preliminary Technical Specifications' },
            {
              t: 'kv',
              rows: [
                ['Weight', '≤ 116 kg (excluding rescue system)'],
                ['Maximum Take Off Weight (MTOW)', '216 kg'],
                ['Maximum Thrust', '380 kg'],
                ['Maximum Level Flight Speed', '100 km/h (software limitation)'],
                ['Maximum Flight Time', '25 minutes'],
                ['Maximum Descent Rate', '4 m/s'],
                ['Maximum Rate of Climb', '5 m/s'],
                ['Cruising Range', '20 km'],
                ['Hover Time', '20 min'],
                ['Operating Temperature', '−10 °C to +40 °C'],
                ['Maximum Altitude', '1,500 ft above ground level (AGL)'],
                ['Wind Resistance Level', '4 – 6'],
                ['No. of Motors', '8'],
                ['Unfolded Dimensions', '2,650 × 2,450 × 1,280 mm'],
                ['Folded Dimensions', '2,650 × 1,380 × 1,280 mm'],
                ['Crew', '1 person'],
                ['Power Source', 'Electric lithium battery'],
              ],
            },
          ],
        },
        {
          id: '1.4',
          title: 'Regulatory Statement',
          blocks: [
            {
              t: 'p',
              text: 'The HayesX-250 is designed, built, and operated in accordance with the US FAA Part 103 Regulations and CCAR-91-R4 Requirements for Ultralight Vehicles.',
            },
            { t: 'p', text: 'Under these Regulations, the HayesX-250 is classified as an Ultralight Vehicle and accordingly:' },
            {
              t: 'ul',
              items: [
                'No Vehicle Certification is required',
                'No Airworthiness Certificate is required',
                'Certification as a conventional aircraft is not required',
              ],
            },
          ],
        },
      ],
    },
    {
      id: '2',
      title: 'Operating Limitations',
      sections: [
        {
          id: '2.1',
          title: 'Airspeed Limitations',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Velocity Never Exceed (VNE)', '100 km/h (62 mph)'],
                ['Recommended Cruise Speed', '40 km/h (25 mph)'],
              ],
            },
          ],
        },
        {
          id: '2.2',
          title: 'Weight Limitations',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Maximum Takeoff Weight', '216 kg'],
                ['Maximum Pilot Weight', '100 kg'],
                ['Minimum Pilot Weight', 'No restriction'],
              ],
            },
          ],
        },
        {
          id: '2.3',
          title: 'Load Factor Limits',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Positive Limit Load', '+2.0 G'],
                ['Negative Limit Load', '−2.0 G'],
                ['Ultimate Load', '+3.0 G / −2.0 G'],
              ],
            },
          ],
        },
        {
          id: '2.4',
          title: 'Attitude Limitations',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Maximum Roll Angle', '30°'],
                ['Maximum Pitch Angle', '30°'],
              ],
            },
          ],
        },
        {
          id: '2.5',
          title: 'Battery Limitations',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Minimum Battery Before Takeoff', '95%'],
                ['Minimum Battery Before Landing', '35%'],
                ['Emergency Battery Warning', '30% (immediate landing required)'],
              ],
            },
          ],
        },
        {
          id: '2.6',
          title: 'Ballistic Recovery System',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Model', 'GBS 10M'],
                ['Maximum Deployment Speed', '100 km/h'],
                ['Minimum Recommended Deployment Height', '10 m AGL'],
                ['Activation Handle Location', 'Pilot’s left side'],
              ],
            },
            {
              t: 'callout',
              tone: 'warning',
              title: 'Warning',
              text: 'Once activated, parachute deployment cannot be cancelled.',
            },
            {
              t: 'p',
              text: 'The aircraft parachute has a 6-year validity period. At the expiry of the period, contact the aircraft manufacturer for inspection. The entire aircraft rescue system is a pyrotechnic device and must be disassembled and/or repaired by authorized personnel only.',
            },
          ],
        },
        {
          id: '2.7',
          title: 'Operating Area Limitations',
          blocks: [
            { t: 'h', text: 'Visual Flight Rules (VFR)' },
            { t: 'p', text: 'HayesX-250 shall be operated only under Visual Flight Rules (VFR).' },
            {
              t: 'p',
              text: 'The pilot shall maintain continuous visual awareness of surrounding airspace, terrain, obstacles, and other aircraft.',
            },
            { t: 'h', text: 'Weather Limitations' },
            { t: 'p', text: 'Flight is permitted only under Visual Meteorological Conditions (VMC). Flight is prohibited in:' },
            { t: 'ul', items: ['Clouds', 'Dense fog', 'Heavy rain', 'Thunderstorm activity', 'Known icy conditions'] },
            { t: 'h', text: 'Daylight Operations' },
            { t: 'p', text: 'HayesX-250 is approved for daytime operations only.' },
            { t: 'p', text: 'Night operations are prohibited unless specifically authorized by the applicable aviation authority.' },
            { t: 'h', text: 'Airspace Limitations' },
            {
              t: 'p',
              text: 'The pilot shall comply with all applicable national and local airspace regulations. Prior to entering controlled airspace, approval or clearance shall be obtained from the appropriate Air Traffic Control (ATC) authority.',
            },
            { t: 'p', text: 'Unauthorized entry into the following areas is prohibited:' },
            {
              t: 'ul',
              items: ['No-fly Zones (Prohibited Areas)', 'Restricted Areas', 'Danger Areas', 'Temporary Flight Restriction Areas'],
            },
            { t: 'h', text: 'Congested Area Restrictions' },
            { t: 'p', text: 'Flight over densely populated areas is prohibited unless specifically authorized by applicable regulations.' },
            { t: 'p', text: 'Adequate separation shall be maintained from persons, vehicles, buildings, and property at all times.' },
            { t: 'h', text: 'Safe Operating Area' },
            { t: 'p', text: 'Operations should be conducted within designated and evaluated flight areas. Recommended operating areas include:' },
            {
              t: 'ul',
              items: [
                'Open terrain',
                'No overhead power lines present',
                'No significant obstacles from tall buildings',
                'No large congregations or dense public gatherings',
                'Area meets suitable emergency landing requirements',
              ],
            },
          ],
        },
      ],
    },
    {
      id: '3',
      title: 'Emergency Procedures',
      emergency: true,
      sections: [
        {
          id: '3.1',
          title: 'General',
          blocks: [
            { t: 'p', text: 'In any emergency, the pilot shall first maintain controlled flight.' },
            { t: 'p', text: 'The pilot shall then identify the malfunction and take appropriate corrective action.' },
            {
              t: 'p',
              text: 'If controlled flight cannot be maintained, immediate consideration shall be given to deployment of the Ballistic Recovery System (BRS).',
            },
          ],
        },
        {
          id: '3.2',
          title: 'Emergency Response Priorities',
          blocks: [
            { t: 'p', text: 'Recommended emergency response priority:' },
            {
              t: 'ol',
              items: ['Maintain vehicle control', 'Select safe landing area', 'AUTO LAND', 'RETURN TO HOME (RTH)', 'Manual Landing', 'BRS Deployment'],
            },
          ],
        },
        {
          id: '3.3',
          title: 'Low Battery Warning (≤ 35%)',
          blocks: [
            { t: 'p', text: 'A warning is sounded when the battery is less than or equal to 35%. On hearing the warning, immediately:' },
            { t: 'ol', items: ['Terminate the current task', 'Prepare to land', 'Reduce large-scale maneuvers', 'Monitor power continuously'] },
            {
              t: 'p',
              text: 'The Battery Level Display in the upper area of the PFD triggers an audible alarm when the battery goes below 35%.',
            },
            {
              t: 'img',
              src: '/img/pfd-battery-indicator.webp',
              alt: 'PFD with the battery level display highlighted at the top center',
              caption: 'PFD battery level display (highlighted)',
              w: 1100,
              h: 380,
            },
          ],
        },
        {
          id: '3.4',
          title: 'Emergency Battery Warning (≤ 30%)',
          blocks: [
            { t: 'p', text: 'A further warning is sounded when the battery is less than or equal to 30%. On hearing the warning, immediately:' },
            { t: 'ol', items: ['Find the nearest safe place to land', 'Perform landing', 'No further flight allowed'] },
            {
              t: 'p',
              text: 'The Battery Level Display in the upper area of the PFD triggers an audible alarm when the battery goes below 30%.',
            },
          ],
        },
        {
          id: '3.5',
          title: 'Single Motor Failure',
          blocks: [
            { t: 'callout', tone: 'note', title: 'Indication', text: 'A single motor stops working or is providing abnormal thrust.' },
            { t: 'p', text: 'Respond immediately and keep the aircraft stable by:' },
            { t: 'ol', items: ['Reducing flight speed', 'Lowering flight altitude', 'Choosing a safe landing area', 'Landing as soon as possible'] },
            { t: 'h', text: 'Follow-up actions' },
            { t: 'ul', items: ['End of flight', 'Do not take off again'] },
          ],
        },
        {
          id: '3.6',
          title: 'Multiple Motor Failure',
          blocks: [
            { t: 'callout', tone: 'note', title: 'Indication', text: 'Two or more motors fail.' },
            { t: 'p', text: 'Respond immediately:' },
            {
              t: 'ol',
              items: ['Determine whether the aircraft is controllable', 'If under control, land immediately', 'If it is or becomes uncontrollable, activate BRS immediately'],
            },
          ],
        },
        {
          id: '3.7',
          title: 'Flight Control System Failure',
          blocks: [
            { t: 'p', text: 'Respond immediately by:' },
            { t: 'ol', items: ['Manually operating the joystick to land', 'Selecting the nearest safe landing area', 'Performing the landing'] },
            {
              t: 'callout',
              tone: 'warning',
              title: 'If the joystick cannot control the aircraft',
              text: 'Activate the BRS whole-aircraft parachute rescue system immediately.',
            },
          ],
        },
        {
          id: '3.8',
          title: 'Control (Joystick) Stick Failure',
          blocks: [
            { t: 'callout', tone: 'note', title: 'Indication', text: 'Aircraft will not respond to joystick controls.' },
            { t: 'p', text: 'Immediately:' },
            {
              t: 'ol',
              items: [
                'Confirm that the flight control system is normal',
                'Open the virtual PFD joystick interface',
                'Start Virtual Stick Mode',
                'Control the aircraft using the virtual joysticks',
                'Find a safe landing area',
                'Land as soon as possible',
              ],
            },
            { t: 'h', text: 'Follow-up action' },
            { t: 'p', text: 'No further flight allowed.' },
            {
              t: 'img',
              src: '/img/pfd-virtual-sticks.webp',
              alt: 'PFD with left and right virtual joysticks highlighted',
              caption: 'Virtual joysticks on the PFD (highlighted)',
              w: 1100,
              h: 395,
            },
          ],
        },
        {
          id: '3.9',
          title: 'GPS Signal Loss',
          blocks: [
            { t: 'p', text: 'Immediately:' },
            { t: 'ol', items: ['Maintain visual flight', 'Switch attitude mode'] },
          ],
        },
        {
          id: '3.10',
          title: 'Battery Overheating',
          blocks: [
            { t: 'p', text: 'Immediately:' },
            { t: 'ol', items: ['Reduce power', 'Terminate mission', 'Land as soon as possible', 'Shut down main power after landing'] },
          ],
        },
        {
          id: '3.11',
          title: 'Battery Thermal Runaway',
          blocks: [
            { t: 'callout', tone: 'note', title: 'Indications', lines: ['Smoke', 'Abnormal smell', 'Sharp rise in temperature'] },
            { t: 'p', text: 'The pilot should:' },
            { t: 'ol', items: ['Land immediately', 'Stay away from crowded areas', 'Evacuate immediately after landing'] },
            { t: 'callout', tone: 'warning', title: 'Warning', text: 'Do not restart the system.' },
          ],
        },
        {
          id: '3.12',
          title: 'Automatic Flight Function Failure',
          blocks: [
            { t: 'p', text: 'Applies when:' },
            { t: 'ul', items: ['AUTO LAND is not working', 'Return To Home (RTH) function failure', 'Auto Navigation Exception', 'Auto Flight Interruption'] },
            { t: 'p', text: 'Immediately:' },
            { t: 'ol', items: ['Switch to manual mode', 'Keep the aircraft stable', 'Select the nearest safe area to land', 'Manually land immediately'] },
            { t: 'h', text: 'Follow-up actions' },
            { t: 'ul', items: ['No further flight allowed', 'Prohibited from taking off again', 'Complete system check'] },
            { t: 'callout', tone: 'warning', title: 'Warning', text: 'Do not continue flight missions after a flight function failure.' },
          ],
        },
        {
          id: '3.13',
          title: 'Parachute Activation (BRS)',
          blocks: [
            {
              t: 'p',
              text: 'The parachute is deployed by the pyrotechnic-driven piston system. The preflight checklist should ensure that the parachute red cover is unobstructed. Deploy the BRS in the following situations:',
            },
            { t: 'ul', items: ['Flight control failure', 'Multiple motor failure', 'Structural damage', 'Aircraft out of control'] },
            { t: 'h', text: 'Actions' },
            {
              t: 'ol',
              items: [
                'Stop using joystick and/or digital flight controls',
                'Pull the red parachute handle on the left',
                'Wait for the parachute to fully deploy',
                'Brace for landing',
              ],
            },
            { t: 'h', text: 'After landing' },
            { t: 'ol', items: ['Turn off main power', 'Evacuate the aircraft'] },
          ],
        },
        {
          id: '3.14',
          title: 'Ditching Procedure',
          blocks: [
            { t: 'callout', tone: 'caution', title: 'Restriction', text: 'Flight over water is not approved or recommended for the HayesX-250.' },
            { t: 'p', text: 'If flying over water and a catastrophic event occurs:' },
            {
              t: 'ol',
              items: [
                'Stay calm and in control',
                'Minimize the speed of descent',
                'Brace for impact with the water',
                'Turn off power immediately after contact with the water surface',
                'Unfasten your seat belt and evacuate',
              ],
            },
          ],
        },
        {
          id: '3.15',
          title: 'Pilot Incapacitation',
          blocks: [
            {
              t: 'p',
              text: 'If the pilot is incapacitated, has a panic attack, or is otherwise unable to fly the aircraft, every effort should be made immediately to:',
            },
            { t: 'ol', items: ['Maintain a stable aircraft', 'Assess your own status'] },
            { t: 'p', text: 'Your options are:' },
            { t: 'ul', items: ['Auto Land: press the PFD automatic landing button', 'Return to Home (RTH): press the PFD return-to-home button', 'BRS'] },
            { t: 'callout', tone: 'warning', title: 'If Auto Land and RTH are unavailable', text: 'Activate the BRS.' },
          ],
        },
        {
          id: '3.16',
          title: 'Post Hard Landing Inspection',
          blocks: [
            { t: 'p', text: 'The HayesX-250 must be grounded in the following circumstances:' },
            { t: 'ul', items: ['Landing gear damage', 'Structural damage', 'Aircraft capsizes', 'Blade grounded', 'Parachute deployed', 'Battery shock'] },
            { t: 'callout', tone: 'caution', title: 'Grounded', text: 'Flights may resume only after inspection and release by authorized HayesX personnel.' },
          ],
        },
      ],
    },
    {
      id: '4',
      title: 'Normal Operating Procedures & Checklist',
      sections: [
        {
          id: '4.1',
          title: 'General',
          blocks: [
            { t: 'p', text: 'This chapter details the checklist and normal operating procedures for the HayesX-250.' },
            { t: 'p', text: 'It is important to perform all procedures in the sequence outlined in the checklist.' },
            {
              t: 'p',
              text: 'All pilot operations and movements must be within the Formula 1 inspired roll cage. In the interest of pilot safety, no arm movements are permitted outside the roll cage.',
            },
            { t: 'callout', tone: 'note', title: 'Interactive checklist', text: 'Run these procedures item by item from the Checklist tab.', link: { href: '/checklist', label: 'Open checklist' } },
          ],
        },
        {
          id: '4.2',
          title: 'Preflight Preparation',
          blocks: [
            { t: 'p', text: 'The pilot shall verify:' },
            {
              t: 'ul',
              items: [
                'Flight Manual has been reviewed',
                'He/she is physically fit for flight',
                'Is not under the influence of alcohol or drugs',
                'The weather is suitable for VFR',
                'It is permissible to fly in the proposed area',
                'The battery is fully charged',
                'The flight is fully planned',
              ],
            },
          ],
        },
        {
          id: '4.3',
          title: 'Preflight Inspection & Checklist',
          blocks: [
            { t: 'h', text: '4.3.1 Aircraft Structural Checks' },
            {
              t: 'ul',
              items: [
                'Ensure no structural cracks',
                'Check cantilever arms are undamaged',
                'Ensure cantilever arms secure and rigid at joints',
                'Landing gear serviceable',
                'All critical fasteners marked with red torque-seal paint are secure and show no signs of loosening, fracture, or misalignment',
              ],
            },
            { t: 'h', text: '4.3.2 Propellers' },
            {
              t: 'ul',
              items: [
                'Check all propellers are intact',
                'Ensure there are no cracks',
                'Check to ensure no deformation',
                'Make sure they are securely attached',
                'Check propeller tie wire fixing is intact',
                'Check all marked joints show no evidence of movement or misalignment',
              ],
            },
            { t: 'h', text: '4.3.3 Motors' },
            { t: 'ul', items: ['Ensure motors rotate freely', 'Check to ensure no excessive play', 'Ensure there are no foreign objects'] },
            { t: 'h', text: '4.3.4 Battery System' },
            { t: 'ul', items: ['Secure front battery', 'Secure rear battery', 'Check to ensure no bulge in the battery', 'Check for any physical damage'] },
            { t: 'h', text: '4.3.5 Ballistic Recovery System (BRS) / Parachute' },
            { t: 'ul', items: ['Safety pin removed', 'System on standby', 'Activation handle unobstructed'] },
          ],
        },
        {
          id: '4.4',
          title: 'Power-Up Procedure',
          blocks: [
            { t: 'h', text: 'Main Power Connection' },
            {
              t: 'ol',
              items: [
                'Confirm both main power connectors are disconnected',
                'Connect Front Battery QS12 Main Power Connector',
                'Verify secure connection',
                'Connect Rear Battery QS12 Main Power Connector',
                'Verify secure connection',
              ],
            },
            { t: 'h', text: '4.4.1 High Voltage System Safety Check – General' },
            { t: 'p', text: 'HayesX-250 utilizes a dual 108 V DC electrical power system.' },
            {
              t: 'p',
              text: 'The front and rear battery packs are connected to the aircraft’s main power system through QS12 high-voltage connectors.',
            },
            { t: 'p', text: 'High-voltage system maintenance shall only be performed by trained personnel.' },
            { t: 'h', text: '4.4.2 Preflight Inspection' },
            { t: 'p', text: 'Verify:' },
            {
              t: 'ul',
              items: [
                'QS12 connectors undamaged and in good condition',
                'No burn marks',
                'No thermal deformation',
                'No mechanical damage',
                'Locking mechanism is normal and functional',
                'High-voltage cable insulation intact',
                'No exposed conductors',
              ],
            },
            {
              t: 'callout',
              tone: 'warning',
              title: '4.4.3 Safety Warning',
              lines: [
                'Do not connect or disconnect QS12 connectors under electrical load.',
                'Do not short-circuit battery terminals.',
                'Do not operate with damaged connectors.',
              ],
            },
            {
              t: 'callout',
              tone: 'caution',
              title: '4.4.4 Abnormal Conditions',
              text: 'If any of the following occurs, disconnect power immediately and discontinue operation:',
              lines: ['Abnormal arcing', 'Burning smell', 'Connector overheating', 'System startup failure'],
            },
          ],
        },
        {
          id: '4.5',
          title: 'System Initialization',
          blocks: [
            { t: 'p', text: 'After both battery systems are connected, the Flight Control System powers up automatically.' },
            { t: 'ul', items: ['Flight Control System ON', 'PFD ON', 'Flight Data Recorder ON', 'Wait for self-test completion'] },
          ],
        },
        {
          id: '4.6',
          title: 'Propulsion System Check',
          blocks: [
            { t: 'p', text: 'Inspect all eight propulsion arm control modules:' },
            {
              t: 'ul',
              items: ['Eight green status indicators illuminated continuously', 'No red fault indicators', 'No warning tones', 'No fault messages displayed'],
            },
            { t: 'h', text: '4.6.1 Motor Response Check' },
            { t: 'ul', items: ['Motor response normal', 'No abnormal vibration', 'No abnormal noise'] },
          ],
        },
        {
          id: '4.7',
          title: 'Boarding Procedure',
          blocks: [
            {
              t: 'ul',
              items: [
                'Ensure aircraft is stable and secure before boarding',
                'Board aircraft',
                'Fasten restraint harness',
                'Check PFD display',
                'Ensure Battery Charge ≥ 95%',
                'No error warnings',
              ],
            },
          ],
        },
        {
          id: '4.8',
          title: 'Shutdown Procedure',
          blocks: [
            {
              t: 'ol',
              items: [
                'Stop motors and secure aircraft',
                'Disconnect Rear Battery QS12 Main Power Connector',
                'Disconnect Front Battery QS12 Main Power Connector',
                'System shutdown: following main power disconnection, the Flight Control System, PFD, and Flight Data Recorder will automatically shut down',
                'Verify complete system shutdown',
                'Disconnect cantilever arm brackets',
                'Fold cantilever arms',
                'Insert cantilever joint protectors',
                'Store eVTOL',
              ],
            },
          ],
        },
      ],
    },
    {
      id: '5',
      title: 'Aircraft Flight Performance',
      sections: [
        {
          id: '5.1',
          title: 'General',
          blocks: [
            {
              t: 'p',
              text: 'This chapter provides performance information for the HayesX-250 Electric Vertical Takeoff and Landing Aerial Vehicle. All performance data is based on engineering analysis, ground testing, and flight test results. Performance figures are provided for flight planning purposes only. Actual performance may vary depending on pilot weight, temperature, wind conditions, battery condition, and altitude.',
            },
          ],
        },
        {
          id: '5.2',
          title: 'Basic Performance Data',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Aircraft Model', 'HayesX-250'],
                ['Aircraft Type', 'Single-Seat eVTOL Aerial Vehicle'],
                ['Empty Weight', '116 kg'],
                ['Maximum Takeoff Weight (MTOW)', '216 kg'],
                ['Maximum Pilot Weight', '100 kg'],
                ['Maximum Level Flight Speed', '100 km/h (62 mph)'],
                ['Recommended Cruise Speed', '40 km/h (25 mph)'],
                ['Maximum Operating Altitude', '1,500 ft AGL (457 m AGL)'],
              ],
            },
          ],
        },
        {
          id: '5.3',
          title: 'Electrical System Performance',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['System Voltage', '108 VDC'],
                ['Battery Architecture', 'Dual Independent Battery Packs'],
                ['Maximum System Current', '320 A'],
                ['Maximum Battery Current', '160 A'],
                ['Maximum Continuous Power', '35 kW'],
                ['Maximum Peak Power', '40 kW (not exceeding 10 seconds)'],
              ],
            },
          ],
        },
        {
          id: '5.4',
          title: 'Hover Performance',
          blocks: [
            { t: 'p', text: 'Standard conditions: sea level, ISA standard atmosphere, MTOW 215 kg.' },
            {
              t: 'kv',
              rows: [
                ['Hover In Ground Effect (IGE)', '0 – 2 m'],
                ['Recommended Hover Height', '2 – 10 m AGL'],
                ['Typical Hover Power', '24 – 28 kW'],
              ],
            },
          ],
        },
        {
          id: '5.5',
          title: 'Climb Performance',
          blocks: [
            { t: 'p', text: 'At Maximum Takeoff Weight:' },
            {
              t: 'kv',
              rows: [
                ['Recommended Rate of Climb', '2 – 3 m/s (394 – 591 ft/min)'],
                ['Maximum Short Duration Climb Rate', '4 m/s (787 ft/min)'],
              ],
            },
          ],
        },
        {
          id: '5.6',
          title: 'Cruise Performance',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Recommended Cruise Speed', '40 km/h'],
                ['Economy Cruise Power', '22 – 26 kW'],
                ['Typical Cruise Current', '200 – 250 A'],
              ],
            },
          ],
        },
        {
          id: '5.7',
          title: 'Battery Performance',
          blocks: [
            { t: 'p', text: 'Applies to standard atmosphere, calm wind conditions, battery charged to > 95%.' },
            {
              t: 'kv',
              rows: [
                ['Typical Battery Endurance', '20 – 25 min'],
                ['Maximum Planned Battery Endurance', '30 min'],
                ['Minimum Battery Power Required for Landing', '25%'],
              ],
            },
          ],
        },
        {
          id: '5.8',
          title: 'Range Performance',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Economy Cruise Conditions', '40 km/h'],
                ['Typical Range', '12 – 15 km'],
                ['Maximum Planned Range', '20 km'],
              ],
            },
          ],
        },
        {
          id: '5.9',
          title: 'Wind Speed Limitations',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Maximum Sustained Wind Speed', '8 m/s (16 kt)'],
                ['Maximum Gust', '10 m/s (19 kt)'],
              ],
            },
            { t: 'callout', tone: 'warning', title: 'Limit', text: 'Flight is prohibited above these limits.' },
          ],
        },
        {
          id: '5.10',
          title: 'Temperature Range',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Operating Temperature Range', '−10 °C to +40 °C (14 °F to 104 °F)'],
                ['Recommended Temperature Range', '10 °C to 30 °C (50 °F to 86 °F)'],
              ],
            },
          ],
        },
        {
          id: '5.11',
          title: 'Altitude Range',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Maximum Operating Altitude', '1,500 ft AGL (457 m AGL)'],
                ['Recommended Operating Altitude', 'Below 500 ft AGL'],
              ],
            },
          ],
        },
        {
          id: '5.12',
          title: 'Load Factor Limits',
          blocks: [
            {
              t: 'kv',
              rows: [
                ['Maximum Positive Load', '+2.0 G'],
                ['Maximum Negative Load', '−2.0 G'],
                ['Ultimate Load', '±3.0 G'],
              ],
            },
          ],
        },
        {
          id: '5.13',
          title: 'Performance Notes',
          blocks: [
            { t: 'p', text: 'Performance may be affected by:' },
            {
              t: 'ul',
              items: ['Pilot weight', 'Ambient temperature', 'Wind speed and direction', 'Battery health', 'Operating altitude', 'Flight maneuvering intensity'],
            },
            { t: 'p', text: 'Performance may be reduced in high-temperature, high-altitude, or high-wind environments.' },
            { t: 'p', text: 'Adequate performance margins shall be maintained for safe operation.' },
          ],
        },
      ],
    },
  ],
}
