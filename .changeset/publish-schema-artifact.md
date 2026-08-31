---
"sohl": minor
---

Publish this system's `system` field sets as `schema.json`, so a content build
can check what it emits against what a document will actually receive
(HeroicLands/package-build#60).

Foundry discards an unknown `system` key when a document is constructed, and
says nothing: the value is absent at load while the build that wrote it
reported success. `mysticalability` emitted `assocMysteryCode` for a whole
release that way. Both directions of the mismatch were found by
set-subtracting compiled documents' `system` keys against `defineSchema()` **by
hand**, which is how the next one would have had to be found too.

A content build cannot do that comparison itself: `defineSchema()` lives here,
in TypeScript, behind Foundry's field classes. So the field sets are published
as data — the shape the link manifest already uses for addresses, rather than a
build reaching into a sibling checkout.

**Read from the source, not from a running Foundry.** A DataModel's schema is
only introspectable inside Foundry, so `utils/build-schema-artifact.mjs` reads
the TypeScript AST, as `lang-references.mjs` and `build-type-catalog.mjs`
already do. Four shapes it has to follow, none of them regex-able:

- **The registry, not a directory walk.** `ITEM_DM_DEF` and `ACTOR_DM_DEF` are
  the canonical subtype → DataModel maps. Globbing `*DataModel.ts` would publish
  schemas for classes nothing registers, and miss one whose filename differs.
- **`defineSchema()` delegates.** Every model here is
  `static override defineSchema() { return defineXDataSchema(); }`.
- **Schemas inherit by spread**, which is how `notes` and `docHtml` reach every
  subtype. Recorded as `inherited`, apart from the subtype's `own`.
- **`SchemaField` nests.** `charges` is recorded with `charges.value` and
  `charges.max` beneath it.

**Imports resolve through `tsconfig.json`'s aliases**, read rather than
restated: every DataModel is imported as `@src/…`, so a resolver that knew only
relative specifiers found none of them.

**It found five live defects on its first run.** Fields these builders emit that
no DataModel defines, discarded at load on every compiled document:

| type             | emitted, undeclared                                      |
| ---------------- | -------------------------------------------------------- |
| `affliction`     | `isTreated`                                              |
| `trauma`         | `isTreated`, `isBleeding`                                |
| `projectilegear` | `impactBase.overrideDice`, `impactBase.overrideModifier` |

`isTreated` and `isBleeding` exist only as **derived getters on the Logic
classes** — `AfflictionLogic.isTreated` is a `get` — never as schema fields. So
the builder writes a constant Foundry throws away while the real value is
computed from `treatmentDate`, which the schema _does_ declare and the builder
does _not_ emit. Both directions of the same defect, on the same field.

Those are not fixed here. This change publishes the evidence; correcting the
builders is package-build's, and now has something pointing at it.

**Generated and gated.** `npm run schema` writes it, `npm run lint:schema` fails
when the committed copy disagrees with what `src/` would produce, and the check
joins the `lint` chain beside `lint:item-fields`. Output goes through
`formatGenerated`, so `lint:format` and `lint:schema` cannot each demand what
the other forbids — which they did on the first attempt.

**Versioned by the tag it is committed under.** The artifact records the
`package.json` version it was generated from, and being committed means a
consumer reads the copy at the tag it pins rather than whatever `main` holds
today. That distinction is the whole of the kethira case: `affiliation.subType`
_is_ defined on `main` and simply unreleased, so a check against `main` passes
while the field still evaporates for every user.

Also reformats `.changeset/adopt-package-build-7.md`, which the shared
formatter rejected while the local one accepted it.
