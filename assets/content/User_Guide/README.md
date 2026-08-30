---
aliases:
  - Song of Heroic Lands User Guide
  - SoHL User Guide
id: 9ULGczXC3UwIpgzI
type: doc
category: user-guide
name:
  full: Song of Heroic Lands User Guide
  aliases: []
shortcode: userguide
folder: IgwaG8rAUUO9vrtz
---

_Song of Heroic Lands_ ships as a game system for Foundry Virtual Tabletop, and this guide is how it is operated: what the sheets show you, what the system asks you, what it keeps track of on your behalf, and where to click for each of it.

If you want to be playing in ten minutes, go straight to the [[doc-quickstart|Quickstart]] and come back.

## What this guide covers, and what it does not

This guide describes the **implementation** — the sheets, the buttons, the dialogs, the chat cards, and the settings. It does not describe the game.

The game itself is the [[doc-rulesintro|Song of Heroic Lands Rules]]: what a Mastery Level is, how a Success Test is graded, what a wound does to a character. Those pages are written as though no virtual tabletop existed, and **where the two ever differ, the rules are what the game is** and the implementation is what needs fixing. Read a rules page to learn what a procedure _means_; read the page here to learn where the button is.

SoHL is compatible with [_HârnMaster: Roleplaying in the World of Kèthîra_](https://www.kelestia.com/hmk-pdf) (HMK) by Kelestia Productions Ltd., so a group may play with those rules on this system. Use either the abbreviated SoHL rules or the HMK book — which I heartily recommend.

## What to Expect: SoHL Assists, It Doesn't Play for You

Before you dig in, it helps to know the one idea the whole system is built around, because it shapes how everything behaves.

**SoHL is an _assistant_ for playing HârnMaster on Foundry — not a video game that plays HârnMaster for you.** Its job is to take the drudgery out of play: the constant dice-rolling, table look-ups, and time-keeping. Its job is _not_ to make your character's decisions or resolve their fate on its own.

So the system holds to one rule, everywhere:

> **It guides, prompts, and reminds — it never acts on your character without your say-so.** Nothing is rolled, scheduled, or applied to a character until a human chooses it. One player can never make the system act on another player's character.

In practice, that means the system **offers**; you decide. When a choice comes up it shows up one of two ways, and the difference is simply _who_ answers:

- a **dialog** pops up when the choice is yours to make right now, on your own screen (with the sensible defaults already filled in — usually you just click OK); or
- a **button on a chat card** waits in the log when the response should come later, or from someone else (say, a physician answering a call for treatment). Nothing happens until the right person clicks it.

You can always ignore an offer, do the thing by hand instead, or have the GM step in — nothing gets stuck, and nothing happens behind your back.

**An example.** Your character takes a wound. Rather than silently starting a healing clock, SoHL asks you: _"Set a reminder to check this wound's healing in 5 days?"_ You say yes (or change the timing, or decline). Five days of game-time later, a **Perform** button appears in the chat log — the wound has **not** healed or worsened on its own; it's just reminding you. You click it when you're ready, the healing check is rolled, and it offers to set the next reminder. Treatment, bleeding, shock, and disease all follow the same shape: _offer → remind → perform → offer the next._

That's the pattern to expect throughout: helpful nudges and one-click rolls at the right moments, with you (and the GM) always in the driver's seat.

## How to read this

The chapters below are in the order a new group meets them: get a world running, learn to read a sheet, then the things on the sheet, then the things you do with them. Each is written on the terms the ones before it defined, so if you are reading rather than looking something up, read them in order.

1. **[[doc-quickstart|Quickstart]]** — install the system, import a character, and make your first roll. The shortest path from nothing to playing.
2. **Setting up a world** — the GM's opening moves: [[doc-systmstt|System Settings]] (calendar, healing interval, fate rules, and the rest), [[doc-usngcmpn|Using Compendiums]] (what ships with the system and how to import it), [[doc-crtngact|Creating Actors and Items]] (the four ways to make one), and [[doc-chrctrcr|Character Creation]] (building a playable character end to end).
3. **[[doc-undrstnd|Understanding Sheets]]** — the sheet anatomy every actor and item shares: the header, the tab strip, and what each tab is for. Read this before the chapters that describe individual sheets. Alongside it, [[doc-iconlgnd|Icon Legend]] identifies every glyph the system uses, and [[doc-shrtcds|Shortcodes]] explains the identifier that appears on every sheet.
4. **[[doc-ugactors|Actors]]** — the four kinds of actor and how to choose between them: [[doc-being|Being]], [[doc-cohort|Cohort]], [[doc-structure|Structure]], and [[doc-vehicle|Vehicle]].
5. **[[doc-ugitems|Items]]** — nearly everything a character _is_ or _carries_: attributes, skills, affiliations, wounds, afflictions, mysteries, and every kind of gear. Start from [[doc-baseitem|Base Item]], which describes what every item type has in common. Using gear at the table — equipping, nesting, and handing it over — is [[doc-wrkngwth|Working with Gear and Equipment]].
6. **Making tests** — [[doc-sklltsts|Skill Tests and Opposed Tests]] is the ordinary roll and how to read its result card; [[doc-thftsyst|The Fate System]] is how a settled result can still be improved; and [[doc-actions|Actions]] is the mechanism behind every button the system offers you, including the script actions a GM writes for a house rule.
7. **Scenes and tokens** — [[doc-scnstpan|Scene Setup and Tokens]] places actors on a map (and expands a cohort into its members), and [[doc-token|Token]] covers what you do from a placed token: starting an opposed test against another token, and answering one.
8. **[[doc-cmbtbscs|Combat Basics]]** — the two ways to run a fight, assisted and automated, and how a hit is resolved either way. [[doc-cmbtnt|Combatant]] then covers the combat tracker itself: groups, the combatant row, and answering an attack.
9. **[[doc-afflandi|Afflictions and Injuries]]** — what to do when a character is hurt or sick: how wounds and diseases arrive, what they cost, and the reminder loop that carries them to a resolution.
10. **[[doc-mystclpw|Mystical Powers]]** — using the supernatural at the table: the Mysteries tab, casting and miracle-working, and mystical devices.

**Customizing the system** is the last chapter, and is for GMs who want to go past what the sheets offer: [[doc-sfexprss|Safe Expressions]] is the small expression language SoHL evaluates wherever a value can be computed, [[doc-effcttrg|Effect Targeting]] is how an active effect chooses what it applies to, and [[doc-clndrjsn|Calendar JSON Format]] is the shape of a custom calendar.

## Where to look something up

- **A glyph you do not recognize** — [[doc-iconlgnd|Icon Legend]].
- **A button on a sheet or a chat card** — the page for the item or actor it belongs to. The four buttons that belong to _everything_ are on [[doc-baseitem|Base Item]].
- **A rules term** — the rules [[doc-glossary|Glossary]], which indexes every term the rules define.
- **A setting** — [[doc-systmstt|System Settings]].
