---
aliases:
  - Tokens
id: cuzEYQJCbBO4RFDq
type: doc
subType: user-guide
name:
  full: "Token"
shortcode: tokenug
folder: IgwaG8rAUUO9vrtz
---

# Overview

A **token** is a character's presence on the canvas — the figure you drag onto a scene, target, and move around. Tokens carry no SoHL properties of their own and have no SoHL sheet: everything about the character lives on the actor behind the token. For placing tokens, prototype-token settings, and the Cohort expand button, see [[doc-scnsetuptokug|Scene Setup and Tokens]].

What the token _does_ own in SoHL is the **opposed test** — a contest between two characters, such as Stealth against Awareness or Eloquence against Eloquence. Opposed tests are about tokens rather than actors because a contest needs two sides on the canvas: one token initiates, and the other token answers.

The token therefore defines two actions, described on this page:

| Action                                                  | Shortcode           | What it does                                    |
| ------------------------------------------------------- | ------------------- | ----------------------------------------------- |
| [[#starting-an-opposed-test\|Opposed Test]]             | `opposedTestStart`  | Starts a contest against the token you targeted |
| [[#responding-to-an-opposed-test\|Resume Opposed Test]] | `opposedTestResume` | The other side answers, settling the contest    |

> **Both actions are hidden.** Neither one appears on any **Actions** context menu. You reach the first from a skill's or attribute's own **Opposed Test** action, and the second from the **Respond** button on the opposed-request chat card. They are documented here because this is where the contest actually lives, and because a module or macro can call them directly.

For the rules behind a contest — Victory Stars, ties, and tiebreaks — see the [[doc-oppsdtst|Opposed Tests]] rules. For the d100 roll each side makes, see [[doc-sklltestug|Skill Tests and Opposed Tests]].

# Starting an Opposed Test {#starting-an-opposed-test}

|               |                                                                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Opposed Test                                                                                                                                                |
| **Shortcode** | `opposedTestStart`                                                                                                                                          |
| **Icon**      | `fa-arrows-to-dot` (two arrows converging)                                                                                                                  |
| **Invoked**   | **Hidden — not on the Actions context menu.** Triggered by the **Opposed Test** action on a skill or attribute (which _is_ on that item's menu).            |
| **API**       | [`SohlTokenDocumentLogic.opposedTestStart`](https://www.heroiclands.org/sohl/api/classes/sohl.document.token.logic.SohlTokenDocumentLogic#opposedteststart) |

## What it does and when to use it

Use an opposed test whenever your character acts directly against another character and the other side gets to resist: sneaking past a guard, talking a merchant down, arm-wrestling, tracking someone who covered their trail. Instead of rolling and eyeballing the result, the system rolls both sides, compares them, and reports who won and by how much.

You never pick this action off the token. You pick **Opposed Test** on the skill or attribute you want to use — for example, the Stealth skill's **Opposed Test** action. That action finds your character's token on the canvas and hands the contest to it, so the roll is made by the skill you chose but the contest is between the two tokens.

## Before you start

- **Your character needs a token on the current scene.** Without one, the system reports that the skill "cannot start an opposed test: its actor has no token on the canvas."
- **Target exactly one opponent.** Use Foundry _targeting_ (the crosshair), not selection. With nothing targeted you are told "No tokens targeted."; with more than one, you are warned and the first is used.
- **You must have ownership of the target's token.** If you do not, the system refuses with "You do not have permissions to perform this operation on _{name}_". In practice this means the GM starts contests against NPCs, and contests between two player characters are started by the GM or by someone who owns both sides.

## What happens on screen

1. **The standard test dialog opens** for your skill or attribute — the same pre-roll dialog every test uses (Target, the modifier breakdown, Situational Modifier, Success Level Modifier, and Roll Visibility). Its fields are described once on [[doc-baseitemug|Base Item]]. Cancelling it abandons the whole contest.
   - A contest adds one field the other tests do not have: a **Break Ties** checkbox, off by default. Leave it off and a tied contest is reported as a tie. Tick it when the situation cannot end in a draw — someone must go first, or one grip must give — and a tie will be settled for you: the higher d100 takes it, failing that the higher Mastery Level, failing that a d10 roll-off. Only the side starting the contest is asked, and the answer carries through to the result.
2. **Your roll posts to chat** as an ordinary test result card, showing the roll, the effective mastery level, and your success level.
3. **The opposed-request card posts**, inviting the other side to answer.

## The Opposed Action Request card

| Part               | What it shows                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| Title              | **Opposed Action Request**                                                                                    |
| Subtitle           | _{your token}_ vs. _{target token}_                                                                           |
| Body               | _{your token}_ performs a _{test name}_ against _{target token}_                                              |
| Prompt             | _{target actor}_ must now choose what skill to respond with                                                   |
| **Respond** button | Hands the contest to the target token — see [[#responding-to-an-opposed-test\|Responding to an Opposed Test]] |

The card sits in the chat log until someone answers it. Nothing is applied and nothing is locked in the meantime: the contest is only settled when the target's side is rolled, and the card can be answered later — or ignored entirely, and the outcome ruled by hand.

**Only a user who owns the target token (the GM always does) can use the Respond button.** Everyone sees the button, but a click from anyone else is ignored — no one can roll another player's defence for them.

# Responding to an Opposed Test {#responding-to-an-opposed-test}

|               |                                                                                                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Resume Opposed Test                                                                                                                                           |
| **Shortcode** | `opposedTestResume`                                                                                                                                           |
| **Icon**      | `fa-people-arrows` (two figures facing off)                                                                                                                   |
| **Invoked**   | **Hidden — not on the Actions context menu.** Triggered by the **Respond** button on the Opposed Action Request card.                                         |
| **API**       | [`SohlTokenDocumentLogic.opposedTestResume`](https://www.heroiclands.org/sohl/api/classes/sohl.document.token.logic.SohlTokenDocumentLogic#opposedtestresume) |

## What it does

This is the answering half of the contest. It asks the responding character which skill or attribute they are resisting with, rolls it, compares the two results, and posts the outcome.

You will never look for this action on a menu — you click **Respond** on the request card in chat, on your own screen, when the contest comes to you.

## The "Respond to Opposed Test" dialog

Clicking **Respond** opens a dialog titled **_{your character}_ — Respond to Opposed Test** with two fields:

- **Respond with:** — a drop-down listing every skill and attribute on your character that can take part in a contest, shown as _Name_ **(ML:_nn_)** so you can compare their mastery levels at a glance. The first entry is preselected. Only skills and attributes with a usable mastery level are listed; anything whose mastery level is disabled (and anything without one) is left out. Pick whatever fits the fiction — Awareness against a sneak, Stamina against a shove — subject to the GM's ruling.
- **Additional Modifier:** — a bonus or penalty applied to your side of the contest, entered as a whole number (positive helps, negative hurts). Leave it at **0** unless a circumstance calls for it. Whatever you enter is carried into the roll dialog that follows as its Situational Modifier, where you can still change it before rolling.

Closing the dialog without confirming simply declines to answer for now: nothing is rolled and nothing changes. The request card stays in the log, so you can click **Respond** again later.

If the character has no usable skill or attribute at all, you are told so and the contest cannot be answered.

## What happens next

1. **The standard test dialog opens** for the skill or attribute you picked — the same pre-roll dialog as any other test (see [[doc-baseitemug|Base Item]]). Cancelling it leaves the contest unanswered.
2. **The result card posts**, settling the contest.

## The Opposed Action Result card

| Section           | What it shows                                                                                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-side detail   | Each side's test name, its full modifier breakdown (every bonus and penalty that went into the mastery level), and its Success Level Mod                                                                                                                                                |
| **Results** grid  | Side by side for source and target: the token name, the skill or attribute used, **EML** (the number that had to be rolled under), **Roll** (the d100), and the outcome — Critical Success, Marginal Success, Marginal Failure, or Critical Failure                                     |
| Outcome line      | _{token}_ **Wins!** for whichever side had the higher success level, **Tie — No Winner!** when both reached the same level, or **Both Fail!** when neither succeeded                                                                                                                    |
| **Victory Stars** | One star per step of success level between the two sides — **filled** when the side that started the contest won, **hollow** when the side that answered it did. Three stars, for instance, is a Critical Success against a Critical Failure; a tie settled by a tiebreak is always one |

Reading the outcome:

- The winner is the side with the **higher success level**, not the better roll. A Marginal Success beats a Marginal Failure; a Critical Success beats both.
- If **neither** side succeeded, the card reads **Both Fail!** — the contest produced nothing for either party.
- If both sides reached the **same** success level and at least one of them succeeded, the card reads **Tie — No Winner!** and no stars are awarded — two Critical Successes are a tie, not a win for either side.
- Unless you asked for **Break Ties** when you started the contest (see _What happens on screen_ above), in which case the tie is settled, the winner is announced with a single star, and a note says which rule decided it — _Tie broken on the higher roll_, _…on the higher Mastery Level_, or _…on a d10 roll-off_. See the [[doc-oppsdtst|Opposed Tests]] rules for the tiebreak order.
- Rolls, effective mastery levels, and the modifier breakdowns are all shown, so you can see exactly how each side arrived at its result.

A settled contest is a record, not a verdict: nothing is applied to either character automatically. What the win, the tie, or the number of stars _means_ in play is a ruling for the table — see the [[doc-oppsdtst|Opposed Tests]] rules.

## Editing a settled contest (GM only)

The result card's header carries an **edit pencil** — visible only to the GM, the contest's counterpart to the per-result pencil on an ordinary test card (see [[doc-sklltestug|Skill Tests and Opposed Tests]]). Use it when a modifier was missed or misapplied and the contest settled on the wrong number.

Clicking it walks you through **both** sides in turn:

1. The **source** side's test dialog opens, headed with that side's name and pre-filled with the modifiers it actually used.
2. Then the **target** side's dialog opens the same way.
3. The contest is re-scored and a **new** result card posts.

What it does and does not do:

- **Neither side is re-rolled.** Both d100s stay exactly as they fell; only the numbers they are measured against change, so the success levels — and possibly the winner — re-derive from the same dice.
- **No Fate is spent.** This is a correction, not a second chance; Fate remains the player-facing way to improve an outcome.
- **Nothing is overwritten.** The original card stays in the log and the corrected one posts beneath it, so the change is visible rather than silent.
- **Cancelling either dialog cancels the whole edit** — nothing is re-scored and no card is posted.
- Confirming both dialogs without changing anything is a no-op.

# See also

- [[doc-sklltestug|Skill Tests and Opposed Tests]] — the d100 roll-under test both sides of a contest make, and the GM's per-result edit.
- [[doc-oppsdtst|Opposed Tests]] (rules) — Victory Stars, ties, and tiebreaks.
- [[doc-cmbtbscsug|Combat Basics]] — attack against defence, the combat-specific form of an opposed test.
- [[doc-scnsetuptokug|Scene Setup and Tokens]] — placing tokens and configuring them.
- [[doc-baseitemug|Base Item]] — the standard test dialog every roll uses.
- [[doc-userguide|User Guide]] — back to the index.
