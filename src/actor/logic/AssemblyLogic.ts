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

import type { SohlItem } from "@src/item/foundry/SohlItem";
import {
    SohlActorBaseLogic,
    SohlActorData,
    SohlActorLogic,
} from "@src/actor/foundry/SohlActor";

/**
 * Logic for the **Assembly** actor type — a hybrid Actor/Item container for
 * complex items with nested item hierarchies.
 *
 * An Assembly exists because Foundry VTT items can only embed within actors.
 * SoHL models item nesting (items within items) using `nestedIn` pointers,
 * but this virtual hierarchy requires all items to be owned by an actor.
 * An Assembly provides that actor — it represents a single conceptual Item
 * that may have nested children, expressed as a complete unit with full
 * nesting structure.
 *
 * An Assembly is a melding of Actor and Item:
 * - **Actor-like:** Can be placed on scenes as tokens, contains embedded
 *   items, has permissions.
 * - **Item-like:** Conceptually represents a single thing. Dropping an
 *   Assembly onto another actor transfers its items (with nesting preserved),
 *   indistinguishable from dropping the items directly.
 *
 * ## Canonical Item Invariant
 *
 * An Assembly must always contain at least one embedded item. Exactly one
 * embedded item must have `nestedIn === null` — this is the **canonical item**,
 * the root item that the Assembly represents. All other items must be nested
 * under it (directly or transitively).
 *
 * The canonical item is derived at runtime via {@link canonicalItem}, not
 * persisted as a schema field.
 *
 * ## Example
 *
 * A "Broadsword" Assembly might contain:
 * - A Broadsword {@link WeaponGearLogic | WeaponGear} item (the canonical item)
 *   - Nested {@link MeleeWeaponStrikeModeLogic | Strike Modes} (Slash, Thrust)
 *   - A nested {@link MysticalDeviceLogic | Mystical Device} (enchantment)
 *     - Nested {@link MysticalAbilityLogic | Mystical Abilities}
 *
 * ## Variant Invariance
 *
 * Assemblies do not vary between rule variants. All logic, data model, and
 * sheet definitions are at the common level — no variant-specific overrides.
 *
 * @typeParam TData - The Assembly data interface.
 */
export class AssemblyLogic<
    TData extends AssemblyData = AssemblyData,
> extends SohlActorBaseLogic<TData> {
    /* --------------------------------------------- */
    /* Canonical Item                                */
    /* --------------------------------------------- */

    /**
     * The canonical item of this Assembly — the single embedded item whose
     * `nestedIn` is `null`. Returns `null` if the Assembly has no items.
     *
     * If the Assembly is in an invalid state (multiple root items), the first
     * root item found is returned and a warning is logged.
     */
    get canonicalItem(): SohlItem | null {
        const actor = this.actor;
        if (!actor || actor.items.size === 0) return null;

        let root: SohlItem | null = null;
        let extraRoots = 0;
        for (const item of actor.items as Iterable<SohlItem>) {
            if ((item.system as any).nestedIn == null) {
                if (!root) {
                    root = item;
                } else {
                    extraRoots++;
                }
            }
        }

        if (extraRoots > 0) {
            console.warn(
                `SoHL | Assembly "${actor.name}" has ${extraRoots + 1} root items — expected exactly 1. Using first root found.`,
            );
        }

        return root;
    }

    /**
     * Whether this Assembly is in a valid state: at least one item exists
     * and exactly one has `nestedIn === null`.
     */
    get isValid(): boolean {
        const actor = this.actor;
        if (!actor || actor.items.size === 0) return false;

        let rootCount = 0;
        for (const item of actor.items as Iterable<SohlItem>) {
            if ((item.system as any).nestedIn == null) {
                rootCount++;
                if (rootCount > 1) return false;
            }
        }
        return rootCount === 1;
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

export interface AssemblyData<
    TLogic extends SohlActorLogic<AssemblyData> = SohlActorLogic<any>,
> extends SohlActorData<TLogic> {}
