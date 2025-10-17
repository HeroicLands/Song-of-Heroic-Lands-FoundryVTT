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

import type { SohlEventContext } from "@common/event/SohlEventContext";
import {
    SohlItem,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    ITEM_KIND,
    MysticalDeviceSubType,
    MysticalDeviceSubTypes,
} from "@utils/constants";

const { NumberField, StringField, BooleanField, SchemaField } =
    foundry.data.fields;

export class MysticalDevice<
        TData extends MysticalDevice.Data = MysticalDevice.Data,
    >
    extends SohlItem.BaseLogic<TData>
    implements MysticalDevice.Logic<TData>
{
    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace MysticalDevice {
    export const Kind = ITEM_KIND.MYSTICALDEVICE;

    export interface Logic<
        TData extends MysticalDevice.Data = MysticalDevice.Data,
    > extends SohlItem.Logic<TData> {}

    export interface Data<
        TLogic extends MysticalDevice.Logic<Data> = MysticalDevice.Logic<any>,
    > extends SohlItem.Data<TLogic> {
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
            MysticalDevice.Logic<MysticalDevice.Data> = MysticalDevice.Logic<MysticalDevice.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements MysticalDevice.Data<TLogic>
{
    static readonly LOCALIZATION_PREFIXES = ["MysticalDevice"];
    static readonly kind = MysticalDevice.Kind;
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
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/affliction.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
