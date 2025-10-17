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
import { ITEM_KIND } from "@utils/constants";
const { BooleanField, StringField, DocumentIdField } = foundry.data.fields;

export class BodyPart<TData extends BodyPart.Data = BodyPart.Data>
    extends SohlItem.BaseLogic<TData>
    implements BodyPart.Logic<TData>
{
    get bodyLocations(): SohlItem[] {
        return this.actor?.allItemTypes.bodylocation || [];
    }

    get heldItem(): SohlItem | null {
        return (
            (this.data.heldItemId &&
                this.item?.actor?.allItems.get(this.data.heldItemId)) ||
            null
        );
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

export namespace BodyPart {
    export const Kind = ITEM_KIND.BODYPART;

    export interface Logic<
        TData extends BodyPart.Data<any> = BodyPart.Data<any>,
    > extends SohlItem.Logic<TData> {}

    export interface Data<
        TLogic extends BodyPart.Logic<Data> = BodyPart.Logic<any>,
    > extends SohlItem.Data<TLogic> {
        abbrev: string;
        canHoldItem: boolean;
        heldItemId: string | null;
    }
}

function defineBodyPartDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        abbrev: new StringField(),
        canHoldItem: new BooleanField({ initial: false }),
        heldItemId: new DocumentIdField({ nullable: true }),
    };
}

type BodyPartDataSchema = ReturnType<typeof defineBodyPartDataSchema>;

export class BodyPartDataModel<
        TSchema extends foundry.data.fields.DataSchema = BodyPartDataSchema,
        TLogic extends
            BodyPart.Logic<BodyPart.Data> = BodyPart.Logic<BodyPart.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements BodyPart.Data<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["BodyPart"];
    static override readonly kind = BodyPart.Kind;
    abbrev!: string;
    canHoldItem!: boolean;
    heldItemId!: string | null;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBodyPartDataSchema();
    }
}

export class BodyPartSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/bodypart.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
