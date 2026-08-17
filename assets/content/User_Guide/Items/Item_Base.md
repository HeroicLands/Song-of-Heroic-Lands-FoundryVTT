---
aliases:
  - Base Item
  - doc-baseitem
id: DXyazxuH0KLFWj4l
type: doc
package: sohl
category: user-guide
name:
  full: Base Item
shortcode: baseitem
folder: QtOgPodi8X6gDWL0
---

In Foundry VTT, one of the main document types is the Item. Items represent things that are associated with an actor: skills, gear, etc. In _Song of Heroic Lands_, there are a large number of items.

# Standard Sheet Tabs

The Item sheet displays information about the individual item. There are generally four tabs: **Properties**, **Description**, **Actions**, and **Events**.

## Properties Tab

Although each type of Item has different properties, some properties are common among all Items. These properties include:

- **Shortcode:** A relatively short alphanumeric text string that uniquely identifies this item within similarly-typed items. The shortcode is often used in code to identify an item, since name can change through localization (shortcodes are never localized). See [[doc-shrtcds|Shortcodes]] for what a shortcode means and why two items that share one are treated as the same thing.
- **Notes:** A single-line note associated with an item that is normally displayed on the character sheet next to the item. This differs from the Description, which is a rich text multi-line block of text.

## Documentation Tab

- **Doc URL:** URL to the detailed documentation for this item. Normally points to the `www.heroiclands.org` site, but might also point elsewhere if applicable. Normally only one of **Doc URL** or **Documentation** are specified, not both.
- **Documentation:** A multi-line documentation property containing text describing the item in detail. Normally used with an inline editor providing rich text (including tables) in HTML format.

