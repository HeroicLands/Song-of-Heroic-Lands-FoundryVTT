---
"sohl": patch
---

Restore the missing _Jar, glass, 1 pt._ container item, and make a missing document
id fail the pack build instead of silently dropping the document.

**The defect.** `Jar, glass, 1 pt.` carried an empty `id:` in its frontmatter, so the
items compiler skipped it. The item never reached the compendium while its knowledge-base
page and content still built normally, leaving no visible sign anything was wrong — the
build stayed green and reported success. The container pack shipped 43 items where it
should have had 44.

**The fix.** The jar is given a document id and now compiles. A missing `id` on an item
or an actor is now a build error naming the offending file, rather than a warning
followed by a silent skip. This matches the folder-id check, which already threw; items
and actors were the inconsistent cases.

A content file that cannot become a document is an authoring mistake, and the build
should say so at the point it happens rather than produce a quietly incomplete pack.

Closes #1325.
