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

import { SuccessTestResult } from "@src/domain/result/SuccessTestResult";
import { TestResult } from "@src/domain/result/TestResult";
import type { SohlTokenDocument } from "@src/document/token/SohlTokenDocument";
import {
    isOpposedTestResultTieBreak,
    OPPOSED_TEST_RESULT_TIEBREAK,
    TestType,
} from "@src/utils/constants";

/**
 * The result of an **opposed test** — two actors directly competing via
 * their respective {@link SuccessTestResult | success tests}.
 *
 * Opposed tests are used for contested actions: grappling, stealth vs.
 * perception, persuasion vs. will, and similar skill-vs-skill situations.
 * Each side performs a success test independently, and the results are
 * compared to determine the winner.
 *
 * ## Resolution
 *
 * - {@link sourceTestResult} — the initiating actor's success test
 * - {@link targetTestResult} — the responding actor's success test
 * - Winner determined by comparing success levels, with configurable
 *   tie-breaking rules ({@link tieBreak}, {@link breakTies}).
 *
 * ## Key properties
 *
 * - {@link sourceWins} / {@link targetWins} — outcome flags
 * - {@link isTied} — both sides achieved the same success level
 * - {@link bothFail} — neither side succeeded
 *
 * ## Two-phase execution
 *
 * Opposed tests are executed in two phases:
 * 1. {@link MasteryLevelModifier.opposedTestStart} — source rolls and
 *    result is posted to chat with a "respond" button.
 * 2. {@link MasteryLevelModifier.opposedTestResume} — target rolls and
 *    the opposed outcome is evaluated and posted.
 *
 * ## Subclass
 *
 * {@link CombatResult} extends this for full combat resolution (attack
 * vs. defense with damage calculation).
 */
export class OpposedTestResult extends TestResult {
    /** The initiating (source) actor's success test. */
    sourceTestResult!: SuccessTestResult;
    /** The responding (target) actor's success test. */
    targetTestResult!: SuccessTestResult;
    /** Foundry roll mode for chat output. */
    rollMode!: string;
    /** The configured tie-break rule/offset (an {@link OPPOSED_TEST_RESULT_TIEBREAK} value). */
    tieBreak!: number;
    /** Whether ties should be broken (using {@link tieBreak}) rather than reported as a tie. */
    breakTies!: boolean;

    /**
     * Constructs an opposed test result from a source success test plus either
     * a target success test or a target token (from which a fresh target test
     * is created).
     * @param data - Must provide `sourceTestResult`, and either
     *   `targetTestResult` or `targetToken` (a fresh target success test is
     *   created from the token when only the latter is given).
     * @param options - Result options; `options.parent` is required (base
     *   {@link TestResult}).
     * @throws If `sourceTestResult` is missing, or if neither `targetTestResult`
     *   nor `targetToken` is provided.
     */
    constructor(
        data: Partial<OpposedTestResult.Data> = {},
        options: Partial<OpposedTestResult.Options> = {},
    ) {
        if (!data.sourceTestResult) {
            throw new Error("sourceTestResult must be provided");
        }
        if (!data.targetTestResult && !data.targetToken) {
            throw new Error(
                "Target token or targetTestResult must be provided",
            );
        }
        super(data, options);
        this.sourceTestResult = data.sourceTestResult;

        this.targetTestResult =
            data.targetTestResult ??
            new SuccessTestResult(
                {
                    token: data.targetToken ?? undefined,
                },
                options,
            );
        this.rollMode = data.rollMode || "roll";
        this.tieBreak =
            isOpposedTestResultTieBreak(data.tieBreak) ?
                data.tieBreak
            :   OPPOSED_TEST_RESULT_TIEBREAK.NONE;
        this.breakTies = !!data.breakTies;
    }

    /** Whether both sides reached the same normalized success level (and at least one succeeded — cf. {@link bothFail}). */
    get isTied(): boolean {
        if (!this.targetTestResult) return false;
        return (
            !this.bothFail &&
            this.sourceTestResult.normSuccessLevel ===
                this.targetTestResult.normSuccessLevel
        );
    }

    /** Whether neither side succeeded. */
    get bothFail(): boolean {
        return (
            !this.sourceTestResult?.isSuccess &&
            !this.targetTestResult?.isSuccess
        );
    }

