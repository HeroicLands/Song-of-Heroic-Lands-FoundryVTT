---
"sohl": patch
---

**Docs: guided-tours `display: false` and the coach-the-prerequisite pattern**

`how-to/guided-tours.md` didn't reflect two tour conventions from #839.

- **`display: false`** — a new _Listing vs. hiding a tour_ subsection: `display`
  controls Tour Management visibility, not registration, so an internal/e2e-only
  tour (the framework demo) is registered but hidden with `display: false`. The
  worked-example description now notes this.
- **Coach the prerequisite instead of gating `canStart`** — a new subsection
  contrasting a hard `canStart` eligibility gate (which greys out Start with no
  reason shown) with the Assisted Combat pattern: stay always-startable and open
  with a Next-disabled state gate that coaches the user to satisfy the prerequisite
  (an owned Being). The config example's `canStart` line, which demonstrated the
  anti-pattern, is updated to match.

Closes #873
