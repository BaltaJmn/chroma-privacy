# Product

<!-- impeccable:product-schema 1 -->

Inferred from the brief of 23-10-2026 and the app repository (`BaltaJmn/color`); no interview round was
held because the owner runs this work from another session. Facts marked (inferred) are not confirmed.

## Platform

web

## Users

- People who search Google for a "year in pixels" template before a new year: bullet journal and
  planner users who print a grid and color one square a day, mostly in English, also Spanish ("año en
  pixeles") and Portuguese ("ano em pixels"). Peak from mid December to the end of January.
- People who want to fill the grid on screen instead of paper and save it as an image.
- On a phone, a visitor who may install Chroma; on a computer, one who may scan or remember it.

## Product Purpose

The web of Chroma (`color.baltajmn.dev`): privacy policy, terms, account deletion and invitation links,
and from October 2026 free year-in-pixels tools that bring search traffic to the app. Success is
installs from Google Play and the App Store with the web campaign token, and printables and exports that
people actually use.

## Positioning

Chroma is a year in pixels that fills itself from a photo: one photo a day, the app proposes its colors,
you pick one, and the year becomes a 12 x 31 grid. No mood list to choose from, no streaks, no ads.
The web tools are the paper and manual version of the same grid; the app is the version you do not
have to remember.

## Operating Context

- Printables are printed at home on A4 or US Letter and colored with pens.
- The online maker is used on a phone or a computer, often in several short visits over the year: the
  grid lives in the browser (`localStorage`), with no account and no server.
- Store links carry a campaign token (`ct=` on the App Store, `referrer=utm_...` on Play) because the
  apps have no analytics by contract; the stores are the only measure.

## Capabilities and Constraints

- Static files on GitHub Pages behind Cloudflare. No server code, no cookies, no third party scripts.
- The app: Android and iOS, `com.baltajmn.color`, App Store id 6819301462. Free; Pro is a one-time
  1,99 EUR or 0,99 EUR a month (never needed for the grid).
- The app grid: one column per month, one row per day (12 x 31), month initials on top, days 1, 10, 20
  and 30 on the left, days that do not exist left empty.
- Languages of the web tools: en, es, pt (search data of 23-10-2026). The app has 13.

## Brand Commitments

- Name under the icon: Chroma. Store title: "Chroma: Color Year in Pixels" in every language.
- The interface is neutral grey with no tint, like a color viewing booth; the only vivid color is the
  user's. System fonts. Numerals large and thin.
- Never present demonstration data as someone's real year.

## Evidence on Hand

- App screenshots in `color/store/screenshots/` and the icon palette (`#E07A5F`, `#F2CC8F`,
  `#81B29A`, `#5B8DB8`, `#3D5A80`).
- No reviews on the App Store yet; no testimonials, press or download counts to quote.

## Product Principles

- What you do not share does not leave your device, on the web too.
- The tool is complete without the app; the app is offered, never required.
- True claims only: the app makes the color from a photo, it does not track moods.

## Accessibility & Inclusion

Every day of the grid is reachable and paintable by keyboard and screen reader; colors are never the
only carrier of information in the interface.
