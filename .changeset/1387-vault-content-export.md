---
"sohl": minor
---

Read `type-shortcode` wikilinks
([#1387](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1387)).

**Wikilinks read `type-shortcode`.** A hyphen qualifies only when what precedes it
is a known type — note names contain hyphens too (`Grukar-ahk`), so a target that
is one is reported as not being an address rather than split at an arbitrary place
— and the split is at the first hyphen, so a shortcode may contain one. The
`type/shortcode` form is still resolved, so nothing written before the migration
dies.

This mattered more than it looks. The pack resolver's alias index was scoped to the
_source_ note's type, so a hyphen link happened to resolve between two `doc` notes
and silently failed from every other type: 283 links, including every
`docskill-…` reference to an item's write-up, compiled to literal text.

**Two silent failures are now loud.** An absent or empty content tree used to
compile zero documents and _succeed_, shipping blank compendiums with nothing in
the log to say so, while `lint:packs` reported every one of nothing as uniquely
keyed. The pack build and that check now both fail on an empty tree, and
`lint:rules-vtt` names the missing tree instead of throwing a bare `ENOENT`.

**Content no longer in the system.** 145 creature notes and the twelve Astrokýklos
birthsign notes belong to the `thalorna` package, so they no longer compile into
this system's compendiums. The birthsign **matrix** remains a tested specification
and the aptitude-combination logic it drives is unchanged.
