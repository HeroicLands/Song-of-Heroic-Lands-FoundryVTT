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
import { SohlClassRegistry } from "@utils/SohlClassRegistry";
import { RegisterClass } from "@utils/decorators/RegisterClass";
const kTestResult = Symbol("TestResult");
const kData = Symbol("TestResult.Data");
const kContext = Symbol("TestResult.Context");

/**
 * Represents a value and its modifying deltas.
 */

@RegisterClass(new SohlClassRegistry.Element("TestResult", TestResult))
export abstract class TestResult extends SohlBase {
    speaker: SohlSpeaker;
    name: string;
    title: string;
    description: string;
    readonly parent: SohlLogic;
    readonly [kTestResult] = true;

    static isA(obj: unknown): obj is TestResult {
        return typeof obj === "object" && obj !== null && kTestResult in obj;
    }

    constructor(
        data: Partial<TestResult.Data>,
        options: Partial<TestResult.Options> = {},
    ) {
        if (!options.parent) {
            throw new Error("TestResult requires a parent");
        }
        super(data, options);
        this.speaker =
            data.speaker ? new SohlSpeaker(data.speaker) : new SohlSpeaker();
        this.name = data.name ?? "";
        this.title = data.title ?? "";
        this.description = data.description ?? "";
        this.parent = options.parent;
    }

    async evaluate() {
        return true;
    }
}

export namespace TestResult {
    const SUCCESS = 1;
    const FAILURE = 0;

    export interface Data {
        readonly [kData]: true;
        speaker: SohlSpeaker.Data;
        name: string;
        title: string;
        description: string;
    }

    export namespace Data {
        export function isA(obj: unknown): obj is TestResult.Data {
            return typeof obj === "object" && obj !== null && kData in obj;
        }
    }

    export interface Options {
        parent: SohlLogic;
    }
}
