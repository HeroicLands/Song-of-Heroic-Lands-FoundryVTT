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

import { SohlAction } from "@common/event/SohlAction";
import { SuccessTestResult } from "@common/result/SuccessTestResult";
import { TestResult } from "@common/result/TestResult";
import { SohlTokenDocument } from "@common/token/SohlTokenDocument";
import {
    isOpposedTestResultTieBreak,
    OPPOSED_TEST_RESULT_TIEBREAK,
} from "@utils/constants";

export class OpposedTestResult extends TestResult {
    sourceTestResult!: SuccessTestResult;
    targetTestResult!: SuccessTestResult;
    rollMode!: string;
    tieBreak!: number;
    breakTies!: boolean;

    constructor(data: PlainObject = {}, options: PlainObject = {}) {
        if (!data.sourceTestResult) {
            throw new Error("sourceTestResult must be provided");
        }
        if (!data.targetTestResult && !data.targetTokenUuid) {
            throw new Error(
                "Target token UUID must be provided unless targetTestResult is given",
            );
        }
        super(data, options);
        this.sourceTestResult = new SuccessTestResult(
            data.sourceTestResult,
            options,
        );

        const tokenDoc = fromUuidSync(data.targetTokenUuid);
        if (!(tokenDoc instanceof SohlTokenDocument)) {
            throw new Error("Invalid target token UUID provided");
        }
        this.targetTestResult = new SuccessTestResult(
            data.targetTestResult ?? {
                token: tokenDoc,
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
        void data;
        const msgData: PlainObject = {
            variant: sohl.id,
            template: "systems/sohl/templates/chat/opposed-request-card.html",
            title: "SOHL.OpposedTestResult.toChat.title",
            opposedTestResult: this,
            opposedTestResultJson: this.toJSON(),
            description: sohl.i18n.format(
                "SOHL.OpposedTestResult.toChat.description",
                {
                    targetActorName: this.targetTestResult.token.name,
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
    export interface Data extends TestResult.Data {
        sourceTestResult: SuccessTestResult;
        targetTestResult: SuccessTestResult;
        rollMode: string;
        tieBreak: number;
        breakTies: boolean;
        targetTokenUuid: string | null;
    }

    export interface Options extends TestResult.Options {}

    export class Context extends SohlAction.Context {
        priorTestResult?: OpposedTestResult;

        constructor(data: Partial<OpposedTestResult.Context.Data> = {}) {
            if (!data.priorTestResult) {
                throw new Error("priorTestResult must be provided");
            }

            super(data);
            this.priorTestResult =
                OpposedTestResult.isA(data.priorTestResult) ?
                    data.priorTestResult
                :   new OpposedTestResult(data.priorTestResult);
        }

        /** @inheritdoc */
        toJSON(): Record<string, unknown> {
            return {
                ...super.toJSON(),
                priorTestResult: this.priorTestResult?.toJSON() || null,
            };
        }
    }

    export namespace Context {
        export interface Data extends SohlAction.Context.Data {
            priorTestResult: Nullable<OpposedTestResult>;
        }
    }
}
