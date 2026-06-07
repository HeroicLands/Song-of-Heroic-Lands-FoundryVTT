---
"sohl": patch
---

Enforce explicit `override` modifiers with `noImplicitOverride`

Enable the TypeScript `noImplicitOverride` compiler option and add the `override`
keyword to every class member that overrides a base-class member — 67 members
across 39 files. This is a non-behavioral, compile-time-only change: no runtime
logic, method signatures, or data fields are affected, and the full test suite
is unchanged and green.

**Why:** explicit `override` makes inheritance intent visible and safe. Renaming
or removing a base-class member now produces a compile error at every stale
override (rather than silently leaving a new, disconnected member behind), and
overrides that no longer match a base member are caught immediately. With the
flag enabled, the compiler enforces the keyword on all future overrides, so the
codebase stays consistent without manual review.
