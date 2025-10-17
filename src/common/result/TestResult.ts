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

import { SohlBase } from "@common/SohlBase";
import type { SohlLogic } from "@common/SohlLogic";
import { SohlSpeaker } from "@common/SohlSpeaker";

/**
 * Represents a value and its modifying deltas.
 */
export abstract class TestResult extends SohlBase {
    protected _speaker: SohlSpeaker;
    protected _name: string;
    protected _title: string;
    protected _description: string;
    protected readonly _parent: SohlLogic;

    constructor(
        data: Partial<TestResult.Data>,
        options: Partial<TestResult.Options> = {},
    ) {
        if (!options.parent) {
            throw new Error("TestResult requires a parent");
        }
        super(data, options);
        this._parent = options.parent;
        this._speaker = data.speaker ?? new SohlSpeaker();
        this._name = data.name ?? "";
        this._title = data.title ?? "";
        this._description = data.description ?? "";
    }

    get description(): string {
        return this._description;
    }

    get parent(): SohlLogic {
        return this.parent;
    }

    async evaluate() {
        return true;
    }

    get name(): string {
        return this._name;
    }

    get title(): string {
        return this._title;
    }

    get speaker(): SohlSpeaker {
        return this._speaker;
    }
}

export namespace TestResult {
    export const Kind: string = "TestResult";

    export const SUCCESS = 1;
    export const FAILURE = 0;

    export interface Data {
        speaker: SohlSpeaker;
        name: string;
        title: string;
        description: string;
    }

    export interface Options {
        parent: SohlLogic;
    }
}
