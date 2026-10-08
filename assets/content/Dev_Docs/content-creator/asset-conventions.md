---
shortcode: assetconventions
name: {full: Asset Conventions, aliases: []}
type: doc
subType: reference
description: "Where art files live, how a note addresses one, image and SVG standards, and default item art."
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Asset Conventions

See also: [[doc-authoringworkflow|The Authoring Workflow]], [[doc-mapnotes|Map Notes]], [[doc-buildanddeployment|Build, Deployment, and Release]]

A content note carries an **address** for its art, not the art itself. The
frontmatter says `icon: sword`, and the build resolves that to the file the
`sword` icon record names and then to the path each surface serves — Foundry, the
knowledgebase, the website, the book. The file has to be in the repository that
ships it before the address resolves to anything.

This page covers where a file goes, what shape it must take, how a note reaches
it, and what an item gets when it names no art at all. The format itself is
specified in `docs/content-format.md` in `@heroiclands/package-build`; this page
covers what is true of **this** repository's assets.

## Images in journal prose

An image or image embed in a note stands in its own paragraph, with a blank line
either side. Its `size=` attribute accepts `auto`, `small`, `medium`, `large`,
`xlarge`, and `full-width`. The four bounded sizes display at up to 64, 128, 256,
and 512 CSS pixels in a Foundry journal. `auto` uses the file's natural size
within the journal page; `full-width` fills the page measure. The image keeps its
aspect ratio.

`float=top-left` and `bottom-left` wrap prose on the right. `top-right` and
`bottom-right` wrap it on the left; `center` places the image without wrapping.
In a narrow journal window, floats sit in the text flow so prose stays readable.

The image's alt text is its visible caption, because print has nowhere else to
put those words. A markdown title — `![alt](src "title")` — is refused rather
than dropped, and so is an image sharing a paragraph with prose.

## Where art lives

Everything shipped lives under `assets/`, one directory per kind:

```text
assets/
├── content/   the notes themselves — NOT art, and NOT shipped
├── icons/     every item, actor and token icon
│   ├── game-icons/   one subdirectory per Game-Icons.net contributor,
│   │                 plus a `badges/` set
│   ├── other/        SoHL-authored and mixed-source
│   ├── noun/         Noun Project
│   ├── brand/        the marque, with NOTICE.md
│   └── game-icons-codepoints.json   the persisted PUA map (see below)
├── images/    being portraits, creature art, and page furniture
│   ├── beings/       portraits, with `creatures/` beneath
│   └── ui/           parchment.jpg, the one map background
├── audio/     sound effects
├── ui/        the branding set — the package's own chrome
├── fonts/     .woff2, including the generated game-icons.woff2
├── icon-registry.yaml   generated: the fonts the interface renders and the
│                        names notes draw from them
├── icons.zip  the vendored icon set as it was downloaded
└── LICENSE
```

**The tree is overwhelmingly vector.** Outside `assets/content/` the SVG under
`assets/icons/` outnumbers every raster file by better than forty to one. Raster
art is the exception here — portraits, creature art, branding — so an item icon
is almost certainly an SVG.

**A `provenance.yaml` sits beside the files it covers**, at any level inside an
asset root, and records who holds the rights, where the file came from, whether a
machine made it, the licence, and anything else an attribution needs. It is not
itself an asset: the walk takes image and audio extensions alone, so an
attribution record is read as attribution.

**What ships.** `npm run build:assets` (`package-build assets`, driven by
`packageBuild.assets` in `package-build.config.yaml`) mirrors `assets/audio`,
`assets/icons`, `assets/images`, `assets/fonts` and `assets/ui` into
`build/stage/`, along with `lang/`, `templates/`, `LICENSE.md`, `README.md` and
`build/schema.json`. `assets/content/` is **not** copied — a file dropped in
beside its note is not an asset and will not be served.

## Three roots are addressable

An asset is reached by an address, exactly as a being or a skill is, and the type
comes from the root the file sits under:

| Root            | Type    |
| --------------- | ------- |
| `assets/icons`  | `icon`  |
| `assets/images` | `image` |
| `assets/audio`  | `audio` |

