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
    SohlActorData,
    SohlActorLogic,
} from "@src/document/actor/foundry/SohlActor";

/**
 * Logic for the **Assembly** actor type — a hybrid Actor/Item container for
 * complex items.
 *
 * An assembly is a group of related items that are treated as a single unit.
 * It is generally used to group physical items, such as a suit of armor
 * composed of multiple pieces that together form a single functional unit.
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

export interface AssemblyData<
    TLogic extends SohlActorLogic<AssemblyData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}
