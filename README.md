# chroma-privacy

The public web of **Chroma**, a photo-a-day color journal for Android and iOS
(app repository: `BaltaJmn/color`, private). Served at <https://color.baltajmn.dev/>
by GitHub Pages from `main`, behind Cloudflare.

| File | What it is |
|---|---|
| `index.html` | Privacy policy, English and Spanish. The URL in the app, Play and the App Store |
| `terms.html` | Terms of use of Friends |
| `delete.html` | How to delete the account, with or without the app (Play's deletion URL, also `/delete`) |
| `404.html` | Any unknown path; for `/i/<code>`, the invitation for someone without the app, with the store of their phone only (Google Play on Android, App Store on iPhone and iPad, both on a computer) |
| `.well-known/` | `assetlinks.json` and `apple-app-site-association`: invitation links open the app |
| `.nojekyll` | Without it Pages runs Jekyll, which drops `.well-known` and the links stop opening the app |
| `year-in-pixels/`, `es/ano-en-pixeles/`, `pt/ano-em-pixels/` | Year in Pixels 2027 printables: three layouts, A4 and Letter, previewed with notes on the sheet |
| `year-in-pixels/maker/`, `es/ano-en-pixeles/crear/`, `pt/ano-em-pixels/criar/` | Online maker: a color key you paint with, saved in the browser, PNG export |
| `yip/` | Shared CSS and `maker.js`, the sheets (`sheets/*.svg` for the web, `*.png` A4 at 150 dpi), the PDFs (`pdf/`), app screenshots, OG cards, icon |
| `sitemap.xml`, `robots.txt` | For Google; the sitemap lists the pages with their language alternates |
| `tools/` | `sheets.mjs` draws the sheets and PDFs, `build.mjs` the pages, sitemap and robots, `og.mjs` the OG cards, `check.mjs` checks them. `fonts/Roboto.ttf` (OFL) is the font of the PDFs |

## Year in Pixels pages (from 23-10-2026)

Search pages that bring people to the app before its peak (15-12 to 31-01), part of the growth plan
(`plan-apps/0-plan.md`). Languages: en, es ("año en pixeles") and pt ("ano em pixels", "legenda"),
the three with search volume (Google autocomplete, 23-10-2026); de and fr were looked at and left out.

- **Edit texts in `tools/build.mjs` (pages) or `tools/sheets.mjs` (sheets)**, never in the generated
  files, then:

  ```bash
  node tools/sheets.mjs && node tools/og.mjs && node tools/build.mjs && node tools/check.mjs . https://color.baltajmn.dev
  ```

  `sheets.mjs` and `og.mjs` need Google Chrome installed (headless): the PDFs are printed by Chrome so
  they are vector with Roboto embedded. Commit the generated files with the change.
- **Next year:** change `YEAR` in `tools/sheets.mjs` and run the line above. The months layout starts
  the week on Monday for A4 in en and es, and on Sunday for Letter and for pt (Brazil).
- **Stable URLs** for other channels (Pinterest): `https://color.baltajmn.dev/yip/sheets/<lang>-<layout>.png`
  (1240 x 1754, `layout` = `classic`, `months`, `key`), the same as `.svg` per paper
  (`<lang>-<layout>-<a4|letter>.svg`), the PDFs in `/yip/pdf/`, and the OG cards in `/yip/og/`.
- **The maker** keeps everything in `localStorage` (`chroma-yip-v1`); nothing is uploaded. Days are
  stored by color key row, so changing a row's color repaints its days.
- **Store links** carry a campaign so web installs show in the consoles, since the app has no
  analytics: Play `referrer=utm_source=color.baltajmn.dev&utm_medium=web&utm_campaign=yip-<page>-<lang>`
  and App Store `ct=yip-<page>-<lang>`. The App Store counts `ct` only with the provider token
  `pt` (`APPLE_PT` in `tools/build.mjs`, 129564006; App Analytics, Campaigns, "Generate a campaign link"). Android sees only Play, iPhone only the App Store.
- **No cookies, no analytics scripts**, the same contract as the app.
- CSS and JS URLs carry `?v=<hash>` so a change reaches visitors past the Cloudflare cache.

## Keeping it true

The policy is written against what the app and its server actually do, not from a template. A change
to what leaves the phone or what the server keeps changes, in the same change, this site, the app's
`store/formularios.md` and `PrivacyInfo.xcprivacy`, and the Data Safety form in Play Console.

This is the only copy: edit it here. Nothing private is published: no source, no keys, no user data.