A directory under `assets/` that is not one of the three holds nothing
addressable. `assets/ui` is the package's own furniture — the interface reaches
it directly — and `assets/fonts` is read by the stylesheet, so no note addresses
either.

**The filename is the shortcode**, and the extension and the directories above
it are not part of the address:

```text
assets/icons/game-icons/lorc/anvil.svg      →  sohl-none-icon-anvil
assets/images/beings/creatures/mntrlzrd.webp →  sohl-none-image-mntrlzrd
```

Three consequences follow.

**A root is one flat namespace, however deeply it nests.** Two files under one
root sharing a basename are two claims on one address, and the build names both.
Across roots they collide with nothing: `icon-anvil` and `image-anvil` are
different addresses.

**Layout is free.** Rearranging `assets/icons/` wholesale changes no address and
no note, so the trees are organised for whoever maintains them — by contributor,
by subject, by source set.

**A shortcode is lowercase alphanumerics.** A filename carrying a hyphen, a
version string or a date stamp cannot be addressed, and the build says so rather
than inventing a shortcode.

An asset address always carries `none` in its system segment —
`sohl-none-icon-anvil` — so key parsing is uniform across every type.

## The art fields are addresses

`icon`, `tokenIcon` and `banner` name **addresses**, not paths. The
owning package comes from the record the address resolves to, so there is nothing
for the author to state, and the shortcode is the bare filename:

```yaml
data: { icon: sword, packFolder: weapons }
```

A being's portrait is not a field at all. It is the lead image opening the note's
`{#appearance}` section, so it is written as an image in the body and carries its
own caption.

**An address that resolves to nothing is an error**, named with the file and the
position of the address, and `npm run lint` fails on it. That is the whole of the
checking: an address is verified, so a mistyped icon name is caught before
anything ships.

`banner` is the one art slot with no Foundry destination — it reaches the
generated page and the book's section plates and nothing else.

## Where a pathname is still authored

One place takes a pathname rather than an address: an image in a note's body. A
pathname is a **statement of ownership**, written
`<package>/assets/<suffix>`, and every surface derives its own address from it. A
pathname with no package prefix belongs to the package being compiled.

```markdown
![A map of the Vale](images/maps/valeofthorns.webp)

![A shield](sohl/assets/icons/noun/shield.svg)
```

**A `systems/…` or `modules/…` pathname is refused**, with a finding naming the
replacement. It is a Foundry address written where an ownership statement belongs:
it resolves for Foundry and for nothing else, because neither the website nor the
book has such a directory. `sohl/assets/ui/logo.webp` is the form.

**A pathname naming no package passes through on every surface** — an absolute
URL, a `data:` URI, a protocol-relative `//host/…`, or a `/`-rooted path, which
Foundry serves from its data root. That is how a note addresses core Foundry art
(`/icons/svg/mystery-man.svg`).

A map's art is addressed through `data.fixup`, which replaces the asset paths of
an exported Scene with addresses. See [[doc-mapnotes|Map Notes]].

## Default art

An item note naming no `icon` gets the art paired with its type. SoHL's own map is
`DEFAULT_ITEM_ART` in `@heroiclands/package-build/sohl/default-item-art`, and
every entry is a bundled SVG written in the ownership form:

| Item type         | Default art                                         |
| ----------------- | --------------------------------------------------- |
| `affiliation`     | `sohl/assets/icons/noun/shield.svg`                 |
| `affliction`      | `sohl/assets/icons/other/sick.svg`                  |
| `armorgear`       | `sohl/assets/icons/game-icons/lorc/breastplate.svg` |
| `attribute`       | `sohl/assets/icons/other/charm.svg`                 |
| `concoctiongear`  | `sohl/assets/icons/game-icons/badges/flask.svg`     |
| `containergear`   | `sohl/assets/icons/other/sack.svg`                  |
| `miscgear`        | `sohl/assets/icons/other/question-mark.svg`         |
| `mystery`         | `sohl/assets/icons/other/sparkles.svg`              |
| `mysticalability` | `sohl/assets/icons/other/hand-sparkles.svg`         |
| `projectilegear`  | `sohl/assets/icons/noun/arrow.svg`                  |
| `skill`           | `sohl/assets/icons/other/head-gear.svg`             |
| `trauma`          | `sohl/assets/icons/other/injury.svg`                |
| `weapongear`      | `sohl/assets/icons/other/sword.svg`                 |

