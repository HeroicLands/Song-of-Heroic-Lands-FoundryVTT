---
"sohl": patch
---

**The localization guards can now catch what this epic had to find by hand.**

`check-lang-coverage.mjs --unused` reported **zero** unused keys while 37.5% of the file
was dead, because its predicate treated a key as used when _any_ referenced token or
namespace prefix was a dotted ancestor — and `LOCALIZATION_PREFIXES` entries absorbed
whole namespaces. Three changes fix it:

- A dynamic reference now vouches for its **shape**, not its head:
  `` `SOHL.Calendar.Vylarian.Month.${i}.label` `` vouches for
  `SOHL.Calendar.Vylarian.Month.<segment>.label` and nothing else. A single
  `` `SOHL.${x}…` `` no longer vouches for the entire file.
- A `LOCALIZATION_PREFIXES` entry vouches only for the shape Foundry actually looks up:
  `<PREFIX>.FIELDS.<path>.label|hint`.
- Concrete keys inside **template-literal text** (inline HTML in a helper, e.g.
  `` `…{{localize "SOHL.ExpressionEditor.editTooltip"}}…` ``) are read out explicitly —
  a template literal is not a string-literal node, so the AST scan had been blind to
  them. Each chunk is scanned separately so a token cannot be glued across a `${…}`.

Unused keys are now an **error**, not an always-silent warning, with a `RETAINED` table
for the keys that are genuinely reachable but invisible to any scan — action titles
built as `` `${titlePrefix}.${shortcode}` ``, enum values concatenated in a template —
each with the reason, in `[prefix, reason]` form. 39 keys the tightened predicate
exposed are deleted (`*.EffectKey.*` members whose label bundles are not consumed, the
`SOHL.CALENDAR.DEFAULT.*` and `SOHL.Calendar.Default.Month.*` leftovers): 1804 → 1765.

**New `lint:lang-hardcoded`** walks the reverse direction — _UI text → key_ — that
`lint:lang-coverage` structurally cannot, failing on any user-visible literal left in a
template, with an `ALLOWED` list carrying a stated reason per entry. It also compiles
every template, because nesting `{{localize …}}` inside another mustache is legal in an
HTML attribute but a parse error inside a helper's hash. It replaces the temporary
vitest guard from #1350 and is wired into `npm run lint`.

**`check-lang.mjs` gains two structural checks**, both failing: no Handlebars double
braces or unbalanced brace in any value (the `{{docType}}` rendering bug of #1353), and
no key segment outside `[A-Za-z0-9_-]` (the `"…SOUND.sounds/dice.wav"` shape that walks
data into a key and invites the `expandObject` collision of #636).

All three guards fail rather than warn, and the build is green — closing epic #1355.

(Closes #1354.)
