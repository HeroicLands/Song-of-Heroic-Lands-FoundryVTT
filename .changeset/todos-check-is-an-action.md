---
"sohl": patch
---

**The TODO/FIXME check is an Action, not a script this repository carries.**
`utils/check-todos.mjs` is gone, and with it `npm run lint:todos`;
`build.yml` calls `HeroicLands/.github/actions/todos` instead.

The rule was never this repository's. A marker committed is a note to nobody in
any repository — it duplicates the issue that should carry the work, drifts out
of sync with it, and inside published JSDoc leaks onto the API site as
documentation prose. Ninety-four lines of the script said so; two said `src`
and `.ts`. Those two are inputs now, so `sohl-thalorna` and
`sohl-kethira-basic` can run the same check over their own JavaScript.

Everything the implementation was careful about survives, because each part is
the difference between a finding you act on and one you argue with: string
contents are blanked before matching, only the comment portion of a line is
examined, and the column is the marker's own so an editor opens on the word.

Two consequences worth knowing. The check now runs on the pull request rather
than inside `npm run lint`, so a marker is caught in CI and no longer by a
local `npm run build` — in exchange it runs on a bare checkout, before the
install, and fails in seconds instead of after one. And the default extensions
cover the three `.mjs` files under `src/` that the old `.ts` filter never
looked at, including `entity/expr/expression-scopes.mjs`.
