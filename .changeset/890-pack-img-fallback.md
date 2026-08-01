---
"sohl": patch
---

**Fix Being prototype-token and portrait art in the compendium build**

The pack builder gave every Being compendium entry the generic `person.svg` for
both its prototype-token art and its portrait, regardless of the creature's own
`img:` / `portrait:` frontmatter — only the top-level actor `img` resolved
correctly. The `resolveImg` helper read `fm.img` internally while two call sites
passed a bare string, so those reads were `undefined` and fell through to the
default.

`resolveImg` is now a pure content→Foundry path translator — an `icons/…` or
`images/…` content path is rewritten to `systems/sohl/assets/…`, anything else is
left unchanged. The per-type default is domain-specific (actors default to
`being`/person, items default per type), so each builder owns its own default map
and applies it to an empty result. A Being's token and portrait now use the
creature's own art, and an unspecified portrait falls back to a real image rather
than a broken/blank one. The item builder now **aborts the build** on a type with
no default-image entry instead of silently substituting a generic gear icon.

Closes #890
