---
# The package landing at /sohl/ — the entry point to everything this repository
# publishes (#1466), and the address the site's navigation, the shipped system's
# in-app help, and every external link to the project use.
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
# Everything below `landing:` is the shared contract documented in
# @heroiclands/hugo-theme's README under "A package landing page" and rendered by
# its `layouts/partials/landing.html` (theme #33, #1760). Six packages emit it,
# so nothing here is this repository's own shape and this page ships no CSS.
#
# Every `url:` is relative to the package root, which the theme resolves against
# this site — so the whole landing follows the /sohl/ mount rather than restating
# it link by link.
type: homepage
title: Song of Heroic Lands
description: A classless, skill-based fantasy system for Foundry Virtual Tabletop —
  HârnMaster-compatible, and built to keep the books while you make the calls.
banner: brand/sohl-banner.webp

landing:
  lead: >-
    Everything published for the system lives under this address: the rules and
    the player guides, the full catalog of content it ships, and the generated
    reference for building on it. SoHL tracks the wounds, the healing, the
    calendar and the modifiers, then asks you what you want to do — nothing
    happens to a character without their player's say-so, and every number on
    the sheet shows where it came from.

  install:
    heading: Install it in Foundry
    intro: >-
      In Foundry's setup screen, choose **Game Systems → Install System** and
      paste this manifest URL:
    url: https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/releases/latest/download/system.json
    note: >-
      Requires Foundry VTT v14. The system is in active development, so expect
      change between releases — see the [latest
      release](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/releases/latest)
      for what is in this one, or [open an
      issue](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT/issues)
      if something is wrong.

  cards:
    heading: Start where you are
    items:
      - title: At the table
        description: >-
          Running or playing in a game: how the system behaves in Foundry, and
          the rules it implements.
        links:
          - title: User Guide
            url: kb/user-guide/
            note: playing with it, sheet by sheet
          - title: Rules
            url: kb/rules/
            note: tests, injury, healing, mysticism
          - title: Quickstart
            url: kb/user-guide/song-of-heroic-lands-quickstart/
            note: a first session
          - title: Character Creation
            url: kb/user-guide/character-creation/

      - title: What it ships with
        description: >-
          Hundreds of ready creatures and items to drag onto a sheet, each
          documented exactly as it is implemented.
        links:
          - title: Beings
            url: kb/being/
            note: every creature and character it ships
          - title: Weapons
            url: kb/weapongear/
          - title: Armour and clothing
            url: kb/armorgear/
          - title: Skills and attributes
            url: kb/skill/
          - title: Afflictions
            url: kb/affliction/
          - title: Trauma
            url: kb/trauma/

      - title: Building on it
        description: >-
          Writing a module, a macro, or a house rule — or changing the system
          itself.
        links:
          - title: Developer documentation
            url: kb/dev-docs/
            note: architecture and how-tos
          - title: API reference
            url: api/
            note: every public symbol
          - title: Extension points
            url: kb/dev-docs/how-to/extension-points/
            note: extending without forking
          - title: Macros and Actions
            url: kb/dev-docs/concepts/macros-and-actions/

  closing: >-
    The whole reference is browsable from the [knowledgebase](kb/), and the
    system, its content and these pages are all built from [one
    repository](https://github.com/HeroicLands/Song-of-Heroic-Lands-FoundryVTT).
    Questions are welcome on [Discord](https://discord.gg/EwMfkNd3az).
---
