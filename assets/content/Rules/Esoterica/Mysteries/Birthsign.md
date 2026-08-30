---
aliases:
  - Birthsign
id: HOIFkzHnXv5I4A4C
type: doc
category: rules
name:
  full: Birthsign
  aliases: []
folder: gmHoAXi9mq8O9DUn
shortcode: brthsgn
---

A passive influence conferred by the celestial sign under which the character was born. A birthsign is never invoked; it quietly shapes the character, strengthening the aptitudes it favours and weakening others.

A birthsign is a standing **Mystery** the character carries: it adjusts the [[doc-mstrylvl#effective-mastery-level|Effective Mastery Level]] of the skills it governs — a bonus to those the sign favours, a penalty to those it hinders. It is fixed at the hour of birth and carried for life; it is never tested, never spent, and never chosen. Like every Mystery, it is unavailable while the character carries [[doc-arlshck|Aural Shock]].

**The six elements.** A sign does not name skills one at a time. The **Astrokýklos** — the wheel of signs — divides all human aptitude into six elements, and a sign's whole substance is where it stands in each. A skill belongs to an element by its kind, and each element also claims any mystical skill of its own name.

| Element | Skills it claims                    | Also                  |
| ------- | ----------------------------------- | --------------------- |
| Earth   | Nature skills                       | _earth_, _physera_    |
| Metal   | Craft and Script skills             | _metal_, _sideros_    |
| Fire    | Combat skills and Combat Techniques | _fire_, _pyrethos_    |
| Air     | Physical skills                     | _air_, _zepharis_     |
| Spirit  | Lore and Mystical skills            | _spirit_, _pneumenos_ |
| Water   | Language and Social skills          | _water_, _hydalis_    |

The modifiers run in steps of five, between **+15** and **−15**, and an element a sign does not touch is left alone. Every sign's six modifiers sum to zero — it favours exactly as much as it hinders — and it either peaks and troughs at one element each (+15 and −15) or spreads that same weight across two elements each way (+10 and −10).

**The wheel.** Twelve signs stand on the wheel — **Arnos** the Ram, **Bourax** the Ox, **Diplos** the Twins, **Chelyx** the Tortoise, **Thyron** the Gate, **Korith** the Helm, **Stathmos** the Balance, **Kentros** the Goad, **Belos** the Lamp, **Tragyx** the Stag, **Nalos** the River, and **Opsar** the Fish — each giving way to the next around the year.

**Births on a threshold: the cusp.** A character born as one sign gives way to the next carries **both**, and the rule for reading two signs together is a single one:

> For each element, take the **better** of the signs the character carries. Modifiers from two signs are never added.

So a birth on the threshold of **Arnos** and **Bourax** takes Earth at +15 from the Ram and Metal at +10 from the Ox, and where Arnos hinders Air at −15 the Ox softens it to −10. A cusp is not a weaker sign, nor a thirteenth kind of sign — it is a birth read twice.

Because the better of two always applies, a cusp comes out ahead of either neighbour alone: its six modifiers sum to **+15** rather than zero, it still peaks at +15, and it troughs no lower than −10. That surplus is what being born on a threshold _is_ — the character is claimed by two influences and shortchanged by neither.

**More than two.** Nothing in the rule stops a GM from granting a third sign, or more, for a portent or a strange nativity — the same "take the better" reading applies, and each further sign can only raise an element, never lower it. Understand that the surplus compounds: a character under three neighbouring signs outdoes any cusp, and one under the whole wheel would stand at +15 in everything. One sign is the ordinary birth and two the threshold; beyond that is a deliberate GM choice, not a natural one.

Reading a sign — a stranger's, or a newborn's — is the work of [[doc-astrlgy|Astrology]], which needs the hour and place of birth to cast a natal chart.

```dataview
TABLE WITHOUT ID
  link(file.path, name.full) AS "Sign",
  shortcode AS "Shortcode",
  description AS "Influence"
WHERE type = "mystery" AND sohl.kbcat = "birthsign"
```
