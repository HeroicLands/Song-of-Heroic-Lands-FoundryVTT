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

import { SohlSystem } from "@foundry/core";

export class LegendarySystem extends SohlSystem {
    readonly id = "legendary";
    readonly title = "Legendary";
    readonly INIT_MESSAGE = ` _                               _
    | |                             | |
    | |     ___  __ _  ___ _ __   __| | __ _ _ __ _   _
    | |    / _ \\/ _\` |/ _ \\ '_ \\ / _\` |/ _\` | '__| | | |
    | |___|  __/ (_| |  __/ | | | (_| | (_| | |  | |_| |
    \\_____/\\___|\\__, |\\___|_| |_|\\__,_|\\__,_|_|   \\__, |
                 __/ |                             __/ |
                |___/                             |___/
    ===========================================================`;

    readonly CONFIG = {
        ...SohlSystem.prototype.CONFIG,
    };
}

// Register the LegendarySystem as a variant of the SohlSystem
SohlVariant["legendary"] = LegendarySystem;