The keys are SoHL **document** subtypes rather than note types, because the
runtime reads the map with a Foundry Item subtype.

**Why there is a map at all.** Foundry's own `Item.DEFAULT_ICON` is the white
`icons/svg/item-bag.svg` — invisible on the light Manuscript sheet, and not
theme-adaptive. Every SoHL item type therefore gets a themed SVG instead.

**The runtime reads the same map.** `SohlItem.getDefaultArtwork` imports it back
through the package's `./sohl/default-item-art` entry point, so an item created
in-world (via **Add Trauma**, say) gets the icon the pack builder would have given
it. One map is what keeps the build-time and runtime defaults from disagreeing.

### Two layers of fail-fast, and a consumer only meets the second

`defaultItemArt(type)` throws at **import** for a type SoHL's map does not cover.
That is what keeps the art map and the builder registry one list: the registry
cannot name a type the map does not cover.

Separately, at **compile**, the item registry throws when a note carries no art
_and_ the type's `itemBuilders` entry pairs none. Its message names both fixes:
write the registry entry as `<type>: { system: <builder>, img: "<path>" }`, or
give the note art of its own.

**Art travels with the builder.** A consuming repository that defines its own
item type supplies that type's default in its own `itemBuilders` entry and never
edits a SoHL-owned table. A registry path is an ownership pathname like any
other, so one spelling means one thing wherever it is written.

## What makes an SVG themeable

Bundled icons are solid black silhouettes, which vanish on a dark surface —
including the Foundry compendium and directory windows, whose `<img>` thumbnails
SoHL's `.sohl`-scoped CSS cannot reach. The only styling that travels with an SVG
loaded through `<img>` is the SVG itself, so staging runs every `.svg` under
`assets/icons` through the toolchain's `svg-theme` transform (`assetTransform:
svg-theme` in `package-build.config.yaml`), which inserts a `<style>` block
carrying a `@media (prefers-color-scheme: dark)` fill swap: iron-gall ink
`#211d16` in light, cream `#ece3cf` in dark, mirroring
`--sohl-color-text-primary` (see [[doc-cssarchitecture|CSS Architecture]]). The
two colours are kept in sync with `scss/abstracts/_tokens.scss` **by hand**,
because a build script cannot read the SCSS maps.

**This happens at build time only, and to `assets/icons` only.** The source SVGs
stay pristine black-on-transparent, so the knowledgebase and website — which
render them on light ground — are unaffected, and every other asset directory is
copied without the transform.

The injected rule matches `[fill="#000"]`, `[fill="#000000"]`, `[fill="black"]`,
and `path` / `rect` / `circle` / `ellipse` / `polygon` / `polyline` / `line` / `g`
carrying **no** `fill` attribute at all.

**So an SVG themes when all four hold:**

1. It has an `<svg …>` open tag.
2. It contains no `prefers-color-scheme` (already-themed files are left alone,
   which is what makes the injection idempotent).
3. No drawable states its colour as a `fill` declaration inside a `style`
   attribute. The guard keys on the **property**, so `fill-rule`, `fill-opacity`
   and `paint-order: fill` are all fine — only `fill:` itself disqualifies a
   file.
4. Its drawables either carry a black `fill` attribute or no `fill` attribute.

Each of the first three bail-outs returns the file **unchanged** rather than
half-recolouring it — a deliberate choice, since a partly recoloured two-tone
badge is worse than an untouched one.

### `fill="currentColor"` is not a theming mechanism here

The selector never matches `currentColor`, and an SVG loaded through `<img>`
inherits nothing from the page, so such an icon renders black regardless of
theme. The files under `other/` that use it are UI-chrome glyphs with no black
fill to match, so they are unaffected rather than broken. Do not reach for
`currentColor` expecting it to do what the injected `<style>` does.

### An inline fill style skips the file entirely

