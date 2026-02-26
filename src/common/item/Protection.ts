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
import type { ArmorGearData } from "@common/item/ArmorGear";
import type { BodyLocationLogic } from "@common/item/BodyLocation";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
    SohlItemDataModel,
    SohlItemSheetBase,
} from "@common/item/SohlItem";
import {
    ImpactAspects,
    ITEM_KIND,
    ITEM_METADATA,
    Variant,
    Variants,
} from "@utils/constants";
import { ValueModifier } from "@common/modifier/ValueModifier";

const { StringField, SchemaField, NumberField } = foundry.data.fields;

export class ProtectionLogic<
    TData extends ProtectionData = ProtectionData,
> extends SohlItemBaseLogic<TData> {
    bodyLocations!: SohlItem[];
    protection!: StrictObject<ValueModifier>;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(context: SohlActionContext): void {
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
    override evaluate(context: SohlActionContext): void {
        if (!this.item.nestedIn || this.data.subType !== sohl.id) return;
        super.evaluate(context);
        const armorGear = this.nestedIn as unknown as SohlItem;
        const armorGearData = armorGear!.system as ArmorGearData;

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
            const blLogic = bl.logic as BodyLocationLogic;
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
    override finalize(context: SohlActionContext): void {
        super.finalize(context);
    }
}

export interface ProtectionData<
    TLogic extends ProtectionLogic<ProtectionData> = ProtectionLogic<any>,
> extends SohlItemData<TLogic> {
    subType: Variant;
    protectionBase: StrictObject<number>;
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
            ProtectionLogic<ProtectionData> = ProtectionLogic<ProtectionData>,
    >
    extends SohlItemDataModel<TSchema, TLogic>
    implements ProtectionData<TLogic>
{
    static override readonly LOCALIZATION_PREFIXES = ["SOHL.Protection.DATA"];
    static override readonly kind = ITEM_KIND.PROTECTION;
    subType!: Variant;
    protectionBase!: StrictObject<number>;

    static override defineSchema(): foundry.data.fields.DataSchema {
        return defineProtectionDataSchema();
    }
}

export class ProtectionSheet extends SohlItemSheetBase {
    protected async _preparePropertiesContext(
        context: foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>,
        options: foundry.applications.api.DocumentSheetV2.RenderOptions,
    ): Promise<
        foundry.applications.api.DocumentSheetV2.RenderContext<SohlItem>
    > {
        return context;
    }
}
