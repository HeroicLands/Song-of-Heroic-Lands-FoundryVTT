---
aliases: []
name:
    full: "Build, Deployment, and Release"
    aliases: []
id: 2lkG02SkmKisa2xK
slug: build-and-deployment
type: doc
package: sohl
category: dev-docs
folder: null
---

# Build, Deployment, and Release

Everything you need to take Song of Heroic Lands (SoHL) from a fresh clone to a
running Foundry instance and a published release: environment setup, every npm
script, how the build pipeline works, the layout of the `build/` directory,
compendium packs from in-repo Markdown, deploying to a Foundry instance, and the
release process. **Manual steps are called out explicitly** with a 🔧 marker.

> Audience: maintainers and contributors working on the SoHL system itself. For
> the rules of contributing, see
> [System Development](../contributing/system-development.md).

## 1. First-time setup

🔧 **Prerequisites:** **Node.js ≥ 24** (see `engines` in `package.json`) and
**Git** — that's all you need to build and test. Deploying to a Foundry instance
may need extra access depending on the target (for example, SSH for a remote host).

```bash
git clone https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT.git
cd Song-of-Heroic-Lands-FoundryVTT
cp .env.local.example .env.local   # then edit — see below
npm ci                             # clean install from package-lock.json → node_modules/
npm run build                      # full build into build/stage/
```

