---
"sohl": patch
---

**`system.json` is generated from `content-build.config.yaml`. The hand-authored
template is retired.**

`assets/templates/system.template.json` was the last build input still written
as JSON by hand — and it declared facts this repository already declared: the
pack list twice in two formats, the package id twice, the Foundry range where
the config could only point at it. `package-build manifest` builds the whole
file now, and the generated `system.json` is byte-identical to the one shipped
before, all 24 keys and key order included.

`utils/build-system-json.mjs` (143 lines) is replaced by
`utils/manifest-flags.mjs`, which computes only what cannot be written down: the
credits journal's `@UUID`, which exists only once the content tree has been
walked.

Each pack now carries the `label` Foundry shows it under — the manifest used to
restate every pack's name and type beside one.

The package-id drift guard and its test go with the template: the id is derived
from `package.json` `name` and declared once, so there is nothing left to
corroborate.
