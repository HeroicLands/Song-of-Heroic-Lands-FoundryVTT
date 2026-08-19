---
"sohl": patch
---

Let a pack-only package publish a link manifest, by making `path` optional (#1516).

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
