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

import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import type { SohlActionContext } from "@common/SohlActionContext";
import { ITEM_KIND } from "@utils/constants";
const { StringField } = foundry.data.fields;

export class BodyZoneLogic<
    TData extends BodyZoneData = BodyZoneData,
> extends SohlItemBaseLogic<TData> {
    get bodyParts(): SohlItem[] {
        return this.actor?.allItemTypes.bodypart || [];
    }

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

export interface BodyZoneData<
    TLogic extends BodyZoneLogic<BodyZoneData> = BodyZoneLogic<any>,
> extends SohlItemData<TLogic> {
    abbrev: string;
}

function defineBodyZoneDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        abbrev: new StringField(),
    };
}

type BodyZoneDataSchema = ReturnType<typeof defineBodyZoneDataSchema>;

export class BodyZoneDataModel<
        TSchema extends foundry.data.fields.DataSchema = BodyZoneDataSchema,
        TLogic extends
            BodyZoneLogic<BodyZoneData> = BodyZoneLogic<BodyZoneData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements BodyZoneData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["BodyZone"];
    static override readonly kind = ITEM_KIND.BODYZONE;
    abbrev!: string;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBodyZoneDataSchema();
    }
}

export class BodyZoneSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/bodyzone.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
