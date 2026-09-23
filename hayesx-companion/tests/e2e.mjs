/**
 * End-to-end walkthrough of every feature, at phone size, against a running server.
 *   BASE_URL=http://localhost:3100 node tests/e2e.mjs
 * Uses the local filesystem store (no BLOB token) and the dev staff code.
 * Screenshots land in tests/screens/.
 */
import { chromium } from 'playwright-core'
import { mkdirSync, readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const BASE = process.env.BASE_URL || 'http://localhost:3100'
const STAFF_CODE = process.env.STAFF_CODE || 'dev-staff-code'
const SHOTS = new URL('./screens/', import.meta.url).pathname
mkdirSync(SHOTS, { recursive: true })

const stamp = Date.now().toString(36)
const A = { name: 'Alex Rivera', email: `alex+${stamp}@example.com`, password: 'hover-2026-pass' }
const B = { name: 'Blake Chen', email: `blake+${stamp}@example.com`, password: 'octo-copter-99' }

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, acceptDownloads: true }
const errors = []
let step = 0

async function newPage(ctx) {
  const page = await ctx.newPage()
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error' && !/Failed to load resource|net::ERR_INTERNET_DISCONNECTED|status of 401/.test(m.text())) errors.push(`console: ${m.text()}`)
  })
  return page
}

