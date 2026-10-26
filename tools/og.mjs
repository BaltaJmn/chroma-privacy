// OG cards (1200 x 630) of the Year in Pixels pages: the title and an example year, colored with
// made-up seasonal colors (it is an illustration, not anyone's year). Renders with headless Chrome.
import { writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { YEAR, L } from './sheets.mjs'
import { COMPARE } from './compare.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const SUB = {
  print: { en: 'Free printable templates', es: 'Plantillas gratis para imprimir', pt: 'Modelos grátis para imprimir' },
  maker: { en: 'Free online maker', es: 'Creador online gratis', pt: 'Criador online grátis' },
}
// Comparison pages: [title, line under it] per language.
const VS = {
  daylio: { en: ['Daylio alternative', 'A year in pixels from your photos'], es: ['Alternativa a Daylio', 'Tu año en píxeles, con fotos'] },
  yip: { en: ['Year in Pixels apps', 'Chroma, Pixels and Pixa, compared'], es: ['Apps de año en píxeles', 'Chroma, Pixels y Pixa, comparadas'], pt: ['Apps de ano em pixels', 'Chroma, Pixels e Pixa, comparados'] },
  onese: { en: ['1 Second Everyday alternative', 'One photo a day, one color'], es: ['Alternativa a 1 Second Everyday', 'Una foto al día, un color'] },
}
// Winter blues and greys, spring greens, summer sand and coral, autumn rust.
const SEASONS = [
  ['#3D5A80', '#5B8DB8', '#A9B8C2', '#C9CED6', '#8D99AE', '#E9C46A'],
  ['#81B29A', '#9DB4AB', '#A8DADC', '#E9C46A', '#C9ADA7', '#5B8DB8'],
  ['#F2CC8F', '#E9C46A', '#E07A5F', '#F4A27A', '#81B29A', '#5B8DB8'],
  ['#E07A5F', '#C06C84', '#7E8F5A', '#E76F51', '#6C5B7B', '#3D5A80'],
]
let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const daysIn = (m) => new Date(Date.UTC(YEAR, m + 1, 0)).getUTCDate()
const cells = []
for (let m = 0; m < 12; m++) {
  const season = SEASONS[Math.floor(((m + 1) % 12) / 3)]
  for (let d = 1; d <= 31; d++) {
    if (d > daysIn(m)) continue
    cells.push(`<i style="grid-column:${m + 1};grid-row:${d};background:${season[Math.floor(rnd() * season.length)]}"></i>`)
  }
}
const grid = cells.join('')

mkdirSync(join(ROOT, 'yip/og'), { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), 'yip-og-'))
const cards = []
for (const kind of Object.keys(SUB)) for (const lang of Object.keys(L)) cards.push([kind, lang, L[lang].title, `<span class="n">${YEAR}</span>`, SUB[kind][lang]])
for (const id of Object.keys(COMPARE)) for (const lang of Object.keys(COMPARE[id].path)) cards.push([`vs-${id}`, lang, VS[id][lang][0], '', VS[id][lang][1]])
for (const [kind, lang, title, numeral, sub] of cards) {
  {
    const html = join(tmp, `${kind}-${lang}.html`)
    writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Roboto;src:url("${join(ROOT, 'tools/fonts/Roboto.ttf')}");font-weight:100 900}
html,body{margin:0;width:1200px;height:630px;background:#F1F1F1;font-family:Roboto;color:#111;overflow:hidden}
.t{position:absolute;left:80px;top:96px;width:520px}
h1{margin:0;font-size:44px;font-weight:600;letter-spacing:-1px;line-height:1.1}
h1.big{font-size:64px;letter-spacing:-2px;line-height:1.05}
.n{display:block;font-size:200px;font-weight:200;letter-spacing:-9px;line-height:0.9;margin:14px 0 0 -10px}
p{margin:30px 0 0;font-size:30px;color:#5E5E5E}
.brand{position:absolute;left:80px;bottom:64px;font-size:22px;color:#5E5E5E;display:flex;align-items:center;gap:12px}
.brand img{width:34px;height:34px;border-radius:8px}
.paper{position:absolute;right:80px;top:56px;width:400px;height:518px;background:#fff;border-radius:4px;box-shadow:0 1px 2px rgb(0 0 0/.06),0 24px 48px -16px rgb(0 0 0/.25);padding:28px 26px}
.g{display:grid;grid-template-columns:repeat(12,1fr);grid-template-rows:repeat(31,1fr);gap:3px;height:100%}
.g i{border-radius:2px}
</style>
<div class="t"><h1${numeral ? '' : ' class="big"'}>${title}${numeral}</h1><p>${sub}</p></div>
<div class="brand"><img src="${join(ROOT, 'yip/icon.svg')}">Chroma: Color Year in Pixels</div>
<div class="paper"><div class="g">${grid}</div></div>`)
    const profile = mkdtempSync(join(tmpdir(), 'yip-chrome-'))
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, '--window-size=1200,630',
      `--screenshot=${join(ROOT, `yip/og/${kind}-${lang}.png`)}`, `file://${html}`], { stdio: 'ignore' })
    rmSync(profile, { recursive: true, force: true })
  }
}
rmSync(tmp, { recursive: true, force: true })
console.log('og ok')
