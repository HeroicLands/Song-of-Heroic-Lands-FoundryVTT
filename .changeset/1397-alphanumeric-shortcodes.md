---
"sohl": patch
---

Require a `shortcode` to be alphanumeric, and rename the three that were not (#1397).

`shortcode` is an identifier, not prose: with `type` it is the system's logical
identity, and content notes address one another as `[[type-shortcode]]` — a parse that
splits at the **first** hyphen. A shortcode carrying its own hyphen was therefore only
readable by accident of the type being known, and nothing checked.

**The rule.** `^[A-Za-z0-9]+$`, stated once in a framework-free module so the build and
the client cannot drift apart on it. `lint:packs` now fails on a malformed authored
shortcode as well as a duplicate — reporting both in one run, since renaming a
malformed key can itself collide — and the runtime create/update guard rejects one
before it reaches world data. A rejection now carries **why** (`charset`, `duplicate`,
or `unnamed`), so the notification names the rule that was broken instead of sending
the user to look for a clash that does not exist. Case is deliberately left alone: 418
authored shortcodes are mixed case, and tightening that is a separate decision.

**The renames**, in the vault and its export: `trauma:self-pro` → `selfpro`,
`trauma:self-suf` → `selfsuf`, `weapongear:B&CFl` → `BCFl`. Each note's
`type-shortcode` alias moves with it. A `0.9.0` migration maps the old keys forward,
because a shortcode is identity referenced from saved data — without it an upgraded
world would stop matching the pack entries its documents were imported from.

**Two things this turned up.** Migration steps did not compose: every step was handed
the _original_ source while payloads merged at the root, so a later step rewriting
`system` silently reinstated what an earlier one removed — the new rename step would
have undone the `docUrl` strip. Steps are now folded through the accumulated result.
And the update guard no longer objects to a payload that merely _restates_ a
document's existing shortcode, which a whole-`system` migration write always does;
vetoing it would leave a document carrying a legacy malformed key unwritable, and so
unrepairable.
