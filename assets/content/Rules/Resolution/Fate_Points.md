---
id: QTLdhEpRknXbUTsn
type: doc
subType: rules
name:
  full: Fate Points
  aliases: []
folder: BTGA1PmN0VlBWpCm
shortcode: fatepnts
---

# Fate {#fate}

Some characters are touched by **Fate** — a thread of luck or destiny they can call on at a crucial moment. Fate is not something a character does; it is a resource they hold and spend, and it works on a test that has **already been rolled**.

Spending a **Fate Point** raises that test's [[doc-sccsstst#success-level|success level]], turning a Marginal Failure into a Marginal Success, or a Marginal Success into a Critical Success. Fate **never re-rolls the dice** — the same roll is simply re-graded at a higher level.

Fate is not a single pool of luck. A character holds Fate Points through the **Mysteries** they possess — a Fate Mystery grants one or more points, tracked as its charges. A Fate Point may be:

- **General** — usable on _any_ skill or attribute test, or
- **Specific** — tied to one particular skill.

Some Fate Mysteries grant a **limited** number of points, each use spending a charge; others grant an **unlimited** wellspring that is never used up. A test can call on Fate only when the character holds an available point that applies to it — a specific point for that very skill, or any general point.

Whether Fate is available in a campaign at all is a **game option**: the GM may enable it for _everyone_, for _player characters only_, or turn it _off_.

## What Fate cannot touch {#fate-exclusions}

Even with a point in hand, some tests are beyond Fate's reach. Fate is withheld entirely when:

**The character has no Aura.** Fate is drawn through the Aura attribute, so a character without a usable one cannot call on it at all.

**The test is governed by Aura.** An Aura-governed test cannot be fated — neither the Aura attribute's own test, nor a test of any skill whose [[doc-mstrylvl#skill-base|Skill Base]] is computed from Aura. Fate answers _through_ Aura, and it will not be turned back on the thing that summons it.

**The test is a Mystical Ability.** No Mystical Ability test can be fated, ever. Mystical power is its own bargain, struck on its own terms; luck does not get a say in whether it answers.

**The test is itself a Fate Test.** A Fate Test can never be fated in turn — there is no spending a second point to rescue the first.

## Spending Fate {#fate-test}

When a test has been rolled and its result shown, an eligible character may spend Fate on it. Doing so rolls a **Fate Test** — its own d100 success test against the character's Fate Mastery Level — and the outcome of _that_ test decides what happens:

| Fate Test result     | Fate Point                                                 | Success levels gained |
| -------------------- | ---------------------------------------------------------- | --------------------- |
| **Critical Failure** | lost                                                       | none                  |
| **Marginal Failure** | kept                                                       | none                  |
| **Marginal Success** | spent                                                      | **+1**                |
| **Critical Success** | your choice — **spend** for **+2**, or **keep** for **+1** | +2 or +1              |

A Critical Failure is the risk of tempting fate: the point is gone and nothing is gained. A Marginal Failure costs nothing and changes nothing. A Marginal Success spends the point to nudge the original test up one level. A Critical Success is a windfall — the character chooses whether to spend the point for a full two-level improvement, or hold onto it and still take a one-level gain for free.

The improvement is applied to the **original** test's success level. Because only the success level changes — not the roll — every derived description and consequence of the original test simply re-resolves at the new, better level.

**The gain is not capped at a Critical Success.** Success levels continue past it into the [[doc-sccsstst#extended-levels|extended levels]], so a Marginal Success carried up two rungs by a critical Fate Test becomes a **CS+1**, not merely a Critical Success. Fate can push a good result past the top of the ordinary scale — that is precisely what makes spending a point on an already-successful test worth considering.

Once a result has been fated it cannot be fated again.

### Choosing which point to spend

A character may hold several Fate Points that apply to the same test — a general point and a point specific to the skill being rolled, say. When more than one is eligible, the choice is the **player's**, never automatic.

The most **restricted** eligible point is the one to consider first: a skill-specific point before a general one. Spending the narrow point preserves the flexible one for a test that may have no other option. The player is free to spend whichever point they prefer.

## Fate Mastery Level {#fate-mastery-level}

A character's **Fate Mastery Level** is the target the Fate Test rolls against. It starts at **50** and is raised by **half the character's Aura** (Aura EML ÷ 2, rounded down) — so the more numinous the character, the more reliably Fate answers when called.

## See also {#see-also}

- [[doc-sccsstst|Success Tests]] — the success levels Fate shifts, including the extended levels above a Critical Success
- [[doc-mstrylvl#skill-base|Skill Base]] — which decides whether a skill is Aura-governed and therefore beyond Fate's reach
- [[doc-mysteryintro|Mysteries]] — where a character's Fate Points come from
