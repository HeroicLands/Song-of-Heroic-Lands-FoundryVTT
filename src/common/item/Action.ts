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

import type { SohlActionContext } from "@common/SohlActionContext";
import {
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    ACTION_SUBTYPE,
    ActionSubType,
    ActionSubTypes,
    ITEM_KIND,
    SOHL_ACTION_ROLE,
    SOHL_ACTION_SCOPE,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    SohlActionScopes,
    SohlContextMenuSortGroups,
} from "@utils/constants";
import { SohlLogic } from "@common/SohlLogic";
import { textToFunction } from "@utils/helpers";
const { StringField, BooleanField, SchemaField, NumberField, DocumentIdField } =
    foundry.data.fields;

export type ActionTriggerFn = (doc?: SohlDocument) => boolean;
export type ActionVisibilityFn = (element: HTMLElement) => boolean;
export type ActionExecutorFn = (context: SohlActionContext) => Promise<unknown>;

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
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
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
    override evaluate(context: SohlActionContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface ActionData<
    TLogic extends ActionLogic<ActionData> = ActionLogic<any>,
> extends SohlItemData<TLogic> {
    subType: ActionSubType;
    title: string;
    isAsync: boolean;
    scope: string;
    executor: string;
    trigger: string;
    visible: string;
    iconFAClass: string;
    group: string;
    permissions: {
        execute: number;
    };
}

function defineEventSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: ActionSubTypes,
            required: true,
        }),
        title: new StringField({ initial: "" }),
        isAsync: new BooleanField({ initial: false }),
        scope: new StringField({
            choices: SohlActionScopes,
            required: true,
            initial: SOHL_ACTION_SCOPE.SELF,
        }),
        executor: new StringField({ initial: "" }),
        trigger: new StringField({ initial: "" }),
        visible: new StringField({ initial: "true" }),
        iconFAClass: new StringField({
            initial: "fas fa-question-circle",
        }),
        group: new StringField({
            choices: SohlContextMenuSortGroups,
            initial: SOHL_CONTEXT_MENU_SORT_GROUP.DEFAULT,
        }),
        permissions: new SchemaField({
            execute: new NumberField({
                min: SOHL_ACTION_ROLE.NONE,
                max: SOHL_ACTION_ROLE.GAMEMASTER,
                initial: SOHL_ACTION_ROLE.OWNER,
            }),
        }),
    };
}

type ActionDataSchema = ReturnType<typeof defineEventSchema>;

export class ActionDataModel<
        TSchema extends foundry.data.fields.DataSchema = ActionDataSchema,
        TLogic extends ActionLogic<ActionData> = ActionLogic<ActionData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements ActionData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["Action"];
    static override readonly kind = ITEM_KIND.ACTION;
    subType!: ActionSubType;
    title!: string;
    isAsync!: boolean;
    scope!: string;
    executor!: string;
    trigger!: string;
    visible!: string;
    iconFAClass!: string;
    group!: string;
    permissions!: {
        execute: number;
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineEventSchema();
    }

    prepareBaseData(): void {
        super.prepareBaseData();
        // If title is blank, default it to the item name
        this.title ||= this.item.name;
    }
}

export class ActionSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/occurrence.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
