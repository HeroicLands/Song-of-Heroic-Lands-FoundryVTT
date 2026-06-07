---
"sohl": minor
---

Restructure and improve the developer/user documentation for readability and usability

An intentional, major reorganization of the developer/API documentation. The
goal is a clearer information architecture, consistent per-document framing,
better lateral cross-linking, and refreshed navigation so developers can find
the right document for their goal quickly. The documentation set is now scoped
as _developer/contributor/API-facing only_ — player- and GM-facing rules live at
heroiclands.org and are linked to rather than duplicated.

- **API navigation grouped by architecture** — the generated TypeDoc site
  (api.heroiclands.org) previously rendered the entire public API as a single
  flat, alphabetical class list. The entry-point generator
  (`utils/build-docs-entry.mjs`) now emits a tree of barrel modules that mirrors
  `src/`, so the API sidebar groups symbols as **Core**, **Documents**
  (`Actor`, `Item`, `Combat`, `Combatant`, `Chat`, `Effect`, `Scene`, `Token`),
  **Domain** (`Action`, `Body`, `Modifier`, `Movement`, `Result`, `StrikeMode`,
  `SkillBase`), **Utility** (`AI`, `Collection`, `Constants`, `Helpers`), and
  **Applications**. Each barrel is a TypeDoc `@module` whose full slashed name
  drives folder nesting via `navigation.includeFolders`; `constants.ts` and
  `SkillBase` get dedicated modules so no single node is overwhelming. The HTML
  and Markdown TypeDoc configs and `tsconfig.docs.json` are updated to consume
  the bundle tree via an `expand` entry-point strategy.
- **A real API landing page with in-site guides** — the TypeDoc site no longer
  uses the project `README.md` as its home (which pitched the game, not the
  API). A dedicated `docs/api-home.md` introduces the reference, keeps the
  banner image, explains the Core/Documents/Domain/Utility layout, and links to
  the guides. The concept, how-to, reference, and contributing guides are pulled
  into the site via TypeDoc `projectDocuments`, so they appear in the left
  navigation alongside the generated modules instead of being unreachable.
- **Generated type catalog** — `docs/reference/type-catalog.md` is now generated
  (`utils/build-type-catalog.mjs`, wired into `docs:prepare`) from authoritative
  sources: the `ACTOR_KIND`/`ITEM_KIND` enums (the type set), `lang/en.json`
  (display names), and each Logic class's TSDoc summary (descriptions). It can
  no longer drift from the code — adding a type adds a row — and it picked up the
  `attribute`, `trauma`, and `lineage` types the hand-maintained version had
  dropped.
- **Drift-resistant architecture overview** — `concepts/architecture.md` is the
  canonical "start here". Its hand-maintained inventories (per-file directory
  annotations, the actor/item type tables, the domain class lists) are replaced
  by directory-level descriptions plus links to the generated reference, so the
  page does not go stale as files are added, renamed, or moved.
- **Cleaner class documentation** — the boilerplate "Logic for the **X** … type
  —" lead-in is removed from all twenty-one actor and item Logic class TSDoc
  comments; each now opens directly with its description.
- **Single hub and tidied tree** — `docs/README.md` is the one developer/API
  hub (the redundant `docs/dev/` index is retired); a `docs/contributing/` area
  holds maintainer/meta docs; working notes and player-facing rules content that
  duplicated heroiclands.org were removed from the repository.
- **Local preview** — new `docs:serve` and `docs:watch` scripts serve the built
  site (and rebuild on change) via `http-server`.
- **Readability** — documents are sorted into the appropriate Di&#225;taxis
  bucket (concepts, how-to, reference), given consistent "who is this for"
  framing, and cross-linked; stable localization keys, data fields, and code
  remain untouched.
