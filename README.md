# chroma-privacy

The public web of **Chroma**, a photo-a-day color journal for Android and iOS
(app repository: `BaltaJmn/color`, private). Served at <https://color.baltajmn.dev/>
by GitHub Pages from `main`, behind Cloudflare.

| File | What it is |
|---|---|
| `index.html` | Privacy policy, English and Spanish. The URL in the app, Play and the App Store |
| `terms.html` | Terms of use of Friends |
| `delete.html` | How to delete the account, with or without the app (Play's deletion URL, also `/delete`) |
| `404.html` | Any unknown path; for `/i/<code>`, the invitation for someone without the app |
| `.well-known/` | `assetlinks.json` and `apple-app-site-association`: invitation links open the app |
| `.nojekyll` | Without it Pages runs Jekyll, which drops `.well-known` and the links stop opening the app |

## Keeping it true

The policy is written against what the app and its server actually do, not from a template. A change
to what leaves the phone or what the server keeps changes, in the same change, this site, the app's
`store/formularios.md` and `PrivacyInfo.xcprivacy`, and the Data Safety form in Play Console.

This is the only copy: edit it here. Nothing private is published: no source, no keys, no user data.
