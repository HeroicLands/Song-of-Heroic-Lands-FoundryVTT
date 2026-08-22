---
"sohl": patch
---

**Five build wrapper scripts are gone, replaced by `@heroiclands/package-build`'s
command line.** They contained no logic — only the boilerplate a code file needs
in order to state a literal, and every value in them is now configuration:

| Was                                 | Is                             |
| ----------------------------------- | ------------------------------ |
| `node utils/clean.mjs`              | `package-build clean`          |
| `node utils/copy-assets.mjs`        | `package-build assets`         |
| `node utils/check-lang.mjs`         | `package-build lang check`     |
| `node utils/pack-release.mjs`       | `package-build release`        |
| `node utils/push-stage.mjs <stage>` | `package-build deploy <stage>` |

Every script name is unchanged, so `npm run build:assets`, `npm run lint:lang`,
`npm run push:qa` and the rest behave exactly as before — including the
release workflow, which invokes `build:pack-release` by name.

`utils/push-stage.mjs` had hard-coded `packageKind: "systems"` and
`packageId: "sohl"` beside a configuration that already declared both; the CLI
reads them from where they were already written. The asset table, the
localization glob and the guidance printed after a lang failure all move into
`packageBuild:` in `content-build.config.yaml`.

The one genuine piece of code stays here: `utils/svg-theme.mjs` now exports the
`transform` hook the CLI calls, so every staged SVG is still recolored to follow
the Foundry theme.

Nothing shipped changes. Staging the assets both ways produces 4,703
byte-identical files.
