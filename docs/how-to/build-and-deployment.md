# Build, Deployment, and Release

Everything you need to take Song of Heroic Lands (SoHL) from a fresh clone to a
running Foundry instance and a published release: environment setup, every npm
script, how the build pipeline works, the layout of the `build/` directory,
compendium packs and the Obsidian vault, deploying to a Foundry instance, and the
release process. **Manual steps are called out explicitly** with a 🔧 marker.

> Audience: maintainers and contributors working on the SoHL system itself. For the
> rules of contributing, see [System Development](../contributing/system-development.md).

## 1. First-time setup

🔧 **Prerequisites:** **Node.js ≥ 24** (see `engines` in `package.json`) and
**Git**. `rsync` is needed only for deploying to a Foundry instance; everything
else installs locally.

```bash
git clone https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT.git
cd Song-of-Heroic-Lands-FoundryVTT
cp .env.local.example .env.local   # then edit — see below
npm ci                             # clean install from package-lock.json → node_modules/
npm run build                      # full build into build/stage/
```

🔧 **`.env.local`** is gitignored — each developer keeps their own. It supplies the
paths the deploy scripts rsync to. Edit only the variables you use:

| Variable               | Purpose                                                                                                                | Used by             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `FOUNDRYVTT_DEV_DATA`  | Foundry **dev** data root — a local path or an rsync remote (`host:/path`).                                            | `npm run push:dev`  |
| `FOUNDRYVTT_QA_DATA`   | Foundry **QA** data root (same format).                                                                                | `npm run push:qa`   |
| `FOUNDRYVTT_PROD_DATA` | Foundry **production** data root (same format).                                                                        | `npm run push:prod` |
| `GITHUB_TOKEN`         | A PAT with `repo` scope, for the legacy local release path. Releases are normally cut by CI, which uses its own token. | `utils/release.mjs` |

The push scripts append `Data/systems/sohl/` to the data root automatically, so
point each variable at the Foundry **user-data directory** (the one containing
`Data/`), not at `systems/`.

## 2. npm scripts

Every script in `package.json`, grouped by purpose. `run-s` runs steps in
sequence; `run-p` runs them in parallel.

### Build

| Script                | What it does                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `build`               | Full production build: `npm ci` then `build:noci`. The canonical "build it all" entry.                               |
| `build:local`         | Same as `build` but `npm i` (allows lockfile updates) instead of `npm ci`.                                           |
| `build:noci`          | The pipeline without install: `lint:todos → build:types → build:prepare → test:coverage → test:purity → build:code`. |
| `build:prepare`       | In parallel: `build:css`, `build:db`, `build:system`.                                                                |
| `build:types`         | TypeScript type-check / compile (`tsc -p tsconfig.json`). No emit beyond `.d.ts`/checking.                           |
| `build:css`           | Compile `scss/sohl.scss` → `build/stage/css/sohl.css` (Sass).                                                        |
| `build:system`        | Generate `build/stage/system.json` from the template + `package.json` version (`utils/build-system-json.mjs`).       |
| `build:assets`        | Copy `templates/`, `lang/`, `assets/*`, `LICENSE.md`, `README.md` into `build/stage/` (`utils/copy-assets.mjs`).     |
| `build:db`            | `build:assets` then `build:compiledb` — stage assets, then compile packs.                                            |
| `build:compiledb`     | Compile `assets/packs/*/_source/` JSON → LevelDB packs in `build/stage/packs/`.                                      |
| `build:unpackdb`      | The reverse: unpack the staged LevelDB packs back to JSON (for inspection).                                          |
| `build:code`          | Bundle the system with Vite (`vite build --mode release`) → `build/stage/sohl.js`.                                   |
| `build:icons`         | Rebuild the icon font from SVGs (`utils/build-icon-font.mjs`). Run by hand when icons change.                        |
| `build:pack-release`  | Zip `build/stage/` → `build/dist/system.zip` and copy `system.json` (`utils/pack-release.mjs`).                      |
| `clean` / `distclean` | Remove build output (`distclean` also clears caches/`node_modules`-level artifacts).                                 |

