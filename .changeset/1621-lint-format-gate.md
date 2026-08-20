---
"sohl": patch
---

**Prettier compliance is now enforced, not honoured.** `npm run format:check`
ran in no workflow and was in neither `npm run lint` nor `npm run build:noci`, so
nothing checked it — and 32 committed files had drifted out of it.

`lint:format` (`prettier --check .`) now runs **first** in the `lint` chain, and
therefore in every build and every CI run. The 32 files are reformatted in a
separate, behaviour-free commit so the whitespace is reviewable apart from the
gate.

All of the drift was one formatting rule moving: Prettier's layout for union
types, which collapses a union that no longer needs wrapping onto one line. That
is worth knowing because it will recur — `prettier` is declared as `^3.9.6`, so
the installed formatter travels with the lockfile, and a minor that changes a
layout rule invalidates files nobody edited. The gate turns that from silent
accumulation into a one-line build failure, and the contributing guide now says
to answer it with a reformat-only commit rather than folding it into unrelated
work.

The gate depends on #1632: until the generated `kb/` trees were excluded,
`prettier --check .` failed with a `SyntaxError` on Hugo's minified HTML for
anyone who had built the site, so this could not have landed reliably before it.

(Closes #1621.)
