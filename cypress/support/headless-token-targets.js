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
 * Guard target graphics deliberately absent when headless Token.draw is skipped.
 * Initialized graphics retain the native renderer and its errors; targeting
 * documents, user target sets, and all gameplay behavior remain untouched.
 * @param {object} proto - The native Token placeable prototype.
 */
export function guardUndrawnTokenTargets(proto) {
    for (const [method, graphics] of [
        ["_drawTargetArrows", "targetArrows"],
        ["_drawTargetPips", "targetPips"],
    ]) {
        const native = proto[method];
        if (typeof native !== "function") continue;
        proto[method] = function (...args) {
            if (this[graphics] == null) return;
            return native.apply(this, args);
        };
    }
}