### Compendium packs

| Script          | What it does                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `packs:export`  | 🔧 Walk the HeroicLands **Obsidian vault** and regenerate `assets/packs/*/_source/` (maintainers). |
| `packs:rebuild` | `packs:export` then `build:compiledb` — full vault → LevelDB roundtrip.                            |
| `packs:clean`   | Remove the generated `_source/` trees.                                                             |

### Tests, lint, format

| Script                    | What it does                                               |
| ------------------------- | ---------------------------------------------------------- |
| `test`                    | Run the vitest suite once.                                 |
| `test:watch` / `test:ui`  | Watch mode / the vitest UI.                                |
| `test:coverage`           | Run with coverage.                                         |
| `test:purity`             | The Foundry-free purity check (`vitest.purity.config.ts`). |
| `lint` / `lint:fix`       | ESLint over `src/` (with `--fix`).                         |
| `lint:todos`              | Fail if any `TODO`/`FIXME` lacks an issue reference.       |
| `format` / `format:check` | Prettier write / check the whole repo.                     |

### Docs

| Script                      | What it does                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------- |
| `docs`                      | Full doc build: `docs:prepare → docs:html → docs:md → docs:version`.                   |
| `docs:prepare`              | `docs:catalog` (generate the type catalog) + `docs:bundle` (the TypeDoc entry barrel). |
| `docs:html` / `docs:md`     | TypeDoc HTML / Markdown output.                                                        |
| `docs:version`              | Rewrite `api.heroiclands.org/latest` → `…/v<version>` in the generated output.         |
| `docs:coverage`             | Report doc-comment coverage.                                                           |
| `docs:serve` / `docs:watch` | Serve `build/stage/docs` / rebuild-and-serve on change.                                |

### Deploy and release

| Script                                     | What it does                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `push:dev` / `push:qa` / `push:prod`       | 🔧 rsync `build/stage/` to the matching `FOUNDRYVTT_*_DATA` instance.                              |
| `deploy:dev` / `deploy:qa` / `deploy:prod` | 🔧 `build` then the matching `push:*`.                                                             |
| `deploy:release`                           | `build` then `build:pack-release` — produce the release zip locally.                               |
| `changeset`                                | Create a changeset (interactive). See [Writing Changesets](../contributing/writing-changesets.md). |
| `changeset:version`                        | Apply pending changesets: bump the version and update `CHANGELOG.md` (normally run by CI).         |
| `changeset:check`                          | Verify a changeset exists.                                                                         |

## 3. The build pipeline

`npm run build` runs `npm ci` then `build:noci`, which is:

1. **`lint:todos`** — no unlinked `TODO`/`FIXME`.
2. **`build:types`** — `tsc` type-checks the whole project.
3. **`build:prepare`** (parallel):
    - **`build:css`** — Sass → `build/stage/css/sohl.css`.
    - **`build:db`** — copy assets, then compile packs to `build/stage/packs/`.
    - **`build:system`** — write `build/stage/system.json`.
4. **`test:coverage`** and **`test:purity`** — the suite must pass.
5. **`build:code`** — Vite bundles `src/sohl.ts` → `build/stage/sohl.js` (single ES
   module, sourcemap, unminified, with `emptyOutDir: false` so it doesn't wipe the
   staged CSS/assets/packs).

