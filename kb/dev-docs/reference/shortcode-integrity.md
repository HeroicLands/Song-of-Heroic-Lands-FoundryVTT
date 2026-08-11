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

## Where it is enforced

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

### Build time — packs

Authored compendium content is Markdown under `assets/content/`, seeded into packs by
the compendium CLI, which **bypasses `_preCreate`**. The build-time guard
`lint:packs` (`utils/check-pack-shortcodes.mjs`, part of `npm run lint`) walks that
content and fails on any duplicate `(type, shortcode)` within a pack. Because a type
routes to exactly one pack, a global `(type, shortcode)` collision _is_ a within-pack
collision.

## The resolver matrix

The pure decision logic is {@link sohl.utils.resolveShortcodeKey} — Foundry-free and
unit-tested. It takes the desired shortcode, the document name, the taken set, and a
`shortcodeDedupe` flag, and returns `{ shortcode }` or `{ reject: true }`:

| shortcode in data | name → slug | `shortcodeDedupe` | result |
| --- | --- | --- | --- |
| provided | — | `true` | collides → suffix (`arrow` → `arrow2`); else accept |
| provided | — | `false`/absent | collides → **reject**; else accept |
| blank | non-empty | `true` | base = slug; collides → suffix |
| blank | non-empty | `false`/absent | base = slug; collides → **reject** |
| blank | blank | `true` | random 16-char id |
| blank | blank | `false`/absent | **reject** |

A Foundry native duplicate (`_stats.duplicateSource`) suffixes an explicit collision
even without `shortcodeDedupe`. The random-id branch uses an **injected** generator so
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

## The shortcode is the published URL

Because `(type, shortcode)` is unique by rule, it is also what **addresses a content
note on the web** — content notes carry no authored `slug` (#1278):

| Surface | URL |
| --- | --- |
| Knowledgebase page | `/<section>/<shortcode>/` — e.g. `/armorgear/mbyrn/` |
| An item's `system.docUrl` | `https://heroiclands.org/sohl/<type>/<shortcode>/` |

`contentSlug` in `utils/content-slug.mjs` derives the segment: the shortcode,
transliterated (so a non-ASCII character is carried across rather than dropped) and
reduced to lowercase URL-safe characters. A KB section _is_ its type, so the shortcode
alone addresses the page unambiguously; two notes that would nonetheless publish to the
same URL (shortcodes differing only in case or punctuation) fail the build via
`findSlugCollisions`, which names both files.

Deriving the URL rather than authoring it removes a field that could drift from the
identity it duplicated — under the old name-derived slugifier, `Ālverrik` reduced to
`lverrik`, so accented names needed a hand-written override to stay addressable.

**The one record of the old URLs** is `kb/data/legacy-slugs.json`, keyed by
`type:shortcode`. The knowledgebase build emits a Hugo `aliases` redirect from each,
so pre-existing links keep resolving. It is append-only history: never edit an entry,
and add a row only when a page's URL changes again.

Developer docs (`kb/dev-docs/`) are not content notes — they have no shortcode and keep
their own `slug` frontmatter, routed by source path.

## Testing

- **Resolver** — `tests/utils/helpers.test.ts` exercises every matrix cell with an
  injected `makeRandomId` stub (no Foundry).
- **URL derivation** — `tests/build/content-slug.test.ts` covers `contentSlug` and
  `findSlugCollisions` (no Foundry).
- **Runtime + dialog + pack** — `cypress/e2e/shortcode-uniqueness.cy.js` drives the
  live client: an explicit collision is rejected on create, `shortcodeDedupe` suffixes
  it, renaming into a collision is rejected on update, and the same code on a different
  type is allowed. The build-time guard is `npm run lint:packs`.
