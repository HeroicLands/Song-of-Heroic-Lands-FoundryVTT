---
"sohl": patch
---

**The knowledgebase Beings section renders a catalog table again.**
`/sohl/kb/being/` fell back to Hugo's default list layout — 95 beings as a plain
list of links — because `kb/layouts/kb/` still held a `list.html` for each of the
two types #1580 merged, `character` and `creature`, and none for `being`. Nothing
routes to a retired type, so both were dead files while the section that replaced
them had no layout at all.

`kb/layouts/kb/being/list.html` now groups beings by `sohl.kbcat` — Archetypes,
NPCs, then Animals — through the same `kbcat-groups.html` partial every other
multi-category section uses, and the two retired layouts are deleted.

Neither retired layout could simply be renamed. One was a flat table with
character-only columns; the other grouped by source subfolder, which for the
merged type would have re-created the very character/creature split #1580
removed. Both also rendered a _fixed_ nine-attribute block, which a being does not
have: an animal carries Scent where a person carries Dexterity, and only people
carry the social attributes. So the attribute columns are now derived — their
order from the `attribute` pages' own `sort`, their membership from what each
group's beings actually populate — and Occupation and Class appear only for a
group whose beings carry a `social` block. Adding an attribute, or a being that
uses one nothing else does, needs no further change here.

_Layouts only._ No content, schema, or compiled pack changes; the knowledgebase
build renders exactly one page differently.

(Closes #1762.)
