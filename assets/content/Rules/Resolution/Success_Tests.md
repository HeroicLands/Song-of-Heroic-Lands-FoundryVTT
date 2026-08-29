---
aliases:
  - Success Test
  - Skill Test
  - d100 Test
  - Success Level
  - doc-sccsstst
id: V5ocvTbZq3Vw94oz
type: doc
category: rules
name:
  full: Success Tests
  aliases: []
shortcode: sccsstst
folder: BTGA1PmN0VlBWpCm
---

# Success Tests {#success-test}

When the outcome of an action is uncertain, the character makes a **Success Test**: roll d100 and compare the roll to their [[doc-mstrylvl#effective-mastery-level|Effective Mastery Level]] in the skill or attribute being used.

A roll **equal to or less than** the EML succeeds. A roll **greater than** it fails. That much is the whole of the test — but the answer the rules want is almost never a bare yes or no, and so the roll is read a second time to say how well or how badly it went.

## Success Level {#success-level}

The units digit of the roll — the ones place — grades the outcome. If it is a **5 or a 0**, the result is **critical**; otherwise it is **marginal**. Crossed with success and failure, that gives four outcomes, numbered so that later rules can do arithmetic on them:

| Level | Abbreviation | Name             | Meaning                           |
| ----- | ------------ | ---------------- | --------------------------------- |
| −1    | CF           | Critical Failure | The task fails badly              |
| 0     | MF           | Marginal Failure | The task fails                    |
| 1     | MS           | Marginal Success | The task succeeds                 |
| 2     | CS           | Critical Success | The task succeeds especially well |

That number is the **success level**, and it is what the rest of these rules read. An injury's severity, the quality of a piece of work, the margin of a contest, the reach of a mystical ability — all of them are stated in terms of the success level of the test that produced them, not of the roll itself.

Positive levels are degrees of success and negative levels degrees of failure, so the levels rank cleanly from worst to best: Critical Failure, Marginal Failure, Marginal Success, Critical Success.

An EML of 45 rolled against a d100 of 32 is a Marginal Success — under the EML, units digit 2. A roll of 35 is a Critical Success. A roll of 62 is a Marginal Failure, and a roll of 70 a Critical Failure. The chance of succeeding at all is just the EML; one success in five is critical, and so is one failure in five.

## Extended levels {#extended-levels}

Some rules and effects shift a success level after it is rolled — a spent [[doc-fatepnts#fate|Fate]] point raises it, a penalty may lower it. A shift can carry the level past either end of the ordinary four, and when it does the level simply keeps counting: 3, 4 and beyond above a Critical Success, −2 and below beneath a Critical Failure.

These are the **extended levels**, and they are written by naming the nearest ordinary level and the offset from it:

| Level | Written |
| ----- | ------- |
| 4     | CS+2    |
| 3     | CS+1    |
| −2    | CF−1    |
| −3    | CF−2    |

An extended level is still a success or a failure of its own kind — a CS+1 is a Critical Success and is treated as one wherever a rule asks only whether the test succeeded critically. What the extra step buys is margin, and rules that measure margin, such as [[doc-oppsdtst#victory-stars|Victory Stars]], count it.

## Basic tests {#basic-test}

A few tests ask nothing more than whether the character managed it. These are **basic tests**: any success level above 1 reads simply as **Success**, and any level below 0 reads simply as **Failure**. The dice are rolled and read exactly as usual; only the grading is coarsened. A rule that wants a basic test says so.

## See also {#see-also}

- [[doc-mstrylvl|Mastery Level]] — ML, Index, and the EML a test rolls against
- [[doc-oppsdtst|Opposed Tests]] — two Success Tests compared
- [[doc-sccssvlt|Success Value Tests]] — grading work rather than achievement
- [[doc-fatepnts|Fate]] — improving a success level after the roll
