# AGENTS.md — Northline Studio website

## What this project is

A static, single-page marketing/legal site for **Northline Studio** (an independent Android app brand). It holds:

- the studio home / About / Contact sections,
- a Play-Store-style listing for the **CodeSnap** app (screenshots, What's new, About this app),
- a Play-Store-style listing for the **Spot the Difference** game, plus its **hosted Privacy Policy and Terms of Service**, which both Android apps open in a browser tab (CodeSnap's pages are linked the same way).

Live at <https://studio-northline.github.io/website/> (GitHub Pages, deployed from `main`).
Repo: <https://github.com/Studio-Northline/website> — local clone: this repository's working directory.

Related project (do not confuse): the **CodeSnap** Android app repo lives in a sibling directory of this one. It used to contain a `/website` folder; that copy was removed — the site lives only here, and the app just links to it.

## Stack and constraints

- Plain HTML + CSS + vanilla JS. **No build step, no package.json, no framework, no bundler.** Do not introduce one.
- Text and headings use the system **Helvetica** stack (`Helvetica, Arial, sans-serif`); only **JetBrains Mono** (terminal, code, nav index) is loaded from Google Fonts. No other web fonts.
- Everything is one page: `index.html`, `style.css`, `script.js`, `assets/` (logo SVGs + `showcase/*.webp`).
- Deploy = `git push origin main`; GitHub Pages builds it. No CI.

## File map

| File | Role |
| --- | --- |
| `index.html` | All markup: sticky header + nav, every section (two app listings + their legal pages), footer, screenshot lightbox. Share buttons are plain `<button class="share-btn" data-share-title="…">` — no inline scripts; `script.js` wires them. |
| `style.css` | All styling. Design tokens live in `:root` (dark theme, `--accent:#2563eb` blue + `--green:#34d399`, the two logo colours). |
| `script.js` | Hash router (`render()`), mobile nav, screenshot galleries + shared lightbox, generic share handler, contact form, "Read more" toggle. |
| `assets/showcase/1..5.webp` | CodeSnap screenshots, 700×1517, injected by `script.js`. |
| `assets/showcase-spotit/1..5.webp` | Spot the Difference screenshots, same dimensions. **Not dropped in yet** — until they exist the gallery self-hides (`wrap.hidden`) instead of showing an empty shelf, so the 404s in the console are expected. |
| `assets/logo-mark.svg` | Studio icon — dashed circle + diamond, no background. Header logo left half and the favicon. Source: Inkscape export; only its navy backdrop rect was deleted. Both paths also carry a **same-colour `stroke`** on top of the fill (`stroke-width:4` green, `3` blue) — the geometry lives inside `g174`'s ~7.6× scale, so those numbers are local units, not viewBox units. They are what keeps the dashes and the diamond readable at the header's 28px; without them the mark turns to dust (and the file must stay BOM-free — `Set-Content -Encoding UTF8` in Windows PowerShell 5.1 adds one). |
| `assets/logo-wordmark.svg` | "Northline Studio" wordmark, no background. The banner export had ~12% padding and a 4096×2304 `width`/`height`, so its `viewBox` was cropped to `196 228.6 903 155.9` and `width`/`height` set to `903`/`155.9` — **keep those three attributes in sync**, otherwise `width:auto` in `.logo-word` computes the wrong box. Its navy backdrop rect was removed too, and the leftover side padding is what separates the two images, so `.logo` keeps `gap:0`. Text is `font-weight:700`; bold runs ~9% wider than regular (823 vs 753 user units), which is why the box is 903 wide — re-measure `getBBox()` if the weight or size ever changes. |
| `.gitignore` | Keeps agent verification screenshots (`_*.png`, `shot*.png`, …) out of the repo. Never force-add them. |

## Routing contract — do not break

Hash-based routing, driven by `routes` and `render()` at the top of `script.js`:

- Sections: `#home`, `#about`, `#contact`, `#app-codesnap`, `#app-codesnap-privacy`, `#app-codesnap-terms`, `#app-spotit`, `#app-spotit-privacy`, `#app-spotit-terms`
- Aliases: `#privacy` → the CodeSnap privacy section; `#app-codesnap-whats-new` → the CodeSnap app section, then smooth-scrolls to `#whats-new`
- Unknown hash falls back to `#home`
- Only `render()` toggles `section.active`; sections are `display:none` otherwise
- Every section id must also be listed in the `routes` array — an id that exists in the HTML but not in `routes` can never render.

**The Android apps deep-link to exactly these URLs** (from `AboutHelper.kt` in the CodeSnap repo; Spot the Difference's Settings screen uses the same pattern), so they are a public contract:

```
https://studio-northline.github.io/website/#privacy
https://studio-northline.github.io/website/#app-codesnap-terms
https://studio-northline.github.io/website/#app-codesnap-whats-new
https://studio-northline.github.io/website/#app-spotit-privacy
https://studio-northline.github.io/website/#app-spotit-terms
```

The repo moved to the `Studio-Northline` org, so the original personal-account Pages URL now 404s. **`AboutHelper.kt` in the CodeSnap repo still hardcodes those old URLs and must be updated** — read them straight from the file — or the in-app Privacy Policy / Terms / What's new links stay broken.

## Header / responsive nav

- ≥681px wide: inline `Home · About · Contact` links, hamburger button hidden.
- ≤680px: `.nav-toggle` hamburger replaces them; `#nav` becomes a full-screen fixed overlay toggled with the `.open` class. Big numbered links (`01`/`02`/`03`) stagger in; the logo and toggle sit above it via `z-index:2`.
- Toggle logic in `script.js` (nav id `navToggle`): click to open, and it closes on link click, backdrop tap (`e.target === navMenu`), `Escape` (focus returns to the button), logo click, and on resize past the breakpoint. Open state also sets `body.nav-locked` (scroll lock only).
- The header's blur lives on `header::before`, **never** on `header` itself. A `backdrop-filter` on `header` would make it the containing block for the overlay's `position:fixed`, so the full-screen menu collapses into the header's box the instant it starts fading out. Keep `header` free of `backdrop-filter`/`filter`/`transform`.
- The breakpoint exists in **two** places that must stay in sync: the `@media (max-width:680px)` block in `style.css` and the `window.innerWidth > 680` check in `script.js`.
- `header` is `position:sticky`; the overlay is `position:fixed` against the viewport (the logo/toggle stay clickable above it because they get `z-index:2` inside the header's stacking context).

## Conventions

- Styling through the CSS variables in `:root`; don't hardcode colors.
- Commit messages in history use a short lowercase scope prefix plus an imperative summary: `ui:`, `content:`, `style:`, `chore:`, `header:`.
- Keep copy human and plain — earlier passes deliberately de-formalized the text.
- The site speaks in the first-person plural: **we / us / our**. Never `I`, `me`, `my`, `myself`, and never describe the studio as one person, solo, or "just me".
- Fixed contact/links: `northline.studio.developer@gmail.com`, Play Store ids `com.northlinestudio.codesnap` and `com.northlinestudio.spotthedifference`, GitHub `Studio-Northline`.
- The two legal pages per app reuse CodeSnap's shell classes verbatim — `page-section`, `policy-meta`, `badge`, `policy-quick`, `quick-card yes` / `quick-card no`, `legal-row` / `legal-btn`, `chip-row`. **Do not invent a new style for a legal page**; copy the CodeSnap markup and change the words.
- **No open-source licence.** `LICENSE` reserves everything to Northline Studio — public repo ≠ free to use. Never add, swap in, or suggest an OSS licence (MIT, Apache, GPL…).
- **Always push when the work is done** — commit with the scoped prefix and `git push origin main` without asking. Don't leave changes sitting in the working tree.

## Verifying changes

No test suite. Before pushing:

1. Open `index.html` directly (`file://`) or serve the folder with any static server.
2. Check both a 390px and a 1280px viewport: hamburger open/close on narrow, inline links on wide.
3. Confirm `#privacy`, `#app-codesnap-terms`, and `#app-codesnap-whats-new` still land on the right section — plus `#app-spotit`, `#app-spotit-privacy`, and `#app-spotit-terms`.
4. Screenshots: each app section wraps its gallery in `<div class="showcase-wrapper" data-dir="…" data-name="…">`; `script.js`'s `initGallery()` loads `assets/<data-dir>/1..5.webp` from there. A gallery whose five shots all fail hides itself, so empty-shelf checks only matter once files exist.
5. After pushing, Pages deploys in about a minute: <https://studio-northline.github.io/website/>

## Repository history

`main` was force-pushed (history rewritten) on 2026-10-03, so **every commit SHA changed** and any old SHA reference is dead. The current chain is the only one — nothing is archived in this repo.

Force-pushes do **not** trigger a GitHub Pages build, because the push event's `before` SHA no longer resolves (the `POST …/pages/builds` endpoint reports "queued" but produces nothing). After a rewrite, get a deploy by pushing a normal commit — that is the only reliable trigger.
