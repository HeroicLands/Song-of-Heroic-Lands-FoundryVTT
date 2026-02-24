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
import { ValueModifier } from "@common/modifier/ValueModifier";
import { ImpactAspects, ITEM_KIND, ITEM_METADATA } from "@utils/constants";
const { BooleanField, StringField } = foundry.data.fields;

export class BodyLocationLogic<
    TData extends BodyLocationData = BodyLocationData,
> extends SohlItemBaseLogic<TData> {
    protection!: StrictObject<ValueModifier>;
    layersList!: string[];
    traits!: PlainObject;

    get layers(): string {
        return this.layersList.join(", ");
    }

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
        super.initialize(context);
        this.protection = Object.fromEntries(
            ImpactAspects.map((aspect) => {
                const modifier = new sohl.ValueModifier({}, { parent: this });
                return [aspect, modifier];
            }),
        ) as StrictObject<ValueModifier>;
        this.layersList = [];
        this.traits = {
            isRigid: false,
        };
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

export interface BodyLocationData<
    TLogic extends BodyLocationLogic<any> = BodyLocationLogic<any>,
> extends SohlItemData<TLogic> {
    shortcode: string;
    isFumble: boolean;
    isStumble: boolean;
}

function defineBodyLocationDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        isFumble: new BooleanField({ initial: false }),
        isStumble: new BooleanField({ initial: false }),
    };
}

type BodyLocationDataSchema = ReturnType<typeof defineBodyLocationDataSchema>;

export class BodyLocationDataModel<
    TSchema extends foundry.data.fields.DataSchema = BodyLocationDataSchema,
    TLogic extends
        BodyLocationLogic<BodyLocationData> = BodyLocationLogic<BodyLocationData>,
> extends SohlItemDataModel<TSchema, TLogic> {
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.BodyLocation.DATA"];
    static override readonly kind = ITEM_KIND.BODYLOCATION;
    isFumble!: boolean;
    isStumble!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBodyLocationDataSchema();
    }
}

export class BodyLocationSheet extends SohlItemSheetBase {
    protected override async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
