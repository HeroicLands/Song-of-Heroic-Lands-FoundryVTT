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
import { ValueModifier } from "@common/modifier/ValueModifier";
import { ImpactAspects, ITEM_KIND } from "@utils/constants";
const { BooleanField, StringField } = foundry.data.fields;

export class BodyLocation<TData extends BodyLocation.Data = BodyLocation.Data>
    extends SohlItem.BaseLogic<TData>
    implements BodyLocation.Logic<TData>
{
    protection!: StrictObject<ValueModifier>;
    layersList!: string[];
    traits!: PlainObject;

    get layers(): string {
        return this.layersList.join(", ");
    }

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
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
    override evaluate(context: SohlEventContext): void {
        super.evaluate(context);
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace BodyLocation {
    export const Kind = ITEM_KIND.BODYLOCATION;

    export interface Logic<
        TData extends BodyLocation.Data<any> = BodyLocation.Data<any>,
    > extends SohlItem.Logic<TData> {
        protection: StrictObject<ValueModifier>;
        layersList: string[];
        traits: PlainObject;
        get layers(): string;
    }

    export interface Data<
        TLogic extends BodyLocation.Logic<any> = BodyLocation.Logic<any>,
    > extends SohlItem.Data<TLogic> {
        abbrev: string;
        isFumble: boolean;
        isStumble: boolean;
    }
}

function defineBodyLocationDataSchema(): foundry.data.fields.DataSchema {
    return {
        ...SohlItemDataModel.defineSchema(),
        abbrev: new StringField(),
        isFumble: new BooleanField({ initial: false }),
        isStumble: new BooleanField({ initial: false }),
    };
}

type BodyLocationDataSchema = ReturnType<typeof defineBodyLocationDataSchema>;

export class BodyLocationDataModel<
        TSchema extends foundry.data.fields.DataSchema = BodyLocationDataSchema,
        TLogic extends
            BodyLocation.Logic<BodyLocation.Data> = BodyLocation.Logic<BodyLocation.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements BodyLocation.Data<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["BodyLocation"];
    static override readonly kind = BodyLocation.Kind;
    abbrev!: string;
    isFumble!: boolean;
    isStumble!: boolean;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineBodyLocationDataSchema();
    }
}

export class BodyLocationSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/bodylocation.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
