# sohl

## 0.8.8

### Patch Changes

A module or package that builds against SoHL's published content needs `@heroiclands/package-build` 23.1 or later to read it.

The Being page does the same, naming its Health tab and its Mysteries tab by the names a reader actually sees.

**Afflictions** — The Outcome Traumas expression edited on an affliction's sheet is kept, so the traumas an affliction inflicts take effect.

**Items** — The Blowgun and Meteor Hammer skills and the blowgun dart are in the catalogue, so a weapon naming them finds what it names.

**Crafts** — Ceramics, Glassworking, and Woodworking now price every catalogue article the same as the gear item it names.

**Foundry compatibility** — The system is verified against Foundry 14.368, so it installs and runs there without a compatibility warning.

**User guide** — Affiliation, Armor, Concoction, Container, Gear, Mystery, Projectile, and Trauma items each carry a field-by-field guide to their Properties tab, naming the handful of fields with no sheet control of their own.

**Developer docs** — The house-rules cookbook's affliction recipe names the field an outcome trauma expression actually saves under.

**Journal illustrations** — Images honor named sizes and float positions, with text wrapping that adapts to the journal window.

**Metalcraft** — A smith's everyday work turns a profit: shoeing a horse, driving a piton, and forging chain or a tin plate each sell for more than the iron they take.

**Armour** — Every garment and suit weighs in proportion to how much of the body it covers and what it is made of, consistently across the articles sharing a cloth or hide.

**Pregenerated characters** — Áldrik Hárvenar, Álverrik Tárvallor, Brunjár Skathhelm and Basic Folk each name the archetype they fit and the day they were born.

**Prone** — The rules page lists only the effects a prone being actually suffers.

**Maps** — The sample regional map and the two sample battle maps are gone, and the system no longer ships a Scenes compendium or an Adventures compendium.

**Limb Block** — Only a clear victory wards the blow; a tie lands it on the raised limb, two points lighter and against that limb's own armour.

**Weapons** — Each weapon blocks and counterstrikes by its own values, so a battleaxe and a broadsword defend differently.

**Mystical abilities** — An arcane or divine incantation reads the standing of the body that teaches it, and marks a shortfall on the sheet without blocking the roll.

**Item icons** — An item created on the hotbar or through Add Trauma carries its themed icon.

**Attack cards** — The result card names the weapon the defender blocked with.

**Shields** — A held shield adds its Shield Mod to every block its bearer makes, to their dodge, and to a press; two shields grant the better.

**Tactical Advantages** — The attack card states what one spent on Impact is worth, and the strike-mode ledgers carry the value per mode.

**Attributes** — An attribute test is impaired by injury to the body parts it depends on, and a ruined pair of arms can critically fail one outright.

**Injuries** — A serious wound to an arm calls for a Fumble Test and one to a leg for a Stumble Test, on every creature in the bestiary.

**Net** — Its envelop mode shows no impact at all, which is what a manoeuvre carries.

**PDF edition** — a release carries the whole User Guide, Rules, and reference catalogue as a single searchable, bookmarked PDF, matching the knowledgebase's own chapter order and titles. Print it, annotate it, or read it on an e-reader.

**User Guide** — The Structure and Vehicle pages describe every tab their sheet shows, including a shared Mysteries tab and, on a Vehicle, the Occupants tab.

**Pages** — A page whose note names its own hero image shows that image rather than the stock banner for its kind.

**Rules** — Each Trauma section now opens by saying what harm it covers, how its pages relate, and where its rules hand off to a neighbour.

**Unarmed Combat** — A grab, a punch and a limb block are offered only while a hand is free to perform them, and one free hand is enough.

## 0.8.7

### Patch Changes

The Basic Folk archetype describes itself on the sheet and on its page, saying
what the template is and how to make a character out of it, rather than
reading TBD.

Every page lists the pages that link to it and the pages it links to,
grouped by type, at the foot of the page.

The site has a search box: every page's text is searchable, and a search can be narrowed by page type.

**Affiliations.** Record skills commonly taught by an organization and open them from its sheet. Missing skills stay visible for review; listing a skill does not grant it to a character.

**Every bundled asset says where it came from.** The eight combat sounds and the
parchment ground carry their attribution, source and licence alongside the art
they describe, as the icons and portraits already did.