🔧 **`.env.local`** (gitignored — each developer keeps their own) holds the Foundry
paths that drive deployment. You only need it when deploying to a Foundry instance;
[§6 Deploying to a Foundry instance](#6-deploying-to-a-foundry-instance) lists
every variable and what it's for.

See the file **`.gitignore`** for the specifics of which files are local only
and not stored in the repo. In particular, if you create a `nogit` folder,
anything inside of it will be ignored. If you use VSCode or IntelliJ, those
IDE configurations will also be ignored.

## 2. npm scripts

Every script in `package.json`, grouped by purpose. `run-s` runs steps in
sequence; `run-p` runs them in parallel.

### Build

| Script                | What it does                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build`               | Full production build: `npm ci` then `build:noci`. The canonical "build it all" entry.                                                            |
| `build:local`         | Same as `build` but `npm i` (allows lockfile updates) instead of `npm ci`.                                                                        |
| `build:noci`          | The pipeline without install: `lint:todos → lint:docs-index → build:types → lint:dts → build:prepare → test:coverage → test:purity → build:code`. |
| `build:prepare`       | In parallel: `build:css`, `build:db`, `build:system`.                                                                                             |
| `build:types`         | TypeScript type-check / compile (`tsc -p tsconfig.json`). No emit beyond `.d.ts`/checking.                                                        |
| `build:css`           | Compile `scss/sohl.scss` → `build/stage/css/sohl.css` (Sass).                                                                                     |
| `build:system`        | Generate `build/stage/system.json` from the template + `package.json` version (`utils/build-system-json.mjs`).                                    |
| `build:assets`        | Copy `templates/`, `lang/`, `assets/*`, `LICENSE.md`, `README.md` into `build/stage/` (`utils/copy-assets.mjs`).                                  |
| `build:db`            | `build:assets` then `build:compiledb` — stage assets, then compile packs.                                                                         |
| `build:compiledb`     | Generate JSON from `assets/content/` Markdown, then compile LevelDB packs in `build/stage/packs/`.                                                |
| `build:unpackdb`      | The reverse: unpack the staged LevelDB packs back to JSON (for inspection).                                                                       |
| `build:code`          | Bundle the system with Vite (`vite build --mode release`) → `build/stage/sohl.js`.                                                                |
| `build:icons`         | Rebuild the icon font from SVGs (`utils/build-icon-font.mjs`). Run by hand when icons change.                                                     |
| `build:kb-content`    | Generate the site's Markdown: `assets/content/` + `kb/dev-docs/` → `kb/content/kb/` (`utils/build-kb-content.mjs`). No Hugo needed.               |
| `build:kb`            | `build:kb-content` then render it with Hugo → `build/site/sohl/`. Needs Hugo and the theme submodule.                                             |
| `site:assemble`       | Mount the TypeDoc HTML at `build/site/sohl/api/` and finish the deployable tree (`utils/build-site.mjs`).                                         |
| `build:site`          | The whole of `/sohl/`: `docs:prepare → docs:html → build:kb → site:assemble`.                                                                     |
| `build:pack-release`  | Zip `build/stage/` → `build/dist/system.zip` and copy `system.json` (`utils/pack-release.mjs`).                                                   |
| `clean` / `distclean` | Remove build output (`distclean` also clears caches/`node_modules`-level artifacts).                                                              |

### Compendium packs

| Script            | What it does                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `build:compiledb` | Generate each pack's per-entry JSON from the `assets/content/` Markdown into `build/packs-json/<pack>/`, then compile LevelDB from it. |
| `build:unpackdb`  | Extract a compiled LevelDB pack back to per-entry JSON under `build/tmp/packs/`.                                                       |

The authoritative content is the in-repo Markdown under `assets/content/`; the
JSON is a disposable `build/` intermediate. There is no vault step — `build:compiledb`
reads the Markdown directly.

#### Scene ↔ Level integrity

`build:compiledb` reads each pack **back off disk** after writing it and fails the
build if a Scene has lost its embedded `Level`.

A v14 Scene keeps its map image on a `Level`, and a compiled pack stores the two
under separate LevelDB keys — the Scene at `!scenes!<id>` holding `levels` as an
array of ids, each Level at `!scenes.levels!<sceneId>.<levelId>`. Nothing in
Foundry ties them together on read. A missing Level record only produces a
warning (`N embedded levels records in Level <id> were undefined and not
retrieved from the scenes.levels sublevel`), after which the collection reads as
empty; the next world launch migrates that Scene and **persists `levels: []`**,
leaving `initialLevel` dangling. The map image is then gone for good, and the
only symptom is a blank battlemap. That is measured behaviour on both 14.359 and
14.367 — the core is not at fault, but the condition is unobservable until it is
permanent.

The check therefore runs against the compiled bytes rather than the JSON they
came from, because the gap it closes is the *write* path: the emitter is already
unit-tested, whereas the compendium CLI has previously mishandled Scene Levels.
An `Adventure` carries its scenes inline, levels and all, so that second shape is
checked too. The rule itself is a pure function (`utils/packs/scene-levels.mjs`)
and is unit-tested directly.

### Tests, lint, format

| Script                    | What it does                                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `test`                    | Run the vitest suite once.                                                                                                    |
| `test:watch` / `test:ui`  | Watch mode / the vitest UI.                                                                                                   |
| `test:coverage`           | Run with coverage.                                                                                                            |
| `test:purity`             | The Foundry-free purity check (`vitest.purity.config.ts`).                                                                    |
| `e2e:full`                | _(on demand)_ The Cypress integration suite against a licensed Foundry container — not part of CI. See [Testing](testing.md). |
| `lint` / `lint:fix`       | ESLint over `src/` (with `--fix`).                                                                                            |
| `lint:todos`              | Fail if any `TODO`/`FIXME` marker appears under `src/` (deferred work belongs in issues).                                     |
| `lint:docs-index`         | Fail if a `docs/` page is missing from its section nav or the README.                                                         |
| `lint:packs`              | Fail on a duplicate `(type, shortcode)` within a compendium pack (`assets/content/`). See [Shortcode Integrity](../reference/shortcode-integrity.md). |
| `lint:rules-vtt`          | Fail if a rules document under `assets/content/Rules/` describes the VTT — clicks, buttons, dialogs, the chat log, or "the system". See [Authoring content notes](#authoring-content-notes). |
| `lint:content-links`      | Fail on a `#anchor` link in `assets/content/` that no heading declares, or a `Rules/**` document unreachable from the rules root. See [Authoring content notes](#authoring-content-notes). |
| `lint:doc-links`          | Fail on a relative link in `kb/dev-docs/` whose target does not exist, or an `#anchor` no heading declares. The developer tree links by path, so moving a page breaks every link into it; this is what says so. |
| `lint:expr-scopes`        | Fail if the generated expression-scope table in [Expressions and Scripts](../concepts/expressions.md) is out of date with `src/entity/expr/expression-scopes.mjs`. Regenerate with `npm run docs:expr-scopes`. |
| `lint:dts`                | Validate the generated public type surface.                                                                                   |
| `lint:bundle-globals`     | Fail if `system.json` loads `sohl.js` as a classic script while the bundle declares names at global scope. Needs a built stage — runs after `build:code`, not inside `lint`. |
| `format` / `format:check` | Prettier write / check the whole repo.                                                                                        |

### Docs

| Script                      | What it does                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `docs`                      | Full doc build: `docs:prepare → docs:html → docs:md`.                                  |
| `docs:prepare`              | `docs:catalog` (generate the type catalog) + `docs:expr-scopes` (generate the expression-scope table). |
| `docs:expr-scopes`          | Regenerate the bound-variables table in [Expressions and Scripts](../concepts/expressions.md) from the scope catalog. |
| `docs:html` / `docs:md`     | TypeDoc HTML / Markdown output.                                                        |
| `docs:coverage`             | Report doc-comment coverage.                                                           |
| `docs:serve` / `docs:watch` | Serve `build/docs-html` / rebuild-and-serve on change.                                |

### Deploy and release

| Script                                     | What it does                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `push:dev` / `push:qa` / `push:prod`       | 🔧 copy `build/stage/` to the matching `FOUNDRYVTT_*_DATA` instance.                               |
| `deploy:dev` / `deploy:qa` / `deploy:prod` | 🔧 `build` then the matching `push:*`.                                                             |
| `deploy:release`                           | `build` then `build:pack-release` — produce the release zip locally.                               |
| `changeset`                                | Create a changeset (interactive). See [Writing Changesets](../contributing/writing-changesets.md). |
| `changeset:version`                        | Apply pending changesets: bump the version and update `CHANGELOG.md` (normally run by CI).         |
| `changeset:check`                          | Verify a changeset exists.                                                                         |
| `build:sohl-types`                         | Regenerate `packages/sohl-types/index.d.ts` from the SoHL source (run by that package's `prepack`). |
| `build:content-build-types`                | Regenerate `packages/content-build/types/**.d.mts` from that package's JSDoc (run by its `prepack`). |

## 3. The build pipeline

`npm run build` runs `npm ci` then `build:noci`, which is:

1. **`lint:todos`** — no `TODO`/`FIXME` markers under `src/`.
2. **`lint:docs-index`** — every `docs/` page is linked from its section nav and the README.
3. **`build:types`** — `tsc` type-checks the whole project.
4. **`lint:dts`** — the generated public type surface is valid.
5. **`build:prepare`** (parallel):
    - **`build:css`** — Sass → `build/stage/css/sohl.css`.
    - **`build:db`** — copy assets, then compile packs to `build/stage/packs/`.
    - **`build:system`** — write `build/stage/system.json`.
6. **`test:coverage`** and **`test:purity`** — the suite must pass.
7. **`build:code`** — Vite bundles `src/sohl.ts` → `build/stage/sohl.js` (single ES
   module, sourcemap, unminified, with `emptyOutDir: false` so it doesn't wipe the
   staged CSS/assets/packs).
8. **`lint:bundle-globals`** — the manifest loads the bundle the way it was built.

The result is a complete, deployable system in **`build/stage/`**.

### The bundle is an ES module — the manifest must say so

`sohl.js` is built as an **ES module**, so `system.json` lists it under
**`"esmodules"`**. That is not a stylistic choice, and the two must never drift
apart: listing it under `"scripts"` makes Foundry load the same file as a
**classic script**, which changes where its top-level declarations live.

- In a module, every top-level `const`/`let`/`class` is **module-scoped** —
  private to the bundle.
- In a classic script, those declarations become **global lexical** bindings. One
  whose name matches a _non-configurable_ property of `window` throws
  `SyntaxError: Identifier 'x' has already been declared` at **parse time**,
  before any of the system runs — so the whole system fails to load.

Bundled dependencies really do declare such names: `@codemirror/view` (inlined for
the SafeExpression editor) declares `const chrome`, and `style-mod` declares
`const top`. `window.chrome` is `configurable: false` and `window.top` is
`[Unforgeable]`, so under `"scripts"` either one is fatal. The release build is
deliberately **unminified**, so these identifiers survive verbatim — Foundry's own
CodeMirror build escapes the problem only because minification renames them.

`npm run lint:bundle-globals` (`utils/check-bundle-globals.mjs`, part of
`build:noci`) enforces the agreement: it parses the built bundle exactly as a
browser would and fails if `sohl.js` is served as a classic script while declaring
anything at global scope.

## 4. The `build/` directory layout

```
build/
├── stage/            THE DEPLOYABLE SYSTEM — what Foundry loads
│   ├── sohl.js(.map) bundled system code (Vite)
│   ├── system.json   generated manifest (version, packs, compatibility, URLs)
│   ├── css/sohl.css  compiled styles
│   ├── templates/    Handlebars templates (copied)
│   ├── lang/         localization (copied)
│   ├── assets/       icons, fonts, audio, ui, silhouette (copied)
│   ├── packs/        compiled LevelDB compendium packs
│   └── docs/         generated HTML API docs (after `npm run docs`)
├── dist/             release files — uploaded to the GitHub Release
│   ├── system.zip    the released system archive (a zip of build/stage/)
│   └── system.json   the released manifest
├── docs/             the Markdown documentation tree (from docs:md)
├── docs-html/        the generated API documentation (from docs:html)
├── site/             THE DEPLOYABLE WEBSITE — what Cloudflare Pages serves
│   ├── _redirects    sends the deployment's own root to /sohl/
│   ├── _headers      noindex on the host-assigned *.pages.dev addresses
│   ├── 404.html      a real 404 for a path outside /sohl/
│   └── sohl/         everything published at www.heroiclands.org/sohl/
│       ├── index.html  the package landing page
│       ├── 404.html    the 404 for every address under /sohl/
│       ├── kb/         the knowledgebase (Hugo)
│       └── api/        the API documentation (TypeDoc, mounted here)
└── tmp/              scratch (e.g. unpacked packs)
```

**`build/stage/` _is_ the system directory.** Its contents are exactly what an
installed `Data/systems/sohl/` looks like — Foundry would load it as-is. Everything
downstream derives from it: the push scripts copy it verbatim into a Foundry data
directory, and `build:pack-release` simply zips its contents into the release
`system.zip`. There is no separate transform step — the staged directory **is** the
system, and `system.zip` is just an archive of it.

**How `system.json` is assembled** (`utils/build-system-json.mjs`): it reads
`assets/templates/system.template.json` (the static metadata — document types,
`packs` array, media) and injects the dynamic fields from `package.json`: `version`,
the repo `url`/`bugs`, the `manifest` URL (latest release's `system.json`), and the
versioned `download` URL (`…/releases/download/v<version>/system.zip`).

## 5. Compendium packs from in-repo Markdown

SoHL ships three compendium packs — **items**, **journals**, **actors** — declared
in the system manifest. Each has a committed JSON source tree at
`assets/packs/<pack>/_source/`, which `build:compiledb` compiles into Foundry's
LevelDB format under `build/stage/packs/<pack>/`.

### Design decision — Markdown in the repository, build-only JSON

The compendium content is **authored in this repository**, under `assets/content/`.
The build compiles that tree directly: `build:compiledb` generates each pack's
per-entry JSON into a disposable `build/packs-json/<pack>/` intermediate and
compiles the LevelDB packs from it, so the JSON is **never committed**.

`assets/content/` was formerly a generated mirror of the HeroicLands vault, and an
edit made here was reverted by the next export without a word. **That is no longer
true (#1445).** The tree is this repository's source, it is edited here, and the
export — `utils/export-vault-content.mjs`, `utils/vault-export.mjs`, and the
`content:export` / `content:check` scripts — has been removed.

**Building needs nothing but this repository**: `npm run build`, or
`npm run build:compiledb` for packs only.

Two guards remain, because compiling nothing is still the dangerous case — it
would ship blank compendiums with nothing in the log to say so. The pack build
and `lint:packs` fail on an empty content **tree**; the pack build also fails on
empty **output**, when a pass compiles zero entries from a tree that is not
empty. That second case is what a wrong package id looks like: every note is
rejected because it declares a package this build does not compile. A pack that
genuinely ships nothing in some consuming package declares `mayBeEmpty: true` on
its entry in `content-build.config.mjs`, rather than the guard being relaxed for
everyone.

Cross-package references are resolved through published link manifests rather
than a shared tree; see `utils/kb-manifest.mjs` and `assets/manifests/`.

### Authoring content notes

Items, actors, and journal entries are Markdown files with YAML frontmatter
(a `package:` naming the content package this repository compiles — `sohl` here,
declared once as `contentPackage` in `content-build.config.mjs` — a
`type:`, a stable `id:`, and folder/embedding metadata),
authored in the vault and exported anywhere under `assets/content/`.
**Classification is frontmatter-driven, not directory-driven:** a file joins a
pack because of its `type` (item kinds →
the items pack **and**, for its prose, the journals pack; `type: doc` → journals;
`character` / `creature` → actors), so the
folder layout is for human organization only and can be reorganized freely. Folder
hierarchies are declared per pack in `assets/content/<pack>-folders.yaml` and
referenced from entries via `sohl.folder: <id>`.

```bash
# assets/content/ Markdown → build/packs-json/ (JSON) → build/stage/packs/ (LevelDB)
npm run build:compiledb
```

**The rules never describe the VTT.** Content under `assets/content/Rules/` is the
_specification_ the Foundry system implements, and must read as though no VTT
exists — no clicks, buttons, dialogs, chat log, or "the system". A rule that says
"click **Accept** on the card" describes an interface, and goes silently wrong the
moment the interface changes. Automation behaviour — the consent/offer flow, what
is prompted and when — is worth documenting, but its home is
`assets/content/User_Guide/`, which is exempt from the rule. `npm run
lint:rules-vtt` (part of `npm run lint`) enforces this over the rules tree.

**The rules are a book, and its links have to land.** Two link defects survive
both content builds silently, so `npm run lint:content-links` (also part of
`npm run lint`) checks for them:

- **A `#anchor` link that no heading declares.** The journal compiler derives a
  Foundry page id by hashing `"<noteId>-<anchorSlug>"`, so a link to an anchor
  nothing declares compiles cleanly, emits a `@UUID` enricher, and dead-ends for
  the reader. Declare `{#the-anchor}` on the heading the link means, or point the
  link at one that exists.
- **A rules document unreachable from `Rules/_Introduction.md`.** An
  unlinked note still compiles and still publishes; it is simply impossible to
  arrive at by reading. Link each one from the chapter that owns it. The walk
  resolves links exactly as the builds do — `type/shortcode` first, then a
  type-scoped alias — and expands fenced `dataview` tables first, so a generated
  row link counts. It stops **at** the glossary rather than walking through it:
  an index links to nearly everything, and following it would make the check
  vacuous.

`build:compiledb` runs the pack CLI, `utils/packs/bin/build-compendiums.mjs`. The
CLI owns every side effect — argv parsing, `loglevel` configuration, creating
`build/tmp/packs/`, and the process exit code — and calls the import-safe library
`utils/packs/compendiums.mjs`, whose `compilePacks` / `unpackPacks` / `cleanPacks`
take every path and pack list as an argument. That split is what lets another
repository's build import the compiler without inheriting a `build/` tree or a
reconfigured logger.

`compilePacks` in turn runs `utils/packs/generate.mjs`, which drives one compiler
per configured pack (`utils/packs/items.mjs`, `journals.mjs`, `actors.mjs`,
`macros.mjs`, `scenes.mjs`): each walks the content tree, selects files by
frontmatter, validates folders against the pack's `*-folders.yaml`, and writes
per-entry JSON — from which the LevelDB is then compiled.

#### The pack pipeline is configured, not hard-coded

Everything about the pipeline that is *this repository's* rather than any
consumer's lives in one file at the repository root,
**`content-build.config.mjs`**, validated by `defineConfig` from the shared
`@heroiclands/content-build` package. Nothing under `utils/packs/` spells a path,
a package name, or a pack list of its own; each module reads the resolved
configuration through `utils/packs/config.mjs` (#1508). A consuming repository —
`sohl-thalorna`, `sohl-kethira-basic`, an adventure module — ships the same
toolchain with its own copy of that file and nothing else.

What it declares:

| Key | What it settles |
| --- | --- |
| `rootDir` | The repository the paths below are resolved against. Absolute (`import.meta.dirname`), so the build reads the same files whatever directory it was launched from. |
| `contentPackage` / `foundryPackage` / `packageKind` | Which notes are compiled, which Foundry package ships them, and whether that package is a `systems/` or a `modules/` install. |
| `stats` | The identity stamped into every compiled document's `_stats` — `systemId`, `systemVersion`, `lastModifiedBy`. |
| `skipDirectories` | Directory names the content walk ignores (`Templates/`, Obsidian's templater scaffolding — a convention of this vault, not of a content tree). |
| `paths` | The content root, the manifest-template directory, the vendored link manifests, and the three build outputs. Each defaults to the conventional layout and is relative to `rootDir`. |
| `packs` | The one pack list: name, Foundry document type, folder-hierarchy file, `companions`, `mayBeEmpty`. |

Two properties of that shape are load-bearing:

- **One pack list.** The directories compiled to LevelDB are *derived* from the
  pack list as `packDirectories` (each pack, then its companions), so the
  compile order and the compiler list cannot drift apart — they used to be two
  separately-maintained arrays that had to agree.
- **Configuration supplies a path, never a captured value.** `paths.packageManifest`
  says where `system.template.json` (or a module repository's
  `module.template.json`) lives; both the package-id drift guard and the compiled
  packs' `_stats.coreVersion` read it from there. The core version itself is
  deliberately absent from the config: it is the manifest's
  `compatibility.minimum`, which moves with test evidence, and a copy would
  silently stop following it — the shape of defect #1533 was.

The `assets/` root a content note's `img:` resolves to is derived, not written:
`<packageKind>/<foundryPackage>/assets`, so the same note yields
`systems/sohl/assets/…` here and `modules/<id>/assets/…` in a module.

#### Adding or removing an item type

Which `type:` values compile into an Item is declared **once**, in the registry
`utils/packs/item-builders.mjs`: `ITEM_BUILDERS` pairs each type with the builder
that produces its `system` block, and `ITEM_TYPES` (exported from
`utils/packs/item-docs.mjs`, which assembles `DOC_ENTRY_TYPES` from it) is
derived from that registry's keys. So the whitelist of compilable types and the
table of builders are the same list and cannot drift; a type with no builder is
not a type the compiler will accept a note for.

Adding a type is therefore one entry in `ITEM_BUILDERS`, its subtype declaration
in `documentTypes.Item` (`assets/templates/system.template.json`), and its
default artwork in `@heroiclands/content-build/sohl/default-item-art` — the last
of which the unit
suite holds in exact step with the registry. Removing a type is the same three
deletions. The registry is a **leaf module**: it imports only the frontmatter
readers in `utils/packs/frontmatter.mjs`, never `helpers.mjs`, because
`helpers.mjs` reaches wikilinks and through them back to `item-docs.mjs` — the
module deriving `ITEM_TYPES` from the registry.

### An item's prose compiles to a journal, not into the item

An item note's **body** does not become the item's description. It compiles into
that item's **item doc** — a JournalEntry in the journals pack, in the same
folder and under the same name as the item — and `system.docHtml` becomes
nothing but a `@UUID` link to that entry's first page. The runtime recognises a
description that is only a link as a **pointer** and shows what it points at —
`descriptionLinkTarget()` decides, and Display Description follows. See
`utils/packs/item-docs.mjs`. A reader of the chat card sees the prose, not a
link.

The prose therefore exists **once**. It used to exist once per item and again on
every actor holding that item — 7.59 MB across the actors pack, of which 133 KB
was distinct text, so a typo fixed in an item description left 57 stale copies on
a single character. Nothing about the actors pass changed: it still embeds the
item wholesale, and what it embeds is now a link.

Two passes have to agree on the link without either seeing the other's output,
which they do by deriving both ids from the item note's own `id` — the technique
`anchorPageId()` already uses to let a section link and its page agree:

| | Items pass | Journals pass |
| --- | --- | --- |
| Entry id | `itemDocEntryId(fm.id)` | same |
| First page id | `journalPageId(entryId, page, 0)` | same, for every page |
| Splits the body | to name page 0 | into the pages themselves |

Both split the **converted** markdown, so an H1 carrying a wikilink names the
same page on both sides. An item note with an empty body gets no entry and an
empty description, rather than a pointer to nothing.

#### Linking to an item's documentation: the `doc<type>` qualifier

> Authoring a link rather than changing the build? Read
> [Linking Between Content Notes](../reference/content-links.md) instead — this
> section is the mechanism behind it.

Because the item and its prose are now **two documents in two packs**, they need
two addresses:

| Wikilink | Addresses |
| --- | --- |
| `[[skill/wpnc]]` | the Skill **Item**, in the items pack |
| `[[docskill/wpnc]]` | that skill's **JournalEntry**, in the journals pack |
| `[[docskill/wpnc#crafting]]` | the `{#crafting}` **page** of that entry |

Every item type has a virtual `doc<type>` counterpart. It is formed by prefix
and never enumerated, so a type added tomorrow is addressable the day it is
authored — the same rule that keeps `packForType()` free of a hand-maintained
list. A real content type of the same name always wins; the virtual reading is
consulted only for a qualifier no authored note claims.

**An anchor on an Item, an Actor or a Macro is a no-op** and is dropped. It is
worth being clear why: a `@UUID` to a JournalEntry opens the journal — at its
first page, or at the page an anchor names — whereas a `@UUID` to an Item or an
Actor opens that document's **sheet**, not its documentation. A sheet has no
sections, so there is nothing for an anchor to address. Reaching a page of an
item's documentation is exactly what `doc<type>` is for; before it existed, such
a link compiled to a `JournalEntryPage` id under the _items_ pack and dead-ended
(#1362).

**The knowledgebase reads the same link differently, by design.** There an item
note renders as one page which *is* its documentation, so `doc<type>` and
`<type>` are aliases for the same URL and the anchor stays an ordinary in-page
anchor. One authored link, correct in both builds.

## 6. Deploying to a Foundry instance

The push scripts copy the staged system into a Foundry data directory:

```bash
npm run deploy:qa      # build, then push:qa   (build + copy in one step)
npm run push:qa        # copy build/stage/ only (no rebuild)
```

The Foundry paths that drive deployment live in **`.env.local`** (copy it from
`.env.local.example`). Use **absolute paths only** — `$HOME` and `~` are not
expanded. A `*_DATA` value may be either:

- a **local path** (e.g. `/Users/me/fvtt/data`) — deployed with an intrinsic
  Node file copy, or
- a **remote SFTP target** (`[user@]host:/path`) — deployed over SFTP via
  `ssh2-sftp-client`, a pure-JS SSH client (no `ssh` binary required). By
  default the running **SSH agent** is used — `$SSH_AUTH_SOCK` on macOS/Linux,
  or the OpenSSH named pipe on Windows automatically — so if `ssh host` already
  works no extra config is needed. No password or passphrase is read from
  `.env.local` (for an encrypted key, load it into the agent with `ssh-add`).
  Per-stage overrides exist for username, port, agent endpoint
  (`..._AGENT=pageant` for PuTTY), and a key-file path that skips the agent
  entirely — see the comments in `.env.local.example`.

Either way the push is a **full mirror**: the destination
`Data/systems/sohl/` is cleared and rewritten so it ends up an exact copy of
`build/stage/` (stale files are removed). SFTP has no delta transfer, so a
remote push re-uploads the whole staged build each time.

| Variable                                               | Used for                                                                                                                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FOUNDRYVTT_DEV_DATA`                                  | The Foundry **user-data root** for the **dev** environment. `npm run push:dev` deploys `build/stage/` into `<root>/Data/systems/sohl/` — the `Data/systems/sohl/` suffix is appended automatically. |
| `FOUNDRYVTT_QA_DATA`                                   | The user-data root for **QA**, used by `npm run push:qa`.                                                                                                                                           |
| `FOUNDRYVTT_PROD_DATA`                                 | The user-data root for **production**, used by `npm run push:prod`.                                                                                                                                 |
| `FOUNDRYVTT_DEV` / `FOUNDRYVTT_QA` / `FOUNDRYVTT_PROD` | The Foundry **application install** path for each environment (recorded for convenience; the deploy step uses the `*_DATA` roots above).                                                            |

Point each `*_DATA` variable at the Foundry **user-data directory** (the one that
contains `Data/`), not at `systems/` — the deploy appends the rest.

🔧 **Manual steps around a deploy:**

- Stop (or at least be ready to reload) Foundry — a running server can hold file
  locks and won't pick up code changes until reloaded.
- After the deploy completes, **reload/restart** Foundry to load the new system.
- The first time you use it in a world, select **SoHL** as the world's game system.

### Running a build in a container

To smoke-test a build in a real Foundry instance without maintaining a
hand-run server, `container:<stage>` runs Foundry in Docker against the same
`FOUNDRYVTT_<STAGE>_DATA` root the push scripts deploy into:

```bash
npm run build && npm run push:dev && npm run container:dev start   # bring it up
npm run container:dev stop                                          # tear it down
```

The commands (`node utils/foundry-container.mjs <stage> <command>`):

| Command    | Effect                                                                               |
| ---------- | ------------------------------------------------------------------------------------ |
| `start`    | Create (or restart) `sohl-foundry-<stage>` and serve `/data`. Sweeps a stale lock first when the container is down. |
| `stop`     | Stop the container (state is kept for a fast `start`).                               |
| `restart`  | Stop, sweep a stale lock, start. Deliberately **not** `docker restart`, which leaves no window in which to sweep. |
| `recreate` | Remove and re-create the container so changed `FOUNDRY_*`/`CONTAINER_*` env applies. |
| `rm`       | Stop and remove the container.                                                       |
| `status`   | Show the container's `docker ps -a` row.                                             |
| `logs`     | Follow the container log (watch first-run install / boot here).                      |
| `pull`     | Pull the latest image.                                                               |

**The data-root lock.** Foundry takes `Config/options.json.lock` while it runs
and releases it on a clean shutdown. A container that dies holding it (`docker
kill`, a crash, an OOM) strands the lock, and every later boot then fails with
"this directory is already locked by another process" — an error naming no
owner, so it reads like corruption rather than litter. Every command here that
boots Foundry (`start`, `restart`, `recreate`) sweeps the lock first, which is
safe precisely because each does so while the container is stopped: with nothing
running against the data root, a lock present is by definition stale. You should
never need to delete it by hand.

The data root is bind-mounted at `/data`, so the system pushed to
`<root>/Data/systems/sohl/` is served directly — the value **must be a local
path** (a remote SFTP target can't be mounted and is rejected). Foundry itself
runs from the community [`felddy/foundryvtt`](https://hub.docker.com/r/felddy/foundryvtt)
image, which downloads the correct build inside the container (a local Foundry
install can't be reused across platforms — its bundled native modules are
platform-specific).

Configuration lives in `.env.local` (all optional):

| Variable                     | Default                | Purpose                                                             |
| ---------------------------- | ---------------------- | ------------------------------------------------------------------- |
| `FOUNDRYVTT_CONTAINER_IMAGE` | `felddy/foundryvtt:14` | Image tag to run (`:14` matches `system.json` `minimum`).           |
| `FOUNDRYVTT_<STAGE>_VERSION` | `test` → `14.359`      | Exact build, passed to felddy as `FOUNDRY_VERSION` (see below).      |
| `FOUNDRYVTT_<STAGE>_PORT`    | 30000 / 30001 / 30002  | Published host port (distinct per stage so all three can coexist).  |
| `FOUNDRYVTT_CACHE`           | —                      | Host dir with a pre-downloaded Foundry zip (see cache note below).  |
| `FOUNDRY_*` / `CONTAINER_*`  | —                      | Passed through to the image (licensing, cache, tuning — see below). |

🔧 **The `test` stage's Foundry build is pinned by the repository**, in
`DEFAULT_STAGE_VERSIONS` (`utils/foundry-container.mjs`), and passed to felddy as
`FOUNDRY_VERSION` so it downloads that exact build rather than the newest of the
`:14` tag. That pin is what makes the e2e suite reproducible: without it the test
container drifts to whatever the floating tag serves, and "the suite passes" names
no particular Foundry. No other stage is pinned here — `dev`/`qa`/`prod` are the
maintainer's own instances.

**The pinned build is `system.json`'s `compatibility.minimum`** — the oldest
Foundry the system claims to support, and therefore the claim the suite exists to
defend. Testing above the floor would leave the promised configuration unverified,
so the newest release is covered by a periodic **sweep** rather than by the
default:

```bash
npm run e2e:sweep -- 14.367     # full suite against the newest release
```

Run it roughly weekly and before shipping; it takes the build as an argument and
has no default, so it cannot rot into a second pinned version. A green sweep is
what licenses moving `compatibility.verified` — which names the newest build the
full suite has **actually passed**, never an aspiration.

`FOUNDRYVTT_<STAGE>_VERSION` in `.env.local` overrides the committed default for
any run. Raising the committed pin, by contrast, is a decision to **raise the
supported floor**: move `compatibility.minimum` in
`assets/templates/system.template.json` with it. See
[Testing → Which build the suite runs on](testing.md#which-build-the-suite-runs-on--the-two-tracks).

🔧 **First-run licensing.** felddy needs to fetch Foundry once. Supply your
Foundry credentials (`FOUNDRY_USERNAME` / `FOUNDRY_PASSWORD` [+ `FOUNDRY_LICENSE_KEY`]),
a timed `FOUNDRY_RELEASE_URL`, or a pre-seeded cache (below) — whichever you
prefer, in `.env.local`. The download is cached, so subsequent `start`s are fast
and need no credentials. Docker must be installed and on `PATH`.

**Env is baked in at create time.** `FOUNDRY_*`/`CONTAINER_*` values are fixed
when the container is first created (`docker run`); `start`/`restart` do **not**
pick up changes to them. After editing one — e.g. `FOUNDRY_WORLD=<world-dir>` to
auto-launch a specific world (felddy regenerates `Config/options.json` from the
env on each start, so hand-editing it won't stick), or credentials — run
`npm run container:<stage> recreate` to re-create the container with the current
environment.

**Download cache.** `CONTAINER_CACHE` in felddy is a path **inside the
container** (default `/data/container_cache`). Because the data root is mounted
at `/data`, that default is `<dataRoot>/container_cache/` on your host — so the
no-config option is to drop `foundryvtt-<version>.zip` (e.g.
`foundryvtt-14.364.zip`) there. If instead the zip lives in a **separate** host
directory, set `FOUNDRYVTT_CACHE` to it: the script bind-mounts that directory
and sets `CONTAINER_CACHE` to the mount point for you. Do **not** set a raw
`CONTAINER_CACHE` to a host path — it names a container path and is not
forwarded (use `FOUNDRYVTT_CACHE` instead).

## 7. Cutting a release

A release is cut by **merging the auto-generated "Version Packages" PR**; the
`Version and Release` GitHub Actions workflow (`.github/workflows/release.yml`)
does the build, tag, GitHub Release, and asset upload. The only command you
type by hand is the docs-deploy dispatch at the end.

### While developing

Every `feat`/`bug` PR carries a changeset (see
[Writing Changesets](../contributing/writing-changesets.md)):

```bash
npm run changeset   # choose the version bump, write the summary
# then commit the generated .changeset/*.md with your PR
```

These accumulate on `main` as PRs merge.

### To cut the release (maintainer)

1. Make sure every change you want in the release is merged to `main`, each
   with its changeset.
2. On each push to `main`, the workflow opens or updates a PR titled
   **`chore(release): version packages`** — it runs `changeset version` to bump
   `package.json` and rewrite `CHANGELOG.md`. Review it (the version and changelog
   are the release).
3. 🔧 **Merge that PR** — in the GitHub UI, or from the CLI (the changesets
   action opens it from the `changeset-release/main` branch):

    ```bash
    gh pr merge changeset-release/main [--admin] --squash --delete-branch
    ```

    Merging _is_ the release — there's nothing else to run locally. The workflow
    re-runs on the merge, sees a new untagged version, and automatically:
    - runs `npm run build` then `npm run build:pack-release`,
    - creates the `v<version>` git tag and a **GitHub Release**,
    - attaches `system.zip` + `system.json` (the manifest/download Foundry installs
      and updates from).

4. **`/sohl/` republishes itself.** The release job dispatches
   `deploy-sohl.yml`, which rebuilds the whole subtree — landing page,
   knowledgebase, and the API documentation from the newest release tag — and
   deploys it. Nothing to run; see [§8](#8-publishing-the-sohl-website). If
   that run fails, repeat it with `gh workflow run deploy-sohl.yml` (it needs
   no arguments — the newest release is always what it documents).

That's the entire release. Two notes:

- `npm run deploy:release` only builds the release zip **locally** (into
  `build/dist/`) for inspection — it does **not** publish anything. Releasing
  always goes through the merge-the-PR flow above.
- A push to `main` with no pending changesets whose version is already tagged does
  nothing — ordinary merges never release.

### The npm workspace packages

`packages/` holds two published npm packages, both **hand-versioned** in their own
`package.json` and independent of the system version:

| Package                       | What it is                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `@heroiclands/sohl-types`     | Type declarations for authoring modules and macros against SoHL in TypeScript. |
| `@heroiclands/content-build`  | The shared toolchain that compiles a content tree into Foundry compendium packs. |

The root `package.json` declares them with

```json
"workspaces": ["packages/*", "."]
```

so this repository consumes them **by path** — a change to the toolchain is usable
here immediately, and only external repositories wait on a release.

🔧 **The trailing `"."` is load-bearing, not a typo.** npm does not need it (it
picks the root up regardless), but Changesets discovers packages through the same
`workspaces` globs, and in workspace mode it excludes the root package. Without
`"."` every existing changeset fails with _"Found changeset … for package sohl
which is not in the workspace"_ and the release workflow stops dead. Listing the
root as a workspace keeps `sohl` a package Changesets can version. The one visible
side effect is a `node_modules/sohl` symlink back to the repository root.

Both are published by the release workflow through **npm Trusted Publishing**
(OIDC — there is no `NPM_TOKEN`), in a step that is idempotent (it skips a version
already on npm) and `continue-on-error` (Foundry installs from the Release's
`system.zip`, so an npm hiccup must not fail the release). Each package's
`prepack` regenerates its declarations at pack time.

Publishing a **new** package needs two one-off maintainer actions that CI cannot
perform: configure a Trusted Publisher for the package name on npmjs.com (pointing
at this repository and `.github/workflows/release.yml`), and make the very first
publish by hand — npm cannot trust a publisher for a package that does not exist
yet.

**At a glance — who does what:**

| Step                          | Manual?  | By         |
| ----------------------------- | -------- | ---------- |
| Author changesets             | 🔧 yes   | developer  |
| Open the Version Packages PR  | no (CI)  | —          |
| Merge the Version Packages PR | 🔧 yes   | maintainer |
| Tag + GitHub Release + assets | no (CI)  | —          |
| Publish the API docs          | no (CI)  | —          |
| Deploy to a Foundry instance  | 🔧 yes   | operator   |

## 8. Publishing the `/sohl/` website

Some of what this repository builds is published to the **web** rather than to a
Foundry instance, and all of it is one site: everything under
`www.heroiclands.org/sohl/`.

| Address        | What                                        | Built by                       | Built from             |
| -------------- | ------------------------------------------- | ------------------------------ | ---------------------- |
| `/sohl/`       | The package landing page                    | Hugo (`kb/layouts/index.html`) | `main`                 |
| `/sohl/kb/`    | The knowledgebase                           | Hugo (`build:kb`)              | `main`                 |
| `/sohl/api/`   | The API documentation                       | TypeDoc (`docs:html`)          | the newest release tag |

`npm run build:site` produces the whole thing locally, and
`.github/workflows/deploy-sohl.yml` produces and deploys it in CI — one build,
one deploy, one hosting project (#1470). A few things about it are worth knowing
before you change any of it.

**It republishes on every push to `main`, and again when a release is
published.** The push trigger carries no path filter: a rebuild is cheap next to
how quietly a path list goes stale, and a push that changes nothing the site
serves simply republishes the same bytes. The second trigger exists because the
API half tracks the newest **release tag**, not `main`, so a freshly published
release changes the site without any push doing so — `release.yml` dispatches
this workflow from the one step that knows it actually cut a release. It is
deliberately *not* wired to that workflow's *completion*: `release.yml` runs on
every push to `main` and succeeds whether or not it released, so watching it
deployed twice per push (#1484).

**Nothing is purged after a deploy, by design.** `/sohl/` is served through the
routing Worker straight from the Pages project, with Pages' own
`cache-control: public, max-age=0, must-revalidate` and no `cf-cache-status` —
the zone edge holds nothing under `/sohl/` to invalidate. The `purge_everything`
that used to follow each publish therefore evicted only the surfaces this deploy
never touched (`www`'s own pages, `cdn`). Should a Cache Rule ever cover
`/sohl/`, purge those URLs rather than the zone.

**The deployment carries the `/sohl/` prefix physically.** `publishDir` in
`kb/hugo.toml` renders into `build/site/sohl/`, and the directory that is
uploaded is `build/site/` — so a page's `/sohl/kb/…` link resolves against the
deployment exactly as it will against `www`. That is what lets the hosting
project be checked at its own `*.pages.dev` address before any routing points at
it, and it leaves the routing layer (#1468) a path-preserving pass-through with
nothing to rewrite.

**The hosting project's own address is `noindex`, the canonical path is not.**
A Cloudflare Pages project answers at `<project>.pages.dev` (and at
`<deployment>.<project>.pages.dev` for every deployment) as well as under
`www.heroiclands.org/sohl/`. Nothing advertises it, but it serves the same
pages, so `build/site/_headers` marks those hostnames — and only those —
`X-Robots-Tag: noindex` (#1469). The rules are host-scoped rather than blanket
so the tree stays correct anywhere it is deployed: under its own domain it is
indexable. The hosting cannot tell the routing layer's request apart from a
reader's, since it is the same URL at the same address, so the header reaches
`www` too and the router (`heroiclands-site`, `worker/`) drops it there — the
one place the two addresses are distinguishable. A page that must not be indexed
at *any* address says so in the document (`<meta name="robots">`), which is
passed through untouched.

**Both surfaces are rebuilt on every run**, even though they track different
refs. A Cloudflare Pages deploy replaces the whole tree, so a run that published
only the half it had rebuilt would take the other half offline. The workflow
therefore builds the knowledgebase from `main`, checks the newest release tag out
into `release/` and builds the API documentation there (with that tag's own
lockfile — the documentation is a pure function of its tag), and
`site:assemble` mounts the result at `build/site/sohl/api/`.

**Nothing ships half-built.** `utils/build-site.mjs` refuses to finish unless
the landing page, the knowledgebase, the API documentation and the `404.html`
are all present — a missing surface would publish a 404 at an address the
navigation already points at, and a missing `404.html` would make Cloudflare
Pages answer unmatched paths with a soft-404 (#1416).

**And nothing ships pointing at a hostname that no longer resolves.** Before it
finishes, the assembler reads every rendered page and fails the build on any
`href` or `src` addressing one of the withdrawn hosts in `RETIRED_HOSTS`
(`utils/retired-hosts.mjs`). Such a link fails at DNS with no redirect to
follow, so it is a hard dead end, and nothing else in the pipeline notices — an
absolute URL is opaque to the wikilink checks. Prose that merely *names* a
withdrawn host is not reported; these docs explain the move, and saying so is
not a dead end.

The API documentation gets one step first, because the gate alone could never
clear it. It is rebuilt from the newest **release tag**, so a tag cut before a
hostname was withdrawn reproduces the dead links on every deploy however clean
`main` is — which is exactly what `/sohl/api/` was doing (#1487). The assembler
therefore repoints those links, taking a replacement **only when the page it
names is present in the tree it has just assembled**: a repair is verified, never
guessed, because a wrong one would trade a dead end a reader can see for a quiet
404. Candidates come from `rewriteCandidates`, which knows both that the API
site dropped its version segment and that the developer docs now live under
`/dev-docs/`. Anything it cannot rescue falls through to the gate and fails the
build. Every repair is printed: for a current tag the count should be zero, so a
non-zero one means new `src/` JSDoc — or the chrome plugin — has reintroduced a
retired address, and the fix belongs there.

**No layout in this repository names an address.** Every asset resolves through
the theme's `cdn-url.html` against `params.cdnBaseURL`, and every internal link
is built from the page's own `.RelPermalink`, so moving the package or its
artwork is a config edit rather than a sweep through the templates (#1464).
Worth knowing when you add one: with `cdnBaseURL` unset the partial falls back
to `relURL`, so a missing param yields `/sohl/images/…` — a 404 against this
deploy, not a build failure. `kb/hugo.toml` declaring the param is the guard,
not the template.

**Links inside the generated Markdown carry the prefix from the builder, not
from Hugo.** Hugo prefixes what it emits itself (permalinks, assets, aliases),
but the wikilinks and cross-references written into `kb/content/` are ordinary
site paths that nothing rewrites afterwards. They come from `SOHL_BASE` /
`KB_BASE` / `API_BASE` in `utils/build-kb-content.mjs`, which is where a
relocation is edited. One consequence worth remembering: a Hugo `alias` is
publishDir-relative and does **not** get the baseURL path added, so
`applyRedirects` strips the site root on the way into the frontmatter.

## 9. The build utility scripts

The build/deploy/doc/pack tooling lives in **`utils/`** (with the pack tooling
under `utils/packs/`). Each script carries a header comment describing its purpose
and how to invoke it — read the file itself for the authoritative detail. In brief:

| Script                              | Purpose                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `build-system-json.mjs`             | Generate `build/stage/system.json` from the template + version.                           |
| `copy-assets.mjs`                   | Stage templates, lang, assets, and root files into `build/stage/`.                        |
| `build-icon-font.mjs`               | Build the icon font from SVGs.                                                            |
| `build-type-catalog.mjs`            | Generate `docs/reference/type-catalog.md` from the kind enums.                            |
| `docs-coverage.mjs`                 | Report doc-comment coverage.                                                              |
| `check-todos.mjs`                   | Fail the build on any `TODO`/`FIXME` marker under `src/`.                                 |
| `clean.mjs`                         | Remove build output (`--distclean` for a deeper clean).                                   |
| `pack-release.mjs`                  | Zip `build/stage/` into the release `system.zip` + `system.json`.                         |
| `push-stage.mjs`                    | deploy `build/stage/` to a Foundry instance (`dev`/`qa`/`prod`).                          |
| `build-kb-content.mjs`              | Generate the Hugo content tree for `/sohl/kb/` from `assets/content/` + `kb/dev-docs/`.  |
| `build-site.mjs`                    | Assemble the deployable `/sohl/` tree: mount the API docs, refuse a partial build, and refuse a link to a retired hostname. |
| `retired-hosts.mjs`                 | The withdrawn hostnames and what replaced each — shared by the content-link check and the deploy gate. |
| `foundry-container.mjs`             | run a build in a Foundry Docker container (`<stage> start\|stop\|…`).                     |
| `e2e-redeploy.mjs`                  | The fast e2e loop (`npm run e2e:fast`): rebuild → `push:test` → cycle the world → run Cypress. |
| `release.mjs`                       | Legacy local release path; authenticate with `gh auth login` (CI normally cuts releases). |
| `packs/compendiums.mjs`             | Library: `compilePacks` / `unpackPacks` / `cleanPacks` over the Foundry CLI. No import-time side effects. |
| `packs/bin/build-compendiums.mjs`   | The pack CLI: argv, logging, directory creation, and exit codes for the library above.    |
| `packs/export.mjs`                  | Vault → `_source/` export orchestrator.                                                   |
| `packs/{items,journals,actors}.mjs` | Per-pack vault compilers.                                                                 |
| `packs/helpers.mjs`                 | Shared pack helpers (frontmatter, `_key`, folders).                                       |
| `packs/clean-sources.mjs`           | Remove generated `_source/` trees.                                                        |
| `typedoc-plugin-*.mjs`              | TypeDoc plugins (source categories, nested nav, Foundry links, data-field schema).        |

## See also

- [Getting Started](./getting-started.md) — the codebase tour for a new developer.
- [System Development](../contributing/system-development.md) — the rules of
  contributing and the PR workflow.
- [Writing Changesets](../contributing/writing-changesets.md) — recording a change
  for the changelog and release.
- [Testing](./testing.md) — the test tooling and patterns.
