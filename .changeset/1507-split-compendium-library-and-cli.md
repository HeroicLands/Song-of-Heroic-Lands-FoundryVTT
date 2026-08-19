---
"sohl": patch
---

**devops: the pack compiler is a library again, with the CLI on top of it.**
`utils/packs/build-compendiums.mjs` did four things at module scope — created
`build/tmp/packs/` in the caller's working directory, eagerly read
`assets/templates/system.template.json` (and threw when absent), reconfigured
the shared `loglevel` singleton, and parsed `process.argv` — so importing it
from anywhere ran a CLI instead of loading a module. A module repository, which
ships `module.json` rather than a system template, could not import it at all.

- `utils/packs/compendiums.mjs` is the library: `compilePacks`, `unpackPacks`,
  and `cleanPacks` take every path, pack list, and selector as an argument, and
  the module has no import-time side effects.
- `utils/packs/bin/build-compendiums.mjs` is the CLI, and owns all four: argv,
  logging, directory creation, and the process exit code. `compilePacks` now
  throws when pack JSON generation reports errors; the CLI reports the message
  and sets the same failing exit code, so the #1502 guard is unchanged from
  outside.
- `build:compiledb` and `build:unpackdb` point at the CLI's new path. Pack
  output is byte-identical.

(Closes #1507.)
