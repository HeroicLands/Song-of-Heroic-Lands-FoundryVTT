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
import type { SohlLogic } from "@common/SohlLogic";
import { SohlContextMenu } from "@utils/SohlContextMenu";

export class SohlIntrinsicAction<
    TParent extends SohlLogic = SohlLogic,
> extends SohlAction<TParent> {
    private intrinsicFunction: Function;

    constructor(
        parent: TParent,
        data: Partial<SohlIntrinsicAction.Data> = {},
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

    override executeSync(
        scope: {
            element?: HTMLElement;
            [key: string]: any;
        } = {},
    ): Optional<unknown> {
        scope.async = false;
        scope.actionName = this.label;
        scope.self = this;
        const result = this.intrinsicFunction.call(this.parent, scope);
        if (result instanceof Promise) return undefined;
        return result;
    }

    override async execute(
        scope: {
            element?: HTMLElement;
            [key: string]: any;
        } = {},
    ): Promise<Optional<unknown>> {
        scope.async = true;
        scope.actionName = this.label;
        scope.self = this;

        return Promise.resolve(this.intrinsicFunction.call(this.parent, scope));
    }

    static createFromContextMenuData(
        parent: SohlLogic,
        data: SohlContextMenu.EntryContext,
    ): SohlIntrinsicAction {
        const functionName = data.id;
        return new SohlIntrinsicAction(parent, {
            functionName,
        });
    }
}

export namespace SohlIntrinsicAction {
    export interface Data extends SohlAction.Data {
        functionName: string;
    }
}
