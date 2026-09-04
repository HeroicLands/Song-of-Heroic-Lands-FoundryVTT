---
"sohl": patch
---

**An Affiliation can now record how its organization stands toward others.**
An affiliation described only a character's position _inside_ one body, so
cross-faction standing — a syndicate member met by a guild reeve, a priest before
a rival shrine, two houses in open rivalry — had nowhere to live but the GM's
memory, and nothing could consult it.

- **New `relation` table**, keyed by another affiliation's shortcode, with one of
  four standings: **aligned**, **unaligned**, **rival**, **nemesis**. Only
  non-neutral relations need authoring — an unlisted affiliation reads as
  `unaligned`, so an empty table means neutral toward everyone.
- **`AffiliationLogic.standingWith(shortcode)`** is the stable seam to read it,
  answering `unaligned` for anything unrecorded.
- **Edited on the affiliation's Properties tab.** _Add Relation_ prompts for the
  other affiliation — picked from the character's own affiliations, or entered by
  shortcode on a world/compendium item — and its standing; each row's standing is
  a live control, and the trash icon returns that pair to neutral. A recorded
  shortcode that resolves to nothing is shown flagged rather than dropped.
- **Authorable in content** via a `relation` map in an affiliation's frontmatter;
  an unknown standing is a build error rather than a silently neutralized one.

This records and reports a relationship; it never acts on one. Nothing is rolled
or applied because two bodies are hostile, and any later use of the standing stays
behind a human trigger. Overarching groupings (a pantheon, an arcane tradition)
need no new field: author the grouping as an affiliation in its own right and let
its members name it, so a member can be aligned with the pantheon and the nemesis
of another god within it.

(Closes #1404.)
