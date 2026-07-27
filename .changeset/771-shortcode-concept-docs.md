---
"sohl": patch
---

**Document the shortcode concept: logical identity within a type**

The shortcode is how every Actor and Item is logically identified, but that idea was
only visible in per-field property lists and incidental examples. Documentation now
states it plainly for both audiences.

A new user-guide page, **Shortcodes**, explains — jargon-free — that every Actor and
Item has a shortcode, that it is unique within a type (Being, Vehicle, each Item
type), and that two documents of the same type sharing a shortcode represent the same
thing logically even when their ids and values differ. It calls out why this matters
for matching a world document against its compendium origin. The buried mentions in
_Creating Actors and Items_, _Item (base properties)_, and _Using Compendiums_ now
link to it.

The developer reference `reference/shortcode-integrity.md` gains an **Identity
semantics** section up front: `(type, shortcode)` is a logical identity independent of
Foundry `_id` and field values, and that is what makes compendium↔world
reconciliation, archetype shadowing, and cross-scope lookup well-defined. The existing
integrity-constraint and `shortcodeDedupe` mechanics are unchanged.

Closes #771
