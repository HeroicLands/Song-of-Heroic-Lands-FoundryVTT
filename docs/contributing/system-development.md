---
title: System Development
---

# System Development

How to make a change to the Song of Heroic Lands (SoHL) **system codebase** that
fits its architecture and gets merged. Stability, architectural coherence, and
long-term maintainability are critical — many people run long campaigns on this
system, so this guide is deliberately strict about process. Read it before your
first contribution.

> Want to **build a module**, or write **macros / Script Actions**, rather than
> change the system itself? Start from the repository's
> [CONTRIBUTING.md](../../CONTRIBUTING.md), which points each audience to the right
> guide. This page is for working on the system codebase.

## Governance

- The project is maintained by the repository owner. Architectural decisions remain
  under maintainer authority.
- All changes are submitted via Pull Request — no direct commits to protected
  branches.
- Contributions are welcome, but maintainers reserve the right to decline changes
  that do not align with the long-term direction of the system.

## License agreement

By submitting a contribution (code, documentation, or creative content), you certify
that:

- You have the legal right to contribute the material.
- You agree that your contribution is licensed under the project's dual-license
  structure:
    - [GPL-3.0-or-later](https://www.gnu.org/licenses/gpl-3.0.html) for software code
    - [CC-BY-SA-4.0](https://creativecommons.org/licenses/by-sa/4.0/) for documentation and creative content
- Your contribution may be redistributed under those licenses.

Contributors retain copyright to their contributions.

## Prohibited content

Under no circumstances may copyrighted material from other projects or systems be
placed in this repository. This includes, but is not limited to:

- Copyrighted text, verbatim rule descriptions, or tables from any third-party
  publisher's rulebooks or supplements
- Names, trademarks, or trade dress of **Kelestia Productions Ltd.** or
  **Columbia Games**
- Art, maps, illustrations, or other creative assets owned by third parties
- Any content whose inclusion would infringe on the intellectual property rights of
  others

Game mechanics themselves are not copyrightable and may be implemented, but the
specific creative expression used to describe them (rulebook text, proprietary
terminology, etc.) may not be reproduced. If you are unsure whether material is
permissible, ask before contributing it. Contributions found to contain prohibited
content will be removed immediately.

## Getting set up

- **Prerequisites:** **Node.js** (see `engines` in
  [`package.json`](../../package.json) for supported versions) and **Git**. All
  other tooling (TypeScript, Vite, Sass, Prettier, ESLint, vitest) installs via
  `npm ci` and runs from `node_modules`. Optional, for specific workflows: SSH
  access to a remote host (deploying to a remote Foundry instance via
  `npm run push:dev` / `push:prod`, which use SFTP over SSH — no `rsync` needed) and
  `gh auth login` (so the legacy local release helper, `utils/release.mjs`, can read
  a GitHub token from your keychain).
- **First steps:** fork the repo, branch from `main`, run `npm ci`, and copy
  `.env.local.example` to `.env.local` (gitignored; one per developer). See
  [Getting Started](../how-to/getting-started.md) for the full setup and codebase
  tour.
- **Learn the mental model before changing anything:**
  [Architecture Overview](../concepts/architecture.md) — the three-layer design and
  a map of the `src/` tree.

## Core rules (non-negotiable)

1. **No cosmetic refactors.** This is a large, interdependent system; cosmetic
   churn causes regressions. Change code because behavior needs it.
2. **Extension over rewrites.** Prefer hooks, actions, registries, and subclassing
   over editing core source.
3. **Small, focused changes.** One feature, one bug fix, or one documentation
   improvement per PR. No mixed refactors or "drive-by cleanups."
4. **No placeholders or stubs.** Submit complete, working implementations.
5. **Backwards compatibility.** Never rename, remove, or restructure existing data
   fields without a migration strategy (see below) — treat every data-model change
   as high-risk.
6. **Stable localization keys.** Never rename existing keys in `lang/en.json`; add
   new keys instead.
7. **The logic layer stays Foundry-free.** All Foundry API access goes through
   `src/core/FoundryHelpers.ts` (see [Architectural boundaries](#architectural-boundaries)).
8. **Test-driven development.** Write the test before the code it verifies.

## Development workflow

### Issue first

No repository change lands without a tracking GitHub issue — **except** pure
`cleanup/*`, `docs/*`, and `chore/*` work (housekeeping, documentation, and
tooling with no shipped-behavior change). File or find the issue before you start
so you have its number for the branch name.

When you open an issue, the **body is the problem statement only** — symptoms,
reproduction, expected vs. actual, and optionally acceptance criteria. Root cause
and the proposed fix go in a **comment**, not the body.

### Branch naming

- Feature and bug branches: `<type>/issue_<#>_<short-kebab-summary>` — for example
  `bug/issue_59_actor-pack-embedded-keys` or `feat/issue_72_combat-tracker-actions`.
  The `issue_<#>` segment is the parseable source of truth; the trailing slug is a
  human-readable label.
- Issue-free types: `cleanup/<slug>`, `docs/<slug>`, `chore/<slug>`.

### Test-driven development

Write the test first, watch it fail, then implement. Tests run in Node via
[vitest](https://vitest.dev) — **no Foundry VTT required**:

- Construct logic objects with the builders in `tests/mocks/logicHarness.ts`
  (`makeItemLogic` / `makeActorLogic` / `makeMockActor` / `makeAttributeStub`).
- Use `it.todo("...")` to document intended-but-unimplemented behavior.
- Run `npm run test` before `npm run build`. See [Testing](../how-to/testing.md).

### No orphan TODOs

Every `TODO`/`FIXME` that survives a merge must reference a tracking issue, written
as `TODO(#123)` / `FIXME(#123)`. If a marker isn't worth an issue, do the work now
or delete the comment. `npm run lint:todos` (run in CI and `build:noci`) fails the
build on any unlinked marker.

### Changesets

`feat/*` and `bug/*` branches **always** add a `.changeset/` entry — regardless of
whether the change is user-facing. `cleanup/*`, `docs/*`, and `chore/*` need none.
Keep the changeset current as work progresses (don't write it only at the end),
reference the issue, and describe **only the fix** — the problem context lives in
the issue. See [Writing Changesets](./writing-changesets.md) for details.

### Format before commit

Run `npm run format:check` (Prettier) **first**. If a file you did **not** touch
shows up as unformatted, stop and ask — do not run `format` blind, since
`prettier --write .` formats the whole repo and would sweep unrelated drift into
your commit. Once only your files are flagged, run `npm run format`, then `git add`
only your files.

### Submitting a pull request

Before opening the PR, both of these must pass without errors:

```bash
npm run build
npm run docs
```

Submit with a clear description of what changed and why.

## Architectural boundaries

The **logic/domain layer is Foundry-free**, and new logic/domain code must keep it
that way: never value-import from `**/foundry/**` or other Foundry-coupled modules —
use `import type`, or add a `fvtt*` shim to `src/core/FoundryHelpers.ts` (plus its
mock). The boundary, why it holds, and the ESLint + purity guards that enforce it are
described in [Architecture → Logic layer](../concepts/architecture.md#logic-layer) —
read it (and [Extension Points](../how-to/extension-points.md)) before changing core
systems.

## Do not touch without maintainer approval

Open an issue and discuss before changing any of the following — do not submit
unsolicited PRs for them:

- The foundations: `SohlSystem.ts` (registration/wiring), `SohlDataModel.ts`,
  `SohlItem.ts` / `SohlActor.ts`, `SohlLogic.ts`, world migration logic, and
  `sohl.ts` (system initialization).
- Core data-model changes, the combat-resolution pipeline, the class registry, and
  large or cross-cutting refactors.

If a data-model change is unavoidable it must be approved first, documented, ship
with automatic migration code that upgrades old worlds seamlessly, and be tested
against real world data — migrations must never require manual user intervention.

## Conventions

- **File headers.** Every `.ts` file carries the GPL-3.0 license header; every
  `.hbs` file carries the HBS license header.
- **JSDoc.** Public-API JSDoc feeds TypeDoc generation — keep it complete and
  lint-clean. PRs that modify behavior update the relevant docs: JSDoc for public
  APIs, [Extension Points](../how-to/extension-points.md) for extension points, and
  the user guide under `../../assets/packs/journals/_source/` for user workflows.
- **Documentation links.** In `docs/` markdown, link to code by **symbol**, not
  coordinates. Use `{@link Symbol}` / `{@link Symbol.member}` for API-documented
  symbols — it resolves to the symbol page on api.heroiclands.org and never drifts.
  For symbols absent from the API (DataModels, Sheets), use a path-only file link
  (no line numbers) and name the symbol in prose. **Never** use line-range fragments
  (`#L120-L140`): they rot silently on any edit and duplicate TypeDoc's automatic,
  commit-pinned source links.
- **Foundry v14.** Target Foundry VTT v14+ and follow the v14 patterns described in
  the [Architecture Overview](../concepts/architecture.md).
- **Null vs. undefined — null at the edges, undefined in the core.** Absence is not
  spelled two ways at random:
    - _Persistence and the Foundry API boundary use `null`._ DataModel fields and
      the Foundry APIs that natively return `null` (`DialogV2` dismissal, `getFlag`,
      document lookups) keep it — Foundry mandates it and `null` survives
      `JSON.stringify` where `undefined` keys are dropped.
    - _The logic/domain layer uses `undefined`_ for "maybe absent" — matching
      optional parameters/properties (`?:`), which already yield `undefined`. Write
      `T | undefined` directly; there is no `Optional<T>` alias (an alias cannot
      cover `?:` positions, so it could never be the single consistent spelling).
    - _The `FoundryHelpers` shim normalizes_ Foundry `null` to `undefined` as values
      cross into the logic layer.
    - `== null` / `!= null` (matches both) is the blessed idiom at genuine mixed
      boundaries; `eqeqeq` (configured with `{ null: "ignore" }`) enforces strict
      equality everywhere else.
- **DataModel empty values — sentinel vs. nullable.** In persisted schemas the choice
  is semantic, not serialization-driven (both `null` and `""`/`0` round-trip). Use a
  typed blank sentinel (`""`, `0`, `[]`, `{}`) when the empty state is itself a valid
  value; use `nullable: true, initial: null` only when "unset / not-applicable" must be
  distinguishable from _every_ valid value (an optional cap, a die size, an optional
  reference). Always set `initial` explicitly — a bare `new StringField()` is
  non-required and silently initializes to `undefined`, not `""`.

## Extending SoHL instead of changing it

If you want to _extend_ the system rather than change its core — ship house rules,
add content or automation, or script behavior — do it from the outside:

- [Writing Modules](./module-development.md) — build a Foundry module that integrates with or
  extends SoHL via hooks, registries, the `sohl` public object, and CSS variables.
- [Macros and Actions](../concepts/macros-and-actions.md) — write macro-bar scripts or
  document-attached Script Actions against the SoHL API.
- [The SoHL API](../concepts/sohl-api.md) — the document and `sohl` surfaces scripts
  and modules use.

These build on the deeper how-to references —
[Extension Points](../how-to/extension-points.md) and
[Lifecycle Hooks](../how-to/lifecycle-hooks.md).

## AI-assisted contributions

AI tools may assist, but you are fully responsible for the result. Do not submit
unreviewed AI-generated code. Ensure all output maintains architectural
consistency and avoids speculative abstractions or unnecessary complexity.

## Welcome contributions

These areas are especially welcome and generally safe without prior discussion:

- Documentation improvements and clarifications
- JSDoc comment improvements
- User-guide enhancements
- Bug fixes with minimal, well-scoped changes
- Isolated UI/UX improvements
- Additional test coverage
- Localization contributions
