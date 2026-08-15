# Shortcode Integrity

See also: [Runtime Contracts](./runtime-contracts.md), [Extension Points](../how-to/extension-points.md), [System Development](../contributing/system-development.md)

`shortcode` is the system's stable lookup key. Together with `type` it addresses a
document — `fvttFindItemByShortcode`, `fvttActorByShortcode`, the action registry
(`actions.get(shortcode)`), cohort members, expression references, and archetype
override/dedup all resolve by it. This page is the contract for how that key is kept
**unique and never-null**.

## Identity semantics

`(type, shortcode)` is a **logical identity**, not merely a lookup convenience:

> Two documents of the same `type` bearing the same `shortcode` denote the **same
> logical entity** — regardless of their Foundry `_id`s and regardless of their field
> values.

The Foundry `_id` identifies a _particular stored document instance_; `(type,
shortcode)` identifies _which thing that instance is_. A compendium `WeaponGear`
`bsw`, a world copy of it, and an embedded copy on an actor are three distinct
instances (three `_id`s, possibly three different states of wear and modification) of
**one** entity, the broadsword. Sameness of `(type, shortcode)` is what "the same
thing" means in this system; `_id` equality and value equality are neither necessary
nor sufficient for it.

This is what makes **matching** well-defined, and matching is the reason the key
exists:

- **Compendium ↔ world reconciliation.** A world document is recognized as _the same
  entity_ as its compendium origin because they share `(type, shortcode)`, even
  though import gave the world copy a fresh `_id` and the user has since edited its
  values.
- **Archetype override / shadowing.** A world archetype with the same `(type,
  shortcode)` as a shipped one _shadows_ it in the Create dialog — same identity,
  world copy wins.
- **Cross-scope lookup.** `fvttFindItemByShortcode` / `fvttActorByShortcode`,
  `actions.get(shortcode)`, cohort membership, and expression/effect references all
  resolve an entity by this identity rather than by a brittle, localizable name or a
  scope-local `_id`.

The uniqueness invariant below exists **to keep this identity well-defined**: if two
different entities within one scope shared a `(type, shortcode)`, "the same thing"
would be ambiguous and every match above would be unsound.

## The shape rule

A `shortcode` is **strictly alphanumeric** — `^[A-Za-z0-9]+$`. No hyphens, no
underscores, no spaces, no punctuation, no accented letters. Case is unconstrained
(hundreds of authored codes are mixed-case, e.g. `armorgear:BCap`).

The rule is not cosmetic. A shortcode is half of the `type-shortcode` address that
content wikilinks and knowledgebase pages parse, and that parse depends on the
separating hyphen being the **only** hyphen in the string (see
[Linking Between Content Notes](content-links.md)); the same key also has to survive
URLs, YAML frontmatter, and expression source unescaped.

The pattern lives in one place, `src/utils/shortcode-format.mjs` (`isValidShortcode`
/ `sanitizeShortcode`), which is plain ESM precisely so the runtime, the world
migration, and the bare-`node` lint script all share it rather than each carrying a
copy.

Repair, where a violation cannot simply be refused, **strips the offending characters
and keeps case** — `B&CFl` → `BCFl`, `self-pro` → `selfpro`. That is deliberately not
`slugifyShortcode`, which also lowercases: that one derives a _new_ key from a display
name, while a repair keeps an _existing_ identity as recognizable as possible.

## The invariant

`(type, shortcode)` is unique within each of four **scopes**, and `shortcode` is a
non-null, non-blank string on every persisted key-bearing document:

| Scope | Uniqueness set |
| --- | --- |
| **World items** | every item in `game.items` of the same `type` |
| **Embedded items** | an actor's own items of the same `type` |
| **World actors** | every actor in `game.actors` of the same `type` |
| **Compendium pack** | a single pack's entries of the same `type` (items or actors) |

Cross-scope duplicates are fine: a world item and an embedded copy, or the same code
in two different packs, do not collide. Two _different_ types may also share a
shortcode (the key is the pair).

## Where both rules are enforced

Enforcement is entirely at runtime and build time — the schema field itself stays
permissive. The base `shortcode` field in `SohlDataModel.ts` is
`StringField({ initial: "" })`, deliberately **blank-tolerant at construction**:
Foundry validates a document _before_ `_preCreate` runs, so a strict `blank: false`
here would reject bare creates before the key could be filled. (No subtype schema
overrides this field — earlier comments claiming otherwise were aspirational.)

### Runtime — create and update

Two shared Foundry-layer guards resolve the scope, apply the key, and veto a
disallowed operation. They are wired into both documents' create **and** update hooks:

