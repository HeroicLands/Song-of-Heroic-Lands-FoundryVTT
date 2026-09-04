---
"sohl": patch
---

Content authoring now has a documentation home: a **Content Creator** section
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

**Two guards got less fragile.** `check-docs-index` read its section list from
a literal array, so a _new_ section was invisible to it rather than covered by
it — precisely the silent orphaning that guard exists to prevent; it now reads
the sections off disk. And a nested section landing took its title from the
section-wide table, which would have titled every one of them "Developer
Documentation".
