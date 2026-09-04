---
"sohl": patch
---

Move the Create-dialog archetype marker from `flags.sohl.docArchetype` into the
schema as `system.archetype`, and give it a sheet control (#1780).

**Why** — an archetype is a populated document the Create dialog offers to clone
from (#604), and marking one was a flag. Foundry ships no flag editor, so the
only way to mark a document in-app was to export it, hand-edit the JSON and
re-import — for a feature whose whole purpose is to spare people that kind of
workaround.

**The field** — `archetype: new NumberField({ nullable: true, integer: true,
initial: null })`, declared once on the shared base (`defineSohlDataSchema`), so
it reaches every Actor, Item and Combatant subtype and appears in the published
`schema.json`.

**The tri-state is unchanged**, only its address: a **number** marks the document
as an archetype _at that priority_, and `null` means it is not one. `0` is a real
priority — SoHL's own archetypes ship at it — so readers test
`typeof v === "number"`, never truthiness. Discovery filters for a number, and
`null` fails that exactly as an absent flag did; instantiating from an archetype
(the Create dialog seed, drop-to-embed) now writes `system.archetype = null`
rather than deleting a flag, while Import and Duplicate still preserve it.

**The sheet control** — every Actor and Item sheet header now carries a GM-only
**Archetype Priority** field bound to `system.archetype`; a blank box is `null`.
The Being sheet renders its identity as text, so the control lives in the
header's identity dialog beside Name and Shortcode.

**Nothing to migrate.** The flag was created at build time from markdown
frontmatter, never authored in a world and never committed to a pack, so there is
no `migrateData` and no transitional release reading both spellings. The authored
frontmatter is unchanged; only the emission target moves, which is
HeroicLands/package-build#126 — that must land, and be adopted here, before the
next release, or the shipped compendium archetypes will not be discovered.
