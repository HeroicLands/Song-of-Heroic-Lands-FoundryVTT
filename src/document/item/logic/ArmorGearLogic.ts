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

import { GearLogic, GearData } from "@src/document/item/logic/GearLogic";
import { ValueModifier } from "@src/modifier/ValueModifier";
import { ImpactAspects, ITEM_KIND } from "@src/utils/constants";
import type { BodyLocationLogic } from "@src/document/item/logic/BodyLocationLogic";

/**
 * Logic for the **Armor Gear** item type — wearable protective equipment.
 *
 * Armor Gear represents physical armor worn by a character: chainmail, leather
 * jerkins, plate cuirasses, helmets, shields, and similar protective equipment.
 * Each piece of armor covers specific {@link BodyLocationLogic | body locations},
 * categorized as **flexible** or **rigid** coverage.
 *
 * Protection values (`protectionBase`) are stored directly on the armor and applied
 * to matching body locations during the evaluate phase whenever the armor is equipped.
 * Rigid locations additionally set `traits.isRigid` on the body location.
 *
 * The armor's **material** name is pushed into each covered body location's
 * `layersList` for display and rule purposes.
 *
 * @typeParam TData - The ArmorGear data interface.
 */
export class ArmorGearLogic<
    TData extends ArmorGearData = ArmorGearData,
> extends GearLogic<TData> {
    protection!: StrictObject<ValueModifier>;
    traits!: StrictObject<string>;

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.protection = Object.fromEntries(
            ImpactAspects.map((aspect) => {
                const modifier = new ValueModifier({}, { parent: this });
                modifier.setBase(this.data.protectionBase[aspect] || 0);
                return [aspect, modifier];
            }),
        ) as StrictObject<ValueModifier>;
        this.traits = {};
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (!this.data.isEquipped) return;

        const allItems = this.actor?.allItems || [];
        allItems.forEach((bl) => {
            if (bl.type !== ITEM_KIND.BODYLOCATION) return;
            const inFlexible = this.data.locations.flexible.includes(bl.name);
            const inRigid = this.data.locations.rigid.includes(bl.name);
            if (!inFlexible && !inRigid) return;

            const blLogic = bl.logic as BodyLocationLogic;
            ImpactAspects.forEach((aspect) => {
                if (this.protection[aspect].effective) {
                    blLogic.protection[aspect]?.add(
                        this.name,
                        this.name,
                        this.protection[aspect].effective,
                    );
                }
            });

            if (this.data.material) {
                blLogic.layersList.push(this.data.material);
            }
            blLogic.traits.isRigid ||= inRigid;
        });
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface ArmorGearData<
    TLogic extends ArmorGearLogic<ArmorGearData> = ArmorGearLogic<any>,
> extends GearData<TLogic> {
    /** Primary material the armor is made from */
    material: string;
    /** Body locations covered, split by flexible and rigid coverage */
    locations: {
        flexible: string[];
        rigid: string[];
    };
    /** Base damage reduction per impact aspect */
    protectionBase: StrictObject<number>;
    /** Encumbrance value of the armor */
    encumbrance: number;
}
