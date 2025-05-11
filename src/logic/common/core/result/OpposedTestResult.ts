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

import { ChatMessageRollMode, isChatMessageRollMode } from "@foundry/core";
import { SohlPerformer } from "@logic/common/core";
import { SuccessTestResult, TestResult } from "@logic/common/core/result";
import { DataField, RegisterClass } from "@utils";

export const TieBreak: StrictObject<number> = {
    SOURCE: 1,
    NONE: 0,
    TARGET: -1,
};
export type TieBreak = (typeof TieBreak)[keyof typeof TieBreak];
export function isTieBreak(value: any): value is TieBreak {
    return Object.values(TieBreak).includes(value);
}

@RegisterClass("OpposedTestResult", "0.6.0")
export class OpposedTestResult extends TestResult {
    @DataField("sourceTestResult", { type: SuccessTestResult, required: true })
    sourceTestResult!: SuccessTestResult;

    @DataField("targetTestResult", { type: SuccessTestResult, required: true })
    targetTestResult!: SuccessTestResult;

    @DataField("rollMode", {
        type: String,
        initial: ChatMessageRollMode.SYSTEM,
        validator: isChatMessageRollMode,
    })
    rollMode!: string;

    @DataField("tieBreak", {
        type: Number,
        initial: TieBreak.NONE,
        validator: isTieBreak,
    })
    tieBreak!: number;

    @DataField("breakTies", { type: Boolean, initial: false })
    breakTies!: boolean;

    constructor(
        parent: SohlPerformer,
        data: PlainObject = {},
        options: PlainObject = {},
    ) {
        if (!data.sourceTestResult) {
            throw new Error("sourceTestResult must be provided");
        }
        if (!data.targetToken) {
            throw new Error("Target token must be provided");
        }
        super(parent, data, options);
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
            variant: sohl.game.id,
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
