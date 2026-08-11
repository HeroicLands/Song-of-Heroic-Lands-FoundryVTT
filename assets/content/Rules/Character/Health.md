---
aliases:
    - Health
    - Health Band
    - Health Bands
    - Health Ceiling
id: ehT8KvAFrQSNEndW
type: doc
package: sohl
category: rules
name:
    full: Health
    aliases: []
folder: SSkatgtYj9d71kaz
shortcode: health
---

**Health** is a single figure — a percentage from 0 to 100, with a plain-language
band beside it — that answers one question: _how badly is this character hurt?_
An unharmed character sits at **100%, Excellent**. A character who has been
wounded reads lower, and the word beside the number says what that means.

Health is **not a pool of hit points.** Nothing is subtracted from it when a blow
lands, and it is not spent, tracked, or restored point by point. It is a
**ceiling** — the highest level of function a character's current injuries still
permit. Heal the injuries and the ceiling lifts on its own; there is no separate
score to repair.

This matters most in the moment a fight turns. Health does not slide gently
downward one blow at a time. A character stays at Excellent through minor knocks
and then drops hard the moment a wound is serious enough — or numerous enough —
to impose a real ceiling.

# What sets the ceiling

Every wound a character carries impairs some part of the body. Three things about
those impairments decide the ceiling, and nothing else does:

1. **How badly the part is impaired** — a scale from a **minor** impairment
   through **serious** and **grievous** to outright **unusable**.
2. **Which part it is.** A part is either **critical** — it holds something vital
   or is core to the body, such as the head, the chest, or the abdomen — or it is
   a **limb**: an arm, a leg, a hand, a foot. Harm to a critical part costs far
   more than the same harm to a limb. Which of the two a part is follows from its
   [[Rules/bdystrct#body-part-roles|body roles]]: a part carrying **Vital** or
   **Core** is critical, and a part carrying only **Manipulator** or **Locomotor**
   is a limb.
3. **How many parts are in that same state.** A second injury of a given severity
   costs much more than the first, and by the third the ceiling has usually
   bottomed out.

A character's Health is then the **worst ceiling any of these impairments
imposes** — never a running total. Injuries do not add up: five bruises do not
kill anyone, but one crushed skull does. If a character has a minor limb wound
(a ceiling of 80) and a serious wound to the chest (a ceiling of 20), their
Health is **20%** — the chest wound governs, and the bruised arm changes nothing
while it stands.

## Limb impairments

| Impairment   | One limb | Two limbs | Three or more |
| ------------ | -------- | --------- | ------------- |
| **Minor**    | 80%      | 50%       | 30%           |
| **Serious**  | 50%      | 20%       | 20%           |
| **Grievous** | 30%      | 10%       | 10%           |
| **Unusable** | 20%      | 10%       | 10%           |

## Critical-part impairments

| Impairment   | One part | Two or more |
| ------------ | -------- | ----------- |
| **Minor**    | 50%      | 25%         |
| **Serious**  | 20%      | 10%         |
| **Grievous** | 10%      | 10%         |
| **Unusable** | 0%       | 0%          |

The gap between the two tables is the whole point: a minor wound to an arm barely
registers, while the _same_ minor wound to the chest halves a character outright.
A critical part rendered unusable drives the ceiling to nothing at all — a
mortal state, from which a character who is still breathing reads 1% (see
[[#the-bands|the floor]] below) until they die in fact.

# The bands {#the-bands}

The band is the number in words — what a companion would say, looking at them.

| Band          | Health  | What it means                                             |
| ------------- | ------- | --------------------------------------------------------- |
| **Excellent** | 96–100% | Unhurt, or so lightly marked it makes no difference.      |
| **Good**      | 80–95%  | Knocked about. Whole, and holding.                        |
| **Fair**      | 60–79%  | Visibly hurt and slowed, but still in the fight.          |
| **Poor**      | 30–59%  | Badly hurt. Failing, and in trouble if the fight goes on. |
| **Morbid**    | 1–29%   | Grievously hurt and close to death. Needs care now.       |
| **Dead**      | 0%      | Dead.                                                     |

**A living character never reads 0%.** However ruinous the injuries — even
injuries whose ceiling is nothing at all — a character who is still alive is held
at a minimum of 1%, Morbid. **0% means dead**, and nothing else does. So Morbid
is the floor of the living: a character there may be past saving, but they have
not died yet, and the figure will not pronounce them dead before they are.

# What Health does not cover

Health measures **bodily injury only**. It is deliberately blind to every other
way a character can be taken out of a fight — being [[Rules/fatigue|winded or weary]],
[[Rules/shock|stunned or unconscious]], [[Rules/fear|afraid]], or otherwise
overcome. Those are tracked separately and have their own effects.

So Health is not a readiness score. A character can read **Excellent** and still
be unconscious, exhausted, or paralysed with fear. Read Health for _how hurt they
are_, and read their conditions for _whether they can act_.

See also: [[Rules/injrylvl|Injury]] for how wounds and their impairments are
determined, [[Trauma]] for the wider picture of harm, and
[[Healing Base]] for recovery.
