---
shortcode: thftsystug
name: {full: "The Fate System"}
type: doc
subType: userguide
data: {packFolder: userguide}
---

# Overview {#fate-overview}

Fate is a thread of luck or destiny a character can call on **after** a test has
been rolled. Spending a **Fate Point** raises that test's success level — a
Marginal Failure becomes a Marginal Success, a Marginal Success becomes a
Critical Success. The dice are never thrown again; the same roll is re-graded at
a better level, and every consequence that followed from it re-resolves.

See also: [[doc-sklltestug|Skill Tests]]

# Fate Points {#fate-points}

Fate Points are not one pool. A character holds them through the **Fate**
mysteries on the Mysteries tab of their sheet, and a mystery's charges are its
points. Some Fate mysteries carry a finite number of charges, each spend using
one; others are an unlimited wellspring that is never used up.

Each point also has a scope:

- **General** — spendable on any skill or attribute test.
- **Specific** — spendable only on tests of the one skill it names.

A test can call on Fate only while the character holds a point that applies to
it, so the **Spend Fate** button is offered on a skill's result card when a
general point or a point specific to that skill is available.

Some tests are beyond Fate's reach whatever the character holds — a test governed
by Aura, any Mystical Ability test, and a Fate Test itself. See
[[doc-fatepnts#fate-exclusions|Fate Points]] for the full list.

## Reading your points {#fate-points-reading}

A mystery's **Charges** are its points, and the Mysteries tab is where you read
them: the **Charges** column on each Fate mystery's row shows **current/maximum**
— or ∞ for a wellspring that never runs dry. A general point and a
skill-specific point are two separate rows, so a glance down the column says
exactly how many of each kind you are holding before you ever press **Spend
Fate**.

## Gaining Fate and awarding a point {#fate-points-gaining}

A character comes by Fate the way they come by any other mystery: a Fate
mystery is dragged onto their sheet from a compendium, or created directly from
the Mysteries tab's **Add** button for the **Fate** subtype — see
[[doc-crtngactitemug|Creating Actors and Items]] for adding items generally.
Nothing about Fate is granted automatically at character creation; a character
starts with points only if they are given a mystery that carries them.

Awarding a point mid-campaign is the same action run on an existing mystery:
open the Fate mystery and raise its **Current Charges** on the Properties tab,
raising **Maximum Charges** too if the award should also lift the cap. There is
no dedicated "grant a point" control — a GM awards a point by editing the
mystery's Charges fields, the same fields a player consults to read them. See
[[doc-mysteryug|Mystery]] for what each Charges field means.

# Using Fate {#fate-using}

## Spending Fate

**Spend Fate** appears on the result card of a settled test, and the character's
own player is the one who presses it. Nothing spends a point on a character's
behalf, and a result can be fated once.

Pressing it rolls a **Fate Test** — a d100 of its own against the character's
Fate Mastery Level — and that roll decides what happens:

| Fate Test result | The point   | The original test                             |
| ---------------- | ----------- | --------------------------------------------- |
| Critical Failure | lost        | unchanged                                     |
| Marginal Failure | kept        | unchanged                                     |
| Marginal Success | spent       | one success level better                      |
| Critical Success | your choice | two levels better if spent, one level if kept |

Only a Critical Success asks you anything: a dialog offers the point for two
levels or lets you keep it for one. The other three rungs resolve on their own.

The gain is not capped at a Critical Success, so an already-successful test is
worth fating — see [[doc-fatepnts#fate-test|Fate Points]] for the levels above
it.

When more than one point applies to the test, the most restricted one is
pre-selected — a skill-specific point ahead of a general one, a finite source
ahead of an unlimited one — so the flexible points survive for a test with no
other option. The pick is offered in a dialog, and you may spend whichever point
you prefer.

## Fate Mastery Level {#fate-mastery-level}

The Fate Test rolls against the character's **Fate Mastery Level**, which starts
at 50 and adds half the character's effective Aura. A character with no usable
Aura cannot call on Fate at all, so the button is withheld rather than offered
and refused.

# Settings {#fate-settings}

The **Use Fate Rules** world setting decides who the rules reach: every animate
actor, player characters only, or nobody. With Fate off for an actor, no test of
theirs offers the button.

See [[doc-syssetngug|System Settings]] for more configuration options.

# See also

- [[doc-sklltestug|Skill Tests and Opposed Tests]] — the settled result that Fate is spent to improve.
- [[doc-baseitemug|Base Item]] — the test-result card the Fate button appears on, and the GM's counterpart result edit.
- [[doc-beingug|Being]] — where a character's Fate Points are held.
- [[doc-mysteryug|Mystery]] — the item a Fate Point lives on, and its Charges fields.
- [[doc-crtngactitemug|Creating Actors and Items]] — dragging or creating a mystery on a character.
- [[doc-syssetngug|System Settings]] — the **Fate** world setting.
- [[doc-fatepnts|Fate]] (rules) — what Fate is and what spending it may buy.
- [[doc-userguide|User Guide]] — back to the index.
