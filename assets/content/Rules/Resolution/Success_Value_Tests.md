---
aliases:
  - Success Value Test
  - SV Test
  - Success Value
  - Value Diamonds
id: PqED2bmjJU5AdEsU
type: doc
category: rules
name:
  full: Success Value Tests
  aliases: []
shortcode: sccssvlt
folder: BTGA1PmN0VlBWpCm
---

# Success Value Tests {#success-value-test}

Characters often undertake ventures that require sustained effort — crafting a sword, sailing a ship, researching a topic, treating a wound. Rather than making dozens of individual [[doc-sccsstst#success-test|Success Tests]], the task is resolved with a single **Success Value (SV) test**, which asks how _good_ the work was rather than whether it was done at all.

An SV test takes four steps.

## Step 1: Index {#sv-index}

Note the [[doc-mstrylvl#index|Index]] of the skill being used — its Mastery Level divided by ten, rounded down. This is the value the character's competence alone is worth, before the day's luck is counted.

The Index always comes from the **unmodified ML**, never from the EML. Bonuses and penalties are felt in step 2, where they belong.

## Step 2: Modifier {#sv-modifier}

Make a Success Test, including every applicable bonus and penalty. Its success level becomes a modifier:

| Success Level | Modifier |
| ------------- | -------- |
| CF (−1)       | −2       |
| MF (0)        | −1       |
| MS (1)        | 0        |
| CS (2)        | +1       |

A Marginal Success is the neutral case: the work came out as the character's skill would suggest. Anything else shifts it.

## Step 3: Success Value {#success-value}

The **Success Value** is the sum of the Index and the modifier. Some skills adjust it further or read it in their own way, as described in their entries. Where a skill gives no special reading, the standard interpretation applies:

| SV  | Grade        | Meaning                                                                                          |
| --- | ------------ | ------------------------------------------------------------------------------------------------ |
| ≤ 0 | No Value     | The effort comes to nothing the character can use.                                               |
| 1–2 | Little Value | The effort yields only a poor or partial outcome.                                                |
| 3–4 | Base Value   | The effort yields a sound, workmanlike outcome.                                                  |
| 5+  | Bonus Value  | A superior outcome, measured in [[#value-diamonds\|Value Diamonds]] — one for each point past 4. |

## Step 4: Critical Failure {#sv-critical-failure}

The Success Value from step 3 stands on its own, but a Critical Failure on the step 2 Success Test may carry its own separate penalty regardless of that value — the botched batch, the ruined stock, the injury to the worker. What that penalty is depends on the skill, and is listed with that skill's own Success Value entry.

## Value Diamonds {#value-diamonds}

The **Value Diamonds** of a result are how far it exceeded a plain workmanlike one: none at Base Value or below, and one for each point of Success Value above 4, to a maximum of five.

| Success Value | Value Diamonds |
| ------------- | -------------- |
| ≤ 4           | none           |
| 5             | ◆              |
| 6             | ◆◆             |
| 7             | ◆◆◆            |
| 8             | ◆◆◆◆           |
| 9 or more     | ◆◆◆◆◆          |

Diamonds grade a single piece of work against a fixed scale of five, and are unrelated to the [[doc-oppsdtst#victory-stars|Victory Stars]] that measure the margin of a contest and have no ceiling at all.

## SV tests and Secondary Mastery {#sv-secondary-mastery}

[[doc-scndryms#secondary-modifier|Secondary Modifiers]] affect the EML rolled in step 2, and [[doc-scndryms#secondary-roll|Secondary Rolls]] accompany an SV test as they do any other. Neither touches step 1: the Index always comes from the unmodified Mastery Level.