    /** The active tie-break offset — {@link tieBreak} unless both sides failed, in which case `0`. */
    get tieBreakOffset(): number {
        return !this.bothFail ? this.tieBreak : 0;
    }

    /** Whether the source prevails — its normalized success level exceeds the target's (and not {@link bothFail}). */
    get sourceWins(): boolean {
        let result = false;
        if (
            typeof this.sourceTestResult === "object" &&
            typeof this.targetTestResult === "object"
        ) {
            result =
                !this.bothFail &&
                this.sourceTestResult.normSuccessLevel >
                    this.targetTestResult.normSuccessLevel;
        }
        return result;
    }

    /** Whether the target prevails — its normalized success level exceeds the source's (and not {@link bothFail}). */
    get targetWins(): boolean {
        let result = false;
        if (
            typeof this.sourceTestResult === "object" &&
            typeof this.targetTestResult === "object"
        ) {
            result =
                !this.bothFail &&
                this.sourceTestResult.normSuccessLevel <
                    this.targetTestResult.normSuccessLevel;
        }
        return result;
    }

    /**
     * Evaluate both sides of the contest; the winner is then derived on demand
     * from the two normalized success levels ({@link sourceWins} /
     * {@link targetWins} / {@link isTied}).
     *
     * @returns `false` if a test is missing or either side's evaluation is
     *   disallowed (e.g. a permission gate); otherwise `true`.
     */
    override async evaluate(): Promise<boolean> {
        if (this.sourceTestResult && this.targetTestResult) {
            let allowed = await super.evaluate();
            allowed &&= !!(await this.sourceTestResult.evaluate());
            allowed &&= !!(await this.targetTestResult.evaluate());
            return allowed;
        } else {
            return false;
        }
    }

    /**
     * Post the opposed-test request card
     * (`templates/chat/opposed-request-card.hbs`) via the source's speaker,
     * including both sides' rolls and a prompt for the target to respond.
     *
     * @param data - Extra template data merged into the card.
     */
    async toChat(data: PlainObject = {}): Promise<void> {
        const msgData: PlainObject = {
            template: "systems/sohl/templates/chat/opposed-request-card.hbs",
            title: "SOHL.OpposedTestResult.toChat.title",
            opposedTestResult: this,
            opposedTestResultJson: this.toJSON(),
            description: sohl.i18n.format(
                "SOHL.OpposedTestResult.toChat.description",
                {
                    targetActorName: this.targetTestResult.token?.name,
                },
            ),
        };

        msgData.rolls = [this.sourceTestResult.roll];
        if (this.targetTestResult) {
            msgData.rolls.push(this.targetTestResult.roll);
        }
        await this.sourceTestResult.toChat(msgData);
    }
}

export namespace OpposedTestResult {
    /** Registry key identifying this result kind for serialization. */
    export const Kind: string = "OpposedTestResult";

    /** Construction data for an {@link OpposedTestResult}. */
    export interface Data extends TestResult.Data {
        /** The initiating actor's success test. */
        sourceTestResult: SuccessTestResult;
        /** The responding actor's success test (or built from {@link targetToken}). */
        targetTestResult: SuccessTestResult;
        /** Foundry roll mode for chat output. */
        rollMode: string;
        /** The tie-break rule/offset (an {@link OPPOSED_TEST_RESULT_TIEBREAK} value). */
        tieBreak: number;
        /** Whether ties should be broken rather than reported as a tie. */
        breakTies: boolean;
        /** The target's token, used to build a target test when one isn't supplied. */
        targetToken: SohlTokenDocument | null;
    }

    export interface Options extends TestResult.Options {}

    /** Scope passed to actions that start or resume an opposed test. */
    export interface ContextScope {
        /** The opposed test being resumed, if any. */
        priorTestResult?: OpposedTestResult | null;
        /** Suppress chat output when set. */
        noChat?: boolean;
        /** The test type to run. */
        type?: TestType;
        /** Skip the pre-roll dialog when set. */
        skipDialog?: boolean;
        /** Override the result title. */
        title?: string;
        /** The contest's target token. */
        targetToken?: SohlTokenDocument;
        /** A situational modifier to apply to the source's test. */
        situationalModifier?: number;
        /** A pre-rolled source success test to reuse. */
        sourceSuccessTestResult?: SuccessTestResult;
    }
}
