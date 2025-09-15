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
import {
    SOHL_ACTION_ROLE,
    SOHL_ACTION_SCOPE,
    SOHL_EVENT_STATE,
} from "@utils/constants";
import type { SohlContextMenu } from "@utils/SohlContextMenu";

export class SohlIntrinsicAction extends SohlAction {
    private functionName: string;

    constructor(
        data: Partial<SohlIntrinsicAction.Data> = {},
        options: PlainObject = {},
    ) {
        super(data, options);
        this.functionName = data?.functionName || "";
    }

    protected override getFunction(): Function {
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

        const func: Function = (target as any)?.[this.functionName];
        if (!func || typeof func !== "function") {
            throw new Error(
                `The target of this action does not have a function named "${this.functionName}".`,
            );
        }

        return func.bind(target);
    }

    static createFromContextMenuEntryContext(
        parent: SohlLogic,
        data: SohlContextMenu.EntryContext,
    ): SohlIntrinsicAction {
        return new SohlIntrinsicAction(
            {
                title: data.name,
                scope: SOHL_ACTION_SCOPE.SELF,
                state: SOHL_EVENT_STATE.CREATED,
                initiation: {
                    delay: 0,
                },
                activation: {
                    delay: 0,
                    manualTrigger: true,
                },
                expiration: {
                    duration: 0,
                },
                notes: "",
                description: "",
                contextIconClass: data.iconFAClass,
                contextCondition: data.condition,
                contextGroup: data.group as string,
                isAsync: false,
                permissions: {
                    execute: SOHL_ACTION_ROLE.OWNER,
                },
                functionName: data.functionName,
            },
            { parent },
        );
    }
}

export namespace SohlIntrinsicAction {
    export interface Data extends SohlAction.Data {
        functionName: string;
    }
}
