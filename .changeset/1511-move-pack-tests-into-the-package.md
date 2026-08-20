---
"sohl": patch
---

**devops: the pack-pipeline tests now live with the toolchain they exercise.**
Twenty-six test files moved out of `tests/` and into
`packages/content-build/tests/`, so `@heroiclands/content-build` is verifiable on
its own rather than only in situ. Imports and paths were adjusted; no test was
rewritten.

**Two vitest projects.** `vitest.config.ts` declares `system` (`tests/**`, with
`tests/setup.ts` and the `@src` aliases) and `content-build`, the latter by
referencing `packages/content-build/vitest.config.ts` — the same file
`npm test -w @heroiclands/content-build` loads, so a single root `npm run test`
still gates everything and the two entry points cannot run different suites. The
package's harness installs no Foundry globals and offers no alias onto a
consuming repository's source; a new guard fails the build if a test in that
suite reaches for either.

**What deliberately did not move.** `src-import-severance.test.ts` asserts facts
about _this repository_ — that its `utils/packs/` imports nothing from `src/`,
and that the runtime and the build package still agree on default item art,
affiliation standings, and the description-pointer rule. It moved to
`tests/build/` instead, taking with it the one `item-docs` case that reads the
runtime's own `descriptionLinkTarget`. `content-aliases.test.ts` covers a
repository content lint with no pack-pipeline consumer, and stays.

**New coverage** for the surface #1508 made configurable, asserted from a foreign
layout in a throwaway tree: a consumer that relocates its content and manifest
directories is honoured and the content walk reads the moved tree; the `_stats`
identity is stamped from that consumer's configuration; the core version follows
the manifest's `compatibility.minimum` with configuration untouched, proving
config supplies a _path_ and never a captured value; and every path resolves
identically whatever directory the build was launched from.

Pack output is byte-identical.

(Closes #1511.)
