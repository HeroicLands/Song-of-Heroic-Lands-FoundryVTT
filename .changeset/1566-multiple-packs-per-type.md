---
"sohl": patch
---

**Several compendium packs of one document type, with notes routed between them** (#1566)

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
