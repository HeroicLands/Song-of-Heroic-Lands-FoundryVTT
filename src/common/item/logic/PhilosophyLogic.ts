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

/**
 * Logic for the **Philosophy** item type — a belief system, doctrine, or ethos.
 *
 * Philosophies represent organized systems of belief: religions, arcane
 * traditions, druidic orders, shamanic practices, or secular philosophies.
 * They serve as the top-level organizational container for the mystical
 * system, grouping related {@link DomainLogic | Domains} together.
 *
 * A character's Philosophy determines which Domains they can access, which
 * in turn governs their available {@link MysticalAbilityLogic | Mystical Abilities}
 * and {@link MysteryLogic | Mysteries}.
 *
 * Philosophy is a pure reference item with no custom logic or calculations.
 * Domains link back to their Philosophy via a shortcode reference.
 *
 * @typeParam TData - The Philosophy data interface.
 */
export class PhilosophyLogic<TData extends PhilosophyData = PhilosophyData>
    extends SohlItemBaseLogic<TData>
    implements PhilosophyLogic<TData>
{
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

export interface PhilosophyData<
    TLogic extends PhilosophyLogic<PhilosophyData> = PhilosophyLogic<any>,
> extends SohlItemData<TLogic> {}
