# After Mission

An independent student-built, frontend-only space heritage comic and archive about documented human-made objects left on the Moon and Mars. Project concept: NASA Space Apps Challenge 2026, NIT Raipur. This is not an official NASA website and is not endorsed by NASA.

## Run locally

Open `index.html` in a modern browser, or run `python -m http.server 8000` in this folder and visit `http://localhost:8000`. No build step, server-side code, account or API key is required.

## Experience

The opening is a three-panel, user-controlled prologue. Use **Next panel**, **Back**, or the left/right arrow keys. **Skip story** takes visitors directly into the museum. The Moon, Rover and Satellite are fictional narrators; their dialogue is not historical quotation. Reduced-motion preferences disable the added character idle animations.

The archive contains optional Artifact Detective and Mission Matchmaker activities, a source-linked year index and a side-by-side comparison view. Visitors can close or skip these tools and explore the records directly. The year index reuses dates already present in catalogue records and explains that a year may describe launch, landing, deployment or a multi-year mission; it is not a complete event chronology.

## Catalogue and evidence

The catalogue in `app.js` retains 23 records. It is a selected collection, not an exhaustive inventory of all human-made objects on the Moon and Mars. Each record carries its mission, history, launch wording, purpose, status and source links. Dossiers distinguish planned discard, retired equipment, failed arrival and uncertain condition, and avoid adding hardware details the cited record does not support.

Dialogue is original fiction attached to documented context. It is not a historical quotation. Keep new claims tied to authoritative sources, use only the date precision supported by those sources, and check image rights and attribution individually.

The experience review and known verification limits are in [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md). Every historical date, status claim, source link, external asset and legal draft still needs the appropriate editorial and launch review before the site is described as fully verified or launch-ready.

## GitHub Pages

The repository includes a Pages deployment workflow. To publish from a branch instead, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. A public repository and enabled Pages setting make files publicly accessible; review the privacy policy and terms before public launch.

## Project files

- `index.html` — scenes, comic opening, archive and learning-tool dialog.
- `styles.css` — responsive scene styling, illustrations and motion rules.
- `app.js` — catalogue, navigation, dossiers, discovery storage and optional activities.
- `CONTENT_REVIEW.md` — content changes and remaining evidence-review notes.
- `privacy.html`, `terms.html` — existing legal drafts.

NASA mission facts and linked NASA materials are credited in the relevant records. Each image's rights and attribution should be checked individually. This independent project does not imply NASA endorsement.
