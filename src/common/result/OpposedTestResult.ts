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

import { SohlEventContext } from "@common/event/SohlEventContext";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
import { TestResult } from "@common/result/TestResult";
import { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import {
    isOpposedTestResultTieBreak,
    OPPOSED_TEST_RESULT_TIEBREAK,
    TestType,
} from "@utils/constants";

export class OpposedTestResult extends TestResult {
    sourceTestResult!: SuccessTestResult;
    targetTestResult!: SuccessTestResult;
    rollMode!: string;
    tieBreak!: number;
    breakTies!: boolean;

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

    get isTied(): boolean {
        if (!this.targetTestResult) return false;
        return (
            !this.bothFail &&
            this.sourceTestResult.normSuccessLevel ===
                this.targetTestResult.normSuccessLevel
        );
    }

    get bothFail(): boolean {
        return (
            !this.sourceTestResult?.isSuccess &&
            !this.targetTestResult?.isSuccess
        );
    }

    get tieBreakOffset(): number {
        return !this.bothFail ? this.tieBreak : 0;
    }

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

    async evaluate(): Promise<boolean> {
        if (this.sourceTestResult && this.targetTestResult) {
            let allowed = await super.evaluate();
            allowed &&= !!(await this.sourceTestResult.evaluate());
            allowed &&= !!(await this.targetTestResult.evaluate());
            return allowed;
        } else {
            return false;
        }
    }

    async toChat(data: PlainObject = {}): Promise<void> {
        const msgData: PlainObject = {
            variant: sohl.id,
            template: "systems/sohl/templates/chat/opposed-request-card.html",
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
    export const Kind: string = "OpposedTestResult";

    export interface Data extends TestResult.Data {
        sourceTestResult: SuccessTestResult;
        targetTestResult: SuccessTestResult;
        rollMode: string;
        tieBreak: number;
        breakTies: boolean;
        targetToken: SohlTokenDocument | null;
    }

    export interface Options extends TestResult.Options {}

    export interface ContextScope {
        priorTestResult?: OpposedTestResult | null;
        noChat?: boolean;
        type?: TestType;
        skipDialog?: boolean;
        title?: string;
        targetToken?: SohlTokenDocument;
        situationalModifier?: number;
        sourceSuccessTestResult?: SuccessTestResult;
    }
}
