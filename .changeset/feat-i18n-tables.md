---
"sohl": patch
---

**Fix #70:** Move hardcoded English `FATE_DESC_TABLE` and `STANDARD_SUCCESS_VALUE_TABLE` entries to i18n.

Both tables previously used module-level constants with static English strings. They are now getter functions (`getFateDescTable()` and `getStandardSuccessValueTable()`) that resolve labels and descriptions via `sohl.i18n.localize()` at call time so the active locale is available.

**New i18n keys added:**

- `SOHL.Skill.FateDesc.loseFateNoEffect.*`, `SOHL.Skill.FateDesc.noLossNoEffect.*`, `SOHL.Skill.FateDesc.success.*`, `SOHL.Skill.FateDesc.critSuccess.*`
- `SOHL.MasteryLevel.SvTable.noValue.*`, `littleValue.*`, `baseValue.*`, `bonus1.*`–`bonus5.*`
