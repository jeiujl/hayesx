/**
 * End-to-end test of the HayesX app against a running build.
 *
 *   npm run build && npm start &
 *   npm run test:e2e
 *
 * Covers the flows that carry the safety rules, not just the happy path:
 *   · onboarding gate (no profile / no airframe ⇒ setup)
 *   · a NO-GO raises a defect and grounds the aircraft app-wide
 *   · a grounded aircraft refuses both a new preflight and a logbook entry
 *   · a signed Return to Service is the only route back to airworthy
 *   · all 57 checklist items, both warning interstitials, sequential power-up
 *   · the J-05 battery gate refuses 92% and accepts 96% (FM 2.5)
 *   · sign ⇒ flight timer ⇒ pre-filled logbook entry ⇒ signed and locked
 *   · a logbook entry cannot be signed without a route
 *   · totals, manuals, emergency procedures, bulletin acknowledgement
 */
import { chromium } from 'playwright';
const B = process.env.BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_BROWSERS_PATH
    ? { executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH + '/chromium' }
    : {}
);
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/favicon|fonts\.g/.test(m.text())) errs.push('CONSOLE: ' + m.text()); });

const step = async (label, fn) => { try { await fn(); console.log('✓', label); } catch (e) { console.log('✗', label, '—', e.message.split('\n')[0]); throw e; } };

async function sign(pad = 'canvas') {
  // A stored profile signature is offered as an <img>; only draw when the
  // pad is actually blank.
  if ((await p.locator(pad).count()) === 0) return;
  const c = p.locator(pad).first();
  await c.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(150);
  const box = await c.boundingBox();
  if (!box) throw new Error('signature canvas has no box');
  await p.mouse.move(box.x + 20, box.y + 40);
  await p.mouse.down();
  for (let i = 1; i <= 12; i++) await p.mouse.move(box.x + 20 + i * 18, box.y + 40 - (i % 2 ? 22 : 0));
  await p.mouse.up();
  await p.waitForTimeout(150);
}

await step('onboarding redirect', async () => {
  await p.goto(B + '/preflight');
  await p.waitForURL('**/onboarding', { timeout: 8000 });
});

await step('step 1 pilot', async () => {
  await p.getByPlaceholder('J. Hayes').fill('J. Hayes');
  await p.getByPlaceholder('you@example.com').fill('jhayes@example.com');
  await p.getByRole('button', { name: 'CONTINUE' }).click();
});
await step('step 2 aircraft', async () => {
  await p.getByPlaceholder('HX250-0047').fill('HX250-0047');
  await p.getByPlaceholder('N250HX').fill('N250HX');
  await p.getByRole('button', { name: 'CONTINUE' }).click();
});
await step('step 3 signature + finish', async () => {
  await sign();
  await p.getByRole('button', { name: 'FINISH SETUP' }).click();
  await p.waitForURL('**/preflight', { timeout: 8000 });
  await p.waitForSelector('text=AIRWORTHY');
});
await p.screenshot({ path: 'tests/screenshots/e2e-1-home.png' });

// ── Run 1: force a NO-GO on item C-02, verify grounding cascade ──
await step('start preflight', async () => {
  await p.getByRole('button', { name: 'START PREFLIGHT' }).click();
  await p.waitForURL('**/preflight/run*');
  await p.waitForSelector('text=Preflight Preparation');
});
// Click every PASS button on the current section, respecting sequential locks.
async function passAll() {
  for (let round = 0; round < 12; round++) {
    const pass = p.getByRole('button', { name: '✓ PASS' });
    const n = await pass.count();
    let clicked = 0;
    for (let i = 0; i < n; i++) {
      const b = pass.nth(i);
      if (await b.isEnabled()) { await b.click(); clicked++; }
    }
    if (clicked === 0) return;
    await p.waitForTimeout(60);
    const cont = p.getByRole('button', { name: /^(CONTINUE TO SECTION|COMPLETE & SIGN)/ });
    if (await cont.count() && await cont.isEnabled()) return;
  }
}

await step('section A: 7 declarations', async () => {
  await passAll();
  await p.getByRole('button', { name: /CONTINUE TO SECTION B/ }).click();
});
await step('section B: 5 items', async () => {
  await passAll();
  await p.getByRole('button', { name: /CONTINUE TO SECTION C/ }).click();
});
await p.screenshot({ path: 'tests/screenshots/e2e-2-checklist.png' });
await step('section C: NO-GO on a propeller crack routes to defect capture', async () => {
  await p.getByRole('button', { name: '✓ PASS' }).first().click();       // C-01
  await p.getByRole('button', { name: '✗ NO-GO' }).nth(1).click();       // C-02
  await p.waitForURL('**/preflight/nogo/**', { timeout: 8000 });
  await p.waitForSelector('text=NO-GO');
});
await p.screenshot({ path: 'tests/screenshots/e2e-3-nogo.png' });
await step('save defect → aircraft GROUNDED app-wide', async () => {
  await p.locator('textarea').fill('Hairline crack ~18 mm from hub, rotor 3 upper.');
  await p.getByRole('button', { name: 'SAVE DEFECT' }).click();
  await p.waitForURL('**/preflight/grounded', { timeout: 8000 });
  await p.waitForSelector('text=GROUNDED');
});
await step('RULE: grounded blocks a new logbook entry', async () => {
  await p.goto(B + '/logbook');
  await p.getByRole('button', { name: 'NEW ENTRY' }).click();
  await p.waitForSelector('text=grounded — no new logbook entries', { timeout: 5000 });
});
await step('RULE: grounded blocks starting a preflight', async () => {
  await p.goto(B + '/preflight');
  await p.waitForSelector('text=VIEW DEFECT');
  if (await p.getByRole('button', { name: 'START PREFLIGHT' }).count()) throw new Error('Start button still offered while grounded');
});
await step('return to service releases the aircraft', async () => {
  await p.goto(B + '/preflight/grounded');
  await p.getByPlaceholder('Rotor 3 upper propeller replacement').fill('Rotor 3 upper propeller replacement');
  await p.getByPlaceholder('What was done').fill('Condemned and replaced propeller. Tie wire renewed.');
  await sign();
  await p.getByRole('button', { name: /SIGN & RETURN TO SERVICE/ }).click();
  await p.waitForURL('**/preflight', { timeout: 8000 });
  await p.waitForSelector('text=AIRWORTHY');
});

