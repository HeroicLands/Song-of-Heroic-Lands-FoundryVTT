---
"sohl": patch
---

Publish the schema with `package-build schema`, and write out the field names it
could not read.

`utils/build-schema-artifact.mjs` is deleted. The extractor now lives in
`@heroiclands/package-build`, where the artifact format and
`SCHEMA_ARTIFACT_VERSION` are already defined — a producer hardcoding the
consumer's constant is drift waiting to happen, and HM3 needed the same reader,
so the second copy was about to exist.

**The published schema was missing fields, and the check was blaming content for
it.** Two separate reasons, both fixed:

- **The shared base schema was dropped whole.** `SohlItemDataModel` spreads
  `...defineSohlDataSchema()`, imported from `SohlDataModel.ts`, and the old
  reader resolved spread functions only within the file doing the spreading. It
  found nothing and contributed nothing, silently. Every Item and Actor subtype
  lost `shortcode`, `actionDefs`, `lastRun` and `scheduledActions` — so content
  authoring `system.shortcode`, which this system _requires_ to be unique per
  `(type, shortcode)` on an actor, was reported as emitting a field no DataModel
  declares.
- **Fourteen temporal fields had no readable names.** `phaseFields(name)` and
  `durationFields(name)` built their keys from a template literal, so
  `onsetDate` and its thirteen siblings existed only after the argument was
  applied — not in the source, and not in any schema read from it. Both
  generators are gone and their six call sites in `AfflictionDataModel` and
  `TraumaDataModel` spell the names out, calling the same field helpers as
  before. The saving was three lines per phase; the cost was a schema that could
  not describe a third of what `affliction` and `trauma` store.

`schema.json` therefore grows by 114 lines. Nothing about the data models
changes — the same fields, the same definitions, the same defaults — only which
of them the published schema can name.

`tests/item/temporal-fields.test.ts` moves with them: it asserted the
generators' key naming, and now asserts the published schema, which is both the
thing that regressed and a stronger claim, since other repositories read it.

**Bump**

_Minor._ A more complete published schema and an internal refactor. No change to
stored data, emitted documents, or the manifest. Requires
`@heroiclands/package-build` 9.0.0, whose reader follows an imported spread.
