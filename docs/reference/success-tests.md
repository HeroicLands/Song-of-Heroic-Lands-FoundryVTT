---
aliases:
    - Success Test
    - Skill Test
    - d100 Test
    - Success Level
tags:
    - rules
    - core-system
---

# Success Tests

When the outcome of an action is uncertain, the character makes a Success Test by rolling d100 against their Mastery Level (ML) in the relevant skill or attribute. The result is expressed as a **success level**, an integer that measures the degree of success or failure.

## Success Level

A result equal to or less than ML is a success; a result greater than ML is a failure. The units digit (the ones place) further refines the outcome: if it is a 5 or 0, the result is critical. This produces a numeric success level:

| Level | Abbreviation | Name             | Meaning                           |
| ----- | ------------ | ---------------- | --------------------------------- |
| −1    | CF           | Critical Failure | The task fails badly              |
| 0     | MF           | Marginal Failure | The task fails                    |
| 1     | MS           | Marginal Success | The task succeeds                 |
| 2     | CS           | Critical Success | The task succeeds especially well |

Positive levels represent increasing degrees of success; zero is failure; negative values represent increasing degrees of failure. Some rules or modifiers can shift a success level beyond this base range, producing values of 3 or higher, or −2 or lower. Extended levels are written colloquially by appending the offset to the nearest base level: a success level of 3 is "CS+1", a level of 4 is "CS+2", a level of −2 is "CF−1", and so on.

A subset of Success Tests are **basic tests**, where only success or failure is considered — Success Levels greater than 1 are considered as 1 ("Success"), Success Levels less than 0 are considered as 0 ("Failure").

## Effective Mastery Level

Bonuses or penalties modify the chance of success. The adjusted value is called the Effective Mastery Level (EML). Regardless of modifiers, most tests have a minimum EML of 5 and a maximum EML of 95, ensuring that there is always some chance of both failure and success. The GM may waive this in extreme situations, declaring automatic success or failure.

## Mastery Level

Mastery Level measures a character's ability in a skill or attribute, rated between 0 and 100 (or higher). The maximum ML a character may attain in a skill equals seven times its Skill Base (SB × 7).

### Index

The Index of a Mastery Level equals one-tenth of ML, rounded down. Index appears in many rules, particularly Success Value tests and Secondary Mastery. For example: ML 87 has Index 8; ML 25 has Index 2; ML 102 has Index 10.

### Competence (Star Rating)

Professional competence is often expressed on a 0–5 star scale:

| Star Rating | ML    | Competence   |
| ----------- | ----- | ------------ |
| zero        | ≤ 49  | Inept        |
| ★           | 50–59 | Novice       |
| ★★          | 60–69 | Aspirant     |
| ★★★         | 70–79 | Professional |
| ★★★★        | 80–89 | Expert       |
| ★★★★★       | 90+   | Paragon      |

### Assistance

Characters making a test can receive help from others who have at least half the ML of the tester. Each assistant contributes a bonus equal to their own Index to the tester's EML, up to a maximum of +10 total from assistance regardless of how many helpers are involved. Some tasks have physical limits on how many assistants can participate, and some tasks cannot plausibly benefit from assistance at all.

## Attribute Tests

Attributes may be tested like skills against a value of 1–100. Attributes have an ML equal to five times their score and generate an Index, success levels, and Success Values just like skills.

# Opposed Tests

When two characters act against one another—Stealth versus Awareness, Melee versus Dodge, Eloquence versus Eloquence—both make [[Success Tests]] simultaneously. The character who achieves a positive [[Success Tests#Success Level|success level]] and a higher success level than their opponent is the victor.

In combat, the two sides are referred to as the **attacker** and the **defender**. In non-combat opposed tests, the character who initiates the contest is the **initiator** and the other is the **respondent**.

## Victory Degrees

Some situations require knowing how decisively one side won. The difference between the two success levels equals the number of **victory degrees**. For example, a Critical Success (level 2) against a Critical Failure (level −1) equals three victory degrees. A Marginal Success (level 1) against a Marginal Failure (level 0) equals one victory degree.

If both sides fail (MF or CF), there are usually no victory degrees. Unopposed tests similarly produce no victory degrees.

Since success levels can extend beyond the base −1 to 2 range when rules or modifiers shift them, there is no fixed limit to victory degrees.

## Ties

A tie in an opposed test—both sides achieving the same success level—results in zero victory degrees. This is often a perfectly acceptable outcome, signifying no advantage to either side.

## Tiebreaks

Some rules require tied successes to be broken. In such tiebreaks, a one-degree victory goes to the character who rolled a higher number on the d100 (while still succeeding). If the literal rolls are the same, the victor is whoever has the higher ML—or whoever rolls a higher d10 if ML is also equal.
