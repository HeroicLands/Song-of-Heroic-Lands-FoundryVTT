---
"sohl": minor
---

Give every animal its six creature skills, and the Grukar an anatomy and a
natural weapon
([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).

**Animals.** The 114 animals outside the printed Abilities tables now carry
Awareness, Stealth, Spirit (a Mystical Ability), Initiative, Dodge and Shock
alongside their natural weapons — the same six the printed animals take from
the AWARE / STEALTH / SPIRIT / INITIATIVE / DODGE / SHOCK columns. An animal
has no Skill Base, so each is a flat `masteryLevelBase`.

Values are extrapolated from the 31 printed animals, on the same attribute
pair the system's own skill uses — Awareness `5 × (PER+WIL)/2`, Spirit
`3 × (AUR+WIL)/2`, Dodge `4 × (AGL+PER)/2`, Initiative `4 × (WIL+REA)/2`,
Stealth `5 × (AGL+WIL)/2`, Shock `2.5 × (STR+END)/2`. Mean error against those
31 rows is under one point for Awareness and Spirit and under five for Dodge
and Initiative; Shock is the loosest, being visibly hand-tuned in the printed
rows. Where a file already carried one of the six, its authored value is kept.

**Grukar.** All four shipped a human anatomy with no natural armour and no
attack at all. Grukar-Uk and Grukar-Sha now take a compact six-zone anatomy —
head and arms sharing zone numbers 1–2, torso 3–4, legs 5–6 — with
per-location natural armour; Grukar-Hai and Grukar-Ahk keep the human plan
they are built on. All four keep their own authored ability scores
and gain a Punch combat technique, which unlike a beast's natural weapon can
be used to block, and the same six creature skills.
