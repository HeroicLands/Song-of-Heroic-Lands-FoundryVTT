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
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import { ITEM_KIND } from "@utils/constants";
const { BooleanField, StringField, DocumentIdField } = foundry.data.fields;

export class BodyPartLogic<
    TData extends BodyPartData = BodyPartData,
> extends SohlItemBaseLogic<TData> {
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

export interface BodyPartData<
    TLogic extends BodyPartLogic<BodyPartData> = BodyPartLogic<any>,
> extends SohlItemData<TLogic> {
    abbrev: string;
    canHoldItem: boolean;
    heldItemId: string | null;
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
            BodyPartLogic<BodyPartData> = BodyPartLogic<BodyPartData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements BodyPartData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["BodyPart"];
    static override readonly kind = ITEM_KIND.BODYPART;
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
