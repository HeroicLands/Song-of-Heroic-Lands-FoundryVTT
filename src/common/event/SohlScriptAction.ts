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

import { SOHL_EVENT_STATE, SohlEventState } from "@utils/constants";
import { AsyncFunction } from "@utils/helpers";
import { SohlAction } from "@common/event/SohlAction";
import type { SohlLogic } from "@common/SohlLogic";

export class SohlScriptAction extends SohlAction {
    private script: string;
    private isAsync: boolean;

    constructor(
        parent: SohlLogic,
        data: Partial<SohlScriptAction.Data> = {},
        options: PlainObject = {},
    ) {
        super(parent, data, options);
        this.script = data.script || "return";
        SohlScriptAction.checkScriptSafety(this.script);
        this.isAsync = data.isAsync ?? true;
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

    setState(
        state: SohlEventState,
        context: Partial<SohlAction.Context>,
    ): void {
        super.setState(state, context);

        if (state === SOHL_EVENT_STATE.ACTIVATED) {
            this.execute(context);
            this.setState(SOHL_EVENT_STATE.CREATED, context);
        }
    }

    executeSync(actionContext: Partial<SohlAction.Context>): Optional<unknown> {
        const result = this.execute(actionContext);
        return result instanceof Promise ? undefined : result;
    }

    async execute(
        actionContext: Partial<SohlAction.Context>,
    ): Promise<Optional<unknown>> {
        const args = ["context", `"use strict";\n${this.script}`];

        const fn =
            this.isAsync ? new AsyncFunction(...args) : new Function(...args);
        try {
            return fn.call(this, actionContext);
        } catch (error: any) {
            sohl.log.error("ScriptAction execution failed:", { error });
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
