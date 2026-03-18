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
} from "@src/document/item/foundry/SohlItem";

/**
 * Logic for the **Mystical Device** item type — a magical object that grants
 * or channels mystical abilities.
 *
 * Mystical Devices represent enchanted items: wands, staves, amulets, rings,
 * spell scrolls, runestones, and similar artifacts that enable supernatural
 * effects. A device may contain nested {@link MysticalAbilityLogic | Mystical Abilities}
 * representing the powers it grants to its wielder.
 *
 * Key properties:
 * - **requiresAttunement** — Whether the device must be attuned before use
 * - **isAttuned** — Current attunement state
 * - **usesVolition** — Whether the device has its own will/personality
 * - **volition** — If willful: the device's ego, morality alignment, and purpose
 * - **domain** — The philosophy and domain the device is associated with
 *
 * Devices with volition may resist their wielder or act independently,
 * creating interesting roleplay dynamics.
 *
 * @typeParam TData - The MysticalDevice data interface.
 */
export class MysticalDeviceLogic<
    TData extends MysticalDeviceData = MysticalDeviceData,
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

export interface MysticalDeviceData<
    TLogic extends MysticalDeviceLogic<MysticalDeviceData> =
        MysticalDeviceLogic<any>,
> extends SohlItemData<TLogic> {
    /** Whether the device must be attuned before use */
    requiresAttunement: boolean;
    /** Whether the device has its own will and personality */
    usesVolition: boolean;
    /** Mystical domain association (philosophy and domain name) */
    domain: {
        philosophy: string;
        name: string;
    };
    /** Whether the wielder has attuned to this device */
    isAttuned: boolean;
    /** The device's willpower: ego strength, morality, and purpose */
    volition: {
        ego: number;
        morality: number;
        purpose: string;
    };
}
