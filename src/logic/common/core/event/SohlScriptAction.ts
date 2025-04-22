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

import { SohlMap } from "@utils";
import { SohlEvent } from "@logic/common/core/event";
import { DataField, RegisterClass } from "@utils/decorators";

export type ScriptActionMap = SohlMap<string, ScriptAction>;

@RegisterClass("ScriptAction", "0.6.0")
export class ScriptAction extends SohlEvent {
    @DataField("script", { type: String, required: true })
    private script!: string;

    @DataField("useAsync", { type: Boolean, initial: true })
    private useAsync!: boolean;
}
