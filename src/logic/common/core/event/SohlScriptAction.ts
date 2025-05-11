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

import { SohlMap } from "@utils";
import {
    SohlAction,
    SohlEventData,
    SohlEventState,
} from "@logic/common/core/event";
import { DataField, RegisterClass } from "@utils";
import { SohlPerformer } from "../SohlPerformer";

export type ScriptActionMap = SohlMap<string, ScriptAction>;

export interface ScriptActionData extends SohlEventData {
    script: string;
    isAsync: boolean;
}

export class ScriptAction extends SohlAction {
    private script: string;
    private isAsync: boolean;

    constructor(
        parent: SohlPerformer,
        data: Partial<ScriptActionData> = {},
        options: PlainObject = {},
    ) {
        super(parent, data, options);
        this.script = data.script || "return";
        this.isAsync = data.isAsync ?? true;
    }

    setState(state: SohlEventState, context?: PlainObject): void {
        super.setState(state, context);

        if (state === SohlEventState.ACTIVATED) {
            this.execute(context);
            this.setState(SohlEventState.CREATED);
        }
    }

    /** @override */
    execute(options?: {
        element?: HTMLElement;
        [key: string]: any;
    }): Promise<any> | any {
        const { element, ...scope } = options ?? {};

        let typeActionHandler =
            CONFIG.SOHL[this.parent.documentName]?.macros[this.parent.type];
        let action = this.actions.find(
            (a) => a.name === actionName || a.functionName === actionName,
        );
        if (action || typeActionHandler) {
            let useAsync = action?.useAsync ?? !!typeActionHandler?.useAsync;
            scope.actionName = actionName;
            scope.self = this;
            scope.inPrepareData = inPrepareData;

            let result;
            if (typeActionHandler) result = typeActionHandler.execute(scope);
            // If the action exists on this item, then process the action
            if (action) {
                if (useAsync) {
                    if (action.useAsync)
                        Promise.resolve(result).then((newResult) => {
                            // If the return from the Type Action Handler is boolean false (not falsy,
                            // but specifically false), then abandon all further processing, and return
                            // false (meaning all ancestors should stop further processing).
                            if (newResult === false) return false;

                            // Otherwise add the return value as the "priorResult" key in the scope,
                            // and execute the local action, returning the result.
                            scope.priorResult = newResult;

                            // This is going to return a promise
                            return action.execute(scope);
                        });
                } else {
                    // If the return from the Type Action Handler is boolean false (not falsy,
                    // but specifically false), then abandon all further processing, and return
                    // false (meaning all ancestors should stop further processing).
                    if (result === false) return false;

                    // Otherwise add the return value as the "priorResult" key in the scope,
                    // and execute the local action, returning the result.
                    scope.priorResult = result;

                    // This is going to return a direct value, not a promise.
                    return action.execute(scope);
                }
            }

            return result;
        }

        return;
    }
}
