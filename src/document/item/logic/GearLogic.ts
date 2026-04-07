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

import { ValueModifier } from "@src/domain/modifier/ValueModifier";
import {
    SohlItemBaseLogic,
    SohlItemData,
} from "@src/document/item/foundry/SohlItem";
import type { SohlActor } from "@src/document/actor/foundry/SohlActor";
import { fvttGetActor } from "@src/core/FoundryHelpers";

/**
 * Abstract base logic for all physical gear items — the foundation for
 * {@link ArmorGearLogic}, {@link WeaponGearLogic}, {@link MiscGearLogic},
 * {@link ContainerGearLogic}, {@link ConcoctionGearLogic}, and
 * {@link ProjectileGearLogic}.
 *
 * Gear items represent tangible objects that a character can carry, equip,
 * buy, sell, or trade. All gear shares these tracked properties:
 *
 * - **weight** — Physical weight, modified by enchantments or materials
 * - **value** — Monetary worth in the campaign's currency
 * - **quality** — Craftsmanship level, affecting durability and effectiveness
 * - **durability** — Current structural integrity; damaged gear may break
 *
 * Gear also tracks inventory state: whether it is **carried** (on the character's
 * person) and whether it is **equipped** (actively worn or wielded, as opposed
 * to stowed in a pack).
 *
 * @typeParam TData - The gear data interface.
 */
export abstract class GearLogic<
    TData extends GearData = GearData,
> extends SohlItemBaseLogic<TData> {
    weight!: ValueModifier;
    value!: ValueModifier;
    quality!: ValueModifier;
    durability!: ValueModifier;
    containedIn!: GearLogic | null;

    /**
     * The Cohort actors this gear item is shared with, resolved from
     * {@link GearData.sharedWithCohortIds}.
     *
     * Populated during {@link initialize} by looking up each cohort ID
     * in the world actor collection.
     *
     * TODO: The Cohort sheet should query all member actors' gear items
     * for entries whose sharedWithCohortIds includes its own actor ID,
     * and display them on a dedicated "Shared Gear" tab. This gives a
     * single-glance view of all equipment owned by the cohort without
     * duplicating item data.
     */
    sharedWithCohorts!: SohlActor[];

    /* --------------------------------------------- */
    /* Common Lifecycle Actions                      */
    /* --------------------------------------------- */

    /** @inheritdoc */
    override initialize(): void {
        super.initialize();
        this.weight = new ValueModifier({}, { parent: this }).setBase(
            this.data.weightBase,
        );
        this.value = new ValueModifier({}, { parent: this }).setBase(
            this.data.valueBase,
        );
        this.quality = new ValueModifier({}, { parent: this }).setBase(
            this.data.qualityBase,
        );
        this.durability = new ValueModifier({}, { parent: this }).setBase(
            this.data.durabilityBase,
        );
        this.containedIn = null;
        this.sharedWithCohorts = (this.data.sharedWithCohortIds ?? [])
            .map((id) => fvttGetActor(id) as SohlActor | null)
            .filter((a): a is SohlActor => a !== null);
    }

    /** @inheritdoc */
    override evaluate(): void {
        super.evaluate();
        if (this.data.containerId && this.actor) {
            this.containedIn =
                this.actor.items.get(this.data.containerId)?.logic ?? null;
        }
    }

    /** @inheritdoc */
    override finalize(): void {
        super.finalize();
    }
}

export interface GearData<
    TLogic extends GearLogic<GearData> = GearLogic<any>,
> extends SohlItemData<TLogic> {
    /** Number of this item in the stack */
    quantity: number;
    /** Base weight of a single unit */
    weightBase: number;
    /** Base monetary value in silver pennies */
    valueBase: number;
    /** Whether this item is on the character's person */
    isCarried: boolean;
    /** Whether this item is actively worn or wielded */
    isEquipped: boolean;
    /** Craftsmanship quality, generally ranging from 8-12 */
    qualityBase: number;
    /** Structural integrity rating */
    durabilityBase: number;
    /** IDs of Cohort actors this gear is shared with */
    sharedWithCohortIds: string[];
    /** The container this item is contained in, if any */
    containerId: string | null;
}
