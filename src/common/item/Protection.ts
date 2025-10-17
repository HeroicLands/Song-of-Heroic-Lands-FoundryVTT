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
import type { ArmorGear } from "@common/item/ArmorGear";
import type { BodyLocation } from "./BodyLocation";
import {
    SohlItem,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    IMPACT_ASPECT,
    ImpactAspects,
    ITEM_KIND,
    Variant,
    Variants,
} from "@utils/constants";
import { ValueModifier } from "@common/modifier/ValueModifier";

const { StringField, SchemaField, NumberField } = foundry.data.fields;

export class Protection<TData extends Protection.Data = Protection.Data>
    extends SohlItem.BaseLogic<TData>
    implements Protection.Logic<TData>
{
    bodyLocations!: SohlItem[];
    protection!: StrictObject<ValueModifier>;

    /** @inheritdoc */
    override initialize(context: SohlEventContext): void {
        super.initialize(context);
        this.bodyLocations = [];
        this.protection = Object.fromEntries(
            ImpactAspects.map((aspect) => {
                const modifier = new sohl.ValueModifier({}, { parent: this });
                modifier.setBase(this.data.protectionBase[aspect] || 0);
                return [aspect, modifier];
            }),
        ) as StrictObject<ValueModifier>;
    }

    /** @inheritdoc */
    override evaluate(context: SohlEventContext): void {
        if (!this.item.nestedIn || this.data.subType !== sohl.id) return;
        super.evaluate(context);
        const armorGear = this.nestedIn as unknown as SohlItem;
        const armorGearData = armorGear!.system as ArmorGear.Data;

        if (
            armorGear.type === ITEM_KIND.ARMORGEAR &&
            armorGearData.isEquipped
        ) {
            this.bodyLocations =
                this.actor?.allItems.filter(
                    (i) =>
                        (armorGear.type === ITEM_KIND.BODYLOCATION &&
                            armorGearData.locations.flexible.includes(
                                i.name,
                            )) ||
                        armorGearData.locations.rigid.includes(i.name),
                ) || [];
        } else if (this.item.nestedIn.type === ITEM_KIND.BODYLOCATION) {
            this.bodyLocations.push(this.item.nestedIn);
        }

        this.bodyLocations.forEach((bl) => {
            const blLogic = bl.logic as BodyLocation.Logic;
            ImpactAspects.forEach((aspect) => {
                if (this.protection[aspect].effective)
                    blLogic.protection[aspect]?.add(
                        this.name,
                        this.name,
                        this.protection[aspect].effective,
                    );
            });

            if (armorGearData) {
                // if a material has been specified, add it to the layers
                if (armorGearData.material) {
                    blLogic.layersList.push(armorGearData.material);
                }

                // If any of the armor is rigid, then flag the whole bodylocation as rigid.
                blLogic.traits.isRigid ||=
                    armorGearData.locations.rigid.includes(bl.name);
            }
        });
    }

    /** @inheritdoc */
    override finalize(context: SohlEventContext): void {
        super.finalize(context);
    }
}

export namespace Protection {
    export const Kind = ITEM_KIND.PROTECTION;

    export interface Logic<
        TData extends Protection.Data<any> = Protection.Data<any>,
    > extends SohlItem.Logic<TData> {
        bodyLocations: SohlItem[];
        protection: StrictObject<ValueModifier>;
    }

    export interface Data<
        TLogic extends Protection.Logic<Data> = Protection.Logic<any>,
    > extends SohlItem.Data<TLogic> {
        subType: Variant;
        protectionBase: StrictObject<number>;
    }
}

function defineProtectionDataSchema(): foundry.data.fields.DataSchema {
    const protectionObj = Object.fromEntries(
        ImpactAspects.map((aspect) => {
            const prot = new NumberField({
                integer: true,
                initial: 0,
                min: 0,
            });
            return [aspect, prot];
        }),
    ) as foundry.data.fields.DataSchema;

    return {
        ...SohlItemDataModel.defineSchema(),
        subType: new StringField({
            choices: Variants,
            required: true,
        }),
        protectionBase: new SchemaField({
            ...protectionObj,
        }),
    };
}

type ProtectionDataSchema = ReturnType<typeof defineProtectionDataSchema>;

export class ProtectionDataModel<
        TSchema extends foundry.data.fields.DataSchema = ProtectionDataSchema,
        TLogic extends
            Protection.Logic<Protection.Data> = Protection.Logic<Protection.Data>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements Protection.Data<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["Protection"];
    static override readonly kind = Protection.Kind;
    subType!: Variant;
    protectionBase!: StrictObject<number>;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineProtectionDataSchema();
    }
}

export class ProtectionSheet extends SohlItemSheetBase {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            template: "systems/sohl/templates/item/affiliation.hbs",
        },
    };

    override async _preparePropertiesContext(
        context: PlainObject,
        options: PlainObject,
    ): Promise<PlainObject> {
        return context;
    }
}
