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

import { SohlAction, SohlEvent } from "@common/event";
import { SohlLogic } from "@common/SohlLogic";
import { AsyncFunction } from "@utils";

export interface ScriptActionData extends SohlEvent.Data {
    script: string;
    isAsync: boolean;
}

const DISALLOWED_KEYWORDS = [
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

export class ScriptAction extends SohlAction {
    private script: string;
    private isAsync: boolean;

    constructor(
        parent: SohlLogic,
        data: Partial<ScriptActionData> = {},
        options: PlainObject = {},
    ) {
        super(parent, data, options);
        this.script = data.script || "return";
        ScriptAction.checkScriptSafety(this.script);
        this.isAsync = data.isAsync ?? true;
    }

    private static checkScriptSafety(script: string): void {
        const lowered = script.toLowerCase();
        for (const keyword of DISALLOWED_KEYWORDS) {
            const pattern = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "g");
            if (pattern.test(lowered)) {
                throw new Error(
                    `Disallowed keyword detected in script: ${keyword}`,
                );
            }
        }
    }

    setState(state: SohlEvent.State, context?: PlainObject): void {
        super.setState(state, context);

        if (state === SohlEvent.STATE.ACTIVATED) {
            this.execute(context);
            this.setState(SohlEvent.STATE.CREATED);
        }
    }

    executeSync(options: Partial<SohlAction.Context.Data>): any {
        const result = this.execute(options);
        return result instanceof Promise ? undefined : result;
    }

    async execute(
        options: Partial<SohlAction.Context.Data> = {},
    ): Promise<any> {
        const actionContext = new SohlAction.Context(options);
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
