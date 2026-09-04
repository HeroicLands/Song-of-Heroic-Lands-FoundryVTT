---
"sohl": patch
---

**Where cross-repository work is tracked, and what "done" means for it** (#1400)

The project spans several repositories, but the issue standard described only this
one, so a growing share of tracked work had no documented home, label, or
completion rule.

- _Which repository an issue belongs in._ A new
  [Issue Reporting §9](https://www.heroiclands.org/sohl/kb/dev-docs/how-to/issue-reporting/)
  names the repositories the project spans and what each one tracks, so an issue
  has a documented home.
- _A delivery-target label_ makes the surface an issue lands on visible at a glance.
- _Closing keywords do not cross repositories._ `Closes …#123` from another repository
  records a reference and leaves the issue **open**. Such issues are closed by hand,
  citing the delivering commit — previously an easy way to strand an issue silently.
- _The Definition of Done is split._ The changeset, `npm run build`, `npm run docs`
  and `npm run format:check` gates are marked as specific to this repository; a
  shorter list applies to work delivered anywhere.
