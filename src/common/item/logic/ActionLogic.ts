/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2026 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { SohlActionContext } from "@common/SohlActionContext";
import {
    SohlItemBaseLogic,
    SohlItemData,
} from "@common/item/foundry/SohlItem";
import {
    ACTION_SUBTYPE,
    ActionSubType,
    ITEM_METADATA,
    SOHL_ACTION_SCOPE,
} from "@utils/constants";
import { SohlLogic } from "@common/SohlLogic";
import { textToFunction } from "@utils/helpers";

export type ActionTriggerFn = (doc?: SohlDocument) => boolean;
export type ActionVisibilityFn = (element: HTMLElement) => boolean;
export type ActionExecutorFn = (context: SohlActionContext) => Promise<unknown>;

/**
 * Logic for the **Action** item type — an executable procedure attached to
 * a document.
 *
 * Actions represent anything a character or item can *do*: performing a skill
 * test, making an attack, activating a mystical ability, using an item, or
 * triggering a custom script. They appear as clickable entries in context menus
 * and chat cards.
 *
 * There are two subtypes:
 * - **Intrinsic actions** — Built-in actions defined by Logic classes (e.g.,
 *   `attackTest` on a StrikeMode, `healingTest` on an Injury). These call
 *   a named method on the target logic.
 * - **Custom actions** — User-defined actions with arbitrary executor code.
 *
 * Each action has:
 * - An **executor** function that performs the action
 * - A **trigger** predicate that determines when the action is available
 * - A **visible** flag/function controlling UI display
 * - A **scope** (SELF, ITEM, or ACTOR) determining which logic object
 *   the executor runs against
 *
 * During initialization, the Action resolves its executor, trigger, and
 * visibility from stored string representations into callable functions,
 * and binds them to the appropriate target logic based on scope.
 *
 * @typeParam TData - The Action data interface.
 */
export class ActionLogic<
    TData extends ActionData = ActionData,
> extends SohlItemBaseLogic<TData> {
    executor!: ActionExecutorFn;
    trigger!: ActionTriggerFn;
    visible!: boolean | ActionVisibilityFn;

    /**
     * Executes the action synchronously.
     *
     * @param actionContext - The context in which to execute the action, including any additional data.
     * @returns The result of the function call.
     * @throws If execution returns a Thenable (e.g., Promise), which is unsupported.
     * @see {@link Action.execute} for the asynchronous version of this method.
     */
    executeSync(actionContext: SohlActionContext): unknown {
        if (this.data.isAsync) {
            throw new Error(
                "Synchronous execution is not supported for this action.",
            );
        }
        const r = this.execute(actionContext);
        if (r && typeof (r as any).then === "function") {
            throw new Error(
                "Thenable returned when synchronous execution expected.",
            );
        }
        return r;
    }

    /**
     * Executes the intrinsic action asynchronously.
     *
     * @param actionContext - The context in which to execute the action, including any additional data.
     * @returns The result of the function call coerced as a Promise.
     * @see {@link Action.executeSync} for the synchronous version of this method.
     */
    async execute(actionContext: SohlActionContext): Promise<unknown> {
        return Promise.resolve(this.executor(actionContext));
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        if (this.data?.visible === "true") {
            this.visible = (element: HTMLElement) => true;
        }

        this.trigger = textToFunction(this.data.trigger ?? "", ["doc"], {
            isAsync: this.data?.isAsync,
        }) as (doc: SohlDocument) => boolean;
        if (this.data?.executor) {
            let target: SohlLogic | undefined;
            let func: Function;

            switch (this.data.scope) {
                case SOHL_ACTION_SCOPE.SELF:
                    target = this;
                    break;

                case SOHL_ACTION_SCOPE.ITEM:
                    target = this.parent?.item?.logic as SohlLogic;
                    break;

                case SOHL_ACTION_SCOPE.ACTOR:
                    target = this.parent?.item?.actor?.logic as SohlLogic;
                    break;
                default:
                    throw new Error(`Unknown action scope: ${this.data.scope}`);
            }

            if (this.data?.subType === ACTION_SUBTYPE.INTRINSIC_ACTION) {
                func = (target as any)?.[this.data.executor ?? ""];
                if (!func || typeof func !== "function") {
                    throw new Error(
                        `The target of this action does not have a function named "${this.data.executor ?? ""}".`,
                    );
                }

                this.executor = func.bind(target);
            } else {
                func = textToFunction(this.data.executor ?? "", ["context"], {
                    isAsync: this.data?.isAsync,
                });
                this.executor = func.bind(target);
            }
        } else {
            this.executor = (ctx: SohlActionContext) => Promise.resolve();
        }
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface ActionData<
    TLogic extends ActionLogic<ActionData> = ActionLogic<any>,
> extends SohlItemData<TLogic> {
    /** Whether this is an intrinsic or custom action */
    subType: ActionSubType;

    /** Display title for this action */
    title: string;

    /** Whether this action executes asynchronously */
    isAsync: boolean;

    /** Execution context: Self, Parent Item, or Owning Actor */
    scope: string;

    /** Function name or code that performs the action */
    executor: string;

    /** Predicate determining when this action is available */
    trigger: string;

    /** Controls whether this action appears in the UI */
    visible: string;

    /** FontAwesome CSS class for the action's icon */
    iconFAClass: string;

    /** Context menu group for sorting this action */
    group: string;

    /** Access control settings for this action */
    permissions: {
        execute: number;
    };
}
