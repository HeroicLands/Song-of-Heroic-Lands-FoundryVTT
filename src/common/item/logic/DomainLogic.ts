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

import { DomainSubType } from "@src/utils/constants";
import {
    SohlItem,
    SohlItemBaseLogic,
    SohlItemData,
} from "@src/common/item/foundry/SohlItem";
import { PhilosophyLogic } from "@src/common/item/logic/PhilosophyLogic";

/**
 * Logic for the **Domain** item type — a sphere of mystical authority or influence.
 *
 * Domains represent areas of supernatural expertise: schools of arcane magic,
 * spiritual traditions, divine portfolios, or other mystical specializations.
 * Each domain is categorized by {@link DomainData.subType | subType} (Arcane,
 * Spiritual, etc.) and linked to a {@link PhilosophyLogic | Philosophy} via
 * the `philosophyCode` shortcode.
 *
 * During the evaluate phase, the Domain resolves its Philosophy reference
 * from the owning actor's items, making the philosophy available for other
 * calculations (e.g., {@link MysticalAbilityLogic | Mystical Abilities} that
 * reference this domain).
 *
 * Domains are foundational to the mystical system: they connect Philosophies
 * to Mystical Abilities and Mysteries, forming the organizational structure
 * of a character's supernatural capabilities.
 *
 * @typeParam TData - The Domain data interface.
 */
export class DomainLogic<TData extends DomainData = DomainData>
    extends SohlItemBaseLogic<TData>
    implements DomainLogic<TData>
{
    philosophy?: PhilosophyLogic;

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
        let item: SohlItem = this.item.actor?.allItemTypes.philosophy.find(
            (p: SohlItem) =>
                (p as any).system.shortcode === this.data.philosophyCode,
        ) as SohlItem;
        this.philosophy = item?.logic as PhilosophyLogic;
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface DomainData<
    TLogic extends DomainLogic<any> = DomainLogic<any>,
> extends SohlItemData<TLogic> {
    /** Domain category (Arcane, Divine, Spiritual, etc.) */
    subType: DomainSubType;
    /** Shortcode of the philosophy this domain belongs to */
    philosophyCode: string;
}
