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

import { SohlBase, SohlPerformer } from "@logic/common/core";
import { SohlSpeaker } from "@logic/common/core";
import { DataField, RegisterClass } from "@utils";
import { SohlMap } from "@utils/collection";

export type TestResultMap = SohlMap<string, TestResult>;

/**
 * Represents a value and its modifying deltas.
 */
@RegisterClass("TestResult", "0.6.0")
export abstract class TestResult extends SohlBase {
    @DataField("speaker", { type: SohlSpeaker })
    speaker!: SohlSpeaker;

    @DataField("name", { type: String, initial: "" })
    name!: string;

    @DataField("title", { type: String, initial: "" })
    title!: string;

    @DataField("description", { type: String, initial: "" })
    description!: string;

    async evaluate() {
        return true;
    }
}