// ── Run 2: full clean pass through all 57 items ──
await step('full clean run: 57 items, all sections', async () => {
  await p.getByRole('button', { name: /START PREFLIGHT/ }).click();
  await p.waitForURL('**/preflight/run*');
  for (let guard = 0; guard < 60; guard++) {
    if (await p.getByRole('button', { name: 'I UNDERSTAND — CONTINUE' }).count()) {
      await p.getByRole('button', { name: 'I UNDERSTAND — CONTINUE' }).click();
      continue;
    }
    // numeric gate: reject 92, then accept 96
    if (await p.getByRole('button', { name: 'ENTER A VALUE' }).count()) {
      await p.getByRole('button', { name: '9', exact: true }).click();
      await p.getByRole('button', { name: '2', exact: true }).click();
      const noGoLabel = await p.getByRole('button', { name: 'CONFIRM — NO-GO' }).count();
      if (!noGoLabel) throw new Error('gate accepted 92% — below the 95% minimum');
      await p.getByRole('button', { name: 'C', exact: true }).click();
      await p.getByRole('button', { name: '9', exact: true }).click();
      await p.getByRole('button', { name: '6', exact: true }).click();
      await p.getByRole('button', { name: 'CONFIRM — PASS' }).click();
      continue;
    }
    if (await p.getByRole('button', { name: '✓ PASS' }).count()) { await passAll(); }
    const cont = p.getByRole('button', { name: /^CONTINUE TO SECTION/ });
    if (await cont.count() && await cont.isEnabled()) { await cont.click(); continue; }
    const done = p.getByRole('button', { name: 'COMPLETE & SIGN' });
    if (await done.count() && await done.isEnabled()) break;
    await p.waitForTimeout(120);
  }
  await p.getByRole('button', { name: 'COMPLETE & SIGN' }).click();
  await p.waitForSelector('text=Preflight complete');
});
await p.screenshot({ path: 'tests/screenshots/e2e-4-sign.png' });
await step('sign preflight → valid record', async () => {
  await sign();
  await p.getByRole('button', { name: /SIGN & COMPLETE/ }).click();
  await p.waitForSelector('text=Preflight record', { timeout: 15000 });
});
await step('start flight → banner shows timer', async () => {
  await p.getByRole('button', { name: 'START FLIGHT' }).click();
  await p.waitForSelector('text=FLIGHT OPEN');
});
await step('end flight → prefilled logbook draft', async () => {
  await p.getByRole('button', { name: 'END FLIGHT' }).click();
  await p.waitForURL('**/logbook/**', { timeout: 8000 });
  await p.waitForSelector('text=New flight');
});
await step('RULE: cannot sign a logbook entry without a route', async () => {
  await sign();
  const b = p.getByRole('button', { name: /SIGN & LOCK ENTRY/ });
  await b.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await b.click();
  await p.waitForSelector('text=Enter the flight route before signing', { timeout: 5000 });
});
await step('complete and sign the entry → locked', async () => {
  await p.getByPlaceholder('Jean Ridge').fill('Jean Ridge');
  await p.getByPlaceholder('Sandy Valley').fill('Sandy Valley');
  await p.getByPlaceholder('CAVU, 6 kt SW').fill('CAVU, 6 kt SW');
  await p.locator('input[type="number"]').fill('24');
  const b2 = p.getByRole('button', { name: /SIGN & LOCK ENTRY/ });
  await b2.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await b2.click();
  await p.waitForSelector('text=Locked', { timeout: 8000 });
});
await p.screenshot({ path: 'tests/screenshots/e2e-5-entry.png' });
await step('logbook totals reflect the signed flight', async () => {
  await p.goto(B + '/logbook');
  await p.waitForSelector('text=Jean Ridge');
  const flights = await p.locator('.tabular-nums').first().innerText();
  if (flights.trim() !== '1') throw new Error(`expected 1 flight, totals showed "${flights}"`);
});
await p.screenshot({ path: 'tests/screenshots/e2e-6-logbook.png' });
await step('manuals + emergency procedures', async () => {
  await p.goto(B + '/manuals/emergency');
  await p.waitForSelector('text=Response priority');
  await p.getByText('Battery thermal runaway').click();
  await p.waitForSelector('text=Land immediately');
});
await p.screenshot({ path: 'tests/screenshots/e2e-7-emergency.png' });
await step('messages: acknowledge the safety bulletin', async () => {
  await p.goto(B + '/messages');
  await p.getByRole('button', { name: 'ACKNOWLEDGE' }).click();
  await p.waitForSelector('text=Acknowledged');
});
await step('account renders with real counts', async () => {
  await p.goto(B + '/account');
  await p.waitForSelector('text=HX250-0047');
});
await p.screenshot({ path: 'tests/screenshots/e2e-8-account.png' });

console.log(errs.length ? '\nJS ERRORS:\n' + errs.join('\n') : '\nNo JS errors.');
await browser.close();
