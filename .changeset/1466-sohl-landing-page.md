---
"sohl": patch
---

**`/sohl/` has a landing page written for the reader who has already arrived.**
It is the address the site's navigation, the system's in-app help, and every
external link to the project use, and what stood there was a placeholder carried
over from the deploy that created it (#1470).

It leads with **how to install the system** — the manifest URL, pasted into
Foundry's _Game Systems → Install System_ — because that is the one thing no
other page gives concretely, and the project page still says the system is not
packaged.

Below it, three doors chosen by **what a reader came to do** rather than by which
surface happens to publish the answer, since someone at the table should not have
to know that the rules live on the knowledgebase and the API reference does not:

- _At the table_ — the user guide, the rules, the quickstart, character creation.
- _What it ships with_ — the catalog of creatures, gear, skills, afflictions.
- _Building on it_ — the developer docs, the API reference, extension points.

Deliberately **not** a second copy of the site's front page, which already
carries Knowledgebase and API cards, nor of the project page, which pitches the
system to someone still deciding.

Both landing pages now resolve their artwork through the shared theme's
`cdn-url.html` against `params.cdnBaseURL`, so **no layout in this repository
names a host**. The knowledgebase landing renders byte-identically across that
change.
