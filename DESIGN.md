---
name: Chroma Year in Pixels (web)
description: Untinted grey viewing booth for printable and online year-in-pixels tools; the only vivid color is the user's.
colors:
  bg: "#F1F1F1"
  surface: "#FFFFFF"
  surface-variant: "#E6E6E6"
  ink: "#111111"
  muted: "#5E5E5E"
  outline: "#D6D6D6"
  outline-variant: "#EAEAEA"
  on-accent: "#F1F1F1"
  bg-dark: "#0E0E0E"
  surface-dark: "#1A1A1A"
  surface-variant-dark: "#252525"
  ink-dark: "#F2F2F2"
  muted-dark: "#A3A3A3"
  outline-dark: "#303030"
  outline-variant-dark: "#222222"
  on-accent-dark: "#0E0E0E"
typography:
  numeral:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "clamp(76px, 15vw, 96px)"
    fontWeight: 200
    lineHeight: 1
    letterSpacing: "-0.04em"
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 600
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.35
rounded:
  cell: "3px"
  sm: "6px"
  md: "10px"
  row: "20px"
  pill: "24px"
  card: "24px"
  phone: "28px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "40px"
  band: "72px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "52px"
  button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "48px"
  seg-option:
    backgroundColor: "{colors.surface-variant}"
    textColor: "{colors.ink}"
    rounded: "22px"
    padding: "0 18px"
    height: "44px"
  seg-option-checked:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-accent}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "20px 16px 16px"
  key-row:
    backgroundColor: "transparent"
    rounded: "{rounded.row}"
    height: "48px"
  key-row-active:
    backgroundColor: "{colors.surface-variant}"
  grid-cell:
    backgroundColor: "{colors.surface-variant}"
    rounded: "{rounded.cell}"
    height: "21px"
---

# Design System: Chroma Year in Pixels (web)

Scope: the printables pages (`year-in-pixels/`, `es/ano-en-pixeles/`, `pt/ano-em-pixels/`) and the online maker (`year-in-pixels/maker/`, `es/ano-en-pixeles/crear/`, `pt/ano-em-pixels/criar/`). Source of truth: `yip/yip.css`, `yip/maker.js`, `tools/build.mjs`, `tools/sheets.mjs`, `tools/og.mjs`. The policy page `index.html` at the repo root is older and not part of this design system.

## Overview

**Creative North Star: "The Viewing Booth"**

The interface copies Chroma's own app: untinted greys with no hue, so the only vivid color on any page is the user's (a printed sheet, a demo key, a painted day). Chrome is quiet: system sans, one huge ExtraLight numeral per page, pill controls, white cards on a grey ground. Light and dark follow the OS (`prefers-color-scheme`).

Two surfaces share the system. The printables page (Persuade, "annotated specimen sheet") shows the real sheet on a white paper with hairline numbered callouts and the download beside it. The maker (Operate, "legend as brush") puts a 12 x 31 grid card next to a color-key panel whose rows are the paint buttons.

**Key Characteristics:**
- Greys carry no tint; saturation exists only in user or demo colors (icon sea palette).
- One filled control per view (Download PDF, Export PNG); everything else is outlined or tonal.
- Numerals large and thin (weight 200, tabular); text 400 to 600.
- Flat surfaces; one soft paper shadow, used only on the sheet and the phone crop.
- Eyebrow-free: headings are plain, no kickers above them.

## Colors

Neutral greys in two themes, one pair of tokens per role. Frontmatter is normative; `-dark` entries apply under `prefers-color-scheme: dark`.

### Neutral
- **Booth Grey** (bg): page ground.
- **Paper White** (surface): cards, grid card, key-demo panel; becomes Charcoal Card in dark.
- **Tonal Grey** (surface-variant): empty grid days, checked-row and segmented backgrounds, hover fills.
- **Ink** (ink): text, focus rings, today ring, the filled button. Inverts in dark.
- **Muted Ink** (muted): secondary text, month initials, day numbers, callout hairlines.
- **Hairline** (outline, outline-variant): 1px borders, band dividers, table rules, edge ring on near-white cells.
- **On Ink** (on-accent): text on ink fills.

### User color (not a token)
Swatches and day colors come from the user or from demo keys. The maker's default picks, in order: `#E9C46A #81B29A #A9B8C2 #5B8DB8 #3D5A80 #E07A5F #C06C84 #7E8F5A #F2BF94 #6C5B7B #9DB4AB #8D99AE` (`yip/maker.js` PALETTE). Printable sheets and OG cards use seasonal sets from the same sea family (`tools/sheets.mjs`, `tools/og.mjs`). Print-only greys: ink `#111111`, muted `#5E5E5E`, line `#B8B8B8`, faint `#D6D6D6`.

### Named Rules
**The Only Color Rule.** No hue in the interface. A saturated color on screen must belong to the user's grid or a labeled example key.
**The Edge Ring Rule.** A user color whose contrast against its card is below 1.3 gets a 1px outline ring so pale colors stay visible (maker cells, swatches, PNG export).

## Typography

**Font:** system stack `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif` for every page. No webfonts load on the pages.
**Print/OG:** `tools/fonts/Roboto.ttf` (Latin subset, OFL) is used only for PDFs and OG cards.

**Character:** neutral platform sans, made distinctive by scale contrast: a thin giant numeral against 600-weight headings and 400 body.

### Hierarchy
- **Numeral** (200, clamp(76px, 15vw, 96px), 1, -0.04em, tabular): the year in the H1 and step counters (56px, 44px on small screens); the maker's year is 64px (52px under 900px).
- **Display** (600, 30px, 1.15, -0.02em): page H1. Maker H1 is 22px.
- **Headline** (600, 28px, 1.2): band H2. Key panel H2 is 17px.
- **Title** (600, 19px): H3 in ideas and steps.
- **Body** (400, 17px, 1.55): paragraphs capped at 64ch; lede is 19px muted capped at 34ch.
- **Label** (500, 14 to 16px): legends, segmented options (15px), notes, table headers. Buttons 600, 17px.

