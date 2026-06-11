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
import { SohlLogic, SohlLogicData } from "@src/core/SohlLogic";
import type { HTMLString } from "@src/utils/helpers";

/**
 * The Foundry-free foundation of the item logic layer.
 *
 * This module owns the contracts between item logic classes and the
 * Foundry-side data models: the {@link SohlItemLogic} and
 * {@link SohlItemData} interfaces and the {@link SohlItemBaseLogic} base
 * class. The Foundry layer (`foundry/SohlItem.ts`) implements
 * {@link SohlItemData} via `SohlItemDataModel` and re-exports these symbols;
 * logic classes import them from here so they remain loadable without
 * Foundry globals. References to the {@link SohlItem} document type are
 * type-only and erased at compile time.
 */

/**
 * Logic interface implemented by all item logic classes — {@link SohlLogic}
 * specialized for {@link SohlItem} data.
 */
export interface SohlItemLogic<
    TData extends SohlLogicData<SohlItem>,
> extends SohlLogic<TData> {}

/**
 * @remarks The base shape of `system` on every SoHL item; each concrete item type's `*Data` extends it.
 */
export interface SohlItemData<
    TLogic extends SohlLogic<any> = SohlLogic<any>,
> extends SohlLogicData<SohlItem, TLogic> {
    /** The owning {@link SohlItem}. */
    get item(): SohlItem;
    /**
     * The item's display label; with `withName`, includes the item's name, and
     * with `withSubType`, includes its sub-type.
     */
    label(options?: { withName: boolean; withSubType: boolean }): string;
    /** Rich-text GM/player notes for the item. */
    notes: HTMLString;
    /** Rich-text description shown on the item's sheet and chat cards. */
    docHtml: HTMLString;
}

/**
 * Base logic class for all item types.
 *
 * Provides the minimal lifecycle implementation (no-op {@link initialize},
 * {@link evaluate}, and {@link finalize}) that all item logic classes inherit
 * from. Concrete item classes extend this to implement type-specific rules,
 * modifiers, and calculations.
 *
 * @typeParam TData - The item data interface, extending {@link SohlItemData}.
 */
export class SohlItemBaseLogic<
    TData extends SohlItemData = SohlItemData,
> extends SohlLogic<TData> {
    /** @inheritDoc */
    override initialize(): void {}
    /** @inheritDoc */
    override evaluate(): void {}
    /** @inheritDoc */
    override finalize(): void {}
}
