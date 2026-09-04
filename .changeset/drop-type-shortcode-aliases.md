---
"sohl": patch
---

Remove the `<type>-<shortcode>` self-alias from every note — 1,603 of them.

Each note carried its own canonical address in its `aliases:` list, so
`affliction-hemotxn` appeared both as the note's address and as a name for it.
They have never been what makes the address work in either build.

**Dead weight, verified rather than assumed.** Both resolvers reach
`[[affliction-hemotxn]]` through `readQualifier` → `type/shortcode`, not through
the alias table. Resolving the same link with the alias present and absent gives
the same answer in each:

```text
content-links   WITH alias => dead: []      WITHOUT alias => dead: []
web-wikilinks   typeAlias PRESENT => [Hemotoxin](/affliction/hemotoxin/)
                typeAlias ABSENT  => [Hemotoxin](/affliction/hemotoxin/)
```

**Removed by exact equality, never by pattern.** The test is
`alias.toLowerCase() === `${type}-${shortcode}`.toLowerCase()`. A rule phrased as
"drop any alias containing a hyphen" would have destroyed real names, and this
tree has plenty: `Absent-Minded`, `Kûrbúl ¾-Helm`, `Plate 3/4-Helm`,
`Lockbox, iron-bound, large`. Every entry that was not the note's own address was
left exactly as authored — including every hyphenated one, and including notes
that carried both forms:

```diff
 aliases:
   - Absent-Minded
-  - trauma-absntmd
```

**A minimal diff, textually.** The sweep edits the frontmatter _text_ rather than
reparsing and reserialising it. An earlier pass through `matter.stringify`
touched 3,407 lines it had no business touching — unquoting `description:`,
reordering keys — which is noise that hides the real change and risks altering
values. The final diff is 1,936 deletions and 333 insertions: 1,603 alias lines,
plus 333 `aliases:` keys rewritten to `aliases: []` where the removal emptied the
block, because a bare `aliases:` parses as null rather than as an empty list.

Every file was checked against an invariant before being written: the body must
be byte-identical, and the parsed frontmatter must match apart from the removed
alias. That check caught two defects during development — a dropped `---`
delimiter, and a `name.aliases:` that was _already_ null being rewritten to `[]`.

**Nothing moves.** `content-build links` and `content-build lint` produce
identical output before and after:

```text
1607 notes: every anchor link lands and every qualified address resolves
(21 cross-package reference(s) via manifest), no wikilink in frontmatter,
every homepage address resolvable.
```

**Why now.** A note that lists its own address among its names makes an address
and a name collide on the same note, which is exactly the ambiguity a
single-hit resolution rule has to be able to report. Clearing them is a
prerequisite to retiring the field, and it is worth doing on its own merits
regardless.
