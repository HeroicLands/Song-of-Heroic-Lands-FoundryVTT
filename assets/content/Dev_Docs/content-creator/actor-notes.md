---
shortcode: actornotes
name: {full: Actor Notes, aliases: []}
type: doc
subType: howto
description: "Authoring a `being`, and the `(type, shortcode)` address space its embedded items resolve through."
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Actor Notes

See also: [[doc-authoringworkflow|The Authoring Workflow]], [[doc-itemfrontmatter|Item Note Frontmatter]], [[doc-assetconventions|Asset Conventions]]

An **actor note** is a markdown note that compiles to a Foundry `Actor`. Like an
item note it carries an _essence_ rather than a mirror of the Foundry document:
the compiler supplies the envelope, and the note says what this creature is,
what it can do, and what it is carrying.

The distinguishing feature, and the thing most worth understanding before you
write one, is that **an actor note does not contain its items — it addresses
them**. Its skills, attributes and gear are named by the address of the item each
copies and resolved at build time against the compiled item packs. That address space is
what the second half of this page is about.

## One type compiles, not four

The system defines four Actor types — `being`, `cohort`, `structure` and
`vehicle` (see the [[doc-typecatalog|Type Catalog]]). **The content
pipeline compiles exactly one of them: `being`.** Every actor note in
`assets/content/` is a being.

That is not an oversight in the compiler so much as a statement about where
those documents come from. A cohort, a structure and a vehicle are created in
play, from a sheet; none of them is a thing an author writes down in advance and
ships in a compendium. Only a being is.

The consequence for an author is worth stating plainly: **a note whose `type:`
is `cohort`, `structure` or `vehicle` is claimed by no compiler pass and is
skipped without a word.** It is not an error — the walk simply finds no pass
that selects it — so it compiles nothing, reports nothing, and looks exactly
like a note that worked. The same silence covers any misspelled type.

Two spellings _do_ fail loudly. `character` and `creature` both name what is
`being`, and either throws, naming the replacement and saying the fix is
mechanical.

## The envelope

A being carries the frontmatter every note carries — `name.full`, `type`,
`shortcode`, `packFolder`, and the required `templatePriority` — all
described in [[doc-authoringworkflow|The Authoring Workflow]]. One art field is
specific to actors:

| Field | Becomes                                          | Default                 |
| ----- | ------------------------------------------------ | ----------------------- |
| `img` | the actor's image, and its prototype token's art | the generic person icon |

It resolves through the rules in [[doc-assetconventions|Asset Conventions]].

**A picture of the being is not a field.** A portrait is a picture of the
subject, so it is written in the prose that describes the subject — the **lead
image**, an ordinary embedded image opening the `{#appearance}` section. Nothing
about that embed is special; what is strict is the convention that it comes
first, so every being note reads the same way.

**The body prose is two documents, not one.** A being's markdown body is read
for two anchored sections, and only those:

```markdown
# Appearance {#appearance}

![[aldric|Aldric of Kaldor]]{float=top-left}

Weathered, and taller than most.

# Dossier {#dossier}

Known to the watch at Kaldor.
```

They become `system.appearance` and `system.dossier`. Prose outside a recognised
anchor is not compiled anywhere — unlike an item note, whose whole body becomes
its documentation journal.

## The `sohl:` block

| Field                | Shape            | Meaning                                                                |
| -------------------- | ---------------- | ---------------------------------------------------------------------- |
| `items`              | list of entries  | Everything the being embeds: attributes, skills and gear. See below.   |
| `system`             | nested object    | The being's own document fields, at the data model's paths. See below. |
| `defaultCombatGroup` | string           | Which side it joins in a combat. Emitted only when declared.           |
| `attrRollFormula`    | string           | The formula shown for the being's attribute rolls.                     |
| `templatePriority`   | number or `null` | Required, as on every item note.                                       |

### `system`

`sohl.system` is written at the data model's own paths, so the being's physical
body is `sohl.system.body`, with `sohl.system.currentMoveMedium` and
`sohl.system.movementProfiles` beside it. Movement sits flat _alongside_ the body
rather than inside it, because movement is a universal actor capability rather
than a property of a body.

A being that authors no body is incorporeal and keeps the data model's empty
body — that is a supported state, not a missing field.

```yaml
sohl:
  system:
    body:
      weight:
        base: 165
      reachBase: 5
      bodyScaleBase: 1
      personalFatigue: enc
    currentMoveMedium: terrestrial
    movementProfiles:
      - medium: terrestrial
        feetPerRound: 30
        leaguesPerWatch: 4
```

