# Bilingual navigation and interface follow-up

## Implemented

- Homepage departments now navigate to the complete catalog instead of filtering three featured cards. Search uses a normal GET form with shareable category/query URLs.
- English and Spanish use the same route-based category membership. Business Intelligence has its own category. Changing language preserves the selected category and query.
- Removed the public “Principio / No se inventan proyectos…” implementation note.
- Generated a lightweight catalog from the existing search index and original category pages: 34 entries per language, with specific images for every entry. Original card covers take priority; original-video posters avoid MP4 downloads; six projects without a chosen image use captures of their actual screen content. No synthetic evidence or new project claims were added.
- Restored the original three-row software carousel and its 29 tools on Home and About. It reuses the existing tool catalog/logo assets, with pause/resume, keyboard scrolling and reduced-motion support.
- Added GitHub/LinkedIn brand marks and consistent functional icons for contact, CV, role, focus, history and integrations.
- A shared presentation adapter brings legacy inner pages into the marketplace colors, typography and themes without rewriting their content or changing project imagery. Removed legacy gradient text that became illegible in light mode.
- Preserved the original creative gallery, including its filters and 3D section. Canvas-based cases and the interactive CV retain their live original documents rather than losing renderers/listeners through HTML cloning.
- Interactive documents expose their content before every video/model finishes loading. Large conversion videos use posters and wait for playback.
- Source links return to the matching bilingual catalog; PDF/object URLs resolve relative to their original location.

## Verification

- Automated ES/EN category parity and public image-response checks cover every catalog entry.
- All 74 original project pages passed text/media-count comparisons and mobile overflow checks during this follow-up. Additional targeted checks cover the preserved live chart pages, gallery filters and CV expand controls.
- The shell was checked at 390, 820, 1024 and 1440 pixels, with light/dark mode and bilingual navigation.
- Public home, case, About and contact accessibility checks reported no serious/critical violations; custom 404 and video-poster checks passed.
- The first public run caught a search-test race and a real delay waiting for iframe load. The test now waits for catalog readiness; the viewer initializes interactive content earlier.
- A direct public canvas check confirmed actual rendered chart pixels, not merely a canvas element.
- Final public reruns passed all seven navigation/interactive scenarios. Together with the 19 unchanged shell/media/accessibility scenarios, all 26 public scenarios passed across the final verification runs. The gallery sizing test waits for the expanded document before comparing the filtered height.

## Maintenance

Run `node scripts/build_market_catalog.cjs` against the local static server to rebuild catalog metadata and source-backed previews. Source copy and image choices remain in the original pages/search index; tool names and logo paths remain in `content/case-tools.json`.

## Hosting and constraints

- Existing Vercel project/domain retained; no Sites migration and no new Git commit.
- Preview protection stayed enabled. Authenticated Vercel requests returned HTTP 200 before promotion.
- Full conversion videos still depend on the existing Render origin. The original 3D experience retains its external Three.js imports and local GLB assets; loading those assets is separate from displaying the page content.
- No recurring monitoring or new third-party integrations were installed.

## Deploy result

- URL: https://matiasgaglio.vercel.app/
- Target/status: production / READY
- Deployment: `dpl_4VN1ukfTjFCCZXL8ikf83cWNptJP`
- Commit: working-tree deployment; no new commit
- Framework: static HTML/CSS/JavaScript
- Validated preview build: 645 ms
- Error scan: Vercel returned no runtime logs in the queried ten-minute window; this is not a substitute for browser/network checks.
- Drains: not inspected or changed
- Monitoring: finite regression checks completed; no ongoing monitor created
