---
shortcode: assetpacks
name: {full: Asset Packs}
type: doc
subType: concept
description: "How art is deployed, how a reference states its address, and how Fix rewrites references to a selected asset pack."
tags: [dev-concepts]
data: {pack: none}
sohl: {kbcat: devdocs}
---

# Asset Packs

See also: [[doc-assetconventions|Asset Conventions]], [[doc-securitymodel|Security Model & Guardrails]]

An asset pack is a set of icons and images for one content package. A package
ships one pack, **Default**; a GM can add others and select one per package. A
document does not store which pack it uses. It stores a path, plus the
**address** of the asset the path stands for, and **Fix** recomputes the path
from the address and the selected pack.

The code is in three places:

- `src/utils/asset-rewrite.ts` resolves one reference. It uses no Foundry API.
- `src/apps/logic/asset-packs.ts` holds the setting's shape, pack-file
  parsing, locations and the document-level rewrite. It is Foundry-free.
- `src/apps/foundry/asset-packs.ts` and `AssetPacksMenu.ts` bind those to
  Foundry: the world setting, downloads, the import hook and the menu.

## The deployed layout

A pack's files sit below one root, in two directories:

```text
icons/<basename>
images/<basename>
```

The directory comes from the address: `<package>-none-icon-<shortcode>` deploys
under `icons/`, `<package>-none-image-<shortcode>` under `images/`. The basename
is the shortcode plus the file's extension, so `thalorna-none-icon-wolf`
deployed as WebP is `icons/wolf.webp`. Source directories below `assets/icons/`
and `assets/images/` are not part of the deployed path (see
[[doc-assetconventions|Asset Conventions]] for how a file in the repository
becomes an address).

The root is the package's install root (`systems/<id>/` or `modules/<id>/`) for
Default, or the folder the GM chose for any other pack. A reference's path is
always `root + target`.

## Pack files

A pack file is JSON:

```json
{
  "name": "Illustrated",
  "package": "thalorna",
  "assets": [
    {
      "address": "thalorna-none-icon-wolf",
      "source": "illustrated/wolf.webp",
      "target": "icons/wolf.webp",
      "size": 18342
    }
  ]
}
```

| Field     | Meaning                                                                        |
| --------- | ------------------------------------------------------------------------------ |
| `name`    | Display name in the Asset Packs menu.                                          |
| `package` | The content package: the first segment of every address the pack lists.        |
| `address` | The asset the entry provides.                                                  |
| `source`  | Where the file is fetched from.                                                |
| `target`  | The path below the root, in the deployed layout. Relative, no `..`.            |
| `size`    | Size in bytes; a file in the folder with a different size is downloaded again. |

`source` is either an `http(s)` URL, used as given, or a relative file path
resolved against the folder of the pack file. A relative path has no leading
`/`. A pack file at `https://cdn.example.org/thalorna/ai.json` with
`"source": "ai/wolf.webp"` fetches
`https://cdn.example.org/thalorna/ai/wolf.webp`.

A pack file is refused when its shape is wrong, when its `package` is not the
package it is added to, when a `target` is absolute, a URL or climbs out of the
root, or when the file is named `default.json`, which is reserved for the
shipped pack.

**Where packs live.** The shipped pack is `asset-sets/default.json` at the
install root of every package that ships art. The system and each active module
holding that file get a row in the menu. Added packs are stored in the
world setting `sohl.imageLocations`, keyed by content package:

```text
{ thalorna: { assetPacks: [{url, name, contents, folder}], current, used } }
```

`contents` is the pack file with every relative `source` already made absolute
against `url`, so the stored copy records where each file comes from. `folder`
is where Fix last downloaded the pack. `current` is the selected pack's `url`,
or `null` for Default. `used` lists every root the package's references have
had in this world. Adding a pack from an address already stored replaces its
contents and keeps its folder. Removing a pack deletes its entry from
`assetPacks`; it does not delete downloaded files and does not change `used`.

## How a reference states its address

Each reference carries the address beside the path, and the address is the part
that survives a change of pack.

**HTML.** An `<img>` in an HTML field carries `data-asset`:

```html
<img src="systems/sohl/images/valeofthorns.webp" data-asset="sohl-none-image-valeofthorns" />
```

The sanitizer keeps `data-asset`. An `<img>` without it is never touched.

**Path fields.** A document's `flags.sohl.assets` mirrors the path fields it
covers, nested to the same shape, with addresses as the leaves:

```json
{
  "img": "systems/sohl/icons/wolf.webp",
  "flags": { "sohl": { "assets": { "img": "sohl-none-icon-wolf" } } }
}
```

A field nested below the top, such as a scene's `background.src`, appears as
`flags.sohl.assets.background.src`. A document with several path fields lists
each.

