---
"sohl": patch
---

**Shortcodes are strictly alphanumeric, and a violation now fails the build** (#1397)

`shortcode` is the system's identity key and half of the `type-shortcode` address that
content wikilinks parse — a parse that needs the separating hyphen to be the only one
in the string. Nothing enforced that shape: `slugifyShortcode` only applied it to keys
the system _derived_ from a name, so an authored value passed through untouched, and
three of 1599 content notes had one that did not fit.

- _The three keys are renamed_ — `trauma:self-pro` → `selfpro`, `trauma:self-suf` →
  `selfsuf`, `weapongear:B&CFl` → `BCFl`. Nothing referenced them as identifiers.
- _`npm run lint:packs` fails_ on any authored shortcode that is not `^[A-Za-z0-9]+$`,
  alongside the uniqueness check it already ran.
- _The create/update guard refuses one too_, so the rule holds for world documents and
  not only for compiled content. The Create dialog's live check disables **Create**
  while the field is malformed, and a collision and a malformed key now give different
  messages, because they have different fixes.
- _An existing world is repaired by a 0.9.0 migration_ that strips the offending
  characters while keeping case — the same repair that produced the three names above,
  so a world copy and its renamed compendium origin remain the same entity.

Case is untouched: hundreds of authored codes are mixed-case, they collide with
nothing, and tightening that would be a separate decision.

Migration steps also **chain** now: each sees the document as the previous steps left
it. Every migrator returns a whole `system` object built from what it was handed, so
handing all of them the untouched source made two steps touching one document mutually
exclusive — the later payload silently dropped the earlier one's edit.

Closes #1397.
