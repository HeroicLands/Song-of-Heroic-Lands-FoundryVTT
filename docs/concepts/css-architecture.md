# CSS Architecture & Styleguide

> **Audience:** Anyone writing or refactoring SCSS for the SoHL system — core
> contributors and variant-module authors.

See also: [Architecture Overview](./architecture.md), [Effects Integration](../reference/effects-integration.md).

This page is the **decision record and conventions** for the system's stylesheets.
It is the foundation ratified by [epic #95](https://github.com/toastygm/Song-of-Heroic-Lands-FoundryVTT/issues/95)
before any code moves; the migration itself happens in its child issues (#90–#94).
Until those land, the source under `scss/` does **not** yet match every rule below —
this document describes the *target*, and is the contract migrations are measured
against.

> **Why this exists.** [#87](https://github.com/toastygm/Song-of-Heroic-Lands-FoundryVTT/pull/87)
> uncovered a whole block of sheet-layout CSS that was silently dead: `.sohl .sheet`
> (descendant) can never match an ApplicationV2 frame, because Foundry puts `sohl`
> and `sheet` on the *same* element. That symptom sat on top of years of accreted
> structure — dead selectors, near-duplicate widget blocks, mixed-concern files, and
> ad-hoc naming. The rules here exist so that class of bug cannot recur and so the
> stylesheets stay extensible.

## 1. Tooling — stay on SCSS (Dart Sass)

**Decision: keep SCSS; modernize how we use it.**

SCSS is the right tool for a Foundry system and we are not switching:

- Foundry loads a **single compiled stylesheet** per `system.json` `styles[]`
  (`css/sohl.css`). SCSS compiles the whole `scss/` graph to that one file — exactly
  the model Foundry expects.
- The codebase leans on SCSS features that have no plain-CSS equivalent: the
  `@use`/`@forward` module graph, mixins, and **generation loops/maps** — e.g.
  `scss/utils/_icons.scss` (~688 LOC of auto-generated font-icon classes) and the
  `$typography-scale` map + `type-style()` mixin in `scss/utils/_typography.scss`
  (~383 LOC).

We do **not** adopt:

- **Tailwind** — fights Foundry's owned/Handlebars-rendered DOM and scatters styling
  into templates as utility-class soup.
- **CSS-in-JS / CSS Modules** — there is no component tree to hook; styling targets
  Foundry-rendered markup.

The modern move is to keep SCSS for structure/loops and adopt the **native-CSS**
features that fix our actual pain: **custom properties** (tokens + runtime theming),
**`@layer`** (beat Foundry-core specificity predictably), and **`:where()`** (low
specificity scoping). These are covered below.

## 2. Folder architecture (ITCSS-inspired / 7-1)

Source lives under `scss/`, organized by **role**, loaded lowest-output-first so the
cascade reads top-to-bottom. Target folders:

| Folder        | Holds                                                                 | Emits CSS? |
| ------------- | -------------------------------------------------------------------- | ---------- |
| `abstracts/`  | Design tokens, SCSS variables/maps, functions, mixins                | No         |
| `base/`       | Resets, element defaults, Foundry-core variable overrides            | Yes        |
| `layout/`     | Structural skeleton: sheet frame, window-content, tabs, grid         | Yes        |
| `components/` | Reusable widgets: item-row, list, header, resource, field, effect, body-location | Yes |
| `apps/`       | Sheet-type-specific tweaks: being, item sheets, standalone apps      | Yes        |
| `utilities/`  | Single-purpose helpers: flex, spacing                                | Yes        |

**`abstracts/` must emit no CSS** — importing it has zero output, so it can be
`@use`-d freely from any partial without duplicating rules.

Migration map from the current layout:

- `scss/utils/` → `abstracts/` (tokens, maps, mixins, functions) — except the parts
  that emit rules, which move to where their output belongs.
- `scss/global/` → split across `base/` (resets, Foundry overrides, `chat`, `editor`,
  `tooltip`, `hotbar`), `layout/` (`window`, `nav`, `grid`), and `utilities/` (`flex`).
- `scss/components/` → `components/` (reusable widgets) and `apps/` (sheet-type-specific
  blocks such as the being sheet and the various item sheets).

## 3. Naming — BEM under the `.sohl` namespace

**Decision: BEM (`block__element--modifier`), namespaced by the `.sohl` /
`.sohl.sheet` wrapper rather than a per-class prefix.**

Every component is already emitted inside the `.sohl { }` (or compound `.sohl.sheet { }`)
wrapper set up in `scss/sohl.scss` (§5), which provides the namespace. So BEM block names
are written **without** a redundant `sohl-` prefix — the wrapper supplies it, and writing
`.sohl .facade__image` keeps the same specificity as the name it replaces. Retire ad-hoc,
type-suffixed, and abbreviated names. Examples of the transform:

| Current (ad-hoc)        | Target (BEM, under the `.sohl` wrapper) |
| ----------------------- | --------------------------------------- |
| `.header-details`       | `.sheet-header__details`                |
| `.actor-img`            | `.sheet-header__portrait`               |
| `.toggle-status-effect` | `.sheet-header__status`                 |
| `.facade-image`         | `.facade__image`                        |
| `.bodylocation-name`    | `.body-location__name`                  |

Conventions:

- One **block** per reusable widget (`sheet-header`, `facade`, `list`, `field`,
  `resource`, `effect`, `body-location`).
- **Elements** are parts of a block (`__name`, `__details`, `__portrait`). **Modifiers**
  are variants/state (`--being`, `--active`, `--danger`).
- Prefer a modifier over a near-duplicate block. Two header blocks that differ only by
  context become one block with a modifier.
- **Leave these alone:** Foundry-owned classes (`window-content`, `tab`, `tabs`, `active`
  as a Foundry/JS-toggled state, `flexrow`, `form-group`, …), `data-action` / `data-tab`
  values, and `lang/` keys. BEM applies to **SoHL's own CSS class names only**; renaming a
  class that JS or Foundry sets silently breaks it.

**Do not rename data hooks or localization keys.** `data-*` attributes consumed by
`src/` and `lang/en.json` keys are part of the system's contract and stay stable
(see the backwards-compatibility and stable-localization-keys rules in `CLAUDE.md`).
BEM applies to **class names only**.

## 4. Design tokens as CSS custom properties

**Decision: expose design tokens as `--sohl-*` custom properties, generated from SCSS
maps.**

Token families: `--sohl-color-*`, `--sohl-space-*`, `--sohl-font-*` (extend as needed,
e.g. `--sohl-radius-*`, `--sohl-shadow-*`). Generate them from SCSS maps using the same
map-driven pattern already proven by `$typography-scale` / `type-style()` in
`scss/utils/_typography.scss`:

```scss
// abstracts/_tokens.scss
$space: (
    "xs": 2px,
    "sm": 5px,
    "md": 10px,
    "lg": 20px,
);

@mixin emit-tokens {
    :root {
        @each $name, $value in $space {
            --sohl-space-#{$name}: #{$value};
        }
    }
}
```

```scss
// consumed in a component
.sohl-list__item {
    padding: var(--sohl-space-sm) var(--sohl-space-md);
}
```

Why custom properties (not just SCSS variables): they live at **runtime**, so a theme
or a variant module can re-skin the system by overriding `--sohl-*` (on `:root` or on
`.sohl`) without recompiling SCSS. SCSS variables remain the **source of truth** in the
maps; the custom properties are the **runtime surface**.

Emit `--sohl-*` on **`:root`** (via the `emit-tokens` mixin called once from
`scss/sohl.scss`). `:root` is an ancestor of everything, so the tokens resolve on every
system surface — including the **unscoped** global UI that SoHL restyles (chat cards,
tooltips) which is not nested under `.sohl`. A theme can still narrow an override to
`.sohl` if it only wants to retint SoHL's own surfaces.

**Keep these distinct from Foundry's own variables.** `scss/utils/_foundry-vars.scss`
redefines Foundry-core properties (`--color-text-primary`, `--color-border-*`, …) so
core UI picks up our palette. Those use Foundry's `--color-*` namespace by necessity
and are *not* part of the `--sohl-*` token set; don't merge the two.

## 5. Cascade — emit SoHL's CSS unlayered

**Decision: do _not_ wrap SoHL's CSS in `@layer`. Emit it unlayered, loaded in
priority order (later wins).**

Foundry v14 core wraps **all** of its own CSS in a declared layer stack:

```css
@layer reset, variables, elements, blocks, applications, compatibility, layouts, system, modules, exceptions;
```

The single most useful fact about cascade layers here: **unlayered styles beat every
layered style of the same origin, regardless of specificity or layer order.** Because
Foundry core is fully layered, unlayered SoHL rules reliably win over core — no
`!important`, no deep nesting, no dependency on stylesheet load order.

> **Lesson learned (#106).** An earlier iteration put all of SoHL into custom
> `@layer sohl.base … sohl.utilities` layers, on the theory that layers declared after
> Foundry's stack would win. In practice the layered SoHL rules stopped winning and every
> sheet rendered unstyled (while the deliberately-unlayered `@font-face`/icon rules kept
> working — the tell). Custom layers proved fragile (sensitive to registration/load
> order). Unlayered is simpler and robust, so that is the rule.

Practical guidance:

- `scss/sohl.scss` emits every partial unlayered, in priority order: base (resets,
  Foundry overrides) → layout (frame, tabs, grid) → components (widgets) → utilities.
  **Later source order = higher priority**, so this ordering gives the same intent a layer
  stack would, using nothing but source order.
- To make one SoHL rule beat another, rely on that source order (and the folder grouping
  that mirrors it) or on specificity — not `@layer`.
- `abstracts/` still emits nothing; `@font-face`/icon glyphs remain unlayered (they have
  no cascade competition).
- If a future need to cede precedence to modules/themes arises, the Foundry-reserved
  `system` layer (`@layer system { … }`) is the place to revisit this — but only with a
  live visual test, since that reintroduces the load-order sensitivity that bit us here.

## 6. Scoping rule — the #87 lesson, written down

ApplicationV2 puts **all** of an application's option classes on the **same frame
element**. So for a sheet whose classes are `sohl sheet`:

- `.sohl .sheet` — **descendant**, expects `sheet` *inside* `sohl`. **Never matches.** ❌
- `.sohl.sheet` — **compound**, matches the one element carrying both classes. ✅

**Rule: target frame/option classes with a compound selector, never a descendant.**
The live example is the entry stylesheet, where sheet-frame layout is loaded under the
compound selector precisely for this reason (`scss/sohl.scss`):

```scss
/* Loaded under the COMPOUND `.sohl.sheet` selector because ApplicationV2 puts
   `sohl` and `sheet` on the same frame element. */
.sohl.sheet {
    @include meta.load-css("components/sheet");
}
```

**Keep specificity low with `:where()`.** When scoping by namespace but not trying to
out-specify anything, wrap the namespace in `:where()` so it contributes zero
specificity and stays easy to override:

```scss
:where(.sohl) .sohl-list__item { /* low-specificity, easy to theme */ }
```

Reserve plain `.sohl` (specificity-bearing) for rules that must actually win against
core.

## 7. Module loading — `@use`/`@forward`, with `meta.load-css` only for scoped output

**Decision: `@use`/`@forward` is the canonical module graph. Use `meta.load-css` only
when output must be emitted *inside* a selector scope.**

The current entry mixes both (`scss/sohl.scss`): top-level utilities/globals via `@use`,
sheet components via `@include meta.load-css(...)` nested inside `.sohl { }` and
`.sohl.sheet { }`. Resolve it as:

- **`@use` / `@forward`** for the dependency graph — abstracts, base, layout, and any
  partial whose selectors already carry their own scope. Expose tokens/mixins through a
  single barrel (`abstracts/_index.scss` that `@forward`s the token, function, and mixin
  partials), so consumers write one `@use "abstracts" as *;`.
- **`@include meta.load-css("…")`** *only* where a partial's rules must be wrapped in a
  selector at load time — i.e. emitting a component's output inside `.sohl { }` or
  `.sohl.sheet { }`. This is the deliberate exception, not the default.

Authoring convention going forward: a new partial defines selectors that are already
fully scoped (BEM block under the namespace) and is pulled in with `@use`; reach for
`meta.load-css` only when wrapping is unavoidable.

## 8. Migration

This page is decisions only. The implementation is sequenced across epic #95:

- **#90** — remove dead SCSS, verified against templates.
- **#91** — design-token + cascade-layer + scoping foundation (§4, §5, §6).
- **#92** — reorganize files/folders to §2.
- **#93** — extract reusable component partials (list/header/field).
- **#94** — apply BEM naming (§3) and sync templates/`src/` selectors.

Until each lands, expect `scss/` to lag this document. When they conflict, **this
document is the target** and the code is what still needs migrating.
