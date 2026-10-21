# After Mission

An independent student-built, point-and-click museum exploring human-made equipment left on the Moon and Mars. Project concept for NASA Space Apps Challenge 2026, NIT Raipur.
*This is not an official NASA website and is not endorsed by NASA.

Visual direction
After Mission presents a dreamlike, illustrated space storybook: atmospheric Moon and Mars landscapes, a field-scientist guide, scroll-responsive transitions, and artifact records styled like travel-journal pages. The interface is poetic; scientific claims remain tied to cited primary sources.\n\n## Current prototype

- Illustrated spacecraft-arrival opening scene.
- Scientist guide and destination selection.
- Moon and Mars landscape scenes.
- Clickable artifact markers, arrow/keyboard navigation and research panels.
- Source links attached to each initial artifact record.
- Privacy policy and terms pages included as drafts.

## Run locally

Open `index.html` in a modern browser. No build step or API key is required for the current prototype. For a local web server, run `python -m http.server 8000` in this directory and visit `http://localhost:8000`.

## GitHub Pages

In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, then save. The project should not be announced as launch-ready until the review gates below have been completed. A public repository and an enabled Pages setting can make files publicly accessible; coordinate the legal-page review before enabling a public site.

## Data and scientific accuracy

The initial records are a small prototype collection, not a complete inventory of all NASA-launched or human-made equipment on the Moon and Mars. Some entries provide broader mission context and explicitly identify non-NASA equipment. Do not describe the catalogue as exhaustive.

Every new record should include:
- A stable ID, official name and associated mission.
- Verified launch and landing/deployment dates where available.
- Mission purpose and documented outcome.
- Clear distinctions between intentionally discarded hardware, failed missions and equipment whose status is uncertain.
- Primary-source links and a record verification date.
- Appropriate image credits and reuse checks.

Preferred research starting points:
- [NASA NSSDCA Master Catalog](https://nssdc.gsfc.nasa.gov/planetary/projectdata.html)
- [NASA Open APIs](https://api.nasa.gov/)
- [NASA Image and Video Library](https://images.nasa.gov/)
- [NASA](https://www.nasa.gov/)

## Project files

- `index.html`: game scenes and semantic structure.
- `styles.css`: responsive scene styling and original CSS illustrations.
- `app.js`: game flow, artifact data and interactions.
- `privacy.html`: privacy policy draft.
- `terms.html`: terms and conditions draft.

## Launch gates

Do not call the site launched until the team has:
1. Reviewed and finalized the privacy policy and terms, including a suitable project contact method.
2. Audited actual hosting behaviour, external requests and any third-party resources against the privacy policy.
3. Verified every date, status claim and source link.
4. Checked all assets for rights, licence and attribution requirements.
5. Tested keyboard operation, mobile layout, accessibility, broken links and the deployed GitHub Pages URL.
6. Confirmed that no secrets or unnecessary personal information are present in the repository.

## Credits and disclaimer

NASA mission facts and linked NASA materials are credited at the relevant exhibit. Each image's rights and attribution must be checked individually before reuse. This independent project does not imply NASA endorsement.
