---
id: b44b338b7c4477fb
type: doc
subType: user-guide
name:
  full: "Shortcodes"
shortcode: shortcodesug
folder: IgwaG8rAUUO9vrtz
---

Every Actor and every Item in SoHL carries a **shortcode** — a short, plain-text label such as `bsw` for a broadsword or `basic-folk` for the starter character. It sits right under the name on the sheet, and it usually fills itself in, so it is easy to overlook. But the shortcode is how the system knows _what a thing is_, and a little understanding of it goes a long way — especially once you start importing from the compendiums.

See also: [[doc-crtngactitemug|Creating Actors Items]], [[doc-usingpacksug|Using Compendiums]]

# What a Shortcode Is

A shortcode is a stable, never-translated handle for a document. Names change: you rename characters, and the same skill is called different things in different languages. The shortcode does not change with any of that, so the system uses it — rather than the display name — whenever it needs to refer to a specific thing in rules, expressions, and effect targeting.

Think of the **name** as what you _call_ something and the **shortcode** as _which thing it is_.

# One Code Per Thing, Within a Type

A shortcode is unique **within a type**. "Type" here means the kind of document:

- Among **Actors**, each type is its own list — no two **Beings** share a shortcode, and no two **Vehicles** share one, but a Being and a Vehicle may safely reuse the same code.
- Among **Items**, the same holds per Item type — no two Skills share a shortcode, no two Weapons share one, and so on.

You do not have to manage this by hand. When you create an Actor or Item the shortcode fills in from the name and is kept unique for you; if you type one that is already taken by another document of the same type, the create dialog flags it and keeps **Create** disabled until you pick a free one.

# Same Shortcode Means the Same Thing

This is the idea worth remembering:

> **Two documents of the same type with the same shortcode represent the same thing, logically — even if they are separate copies.**

Two Beings that share the shortcode `basic-folk` are two copies of the _same_ character concept. Their internal ids differ, and their details may differ — one may have been leveled up, re-equipped, or wounded — but because the type and shortcode match, the system treats them as the same entity. The same is true for Items: two Weapons with the same shortcode are the same weapon, whatever their individual condition or tweaks.

Sameness of _(type + shortcode)_ is what identity means here — not the internal id, and not the current values.

# Why It Matters: Matching

Because the shortcode carries identity, it is what lets the system **match** one document against another. That matters most between the **compendiums** and your **world**:

- When you import **Basic Folk** and later customize your copy, it still "is" the Basic Folk from the compendium, because they share a type and shortcode — the id and the values changed, the identity did not.
- Archetypes (the starting templates in the Create dialog) work the same way: if you keep a world copy's shortcode the same as a shipped archetype, your copy _shadows_ the original in the picker — the system recognizes them as the same archetype and prefers yours. (See [[doc-crtngactitemug|Creating Actors Items]].)

# In Practice

For everyday play you can mostly ignore shortcodes — they fill in and stay unique on their own. Keep two things in mind:

- **Leave the shortcode alone if you want a copy to stay "the same thing"** as its compendium or archetype original. Rename the display name however you like; only the shortcode governs the match.
- **Change the shortcode when you want a genuinely new, distinct thing** — a new kind of being or a bespoke item that should not be matched to anything shipped.

# See also

- [[doc-baseitemug|Base Item]] — where the shortcode field lives on an item sheet.
- [[doc-usingpacksug|Using Compendiums]] — importing content, and why the copy stays matched to its original.
- [[doc-crtngactitemug|Creating Actors and Items]] — duplicating a thing, and when to give the copy a new shortcode.
- [[doc-ugitems|Items]] — the item types a shortcode identifies.
- [[doc-sfexprssug|Safe Expressions]] — expressions that name a skill or attribute by its shortcode.
- [[doc-userguide|User Guide]] — back to the index.