**Token art.** An actor's prototype token holds its own `flags` object, so the
address for its texture is on the token model, not on the actor:

```json
{
  "prototypeToken": {
    "texture": { "src": "systems/sohl/icons/wolf.webp" },
    "flags": { "sohl": { "assets": { "texture": { "src": "sohl-none-icon-wolf" } } } }
  }
}
```

A token placed on a scene carries the same flag on itself:
`flags.sohl.assets.texture.src`. Fix reads the actor's own flag and the flag of
each model listed as carrying its own, and writes the rewritten field back into
that model.

## The rewrite

`resolveAsset(address, value, locations)` answers for one reference. The address
selects the package; the package's locations hold two roots (`current`, the
selected pack's folder, and `installed`, the install root) and two entry maps.

1. The **target** is the first that exists:
   1. the address's entry in the selected pack, as `current + target`;
   2. the address's entry in the shipped pack, as `installed + target`;
   3. the package's stand-in for the type, the shipped entry
      `<package>-none-<icon|image>-missing`, as `installed + target`.
2. A value already equal to the target is `unchanged`.
3. Otherwise the value is **rewritten** only if it is the address's own file:
   one of its known targets under a root in `used` or under the install root,
   or the stand-in under the install root. Any other value is `stale`: a person
   set it, so the path stays and the address is dropped from the reference
   (`data-asset` removed, the flag leaf deleted).
4. With no entry for the address and no stand-in, or with a malformed address or
   a package with no locations, the result is `unresolved` and nothing changes.

The selected pack's entries count as `current` only when their `target` is
present in the folder, so a file that has not been downloaded falls back to the
shipped copy instead of a broken path. `known` holds, per address, every
`target` the address has in the shipped pack and in every added pack; it lets
the guard recognize a file from a pack that has since been deselected or that no
longer lists the address.

Three cases, with the shipped root `systems/sohl/` and a pack folder `art/sohl/`:

| Value in the document          | Pack has the address and the file | Result                                      |
| ------------------------------ | --------------------------------- | ------------------------------------------- |
| `systems/sohl/icons/wolf.webp` | yes                               | rewritten to `art/sohl/icons/wolf.webp`     |
| `art/sohl/icons/wolf.webp`     | no longer selected                | rewritten to `systems/sohl/icons/wolf.webp` |
| `worlds/mine/wolf.png`         | either                            | stale: left alone, address dropped          |

The same function serves two callers. **Fix** applies it to every world
document: actors, items, journal entries and pages, scenes, macros and roll
tables, with their embedded documents and an unlinked token's synthetic actor.
**The import hook** applies it to an unsaved document and its embedded documents
in `preCreate`, so a document dragged in from a compendium arrives pointing at
files already downloaded. The hook writes nothing else and downloads nothing.
Compendium documents are never rewritten.

## How Fix finds HTML fields

Fix does not keep a list of fields that hold HTML. For each document it walks the
document's data schema and its system model's schema and collects the dotted
path of every `foundry.data.fields.HTMLField`. A `*` segment stands for every
element of an array field. Embedded collections are skipped, because Fix visits
embedded documents on their own.

A document whose HTML contains no `data-asset` is skipped without parsing. The
fields that do contain it are parsed, every `<img data-asset>` is resolved, and
the update writes the whole field back; an array holding a rewritten field is
written whole, since Foundry rebuilds an array updated by index.

A new `HTMLField` on any document or data model is therefore covered with no
change to Fix: put `data-asset` on its images and Fix finds them.

## Upload sources

Fix downloads into a folder the GM picks with Foundry's file browser. The
folder's text decides the storage, and every Foundry call goes through
`FoundryHelpers.ts`:

| Folder                                                    | Source     | Upload                                                                               |
| --------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| Starts with the Forge Assets Library prefix, on the Forge | `forgevtt` | Core `FilePicker.upload("forgevtt", path, file)`, with the user's session.           |
| An S3 URL or `s3://<bucket>/<key>`                        | `s3`       | `FilePicker.upload("s3", key, file, {bucket})`; the bucket is passed in the options. |
| Anything else                                             | `data`     | `FilePicker.upload("data", path, file)`, after creating each folder level.           |

On the Forge, `path` is the part of the folder after the prefix and the user's
own id segment. Uploads use the account that pressed Fix, so Fix needs the
permission to upload files and a Forge Assets Library the user can write to. No
credential is read or stored by the system.

For each file Fix lists the folder, issues a `HEAD` request for a file that
exists, and downloads only when the file is missing or its size differs from the
pack's `size`. Downloads run a few at a time. A failure is counted and retried
the next time Fix runs.
