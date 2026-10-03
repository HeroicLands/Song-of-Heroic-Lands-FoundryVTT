---
shortcode: root
name: {full: Song of Heroic Lands}
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
description: A classless, skill-based fantasy system for Foundry Virtual Tabletop — HârnMaster-compatible, and built to keep the books while you make the calls.
data: {banner: null}
---

**Play the character you actually imagined.**

Song of Heroic Lands (SoHL) is a classless, skill-based fantasy system for use with Foundry Virtual Tabletop. No classes, no levels, no archetypes to choose between — you decide what your character knows, believes, and can do, and the system builds them from that. The grizzled sergeant who reads the stars, the physician with smuggler friends, the shepherd who speaks to spirits: here those are ordinary characters, not multiclass workarounds.

It is a world with weight. Fights are fast and genuinely dangerous, so choosing to draw steel is a real decision rather than a foregone conclusion. Wounds stay with you and need treating. And when the dice turn against you, Fate is there — a resource you spend to walk away from something that should have finished you.

- **Magic worth building a character around.** The Arcane, Divine, and Spirit traditions play differently from one another — alchemy, runecraft, astrology, tarotry, summoning, trance, spirit work. Some of it is what your character _is_: a birthsign, a state of piety, quietly colouring everything they attempt. Some of it is what your character _does_: a rite, a prayer, an invocation, rolled and resolved in the moment.
- **Grow in the direction you played.** Skills improve because you used them, not because you spent points on them. Your character finishes the campaign shaped by what actually happened to them.
- **It keeps the books; you make the calls.** SoHL tracks the wounds, the healing, the calendar, the modifiers — then asks you what you want to do. Nothing happens to your character without your say-so, and every number on the sheet shows where it came from.
- **Bring your own world.** Run it with _HârnMaster_, with the open-source **Thalorna** setting, or in a world entirely of your own. Hundreds of creatures, weapons, armour, and skills come ready to drag onto a sheet, alongside a complete rules reference you can read at the table without leaving Foundry.

## License and Source Code

Song of Heroic Lands is licensed under GPL-3.0 for source code, and CC-BY-SA-4.0 for all content. See the file [LICENSE.md](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/blob/main/LICENSE.md) for details.

The source code is available on [GitHub](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/).

## Discord

Please consider joining [the community on Discord](https://bit.ly/44vZ10j) to discuss **Song of Heroic Lands** and find related modules and content.

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

## Important Information

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
