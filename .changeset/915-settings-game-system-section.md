---
"sohl": minor
---

**Branded "Game System" section in the settings sidebar**

The "Song of Heroic Lands" block in the Game Settings sidebar is now a compact,
branded section — the coiled-dragon emblem, the system title, the running
version, and a row of inline external links — modelled on how other systems
present themselves there. It replaces the previous full-width link buttons and
sits at the top of the tab, just below Foundry's build/module info.

**More links, single-sourced.** The section now also links to **Issues** and
**Discord** alongside the Main Site, Knowledgebase, and API Documentation. Every
URL is read at runtime from `system.json` `flags.sohl`, which the build copies
from `package.json` — so links are edited in exactly one place and never
hardcoded in the system code.

**Version-exact API docs.** The API Documentation link points at _this_ version's
docs (`api.heroiclands.org/v<version>`) rather than the moving `/latest` alias, so
a running world always reaches the docs matching the system it is running.

**Theme-aware emblem.** The emblem ships as a single black SVG and is recolored by
the build-time icon pipeline, reading as ink on the light sidebar and cream on the
dark one. Foundry's redundant native system row is removed once the branded
section renders, so the version is shown once, in the branded block.

Closes #915