- `SohlItemDataModel.ts` `_preCreate` and `SohlItem.ts` `_preUpdate` (items)
- `SohlActor.ts` `_preCreate` and `_preUpdate` (actors)

Each calls the shared helpers in `shortcode-uniqueness.ts`
({@link sohl.core.foundry.enforceShortcodeOnCreate},
{@link sohl.core.foundry.enforceShortcodeOnUpdate}, and the scope resolver
{@link sohl.core.foundry.collectTakenShortcodes}). Historically only _create_ was
guarded and compendium creates were skipped; both gaps are now closed.

A collision and a malformed key are different mistakes with different fixes, so the
veto says which: `SOHL.CreateDocument.duplicateShortcode` for the first,
`SOHL.Shortcode.invalidCharacters` for the second. The Create dialog's live check
disables **Create** for either, so a human never reaches the `_preCreate` reject.

### Build time — packs

Authored compendium content is Markdown under `assets/content/`, seeded into packs by
the compendium CLI, which **bypasses `_preCreate`**. The build-time guard
`lint:packs` (`utils/check-pack-shortcodes.mjs`, part of `npm run lint`) walks that
content and fails on any shortcode that is not strictly alphanumeric, and on any
duplicate `(type, shortcode)` within a pack. Because a type routes to exactly one
pack, a global `(type, shortcode)` collision _is_ a within-pack collision.

Content is authored in the vault and exported here, so a malformed key is fixed in
the **vault note** and re-exported — an edit to `assets/content/` alone is reverted by
the next export. A key that has already shipped also needs a world migration, since
`shortcode` is identity referenced from saved world data.

### Existing worlds — migration

The 0.9.0 migration `alphanumericShortcode` (`MigrationRegistry.ts`) rewrites any
stored shortcode that fails the shape rule, applying the same strip-and-keep-case
repair, so a world that imported a legacy key keeps pointing at the same entity as its
renamed compendium origin. It leaves a blank shortcode alone (filling one in is the
create/update guard's job, and only the guard knows the scope's taken-set) and leaves
a key untouched when neither it nor the document name yields anything alphanumeric —
a random id would sever the identity rather than preserve it.

## The resolver matrix

The pure decision logic is {@link sohl.utils.resolveShortcodeKey} — Foundry-free and
unit-tested. It takes the desired shortcode, the document name, the taken set, and a
`shortcodeDedupe` flag, and returns `{ shortcode }` or `{ reject: true }`:

| shortcode in data | name → slug | `shortcodeDedupe` | result |
| --- | --- | --- | --- |
| provided, alphanumeric | — | `true` | collides → suffix (`arrow` → `arrow2`); else accept |
| provided, alphanumeric | — | `false`/absent | collides → **reject** (`collision`); else accept |
| provided, not alphanumeric | — | `true` | stripped (`B&CFl` → `BCFl`), then as above |
| provided, not alphanumeric | — | `false`/absent | **reject** (`invalid`) |
| blank | non-empty | `true` | base = slug; collides → suffix |
| blank | non-empty | `false`/absent | base = slug; collides → **reject** |
| blank | blank | `true` | random 16-char id |
| blank | blank | `false`/absent | **reject** (`missing`) |

A reject carries a `reason` (`collision` / `invalid` / `missing`) so the veto can say
which mistake was made. Shape is settled before uniqueness: a malformed key cannot be
made valid by suffixing it. Surrounding whitespace is trimmed, not treated as a
breach.

