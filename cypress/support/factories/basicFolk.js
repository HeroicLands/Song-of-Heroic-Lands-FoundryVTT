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
 * The canonical starter being shipped in the `sohl.actors` compendium.
 *
 * "Basic Folk" is fully populated (14 attributes, an inline body at
 * `system.body` with 6 parts plus terrestrial movement at
 * `system.currentMoveMedium`/`system.movementProfiles`, 25 skills with
 * `masteryLevelBase`, 1 mystical ability, 1 misc gear) but ships no weapon,
 * armor, trait, or affiliation. Gear/combat specs import it and add the missing
 * pieces from the `sohl.items` pack.
 */
export const BASIC_FOLK = Object.freeze({
    pack: "sohl.actors",
    id: "ImRkyb5P1KTxECbe",
    name: "Basic Folk",
});
