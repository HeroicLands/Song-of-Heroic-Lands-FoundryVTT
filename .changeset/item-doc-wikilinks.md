---
"sohl": patch
---

Address an item's documentation with a `doc<type>` wikilink
([#1362](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1362)).

Since an item's prose began compiling to its own JournalEntry, an item and its
documentation have been **two documents in two packs** with only one address
between them. A section link to an item note therefore compiled to a
`JournalEntryPage` id under the _items_ pack — a page id on a document that
cannot hold pages — and dead-ended. Nothing reported it: the anchor was really
declared in the target note, so the link checker passed it.

**Every item type gains a virtual `doc<type>` counterpart.**

| Wikilink                     | Addresses                                |
| ---------------------------- | ---------------------------------------- |
| `[[skill/wpnc]]`             | the Skill **Item**                       |
| `[[docskill/wpnc]]`          | that skill's **JournalEntry**            |
| `[[docskill/wpnc#crafting]]` | the `{#crafting}` **page** of that entry |

The qualifier is formed by prefix and never enumerated, so a type added tomorrow
is addressable the day it is authored. A real content type of the same name
always wins.

**An anchor on an Item, an Actor or a Macro is now a no-op.** A link to a
JournalEntry opens the journal, at its first page or at the page an anchor
names; a link to an Item or an Actor opens that document's _sheet_, not its
documentation, and a sheet has no sections to address. The anchor is therefore
dropped rather than turned into a page id the document can never hold.

**The knowledgebase reads the same link differently, by design.** There an item
note renders as one page which _is_ its documentation, so `doc<type>` and
`<type>` are aliases for the same URL and the anchor stays an ordinary in-page
anchor. One authored link, correct in both builds.

`makeId` moved to its own leaf module, `utils/packs/ids.mjs`, and is re-exported
from `helpers.mjs` for the passes that already reached it there. Link resolution
needs to derive an item doc's entry id, and `helpers.mjs` imports the link
resolver; a leaf with no local imports can be depended on from either side. The
derivation is unchanged — `itemDocEntryId("j33FxOHddwk3WYnE")` still yields
`b314163233099f73`, so no compiled id moves.