A **Documentation** field holding nothing but a link is a special case worth knowing about: the item then takes its description from whatever the link points at, and the tab shows that text instead of the link. See [[#a-description-that-is-only-a-link|a description that is only a link]].

## Actions Tab

Actions represent specific behaviors that can be triggered. Some of these are predefined, others can be custom made. See [[doc-actions|Actions]] for how actions work as a mechanism — the action types, their fields, and who is permitted to run them.

Most actions belong to one kind of item, and are documented on that item's own page. A handful belong to **everything**, and are documented here once: [[#the-shared-document-actions|the shared document actions]]. Several **dialogs** are shared the same way — nearly every roll in SoHL opens [[#the-standard-test-dialog|the standard test dialog]] — and those are described once here too.

To reach an item's actions, **right-click the item's row** on the actor sheet, or open the item and use its **Actions** tab.

## Effects Tab

Various active effects can be applied to an item that either effect the item, the actor the item is located on, or other items on the same parent actor.

## A Description That Is Only a Link {#a-description-that-is-only-a-link}

A description made of **a link and nothing else** is read as a _pointer_: the item is saying "my description lives there" rather than carrying its own prose. The item then shows whatever the link points at — a journal page, or another item's description — wherever the description is displayed.

This is a **choice**, not a new requirement. The **Documentation** field is unchanged, and ordinary prose still works exactly as it always has. The shorthand exists so a hundred copies of a weapon do not each carry their own copy of the same paragraph, and so correcting the paragraph once corrects it everywhere.

**Writing one.** Put a link in the **Documentation** field and delete everything else. Drag a journal page onto the field, or type `@` in the editor and pick the page from the list; either way the editor shows a link. Save, and the item takes its description from the target.

**What counts as "nothing else".** How the link is _wrapped_ makes no difference — a link inside a heading, in bold, or trailed by blank lines is still just a link. What matters is whether anything else would be **read**:

| Documentation field contains                             | Read as                                |
| -------------------------------------------------------- | -------------------------------------- |
| A link to _Weaponcraft_                                  | A pointer — shows Weaponcraft's text   |
| A link to _Weaponcraft_, then "— the craft it draws on." | Ordinary prose, shown exactly as typed |

The second line is the one that catches people out: a sentence that merely _begins_ with a link is your own writing, and your words are never thrown away in favour of the target's.

**Reading one.** The **Documentation** tab shows the linked text rather than the link, so the description is in front of you without leaving the sheet. Links inside that text stay live — click one to open the page itself. If the target has been deleted or moved, the tab shows the broken link instead of going blank, so you can see what went wrong and re-aim it.

**Editing one.** A small **pencil** in the upper right of the tab swaps the text for the editor, with the link in it. Change where it points, or replace it with prose and it stops being a pointer. The icon becomes an open book, which switches back to reading. Closing the sheet always returns it to reading; without the pencil the description would look as though it had become read-only, which it has not.

**Posting one.** [[#output-description-to-chat|Output Description to Chat]] follows the pointer too, and posts the target's text — never the bare link.

# The Shared Document Actions {#the-shared-document-actions}

Four actions are not features of any one item type — they belong to every document that has them, and every other page in this guide links here rather than repeating them.

| Action                                                      | Shortcode           | Belongs to      | Where you meet it    |
| ----------------------------------------------------------- | ------------------- | --------------- | -------------------- |
| [[#edit\|Edit]]                                             | `editDocument`      | Every document  | Actions context menu |
| [[#delete\|Delete]]                                         | `deleteDocument`    | Every document  | Actions context menu |
| [[#output-description-to-chat\|Output Description to Chat]] | `outputDescription` | Every **item**  | Actions context menu |
| [[#make-default-medium\|Make Default Medium]]               | `makeDefaultMedium` | Every **actor** | The movement rows    |

None of them roll anything, and none of them touch another character's sheet.

> The combat tracker is the one place **Edit** and **Delete** are deliberately left out of the menu: the tracker has its own controls for both. See [[doc-cmbtnt|Combatant]].

# Edit {#edit}

|               |                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Name**      | Edit                                                                                                             |
| **Shortcode** | `editDocument`                                                                                                   |
| **Icon**      | `fa-pen-to-square` (a pencil on paper)                                                                           |
| **Invoked**   | The **Actions** context menu                                                                                     |
| **API**       | [`SohlLogic.editDocument`](https://api.heroiclands.org/main/classes/sohl.core.logic.SohlLogic.html#editdocument) |

Opens the document's own sheet — the same window you would get by double-clicking its row. Nothing is rolled, nothing is posted to chat, and nothing changes until you edit a field on the sheet itself.

It exists as an action because the context menu is often closer to hand than the row: when you have right-clicked a skill to run a test and find you want to look at the skill instead, **Edit** is right there.

# Delete {#delete}

|               |                                                                                                                      |
| ------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Delete                                                                                                               |
| **Shortcode** | `deleteDocument`                                                                                                     |
| **Icon**      | `fa-trash` (a waste basket)                                                                                          |
| **Invoked**   | The **Actions** context menu                                                                                         |
| **API**       | [`SohlLogic.deleteDocument`](https://api.heroiclands.org/main/classes/sohl.core.logic.SohlLogic.html#deletedocument) |

Deletes the document — **after asking**. Deletion cannot be undone from within SoHL, so the action never removes anything on the strength of one click.

## The confirmation dialog

A small dialog names what is about to go, with the warning _"This {type} will be deleted and cannot be recovered. Are you sure?"_ — where _{type}_ is the document's own type, such as _Skill_ or _Weapon Gear_.

| Button     | What it does                                                      |
| ---------- | ----------------------------------------------------------------- |
| **Delete** | Deletes the document                                              |
| **Cancel** | Changes nothing. **This is the default** — pressing Enter cancels |

Closing the dialog with the window's ✕ also cancels. The safe answer is the easy one on purpose.

> **Known gap.** The confirmation window's **title bar** currently reads `Delete undefined}: {name}` instead of naming the document type (issue #1095). The warning text inside the dialog is correct, and the buttons behave as described; only the title is malformed.

## Containers delete their contents

A [[doc-cntnr|Container]] asks a stronger question, because the answer costs more: its dialog is titled **Delete Container: _{name}_** and warns _"WARNING: All items in this container will be deleted as well!"_. Confirming removes the container **and everything inside it** in one step.

If you want to keep the contents, move them out of the container first, then delete the empty container.

# Output Description to Chat {#output-description-to-chat}

|               |                                                                                                                                                     |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Output Description to Chat                                                                                                                          |
| **Shortcode** | `outputDescription`                                                                                                                                 |
| **Icon**      | `fa-message` (a speech bubble)                                                                                                                      |
| **Invoked**   | The **Actions** context menu on any item                                                                                                            |
| **API**       | [`SohlItemBaseLogic.outputDescription`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SohlItemBaseLogic.html#outputdescription) |

Posts the item's own description to the chat log, so the table can read it without anyone opening the sheet. Use it to show the party what a found relic says about itself, to put a spell's text in front of everyone before it is cast, or to answer "what does that skill actually cover?" once, for everybody.

It **shows** and does not **do**: the card carries no buttons, and nothing about the item or its owner changes.

## The description card

| Part         | What it shows                                                                       |
| ------------ | ----------------------------------------------------------------------------------- |
| Title        | The item's name                                                                     |
| Subtitle     | The item's type — _Skill_, _Weapon Gear_, _Mystery_, and so on                      |
| **Notes**    | The item's one-line **Notes** field, when it has one                                |
| **Text Ref** | The item's text reference, for item kinds that carry one                            |
| **Charges**  | Remaining charges as _value / max_ (or just the value when the item has no maximum) |
| Body         | The item's **Documentation** text, formatted, with any links and rolls made live    |

When the **Documentation** field holds nothing but a link, the card posts what the link points at rather than the link itself — see [[#a-description-that-is-only-a-link|a description that is only a link]].

Rows with nothing in them are left out, so a bare item posts a card with just its name and type.

Everyone in the chat log sees the card. If a description would spoil something, read it before you post it.

# Make Default Medium {#make-default-medium}

|               |                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Name**      | Make Default Medium                                                                                                                                    |
| **Shortcode** | `makeDefaultMedium`                                                                                                                                    |
| **Icon**      | `fa-person-swimming` (a swimmer)                                                                                                                       |
| **Invoked**   | The **☆ star** on a movement row of the actor sheet's Profile tab, tooltipped _"Make this the current move medium"_                                    |
| **API**       | [`SohlActorBaseLogic.makeDefaultMedium`](https://api.heroiclands.org/main/classes/sohl.document.actor.logic.SohlActorBaseLogic.html#makedefaultmedium) |

Chooses **which way the character is currently moving**. An actor may have several movement profiles — one for each medium it can travel through — and only one of them is active at a time. This action makes the one you clicked the active profile.

The mediums are **Terrestrial**, **Aquatic**, **Aerial**, **Burrowing**, **Astral**, and **None**.

The choice is not cosmetic. The active profile is what feeds the character's **feet per round** and **leagues per watch**, so switching a swimming creature from Terrestrial to Aquatic changes what it can cover in a combat round and in a day's travel. Set it when a character enters the water, takes to the air, or comes back out.

No dialog opens and nothing is posted to chat — the star moves to the row you clicked and the movement figures re-derive at once. Clicking the row that is already current changes nothing.

**Click the star, not the action.** This action has to be told _which_ medium you meant, and only the star carries that. Reached any other way — from an action list, or a macro that does not name a medium — it does nothing at all (issue #1098).

# The Shared Dialogs

Three dialogs turn up over and over, attached to actions all across the system. They are described here once; the per-action entries elsewhere in this guide name the dialog and link back here rather than listing its fields again.

| Dialog                                                | When you see it                                                 |
| ----------------------------------------------------- | --------------------------------------------------------------- |
| [[#the-standard-test-dialog\|Standard test dialog]]   | Before almost every roll — your chance to modify it             |
| [[#the-strike-mode-picker\|Strike-mode picker]]       | A combat action on an item with more than one way of being used |
| [[#the-offer-schedule-dialog\|Offer-schedule dialog]] | An effect with a recurring check asks whether to set a reminder |

A fourth, [[#editing-a-posted-test-result-gm|the GM's result edit]], re-opens the standard test dialog on a roll that has already been posted.

# The Standard Test Dialog {#the-standard-test-dialog}

**Nearly every roll in SoHL opens this dialog first.** Skill tests, attribute tests, healing checks, morale, treatment — if an action ends in a d100, this is the window that appears before the dice are thrown. It is your chance to say what the situation is worth before the roll is made, rather than arguing about it after.

| Field                      | What it is                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| **Target**                 | Read-only. The number the roll must come in at or under, with everything already applied                                                                 |
| _The modifier breakdown_   | Read-only. Every modifier making up that target, itemized, so you can see where the number came from                                                     |
| **Situational Modifier**   | A whole number you type in — positive for favorable circumstances, negative for adverse ones. Starts at 0                                                |
| **Success Level Modifier** | A whole number that shifts the **result** rather than the roll: +1 turns a marginal success into a critical one, −1 the reverse                          |
| **Roll Visibility**        | Who sees the roll and its result                                                                                                                         |
| **Break Ties**             | Opposed tests only, and only for the side starting one. Off by default; ticked, a tied contest is settled instead of reported as a tie — see [[doc-token | Token]] |

**Situational Modifier vs. Success Level Modifier.** The first changes how likely you are to succeed; the second changes how well you did once you have. Use the situational modifier for the ordinary "that's harder than usual" adjustments — darkness, a bad footing, a helpful assistant. The success-level modifier is the rarer tool, for rules and effects that grade a result up or down without making the attempt itself easier.

**Roll Visibility** offers:

| Option      | Who sees what                                                   |
| ----------- | --------------------------------------------------------------- |
| **System**  | Whatever your Foundry client's default chat roll mode is set to |
| **Public**  | Everyone sees the roll and the result                           |
| **Private** | Only the GM sees it                                             |
| **Blind**   | Only the GM sees it — **not even you**, the roller              |
| **Self**    | Only you see it                                                 |

**Cancelling abandons the test.** Dismissing the dialog — the ✕, or Escape — rolls nothing, posts nothing, and changes nothing. A test you started by mistake costs you a keystroke, not a re-write of the chat log.

Some tests add extra fields to this same window when their action needs them — an aim, an impact modifier, a target's movement. Those belong to combat and are described with the actions that use them; see [[doc-cmbtbscs|Combat Basics]] and [[doc-cmbtnt|Combatant]].

A few actions deliberately **skip** this dialog and roll straight away, because the difficulty is not yours to set — the Trauma page's **Treatment Test** is the clearest example, where the wound decides the difficulty. Each such action says so in its own entry.

# The Strike-Mode Picker {#the-strike-mode-picker}

A weapon can have more than one way of being used — a blade that also has a pommel, a spear that thrusts or is thrown. Each of those is a **strike mode**. When you run a combat action and SoHL cannot tell which mode you meant, it asks.

The dialog is titled **Choose Strike Mode**, prompts _"Select which strike mode to use:"_, and offers a single dropdown listing every strike mode on the item by name.

| Button     | What it does                                  |
| ---------- | --------------------------------------------- |
| **Use**    | Runs the action with the selected strike mode |
| **Cancel** | Abandons the action; nothing is rolled        |

**You will often not see it at all**, which is by design:

- An item with **one** strike mode never asks — a combat technique always has exactly one, and a simple weapon usually does.
- Clicking a strike mode **on the combat tab** already says which mode you meant, so no picker appears.

The picker is what you get when the action was reached some other way — from the weapon's own Actions menu, or from a macro — with two or more modes to choose between.

# The Offer-Schedule Dialog {#the-offer-schedule-dialog}

SoHL never schedules anything on its own. When an effect has a recurring check — a wound's healing check, an infection's course test, a disease's onset — the system **offers** to set a reminder and waits for a human to say yes.

The dialog is titled **Set a _{Effect}_ Reminder?**, naming the specific check, so two offers arriving back-to-back are told apart at a glance. It asks:

> _Set a reminder to perform the {effect} in {when}?_

There are no fields to fill in — the cadence is already worked out and shown to you (_"in 5 days"_, _"in 4 hours"_). An effect tied to a moment in combat rather than to a duration reads accordingly: _"…at the end of each turn?"_

| Button          | What it does                                                        |
| --------------- | ------------------------------------------------------------------- |
| **Schedule It** | Arms the reminder. **This is the default** — pressing Enter accepts |
| **Not Now**     | Arms nothing, and clears any existing reminder for that check       |

**Declining is always safe.** It does not cancel the wound, the infection, or the disease — it only means SoHL stops keeping time for you, and you run the check by hand when the table decides it is due.

Accepting does not hand anything over either. When the time comes, a **reminder card** appears in chat saying _"A scheduled effect has come due. Perform it when ready."_ with a **Perform** button. Nothing has happened to the character yet: the check runs when its owner presses that button, and afterwards the next one is offered the same way.

> **offer → remind → perform → offer the next.** Every recurring effect in SoHL follows this loop, and a human answers at each step.

# Editing a Posted Test Result (GM) {#editing-a-posted-test-result-gm}

|               |                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Name**      | Edit Test Result                                                                                                                      |
| **Shortcode** | `resultEdit`                                                                                                                          |
| **Icon**      | `fa-pen-to-square` (a pencil, in the card's title bar)                                                                                |
| **Invoked**   | **Hidden — not on the Actions context menu.** The pencil on a posted test-result card. **GMs only**                                   |
| **API**       | [`SohlItemBaseLogic.resultEdit`](https://api.heroiclands.org/main/classes/sohl.document.item.logic.SohlItemBaseLogic.html#resultedit) |

Every standard test-result card carries a small pencil beside its title — but only on a GM's screen. Pressing it re-opens [[#the-standard-test-dialog|the standard test dialog]] for a roll that has already been made, pre-filled with the modifiers that roll actually used.

This is the GM's counterpart to [[doc-thftsyst|Fate]]: where a player spends Fate to nudge a result, a GM adjusts the arithmetic that produced it — because a modifier was forgotten, or applied when it should not have been.

**It never re-rolls.** The die is already cast and stays cast. Only the two modifier fields are yours to change:

- **Situational Modifier** — changes the effective target, so the success level re-derives from the same frozen roll.
- **Success Level Modifier** — a flat shift applied to the settled result.

Submitting re-evaluates the test on that original die and **reposts the card** with the corrected outcome. Cancelling changes nothing, and pressing OK without having changed a field does nothing at all — no re-evaluation, no second card.

The dialog is the standard test dialog, so it also shows **Roll Visibility** — but changing it here has no effect: the reposted card keeps the visibility the original roll was made with (issue #1099).

The pencil is not shown to players, and the action refuses a non-GM even if the click reaches it another way, with the notice _"Only a GM may edit a test result."_

# See also

- [[doc-actions|Actions]] — how actions work as a mechanism: types, fields, visibility, and execute permissions.
- [[doc-undrstnd|Understanding Sheets]] — the sheets these tabs belong to.
- [[doc-shrtcds|Shortcodes]] — what a shortcode means and why it matters.
- [[doc-sklltsts|Skill Tests]] — what the numbers in the standard test dialog are doing.
- [[doc-thftsyst|Fate]] — the player-side counterpart to the GM result edit.
- [[doc-cmbtbscs|Combat Basics]] and [[doc-cmbtnt|Combatant]] — the combat actions that add fields to the standard test dialog, and where strike modes come from.
- [[doc-itemtrauma|Trauma]] and [[doc-afflctn|Affliction]] — the recurring checks that use the offer-schedule dialog most.
- [[doc-ugitems|Items]] — every item type at a glance.
- [[doc-userguide|User Guide]] — back to the index.
