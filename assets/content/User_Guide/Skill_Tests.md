---
shortcode: sklltestug
name: {full: "Skill Tests and Opposed Tests"}
type: doc
subType: userguide
data: {packFolder: userguide}
---

# Overview {#tests-overview}

Most actions in SoHL are resolved through **skill tests** — rolling dice against a target number derived from a character's skill mastery level. When two characters compete, the system uses **opposed tests** to determine the winner.

See also: [[doc-skillug|Skills]], [[doc-cmbtbscsug|Combat Basics]]

# Performing a Skill Test {#tests-performing}

1. Open the character's sheet and go to the **Skills** tab.
2. Click the name of the skill you want to test.
3. A **Success Test Dialog** appears showing:
   - The skill's effective mastery level (EML)
   - Any situational modifiers
   - Options for the test
4. Adjust modifiers if needed and click **OK**.
5. The result appears in the chat window.

## Understanding Results

A skill test rolls a d100 against the effective mastery level (EML). Two things
decide the result: whether the roll came in **at or under** the EML, and
whether its **units digit** (the ones place) is a **0 or a 5**:

| Roll vs. EML        | Units digit 0 or 5   | Any other units digit |
| ------------------- | -------------------- | --------------------- |
| At or under the EML | **Critical Success** | **Marginal Success**  |
| Over the EML        | **Critical Failure** | **Marginal Failure**  |

So one success in five is critical, and so is one failure in five. Against an
EML of 45: a roll of 35 is a Critical Success, a roll of 32 a Marginal Success,
a roll of 62 a Marginal Failure, and a roll of 70 a Critical Failure.

A spent [[doc-thftsystug|Fate]] point or a GM's result edit can carry a result
past Critical Success or below Critical Failure — see the extended levels on
[[doc-resolutionintro|Resolution]] (rules).

# Effective Mastery Level {#tests-eml}

The **effective mastery level (EML)** is the target number for a skill test. It starts from the skill's base mastery level and is modified by:

- **Situational modifiers** — bonuses or penalties from the environment, equipment, or conditions
- **Injury penalties** — wounds reduce skill effectiveness
- **Fatigue** — exhaustion penalties
- **Equipment bonuses** — some gear provides skill bonuses

The EML is a running total built the same way everywhere in SoHL: a **base**
(the skill's mastery level) plus zero or more **modifiers**, each with its own
name and amount. Modifiers apply in a fixed order — flat bonuses and penalties
added together first, then any multiplier, then any floor or ceiling a rule
imposes, and finally an outright override, if one applies. Most skill tests
never see past the first step; the later steps exist for the handful of rules
that need them.

**The breakdown is never hidden.** Every modifier that went into the EML — its
name and its amount — is shown as a table in the **Success Test Dialog**, above
the Situational Modifier field, before you commit to the roll. The same
breakdown appears on the posted result card, and hovering an EML value
anywhere on the sheet shows it too, so you can always see exactly why a test
reads the number it does.

# Success Value Tests {#tests-sv}

Some tasks represent sustained effort — crafting an item, sailing a passage, researching a question — where rolling dozens of individual tests would be tedious and swingy. A **Success Value Test** resolves the whole task with one roll, producing a graded outcome instead of a simple pass or fail.

Run one from a skill the same way you run a Success Test: click the skill's **Success Value Test** action. The system makes an ordinary success test, then reads the result on a graded scale. The chat card shows:

- **Success Value** — the graded number, derived from the skill's Index (its mastery level ÷ 10) plus a modifier for how well the roll went.
- **Value Diamonds** — how far the work exceeds an ordinary result, from zero up to five diamonds.
- **Result** — the plain-language meaning of that Success Value (no value, little value, base value, or a bonus value carrying diamonds).

The card also shows the underlying roll and target, so you can see how the grade was reached. See the [[doc-sccssvlt|Success Value Tests]] rules for the full scale.

# Editing a Test Result (GM) {#tests-gm-edit}

Every posted test result card carries a small **edit pencil** in its header. This is a **GM-only** tool — players do not see it — and it is the GM's higher-fidelity counterpart to a player spending [[doc-thftsystug|Fate]]: it lets you correct or adjust a result you have already rolled **without re-rolling the dice**.

To edit a result:

1. On the test result card in chat, click the **edit pencil** in the card header.
2. The **Success Test Dialog** reopens, pre-filled with that result's current **Situational Modifier** and **Success Level Modifier**.
3. Change either value — for example, apply a circumstance you forgot, or nudge the outcome up or down.
4. Click **OK**. The test is **re-evaluated against the same die roll** and the card updates in place with the new outcome.

Clicking **OK** without changing anything leaves the result untouched.

How the edit is applied:

- **The die is never re-rolled.** The original d100 is kept; only the target and the outcome are recomputed.
- **Changing the Situational Modifier** changes the effective target, so the success level is re-derived from the same roll (a larger penalty can turn a success into a failure, and vice versa).
- **Changing the Success Level Modifier** shifts the outcome up or down a fixed number of steps (for example, Marginal Success > Critical Success) without touching the target.

Unlike Fate, a GM edit costs nothing and can move a result in either direction. Use it to apply a ruling, fix a mistaken modifier, or reflect a circumstance that came to light after the roll.

# Opposed Tests {#tests-opposed}

When two characters compete directly, the system uses an opposed test:

1. The initiating character performs a skill test.
2. The opposing character performs a counter-test.
3. The system compares the results to determine the winner.

Opposed tests are used for:

- **Combat** — attack vs. defense
- **Social contests** — persuasion vs. resistance
- **Stealth** — hiding vs. perception
- Any situation where two characters directly compete

## How an Opposed Test Resolves {#tests-opposed-resolve}

Both sides' success tests are compared by [[doc-sccsstst#success-level|success
level]], not by the raw roll. Whoever **succeeded** and reached the **higher**
success level wins — a Marginal Success beats a Marginal Failure, a Critical
Success beats a Marginal Success, and a success of any kind always beats a
failure of any kind. If neither side succeeded, nobody wins, however close the
two rolls came.

