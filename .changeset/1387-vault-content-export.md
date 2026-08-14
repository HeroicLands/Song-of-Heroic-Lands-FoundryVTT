---
"sohl": minor
---

Export SoHL content from the HeroicLands vault, and read `type-shortcode`
wikilinks
([#1387](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1387)).

Content authoring moves to the vault, so `assets/content/` becomes a **generated
artifact that is committed** — the same arrangement as `type-catalog.md`. The tree
stays in git deliberately: only the maintainer has a vault, so a build that reached
for one would work on exactly one machine. Contributors and CI build from the
committed tree and never need it.

The consequence is worth stating plainly, because nothing warns about it: **an edit
made to `assets/content/` in this repository is reverted by the next export.**
Content fixes belong in the vault; pipeline fixes belong in the exporter.

**The exporter.** `npm run content:export` mirrors the vault's `SoHL/` tree into
`assets/content/`; `npm run content:check` reports drift and changes nothing. The
mirror is authoritative — it retires what the vault no longer carries, so a note
deleted in the vault cannot linger here and keep compiling into the packs. The
vault's `Setting/` tree is never exported. `HEROICLANDS_VAULT` in `.env.local`
names the checkout.

**Wikilinks read `type-shortcode`.** Obsidian resolves `/` inside a wikilink as a
**path** against the vault's folders, so `[[doc/shock]]` is a broken link in the
editor where notes are now written. A hyphen qualifies only when what precedes it
is a known type — note names contain hyphens too (`Grukar-ahk`), and those keep
resolving as aliases — and the split is at the first hyphen, so a shortcode may
contain one. The `type/shortcode` form is still resolved, so nothing written before
the migration dies.

This mattered more than it looks. The pack resolver's alias index is scoped to the
_source_ note's type, so a hyphen link happened to resolve between two `doc` notes
and silently failed from every other type: 283 links, including every
`docskill-…` reference to an item's write-up, compiled to literal text.

**Two silent failures are now loud.** An absent or empty content tree used to
compile zero documents and _succeed_, shipping blank compendiums with nothing in
the log to say so, while `lint:packs` reported every one of nothing as uniquely
keyed. The pack build and that check now both fail on an empty tree, the export
refuses to mirror a vault that yielded no files, and `lint:rules-vtt` names the
missing tree instead of throwing a bare `ENOENT`.

**Content no longer in the system.** 145 creature notes and the twelve Astrokýklos
birthsign notes are authored in the vault's `Setting/` tree, which is not exported,
so they no longer compile into the compendiums. The birthsign **matrix** remains a
tested specification and the aptitude-combination logic it drives is unchanged.
