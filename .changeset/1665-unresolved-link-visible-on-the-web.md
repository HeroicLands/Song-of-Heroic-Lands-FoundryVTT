---
"sohl": patch
---

Mark an unresolved wikilink on the knowledgebase, as the pack build already does
in Foundry (#1665).

A link whose target no package publishes now renders as
`<span class="sohl-unresolved-link" title="Unresolved link: …">` on the website
too, keeping the author's text so the sentence still reads. Previously it
degraded to bare prose, indistinguishable from the words around it — and since
every authored address carries a label, a dead link and a working one rendered
identically, with the missing href the only difference.

A **resolved** address whose package publishes no pages is deliberately left
unmarked: the address is real, there is simply no page to link to.

**Also fixes two silent corruptions this exposed.** The knowledgebase build's
code-protection helper carried its own idea of what counts as code, and it was
weaker than the pack build's in two ways — a single-backtick span could run
across paragraphs, so one odd backtick mispaired every span after it, and only
three-backtick fences were recognised. Both mangled `content-links.md`, the page
whose subject _is_ the link syntax: its `[[Grukar-ahk]]` example had been losing
its brackets, and the ` ```` `-fenced example leaked. The helper now shares
`codeRegions` with the pack compilers, so the two builds cannot disagree about
what is verbatim, and it moves to `utils/kb-protect-code.mjs` so the rule can be
tested at all.
