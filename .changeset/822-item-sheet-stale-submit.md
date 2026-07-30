---
"sohl": patch
---

**Sheets no longer surface the stale-submit "Document creation … is not supported" / "does not exist" error**

Deleting a document while its sheet is open — a world item, a Being, or an actor
whose deletion cascades to its embedded items' open sheets — no longer risks a
spurious red notification (_"Document creation from \_<Sheet> is not supported"_
for a world document, _"The Actor <id> does not exist in actors"_ for an embedded
one).

Every SoHL sheet submits on change, and Foundry deliberately still allows a form
submit while a sheet is _closing_ (so a field edit blurred on close still saves).
A `<prose-mirror>` (the Being facade's `system.appearance`, an item's
`system.notes` / description) commits its content on teardown, firing exactly
such a change — so closing a sheet whose document had just left its collection
dispatched a submit Foundry's base handler turned into an error. The shared sheet
mixin (`SohlDataModel.SheetMixin`, used by both the actor and item sheet
families) now walks to the document's root and skips a submit whose root has left
its world collection — the edit has nowhere to land, so it is silently dropped
instead of erroring. One implementation covers both sheet families and both the
world-document and embedded-document (actor-cascade) cases.

Closes #822
