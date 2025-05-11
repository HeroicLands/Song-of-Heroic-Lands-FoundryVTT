/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { foundryHelpers } from "@utils";

export class SohlActorSheet extends foundry.applications.sheets.ActorSheetV2 {
    static get defaultOptions() {
        return foundryHelpers.mergeObject(super.defaultOptions, {
            classes: ["sohl", "sheet", "actor"],
            width: 900,
            height: 640,
            filters: [
                {
                    inputSelector: 'input[name="search-traits"]',
                    contentSelector: ".traits",
                },
                {
                    inputSelector: 'input[name="search-skills"]',
                    contentSelector: ".skills",
                },
                {
                    inputSelector: 'input[name="search-bodylocations"]',
                    contentSelector: ".bodylocations-list",
                },
                {
                    inputSelector: 'input[name="search-afflictions"]',
                    contentSelector: ".afflictions-list",
                },
                {
                    inputSelector: 'input[name="search-mysteries"]',
                    contentSelector: ".mysteries-list",
                },
                {
                    inputSelector: 'input[name="search-mysticalabilities"]',
                    contentSelector: ".mysticalabilities-list",
                },
                {
                    inputSelector: 'input[name="search-gear"]',
                    contentSelector: ".gear-list",
                },
                {
                    inputSelector: 'input[name="search-effects"]',
                    contentSelector: ".effects-list",
                },
            ],
        });
    }
}
