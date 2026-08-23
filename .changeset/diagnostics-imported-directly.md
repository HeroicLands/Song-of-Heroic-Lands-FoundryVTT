---
"sohl": patch
---

**The 13 checks import the diagnostics contract directly.**
`utils/lint-diagnostics.mjs` is gone.

It was a re-export barrel: six lines of code re-exporting
`@heroiclands/content-build`'s diagnostics and one alias. Ten of its thirteen
consumers imported a single symbol from it, so it saved nothing — one import
line either way — while costing a reader an indirection and, worse, a rename:
`reportDiagnostic` was `emitDiagnostic` wearing a different name, so grepping
this repository for the real one found nothing. Three of the six re-exports had
no caller at all.

Every call site now names what it actually uses — `emitDiagnostic` and
`positionOfLiteral` — from the package that defines them.

`tests/build/lint-diagnostics.test.ts` goes with it: it tested content-build's
`formatDiagnostic`, `emitDiagnostic` and `locateInText` through the barrel, and
content-build tests the first two itself. The third no longer exists anywhere.
