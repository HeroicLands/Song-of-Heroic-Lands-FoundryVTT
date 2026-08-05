---
"sohl": minor
---

**Associate a Mystery with an Affiliation**

A Mystery is often conferred by a **faction / Affiliation** — a religion, an arcane or
alchemical school, an ancestor / totem / spirit — the same way a Mystical Ability
draws its standing from one. A Mystery can now record which Affiliation it belongs
to, so a Piety or Grace pool says where it comes from.

- **New `assocAffiliationCode` field** on the Mystery, storing the associated
  Affiliation's shortcode (optional, `null` when unset — the same shape as
  `assocSkillCode`). `MysteryLogic` resolves it during `evaluate()` to the
  Affiliation's logic on the same actor, exposed as `affiliation` (`undefined` when
  unset, off-actor, or unmatched).
- **Mystery sheet selector** — a new _Associated Affiliation_ control: a dropdown of
  the actor's Affiliations when the item is on an actor, or a free-text shortcode
  field when it is not (reusing the shared `shortcodeRefField` widget).
- **Being sheet Affiliation column** — the Mysteries tab's mystery ledger gains an
  **Affiliation** column, immediately after **Skill**, showing the associated
  Affiliation's name.

This is association plumbing only — it records the credential; it does not itself gate
or scale capability, and takes no automated action on a character.

Closes #1076
