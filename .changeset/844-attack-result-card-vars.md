---
"sohl": patch
---

**Fix the attack-result card's missing variables (#844)**

`buildCombatCardData` never supplied several variables the attack-result card
references, so every card rendered an empty attacker adjustment table and showed
the victory-stars line as "None". The builder now provides:

- **`attackMods` / `defendMods`** — each side's mastery-level adjustment rows
  (`{ name, value }` from the modifier deltas); the defender table is empty on an
  uncontested (Ignore) defense.
- **`vsText`** — the exchange's victory degrees (the difference in success levels)
  rendered as that many stars, empty on a tie.
- **`defendWeapon`** — the defender's weapon name, so a broken-weapon notice reads
  "`<defender>'s <weapon> broke!`" instead of an empty name.

These are supplied on both the attack and counterstrike card data.

The card's **Victory Stars** line is renamed **Success Stars** (on the
attack-result and opposed-result cards) to match the system's success-star
terminology.

The `notes`, `outnumbered`, and `nextSuccessLevelMod` blocks — which referenced
combat concepts the model does not implement — were removed from the template
rather than wired to absent data.
