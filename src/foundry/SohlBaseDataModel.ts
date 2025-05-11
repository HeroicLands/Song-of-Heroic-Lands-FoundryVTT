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

import { SohlPerformer } from "@logic/common/core";

const { ArrayField, ObjectField } = (foundry.data as any).fields;

export abstract class SohlBaseDataModel extends foundry.documents
    .TypeDataModel {
    declare parent: foundry.abstract.Document;
    actionList!: PlainObject[];
    eventList!: PlainObject[];

    /** @override */
    static defineSchema() {
        return {
            actionList: new ArrayField(new ObjectField()),
            eventList: new ArrayField(new ObjectField()),
        };
    }

    static get sheet(): string {
        throw new Error("Must be implemented by subclass");
    }

    get sheet(): string {
        return (this.constructor as typeof SohlBaseDataModel).sheet;
    }

    abstract get logic(): SohlPerformer;
}
