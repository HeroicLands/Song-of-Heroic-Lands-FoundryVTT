---
"sohl": patch
---

**`format:check` no longer reports on generated files.** Prettier's
`--ignore-path` defaults to `.gitignore` and `.prettierignore` **at the
repository root**, and never reads a nested `.gitignore`. So the three trees
`kb/.gitignore` ignores — `content/` (assembled by `build:kb-content`),
`public/` (Hugo's output), and `resources/_gen/` (its resource cache) — were
invisible to git and fully visible to Prettier.

The result was that `npm run format:check` reported on what had been **built**
rather than on what had been **written**, on an unchanged working tree: clean
before a knowledgebase build, 735 warnings after `build:kb-content`, and — after
`build:kb` — not a report at all but a hard `SyntaxError` on Hugo's minified
HTML, which aborts the run and masks every real finding behind it.

All three are now restated in `.prettierignore`, where they take effect. A new
build test walks every nested `.gitignore` Prettier can reach and fails if a tree
ignored there is not excluded here too, so a fourth cannot repeat this.

(Closes #1632.)
