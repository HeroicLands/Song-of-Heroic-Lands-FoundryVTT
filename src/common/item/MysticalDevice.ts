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
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    ITEM_KIND,
    ITEM_METADATA,
    MysticalDeviceSubType,
    MysticalDeviceSubTypes,
} from "@utils/constants";

const { NumberField, StringField, BooleanField, SchemaField } =
    foundry.data.fields;

export class MysticalDeviceLogic<
    TData extends MysticalDeviceData = MysticalDeviceData,
> extends SohlItemBaseLogic<TData> {
    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
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

export interface MysticalDeviceData<
    TLogic extends
        MysticalDeviceLogic<MysticalDeviceData> = MysticalDeviceLogic<any>,
> extends SohlItemData<TLogic> {
    requiresAttunement: boolean;
    usesVolition: boolean;
    domain: {
        philosophy: string;
        name: string;
    };
    isAttuned: boolean;
    volition: {
        ego: number;
        morality: number;
        purpose: string;
    };
}

function defineMysticalDeviceSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: MysticalDeviceSubTypes,
            required: true,
        }),
        requiresAttunement: new BooleanField({ initial: false }),
        usesVolition: new BooleanField({ initial: false }),
        domain: new SchemaField({
            philosophy: new StringField(),
            name: new StringField(),
        }),
        isAttuned: new BooleanField({ initial: false }),
        volition: new SchemaField({
            ego: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            morality: new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            }),
            purpose: new StringField(),
        }),
    };
}

type MysticalDeviceDataSchema = ReturnType<typeof defineMysticalDeviceSchema>;

export class MysticalDeviceDataModel<
        TSchema extends
            foundry.data.fields.DataSchema = MysticalDeviceDataSchema,
        TLogic extends
            MysticalDeviceLogic<MysticalDeviceData> = MysticalDeviceLogic<MysticalDeviceData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements MysticalDeviceData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = [
        "SOHL.MysticalDevice.DATA",
    ];
    static override readonly kind = ITEM_KIND.MYSTICALDEVICE;
    subType!: MysticalDeviceSubType;
    requiresAttunement!: boolean;
    usesVolition!: boolean;
    domain!: {
        philosophy: string;
        name: string;
    };
    isAttuned!: boolean;
    volition!: {
        ego: number;
        morality: number;
        purpose: string;
    };

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineMysticalDeviceSchema();
    }
}

export class MysticalDeviceSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
