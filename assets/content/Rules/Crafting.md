---
aliases:
    - Crafting
    - Craft
    - Crafting Routine
    - Masterwork
id: 3dQTVykMItQGXYTj
type: doc
package: sohl
category: rules
name:
    full: Crafting
    aliases: []
folder: RqKUTBUBN2Y3MHYB
shortcode: crafting
---

**Crafting** is the making of a thing — a blade, a pot, a bow, a lock, a coat.
Every trade that produces an article follows the same short routine, and the
trades differ only in the detail they hang on it.

1. The crafter works in a [[#workshop|workshop]], rated one to five stars.
2. They spend the article's [[#craft-expense|expense]]: materials in money,
   labour in time.
3. They make one [[#craft-test|Success Value test]] of the trade's skill.
4. They read it on the [[#craft-result|result ladder]] — flawed, sound, or
   masterwork.
5. A masterwork result buys [[#masterwork|masterwork rolls]] or
   [[#fast-crafting|faster work]], as the crafter chooses.

What each trade adds to that frame is only ever the particulars: which skill is
tested, how its cost and time are reckoned, what a flaw costs in that trade's
own units, and how much fine work the material will take. Everything else is on
these pages, and applies to every craft **whether or not that trade's own entry
repeats it**.

Crafting is also how an article is put right again once it has been damaged; see
[[#craft-repair|Repair]].

# The Workshop {#workshop}

A **workshop** is the place, the tooling and the stock a trade needs in order to
work at all — a forge and its hammers, a kiln, a loom, a bench of files and
picks. Every workshop is rated from **one to five stars** by how well it is
found.

The rating does one thing: it sets the **Target Number** for
[[#masterwork|masterwork rolls]]. A well-appointed shop does not make ordinary
work come out better, and a poor one does not spoil it; what the shop decides is
how far above ordinary the work can reach.

| Workshop  | Stars | TN  |
| --------- | ----- | --- |
| Makeshift | 1     | 1   |
| Sparse    | 2     | 2   |
| Standard  | 3     | 3   |
| Plentiful | 4     | 4   |
| Ideal     | 5     | 5   |

A trade may require a workshop of its own kind — a lock is not made at a
tannery — and says so in its own entry.

# Expense {#craft-expense}

Before any test is made, the article's expense is spent. **Materials** are
reckoned in money and **labour** in time, and a crafter puts in up to **ten
hours a day**. Work measured in months is measured in the same working days.

Trades state that expense in one of two ways, and each says which it uses:

- **Per article.** A table gives the cost and the hours for each thing the trade
  makes — a dagger, a horseshoe, a saddle.
- **By price.** Cost and time are derived from what the finished article sells
  for, at a rate the trade gives — so many hours or days per so much of the sale
  price, at so much a day in materials.

The expense is what the work costs when it goes normally. A
[[#craft-result|Critical Failure]] adds to the time, and
[[#fast-crafting|fast crafting]] takes some of it away.

# The Test {#craft-test}

The whole of the work is settled by a single
[[doc/sccssvlt#success-value-test|Success Value test]] of the trade's skill,
made once the expense has been spent.

Each trade names the test it takes, and names it in the ordinary way: a
**Weaponcraft (Metalcraft, Mineralogy)** test is a Weaponcraft Success Value
test carrying Metalcraft and Mineralogy as
[[doc/scndryms#secondary-modifier|Secondary Modifiers]]. Where what is being
made decides the skill rather than the trade — a wooden haft against an iron
head, a padded coat against a mail one — the trade's entry gives a table of
which test applies to what.

Up to **two others may assist**, provided they are present for the whole of the
work.

# The Result {#craft-result}

The Success Value is read on the ladder below. It is the crafting reading of the
[[doc/sccssvlt#success-value|standard Success Value scale]], and every trade
uses it unless it says otherwise.

| SV  | Outcome                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 2 | **Flawed.** The article is finished, but short of the catalogue: it loses quality, and whatever second measure the trade keeps alongside it.                  |
| 3–4 | **Sound.** The base article, exactly as catalogued.                                                                                                           |
| 5+  | **Masterwork.** Each [[doc/sccssvlt#value-diamonds\|Value Diamond]] buys either one [[#masterwork\|masterwork roll]] or [[#fast-crafting\|10% off the time]]. |

**A flaw costs what the trade says it costs.** How much quality is lost, what
else goes with it, and how fast the loss grows as the Success Value falls
further below 3 are all particular to the trade, and are stated in its entry.

**A Critical Failure is a setback, not a ruin.** On a Critical Failure on the
test's underlying Success Test, crafting time **increases by half**. A few
trades are harsher than that, and say so.

# Masterwork {#masterwork}

A Success Value of 5 or better yields
[[doc/sccssvlt#value-diamonds|Value Diamonds]] — one for each point past 4, to a
maximum of five. Each diamond is spent, one way or the other: on a masterwork
roll here, or on [[#fast-crafting|fast crafting]]. The crafter chooses for each
diamond separately, and may split them between the two.

Each diamond committed to fine work rolls **one d10 against a Target Number
equal to the [[#workshop|workshop's]] star rating**, each rolled separately.
Every success is a **Masterwork Success (MWS)**, and the total decides what the
article became.

| MWS | Result                  | Value |
| --- | ----------------------- | ----- |
| 0   | Base article            | ×1    |
| 1   | Quality +1              | ×2    |
| 2   | Quality +1, modifier +1 | ×3    |
| 3   | Quality +2, modifier +1 | ×4    |
| 4   | Quality +2, modifier +2 | ×5    |
| 5   | Quality +3, modifier +2 | ×6    |

**Quality** is the article's own quality rating. The **modifier** is the second
measure the trade keeps beside it — a weapon's impact, a bow's range, a suit of
armour's Armour Value — and each trade says what its modifier does. **Value**
multiplies what the finished article is worth.

**Not every success can be applied.** However many are rolled, an article will
only take so much fine work: a plain material or a modest design caps what the
crafter can put into it, and the surplus is simply pride. Each trade states its
own cap.

# Fast Crafting {#fast-crafting}

A [[doc/sccssvlt#value-diamonds|Value Diamond]] need not be spent on
[[#masterwork|masterwork]]. It may instead be spent to cut the **time** the work
takes by **10%**, to a maximum reduction of **30%** — so at most three diamonds
can be spent this way, however many the test produced. Any others may still be
rolled for masterwork.

Fast crafting is available to **every** craft, whether or not that trade's own
entry mentions it. Only time is bought: the materials cost what they cost, and
the article is otherwise exactly what the result ladder says it is.

# Repair {#craft-repair}

An article that has lost quality can have it put back. The test is a Success
Value test of the same skill that would have made the article.

**In the field**, an article reduced by **only one** point of quality can be
repaired without a workshop: the test is made **without Secondary Modifiers**
and takes **10% of the article's listed crafting time**, at no cost in
materials. **A Success Value of 1 or better restores the lost point.** Field
repair therefore almost always works, and is limited by the hours it takes
rather than by the roll.

**In a workshop**, the same test is made at **+2 SV**, and the quality restored
is worked out through the [[#masterwork|masterwork]] steps above — never
exceeding the article's undamaged rating.
