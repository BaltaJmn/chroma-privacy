// Year in Pixels printables: one SVG per language, layout and paper, drawn in millimetres.
// Writes the web previews (system font), the PDFs and the PNGs (Roboto, through headless Chrome)
// and anchors.json, the points the landing page labels on each sheet.
//
//   node tools/sheets.mjs            everything
//   node tools/sheets.mjs --svg      only the SVGs and anchors (no Chrome)
import { mkdirSync, writeFileSync, rmSync, mkdtempSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'yip')
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export const YEAR = 2027

export const PAPER = { a4: { w: 210, h: 297 }, letter: { w: 215.9, h: 279.4 } }
export const LAYOUTS = ['classic', 'months', 'key']

export const L = {
  en: {
    title: 'Year in Pixels',
    initials: 'JFMAMJJASOND',
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    // Sunday first
    weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
    key: 'Color key',
    file: { stem: 'year-in-pixels', classic: 'classic', months: 'months', key: 'color-key', a4: 'a4', letter: 'letter' },
  },
  es: {
    title: 'Año en píxeles',
    initials: 'EFMAMJJASOND',
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    weekdays: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    key: 'Leyenda',
    file: { stem: 'ano-en-pixeles', classic: 'clasica', months: 'por-meses', key: 'con-leyenda', a4: 'a4', letter: 'carta' },
  },
  pt: {
    title: 'Ano em pixels',
    initials: 'JFMAMJJASOND',
    months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
    weekdays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
    key: 'Legenda',
    file: { stem: 'ano-em-pixels', classic: 'classica', months: 'por-meses', key: 'com-legenda', a4: 'a4', letter: 'carta' },
  },
}

// Spain and the UK print on A4 and start the week on Monday; the US, Mexico and Brazil start it on Sunday.
export const mondayFirst = (lang, paper) => paper === 'a4' && lang !== 'pt'

export const pdfName = (lang, layout, paper) => {
  const f = L[lang].file
  return `${f.stem}-${YEAR}-${f[layout]}-${f[paper]}.pdf`
}

const daysIn = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
const r = (n) => Math.round(n * 100) / 100
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const INK = '#111111'
const MUTED = '#5E5E5E'
const LINE = '#B8B8B8'
const FAINT = '#D6D6D6'
const M = 14 // page margin
const HEAD = 24 // header band under the top margin
const FOOT = 8

// The grid of the app's "My year": one column per month, one row per day, flatter than square.
function grid(x0, y0, w, h, lang, anchors) {
  const out = []
  const numW = 7
  const headH = 5
  const colP = (w - numW) / 12
  const rowP = (h - headH) / 31
  const gap = Math.min(1.1, rowP * 0.16)
  const cw = colP - gap
  const ch = rowP - gap
  const gx = x0 + numW
  const gy = y0 + headH
  for (let m = 0; m < 12; m++) {
    out.push(`<text x="${r(gx + m * colP + cw / 2)}" y="${r(y0 + 3.4)}" class="ini">${L[lang].initials[m]}</text>`)
  }
  for (let d = 1; d <= 31; d++) {
    const y = gy + (d - 1) * rowP
    out.push(`<text x="${r(gx - 2)}" y="${r(y + ch / 2 + 0.8)}" class="num">${d}</text>`)
    for (let m = 0; m < 12; m++) {
      if (d > daysIn(YEAR, m)) continue
      out.push(`<rect x="${r(gx + m * colP)}" y="${r(y)}" width="${r(cw)}" height="${r(ch)}" rx="0.8" class="c"/>`)
    }
  }
  anchors.months = [gx + 0.5 * colP, y0 + 2]
  anchors.days = [x0 + 2.5, gy + 9.5 * rowP]
  anchors.blank = [gx + 1 * colP + cw / 2, gy + 29.5 * rowP]
  anchors.grid = [gx + 6 * colP, gy + 15 * rowP]
  return out.join('')
}

