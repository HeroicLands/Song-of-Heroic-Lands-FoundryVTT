# Asset Conventions

See also: [The Authoring Workflow](authoring-workflow.md), [Map Notes](map-notes.md), [Build, Deployment, and Release](../how-to/build-and-deployment.md)

A content note carries an **address** for its art, not the art itself. The
frontmatter says `img: icons/other/sword.svg`; the build turns that into the
path Foundry serves, and the file it names has to already be in the repository
that ships it. Neither half of that is obvious, and both fail quietly — a
mistyped path compiles cleanly and produces an item with a broken icon that
nobody sees until a sheet is opened. This page covers where a file goes, what
shape it must take, how the authored path becomes a served one, and what an
item gets when it declares no art at all.

## Where art lives

Everything shipped lives under `assets/`, one directory per kind:

```text
assets/
├── content/       the notes themselves — NOT art, and NOT shipped
├── icons/         4548 .svg — every item, actor and token icon
│   ├── game-icons/   4239 .svg across 37 subdirectories, one per
│   │                 Game-Icons.net artist (delapouite 2022, lorc 1429,
│   │                 skoll 172, caro-asercion 127, …) plus a `badges/` set
│   ├── other/         245 .svg — SoHL-authored and mixed-source
│   ├── noun/           59 .svg — Noun Project
│   ├── brand/           2 .svg + NOTICE.md
│   └── game-icons-codepoints.json   the persisted PUA map (see below)
├── silhouette/    placeholder portraits and tokens (4 .webp, 2 .svg,
│                  + legendary/ with 2 .webp and 1 .svg)
├── ui/            5 .webp + parchment.jpg — chrome and branding
├── fonts/         23 .woff2, including the generated game-icons.woff2
├── audio/         8 .ogg
├── manifests/     the link manifest — not art
└── templates/     Handlebars sources — not art
```

**The tree is overwhelmingly vector.** Outside `assets/content/` the extension
histogram is 4548 `.svg`, 23 `.woff2`, 12 `.webp`, 8 `.ogg`, 1 `.jpg` — SVG
outnumbers WebP about 379 to 1. Raster art is the exception here (portraits,
placeholders, branding), not the norm; if you are adding an item icon you are
almost certainly adding an SVG.

**Only five asset directories ship.** `utils/copy-assets.mjs` mirrors
`assets/{audio,icons,silhouette,fonts,ui}` into `build/stage/`, along with
`lang/` and `templates/`. `assets/content/`, `assets/manifests/` and
`assets/templates/` are build inputs and are **not** copied — a file dropped
into `assets/content/` alongside its note is not an asset and will not be
served.

## `img:` resolves through exactly two prefixes

One authored path has to work for Foundry, for the knowledgebase, and for the
website, so a note writes the short, package-relative form and the build
translates it. The whole of that translation is `resolveImg`
(`engine/helpers.mjs`):

```js
export function resolveImg(raw, config = loadPackConfig()) {
  if (!raw) return "";
  const s = String(raw);
  if (s.startsWith("icons/") || s.startsWith("images/")) {
    return `${config.assetRoot}/${s}`;
  }
  return s;
}
```

**`icons/` and `images/` are the only two magic prefixes.** Anything else — an
already-package-rooted path, an absolute URL, a core Foundry path — is returned
untouched, and an empty value yields `""`.

| Authored `img:`                        | Compiles to                                                |
| -------------------------------------- | ---------------------------------------------------------- |
| `icons/other/sword.svg`                | `systems/sohl/assets/icons/other/sword.svg`                |
| `images/being/basicfolk-portrait.webp` | `systems/sohl/assets/images/being/basicfolk-portrait.webp` |
| `systems/sohl/assets/ui/parchment.jpg` | unchanged                                                  |
| `icons/svg/dice-target.svg`            | rerooted — **and this is a trap**, see below               |
| _(omitted)_                            | `""`, then the compiler's own default                      |

This is translation only. The per-type default for an empty result belongs to
each compiler, applied as `resolveImg(fm.img) || <default>` — items default
differently from actors, and macros differently again.

### The `systems/` vs `modules/` prefix is derived, never authored

`config.mjs` computes one string and spells the package root exactly once:

