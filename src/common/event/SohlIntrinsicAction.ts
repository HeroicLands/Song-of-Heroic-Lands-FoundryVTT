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

import { SohlAction, SohlActionData } from "@common/event";
import { SohlPerformer } from "@common";

export class SohlIntrinsicAction extends SohlAction {
    private intrinsicFunction: Function;

    constructor(
        parent: SohlPerformer,
        data: Partial<SohlActionData> = {},
        options: PlainObject = {},
    ) {
        super(parent, data, options);
        let functionName: string = data?.functionName || "";
        const fnTable: StrictObject<Function> =
            parent as unknown as StrictObject<Function>;
        if (!Object.hasOwn(fnTable, functionName)) {
            throw new Error(
                `The function name "${functionName}" is not defined on the parent performer.`,
            );
        }
        this.intrinsicFunction = fnTable[functionName];
    }

    override execute(
        scope: {
            element?: HTMLElement;
            async?: boolean;
            [key: string]: any;
        } = { async: true },
    ): Promise<Optional<any>> | Optional<any> {
        scope.actionName = this.name;
        scope.self = this;

        let result: any = this.intrinsicFunction.call(this.parent, scope);
        if (scope.async) {
            // Result should always be a Promise
            return result instanceof Promise ? result : Promise.resolve(result);
        } else {
            // If result is a Promise, return undefined (since a synchronous function
            // can't do anything with a Promise), otherwise return the result directly
            return result instanceof Promise ? undefined : result;
        }
    }
}
