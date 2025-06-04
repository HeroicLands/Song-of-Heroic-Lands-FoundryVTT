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

import { SohlMetadata } from "@utils/SohlClassRegistry";

/**
 * @summary Marks the version where the schema was last modified.
 *
 * @remarks
 * This decorator is used to attach metadata to a class.  This metadata can be
 * subsequently saved to a registry.
 */

export function RegisterClass<T extends SohlMetadata = SohlMetadata>(
    metadata: T,
): ClassDecorator {
    return function <TFunction extends Function>(target: TFunction): void {
        metadata.ctor = target as unknown as AnyConstructor;
        Object.defineProperty(target, "_metadata", {
            value: metadata,
            enumerable: false,
            writable: false,
        });
    };
}
