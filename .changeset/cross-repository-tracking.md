---
"sohl": patch
---

**Where cross-repository work is tracked, and what "done" means for it** (#1400)

The project spans three repositories — the system, the Obsidian vault, and
heroiclands.org — but the issue standard described only the first, so a growing share
of tracked work had no documented home, label, or completion rule.

- _One tracker._ A new [Issue Reporting §9](https://www.heroiclands.org/sohl/kb/dev-docs/how-to/issue-reporting/)
  states that this repository tracks all three, and why: the four-axis standard is
  per-repository machinery that would have to be triplicated, the work forms one
  dependency chain, and the vault is private.
- _A `vault` label_ joins `site` in the closed registry, so an issue's delivery target
  is visible at a glance.
- _Closing keywords do not cross repositories._ `Closes …#123` from another repository
  records a reference and leaves the issue **open**. Such issues are closed by hand,
  citing the delivering commit — previously an easy way to strand an issue silently.
- _The Definition of Done is split._ The changeset, `npm run build`, `npm run docs`
  and `npm run format:check` gates are marked as specific to this repository; a
  shorter list applies to work delivered anywhere.
