---
"sohl": patch
---

Answer a real 404 for a knowledgebase address that does not exist (#1416).

An unknown path on `kb.heroiclands.org` returned **200** and served the landing page.
Cloudflare Pages falls back to the site root when a deployment carries no `404.html`,
and the knowledgebase build emitted none — neither the shared theme nor `kb/layouts/`
provided a template — so nothing about the response distinguished a missing page from a
real one.

A soft-404 fails in the direction that hides: every "does this URL resolve?" check
reports success, which is how eight URLs that resolve to nothing were counted as
resolving while measuring redirect coverage. Search engines index a soft-404 as a live
page, so retired content keeps its listing, and a reader following a stale link is
handed the front page rather than being told the page is gone.

`kb/layouts/404.html` now renders a "Page not found" page through the usual site chrome
— it names the address that failed and offers the routes back (home, developer
documentation, user guide, rules) — and Pages serves that file with a genuine 404
status. The deploy workflow asserts the artifact exists before publishing, since the
absence of a 404 page is invisible until someone follows a broken link.
