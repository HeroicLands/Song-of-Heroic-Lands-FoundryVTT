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

import { SohlLogic } from "../../logic/common/core/SohlLogic.js";
const ObjectField = foundry.data.fields.ObjectField;

/**
 * The `SohlItemDataModel` class extends the Foundry VTT `TypeDataModel` to provide
 * a structured data model for items in the "Song of Heroic Lands" module. It
 * encapsulates logic and behavior associated with items, offering a schema
 * definition and initialization logic.
 */
export class SohlItemDataModel extends foundry.abstract.TypeDataModel {
    /**
     * Represents the embedded logic associated with the item.
     * @type {SohlLogic}
     */
    _logic;

    /** @inheritdoc */
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            logicData: new ObjectField(),
        });
    }

    get logic() {
        if (!this._logic) {
            this._logic = sohl.registeredClassFactory(this, this.logicData);
        }
        return this._logic;
    }

    set logic(logic) {
        this._logic = logic;
        this.updateSource(logic.toJSON());
    }

    get item() {
        return super.parent;
    }

    get propertyPath() {
        return "system.logicData";
    }
    /** @inheritdoc */
    prepareBaseData() {
        super.prepareBaseData();
        this.logic.createVirtualLogics();
        this.logic.prepareBaseData();
    }

    /** @inheritdoc */
    prepareDerivedData() {
        super.prepareDerivedData();
        this.logic.processEffects();
        this.logic.processActions();
        this.logic.processSiblings();
        this.logic.postProcess();
    }
}
