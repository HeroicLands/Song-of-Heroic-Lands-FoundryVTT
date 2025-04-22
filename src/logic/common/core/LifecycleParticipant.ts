/*
 * This file is part of the Song of Heroic Lands (SoHL) system for Foundry VTT.
 * Copyright (c) 2024-2025 Tom Rodriguez ("Toasty") — <toasty@heroiclands.com>
 *
 * This work is licensed under the GNU General Public License v3.0 (GPLv3).
 * You may copy, modify, and distribute it under the terms of that license.
 *
 * For full terms, see the LICENSE.md file in the project root or visit:
 * https://www.gnu.org/licenses/gpl-3.0.html
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ActionContext } from "@foundry/core/ActionContext.mjs";
import { SohlBase } from "@logic/common/core";

/**
 * Defines the lifecycle contract for all core data processors, including SohlEntity and SohlLogic instances.
 *
 * LifecycleParticipant ensures that each participating object follows a consistent, multi-phase lifecycle:
 *
 * 1. **initialize()** – Set up base/default state. No assumptions should be made about effects or sibling logic.
 * 2. **applyEffects()** – Apply all effects that modify internal state (e.g., bonuses, penalties, conditions).
 * 3. **evaluate()** – Execute the core business logic for this object, potentially accessing sibling logic state.
 * 4. **finalize()** – Final pass to compute derived values, clean up, and prepare for use.
 */
export abstract class LifecycleParticipant extends SohlBase {
    /**
     * Initializes base state for this participant.
     * Should not rely on sibling or external logic state.
     */
    initialize(options: PlainObject = {}): void {}

    /**
     * Applies effects to modify internal state.
     */
    applyEffects(options: PlainObject = {}): void {}

    /**
     * Evaluates business logic using current and sibling state.
     */
    evaluate(options: PlainObject = {}): void {}

    /**
     * Final stage of lifecycle — compute derived values, cleanup, etc.
     */
    finalize(options: PlainObject = {}): void {}
}
