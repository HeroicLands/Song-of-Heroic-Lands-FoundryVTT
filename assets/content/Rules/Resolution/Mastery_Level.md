---
id: uil7KCJxAUM4nXLC
type: doc
subType: rules
name:
  full: Mastery Level
  aliases: []
folder: BTGA1PmN0VlBWpCm
shortcode: mstrylvl
---

# Mastery Level {#mastery-level}

**Mastery Level (ML)** measures how good a character is at one particular thing — a skill, an attribute, a mystical ability. It is the number every test of that thing is measured against, and it is stated on a scale of 0 to 100, where 100 would be near-certain success. Nothing forbids an ML above 100; a character of legendary accomplishment may exceed it, and the rules that read ML go on working when they do.

An ML of 0 means the character has no mastery of the thing at all — they have never learned it. Whether an unlearned skill may be attempted anyway, and at what cost, is a matter for that skill's own entry and for the GM.

## Skill Base {#skill-base}

A skill's Mastery Level starts from its **Skill Base (SB)** — a number derived from the attributes that the skill draws upon. Climbing rests on Agility and Dexterity, Cookery on Perception and Reason, Weaponcraft on Dexterity and Strength. The attributes a given skill uses are named in that skill's own entry.

Reducing those attributes to a single Skill Base follows one rule:

| Attributes used | Skill Base                                                                                          |
| --------------- | --------------------------------------------------------------------------------------------------- |
| One             | The attribute's value                                                                               |
| Two             | Their average, rounded **up** if the first is the greater, and **down** otherwise (ties round down) |
| Three or more   | Their average, rounded to the nearest whole number                                                  |

The first attribute named is the **primary** one; that is what the two-attribute tiebreak turns on, so the order a skill lists its attributes in matters. A Skill Base is never less than 0.

Skill Base does two things.

It sets where a skill **opens**. A skill a character has picked up begins at a multiple of its Skill Base — Climbing at three times, Cookery at twice — and the multiple is given in that skill's entry. A multiple of zero marks a skill nobody acquires by living: it stays at nothing until deliberately studied.

And it **caps** the skill thereafter. However long a character trains, their ML in a skill can never exceed **seven times its Skill Base (SB × 7)**. Talent sets the ceiling; practice decides how near it the character comes.

A skill whose Skill Base is derived from Aura is said to be **Aura-governed**, which matters when [[doc-fatepnts#fate|Fate]] is called on.

## Attribute Mastery Levels {#attribute-mastery-level}

An attribute is rated on its own scale rather than being built from others, and its Mastery Level is **five times its value**. An attribute of 12 therefore tests at ML 60. Everything in this chapter that applies to a skill's ML applies equally to an attribute's: attributes generate an Index, produce success levels, and can be opposed or tested for Success Value exactly as skills are.

## Index {#index}

The **Index** of a Mastery Level is one-tenth of it, rounded down — in effect the tens digit.

| ML  | Index |
| --- | ----- |
| 25  | 2     |
| 87  | 8     |
| 102 | 10    |

Index appears wherever a rule needs a small number rather than a percentage: it is the starting point of a [[doc-sccssvlt#success-value|Success Value]], the target of a [[doc-scndryms#secondary-roll|Secondary Roll]], and the size of the bonus a helper contributes.

An Index is always taken from the **unmodified** Mastery Level. Bonuses and penalties adjust the Effective Mastery Level of a d100 test and nothing else; they never move an Index.

## Effective Mastery Level {#effective-mastery-level}

Circumstances rarely leave a character at their bare Mastery Level. Poor light, a wound, a rushed attempt, a well-made tool, a helper at their elbow — each shifts the odds. The Mastery Level with every applicable bonus and penalty applied is the **Effective Mastery Level (EML)**, and it is the EML, not the ML, that the d100 is rolled against.

However the modifiers fall, an EML is normally held between **5 and 95**. There is always at least a small chance of failure and always at least a small chance of success, however lopsided the circumstances. A GM who judges a task genuinely impossible or genuinely certain should say so and skip the roll, rather than letting the floor and ceiling pretend at a contest that is not there.

## Assistance {#assistance}

A character may be helped. An assistant must have at least **half** the tester's Mastery Level in the skill or attribute being used — below that they are more hindrance than help — and each qualifying assistant adds their own [[#index|Index]] to the tester's EML.

Assistance is capped at **+10** in total, however many hands are lent. Beyond that, extra helpers crowd the work. Some tasks also have a physical limit on how many people can take part at once, and some — a delicate negotiation, a moment of recall — cannot be helped at all. The GM decides which.

## Competence {#competence}

Mastery Level also describes standing in a trade. Where a character's professional competence needs naming rather than rolling, it is read from this scale:

| Rating | ML    | Competence   |
| ------ | ----- | ------------ |
| zero   | ≤ 49  | Inept        |
| ★      | 50–59 | Novice       |
| ★★     | 60–69 | Aspirant     |
| ★★★    | 70–79 | Professional |
| ★★★★   | 80–89 | Expert       |
| ★★★★★  | 90+   | Paragon      |

These stars rate a character; they are not the [[doc-oppsdtst#victory-stars|Victory Stars]] that measure the margin of a single contest.

## See also {#see-also}

- [[doc-sccsstst|Success Tests]] — what is done with an EML once it is settled
- [[doc-scndryms|Secondary Mastery]] — how a second skill bears on a test
- [[doc-attributes|Attributes]] — the attributes a Skill Base is built from
