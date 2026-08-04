---
"sohl": minor
---

**Rename the `shamanicrite` Mystical Ability subtype to `spiritrite`**

The spirit-realm rite subtype is renamed from **Shamanic Rite** (`shamanicrite`)
to **Spirit Rite** (`spiritrite`). The rite is not the exclusive province of
shamans — it is available to anyone attuned to the spirit realm — so the broader
name better reflects who may perform it.

- The `MYSTICALABILITY_SUBTYPE` value changes from `"shamanicrite"` to
  `"spiritrite"`, and its enum key from `SHAMANICRITE` to `SPIRITRITE`.
- The English labels (`SOHL.MysticalAbility.SubType.spiritrite` /
  `SOHL.MysticalAbility.Category.spiritrite`) now read **Spirit Rite**.
- Mechanics are unchanged: like `spiritaction`, a Spirit Rite is still governed
  by an associated **Spirit Power** rather than a skill.

Pre-beta with no existing worlds, so no data migration is required.
