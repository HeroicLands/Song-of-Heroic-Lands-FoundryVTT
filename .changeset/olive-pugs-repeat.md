---
"sohl": patch
---

Restore the cross-references that the `type-shortcode` wikilink separator left behind, and check that every note carries its address (#1398).

**Cross-type links resolve again on the knowledgebase.** The hyphen form was read
only by the pack compilers. The knowledgebase reached it by accident — through the
alias each note carries — which works only when the link's source and target share
a type. Every _cross-type_ link therefore lost its href and published as plain
text: 152 of them, including every reference from a Mystical Ability to the rules
it is tested under. The label still read correctly, so the prose looked intact.

**The link checker sees them too.** `lint:content-links` resolved a target the same
narrow way, so a cross-type `[[type-shortcode#anchor]]` resolved to nothing and its
anchor went unchecked — silently, since an unresolvable target is treated as an
external reference. It now reads the qualifier with the pack compilers' own
`readQualifier`, so the check cannot drift from what the builds do.

**A new `lint:content-aliases` verifies the aliases the form depends on.** Obsidian
resolves a wikilink against the files on disk, so `[[skill-wpnc]]` only resolves in
the editor if that literal string is in the target note's frontmatter `aliases`.
The check asserts each of the 1442 notes carries **exactly one** address alias,
equal to its own address. Requiring exactly one is what catches a stale alias left
behind by a shortcode change — it would otherwise keep resolving old links to the
right note, reporting nothing, until the retired code was reused. The check
verifies and fails; it never writes to a note.

_Not addressed:_ an unresolved `type-shortcode` still degrades to plain text
without failing the build, because the same form addresses content in packages this
build does not publish. That needs the single-source tree (#1385) to become
decidable.
