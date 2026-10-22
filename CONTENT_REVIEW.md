# Content review

## Catalogue retained

All 23 original records and their source URLs remain in `app.js`. Records were not removed or replaced with examples.

Moon: Apollo Lunar Module descent stage; Luna 16 descent stage; Lunar Roving Vehicle; Apollo scientific experiment packages (ALSEP); Apollo flags and flag assemblies; Apollo geology tools; Apollo commemorative plaques; Lunokhod 1 / Luna 17; Lunokhod 2 / Luna 21; Surveyor landers; laser retroreflector arrays; Apollo lunar-module ascent stages.

Mars: Sojourner; Spirit; Curiosity landing hardware; Perseverance landing hardware; Ingenuity; Opportunity; Phoenix; Viking 1 and 2 landers; Pathfinder lander and airbags; Mars 3 lander; InSight.

## Presentation changes

Dossiers retain the catalogue history, mission dates, purpose and outcome, and now add record-specific engineering context, a supported significance note, a selected evidence correction or notable detail, and contextual fictional dialogue. Notes are omitted where the available record does not support them. The year index and both games draw from the same catalogue; source links are displayed with their explanations. Mission Matchmaker uses each record’s mission association.

## Sources preserved

All existing per-record source labels and URLs were retained. Additional direct NASA/JPL references were added for ALSEP, Apollo flags and plaques, lunar retroreflectors, the Apollo LRV, Sojourner, Viking, and Mars 3. Sources include NASA mission pages, NASA NSSDCA mission catalog entries, NASA Science resources, the Apollo Lunar Surface Journal and NASA Astromaterials 3D. This pass opened selected primary NASA/JPL references while revising specific records, but did not independently open or verify every linked source or every historical claim.

## Claims needing further verification

- Every historical date, duration, mission status and physical-location statement needs a source-by-source editorial review before describing the archive as fully verified.
- The new engineering notes were reviewed against catalogue records and selected linked NASA/JPL pages, but have not all received a line-by-line source audit.
- Timeline year extraction reflects dates already present in the catalogue text; entries may include launch rather than landing/deployment year. Treat the display as a year-ordered index, not a definitive event chronology.
- Mars 3's exact location and condition remain explicitly uncertain in its record.
- Apollo ascent-stage outcomes and present condition vary by mission; the catalogue already marks some outcomes uncertain.
- Some records aggregate families of equipment or multiple missions. Their individual hardware histories differ.

## Missing information and intentional omissions

- No new fact sheet was written for every individual component in aggregated records where the existing evidence is not item-specific.
- No exact geographic coordinates or precise map positions were added.
- No unsupported rarity, scientific classification, or numerical comparison metrics were added.
- No claim is made that all record details, external assets, image rights or legal text have been independently reviewed.

## Experience audit updates

- Replaced shared category boilerplate and repeated character quips with record-specific engineering explanations, significance notes, evidence corrections, and fictional dialogue for all 23 dossiers. Where no reliable correction or detail was supported by the linked sources, that section is omitted.
- Changed the outcome label so impactors and retired hardware are not described as objects that all remain on site. Corrected Apollo ascent-stage outcomes using NASA's lunar artifact compilation: Apollo 12, 14, 15, and 17 stages were deliberately impacted near their landing sites; Apollo 11 and 16 were left in lunar orbit and later impacted at unknown locations.
- Added more direct NASA/JPL sources for ALSEP, flags, plaques, retroreflectors, Viking, Sojourner, Apollo LRV, and Mars 3 candidate hardware. The existing source URLs remain.
- Reworked game feedback to include the correct record, a record-specific field note, source links, and a direct dossier action. Both games retain a visible skip path.
- Renamed the timeline control to a year index because the current data are record-level years, not a complete list of historical events. The modal now explains that launch, landing, deployment, or multi-year mission years are preserved as written.
- Fixed opening-card styling that was overridden by later stylesheets, removed the delayed entrance and pulsing action button so Skip is visible and calm from first paint, and added a short reduced-motion-aware panel transition.
- Fixed dossier close focus so archive-opened records return focus to their landscape marker rather than a hidden archive card.

## Experience validation limits

The application was audited by reading the actual catalogue, rendering logic, interaction handlers, and CSS. JavaScript syntax and record/note coverage were checked. Browser click-through was not possible in this environment because the browser policy blocked loading a local file URL and disallowed workarounds for that action. A final hands-on visual pass should still be performed in a normal browser, including narrow mobile widths and reduced-motion mode.
