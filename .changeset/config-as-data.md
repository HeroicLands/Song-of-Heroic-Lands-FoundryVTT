---
"sohl": patch
---

**This repository declares its build in `content-build.config.yaml`.** The
`.mjs` config it replaces contained no logic — only the boilerplate a code file
needs in order to state a literal, and every consuming repository reproduced the
same three pieces of it. content-build 0.14.0 derives them instead:

| Field                 | Derived from                                                    |
| --------------------- | --------------------------------------------------------------- |
| `rootDir`             | the directory the config file sits in — authoring it now throws |
| `stats.systemVersion` | `version` in the adjacent `package.json`                        |
| `itemBuilders`        | the name `sohl`, resolved to the shipped registry               |

The third is what removed the last import: the configuration **names** the
item-builder registry rather than importing it, because data cannot carry
functions. A consumer whose registry is its own code still writes
`content-build.config.mjs`; both forms end at the same `defineConfig` and are
validated identically.

Nothing shipped changes. The compiled packs are byte-for-byte identical across
all 2,828 documents, verified by compiling both ways and diffing.
