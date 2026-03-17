/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export * from "./sohl-globals";

// Declaration merging to add missing FoundryVTT V13 methods
// that exist at runtime but are not in foundry-vtt-types
declare global {
    interface Actor {
        /**
         * A method called after embedded documents (items, effects) are prepared.
         * This is part of the FoundryVTT V13 data preparation lifecycle.
         * @remarks
         * This method exists in FoundryVTT V13 but is missing from the type definitions.
         * It's called between prepareBaseData() and prepareDerivedData().
         */
        prepareEmbeddedData(): void;
    }
}
