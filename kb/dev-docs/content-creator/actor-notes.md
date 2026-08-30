# Actor Notes

See also: [The Authoring Workflow](authoring-workflow.md), [Item Note Frontmatter](item-frontmatter.md), [Asset Conventions](asset-conventions.md)

An **actor note** is a markdown note that compiles to a Foundry `Actor`. Like an
item note it carries an _essence_ rather than a mirror of the Foundry document:
the compiler supplies the envelope, and the note says what this creature is,
what it can do, and what it is carrying.

The distinguishing feature, and the thing most worth understanding before you
write one, is that **an actor note does not contain its items — it addresses
them**. Its skills, attributes and gear are named by `(type, shortcode)` and
resolved at build time against the compiled item packs. That address space is
what the second half of this page is about.

## One type compiles, not four

The system defines four Actor types — `being`, `cohort`, `structure` and
`vehicle` (see the [Type Catalog](../reference/type-catalog.md)). **The content
pipeline compiles exactly one of them: `being`.** All 95 actor notes in
`assets/content/` are beings.

That is not an oversight in the compiler so much as a statement about where
those documents come from. A cohort, a structure and a vehicle are created in
play, from a sheet; none of them is a thing an author writes down in advance and
ships in a compendium. Only a being is.

The consequence for an author is worth stating plainly: **a note whose `type:`
is `cohort`, `structure` or `vehicle` is claimed by no compiler pass and is
skipped without a word.** It is not an error — the walk simply finds no pass
that selects it — so it compiles nothing, reports nothing, and looks exactly
like a note that worked. The same silence covers any misspelled type.

Two spellings _do_ fail loudly. `character` and `creature` were one distinction
with two spellings that compiled to the same `being` with no branch anywhere
between them; they were retired in #1580 and now throw, naming the replacement
and saying the fix is mechanical.

## The envelope

A being carries the frontmatter every note carries — `name.full`, `type`,
`shortcode`, `id`, `folder`, and the required `sohl.archetype` — all
described in [The Authoring Workflow](authoring-workflow.md). Two art fields are
specific to actors:

| Field      | Becomes                                           | Default                      |
| ---------- | ------------------------------------------------- | ---------------------------- |
| `img`      | the actor's image, and its prototype token's art  | the generic person icon      |
| `portrait` | `system.portrait`, the sheet's character portrait | the same generic person icon |

Both resolve through the rules in [Asset Conventions](asset-conventions.md).

**The body prose is two documents, not one.** A being's markdown body is read
for two anchored sections, and only those:

```markdown
# Appearance {#appearance}

Weathered, and taller than most.

# Dossier {#dossier}

Known to the watch at Kaldor.
```

They become `system.appearance` and `system.dossier`. Prose outside a recognised
anchor is not compiled anywhere — unlike an item note, whose whole body becomes
its documentation journal.

## The `sohl:` block

| Field                | Shape                     | Meaning                                                      |
| -------------------- | ------------------------- | ------------------------------------------------------------ |
| `attributes`         | map of shortcode → number | Embedded attribute items, each opened at that score.         |
| `items`              | list of entries           | Everything else the being embeds. See below.                 |
| `body`               | nested object             | The being's physical body. Omit it for an incorporeal being. |
| `currentMoveMedium`  | string, default `"none"`  | Which medium it is currently moving through.                 |
| `movementProfiles`   | list of profiles          | Speed per medium.                                            |
| `defaultCombatGroup` | string                    | Which side it joins in a combat. Emitted only when declared. |
| `archetype`          | number or `null`          | Required, as on every item note.                             |
| `folder`             | folder id                 | From `actor-folders.yaml`.                                   |

**`sohl.skills` is ignored.** It is read by nothing and compiles to nothing.
Skills are embedded through `sohl.items`, like every other item; a `skills:`
block is silently inert, which makes it exactly the kind of authoring mistake
this page exists to prevent.

### `body`

`sohl.body` mirrors `system.body` field for field: `structure`, `weight`
(`base`, `calc`), `reachBase`, `bodyScaleBase` and `personalFatigue`. Movement
sits flat _alongside_ it rather than inside it, because movement is a universal
actor capability rather than a property of a body.

Absence is meaningful. **A being that omits `sohl.body` is incorporeal** and
keeps the schema's empty body — that is a supported state, not a missing field.
What is _not_ supported is a `sohl.body` that is present but not an object; that
is reported as an error naming the note and the type it got instead.

```yaml
sohl:
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

## The address space

This is the part that has no counterpart in an item note.

**A being names an item by `(type, shortcode)`, and never by the pack it ships
in.** At build time the actors pass loads the generated JSON of _every_ Item
pack into one map keyed `type:shortcode`, and each embedded entry is looked up
in it.

```yaml
sohl:
  attributes:
    str: 13
    agl: 11
  items:
    - type: skill
      shortcode: Dagger
    - type: weapongear
      shortcode: Dagger
      system:
        qualityBase: 2
```

An entry is `type` (required), an optional `shortcode`, and any other keys,
which are **deep-merged over the resolved item**: plain objects merge key by
key, while arrays, primitives and `null` replace outright. That is how the
`weapongear` above ships as a better-than-average dagger without restating the
dagger.

Attributes are the same mechanism with a shorthand — `str: 13` resolves
`attribute:str` and overlays `system.scoreBase`.

### When an address does not resolve

**A dead address is a hard error**, not a dropped item:

```
actor "Trader Wulfe": no predefined item for "weapongear:Dagr"
```

The pass records it, keeps going, and the accumulated error count makes the
build refuse to compile the packs. So a mistyped shortcode fails the build
rather than shipping an actor quietly missing a weapon — the opposite of the
`skills:` behaviour above, and the reason to prefer an address over an inline
item wherever one exists.

Other errors in the same family: an entry that is not an object, an entry with
no `type`, and an entry with neither a `shortcode` nor enough fields to stand
alone (an item with no address must supply at least a `name` and a `system`).

### Uniqueness spans every Item pack

Since #1566 a repository may group its items into several Item packs. Because a
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
`content-build package compile` schedules it there itself, from what each pass
declares it reads — the order the pack list happens to be written in is not what
decides it. Compiling the actors pack _alone_ still fails outright, and now names
the pack it was waiting on:

```
error: pack "actors" (Actor) reads the compiled output of the Item pack "items",
       which this run does not compile and which build/packs-json/items does not
       hold — compile the whole package, or compile "items" first
```

### A cross-package address does not work

**The address space is one build's Item packs — not the packages it depends
on.** A being in a module cannot embed an item defined in another package's
compendium by shortcode, because that package's items were never compiled into
this build's JSON tree and are simply absent from the map.

This is not hypothetical. It is what blocked the `sohl-kethira-basic` migration
(#1513): its 17 character notes carry 895 embedded-item references across 113
distinct addresses belonging to the `sohl` package, which that repository does
not hold. Every one of them resolves to nothing.

There are two honest answers, and no third. Either the module **defines the
items it embeds**, in its own content tree and its own Item pack, or the being
**carries the item inline** — an entry with no `shortcode`, supplying its own
`name` and `system`, which stands alone precisely because it addresses nothing.
Cross-package _links_ are a solved problem via the
[link manifest](../reference/link-manifest.md), but a link is a reference a
reader follows; an embedded item is data that has to exist at build time.
