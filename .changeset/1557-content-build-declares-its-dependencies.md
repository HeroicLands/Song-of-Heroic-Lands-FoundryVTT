---
"sohl": patch
---

**`@heroiclands/content-build` now declares the packages it imports, so it works
outside this workspace.** The package shipped with no `dependencies` block at
all (#1557).

Inside this repository that was invisible. The package is a workspace, npm
hoists the root's `devDependencies` into the workspace root's `node_modules/`,
and every import resolved. Installed from npm by another repository nothing
hoists, and `content-build package compile` died on its first import.

**What is now declared.** The eight packages the shipped code imports at
runtime — `@foundryvtt/foundryvtt-cli`, `classic-level`, `loglevel`,
`loglevel-plugin-prefix`, `markdown-it`, `unidecode`, `yaml` and `yargs` — plus
`vitest` as a devDependency, which the package's own suite had likewise been
borrowing from the root. Two of them, `markdown-it` and `yargs`, were not root
`devDependencies` either: they resolved only because something else happened to
pull them in as a transitive dependency, so the build rested on another
package's dependency list.

`package-lock.json` is regenerated in the same change — that is why the fix did
not travel with #1512, since a stale lockfile makes `npm ci` refuse to install.
No resolved version moved; the entries the package now owns simply stopped being
marked `dev`.

**A guard, so the manifest cannot drift again.**
`tests/dependencies-are-declared.test.ts` reads the package's `files` field,
walks every module it actually ships, and asserts that each bare specifier is a
Node builtin, the package addressing itself, or a declared dependency — with the
reverse checks too: nothing shipped may import a `devDependency`, and no
declared dependency may go unimported. It is the counterpart to
`suite-is-self-contained.test.ts`, which guards the same "passes in situ, fails
when installed" failure from the test side.

**`content-build --version` now reports its own version.** `yargs` defaults to
the _nearest_ `package.json` walking up from the working directory, which in a
consuming repository is the consumer's manifest — so the command reported the
consumer's version rather than the toolchain's. It now reads the version from
the package's own manifest.

Verified by packing the package with `npm pack` and installing the tarball into
a scratch directory outside the repository: `content-build --version`,
`content-build --help`, and `import("@heroiclands/content-build/engine")` all
succeed there, exercising every declared dependency.
