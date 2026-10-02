---
shortcode: mystclpwug
name: {full: Mystical Powers}
type: doc
subType: userguide
data: {packFolder: userguide}
---

# Overview

Mystical powers in SoHL encompass all supernatural abilities — arcane spellcasting, divine miracles, spiritual gifts, and other extraordinary capabilities.

They arrive on a character as two kinds of item, and the difference matters: a [[doc-mysteryug|Mystery]] is a standing condition the character _is_ subject to, applied through the effects it carries; a [[doc-mysticalabilityug|Mystical Ability]] is an act the character _performs_, and it has a test of its own. This page covers using them at the table; those two pages cover the items themselves. What the traditions actually _are_ is the rules chapter [[doc-estrcint|Esoterica]].

# Using Mystical Abilities {#using-mystical-abilities}

Invoking a Mystical Ability is a **Success Test** — mechanically identical to
the Skill test it is built on, and read by the same four outcomes. There is no
separate preparation step: an ability is ready to invoke the moment it is on
the character's sheet, held in reserve for whenever the player chooses to use
it.

1. Open the character's sheet and go to the **Mysteries** tab.
2. Find the ability under **Mystical Abilities**.
3. Click its **EML** cell to open the standard test dialog, or hold **Shift**
   while clicking to skip it and roll at once.
4. The d100 is rolled against the ability's Effective Mastery Level, and a
   result card posts naming the outcome.

The EML already carries everything the system knows that applies to this
ability, including the casting penalty a high-level Incantation pays, so the
number on the sheet is the number you are rolling under, with nothing further
to add at the moment of casting. If the ability uses **charges**, a completed
roll spends one; see [[doc-mysticalabilityug|Mystical Ability]] for what
happens when they run out.

**What a success buys — duration, range, and the effect itself — is not
computed by the system.** SoHL settles the roll and reports the outcome;
everything the ability then _does_ is read from its description and the
rulebook, and applied by the people at the table. This holds for every
tradition alike: a prayer, a spell, and a spirit rite all resolve through the
identical roll, and all three hand the result to the table the same way.

**A caution on the cost of casting.** Whether invoking a given ability costs
Fatigue, and how much, is a property of that ability's own writeup, not a rule
the system enforces — track and apply it by hand, the same as duration and
range.

**What tells a miracle from a spell** is the tradition it belongs to, not the
roll: a Divine Incantation and an Arcane Incantation use the identical
mechanic, including the same casting penalty by Level, and a Spirit Rite
differs only in drawing its mastery level from a Spirit Power instead of a
Skill. See [[doc-estrcint|Esoterica]] (rules) for what distinguishes the
traditions themselves.

# Mystical Devices {#mystical-devices}

A **Mystical Device** — an enchanted weapon, a holy relic, a charged ring — is
a magic item imagined to carry mystical abilities of its own, wielded rather
than learned.

> **Known gap.** SoHL defines no Mystical Device item, and dropping an item
> onto a character's sheet does not carry any ability nested inside it onto
> the Mysteries tab — only a Mystery or Mystical Ability embedded directly on
> the character appears there. Until a Mystical Device item exists, write its
> abilities as ordinary Mystical Abilities on the wielding character, and
> handle attunement and the device changing hands by table ruling.

# The Mysteries Tab {#the-mysteries-tab}

The Mysteries tab on a Being's sheet carries two independent lists, one below
the other. Nothing nests one inside the other — a Mystery that happens to
govern an Ability draws no line between the two rows.

**Mysteries**, grouped into one section per subtype and always shown even when
empty. A row shows the mystery's name, its Associated Skill and Affiliation if
it has one, its Level, and its Charges as current/maximum (or ∞ for an
unlimited source). Each subtype's section header carries its own **Add**
button, which creates a new Mystery of that subtype directly; drag one from a
compendium to add an authored one instead.

**Mystical Abilities**, grouped the same way into one section per subtype,
with each subtype showing only the columns that mean something for it — a
Spirit Rite's row names its Spirit Power where an Incantation's names its
Associated Skill, for instance. Each row's **EML** cell is the roll; an
ability that is out of charges, or a Spirit Rite or Spirit Action with no
valid Spirit Power, is greyed out and cannot be rolled.

Removing either is the same action every item carries: open its context menu
and choose **Delete** — described on [[doc-baseitemug|Base Item]].

# See also

- [[doc-mysticalabilityug|Mystical Ability]] — the item, its Effective Mastery Level, and the Success Test that performs it.
- [[doc-mysteryug|Mystery]] — the item, and how a standing condition is applied.
- [[doc-affltnug|Affiliation]] — the standing a power can draw on.
- [[doc-beingug|Being]] — the sheet the Mysteries tab belongs to.
- [[doc-sklltestug|Skill Tests and Opposed Tests]] — how the roll behind a casting is read.
- [[doc-baseitemug|Base Item]] — the standard test dialog a casting opens, and the shared Edit/Delete/Output actions.
- [[doc-estrcint|Esoterica]] (rules) — what the traditions are, and what each ability does.
- [[doc-userguide|User Guide]] — back to the index.
