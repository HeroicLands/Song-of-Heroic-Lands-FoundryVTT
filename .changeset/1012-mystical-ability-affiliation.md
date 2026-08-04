---
"sohl": minor
---

**Associate a Mystical Ability with an Affiliation**

Some Mystical Abilities draw their standing from a **faction / Affiliation** — a
religion, an arcane or alchemical school, or an ancestor / totem / spirit — whose
membership confers an available area, level, circle, or capability separate from the
activating skill's own mastery level (Spirit Power, Ritual Action, Divine Incantation,
Arcane Incantation, Alchemy). A Mystical Ability can now record which Affiliation it
belongs to.

- **New `assocAffiliationCode` field** on the Mystical Ability, storing the
  associated Affiliation's shortcode (optional, `null` when unset — the same shape as
  `assocSkillCode`). `MysticalAbilityLogic` resolves it during `evaluate()` to the
  Affiliation's logic on the same actor, exposed as `assocAffiliation` (`undefined`
  when unset, off-actor, or unmatched).
- **Being sheet Affiliation column** — the Mystical Ability ledgers for the
  affiliation-bearing subtypes (Spirit Power, Ritual Action, Divine / Arcane
  Incantation, Alchemy) gain an **Affiliation** column, immediately after **Skill**,
  showing the associated Affiliation's name (or `✕` when none).
- **Mystical Ability sheet selector** — a new _Associated Affiliation_ control: a
  dropdown of the actor's Affiliations when the item is on an actor, or a free-text
  shortcode field when it is not (reusing the shared `shortcodeRefField` widget).

This is association plumbing only — it records the credential; it does not itself gate
or scale capability, and takes no automated action on a character.

Closes #1012
