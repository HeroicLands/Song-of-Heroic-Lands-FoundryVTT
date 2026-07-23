---
"sohl": minor
---

**Archetype-first Create dialog: default Name/Shortcode from the chosen archetype**

The **Create Actor / Create Item** dialog is now **archetype-first**. You choose
_what kind of thing_ (Type → SubType → Archetype) up front, and **Name** and
**Shortcode** follow as **optional** fields that default to the chosen archetype's
own name and shortcode. Starting from a template no longer discards its identity —
pick _Broadsword_ and confirm, and you get a "Broadsword" with shortcode `brdswd`,
not a generic "New Weapon".

- **Fields reordered and made optional.** The dialog lays out **Type → SubType →
  Archetype → Name → Shortcode**; Name and Shortcode are no longer required.
- **Live defaults from the archetype.** Selecting an archetype pre-fills Name and
  Shortcode from its `name` / `system.shortcode`, updating as the archetype
  selection changes; a field you type into is left alone. Blank means "use the
  archetype's".
- **(none) is unchanged.** The deliberate blank-slate choice still defaults Name to
  the class default and derives the Shortcode from the Name.
- **Uniqueness preserved.** A second document from the same archetype still
  auto-bumps its shortcode (`broadsword`, `broadsword2`, …).
- Works for **both** Item and Actor creation (both route through the shared create
  dialog). The identity-resolution rules are lifted into a Foundry-free,
  unit-tested helper (`sohl.entity.archetype.resolveCreateIdentity`).

Closes #643