```js
assetRoot: `${packageKind}/${foundryPackage}/assets`;
```

`packageKind` is `"systems"` or `"modules"`. This repository declares
`foundryPackage: "sohl", packageKind: "systems"`, so its asset root is
`systems/sohl/assets`. A module declaring `packageKind: "modules",
foundryPackage: "sohl-thalorna"` gets `modules/sohl-thalorna/assets` **from the
identical authored value** (#1508).

That is the whole reason to author the short form: `icons/other/sword.svg` means
"my package's own icon" in every repository, while a hand-written
`systems/sohl/assets/icons/other/sword.svg` in a module means "some other
package's icon", which is a claim you almost never intend to make.

Note that `foundryPackage` is not `contentPackage`. They happen to be equal here
(both `sohl`), but the content package is the note's `package:` frontmatter
value, and the Foundry package is the id in the shipped manifest.

### What reads a resolved image

| Compiler            | Field                                                   | Default when empty                                           |
| ------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| `sohl/items.mjs`    | item `img`                                              | `itemArt(type)` — see [Default art](#default-art)            |
| `sohl/actors.mjs`   | actor `img`, prototype token texture, `system.portrait` | `systems/sohl/assets/icons/game-icons/delapouite/person.svg` |
| `engine/macros.mjs` | macro `img`                                             | `icons/svg/dice-target.svg`                                  |

The macro default is worth a second look: it is a **core Foundry** path, and it
is stated as the default _after_ translation precisely so `resolveImg` never
sees it and never reroots it. Written as a note's `img:` instead, that same
string would compile to `systems/sohl/assets/icons/svg/dice-target.svg` and
resolve nowhere. **If you mean a core Foundry icon, you cannot say so with an
`icons/` path** — reach for one of SoHL's bundled icons instead.

### Map images bypass all of this

A map note's `sohl.image` (and `overlay`, and a tile's `image`) is **required
and used verbatim** — `engine/map-notes.mjs` never calls `resolveImg`. That is
why SoHL's map images are authored fully rooted
(`systems/sohl/assets/ui/parchment.jpg`). See [Map Notes](map-notes.md).

## Nothing checks that the file exists

**An authored `img:` or `portrait:` is translated, never validated.** No pass in
the build stats the target, so a typo, a moved file, or a path shape that never
existed all compile cleanly and ship an item whose icon is a broken-image glyph.
The failure surfaces the first time somebody opens the sheet.

Two live consequences are already on record.

**`assets/images/` does not exist in this repository.** `images/` is one of the
two magic prefixes, and 95 `being` notes author
`portrait: images/being/<code>-portrait.webp`, which compiles to
`systems/sohl/assets/images/being/…` — a directory the build never creates and
`copy-assets.mjs` never ships. Every one of those portraits currently resolves
nowhere. The paths are correct as an intention; the art has not been drawn yet.

**`sohl-thalorna` hit the same class of failure at scale.** 444 of its 630
compiled items carry an `img` naming one of 94 distinct icon paths that resolve
nowhere (`HeroicLands/sohl-thalorna#7`), because SoHL ships icons **nested** —
`assets/icons/{brand,game-icons,noun,other}/…` — and a flat
`assets/icons/anvil.svg` has never existed (the real files are
`assets/icons/noun/anvil.svg` and `assets/icons/game-icons/lorc/anvil.svg`). The
#1508 prefix fix changed which package root the broken paths hung off; it did
not make them resolve.

The rule that follows: **paste the path from the file you are pointing at**, and
remember that a consuming package pointing at SoHL's icons must either ship its
own copies or write the fully-rooted `systems/sohl/assets/…` form deliberately.

## Default art

An item note with no `img:` gets the art paired with its type. SoHL's own map is
`DEFAULT_ITEM_ART` in `@heroiclands/content-build/sohl/default-item-art`, and
every entry is a fully-rooted, bundled SVG:

| Item type         | Default art                                                 |
| ----------------- | ----------------------------------------------------------- |
| `affiliation`     | `systems/sohl/assets/icons/noun/shield.svg`                 |
| `affliction`      | `systems/sohl/assets/icons/other/sick.svg`                  |
| `armorgear`       | `systems/sohl/assets/icons/game-icons/lorc/breastplate.svg` |
| `attribute`       | `systems/sohl/assets/icons/other/charm.svg`                 |
| `concoctiongear`  | `systems/sohl/assets/icons/game-icons/badges/flask.svg`     |
| `containergear`   | `systems/sohl/assets/icons/other/sack.svg`                  |
| `miscgear`        | `systems/sohl/assets/icons/other/question-mark.svg`         |
| `mystery`         | `systems/sohl/assets/icons/other/sparkles.svg`              |
| `mysticalability` | `systems/sohl/assets/icons/other/hand-sparkles.svg`         |
| `projectilegear`  | `systems/sohl/assets/icons/noun/arrow.svg`                  |
| `skill`           | `systems/sohl/assets/icons/other/head-gear.svg`             |
| `trauma`          | `systems/sohl/assets/icons/other/injury.svg`                |
| `weapongear`      | `systems/sohl/assets/icons/other/sword.svg`                 |

**Why there is a map at all.** Foundry's own `Item.DEFAULT_ICON` is the white
`icons/svg/item-bag.svg` — invisible on the light Manuscript sheet, and not
theme-adaptive. Every SoHL item type therefore gets a themed SVG instead.

**The runtime reads the same map.** `SohlItem.getDefaultArtwork` imports it back
through the package's `./sohl/default-item-art` entry point, so an item created
in-world (via **Add Trauma**, say) gets the icon the pack builder would have
given it. #932 was precisely that drift, when the builder had a default and the
runtime did not.

### Two layers of fail-fast, and a consumer only meets the second

`defaultItemArt(type)` throws at **import** for a type SoHL's map does not
cover. That is what keeps the art map and the builder registry one list: the
registry cannot name a type the map does not cover.

Separately, at **compile**, `itemArt(type)` (`engine/item-registry.mjs`) throws
when a note carries no `img:` _and_ the type's `itemBuilders` entry pairs no
art. Its message names both fixes: write the registry entry as
`<type>: { system: <builder>, img: "<path>" }`, or give the note an `img:` of
its own.

**Art travels with the builder** (content-build#7). A consuming repository that
defines its own item type supplies that type's default in its own
`itemBuilders` entry and never edits a SoHL-owned table. The registry path runs
back through `resolveImg`, so `img: "icons/relic.svg"` in a registry entry means
the consumer's own asset root exactly as it does on a note — one spelling, one
meaning, wherever it is written. This is the current, fixed behaviour (#1568).

## What makes an SVG themeable

Bundled icons are solid black silhouettes, which vanish on a dark surface —
including the Foundry compendium and directory windows, whose `<img>` thumbnails
SoHL's `.sohl`-scoped CSS cannot reach. The only styling that travels with an
SVG loaded through `<img>` is the SVG itself, so `copy-assets.mjs` runs every
`.svg` under `assets/icons` through `injectAdaptiveFill`
(`utils/svg-theme.mjs`), which inserts a `<style>` block carrying a
`@media (prefers-color-scheme: dark)` fill swap: iron-gall ink `#211d16` in
light, cream `#ece3cf` in dark, mirroring `--sohl-color-text-primary` (see
[CSS Architecture](../concepts/css-architecture.md)). The two colours are kept
in sync with `scss/abstracts/_tokens.scss` **by hand**, because a build script
cannot read the SCSS maps.

**This happens at build time only, and to `assets/icons` only.** The source SVGs
stay pristine black-on-transparent, so the knowledgebase and website — which
render them on light ground — are unaffected, and `assets/silhouette` is copied
without the transform.

The injected rule matches `[fill="#000"]`, `[fill="#000000"]`,
`[fill="black"]`, and `path` / `rect` / `circle` / `ellipse` / `polygon` /
`polyline` / `line` / `g` carrying **no** `fill` attribute at all.

**So an SVG themes when all four hold:**

1. It has an `<svg …>` open tag.
2. It contains no `prefers-color-scheme` (already-themed files are left alone,
   which is what makes the injection idempotent).
3. It contains no inline `style="…fill…"` anywhere in the file.
4. Its drawables either carry a black `fill` attribute or no `fill` attribute.

Each of the first three bail-outs returns the file **unchanged** rather than
half-recolouring it — a deliberate choice, since a partly recoloured two-tone
badge is worse than an untouched one.

### `fill="currentColor"` is not a theming mechanism here

The selector never matches `currentColor`, and an SVG loaded through `<img>`
inherits nothing from the page, so such an icon renders black regardless of
theme. 38 files under `other/` use it; all are UI-chrome glyphs with no black
fill to match, so they are simply unaffected rather than broken. Do not reach
for `currentColor` expecting it to do what the injected `<style>` does.

### An inline fill style skips the file entirely — 45 of them today

An inline `style` attribute wins over a `<style>` rule, so `injectAdaptiveFill`
declines to touch such a file. **45 icons are in that state**: `noun/longbow.svg`,
`noun/polearm.svg`, and 43 under `other/`.

**Four of them are default item art**, so those four types ship un-themed icons
today: `affliction` (`other/sick.svg`), `mysticalability`
(`other/hand-sparkles.svg`), `mystery` (`other/sparkles.svg`) and `skill`
(`other/head-gear.svg`).

This is a known wart, not a design decision. **If you are authoring or replacing
an icon, strip inline fill styles from it** — move the colour to a `fill`
attribute (or drop it, so the shape defaults to black) and the file themes.

### The webfont normaliser is a separate pass

`utils/transparentize-svg.mjs` forces a Game-Icons SVG to black-on-transparent:
it drops the full-canvas background rect (the lone `d="M0 0h512v512H0z"` path
Game-Icons ship) and sets `fill="#000"` on every remaining drawable. It runs
only in the webfont pipeline (`build:icons` / `build:kb-icons`), never in the
asset copy — but it is why every `game-icons/**` file satisfies condition 4
above.

`build:icons` writes three **committed** artifacts:
`assets/fonts/game-icons.woff2`, `scss/abstracts/_icons.scss`, and
`assets/icons/game-icons-codepoints.json`. Codepoints start at `0xE001` in the
Private Use Area and are persisted in that JSON, including entries for icons
that have since been deleted, so adding an icon never shifts the codepoint of
any other.

## Formats in practice

| Use                | Format | Convention                                            |
| ------------------ | ------ | ----------------------------------------------------- |
| Item icon          | SVG    | 100% — all 13 type defaults are SVG                   |
| Actor icon / token | SVG    | one authored value feeds `img` and the token texture  |
| Portrait           | WebP   | `images/being/<code>-portrait.webp`                   |
| Placeholder        | both   | `.webp` bioimage/headshot paired with an `.svg` token |
| Map background     | JPEG   | the one JPEG, `ui/parchment.jpg` (512×512)            |
| UI / branding      | WebP   | a responsive set — see below                          |

Placeholder silhouettes run 100×100 and 256×256 for headshots, and 170×300 /
200×300 / 268×733 for bioimages. The branding set is 400×100, 400×225, 512×512,
1200×400 and 1920×1080 — sized for page chrome and OG images rather than for
Foundry.

**viewBox conventions are not uniform, and there is no rule to enforce.**
`game-icons/` is entirely `0 0 512 512` (its own pipeline hard-codes the
512-square background rect it strips); `noun/` is mostly `0 0 100 100`; `other/`
is a grab-bag — 45 files at `0 0 512 512`, 39 at `0 0 1080 1080`, 30 at
`0 0 1200 1200`, and a long tail. Match the set you are adding to, and keep the
artwork square unless you have a reason not to: Foundry renders an item icon
into a square box and will letterbox anything else.

## Adding a file, end to end

1. Put it under the right `assets/` directory — an item or actor icon goes in
   `assets/icons/other/` unless it comes from a vendored set.
2. If it is an SVG, check it against the four conditions above; strip any inline
   `style="fill:…"`.
3. Reference it from the note with the short form — `img: icons/other/relic.svg`
   — never the rooted one.
4. Confirm the file is really at that path. Nothing else will.
5. For a new **item type**, pair its default art with its builder in
   `content-build.config.mjs` rather than reaching for a SoHL table.

Where `img:` and `portrait:` sit in a note is per-type: see
[Item Note Frontmatter](item-frontmatter.md) and [Actor Notes](actor-notes.md).
