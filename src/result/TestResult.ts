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

import { instanceToJSON } from "@src/utils/helpers";
import type { SohlLogic } from "@src/core/SohlLogic";
import { SohlSpeaker } from "@src/core/SohlSpeaker";

/**
 * Represents the result of a test, including whether the test was successful,
 * who the speaker is for any associated chat messages, and any relevant
 * descriptions or titles.  Also tracks the parent logic that produced this
 * result, which can be used to access additional context about the test and
 * its place within the overall action or event sequence.
 */
export abstract class TestResult {
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
        this._parent = options.parent;
        this._speaker = data.speaker ?? new SohlSpeaker();
        this._name = data.name ?? "";
        this._title = data.title ?? "";
        this._description = data.description ?? "";
    }

    toJSON(): PlainObject {
        return instanceToJSON(this);
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
