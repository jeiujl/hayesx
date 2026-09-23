/**
 * Checklists transcribed from the HayesX-250 Flight Manual (HX-250-FM-001, Rev A),
 * Chapter 4 "Normal Operating Procedures & Checklist". Section numbers match the manual.
 * Wording is lightly normalized for checklist use (e.g. "Secure front batter" ->
 * "Secure front battery"); the Manuals tab shows the full procedure text.
 *
 * Item `kind`:
 *   - 'check' (default): tap to confirm, or flag as a discrepancy.
 *   - 'battery': the pilot enters the PFD battery reading; it passes at >= min.
 */

export const BATTERY_MIN_TAKEOFF = 95

export const PREFLIGHT = {
  id: 'preflight',
  title: 'Preflight',
  subtitle: 'Preparation through boarding',
  source: 'Flight Manual Ch. 4 (4.2 to 4.7)',
  sections: [
    {
      id: '4.2',
      title: 'Preflight Preparation',
      lead: 'The pilot shall verify:',
      items: [
        { id: '4.2.a', text: 'Flight Manual has been reviewed' },
        { id: '4.2.b', text: 'Pilot is physically fit for flight' },
        { id: '4.2.c', text: 'Pilot is not under the influence of alcohol or drugs' },
        { id: '4.2.d', text: 'Weather is suitable for VFR' },
        { id: '4.2.e', text: 'It is permissible to fly in the proposed area' },
        { id: '4.2.f', text: 'Battery is fully charged' },
        { id: '4.2.g', text: 'Flight is fully planned' },
      ],
    },
    {
      id: '4.3.1',
      title: 'Aircraft Structural Checks',
      group: '4.3 Preflight Inspection',
      items: [
        { id: '4.3.1.a', text: 'No structural cracks' },
        { id: '4.3.1.b', text: 'Cantilever arms undamaged' },
        { id: '4.3.1.c', text: 'Cantilever arms secure and rigid at joints' },
        { id: '4.3.1.d', text: 'Landing gear serviceable' },
        {
          id: '4.3.1.e',
          text: 'Critical fasteners with red torque-seal paint secure',
          detail: 'No signs of loosening, fracture, or misalignment.',
          image: { src: '/img/torque-seal.webp', alt: 'Red torque-seal paint across a fastener and joint', w: 900, h: 674 },
        },
      ],
    },
    {
      id: '4.3.2',
      title: 'Propellers',
      group: '4.3 Preflight Inspection',
      items: [
        { id: '4.3.2.a', text: 'All propellers intact' },
        { id: '4.3.2.b', text: 'No cracks' },
        { id: '4.3.2.c', text: 'No deformation' },
        { id: '4.3.2.d', text: 'Propellers securely attached' },
        { id: '4.3.2.e', text: 'Propeller tie-wire fixing intact' },
        { id: '4.3.2.f', text: 'Marked joints show no movement or misalignment' },
      ],
    },
    {
      id: '4.3.3',
      title: 'Motors',
      group: '4.3 Preflight Inspection',
      items: [
        { id: '4.3.3.a', text: 'Motors rotate freely' },
        { id: '4.3.3.b', text: 'No excessive play' },
        { id: '4.3.3.c', text: 'No foreign objects' },
      ],
    },
    {
      id: '4.3.4',
      title: 'Battery System',
      group: '4.3 Preflight Inspection',
      items: [
        { id: '4.3.4.a', text: 'Front battery secure' },
        { id: '4.3.4.b', text: 'Rear battery secure' },
        { id: '4.3.4.c', text: 'No bulge in either battery' },
        { id: '4.3.4.d', text: 'No physical damage' },
      ],
    },
    {
      id: '4.3.5',
      title: 'Ballistic Recovery System (BRS) / Parachute',
      group: '4.3 Preflight Inspection',
      items: [
        { id: '4.3.5.a', text: 'Safety pin removed' },
        { id: '4.3.5.b', text: 'System on standby' },
        { id: '4.3.5.c', text: 'Activation handle unobstructed', detail: 'Red handle, pilot’s left side. Parachute red cover unobstructed.' },
      ],
    },
    {
      id: '4.4',
      title: 'Main Power Connection',
      group: '4.4 Power-Up Procedure',
      notes: [
        {
          tone: 'info',
          title: 'High-voltage system',
          text: 'HayesX-250 uses a dual 108 V DC electrical power system. The front and rear battery packs connect to the main power system through QS12 high-voltage connectors. High-voltage maintenance shall only be performed by trained personnel.',
        },
      ],
      items: [
        { id: '4.4.a', text: 'Both main power connectors disconnected' },
        { id: '4.4.b', text: 'Connect Front Battery QS12 main power connector' },
        { id: '4.4.c', text: 'Front connection verified secure' },
        { id: '4.4.d', text: 'Connect Rear Battery QS12 main power connector' },
        { id: '4.4.e', text: 'Rear connection verified secure' },
      ],
    },
    {
      id: '4.4.2',
      title: 'High-Voltage Connector Inspection',
      group: '4.4 Power-Up Procedure',
      lead: 'Verify:',
      notes: [
        {
          tone: 'warning',
          title: 'Warning',
          lines: [
            'Do not connect or disconnect QS12 connectors under electrical load.',
            'Do not short-circuit battery terminals.',
            'Do not operate with damaged connectors.',
          ],
        },
      ],
      items: [
        { id: '4.4.2.a', text: 'QS12 connectors undamaged and in good condition' },
        { id: '4.4.2.b', text: 'No burn marks' },
        { id: '4.4.2.c', text: 'No thermal deformation' },
        { id: '4.4.2.d', text: 'No mechanical damage' },
        { id: '4.4.2.e', text: 'Locking mechanism normal and functional' },
        { id: '4.4.2.f', text: 'High-voltage cable insulation intact' },
        { id: '4.4.2.g', text: 'No exposed conductors' },
      ],
      after: [
        {
          tone: 'caution',
          title: 'Abnormal conditions (4.4.4)',
          text: 'If any of the following occurs, disconnect power immediately and discontinue operation:',
          lines: ['Abnormal arcing', 'Burning smell', 'Connector overheating', 'System startup failure'],
        },
      ],
    },
    {
      id: '4.5',
      title: 'System Initialization',
      lead: 'After both battery systems are connected, the Flight Control System powers up automatically.',
      items: [
        { id: '4.5.a', text: 'Flight Control System ON' },
        { id: '4.5.b', text: 'PFD ON' },
        { id: '4.5.c', text: 'Flight Data Recorder ON' },
        { id: '4.5.d', text: 'Self-test complete' },
      ],
    },
    {
      id: '4.6',
      title: 'Propulsion System Check',
      lead: 'Inspect all eight propulsion arm control modules:',
      items: [
        { id: '4.6.a', text: 'Eight green status indicators illuminated continuously' },
        { id: '4.6.b', text: 'No red fault indicators' },
        { id: '4.6.c', text: 'No warning tones' },
        { id: '4.6.d', text: 'No fault messages displayed' },
      ],
    },
    {
      id: '4.6.1',
      title: 'Motor Response Check',
      items: [
        { id: '4.6.1.a', text: 'Motor response normal' },
        { id: '4.6.1.b', text: 'No abnormal vibration' },
        { id: '4.6.1.c', text: 'No abnormal noise' },
      ],
    },
    {
      id: '4.7',
      title: 'Boarding Procedure',
      notes: [
        {
          tone: 'info',
          title: 'Roll cage',
          text: 'All pilot operations and movements must stay within the roll cage. No arm movements outside the roll cage.',
        },
      ],
      items: [
        { id: '4.7.a', text: 'Aircraft stable and secure before boarding' },
        { id: '4.7.b', text: 'Board aircraft' },
        { id: '4.7.c', text: 'Restraint harness fastened' },
        { id: '4.7.d', text: 'PFD display checked' },
        { id: '4.7.e', kind: 'battery', text: `Battery charge ≥ ${BATTERY_MIN_TAKEOFF}%`, detail: 'Enter the reading shown on the PFD.' },
        { id: '4.7.f', text: 'No error warnings' },
      ],
    },
  ],
}