An inline `style` attribute wins over a `<style>` rule, so `injectAdaptiveFill`
declines to touch such a file. **State an icon's colour as a `fill` attribute,
never as a `fill:` declaration** — or drop it entirely, so the shape defaults to
black and the injected rule picks it up through `:not([fill])`.

An icon authored the other way ships black on the dark compendium and directory
windows, so bundled icons carry `fill` attributes rather than inline `fill:`
declarations. The two name the same colour, so the rendered artwork is identical.

`tests/build/icon-theming.test.ts` is the standing gate. It walks every `.svg`
under `assets/icons`, fails on any the injection declines, and separately
requires each `ItemMetadatas` / `ActorMetadatas` default art to theme. A new icon
carrying inline fills fails there rather than shipping un-themed.

That suite carries one allowlist entry: `other/mantle.svg` is drawn entirely in
**strokes**, whose colour lives in an inline `stroke:` that no injected rule can
override, and rewriting only its fills would half-recolour it. Stroke theming is
unimplemented; other icons carrying a black `stroke` attribute alongside a themed
fill are affected the same way.

### The webfont normaliser is a separate pass

`utils/transparentize-svg.mjs` forces a Game-Icons SVG to black-on-transparent:
it drops the full-canvas background rect (the lone `d="M0 0h512v512H0z"` path
Game-Icons ship) and sets `fill="#000"` on every remaining drawable. It runs only
in the webfont pipeline (`build:icons` / `build:kb-icons`), never in the asset
copy — but it is why every `game-icons/**` file satisfies condition 4 above.

`build:icons` writes three **committed** artifacts:
`assets/fonts/game-icons.woff2`, `scss/abstracts/_icons.scss`, and
`assets/icons/game-icons-codepoints.json`. Codepoints start at `0xE001` in the
Private Use Area and are persisted in that JSON, including entries for icons that
have since been deleted, so adding an icon never shifts the codepoint of any
other.

## Formats in practice

| Use                | Format | Convention                                           |
| ------------------ | ------ | ---------------------------------------------------- |
| Item icon          | SVG    | every type default is an SVG                         |
| Actor icon / token | SVG    | `icon` feeds the actor and its prototype token       |
| Portrait           | WebP   | the lead image of the note's `{#appearance}` section |
| Creature art       | WebP   | under `images/beings/creatures/`                     |
| Map background     | JPEG   | `images/ui/parchment.jpg`, 512×512                   |
| UI / branding      | WebP   | a responsive set under `assets/ui`                   |

The branding set runs 400×100, 400×225, 512×512, 1200×400 and 1920×1080 — sized
for page chrome and OG images rather than for Foundry.

**viewBox conventions are not uniform, and there is no rule to enforce.**
`game-icons/` is entirely `0 0 512 512` (its own pipeline hard-codes the
512-square background rect it strips); `noun/` is mostly `0 0 100 100`; `other/`
is a grab-bag, with clusters at `0 0 512 512`, `0 0 1080 1080` and
`0 0 1200 1200` and a long tail. Match the set you are adding to, and keep the
artwork square unless you have a reason not to: Foundry renders an item icon into
a square box and will letterbox anything else.

## Adding a file, end to end

1. Put it under the right root — an item or actor icon goes in
   `assets/icons/other/` unless it comes from a vendored set, and a picture for a
   note's body goes under `assets/images/`.
2. Name it in lowercase alphanumerics, because the basename becomes its
   shortcode, and check that no other file under the same root already carries
   that basename.
3. Record its provenance in the `provenance.yaml` beside it — attribution,
   source, licence, and whether a machine made it.
4. If it is an SVG, check it against the four conditions above; move any
   `style="…fill:…"` colour out to a `fill` attribute.
   `tests/build/icon-theming.test.ts` checks this for you.
5. Address it from the note by its shortcode — `icon: relic` — and from a body
   image by the ownership pathname.
6. For a new **item type**, pair its default art with its builder in the
   `itemBuilders` registry rather than reaching for a SoHL table. The
   configuration names that registry; it does not carry it.

Where each art field sits in a note is per-type: see
[[doc-itemfrontmatter|Item Note Frontmatter]] and [[doc-actornotes|Actor Notes]].
