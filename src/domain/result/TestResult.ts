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
 * Abstract base class for all test results in the combat resolution pipeline.
 *
 * Every test in SoHL — skill checks, opposed contests, attacks, defenses —
 * produces a result object that captures the outcome, the speaker identity
 * for chat messages, and a reference back to the Logic that initiated the
 * test.
 *
 * ## Class hierarchy
 *
 * ```
 * TestResult (abstract)
 * ├── SuccessTestResult — d100 roll-under mastery level test
 * │   ├── AttackResult — attacker's roll, with impact dice and aim
 * │   └── DefendResult — defender's roll with situational modifiers
 * └── OpposedTestResult — two competing SuccessTestResults
 *     └── CombatResult — attack vs. defense with full combat resolution
 * ```
 *
 * ## Lifecycle
 *
 * 1. Created by a test method (e.g., {@link MasteryLevelModifier.successTest}).
 * 2. {@link evaluate} is called to resolve the outcome (roll dice, compute
 *    success level, etc.). Returns `true` if the result should be displayed.
 * 3. Result is posted to chat and/or consumed by the next stage of the
 *    pipeline (e.g., an AttackResult feeds into a CombatResult).
 *
 * Results are **not** persisted to the database — they exist transiently
 * during resolution and are displayed via chat cards.
 */
export abstract class TestResult {
    protected _speaker: SohlSpeaker;
    protected _name: string;
    protected _title: string;
    protected _description: string;
    protected readonly _parent: SohlLogic;

    /**
     * Construct a test result, capturing the speaker and display metadata and
     * binding it to the initiating Logic.
     *
     * @param data - Common result data (speaker, name, title, description); all
     *   fields are optional and defaulted.
     * @param options - Must provide `options.parent`, the initiating Logic.
     * @throws If `options.parent` is missing.
     */
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

    /**
     * Serialize this result to a plain, persistable object. Results are not
     * stored in the database, but this is used to pass a result between clients
     * (e.g. embedding an evaluated {@link AttackResult} in a chat card so the
     * defender's client can reconstruct it).
     *
     * @returns A plain object representation of this result.
     */
    toJSON(): PlainObject {
        return instanceToJSON(this);
    }

    /** Human-readable description shown on the result's chat card. */
    get description(): string {
        return this._description;
    }

    /** The Logic that initiated the test — the result's owner and context. */
    get parent(): SohlLogic {
        return this._parent;
    }

    /**
     * Resolve the test outcome. The base implementation is a no-op that returns
     * `true`; subclasses override it to roll dice, compute success levels, and
     * apply mishaps.
     *
     * @returns `true` if the result should be displayed (e.g. posted to chat);
     *   `false` if the test was cancelled or is not allowed to proceed.
     */
    async evaluate() {
        return true;
    }

    /** Internal identifier for this result (distinct from the display title). */
    get name(): string {
        return this._name;
    }

    /** Title shown at the top of the result's chat card. */
    get title(): string {
        return this._title;
    }

    /** Speaker identity (actor/token/user) used when posting this result to chat. */
    get speaker(): SohlSpeaker {
        return this._speaker;
    }
}

export namespace TestResult {
    /** Registry key identifying this result kind for serialization. */
    export const Kind: string = "TestResult";

    /** Numeric sentinel for a successful outcome. */
    export const SUCCESS = 1;
    /** Numeric sentinel for a failed outcome. */
    export const FAILURE = 0;

    /** Construction data common to every {@link TestResult}. */
    export interface Data {
        /** Speaker identity for the result's chat card. */
        speaker: SohlSpeaker;
        /** Internal identifier for the result. */
        name: string;
        /** Title shown on the chat card. */
        title: string;
        /** Human-readable description shown on the chat card. */
        description: string;
    }

    /** Options common to every {@link TestResult}. */
    export interface Options {
        /** The Logic initiating the test (required; becomes {@link TestResult.parent}). */
        parent: SohlLogic;
    }
}
