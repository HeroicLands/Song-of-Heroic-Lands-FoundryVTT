# Authoring a Macro Content Note

See also: [Linking Between Content Notes](./content-links.md), [Macros and Actions](../concepts/macros-and-actions.md), [Build, Deployment, and Release](../how-to/build-and-deployment.md)

A content note with `type: macro` compiles into a Foundry **Macro** in the
`macros` compendium — and, separately, into a **JournalEntry** holding that
macro's documentation. This page is the authoring convention: what the note must
contain, what the `{#script}` anchor does, and which of the two documents each
part of the note ends up in.

## One note, two documents

| Compiled by                                  | Becomes                                | Addressed as               |
| -------------------------------------------- | -------------------------------------- | -------------------------- |
| `@heroiclands/content-build/engine/macros`   | a **Macro** in `packs/macros`          | `[[macro-<shortcode>]]`    |
| `@heroiclands/content-build/engine/journals` | a **JournalEntry** in `packs/journals` | `[[docmacro-<shortcode>]]` |

This is the same arrangement an item note already uses — frontmatter becomes the
document, body becomes its write-up — so the same virtual `doc<type>` qualifier
addresses it. See
[An item and its documentation are two documents](./content-links.md#an-item-and-its-documentation-are-two-documents).

**Nothing is withheld from the journal.** Every page of the body compiles into
the JournalEntry, the `{#script}` page included, so a reader can read the macro's
source as documentation. The macro compiler reads the same page again for its own
purposes; the two passes never look at each other's output.

## The `{#script}` anchor

The macro's `command` is the **first language-tagged JavaScript fence** on the
page whose heading carries the anchor `{#script}`:

````markdown
# Script {#script}

```js
await CONFIG.SOHL.class.Utility.currentCombatantAttack();
```
````

Three rules follow from that, and each of them is deliberate:

- **The anchor names the page, not the heading text.** Word the heading however
  reads best ("Script", "The Macro", "Source"); the compiler and any inbound link
  both look for the slug. `[[docmacro-autoattack#script]]` opens exactly this
  page.
- **The fence must be language-tagged** — ` ```js ` or ` ```javascript `. An
  untagged fence is a code sample whose language nobody stated, and treating it as
  executable would turn an illustrative snippet into the macro.
- **Only the first tagged fence counts.** Prose around it and any later fence are
  ignored by the macro compiler and still render in the journal, so a note may
  document its macro with examples that are plainly not the macro.

Missing either the `{#script}` page or a tagged fence on it is a **build error**.
A macro with no command is a macro-bar button that does nothing, which is worse
than a build that stops.

## Frontmatter

```yaml
---
type: macro
name:
  full: Automated Attack
id: HSNwLca3kMYLN3Ag
shortcode: autoattack
img: icons/game-icons/lorc/crossed-swords.svg
package: sohl
folder: null
aliases:
  - Automated Attack
  - macro-autoattack
---
```

| Key               | Meaning                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`            | `macro` — this is what routes the note to the macros pack. It is **not** the Foundry macro type.                                                      |
| `id`              | The Foundry document id of the Macro. The JournalEntry's id is derived from it.                                                                       |
| `shortcode`       | The note's identity, and half of every address that reaches it.                                                                                       |
| `img`             | Optional. A content-relative `icons/…` path is rooted under this system's assets; omitted, the macro takes Foundry's own `icons/svg/dice-target.svg`. |
| `folder`          | A folder id declared in `assets/content/macro-folders.yaml`, or `null`.                                                                               |
| `sohl.macroType`  | Optional; defaults to `script`. See below.                                                                                                            |
| `sohl.macroScope` | Optional; defaults to `global`. One of `global`, `actors`, `actor`.                                                                                   |

### `sohl.macroType` — and why `chat` is rejected

Foundry's Macro schema initialises `type` to `CHAT`, so a script macro must state
its type explicitly; the compiler always does, defaulting the authored field to
`script`.

`sohl.macroType: chat` is a **build error**, not an unimplemented feature. A chat
macro's `command` is chat text rather than source, so none of the `{#script}`
fence rules describe it — compiling one through this path would ship a macro
whose body was a code block posted verbatim into chat. If chat macros are ever
wanted as content, they need their own authoring convention.

## Why this is not "compiling data into code"

[Non-negotiable rule 10](../concepts/security-model.md) forbids compiling
data-derived strings into code — no `eval`, no `new Function`, no
`Handlebars.compile` of authored text. A Macro's `command` is not that. It is
**authored source shipped as content**, stored in a document Foundry itself
executes through its own macro runner, under the permission model that already
governs every macro in a world. The security model names a Macro UUID as one of
the _references_ data is allowed to carry. Nothing in the compiler evaluates,
compiles, or revives anything; it copies text from a markdown fence into a JSON
field.

## Known divergence: the journal's copy of a script

The macro's `command` is read from the note's **raw** markdown. The journal's
copy of the same fence is not: it has been through table expansion and wikilink
conversion first.

Wikilink conversion is not yet fence-aware, so a script containing something that
looks like a wikilink — a nested single-element array index, `grid[[0]]` — has
that text rewritten in the **rendered journal page** while the executable copy
stays exactly as written. The macro always runs what the author wrote; only the
documentation can misrender. Tracked as
[#1505](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1505).

## Where the code lives

| File                                          | Role                                                                                                                                         |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `@heroiclands/content-build/engine/macros`    | The macros compiler: fence extraction, frontmatter validation, the Macro document.                                                           |
| `@heroiclands/content-build/engine/journals`  | Compiles the same note's body into its JournalEntry.                                                                                         |
| `@heroiclands/content-build/engine/item-docs` | `docEntryTypes()` — the one set naming every type that carries separate documentation, read by the compilers and by the link manifest alike. |
| `assets/content/macro-folders.yaml`           | The macros pack's folder hierarchy.                                                                                                          |
