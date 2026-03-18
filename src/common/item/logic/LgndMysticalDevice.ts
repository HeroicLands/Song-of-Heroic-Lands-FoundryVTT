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
    MysticalDeviceData,
    MysticalDeviceLogic,
} from "@src/common/item/logic/MysticalDeviceLogic";
import { MysticalDeviceSheet } from "@src/common/item/foundry/MysticalDeviceSheet";
import { SohlActionContext } from "@src/common/core/SohlActionContext";

export class LgndMysticalDeviceLogic extends MysticalDeviceLogic<MysticalDeviceData> {
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

export class LgndMysticalDeviceSheet extends MysticalDeviceSheet {
    static override PARTS = {
        ...super.PARTS,
        properties: {
            container: { classes: ["tab-body"], id: "tabs" },
            template:
                "systems/sohl/templates/item/legendary/mysticaldevice-properties.hbs",
            scrollable: [""],
        },
    };
}
