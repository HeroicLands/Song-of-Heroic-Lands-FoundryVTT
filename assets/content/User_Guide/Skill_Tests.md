---
aliases: []
id: 8l2J6Pczsy0YpT0P
type: doc
package: sohl
category: user-guide
name:
    full: "Skill Tests and Opposed Tests"
shortcode: sklltsts
folder: IgwaG8rAUUO9vrtz
---

# Overview {#tests-overview}

Most actions in SoHL are resolved through **skill tests** — rolling dice
against a target number derived from a character's skill mastery level.
When two characters compete, the system uses **opposed tests** to determine
the winner.

See also: [[doc/skill|Skills]], [[Combat Basics]]

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

A skill test rolls against the effective mastery level. The result is one of:

- **Critical Success (CS)** — an exceptional success (roll of 5 or divisor of EML)
- **Marginal Success (MS)** — a success by a narrow margin
- **Marginal Failure (MF)** — a failure by a narrow margin
- **Critical Failure (CF)** — a significant failure (roll of 96+)

The exact thresholds depend on the effective mastery level.

<!-- TODO: Document the exact success/failure determination rules,
     including the critical success and critical failure thresholds. -->

# Effective Mastery Level {#tests-eml}

The **effective mastery level (EML)** is the target number for a skill test.
It starts from the skill's base mastery level and is modified by:

- **Situational modifiers** — bonuses or penalties from the environment,
  equipment, or conditions
- **Injury penalties** — wounds reduce skill effectiveness
- **Fatigue** — exhaustion penalties
- **Equipment bonuses** — some gear provides skill bonuses

The EML is shown in the Success Test Dialog before you roll.

<!-- TODO: Document how modifiers stack, the modifier audit trail
     (ValueModifier system), and how players can view what's affecting
     their EML -->

# Success Value Tests {#tests-sv}

Some tasks represent sustained effort — crafting an item, sailing a passage,
researching a question — where rolling dozens of individual tests would be
tedious and swingy. A **Success Value Test** resolves the whole task with one
roll, producing a graded outcome instead of a simple pass or fail.

Run one from a skill the same way you run a Success Test: click the skill's
**Success Value Test** action. The system makes an ordinary success test, then
reads the result on a graded scale. The chat card shows:

- **Success Value** — the graded number, derived from the skill's Index (its
  mastery level ÷ 10) plus a modifier for how well the roll went.
- **Success Stars** — how far the work exceeds an ordinary result, from zero up
  to five stars.
- **Result** — the plain-language meaning of that Success Value (no value, little
  value, base value, or a starred bonus value).

The card also shows the underlying roll and target, so you can see how the grade
was reached. See the [[doc/sccssvlt|Success Value Tests]]
rules for the full scale.

# Editing a Test Result (GM) {#tests-gm-edit}

Every posted test result card carries a small **edit pencil** in its header.
This is a **GM-only** tool — players do not see it — and it is the GM's
higher-fidelity counterpart to a player spending [[doc/thftsyst|Fate]]:
it lets you correct or adjust a result you have already rolled **without
re-rolling the dice**.

To edit a result:

1. On the test result card in chat, click the **edit pencil** in the card
   header.
2. The **Success Test Dialog** reopens, pre-filled with that result's current
   **Situational Modifier** and **Success Level Modifier**.
3. Change either value — for example, apply a circumstance you forgot, or nudge
   the outcome up or down.
4. Click **OK**. The test is **re-evaluated against the same die roll** and the
   card updates in place with the new outcome.

Clicking **OK** without changing anything leaves the result untouched.

How the edit is applied:

- **The die is never re-rolled.** The original d100 is kept; only the target and
  the outcome are recomputed.
- **Changing the Situational Modifier** changes the effective target, so the
  success level is re-derived from the same roll (a larger penalty can turn a
  success into a failure, and vice versa).
- **Changing the Success Level Modifier** shifts the outcome up or down a fixed
  number of steps (for example, Marginal Success → Critical Success) without
  touching the target.

Unlike Fate, a GM edit costs nothing and can move a result in either direction.
Use it to apply a ruling, fix a mistaken modifier, or reflect a circumstance that
came to light after the roll.

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

<!-- TODO: Document the opposed test resolution mechanics — how ties are
     broken, how critical results interact, and how the margin of success
     is calculated -->

# Skill Base and Attributes {#tests-skillbase}

Every skill has a **skill base formula** that determines its starting value
from the character's attributes. For example, the Sword skill might have a
base formula of `sb(attr.str, attr.dex)` — meaning it averages Strength and
Dexterity.

The skill base is calculated automatically when attributes are set. The
mastery level builds on top of the skill base through training and experience.

See [[doc/skill|Skills]] for more about how skill bases work.

<!-- TODO: Document how skill improvement works — SDR (Skill Development
     Roll), experience-based advancement, and the relationship between
     mastery level base and effective mastery level -->
