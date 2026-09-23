// Regenerates the provisional HX app icons in public/icons. Run: node scripts/make-icons.mjs
// Set CHROMIUM_PATH if Chromium is not at /opt/pw-browsers/chromium.
import { chromium } from 'playwright-core'
import path from 'node:path'
import { readFileSync } from 'node:fs'
const font = 'data:font/woff2;base64,' + readFileSync(path.resolve('node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff2')).toString('base64')
const html = (size, scale, rounded) => `<html><head><style>
@font-face{font-family:BC;src:url('${font}') format('woff2');font-weight:700}
html,body{margin:0;background:transparent}
.i{width:${size}px;height:${size}px;background:radial-gradient(120% 90% at 30% 10%,#1d232b 0%,#0e1116 60%);display:grid;place-items:center;border-radius:${rounded ? size*0.22 : 0}px;overflow:hidden;position:relative}
.t{font-family:BC;font-weight:700;color:#f4f2ee;font-size:${size*0.5*scale}px;letter-spacing:${size*0.01}px;line-height:1;transform:translateY(${size*0.02}px)}
.t span{color:#4c9dff}
.bar{position:absolute;left:${size*(0.5-0.17*scale)}px;right:${size*(0.5-0.17*scale)}px;bottom:${size*(0.5-0.25*scale)}px;height:${Math.max(2,size*0.012)}px;background:#c9a36a;opacity:.9;border-radius:2px}
</style></head><body><div class="i"><div class="t">H<span>X</span></div><div class="bar"></div></div></body></html>`
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' })
const p = await b.newPage()
for (const [name, size, scale, rounded, omit] of [
  ['icon-512.png', 512, 1, true, true],
  ['icon-192.png', 192, 1, true, true],
  ['icon-maskable-512.png', 512, 0.72, false, false],
  ['apple-touch-icon.png', 180, 0.92, false, false],
]) {
  await p.setViewportSize({ width: size, height: size })
  await p.setContent(html(size, scale, rounded))
  await p.evaluate(() => document.fonts.ready)
  await p.screenshot({ path: 'public/icons/' + name, omitBackground: omit, clip: { x: 0, y: 0, width: size, height: size } })
  console.log('wrote', name)
}
await b.close()