Attributes and skills are not keys of their own. Each is an entry in
`sohl.items` that names the catalogue item it copies, with the score or the
mastery level as that entry's `system` overlay.

## The address space

This is the part that has no counterpart in an item note.

**A being names an item by its address (`type-shortcode`), and never by the
pack it ships in.** At build time the actors pass loads the generated JSON of _every_ Item
pack into one map keyed `type:shortcode`, and each embedded entry is looked up
in it.

```yaml
sohl:
  items:
    - { model: attribute-str, system: { scoreBase: 13 } }
    - { model: attribute-agl, system: { scoreBase: 11 } }
    - { model: skill-dgr, system: { masteryLevelBase: 40 } }
    - model: weapongear-dgr
      system:
        qualityBase: 2
```

An entry names the item it copies with `model` and carries any other keys,
which are **deep-merged over the resolved item**: plain objects merge key by
key, while arrays, primitives and `null` replace outright. That is how the
`weapongear` above ships as a better-than-average dagger without restating the
dagger, and how an attribute carries its `scoreBase` and a skill its
`masteryLevelBase`.

### When an address does not resolve

**A dead address is a hard error**, not a dropped item:

```
actor "Trader Wulfe": no predefined item for "weapongear:Dagr"
```

The pass records it, keeps going, and the accumulated error count makes the
build refuse to compile the packs. So a mistyped shortcode fails the build
rather than shipping an actor quietly missing a weapon, which is the reason to
prefer an address over an inline item wherever one exists.

Other errors in the same family: an entry that is not an object, an entry with
neither a `model` nor a `type`, and an entry with no `model` and too few fields
to stand alone (an item with no address must supply at least a `name`, a `type`
and a `system.shortcode`).

### Uniqueness spans every Item pack

A repository may group its items into several Item packs. Because a
being addresses an item by `(type, shortcode)` alone, those packs are read as
**one address space**, and two packs claiming the same address is ambiguous
rather than a last-one-wins ordering detail:

```
Two Item packs both define "weapongear:Dagger" (…/items and …/relics); a being
addresses an item by (type, shortcode), so the address must be unique across
every Item pack
```

### Items are compiled before actors, and the build derives that

The actors pass reads the items passes' _output_, so it must run after them.
`package-build package compile` schedules it there itself, from what each pass
declares it reads — the order the pack list happens to be written in is not what
decides it. Compiling the actors pack _alone_ still fails outright, and now names
the pack it was waiting on:

```
error: pack "actors" (Actor) reads the compiled output of the Item pack "items",
       which this run does not compile and which build/packs-json/items does not
       hold — compile the whole package, or compile "items" first
```

### A cross-package address names the package

**An unqualified `model` resolves within this build's own Item packs.** To embed
an item that another package defines, the entry writes the longer address,
`package-system-type-shortcode`, and the repository declares that package as a
dependency whose relationship sets `itemCatalog: true`:

```yaml
sohl:
  items:
    - { model: sohl-sohl-skill-wpnc, system: { masteryLevelBase: 40 } }
    - { model: sohl-sohl-attribute-str, system: { scoreBase: 13 } }
```

`npm run build:deps` downloads the pinned release of each such dependency and
extracts its Item packs into a local cache; the compile reads only that cache
and never reaches the network. A cold cache fails the compile naming the
`deps fetch` step that fills it.

A local item shadows a foreign one with the same address, while two _local_
packs claiming one address still collide. An address that resolves in no
catalogue is a hard error, and generation refuses to compile any pack from
incomplete output, so one broken Actor pack stops the Item packs with it.

### An entry that carries its item inline

An entry with no `model` addresses nothing, so it must stand alone: it supplies
its own `type`, `name` and `system`, with the item's identity in
`system.shortcode`. A top-level `shortcode` on an entry is refused, as is an
entry stating both `model` and `type`, because the address in `model` already
names the type.

```yaml
sohl:
  items:
    - type: weapongear
      name: Heirloom Dagger
      system:
        shortcode: heirloomdgr
        qualityBase: 3
```

Prefer an address wherever the item exists in a catalogue: an inline item is
data the note owns, with nothing to keep it in step with the item it resembles.
Cross-package _links_ in prose go through the
[[doc-linkmanifest|link manifest]]; an embedded item is data that has to exist
at build time.
