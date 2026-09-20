---
# The package landing at /sohl/ — the entry point to everything this repository
# publishes, and the address the site's navigation, the shipped system's in-app
# help, and every external link to the project use.
#
# What this page is *not* is as load-bearing as what it is. It is not the site's
# front page, which already carries Knowledgebase and API cards — repeating those
# here would make this a second copy of that grid. It is not the project page at
# /projects/song-of-heroic-lands/, which pitches the system to someone deciding
# whether to try it. This page serves the reader who has already arrived: it
# tells them how to install it, and routes them by what they came to do. So the
# shape is deliberate — install first, because it is the one thing no other page
# gives concretely, then three doors chosen by audience rather than by which
# surface happens to publish them. A reader at the table should not have to know
# that the rules live on the knowledgebase and the API reference does not.
#
# The page is its body, published verbatim: no wikilink resolves here and no
# table expands, so every link is a markdown link, package-relative (resolved
# against the /sohl/ mount) or external.
type: homepage
shortcode: root
title: Song of Heroic Lands
description: A classless, skill-based fantasy system for Foundry Virtual Tabletop —
  HârnMaster-compatible, and built to keep the books while you make the calls.
data:
  banner: null
---

Everything published for the system lives under this address: the rules and the
player guides, the full catalog of content it ships, and the generated reference
for building on it. SoHL tracks the wounds, the healing, the calendar and the
modifiers, then asks you what you want to do — nothing happens to a character
without their player's say-so, and every number on the sheet shows where it came
from.

## Install it in Foundry

In Foundry's setup screen, choose **Game Systems > Install System** and paste
this manifest URL:

`https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/releases/latest/download/system.json`

Requires Foundry VTT v14. The system is in active development, so expect change
between releases — see the
[latest release](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/releases/latest)
for what is in this one, or
[open an issue](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues)
if something is wrong.

## Start where you are

### At the table

Running or playing in a game: how the system behaves in Foundry, and the rules
it implements.

- [User Guide](doc-userguide/) — playing with it, sheet by sheet
- [Rules](doc-rulesintro/) — tests, injury, healing, mysticism
- [Quickstart](doc-quickstartug/) — a first session
- [Character Creation](doc-charcreationug/)

### What it ships with

Hundreds of ready creatures and items to drag onto a sheet, each documented
exactly as it is implemented.

- [Beings](doc-bestiary/) — every creature and character it ships
- [Weapons](doc-weapongear/)
- [Armour and clothing](doc-armorgear/)
- [Skills and attributes](doc-skill/)
- [Afflictions](doc-affliction/)
- [Trauma](doc-traumaintro/)

### Building on it

Writing a module, a macro, or a house rule — or changing the system itself.

- [Developer documentation](doc-devdocs/) — architecture and how-tos
- [API reference](api/) — every public symbol
- [Extension points](doc-extensionpoints/) — extending without forking
- [Macros and Actions](doc-macrosandactions/)

The system, its content and these pages are all built from
[one repository](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
Questions are welcome on [Discord](https://discord.gg/EwMfkNd3az).