The result is a complete, deployable system in **`build/stage/`**.

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
├── docbundle/        generated TypeDoc entry barrel (All.ts)
├── docs/             the Markdown documentation tree (from docs:md)
└── tmp/              scratch (e.g. unpacked packs)
```

**`build/stage/` _is_ the system directory.** Its contents are exactly what an
installed `Data/systems/sohl/` looks like — Foundry would load it as-is. Everything
downstream derives from it: the push scripts rsync it verbatim into a Foundry data
directory, and `build:pack-release` simply zips its contents into the release
`system.zip`. There is no separate transform step — the staged directory **is** the
system, and `system.zip` is just an archive of it.

**How `system.json` is assembled** (`utils/build-system-json.mjs`): it reads
`assets/templates/system.template.json` (the static metadata — document types,
`packs` array, media) and injects the dynamic fields from `package.json`: `version`,
the repo `url`/`bugs`, the `manifest` URL (latest release's `system.json`), and the
versioned `download` URL (`…/releases/download/v<version>/system.zip`).

## 5. Compendium packs and the Obsidian vault

SoHL ships three compendium packs — **items**, **journals**, **actors** — declared
in the system manifest. Each has a committed JSON source tree at
`assets/packs/<pack>/_source/`, which `build:compiledb` compiles into Foundry's
LevelDB format under `build/stage/packs/<pack>/`.

### Design decision — committed pack sources

The pack content is _authored_ in the HeroicLands vault, but **the build never reads
the vault directly.** Instead, a separate `packs:export` step pulls everything out of
the vault and writes it as plain JSON under `assets/packs/*/_source/`, and those JSON
trees are **committed to this repository**.

This is deliberate. It means the system builds from the repo alone — a contributor
can run `npm run build` (or `npm run build:compiledb` for packs only) **without the
vault present**. The vault is required only to _regenerate_ the `_source/` trees (a
maintainer task), never to build. Put differently: the vault is the **authoring**
source of truth; the committed `_source/` JSON is the **build's** source of truth.

### Authoring content in the HeroicLands vault

The authoritative content lives in the **HeroicLands Obsidian vault**, a sibling
repository the pack scripts expect at **`../HeroicLands/`** (next to this repo — see
`utils/packs/export.mjs`). Items, actors, and journal entries are authored there as
Markdown files with YAML frontmatter (`package: sohl`, a `type:`, a stable `id:`,
and folder/embedding metadata).

🔧 **Regenerating the pack sources from the vault** (maintainers with the vault):

```bash
npm run packs:export      # vault → assets/packs/*/_source/ (wipes & rewrites them)
npm run build:compiledb   # _source/ JSON → build/stage/packs/ (LevelDB)
# or both at once:
npm run packs:rebuild
```

`packs:export` (`utils/packs/export.mjs`) drives three per-pack compilers
(`utils/packs/items.mjs`, `journals.mjs`, `actors.mjs`): they walk the vault, select
files by frontmatter, validate folders against each pack's `folders.yaml`, render
Markdown to HTML (journals split into pages by `#` headings), resolve an actor's
embedded items, and write per-entry JSON to the `_source/` tree.

**The `_key` field.** Foundry's LevelDB compiler keys every document — including
_embedded_ ones — by a hierarchical `_key`. The exporters write these explicitly:
e.g. an actor's embedded item gets `!actors.items!<actorId>.<itemId>` and an effect
on it `!actors.items.effects!<actorId>.<itemId>.<effectId>`. Without them the
compile aborts with `LEVEL_INVALID_KEY`.

## 6. Deploying to a Foundry instance

The push scripts rsync the staged system into a Foundry data directory:

```bash
npm run deploy:qa      # build, then push:qa   (build + rsync in one step)
npm run push:qa        # rsync build/stage/ only (no rebuild)
```

Each `push:*` (`utils/push-stage.mjs`) runs:

```
rsync -avh --delete build/stage/  <FOUNDRYVTT_*_DATA>/Data/systems/sohl/
```

`--delete` makes the target an exact mirror of `build/stage/`. A remote
`host:/path` data root rsyncs over SSH.

🔧 **Manual steps around a deploy:**

- Stop (or at least be ready to reload) Foundry — a running server can hold file
  locks and won't pick up code changes until reloaded.
- After the rsync, **reload/restart** Foundry to load the new system.
- The first time you use it in a world, select **SoHL** as the world's game system.

## 7. The release process

Releases are driven by [changesets](../contributing/writing-changesets.md) and cut by
CI; the maintainer's only manual steps are authoring changesets and merging the
version PR.

1. 🔧 **Author changesets.** Every `feat`/`bug` PR adds a `.changeset/*.md` entry
   (`npm run changeset`). These accumulate on `main`.
2. **Version PR (CI).** On push to `main`, `.github/workflows/release.yml` runs
   `changeset version` and opens/updates a **"Version Packages"** PR that bumps
   `package.json` and rewrites `CHANGELOG.md`.
