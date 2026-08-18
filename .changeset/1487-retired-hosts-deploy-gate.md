---
"sohl": patch
---

**The published API documentation no longer offers hostnames that do not resolve.**

`/sohl/api/` linked `kb.heroiclands.org` and `api.heroiclands.org` from its
header dropdown and its landing prose — five dead ends on the canonical surface,
each failing at DNS with no redirect to follow. The addresses were corrected on
`main`, but the API documentation is rebuilt from the newest _release tag_, and
that tag predates the correction, so every deploy reproduced them.

The site assembler now closes both halves of that. It repoints a retired-host
link in the API tree — whose source cannot be corrected after the tag is cut —
and takes a replacement **only when the page it names is present in the tree it
has just assembled**, so a repair is verified rather than guessed. That matters
here: the old landing linked the developer docs without their section segment,
so swapping the host alone would have resolved at DNS and then 404ed. It then
reads every rendered page and **fails the build** on any `href` or `src` still
addressing a withdrawn host, which is what stops the next release reintroducing
one. Prose that merely names a retired host is left alone — the developer docs
explain the move, and saying so is not a dead end.

Closes #1487.
