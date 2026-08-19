---
"sohl": minor
---

Compile `type: macro` content notes into a shipped **Macros** compendium (#1514).

Routing for macro notes was half-wired — the type mapped to a `macros` pack,
`macro-folders.yaml` existed, and `Automated_Attack.md` was authored — but no
compiler produced the pack and `system.template.json` declared only `items`,
`journals`, and `actors`. The macro that ships with the system existed only as a
markdown file nobody compiled.

**A macro note yields two documents.** Its frontmatter becomes a **Macro** in the
new `macros` pack; its body becomes a **JournalEntry** in the journals pack,
addressed `docmacro/<shortcode>` — the same one-note-two-documents shape an item
and its description already use. Every page compiles into the journal, the
script's page included: nothing is withheld from the documentation.

**The command comes from the raw markdown.** It is the first _language-tagged_
JavaScript fence on the page whose heading carries `{#script}`, taken verbatim,
before tables are expanded and wikilinks converted. The two copies diverge on
purpose — the journal's is prose _about_ the script, the macro's must be exactly
what the author typed. Prose around the fence and any later fence are ignored by
the macro and still render in the journal, so a note may document its macro with
examples that are plainly not the macro.

**Both halves of that are build errors, not warnings.** A note with no
`{#script}` page, or a `{#script}` page whose only fence is untagged, fails the
build: an untagged fence is a code sample whose language nobody stated, and a
macro with no command is a macro-bar button that does nothing.

**`sohl.macroType` states the Foundry macro type**, defaulting to `script` — the
note's own `type:` stays `macro`, which is what routes it. Foundry's schema
initialises a Macro's type to `CHAT`, so the compiler always states `script`
explicitly. `chat` is **rejected** rather than half-implemented: a chat macro's
command is chat text rather than source, so none of the fence rules describe it.
`sohl.macroScope` is validated against Foundry's own scopes.

**The doc-carrying type set is single-sourced.** `DOC_ENTRY_TYPES` in
`utils/packs/item-docs.mjs` — every item type, plus `macro` — is now the one set
read by the journals compiler, the wikilink resolver, the link manifest emitter,
the knowledgebase build, and the content-link guard. Held apart, they drift into
a manifest asserting documentation nothing compiled. The manifest accordingly
gains a `docmacro` entry per macro note, with its `anchors`.

**`docmacro` stays synthesized.** It is formed by prefix and is never a real
type, so a `doc<type>` key arriving in a _foreign_ manifest is not admitted to
the known-type set — admitting it would make the virtual reading stop firing and
kill every `[[docmacro-…]]`. That exclusion no longer depends on manifest
iteration order.

**This does not compile data into code.** A Macro's `command` is authored source
shipped as content and executed by Foundry's own macro runner under the existing
permission model — the mechanism the security model already blesses. Nothing is
evaluated, compiled, or revived.

`Automated_Attack.md` migrates to the new form, and the convention is documented
in `kb/dev-docs/reference/macro-notes.md`, including the known divergence where a
script containing `[[…]]` misrenders in the journal while the executable copy
stays correct (#1505).
