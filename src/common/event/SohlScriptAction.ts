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

import { SOHL_ACTION_SCOPE } from "@utils/constants";
import { AsyncFunction } from "@utils/helpers";
import { SohlAction } from "@common/event/SohlAction";
import type { SohlLogic } from "@common/SohlLogic";

export class SohlScriptAction extends SohlAction {
    private script: string;

    constructor(
        data: Partial<SohlScriptAction.Data> = {},
        options: PlainObject = {},
    ) {
        super(data, options);
        this.script = data.script || "return";
    }

    protected override getFunction(): Function {
        SohlScriptAction.checkScriptSafety(this.script);
        const args = ["context", `"use strict";\n${this.script}`];
        const func =
            this.isAsync ? new AsyncFunction(...args) : new Function(...args);
        let target: SohlLogic | undefined;
        switch (this.scope) {
            case SOHL_ACTION_SCOPE.SELF:
                target = this.parent;
                break;

            case SOHL_ACTION_SCOPE.ITEM:
                target = this.parent?.item?.logic as SohlLogic;
                break;

            case SOHL_ACTION_SCOPE.ACTOR:
                target = this.parent?.item?.actor?.logic as SohlLogic;
                break;
            default:
                throw new Error(`Unknown action scope: ${this.scope}`);
        }
        if (!target) {
            throw new Error(
                `This action is scoped to ${this.scope}, but the target does not exist.`,
            );
        }

        return func.bind(target);
    }

    private static checkScriptSafety(script: string): void {
        const lowered = script.toLowerCase();
        for (const keyword of SohlScriptAction.DISALLOWED_KEYWORDS) {
            const pattern = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "g");
            if (pattern.test(lowered)) {
                throw new Error(
                    `Disallowed keyword detected in script: ${keyword}`,
                );
            }
        }
    }
}

export namespace SohlScriptAction {
    export interface Data extends SohlAction.Data {
        script: string;
        isAsync: boolean;
    }

    export const DISALLOWED_KEYWORDS = [
        "window",
        "document",
        "globalThis",
        "Function",
        "eval",
        "new Function",
        "XMLHttpRequest",
        "fetch",
        "require",
        "import",
        "setTimeout",
        "setInterval",
    ] as const;
}
