---
"sohl": patch
---

**Developer docs describe the sections, landings and drafts the build actually
has** (#1820)

#1806 scrubbed the retired addressing machinery but deliberately stopped short of
the section and README-landing material, because the installed
`@heroiclands/package-build` still routed pages through a section and honoured
both landing rules. It does not at 15.0.0, so those passages are corrected here.

- _The manifest contract no longer hands out a refused key._ Its configuration
  example carried `landing: readme # a README.md addresses its section`, which is
  now refused by name — a reader copying it got a failed build. It is gone, and
  the derivation is stated as it is: a `path` is the note's address,
  `<type>-<shortcode>/`, a pure function of its frontmatter. `prefix` says where
  the tree mounts _inside_ the package and does not reach an address, so the
  format example's `"kb/affliction/aconite/"` is the emitted
  `"affliction-aconite/"`. A note with no address is one declaring no `type` or
  no `shortcode`, not "a `doc` with no `category`".
- _An unresolved link._ The manifest page said a bare alias does not fail the
  build because it "may be ordinary prose". Every link is an address now; how a
  link is _written_ is simply a separate finding from where it points, because
  the corrections differ.
- _Drafts._ `draft:` was listed as a frontmatter field that "withholds the note
  from everything". The field is refused; a note that is unfinished carries the
  `draft` **tag**, which the build ignores and which marks a link into it. The
  compile order beside it named `draft:` as a step and put the retired-type check
  first — it is the retired **fields** that come first, all four of them, and
  they are checked before any pass claims the note.
- _An example that would not compile._ The macro-note frontmatter carried an
  `aliases:` block; the field is refused, so the example is now a note a reader
  can paste.
- _`lint:addresses`._ It was described as failing on "a note missing its address
  alias". There is no address alias, and the reachability walk beside it no
  longer falls back to a type-scoped one.
