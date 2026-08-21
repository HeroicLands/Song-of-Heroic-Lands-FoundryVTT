# @heroiclands/package-build

The shared toolchain for building and shipping a HeroicLands **Foundry
package** — the parts Foundry loads whether or not the package ships any
content.

It is the counterpart to
[`@heroiclands/content-build`](https://github.com/HeroicLands/content-build), and
the two split by **input**:

| Package         | Reads                                                        | Produces                                                       |
| --------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| `content-build` | `assets/content/**`                                          | compendium packs, site content, link manifest                  |
| `package-build` | `lang/`, `styles/`, `src/`, `assets/`, the manifest template | `system.json` / `module.json`, styles, bundle, release archive |

A module uses either, or both. An adventure module that ships only notes needs
no bundler; a variant module that ships only behavior needs no Markdown
pipeline. The coupling runs one way — `package-build` asks `content-build` for
the compiled `packs[]` block, never the reverse.

## Status

**Incubating.** It is developed as a workspace package inside the SoHL
repository, exactly as `content-build` was before its own extraction, and moves
to its own repository once it has a working consumer. Until then, do not depend
on it from another repository.

## What it covers today

- **`lang`** — what a shippable Foundry localization file must satisfy: it
  parses, its top level is an object, no key is both a leaf and a dotted prefix
  of another, placeholders are single-braced, and key segments carry no data.
- **`text`** — locating a literal inside a file, so a finding names the line and
  column it is about.

## Design

**Everything exported is pure.** Functions take source text and return findings
or values; discovery, I/O and reporting stay with the caller.

```js
import { validateLangSource } from "@heroiclands/package-build/lang";

for (const file of globSync("lang/*.json")) {
  for (const finding of validateLangSource(readFileSync(file, "utf8"))) {
    reportDiagnostic({ file, ...finding });
  }
}
```

That is what lets one rule set serve a `lint` script, a build step and a unit
test without any of them agreeing on how files are found or how findings are
printed — and it is what makes the rules testable at all, which the scripts they
were extracted from were not: each ran its work at import time and exported
nothing.

Findings carry the fields the shared diagnostic format takes (`line`, `column`,
`severity`, `message`) but never `file`, which only the caller knows. The format
itself is owned by `content-build`'s `engine/diagnostics`, and is not restated
here.

## Licence

GPL-3.0-or-later.
