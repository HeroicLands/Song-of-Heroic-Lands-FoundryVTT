---
shortcode: mapnotes
name: {full: Map Notes, aliases: []}
type: doc
subType: howto
description: "Authoring a map as a markdown note: the Foundry Scene exported under `data.scene`, asset fixups, pins bound to the note's own pages, and the place the map depicts."
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Map Notes

See also: [[doc-typecatalog|Type Catalog]], [[doc-scenetokencombatant|Scene, Token, and Combatant Systems]], [[doc-assetconventions|Asset Conventions]]

A **map note** is a markdown note in `assets/content/` that compiles to a Foundry
`Scene`. The Scene is built in Foundry's own Scene editor and exported; the note
holds that export whole, alongside the prose that describes the map. The build
never constructs a Scene: walls, doors, lights, sounds, regions, levels and
every other Scene setting are made in Foundry.

Every map note is `type: map`. Its `subType` says what kind of map it is, and
all four carry an exported Scene:

| `subType:`    | Kind                                                    |
| ------------- | ------------------------------------------------------- |
| `battlemap`   | A tactical map at combat scale.                         |
| `localmap`    | A settlement or local area.                             |
| `regionalmap` | A large-scale chart.                                    |
| `totm`        | A theatre-of-the-mind map, essentially one large image. |

A `totm` map can carry lighting and sound like any other Scene. The subtype also
selects the page layout when the map is printed in a book.

## Producing the Scene

1. In a Foundry world, create the Scene and build it completely: background
   image, grid, walls, lights, sounds, regions, levels and pins.
2. Open the **Scenes** tab of the sidebar, right-click the Scene, and choose
   **Export Data**. Foundry saves the whole Scene document as a JSON file.
3. Paste that JSON under `data.scene` in the map note. YAML accepts JSON
   directly, so the export can be pasted as it is.

The export is the whole Scene. The build checks only that `data.scene` is an
object, passes the rest through unchanged, and reads two stable things from it:
each level's background image and the Scene's dimensions, which it uses to stage
the background as an asset and to print the map in a book. The book prints every
subtype's picture from the level backgrounds of the exported Scene.

## Frontmatter

A map note's `data:` carries exactly three fields:

| Field        | Shape             | Meaning                                                                   |
| ------------ | ----------------- | ------------------------------------------------------------------------- |
| `data.scene` | an object         | The Scene document exported from Foundry.                                 |
| `data.fixup` | a list of entries | Replacements that point the Scene's asset paths at this package's assets. |
| `data.place` | an Address        | The place the map depicts.                                                |

`data.place` names one place, because a place has several maps and a map depicts
one place. Folder placement, `description`, `tags` and the rest of the envelope
are the same as for any other note.

## Asset fixups

An exported Scene names its art by the paths of the world it was built in, such
as a level's background. Those paths do not exist after the package is
installed. `data.fixup` replaces each one with an asset Address of this package
(see [[doc-assetconventions|Asset Conventions]]), which resolves to the shipped
file when the Scene is compiled.

Each entry has `path`, `type: address` and `value`. The path starts at
`data.scene` and is a property path; array elements are selected by index or by
the stable `_id` of the embedded document, which survives Foundry reordering an
array on export. A path must name one existing string or null field and the
address must resolve, or the build fails.

```yaml
data:
  fixup:
    - {
        path: ".levels[defaultLevel0000].background.src",
        type: address,
        value: sohl-none-image-parchment,
      }
    - { path: ".sounds[0].path", type: address, value: sohl-none-audio-swoosh1 }
```

Fixups change the compiled copy only; the Scene in the note stays as exported.

## Pins

A map pin is a Foundry Note on the exported Scene. Setting the pin's text to
`#anchor` binds it to the page of the map note's own body that carries that
anchor: the compiled pin opens the JournalEntry generated from the note, on that
page, and shows the page's heading. The pin keeps its exported position, icon and
other settings. A pin whose text does not use `#anchor` keeps its exported text
and references, and an anchor matching no page fails the build.

The note's body is split into pages by its top-level headings, and a heading
takes its anchor from `{#anchor}`:

```markdown
# The Hearth {#hearth}
```

Binding runs after fixups. When the Scene has pins, the Adventure bundle carries
the Scene together with the generated JournalEntry, so importing it preserves the
identifiers the pins address.

## Example

```yaml
---
shortcode: wolfden
name: { full: The Wolf's Den, aliases: [] }
type: map
subType: battlemap
description: "A burrow under a hillside, one chamber deep."
tags: []
data:
  place: wolfden
  scene:
    name: The Wolf's Den
    width: 1900
    height: 2600
    initialLevel: defaultLevel0000
    levels: [{ _id: defaultLevel0000, name: Den, background: { src: worlds/demo/den.webp } }]
    notes: [{ _id: NNNNNNNNNNNNNNNN, text: "#lair", x: 950, y: 2350 }]
  fixup:
    - path: ".levels[defaultLevel0000].background.src"
      type: address
      value: sohl-none-image-parchment
---
# The Lair {#lair}

The chamber at the end of the burrow, where the wolf sleeps.
```

The `place` address must name a place note that exists in the package or one of its
declared dependencies.
