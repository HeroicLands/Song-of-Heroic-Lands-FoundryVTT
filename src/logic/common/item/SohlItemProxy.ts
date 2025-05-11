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

import { SohlActorProxy } from "@logic/common/actor";

export interface SohlItemProxy<T = any> {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly actor: SohlActorProxy;
    readonly system: unknown;
    readonly nestedIn: SohlItemProxy | null;

    update(
        data: PlainObject | PlainObject[],
        options?: PlainObject,
    ): Promise<T | T[]>;
    delete(context?: PlainObject): Promise<T>;
}
