---
title: "Skill Tests and Opposed Tests"
slug: "skill-tests"
category: "User Guide"
sort: 21
tags:
    - mechanics
    - skills
    - tests
    - dice
foundry:
    folderId: 9s8n7Xo2h5l1v3a
    ownership:
        default: 0
        y4rrosWqroRqTLhW: 3
---

# Overview {#tests-overview}

Most actions in SoHL are resolved through **skill tests** — rolling dice
against a target number derived from a character's skill mastery level.
When two characters compete, the system uses **opposed tests** to determine
the winner.

See also: [Skills](user-guide/item-skill.md), [Combat Basics](user-guide/combat-basics.md)

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

<!-- TODO: Document the exact success/failure determination rules for
     both Legendary and MistyIsle variants. Include the critical success
     and critical failure thresholds. -->

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
base formula of `@str, @dex` — meaning it averages Strength and Dexterity.

The skill base is calculated automatically when attributes are set. The
mastery level builds on top of the skill base through training and experience.

See [Skills](user-guide/item-skill.md) for more about how skill bases work.

<!-- TODO: Document how skill improvement works — SDR (Skill Development
     Roll), experience-based advancement, and the relationship between
     mastery level base and effective mastery level -->
