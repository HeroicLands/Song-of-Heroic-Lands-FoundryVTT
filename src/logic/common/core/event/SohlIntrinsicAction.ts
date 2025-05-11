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
import { SohlAction } from "@logic/common/core/event";
import { RegisterClass, DataField, CollectionType } from "@utils";

export type SohlIntrinsicActionMap = SohlMap<string, SohlIntrinsicAction>;

@RegisterClass("SohlIntrinsicAction", "0.6.0")
export class SohlIntrinsicAction extends SohlAction {
    @DataField("functionName", {
        type: String,
        required: true,
    })
    private functionName!: string;

    @DataField("action", {
        type: String,
        collection: CollectionType.SET,
    })
    action!: Set<string>;

    /** @override */
    execute(...scope: any[]): Promise<any | undefined> | any | undefined {
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
