---
"sohl": patch
---

**The knowledgebase landings stop dumping the corpus under the reading path** (#1322)

`/rules/` ended with a heading reading _All Rules pages_ and a flat list of **59**
pages — most of the corpus, piled underneath the carefully ordered chapter list it
was supposed to complement. `/user-guide/` did the same with 14. Both read as though
the curated reading order above them were incomplete.

The list is a gap-filler, added so that authoring a landing body could never silently
orphan a page. It stayed; only its idea of "reached" was wrong.

- _Reachability is now transitive._ Both corpora are hierarchies — the rules landing
  links ten chapter introductions and each of those links its own pages, up to four
  hops deep (root → Trauma → Body → Injury → Bleeding). Testing only what the landing
  linked **directly** counted every page below the first hop as a leftover. A page now
  counts as reached when the body links it, or when any page already reached links it:
  the same rule `utils/check-content-links.mjs` enforces for these corpora.
- _A link with a fragment counts._ The match demanded a closing quote immediately
  after the URL, so the rules landing's own link to the Characters chapter
  (`…/characters-introduction/#body-structure`) did not register and that chapter read
  as unlinked. Every `RelPermalink` ends in a slash, so dropping the closing quote
  cannot bleed into a sibling.
- _The heading says what the list is._ What survives a transitive walk is genuinely
  unreachable by reading, so the heading is now **Orphaned Pages** rather than a claim
  to be the section's full contents. Both curated landings now show none of it.
- _A curated landing no longer says "Nothing here yet."_ That is the right answer for
  an empty auto-listed section and the wrong one for a landing whose hierarchy covers
  everything — `/dev-docs/` had been printing it under a complete index.

Verified by building the whole site before and after: exactly three pages differ —
`/rules/`, `/user-guide/`, and `/dev-docs/` — and every other page is byte-identical.
A page nothing links to still surfaces under _Orphaned Pages_.

Closes #1322
