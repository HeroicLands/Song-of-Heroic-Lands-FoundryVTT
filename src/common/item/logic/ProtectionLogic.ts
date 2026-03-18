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

import type { ArmorGearData } from "@src/common/item/logic/ArmorGearLogic";
import type { BodyLocationLogic } from "@src/common/item/logic/BodyLocationLogic";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
} from "@src/common/item/foundry/SohlItem";
import { ImpactAspects, ITEM_KIND, Variant } from "@src/utils/constants";
import { ValueModifier } from "@src/common/modifier/ValueModifier";

/**
 * Logic for the **Protection** item type — a source of defensive value
 * against physical damage.
 *
 * Protections represent armor ratings, barriers, wards, natural hide, or any
 * other source of damage reduction. They are typically **nested inside**
 * {@link ArmorGearLogic | Armor Gear} items, but can also be attached directly
 * to a Being (for natural armor) or to Structures and Vehicles.
 *
 * Each Protection provides damage reduction values per {@link ImpactAspect}
 * (Blunt, Pierce, Cut, Heat, Cold), tracked as {@link ValueModifier | ValueModifiers}
 * so that enchantments, damage, and other effects can be audited.
 *
 * During the evaluate phase, Protection resolves which {@link BodyLocationLogic | body locations}
 * it covers and applies its protection modifiers to each. When nested inside
 * equipped Armor Gear, it automatically determines applicable locations from
 * the armor's location lists and marks rigid armor layers.
 *
 * @typeParam TData - The Protection data interface.
 */
export class ProtectionLogic<
    TData extends ProtectionData = ProtectionData,
> extends SohlItemBaseLogic<TData> {
    bodyLocations!: SohlItem[];
    protection!: StrictObject<ValueModifier>;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.bodyLocations = [];
        this.protection = Object.fromEntries(
            ImpactAspects.map((aspect) => {
                const modifier = new sohl.modifier.Value({}, { parent: this });
                modifier.setBase(this.data.protectionBase[aspect] || 0);
                return [aspect, modifier];
            }),
        ) as StrictObject<ValueModifier>;
    }

    /** @inheritdoc */
    override evaluate(): void {
        if (!this.item.nestedIn || this.data.subType !== sohl.id) return;
        super.evaluate();
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
    override finalize(): void {
        super.finalize();
    }
}

export interface ProtectionData<
    TLogic extends ProtectionLogic<ProtectionData> = ProtectionLogic<any>,
> extends SohlItemData<TLogic> {
    /** Rules variant this protection belongs to */
    subType: Variant;
    /** Base damage reduction values keyed by impact aspect */
    protectionBase: StrictObject<number>;
}