A Foundry native duplicate (`_stats.duplicateSource`) suffixes an explicit collision
— and repairs a malformed code — even without `shortcodeDedupe`; it is copying a key
it did not author. The random-id branch uses an **injected** generator so
the resolver stays Foundry-free; the Foundry layer passes
{@link sohl.core.FoundryHelpers.fvttRandomId} (Foundry's id charset). Deduplication
reuses {@link sohl.utils.uniqueShortcode}; name derivation reuses
{@link sohl.utils.slugifyShortcode}.

> **Behavior note.** `_preCreate` is **strict by default**: a name-derived _or_ explicit
> collision without `shortcodeDedupe` now fails (previously the name-derived case always
> auto-uniquified). Callers that legitimately create colliding siblings must opt in.

## The `shortcodeDedupe` option

Any document opts into automatic key management by passing `shortcodeDedupe: true` to
the create/update operation (`Document.create(data, { shortcodeDedupe: true })`); it
threads to `_preCreate`/`_preUpdate` as `options.shortcodeDedupe`. It is not a Foundry
operation field, so typed call sites cast the options object.

- **Opt in** (auto-manage) — system-generated creation that names no key of its own:
  `fvttCreateEmbeddedItems` (the logic layer's item-creation boundary — inflicted
  trauma, fatigue, …) and cross-actor gear drops in `SohlActorSheetBase.ts`.
- **Stay strict** (reject on collision) — the human Create dialog, which instead
  pre-resolves a unique shortcode and **live-checks** the field, disabling **Create**
  until it is unique (warning key `SOHL.CreateDocument.duplicateShortcode`). See
  [Extension Points §10](../how-to/extension-points.md).

## Shortcodes are identity, not URLs

A shortcode is unique, stable, and short — which makes it a tempting URL segment. It
is deliberately **not** one. Content notes carry no authored `slug` either (#1278);
the published URL is derived from the note's **name**:

a knowledgebase page is `/<section>/<name-slug>/` — e.g. `/creature/nusvorroth/`.

The reason is the invariant above: a shortcode is referenced from **saved world
data** — actions, cohorts, expressions, archetypes, pack lookups. Binding a public URL
to it would turn a cosmetic URL change into a data migration, and would publish
`/creature/nsvrroth/` where a reader expects `/creature/nusvorroth/`. Identity and
presentation are kept apart: the shortcode addresses the document, the name addresses
the page.

No document stores a URL of its own, either. In-app documentation is the compiled
JournalEntry an item points at through `docHtml`'s `@UUID`, which survives any change
to the published address; a per-document absolute URL would make one a pack rebuild
plus a world migration.

`contentSlug` in `utils/content-slug.mjs` is the single derivation. It transliterates
before reducing, so an accented character is carried across rather than dropped —
`Nüsvōrroth` becomes `nusvorroth`, where the old slugifier produced `n-sv-rroth` and
forced a hand-written override. Ligatures expand as a reader would spell them
(`þ`→`th`, `æ`→`ae`, `œ`→`oe`, `ß`→`ss`, `ĳ`→`ij`, `ﬁ`→`fi`; eth follows the Icelandic
`d`), apostrophes are removed rather than made separators (`Armorer's Kit` →
`armorers-kit`), and a fraction keeps its digits together (`Kûrbúl ¾-Helm` →
`kurbul-34-helm`, not `kurbul-3-4-helm`).

Nothing stops two notes in one section from sharing a name, so `findSlugCollisions`
fails the build naming every claimant rather than letting one page overwrite the other;
the fix is a more specific title. The content tree has no collisions today.

**The one record of the old URLs** is `kb/data/legacy-slugs.json`, keyed by
`type:shortcode` — the identity, which is exactly why the shortcode belongs *here*
rather than in the URL. The knowledgebase build emits a Hugo `aliases` redirect from
each, so a rename never orphans an inbound link. It is append-only history: never edit
an entry, and add a row only when a page's URL changes again.

**`aliases` means two different things, and only one of them is a URL.** In Obsidian a
note's `aliases` are alternative _names_ — what a reader might call the thing, and what
makes a bare `[[Text]]` wikilink resolve (see
[Linking Between Content Notes](content-links.md)). In Hugo they are _redirects_. A
display name is not an old URL, so an authored alias is never published as one: every
redirect a page emits is **generated**, by `pageRedirects` in `utils/kb-redirects.mjs`,
from the legacy-slug map above and from the pre-split `/guide/` → section move. Names
stay in the vault, where they mean something.

Developer docs (`kb/dev-docs/`) are not content notes — they have no shortcode and keep
their own `slug` frontmatter, routed by source path.

## Testing

- **Shape rule** — `tests/utils/shortcode-format.test.ts` covers `isValidShortcode`
  and `sanitizeShortcode` (no Foundry).
- **Resolver** — `tests/utils/helpers.test.ts` exercises every matrix cell with an
  injected `makeRandomId` stub (no Foundry).
- **Migration** — `tests/domain/migration/MigrationRegistry.test.ts` covers the
  0.9.0 repair, including the three renamed content keys.
- **URL derivation** — `tests/build/content-slug.test.ts` covers `contentSlug` and
  `findSlugCollisions` (no Foundry).
- **Redirects** — `tests/build/kb-redirects.test.ts` covers `pageRedirects` and
  `applyRedirects`: the legacy-slug and section-move redirects still emit, a display-name
  alias never does, and no page redirects to itself.
- **Runtime + dialog + pack** — `cypress/e2e/shortcode-uniqueness.cy.js` drives the
  live client: an explicit collision is rejected on create, `shortcodeDedupe` suffixes
  it, renaming into a collision is rejected on update, and the same code on a different
  type is allowed. The build-time guard is `npm run lint:packs`.
