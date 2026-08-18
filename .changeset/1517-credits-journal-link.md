---
"sohl": minor
---

Surface Credits & Attributions as an in-app Journal Entry, reachable from two places (#1517).

Until now the system's credits and third-party attributions shipped only as files
on disk — `assets/icons/game-icons/ATTRIBUTION.md`, `assets/icons/brand/NOTICE.md`,
`LICENSE.md`, and a list in `README.md`. Nobody running the game ever saw them.
Foundry does not help: Module Management renders a package's authors and URL but
never its licence, and shows nothing at all for the system. The bundled Game-Icons
artwork is CC BY 3.0, which asks for attribution conveyed in a manner reasonable to
the medium; a markdown file inside the system folder arguably is not that.

**Two entry points, one journal.** A **Credits** entry now sits in the branded SoHL
block of the Settings sidebar, alongside Main Site / Knowledgebase / API Docs /
Issues / Discord, and a **Credits & Attributions** row sits at the top of the "Song
of Heroic Lands" tab in Game Settings. Both open the same compendium JournalEntry.

**The sidebar entry is a button, not an anchor.** Its five neighbours open a browser
tab; this one opens a sheet in the client, so it is a `<button type="button">` for
semantics and keyboard behaviour, styled to be indistinguishable from the anchors
beside it under both of Foundry's interface themes. The render context entry shape
widened from `{ label, url }` to `{ label, url }` _or_ `{ label, action }`, and the
existing "drop an entry whose value is empty" rule carries over unchanged — a build
that failed to stamp the UUID renders no entry rather than a dead control.

**The page is ordinary content.** `assets/content/Credits/README.md` is a standard
`type: doc` note (`shortcode: credits`, alias `doc-credits`) in a new `credits`
category, so it compiles into the journals pack like any other note and publishes to
the knowledgebase at `/sohl/kb/credits/`. It carries the Game-Icons contributor
credits and the CC BY 3.0 §4(a) modification disclosure, the dual-licence summary,
the trademark reservation, and the statement of independence from Kelestia
Productions.

**The UUID is stamped, not hardcoded.** `utils/build-system-json.mjs` resolves the
credits note from the content tree and writes
`flags.sohl.creditsUuid` into `system.json`, so the note's frontmatter `id` stays
the single source of truth. A missing or ambiguous note fails the build rather than
shipping a silently empty flag.

**Modules get the same button from one call.** `registerCreditsMenu(packageId)` is
exported as `sohl.apps.foundry.registerCreditsMenu`; a module declares
`flags.sohl.creditsUuid` in its own `module.json`, ships its own credits journal,
and calls it once during `init`. Foundry constructs a settings menu's `type` with
**no arguments**, so the UUID cannot be passed at construction — hence a factory
that closes over it and returns an app whose `render` opens the journal instead of
displaying a window. Registration order is load-bearing: menus render in
`game.settings.menus` insertion order, so the credits call comes first in
`registerSystemSettings`. The menu is deliberately **not** `restricted` — credits
exist to be read, and GM-only would hide them from every player in the world.

Recorded in `kb/dev-docs/contributing/module-development.md` as the module recipe.
