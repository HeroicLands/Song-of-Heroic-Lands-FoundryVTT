# sohl

## 0.9.0

### Minor Changes

- 1cf01a2: **Birthsigns combine by taking the best aptitude, and the twelve cusp signs are
  gone.** A cusp was never a sign in its own right: its modifiers are the
  elementwise maximum of the two signs it sits between. Holding that derived
  result as twelve more content files meant nothing enforced the derivation
  (editing a principal sign silently desynchronised its two cusps), nothing stated
  it, and a birth under three signs could not be expressed at all. Closes #1378.
  
  **A generic aptitude field.** Mysteries carry `system.skillAptitudes` — a map of
  selector to mastery-level modifier, where a selector is a skill shortcode or
  `subType:<value>`. Nothing about it is birthsign-specific; any item asserting an
  innate leaning toward or away from a class of skills can carry one.
  
  **Aptitudes never sum.** Where several items speak to one selector, the
  _greatest_ value wins, and a skill matched both by shortcode and by subtype takes
  the greater of the two. Each aptitude-bearing item merges into the being's
  accumulator during the evaluate phase; each skill applies its own entry as a
  single `Aptitude` delta on its mastery level during finalize. A selector matched
  at `0` adds no delta, though the `0` still counts in the merge — an element left
  untouched beats one another sign hinders.
  
  **What this means in play.** One sign behaves exactly as before. Two neighbouring
  signs — a birth on the threshold — reproduce the former cusp values precisely,
  including the +15 standing surplus, the +15 peak, and the −10 floor, which the
  rules now state as a consequence of the rule rather than leaving as an unexplained
  property of half the wheel. Three or more signs keep climbing, which the rules
  frame as a deliberate GM choice.
  
  **Migration.** None is required. A birthsign already embedded on an actor keeps
  the Active Effects it was created with and carries no aptitude map, so it neither
  breaks nor double-counts — including a cusp item, whose baked-in values are
  already the maximum of its neighbours.
- c94df34: Export SoHL content from the HeroicLands vault, and read `type-shortcode`
  wikilinks
  ([#1387](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1387)).
  
  Content authoring moves to the vault, so `assets/content/` becomes a **generated
  artifact that is committed** — the same arrangement as `type-catalog.md`. The tree
  stays in git deliberately: only the maintainer has a vault, so a build that reached
  for one would work on exactly one machine. Contributors and CI build from the
  committed tree and never need it.
  
  The consequence is worth stating plainly, because nothing warns about it: **an edit
  made to `assets/content/` in this repository is reverted by the next export.**
  Content fixes belong in the vault; pipeline fixes belong in the exporter.
  
  **The exporter.** `npm run content:export` mirrors the vault's `SoHL/` tree into
  `assets/content/`; `npm run content:check` reports drift and changes nothing. The
  mirror is authoritative — it retires what the vault no longer carries, so a note
  deleted in the vault cannot linger here and keep compiling into the packs. The
  vault's `Setting/` tree is never exported. `HEROICLANDS_VAULT` in `.env.local`
  names the checkout.
  
  **Wikilinks read `type-shortcode`.** Obsidian resolves `/` inside a wikilink as a
  **path** against the vault's folders, so `[[doc/shock]]` is a broken link in the
  editor where notes are now written. A hyphen qualifies only when what precedes it
  is a known type — note names contain hyphens too (`Grukar-ahk`), and those keep
  resolving as aliases — and the split is at the first hyphen, so a shortcode may
  contain one. The `type/shortcode` form is still resolved, so nothing written before
  the migration dies.
  
  This mattered more than it looks. The pack resolver's alias index is scoped to the
  _source_ note's type, so a hyphen link happened to resolve between two `doc` notes
  and silently failed from every other type: 283 links, including every
  `docskill-…` reference to an item's write-up, compiled to literal text.
  
  **Two silent failures are now loud.** An absent or empty content tree used to
  compile zero documents and _succeed_, shipping blank compendiums with nothing in
  the log to say so, while `lint:packs` reported every one of nothing as uniquely
  keyed. The pack build and that check now both fail on an empty tree, the export
  refuses to mirror a vault that yielded no files, and `lint:rules-vtt` names the
  missing tree instead of throwing a bare `ENOENT`.
  
  **Content no longer in the system.** 145 creature notes and the twelve Astrokýklos
  birthsign notes are authored in the vault's `Setting/` tree, which is not exported,
  so they no longer compile into the compendiums. The birthsign **matrix** remains a
  tested specification and the aptitude-combination logic it drives is unchanged.
- 27e4b76: **`system.docUrl` is removed** (#1394)
  
  Every compiled item carried an absolute `https://heroiclands.org/...` documentation URL
  in its system data, and every world inherited a copy the moment the item was imported.
  Nothing read it — in-app documentation is the compiled JournalEntry an item points at
  through `docHtml`'s `@UUID` — so its only effect was to make any future change to the
  published address a pack rebuild _plus_ a world migration. Six items' URLs were already
  404ing.
  
  The field is gone from the shared data schema and from the pack builder, and its four
  `lang/en.json` label/hint keys are retired with it. Should an external documentation link
  be wanted later it will be derived at render time from one base constant, not stored per
  document.
  
  **Existing worlds are migrated.** A `0.9.0` step rewrites each actor's and item's
  `system` object with the key omitted. It has to be a rewrite rather than a deletion:
  Foundry prunes any key its schema does not declare out of both a document's source and
  an update's change set, so once the field left the schema a `-=docUrl` payload would
  delete nothing — and a migrator could no longer even see the stale value. The stored
  record is what still holds it, and the write scrubs it.
  
  **The runner now writes embedded documents on the same terms as top-level ones**
  (#1402). It passed `{diff: false, recursive: false}` for an Actor but nothing at all for
  the Items embedded on it, so embedded documents migrated on Foundry's defaults. A
  diffed update drops a payload that restates existing data — exactly the shape a
  field-removal migration must take — leaving the record unwritten while the run still
  counted it as applied; and `recursive` decides whether a root-level key replaces or
  merges, so one migrator meant two different things depending on where the document
  lived. Seeding a world with 51 stale records showed 49 of them, all embedded, surviving
  a run that reported `{planned: 1, applied: 51, errors: 0}`.
  
  **Two migration contracts are corrected** while the first real migration goes in. A
  migrator's payload **replaces each root-level key rather than merging into it** — a
  dot-path payload such as `{"system.foo": 1}` expands and discards the rest of `system`,
  which for a SoHL item fails validation on the required `subType`. Build payloads by
  spreading the source object. And a field already absent from the schema cannot be
  removed by key at all. Both are now documented on `DocMigrator` and in the migration
  reference.
- a4170d6: **An Affiliation can now record how its organization stands toward others.**
  An affiliation described only a character's position _inside_ one body, so
  cross-faction standing — a syndicate member met by a guild reeve, a priest before
  a rival shrine, two houses in open rivalry — had nowhere to live but the GM's
  memory, and nothing could consult it.
  
  - **New `relation` table**, keyed by another affiliation's shortcode, with one of
    four standings: **aligned**, **unaligned**, **rival**, **nemesis**. Only
    non-neutral relations need authoring — an unlisted affiliation reads as
    `unaligned`, so an empty table means neutral toward everyone.
  - **`AffiliationLogic.standingWith(shortcode)`** is the stable seam to read it,
    answering `unaligned` for anything unrecorded.
  - **Edited on the affiliation's Properties tab.** _Add Relation_ prompts for the
    other affiliation — picked from the character's own affiliations, or entered by
    shortcode on a world/compendium item — and its standing; each row's standing is
    a live control, and the trash icon returns that pair to neutral. A recorded
    shortcode that resolves to nothing is shown flagged rather than dropped.
  - **Authorable in content** via a `relation` map in an affiliation's frontmatter;
    an unknown standing is a build error rather than a silently neutralized one.
  
  This records and reports a relationship; it never acts on one. Nothing is rolled
  or applied because two bodies are hostile, and any later use of the standing stays
  behind a human trigger. Overarching groupings (a pantheon, an arcane tradition)
  need no new field: author the grouping as an affiliation in its own right and let
  its members name it, so a member can be aligned with the pantheon and the nemesis
  of another god within it.
  
  (Closes #1404.)
- a4170d6: **An Affiliation now records what kind of organization it is.**
  Affiliation was the only item type without a `subType`, so nothing could ask
  whether a body was a church, a school of magic, a spirit tradition or a secular
  guild — and the associated-affiliation picker on a Mystical Ability or Mystery
  had to offer all of them, presenting a thieves' guild to a divine incantation.
  
  - **New `subType`**, chosen from **arcane** (schools of magic, including
    alchemical schools), **divine** (religions and churches), **spirit** (shamanic
    and totemic traditions, ancestor and spirit cults) and **social** (everything
    secular: guilds, banks, syndicates, noble houses, military units). It is
    `required` with no default, matching every other subtype-bearing item type,
    and is edited on the affiliation's Properties tab. `divine` and `spirit` stay
    distinct because the mystical-ability subtypes already tell those families
    apart, and a filter is only as good as the partition beneath it.
  - **Existing worlds migrate automatically.** The first entry in the migration
    registry stamps `social` on affiliations that predate the field (and on any
    value outside the permitted set, which Foundry would otherwise drop silently).
    No manual intervention is needed, and no shipped content is affected — the
    system ships no affiliations of its own.
  - **`actorItemRefOptions` takes an optional predicate**, so a picker can narrow
    what it offers to the affiliations of a relevant kind. Existing call sites pass
    nothing and are unchanged. The specific mystical-ability-subtype → affiliation-
    subtype mapping is a rules decision and is left to follow-up work.
  
  The subtype records what a body _is_; it narrows what a user is offered and
  never chooses for them.
  
  (Closes #1405.)
- 5436ed8: Compile `type: macro` content notes into a shipped **Macros** compendium (#1514).
  
  Routing for macro notes was half-wired — the type mapped to a `macros` pack,
  `macro-folders.yaml` existed, and `Automated_Attack.md` was authored — but no
  compiler produced the pack and `system.template.json` declared only `items`,
  `journals`, and `actors`. The macro that ships with the system existed only as a
  markdown file nobody compiled.
  
  **A macro note yields two documents.** Its frontmatter becomes a **Macro** in the
  new `macros` pack; its body becomes a **JournalEntry** in the journals pack,
  addressed `docmacro/<shortcode>` — the same one-note-two-documents shape an item
  and its description already use. Every page compiles into the journal, the
  script's page included: nothing is withheld from the documentation.
  
  **The command comes from the raw markdown.** It is the first _language-tagged_
  JavaScript fence on the page whose heading carries `{#script}`, taken verbatim,
  before tables are expanded and wikilinks converted. The two copies diverge on
  purpose — the journal's is prose _about_ the script, the macro's must be exactly
  what the author typed. Prose around the fence and any later fence are ignored by
  the macro and still render in the journal, so a note may document its macro with
  examples that are plainly not the macro.
  
  **Both halves of that are build errors, not warnings.** A note with no
  `{#script}` page, or a `{#script}` page whose only fence is untagged, fails the
  build: an untagged fence is a code sample whose language nobody stated, and a
  macro with no command is a macro-bar button that does nothing.
  
  **`sohl.macroType` states the Foundry macro type**, defaulting to `script` — the
  note's own `type:` stays `macro`, which is what routes it. Foundry's schema
  initialises a Macro's type to `CHAT`, so the compiler always states `script`
  explicitly. `chat` is **rejected** rather than half-implemented: a chat macro's
  command is chat text rather than source, so none of the fence rules describe it.
  `sohl.macroScope` is validated against Foundry's own scopes.
  
  **The doc-carrying type set is single-sourced.** `DOC_ENTRY_TYPES` in
  `utils/packs/item-docs.mjs` — every item type, plus `macro` — is now the one set
  read by the journals compiler, the wikilink resolver, the link manifest emitter,
  the knowledgebase build, and the content-link guard. Held apart, they drift into
  a manifest asserting documentation nothing compiled. The manifest accordingly
  gains a `docmacro` entry per macro note, with its `anchors`.
  
  **`docmacro` stays synthesized.** It is formed by prefix and is never a real
  type, so a `doc<type>` key arriving in a _foreign_ manifest is not admitted to
  the known-type set — admitting it would make the virtual reading stop firing and
  kill every `[[docmacro-…]]`. That exclusion no longer depends on manifest
  iteration order.
  
  **This does not compile data into code.** A Macro's `command` is authored source
  shipped as content and executed by Foundry's own macro runner under the existing
  permission model — the mechanism the security model already blesses. Nothing is
  evaluated, compiled, or revived.
  
  `Automated_Attack.md` migrates to the new form, and the convention is documented
  in `kb/dev-docs/reference/macro-notes.md`, including the known divergence where a
  script containing `[[…]]` misrenders in the journal while the executable copy
  stays correct (#1505).
- 26b2a12: Surface Credits & Attributions as an in-app Journal Entry, reachable from two places (#1517).
  
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
- e2ada51: Author Foundry Scenes as markdown map notes (#1525).
  
  Every other shipped document type — Item, Actor, JournalEntry — is authored as a
  markdown note in `assets/content/` and compiled to a pack. Scenes were the gap,
  and the packages that need them most (an adventure module, `thalorna`) had no way
  to ship one. Three new note types close it: `battlemap` (tactical), `localmap`
  (~1 km) and `regionalmap` (large scale), compiling through one compiler that
  differs only in derived defaults.
  
  **A map note carries an essence, not a data model.** The note states the image,
  the size, the pixels per grid square, and the features a human would point at —
  `walls.shell`, `lights.hearth`, `regions.smoke-bay`. Everything else about the
  Scene is derived: the canvas profile, the embedded `Level`, and every region
  field nobody should have to think about.
  
  **The canvas profile is emitted explicitly**, per type, because it has to be:
  `grid.type`, `grid.distance` and `grid.units` all declare
  `initial: () => game.system.grid.*`, and there is no `game` at build time. An
  unrecognised `type:` fails the build rather than quietly taking Foundry's own
  defaults.
  
  | `type:`       | grid     | distance | units | vision  | fog          | padding |
  | ------------- | -------- | -------- | ----- | ------- | ------------ | ------- |
  | `battlemap`   | square   | 5        | `ft`  | `true`  | `INDIVIDUAL` | 0.25    |
  | `localmap`    | square   | 10       | `m`   | `false` | `DISABLED`   | 0.1     |
  | `regionalmap` | gridless | 5        | `km`  | `false` | `DISABLED`   | 0       |
  
  **Two unit conventions, told apart by the key.** Geometry is **pixels** —
  Foundry's native storage, and the only thing that can express a traced map's
  walls, 97.8% of which do not sit on grid intersections. Map pins are **grid
  squares**, commonly half-integers, because that is how a human reads a position
  off a map. `position:` and every coordinate list are pixels; `at:` is grid
  squares. Both directions are linted against the note's own `dimensions` and
  `pxPerGrid`, because the mistake is invisible in Foundry: a grid-valued wall
  lands in a tiny clump at the top-left and a pixel-valued pin lands off the map.
  
  **Walls say what they stop.** `WALL_MOVEMENT_TYPES.NONE` means movement does
  _not_ collide — passable — so Foundry's own vocabulary reads backwards. A note
  writes `blocks: [movement, sight]` and `limits: [sight]` instead; anything
  unnamed is passable, and `movement` in `limits:` is an error, because movement
  has no LIMITED value.
  
  **The `Level` is synthesised and inline.** Exactly one per scene, from `image:` /
  `overlay:`, under Foundry's own `defaultLevel0000`, compiling to
  `!scenes.levels!<sceneId>.<levelId>` and surviving an `extractPack` round-trip
  intact. It cannot be left out: the client-side `_preCreate` net that would create
  one does not run for offline pack compilation.
  
  **Regions carry their behaviours, including the SoHL `trigger` bridge.** The
  curated event list is shared verbatim with the runtime, so an event this build
  accepts is exactly one the bridge forwards. `color` is hashed from the region
  key rather than left to Foundry's `Color.fromHSV([Math.random(), …])`, which
  would make every build differ from the last; `levels` is emitted only for a
  restricted region, which needs exactly one or its constraint silently never
  computes.
  
  **Cross-references are addresses, never UUIDs.** A stair says
  `to: {map: wayrestloft, region: stair-head}` and the builder resolves it —
  possible before either scene is compiled because every embedded id derives from
  the scene id and the authored key. `applyActiveEffect` addresses an effect the
  same way.
  
  **`executeScript` is not representable.** Its `source` is a `JavaScriptField`,
  so a note carrying one would compile data into code. There is no escape hatch and
  no setting that re-enables it. `executeMacro` is deferred until Adventure-bundled
  macros land.
  
  **Two packs, for two jobs.** `scenes` holds every map's Scene — what a wikilink
  addresses and what a GM browses. `adventures` holds one `Adventure` per _place_
  (the notes sharing a `place:`), bundling those scenes with the journals their
  prose compiled into. A map with `locations:` must be imported that way:
  `Adventure#importContent` creates with `keepId: true`, and a pin's `entryId` /
  `pageId`, a `teleportToken` destination and a `toggleBehavior` target are all
  id-based. Re-importing updates the documents already present rather than
  duplicating them.
  
  **The build refuses what Foundry accepts silently** — a region event outside the
  curated set (naming the excluded ones, since `tokenMoveWithin` is the plausible
  mistake), a behaviour type or field off the allow-list, a region with no shapes,
  a two-point "polygon" that passes the schema's floor of four numbers, and
  `restrict:` without a level. Each error names the authored key.
  
  **The supported Foundry floor rises to 14.359**, and compiled pack documents now
  stamp that floor instead of a literal `"14"`.
  
  This is the fix for a defect map notes merely exposed (#1533). `_stats.coreVersion`
  is what Foundry gates its migration shims on, and `"14"` sorts _below_ every v14
  build — so every document this system has ever shipped was permanently eligible
  for every v14 migration. `Scene`'s `migrateLevels` is an unconditional
  `levels = [synthesised from the pre-v14 flat fields]` that never checks whether
  the record already has a Level, so an authored map loaded out of its pack with
  the Level replaced and the map image gone. Silently: the pack on disk was
  correct, the extract round-tripped, and every build check passed. Items, actors
  and journals were equally eligible; scenes are simply where a shim destroyed
  something visible.
  
  The stamp is now derived from the manifest's own `compatibility.minimum`, in one
  place, because it is only _honest_ — and only safe — while the manifest refuses
  to load on a core old enough to need those shims. Two literals would rot apart,
  and the failure mode is invisible.
  
  **The e2e container's Foundry build is pinned by the repository too**, so a fresh
  checkout reproduces the suite without local configuration. (#1539 settles _which_
  build that is: the floor, with a periodic sweep against the newest release.)
  
  Ships with a worked fixture — two floors of one shelter, plus a regional map —
  and `kb/dev-docs/reference/map-notes.md` documenting the schema. The Cypress
  suite now drives a region by **moving a token into it**: containment is geometry,
  not rendering, so it resolves with no canvas, and `region-triggers.cy.js` no
  longer needs to call `_handleRegionEvent` by hand.
- dfb7d23: **Several compendium packs of one document type, with notes routed between them** (#1566)
  
  The pack pipeline ran one compile pass per document type and routed every note of
  that type into that pass's pack, so a repository could ship exactly one `Item`
  pack. Editorial grouping of same-type documents into separate compendiums is
  ordinary Foundry practice, and it is not cosmetic: a compendium UUID carries its
  pack name (`Compendium.<package>.<pack>.Item.<id>`), so collapsing several packs
  into one invalidates every reference an existing world holds.
  
  **Declaring them.** A consumer's `content-build.config.mjs` may now list more
  than one pack of a `type`, and mark one of them `default: true`:
  
  | Field     | Meaning                                                                                                       |
  | --------- | ------------------------------------------------------------------------------------------------------------- |
  | `type`    | Which **compiler** fills the pack.                                                                            |
  | `default` | The pack of this type that receives notes declaring none. At most one per type; not permitted on a companion. |
  
  **Routing them.** A note names its pack with an optional top-level `pack:`
  frontmatter field. Silence means the default, and a type with exactly one pack
  is its default implicitly — so every existing configuration, and every note in
  it, is unchanged. A `pack:` naming no configured pack, a pack of another
  document type, or a companion **fails the build**, naming the note and what it
  asked for; it never falls through to the default. A note's declaration addresses
  its own document, so prose that compiles into a JournalEntry of its own still
  lands in the default JournalEntry pack.
  
  Every emitted `@UUID` now carries the pack a note actually landed in, and the
  actors pass resolves each being's predefined items against **every** Item pack
  rather than the first one it finds.
- cb24099: Content authoring now has a documentation home: a **Content Creator** section
  under the developer documentation, holding everything needed to author a note
  in `assets/content/` without reading the compiler (#1570).
  
  **New pages** — _The Authoring Workflow_ (where content lives, the frontmatter
  every note carries whatever its type, and how a note becomes a compendium
  document), _Item Note Frontmatter_ (the generated per-type field reference for
  all 13 item types), _Actor Notes_ (authoring a `being`, and the
  `(type, shortcode)` address space its embedded items resolve through), and
  _Asset Conventions_ (where art lives, how `img:` resolves to a shipped path,
  image and SVG standards, and default item art).
  
  **Gathered, not duplicated** — _Map Notes_, _Authoring a Macro Content Note_,
  _Linking Between Content Notes_ and _Generated Content Tables_ move here from
  `reference/`, which is where they were filed among combat pipelines and runtime
  contracts with nothing signalling that a content author was their audience.
  _Shortcode Integrity_ deliberately stays in `reference/` — it is a runtime
  identity contract rather than an authoring guide — and is linked prominently
  instead.
  
  **The per-type reference is generated, not written.** Items are the
  overwhelming majority of what this repository compiles, so a hand-written table
  across thirteen types would be wrong within a release with nothing to catch it.
  `@heroiclands/content-build` 0.8.0 makes each item builder declare the
  frontmatter it consumes — and generates the builder _from_ that declaration, so
  the two cannot drift — and `npm run docs:item-fields` renders the page from it.
  `npm run lint:item-fields` fails the build on a stale copy, matching the
  `docs:catalog` / `lint:type-catalog` contract.
  
  **Moved pages keep their old addresses.** Dev-doc redirects had no way to
  record a page moving between sections: the generated redirect used the page's
  _current_ path, so a moved page would have claimed an address it never
  published at while both of its real ones 404'd. The move is now recorded, and
  each moved page redirects from both addresses it actually served.
  
  **Two guards got less fragile.** `check-docs-index` read its section list from
  a literal array, so a _new_ section was invisible to it rather than covered by
  it — precisely the silent orphaning that guard exists to prevent; it now reads
  the sections off disk. And a nested section landing took its title from the
  section-wide table, which would have titled every one of them "Developer
  Documentation".
- f73d5f0: **One content type for actors: `character` and `creature` are now `being`.** Both
  already compiled to a Foundry `being` actor and nothing in the toolchain branched
  on which name a note declared — but the type is also a wikilink qualifier and a
  published knowledgebase URL segment, so the split meant two addresses for one
  kind of thing and an author had to know which one a target picked.
  
  All 95 actor notes in this repository move: 91 in `Bestiary/Animal/` and 4 in
  `Characters/`. The compiled actors pack is unchanged apart from the type — same
  95 documents, same ids.
  
  **Published URLs.** The two knowledgebase sections merge into one, so 95 pages
  move from `/sohl/kb/creature/…` and `/sohl/kb/character/…` to `/sohl/kb/being/…`.
  Every one of them redirects from the address it actually had, and the new
  `/sohl/kb/being/` landing redirects from both retired section landings — nothing
  that resolved before stops resolving.
  
  Which of the two sections a page used to sit in is the one thing the retype
  erases from a note, so it is derived from `sohl.kbcat`, the field that now
  carries the distinction. The 91 bestiary notes already had one; the four under
  `Characters/` gained theirs here. A being added _after_ the merge has no old URL
  and correctly gets no redirect.
  
  **Beings still show their profile sidebar.** The shared Hugo theme chose between
  a character and a creature sidebar by branching on the retired type, so without
  a matching change the panel would have vanished from every page while the build
  stayed green. The two are now one presence-driven partial
  (HeroicLands/heroiclands-hugo-theme#17).
  
  Requires `@heroiclands/content-build` 0.4.0, which retires the two names and
  reports a note or link left on either rather than quietly routing it to the items
  pack (HeroicLands/content-build#5).
  
  (Closes #1635.)
- 44f5feb: Add siege engines and their ammunition
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  The system points at siege weapons as the answer to armour no hand weapon can
  beat — a dragon's hide turns the best poleaxe in the pack on every roll — and
  there were none. Ninety weapons across bows, crossbows, melee, shields, slings
  and thrown, and not one engine.
  
  Four engines, each a missile weapon whose projectile supplies the die, exactly
  as a crossbow and its bolt do:
  
  | Engine    | Crew | Impact  | Base Range | Max (BR×4) | Span |
  | --------- | ---: | ------- | ---------: | ---------: | ---: |
  | Springald |    2 | `+14` P |     120 ft |     480 ft |   60 |
  | Ballista  |    4 | `+22` P |     200 ft |     800 ft |   90 |
  | Onager    |    6 | `+30` B |     175 ft |     700 ft |  120 |
  | Trebuchet |   12 | `+45` B |     250 ft |    1000 ft |  240 |
  
  With two projectiles to feed them: the **Ballista Bolt** (`d6+6` piercing, AR 6,
  bleeds) for the two bolt-throwers, and the **Siege Stone** (`d6+10` blunt) for
  the two stone-throwers. Bolt-throwers are aimed and use Archery; stone-throwers
  lob and use Sling, a trebuchet being a sling in every sense that matters.
  
  **Direct or Volley falls out of the range rules rather than a per-weapon flag.**
  An attack is the shortest multiple of Base Range that reaches the target, so a
  shot inside BR flies flat and everything past it arcs: Volley 2, Volley 3 at
  −20, Volley 4 at −40, each against a fifteen-foot area rather than opposed by
  the target's Dodge. Each engine's Base Range is set at a quarter of its real
  maximum, which leaves a ballista shooting flat inside 200 feet and arcing past
  it, and a trebuchet — whose useful range begins well beyond its 250 — lobbing
  every shot it ever takes. That is what makes an engine nearly useless against a
  moving creature and merely difficult against a wall: a wall does not leave the
  area between ranging shots.
  
  Against an Old Dragon the impact ladder is the one the fiction wants — a
  poleaxe does nothing, a ballista bolt scratches, a trebuchet stone wounds
  seriously:
  
  | Shot                       | Effective impact | Wound |
  | -------------------------- | ---------------- | ----- |
  | Poleaxe (best hand weapon) | 0                | none  |
  | Springald bolt             | 0–3              | none  |
  | Ballista bolt              | 6–11             | M1    |
  | Onager stone               | 13–18            | M1    |
  | Trebuchet stone            | 28–33            | S2    |
  
  It also shows the ceiling in [#1242](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1242):
  even a trebuchet cannot do better than a serious wound to a dragon, on any roll,
  because a Grievous one needs an effective 82 and a kill 109. The engines are
  statted for what they are rather than inflated to compensate.
- e210e12: **Shortcodes are strictly alphanumeric, and a violation now fails the build** (#1397)
  
  `shortcode` is the system's identity key and half of the `type-shortcode` address that
  content wikilinks parse — a parse that needs the separating hyphen to be the only one
  in the string. Nothing enforced that shape: `slugifyShortcode` only applied it to keys
  the system _derived_ from a name, so an authored value passed through untouched, and
  three of 1599 content notes had one that did not fit.
  
  - _The three keys are renamed_ — `trauma:self-pro` → `selfpro`, `trauma:self-suf` →
    `selfsuf`, `weapongear:B&CFl` → `BCFl`. Nothing referenced them as identifiers.
  - _`npm run lint:packs` fails_ on any authored shortcode that is not `^[A-Za-z0-9]+$`,
    alongside the uniqueness check it already ran.
  - _The create/update guard refuses one too_, so the rule holds for world documents and
    not only for compiled content. The Create dialog's live check disables **Create**
    while the field is malformed, and a collision and a malformed key now give different
    messages, because they have different fixes.
  - _An existing world is repaired by a 0.9.0 migration_ that strips the offending
    characters while keeping case — the same repair that produced the three names above,
    so a world copy and its renamed compendium origin remain the same entity.
  
  Case is untouched: hundreds of authored codes are mixed-case, they collide with
  nothing, and tightening that would be a separate decision.
  
  Migration steps also **chain** now: each sees the document as the previous steps left
  it. Every migrator returns a whole `system` object built from what it was handed, so
  handing all of them the untouched source made two steps touching one document mutually
  exclusive — the later payload silently dropped the earlier one's edit.
  
  Closes #1397.
- 1b49c77: Describe attributes, birthsigns and mystical abilities well enough to read
  ([#1294](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1294)).
  
  The skill notes were rewritten separately; this finishes the other three kinds
  of content note the rules link into. A reader following a link out of the rules
  into a birthsign or a mystical ability previously arrived at two sentences of
  flavour and no mechanism at all — and the generated attribute table rendered an
  empty column for all sixteen rows.
  
  **Attributes.** All sixteen now carry a one-line `description`, so the attribute
  table in the Attributes introduction renders what each attribute measures
  instead of sixteen em dashes. The note bodies, which were already substantial,
  are untouched.
  
  **Mystical Abilities.** All nine notes now say what the ability covers, how it
  is invoked, and what bears on the test — mean 55 words to 314, with the two
  empty notes (_Fate_ and _Spirit_) written from nothing. Each names where its
  Effective Mastery Level comes from, since that is the one thing the three
  governing forms differ on: _Alchemy_ from the ability or its governing skill,
  _Talent_ from itself, and _Spirit_, _Summoning_ and _Trance_ from the Spirit
  Power they are performed through. The four divinatory notes state what a
  success level actually buys — the quality of the reading, with a Critical
  Failure delivering a false answer the diviner believes. The standing limits
  (nothing under Aural Shock, no Mystical Ability test may be fated) are stated on
  every one.
  
  **Birthsigns.** All twenty-four now state their own numbers. The modifiers a
  sign confers lived only in its Active Effects, which a reader never sees, so
  each note carries a six-row table of what the sign does to every element of the
  Astrokýklos, and a sentence naming what its natives come readiest and hardest
  to. The `description` on each — previously one of two boilerplate sentences
  repeated twelve times each — now names the sign's emblem and its extremes, which
  is what the new wheel table on the Birthsign page renders.
  
  **The Birthsign rules page** gains the element scheme the signs are built on:
  which skills each of the six elements claims, the range and step of the
  modifiers, the twelve principal signs and their emblems, how a cusp relates to
  its neighbours, and a generated table of all twenty-four.
  
  **A test keeps the tables honest.** `tests/content/birthsign-effects.test.ts`
  already held the sign matrix as an executable specification; it now also parses
  each note's authored table and fails if a stated modifier drifts from the
  Active Effect that applies it.
- 7183353: Seed body scale on a compressive curve so most creatures sit near human
  ([#1246](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1246)).
  
  `bodyScaleBase` was seeded linearly from Strength, which spread the bestiary
  from 0.18 to 5.45 and put most of that range in the tails. Capping at 3 stopped
  the top being unwoundable, but it did so by clipping: the largest dragon, the
  elephants, the stone giants and the ice bear all landed on exactly 3.0 and
  became indistinguishable, so a bull elephant was precisely as hard to wound as
  the largest dragon alive.
  
  The rule is now `((species STR) / 11) ^ 0.65`. Across the 225 creatures re-seeded
  it gives a mean of **1.31** with two standard deviations covering roughly 0.3 to
  2.3, and a scale of 3 sits at about +3 sd — reached by the largest dragon at
  3.01 and by nothing else. Strength 11 still maps to exactly 1.0, so the baseline
  is unmoved.
  
  It also un-clips the top, which is the point: where the cap flattened six
  creatures onto 3.0, the curve spreads them — 3.01, 2.88, 2.85, 2.68, 2.61 — and
  `MAX_BODY_SCALE` stops acting as a clamp at all, the dragon _landing_ on the
  ceiling rather than being cut down to it. It stays as a rail for an
  Active-Effect enlarge.
  
  The low end barely moves: a wolf goes 0.91 to 0.94, a lion 1.09 to 1.06. The
  compression is felt where it should be.
  
  `bodyScaleBase` remains authored rather than computed, so a creature can still
  be given a scale out of line with its Strength deliberately; the curve is what
  an ordinary one is seeded from. The specification checks every creature against
  it, and the Cave and Forest Goblins — previously exempt — now derive theirs like
  everything else.
- 2ba5c29: Cap `bodyScale` at 3, so the largest creatures are hard to wound rather than
  impossible to wound
  ([#1242](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1242)).
  
  Impact grows with Strength at about `STR ÷ 2`, while an unbounded body scale
  grew the injury thresholds at `20 × STR ÷ 11` — roughly `STR × 1.8`, some 3.6
  times faster. Past a scale of about 3 the thresholds outran every impact the
  system can produce, and a creature stopped being merely tough:
  
  - an Old Dragon at its raw 5.45 needed an effective **109** for a Grievous
    injury and **137** to be killed, where the largest impact in the game is its
    own 33-point bite — so two dragons could not kill each other;
  - a Lithogiant could not mark one, and neither could a trebuchet;
  - the **printed** elephant, at 5.09, was equally unwoundable.
  
  `bodyScale` is now clamped to `[MIN_BODY_SCALE, MAX_BODY_SCALE]` — 0.01 to 3 —
  including any Active-Effect delta, so an enlarge cannot lift a being past the
  ceiling. A capped body has thresholds `[3, 15, 30, 45, 60]`, which keeps the top
  of the range hard but reachable:
  
  | Shot                       | Before | After |
  | -------------------------- | ------ | ----- |
  | Poleaxe (best hand weapon) | none   | none  |
  | Ballista bolt              | M1     | M1    |
  | Onager stone               | M1     | M1–S2 |
  | Trebuchet stone            | S2     | S2–S3 |
  
  **Natural armour, not body scale, is what makes a dragon proof against swords.**
  A hand weapon maxes at 15 impact and still cannot pass a dragon's 28-point hide
  whatever the thresholds say; what changes is that a siege engine or a spell that
  does get through now wounds in proportion.
- 3256cd2: Resolve content cross-references into real Foundry links
  ([#1273](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1273)).
  
  Cross-references between compendium documents did not work. They were authored as
  relative file paths, which mean nothing to Foundry, so every link between a rules
  page, a skill, a creature and a gear item resolved to nothing once compiled. Links
  to a _section_ were broken twice over: the heading anchor was used as the journal
  page's id, and a slug like `shock-state-index` is not a legal Foundry id at all.
  
  Links are now authored by name rather than by path, and compiled into Foundry UUID
  links:
  
  | Authored                                     | Compiled to                                                |
  | -------------------------------------------- | ---------------------------------------------------------- |
  | `[[Skills/climb\|Climbing]]`                 | `@UUID[Compendium.sohl.items.Item.<id>]{Climbing}`         |
  | `[[Shock]]`                                  | `@UUID[Compendium.sohl.journals.JournalEntry.<id>]{Shock}` |
  | `[[Rules/shock#shock-state-index\|the ...]]` | a link to that **page** of the entry                       |
  
  **What this means for a reader.** Every cross-reference in the rules, the user
  guide, the bestiary and the item descriptions is now a working link, and a link to
  a named section lands on that section rather than the top of the document. A
  section is compiled as its own journal page, so it appears in the entry's page
  list and can be linked to and navigated directly.
  
  **For an author.** A link names a document by its content directory and shortcode
  (`[[TLD/shortcode|Text]]`), or by a bare alias where that is unambiguous within
  the same directory. Because no path is encoded, moving or renaming a note no
  longer breaks anything that points at it. A heading becomes linkable by ending it
  with `{#section-slug}`. Standard markdown link syntax remains correct for external
  URLs. A link with no target is reported by the build and left as visible text
  instead of being emitted silently.
  
  Every content document now carries a shortcode, so anything can be linked to;
  shortcodes are unique within their top-level directory.
- 77b896f: Add the 42 articles that the craft catalogs price but the compendium did not contain,
  so a character can actually own what a crafter is told they can make.
  
  **What is new.** Ceramics gains its own ware — amphora, jug, pot, urn, vase, lidded box
  and bottle, plus ceramic bowl, plate, beads and icon, which previously existed only in
  copper, pewter or glass. Woodworking gains barrels, a trunk, chest and box, the furniture
  of an ordinary household (bed, bench, chair, table, ladder), and the haulage pieces
  (wheel, wheelbarrow, ox yoke). Metalcraft gains the wagon axle, ploughshare, scythe and
  spade; Glassworking, lenses and an hourglass; Perfumery, three grades of perfume, three
  oils and soap; Textilecraft, a silk purse and a wool carpet; Hideworking, a leather bag;
  and Fletching, the lever and windlass crossbow spanners.
  
  **Types.** Anything that holds something is `containergear` with `maxCapacity` set in
  pounds of contents, following the existing convention of roughly two pounds per quart;
  everything else is `miscgear`.
  
  **A new Furniture folder** joins the Misc_Gear tree, since a bed or a table fits none of
  the existing categories. Its colour was chosen by the documented palette method rather
  than by eye — white-text contrast 6.33:1 against a 4.5:1 floor, and a minimum OKLab
  distance of 0.188 from its siblings against a 0.12 floor.
  
  **Where the numbers come from.** Ceramics, Glassworking, Woodworking and Perfumery
  catalogs list a sale price, which is used directly. Metalcraft, Textilecraft, Hideworking
  and Fletching list only material cost and labour, so value is derived at six times
  material cost — the one multiplier the rules state, given under Lockcraft. Weights for
  those articles are estimated from their real-world equivalents.
  
  Deliberately excluded, and left as hand-authored catalog rows: wagons and carts, which
  belong with the vehicle concept rather than gear; brick, tile and window glass, which are
  priced per unit area rather than per object; and the fletching bundles, which map onto
  the existing per-head-type projectiles.
  
  Closes #1327.
- c59c36a: Move the crafting routine out of the craft skills and into a Crafting chapter
  ([#1342](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1342)).
  
  The rules for making a thing — workshop, expense, the result ladder, masterwork
  rolls, repair — were written out in full inside **Weaponcraft** and
  **Fletching**, sketched in **Lockcraft**, and delegated to in a sentence by the
  other twelve. A reader of Ceramics had no way to reach them.
  
  **A new Crafting chapter** states the routine once, in seven pages: the
  _Workshop_ and its star rating, _Expense_, the _Test_, the _Result_ ladder,
  _Masterwork_ rolls, _Fast Crafting_, and _Repair_. It sits in the rules between
  _Gear_ — the catalogue of what gets made — and _Combat_.
  
  **Fast crafting is now discoverable from any craft.** Trading a Value Diamond
  for a 10% cut in crafting time, to a maximum of 30%, is stated in the source as
  applying to every craft whether or not a trade mentions it. It appeared in two
  entries. It is now its own page, and the chapter says plainly that it applies
  whether or not a trade repeats it.
  
  **Weaponcraft no longer states its result ladder twice.** It carried one ladder
  for weapons and a second for armour, differing only in whether a flaw costs
  Weapon Quality and impact or Armour Quality and Armour Value. The ladder is
  stated once in the chapter; Weaponcraft keeps only the two flaw readings.
  
  **Twelve craft skills gain a `Crafting` page.** Each craft note now opens with
  what the trade _is_ and puts its making rules under a `# Crafting` heading —
  which compiles to a second page on that item's item doc, so an item's
  description stays the flavour and the rules sit beside it. Each links to the
  shared chapter and keeps only its own deltas: its test, how its expense is
  reckoned, what a flaw costs in its units, its masterwork cap, and its
  catalogue.
  
  Ceramics, Drawing, Glassworking, Hideworking, Jewelcraft, Lockcraft, Masonry,
  Metalcraft, Textilecraft, Weaponcraft, Woodworking and Fletching are affected.
  Milling, Musician, Singing and Timbercraft are not — they measure output,
  performance and felling rather than making an article, and follow no crafting
  routine.
  
  No rule changed and nothing was dropped; every line removed from a skill is
  either stated in the chapter or kept on the skill as its own particular.
- 44f5feb: Give every animal its six creature skills, and the Grukar an anatomy and a
  natural weapon
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  **Animals.** The 114 animals outside the printed Abilities tables now carry
  Awareness, Stealth, Spirit (a Mystical Ability), Initiative, Dodge and Shock
  alongside their natural weapons — the same six the printed animals take from
  the AWARE / STEALTH / SPIRIT / INITIATIVE / DODGE / SHOCK columns. An animal
  has no Skill Base, so each is a flat `masteryLevelBase`.
  
  Values are extrapolated from the 31 printed animals, on the same attribute
  pair the system's own skill uses — Awareness `5 × (PER+WIL)/2`, Spirit
  `3 × (AUR+WIL)/2`, Dodge `4 × (AGL+PER)/2`, Initiative `4 × (WIL+REA)/2`,
  Stealth `5 × (AGL+WIL)/2`, Shock `2.5 × (STR+END)/2`. Mean error against those
  31 rows is under one point for Awareness and Spirit and under five for Dodge
  and Initiative; Shock is the loosest, being visibly hand-tuned in the printed
  rows. Where a file already carried one of the six, its authored value is kept.
  
  **Grukar.** All four shipped a human anatomy with no natural armour and no
  attack at all. Grukar-Uk and Grukar-Sha now take a compact six-zone anatomy —
  head and arms sharing zone numbers 1–2, torso 3–4, legs 5–6 — with
  per-location natural armour; Grukar-Hai and Grukar-Ahk keep the human plan
  they are built on. All four keep their own authored ability scores
  and gain a Punch combat technique, which unlike a beast's natural weapon can
  be used to block, and the same six creature skills.
- 6f3e68d: An item description that is only a link now points at what it links to.
  
  Write a description consisting of nothing but a `@UUID` link and the item is saying
  "my description lives there". **Display Description** follows the pointer and shows the
  target — a journal page, or another item's description — instead of showing the reader a
  link they would have to click.
  
  **Markup does not count.** A link wrapped in a paragraph, a heading, bold text, or trailed
  by empty paragraphs and line breaks is still just a link. What matters is whether anything
  a reader would actually see remains once the markup is stripped.
  
  **Anything else is ordinary prose.** A description that opens with a link and continues
  with a sentence is left exactly as written, because a GM's own words are never discarded
  in favour of a target's. Someone who wants the target's text inline embeds it deliberately.
  
  Nothing is taken away: the description remains a free HTML field, the Description tab
  works as it always has, and the convention applies only when an author chooses to write a
  link and nothing else. A pointer whose target will not resolve falls back to the link,
  which renders as a broken content link — visibly wrong rather than silently blank.
  
  This is what lets an item stop carrying its own copy of prose that belongs to the
  compendium. See #1348 for the scale of that: 7.59 MB of description across the actors
  pack, containing 74 distinct texts.
  
  Part of #1348.
- d1aaf14: Let armour record which side of a covered location it actually protects.
  
  **The gap.** Coverage was directionless, so a cloak — which hangs down the back and
  protects the torso and legs from behind only — read as full torso and leg protection,
  identical to a garment that wraps all the way round. A breastplate is the mirror case.
  
  **The model.** `system.locations.facing` lists the covered locations an article protects
  from one side alone, as `{ location, side }` with side `front` or `back`. An absent entry
  means "protected from any direction", so every all-round article ships an empty list and
  nothing needs migrating.
  
  Directional coverage is genuinely the exception, so it is modelled as an exception list
  rather than a qualifier on all 309 armour articles. The thirteen cloaks now cover the
  shoulders all round, and the thorax, abdomen, pelvis, thighs, knees and calves to the
  rear — locations most of them were not recording at all, which is why a cloak read as
  barely more than a mantle. The two breastplates mark their torso as front-facing;
  cuirasses are all-round rigid and are left alone.
  
  **One-sided articles cost half.** A breastplate is literally the front half of a cuirass,
  and the table prices it that way — 60d / 4.6 lb against the cuirass's 120d / 9.1. Cloaks
  were priced as though their rear coverage were full, so all thirteen are rescaled by the
  same factor, which keeps every material's relative pricing intact: the base cloth cloak
  moves from 66d / 3.3 lb to 34.5d / 1.7, matching coverage of 0.345 against the cloth base
  price of 100.
  
  **Data now; resolution when outnumbering lands.** The rules never ask which way a
  combatant is pointing. They settle one-sided armour by circumstance, and the two cases
  are not mirrors: rear-facing armour is ignored against one aware foe who can keep to your
  front, and applies 50% of the time against several (d10 versus TN 5), while front-facing
  armour is ignored when you are caught unaware from behind, and applies 70% of the time
  against several (d10 versus TN 7). Both need the opponent count, awareness and a die
  rather than an angle — so the clause becomes mechanizable as soon as the outnumbered rule
  supplies the first, and this field is its input, marking which Armour Value is subject to
  it at all. A hauberk wraps and is never ignored; a cloak's rear protection is exactly what
  an aware opponent steps around.
  
  What stays out of scope is deriving the angle itself from token rotation. The rules
  deliberately abstract that away, and computing it would have the system make a ruling
  they left open.
  
  `armorFacingFor()` answers which side a layer protects, and a content spec fixes which
  articles are one-sided so that adding another — a backplate, say — is a deliberate act.
  
  Closes #1331.
- 44f5feb: Give the remaining 114 animals a body structure and natural weapons, so every
  creature in the animals pack can now be hit and can now attack
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  Before this, all but a handful shipped with an **empty** `system.body.structure`
  — which reads as _incorporeal_ — so `getRandomLocation` could not resolve a hit
  on a wolverine, a giant spider or an elephant bird, and none of them had an
  attack to make.
  
  **Fifteen body plans.** Each mirrors the shape of a printed hit-location table
  where one exists and extrapolates the same construction where none does:
  `ungulate`, `carnivore`, `smallQuadruped`, `anthropoid`, `smallAvian`,
  `largeAvian`, `biped`, `drake`, `serpentine`, `proboscidean`, `arachnid`,
  `insect`, `aquatic`, `chelonian`, `cephalopod`. Zone weights scale with the
  creature's size band; part and location weights are the plan's own. Apes and
  monkeys use the **human** plan unchanged — the same six parts and thirty-two
  hit locations a Being carries — over a zone run scaled to their size, so a
  monkey's zone numbers run 1–6 where a person's run 1–15.
  
  **Natural weapons.** One Combat Technique per attack the creature's own Dossier
  describes — a wolverine's raking claws and bone-crushing bite, a scorpion's
  pincer and sting, an octopus's tentacle grapple.
  
  **Derived numbers.** Reach, zone die, attack value, impact and natural armour
  are extrapolated from the printed animals rather than invented freely: impact
  tracks Strength (`d6` bite = `STR ÷ 2 − 5`, fitted to the printed bites; a claw
  is one lower on a `d8`; a constrictor's grab equals its Strength), attack tracks
  Agility off a `40 + 2 × AGL` baseline shifted per body plan, the zone die scales
  with how many zone numbers the body spans, and natural armour follows the same
  Strength ladder the printed rows sit on, shifted by a per-creature hide value.
  Each creature's `bodyScaleBase` is seeded from its own Strength.
  
  The specification in `tests/content/animal-abilities.test.ts` now also asserts
  the invariants that hold for **every** animal, printed or derived: contiguous
  gap-free zone numbers, no orphaned parts or locations, no part without a hit
  location, uniform natural armour, a Strength-derived body scale, and at least
  one usable combat technique whose impairing role the body actually has.
- a3d921d: Fill the twelve rules documents that were one-word stubs
  ([#1293](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1293)).
  
  Nine Divination pages, _Coma_, _Physical Condition_ and _Aural Shock_ each held
  the single word "TBD" — every one of them linked from a parent introduction, so a
  reader following the corpus landed on nothing. An empty page reads as a defect.
  
  **Divination is now a chapter rather than a list of titles.** Its introduction
  carries what all the arts share: a divination is invoked as a Success Test, and
  the success level buys the _quality of the reading_ — a Critical Failure being a
  false reading the diviner has no inkling is false, a Marginal Failure silence, a
  Marginal Success a true but partial answer, a Critical Success a clear one. The
  answer itself is always the gamemaster's; the roll settles only that the
  character learned something, and how well. Asking the same question of the same
  art again returns the first answer, so a false reading is corrected by events
  rather than by rolling again.
  
  The seven arts are then written to be told apart in play — each with its medium,
  what it requires, how long it takes, and what it can actually answer:
  
  | Art          | Reads                                                   |
  | ------------ | ------------------------------------------------------- |
  | Astrology    | Influences over months and years; the shape of a life   |
  | Augury       | Whether an imminent undertaking is favoured             |
  | Cartomancy   | The human situation around a person                     |
  | Haruspicy    | Conditions — sickness, poisoning, blight, corruption    |
  | Rune Casting | One narrow question, tersely                            |
  | Scrying      | What a distant place, person, or thing is actually like |
  | Tasseomancy  | The drinker's own near future, health, and concerns     |
  
  **Fate** keeps its page in the chapter, explaining why it is counted a divination
  at all — the only one performed on oneself, and the only one that changes what it
  reads — and hands the mechanics to _Fate Points_ rather than restating them. The
  _Fate Test_ stub is removed: the Resolution chapter owns that term, and a second
  account of the same roll is what this work exists to avoid.
  
  **Coma and Aural Shock get the accounts that were filed elsewhere.** Both already
  had substantive text under an anchor on another page, which meant each rendered
  twice — once as a real page under its owner and once as a stub bearing its name.
  _Coma_ moves out of _Shock_ and _Aural Shock_ out of _Psychological Condition_,
  each to the page a reader looks for it on, with the former hosts linking across.
  Neither text is duplicated.
  
  **Aural Shock is also stated in full for the first time.** Its effect is total,
  not a penalty: every Mystical Ability is unusable, every Mystery is unavailable —
  Boons and Boosts stop granting what they grant, and the rest keep their values
  but cannot be reached — the Aura attribute cannot be rolled, and every
  Aura-based skill is unusable with it. The Mysteries and Mystical Abilities
  introductions now say so too.
  
  **Physical Condition** is written from scratch as the bodily counterpart of a
  psychological condition: a lasting state of the body that is not a wound, graded
  _trait_ → _impediment_ → _debility_, arriving by birth, by permanent impairment
  left behind by a healed wound, by privation, or by restraint. It runs no course
  test and no recovery test — it ends when its cause does, or not at all — and
  _Immobilized_ is stated on its own, since a pinned limb keeps its grip where an
  unusable one does not.
- a55766b: _Item descriptions now live in the journals compendium, once._
  
  An item note's prose compiles into that item's **item doc** — a JournalEntry in
  the journals pack, in the same folder and under the same name as the item — and
  the item's description becomes nothing but a link to it. The runtime already
  treats a description that is only a link as a pointer and shows what it points
  at, so **Display Description** posts the prose exactly as before.
  
  **What this fixes.** Every actor carrying an item carried its own copy of that
  item's description: 7.59 MB across the actors pack, of which only 133 KB was
  distinct text — a duplication factor of 58. Fixing a typo in one item
  description left 57 stale copies on a single character. The prose now exists in
  one place, and every copy of it is a link to that place.
  
  |                                             | Before  | After  |
  | ------------------------------------------- | ------- | ------ |
  | Embedded description across the actors pack | 7.59 MB | 391 KB |
  | Actors pack                                 | 8.3 MB  | 2.8 MB |
  | Items pack                                  | 1.4 MB  | 520 KB |
  | Journals pack                               | 688 KB  | 1.7 MB |
  
  **Nothing about actors changed.** The actors pass still embeds each item
  wholesale; what it embeds is now a link. Nor did the authoring change: content is
  still one Markdown file per item, and its body is still the description — only
  where the build puts it has changed.
  
  An item note's body splits into pages on its H1 headings, as a journal note's
  does, and the description points at the first. A note with no headings — which is
  every shipped item today — is a single page named after the item. An item with no
  prose gets no entry and an empty description rather than a pointer to nothing.
  
  Closes #1348.
- ac50965: Model limb immobilization separately from the ability to hold items
  ([#1269](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1269)).
  
  A body part had one notion of being out of action, so anything that pinned a limb
  would also have disarmed it. That would make a constricting hold a disarm, and
  leave a Grab that takes what the hand is holding with nothing to take.
  
  Being **immobilized** and being able to **hold** are now separate. `BodyPart`
  carries one settable switch and two derivations, all Logic-only and rebuilt each
  preparation cycle:
  
  | Source                            | Sets          | Follows                                      |
  | --------------------------------- | ------------- | -------------------------------------------- |
  | **Immobilized** trauma            | `immobilized` | nothing — **the grip is retained**           |
  | Grievous injury                   | `isUnusable`  | `immobilized`, and the loss of `canHoldItem` |
  | `permanentlyUnusable` (persisted) | `isUnusable`  | the same, permanently                        |
  
  ```
  isUnusable  = permanentlyUnusable || <set during the lifecycle>
  immobilized = isUnusable || <set during the lifecycle>
  canHoldItem = canHoldItemBase && !isUnusable
  ```
  
  So `isUnusable` is the single switch for "this limb is out of action", and
  `immobilized` is the weaker state a hold produces on its own. A grievous injury
  sets one property and the rest follows; `BeingLogic.finalize` does that once the
  traumas have settled their levels.
  
  **A new Immobilized condition** — a `physcond` / `impediment` Trauma (shortcode
  `immob`) — pins the limb owning the location it names, for as long as it exists.
  It is an inspectable document on the character sheet, and deleting it frees the
  limb on the next preparation cycle with nothing to unwind. A wrestler's grip and a
  binding spell impart the identical condition, so a per-limb magical effect needs no
  part-addressable Active Effect (which Foundry could not give it — body parts are
  entities inside the Being, not documents).
  
  **A grievous wound now drops what the limb was holding.** The rules promised it
  and no code did it. The write happens once, at the injury event, rather than as a
  lifecycle side effect — so re-preparation never re-drops, and an item the player
  picks back up stays put.
  
  **`BodyPart.canHoldItem` is now derived**, and every existing reader (the held-item
  dropdowns, `limbsHolding` behind strike-mode gating) sees the effective answer. The
  persisted capability is unchanged and still readable as `canHoldItemBase`.
  
  Restricting which defences a Grab may be met with — a pinned limb answerable only
  by Ignore — needs an `allowedDefenses` capability that does not exist yet, and a
  Grab to use it; it lands with
  [#1266](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1266).
- 44f5feb: Build the twelve Mythic creatures from their bestiary entries
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  All twelve shipped with an **empty** `system.body.structure` — which reads as
  incorporeal, so no blow could resolve a hit location on them — no natural
  weapons, and no skills.
  
  **The six dragons** take the Young, Mature and Old Dragon tables; fire and ice
  share a stat block at each age. Each gains the printed attributes, weight,
  ground and flying Move, the AWARE / INITIATIVE / SHOCK / SPIRIT / DODGE values,
  and a seven-zone anatomy in the order the table prints it — head, forelegs, one
  wing, torso, the other wing, hind legs, tail — with per-location natural
  armour that runs from 10 on a young dragon's wing to 30 on an old one's flank.
  Zone runs reach 25, 50 and 100 by age. Bite, Claw and Tail are melee combat
  techniques; the Breath is a **missile** strike mode carrying the printed cone
  range (40, 60 and 80 feet), with its declining impact bands recorded on the
  strike mode.
  
  **Six more Mythic creatures** take their own entries: the Wýrè (Wyvern), Yélgri
  (Harpy), Unicorn, Warg, Gryphon and Hirénu (Hippogriff). Each gets the body
  plan its table prints — the wyvern's two-legged winged frame, the harpy's
  winged biped with arms, the unicorn's ungulate anatomy with its horn as a hit
  location, the warg's quadruped, and the two chimaeras' eagle forequarters over
  equine or leonine hindquarters — plus per-location armour and one combat
  technique per natural weapon.
  
  Press is a maneuver rather than a natural weapon and is not modelled, and the
  harpy's javelin and stick are ordinary gear rather than techniques. Talents
  with no corresponding skill (Immersion, Sensing, Telepathy) are left out.
  
  Ice dragons use the `fire` impact aspect for their breath, that being the only
  elemental aspect the impact model defines.
- 28c06cb: Record which skill produces every item, and make every craft catalog row name a real
  one.
  
  **The problem.** Nothing in the data said what makes an item — that lived only in which
  catalog table a row happened to sit in. A generated table selects on frontmatter, so
  "everything Weaponcraft makes" was inexpressible: a broadsword, a wood axe and a
  quarterstaff are all weapon gear with nothing to tell them apart.
  
  **Every gear item now declares its producer** and the Secondary Modifier skills that go
  with the test. Coverage is total across all 847, because everything is produced by
  someone — crafted, grown, brewed, milled, mined, hunted, or simply gathered, with
  Survival as the floor. Armour is assigned by material and weapons by the Weaponcraft
  marks; bows and crossbows go to Fletching rather than Weaponcraft, and slings to
  Hideworking. Crops go to Agriculture, herds to Animalcraft, catch to Fishing, flour and
  bread to Milling, drink to Brewing, ores and gems to Mineralogy, cut stones to
  Jewelcraft, inks and dyes to Herblore.
  
  **Thirteen more articles** join the compendium — the ones an earlier pass counted as
  present because the only item of that name was the wrong material. A woodworker's
  catalog was resolving to a copper cup, a canvas sack to a bag of salt, a tool hammer to
  a war hammer. Adds the wooden cup, bucket and cages, the cabinet, canvas sacks, arrow
  bag, buckram pouch, tarpaulin, horse blanket, plain hammer, and the padded cloak.
  
  **All 160 catalog rows now resolve** to exactly one item. Three tables are split out
  instead, because their rows are not possessions: a Vehicles table in Woodworking for the
  wagon and cart, a building-materials table in Ceramics for brick and tile, and a glazing
  table in Glassworking for window glass — the last two priced by the piece or the square
  foot, where the quantity is a unit of measure. Fletching's projectile bundles expand onto
  the real projectile items, noting that cost and time are per dozen.
  
  Closes #1329.
- 3721709: **The rules open with a reading order, and close with a glossary** (#1295)
  
  The rules root note was an index of ten sections in no particular order: it said what
  existed, not what to read first, and nothing stated the scope of the rules or the
  boundary between them and the tabletop that runs them. It is now the front matter of a
  book.
  
  - _A reading path._ The ten chapters are presented in the order they should be read,
    each with a sentence on what it covers and why it sits where it does — Resolution
    first, because every later chapter is written on the terms it defines, then
    Attributes, Skills, Affiliations, Characters, Gear, Combat, Trauma, Esoterica and the
    Bestiary.
  - _Scope, stated._ What the rules cover, and the two things deliberately absent: setting
    material, which belongs to a world and none is assumed, and the finer procedures of a
    long campaign.
  - _The rules/VTT boundary, stated._ These pages describe the game as it happens at a
    table. How the Foundry implementation is operated belongs to the User Guide, and
    where the two ever differ, **the rules are what the game is** and the implementation
    is what needs fixing.
  
  **A Glossary** (`Rules/Glossary.md`) indexes every term the rules define — 120 entries,
  alphabetical — each pointing at the single passage that settles it. It is an index of
  links, not a second set of definitions, so a term can never drift from its definition:
  a reader who meets _Index_, _Value Diamonds_ or _Tactical Advantage_ mid-chapter now has
  somewhere to look it up.
  
  **Every rules document is reachable from the root.** `Bestiary/Helspawn.md` had no
  inbound link — it compiled and published, but could not be arrived at by reading — and
  the Bestiary introduction now links it the way it already links Grukar.
  
  **The walk is committed as a lint.** `npm run lint:content-links` (part of
  `npm run lint`) resolves links exactly as the two content builds do — `type/shortcode`,
  then a type-scoped alias, with `(@Table …)` directives expanded first — and fails on
  either of two defects that both builds pass silently:
  
  | Defect                                        | Why it survives the build                                                                                                       |
  | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
  | A `#anchor` link that no heading declares     | The journal compiler derives a page id by hashing `"<noteId>-<anchorSlug>"`; it never checks that a heading declaring it exists |
  | A `Rules/` document unreachable from the root | An unlinked note still compiles and still publishes; it is simply unreachable by reading                                        |
  
  The walk stops **at** the glossary rather than through it: an index links to nearly
  every page, so following it would make the reachability check vacuous.
  
  The anchor check found exactly the pair already reported — two links in _Item:
  Weapongear_ pointing at `doc/skldesc#combat-techniques`, an anchor _Skill Descriptions_
  never declared. Both now point at `doc/unrmdcmb#combat-techniques`, where Combat
  Techniques are in fact defined.
  
  Closes #1295.
  Closes #1297.
- a769c69: Give the rules a Resolution chapter that defines the terms the rest of them use
  ([#1290](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1290)).
  
  The mechanics that resolve every uncertain action — the d100 test, success
  levels, opposed tests, Success Value, Secondary Mastery, Fate — were filed under
  **Skills**, though attributes, mystical abilities, combat and trauma all test the
  same way. A reader wanting to know how a test works had to know to look inside
  the Skills chapter first, and once there found the terms used but not defined:
  "Mastery Level" appeared in eleven documents and was formally defined in none of
  them.
  
  **A new Resolution chapter**, read before Characters, now owns them. The five
  existing documents move into it unchanged in shortcode — so every inbound link
  keeps working — and are joined by a chapter introduction and a new **Mastery
  Level** page:
  
  | Page                | Defines                                                                                                                  |
  | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
  | Mastery Level       | `mastery-level`, `skill-base`, `attribute-mastery-level`, `index`, `effective-mastery-level`, `assistance`, `competence` |
  | Success Tests       | `success-test`, `success-level`, `extended-levels`, `basic-test`                                                         |
  | Opposed Tests       | `opposed-test`, `victory-stars`, `ties`, `tiebreaks`                                                                     |
  | Success Value Tests | `success-value-test`, `success-value`, `value-diamonds`                                                                  |
  | Secondary Mastery   | `secondary-mastery`, `secondary-modifier`, `secondary-roll`                                                              |
  | Fate                | `fate`, `fate-exclusions`, `fate-test`, `fate-mastery-level`                                                             |
  
  Each definition sits on a heading carrying an explicit `{#anchor}`, which the
  page model turns into its own addressable journal page, and documents across the
  corpus now link their first use of a term to it.
  
  **Skill Base is written down for the first time.** It was named in three
  documents and defined in none. One attribute gives its own value; two give their
  average, rounded up when the first is the greater and down otherwise; three or
  more round to nearest. The first attribute a skill names is the primary one, so
  the order matters. A Skill Base sets where a skill opens and caps it at SB × 7
  thereafter.
  
  **Fate leaves Mysteries for Resolution.** It acts on any test at all, so it
  belongs with the rules for testing rather than with the Mystery that holds the
  points; the Mysteries introduction points across to it. Its duplicated opening
  paragraph and its self-referential `[[Fate]]` link — which resolved to the
  Divination stub — are gone.
  
  The Skills chapter keeps what is peculiar to skills and hands testing to
  Resolution; the rules root lists Resolution first.
- 374f640: Give every rules section an introduction, and reorganize the rules documents
  ([#1286](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1286)).
  
  Each rules section now opens with an `_Introduction`, replacing the hub documents
  named after their own section (`README`, `Esoterica`, `Skills`, `Trauma`,
  `Arcane`, `Divine`, `Spirit`). Those hubs competed with their section's real
  content for both the reader's attention and for wikilink targets — `[[Skills]]`
  could reasonably have meant either the overview or the skills rules themselves.
  
  **New sections**
  
  Gear (weapons, armour and clothing, containers, miscellaneous equipment),
  Characters, Combat, Attributes and Affiliations, each with a journal folder where
  it needed one. The Bestiary becomes a section of its own, holding the descriptive
  creature notes; `Creatures/` is left to the statted creature notes alone.
  
  **Affiliations**
  
  Described rather than tabulated, since SoHL ships no affiliations of its own —
  religions, schools, convocations, guilds and syndicates are setting material. The
  introduction covers what an affiliation records, how it differs from a skill, and
  what standing means for guilds, religions, arcane convocations, criminal
  syndicates and orders. It also states what the level does mechanically: it is the
  system's capability credential, holding religious rank and arcane grade rather
  than a skill doing so.
  
  **Divine Intervention**
  
  Documented as the one occasion a deity acts directly rather than through an
  agent. Deliberately not a Mystical Ability: nothing is performed and nothing
  rolled. Grace is the prerequisite, and the gamemaster decides both whether an
  intervention occurs and what it costs in Grace. Its deniability is a requirement
  rather than a matter of taste — the event must read as certain proof to the
  faithful and as coincidence to everyone else.
  
  **Content categories**
  
  Creature notes carry a `sohl.kbcat` naming their group, so the Bestiary tables
  build themselves from frontmatter. Folk is split into `grukar` and `goblin`,
  which were being listed together under a heading that described neither.
  
  **Fixes**
  
  Nineteen wikilinks that addressed removed documents, or addressed surviving ones
  by the wrong shortcode, now resolve. The gear tables addressed `name` — a mapping
  of `full` and `aliases` — where they meant `name.full`, so every table in the four
  gear documents failed to build; four weapon tables also searched `miscgear` for
  categories that live on `weapongear`.
- 5e5b572: **Content URLs are derived, not authored** (#1278)
  
  The hand-maintained `slug` property is gone from all 1546 content notes; a page's URL
  segment is derived from its name instead. A knowledgebase page is
  `/<section>/<name-slug>/`.
  
  - _Old URLs keep working._ `kb/data/legacy-slugs.json` records the previous URL of every
    page whose derivation differs from what was authored (120 of 1546), and the
    knowledgebase build emits a Hugo `aliases` redirect from each.
  - _Accented names are addressable again._ The name is transliterated instead of having
    its non-ASCII characters dropped — `Nüsvōrroth` yields `nusvorroth` where the old
    slugifier produced `n-sv-rroth`, which is why such pages needed a hand-written slug.
    Ligatures expand as a reader would spell them (`þ`→`th`, `æ`→`ae`, `œ`→`oe`, `ß`→`ss`),
    apostrophes are removed rather than made separators, and a fraction keeps its digits
    together (`Kûrbúl ¾-Helm` → `kurbul-34-helm`).
  - _Collisions fail the build._ Two notes in one section deriving the same URL are
    reported by file, rather than one silently overwriting the other.
  
  Shortcodes remain identity — referenced from saved world data — and are deliberately not
  the URL. Heading anchors, developer-doc URLs, pack filenames, and `slugifyShortcode` are
  unchanged.
- 433143a: Give every skill a description that states how the skill actually works
  ([#1294](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1294)).
  
  Each skill note carried one paragraph of flavor prose and nothing else. A reader
  could learn that Climbing exists and that cliffs are dangerous, but not what
  Success Value a sheer face demands, how far a minute of climbing carries them,
  or what a Critical Failure costs. Sixty-five skills across nine groups are now
  described in terms of what they do.
  
  **Success Value tables.** Every skill whose result is read as a Success Value
  now carries its table, with the grade attached to each value:
  
  | Skill       | What the Success Value grades                                       |
  | ----------- | ------------------------------------------------------------------- |
  | Climbing    | The face the climber can hold, from a 20° slope to a holdless sheer |
  | Swimming    | Feet covered per minute, after wind force and distance from shore   |
  | Fishing     | Food-days taken per four hours, against a conditions Target Number  |
  | Cookery     | The meal, from inedible to pleasing — and its effect on persuasion  |
  | Weaponcraft | Flawed, base, or masterwork arms and armour                         |
  | Fletching   | The same, for bows, crossbows and projectiles                       |
  | Engineering | A design that helps, hinders, or does neither, for the builder      |
  | Animalcraft | What six months of training is worth to the animal                  |
  | Script      | Legibility written, and comprehension read                          |
  | Masonry     | The multipliers a Construction Roll applies to time and cost        |
  | Acrobatics  | Distance moved along a beam, and the audience's opinion             |
  | Mathematics | The most complex problem the character can actually solve           |
  
  **Terminology follows the rules as they now stand.** The source material grades
  a superior result in "stars"; these read as **Value Diamonds** throughout,
  matching the Success Value Tests rules page, and success levels are written
  CF / MF / MS / CS. Mishaps are Stumble and Fumble **Tests**, fatigue is
  named by kind, and money is pence.
  
  **Behavior that was previously undocumented anywhere.** A crossbow may be shot
  at three times Archery Skill Base by someone with no Archery at all; Acrobatics
  Index doubled bonuses Block and Dodge; Legerdemain Index doubled bonuses
  Throwing; evading missiles costs the attacker five times the evader's Effective
  Dodge Index; treating an animal is Physician at −10, offset by Animalcraft;
  foreign knowledge costs −10 to −60 by distance, for Folklore, Heraldry, Law and
  Mercantilism alike.
  
  **Craft economics.** Ceramics, Glassworking, Woodworking, Metalcraft,
  Textilecraft, Hideworking, Jewelcraft, Lockcraft, Weaponcraft, Fletching,
  Timbercraft, Brewing, Perfumery, Masonry and Shipwright carry their cost, time
  and price tables, together with the workshop-quality and Masterwork Success
  ladders the two crafting routines share.
  
  **The opposed `d6 + STR` roll is now named a Strength Trial**, in the three
  Combat Techniques that call for one — Grab, Press and Trip. Those three
  otherwise keep their existing text, as do the other five techniques: they
  already describe their own mechanics and have no counterpart in the source
  material.
- 44f5feb: Give the Spirit, Elemental and Dreadspawn creatures a body, natural weapons and
  creature skills
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  All sixty-eight shipped with an **empty** `system.body.structure` — read as
  incorporeal, so no blow could resolve a hit location — no attacks, and no
  skills. There is no printed table for any of them, so each is built from its
  own Presentation and Attack Methods, on the rules fitted to the printed
  animals.
  
  **Three new body plans** join the fifteen already shipped, for creatures no
  animal anatomy fits: `amorphous` (Core · Mass · Tendrils) for oozes, mires and
  mud golems; `wraith` (Core · Shroud) for a spirit with a shape but barely a
  body, following the Umbáth precedent of a short zone run; and `plant`
  (Crown · Stem · Tendrils) for the ambulant growths. The `anthropoid`,
  `arachnid`, `insect` and `smallQuadruped` plans gain larger size bands so a
  stone giant, a scorpion the size of a wagon and a ten-foot beetle can use them.
  
  **Ranged natural weapons.** Four new weapon kinds emit a **missile** strike
  mode with a range rather than a zone die: `breath` (a cone, impact
  `STR ÷ 3 − 1`, which reproduces the printed Young Dragon's `d4+11` exactly),
  `spray` (acid, venom, shards), `hurl` (a thrown rock) and `bolt` (lightning and
  light). Range scales with size, fitted to the dragons' 40 / 60 / 80 feet.
  
  **Spirits carry no natural armour.** A shade has no hide; what protects it is
  being hard to see and hard to hit, which lives in its Stealth and Dodge. Their
  incorporeality — that only enchanted weapons touch them — is prose, not armour.
  
  Eighteen missing attribute scores were supplied across ten creatures that
  shipped without a Strength or an Agility, which nothing downstream can derive
  around.
  
  The content specification now covers **every** creature, not just the animals:
  contiguous gap-free zone numbers, no orphaned parts or locations, no part
  without a hit location, unique location shortcodes, a Strength-derived body
  scale, and at least one usable technique whose impairing role its body has.
  Creature files that still have no anatomy — three Constructs, two Helspawn, and
  four family-overview entries carrying no `sohl` block at all — are named in an
  explicit allowlist so the remaining gap stays visible and cannot grow.
- 44f5feb: Re-rate the Strength of the mineral and giant creatures
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  Each was priced for a body of the wrong size. A Lithogiant, twenty-five to
  thirty feet of stone, carried Strength 19 — weaker than a donkey. A Swampgolem
  of fourteen feet had 16, an Embermaw 13. A Mirrorling of solid metal had 11.
  
  Scores are placed by comparison against the printed animals — cat 3, wolf 10,
  lion 12, boar 14, stag 18, donkey 24, cave bear 28, destrier 30, bovine 32,
  elephant 56 — with the Old Dragon's 60 left as a ceiling nothing reaches. The
  Lithogiant tops the set at 55, below both the elephant and the dragon; the
  Stonebeast takes 50, the Frostmaw 48, the two eighteen-and-fifteen-foot giants 42. The Cave Troll comes **down** from 33 to 28, having out-ranked the larger
  Forest Troll.
  
  Strength is not just a number: it seeds body scale, every natural weapon's
  impact modifier and the Shock skill, and all three are recomputed with it —
  a Lithogiant's crushing blow goes from `d6+4` to `d6+22`, its body scale from
  1.73 to 5.0.
  
  **Natural armour deliberately does not move.** It describes what the creature
  is made of, and re-rating its strength does not thicken its hide; letting the
  armour ladder follow would have given a flesh troll better protection than a
  rhinoceros.
  
  The Old Dragon remains the apex on every axis: Strength 60 against 55, body
  scale 5.45 against 5.0, natural armour 28 against 11, a `d8+25` bite against a
  `d6+24` thrown rock, and a hundred zone numbers against forty-five.
- 396e6fd: _Strength now affects how hard you hit_ (#1253).
  
  A combatant's Strength had no bearing on damage anywhere in the system: two
  wielders differing only in Strength dealt identical impact with the same weapon,
  and the `noStrMod` trait that exists to suppress the modifier was read nowhere.
  
  **The Strength Impact Modifier** is now folded into every melee blow and every
  thrown weapon. It is **computed rather than looked up**, so it extends without
  bound in both directions — the printed table stops at Strength 25, while the
  system carries creatures from insects to colossi:
  
  | Strength | Modifier                                          |
  | -------- | ------------------------------------------------- |
  | ≥ 5      | `⌊(STR − 10) / 2⌋` — +1 per two points, unbounded |
  | ≤ 4      | `2 × STR − 12` — the steeper low tail             |
  
  Both segments reproduce every printed row exactly and meet cleanly at the seam.
  
  **Bows, crossbows and slings get no benefit** — the force is in the launcher,
  not the arm. A thrown weapon does, reduced by 1, and anything flagged
  `noStrMod` is excluded outright.
  
  **Off-hand** use reduces the modifier by a further 1, and stacks with thrown. A
  grip counts as off-hand only when every limb holding the weapon is on the
  non-dominant side, so a two-handed grip never is.
  
  **Dominance** is now a first-class property of a being, read from its Left
  Dominance and Right Dominance characteristics: either one alone sets that side
  as dominant, while carrying both or neither leaves the being ambidextrous with
  no off hand at all. This is the single answer wherever a favored side matters,
  not just for impact. A body part's own side is derived from its shortcode and
  the presence of its mirror twin, so a central part correctly belongs to neither
  side.
  
  Each contribution lands as a named delta — `StrImp`, `OffHnd`, `Thrwn` — so the
  impact breakdown shows the derivation instead of burying it in the total. The
  modifier is applied during the finalize phase, so a weapon's sheet and its
  attack card agree.
  
  Also moves Photophobia from a Fear trauma to a physical condition.
- 44f5feb: Rebuild the thirty animals covered by the **Domesticated Animal Abilities** and
  **Wild Animal Abilities** tables so the shipped compendium matches them
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  **Corrected numbers**
  
  The hunting dog carried the guard dog's scores verbatim; the ratter, both dogs
  and the ram carried the wrong weight; the cat, ratter and ram carried the wrong
  Move. `Cat`, `Ratter` and `Ram` had a Dexterity the tables do not define and no
  Scent, which they do. Every `attrRollFormula` now derives from its score
  (`1d6 + score − 3` at 10 and above, `1d4 + score − 2` below).
  
  **Body scale**
  
  All thirty shipped `bodyScaleBase: 1.0`, so a dagger wounded a destrier exactly
  as it wounded a human. Each is now seeded from its own Strength — 0.18 for a
  crow, 5.09 for an elephant — and injury levels read size-correct.
  
  **Anatomy**
  
  Each animal's body structure now reproduces the zone-number runs of its
  assigned hit-location table (A–M), including the five wild tables (F–M) that
  had no representation at all. The cat and the ratter previously had **no** body
  structure, so no blow against them could resolve a location. Foreleg locations
  on the dogs no longer hang off the head part. Every part carries the body
  `roles` that drive impairment and the fumble/stumble mishaps.
  
  **Natural weapons**
  
  Every animal now carries one Combat Technique per weapons-table row — kick,
  bite, claw, gore, tusk, talon, beak, grab — with its reach, zone die, attack
  value and impact, plus the Melee-table Dodge and Shock values. Previously only
  the bovine had an attack, and it was authored as a non-existent item type. A
  natural weapon cannot block, matching the `·` the DEF column prints.
  
  **Negative natural armour**
  
  `BodyLocation.protectionBase` is no longer floored at zero, so a hide softer
  than bare human skin (a crow's is `−6` blunt / `−8` piercing) raises the
  effective impact instead of being clamped away. Armour reduction still bottoms
  out at the location's own floor, so it can strip a hauberk to nothing but
  cannot make an already-vulnerable hide worse. Existing bodies are unaffected —
  the constraint only widened.
  
  The two reference tables now also ship as an executable specification
  (`tests/content/animal-abilities.test.ts`), so an animal that drifts from its
  printed row fails the build.
- b1755a2: **Generated content tables — Dataview `TABLE` queries** (#1275, #1410)
  
  A content note can now declare a catalog table by query instead of authoring its rows
  by hand, in the same fenced `dataview` block Obsidian renders live:
  
  ```text
  TABLE WITHOUT ID
    link(file.path, name.full) AS "Name",
    sohl.weight AS "Weight",
    sohl.protection.blunt AS "B"
  WHERE type = "armorgear" and sohl.material = "Cloth"
  SORT name.full ASC
  ```
  
  The build fills in the rows from the matching notes' frontmatter, in both content
  builds — the Foundry compendium packs and the knowledgebase — so one authored query
  yields the same table while writing in the vault, in Foundry (with `@UUID` links), and
  on the KB (with site links).
  
  - _Columns_ are any expression, optionally named with `AS "Header"`. Numeric columns
    right-align, absent values render as an em dash, and `link(file.path, …)` links a
    cell to the row's own note.
  - _Fields_ are any frontmatter property, however nested (`sohl.protection.blunt`,
    `sohl["subType"]`), plus `file.path` / `file.folder` / `file.name` / `file.link` /
    `file.tags`, and `this` for the note the query is written on.
  - _`WHERE`_ combines `and` / `or` / `not` and parentheses over `=`, `!=`, ordering
    comparisons, and bare-field presence, with `contains` / `icontains` / `econtains`,
    `startswith`, `lower`, `default`, `regexmatch` and more. `FROM` scopes to a folder or
    a tag; `SORT` takes several keys with per-key direction; `LIMIT` caps the rows.
  - A malformed query, an unsupported clause (`LIST`, `GROUP BY`, `FLATTEN`), an unknown
    function, or a column resolving to an object fails the build naming the problem. A
    query matching nothing renders as an empty table, exactly as it does in Obsidian.
  
  See _Generated Content Tables_ in the developer documentation.
- 0bce6ab: Add the eight unarmed combat techniques, and arm everyone who fights with their
  hands
  ([#1228](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1228)).
  
  No character carried the techniques every person has. A pregen could pick up a
  sword, but had no way to punch, kick, grab or trip with one.
  
  Eight new `combattechnique` skills under
  `assets/content/Skills/Combat_Techniques/`, one per row of the unarmed table.
  They are keyed `bflkbite`, `bflkgrab`, `bflkheadbutt`, `bflkkick`,
  `bflklmbblk`, `bflkpress`, `bflkpunch` and `bflktrip` — the prefix marking them
  as the folk techniques, since a person's bite is not a bear's and the plain
  names belong to creature techniques:
  
  | Technique  | LNG |  ZD | Impact  | Notes                   |
  | ---------- | --: | --: | ------- | ----------------------- |
  | Bite       |   0 |  d2 | `d4+0P` | Impact TA 3             |
  | Grab       |   1 |  d4 | —       | Strength roll           |
  | Headbutt   |   0 |  d4 | `d6-2B` |                         |
  | Kick       |   2 |  d4 | `d6-2B` | Low aim                 |
  | Limb Block |   1 |   — | —       | The one unarmed defence |
  | Press      |   1 |   — | —       | Strength roll           |
  | Punch      |   1 |  d4 | `d6-3B` | Impact TA 2             |
  | Trip       |   2 |   — | —       | Strength roll           |
  
  All are resolved by the **Melee** test, so each strike mode names `melee` as its
  governing skill rather than opening a mastery level of its own. Each carries
  Limb Block excepted, they counterstrike but cannot block — blocking bare-handed
  is Limb Block's whole job, and it never attacks. Each is impaired by the body
  role that wields it, so a wounded arm degrades a punch and a wounded leg a kick.
  
  The Grab, Press and Trip manoeuvres resolve by an opposed `d6 + STR` roll after
  the Melee test, with their margin tables written into each entry.
  
  They are carried by all four pregenerated characters, both goblins, all four
  Grukar and both Helspawn. The Grukar previously had a bespoke Punch whose impact
  was baked from their own Strength; that is replaced by the shared one, since the
  table gives every person the same fist and expects Strength to reach impact by
  its own route.
- cae4ad9: **The User Guide opens with a reading order, and nothing in it is orphaned** (#1320)
  
  The User Guide root announced itself as "an index to the instructions on how to use this
  system" and then linked two things: the Quickstart and the rules. There was no reading
  order, no chapter structure, and no list of the forty pages the guide actually contains.
  Everything below the root was reachable only by chance, through whatever cross-links two
  pages happened to share — and six pages were reachable by no path at all.
  
  - _A reading path._ The root now lays out ten chapters in the order a new group meets
    them, each with a sentence on what it covers: install and first roll, setting up a
    world, reading a sheet, the four kinds of actor, the item types, making tests, scenes
    and tokens, combat, harm, and the supernatural — with customization last, for GMs who
    want to go past what the sheets offer. A closing "where to look something up" answers
    the four questions people arrive with.
  - _Scope, stated._ The guide describes the implementation — sheets, buttons, dialogs,
    chat cards, settings. The game itself is the rules, and **where the two ever differ,
    the rules are what the game is**. Read a rules page for what a procedure means; read
    the guide for where the button is.
  
  **Two section introductions** now stand over the subdirectories that group related
  pages. _Actors_ opens with a table for choosing between Being, Cohort, Structure and
  Vehicle, then says what distinguishes each and what all four share. _Items_ groups the
  fourteen item types by what they are for — what a character _is_, the supernatural, and
  gear — and sends the reader to Base Item first, since that page already carries
  everything the types have in common.
  
  **Every page now leads somewhere.** _Actions_ and _Mystical Powers_ previously contained
  no outbound links at all; a reader who landed on either had no way onward. Twenty-two
  pages gained a **See also** section and fourteen more gained links back to their section
  introduction and to the index. _Icon Legend_ had no `shortcode:`, so nothing in the
  corpus could link to it even in principle — its generator now emits one, and a See also.
  
  **The guard.** `npm run lint:content-links` walked the rules only, so a User-Guide orphan
  was invisible to CI. The walk is now declared over a list of corpora and runs the same
  check on both roots: all 72 rules documents and all 43 user-guide documents are
  reachable, and a new page that nothing links to fails the build.
  
  Closes #1320
- 3ccd5a2: Rename Success Stars to Value Diamonds, and the result table to `resultDescTable`
  ([#1283](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1283)).
  
  The quality grade of a Success Value test is now **Value Diamonds**. It was
  "Success Stars", which collided with **Victory Stars** — an unrelated quantity.
  The two measure different things: Victory Stars is the unbounded difference
  between two positions on the success-level ladder, while Value Diamonds is a
  bounded 0–5 grade on the Success Value scale. Neither is a measure of _success_
  in the other's sense, and sharing the word "Star" invited exactly the confusion
  the Victory Star naming was introduced to remove.
  
  **What changed**
  
  | Was                | Now               | What it is                                    |
  | ------------------ | ----------------- | --------------------------------------------- |
  | `successStars`     | `valueDiamonds`   | The 0–5 quality grade of a Success Value test |
  | `successStarTable` | `resultDescTable` | The generic result-description table          |
  
  The table rename fixes a second, quieter problem: `successStarTable` never held
  star data. It is the `LimitedDescription[]` that fate, keep-control, afflictions
  and plain Success Value tests all ride on, supplying a label, a description and a
  numeric result — and that number only means "diamonds" for one of those
  consumers. The developer documentation already called the mechanism
  "result-description tables"; the code now agrees.
  
  **Compatibility**
  
  The old names are removed outright — there are no aliases. No DataModel field
  changed (the generated type catalog is untouched), so no world migration is
  needed and persisted actor/item data is unaffected. Localization keys are
  unchanged; only their values were reworded, so no key was renamed or retired.
  
  The one thing that does not survive is a **chat card posted before this
  release**. The serialized test result rides inside the card's `data-scope`, so
  pressing a button on an older card reconstructs a result with no description
  table: its Result row reads empty and its grade reads zero. Nothing is corrupted
  and nothing is applied silently — a treatment card's Course Bonus, for instance,
  is still confirmed in a dialog before it takes effect. Re-run the test to get a
  current card.
  
  **Display**
  
  The grade is now drawn as **diamond icons** rather than a bare number. Because
  the scale has a fixed ceiling of five, the card draws all five and fills the
  earned ones, so the row reads as a rating; a contest margin is unbounded, so
  Victory Stars still draws only the stars actually earned. The count remains
  available to screen readers via `aria-label`.
  
  Victory Stars are otherwise untouched.
- be04273: **Wikilinks address a note by `type/shortcode`** (#1281)
  
  A qualified wikilink named the target's top-level content **directory**
  (`[[Rules/shock]]`); it now names its **type** (`[[doc/shock]]`) — the same
  `(type, shortcode)` identity the rest of the system uses, and one already guaranteed
  unique tree-wide by `npm run lint:packs`. All 240 authored links were rewritten.
  
  - _A note can be refiled without breaking its inbound links._ Shortcodes are unique per
    type, not per directory, so the directory never contributed to the address.
  - _Routing is derived, not enumerated._ A target's pack comes from its type (`doc` →
    journals, `macro` → macros, `character`/`creature` → actors, everything else →
    items) instead of a hand-maintained directory table. A directory missing from that
    table is what made all 43 container-gear notes unlinkable (#1276); that class of bug
    cannot recur.
  - _The bare `[[Text]]` shorthand resolves within the source's own **type**._ Neither the
    directory nor the `category` takes any part in resolution. Shortcodes are unique per
    type, but _aliases_ are not: where two notes of one type share a name, the bare form
    is ambiguous and resolves to neither, so 47 such links were rewritten to the full
    `[[type/shortcode|Text]]` form.
  - A qualifier that names no content type is now reported as `unknown-type` (was
    `unmapped-tld`).
  
  Every resolved link was verified unchanged: 843 `@UUID` references across the compiled
  packs, byte-identical before and after — apart from four deliberate corrections.
  
  Auditing the tree for aliases that name a **different** document turned up five notes
  squatting on names they do not own, silently capturing every link meant for the real
  page. Those aliases are removed and the affected links now reach their proper targets:
  
  | Note                              | Aliases removed                                                |
  | --------------------------------- | -------------------------------------------------------------- |
  | _Item: Skill_ (user guide)        | `Combat Technique`, `Combat Techniques`                        |
  | _Gear_ (rules)                    | `Weapons`, `Armor`, `Projectiles`, `Containers`, `Concoctions` |
  | _Shock_ (rules)                   | `Coma`                                                         |
  | _Psychological Condition_ (rules) | `Aural Shock`                                                  |
  | _Infected_ (trauma)               | `Infection`                                                    |
  
  Aliases that are a variant of a note's **own** name are untouched — _Skills_ → `Skill`,
  _Afflictions_ → `Affliction`, _The Pall_ → `Pall`.
  
  Closes #1276.
- 3c76c28: Give armour two properties it was faking, and delete 311 Active Effects.
  
  **Perception was an effect; it is now a number.** Every armour article carried an embedded
  Active Effect to apply its perception penalty — 311 of them, of which **302 applied zero**.
  Each also carried a predicate string, repeated 311 times, naming which skills count as
  perception-based:
  
      (doc.type==='skill' && doc.logic.hasAttr('per'))||(doc.type==='attribute' && ...)
  
  That is a fixed rule about the system living in data, so changing it meant rewriting every
  article. `perceptionPenaltyBase` replaces the lot: one number on the article, the rule
  expressed once in code, and the 311 effects gone.
  
  The **worst** worn penalty now applies rather than their sum — a great helm subsumes what a
  mail cowl does to sight and hearing rather than compounding it. Summing was never a
  decision; it was what independent effects happened to do. This matches how impaired body
  parts penalize a test, where the worst of the role and limb penalties applies.
  
  **Encumbrance groups.** An article's ENC applied whenever it was worn, but the small rigid
  arm pieces do not work that way: a spaulder costs nothing alone, and wearing three or more
  costs 5 between them. That threshold had been encoded as 1.67 per piece so a sum would
  reach 5 — right at exactly three, and wrong everywhere else, charging a lone spaulder a
  third and a full harness half as much again.
  
  `encumbranceGroup` marks those thirteen articles instead. An article carries an encumbrance
  value or belongs to a group, never both, and the threshold is charged once to the set.
  Since worn armour contributes no weight, this is the whole of what an arm harness costs.
  
  **Both are documented and visible.** The Gear rules gain an _Arm Harness_ rule under
  Armor Encumbrance and a precise _Sensory Penalties_ rule stating that the worst worn
  penalty applies rather than the sum; the generated armour tables gain Harness and
  Perception columns, so a reader sees that a spaulder costs nothing alone but belongs to a
  set; and both fields are editable on the armour sheet, with the encumbrance value disabled
  for an article that belongs to a group.
  
  Closes #1339.

### Patch Changes

- 8fc51c5: **e2e: four specs no longer hard-code Basic Folk's content values.** Each failed
  deterministically once the compendium packs were rebuilt, because it pinned a
  number that content has since moved — the system was correct in every case. The
  unarmed combat techniques added for #1252 give Basic Folk intrinsic natural
  strike modes, and its attribute scores are now 11 (mastery level 55).
  
  - `gear-equip.cy.js` scoped its "strike-mode rows appear only after `holdItem`"
    assertion to an unqualified `[data-sm-id]`, which the eight intrinsic unarmed
    rows now match with nothing held; it now scopes to the weapon's own rows via
    `data-item-id`.
  - `movement-reach.cy.js` used Basic Folk to model "a being with no melee modes",
    which it no longer is (its reach is 2, from Kick/Trip); the empty case now uses
    a bare being.
  - `skillbase.cy.js` pinned "25 skills, every skillBase 10"; it now derives the
    expectation from the actor — every attribute shares one score, and averaging
    equal attributes yields exactly that score — with a floor on the roster size so
    an empty result still fails.
  - `keep-control-tests.cy.js` pinned Agility/Dexterity at mastery level 50; it now
    reads the attribute's mastery base off the actor and places the competing skill
    relative to it, so the specs pin the better-of selection rule rather than a
    content number.
  
  (Closes #1271.)
- 526da0d: **A failed attack no longer lands, and a tied block now wards the blow.**
  `CombatResult.attackerLandsBlow` decided the outcome purely from the victory
  score, so an attack that missed still arrived whenever the defence blundered
  worse — and a block that tied was treated as beaten rather than as the ward it
  is.
  
  Both conditions of the written rule are now enforced, in this order:
  
  - **The attack test must have succeeded.** Previously only _Ignore_ checked it;
    Block, Counterstrike and Dodge all landed a failed attack on a favourable
    margin. A marginal-failure attack against a critical-failure defence is a
    miss, not a hit.
  - **The attack must out-level a Block** (`VS > 0`). A tie is the blocker's, and
    is precisely what its weapon-break check exists for — so that check now fires
    only when there was a blow to absorb, not on a tie between two failures.
  
  Counterstrike (`VS >= 0`, since a counterstrike wards nothing) and Dodge (win
  outright, or take the tiebreak on the higher roll) keep their margins.
  
  (Closes #1302.)
- dacd0bd: **626 localization keys that nothing consumes are removed** — `lang/en.json` goes from
  2430 to 1804 keys. A translator localizing SoHL today would have translated hundreds of
  strings that render nowhere.
  
  Largest blocks: `SOHL.BodyLocation.*` (128) and `SOHL.BodyPart.*` (41), a
  per-shortcode name mechanism with zero call sites — parts and locations are named by the
  literal `name` field baked into the compendium; the `defineType` byproducts
  `SOHL.Affliction.CODE.*` (65), `SOHL.Skill.CODE.*` (64) and `SOHL.Attribute.CODE.*` (14),
  whose bundles are consumed as `kind`/`values` only; `SOHL.SuccessTestResult.tests.*` (24)
  and `SOHL.CombatResult.tests.*` (8), superseded by the per-namespace `*.Action.*` keys;
  and the terrain enums `SOHL.Biome` (28), `SurfaceCover` (17), `Topography` (6),
  `Hydrology`, `MovementFactorScope` (8), none of which has a consumer.
  
  **Method.** Deadness was established three ways, because no single one is sufficient:
  concrete literals and _whole-shape_ dynamic references (`` `SOHL.Calendar.Vylarian.Month.${i}.label` ``
  matches only `SOHL.Calendar.Vylarian.Month.<seg>.label`, not all of `SOHL.*`);
  `utils/check-lang-coverage.mjs` as an oracle, deleting candidates and restoring
  everything it proved a consumed `defineType` bundle or a concrete reference still needs;
  and the test suite, which caught four families no static analysis could see.
  
  **Deliberately retained**, because they are reachable only through a _variable_ prefix
  or by Foundry itself: `TYPES.Item.*` / `TYPES.Actor.*` (core reads these directly for the
  sidebar and create dialog), every `SOHL.<Namespace>.Action.*` title (built as
  `` `${titlePrefix}.${shortcode}` `` by `defineImproveSdrActions` and friends),
  `SOHL.ContextMenu.SortGroup.*`, `SOHL.Being.StumbleTest.*` / `FumbleTest.*`, and
  `SOHL.Reminder.effect.*`.
  
  `kb/dev-docs/reference/body-structure.md` is corrected: it described the removed keys as
  a live "parallel mechanism" and told authors to add one per new part or location. It now
  says the literal `name` is the only name the system reads, and distinguishes the
  `*.FIELDS.*` keys that remain — those label the config apps' form fields, not the parts.
  
  (Closes #1349.)
- 208bb10: **The system is now actually translatable: every user-visible string in every
  template is a localization key.** A translator who translated all of `lang/en.json`
  would previously still have seen English across the Being sheet's combat, profile,
  trauma and print tabs, the body-structure and strike-mode config apps, the gear and
  effects ledgers, and a dozen chat cards — because those strings had never become keys
  at all. A scan of `templates/**` found **516 hardcoded English literals across 61
  templates**; all of them are keys now.
  
  **The unreachable `FIELDS` groups.** `SOHL.StrikeMode.FIELDS.*`,
  `SOHL.MeleeWeaponStrikeMode.FIELDS.*` and `SOHL.MissileWeaponStrikeMode.FIELDS.*` were
  written in Foundry's auto-localization convention but sat under a namespace no
  `LOCALIZATION_PREFIXES` declares, so nothing ever read them while
  `strike-mode-config.hbs` hardcoded the same words. The config app now reads those keys.
  `SOHL.Encounter.*` (35 keys — the feature does not exist in `src/`) and
  `SOHL.Action.FIELDS.*` (35 keys — `SohlAction` is a `SohlEntity`, never a DataModel, so
  Foundry could not auto-localize them and no surface reads them) are deleted; the live
  `SOHL.Action.*` vocabulary is unaffected. `SOHL.Scene.FIELDS.*` needed no change — the
  scene tab reads it with an explicit `localize`.
  
  **Reuse over restatement.** Where a label already existed it is reused rather than
  duplicated: gear columns resolve through `SOHL.Gear.FIELDS.*`, skill headings through
  `SOHL.Skill.Heading.*`, aspects through `SOHL.ImpactModifier.ASPECT.*`, trauma columns
  through `SOHL.Trauma.COLUMN/COLTIP.*`. Genuinely generic words (`None`, `Menu`,
  `Expand`, `Drag to reorder`) now have one home in a new `SOHL.Common.*` namespace.
  Displayed English is unchanged except where the print sheet and the combat tab used
  different tooltip wording for the same column, which is now unified.
  
  New keys follow the standard published in #1351: singular PascalCase concept
  namespaces, PascalCase group segments, camelCase leaves, single-braced `{camelCase}`
  placeholders.
  
  A guard (`tests/guards/template-localization.test.ts`) walks the direction
  `lint:lang-coverage` cannot — **UI text → key** — and fails on any user-visible literal
  left in a template, with a short justified allowlist. It also compiles every template,
  because the easy way to break one while localizing it is to nest `{{localize …}}`
  inside another mustache (legal in an HTML attribute; a parse error inside a helper's
  hash, where a `(localize …)` subexpression is required).
  
  (Closes #1350.)
- c29aa29: **Localization keys now have a written naming standard, and the two namespaces that
  were spelled twice are consolidated.** `lang/en.json` had no naming rule, so each
  namespace imitated whatever was nearest — which produced five spellings for the same
  role and, in two places, two homes for one concept.
  
  **The standard.** `kb/dev-docs/reference/localization-keys.md` publishes it: keys are
  `SOHL.<Namespace>[.<Group>].<leaf>`, where the namespace is a singular PascalCase
  _concept_ (`SOHL.Action`, never `SOHL.SohlAction`), group segments are PascalCase with
  ALL-CAPS reserved for Foundry's own `FIELDS`, leaves are camelCase or an enum's stored
  value, and placeholders are single-braced `{camelCase}`. No method names and no data —
  paths, UUIDs, names — in a key segment. It also records the `expandObject`
  leaf-or-branch rule, and the narrow conditions under which a key may be renamed despite
  being permanent. `CLAUDE.md` and _System Development_ link to it.
  
  **`TYPE.*` → `TYPES.*`.** The pre-v10 `TYPE.ACTOR.*` / `TYPE.ITEM.*` document-type
  labels duplicated `TYPES.Actor.*` / `TYPES.Item.*` with identical values. The 17 old
  keys are gone; `SohlLogic.typeLabel` and the active-effect target label now read the
  `TYPES.*` root Foundry itself reads.
  
  **`SOHL.Actions.*` → `SOHL.Action.*`.** The actions-panel strings sat in a plural
  namespace beside the singular `SOHL.Action` concept. The 15 live keys moved onto
  `SOHL.Action`, with every call site in `src/`, `templates/`, and `tests/` updated in the
  same change.
  
  A guard (`tests/guards/lang-key-naming.test.ts`) holds all three: no `TYPE.*` root,
  every actor and item kind labelled under `TYPES.*` singular and plural, no plural
  namespace shadowing a singular one, no _new_ class-named namespace, and
  `{camelCase}` placeholders throughout.
  
  (Closes #1351.)
- cc6c2f7: **Each label in `lang/en.json` now has one owner instead of being restated per
  subtype.** 300 distinct values were duplicated across 832 keys — a third of the file —
  so a translator localized `Durability` six times and the six copies could drift apart on
  the six sheets that read them.
  
  `defineType` grows an optional third argument, `labelKeys`: a per-member map pointing a
  member at an **existing** localization key instead of minting one under its own prefix.
  That is the mechanism the consolidation needed, and it keeps the borrowing visible at
  the declaration rather than hidden in the lang file.
  
  - **Gear effect keys share `SOHL.Gear.*`.** All six gear subtypes carry the same
    `WEIGHT` / `VALUE` / `QUALITY` / `DURABILITY` / `ENCUMBRANCE` effect keys; they now
    resolve to the `SOHL.Gear.FIELDS.*` labels that already owned those words (30 keys
    retired). `Encumbrance` gains a shared `SOHL.Gear.FIELDS.encumbrance` owner, replacing
    the Armor and Weapon copies. The same treatment applies to the other
    `EffectKey` ↔ `FIELDS` restatements — `Level`, `Charges`, `Maximum Charges`,
    `Mastery Level`, `Healing Rate`, `Impact`.
  - **One owner for the duplicated enum sets.** `SOHL.CombatResult.TacticalAdvantage.*`
    (dead — nothing declared it) is deleted in favour of
    `SOHL.AttackResult.TacticalAdvantage.*`, and the five mishaps a defender shares with
    an attacker borrow `SOHL.AttackResult.Mishap.*`.
  - **`SOHL.Key.*` is retired** — 68 v12-era keys restating labels that now live in their
    proper namespaces. Its one live member moved to `SOHL.Common.none`, the shared home
    for genuinely generic words introduced in #1350.
  - **The `Affliction.FEAR` / `FATIGUE` leftovers are gone**; the Trauma-side enums are
    the live ones per the Trait→Trauma migration.
  
  `MiscGearDataModel` drops its `SOHL.MiscGear` prefix: with the shared labels borrowed it
  owns no keys at all, so the prefix could no longer resolve — the same rule #1353 applied
  to `SOHL.Structure`, and the guard from that issue is what caught it.
  
  `utils/check-lang-coverage.mjs` learns to read `labelKeys` (including a spread of the
  shared gear table), so it no longer demands keys a borrowing member never mints.
  
  Result: **2557 → 2430 keys**, duplicated values **300 → 279** across **832 → 728** keys.
  The remainder are deliberate — distinct concepts whose English happens to coincide, such
  as an attack `Modifier` and an impact `Modifier` — and a ratchet test now fails if the
  count rises.
  
  (Closes #1352.)
- 60aeb54: **The delete-confirmation dialog named the wrong thing, and Structure declared a
  localization prefix that resolved to nothing.**
  
  **Delete confirmation.** The dialog built its document-type name from
  `` `TYPE.${documentName.toUpperCase()}.${type}` `` — the pre-v10 root retired in #1351 —
  so it read _"Delete TYPE.ITEM.skill: Old Sword"_ instead of _"Delete Skill: Old
  Sword"_. It now reads the `TYPES.*` root Foundry itself uses; `documentName` is already
  that segment's spelling.
  
  The caution line beneath it was assembled the other way round from every other dialog:
  the localized prose was spliced into the template source (`` `<p>${localize(…)}</p>` ``)
  and carried a Handlebars `{{docType}}` that only substituted because `dialog()`
  compiles `content`. That is the pattern rule #10 forbids. The value now uses Foundry's
  single-brace `{docType}` and is interpolated with `format()`, and the template source is
  author-static (`<p>{{caution}}</p>`) with the prose riding in `data` — the same shape
  `ContainerGearLogic` already used.
  
  **Structure labels.** `StructureDataModel` declared `LOCALIZATION_PREFIXES` of
  `["SOHL.Structure", "SOHL.Actor"]`, but Structure adds no fields of its own — its schema
  is exactly `SohlActorDataModel`'s — so `SOHL.Structure` had no keys and could never
  label anything. Its labels and hints have always come from `SOHL.Actor`; the stale
  prefix is removed, to be added back with the first Structure-specific field.
  
  Three guards hold this: no `lang/en.json` value may use Handlebars double braces, every
  `SOHL.*` `LOCALIZATION_PREFIXES` entry must resolve to at least one key, and the delete
  dialog must name its type from `TYPES.*` with the prose in `data`.
  
  (Closes #1353.)
- 61cee14: **The localization guards can now catch what this epic had to find by hand.**
  
  `check-lang-coverage.mjs --unused` reported **zero** unused keys while 37.5% of the file
  was dead, because its predicate treated a key as used when _any_ referenced token or
  namespace prefix was a dotted ancestor — and `LOCALIZATION_PREFIXES` entries absorbed
  whole namespaces. Three changes fix it:
  
  - A dynamic reference now vouches for its **shape**, not its head:
    `` `SOHL.Calendar.Vylarian.Month.${i}.label` `` vouches for
    `SOHL.Calendar.Vylarian.Month.<segment>.label` and nothing else. A single
    `` `SOHL.${x}…` `` no longer vouches for the entire file.
  - A `LOCALIZATION_PREFIXES` entry vouches only for the shape Foundry actually looks up:
    `<PREFIX>.FIELDS.<path>.label|hint`.
  - Concrete keys inside **template-literal text** (inline HTML in a helper, e.g.
    `` `…{{localize "SOHL.ExpressionEditor.editTooltip"}}…` ``) are read out explicitly —
    a template literal is not a string-literal node, so the AST scan had been blind to
    them. Each chunk is scanned separately so a token cannot be glued across a `${…}`.
  
  Unused keys are now an **error**, not an always-silent warning, with a `RETAINED` table
  for the keys that are genuinely reachable but invisible to any scan — action titles
  built as `` `${titlePrefix}.${shortcode}` ``, enum values concatenated in a template —
  each with the reason, in `[prefix, reason]` form. 39 keys the tightened predicate
  exposed are deleted (`*.EffectKey.*` members whose label bundles are not consumed, the
  `SOHL.CALENDAR.DEFAULT.*` and `SOHL.Calendar.Default.Month.*` leftovers): 1804 → 1765.
  
  **New `lint:lang-hardcoded`** walks the reverse direction — _UI text → key_ — that
  `lint:lang-coverage` structurally cannot, failing on any user-visible literal left in a
  template, with an `ALLOWED` list carrying a stated reason per entry. It also compiles
  every template, because nesting `{{localize …}}` inside another mustache is legal in an
  HTML attribute but a parse error inside a helper's hash. It replaces the temporary
  vitest guard from #1350 and is wired into `npm run lint`.
  
  **`check-lang.mjs` gains two structural checks**, both failing: no Handlebars double
  braces or unbalanced brace in any value (the `{{docType}}` rendering bug of #1353), and
  no key segment outside `[A-Za-z0-9_-]` (the `"…SOUND.sounds/dice.wav"` shape that walks
  data into a key and invites the `expandObject` collision of #636).
  
  All three guards fail rather than warn, and the build is green — closing epic #1355.
  
  `kb/dev-docs/reference/localization-keys.md` gains a **The guards** section documenting
  all of it: what each check fails on, what `lint:lang-coverage` can and cannot see (a key
  built from a _variable_ prefix is invisible to it), the `RETAINED` / `ALLOWED` escape
  hatches and their `[prefix, reason]` format — with the standing rule that deleting the
  key is the honest fix — plus `defineType`'s `labelKeys`, the `SOHL.Common.*` home for
  generic words, and why a `{{localize}}` nested in a helper's hash will not compile. It
  also removes a caveat that had gone stale: the page told contributors not to trust
  `--unused`, which was true when it was written and is the very thing this issue fixed.
  
  (Closes #1354.)
- 77a0522: **e2e: the item-sheet suite now probes each numeric field with a value that field
  permits.** The shared `itemSheetSuite` "persists edits to its simple properties
  fields" test typed `3` into every enabled numeric input and asserted the
  round-trip, so any field whose schema bounds exclude `3` failed against a system
  behaving correctly — Foundry cleans an out-of-range value back to the field's
  initial. `ArmorGearDataModel.perceptionPenaltyBase` (`max: 0`, because a
  perception penalty is zero or negative) made `item-sheet-armorgear.cy.js` fail
  deterministically. The suite now reads each numeric input's bounds — from its
  schema field, falling back to the input's own `min`/`max` attributes — and picks
  the first in-range candidate that differs from the current value, so the edit
  still proves persistence (a `max: 0` field is probed with `-3`) and any bounded
  field added later is handled without touching the suite. (Closes #1359.)
- ee9fa4f: **e2e: `shortcode-header.cy.js` no longer expects an unlocalized placeholder.**
  The item-sheet header's shortcode input renders
  `placeholder="{{localize "SOHL.Common.shortcode"}}"` since the template strings
  were localized, so the spec's literal `"shortcode"` expectation failed against a
  rendered `"Shortcode"`. It now reads the localized value off `game.i18n` and
  asserts against that — pinning the binding rather than the wording, so the next
  copy change cannot break it — and additionally asserts the placeholder is not a
  raw `SOHL.*` key.
  
  (Closes #1379.)
- d3bce3b: **Knowledgebase pages no longer redirect from their display names** (#1399)
  
  `aliases` names two unrelated things: in Obsidian a note's alternative _names_, in Hugo
  a page's URL _redirects_. The knowledgebase build conflated them, publishing every
  authored alias as a redirect — 1402 of the 1656 emitted entries were display names such
  as `Black Death` and `Nightwights`, each claiming a public URL.
  
  - _Redirects are now wholly generated._ A page emits exactly the addresses it really did
    publish at before: its legacy slug (`kb/data/legacy-slugs.json`) and, for a moved page,
    its pre-split `/guide/` or `/dev/` URL. Both still emit and still resolve; only the 1402
    display-name entries are gone.
  - _Names stay in the vault._ An authored `aliases` still resolves a bare `[[Text]]`
    wikilink, which is what it was always for.
  - This also unblocks giving every note a `type-shortcode` alias for Obsidian addressing,
    which would otherwise have published 1599 further shortcode-shaped public URLs.
- fcb3bac: **An unlabelled `[[type-shortcode]]` link now reads as the target's name in both
  content builds.** With no `|Text` label the pack compiler showed the raw address
  — `[[doc-shock]]` rendered as "doc-shock" — while the knowledgebase showed
  "Shock", so one authored link read two different ways.
  
  Both builds now apply the same rule, and read it from the same place:
  
  - A **qualified** target is an address, not prose, so an unlabelled link shows
    the target document's **name** — for `type-shortcode` and the legacy
    `type/shortcode` alike (the knowledgebase previously recognised only the
    slash).
  - A **bare** `[[Text]]` is the prose the author wrote and still renders verbatim:
    _worsens the [[Shock State]]_ must not become "worsens the Shock".
  - The knowledgebase build now reads "is this an address?" with the pack build's
    own qualifier rule, so a hyphen inside a note _name_ (`Grukar-ahk`) still
    resolves as an alias and the two builds cannot drift apart on it again.
  
  (Closes #1409.)
- 6a0d83d: Fail the build on a wikilink that addresses a document which does not exist (#1414).
  
  A qualified `[[type-shortcode]]` names a document by its identity, so one resolving to
  nothing is a dead address. It degraded silently: the link kept its label and rendered
  as plain text, so the prose still read correctly while the href was simply gone — the
  failure mode that hides best. Nothing reported it. `lint:content-links` explicitly
  skipped an unresolvable target as "an external reference, not this check's business",
  and the knowledgebase build's own guard only ever recognised the legacy `type/slash`
  form, which nothing is written in any more.
  
  `lint:content-links` now checks it, so it gates every `npm run lint` rather than a
  build step nobody runs locally. A bare `[[Name]]` is still never reported — that is the
  long-standing placeholder for worldbuilding notes kept outside this repository, and a
  hyphenated _name_ like `[[Grukar-ahk]]` stays a name, since a hyphen only qualifies on
  a known type.
  
  What made this awkward is that the same syntax addresses content in a **package this
  build does not publish**: `Rules/Bestiary.md` links six setting-package creatures that
  are real notes in the vault, resolving in Obsidian and on heroiclands.org but not here.
  Nothing distinguishes them from a typo, so they are listed by name in
  `FOREIGN_ADDRESS_ALLOWLIST` with the note each one means — six reviewed entries rather
  than a blanket tolerance — and the check warns when an entry stops being used. The list
  goes away once the tree has a single source (#1385) and every package is visible.
- 88d108e: Answer a real 404 for a knowledgebase address that does not exist (#1416).
  
  An unknown path on `kb.heroiclands.org` returned **200** and served the landing page.
  Cloudflare Pages falls back to the site root when a deployment carries no `404.html`,
  and the knowledgebase build emitted none — neither the shared theme nor `kb/layouts/`
  provided a template — so nothing about the response distinguished a missing page from a
  real one.
  
  A soft-404 fails in the direction that hides: every "does this URL resolve?" check
  reports success, which is how eight URLs that resolve to nothing were counted as
  resolving while measuring redirect coverage. Search engines index a soft-404 as a live
  page, so retired content keeps its listing, and a reader following a stale link is
  handed the front page rather than being told the page is gone.
  
  `kb/layouts/404.html` now renders a "Page not found" page through the usual site chrome
  — it names the address that failed and offers the routes back (home, developer
  documentation, user guide, rules) — and Pages serves that file with a genuine 404
  status. The deploy workflow asserts the artifact exists before publishing, since the
  absence of a 404 page is invisible until someone follows a broken link.
- a729146: Refuse a wikilink authored inside a frontmatter value (#1428).
  
  Both content builds walk a note's **body** and copy its frontmatter through verbatim,
  so a `[[…]]` written in a `description`, a `government.summary`, or any other
  prose-bearing field is never resolved. It reaches the reader as literal brackets, in
  whatever the theme renders that field as — an infobox row, a card subtitle — and
  nothing downstream notices, because the value is a perfectly good string. The page
  builds, the link checks are body-only, and the defect is visible solely to someone who
  looks at the rendered field.
  
  `lint:content-links` now reports every one and fails, naming the file, the dotted key
  path, and the link as written; `build-kb-content` refuses the same thing before it
  writes a single page, so the form cannot publish even if the lint is bypassed.
  
  The form is refused rather than resolved on purpose. Resolving it would mean choosing
  an output syntax for a field whose renderer this build does not know — a markdown link
  is inert in a template that prints the value as text, and an `<a>` is unusable in one
  that escapes it — and it would bless an authoring habit the pack compilers have no way
  to honour at all. Frontmatter carries data; a link belongs in the prose the field
  summarises.
  
  Values are read from the _parsed_ frontmatter, so a `[[` inside a YAML comment is not a
  hit, nested maps and lists are walked, and every hit can be pointed at by the path an
  author would look for.
- 013bd82: Retire the HeroicLands vault as a content source (#1447).
  
  The vault was the migration's source, not an ongoing one. With `sohl` (#1445),
  `thalorna` (#1441) and the site (#1448) each owning their content, nothing reads
  it any more — but several places still told a reader otherwise.
  
  - _The dead export config is gone._ `.env.local.example` still documented
    `HEROICLANDS_VAULT`, `npm run content:check` and `npm run content:export` as the
    way to regenerate `assets/content/`. None of those exist; the block is removed.
  - _`assets/content/` is described as source._ `content-tables.md` said content is
    authored "in the HeroicLands Obsidian vault". It is authored in
    `assets/content/`, which is opened as a vault so Dataview still renders the
    tables live while writing.
  - _The cross-repository map matches the repositories that exist._ Issue Reporting
    §9 and the Definition of Done listed a three-repository project with the vault as
    one of them; they now name `sohl-thalorna` alongside the system and the site.
  - _The `vault` label is retired, not deleted._ `sync-labels.mjs` deletes any label
    absent from `.github/labels.yml`, which would strip the label from every issue
    that carries it. It stays, redescribed as retired, so historical issues keep
    their delivery target.
  
  A note count reconciles the vault against the package repositories: all 1,442
  `SoHL/` notes and 11 `Types/SoHL/` collections are in this repository, and all
  1,725 `Setting/` notes and 15 `Types/Thalorna/` collections are in `sohl-thalorna`.
  Nothing was lost in transit.
- 7b06f6f: **API documentation is published for the current release only, unversioned.**
  `api.heroiclands.org` now serves one build — the newest release tag — at its
  root. The accretive archive is retired: no `/latest`, no `/main`, no `/<tag>`,
  and no per-branch directories. Git tags are the history, and the documentation
  for any release is reproducible from its tag with `npm run docs:html`.
  
  - `deploy-docs.yml` resolves the newest release from the GitHub API and builds
    that tag, so the ref that triggered the run no longer decides what is
    published. It runs on completion of the release workflow and on manual
    dispatch, replacing the `workflow_call` indirection that existed because a
    Release created with `GITHUB_TOKEN` cannot trigger a `release:` event.
  - Removed with the archive: `/latest` mirroring, branch-slug directories, the
    root redirect page, and the cleanup job that fired on branch deletion.
  - `CNAME` is preserved rather than rewritten — GitHub Pages maintains it from
    the custom-domain setting.
  - `docs:version` (`utils/sync-doc-version.mjs`) is gone. It pinned generated
    `…/latest` links to `…/v<version>`, an address that no longer exists.
  
  (Closes #1452.)
- 5d45241: **Every link to `kb.heroiclands.org` and `api.heroiclands.org` now points at
  where those pages actually live.** Both hostnames have been withdrawn, so these
  were dead links, not merely dated ones — including two the system itself ships.
  
  **In the shipped system**
  
  - The **Game System** links in Foundry's settings sidebar. `system.json` carried
    a knowledgebase URL on a retired host and an API URL composed as
    `<host>/v<version>`, an address that stopped existing when the documentation
    became a single unversioned tree (#1452). `package.json` now carries the
    finished address (`apiDocsBaseUrl` → `apiDocsUrl`), and the build uses it as
    given rather than composing a version onto it. Both suites that assert those
    links assert the new ones.
  
  **In the generated API documentation**
  
  - Its own masthead pointed at both retired hosts, and at a project page
    (`/projects/sohl/`) that 404s. All three now resolve.
  - The home page's links to the Architecture Overview and Getting Started omitted
    the `/dev-docs/` section and had been dead independently of the move.
  
  **In the documentation**
  
  - JSDoc across `src/` (17 files), `CONTRIBUTING.md`, the developer docs, and the
    build utilities. `CONTRIBUTING.md`'s three "published on the website" links
    pointed at TypeDoc `documents/…` pages, an arrangement that ended when the
    prose moved to the knowledgebase; they now point at the pages that hold the
    material.
  - The "Player & GM rules" links pointed at the site's own `/sohl/` guide pages,
    retired when the site stopped publishing the package. They now point at the
    knowledgebase's user guide and rules.
  - The convention for a JSDoc → doc-page link is stated once, in
    [System Development](https://www.heroiclands.org/sohl/kb/dev-docs/contributing/system-development/),
    and now names the current address.
  
  Every rewritten URL was fetched: all 32 distinct addresses this repository emits
  resolve.
  
  (Closes #1455.)
- bfa20d9: **The API documentation is published only at `www.heroiclands.org/sohl/api/`.**
  `api.heroiclands.org` and the machinery behind it are gone: `deploy-docs.yml`
  and the `gh-pages` branch it published to are deleted, along with the page
  documenting that hosting.
  
  Nothing about the documentation itself changes — the same TypeDoc build, from
  the same newest release tag, still ships with every release. It is now one half
  of the single `/sohl/` deploy (#1470) rather than a second deployment of the
  same pages to a second host, which is what could drift and what made "which
  release does this describe?" answerable two ways.
  
  - `.github/workflows/deploy-docs.yml` — deleted. `deploy-sohl.yml` already
    builds the API documentation from the newest release tag on the same trigger,
    so no publish is lost and none is duplicated.
  - The `gh-pages` branch — deleted. It held one build and no history worth
    keeping; git tags are the history, and any release's documentation is
    reproducible from its tag with `npm run docs:html`.
  - `kb/dev-docs/contributing/api-docs-hosting.md` — deleted, and unlinked from
    the documentation index. It described a branch-based Pages deploy, a `CNAME`
    file and a cache-purge step that no longer exist.
  
  `kb/hugo.toml`, `kb/layouts/`, `kb/data/` and the shared-theme submodule are
  untouched and still in use: this repository renders its own pages.
  
  (Closes #1456.)
- 61d30c1: **`/sohl/` has a landing page written for the reader who has already arrived.**
  It is the address the site's navigation, the system's in-app help, and every
  external link to the project use, and what stood there was a placeholder carried
  over from the deploy that created it (#1470).
  
  It leads with **how to install the system** — the manifest URL, pasted into
  Foundry's _Game Systems → Install System_ — because that is the one thing no
  other page gives concretely, and the project page still says the system is not
  packaged.
  
  Below it, three doors chosen by **what a reader came to do** rather than by which
  surface happens to publish the answer, since someone at the table should not have
  to know that the rules live on the knowledgebase and the API reference does not:
  
  - _At the table_ — the user guide, the rules, the quickstart, character creation.
  - _What it ships with_ — the catalog of creatures, gear, skills, afflictions.
  - _Building on it_ — the developer docs, the API reference, extension points.
  
  Deliberately **not** a second copy of the site's front page, which already
  carries Knowledgebase and API cards, nor of the project page, which pitches the
  system to someone still deciding.
  
  Both landing pages now resolve their artwork through the shared theme's
  `cdn-url.html` against `params.cdnBaseURL`, so **no layout in this repository
  names a host**. The knowledgebase landing renders byte-identically across that
  change.
- 26935d4: **This repository now builds and deploys the whole of `/sohl/` as one site.**
  What used to be two deployments on two hosting platforms — the knowledgebase at
  `kb.heroiclands.org` and the API documentation at `api.heroiclands.org` — is one
  standalone subtree of `www.heroiclands.org`, built and published by one workflow
  (#1444).
  
  **What is published where**
  
  | Address      | What                                     | Built from             |
  | ------------ | ---------------------------------------- | ---------------------- |
  | `/sohl/`     | A landing page for the package           | `main`                 |
  | `/sohl/kb/`  | The knowledgebase, unchanged in content  | `main`                 |
  | `/sohl/api/` | The API documentation, mounted as a tree | the newest release tag |
  
  **The deploy**
  
  - `deploy-kb.yml` becomes `deploy-sohl.yml` and publishes all three surfaces in
    one run. A Cloudflare Pages deploy replaces the whole tree, so both halves are
    rebuilt every run — publishing one alone would take the other offline.
  - The deployment carries the `/sohl/` prefix **physically**
    (`build/site/sohl/…`), so every link resolves at the hosting project's own
    address exactly as it will at `www`, and the routing layer that composes the
    hostname (#1468) has nothing to rewrite.
  - `utils/build-site.mjs` (`npm run site:assemble`) mounts the TypeDoc output and
    refuses to finish unless the landing page, the knowledgebase, the API
    documentation and the `404.html` are all present. `npm run build:site` builds
    the lot locally.
  - Hugo renders into `build/site/sohl/` rather than `kb/public/`, and cleans its
    destination, so a stale page from an earlier layout can no longer be deployed.
  
  **Knowledgebase changes**
  
  - Content is generated into `kb/content/kb/`, and every generated link, redirect
    and manifest entry carries the mount. A Hugo `alias` is publishDir-relative
    and does _not_ inherit the `baseURL` path, so the site root is stripped on the
    way into the frontmatter — an alias spelled as a full site URL would publish
    at `/sohl/sohl/…`.
  - Section landings that Hugo used to generate for free (`macro`, `collection`)
    are now written by the build. Nested directories are not sections, so those
    two addresses would otherwise have silently stopped existing while every page
    inside them kept working. `macro`'s heading loses Hugo's inflection — it reads
    "Macros", not "Macroes".
  - Per-type listing layouts select on the frontmatter `type` rather than the Hugo
    section, which is now `kb` for every page.
  - The knowledgebase hero banner pointed at a CDN path that 404s
    (`images/sohl-banner.webp`); it now resolves.
  - The shared theme is bumped for its own fix to the breadcrumb's middle crumb,
    which composed `/{package}/{section}/` — an address only a site publishing
    several packages as path segments has. It was dead on all 1,450 content
    pages before this and would have doubled the prefix after it.
  - `deploy-docs.yml` and `gh-pages` still run and still serve `api.heroiclands.org`.
    Retiring them is #1456, deliberately later.
  
  (Closes #1470.)
- 605b6fe: **One `/sohl/` deploy per push, and no more whole-zone cache purges.**
  `deploy-sohl.yml` watched the release workflow's _completion_ as its
  "a new release exists" signal, but that workflow runs on every push to `main`
  and succeeds whether or not it cuts a release — so most pushes published the
  site twice, and every publish ended in a `purge_everything` across the whole
  `heroiclands.org` zone.
  
  - The `workflow_run` trigger is gone. `release.yml` now dispatches the deploy
    itself, from the one step that knows a release was actually published, so the
    API half still refreshes when the tag it documents moves.
  - The push trigger republishes on **every** push to `main`, no longer only on
    changes to a hand-maintained path list. The site is cheap to rebuild against
    how quietly such a list goes stale.
  - The post-deploy cache purge is removed. `/sohl/` is served through the routing
    Worker straight from Cloudflare Pages, which sends
    `cache-control: public, max-age=0, must-revalidate` and is never held in the
    zone edge cache — so the purge invalidated nothing under `/sohl/` and evicted
    only the surfaces the deploy never touched (`www`'s own pages, `cdn`).
  
  (Closes #1484.)
- 12fcf2f: **Every API link in the user guide points at a page that exists again.** 71 links
  across 14 notes named `api.heroiclands.org`, a hostname withdrawn when the
  documentation consolidated under `/sohl/` — so they failed at DNS, with no
  redirect to follow, both in the knowledgebase and in the compiled Foundry
  journals.
  
  Two drifts had landed on the same links and the second hid the first: every one
  also kept a `/main/` or `/latest/` segment, which the API site stopped publishing
  when it became a single unversioned tree, so they were already 404ing before the
  host went away. Repointing the host alone would have moved a dead link rather
  than fixed it; both segments are dropped, and `.html` with them, since the
  extensionless page is a direct 200 where `.html` costs a redirect hop.
  
  Two of the links additionally named `API_Reference.SafeExpression`, a symbol path
  from a TypeDoc layout the project no longer uses; they now name the class's
  current page. All 71 addresses — page **and** `#anchor` — were checked against
  the published API index, and every distinct page fetched: all resolve.
  
  **The same rot now fails the build.** An absolute URL is opaque to the wikilink
  checks in `lint:content-links`, which is why 71 of these could ship unremarked.
  That guard now also rejects a link to any hostname the project has retired
  (`utils/retired-hosts.mjs` is the list), printing the working address for each
  one it finds.
  
  (Closes #1485.)
- 22c17ae: **The published API documentation no longer offers hostnames that do not resolve.**
  
  `/sohl/api/` linked `kb.heroiclands.org` and `api.heroiclands.org` from its
  header dropdown and its landing prose — five dead ends on the canonical surface,
  each failing at DNS with no redirect to follow. The addresses were corrected on
  `main`, but the API documentation is rebuilt from the newest _release tag_, and
  that tag predates the correction, so every deploy reproduced them.
  
  The site assembler now closes both halves of that. It repoints a retired-host
  link in the API tree — whose source cannot be corrected after the tag is cut —
  and takes a replacement **only when the page it names is present in the tree it
  has just assembled**, so a repair is verified rather than guessed. That matters
  here: the old landing linked the developer docs without their section segment,
  so swapping the host alone would have resolved at DNS and then 404ed. It then
  reads every rendered page and **fails the build** on any `href` or `src` still
  addressing a withdrawn host, which is what stops the next release reintroducing
  one. Prose that merely names a retired host is left alone — the developer docs
  explain the move, and saying so is not a dead end.
  
  Closes #1487.
- 54d08f0: Publish Foundry UUIDs in the link manifest, and address every note canonically (#1499).
  
  The manifest from #1446 carried each note's web address only, so a build compiling
  packs had no way to resolve a link into another package — and no way to notice a
  shortcode another package already claimed.
  
  **Manifest version 4.** Keys are now **canonical**: fully qualified and spelled
  with the authored hyphen separator, so a key _is_ the address an author writes —
  `sohl-affliction-aconite`. Entries carry the Foundry `uuid` beside the web
  `path`, with `foundryPackage` in the header.
  
  **An item and its documentation are two entries.** They are two documents with
  two UUIDs, so they get two addresses — `sohl-affliction-aconite` and
  `sohl-docaffliction-aconite` — each stating its own `uuid`. The item entry
  carries a `doc` pointer naming the other address rather than repeating its UUID,
  because the doc entry owns that fact.
  
  **Entries carry `anchors`**, mapping a note's named sections to the **whole**
  UUID each compiled to, with the first page under the reserved name `$lead` — the
  one page every journal has, and what an item's `docHtml` points at. Whole UUIDs
  rather than fragments appended to `uuid`: nothing owns a page address, so a
  complete link restates nothing, an anchor is free to live outside its own entry,
  and the page-id hash (sha256 → base64 → strip → truncate) stays out of the
  published contract entirely. A consumer resolves a section link with a lookup
  instead of reimplementing it.
  
  **The manifest is emitted beside the pack compilers**, not from the knowledgebase
  build, because only the build that splits notes into pages knows their anchors.
  The web address moves to a shared `content-address.mjs` that both builds import,
  so the two cannot drift. A canonical key is globally unique, which is what lets a vendored
  manifest merge straight into a local index — one map, one lookup, no precedence
  rule — and makes a key already present a real conflict rather than an artefact of
  two packages sharing a namespace. The version bump is load-bearing: a v2 key read
  as a v3 one addresses a package named after a type.
  
  **The package segment is optional in authored links.** `[[skill-lang]]` still
  means the citing note's own package; `[[sohl-skill-lang]]` names one explicitly,
  for the case where two packages claim an address. It parses unambiguously because
  no type and no shortcode contains a hyphen, and it is read only when the segment
  names a known package _and_ the remainder is itself a valid address — so a note
  called "Grukar-ahk" stays an alias.
  
  **`utils/packs/` is parameterised, restoring its diff with `sohl-thalorna`.**
  `ids.mjs` gains `compendiumUuid()` / `pageUuid()` and owns the type → pack
  mapping, which now holds pack names rather than whole addresses;
  `buildWikilinkIndex` computes each note's UUID once and `convertWikilinks` looks
  it up. `content-package.mjs` names `CONTENT_PACKAGE` and `FOUNDRY_PACKAGE_ID`
  separately — they are equal here only by coincidence, and conflating them is what
  made every `sohl-thalorna` link address this system (#1498). Emitted pack output
  is byte-identical, verified by hash against the previous build.
  
  **The pack build resolves cross-package links too.** It vendors the other
  package's manifest, merges its canonically keyed entries into the wikilink index
  — one map, one lookup, no precedence rule — and resolves a foreign address to
  the UUID the manifest states, anchors included. 43 links now address
  `Compendium.sohl-thalorna.*`.
  
  With every linkable package either built here or vendored, a _qualified_ address
  that resolves nowhere can only be a typo, so it now fails the note rather than
  degrading silently. A bare alias stays a warning: it may be ordinary prose.
  
  **An unresolved link keeps its text and is marked.** It renders as
  `<span class="sohl-unresolved-link">`, styled in
  `scss/components/_unresolved-link.scss` — bold, dotted underline, and a colour
  chosen per theme with `light-dark()`, since Foundry drives its themes through
  `color-scheme`. Both values are contrast-checked rather than eyeballed:
  `#B3261E` reaches 5.5–6.5:1 on light backgrounds, `#FF8A80` 6.8–8.3:1 on dark.
  The text is escaped, so content cannot inject markup.
  
  **The contract is documented.** `kb/dev-docs/reference/link-manifest.md` is the
  page another repository codes against: the format field by field, how canonical
  keys parse, why an item and its documentation are two entries, what `$lead` is,
  and the six rules a consuming build must follow — including that an entry
  legitimately has no `uuid`, that `path` is resolved against the consumer's own
  base, and that `doc<type>` must never be admitted as a real type.
- 99c015a: Compile the packs of the **configured** content package, and fail a build that compiles nothing (#1502).
  
  Every pack compiler decided whether a note belonged to this build by comparing
  its `package:` frontmatter against the string literal `"sohl"` rather than
  `CONTENT_PACKAGE`. A repository that vendors `utils/packs/` and sets its own
  content package therefore rejected every note, compiled zero documents, and
  exited 0 — the very thing `content-package.mjs` exists to prevent, and what made
  the shared tree undiffable between packages.
  
  **Every pass now reads the configured package.** `items`, `actors`, `journals`
  and `macros` import `CONTENT_PACKAGE` and filter on it; `scenes` already did.
  
  **Empty output fails the build.** The existing guard caught an empty content
  _tree_; it could not see a full tree that compiled to nothing. Each compiler now
  reports a `compiledCount`, and a pass that writes zero entries from a non-empty
  tree fails the pack build instead of shipping a blank compendium. A pack that
  legitimately ships nothing in some consuming package declares `mayBeEmpty: true`
  in `PACK_CONFIGS`, so the guard stays meaningful everywhere else.
- 95735f3: **Build: the Foundry package id is now checked against the shipped manifest.**
  `FOUNDRY_PACKAGE_ID` in `utils/packs/content-package.mjs` documented a guard
  named `assertPackageIdMatchesManifest` that had never been written — the
  identifier appeared nowhere else in the repository. Every compendium UUID the
  pack compilers emit takes its first segment from that constant, so it could drift
  from the `id` the manifest declares and quietly ship a whole pack of documents
  addressing a package this repository does not ship: links that look resolvable
  and fail at runtime.
  
  - New `utils/packs/package-manifest.mjs` holds the guard, split so the rule
    itself is testable: `assertPackageIdMatchesManifest(configuredId, manifestId)`
    is a pure string comparison, and `readManifestPackageId()` is the thin caller
    that feeds it from disk. The module has no import-time side effects.
  - It resolves whichever manifest template the repository ships —
    `system.template.json` here, `module.template.json` in a module repository —
    and treats the absence of both as an error, since a pack build with no package
    manifest has nothing to verify its UUIDs against.
  - `generatePacksJson()` calls it before generating any entry, so the check runs
    wherever the pack library is driven from, and the pack CLI now reports a build
    guard's message and exits non-zero instead of raising an unhandled rejection.
  - The comment in `content-package.mjs` now describes the code that exists.
  
  (Closes #1503.)
- 24fa1d6: **One registry decides which content types compile into Items.** The pack build
  kept two hand-maintained lists — the `ITEM_TYPES` whitelist in
  `utils/packs/item-docs.mjs` and the `BUILDERS` table in `utils/packs/items.mjs`
  — and they had drifted: `trait` was whitelisted with no builder behind it, so a
  `type: trait` note passed the gate and then died on `BUILDERS[type] is not a
  function`, swallowed as a per-file compile error naming no cause.
  
  - `ITEM_BUILDERS` in the new leaf module `utils/packs/item-builders.mjs` is now
    the single declaration, pairing each item type with the builder producing its
    `system` block. `ITEM_TYPES` is derived from its keys, so a type cannot be
    advertised as compilable without a builder to compile it, and `DOC_ENTRY_TYPES`
    keeps deriving from `ITEM_TYPES` as one set.
  - `itemBuilder(type)` names the type it cannot build, in place of the anonymous
    `is not a function`.
  - The `sohl:` frontmatter readers moved to a leaf `utils/packs/frontmatter.mjs`
    (re-exported from `helpers.mjs`, so every import path is unchanged) — the
    registry builds on them without reaching `helpers.mjs`, which imports wikilinks
    and through them `item-docs.mjs` itself.
  - `trait` — an item type _retired in #651_, absent from `documentTypes.Item` and
    reported by world migration as unrecognized — is no longer advertised anywhere:
    its stale default artwork in `src/utils/default-item-art.mjs` is gone too, and
    that map is now held in exact step with the registry by the unit suite.
  
  (Closes #1504.)
- c416548: **Content: a code block is verbatim, so a wikilink inside one stays as written.**
  Wikilink conversion had no idea where code was, so a `[[…]]` in a code sample was
  rewritten as a link. Whether it triggered depended on the surrounding literal's
  shape — `grid[[0]]` was rewritten while `[[1,2],[3,4]]` survived, the inner `]`
  being one the pattern could not cross — so the corruption looked arbitrary. With
  the Macro compiler it became load-bearing: a macro's `{#script}` fence renders
  into its JournalEntry documentation, so the _documented_ copy of a shipped macro
  was corrupted while the executable copy stayed correct.
  
  A shared scanner (`utils/code-fences.mjs`) now reports where code lives, and the
  three rewriters consult it: the pack compilers' `convertWikilinks`, the
  knowledgebase's `resolveKbWikilinks`, and the `lint:content-links` scan — which
  had likewise been reporting links that only existed inside a code sample.
  
  Covered: fenced blocks (backtick and tilde, any fence length, info string
  included, closed by end-of-document if never closed), four-space and tab indented
  blocks, and inline code spans. An indented block is measured against the
  enclosing list item's content column, so a list continuation stays prose. The
  fence syntax itself is now stated once and shared with the `dataview` table
  expander, which already read fences correctly.
  
  Compiled output is byte-identical for today's content on both surfaces — no link
  that used to resolve stopped resolving.
  
  (Closes #1505.)
- cacf95f: Add npm workspaces and scaffold `@heroiclands/content-build` (#1506).
  
  `packages/sohl-types` was published by hand from a sibling directory: the root
  `package.json` had no `workspaces` key, so the package was never linked into the
  repository that produces it. #407 planned workspaces and that half was never
  implemented. Adding a second package is the moment to fix it — with workspaces
  this repository consumes its own toolchain **by path**, so a compiler change is
  usable here without a release, and only external repositories wait on a version.
  
  **The new package.** `packages/content-build` is `@heroiclands/content-build`,
  the shared toolchain that will compile a HeroicLands content tree into Foundry
  compendium packs. It ships the internal split the epic mandates — `engine/` for
  the package-agnostic machinery (walk, frontmatter, tables, wikilinks, ids,
  folders, link manifest, `BasePackCompiler`, the generic document compilers) and
  `sohl/` for the SoHL data-model knowledge (`ITEM_TYPES`, `BUILDERS`, the items
  and actors compilers, default art), so that an adventure module never receives
  `buildWeaponGear`. **No compiler code moves yet**: both barrels are real and
  empty, and the `content-build` command implements only `--help` and
  `--version`, refusing anything else rather than pretending to have built
  something.
  
  **The configuration contract.** `defineConfig` is the whole of the per-repository
  configuration: the content package, the Foundry package, the package kind
  (`systems` or `modules`), the pack list, the asset list, and three independent
  publishing switches — `site`, `manifests.publish`, `manifests.consume`. It
  validates, defaults, and deeply freezes a copy, throwing a `TypeError` that names
  the offending field, so a malformed config fails at load rather than as an empty
  pack much later. The three switches are independent because every combination is
  real: `kethira` publishes neither a site nor a manifest yet still consumes them.
  
  **The trailing `"."` in `workspaces` is deliberate.** npm does not need it, but
  Changesets discovers packages through the same globs and excludes the root
  package in workspace mode — without it, every pending changeset fails with
  _"Found changeset … for package sohl which is not in the workspace"_ and the
  release workflow stops before it releases anything. Listing the root keeps `sohl`
  a package Changesets can version.
  
  **Release path.** `release.yml` gains a publish step alongside the existing
  `@heroiclands/sohl-types` one, using npm Trusted Publishing (OIDC, no
  `NPM_TOKEN`), idempotent against an already-published version and
  `continue-on-error` for the same reason as its sibling. The package's `prepack`
  regenerates its `.d.mts` declarations from its own JSDoc.
- 2f6fd2d: **devops: the pack compiler is a library again, with the CLI on top of it.**
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
- b6f6d57: _Extract `BasePackCompiler` from the pack compilers (#1509)._
  
  The walk → filter by package and type → expand tables → convert wikilinks →
  build the entry → write JSON → count errors loop was written out once per pack
  pass — five times by the time this landed. It now lives once, in
  `utils/packs/base-compiler.mjs`, and the items, journals, actors, macros and
  scenes passes subclass it.
  
  **What a pass now states.** `selects(fm)` (which notes it claims) and
  `buildEntry(fm, markdown)` (one note → one document) are required; `prepare`,
  `skipNote`, `compileNote`, `onCompiled`, `finish` and the two report hooks cover
  the rest. Two static switches complete it: `requiresId` (a claimed note with no
  `id` is fatal, or merely skipped) and `convertsWikilinks` (whether the body
  reaching `buildEntry` is converted or exactly as authored — the macros pass
  needs the latter, because its `command` is executable source).
  
  **Why it matters.** A consumer needing a Foundry document type this toolchain
  does not ship now writes a subclass and registers it, rather than copying a pass
  and editing it. `utils/packs/map-notes.mjs` is deliberately not a subclass: it
  never walks the tree, and staying a pure translator is what keeps it
  unit-testable.
  
  Compiled pack output is byte-identical.
- 4d83368: **The pack pipeline no longer reaches into `src/`.** Three plain-ESM modules
  were shared between the build scripts and the runtime by a relative path that
  climbed out of `utils/` — an arrangement that resolves to garbage the moment the
  pipeline is installed as `@heroiclands/content-build` and runs from
  `node_modules`. They now live inside that package, and the runtime imports them
  back out of it.
  
  - `src/utils/default-item-art.mjs` →
    `@heroiclands/content-build/sohl/default-item-art`. Read by the items compiler
    and by `SohlItem.getDefaultArtwork`.
  - `src/entity/event/region-events.mjs` →
    `@heroiclands/content-build/engine/region-events`. Read by the map-note
    compiler and by `region-triggers.ts`. Engine-side rather than SoHL-side,
    because any content module that authors a scene region needs the vocabulary.
  - The affiliation standings the pack build validated an authored `relation` map
    against were **restated by hand** in `utils/packs/frontmatter.mjs`; they are
    now read from `@heroiclands/content-build/sohl/affiliation-standings`, held
    identical to the runtime's `AFFILIATION_STANDING` by a test.
  
  _Moving these, rather than injecting them through configuration, is the point._
  A one-line injection would have severed the import just as well and re-opened
  #932 — the drift where the builder had a default and the runtime did not. Each
  module is deliberately plain ESM so the bare-`node` build scripts and the
  bundled TypeScript runtime can read the **same** file; keeping one copy is the
  whole guarantee. Each is reachable as its own package entry point rather than
  through a barrel, so the client bundle never pulls a filesystem-reading compiler
  in to reach a frozen map.
  
  The package's `exports` grew the three leaf entry points, plus
  `@heroiclands/content-build/config` so a consumer can name the configuration
  contract's types from JSDoc.
  
  A new test fails the build if any module under `utils/packs/` imports out of
  `src/` again.
  
  (Closes #1510.)
- 20496b3: **devops: the pack-pipeline tests now live with the toolchain they exercise.**
  Twenty-six test files moved out of `tests/` and into
  `packages/content-build/tests/`, so `@heroiclands/content-build` is verifiable on
  its own rather than only in situ. Imports and paths were adjusted; no test was
  rewritten.
  
  **Two vitest projects.** `vitest.config.ts` declares `system` (`tests/**`, with
  `tests/setup.ts` and the `@src` aliases) and `content-build`, the latter by
  referencing `packages/content-build/vitest.config.ts` — the same file
  `npm test -w @heroiclands/content-build` loads, so a single root `npm run test`
  still gates everything and the two entry points cannot run different suites. The
  package's harness installs no Foundry globals and offers no alias onto a
  consuming repository's source; a new guard fails the build if a test in that
  suite reaches for either.
  
  **What deliberately did not move.** `src-import-severance.test.ts` asserts facts
  about _this repository_ — that its `utils/packs/` imports nothing from `src/`,
  and that the runtime and the build package still agree on default item art,
  affiliation standings, and the description-pointer rule. It moved to
  `tests/build/` instead, taking with it the one `item-docs` case that reads the
  runtime's own `descriptionLinkTarget`. `content-aliases.test.ts` covers a
  repository content lint with no pack-pipeline consumer, and stays.
  
  **New coverage** for the surface #1508 made configurable, asserted from a foreign
  layout in a throwaway tree: a consumer that relocates its content and manifest
  directories is honoured and the content walk reads the moved tree; the `_stats`
  identity is stamped from that consumer's configuration; the core version follows
  the manifest's `compatibility.minimum` with configuration untouched, proving
  config supplies a _path_ and never a captured value; and every path resolves
  identically whatever directory the build was launched from.
  
  Pack output is byte-identical.
  
  (Closes #1511.)
- 2121965: **The pack pipeline now lives in `@heroiclands/content-build`, and this
  repository consumes it by workspace path.** `utils/packs/` is gone (#1512).
  
  The extraction the epic set up (#1506–#1511) had produced a package with real
  barrels, a real configuration contract and the whole pack test suite — but the
  implementation was still the repository's own `utils/packs/` tree, which is the
  copy every downstream module was vendoring in the first place. There is now one
  copy.
  
  **What moved where.** The package's two halves are the split #1501 specified:
  
  | Half      | Holds                                                                                                                                                                                                                                                        |
  | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `engine/` | The content walk, frontmatter, tables, code fences, wikilinks, ids, folders, the link manifest and the web-address rule, `BasePackCompiler`, the generic Foundry document compilers (journals, macros, scenes), the pack generator, and compile/unpack/clean |
  | `sohl/`   | The item-type registry and its builders, the items and actors compilers, the default-art map, and the affiliation standings                                                                                                                                  |
  
  `@heroiclands/content-build/engine` exports nothing from `sohl/`, so an
  adventure module that compiles journals, macros and scenes never receives
  `buildWeaponGear`. Each module is also its own entry point
  (`.../engine/journals`, `.../sohl/items`), so a build that needs one thing does
  not load the pipeline.
  
  **One doc-carrying-type set, still.** `DOC_ENTRY_TYPES` — every type whose prose
  compiles into a JournalEntry of its own — is the set the journals compiler and
  the link-manifest emitter both read, and holding two of them is how a manifest
  comes to assert documentation nothing compiled. The _concept_ is now the
  engine's; the _membership_ is the consumer's, supplied as `itemBuilders` in
  `content-build.config.mjs` and composed exactly once inside `defineConfig`.
  Every reader takes it from there.
  
  **Configuration is located by walking up from the toolchain, not from the
  working directory.** `engine/pack-config.mjs` finds the consuming repository's
  `content-build.config.mjs` by climbing out of its own directory, which lands on
  the repository root from `packages/` and from `node_modules/` alike and does not
  depend on where the build was launched. A config file therefore imports
  `defineConfig` from `@heroiclands/content-build/config` — the leaf contract
  module — never from the package root barrel, which would close a cycle around
  its own evaluation.
  
  **Unchanged on purpose.** The Scene/Level integrity guard still reads each
  compiled pack back **off disk** after `compilePack` — it defends the write path,
  which is where `foundryvtt-cli` has lost Levels before (#1530/#1538), and a
  source-side schema check would look tidier while protecting nothing.
  `generatePacksJson` still runs the package-id guard first and folds the
  empty-pass guard in last.
  
  Emitted pack output is byte-identical to the pre-extraction build: all 2828
  files under `build/packs-json/` hash-match the #1501 baseline.
- 71b853b: Let a pack-only package publish a link manifest, by making `path` optional (#1516).
  
  The manifest made `path` **required** and `uuid` optional, so the format assumed
  every publishing package has a website. But a Foundry `@UUID` link resolves inside
  Foundry and owes the web nothing, so a module that ships compendiums and no site
  has an address for every document it publishes and no way to state it. The
  asymmetry was unintended: the header already carries `foundryPackage` as _"absent
  when the emitting build compiles no packs"_, and a pack-only publisher is that
  same case with the axes swapped.
  
  **Manifest version 5 — `path` is optional.** `name` is now the only required
  entry field, because it is the only one that is not an address. A note may have a
  web address, a Foundry address, or both, and the entry states the ones it has.
  
  **Whether a package publishes pages is a package-level fact.** `buildManifest`
  takes it from whether a base is passed; with none, no entry carries a `path`.
  Stating it once is what stops a web-publishing package from half-emitting, where
  the notes that quietly lost a `path` would degrade to unlinked prose in every
  consumer with nothing erroring anywhere. Consumers still tolerate a mixed file
  rather than rejecting it, so no future publishing profile has to relax that.
  
  **Consumers degrade instead of guessing.** The knowledgebase build renders an
  address with no page as the entry's `name`, unlinked, and does not fail — the
  address resolved, so it is not a typo, and it is not the author's fault the target
  has no web presence. Previously such an entry emitted `[Name](undefined)`: a link
  that renders and goes nowhere, which is the silent dead link the manifest exists
  to prevent. The pack build is unaffected, resolving through `uuid` and never
  reading `path`. A pack-only package also needs no `PACKAGE_BASE` entry, since a
  base exists only to resolve a `path` — but any entry that carries one brings the
  requirement straight back.
  
  **A consumer now declares the set of versions it can read.** A version exists to
  stop a file whose values _read differently_ from being resolved anyway, and that
  is all it may gate. Versions 1–4 each changed a reading, so each dropped its
  predecessors; v5 only permits an absent `path`, so every v4 value still means what
  it meant and is read as-is. Refusing it would have made a purely relaxing change a
  flag day — every package re-emitting on the same afternoon or every build breaking
  — which was the cost that made deciding this urgent while only two packages
  publish. The unsafe direction still hard-fails: a consumer meeting a version above
  its set rejects the file, because it cannot know what the newer shape permits.
  
  **`kethira` is unchanged, and for a reason worth separating.** It stays uncitable
  because nothing may depend on it — a licensing constraint, not a format one — and
  a manifest edge pointing into it is exactly such a dependency. Another module in
  the same technical shape may now publish one.
- 494613c: Make the credits page the single source for attribution, and correct what was published (#1518).
  
  Attribution was spread across five files that drifted independently. `README.md`
  carried a hand-maintained list of ~180 per-icon credits and the font notices;
  `assets/icons/game-icons/ATTRIBUTION.md` carried the Game-Icons table; the credits
  page added in #1517 pointed back at the README for the icon credits, which pointed
  nowhere useful. Two of the README's own licence links had been dead for some time:
  `./assets/LICENSE.CC-BY-SA-4.0` and `./LICENSE.GPLv3` do not exist.
  
  **The credits page is now canonical**, and the duplicates point at it rather than
  restating it — so there is nothing left to keep in sync and no generator to write.
  
  **The per-icon Noun Project credits moved** into the credits page, all 178 of them.
  They were the only record of who made those icons, so this is a move, not a
  deletion; the README would otherwise have pointed at a page that pointed back at
  the README.
  
  **Fonts are attributed for the first time.** The four families the system renders
  with — Cinzel, Cormorant Garamond, IBM Plex Mono and Signika — shipped with **no
  attribution anywhere**, despite the SIL Open Font License requiring the notice be
  retained. Every notice is taken from the `name` table embedded in the shipped
  `.woff2` itself, rather than from memory or a secondary source.
  
  **The three Hârnic-script fonts are removed** — Harn Lakise, Harn Runic, and
  Lankorian Blackhand — along with every claim made about them.
  
  Checking each notice against the `name` table embedded in the shipped `.woff2`
  showed the recorded attribution could not be relied on. The README credited the
  Lakise and Runic fonts to N. Robin Crossby, but neither file mentions him — both
  carry "by Amir El Habashy 1995" — which left the CC BY-NC-SA 3.0 AU licence the
  README also stated resting on the same disproved line. Lankorian Blackhand was
  likewise recorded as CC BY-NC-SA 3.0 AU while its file states the SIL Open Font
  License, a materially different grant.
  
  Rather than publish attribution whose provenance could not be established, the
  fonts go: three `.woff2` files and the three `@font-face` declarations that
  defined them. All three were **never applied** — no token, component, template,
  or manifest referenced any of the families — so nothing renders differently.
  
  The four typefaces the system actually uses are unaffected and now attributed for
  the first time.
  
  **`ATTRIBUTION.md` keeps its table.** It ships inside `assets/icons/`, so it
  travels beside the artwork it describes and remains the record that satisfies
  CC BY 3.0 for anyone receiving the files; it gains a pointer to the credits page
  rather than losing anything. `LICENSE.md` and the verbatim licence texts are
  untouched.
  
  Pointers out of the shipped tree are knowledgebase URLs, never repo-relative
  paths: `assets/content/` is not copied into the built system, which is how the
  README's two links came to be dead in the first place.
- a765692: Stop crediting Signika as a shipped typeface, and name what Foundry supplies (#1522).
  
  SoHL no longer bundles Signika — it relies on the copy Foundry loads — so a
  "ships the following typefaces" table listing it is no longer true. The row is
  removed.
  
  In its place the credits page names the two faces the interface uses but does not
  distribute, as Foundry's to license: **Signika**, its default interface font,
  which SoHL names in its own sans stack, and **Font Awesome**, which draws every
  icon glyph. The page is more honest for saying so — both are visible on every
  screen, and a reader looking for them would otherwise find nothing at all.
- a765692: Own SoHL's font stack instead of inheriting Foundry's by accident (#1523, #1522).
  
  Foundry assigns fonts to CSS variables and applies them with **unscoped element
  selectors** — `body { --font-h1: "Modesto Condensed" }` plus a bare
  `h1 { font-family: var(--font-h1) }`. Because `body` is the scope, those values
  inherit into every application window, SoHL's included, and any heading the system
  does not explicitly style renders in a face it neither ships nor chose.
  
  **Measured, not assumed.** Walking every heading in a live client across a Being
  sheet and four Item sheets: of **172 headings, 8 rendered in Modesto Condensed** —
  the skill sheet's combat-technique names. The other 141 non-serif headings only
  looked right because core's default happens to be Signika, the same family SoHL's
  sans token names. Correct by coincidence, not by decision.
  
  `scss/base/_foundry-vars.scss` — the block that already remaps core's `--color-*`
  variables onto SoHL tokens, scoped to `.sohl` so only our surfaces are affected —
  now remaps the font slots too: `--font-primary`, `--font-h1` through `--font-h6`,
  and `--font-serif`.
  
  **This owns the stack without restyling it.** The heading slots are mapped to the
  **sans** token, matching what they already resolved to, so the same 172 headings
  now report **0** in a non-SoHL font while Cinzel (4) and Cormorant Garamond (19)
  counts are unchanged — the SoHL rules that make those choices win on specificity
  and are untouched. Only the 8 leaking headings moved. Which headings take the
  Manuscript serif remains a design decision for the sheet redesign (§2.2: serif for
  wordmark, section legends and attribute names; sans for chrome and body).
  
  **The bundled Signika is dropped** — 5 `.woff2` files and 5 `@font-face`
  declarations, ~188 KB. Foundry bundles Signika as its default UI font and loads
  all five weights (300/400/500/600/700) through `CONFIG.fontDefinitions`, so the
  family resolves without our copy. Relying on core is a deliberate judgement rather
  than an oversight: dropping Signika would break every system that names it, so it
  could only land in a major release, loudly announced, leaving time to adapt or
  reintroduce it. `_typography.scss` records that where `$font-sans` is defined.
  
  Verified rather than assumed: with our copy removed, the same 172 headings still
  report **0** in a non-SoHL font and the identical distribution (149 Signika,
  19 Cormorant Garamond, 4 Cinzel). Every weight resolves from core's copy —
  `document.fonts.load("700 12px Signika")` matches two faces and both load, and a
  700 sample measures 171.0px against 167.6px at 400 and 186.8px in the generic
  bold fallback, so real Signika bold renders rather than a synthesized substitute.
- d2244a0: Stop the ledger's numeric columns and group headers from reading as subordinate to their own contents (#1526).
  
  Three settings inverted the visual hierarchy on every ledger-based tab.
  
  **Numeric cells were the smallest and lightest thing in the row.** `ledger__cell`
  carried `font-size: 0.92rem` and no weight, so it inherited 400 while the row
  label beside it (`ledger__name`) is Signika at 500 and full size. The data the row
  exists to convey read as less important than its label. Cells are now `0.96rem`
  at weight **500**, matching the label. The size step was never an optical
  correction — IBM Plex Mono's x-height (516/1000) is close to the sans it sits
  against, so nothing needed compensating.
  
  **A rollable cell jumped 300 weight units past its neighbours.**
  `ledger__cell--rollable` was 700 against an inherited 400, so an IMPACT value read
  as bold beside a plain ATK in the same row. Now **600** — a step up from the
  cells around it rather than a jump.
  
  **A subtype header was smaller than the rows it headed.**
  `section-legend--subtype` set its name to `0.92rem`, below the 1rem rows beneath
  it, so a weapon group ("Broadsword") or skill group got lost. The rule's own
  comment says it should sit "above the paper rows"; the value contradicted it. Now
  `1.06rem` at weight 700 — Cinzel is inscriptional caps and reads optically small,
  so it needs to clear the rows by more than a hair. This is the shared SubType
  header used by 7 templates, so every grouped list gains the same correction.
  
  **The held-item dropdowns did not match their own row.** A `<select>` inherits
  neither `font-family` nor `font-size` from its context — browsers apply a UA
  default of roughly 13.3px — so the weapon name read visibly smaller than the
  "Right Arm" label beside it. `held-item-select` now states both explicitly, and
  fills its 14rem ledger column rather than a fixed 150px, since the larger text
  needs the room and a full-width control cannot truncate.
  
  **The heading annotation was mono for no reason.** `section-legend__meta` — the
  "7 skill(s)" beside a group name — was mono with `tabular-nums`, on the assumption
  it held numbers. Four of its six uses are pure prose ("read-only", a movement
  unit, a shared-gear note), and the two that do carry a figure are inline counts.
  Mono earns its place in this system by aligning digits into columns; a count
  inside a heading aligns with nothing, so the face change bought no legibility and
  simply read as a different kind of text mid-line. It is now sans at 0.8rem,
  keeping the muted colour that marks it as subordinate.
  
  Not addressed here: IBM Plex Mono's dotted zero reads oddly beside Signika. The
  shipped subset exposes only `ccmp, dnom, frac, numr` and a single `zero` glyph —
  no stylistic sets, no plain-zero alternate — so `font-feature-settings` has
  nothing to switch to. That needs a re-subset or a different face.
- 5465f0a: Make the skill drag handle work — skills reorder within their group (#1528).
  
  Every skill row on the Being sheet's Skills tab rendered a grip handle, complete
  with a hover treatment, and dragging one did nothing. The affordance advertised an
  interaction the sheet did not provide, so it read as broken rather than absent.
  
  Nothing was wired to those rows: `BeingSheet` registered drag selectors for
  `.gear-list .item` and `.body-structure [draggable]` only, and the rows carried no
  `draggable` attribute, so Foundry's `DragDrop` never bound and the browser never
  started a drag.
  
  **A drag never re-parents.** A skill's group is its `subType`, so a cross-group
  drop clamps to the near edge of the skill's own group rather than moving it:
  
  | Drop lands in…                    | Result                                    |
  | --------------------------------- | ----------------------------------------- |
  | a group **below** the skill's own | sorted to the **bottom** of its own group |
  | a group **above** the skill's own | sorted to the **top** of its own group    |
  | the skill's **own** group         | ordinary reorder at the drop position     |
  
  Because every drop resolves to a defined position, the interaction cannot fail or
  bounce — no drop target needs disabling and no rejection state exists, which is
  why the drop selector is the whole tab rather than one group's ledger.
  
  The rule lives in `resolveSkillReorder`, a pure Foundry-free helper in
  `src/apps/logic/`, so it is exercised in Node rather than only through the DOM.
  Writing it first surfaced a real trap: dropping a skill **onto itself** is not the
  same as dropping it having missed every row. The latter means "the end"; collapsing
  the two would have shunted a self-dropped skill to the bottom of its group.
  
  **Skills now render in `sort` order.** `groupBySubType` was called without a
  comparator, so groups rendered in raw collection order — which meant the `sort`
  values a drag writes had no visible effect at all. Skills are now sorted stably by
  `sort` with a name fallback, the same treatment the attribute score boxes already
  get. Existing characters are unaffected: the sort is stable, so skills whose `sort`
  values tie keep their present order.
  
  A dragged group is renumbered whole rather than one row nudged, so `sort` values
  stay evenly spaced instead of converging.
- 18e6eee: **e2e: a restricted Region no longer throws out of a PIXI ticker headless.** A
  Region with `restriction.enabled` makes core flag its scene's shape constraints
  and defer the pass to a ticker callback, which picks a designated User with a
  predicate reading `canvas.scene.id`. Headless no scene is ever viewed, so
  `canvas.scene` is `null`, the callback throws `reading 'id'`, and whichever spec
  was running fails for reasons unrelated to it. Nothing in the system's code is on
  that stack — the defect is Foundry's, and core fixed it in 14.367 by reading
  `this.id` instead; the workaround stays because the suite's committed default
  pins `compatibility.minimum` (14.359), which still carries it.
  
  `cy.login()` now installs `guardHeadlessRegionShapeConstraints`, which makes both
  the public flag and its internal per-Region entry point inert whenever
  `canvas.scene` is nullish — the behaviour the flag should have had anyway, since
  shape constraints are perception state for a _viewed_ scene. That replaces the
  `getDesignatedUser`-qualified `uncaught:exception` allowlist entry, which is
  deleted: `reading 'id'` is far too generic a message to leave allowlisted, and a
  source-level guard cannot mask a real null dereference in system code. Covered by
  a `map-notes.cy.js` case that flags the fixture's restricted region and asserts
  no shape-constraint pass is attempted.
  
  (Closes #1535.)
- 9eaa650: **`sohl.worldHost()` can create its singleton again.** The reserved shortcode was
  `_sohlworld`, which the shape rule added in #1397 refuses — a shortcode is
  strictly alphanumeric, and nothing exempts a key the system writes itself. So the
  host actor was created through the same `(type, shortcode)` guard as any
  document, refused as malformed, and vetoed: `sohl.worldHost()` returned
  `undefined` for a GM, world-scoped scheduling had no document to hang off, and
  `sohl.addScriptAction(host, …)` failed on the missing document with
  `Cannot read properties of undefined (reading 'system')`.
  
  - The reserved code is now **`sohlworld`**, dropping the underscore rather than
    exempting it. This is also exactly what the 0.9.0 repair migration (#1397)
    produces from a host a v0.8 world already created, so an upgraded world keeps
    the one host it has instead of growing a second — no new migration.
  - `attachScriptAction` now names an absent document
    (``addScriptAction: `doc` must be a document carrying system data.``) instead of
    dereferencing it, since `sohl.worldHost()` legitimately yields `undefined` for a
    user who cannot see the host and callers pass its result straight in.
  - A unit test now asserts the system's own reserved keys satisfy the shape rule
    and that the migration's repair of a legacy `_sohlworld` lands on the code
    `worldHost()` looks up, so this class of defect cannot come back silently.
  
  (Closes #1536.)
- 9055d6b: **The pack build now fails if a shipped Scene has lost its embedded `Level`.**
  A v14 Scene keeps its map image on a `Level`, and a compiled pack stores the two
  under separate LevelDB keys — the Scene holding `levels` as an array of ids, each
  `Level` in the `scenes.levels` sublevel. Nothing in Foundry ties them together on
  read: a missing `Level` record only warns, the collection then reads as empty,
  and the next world launch persists `levels: []` and leaves `initialLevel`
  dangling. The map image is gone for good, and the only symptom is a blank
  battlemap.
  
  `build:compiledb` now reads each pack back off disk after writing it and refuses
  to ship one that violates the invariant, naming the scene. It checks the compiled
  bytes rather than the JSON they came from, because the gap it closes is the
  _write_ path — the emitter is already unit-tested, whereas the compendium CLI has
  previously mishandled Scene Levels. An `Adventure` carries its scenes inline,
  levels and all, so that second shape is checked too.
  
  **On the original report.** #1538 was filed as a Foundry 14.361+ migration
  defect that emptied shipped Scenes. It is not one: a well-formed pack survives a
  14.367 world launch and a full 135-spec suite with every `Level` and
  `background.src` intact, and the server-side Scene/Level migration code is
  byte-identical between 14.364 (which has a green suite on record) and 14.367.
  The reported state — `levels: []`, no sublevel records, `initialLevel` dangling —
  reproduces exactly, warning wording and all, when the `scenes.levels` records are
  already absent before Foundry reads them, and it reproduces on **14.359** as
  readily as on 14.367. So the core version was never the variable; the missing
  records were, and nothing anywhere asserted they were present. Now the build
  does.
  
  (Closes #1538.)
- 31d8cdd: **The e2e suite now runs on the oldest Foundry the system claims to support.**
  The test container was pinned to 14.367 while `compatibility.minimum` declared
  14.359, so nothing exercised the floor: a regression that broke the declared
  minimum while working on the newer build would have passed the suite in silence,
  and the compatibility claim was unfalsified by anything the project ran.
  
  - **Default track — the floor.** `DEFAULT_STAGE_VERSIONS` in
    `utils/foundry-container.mjs` now pins the `test` stage to **14.359**, matching
    `compatibility.minimum`. Raising it is henceforth a decision to raise the
    supported floor, taken together with `compatibility.minimum` in
    `assets/templates/system.template.json` — not a test-configuration tweak.
  - **Sweep track — the newest release.** `npm run e2e:sweep -- <build>` runs the
    full suite against any build, roughly weekly and before shipping, so breakage
    from a new Foundry release is caught by the suite rather than by a user. It
    takes the build as an argument and has **no default**: "the newest release" is
    not a constant the repository can hold without rotting, and a sweep's product
    is a citable result, which requires naming the build. It uses `e2e:full`
    because changing build requires a reseed — Foundry refuses to auto-launch a
    world stamped by a different one.
  - **`.env.local` still wins.** `FOUNDRYVTT_TEST_VERSION` overrides the committed
    default for any run, unchanged.
  - **`compatibility.verified` is now evidence, not aspiration.** It declared
    14.367 — a build the suite had never completed on. It now names the newest
    build the full suite has actually passed.
  - **`cy.login()` spans the supported range.** Foundry renamed the `/join` POST
    body field `userid` → `userId` in 14.367, so the harness's login read as
    `undefined` there and every spec failed its `before` hook with a 401
    `JOIN.ErrorUserDoesNotExist`. It now sends both keys — each build destructures
    the one it wants — which is a precondition for a policy that logs in on both an
    old floor and a new release.
  
  (Closes #1539.)
  
  (Closes #1537.)
- 9e19594: **Compiled pack documents stamp the version that built them (#1548)**
  
  Every compiled compendium document carried `_stats.systemVersion: "0.6.0"`, a
  hand-maintained literal the system had shipped past many releases ago. A
  document that under-reports its version is eligible for world migrations it does
  not need — the same defect a stale `_stats.coreVersion` had before it began
  following the manifest's `compatibility.minimum` (#1533).
  
  `content-build.config.mjs` now reads the version from `package.json`, the file
  Changesets bumps and `build:system` stamps into the shipped manifest, so the
  stamp follows the release instead of being transcribed. It stays a
  per-repository value rather than moving onto the shared toolchain: a module
  repository shipping SoHL content stamps the version of the _system_ its content
  targets, not its own package version.
  
  This rewrites the `_stats` block of every document in every pack.
- ac5146e: **A scene deleted mid-draw no longer fails an unrelated e2e spec (#1550)**
  
  Foundry 14.367 opened `updateRegionShapeConstraints` with a throw unless
  `this.persisted`, but left callers that cannot honour it. The canvas calls the
  `Scene` copy as the last step of its private draw, after a long run of awaits.
  The Cypress suite deletes the scenes it creates in `afterEach`, so a draw begun
  on a tagged scene routinely finished after that scene had left `game.scenes`.
  The throw then escaped as an unhandled rejection and failed whichever spec
  happened to be running, with no SoHL frame anywhere on the stack.
  
  `cy.login()` now installs `guardHeadlessRegionShapeConstraints`, which skips the
  call when the document reports `persisted === false` — recomputing region shape
  constraints for a document nobody can update has no work to do, which is what
  the caller assumed. The test is strict `=== false`, so a build without that
  getter runs core untouched and the pinned 14.359 floor is unaffected. Both
  `Scene` and `Level` are patched: `Level` has its own copy of the method (new in
  14.367) and throws from it before delegating to the scene, so the callers that
  address a level directly — the levels a moved token affects, and the equivalent
  light and wall updates — would otherwise still throw.
  
  A new spec, `scene-nonpersisted.cy.js`, pins this down rather than leaving it to
  the race that exposed it: the original failure is timing-dependent, surfaces only
  under the load of a full suite, and lands on a bystander spec rather than the one
  that caused it. The spec deletes a scene and invokes the same entry points the
  draw path does, requiring each one the build defines to be inert.
  
  A source-level guard rather than an `uncaught:exception` allowlist entry: that
  message is core's generic one for updating _any_ deleted document, so
  allowlisting it — even qualified by a stack frame — could mask a real bug writing
  to a document the system had already destroyed. Skipping one unreachable call can
  mask nothing.
  
  Test harness only; no shipped system behaviour changes.
- ebc1c3b: **`@heroiclands/content-build` now declares the packages it imports, so it works
  outside this workspace.** The package shipped with no `dependencies` block at
  all (#1557).
  
  Inside this repository that was invisible. The package is a workspace, npm
  hoists the root's `devDependencies` into the workspace root's `node_modules/`,
  and every import resolved. Installed from npm by another repository nothing
  hoists, and `content-build package compile` died on its first import.
  
  **What is now declared.** The eight packages the shipped code imports at
  runtime — `@foundryvtt/foundryvtt-cli`, `classic-level`, `loglevel`,
  `loglevel-plugin-prefix`, `markdown-it`, `unidecode`, `yaml` and `yargs` — plus
  `vitest` as a devDependency, which the package's own suite had likewise been
  borrowing from the root. Two of them, `markdown-it` and `yargs`, were not root
  `devDependencies` either: they resolved only because something else happened to
  pull them in as a transitive dependency, so the build rested on another
  package's dependency list.
  
  `package-lock.json` is regenerated in the same change — that is why the fix did
  not travel with #1512, since a stale lockfile makes `npm ci` refuse to install.
  No resolved version moved; the entries the package now owns simply stopped being
  marked `dev`.
  
  **A guard, so the manifest cannot drift again.**
  `tests/dependencies-are-declared.test.ts` reads the package's `files` field,
  walks every module it actually ships, and asserts that each bare specifier is a
  Node builtin, the package addressing itself, or a declared dependency — with the
  reverse checks too: nothing shipped may import a `devDependency`, and no
  declared dependency may go unimported. It is the counterpart to
  `suite-is-self-contained.test.ts`, which guards the same "passes in situ, fails
  when installed" failure from the test side.
  
  **`content-build --version` now reports its own version.** `yargs` defaults to
  the _nearest_ `package.json` walking up from the working directory, which in a
  consuming repository is the consumer's manifest — so the command reported the
  consumer's version rather than the toolchain's. It now reads the version from
  the package's own manifest.
  
  Verified by packing the package with `npm pack` and installing the tarball into
  a scratch directory outside the repository: `content-build --version`,
  `content-build --help`, and `import("@heroiclands/content-build/engine")` all
  succeed there, exercising every declared dependency.
- f256bcd: **A consumer's `itemBuilders` table is now the table the Item compiler
  dispatches through** (#1563).
  
  `defineConfig` accepts an `itemBuilders` registry and derives the accepted item
  types from its keys, but `sohl/items.mjs` called `itemBuilder(type)` against the
  **module-level** table in `sohl/item-builders.mjs`. A consuming repository
  therefore received the type whitelist it configured and the builders it did not:
  its notes passed the type gate and then compiled with SoHL's builders, or failed
  outright for a type SoHL has none for. The configuration was accepted,
  validated, and half-honoured.
  
  **The fix.** `engine/item-registry.mjs` resolves both halves from the one frozen
  configuration — `ITEM_TYPES` (the key set, re-exported by `item-docs.mjs` as
  before) and `itemBuilder(type)` — and the Item compiler reads both from there.
  The whitelist and the builder table are the same object, which is #1504's
  guarantee stated where it can no longer be bypassed. `sohl/item-builders.mjs`
  keeps only `ITEM_BUILDERS`, the data this repository hands to configuration; its
  shadow `itemBuilder` lookup is gone, so there is one dispatch path.
  
  The registry stays a **leaf**: the config file imports it, so reading the
  resolved configuration from there would close a cycle around the config's own
  evaluation. The table travels into configuration, and only modules no config
  file imports read it back out.
  
  _No output change._ SoHL configures exactly the table the package ships, so the
  compiled packs are byte-identical to the #1501 baseline — this is the seam a
  second consumer needs, latent for this repository.
- ec871b0: **The API documentation builds again.** `npm run docs` failed, taking the CI
  **Build API documentation** step — and therefore every open pull request — down
  with it, regardless of what the pull request changed.
  
  The implementation signature behind the `getItemLogic` overloads carried
  `@inheritDoc` _and_ its own `@param`/`@returns` block. `@inheritDoc` copies the
  whole inherited comment, block tags included, so the hand-written `@returns` on
  the next line was discarded — TypeDoc reported that as "Content in the
  `@returns` block will be overwritten", and `treatWarningsAsErrors` in
  `typedoc-html.json` turned the warning into a non-zero exit.
  
  The warning was accurate: one of the two comments was dead text. The local prose
  is the more specific of the pair — it documents the merged
  `(idOrShortcode, type?)` signature rather than the id-only overload above it — so
  it stays, and the `@inheritDoc` that was silently discarding it is gone. The
  escalation setting is untouched: the point of `treatWarningsAsErrors` is to catch
  exactly this, and suppressing it would have hidden the same defect everywhere else
  it occurs.
  
  (Closes #1605.)
- b922625: **The knowledgebase's API links resolve again.** `kb/data/api-symbols.json` maps
  each qualified symbol name to its API page URL so the knowledgebase can resolve
  `{@link sohl.*}` references without running TypeDoc. It was being emptied on
  every documentation build, and the copy in the repository had drifted.
  
  TypeDoc 0.28 moved URL ownership off the reflection and onto a router:
  `reflection.url` is no longer populated. The symbol-map plugin still read that
  property, so every symbol failed its `if (refl.url)` guard, the walk completed
  without recording anything, and a well-formed empty map was written — logged as
  "wrote 0 entries" at info level, with a zero exit code. Since `npm run docs` is a
  pre-commit gate, following it and committing blanked the file; the deploy job
  published the empty map for the same reason.
  
  URLs now come from `app.renderer.router` (`hasUrl` / `getFullUrl`), which is the
  supported way to ask for a page address in 0.28 and restores all 5405 entries.
  
  Two consequences worth naming. The regenerated map **corrects 875 URLs**: nothing
  had successfully rebuilt it since the 0.28 upgrade, so those entries still pointed
  at pre-0.28 disambiguated filenames (`…SohlContextMenu-1.html`) that the renderer
  no longer emits — links into the API site that could not land. And the plugin now
  **throws** if it resolves no symbols, or if the renderer exposes no router, rather
  than overwriting the committed file with `{}`; a silent success that produced
  nothing is what let this run undetected.
  
  (Closes #1610.)
- 3d7d55b: **`npm run build:icon-legend` no longer breaks the page it generates.** The
  generator and the file it owns had diverged, and the page's own header says _"do
  not edit by hand"_ — so the divergence could only ever be resolved by the
  generator overwriting work it knew nothing about. Running it failed
  `lint:content-aliases` and would have taken live links down with it.
  
  Four things had drifted, and all four are fixed in the generator rather than in
  the page:
  
  - **The `doc-iconlgnd` address alias was missing.** It is now derived from the
    same `type` and `shortcode` constants the generator writes into the
    frontmatter, so the three cannot come apart. This is the one that mattered:
    Obsidian resolves `[[doc-iconlgnd]]` against the literal string in `aliases`,
    so dropping it takes the page's address away in the editor where content is
    authored — and the link goes dead rather than erroring.
  - **`slug: "icon-legend"` was emitted.** Authored slugs are retired (#1278); a
    note's URL derives from its shortcode, no other content note carries the key,
    and nothing reads it. The generator no longer writes it.
  - **The "See also" links used the retired `[[doc/shortcode]]` slash form.**
    Obsidian reads a slash as a vault path, so each was a broken link in the
    editor. They are hyphen-qualified now, as every other note in the tree is.
  - **The prose was hard-wrapped.** Content notes are authored unwrapped and
    Prettier's `proseWrap` is `preserve`, so every run reflowed four paragraphs
    that nothing else in `assets/content/` wraps.
  
  The committed page needed no edit at all: with the generator corrected,
  regenerating it is a byte-for-byte no-op.
  
  **`lint:icon-legend` now keeps it that way.** `build-icon-legend.mjs --check`
  renders the page and compares it to the tree, failing with the first differing
  line — the same shape as `lint:expr-scopes` and `lint:type-catalog`. The drift
  this closes was visible only because someone happened to run the generator.
  
  (Closes #1620.)
- 9848d64: **Prettier compliance is now enforced, not honoured.** `npm run format:check`
  ran in no workflow and was in neither `npm run lint` nor `npm run build:noci`, so
  nothing checked it — and 32 committed files had drifted out of it.
  
  `lint:format` (`prettier --check .`) now runs **first** in the `lint` chain, and
  therefore in every build and every CI run. The 32 files are reformatted in a
  separate, behaviour-free commit so the whitespace is reviewable apart from the
  gate.
  
  All of the drift was one formatting rule moving: Prettier's layout for union
  types, which collapses a union that no longer needs wrapping onto one line. That
  is worth knowing because it will recur — `prettier` is declared as `^3.9.6`, so
  the installed formatter travels with the lockfile, and a minor that changes a
  layout rule invalidates files nobody edited. The gate turns that from silent
  accumulation into a one-line build failure, and the contributing guide now says
  to answer it with a reformat-only commit rather than folding it into unrelated
  work.
  
  The gate depends on #1632: until the generated `kb/` trees were excluded,
  `prettier --check .` failed with a `SyntaxError` on Hugo's minified HTML for
  anyone who had built the site, so this could not have landed reliably before it.
  
  (Closes #1621.)
- b289842: **Two lint gates for the checks Prettier structurally cannot make.** Prettier
  formats ~96% of the hand-written text in this repository and formatting is all it
  does — it will happily reformat a stylesheet whose class name has drifted out of
  the documented convention, or a page whose heading levels skip a rung. `npm run
  lint:styles` and `npm run lint:markdown` now cover that gap, and both are part of
  `npm run lint`.
  
  **`lint:styles` — stylelint over `scss/`.** The reason it matters is naming, not
  tidiness: `kb/dev-docs/concepts/css-architecture.md` publishes the `--sohl-*`
  custom properties as an extension surface module authors compile against, and
  fixes SoHL's class names to BEM. Neither had a guard, so a rename was an API break
  with nothing to catch it.
  
  - `selector-class-pattern` enforces BEM `block__element--modifier`, with the
    Foundry-owned classes SoHL selects on admitted as the plain kebab-case blocks
    they are.
  - `custom-property-pattern` enforces lowercase kebab-case everywhere, tightened to
    the `--sohl-*` namespace inside `scss/abstracts/` where the tokens are declared.
    It is looser outside that folder on purpose: the rule inspects `var()`
    references as well as declarations, and SoHL legitimately reads Foundry-core
    properties and its own template-set layout hooks.
  - The rest of `stylelint-config-standard-scss` — invalid and duplicate
    declarations, unknown properties and units, dead selectors — stays on.
  
  _Know its limit:_ the tokens are emitted by interpolation
  (`--sohl-color-#{$name}`), which stylelint skips as non-standard syntax, so
  renaming a key in a token map still renames a public property unguarded.
  
  **`lint:markdown` — markdownlint over every git-tracked `.md` file.** Nine rules,
  named individually: heading hierarchy (`MD001`), duplicate sibling anchors
  (`MD024`, `siblings_only`), broken table rows (`MD056`), and five link-correctness
  rules. `MD018` is deliberately absent — it reads a line starting `#1405) …` as a
  malformed heading, and this repository writes bare issue numbers constantly; so is
  `MD051`, already covered across files by `lint:doc-links`.
  
  **Both rule sets are deliberately narrow, and each config file carries the reason
  per rule.** stylelint's and markdownlint's defaults fire ~170 and ~74,000 times
  respectively on this tree, almost entirely on blank-line placement, value notation,
  line length, and list indentation — a second formatter's taste applied to bytes
  Prettier already owns, and satisfying it would mean exactly the cosmetic refactor
  this repository forbids. The test for adding a rule to either is whether it can
  report that something is _wrong_.
  
  Four real findings fell out and are fixed: three skipped heading levels
  (`Effect_Targeting`, `event-queue`, `build-and-deployment`) and a bare email
  address in the brand `NOTICE`. Three deliberate exceptions are annotated where
  they live rather than switched off globally — `clip` in the visually-hidden mixin,
  the hand-written `-webkit-appearance` on the checkbox reset, and ProseMirror's own
  `.ProseMirror` class. No compiled CSS changed.
  
  (Closes #1622.)
- 543aacc: **Type definitions now describe the Foundry version the system actually
  targets.** `fvtt-types` was pinned to a December 2025 commit resolving to
  13.346.0 — Foundry **v13** types — while the system declares v14 as its minimum
  and runs its suite against v14 builds. Types that describe a different major are
  worse than none: code type-checks cleanly and can still be wrong against the
  runtime it ships on, with the compiler reporting success.
  
  The pin moves to 14.366.0. Nothing about the shipped bundle changes —
  `fvtt-types` ships only declarations, and the bundler strips types without
  checking them — so the effect is confined to what the compiler can catch.
  
  **Scheduling gained a real guard.** v14 types `Document#uuid` as `string | null`,
  because an unpersisted document has no address yet, and the schedule mutators
  required a non-null `uuid`. That is the right requirement — a schedule _is_
  addressed by uuid: the event queue arms, finds, and unschedules entries by it —
  so rather than widening the contract or casting at the call sites, the entry
  points now accept the document as Foundry hands it over and narrow once, failing
  loudly when the uuid is absent. An unaddressable schedule can no longer be
  written: previously nothing checked the invariant, it was merely assumed by a
  type.
  
  (Progresses #1625.)
- 9848d64: **`format:check` no longer reports on generated files.** Prettier's
  `--ignore-path` defaults to `.gitignore` and `.prettierignore` **at the
  repository root**, and never reads a nested `.gitignore`. So the three trees
  `kb/.gitignore` ignores — `content/` (assembled by `build:kb-content`),
  `public/` (Hugo's output), and `resources/_gen/` (its resource cache) — were
  invisible to git and fully visible to Prettier.
  
  The result was that `npm run format:check` reported on what had been **built**
  rather than on what had been **written**, on an unchanged working tree: clean
  before a knowledgebase build, 735 warnings after `build:kb-content`, and — after
  `build:kb` — not a report at all but a hard `SyntaxError` on Hugo's minified
  HTML, which aborts the run and masks every real finding behind it.
  
  All three are now restated in `.prettierignore`, where they take effect. A new
  build test walks every nested `.gitignore` Prettier can reach and fails if a tree
  ignored there is not excluded here too, so a fourth cannot repeat this.
  
  (Closes #1632.)
- f73d5f0: **The build scripts read `@heroiclands/content-build`'s configuration through its
  accessors.** The package used to resolve its configuration at module scope, which
  is why no module could be imported — and the CLI could not report its own version
  — without a consumer config present. Fixing that turned five constant exports
  into functions, because an ES module's `export const` is snapshotted when the
  module evaluates and four of the five are strings or Sets.
  
  This repository still imported the old names, so moving the pin past that release
  failed at the first import with `does not provide an export named
  'CONTENT_PACKAGE'` — before the build did anything at all.
  
  `build-system-json`, `build-link-manifest` and `build-kb-content` now call
  `contentPackage()`, `foundryPackageId()` and `packRouter()`, each resolved once
  at the top of the script: these are build entry points, which always have a
  config, so there is nothing to defer. The three developer-doc pages that named
  the old symbols name the accessors instead.
  
  (Closes #1636.)
- 4513ae9: **`SuccessTestResult` publishes with its class description again.** The API site
  listed the class every d100 roll-under test resolves into with nothing but its
  members — no prose saying what it is, when it is produced, or how it evaluates.
  
  The description was never deleted. `VALUE_DIAMOND_SCALE` and
  `toValueDiamondMarks` were introduced between the comment and the
  `export class` line it documents, and a doc comment separated from its
  declaration by another documented declaration attaches to neither — TypeDoc drops
  it, and `jsdoc/require-jsdoc` reported the class as undocumented. The two Value
  Diamond exports now sit above that comment instead of inside the gap, which
  restores adjacency without rewriting a word of the prose.
  
  The two module-private helpers in `description-link.ts` (`withoutTags`, `tidy`)
  also gained the `@param`/`@returns` their existing summaries were missing. With
  those, `npm run lint:eslint` is clean — the five warnings it had been emitting on
  `main` are gone.
  
  (Closes #1649.)
- 1ff6bb2: **Make `npm run changeset:check` actually check for a changeset**
  
  Fixes [#1654](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1654):
  the script ran `changeset check`, which is not a Changesets command and never has
  been — every invocation exited 1 with `Invalid command check was provided`, while
  two developer docs told contributors to run it.
  
  - The script is now `changeset status --since=main`, which exits non-zero when the
    branch changes something but adds no changeset — the behaviour the docs claimed.
  - `--since` is what makes it a check: a bare `changeset status` counts the
    changesets already on `main` and passes regardless of what the branch did.
  - Documented in _Writing Changesets_ that the repository is a single package, so
    the check cannot distinguish a `chore/*` branch from a `feat/*` one and will ask
    for a changeset on any change.
- 3fdca88: **e2e: the #1535 map-notes case now tests the state it names.** It opened by
  requiring `canvas.scene` to be `null` — "no scene is viewed headless" — one line
  after importing an Adventure, and failed on every build and every world. The
  premise was wrong, not the timing: the seeded test world ships an **active**
  default scene (`utils/seed-test-world.mjs`, #451), which the client views at
  load, so `canvas.scene` is a live Scene throughout a run. Headless suppresses
  _rendering_; it does not leave the canvas without a scene.
  
  Because that assertion failed first, nothing downstream of it ran, and the case
  never reached the guard it was written for — with a scene viewed, the #1535
  clause of `guardHeadlessRegionShapeConstraints` does not engage at all. The case
  now presents the state instead of assuming it: it shadows `canvas.scene` for the
  duration of the flag (the handle `scene-nonpersisted.cy.js` already uses for the
  sibling #1550 defect), and asserts both directions — with a scene viewed core's
  pass runs, with none viewed it is inert. Removing the guard's clause reproduces
  the original `reading 'id'` crash in this case, which the previous version could
  not do.
  
  The guard itself is unchanged and stays: `canvas.scene` is `null` before the
  first draw completes and in any run whose active scene is absent or unviewed. Its
  rationale, the sibling spec's, and the testing gotchas are corrected where they
  stated that no scene is ever viewed.
  
  (Closes #1661.)
- 3849336: Mark an unresolved wikilink on the knowledgebase, as the pack build already does
  in Foundry (#1665).
  
  A link whose target no package publishes now renders as
  `<span class="sohl-unresolved-link" title="Unresolved link: …">` on the website
  too, keeping the author's text so the sentence still reads. Previously it
  degraded to bare prose, indistinguishable from the words around it — and since
  every authored address carries a label, a dead link and a working one rendered
  identically, with the missing href the only difference.
  
  A **resolved** address whose package publishes no pages is deliberately left
  unmarked: the address is real, there is simply no page to link to.
  
  **Also fixes two silent corruptions this exposed.** The knowledgebase build's
  code-protection helper carried its own idea of what counts as code, and it was
  weaker than the pack build's in two ways — a single-backtick span could run
  across paragraphs, so one odd backtick mispaired every span after it, and only
  three-backtick fences were recognised. Both mangled `content-links.md`, the page
  whose subject _is_ the link syntax: its `[[Grukar-ahk]]` example had been losing
  its brackets, and the ` ```` `-fenced example leaked. The helper now shares
  `codeRegions` with the pack compilers, so the two builds cannot disagree about
  what is verbatim, and it moves to `utils/kb-protect-code.mjs` so the rule can be
  tested at all.
- 03956c5: **Bundled icons that stated their colour in a `style` attribute now theme in
  dark mode.** The build injects a `prefers-color-scheme` fill swap into every
  icon under `assets/icons`, and deliberately declines any file whose shapes carry
  an inline `style="…fill:…"` — an inline style beats the injected rule, and a
  half-recoloured icon is worse than an untouched one. Forty-five icons were
  authored that way and shipped black on the dark compendium and directory
  windows, whose `<img>` thumbnails SoHL's `.sohl`-scoped CSS cannot reach.
  
  The guard is right, so the fix is in the source files: each of those icons now
  states its colour as a `fill` attribute, the shape `game-icons/**` already had.
  The rendered artwork is unchanged — a `fill` attribute and a `fill:` declaration
  name the same colour, verified pair-by-pair against the previous files — and the
  sources stay pristine black-on-transparent for the knowledgebase and website.
  
  **Five default item and actor arts were among them**, so those types showed a
  black icon before anyone picked another: `skill` (`other/head-gear.svg`, the
  default for 73 notes), `mystery` (`other/sparkles.svg`), `mysticalability`
  (`other/hand-sparkles.svg`), `attribute` (`other/user-gear.svg`), and
  `affiliation` with `cohort` (`other/people-group.svg`). The issue named four,
  one of which — `affliction` — has since moved to a Game-Icons default that
  already themed.
  
  **The guard now keys on the `fill` property rather than the substring.** It
  matched `\bfill\b` anywhere in a style attribute, which also catches
  `fill-rule`, `fill-opacity` and `paint-order: fill` — none of which set a
  colour. Those are exactly what a converted file retains, so without this the
  rewritten icons would have kept being skipped.
  
  **`tests/build/icon-theming.test.ts` is the standing gate.** It walks every
  bundled `.svg`, fails on any the injection declines, and separately requires
  every `ITEM_METADATA` / `ACTOR_METADATA` default art to theme — so a newly added
  icon carrying inline fills fails there instead of shipping un-themed. It carries
  one allowlist entry, `other/mantle.svg`, which is drawn entirely in strokes and
  cannot be themed by a fill swap at all; stroke theming is #1687.
  
  (Closes #1677.)
- 467bb36: **Fixed: the release job could not package a build.** `npm run build:pack-release`
  failed at _import_, before writing a byte — `archiver` 8 is pure ESM and exports
  classes rather than a default factory. The release workflow runs that script and
  uploads the archive Foundry installs from, so no release could be cut; nothing
  else imports it, so every other build, lint and deploy path passed while it was
  broken (#1683).
  
  Two further defects in the same step are fixed with it. The packaging returned
  once the archive had finished _appending_ entries rather than once its bytes had
  reached disk, so a fast-enough run hid a truncated archive; and a recoverable
  archiver warning was ignored, yielding an archive that was not the tree that had
  been asked for, silently. Both now fail loudly.
  
  Staging a package — copying its assets, clearing the build tree, and archiving it
  — also moves into the shared `@heroiclands/package-build` toolchain, so a listed
  asset path that does not exist now fails the build instead of shipping a package
  that quietly lacks its localization or its templates.
- 37af8d1: **Five build wrapper scripts are gone, replaced by `@heroiclands/package-build`'s
  command line.** They contained no logic — only the boilerplate a code file needs
  in order to state a literal, and every value in them is now configuration:
  
  | Was                                 | Is                             |
  | ----------------------------------- | ------------------------------ |
  | `node utils/clean.mjs`              | `package-build clean`          |
  | `node utils/copy-assets.mjs`        | `package-build assets`         |
  | `node utils/check-lang.mjs`         | `package-build lang check`     |
  | `node utils/pack-release.mjs`       | `package-build release`        |
  | `node utils/push-stage.mjs <stage>` | `package-build deploy <stage>` |
  
  Every script name is unchanged, so `npm run build:assets`, `npm run lint:lang`,
  `npm run push:qa` and the rest behave exactly as before — including the
  release workflow, which invokes `build:pack-release` by name.
  
  `utils/push-stage.mjs` had hard-coded `packageKind: "systems"` and
  `packageId: "sohl"` beside a configuration that already declared both; the CLI
  reads them from where they were already written. The asset table, the
  localization glob and the guidance printed after a lang failure all move into
  `packageBuild:` in `content-build.config.yaml`.
  
  The one genuine piece of code stays here: `utils/svg-theme.mjs` now exports the
  `transform` hook the CLI calls, so every staged SVG is still recolored to follow
  the Foundry theme.
  
  Nothing shipped changes. Staging the assets both ways produces 4,703
  byte-identical files.
- 3c76c28: Correct every armour article's covered locations against the Armour & Clothing Articles
  table, and add a guard so the class cannot recur.
  
  **How it was verified.** The table's price column is a checksum for coverage: an article
  costs its covered fraction of the body times the material's base rate, with one-sided
  coverage at half because it is half the material. Cloth Cap 4 = 0.04 × 100, Coat 64 =
  0.64, Robe 79 = 0.79, and so on across all nine materials. That makes each article's
  correct coverage an arithmetic fact rather than a reading of the grid.
  
  Checked that way, 29 material/article combinations were wrong, affecting 65 articles.
  All now match: **200 of 200** verified against the checksum.
  
  The recurring faults were a Sleeved Tunic missing its forearms, Breeches and Leggings
  wrongly including the pelvis, an over-covered Surcoat, a Hauberk and Sleeved Byrnie short
  of the mark, and — throughout gambeson — a missing neck, which the table gives every
  gambeson article.
  
  **Two coverage bugs fixed with them.** The Gambeson Shirt and Coat listed torso locations
  in both the flexible and the rigid list, so those locations were counted twice and the
  protection applied twice; the Coat also had its thighs marked rigid. All five Ring
  articles recorded their coverage as flexible, though ring mail is rigid like the other
  metal armours.
  
  **A guard.** A content spec now fixes three rules: the two lists never overlap; rigidity
  follows the material, with gambeson alone mixed — rigid over the torso, flexible on the
  arms and neck; and every article the table prices matches the checksum. Note that the
  plain grade of leather is **rawhide**, with "Leather" a better grade at twice the price,
  so the checksum is applied against rawhide.
  
  **Ring becomes a real material.** The source table has no ring mail at all, so its five
  articles had nothing to price against. Ring is now defined against mail — a tenth cheaper
  and a fifth heavier, giving a base rate of 1350 and a base weight of 54 — and all five
  articles are priced from it.
  
  **The articles SoHL adds beyond the table** are brought onto the same footing. Each
  material has grade multipliers that its table-priced articles establish exactly: homespun
  at 0.30 of the plain rate, linen 0.50, serge 0.60, russet 1.20, worsted 2.41, velvet 3.51,
  silk 9.00; rawhide 1.00, leather 2.00, beaver and sealskin 3.00, ermine 6.00. Applying
  those to the 84 added articles that were priced independently puts every article in the
  tree on one rule: coverage × the material rate × the grade.
  
  Straw is priced as cloth at a quarter, which the table does not cover.
  
  **Encumbrance and perception** are reconciled with the table's ENC column. Fourteen arm
  pieces carried 1.67 — five thirds — standing in for the rule that three or more arm
  articles cost ENC 5 between them. That is only correct at exactly three: one piece charged
  1.67 and five charged 8.35. Those are now 0, which is what an arm piece costs on its own.
  
  Worn armour contributes no weight, so its ENC value is its entire cost — an arm piece worn
  alone is genuinely free, which is what the rule says. That makes applying the threshold
  the whole of the mechanic rather than a refinement of it, and it is tracked separately.
  
  Perception penalties already matched throughout, including the great helm's −10.
  
  Part of #1336. Cloaks are corrected separately; the encumbrance column remains open there.
- 3c76c28: Correct eight armour prices and weights against the Armour & Clothing Articles table,
  and add the two plain helms that were missing.
  
  Cloth Gauntlets were priced at 20d against the table's 5d, and the base leather Gauntlets
  at 30d against 20d. The base leather Shoes were 35d / 1.5 lb against 28d / 1.1. Both
  breastplates were a tenth of a pound light.
  
  The Mail Vest and the Mail Sleeved Byrnie carried the **Scale** article's figures — 240d
  / 13.2 and 400d / 22.0, which are exactly Scale's numbers — instead of their own 360d /
  10.8 and 600d / 18.0. Every other Mail and Scale row is correct, so it was an isolated
  copy rather than a systematic swap.
  
  **Kûrbúl Helm** (20d / 3.0) and **Plate Helm** (80d / 3.0) did not exist; the tree had
  only the 3/4-Helm and, for plate, the Great Helm. Both are plain skullcaps covering the
  crown alone, and neither carries the perception penalty a fuller helm does.
  
  Verified by transcribing the table's price and weight columns and comparing all 92 rows,
  81 of which already matched.
  
  Part of #1336 — the price and weight criteria only. The location grid, the
  encumbrance column and the Ring question remain open there.
- da33427: Put Basic Folk on the baseline the injury model is calibrated to
  ([#1249](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1249)).
  
  `BASE_INJURY_THRESHOLDS` says the master table is "calibrated for a baseline
  human body (STR ≈ 11)", and the body-scale rule divides by 11 for the same
  reason — but Basic Folk, the actor that exists to _be_ that baseline, carried
  every attribute at 10. Its body scale only read 1.0 because `bodyScaleBase` was
  hard-coded to 1 rather than derived like every creature's.
  
  Every attribute is now 11, so a body scale of 1.0 falls out of `STR ÷ 11`
  instead of being asserted. Its twenty-seven embedded skills derive their Skill
  Base from the attributes and move with it, and body weight — a
  `(9 × str) + 50` expression — goes from 140 to 149 lb, which brings it into
  agreement with the 68 kg its own descriptive traits already claimed.
- 77ad955: **Reclassify the phobia compendium items as Fear traumas (#1229)**
  
  All 78 phobia items shipped as Trauma `subType: psycond` with `category: impulse` —
  a value from the `quirk`/`impulse`/`disorder` scale, which is the wrong scale for a
  phobia. They are now `subType: fear`, shipping in the baseline `category: none` state
  with `levelBase: 0`, so a phobia can express the fear states that actually drive its
  behavior (`none` / `brave` / `steady` / `afraid` / `terrified` / `catatonic`).
  
  **Folder tree**
  
  The items compendium gains a **Fear** folder under **Trauma**, and the existing
  **Phobias** folder now sits beneath it rather than under **Psychological**:
  
  | before                           | after                       |
  | -------------------------------- | --------------------------- |
  | Trauma → Psychological → Phobias | Trauma → **Fear** → Phobias |
  
  _Acrophobia_ was additionally filed under **Quirks** rather than **Phobias**; it now
  sits with the other 77.
  
  **Upgrading**
  
  Existing worlds are unaffected — phobia items already dragged onto an actor keep
  whatever subtype and category they were created with. The reclassification applies to
  the compendium content, so re-import a phobia to pick up the new values.
- eff20b1: Write the Combat chapter of the rules (#1292)
  
  `Melee_Attacks`, `Missile_Attacks` and `Unarmed_Combat` were one-word stubs, so
  the most rules-intensive part of the game could not be learned from the rules at
  all. All three are now written, the chapter introduction is expanded into a
  spine, and a new **Attack Resolution** page carries the contest the three share.
  
  **Attack Resolution** _(new)_ — the attack/defence exchange as an Opposed Test:
  the attack test and what modifies it; the four defences (Block, Counterstrike,
  Dodge, Ignore) and what each tests; who lands a blow and by what margin; Tactical
  Advantages and the four kinds; mishaps and weapon breakage; aiming by Zone Number
  and zone die; impact, aspect and protection; and the handoff into Trauma —
  injury, shock, and Morale, with the combat triggers for a Morale Test named.
  
  **Melee Attacks** — reach and the engagement zone; grip and required body parts;
  the four defences at contact; the Strength Impact Modifier; manoeuvres and the
  Strength Trial; and how posture, impairment, fatigue and shock bear on the roll.
  
  **Missile Attacks** — the missile sequence; Archery, Throwing and Sling, and the
  crossbow's untrained rule; the three range bands (point blank, direct, volley)
  with their zone dice and impact; aiming at distance; which defences a missile
  admits, and deliberate evasion; why launchers take no Strength bonus; and misfire.
  
  **Unarmed Combat** — combat techniques as strike modes; the folk roster with
  impact, zone die and reach; why four of them describe anatomy and four describe a
  rule; the Strength Trial behind Grab, Press and Trip; Limb Block; and the
  attacker-armour and off-side rules.
  
  **Strike Modes** — two missile properties were described wrongly and are
  corrected against the weapon data: **Draw** is the pull the weapon demands, not a
  reload time, and **Volley multiplier** is how far past base range a lobbed shot
  reaches, not a rate of fire. Its headings are also anchored, so its later
  sections page separately instead of being absorbed into the preceding one.
  
  Written system-free, from the implementation but restated as table rules. Where
  the two disagreed the rules were followed and the divergence filed separately.
- e757b76: **This repository declares its build in `content-build.config.yaml`.** The
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
- ed06510: Point three craft cross-references at Weaponcraft's rules rather than its sheet
  ([#1366](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1366)).
  
  Textilecraft sends the reader to the armour-making routine; Metalcraft and
  Woodworking send them to the weaponmaking routine. All three linked
  `[[skill/wpnc]]`, which addresses the Weaponcraft **item** — following one opened
  a sheet of numbers instead of the rules the sentence was pointing at.
  
  Each now uses `[[docskill/wpnc#crafting]]`, the address for that item's
  documentation, landing on the Crafting page that actually carries those routines.
  
  The anchored form was written this way first, then backed out, because it
  compiled to a UUID under the items pack and dead-ended — the defect since fixed.
- 16b04d5: **Cross-package links resolve through a published manifest** (#1446)
  
  A note addressing another package — `Rules/Bestiary.md` links six Thalorna
  creatures — had no way to resolve, because nothing in `[[type-shortcode]]`
  separates a legitimate cross-package reference from a typo. Both degraded to
  plain text, and the dead-address guard had to stay off or correct content would
  have failed the build.
  
  - _Each package publishes a manifest._ The knowledgebase build emits
    `build/manifests/<package>.json`, mapping every addressable note's
    `type/shortcode` to the `{ url, name }` a link needs. Another package vendors
    it into `assets/manifests/` and resolves into it — including types this build
    has never seen, which are seeded so the address is recognised at all.
  - _The guard returns when it becomes correct._ While any package in
    `LINK_PACKAGES` is neither built here nor vendored, an unresolved address is
    still tolerated and the build says so. When the last manifest lands the check
    turns itself on: an address resolving in no package fails. Derived from the
    data, not a flag, so it cannot be forgotten.
  - _`FOREIGN_ADDRESS_ALLOWLIST` is superseded._ `check-content-links` consults
    manifests first and stops honouring the list once they are complete, reporting
    every entry as stale to remove.
  - _`kethira` is excluded by design._ It publishes no pages and must stay
    withdrawable, so it neither emits a manifest nor is a citable target.
- 96a4c67: **Where cross-repository work is tracked, and what "done" means for it** (#1400)
  
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
- 7b72dca: Fix two broken references surfaced by auditing what the knowledgebase links.
  
  **Navigation** — the brand nav's _Song of Heroic Lands_ entry pointed at
  `/projects/sohl/`, which has never been a published address; the page is
  `/projects/song-of-heroic-lands/`, derived from its name. The entry returned a
  genuine 404 in production, and since every site renders the same nav, it did so
  from the knowledgebase too. The near-miss `/projects/sohl.md/` is a real legacy
  address and keeps its redirect — it is simply not what the nav should advertise.
  (#1475)
  
  **Mystical Abilities collection** — the `sohl` package's collection note opened
  its _Arcane Incantation_ section with a link to a `thalorna` document, which the
  `sohl` content tree cannot resolve. It emitted an unresolved-wikilink warning on
  every pack build and made a `sohl` page depend on another package. The `sohl`
  package ships no arcane incantations, so the section now carries the same
  package-scoped query every other section on that page uses.
- a89c23a: Show a pointer description's target on the item sheet's Description tab
  ([#1357](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1357)).
  
  A description that is only a link is a **pointer** — the item's description
  lives at the target. Output Description to Chat has followed one since
  [#1356](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1356),
  but the Description tab did not: opening such an item showed a bare link in an
  editor, so the description was two clicks away and the tab looked empty of
  content.
  
  The tab now shows what the link points at, read-only, with a **pencil** in the
  upper right that reveals the editor holding the link — so the description can
  still be re-aimed or replaced with prose, and the reader never meets the
  machinery. The icon becomes an open book to switch back, and closing the sheet
  returns to reading. An ordinary description is unchanged: the editor, directly,
  with no toggle.
  
  A pointer whose target will not resolve shows the broken link rather than an
  empty tab, matching how the chat card degrades, and links inside the shown text
  stay live so a reader can still open the page itself.
  
  **Presentation only** — nothing about what counts as a pointer changed. The
  convention is now documented end to end (write, read, edit, post) on the **Base
  Item** page of the user guide, which it was not before.
- f49b196: Check the developer docs' links, and repoint the twenty-five that were broken
  ([#1364](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1364)).
  
  `kb/dev-docs/` links by relative path — the tree is read in the repository and on
  GitHub as much as on the knowledgebase, and a path is what those renderers
  follow. Nothing validated those paths: `check-content-links` scans
  `assets/content` only, so the whole developer tree was unchecked.
  
  It had rotted accordingly. The `docs/` → `kb/dev-docs/` move left every
  repo-root-relative link one directory too high, and nobody noticed because the
  symptom was invisible in both places it mattered: on the knowledgebase the link
  became `…/blob/main/kb/src/…`, a GitHub 404, and in the repository it simply
  pointed at nothing. Twenty-two links were off by that one level. Two more named
  `templates/effects/`, a directory that is `templates/effect/`, and one pointed at
  `assets/content/Corpora/Human_Folk.md`, a note removed when the Corpus concept
  was retired — now the Basic Folk character that carries the body structure
  today.
  
  `npm run lint:doc-links` (in `npm run lint`) now fails on a relative link whose
  target does not exist, and on an `#anchor` no heading in the target declares. It
  matches GitHub's slug rules, including the details that trip a naive
  implementation: runs of whitespace are not collapsed, so dropping an `&` leaves
  `player--gm-rules-external` with two hyphens, and a code span inside a heading is
  part of the text the anchor derives from.
  
  Wikilinks remain unavailable in the developer tree, deliberately: they resolve by
  `(type, shortcode)` from a note's frontmatter, which these pages do not have, and
  they would not render in the repository or on GitHub. The reference page on
  [linking between content notes](https://www.heroiclands.org/sohl/kb/dev-docs/reference/content-links/)
  now says so explicitly, and names this check as what keeps a path honest.
- e947411: Fail the build when a vendored link manifest cannot be addressed (#1664)
  
  A cross-package `[[type-shortcode]]` is resolved through a key this build
  derives, and the manifest is written with a key the _publishing_ build derives.
  When those shapes drift apart the lookup cannot match on any input — and because
  an unresolved wikilink falls through to its own display text, every page still
  reads correctly and nothing reports a thing.
  
  **What changed**
  
  - `unaddressableForeignPackages` reports any foreign package that contributes
    manifest entries of which _none_ yields a readable canonical key, and both
    `build-kb-content` and `check-content-links` now fail on it. Partial drift is
    deliberately not reported: it resolves something, and the rest surfaces as an
    ordinary dead address pointed at the note that cites it.
  - The finding is reported through `lint-diagnostics` as
    `file:line:column: error: message`, locating the offending key in the manifest
    itself, so the diagnostic names the file at fault rather than the notes that
    cite it. The position is dropped rather than guessed when the key cannot be
    located.
  - Removed the dead slash-splitting type seeding left behind in
    `check-content-links` when keys became canonical; foreign types are seeded
    from the manifest entries themselves.
  
  A manifest that publishes no entries is not a finding — a pack-only package
  publishes no addressable pages by design, and one being brought up publishes
  nothing yet.
- 44f5feb: Give the Cave and Forest Goblins the same body structure as Grukar-Uk — the
  six-zone anatomy, with head and arms sharing zone numbers 1–2, the torso
  3–4 and the legs 5–6, and its per-location natural armour. Both previously
  carried the human plan's fifteen zone numbers and bare skin. Nothing else on
  either goblin changes.
- b23c944: Bring Grukar-Hai Strength down from 21 to 16
  ([#1247](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1247)).
  
  Human Strength is rolled on `3d6`, so it runs 3 to 18 — **18 is the strongest a
  human can possibly be**. At 21, on a frame the entry puts at 5.5 to 6.5 feet,
  every Grukar-Hai was stronger than any human who has ever lived, at the same
  height. They were also far out of step with their own kin (Ahk 13, Uk 12, Sha 6).
  
  At 16 a typical Grukar-Hai is stronger than 95% of humans and still the
  strongest of the Grukar by a clear margin, and the species tops out at 19 on its
  roll formula — just past peak human, which is the right shape for a warrior
  species.
  
  Strength cascades, so all of it moves: body scale 1.91 → 1.45, the Punch
  technique `d6+3` → `d6+0`, Shock 50 → 43, and the roll formula to `1d6+13`.
  
  Grukar-Uk drops 12 → 11 and Grukar-Sha rises 6 → 9. Sha at 6 was frailer than a
  child; at 9 it is still the weakest of the four without being feeble. Body scale
  follows to 1.0 and 0.82, and Sha's Punch goes `d6-5` → `d6-3`.
  
  Both also had their six creature skills carried over wholesale from another
  species' stat block rather than derived from their own attributes, which left
  them describing a creature neither of them is. All six now follow the same fits
  the animals use. Uk, whose Perception, Aura and Will are 7, 5 and 6, drops
  sharply — Awareness 55 → 35, Initiative 50 → 24, Dodge 50 → 28, Shock 55 → 30.
  Sha, the clever and frail one at Perception 16 and Reasoning 17, gains where it
  should and loses where it should: Awareness 55 → 75, Stealth 40 → 65, Dodge
  50 → 56, Shock 55 → 20.
- 44f5feb: Give the Helthraals and the Nightwights the human body plan
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  Both already carried the human parts and hit locations, but **every zone weight
  was 0** — a zone of weight 0 claims no zone numbers, so each had a
  `maxZoneNumber` of 0 and no blow could resolve a hit location on either of
  them. They now take Basic Folk's structure, zone numbers 1–15, and a body scale
  derived from their own Strength rather than a flat 1.0. Their items are left
  alone.
  
  Both move out of the specification's no-anatomy allowlist and are now checked
  like every other creature.
- 19fca92: Hoist the pack pipeline's hardcoded constants and paths into configuration (#1508)
  
  Everything the compendium build knew about _this_ repository's layout is now
  declared in one file at the repository root, `content-build.config.mjs`,
  validated by `defineConfig` from the shared `@heroiclands/content-build` package.
  Nothing under `utils/packs/` spells a path, a package name, or a pack list of its
  own.
  
  **What became configuration**
  
  | Was                                                                                                       | Now                                                                                                         |
  | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
  | `SOURCE_PACKS` and `PACK_CONFIGS` — two lists that had to agree                                           | one `packs` list; the compile order is derived from it as `packDirectories`                                 |
  | six working-directory-relative paths across three modules                                                 | `paths`, each resolved against an absolute `rootDir`                                                        |
  | `path.resolve(dest, "..", "items")` — an unwritten sibling-directory contract                             | the actors compiler is handed `itemsSourceDir`, named from the configured Item pack                         |
  | `systems/sohl/assets/…` inside `resolveImg`                                                               | a derived `assetRoot` of `<packageKind>/<foundryPackage>/assets`, so a module emits `modules/<id>/assets/…` |
  | `systemId` / `lastModifiedBy` written into `buildStats`, and `"0.6.0"` passed by four separate call sites | one `stats` block                                                                                           |
  | a directory named `Templates` skipped inside the generic tree walker                                      | `skipDirectories`, an Obsidian convention a consumer declares                                               |
  
  **Two blockers to extraction, closed**
  
  _The manifest is located once._ `supportedCoreVersion` resolved
  `system.template.json` by a path relative to its own module — correct while the
  toolchain is vendored, and pointing inside `node_modules/` the moment it is
  installed. It and the package-id guard added in #1503 now resolve the same
  configured directory through one function, which also accepts a module
  repository's `module.template.json`. The read still throws rather than falling
  back: a wrong `coreVersion` stamped into every shipped pack is worse than a
  failed build.
  
  _The core version stays derived._ Configuration supplies **where the manifest
  is**, never the version itself. `compatibility.minimum` moves with test
  evidence, and a captured copy would silently stop following it — the shape of
  defect #1533 was. Moving the floor in the manifest still moves the stamp in
  every compiled pack with no config change.
  
  `compilePacks` / `unpackPacks` / `cleanPacks` and `generatePacksJson` also take
  an optional `config`, defaulting to this repository's, so a caller can compile
  another package's tree without the working directory deciding anything. #1547's
  guard-order test is re-expressed against that seam: it induces package-id drift
  by handing the library a config rooted at its sandbox, because a drifted
  manifest merely sitting in the working directory is now — correctly — ignored.
  Its assertions are unchanged, and it was re-confirmed to fail on the
  "nothing was written" check when the guard is moved to the end.
  
  Pack output is byte-identical to the pre-change build. `_stats.systemVersion`
  keeps its stale `0.6.0` on purpose; correcting it rewrites every document and is
  tracked separately in #1548.
- 6ebc6ef: Address an item's documentation with a `doc<type>` wikilink
  ([#1362](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1362)).
  
  Since an item's prose began compiling to its own JournalEntry, an item and its
  documentation have been **two documents in two packs** with only one address
  between them. A section link to an item note therefore compiled to a
  `JournalEntryPage` id under the _items_ pack — a page id on a document that
  cannot hold pages — and dead-ended. Nothing reported it: the anchor was really
  declared in the target note, so the link checker passed it.
  
  **Every item type gains a virtual `doc<type>` counterpart.**
  
  | Wikilink                     | Addresses                                |
  | ---------------------------- | ---------------------------------------- |
  | `[[skill/wpnc]]`             | the Skill **Item**                       |
  | `[[docskill/wpnc]]`          | that skill's **JournalEntry**            |
  | `[[docskill/wpnc#crafting]]` | the `{#crafting}` **page** of that entry |
  
  The qualifier is formed by prefix and never enumerated, so a type added tomorrow
  is addressable the day it is authored. A real content type of the same name
  always wins.
  
  **An anchor on an Item, an Actor or a Macro is now a no-op.** A link to a
  JournalEntry opens the journal, at its first page or at the page an anchor
  names; a link to an Item or an Actor opens that document's _sheet_, not its
  documentation, and a sheet has no sections to address. The anchor is therefore
  dropped rather than turned into a page id the document can never hold.
  
  **The knowledgebase reads the same link differently, by design.** There an item
  note renders as one page which _is_ its documentation, so `doc<type>` and
  `<type>` are aliases for the same URL and the anchor stays an ordinary in-page
  anchor. One authored link, correct in both builds.
  
  `makeId` moved to its own leaf module, `utils/packs/ids.mjs`, and is re-exported
  from `helpers.mjs` for the passes that already reached it there. Link resolution
  needs to derive an item doc's entry id, and `helpers.mjs` imports the link
  resolver; a leaf with no local imports can be depended on from either side. The
  derivation is unchanged — `itemDocEntryId("j33FxOHddwk3WYnE")` still yields
  `b314163233099f73`, so no compiled id moves.
- c5dd887: **The knowledgebase landings stop dumping the corpus under the reading path** (#1322)
  
  `/rules/` ended with a heading reading _All Rules pages_ and a flat list of **59**
  pages — most of the corpus, piled underneath the carefully ordered chapter list it
  was supposed to complement. `/user-guide/` did the same with 14. Both read as though
  the curated reading order above them were incomplete.
  
  The list is a gap-filler, added so that authoring a landing body could never silently
  orphan a page. It stayed; only its idea of "reached" was wrong.
  
  - _Reachability is now transitive._ Both corpora are hierarchies — the rules landing
    links ten chapter introductions and each of those links its own pages, up to four
    hops deep (root → Trauma → Body → Injury → Bleeding). Testing only what the landing
    linked **directly** counted every page below the first hop as a leftover. A page now
    counts as reached when the body links it, or when any page already reached links it:
    the same rule `utils/check-content-links.mjs` enforces for these corpora.
  - _A link with a fragment counts._ The match demanded a closing quote immediately
    after the URL, so the rules landing's own link to the Characters chapter
    (`…/characters-introduction/#body-structure`) did not register and that chapter read
    as unlinked. Every `RelPermalink` ends in a slash, so dropping the closing quote
    cannot bleed into a sibling.
  - _The heading says what the list is._ What survives a transitive walk is genuinely
    unreachable by reading, so the heading is now **Orphaned Pages** rather than a claim
    to be the section's full contents. Both curated landings now show none of it.
  - _A curated landing no longer says "Nothing here yet."_ That is the right answer for
    an empty auto-listed section and the wrong one for a landing whose hierarchy covers
    everything — `/dev-docs/` had been printing it under a complete index.
  
  Verified by building the whole site before and after: exactly three pages differ —
  `/rules/`, `/user-guide/`, and `/dev-docs/` — and every other page is byte-identical.
  A page nothing links to still surfaces under _Orphaned Pages_.
  
  Closes #1322
- cbf19c6: **Linter findings now name a file, line and column, in a parseable form** (#1668)
  
  Every finding a `utils/check-*.mjs` linter emits is a single line in the form
  every C-family compiler, `tsc` and ESLint already use, so an editor's error
  matcher or a CI annotator resolves it with no knowledge of this repository:
  
  ```text
  assets/content/Rules/Attributes.md:28:13: error: dead address [[doc-nosuchthing]] — no document has that identity
  ```
  
  Before, a linter's output could not be acted on directly. Some findings named a
  file and no line — `check-content-links` reported `  <file>: [[link]]`, so two
  identical dead links in one note were indistinguishable and each had to be
  hunted for. Others carried a line in an indented, ad-hoc layout no error matcher
  reads. No two scripts agreed on a shape, so improving one improved only that
  one.
  
  Sixteen scripts now report through one formatter, `utils/lint-diagnostics.mjs`,
  under two rules: the path starts the line, and a field is dropped rather than
  guessed — nothing defaults to `1:1`. Where a finding is about a literal the
  linter matched, its position is recovered by search, with an occurrence count so
  repeats land on their own columns. Where a finding is a property of the whole
  file, the file alone is the locator.
  
  Exit codes and what each linter fails on are unchanged.
- 29c31d8: **An unusable link manifest is now reported by file, not by package name**
  (#1673)
  
  `check-content-links` reported a stale or unreadable cross-package manifest as
  `  thalorna: manifest version 1, expected one of 4, 5` — naming the package,
  while the comment above that code said the report existed so the failure would
  point "at the file at fault". It now does:
  
  ```text
  assets/manifests/thalorna.json: error: unusable link manifest: manifest version 1, expected one of 4, 5
  ```
  
  This was the one finding in the lint chain still emitted as prose after #1668.
  The path needed no new information — `loadForeignManifests` derives each package
  name from the filename — so the manifests directory is now stated once and
  shared by the load and the report, which keeps the two from disagreeing about
  where it looked.
  
  Exit code and failure condition are unchanged.
- 8cb1b00: **Link-manifest addresses are recorded relative to their package** (#1465)
  
  A manifest entry gave a site-absolute path, so it asserted not just where a page
  sits in its package but where that package is served. Every inbound cross-package
  link then depended on the citing site agreeing with that mount point — and the day
  a package moved, each of them failed the way the manifest exists to prevent: the
  address resolves, an `href` is emitted, and only the reader finds the 404.
  
  - _An entry says `path`, not `url`._ It records the address inside the package
    (`creature/grukar-ahk/`) and nothing about the package's own location.
  - _The consumer holds the mount point._ `PACKAGE_BASE` in `utils/kb-manifest.mjs`
    is one line per package, prefixed at resolve time. Repointing a package at
    another path or another origin is that single string, not 1,473 rewritten
    entries — and an absolute-origin base yields working absolute links.
  - _The format version is bumped to 2 and the older shape is rejected._ The two are
    indistinguishable to a consumer that just prefixes — a v1 `url` would become
    `/thalorna/thalorna/…` — so a stale vendored manifest has to be an error rather
    than a wrong link.
  - _Both repositories emit and consume the new shape_, and the vendored
    `thalorna` manifest is refreshed. Rendered links are unchanged for the current
    single-origin layout.
- 5dc028f: **Álverrik Tárvallor's age now agrees with his birthdate** ([#1237](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1237))
  
  His frontmatter carried `age: 34` against `birthday: 690/6/11`, which the current date of 720/1/1 makes 30. The age and the dossier prose are both corrected to 30.
- 4094ed5: Restore the cross-references that the `type-shortcode` wikilink separator left behind, and check that every note carries its address (#1398).
  
  **Cross-type links resolve again on the knowledgebase.** The hyphen form was read
  only by the pack compilers. The knowledgebase reached it by accident — through the
  alias each note carries — which works only when the link's source and target share
  a type. Every _cross-type_ link therefore lost its href and published as plain
  text: 152 of them, including every reference from a Mystical Ability to the rules
  it is tested under. The label still read correctly, so the prose looked intact.
  
  **The link checker sees them too.** `lint:content-links` resolved a target the same
  narrow way, so a cross-type `[[type-shortcode#anchor]]` resolved to nothing and its
  anchor went unchecked — silently, since an unresolvable target is treated as an
  external reference. It now reads the qualifier with the pack compilers' own
  `readQualifier`, so the check cannot drift from what the builds do.
  
  **A new `lint:content-aliases` verifies the aliases the form depends on.** Obsidian
  resolves a wikilink against the files on disk, so `[[skill-wpnc]]` only resolves in
  the editor if that literal string is in the target note's frontmatter `aliases`.
  The check asserts each of the 1442 notes carries **exactly one** address alias,
  equal to its own address. Requiring exactly one is what catches a stale alias left
  behind by a shortcode change — it would otherwise keep resolving old links to the
  right note, reporting nothing, until the retired code was reused. The check
  verifies and fails; it never writes to a note.
  
  _Not addressed:_ an unresolved `type-shortcode` still degrades to plain text
  without failing the build, because the same form addresses content in packages this
  build does not publish. That needs the single-source tree (#1385) to become
  decidable.
- 7908b49: **The twelve Astrokýklos cusp birthsigns now ship as content** ([#1235](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1235))
  
  The wheel has twenty-four signs, not twelve: between each pair of consecutive principal signs lies a **cusp**. A character born on a threshold now has a sign to attach.
  
  Each cusp is a droppable Mystery (`other`) built exactly like a principal sign — one Active Effect per non-zero element, adjusting the Effective Mastery Level of that element's skills:
  
  | Cusp             | earth | metal | fire | air | spirit | water |
  | ---------------- | ----- | ----- | ---- | --- | ------ | ----- |
  | Arnos-Bourax     | +15   | +10   | 0    | -10 | -5     | +5    |
  | Bourax-Diplos    | +10   | +15   | +5   | -5  | -10    | 0     |
  | Diplos-Chelyx    | +5    | +15   | +10  | 0   | -10    | -5    |
  | Chelyx-Thyron    | 0     | +10   | +15  | +5  | -5     | -10   |
  | Thyron-Korith    | -5    | +5    | +15  | +10 | 0      | -10   |
  | Korith-Stathmos  | -10   | 0     | +10  | +15 | +5     | -5    |
  | Stathmos-Kentros | -10   | -5    | +5   | +15 | +10    | 0     |
  | Kentros-Belos    | -5    | -10   | 0    | +10 | +15    | +5    |
  | Belos-Tragyx     | 0     | -10   | -5   | +5  | +15    | +10   |
  | Tragyx-Nalos     | +5    | -5    | -10  | 0   | +10    | +15   |
  | Nalos-Opsar      | +10   | 0     | -10  | -5  | +5     | +15   |
  | Opsar-Arnos      | +15   | +5    | -5   | -10 | 0      | +10   |
  
  `tests/content/birthsign-effects.test.ts` now asserts all twenty-four rows against the authored content, so a cusp that drifts from the matrix — or whose `test` expression stops parsing — fails there rather than silently applying nothing in play.
- f65ec6c: **Birthsigns now encode the Astrokýklos element matrix** ([#1233](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1233))
  
  Each of the twelve birthsigns carries one Active Effect per **element**, where an element is a set of skill subtypes together with that element's own skill shortcodes:
  
  | Element | `subType`                   | `shortcode`           |
  | ------- | --------------------------- | --------------------- |
  | earth   | `nature`                    | `earth`, `physera`    |
  | metal   | `script`, `craft`           | `metal`, `sideros`    |
  | fire    | `combattechnique`, `combat` | `fire`, `pyrethos`    |
  | air     | `physical`                  | `air`, `zepharis`     |
  | spirit  | `mystical`, `lore`          | `spirit`, `pneumenos` |
  | water   | `language`, `social`        | `water`, `hydalis`    |
  
  Previously only Arnos was on this shape, and three of its six `test` expressions had an unterminated string literal — so those effects threw at construction and silently never applied. The other eleven signs emitted one effect per _subtype_ with no shortcode arm and modifier values unrelated to the matrix.
  
  All twelve signs now match their matrix row, and `tests/content/birthsign-effects.test.ts` asserts the content directly: every `test` parses under the `effect.itemTest` scope, and each effect targets exactly its element's subtypes and shortcodes at the modifier the matrix specifies.
- 5dc028f: **Taburi's shortcode now matches its name** ([#1238](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1238))
  
  The Taburi shipped as `Tabri`, which matched neither its name nor its slug. It is now `Taburi`, keeping the CamelCase form the other weapon shortcodes use. Nothing referenced the old value, so the rename is self-contained.
- 031d48d: **The README pitch describes SoHL, not HârnMaster** (#1307)
  
  The opening pitch was the original launch copy, written when SoHL was framed as a
  HârnMaster implementation. It paid its one superlative to HârnMaster ("one of the
  most immersive and realistic fantasy role-playing systems ever created"), stated
  that SoHL "captures the essence of _HârnMaster_'s mechanics" — reading as an
  assertion of derivation — and made "HârnMaster Compatibility" the first listed
  feature. It has been replaced with copy that leads on what SoHL is and what a
  player gets from it.
  
  - _The differentiators are now named._ Classless, level-less character building; the
    Arcane, Divine, and Spirit traditions and the Mystery-versus-Mystical-Ability
    distinction; Fate; and skill improvement through use. The previous list
    ("Seamless Integration", "Deep Customization", "Visual Enhancements") described
    no system in particular.
  - _Compatibility is one option among several._ HârnMaster now sits alongside the
    open-source Thalorna setting and homegrown worlds, rather than defining the system.
  - _A false content claim is gone._ The pitch advertised "integrated maps"; SoHL ships
    `actors`, `items`, and `journals` compendia, and no scenes.
  - _The Forge Installs badge resolves again._ It queried package id `hm`, left over
    from the rename, which returns a null package; it now queries `sohl`.
  - _Non-affiliation is stated._ The Trademarks section carried SoHL's own marks but no
    statement regarding Kelestia Productions Ltd. It now records that SoHL is an
    original work, not a derivative of or supplement to any third-party game, and is
    unendorsed by and unaffiliated with Kelestia Productions Ltd.
  
  The scoped-beta system-status section has been removed from the README.
- 690f3fb: **The cross-package address allowlist is gone** (#1446)
  
  `FOREIGN_ADDRESS_ALLOWLIST` named six addresses that resolved to real notes in a
  package this repository did not publish. It existed because nothing in the
  syntax separated such a reference from a typo, so the deliberate ones had to be
  listed by hand and everything else failed.
  
  The link manifest answers that question with the target package's own build
  output, and with `assets/manifests/thalorna.json` vendored every one of the six
  now resolves through it — `check-content-links` reported all six as unused on
  every run. The constant, the code that consulted it, and the stale-entry warning
  are removed, and the content-links reference documents the manifest instead.
- 44f5feb: Reweigh the mineral and giant creatures, and bring the three stone giants down
  to a size the setting can hold
  ([#1240](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1240)).
  
  Every creature made of stone, iron, clay, crystal, ice or lava was priced as
  though it were made of meat. The Mountain Troll's own text says it "weighs as
  much as a small cottage" and the data said 500 lb — half a horse. Eight
  Elementals carried no weight at all.
  
  Weights are now computed from each creature's described dimensions and the
  density of what it is actually made of. A humanoid of height H occupies
  `2.9 × (H/6)³` cubic feet — a six-foot, 180-pound person at water density —
  times a bulk factor for a frame heavier than human proportions; a quadruped is
  anchored on a seven-foot, 400-pound feline. Densities: wrought iron 480,
  stone and crystal 165, lava 175, fired clay 120, wet mud 105, ice 57, flesh 64.
  
  **Three giants were also too large for the setting.** A Lithogiant at forty to
  sixty feet dwarfed the Old Dragon, which should be among the biggest and
  fiercest things in the world. The Boulderback is now fifteen feet of fitted
  boulders, the Stonebeast twenty feet of blocky stone (read as length, which is
  what a quadruped's measurement means), and the Lithogiant twenty-five to thirty
  feet.
  
  The Terrakith Sentinel keeps its 1000 lb: eight feet of clay at 120 lb/ft³ is
  almost exactly that, so it was right all along. The Ironjaw keeps its 250 lb —
  it is a wolf wearing metal, not a wolf made of it.
  
  Body weight is descriptive; encumbrance keys off carried gear, so none of these
  figures change how a creature behaves in play.
- 7e68661: Fix `npm run build:sohl-types`, and gate it so it cannot break unnoticed again ([#1613](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1613)).
  
  **The build failure**
  
  `tsconfig.sohl-types.json` set `stripInternal`, which deletes every
  `@internal`-marked declaration from the emitted `.d.ts` but keeps the
  `import type { … }` statements the _retained_ public declarations make of them.
  `rollup-plugin-dts` then died on the first dangling reference. The flag was also
  wrong for this package on its own terms: `@internal` marks the Foundry document
  layer as absent from the API _docs_, but `SohlActor`, `SohlItem`, `SohlScene`,
  `SohlTokenDocument`, and `SohlActiveEffect` are genuinely part of the published
  type surface — `logic.document` is one of them, and the `sohl` global's namespace
  tree exposes them outright. Curating the surface is the generation entry file's
  job, not that flag's. Removed it.
  
  Four Foundry config applications then emitted `typeof X.__#N@#onSubmit` — the
  synthesized name TypeScript falls back to when an inferred type references a
  `#private` member, which no downstream `.d.ts` consumer can parse. Their
  `DEFAULT_OPTIONS.form.handler` is now annotated so nothing has to spell it.
  
  **The published package**
  
  `index.d.ts` imported `@codemirror/autocomplete` without the package declaring
  it, so it resolved only from inside this repository. It is now a declared peer
  dependency, and the rollup `external` set is derived from `peerDependencies` so
  the two cannot drift.
  
  **The gate**
  
  `build:noci` now runs `check:sohl-types`, which regenerates the bundle,
  type-checks it as a consumer would, and runs a new `utils/check-sohl-types.mjs`
  validating that every bare import is a declared peer, that no unparseable private
  name survives, and that every re-exported name is actually declared. The release
  workflow's publish step stays `continue-on-error` — Foundry installs from the
  Release's `system.zip` — but it is no longer the only thing that would notice.
  
  Also removed the release workflow's `@heroiclands/content-build` publish step: the
  package moved to its own repository, so the step `cd`-ed into a directory that no
  longer exists and `continue-on-error` swallowed it — the same invisible-failure
  shape.
- 6bd7604: Rules documents describe the game, not the VTT that implements it
  ([#1291](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1291)).
  
  Nine rules documents explained a mechanic by describing the interface that
  presents it. `Bleeding.md` told the reader that "the system first presents a
  request … a dialog announcing that the character is bleeding, with an **Accept**
  button", and that "the physician sees a card in the chat log". `Afflictions.md`
  declared its outcome in two named authored fields and appealed to "everything the
  system automates". A reader who is not sitting in front of Foundry could not use
  them, and a reader who is would be misled the moment the interface changes.
  
  **The rules are the specification the VTT implements, and now read as though no
  VTT exists.** Every mechanic that was described as an interface is restated as
  what happens at the table, and nothing was lost in the move — the automation
  prose it replaced is already documented, in more detail, in the User Guide:
  
  | Was described in the rules as…                     | Restated as                                                                 | Already in the User Guide                |
  | -------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------- |
  | A dialog with an **Accept** button before bleeding | The chance to staunch comes first, and lapses at the end of the round       | _Trauma_ → Request/Accept Blood Stoppage |
  | A card in the chat log requesting stoppage         | A stoppage test names one injury and applies to that injury alone           | _Trauma_ → Accept Blood Stoppage         |
  | "As with everything the system automates…"         | Exposure and contraction are different; the roll is the exposed character's | _Being_ → Contagion Check / Test         |
  | Two authored fields and a Safe Expression          | An affliction ends in **Death** or **Cured**, and may leave a trauma        | _Affliction_ → The Outcome               |
  | The shock state as a set of Active Effects         | A creature is in exactly one shock state; a change replaces it              | _Being_ → Status indicators              |
  | Anatomy stored as three flat lists on the actor    | Anatomy is intrinsic to what a creature _is_                                | _Being_ → Body-part grid                 |
  
  Two smaller repairs came with it: `Bleeding.md` opened by linking the word
  "Injury" to the User Guide rather than to the Injury rules, and the birthsign
  pages described the signs as "droppable items in the compendium".
  
  **`npm run lint:rules-vtt`** (new, and part of `npm run lint`) keeps it that way,
  failing the build on a click, button, dialog, chat log, or "the system" anywhere
  under `assets/content/Rules/`. The User Guide is deliberately exempt: that is
  where automation behaviour belongs.
- 601d59f: Make `/rules/` the rules, the way `/user-guide/` is the user guide
  ([#1318](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1318)).
  
  The **Rules** card on [the knowledgebase](https://www.heroiclands.org/sohl/kb/) landed on
  `/rules/` — an automatically generated section listing. A reader who clicked it
  arrived at a flat index of every page filed under the section, with nothing to say
  which of them the rules begin at. The reading order added in #1316 was one click
  away and unreachable from the front door.
  
  The two cards beside it did not have this problem, and the reason is worth stating,
  because it is the whole fix: the content build routes a note to its section landing
  when — and only when — its source file is named `README.md`. `kb/dev-docs/README.md`
  and `assets/content/User_Guide/README.md` both take that branch, so for those
  sections the landing _is_ the authored introduction. The rules named their opener
  `_Introduction.md`, like every chapter opener beneath it, so the section had no
  landing source and its introduction published as an ordinary page one level down.
  
  `assets/content/Rules/_Introduction.md` is now `assets/content/Rules/README.md`.
  `/rules/` is the introduction — what the rules cover, the numbered reading order for
  all ten chapters, and the pointer to the glossary — and all three home-page cards
  now point at their own section root. Chapter openers below it are ordinary pages and
  keep the `_Introduction.md` name.
  
  Two things fall out of the rename. The `README_META` entry for `rules`, written for
  a landing that never existed, is live at last, so the page carries the same title and
  hero banner as the card that leads to it. And the introduction's old address,
  `/rules/song-of-heroic-lands-rules/`, redirects to `/rules/` — recorded in
  `kb/data/legacy-slugs.json`, the append-only history of every content URL that has
  moved.
  
  Nothing about the Foundry compendium changes: a journal entry takes its name and id
  from frontmatter, not from its filename, so the rules entry compiles identically.
- b20b5dd: **`assets/content/` is this repository's own source** (#1445)
  
  The tree was a generated, committed mirror of the HeroicLands vault: an edit made
  here was reverted by the next export without a word, and the vault was the only
  place content could be fixed. With the vault being retired (#1385), that
  relationship inverts — the tree is source, and this repository owns it.
  
  - _A final export, then the mirror is gone._ The committed tree had drifted badly:
    91 notes created, 1351 updated, 91 retired, 4 unchanged. The 91/91 pair is a
    single directory rename in the vault — `Creatures/` → `Bestiary/`, every
    basename matching — so nothing was lost, but the repository had been serving a
    stale copy.
  - _The collection landings arrive._ Eleven `type: doc, category: collection` notes
    lived only in the vault's `Types/SoHL/` and were never exported, because the
    export mirrors `SoHL/` alone. They are the only place a section's description
    and its `doc-<section>` address exist, so they come across rather than being
    lost with the vault.
  - _The export is deleted, not maintained._ `utils/export-vault-content.mjs`,
    `utils/vault-export.mjs`, and the `content:export` / `content:check` scripts are
    removed, along with every error hint telling a contributor to re-export.
  - _Markdown indents at 2._ Prettier's global `tabWidth: 4` reindented the YAML
    frontmatter of 1441 of 1442 notes away from the form they were authored in —
    the only difference between the two copies. A `**/*.md` override at 2 makes the
    tree byte-identical to its source and matches the other repositories holding
    this content, so a note can move between them unchanged. Prose is untouched
    either way: `proseWrap` defaults to `preserve`, so Prettier never rewraps a
    paragraph.
- f3a6431: **Fixed: a suggested `shortcode` could lose the first letter of a name.**
  `slugifyShortcode` deleted every non-ASCII character instead of transliterating
  it, so the create dialog offered `thelred` for _Æthelred_, `ornhall` for _Þorn
  Hall_ and `strae` for _Straße_. Accented letters fared no better — _Kûrbúl Helm_
  became `krblhelm`. Names are now carried into ASCII by spelling each letter out
  (`æ`→`ae`, `þ`→`th`, `œ`→`oe`, `ß`→`ss`, and every accented letter to its base).
  
  **Suggested shortcodes are now shorter and more conventional.** A name's words
  are replaced with their customary abbreviations — ranks, offices, materials and
  units, matched as whole words — and if the result still runs past ten
  characters, vowels are removed one at a time from the end until it fits. A
  word's opening vowels are never removed, so _Aeldred_ reduces to `aeldrd` and
  never to `ldrd`.
  
  Removing one vowel per pass, rather than all of them at once, is what keeps a
  name only slightly too long from being stripped bare: _Arrow, Broadhead_ becomes
  `arrowbrdhd` rather than `arrwbrdhd`. Ten characters is a
  guideline rather than a limit: nothing is truncated, and the suggestion remains
  a default the author may replace.
  
  This affects only the value offered when a document is created. Existing
  shortcodes are saved world data and are untouched.
- cc5bd24: Restore the missing _Jar, glass, 1 pt._ container item, and make a missing document
  id fail the pack build instead of silently dropping the document.
  
  **The defect.** `Jar, glass, 1 pt.` carried an empty `id:` in its frontmatter, so the
  items compiler skipped it. The item never reached the compendium while its knowledge-base
  page and content still built normally, leaving no visible sign anything was wrong — the
  build stayed green and reported success. The container pack shipped 43 items where it
  should have had 44.
  
  **The fix.** The jar is given a document id and now compiles. A missing `id` on an item
  or an actor is now a build error naming the offending file, rather than a warning
  followed by a silent skip. This matches the folder-id check, which already threw; items
  and actors were the inconsistent cases.
  
  A content file that cannot become a document is an authoring mistake, and the build
  should say so at the point it happens rather than produce a quietly incomplete pack.
  
  Closes #1325.
- b36fcd6: **The white coiled-dragon mark is actually white** (#1311)
  
  `assets/icons/brand/sohl-dragon-white.svg` shipped filled `#000000` — byte-identical
  to the black original apart from a stripped comment — so the variant intended for dark
  grounds rendered as a black shape on them. Both paths are now `#FFFFFF`.
  
  - _The trademark notice is restored._ The file had lost the comment recording that the
    coiled-dragon service mark is All Rights Reserved and is **not** covered by
    CC-BY-SA-4.0 or GPL-3.0. Since `assets/` is CC-BY-SA-4.0 by default and this mark is
    carved out of it, that notice is the only record of the exclusion inside the file
    itself. It was regenerated from the black original rather than retyped, so the
    wording matches exactly.
  - _Geometry is untouched._ Both path definitions and the `viewBox` are unchanged from
    `sohl-dragon.svg`; only the two fill values differ.

## 0.8.2

### Patch Changes

- 116ae0f: **Fix the broken Song of Heroic Lands icon in the README**

    The README's icon image pointed at `assets/kb/sohl-icon-3d-1920x1080.webp`, which
    no longer exists after the icon assets moved to `assets/ui/`. Corrected the path
    so the image renders again.

## 0.8.1

### Patch Changes

- d248791: **Fix the system failing to load with `Identifier 'chrome' has already been declared`**

    Installing the released system threw a `SyntaxError` on load and the system never
    initialized:

    ```
    Uncaught SyntaxError: Identifier 'chrome' has already been declared (at sohl.js:1:1)
    ```

    **The cause was a mismatch between how `sohl.js` is built and how it is loaded.**
    Vite builds the bundle as an **ES module**, but `system.json` listed it under
    `"scripts"`, which makes Foundry load it as a **classic script**. The distinction
    decides where top-level declarations live: in a module they are module-scoped and
    private to the bundle; in a classic script they become _global lexical_ bindings.

    A global lexical binding whose name matches a **non-configurable** property of
    `window` is a parse-time `SyntaxError` — thrown before a single line executes. The
    bundle inlines `@codemirror/view` for the SafeExpression editor, and that library
    declares `const chrome` for browser sniffing. `window.chrome` is
    `configurable: false`, so the collision bricked the entire system. The release
    build is deliberately unminified, so the identifier survived verbatim; Foundry's
    own CodeMirror build escapes the same problem only because minification renames it.

    `sohl.js` is now declared under **`"esmodules"`**, matching how it is built. Every
    top-level declaration is module-scoped again, so this class of collision cannot
    recur — the same latent failure also affected `style-mod`'s `const top`, which had
    previously been worked around by renaming that one identifier at build time. That
    workaround is removed, as module scope subsumes it.

    A build guard, `npm run lint:bundle-globals`, now fails the build if the manifest
    and the bundle format ever disagree again: if `sohl.js` is served as a classic
    script, it must declare nothing at global scope.

## 0.8.0

### Minor Changes

- 73e09ba: **Affiliation as capability credential: retire the Skill.level bolt-on**

    Religious rank and arcane grade were being approximated by a `level` on ritual and
    arcane **Skills** — a bolt-on with no mechanical weight. That standing belongs on
    **Affiliation** (`Affiliation.level`), establishing Affiliation as the credential and
    Mystery / Mystical Ability as the capabilities it informs.
    - **Retired `Skill.levelBase`.** The Skill schema field, its `SkillLogic.level`
      modifier, and the Skills-tab **Lvl** column are removed. This is a pre-Beta clean
      break — no migration; standing is recorded directly on the Affiliation's **Level**.
    - **`AffiliationLogic.level` is a `ValueModifier`** (seeded from the source rank), so
      it is a valid **Active Effect target** (`mod:logic.level`) like the other level
      modifiers, and it is the stable seam for reading a character's rank. Added
      `AFFILIATION_EFFECT_KEY` (LEVEL) for parity with Mystery / Mystical Ability. The
      Being sheet's affiliation Rank now reflects the effective (post-effect) value.
    - **`MysticalAbilityLogic.affiliation`** (renamed from `assocAffiliation`; the data
      field stays `assocAffiliationCode`) resolves during `evaluate()`, so an individual
      ability subtype can consult its affiliation's rank. No gating or EML change is
      imposed here — the affiliation only _informs_ a derivation; the player still
      triggers every invocation.

    Documentation updated: the Affiliation, Skill, and Mystical Ability user-guide pages
    and the Skills rules page reflect the credential model (the Skill "Level / Circle"
    concept is retired).

    Closes #1000

- e575a21: **Associate a Mystical Ability with an Affiliation**

    Some Mystical Abilities draw their standing from a **faction / Affiliation** — a
    religion, an arcane or alchemical school, or an ancestor / totem / spirit — whose
    membership confers an available area, level, circle, or capability separate from the
    activating skill's own mastery level (Spirit Power, Ritual Action, Divine Incantation,
    Arcane Incantation, Alchemy). A Mystical Ability can now record which Affiliation it
    belongs to.
    - **New `assocAffiliationCode` field** on the Mystical Ability, storing the
      associated Affiliation's shortcode (optional, `null` when unset — the same shape as
      `assocSkillCode`). `MysticalAbilityLogic` resolves it during `evaluate()` to the
      Affiliation's logic on the same actor, exposed as `assocAffiliation` (`undefined`
      when unset, off-actor, or unmatched).
    - **Being sheet Affiliation column** — the Mystical Ability ledgers for the
      affiliation-bearing subtypes (Spirit Power, Ritual Action, Divine / Arcane
      Incantation, Alchemy) gain an **Affiliation** column, immediately after **Skill**,
      showing the associated Affiliation's name (or `✕` when none).
    - **Mystical Ability sheet selector** — a new _Associated Affiliation_ control: a
      dropdown of the actor's Affiliations when the item is on an actor, or a free-text
      shortcode field when it is not (reusing the shared `shortcodeRefField` widget).

    This is association plumbing only — it records the credential; it does not itself gate
    or scale capability, and takes no automated action on a character.

    Closes #1012

- e49ade0: **A code editor for SafeExpression formula fields (Phase 1: Skill Base pilot)**

    SafeExpression formula fields were edited as plain single-line text inputs with no
    highlighting, no validation until runtime, and no discoverability of the available
    helper functions. This adds the first piece of a richer editing experience:
    - **`SafeExpression.validateSource(src)`** — a pure static check that returns the
      grammar error for an invalid expression, or `undefined` when valid/blank. It runs
      the exact jsep parse + allowlist the runtime uses, so editor validity never drifts
      from evaluation behaviour.
    - **`SafeExpressionField`** — a `StringField` subclass (the stored value stays a
      plain string) that marks a field as holding an expression so the sheet offers the
      code editor. It intentionally does not reject an invalid formula at the schema
      boundary — invalid formulas are still stored and surfaced as warnings by the
      consuming logic (unchanged behaviour); the authoritative check runs live in the
      editor.
    - **Expression editor dialog** — an edit button beside a formula field opens a
      popup with a monospace editor, **live validation** against the real SafeExpression
      grammar (the status line and the Save button react on every keystroke; Save is
      disabled while the expression is invalid), and a click-to-insert palette of the
      registered helpers.

    Wired as a pilot on the Skill sheet's **Skill Base** field. Follow-up work — syntax
    highlighting and registry-fed autocomplete (a bundled CodeMirror instance), and
    rollout to the other formula fields — is tracked on the issue.

    Closes #1031

- 2ba6671: **SafeExpression editor Phase 2: syntax highlighting, autocomplete, and rollout**

    Builds on the Phase 1 editor (#1031). The formula-field editor is now a full
    CodeMirror editor:
    - **Syntax highlighting** via a custom SafeExpression tokenizer (not JavaScript):
      registered helper names read as functions, the bound namespaces (`attr`, …) as
      namespaces, and only the operators the evaluator implements are recognized — so
      highlighting matches the real grammar.
    - **Autocomplete** fed by the live helper registry plus each field's context
      identifiers (helpers insert with their call parentheses).
    - **Rollout** via a shared `expressionField` Handlebars partial (form field + edit
      button): the Skill sheet's **Skill Base** and the Affliction sheet's
      **outcome-trauma** SafeExpression fields now both use it. (The affliction
      _duration_ formulas and an attribute's _init-dice_ formula are dice-roll
      formulas, not SafeExpressions, so they are intentionally not converted; the
      action `trigger`/`visible` and Active-Effect `test` fields are JavaScript-typed
      in foundation modules and are left for a separate change.)

    **Build note.** CodeMirror is bundled from the `@codemirror/*` packages. Because
    the release build is unminified, a scoped Vite plugin renames `style-mod`'s
    top-level `top` binding (which would otherwise collide with the unforgeable
    `window.top` at load), and `@codemirror/commands` is deliberately not bundled (its
    top-level `history` export would shadow the global `history`). We construct the
    `EditorView` ourselves rather than reusing Foundry's `<code-mirror>` element,
    which renders blank inside a dialog popup.

    Closes #1035

- d300ecf: **Birthsign as a droppable Mystery + Active Effects**

    A birthsign is now a **Mystery(OTHER)** item carrying skill **Active Effects**,
    rather than a value the system computes for a character. The player attaches the
    sign the character was born under; nothing is derived on the character's behalf.

    **How it works**
    - A birthsign is a mechanically inert `Mystery` of subType `other` whose behaviour
      lives entirely in its Active Effects. Each effect scopes to the `skill` item
      kind and gates on the skill's subType — `itemLogic.data.subType === "<subtype>"`
      — pushing a `mod:logic.masteryLevel` (type `add`) delta onto every matching
      skill, so the sign raises the Effective Mastery Level of the skills it favours
      and lowers those it hinders. This reuses the system's existing Active-Effect and
      modifier primitives; the birthsign carries no bespoke mechanism of its own.
    - The twelve **Astrokýklos** signs (Arnos, Bourax, Diplos, …) ship as named,
      foldered items in the **Items** compendium under _Esoteric → Birthsigns_.

    **Content**
    - New `mystery` content authored with a top-level `effects:` frontmatter array of
      embedded Active Effects — the first hand-authored use of that seam.

- bbd1db9: **A Script Action overrides the intrinsic action with the same shortcode**

    A GM can now replace a built-in (intrinsic) action with their own house rule by
    adding a Script Action whose `shortcode` matches it. The script _wholly overrides_
    the intrinsic — the context menu, the default action, and `executeAction` all
    resolve only the script; the system never runs both.
    - **Deterministic merge, script wins.** `SohlLogic` now deduplicates intrinsic and
      script action definitions by `shortcode` before building `actions`, so a shadowed
      intrinsic is never constructed into the live set nor exposed to default-action
      selection — replacing the previous incidental, Map-ordering-dependent behavior.
    - **One context for every executor.** Every executor — an intrinsic method or a
      Script Action's macro — now receives the same single argument, the
      `SohlActionContext`, exposed to the macro as `ctx`. The context carries a new
      `thisLogic` field: the Logic the action runs on, the exact target an intrinsic
      method is bound to (so inside an intrinsic, `this === ctx.thisLogic`).
    - **Building on the intrinsic.** The intrinsic's capability is the executor method
      on the Logic (e.g. `toggleCarried`), untouched by the override. An overriding
      macro that wants to extend rather than replace it calls that method through the
      context handle — `ctx.thisLogic.<executor>(ctx)`.

    Closes #1060

- 6afa4f6: **Associate a Mystery with an Affiliation**

    A Mystery is often conferred by a **faction / Affiliation** — a religion, an arcane or
    alchemical school, an ancestor / totem / spirit — the same way a Mystical Ability
    draws its standing from one. A Mystery can now record which Affiliation it belongs
    to, so a Piety or Grace pool says where it comes from.
    - **New `assocAffiliationCode` field** on the Mystery, storing the associated
      Affiliation's shortcode (optional, `null` when unset — the same shape as
      `assocSkillCode`). `MysteryLogic` resolves it during `evaluate()` to the
      Affiliation's logic on the same actor, exposed as `affiliation` (`undefined` when
      unset, off-actor, or unmatched).
    - **Mystery sheet selector** — a new _Associated Affiliation_ control: a dropdown of
      the actor's Affiliations when the item is on an actor, or a free-text shortcode
      field when it is not (reusing the shared `shortcodeRefField` widget).
    - **Being sheet Affiliation column** — the Mysteries tab's mystery ledger gains an
      **Affiliation** column, immediately after **Skill**, showing the associated
      Affiliation's name.

    This is association plumbing only — it records the credential; it does not itself gate
    or scale capability, and takes no automated action on a character.

    Closes #1076

- c6d3c2c: **Opposed tests: ties, tie-breaks, and cards that actually post**

    Opposed tests were unusable end to end, and the outcome they reported was wrong
    when they did run. This repairs the whole contest, from the pre-roll dialog to the
    result card.
    - **A tie is reported as a tie.** The result card printed **Both Fail!** whenever
      neither side was flagged the winner — which includes a tie, so a contest both
      sides won (two Critical Successes, say) was announced as a mutual failure while
      the Results grid above said otherwise. The card now distinguishes three
      outcomes: a winner (with Victory Stars), **Tie — No Winner!** (no stars), and
      **Both Fail!** only when neither side succeeded.
    - **Ties can be broken, at the initiator's request.** The pre-roll dialog of an
      opposed test now offers a **Break Ties** checkbox, off by default. Left off, a
      tie stands. Ticked, a tied _success_ is settled and the card names the deciding
      rule: the higher d100 takes it, failing that the higher Mastery Level, failing
      that a d10 roll-off — a one-star victory either way. A mutual failure is never
      broken; there is no victor to award. The answer is the initiator's alone and
      carries through to the result.
    - **Victory Stars say whose they are.** The margin was always drawn as filled
      stars, whichever side won. It is now filled (★) for the side that started the
      contest and hollow for the side that answered — on the opposed card and on the
      attack-result card alike — so the line reports the winner as well as the margin.
      They are drawn as Font Awesome star icons (`fa-solid` / `fa-regular`, the same
      filled/hollow pair the sheets already use for the improvement flag) rather than
      ★/☆ text glyphs, with the count carried on an `aria-label`.
    - **Victory Stars have no ceiling.** The margin is now measured on raw success
      levels, so a modifier that shifts a level past the ordinary four widens the
      margin with it: a Marginal Success against a Critical Failure worsened by −1 is
      three stars, not the two the clamped scale allowed.
    - **Fixed: no opposed test could start.** `opposedTestStart` handed `successTest`
      a `{ sourceTestResult }` wrapper as its `priorTestResult`, which was adopted as
      the test result and immediately dereferenced — every contest threw a TypeError
      before posting anything.
    - **Fixed: opposed cards never posted.** The card data carried the contestants'
      SoHL rolls under `rolls`, which became part of the ChatMessage payload; a
      `SimpleRoll` is not a Foundry `Roll`, so the document failed validation and the
      create — fire-and-forget — silently produced no message. Neither the request
      card nor the result card ever reached the chat log.

    **Terminology.** The opposed/combat victory margin is now **Victory Stars**
    throughout (cards, rules, and user guide), leaving **Success Stars** to mean only
    the quality stars of a Success Value test. The two were previously the same label
    for different things.

    Closes #1081
    Closes #1160
    Closes #1162
    Closes #1163

- fbcb815: **Gear you are not carrying can only be picked back up**

    Every action a piece of gear offered was available regardless of whether the item
    was on the character's person — you could mark an uncarried hauberk as worn, and
    worn armor contributes protection. Gear that is not carried is on the ground, on a
    cart, or back at camp, and nothing can be done with it from there.
    - **Carried gate.** While `system.isCarried` is `false`, every gear action is
      unavailable: hidden from the Actions context menu **and** refused by
      `SohlAction.execute`, so a chat-card button, macro, or scheduled reminder cannot
      route around it. `GearLogic.gateOnCarried` composes the gate onto each action's
      `trigger`, preserving (never replacing) an author's own trigger; every gear logic
      runs its `defineIntrinsicActions` result through it.
    - **Four actions stay available**, so an uncarried item is never stranded:
      `toggleCarried` (the way back), plus the universal `editDocument`,
      `deleteDocument`, and `outputDescription`.
    - **Setting gear down clears its "in use" state.** `toggleCarried` merges a new
      `GearLogic.stowUpdates()` payload when un-carrying; `ArmorGearLogic` overrides it
      to clear `isWorn`, so armor can never remain worn while off the character.
    - **The sheet controls honor the gate.** The Being sheet's Gear-tab carry and worn
      buttons now dispatch the item's intrinsic actions instead of writing the field
      directly, the worn button renders disabled while the item is uncarried, and the
      armor sheet's **Is Worn** field is disabled for the same reason.
    - **`GearLogic.isCarried`** exposes the carried flag on the logic layer, so
      expressions and modules can read it without reaching into `data`.

    Documentation updated: the Gear user-guide page documents the carried-gear rule, the
    Armor page documents that wearing requires carrying, and the "Working with Gear and
    Equipment" guide notes both.

    Closes #1097

- 1db1000: **Cohort Members tab: a working roster, with add, remove, and a leader**

    The Cohort sheet's **Members** tab rendered its section and listed nothing at all,
    however many members the cohort had. The template bound fields the schema does not
    carry (`member.name`, `member.shortcode`, and a `moveRepName` that exists nowhere),
    and the sheet built no context for the part, so there was nothing to list. The tab
    is now a real roster, and membership is managed from it.
    - **Every member is listed**, resolved from the one handle its entry carries —
      a **shortcode** for a world or compendium actor, or a **UUID** for a token actor
      (a band of orcs are each unlinked tokens of one common actor, which no shortcode
      can tell apart). Each row shows the member actor's portrait, name, and role.
    - **A member whose actor no longer resolves still gets a row**, named by its raw
      handle and greyed. A cohort must be able to see — and remove — a member it can no
      longer reach.
    - **The leader is one of the members.** A chess-king on each row toggles it:
      clicking a member's king makes them the leader (displacing whoever led before),
      and clicking the lit king on the leader's own row stands them down, leaving the
      cohort with no leader. A leader code naming nobody in the list reads as _no
      leader_ rather than as a stale name.
    - **Add and remove from the tab.** **+ Add Member** asks for a shortcode or UUID
      and a role, and refuses anything that does not name an actor you can see, or that
      is already a member. A row's trashcan removes that member after confirming —
      only the membership goes, never the actor. Removing the leader clears the leader.
    - **Membership is managed by three intrinsic actions** — `addMember`,
      `removeMember`, and `toggleLeader` — so the row controls, the Actions tab, the
      context menu, and any macro drive one implementation. Nothing happens except at a
      human's invitation; invoked with no member named, the actions ask which one.
    - **Spawning a cohort's members onto a scene resolves through the same seam**, so
      members named by shortcode _or_ UUID are found. Previously every member was
      reported missing, because the spawn read a `shortcode` field that does not exist.

    _Schema:_ the cohort's `leaderName` (a free-text name) becomes **`leaderCode`**,
    holding one of the members' handles. Cohort is a fenced, pre-beta type and this is
    an explicit clean break, with no migration; re-pick the leader on any cohort that
    had one. `moveRepName` is removed from the tab — it was never a field.

    Documentation updated: the Cohort user-guide page documents the tab, its two handle
    forms, the leader toggle, and the three actions; the common-tabs reference points
    at it.

    Closes #1151

- 6f67b6b: **Document what a combatant group is for**

    Both the Combat Model dev doc and the Combatant user-guide page described how
    combatant groups _work_ — seeding, the `Opponents` fallback, the tracker chip,
    the Move to Group… dialog — without ever introducing what a group is or what it
    buys. The concept was only ever met in passing, as a property of something else.
    - **Combat Model** gains a _Combatant groups_ section ahead of the seeding
      mechanics: a group is a named side scoped to one encounter; allegiance is
      per-encounter rather than a property of the actor; the single rule is
      `areCombatantsEnemies` (different group ids ⇒ enemies, missing group ⇒
      defensively enemy); and the capability it enables is the derived
      `isEnemyOf` / `allies` / `threatenedBy` relations, with `threatenedBy` as the
      engagement question the rules keep asking.
    - It also states the boundaries: no leader, no group initiative, no turn
      ordering, and no bearing on who may be targeted — automated combat takes its
      target from the attacking player's targeted token and never consults a group.
    - **Current gaps and caveats** now records that the relations have no internal
      consumer: `allies`, `threatenedBy`, `isThreatening`, and `reaches` are
      implemented and unit-tested, but nothing in `src/` reads them, and the
      engagement rules that would (outnumbering, engagement zone) are unbuilt.
    - **Combatant (user guide)** gains a _Combat groups_ page covering the same
      ground in play terms, including an explicit note that the sides and threat
      list are computed today but not yet consumed by any rule.
    - **Scene, Token, and Combatant Systems** — the _Relationship state_ section
      described stored `allyIds` / `initAllyIds` / `threatenedAllyIds` fields and
      `addAlly` / `addThreatened` mutators that no longer exist; it now describes the
      derived relations that replaced them.

    The duplicated one-line explanations in the group-chip bullet, the assignment
    paragraph, and the Move to Group… write-up are replaced by cross-references.

- 99e4c35: **Document the Health model in the Rules**

    Health — the 0–100 figure and its band shown on the Being header, the token bar,
    and the cohort roster — had no Rules page at all. Injury documented wounds and
    impairment, but nothing joined those to the Health figure they produce, so a
    reader could not tell whether Health was a pool of hit points, why one wound
    dropped a character several bands at once, or why a second wound of the same
    severity cost so much more than the first.

    The new **Health** page covers, in play terms:
    - Health as a **ceiling imposed by injuries**, not a pool that damage is
      subtracted from — heal the wounds and the ceiling lifts on its own.
    - The three things that set it: how badly a part is impaired, whether that part
      is **critical** or a **limb**, and **how many** parts share that state.
    - That a character's Health is the **worst** ceiling any injury imposes —
      injuries never accumulate additively — with a worked example.
    - Both ceiling tables, so a GM can predict the figure.
    - The six bands, their thresholds, and what each means at the table.
    - The floor rule: a living character never reads 0%, however ruinous the
      injuries; 0% means dead and nothing else does.
    - What Health deliberately does **not** cover — fatigue, shock, and fear are
      tracked separately, so Health is not a readiness score.

    Linked from the Rules index under _Health, Injury & Recovery_.

- 46981d2: **Document what the Cohort, Vehicle, and Structure actors are for**

    The three non-Being actor pages described fields and tabs without establishing
    why each actor kind exists — and several of the mechanics they advertised are
    not modeled at all. A reader was told that Vehicles "have their own protection
    ratings and can sustain damage", that a Structure was for tracking "a building's
    condition (hit points, damage)" and its "capacity", and that a Cohort was "one
    entity with shared attributes, skills, and gear". None of that is true.

    Each page now opens with purpose, the one capability that distinguishes it, and
    an explicit statement of what it does **not** model:
    - **Cohort** — a named body of individuals whose members remain their own
      Beings. Its unique capability is the **roster**: who belongs, who leads, each
      member's health at a glance, and the gear members have pooled. It has no
      attributes, skills, or health of its own, makes no rolls, and is not a combat
      side (that is a combat group).
    - **Vehicle** — a conveyance carrying people. Its unique capability is its
      **occupants**, each with a role and optional title; it is the only non-Being
      actor with a property of its own. No capacity, no condition or damage model,
      and roles carry no mechanical effect.
    - **Structure** — a place that persists, holding gear, actions, and effects. It
      has no properties of its own by design; what separates it from a Vehicle is
      that it does not move. No integrity, no capacity, no occupants.

    Also removes the **Assembly** actor kind from the user guide — its page, and the
    references to it in Scene Setup, Creating Actors & Items, Actions, and Working
    with Gear. That actor type no longer exists.

- 14e80a8: **A shared Profile tab for the Cohort, Vehicle, and Structure sheets**

    None of the three non-Being actor sheets had a Profile tab, so a vehicle's
    movement rates could not be seen or set from its sheet and no non-Being actor
    could reach its **dossier** (private description) at all — the field existed on
    every actor but only the Being surfaced it.

    All three now render a shared Profile part with three sections:
    - **Attributes** — the same score grid the Being uses, kept for _every_ actor
      kind. A vehicle or structure normally authors none, in which case the section
      renders empty rather than disappearing, so a world that wants to give a ship a
      Quality or a keep a Condition can.
    - **Movement** — the ledger of per-medium travel rates with the star control
      that picks the actor's current medium, plus an **Add Movement Profile**
      control.
    - **Biography** — the dossier editor.

    Supporting changes:
    - New pure `buildMovementRows(profiles, current)` in the actor sheet-parts
      module: the canonical no-movement row first (actors never author one, so
      without it a mover could not be made immobile), then each authored profile,
      with exactly the current medium starred.
    - `_onMakeDefaultMedium` and `_onAddMovementProfile` move from the Being sheet
      to `SohlActorSheetBase` and are registered there. Both only ever touched
      base-actor data, so every actor kind can now drive them; the Being sheet
      inherits them unchanged.

    The Being keeps its own richer Profile (affiliations and the body-structure
    editor besides) and is untouched.

- ae091db: **Document body zones, parts, locations, roles, hit location, impairment, and Shock**

    The Rules described a body-structure model the system does not implement, and
    omitted the concept that ties an injury to its consequences. Body parts were said
    to carry an explicit list of "Affected Skills and Attributes", and hit location was
    said to be a success-margin system ("Solid Hit" / "Barely Hit") driven by a weapon
    "Strike Accuracy" measured in square feet. Neither exists. The humanoid reference
    values were wrong as well, so the zone-number runs derived from them were wrong too.

    **Body Part Roles** are now documented as the core mechanism they are. A part is
    tagged with the roles it fulfills — _Vital_, _Core_, _Manipulator_, _Locomotor_ —
    and skills and attributes name the roles whose injury impairs them, rather than
    naming parts. That indirection is what lets one skill definition work on a human,
    a serpent, and a dragon alike. A part may hold several roles, and a role several
    parts. Mobility and health-criticality are derived from roles, not set separately.

    **Hit location** is now documented as it actually resolves: Zone Number plus Zone
    Die. The aimed part's zone supplies a target zone number, the strike mode's
    **Spread** is rolled as a die, and `Hit ZN = (target ZN − 1) + roll`. Because the
    walk is always upward, a loose strike drifts low and never high, and a blow that
    resolves past the creature's highest zone number misses outright — which is why
    small creatures are harder to place a loose blow on.

    **Impairment** now states what it costs and how it is derived: grievous makes a part
    _unusable_, serious is −10, and minor is −5 only while slow to heal. It is worst-of
    and never additive. A test whose skill names a role held by an unusable part
    **automatically Critically Fails**; otherwise it takes the worst penalty among the
    parts holding its roles.

    **Shock** is documented end to end, from the body location that produces it to the
    state it lands the victim in: Shock Value → Shock Index → Shock State. The index
    opens at the struck location's Shock Value plus the Injury Level (plus one for a
    glancing blow); 4 or less never rolls, above 10 is death, and in between a Shock
    test moves the index by +2 / +1 / 0 / −1, which then reads off the state table.
    A glancing blow grants +10 on that roll and a marginal-success amputation −20.

    The human reference tables — zone weights and numbers, part weights and roles, and
    every location's weight, Shock Value, bleeding susceptibility, and amputability —
    now match the shipped anatomy, with an explicit statement throughout that other
    body structures carry different values and different parts entirely.

    Also documents the bleeding-susceptibility and amputability tiers as the grids they
    are, and threads the connection through the neighbouring pages: _Skills_ gains an
    injury-and-skills section, _Injury_ and _Health_ now name the roles behind
    impairment and the critical/limb split, and _Shock_ carries the worked example.

- 365e64b: **Mysteries and Affiliations for the Vehicle and Structure sheets**

    A ship can bear a ward and a shrine can hold a consecration, but neither sheet
    could show one: Mysteries and Mystical Abilities could be embedded on the actor
    and were invisible. Nor could either say whose they were.
    - The Being's Mysteries tab was never Being-specific — its template renders one
      section per subType and its context builder reads only
      `actor.itemTypes[MYSTERY]` / `[MYSTICALABILITY]` through shared helpers. The
      template is promoted to `templates/actor/parts/mysteries.hbs` and the builder
      to `SohlActorSheetBase`, dispatched for any sheet declaring the part. The
      **Vehicle** and **Structure** sheets now declare it; the Being inherits both
      unchanged. The Cohort does not get one — its tabs are Facade, Profile,
      Members, Shared Gear, Actions, Effects.
    - The shared **Profile** tab gains an **Affiliations** section, so an actor that
      can carry a mystery can also say who it answers to — a ward laid by an order,
      a keep held for a house, a ship under charter.
    - **The Gear tab drops its capacity readout** where there is nothing to read.
      Capacity is deliberately not modeled for vehicles or structures, so the base
      reported a bare total that nothing acts on — and, having no maximum, it
      rendered as a dangling `Capacity: 12.5/`. Sections now show a readout only
      when they have one: a being's carried weight and encumbrance, or a container's
      used-against-max.

- 04a502d: **Cohort Members tab shows each member's health, and health bands are localized**

    The Members roster listed a name and a role but said nothing about the state
    the members are in, so a cohort's condition could only be read by opening every
    member's sheet.
    - Each member row now carries a **health** column showing both the **percentage**
      (of the member's own maximum, so it is comparable across members) and the
      **qualitative band** that percentage falls in. The percentage is colored on the
      same three-stop ramp the Being header uses, so a member reads the same on the
      roster as on their own sheet.
    - A member whose actor does not resolve — deleted, or not visible to this client
      — shows an empty health cell, exactly as its name already falls back to the raw
      handle. "No health to show" stays distinct from "at death's door": an absent
      or malformed health reads as _no value_, never as `0%`.
    - **Health bands are now localized.** The band (`Excellent` … `Dead`) is an
      internal token; every surface that displays one localizes a
      `SOHL.Health.BAND.*` key instead, via the new pure `healthBandLabel(band)`.
      This also fixes the **Being sheet header**, which rendered the raw token, and
      the print letterhead's health line, which embedded it.

    _Note:_ shared gear remains scoped to the cohort's own members by design — gear
    shared with a cohort by a non-member is deliberately not gathered.

- 5af850f: **Flag a cohort member whose actor cannot be found**

    A member whose handle no longer resolves — the actor was deleted, or this client
    cannot see it — was shown only as a greyed row bearing its raw handle. Greyed
    alone reads as _inactive_; nothing said the actor was **missing**.

    Such a row now carries an amber warning triangle and the words **Not Found**
    beside the handle, with a tooltip explaining the two reasons it can happen. A
    member that resolves is unchanged.

    _Note:_ the flag uses a single `triangle-exclamation` glyph rather than a
    layered `fa-layers` composition. Foundry ships Font Awesome as a **webfont**, and
    `fa-layers` / `data-fa-transform` only take effect in FA's SVG mode — layering
    there renders a stray `!` beside the triangle instead of inside it.

- f8f0b70: **Vehicle Occupants tab**

    A vehicle's `occupants` could be written to but never seen: the sheet had no
    tab for them, and `VehicleLogic` derived nothing, so who was aboard was
    invisible.
    - `VehicleLogic` gains `occupantLogics` and `occupantRows`, mirroring the
      cohort's roster: each stored entry joined to whatever its handle resolves to,
      with the actor's name, portrait, role, title, and current health. An entry
      that no longer resolves still produces a row, named by its raw handle and
      flagged **Not Found** — a vehicle must be able to see, and remove, someone it
      can no longer reach.
    - **No leader.** Unlike a cohort, a vehicle's complement has roles but no single
      head; a ship's master is expressed as a `title`, not a rank the system tracks.
    - The **Occupants** tab lists them, and `addOccupant` / `removeOccupant`
      intrinsic actions manage the list — actions rather than sheet-only handlers,
      so the tab controls and the Actions tab drive one implementation. Adding asks
      for the handle, role, and optional title, and refuses a handle that names no
      visible actor or is already aboard; removing confirms first and never touches
      the occupant's own actor.
    - The health-percentage helper the cohort roster used is now the shared
      `healthPercent` in the health module, used by both rosters.

- 70e56d4: **Assisted Combat guided tour**

    A new `SohlTour` — the second content tour after Character Creation — that
    teaches the Assisted Combat loop hands-on. It is **single-actor and "pretend"
    throughout**: no token, no scene, no encounter, and no required attack ordering,
    reflecting that Assisted Combat is an unopinionated _improved roll mechanic_. It
    coaches one Being you already own from a weapon on the sheet through an attack, an
    impact, and a recorded injury, while making explicit that (a) ATK / BLK / CX /
    Impact / Resolve Injury are each **independent** and runnable at any time, and (b)
    the system **rolls but does not adjudicate** — the opposed outcome is read off the
    **rulebook** (the tour's "pretend the broadsword hit" stands in for that human
    step).

    Two acts plus an independence call-out: arm the Being with a one-handed weapon, a
    two-handed weapon, a bow, and a shield _(gated on the archetypes)_; learn the
    two-handed **arm rule** — a bow held in one arm shows no strike mode, held in both
    its Ranged mode appears _(gated on the bow held in two limbs)_; roll ATK / BLK / CX
    and compute Impact _(free/advisory)_; then run the **Resolve Injury** action to
    create a wound from the impact-card values, and again from GM-given aspect + impact
    with **no roll at all** _(gated on a wound being recorded)_. Treatment is left to a
    future tour.

    Registered in **Tour Management**, referenced from the Combat Basics user guide,
    and covered by a new Cypress e2e (`assisted-combat-tour.cy.js`).

    Closes #620

- 8b0983a: **Roll a Mystical Ability by clicking its EML — retire the stub "perform" action**

    A Mystical Ability is now _invoked_ the same way a skill is rolled: click its
    **EML** value on the Being sheet's Mysteries tab to roll a **success test**
    against its Effective Mastery Level (hold **Shift** to skip the dialog). The
    cell reuses the same `successTest` intrinsic action skills use, so it also
    appears in the ability row's context menu.

    This replaces the previously unimplemented **perform** action, which only
    warned "not yet implemented". There is nothing special to automate about
    performing a mystical ability — the system **rolls but does not adjudicate**:
    the player reads the outcome and applies the ability's effect from the
    rulebook. Anyone who wants bespoke activation behavior can attach their own
    Script Action.

    Closes #74

- 6cfcfc7: **Cohort Shared Gear tab: see what the group has to hand**

    A Cohort now has a **Shared Gear** tab listing the gear its members carry and have
    marked as shared with the group — the party's rope, lantern, and rations gathered
    into one view, whoever's pack they are actually in.
    - **It is a view, not a store.** Each item stays on the member carrying it: nothing
      is copied onto the cohort, the weight still counts against its carrier's
      encumbrance, and only the carrier can use it. The tab is read-only — no drag and
      drop, no container reassignment, no carried/worn toggles, and no create or delete
      controls. Edit an item where it lives.
    - **The columns are the ordinary Gear tab's, plus _Carried By_** naming the
      custodian. **No combined weight is reported**: a sum across separate carriers is
      nobody's load.
    - **Sharing is set on the item**, on the character carrying it — a new **Shared
      With** control on every gear type's Properties tab, which appears only when the
      world has a Cohort. Because the setting lives on the item, its owner always
      decides what the group sees; a cohort can never claim gear.
    - **Sharing is keyed by the cohort's shortcode** — the stable key an author writes,
      matching how a cohort's Members list references its actors. Lists already holding
      a cohort's document id or UUID keep resolving, so no data changes and no migration
      is needed.

    Documentation updated: the Cohort and Gear user-guide pages and the common-tabs
    reference describe the tab, what it deliberately does not do, and how to share an
    item.

    Closes #76

- 39f68a8: **Being sheet: the Manuscript redesign**

    The Being sheet is rebuilt on the Manuscript visual design — a cohesive
    parchment-and-ink treatment shared across all ten tab templates, backed by a new
    SCSS component foundation (ledger, section-legend, status-pill, body-lozenge,
    health-bar, chip, disclosure, drag-grip, icon-button, add-button) and per-tab
    `apps/`-layer styles.

    **Header.** The identity row shows the name and shortcode as read-only text with
    an edit pencil (revealed on hover) that opens a single _Edit Identity_ dialog for
    name + shortcode together, replacing the inline name input. A health ramp
    (green → gold → red) drives both the band word and the bar fill; status effects
    render as toggleable pills with read-only affliction indicators; body parts show
    as impairment-colored lozenges.

    **Profile.** Now hosts the editable **Body Structure** tree (Zone → Part →
    Location) — collapsed by default with an expand/collapse-all toggle and per-node
    disclosure, owner-gated add / drag-sort / context-menu authoring, plus attribute
    score cards and an _Add Movement Profile_ control. The Combat tab keeps a
    read-only, flat armor-reference table of the same locations.

    **All tabs** move to the shared `ledger` row/cell structure with `section-legend`
    subtype headers, and adopt **present-only hiding** (`{{#if …length}}`): empty
    subtype groups are not rendered. One consequence: the always-visible empty
    _Combat Technique_ section from #714 no longer shows for a being with none
    (creation is still reachable via the tab's global _Add Skill_ footer) — that
    affordance was formally retired in #797.

    Stable JS hooks and `data-*` attributes are preserved, so actions, drag/drop,
    context menus, search filters, and the character-creation tour continue to work
    against the new markup.

    Closes #782

- 566a0f2: **Being sheet: character-sheet print / export (#795)**

    A window-header **print** control (`fa-print`) on the Being sheet renders a
    dedicated, document-first character record and opens the browser's print dialog —
    from which you choose print-to-printer, save-as-PDF, or (cancel and) save-HTML,
    all native browser behavior.
    - **One data layer, two presentations.** The print view is built from the same
      Foundry-free view-models the interactive tabs use (`being-sheet-view.ts`), not
      by scraping the live DOM. A new pure module (`being-print-view.ts`) adds the
      letterhead's health / status / injury summary lines and the plain-text
      charge / level formatters, so the record stays print-safe (color-coded pills and
      body lozenges are re-expressed as text for grayscale).
    - **Document-first Manuscript record.** All sections at once, static (values as
      text, no inputs / rollable cells / chrome), paginated. True-black ink on white,
      rubrication-red section rules, `@page` margins and repeating table headers,
      centered numeric columns. The top of the record is a magazine layout — a
      three-column band (attribute roster · portrait · description) then movement
      beside affiliations, then the skills laid out as per-subtype columns. The light
      Manuscript palette is forced (`data-theme="light"`) so it never flips to the dark
      token swap on a viewer whose browser prefers dark. The Actions tab is omitted —
      its runtime affordances have no place on a printed sheet.
    - **Detached window.** The record opens in a new `window.open` window with the
      system stylesheet linked by absolute URL and the two rich-text fields enriched to
      static HTML; `print()` fires only after the window's `load` and a fonts-ready
      tick. Available to any viewer of the sheet (no GM gating).

- c7ce0a2: **Roll the Manuscript design system onto every Item sheet**

    Every Item sheet now wears the same Manuscript skin the Being sheet adopted in
    epic #783: a slim, edit-focused header (image + inline name + shortcode lozenge +
    type label), and property tabs built from the shared BEM component set rather than
    the legacy flex-list widgets.

    **What changed**
    - A new item-sheet SCSS foundation: `array-list` (editable scalar/object array
      widget), `field-grid` (the property `formGroup` grid + field retune), an
      in-place Manuscript `fieldset`/`legend` treatment, a `prose-panel` card for the
      Description editor, and a slim `sheet-header` under the compound `.sohl.item`
      selector.
    - All 18 item property templates plus the shared header, Actions, Effects, Strike
      Modes, and Description partials rewritten to those components. Actions and
      Effects now use the shared `ledger` + `section-legend`, matching the Being
      sheet. Every behavioral hook is preserved: all `data-action` /
      `data-array` / `data-index` / `data-*` attributes, the JS-bound classes, and the
      legacy secondary classes (`strikemodes__row`, `name`, `armor-location`, …) kept
      as e2e selector anchors.
    - `SohlItemSheetBase` now adds the `item` frame class (the frame resolves to
      `sohl sheet item`), so the compound `.sohl.item` header rules match.
    - Dead legacy CSS superseded by the rewrites was pruned — the `.list-section` /
      `.actions-list` item-list blocks and the non-`ledger` effects-list scaffold —
      while `.gear-list` and the strike-mode secondary hooks (still used by the actor
      gear tab and by e2e) were kept.

    No data-model or localization-key changes; the redesign is presentation-only.

    Closes #800
    Closes #801
    Closes #802
    Closes #803
    Closes #804
    Closes #805
    Closes #806
    Closes #807

- 71cca3d: **General welcome card on first launch**

    New players now get a proper front door. On the first load of a world, each user
    receives a single, non-blocking **welcome chat card** that:
    - prominently links to the project site (**heroiclands.org**),
    - points at the bundled **User Guide** journals (in the _Journals_ compendium), and
    - **highly recommends the guided tours**, with a one-click **Start** button for the
      flagship Character Creation tour plus instructions to reach every tour from
      _Settings → Tour Management_.

    The card is whispered once per user (recorded by a `welcomeCardShown` flag) and only
    _offers_ the tour — it never auto-starts it. It replaces the old, never-rendered
    welcome **dialog**, whose `showWelcomeDialog` setting has been removed, and absorbs
    the former Character Creation tour-offer card so the welcome is no longer coupled to
    the tour.

    Closes #830

- f367dfd: **Skill Value Test (#848)**

    Adds a human-triggered **Success Value Test** to skills — a success test whose
    roll is graded into a **Success Value** (Index + Modifier) and **Success Stars**,
    for resolving sustained work (crafting, sailing, research) in one roll rather than
    many.

    **Special results are data, not code.** The new `successValueTest` intrinsic
    action drives the single, well-tested `MasteryLevelModifier.successTest` path with
    the skill's `svTable` and a grading `targetValueFunc` supplied in scope — no
    bespoke test method. `successValueTest` now posts its card (it previously computed
    silently with `noChat`) and marks the result as a Success Value test.

    **Standard test card, one presentation.** The result renders on the standard test
    card, which now shows the **Success Value** and **Success Stars** rows (its
    previously-dormant Success Value block, wired via a serialized `isSuccessValue`
    flag on the result) alongside the graded meaning text and the underlying
    roll/target/success level. The orphaned `skillvalue-result-card.hbs` (which had no
    render site) is removed.

    **Wording.** The standard Success Value table's result text — in
    `Success_Value_Tests.md` and the `SOHL.MasteryLevel.SvTable.*` strings — was
    rephrased in original wording; the mechanic (SV ≤ 0 no value, 1–2 little, 3–4
    base, 5–9 = one-to-five Success Stars) is unchanged.

- feb2a71: **Output Description to Chat — a shared item action**

    Every item now carries an **Output Description to Chat** intrinsic action that
    posts its description to the chat log, giving the previously orphaned
    `item-desc-card.hbs` a render site.
    - `SohlItemBaseLogic.outputDescription` is a human-triggered, informational card
      (no follow-up buttons) — it only _shows_ the item's own text and takes no action
      on any character, per the consent model.
    - The card is assembled by the pure, unit-testable `buildItemDescCardData` helper
      from the item's `name`, type-label subtitle, `notes`, optional `textReference`,
      and `charges` where the kind uses them. The description (`docHtml`) is enriched
      through the normal `fvttEnrichHTML` path and the card is rendered/sanitized by
      `buildActionCard`; item data is never interpolated into template source.

    Closes #849

- c9578b8: **Shock Test — a general shock primitive, not just for injuries**

    The being's standalone **Shock Test** action is now implemented. Shock is not
    specific to injury: blood loss, fear, and other systemic or psychological forces
    all drive a shock test by supplying a **base Shock State Index (SSI)**.
    - `BeingLogic.shockTest` takes a base SSI from the action scope
      (`shockIndex`/`baseShockIndex`) for a scripted cause, or collects it via a
      dialog when run by hand. It rolls the **Shock** skill **without** the body-part
      impairment penalty (the being's fatigue penalty still applies), adjusts the SSI
      by the result (CF +2 / MF +1 / MS 0 / CS −1), and maps it to a shock state
      (`≤6` None, `7` Stunned, `8` Incapacitated, `9` Unconscious, `≥10` Dead). A base
      SSI below 5 is No Shock and above 10 is immediate Dead, with no roll.
    - The resulting state is **offered** (a yes/no dialog), never applied without a
      human, and only ever _worsens_ the being's current state — recovery is the
      Shock Re-Test. Applying it clears every other shock status.
    - The injury Shock Test (`injuryShock`, #555) is refactored onto the same shared
      roll → SSI → state core; its behaviour is unchanged except that a wound whose
      index already exceeds 10 now resolves to Dead without a redundant roll.
    - New Foundry-free helpers `shockRollNeeded` and `shockStateLabelKey` in the shock
      module.

    Closes #850
    Part of #548

- 91a77da: **Stumble and Fumble intrinsic actions**

    Implement the two "keep control of your body" tests a combat mishap can flag, both
    previously stubbed to return `null`:
    - **Stumble** (#851) — a keep-your-footing test rolling the **better of** the
      being's Agility attribute and Acrobatics skill.
    - **Fumble** (#852) — an avoid-dropping test rolling the **better of** the being's
      Dexterity attribute and Legerdemain skill.

    Each sources its abilities from the **current** attribute/skill model (the removed
    `trait` item is gone), picks the higher effective mastery level (ties to the
    trained skill; either ability alone when the other is absent), and drives the one
    well-tested `MasteryLevelModifier.successTest` path. The bespoke keep-control
    result text ("Keeps Footing", "Stumbles", "Drops It", …) travels as **data** — a
    `successStarTable` passed in the action scope — rather than new bespoke test code,
    and renders on the standard test card. Both actions are **offered, never
    auto-performed**: they run only when the target's controlling player picks them
    (the attack card surfaces the flagged mishap as a prompt).

    Adds a Foundry-free `keepControlTable` builder, keep-control result-text
    localization keys, unit coverage (better-of selection in both directions, the
    no-ability guard, and the rendered card), and a Cypress e2e
    (`keep-control-tests.cy.js`).

    Closes #851
    Closes #852

- 8f65086: **Follow-up action buttons on the standard test result card**

    The standard success-test card (`standard-test-card.hbs` /
    `SuccessTestResult.toChat`) can now carry arbitrary follow-up **consent
    buttons**, the same way the action-card framework does. `toChat` accepts an
    optional `buttons` entry (one button or an array) in its data and folds it
    through the shared `toRenderableButtons` normalizer — scope pre-serialized,
    `skipDialog` defaulted — so each button renders with the well-known
    `action-card-button` handles (`data-action` / `data-handler-uuid` /
    `data-scope` / `data-skip-dialog`) and dispatches through the existing
    chat-card chokepoint. Buttons are offered, not fired: the target's controlling
    player accepts.

    Combined with `scope.successStarTable` (which already lets the single generic
    `successTest()` produce any bespoke result _mapping_ as data), a graded success
    test is now `successStarTable` (result mapping) **+** `buttons` (follow-up
    actions) — removing the last reason several bespoke result cards had to exist.
    The existing edit-pencil and _Perform Fate Test_ buttons are unchanged.

    `toRenderableButtons` (and its `RenderableButton` type) are now exported from
    `action-card.ts` so the card and the framework share one normalizer.

    Closes #853

- cb3ea61: **Wire up the Fate mechanic (post-roll success-level bump)**

    A player may now spend a Fate Point _after_ a test is rolled to raise that
    test's **success level** — the die is never re-rolled. Fate operates below the
    `successStarTable` mapping, so it works for any success test.

    **Rung-driven, not `isSuccess`.** Consumption and the level bump are keyed on the
    Fate test's **matched rung**, fixing the prior hiccup where a critical failure
    did not consume a point and the critical-success "keep" branch did:

    | Fate test result         | Fate Point | Bump |
    | ------------------------ | ---------- | ---- |
    | Critical Failure         | −1         | +0   |
    | Marginal Failure         | none       | +0   |
    | Marginal Success         | −1         | +1   |
    | Critical Success — spend | −1         | +2   |
    | Critical Success — keep  | none       | +1   |

    **Consent model.** The one branching outcome — a critical success — is asked via
    a **spend (+2) / keep (+1)** dialog, never auto-picked. When a point is consumed
    and more than one eligible Fate Mystery exists, the player picks the source
    (auto-picked otherwise, pre-selecting the most-restricted point so flexible
    general points are preserved).

    **Fate Points live on Mystery items.** `availableFate(skill)` now resolves the
    eligible `fate`-subtype Mysteries — general (`assocSkillCode` null) or specific
    to the tested skill — that still have a charge (infinite `charges.value === null`
    is honored and never decremented). The gate and the "points available" count
    derive from summing their charges.

    **Cards.** On resolution the original test's card is re-posted with the bumped
    success level (its description table re-resolves against the new level), and a
    Fate result card names the resolved path (point lost / no effect / +1 / +2 /
    retained +1) and the Mystery spent from. The standard test card's Fate button now
    carries the original result so a click reconstructs it as
    `context.scope.priorTestResult`.

    `AttackResult.fateSkillCode` exposes the melee skill behind a strike mode so an
    attack's Fate resolves against that skill's `fateMasteryLevel` / `availableFate`.

    Closes #854

- 5a0a7e3: **GM result-edit: re-evaluate a test card on its frozen roll (#856)**

    The **edit pencil** on every standard test result card is now a GM-only
    result-edit — the higher-fidelity counterpart to Fate. A GM re-opens the standard
    test dialog pre-filled with the result's current **Situational Modifier** and
    **Success Level Modifier**, adjusts them, and the test **re-evaluates on the same
    frozen roll** — never a re-roll, no Fate cost — then reposts the card.

    **Reconstruction, not a fresh test.** The pencil previously dispatched
    `successTest`, which started a brand-new d100. It now dispatches a `resultEdit`
    action carrying the result serialized under `priorTestResult` (the same
    reconstruction seam Fate uses). Changing the situational modifier changes the
    effective target, so the base success level re-derives from the frozen roll; the
    success-level modifier is a flat offset applied after. Clicking OK without a
    change is a no-op.

    **GM-gated, defense in depth.** The pencil is render-hidden from non-GMs
    (`gateEditActionPencil`, a per-viewer gate in the chat-render hook), and
    `resultEdit` refuses again at click time — so a synthesized click from a non-GM
    cannot re-evaluate a settled test.

    Works for any standard test card — skill, attribute, or combat strike mode —
    because the edit operates on the revived result itself rather than a live logic's
    modifier. Because a serialized result's `targetValueFunc` reverts to identity
    (functions are never serialized), a reposted **graded** success-value test grades
    against identity, matching the existing Fate repost behavior.

- d138e62: **Branded "Game System" section in the settings sidebar**

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

- 157482e: **Manuscript type scale for prose-editor headings**

    The rich-text (ProseMirror) editor on item Description tabs and the Being Façade
    appearance field now gives its headings an explicit Manuscript type scale instead
    of letting `h1`–`h6` inherit the body serif and the browser's default bold/sizing
    (which read as a generic word-processor heading and broke the vellum identity).

    A split hierarchy models the page: `h1`–`h2` use the **Cinzel** display face —
    echoing the sheet's section rubrics so prose titles read as the same book as the
    chrome around them — with `h1` carrying the rubrication-red ink as an illuminated
    top level; `h3`–`h6` use **Cormorant Garamond semibold** so subheads stay inside
    the running-text family and read as emphasis rather than six competing
    inscriptions. Heading levels now step through an even size/spacing scale, and all
    colors resolve from `--sohl-color-*` tokens so headings follow the light/dark
    swap. Body, blockquote, and code-block styling are unchanged.

    Closes #949

- b2dd9e0: **Mark experimental (fenced) document types across the UI**

    For the scoped beta, the document types whose schema is still moving — the
    **Cohort**, **Structure**, and **Vehicle** actors — are now visibly marked as
    experimental so testers don't build campaigns on schemas that may still change
    without an automatic migration. Everything is driven from a single `FENCED_TYPES`
    source of truth so the surfaces can't drift:
    - **Create dialog** — fenced actor types are suffixed with **(Experimental)** in
      the type picker. They stay selectable (labelled, not hidden), so testers can
      still create and exercise them.
    - **Sheet banner** — fenced actor sheets render a dismissible _"Experimental —
      schema not final"_ notice above the header. Dismissal is per-view: the caution
      returns next time the sheet is opened, because the schema really isn't final.
    - **README** — a Ready-for-play vs Experimental status table documents which types
      are frozen and which are still evolving.

    Mystery and Mystical Ability graduated into the frozen subset and are **not**
    fenced; the region-behavior `trigger` is GM-only and automated attack is a flow,
    not a creatable type, so neither is labelled here.

    Closes #959

- 768e2cc: **Arcane/Divine Incantation casting penalty**

    Arcane and Divine Incantations now apply a **Level × 2** penalty to their
    effective mastery level (EML), reflecting that higher-level spells are harder to
    invoke. The penalty is added during preparation as a named, auditable delta
    (**Level Penalty**) so it shows in the EML breakdown, and it stacks on top of
    the associated convocation skill's mastery level. Level `0` and level-less
    abilities add no penalty, and other Mystical Ability subtypes (talents, rites,
    devotions, …) are unaffected.

    Convocational _resistance_ — a caster's misalignment to a convocation — is
    modelled separately as an Active Effect on the convocation skill and is inherited
    into each spell's EML through the existing skill merge, so it composes with this
    per-spell Level penalty.

    Closes #969

- 575b342: **Skill Base computed from a value-returning `SafeExpression`**

    A skill's **Skill Base** (SB) is now computed by evaluating its
    `skillBaseFormula` as a sandboxed `SafeExpression` instead of the bespoke
    comma-DSL. The canonical HârnMaster reduction ships as an expression helper —
    `sb(attr.str, attr.dex)` — so the common case stays a one-liner, while groups
    that home-rule SB write the arithmetic themselves (multipliers, flat modifiers,
    conditionals). Attribute **values** are exposed under an `attr.` namespace
    (`attr.<shortcode>` → the attribute's effective score); an absent reference
    resolves to `0` (a world-item skill, or an attribute the actor lacks), never an
    error.

    New global expression helpers: `sb(...values)` — 1 value → itself, 2 → average
    rounded up iff the primary exceeds the secondary else down, 3+ → average rounded
    to nearest (no clamp); and `birthsignBonus(birthsigns, code, amount)` — the
    amount when `code` is among the actor's birthsigns, else `0`. Birthsign bonuses
    now **stack** (sum multiple terms) rather than applying largest-only.

    An **invalid formula** (syntax error, unknown helper, non-numeric result) is now a
    visible, actionable state rather than a silent `0`: the internal SB falls back to
    `0`, the Being sheet's SB cell shows an ✕, and the Skill item sheet shows
    `Invalid expression: <message>` next to the formula field. The
    Aura-in-formula → fate-disabled rule is preserved via an AST walk
    (`SafeExpression.attrRefs()`) rather than a regex.

    All 65 shipped skill formulas were converted to the new syntax with identical
    computed SB (pre-Beta — no world migration).

    Closes #972

- a33ada6: **Pick shortcode references from a dropdown when embedded on an actor**

    Reference fields that point at another item by its **shortcode** — a Skill's
    parent skill (`parentSkillCode`), a Mystery's / Mystical Ability's / strike
    mode's associated skill (`assocSkillCode`), and a Trauma's hit location
    (`bodyLocationCode`) — used to be free-text inputs, so authoring them meant
    knowing the exact shortcode by heart and a typo silently produced a dangling
    reference. They now render as a **dropdown** whenever the item is embedded on an
    actor: the author picks the target by display name and the field stores the same
    shortcode string it always did (no schema change, no migration). A world/pack
    item — where no candidate list exists — keeps the free-text input so references
    can still be set up ahead of placement.

    A stored shortcode that matches no item on the actor is shown as a selected,
    flagged `"<code> (unresolved)"` option rather than being blanked, so the value is
    preserved and the problem is visible.

    Introduces a single reusable widget: a Foundry-free options-builder
    (`buildRefOptions` / `actorItemRefOptions`, unit-tested) plus the
    `shortcodeRefField` Handlebars partial that the Skill, Mystery, Mystical Ability,
    Trauma, and strike-mode sheets all invoke.

    Closes #974

- 2fbe9a4: **Boon and Boost skill-affecting Mystery subtypes; birthsign relocation**

    Two new source-agnostic, skill-affecting Mystery subtypes, replacing the dead
    `blessing` and the mislabelled `buff`:
    - **`boon`** — a flat `±N` modifier to an associated skill's mastery level (EML),
      from any source.
    - **`boost`** — one or more temporary mastery boosts to an associated skill via
      the Mastery Boost table.

    Both effects are **live-derived**: the Mystery resolves its target skill via
    `assocSkillCode` and, while active (a present, non-zero level), contributes a
    delta onto the real skill's `MasteryLevelModifier` each prepare cycle. Nothing is
    persisted, so the effect applies only while the Mystery is present and **reverts
    automatically** when it lapses. The Mystery's `level` carries the magnitude —
    `±N` for a Boon, the boost count `N` for a Boost.

    The **birthsign** Skill-Base contribution now keys off the `birthsign` subtype
    (previously mislabelled `buff`). `MYSTERY_SUBTYPE` **adds** `boon`/`boost` and
    **removes** `blessing`/`buff` (pre-Beta — no migration). The Mastery Boost table
    (`calcMasteryBoost`) is lifted from `SkillLogic`'s private scope into a shared
    Foundry-free `masteryBoost` module and reused by the Boost logic.

    The absent-skill Boost path — conferring a skill the character lacks as a
    transient, rollable skill — is deferred to a later, spike-gated phase; the boost
    arithmetic for it lands here (`computeBoostContribution`) and is unit-tested.

    Closes #975

- dcb27eb: **Boost Mysteries can confer a skill the character doesn't have**

    A Boost Mystery whose associated skill is absent from the character now offers to
    add that skill so the Boost has something to act on — completing the other half of
    the Boon/Boost feature.
    - When a Boost is **dropped onto an actor** and names a skill the actor lacks, a
      dialog offers to add that skill (resolved from the world or a compendium by its
      shortcode) as a real, **unlearned** skill at mastery level 0. Nothing happens
      without that consent; a shortcode that matches no skill is reported, not added.
    - Once present, the Boost **opens the unlearned skill at its Skill Base** and
      compounds the remaining boosts (per the Mastery Boost table), so it renders and
      rolls like any other skill. A Boost with `N = 1` confers the skill at exactly its
      Skill Base.
    - The conferred skill is an ordinary embedded skill, not a temporary one: if the
      Boost later lapses it simply sits at mastery level 0 until its owner deletes it —
      there is no hidden state to unwind.

    Because an embedded Mystery picks its associated skill from the actor's own skills,
    this absent-skill case only arises from a world/compendium Boost dropped onto an
    actor — which is exactly where the offer appears.

    Closes #981

- 8b83ce8: **Shortcode dropdowns for body-structure entity references**

    Completes #974's coverage (Phase 2): the body-structure parent references —
    a body part's zone and a hit location's part — are now **picked from a dropdown**
    of the body's own entities in the Body Part / Body Location config editors, rather
    than being the drag-only re-parenting they were before.
    - **Body Part editor:** a new **Zone** dropdown lists the body's zones, so a part
      picks its parent zone by display name; changing it re-parents the part.
    - **Body Location editor:** the former static owning-part label becomes a **Body
      Part** dropdown of the body's parts; changing it re-parents the location.

    Both reuse Phase 1's `buildRefOptions` and the `shortcodeRefField` partial. A
    stored code that matches no current zone/part is preserved as a flagged
    `"<code> (unresolved)"` option rather than being blanked, and a re-parent is
    accepted only when the picked code names an existing entity. Two new
    `BodyStructure` accessors — `getAllZones()` / `getAllParts()` — source the option
    lists, mirroring `getAllLocations()`. No data-model change or migration (the
    fields stay shortcode-storing `StringField`s).

    Closes #982

- ed5dbb4: **Per-subType Mystical Ability columns, a Chgs/Max cell, Spirit Power association, and charge consumption on roll**

    On the Being sheet's Mysteries tab, each Mystical Ability sub-type now renders
    only the columns meaningful to it, spirit-based rites resolve a Spirit Power, and
    invoking an ability consumes a charge.
    - **Per-subType columns.** `Ability`, `EML`, `Chgs/Max`, and `Notes` show for every
      sub-type; `Skill` is hidden for the intrinsic talents (`arcanetalent`,
      `spirittalent`), and `Lvl` shows only where the sub-type has a meaningful power
      level (`spiritpower`, `divineincantation`, `arcaneincantation`, `arcanetalent`,
      `spirittalent`). The column set is data-driven, mirroring the Trauma tab's
      `MYSTICALABILITY_SUBTYPE_COLUMNS`. A sub-type section still appears only when at
      least one item of that sub-type exists.
    - **Spirit Power association.** `spiritrite` and `spiritaction` are governed by a
      **Spirit Power** rather than a skill: their assoc column is labelled "Spirit
      Power", the shortcode resolves to a SPIRITPOWER Mystical Ability on the actor,
      and the ability's EML is derived from that Spirit Power's mastery level. When no
      valid Spirit Power is associated the row is disabled (greyed, un-rollable).
    - **Skill cell.** Shows the associated skill's (or Spirit Power's) name, or an `✕`
      when none is associated.
    - **Chgs/Max cell.** Renders `<charges left>/<max>`; `✕` when the ability does not
      use charges, `∞` for the infinite-remaining or uncapped-maximum states.
    - **Ritual Action mastery merge.** A `ritualaction` only pulls its ritual skill's
      mastery level into its EML when that skill actually has one (an unlearned
      ritual's mastery level is disabled and no longer seeds the ability).
    - **Charge consumption.** Making an ability's EML roll decrements its charge count
      by one when it uses finite, capped charges. When charges reach 0 the row is
      greyed out and the roll is blocked until the ability is recharged (the row's
      context menu stays available). Consuming a charge is a direct consequence of the
      player's own roll, so it needs no separate confirmation.
    - **Sub-type rename.** The `divinedevotion` sub-type is renamed to `ritualaction`
      ("Ritual Action"). Pre-beta with no existing worlds, so no migration is required.

    Closes #990

- f2aefa2: **Add a Skill level and a Skills-tab Level column**

    Skills gain a numeric `levelBase` property (default `null`) and a derived `level`
    `ValueModifier` seeded from it, mirroring the Mystery `levelBase` → `level`
    pattern.
    - **`level` modifier.** Seeded from `levelBase` in `SkillLogic.initialize`. A
      `null` base means the skill has _no level_ and leaves the modifier disabled; a
      stored `0` is a real level and stays enabled.
    - **Level column.** The Being sheet's Skills tab now renders a **Level** column
      immediately after the skill name (before Skill Base). It shows the level, or an
      ✕ (`fa-xmark`) when the level is disabled.

    No migration is required — the field defaults to `null`, so a skill whose source
    omits `levelBase` initializes to "no level".

    Documentation: the skill's User Guide entry now documents the **Level** property,
    and a new **Skill Levels** rules journal explains the level/circle concept for
    arcane and divine/ritual skills.

    Closes #992

- 67ec102: **Generalize the Skill Levels rules journal into a Skills overview**

    The narrow **Skill Levels** rules journal (`Rules/Skill_Levels.md`) becomes a
    broader **Skills** journal (`Rules/Skills.md`) that introduces how skills are
    rated and tested, then links out to the detailed rules pages:
    - **Success Tests** — d100 vs. Effective Mastery Level, the CF/MF/MS/CS success
      levels, and the extended **CS+1 / CS+2 / CF−1 / CF−2** notation.
    - **Opposed Tests** — highest positive success level wins; victory degrees.
    - **Success Value Tests** — Index + success-level modifier, and **Success Stars**.
    - **Secondary Mastery** — Secondary Modifier and Secondary Roll.
    - **Skill Levels** — the existing level/circle material, retained as its own
      section.

    The Rules index's `## Skills` section now points at the generalized page. The
    journal keeps its original `id` and gains `Skills`/`Skill` aliases (the old
    `Skill Levels`/`Circle` aliases remain), so existing wikilinks still resolve.

    Closes #994

- f5cc6a1: **Action-card framework + self-sufficient treatment flow**

    Add the connective tissue for the consent model: **action cards** — chat cards
    whose buttons each invoke a _self-sufficient action_, the same action a human
    could run from a sheet or context menu, just pre-filled. The card is never
    special or privileged; it carries the action's parameters and a `skipDialog`
    marker, so a click runs exactly what a player could have done by hand. Nothing is
    consumed or locked — state lives in the posted cards, so a card can be ignored,
    answered later, or overridden.
    - **`buildActionCard(spec)`** — a pure assembler: it renders a caller-authored
      card **body** (its own template or inline content — buttons are not part of it)
      and appends the standard button block, returning the finished HTML.
      **`postActionCard(speaker, spec)`** posts it via `speaker.toChat`. A card's
      `buttons` may be one, many (e.g. an attack card's four defenses), or none (an
      informational result).
    - **Open, capability-gated buttons** — a button whose handler is the `@self`
      sentinel resolves at click to the clicking user's own `game.user.character`;
      the action self-gates. `gateActionCardButtons` shows `@self` buttons to everyone
      and hides owner-targeted buttons from non-owners.
    - **Single chokepoint** — `dispatchChatCardAction` reads `data-skip-dialog` and
      runs the action with `skipDialog`, so the card path and the by-hand path call
      the same self-sufficient executor.
    - **Treatment flow** — three independently runnable actions: **Request Treatment**
      (a wound's context-menu action) posts an open Perform card; **Perform Treatment
      Test** (a Being action — run from the card, or by hand with a dialog that takes
      a pasted injury UUID or a GM-described severity/aspect) rolls the physician's own
      Physician skill and posts a result, with an owner-gated **Accept** button when it
      has a target wound; **Treat Injury** (a wound's context-menu action — run from
      the Accept button, or by hand via a Healing-Rate dialog) records the rate. The
      physician never touches the patient's wound; the patient's own click does.

    Closes #576

- 78e87dc: **Actor-first data preparation with post-phase action executors**

    `SohlActor.prepareDerivedData` now interleaves the actor's own logic phases with
    its items' phases instead of running the actor entirely after every item, and it
    dispatches post-phase intrinsic-action executors.
    - Order per preparation cycle: actor `initialize` → items `initialize` (then
      items' initial Active Effects) → actor `evaluate` → items `evaluate` → items
      `finalize` → actor `finalize`. The actor's `initialize` and `evaluate` now
      precede the items' corresponding phases, so actor-level state (e.g. `pull` and
      the body structure) is ready before weapons resolve their available strike
      modes.
    - After each phase, the matching `postInitialize` / `postEvaluate` /
      `postFinalize` intrinsic action (when one is defined) is executed for the actor
      and for each item, alongside the existing `sohl.*.post*` hooks.

- 6ab1a59: **`sohl.addScriptAction` — programmatic Script Action attach**

    Add the last owed API from the generic-scheduler epic (#588, deliverable §7): a
    clean, first-class way to bind a Foundry Macro to a host document as a SCRIPT
    action, so a module or macro can attach an action and then schedule it — without
    hand-rolling the full `system.actionDefs` shape.
    - **`sohl.addScriptAction(doc, spec)`** — sibling of `sohl.schedule` /
      `sohl.unschedule` / `sohl.worldHost`. Takes a minimal spec (`{ name, executor }`
      plus optional `title` / `scope` / `iconFAClass` / `group` / `minActorOwnership`
      / `trigger` / `visible`), fills the same sensible defaults as the sheet's
      "create action" control, and persists by writing the whole `actionDefs` array
      (upsert by identity, never by index).
    - **`name` is the identity.** It becomes both the action's `shortcode` — what
      `sohl.schedule(doc, name, …)` and the `[Perform]` reminder address — and its
      default `title`. Re-attaching the same `name` **replaces** the entry rather than
      duplicating it, so an init hook is safe to run on every reload.
    - **`executor` is a Foundry Macro UUID** — a reference, never inline code.
      Authoring is GM-gated (the same rule `SohlActor` / `SohlItem` enforce at the
      persist boundary) and execution runs through `Macro#execute`; this assembles and
      persists the reference only, compiling nothing.

    With this, the charter's "Check For Bandits" worked example runs end to end:
    `sohl.worldHost()` → `sohl.addScriptAction(world, { name, executor })` →
    `sohl.schedule(world, name, 4*3600, { visibility: "gm" })` yields a recurring,
    GM-hidden `[Perform]` reminder that survives reloads and runs the Macro on click —
    with no core schema change.

    Closes #605.

- c116b56: Implement the Affliction intrinsic actions, and move contagion to the receiving character ([#1183](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1183), supersedes [#1126](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1126)).

    **Contagion is now the receiving character's roll**

    _Contract Disease_ is replaced by a **Contagion Check** / **Contagion Test** pair on the Being. Anyone may post a Contagion Check on anyone — exposure is something the world does to a character — but the test itself is made on the exposed character's own sheet. There is no longer any notion of transmitting an affliction _at_ someone; the check is always on the receiving side.

    The Contagion Test dialog asks which affliction (a dropdown keyed by shortcode), a Situational Modifier, a Success Level Modifier, and whether a contracted affliction is recorded on the sheet — that checkbox defaulting from the **Record Trauma** world setting. The roll is against **Contagion Index × Endurance**; failing it catches the affliction. A marginal failure incubates for a full roll of the new **Onset Formula**, a critical failure for half that (rounded down, `0` meaning immediate). Nothing ever offers to schedule another contagion test.

    **The affliction's course is now a Check/Test pair**

    The hidden `healingCheck` recurrence — which rolled every missed interval in one pass and applied the results unasked — is replaced by **Course Check** (offers, changes nothing) and **Course Test** (rolls once, applies the outcome). One check yields exactly one test. Because each test schedules the next from _the last test's date_ rather than from the moment it was performed, a character who has fallen behind simply has a test already due, and the backlog drains one consent at a time with the illness's original cadence intact.

    The Course Test opens the standard test dialog, confirms before touching the character sheet, and posts a result card saying whether the outcome was applied. Defeating an affliction (Healing Rate 6+) now also removes the Weakness Fatigue it inflicted, and a repeated reaction updates the existing fatigue entry instead of stacking a second one.

    **Treatment**

    New **Request Treatment** and **Treat Affliction** actions, plus **Perform Affliction Treatment** on the Being. A physician's Success Value test proposes a **Course Bonus** from its Success Stars, which the patient accepts; a bonus above zero becomes a visible Active Effect on the affliction rather than a hidden adjustment. Treatment improves the odds on later Course Tests — it does not cure anything.

    **New modifiers and effect keys**

    `AfflictionLogic` gains **`course`** and **`healing`** ValueModifiers, both based on Healing Rate × Healing Base, with matching `COURSE` (`mod:logic.course`) and `HEALING` (`mod:logic.healing`) effect keys — so Active Effects can now modify what an affliction is tested against.

    **Removals**

    The unimplemented Affliction actions are gone along with their executors: _Transmit Affliction_, _Contract Test_, _Treatment Test_, _Diagnosis Test_, _Fatigue Test_, _Morale Test_, and _Fear Test_ — several of which threw an uncaught error when clicked. _Course Test_ and _Healing Test_ were stubs of the same kind but are reimplemented rather than removed. The unused `diagnosisBonusBase` field goes with them.

    The system is pre-beta, so none of this ships a world migration: there is no released data to preserve.

- e3f270a: **Afflictions: richer Being-sheet list and a complete Affliction sheet (#943)**

          The Being sheet's afflictions list now shows **Name, Category, Level, HR, Next
          Heal Test** — the former free-text "Source" column is now an explicit **Category**
          column, and a calendar-formatted **Next Heal Test** replaces the Notes column.

          The Affliction item sheet now surfaces every field, including the previously
          unexposed **Onset Macro UUID** and **Outcome Trauma**, with the world-time dates
          (Contract, Treatment, Onset, Resolution) shown through the calendar-aware date
          picker. Three **view-only** projected dates are added: **Next Heal Test**,
          **Est. Onset Date**, and **Est. Resolution Date**.

          The projections are queue-first with an arithmetic fallback: Next Heal Test uses
          the live `scheduledActions` next-fire time for the armed healing check (so an
          accepted reschedule is reflected), else `(onsetDate ?? contractDate) +

    healingCheckDurationBase`; Est. Onset Date is `contractDate + onsetDurationBase`;
  Est. Resolution Date is `(onsetDate ?? contractDate) + resolutionDurationBase`.
    These are display-only and never persisted.

- c805aa2: **Affliction Course Test + Reaction effect**

    A symptomatic, naturally-healing affliction now fights its **course**: its
    recurring check applies a **Course Test** at each elapsed checkpoint — a headless
    test of `Healing Base × Healing Rate` that changes the affliction's Healing Rate
    (CF −2, MF −1, MS +1, CS +2). The resulting HR drives the host's **Reaction**:
    HR 6+ defeats the affliction (the course stops), HR 5 / 4 inflict 5 / 10 weakness
    fatigue, and HR 3 / 2 / 1 / <1 impose Stunned / Incapacitated / Unconscious / Dead
    shock (worsening the being's shock state to at least that level, never improving
    it). A shared `inflictWeaknessFatigue` helper (also used by blood-loss anemia)
    creates the fatigue traumas. Part of #548. Closes #489

- c805aa2: **Affliction onset effect + optional onset Macro**

    At onset, an affliction now runs its onset effect: it is already marked
    symptomatic (`onsetDate` crystallized) and starts its course/resolution cycle —
    symptoms themselves are role-played, out of VTT scope — and it may name an
    **optional onset Macro**. A new `system.onsetMacroUuid` (a Macro UUID reference,
    never source) runs once on the active GM right after onset is recorded, with a
    `scope` of `{ affliction, actor }`, and may schedule further events. See the
    House Rules Cookbook (Recipe 4) for authoring. Part of #548. Closes #488

- d6219e2: **Affliction: disease/poison phase progression over world time**

    Afflictions now progress through their phases on the event queue, mirroring the
    Trauma healing/blood-loss scheduling. Adds temporal fields to Affliction
    (`contractDate`, an `onset` and `resolution` one-shot triplet, and a recurring
    `healingCheck` triplet via the schema helpers). On creation `_preCreate` seeds
    `contractDate` and the incubation interval; `AfflictionLogic.finalize()` arms the
    correct event by phase:
    - **incubating** → the `onsetCheck` transition;
    - **symptomatic** → the `resolutionCheck` transition plus the recurring
      `healingCheck`;
    - **resolved** → nothing.

    The `onsetCheck` / `healingCheck` / `resolutionCheck` intrinsic actions advance
    the phase (crystallizing `onsetDate` / `resolutionDate` and rolling the next
    intervals) and re-arm — reusable from the timed event or manually. The
    per-phase roll **effects** are tracked as follow-ups (#488 onset, #489
    course/recovery, #490 resolution).

    Refs #483.

- c805aa2: **Affliction resolution outcome (outcome + outcomeTrauma)**

    When an affliction reaches the end of its symptomatic period without being
    defeated (Healing Rate below 6), its authored **outcome** is now applied. Two new
    fields:
    - **`system.outcome`** (`AFFLICTION_OUTCOME.DEATH` | `CURED`, default `cured`) —
      `DEATH` sets the being's shock state to Dead; `CURED` sets Healing Rate to 6.
    - **`system.outcomeTrauma`** (optional) — a `SafeExpression` evaluating to a trauma
      shortcode, or an array of shortcodes, the host contracts as part of the outcome.
      Matches are resolved world-items-first, then compendiums, via a new
      `fvttFindItemByShortcode` shim.

    The two combine (e.g. `CURED` + `outcomeTrauma: "'weakness20'"` cures the
    affliction but adds the `weakness20` trauma). See House Rules Cookbook (Recipe 5)
    for authoring. Part of #548. Closes #490

- 31aa4c2: **Archetype-first Create dialog: default Name/Shortcode from the chosen archetype**

    The **Create Actor / Create Item** dialog is now **archetype-first**. You choose
    _what kind of thing_ (Type → SubType → Archetype) up front, and **Name** and
    **Shortcode** follow as **optional** fields that default to the chosen archetype's
    own name and shortcode. Starting from a template no longer discards its identity —
    pick _Broadsword_ and confirm, and you get a "Broadsword" with shortcode `brdswd`,
    not a generic "New Weapon".
    - **Fields reordered and made optional.** The dialog lays out **Type → SubType →
      Archetype → Name → Shortcode**; Name and Shortcode are no longer required.
    - **Live defaults from the archetype.** Selecting an archetype pre-fills Name and
      Shortcode from its `name` / `system.shortcode`, updating as the archetype
      selection changes; a field you type into is left alone. Blank means "use the
      archetype's".
    - **(none) is unchanged.** The deliberate blank-slate choice still defaults Name to
      the class default and derives the Shortcode from the Name.
    - **Uniqueness preserved.** A second document from the same archetype still
      auto-bumps its shortcode (`broadsword`, `broadsword2`, …).
    - Works for **both** Item and Actor creation (both route through the shared create
      dialog). The identity-resolution rules are lifted into a Foundry-free,
      unit-tested helper (`sohl.entity.archetype.resolveCreateIdentity`).

    Closes #643

- 5c98952: **Worn state is armor-only (`isWorn`)**

    The worn/equipped concept now belongs to armor alone. Previously every gear
    subtype (weapon, container, concoction, projectile, misc, and armor) carried a
    generic `isEquipped` flag and rendered an "Equipped" checkbox on its properties
    tab — dead weight and a misleading control everywhere but armor.
    - `system.isEquipped` is removed from the shared gear data model; armor gains
      `system.isWorn` (`BooleanField`, `initial: false`).
    - Only the **armor** properties sheet shows the worn control (labelled "Worn").
      The "Equipped" form-group is gone from weapon, container, concoction,
      projectile, and misc gear.
    - `ArmorGearLogic` gains a `toggleWorn` intrinsic action (mirroring
      `toggleCarried`) that flips `system.isWorn`; the Being gear-list worn toggle
      and the armor-protection aggregation now read/write the armor-scoped field.
    - New `SOHL.ArmorGear.FIELDS.isWorn.*` and `SOHL.ArmorGear.Action.toggleWorn`
      localization keys (the unused `SOHL.Gear.FIELDS.isEquipped.*` keys are retained
      per the stable-keys rule).

    Closes #662

- a2df624: **Migrate the automated attack card onto the action-card framework**

    Assemble the automated-combat attack card the same way every action card is
    built — a body template plus a `buttons` array handed to `buildActionCard` —
    instead of hand-writing the four defense buttons in the template. This makes the
    framework's multi-button case (one card, four defenses, all addressed to the
    defender) a first-class use of `buildActionCard`, and it fixes a latent
    addressing bug in the process.
    - `buildAttackCardData` now returns an `ActionCardSpec` (body `data` + a
      `buttons` array); `attack-card.hbs` is body-only. The four defenses (Dodge /
      Counterstrike / Block / Ignore) are emitted as `action-card-button`s carrying
      the evaluated `AttackResult` in each button's `scope` (revived by the resume
      executors as `context.scope.attackResult`), and `skipDialog`.
    - **Bug fix:** the defense buttons are now addressed to the defender's
      **combatant** (`AttackCardTarget.combatantUuid`), not its actor. The resume
      executors live on the combatant logic, the click dispatch routes through the
      combatant's `onChatCardButton`, and the render gate reaches the actor via
      `combatant.actor` — so the previous actor-uuid address left a rendered attack
      card's defenses mis-resolved (gated down to Ignore, which then did nothing).
    - `gateAutomatedDefenseButtons` reads the handler the same way the dispatcher
      does (`data-handler-uuid`), and per-defender capability gating is unchanged.
    - Adds a Node-only test helper (`renderRealTemplate`) that renders SoHL `.hbs`
      with real Handlebars, so the attack card's assembled button HTML — the
      combatant uuid, `skipDialog`, and the `action-card-button` class — is asserted
      without a running Foundry.

    Closes #578

- c805aa2: **Fatigue system — Fatigue Penalty from fatigue traumas**

    Fatigue is modeled as `fatigue`-subtype **traumas** (windedness / weariness /
    weakness recorded as separate instances because each recovers at its own rate),
    not a being field. `BeingLogic.fatiguePenalty` is a derived `ValueModifier` that
    sums the Fatigue Levels across every fatigue trauma, seeded in `finalize()`. The
    penalty applies to tests and Move rate (consumers read `fatiguePenalty.effective`;
    the shock and course tests fold it in). Part of #548. Closes #552

- 667a6a8: **Being Gear tab display**

    The Gear tab now lists gear under **On Body** and under **each container** as its
    own section, with Type / Qty / Weight / Qual / Dur / Notes columns, plus the
    carried/worn toggles and a per-row context menu.
    - **On Body** summarizes the being's overall load: total carried-gear weight
      (accumulated ground-up on `BeingLogic.carriedWeight`) and the resulting
      **encumbrance** for its active movement medium, e.g. _Carried: 10 lb · Enc 2_.
      An incorporeal being (empty body structure) shows 0 encumbrance.
    - **Containers** each show their own used / max capacity (from the container's
      max capacity).

    Completes the Gear-tab epic (#301).

    Closes #302

- 26e1148: **Compute a being's Healing Base**

    `BeingLogic.healingBase` — previously declared but never assigned — is now a
    derived `ValueModifier`, seeded during `evaluate()` to the average of the being's
    **Endurance** and **Will** scores (the fraction rounded **up when END > WIL**,
    **down otherwise**), and left open to trauma and treatment deltas on top. A being
    with no Endurance or Will attribute (e.g. an incorporeal being) keeps an empty
    modifier (base `0`).

    Multiplied by a Healing Rate, the Healing Base is the mastery level of nearly
    every recovery test in the system (the Injury Healing Test, the affliction Course
    Test, the Infection Healing Test, and the Extended Shock / Coma course tests), so
    this is a foundation for the trauma / shock / affliction timed effects. The
    rounding rule is a pure, Foundry-free helper (`healingBaseFor`).

    Part of #548. Closes #549

- 5c65d04: **Fix the Being sheet's cross-cutting layout & wiring defects (#513)**

    Four defects that affected every Being content tab, each fixed once at the shared sheet layer:
    - **Context menus now work (#517).** `_contextMenu()` was never called, so right-clicking an item row and clicking its ⋮ control did nothing — there was no way to edit or delete anything created on the sheet. It is now bound in `BeingSheet._onRender`, so both open the item's context menu.
    - **Content tabs scroll (#514).** The content tabs were `overflow-y: hidden`, so anything past the sheet height was unreachable. The Being tabs now scroll (`overflow-y: auto`), and each content part is marked `scrollable` so the scroll position survives the submit-on-change re-render.
    - **Search fields render light (#516).** The search inputs are `type="search"`, which the light-field CSS didn't cover, so they rendered as a dark bar. `input[type="search"]` is now styled like the other inputs.
    - **List rows are compact (#515).** The Being lists use the shared `.list__*` markup but not the `.list-section .list` wrapper the item lists use, so row names rendered as oversized headings. Compact-row styling is now applied to the Being lists' BEM classes.

- c805aa2: **Shock-state infrastructure**

    A being's **shock state** is now modeled as the Stunned / Incapacitated /
    Unconscious / Dead **status effects** — there is no separate persisted field.
    `BeingLogic.shockState` reports the highest active shock status as an ascending
    severity level (`NONE` 0 … `DEAD` 4), and all transitions go through a single
    `setShockState(level)` operation that clears every shock status then applies only
    the target's (none for `NONE`), keeping transitions clean in both directions and
    repairing any stray multi-status situation. `advanceShockState(steps)` moves from
    the current state by N levels (clamped). The ordered model lives in a pure,
    Foundry-free `shock.ts`; a new `fvttToggleActorStatus` shim applies the statuses.

    Foundation for the trauma / shock / affliction timed effects (blood-loss advance,
    injury shock, shock re-tests). Part of #548. Closes #550

- df20718: **Being Trauma tab — Afflictions section**

    The Trauma tab's afflictions list now groups afflictions by subtype and shows
    each with its level, healing rate, source, and notes — with a search box, a
    custom-create control (`data-type=affliction`), and a per-row context menu. This
    completes the Trauma-tab epic (#304) alongside the Traumas section (#308).

    The `Created` / `Course Test` / `Recovery Test` timer columns are deferred to a
    follow-up (#359): they depend on world-time fields and the affliction
    course/recovery mechanics (#65 / #67 / #68).

    Closes #309

- 088cb1e: **Being Trauma tab — Traumas (injuries) section**

    The Trauma tab's injuries list now shows each trauma with its severity band
    (M1 / S2 / S3 / G4 / G5), healing rate (an `NT` prefix when untreated), localized
    impact aspect, resolved body location (Area), bleeding state, and notes — with a
    custom-create control (a blank trauma, `data-type=trauma`) alongside the existing
    Add-Injury roll, and a per-row context menu.

    The `Created` and `Next Healing` timer columns from the design are deferred to a
    follow-up (#356): they depend on new world-time fields and the trauma
    healing-test mechanic (#73).

    Closes #308

- 9655d35: **Document the bleeding, trauma, and affliction rules**

    Three new rules journals under the Rules folder, linked from the Song of Heroic
    Lands Rules index (new "Health, Injury & Recovery" section):
    - **Bleeding** — the Blood Loss Advance Test (every 5 minutes vs. Strength ML),
      Blood Loss Points and the Shock State progression (No Shock → Stunned →
      Incapacitated → Unconscious → Dead), the anemia weakness-fatigue, and the
      Physician's Blood Stoppage Test with its request/accept flow.
    - **Trauma** — the trauma taxonomy (body / mind / psyche / spirit), and Physical
      Trauma's Injury Healing Test (a Healing Roll made per injury), including the
      rule that an active infection suspends all Injury Healing Tests until every
      infection is defeated, and how a critically-failed test causes infection.
    - **Afflictions** — the three phases (incubation → symptomatic → outcome),
      dormancy, the Course Test against Healing Base × Healing Rate, the reaction
      table by Healing Rate, the final outcome (death / cure / `outcomeTraits` /
      `outcomeTraumas`), and **infections** (an affliction with Healing Rate = injury
      HR + 1 and its own reaction table).

    These capture the rules the timed trauma/affliction processes are built on.

    Closes #543

- c805aa2: **Blood Loss Advance Test effect (+ dispatch-bug fix)**

    A bleeding injury's recurring blood-loss event now applies the **Blood Loss
    Advance Test** at each elapsed checkpoint. With no physician accepting the Blood
    Stoppage request, it auto-resolves as though the Blood Stoppage Test were a
    critical failure — the bleeding continues (the interactive physician Accept card
    is #547). Each test rolls against the victim's Strength Mastery Level and accrues
    Blood Loss Points (CF +3, MF +2, MS +1, CS 0); each BLP advances the being's shock
    state one step (toward Dead) and inflicts 5 Fatigue Levels of weakness fatigue
    (anemia).

    Also fixes a latent dispatch bug: the trauma scheduled blood-loss under the kind
    `trauma::bloodLossAdvanceRoll` while the action executor is `bloodLossAdvanceCheck`,
    so the event never dispatched — the kind now matches the shortcode. Part of #548.
    Closes #487

- 2ede925: **Interactive Blood Stoppage flow (#547)**

    Add the physician **Accept**-card flow for bleeders — the cross-client sibling of
    the treatment flow, built on the action-card framework.
    - **Request Blood Stoppage** (`TraumaLogic.requestBloodStoppage`, on a bleeding
      wound) posts an **open** card any Physician-skilled character's controller may
      answer.
    - **Perform Blood Stoppage** (`BeingLogic.performBloodStoppage`) is a
      self-sufficient physician action: it rolls the physician's own Physician skill
      (plus any +10 carried from a prior Marginal Failure) and posts a result with an
      owner-gated **Accept** button.
    - **Accept** (`TraumaLogic.acceptBloodStoppage`, on the wound) relays the outcome
      back to the bleeder: **CS** stops the bleeding immediately, **MS** stops it after
      the next Blood Loss Advance (honored by `bloodLossAdvanceCheck`), **MF** continues
      with a +10 bonus to the next stoppage, **CF** continues.

    The `#487` auto-resolve fallback (no physician answers by end of round → the advance
    proceeds as a Critical Failure) is unchanged. The pure outcome mapping lives in a
    Foundry-free `blood-stoppage` module (`bloodStoppageOutcome`).

    Part of #548. Closes #547.

- c6993c5: **Body Part and Body Location editor sheets**

    Add two small auto-saving `ApplicationV2` editors for a Being's anatomy, patterned
    on the strike-mode editor: an identity header (editable name + shortcode) and
    `submitOnChange` persistence, so every field change saves on blur — there is no
    Save button. Each is opened from the Combat tab's Body Structure tree via a
    per-row **⋮ → Edit** context menu.
    - **Body Part editor** (#721) edits a part's name, shortcode, functional roles,
      combat area (the random-selection weight), permanent impairment, and the
      can-hold-item / permanently-unusable flags. The part's child locations, held
      item, and legacy flags are preserved untouched.
    - **Body Location editor** (#722) edits a location's name, shortcode, probability
      weight, shock, bleeding susceptibility, amputability, natural protection per
      impact aspect (blunt / edged / piercing / fire), and the stumble / fumble flags.

    A changed shortcode is validated for uniqueness — among the being's other parts,
    or the part's other locations — and a rejected change keeps the current shortcode
    with a warning. All writes rewrite the whole `system.body.structure.parts` array
    rather than a single element by index, avoiding the array-corruption trap.

    Closes #721
    Closes #722

- f7af867: **Add, sort, and delete body structure from the Being sheet's Combat tab**

    Completes the Combat-tab Body Structure editor, building on the Edit editors
    (#721 / #722):
    - **Add** — the section header carries a **+ Add** control that creates a body
      part; each body-part header carries a **+ Add** that creates a hit location
      under it. Both prompt for a name and a unique shortcode.
    - **Delete** — each part header and location row's **⋮** menu gains **Delete**
      (alongside the existing **Edit**). Deleting a part is **refused** while it
      still owns hit locations — remove those first.
    - **Reorder** — body parts and hit locations can be reordered, and locations
      moved between parts, by **drag-and-drop**.

    Every mutation rebuilds the complete `system.body.structure.parts` array (never
    a by-index write, which would corrupt the array — #247). All controls are
    owner-gated; a non-owner still sees the read-only tree.

    Closes #720

- 6395218: **Built-in calendars load from JSON data files, and a new Vylarian Reckoning calendar ships as the default**

    The shipped built-in calendars are now **data files, not code**. Instead of the
    hard-coded `SOHL_DEFAULT_CALENDAR_CONFIG` constant, the system loads
    `src/core/foundry/calendars/*.json` at init and registers each into the calendar
    registry. Each file is self-describing — a stable **`shortcode`** (its registry
    id, and the value a character's `social.calendar` will name), a display `label`,
    and the Foundry `CalendarData` config. Closes #1038.
    - **New default: the Vylarian Reckoning (`vylrec`)** — the reckoning of the world
      of Thalorna. Twelve 30-day months (Floralis, Lusenar, Murkas, Taranis, Vulcar,
      Menaris, Venuris, Karnavar, Morveth, Thanaris, Aetheris, Janar), a 10-day week,
      the **VR / BVR** era, `yearZero: 720`, no year zero.
    - **The Turning Wheel (`twheel`)** is unchanged in content — same months, week,
      seasons, and era — only relocated from the TypeScript constant into its own
      data file, and it remains selectable via the Calendar Settings menu.
    - New worlds default to `vylrec`; the fallback and the settings menu follow the
      new default shortcode. Existing calendar registry, import, and formatter
      behavior is otherwise unchanged.

- f5a7ecf: **Character Creation guided tour** — the flagship onboarding tour, and the first
  content story on the `SohlTour` framework (#614).

    It _coaches and waits_ the user from an empty sidebar to a combat-ready character:
    create a Being from the **Basic Folk** archetype, flesh out the Facade, Profile,
    and Skills, arm and armour the character on the Gear and Combat tabs, add an
    **Arcane Talent**, and pack a container — teaching most of the Being sheet along
    the way. Per the framework, each step is either **free** (advise an example,
    advance on Next) or **gated** (Next stays disabled until the user has done the
    thing): the _Basic Folk_ archetype; the Broadsword / Roundshield / Leather Tunic /
    Backpack / Tinderbox gear archetypes; holding the Broadsword in the right arm and
    the Roundshield in the left; equipping the tunic; and dragging the Tinderbox into
    the Backpack and back out. Gated archetype steps key off the instance's inherited
    `system.shortcode` (per #643), so a gate confirms the _right archetype_ was chosen
    without forcing a particular name.

    The tour is **offered once per user** on a new world via a non-blocking whisper
    chat card with a **Start** button (offer-don't-act consent model), and stays
    launchable on demand from **Settings → Tour Management**.

- 14126f4: Complete the `*Check` / `*Test` split, anchor recurrences on the last test, and make an affliction's Outcome authorable ([#1181](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1181), [#1182](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1182), [#1128](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1128)).

    **A Check offers; a Test acts**

    Every recurring cycle on a Trauma now works the way the affliction's already does. A `*Check` posts a card offering its test and writes nothing — anyone may initiate one, and ignoring it costs nothing. A `*Test` rolls **once** and applies the outcome:

    | Check                   | Test                                                                       |
    | ----------------------- | -------------------------------------------------------------------------- |
    | `healingCheck`          | `healingtest` — the Injury Healing Test, until now a stub that only warned |
    | `bloodLossAdvanceCheck` | `bloodLossAdvanceTest`                                                     |
    | `courseCheck`           | `courseTest`                                                               |
    | `psycheRecovery`        | `psycheRecoveryTest`                                                       |
    | `auralShockRecovery`    | `auralShockRecoveryTest`                                                   |
    | `pallRecovery`          | `pallRecoveryTest`                                                         |

    The elapsed-checkpoint catch-up is gone from this path entirely. That loop was the real hazard: successive rolls in a single pass mutated the state each later roll read, so one click could carry a bleeding wound through several blood-loss advances, or an Extended Shock from stable to **dead**, with no opportunity to stop between them.

    **Nothing is lost by removing it**

    Each test schedules its successor from **the due time of the occurrence it just performed** rather than from the moment the button was pressed, so answering a check late no longer pushes the whole cadence later. On a 5-day cadence anchored at day 0, a check due at day 10 and performed at day 22 leaves the next test due at day 15.

    That anchoring can land a fire time already in the past — which is exactly how a player who is behind works through a backlog. The event queue only dispatched on a world-time tick, so `sohl.schedule` now dispatches immediately when the new occurrence is already due; otherwise the schedule sat due-but-silent until someone nudged the clock. Each step still posts a card and stops until a human presses it, so a backlog drains one consent at a time with the illness's or wound's original rhythm intact.

    **A modifiable healing target**

    `TraumaLogic` gains a **`healing`** ValueModifier — Healing Rate × Healing Base — with a matching `TRAUMA_EFFECT_KEY.HEALING` (`mod:logic.healing`) key, so an Active Effect can change what a wound is tested against instead of that value being an expression buried at the point of the roll. A wound with no Healing Rate leaves the modifier **disabled** rather than zero: untreated is a state, not a target, and it still resolves as a Critical Failure.

    **Four Trauma actions were invisible**

    Request Treatment, Treat Injury, Treatment Test and Healing Test were gated on `subType === 'physical'` — a **Skill** subtype that no trauma has ever had — so none of them ever appeared in the Actions context menu. They are gated on `'injury'` now, with a test that fails on any visibility expression naming a subtype the enum does not define.

    **An affliction's Outcome is authorable at last**

    The Outcome select (Death / Cured) was never rendered on the Affliction sheet, so an affliction authored in the UI silently carried the benign default and a lethal poison killed nobody. It now renders beside Outcome Trauma, and the pack builder can author it — along with `onsetFormula`, which it also could not set. The retired `diagnosisBonusBase` is dropped from the builder and from 34 content files.

    No world migration ships with any of this: the persisted schedule keys are unchanged, and the system is pre-beta.

- d6219e2: **Add a reusable clear control for nullable number fields on sheets**

    Emptying an `<input type="number">` does not reliably reset a nullable field to
    `null` (Foundry reads `valueAsNumber` = `NaN`; coercion depends on attributes and
    `submitOnChange`/re-render). Adds a general, reusable control:
    - a `clearableNumberInput` Handlebars helper that wraps the standard number-input
      builder (`field.toInput` / `createNumberInput`) — passing every option through —
      and renders a "×" clear affordance when the field has a value;
    - a `clearField` action on the item and actor base sheets that writes `null`
      explicitly via `document.update`, using the control's `data-field-path`.

    Usable for any nullable field on any SoHL sheet.

    Closes #479.

- bedc361: **Automated combat start on the combatant; opposed tests on the token**

    Two entry points move to the document that owns them, paralleling the earlier
    relocation of the automated-combat defenses to the combatant.

    _Automated combat start_ becomes a single entry point on the combatant:
    - `CombatantLogic.automatedCombatStart` is the canonical (ESSENTIAL) action. It
      branches on scope: an `itemLogic`-scoped start (a `logicUuid` naming a weapon
      or combat technique, with an optional `smId`) offers only that item's in-range
      strike modes; a combatant-scoped start offers every in-range mode.
    - `WeaponGearLogic` / `CombatTechniqueLogic` `automatedCombatStart` now delegate
      into the attacker's combatant action, passing `{ logicUuid, smId }`, via the
      new `fvttActiveCombatantForActor` helper. The orphaned `BeingLogic.automatedCombatStart`
      is removed.
    - `startAutomatedAttackFromActor` is renamed to `startAutomatedAttackFromCombatant`
      and takes the combatant logic. `SohlLogic` gains a `uuid` getter.

    _Opposed tests_ (skill-vs-skill, skill-vs-attribute, attribute-vs-attribute)
    become token-based:
    - `SohlTokenDocument` is registered as `CONFIG.Token.documentClass` and gains a
      transient `.logic` adapter (no DataModel — tokens persist no SoHL state) plus
      `onChatCardButton`.
    - New `SohlTokenDocumentLogic` hosts `opposedTestStart` (resolves the source
      skill/attribute by `logicUuid` and runs its test) and `opposedTestResume` (the
      opposed-request card's Respond button addresses the **target token**;
      reconstructs the prior result, lets the defender pick the responding skill or
      attribute, and resolves the contest). The actor is always derived from the
      token.
    - `SkillLogic` and `AttributeLogic` `opposedTestStart` delegate into the actor's
      token logic via the new `fvttActiveTokenLogicForActor` helper; the stubbed
      `BeingLogic.opposedTestResume` is removed. The opposed-request card now renders
      a Respond button addressed by token UUID.

- 35ec141: **Relocate the automated combat defenses to the combatant**

    A defender's automated-combat defenses are a combatant concern, so they move
    off the actor and the attack card dispatches them to the combatant.
    - The automated **Block** / **Dodge** / **Counterstrike** / **Ignore** resumes
      move from `BeingLogic` to `CombatantLogic` as intrinsic actions; `this` is the
      defender combatant and `this.actorLogic` supplies strike-mode capability.
      `BeingLogic` keeps only the attacker entry (`automatedCombatStart`).
    - `SohlCombatant` gains `onChatCardButton`, dispatching generically to its
      logic. The attack card's defense buttons now address the defender's
      **combatant**, and `chat-card-gating` reaches the actor (statuses, capability)
      through it. The "Calculate Injury" buttons still address the **actor**.
    - `SohlLogic.actor` resolves the owning actor from the document, so it works for
      a combatant (or effect) instead of throwing.

- bedc361: **Combatant actions on the combat-tracker context menu**

    Right-clicking a combatant in the combat tracker now lists that combatant's
    available actions, so the automated-combat start (added alongside) is actually
    reachable from the UI.
    - A `getCombatantContextOptions` hook maps each row combatant's
      `getContextOptions()` into the tracker menu, reusing the same delegation
      contract `SohlActor`/`SohlItem` use (`SohlCombatant.getContextOptions()` →
      `CombatantLogic.getContextOptions()`). Entries are gated on `combatant.isOwner`
      (owner + GM).
    - **Automated Attack** appears for the combatant's owner; **Move to Group…** is
      now a first-class GM-only `CombatantLogic.moveToGroup` intrinsic action
      (replacing the previous bespoke context-menu entry), so it flows through the
      same mechanism.
    - Action `visible` predicates gain an `isGM` binding, letting an action declare
      `visible: "isGM"`.

- d9d2506: **Compendium build now sets the archetype flag from `sohl.archetype`**

    `build:compiledb` reads each Item/Actor content note's required
    `sohl.archetype` frontmatter and writes it to `flags.sohl.docArchetype`, so
    shipped compendium documents carry their archetype identity for the
    create-dialog picker (issue #640, archetype contract #604).
    - `sohl.archetype` is a **required, nullable number**: a number marks the
      document as an archetype of that priority (→ `flags.sohl.docArchetype`);
      `null` marks it as not an archetype (the flag is omitted); an **absent**
      value is an authoring error that fails the entry, so "not an archetype" is
      never silently assumed.
    - New pure helpers `resolveArchetype` / `withArchetypeFlag` in
      `utils/packs/helpers.mjs` enforce the contract and are used by both the
      `items` and `actors` compilers.
    - `Basic_Folk.md` drops its now-redundant explicit `flags.sohl.docArchetype`
      so `sohl.archetype` is the single source of truth.

- 2e5fd7c: **Feature: Contract Disease action for beings (#391)**

    Beings gain a `Contract Disease` intrinsic action. It opens a dialog listing
    every **disease** (an affliction whose subtype is `disease`) found in the world
    and in the installed Item compendium packs, plus a **Custom disease** option for
    entering a name and Contagion Index (CI) inline. Only diseases can be contracted.

    Contraction is decided by a single d100 **contagion roll** against a target of
    `CI × Endurance`. The character rolls to resist; _failing_ the roll contracts the
    disease. Because a lower CI yields a lower (easier-to-fail) target, **the lower
    the CI, the more contagious the disease**, and higher Endurance protects. On a
    failed roll the disease is added to the sheet — the chosen source disease is
    copied verbatim, or a fresh `affliction` item is built from the custom name/CI.

    The world/compendium search (`fvttFindDiseases`) and the item creation
    (`fvttCreateEmbeddedItems`) live at the Foundry boundary in `FoundryHelpers`; the
    contagion math and dialog-form parsing are pure, Foundry-free, and unit tested.

- 4f3966a: **Seed new Actors/Items from archetypes in the Create dialog**

    The **Create Actor / Create Item** dialog now offers an **Archetype** picker, so a
    new Being (or Item) is born from a populated template instead of a blank slate —
    no more "import Basic Folk and rename." The dialog still exposes Name, Shortcode,
    Type, and (where applicable) SubType; the new Archetype dropdown defaults to the
    best-matching populated template and always includes **(none)** for the deliberate
    blank-slate authoring case.
    - **Data-driven archetypes.** Flag any Actor/Item — in a compendium pack or the
      world — with `flags.sohl.docArchetype = <priority:number>` and it appears in the
      picker for its `(type, subType)`. No code required. SoHL's stock **Basic Folk**
      ships flagged, so Create Actor → Being defaults to a fully-populated being.
    - **Shortcode is identity.** Candidates are deduped by `system.shortcode` (name is
      presentation and may diverge/localize); the winner per shortcode is chosen by
      _priority desc, source tier asc (**world < system < module**), then a stable
      UUID_. A GM's world copy shadows a shipped archetype by tier alone; a module
      must ship `priority > 0` to override a stock archetype.
    - **Foundry-free discovery/resolution helper** (`sohl.entity.archetype`) — the
      filter/dedup/winner rules are unit-tested independently of the dialog.
    - **On confirm** an archetype is cloned from its `toObject()` (embedded documents
      included), cleaned like an import, and overlaid with the dialog's Name/Shortcode;
      `(type, shortcode)` uniqueness is resolved by `_preCreate` as before.
    - **Instantiation strips the marker; copy-verbatim preserves it.**
      `flags.sohl.docArchetype` is removed when an archetype is _instantiated_ (the
      Create-dialog seed, and **drop-to-embed** onto an actor/item sheet) and kept when
      a document is copied as a library entry (**Import**, **Duplicate**) — the strip
      lives at those entry points, never in the universal `_preCreate`.

    Closes #604

- c8799e5: **CSS/SCSS architecture refactor (epic #95)**

    A ground-up modernization of the stylesheet layer. No visual change is intended —
    except where noted, the compiled CSS is computed-value-equivalent to before; the
    work is structural, and lays the foundation for runtime theming.
    - **Ratified architecture** (`docs/concepts/css-architecture.md`). The decision
      record grounding the epic: stay on Dart Sass, ITCSS-inspired folders, BEM under
      the `.sohl` namespace, `--sohl-*` design tokens, a documented `@layer` order, and
      the compound `.sohl.sheet` scoping rule.
    - **Tokens, layers, and scoping foundation.** A single `abstracts/_tokens.scss`
      source of truth emits the palette, spacing, and font stacks as `--sohl-*` custom
      properties, so the system is themeable at runtime; components consume the custom
      properties rather than SCSS variables. `scss/sohl.scss` declares the cascade-layer
      order (`base, layout, components, apps, utilities`) — since Foundry v14 core is
      fully layered, SoHL's layers beat core without `!important` or deep nesting. The
      compound `.sohl.sheet` frame-scoping pattern is settled and documented.
    - **Folder reorganization** into `abstracts/ base/ layout/ components/ utilities/`,
      splitting the mixed-concern "dumping ground" partials so each holds one concern.
    - **Dead-CSS removal.** Deleted the SCSS whose selectors matched no template and no
      `src/` reference (the mis-scoped `_bodyloc.scss`, the `.sheet-header-being` /
      `.sheet-header-object` blocks, orphaned state rules, and redundant `!important`
      flags) — grep-verified against `templates/` and `src/`.
    - **Reusable list widget.** Extracted the shared list skeleton (scroll body, header
      row, control cluster, ellipsis-truncation) into `components/_list.scss` mixins, so
      the item / effect / body-location lists become thin consumers.
    - **BEM naming pass.** Renamed the header, facade, shared list scaffolding
      (`item-*`/`items-*` → a single `list` block, ~250 sites), and effects components
      to `block__element--modifier` in lockstep across templates and SCSS. JS-coupled
      classes (`.item`, event hooks, `SearchFilter` `contentSelector`s), Foundry-owned
      classes, and `data-*` / `lang` keys are deliberately left unchanged.

    Closes the CSS refactor epic:

    Closes #95
    Closes #87
    Closes #92
    Closes #93
    Closes #94

- 795f3d2: **Add a calendar-aware `datePicker` Handlebars helper** (#530)

    A new `{{datePicker}}` helper edits numeric **worldTime** fields (seconds since
    the calendar epoch) through the active calendar, so dates no longer have to be
    typed as raw world-time integers. The field stores and returns the same numeric
    value; only the display and editing use calendar format.

    The control shows the current value formatted by the active calendar and opens a
    picker dialog with:
    - a **month dropdown**, and numeric **day**, **year**, **hour**, **minute**, and
      **second** inputs;
    - a **day-skip stepper** (± N days) that rolls months and years over correctly,
      including variable-length months and intercalary days;
    - **Now** (set to the current world time) and **Clear** (set to empty) buttons;
    - a live **preview** of the resulting date, with a red **"Invalid Date Format"**
      when the entered parts don't resolve to a real date.

    Wired into the Trauma and Affliction date fields (`contractDate`,
    `treatmentDate`). The worldTime ↔ calendar-parts conversion is a Foundry-free,
    unit-tested core (`date-picker-logic`).

- bedc361: **Default Combat Group moves from a token flag to the actor**

    The combatant group an actor auto-joins when it enters combat is now a typed
    `defaultCombatGroup` field on the actor data model, set on the actor sheet's
    **Combat** tab (GM-only), instead of a `flags.sohl.defaultCombatGroup` token
    flag.
    - `SohlCombat`'s combatant-group seeding reads `actor.system.defaultCombatGroup`;
      blank still falls back to the default group (`Opponents`).
    - The Token / Prototype-Token config field is removed; the value is edited on
      the actor. TokenDocument has no typed system data, so the actor (which exists
      before the combatant) is the better-integrated, pre-configurable home.

    _Note:_ any value previously set via the old token field is not migrated — set
    the actor's Default Combat Group instead.

- d6219e2: **Derive `isTreated` from a treatment date**

    Trauma and Affliction no longer store a separate `isTreated` boolean. Each now
    persists a nullable `treatmentDate` (world-time, via the temporal-field helper),
    and `isTreated` is a derived getter on the logic (`treatmentDate != null`). The
    item sheets replace the "Treated" checkbox with an editable treatment-date field
    (using the new `clearableNumberInput` control, so it can be cleared back to
    untreated). Context-menu predicates that gated on treatment now read
    `itemLogic.isTreated`.

    Closes #484.

- 5dccfb1: **Dissolve the Corpus into the Being; make movement a universal actor capability**

    The `corpus` item type is removed. A being's physical body — anatomy (body
    structure), weight, reach, and body-scale — now lives directly on the **Being
    actor** under `system.body`, derived by a Being-owned `BodyLogic` and exposed as
    `being.body` (`being.body.structure` / `.weight` / `.reach` / `.bodyScale` /
    `.injuryTable`). No more embedded one-per-being singleton item, `registerCorpus`
    back-reference, or `being.corpus.*` cross-document reads.

    **Movement** (`currentMoveMedium` + `movementProfiles`, and the derived
    `feetPerRound` / `leaguesPerWatch` / `moveProfile`, plus the `makeDefaultMedium`
    action) becomes a universal capability on the **base actor** — every actor kind
    (Being, Vehicle, Cohort, Structure) inherits it. `MOVEMENT_MEDIUM.NONE` is the
    default; a single shared no-movement profile (`NONE_MOVE_PROFILE`) represents an
    actor that cannot move, so no actor authors a `NONE` profile of its own. Beings
    additionally derive movement's `strengthModifier` / `encumbrance` from `str` and
    carried weight.

    **Incorporeality** is now an empty body structure (`body.structure.parts` is
    empty), replacing the old "no corpus item" model.

    In the compendium source, a being's body is authored **inline** — its `sohl`
    block mirrors the schema (`sohl.body` nesting `structure` / `weight` / … , with
    `currentMoveMedium` / `movementProfiles` flat) — and the build inlines it into
    `system.body` + the base-actor movement fields instead of embedding a corpus
    item.

    _No data migration:_ there are no live worlds; throwaway worlds are regenerated
    from the packs.

    Closes #535
    Closes #371

- 1ba7d49: **Make every entity class overridable via a two-mechanism registry**

    Completes the `sohl.entity` registry so a variant module can subclass any
    registered entity class and have that subclass built everywhere, and routes
    _all_ construction through the registry so no site silently bypasses an override.

    **The override API**
    - `sohl.entity.register(name, cls)` — install an override. `cls` must extend (or
      be) the canonical base for `name`; the call throws on an unknown name, a class
      that does not extend the base, or a base that has not yet loaded. Call it from
      a module's `init`/`setup` hook, before the first construction of that class.
    - `sohl.entity.base(name)` — the canonical SoHL base for `name`, ignoring any
      override, for a module that wants to extend the original.

    **Two construction mechanisms**
    - **Inside SoHL** — `import { entity }` then `new entity.X(...)`. A static import
      that resolves through the module graph, so unit tests construct these classes
      with no runtime global wired.
    - **Outside SoHL** (macros / variant modules) — the same surface on the runtime
      global: `new sohl.entity.X(...)` and `sohl.entity.register(...)`.

    Both read one backing record, so an override is honored no matter which
    constructs the object.

    **How it fits together**

    Classes self-register (`registerEntity("X", X)`, mirroring `registerKind`) into a
    cycle-free leaf (`entityRegistry.ts`) that value-imports none of them. `registry.ts`
    is an eager-load barrel that pulls in every class module and re-exports the
    surface; most internal code imports `entity` from it. The handful of base classes
    whose own subclasses are registered import the leaf directly (the barrel would
    evaluate `class Sub extends Base` mid-load) and add bare side-effect imports of
    their construction targets.

    An ESLint `no-restricted-syntax` rule bans a bare `new` of any registered entity
    class so the discipline holds; the member-expression forms `new entity.X` /
    `new sohl.entity.X` pass. The mechanisms are documented under **Entity class
    registry** in `docs/reference/runtime-contracts.md`.

    Closes #83 — the final task of epic #80.

- d6219e2: **Event queue dispatches through document actions with SafeExpression predicates**

    When a subscription fires, the queue now **executes the action named by its
    `kind`** on the owning document's logic, rather than a bespoke `handleSohlEvent`
    handler. The trigger context (with the subscription's `payload` attached as
    `ctx.payload`) becomes the action context's `scope`, and `kind` its `type` — so an
    event reuses the same action a user can invoke manually, and one implementation
    serves both.

    Subscription predicates are now `SafeExpression`s evaluated against the trigger
    context (e.g. `name === 'combatStart'`), replacing raw callback functions.
    `SohlTriggerContext` gains an optional `payload`.

    Refs #480.

- d6219e2: **Event queue: populate on all clients, fire on the active GM only, add a query API**

    `sohl.events` is now a pure projection of document state. `subscribe`,
    `unsubscribe`, and `scheduleAt` run on **every** client (a player's queue is a
    permission-scoped subset of the active GM's); only `fire` remains gated to the
    active GM. This lets sheets query event dates locally on any client.

    Adds a read-only query API — `nextFireTime(uuid, kind)`, `timeUntil(uuid, kind)`
    (signed seconds from now), and `isScheduled(uuid, kind)`.

    Dispatch is now **single-pass**: each due subscription fires once and the queue no
    longer cascades re-armed successors within one `fire`. Recurring catch-up over a
    time jump is the consuming document's responsibility (an elapsed-interval loop in
    its handler that persists the advanced anchor), with `finalize()` re-arming the
    next occurrence — keeping the queue a projection that never evolves schedule state
    inside the GM-only `fire`. The same-tick loop guard is removed (no longer needed);
    the reentrancy depth backstop remains.

    The Event Queue reference doc is rewritten accordingly, including the
    owner-persists-the-anchor contract and a corrected worked example.

    Closes #480.

- 67e94ca: **Expand the trauma, shock, and affliction rules documentation**

    Adds a coherent, interlinked set of Rules journals covering the full
    trauma/shock/affliction system, with tables throughout:
    - **Healing Base** — the average-of-END/WIL recovery factor used in every healing
      test.
    - **Shock** — the shock states, the Shock State Index, the Shock Re-Test, and the
      lasting Extended Shock and Coma.
    - **Injury** — Injury Levels, indefinite and permanent impairment, the treatment
      and treatment-action tables, special injury effects, and the Injury Healing Test.
    - **Infection** — infection healing rate, weakness fatigue, and the Infection
      Healing Test.
    - **Fatigue** — windedness, weariness, and weakness, and the Fatigue Penalty.
    - **Fear**, **Morale** (with the Rally and Reaction tests), **Psychological
      Condition** (with Aural Shock), and **The Pall**.

    The **Trauma** page is rewritten as the umbrella over these forms, **Bleeding**
    and **Afflictions** are updated to cross-link the new pages, and the Rules index
    gains a full "Health, Injury & Recovery" section. Reflects two model changes:
    psyche and physical conditions are now **traumas**, and an affliction's outcome
    uses a single **`outcomeTrauma`** field.

    Closes #545

- 577fdd9: **Feature: the namespace tree is now live on the `sohl` global (#403)**

    Every SoHL class is now addressable at runtime by a source-mirroring path on the
    `sohl` global — `sohl.document.effect.foundry.SohlActiveEffect`,
    `sohl.entity.modifier.ValueModifier`, `sohl.apps.foundry.DomainManagerApp`, and so
    on. The top-level namespaces `sohl.document`, `sohl.core`, and `sohl.apps` are new;
    they are typed on `SohlSystem` (via `typeof import(...)`, so the binding adds no
    import cycle) and bound in `sohl.ts` (the last-loaded entry, imported by nothing).

    `sohl.entity` is now **both** its existing override-aware construction registry
    (`sohl.entity.ValueModifier`, `sohl.entity.register(...)` — unchanged, so existing
    macros keep working) **and** a namespace (`sohl.entity.modifier.ValueModifier`).
    The flat PascalCase getters and lowercase sub-namespaces occupy distinct property
    names, so both coexist. Construct or override through the flat registry (its
    getters honor a `register()` override); the namespace path is for reference and
    always resolves to the original class.

    Additive throughout — existing `@src/…` imports and the current `sohl` surface are
    unchanged. The `sohl.utils` / `sohl.constants` surfaces are left as-is for now
    (they overlap the existing curated members); their namespace form is deferred.

- b3273af: **Add `rand()` and `roll(formula)` helpers to the SafeExpression language**

    Two new built-in expression helpers bring randomness and dice into data-driven
    predicates and computed fields:
    - **`rand()`** — a random number in `[0, 1)` (like `Math.random`). Combine with
      `floor` / `min` / `max` to derive integers or ranges.
    - **`roll(formula)`** — rolls a `SimpleRoll` dice formula (`'2d6+3'`, `'1d100'`,
      …) and returns a plain object: the roll's `toJSON` augmented with `formula`,
      `result`, `total`, and `median`. Read `.total` (or `.median`) to use the
      outcome further, e.g. `roll('2d6+1').total`.

    Both are stochastic (the first non-pure helpers). `roll` builds its `SimpleRoll`
    under the evaluating expression's owning Logic (injected as a hidden first
    argument for the small set of parent-bound helpers) and returns only the plain
    result object, so the live roll — and the parent — never escape the expression
    sandbox. No `eval` or data-into-code is introduced; `roll` uses the Foundry-free
    `SimpleRoll` primitive.

    `SimpleRoll.median` — the roll's average/expected value, newly surfaced through
    `roll(...).median` — now returns its **true** (unrounded) value. It was rounding
    to an integer, so an odd count of even-faced dice was off by 0.5 (`1d6` reported
    `4` instead of `3.5`; `1d20` `11` instead of `10.5`); it now returns the exact
    expected value and callers round if they want an integer. This getter had no
    production consumers before this change.

    The SafeExpression user guide is also expanded into a complete reference — every
    built-in helper documented (the string-building helpers were previously missing),
    fuller language coverage, and a "developing an expression" section.

    Closes #540
    Closes #541

- 8833b79: **Expression scopes — every SafeExpression call site now declares what is in play**

    A `SafeExpression`'s bindings used to be implicit: each call site built an ad-hoc
    object literal and handed it to `evaluate()`, so writing an identifier that site
    did not bind parsed cleanly, threw at evaluation, was caught by the caller, and
    silently disabled the feature. Nothing connected the identifiers an author could
    write to the identifiers actually supplied — not the type system, not the editor,
    not the documentation.

    Each of the twelve call sites now declares an **expression scope**: a named set of
    bindings, each with a description, in `src/entity/expr/expression-scopes.mjs`.
    That one declaration is what the runtime validates against, what the formula
    editor autocompletes from, and what the developer documentation is generated
    from, so the three cannot drift apart.
    - _Out-of-scope identifiers are rejected at construction_, with an error naming
      the offending identifier and listing the legal ones — once, where the
      expression is authored, instead of a warning on every render. Only the **root**
      of a member chain is checked (`itemLogic.a.b` validates `itemLogic`).
    - _The formula editor offers exactly the declared identifiers_, with their
      descriptions, and flags an out-of-scope name as you type — **Save** stays
      disabled, as it already did for a syntax error. A `SafeExpressionField` carries
      its scope id, so this comes from the schema; the hand-typed
      `data-context="attr"` template attribute is gone.
    - _The bound-variables table_ in the Expressions concept doc is generated
      (`npm run docs:expr-scopes`) and guarded by `npm run lint`. It had fallen four
      call sites behind.
    - _A bare helper reference_ (`sb` instead of `sb(...)`) is now also caught at
      construction wherever a scope is declared.

    Closes #1142.

    **Fixes: Shock Re-Test was hidden in every state**

    The `shockReTest` intrinsic action's visibility expression reads `actorLogic`,
    which the action-`visible` binding never supplied — so it threw on every menu
    render and the action was unconditionally hidden. The action-`visible` scope now
    binds `actorLogic`, resolved the same way the action's own execution resolves it
    (row actor → row item's actor → the owning logic's actor), which also makes
    `visible` and `trigger` agree on what they see. An Incapacitated or Unconscious
    being offers Shock Re-Test on its Actions context menu; no other state does.

    Closes #1090.

- 5d0ae68: **Fear/Morale state now lives in the Trauma `category` field**

    Fear (#558) and Morale (#559) trauma state is now tracked in the Trauma
    `category` string field — the same mechanism Fatigue, Psychological Condition, and
    Physical Condition already use — instead of the numeric `levelBase`. The
    `FEAR_CATEGORY` / `MORALE_CATEGORY` enums are now string-valued (`none`, `brave`,
    `steady`, …), and severity ordering (most-severe-wins, worsen-only transitions,
    the `>=` state gates) is preserved via each enum's declaration order.

    On the Trauma item sheet, Fear and Morale now show the per-subtype **Category**
    dropdown rather than a numeric level field, and the Being sheet's trauma ledger
    renders the named state (Afraid, Routed, …) from `category`.

    Closes #961

- 2ede925: **Fear Test (#558)**

    Implement the **Fear Test** — a test against **Will** — and its states. A
    self-sufficient Being action rolls the being's Will headlessly and maps the result
    to a fear state: **Brave** (CS), **Steady** (MS), **Afraid** (MF), and — splitting
    the critical failure by least-significant digit — **Terrified** (CF5) or the more
    severe **Catatonic** (CF0).
    - **Fear sources are traumas.** Each frightening source is recorded as its own
      `fear`-subtype trauma (its level is the state); the being's effective fear state
      is the **most severe** active one. A success clears the source (Steady, or a
      five-minute **+20 Brave** bonus to Fear and Morale tests); a failure records or
      worsens the source.
    - **Psyche Stress.** Terrified grants **+1** and Catatonic **+2** Psyche Stress,
      accrued only for the newly-reached severity (recorded as a `psycond` trauma via a
      shared `inflictPsycheStress` helper).
    - The being carries the `fear` status while any fearful source is active, and an
      informational **trauma-state card** reports the outcome (state, PSY gain, and
      effect notes — Block/Dodge only, must-flee, Helpless).

    The pure rule mapping lives in a Foundry-free `fear` module (`fearStateFromTest`,
    `fearPsyGain`, `mostSevereFear`, and the effect predicates); the per-turn recovery
    retests and the combat enforcement of the defense/flee restrictions are wired with
    the combat-turn work.

    Part of #548. Closes #558.

- 7ec8f61: **Being sheet: correct actor→actor drag semantics (move, with quantity)**

    Dropping an item onto an actor now behaves by source. Compendium and world items
    still **clone** onto the actor (all kinds). An item that lives on **another
    actor** is now **moved** — created here and removed from the source — instead of
    duplicated:
    - **Non-gear** (skill, attribute, …) moves the instance.
    - **Physical gear** moves with quantity: a **"How Many?"** dialog for stacks
      greater than one splits the stack (dest += chosen, source −= chosen, source
      removed when all moved). The dialog is skipped for a single item and for a
      **shift-drag**, which moves the whole stack. Moving requires owning the source.

- 8c2ce3b: **Assisted dodge: skill ML cells are rollable on the Skills tab**

    The skills tab now has a clickable mastery-level value for every skill (displayed in the `ML` column). Clicking the ML rolls a success test via `SkillLogic.successTest`, matching the roll pattern of the combat tab's attack/block/counterstrike cells. Hold Shift to skip the dialog.

    **Changes:**
    - `BeingSheet` — adds a `rollSkillTest` action handler (`_onRollSkillTest`) that reads the skill item from the clicked row's `data-item-id`, then calls `skillLogic.successTest(context)`.
    - `templates/actor/being/skills.hbs` — the ML cell gains `class="rollable"` and `data-action="rollSkillTest"`.

    _The Dodge skill is the primary consumer (it is the only defensive skill offered in the automated-combat flow), but all skills in the tab are now directly rollable._

    Closes #187.

- 5fd54f4: **Being Combat tab: Body Locations tree**

    The Combat tab now shows a read-only **Body Locations** tree — each body **part**
    with its hit **locations**. Every location shows its covering armor **Layers**
    (material list), hit **Prob**ability, **Shock**, **Impair**ment, and per-aspect
    protection **B / E / P / F** as the **effective total** — natural `protectionBase`
    plus the aggregate of all currently-worn armor mapped to that location. The part
    header shows the **Held** item, and a search box filters locations by name.

    The view is read-only (no add / remove / rearrange). Layer/total contributions
    require worn armor whose covered locations are
    stored as location shortcodes; compendium armor still stores them as names
    (#249), so its contribution won't appear until that lands.

- 9e8a373: **Implement chat-card edit-action dispatch**

    Clicking the edit icon on a posted chat card (standard-test, opposed-result) now re-runs the named action on the owning document instead of silently doing nothing.

    **Changes:**
    - `chat-card-dispatch.ts` — adds `dispatchChatCardAction(logic, btn)`: reads `dataset.action`, builds an `SohlActionContext`, looks up the action in `logic.actions` (by name, executor id, or title), falls back to a direct method call, and warns via `sohl.log.warn` when nothing matches. The two dead no-op exports (`onChatCardButton`/`onChatCardEditAction`) are removed.
    - `SohlItem.onChatCardEditAction` — replaces the `TODO(#66)` stub: ownership-gated (`this.isOwner`), then delegates to `dispatchChatCardAction(this.logic, btn)`.
    - `BeingLogic.onChatCardEditAction` — same pattern: ownership-gated (`this.actor?.isOwner`), then delegates to `dispatchChatCardAction(this, btn)`.

    _Ownership check applies per #167's guidance (edit path only; the button path is tracked separately under #167)._

    Closes #66.

- 1a473b6: **Combat Technique skill subtype: model + mastery-level wiring**

    Foundation for modeling combat techniques as skills (#322/#323). Adds a
    `combattechnique` skill subtype and lets a skill carry an **optional embedded
    strike mode**, so a trained fighting maneuver (unarmed strike, grapple, etc.) is
    a normal, improvable skill whose strike mode's Attack / Block / Counterstrike are
    driven by that skill's mastery level.
    - New `SKILL_SUBTYPE.combattechnique` (+ localized label).
    - `SkillDataModel` gains an optional, nullable `strikeMode` (the discriminated
      melee/missile shape, mirroring `CombatTechniqueDataModel`); `null` for every
      other skill subtype.
    - `SkillLogic` builds the strike-mode instance for the subtype, adds the
      wielder's body reach (melee), and folds the **governing** mastery level into
      the strike mode's Atk/Blk/CX — the skill's **own** mastery level by default, or
      an override skill named by the strike mode's `assocSkillCode` — with the full
      base→skill-modifiers→technique-modifiers derivation preserved (via the
      completed `ValueModifier.addVM`). A disabled governing mastery level disables
      the derived rolls.

    This is the model/logic layer only; the skill-sheet strike-mode editor (#324),
    create flow (#325), Combat-tab integration and item-type retirement (#326) build
    on it. Existing skills are unaffected (their `strikeMode` defaults to `null`).

- 07a5968: **Feature: custom item creation from the Being sheet via a `createDialog` flow**

    Reimplements the prototype's item-create mechanism for the current TS / Foundry
    v14 code. Clicking an item-create control now opens a dialog that collects a
    name, type, and (when the chosen type has one) subtype, then creates the item
    and opens its sheet.

    **What's new**
    - `SohlItem.createDialog` — a v14-compatible override that computes the allowed
      types (excluding the base type, honoring an optional `types` restriction),
      decides whether to ask for the type and subtype (a valid pre-seeded
      `data.type` / `data.system.subType` locks and hides that field), and renders
      the shared create dialog through the `dialog()` boundary. A `render` hook
      repopulates the subtype `<select>` from the newly-chosen type's DataModel
      `subType` choices whenever the type changes.
    - `SohlActor.createDialog` — the same flow for world actors (parent always
      `null`); it shares the implementation, so any future actor subtype is picked
      up automatically.
    - `BeingSheet` gains a `createItem` ApplicationV2 action reading `data-type` and
      `data-sub-type` off the clicked control. The gear-tab "Add Gear" anchor is
      wired to it (`data-action="createItem"`) to prove the flow end-to-end; other
      tabs' anchors are wired separately.
    - `create-item.hbs` is now progressive-ready: the subtype form-group has a
      stable wrapper the render hook repopulates and is hidden when the type has no
      subtypes; the type group hides when the type is pre-seeded/locked.

    Subtype choices are read at the boundary from
    `CONFIG.Item.dataModels[type].schema` (the `subType` field's value-keyed
    `choices` map) and mapped to localized options by the new pure
    `subTypeOptionsFromChoices` helper.

- 2b6564d: **Drag-and-drop items from a compendium or the world onto a Being**

    Dropping an Item onto an actor sheet now creates it. The Being sheet is built on
    `DocumentSheetV2` (not `ActorSheetV2`), so it inherited no item-drop handling and
    dropping a compendium or world item did nothing. `SohlActorSheetBase` now
    overrides `_onDropItem` to create the dropped item as an embedded **clone** on
    the actor (all item kinds). An item already embedded on the same actor is ignored
    (no duplicate).

- 4cec7b3: **Gate armor aggregation and combat-tab weapons on equip/hold state**

    The combat tab now only shows weapons the character is actively holding (gripped by a body part), and armor protection is only aggregated onto body locations for armor that is currently equipped. Previously both operations ignored equip/hold state entirely, so an unequipped suit of plate armor would still protect the wearer and an unheld weapon would appear in the strike-mode list.

    **Changes:**
    - `BeingLogic.aggregateArmorProtection` — filters to `isEquipped` armor before building the layer list; unequipped armor no longer contributes to `bodyLocation.armorProtection`.
    - `being-sheet-view.ts` — adds the pure `filterHeldWeapons` helper (testable without Foundry).
    - `BeingSheet._prepareBeingContext` — applies `filterHeldWeapons` before `splitWeaponsByRange`; only held weapons reach the melee/missile display lists.

    _This is a consistency fix: `reach` and `availableStrikeModes` already required the weapon to be held; armor aggregation and the combat-tab weapon rows now follow the same rule._

    Closes #180.

- 0755468: **Add `setEquipped` / `setNotEquipped` / `holdItem` / `releaseItem` intrinsic actions to `GearLogic`**

    Previously there was no write path to `system.isEquipped` or to `bodyPart.heldItemId` — the fields existed and were read by derived logic, but nothing in the system ever wrote them. This left equip state and weapon-hold state permanently inert.

    `setEquipped` / `setNotEquipped` mirror the existing `setCarried` / `setNotCarried` pattern and write `system.isEquipped` on the gear item. `holdItem` finds the first free hold-capable body part(s) on the owning actor's body and writes `heldItemId`; `releaseItem` clears `heldItemId` on every part gripping this item. The minimum grip count is controlled by the protected `minPartsToHold` getter (default 1), which weapon subclasses can override. All four actions are registered in `defineIntrinsicActions` and have `lang/en.json` titles.

    Closes #179.

- ff4abe3: **Gear state controls: carried / worn toggles and per-limb Held Items**

    Two ways to set a Being's gear state:
    - **Carried** (sack) and **Worn** (armor icon) per-row toggles on the Gear tab flip `isCarried` / `isEquipped` (worn armor feeds body-location protection totals). These controls previously rendered as indicators only; they now dispatch actions.
    - A **Held Items** section on the Combat tab (below the strike modes) with **one dropdown per hold-capable limb**. Each dropdown lists the actor's holdable gear — weapons and misc gear that are **not** stowed inside a container — plus a blank option. Selecting an item makes that limb hold it; blank releases it. A **two-handed** weapon is held by selecting it in **both** limbs' dropdowns. Held weapons feed the strike-mode sections.

- 3ea7497: **Being Profile — Affiliations section**

    The Profile tab's Affiliations section now renders as a full sectioned list — **Rank / Society / Office / Title / Notes** columns — with a per-row context-menu kebab and a **+ Add** control that creates a new affiliation via the create dialog. The section is always shown (even with no affiliations) so the first one can be added directly from the sheet, and rich-text notes are reduced to a plain-text snippet so they read cleanly in the table. Row shaping lives in a pure, Foundry-free `buildAffiliationRows` helper.

- 22dadad: **Being Profile tab: Attributes section**

    The Being sheet's Profile tab now renders the character's attributes as a grid of
    score boxes. Each box shows the attribute's effective **score**, its descriptor
    band label, and its **TL** (target mastery level), plus a per-item context-menu
    kebab. The section header carries a **+ Add** control that creates a new
    attribute on the being.

    The descriptor is resolved from the attribute's `valueDesc` bands: the label of
    the first band (in ascending `maxValue` order) whose `maxValue` is at least the
    score, falling back to the highest band when the score exceeds all bands, or an
    empty string when no bands are defined. This shaping lives in a Foundry-free
    helper (`attributeDescriptor`) and is unit-tested.

- cb94697: **Skill sheet: strike-mode editor for combat-technique skills**

    The Skill item sheet now shows a strike-mode editor — Strike Mode (name, min
    parts, length, and an optional governing-skill override), Attack (spread,
    modifier), Impact (dice/die/modifier), and, for melee, Defense (block,
    counterstrike) — but **only** when the skill's subtype is `combattechnique`. It
    is hidden for every other skill subtype. Leaving the governing-skill override
    blank drives the technique's Attack/Block/Counterstrike from the skill's own
    mastery level; setting it to another skill's code borrows that skill's mastery
    level instead.

- 68e813a: **Reimplement the Being sheet Skills tab**

    The Being sheet's Skills tab now renders skills grouped by subtype, matching the
    Affiliations section.
    - **Grouped sections.** Skills are grouped into the six display subtypes
      (Social, Nature, Craft, Lore, Language, Script), each shown as its own
      fieldset with a localized legend. Every defined subtype is always emitted —
      even when empty — so its seeded **"+ Add"** control stays reachable. Any
      additional subtype present on a skill but outside the display order is
      appended after the ordered ones, so nothing is dropped.
    - **Columns.** Each row shows **SB / ML / Index / EML / Fate**. When a skill's
      mastery level is disabled, the Index and EML cells render an ✕ in place of the
      number. The ML cell remains rollable (shift-click skips the dialog).
    - **Skill-development star.** Skills eligible for improvement show a star in the
      row controls that toggles the skill's `improveFlag` — a filled star when set,
      an outline star when not.

    The pure grouping logic lives in a new Foundry-free `buildSkillGroups` helper,
    unit-tested alongside `buildTraitGroups`.

- ab3ae37: **Being Combat tab: derived Melee / Missile Strike Mode sections**

    The Combat tab's weapon sections are now **Melee Strike Modes** and **Missile
    Strike Modes**, aggregating strike modes from **combat-technique skills** (always
    available — they belong to the being) as well as **held weapons**, grouped by
    their source item. Each row keeps the clickable **Atk / Blk / CX** cells (the
    assisted-combat entry points) and the impact roll; a combat technique's cells are
    driven by its skill's mastery level. Unholding or removing a weapon drops its
    strike modes; technique modes come and go with the skill.

- bd8b2b4: **"Use Zone Die" world setting (HMK compatibility)**

    Add a world-level boolean setting **Use Zone Die**. It toggles how a melee strike
    mode's spread is presented on the Combat tab — the same `spread.effective` value
    shown either as a Spread radius (column **Spr**, value `{n}`) or a Zone Die
    (column **ZD**, value `d{n}`). Spread is SoHL's radius-in-feet replacement for
    HameMaster's Zone Die and is numerically identical (a Spread of 6 is a `d6` Zone
    Die), so the switch is presentation-only and effects stay compatible. Off by
    default.

- d451b0c: **DataModel field hygiene: drop redundant required-defaults, null-for-unset StringFields** (#762)

    Two schema-authoring corrections across the data models (greenfield — no data migration):
    - **No field is both `required` and defaulted.** Fields that declared `required: true` alongside an `initial` now drop the redundant `required` — Foundry auto-fills a required field from its `initial`, so a field with a default is not caller-mandatory. Applies to the calendar era name/abbrev fields, scheduled-action `anchor`/`interval`, active-effect change `type`/`value`/`phase`, attribute `maxValue`, and the enum-defaulted `subType`/`aspect`/`potency`/`displayedMedium`/`transmission`/`projectileType` fields. TypedSchema discriminators and `shortcode` are intentionally excluded.
    - **Unset is `null`, not `""`.** Optional "not specified" StringFields that used an empty-string sentinel now represent unset as `null` (`nullable: true, blank: false, initial: null`), matching the existing `parentSkillCode` / `Trauma.category` pattern — a cleared form input round-trips to `null`. Converted: affliction `category`/`onsetMacroUuid`/`outcomeTrauma`, the `*DurationFormula` fields (via the shared helper), `skillBaseFormula`, `initDiceFormula`, the `assocSkillCode`/`assocMysteryCode` reference codes, affiliation `society`/`office`/`title`, cohort `leaderName`, armour `material`, the region-trigger `actionName`, and the calendar era `description`. Declared types and logic interfaces are updated to `string | null`.

- 6e13832: **Sanitize chat/dialog HTML with Foundry's allowlist sanitizer**

    Fixes [#161](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/161):
    `toSanitizedHTML` — the single sanitizer for all chat-card and dialog content —
    was a tag/attribute **denylist**, which is bypassable via whitespace/entity-obfuscated
    `javascript:` URLs, `<base>`, SVG `xlink:href`, and mutation-XSS on the
    sanitize→serialize→reparse round-trip. It now delegates to Foundry's built-in
    **allowlist** sanitizer `foundry.utils.cleanHTML` (the same one Foundry applies to
    dialog and journal HTML), which keeps only allowlisted tags/attributes and validates
    URL schemes via `URL.parse`.
    - New `fvttCleanHTML` shim in `FoundryHelpers` wraps `foundry.utils.cleanHTML`
      (a real v14 client API that is currently absent from `fvtt-types`).
    - `toSanitizedHTML` moves from `helpers.ts` into the Foundry-coupled
      `FoundryHelpers` (where its only callers already live), since sanitization is a
      DOM/browser operation. **It is therefore no longer exposed on `sohl.utils.*`** —
      it was never intended as public API.
    - Chat-card dispatch is unaffected: `data-*` attributes are on Foundry's global
      attribute allowlist, so button routing (`data-action`/`data-scope`/`data-handler-uuid`)
      is preserved.
    - `data:` URLs and inline `style` remain permitted, matching Foundry's system-wide
      stance rather than being additionally blocked.
    - Neutralization is verified by a Cypress e2e spec against the live browser
      sanitizer (`cypress/e2e/html-sanitization.cy.js`).

- 35ec141: **Foundry-free combat strike-mode collection and chat addressing**

    The combat helpers and the Being combat-resume flow no longer reach the Foundry
    actor for items or chat-target identity.
    - `collectBlockableStrikeModes`, `collectAttackableStrikeModes`,
      `hasMeleeAttackStrikeMode`, and `resolveSkillMasteryLevel` now take the actor
      **logic** and iterate `logicTypes` / `getItemLogic` rather than `itemTypes`.
    - Combat chat cards address the defender via the logic's own `name` and (opaque)
      `uuid`, and the opponent via an opaque `attackerAddress` (name + uuid) carried
      on the counterstrike context and resolved in the scene layer. Emission still
      goes through `SohlSpeaker#toChat`.

- 35ec141: **Foundry-free combatant logic (`CombatantLogic`)**

    The Combatant now has a logic layer on the same footing as actors and items,
    consolidating combat logic that was previously split across the document,
    `combatant-logic.ts`, and the combat-action helpers.
    - `SohlCombatantDataModel` extends `SohlDataModel` (gaining the `SohlLogicData`
      port); a new `CombatantLogic` is registered and resolved by
      `SohlDataModel.create`, so `combatant.logic` returns a `CombatantLogic`.
    - `CombatantLogic` owns the combatant's combat-scoped state (last attack/block
      mode, `didAction`, move factor), capability (`reach`, `computedMove` via
      `this.actorLogic`), relational queries (`groupId`, `allies`, `isEnemyOf`,
      `threatenedBy` over sibling combatant logics), and spatial queries
      (`reaches`, `spacesMovedThisTurn`). `SohlCombatant` delegates to it.
    - The token-center geometry moves to `FoundryHelpers`
      (`combatantGridDistance` / `combatantSpacesMoved`) — the one scene-coupled
      edge — and **`sohl.currentCombatCombatantLogics`** exposes the
      `CombatantLogic` of every combatant in the active combat.

- 35ec141: **Foundry-free logic-layer data port**

    The logic layer now reaches its owning document through the `SohlLogicData`
    data interface (a port implemented by the Foundry data model) instead of the
    Foundry document directly, so logic classes can be unit tested without Foundry.
    - `SohlLogicData` exposes `id`, `name`, `type`, `uuid`, `isOwner`, `kind`,
      `shortcode`, `actorLogic`, `getFlag`, `setFlag`, and `update`; the actor data
      adds `itemLogics` and `hasPlayerOwner`. `SohlDataModel` implements them by
      delegating to its parent document.
    - `SohlLogic` identity getters now read `this.data.*`, and a new `actorLogic`
      getter navigates from any logic to its owning actor's logic.
    - **`uuid` is an opaque identity token** — never resolved to a Foundry document
      inside the logic layer. New `fvttLogicFromUuid` / `fvttLogicFromUuidSync` helpers (in
      `FoundryHelpers`) resolve a uuid back to a `SohlLogic`, keeping the document
      deref inside the shim.

- 1182073: **Consolidate gear carry action; move equip/hold off generic gear**

    `GearLogic` now exposes a single **Toggle Carried** action in place of the paired
    `setCarried` / `setNotCarried` actions. The `holdItem` / `releaseItem` actions are
    removed (holding is driven from the Combat tab), and the `setEquipped` /
    `setNotEquipped` actions are removed from generic gear — worn state moves to an
    armor-scoped action tracked in #662.

    Closes #673

- a714f94: **Generic scheduled actions — `system.scheduledActions` + `sohl.schedule`**

    The foundation for data-driven recurring schedules on a SoHL document (epic
    #588): a document can defer an action without bespoke schema fields.
    - **`scheduledActions`** on the base `SohlDataModel` (beside `actionDefs`), so it
      is carried by every document whose data model extends that base — **actors,
      items, and combatants**. Scenes and active effects extend `TypeDataModel`
      directly and cannot host a schedule. Each entry is
      `{ actionName, anchor, interval, payload }`; logical identity is `actionName`
      and the fire time is `anchor + interval`.
    - **`sohl.schedule(doc, actionName, interval, payload?)`** — does both halves:
      persists the whole `system.scheduledActions` array (the durable record, anchored
      at the current world time) **and** arms the event queue (the live entry), so the
      action is offered as a `[Perform]` reminder when due. **`sohl.unschedule`** clears
      the entry and unsubscribes. Both derive the fire time from one
      `(anchor, interval)`, so they can't drift.
    - **`armScheduledActions(uuid, list, queue)`** — the Foundry-free, load-side
      re-arm routine (read `system.scheduledActions` → `scheduleAt` each), used by the
      `ready` hook below.

    Part of #588. Follow-up: the migration of trauma/affliction's bespoke
    `recurringPhaseFields` onto this store.

- 278069c: **Icon Legend** — a generated user-guide page showing every icon the system uses
  and what it means, so a glyph spotted on a sheet or in a context menu can be
  looked up (#1110).

    The page is built from the code that defines the icons — `ITEM_METADATA`,
    `ACTOR_METADATA`, the Being sheet's `TABS`, and the `iconFAClass` of every
    intrinsic action — with names resolved through `lang/en.json`, so it cannot
    drift from the interface it documents. The generator fails the build if any
    section matches nothing, rather than silently publishing an empty legend.

    Each row renders the _real glyph_ rather than naming a CSS class. Both
    publishing targets already pass raw HTML through (`markdown-it` with
    `html: true` for journals, goldmark `unsafe = true` for the knowledgebase), so
    one source produces working icons in both.

    |                             |                                                 |
    | --------------------------- | ----------------------------------------------- |
    | `npm run build:icon-legend` | regenerates the page                            |
    | `npm run build:kb-icons`    | emits the webfont + CSS the knowledgebase needs |

    The knowledgebase loaded neither icon family, so `build:kb-icons` emits a
    stylesheet plus a game-icons webfont **subset to the glyphs the docs actually
    reference** — 12 glyphs, 3.4 KB, down from 970 KB for the full set. Font Awesome
    is loaded from a CDN as its free set; SoHL uses no Pro-only icons.

- f67f18a: **Impaired body parts affect a test's mastery level (#568)**

    Wire the Injury rules' _Indefinite Impairment_ consequences onto mastery-level
    tests, establishing the `impairedByRoles` → effective-mastery link:
    - **Unusable part → auto-Critical-Failure.** A grievous injury (or the
      permanent-unusable flag) makes a body part unusable; a test whose governing
      skill/attribute lists any of that part's roles in `impairedByRoles` is forced to a
      Critical Failure regardless of the roll (`unusableRoles()`,
      `testAutoCriticallyFails`, an additive default-off `autoCriticalFail` flag on
      `SuccessTestResult` — the die is still cast for display, then the outcome forced;
      `isCritical` reports `true`).
    - **Impaired-but-usable part → −5 / −10.** A part that is injured but still usable
      imposes its −5 (minor) / −10 (serious) penalty on the effective mastery level of
      any dependent test (`impairedRolePenalties()`, `testImpairmentPenalty`), taking
      the worst matching penalty as a labeled mastery-level delta. Unusable parts are
      excluded — they force the auto-CF instead — so the two views never overlap.

    Both are computed in `MasteryLevelModifier.successTest` and are strict no-ops for a
    test with no `impairedByRoles` or an actor with no impaired parts; a resumed
    `priorTestResult` is not penalized twice. Also adds the missing unit coverage for
    the prone (−20 melee) penalty on a combat technique's own strike mode, the sibling
    of the weapon path shipped with #562.

    The strike-mode required-limb (`minParts`) auto-CF / penalty variant (#628) and the
    remaining prone clauses need subsystems that do not exist yet and are follow-ups.

    Part of #548.

    Closes #568

- c805aa2: **Infection lifecycle**

    A poorly-treated wound can now fester into an infection, completing the injury
    recovery model (the deferred infection branch of #486).
    - **Infectable wounds** — the Treatment Test (#553) now marks a wound `infectable`
      when it is treated poorly (a failed roll); a marginal/critical success clears
      the risk.
    - **Contraction** — a Critical-Failure Injury Healing Test on an infectable wound
      contracts an **infection**: a separately-recorded `infection`-subtype trauma
      (Injury Level "X", aspect "Inf") starting one Healing Rate step above the wound
      it came from.
    - **Halts injury healing** — while any infection is active (Healing Rate below 6)
      no Injury Healing Tests are made for the patient.
    - **Infection Healing Test** — the infection recovers through the shared course
      test (`Healing Base × Infection Healing Rate`, fatigue applies): the Healing
      Rate shifts by the result (CF −2 / MF −1 / MS +1 / CS +2, floored at 1 — an
      infection never kills), it saps weakness fatigue by its Healing-Rate band
      (HR 1–2 → 10, HR 3–4 → 5, HR 5+ → none), and at Healing Rate 6 it heals, letting
      normal injury healing resume.

    Closes #557
    Part of #548

- 9283722: **Injury card: clearer Zone / Location layout and a compact Imp / IL / Shk summary**

    Reorganized the top of the Injury chat card. The location block now leads with a
    **Zone** row — the Zone-Number + Zone-Die aim trace ending in the zone name
    (e.g. `ZN 1 + d6 (5) = ZN 5 → Arms`) — followed by a **Location** row showing the
    struck location's _name_. The separate **Body Part** row is removed (it is
    inferable from the location), and locations are shown by name rather than
    shortcode. Impact, Injury Level, and Shock Index are consolidated into a single
    inline summary row reading `Imp: x   IL: x   Shk: x`. All labels, values, and the
    Shock Roll button text are localized, including the previously hard-coded
    zone-die roll expression (shared with the miss card).

    Closes #988

- c805aa2: **Injury Healing Test effect**

    An `injury`-subtype trauma now heals over time: its recurring `healingCheck`
    applies the **Injury Healing Test** at each elapsed checkpoint, in sequence. Each
    is a headless test of `Healing Base × Healing Rate` — a marginal success reduces
    the Injury Level by 1, a critical success by 2; a marginal failure does nothing;
    a critical failure does no healing (infection-on-CF is completed by the Infection
    work, #557). No test is made while the injury is untreated, already healed, or
    while any active infection halts the patient's healing. A shared `rollTimedTest`
    helper wraps `successTest({ skipDialog })` for the timed effects. Part of #548.
    Closes #486

- c805aa2: **Permanent impairment from slow-healing wounds**

    An eligible injury that takes a long time to heal now leaves a **permanent
    impairment** on its body part, completing the Injury Impairment model (the
    indefinite, severity-scaled impairment already tracked down as a wound heals is
    #464).
    - New Foundry-free `permanentImpairmentFor(days)` (time-to-heal table: none under
      20 days, then −5 per completed 20-day band, floored at −25).
    - When `TraumaLogic.healingCheck` heals an eligible injury (flagged by the
      Treatment Test, #553) to Injury Level 0, it records the permanent impairment on
      the injured body part via `BeingLogic.applyPermanentImpairment`, which worsens
      the part's persisted `permanentImpairment` (worst-of) with a whole-array write.
    - The body-part impairment rollup already consumes `permanentImpairment` as a
      floor, so the impairment persists after the wound itself has healed.

    Closes #554
    Part of #548

- c805aa2: **Injury Shock Test — a wound drives the being's shock state**

    The injury card's **Shock Roll** button is now wired: when a wound calls for a
    Shock roll, resolving it computes the wound's **Shock State Index** and worsens
    the being's shock state accordingly.
    - The button (`data-action="injuryShock"`) carries the wound's precomputed shock
      contribution (body-location Shock Value + Injury Level, including the
      glancing-blow point) and the glancing-blow roll bonus.
    - `BeingLogic.injuryShock` rolls the **Shock** skill headlessly — the being's
      fatigue penalty applies and the glancing bonus is added, but injury-impairment
      penalties do not — and its result adjusts the Shock State Index (CF +2 / MF +1 /
      MS 0 / CS −1). The index maps to a shock state (`≤6` None … `≥10` Dead), and the
      being is worsened to it (an injury never improves an already-worse state).
    - New pure helpers `shockStateFromIndex` and `shockIndexAdjustment` in the
      Foundry-free shock module.

    Closes #555
    Part of #548

- c805aa2: **Injury Treatment Test — establish an injury's Healing Rate**

    A `trauma` of subtype `injury` now supports the Physician **Treatment Test** that
    establishes its Healing Rate, unblocking the Injury Healing Test (#486, which
    assumes the rate is already set).
    - **Treatment Test action.** The `treatmenttest` intrinsic action rolls the
      owning being's **Physician** skill headlessly at the difficulty of the wound's
      _required treatment_ (looked up from the wound's aspect and severity band), and
      maps the result and severity to the injury's Healing Rate. A `HEAL` result (a
      critical success on a minor wound) heals the wound outright.
    - **Untreated resolves as a Critical Failure.** With no owning being able to roll
      (a headless/GM context, pending the interactive physician card of #547), the
      treatment auto-resolves as though the Physician roll were a Critical Failure.
    - **Special injury effects.** A surgical mishap (`EXT`/`SUR` treatment on a
      failure) or a grievous blunt/edged/piercing wound left at Healing Rate 2–3
      becomes a **bleeder** (arming the blood-loss timer, #487); and the wound is
      flagged for **permanent-impairment eligibility** (new
      `system.permanentImpairmentEligible` field) per its aspect, severity, and
      Healing Rate, for the Impairment system (#554) to apply.
    - The lookup tables live in a new Foundry-free `entity/body/injury-treatment`
      module. The `Frost` and `Projectile` aspects (and the amputation path) named in
      the rules are not yet representable in the impact-aspect model and are deferred.

    Closes #553
    Part of #548

- 93449c0: **Character-sheet release readiness (#491)**

    Gear drag-and-drop and sorting on the Being sheet, editable array fields on item sheets, and removal of dead UI and an orphaned document type — the gaps between "sheets render" and "open every sheet and set every property."
    - **Gear drag-and-drop and sorting (#492, #493, #494).** Gear rows on the Being sheet's Gear tab are draggable again (the drag selector matched no markup). Dropping gear onto a container — its header or its contents — moves the item into that container; dropping it outside any container returns it to On Body; dropping it onto another item reorders the list. Containment is by `system.containerId` reference, since items are never embedded in items.
    - **Array-field editors (#497).** Array-valued item properties can be added, edited, and removed from the sheet again — armor coverage locations (flexible / rigid), mystery skills, and attribute value descriptors and impaired-by roles. The whole array is written back on each change (never an element by index).
    - **Removed the orphaned `combattechnique` item type (#498)** from the manifest; it had no data model, logic, or sheet and produced a broken item from the Create dialog. Combat techniques exist only as a `skill` subtype.
    - **Removed dead item-sheet controls (#499).** Effect and action management controls with no working handlers are no longer rendered; effects and actions still display read-only. Wiring that management is tracked in #501.
    - **Removed dead item-sheet drop code (#495)** that embedded items inside items — the wrong containment model.
    - **Tests (#496, #500).** New end-to-end coverage drives real gear drop-to-container and drop-to-reorder events on the Being sheet; the shared item-sheet suite now also sweeps select and checkbox fields and guards that every rendered `system.*` input maps to a schema field.

- a03ba18: **Enforce `(type, shortcode)` as a unique item and actor key**

    Every SoHL item and actor now carries a non-blank `shortcode`, and
    `(type, shortcode)` is a **unique key** — per owning actor for embedded items, and
    per world for world actors and world items. This gives each document a stable,
    unambiguous handle for lookup and cross-references (weapon `assocSkillCode`,
    cohort members, birthsign terms) instead of relying on ambiguous names.

    **Enforcement (in `_preCreate`).** The key is resolved against its scope,
    honoring what the caller supplied and how the create was initiated:
    - _No shortcode supplied_ (system-generated or ad-hoc creates — a trauma from an
      injury, an API create) — one is **derived from the name and uniquified**, so
      programmatic creation can never fail on the key. This is the same fill +
      uniquify the create dialog offers a human, applied to every path.
    - _Explicit shortcode, Foundry duplicate_ ("copy this document"; Foundry stamps
      `_stats.duplicateSource`) — **auto-uniquified** (`arrow` → `arrow2`) so
      Duplicate keeps working. The prior prototype clone mechanism (`cloneActorUuid` /
      items-present heuristic) is dropped in favor of Foundry's native duplicate.
    - _Explicit shortcode, general create_ (dialog, drag, API) — the caller asked for
      that specific code; a collision is **rejected** (intent is unknown — they may
      be unaware it is taken).

    **Create dialog.** The shared create dialog pre-fills a unique shortcode from the
    name and keeps it in sync as you type (until you edit it), mirroring the existing
    name-uniquify — so the human flow always yields a valid, unique key.

    **Data.** The packaged _Basic Folk_ actor is backfilled with a `basicfolk`
    shortcode (its `system.shortcode` was blank).

    Closes #347

- 38d7b35: **KnowledgeBase home catalog and consistent section landings**

    The KB home page now leads with three large hero-image cards — Developer
    Documentation, User Guide, and Rules — followed by a "Content reference" catalog
    where every category is a boxy card with a 1792×768 hero banner. **Actors**
    (Characters, Creatures) and **Gear** (Armor/Clothing, Containers, Misc Gear,
    Projectiles, Weapons) are set off as their own bordered groups; Afflictions,
    Mystical Abilities, Skills/Attributes, and Trauma sit alongside.

    To support the Actors group, the KB build (`utils/build-kb-content.mjs`) now
    routes `character` and `creature` content to their own `/character/` and
    `/creature/` sections (previously a combined `beings` section), and emits an
    empty titled landing for an actor subtype that has no content yet — so a browse
    button always resolves rather than 404ing.

    The KB now also includes `package: thalorna` content (previously `sohl`-only), so
    Thalorna creatures and characters appear in the catalog alongside the core SoHL
    content.

    Each content section landing now shows its friendly title and hero banner (via a
    generated `_index.md`) instead of Hugo's auto section name, and renders in a
    consistent format:
    - **Tables** — Weapons and Armor (grouped by `kbcat`), Misc Gear (grouped tables),
      Containers (+ Capacity) and Projectiles, all sharing Name / Shortcode / Package /
      Dur / Weight / Value plus type-specific columns; and Characters / Creatures
      attribute tables (the Creatures page grouped by source subfolder, recorded as a
      `kbfolder` param since the KB tree is otherwise flat).
    - **"Name (shortcode) + description" rows** — Afflictions, Mystical Abilities, and
      the ungrouped default sections via a `_default/list.html` override; Skills/
      Attributes and Trauma render the same rows grouped by `kbcat`.

    The KB also now includes `package: thalorna` content (previously `sohl`-only), so
    Thalorna creatures and characters appear alongside the core SoHL content.

    A page's KB section is now its `type`, or its `category` when `type` is `doc` —
    so developer docs (`/dev-docs/`), the user guide (`/user-guide/`), rules
    (`/rules/`), and lore (`/lore/`) are each their own section. Each doc section
    renders its README as a curated landing (index + hero banner), and old URLs
    (`/dev/…`, `/guide/…`) redirect to the new ones.

    Obsidian-style `[[wikilinks]]` resolve to KB pages against a unique
    `section/slug` key plus collision-aware name/slug fallbacks — `[[Name]]` when the
    name is unique, `[[section/slug|Label]]` otherwise. The build **fails** on an
    ambiguous name or a broken intra-KB `section/slug`; an unknown bare target is
    treated as an external reference (e.g. a Thalorna world entity on the www site)
    and rendered as text. KB layouts and build only; no system-package impact.

    Closes #689

- 08bac7b: **KnowledgeBase: group section pages into `kbcat` tables, and add `kbcat` to skills**

    The KB Weapons, Armor/Clothing, Attributes & Skills, and Trauma landing pages now
    render their items grouped by `sohl.kbcat` instead of one flat list — each group a
    table (weapons/armor) or linked list (attributes/skills/trauma), rows sorted by
    name. The groups are generated dynamically from `.Params.sohl.kbcat` at every Hugo
    build (Hugo section-layout overrides under `kb/layouts/`; no theme changes), so
    newly added content appears automatically, and any new `kbcat` value not in the
    curated ordering is appended rather than dropped.

    To support the skill grouping, `sohl.kbcat` is added to the skill compendium
    content (derived from the source folder: `combat`, `craft`, `languages`, `lore`,
    `mystical`, `nature`, `physical`, `script`, `social`). Like all `kbcat` values it
    is authoring / KB-build metadata only — the item pack builders ignore it, so it
    does not enter compiled item system data.

    Closes #699.

- 6fd4543: **Add `sohl.kbcat` KnowledgeBase Category to compendium content**

    Adds a `sohl.kbcat` frontmatter property to the compendium source content, giving
    the knowledgebase build an explicit, stable grouping key. Values are always
    ASCII-lowercase and are derived per source directory:
    - `Afflictions/**` — the immediate folder name (`Poisons_And_Toxins` → `poisontoxin`).
    - `Armor/**` — `sohl.material` (spaces → underscores; diacritics stripped, so
      `Kûrbúl` → `kurbul`).
    - `Misc_Gear/**` — the immediate folder name (spaces → underscores).
    - `Mystical_Abilities/**` — `sohl.subType`.
    - `Trauma/physcond/**` — `phys` + the immediate folder name.
    - `Trauma/psycond/**` — `psy` + the immediate folder name.
    - `Trauma/fatigue/**` — `fatigue`.
    - `Weapons/**` — the immediate folder name.

    `kbcat` is authoring / KB-build metadata only — the item pack builders ignore it,
    so it does not enter compiled item system data.

    Closes #696.

- 1350f46: **Build-time localization-key coverage check**

    A new `lint:lang-coverage` step (`utils/check-lang-coverage.mjs`, wired into the
    `lint` chain and therefore `build:noci`) verifies that every localization key the
    system references exists in `lang/en.json`, and **fails the build** when one is
    missing.

    It gathers references two ways: concrete `SOHL.*` / `TYPES.*` string literals (read
    from the TypeScript AST, so JSDoc `@example` keys are ignored), and the labels a
    `defineType(prefix, def)` bundle generates — but only when that bundle's
    `labels`/`choices` is actually **consumed**, so internal `kind`-only registries
    whose labels are a byproduct are not required to have entries. `defineType`
    prefixes, DataModel `LOCALIZATION_PREFIXES`, and dynamic `` `SOHL.X.${type}` ``
    template heads are treated as namespaces rather than concrete keys. Unreferenced
    en.json keys are reported as a non-fatal warning (`--unused` lists them).

    To make every `defineType` call statically analyzable, no-substitution backtick
    prefixes were switched to straight quotes and computed `[ITEM_KIND.X]` /
    `[ACTOR_KIND.X]` property keys inlined to their literal values (behavior-preserving).

    The check also uncovered and fixed real gaps: three references pointing at wrong
    keys (`SOHL.SUCCESSTESTRESULT.evaluate.NoPerm`, `SOHL.DELTAINFO.DISABLED`,
    `SOHL.TestResult.SUCCESS`/`.FAILURE`) now point at the existing correct keys, and
    29 genuinely-missing keys were added. `lang/en.json` is now sorted.

    Closes #946

- 4b65b2a: **Per-movement-medium data accessors + ground-up carried weight**

    Adds medium-aware read accessors to the being's movement logic, each taking an
    optional `medium` that defaults to `defaultMoveMedium`:
    - `getMoveBase(medium?)` — the persisted per-medium `moveBase` scalar.
    - `getFeetPerRound(medium?)` / `getLeaguesPerWatch(medium?)` — the matching
      movement profile's tactical / travel speed.
    - `getEncumbrance(medium?)` — the profile's `encumbrance` `SafeExpression`
      evaluated against the being's carried weight (`wt`).
    - `getStrMod(medium?)` — the profile's `strMod` `SafeExpression` evaluated
      against the being's strength (`str`).

    The expression accessors read context from the owning being; with no owning
    being (or no strength attribute), `str`/`wt` default to `0`, and a missing
    profile yields `0` — the accessors never throw.

    Introduces a ground-up **carried-weight** mechanism: each carried gear item adds
    its `weight × quantity` to the owning being during its own `evaluate()` phase,
    exposed via a new **`BeingLogic.carriedWeight`** getter (reset each prepare
    cycle). The `getEncumbrance` accessor reads it for `wt`.

    Closes #367

- d03d134: **Expression-driven movement-profile paradigm**

    A being's movement replaces its flat `encumbranceRate` / `bodyWeightBase` scalars
    with a data-driven, per-medium model:
    - **`movementProfiles`** — one entry per movement medium, each carrying
      `feetPerRound`, `leaguesPerWatch`, and `SafeExpression`s for `encumbrance`
      (of carried weight `wt`) and `strMod` (of `str`).
    - **`personalFatigue`** — a `SafeExpression` of encumbrance (`enc`).
    - **`bodyWeight`** — either a fixed `base` (pounds) or, when `base` is null, a
      `SafeExpression` `calc` of the being's strength (`str`).

    The movement logic gains a **`baseWeight`** getter that returns `bodyWeight.base`
    when set, otherwise evaluates `bodyWeight.calc` against the owning being's `str`.
    The per-medium `moveBase` scalar (which Active Effects target and the movement
    system reads) is mirrored from each profile's `feetPerRound` during export, so
    compendium beings no longer ship an empty `moveBase`.

    The pack exporter and the Human Folk compendium source are updated to the new
    format. Supersedes the interim `encMod` carry-capacity field.

    Closes #365

- c24ad48: **Maladiction affliction subtype, and clearer Affliction vs. Trauma rules**

    Adds a fourth Affliction **subtype**, `maladiction`, for _supernatural_
    afflictions — a curse, a hex, a divine or spirit blight. Afflictions now classify
    their afflicting agent as chemical (**Poison/Toxin**), biological (**Disease**),
    supernatural (**Maladiction**), or **Other**, and the `disease` subtype no longer
    has to stand in for curses. The addition is purely additive: existing afflictions
    are unaffected, no migration is required, and the contagion/exposure lookup still
    treats only **Disease**-subtype afflictions as contagious.

    Also clarifies the docs so a first-time reader can tell the two condition item
    types apart. The **Afflictions** rules page gains an _Affliction vs. Trauma_
    section (process/agent vs. carried condition/state), a _Subtypes_ table, and new
    _Transmission and contagion_ and _Diagnosis and treatment_ sections; the
    **Trauma** page mirrors the distinction and names the Shock Test and Shock Index
    in its index. The stale subtype list on the Affliction item-guide page (which
    still listed categories long since moved to Trauma) is corrected to the real four
    subtypes.

    Closes #1003

- 7a32d5d: **Version-keyed world migration runner**

    Add a real migration runner keyed to the `systemMigrationVersion` world setting
    (previously registered but unused). On `ready` the active GM now compares the
    world's stored migration version against the running system version, runs any
    applicable migration steps across the in-scope document types — Actors, Items,
    their embedded ActiveEffects, and scene-region `trigger` behaviors — and stamps
    the version forward. A brand-new world is stamped to the current version without
    running anything; a pre-tracking world with existing content plans from `0.0.0`.

    The migration registry ships **empty** — this is infrastructure only, with no
    data migration required at this time. Future migrations plug in as a single
    frozen entry in the Foundry-free registry (`sohl.entity.migration`), whose
    version comparison, step planning, and per-document folding are fully
    unit-tested. The existing report-only scan for retired `trait` items (#651) is
    preserved.

- 2ede925: **Morale, Rally, and Reaction tests (#559)**

    Implement the **Morale Test** (a test of the **Initiative** skill) and its states,
    the **Rally Test**, and the **Reaction Test**.
    - **Morale Test** — a self-sufficient Being action mapping the roll to a morale
      state (Brave / Steady / Withdrawing, and the CF0/CF5 split of Catatonic vs
      Routed). Each morale-failure source is a `morale`-subtype trauma; the effective
      state is the most severe active one. Routed grants **+1** and Catatonic **+2**
      Psyche Stress; a Brave result grants the shared five-minute **+20** to Morale and
      Fear tests.
    - **Reaction Test** — an Initiative test a shaken combatant makes to shake off the
      state: on success a Catatonic victim improves to Routed and any other shaken
      victim snaps back to Steady; on failure it persists.
    - **Rally Test** — a leader's Command/Initiative test. Under the Prime Directive a
      rally is **offered, not imposed**: on a success it posts an **open** action card
      any shaken ally's controller may accept to steady their own character (CS) or make
      a Reaction Test (MS); a failure posts an informational card noting the lockout.

    The pure rule mappings live in a Foundry-free `morale` module
    (`moraleStateFromTest`, `moralePsyGain`, `reactionOutcome`, `rallyOutcome`, and the
    effect predicates), reusing the shared state-ladder recorder with fear.

    Part of #548. Closes #559.

- 98bda54: **Mystical Abilities can now be improved, not just flagged** ([#1130](https://github.com/Song-of-Heroic-Lands/Song-of-Heroic-Lands-FoundryVTT/issues/1130))

    A Mystical Ability could be flagged for improvement from two places — the ☆ star
    on its Mysteries-tab row and the **Improvement Flag** checkbox on its Properties
    tab — but nothing ever consumed the flag. There was no counterpart to the Skill's
    _Improve with SDR_.
    - **The improvement quartet is now on Mystical Abilities too** — _Toggle Improve
      Flag_ and _Improve with SDR_ in the Actions context menu, plus the two hidden
      half-toggles (_Flag for Improvement_ / _Clear Improvement Flag_) kept for
      scripts. They run the **same code** the Skill's do, so the two can never drift.
    - **A successful SDR raises the ability's own mastery level by 1** and clears the
      flag; a failure clears the flag alone. The roll is `1d100` against the current
      base mastery level — an ability has no Skill Base of its own to add.
    - **The ☆ star now appears only where it means something.** An ability that draws
      its mastery level from an Associated Skill (or, for a Spirit Rite or Spirit
      Action, a Spirit Power) improves when _that_ item improves, so it shows no star
      and offers no improvement actions.
    - **Improving an ability never touches its Associated Skill** — every write lands
      on the ability alone.

    Also removes the dead `SOHL.MysticalAbility.FIELDS.isImprovable.*` strings and
    the sheet's stale reference to the field they described, removed in #815.

- c49874f: **Consistent null / undefined convention: null at the edges, undefined in the core**

    Adopts a single, defensible rule for representing absence and applies it to the
    code layer, so `null` and `undefined` are no longer used interchangeably.

    **The convention**
    - _Persistence and the Foundry API boundary_ use `null` — Foundry mandates it
      (DataModel fields, `DialogV2` dismissal, `getFlag`, document lookups) and `null`
      is JSON-safe.
    - _The logic/domain layer_ uses `undefined` for "maybe absent" — matching optional
      parameters/properties (`?:`), which already yield `undefined`.
    - The [`FoundryHelpers`]{@link FoundryHelpers} shim _normalizes_ Foundry `null` to
      `undefined` as values cross into the logic layer.
    - `== null` / `!= null` (matches both) is the blessed idiom at genuine mixed
      boundaries; an `eqeqeq` lint rule (`{ null: "ignore" }`) now enforces strict
      equality everywhere else.

    **Changes**
    - Removed the `Optional<T>` (and unused `OptArray<T>`) global type alias in favour
      of native `T | undefined`. An alias cannot express `?:` optional positions, so it
      could never be the single consistent spelling.
    - Normalized the remaining `FoundryHelpers` accessors that feed the logic layer
      (`fvttGetActor` / `fvttGetScene` / `fvttGetToken` / `fvttGetUser`,
      `fvttActiveCombatantForActor`, `fvttActiveTokenLogicForActor`, `getContextItem`,
      `fvttGetTargetedTokens`, `fvttRangeToTarget`, `combatantGridDistance`) plus the
      matching `SohlTokenDocument` statics to return `… | undefined` instead of
      `… | null`, matching the already-normalized UUID/scene/combat helpers. The
      `DialogV2` dismissal helpers keep `null`. Test mocks updated in lockstep.
    - Added the `eqeqeq` rule to the ESLint config.

    **DataModel empty-value representation**

    Applies a companion rule to persisted schema fields: represent "empty" with a
    typed blank sentinel (`""`, `0`, `[]`) when the empty state is itself a valid
    value, and `nullable: true, initial: null` only when "unset / not-applicable"
    must be distinguishable from every valid value. Every field now sets `initial`
    explicitly.
    - Gave explicit `initial: ""` to string fields that previously defaulted to
      `undefined` (Foundry only auto-fills `""` for _required_ strings):
      `skillBaseFormula`, `parentSkillCode`, `material`, `leaderName`, `moveRepName`,
      and `StrikeModeBase.assocSkillCode` (now `blank: true`).
    - Set explicit choice defaults where they were missing: `StrikeModeBase.type`
      (`MELEE`) and `impactBase.aspect` (`BLUNT`), and `ProjectileGear.subType`
      (`NONE`).
    - Unified the impact-base dice trio between `StrikeModeBase` and
      `ProjectileGearDataModel`, which had inverted representations: `numDice` is
      always a non-null count (`min: 0, initial: 0`; `0` = no dice); `die` is
      nullable (`null` = "does not apply", else an integer ≥ 2); `modifier` is
      nullable (`null` = "does not apply", `0` = none). Data-layer types updated to
      `number | null` accordingly.
    - Fixed the lone contradictory field: `ActiveEffect` `changes[].value` was
      `nullable: true` with `initial: ""`; it is now non-nullable (a change value is
      always present).
    - Left the correctly-nullable field as-is: `AttributeDataModel.scoreBase`
      (`null` = the attribute has no score).
    - Made the `MysteryDataModel` fields whose documented `null` semantics were
      unreachable actually nullable (`initial: null`): `charges.max` (`0` = no
      maximum, `null` = does not use charges), `charges.value` (`null` = infinite
      charges), and `levelBase` (`null` = no defined level). `MysteryLogic` already
      branched on `!== null`; its `charges.value` is normalized `?? undefined` before
      seeding the `ValueModifier`, which rejects `null`.

- 0ad8a5b: **Offer the affliction onset check at contraction, instead of auto-arming**

    Closes out the "nothing auto-schedules" migration (issue #579): the **last**
    creation-time auto-schedule — an affliction seeding its own `onsetCheck` when
    created — is now an **offer**, matching healing / blood-loss / course.
    - `AfflictionDataModel._preCreate` seeds only the cadence config (`contractDate`,
      `onsetDurationBase` from `onsetDurationFormula`) — no `onsetCheck` schedule.
    - `BeingLogic.contractDisease` (the designed contraction path: contagion test →
      on failure, create the affliction) then **offers** the onset check via the
      shared `offerSchedule`. Accept schedules it, decline clears it; a scripted
      caller pre-answers via `scope.schedule` or suppresses with `skipDialog`. The
      offer's per-effect title is "Set an Affliction Onset Reminder?".
    - **Unchanged:** the onset _phase transition_ (`AfflictionLogic.onsetCheck`) still
      auto-schedules the resolution + recurring healing checks — that is the disease
      progressing as the direct consequence of a human-performed step (consent-gated
      by #587), not a creation-time auto-schedule. The recurring healing check already
      offers its reschedule.

    _Behavior note:_ a disease created by a raw drag (bypassing `contractDisease`,
    like a direct `createEmbeddedDocuments`) no longer auto-onsets — consistent with
    how direct trauma creation bypasses its offer. The GM triggers onset via the
    action.

    With this, **every** recurring timed effect — healing, blood-loss, course, onset
    — is armed only at a human's behest, at creation and on every re-schedule.

    **Tests.** Unit tests cover the offer (accept → `sohl.schedule`; decline →
    `sohl.unschedule`). A new button-driven e2e (`affliction-onset-offer.cy.js`)
    contracts a disease end to end — forcing the contagion d100 to fail
    (`SimpleRoll.forceValues`, #598), pressing through the pick and success-test
    dialogs, then pressing **Schedule** / **Not Now** on the onset offer and asserting
    the onset check is armed / left unarmed.

    **Also fixes the pre-existing affliction e2e breakage (#570).** The #565 subtype
    reorg left the e2e factory and several specs creating afflictions with removed /
    moved subtypes (`privation`, `fatigue`), which fail `choices` validation and
    create a typeless document — so 5 affliction specs were red on `main`. Updated to
    the post-#565 taxonomy: the affliction factory default is `other`; the
    afflictions-section fixtures use valid affliction subtypes; and the header
    Fatigue-indicator spec now creates a **fatigue trauma** (fatigue is a trauma
    subtype now, and the indicator lights from active traumas).

    Closes #602
    Closes #570

    Refs #579, #595, #598.

- 89bea7f: **Offer blood-loss and recovery-course schedules too, instead of auto-arming**

    Completes the "nothing auto-schedules" migration for timed effects (issue #579):
    the two remaining recurring checks that still armed themselves — a bleeding
    wound's **blood-loss advance** and a lasting condition's **recovery course** — are
    now **offered**, matching the healing-check offer.
    - **Blood-loss** is offered wherever a wound starts bleeding: when an injury bleeds
      on infliction (`createTraumaFromInjury`) and when a treatment leaves it bleeding
      (`TraumaLogic.treatmentTest` — was an auto-`sohl.schedule`).
    - **Recovery course** (`courseCheck`) is offered when its lasting condition is
      created: an **Extended Shock / Coma** from a shock re-test
      (`BeingLogic.createLastingShock`) and an **infection** from a critical-failure
      healing test (`TraumaLogic.contractInfection`).
    - **`TraumaDataModel._preCreate` no longer seeds any recurring schedule** — only
      the cadence config (the offer's default). Each creating action forwards its
      context, so the interactive path prompts (a dialog, per the prefer-dialog rule)
      while a scripted/bulk caller can pre-answer (`scope.schedule`) or suppress it
      (`skipDialog`).
    - **Per-effect offer titles.** Because a bleeder wound now fires two offers
      back-to-back (healing check, then blood-loss advance), each schedule offer's
      title names its effect — "Set a Blood Loss Advance Reminder?" instead of two
      identical "Set a Reminder?" dialogs — so the player can tell them apart. The
      whole title is one localization string (`SOHL.Schedule.title`, with an
      already-localized `{actionName}`) so translations control word order.

    With this, every recurring timed effect — healing, blood-loss, course — is armed
    only at a human's behest, at creation and on every re-schedule.

    **Tests.** A new e2e (`timed-effect-creation-offer.cy.js`) presses the _real_
    offer buttons, modelling the player per the testing-doc rule of thumb: pressing
    Schedule / Not Now on the **blood-loss** offer arms / leaves it unarmed, and a
    **critical-failure healing test** (driven deterministically via the forced-dice
    seam, `SimpleRoll.forceValues(100)`) contracts an infection whose **recovery
    course** offer is then Scheduled by button. Two new reusable Cypress commands
    support it — `cy.submitDialogMatching(text, action)` to answer a specific one of
    several look-alike dialogs by content, and a hardened `cy.submitDialog` that only
    targets a _rendered_ dialog (Foundry retains closed dialog instances, whose stale
    elements otherwise leak across tests).

    Refs #579, #598.

- 76aa4fb: **Offer to schedule a wound's healing check at creation, instead of auto-arming**

    Creating an injury no longer silently arms its healing check — the last spot where
    a timed effect scheduled itself without a human (issue #579, completing the
    offer-to-reschedule work). When a wound is recorded, the system now **offers** to
    track its healing: a dialog (default **Schedule**, showing the rolled cadence —
    "in 5 days") shown to the player who took the wound, on their own client. They hit
    OK to track it, adjust, or decline.
    - **A dialog, not a card — because the responder is _me_.** The chat-card
      `[Perform]` buttons exist for a response deferred to later or to someone else; a
      choice the acting human makes here and now (I just took this wound) is a dialog.
    - **No auto-arm at creation.** `TraumaDataModel._preCreate` seeds only the config
      (contract date, the cadence formula/base); `createTraumaFromInjury` then calls
      the shared offer. Both `createInjury` paths (automated aim, assisted dialog)
      forward their context, so a scripted/bulk caller can pre-answer via
      `scope.schedule` or suppress with `skipDialog` — but the interactive path prompts.
    - **The offer helper is generalized.** `offerReschedule` → **`offerSchedule`**
      (same mechanism serves the first schedule and the re-schedule); its dialog now
      leads with **Schedule** as the default and shows the interval, so accepting is a
      single OK. Lang keys `SOHL.Reschedule.*` → `SOHL.Schedule.*`.

    Scope: this covers the injury **healing check** (the player-facing flow).
    Blood-loss / lasting-condition course / affliction onset still auto-arm at creation
    for now — separate follow-ups.

    Refs #579.

- 6fd4543: **Migrate Privation and Fatigue content to Trauma items**

    The taxonomy reorg (#565) moved Privations and Fatigue out of `AFFLICTION_SUBTYPE`,
    but their compendium content was never migrated with it. The 10 Privation and 21
    Fatigue items are now Trauma items:
    - Privations become **Physical Condition** (`physcond`) traumas. Because Physical
      Condition categories are `trait`/`impediment`/`debility`, each privation's
      `category` is graded from its `levelBase` — `trait` (0–1), `impediment` (2),
      `debility` (3+).
    - Fatigue items become **Fatigue** (`fatigue`) traumas, keeping their
      `FATIGUE_CATEGORY` (windedness / weariness / weakness).
    - Affliction-only frontmatter (`diagnosisBonus`, `contagionIndex`, `transmission`)
      is dropped; `levelBase` / `healingRateBase` are retained.
    - The items move under the Trauma compendium folders — Privations under
      _Trauma › Physical_, Fatigue under _Trauma_.

    The now-Trauma-only `FATIGUE_CATEGORY` enum and its localization move from
    `SOHL.Affliction.FATIGUE_CATEGORY` to `SOHL.Trauma.FATIGUE_CATEGORY`; the
    affliction-only `PRIVATION_CATEGORY` enum and its localization are removed.

    Closes #692.

- 2ede925: **Prone combat penalty (#562)**

    Wire the core mechanical effect of the prone condition: a **−20 to all melee
    attacks and defenses**. When a wielder carries the `prone` status, each melee
    strike mode's **attack**, **Block**, and **Counterstrike** modifiers take a −20
    penalty — applied imperatively during preparation (in `WeaponGearLogic.evaluate`
    for weapons, and in `SkillLogic.finalize` for combat techniques that carry their
    own strike mode), the same way body reach is folded in, so the penalty is visible
    in the combat-tab effective mastery level as well as at roll time.

    The pure application lives in a Foundry-free `prone` strike-mode helper
    (`applyProneMeleePenalty` / `PRONE_MELEE_PENALTY`). The remaining prone effects —
    the Engagement-Zone, body-part-selection, and Outnumbered interactions, and the
    quarter-Move cost to rise — belong to those subsystems and are follow-ups.

    Part of #548. Closes #562.

- 2ede925: **Psychological Condition & Aural Shock (#560)**

    Implement Psyche Stress Levels (PSY) and Aural Shock as psyche traumas, with their
    recovery tests.
    - **Psyche Stress Recovery Test** — a `psycond`-subtype condition recovers through
      a recurring Will test (every d6 days; fatigue does not apply). `MS`/`CS` recover
      −1/−2 PSY; a Critical Failure is a **Grievous Stress** that turns an _indefinite_
      condition **permanent** (or raises a permanent one's PSY by 1). An indefinite
      condition goes away when its PSY reaches 0. The recovery is a self-sufficient,
      offered action (issue #579) — it never auto-fires.
    - **Aural Shock** — an `auralshock`-subtype trauma (1–6, stacking) that inflicts 5
      Weakness Fatigue per level and recovers through a daily Will test (`MS`/`CS`
      recover −1/−2 AS; a Critical Failure grants +1 PSY). Recovered when AS reaches 0.
    - **Shared inflictors** — `inflictPsycheStress` / `inflictAuralShock` record each
      instance separately, as the rules require. Fear and Morale route their PSY gains
      through the former.

    The pure rule mappings live in a Foundry-free `psyche` module
    (`psycheRecoveryOutcome`, `auralShockRecoveryOutcome`, `psychePresentation`,
    `weaknessFatigueForLevel`). The ~10-minute behavioral onset and the Aura-test
    lockout / automatic-critical-failure gating are follow-ups (the latter joins the
    test-resolution auto-critical-failure work).

    Part of #548. Closes #560.

- 1554361: **Document what SoHL is for, and the consent-dialog testing pattern**

    Now that the consent model reaches all the way to the timed-effect flows (issue
    #579), write down the two things that make it legible — one for players, one for
    contributors — and make the e2e suite model the pattern it now describes.
    - **User guide — "What to Expect: SoHL Assists, It Doesn't Play for You."** A short
      up-front section on the system's purpose (an _aid_ for playing HârnMaster,
      not a video game that plays it for you) and the one rule everything follows: _it
      guides, prompts, and reminds — it never acts on your character without your
      say-so._ It explains the two shapes an offer takes (a **dialog** when the choice
      is yours here and now; a **chat-card button** when the response is deferred or
      belongs to someone else), that you can always ignore / do-by-hand / GM-override,
      and the pattern to expect throughout — _offer → remind → perform → offer the
      next_ — with a worked wound example. Patterns, not a per-flow catalog, so the
      guide stays lean.
    - **Testing doc — "Consent dialogs are landmines."** A new subsection on the e2e
      reality that a consent dialog hangs a headless run until something answers it.
      Two sanctioned ways: **press the real button** (`cy.submitDialog("<action>")`
      against a stable `data-action`) to model the user when the offer _is_ the subject
      under test; or **pre-answer / suppress** it (`{ skipDialog: true }`,
      `scope: { schedule: false }`, or inline `data-scope`) for setup. The rule of
      thumb: when you add an offer behind a human trigger, grep `cypress/e2e` for the
      specs that hit that seam and make each one answer it (and note that
      `createEmbeddedDocuments` bypasses the offer entirely).
    - **A button-driven e2e that follows the pattern.** `timed-effect-reschedule.cy.js`
      gains a companion test that presses the actual **Not Now** button on the reschedule
      offer and asserts the schedule clears — proving the button choice, not a scripted
      scope, drives the outcome, exactly as the doc recommends.

    Refs #579.

- b9e4972: **`sohl.utils` is now the full utils namespace, matching the docs (#408)**

    `sohl.utils` was bound to the `helpers` module alone, so documented accessors like
    `sohl.utils.ACTOR_KIND`, `sohl.utils.buildActionScope`, and
    `sohl.utils.collection.SohlMap` were `undefined` at runtime even though the
    namespace-tree docs render them under `sohl.utils`. It is now bound to the
    **`utils` namespace** — the superset barrel that re-exports the helpers and the
    constants at its top level and nests `collection` — so runtime and docs agree.

    `sohl.utils.romanize()` is unchanged (helpers are re-exported at the top level),
    and the curated `sohl.constants` alias is kept as-is
    (`sohl.constants.ACTOR_KIND`). The binding follows the same cycle-free pattern as
    `sohl.document` / `sohl.core` / `sohl.apps`: a type-only `declare` on `SohlSystem`
    plus a runtime assignment in `sohl.ts`. This completes the namespace-tree epic
    (#401).

- f67f18a: **Register the `attribute` item kind**

    The `attribute` item kind shipped with data-model, logic, and sheet classes but
    was never registered, so items of that kind did not function.
    - Register the kind in the item data-model, logic, and sheet registries so it
      loads and behaves like every other item kind.
    - Fix `AttributeSheet`, which a copy-paste error left exporting the wrong class
      and rendering unrelated fields. It now renders the attribute's own fields
      (`scoreBase`, `initDiceFormula`, value descriptors, and impairing body roles)
      via a new `attribute-properties.hbs` template, with the array fields shown
      read-only.

- a1ce841: **Let variant modules override per-kind Logic classes**

    Exposes the base actor/item Logic classes at runtime and adds registration so a
    variant module can subclass and swap them:
    - `sohl.actorLogicClasses` / `sohl.itemLogicClasses` — kind → base Logic class,
      for subclassing.
    - `sohl.registerActorLogic(kind, cls)` / `sohl.registerItemLogic(kind, cls)` —
      override the class used to build every document of that kind.

    The resolution path (`SohlDataModel.create`) already reads these maps, so no
    construction sites change — a document prepared after registration uses the
    registered class. Register during a module's `init`/`setup` hook, before the
    first `.logic` for that kind is built.

    Part of #80. Closes #82.

- e809b2c: **Remove the Domain and DomainRegistry concept**

    The `Domain` / `DomainRegistry` concept is removed in full. It was a
    world-setting-backed registry (`sohl.domains`) with a GM **Domain Manager**
    settings menu, a `DOMAIN_FAMILY` enum, built-in seed data, and a set of
    localization keys, intended to back a `domainCode` / `domain` field on Mystery,
    MysticalAbility, and Skill items. That field was never added to any DataModel,
    so the only remaining consumers were orphaned sheet-context reads that always
    resolved to `undefined`.

    Per-skill modifiers such as a birthsign's are expressed instead through Active
    Effects keyed on a skill's shortcode or subType, not on Domains.

    **Removed**
    - The `sohl.entity.domain` module (`DomainRegistry`, `DomainEntry`,
      `BUILTIN_DOMAINS`), the `DomainManagerApp`, and its `domain-manager` view/template.
    - The `sohl.domains` world setting, the `domainsMenu` settings menu, and the
      built-in domain seeding at world start.
    - The `DOMAIN_FAMILY` / `DomainFamily` enum and helpers in `constants.ts`.
    - The `SOHL.Domain.*`, `SOHL.DomainEntry.*`, `SOHL.DomainManager.*`,
      `SOHL.Settings.domains*`, and `*.FIELDS.domainCode.*` localization keys, plus
      the orphaned `system.domain` / `system.domainCode` reads on the Mystery and
      MysticalAbility sheets.

    This supersedes the interim `SohlDomains` → `DomainRegistry` rename and the
    `DomainManagerApp` stored-XSS fix (#160): the code carrying both is gone, so the
    vulnerability is eliminated with it.

    Closes #1019

- f3cc51a: **Remove the `__func__:` code reviver — untrusted data can no longer become executable (#170)**

    `defaultFromJSON` no longer reconstructs functions from serialized strings.
    The `__func__:` revive branch and the `serializeFn`/`deserializeFn` helpers
    (which compiled `new Function` from a string with no screening) are removed.
    This closes the cross-client remote-code-execution path where a crafted chat
    card `data-scope` — or persisted document data — could carry a `__func__:`
    payload that was revived into a live function and later invoked. Part of the
    "reference code, don't compile it" remediation (epic #154); functions are never
    revived from serialized data.
    - `defaultFromJSON`: the `__func__:` branch is gone. Such a string (which no
      current writer emits) is returned verbatim as an inert string; there is no
      `new Function` path.
    - `buildActionScope` rejects any chat-card scope payload containing a
      `__func__:` marker outright (defense-in-depth on the untrusted path).
    - `SuccessTestResult` accepts a `targetValueFunc` only when it is an actual
      function; any other value falls back to identity, so revived data cannot
      become callable.
    - **Removed exports:** `serializeFn` and `deserializeFn` (no consumers).

- 44a6616: **Resolve Injury — the injury flow becomes a single, richer intrinsic action**

    The Being's injury flow is now one **Resolve Injury** action behind the intrinsic
    action, the combat cards' injury buttons, and the sheet's Add Injury — replacing
    the old `createInjury` handler and the separate `addInjuryViaDialog`. It seeds its
    parameters from the action scope, derives the hit location (an explicit body
    location, else the target body part — a random `VITAL` part when unspecified — and
    the strike spread), and resolves the blow through the pure resolution pipeline.

    New behavior on top of the old flow:
    - **Armor reduction now applies only to a piercing aspect** (an armor-defeating
      point), matching the rules; other aspects ignore it.
    - **Bleeding is judged on its own impact.** A new **bleed impact penalty** boosts
      the effective impact used _only_ for the bleeding check, so a bleed-prone strike
      can bleed at a higher effective severity than its injury level implies. With no
      penalty the bleed severity equals the injury severity (unchanged).
    - **Amputation is resolved, not just flagged.** A G5 edged wound at an amputable
      location now rolls a **Strength test** (with a confirmable modifier) whose result
      may sever the location — fatal if it is vital — make it bleed, or penalize the
      Shock Roll by 20. The result card shows the outcome instead of a "roll manually"
      note.
    - **A treatment modifier** can be set on the resulting wound
      (`treatmentModifierBase` on the Trauma), and whether the wound is recorded now
      defaults from the world's "record trauma" setting.

    Under the consent model the combat injury button now opens the Resolve Injury
    dialog so a human confirms the wound, rather than resolving silently.

    Also fixes a data-model defect uncovered here: `TraumaData.treatmentModifierBase`
    was declared on the interface but missing from the `TraumaDataModel` class
    properties, breaking `build:types`.

- 462376b: **Resolve Injury: Zone-Number + Zone-Die hit location targeting**

    The Resolve Injury action now determines its hit location by **Zone-Number aiming
    with a Zone Die** instead of a body part plus a spread radius, matching the body
    model's zone tier.

    **Dialog.** "Target Body Part" becomes **Target ZN** (a Zone Number, default 1)
    and "Spread" becomes **Zone Die**. The **Location** dropdown defaults to
    "(derive from Target ZN + ZD)"; Target ZN and Zone Die are enabled and required
    only while that derive option is selected, and disabled when a specific location
    is chosen. The Aspect dropdown now shows localized labels instead of the raw
    value.

    **Derivation.** `Hit ZN = (Target ZN − 1) + a 1..ZD roll`; the zone owning that
    number yields a weighted part, then a weighted location within it. A Hit ZN beyond
    the body's zone range is a **miss** — a no-impact card and no recorded Trauma. An
    incorporeal being (empty body) cannot take a physical injury and the action aborts
    with a notice.

    **Result card.** When the location was derived, the card shows the aim trace
    (Target ZN, `d<ZD>`, the rolled value, the final Hit ZN, and the zone — or
    "Missed"); when the location was set by hand, it shows a "Location overridden by
    player" notice.

    **Combat.** An aimed blow's impact card maps the aimed body part onto its zone's
    number so combat-driven injuries resolve automatically under the new model.

    **Removed the "Use Zone Die" world setting** — strike-mode scatter is now always
    presented as a Zone Die (`d<n>`) on the Combat tab, the strike-mode editor, and
    the print sheet.

    Closes #828

- 9dc1de6: **Restore the Being sheet header: clickable status pills, health bar, body-location lozenges**

    Rebuild the Being sheet header to match the previous design, in `templates/actor/being/header.hbs`, `scss/layout/_sheet.scss`, and `src/document/actor/foundry/BeingSheet.ts`:
    - **Status pills** now look like the old rounded lozenges (grouped top-right, wrapping) and are **clickable to toggle** the status — a new `toggleStatus` action calls `actor.toggleStatusEffect(statusId)`, creating/deleting the active effect. Active pills are highlighted.
    - **Health bar** restored: a labelled, filled bar in the header (added `healthPct` to the header context).
    - **Body-location lozenges** restored as a read-only, full-width row beneath the main header, generated dynamically from the actor's body structure (`system.body.structure.parts`).

    Status `data-status-id`/tooltips and localization keys are unchanged.

- 06c7eac: **Retire the `combattechnique` item type**

    Combat techniques are now a `combattechnique` **skill subtype** (introduced in earlier work), so the standalone `combattechnique` item type is removed: its DataModel, Sheet, and Logic classes, its registration, its item-type enum entry and metadata, and its localization keys are all gone.

    **Combat machinery re-sourced from skills.** Reach, available/blockable/in-range strike modes, the melee-attack gating, and strike-mode pointer resolution now read technique strike modes off `combattechnique`-subtype skills (`SkillLogic.strikeMode` / `strikeModes`) instead of the retired item type.

    **Combat-tab section removed.** The Being sheet's Combat tab no longer renders a dedicated Techniques section. Technique strike modes will resurface through the aggregated Strike Modes view (tracked separately); until then, techniques are edited on the skill sheet.

- 2e22618: **Retire the `trait` item type**

    The `trait` item type is removed: its DataModel, Sheet, and Logic classes, its
    registration and per-actor logic accessors, its item-kind enum entry and metadata,
    its `TRAIT_SUBTYPE` / `TRAIT_INTENSITY` / `TRAIT_EFFECT_KEY` / `TRAIT_CODE` enums,
    and its localization keys are all gone. The Being sheet's Profile tab no longer
    renders a Traits section (and its `search-traits` filter is removed).

    **The trait data was already modeled elsewhere.** Descriptive personality and
    physique traits became Trauma conditions in the earlier trauma work; the remaining
    _measured_ physical stats are already first-class fields on the Being/actor data
    model after the Corpus→Being dissolution — Body Weight (`body.weight`), Move (the
    universal `currentMoveMedium` / `movementProfiles` capability), and Size's effects
    (`body.reachBase`, `body.bodyScaleBase`), with Carrying Capacity subsumed by the
    encumbrance system. The lone descriptive straggler, handedness, is remodeled as
    two `physcond` trauma items, **Right Dominance** and **Left Dominance** — a
    whole-side (not hand-only) preference; the ambidextrous have neither.

    **Legacy documents are flagged, not converted.** Surviving `trait` documents are
    **not** auto-migrated. On every GM world-load the system reports each one as an
    unrecognized retired type (console error plus a persistent UI notification) and
    leaves it untouched — the GM removes it or recreates its data as a
    `trauma`/`attribute` by hand. This avoids lossy guesswork about a removed type.

    Closes #651
    Closes #532

- e1bd806: **Revert UI icons from the embedded SoHL icon font back to Font Awesome** (#505)

    Sheet and application UI icons use Font Awesome classes again instead of the embedded `sohl-*` icon font.

    Content glyphs that have no Font Awesome equivalent — creatures and animals, and domain / app-specific marks — keep the embedded `sohl-*` font.

- e059d09: **Docs: comprehensive SafeExpression authoring guide (#364)**

    The "Expressions and Scripts" concept doc now documents how to author a
    `SafeExpression` end to end: how it works (parse → static allowlist validation →
    hand-walked evaluation), the exact grammar (what is allowed and what is rejected
    at parse time), the **bindings each call site provides** (action `visible` /
    `trigger`, active-effect `test` for item and strike-mode scopes, context-menu
    `condition`, and actor movement-profile value fields), a full **reference table
    of the built-in helpers with their signatures and return values**, and worked
    examples for both predicates and computed values.

    It also fixes a rendering bug in the `SafeExpression` class documentation: the
    JSDoc `@example` tags were swallowing the prose sections that followed them, so
    everything after the first example rendered as preformatted text on
    api.heroiclands.org. Those examples are now inline fenced code blocks, and the
    class doc links back to the concept guide.

- 8714156: **SafeExpression is now a serializable entity with a shared helper registry**

    `SafeExpression` moved from `src/utils/` to the Foundry-free domain layer at
    `src/entity/expr/`, and its helper library is now a single global registry
    rather than a copy carried by every instance.
    - **`SafeExpression extends SohlEntity`.** It is constructed as
      `new SafeExpression({ source }, { parent })` and serializes through the curated
      `toJSON` path, persisting only its `source` string; the parsed AST is rebuilt
      on reconstruction and never stored. Every construction site now threads the
      owning document/entity logic as the parent.
    - **Global helper registry.** The built-in helpers (`has`, `len`, `matches`,
      `min`, `floor`, `defined`, …) live in the process-wide `expressionHelpers`
      registry and are always available; `SafeExpression` no longer takes a helper
      argument. The registry also accepts helpers installed at runtime, including
      ones compiled from a source body via `textToFunction` — the groundwork for
      world-authored custom helpers.
    - **Module split.** `SafeExpressionError` and the helper registry are separate
      modules from `SafeExpression` to keep the layer import-cycle-free.
    - **World-authored custom helpers.** A new **Expression Helper Library** settings
      menu (GM-only) lets a world import a JSON file mapping helper names to
      `{ args?: string[], body: string }` entries. The bodies are compiled with the
      existing sandboxed `textToFunction` and installed into the registry alongside
      the built-ins; the library persists in a world setting and reloads on world
      start. Invalid entries are skipped and reported rather than blocking the rest.

    No behavior change to the expression language itself; existing predicates
    (action `trigger`/`visible`, Active Effect `test`, context-menu string
    conditions) evaluate exactly as before.

- 68b00fc: **Add a comprehensive set of string helpers to `SafeExpression`**

    `SafeExpression` could compute numbers, booleans, comparisons, string literals, and
    `+` concatenation, but method calls are banned — so string handling beyond `lower`,
    `upper`, `startsWith`, `endsWith`, and `contains` was not expressible. That blocked
    computed **label/description** flavor text for author-supplied result-description
    tables (the `#202` feature line).

    Expand the standard expression-helper library with string operations, exposed as
    allowlisted helpers so the sandbox guarantees hold (no raw method access):
    - **Building/formatting:** `str`, `concat`, `capitalize`, `padStart`, `padEnd`,
      `repeat`
    - **Extracting:** `slice`, `substr`, `charAt`, `split`, `join`
    - **Searching/editing:** `indexOf`, `trim`, `replace` (literal, all occurrences)

    `replace` matches its search text literally (never as a regular expression), and
    `padStart`/`padEnd`/`repeat` refuse to build strings longer than 100,000 characters
    as a memory-exhaustion guard. Existing helpers (`lower`, `upper`, `contains`, `len`,
    `matches`, …) are unchanged.

    Closes #448

- a58cf1b: **Scene-region & environment event triggers — react to where characters are, not just when**

    The event queue now dispatches an **event-driven** family of triggers alongside
    time and combat: Foundry v14 scene-region events, plus scene darkness changes.
    This is the epic #593 bridge — the curated triggers, the GM opt-in surface, and
    the consent-gated offer.
    - **A "SoHL Event Trigger" RegionBehavior** (`trigger`) a GM drops onto a
      region to opt it into SoHL triggering. It forwards a **curated** event set —
      `regionTokenEnter` / `regionTokenExit` / `regionTokenTurn{Start,End}` /
      `regionTokenRound{Start,End}` — into the queue, GM-gated so it dispatches once
      (not once per client). Continuous / view-dependent streams (`tokenMove*`,
      `tokenAnimate*`) are deliberately excluded to keep the queue from flooding.
      Optionally names an **action to offer** the entering token's actor.
    - **`sceneDarknessChange`** — a scene environment trigger fired from
      `SohlHookBridge` on `updateScene` when the darkness level changes.
    - **Consent throughout.** A due region trigger surfaces as an owner-gated
      `[Perform]` reminder — no character is acted on without a click. Both hosts
      work: a region-authored action, and a per-character `sohl.events.subscribe(...)`
      scoped by predicate on `regionId` / `actorUuid`.
    - **Event-driven contract.** These triggers have no `fireAt`, so `nextFireTime`
      is `undefined` by design; the generic run record (`system.lastRun`) answers
      "when did this last happen here?".

    A new consent primitive `sohl.events.offer(uuid, actionName, ctx)` is extracted
    from the queue's existing reminder path and reused by the region bridge.

    Closes #593
    Closes #606
    Closes #607
    Closes #608

- 26dddf8: **Scene-scoped scheduled actions — `sohl.schedule(..., sceneUuid?)`**

    A scheduled action (#588) can be bound to a scene so it fires only where it
    belongs — bandits at a hideout, a hazard on a caravan path — instead of ticking
    world-wide (issue #590).
    - **`sohl.schedule(doc, actionName, interval, payload?, sceneUuid?)`** — the new
      optional `sceneUuid` persists to the `system.scheduledActions` entry (blank =
      world-wide) and is threaded through the arm half. `armScheduledActions` restores
      it on reload.
    - **Gate at offer time.** `SohlEventQueue.fire` skips a due, scene-bound
      subscription while its scene is not the active scene (`fvttActiveSceneUuid`) —
      **without consuming it**, so it stays armed and surfaces when the scene next
      becomes active (a check that came due while away is waiting on return). A
      world-wide schedule (no `sceneUuid`) is unaffected.
    - **Immediate on arrival.** An `updateScene` hook re-scans the queue at the
      current world time when a scene's `active` flag flips true, so a pending check
      for the newly-active scene surfaces the instant the party arrives rather than on
      the next time tick. Re-offer stays idempotent via the existing offered-dedupe.
    - A schedule on an unlinked token's actor is naturally scene-scoped: name its
      token's scene.

    Part of #590.

- 7b005c3: **Persisted schedules can bind to lifecycle triggers, not just world time**

          The generic scheduled-actions store (`system.scheduledActions`) previously
          persisted only **time-based** schedules — every entry fired at `anchor +

    interval`via`updateWorldTime`. It now also persists **event-driven** schedules
  bound to a lifecycle trigger (`turnEnd`, `roundEnd`, `combatStart`, …, and the
    scene-region families from #593), so a check whose cadence is a combat moment has
    a durable home and re-arms across a reload — the same way a timed one does.
    - **New optional `triggerName`** on each `scheduledActions`entry. Blank (the
      default) or`"updateWorldTime"`keeps the original time behavior; any other
      value makes the entry event-driven, armed as a live subscription on that trigger
      with`interval` unused. Backwards compatible — an entry written before this
      change has no trigger and stays time-based, with no migration.
    - **`armScheduledActions`/`scheduleAction`** arm a time entry via `scheduleAt` (as before) and an event entry via`subscribe`; **`sohl.schedule`** and the
      shared **`offerSchedule`** take an optional `triggerName`, and the offer prompt
      reads "…at the end of each turn?" for an event cadence instead of "…in 5 days?".
    - An event entry may also carry an optional **`predicate`** source (a
      `SafeExpression`) to gate its dispatch; the queue binds **`subscriberUuid`** (the
      subscription's own document) so a predicate can compare the trigger to itself —
      e.g. scoping a `turnEnd`schedule to the subscriber's own combat turn.
    - Both families flow through the one owner-gated`[Perform]`reminder path
      (issue #579); time schedules still dedupe by`fireAt`, event schedules still
      offer once per fire.

            Closes #622

- a714f94: **Scheduled-action load-side + world host — `ready` re-arm, `sohl.worldHost`, GM-hidden reminders**

    The load-and-execute half of the generic scheduler (epic #588): persisted
    schedules survive a reload, world-scoped schedules get a home, and the reminders
    they raise can be kept GM-only.
    - **Re-arm on load.** `SohlHookBridge` wires a **`ready`** hook that arms every
      world actor's `system.scheduledActions` — and each actor's embedded items' —
      back into the event queue. Not GM-gated: the queue is a projection of document
      state, so every client re-arms from the documents it can see. New
      `fvttWorldActors()` shim so the wiring crosses the Foundry boundary and stays
      unit-testable.
    - **`sohl.worldHost()`** — find-or-creates the singleton `_sohlworld` actor
      (reserved shortcode, ownership NONE so only the GM sees it; GM-only creation).
      It is the document that world-scoped schedules hang off of, and being an actor it
      already has the execution surface (`onChatCardButton` + an `actions` collection)
      a `[Perform]` reminder needs.
    - **GM-hidden reminders.** A schedule whose payload carries `visibility: "gm"` is
      offered as a GM whisper (`SohlSpeaker` now honors a per-call `rollMode`), so
      world-host events don't leak to players.

    Part of #588.

- 9424a55: **Script Actions run a Foundry Macro instead of compiled code (#156)**

    A Script action's `executor` is now the **UUID of a Foundry `Macro`**, run via
    `Macro#execute`, rather than a JavaScript body compiled by `textToFunction`.
    This removes the last place the system compiled code from document data (the
    SEC-1 executor surface) and gives GM "homebrew" a first-class, permission-gated
    home: `Macro#execute` enforces the `MACRO_SCRIPT` permission and ownership, and
    no code is ever compiled from serialized data. See the
    [Security Model](../docs/concepts/security-model.md).
    - New `fvttExecuteMacro` shim resolves a Macro UUID and runs it with the action
      scope (`{ actor, item, speaker, scope }`). Intrinsic actions are unchanged
      (a bound method-name lookup on the target logic).
    - The action `executor` field is now a `StringField` (a reference), not a
      `JavaScriptField` — no executable source is stored on a document.
    - **Removed `SohlAction.executeSync`** and the now-dead `isAsync` action field:
      a Script action runs a macro and is therefore always asynchronous, so a
      synchronous execution path is impossible and was a trap. A GM who needs a
      synchronous computed value uses a `SafeExpression` field instead.

- 8e47530: **Seedable, Foundry-free PRNG (`sohl.random`) — reproducible randomness**

    Adds a self-contained, seedable pseudo-random number generator to the
    Foundry-free logic layer and routes all direct randomness through it, so a seed
    makes a whole stream of rolls and selections reproducible (combat replay,
    "what just happened" debugging, property/fuzz tests) without depending on
    Foundry's `Roll` / `MersenneTwister`.

    **The generators (issue #599).** A small `Rng` interface — `float()`,
    unbiased `uint32(bound)` / `int(min, max)` / `die(sides)`, plus the
    `seed()` / `getState()` / `setState()` control surface — with two 32-bit
    implementations behind it: `Sfc32Rng` (the default) and `Xoshiro128Rng` (an
    interchangeable alternative). Integer extraction uses **rejection sampling** so
    it is bias-free even on d100-scale hit-location tables. Seeds accept a string
    (hashed via `cyrb128`), a number, or the four state words directly; an all-zero
    state is guarded. The output for a given seed is a **frozen contract**, locked by
    golden-value tests.
    - **Reentrant / injectable.** Every generator holds its entire state in instance
      fields — no module-level or `static` mutable state, no shared scratch buffer —
      so any number of `Rng` streams run interleaved with zero cross-talk. Injection
      is the first-class path; a flow that must not perturb another holds its own
      instance.
    - **`sohl.random` singleton.** One shared, entropy-seeded stream, present from
      system construction (its own ready signal), exposed for macros, the app, and
      e2e. It is the default-injected source but is **never** hardcoded into
      consumers — `SimpleRoll` and hit-location take an optional `Rng` and fall back
      to it only when none is passed.
    - **Guardrail.** Production seeds from `crypto.getRandomValues` and never accepts
      a fixed seed through a play path — fixed seeds are strictly a test/e2e
      affordance (predictable dice ruin play, and a shared deterministic stream
      desyncs across clients anyway).

    **Routing the non-dice sources through it (issue #601).** `weightedRandom`, the
    `BodyStructure` hit-location spread, `BodyPart`/`BodyStructure` location
    selection, and the `rand()` expression helper now all draw from an injectable
    `Rng` (defaulting to `sohl.random`) instead of `Math.random`. No behavior change
    in normal play — the continuous draws stay statistically identical — but a seed
    now forces a hit location deterministically end to end.

    `SimpleRoll.forceValues(...)` (the #598 forced-value queue) is unchanged and
    still takes precedence over the `Rng`: forced values give targeted determinism
    for a single roll; a seed gives reproducibility of the whole stream.

    **Tests.** Unit specs cover reproducibility, independence, boundary correctness
    (`die`/`int` endpoints, never 0 / `sides+1`), d100 bias (chi-square),
    state snapshot/replay, the zero-state guard, reentrant interleaving, and frozen
    golden streams; `SimpleRoll` and `BodyStructure` gain seeded-determinism specs.
    A new e2e (`seedable-random.cy.js`) re-seeds `window.sohl.random` and drives a
    real skill success test and the `rand()` helper reproducibly.

    Closes #599
    Closes #601

    Refs #598.

- b5cf785: **Add a "Song of Heroic Lands" links section to the Game Settings sidebar.**

    The settings sidebar tab now shows a persistent **Song of Heroic Lands** section
    with three links — **Main Site**, **Knowledgebase**, and **API Documentation** —
    that open the project's web presence in a new browser tab. The section reuses
    Foundry's native settings-sidebar markup, so it reads as a natural part of the
    tab rather than a bolted-on widget. Closes #904.

- 1182073: **Being sheet UX polish: field hints, held items, status pills, dossier**
    - Field guidance no longer competes with values: the always-on schema hint on
      item and actor sheets becomes a small circled **?** at the end of the label,
      with the hint moved into its tooltip.
    - The Combat tab's Held Items dropdowns are widened to 150px and no longer clip
      item names.
    - The header status pills are reorganized — top row ASHK / SLP / PRN / FTG,
      bottom row STN / INC / UNC / KIA (DED renamed KIA) — with a **?** legend icon to
      their left whose tooltip explains each abbreviation. The pill abbreviations and
      labels are now localization keys rather than hardcoded strings.
    - The Profile tab's _Dossier_ label reads as a section heading (heading
      weight/size with space above) instead of an inline field label.

    Closes #669
    Closes #670
    Closes #671
    Closes #672

- c805aa2: **Shock Re-Test, Extended Shock, and Coma**

    Ordinary shock can now be shaken off — or deepen into the lasting conditions of
    Extended Shock and Coma, each with its own recovery.
    - **Shock Re-Test** — `BeingLogic.shockReTest` resolves a re-test for an
      Incapacitated or Unconscious being: a headless **Shock** skill test at −20
      (fatigue penalty applies) that recovers from all shock (CS), improves to
      Stunned (MS), or drops the victim into **Extended Shock** (a `shock`-subtype
      trauma at Healing Rate 4/5) — or a **Coma** (a `coma`-subtype trauma) for an
      Unconscious victim on a critical failure.
    - **Extended Shock / Coma course tests** — the two lasting-shock traumas recover
      through a recurring `courseCheck` (a `Healing Base × Healing Rate` test with
      the fatigue penalty; Extended Shock every 4 hours, Coma every d10 days). The
      Healing Rate shifts by the result (CF −2 / MF −1 / MS +1 / CS +2); at Healing
      Rate 0 the victim dies, and at 6 they recover — a recovering Coma additionally
      inflicts weariness fatigue equal to the days spent in it.
    - New Foundry-free helpers in the shock module (`shockReTestOutcome`,
      `shockCourseHrDelta`, `comaHealingRate`, `SHOCK_RETEST_MODIFIER`) and a new
      `course` recurring-phase field triplet on the Trauma data model.

    The Shock Re-Test is currently invoked on demand; its automatic scheduling
    (end of the next turn / ten minutes later) is deferred to a follow-up.

    Closes #556
    Part of #548

- 7b005c3: **Shock Re-Test is offered on its cadence when a being enters shock**

    `BeingLogic.shockReTest` (#556) could only be run on demand. A being that enters
    ordinary shock is now **offered** (never auto-armed) a Re-Test reminder on the
    state's cadence, per the consent model — the being-level timing half of #556.
    - **Incapacitated** → an event-driven `turnEnd` schedule (#622), gated by a
      predicate (`combatant.actor.uuid === subscriberUuid`) to the victim's **own**
      combat turn: a `[Perform]` Re-Test card is offered at the end of each of the
      being's turns, not on every combatant's.
    - **Unconscious** → a time schedule ten minutes out.

    Entering shock (via an injury Shock Test) routes through the shared
    `offerSchedule`, so nothing schedules or runs without a human; when due, the event
    queue posts an owner-gated `[Perform]` card to the being's controller, and the
    Re-Test runs only on their click. Performing a Re-Test — or recovering, or falling
    into a lasting Extended Shock / Coma (whose recovery is a Course Test) — clears the
    ordinary reminder rather than auto-re-arming. `BeingLogic.finalize` now re-arms a
    being's persisted schedules on load.

    Closes #569

- 67aa257: **Shortcode input in the sheet header**

    Both Actor and Item sheets now show the `shortcode` field directly under the Name
    in the header — an unlabeled input with a `shortcode` placeholder, edited inline
    (submit-on-change). For items this replaces the shortcode field that previously
    lived in the Properties tab, so `(type, shortcode)` — the document key — is
    visible and editable next to the name on every sheet.

    Closes #351

- 0504085: **Shortcode integrity: `(type, shortcode)` uniqueness across four scopes + `shortcodeDedupe`** (#766)

    `shortcode` is the system's lookup key (with `type`). Its uniqueness is now enforced end-to-end.
    - **Uniqueness on create _and_ update**, across four scopes: all world items, each actor's embedded items, all world actors, and each compendium pack. A shared runtime guard (`enforceShortcodeOnCreate` / `enforceShortcodeOnUpdate`) resolves the scope and applies the key; the previously-missing update path (renaming a shortcode into a collision) is now caught, and compendium-pack creates are no longer skipped.
    - **`shortcodeDedupe` create/update option.** A caller opts into automatic key management with `shortcodeDedupe: true`: a colliding shortcode is suffixed (`arrow` → `arrow2`) until unique, and a create with neither a shortcode nor a usable name gets a random 16-char id — so it never fails. Without it, a collision (or a name-less create) is rejected with a warning. System-generated item creation (`fvttCreateEmbeddedItems`, cross-actor gear drops) opts in; the human create path stays strict.
    - **Create dialog** live-checks the entered shortcode and disables **Create** until it is unique (the runtime reject is the backstop).
    - **Build-time `lint:packs`** fails the build on any duplicate `(type, shortcode)` within a compendium pack — the authoritative guard for authored pack content, which is seeded via the CLI and bypasses `_preCreate`.
    - The pure decision logic lives in a reworked `resolveShortcodeKey` (fully unit-tested via an injected id generator), and the misleading base-schema comment (which claimed non-existent subtype overrides) is corrected.

- ef16bb4: **Deterministic dice for tests: a forced-value queue built into SimpleRoll**

    Add a process-wide **forced-value queue** to `SimpleRoll` (the single dice
    chokepoint) so tests can drive an RNG-gated outcome that lives deep in the logic
    layer — a success test's d100, an affliction's critical-failure→infection, the
    combat exchange — without reaching the roll instance.
    - **`SimpleRoll.forceValues(...values)`** seeds die values that `roll()` consumes
      one per die (FIFO) instead of `Math.random`; **`SimpleRoll.clearForced()`**
      empties the queue and **`SimpleRoll.forcedRemaining`** inspects it. When the
      queue is empty, rolls are random as before.
    - **Forces the die _values_, not a total**, so `total`, `result` (`"[3, 5] +2"`),
      `formula`, and the Foundry-`Roll` display all derive correctly. Because almost
      every SoHL roll is a single die, this is effectively "one value per roll."
    - Complements the existing per-instance `setRolls` / `SuccessTestResult` presets;
      a pre-seeded roll never touches the queue. Reachable from `sohl`
      (`sohl.entity.roll.SimpleRoll`) so an e2e can seed it in the game realm.
    - **Hygiene:** a leftover forced value leaks into the next roll, so tests clear it
      in an `afterEach` (documented in the testing guide).

    An e2e (`deterministic-dice.cy.js`) proves it end to end: forcing a real skill
    success test's d100 to 5 succeeds and to 100 fails against ML 50. Follow-ups
    tracked separately: a seedable Foundry-free PRNG (#599), and routing the non-dice
    randomness (`weightedRandom`, the `rand()` helper, `BodyStructure` spread) through
    the same seam.

    Closes #598.

- 52c827c: **Skill: adopt a parent skill's mastery level**

    Add an `adoptParentMasteryLevel` option to specialization skills. When a skill
    declares a `parentSkillCode` and this flag is set, the skill adopts its parent
    skill's mastery-level base as its own during `evaluate()` — taken from the
    parent's static `masteryLevelBase` (so it is independent of cross-item
    evaluation order) — before this skill's own boosts and `maxTarget` clamp apply
    on top. Default `false`, leaving mastery-level derivation unchanged. The control
    renders on the Skill properties tab only when a parent skill is set.

    Closes #719

- 78e87dc: **Skill base is a computed value; birthsigns are mysteries**

    The skill base is now a plain number produced by a Foundry-free
    `calcSkillBase(skillBaseFormula, actorLogic)` function, replacing the
    `SkillBase` entity object. `SkillLogic.skillBase` is now a `number`.
    - **Birthsigns are Mystery items of subtype `buff`.** Birthsign bonuses in a
      skill-base formula are matched by the mystery's shortcode, instead of the
      earlier hyphen-split `textValue` match. A `subType` field was added to the Mystery
      data model — `buff` marks a birthsign — completing the field the mystery
      sheet already read. The field has a default, so no world migration is needed.
    - **Formula evaluation follows the documented rules.** `@code` (optionally
      `@code:multiplier`) averages the actor's attribute scores by shortcode; the
      two-attribute up/down rounding rule, the single largest matching birthsign
      bonus, flat numeric modifiers, and the clamp to ≥ 0 all apply. This also
      fixes latent parser bugs in the old `SkillBase` (mis-detected birthsign
      terms and double-counted numeric modifiers).
    - `SkillLogic.valid` and the Aura-based _no-fate_ rule now derive from the
      formula's attribute references, so they no longer depend on a `SkillBase`
      instance.
    - The `SkillBase` entity class (`src/entity/skillbase/SkillBase.ts`) and its
      direct unit test are removed; `calcSkillBase` is covered by a new
      value-focused test that adds the previously-missing birthsign-bonus cases.

- ae47c3f: **Expose constructable entity classes via `sohl.entity`**

          Adds a flat, getter-backed `sohl.entity.<ClassName>` registry so macros and
          extension modules have a named entry point to `new` or subclass SoHL's
          constructable entity classes — modifiers (`ValueModifier`, `ValueDelta`,
          `CombatModifier`, `ImpactModifier`, `MasteryLevelModifier`), results
          (`TestResult`, `SuccessTestResult`, `OpposedTestResult`, `ImpactResult`,
          `AttackResult`, `DefendResult`, `CombatResult`), strike modes (`StrikeModeBase`,
          `MeleeStrikeMode`, `MissileStrikeMode`), `SohlAction`, and body modeling
          (`BodyStructure`, `BodyPart`, `BodyLocation`).

          Each entry is a getter over a backing record, so a future `sohl.entity.register()`
          override (planned) is picked up automatically at every access — `new

    sohl.entity.ValueModifier(...)`and`class X extends sohl.entity.SuccessTestResult
    {}` both work today.

          Also repairs the stale `types/sohl-public-api.d.ts` (its re-exports pointed at the
          deleted `src/common/*` tree and it documented a non-existent `sohl.classes`) and
          adds a macro/module **API Access Map** how-to.

          Part of #80. Closes #81.

- 56fb667: **Overloaded `SohlEntity` constructor: `new X(parent)` shorthand**

          `SohlEntity` and the entity subclasses that construct usefully from an empty data
          bag now accept a `(parent)` shorthand alongside the existing `(data, options)`
          form — mirroring the `clone(parent)` shorthand:

          ```ts
          new ValueModifier(logic); // was: new ValueModifier({}, { parent: logic })
          ```

          The base gains two `protected static` normalizers (`SohlEntity.dataOf` /
          `SohlEntity.optionsOf`) and a `SohlEntity.DataOrParent<D>` type alias. The
          overload is resolved by the `isA(x, "SohlLogic")` **brand** check (not
          duck-typing), so a data bag that merely carries a `parent` key is never mistaken
          for a Logic. The runtime throw and its exact message (`SohlEntity requires a

    parent`) are unchanged.

          Adopted by `ValueModifier`, `MasteryLevelModifier`, `CombatModifier`,
          `ImpactModifier`, `SimpleRoll`, `TestResult`, and `SuccessTestResult`. Classes
          that require non-empty data (the body classes, strike modes, and the non-empty
          results) keep their single `(data, options)` constructor. Also fixes a latent
          throw in `AttackResult` where `new ImpactModifier()` was called with no
          arguments — the zero-argument form no longer compiles.

          **Compatibility note.** A downstream module subclass that declares a bare
          two-required-parameter `constructor(data, options)` will no longer satisfy
          `typeof ValueModifier` for `sohl.entity.register` — an overloaded target requires
          the source to satisfy every overload. Subclasses that declare _no_ constructor
          (the common case) inherit the overloads and are unaffected. Runtime behavior is
          unchanged either way.

          Closes #369

- 8752b12: **Rename the `shamanicrite` Mystical Ability subtype to `spiritrite`**

    The spirit-realm rite subtype is renamed from **Shamanic Rite** (`shamanicrite`)
    to **Spirit Rite** (`spiritrite`). The rite is not the exclusive province of
    shamans — it is available to anyone attuned to the spirit realm — so the broader
    name better reflects who may perform it.
    - The `MYSTICALABILITY_SUBTYPE` value changes from `"shamanicrite"` to
      `"spiritrite"`, and its enum key from `SHAMANICRITE` to `SPIRITRITE`.
    - The English labels (`SOHL.MysticalAbility.SubType.spiritrite` /
      `SOHL.MysticalAbility.Category.spiritrite`) now read **Spirit Rite**.
    - Mechanics are unchanged: like `spiritaction`, a Spirit Rite is still governed
      by an associated **Spirit Power** rather than a skill.

    Pre-beta with no existing worlds, so no data migration is required.

- 78e87dc: **Strike-mode availability gated by held limbs and pull**

    A being's available weapon strike modes now depend on how the weapon is
    physically held and, for missiles, on the being's pull — an inline model on
    `BeingLogic.availableStrikeModes` that replaces the former
    `computeAvailableStrikeModes` helper.
    - A weapon's strike mode is available only when the weapon is held in at least
      the mode's `minParts` body parts. Gear reports its holders through the new
      `GearLogic.heldBy` (the `BodyPart`s currently gripping the item). Combat
      technique strike modes are intrinsic and always available.
    - A new Being **`pull`** score (a `ValueModifier`) gates missile modes: a missile
      mode is available only when its `draw` is at most the being's pull.
    - The result reads already-prepared strike-mode data, so it must be evaluated
      after item preparation — see the actor-first data-preparation change.

- 28ec8ec: **Strike Modes tab + editor on Weapongear and CombatTechnique sheets (#663)**

    Add a **Strike Modes** tab to the Weapongear and CombatTechnique item sheets so a
    strike mode can be created, edited, and removed from the sheet instead of only
    through raw data or seeded defaults.
    - The tab lists **one row per strike mode** (name, type, reach/range, aspect),
      with a **⋮** menu offering **Edit** and **Delete** (plain menu items, not
      SohlActions).
    - **Add Strike Mode** appends a blank strike mode to the item and opens the new
      **Strike Mode editor** on it.
    - The **Strike Mode editor** (`StrikeModeConfig`) is a small Application that
      edits an embedded strike mode's fields and handles the melee/missile
      discriminated union via a type selector, persisting through the item's
      `update()`.

    CombatTechnique keeps its single `system.strikeMode` (no data-model change or
    migration): its tab shows the one strike mode as a single row and offers **Add**
    only when it currently has none. Weapongear continues to store many strike modes
    at `system.strikeModes.<id>`. The combat technique's strike mode is no longer
    edited inline on the Properties tab — it moves to the shared Strike Modes tab and
    editor.

- 6b31fad: **Active Effects: strike-mode scopes replace the `sm:` key mechanism**

    Active Effects can now target strike modes directly with two new `scope`
    values, `meleestrikemode` and `missilestrikemode`. When an effect uses one, the
    `test` predicate is run against every strike mode of that type across the
    actor's items — bound `itemLogic` (the owning item's logic) and `sm` (the strike
    mode) — and each matching strike mode receives the change. This lets an effect
    raise, say, attack rolls (`mod:attack`) without touching the underlying `melee`
    skill, optionally narrowed to specific items or strike modes via the predicate.
    - **Predicates now bind logic, not documents.** Item-kind-scoped predicates bind
      `itemLogic` (was the `item` document); strike-mode-scoped predicates bind
      `itemLogic` + `sm`.
    - **New effect-key sets** `MELEESTRIKEMODE_EFFECT_KEY` (attack, impact, reach,
      block, counterstrike) and `MISSILESTRIKEMODE_EFFECT_KEY` (attack, impact,
      spread, base range, draw); the change-key dropdown is populated for the
      strike-mode scopes.
    - **Removed** the per-change `strikeModePredicate` field and the `sm:` /
      `mod:sm:` key-prefix routing (superseded by scope + `test`), along with the old
      `WeaponGear.EffectKey.SM_*` keys and the `isSmKey` helper.

    No migration is provided (no released worlds depend on the old mechanism).

- c768ef9: **Strike-mode required-limb impairment gates the roll (#628)**

    Complete the Injury rules' _Indefinite Impairment_ consequences for weapon strike
    modes — the per-part counterpart to the role-based skill/attribute gating shipped
    in #568. A strike mode names the limbs it needs by count (`minParts`), not by
    role, so it carries no `impairedByRoles`; instead the gating now resolves the
    _specific_ body part(s) holding the weapon and scores each through the being's
    body-part impairment:
    - A strike-mode attack/defense test whose **required (held) limb is unusable** — a
      grievous injury or a permanent-unusable flag — resolves as an automatic Critical
      Failure, reusing the existing `SuccessTestResult.autoCriticalFail` flag.
    - The same limb, when **impaired but still usable**, imposes its **−5** (minor) /
      **−10** (serious) penalty on the mode's attack/defense mastery level. When a test
      is gated on both a role and a held limb, the worst (most negative) of the two
      applies — never their sum.

    Plumbing only, no new outcome logic:
    - Foundry-free `requiredPartsAutoCriticallyFail` / `requiredPartsImpairmentPenalty`
      — the per-part twins of `testAutoCriticallyFails` / `testImpairmentPenalty`.
    - `BeingLogic.bodyPartImpairments(parts)` — the per-part impairment view (as
      opposed to the role-aggregated `unusableRoles` / `impairedRolePenalties`).
    - `GearLogic.heldLimbImpairments` — the impairment of the limb(s) currently
      holding the item, resolved from `heldBy`.
    - `MasteryLevelModifier.successTest` folds the held-limb result into the same
      auto-CF / penalty seam as #568. A strict no-op for a parent that holds nothing
      (a skill, attribute, or unheld item).

    Natural-weapon (combat-technique) strike modes continue to gate through their
    skill's `impairedByRoles` (#568); a per-part link from a natural weapon to its
    body part does not exist yet and remains a follow-up.

- 7aeb376: **Success tests roll the die, and can run headlessly**

    Fixes two latent defects in the success-test path and completes the `skipDialog`
    bypass, so timed and automated effects can resolve a test with no user present.
    - **`SuccessTestResult.evaluate()` now rolls the d100.** Previously it resolved
      against the constructor's default die — a hardcoded `[99]` — so any success test
      that did not pre-seed a roll (skill tests, disease contraction, and every
      planned timed effect) silently always rolled 99 (a marginal failure). The die is
      now cast during `evaluate()` **unless the caller supplied one** (`data.roll`) —
      fate replaying a prior roll, or the attacker's die reconstructed on the
      defender's client, are resolved untouched. The default die is now unrolled, and
      the "was a die supplied?" decision is recorded from caller intent, not inferred
      from the die's state. The combat pipeline (`AttackResult` / `DefendResult`), which
      already seeds its roll via `buildAttackResult`, is unchanged.
    - **`MasteryLevelModifier.successTest` honors `skipDialog`.** The flag was a no-op
      (the dialog always opened). It now bypasses the dialog and takes the situational
      modifier from `context.scope.situationalModifier`, attributes the result to the
      acting `context.speaker` (so `evaluate()`'s owner check passes — a GM-fired event
      owns every actor), and respects `context.noChat` to suppress the result card
      (useful when a timed handler catches up many elapsed checkpoints at once).

    Together these let a GM-fired timed handler resolve a test with
    `mlMod.successTest(new SohlActionContext({ speaker, skipDialog: true, noChat, scope }))`
    — the foundation the trauma / shock / affliction timed effects build on.

    Part of #548. Closes #551

- 9679cf7: **Node template-render test harness + shared pure Handlebars helpers**

    Make SoHL's card and dialog templates renderable in Node so the card/dialog-building
    actions can be unit-tested by asserting the emitted HTML — no running Foundry.
    - **Extract SoHL's pure Handlebars helpers** (`selectArray`, `endswith`,
      `optionalString`, `setHas`, `contains`, `toJSON`, `toLowerCase`, `arrayToString`,
      `injurySeverity`, `array`) out of system init into a Foundry-free module,
      `registerPureHandlebarsHelpers(H)`, registered through an injected Handlebars
      instance. System init and the test harness register the **same** code, so
      template rendering never drifts. Behavior-preserving; the Foundry-coupled helpers
      (`getProperty`, `textInput`, `clearableNumberInput`, `datePicker`,
      `displayWorldTime`) stay in system init.
    - **Render harness** (`tests/mocks/hbs-helpers.ts`): `renderTemplateReal(path, data)`
      reads a `.hbs` off disk and renders it with the shared pure helpers, Foundry's
      logic helpers (copied verbatim), faithful option-list builders (`selectOptions` /
      `selectArray`), and param-placeholder stubs for the Foundry DOM/form builders
      (`formGroup` + `formField`, `formInput`, `numberInput`, `editor`, `filePicker`,
      `radioBoxes`, `rangePicker`) and impure SoHL helpers. `localize` reads the real
      `lang/en.json`.
    - Fidelity: **cards** and **dialogs** render fully (option lists are real); **sheet**
      form builders render as binding placeholders (name/value/disabled) — the right
      level for a unit test.
    - Tests: card/dialog render assertions for the treatment, shock, attack-result cards
      and the injury / treat-injury dialogs; the attack-card action test renders the real
      card through the harness.

    Closes #582

- d6219e2: **Add temporal field and scheduling helpers**

          Shared building blocks for timed item processes (injury healing / blood-loss,
          affliction phases):
          - **Scheduling** (`@src/entity/event/scheduling`, Foundry-free): `deriveNext(anchor,

    interval)`— the single definition of the next occurrence time (from the
    persisted anchor, never the clock); and`elapsedCheckpoints(lastAnchor,
    worldTime, interval)` — the ordered catch-up set for a time advance, guarded
    against non-advancing loops on a non-positive interval.
    - **Schema factory** (`temporal-fields`): `phaseFields(name)`stamps a one-shot
      phase's`{ …DurationFormula, …DurationBase, …Date }`nullable field triplet (the
      `…Date`is the crystallized actual,`null`until the phase fires), and
      `durationFields(name)`stamps a recurring process's`{ …DurationFormula,
…DurationBase }`interval pair — the recurrence anchor is not a bespoke field but
      lives in the generic`system.scheduledActions`store (#588). Both use consistent
      nullability, plus`worldTimeDateField`/`durationBaseField`/
      `durationFormulaField` for standalone use.

            Closes #481.

- 2ede925: **The Pall (#561)**

    Implement the Pall — the forces of death that assail **Spirit**.
    - **Resist the Pall** — a self-sufficient Being action rolling a Spirit test with a
      **Pall Depth penalty of 5 × total PAL**, mapping the result to a Pall state
      (Immune / Resist / Disturbed, and the CF0/CF5 split of Catatonic vs Terrified). A
      failure accrues Pall Stress Levels (+1 / +2 / +3) on the being's `pall`-subtype
      Pall Cloud trauma; a success grants temporary immunity.
    - **Pall recovery** — a recurring Will test (every d6 days) on the Pall Cloud:
      `MS`/`CS` recover −1/−2 PSL (the Pall is expelled at 0); `MF` knocks the victim
      **Unconscious**; `CF` forces the victim to **Face the Pall** — the three fates
      (Embrace / Vacate / Accept True Death) are **offered** as a choice card, never
      imposed (the choice is always the victim's). Offered, not auto-armed (#579).
    - **Pall Strength & Cloud math** — a Foundry-free `pall` module: `pallStrengthAt`
      (falloff of 1 per 5 ft plus daylight/twilight reductions), `pallDepthPenalty`,
      `pallResistState`, `pallStressGain`, `pallCloudPenalties` (PSL × 5 to vision
      Perception/Agility, PSL × 10 to Dodge/Move/Stealth), and `pallRecoveryOutcome`.

    The application of the Pall Cloud test penalties and the permanent-psyche-condition
    permanence conversion are follow-ups (the former joins the test-resolution work).

    Part of #548. Closes #561.

- e0b0a65: **Body structure: a Zone tier, stored as three flat arrays** (#780)

    `system.body.structure` now holds three sibling arrays — `zones`, `parts`, and
    `locations` — where each child names its parent by shortcode (`bodyZoneCode` /
    `bodyPartCode`). `BodyStructure` assembles them into the Zone → Part → Location
    hierarchy on every prepare. Body parts no longer nest their locations, and the
    `adjacent` part-graph is gone.

    **Body zones.** A zone is the broadest anatomical division (Head / Arms / Torso /
    Legs for a humanoid) and the first stage of hit determination. Each zone claims a
    contiguous run of _zone numbers_ sized by its `probWeight`, allocated in
    persisted order — a body weighing 1 / 4 / 4 / 6 covers 1, 2–5, 6–9, 10–15. An
    unaimed strike rolls once against the total to pick the zone, then draws a
    weighted part inside it and a weighted location inside that. Zones are
    first-class on the Combat tab: the Body Locations tree renders Zone → Part →
    Location again, with add / edit / delete / drag-sort at every tier and a new
    `BodyZoneConfig` editor.

    **One weighting rule at every tier.** All three tiers now spell their weight
    `probWeight`, and each is drawn with probability
    `probWeight / (sum of its siblings' probWeight)` — so an unaimed hit location's
    odds are the product of its zone's, its part's, and its own share. The body
    part's weight field was previously called `combatArea`; that name is gone. A zone
    carrying weight but holding no parts is excluded from the roll rather than
    falling through to a body-wide draw, which would have leaked its share and skewed
    every other zone's true frequency.

    **Aimed-strike drift no longer needs a hand-authored graph.** A scattering blow
    drifts to the target part's zone siblings first, then widens outward one zone at
    a time. Creature authors no longer maintain pairwise adjacency: the 240 shipped
    creature and character bodies drop it, and the zone weights preserve the previous
    unaimed hit distribution.

    **Update helpers are symmetric and cascade.** Every tier has
    `add*Update` / `remove*Update` / `move*Update` / `set*FieldsUpdate`, each a
    complete-array write (#247). Deleting a zone removes its parts and their
    locations; deleting a part removes its locations. Renaming a zone or part
    re-points its children via `repointPartsUpdate` / `repointLocationsUpdate`.
    `movePartUpdate` and `moveLocationUpdate` now take a destination parent shortcode
    and a position within it, so a part can be re-parented between zones and a
    location between parts.

    _Breaking:_ `BodyStructure.adjacent`, `getAdjacentParts`, `hasEdge`,
    `addEdgeUpdate`, and `removeEdgeUpdate` are removed — use
    `getNeighborParts` and the zone tree. `BodyPart.Data.locations` and
    `BodyPart.Options.structure` are replaced by `bodyZoneCode` / `zone`; a part's
    locations are supplied by the structure. `BodyPart.Data.combatArea` is renamed
    `probWeight`. Hit-location shortcodes must now be unique body-wide rather than
    only within their part.

- e93c4e2: **Timed effects offer to reschedule instead of auto-re-arming, on the generic store**

    Recurring trauma and affliction effects no longer silently re-arm their next
    occurrence — completing the consent model for timed effects (issue #579, building
    on #587's remind-don't-perform) — and their schedules move off bespoke schema
    fields onto the generic `system.scheduledActions` store (the migration named as a
    follow-up of #588).
    - **Offer, don't auto-re-arm.** After a recurring check is performed
      (`healingCheck` / `bloodLossAdvanceCheck` / `courseCheck` on Trauma, `healingCheck`
      on Affliction), the executor **offers** the next occurrence — via
      `context.scope.schedule` when scripted, otherwise a private yes/no dialog
      defaulting to **No** — through the shared `offerSchedule` helper. Accept
      schedules the next; decline clears it (the loop stops and does not resurrect on
      reload). A terminal outcome (a wound healed to 0, a course death/recovery, a
      defeated affliction) ends the recurrence outright. Affliction phase transitions
      (`onsetCheck` → `resolutionCheck`) still advance automatically — the disease
      progresses as the direct consequence of the human-performed step; only their
      _firing_ is consent-gated.
    - **Migrated onto `system.scheduledActions`.** The recurrence anchor now lives in
      the generic store entry (`anchor + interval`), so the bespoke `lastHealingCheckDate`
      / `lastBloodLossAdvanceDate` / `lastCourseDate` fields are removed
      (`recurringPhaseFields` → a new `durationFields` interval pair). Creation and
      becoming-a-bleeder still auto-arm the _first_ occurrence (via `sohl.schedule`).
    - **Generic re-arm in `finalize()`.** Each effect's `finalize()` now re-arms
      whatever `system.scheduledActions` holds (`armScheduledActions`) rather than
      hard-coding per-effect branches — so a reschedule written on one client
      replicates and re-arms every client's queue, the active GM's included.
    - **Generic run record — `system.lastRun`.** A single keyed map (`actionName` →
      world-time) on the base data model, the past-tense mirror of `scheduledActions`,
      stamped automatically at the action chokepoint (`SohlAction.execute`) for actions
      whose definition sets `recordsLastRun`. So "when was my last healing test?" is
      answerable — `injury.system.lastRun.healingCheck` — for **any** action with no
      bespoke field, and it survives after a declined or resolved effect (where the
      next occurrence, `sohl.events.nextFireTime(uuid, actionName)`, is gone). For an
      event-driven trigger whose next fire is undeterminable, this run record is the
      only meaningful temporal fact.
    - **New SafeExpression helpers `curWorldTime()` / `curCombatTime()`.** Event-queue
      subscription **predicates** can now gate on live world or combat time from any
      trigger (`curWorldTime() > T`; `defined(curCombatTime()) && curCombatTime().round > 3`),
      reading through Foundry-free shims — the flexible escape hatch alongside the
      concrete, introspectable `fireAt`.

    Refs #579, #588.

- 03b666c: **Timed effects remind, they no longer auto-perform**

    When a scheduled effect comes due, the event queue now posts an owner-gated
    **[Perform] reminder card** instead of running the effect on its own — the core
    of the consent model (issue #579). Nothing mutates a character until that
    character's controller clicks [Perform]; the click runs the _same_ action the
    queue used to run automatically, on the effect's document.
    - `SohlEventQueue.dispatchOne` posts `templates/chat/reminder-card.hbs` (a
      `[Perform]` action-card button addressed to the effect's **document** via
      `data-handler-uuid` — an item, actor, or any document — carrying the trigger
      context + payload as its scope) rather than calling `executeAction`.
    - De-duplicated by `(uuid, actionName, fireAt)` so a due occurrence is offered
      once, not on every world-time advance while it sits unperformed.
    - Renamed `SohlSubscription.kind` → `actionName` (a runtime-only field): the
      queue is a _deferred action runner_ — it stores which action to run on which
      document, and `actionName` names that action.
    - The seven timed effects (#486, #487, #488, #489, #490, #556, #557) all flow
      through this — none of them can apply to a character without a click.

    Part of #579. Follow-ups: make the effect _offer to reschedule_ the next
    occurrence (dialog/scope, per the self-sufficient action contract) instead of
    auto-re-arming, and offer the first schedule at creation.

- c56fc61: **Driven-tour primitives and deterministic RNG for `SohlTour` (#624)**

    Extend the guided-tour framework so an opinionated, _railroaded_ tour (the
    Automated Combat tour) can drive the app down a fixed path with reproducible
    dice, without regressing the coach-and-wait tours.
    - **Drive steps.** A step may declare a `drive` array of actions that are
      _performed_ (not waited on) before the step is shown, each awaited in order so
      the next step's targets exist: `import-adventure`, `activate-scene`,
      `start-combat` (with optional `roll-initiative`), `advance-turn`, and
      `set-target` / `clear-target`. The sequencing/await logic is the Foundry-free
      `runDrive`; `SohlTour` supplies the Foundry-coupled executor.
    - **Seeded RNG.** Setting `SohlTourConfig.seedRng` seeds `sohl.random` at tour
      start for reproducible scripted rolls and **guarantees restore on every exit
      path** — completion, abort, Escape, navigation (a `pagehide` safety net), and a
      mid-step error — via a fire-once `RngLease` registered at seed time. Restore
      rewinds the shared stream to its exact pre-tour position, so the user's real
      game is never left returning identical dice.

    Coach-and-wait behaviour is unchanged; a step with no `drive`/`seedRng` behaves
    exactly as before.

- d229b63: **Guided-tour framework (`SohlTour`)**

    Add the reusable in-app guided-tour framework that the SoHL Guided Tours epic
    builds on. A stock Foundry tour can only highlight what's already on screen and
    advance on **Next**; `SohlTour` (a subclass of Foundry's NUE `Tour`) adds the
    machinery every substantive SoHL tour needs, extracted once:
    - **Three step kinds** — a **free** step (advances on Next), a **value-gate** step
      (**Next** stays disabled until a target control holds a value), and an
      **action/state-gate** step (**Next** stays disabled until a predicate over
      document/DOM state passes). The disable-Next _decision_ is the Foundry-free
      {@link sohl.entity.tour} gate model — `TourGate`, `gateValue` predicate helpers,
      and `isNextEnabled` — written test-first and unit-tested without a running
      Foundry.
    - **Scene-setting navigation** — a step can open an Actor/Item sheet and switch to
      a named tab, awaiting each render, so a selector on a not-yet-open tab resolves
      after navigation. Only navigation is automated; the user's meaningful choices are
      never made for them (PRIME DIRECTIVE — a tour coaches and waits).
    - **Re-render survival** — when the watched sheet re-renders, the highlight
      re-anchors to the fresh target element.
    - **Registration + a worked example** — `registerSystemTours` wires tours into
      **Tour Management**; a small self-contained demo tour exercises all three step
      kinds against a Being sheet and doubles as the authoring reference. New
      `SOHL.Tour.*` localization keys and a
      [Writing Guided Tours](../docs/how-to/guided-tours.md) authoring guide are added.

    Closes #613

- d4761fe: **Model descriptive personality & physique traits as Trauma conditions**

    Descriptive traits are conditions a being exhibits, not measured values, so they
    now live under the Trauma document instead of the Trait document — the first step
    toward retiring the Trait item entirely (only the measured physical-stat traits
    remain).
    - **New Trauma subtype** `PHYSICAL_CONDITION` (`physcond`), alongside the existing
      `PSYCHOLOGICAL_CONDITION` (`psycond`), each with its own category enum:
      `TRAUMA_PSYCOND_CATEGORY` (_Quirk_ / _Impulse_ / _Disorder_) and
      `TRAUMA_PHYSCOND_CATEGORY` (_Trait_ / _Impediment_ / _Debility_), with matching
      localization.
    - **Nullable injury-only fields.** A Trauma's `levelBase`, `aspect`,
      `bodyLocationCode`, and `category` are now nullable (`initial: null`) so a
      descriptive condition can omit them; injuries are unaffected. The content
      compiler emits `null` for the omitted fields and now carries `category` through
      to the item.
    - **Content migration.** The personality and physique trait content moves to
      `assets/content/Trauma/psycond` and `assets/content/Trauma/physcond` as
      `trauma` items — the old `intensity` becomes a `category` (personality
      `benign→quirk`; physique `benign→trait`, `impulse→impediment`,
      `disorder→debility`), and the descriptive `isNumeric`/`textValue`/`valueDesc`/
      `score` fields are dropped. The measured physical stats (Body Weight, Carrying
      Capacity, Favored Parts, Move, Size) stay Traits.

    Closes #648

- 7b31b65: **Add SHOCK and COMA trauma subtypes**

    Adds two long-duration condition subtypes to `TRAUMA_SUBTYPE`: **Shock** (a
    prolonged physiological state of shock lasting hours or days, following severe
    trauma or blood loss — distinct from the transient combat-shock states) and
    **Coma** (a prolonged state of unconsciousness). Both are available as Trauma
    subtypes in the item sheet, with localization labels.

    Closes #478.

- 2e3c48b: **Trauma: per-sub-type columns on the Being sheet and fields on the item sheet**

    Each Trauma sub-type now presents only the columns and fields that matter to it,
    instead of every sub-type sharing one generic injury layout.
    - **Being sheet (Trauma tab).** A sub-type's section still appears only when it
      has at least one trauma, but now shows a sub-type-specific column set: Fatigue →
      Category / FL / Notes; Fear & Morale → Category / Notes; Pall → PSL / Next Pall
      Recovery; Psychological Condition → PSY / Category / Next PSY Recovery Test;
      Physical Condition → Category / Notes; Aural Shock → ASL / Next AS Recovery
      Test; Injury & Infection → Sev / HR / Area / Next Heal Test; Shock & Coma → HR /
      Next Course Test. Every "level" column (FL / PSL / PSY / ASL) renders the level
      modifier.
    - **Trauma item sheet.** The Properties tab now shows only the fields relevant to
      the sub-type, plus `contractDate` for all. Injury and Infection add
      `treatmentDate`, body location, and the healing-check interval (with a computed
      Next Heal Test); Injury also adds the infectable and permanent-impairment flags;
      Shock and Coma add the course interval (with a computed Next Course Test). The
      sub-category field is a proper select for Fatigue / PsychCond / PhysCond.
    - **Next-test dates are view-only.** "Next Heal / Course / Recovery Test" is
      derived from the recurring schedule in `system.scheduledActions` — nothing is
      auto-armed (consent model), so it shows an em-dash when no test is scheduled.
    - `TraumaLogic.categoryLabel` now localizes the Psychological- and
      Physical-Condition sub-categories (previously only Fatigue).

    Closes #939

- d6219e2: **Trauma: time-based healing and blood-loss scheduling**

    Injuries now carry their healing and blood-loss timers as data and schedule them
    through the event queue. Adds temporal fields to Trauma (`contractDate`,
    `healingCheck*` and `bloodLossAdvance*` interval triplets via the schema helper),
    makes `healingRateBase` nullable, and replaces the `healingSeconds` world setting
    with `healingCheckDurationFormula` (default `"432000"` = 5 days) plus a new
    `bloodLossAdvanceDurationFormula` (default `"86400"` = 1 day).

    On creation a Trauma seeds its anchors to the current world time and its interval
    formulas from those settings; `TraumaLogic.finalize()` arms the recurring
    `healingCheck` (and, for a bleeding wound, `trauma::bloodLossAdvanceRoll`) events
    from the persisted anchors. The `healingCheck` / `bloodLossAdvanceCheck` intrinsic
    actions roll the next interval and re-arm — reusable both from the timed event and
    manually. The per-occurrence roll **effects** are tracked as follow-ups (#486,
    #487).

    Refs #482.

- 943cb57: **Type the weapon strike-mode schema and guard strike-mode construction (#512)**

    Weapon strike modes were stored in an untyped `ObjectField`, so a strike mode could be persisted with a partial `defense` object. `MeleeStrikeMode`'s constructor then read `data.defense.block.modifier` without a guard, threw during `WeaponGearLogic.initialize`, and aborted the actor's whole data preparation — which Foundry's `_safePrepareData` swallowed, so the weapon's strike modes silently never built and the Combat tab appeared to have none.
    - **Root fix:** `WeaponGearDataModel.strikeModes` is now a `TypedObjectField` of the discriminated melee / missile `TypedSchemaField` — the same schemas the combat-technique skill already uses — so every strike mode's sub-fields, including `defense.block` and `defense.counterstrike`, are validated and default to complete values. Partial strike-mode data can no longer be stored.
    - **Defense-in-depth:** `MeleeStrikeMode`'s constructor now reads `defense` defensively, so a malformed strike mode degrades instead of crashing the actor's data preparation.

- 35ec141: **Typed item-logic registry and actor-logic accessors**

    Add a kind-indexed item-logic registry and typed lookup so callers get the
    concrete logic type for an item kind without casting.
    - **`getItemLogic(shortcode, kind)`** on the actor logic returns the concrete
      logic for that kind — e.g. `getItemLogic("stealth", ITEM_KIND.SKILL)` is typed
      `SkillLogic | undefined`. It matches on **both** `shortcode` and kind, so a
      shortcode shared across kinds cannot return an unexpected item.
    - **`allLogics`** and **`logicTypes`** on the actor logic — the logic-layer
      analogues of `Actor#items` and `Actor#itemTypes`, with each group typed to its
      kind (`logicTypes.skill` is `SkillLogic[]`).
    - **`sohl.actorLogics`** and **`sohl.itemLogics`** expose every world actor's and
      item's logic instance directly, instead of going through `game.actors` /
      `game.items` and reading each `.logic`.
    - A precise `ITEM_LOGIC_DEF` registry with a compile-time completeness guard
      drives the `ItemLogicByKind` type map; registering a new item kind without a
      logic class is now a type error.

- c2c0c3d: **Wire Active Effect and Action management on the item and being sheets**

    The effect and action controls on the sheets are now functional, backed by real
    document methods — previously the handlers were unwired and the controls had been
    removed to avoid shipping dead buttons.
    - **Active Effects (both sheets):** create, toggle enabled/disabled, and delete an
      embedded effect from the effect list, plus a per-row context menu (edit /
      toggle / delete). Backed by new `createEffect` on `SohlItem` / `SohlActor` and
      `toggleEnabledState` on `SohlActiveEffect`, wired through the ApplicationV2
      `actions` map on the shared sheet mixin. The effect-row toggle now targets the
      `[data-effect-id]` row (it previously looked for a `.effect` element that does
      not exist).
    - **Actions (item sheet):** the item Actions tab now offers the same custom-action
      authoring the being sheet already had — create (bind a world Macro or a fresh
      one), edit the bound Macro, delete, and run (shift-click to skip the dialog).
      Intrinsic actions remain run-only.
    - The create/edit/delete/run action logic is consolidated into one shared
      `core/foundry/sheet-actions` helper used by both sheets, so they behave
      identically.

    Closes #501

### Patch Changes

- 85eb038: **Docs: rewrite the Affiliation user-guide page to answer why / when / what**

    The Affiliation item's user-guide page (`User_Guide/Items/Item_Affiliation.md`) was a
    bare field list. It now leads with purpose:
    - **Why use one** — an Affiliation is a _credential_: it records a character's
      membership and, above all, their _rank_ within an organized body, kept in one
      canonical place rather than scattered across other items.
    - **When to use one** — worked cases covering **religion** (with `Level` as rank in
      the hierarchy), **arcane school** (with `Level` as grade), **faction membership**,
      **criminal organizations**, and guilds / noble houses / military units.
    - **What to put here** — field-by-field guidance for `Society` / `Office` / `Title` /
      `Level`, with the rank ladder explained (lay member → initiate → ordained).

    A note steers religious and arcane rank onto the Affiliation's `Level` rather than the
    _Level_ bolt-on it has been tracked with on ritual/arcane Skills. Also fixes a typo
    (_"fullly"_) and cross-links Mystery, Mystical Ability, and Skill. Documentation only;
    no behaviour change.

    Closes #1001

- 3094246: **Shock rules: the Extended Shock Course Test is a Healing test, not Initiative**

    The Shock rules page described the **Extended Shock Course Test** as an _Initiative_
    skill test, but the implementation rolls **`Healing Base × HR`** — the same
    Healing-type Course Roll the Coma Course Test already documents. Corrected the
    Extended Shock Course Test text to match the code (and the Coma wording), so doc and
    code agree.

    Also refreshed the stale `BeingLogic.shockReTest` JSDoc: the re-test is no longer
    "invoked manually / awaiting a follow-up" — `offerShockReTest` now offers it on the
    state's own cadence (end of the being's own turn for Incapacitated, ten minutes later
    for Unconscious), with the re-test firing only on the controller's `[Perform]` click.

    Closes #1005

- 5301551: **Injury rules: drop the projectile and frost treatment aspects the system cannot apply**

    The Injury treatment tables listed **projectile** and **frost** impact aspects (with
    their `EXT`/`WRM`/`AMP` treatments and the grievous-frost amputation path) as live
    rules, but the system's impact aspects are **blunt**, **edged**, **piercing**, and
    **fire** only. The published rules now match what the system does:
    - The _Treatment actions_ table lists only the four supported aspects.
    - The _required treatment_ code table drops the now-unreachable `EXT`, `WRM`, and
      `AMP` codes.
    - _Special Injury Effects_ no longer references projectile or frost wounds.

    Closes #1006

- 05a5d0b: **Docs: add a Gear rules journal (gear types, Strike Modes, encumbrance)**

    The Rules journal had no player-facing coverage of gear.
    - **New `Rules/Gear.md` journal** — the common gear properties (quantity, weight,
      value, quality, durability, carried state, containers); the carrying &
      encumbrance model (only carried gear burdens the character); and a page per gear
      type: Miscellaneous, Container, Weapons, Projectiles, Armor, and Concoctions.
      Armor covers worn vs. carried, the encumbrance rules (worn armor weight is
      excluded from encumbrance; carried-but-not-worn armor counts), the optional
      per-item encumbrance value added when worn, protection graded by aspect
      (Blunt/Edged/Piercing/Fire) with impact absorbed and the remainder passing
      through, armor layering, coverage of one or more locations each flexible or
      rigid, and the sensory-perception penalties certain armor (notably helmets)
      impose. Weapons note their optional encumbrance value and their one-or-more
      strike modes.
    - **New `Rules/Strike_Modes.md` journal** — strike modes as an independent
      concept shared by weapons and combat techniques: a mode is a particular way of
      using a weapon (a sword's cut, thrust, or pommel), each with its own aspect,
      impact, and required body-part count; a mode is unusable when fewer than the
      required body parts are available; and the melee (reach, block, counterstrike)
      and missile (projectile type, range, draw, volley) specifics.
    - **`Rules/README.md`** gains a _Gear & Equipment_ section linking both journals.

    Closes #1007

- 64e6d3f: **Fix gear encumbrance: exclude worn armor weight; apply per-item encumbrance values**

    Two encumbrance rules documented in `Rules/Gear.md` were not honored by the being's
    derived load.
    - **Worn armor weight is excluded from encumbrance.** `GearLogic` now decides
      whether an item's weight counts as carried load through a `countsAsCarriedWeight`
      predicate (default: any carried gear). `ArmorGearLogic` overrides it so **worn**
      armor is left out of `carriedWeight` — a fitted harness rides the body — while
      the same armor carried but **not** worn still counts its full weight like any
      other cargo.
    - **Per-item encumbrance values are applied.** An armor's or weapon's optional
      encumbrance value (representing awkwardness beyond raw weight) is now added to
      `BeingLogic.encumbrance` while the item is in use — armor that is worn, a weapon
      that is carried — on top of the weight-derived base.

    Closes #1009
    Closes #1010

- 56e5187: **Remove the Turning Wheel calendar; hardcode the default Vylarian Reckoning in code**

    The system now ships a **single** built-in calendar, the **Vylarian Reckoning**
    (`vylrec`, the default), and the **Turning Wheel** (`twheel`) is removed.

    The Vylarian Reckoning is **hardcoded in code** — the `VYLARIAN_RECKONING`
    constant in `src/core/foundry/builtin-calendars.ts` — rather than loaded from a
    JSON data file. It is available synchronously at module load and registered before
    Foundry builds `game.time`, so there is no fetch or init-timing concern and nothing
    ships loose under `assets/`.

    Worlds may still add their own calendars through the Calendar Settings menu, and
    modules through `SohlSystem.registerCalendar(...)`. Closes #1048.

- 8de0772: **Docs: the shared document actions and shared dialogs, documented once on Base Item**

    Four actions belong to every document rather than to any one item type, and three
    dialogs turn up attached to actions all across the system. None of them were
    documented, so every page in the Intrinsic Action epic had something to link to that
    did not yet exist. `User_Guide/Items/Item_Base.md` now carries all of them, and the
    per-type pages link here instead of restating them.
    - **The shared actions** — **Edit** (`editDocument`), **Delete** (`deleteDocument`),
      **Output Description to Chat** (`outputDescription`, every item), and **Make Default
      Medium** (`makeDefaultMedium`, every actor) — each with its shortcode, icon, API
      link, how it is invoked, and what it changes. Delete's confirmation dialog is
      documented button by button, including that **Cancel** is the default, and the
      Container override that deletes a container's contents along with it. The
      description card is described row by row.
    - **The standard test dialog** — the pre-roll window nearly every d100 in SoHL opens
      first: **Target**, the modifier breakdown, **Situational Modifier**, **Success Level
      Modifier**, and **Roll Visibility** (all five visibility options and who sees what),
      plus what each modifier is actually for, that cancelling abandons the test, and why
      a few tests skip the dialog entirely.
    - **The strike-mode picker** — its title, prompt, **Use**/**Cancel** buttons, and the
      two common cases where it does not appear at all (a single strike mode; a mode
      clicked on the combat tab).
    - **The offer-schedule dialog** — the per-effect title, the prompt with its rolled
      cadence, **Schedule It** (the default) and **Not Now**, that declining is safe, and
      the _offer → remind → perform → offer the next_ loop the reminder card continues.
    - **GM result edit** (`resultEdit`) — the GM-only pencil on a posted test card: what
      it re-opens, that it re-evaluates on the same frozen roll and never re-rolls, that
      an unchanged submit is a no-op, and that non-GMs are refused at click time as well
      as having the pencil hidden.

    The **Actions Tab** section gains pointers to the new material and to `Actions` for
    the action mechanism itself.

    Three defects found while writing the page are noted in place and filed: the delete
    confirmation's title bar renders `Delete undefined}: {name}` (#1095), `makeDefaultMedium`
    silently does nothing when invoked without a medium in scope (#1098), and the GM
    result-edit dialog shows a **Roll Visibility** field that is discarded (#1099).

    Closes #1062

- 5107649: **Docs: the Skill Intrinsic Actions in the User Guide, with Combat Technique folded in**

    The Skill page described a handful of properties and none of the eight actions a
    Skill defines — including the three combat actions a combat technique carries.
    Combat techniques also still had a page of their own, describing them as a separate
    item type they have not been since they became a Skill category.

    `User_Guide/Items/Item_CombatTechnique.md` is **deleted** and its content folded into
    `Item_Skill.md`, which keeps `Combat Technique` / `Combat Techniques` as aliases so
    existing links still resolve; the one inbound wikilink (from **Weapon Gear**) is
    repointed.
    - **The six visible actions** — **Success Test** (`successTest`), **Success Value
      Test** (`successValueTest`), **Toggle Improve Flag** (`toggleImproveFlag`),
      **Improve with SDR** (`improveWithSDR`), **Opposed Test** (`opposedTestStart`), and
      the combat-technique **Attack** / **Block** / **Counterstrike** (`attackTest` /
      `blockTest` / `counterstrikeTest`) — each with its shortcode, icon, API link, how
      it is invoked, what it changes, and where it refuses. The standard test dialog and
      the strike-mode picker are named and linked to **Base Item** rather than
      re-described, and the opposed-test flow is linked to **Token**.
    - **The test-result card** is documented part by part, including the Success Value
      Test's extra **Success Value** and **Success Stars** rows and the four grades
      (No Value / Little Value / Base Value / Bonus Value) its result names.
    - **The two hidden actions** — `setImproveFlag` and `unsetImproveFlag` — are
      documented and flagged as never appearing in the Actions context menu, having been
      superseded by the toggle.
    - **Combat Techniques** get their own section: what they are, why creatures rely on
      them, the **Strike Modes** tab, and a field-by-field table of the strike-mode
      editor (the melee/missile split, attack, impact, and defense).
    - **Sheet shortcuts** are described alongside the actions — the EML, Fate, and
      Atk/Blk/CX cells, the ☆ improvement star, and the Shift-click that skips the
      pre-roll dialog.
    - **Additional Properties** is corrected against the schema: the Category list
      (adding _Mystical_ and _Combat Technique_, dropping a category that does not
      exist), the fields' real sheet labels, and the previously undocumented **Adopt
      Parent Mastery** and **Impaired By Roles**.

    Two defects found while writing the page are noted in place and filed: **Improve with
    SDR** is offered only while the skill is _not_ flagged for improvement, the reverse of
    the intended workflow (#1102), and its chat card renders a blank **Target** and
    **Roll** (#1103).

    Closes #1063

- 0071592: **Docs: the Attribute Intrinsic Actions in the User Guide**

    The Attribute page described four properties — one of which does not exist — and
    none of the two actions an Attribute defines, even though every attribute is
    rollable in its own right against a Target Level of score × 5.
    - **Both actions** — **Success Test** (`successTest`) and **Opposed Test**
      (`opposedTestStart`) — each with its shortcode, icon, API link, how it is invoked,
      what it rolls, and where it refuses. The standard test dialog is named and linked
      to **Base Item** rather than re-described, and the opposed-test flow (targeting,
      both cards, the responder's dialog, victory degrees) is linked to **Token**.
    - **The test-result card** is documented part by part, and the two things that
      change an attribute roll for you — the score × 5 target, and the **Impaired By
      Roles** injury penalty (−5 / −10, or an automatic critical failure on an unusable
      part).
    - **Where It Appears** now describes the Profile-tab attribute card control by
      control (name, ⋮ menu, score with its derivation tooltip, descriptor, TL), and
      states plainly that — unlike a skill's EML cell — **nothing on the card is
      click-to-roll**, so there is no Shift-click shortcut past the pre-roll dialog.
    - **Additional Properties** is corrected against the schema: the **SubType** entry
      is removed (Attribute has no such field, and the three "traid categories" it
      listed do not exist), **Value Descriptors** gains the band-matching rule that
      picks the word shown under the score, and the previously undocumented **Impaired
      By Roles** is documented.

    Four defects found while writing the page are noted in place and filed: the Score
    and Init Dice Formula fields render with **empty labels** (#1105), **no Fate can be
    spent on an attribute test** although the rules allow it (#1106), the test-result
    card's **title shows a raw text key** rather than the test's name — on skills as
    well as attributes (#1107), and the **Init Dice Formula is never rolled** by
    anything (#1108).

    Closes #1064

- 1899477: **User Guide: the base Gear Intrinsic Action**

    The _Gear_ page gains an **Intrinsic Actions** section documenting **Toggle
    Carried** (`toggleCarried`) — the one action every piece of gear adds to the
    standard item actions, and the action the four inherit-only gear pages already
    link here for (#1065, part of the intrinsic-action documentation epic #1061).

    The entry gives the action's name, shortcode, icon, and API link, then covers it
    in player terms: what flipping **Is Carried** is for, the three ways to run it
    (the Actions context menu, the item sheet's Actions tab, and the sack shortcut on
    the Gear-tab row), and what happens on screen — no dialog, no roll, no card, just
    the flag and a recomputed carried weight. It also states the limits that are easy
    to guess wrong: worn armor is not counted as carried load, a weapon's own
    encumbrance value applies while carried, the toggle does not touch worn or
    equipped state, it does not cascade into a container's contents, it does not
    block using the item, and only a Being keeps a carried-weight total for it to
    feed.

    **Edit**, **Delete**, and **Output Description to Chat** are linked to _Base
    Item_ rather than restated.

- de79194: **Document Weapon Gear's Intrinsic Actions in the User Guide**

    The Weapon page now documents everything a weapon can do, verified against a running
    client rather than read off the source.
    - **Attack, Block, and Counterstrike** each get name, shortcode, icon, API link, what
      they do and when to reach for them, how they are invoked, and the dialogs and chat
      card the flow produces. The strike-mode picker and the standard test dialog are
      linked to _Base Item_, where they are described once; **Toggle Carried** is linked
      to _Gear_.
    - **New sections for the two preconditions a player actually trips over.** _Holding a
      Weapon_ explains the Combat tab's **Held Items** list, the two-limb grip a **Min
      Parts** 2 mode needs, and how holding differs from carrying. _The Strike Modes Tab_
      covers a weapon's several modes and the three editor fields that behave differently
      on a weapon than on a combat technique — chiefly that a weapon has **no mastery
      level of its own**, so an unset **Associated Skill** leaves it swinging at its flat
      modifiers alone.
    - **What the roll is made against** is now stated: the associated skill's mastery
      level, plus the strike mode's own flat modifier, plus anything else in play.
    - **Corrected stale content.** Strike modes are described as part of the weapon, not
      as nested items; the **Heft** property was missing from the properties list; and the
      Combat tab is noted as showing a weapon only while it is held.

    Four known defects found while verifying are flagged in-page and linked to their
    issues: the Gear-tab ⋮ menu omits the three combat actions (#1132), the test-result
    card's title renders a raw localization key (#1107), Fate cannot be spent on a
    weapon's combat tests (#1106), and Block / Counterstrike are offered on a
    missile-only weapon and silently do nothing (#1137).

    Closes #1066

- 37ceb5c: **Docs: the ArmorGear Intrinsic Action in the User Guide**

    The Armor page described what armor is and how encumbrance treats it, but never
    documented **Toggle Worn** — the one action armor adds, and the switch that decides
    whether a piece of armor protects anything at all.
    - **Toggle Worn** (`toggleWorn`) is documented in full: shortcode, icon, API link,
      both places it can be invoked (the shield button on the Gear tab row and the ▶ on
      the armor's Actions tab), what it changes, and the fact that it opens no dialog,
      rolls nothing, and posts no chat card.
    - **What the numbers do** is now a table: worn armor adds its Blunt / Edged /
      Piercing / Fire values to every covered body location (visible in the Combat tab's
      body-locations table, alongside its Material) and adds its own Encumbrance value,
      while carried-but-unworn armor protects nothing and counts its full weight as
      load. The two consequences that surprise people are stated plainly — **layers
      stack** at shared locations, and **putting armor on can make a character lighter**,
      because worn armor stops counting as carried weight.
    - **The carried gate** is described as the action's precondition (greyed shield
      button, disabled Worn checkbox, refusal however it is invoked), and setting armor
      down is stated to take it off in the same stroke. The standalone _Wearing Requires
      Carrying_ section is folded into it rather than saying the same thing twice.
    - **Inherited actions are linked, never restated**: **Toggle Carried** to **Gear**,
      and **Edit** / **Delete** / **Output Description to Chat** to **Base Item**. Armor
      is stated to define no hidden actions.
    - **Additional Properties** gains how coverage is authored (shortcode entries, and
      that a location named in both lists is covered once and counts as rigid) and what
      Material controls on the Combat tab.

    Four defects found while writing the page are noted in place and filed: every
    carried-gated gear action — armor's **Toggle Worn**, a weapon's attack and defence
    tests — is **missing from the Gear tab's context menu even while the item is
    carried**, because no sheet emits the `data-actor-id` the visibility check needs
    (#1132); the armor sheet has **no editor for Protection Base or Encumbrance**, so
    hand-built armor protects for 0 (#1133); the Actions tab offers an active ▶ for a
    gated action that **silently does nothing** (#1135); and every intrinsic action row
    renders an **empty icon** because the template reads `data.img` while actions carry
    `iconFAClass` (#1136).

    Closes #1067

- c8ca60b: **Docs: the Mystical Ability Intrinsic Action in the User Guide**

    The Mystical Ability page explained how an ability's Effective Mastery Level is
    derived but never said how an ability is actually _invoked_ — the one action it
    defines — and its property list had drifted from the schema.
    - **Success Test** (`successTest`) is documented in full: shortcode, icon, API
      link, both ways it is invoked (the Actions context menu and the row's **EML**
      cell, Shift-clicked to skip the dialog), what it rolls, and the test-result card
      part by part. The standard test dialog is named and linked to **Base Item**
      rather than re-described.
    - **Before you start** covers the two ways an invocation is refused — an
      **exhausted** ability and a Spirit Rite / Spirit Action with **no valid Spirit
      Power** — with the exact notice each produces, and states that a completed roll
      **spends a charge** while a cancelled dialog spends nothing.
    - **Where It Appears** now describes the Mystical tab's per-sub-type ledgers
      column by column, including which columns each sub-type shows, that the EML cell
      _is_ the roll, and that a greyed row cannot be invoked.
    - **Additional Properties** is reconciled with the schema: the nonexistent
      **Associated Mystery** entry is removed; the previously undocumented **Mastery
      Level** (used only when no skill governs the ability) and **Improvement Flag**
      are documented; **Level** and **Charges** gain their blank-value meanings (no
      level / unlimited / does not use charges); **Associated Skill** gains its
      Spirit-Power reading on the two spirit sub-types; and the sub-type list is
      corrected — the nonexistent _Spirit Incantation_ is dropped, the missing
      **Spirit Action** and **Divination** are added, and the sub-type is noted as
      fixed at creation.
    - **The Incantation Casting Penalty** now says where the Level × 2 penalty is
      itemized (the **LvlPen** tooltip, and its own Adjustment row), and the page
      states that SoHL rolls the invocation but never applies the ability's effect.

    Four defects found while writing the page are noted in place and filed: every
    **modifier breakdown renders raw localization keys** on test cards and in the
    standard test dialog (#1127), the Charges box's checkbox is **unlabelled and
    inert** (#1129), the **☆ improve flag has no action to consume it** (#1130), and
    the **Chgs/Max and Notes column headers collide** (#1131). Two known gaps are
    confirmed to reach mystical abilities as well and noted on the page: the card's
    **raw-key title** (#1107), and **no Fate on an invocation** (#1106) — which bites
    hardest here, since an ability borrows its mastery level from a skill whose own
    test _does_ offer Fate.

    Closes #1068

- 782cf69: **Docs: the Affliction Intrinsic Actions in the User Guide**

    The Affliction page listed a handful of properties and ended in a TODO comment. It
    documented none of the three actions that _are_ an affliction's entire lifecycle,
    and nothing about how one actually progresses — so a reader had no way to learn
    that an affliction added by hand never onsets, or what a Healing Check does to the
    character when it goes badly.
    - **All three implemented actions** — **Onset Check** (`onsetCheck`), **Healing
      Check** (`healingCheck`), and **Resolution Check** (`resolutionCheck`) — each
      with its shortcode, icon, API link, and an explicit flag that it is **hidden**:
      none is on the Actions context menu, and each is reached from the **Perform**
      button on its scheduled reminder. The offer-schedule dialog is named and linked
      to **Base Item** rather than re-described.
    - **The lifecycle is described as a whole** — contracted → onset → the recurring
      course of Healing Checks → resolution — with the point made at each step that a
      human moves it along. Onset is called out as the one place two follow-up
      schedules are armed without asking, and why that follows from the **Perform**
      that was already pressed rather than excepting the consent model.
    - **What each check does to the character** is given in player terms: the Course
      Test's ±1/±2 to the Healing Rate, the full reaction table (HR 6 defeats it, HR
      5/4 inflict 5/10 weakness fatigue, HR 3/2/1/below-1 impose Stunned /
      Incapacitated / Unconscious / Dead), that shock states only ever worsen, that the
      fatigue is recorded as its own Trauma, and that these rolls are **headless and
      post no result card**. The two conditions under which no Course Test is rolled at
      all — a blank Healing Rate, or no usable Endurance — are documented, since a
      lethal poison is _meant_ to sit at its rate and run out the clock.
    - **Where It Appears** now describes the Health tab's affliction ledger column by
      column, and states plainly that only **Contract Disease** offers to start the
      clock — an affliction dragged in or added by hand sits inert.
    - **Additional Properties** is corrected and completed against the schema:
      **SubType** is read-only in the sheet header subtitle (not on the Properties tab,
      as the page claimed), the three timing fieldsets and their formula/seconds/
      projection triples are documented, and the derived fields are separated from the
      stored ones. The page now says outright that an affliction's **Level does not
      move** — the **Healing Rate** is the number that does — because the Trauma page's
      behavior invites the opposite assumption.
    - The stub actions are **not** documented, per the epic's scope, and the page's
      closing `TODO` comment is removed.

    Two defects found while writing the page are noted in place and filed: the
    Affliction context menu offers **nine unimplemented actions**, five of which throw
    an uncaught error when clicked (#1126), and the **Outcome** field — Death or Cured,
    the most consequential thing about an affliction — is **never rendered on the
    sheet**, so anything authored in the UI silently carries the default of _Cured_
    (#1128).

    Closes #1069

- fc26e82: **Docs: a Trauma page in the User Guide, documenting its Intrinsic Actions**

    Trauma is the item that records every kind of harm a character carries — wounds,
    bleeding, infection, shock, coma, fatigue, fear, morale, psyche stress, aural shock,
    and the Pall — and it had no User-Guide page. The Injury page covered one sub-type in
    thirty lines and described none of the eleven actions a Trauma defines. It is now
    `User_Guide/Items/Item_Trauma.md`, with the Injury content folded in and the old page
    repointed (its journal id is preserved, and `Injury` remains an alias, so existing
    links still resolve).
    - **What a Trauma is** — the eleven Trauma Types and what each is measured by, and
      the distinction from an Affliction: a Trauma is harm the character _carries_, an
      Affliction is an outside _agent_ working on them.
    - **Additional Properties** — a field-by-field table of the Properties tab, noting
      which Trauma Types show which fields, and calling out the two derived states that
      are not checkboxes: a wound is _treated_ when it has a treatment date, and it
      _bleeds_ while its Blood-Loss Interval is set.
    - **The four visible actions** — **Request Treatment** (`requestTreatment`), **Treat
      Injury** (`treatInjury`), **Treatment Test** (`treatmenttest`), and **Request Blood
      Stoppage** (`requestBloodStoppage`) — each with its shortcode, icon, API link, how
      it is invoked, what it changes, and when it refuses. The Treat Injury dialog's
      **Healing Rate** field is described, and both request cards are documented button
      by button, including why their buttons are open to any Physician-skilled character
      rather than addressed to one.
    - **The seven hidden actions** — `acceptBloodStoppage`, `healingCheck`,
      `bloodLossAdvanceCheck`, `courseCheck`, `psycheRecovery`, `auralShockRecovery`, and
      `pallRecovery` — documented and flagged as never appearing in the Actions context
      menu, each placed at the card button or scheduled reminder that actually triggers
      it. Their result tables (blood loss per success level, course-test Healing Rate
      movement, the three recovery outcomes) are given in player terms, along with the
      three things that stop a wound healing and the Face the Pall card's deliberate
      lack of buttons.
    - **Two orienting sections** — how a wound travels from infliction through treatment
      to closure, and the _offer → remind → perform → offer the next_ loop every
      recurring check follows, including catch-up when game time jumps.

    `healingtest` is an unimplemented stub and is omitted. Three defects found while
    writing the page are noted in place and filed: the injury actions are missing from
    the context menu (#1085), the recovery-check schedule offers show a raw localization
    key (#1086), and the Treat Injury dialog wrongly promises that Healing Rate 0 heals
    the wound (#1087).

    **Afflictions and Injuries** gains a pointer to the new page and its stale
    `item-injury` link is repointed.

    Closes #1070

- fae323c: **User Guide: the Being page now documents its Intrinsic Actions**

    The Being page mentioned an _Actions_ tab twice and described nothing in it. A
    player who opened that tab — or met a Rally card or a scheduled Shock Re-Test
    reminder in chat — had no reference for what any of it did. `Actor_Being.md`
    gains an **Actions on a Being** section indexing all fourteen menu actions, then
    one entry per action giving its name, shortcode, icon, how it is invoked, and a
    link to its API documentation:
    - **Shock** — _Shock Test_ (`shockTest`) with its Base Shock State Index field,
      the index-to-state mapping, the consent-gated _Set Shock State?_ dialog, and
      the Re-Test reminder offer; and _Shock Re-Test_ (`shockReTest`), flagged
      **hidden** and reached only from the reminder's **Perform** button, with the
      Extended Shock / Coma outcomes it can produce.
    - **Keep-control tests** — _Stumble_ (`stumbleTest`) and _Fumble_ (`fumbleTest`),
      the better-of-attribute-or-skill rule, and their four-outcome result tables.
    - **Psychological tests** — _Fear_ (`fearTest`), _Morale_ (`moraleTest`),
      _Reaction_ (`reactionTest`), _Rally_ (`rallyTest`), and _Resist the Pall_
      (`pallResist`): what each rolls, the state each result produces, the Psyche
      Stress it inflicts, and what is recorded on the sheet. _Answer the Rally_
      (`acceptRally`) is documented as **hidden** beside the Rally! card whose open
      button is its only trigger.
    - **Injury flow** — _Calculate Impact_ (`calcImpact`) and its damage card, and
      _Resolve Injury_ (`resolveInjury`) with every field of the Resolve Injury
      dialog (Target ZN, Zone Die, Location, Aspect, Impact, Armor Reduction, Bleed
      Impact Penalty, Treatment Modifier, Add to Character Sheet), the Amputation
      Test dialog, and the result and miss cards.
    - **Physician's actions** — _Perform Treatment Test_ (`performTreatmentTest`) and
      _Perform Blood Stoppage_ (`performBloodStoppage`), both run on the physician's
      own sheet, with their Physician-skill gate, their dialogs, and the owner-gated
      **Accept** button by which the patient — never the physician — records the
      result.
    - **Contract Disease** (`contractDisease`) — the disease/custom-disease dialog,
      the contagion roll a character wants to _make_, and the onset-check offer.

    Shared dialogs are named and linked to _Base Item_ rather than restated, and the
    page cross-links the Shock, Fear, Morale, Pall, Injury, Bleeding, Healing Base,
    Infection, and Afflictions rules. Two dead relative links on the page
    (`user-guide/character-creation.md`, `user-guide/combat-basics.md`) are corrected
    to wikilinks.

    Closes #1071

- e3bdb39: **Docs: a Combatant page in the User Guide, documenting its Intrinsic Actions**

    The combat tracker's row is a **Combatant**, and it carries actions no other page
    described — a player who right-clicked a row, or met a defense button on an attack
    card, had nothing to read. A new `User_Guide/Combatant.md` covers them:
    - **The combatant row** — the group and computed-move chips, the **Move Factor** and
      **Tracker Medium** settings on the combatant configuration sheet, and how a
      combatant is first placed in a group from the actor's **Default Combat Group**.
    - **Automated Combat** (`automatedCombatStart`) and **Move to Group…**
      (`moveToGroup`) — each with its shortcode, icon, API link, how it is invoked, what
      it asks for, what it does, and when it refuses. The Move to Group dialog's
      **Group** and **New group name** fields are described field by field.
    - **The four defense responses** (`automatedBlockResume`, `automatedDodgeResume`,
      `automatedCounterstrikeResume`, `automatedIgnoreResume`) — documented and flagged
      as _hidden_: they are offered only as buttons on the defender's attack card, never
      in the Actions context menu, and each is gated on what that character can do.

    **Combat Basics** gains the matching detail and links back: the attack dialog's
    **Aim** and **Additional Modifier** fields, what the attack card and the result card
    show (including the per-side **Calculate … Injury** buttons), and the corrected way
    to start an automated attack — right-click the attacker's tracker row.

    Automated Combat remains outside the frozen Being-centric beta path; the page says
    so, and notes the two gaps found while writing it (#1079, #1080).

    Closes #1072

- 3b9a095: **User Guide: new Token page documenting the opposed-test actions**

    Adds `assets/content/User_Guide/Token.md`, the User-Guide page for the Token
    document (#1073, part of the intrinsic-action documentation epic #1061). The
    token's two intrinsic actions drive the opposed-test flow, and both are hidden
    from the Actions context menu, so the page flags that and documents where each
    one is really reached:
    - **Opposed Test** (`opposedTestStart`) — started from a skill's or attribute's
      own _Opposed Test_ action, which hands the contest to the actor's token. Covers
      the prerequisites (a token on the scene, exactly one target, ownership of the
      target's token), the standard test dialog (linked to _Base Item_), and every
      part of the resulting **Opposed Action Request** card, including who may use
      its **Respond** button.
    - **Resume Opposed Test** (`opposedTestResume`) — the responder's side, reached
      from that **Respond** button. Documents both fields of the _Respond to Opposed
      Test_ dialog (the skill/attribute picker with its mastery levels, and the
      additional modifier) and reads the **Opposed Action Result** card section by
      section: the per-side modifier breakdowns, the results grid, the outcome line,
      and the success stars.

    Each entry lists the action's name, shortcode, icon, how it is invoked, and a
    link to its API documentation, and the page cross-links the _Opposed Tests_
    rules, _Skill Tests_, _Combat Basics_, and _Scene Setup_.

- f7ccb4b: **User Guide: Intrinsic Actions on the nine inherit-only pages**

    Nine document types define no intrinsic action of their own — they carry only the
    shared document actions, plus `toggleCarried` for gear. Each of their User-Guide
    pages gains a short **Intrinsic Actions** section that names the inherited set
    (action, shortcode) and **links** to the canonical write-up rather than restating
    it (#1074, part of the intrinsic-action documentation epic #1061):

    | Pages                                                         | Inherited set                                                           |
    | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
    | _Container_, _Concoction_, _Miscellaneous Gear_, _Projectile_ | `editDocument`, `deleteDocument`, `outputDescription` + `toggleCarried` |
    | _Mystery_, _Affiliation_                                      | `editDocument`, `deleteDocument`, `outputDescription`                   |
    | _Vehicle_, _Structure_, _Cohort_                              | `editDocument`, `deleteDocument`, `makeDefaultMedium`                   |

    Each section also answers the question a reader is left with once they know the
    type adds nothing: a concoction has no _use_ action (drinking one stays a table
    decision), a projectile is spent by attacking with the ranged weapon that names
    it, an affiliation is a credential that is never rolled, a Mystery's effect is
    carried by its Active Effects, and the three non-Being actors inherit **Make
    Default Medium** without a movement table to drive it.

- 9a9f6b0: **Automated Combat starts again from the combat tracker**

    Choosing **Automated Combat** on a combatant always failed with "… automated attack
    requires a target combatant," even with an enemy token targeted, so the whole flow was
    unreachable from the interface. Four defects on that one path are fixed:
    - **The target is resolved from what the player has targeted.** The tracker's
      context-menu entry builds its action context with a speaker only, so
      `startAutomatedAttack` now falls back to the user's targeted token — the same seam
      opposed tests already use — instead of aborting. Targeting remains the human
      trigger: with nothing targeted the attack still refuses rather than picking an
      opponent.
    - **The resolved target is passed to the attack dialog as the defender.** The dialog
      step derived the defender from an attack result in scope, which only the
      counterstrike path carries, so a fresh attack aborted a step later with "requires a
      valid defender combatant." The defender is now supplied explicitly by each caller —
      the target for an attack, the original attacker for a counterstrike.
    - **A combatant's token logic reads the combatant document.** It read the data model
      instead, so every access threw before the range measurement could run.
    - **Range measurement no longer crashes on undrawn tokens or system-less scenes.** It
      falls back to the TokenDocument's own centre when a token has no drawn placeable,
      and a scene carrying no SoHL system data now yields no scene logic instead of
      throwing from inside the accessor.

    Automated Combat is fenced for the Being-centric beta, so this is off the frozen path;
    producing the attack card itself still needs a canvas.

    Closes #1079

- 639007d: **Automated attack dialog: offer the strike mode it always meant to**

    The automated-combat attack dialog was documented as the place the attacker picks
    their strike mode, but the template rendered only **Aim** and **Additional
    Modifier**. Its result callback then read a `modeIdx` form field that never
    existed, so the mode lookup yielded `undefined` and confirming the dialog threw.
    - **The dialog now renders a Strike Mode select**, listing every mode able to
      reach the target, pre-selected to the mode this combatant last attacked with
      (or the mode the invoking action supplied), falling back to the best effective
      Attack Mastery Level.
    - **The two sides now agree on keying.** `modeChoices` and `defaultModeIdx` are
      both the mode's **index** in the offered list — the same convention the block
      dialog uses — because a strike-mode shortcode is unique only within its own
      weapon, so two weapons can each offer a `swing`. An out-of-range or missing
      selection resolves to the pre-selected mode instead of throwing.
    - **`scope.mode` is honoured.** Starting an automated attack from a weapon's own
      action (`StrikeModeBase.automatedCombatStart`) sets `scope.mode`; it is now the
      first preference for the dialog's pre-selection, and the mode used outright when
      the dialog is skipped. Preference order: `scope.mode`, the prior attack result's
      mode, the last-used mode, then best chance.
    - Dropped the unused `spread` field from the dialog result — the second form field
      the callback read but the template never rendered; both callers compute spread
      from the chosen strike mode themselves.

    Automated Combat remains fenced for the Being-centric beta.

    Closes #1080

- d79e775: **GM edit pencil on the Opposed Action Result card now works**

    The pencil in the opposed result card's header did nothing when clicked. It
    rendered `data-action="{{targetTestResult.testType.action}}"`, but
    `OpposedTestResult.toChat` shapes each side with `testType` as a plain string, so
    `.action` was `undefined` and the attribute came out empty — the chat-card
    dispatcher had no action to run, and no `data-scope` to run it against.
    - **The pencil dispatches a real GM re-edit.** It now emits
      `data-action="opposedResultEdit"`, addresses the **source actor** (the uuid
      that survives a repost of an already-edited card, unlike the item uuid, which
      scope revival re-parents), and carries the whole contest in `data-scope`.
    - **New `SohlActorBaseLogic.opposedResultEdit`** — the two-sided counterpart to
      the standard card's `resultEdit`. It re-opens each side's modifiers in turn
      (the dialog heading names the side), re-scores the contest on **both frozen
      dice** — never a re-roll, no Fate cost — and posts a corrected result card
      below the original. Dismissing either dialog cancels the whole edit;
      confirming both unchanged is a no-op. GM-only, refused again at click time so
      a synthesized click cannot bypass the render-time gate.
    - **Extracted `SuccessTestResult.editModifiers`** — the "re-open the pre-filled
      editor and fold the new situational / success-level modifiers in, without
      rolling" core that `resultEdit` already implemented, now shared by both
      pencils. `resultEdit`'s behavior is unchanged.
    - The result card's `<h3>` no longer carries a stray, inert `edit-action` class,
      which would have taken the card title with it had the GM-only gate ever
      broadened beyond anchors.

    The result card's tie assertions were tightened from a bare `"Tie"` substring to
    the rendered label: the pencil's `data-scope` now embeds the serialized contest,
    whose `breakTies` key contains that substring, which would have made the short
    form match every opposed card.

    Documented in the Token user-guide page, which previously omitted the GM re-edit
    because the path did not work.

    Closes #1082

- befee21: **Fix: the Treat Injury dialog no longer promises that Healing Rate 0 heals the wound**

    The hint under the Treat Injury dialog's Healing Rate field read _"(0 heals it
    outright)"_. It does not: the outright-heal sentinel is a `HEAL` value that only a
    Treatment Result card can supply, so a typed `0` was recorded as a Healing Rate of 0
    — a wound whose Healing Tests roll against `Healing Base × 0` and therefore never
    mend. The hint led a GM into recording the worst available outcome while believing
    they had cured the wound.

    The hint now describes the field truthfully: Healing Tests roll against Healing Base
    × Healing Rate, so a higher rate heals faster, 0 fails every check and leaves the
    wound making no progress at all, and a blank field records no rate. The dialog's
    label and hint are also localized (`SOHL.Dialog.TreatInjury.*`) rather than hardcoded
    English, matching the sibling Treatment Test dialog.

    The same conflation appeared in the field's default. A wound whose Healing Rate is
    still undetermined stores `null`, but the dialog coalesced that to `0` — so an
    untreated wound opened pre-filled with the worst available rate, one blind confirm
    away from being recorded. The field now opens **blank** for an undetermined rate, and
    a blank submission records nothing rather than the `0` that `Number("")` yields.

    Recording behavior is otherwise unchanged and now has regression tests: a rate
    entered by hand is only ever recorded as a Healing Rate and never alters the wound's
    Injury Level.

    Closes #1087

- 14c5c1c: **Vehicle, Structure, and Cohort sheets render every tab, not just Façade**

    Selecting any tab but **Façade** on one of these sheets showed an empty panel: the
    tab switched, but its body was never in the DOM. The actions existed on the actor
    and the templates existed on disk — there was simply no way to reach them from the
    sheet.
    - **Render parts are derived from the sheet's declared `PARTS`.** The base actor
      sheet hard-coded its render list to `header` / `tabs` / `facade`, discarding
      everything each concrete sheet declared; only the Being sheet restated its own
      parts, so only the Being sheet showed them. The list is now derived (in
      declaration order), so a sheet gets a tab body by declaring it. The
      experimental-schema banner and the limited-permission rule are applied by the
      same derivation.
    - **The shared tab behavior moved to the base sheet.** The Gear, Actions, and
      Effects tabs are the same tabs on every actor type, so their context builders,
      their controls (add / edit / delete gear, carry, wear, and the action controls),
      and the item and effect context menus now live on the base actor sheet rather
      than on the Being sheet alone. The header and Façade contexts are prepared for
      every actor type too — the Vehicle, Structure, and Cohort headers previously
      rendered a blank name and portrait.
    - **Gear capacity reads correctly per type.** A Being's Gear tab still reports
      carried weight and encumbrance; a Vehicle or Structure, which is not encumbered
      by its load, reports the total weight of its cargo or stores.

    The Cohort's **Members** tab renders its section but does not yet list members,
    and the Cohort has no shared-gear tab; both are tracked separately.

    Documentation: the Gear, Actions, and Effects tabs are now documented once, in
    _Understanding Sheets_ under **Common Actor Tabs**, with the Being, Vehicle,
    Structure, and Cohort pages linking there instead of each restating them.

    Closes #1088

- 9047124: **Dialog, label, and context-menu fixes across actions and reminders**

    Six defects in the shared action surfaces — each small, all user-visible.
    - **Roll Visibility is honored in the GM result-edit** (#1099). The edit pencil's
      dialog rendered a **Roll Visibility** dropdown whose value was read by nobody, so
      a GM taking a corrected result private got a public repost anyway. The chosen
      mode is now applied and the card reposts under it; a visibility-only change
      counts as a change, so it actually reposts. The opposed-contest pencil offers the
      same field per side, where the source side's choice governs the single card it
      posts. Ordinary pre-roll posting is untouched — a card takes an explicit
      visibility only when its poster names one.
    - **Make Default Medium offers the choice instead of doing nothing** (#1098). The
      action is a normal, selectable action, but its executor required a medium in
      scope — which only the Profile-tab star supplies. Invoked from an action list or
      a script it returned silently: no dialog, no notice, no change. It now prompts
      with the no-movement medium plus every medium the actor authors a profile for,
      preselected at the current one. A caller that suppressed the dialog gets a notice
      rather than an unexplained no-op; the star path is unchanged.
    - **The delete confirmation names the document type again** (#1095). The title read
      `Delete undefined}: Dagger` — its string spelled the placeholders in Handlebars'
      double-brace form, which the localizer's single-brace interpolation matched half
      of. It now reads `Delete Weapon Gear: Dagger`.
    - **Recovery-check reminders read as English** (#1086). The offer-to-schedule
      dialog for the three Trauma recovery checks showed a raw localization key as the
      effect name ("Set a SOHL.Reminder.effect.psycheRecovery Reminder?"). The missing
      labels are added, and a test now requires one for every action that offers a
      schedule, since the key is built at runtime and no lint reads it.
    - **The Combatant page's API links resolve** (#1094). Six links used the namespaced
      class-page naming against `/latest/`, which still serves the older naming; they
      now point at `/main/` like the rest of the content tree.
    - **A context-menu entry built from `functionName` can find its item** (#1188). The
      fallback callback's resolver guarded on an _effect_ marker before an _item_
      lookup, then passed a bare id where a UUID was required, so the entry always
      missed. It now shares the one resolution path the rest of the context menu uses.

    Closes #1099
    Closes #1098
    Closes #1095
    Closes #1094
    Closes #1086
    Closes #1188

- 457e4b5: **Improve with SDR: offer it for a _flagged_ item, and give it a card that shows its numbers**

    The Skill Development Roll was offered by an inverted predicate and posted a chat
    card whose two key numbers were blank. Both defects were shared by `SkillLogic` and
    `MysticalAbilityLogic`, which run the same executor.
    - **Visibility is no longer inverted.** _Improve with SDR_ appeared only while the
      item was **not** flagged for improvement and vanished the moment you flagged it —
      the reverse of the workflow the flag exists for, and unreachable for the action
      that _spends_ the flag as part of its outcome. The predicate now reads
      `itemLogic.canImprove && itemLogic.data.improveFlag`, in the shared action
      definition and in the matching `TEST_TYPE.IMPROVEWITHSDR` context-menu default, so
      the two cannot disagree.
    - **The SDR posts its own card.** It rendered through `standard-test-card.hbs` under
      keys that template does not read (`effTarget` / `rollValue` vs.
      `mlMod.constrainedEffective` / `roll.total`), so **Target** and **Roll** came out
      empty and the card carried a GM result-edit pencil with an empty scope. An SDR is
      not a success test — it has no mastery-level modifier, no Fate, no success level,
      and nothing to re-evaluate — so it now renders `templates/chat/sdr-card.hbs`, which
      shows the roll total and the base mastery level it had to beat, and no pencil.
    - **The card now actually posts.** Verifying the fix in a live world surfaced a third
      defect on the same payload: it carried a `type` key naming the item, and
      `SohlSpeaker._prepareChat` spreads card data straight into the `ChatMessage`,
      so that string became the message's **document subtype**. It is not a registered
      subtype, so Foundry rejected the create and the SDR card never reached chat at all
      — the roll resolved and persisted silently. The key is gone (no template read it),
      and `_prepareChat` documents the hazard.

    The Skill and Mystical Ability user-guide pages record the flag precondition and drop
    the corresponding known-gap notes.

    Closes #1102

    Closes #1103

- 080dd05: **Test cards and the standard test dialog no longer show raw localization keys**

    Two display strings on every standard success test reached the screen as their
    untranslated `SOHL.*` key.
    - **Card title (#1107).** `MasteryLevelModifier` built its default title by
      formatting `SOHL.MasteryLevelModifier.successTest` — a _namespace_ holding
      `.title` / `.dialogTitle` / `.dialogLabel`, not a string — so `format()`
      returned the key verbatim and the card header read
      `SOHL.MasteryLevelModifier.successTest`. It now formats
      `…successTest.title`, and the header reads the test's name (_Strength Test_,
      _Fire Dart Test_). No key was renamed.
    - **Modifier breakdown (#1127).** `ValueModifier.chatHtml` emitted each delta's
      stored `name`, which is a localization key by convention across the system
      (`SOHL.MOD.*`, `SOHL.MysticalAbility.*`, …), so every Adjustment row on a test
      card **and** in the standard test dialog showed the key instead of its label —
      e.g. `SOHL.MysticalAbility.LevelPenalty` rather than _Level Penalty_. The new
      `ValueDelta.label` getter localizes the name at render time (the treatment
      `disabledReason` got in #948) and the breakdown uses it. Escaping still runs
      **after** the lookup, so a delta named with crafted markup — which localizes to
      itself — stays inert. The stored `name` and its serialized form are unchanged.

    Regression coverage asserts the real rendered card HTML: the header is prose and
    not a `SOHL.` key, and the Adjustment block carries no key at all.

    Closes #1107
    Closes #1127

- d372a2e: **Mystical Ability / Mystery: remove the unlabelled, inert "uses charges" checkbox**

    The **Charges** fieldset on both item sheets led with a checkbox bound to
    `system.charges.usesCharges`. It rendered with no label at all, and nothing in the
    system ever read it — whether an item consumes charges has always been decided by
    **Maximum Charges** alone (`null` = does not use charges, `0` = counted but
    uncapped, a positive number = a real cap).
    - **Dropped `charges.usesCharges`** from `MysticalAbilityDataModel` /
      `MysteryDataModel`, from both logic `Data` interfaces, and from the two
      properties templates. A pre-Beta clean break — the flag carried no meaning, so
      there is nothing to migrate.
    - **Made the surviving hints carry the meaning.** The **Maximum Charges** hint now
      states plainly that a blank value means the item does not use charges and `0`
      means no limit. (The Mystery hint previously said blank meant "no limit", which
      was wrong; the Mystical Ability hint exposed the raw `null`/`0` schema jargon.)
    - **Fixed shipped content, which claimed uncapped charges.** The pack builder
      coerced an absent maximum to `0`, so every compendium Mystery and Mystical
      Ability except Fate shipped as an uncapped charge-user and displayed `0/∞`
      instead of ✕ on the Being sheet's Mysteries tab. A new `resolveCharges` builder
      helper preserves `null`, and the authored content declares charges only where
      they are actually used.

    Closes #1129

- c1fa497: **Sheet row context menus: restore the `itemLogic` binding, and label two sheet fields**

    Three sheet defects reported from the same verification pass.
    - **Row ⋮ menus lost every action whose predicate names `itemLogic` (#1132).** A
      context-menu predicate resolves `itemLogic` / `actorLogic` by walking up from the
      clicked element to the nearest `[data-item-id]` / `[data-actor-id]` ancestor — but
      **no sheet emitted `data-actor-id`**, so the item lookup (which goes through the
      resolved actor) always came up empty. `itemLogic` was permanently `undefined` and
      the entry was hidden rather than errored, so the loss was silent: a carried
      armour's **Toggle Worn**, a held weapon's **Attack / Block / Counterstrike**, and a
      combat technique's **Improve with SDR** all vanished from the row menu, leaving
      only the four entries whose triggers reference nothing. The item sheet's Actions
      tab and programmatic `executeAction` were unaffected (they resolve through the
      parent chain, not the DOM), and the carried gate itself was always honest.

        Both sheet bases now stamp `data-actor-id` on the sheet root in `_onRender` (an
        owned item sheet carries its owner's), and `resolveContextItem` /
        `resolveContextActor` additionally fall back to the row's own `data-uuid` — which
        also lets an unowned world/directory item row bind for the first time.

    - **Attribute sheet: Score and Init Dice Formula rendered with empty labels
      (#1105).** `formGroup` labels a field from `field.label`, which Foundry assigns
      only when a `<PREFIX>.FIELDS.<path>.label` key exists — and there were no
      `SOHL.Attribute.FIELDS.*` entries at all, so the Properties tab showed two bare
      inputs. Added the four missing keys (new keys only).
    - **Mysteries tab: the `Chgs/Max` and `Notes` headers collided (#1131).** The
      ledger grid has no column-gap, so a fixed column's gutter is its spare track
      width; the uppercased header's 63px glyph box left half a pixel inside its 4rem
      track and read as `CHGS/MAXNOTES`. Widened to 5rem for a legible gap — `Notes` is
      fractional and absorbs it, so the ledger's overall width is unchanged.

    A new e2e spec asserts the **rendered** menu for a carried vs. uncarried gear item
    and a held weapon, and `runtime-contracts.md` documents the sheet DOM markers a row
    surface must emit — a synthetic `closest()` stub supplies the very marker a real
    sheet was missing, so only a live-client assertion can catch this class of break.

    Closes #1132
    Closes #1105
    Closes #1131

- ce90592: **Armor: Protection and Encumbrance are now editable (#1133)**

    The Armor Properties tab gained a **Protection** section with _Blunt_, _Edged_,
    _Piercing_, and _Fire_ inputs bound to `system.protectionBase.*`, and an
    _Encumbrance_ input bound to `system.encumbrance` alongside the other gear
    fields. Both values already drove play — protection is folded onto every covered
    body location and subtracted from an impact, and encumbrance is added to the
    wearer's while the armor is worn — but neither had an editor, so armor built on
    the sheet protected for 0/0/0/0 and could only be corrected by editing the pack
    source or running a script. Edits persist on change like every other sheet field.

- ae1c523: **Actions tab: show each action's icon, and disable the ones that would refuse**

    The **Actions** tab on an actor or item sheet listed every action with a blank icon
    box and a live ▶, even for actions the system would refuse.
    - **Rows render their own icon.** The ledger emitted `<img src="{{action.data.img}}">`,
      but actions carry no image — they declare an `iconFAClass` (the same glyph the
      context menu draws). Each row now renders that glyph, falling back to the schema's
      placeholder when an action declares none.
    - **A gated action reads as gated.** An action whose `trigger` currently refuses it
      (an uncarried item's gear actions, say) is drawn disabled, with a tooltip naming
      the reason — "The item must be carried before this action can be used" — instead of
      an enabled ▶ that silently does nothing. Clicking one anyway reports the refusal
      rather than failing quietly.
    - **New seam:** `SohlAction.isAvailable` / `unavailableReason` answer "would this run,
      and if not, why?" against the action's own documents, and an intrinsic definition
      may declare a `disabledReason` i18n key. The gear carried gate labels every action
      it gates, so the behavior is uniform across gear types rather than special-cased.

    Both sheets now build their Actions tab from one shared helper, so the actor and item
    tabs list and gate actions identically.

    Closes #1135
    Closes #1136

- 89bff92: **Block and Counterstrike no longer offered on a missile-only weapon (#1137)**

    A weapon whose only strike mode was a missile mode — a bow, a sling — still offered
    **Block** and **Counterstrike** while held, and invoking either did nothing at all:
    no roll, no chat card, no on-screen message. The only trace was a console warning.
    The same held for a missile combat-technique Skill, which shares the executor.
    - **The two actions are gated on having a melee strike mode.** `anyMeleeStrikeMode`
      backs a `hasMeleeStrikeMode` getter on `WeaponGearLogic` and `SkillLogic`, and the
      actions' visibility now requires it alongside the existing held / subtype gate. The
      gate is _has at least one melee mode_, not _is melee-only_: a mixed weapon (a spear
      that thrusts **and** throws) keeps offering both, and the strike-mode picker
      resolves which mode.
    - **A request that reaches the executor anyway reports why on screen.** A block or
      counterstrike on a missile mode — from a macro, a chat-card button, or a picker
      that landed on the missile mode of a mixed weapon — now raises a UI warning naming
      the item, the mode, and the test, instead of failing silently.

- 6b31b69: **Fix: an untreated wound's Healing Test now resolves as a Critical Failure instead of being skipped**

    `TraumaLogic.healingCheck` gated its whole per-checkpoint loop on the wound being
    treated, so an untreated wound resolved nothing at all — no test, and therefore none
    of a critical failure's consequences. The rule is that a wound with no Healing Rate to
    test against is resolved as though its roll were a **Critical Failure**, the same way
    its treatment roll is; no die is cast.

    Each elapsed checkpoint on such a wound — untreated, or treated with the Healing Rate
    still undetermined (`null`) — now resolves as a Critical Failure: the Injury Level
    makes no progress, and the wound contracts an infection.

    **Untreated wounds are infection-prone.** The infection branch previously required
    `system.infectable`, which only a Treatment Test ever sets — so no freshly inflicted,
    untreated wound could ever qualify, and the rule would have been inert for exactly the
    wounds it describes. Resolving an untreated wound as a critically-failed treatment is
    the same rule that leaves such a wound exposed to infection, which the `UNTREATED`
    baseline in the logic layer already declared (`infect: true`) without any consumer. It
    now has one.

    Unchanged: an active infection still halts _all_ healing, so a halted wound resolves
    nothing rather than auto-failing, and a wound already at Level 0 is not checked again.
    Recording an explicit Healing Rate of `0` is still a rate and still rolls (against an
    effective mastery level of 0) — it is not the same state as "no rate determined".

    Closes #1146

- 93a0789: **Fix: a null Healing Rate is now the single source of truth for an untreated wound**

    A wound's Healing Rate and its treated state were two independent facts that could
    disagree, and neither reliably meant "untreated". Every new wound was created with
    `healingRateBase: 0`, so the catastrophic real rate `0` doubled as the stand-in for
    "no rate yet"; both outright-heal paths wrote a treatment date and no rate at all;
    and nothing kept the pair in step, so either could be edited into contradicting the
    other.

    The Healing Rate now decides:
    - **An untreated wound has no Healing Rate.** A newly inflicted wound is created with
      `null` rather than `0`. A rate of `0` is a real, dire rate that poor treatment
      produced.
    - **A null rate means untreated, whatever the treatment date says.** `isTreated`
      requires both a rate and a date, so a stray date can no longer make a rate-less
      wound read as treated.
    - **Recording a rate stamps the date.** `TraumaDataModel._preUpdate` sets
      `treatmentDate` the moment the stored rate goes from `null` to a number, so this
      holds for a rate typed straight into the sheet and not only for the treatment
      actions. An update supplying its own date is left alone.
    - **A null rate disables the Healing Rate modifier** rather than reading as `0` —
      the treatment `AfflictionLogic` already gave it, which also revives the Being
      ledger's ✗ rendering for injuries.

    **How an untreated wound's test resolves.** It has nothing to test against, so no die
    is cast: the test is handed the **`00` face** and resolves normally from there — a
    Critical Failure whatever the target, because `00` exceeds every target and ends in a
    critical-failure digit. This replaces the mechanism merged for #1146, which branched
    on the success level directly. The forced value is deliberately not a low one: a `5`
    _succeeds_ against any target of 5 or more, and a literal `0` is a critical
    _success_ against every target. `rollTimedTest` gains a `forcedDie` option and
    `successTest` forwards a caller-supplied `scope.roll` into the result, whose
    `evaluate()` already resolved a supplied die untouched.

    No migration is included — the system is pre-beta, so existing worlds are not
    carried forward.

    Closes #1148

- 88fdfc7: **Theatre of the Mind is readable again: scene state moves to flags (#1155)**

    A scene's Theatre of the Mind toggle could never be observed. A Foundry `Scene` is
    not a typed document — it declares no `hasTypeData`, so it has no `system` and no
    system DataModel can be attached to it however it is registered. `SohlSceneDataModel`
    was therefore never instantiated, `scene.logic` resolved to nothing, and the Theatre
    of the Mind short-circuit in the range measurement could never fire: distances were
    always measured tactically even on a scene the GM had marked TotM.
    - **Scene state lives in flags.** `SohlScene.logic` now wraps a transient adapter
      that reads the `sohl.isTotm` scene flag live, mirroring how the (equally untyped)
      Token document gets its logic. `scene.logic.isTotm` reports the toggle, and
      `scene.setTotm(value)` writes it.
    - **The Scene config's Sohl tab writes the flag** (`flags.sohl.isTotm`) instead of
      the unreachable `system.isTotm`, so the checkbox now persists and Theatre of the
      Mind takes effect: token-to-token distance resolves to zero on that scene.
    - **Removed `SohlSceneDataModel`** and the `CONFIG.Scene.dataModels` registration —
      Foundry ignores both for a Scene. No migration is needed: `system.isTotm` never
      had anywhere to land, so no world holds that value.

- abe2fdb: **The responder's side of an opposed test rolls its own mastery level**

    Answering a contest with **Respond** measured the defender's d100 against an
    **empty** mastery-level modifier instead of the skill or attribute they picked,
    so a contest could not be won on the defender's own competence — the chosen
    skill's Mastery Level never reached the roll.

    `MasteryLevelModifier.opposedTestResume` branched on
    `if (!opposedTestResult.targetTestResult)`, but the `OpposedTestResult`
    constructor **always** materializes a placeholder target side from the target
    token, so that condition was never true. Every Respond fell through to the
    branch meant for re-editing a settled contest, which reused the placeholder —
    carrying a default, empty modifier — and drove it with the **source's** mastery
    level, crossing the two sides.
    - **The discriminator is now "has the target side actually rolled?"** — a new
      `SimpleRoll.isRolled`, since an unrolled die is otherwise indistinguishable
      from a rolled one (both report a `total`). A pending side is rolled fresh; an
      already-rolled one is reused untouched, so resuming a settled contest still
      never re-rolls.
    - **Both paths run against the responder's own modifier** (`this` — the mastery
      level of the skill or attribute the defender chose), and the fresh result is
      parented to the responder's item, so the result card names that skill and its
      effective mastery level rather than the initiator's.
    - **The Additional Modifier from the Respond dialog is honored.** It was
      hard-coded away as `situationalModifier: 0`; it now carries into the roll
      dialog as its Situational Modifier.
    - **The contest's target token carries over** to the freshly rolled side, via a
      new `tokenUuid` on the success-test scope, so the result card still names the
      defender.
    - The target's card is now posted under the **responder's** speaker rather than
      the initiator's.

    The user guide's Respond-dialog description is updated to say that the
    Additional Modifier pre-fills the roll dialog that follows.

    Closes #1164

- e7d8cb8: Fate is now offered on attribute tests, and a skill reports the attributes its Skill Base is built from.

    **Which attributes a skill uses** — `SkillLogic.skillBaseAttrs` reports the attribute shortcodes a skill's Skill Base is _based on_, ordered primary first. It is read off the parsed formula, so it cannot drift from it: when the formula calls `sb(...)`, that call's arguments are the basis, in the order written; otherwise every referenced attribute is. Backing this, `SafeExpression.callArgMemberRefs()` collects member references from a named helper call's arguments rather than the whole expression.

    **Aura no longer over-triggers the no-Fate rule** — a skill was refused Fate whenever `attr.aur` appeared anywhere in its Skill Base formula, including in a term that merely adjusts the result. `sb(attr.str, attr.dex) + attr.aur / 10` is based on Strength and Dexterity and now keeps Fate; only a Skill Base genuinely built on Aura is refused (#1175).

    **Fate on attribute tests** — a Fate Point could never be spent on an attribute test: the card's Fate button was gated on `availableFate`, which existed only on skills, and `AttributeLogic.fateMasteryLevel` was declared but never assigned. Attributes now expose the same eligibility set (a general Fate Point, or one associated with the attribute's own shortcode) and roll against a seeded fate mastery level. The Aura attribute's own test can never be fated, matching the rule for Aura-based skills. Mystical Abilities remain outside Fate entirely (#1106).

    **The Aura fate bonus now actually applies** — the fate mastery level is seeded from the actor's Aura attribute, but skills built it during `initialize`, before any attribute had computed the mastery level it reads, so the bonus was silently always zero. It is now built in `finalize` — the phase the lifecycle documents for exactly this dependency — and an attribute's mastery level is seeded in `evaluate`, so it is settled before any sibling finalizes.

    The Fate spend flow is now shared between skills and attributes as a set of functions over a `FateHost` interface rather than living on `SkillLogic`, deliberately not on their common base class, so a logic type gains Fate only by opting in.

- 68fcc2e: **Weapon sheet: show the stored Encumbrance instead of a blank field**

    The Weapon Properties tab's Encumbrance control bound its displayed value to
    `system.encumbrance`, which `WeaponGearDataModel` does not define — the schema
    field is `encumbranceBase`. The edit persisted correctly, but reopening the sheet
    rendered the input empty, so a weapon's encumbrance read as though it had never
    saved.

    Bind the control to `system.encumbranceBase`, matching the field it edits. Covered
    by a unit test that renders the real properties template and asserts the
    field/value pair for every gear control on the tab.

    Closes #1179

- eb45308: **Complete the Check/Test model: stamp the run record on the test, and fix the stale spec and docs**

    The timed-effect reschedule end-to-end spec still asserted the pre-Check/Test
    behavior — that running a `*Check` performs the effect and then offers the next
    occurrence. Since the Check/Test split, a `*Check` _offers and does nothing else_
    and the `*Test` is what acts and offers, so both of its tests failed against a
    correct system.

    The spec now exercises the real cycle: it asserts the check changes **nothing**
    (no roll, no healing, no schedule), then drives the test both ways — headlessly
    through `scope.schedule`, and by pressing the real **Schedule** button — proving
    that the test's offer is what arms the next check. The rolls are forced so the
    outcome cannot wander into the critical-failure infection path and post a
    competing offer.

    The **Event Queue** reference carried the same retired shape in its worked
    example, which is what a developer would have copied: it now shows the check and
    the test as the pair they are, including the due-time anchor the check hands the
    test, and states that Check/Test is the shape every recurring effect uses. The
    consent-dialog example in the **Testing** guide now drives the test rather than
    the check, since the check no longer opens an offer dialog.

    **The run record follows the act, not the offer**

    `system.lastRun[shortcode]` records "the world time that action last _performed_",
    but every recurring `*Check` carried `recordsLastRun` and no `*Test` did. Since a
    check only posts a card offering the test, the record was stamped when the offer
    went out — claiming the effect had happened even if nobody ever answered the card —
    and the test that actually rolled and changed the wound went unrecorded.

    The flag now sits on the acting half of all eight pairs: `healingtest`,
    `bloodLossAdvanceTest`, `courseTest`, `psycheRecoveryTest`,
    `auralShockRecoveryTest`, and `pallRecoveryTest` on Trauma, and `healingTest` /
    `courseTest` on Affliction. So "when did this last happen here?" now answers with
    the last performance.

    _Existing worlds:_ nothing migrates and nothing breaks — the record is a sparse,
    informational map that no system behavior reads. A world carries whatever
    `lastRun.<check>` entries it already accumulated; new entries are written under the
    test's shortcode (e.g. `lastRun.healingtest` rather than `lastRun.healingCheck`).
    A macro or Active Effect that reads a check's key should read the test's instead.

    Closes #1189
    Closes #1192

- 49aff30: **Correct the `moveFactor` status in the combatant reference**

    _Scene, Token, and Combatant Systems_ claimed `moveFactor` was "stored on the
    combatant but not yet applied", citing #252. That issue shipped:
    `SohlCombatantLogic.computedMove()` multiplies the actor's effective
    `feetPerRound` by `moveFactor`. The two developer docs contradicted each other,
    since the Combat Model page already documented the applied behaviour.
    - The _Movement state_ prose now states that `computedMove()` scales by
      `moveFactor`, and the stale `#252` citation is dropped from both pages.
    - `displayedMedium` is described as the medium the tracker row _reports_ (seeded
      user-set › the actor's `currentMoveMedium` › schema default), with the
      standing caveat that `computedMove` does not yet honor it and always uses the
      actor's active medium — matching what Combat Model already records.

- f400652: **Vehicle `occupants` is typed as the shape it actually stores**

    `occupants` was declared `string[]` on both `VehicleDataModel` and the
    `VehicleData` logic interface, but the schema stores an array of objects
    (`{ actorCodeOrUuid, role, title }`). Code written against the declared type —
    `occupants.includes(code)`, or treating an entry as a bare shortcode — compiled
    cleanly and would have failed at runtime.
    - Adds the exported `VehicleOccupant` interface (handle, role, optional title)
      and uses it for both declarations.
    - The unit test asserted the incorrect string-array shape; because the logic
      harness builds from a plain object it bypasses the DataModel, so the schema
      never contradicted it. It now asserts the stored shape.

    No data change: the schema and the persisted data were always correct — only
    the TypeScript declarations disagreed with them.

- 581619a: **Bring the actor pages up to date with the shared Profile tab**

    The Profile tab added for the Cohort, Vehicle, and Structure sheets left three
    user-guide pages describing a sheet that no longer exists:
    - The tab lists omitted **Profile**, and the Vehicle and Structure pages then
      counted "all four" common tabs — now five.
    - Both pages stated that the sheet "has no movement table, so a vehicle inherits
      the action without offering a control for it" — the exact opposite of what the
      Profile tab now provides. Each page now points at its own movement table, its
      star control, and **Add Movement Profile**.
    - Nothing mentioned the **dossier**. Each page now says what the Profile tab
      carries: the normally-empty Attributes section, the movement rates, and the
      private dossier (distinct from the public description on Facade).

- 6e6edd5: **Correct the Fate rules: an uncapped bump, and the tests Fate cannot touch**

    The Fate page described the mechanic accurately at its core — a post-roll
    success-level bump that never re-rolls, the Fate Test outcome table, and the Fate
    Mastery Level — but was wrong at its boundaries.

    **The cap did not exist.** The page said the improvement applied "up to a Critical
    Success, the best possible result". Success levels continue past a Critical Success
    into the _extended levels_ that `Success Tests` already defines, so a Marginal
    Success carried up two rungs by a critical Fate Test becomes a **CS+1**. The page
    understated what a critical Fate Test buys, and contradicted the page defining
    success levels. It also now states that a fated result cannot be fated again.

    **Three exclusions were missing or understated**, gathered into a new _What Fate
    cannot touch_ section:
    - **Aura-governed tests.** The page said only that Fate "requires an Aura". Fate is
      also withheld from any test _governed_ by Aura — the Aura attribute's own test,
      and any skill whose Skill Base is computed from Aura.
    - **Mystical Abilities.** No Mystical Ability test can be fated, ever. An entire
      category of tests went unmentioned.
    - **Fate Tests.** A Fate Test cannot itself be fated.

    **Choosing which point to spend** is now documented: when several points apply, the
    choice is the player's, with the most restricted point (skill-specific before
    general) offered first so the flexible point is preserved for a test that may have
    no other option.

- 121c7ac: **Release verification fixes: a blank Pall icon, two JSDoc defects, and an order-dependent e2e spec**

    Fixes found while running the full format / build / docs / e2e pipeline ahead of the
    release.
    - **The Trauma "Pall Recovery Test" action rendered a blank icon.** It declared the
      webfont class `ginf-pall`, but no `pall.svg` exists under
      `assets/icons/game-icons/`, so the font build never emitted a codepoint or a
      `.ginf-pall` rule and the class resolved to an empty glyph. It now uses
      `fa-solid fa-heart-circle-check` — the icon its paired hidden `pallRecovery`
      action already carries, matching the convention that every Test/hidden action pair
      shares one icon. It was the only one of the 14 `ginf-*` classes referenced from
      `src/` without a codepoint.
    - **Two JSDoc defects.** `BeingSheet._prepareTraumaContext` carried no JSDoc at all,
      unlike every sibling `_prepare*Context` builder; `BeingLogic.applyMoraleResult`
      documented a `@param level` that had been renamed to `category`, publishing an
      undocumented parameter plus a phantom one. `npm run lint:eslint` is now clean.
    - **`combat-start-target` is no longer order-dependent.** The spec needs the
      automated-attack turn gate to pass before it can assert on target resolution, but
      that gate reads core's `game.combat`, and neither branch of that getter resolved
      reliably: `ui.combat.viewed` is left stale by the intervening `cleanupWorld()`, and
      the `combats.find(c => c.isActive)` fallback is `scene.isView && active` for a
      scene-bound combat — so it also required the spec's own scene to hold the canvas
      view, which headless it loses as soon as another spec creates a scene. The spec now
      pins `ui.combat.viewed` and creates its combat via a new opt-in
      `cy.createCombatWith(tokens, { sceneless: true })`, which reduces `isActive` to
      plain `active`. Both branches then resolve to the spec's own combat whatever ran
      before. Combatants keep their own `sceneId`, so token resolution is unaffected.
    - **`container:<stage> recreate` sweeps a stale Foundry lock.** A container removed
      without a clean shutdown leaves `Config/options.json.lock` behind, and Foundry then
      refuses to boot ("directory is already locked by another process") — turning every
      subsequent `recreate`, and so every `npm run test:e2e`, into a 180-second activation
      timeout. `recreate` now clears the lock after the container is removed, where it can
      only be stale.

    Closes #1217
    Closes #1218
    Closes #1219

- c024f31: **Combat Techniques on the Being sheet Skills tab**

    Combat techniques (a `combattechnique` subtype skill) have a home on the Being
    sheet's Skills tab: once a being has one, it renders as its own **Combat
    Technique** subtype section alongside the other skill subtypes, with the
    section's **+ Add** control to add more. Creating a combat technique seeds its
    default strike mode (as every combat technique does on creation), so the
    technique's own sheet then displays that strike mode on the Strike Modes tab.

    The display subtype order is now a single Foundry-free constant
    (`SKILL_DISPLAY_SUBTYPE_ORDER`) so it is unit-testable.

    Closes #714

- 6827173: **Localize the Combat Category labels on the Skill sheet**

    The **Combat Category** select on a combat Skill's properties tab now shows its
    localized labels (**Melee**, **Missile**, **None**, …) instead of the raw
    localization keys (`SOHL.Skill.Combat.melee`). The control's `formGroup` was not
    passing `localize=true`, so Foundry rendered the choice map's i18n keys verbatim;
    the keys themselves were already present in `lang/en.json`.

    Closes #751

- 63f34ab: **Fix: unchecked checkboxes no longer render as a filled box**

    Follow-up to #756, which did not fully resolve #752. Foundry v13+ does not paint
    the checkbox on the `<input>` itself — it draws a Font Awesome glyph in `::before`
    (`fa-square` unchecked, `fa-square-check` checked) colored by
    `--checkbox-background-color`, and its unchecked square is _filled_, so it reads as
    selected. #756 gave the input its own `appearance: none` border/background box but
    never overrode `::before`, so core's filled glyph kept painting on top — the
    unchecked control still showed a filled/double-square (visible on the Skill sheet's
    Improvement Flag).

    The checkbox now keeps core's glyph-as-control model but draws its own `::after`
    glyph in the SoHL palette: a hollow `far fa-square` when unchecked and a solid
    `fas fa-square-check` (filled box with a knockout checkmark) when checked, with
    core's `::before` suppressed via `content: none`. Because SoHL's `sohl.base`
    cascade layer outranks core's `elements` layer, a single unscoped-state rule
    suppresses core's glyph across unchecked, checked, and indeterminate. This also
    retires the hand-rolled border-and-rotated-checkmark box from the first fix.

    Closes #752

- 8d55cca: **Localize the Sub-type labels on the Trauma sheet**

    The **Sub-type** select on a Trauma's properties tab now shows its localized
    labels (**Injury**, **Fear**, **Shock**, …) instead of the raw localization keys
    (`SOHL.Trauma.SubType.physical`). The control's `formGroup` was not passing
    `localize=true`, so Foundry rendered the choice map's i18n keys verbatim; the
    keys themselves were already present in `lang/en.json`. Parallels the Skill sheet
    Combat Category fix (#751).

    Closes #754

- f546e59: **Weapon strike-mode Atk/Blk/CX now derive from the associated skill**

    On the Being Combat tab, a weapon's strike-mode **Atk**, **Blk**, and **CX**
    columns showed `0` even when the governing skill's mastery level was non-zero.
    Weapon strike modes were only ever seeded with their own flat Atk/Blk/CX
    modifiers and never folded in the mastery level of the skill named by each mode's
    `assocSkillCode`, so the derived rolls stayed at those flat values.

    `WeaponGearLogic.finalize()` now resolves each strike mode's associated skill on
    the wielder and folds its mastery level (base + labeled deltas) into the mode's
    attack, block, and counterstrike modifiers — the same derivation combat
    techniques already use. Unlike a combat technique there is no self-fallback: a
    weapon has no mastery level of its own, so a mode whose `assocSkillCode` resolves
    to nothing keeps only its flat modifiers.

    The two shared steps are now single helpers used everywhere the pattern occurs:
    `applyGoverningMasteryLevel` folds a governing mastery level into a strike mode's
    Atk/Blk/CX, and `resolveAssocSkill` resolves an `assocSkillCode` to its skill on
    the actor. Weapon and combat-technique strike modes, mystical abilities, and
    mysteries all resolve their associated skill through the one null-safe helper.

    Closes #755

- 9646f99: **Fix the Being create-dialog default archetype (was an empty "Giraffe")**

    Creating a Being from the Create dialog now defaults to the **Basic Folk**
    character template — a fully-populated being with a body, attributes, and
    movement — instead of "Giraffe", an empty-bodied creature that happened to win by
    the UUID tiebreak.

    All shipped beings (236 creatures + the character templates) are flagged as
    archetypes at the default priority `0`, and all but Basic Folk have a blank
    shortcode, so none deduped and the default fell to whichever candidate sorted
    first by UUID. Basic Folk is now flagged at priority `1` (`sohl.archetype: 1`), so
    it deterministically wins the create-dialog default while every other being stays
    available in the picker. The archetype marker is still preserved verbatim by
    Import/Duplicate — its value is now `1` rather than `0`.

    Closes #760

- 6698b69: **Fix: show the modifier derivation tooltip on Being Combat and Skills value cells**

    Hovering a derived value on the Being sheet now shows a tooltip describing how
    the value is derived — the base contribution followed by each modifier, e.g.
    `Base +30, SSMod +25` — rendered **above** the row so it no longer overlaps the
    values. A value with no modifiers still summarizes as `Base +30`; a disabled
    value shows `Dsbl`.

    The tooltip is applied to **every** value cell on the Being sheet that displays a
    `ValueModifier`:
    - **Combat tab:** strike-mode **Impact / Atk / Blk / CX** (melee and missile),
      plus **Heft / Reach / Spread** (melee) and **Draw / BR** (missile).
    - **Skills tab:** **EML** and **Fate** (via new `SkillRow` fields
      `emlDeltaLabel` / `fateDeltaLabel`).
    - **Mysteries tab:** mystery **Level** / **Charges**, and mystical-ability
      **Lvl / ML / Charges** (the reported case: the ML cell was blank on hover).
    - **Profile tab:** attribute **score** and **TL**.
    - **Trauma tab:** trauma **Severity** / **Healing Rate**, affliction **Level** /
      **Healing Rate**.
    - **Gear tab:** **Weight / Quality / Durability**.

    Cells whose ValueModifier is flattened to a number in the sheet context builder
    get a matching `*DeltaLabel` field surfaced (attributes, trauma/affliction rows,
    gear rows), mirroring the skills pattern.

    **`ValueModifier` changes**
    - The derivation-summary getter is renamed from `shortcode` to **`deltaLabel`**
      (and the private `_calcAbbrev()` to `_calcDeltaLabel()`) — the old name
      collided with the unrelated document `system.shortcode` identity key. It is a
      computed getter, not persisted, so no data migration is required.
    - `deltaLabel` now leads with the base contribution (`Base +N`) so an unmodified
      value has a meaningful summary instead of an empty one.
    - Fixed a staleness bug where an **enabled** impact could show a stale `Dsbl`
      summary: the base constructor's eager `_apply()` ran before a subclass set its
      own apply-affecting fields (e.g. `ImpactModifier`'s dice `roll`), caching the
      wrong summary. Each modifier constructor now runs its `_apply()` as the
      most-derived class, after all its fields are set.

    **`ValueDelta` change**
    - `ValueDelta`'s identity property is renamed from `shortcode` to **`abbrev`**
      (and the `VALUE_DELTA_ID` registry entries from `{ name, shortcode }` to
      `{ name, abbrev }`) — a delta's short source label is an abbreviation, not the
      document `system.shortcode` identity key, and sharing the term was confusing.
      The `add`/`multiply`/`set`/`floor`/`ceiling`/`get`/`has`/`delete` argument
      named `shortcode` is likewise now `abbrev`. Deltas are never persisted, so no
      data migration is required.

    Closes #769

- f4e518b: **Document the shortcode concept: logical identity within a type**

    The shortcode is how every Actor and Item is logically identified, but that idea was
    only visible in per-field property lists and incidental examples. Documentation now
    states it plainly for both audiences.

    A new user-guide page, **Shortcodes**, explains — jargon-free — that every Actor and
    Item has a shortcode, that it is unique within a type (Being, Vehicle, each Item
    type), and that two documents of the same type sharing a shortcode represent the same
    thing logically even when their ids and values differ. It calls out why this matters
    for matching a world document against its compendium origin. The buried mentions in
    _Creating Actors and Items_, _Item (base properties)_, and _Using Compendiums_ now
    link to it.

    The developer reference `reference/shortcode-integrity.md` gains an **Identity
    semantics** section up front: `(type, shortcode)` is a logical identity independent of
    Foundry `_id` and field values, and that is what makes compendium↔world
    reconciliation, archetype shadowing, and cross-scope lookup well-defined. The existing
    integrity-constraint and `shortcodeDedupe` mechanics are unchanged.

    Closes #771

- 1c9d70d: **Remove the spurious Pull column from the Being combat tab's missile strike modes**

    The missile strike-mode header on the Being sheet Combat tab declared a **Pull**
    column, but `MissileStrikeMode` has no pull-strength field, so the cell was bound
    to `draw` as a placeholder — rendering the same value (and, since #769, the same
    derivation tooltip) as the adjacent **Draw** column. The unbacked Pull column and
    its duplicate row cell are removed; the missile rows now show Draw / BR / MaxVM,
    each bound to its own modifier.

    Closes #773

- 30fe6f4: **Carry the strike mode's flat impact modifier onto the Being Combat tab**

    A weapon strike mode's flat impact bonus (e.g. the Broadsword Cut's `+3`) now
    shows on the Being **Combat** tab and feeds the rolled impact, matching what the
    weapon item sheet already displayed. Previously the Combat tab rendered the flat
    part as `+0` (e.g. `d10+0e` instead of `d10+3e`), and impact rolled from that tab
    was understated by the missing bonus.

    The flat modifier was being routed only into the impact's inner dice roll, which
    the rendered label and the impact roll never read — both derive the flat part
    from the `ImpactModifier`'s `ValueModifier` base, which was never seeded. It is
    now seeded from `impactBase.modifier` (defaulting to `0` when unset), giving the
    flat impact a single home consistent with the modifier model.

    Closes #774

- 990143b: **Show a Target label in the Effects tab**

    The Effects tab on the Being sheet — and the Effects part on every Item sheet —
    now renders a human-readable **Target** for each effect. The row templates bind
    `effect.system.targetLabel`, but `SohlActiveEffectDataModel` never exposed that
    getter, so the column always rendered blank.

    `targetLabel` now maps the effect's `system.scope` (and the documents the effect
    is embedded in) to a localized label: _This {itemType}_ / _This Actor: {name}_
    for a `this` scope, _Actor_ for an `actor` scope, the strike-mode scope label for
    the strike-mode scopes, and the item type's label for an item-kind scope. The
    mapping lives in a Foundry-free helper (`resolveEffectTargetLabel`) so it is
    unit-tested without Foundry.

    Closes #796

- 7582c5b: **Retire the always-visible empty Combat Technique section on the Skills tab**

    The Being sheet's Skills tab is uniformly present-only: empty skill-subtype
    sections are not rendered. The always-visible empty **Combat Technique** section
    that #714 added (with its seeded per-subtype **+ Add** control) is formally
    retired rather than special-cased back in. A being with no combat techniques
    creates its first from the tab's global **Add Skill** footer, whose subtype
    picker includes Combat Technique; once one exists, the Combat Technique section
    renders like every other populated subtype, with its own **+ Add** control.

    Closes #797

- 0c426ec: **Fix: the Façade tab no longer leaks its content onto every Being-sheet tab**

    The Façade tab's portrait and Appearance editor were rendering on **every** tab of
    the Being sheet, stacked above the active tab's own content. `_facade.scss`
    declared `display: flex` directly on `.facade`, which is the `.tab` element itself
    (`<section class="tab facade …">`); that unconditional `display` overrode Foundry's
    inactive-tab hiding (`.tab:not(.active) { display: none }`). None of the other tab
    partials re-declare `display` on their `.tab` element, so only Façade leaked.

    The flex layout is now gated to the active state (`.facade.active`), so an inactive
    Façade tab collapses to `display: none` like every other tab.

    Closes #812

- f8b159c: **Facade tab e2e: target the renamed appearance editor**

    The Being Facade tab spec's _"renders the enriched appearance in the description
    editor"_ test queried the pre-redesign `.facade__description` class, which the
    Facade Manuscript redesign renamed to `.facade__appearance` / `.facade__editor`.
    The stale selectors are updated to assert the enriched appearance text and the
    `system.appearance` prose-mirror binding under `.facade__editor`, matching how
    the Profile tab spec verifies its editor.

    Closes #816

- ea310ae: **Sheets no longer surface the stale-submit "Document creation … is not supported" / "does not exist" error**

    Deleting a document while its sheet is open — a world item, a Being, or an actor
    whose deletion cascades to its embedded items' open sheets — no longer risks a
    spurious red notification (_"Document creation from \_<Sheet> is not supported"_
    for a world document, _"The Actor <id> does not exist in actors"_ for an embedded
    one).

    Every SoHL sheet submits on change, and Foundry deliberately still allows a form
    submit while a sheet is _closing_ (so a field edit blurred on close still saves).
    A `<prose-mirror>` (the Being facade's `system.appearance`, an item's
    `system.notes` / description) commits its content on teardown, firing exactly
    such a change — so closing a sheet whose document had just left its collection
    dispatched a submit Foundry's base handler turned into an error. The shared sheet
    mixin (`SohlDataModel.SheetMixin`, used by both the actor and item sheet
    families) now walks to the document's root and skips a submit whose root has left
    its world collection — the edit has nowhere to land, so it is silently dropped
    instead of erroring. One implementation covers both sheet families and both the
    world-document and embedded-document (actor-cascade) cases.

    Closes #822

- 53574f7: **Fix: disabled sheet controls now read as disabled; the name-edit pencil is always visible**

    On a read-only Being sheet — for example an actor opened straight from the locked
    `sohl.actors` compendium — Foundry disables every form control, buttons included.
    The shared `.icon-button` component had no disabled style, so a disabled button
    looked identical to a live one (same ink glyph, same `pointer` cursor) yet
    silently swallowed clicks — making a control that Foundry had correctly disabled
    look broken instead. Disabled icon-buttons now read as disabled: a muted glyph, a
    `not-allowed` cursor, and no hover affordance (opacity before hue, per the token
    rule).

    The header **edit-identity pencil** compounded the confusion by being invisible
    until the identity row was hovered. It is now always present but low-emphasis at
    rest — discoverable, and reachable on touch and by keyboard — brightening to full
    on hover or focus, and staying dimmed when the sheet is read-only.

    No template, data-model, or handler change; the `editIdentity` action itself was
    never broken.

    Closes #833

- 7d60f4f: **Fix the attack-result card's missing variables (#844)**

    `buildCombatCardData` never supplied several variables the attack-result card
    references, so every card rendered an empty attacker adjustment table and showed
    the victory-stars line as "None". The builder now provides:
    - **`attackMods` / `defendMods`** — each side's mastery-level adjustment rows
      (`{ name, value }` from the modifier deltas); the defender table is empty on an
      uncontested (Ignore) defense.
    - **`vsText`** — the exchange's victory degrees (the difference in success levels)
      rendered as that many stars, empty on a tie.
    - **`defendWeapon`** — the defender's weapon name, so a broken-weapon notice reads
      "`<defender>'s <weapon> broke!`" instead of an empty name.

    These are supplied on both the attack and counterstrike card data.

    The card's **Victory Stars** line is renamed **Success Stars** (on the
    attack-result and opposed-result cards) to match the system's success-star
    terminology.

    The `notes`, `outnumbered`, and `nextSuccessLevelMod` blocks — which referenced
    combat concepts the model does not implement — were removed from the template
    rather than wired to absent data.

- 454fa3f: **Opposed tests render their own card again (#845)**

    An opposed test never rendered an opposed card — it posted a plain
    `standard-test-card`, dropping the **Respond** button so the flow couldn't be
    resumed. Two bugs combined:
    - `SuccessTestResult.toChat` re-set `template: standard-test-card` _after_ the
      `...data` spread, clobbering a caller-supplied template. It now defaults to the
      standard card but **honors a caller's `template`**.
    - `OpposedTestResult.toChat` ignored its own `data` argument (hard-coding the
      request template), so `opposedTestResume`'s request for the _result_ card was
      dropped. It now honors `data.template` / `data.title` (request vs. result card).

    `OpposedTestResult.toChat` now builds **plain, shaped** `sourceTestResult` /
    `targetTestResult` data (title, token, item, mastery-level display fields, roll,
    outcome flags) plus `sourceWins` / `targetWins` and a `vsText` star string —
    required because the delegated `toChat` folds data through `fvttMergeObject`,
    which deep-copies and would strip a live result's getters. A public
    `SuccessTestResult.item` accessor was added for the shaping.

    The opposed-result card's `combatResult` / tactical-advantages section was
    **removed**: nothing in the model produces it (opposed tests carry no
    `combatResult`), and it held the `soureTestResult` typo. The card shows the two
    results, the winner, and the Success Stars, all backed.

- 36ddbeb: **Show the Treatment Result card's outcome warnings (#846)**

    `treatment-result-card.hbs` guards its infection / permanent-impairment / bleeder
    / amputation notes on `infect`, `impair`, `bleed`, and `newInj`/`newSev`, but
    `BeingLogic.performTreatmentTest` never provided any of them, so those warnings
    were unreachable.

    A new pure `treatmentOutcome(aspect, band, code, normSuccessLevel)` helper derives
    every special effect a Treatment Test produces — the Healing Rate, infection
    exposure, bleeder, permanent-impairment eligibility, and (for an `AMP` treatment)
    the new edged wound an amputation inflicts (`amputationInjury`). `performTreatmentTest`
    now feeds those flags to the card, so it displays exactly what the treatment did.
    The persist path (`TraumaLogic.applyTreatmentResult`) consumes the **same** helper,
    so the card and the recorded injury state can no longer drift.

- a2680c0: **Populate the damage card's `data-actor-id`**

    The damage chat card now carries the owning (attacking) actor's id in its root
    `data-actor-id`, matching the sibling attack, injury, trauma-state, and
    rally-offer cards. The builder (`BeingLogic.calcImpact`) previously never set
    `actorId`, so `damage-card.hbs` rendered an empty `data-actor-id=""`.

    Closes #847

- df2bcf2: **Docs: teach "graded success test as data," not subclassing**

    Corrected developer guidance that steered authors toward the bespoke path for a
    new graded/special-result test, when the generic `successTest()` already makes
    that unnecessary. Today's Fate, Shock, and Stumble/Fumble tests all avoided a
    subclass — each is the one generic path fed a `scope.successStarTable` (outcome
    mapping as data), with follow-ups riding the standard card via an optional
    `buttons` entry on `SuccessTestResult.toChat`.
    - **`reference/combat-resolution-pipeline.md`** — the "Extension guidance" bullet
      that said _"New test type: Subclass `SuccessTestResult` … Override `evaluate()`
      and `toChat()`"_ is replaced. It now teaches the `successStarTable` (+ optional
      `targetValueFunc` / `buttons`) recipe as the default and reserves a subclass for
      a test whose **roll math** genuinely differs — new result text or a follow-up
      button is never a reason to subclass.
    - **`how-to/extension-points.md` §3** — adds a worked _"Adding a graded /
      special-result test — pass data, don't subclass"_ section (the `noChat` +
      `toChat({ buttons })` pattern), and rewrites the §3 "Safe extension" bullets to
      point at it instead of _"add new `*Result` types for new outcomes."_
    - **`reference/result-description-tables.md`** — documents the
      `SuccessTestResult.toChat` **card-data contract** (`mlMod`, roll `total`, item /
      actor uuids, `fateScopeJSON`) and the `buttons` follow-up input, so an author
      reposting the card knows which derived fields must be folded in.
    - **JSDoc** — `MasteryLevelModifier.successTest` now enumerates the recognized
      `context.scope` fields (surfacing them on IDE hover and in the API docs), and the
      `SuccessTestResult.ContextScope` interface comment is corrected from the
      misleading _"scope passed to actions that resume a prior success test"_ to its
      real role as the scope for **every** success test.

    Closes #863

- ae05dfe: **Docs: document the Fate mechanic (user rule + developer note)**

    The Fate mechanic had no feature-level documentation for either audience.
    - **New `Rules/Fate.md` journal entry** — the player-facing rule: spend a Fate
      Point _after_ a test is rolled to raise its success level (never a re-roll);
      Fate Points are held as charges on general or skill-specific Fate Mysteries; the
      Fate Test rolls against a Fate Mastery Level (base 50 + ½ Aura, gated by the Fate
      game option and requiring an Aura); and the rung table (CF: lose/+0, MF: keep/+0,
      MS: spend/+1, CS: spend +2 or keep +1). Linked from the Rules index.
    - **Developer mechanism note** in `reference/modifier-model.md` (under _Prior test
      results_) — ties `availableFate` / `fateMasteryLevel` / `fateTest` together,
      documents where points live and the rung→(consume, delta) resolution, and notes
      that Fate sits below the `successStarTable` mapping so it applies to any success
      test via the generic path (no bespoke test type).

    Closes #865

- a661034: **Docs: document Stumble/Fumble resolution (keep-control tests)**

    The docs described when a fumble/stumble mishap is flagged but never the
    keep-control test that resolves it (#851/#852). Added the resolution for both
    audiences.
    - **`reference/body-structure.md`** — a developer note under the mishap-checks
      list: Stumble rolls the better of Agility/Acrobatics (a failure falls prone),
      Fumble the better of Dexterity/Legerdemain (a failure drops the held item); ties
      go to the trained skill; both are offered, never auto-performed; each is an
      ordinary `successTest` fed a `keepControlTable` (cross-linked to the
      graded-test-as-data recipe and the combat mishaps `Set`).
    - **`Rules/Body_Structure.md`** — a player-facing rule extending the existing
      Fumble/Stumble locations paragraph: what each keep-control test rolls, that a
      failure falls prone / drops the item, the better-of-attribute-or-skill selection,
      and that the test is offered on the flagging attack, never imposed.

    Closes #867

- 4b47a77: **Docs: document the universal "Output Description to Chat" item action**

    The shared `outputDescription` intrinsic action every item carries (added with
    #849) was undocumented.
    - **`concepts/macros-and-actions.md`** — a note in the intrinsic-actions section
      that `defineIntrinsicActions` composes up the class hierarchy, so the base Logic
      classes contribute actions shared by **every** document: the `SohlLogic`
      edit/delete pair, plus `SohlItemBaseLogic`'s `SELF`-scoped **Output Description
      to Chat**, built by the pure `buildItemDescCardData` and purely informational
      (no follow-up buttons — the "assist, never act" model at its simplest).
    - **`concepts/sohl-api.md`** — a concrete example on the `document.logic` surface:
      every item's logic carries `outputDescription`, cross-linked to the actions
      section.

    Closes #869

- b2d4f85: **Docs: reframe Rules/Shock.md around the general Shock Test primitive**

    `Rules/Shock.md` framed every shock trigger as injury (and blood loss). Since the
    general Shock Test (#850), any force can drive a shock test by supplying a base SSI.
    - Broadened the intro: injury and blood loss are the common causes, but fear and
      other systemic or psychological forces bring shock on the same way.
    - Rewrote the Shock State Index section around a general **Shock Test**: a cause
      supplies a **base SSI**, the **Shock** skill roll adjusts it (fatigue applies,
      body-part impairment does not), and the adjusted index maps to a state that is
      **offered** to worsen the current one. Documented the no-roll thresholds — base
      SSI below 5 (no shock) and above 10 (immediately Dead) — and presented **injury**
      (location Shock Value + Injury Level) and fear/systemic forces as sources of a
      base SSI, keeping blood loss as a direct state advance. All existing tables and
      the Re-Test / Extended Shock / Coma content are preserved.

    Closes #871

- 065e4e4: **Docs: guided-tours `display: false` and the coach-the-prerequisite pattern**

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

- 8e17237: **Add missing JSDoc `@returns` on two public members**

    `_processSubmitData` (the shared sheet mixin) and `defineIntrinsicActions`
    (`SohlItemBaseLogic`) each carried a JSDoc block with no `@returns` tag, which
    tripped `eslint`'s `jsdoc/require-returns` rule and left the published API docs
    incomplete. Each now documents its return value, and `eslint src/` runs clean.

    Closes #884

- f47a428: **Stop calling the deprecated `ChatMessage.applyRollMode`**

    Every roll logged a Foundry v14 deprecation warning
    (`ChatMessage.applyRollMode is deprecated in favor of ChatMessage.applyMode`,
    removed in v16). The `fvttApplyRollMode` shim now calls `ChatMessage.applyMode`.

    Because v14 also switched from the legacy roll-mode vocabulary
    (`publicroll`/`gmroll`/`selfroll`/`blindroll`) to message-mode keys
    (`public`/`gm`/`self`/`blind`), a Foundry-free `toMessageMode` translation was
    added alongside `CHAT_MODE_LABEL_BY_ROLL_MODE` in `constants.ts`. SoHL keeps
    storing the legacy values (they are serialized in results and back stable lang
    keys); the mapping happens only at the Foundry boundary, with the default
    (system) mode mapping to `undefined` so `applyMode` uses the client's configured
    default.

    Closes #886

- 77be9e1: **Fix Being prototype-token and portrait art in the compendium build**

    The pack builder gave every Being compendium entry the generic `person.svg` for
    both its prototype-token art and its portrait, regardless of the creature's own
    `img:` / `portrait:` frontmatter — only the top-level actor `img` resolved
    correctly. The `resolveImg` helper read `fm.img` internally while two call sites
    passed a bare string, so those reads were `undefined` and fell through to the
    default.

    `resolveImg` is now a pure content→Foundry path translator — an `icons/…` or
    `images/…` content path is rewritten to `systems/sohl/assets/…`, anything else is
    left unchanged. The per-type default is domain-specific (actors default to
    `being`/person, items default per type), so each builder owns its own default map
    and applies it to an empty result. A Being's token and portrait now use the
    creature's own art, and an unspecified portrait falls back to a real image rather
    than a broken/blank one. The item builder now **aborts the build** on a type with
    no default-image entry instead of silently substituting a generic gear icon.

    Closes #890

- 7af3060: **Fix dark-mode visibility: editor text, context menus, and black SVG icons**

    In dark mode several surfaces were unreadable. The Manuscript palette is
    light-first with a dark token swap, and a few surfaces didn't consume the
    adaptive tokens:
    - **ProseMirror editor content** never set its own color, so typed text fell
      through to Foundry's editor default (dark) and vanished on the dark sheet. It
      now pins to `--sohl-color-text-primary`, following the theme like everything
      else (the toolbar was already themed).
    - **Context menus** forced `text-inverse`, which is light in light mode but flips
      to near-black in dark mode — dark text on a dark menu. The menu now paints its
      own adaptive surface (background + foreground from SoHL tokens), legible in
      both themes.
    - **Black-on-transparent icon SVGs** (the portrait and, critically, the Foundry
      compendium/directory thumbnails, which SoHL's scoped CSS cannot reach)
      disappeared on dark backgrounds. Icon SVGs are now themed at build time: a
      `<style>` carrying a `prefers-color-scheme` fill swap (ink → cream) is injected
      as the assets stage, so the adaptivity travels inside the file and reaches the
      compendium `<img>` thumbnails. Source SVGs stay black-on-transparent, so the
      knowledgebase and website are unaffected; only black / default-black shapes are
      recolored, and files with inline `fill` styles are left untouched.

    Closes #893

- 2d98f24: **Fix chat cards being illegible in dark mode**

    Chat cards now carry their own theme-aware parchment ground, so card text stays
    readable in both light and dark mode.

    Foundry paints each chat message on a _fixed-light_ parchment and pins the chat
    log to `theme-light`, but SoHL's design tokens follow the OS / `data-theme`
    swap. The card owned an adaptive ink color but no background of its own, so in
    dark mode the cream dark-mode ink landed on Foundry's always-light ground —
    light-on-light, and the body text and result labels all but vanished.

    `.chat-card` now paints SoHL's parchment texture over the `--sohl-color-bg-sheet`
    paper token with `background-blend-mode: multiply` — the same self-contained
    surface treatment the sheets use — so the card ground follows the palette (light
    vellum in light, dark vellum in dark) and always matches its ink. Chat-card
    buttons gain an adaptive foreground and background too, so they stay legible on
    the now-dark card ground (Foundry's default button color is a fixed dark that
    would otherwise disappear). The fix keys off the unscoped `.chat-card`, so it
    covers every card root — `sohl`, legacy `hmk`, and bare.

    Closes #899

- e6b6689: **Normalize chat-card template roots to the `sohl` namespace**

    Every chat-card template under `templates/chat/` now uses a `sohl chat-card` root
    element. Previously the roots disagreed: 16 used the legacy `hmk chat-card`, 4 used
    a bare `chat-card` with no namespace, and only 3 used the current `sohl chat-card`.
    The `hmk`/bare cards silently missed the `.sohl`-scoped styling (`base/_elements`
    button treatment, the `.sohl` Foundry-core variable remaps), so their theming
    depended on whatever unscoped `.chat-card` rules happened to exist — a latent
    source of light/dark and control-styling drift.

    With every root normalized, card-wide styling can live under `.sohl` scope
    consistently. Cards render identically before and after: the card interior is
    driven by the intentionally _unscoped_ `components/chat` rules (which already
    covered all three variants), the newly-applying `.sohl button` treatment mirrors
    the existing `.chat-card button` rule, and no card template contains the form
    inputs the other `.sohl`-scoped element rules target.

    Closes #900

- ac6c39f: **Chat cards blend into Foundry's always-light chat log**

    Foundry pins the chat log to light in both light and dark mode — every message is
    painted on a fixed-light `/ui/parchment.jpg` and the message frame is not the
    system's to theme. The previous fix themed only the card interior, so in dark mode
    a dark vellum card floated inside Foundry's light-grey frame (and sat
    inconsistently next to Foundry's own light system cards).

    The card now `light-lock`s its `--sohl-color-*` tokens and drops its own parchment
    ground, so it inherits Foundry's light message ground and stays stable in both
    modes: legible dark ink, with SoHL's identity carried by typography (small-caps
    titles, ruled bands, rubric-red pass/fail) rather than a ground texture that flips.

    Closes #903

- 298a953: **Restore critical successes and failures on standard tests**

    Standard success tests (attribute, skill, mystical ability) never showed a
    critical outcome — every result rendered as a plain _Success_ or _Failure_, even
    when the roll ended in `0` or `5`.

    `MasteryLevelModifier` had dropped the canonical multiple-of-5 crit-digit default
    in the TypeScript port, initializing both `critFailureDigits` and
    `critSuccessDigits` to empty lists. With no crit digits, `critAllowed` was always
    `false`, so `SuccessTestResult.evaluate()` could only ever produce marginal
    outcomes and the plain _Success_/_Failure_ description. Only timed tests, which set
    the digits explicitly, crit correctly.

    Both lists now default to `[0, 5]`, matching the HârnMaster rule (a roll ending in
    a multiple of 5 is a critical — critical success if it succeeded, critical failure
    if it failed, and a roll of `100` is a critical failure). A test that wants no
    criticals can still pass an explicit empty list.

    Closes #908

- 40be31c: **Being sheet ledger styling polish (Manuscript)**

    The Being sheet's shared `.ledger` table now reads consistently in the Manuscript
    direction across every tab (Skills, Combat, Trauma, Mysteries, Gear, Profile).
    - **Transparent icon wells** — the opaque bordered "stamp" box behind each row
      icon is gone, so item/skill icons sit as black-on-transparent line art directly
      on the vellum; the icon is a touch larger.
    - **Larger, more compact rows** — head/row/cell/notes fonts are slightly larger
      with a tighter row rhythm.
    - **Centered numeric headers** — a new `ledger__head-num` modifier centers a
      column header over its column. It is applied to every numeric column across the
      Being ledgers (Skills SB/ML/Index/EML/Fate, Combat strike-mode and body-location
      stats, Trauma Sev/HR/Bld and affliction Level/HR, Mysteries Level/ML/Charges,
      Gear Qty/Weight/Qual/Dur, Profile affiliation Level), so headers line up over
      their centered values. Name and Notes columns stay left-justified and clip with
      an ellipsis on overflow.
    - **Centered enum text** — a new `ledger__cell--text-center` modifier centers a
      short prose/enum value in its column while keeping the body (non-mono) font.
      Applied to an Injury's Aspect and to Gear's Type; longer name/prose columns
      (Area, Skill, Source, Affiliation society/office/title) remain left-justified.
    - **Affliction Level is numeric** — after the Trauma migration an affliction's
      Level is always a plain number, so it now uses the centered numeric cell instead
      of the left-aligned text cell.
    - **Faint search placeholder** — the search inputs' placeholder text (e.g.
      "Search Skills") renders as a light prompt rather than near-black input text.

    All of the above live on the shared ledger component and its templates, so the
    tabs stay visually consistent.

    Closes #911

- 0107396: **Fix SVG icons rendering invisible when the OS appearance and Foundry theme disagree**

    The bundled icons are `<img>`-embedded SVGs whose fill follows a build-injected
    `@media (prefers-color-scheme: dark)` swap, which resolves from the element's used
    CSS `color-scheme`. Foundry stamps `color-scheme` from _its own_ UI theme onto the
    enclosing chrome, but SoHL's sheet surface themes from the OS — so whenever the two
    disagreed (e.g. an OS-dark viewer running Foundry's light theme), the icon fill
    matched the wrong scheme and portrait / ledger icons rendered **invisible** on the
    first render, only reconciling after a theme toggle.

    SoHL's own scoped surfaces now pin `color-scheme` to the same OS / `[data-theme]`
    signal their colour tokens already use (`light dark` on `.sohl`, `light` on
    light-locked surfaces such as chat cards and the print view), so `<img>` icon fill
    and the vellum ground always agree. The pin is scoped to `.sohl` — never `:root` —
    so Foundry's own windows and the compendium keep following Foundry's theme, where
    the icons correctly track the themed chrome they sit on.

    Closes #917

- 6dbe23a: **Polish the settings "Game System" section**

    Follow-up refinements to the branded settings-sidebar section:
    - The section title regains its **flanking divider lines** and now matches the size
      of the neighbouring "Settings and Configuration" header. (The previous centering
      shrank the `h4` to its text, collapsing the `width: 50%` divider lines.)
    - The **version** sits lower, with breathing room from the emblem, and is rendered
      in the sidebar's **bold sans** face rather than a monospace one.
    - The external **links are larger** and separated by a middot — with the separator
      clipped at wrapped-line edges, so a dot only ever appears between two links on the
      same line, never dangling at a line's start or end.
    - "API Documentation" is shortened to **"API Docs"** so the link row wraps tighter.

- 90009e5: **Attribute cards: centered content, six across**

    The Being sheet's **Profile → Attributes** score cards now center their contents
    (name, score value, descriptor, and TL line) and are sized to sit **six across**.
    The container's `auto-fill` track — which produced variable, oversized cards — is
    replaced with a pinned six-column grid, matching the `grid-6col` layout the markup
    already declared. The ⋮ context-menu control moves to the card's top-right corner
    so the centered name never pulls off-center.

    Closes #922

- 8cb7440: **Attribute cards: stable context menu + a Success Test action**

    Two fixes for the attribute cards on the Being Profile tab, reported together.

    **Context menu no longer shifts the card (#924).** Opening a card's ⋮ menu used
    to force `position: relative` onto the trigger element — a leftover in
    `SohlContextMenu._setPosition` from Foundry's original in-target positioning.
    SoHL instead appends the menu into the `.application` container and positions it
    with container-relative coordinates, so the trigger's own position is never read;
    the forced `relative` only dropped the absolutely-positioned corner ⋮ back into
    flow, shoving the card's text, and — because nothing cleared the inline style on
    close — the shift was permanent. The mutation is removed, so every context-menu
    trigger (attribute, body-zone, body-part, body-location, effect) stays put.

    **Attributes can run a Success Test (#925).** Every attribute has a Target Level
    (its mastery level, effective score × 5, the "TL" shown on the card) and is now
    rollable as a Success Test against it from the attribute context menu, exactly the
    way a skill is. `AttributeLogic` gains a `successTest` intrinsic action and
    executor delegating to `MasteryLevelModifier.successTest`.

    Closes #924
    Closes #925

- da110b9: **Fix: Trauma sheet's Physical fieldset now renders for injuries**

    The Trauma item sheet's **Physical** fieldset (impact aspect, body location,
    blood-loss interval) never appeared. `templates/item/trauma-properties.hbs` gated
    it on `{{#if (eq system.subType "physical")}}`, but there is no `"physical"` value
    in `TRAUMA_SUBTYPE` — the physical-harm sub-type is `"injury"`
    (`TRAUMA_SUBTYPE.INJURY`), a leftover from a `physical` → `injury` rename. The
    comparison was always false, so those controls were unreachable.

    The fieldset is now gated on the `injury` sub-type, so an injury's aspect / body
    location / blood-loss interval are editable again while descriptive conditions
    (which carry no damage aspect) correctly omit them.

    Closes #927

- 0f5846f: **Themed default icons for freshly-created items**

    An item created without an explicit image — most visibly a Trauma or Affliction
    added from the Being sheet (e.g. **Add Trauma**) — no longer falls back to
    Foundry's white `icons/svg/item-bag.svg`, which was invisible on the light
    Manuscript sheet and did not adapt to theme. `SohlItem.getDefaultArtwork` now
    gives every known item type the same themed `systems/sohl/assets/icons/**`
    default the compendium builder already applies to pack content (Trauma → wound
    icon, Affliction → sick icon, and so on), so the icon renders dark ink in light
    mode and cream in dark. Unknown or `base`-typed items still fall back to
    Foundry's default.

    The per-type default map is now a single framework-free source of truth
    (`src/utils/default-item-art.mjs`), shared by both the runtime and the pack
    builder so the build-time and runtime defaults can no longer drift apart — which
    is what left runtime creation on the white bag in the first place.

    Closes #932

- 20a52c0: **Localize calendar dates and unify the modifier disabled-reason contract**

    Fixes three rendering defects where an i18n **key** reached the UI verbatim.

    _Calendar dates (#941, #944)._ The SoHL-calendar branch of the default formatter
    (`formatDefault`) emitted the month name and era abbreviation **raw**, so a
    non-null world-time date rendered as e.g.
    `1 SOHL.Calendar.Default.Month.0.label 1SOHL.CALENDAR.DEFAULT.EraAbbr 00:00:00`.
    Both are now localized — exactly as the generic (foreign-calendar) branch already
    localized the month — so a date renders as `1 Nuzyael 1TR 00:00:00` everywhere a
    world-time date is shown (the `datePicker` / `displayWorldTime` helpers,
    `sohl.calendar.format(…, "sohl.default")`). `localize` is idempotent on
    already-plain text, so calendars whose names are literal strings are unaffected.

    _Modifier disabled reason (#948)._ `ValueModifier.disabledReason` was assigned two
    different kinds of value across the codebase — plain English in some places, an
    i18n key in others — and no render path localized it. It now has **one contract**:
    the stored/serialized value is always an i18n **key** (or `""`), keeping serialized
    data language-neutral, and a new `disabledLabel` getter localizes it for display.
    Every assignment is reconciled to a key (with matching `lang/en.json` entries), and
    `chatHtml` now surfaces the localized reason for a disabled modifier instead of
    rendering empty.

    Closes #941
    Closes #944
    Closes #948

- d749f6a: **Localize displayed values and labels in chat cards, dialogs, and action ledgers**

    Several templates displayed enum **values** and static **labels** as raw English
    or raw i18n keys, so a non-English `lang` saw untranslated text (and one dialog
    showed the localization key itself). All English text in the affected templates now
    routes through `lang/en.json`.
    - **Damage aspect** — the six combat/treatment chat cards (attack, injury, damage,
      missile damage, treatment request, treatment result) now render the localized
      aspect label (e.g. _Edged_) instead of the bare enum value; the two item-sheet
      aspect `formGroup`s gained `localize=true`; and the Perform-Treatment-Test dialog
      now shows localized aspect options rather than the raw `SOHL.ImpactModifier.Aspect.*`
      key strings.
    - **Action sort-group** — the Item and Actor _Actions_ ledgers localize the Group
      column value (via the `SOHL.ContextMenu.SortGroup.*` enum) and the column headers.
    - **Remaining hardcoded text** — field labels, section legends, buttons, tooltips,
      and note sentences in those templates plus the macro-config dialog are now
      localized. Interpolated strings (subtitles, "Calculate {target} Injury", the
      amputation/shock notes) use `game.i18n.format` placeholders.

    New keys are added under `SOHL.Chat.*`, `SOHL.Dialog.*`, and the existing
    `SOHL.Actions.*` namespace; no existing keys were renamed. The Node render harness's
    `localize` helper now performs the same `{placeholder}` substitution Foundry does,
    so interpolated card/dialog text can be asserted in unit tests.

    Closes #951

- 4049ce1: **Remove orphaned damage / strike-mode dialog templates**

    Deleted `templates/dialog/damage-dialog.hbs` and
    `templates/dialog/strike-mode-dialog.hbs`. Both were pre-TypeScript-rewrite
    leftovers, referenced by no `renderTemplate` call, dialog builder, or preload
    glob, and their entire template context (`const.ASPECTTYPES`, `const.IMPACTDICE`,
    `const.ZONEDICE`, `const.PROJECTILETYPE`, `askImpact`, `impactAspect`) exists
    nowhere in `src/`. The reported dead aspect `<select>` (iterating the undefined
    `const.ASPECTTYPES`) was a symptom of the whole template being unwired, not a
    binding to repair — so the templates are removed rather than pointed at a
    context that does not exist. Editing damage / strike-mode values remains a
    future feature that would ship its own dialog and context builder.

    Closes #952

- f5b5bf9: **`subType` is always required, never defaulted — across every item type**

    Every subType-bearing item type now declares `subType` as `required` with no
    `initial`: a document must state its kind at creation, and no default is ever
    silently substituted. This locks the item taxonomy ahead of the planned
    Being-centric beta schema-freeze. Existing worlds are unaffected — every stored
    item already carries a `subType`.
    - **DataModels made `required` (no default):** `Skill`, `Trauma`, and
      `ProjectileGear` (were `initial`-defaulted to _social_ / _injury_ / _none_).
      `Mystery`, `MysticalAbility`, `Affliction`, `ConcoctionGear`, and the embedded
      action `subType` were already required.
    - **Pack builder enforces it:** the new `requireSubType` helper throws when a
      content file omits `subType`, instead of the old per-builder fallback (`""`,
      `"social"`, `"physical"`). A missing subtype is now a build error, surfaced at
      compile time rather than shipped as an invalid (typeless-fallback) item. The
      `mystery` builder, which previously emitted no `subType` at all, now sets it.

    **Also** — reconciled the Mystery / Mystical-Ability subtype documentation with
    the enums: dropped the phantom **Birthsign** entry from `MysticalAbilityLogic`
    (birthsign is a _Mystery_), rewrote `MysteryLogic`'s stale subtype list to the
    seven real subtypes (the _Fate_ invocation is a **Divination** Mystical Ability, a
    per-skill fate bonus is modelled with **Active Effects**, a fate-point bonus is
    deferred), and corrected the `BLESSING`/`BUFF`/`FATE`/`GRACE`/`PIETY` enum
    descriptions.

    Closes #955

- 8b0983a: **Label the Mystical Abilities mastery column "EML" on the Being sheet**

    On the Being sheet's Mysteries tab, the Mystical Abilities ledger column that
    shows the mastery-level value is now labelled **EML** (tooltip _Effective
    Mastery Level_) instead of **ML**. The value in that column is the
    `masteryLevel` `ValueModifier`'s _effective_ value — the mastery level after
    modifiers — so **EML** is the correct term, matching the Skills tab and the
    print sheet. The header now reuses the shared
    `SOHL.Skill.Heading.EffectiveMasteryLevel` localization keys.

    Closes #966

- ee3ccb3: **Remove dead Mystical Ability fields (`skillBaseFormula`, `assocMysteryCode`)**

    Two Mystical Ability fields were exposed but consumed nothing, misleading authors
    into thinking an author-entered value had an effect:
    - **`skillBaseFormula`** was rendered as a control on the item sheet but had no
      backing schema field and was never used to compute a Skill Base — a Mystical
      Ability's rolled value derives from `masteryLevelBase`, not an attribute-averaged
      Skill Base. The control (and its sheet-context wiring) is removed.
    - **`assocMysteryCode`** was a real schema field resolved during `evaluate()` into
      an `assocMystery` link, but nothing in production ever read that link. The field,
      its `assocMystery` resolution, and the getter are removed.

    Pre-Beta, so no world migration is required.

- 8148f7a: **e2e: `cleanupWorld` no longer leaks closed sheet DOM between tests.** Deleting a
  document triggers a fire-and-forget sheet close whose asynchronous element
  removal can outlive `deleteDocuments`; with Cypress `testIsolation` off, the
  orphaned sheet lingered in the DOM and accumulated across tests, so a later
  un-scoped global selector (e.g. `switchTab`'s `section.tab[data-tab=…]`) matched
  a stale sheet instead of the current one. `cleanupWorld` now awaits closing the
  sheets of the documents it deletes and sweeps any already-orphaned sheet
  elements, so the third-plus sheet-opening test in a spec is deterministic. This
  was the actual cause of the "Being sheet fails to render its Trauma tab with a
  Fear-subtype trauma" failure — the sheet renders the Fear trauma correctly; only
  the test harness was at fault. (Closes #979.)
- dfef6fc: **Fix stale `@str`/`@dex` `skillBaseFormula` syntax in e2e specs**

    Four Cypress specs still wrote `skillBaseFormula` using the pre-#972 `@str` / `@dex`
    reference syntax. Since #972 the skill base is a value-returning `SafeExpression` over
    the `attr.<shortcode>` namespace, so `@str` fails to parse and `skillBase` resolves to
    `0` — which broke the `being-build` `initSkillMult` test's `skillBase > 0` assertion.
    - `being-build.cy.js` and `skill-value-test.cy.js` → `sb(attr.str, attr.agl)` /
      `sb(attr.str, attr.dex)`.
    - `fate-spend.cy.js` and `gm-result-edit.cy.js` carried the same stale form (harmless
      there because each set `masteryLevelBase` explicitly); updated for consistency so no
      `@`-namespace formula remains in the suite.

    Closes #996

- f069871: **Docs: disambiguate ambiguous `[[Fate]]` / `[[Gear]]` wikilinks in the Rules KB**

    `node utils/build-kb-content.mjs` (part of `npm run build:kb`) failed because bare
    `[[Fate]]` and `[[Gear]]` wikilinks resolved ambiguously — each name maps to both a
    Rules page and a Mystical-Ability / User-Guide page, so the collision-aware resolver
    dropped the fallback and failed the build.

    The five links (in `Rules/README.md`, `Rules/Esoterica/Arcane.md`, and
    `Rules/Strike_Modes.md`) all intend the Rules pages, so they now use explicit
    `section/slug` targets — `[[rules/sohl-fate|…]]` and `[[rules/sohl-gear|…]]` — which
    are unambiguous by construction. The KB content build exits 0 again. Documentation
    only; no behaviour change.

    Closes #998

- 1733025: **Bind action and context-menu predicates to the logic layer**

    Action `trigger` / `visible` predicates and context-menu `condition` predicates
    now bind the **logic layer** instead of the raw Foundry documents, matching the
    Active Effect predicate convention:

    | Predicate                | Was                         | Now                                 |
    | ------------------------ | --------------------------- | ----------------------------------- |
    | Action `trigger`         | `item`, `actor` (documents) | `itemLogic`, `actorLogic`           |
    | Action `visible`         | `element`, `item`, `isGM`   | `element`, `itemLogic`, `isGM`      |
    | Context-menu `condition` | `target`, `item`, `actor`   | `target`, `itemLogic`, `actorLogic` |

    The logic object is the stable, computed view predicate authors want; the owning
    actor is reachable from an item as `itemLogic.actorLogic`. The `hasUsableSkill`
    helper now takes the actor **logic** directly (`hasUsableSkill(actorLogic, …)`).

    _Breaking for author-supplied predicates:_ any `trigger` / `visible` / `condition`
    string that referenced `item` or `actor` must switch to `itemLogic` / `actorLogic`.
    No data migration is required — predicates are re-evaluated at runtime.

    Closes #380

- 7619e41: **Fix the Actions tab header rows on item sheets**

    The "Custom Actions" and "Intrinsic Actions" section headers on item sheets
    (e.g. Skill) rendered as oversized, wrapping Cinzel headings instead of the
    compact grey header-row bar used elsewhere. The shared `.list__*` list styling
    lived only under the Being sheet's `.sohl.being` scope, so item sheets — whose
    Actions tab uses the same markup — fell back to the default heading.

    Add a scoped `.actions-list` style block so the actions lists get the same
    compact header row, column widths, and row chrome the other item lists and the
    Being sheet already have. Closes #708.

- 26b6a5c: **Fix: declare the `sohleffectdata` ActiveEffect subtype so effects get their data model**

    `system.json` `documentTypes` declared an `activeeffectdata` ActiveEffect subtype
    that no data model was registered for, while the add-effect action and
    `CONFIG.ActiveEffect` use `sohleffectdata`. Creating a SoHL effect
    (`type: "sohleffectdata"`) was therefore rejected as an invalid type, and effects
    never received `SohlActiveEffectDataModel` — their `system.scope` / `system.changes`
    were absent.

    Declare `sohleffectdata` in `documentTypes` (a one-line rename) so the type is
    valid and effects get their data model.

    Fixes #145

- 5a33601: **Fix: actor-addressed chat-card buttons never dispatched**

    Chat-card buttons and edit-actions whose handler is an **actor** (`data-handler-uuid`
    = an Actor uuid) were silently dropped: `sohl.ts` calls `doc.onChatCardButton` /
    `doc.onChatCardEditAction` on the resolved document, but `SohlActor` defined neither
    (the handling lived on a dead `static BeingLogic.onChatCardButton` and an unreachable
    `BeingLogic.onChatCardEditAction`). This broke the `createInjury` "Calculate Injury"
    button and the injury card's Shock Roll (`injuryShock`).
    - `SohlActor` now defines `onChatCardButton` / `onChatCardEditAction` that owner-gate
      (#167) then delegate to the shared `dispatchChatCardAction` chokepoint — mirroring
      `SohlItem` / `SohlCombatant` / `SohlTokenDocument`.
    - `createInjury` is now a normal action-dispatched method (`BeingLogic.createInjury`,
      reading `context.scope`) that flows through that chokepoint, replacing the private
      `onCreateInjury(btn)` and the dead static special-case.

    Closes #572

- 4e80092: **Restore Affliction Course / Treatment / Healing action gating**

    The Course Test, Treatment Test, and Healing Test intrinsic actions were left
    unconditionally visible (`visible: "true"`) during the port to the Foundry-free
    logic layer, so the context menu offered them regardless of the affliction's
    state. Their gating is restored against the ported logic:

    | Action         | Now visible when                                                                                               |
    | -------------- | -------------------------------------------------------------------------------------------------------------- |
    | Course Test    | affliction is **active** (not dormant) **and** the bearer has a usable Endurance attribute                     |
    | Treatment Test | affliction is **untreated**                                                                                    |
    | Healing Test   | affliction **heals naturally** (healing rate not disabled) **and** the bearer has a usable Endurance attribute |

    The gating is exposed as the `hasCourse` / `canTreat` / `canHeal` getters on
    `AfflictionLogic` and referenced from the actions' `visible` predicates. The old
    port left a FIXME claiming the original gate involved a `pysn` skill and an
    `isBleeding` flag; that was a mis-copied Trauma gate — afflictions have no
    bleeding concept — so no bleeding gate is applied.

    Closes #65

- deb0794: **Fix Álverrik's Talent reference to resolve during actor-pack compile**

    Álverrik Tárvallor's embedded `tlnt` item referenced `type: arcanetalent` (a
    mystical-ability _subtype_), but embedded items are resolved by document **type**,
    and the `Talent` predefined item compiles as `type: mysticalability` (with
    `subType: arcanetalent`). The `arcanetalent:tlnt` lookup therefore matched nothing
    and the ability was dropped with a `no predefined item` error.

    Changed the reference to `type: mysticalability` — matching how every other actor
    references a mystical ability and how the item is keyed — so Álverrik now embeds
    the Talent ability (subType `arcanetalent`, masteryLevelBase 33). The actors pack
    compiles with zero errors.

    Closes #725

- c8799e5: **API documentation site: namespace-tree rendering, single logic surface, and brand chrome**

    A coordinated overhaul of the generated API reference (api.heroiclands.org) so it
    reads as one coherent, honestly-structured property.
    - **Rendered from the namespace tree.** TypeDoc now documents the API from the
      namespace root (the `sohl` module) rather than a generated flat barrel, so the
      sidebar is the real `sohl.*` tree (Foundry-VTT-style) and a symbol's doc path is
      its actual source and runtime-global location. A plugin roots qualified
      type-reference paths at `sohl` so disambiguated names match the breadcrumb,
      sidebar, and runtime global. The old category-overlay machinery is removed.
    - **A single logic-layer surface.** The five still-published Foundry document
      classes (`SohlActor`, `SohlItem`, `SohlActiveEffect`, `SohlScene`,
      `SohlTokenDocument`) are marked `@internal`, and the logic contracts are re-rooted
      out of the Foundry namespace — author-facing code reaches documents through the
      logic layer, so those classes are uniformly internal.
    - **Strictly generated symbols.** The hand-written guide tree is dropped from the
      API build (that prose now lives in the knowledgebase); the landing page points
      developers to the KB, and rendered JSDoc doc-references resolve to knowledgebase
      URLs instead of broken relative `.md` links.
    - **Shared brand chrome.** A TypeDoc plugin injects the shared Heroic Lands
      masthead, footer, palette, and fonts (matching www and the KB) without forking
      the theme, and fixes the nav dropdown's hover gap plus cross-property links.

    Covers #397, #404, #414, #415, #427, #433, #442.

- 73ce7e3: **Fix: complete the ApplicationV2 item-sheet migration (render + persist edits)**

    Item sheets now render, and all sheets persist field edits on change with no
    button press. Previously every item sheet failed to render
    (`Template part "tabs" must render a single HTML element`) and no sheet saved
    field edits.
    - Add `form.submitOnChange` to the base sheet mixin so `DocumentSheetV2` persists
      a field edit as soon as it changes — fixes both actor and item sheets.
    - Migrate `SohlItemSheetBase.TABS` from the legacy v1 shape
      (`navSelector`/`contentSelector`) to the v13 `ApplicationTabsConfiguration`, and
      render the tab navigation from the core `tab-navigation.hbs` part (mirroring the
      being sheet).
    - Fix the item content-section templates: correct `data-tab`/`data-group`/active
      wiring and replace a non-existent `length` Handlebars helper with property
      access.

    Resolves the render and edit-persistence failures tracked in #141. A few item
    kinds remain (their whole-form submit is rejected when a required `subType` is
    unsatisfied) and stay tracked under #141.

- e334c76: **Item-sheet array editors persist on a real click**

    Fix the shared array-editor **Add** / **Delete** controls (`.add-array-item` /
    `.delete-array-item`) on item sheets, which rendered but did not persist when
    clicked — a genuine click never reached the handler even though invoking it
    directly worked. This affected every list built on the shared editor (the
    Attribute sheet's **Impaired By Roles** and **Value Descriptors**, the Armor Gear
    sheet's coverage locations, and the Mystery sheet's affected skills).

    The controls were bound with per-node `addEventListener` in the sheet's
    `_onRender`; those nodes were detached by a later part re-render, so the SoHL
    listener was no longer on the live control when clicked. They are now wired
    through ApplicationV2's delegated `data-action` mechanism (the same pattern the
    other item-sheet controls use), which dispatches from a single listener on the
    frame that survives every part re-render.

    Closes #734

- 0dee55a: **Correct the Assisted Combat tour text**

    Four wording fixes to the guided tour so it matches the actual UI and behavior.
    - **Step 3** now says to add "four **weapons**" (all four archetypes are _Weapon_
      type) rather than "four items".
    - **Steps 3 and 4** name the bow "**Longbow 125**", matching the archetype label
      the player sees in the Type/Archetype picker and the Held-Items dropdowns
      (previously "Longbow").
    - **Step 4** now teaches that a bow held in one arm _does_ show its **Crush**
      melee mode (a one-arm strike mode) — you can swing a bow one-handed like a
      fragile club — and that only the **Ranged** mode is gated by the two-hand rule.
      The old text implied no strike mode appeared at all.
    - **Step 6** no longer tells the player to hover a value for a calculation tooltip
      _during_ the tour: Foundry suppresses all tooltips while a tour is running, so
      the tooltip is now described as available once the tour ends.

    Resolves #841

- b9de9db: **Fix: enforce automated-combat attacker and target invariants**

    `startAutomatedAttack` now refuses to begin an automated attack when an invariant
    is violated, instead of proceeding regardless (#387):
    - The **attacker** cannot attack while out of the fight — dead, vanquished
      (Foundry-DEFEATED), unconscious, asleep, restrained, paralyzed, frozen, or
      incapacitated (`attackerBlockingStatus` / `ATTACK_BLOCKING_STATUSES`).
    - The **target** must resolve to a combatant in the active combat, and cannot be
      **dead or defeated** — a defeated (killed/surrendered) combatant is no longer a
      valid target (`targetInvalidStatus` / `TARGET_INVALID_STATUSES`).

    Each violation aborts with a player-facing notification. The status predicates are
    pure and unit-tested. These attacker/target invariants are orthogonal to the
    turn gate (only the current combatant may _start_ an attack, added separately);
    out-of-turn **defenses** — a counterstrike or a Tactical-Advantage follow-up — run
    through the defense-resume path and are unaffected by either. The
    `combat-resolution-pipeline` and `combat-model` docs are updated to match the
    wired enforcement (the previously-cited `resolveAttackContext` was dormant).

- 7f547d3: **Being Actions tab**

    Reimplements the Actions tab of the Being sheet (#313).
    - **Grouped display.** Actions from `logic.actions` are split into a **Custom
      Actions** section (GM-authored script actions) and an **Intrinsic Actions**
      section (code-defined, read-only). Hidden-group actions (lifecycle hooks) are
      omitted.
    - **Create bound to a Macro.** The create control asks for an action name and a
      Macro: either an existing world Macro, or `<New Macro…>`, which creates a
      script Macro named after the owner and action (`<owner> <action>`,
      disambiguated with a number) and opens its sheet to author the body. Either
      way, a SCRIPT action (referenced by the Macro's UUID) is appended to
      `system.actionDefs`.
    - **Edit / Remove / Run.** Each custom action row can open its bound Macro's
      sheet (Edit), remove the action from `system.actionDefs` without deleting the
      Macro (Remove, confirmed), or run it. Intrinsic actions can be run.

    Macro authoring is deferred entirely to Foundry's Macro UI; this only builds the
    action list and the bind/edit/remove/run controls.

- 5f5415c: **Being sheet header: per-body-part injury status grid**

    Resolves #464. The header's body-part grid now shows each part's derived
    impairment, colored by severity, instead of a bare shortcode list.
    - **Impairment derivation** (`bodyPartImpairment`, `src/entity/body/impairment.ts`
      — pure and Foundry-free): a part takes the **most serious** injury across its
      hit locations — grievous (`G4`/`G5`) → **unusable**, serious (`S2`/`S3`) →
      **−10**, minor (`M1`) with healing rate ≤ 5 → **−5** — and eases back
      `unusable → −10 → −5 → none` as wounds heal. A **permanent impairment** acts as
      a non-positive floor.
    - **Header grid**: each part renders by **name** (with a stable `data-shortcode`)
      and a status class colored per the rules — none = white, −5 = yellow, −10 or
      worse = blue, unusable = black.
    - `BodyPart` now surfaces its `name` (mirroring `BodyLocation`), which the grid
      and other callers can use.
    - **Permanent impairment** is a new per-body-part `permanentImpairment` field on
      the Being body model (a manually-set, non-positive integer floor; `0` = none).
      It is additive with a safe default, so existing beings need no migration. No
      dedicated editor UI yet — it is set via a data update; a sheet control is a
      follow-up.

    The derivation is shared — the being's health assessment reads the same per-part
    impairment.

    Covered by `bodyPartImpairment` unit tests (severity bands, worst-injury,
    permanent floor), updated `buildBodyPartLozenges` tests, and a
    `being-header-bodyparts` e2e (a grievous injury colors its part unusable; a
    slow-healing minor injury colors it minor; an uninjured being is all-none).

- f4be3d8: **Being Combat tab: readable limb labels and a cleaned-up Body Locations list (#509)**
    - Held-item limb labels show the readable part name ("Right Arm"), not the raw
      part code ("RARMPART").
    - The Body Locations list drops the obsolete Probability column and the
      in-list "Held:" marker (held items are shown by the Held Items dropdowns), and
      its part sub-headers and rows pick up the compact list styling; the filter bar
      is kept.

- 7c0a014: **Fix: Being Façade tab binds to real datamodel fields (`portrait` / `appearance`)**

    The Façade tab (the Being sheet's initial/summary tab) bound its bio image to
    `system.bioImage` and its description editor to `system.description` — neither of
    which exists in the actor schema. The image rendered blank and the editor was
    always empty, with edits silently dropped.

    Point the tab at the existing fields the schema already defines: the bio image
    uses `system.portrait` and the physical-appearance description editor uses
    `system.appearance`. Adds an e2e spec (`facade-section.cy.js`) asserting both
    bindings.

    Closes #303
    Closes #307

- 5c40320: **Being sheet header: Aural-Shock and Fatigue as affliction-derived indicators**

    Resolves #306 (header scope: status toggles). The header's status roster now
    distinguishes toggleable ActiveEffect statuses from affliction-derived
    indicators:
    - Six pills — Sleep, Prone, Stun, Incapacitated, Unconscious, Dead — remain
      click-toggleable (`toggleStatus` → `Actor#toggleStatusEffect`).
    - **Aural-Shock and Fatigue** are now read-only indicators, lit when the actor
      has an active affliction of that subtype (`level.effective > 0`), matching the
      prototype (which drove them from afflictions, not statuses; Fatigue is not a
      `STATUS_EFFECT`). They render as non-interactive pills
      (`.sheet-header__status--indicator`).

    The health bar and per-body-part status grid — which need derived data that does
    not exist yet — are split out of #306 into their own issues (populate
    `BeingLogic.health`; derive per-part injury status) and are not part of this
    change.

    Covered by `buildStatusPills` unit tests (roster order, toggleable vs indicator,
    affliction-vs-status lighting) and a `being-header-status` e2e (Prone toggles on
    click; the Fatigue indicator lights read-only from an active affliction).

- 83f751a: **Being health: an impairment-based, banded assessment**

    Resolves #470. SoHL has **no hit points**, so a being's health is a banded
    assessment of capability — Excellent / Good / Fair / Poor / Morbid / Dead — read
    off **impaired body parts**, not a points pool. An injury that impairs no part
    has no effect on health.
    - **Per-part impairment** (`bodyPartImpairment`) yields a **tier** — NONE / MINOR
      (−5) / SERIOUS (−10) / GRIEVOUS (≤ −11) — and a **`usable`** flag. Impairment is
      the worst-of {permanent impairment, each injury}, never additive; a grievous
      injury makes the part _unusable_ (no number), while permanent impairment tiers
      it but never unuses it. A `permanentlyUnusable` body-part field (a withered or
      amputated limb) also unuses it. `BodyPart` exposes `isCritical` (holds VITAL or
      CORE).
    - **`BeingLogic.health`** is `{ value, max, band }`: `max` is always 100; `value`
      is the physical-impairment ceiling — bucket impaired parts by (critical?, state,
      count) and take the minimum — floored at 1 for a living being and 0 only when
      `dead`; `band` is the mapped label. The header shows the band label (with the
      `%` as a tooltip).

    Fatigue, fear, and shock will later impose their own ceilings, composing by `min`
    with this physical one.

    Covered by unit tests (`bodyPartImpairment` tiers/usable/permanent,
    `physicalHealthCeiling` table + worked examples, `healthBand`, `deriveHealth`,
    `BeingLogic` health, `BodyPart` isCritical/permanentlyUnusable) and a
    `being-header-health` e2e. The Being user-guide and `body-structure.md` document
    the banded model.

- 6cafc38: **Make the Being sheet's compact list-row styling actually apply (#515)**

    The compact-row rules added for #515 were authored as `.being { … }` inside
    `components/_items.scss`, which is loaded under the `.sohl { }` wrapper, so they
    compiled to the _descendant_ selector `.sohl .being …`. ApplicationV2 places
    `sohl` and the `being` sheet-type class on the **same** sheet-root element, so
    that descendant selector never matched and the rules were dead CSS — Being list
    names still rendered as oversized Cinzel headings (multi-word trauma names
    wrapped to three lines).

    The styling now lives in its own `components/_being.scss`, loaded from `sohl.scss`
    under the **compound** `.sohl.being` selector (the same same-element trap the
    sheet frame avoids via `.sohl.sheet`). Column widths are keyed on `.list__items`
    so the header row and the data rows share them and their columns line up.

- e87ca4f: **Style the Being sheet's non-fieldset list headers (#515)**

          The compact list-header styling added for #515 was scoped to `fieldset

    .list**header`, but the Gear ("On Body") and Combat weapon-group lists put their
  `.list**header`inside a`.list`div rather than a`<fieldset>`. Their header's
  `.list**name`heading therefore rendered at full Cinzel size with no header bar.
  The rule is now keyed on`.list**header` directly, so every Being list header
    gets the same compact label bar.

- f26c8bc: **Being Mysteries tab: Mysteries section**

    Reimplements the Mysteries section of the Being sheet's Mysteries tab (#310).
    - **A header per subtype, always shown.** Each mystery category (Birthsign,
      Blessing, Buff, Fate, Grace, Other, Piety) now renders its own section header
      in declared order, whether or not the being has any mysteries of that kind.
    - **Charges as ValueModifiers.** `MysteryLogic.charges.value` and `charges.max`
      are always `ValueModifier`s; a `null` source value leaves the modifier
      disabled, which drives the display rules (first match wins): `max` disabled →
      "×" (no charges); `value` disabled → "∞" (infinite remaining); `max` 0 →
      "_value_/∞" (infinite available); otherwise "_value_/_max_". Level shows "×"
      when `levelBase` is `null`.
    - **Associated skill.** Adds an `assocSkillCode` field to the mystery data model
      and resolves it to an `assocSkill` (a `SkillLogic`) during `evaluate`, shown in
      the section's Skill column.
    - **Subtype labels.** Adds the `SOHL.Mystery.SubType.*` localization keys the
      subtype choices reference (also fixes the item-sheet subtype dropdown).

    Remaining Time (called for on Blessing/Fate) is tracked separately and not yet
    wired.

- f26c8bc: **Being Mysteries tab: Mystical Abilities section**

    Reimplements the Mystical Abilities section of the Being sheet's Mysteries tab
    (#311).
    - **A header per subtype, always shown.** Each ability category (Spirit Rite,
      Spirit Action, Spirit Power, Ritual Devotion, Divine/Arcane
      Incantation, Arcane/Spirit Talent, Alchemy, Divination) renders its own
      section header in declared order, whether or not the being has any abilities of
      that kind, with Skill / Level / ML / Charges / Improve / Notes columns.
    - **Charges as ValueModifiers.** `charges.value`/`charges.max` are always
      `ValueModifier`s with `null` → disabled, driving the same ×/∞ display rules as
      the Mysteries section. The data model's `charges.value`, `charges.max`, and
      `levelBase` are now nullable so "no charges", "infinite", and "no level" are
      representable.
    - **Mastery level uses `MasteryLevelModifier`.** `masteryLevel` is now a
      `MasteryLevelModifier`. When the ability names no skill it uses its own
      internal mastery level (`masteryLevelBase`); when a skill is associated,
      `finalize` copies the skill's mastery level in via `addVM`, so the ability's
      own modifiers still stack on top rather than being replaced.
    - Cleans up a double `level` assignment in `initialize`.

- 9513d56: **Being sheet: working per-tab search filters, and fix the search normalizer that hid every row**

    Resolves #312. The Being sheet's list tabs now have live search-criteria inputs
    that filter their lists as you type.
    - **New inputs.** Adds the missing `search-criteria` boxes on the **Profile**
      and **Mysteries** (mysteries and mystical abilities) tabs. Each list's
      groups are wrapped in a single filter container so the search spans _all_
      subtype groups, not just the first — matching the existing Skills / Combat
      body-locations / Gear inputs.
    - **Filtering actually works now.** `SohlLocalize.normalizeText` used a
      non-negated character class (`/[%\x20-\x7E]/`) that matched _printable ASCII_
      and blanked every letter to a space, so the regex comparison never matched and
      every list-search filter hid all rows on any query. Negating the class
      (`/[^\x20-\x7E]/`) folds only non-ASCII characters, as the docstring intends;
      this repairs search across all tabs (Skills, Gear, body-locations, effects,
      and the new Profile/Mysteries inputs).
    - **Trauma tab has no search** (injuries and afflictions), by design — the
      previously-scaffolded afflictions search input and its filter registration are
      removed; the affliction create-control is kept.

    Covered by a new `normalizeText` unit suite (the ASCII-folding regression) and a
    `being-search-filters` e2e spec (the Profile filter works across groups; the
    Mysteries inputs render; the Trauma tab exposes no search).

- f4be3d8: **Restore the Being Profile attribute cards (#507)**

    Attributes rendered as loose unstyled text because the template emits
    `.attribute-score__*` BEM classes while `_profile.scss` still targeted the
    pre-rename `.attribute`/`.value`/`.label`. The card styling is re-keyed on the
    BEM classes — a dense six-column grid of compact bordered cards (name + ⋮
    header, large bold score, descriptor, and a `TL:` footer).

- 2314a03: **Being sheet: fix dark-mode header/ground theming (#810)**

    Three Manuscript theme-token regressions surfaced in dark mode (and, for two of
    them, in light mode), fixed together:
    - **The parchment ground now follows the theme.** `.window-content` (and the macro
      hotbar) painted a fixed light `parchment.jpg`, so in dark mode the token-colored
      surfaces (header band, portrait, editor) darkened while the ground stayed bright —
      dark panels floating on a light page. The single texture is now painted over the
      `--sohl-color-bg-sheet` token with `background-blend-mode: multiply`: light mode is
      unchanged (the near-white token leaves the texture as-is), and dark mode multiplies
      it down to a dark, subtly-grained vellum that darkens in lockstep with the palette.
    - **The header name is legible in light mode.** As an `<h1>`, `.sheet-header__name`
      inherited Foundry's `--color-text-light-primary` — which `.sohl` remaps to
      `--sohl-color-text-inverse` (cream in light mode) — leaving the character name
      near-white and unreadable on the light vellum band. It is now pinned to
      `--sohl-color-text-primary`, so it reads dark in light and cream in dark like the
      rest of the sheet.
    - **The rich-text editor toolbar follows the theme.** Foundry paints the ProseMirror
      menu bar with its fixed dark `--menu-background` (`--color-cool-4`, a plum
      near-black), so it stayed dark in both themes and clashed on the light vellum. The
      bar's background and its button icons now point at SoHL tokens
      (`--sohl-color-bg-stamp` / `--sohl-color-text-primary`), so the toolbar re-themes
      with the palette. This is shared by every ProseMirror editor, so each Item sheet's
      Description tab is retinted too.

- f4be3d8: **Show icons on Being list rows (#508)**

    Skill rows (and injury/gear/affiliation rows) rendered without their icon: the
    skills row emitted no image element, and the shared `.list__image` had no size so
    it collapsed. `buildSkillGroups` now carries each skill's `img`, the skills
    template renders it, and `.list__image` is sized in the Being styles so every
    list row shows its icon.

- f4be3d8: **Distinguish the Being Trauma add controls (#510)**

    The Injuries header's two add controls both read as a plain "+". They are now
    distinct: a file-plus "Create a trauma item manually" and a d20 "Add an injury by
    rolling location & severity", with clearer tooltips. (The injury Area column
    already resolves from the body location for rolled injuries; a blank Area only
    appears for a manually-created trauma with no location set.)

- 2300ca4: **Fix Mystery & Mystical Ability properties tabs binding to nonexistent schema fields (#815)**

    The Mystery and Mystical Ability item-sheet Properties tabs rendered `formGroup`
    controls bound to schema fields that do not exist, so the controls silently
    rendered nothing (Foundry's `formGroup` no-ops on an `undefined` field):
    - `mystery-properties.hbs` and `mysticalability-properties.hbs` bound a `Domain`
      control to `system.domainCode`, a field neither DataModel defines (the
      Domain-registry integration is still incomplete).
    - `mysticalability-properties.hbs` additionally bound a control to
      `system.isImprovable`, a mis-named duplicate of the real `improveFlag` field
      (already rendered in the same tab).

    Both phantom controls are removed. Node HTML-render tests assert the dead
    `system.domainCode` / `system.isImprovable` references are gone while the real
    controls still render, matching the coverage added for #808 and #709.

- e59226d: **More legible chat/result cards**

    Chat cards now read with the bold, high-contrast character of the earlier cards.
    Body text switches from the light Cormorant Garamond display serif (weight 400) to
    **Signika at weight 500**, so labels and values carry more ink; the success/failure
    result text and colored roll values are now **bold**, so the saturated red/green
    hues no longer read as washed-out pastels. The card body also owns an adaptive
    `text-primary` color, keeping labels and values legible in **dark mode** (they
    previously fell back to default black and were nearly invisible on the dark
    surface).

    Closes #895

- 5910ffa: **Add `no-floating-promises` and `await-thenable` ESLint rules**

    Two new type-aware rules catch real async correctness bugs:
    - **`@typescript-eslint/no-floating-promises`** — every Promise must be `await`ed, returned, or explicitly marked `void`. Catches fire-and-forget Promise chains that silently swallow rejections.
    - **`@typescript-eslint/await-thenable`** — flags `await` applied to a non-Promise value, which is always a logic bug.

    **Fixes found by the new rules:**
    - `SohlDataModel` and `BeingSheet` — `super._onRender()` was called without `await` in an `async _onRender` override, meaning drag-drop rebinding and filter rebinding ran before the parent render completed.
    - `SohlLogger` — `await new SourceMapConsumer(rawMap)` awaited a non-thenable constructor; `await` removed.
    - All `this.render()` calls in UI event handlers and `action.execute()` / `doc.update()` calls in sync callbacks are explicitly marked `void` to signal intentional fire-and-forget.

- 14de93f: **Style the `clearableNumberInput` clear affordance**

    Add `scss/components/_clearable-number.scss` (scoped under `.sohl`, mirroring the
    `_date-picker.scss` pattern) and wire it into `scss/sohl.scss` in the
    `sohl.components` layer. The `clearableNumberInput` helper's wrapper
    (`.clearable-number`) now lays out its number input and `×` clear control
    (`.clearable-number__clear`) as a flex row — the input flexes to fill, the clear
    sits adjacent with spacing, a muted default colour, `cursor: pointer`, and a
    `hover`/`focus` danger-colour state. Previously neither class was styled, so the
    `×` rendered as an unstyled inline anchor next to the input (visible on the
    affliction and trauma item sheets). Styling only; the `clearField` behaviour was
    already working.

    Closes #631

- f67f18a: **Automated combat turn gate + Combat Model doc reconciliation (#384)**

    Document SoHL's two combat modes (the user-facing **Combat Basics** guide and the
    developer **Combat Model** doc), and correct the divergences surfaced while writing
    them.
    - **Turn gate enforced.** Automated combat is meant to run off the initiative
      order, but nothing enforced that the attacker be the combatant whose turn it is.
      `SohlCombatantLogic.startAutomatedAttack` (the intrinsic `automatedCombatStart`
      executor both entry points converge on) now aborts, with a UI notice, when the
      attacker is not the active combat's current combatant — via a new pure,
      unit-tested `outOfTurnAttackReason`. Only the current combatant may _start_ an
      attack; out-of-turn **defenses** (a counterstrike, a Tactical-Advantage follow-up)
      run through the defense-resume path and are unaffected.
    - **Dead code removed.** `SohlCombatant.startAutomatedAttack` (a document-level
      wrapper whose docstring wrongly called it "the single entry point") had no callers
      and is deleted.
    - **Combat Model doc reconciled with the code.** Dropped the "turn-start location
      field-name mismatch" caveat (`startLocation` now recorded, #390) and the
      "`moveFactor` is unapplied" caveat (`computedMove()` now scales `feetPerRound`,
      #393; combatant properties table updated); removed the stale
      `allyIds` / `threatenedAllyIds` relationship-state row (those fields don't exist —
      combat relationships are computed); corrected the assisted-impact description
      (`_onRollStrikeModeImpact` dispatches the actor's `calcImpact`); and fixed the
      `injuryButton` and `SohlCombat` group-seeding JSDoc to match the code. The user
      guide, Combat Model concept doc, and Combat Resolution Pipeline reference now
      describe the turn gate and its defense-side exception.

    Closes #384

- 5cd84f1: **Stabilize the `combat-turn-gate` e2e spec against run order**

    The automated-combat turn-gate spec (#384) no longer depends on the ambient,
    viewport-resolved `game.combat` being `undefined` headless — an assumption that
    held only in isolation. Once a preceding combat spec had rendered the combat
    tracker, `game.combat` resolved this spec's active combat with the attacker as
    the current combatant, so the gate passed and the flow warned about the target
    instead of the turn (a full-suite-only failure).

    The spec now pins the combat's current turn to the **defender** and drives the
    **attacker**, so the current combatant is never the attacker and the gate always
    short-circuits with a turn reason, regardless of how `game.combat` resolves.
    Test-only change; the gate logic is unchanged.

    Closes #638
    Closes #644

- 0f59e18: **Fix: register the Combatant data model under `base` so combat works**

    Combatants could not receive `SohlCombatantDataModel`: it was registered under a
    `sohlcombatantdata` subtype that `system.json` `documentTypes` never declared, so
    every combatant fell back to the typeless `base` model with no `system.logic`.
    Group seeding then crashed on the first combatant added
    (`Cannot read properties of undefined (reading 'groupId')`), making combat
    non-functional end to end.

    Register the single combatant data model under the always-valid `base` type (as
    Scene already does). The data model's static `kind` is unchanged, so the
    `COMBATANT_LOGIC` lookup still resolves `SohlCombatantLogic`. Combatants now carry
    their logic, group seeding runs, and turns/rounds advance.

    Fixes #142.

- d7ba98c: **Fix: `computedMove` now applies the combatant's `moveFactor` (#252)**

    `SohlCombatantLogic.computedMove()` returned the being's `feetPerRound`
    verbatim and never read `system.moveFactor`, so the situational move scalar (run,
    difficult terrain, haste, …) was silently dropped even though the field exists to
    scale tactical move. It now returns `feetPerRound × moveFactor` (`moveFactor`
    defaults to `1`, so unscaled behavior is unchanged). `displayedMove` inherits the
    fix via delegation.

- 7771153: **Fix logic-level dialogs on Foundry v14 and consolidate the dialog helpers**

    On Foundry v14, `DialogV2.input` only invokes a callback supplied under
    `ok.callback`, so the callback the old `inputDialog` passed at the top level was
    silently ignored — every form dialog (Add Injury, attack/defense, success test,
    the DataModel array/key-value editors) resolved to raw, untransformed field data
    instead of the caller's result.

    The four near-duplicate helpers (`inputDialog`, `okDialog`, `yesNoDialog`,
    `awaitDialog`) are replaced by a single logic-level `dialog()` primitive. It owns
    all Foundry/DOM work — template rendering, `FormDataExtended`, and `DialogV2` — at
    the boundary and hands callers a pure `callback(formData, action)` that receives a
    plain object, plus an optional `render(element)` hook for dynamic form behaviour
    (e.g. dependent dropdowns). Logic-layer callers no longer reference
    `FormDataExtended`, `querySelector`, or `DialogV2` at all. (#282)

- e87ca4f: **Fix item and effect context menus throwing "Container not found" (#517)**

    Right-clicking an item/effect row or clicking its ⋮ control threw
    `Error: Container not found` and never opened the menu, so there was no way to
    edit or delete rows from a sheet. `SohlContextMenu._setPosition` located its
    container with `target.closest("div.app")` — a pre-v13 selector. Under Foundry
    v14 the ApplicationV2 frame carries the `.application` class, and for a
    DocumentSheetV2 the frame element is a `<form>`, not a `<div>` — so both
    `div.app` and `div.application` matched nothing.

    The lookup now matches on the class alone (`.application`), so the menu finds the
    frame, positions, and opens.

- 1b5ded4: **Per-creature injury scaling via a `bodyScale` factor**

    Resolves #468. Impact is absolute, but an injury _level_ is relative to the body
    absorbing it — the same blow is trivial to a cow and grievous to a cat. A new
    per-creature `bodyScale` factor scales the injury-level table (not the impact),
    so the whole injury pipeline (Shock Index, bleeding, amputation, stumble/fumble,
    health) becomes size-correct at the source with no changes to those subsystems.
    - **`bodyScaleBase`** — a Being body field (under `system.body`, `NumberField`,
      `initial: 1.0` = baseline human, `min: 0.01`); additive, so existing beings load
      human-scaled with no migration. Exposed as the floored `bodyScale` ValueModifier
      on the Being's `BodyLogic`, which derives a scaled `injuryTable` in `evaluate`
      (the master
      `BASE_INJURY_THRESHOLDS` `[1, 5, 10, 15, 20]` is never mutated). A delta on
      `bodyScale` (shrink/enlarge) re-scales the table within the same prepare cycle.
    - **`injuryLevelFromImpact`** now takes the creature's thresholds (defaulting to
      the human table, so existing callers are unchanged) and counts how many an
      impact reaches — an impact below the smallest scaled threshold leaves no wound.
      A 2-impact blow is `S2` on a `bodyScale` 0.27 cat but is ignored by a
      `bodyScale` 2.9 cow (which needs ≥ 3 for even `M1`). `resolveInjury` sources the
      table from the struck creature's body via `body.injuryTable`.

    Covered by unit tests (`injuryLevelFromImpact` scaled/default, `BodyLogic`
    bodyScale + injuryTable + shrink delta + the `BodyStructure.injuryTable` seam)
    and a `injury-body-scale` e2e (the `bodyScaleBase` datamodel field drives the
    derived table). Docs updated (`body-structure.md` gains a Body-scale section).

- e480070: **Add required `sohl.archetype` frontmatter to creature and character content**

    The actor-pack builder requires `sohl.archetype` on every `character`/`creature`
    entry (archetype contract, #604 / #640) and drops any entry that lacks it from the
    compiled actors compendium. The shipped content tree was out of compliance:
    - Every `type: creature` file under `assets/content/Creatures/**` (236 files) now
      carries `sohl.archetype: 0`, marking each creature stat block as a seed-template
      archetype available in the Create-actor dialog.
    - The three named characters that lacked the field (`Alverrik_Tarvallor`,
      `Brunjar_Skathhelm`, `Aldrik_Harvenar`) now carry `sohl.archetype: null` (not
      archetypes); `Basic_Folk` keeps its existing `0`.

    The four `type: doc` lore overview pages under `Creatures/` are left untouched (they
    are journal content, not actors). The actors pack now compiles with zero
    `Missing required sohl.archetype` errors.

    Closes #724

- 23ddf43: **Fix: convert remaining DataModel array `choices` to value-keyed objects**

    Foundry builds `<option>` values from `Object.entries(choices)`, so a DataModel
    `StringField({ choices })` given an enum `values` array renders option values as
    indices (`0`, `1`, …) — breaking any editable select of that field on submit.
    This completes the sweep started in #149, converting the remaining choice fields
    across the item / actor / combatant / strike-mode data models to the value-keyed
    `choices` map now emitted by `defineType`:
    - Item: skill (`subType`, `combatCategory`), mystery, mysticalability, trauma
      (`subType`, `aspect`), affliction (`subType`), concoctiongear (`subType`),
      projectilegear (`subType`), attribute (`bodyRole`), and the being's body /
      movement fields (`bodyRole`, bleeding, amputation, move medium).
    - Actor: cohort (member role), vehicle (occupant role); Combatant: displayed
      medium; StrikeModeBase: impact aspect.

    Strike-mode `type` discriminators (a `TypedSchemaField`'s hidden discriminator)
    are intentionally left as single-value arrays.

    Fixes #148

- 38d7b35: **Remove five duplicate Misc_Gear items**

    Five Misc_Gear items were accidental duplicates — an `_2` copy that reused the
    original's `slug` (with a `2`-suffixed shortcode): Oats, Pie (Meat), Pie (Fruit),
    Bell (tiny), and Clappers (bone). The shared slug collided in the KB build (one
    page silently overwrote the other), and the duplicates padded the compendium. The
    `_2` copies are removed; nothing references their shortcodes.

    Closes #703.

- 6403966: Add icons to Item sheet tabs
- bf2bc4e: **Docs: user-visible documentation changes are bug/feature, not chore (#398)**

    `system-development.md` now states that user-visible documentation — JSDoc (which
    publishes to the API site) and other user-facing docs (the `docs/` pages and the
    user guide) — is a `bug` (published docs are wrong, broken, or misleading) or a
    `feature` (new or expanded coverage), with a tracking issue and a changeset like
    any other change. Only non-published housekeeping (internal non-JSDoc comments,
    build and tooling config, repo meta) remains `chore/*`.

- 78e87dc: **Document the entity-serialization and chat-card scope contracts**

    Capture the serialization and action-context patterns as developer reference so
    they don't have to be re-derived.
    - **Entity serialization contract** (new section in `docs/reference/runtime-contracts.md`).
      How a `SohlEntity` serializes: ownership by a transient `parent`, the
      `defaultToJSON` / `defaultFromJSON` pair (no reflective serializer), curated
      `Data`-shaped `toJSON` in persisted representation (uuids/shortcodes, not
      resolved objects) with the rule that `toJSON()` output must be valid
      constructor `data`, `registerKind` for revival, explicit `clone(parent)`, and
      `SohlLogic` serializing as a `{ uuid, name, kind }` reference.
    - **Chat-card scope model** (extends the existing _Chat-card dispatch contract_).
      The three kinds of button data (display fields, routing metadata, scope), and
      how an action's `scope` crosses the client boundary as a single `data-scope`
      blob written by the card logic and revived by `buildActionScope` so flows read
      live `context.scope` objects rather than per-payload JSON strings.
    - **`SohlActionContext` as a runtime value object** — why it is not a
      `SohlEntity`, and why `scope` stays a `ContextScope` interface.
    - **Extension how-to** (`docs/how-to/extension-points.md`). _Adding a chat-card
      button_ now instructs authors to carry payloads in `data-scope` rather than a
      bespoke `data-*-json` attribute, cross-linking both reference sections.

    Documentation only; no runtime change.

- d2ce43c: **Document the Node template-render harness in the testing guide**

    Add a _Asserting rendered HTML in unit tests_ section to the testing guide covering
    `renderTemplateReal` — how card/dialog templates render in Node (Foundry's
    `renderTemplate` is a Handlebars wrapper; cards and dialogs share the same shims),
    the two usage patterns (render a template directly, or drive an action and spy the
    shim), and the fidelity tiers (cards + dialogs render fully; sheet form builders
    render as binding placeholders). Note the narrow exception to the logic-layer scope
    so the guide stays internally consistent.

    Closes #585

- dcab4ed: **Document the two deliberate result-serialization exceptions**

    The `SuccessTestResult.toJSON` contract now documents _why_ two fields are
    carried in full rather than reduced to a reference, closing out the
    reference-on-wire epic (#202) after its sub-tasks landed:
    - `masteryLevelModifier` serializes its complete delta breakdown because the
      receiver renders it verbatim for combat transparency (`mlMod.chatHtml` in the
      standard and opposed result cards); a summarized form would lose the
      breakdown.
    - `successStarTable` travels as data (not a table reference) because custom,
      per-result description tables are a supported design goal (#206).

    JSDoc-only; no behavior change.

    Closes #202

- 120b46f: **Docs: add an "Esoterica" Rules section for Mysteries and Mystical Abilities**

    The Rules journal had no page describing the supernatural. A new **Esoterica** folder
    gathers it, described in play terms (the human-visible manifestations) rather than
    internal data fields:
    - **Esoterica Introduction** — the distinction between a _Mystery_ (what a character
      _is_) and a _Mystical Ability_ (what a character _does_), the three traditions, how
      abilities are tested (with the Incantation Casting Penalty), charges, and the
      general mysteries (Boon, Boost, Other).
    - **Arcane** / **Divine** / **Spirit** — one page per tradition, each covering that
      tradition's mysteries and mystical abilities: Arcane (Birthsign, Fate; Arcane
      Incantation, Arcane Talent, Alchemy, Divination), Divine (Grace, Piety; Ritual
      Action, Divine Incantation), and Spirit (Spirit Power, Spirit Rite, Spirit Action,
      Spirit Talent).

    Matches the current model — no `benediction` subtype (blessings are authored as Ritual
    Actions) and `spiritrite` ("Spirit Rite", formerly Shamanic Rite). Linked from the
    Rules index. Documentation only; no behaviour change.

    Closes #1016

- 13cc6dd: **Move aim/spread ownership to `ImpactModifier`**

    `aimBodyPartCode` and `spread` were duplicated — stored as direct fields on both `AttackResult` and `ImpactResult`, producing the same two values twice in each serialized tree. They now live exclusively on `ImpactModifier` (the weapon capability descriptor), which is the natural owner.

    **Changes:**
    - `ImpactModifier` — gains `aimBodyPartCode` and `spread` fields; both are serialized in `toJSON()`.
    - `AttackResult.aimBodyPartCode` / `.spread` — converted from stored fields to read-through getters (`this.impact.aimBodyPartCode` / `.spread`); removed from `toJSON()`.
    - `ImpactResult.aimBodyPartCode` / `.spread` — same conversion (`this.impactModifier.*`); removed from `toJSON()`.
    - `CombatResult.rollImpact()` — drops the now-redundant explicit `aimBodyPartCode`/`spread` pass-through; they flow automatically via the shared `ImpactModifier`.
    - `buildAttackResult()` — passes `aimBodyPartCode`/`spread` into `impact.clone()` so they are embedded in the modifier from the start.

    Closes #207.

- 73b8093: **Rehydrate `AttackResult.mode` to a live `StrikeMode`**

    `AttackResult.mode` previously held a `StrikeModeBase.PointerData` struct in memory (the wire form), making it unusable at runtime. It now holds the live `StrikeModeBase | undefined`, following the same pointer-on-wire / live-object-in-memory rule already applied to `DefendResult.mode` and `AttackResult.combatant`.

    **Changes:**
    - `AttackResult.mode` — runtime type changed from `PointerData` to `StrikeModeBase | undefined`; rehydrated via `StrikeModeBase.fromPointerData()` in the constructor. `undefined` when the weapon is absent from the current client (e.g. the defending client).
    - `AttackResult._modePointer` — private field retains the original `PointerData` for lossless `toJSON()` serialization.
    - `AttackResult.toJSON()` — `mode` is now serialized from `_modePointer` (same shape as before; no wire format change).
    - `SohlCombatantLogic` — two `StrikeModeBase.fromPointerData(atkResult.mode)` calls replaced with direct `atkResult.mode` access; the `priorAttackResult.mode` comparison guarded against `undefined`.

    Closes #204.

- b8654a4: **Seed a default strike mode for new combat-technique skills**

    Creating a `combattechnique`-subtype skill now seeds a default melee strike mode
    (named after the skill) when none is supplied, so the item is immediately valid
    and usable — a combat technique needs a strike mode for its Attack / Block /
    Counterstrike to mean anything. Handled in `SkillDataModel._preCreate`; every
    other skill subtype keeps a null strike mode.

- 57448e3: **Derive result text and success stars on read instead of storing them (#205)**

    A `SuccessTestResult` stored its outcome three ways: the raw `successLevel`
    (the true datum), the full description table, **and** the already-rendered
    `resultText` / `resultDesc` / `successStars` derived from that table. The derived
    copies were redundant — and a stale-copy hazard: change the table and the frozen
    strings no longer agree.

    `resultText`, `resultDesc`, and `successStars` are now **getters** that resolve the
    description table against the result's evaluated `successLevel` / `targetValue` /
    `lastDigit` on each read. `toJSON` no longer emits any of the three — the wire form
    carries only the raw `successLevel` (the one deliberately cached derived value) and
    the table (which already rides the wire as data, #206). `toChat` folds the derived
    strings into the chat-card data, rendered once by the sender. Legacy serialized
    results that still contain the three fields are simply ignored on revival and
    recomputed. This keeps a single source of truth, per the subsystem's
    _store only the minimum; never serialize what an in-memory object recomputes_ rule.

- a31561b: **Dodge is offered only when the actor has a usable Dodge skill**

    Previously the Dodge defense button appeared for every defender regardless of
    whether they had a Dodge skill.

    **Two gates fixed:**
    - **Automated chat card** (`chat-card-gating.ts`): Added `hasUsableDodgeSkill(actorLogic)` helper that checks `logicTypes[ITEM_KIND.SKILL]` for a skill with shortcode `"dge"`. `gateAutomatedDefenseButtons` now removes the Dodge button when the helper returns false — mirroring the existing Block/Counterstrike gates.
    - **Context menu** (`constants.ts` + `ExpressionHelperRegistry.ts`): `TEST_TYPE.DODGE.condition` changed from `"true"` to `"hasUsableSkill(actor,'dge')"`. Added `hasUsableSkill(actor, shortcode)` to `STANDARD_HELPERS` — a pure, duck-typed helper that walks `actor.logic.logicTypes["skill"]` to find the skill, with no Foundry import required.

    Closes #64.

- fe9127b: **Move hardcoded `FATE_DESC_TABLE` / `STANDARD_SUCCESS_VALUE_TABLE` entries to i18n**

    Both tables previously used module-level constants with static English strings. They are now getter functions (`getFateDescTable()` and `getStandardSuccessValueTable()`) that resolve labels and descriptions via `sohl.i18n.localize()` at call time so the active locale is available.

    **New i18n keys added:**
    - `SOHL.Skill.FateDesc.loseFateNoEffect.*`, `SOHL.Skill.FateDesc.noLossNoEffect.*`, `SOHL.Skill.FateDesc.success.*`, `SOHL.Skill.FateDesc.critSuccess.*`
    - `SOHL.MasteryLevel.SvTable.noValue.*`, `littleValue.*`, `baseValue.*`, `bonus1.*`–`bonus5.*`

    Closes #70.

- a827ad6: **Constrain the actor sheet header portrait**

    Fixes [#57](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/57):
    the header portrait sizing rule now targets `img.actor-img` — the class the actor
    header templates actually render — instead of the stale `img.profile` selector.
    The portrait is held to 100px again on all five actor sheets, so the header is
    compact and the tab content area gets its space back.

- db0812a: **Key embedded items when exporting the actors pack**

    Fixes [#59](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/59):
    the actor pack exporter now writes a hierarchical `_key`
    (`!actors.items!<actorId>.<itemId>`, and `!actors.items.effects!…` for any
    effects an item carries) on each embedded item. Foundry's LevelDB pack compiler
    keys every embedded document by `_key`, so without it the compile aborted with
    `LEVEL_INVALID_KEY` ("Key cannot be null or undefined") as soon as the actors
    pack contained an actor.

- 9fd329c: **Actor sheet search filter works for effects and body-location rows**

    The filter previously called `querySelectorAll(".item")` and read `el.dataset.itemName`. Effect rows use `.effects__row` (no `.item`) and body-location rows are `.item` but carry no `data-item-name` — so both were silently broken (effects never matched; body-locations were all hidden on any query).

    **Approach:** A new `applySearchFilter(query, rgx, content)` pure helper queries `[data-search-name]` and reads `el.dataset.searchName`. `SohlActor._displayFilteredResults` now delegates to it. All filterable `<li>` rows in the eight being/cohort tab templates receive `data-search-name="{{name}}"`, making the filter class-agnostic and fixing effects, body-locations, and gear in one pass.

    Closes #104.

- 4f38348: **Repair actor sheet tab navigation**

    Fixes [#53](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/53):
    the Being actor sheet crashed on render, and tab content rendered hidden on all
    actor sheets (Being, Cohort, Structure, Vehicle, Assembly). The Being `tabs` part
    now uses Foundry's core navigation template, and every actor tab section resolves
    its `active` state and tab group so the correct tab body is shown.

- fda25c7: **Complete `ValueModifier.addVM` so it preserves the full modifier derivation**

    `addVM` is meant to fold one modifier's justification into another — copying the
    source's labeled deltas so the merged value keeps each source's tooltip and can
    layer its own deltas on top. It was previously a stub that only copied the base
    value and **silently dropped the source's deltas**.

    It now replays every labeled delta from the source (name, shortcode, operator,
    and value preserved, honoring same-shortcode replacement and `OVERRIDE`
    semantics), while still adopting the source's base only when `includeBase` is set
    (the base is not additive — a modifier has exactly one, so it is replaced, not
    summed).

    This corrects `MysticalAbilityLogic`'s mastery-level derivation, which used the
    stub to borrow an associated skill's mastery level and therefore lost that
    skill's own modifiers (e.g. injury impairment). It is also the mechanism the
    upcoming combat-technique-as-skill work (#322/#323) uses to drive a technique's
    strike-mode attack/defense from its skill.

- 900fc20: **Emit the attacker-side injury button when a counterstrike lands**

    `buildCombatCardData` hard-coded `hasAttackInjury: false` with empty
    `attackInjuryHandlerUuid`/`attackInjuryScope` on both the main attack card
    and the counterstrike (CX) card, so the attacker could never receive an
    injury button even when the defender's counterstrike landed a blow.

    The fix mirrors the existing defender-side `injuryButton(...)` logic:
    - **Main attack card:** `atkInjury = injuryButton(cxImpact, atkResult.token.uuid)` — the original attacker takes an injury when the CX blow lands.
    - **CX card:** `atkInjury = injuryButton(cxImpact, attackResult.token.uuid)` — same CX impact, targeting the original attacker's token (now the "defender" on the CX card).

    `atkInjury` is `null` when no CX exists or the CX missed, so `hasAttackInjury` stays false in the normal (non-counterstrike) case.

    Closes #186.

- 15116de: **`BeingSheet._onRollStrikeModeTest` uses the correct modifier for the chosen test kind**

    Previously the method always called `sm.attack` regardless of whether the
    player clicked a block or counterstrike cell. It now delegates to a new
    pure helper, `selectStrikeModeModifier(sm, testKind)`, which maps:
    - `"attack"` → `sm.attack`
    - `"block"` → `(sm as MeleeStrikeMode).defense.block`
    - `"counterstrike"` → `(sm as MeleeStrikeMode).defense.counterstrike`

    An unknown `testKind` returns `undefined` and the roll is silently
    skipped. The helper is unit-tested in `being-sheet-view.test.ts`.

    Closes #178.

- 2e14077: Fix body-part hit-spread weighting reading an unset weight field (#739)

    Body **parts** persist their unaimed / hit-spread selection weight in a scalar
    schema field, but `BodyPart` seeded its derived `probWeight` modifier from a
    field name that does not exist on a part — so every part's weight computed as
    `0`, and `BodyStructure.getRandomPart()` (the unaimed part / spread-drift
    selection) was not weighted as intended.

    `BodyPart` now derives its `probWeight` modifier from the persisted weight. Hit
    **locations**, which correctly persist and read their own `probWeight`, were
    unaffected.

    _(The persisted part field was named `combatArea` when this fix was made; #780
    renames it to `probWeight` in this same release, so all three body tiers spell
    their weight identically.)_

- bc219f0: **Security:** Fix XSS in `CalendarSettingsMenu._onDeleteCalendar` via imported calendar name (#163).

    `cal.label` (verbatim from a GM-imported JSON file) was passed to `game.i18n.format` without HTML escaping. A calendar named `<img src=x onerror=…>` would execute when the GM opened the delete confirmation dialog. Also fixed the sibling import-success notification that used `calendarConfig.name` unescaped.

    Both `cal.label` and `calendarConfig.name` are now wrapped with `foundry.utils.escapeHTML` before interpolation. Also adds `foundry.utils.escapeHTML` and `foundry.utils.deepClone` stubs to the test setup.

- 08bdaa2: **Fix `canFate` JSDoc: Fate raises the success level, it never re-rolls**

    Corrected the `canFate` getter's JSDoc in `SuccessTestResult` and the parallel
    "re-roll" wording along the Fate path in `MysteryLogic` (the Fate mystery's
    subtype description, the `assocSkillCode` doc, and the `evaluate()` comment).
    Fate is spent **after** the roll to raise an already-settled test's success level
    (e.g. MF→MS); the die is frozen and the outcome re-derives from the same roll — it
    is never a re-roll. The old wording described the wrong mental model.

    Closes #855

- 4a79e8d: **Authorize chat-card clicks by the handler document's ownership**

    Fixes [#167](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/167):
    the chat-card click dispatcher resolved the handler document by UUID and ran its
    `onChatCardButton` with no ownership check, so intrinsic combat/opposed flows
    (`opposedTestResume`, the automated defense resumes, `startAutomatedAttack`, …)
    could be driven for a document the acting client does not own — the render-time
    `gateAutomatedDefenseButtons` is UX only and is bypassed by a synthesized click
    or a direct handler call.

    A chat card addresses each button to the actor that should _handle_ it, and
    running the action mutates that actor's own state, so authorization is document
    ownership. The dispatch now honors a click only if the resolved handler is owned
    by the current client (a GM owns all):
    - New `resolveAuthorizedChatCardHandler(dataset, resolveDoc)` resolves the handler
      and returns it only when `doc.isOwner`, gating both the button and edit-action
      click paths in `sohl.ts` before any dialog, `buildActionScope` revival, or
      intrinsic logic runs. Foundry lookup is injected, so it is Foundry-free and
      unit-tested (mirroring `gateAutomatedDefenseButtons`).
    - Each `onChatCardButton` handler (`SohlCombatant` / `SohlTokenDocument` /
      `SohlItem`) also re-checks `this.isOwner` on entry, so a direct call is refused
      too (defense-in-depth), matching the existing `onChatCardEditAction` guard.

    The correctly-addressed owner's flows are unchanged. The two-sided model
    (render-gate + click-authorize on the handler's ownership) is documented in the
    Chat-card dispatch contract (`docs/reference/runtime-contracts.md`) and the
    cross-client authorization guardrail (`docs/concepts/security-model.md`).

- 805d19d: **Eliminate the doubled attack/defend payload in `CombatResult.toJSON()`**

    `CombatResult.toJSON()` was emitting each nested result twice: once as `sourceTestResult`/`targetTestResult` (inherited from `OpposedTestResult`) and again as `attackResult`/`defendResult` (redundant stored fields). Every combat card's `data-scope` carried four result objects where two were sufficient, roughly doubling the cross-client payload.

    **Changes:**
    - `attackResult` and `defendResult` are now **read-only getters** that alias `sourceTestResult`/`targetTestResult`; the stored fields are gone.
    - The `CombatResult` constructor normalises construction-time aliases (`attackResult`→`sourceTestResult`, `defendResult`→`targetTestResult`) before calling `super()`, so callers may pass either name — including the revival path, which only sees the serialised `sourceTestResult`/`targetTestResult` keys.
    - The `toJSON()` override is removed; `OpposedTestResult.toJSON()` already serialises the pair correctly.
    - `buildCombatResult` in `SohlCombatantLogic` no longer passes redundant keys.

    _Verify: `CombatResult.toJSON()` now contains one attack result and one defend result (not four), and a round-trip via `defaultFromJSON` restores `attackResult === sourceTestResult`._

    Closes #203.

- d512cb7: **Enable type-aware `@typescript-eslint/consistent-return` lint rule (#235)**

    Enables the type-aware `@typescript-eslint/consistent-return` ESLint rule (with the base `consistent-return` rule turned off to avoid false positives on `void` returns). The type-aware version correctly distinguishes functions returning `Promise<T | undefined>` — where bare `return;` is inconsistent with `return value;` — from `Promise<void>` functions where bare returns are fine.

    **Changed files:**
    - `eslint.config.js` — added `parserOptions.project: true` + `tsconfigRootDir`, disabled base `consistent-return`, enabled `@typescript-eslint/consistent-return`
    - All bare `return;` statements in non-void async functions changed to `return undefined;` across: `SohlLogic`, `SohlActor`, `SohlItem`, `SohlCombatant`, `BeingLogic`, `SohlCombatantLogic`, `SohlTokenDocumentLogic`, `MasteryLevelModifier`, `StrikeModeBase`
    - `_preUpdate`/`_preCreate` overrides that fell off the end without a return now have an explicit `return undefined;`

- 463d55f: **Fix default context-menu conditions that never matched**

    The default `condition` strings on the improve-flag, transmit-affliction, and
    diagnosis context-menu entries — and the `improveWithSDR` action `visible`
    predicate — still referenced the pre-#459 document paths (`item.system.canImprove`,
    `item.system.data.improveFlag`, `item.system.canTransmit`,
    `item.system.data.isTreated`). `canImprove` / `canTransmit` are getters on the
    **logic** layer, not the DataModel, and `item.system.data` is not a valid
    accessor, so every one of these predicates resolved to `undefined` (falsy) and
    the entries stayed hidden regardless of state.

    Migrated them to the logic-layer bindings (`itemLogic.canImprove`,
    `itemLogic.data.improveFlag`, `itemLogic.canTransmit`,
    `itemLogic.data.isTreated`), matching the affliction/trauma predicates already
    migrated in #459. The Improve, Transmit, and Diagnosis entries now appear when
    their underlying state holds.

    Closes #458

- 35a08f5: **Fix the Add Injury flow never recording a trauma**

    `createTraumaFromInjury` called `actor.createEmbeddedDocuments(...)`, but both
    call sites pass the `BeingLogic`, not a Foundry actor, so it threw
    `TypeError: actor.createEmbeddedDocuments is not a function` and no trauma was
    created. It now routes the write through a new
    `FoundryHelpers.fvttCreateEmbeddedItems(actorLogic, itemsData)` boundary, which
    resolves the actor from the logic — keeping `injury-actions.ts` free of direct
    Foundry calls. With this, the Add Injury flow records the trauma end to end. (#286)

- d5514b1: **Fix two e2e specs (#502, #503)**
    - **#502** — the affliction action-gating spec modelled a "treated" affliction with the retired `isTreated` flag, but `isTreated` is derived from `treatmentDate` (#484), so the flag was ignored and `canTreat` stayed true. The spec now sets `treatmentDate`.
    - **#503** — with Cypress `testIsolation` off, a permanent error notification raised by one spec (e.g. Foundry's `Hooks.onError` on a caught data-prep failure) persisted and overlaid the Being-header status pill in a later spec, failing an unrelated click. Each test now starts from a clean notification UI, so a bled notification can no longer cover another spec's controls. (The underlying prep error is tracked separately, e.g. #512.)

- f91db39: **Fix: de-race the migration-runner e2e reload spec (#1032)**

    `migration-runner.cy.js` → "re-stamps a rewound (legacy) stored version on the
    next load" failed intermittently: after rewinding `systemMigrationVersion` to
    `0.0.0` and re-visiting the world, the spec read the stored version once,
    immediately after `cy.login()` resolved, and saw the old `0.0.0`.

    The reload and `ready` re-fire were working correctly — the spec was racing the
    migration. The `ready` hook runs `void migrateWorld()` fire-and-forget, and the
    stamp is a world-setting write that round-trips to the server, so `game.ready`
    (what `cy.login()` waits on) can flip true before the stamp lands. The sibling
    "on boot" spec passed only because the seed world was already stamped, so no
    async write was pending.

    Harness-only change (no system code touched): both specs now poll the setting
    with a retry-able `cy.window({ timeout }).should(...)` instead of a single
    immediate read, letting the async migration settle. This preserves the
    end-to-end live-lifecycle coverage (reload → `ready` → `migrateWorld` →
    `runWorldMigrations` → stamp).

    Fixes #1032

- cd72c0e: **Fix: de-flake e2e specs that place canvas tokens (#611)**

    Placing a Token in the headless Cypress browser triggered core's canvas render
    chain (`Token.draw` → `TokenRuler.draw` → `GridLayer.addHighlightLayer`, and the
    per-tick `_refreshState` refresh) against a viewport that never finishes
    initializing. Core then reached for absent canvas infrastructure and threw
    unhandled promise rejections (`reading 'addChild'`, `reading 'OBJECTS'`) that
    landed on whatever spec was running, failing token-placing specs
    (`movement-reach`, `scene-tokens`, the combat specs) nondeterministically. The
    aborted draw also left the combatant's actor-derived state (`computedMove`)
    reading `null`.

    Two harness-only changes (no system code touched):
    - **Suppress placeable-`Token` rendering headless.** After login the harness
      no-ops the placeable `Token`'s `draw` and `applyRenderFlags`. This suite never
      asserts on rendered token pixels — it reads the `TokenDocument` and each
      combatant's Foundry-free `.logic` — so skipping the PIXI render removes the
      render race at its source. A narrower, safer guard than allow-listing the generic
      `addChild` / `OBJECTS` messages globally.
    - **Place linked tokens.** `placeToken` / `placeAdjacentTokens` now create
      `actorLink: true` tokens, so a combatant's `.actor` is the world actor a spec has
      already prepared — not an unprepared synthetic (delta) actor whose logic was only
      populated as a side-effect of the (racy) canvas draw. `computedMove` / `reach`
      reads are now deterministic and canvas-independent.

    Fixes #611

- af07406: **Fix broken in-page anchor links in the Event Queue reference**

    Two cross-references in `docs/reference/event-queue.md` pointed at anchors that
    Hugo/GitHub never generate, so the links 404'd:
    - The scene-region worked-example heading carried a trailing `(#593)`, which
      slugifies to `…-entering-593` — but both references (here and in
      `module-development.md`) linked `…-entering`. Dropped the `(#593)` suffix so
      the heading slug matches its links, consistent with the other cross-linked
      section headings, which omit the issue number.
    - The two `[query]` links to _"7. Query the schedule"_ dropped the double hyphen
      the em-dash produces (`schedule--when`), so they resolved to nothing. Corrected
      the anchors.

    Completes the "links resolve" acceptance of #608.

- 5b0d2f0: **Security:** Fix catastrophic ReDoS in `FILE_PATH_REGEX` (#165).

    The inner character class `[^<>:"|?*\n\r]` allowed `/` and `\`, which overlapped with the adjacent `(?:[\\/]...)` group. For an N-segment path ending with a forbidden character, the engine explored O(2^N) backtracking paths — a 30-segment input caused a ~60-second hang.

    The fix excludes `/` and `\` from both inner char classes (`[^<>:"|?*\n\r\\/]+`), making each path separator consumed by exactly one arm and reducing matching to O(N).

- b5cef7e: **`BeingLogic.getUsableStrikeModes()` returns the actor's usable strike modes**

    The method body was a `return []` stub, causing `commonAttack` to abort with
    "has no usable strike mode" on every automated attack and counterstrike
    resume.

    The fix composes the two existing collectors:
    - **`availableStrikeModes`** — modes whose weapon is held in ≥ `minParts`
      limbs (missile modes additionally gated by `draw ≤ pull`). Already correct;
      now used as the starting set.
    - **Range/reach filter** — melee modes require `distanceToTarget ≤ reach.effective`; missile modes require `distanceToTarget ≤ baseRange.effective`.
    - **Type gating** — `meleeAllowed`, `directAllowed`, and `volleyAllowed` options prune the result as callers require.
    - **Disabled gate** — modes with `attack.disabled` are always excluded.

    Unblocks the automated-attack path (#193 RED cases: "automated attack start"
    and "Counterstrike resume").

    Closes #177.

- 20afc77: **Security:** Fix Handlebars SSTI and XSS in dialog HTML builders (#159, #164).

    **`SohlItem._moveQtyDialog` (#159):** Item names, source/target container names, and quantity were interpolated directly into Handlebars template source before compilation, allowing SSTI (proto-chain code execution) via crafted names and enabling stored XSS. Names are now placed in the Handlebars data context (`{{itemName}}`, auto-escaped) and compiled from a static template string. The `allowProtoMethodsByDefault`/`allowProtoPropertiesByDefault` flags are removed.

    **Defense-in-depth hardening (#164):**
    - `SohlDataModel._addChoiceArrayItem`: choice labels and values from `data-choices` are now HTML-escaped with `Handlebars.escapeExpression` rather than concatenated into a template source string; the `Handlebars.compile` + `allowProto*` step is eliminated.
    - `selectArray` Handlebars helper: `option.value` is now escaped with `Handlebars.escapeExpression` to match the existing escaping on `option.label`.
    - `FoundryHelpers.toHTMLWithContent`: removed `allowProtoMethodsByDefault`/`allowProtoPropertiesByDefault` flags; plain-object contexts do not need proto-chain access.

- fd50aad: **Skill Development Roll now persists its outcome**

    `SkillLogic.improveWithSDR` built an update payload but never applied it, so a
    successful Skill Development Roll posted a "mastery increased" chat card without
    actually raising the skill's `masteryLevelBase`, and the `improveFlag` was never
    cleared (leaving the skill perpetually flagged for improvement). The method now
    writes the payload back before posting the card: the improve flag is cleared and,
    on a successful roll, the base mastery level is raised by `sdrIncr` — so the gain
    the card announces is real.

    Closes #716

- 499bfe4: **Fix the injury chat card failing to render**

    `templates/chat/injury-card.hbs` closed its `{{#if needsShockRoll}}` block with
    `{{/unless}}` instead of `{{/if}}`, so rendering threw `if doesn't match unless`
    and no injury card was posted (aborting the Add Injury flow before the trauma was
    recorded). (#283)

- cd526ee: **Fix the broken Add Injury flow**

    `BeingLogic.addInjuryViaDialog` / `onCreateInjury` resolved the target body via
    `getActorBodyStructure(this)`, but `this` is the `BeingLogic` — which exposes
    `logicTypes`, not the Foundry actor's `itemTypes` — so the lookup always returned
    `undefined` and the flow aborted before any dialog (whose "no body" warning then
    hit the logger recursion). And `BeingSheet._onAddInjury` called
    `this.document.addInjuryViaDialog()`, a method the actor does not define (it lives
    on `BeingLogic`). `getActorBodyStructure` now reads the body through the
    logic's `logicTypes` (matching how the rest of `BeingLogic` reaches it), and the
    sheet action routes through `.logic`. (#268)

- ba3f491: **Bump the `input-label` typography token from 14 px to 16 px**

    All other body and label tokens were already at 16 px; the `input-label`
    entry in `scss/abstracts/_typography.scss` was the only one still at 14 px,
    causing form field labels to render noticeably smaller than the rest of the
    UI text.

    Closes #112.

- e424c47: **Fix actor import crash from unwired intrinsic actions**

    Fixes [#62](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/62):
    importing an actor (e.g. `Basic_Folk`) threw _"The target of this action does not
    have a function named 'perform'"_ during data preparation. Several Logic classes
    declared intrinsic actions whose `executor` named a method that did not exist or
    was misnamed, and `SohlAction`'s constructor rejects an unresolved intrinsic
    executor — aborting the whole actor's data preparation.

    Every declared intrinsic executor now resolves to a real method. Not-yet-built
    actions (`mysticalability` perform, `mystery` useMystery, `weapongear`
    attack/block/counterstrike, `trauma` treatment/healing tests, `affliction`
    fatigue/morale/fear tests) degrade gracefully with a "not yet implemented"
    warning instead of throwing, and the `affliction` transmit/contract actions now
    point at their existing `transmit`/`contractTest` methods. Adds the missing
    action-title localization keys.

- f9ca4ae: **Fix a localization-key collision that silently dropped all SoHL translations**

          `lang/en.json` defined `"SOHL.Trauma.Pall"` as a string leaf **and**
          `"SOHL.Trauma.Pall.Note.*"` as a branch under the same path. Foundry runs
          `foundry.utils.expandObject` on every translation file as it loads it, and that
          throws when a key is a strict dotted-prefix of another (`Cannot create property

    'Note' on string 'The Pall'`). Foundry catches the throw and discards the
  **entire** file — so a single colliding pair dropped _all_ `SOHL._`and`TYPES._`
    strings and every SoHL label rendered as its raw key.
    - Align the Pall trauma with its sibling traumas (`SOHL.Trauma.Fear`,
      `SOHL.Trauma.Morale`) by moving its name to `SOHL.Trauma.Pall.DefaultSource`, so
      `SOHL.Trauma.Pall`is a pure branch and no key is both a leaf and a branch.
    - Add a`lint:lang` build guard (`utils/check-lang.mjs`, wired into `lint`) that
      fails the build fast — before the type-check and tests — on any dotted-prefix
      key collision in a `lang/\*.json` file, so this class of regression can never
      ship again.

            Closes #636

- 14d2399: **Fix infinite recursion in `SohlLogger.uiWarn` / `uiInfo` / `uiError`**

          The notify branch of `log()` re-entered the same `uiWarn`/`uiInfo`/`uiError`
          method — which calls back into `log()` with the same `notifyLevel` — recursing
          without bound and crashing the client with `RangeError: Maximum call stack size

    exceeded` on **any** UI-notify log call. The notification now goes straight to
  Foundry's notification manager (`ui.notifications`), and the two previously
  unguarded `i18n.format`calls in`log()` are wrapped so a formatting failure
    cannot throw out of the logger. (#267)

- b02decf: **Security:** Fix ReDoS in `matches()` expression helper (#166).

    `MAX_PATTERN_LENGTH = 200` bounded pattern length but not backtracking complexity. A sub-200-char pattern with nested quantifiers (e.g. `(a+)+`) against attacker-influenced input could hang the JS engine for seconds or minutes.

    Adds `hasCatastrophicPattern()` static analysis before `new RegExp(...)` is called. Patterns containing backreferences (`\1`–`\9`) or a quantified group whose body itself contains a quantifier (`(a+)+`, `(.*)* `, `([a-z]+\d)+`) are rejected with a `SafeExpressionError`. Legitimate single-level quantifiers (`a+`, `[a-z]+`, `(?:foo|bar)`) are unaffected.

- 55dc096: **Fix the release workflow so GitHub Releases include the system archive**

    Fixes [#120](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/120):
    the release workflow uploaded its assets from `build/release/`, but the packaging
    step writes `system.zip` and `system.json` to `build/dist/`. The upload now points
    at `build/dist/`, so published Releases carry the installable system files that
    Foundry's manifest/download URLs reference.

- 1e39fc7: **Fix: Script actions never executed their referenced Macro**

    Two bugs meant a Script action (an `actionDefs` entry running a referenced Foundry
    Macro, #156) could never run, so its macro's return value never came back:
    - **Stored actions lost their `shortcode`.** The `actionDefs` schema
      (`SohlDataModel`) omitted the `shortcode` field, so a persisted action's
      shortcode was stripped on save — `logic.actions.get(shortcode)` could never
      find it. Added the field.
    - **`SohlAction.resolveContext` was one level short.** It walked
      `action -> logic -> data model` and read `documentName` off the data model
      (which has none), yielding an `undefined` owning actor. For a Script action
      that failed the execute-permission gate, so `execute()` returned early with no
      error. It now walks the full `action -> logic -> data model -> document` chain.

    Also, the action context is now passed to the macro as `sohlContext` rather than
    `scope`: `scope` collides with the fixed parameter Foundry's macro runner already
    declares, which built the wrapper function with a duplicate parameter name.

    Fixes #348.

- e79e1ca: **Fix seven dialog templates failing to render on Foundry v14**

    Foundry v14 removed the `{{#select}}` Handlebars block helper, so the injury,
    damage, missile-damage, opposed-response, create-item, strike-mode, and
    query-weapon dialogs threw `Missing helper: "select"` and never opened. Each
    select is converted to the supported v14 pattern: `{{selectOptions}}` (with
    `valueAttr`/`labelAttr` for object lists), or an inline `{{#each}}` with
    `{{#if (eq …)}}selected{{/if}}` where the option value or label can't be
    expressed through `selectOptions` (string lists and formatted labels like `dN`).
    This also repairs the Add Injury flow end to end (its dialog can now render). (#280)

- 35ec141: **Fix the shared data-model schema spread**

    `defineSohlDataSchema()` — the schema for the fields every SoHL data model is
    meant to carry (`shortcode`, `docUrl`, `actionDefs`) — was defined but never
    spread into any concrete schema, so those fields were absent from every item
    and actor data model. Spread it into the item, actor, and combatant base
    schemas so the fields exist and persist. `shortcode` is made lenient
    (`initial: ""`), a safe default since it was previously unvalidated everywhere.

- 43136cb: **Fix always-read-only rich-text editors on document sheets (#453, #452)**

          Every SoHL sheet computed its `editable` render-context flag from
          `this.document.editable` — but a Foundry _document_ has no `editable` property
          (that is a _sheet_ property), so the value was always `!!undefined` → `false`.
          The base `DocumentSheetV2._prepareContext` had already set `editable:

    this.isEditable` correctly; the override clobbered it.

          As a result every `{{editor … editable=editable}}` field (the Being sheet's
          Profile _dossier_ and Facade _appearance_ ProseMirror editors) rendered
          read-only for everyone, including a GM who owns the actor — the editor never
          became editable, so those descriptions could not be edited on the sheet. The
          flag now reads `this.isEditable`, so ownership/permission correctly drives
          editability. Verified by the previously-red `profile-section` and
          `facade-section` e2e specs, which now pass.

- 47ac0c5: **Repair sheet layout broken by a dead CSS scope**

    Fixes [#87](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/87):
    the Being sheet (and every other SoHL document sheet) rendered with an oversized
    header and cramped tab content. The sheet-layout rules in `_top.scss` lived inside
    a top-level `.sheet { … }` block, but because the stylesheet loads each component
    inside `.sohl { }` they compiled to the descendant selector `.sohl .sheet`. Foundry's
    ApplicationV2 places `sohl`, `sheet`, and the sheet-type class on the **same** frame
    element, so that descendant selector never matched and the whole block — including
    the portrait size cap and the tab-body height — was silently dead.

    The block now lives in its own `components/_sheet.scss` partial, loaded under the
    compound `.sohl.sheet` selector so it matches the frame as intended. This also
    explains why the earlier `img.profile` → `img.actor-img` rename (#57) had no visible
    effect: the rule it edited never applied.

- 5edb0e7: **Restore type safety on `sohl.*` and SoHL document types (fix stale `sohl-globals.d.ts`)**

    `types/sohl-globals.d.ts` had regressed to a broken state: it imported from a
    non-existent `@src/common/*` layout and referenced removed `X.DataModel`
    namespace members, while `tsconfig`'s `skipLibCheck: true` hid the breakage. The
    effect was that `var sohl: SohlSystem`, the Foundry `DocumentClassConfig`, and
    `DataModelConfig` all silently resolved to `any` — turning off type checking on
    every `sohl.*` global access and on SoHL document / data-model types.
    - **Corrected the declaration file**: repointed all imports to the current
      `@src/document/*/{foundry,logic}`, `@src/core/logic`, and `@src/entity`
      layout; use the standalone `XDataModel` classes (the `X.DataModel` namespaces
      are gone); dropped dead imports; made `SohlActor`/`SohlItem`/`SohlActiveEffect`
      non-generic to match their classes; fixed the `Mixin` utility-type constraint.
    - **Broke an fvtt-types instantiation cycle**: the actor/item `DataModelConfig`
      entries pin their DataModel generics to `any`, because the concrete classes
      carry self-referential `TLogic` defaults (DataModel → Logic → Data → system →
      DataModelConfig) that otherwise send the compiler into infinite recursion.
      Per-subtype `system` stays loosely typed (as it already was while the file was
      broken); everything else is now correctly typed.
    - **Fixed the ~50 latent type errors** the correction de-masked: added a typed
      `SohlSystem.CONFIG` getter; cast heterogeneous `SohlDocument`-union member
      access in the base sheet; annotated implicit-`any` callback params; and fixed
      two genuine bugs surfaced by real typing — a possibly-undefined
      `charges.value` read in `SkillLogic`, and `BodyPart.heldItem` now normalizes
      to `undefined` (its declared type) instead of `null` when no item is held.

    Also adds a build/CI guard (`npm run lint:dts`, wired into `build:noci` and the
    build workflow) that type-checks the project's own declaration files with
    `skipLibCheck` off and fails on any error in a file we own — so this regression
    cannot silently recur. Third-party library errors (which `skipLibCheck` exists
    to suppress) are ignored.

    Type-only change; no runtime behavior change beyond the two correctness fixes
    noted above.

- 8f3ab56: **Bug fix:** `SohlSpeaker._toChatWithContent` now correctly awaits `toHTMLWithContent`.

    The inline-content chat path was assigning a `Promise` to `messageData.content` instead of the resolved HTML string, causing chat messages to render as `[object Promise]` or empty. Added `await` to match the sibling `_toChatWithTemplate` path.

- a7b9ea5: **`successValueTest` passes the correct `svTestContext` to `successTest`**

    Previously, `successValueTest` built `svTestContext` with the right `svTable` and index-offset `targetValueFunc` but then called `this.successTest(context)` with the original, unmodified context. As a result, `successValueTest` behaved identically to a plain `successTest` and the success-value grading was never applied.

    The fix passes `svTestContext` (spreading any caller-supplied scope fields underneath, then overriding with `svTable` and the index-offset func) to `this.successTest(...)`.

    Closes #78.

- 42b1f0b: **`SuccessTestResult.testDialog` records the target's movement from the dialog form**

    The `targetMovement` handling block was commented out with a `FIXME(#75)`.
    The block referenced a nonexistent `this.targetMovement` field and the wrong
    guard name (`isMovement`). The fix:
    - Reads `formData.targetMovement` (not `data.targetMovement`)
    - Validates with `isSuccessTestResultMovement`
    - Assigns `this._movement` (the existing `movement` backing field)
    - Throws `Invalid target movement "…"` for unrecognized values, mirroring the
      existing `rollMode` validation pattern directly above it

    Also adds `isSuccessTestResultMovement` to the import list.

    Closes #75.

- d6219e2: **Fix future-tense relative time rendering; correct calendar docs**

    The `sohl.relative` formatter wraps future durations with the SoHL-owned
    `SOHL.TIME.Until` localization key, which was missing from `lang/en.json` — so
    "… from now" times rendered the raw key while past ("… ago") times worked. Adds
    the key (`{since} from now`).

    Also corrects `docs/reference/calendar.md`, which described the three formatters
    as static methods on `SohlCalendarData` registered in `SohlSystem.ts`; they are
    standalone functions in `sohl-calendar-logic.ts` registered via `sohl-config.ts`,
    and the `sohl.relative` example is updated to the real output.

    Closes #477.

- 939b0e3: **Fix Foundry V14 item lifecycle: rename `prepareEmbeddedData` → `prepareEmbeddedDocuments`**

    `SohlActor` overrode `prepareEmbeddedData()`, the V13 Foundry Actor method name. Foundry V14 renamed this to `prepareEmbeddedDocuments()`, so the SoHL three-phase item lifecycle (initialize → evaluate → finalize) was never called. All computed logic-layer properties on embedded items (`score.effective`, `masteryLevel.effective`, `reach.effective`, etc.) were permanently `undefined` at runtime in V14.

    The fix renames the override to `prepareEmbeddedDocuments()` and updates the `super` call accordingly.

- b63af82: **Security:** Fix stored XSS in `ValueModifier.chatHtml` via unescaped delta names (#162).

    Delta `name` and `value` fields were interpolated unescaped into the `chatHtml` string that is rendered via triple-mustache (`{{{ }}}`) in `opposed-result-card.hbs` and `standard-test-card.hbs`. A crafted delta `name` embedded in an opposed-request card's `data-scope` would be revived on the target's client and re-broadcast to all connected clients as live HTML.

    Both `m.name` and `getValue(m)` are now HTML-escaped via the new pure `escapeHTML` utility added to `src/utils/helpers.ts`. Delta names/shortcodes are not validated upstream, so escaping at the source is required.

- 1b9f62d: **Correct valueDesc element localization keys in en.json**

    Fixes [#55](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/55):
    the `valueDesc` element subfields now localize under
    `valueDesc.element.label.*` / `valueDesc.element.maxValue.*`, matching Foundry's
    array-of-schema convention. This removes the key collision that aborted
    localization on world load and places the keys where the field auto-localizer
    looks them up.

- c3ef031: **Fix: form-select fields with array `choices` submitted invalid values**

    A DataModel `StringField({ choices })` used the enum `values` array, but Foundry
    builds `<option>` values from `Object.entries(choices)`, so array choices render
    option values as indices (`0`, `1`, `2`, …). Rendered as an editable select,
    `submitOnChange` then submitted the index, validation rejected the whole form
    update (`X is not a valid choice`), and no edit persisted — this broke the
    affliction, projectilegear, and concoctiongear item sheets.

    `defineType` now emits a value-keyed `choices` label map, and the affected fields
    use it: affliction `transmission`, projectilegear `impactBase.aspect`, and
    concoctiongear `potency`.

    Remaining array-`choices` fields that do not yet render as editable selects are
    tracked in #148.

    Refs #141

- f10d94f: **Game-Icons.net attribution — CC BY 3.0 compliance**

    Now that the complete Game-Icons.net collection is vendored under
    `assets/icons/game-icons/`, tighten its attribution:
    - Record the build-time SVG **modification** (the theme-aware
      `prefers-color-scheme` fill swap) in `ATTRIBUTION.md`, as CC BY 3.0 §4(a)
      requires when licensed material is changed.
    - Point the README `Credits` section at
      `assets/icons/game-icons/ATTRIBUTION.md` as the authoritative per-author
      credit for the full bundled set, rather than the short four-name list that
      understated the ~4,239 icons from 37 contributors now shipped.
    - Correct _Skoll_'s name (was misspelled _Skol_) in two README credits.

- 3f01933: **Tooling/docs: generate the `@heroiclands/sohl-types` declarations from source (#407)**

    `@heroiclands/sohl-types` now ships type declarations **generated from the SoHL
    source** (a `tsc` declaration emit rolled up by `rollup-plugin-dts`), so they can't
    drift: a single self-contained `index.d.ts` that types the `sohl` global with the
    full namespace tree (`sohl.document.effect.foundry.SohlActiveEffect`, …) and
    exports the public Logic/Data and domain class types, with `fvtt-types` kept as a
    peer dependency (it supplies Foundry's globals). Build with `npm run build:sohl-types`.

    Retires the hand-maintained `types/sohl-public-api.d.ts`, which had drifted (it
    still referenced the removed `LineageLogic`) and — being copied with `../src/`
    relative imports — never resolved once copied into a consumer module. The docs
    (`api-access-map.md`, `module-development.md`) now describe the npm package as the
    only consumption path.

    The release workflow publishes the package to npm via **Trusted Publishing
    (OIDC)** — no `NPM_TOKEN` — idempotently on each system release (requires a
    Trusted Publisher configured on npm for this repo + `release.yml`).

- e9f0464: **Guard the Being sheet against uninitialized item logic (#511)**

    A freshly-dropped or not-yet-initialized item could crash the Being sheet. An item's logic seeds its `ValueModifier`s in `initialize()`, so they are `undefined` until that runs; several logic getters and sheet render reads dereferenced them without a guard, so a single such item threw. In the render path this was unrecoverable — dropping an affliction made `AfflictionLogic.levelLabel` throw during the Trauma-tab context prep, and the sheet could no longer be opened.

    Hardened the reads so a partially-initialized item degrades to a default instead of crashing: `AfflictionLogic.levelLabel` and `canHeal`, `SkillLogic.canImprove`, and the Being sheet's Attributes / Skills / Health / body render reads (added the missing optional chaining on the nested modifier). This is a whole class of defect — a logic getter that assumes its modifiers are seeded can brick the sheet when read on an item whose lifecycle has not completed.

- 5b72747: **Being sheet** — the **Trauma** tab is now called **Health** (#1122).

    The tab holds two sections, _Injuries_ (Trauma items) and _Afflictions_
    (Affliction items), so naming it after one of the two item types made it look
    like it promised only traumas — and set up a mismatch, since the Trauma item
    uses a different icon (`fa-user-injured`) than the tab (`fa-heart-pulse`).

    The icon was already right. The sheet follows a consistent rule: a tab holding
    one item type takes that type's icon (Skills, Combat, Mysteries), and a tab
    holding several takes a neutral one (Gear). A tab spanning traumas and
    afflictions correctly takes a neutral health icon; only the name was wrong.

    Label only — the tab id stays `trauma`, so bookmarks, templates, and specs are
    unaffected, and the existing localization key takes a new value rather than
    being renamed.

- dc54121: **Make `helpers.ts` strictly Foundry-free and break the helpers ↔ FoundryHelpers cycle**

    `src/utils/helpers.ts` no longer imports the Foundry shim, so the util layer is a
    true Foundry-free foundation. Previously `helpers.ts` and `FoundryHelpers.ts`
    imported each other; the two runtime touch-points that caused it are gone.
    - `cloneInstance` now merges overrides with a pure, internal `deepMerge`
      (recursive plain-object merge; arrays and scalars replace wholesale) instead of
      Foundry's `mergeObject`.
    - `defaultFromJSON` revives a `ClientDocument` reference through an injected
      resolver registered via the new `setUuidResolver`. The `FoundryHelpers` shim
      (and its test mock) registers `fvttResolveUuid` at load, so Foundry UUID
      resolution is wired in for every runtime path without the util importing the
      shim.
    - Free-standing pure types moved to a new `src/utils/types.ts`: the dialog
      types/interfaces (out of `FoundryHelpers.ts`, still re-exported there for
      existing importers) and `SohlSettingValue` (out of `helpers.ts`). Branded types
      paired with runtime guards (`FilePath`, `HTMLString`, `DocumentId`,
      `DocumentUuid`) stay with their guards in `helpers.ts`.

    No public API or behavior change; enforced by the existing purity test, which now
    loads `helpers.ts` with no Foundry globals and no shim dependency.

- 35ec141: **Icon attributions**

    Expand the icon-attribution list in the README with credits for additional
    icons sourced from The Noun Project and Game-Icons, and sort the list
    alphabetically.

- 7c9ad8c: **Action icons** — unrelated actions no longer share a glyph (#1124).

    The generated Icon Legend put every action icon side by side for the first time
    and showed several unrelated mechanics landing on the same one, so the glyph
    stopped identifying the action:

    | Was              | Action                                 | Now                     |
    | ---------------- | -------------------------------------- | ----------------------- |
    | `fa-heart-pulse` | Arm Healing Check / Arm Recovery Check | `fa-bed-pulse`          |
    | `fa-heart-pulse` | Course Test                            | `ginf-heart-beats`      |
    | `fa-skull`       | Resist the Pall                        | `fa-heart-circle-bolt`  |
    | `fa-skull`       | Pall Recovery Test                     | `fa-heart-circle-check` |
    | `fa-bullseye`    | Calculate Impact                       | `fa-burst`              |
    | `fa-star`        | Improve with SDR                       | `fa-arrow-trend-up`     |

    Where two actions are two halves of one flow the shared glyph is kept on
    purpose — Request and Perform Blood Stoppage, the treatment flow, and each
    action beside its `Resume (…)` continuation all still match, because there the
    glyph names the _concept_ rather than the button.

    The five "Arm …" actions now agree on what the icon names: the **subject** being
    scheduled, following the three that already did (`fa-hourglass` for onset,
    `fa-skull` for resolution, `fa-droplet` for blood loss).

    Also corrects `Item_Attribute.md`, which documented two Font Awesome _Pro_ names
    that had been replaced, pointing readers at glyphs that no longer render.

- f2f6187: **Strike Modes tab: tidier impact formulas.** The Impact column on the WeaponGear
  sheet's Strike Modes tab now follows the same dice-count convention as the rest of
  the system: a single die drops its redundant count (`d6`, not `1d6`), and a strike
  mode with no dice shows just its modifier (`+4`, never `0d6+4`). The sheet and
  `ImpactModifier.diceFormula` now share one pure `ImpactModifier.formatDice` helper
  instead of duplicating the rule. Closes #775.
- e06556f: **Give input fields a clear resting affordance and drop red as an interaction cue**

    Editable inputs, selects, and textareas now show a resting affordance so it is
    obvious where input is accepted: a subtly filled "well" (the warm
    `--sohl-color-bg-input-active` tan, offset from the parchment), a 1px border, a
    small radius, and a faint inset shadow. Previously fields were transparent at
    rest and blended into the sheet background — the only cue appeared on hover.

    Active versus inactive is now unmistakable. A **readonly** or **disabled** field
    renders flat — transparent background, no border, muted text — so it reads as
    display-only and is visibly distinct from an editable well.

    Interaction cues are consistent across the app and no longer use **red**, which
    reads as an error/danger signal. A focused field gets a conventional blue focus
    ring (`--sohl-color-focus-ring`) instead of the former red glow, and the red
    hover glow on rollable elements and chat headers is replaced with the same accent
    blue.

    Closes #757

- 78e87dc: **`isA` guards for item/actor kinds and logic base types**

    The `isA(x, key)` guard now accepts item/actor kind values and the logic base
    types, so a `x.kind === ITEM_KIND.X` check can be written `isA(x, ITEM_KIND.X)`
    with full type narrowing.
    - **Kind checks** — `isA(logic, ITEM_KIND.SKILL)` / `isA(logic, ACTOR_KIND.BEING)`
      match on the logic's serializable `.kind` discriminant and narrow to the
      concrete logic type via a new `ActorLogicByKind` map (mirroring the existing
      `ItemLogicByKind`). No Symbol brand is used for kinds — they aren't
      cycle-forced, and a Symbol would only add un-spoofability, which is
      meaningless for a kind.
    - **Base-type brands** — `SohlItemLogic`, `SohlActorLogic`, and
      `SohlCombatantLogic` gain Symbol brands (inherited getters on their base
      classes), so `isA(x, "SohlItemLogic")` matches any item logic across the whole
      subtype hierarchy — which a leaf `.kind` string can't express.
    - Converted the logic-side kind checks (body-parent guards, the
      skill/attribute opposed-test filter, and the weapongear/combattechnique and
      being combat checks) to `isA`. Foundry-document `.type` checks are unchanged.

    No behavior change: because each registered kind's logic extends a shared base
    (never another registered kind), `isA(x, KIND)` is exactly `x.kind === KIND`.

- 5dccfb1: **Fix the item Description tab persisting to a non-existent field**

    The item-sheet Description tab's ProseMirror editor bound `system.description`,
    which is not a schema field (the item schema defines the long-form description as
    `docHtml` and the short row `notes`). Edits in the Description tab were silently
    dropped. The editor now binds `system.docHtml`, so the item's long description
    persists.

    Closes #536

- f4be3d8: **Constrain the item-sheet header image (#528)**

    An item sheet's header image rendered at its natural size and filled the whole
    `window-content`, collapsing the tab body below it to zero height (its form was
    invisible and could not scroll). The header image is now pinned to a fixed size
    with a divider, like the actor portrait, so the tab body keeps the remaining
    space.

- e5ec29a: **Knowledgebase navigation** — a section landing can no longer hide its own
  pages (#1115).

    The section template only listed child pages when the landing had _no_ body, so
    authoring an introduction silently replaced the section's only navigation. The
    user guide had 41 pages with 1 of them linked, leaving 40 reachable only by
    guessing a URL. Hand-curated indexes had also drifted: Rules linked 27 of its 28
    pages.

    The list is now a **gap-filler** — a landing with a body lists only the pages
    that body does not already link:

    | Landing               | Before           | After                    |
    | --------------------- | ---------------- | ------------------------ |
    | Curated and complete  | list suppressed  | nothing extra shown      |
    | Curated, page missing | page unreachable | the missing page appears |
    | No body               | full list        | full list, unchanged     |

    This keeps editorial groupings intact — Rules' "Key Concepts" section is exactly
    the kind of curation no hierarchy can infer — while making an unreachable page
    impossible. A newly added page shows up under the landing until someone files it
    into the curated index.

- c8799e5: **Knowledgebase site (kb.heroiclands.org) on the shared Heroic Lands theme (epic #418)**

    Stands up the knowledgebase as a Hugo site built on the shared
    `heroiclands-hugo-theme` — the same brand theme behind www.heroiclands.org — so the
    KB shares its header, footer, palette, fonts, and info-block sidebars and reads as
    one property with www and the API site. This supersedes the earlier Astro/Starlight
    scaffold, reusing the polished theme wholesale.
    - **Content-prep pipeline** (`utils/build-kb-content.mjs`), the analogue of the main
      site's exporter: reads the authoritative `assets/content/` tree plus the repo's
      `docs/`, supplies the `title` Hugo needs, and routes each page into Hugo's content
      tree by frontmatter `type` (reference pages get the right infobox; developer docs
      go under `/dev/`). The rendered output is a gitignored build artifact.
    - **Being reference pages** — beings render with portrait, profile, attribute grid,
      categorized skills, and equipment, derived from the note's embedded `sohl.items[]`
      resolved against a content-wide `<type>:<shortcode>` index.
    - **Link resolution** — inline `{@link}` / `{@linkcode}` / `{@linkplain}` tags
      resolve against the TypeDoc symbol map to api.heroiclands.org links, and relative
      `*.md` / source links rewrite to KB dev routes or GitHub blob URLs, both guarded
      to skip fenced code and inline code spans.
    - **Shared nav** — picks up the theme's Projects-dropdown hover-gap fix and the
      API/KB cross-links.

    Covers #418, #429, #435, #437, #442.

- e282133: **Icon Legend** — glyphs now render at twice body size so they can be studied
  (#1120).

    The page previously drew each icon at inline text size, the same size it appears
    at in the interface. That is fine for an icon you already recognise, but this
    page exists for the opposite case: a reader learning the shape so they can spot
    it later. The detail was too small to take in, most noticeably for the
    game-icons artwork, which carries more detail than the Font Awesome silhouettes.

    The size is applied to the glyph element, so the two icon families stay matched —
    `ginf-` glyphs carry their own compensation for their smaller artwork, and the
    em-based baseline shift scales with the element. The global icon metrics are
    untouched; every sheet tab, context menu, and chat card renders exactly as
    before.

- f4be3d8: **Localize action, context-menu, type, and item-tab labels (#527)**

    Intrinsic action names, item context-menu entries, item type subtitles
    (`TYPE.ITEM.*` / `TYPE.ACTOR.*`), and item-sheet tab labels (`SOHL.Item.tab.*`)
    rendered as raw localization keys because the keys were missing from
    `lang/en.json` (and the Actions tab printed the title without localizing it). The
    missing keys are added and the Actions template now localizes the title, so all
    of these show readable text.

- 78e87dc: **Rename the logic `type` getter to `kind`**

    `SohlLogic.type` — the convenience getter returning a logic's actor/item kind
    (e.g. `"skill"`, `"being"`) — is renamed to `SohlLogic.kind`, so the logic layer
    uses `kind` consistently with `SohlLogicData.kind` and the
    `ITEM_KIND` / `ACTOR_KIND` values it returns.
    - Callers now read `logic.kind` instead of `logic.type` (updated across the
      combatant, body, mastery-level, and strike-mode logic).
    - The Foundry document's own `type` property and `logic.data.type` are
      unaffected — only the logic-layer accessor is renamed. No behavior change.

- 84a2d5d: **Build compendium packs from in-repo Markdown; retire the vault export (#419)**

    `build:compiledb` now generates each pack's per-entry JSON from the authoritative
    `assets/content/` Markdown into a `build/packs-json/<pack>/` intermediate and
    compiles the LevelDB packs from it. The JSON is a disposable build artifact — never
    committed — and the build needs no HeroicLands vault.
    - Content is routed by **frontmatter, not directory**: `type` selects the pack (item
      kinds → items, `type: doc` → journals, `character` / `creature` → actors) and
      `package: sohl` scopes it to the system, so setting-specific content is excluded.
    - Removed the `packs:export` / `packs:rebuild` / `packs:clean` scripts and the vault
      code paths (`utils/packs/export.mjs`, `clean-sources.mjs`). The pack compilers now
      read `assets/content/` (`contentBase`) rather than the vault.
    - Entry IDs come from frontmatter `id`, so compiled IDs are unchanged across the
      move (verified against the prior committed sources: items 0 dropped, actors
      identical).

- 78e87dc: **Curated `toJSON` serialization across the entity layer; retire `instanceToJSON`**

          Now that modifiers and results are `SohlEntity` subclasses (which require an
          owning `parent`), several construction and serialization paths were broken.
          These are real runtime bugs, not just stale tests.

          _ValueModifier / ValueDelta:_
          - **`ValueModifier` operators created parentless deltas.** `_oper` (backing
            `add`/`multiply`/`floor`/`ceiling`/`set`) built `new ValueDelta(...)` without a
            parent, so every modifier mutation threw `SohlEntity requires a parent`. It now
            passes the modifier's own parent. The active-effect path
            (`pushDeltaToValueModifier`) had the same bug and is likewise fixed, and
            `changeTypeToOperator` is now correctly typed `ValueDeltaOperator`.
          - **`ValueDelta` and `ValueModifier` were never registered** with the kind
            registry, so serialization round-trips (and `clone`) revived their deltas as
            plain objects — dropping every delta and collapsing the effective value to the
            base. Both now call `registerKind`, so deltas rehydrate as live `ValueDelta`s.
          - **`clone` requires an explicit parent.** `cloneInstance` no longer falls back
            to the source's parent — the cloner must decide what the copy attaches to. Use
            `x.clone(x.parent)` to keep the same owner; `clone(...)` without a resolvable
            parent throws (by design, since a `SohlEntity` must have one).
          - Removed a dead `Symbol("ValueDelta")` and the removed static `ValueDelta.isA`.

          _Serialization model:_

          Serialization now flows through a single driver, `defaultToJSON` (paired with
          `defaultFromJSON`), which honors each object's curated `toJSON` and stamps the
          `__kind` discriminator through the `SohlEntity` chain. The reflective
          `instanceToJSON` helper is **removed** — it bypassed each class's curated
          `toJSON` and would leak internal representation (a resolved logic/skill instead
          of the uuid/shortcode it was resolved from) and transient cache fields.
          - **Every entity now serializes its own state.** Curated `toJSON` overrides were
            added where a subclass carried fields an ancestor's `toJSON` didn't emit:
            `ImpactModifier` (roll, aspect), `MasteryLevelModifier` (target clamps, crit
            digits, tables), `ImpactResult`, `SuccessTestResult` (with uuid/pointer mapping
            for its token and mastery modifier), `AttackResult`, `DefendResult`,
            `OpposedTestResult`, and `CombatResult`. Each `toJSON` emits keys matching its
            `Data` interface so its output is valid constructor input; the situational
            modifier is carried by the mastery modifier's deltas rather than re-emitted
            (which would double-apply on revival).
          - **`SimpleRoll` is now a `SohlEntity`** (moved to `src/entity/roll/`). It is
            owned by a `parent` Logic and serializes through the shared entity machinery;
            `SimpleRoll.fromFormula(formula, parent)` now takes that owner.
          - **A Logic serializes as a resolvable reference.** `SohlLogic.toJSON` no longer
            reflects its internals; a logic is a behavior wrapper over a live Foundry
            document and is never revived from its own JSON, so it emits a compact
            `{ uuid, name, kind }` reference (re-resolved via `fvttLogicFromUuidSync`).

          Combat/opposed cards and clones now round-trip faithfully: nested rolls,
          modifiers, and results rehydrate as live instances with their computed values
          intact, and an embedded `AttackResult`/`CombatResult` is self-contained (its
          `combatantUuid` travels with the payload).

          _Body construction:_

          The body entities are `SohlEntity` subclasses owned by their `BodyLogic`, but
          two construction paths didn't thread the parent through — a runtime break at
          body initialize:
          - **The body logic's `initialize` passed the logic as the options object** rather
            than `{ parent: this }`, so `BodyStructure` received no parent and threw a
            missing-parent error. It now passes `{ parent: this }`.
          - **`BodyLocation` called `super()` with no arguments**, dropping the validated
            parent before it reached `SohlEntity` (and its `Data` now extends
            `SohlEntity.Data`, consistent with `BodyPart`/`BodyStructure`).

          _Action context and chat-card scope:_

          `SohlActionContext` is no longer a `SohlEntity`. It is a runtime value object —
          built fresh at every action dispatch, never revived from its own JSON — so
          forcing it to be an owned, parented entity was wrong. It drops `extends

    SohlEntity`, the parent requirement, the kind registration, and its
  whole-object `toJSON`, and gains a purpose-built `clone(overrides?)`.

          The serializable part of an action is its **`scope`**, and it now crosses the
          client boundary as a single `data-scope` blob:
          - Chat cards emit one `data-scope` attribute — `JSON.stringify(defaultToJSON(scope))`
            — carrying the rich per-action payload (an `AttackResult`, `OpposedTestResult`,
            or injury request) with its `__kind` tags. Routing/dispatch metadata
            (`data-action`, the `data-*-handler-uuid` keys) stays in its own flat
            attributes.
          - The four `onChatCardButton` handlers revive that blob through a shared
            `buildActionScope` helper (`defaultFromJSON`), so a flow reads
            `context.scope.attackResult` / `.opposedTestResult` as a **live** instance
            rather than re-parsing a per-payload JSON string.
          - This removed the hand-rolled per-payload plumbing: `opposedTestResume`'s
            `instanceFromJSON(scope.opposedTestResultJson)`, the dead
            `rehydrateAttackResult` helper (the attack/defense resumes already read
            `scope.attackResult`), and the `data-*-result-json` attributes. A latent
            damage-card bug is fixed along the way — it serialized an `ImpactResult` where
            the injury handler expected a plain injury request, so the parsed impact came
            through as `0`; both injury cards now emit the same `{ impact, aspect, … }`
            request shape.

- d9703c3: **Fix the Mystery sheet's broken "Affected Skills" editor (#808)**

    The Mystery item sheet's Properties tab rendered an "Affected Skills" array-list
    editor bound to `system.skills` — a field the `MysteryDataModel` schema never
    defined. The list always rendered empty and adding a row had no persistent
    effect. A Mystery carries a single associated skill (`assocSkillCode`), not an
    array of affected skills, so the phantom array editor is removed and the existing
    `assocSkillCode` field is surfaced as an "Associated Skill" control instead. No
    data-model change or migration is involved.

- c4dfc5b: **Docs: define each `MYSTICALABILITY_SUBTYPE` value, and fix its display labels**

    The mystical-ability subtypes (`SPIRITRITE`, `SPIRITACTION`, `SPIRITPOWER`, …)
    had no definition anywhere: not in TSDoc, not in `lang/en.json`, not in consuming code.
    The constant is part of the published API (every `src/**/*.ts` export is bundled into the
    TypeDoc entry point), so readers saw twelve bare identifiers with no explanation.

    Each value now carries a one-line TSDoc comment naming its realm (Arcane, Divine, Spirit)
    and what distinguishes it from its siblings. TypeDoc renders these as a member table on
    the `MYSTICALABILITY_SUBTYPE` page.

    Two localization defects are fixed at the same time:
    - `SOHL.MysticalAbility.SubType.BIRTHSIGN` was **missing entirely**. Because
      `MysticalAbilityDataModel` builds its `subType` dropdown from these keys, a Birthsign
      ability rendered its raw localization key in the sheet.
    - The other eleven labels were mechanical title-case of the identifier — `"Spiritrite"`,
      `"Spiritaction"`, `"Divineincantation"`. They are now properly spaced (`"Spirit Rite"`,
      `"Spirit Action"`, `"Divine Incantation"`), taken from the long-unused
      `SOHL.MysticalAbility.Category.*` strings.

    Localization **keys** are unchanged; only the English display strings and the TSDoc move.

- e82a71c: **Namespace barrels + drift-check lint (#402)**

    Adds a hand-written `index.ts` barrel to every `src/` folder that is a namespace,
    forming the `sohl.*` namespace tree (`sohl.document.effect.foundry.SohlActiveEffect`,
    …). Each barrel re-exports its sibling modules via `export *` and its subfolder
    namespaces via `export * as`, with a description on each `export * as` line that
    becomes that namespace's documentation-page prose.

    A drift-check lint (`npm run lint:ns-barrels`, part of `npm run lint`) fails the
    build if a namespace folder lacks a barrel, a module or subfolder is not
    re-exported, or a namespace has no description — keeping the barrels in sync with
    `src/`.

    This is inert groundwork for the namespace-tree epic: nothing imports the barrels
    yet and the docs still build from the flat barrel, so the shipped bundle is
    byte-identical and the API docs are unchanged. Side-effect-only modules (`sohl.ts`,
    `automated-combat.ts`) are intentionally excluded from the tree.

- bdab0fb: Localize the opposed-test chat cards (#1161).

    Every player-visible string on the opposed request and result cards now comes
    from a `SOHL.OpposedTestResult.toChat.*` key instead of English baked into the
    templates: the winner line, _Both Fail!_, _Missile Attack Fails!_, the
    _Results_ / _Source_ / _Target_ grid headers, the _EML_, _Roll_,
    _Success Level Mod_ and _Movement_ labels, and the request card's `X vs. Y`
    subtitle and "performs a … against …" line.

    The card titles are localized too. The result card passed the literal
    `"Opposed Action Result"` to `sohl.i18n.format` as if it were a key, and the
    request card handed the template a **raw** key that it printed verbatim in the
    header; both now resolve through the existing
    `SOHL.OpposedTestResult.toChat.resultTitle` / `.title` keys. The source test's
    title (shown on both cards) and the no-permission warning likewise moved onto
    keys.

    Only new keys were added — no existing key was renamed.

- 2c4f0b8: **Fix: partial array-by-index updates no longer corrupt a being's body structure**

    Hand-built updates that targeted a single element of the `bodyStructure.parts`
    array by index (e.g. `update({ "system.bodyStructure.parts.1.heldItemId": id })`)
    corrupted the **entire** parts array: Foundry rebuilds an array field from a
    sparse `{ index: {…} }` change, truncating it and default-filling every element
    that wasn't named. The first time `holdItem` ran, a being's 6 body parts
    collapsed to 2 — wiping every part's `shortcode`, `canHoldItem`, `roles`, and
    `locations` (hit locations, armor coverage, manipulator/locomotor roles). As a
    knock-on, `releaseItem` then matched nothing (its filter needs the now-wiped
    `canHoldItem`) and could never release.

    Affected executors: `GearLogic.holdItem`, `GearLogic.releaseItem`,
    `BodyPart.addLocationUpdate`, `BodyPart.removeLocationUpdate`.

    Added `BodyStructure.setPartFieldsUpdate`, which sources the full canonical parts
    array and writes it back whole with only the target element(s) modified — the
    same complete-array pattern the existing `addPartUpdate`/`removePartUpdate`
    builders already use. All four sites route through it. `ObjectField`-keyed
    updates (`system.strikeModes.<id>.…`) and form submissions were never affected.

    Fixes #247

- c1d59ee: **Fix: Being Profile tab biography editor binds to `system.dossier`**

    The Profile tab's biography editor bound to `system.biography`, which is not
    defined in the actor schema, so it always rendered empty and edits to it were
    silently dropped. Point it at the existing `dossier` field ("rich-text dossier /
    background notes"). Adds an e2e spec (`profile-section.cy.js`) asserting the
    binding.

    Same bug class as the Façade tab fields fixed in #307.

    Closes #373

- f1bf6b2: **Fix the Being Façade appearance editor rendering empty and the source view covering the toolbar (#897)**

    The Manuscript-redesign editor cards (`.facade__editor` on the Being Façade tab and `.prose-panel__editor` on every Item Description tab) forced `prose-mirror { display: block }`, which dropped Foundry's `menu-container` and `editor-container` out of flex flow. Both collapsed to zero height, so the WYSIWYG view showed no text and the source (`</>`) view rendered over the toolbar. The cards now keep Foundry's `display: flex; flex-direction: column` and fill the card as a flex child (`flex: 1; min-height: 0`), so the editor content and toolbar lay out correctly.

- 4696cf6: **Purge all TODO/FIXME markers; track deferred work in issues only (#440)**

    Deferred work is now tracked exclusively in GitHub issues, not flagged in the code.
    All 26 `TODO`/`FIXME` markers under `src/` are removed; each was already linked to
    an issue (#65, #67, #68, #70, #71, #72, #73, #74, #76), so the work stays tracked,
    and any code-site context was first migrated into the relevant issue.

    This also fixes the **API docs** (api.heroiclands.org): two markers lived inside
    published JSDoc, so the site rendered TODO text as documentation —
    - `CohortLogic`'s entire class description was its `TODO(#76)` block (a second
      `/** */` between the real description and `export class` won). The class now
      publishes its real description; an orphaned duplicate description block stranded
      above the imports was removed, and a latent unresolved
      `{@link COHORT_MEMBER_ROLE}` in that description (previously masked) was fixed to
      the qualified `{@link sohl.utils.COHORT_MEMBER_ROLE}`.
    - `GearLogic.sharedWithCohorts`'s doc no longer trails the TODO paragraph.

    The `lint:todos` guard (`utils/check-todos.mjs`, run in CI and `build:noci`) is
    flipped from "TODO/FIXME must be linked" to "**no** TODO/FIXME markers", enforcing
    the policy going forward. Contributor docs are updated to match. No runtime
    behavior changes.

- 9da0eb0: **Remove `BENEDICTION` as a separate Mystical Ability subtype**

    A benediction is not mechanically distinct from a **Ritual Action** — it is
    performed as one — so `BENEDICTION` is dropped from `MYSTICALABILITY_SUBTYPE`.
    The two shared an identical Being-sheet column layout (Skill / EML / Charges /
    Notes, no Level) and `benediction` carried no special logic branch, so removing
    it collapses a redundant subtype and drops a superfluous section from the
    Mysteries tab. Author a benediction as a Ritual Action instead.

    The `SOHL.MysticalAbility.SubType.benediction` and orphan
    `SOHL.MysticalAbility.Category.benediction` localization strings and the
    user-guide entry are removed with it. Pre-beta, no released worlds, so no data
    migration is required.

    Closes #1013

- fd1e06b: **Mystery items no longer offer a "Use Mystery" action**

    Fixes [#1089](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/1089):
    a Mystery carried a visible **Use Mystery** intrinsic action on its sheet's
    Actions tab and in its context menu that only ever posted _"Using '{name}' is not
    yet implemented."_

    A Mystery models what a character **is** — a standing condition, pool, or
    blessing — while anything a character actively **invokes** is a Mystical Ability,
    which has its own action and roll. There is no universal meaning to "using" a
    Mystery, so the action is removed rather than implemented; a subtype that should
    be spent down is driven by whatever consumes it. A Mystery's effect continues to
    apply as derived state (a Boon or Boost delta onto its associated skill) or
    through its Active Effects, and the item keeps the shared base actions (edit,
    delete, output description to chat).

- 78e87dc: **Runtime type brands via `isA`, replacing cycle-forming `instanceof`**

          Adds a small Symbol-brand mechanism in `constants.ts` — a `BRAND` map (brand key
          → unique `Symbol()`), a `BrandType` registry (key → the type it narrows to), and
          a generic `isA(x, key)` type guard — as a targeted replacement for `instanceof`
          in the one place a value import would form a module cycle.
          - **Breaks an import cycle.** `SohlEntity.clone` no longer uses
            `instanceof SohlLogic`, which forced `SohlEntity` to import `SohlLogic` as a
            value and closed the cycle `SohlEntity → SohlLogic → SohlActionContext →

    SohlEntity`(throwing`Class extends value undefined`when the entity modules
    loaded). It now imports`SohlLogic`type-only and detects it with
   `isA(x, "SohlLogic")`.
    - **Inherited, un-spoofable brands.** A class attaches its brand through an
      inherited getter (`get [BRAND.SohlLogic]()`), so every subtype at any depth is
      recognized. Because the brand is a `Symbol`, it is invisible to
      `Object.keys`/`JSON.stringify`and never leaks into serialized data.
    - **One mechanism, not two.** The earlier one-off`isSohlTokenDocumentLogic`
      string getter is folded into the same pattern
      (`BRAND.SohlTokenDocumentLogic`+`isA`).

        Plain `instanceof` remains the default wherever it does not cause a cycle; the
        brand is added only where the import graph forces it, and the `BrandType`
        registry is meant to grow lazily rather than branding every type.

- 46fafce: **Add a Security Model & Guardrails developer document**

    New `docs/concepts/security-model.md` captures the system's threat model and the
    standing security guardrails for developers: reference code rather
    than compiling it from data (the `__kind` registry, intrinsic method names,
    Foundry macros), why regex "sandboxes" and client-only signatures are not boundaries,
    safe serialization, XSS/HTML rules, cross-client authorization vs. client-side
    gating, ReDoS, and a reviewer red-flag checklist. Linked from the docs index, and
    the contributing standards gain a matching non-negotiable rule.

- bda7662: **Serialization canonicalizes empty entity fields to `null`**

    Extends the null-at-the-edges convention to the entity serialization layer.

    `defaultToJSON` now deep-replaces `undefined` with `null` in the output of any custom
    `toJSON` (a new internal `nullifyUndefined` pass). Serialized entity data — the blobs
    `JSON.stringify`'d into chat-card `data-scope`, flags, and clone round-trips — now spells
    "empty" as `null` consistently instead of relying on `JSON.stringify` silently dropping
    `undefined` keys. This matches "null at the edges" (`null` is JSON-safe) while the logic
    layer keeps `undefined`; the `== null` idiom bridges them on revival. Reads stay
    backwards-compatible: an absent key still revives as `undefined` and is treated as empty.
    A bare top-level `undefined` is unchanged.

    **Small changes**
    - Removed the dead `AnyObject` global alias (an unused duplicate of `UnknownObject`).
    - Tightened `SohlEntity.clone`'s `options` parameter to `Partial<SohlEntity.Options>`
      (its `data` parameter intentionally stays `PlainObject` — an open subclass-override bag).
    - Added tests: `nullifyUndefined` coercion in `defaultToJSON`, and a leaf-entity
      `defaultFromJSON(x.toJSON(), { parent })` reconstruction.

- b3d0f5f: Fix the branded "Game System" section in the Game Settings sidebar reading
  illegibly against the sidebar ground, and center its links (#931).

    The section is Foundry chrome whose ground is painted by _Foundry's_ interface
    theme (`theme-light` parchment / `theme-dark` near-black), but it was coloured
    with `--sohl-color-*` tokens that follow the _OS_ `prefers-color-scheme`. When
    the two disagreed the text mismatched the ground — a Foundry-dark sidebar under
    an OS-light preference rendered near-invisible dark ink on black.

    The palette now tracks Foundry's theme class instead (light tokens under
    `theme-light`, dark under `theme-dark`, via `light-lock` / `dark-lock`), so the
    text and the `<img>` emblem always contrast the sidebar ground and follow a live
    theme toggle. The inline links are also centered (separated by whitespace).

- 1182073: **Sheet display fixes: labels, archetype ordering, gear controls**
    - Item sheets localize the subtype label: a combat skill now reads _Combat Skill_
      rather than the raw _combat Skill_, and the Skills tab _Notes_ column heading
      shows its localized text instead of the bare `SOHL.Skill.Heading.Notes.label`
      key.
    - The create-item/actor dialog lists archetypes alphabetically by name; the
      default selection remains the top-priority winner.
    - On the Being Gear tab, an armor row's three controls (worn, carried, menu) fit
      on a single row again, and the worn and carried toggle icons render light gray
      when off and dark when on instead of always looking active.

    Closes #666
    Closes #667
    Closes #668

- f114074: **Move pure view-model logic out of sheet classes into Foundry-free modules**

    Fixes [#117](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues/117).

    Pure data-shaping that had been written inline inside Foundry sheet classes — where
    it was excluded from test coverage and sat outside the Foundry-free boundary guards
    (the ESLint logic-zone rule and the purity test) — moves into co-located `*-view`
    helper modules under each document's `logic/` directory, each with unit tests. The
    sheets keep only their Foundry-facing orchestration. No user-facing behavior change.

    _BeingSheet_ → new `being-sheet-view.ts`: `groupBySubType` (replacing four inline
    copies across skills, afflictions, mysteries, and abilities),
    `buildContainerTree` (the gear hierarchy and virtual "On Body" list),
    `buildStatusPills`, `buildBodyPartLozenges`, `clampHealthPct`, and
    `splitWeaponsByRange`. The in-sheet `fvttEnrichHTML` proxy is replaced with a direct
    `TextEditor` call (the proxy exists for the logic layer, not for sheets).

    _SohlItemSheetBase_ → new `item-sheet-view.ts`: `localizeSubType` (subtype-label
    localization with raw fallback), `keyTransferredEffects` (enabled transferred
    effects keyed by id), and `findSimilarItem` (the name/type/subtype match behind
    overwrite-on-drop). The sheet keeps the Foundry-facing drop dialog and mutation.

    _SohlActiveEffectSheet_ → new `effect-sheet-view.ts`: `buildChangeTypesMap` (the
    localized change-`mode` label map), `resolveEffectMetadataType` (scope → effect-key
    namespace), and `resolveEffectKeyChoices` (its `ITEM_METADATA` key-choices lookup).

    _Settings apps_ → new `src/apps/logic/domain-manager-view.ts` (`buildDomainGroups` —
    group by family, sort, and compute delete/override flags) and
    `src/apps/logic/calendar-settings-view.ts` (`buildCalendarViewModel` — the calendar
    dropdown rows and imported-calendar list, taking a `localize` callback). The new
    `src/apps/logic/**` directory is added to the Foundry-free zones (the ESLint
    boundary rule and the purity smoke test).

- e87ca4f: **Make sheet content tabs scroll instead of clipping (#514)**

    Long content tabs (the Being sheet's Skills, Combat, Trauma, Gear, and the
    overflowing tabs of other sheets) were clipped with no scrollbar. The base
    `.window-content .tab` rule set `overflow-y: hidden`, and the Being-specific
    override that was meant to fix it (`.being .window-content .tab`) was dead CSS —
    loaded under `.sohl.sheet` it compiled to `.sohl.sheet .being …`, which never
    matches because `sohl`, `sheet`, and `being` share one sheet-root element.

    The base rule now uses `overflow-y: auto`, so every SoHL sheet's tabs gain a
    scrollbar when their content exceeds the sheet height. `window-content` is a
    flex column with a definite height (a Foundry ApplicationV2 default), so the
    `height: 100%` tab is already bounded and needs nothing more. Paired with the
    `scrollable: [""]` part config that preserves scroll position across re-renders.

- 860bfa7: **Polish Skill action labels and the success-test roll-visibility dropdown**
    - The `successTest` action now reads **Success Test** (was "Test") and
      `toggleImproveFlag` reads **Toggle Improve Flag** (was "Toggle Improvement
      Flag").
    - The separate `setImproveFlag` / `unsetImproveFlag` intrinsic actions are now
      hidden from the context menu (`visible: "false"`, `HIDDEN` group); the single
      `toggleImproveFlag` entry supersedes them. Both remain available as executors.
    - The success-test **Roll Visibility** dropdown now labels its options with
      Foundry's localized `CHAT.MODES.*` chat-visibility strings and submits the
      stored roll-mode value (e.g. `"publicroll"`) instead of the enum key, so the
      selection round-trips correctly.

    Closes #688

- ebdca13: **Skill sheet: show the Combat Category field for combat skills**

    The Skill sheet never rendered a control for the `combatCategory` field, so a
    combat skill's weapon/attack category could not be set from the sheet. The
    properties template referenced a `weaponGroup` field (plus stray `baseSkill` /
    `domain` references) that no longer exists in the schema, so the control emitted
    nothing.

    The Skill properties tab now renders a **Combat Category** select bound to
    `system.combatCategory`, shown only when the skill's `subType` is `combat`, and
    drops the dead phantom-field references. Adds the `SOHL.Skill.FIELDS.combatCategory`
    label/hint (the stale `weaponGroup` keys are left in place per the stable-key
    rule).

    Closes #709

- efa853c: **Skill sheet: surface Impaired By Roles**

    The Skill item sheet now displays and edits `impairedByRoles`, at parity with the
    Attribute sheet. The Properties tab renders an **Impaired By Roles** list with
    Add/Delete controls bound to `system.impairedByRoles`; `SkillSheet` passes the
    field into the render context. Previously the field existed in the schema and was
    read by the impairment logic, but could only be set by editing raw data.

    Closes #713

- d50eff4: **Skill: consume `initSkillMult` to open mastery level; show it on the sheet**

    The **Initial Skill Multiplier** (`initSkillMult`) was a persisted-but-inert field
    — never displayed on the Skill sheet and never used to compute anything.
    - **Opening mastery level.** `masteryLevelBase` is now nullable (`integer`,
      `min 0`, `initial null`). When it is unset (`null`) and the skill is on an actor,
      the skill opens deterministically at _Skill Base × initSkillMult_. A stored
      `masteryLevelBase` always takes precedence; off an actor the base stays 0.
    - **Sheet.** The Skill Properties tab now shows an editable **Initial Skill
      Multiplier** control (existing `SOHL.Skill.FIELDS.initSkillMult` keys).
    - **Content.** The `sohl` skill compendium ships `masteryLevelBase` unset so
      shipped skills actually open from their multiplier; the item pack builder now
      preserves an unset value as `null`. Existing worlds keep any explicit value
      (a stored `0` remains `0`), so no migration is required.

    Closes #715
    Closes #182

- 2f896b6: **Skill sheet: editable Parent Skill, and specialization shown in the label**

    The `parentSkillCode` field marks a skill as a specialization of another skill,
    but it had no control on the Skill sheet and never surfaced in a skill's display
    label — a specialization could only be set by editing raw data, and looked
    identical to a standalone skill.
    - **Parent Skill control** — the Skill properties tab now renders an editable
      `parentSkillCode` field, bound to `system.parentSkillCode`, for every skill.
    - **Nullable field** — `parentSkillCode` is now a nullable, non-blank
      `StringField` (`initial: null`). A blank entry is stored as `null`, and any
      legacy empty-string value is cleaned to `null` on load, so "no parent" has a
      single representation.
    - **Label** — a specialized skill's `label` now appends its parent skill's name
      in parentheses (e.g. `Sword (Combat)`), built from the localizable
      `SOHL.Skill.labelWithParent` format string.

    Closes #710

- 78e87dc: **Reorganize the source tree**

    Internal source reorganization to separate Foundry-bound infrastructure from the
    Foundry-free logic and domain layers. No behavior change.
    - **`src/core` split by coupling.** Foundry-bound infrastructure moves to
      `src/core/foundry/` (`sohl-config.ts`, `SohlCalendar.ts`, `SohlDataModel.ts`,
      `URLField.ts`); the Foundry-free logic runtime moves to `src/core/logic/`
      (`SohlLogic.ts`, `SohlSystem.ts`, `SohlSpeaker.ts`, `SohlHookBridge.ts`).
    - **`src/domain` → `src/entity`.** The whole domain tree (action, body, modifier,
      movement, result, strikemode) moves under `src/entity/`, joined by new
      `src/entity/roll/`, `src/entity/event/`, and `src/entity/domain/` homes for the
      roll primitive, event queue, and domain registry.
    - **Kebab-case filenames.** Several modules are renamed to match the convention
      (`armor-aggregation.ts`, `injury-resolution.ts`, `weighted-random.ts`,
      `move-helpers.ts`, `event-trigger.ts`, `builtin-domains.ts`, …); `@src/…`
      imports are updated throughout, and the `eslint.config.js` Foundry-free-zone
      list is repointed at the new paths.
    - **Calendar Foundry/logic split.** `SohlCalendar`'s pure timestamp/formatting
      helpers are extracted into `src/core/logic/sohl-calendar-logic.ts`; the Foundry
      `CalendarData` subclass stays in `src/core/foundry/`.
    - **Dead code removed.** `src/utils/actionInput.ts` (the `DialogBypassContext`
      interface) is deleted — it had no remaining references.

- 2fcd25b: **Refactor: split the Foundry-coupled item/actor foundations into per-concern files**

    `SohlItem.ts` and `SohlActor.ts` each bundled three concerns — the Document, the
    DataModel, and the SheetBase. Each is now its own file:
    - `SohlItem.ts` → `SohlItem` (Document) + new `SohlItemDataModel.ts` + `SohlItemSheetBase.ts`
    - `SohlActor.ts` → `SohlActor` (Document) + new `SohlActorDataModel.ts` + `SohlActorSheetBase.ts`

    Every importer now pulls each class from its own module (no barrel re-exports).
    The pre-existing re-export of the Foundry-free logic contracts
    (`SohlItemBaseLogic` / `SohlActorBaseLogic` and their types) is unchanged.
    Pure reorganization — no behavior change.

    Closes #77

- ebc2be7: **Fix stale edit-pencil selector in the standard-card-buttons e2e spec**

    `cypress/e2e/standard-card-buttons.cy.js` asserted the always-present edit pencil
    via `data-action="successTest"`, but #856 (GM result-edit) gave the pencil its own
    action — the standard test card now renders it as `data-action="resultEdit"`. The
    assertion could never match, so the spec failed deterministically on `main`.
    Updated the selector to `resultEdit`; no production change (the card renders the
    GM-only pencil correctly).

    Closes #909
    Closes #905
    Closes #887

- ef79747: **Fix: migrate weapongear strike-mode `defense` to the nested block/counterstrike schema**

          Every compendium weapongear stored strike-mode defense in the legacy flat
          shape (`defense.blockMod` / `defense.counterstrikeMod`), but `MeleeStrikeMode`
          now reads the nested schema (`defense.block` / `defense.counterstrike`, each
          `{ disabled, modifier, successLevelMod }`). Embedding a compendium weapon on an
          actor therefore threw `TypeError: Cannot read properties of undefined (reading

    'modifier')`during`prepareData()`.

          Migrate all 71 affected `_source` items (162 defense blocks) to the nested
          schema, carrying each modifier value across and defaulting `disabled` to `false`
          and `successLevelMod` to `0`. Verified against the licensed test container:
          `gear-equip`, `combat-setup`, and `combat-automated` specs pass (compendium
          weapons now embed without crashing).

          Fixes #246

- f67f18a: **Strike Mode editor & tab UX fixes**

    Refinements to the Strike Mode editor (`StrikeModeConfig`) and the Weapongear
    Strike Modes tab:
    - **Strike modes stored as an array.** A weapon's `system.strikeModes` is an
      `ArrayField` whose elements each carry their own editable `shortcode` (unique
      within the weapon), replacing the keyed-object shape; the compendium builder keeps
      the authored array shape. _No world migration is required._
    - **Identity header like an item sheet.** The editor leads with a vertical identity
      stack — **name** large, **shortcode** small beneath, **type** medium beneath that
      — modeled on the SoHL item-sheet header, replicated in the editor's own
      `strike-mode-config` stylesheet (the `.sohl.sheet` header rules don't reach this
      frame). The `.form-group.stacked` fields no longer overlap.
    - **Read-only type + auto-save.** A strike mode's type is fixed at creation and
      shown as a plain label (to change it, delete and recreate); the editor persists on
      every field change, and the Save button is gone.
    - **Labels.** _Governing Skill Override_ → _Associated Skill_; the Attack section's
      _Modifier_; the Impact section's _Num Dice_; and _Spread_ → _Zone Die_ when the
      `useZoneDie` world setting is on.
    - **Create dialog + list columns.** The tab's **+** opens a dialog asking for
      **Type, Name, and Shortcode** (shortcode validated unique within the weapon); the
      list shows **Name, Shortcode, Type, Impact formula**. The Weapongear sheet is 100px
      wider to give the columns room.

    Closes #683
    Closes #685
    Closes #687

- 78e87dc: **`StrikeModeBase` is now a `SohlEntity`**

    `StrikeModeBase` — and its `MeleeStrikeMode` / `MissileStrikeMode` subclasses —
    now extends `SohlEntity`, bringing the strike-mode family in line with the other
    domain entities (results, modifiers, body parts). Its constructor forwards the
    owning logic as the entity `parent`, and its `Data` interface extends
    `SohlEntity.Data`.

    No behavior change: strike modes are still rebuilt from schema data on every
    preparation cycle and are not serialized through the kind registry (the
    inherited `toJSON` is unused).

- baa5c6d: **Make success-star / result-description tables serializable as data (#206)**

    A `SuccessTestResult.LimitedDescription` table maps a test outcome to a
    descriptive label — the mechanism for meaningful result text ("You go screaming
    down the halls in terror") rather than a bare "Critical Failure". Its computed
    `label` / `description` / `result` fields were **raw JavaScript functions**, which
    `JSON.stringify` drops silently, so a table could not cross to another client — a
    latent break as soon as anything on the receiver relies on it, and a blocker for
    author-supplied custom tables that must render for every player.

    Those fields are now `string | number | SafeExpression` instead of literal-or-
    function. A `SafeExpression` is **data** (a sandboxed source string), so the whole
    table serializes and revives with no registry and no cross-client module-install
    requirement — following the subsystem's reference-on-wire / live-object-in-memory
    rule. `toJSON` reduces each expression via `serializeLimitedDescriptionTable`; the
    constructor rehydrates it via `reviveLimitedDescriptionTable`, owned by the
    result's parent. The standard success-level table's two computed rows
    (`successLevel ± 1`) become `SafeExpression`s; the literal tables are unchanged.

    Adds the [Result-description Tables](docs/reference/result-description-tables.md)
    developer reference. Computed **string** labels/descriptions need richer
    `SafeExpression` string operations, tracked separately; this change needs only the
    existing numeric expressions. No runtime behavior change to the shipped tests.

- 67afd5f: **Fix the success-test chat card rendering blank Target/Roll and a raw i18n key**

          Clicking a strike mode's **Atk/Blk/CX** value — or running any success test —
          posted a card with an empty **Target**, an empty **Roll** (and failure styling
          regardless of outcome), and a footer showing the literal key
          `SOHL.SuccessTestResult.Failure` instead of a localized result.

          The card renders directly against the result's serialized `toJSON()` payload, but
          the template was written against the live-object shape, so several bindings never
          resolved:
          - **Target / modifier breakdown.** `SuccessTestResult.toChat` now folds the
            modifier into the card data as `mlMod` (its constrained target, per-delta
            `chatHtml` breakdown, `empty`, and `successLevelMod`). The Target now shows the
            modifier's `constrainedEffective` — the value the d100 must roll at or under.
          - **Roll total and outcome styling.** The roll's `total` (a getter absent from
            `SimpleRoll.toJSON`) and the `isSuccess` / `isCritical` outcome booleans are now
            folded in, so the Roll shows the d100 total and the card styles a pass as a
            success.
          - **Localized footer.** Added the six `SOHL.SuccessTestResult.{Success,Failure,

    MarginalSuccess,MarginalFailure,CriticalSuccess,CriticalFailure}` keys (none
    existed) and localized the footer (`{{localize description}}`), so it shows e.g.
    "Marginal Success" rather than the raw key.
    - **Live edit / fate buttons.** The card's root element, its edit-pencil, and its
      Fate Test button read `{{actor.uuid}}`/`{{item.uuid}}`, which `toChat` never
      supplied — so all three rendered empty and the buttons could not dispatch. The
      owning item's and actor's uuids are now folded in.

            Affected every success-test card (skills, attributes, and combat), since they all
            share this render path.

            Resolves #840

- f67f18a: **Character Creation tour: presentation and interaction fixes**

    A batch of fixes making the flagship Character Creation guided tour readable,
    non-blocking, and free of stray artifacts:
    - **Non-blocking overlay.** The tour no longer dims the whole screen or grays out
      the sheets and dialogs a player must read and type into, and pointer events pass
      through the fade on every step — so a coach-and-wait tour never blocks the app it
      is coaching. Open dialogs are lifted above the fade.
    - **Stable step card.** Each step draws a bright ring around its target and shows a
      centered, stable step card instead of anchoring to Foundry's shared tooltip
      (which a sidebar, context menu, or sheet would steal). Highlights are computed
      from a settled, on-screen rect — the tour waits for the target to stop animating,
      scrolls it into view, and clamps the ring to the viewport.
    - **Create-actor step guides the user.** The opening step highlights the **Actors**
      sidebar tab, then (auto-opening and, if collapsed, expanding the directory)
      spotlights the **Create Actor** button — via new `spotlight` / `nav.sidebarTab`
      step options and a stable-rect wait — so the button is always reachable and ringed
      where it comes to rest.
    - **No stranded ghost card.** A tour exited mid-launch (a chat-card Start button
      whose owner exits before render settles, or Escape pressed mid-open) no longer
      leaves an orphan `.tour-center-step`: `_renderStep()` re-checks that this tour is
      still the active tour after its async render await and removes the card it just
      painted, and teardown sweeps any stray card — removing a non-deterministic
      full-suite e2e flake.
    - **Offer card renders markup.** The whispered tour-offer chat card renders its
      inline `**bold**` / `_italic_` as HTML (raw triple-stache), with a centered header
      and no route icon, instead of showing the literal tags.

    Closes #654
    Closes #656
    Closes #658
    Closes #660
    Closes #664
    Closes #665
    Closes #679
    Closes #737

- 498981c: **Hide the framework-demo tour and guide Assisted Combat's Being prerequisite**

    Two fixes to the guided-tour setup as it appears in _Settings → Tour Management_.
    - **The framework demo no longer shows up in the tour list.** The
      `sohl.framework-demo` tour is the SohlTour framework's worked example and e2e
      subject, not a player-facing content tour, but it was registered with
      `display: true` and so appeared alongside the real tours. It is now registered
      with `display: false` — still present in `game.tours` (the e2e suite drives it),
      but no longer listed for users.
    - **Assisted Combat is always startable and coaches its prerequisite instead of
      silently refusing.** The tour needs a populated Being, but it gated `canStart`
      on owning one — so with no Being the **Start** button was greyed out with no
      explanation (Foundry shows no reason). The `canStart` guard is removed (matching
      the always-startable Character Creation tour) and a new first **prepare** step
      guides the user to a Being: keep the character you have, or import the
      _Áldrik Hárvenar_ pregen (Actors compendium → Pregens → right-click →
      _Import Entry_), or any populated Being. Its **Next** stays disabled until an
      owned Being exists, so the later sheet steps always have a subject.

    Resolves #838

- a63b029: **Trauma sheet: sub-type is read-only after creation.** The Trauma item sheet
  no longer renders an editable **Trauma Type** dropdown on its Properties tab. A
  document's sub-type is fixed at creation, and the sub-type is already shown
  read-only in the sheet header (via the localized type label), so the editable
  control was both redundant and incorrect. (Closes #926; supersedes #754, which
  localized the now-removed dropdown's choice labels.)
- a1ceeae: **Fix: turn-start location is now recorded under the field it is read from**

    The `updateCombat` hook wrote the current combatant's turn-start position to
    `system.initialLocation`, but the schema field — and the one
    `spacesMovedThisTurn` reads — is `system.startLocation`. The value was therefore
    never persisted where it was used, so movement-since-turn-start always read the
    default. The hook now writes `system.startLocation` (#386).

    The update payload is built by a new pure, unit-tested helper
    `turnStartCombatantUpdate(center, elevation)`, which guards the field name
    against a future typo.

- 3f58c4c: **Fix `build-type-catalog.mjs` capturing a function's JSDoc instead of the class's (#234)**

    `npm run docs:catalog` described the `skill` type with the `getFateDescTable`
    **function** summary ("Returns the fate-test description table …") instead of the
    `SkillLogic` **class** summary ("A trained capability with a mastery level").

    The class-TSDoc regex used a non-greedy `[\s\S]*?` that started at the _first_
    `/**` in the file and ran through the intervening code to the `*/` before
    `class SkillLogic` — swallowing the earlier function JSDoc. The capture now
    forbids `*/`, so it matches the `/**` immediately preceding the class.
    `docs/reference/type-catalog.md` is regenerated with the correct `skill`
    description (the only type whose Logic file carries an earlier function JSDoc).

- b128b41: **Weapon direct combat is per-strike-mode assisted combat, not weapon-level actions**

    Resolves #69. Assisted combat — rolling attack / block / counterstrike with the
    weapon's modifiers applied, no workflow — is provided by the per-strike-mode
    Atk/Blk/CX cells on the Combat tab (they run `successTest`). The weapon-level
    `attack` / `block` / `counterstrike` intrinsic actions on `WeaponGearLogic` were
    unimplemented stubs (hidden, `visible: false`, warning "not yet implemented"),
    so they are removed rather than implemented — there is no separate weapon-level
    combat action. Also drops their now-unused localization keys and the stale RED
    e2e markers.

## 0.7.0

### Minor Changes

- 2436ecc: **Event Queue**

    Prior simple time-based event queue replaced with trigger-oriented event queue
    - **Generalized from time-only to trigger-based dispatch.** Subscriptions identify
      a trigger (`updateWorldTime`, `combatStart`, `turnStart`, etc.) plus optional
      `fireAt` for time scheduling; `mod:` / `sm:` change application is integrated.
    - **Substantial expansion** in scope (`c6bf726`) with matching test coverage.
    - The retired `SOHL_EVENT` constants are gone in favor of the generalized trigger taxonomy.

- d87fd75: **Restructure and improve the developer/user documentation for readability and usability**

    An intentional, major reorganization of the developer/API documentation. The
    goal is a clearer information architecture, consistent per-document framing,
    better lateral cross-linking, and refreshed navigation so developers can find
    the right document for their goal quickly. The documentation set is now scoped
    as _developer/contributor/API-facing only_ — player- and GM-facing rules live at
    heroiclands.org and are linked to rather than duplicated.
    - **API navigation grouped by architecture** — the generated TypeDoc site
      (api.heroiclands.org) previously rendered the entire public API as a single
      flat, alphabetical class list. The entry-point generator
      (`utils/build-docs-entry.mjs`) now emits a tree of barrel modules that mirrors
      `src/`, so the API sidebar groups symbols as **Core**, **Documents**
      (`Actor`, `Item`, `Combat`, `Combatant`, `Chat`, `Effect`, `Scene`, `Token`),
      **Domain** (`Action`, `Body`, `Modifier`, `Movement`, `Result`, `StrikeMode`,
      `SkillBase`), **Utility** (`AI`, `Collection`, `Constants`, `Helpers`), and
      **Applications**. Each barrel is a TypeDoc `@module` whose full slashed name
      drives folder nesting via `navigation.includeFolders`; `constants.ts` and
      `SkillBase` get dedicated modules so no single node is overwhelming. The HTML
      and Markdown TypeDoc configs and `tsconfig.docs.json` are updated to consume
      the bundle tree via an `expand` entry-point strategy.
    - **A real API landing page with in-site guides** — the TypeDoc site no longer
      uses the project `README.md` as its home (which pitched the game, not the
      API). A dedicated `docs/api-home.md` introduces the reference, keeps the
      banner image, explains the Core/Documents/Domain/Utility layout, and links to
      the guides. The concept, how-to, reference, and contributing guides are pulled
      into the site via TypeDoc `projectDocuments`, so they appear in the left
      navigation alongside the generated modules instead of being unreachable.
    - **Generated type catalog** — `docs/reference/type-catalog.md` is now generated
      (`utils/build-type-catalog.mjs`, wired into `docs:prepare`) from authoritative
      sources: the `ACTOR_KIND`/`ITEM_KIND` enums (the type set), `lang/en.json`
      (display names), and each Logic class's TSDoc summary (descriptions). It can
      no longer drift from the code — adding a type adds a row — and it picked up the
      `attribute`, `trauma`, and `lineage` types the hand-maintained version had
      dropped.
    - **Drift-resistant architecture overview** — `concepts/architecture.md` is the
      canonical "start here". Its hand-maintained inventories (per-file directory
      annotations, the actor/item type tables, the domain class lists) are replaced
      by directory-level descriptions plus links to the generated reference, so the
      page does not go stale as files are added, renamed, or moved.
    - **Cleaner class documentation** — the boilerplate "Logic for the **X** … type
      —" lead-in is removed from all twenty-one actor and item Logic class TSDoc
      comments; each now opens directly with its description.
    - **Single hub and tidied tree** — `docs/README.md` is the one developer/API
      hub (the redundant `docs/dev/` index is retired); a `docs/contributing/` area
      holds maintainer/meta docs; working notes and player-facing rules content that
      duplicated heroiclands.org were removed from the repository.
    - **Local preview** — new `docs:serve` and `docs:watch` scripts serve the built
      site (and rebuild on change) via `http-server`.
    - **Readability** — documents are sorted into the appropriate Di&#225;taxis
      bucket (concepts, how-to, reference), given consistent "who is this for"
      framing, and cross-linked; stable localization keys, data fields, and code
      remain untouched.

- 2436ecc: **Folder Reorganization**

    All document classes live under `src/document/`; old `src/actor/`, `src/item/`, `src/effect/` directories are gone. Tests mirror the new layout.

- ea32d8d: **Expose `getContextOptions()` as public API; keep the Foundry binding internal**

    The instance `getContextOptions()` method is now **public** on `SohlActor`,
    `SohlItem`, `SohlActiveEffect`, and `SohlLogic`, so external code can enumerate
    the actions currently available on a document — e.g. `actor.getContextOptions()`
    or `actor.logic.getContextOptions()`. Each returned entry corresponds to an
    action whose visibility predicate currently passes; `SCRIPT` actions remain
    permission-gated at execution. (This replaces the former internal
    `_getContextOptions`; the static factory wrappers stay internal.)

    In the same pass, the document classes' Foundry framework hooks and internal
    helpers (`_preCreate`, `_onCreate`, `_preUpdate`, `_onCreateDescendantDocuments`,
    `_getInitiativeFormula`, the static `_getContextOptions`, …) are marked
    `protected`, and the scene-config sheet is marked `@internal`, so the Foundry
    persistence/UI binding stays out of the published API. No runtime behavior
    changes.

- 2436ecc: **Calendar**
    - Substantially expanded with parallel test coverage growth.
    - `seasons` system removed.

- 2b490e6: **Define and Initialize Intrinsic Actions Workflow**

    **Executor wiring.** Intrinsic actions resolve their executor by
    case-sensitive method lookup on the scoped logic object at construction
    time, throwing when the method is missing. This release fixes the base
    `postfinalize` action (its executor string now matches the `postFinalize`
    method) and implements the well-defined executors that were declared but
    missing:
    - `SkillLogic.successTest` / `SkillLogic.opposedTestStart` — delegate to the
      skill's `MasteryLevelModifier`.
    - `SkillLogic.setImproveFlag` / `SkillLogic.unsetImproveFlag` — toggle
      `system.improveFlag` via item update.
    - `GearLogic.setCarried` / `GearLogic.setNotCarried` — toggle
      `system.isCarried` via item update.

    Executors for mechanics that are still roadmap work (e.g. WeaponGear
    `attack`/`block`/`counterstrike`, Mystery `useMystery`, MysticalAbility
    `perform`, several Affliction/Trauma tests) remain unimplemented; their
    classes' unit tests document each gap with a focused `it.todo`.

- 606d5fc: **Automated combat resolution**

    Implements the **Automated** combat mode described in
    `docs/reference/combat-modes.md`: a single attack → defend → resolve → injury
    chain walked through chat cards with minimal player input. Builds on the
    assisted pipeline and the `CombatResult` resolution engine.
    - **Attack initiation** — an automated attack resolves the target and distance
      first, then offers only the strike modes that can reach right now: melee by the
      mode's reach, missile by the weapon's **base range**. **Volley** (a missile
      beyond base range) is an area attack with no aim and is **not supported**; a
      wholly out-of-range target short-circuits. The picker defaults to the
      most-recently-used mode, else the best chance to hit. Posts an attack card.
    - **Missile mechanics** — a direct shot at **point-blank** range (≤ half base
      range) is more precise (spread 6) and hits a little harder (impact +2); a
      normal direct shot is spread 8. Melee precision is the strike mode's `spread`.
    - **Defender response** — the attack card's **Block / Counterstrike / Dodge /
      Ignore** buttons each resolve on the _defender's_ client, assemble the
      `CombatResult`, and post the combined outcome. **Counterstrike** is modelled as
      a second attack (the defender slot becomes an `AttackResult`), so both sides can
      land and the card can carry two injury buttons. Buttons are gated at render
      time: only the defender's owner (the GM owns all) sees them, Block/Counterstrike
      appear only when the defender has a capable mode, and an **incapacitated**
      defender (unconscious/asleep/restrained/paralyzed/frozen/incapacitated) is
      reduced to **Ignore** only.
    - **Injury** — the result card forwards the full aim payload (`targetPart` +
      `spread`) so the wound resolves with no dialog, reusing the existing injury
      pipeline.
    - **Combatant-based model** — automated combat is between **combatants**, not
      arbitrary tokens. Targeting keeps only the targeted tokens that are combatants
      of the active combat (exactly one required); the orchestration API takes a
      `SohlCombatant` throughout (token/actor/distance derived from it). The
      most-recently-used attack/block mode persists on `SohlCombatantDataModel`.
    - **Invariants** — checked up front, aborting immediately with a player-facing
      notification: attacker and defender must be combatants in the same active
      combat; the attacker must not be dead/defeated/unconscious/asleep/restrained/
      paralyzed/frozen/incapacitated; the target must not be dead. Documented in
      `docs/reference/combat.md`.
    - **Status effects** — a single `STATUS_EFFECT` constant lists every status
      (Foundry standard + SoHL), a new **Evading** status (`evade`) was registered,
      and the combat call sites use the constant instead of string literals.
    - **Architecture & docs** — established **actor state sovereignty** (an actor
      mutates only itself; cross-actor effects go through a target-addressed chat
      acknowledge button resolved on the target's client) and a **message-channel**
      discipline (in-world events → chat cards; client/player errors → UI
      notification + console; dev diagnostics → console). Both documented in the
      concept/how-to/reference docs and the user guide.

    Resolution helpers (range/spread classification, mode gathering, best-mastery,
    status predicates, card assembly) are Foundry-free and unit-tested; the
    orchestration glue (dialogs, tokens, chat posting, persistence) is Foundry-bound
    and requires in-app verification.

- 2436ecc: **Per-actor cohort handling**

    Cohort drop logic now goes through a dialog (`CohortDataModel.handleCohortDrop`) instead of a token placement no-op.

- a659b3c: **Safe Expressions**
    - a sandboxed expression evaluator
    - synatax based on JS, but does not use a JS evaluator, instead uses a custom highly limited evaluator
    - significantly improves safety for common simple evaluations

- 2436ecc: **Reorganized to remove variants**

    The `MistyIsle`/`Lgnd*` variant split is gone — every document, logic class, and pack now targets the single Legendary ruleset. Hooks remain for module-side extension.

- 2436ecc: **Combat resolution (assisted & automated)**

    Implements the two combat modes documented in `docs/reference/combat-modes.md`.
    - **Chat-card dispatch fix.** The `renderChatMessageHTML` handler read only `data-doc-uuid`, but the combat/injury cards emit `data-handler-uuid` / `data-handler-actor-uuid` / `data-action-handler-uuid`, so none of their buttons dispatched. A new Foundry-free `resolveChatCardHandlerUuid()` (`src/document/chat/chat-card-dispatch.ts`) normalizes the reader across all card conventions without renaming any template attribute.
    - **Injury-resolution pipeline.** New Foundry-free `src/domain/body/InjuryResolution.ts` (`resolveInjury` / `buildTraumaData` / `injuryLevelFromImpact`) — the shared core for both modes. Resolves the hit location (explicit override, aimed scatter, or weighted random), subtracts aspect-specific armor, maps effective impact to an injury level (≤0 none · 1–4 M1 · 5–9 S2 · 10–14 S3 · 15–19 G4 · 20+ G5), and evaluates bleeding/amputation via the existing `InjuryDefaults` tables. `INJURY_LEVELS` moved to `constants.ts` so the domain layer can consume it (re-exported from `TraumaLogic` for back-compat).
    - **Armor aggregation & shock/glancing/fumble.** Worn armor is folded onto body locations each lifecycle cycle (`ArmorAggregation.ts`, wired into `BeingLogic`): every location knows its summed protection per aspect, whether any rigid armor covers it, and the list of covering materials. `resolveInjury` now splits total armor value (natural + worn) from a manual armor reduction and derives the **Shock Index** (`location shock + injury level`, +1 for a glancing blow), **glancing blows** (edged/piercing 1–4 impact against rigid armor → no injury, +10 Shock Roll), and **stumble/fumble** dispositions (roll at Serious, automatic at Grievous) at flagged locations. All zone-die machinery was dropped from the injury model and cards.
    - **Assisted impact roll.** The Combat tab's Impact cell is now clickable (`rollStrikeModeImpact`): it rolls the strike mode's impact dice and posts a `damage-card.hbs`. When a single token is targeted, the card's Calculate Injury button forwards `{ impact, aspect }` to the target, opening the assisted Add Injury dialog. `damage-card.hbs` was flattened onto a real render context (the previous template referenced impact fields that never existed). Pure helpers `buildDamageCardData` added to `combat-actions.ts`; a read-only `aspectType` getter was added to `ImpactModifier`.
    - **Injury cards & Add Injury flow.** `injury-card.hbs` / `injury-dialog.hbs` rewritten to the new model. `SohlActor.onChatCardButton` dispatches the `createInjury` action: an automated request (aimed `targetPart` + `accuracy` forwarded in `data-test-result-json`) resolves with no dialog, while an assisted request opens the Add Injury dialog. The Trauma tab gains a manual **Add Injury** action. Pure, unit-tested helpers (`parseInjuryRequest`, `readInjuryDialogForm`, `buildInjuryCardData`, `resolveAutomatedInjury`) live in `src/document/actor/foundry/injury-actions.ts`.
    - **CombatResult resolution.** `CombatResult.opposedTestEvaluate` / `calcMeleeCombatResult` / `calcDodgeCombatResult` are implemented against the live `OpposedTestResult` API (the previous bodies were commented-out legacy referencing a dead API). Outcomes key off the victory score `VS = attacker.normSuccessLevel − defender.normSuccessLevel` (raw level difference, so the tables resolve every exchange by relative margin): Block lands the attack on `VS >= 0` (a tie also forces a defender weapon-break roll); Counterstrike lands the attacker on `VS >= 0` and the defender whenever its own roll succeeds (both may land); Dodge lands on `VS > 0`, or a tie with a lower dodge roll; Ignore lands the attack when it succeeds. Tactical Advantages (`|VS|−1` to the winner of a 2+ margin) and the weapon-break check are surfaced as display-only fields. Fully unit-tested.

- 2436ecc: **New `Assembly` and `Disposition` Document Types**

    `Assembly` actors (variant-invariant composition containers) and a `Disposition` item type were added.

- 5b09577: **Remove legacy counterstrike behavior**

    A counterstrike shares the **same skill base mastery level** as a normal attack
    but carries its **own modifier deltas** (it can be at a circumstantial
    disadvantage an attack isn't), so `defense.counterstrike` remains a legitimate,
    separate `CombatModifier`. The only legacy here is the **`noCounterstrike`
    trait** — there is no such trait; a counterstrike is gated by `noAttack`, since
    it _is_ an attack.
    - **`MeleeStrikeMode`** — the counterstrike defense is now disabled by the
      `noAttack` trait (or its own `defense.counterstrike.disabled` flag), not by a
      `noCounterstrike` trait.
    - **Constants / localization** — removed the orphaned `VALUE_DELTA_ID.NOCOUNTERSTRIKE`
      (`"NoCX"`) and its two lang keys (`SOHL.Key.NoCounterstrike`,
      `SOHL.ValueDelta.INFO.NoCX`).
    - **`automatedCounterstrikeResume`** — the automated Counterstrike defense now
      rolls the strike mode's `defense.counterstrike` modifier (not its `attack`
      modifier); the best-chance default ranks by it, and modes whose counterstrike
      is independently disabled are excluded.

    Gate counterstrike by `noAttack`; remove the dead `noCounterstrike` trait

    The `defense.counterstrike` modifier, the `SM_COUNTERSTRIKE` ActiveEffect key,
    `TEST_TYPE.COUNTERSTRIKE`, and the assisted **CX** column are all retained.

- 2b490e6: **Restore the Foundry-free logic layer and make it enforceable and tested**

    The logic layer was designed to be unit-testable outside Foundry — logic
    classes define Data interfaces that the Foundry DataModels implement, and
    all Foundry API access flows through the `FoundryHelpers` shim. That
    boundary had silently eroded: the base logic classes and Data interfaces
    lived inside the Foundry document monoliths, the core `SohlLogic` root
    value-imported Foundry-coupled modules, and a handful of logic/domain files
    leaked runtime Foundry references. As a result every item/actor logic class
    was un-importable (and untested) outside Foundry.

    **Boundary restoration (no behavior change)**
    - `SohlItemLogic`/`SohlItemData`/`SohlItemBaseLogic` moved from
      `foundry/SohlItem.ts` to `src/document/item/logic/SohlItemBaseLogic.ts`;
      same for the actor equivalents. The monoliths re-export them, so existing
      imports keep working. Document-type references in the logic layer are
      `import type` only (erased at compile time).
    - The pure context-menu primitives (`ContextMenuEntry`, conditions,
      item/actor resolution) moved from the Foundry-coupled `SohlContextMenu`
      UI class into the new Foundry-free `src/utils/ContextMenuEntry.ts`;
      `SohlContextMenu` delegates and re-exports under its namespace.
    - `combat-actions.ts` and `automated-combat.ts` moved from
      `actor/foundry/` to `actor/logic/` (they were already Foundry-free except
      for two token-targeting statics, now shimmed as
      `fvttGetTargetedTokens`/`fvttRangeToTarget` in FoundryHelpers).
    - Strike-mode schema helpers access `foundry.data.fields` lazily inside
      the schema methods instead of at module load.
    - Misc: vestigial/value imports converted to `import type` across the
      logic, domain, and core layers.

    **Enforcement**
    - New ESLint boundary rule (`@typescript-eslint/no-restricted-imports`,
      `allowTypeImports`) forbids value imports of Foundry-coupled modules
      from the Foundry-free zones. The previously broken `eslint.config.js`
      (uninstalled plugin, ESM `require`, typoed `project`) was rewritten as
      a working flat config; `npm run lint` runs again.
    - New purity smoke test (`npm run test:purity`, wired into `build:noci`)
      imports every logic/domain module with **no** Foundry globals present,
      catching any module-level `foundry.*`/`game.*` access the lint patterns
      might miss.

    **Unit tests for the logic layer**
    - New harness (`tests/mocks/logicHarness.ts`) builds plain-object
      implementations of the Data interfaces, so logic classes construct
      exactly as `SohlDataModel.create()` does in production.
    - The `it.todo` scaffolding across `tests/item/`, `tests/actor/`, and
      `tests/core/SohlLogic.test.ts` was converted into real unit tests for
      all implemented logic behavior; Foundry-layer (DataModel schema) stubs
      and unimplemented mechanics remain documented as todos.

    **Bug fixes surfaced by the new tests**
    - **Situational modifiers were silently dropped everywhere.** Six call
      sites (success/attack/defend tests, automated combat, BeingLogic) keyed
      the player situational-modifier delta as `VALUE_DELTA_ID.PLAYER`, which
      is `undefined` (the map is keyed by shortcode); the dialog-entered
      modifier never reached the roll.
    - **`ValueModifier` operators redesigned to make that bug unrepresentable.**
      `add`/`multiply`/`set`/`floor`/`ceiling` previously dispatched on whether
      the first argument was an object, with `...args: any[]` signatures — so a
      two-argument call silently meant `(name, shortcode)` with no value, and the
      `undefined` first arg above slipped through untyped. They now have real
      typed overloads dispatched by arity:
        - `(shortcode, value)` — the shortcode must be a registered
          `VALUE_DELTA_INFO` member; the display name is resolved from the
          registry and an unknown shortcode **throws**.
        - `(name, shortcode, value)` — explicit, for ad-hoc deltas, unvalidated.
          The shortcode-only form takes a `ValueDeltaInfo`-typed argument, so the
          original `add(VALUE_DELTA_ID.PLAYER, value)` is now a compile error rather
          than a silent miss. The six situational-modifier sites become the clean
          `add(VALUE_DELTA_INFO.PLAYER, value)`. (The stricter typing also surfaced
          `DefendResult` adding a possibly-`undefined` modifier value, now guarded.)
    - `SohlAction`: the constructor now switches on the merged action data, so
      definitions that omit `scope` get the documented SELF default instead of
      throwing `Unknown action scope: undefined`.
    - `SohlAction.toJSON()` serializes the action definition only, fixing an
      infinite recursion when serializing any logic object (action → parent
      logic → actions → …).
    - `SkillLogic`: the Aura-based fate bonus was silently dropped (the value
      was passed in the `shortcode` slot of `ValueModifier.add`); it now
      applies as the `FateBns` delta.
    - The context-menu `Entry` fallback callback invoked a non-existent
      `_getContextLogic` helper (runtime TypeError when an entry had only a
      `functionName`); it now resolves the context item and invokes the named
      logic method.

- 2436ecc: **Combat group allegiance on Foundry-native CombatantGroup**

    Adopts v14's `CombatantGroup` as the single source of truth for combat allegiance under one invariant: two combatants are enemies iff they belong to different groups. Replaces the unused custom `groups[]` / `groupStances` faction-matrix system (discharges roadmap **T2-4**).
    - New `tokenDocument.flags.sohl.defaultCombatGroup` (free-form string, default `"Opponents"`) with a "Default Combat Group" field injected into both the Token and Prototype Token config sheets (`combat-group-hooks.ts`).
    - Combatants are auto-seeded into a `CombatantGroup` on creation (`SohlCombat#_onCreateDescendantDocuments`, batch-aware, case-insensitive find-or-create).
    - `SohlCombatant.isEnemyOf()`, a reworked `allies` getter (same group = ally), and a real `threatenedBy` getter: an enemy threatens unless it is defeated, incapacitated (`unconscious`/`sleep`/`stun`/`restrain`/`paralysis`/`frozen` — `THREAT_NEGATING_STATUSES`), hidden, or out of reach. Weapon reach is a documented placeholder (`reaches()` returns `true`) pending a separate roadmap item.
    - A "Move to Group…" combat-tracker context-menu entry and a per-row group-name label (display only — no group-based turn ordering).

- 2436ecc: **Logic Extraction**

    Document classes (`SohlItem`, `SohlActor`) are thin Foundry wrappers; per-type rules live in `*Logic` classes under `src/document/*/logic/`. All Foundry API access funnels through `src/core/FoundryHelpers.ts`.

- 2436ecc: **Major Overhaul of Active Effects System**

    A ground-up rebuild of how SoHL applies ActiveEffects, with three composable change-key prefixes and a scope-driven targeting model.
    - **Scope Vocabulary** (`SohlActiveEffectDataModel.scope`):
        - `"this"` — the owning document
        - `"actor"` — the owning actor
        - `<itemKind>` — every item of that kind on the actor, filtered by the `test` predicate

        The previous `"test"` scope is retired (it conflated scope with filter). Scope determines the EFFECT_KEY namespace shown in the changes UI, so the dropdown is always deterministic.

    - **Change-key Prefix System**
      | Prefix | Semantics |
      |---|---|
      | `mod:<path>` | Push a `ValueDelta` onto the `ValueModifier` at `<path>` on the target doc |
      | `sm:<path>` | Set `<path>` on each strike mode of the target weapon, filtered by `strikeModePredicate` (WeaponGear only) |
      | `mod:sm:<path>` | Composes the above: push a delta on each matching strike mode's ValueModifier |

        `strikeModePredicate` is a new per-change SafeExpression field with `sm` as the variable binding; empty means all strike modes.

    - **Pull-model Dispatch**:
        - `SohlItem#transferredActiveEffects()` and `SohlActor#transferredActiveEffects()` — phaseless gather of effects living elsewhere that target this doc.
        - `SohlItem#allApplicableEffects()` and `SohlActor#allApplicableEffects()` (override) — own self-targeting effects + transferred. Foundry's stock `Actor#applyActiveEffects(phase)` consumes the override unchanged.
        - `SohlItem#applyActiveEffects(phase)` — SoHL-driven dispatch since transfer is off; called from `SohlActor.prepareEmbeddedData` between item Phase I (initialize) and Phase II (evaluate).
    - **Schema**: `SohlActiveEffectDataModel` now mirrors v14 Foundry's `changes` ArrayField verbatim (key/type/value/phase/priority) and adds the SoHL-only `strikeModePredicate`.
    - **WeaponGear Effect Keys**: 9 new `SM_*` keys (ATTACK, IMPACT, SPREAD, LENGTH, REACH, BASE_RANGE, DRAW, BLOCK, COUNTERSTRIKE).
    - **Status registration fix**: `SohlSystem` now spreads Foundry's default `statusEffects` (dead, unconscious, sleep, stun, prone, restrain, paralysis, frozen, …) alongside the custom `incapacitated`/`vanquished` entries. Previously the config array replaced the defaults wholesale (because `mergeObject` overwrites arrays), leaving combat conditions like `stun`/`prone` unrepresentable at runtime.
    - **Aural Shock status**: added as a registered `statusEffect` (`auralShock`, "Aural Shock", `shock.svg`) — toggleable from the token HUD. The Being sheet header status panel now renders short condition abbreviations (e.g. `STN`, `ASHK`) with full-name tooltips and an active-state highlight, and corrects the `stunned`→`stun` id.
    - **Effect Key Catalog**: `*_EFFECT_KEY` blocks added or completed for: Attribute, Affliction, ArmorGear, CombatTechnique, ConcoctionGear, ContainerGear, Lineage, MiscGear, Mystery, MysticalAbility, ProjectileGear, Skill, Trait, Trauma, WeaponGear. Each block lists the modifier-target paths consumable by `mod:`-prefixed effect changes. Matching lang entries shipped in `lang/en.json`.

- 2436ecc: **Scene Enhancements**

    **`SohlScene` replaces `SohlRegion`/`SohlEncounter`/region-behavior.** New `SohlSceneDataModel`, `SohlSceneConfig`, `SohlSceneLogic` along with combat-tracker hooks (`combat-tracker-hooks.ts`) that inject `moveFactor` / `displayedMedium` fields and computed move display per tracker row.

- 2436ecc: Actor & combatant reach

    BeingLogic.reach`is the greatest reach among the actor's currently *available* melee strike modes: combat-technique modes are intrinsic (always available); a weapon mode counts only while the weapon is held in at least its`minParts` limbs (`canHoldItem`body parts).`SohlCombatant.reach`surfaces that value for the combatant. The availability + max logic lives in the Foundry-free`reach-helpers.ts` (`computeActorReach`). `SohlCombatant.reaches(other)`returns whether this combatant's reach covers the center-to-center grid distance to`other`, so `threatenedBy`now reports an enemy`c`as a threat when`c`'s melee reach extends to the combatant.

- 2436ecc: **Lineage Item**

    A new item representing the anatomy and movement characteristics of a being.
    - **`move-helpers`** replaces `MovementFactorDefaults` / `MovementProfile` — a single source of truth for medium-aware movement math.
    - **Size-based melee reach.** Lineage gains a `reachBase` field (feet; medium creatures = 0) surfaced as a `reach` ValueModifier on `LineageLogic`. A melee strike mode's `reach` ValueModifier is seeded from the weapon's `lengthBase`, and the wielder's lineage reach is added on top during the owning logic's evaluate phase (`WeaponGearLogic.evaluate` and `CombatTechniqueLogic.evaluate`; the latter now holds its strike-mode instance, exposed via `CombatTechniqueDataModel.strikeModeInstance`). Lineage is a Being-only concept: a non-Being (or absent) lineage adds nothing (reach stays at length), while a Being that lacks a lineage logs a warning in `BeingLogic.finalize` (it cannot move, wield weapons, etc., and should be treated as unusable).
    - **Domain registry** (`SohlDomains` / `builtinDomains`) added as a cross-cutting registry for cohorts, beings, and assemblies.

### Patch Changes

- ea32d8d: **Expand API reference documentation (TSDoc)**

    Add accurate TSDoc across high-value public API surfaces so developers building
    against SoHL get complete, trustworthy reference docs. This is a comments-only,
    non-behavioral effort (no runtime logic, signatures, or data fields change), run
    in reviewable batches per the API documentation coverage plan.

    **Documented so far:**
    - **All result types (`domain/result/`)** — complete coverage of `TestResult`
      (the abstract base), `SuccessTestResult`, `OpposedTestResult`, `AttackResult`,
      `DefendResult`, `CombatResult`, and `ImpactResult`: class members,
      constructors (parameters and `@throws`), the success-level and
      opposed-resolution getters, the `evaluate` / `testDialog` / `toChat` overrides
      (each documenting only what it adds over the base), and the `Data` / `Options`
      / `ContextScope` / `LimitedDescription` namespace types.
    - **All modifier types (`domain/modifier/`)** — complete coverage of
      `ValueModifier` (the base + deltas model: operators, inspection/mutation
      methods, disabled state, chat rendering), `MasteryLevelModifier` (target
      clamping, critical digits, success-level offset, and the success /
      success-value / opposed test methods), `ImpactModifier` (dice, aspect,
      formula, evaluation), `CombatModifier`, and the `ValueDelta` building block —
      including their namespace types. Internal plumbing is tagged `@internal`.
    - **The rest of the Domain layer** — the anatomy/hit-location model
      (`BodyStructure`, `BodyPart`, `BodyLocation`, armor aggregation, injury
      resolution, weighted hit-location selection), the strike-mode combat types
      (`StrikeModeBase`/`MeleeStrikeMode`/`MissileStrikeMode`: reach, attack,
      impact, block/counterstrike), the `SohlAction` action system, the per-medium
      movement helpers, and the `SkillBase` formula — classes, exported functions,
      and namespace/`Data` interfaces. With this, the entire `domain/` layer is
      documented.
    - **The `SohlActor` document module** (`document/actor/foundry/SohlActor.ts`) —
      the actor document's lifecycle and data-preparation overrides
      (`prepareBaseData`, `prepareEmbeddedData`'s phase-batched lifecycle,
      `prepareDerivedData`), creation hooks (`_preCreate`, `_onCreate`,
      `createUniqueName`), the `SohlActorLogic` / `SohlActorData` interfaces, the
      `SohlActorDataModel` base, and the `SohlActorSheetBase` render/context hooks.
    - **The `SohlLogic` core base** (`core/SohlLogic.ts`) — the abstract logic base
      every actor/item logic class extends: the document accessors
      (`id`/`name`/`type`/`item`/`actor`/`speaker`/`label`), the `actions`
      collection and context-menu/default-action helpers, the phase-batched
      lifecycle methods, the intrinsic-action exports, and the `SohlLogicData`
      interface. Documenting the base cascades to every subclass's inherited members.
    - **All actor and item Logic classes** (`document/actor/logic/*` and
      `document/item/logic/*`) — every Logic class and its `*Data` interface: class
      summaries, the data interfaces and all their members (including nested
      object-literal fields), synthesized properties (documented in terms of the
      data field they derive from — e.g. a `ValueModifier` seeded from a `*Base`
      number, or a resolved logic object from a shortcode), getters, constructors,
      and the intrinsic-action / test methods where the business logic lives. The
      inherited lifecycle methods (`initialize`/`evaluate`/`finalize`) are
      deliberately left to inherit their base-class documentation.
    - **The Foundry binding layer is marked `@internal`** — every DataModel and
      Sheet class (concrete and base, plus core `SohlDataModel` and its
      `SheetMixin`) is tagged `@internal` and excluded from the published API. The
      supported extension surface is hooks, action items, and the Logic / domain
      classes — not the Foundry persistence/UI binding. The data _shape_ remains
      documented through the public `*Data` interfaces.
    - **Documented the data-access pattern** — every `*Data` interface is marked as
      the shape of `system` for its document type, and the architecture overview
      explains that `document.logic.data` (typed as the `*Data` interface) is the
      recommended, fully-typed path to a document's fields — equivalent to
      `document.system`, which is the same object but typed as the now-internal
      DataModel.
    - The internal `AIExecutionResult` interfaces are tagged `@internal` so they no
      longer appear in the published API.
    - **The `utils` layer** (`utils/`, excluding `constants.ts`) — the shared helper
      classes and functions developers reach for when traversing documents and
      building actions: `helpers.ts` (type guards, brand types, name/uuid utilities,
      the `AsyncFunction` compiler), `SimpleRoll`, `SohlMersenneTwister`,
      `SohlLogger`, `SohlLocalize`, `SohlContextMenu`, `SourceMapResolver`, `Itr`,
      and `collection/SohlMap` — class summaries, members, parameters/returns, and
      the meaningful structural members of return shapes and type-guard predicates.
      The `utils/ai/` agent-plumbing module is tagged `@internal` and excluded from
      the published API.
    - **The `sohl.*` runtime surface** — the global `sohl` object is a `SohlSystem`
      singleton, so its public surface is now documented: the `SohlSystem` class
      (the `CONFIG` registry getter — documented lightly — plus `i18n`, `log`,
      `events`, `utils`, `constants`, `game`, `calendar`, `setupSheets`, and the
      calendar-registry statics), the `SohlSystem.Config` namespace and its
      per-document-type registration blocks, and the actor/item DataModel / Logic /
      sheet registry barrel exports. The world calendar (`SohlCalendarData`,
      `SohlCalendarComponents`) and the event-trigger taxonomy (`SohlEventQueue`
      was already documented; `SohlTriggerContext` is now covered) round out
      `sohl.calendar` and `sohl.events`.
    - **The action-execution context** — `SohlActionContext` (the context every
      intrinsic action receives: `speaker`, `target`, `skipDialog`/`noChat`,
      `type`/`title`, the generic `scope` payload, plus `toJSON`/`clone` and the
      `character`/`token` accessors) and `SohlSpeaker` (who is acting and how its
      voice is rendered to chat: identifier resolution, `toChat`,
      `getChatMessageSpeaker`, `isOwner`, and the `ChatOptions`/`Data` namespace
      types). Underscore-prefixed internal helpers are kept out of the public API
      (`_prepareChat` is `protected`; the `_speaker` cache field is `@internal`).
    - **The `SohlItem` document** — the item document class plus the base
      `SohlItemData` members (`item`, `label`, `notes`, `docHtml`) whose docs
      cascade to every concrete item type's `*Data` interface, completing the
      actor/item document pair alongside `SohlActor`.
    - **The `FoundryHelpers` isolation layer** — the supported wrappers the codebase
      routes Foundry API calls through (e.g. `getGame`/`getCanvas`/`getCurrentUser`/
      `getCurrentScene`, the HTML/template renderers, and the dialog config types
      `DialogConfig`/`DialogButton`/`AwaitDialogResult` and their callbacks).
    - **Combat/scene document + logic stragglers** — `SohlCombat`, `SohlCombatant`
      (+ `StrikeModeRef`), `SohlActiveEffect`, `SohlSceneLogic`, the combat/combatant
      logic view interfaces, the strike-mode helpers, `SohlDomains.getChoices`,
      `URLField`.
    - **The settings-menu UIs are marked `@internal`** — `DomainManagerApp` and
      `CalendarSettingsMenu` are Foundry `ApplicationV2` bindings, not part of the
      hook-based extension surface, so they are excluded from the published API
      (same treatment as the sheets and DataModels).
    - **`constants.ts` top-level tables + `defineType`** — every top-level exported
      enum/table, value union, and helper in `constants.ts` now carries a concise
      one-line description (`ACTOR_KIND`, `ITEM_KIND`, `TRAIT_CODE`, `SKILL_CODE`,
      `VALUE_DELTA_OPERATOR`, the `*_METADATA`/`*_EFFECT_KEY`/`*_SUBTYPE` groups,
      …). `defineType` — the foundation nearly every constant set is declared with —
      and its `DefinedType` result are documented in depth (with `@typeParam`,
      `@example`, and `@remarks`). The thousands of self-describing individual
      members of those tables are intentionally **not** documented per-member; that
      reference data lives in the contributor guidelines and the player rules site.
    - **A documentation-coverage gate** (`npm run docs:coverage`,
      `utils/docs-coverage.mjs`) runs the TypeDoc `notDocumented` validation and
      fails on any undocumented symbol outside `constants.ts`, so the "fully
      documented" state is now enforceable rather than manually checked.

- fc3c528: **Enforce explicit `override` modifiers with `noImplicitOverride`**

    Enable the TypeScript `noImplicitOverride` compiler option and add the `override`
    keyword to every class member that overrides a base-class member — 67 members
    across 39 files. This is a non-behavioral, compile-time-only change: no runtime
    logic, method signatures, or data fields are affected, and the full test suite
    is unchanged and green.

    The members affected span methods, getter/setter accessors, and properties.
    Constructors, `private`/`#private` members, and interface implementations are
    intentionally untouched — `noImplicitOverride` only governs `extends`-based
    inheritance.

    **Why:** explicit `override` makes inheritance intent visible and safe. Renaming
    or removing a base-class member now produces a compile error at every stale
    override (rather than silently leaving a new, disconnected member behind), and
    overrides that no longer match a base member are caught immediately. With the
    flag enabled, the compiler enforces the keyword on all future overrides, so the
    codebase stays consistent without manual review.

    **Scope:** the keyword is applied wherever the compiler can prove a base member
    exists. Members that override loosely-typed Foundry base classes (via
    `fvtt-types/lenient`) or classes produced by the sheet mixins may not all be
    marked, because the base member isn't visible to the type checker; this is
    expected and harmless.

- 3e931a1: **Fix the release automation so versioned changes actually publish.**

    The release workflow's build-and-publish job was gated on a `published` output
    that `changeset version` never sets, so the GitHub Release and packaged
    `system.zip` / `system.json` were never produced. The job now triggers once the
    **Version Packages** PR merges — detected via `hasChangesets == false` plus an
    untagged `package.json` version — and creates the `v<version>` tag and Release
    with the manifest attached.

    Also removes the redundant `changeset-pr.yml` workflow, which referenced a
    nonexistent `npm run version` script; opening the Version Packages PR is now
    handled solely by the consolidated release workflow (with the
    `pull-requests: write` permission it needs).

    Finally, the release prints a reminder (in the run summary) with the exact
    `gh workflow run deploy-docs.yml --ref v<version>` command to publish the
    versioned API docs — needed because a Release created with `GITHUB_TOKEN`
    can't auto-trigger `deploy-docs.yml`. That manual dispatch now mirrors the
    build to `/latest` (matching the automatic release behavior) when run against
    a tag.

- ea32d8d: **Normalize member visibility to the underscore naming convention**

    Align member visibility with the project's underscore naming convention so the
    two always agree: a leading underscore means `protected`, while `private`
    members carry no underscore.
    - **Public underscore members → `protected`.** Every underscore-prefixed
      class member that was `public` (by omission) is now `protected`. Foundry
      framework overrides keep their underscore names; the compiler confirmed each
      can be `protected` (their fvtt-types bases are already protected), and Foundry
      still invokes them at runtime since TypeScript visibility is erased.
    - **Private underscore members → de-underscored.** Members that were `private`
      stay `private` and have the leading underscore removed (e.g. `_subs` →
      `subs`, `_dispatchOne` → `dispatchOne`). The exception is a private backing
      field paired with a public getter of the same name (e.g. `_parent` ↔
      `get parent()`, `_logic` ↔ `get logic()`); those keep the underscore, since
      the field and accessor cannot share a name.
    - **`skillBaseForRoll` → `_skillBaseForRoll`.** The one `protected` member that
      lacked an underscore is renamed to match.
    - Constructor parameters (including underscore-prefixed unused parameters) are
      unaffected.

    This is an encapsulation/hygiene change with no runtime behavior change. The
    public underscore members were already internal by convention; making them
    `protected` also removes them from the published API reference (TypeDoc excludes
    protected members).

- 4e0a3fb: **Overhaul the generated API documentation: working cross-references, a
  hierarchical navigation tree, and links out to the Foundry API.**

    **Cross-reference resolution.** A docs build surfaced 178 unresolved `{@link}`
    warnings. TypeDoc's link resolver degrades as the API is split across multiple
    entry-point modules, so the previous per-group barrel tree stranded valid links
    between, e.g., `Documents/Item` and `Domain/Modifier`. The entry point is now a
    single flat module (`utils/build-docs-entry.mjs`), which resolves every internal
    link — **178 → 0**.

    **Hierarchical navigation, preserved.** Architecture grouping is restored at the
    navigation layer instead of via modules: `typedoc-plugin-source-category.mjs`
    assigns each symbol a `@category` from its `src/` path (a hand-written
    `@category` always wins), and `typedoc-plugin-nested-nav.mjs` splits the
    slash-encoded category names into a real nested tree at render time. The sidebar
    shows `Documents ▸ Actor`, `Domain ▸ Modifier`, etc. — the folder-tree feel,
    with zero broken links.

    **Links to the Foundry API.** `typedoc-plugin-foundry-links.mjs` resolves
    `fvtt-types` symbols to the official Foundry API site, in both doc comments and
    rendered type signatures, so `{@link Scene}` links to
    `foundryvtt.com/api/classes/foundry.documents.Scene.html`.

    **Structure and authoring.** The symbol API is one module renamed **API
    Reference**, whose landing page is authored by hand in `docs/api-module.md`
    (pulled in via `{@include}`). All guides now live under a top-level
    **Documentation** node that mirrors the `docs/` layout (Concepts, How-to,
    Reference, Contributing), built with TypeDoc document `children` frontmatter.

    Source changes are comments-only (broken/inappropriate `{@link}`s reworded or
    de-linked); no runtime code, types, or behavior change.
