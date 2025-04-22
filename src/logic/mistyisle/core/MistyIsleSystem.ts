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

export class MistyIsleSystem extends SohlSystem {
    readonly id = "mistyisle";
    readonly title = "mistyisle";
    readonly INIT_MESSAGE = `___  ____     _           _____    _      
|  \\/  (_)   | |         |_   _|  | |     
| .  . |_ ___| |_ _   _    | | ___| | ___ 
| |\\/| | / __| __| | | |   | |/ __| |/ _ \\
| |  | | \\__ \\ |_| |_| |  _| |\\__ \\ |  __/
\\_|  |_/_|___/\\__|\\__, |  \\___/___/_|\\___|
                   __/ |                  
                  |___/                   
===========================================================`;

    readonly CONFIG = {
        ...SohlSystem.prototype.CONFIG,
    };
}

// Register the LegendarySystem as a variant of the SohlSystem
SohlVariant["legendary"] = MistyIsleSystem;
