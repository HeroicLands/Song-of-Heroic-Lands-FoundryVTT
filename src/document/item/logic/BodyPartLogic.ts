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
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
} from "@src/document/item/foundry/SohlItem";

/**
 * Logic for the **Body Part** item type — a concrete anatomical part of a Being.
 *
 * Body Parts represent major anatomical components such as arms, legs, the head,
 * or the torso. They serve as an intermediate grouping between
 * {@link BodyZoneLogic | Body Zones} (broad regions) and
 * {@link BodyLocationLogic | Body Locations} (specific hit locations).
 *
 * A Body Part can optionally **hold an item** (e.g., a hand holding a weapon
 * or shield), tracked via `canHoldItem` and `heldItemId`. This models the
 * concept of hand slots and wielded equipment.
 *
 * @typeParam TData - The BodyPart data interface.
 */
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
    override initialize(): void {
        super.initialize();
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

export interface BodyPartData<
    TLogic extends BodyPartLogic<BodyPartData> = BodyPartLogic<any>,
> extends SohlItemData<TLogic> {
    /** Whether this body part can grasp and wield items */
    canHoldItem: boolean;
    /** ID of the item currently held by this body part, or null */
    heldItemId: string | null;
}
