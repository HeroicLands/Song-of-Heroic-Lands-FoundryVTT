/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.org>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The package-agnostic half of the toolchain: everything that knows how a
 * HeroicLands content tree is shaped, but nothing about any particular game
 * system's data model.
 *
 * This barrel will re-export the content walk, frontmatter parsing, table
 * generation, wikilink resolution, id and folder derivation, the link manifest
 * and the web-address rule, `BasePackCompiler`, and the generic Foundry
 * document compilers (journals, macros, scenes) as #1501 moves them here. It
 * already carries the region-event vocabulary the scene/map-note compiler
 * validates against, which the runtime shares (#1510).
 *
 * That module is also reachable as its own entry point,
 * `@heroiclands/content-build/engine/region-events`. The runtime imports it
 * that way on purpose: this barrel grows to hold compilers that read the
 * filesystem, and a client bundle must never pull those in to reach a frozen
 * list of strings.
 *
 * @module
 */

export {
    CURATED_REGION_EVENTS,
    EXCLUDED_REGION_EVENTS,
    REGION_EVENT_TO_TRIGGER,
} from "./region-events.mjs";