async function shot(page, name) {
  step++
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${SHOTS}${String(step).padStart(2, '0')}-${name}.png` })
}

function log(msg) {
  console.log(`✓ ${msg}`)
}

async function signUp(page, u) {
  await page.goto(BASE + '/checklist')
  await page.getByRole('radio', { name: 'Create account' }).click()
  await page.getByLabel('Full name').fill(u.name)
  await page.getByLabel('Email').fill(u.email)
  await page.getByLabel('Password').fill(u.password)
  await page.getByRole('button', { name: 'Create account' }).last().click()
  await page.getByRole('heading', { name: 'Checklist', exact: true }).waitFor()
}

async function signIn(page, email, password) {
  await page.goto(BASE + '/checklist')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).last().click()
  await page.getByRole('heading', { name: 'Checklist', exact: true }).waitFor()
}

async function signOut(page) {
  await page.goto(BASE + '/account')
  await page.getByRole('button', { name: 'Sign out' }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Sign out' }).click()
  await page.getByRole('radio', { name: 'Sign in' }).waitFor()
}

async function drawSignature(page) {
  const pad = page.getByTestId('signature-pad')
  await pad.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(300)
  const box = await pad.boundingBox()
  await page.mouse.move(box.x + 30, box.y + box.height * 0.6)
  await page.mouse.down()
  for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + 30 + i * 18, box.y + box.height * (0.6 - Math.sin(i / 2) * 0.25))
  await page.mouse.up()
  await page.getByText('Sign here').waitFor({ state: 'detached' })
}

async function answerAll(page, { flagText, battery }) {
  // Tap every unchecked item in order; flag one if asked.
  await page.locator('button[role="checkbox"]').first().waitFor()
  for (;;) {
    const next = page.locator('button[role="checkbox"][data-state="none"]').first()
    if (!(await next.count())) break
    const text = (await next.innerText()).split('\n')[0]
    if (flagText && text.includes(flagText)) {
      await next.locator('xpath=..').getByRole('button', { name: /Flag a discrepancy/ }).click()
      await page.getByLabel('What did you find?').fill('Hairline crack near rear-left arm joint')
      await page.getByRole('button', { name: 'Flag item' }).click()
      flagText = null
      continue
    }
    await next.click()
  }
  await page.locator('#battery-pct').fill(String(battery))
}

const ctxA = await browser.newContext(phone)
const page = await newPage(ctxA)

try {
  /* ---------------- Auth ---------------- */
  await page.goto(BASE + '/checklist')
  await page.getByRole('radio', { name: 'Sign in' }).waitFor()
  await shot(page, 'auth')
  await page.getByLabel('Email').fill('nobody@example.com')
  await page.getByLabel('Password').fill('wrong-password')
  await page.getByRole('button', { name: 'Sign in' }).last().click()
  await page.getByText('Email or password is incorrect.').waitFor()
  log('bad login rejected')

  await signUp(page, A)
  await shot(page, 'checklist-home')
  log('sign up → checklist home')

  /* ---------------- Checklist: NO-GO path ---------------- */
  await page.getByRole('button', { name: /Start Preflight/ }).click()
  await page.getByRole('heading', { name: 'Preflight', exact: true }).waitFor()
  await shot(page, 'preflight-run')
  await answerAll(page, { flagText: 'No structural cracks', battery: 92 })
  await page.getByText('Below 95% minimum before takeoff').waitFor()
  log('battery < 95% flagged automatically')
  await shot(page, 'preflight-battery-low')
  await page.getByRole('button', { name: 'Finish checklist' }).click()
  await page.getByText('NO-GO', { exact: true }).first().waitFor()
  await shot(page, 'preflight-nogo')
  await page.getByRole('button', { name: 'Report to HayesX support' }).click()
  await page.getByText(/Reported .*open messages/).waitFor()
  log('NO-GO result + report sent to HayesX')

  /* ---------------- Checklist: GO path → logbook ---------------- */
  await page.goto(BASE + '/checklist')
  await page.getByRole('button', { name: /Start Preflight/ }).click()
  await answerAll(page, { battery: 98 })
  await page.getByRole('button', { name: 'Finish checklist' }).click()
  await page.getByText('GO', { exact: true }).first().waitFor()
  await shot(page, 'preflight-go')
  await page.getByRole('link', { name: 'Log this flight' }).click()
  await page.getByRole('heading', { name: 'New entry', exact: true }).waitFor()
  assert.equal(await page.getByLabel('Aircraft description').inputValue(), 'HayesX-250')
  assert.equal(await page.getByLabel('Aircraft category').inputValue(), 'Ultralight (FAA Part 103)')
  assert.equal(await page.getByLabel('Pilot').inputValue(), A.name)
  // Submit empty to see validation
  await page.getByRole('button', { name: 'Sign and save entry' }).click()
  await page.getByText('Enter the aircraft serial number. You only need to do this once.').waitFor()
  log('logbook validation (defaults: HayesX-250 / Part 103 / account owner)')
  await page.getByLabel('Aircraft serial number').fill('HX250-0007')
  await page.getByLabel('From').fill('Jean Dry Lake')
  await page.getByLabel('To').fill('Jean Dry Lake')
  await page.getByRole('button', { name: '15 min' }).click()
  await page.getByLabel('Weather conditions').fill('Clear, 24 °C, wind 5 kt SW')
  await page.getByLabel('Notes').fill('Smooth hover checks, all 8 motors nominal.')
  await page.getByRole('checkbox', { name: /I certify/ }).check()
  await drawSignature(page)
  await shot(page, 'logbook-new')
  await page.getByRole('button', { name: 'Sign and save entry' }).click()
  await page.getByText('Signed', { exact: true }).waitFor()
  await page.getByText('HX250-0007').waitFor()
  await shot(page, 'logbook-entry')
  log('flight logged, certified and signed')

  // Second entry: serial number is now locked/prefilled; a different pilot, a past date.
  await page.goto(BASE + '/logbook/new')
  await page.getByText('HX250-0007').waitFor()
  assert.equal(await page.getByLabel('Aircraft serial number').count(), 0, 'serial should be locked')
  await page.getByLabel('Pilot').fill('Jordan Hayes')
  const past = new Date(Date.now() - 40 * 864e5)
  const pad = (n) => String(n).padStart(2, '0')
  await page.getByLabel('Date and time').fill(`${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}T09:30`)
  await page.getByLabel('From').fill('Boulder City')
  await page.getByLabel('To').fill('Eldorado Valley')
  await page.locator('#minutes').fill('22')
  await page.getByLabel('Weather conditions').fill('Few clouds, 18 °C, calm')
  await page.getByRole('checkbox', { name: /I certify/ }).check()
  await drawSignature(page)
  await page.getByRole('button', { name: 'Sign and save entry' }).click()
  await page.getByText('Signed', { exact: true }).waitFor()
  log('serial number populated once, reused automatically; different pilot allowed')

  /* ---------------- Logbook search & report ---------------- */
  await page.goto(BASE + '/logbook')
  await page.getByText(/Report · All time/i).waitFor()
  const reportText = async () => (await page.getByTestId('logbook-report').innerText()).replace(/\s+/g, ' ')
  let r = await reportText()
  assert.match(r, /Total flights 2/i)
  assert.match(r, /Total minutes 37/i)
  await shot(page, 'logbook-list')
  await page.getByRole('button', { name: 'Last 30 days' }).click()
  r = await reportText()
  assert.match(r, /Total flights 1/i)
  assert.match(r, /Total minutes 15/i)
  const d = new Date(past)
  await page.getByLabel('From date').fill(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
  await page.getByLabel('To date').fill(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
  r = await reportText()
  assert.match(r, /Total flights 1/i)
  assert.match(r, /Total minutes 22/i)
  await shot(page, 'logbook-search')
  log('date search tallies flights and minutes')
  await page.getByRole('button', { name: 'All time' }).click()
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export CSV' }).click()])
  const csv = readFileSync(await dl.path(), 'utf8')
  assert.match(csv, /Jean Dry Lake/)
  assert.match(csv, /Total flight time \(min\),37/)
  log('CSV export')

  /* ---------------- Manuals ---------------- */
  await page.goto(BASE + '/manuals')
  await shot(page, 'manuals')
  await page.locator('a[href="/manuals/flight"]').click()
  await page.getByRole('heading', { name: 'Flight Manual', exact: true }).waitFor()
  await page.getByRole('link', { name: /Operating Limitations/ }).click()
  await page.getByText('Velocity Never Exceed (VNE)').waitFor()
  await shot(page, 'manual-chapter')
  await page.goto(BASE + '/manuals/search?q=wind')
  await page.getByText('Wind Speed Limitations').first().waitFor()
  log('manual chapters + search')
  await page.goto(BASE + '/manuals/emergency')
  await page.getByText('Single Motor Failure').click()
  await page.getByText('Reducing flight speed').waitFor()
  await shot(page, 'emergency')
  log('emergency quick reference')

  /* ---------------- Maintenance tracker ---------------- */
  await page.goto(BASE + '/manuals/maintenance-log')
  await page.getByText('10-hour inspection').waitFor()
  await page.getByRole('button', { name: /Battery cycles/ }).click()
  await page.getByLabel('Complete charge-discharge cycles').fill('12')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByRole('button', { name: 'Record' }).first().click()
  await page.getByLabel('Corrective action / work performed').fill('10-hour inspection complete. Torque seal intact on all arms.')
  await page.getByRole('button', { name: 'Save record' }).click()
  await page.getByText('Maintenance recorded').waitFor()
  await shot(page, 'maintenance')
  log('maintenance tracker: cycles + record')

  /* ---------------- Account ---------------- */
  await page.goto(BASE + '/account/aircraft')
  await page.getByLabel('Rescue parachute (GBS 10) in service since').fill('2026-01-15')
  await page.getByLabel('Hours flown before using this app').fill('3.5')
  await page.getByRole('button', { name: 'Save aircraft' }).click()
  await page.getByRole('heading', { name: 'Account', exact: true }).or(page.getByRole('heading', { name: 'Maintenance', exact: true })).first().waitFor()
  await page.goto(BASE + '/account')
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.getByLabel('Pilot certificate / ID').fill('Part 103 · HX trained')
  await page.getByLabel('Pilot weight (kg)').fill('82')
  await page.getByRole('button', { name: 'Save' }).click()
  await page.getByText('Part 103 · HX trained').waitFor()
  await page.getByRole('radio', { name: 'Dark' }).click()
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dark')
  await shot(page, 'account-dark')
  await page.getByRole('radio', { name: 'Light' }).click()
  await page.getByRole('button', { name: 'Sync', exact: true }).click()
  await page.getByText(/Last synced/).waitFor()
  log('profile, aircraft, theme, sync')

  /* ---------------- Messages (pilot) ---------------- */
  await page.goto(BASE + '/messages')
  await page.getByText('Checklist report').waitFor()
  await page.getByLabel('Message', { exact: true }).fill('Hi HayesX, question about the 10-hour inspection scope.')
  await page.getByTestId('photo-input').setInputFiles(new URL('../public/img/torque-seal.webp', import.meta.url).pathname)
  await page.getByAltText('Photo 1 to send').waitFor()
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByText('question about the 10-hour inspection scope').waitFor()
  await page.getByAltText('Attached photo').first().waitFor()
  await shot(page, 'messages-pilot')
  log('pilot message with photo')

  /* ---------------- Change password ---------------- */
  await page.goto(BASE + '/account')
  await page.getByRole('button', { name: 'Change password' }).click()
  await page.getByLabel('Current password').fill(A.password)
  await page.getByLabel('New password', { exact: true }).fill('new-hover-pass-1')
  await page.getByLabel('Confirm new password').fill('new-hover-pass-1')
  await page.getByRole('button', { name: 'Change password' }).last().click()
  await page.getByText(/Password changed/).waitFor()
  A.password = 'new-hover-pass-1'
  log('password change')

  /* ---------------- Staff access ---------------- */
  await page.getByRole('button', { name: /HayesX staff access/ }).click()
  await page.getByLabel('Staff access code').fill('wrong')
  await page.getByRole('button', { name: 'Unlock' }).click()
  await page.getByText('That staff access code is not valid.').waitFor()
  await page.getByLabel('Staff access code').fill(STAFF_CODE)
  await page.getByRole('button', { name: 'Unlock' }).click()
  await page.getByText('Staff access is on').waitFor()
  log('staff access unlock (bad code rejected)')

  /* ---------------- Second pilot writes in ---------------- */
  const ctxB = await browser.newContext(phone)
  const pageB = await newPage(ctxB)
  await signUp(pageB, B)
  await pageB.goto(BASE + '/messages')
  await pageB.getByLabel('Message', { exact: true }).fill('Hello, I need help pairing my PFD.')
  await pageB.getByRole('button', { name: 'Send' }).click()
  await pageB.getByText('I need help pairing my PFD').waitFor()
  log('second pilot messages support')

  /* ---------------- Staff inbox, reply, bulletin, password reset ---------------- */
  await page.goto(BASE + '/messages')
  await page.getByRole('radio', { name: 'Inbox' }).click()
  await page.getByText(B.name).click()
  await page.getByText('I need help pairing my PFD').waitFor()
  await page.getByLabel('Message', { exact: true }).fill('Hi Blake, happy to help. Power-cycle the PFD after both QS12 connectors are seated.')
  await page.getByRole('button', { name: 'Send' }).click()
  await page.getByText('happy to help').waitFor()
  await shot(page, 'messages-staff-thread')
  await page.getByRole('button', { name: 'Issue temporary password' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Issue password' }).click()
  const temp = (await page.locator('.select-all').innerText()).trim()
  assert.match(temp, /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  await page.keyboard.press('Escape')
  log('staff reply + temporary password issued')

  await page.goto(BASE + '/messages')
  await page.getByRole('radio', { name: 'Bulletins' }).click()
  await page.getByRole('button', { name: 'Publish a bulletin' }).click()
  await page.getByLabel('Title').fill(`Welcome to the HayesX app ${stamp}`)
  await page.getByLabel('Message', { exact: true }).fill('Run the preflight checklist before every flight and log each flight here.')
  await page.getByRole('button', { name: 'Publish to all pilots' }).click()
  await page.getByText(`Welcome to the HayesX app ${stamp}`).waitFor()
  log('bulletin published')

  // Pilot B was signed out by the reset; sign in with the temporary password.
  await pageB.goto(BASE + '/account')
  await pageB.reload()
  await pageB.getByRole('radio', { name: 'Sign in' }).waitFor({ timeout: 15000 })
  await signIn(pageB, B.email, temp)
  await pageB.locator('nav[aria-label="Main"]').getByText('unread').waitFor({ timeout: 60000 })
  await pageB.goto(BASE + '/messages')
  await pageB.getByText('happy to help').waitFor()
  await pageB.getByRole('radio', { name: 'Bulletins' }).click()
  await pageB.getByText(`Welcome to the HayesX app ${stamp}`).waitFor()
  await shot(pageB, 'messages-pilot-b')
  log('temporary password works; pilot sees reply badge, reply and bulletin')

  /* ---------------- Cross-device sync ---------------- */
  const ctxA2 = await browser.newContext(phone)
  const pageA2 = await newPage(ctxA2)
  await signIn(pageA2, A.email, A.password)
  await pageA2.goto(BASE + '/logbook')
  await pageA2.getByText('Jean Dry Lake').first().waitFor({ timeout: 15000 })
  await pageA2.getByText('Boulder City').first().waitFor()
  await pageA2.goto(BASE + '/account')
  await pageA2.getByText('Part 103 · HX trained').waitFor()
  log('data synced to a second device')

  /* ---------------- Offline ---------------- */
  // Let the service worker install and precache.
  await page.goto(BASE + '/checklist')
  await page.waitForFunction(async () => {
    const reg = await navigator.serviceWorker?.getRegistration()
    return Boolean(reg?.active)
  }, null, { timeout: 60000 })
  await page.waitForTimeout(3000)
  await ctxA.setOffline(true)
  await page.goto(BASE + '/logbook/new')
  await page.getByRole('heading', { name: 'New entry', exact: true }).waitFor()
  await page.getByText(/Offline\. Your entries are saved/).waitFor()
  await page.getByLabel('From').fill('Offline Field')
  await page.getByLabel('To').fill('Offline Field')
  await page.getByRole('button', { name: '10 min' }).click()
  await page.getByLabel('Weather conditions').fill('Clear')
  await page.getByRole('checkbox', { name: /I certify/ }).check()
  await drawSignature(page)
  await page.getByRole('button', { name: 'Sign and save entry' }).click()
  await page.getByText('Signed', { exact: true }).waitFor()
  await page.goto(BASE + '/manuals/flight/3')
  await page.getByText('Single Motor Failure').first().waitFor()
  await shot(page, 'offline-manual')
  log('offline: app shell, manuals and new logbook entry work without a connection')
  await ctxA.setOffline(false)
  await page.evaluate(() => window.dispatchEvent(new Event('online')))
  await page.goto(BASE + '/account')
  await page.getByText(/Last synced/).waitFor({ timeout: 20000 })
  await pageA2.goto(BASE + '/logbook')
  await pageA2.reload()
  await pageA2.getByText('Offline Field').first().waitFor({ timeout: 20000 })
  log('offline entry synced after reconnecting')

  /* ---------------- Delete entry, delete account ---------------- */
  await pageA2.getByText('Offline Field').first().click()
  await pageA2.getByRole('button', { name: 'Delete entry' }).click()
  await pageA2.getByRole('dialog').getByRole('button', { name: 'Delete entry' }).click()
  await pageA2.getByRole('heading', { name: 'Logbook', exact: true }).waitFor()
  assert.equal(await pageA2.getByText('Offline Field').count(), 0)
  log('delete logbook entry')

  await pageB.goto(BASE + '/account')
  await pageB.getByRole('button', { name: 'Delete account' }).click()
  await pageB.getByLabel('Enter your password to confirm').fill(temp)
  await pageB.getByRole('button', { name: 'Permanently delete' }).click()
  await pageB.getByRole('radio', { name: 'Sign in' }).waitFor()
  await signOut(page)
  log('delete account; sign out')

  /* ---------------- Desktop layout ---------------- */
  const desk = await browser.newContext({ viewport: { width: 1280, height: 860 } })
  const dp = await newPage(desk)
  await signIn(dp, A.email, A.password)
  await dp.waitForTimeout(500)
  await dp.screenshot({ path: `${SHOTS}99-desktop.png` })
  log('desktop layout')

  if (errors.length) {
    console.log('\nBrowser errors:\n' + [...new Set(errors)].join('\n'))
    process.exitCode = 1
  } else {
    console.log('\nAll checks passed with no browser errors.')
  }
} catch (err) {
  console.error('\n✗ FAILED:', err.message)
  await page.screenshot({ path: `${SHOTS}fail.png` }).catch(() => {})
  if (errors.length) console.log('Browser errors:\n' + [...new Set(errors)].join('\n'))
  process.exitCode = 1
} finally {
  await browser.close()
}