**The developer documentation is part of the knowledgebase.** Every developer
page — architecture, the how-tos, the content-creator guides, the reference
pages and the contributing guides — is a note like any other, published at
`/sohl/doc-<shortcode>/` beside the rules and the user guide and linked from
[the developer documentation index](https://www.heroiclands.org/sohl/doc-devdocs/),
whose page lists are generated so a page cannot be left out. None of these
pages compiles into a compendium document.

**Addresses.** The former `/sohl/kb/dev-docs/…` addresses answer 404; each
page has one address, `/sohl/doc-<shortcode>/`.

**Drafts.** An actor or item marked a draft carries an amber ring on its

picture — on its own sheet, in the sidebar, and in the compendium you are
browsing — so an unfinished entry reads as unfinished before you rely on it.
Anything not marked looks exactly as it did.

your own note that the entity is half-built, unverified, or not yet adapted for
your table. Anyone who can edit the sheet can set it, and clearing it leaves any
"draft" wording in the entity's own description alone.

**The Pall.** The rules, the user guide and the Face the Pall card name the
undead in the system's own words — one that walks on with its will intact, one
left mindless for another will to drive — instead of one world's folk names for
them.

**The types package is no longer published to npm.** TypeScript authors
writing against the `sohl` global no longer have a generated `@types`
package to install; a module still reaches every runtime value through the
live `sohl` global the same way it always has.

**The knowledgebase wears the shared header.** Every page under `/sohl/` now
carries the same navigation as the rest of heroiclands.org — Home, Song of
Heroic Lands, HârnMaster 3, Thalorna, the Other Modules menu and License — so
moving between the sites is one menu rather than one per site. The "Main Site"
link in the system's settings sidebar opens the Song of Heroic Lands landing
page.

**The system's description reads the same everywhere.** Foundry's package
listing shows the one-paragraph description the project publishes, rather than
a separate pitch of its own.

**The module describes itself separately for Foundry and for the site.**
Foundry's package browser shows a formatted pitch; the site's search-result
snippet shows one plain sentence. The two no longer share a single string,
so each reads naturally for its own audience.

**The world keeps its own calendar.** Dates on sheets, chat cards and the date
picker now read against whichever calendar your world uses, rather than the one
the system chose for you. A calendar module you install is the one you see.

**Settings.** The Calendar entry is gone from system settings, and with it the
business of picking a built-in calendar or importing one from a file.

**Dates.** The picker shows the year alone, without an era beside it.

## 0.8.6

### Patch Changes

**Compendiums and content**

- The three maps — Hearthmoor and both floors of the Wayfarer's Rest — ship as
  Scenes, with background, ambient sound and tiles in place.
- Every being's portrait arrives with the system; icons, portraits and map images
  reach the compendium documents and the website, and a labelled link between
  notes resolves from a bare shortcode.
- A being's portrait sits in its Facade appearance text, placed where you put
  it. A portrait picked by hand on a character is not carried forward; re-add
  it there.
- The weapon catalog is grouped by weapon type, and a catalog with nothing to
  show renders nothing instead of a bare header.

**Characters and sheets**

- A shortcode is lowercase. One typed with a capital is refused, and a world
  carried forward has its keys folded without changing what they point at.

**Website**

- Every knowledgebase page carries a profile box per game system, listing the
  page's own fields; skills, spells and carried gear link to their entries.

## 0.8.5

### Patch Changes

- This release exists so that add-on packages such as Thalorna and Kethira can
  build against it. Nothing in the installed system changes.

## 0.8.4

### Patch Changes

**Compendiums and content**

- Áldrik Hárvenar carries one Swimming skill instead of two.
- The Textile folder in the journals compendium is named Textile, not Dye.
- The Afflictions journal's Fatigue and Fear tables list their entries, and the
  Religious gear table's heading is spelled correctly.
- The Bestiary describes its animals in real-world terms and its rules page
  covers animals only; setting creatures belong to the Thalorna package.
- Three empty folders — Birthsigns, Corpora, Local Maps — are gone, and each
  map's documentation journal is filed in that map's folder.

**Upgrading**

- Every compendium document's UUID changes once. A world, macro or module that
  addresses a SoHL document by UUID must be re-pointed.

## 0.8.3

### Patch Changes

Requires Foundry 14.359 or later.

**Rules and combat**

- A failed attack never lands, and a tied Block wards the blow.
- Strength reaches the blow: every melee and thrown strike takes a Strength
  Impact Modifier, off-hand use costs one more, and launchers get none.
- Eight unarmed techniques — Bite, Grab, Headbutt, Kick, Limb Block, Press,
  Punch, Trip — ship on every pregen, goblin and Grukar; a pinned limb is
  Immobilized yet keeps its grip.
- A creature's body scale follows a compressive curve capped at 3, so the largest
  creatures are hard to wound rather than impossible.
- Success Stars are Value Diamonds, drawn as five diamonds on the card; a card
  posted before this release must be re-run.

**Compendiums and content**

- Every armour article's covered locations, weights and prices match the source
  table; cloaks and breastplates protect from one side only; ring mail is a real
  material with two plain helms.
- Gear prices derive from material, coverage and craft labour and round to whole
  pence. New gear: siege engines and ammunition, canvas clothing, 48 containers,
  jewellery in five materials, holy symbols, grooming kits.
- Every animal and creature has a body to hit, natural weapons and six creature
  skills; the Mythic creatures are built from their entries; creature and
  birthsign notes move to the Thalorna package.
- Item descriptions live once in the journals compendium, each item pointing at
  its journal; phobias are Fear traumas; a Macros compendium and a Credits &
  Attributions journal ship.

**Characters and sheets**

- An affiliation records what kind of body it is and how it stands toward
  others, both on its Properties tab; an existing world's kinds migrate, with
  the old social kind landing on fellowship.
- Skills drag to reorder within their group, ledger numbers and group headers
  read at full weight, and every sheet header carries a GM-only Archetype
  Priority field.
- A suggested shortcode transliterates accented names and abbreviates long
  ones; punctuation in a shortcode is refused and a world's keys are repaired;
  the delete confirmation names the document type.

**Website and documentation**

- The rules open with a reading order and close with a glossary; Resolution,
  Combat, Crafting and Divination are written; every skill and mystical ability
  says how it works.
- The whole of `/sohl/` — landing page with install instructions, knowledgebase
  and API reference — lives at www.heroiclands.org; every link, including
  Foundry's Game System links, points there.
- Cross-references in journals and on the website land on the named section, a
  link to a missing note is marked, Beings is one section, and a missing page
  returns a real 404.

## 0.8.2

### Patch Changes

- This release only corrects an image in the project README. Nothing in the
  installed system changes.

## 0.8.1

### Patch Changes

- The system loads: 0.8.0 failed on install with a script error before it
  initialised.

## 0.8.0

### Minor Changes

**Characters and sheets**

- The Being sheet and every item sheet wear the Manuscript design — parchment
  and ink, a health bar, clickable status pills, per-part injury lozenges, and a
  print button that renders a paginated character record.
- Skills roll from their ML cell (Shift skips the dialog); gear toggles carried
  and worn; each limb picks what it holds; body structure, strike modes, effects
  and custom actions are edited on the sheet.
- Cohort, Vehicle and Structure sheets gain Profile, Members, Occupants and
  Shared Gear tabs and are marked Experimental.
- The Create dialog is archetype-first: pick Basic Folk or any shipped template
  and get a populated document. A shortcode is unique within its type and is
  suggested from the name.
- Formula fields open a code editor with highlighting, autocomplete and live
  validation; `rand()`, `roll()` and string helpers join the expression
  language; a GM's Script Action bound to a Macro overrides a built-in action.

**Rules and combat**

- Opposed tests run end to end and report ties; Victory Stars show whose margin
  it is; Fate raises a rolled test's success level; a GM pencil re-evaluates a
  card on its frozen roll.
- Harm has a full model: wounds are treated, heal, bleed, infect and impair
  permanently; shock, coma, fear, morale, the Pall and psyche stress; afflictions
  incubate, run their course and resolve.
- Nothing acts on a character without a click: a timed check posts a reminder
  and offers its next occurrence, and a physician's treatment or blood stoppage
  takes effect when the patient accepts it.
- Modifiers reach the roll: Boon and Boost mysteries, incantation level
  penalties, impaired limbs (−5, −10 or an automatic critical failure), prone
  (−20), fatigue, and a creature's body scale on the injury table.

**Compendiums, journals and settings**

- Rules journals cover health, injury, trauma, afflictions, shock, gear, Fate
  and Esoterica; the user guide documents every action; a welcome card and two
  guided tours greet new players.
- Personality and physique traits, privations and fatigue are Trauma conditions;
  Right and Left Dominance are conditions; the Corpus and combat-technique items
  are gone; the Vylarian Reckoning is the calendar.

### Patch Changes

- Standard tests score critical successes and failures, roll a real d100 rather
  than a fixed 99, and their cards show the target, the roll and readable labels.
- Item sheets render and save edits; context menus, search filters and tab
  scrolling work; sheets, cards and icons are legible in dark mode; being
  portraits and token art come from the creature's own images.
- Weapon strike modes take the associated skill's mastery level and flat impact;
  Block and Counterstrike are not offered on a missile-only weapon; Automated
  Combat starts from the combat tracker; Add Injury records the wound.
- Worn armour does not count toward encumbrance; armour protection and
  encumbrance are editable; a Theatre of the Mind scene measures no distance.

## 0.7.0

### Minor Changes

**Rules and combat**

- Two combat modes: assisted rolls from the Combat tab's Atk, Blk, CX and Impact
  cells, and automated combat walked through chat cards — attack, then Block,
  Counterstrike, Dodge or Ignore, then injury.
- Injuries resolve through one pipeline: hit location, armour by aspect, injury
  level, bleeding, amputation, shock index and glancing blows.
- Combat sides are combatant groups: a Default Combat Group on the token, Move to
  Group… in the tracker, and an enemy is anyone in another group.

**Characters and sheets**

- Active Effects target the item, the actor, or every item of a kind by
  predicate, and can reach a weapon's strike modes; stun, prone and Aural Shock
  toggle from the token HUD.
- Safe Expressions: a sandboxed formula language for predicates and computed
  values, with no JavaScript evaluator behind it.
- A Lineage item carries anatomy, size-based reach and movement; Assembly and
  Disposition are new document types; the MistyIsle and Legendary variants are
  one ruleset.
- Skills roll a Success Test or start an Opposed Test from their context menu,
  and gear toggles carried; the calendar drops seasons.

**Documentation**

- The API reference is grouped by architecture with working cross-references and
  links to the Foundry API; developer docs are organised by concept, how-to and
  reference.

### Patch Changes

- A situational modifier entered in a test dialog reaches the roll, and the Aura
  fate bonus applies.