function months(x0, y0, w, h, lang, paper, anchors) {
  const out = []
  const cols = 3
  const rows = 4
  const gapX = 9
  const gapY = 7
  const bw = (w - gapX * (cols - 1)) / cols
  const bh = (h - gapY * (rows - 1)) / rows
  const mon = mondayFirst(lang, paper)
  const wd = mon ? [...L[lang].weekdays.slice(1), L[lang].weekdays[0]] : L[lang].weekdays
  const nameH = 6
  const wdH = 4.5
  const cellP = Math.min(bw / 7, (bh - nameH - wdH) / 6)
  const gap = 0.9
  const c = cellP - gap
  // Blocks as wide as their cells, the leftover width shared between the gaps.
  const spread = (w - cols * (7 * cellP - gap)) / (cols - 1)
  for (let m = 0; m < 12; m++) {
    const bx = x0 + (m % cols) * (7 * cellP - gap + spread)
    const by = y0 + Math.floor(m / cols) * (bh + gapY)
    out.push(`<text x="${r(bx)}" y="${r(by + 3.6)}" class="mon">${esc(L[lang].months[m].toUpperCase())}</text>`)
    for (let i = 0; i < 7; i++) {
      out.push(`<text x="${r(bx + i * cellP + c / 2)}" y="${r(by + nameH + 3)}" class="wd">${wd[i]}</text>`)
    }
    const first = new Date(Date.UTC(YEAR, m, 1)).getUTCDay() // 0 = Sunday
    const offset = mon ? (first + 6) % 7 : first
    for (let d = 1; d <= daysIn(YEAR, m); d++) {
      const i = offset + d - 1
      const x = bx + (i % 7) * cellP
      const y = by + nameH + wdH + Math.floor(i / 7) * cellP
      out.push(`<rect x="${r(x)}" y="${r(y)}" width="${r(c)}" height="${r(c)}" rx="0.7" class="c"/>`)
      out.push(`<text x="${r(x + 0.9)}" y="${r(y + 2.4)}" class="dn">${d}</text>`)
      if (m === 0 && d === 1) anchors.jan1 = [x + c / 2, y + c / 2]
    }
    if (m === 0) {
      anchors.monthName = [bx + 6, by + 2.5]
      anchors.weekdays = [bx + 0.5 * cellP, by + nameH + 2]
    }
  }
  return out.join('')
}

function key(x0, y0, w, lang, anchors) {
  const out = [`<text x="${r(x0)}" y="${r(y0 + 3.6)}" class="mon">${esc(L[lang].key.toUpperCase())}</text>`]
  const cols = 2
  const rows = 5
  const colW = (w - 10) / cols
  const rowH = 8.2
  for (let i = 0; i < cols * rows; i++) {
    const x = x0 + Math.floor(i / rows) * (colW + 10)
    const y = y0 + 9 + (i % rows) * rowH
    out.push(`<rect x="${r(x)}" y="${r(y)}" width="9" height="5.6" rx="0.8" class="c"/>`)
    out.push(`<line x1="${r(x + 12)}" y1="${r(y + 5.4)}" x2="${r(x + colW)}" y2="${r(y + 5.4)}" class="ln"/>`)
  }
  anchors.key = [x0 + 4.5, y0 + 11.8]
  return out.join('')
}

