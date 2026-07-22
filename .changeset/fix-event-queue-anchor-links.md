---
"sohl": patch
---

**Fix broken in-page anchor links in the Event Queue reference**

Two cross-references in `docs/reference/event-queue.md` pointed at anchors that
Hugo/GitHub never generate, so the links 404'd:

- The scene-region worked-example heading carried a trailing `(#593)`, which
  slugifies to `…-entering-593` — but both references (here and in
  `module-development.md`) linked `…-entering`. Dropped the `(#593)` suffix so
  the heading slug matches its links, consistent with the other cross-linked
  section headings, which omit the issue number.
- The two `[query]` links to _"7. Query the schedule"_ dropped the double hyphen
  the em-dash produces (`schedule--when`), so they resolved to nothing. Corrected
  the anchors.

Completes the "links resolve" acceptance of #608.
