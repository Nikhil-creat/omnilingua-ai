# Contributing
1. `npm run verify` must pass (syntax check + unit tests, Node 20+).
2. Put pure logic in `js/lib.js` with a test in `tests/`. Keep UI code in `app.js` / `pro.js`.
3. No build step and no new runtime dependencies without a pinned CDN version.
