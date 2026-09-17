# Amazon-inspired portfolio application

This directory contains the screen-native application served as the public Vercel experience. The legacy pages remain available as content sources and media archives.

## Page system

- `index.html`: marketplace search/results homepage, using the selected production case copy and images.
- `case-amazon-growth.html`: Seller Central-style operating workspace for the flagship case.
- `about.html`: Amazon “Your Account” logic translated into a professional profile.
- `catalog.html`: searchable work inventory built from `../search-index.json`.
- `contact.html`: customer-service-inspired professional contact flow.
- `page.html`: migration shell that preserves existing page content and media while bespoke page types are developed.
- `styles.css`: shared responsive interface and reduced-motion-aware animation system.
- `script.js`: loading/reveal motion, search, filters, navigation, gallery and accessible tabs.
- `catalog.js` / `viewer.js`: content catalogue and safe local content migration.

## Amazon ecosystem mapping

- Homepage → marketplace search and results
- Case studies → Seller Central workspaces
- About → Your Account / professional account
- Creative work → Brand Store inventory
- Ecommerce → Manage Inventory and business reports
- Research → Brand Analytics / Customer Insights
- Other projects → integrations catalogue
- Contact → help and contact center

No Amazon logo, fake ratings, cart, prices, reviews, checkout or affiliation claims are used. The visual reference is the operational logic of a screen product, not an impersonation.

## Run locally

Serve the repository root so existing content and selected media resolve:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/prototype-amazon/`.
