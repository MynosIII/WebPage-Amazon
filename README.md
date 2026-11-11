# Matías Gaglio portfolio

The public portfolio is <https://matiasgaglio.vercel.app>. Vercel builds the `main` branch of `MynosIII/WebPage-Amazon` for production and uses `vercel.json` to route visitors to the marketplace interface. Absolute URLs come from one setting: `SITE_URL` (default `https://matiasgaglio.vercel.app`, see `scripts/site_config.py`). To move to a custom domain, set `SITE_URL` in the Vercel project's environment variables and redeploy; `build_deploy.cjs` rewrites canonicals, hreflang, Open Graph URLs and the sitemap. The legacy Render site only redirects here (see below).

## Site architecture

- `/`, `/about.html`, `/catalog.html` and `/contact.html` serve the Spanish hubs from `prototype-amazon/`. Their English versions (`/index-en.html`, `/about-en.html`, `/catalog-en.html`, `/contact-en.html`) are prerendered by `node scripts/build_english_hubs.cjs` from the Spanish source and the `i18n.js` glossary; never edit the `-en` hub files directly. Old `?lang=en` hub links redirect to them, and `/index-es.html` redirects to `/`.
- `scripts/apply_global_nav.py` gives every legacy page the shared header from `scripts/shared_nav.py`; `scripts/sync_department_nav.py` keeps the static search scopes and department menus in line with `script.js`.
- `scripts/build_catalog_thumbs.py` makes the 480/800 px WebP catalog thumbnails in `assets/catalog-thumbs/`. Run it (with `--force` when replacing an image) after changing a catalog image.
- `content/homepage.json` is the bilingual content source for all three homepage files; the homepage combines three evidence-led flagship cases with a portfolio shortcut rail, an early searchable portfolio map, and a secondary Analytical Translator interaction.
- `content/project-claims.json` is the credibility source of truth for every public metric, period, baseline, contribution, source, approved claim, and evidence note in the flagship and Daizzy cases.
- `content/case-tools.json` maps software aliases to case badges and search keywords. `scripts/sync_case_tools.py` automatically adds every tool mentioned in a case's Spanish or English HTML while preserving explicit assignments for tools that are not named in public copy.
- `content/case-studies.json` and `templates/case-study.html` generate the standardized Case 1, Case 2, Case 3, and Daizzy pages.
- `content/about.json` and `templates/about.html` generate the recruiter-focused professional story.
- `templates/homepage.html`, `home.css`, and `home.js` contain the shared homepage structure, visual system, and interaction behavior.
- `scripts/build_homepages.py` generates the committed homepage HTML. Generated files should never be edited directly.
- `scripts/resume_content.py` is the shared source for the interactive HTML resume and printable PDFs. `scripts/build_cv_pages.py` generates `cv.html`, `cv-es.html`, and `cv-en.html`; `scripts/build_resumes.py` generates the downloadable PDFs in `output/pdf/`.
- Additional case-study pages remain static HTML and use `style.css` plus `accessibility.js` while they are progressively migrated to shared templates.
- `language-catalog.json` defines the 40 Spanish/English page pairs. `scripts/apply_legacy_translation_fixes.py` preserves the reviewed legacy glossary, while `scripts/validate_localization.py` checks language declarations, reciprocal `hreflang`, encoding, and banned literal translations.
- The public sitemap is `prototype-amazon/sitemap.xml` (served at `/sitemap.xml`), written by `scripts/build_catalog_static.py`; `build_deploy.cjs` adds `lastmod` dates from Git history when the build has full history.

## Preview and release

Run `python scripts/serve_deploy.py` and open <http://127.0.0.1:4174> to exercise the public routing locally. The plain HTTP server below is useful for editing and testing the source pages.

Before merging, run the Site quality workflow and verify the Vercel preview. The Playwright `deploy` project covers the public aliases, catalog, language switch, cases, contact, CV and 404. To run it against an accessible preview, set `PLAYWRIGHT_BASE_URL` to that deployment URL and run `npm test -- --project=deploy`. Lighthouse uses the public routes served by the local preview script.

Vercel and the local deployment server both run `node scripts/build_deploy.cjs`. It packages the site into `portfolio-dist/`, adds production discovery metadata to the bilingual case pages, and renders the conversion video writeups and players from the existing case data. The catalog generator maintains the public sitemap and the redirects from legacy viewer links.

After release, repeat the public smoke checks on the production domain and verify that the case videos play and seek. Keep the previous production deployment ID available for rollback.

## Local source preview

Python is sufficient for the website itself:

```bash
python -m http.server 8000
```

Open <http://localhost:8000>. For image generation, install Pillow. Browser regression tests additionally require Node.js 22 and Chromium:

```bash
python -m pip install Pillow==11.3.0
npm install
npx playwright install chromium
npm test
```

## Editing and validation

After changing homepage content or its template:

```bash
python scripts/generate_home_assets.py
python scripts/build_homepages.py
python scripts/build_case_studies.py
python scripts/build_about_pages.py
python scripts/build_cv_pages.py
python scripts/sync_case_tools.py
python scripts/sync_ecommerce_claims.py
python scripts/apply_legacy_translation_fixes.py
python scripts/generate_sitemap.py
python scripts/validate_site.py
```

Before publishing, also run:

```bash
python scripts/build_homepages.py --check
python scripts/build_case_studies.py --check
python scripts/build_about_pages.py --check
python scripts/build_cv_pages.py --check
python scripts/sync_case_tools.py --check
python scripts/sync_ecommerce_claims.py --check
python scripts/apply_legacy_translation_fixes.py --check
python scripts/validate_localization.py
python scripts/validate_project_claims.py
python scripts/generate_sitemap.py --check
python scripts/add_image_dimensions.py --check
npm run validate:html
npm test
npm run lighthouse
```

To regenerate the resumes, install ReportLab and run `python scripts/build_resumes.py`. Render both PDFs to PNG before committing and inspect them for clipping or overflow. `scripts/normalize_site.py` maintains canonical, hreflang, social, favicon, AOS, and footer conventions on legacy pages. It intentionally excludes generated pages. `scripts/add_image_dimensions.py` adds intrinsic dimensions to local raster images without reformatting the surrounding HTML.

GitHub Actions repeats link/casing/metadata validation, responsive checks at 390, 820, 1024, and 1440 px, automated accessibility checks, screenshots, and Lighthouse budgets on every pull request.

## Legacy Render site

`matiasgaglio.onrender.com` (repository `MynosIII/WebPage`) is retired. Its `render.yaml` now only redirects every path to the same path on the Vercel site with a 301, so old links and search results land on the current pages. The `render.yaml` in this repository is kept for reference only and is not deployed.

`build_deploy.cjs` leaves out files that `vercel.json` always redirects or rewrites (legacy unsuffixed duplicates and the old root homepages) along with repository config files, so they can't be served by accident.

## Asset policy

Commit optimized page images with explicit dimensions and use responsive WebP sources for homepage media. Source documents, spreadsheets, downloaded third-party webpages, and editable production assets belong in the private source archive—not this public deploy repository.

The existing large showcase videos are intentionally unchanged for now because migrating already-published video payloads requires a confirmed object-storage/CDN destination or a coordinated Git LFS rollout. New large binary media should not be added directly to Git history.
