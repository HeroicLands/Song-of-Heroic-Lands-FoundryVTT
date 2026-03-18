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

import type { SohlActionContext } from "@src/common/core/SohlActionContext";
import {
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorLogic,
} from "@src/common/actor/foundry/SohlActor";

/**
 * Logic for the **Vehicle** actor type — a movable inanimate conveyance.
 *
 * A Vehicle represents a wagon, ship, cart, or any mobile platform that can
 * hold both **occupants** and embedded **items** (cargo, equipment, etc.).
 * Vehicles are not Beings — they have no anatomy, skills, or traits.
 *
 * Occupants are tracked as an array of actor shortcodes. Each shortcode may
 * reference either a **Being** (a single individual) or a **Cohort** (which
 * is shorthand for all of that Cohort's members being occupants).
 *
 * Vehicles can own Protection items (hull armor, reinforced sides), Injuries
 * (structural damage), Container Gear (cargo holds), and Actions. They are
 * often composed into an {@link AssemblyLogic | Assembly} alongside crew
 * Cohorts and mounted weapon Structures.
 *
 * @typeParam TData - The Vehicle data interface.
 */
export class VehicleLogic<
    TData extends VehicleData = VehicleData,
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

export interface VehicleData<
    TLogic extends SohlActorLogic<VehicleData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {
    /**
     * Shortcodes of actors occupying this vehicle.
     * Each entry may reference a Being (individual) or a Cohort
     * (shorthand for all of that Cohort's members).
     */
    occupants: string[];
}
