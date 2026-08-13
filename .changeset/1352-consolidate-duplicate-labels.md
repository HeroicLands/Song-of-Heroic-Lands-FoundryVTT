---
"sohl": patch
---

**Each label in `lang/en.json` now has one owner instead of being restated per
subtype.** 300 distinct values were duplicated across 832 keys — a third of the file —
so a translator localized `Durability` six times and the six copies could drift apart on
the six sheets that read them.

`defineType` grows an optional third argument, `labelKeys`: a per-member map pointing a
member at an **existing** localization key instead of minting one under its own prefix.
That is the mechanism the consolidation needed, and it keeps the borrowing visible at
the declaration rather than hidden in the lang file.

- **Gear effect keys share `SOHL.Gear.*`.** All six gear subtypes carry the same
  `WEIGHT` / `VALUE` / `QUALITY` / `DURABILITY` / `ENCUMBRANCE` effect keys; they now
  resolve to the `SOHL.Gear.FIELDS.*` labels that already owned those words (30 keys
  retired). `Encumbrance` gains a shared `SOHL.Gear.FIELDS.encumbrance` owner, replacing
  the Armor and Weapon copies. The same treatment applies to the other
  `EffectKey` ↔ `FIELDS` restatements — `Level`, `Charges`, `Maximum Charges`,
  `Mastery Level`, `Healing Rate`, `Impact`.
- **One owner for the duplicated enum sets.** `SOHL.CombatResult.TacticalAdvantage.*`
  (dead — nothing declared it) is deleted in favour of
  `SOHL.AttackResult.TacticalAdvantage.*`, and the five mishaps a defender shares with
  an attacker borrow `SOHL.AttackResult.Mishap.*`.
- **`SOHL.Key.*` is retired** — 68 v12-era keys restating labels that now live in their
  proper namespaces. Its one live member moved to `SOHL.Common.none`, the shared home
  for genuinely generic words introduced in #1350.
- **The `Affliction.FEAR` / `FATIGUE` leftovers are gone**; the Trauma-side enums are
  the live ones per the Trait→Trauma migration.

`MiscGearDataModel` drops its `SOHL.MiscGear` prefix: with the shared labels borrowed it
owns no keys at all, so the prefix could no longer resolve — the same rule #1353 applied
to `SOHL.Structure`, and the guard from that issue is what caught it.

`utils/check-lang-coverage.mjs` learns to read `labelKeys` (including a spread of the
shared gear table), so it no longer demands keys a borrowing member never mints.

Result: **2557 → 2430 keys**, duplicated values **300 → 279** across **832 → 728** keys.
The remainder are deliberate — distinct concepts whose English happens to coincide, such
as an attack `Modifier` and an impact `Modifier` — and a ratchet test now fails if the
count rises.

(Closes #1352.)
