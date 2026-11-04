// Checks the built pages: every sitemap URL has its file, a canonical to itself, reciprocal hreflang,
// a title and description of sane length, an OG image that exists, a link to the legal notice, and a 2027
// grid of 365 days. It also checks the pages written by hand and app-ads.txt.
//   node tools/check.mjs <site-root-dir> <https://domain>
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const [root, site] = [process.argv[2] || '.', process.argv[3] || 'https://color.baltajmn.dev']
const fail = []
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8')
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.endsWith('/') && u !== site + '/') // the policy page at / is not built here
const pages = {}
for (const url of locs) {
  const file = join(root, url.replace(site, ''), 'index.html')
  if (!existsSync(file)) { fail.push(`${url}: no file`); continue }
  const html = readFileSync(file, 'utf8')
  const get = (re) => (html.match(re) || [])[1]
  const title = get(/<title>([^<]*)<\/title>/)
  const desc = get(/<meta name="description" content="([^"]*)"/)
  if (get(/<link rel="canonical" href="([^"]+)"/) !== url) fail.push(`${url}: canonical`)
  if (!title || title.length > 70) fail.push(`${url}: title ${title && title.length}`)
  if (!desc || desc.length < 70 || desc.length > 170) fail.push(`${url}: description ${desc && desc.length}`)
  const og = get(/<meta property="og:image" content="([^"]+)"/)
  if (!og || !existsSync(join(root, og.replace(site, '')))) fail.push(`${url}: og image`)
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail.push(`${url}: one h1`)
  if (!html.includes('href="/legal.html')) fail.push(`${url}: no link to the legal notice`)
  if (/[—–“”‘’…→•× ]/.test(html)) fail.push(`${url}: non-ASCII punctuation`)
  pages[url] = Object.fromEntries([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]))
  for (const m of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
    const p = m[1].endsWith('/') ? m[1] + 'index.html' : m[1]
    if (!existsSync(join(root, p))) fail.push(`${url}: broken ${m[1]}`)
  }
}
for (const [url, alts] of Object.entries(pages)) {
  for (const [lang, href] of Object.entries(alts)) {
    if (lang === 'x-default') continue
    if (!pages[href]) fail.push(`${url}: hreflang ${lang} not in sitemap`)
    else if (!Object.values(pages[href]).includes(url)) fail.push(`${url}: hreflang ${lang} not reciprocal`)
  }
}
// The pages written by hand (policy, terms, delete, legal notice): they exist, the sitemap lists them, they use
// ASCII punctuation, every local link resolves and each one links to the legal notice.
const TYPO = /[\u2014\u2013\u201C\u201D\u2018\u2019\u2026\u2192\u2022\u00D7\u00A0]/
for (const f of ['index.html', 'terms.html', 'delete.html', 'legal.html']) {
  const file = join(root, f)
  if (!existsSync(file)) { fail.push(`${f}: no file`); continue }
  const html = readFileSync(file, 'utf8')
  const loc = f === 'index.html' ? site + '/' : `${site}/${f}`
  if (!sitemap.includes(`<loc>${loc}</loc>`)) fail.push(`${f}: not in the sitemap`)
  if (TYPO.test(html)) fail.push(`${f}: non-ASCII punctuation`)
  if (f !== 'legal.html' && !html.includes('href="/legal.html')) fail.push(`${f}: no link to the legal notice`)
  for (const m of html.matchAll(/(?:href|src)="(\/[^"?#]*)/g)) {
    const p = m[1].endsWith('/') ? m[1] + 'index.html' : m[1]
    if (!existsSync(join(root, p)) && !existsSync(join(root, p + '.html'))) fail.push(`${f}: broken ${m[1]}`)
  }
}
// app-ads.txt: exactly the AdMob line of the publisher, in the root; robots.txt must not hide it.
const adsFile = join(root, 'app-ads.txt')
if (!existsSync(adsFile)) fail.push('app-ads.txt: no file')
else if (readFileSync(adsFile, 'utf8').trim() !== 'google.com, pub-1605179202100483, DIRECT, f08c47fec0942fa0') fail.push('app-ads.txt: not the AdMob line')
if (/^\s*Disallow:\s*\/(app-ads\.txt)?\s*$/m.test(readFileSync(join(root, 'robots.txt'), 'utf8'))) fail.push('robots.txt: blocks app-ads.txt')
const days = (y) => Array.from({ length: 12 }, (_, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate()).reduce((a, b) => a + b)
if (existsSync(join(root, 'yip/sheets/en-classic-a4.svg'))) {
  const cells = (readFileSync(join(root, 'yip/sheets/en-classic-a4.svg'), 'utf8').match(/class="c"/g) || []).length
  if (cells !== days(2027)) fail.push(`classic sheet: ${cells} cells, expected ${days(2027)}`)
}
console.log(fail.length ? fail.join('\n') : `ok: ${Object.keys(pages).length} pages`)
process.exit(fail.length ? 1 : 0)
