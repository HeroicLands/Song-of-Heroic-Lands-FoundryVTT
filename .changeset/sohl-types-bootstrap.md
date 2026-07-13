---
"sohl": patch
---

**Repo: scaffold the `@heroiclands/sohl-types` package (#407)**

Adds `packages/sohl-types/` — a standalone, types-only, publish-public package that
will ship SoHL's public type declarations to external TypeScript modules. This
first `0.0.x` is a bootstrap placeholder that establishes the package and its
Trusted-Publishing setup; the full generated declarations (the Logic/Data
interfaces and the `sohl.*` namespace tree) follow in #407. No change to the SoHL
system runtime — the package is published separately and declares no runtime
values.
