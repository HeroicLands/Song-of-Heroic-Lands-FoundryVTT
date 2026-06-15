---
title: Contributing
children:
    API Docs Hosting: ./api-docs-hosting.md
---

# Contributing

How to make a change to Song of Heroic Lands (SoHL) that fits the system's
architecture and gets merged. Stability, architectural coherence, and long-term
maintainability are critical here — many people run long campaigns on this system,
so this guide is deliberately strict about process.

New here? Start from the repository's [CONTRIBUTING.md](../../CONTRIBUTING.md),
which lays out the onboarding sequence and the binding licensing/IP terms, then
come back to this page for the standards and the day-to-day workflow rules.

## Governance

- The project is maintained by the repository owner. Architectural decisions
  remain under maintainer authority.
- All changes are submitted via Pull Request — no direct commits to protected
  branches.
- Contributions are welcome, but maintainers reserve the right to decline changes
  that do not align with the long-term direction of the system.

## Licensing and prohibited content

By contributing you certify you have the right to the material and agree it is
licensed under **GPL-3.0-or-later** (code) and **CC-BY-SA-4.0** (documentation and
creative content). Never add third-party copyrighted material — rulebook text or
tables, or the names/trademarks/trade dress of **Kelestia Productions Ltd.** or
**Columbia Games**. The full, binding statement is in
[CONTRIBUTING.md](../../CONTRIBUTING.md); read it before your first contribution.

## Core rules (non-negotiable)

1. **No cosmetic refactors.** This is a large, interdependent system; cosmetic
   churn causes regressions. Change code because behavior needs it.
2. **Extension over rewrites.** Prefer hooks, action items, registries, and
   subclassing over editing core source.
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
the issue. In changeset summaries, do not use `#` ATX headings; use `**bold
labels**` and `_underscores_` for italics.

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

The **logic/domain layer is Foundry-free** and stays that way by enforcement: an
ESLint `@typescript-eslint/no-restricted-imports` rule blocks value imports of
Foundry-coupled modules from the logic zones (type-only imports are allowed), and
`npm run test:purity` imports every logic/domain module in an environment with no
Foundry globals. New logic/domain code must not value-import from `**/foundry/**`
or other Foundry-coupled modules — use `import type`, or add a `fvtt*` shim to
`src/core/FoundryHelpers.ts` (plus its mock). Read
[Architecture Overview](../concepts/architecture.md) for the mental model and
[Extension Points](../how-to/extension-points.md) before changing core systems.

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
  the user guide under `../../assets/packs/journals/data/user-guide/` for user
  workflows.
- **Foundry v14.** Target Foundry VTT v14+ and follow the v14 patterns described in
  the [Architecture Overview](../concepts/architecture.md).

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
