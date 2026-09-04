---
"sohl": patch
---

_Item descriptions now live in the journals compendium, once._

An item note's prose compiles into that item's **item doc** — a JournalEntry in
the journals pack, in the same folder and under the same name as the item — and
the item's description becomes nothing but a link to it. The runtime already
treats a description that is only a link as a pointer and shows what it points
at, so **Display Description** posts the prose exactly as before.

**What this fixes.** Every actor carrying an item carried its own copy of that
item's description: 7.59 MB across the actors pack, of which only 133 KB was
distinct text — a duplication factor of 58. Fixing a typo in one item
description left 57 stale copies on a single character. The prose now exists in
one place, and every copy of it is a link to that place.

|                                             | Before  | After  |
| ------------------------------------------- | ------- | ------ |
| Embedded description across the actors pack | 7.59 MB | 391 KB |
| Actors pack                                 | 8.3 MB  | 2.8 MB |
| Items pack                                  | 1.4 MB  | 520 KB |
| Journals pack                               | 688 KB  | 1.7 MB |

**Nothing about actors changed.** The actors pass still embeds each item
wholesale; what it embeds is now a link. Nor did the authoring change: content is
still one Markdown file per item, and its body is still the description — only
where the build puts it has changed.

An item note's body splits into pages on its H1 headings, as a journal note's
does, and the description points at the first. A note with no headings — which is
every shipped item today — is a single page named after the item. An item with no
prose gets no entry and an empty description rather than a pointer to nothing.

Closes #1348.