export const SHUTDOWN = {
  id: 'shutdown',
  title: 'Shutdown',
  subtitle: 'After landing and storage',
  source: 'Flight Manual Ch. 4 (4.8)',
  sections: [
    {
      id: '4.8',
      title: 'Shutdown Procedure',
      items: [
        { id: '4.8.a', text: 'Motors stopped and aircraft secured' },
        { id: '4.8.b', text: 'Disconnect Rear Battery QS12 main power connector' },
        { id: '4.8.c', text: 'Disconnect Front Battery QS12 main power connector' },
        {
          id: '4.8.d',
          text: 'System shutdown',
          detail: 'After main power is disconnected, the Flight Control System, PFD and Flight Data Recorder shut down automatically.',
        },
        { id: '4.8.e', text: 'Complete system shutdown verified' },
        { id: '4.8.f', text: 'Cantilever arm brackets disconnected' },
        { id: '4.8.g', text: 'Cantilever arms folded' },
        { id: '4.8.h', text: 'Cantilever joint protectors inserted' },
        { id: '4.8.i', text: 'eVTOL stored' },
      ],
    },
  ],
}

export const CHECKLISTS = { preflight: PREFLIGHT, shutdown: SHUTDOWN }

export function allItems(list) {
  return list.sections.flatMap((s) => s.items.map((i) => ({ ...i, sectionId: s.id, sectionTitle: s.title })))
}

/** Summarizes a run against its checklist definition. */
export function summarize(list, run) {
  const items = allItems(list)
  const states = run?.items || {}
  let done = 0
  const flagged = []
  for (const item of items) {
    const st = states[item.id]
    if (!st) continue
    if (st.state === 'fail') flagged.push({ ...item, note: st.note || '' })
    else if (st.state === 'ok') done++
  }
  const total = items.length
  const complete = done + flagged.length === total
  return {
    total,
    done,
    flagged,
    answered: done + flagged.length,
    complete,
    go: complete && flagged.length === 0,
    pct: Math.round(((done + flagged.length) / total) * 100),
  }
}
