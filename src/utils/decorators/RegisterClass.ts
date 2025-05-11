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

import { AnySohlBaseConstructor, SohlBase } from "@logic/common/core";

/**
 * @summary Marks the version where the schema was last modified.
 *
 * @remarks
 * This decorator is used to register the schema version of a class in the
 * class registry. It is important for tracking changes in the data schema
 * and ensuring compatibility with different versions of the system.
 */

export function RegisterClass(
    name: string,
    schemaVersion: string,
): ClassDecorator {
    if (typeof name !== "string") {
        throw new TypeError("name is required and must be a string");
    }
    if (typeof schemaVersion !== "string") {
        throw new TypeError("schemaVersion is required and must be a string");
    }
    return function (target: Function) {
        const ctor = target as AnySohlBaseConstructor;

        // Register class name and schema version
        const element = sohl.classRegistry.get(ctor.name);
        element.name = name;
        element.schemaVersion = schemaVersion;
        element.ctor = ctor;
        sohl.classRegistry.set(element);

        // Set the metadata on the class constructor
        ctor._metadata.name = name;
        ctor._metadata.schemaVersion = schemaVersion;
    };
}
