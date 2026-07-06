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

import type { SohlItem } from "@src/document/item/foundry/SohlItem";
import {
    SohlActorBaseLogic,
    type SohlActorData,
    type SohlActorLogic,
} from "@src/document/actor/logic/SohlActorBaseLogic";

/**
 * An **Assembly** is an Actor-document container that groups related items so they
 * can be moved as a unit. It uses an Actor (not an Item) so Foundry's embedded-
 * document system can host the items — and so it can be placed on scenes as a
 * token, carry permissions, and be drag-and-dropped like any actor.
 *
 * It is both **actor-like** (a token with embedded items and permissions) and
 * **container-like** (a set of items transferred as a group to another actor).
 *
 * **Drop behavior:** dropping an Assembly onto another actor (e.g. a Being) unpacks
 * its items onto the target — the result is identical to having added each item
 * individually. A "Full Plate Armor" assembly might group the Cuirass, Helm,
 * Gauntlets, and Greaves (ArmorGear items); a "Treasure Chest" might group a
 * ContainerGear with MiscGear (coins, rope) and ConcoctionGear (potions).
 *
 * The type follows SoHL's three-class split: this Logic holds the behavior;
 * {@link AssemblyData} (backed by `AssemblyDataModel`) adds no fields beyond
 * {@link SohlActorData}; `AssemblySheet` is the UI.
 *
 * @typeParam TData - The Assembly data interface.
 */
export class AssemblyLogic<
    TData extends AssemblyData = AssemblyData,
> extends SohlActorBaseLogic<TData> {
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

/**
 * Persisted data model for an {@link AssemblyLogic | Assembly} actor. Carries
 * no fields of its own beyond the common {@link SohlActorData} base.
 *
 * @typeParam TLogic - The logic class bound to this data.
 * @remarks The shape of `system` on a `assembly` actor — i.e. `actor.system` (equivalently `actor.logic.data`) when `actor.type === "assembly"`. The backing DataModel implements this interface.
 */
export interface AssemblyData<
    TLogic extends SohlActorLogic<AssemblyData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}
