---
aliases:
    - Combat and Injuries
    - Recording an Injury
tags:
    - user
    - combat
    - injury
audience: Players and GMs resolving attacks and wounds at the table.
---

# Combat & Injuries

This guide walks through resolving a melee attack in **Assisted** mode and
recording the resulting wound. For the difference between Assisted and Automated
combat, see [Combat Modes](../reference/combat-modes.md).

## How effects reach your character

Nothing that happens to *your* character is applied automatically by someone
else. When another character would affect you — a wound, a spell, a condition —
it arrives in chat as a **button on your character**. You (or the GM) click it,
make any resistance roll it asks for, and the effect is then applied to your
character. This is true system-wide, not just in combat: an attacker rolls their
attack, but **you** are the one who records your injury; a wizard rolls their
spell, but **you** acknowledge and apply its effect. It keeps every consequence
visible in chat and leaves you in control of your own character.

## Running an assisted attack

Assisted combat needs nothing but the actor sheets — no scene, tokens, or combat
tracker.

1. **Open the attacker's sheet → Combat tab.** Each weapon (and combat
   technique) lists its strike modes with **Spr** (spread), **Impact**, **Atk**,
   **Blk**, and **CX** columns.
2. **Roll the attack.** Click the **Atk** value for the strike mode. Hold
   **Shift** to skip the modifier dialog. The roll lands in chat.
3. **Roll the defense** (optional). On the defender's sheet, click **Blk** or
   **CX** for one of their strike modes, or the **Dodge** skill on the Skills
   tab. Compare the two results to decide who prevails — in Assisted mode you
   are the judge.
4. **Roll impact.** Back on the attacker's sheet, click the **Impact** value for
   the strike mode. This rolls the weapon's damage dice and posts a **damage
   card** showing the formula, the roll, and the aspect.

If you **target a token** (single target) before rolling impact, the damage card
shows a **Calculate _Name_ Injury** button that takes you straight to the next
step.

## Recording an injury

There are two ways to record a wound, both ending in an **injury card** posted to
chat and (optionally) a Trauma item on the character sheet.

### From a damage card

Click **Calculate _Name_ Injury** on the damage card. The **Add Injury** dialog
opens against the targeted defender, pre-filled with the rolled impact and the
weapon's aspect. Choose the hit location, adjust **Armor Reduction** if some
effect defeats armor, tick **Extra Bleed Risk** if appropriate, and confirm.

### Manually (Add Injury)

On any being's sheet, open the **Trauma** tab and click the **＋** next to
*Injuries*. The same Add Injury dialog opens blank, for recording a wound from
any source.

### What the dialog asks

| Field             | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| Location          | The body location struck (drives armor, shock, and mishaps).   |
| Aspect            | Damage type — blunt, edged, piercing, or fire.                 |
| Impact            | The raw impact total delivered by the blow.                    |
| Armor Reduction   | Amount the location's armor is reduced before subtracting it.  |
| Extra Bleed Risk  | Forces the wound to bleed regardless of the bleeding table.    |
| Add to Char Sheet | When ticked, an actual wound (level ≥ 1) becomes a Trauma item.|

### Reading the injury card

The card subtracts effective protection (`armor value − armor reduction`) from
the impact, maps the result to an injury level (**M1** minor, **S2/S3** serious,
**G4/G5** grievous), and shows:

- **Glancing Blow** — an edged/piercing blow that barely beats rigid armor
  deals no wound but still rattles the target (a +10 bonus to the Shock Roll).
- **Shock Index** — location shock value plus the injury level. When it exceeds
  4, a **Shock Roll** button appears; an index of 4 or less can never produce a
  Shock State.
- **Bleeder** — the wound bleeds and will need stanching.
- **Fumble / Stumble** — a serious wound at a vulnerable location calls for a
  roll; a grievous one is automatic.
- **Amputation** — a grievous edged wound at a severable location prompts a
  Strength test (rolled manually).

A real wound (level ≥ 1) recorded with *Add to Char Sheet* appears on the
Trauma tab, where its severity, healing rate, aspect, treatment, and bleeding
status are tracked.