export function sheet({ lang, layout, paper, font }) {
  const { w, h } = PAPER[paper]
  const anchors = {}
  const top = M + HEAD
  const bottom = h - M - FOOT
  let body
  if (layout === 'classic') body = grid(M, top, w - 2 * M, bottom - top, lang, anchors)
  else if (layout === 'months') body = months(M, top + 1, w - 2 * M, bottom - top - 1, lang, paper, anchors)
  else {
    const keyH = 52
    body = grid(M, top, w - 2 * M, bottom - top - keyH, lang, anchors) + key(M + 7, bottom - keyH + 8, w - 2 * M - 7, lang, anchors)
  }
  const family = font === 'roboto' ? 'Roboto, sans-serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" font-family='${family}'>
<style>
text{fill:${INK};font-variant-numeric:tabular-nums}
.yr{font-size:17px;font-weight:200;letter-spacing:-0.5px}
.tt{font-size:3.6px;font-weight:500;letter-spacing:0.25px}
.ini{font-size:2.6px;font-weight:600;text-anchor:middle;fill:${MUTED}}
.num{font-size:2.1px;text-anchor:end;fill:${MUTED}}
.mon{font-size:2.5px;font-weight:600;letter-spacing:0.35px}
.wd{font-size:2.1px;font-weight:600;text-anchor:middle;fill:${MUTED}}
.dn{font-size:1.65px;fill:${MUTED}}
.ft{font-size:2.3px;fill:${MUTED}}
.c{fill:#fff;stroke:${LINE};stroke-width:0.22}
.ln{stroke:${FAINT};stroke-width:0.25}
</style>
<rect width="${w}" height="${h}" fill="#fff"/>
<text x="${M - 0.8}" y="${M + 14}" class="yr">${YEAR}</text>
<text x="${w - M}" y="${M + 14}" class="tt" text-anchor="end">${esc(L[lang].title)}</text>
${body}
<text x="${M}" y="${h - M + 1}" class="ft">Chroma: Color Year in Pixels</text>
<text x="${w - M}" y="${h - M + 1}" class="ft" text-anchor="end">color.baltajmn.dev</text>
</svg>`
  for (const k in anchors) anchors[k] = [r((anchors[k][0] / w) * 100), r((anchors[k][1] / h) * 100)]
  return { svg, anchors }
}

function chrome(args) {
  const profile = mkdtempSync(join(tmpdir(), 'yip-chrome-'))
  try {
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, ...args], { stdio: 'ignore' })
  } finally {
    rmSync(profile, { recursive: true, force: true })
  }
}

function page(svg, paper) {
  const { w, h } = PAPER[paper]
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:Roboto;src:url("${join(ROOT, 'tools/fonts/Roboto.ttf')}");font-weight:100 900}
@page{size:${w}mm ${h}mm;margin:0}html,body{margin:0}svg{display:block;width:100vw;height:auto}
</style>${svg}`
}

// Only when run, not when build.mjs or og.mjs import the shared names.
if (process.argv[1] === fileURLToPath(import.meta.url)) generate()

function generate() {
  const svgOnly = process.argv.includes('--svg')
  mkdirSync(join(OUT, 'sheets'), { recursive: true })
  mkdirSync(join(OUT, 'pdf'), { recursive: true })
  const tmp = mkdtempSync(join(tmpdir(), 'yip-'))
  const anchors = {}
  const sizes = {}
  for (const lang of Object.keys(L)) {
    for (const layout of LAYOUTS) {
      for (const paper of Object.keys(PAPER)) {
        const web = sheet({ lang, layout, paper, font: 'system' })
        writeFileSync(join(OUT, 'sheets', `${lang}-${layout}-${paper}.svg`), web.svg)
        anchors[`${lang}-${layout}-${paper}`] = web.anchors
        if (svgOnly) continue
        const { svg } = sheet({ lang, layout, paper, font: 'roboto' })
        const html = join(tmp, `${lang}-${layout}-${paper}.html`)
        writeFileSync(html, page(svg, paper))
        const pdf = join(OUT, 'pdf', pdfName(lang, layout, paper))
        chrome(['--no-pdf-header-footer', `--print-to-pdf=${pdf}`, `file://${html}`])
        sizes[pdfName(lang, layout, paper)] = statSync(pdf).size
        if (paper === 'a4') {
          // 1240 x 1754 px: A4 at 150 dpi, for Pinterest and the OG cards.
          chrome([`--window-size=1240,1754`, `--screenshot=${join(OUT, 'sheets', `${lang}-${layout}.png`)}`, `file://${html}`])
        }
      }
    }
  }
  writeFileSync(join(OUT, 'sheets', 'anchors.json'), JSON.stringify(anchors, null, 1) + '\n')
  if (!svgOnly) writeFileSync(join(OUT, 'pdf', 'sizes.json'), JSON.stringify(sizes, null, 1) + '\n')
  rmSync(tmp, { recursive: true, force: true })
  console.log(svgOnly ? 'svg ok' : `ok: ${Object.keys(sizes).length} pdf`)
}
