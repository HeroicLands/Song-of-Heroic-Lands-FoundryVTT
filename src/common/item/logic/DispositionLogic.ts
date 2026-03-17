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

/**
 * Logic for the **Disposition** item type — an attitude or reaction toward
 * another entity.
 *
 * Dispositions record how a character feels about or reacts to another actor
 * (or toward entities in general). Each disposition specifies:
 *
 * - **targetShortcode** — The shortcode of the actor this disposition applies
 *   to, or blank for a general/default disposition
 * - **reaction** — The reaction type (Neutral, Friendly, Hostile, etc.)
 *
 * Dispositions are lightweight relationship records used for NPC behavior,
 * social encounter resolution, and faction relationship tracking.
 *
 * @typeParam TData - The Disposition data interface.
 */
export class DispositionLogic<
    TData extends DispositionData = DispositionData,
> extends SohlItemBaseLogic<TData> {
    override initialize(): void {
        super.initialize();
    }

    override evaluate(): void {
        super.evaluate();
    }

    override finalize(): void {
        super.finalize();
    }
}

export interface DispositionData<
    TLogic extends SohlItemLogic<DispositionData> = SohlItemLogic<any>,
> extends SohlItemData<TLogic> {
    /** Shortcode of the actor this disposition applies to; blank for general */
    targetShortcode: string;
    /** Attitude toward the target (Neutral, Friendly, Hostile, etc.) */
    reaction: string;
}
