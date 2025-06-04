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

import { SohlBase } from "@common";

/**
 * @summary Class metadata for a registered class.
 *
 * @description
 * The `SohlMetadata` interface defines the structure of metadata associated with a class
 * registered in the SoHL class registry.
 *
 * @remarks
 * This metadata is stored in the central class registry as well as on the class itself.
 * Objects should normally access the metadata stored locally, but the class registry
 * is used to access the metadata of classes that are not loaded yet.
 *
 * Much of the information in this metadata is used for serialization and deserialization,
 * as well as identification of the class. This information may not survive compilation,
 * minification, and bundling, so it is important to store the information in the metadata
 * so it is available at runtime.
 */

export class SohlClassRegistry {
    private static instance: SohlClassRegistry;
    private classRegistry: Map<string, SohlClassRegistry.Element> = new Map();

    private constructor() {}

    static getInstance(): SohlClassRegistry {
        if (!SohlClassRegistry.instance) {
            SohlClassRegistry.instance = new SohlClassRegistry();
        }
        return SohlClassRegistry.instance;
    }

    get(name: string): SohlClassRegistry.Element | undefined {
        return this.classRegistry.get(name);
    }

    set(data: SohlClassRegistry.Metadata): void {
        if (!data.kind) {
            throw new Error("Class metadata must have a kind.");
        }
        this.classRegistry.set(data.kind, data);
    }

    has(name: string): boolean {
        return this.classRegistry.has(name);
    }

    create<T extends SohlBase.Any>(
        name: string,
        data: PlainObject = {},
        options: PlainObject = {},
    ): InstanceType<T> {
        const cls = this.get(name)?.ctor as T;
        if (cls) {
            return new cls(data, options) as InstanceType<T>;
        }
        throw new Error(`Class ${name} not found in registry.`);
    }
}

export namespace SohlClassRegistry {
    export interface Metadata {
        kind: string;
        ctor?: AnyConstructor;
    }

    /**
     * @summary Class registry element for a registered class.
     */
    export class Element implements Metadata {
        kind: string;
        ctor?: AnyConstructor;

        constructor(kind: string, ctor?: AnyConstructor) {
            if (!kind || typeof kind !== "string") {
                throw new TypeError(
                    "kind is required and must be a non-blank string",
                );
            }
            this.kind = kind;
            this.ctor = ctor;
        }
    }
}

export const classRegistry = SohlClassRegistry.getInstance();
