# Shortcode Integrity

See also: [Runtime Contracts](./runtime-contracts.md), [Extension Points](../how-to/extension-points.md), [System Development](../contributing/system-development.md)

`shortcode` is the system's stable lookup key. Together with `type` it addresses a
document — `fvttFindItemByShortcode`, `fvttActorByShortcode`, the action registry
(`actions.get(shortcode)`), cohort members, expression references, and archetype
override/dedup all resolve by it. This page is the contract for how that key is kept
**unique and never-null**.

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

## Testing

- **Resolver** — `tests/utils/helpers.test.ts` exercises every matrix cell with an
  injected `makeRandomId` stub (no Foundry).
- **Runtime + dialog + pack** — `cypress/e2e/shortcode-uniqueness.cy.js` drives the
  live client: an explicit collision is rejected on create, `shortcodeDedupe` suffixes
  it, renaming into a collision is rejected on update, and the same code on a different
  type is allowed. The build-time guard is `npm run lint:packs`.
