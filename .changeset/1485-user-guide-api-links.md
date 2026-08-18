---
"sohl": patch
---

**Every API link in the user guide points at a page that exists again.** 71 links
across 14 notes named `api.heroiclands.org`, a hostname withdrawn when the
documentation consolidated under `/sohl/` — so they failed at DNS, with no
redirect to follow, both in the knowledgebase and in the compiled Foundry
journals.

Two drifts had landed on the same links and the second hid the first: every one
also kept a `/main/` or `/latest/` segment, which the API site stopped publishing
when it became a single unversioned tree, so they were already 404ing before the
host went away. Repointing the host alone would have moved a dead link rather
than fixed it; both segments are dropped, and `.html` with them, since the
extensionless page is a direct 200 where `.html` costs a redirect hop.

Two of the links additionally named `API_Reference.SafeExpression`, a symbol path
from a TypeDoc layout the project no longer uses; they now name the class's
current page. All 71 addresses — page **and** `#anchor` — were checked against
the published API index, and every distinct page fetched: all resolve.

**The same rot now fails the build.** An absolute URL is opaque to the wikilink
checks in `lint:content-links`, which is why 71 of these could ship unremarked.
That guard now also rejects a link to any hostname the project has retired
(`utils/retired-hosts.mjs` is the list), printing the working address for each
one it finds.

(Closes #1485.)
