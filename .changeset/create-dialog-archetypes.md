---
"sohl": minor
---

**Seed new Actors/Items from archetypes in the Create dialog**

The **Create Actor / Create Item** dialog now offers an **Archetype** picker, so a
new Being (or Item) is born from a populated template instead of a blank slate —
no more "import Basic Folk and rename." The dialog still exposes Name, Shortcode,
Type, and (where applicable) SubType; the new Archetype dropdown defaults to the
best-matching populated template and always includes **(none)** for the deliberate
blank-slate authoring case.

- **Data-driven archetypes.** Flag any Actor/Item — in a compendium pack or the
  world — with `flags.sohl.docArchetype = <priority:number>` and it appears in the
  picker for its `(type, subType)`. No code required. SoHL's stock **Basic Folk**
  ships flagged, so Create Actor → Being defaults to a fully-populated being.
- **Shortcode is identity.** Candidates are deduped by `system.shortcode` (name is
  presentation and may diverge/localize); the winner per shortcode is chosen by
  _priority desc, source tier asc (**world < system < module**), then a stable
  UUID_. A GM's world copy shadows a shipped archetype by tier alone; a module
  must ship `priority > 0` to override a stock archetype.
- **Foundry-free discovery/resolution helper** (`sohl.entity.archetype`) — the
  filter/dedup/winner rules are unit-tested independently of the dialog.
- **On confirm** an archetype is cloned from its `toObject()` (embedded documents
  included), cleaned like an import, and overlaid with the dialog's Name/Shortcode;
  `(type, shortcode)` uniqueness is resolved by `_preCreate` as before.
- **Instantiation strips the marker; copy-verbatim preserves it.**
  `flags.sohl.docArchetype` is removed when an archetype is _instantiated_ (the
  Create-dialog seed, and **drop-to-embed** onto an actor/item sheet) and kept when
  a document is copied as a library entry (**Import**, **Duplicate**) — the strip
  lives at those entry points, never in the universal `_preCreate`.

Closes #604
