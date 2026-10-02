# Saikat Bandyopadhyay — Portfolio

Static portfolio site (vanilla HTML/CSS/JS, no build step), deployed with GitHub Pages at
https://sktbanerjee1.github.io/portfolio/

## Run locally

- **Quickest:** double-click `index.html`. When the page is opened from disk, it reads the bundled `content.js`, because browsers block `fetch` on `file://`.
- **Accurate preview (Windows):** double-click `preview.bat`. It rebuilds `content.js`, starts a server and opens http://localhost:8000.
- **Manual:** `python tools/build_content.py`, then `python -m http.server 8000`.

**After editing `data.json` or `i18n/*.json`, run `python tools/build_content.py`.** It also stamps `?v=<hash>` on the CSS/JS links in `index.html` and `case.html`, so browsers always load matching versions. Run it after editing `app.js` or `style.css` too. Otherwise the double-click preview shows the old content. The live site always reads `data.json` directly and never loads `content.js`.

## Where content lives

All page content is rendered at runtime from **`data.json`** by `app.js`. Edit the JSON; there is no HTML to change.

| Key | Renders |
|---|---|
| `meta`, `hero`, `currently`, `about` | Header, hero, "Currently" card, key figures, about |
| `projects[]` | Project cards. `section: "research"` moves a project to the Research block; `case_study.enabled: true` creates `case.html?id=<id>`; `domains` drives the filter |
| `skills[]` | Skill groups. Selecting a skill highlights projects whose title, description or `tech` mention it |
| `experience[]` | Timeline. `compact: true` moves a role under "Earlier roles" |
| `capabilities`, `research`, `publications`, `education`, `certifications`, `awards`, `languages`, `contact` | Matching sections |

Dates use `YYYY-MM`. Set `end: null` for a current role. Leave unknown values as `null` and they are hidden.

## Translations

- `i18n/en.json`: UI labels (source).
- `i18n/pl.json`: Polish UI labels plus a `data` overlay keyed by path into `data.json` (for example `projects.rapid-ct.description`, where array items are addressed by their `id`).
- The EN/PL toggle is always visible. English is the default; a visitor's choice is remembered. `index.html?lang=pl` opens directly in Polish.
- `pl.json` is marked `_status: machine-drafted, unreviewed` — have a native speaker review it.

## Theme

A light/dark toggle follows the system setting by default; the visitor's choice is saved in `localStorage`. Design tokens are defined at the top of `style.css`.

## Rules

- Keep every `src`, `href` and `fetch` path relative. The site is served under the `/portfolio/` subpath, so a leading `/` breaks in production.
- Render content only with `textContent` (never `innerHTML`). Links from data pass through `safeUrl()`, which allows only `https:`, `mailto:` and in-page links.
- The animated background is decorative: a small 2D canvas drawn by `app.js`, with no library. It starts only on screens 768px and wider, and not when the visitor has reduced motion or data saver turned on.

## Files

```
index.html      main page (containers only)
case.html       case-study page (?id=)
app.js          renderer, i18n, theme, filters, contact form
style.css       design system, light/dark tokens
theme-init.js   applies the theme before first paint
data.json       all content
i18n/           en.json, pl.json
favicon.svg
content.js      GENERATED bundle for file:// previews (tools/build_content.py)
preview.bat     Windows: rebuild bundle + local server
blog*, blog/    legacy blog (hidden from navigation)
```