3. 🔧 **Merge the Version Packages PR.** This is the human "cut a release" decision.
4. **Release (CI).** When that merge lands and the new version isn't yet tagged,
   `release.yml` runs `npm run build` + `npm run build:pack-release`, creates the
   `v<version>` tag and a **GitHub Release**, and uploads `system.zip` + `system.json`
   as assets. Foundry installs/updates from those URLs (the `manifest`/`download`
   fields baked into `system.json`).
5. **API docs (CI).** `.github/workflows/deploy-docs.yml` publishes the versioned
   docs to `api.heroiclands.org/v<version>/` and updates `/latest/`. It runs on the
   release event; 🔧 if it doesn't fire (the default Actions token doesn't always
   trigger downstream workflows), dispatch it manually — `release.yml` prints the
   exact command:

    ```bash
    gh workflow run deploy-docs.yml --ref v<version>
    ```

**At a glance — who does what:**

| Step                          | Manual?                                 | By         |
| ----------------------------- | --------------------------------------- | ---------- |
| Author changesets             | 🔧 yes                                  | developer  |
| Open the Version Packages PR  | no (CI)                                 | —          |
| Merge the Version Packages PR | 🔧 yes                                  | maintainer |
| Tag + GitHub Release + assets | no (CI)                                 | —          |
| Publish versioned API docs    | mostly CI; 🔧 manual dispatch if needed | maintainer |
| Deploy to a Foundry instance  | 🔧 yes                                  | operator   |

## 8. The build utility scripts

The build/deploy/doc/pack tooling lives in **`utils/`** (with the pack tooling under
`utils/packs/`). Each script carries a header comment describing its purpose and how
to invoke it — read the file itself for the authoritative detail. In brief:

| Script                              | Purpose                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| `build-system-json.mjs`             | Generate `build/stage/system.json` from the template + version.                    |
| `copy-assets.mjs`                   | Stage templates, lang, assets, and root files into `build/stage/`.                 |
| `build-icon-font.mjs`               | Build the icon font from SVGs.                                                     |
| `build-type-catalog.mjs`            | Generate `docs/reference/type-catalog.md` from the kind enums.                     |
| `build-docs-entry.mjs`              | Generate the single TypeDoc entry barrel for cross-link resolution.                |
| `sync-doc-version.mjs`              | Pin `…/latest` doc links to `…/v<version>` in generated output.                    |
| `docs-coverage.mjs`                 | Report doc-comment coverage.                                                       |
| `check-todos.mjs`                   | Fail the build on unlinked `TODO`/`FIXME` markers.                                 |
| `clean.mjs`                         | Remove build output (`--distclean` for a deeper clean).                            |
| `pack-release.mjs`                  | Zip `build/stage/` into the release `system.zip` + `system.json`.                  |
| `push-stage.mjs`                    | rsync `build/stage/` to a Foundry instance (`dev`/`qa`/`prod`).                    |
| `release.mjs`                       | Legacy local release path (CI normally cuts releases).                             |
| `packs/build-compendiums.mjs`       | Compile/unpack `_source/` ↔ LevelDB packs (Foundry CLI).                           |
| `packs/export.mjs`                  | Vault → `_source/` export orchestrator.                                            |
| `packs/{items,journals,actors}.mjs` | Per-pack vault compilers.                                                          |
| `packs/helpers.mjs`                 | Shared pack helpers (frontmatter, `_key`, folders).                                |
| `packs/clean-sources.mjs`           | Remove generated `_source/` trees.                                                 |
| `typedoc-plugin-*.mjs`              | TypeDoc plugins (source categories, nested nav, Foundry links, data-field schema). |

## See also

- [Getting Started](./getting-started.md) — the codebase tour for a new developer.
- [System Development](../contributing/system-development.md) — the rules of
  contributing and the PR workflow.
- [Writing Changesets](../contributing/writing-changesets.md) — recording a change
  for the changelog and release.
- [Testing](./testing.md) — the test tooling and patterns.
