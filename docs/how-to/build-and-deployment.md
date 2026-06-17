# Build, Deployment, and Release

Everything you need to take Song of Heroic Lands (SoHL) from a fresh clone to a
running Foundry instance and a published release: environment setup, every npm
script, how the build pipeline works, the layout of the `build/` directory,
compendium packs and the Obsidian vault, deploying to a Foundry instance, and the
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
| `push:dev` / `push:qa` / `push:prod`       | 🔧 copy `build/stage/` to the matching `FOUNDRYVTT_*_DATA` instance.                               |
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
downstream derives from it: the push scripts copy it verbatim into a Foundry data
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

The pack content is _authored_ in the HeroicLands Obsidian vault, but **the build
never reads the vault directly.** Instead, a separate `packs:export` step pulls
everything out of the vault and writes it as plain JSON under
`assets/packs/*/_source/`, and those JSON trees are **committed to this
repository**.

This is deliberate. It means the system builds from the repo alone — a contributor
can run `npm run build` (or `npm run build:compiledb` for packs only) **without the
vault present**. The vault is required only to _regenerate_ the `_source/` trees (a
maintainer task), never to build. Put differently: the vault is the **authoring**
source of truth; the committed `_source/` JSON is the **build's** source of truth.

### Authoring content in the HeroicLands vault

The authoritative content lives in the
[HeroicLands Obsidian Vault](https://github.com/HeroicLands/HeroicLands), a sibling
repository the pack scripts expect at **`../HeroicLands/`** (next to this repo —
see `utils/packs/export.mjs`). Items, actors, and journal entries are authored
there as Markdown files with YAML frontmatter (`package: sohl`, a `type:`, a
stable `id:`, and folder/embedding metadata).

🔧 **Regenerating the pack sources from the vault** (maintainers with the vault):

```bash
git clone https://github.com/HeroicLands/HeroicLands.git ../HeroicLands
npm run packs:export      # vault → assets/packs/*/_source/ (wipes & rewrites them)
npm run build:compiledb   # _source/ JSON → build/stage/packs/ (LevelDB)
# or both at once:
npm run packs:rebuild
```

`packs:export` (`utils/packs/export.mjs`) drives three per-pack compilers
(`utils/packs/items.mjs`, `journals.mjs`, `actors.mjs`): they walk the vault,
select files by frontmatter, validate folders against each pack's `folders.yaml`,
and write per-entry JSON to the `_source/` tree.

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

4. 🔧 **Publish the versioned API docs.** The Release is created with the Actions
   `GITHUB_TOKEN`, which by design can't trigger another workflow, so the docs
   workflow does **not** fire on its own. Run (substituting the version just
   released — the release job also prints this exact line in its run summary):

    ```bash
    gh workflow run deploy-docs.yml --ref v<version>   # e.g. v0.7.1
    ```

    This publishes `api.heroiclands.org/v<version>/` and mirrors it to `/latest/`.

That's the entire release. Two notes:

- `npm run deploy:release` only builds the release zip **locally** (into
  `build/dist/`) for inspection — it does **not** publish anything. Releasing
  always goes through the merge-the-PR flow above.
- A push to `main` with no pending changesets whose version is already tagged does
  nothing — ordinary merges never release.

**At a glance — who does what:**

| Step                          | Manual?                                                     | By         |
| ----------------------------- | ----------------------------------------------------------- | ---------- |
| Author changesets             | 🔧 yes                                                      | developer  |
| Open the Version Packages PR  | no (CI)                                                     | —          |
| Merge the Version Packages PR | 🔧 yes                                                      | maintainer |
| Tag + GitHub Release + assets | no (CI)                                                     | —          |
| Publish versioned API docs    | 🔧 yes (`gh workflow run deploy-docs.yml --ref v<version>`) | maintainer |
| Deploy to a Foundry instance  | 🔧 yes                                                      | operator   |

## 8. The build utility scripts

The build/deploy/doc/pack tooling lives in **`utils/`** (with the pack tooling
under `utils/packs/`). Each script carries a header comment describing its purpose
and how to invoke it — read the file itself for the authoritative detail. In brief:

| Script                              | Purpose                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `build-system-json.mjs`             | Generate `build/stage/system.json` from the template + version.                           |
| `copy-assets.mjs`                   | Stage templates, lang, assets, and root files into `build/stage/`.                        |
| `build-icon-font.mjs`               | Build the icon font from SVGs.                                                            |
| `build-type-catalog.mjs`            | Generate `docs/reference/type-catalog.md` from the kind enums.                            |
| `build-docs-entry.mjs`              | Generate the single TypeDoc entry barrel for cross-link resolution.                       |
| `sync-doc-version.mjs`              | Pin `…/latest` doc links to `…/v<version>` in generated output.                           |
| `docs-coverage.mjs`                 | Report doc-comment coverage.                                                              |
| `check-todos.mjs`                   | Fail the build on unlinked `TODO`/`FIXME` markers.                                        |
| `clean.mjs`                         | Remove build output (`--distclean` for a deeper clean).                                   |
| `pack-release.mjs`                  | Zip `build/stage/` into the release `system.zip` + `system.json`.                         |
| `push-stage.mjs`                    | deploy `build/stage/` to a Foundry instance (`dev`/`qa`/`prod`).                          |
| `release.mjs`                       | Legacy local release path; authenticate with `gh auth login` (CI normally cuts releases). |
| `packs/build-compendiums.mjs`       | Compile/unpack `_source/` ↔ LevelDB packs (Foundry CLI).                                  |
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
