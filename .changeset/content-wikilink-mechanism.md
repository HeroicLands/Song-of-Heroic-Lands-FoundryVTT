---
"sohl": minor
---

Resolve content cross-references into real Foundry links
([#1273](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1273)).

Cross-references between compendium documents did not work. They were authored as
relative file paths, which mean nothing to Foundry, so every link between a rules
page, a skill, a creature and a gear item resolved to nothing once compiled. Links
to a _section_ were broken twice over: the heading anchor was used as the journal
page's id, and a slug like `shock-state-index` is not a legal Foundry id at all.

Links are now authored by identity rather than by path, and compiled into Foundry
UUID links:

| Authored                                     | Compiled to                                        |
| -------------------------------------------- | -------------------------------------------------- |
| `[[Skills/climb\|Climbing]]`                 | `@UUID[Compendium.sohl.items.Item.<id>]{Climbing}` |
| `[[Rules/shock#shock-state-index\|the ...]]` | a link to that **page** of the entry               |

**What this means for a reader.** Every cross-reference in the rules, the user
guide, the bestiary and the item descriptions is now a working link, and a link to
a named section lands on that section rather than the top of the document. A
section is compiled as its own journal page, so it appears in the entry's page
list and can be linked to and navigated directly.

**For an author.** A link names a document by its content directory and shortcode
(`[[TLD/shortcode|Text]]`). Because no path is encoded, moving or renaming a note
no longer breaks anything that points at it. A heading becomes linkable by ending
it with `{#section-slug}`. Standard markdown link syntax remains correct for
external URLs. A link with no target is reported by the build and left as visible
text instead of being emitted silently.

Every content document now carries a shortcode, so anything can be linked to;
shortcodes are unique within their top-level directory.
