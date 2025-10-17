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
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import type { SohlEventContext } from "@common/event/SohlEventContext";
import { ITEM_KIND } from "@utils/constants";
const { StringField } = foundry.data.fields;

export class BodyZone<TData extends BodyZone.Data = BodyZone.Data>
    extends SohlItem.BaseLogic<TData>
    implements BodyZone.Logic<TData>
{
    get bodyParts(): SohlItem[] {
        return this.actor?.allItemTypes.bodypart || [];
    }

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

export namespace BodyZone {
    export const Kind = ITEM_KIND.BODYZONE;

    export interface Logic<
        TData extends BodyZone.Data<any> = BodyZone.Data<any>,
    > extends SohlItem.Logic<TData> {}

    export interface Data<
        TLogic extends BodyZone.Logic<Data> = BodyZone.Logic<any>,
    > extends SohlItem.Data<TLogic> {
        abbrev: string;
    }
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
            BodyZone.Logic<BodyZone.Data> = BodyZone.Logic<BodyZone.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements BodyZone.Data<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["BodyZone"];
    static override readonly kind = BodyZone.Kind;
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
