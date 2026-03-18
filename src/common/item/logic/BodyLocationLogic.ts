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

import {
    SohlItemBaseLogic,
    SohlItemData,
} from "@common/item/foundry/SohlItem";
import { ValueModifier } from "@common/modifier/ValueModifier";
import { ImpactAspects } from "@utils/constants";

/**
 * Logic for the **Body Location** item type — a specific anatomical hit location.
 *
 * Body Locations are the finest-grained elements of the anatomy model. Each
 * represents a specific area that can be struck in combat (e.g., Skull, Thorax,
 * Left Forearm, Right Thigh). Body Locations are grouped under
 * {@link BodyPartLogic | Body Parts}, which in turn belong to
 * {@link BodyZoneLogic | Body Zones}.
 *
 * Each Body Location accumulates **protection** values per {@link ImpactAspect}
 * (Blunt, Pierce, Cut, Heat, Cold) from equipped armor and natural defenses.
 * These are tracked as {@link ValueModifier | ValueModifiers} so that each
 * contributing layer can be audited.
 *
 * Body Locations also track:
 * - **layersList** — names of armor layers currently covering this location
 * - **traits** — flags such as `isRigid` (indicating rigid armor coverage)
 * - **isFumble** / **isStumble** — whether hits to this location trigger
 *   fumble or stumble checks
 *
 * Protection items apply their modifiers to Body Locations during the
 * evaluate phase.
 *
 * @typeParam TData - The BodyLocation data interface.
 */
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
    override initialize(): void {
        super.initialize();
        this.protection = Object.fromEntries(
            ImpactAspects.map((aspect) => {
                const modifier = new sohl.modifier.Value({}, { parent: this });
                return [aspect, modifier];
            }),
        ) as StrictObject<ValueModifier>;
        this.layersList = [];
        this.traits = {
            isRigid: false,
        };
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface BodyLocationData<
    TLogic extends BodyLocationLogic<any> = BodyLocationLogic<any>,
> extends SohlItemData<TLogic> {
    shortcode: string;
    /** Whether hits to this location trigger fumble checks */
    isFumble: boolean;
    /** Whether hits to this location trigger stumble checks */
    isStumble: boolean;
}
