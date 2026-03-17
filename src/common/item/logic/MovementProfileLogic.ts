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
    SohlItemLogic,
} from "@common/item/foundry/SohlItem";
import {
    MovementMedium,
} from "@utils/constants";

/**
 * Logic for the **Movement Profile** item type — a mode of movement with
 * terrain-specific rates.
 *
 * Each Movement Profile represents one way an entity can move: walking,
 * running, swimming, flying, burrowing, climbing, etc. A Being or Vehicle
 * may have multiple profiles (e.g., a dragon can walk and fly).
 *
 * Movement is tracked at two scales:
 *
 * - **Tactical movement** (`metersPerRound`) — Short-range, round-by-round
 *   movement used in combat. A single value representing base speed.
 * - **Strategic movement** (`metersPerWatch`) — Long-distance overland travel
 *   measured per watch period. An array of values, one per terrain type,
 *   since different terrains affect travel speed differently.
 *
 * The {@link MovementProfileData.medium | medium} categorizes the movement
 * type (terrestrial, flying, swimming, burrowing, etc.), which determines
 * which terrain factor table applies.
 *
 * A profile can be **disabled** to temporarily prevent that movement mode
 * (e.g., a wing injury disabling flight).
 *
 * @typeParam TData - The MovementProfile data interface.
 */
export class MovementProfileLogic<
    TData extends MovementProfileData = MovementProfileData,
> extends SohlItemBaseLogic<TData> {
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

export interface MovementProfileData<
    TLogic extends SohlItemLogic<MovementProfileData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    /** Type of movement (Terrestrial, Flying, Swimming, etc.) */
    medium: MovementMedium;

    /** Base tactical speed in meters per round */
    metersPerRound: number;

    /** Strategic travel speed in meters per watch by terrain */
    metersPerWatch: number[];

    /** Whether this movement mode is currently unavailable */
    disabled: boolean;
}
