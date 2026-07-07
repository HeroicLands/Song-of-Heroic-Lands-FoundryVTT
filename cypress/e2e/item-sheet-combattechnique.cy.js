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

import { itemSheetSuite } from "../support/itemSheetSuite.js";

// RED — blocked by #147: the sheet references a strike-mode properties template
// (`combattechniquestrikemode-properties.hbs`) that does not exist, so the sheet
// fails to render. Its `strikeMode` is a melee/missile discriminated union that
// needs a purpose-built form. Enable once that template lands.
itemSheetSuite("combattechnique", { red: "#147" });