### Named Rules
**The Thin Numeral Rule.** Years, counts and step numbers use weight 200 with tight tracking and tabular figures; everything else stays 400 to 600.

## Layout

Content wrapper max 1180px with 20px side padding. Pages are header, main, footer. Header min-height 64px with brand left and nav plus EN/ES/PT right; nav wraps to a full-width row under 560px.

Printables hero: two columns 5fr / 7fr, gap 40px; the sheet column reserves 190px on the right for callout text, sheet max 520px. At 960px and below it stacks and callouts become a numbered list under the sheet. Below the hero, bands separated by a 1px hairline with 72px vertical padding (56px under 860px); two-column splits (gap 56px) collapse at 860px; ideas 2 columns to 1 at 720px; steps 4, 2, 1 columns at 900px and 520px.

Maker: grid card (flexible) beside a 340px key panel, gap 24px. Under 900px the panel is replaced by a sticky bottom strip of swatch chips (44px high) with safe-area padding. The grid is 12 month columns by 31 day rows: cells up to 36 x 21px, 3px gap (2px on mobile), a 22px label column, month initials on top, day numbers 1, 10, 20, 30 on the left, days that do not exist left empty.

Spacing rhythm in use: 4, 6, 8, 10, 14, 20, 28, 40, 72.

## Elevation & Depth

Flat and tonal. Depth comes from white cards on grey and a grey tonal step for selected rows. One shadow exists, the paper shadow (`0 1px 2px rgb(0 0 0 / 0.06), 0 18px 40px -12px rgb(0 0 0 / 0.22)`; darker in dark mode), used on the printable sheet and the phone crop. The mobile key strip uses a 10px backdrop blur over a 92% bg tint.

### Named Rules
**The One Shadow Rule.** Only objects that stand for a physical or device image (the paper, the phone) cast a shadow. UI cards, buttons and rows do not.

## Shapes

Pills for actions (24px on 48 to 52px height), 22px for segmented options, 24px cards (20px on mobile), 20px key rows, 28px for the phone crop and the key demo panel, 10px label inputs, 6px swatches, 3px grid cells, 2px paper corners, 7px brand icon. Circular dots (18px mobile, 9px desktop) mark callouts. Focus is a 2px ink outline with 2px offset on every interactive element.

## Components

### Buttons
- **Shape:** full pill, 48px high (24px radius). Outlined 1px hairline, ink border on hover.
- **Primary:** 52px, ink fill, on-accent text, 28px side padding; one per view. Hover mixes ink 86% into bg.
- **Icon button:** 48px circle, transparent, tonal fill on hover, disabled uses outline color. Inline 20 to 22px SVG icons only.
- Transitions 150ms ease-out on background and border.

### Segmented choices
- Radio inputs hidden inside labels; each option 44px pill, tonal fill, checked becomes ink fill with on-accent text. Legend above in 14px muted.

### Cards / Containers
- White card, 24px radius, no border, no shadow. Padding 20px 16px 16px.

### Grid and key (signature)
- Grid cell: 3px radius button, tonal when empty, future empty days a lighter tonal mix, today a 1.5px ink ring, hover a muted ring.
- Key row: swatch (30 x 22, 6px radius), editable label, day count (tabular), hidden color input behind an edit icon, remove icon. The radio row selected is the active brush and gets the tonal background. The eraser row has a struck-through swatch. Add color is an outlined button.

### Annotated sheet (signature)
- White paper at the sheet's true aspect ratio with numbered dots (white ring) and 1px muted hairlines running to 14px callout text on the right; positions animate 200ms ease-out when layout changes.

### Navigation
- 15px links, 44px tall, muted, ink when current (600). Language links are 14px with a hairline divider.

### Key demo and palettes
- Demo key list on a 28px-radius white panel with 28 x 20 swatches; idea palettes are five-column swatch strips (36px high, 6px radius) with 13px muted names.

## Do's and Don'ts

### Do:
- **Do** keep every interface surface to the grey tokens and let user or demo colors supply all saturation.
- **Do** label demonstration data as an example; never present it as someone's real year.
- **Do** keep touch targets at 44px minimum (48px for pills and icon buttons).
- **Do** use inline SVG for icons and ink 2px focus outlines on every control.
- **Do** keep the year or count numerals thin, large and tabular.
- **Do** respect `prefers-reduced-motion` (all transitions off) and `prefers-color-scheme`.

### Don't:
- **Don't** tint the greys or add an accent color to buttons, links or focus.
- **Don't** put kickers or eyebrows above headings; the build has none.
- **Don't** add shadows to cards, buttons or rows.
- **Don't** use color as the only carrier of meaning in the interface; every swatch has a text label.
- **Don't** load webfonts or third party scripts on the pages.

Not canonized (defects the build carries): text at 11 to 13px (callout dot numerals, grid labels, key help, palette names) is below the 14px floor used elsewhere; callout dots hardcode `#111`/`#fff` and ignore the dark theme; the `:root:not([data-theme="light"])` selector has no setter in the shipped pages.

## Raster provenance

- `yip/img/app-{en,es,pt}.webp` are crops (720 x 1321) of Chroma's own App Store screenshot 02 with the headline cut off.
- `yip/sheets/*.png` and `yip/og/*.png` are rendered by `tools/sheets.mjs` and `tools/og.mjs` with headless Chrome.
- `tools/fonts/Roboto.ttf` is a Latin subset of Roboto (OFL) used only for PDFs and OG cards; the pages use the system font stack.
