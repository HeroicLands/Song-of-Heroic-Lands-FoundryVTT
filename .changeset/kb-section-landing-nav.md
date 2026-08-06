---
"sohl": patch
---

**Knowledgebase navigation** — a section landing can no longer hide its own
pages (#1115).

The section template only listed child pages when the landing had _no_ body, so
authoring an introduction silently replaced the section's only navigation. The
user guide had 41 pages with 1 of them linked, leaving 40 reachable only by
guessing a URL. Hand-curated indexes had also drifted: Rules linked 27 of its 28
pages.

The list is now a **gap-filler** — a landing with a body lists only the pages
that body does not already link:

| Landing               | Before           | After                    |
| --------------------- | ---------------- | ------------------------ |
| Curated and complete  | list suppressed  | nothing extra shown      |
| Curated, page missing | page unreachable | the missing page appears |
| No body               | full list        | full list, unchanged     |

This keeps editorial groupings intact — Rules' "Key Concepts" section is exactly
the kind of curation no hierarchy can infer — while making an unreachable page
impossible. A newly added page shows up under the landing until someone files it
into the curated index.
