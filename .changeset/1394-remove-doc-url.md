---
"sohl": minor
---

**`system.docUrl` is removed** (#1394)

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
