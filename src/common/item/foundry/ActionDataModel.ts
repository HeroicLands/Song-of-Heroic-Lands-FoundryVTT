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

import { SohlItemDataModel } from "@common/item/foundry/SohlItem";
import { ActionLogic, ActionData } from "@common/item/logic/ActionLogic";
import {
    ActionSubType,
    ActionSubTypes,
    ITEM_KIND,
    SOHL_ACTION_ROLE,
    SOHL_ACTION_SCOPE,
    SohlActionScopes,
    SOHL_CONTEXT_MENU_SORT_GROUP,
    SohlContextMenuSortGroups,
} from "@utils/constants";
const { StringField, BooleanField, SchemaField, NumberField } =
    foundry.data.fields;

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
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.Action",
        "SOHL.Item",
    ];
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