**The margin is counted in Victory Stars** — one star for every step of success
level between the winner and the loser. A Marginal Success against a Marginal
Failure is a one-star win; a Critical Success against a Critical Failure is
three stars. A shift into the extended levels above Critical Success or below
Critical Failure (from Fate, say) widens the margin with it. The result card
draws the stars, so the margin is visible at a glance.

**A tie** — both sides at the same success level — has no winner and no stars,
unless the contest's initiator checked **Break Ties** on the pre-roll dialog. A
broken tie is always a one-star win, settled in order: the higher d100 roll
takes it; failing that, the higher Mastery Level; failing that, both sides roll
a d10 until one comes out ahead. See [[doc-oppsdtst|Opposed Tests]] (rules) for
the full tiebreak rule, and [[doc-tokenug|Token]] for the request-and-respond
flow this runs through at the table.

# Skill Base and Attributes {#tests-skillbase}

Every skill has a **skill base formula** that determines its starting value from the character's attributes. For example, the Sword skill might have a base formula of `sb(attr.str, attr.dex)` — meaning it averages Strength and Dexterity.

The skill base is calculated automatically when attributes are set. The mastery level builds on top of the skill base through training and experience.

See [[doc-skillug|Skills]] for more about how skill bases work.

## Improving a Mastery Level {#tests-improvement}

A skill's mastery level only rises when someone deliberately spends a **Skill
Development Roll (SDR)** on it: flag the skill after a session where it
mattered, then run **Improve with SDR** to roll **1d100 + the skill's Skill
Base** against its current base mastery level. Coming in above that base
raises it by 1; the flag is spent either way, win or lose. See
[[doc-skillug#improve-with-sdr|Improve with SDR]] for the full action.

This raises the skill's **base** mastery level, not the EML directly. The base
is what the Skills tab shows as ML; the EML is that base plus whatever
situational modifiers apply at the moment of a roll, so raising the base
through an SDR raises the EML by exactly the same amount, with every modifier
still applying on top of the new, higher number.

# See also

- [[doc-skillug|Skill]] and [[doc-attributeug|Attribute]] — the items these tests are run from, and their own test actions.
- [[doc-baseitemug|Base Item]] — the standard test dialog every roll opens, and the GM's result edit.
- [[doc-tokenug|Token]] — starting and answering an opposed test between two tokens.
- [[doc-thftsystug|The Fate System]] — improving a result after it has settled.
- [[doc-iconlgndug|Icon Legend]] — the Victory Stars and Value Diamonds a result card draws.
- [[doc-resolutionintro|Resolution]] (rules) — what a Mastery Level, a success level, and a Victory Star actually are.
- [[doc-oppsdtst|Opposed Tests]] (rules) — Victory Stars, ties, and the tiebreak rule in full.
- [[doc-userguide|User Guide]] — back to the index.
