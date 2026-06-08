# Clemit Family Hub
Cloudflare Worker + D1 backing family.clemits.com.
Connected to GitHub: every push to main auto-deploys via Cloudflare Workers Builds.
- src/index.js  — the worker (serves the app + JSON API)
- wrangler.jsonc — config + D1 binding (DB -> clemit-family-db)
