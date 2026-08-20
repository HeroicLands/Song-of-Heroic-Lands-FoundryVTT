---
"sohl": minor
---

**One content type for actors: `character` and `creature` are now `being`.** Both
already compiled to a Foundry `being` actor and nothing in the toolchain branched
on which name a note declared — but the type is also a wikilink qualifier and a
published knowledgebase URL segment, so the split meant two addresses for one
kind of thing and an author had to know which one a target picked.

All 95 actor notes in this repository move: 91 in `Bestiary/Animal/` and 4 in
`Characters/`. The compiled actors pack is unchanged apart from the type — same
95 documents, same ids.

**Published URLs.** The two knowledgebase sections merge into one, so 95 pages
move from `/sohl/kb/creature/…` and `/sohl/kb/character/…` to `/sohl/kb/being/…`.
Every one of them redirects from the address it actually had, and the new
`/sohl/kb/being/` landing redirects from both retired section landings — nothing
that resolved before stops resolving.

Which of the two sections a page used to sit in is the one thing the retype
erases from a note, so it is derived from `sohl.kbcat`, the field that now
carries the distinction. The 91 bestiary notes already had one; the four under
`Characters/` gained theirs here. A being added _after_ the merge has no old URL
and correctly gets no redirect.

**Beings still show their profile sidebar.** The shared Hugo theme chose between
a character and a creature sidebar by branching on the retired type, so without
a matching change the panel would have vanished from every page while the build
stayed green. The two are now one presence-driven partial
(HeroicLands/heroiclands-hugo-theme#17).

Requires `@heroiclands/content-build` 0.4.0, which retires the two names and
reports a note or link left on either rather than quietly routing it to the items
pack (HeroicLands/content-build#5).

(Closes #1635.)
